/**
 * Link Preview Constants & Config
 * Configuration cho link preview feature
 */

/**
 * Cache duration trong milliseconds
 */
export const CACHE_DURATION = {
  MEMORY: 5 * 60 * 1000,              // 5 phút - memory cache
  ASYNC_STORAGE: 24 * 60 * 60 * 1000, // 24 giờ - AsyncStorage
  DATABASE: 7 * 24 * 60 * 60 * 1000,  // 7 ngày - Supabase
};

/**
 * Giới hạn và timeouts
 */
export const LIMITS = {
  FETCH_TIMEOUT: 5000,           // 5 seconds
  MAX_TITLE_LENGTH: 100,         // Max chars for title display
  MAX_DESCRIPTION_LENGTH: 200,   // Max chars for description
  MAX_URLS_PER_POST: 5,          // Max URLs to detect per post
  MAX_CACHE_ENTRIES: 100,        // Max entries in memory cache
  DEBOUNCE_MS: 300,              // Debounce for URL detection
};

/**
 * Image dimensions cho preview card
 */
export const IMAGE_DIMENSIONS = {
  CARD_IMAGE_RATIO: 1.91,        // Standard OG ratio (1200/630)
  CARD_MAX_WIDTH: 400,           // Max card width on mobile
  CARD_MIN_HEIGHT: 80,           // Min card height
  CARD_IMAGE_HEIGHT: 200,        // Default image height
  THUMBNAIL_SIZE: 60,            // Compact thumbnail size
};

/**
 * Preview status types
 */
export const PREVIEW_STATUS = {
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
  TIMEOUT: 'timeout',
  NO_OG: 'no_og',
  BLOCKED: 'blocked',
  CACHED: 'cached',
};

/**
 * Placeholder images cho các trường hợp đặc biệt
 */
export const PLACEHOLDER_IMAGES = {
  DEFAULT: 'https://via.placeholder.com/1200x630/112250/FFBD59?text=No+Preview',
  ERROR: 'https://via.placeholder.com/1200x630/9C0612/FFFFFF?text=Error',
  VIDEO: 'https://via.placeholder.com/1200x630/112250/00F0FF?text=Video',
  SOCIAL: 'https://via.placeholder.com/1200x630/112250/6A5BFF?text=Social',
};

/**
 * Fallback favicon
 */
export const DEFAULT_FAVICON = (domain) =>
  `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;

/**
 * AsyncStorage keys
 */
export const STORAGE_KEYS = {
  LINK_PREVIEW_CACHE: '@gem_link_previews',
  LINK_PREVIEW_VERSION: '@gem_link_preview_version',
};

/**
 * Cache version để invalidate khi cần
 */
export const CACHE_VERSION = '1.0.0';

/**
 * Edge Function name (matches Phase 1)
 */
export const EDGE_FUNCTION_NAME = 'fetch-link-preview';

/**
 * Error messages
 */
export const ERROR_MESSAGES = {
  FETCH_FAILED: 'Không thể tải thông tin link',
  INVALID_URL: 'Link không hợp lệ',
  TIMEOUT: 'Hết thời gian chờ',
  BLOCKED: 'Link bị chặn',
  NETWORK_ERROR: 'Lỗi kết nối mạng',
  NO_PREVIEW: 'Không có preview',
};

/**
 * Tooltips/subtitles cho UI components
 */
export const UI_TOOLTIPS = {
  LINK_PREVIEW_CARD: 'Nhấn để mở link trong trình duyệt',
  PREVIEW_LOADING: 'Đang tải thông tin link...',
  PREVIEW_ERROR: 'Không thể tải preview, nhấn để thử lại',
  REMOVE_PREVIEW: 'Xóa link preview',
  OPEN_EXTERNAL: 'Mở trong trình duyệt ngoài',
  COPY_LINK: 'Sao chép đường dẫn',
};

export default {
  CACHE_DURATION,
  LIMITS,
  IMAGE_DIMENSIONS,
  PREVIEW_STATUS,
  PLACEHOLDER_IMAGES,
  DEFAULT_FAVICON,
  STORAGE_KEYS,
  CACHE_VERSION,
  EDGE_FUNCTION_NAME,
  ERROR_MESSAGES,
  UI_TOOLTIPS,
};
