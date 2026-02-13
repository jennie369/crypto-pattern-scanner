/**
 * Gemral - Image Constants
 * Instagram-style post image specifications
 */

// Image specifications
export const IMAGE_SPECS = {
  // Optimal format (recommend to users)
  OPTIMAL: {
    ratio: 4 / 5,
    width: 1080,
    height: 1350,
    name: 'Vertical (4:5)'
  },

  // Supported formats
  FORMATS: {
    SQUARE: { ratio: 1, width: 1080, height: 1080, name: 'Square' },
    INSTAGRAM: { ratio: 4 / 5, width: 1080, height: 1350, name: 'Instagram' },
    THREADS: { ratio: 3 / 4, width: 1440, height: 1920, name: 'Threads' },
    LANDSCAPE: { ratio: 1.91, width: 1200, height: 630, name: 'Landscape' },
    STORIES: { ratio: 9 / 16, width: 1080, height: 1920, name: 'Stories' }
  },

  // Constraints
  MAX_FILE_SIZE: 15 * 1024 * 1024, // 15 MB
  MIN_DIMENSION: 320,
  MAX_DIMENSION: 2048,

  // Supported ratios
  MIN_RATIO: 0.5,    // 1:2 (landscape)
  MAX_RATIO: 2.0,    // 2:1 (tall)

  // Quality levels (0-100)
  QUALITY: {
    ORIGINAL: 95,
    HIGH: 90,
    MEDIUM: 85,
    LOW: 70,
    THUMBNAIL: 60,
    PLACEHOLDER: 40
  },

  // Thumbnail sizes
  SIZES: {
    FULL: { width: 1080, height: 1350 },      // Feed full view
    GRID: { width: 1015, height: 1350 },      // Grid 3:4 crop
    MEDIUM: { width: 720, height: 900 },      // List preview
    THUMBNAIL: { width: 360, height: 450 },   // Small preview
    PLACEHOLDER: { width: 50, height: 63 }    // Blur-up
  }
};

// Supported MIME types
export const IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/heic'
];

// Maximum images per post
export const MAX_IMAGES_PER_POST = 10;

// Storage bucket name
export const STORAGE_BUCKET = 'forum-images';

// Image loading states
export const IMAGE_LOAD_STATE = {
  IDLE: 'idle',
  LOADING: 'loading',
  LOADED: 'loaded',
  ERROR: 'error'
};

export default {
  IMAGE_SPECS,
  IMAGE_MIME_TYPES,
  MAX_IMAGES_PER_POST,
  STORAGE_BUCKET,
  IMAGE_LOAD_STATE
};
