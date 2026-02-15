/**
 * useGlobalAppResume - Delegates app resume handling to AppResumeManager
 *
 * C14 FIX: Now delegates to unified AppResumeManager instead of running
 * its own AppState listener + stuck-state timer + cache/WS recovery.
 *
 * Issue 2 FIX: Now passes AuthContext's refreshProfile to AppResumeManager
 * so it can refresh the profile on resume. AuthContext's own AppState
 * listener was removed — AppResumeManager is the SOLE resume handler.
 *
 * The AppResumeManager handles:
 * - Single AppState listener (replaces 3 separate ones)
 * - Deterministic sequence: session → profile → cache → WS → health → force refresh
 * - Stuck-state detection (15s interval, 15s threshold)
 * - Health checks (60s interval, 3-strike recovery)
 *
 * DEAD CODE REMOVED (Phase 7.75):
 * - Old useAppResume hook (had its own AppState.addEventListener — competing listener)
 * - clearStaleCaches, reconnectWebSocket, refreshSupabaseSession (duplicated AppResumeManager)
 * - Module-level resumeCallbacks, registerResumeCallback (replaced by AppResumeManager)
 */

import { useEffect } from 'react';

/**
 * Global app resume handler - use in AppNavigator
 *
 * @param {function} refreshProfile - AuthContext's refreshProfile() function
 */
export const useGlobalAppResume = (refreshProfile) => {
  useEffect(() => {
    // Import dynamically to avoid circular deps
    const { appResumeManager } = require('../services/AppResumeManager');
    appResumeManager.start();

    // Pass the profile refresh function to AppResumeManager
    // so it can refresh auth state on resume (replaces AuthContext AppState listener)
    if (refreshProfile) {
      appResumeManager.setProfileRefreshFn(refreshProfile);
    }

    console.log('[GlobalAppResume] Delegating to unified AppResumeManager (sole handler)');

    return () => {
      // Don't stop on unmount — manager is a singleton that lives for the app lifetime.
      // It gets stopped explicitly on logout via performFullCleanup.
    };
  }, [refreshProfile]);
};
