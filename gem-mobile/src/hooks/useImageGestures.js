/**
 * Image Gestures Hook
 * Combined gesture handler for image viewer
 * Phase 2: Image Viewer Enhancement (30/12/2024)
 */

import { useCallback } from 'react';
import { Gesture } from 'react-native-gesture-handler';
import {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { Dimensions } from 'react-native';
import {
  clampPanOffset,
  shouldDismiss,
  calculateBackgroundOpacity,
} from '../utils/imageViewerUtils';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const MIN_SCALE = 1;
const MAX_SCALE = 3;
const DOUBLE_TAP_SCALE = 2;
const DOUBLE_TAP_DELAY = 300;
const DISMISS_THRESHOLD = 100;

// Optimized spring config for smoother animations
const SPRING_CONFIG = {
  damping: 20,      // Increased for less bouncy, smoother feel
  stiffness: 120,   // Decreased for gentler motion
  mass: 0.8,        // Slightly lighter for faster response
};

// Faster spring for dismiss gesture snapping back
const SNAP_BACK_CONFIG = {
  damping: 25,
  stiffness: 200,
  mass: 0.5,
};

/**
 * Combined gesture hook for image viewer
 * @param {Object} options
 * @param {number} options.imageWidth - Display width of image
 * @param {number} options.imageHeight - Display height of image
 * @param {Function} options.onDismiss - Callback to close viewer
 * @param {Function} options.onTap - Callback for single tap
 * @param {Function} options.onLongPress - Callback for long press
 * @param {Function} options.onZoomChange - Callback when zoom changes
 * @returns {Object} { gesture, animatedStyle, scale, resetZoom, backgroundOpacity }
 */
export const useImageGestures = ({
  imageWidth,
  imageHeight,
  onDismiss,
  onTap,
  onLongPress,
  onZoomChange,
}) => {
  // Shared values
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);
  const focalX = useSharedValue(0);
  const focalY = useSharedValue(0);
  const backgroundOpacity = useSharedValue(1);
  const dismissProgress = useSharedValue(0);

  // For double-tap detection
  const lastTap = useSharedValue(0);

  // Reset zoom to 1x
  const resetZoom = useCallback(() => {
    'worklet';
    scale.value = withSpring(1, SPRING_CONFIG);
    translateX.value = withSpring(0, SPRING_CONFIG);
    translateY.value = withSpring(0, SPRING_CONFIG);
    if (onZoomChange) {
      runOnJS(onZoomChange)(1);
    }
  }, [onZoomChange]);

  // Handle double tap
  const handleDoubleTap = useCallback((x, y) => {
    'worklet';
    if (scale.value > 1) {
      // Zoom out
      scale.value = withSpring(1, SPRING_CONFIG);
      translateX.value = withSpring(0, SPRING_CONFIG);
      translateY.value = withSpring(0, SPRING_CONFIG);
      if (onZoomChange) {
        runOnJS(onZoomChange)(1);
      }
    } else {
      // Zoom in to 2x at tap point
      scale.value = withSpring(DOUBLE_TAP_SCALE, SPRING_CONFIG);

      // Calculate offset to center on tap point
      const offsetX = (SCREEN_WIDTH / 2 - x) * (DOUBLE_TAP_SCALE - 1);
      const offsetY = (SCREEN_HEIGHT / 2 - y) * (DOUBLE_TAP_SCALE - 1);

      // Clamp to bounds
      const clamped = clampPanOffset(
        offsetX,
        offsetY,
        imageWidth,
        imageHeight,
        DOUBLE_TAP_SCALE
      );

      translateX.value = withSpring(clamped.x, SPRING_CONFIG);
      translateY.value = withSpring(clamped.y, SPRING_CONFIG);

      if (onZoomChange) {
        runOnJS(onZoomChange)(DOUBLE_TAP_SCALE);
      }
    }
  }, [imageWidth, imageHeight, onZoomChange]);

  // Tap gesture
  const tapGesture = Gesture.Tap()
    .numberOfTaps(1)
    .onEnd((event) => {
      'worklet';
      const now = Date.now();

      if (now - lastTap.value < DOUBLE_TAP_DELAY) {
        // Double tap
        handleDoubleTap(event.x, event.y);
        lastTap.value = 0;
      } else {
        // Single tap - wait to confirm
        lastTap.value = now;

        // Delay single tap action
        if (onTap) {
          runOnJS(onTap)();
        }
      }
    });

  // Long press gesture - for saving image
  const longPressGesture = Gesture.LongPress()
    .minDuration(500)
    .onEnd(() => {
      'worklet';
      if (onLongPress) {
        runOnJS(onLongPress)();
      }
    });

  // Pinch gesture
  const pinchGesture = Gesture.Pinch()
    .onBegin(() => {
      'worklet';
      savedScale.value = scale.value;
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    })
    .onUpdate((event) => {
      'worklet';
      const newScale = savedScale.value * event.scale;
      scale.value = Math.min(MAX_SCALE, Math.max(MIN_SCALE * 0.5, newScale));

      // Update focal point
      focalX.value = event.focalX;
      focalY.value = event.focalY;
    })
    .onEnd(() => {
      'worklet';
      if (scale.value < MIN_SCALE) {
        scale.value = withSpring(MIN_SCALE, SPRING_CONFIG);
        translateX.value = withSpring(0, SPRING_CONFIG);
        translateY.value = withSpring(0, SPRING_CONFIG);
      } else if (scale.value > MAX_SCALE) {
        scale.value = withSpring(MAX_SCALE, SPRING_CONFIG);
      }

      if (onZoomChange) {
        runOnJS(onZoomChange)(scale.value);
      }
    });

  // Pan gesture
  const panGesture = Gesture.Pan()
    .minDistance(10)
    .onBegin(() => {
      'worklet';
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    })
    .onUpdate((event) => {
      'worklet';
      if (scale.value > 1) {
        // Panning zoomed image
        const newX = savedTranslateX.value + event.translationX;
        const newY = savedTranslateY.value + event.translationY;

        const clamped = clampPanOffset(
          newX,
          newY,
          imageWidth,
          imageHeight,
          scale.value
        );

        translateX.value = clamped.x;
        translateY.value = clamped.y;
      } else {
        // Vertical dismiss drag
        translateY.value = event.translationY;

        // Update background opacity
        backgroundOpacity.value = calculateBackgroundOpacity(event.translationY);

        // Update dismiss progress for scale effect
        dismissProgress.value = Math.abs(event.translationY) / DISMISS_THRESHOLD;
      }
    })
    .onEnd((event) => {
      'worklet';
      if (scale.value <= 1) {
        // Check for dismiss
        if (shouldDismiss(event.velocityY, translateY.value)) {
          // Dismiss - smooth exit animation
          const direction = translateY.value > 0 ? 1 : -1;
          translateY.value = withTiming(
            direction * SCREEN_HEIGHT,
            { duration: 250 }  // Slightly slower for smoother feel
          );
          backgroundOpacity.value = withTiming(0, { duration: 200 });

          if (onDismiss) {
            runOnJS(onDismiss)();
          }
        } else {
          // Spring back - use faster snap-back config for responsive feel
          translateY.value = withSpring(0, SNAP_BACK_CONFIG);
          backgroundOpacity.value = withSpring(1, SNAP_BACK_CONFIG);
          dismissProgress.value = withSpring(0, SNAP_BACK_CONFIG);
        }
      }
    });

  // Combine gestures
  const gesture = Gesture.Race(
    longPressGesture,
    Gesture.Simultaneous(
      tapGesture,
      Gesture.Simultaneous(pinchGesture, panGesture)
    )
  );

  // Animated style for image
  const animatedStyle = useAnimatedStyle(() => {
    const dragScale = interpolate(
      dismissProgress.value,
      [0, 1],
      [1, 0.9],
      Extrapolate.CLAMP
    );

    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value * dragScale },
      ],
    };
  });

  // Animated style for background
  const backgroundStyle = useAnimatedStyle(() => ({
    opacity: backgroundOpacity.value,
  }));

  return {
    gesture,
    animatedStyle,
    backgroundStyle,
    scale,
    resetZoom,
    translateX,
    translateY,
    backgroundOpacity,
  };
};

export default useImageGestures;
