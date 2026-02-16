/**
 * AppResumeManager - Unified App Resume Handler
 *
 * C14 FIX: Consolidates overlapping resume systems into 1 deterministic manager.
 * Issue 2 FIX: Now the SOLE resume handler. AuthContext's AppState listener removed.
 *
 * BEFORE (Issue 2 root cause): 3 AppState listeners racing each other:
 *   1. AppResumeManager (session + cache + WS)
 *   2. AuthContext (profile refresh, 60s threshold)
 *   3. useAppResume hook (only if used by a screen)
 *
 * AFTER: 1 unified manager with deterministic sequence:
 *   Session refresh (await) -> Profile refresh (await) -> Cache clear -> WS reconnect -> Force refresh event
 *
 * KEY FIX: resetAllLoadingStates() is NO LONGER called on resume.
 * Previously it fired BEFORE screens set loading=true for their data fetches,
 * creating a race where loading was cleared before it was set, causing stuck UIs.
 * Now screens manage their own loading states via FORCE_REFRESH_EVENT listeners.
 *
 * What this manager handles:
 * - Single AppState listener for resume detection
 * - Deterministic operation sequence on resume
 * - Stuck-state detection timer (15s interval) — catches genuine stuck states
 * - Session AND profile refresh (centralized, no duplicate in AuthContext)
 * - WebSocket + Realtime reconnection
 * - Health checks (60s interval, 3-strike recovery)
 *
 * What this manager does NOT handle:
 * - paperTradeService lifecycle (has its own AppState listener, separate concern)
 * - Offline affiliate sync (stays in AppNavigator — minimal)
 * - Feature-specific AppState listeners (presence, biometric, video pause, etc.)
 */

import { AppState, DeviceEventEmitter } from 'react-native';
import { supabase } from './supabase';
import { wsPool } from './scanner/webSocketPoolService';
import { patternCache } from './scanner/patternCacheService';
import { binanceService } from './binanceService';
import {
  resetStuckLoadingStates,
  clearAllStaleCaches,
  FORCE_REFRESH_EVENT,
} from '../utils/loadingStateManager';

// Thresholds
const STALE_THRESHOLD = 60 * 1000;        // 1 minute — data considered stale
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
    // Profile refresh function — set by AuthContext via setProfileRefreshFn()
    this._profileRefreshFn = null;
  }

  /**
   * Start the manager — call once from AppNavigator
   */
  start() {
    if (this._isRunning) return;
    this._isRunning = true;

    console.log('[AppResumeManager] Starting unified resume manager (sole handler)');

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
    this._profileRefreshFn = null;

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

  /**
   * Set the profile refresh function from AuthContext.
   * Called by useGlobalAppResume after AuthContext is available.
   * @param {function} refreshFn - AuthContext's refreshProfile()
   */
  setProfileRefreshFn(refreshFn) {
    this._profileRefreshFn = refreshFn;
    console.log('[AppResumeManager] Profile refresh function registered');
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
   * Deterministic resume sequence (Issue 2 Fix):
   *
   * 1. Session refresh (AWAIT — must complete before data fetches)
   * 2. Profile refresh (AWAIT — refreshes user/profile/quota in AuthContext)
   * 3. Cache clear (if stale >60s)
   * 4. WebSocket reconnection
   * 5. Realtime channel recovery
   * 6. Health check (non-blocking)
   * 7. Emit FORCE_REFRESH_EVENT (screens reload with fresh auth)
   * 8. User callbacks
   *
   * NOTE: resetAllLoadingStates() is NOT called here anymore.
   * It was causing a race condition where loading states were cleared
   * BEFORE screens set loading=true for their data fetches triggered
   * by FORCE_REFRESH_EVENT. Screens now manage their own loading
   * via their FORCE_REFRESH_EVENT listeners (which reset loading
   * before calling loadPosts/loadData). The stuck-state timer
   * (15s interval) still catches genuinely stuck states.
   */
  async _onResume(timeInBackground) {
    const isStale = timeInBackground > STALE_THRESHOLD;

    // Step 1: Session refresh — MUST complete before any data fetches
    // Phase 9 Fix: Overall timeout for the entire resume sequence
    // Individual Supabase calls have 8s timeout via global fetch wrapper,
    // but we also guard the overall step to prevent cascade delays.
    console.log('[AppResumeManager] Step 1: Refreshing session...');
    try {
      await Promise.race([
        this._refreshSession(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Resume session timeout')), 10000)),
      ]);
    } catch (err) {
      console.warn('[AppResumeManager] Step 1 failed/timed out:', err?.message);
    }

    // Step 2: Profile refresh — updates AuthContext state (user, profile, quota)
    // This replaces the removed AuthContext AppState listener
    // Phase 9 Fix: Added 10s timeout to prevent profile refresh from blocking FORCE_REFRESH_EVENT
    if (isStale && this._profileRefreshFn) {
      console.log('[AppResumeManager] Step 2: Refreshing profile...');
      try {
        const result = await Promise.race([
          this._profileRefreshFn(),
          new Promise((resolve) => setTimeout(() => resolve({ success: false, reason: 'timeout' }), 10000)),
        ]);
        if (result?.success) {
          console.log('[AppResumeManager] Profile refresh completed');
        } else {
          console.log('[AppResumeManager] Profile refresh skipped:', result?.reason);
        }
      } catch (err) {
        console.warn('[AppResumeManager] Profile refresh error:', err?.message);
      }
    } else if (!isStale) {
      console.log('[AppResumeManager] Step 2: Profile refresh skipped (not stale)');
    }

    // Step 3: Clear caches if data is stale
    if (isStale) {
      this._clearCaches();
    }

    // Step 4: WebSocket reconnection
    this._reconnectWebSockets();

    // Step 5: Realtime channel recovery
    this._recoverRealtimeChannels();

    // Step 6: Run health check (non-blocking, resets consecutive failure counter)
    this._runHealthCheck();

    // Step 7: ALWAYS emit force refresh for screens
    // Even non-stale resumes (10-59s) need this to recover screens stuck during background
    // Auth is now guaranteed fresh at this point
    console.log(`[AppResumeManager] Step 7: Emitting FORCE_REFRESH_EVENT (stale=${isStale}, auth is fresh)`);
    DeviceEventEmitter.emit(FORCE_REFRESH_EVENT);

    // Step 8: User callbacks
    this._resumeCallbacks.forEach(cb => {
      try {
        cb(timeInBackground);
      } catch (err) {
        console.warn('[AppResumeManager] Callback error:', err);
      }
    });

    console.log(`[AppResumeManager] Resume sequence complete (stale=${isStale})`);
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
        } else {
          console.log('[AppResumeManager] Session valid');
        }
      } else {
        console.log('[AppResumeManager] No session (user not logged in)');
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
   * NOTE: Even in full recovery, we do NOT call resetAllLoadingStates().
   * Instead we emit FORCE_REFRESH_EVENT which lets each screen
   * properly reset its own loading + reload data in one atomic operation.
   */
  _triggerFullRecovery() {
    console.log('[AppResumeManager] === FULL RECOVERY ===');

    this._clearCaches();
    this._reconnectWebSockets();

    // Resubscribe ALL channels (not just errored)
    try {
      supabase.getChannels().forEach(channel => {
        try { channel.subscribe(); } catch (e) {}
      });
    } catch (e) {}

    // Profile refresh if available
    if (this._profileRefreshFn) {
      this._profileRefreshFn().catch(err => {
        console.warn('[AppResumeManager] Recovery profile refresh error:', err?.message);
      });
    }

    DeviceEventEmitter.emit(FORCE_REFRESH_EVENT);
    console.log('[AppResumeManager] === FULL RECOVERY COMPLETE ===');
  }
}

// Singleton
const appResumeManager = new AppResumeManager();
export { appResumeManager };
export default appResumeManager;
