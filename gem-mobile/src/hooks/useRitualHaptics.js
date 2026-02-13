/**
 * Ritual Haptic Feedback System
 * Haptic patterns for different ritual actions
 * Phase 2: VisionBoard Upgrade
 */

import { useCallback, useRef } from 'react';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

const HOOK_NAME = '[useRitualHaptics]';

/**
 * useRitualHaptics Hook
 *
 * @returns {object} Haptic feedback functions
 */
const useRitualHaptics = () => {
  const isEnabled = useRef(true);
  const lastHapticTime = useRef(0);

  // Minimum interval between haptics (ms)
  const MIN_INTERVAL = 100;

  // Check if haptics available
  const isAvailable = Platform.OS === 'ios' || Platform.OS === 'android';

  /**
   * Throttled haptic trigger
   */
  const triggerHaptic = useCallback(
    async (hapticFn) => {
      if (!isEnabled.current || !isAvailable) return;

      const now = Date.now();
      if (now - lastHapticTime.current < MIN_INTERVAL) return;

      lastHapticTime.current = now;

      try {
        await hapticFn();
      } catch (err) {
        console.warn(HOOK_NAME, 'Haptic error:', err?.message);
      }
    },
    [isAvailable]
  );

  /**
   * Light tap - for button press
   */
  const lightTap = useCallback(() => {
    triggerHaptic(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
  }, [triggerHaptic]);

  /**
   * Medium tap - for selection
   */
  const mediumTap = useCallback(() => {
    triggerHaptic(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium));
  }, [triggerHaptic]);

  /**
   * Heavy tap - for completion/milestone
   */
  const heavyTap = useCallback(() => {
    triggerHaptic(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy));
  }, [triggerHaptic]);

  /**
   * Breath in - light feedback for inhale
   */
  const breathIn = useCallback(() => {
    triggerHaptic(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
  }, [triggerHaptic]);

  /**
   * Breath out - medium feedback for exhale
   */
  const breathOut = useCallback(() => {
    triggerHaptic(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium));
  }, [triggerHaptic]);

  /**
   * Success notification - for completion
   */
  const success = useCallback(() => {
    triggerHaptic(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
  }, [triggerHaptic]);

  /**
   * Warning notification
   */
  const warning = useCallback(() => {
    triggerHaptic(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning));
  }, [triggerHaptic]);

  /**
   * Error notification
   */
  const error = useCallback(() => {
    triggerHaptic(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error));
  }, [triggerHaptic]);

  /**
   * Selection changed
   */
  const selectionChanged = useCallback(() => {
    triggerHaptic(() => Haptics.selectionAsync());
  }, [triggerHaptic]);

  /**
   * Milestone achieved - pattern haptic
   */
  const milestone = useCallback(async () => {
    if (!isEnabled.current || !isAvailable) return;

    try {
      // Pattern: heavy - pause - medium - pause - success
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      await new Promise((resolve) => setTimeout(resolve, 150));
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await new Promise((resolve) => setTimeout(resolve, 150));
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err) {
      console.warn(HOOK_NAME, 'Milestone haptic error:', err?.message);
    }
  }, [isAvailable]);

  /**
   * Enable/disable haptics
   */
  const setEnabled = useCallback((enabled) => {
    isEnabled.current = enabled;
    console.log(HOOK_NAME, 'Haptics enabled:', enabled);
  }, []);

  return {
    // Basic
    lightTap,
    mediumTap,
    heavyTap,

    // Breathing
    breathIn,
    breathOut,

    // Notifications
    success,
    warning,
    error,

    // Special
    selectionChanged,
    milestone,

    // Control
    setEnabled,
    isAvailable,
  };
};

export default useRitualHaptics;
