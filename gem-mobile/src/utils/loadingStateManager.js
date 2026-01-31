/**
 * Loading State Manager
 *
 * Global manager to reset stuck loading states when app resumes from background.
 * Screens can register their reset functions, and all will be called when needed.
 *
 * PROBLEM SOLVED:
 * - When app is idle, API calls can hang forever
 * - Loading spinners get stuck
 * - Users have to kill app and restart
 *
 * SOLUTION:
 * - Screens register their loading reset functions
 * - When app resumes, all loading states are reset
 * - Screens then refetch data fresh
 *
 * Created: January 31, 2026
 */

import { DeviceEventEmitter } from 'react-native';

// Event name for reset broadcasts
export const RESET_LOADING_EVENT = 'GLOBAL_RESET_LOADING_STATES';
export const FORCE_REFRESH_EVENT = 'GLOBAL_FORCE_REFRESH';

// Registry of reset callbacks
const resetCallbacks = new Map();

/**
 * Register a loading state reset callback
 * @param {string} screenId - Unique screen identifier
 * @param {function} resetFn - Function to reset loading states
 * @returns {function} Unregister function
 */
export const registerLoadingReset = (screenId, resetFn) => {
  if (typeof resetFn !== 'function') {
    console.warn('[LoadingManager] Invalid reset function for', screenId);
    return () => {};
  }

  resetCallbacks.set(screenId, resetFn);
  console.log(`[LoadingManager] Registered: ${screenId} (total: ${resetCallbacks.size})`);

  // Return unregister function
  return () => {
    resetCallbacks.delete(screenId);
    console.log(`[LoadingManager] Unregistered: ${screenId}`);
  };
};

/**
 * Reset ALL registered loading states
 * Called when app resumes from background after being idle
 */
export const resetAllLoadingStates = () => {
  console.log(`[LoadingManager] Resetting ${resetCallbacks.size} screens...`);

  resetCallbacks.forEach((resetFn, screenId) => {
    try {
      resetFn();
      console.log(`[LoadingManager] Reset: ${screenId}`);
    } catch (err) {
      console.warn(`[LoadingManager] Error resetting ${screenId}:`, err.message);
    }
  });

  // Also emit event for any listeners
  DeviceEventEmitter.emit(RESET_LOADING_EVENT);
};

/**
 * Force refresh ALL screens
 * Called when app needs complete data refresh
 */
export const forceRefreshAll = () => {
  console.log('[LoadingManager] Force refreshing all screens...');
  DeviceEventEmitter.emit(FORCE_REFRESH_EVENT);
};

/**
 * Hook to use in screens for auto-reset on global event
 * @param {function} setLoading - setState function for loading
 * @param {function} refreshFn - Optional refresh function to call
 * @returns {function} Cleanup function
 */
export const useLoadingReset = (setLoading, refreshFn = null) => {
  const cleanup = [];

  // Listen for reset event
  const resetListener = DeviceEventEmitter.addListener(RESET_LOADING_EVENT, () => {
    setLoading(false);
  });
  cleanup.push(() => resetListener.remove());

  // Listen for refresh event
  if (refreshFn) {
    const refreshListener = DeviceEventEmitter.addListener(FORCE_REFRESH_EVENT, () => {
      setLoading(true);
      refreshFn();
    });
    cleanup.push(() => refreshListener.remove());
  }

  return () => cleanup.forEach(fn => fn());
};

/**
 * Clear stale data across all caches
 * Call this when app has been idle too long
 */
export const clearAllStaleCaches = () => {
  console.log('[LoadingManager] Clearing all stale caches...');

  // Import caches dynamically to avoid circular deps
  try {
    // Vision Board cache
    const visionBoardCache = require('../screens/VisionBoard/VisionBoardScreen').visionBoardCache;
    if (visionBoardCache) {
      visionBoardCache.lastFetch = 0; // Force refetch
      console.log('[LoadingManager] Vision Board cache marked stale');
    }
  } catch (e) {}

  try {
    // Forum cache
    const forumCache = require('../screens/Forum/ForumScreen').forumCache;
    if (forumCache) {
      forumCache.lastFetch = 0;
      console.log('[LoadingManager] Forum cache marked stale');
    }
  } catch (e) {}

  try {
    // Notifications cache
    const notificationsCache = require('../screens/tabs/NotificationsScreen').notificationsCache;
    if (notificationsCache) {
      notificationsCache.lastFetch = 0;
      console.log('[LoadingManager] Notifications cache marked stale');
    }
  } catch (e) {}
};

export default {
  registerLoadingReset,
  resetAllLoadingStates,
  forceRefreshAll,
  useLoadingReset,
  clearAllStaleCaches,
  RESET_LOADING_EVENT,
  FORCE_REFRESH_EVENT,
};
