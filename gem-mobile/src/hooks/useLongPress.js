/**
 * useLongPress Hook
 * Handles long press gesture detection with haptic feedback
 *
 * Features:
 * - Configurable threshold (default 300ms)
 * - Haptic feedback on long press trigger
 * - Distinguishes between tap and long press
 * - Cleanup on unmount
 */

import { useRef, useCallback, useEffect } from 'react';
import { REACTION_ANIMATIONS } from '../constants/reactions';

// Safe haptics import (graceful fallback if not available)
let Haptics = null;
try {
  Haptics = require('expo-haptics');
} catch (e) {
  console.log('[useLongPress] expo-haptics not available');
}

/**
 * Custom hook for handling long press gestures
 *
 * @param {Object} options - Configuration options
 * @param {Function} options.onLongPress - Callback when long press is detected
 * @param {Function} options.onPress - Callback for normal tap (short press)
 * @param {Function} options.onPressStart - Callback when press starts
 * @param {Function} options.onPressEnd - Callback when press ends
 * @param {number} options.threshold - Long press duration threshold in ms (default 300)
 * @param {boolean} options.enableHaptics - Enable haptic feedback (default true)
 * @param {boolean} options.disabled - Disable the hook (default false)
 * @returns {Object} Event handlers and state
 */
export const useLongPress = ({
  onLongPress,
  onPress,
  onPressStart,
  onPressEnd,
  threshold = REACTION_ANIMATIONS.LONG_PRESS_THRESHOLD,
  enableHaptics = true,
  disabled = false,
} = {}) => {
  const timeoutRef = useRef(null);
  const isLongPressRef = useRef(false);
  const startTimeRef = useRef(0);
  const startPositionRef = useRef({ x: 0, y: 0 });

  // Movement threshold to cancel long press (in pixels)
  const MOVE_THRESHOLD = 10;

  /**
   * Clear the long press timeout
   */
  const clearLongPressTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  /**
   * Trigger haptic feedback safely
   */
  const triggerHaptic = useCallback(async () => {
    if (!enableHaptics || !Haptics) return;

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (err) {
      // Silently fail if haptics not available
      console.log('[useLongPress] Haptic feedback failed:', err?.message);
    }
  }, [enableHaptics]);

  /**
   * Handle press start (touch down)
   */
  const onPressIn = useCallback(
    (event) => {
      if (disabled) return;

      isLongPressRef.current = false;
      startTimeRef.current = Date.now();

      // Store initial position
      const { pageX, pageY } = event?.nativeEvent || {};
      startPositionRef.current = { x: pageX || 0, y: pageY || 0 };

      // Call onPressStart callback
      onPressStart?.(event);

      // Set timeout for long press detection
      timeoutRef.current = setTimeout(() => {
        isLongPressRef.current = true;
        triggerHaptic();
        onLongPress?.(event);
      }, threshold);
    },
    [disabled, threshold, onLongPress, onPressStart, triggerHaptic]
  );

  /**
   * Handle press end (touch up)
   */
  const onPressOut = useCallback(
    (event) => {
      if (disabled) return;

      clearLongPressTimeout();

      const pressDuration = Date.now() - startTimeRef.current;
      const wasLongPress = isLongPressRef.current;

      // Call onPressEnd callback
      onPressEnd?.(event, wasLongPress);

      // If it wasn't a long press and duration was short, it's a tap
      if (!wasLongPress && pressDuration < threshold) {
        onPress?.(event);
      }

      isLongPressRef.current = false;
    },
    [disabled, threshold, onPress, onPressEnd, clearLongPressTimeout]
  );

  /**
   * Handle move (to cancel long press if user moves too much)
   */
  const onMove = useCallback(
    (event) => {
      if (disabled || !timeoutRef.current) return;

      const { pageX, pageY } = event?.nativeEvent || {};
      const startX = startPositionRef.current.x;
      const startY = startPositionRef.current.y;

      const deltaX = Math.abs((pageX || 0) - startX);
      const deltaY = Math.abs((pageY || 0) - startY);

      // Cancel long press if moved too much
      if (deltaX > MOVE_THRESHOLD || deltaY > MOVE_THRESHOLD) {
        clearLongPressTimeout();
        isLongPressRef.current = false;
      }
    },
    [disabled, clearLongPressTimeout]
  );

  /**
   * Cancel the long press (for external use)
   */
  const cancel = useCallback(() => {
    clearLongPressTimeout();
    isLongPressRef.current = false;
  }, [clearLongPressTimeout]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearLongPressTimeout();
    };
  }, [clearLongPressTimeout]);

  return {
    // Event handlers for Pressable
    handlers: {
      onPressIn,
      onPressOut,
      onTouchMove: onMove,
    },
    // Individual handlers
    onPressIn,
    onPressOut,
    onMove,
    // Control
    cancel,
    // State
    isLongPressing: isLongPressRef,
  };
};

export default useLongPress;
