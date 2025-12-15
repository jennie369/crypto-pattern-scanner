/**
 * Gemral - Image Utilities
 * Helper functions for image processing and validation
 */

import { IMAGE_SPECS, IMAGE_MIME_TYPES } from '../constants/imageConstants';

/**
 * Calculate aspect ratio from dimensions
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @returns {number|null} - Aspect ratio (height/width)
 */
export const calculateAspectRatio = (width, height) => {
  if (!width || !height) return null;
  return parseFloat((height / width).toFixed(2));
};

/**
 * Determine if aspect ratio is supported
 * @param {number} ratio - Aspect ratio to check
 * @returns {boolean} - True if valid
 */
export const isValidAspectRatio = (ratio) => {
  return ratio >= IMAGE_SPECS.MIN_RATIO && ratio <= IMAGE_SPECS.MAX_RATIO;
};

/**
 * Get closest predefined format based on ratio
 * @param {number} ratio - Aspect ratio
 * @returns {Object} - Closest format object
 */
export const getClosestFormat = (ratio) => {
  if (!ratio) return IMAGE_SPECS.OPTIMAL;

  const formats = Object.values(IMAGE_SPECS.FORMATS);
  return formats.reduce((closest, format) => {
    const diff = Math.abs(format.ratio - ratio);
    const closestDiff = Math.abs(closest.ratio - ratio);
    return diff < closestDiff ? format : closest;
  }, IMAGE_SPECS.OPTIMAL);
};

/**
 * Calculate dimensions to fit max resolution while maintaining aspect ratio
 * @param {number} width - Original width
 * @param {number} height - Original height
 * @param {number} maxDimension - Max allowed dimension
 * @returns {Object} - Fitted dimensions {width, height}
 */
export const calculateFitDimensions = (width, height, maxDimension = 1080) => {
  if (!width || !height) return { width: maxDimension, height: maxDimension };

  const ratio = width / height;

  if (width > height) {
    // Landscape
    return {
      width: Math.min(width, maxDimension),
      height: Math.round(Math.min(width, maxDimension) / ratio)
    };
  } else {
    // Portrait or square
    return {
      width: Math.round(Math.min(height, maxDimension) * ratio),
      height: Math.min(height, maxDimension)
    };
  }
};

/**
 * Generate thumbnail dimensions with 3:4 crop for grid view
 * @param {number} originalWidth - Original image width
 * @param {number} originalHeight - Original image height
 * @returns {Object} - Thumbnail specs with crop info
 */
export const getThumbnailDimensions = (originalWidth, originalHeight) => {
  const targetRatio = 3 / 4; // Grid ratio (width/height)
  const sourceRatio = originalWidth / originalHeight;

  let cropWidth, cropHeight;

  if (sourceRatio > targetRatio) {
    // Source is wider, crop width
    cropHeight = originalHeight;
    cropWidth = Math.round(originalHeight * targetRatio);
  } else {
    // Source is taller or same, crop height
    cropWidth = originalWidth;
    cropHeight = Math.round(originalWidth / targetRatio);
  }

  return {
    width: IMAGE_SPECS.SIZES.GRID.width,
    height: IMAGE_SPECS.SIZES.GRID.height,
    cropWidth: Math.min(cropWidth, originalWidth),
    cropHeight: Math.min(cropHeight, originalHeight),
    offsetX: Math.round((originalWidth - Math.min(cropWidth, originalWidth)) / 2),
    offsetY: Math.round((originalHeight - Math.min(cropHeight, originalHeight)) / 2)
  };
};

/**
 * Validate image file type and size
 * @param {Object} file - File object with type and size
 * @returns {Object} - Validation result {valid, errors}
 */
export const validateImageFile = (file) => {
  const errors = [];

  // Check file type (if available)
  if (file.type && !IMAGE_MIME_TYPES.includes(file.type.toLowerCase())) {
    errors.push('Invalid file type. Please use JPEG, PNG, or WebP.');
  }

  // Check file size
  if (file.fileSize && file.fileSize > IMAGE_SPECS.MAX_FILE_SIZE) {
    const maxMB = IMAGE_SPECS.MAX_FILE_SIZE / 1024 / 1024;
    errors.push(`File too large. Maximum size is ${maxMB}MB.`);
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Validate image dimensions
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @returns {Object} - Validation result {valid, errors}
 */
export const validateImageDimensions = (width, height) => {
  const errors = [];

  if (width < IMAGE_SPECS.MIN_DIMENSION || height < IMAGE_SPECS.MIN_DIMENSION) {
    errors.push(`Image too small. Minimum dimension is ${IMAGE_SPECS.MIN_DIMENSION}px.`);
  }

  if (width > IMAGE_SPECS.MAX_DIMENSION || height > IMAGE_SPECS.MAX_DIMENSION) {
    errors.push(`Image too large. Maximum dimension is ${IMAGE_SPECS.MAX_DIMENSION}px.`);
  }

  const ratio = calculateAspectRatio(width, height);
  if (ratio && !isValidAspectRatio(ratio)) {
    errors.push('Aspect ratio not supported. Please use a ratio between 1:2 and 2:1.');
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Format file size for display
 * @param {number} bytes - File size in bytes
 * @returns {string} - Human-readable size
 */
export const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Get format name from ratio
 * @param {number} ratio - Aspect ratio
 * @returns {string} - Format name
 */
export const getFormatName = (ratio) => {
  if (!ratio) return 'Unknown';

  if (Math.abs(ratio - 1) < 0.1) return 'Square';
  if (Math.abs(ratio - 0.8) < 0.1) return 'Instagram (4:5)';
  if (Math.abs(ratio - 0.75) < 0.1) return 'Threads (3:4)';
  if (Math.abs(ratio - 0.5625) < 0.1) return 'Stories (9:16)';
  if (ratio < 1) return 'Landscape';

  return 'Portrait';
};

/**
 * Calculate display height based on screen width and aspect ratio
 * Clamps ratio to prevent extreme heights
 * @param {number} screenWidth - Screen width
 * @param {number} ratio - Aspect ratio (height/width)
 * @param {Object} options - Optional min/max ratio constraints
 * @returns {number} - Display height
 */
export const calculateDisplayHeight = (screenWidth, ratio, options = {}) => {
  const {
    minRatio = IMAGE_SPECS.MIN_RATIO, // 0.5 (landscape)
    maxRatio = IMAGE_SPECS.MAX_RATIO, // 2.0 (tall)
    defaultRatio = 1 // Square if no ratio
  } = options;

  // Use default if no ratio provided
  if (!ratio || isNaN(ratio)) {
    return Math.round(screenWidth * defaultRatio);
  }

  // Clamp ratio to prevent extreme dimensions
  const clampedRatio = Math.max(minRatio, Math.min(ratio, maxRatio));

  return Math.round(screenWidth * clampedRatio);
};

/**
 * Get image height with smart fallback
 * Uses image_width/image_height if available, falls back to image_ratio
 * ENFORCES 1:1 (square) minimum and 3:4 (portrait) maximum ratio
 * Landscape images (16:9, etc.) will be displayed as square (1:1)
 * @param {Object} post - Post object with image data
 * @param {number} containerWidth - Width of container
 * @returns {number} - Calculated height
 */
export const getImageDisplayHeight = (post, containerWidth) => {
  // Feed display constraints:
  // - MIN: 1:1 (square) - landscape images become square
  // - MAX: 3:4 (portrait) - very tall images are capped
  const FEED_MIN_RATIO = 1.0;   // 1:1 square (no landscape)
  const FEED_MAX_RATIO = 1.33;  // 3:4 portrait
  const FEED_DEFAULT_RATIO = 1.0; // Default to square

  let ratio = FEED_DEFAULT_RATIO;

  // If we have explicit dimensions, calculate from them
  if (post.image_width && post.image_height) {
    ratio = post.image_height / post.image_width;
  } else if (post.image_ratio) {
    // If we have stored ratio, use it
    ratio = post.image_ratio;
  }

  // Clamp ratio: no landscape (min 1:1), max 3:4 portrait
  const clampedRatio = Math.max(FEED_MIN_RATIO, Math.min(ratio, FEED_MAX_RATIO));

  return Math.round(containerWidth * clampedRatio);
};

export default {
  calculateAspectRatio,
  isValidAspectRatio,
  getClosestFormat,
  calculateFitDimensions,
  getThumbnailDimensions,
  validateImageFile,
  validateImageDimensions,
  formatFileSize,
  getFormatName,
  calculateDisplayHeight,
  getImageDisplayHeight
};
