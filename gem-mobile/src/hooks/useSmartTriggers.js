// src/hooks/useSmartTriggers.js
// ============================================================
// SMART TRIGGERS HOOK
// Evaluate and manage smart triggers for proactive engagement
// ============================================================

import { useState, useEffect, useCallback, useRef } from 'react';
import { getSmartTriggersForUser, logTriggerShown } from '../services/gemMasterService';

const HOOK_NAME = '[useSmartTriggers]';

/**
 * Hook to manage smart triggers
 * @param {string} userId - User ID
 * @param {object} options - Configuration options
 * @returns {object} - Trigger state and handlers
 */
export const useSmartTriggers = (userId, options = {}) => {
  const {
    enabled = true,
    checkInterval = 60000, // Check every minute
    maxTriggers = 1, // Max triggers to show at once
  } = options;

  const [triggers, setTriggers] = useState([]);
  const [activeTrigger, setActiveTrigger] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastChecked, setLastChecked] = useState(null);

  const intervalRef = useRef(null);
  const mountedRef = useRef(true);

  // Check for triggers
  const checkTriggers = useCallback(async () => {
    if (!userId || !enabled) {
      console.log(HOOK_NAME, 'Skipping check - disabled or no userId');
      return;
    }

    console.log(HOOK_NAME, 'Checking triggers for user:', userId);
    setIsLoading(true);

    try {
      const result = await getSmartTriggersForUser(userId);

      if (!mountedRef.current) return;

      console.log(HOOK_NAME, 'Found triggers:', result?.length || 0);

      setTriggers(result || []);
      setLastChecked(new Date());

      // Set active trigger (highest priority)
      if (result?.length > 0 && !activeTrigger) {
        setActiveTrigger(result[0]);
      }
    } catch (err) {
      console.error(HOOK_NAME, 'Error checking triggers:', err.message);
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [userId, enabled, activeTrigger]);

  // Dismiss current trigger
  const dismissTrigger = useCallback(async () => {
    console.log(HOOK_NAME, 'Dismissing trigger');

    if (activeTrigger) {
      // Log dismissal (don't wait)
      logTriggerShown(userId, { ...activeTrigger, wasDismissed: true }).catch(err => {
        console.warn(HOOK_NAME, 'Error logging dismissal:', err.message);
      });
    }

    setActiveTrigger(null);

    // Show next trigger if available
    if (triggers.length > 1) {
      setTriggers(prev => prev.slice(1));
      setActiveTrigger(triggers[1] || null);
    } else {
      setTriggers([]);
    }
  }, [activeTrigger, triggers, userId]);

  // Handle trigger action
  const handleTriggerAction = useCallback(async (action, trigger) => {
    console.log(HOOK_NAME, 'Trigger action:', action);

    if (trigger) {
      // Log action (don't wait)
      logTriggerShown(userId, { ...trigger, action, wasActedUpon: true }).catch(err => {
        console.warn(HOOK_NAME, 'Error logging action:', err.message);
      });
    }

    // Clear the trigger after action
    setActiveTrigger(null);
    setTriggers(prev => prev.filter(t => t.id !== trigger?.id));

    return action;
  }, [userId]);

  // Mark trigger as shown
  const markTriggerShown = useCallback(async (trigger) => {
    if (!trigger || !userId) return;

    console.log(HOOK_NAME, 'Marking trigger as shown:', trigger.id);

    try {
      await logTriggerShown(userId, trigger);
    } catch (err) {
      console.warn(HOOK_NAME, 'Error marking trigger shown:', err.message);
    }
  }, [userId]);

  // Force refresh triggers
  const refresh = useCallback(() => {
    console.log(HOOK_NAME, 'Force refresh');
    checkTriggers();
  }, [checkTriggers]);

  // Initial check and interval setup
  useEffect(() => {
    mountedRef.current = true;

    if (enabled && userId) {
      // Initial check
      checkTriggers();

      // Set up interval
      if (checkInterval > 0) {
        intervalRef.current = setInterval(checkTriggers, checkInterval);
      }
    }

    return () => {
      mountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [userId, enabled, checkInterval]);

  // Log when active trigger changes
  useEffect(() => {
    if (activeTrigger) {
      console.log(HOOK_NAME, 'Active trigger:', activeTrigger.id);
      markTriggerShown(activeTrigger);
    }
  }, [activeTrigger?.id]);

  return {
    // State
    triggers,
    activeTrigger,
    isLoading,
    lastChecked,
    hasTriggers: triggers.length > 0,

    // Actions
    dismissTrigger,
    handleTriggerAction,
    refresh,
  };
};

export default useSmartTriggers;
