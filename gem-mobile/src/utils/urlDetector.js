/**
 * URL Detector Utility
 * Phát hiện và extract URLs từ text content
 */

/**
 * Regex pattern để detect URLs trong text
 * Hỗ trợ: http, https, ftp, và domain thuần (example.com)
 */
const URL_REGEX = /(?:(?:https?|ftp):\/\/)?(?:[\w-]+\.)+[a-z]{2,}(?:\/[^\s]*)?/gi;

/**
 * Regex chặt chẽ hơn để validate URL format
 */
const STRICT_URL_REGEX = /^(?:(?:https?|ftp):\/\/)?(?:[\w-]+\.)+[a-z]{2,}(?::\d{1,5})?(?:\/[^\s]*)?$/i;

/**
 * Danh sách TLDs phổ biến để validate domain
 */
const COMMON_TLDS = [
  'com', 'org', 'net', 'io', 'co', 'vn', 'edu', 'gov', 'info', 'biz',
  'me', 'app', 'dev', 'ai', 'xyz', 'online', 'store', 'tech', 'site',
  'blog', 'live', 'tv', 'news', 'social', 'cloud', 'digital', 'asia',
];

/**
 * Domains nên bỏ qua (không hiển thị preview)
 */
const SKIP_DOMAINS = [
  'localhost',
  '127.0.0.1',
  '0.0.0.0',
  'example.com',
  'test.com',
];

/**
 * Domains đặc biệt cần xử lý riêng (video platforms)
 */
const VIDEO_DOMAINS = [
  'youtube.com',
  'youtu.be',
  'vimeo.com',
  'tiktok.com',
  'facebook.com/watch',
  'fb.watch',
  'twitch.tv',
  'dailymotion.com',
];

/**
 * Domains social media cần xử lý đặc biệt
 */
const SOCIAL_DOMAINS = [
  'twitter.com',
  'x.com',
  'instagram.com',
  'threads.net',
  'facebook.com',
  'linkedin.com',
  'pinterest.com',
  'reddit.com',
];

// ========== MAIN FUNCTIONS ==========

/**
 * Detect tất cả URLs trong text
 * @param {string} text - Text content cần scan
 * @returns {string[]} Array of detected URLs
 */
export function detectUrls(text) {
  if (!text || typeof text !== 'string') {
    return [];
  }

  const matches = text.match(URL_REGEX);
  if (!matches) {
    return [];
  }

  // Normalize và filter unique
  const normalized = matches
    .map(url => normalizeUrl(url))
    .filter(url => url !== null && isValidUrl(url))
    .filter((url, index, self) => self.indexOf(url) === index); // Unique

  return normalized;
}

/**
 * Detect và lấy URL đầu tiên (primary) trong text
 * @param {string} text - Text content cần scan
 * @returns {string|null} Primary URL hoặc null
 */
export function detectPrimaryUrl(text) {
  const urls = detectUrls(text);
  return urls.length > 0 ? urls[0] : null;
}

/**
 * Normalize URL - thêm protocol, lowercase, clean
 * @param {string} url - URL cần normalize
 * @returns {string|null} Normalized URL hoặc null nếu invalid
 */
export function normalizeUrl(url) {
  if (!url || typeof url !== 'string') {
    return null;
  }

  let normalized = url.trim();

  // Remove trailing punctuation
  normalized = normalized.replace(/[.,;:!?\)\]]+$/, '');

  // Thêm protocol nếu thiếu
  if (!normalized.startsWith('http://') &&
      !normalized.startsWith('https://') &&
      !normalized.startsWith('ftp://')) {
    normalized = 'https://' + normalized;
  }

  try {
    const urlObj = new URL(normalized);

    // Lowercase hostname
    urlObj.hostname = urlObj.hostname.toLowerCase();

    // Remove tracking parameters
    const trackingParams = [
      'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
      'fbclid', 'gclid', 'ref', 'source', 'mc_cid', 'mc_eid', '_ga',
      'igshid', 'si', 'feature', 'app', 'ref_src',
    ];

    trackingParams.forEach(param => {
      urlObj.searchParams.delete(param);
    });

    // Build final URL
    let result = urlObj.toString();

    // Remove trailing slash for root paths
    if (urlObj.pathname === '/' && !result.includes('?')) {
      result = result.slice(0, -1);
    }

    return result;
  } catch (error) {
    console.warn('[urlDetector] Invalid URL:', url, error.message);
    return null;
  }
}

/**
 * Validate URL format
 * @param {string} url - URL cần validate
 * @returns {boolean} True nếu valid
 */
export function isValidUrl(url) {
  if (!url || typeof url !== 'string') {
    return false;
  }

  // Check basic format
  if (!STRICT_URL_REGEX.test(url)) {
    return false;
  }

  try {
    const urlObj = new URL(url);

    // Check protocol
    if (!['http:', 'https:', 'ftp:'].includes(urlObj.protocol)) {
      return false;
    }

    // Check hostname có TLD
    const hostname = urlObj.hostname;
    const parts = hostname.split('.');
    if (parts.length < 2) {
      return false;
    }

    // Check skip domains
    if (SKIP_DOMAINS.some(domain => hostname.includes(domain))) {
      return false;
    }

    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Extract domain từ URL
 * @param {string} url - URL cần extract domain
 * @returns {string} Domain (không có www.)
 */
export function extractDomain(url) {
  if (!url) return '';

  try {
    const urlObj = new URL(url);
    let domain = urlObj.hostname;

    // Remove www.
    if (domain.startsWith('www.')) {
      domain = domain.slice(4);
    }

    return domain;
  } catch (error) {
    return '';
  }
}

/**
 * Kiểm tra URL có phải video platform không
 * @param {string} url - URL cần check
 * @returns {boolean} True nếu là video platform
 */
export function isVideoUrl(url) {
  if (!url) return false;

  const domain = extractDomain(url);
  return VIDEO_DOMAINS.some(videoDomain =>
    domain === videoDomain || domain.endsWith('.' + videoDomain)
  );
}

/**
 * Kiểm tra URL có phải social media không
 * @param {string} url - URL cần check
 * @returns {boolean} True nếu là social platform
 */
export function isSocialUrl(url) {
  if (!url) return false;

  const domain = extractDomain(url);
  return SOCIAL_DOMAINS.some(socialDomain =>
    domain === socialDomain || domain.endsWith('.' + socialDomain)
  );
}

/**
 * Lấy thông tin chi tiết về URL
 * @param {string} url - URL cần analyze
 * @returns {Object} URL info object
 */
export function getUrlInfo(url) {
  const normalized = normalizeUrl(url);

  if (!normalized) {
    return {
      valid: false,
      original: url,
      normalized: null,
      domain: null,
      isVideo: false,
      isSocial: false,
      type: 'invalid',
    };
  }

  const domain = extractDomain(normalized);
  const isVideo = isVideoUrl(normalized);
  const isSocial = isSocialUrl(normalized);

  let type = 'website';
  if (isVideo) type = 'video';
  else if (isSocial) type = 'social';

  return {
    valid: true,
    original: url,
    normalized,
    domain,
    isVideo,
    isSocial,
    type,
  };
}

/**
 * Extract video ID từ YouTube URL
 * @param {string} url - YouTube URL
 * @returns {string|null} Video ID hoặc null
 */
export function extractYouTubeId(url) {
  if (!url) return null;

  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * Build YouTube thumbnail URL từ video ID
 * @param {string} videoId - YouTube video ID
 * @param {string} quality - Thumbnail quality: default, medium, high, maxres
 * @returns {string} Thumbnail URL
 */
export function getYouTubeThumbnail(videoId, quality = 'maxresdefault') {
  if (!videoId) return null;
  return `https://img.youtube.com/vi/${videoId}/${quality}.jpg`;
}

/**
 * Replace URLs trong text bằng placeholder hoặc link component
 * @param {string} text - Text chứa URLs
 * @param {Function} replacer - Function thay thế (url) => replacement
 * @returns {string} Text đã replace
 */
export function replaceUrls(text, replacer) {
  if (!text || typeof replacer !== 'function') {
    return text;
  }

  return text.replace(URL_REGEX, (match) => {
    const normalized = normalizeUrl(match);
    if (normalized && isValidUrl(normalized)) {
      return replacer(normalized, match);
    }
    return match;
  });
}

/**
 * Check if text contains any URL
 * @param {string} text - Text to check
 * @returns {boolean} True if contains URL
 */
export function containsUrl(text) {
  if (!text || typeof text !== 'string') {
    return false;
  }
  return URL_REGEX.test(text);
}

// ========== EXPORTS ==========

export default {
  detectUrls,
  detectPrimaryUrl,
  normalizeUrl,
  isValidUrl,
  extractDomain,
  isVideoUrl,
  isSocialUrl,
  getUrlInfo,
  extractYouTubeId,
  getYouTubeThumbnail,
  replaceUrls,
  containsUrl,
  URL_REGEX,
  VIDEO_DOMAINS,
  SOCIAL_DOMAINS,
};
