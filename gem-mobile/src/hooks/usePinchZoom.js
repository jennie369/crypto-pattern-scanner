/**
 * Pinch Zoom Hook
 * Handle pinch-to-zoom gestures for image viewer
 * Phase 2: Image Viewer Enhancement (30/12/2024)
 */

import { Gesture } from 'react-native-gesture-handler';
import {
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';

const MIN_SCALE = 1;
const MAX_SCALE = 3;
const SPRING_CONFIG = {
  damping: 15,
  stiffness: 150,
  mass: 1,
};

/**
 * Custom hook for pinch-to-zoom
 * @param {Object} options
 * @param {SharedValue} options.scale - Shared value for scale
 * @param {SharedValue} options.focalX - Shared value for focal X
 * @param {SharedValue} options.focalY - Shared value for focal Y
 * @param {SharedValue} options.translateX - Shared value for translate X
 * @param {SharedValue} options.translateY - Shared value for translate Y
 * @param {Function} options.onZoomChange - Callback when zoom changes
 * @returns {Object} Gesture object
 */
export const usePinchZoom = ({
  scale,
  focalX,
  focalY,
  translateX,
  translateY,
  onZoomChange,
}) => {
  const savedScale = useSharedValue(1);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);
  const initialFocalX = useSharedValue(0);
  const initialFocalY = useSharedValue(0);

  const gesture = Gesture.Pinch()
    .onBegin((event) => {
      'worklet';
      // Save initial values
      savedScale.value = scale.value;
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
      initialFocalX.value = event.focalX;
      initialFocalY.value = event.focalY;
    })
    .onUpdate((event) => {
      'worklet';
      // Calculate new scale
      const newScale = savedScale.value * event.scale;
      scale.value = Math.min(MAX_SCALE, Math.max(MIN_SCALE, newScale));

      // Calculate focal point offset
      if (scale.value > 1) {
        const focalOffsetX = (initialFocalX.value - event.focalX);
        const focalOffsetY = (initialFocalY.value - event.focalY);

        translateX.value = savedTranslateX.value - focalOffsetX;
        translateY.value = savedTranslateY.value - focalOffsetY;
      }

      // Update focal point for display
      focalX.value = event.focalX;
      focalY.value = event.focalY;
    })
    .onEnd(() => {
      'worklet';
      // Snap to bounds
      if (scale.value < MIN_SCALE) {
        scale.value = withSpring(MIN_SCALE, SPRING_CONFIG);
        translateX.value = withSpring(0, SPRING_CONFIG);
        translateY.value = withSpring(0, SPRING_CONFIG);
      } else if (scale.value > MAX_SCALE) {
        scale.value = withSpring(MAX_SCALE, SPRING_CONFIG);
      }

      // Notify zoom change
      if (onZoomChange) {
        runOnJS(onZoomChange)(scale.value);
      }
    });

  return gesture;
};

export default usePinchZoom;
