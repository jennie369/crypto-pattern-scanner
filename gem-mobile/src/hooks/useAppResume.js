/**
 * useAppResume - Hook to handle app resume from background
 *
 * PROBLEM:
 * - When app is idle for too long or goes to background
 * - WebSocket disconnects, cache becomes stale
 * - Loading states get stuck, features stop working
 * - Zones don't appear, data doesn't refresh
 *
 * SOLUTION:
 * - Listen for AppState changes
 * - Clear stale caches when app resumes
 * - Force refresh data
 * - Reset stuck loading states
 *
 * USAGE:
 * const { isAppActive, wasInBackground, forceRefresh } = useAppResume({
 *   onResume: () => { ... },
 *   staleThreshold: 5 * 60 * 1000, // 5 minutes
 * });
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { AppState, DeviceEventEmitter } from 'react-native';
import { patternCache } from '../services/scanner/patternCacheService';
import { binanceService } from '../services/binanceService';
import { wsPool } from '../services/scanner/webSocketPoolService';
import { resetAllLoadingStates, resetStuckLoadingStates, clearAllStaleCaches, FORCE_REFRESH_EVENT } from '../utils/loadingStateManager';
import { supabase } from '../services/supabase';

// Global stale timestamp tracker
let lastActiveTimestamp = Date.now();
let resumeCallbacks = new Set();

/**
 * Register a global resume callback
 * @param {function} callback - Called when app resumes
 * @returns {function} Unregister function
 */
export const registerResumeCallback = (callback) => {
  resumeCallbacks.add(callback);
  return () => resumeCallbacks.delete(callback);
};

/**
 * Trigger all resume callbacks
 */
const triggerResumeCallbacks = (timeInBackground) => {
  resumeCallbacks.forEach(cb => {
    try {
      cb(timeInBackground);
    } catch (err) {
      console.warn('[AppResume] Callback error:', err);
    }
  });
};

/**
 * Clear all stale caches and reset loading states
 */
const clearStaleCaches = () => {
  console.log('[AppResume] Clearing stale caches...');

  // CRITICAL: Reset all stuck loading states first
  try {
    resetAllLoadingStates();
    console.log('[AppResume] Loading states reset');
  } catch (err) {
    console.warn('[AppResume] Loading reset error:', err);
  }

  // Mark all screen caches as stale (force refetch)
  try {
    clearAllStaleCaches();
  } catch (err) {
    console.warn('[AppResume] Cache clear error:', err);
  }

  // Clear pattern cache
  try {
    patternCache.clear();
    console.log('[AppResume] Pattern cache cleared');
  } catch (err) {
    console.warn('[AppResume] Pattern cache clear error:', err);
  }

  // Clear binance candle cache
  try {
    binanceService.clearCandleCache();
    console.log('[AppResume] Candle cache cleared');
  } catch (err) {
    console.warn('[AppResume] Candle cache clear error:', err);
  }
};

/**
 * Refresh Supabase auth session to prevent stale token errors
 * CRITICAL: Without this, API calls silently fail after long background
 */
const refreshSupabaseSession = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.warn('[AppResume] Session check error:', error.message);
      // Try to refresh the session
      const { error: refreshError } = await supabase.auth.refreshSession();
      if (refreshError) {
        console.warn('[AppResume] Session refresh failed:', refreshError.message);
      } else {
        console.log('[AppResume] Session refreshed successfully');
      }
    } else if (data?.session) {
      // Check if token is about to expire (within 5 minutes)
      const expiresAt = data.session.expires_at;
      const now = Math.floor(Date.now() / 1000);
      if (expiresAt && (expiresAt - now) < 300) {
        console.log('[AppResume] Token expiring soon, refreshing...');
        await supabase.auth.refreshSession();
      } else {
        console.log('[AppResume] Session valid');
      }
    }
  } catch (err) {
    console.warn('[AppResume] Session refresh error:', err);
  }
};

/**
 * Reconnect WebSocket and Supabase Realtime if needed
 */
const reconnectWebSocket = async () => {
  console.log('[AppResume] Checking connections...');

  // CRITICAL: Refresh Supabase session FIRST before any reconnection
  await refreshSupabaseSession();

  // Reconnect Binance WebSocket pool
  try {
    if (!wsPool.isPoolConnected()) {
      console.log('[AppResume] WebSocket disconnected, reconnecting...');
      wsPool.reconnect();
    } else {
      console.log('[AppResume] WebSocket already connected');
    }
  } catch (err) {
    console.warn('[AppResume] WebSocket reconnect error:', err);
  }

  // CRITICAL: Reconnect Supabase Realtime channels
  // This ensures realtime subscriptions work after app was backgrounded
  try {
    const channels = supabase.getChannels();
    console.log('[AppResume] Supabase channels:', channels.length);

    // Remove and re-subscribe all channels to force reconnect
    if (channels.length > 0) {
      channels.forEach(channel => {
        try {
          // Trigger reconnect by re-subscribing
          channel.subscribe();
        } catch (e) {
          console.warn('[AppResume] Channel reconnect error:', e.message);
        }
      });
      console.log('[AppResume] Supabase channels reconnected');
    }
  } catch (err) {
    console.warn('[AppResume] Supabase reconnect error:', err);
  }
};

/**
 * Hook to handle app resume from background
 * @param {object} options - Configuration options
 * @param {function} options.onResume - Callback when app resumes from background
 * @param {number} options.staleThreshold - Time in ms after which data is considered stale (default: 5 minutes)
 * @param {boolean} options.clearCacheOnResume - Whether to clear caches on resume (default: true if stale)
 * @param {boolean} options.reconnectWS - Whether to reconnect WebSocket on resume (default: true)
 * @returns {object} { isAppActive, wasInBackground, timeInBackground, forceRefresh }
 */
export const useAppResume = (options = {}) => {
  const {
    onResume,
    staleThreshold = 5 * 60 * 1000, // 5 minutes default
    clearCacheOnResume = true,
    reconnectWS = true,
  } = options;

  const [isAppActive, setIsAppActive] = useState(true);
  const [wasInBackground, setWasInBackground] = useState(false);
  const [timeInBackground, setTimeInBackground] = useState(0);

  const appStateRef = useRef(AppState.currentState);
  const backgroundTimestampRef = useRef(null);

  // Force refresh function
  const forceRefresh = useCallback(() => {
    console.log('[AppResume] Force refresh triggered');

    clearStaleCaches();
    reconnectWebSocket();

    if (onResume) {
      onResume(0);
    }
  }, [onResume]);

  useEffect(() => {
    const handleAppStateChange = (nextAppState) => {
      const previousState = appStateRef.current;

      console.log(`[AppResume] State change: ${previousState} -> ${nextAppState}`);

      // App going to background
      if (previousState === 'active' && nextAppState.match(/inactive|background/)) {
        backgroundTimestampRef.current = Date.now();
        setIsAppActive(false);
        console.log('[AppResume] App going to background');
      }

      // App coming back to foreground
      if (previousState.match(/inactive|background/) && nextAppState === 'active') {
        const now = Date.now();
        const bgTime = backgroundTimestampRef.current
          ? now - backgroundTimestampRef.current
          : now - lastActiveTimestamp;

        setTimeInBackground(bgTime);
        setWasInBackground(true);
        setIsAppActive(true);

        console.log(`[AppResume] App resumed after ${Math.round(bgTime / 1000)}s`);

        // Check if data is stale
        const isStale = bgTime > staleThreshold;

        if (isStale) {
          console.log('[AppResume] Data is stale, refreshing...');

          // Clear caches if enabled
          if (clearCacheOnResume) {
            clearStaleCaches();
          }
        }

        // Always reconnect WebSocket if enabled
        if (reconnectWS) {
          reconnectWebSocket();
        }

        // Call onResume callback
        if (onResume) {
          onResume(bgTime);
        }

        // Trigger global callbacks
        triggerResumeCallbacks(bgTime);

        // Update last active timestamp
        lastActiveTimestamp = now;

        // Reset wasInBackground after a short delay
        setTimeout(() => {
          setWasInBackground(false);
        }, 100);
      }

      appStateRef.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [onResume, staleThreshold, clearCacheOnResume, reconnectWS]);

  return {
    isAppActive,
    wasInBackground,
    timeInBackground,
    forceRefresh,
  };
};

/**
 * Global app resume handler - use in App.js or main navigator
 *
 * C14 FIX: Now delegates to unified AppResumeManager instead of running
 * its own AppState listener + stuck-state timer + cache/WS recovery.
 * This eliminates race conditions between 4 independent resume systems.
 *
 * The AppResumeManager handles:
 * - Single AppState listener (replaces 3 separate ones)
 * - Deterministic sequence: session → loading → cache → WS → health
 * - Stuck-state detection (15s interval, 15s threshold)
 * - Health checks (60s interval, 3-strike recovery)
 */
export const useGlobalAppResume = () => {
  useEffect(() => {
    // Import dynamically to avoid circular deps
    const { appResumeManager } = require('../services/AppResumeManager');
    appResumeManager.start();

    console.log('[GlobalAppResume] Delegating to unified AppResumeManager');

    return () => {
      // Don't stop on unmount — manager is a singleton that lives for the app lifetime.
      // It gets stopped explicitly on logout via performFullCleanup.
    };
  }, []);
};

export default useAppResume;
