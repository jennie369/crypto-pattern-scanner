/**
 * Link Preview Service
 * Service để fetch, cache, và manage link previews
 * Multi-level caching: Memory → AsyncStorage → Supabase
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';
import {
  detectPrimaryUrl,
  normalizeUrl,
  isValidUrl,
  extractDomain,
  isVideoUrl,
  extractYouTubeId,
  getYouTubeThumbnail,
} from '../utils/urlDetector';
import {
  CACHE_DURATION,
  LIMITS,
  PREVIEW_STATUS,
  DEFAULT_FAVICON,
  STORAGE_KEYS,
  CACHE_VERSION,
  EDGE_FUNCTION_NAME,
  ERROR_MESSAGES,
} from '../constants/linkPreview';

// ========== MEMORY CACHE ==========

/**
 * In-memory cache để giảm AsyncStorage reads
 */
const memoryCache = new Map();

/**
 * Timestamp của entries trong memory cache
 */
const memoryCacheTimestamps = new Map();

// ========== HELPER FUNCTIONS ==========

/**
 * Generate cache key từ URL
 */
function getCacheKey(url) {
  const normalized = normalizeUrl(url);
  return normalized ? `preview_${normalized}` : null;
}

/**
 * Check cache còn valid không
 */
function isCacheValid(timestamp, duration) {
  if (!timestamp) return false;
  return Date.now() - timestamp < duration;
}

/**
 * Clean expired entries từ memory cache
 */
function cleanMemoryCache() {
  const now = Date.now();
  const expiredKeys = [];

  memoryCacheTimestamps.forEach((timestamp, key) => {
    if (now - timestamp > CACHE_DURATION.MEMORY) {
      expiredKeys.push(key);
    }
  });

  expiredKeys.forEach(key => {
    memoryCache.delete(key);
    memoryCacheTimestamps.delete(key);
  });

  // Limit cache size
  if (memoryCache.size > LIMITS.MAX_CACHE_ENTRIES) {
    const keysToRemove = Array.from(memoryCache.keys())
      .slice(0, memoryCache.size - LIMITS.MAX_CACHE_ENTRIES);
    keysToRemove.forEach(key => {
      memoryCache.delete(key);
      memoryCacheTimestamps.delete(key);
    });
  }
}

/**
 * Format preview data cho display
 */
function formatPreviewData(data, url) {
  if (!data) return null;

  const domain = extractDomain(url);

  return {
    url: data.url || url,
    domain: data.domain || domain,
    title: data.title || domain,
    description: data.description || null,
    image: data.image_url || data.image || null,
    imageWidth: data.image_width || null,
    imageHeight: data.image_height || null,
    siteName: data.site_name || data.siteName || domain,
    favicon: data.favicon_url || data.favicon || DEFAULT_FAVICON(domain),
    type: data.og_type || data.type || 'website',
    isVideo: data.is_video || isVideoUrl(url),
    videoUrl: data.video_url || null,
    status: data.status || PREVIEW_STATUS.SUCCESS,
    fetchedAt: data.fetched_at || new Date().toISOString(),
  };
}

// ========== MAIN SERVICE FUNCTIONS ==========

/**
 * Fetch link preview với multi-level caching
 * @param {string} url - URL cần fetch preview
 * @param {Object} options - Options
 * @param {boolean} options.forceRefresh - Bỏ qua cache
 * @param {boolean} options.skipMemoryCache - Bỏ qua memory cache
 * @returns {Promise<Object>} Preview data
 */
export async function fetchLinkPreview(url, options = {}) {
  const { forceRefresh = false, skipMemoryCache = false } = options;

  // Validate URL
  const normalizedUrl = normalizeUrl(url);
  if (!normalizedUrl || !isValidUrl(normalizedUrl)) {
    return {
      url,
      status: PREVIEW_STATUS.ERROR,
      error: ERROR_MESSAGES.INVALID_URL,
    };
  }

  const cacheKey = getCacheKey(normalizedUrl);

  // ========== LEVEL 1: MEMORY CACHE ==========
  if (!forceRefresh && !skipMemoryCache && memoryCache.has(cacheKey)) {
    const cached = memoryCache.get(cacheKey);
    const timestamp = memoryCacheTimestamps.get(cacheKey);

    if (isCacheValid(timestamp, CACHE_DURATION.MEMORY)) {
      console.log('[LinkPreview] Memory cache hit:', normalizedUrl);
      return { ...cached, cacheLevel: 'memory' };
    }
  }

  // ========== LEVEL 2: ASYNC STORAGE CACHE ==========
  if (!forceRefresh) {
    try {
      const storageData = await AsyncStorage.getItem(STORAGE_KEYS.LINK_PREVIEW_CACHE);
      if (storageData) {
        const cache = JSON.parse(storageData);
        const entry = cache[cacheKey];

        if (entry && isCacheValid(entry.timestamp, CACHE_DURATION.ASYNC_STORAGE)) {
          console.log('[LinkPreview] AsyncStorage cache hit:', normalizedUrl);

          // Store in memory cache
          memoryCache.set(cacheKey, entry.data);
          memoryCacheTimestamps.set(cacheKey, Date.now());

          return { ...entry.data, cacheLevel: 'storage' };
        }
      }
    } catch (error) {
      console.warn('[LinkPreview] AsyncStorage read error:', error);
    }
  }

  // ========== LEVEL 3: SUPABASE CACHE ==========
  if (!forceRefresh) {
    try {
      const { data: dbCache, error: dbError } = await supabase
        .from('link_previews')
        .select('*')
        .eq('url', normalizedUrl)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (dbCache && !dbError) {
        console.log('[LinkPreview] Supabase cache hit:', normalizedUrl);

        const formattedData = formatPreviewData(dbCache, normalizedUrl);

        // Store in memory & AsyncStorage
        await saveToCache(cacheKey, formattedData);

        return { ...formattedData, cacheLevel: 'database' };
      }
    } catch (error) {
      // PGRST116 = no rows found, not an error
      if (error?.code !== 'PGRST116') {
        console.warn('[LinkPreview] Supabase read error:', error);
      }
    }
  }

  // ========== LEVEL 4: FETCH FRESH DATA ==========
  console.log('[LinkPreview] Fetching fresh:', normalizedUrl);

  try {
    // Special handling for YouTube
    if (isVideoUrl(normalizedUrl)) {
      const youtubeId = extractYouTubeId(normalizedUrl);
      if (youtubeId) {
        const youtubePreview = await fetchYouTubePreview(normalizedUrl, youtubeId);
        if (youtubePreview.status === PREVIEW_STATUS.SUCCESS) {
          await saveToCache(cacheKey, youtubePreview);
          return { ...youtubePreview, cacheLevel: 'fresh' };
        }
      }
    }

    // Call Edge Function
    const { data, error } = await supabase.functions.invoke(EDGE_FUNCTION_NAME, {
      body: { url: normalizedUrl, force_refresh: forceRefresh },
    });

    if (error) {
      throw new Error(error.message || ERROR_MESSAGES.FETCH_FAILED);
    }

    if (!data) {
      throw new Error(ERROR_MESSAGES.NO_PREVIEW);
    }

    // Edge function returns data directly (not wrapped in data.data)
    const formattedData = formatPreviewData(data, normalizedUrl);

    // Save to cache
    await saveToCache(cacheKey, formattedData);

    return { ...formattedData, cacheLevel: 'fresh', cached: data.cached };

  } catch (error) {
    console.error('[LinkPreview] Fetch error:', error);

    // Return error state
    const errorPreview = {
      url: normalizedUrl,
      domain: extractDomain(normalizedUrl),
      title: extractDomain(normalizedUrl),
      description: null,
      image: null,
      siteName: extractDomain(normalizedUrl),
      favicon: DEFAULT_FAVICON(extractDomain(normalizedUrl)),
      type: 'website',
      isVideo: false,
      status: PREVIEW_STATUS.ERROR,
      error: error.message || ERROR_MESSAGES.FETCH_FAILED,
    };

    return errorPreview;
  }
}

/**
 * Fetch YouTube preview với custom handling
 */
async function fetchYouTubePreview(url, videoId) {
  const domain = 'youtube.com';
  const thumbnail = getYouTubeThumbnail(videoId);

  return {
    url,
    domain,
    title: 'YouTube Video',
    description: null,
    image: thumbnail,
    imageWidth: 1280,
    imageHeight: 720,
    siteName: 'YouTube',
    favicon: DEFAULT_FAVICON(domain),
    type: 'video.other',
    isVideo: true,
    videoUrl: url,
    status: PREVIEW_STATUS.SUCCESS,
    fetchedAt: new Date().toISOString(),
  };
}

/**
 * Save preview data to all cache levels
 */
async function saveToCache(cacheKey, data) {
  // Memory cache
  memoryCache.set(cacheKey, data);
  memoryCacheTimestamps.set(cacheKey, Date.now());

  // Clean memory cache
  cleanMemoryCache();

  // AsyncStorage
  try {
    const storageData = await AsyncStorage.getItem(STORAGE_KEYS.LINK_PREVIEW_CACHE);
    const cache = storageData ? JSON.parse(storageData) : {};

    cache[cacheKey] = {
      data,
      timestamp: Date.now(),
      version: CACHE_VERSION,
    };

    // Limit AsyncStorage cache size
    const keys = Object.keys(cache);
    if (keys.length > LIMITS.MAX_CACHE_ENTRIES) {
      const keysToRemove = keys.slice(0, keys.length - LIMITS.MAX_CACHE_ENTRIES);
      keysToRemove.forEach(key => delete cache[key]);
    }

    await AsyncStorage.setItem(STORAGE_KEYS.LINK_PREVIEW_CACHE, JSON.stringify(cache));
  } catch (error) {
    console.warn('[LinkPreview] AsyncStorage write error:', error);
  }
}

/**
 * Clear all link preview caches
 */
export async function clearCache() {
  // Memory cache
  memoryCache.clear();
  memoryCacheTimestamps.clear();

  // AsyncStorage
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.LINK_PREVIEW_CACHE);
  } catch (error) {
    console.warn('[LinkPreview] Clear AsyncStorage error:', error);
  }

  console.log('[LinkPreview] Cache cleared');
}

/**
 * Clear cache cho một URL cụ thể
 */
export async function clearUrlCache(url) {
  const cacheKey = getCacheKey(url);
  if (!cacheKey) return;

  // Memory cache
  memoryCache.delete(cacheKey);
  memoryCacheTimestamps.delete(cacheKey);

  // AsyncStorage
  try {
    const storageData = await AsyncStorage.getItem(STORAGE_KEYS.LINK_PREVIEW_CACHE);
    if (storageData) {
      const cache = JSON.parse(storageData);
      delete cache[cacheKey];
      await AsyncStorage.setItem(STORAGE_KEYS.LINK_PREVIEW_CACHE, JSON.stringify(cache));
    }
  } catch (error) {
    console.warn('[LinkPreview] Clear URL cache error:', error);
  }
}

/**
 * Prefetch multiple URLs (batch)
 */
export async function prefetchPreviews(urls) {
  if (!Array.isArray(urls) || urls.length === 0) {
    return [];
  }

  const limitedUrls = urls.slice(0, LIMITS.MAX_URLS_PER_POST);
  const results = await Promise.allSettled(
    limitedUrls.map(url => fetchLinkPreview(url))
  );

  return results.map((result, index) => ({
    url: limitedUrls[index],
    ...(result.status === 'fulfilled' ? result.value : { status: PREVIEW_STATUS.ERROR }),
  }));
}

/**
 * Get cached preview (không fetch mới)
 */
export function getCachedPreview(url) {
  const cacheKey = getCacheKey(url);
  if (!cacheKey) return null;

  if (memoryCache.has(cacheKey)) {
    const timestamp = memoryCacheTimestamps.get(cacheKey);
    if (isCacheValid(timestamp, CACHE_DURATION.MEMORY)) {
      return memoryCache.get(cacheKey);
    }
  }

  return null;
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  return {
    memoryCacheSize: memoryCache.size,
    memoryCacheKeys: Array.from(memoryCache.keys()),
  };
}

// ========== LEGACY EXPORTS (backwards compatibility) ==========

/**
 * URL regex pattern
 */
export const URL_REGEX = /(https?:\/\/[^\s]+)/gi;

/**
 * Check if text contains a URL
 */
export const containsUrl = (text) => {
  if (!text) return false;
  return URL_REGEX.test(text);
};

/**
 * Extract all URLs from text
 */
export const extractUrls = (text) => {
  if (!text) return [];
  const matches = text.match(URL_REGEX) || [];
  return matches.map(url => url.replace(/[.,;:!?]+$/, ''));
};

/**
 * Extract first URL from text
 */
export const extractFirstUrl = (text) => {
  const urls = extractUrls(text);
  return urls[0] || null;
};

/**
 * Get domain from URL
 */
export const getDomain = extractDomain;

/**
 * Platform patterns for special handling
 */
const PLATFORM_PATTERNS = {
  youtube: /(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/,
  twitter: /(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/,
  instagram: /instagram\.com\/p\/([\w-]+)/,
  tiktok: /tiktok\.com\/@[\w.-]+\/video\/(\d+)/,
  facebook: /facebook\.com\/[\w.-]+\/posts\/(\d+)/,
  github: /github\.com\/([\w-]+)\/([\w.-]+)/,
};

/**
 * Detect platform from URL
 */
export const detectPlatform = (url) => {
  for (const [platform, pattern] of Object.entries(PLATFORM_PATTERNS)) {
    if (pattern.test(url)) {
      return platform;
    }
  }
  return null;
};

/**
 * Platform icons
 */
const PLATFORM_ICONS = {
  youtube: { name: 'logo-youtube', color: '#FF0000' },
  twitter: { name: 'logo-twitter', color: '#1DA1F2' },
  instagram: { name: 'logo-instagram', color: '#E4405F' },
  tiktok: { name: 'logo-tiktok', color: '#000000' },
  facebook: { name: 'logo-facebook', color: '#1877F2' },
  github: { name: 'logo-github', color: '#181717' },
};

/**
 * Get platform icon
 */
export const getPlatformIcon = (platform) => {
  return PLATFORM_ICONS[platform] || null;
};

/**
 * Legacy fetchPreview alias
 */
export const fetchPreview = fetchLinkPreview;

/**
 * Batch fetch previews (legacy)
 */
export const batchFetchPreviews = async (urls) => {
  const results = new Map();
  const previews = await prefetchPreviews(urls);

  previews.forEach(preview => {
    if (preview && preview.url) {
      results.set(preview.url, preview);
    }
  });

  return results;
};

/**
 * Get YouTube thumbnail
 */
export { getYouTubeThumbnail };

// ========== DEFAULT EXPORT ==========

export default {
  fetchLinkPreview,
  fetchPreview,
  clearCache,
  clearUrlCache,
  prefetchPreviews,
  batchFetchPreviews,
  getCachedPreview,
  getCacheStats,
  extractUrls,
  extractFirstUrl,
  containsUrl,
  getDomain,
  detectPlatform,
  getPlatformIcon,
  getYouTubeThumbnail,
};
