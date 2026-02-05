/**
 * Connection Health Monitor
 *
 * Runs periodic health checks during active use to detect and recover
 * from dead connections. Checks every 60 seconds:
 * 1. Supabase connectivity (lightweight query)
 * 2. WebSocket pool status (reset if permanently dead)
 * 3. Supabase Realtime channels (resubscribe errored channels)
 * 4. Full recovery after 3 consecutive failures
 */

import { AppState } from 'react-native';
import { DeviceEventEmitter } from 'react-native';
import { supabase } from './supabase';
import { wsPool } from './scanner/webSocketPoolService';
import { resetAllLoadingStates, clearAllStaleCaches, FORCE_REFRESH_EVENT } from '../utils/loadingStateManager';

const HEALTH_CHECK_INTERVAL = 60 * 1000; // 60 seconds
const SUPABASE_TIMEOUT = 5000; // 5 second timeout for health check query

class ConnectionHealthMonitor {
  constructor() {
    this.interval = null;
    this.consecutiveFailures = 0;
    this.isRunning = false;
    this.appStateSubscription = null;
    this.isPaused = false; // Pause when app is in background
  }

  /**
   * Start the health monitor
   */
  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.consecutiveFailures = 0;

    console.log('[ConnectionHealth] Starting health monitor (60s interval)');

    // Run first check after 10 seconds (give app time to initialize)
    setTimeout(() => {
      if (this.isRunning) this.runHealthCheck();
    }, 10000);

    // Then run every 60 seconds
    this.interval = setInterval(() => {
      if (!this.isPaused) {
        this.runHealthCheck();
      }
    }, HEALTH_CHECK_INTERVAL);

    // Pause when app goes to background, resume on foreground
    this.appStateSubscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        this.isPaused = false;
        // Run immediate check on resume
        this.runHealthCheck();
      } else {
        this.isPaused = true;
      }
    });
  }

  /**
   * Stop the health monitor
   */
  stop() {
    this.isRunning = false;
    this.isPaused = false;

    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }

    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
      this.appStateSubscription = null;
    }

    console.log('[ConnectionHealth] Stopped');
  }

  /**
   * Run a single health check cycle
   */
  async runHealthCheck() {
    if (!this.isRunning) return;

    let healthy = true;

    // 1. Check Supabase connectivity
    try {
      const supabaseOk = await this.checkSupabase();
      if (!supabaseOk) {
        healthy = false;
        console.warn('[ConnectionHealth] Supabase check failed');
      }
    } catch (err) {
      healthy = false;
      console.warn('[ConnectionHealth] Supabase check error:', err.message);
    }

    // 2. Check WebSocket pool
    try {
      this.checkWebSocketPool();
    } catch (err) {
      console.warn('[ConnectionHealth] WS pool check error:', err.message);
    }

    // 3. Check Supabase Realtime channels
    try {
      this.checkRealtimeChannels();
    } catch (err) {
      console.warn('[ConnectionHealth] Realtime check error:', err.message);
    }

    // Track consecutive failures
    if (healthy) {
      if (this.consecutiveFailures > 0) {
        console.log('[ConnectionHealth] Recovered after', this.consecutiveFailures, 'failures');
      }
      this.consecutiveFailures = 0;
      console.log('[ConnectionHealth] Health check passed');
    } else {
      this.consecutiveFailures++;
      console.warn('[ConnectionHealth] Failure count:', this.consecutiveFailures);

      // 4. Full recovery after 3 consecutive failures
      if (this.consecutiveFailures >= 3) {
        console.warn('[ConnectionHealth] 3 consecutive failures - triggering full recovery');
        this.triggerFullRecovery();
        this.consecutiveFailures = 0; // Reset after recovery attempt
      }
    }
  }

  /**
   * Check Supabase connectivity with timeout
   */
  async checkSupabase() {
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Supabase health check timeout')), SUPABASE_TIMEOUT)
    );

    const queryPromise = supabase
      .from('profiles')
      .select('id')
      .limit(1)
      .then(({ error }) => {
        if (error) throw error;
        return true;
      });

    try {
      return await Promise.race([queryPromise, timeoutPromise]);
    } catch (err) {
      // Try refreshing the session/token
      try {
        await supabase.auth.getSession();
      } catch (sessionErr) {
        console.warn('[ConnectionHealth] Session refresh also failed:', sessionErr.message);
      }
      return false;
    }
  }

  /**
   * Check WebSocket pool and revive if permanently dead
   */
  checkWebSocketPool() {
    if (wsPool.permanentlyDisconnected || (!wsPool.isPoolConnected() && wsPool.subscriptions.size > 0)) {
      console.log('[ConnectionHealth] WS pool dead with active subscriptions, resetting...');
      wsPool.resetAndReconnect();
    }
  }

  /**
   * Check Supabase Realtime channels and resubscribe errored ones
   */
  checkRealtimeChannels() {
    const channels = supabase.getChannels();
    if (channels.length === 0) return;

    let resubscribed = 0;
    channels.forEach(channel => {
      // Check for closed or errored channels
      const state = channel.state;
      if (state === 'closed' || state === 'errored') {
        try {
          channel.subscribe();
          resubscribed++;
        } catch (e) {
          console.warn('[ConnectionHealth] Channel resubscribe failed:', e.message);
        }
      }
    });

    if (resubscribed > 0) {
      console.log('[ConnectionHealth] Resubscribed', resubscribed, 'channels');
    }
  }

  /**
   * Full recovery - nuclear option after persistent failures
   */
  triggerFullRecovery() {
    console.log('[ConnectionHealth] === FULL RECOVERY ===');

    // Reset all loading states
    try {
      resetAllLoadingStates();
    } catch (e) {
      console.warn('[ConnectionHealth] Loading reset error:', e.message);
    }

    // Clear stale caches
    try {
      clearAllStaleCaches();
    } catch (e) {
      console.warn('[ConnectionHealth] Cache clear error:', e.message);
    }

    // Force reconnect WebSocket pool
    try {
      if (wsPool.subscriptions.size > 0) {
        wsPool.reconnect();
      }
    } catch (e) {
      console.warn('[ConnectionHealth] WS reconnect error:', e.message);
    }

    // Resubscribe all Realtime channels
    try {
      const channels = supabase.getChannels();
      channels.forEach(channel => {
        try {
          channel.subscribe();
        } catch (e) {
          // ignore individual failures
        }
      });
    } catch (e) {
      console.warn('[ConnectionHealth] Realtime reconnect error:', e.message);
    }

    // Emit force refresh event for screens
    DeviceEventEmitter.emit(FORCE_REFRESH_EVENT);

    console.log('[ConnectionHealth] === FULL RECOVERY COMPLETE ===');
  }
}

// Singleton
const connectionHealthMonitor = new ConnectionHealthMonitor();
export { connectionHealthMonitor };
export default connectionHealthMonitor;
