/**
 * AppResumeManager - Unified App Resume Handler
 *
 * C14 FIX: Consolidates 4 overlapping resume systems into 1 deterministic manager.
 *
 * BEFORE: 4 independent AppState listeners racing each other:
 *   1. useAppResume (cache + WS recovery, 5min threshold)
 *   2. useGlobalAppResume (stuck state timer + force refresh)
 *   3. connectionHealthMonitor (60s health checks + 3-strike recovery)
 *   4. AuthContext (session + profile refresh, 60s threshold) — KEPT SEPARATE
 *
 * AFTER: 1 unified manager with deterministic sequence:
 *   Session refresh → Loading reset → Cache clear → WS reconnect → Health resume
 *
 * What this manager handles:
 * - Single AppState listener for resume detection
 * - Deterministic operation sequence on resume
 * - Stuck-state detection timer (15s interval)
 * - Coordination with connectionHealthMonitor (pause/resume)
 * - Session refresh with cooldown to prevent races with AuthContext
 *
 * What this manager does NOT handle:
 * - Auth profile/quota refresh (stays in AuthContext)
 * - paperTradeService lifecycle (has its own AppState listener)
 * - Offline affiliate sync (stays in AppNavigator — minimal)
 * - Feature-specific AppState listeners (presence, biometric, etc.)
 */

import { AppState, DeviceEventEmitter } from 'react-native';
import { supabase } from './supabase';
import { wsPool } from './scanner/webSocketPoolService';
import { patternCache } from './scanner/patternCacheService';
import { binanceService } from './binanceService';
import {
  resetAllLoadingStates,
  resetStuckLoadingStates,
  clearAllStaleCaches,
  FORCE_REFRESH_EVENT,
} from '../utils/loadingStateManager';

// Thresholds
const STALE_THRESHOLD = 60 * 1000;        // 1 minute — data considered stale
const SESSION_COOLDOWN = 10 * 1000;        // 10s — prevents double session refresh with AuthContext
const STUCK_CHECK_INTERVAL = 15 * 1000;    // 15s — check for stuck loading states
const STUCK_THRESHOLD = 15 * 1000;         // 15s — only reset states stuck longer than this
const HEALTH_CHECK_INTERVAL = 60 * 1000;   // 60s — periodic health checks

class AppResumeManager {
  constructor() {
    this._appStateSubscription = null;
    this._stuckTimerId = null;
    this._healthTimerId = null;
    this._healthInitialTimeout = null;
    this._isRunning = false;
    this._appState = AppState.currentState;
    this._backgroundTimestamp = null;
    this._lastSessionRefresh = 0;
    this._consecutiveHealthFailures = 0;
    this._resumeCallbacks = new Set();
  }

  /**
   * Start the manager — call once from AppNavigator
   */
  start() {
    if (this._isRunning) return;
    this._isRunning = true;

    console.log('[AppResumeManager] Starting unified resume manager');

    // 1. Single AppState listener
    this._appStateSubscription = AppState.addEventListener('change', this._handleAppStateChange);

    // 2. Stuck-state detection timer (runs while active)
    this._stuckTimerId = setInterval(() => {
      if (this._appState === 'active') {
        const resetCount = resetStuckLoadingStates(STUCK_THRESHOLD);
        if (resetCount > 0) {
          console.log(`[AppResumeManager] Reset ${resetCount} stuck loading states (>15s)`);
        }
      }
    }, STUCK_CHECK_INTERVAL);

    // 3. Health check timer (replaces connectionHealthMonitor's interval)
    this._healthInitialTimeout = setTimeout(() => {
      this._healthInitialTimeout = null;
      if (this._isRunning) this._runHealthCheck();
    }, 10000); // Initial delay 10s

    this._healthTimerId = setInterval(() => {
      if (this._appState === 'active') {
        this._runHealthCheck();
      }
    }, HEALTH_CHECK_INTERVAL);

    console.log('[AppResumeManager] Started: stuck-check=15s, health-check=60s');
  }

  /**
   * Stop the manager — call on logout/cleanup
   */
  stop() {
    this._isRunning = false;

    if (this._appStateSubscription) {
      this._appStateSubscription.remove();
      this._appStateSubscription = null;
    }

    if (this._stuckTimerId) {
      clearInterval(this._stuckTimerId);
      this._stuckTimerId = null;
    }

    if (this._healthTimerId) {
      clearInterval(this._healthTimerId);
      this._healthTimerId = null;
    }

    if (this._healthInitialTimeout) {
      clearTimeout(this._healthInitialTimeout);
      this._healthInitialTimeout = null;
    }

    this._consecutiveHealthFailures = 0;
    this._resumeCallbacks.clear();

    console.log('[AppResumeManager] Stopped');
  }

  /**
   * Register a callback to run on app resume
   * @param {function} callback - Called with timeInBackground (ms)
   * @returns {function} Unregister function
   */
  registerResumeCallback(callback) {
    this._resumeCallbacks.add(callback);
    return () => this._resumeCallbacks.delete(callback);
  }

  // ========== PRIVATE ==========

  /**
   * Central AppState handler
   */
  _handleAppStateChange = (nextAppState) => {
    const previousState = this._appState;

    // Going to background
    if (previousState === 'active' && nextAppState.match(/inactive|background/)) {
      this._backgroundTimestamp = Date.now();
      console.log('[AppResumeManager] App going to background');
    }

    // Coming to foreground
    if (previousState.match(/inactive|background/) && nextAppState === 'active') {
      const now = Date.now();
      const bgTime = this._backgroundTimestamp
        ? now - this._backgroundTimestamp
        : 0;

      console.log(`[AppResumeManager] App resumed after ${Math.round(bgTime / 1000)}s`);

      // Run the deterministic resume sequence
      this._onResume(bgTime);
    }

    this._appState = nextAppState;
  };

  /**
   * Deterministic resume sequence:
   * 1. Session refresh (with cooldown)
   * 2. Loading state reset
   * 3. Cache clear (if stale)
   * 4. WebSocket reconnection
   * 5. Realtime channel recovery
   * 6. Health check
   * 7. User callbacks + force refresh event
   */
  async _onResume(timeInBackground) {
    const isStale = timeInBackground > STALE_THRESHOLD;

    // Step 1: Session refresh (with cooldown to avoid racing AuthContext)
    const now = Date.now();
    if (now - this._lastSessionRefresh > SESSION_COOLDOWN) {
      this._lastSessionRefresh = now;
      await this._refreshSession();
    } else {
      console.log('[AppResumeManager] Session refresh skipped (cooldown)');
    }

    // Step 2: Reset ALL loading states immediately (prevents stuck UI)
    try {
      resetAllLoadingStates();
      console.log('[AppResumeManager] Loading states reset');
    } catch (err) {
      console.warn('[AppResumeManager] Loading reset error:', err);
    }

    // Step 3: Clear caches if data is stale
    if (isStale) {
      this._clearCaches();
    }

    // Step 4: WebSocket reconnection
    this._reconnectWebSockets();

    // Step 5: Realtime channel recovery
    this._recoverRealtimeChannels();

    // Step 6: Run health check (resets consecutive failure counter)
    this._runHealthCheck();

    // Step 7: Emit force refresh for screens (only if stale)
    if (isStale) {
      console.log('[AppResumeManager] Emitting force refresh event');
      DeviceEventEmitter.emit(FORCE_REFRESH_EVENT);
    }

    // Step 8: User callbacks
    this._resumeCallbacks.forEach(cb => {
      try {
        cb(timeInBackground);
      } catch (err) {
        console.warn('[AppResumeManager] Callback error:', err);
      }
    });
  }

  /**
   * Refresh Supabase session
   */
  async _refreshSession() {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.warn('[AppResumeManager] Session check error:', error.message);
        const { error: refreshError } = await supabase.auth.refreshSession();
        if (refreshError) {
          console.warn('[AppResumeManager] Session refresh failed:', refreshError.message);
        } else {
          console.log('[AppResumeManager] Session refreshed');
        }
      } else if (data?.session) {
        const expiresAt = data.session.expires_at;
        const nowSec = Math.floor(Date.now() / 1000);
        if (expiresAt && (expiresAt - nowSec) < 300) {
          console.log('[AppResumeManager] Token expiring soon, refreshing...');
          await supabase.auth.refreshSession();
        }
      }
    } catch (err) {
      console.warn('[AppResumeManager] Session refresh error:', err);
    }
  }

  /**
   * Clear all stale caches
   */
  _clearCaches() {
    console.log('[AppResumeManager] Clearing stale caches');

    try { clearAllStaleCaches(); } catch (e) {
      console.warn('[AppResumeManager] Cache clear error:', e);
    }
    try { patternCache.clear(); } catch (e) {
      console.warn('[AppResumeManager] Pattern cache error:', e);
    }
    try { binanceService.clearCandleCache(); } catch (e) {
      console.warn('[AppResumeManager] Candle cache error:', e);
    }
  }

  /**
   * Reconnect WebSocket pool if disconnected
   */
  _reconnectWebSockets() {
    try {
      if (wsPool.permanentlyDisconnected || !wsPool.isPoolConnected()) {
        if (wsPool.subscriptions?.size > 0) {
          console.log('[AppResumeManager] WS pool disconnected, reconnecting...');
          wsPool.resetAndReconnect?.() || wsPool.reconnect?.();
        } else if (!wsPool.isPoolConnected()) {
          wsPool.reconnect?.();
        }
      }
    } catch (err) {
      console.warn('[AppResumeManager] WS reconnect error:', err);
    }
  }

  /**
   * Recover Supabase Realtime channels
   */
  _recoverRealtimeChannels() {
    try {
      const channels = supabase.getChannels();
      if (channels.length === 0) return;

      let resubscribed = 0;
      channels.forEach(channel => {
        const state = channel.state;
        if (state === 'closed' || state === 'errored') {
          try {
            channel.subscribe();
            resubscribed++;
          } catch (e) {
            // ignore individual failures
          }
        }
      });

      if (resubscribed > 0) {
        console.log(`[AppResumeManager] Resubscribed ${resubscribed} channels`);
      }
    } catch (err) {
      console.warn('[AppResumeManager] Realtime recovery error:', err);
    }
  }

  /**
   * Health check — replaces connectionHealthMonitor's runHealthCheck
   */
  async _runHealthCheck() {
    if (!this._isRunning) return;

    let healthy = true;

    // Check Supabase connectivity
    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('timeout')), 5000)
      );
      const queryPromise = supabase
        .from('profiles')
        .select('id')
        .limit(1)
        .then(({ error }) => {
          if (error) throw error;
          return true;
        });

      await Promise.race([queryPromise, timeoutPromise]);
    } catch (err) {
      healthy = false;
      console.warn('[AppResumeManager] Health check: Supabase failed');
    }

    // Track consecutive failures
    if (healthy) {
      if (this._consecutiveHealthFailures > 0) {
        console.log('[AppResumeManager] Health recovered after', this._consecutiveHealthFailures, 'failures');
      }
      this._consecutiveHealthFailures = 0;
    } else {
      this._consecutiveHealthFailures++;
      console.warn('[AppResumeManager] Health failure count:', this._consecutiveHealthFailures);

      // Full recovery after 3 consecutive failures
      if (this._consecutiveHealthFailures >= 3) {
        console.warn('[AppResumeManager] 3 failures — triggering full recovery');
        this._triggerFullRecovery();
        this._consecutiveHealthFailures = 0;
      }
    }
  }

  /**
   * Full recovery — nuclear option after persistent failures
   */
  _triggerFullRecovery() {
    console.log('[AppResumeManager] === FULL RECOVERY ===');

    try { resetAllLoadingStates(); } catch (e) {}
    this._clearCaches();
    this._reconnectWebSockets();

    // Resubscribe ALL channels (not just errored)
    try {
      supabase.getChannels().forEach(channel => {
        try { channel.subscribe(); } catch (e) {}
      });
    } catch (e) {}

    DeviceEventEmitter.emit(FORCE_REFRESH_EVENT);
    console.log('[AppResumeManager] === FULL RECOVERY COMPLETE ===');
  }
}

// Singleton
const appResumeManager = new AppResumeManager();
export { appResumeManager };
export default appResumeManager;
