/**
 * Image Viewer Utilities
 * Helper functions for image viewer gestures and calculations
 * Phase 2: Image Viewer Enhancement (30/12/2024)
 */

import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * Calculate image dimensions to fit screen while maintaining aspect ratio
 * @param {number} imageWidth - Original image width
 * @param {number} imageHeight - Original image height
 * @param {number} containerWidth - Container width (default: screen width)
 * @param {number} containerHeight - Container height (default: screen height)
 * @returns {Object} { width, height, scale }
 */
export const calculateImageFit = (
  imageWidth,
  imageHeight,
  containerWidth = SCREEN_WIDTH,
  containerHeight = SCREEN_HEIGHT
) => {
  if (!imageWidth || !imageHeight) {
    return { width: containerWidth, height: containerWidth, scale: 1 };
  }

  const imageAspectRatio = imageWidth / imageHeight;
  const containerAspectRatio = containerWidth / containerHeight;

  let width, height;

  if (imageAspectRatio > containerAspectRatio) {
    // Image is wider than container
    width = containerWidth;
    height = containerWidth / imageAspectRatio;
  } else {
    // Image is taller than container
    height = containerHeight;
    width = containerHeight * imageAspectRatio;
  }

  return {
    width,
    height,
    scale: width / imageWidth,
  };
};

/**
 * Calculate focal point offset for zoom
 * @param {number} focalX - Focal point X
 * @param {number} focalY - Focal point Y
 * @param {number} imageWidth - Image width
 * @param {number} imageHeight - Image height
 * @param {number} scale - Target scale
 * @returns {Object} { offsetX, offsetY }
 */
export const calculateFocalPointOffset = (
  focalX,
  focalY,
  imageWidth,
  imageHeight,
  scale
) => {
  // Calculate offset needed to keep focal point at same screen position
  const offsetX = (SCREEN_WIDTH / 2 - focalX) * (scale - 1);
  const offsetY = (SCREEN_HEIGHT / 2 - focalY) * (scale - 1);

  return { offsetX, offsetY };
};

/**
 * Clamp pan offset to keep image in bounds
 * @param {number} translateX - Current X translation
 * @param {number} translateY - Current Y translation
 * @param {number} imageWidth - Image display width
 * @param {number} imageHeight - Image display height
 * @param {number} scale - Current scale
 * @returns {Object} { x, y } clamped values
 */
export const clampPanOffset = (
  translateX,
  translateY,
  imageWidth,
  imageHeight,
  scale
) => {
  'worklet';
  const scaledWidth = imageWidth * scale;
  const scaledHeight = imageHeight * scale;

  // Calculate max pan distance
  const maxX = Math.max(0, (scaledWidth - SCREEN_WIDTH) / 2);
  const maxY = Math.max(0, (scaledHeight - SCREEN_HEIGHT) / 2);

  return {
    x: Math.max(-maxX, Math.min(maxX, translateX)),
    y: Math.max(-maxY, Math.min(maxY, translateY)),
  };
};

/**
 * Calculate velocity-based dismiss
 * @param {number} velocityY - Vertical velocity
 * @param {number} translateY - Current Y translation
 * @returns {boolean} Should dismiss
 */
export const shouldDismiss = (velocityY, translateY) => {
  'worklet';
  const VELOCITY_THRESHOLD = 500;
  const DISTANCE_THRESHOLD = 100;

  return Math.abs(velocityY) > VELOCITY_THRESHOLD || Math.abs(translateY) > DISTANCE_THRESHOLD;
};

/**
 * Calculate background opacity based on drag distance
 * @param {number} translateY - Current Y translation
 * @returns {number} Opacity 0-1
 */
export const calculateBackgroundOpacity = (translateY) => {
  'worklet';
  const maxDrag = 300;
  const drag = Math.abs(translateY);
  return Math.max(0, 1 - drag / maxDrag);
};

/**
 * Calculate scale based on drag distance
 * @param {number} translateY - Current Y translation
 * @returns {number} Scale 0.8-1
 */
export const calculateDragScale = (translateY) => {
  'worklet';
  const maxDrag = 300;
  const minScale = 0.8;
  const drag = Math.abs(translateY);
  return Math.max(minScale, 1 - (drag / maxDrag) * (1 - minScale));
};

/**
 * Get screen dimensions (useful for orientation changes)
 * @returns {Object} { width, height }
 */
export const getScreenDimensions = () => {
  const { width, height } = Dimensions.get('window');
  return { width, height };
};

export default {
  calculateImageFit,
  calculateFocalPointOffset,
  clampPanOffset,
  shouldDismiss,
  calculateBackgroundOpacity,
  calculateDragScale,
  getScreenDimensions,
};
