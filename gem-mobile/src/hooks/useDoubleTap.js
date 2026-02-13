/**
 * Double Tap Hook
 * Detect double-tap gestures for image viewer
 * Phase 2: Image Viewer Enhancement (30/12/2024)
 */

import { useRef, useCallback } from 'react';
import { Gesture } from 'react-native-gesture-handler';

const DOUBLE_TAP_DELAY = 300; // ms

/**
 * Custom hook for detecting double-tap
 * @param {Function} onDoubleTap - Callback with { x, y } position
 * @param {Function} onSingleTap - Callback for single tap
 * @returns {Object} Gesture object
 */
export const useDoubleTap = (onDoubleTap, onSingleTap) => {
  const lastTapRef = useRef(0);
  const lastPositionRef = useRef({ x: 0, y: 0 });
  const timeoutRef = useRef(null);

  const gesture = Gesture.Tap()
    .numberOfTaps(1)
    .onEnd((event) => {
      const now = Date.now();
      const { x, y } = event;

      // Check if this is a double tap
      if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
        // Double tap detected
        clearTimeout(timeoutRef.current);
        onDoubleTap?.({ x, y });
        lastTapRef.current = 0;
      } else {
        // First tap - wait to see if there's a second
        lastTapRef.current = now;
        lastPositionRef.current = { x, y };

        timeoutRef.current = setTimeout(() => {
          // No second tap, this is a single tap
          onSingleTap?.({ x, y });
          lastTapRef.current = 0;
        }, DOUBLE_TAP_DELAY);
      }
    });

  return gesture;
};

export default useDoubleTap;
