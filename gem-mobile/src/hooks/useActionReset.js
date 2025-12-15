/**
 * useActionReset Hook - Vision Board 2.0
 * Automatically checks and resets actions when app opens or comes to foreground
 *
 * Features:
 * - Auto-check on app mount
 * - Auto-check when app comes to foreground
 * - Only runs once per day (tracked via AsyncStorage)
 * - Manual trigger available
 *
 * Created: December 11, 2025
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../contexts/AuthContext';
import { checkAndResetActions } from '../services/actionService';

const LAST_RESET_KEY = '@vision_action_last_reset_date';

/**
 * Hook to automatically reset actions on new day
 * @param {Object} options - Hook options
 * @param {boolean} options.enabled - Whether the hook is enabled (default: true)
 * @param {function} options.onReset - Callback when actions are reset
 * @returns {Object} - { isChecking, lastResetDate, resetCount, manualCheck }
 */
export const useActionReset = (options = {}) => {
  const { enabled = true, onReset } = options;
  const { user } = useAuth();
  const appState = useRef(AppState.currentState);
  const [isChecking, setIsChecking] = useState(false);
  const [lastResetDate, setLastResetDate] = useState(null);
  const [resetCount, setResetCount] = useState(0);

  /**
   * Check if reset is needed and perform it
   */
  const checkResetNeeded = useCallback(async (forceCheck = false) => {
    if (!user?.id || isChecking) {
      return { needed: false, resetCount: 0 };
    }

    const today = new Date().toISOString().split('T')[0];

    try {
      // Check if already reset today
      if (!forceCheck) {
        const lastReset = await AsyncStorage.getItem(LAST_RESET_KEY);
        if (lastReset === today) {
          console.log('[useActionReset] Already reset today, skipping');
          setLastResetDate(today);
          return { needed: false, resetCount: 0 };
        }
      }

      // Perform reset
      setIsChecking(true);
      console.log('[useActionReset] Checking and resetting actions...');

      const result = await checkAndResetActions(user.id);

      if (result.success) {
        // Save reset date
        await AsyncStorage.setItem(LAST_RESET_KEY, today);
        setLastResetDate(today);
        setResetCount(result.resetCount);

        console.log(`[useActionReset] Reset ${result.resetCount} actions`);

        // Call onReset callback if provided
        if (onReset && result.resetCount > 0) {
          onReset(result);
        }

        return { needed: true, resetCount: result.resetCount };
      }

      return { needed: false, resetCount: 0 };
    } catch (err) {
      console.error('[useActionReset] Error:', err);
      return { needed: false, resetCount: 0, error: err };
    } finally {
      setIsChecking(false);
    }
  }, [user?.id, isChecking, onReset]);

  /**
   * Manual check trigger
   */
  const manualCheck = useCallback(async () => {
    return await checkResetNeeded(true);
  }, [checkResetNeeded]);

  /**
   * Handle app state changes
   */
  useEffect(() => {
    if (!enabled || !user?.id) return;

    // Check on mount
    checkResetNeeded();

    // Setup app state listener
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      // Check when app comes to foreground from background/inactive
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        console.log('[useActionReset] App came to foreground, checking reset');
        checkResetNeeded();
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [enabled, user?.id, checkResetNeeded]);

  /**
   * Load last reset date on mount
   */
  useEffect(() => {
    const loadLastResetDate = async () => {
      try {
        const lastReset = await AsyncStorage.getItem(LAST_RESET_KEY);
        if (lastReset) {
          setLastResetDate(lastReset);
        }
      } catch (err) {
        console.error('[useActionReset] Error loading last reset date:', err);
      }
    };

    loadLastResetDate();
  }, []);

  return {
    isChecking,
    lastResetDate,
    resetCount,
    manualCheck,
  };
};

/**
 * Get the last reset date without triggering a reset
 */
export const getLastResetDate = async () => {
  try {
    return await AsyncStorage.getItem(LAST_RESET_KEY);
  } catch (err) {
    console.error('[useActionReset] Error getting last reset date:', err);
    return null;
  }
};

/**
 * Clear the last reset date (for testing purposes)
 */
export const clearLastResetDate = async () => {
  try {
    await AsyncStorage.removeItem(LAST_RESET_KEY);
    return true;
  } catch (err) {
    console.error('[useActionReset] Error clearing last reset date:', err);
    return false;
  }
};

export default useActionReset;
