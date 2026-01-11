/**
 * Gemral - Cache Service
 *
 * Manages offline caching for app data
 * Supports TTL-based expiration and automatic cleanup
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// NetInfo import with fallback for when native module is not linked
let NetInfo = null;
try {
  NetInfo = require('@react-native-community/netinfo').default;
} catch (e) {
  console.warn('[CacheService] NetInfo not available, assuming always online');
  // Mock NetInfo when not available
  NetInfo = {
    fetch: async () => ({ isConnected: true, isInternetReachable: true }),
    addEventListener: () => () => {}, // Returns unsubscribe function
  };
}

// Cache keys
const CACHE_KEYS = {
  USER_PROFILE: '@gem_cache_profile',
  RECENT_SCANS: '@gem_cache_scans',
  GOALS: '@gem_cache_goals',
  LAST_TAROT: '@gem_cache_tarot',
  LAST_ICHING: '@gem_cache_iching',
  FORUM_POSTS: '@gem_cache_forum',
  PRODUCTS: '@gem_cache_products',
  COURSES: '@gem_cache_courses',
  ACHIEVEMENTS: '@gem_cache_achievements',
};

// TTL (Time To Live) in milliseconds
const TTL_CONFIG = {
  USER_PROFILE: 24 * 60 * 60 * 1000,     // 24 hours
  RECENT_SCANS: 1 * 60 * 60 * 1000,      // 1 hour
  GOALS: 24 * 60 * 60 * 1000,            // 24 hours
  LAST_TAROT: 7 * 24 * 60 * 60 * 1000,   // 7 days
  LAST_ICHING: 7 * 24 * 60 * 60 * 1000,  // 7 days
  FORUM_POSTS: 15 * 60 * 1000,           // 15 minutes
  PRODUCTS: 15 * 60 * 1000,              // 15 minutes
  COURSES: 1 * 60 * 60 * 1000,           // 1 hour
  ACHIEVEMENTS: 24 * 60 * 60 * 1000,     // 24 hours
};

// Network state
let isOnline = true;
let networkListenerUnsubscribe = null;

class CacheService {
  constructor() {
    this._initialized = false;
  }

  /**
   * Initialize cache service
   * Sets up network listener
   */
  async initialize() {
    if (this._initialized) return;

    try {
      // Check initial network state
      const state = await NetInfo.fetch();
      isOnline = state.isConnected && state.isInternetReachable;

      // Subscribe to network changes
      networkListenerUnsubscribe = NetInfo.addEventListener((state) => {
        const wasOnline = isOnline;
        isOnline = state.isConnected && state.isInternetReachable;

        if (!wasOnline && isOnline) {
          console.log('[CacheService] Back online');
          // Could trigger sync here if needed
        } else if (wasOnline && !isOnline) {
          console.log('[CacheService] Went offline');
        }
      });

      this._initialized = true;
      console.log('[CacheService] Initialized, online:', isOnline);
    } catch (error) {
      console.error('[CacheService] Initialize error:', error);
      this._initialized = true;
    }
  }

  /**
   * Cleanup network listener
   */
  cleanup() {
    if (networkListenerUnsubscribe) {
      networkListenerUnsubscribe();
      networkListenerUnsubscribe = null;
    }
    this._initialized = false;
  }

  /**
   * Check if device is online
   * @returns {boolean}
   */
  isOnline() {
    return isOnline;
  }

  /**
   * Get data from cache
   * @param {string} key - Cache key from CACHE_KEYS
   * @returns {any|null} Cached data or null if expired/missing
   */
  async get(key) {
    try {
      const cacheKey = CACHE_KEYS[key] || key;
      const cached = await AsyncStorage.getItem(cacheKey);

      if (!cached) return null;

      const { data, timestamp, ttl } = JSON.parse(cached);
      const age = Date.now() - timestamp;

      // Check if expired
      if (ttl && age > ttl) {
        console.log(`[CacheService] Cache expired for ${key}, age: ${Math.round(age / 1000)}s`);
        await this.remove(key);
        return null;
      }

      return data;
    } catch (error) {
      console.error(`[CacheService] Get error for ${key}:`, error);
      return null;
    }
  }

  /**
   * Set data in cache
   * @param {string} key - Cache key from CACHE_KEYS
   * @param {any} data - Data to cache
   * @param {number} customTTL - Optional custom TTL in ms
   */
  async set(key, data, customTTL = null) {
    try {
      const cacheKey = CACHE_KEYS[key] || key;
      const ttl = customTTL || TTL_CONFIG[key] || 60 * 60 * 1000; // Default 1 hour

      const cacheEntry = {
        data,
        timestamp: Date.now(),
        ttl,
      };

      await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheEntry));
      console.log(`[CacheService] Cached ${key}, TTL: ${Math.round(ttl / 1000)}s`);
    } catch (error) {
      console.error(`[CacheService] Set error for ${key}:`, error);
    }
  }

  /**
   * Remove data from cache
   * @param {string} key - Cache key
   */
  async remove(key) {
    try {
      const cacheKey = CACHE_KEYS[key] || key;
      await AsyncStorage.removeItem(cacheKey);
    } catch (error) {
      console.error(`[CacheService] Remove error for ${key}:`, error);
    }
  }

  /**
   * Clear all cache
   */
  async clearAll() {
    try {
      const keys = Object.values(CACHE_KEYS);
      await AsyncStorage.multiRemove(keys);
      console.log('[CacheService] All cache cleared');
    } catch (error) {
      console.error('[CacheService] Clear all error:', error);
    }
  }

  /**
   * Get cache with fallback to fresh data
   * @param {string} key - Cache key
   * @param {function} fetcher - Async function to fetch fresh data
   * @param {boolean} forceRefresh - Force refresh ignoring cache
   * @returns {object} { data, fromCache, error }
   */
  async getWithFallback(key, fetcher, forceRefresh = false) {
    try {
      // If offline, always use cache
      if (!isOnline) {
        const cached = await this.get(key);
        return {
          data: cached,
          fromCache: true,
          offline: true,
          error: cached ? null : 'Không có dữ liệu offline',
        };
      }

      // Try cache first (unless force refresh)
      if (!forceRefresh) {
        const cached = await this.get(key);
        if (cached !== null) {
          // Return cached data but also refresh in background
          this._refreshInBackground(key, fetcher);
          return { data: cached, fromCache: true, error: null };
        }
      }

      // Fetch fresh data
      const freshData = await fetcher();
      if (freshData !== null && freshData !== undefined) {
        await this.set(key, freshData);
      }

      return { data: freshData, fromCache: false, error: null };
    } catch (error) {
      console.error(`[CacheService] getWithFallback error for ${key}:`, error);

      // On error, try to return cached data
      const cached = await this.get(key);
      if (cached !== null) {
        return { data: cached, fromCache: true, error: error.message };
      }

      return { data: null, fromCache: false, error: error.message };
    }
  }

  /**
   * Refresh cache in background (fire and forget)
   * @private
   */
  async _refreshInBackground(key, fetcher) {
    try {
      const freshData = await fetcher();
      if (freshData !== null && freshData !== undefined) {
        await this.set(key, freshData);
      }
    } catch (error) {
      // Silent fail for background refresh
      console.log(`[CacheService] Background refresh failed for ${key}`);
    }
  }

  /**
   * Get cache age in seconds
   * @param {string} key - Cache key
   * @returns {number|null} Age in seconds or null
   */
  async getCacheAge(key) {
    try {
      const cacheKey = CACHE_KEYS[key] || key;
      const cached = await AsyncStorage.getItem(cacheKey);

      if (!cached) return null;

      const { timestamp } = JSON.parse(cached);
      return Math.round((Date.now() - timestamp) / 1000);
    } catch (error) {
      return null;
    }
  }

  /**
   * Check if cache is stale (expired or close to expiring)
   * @param {string} key - Cache key
   * @param {number} threshold - Threshold in ms before considering stale
   * @returns {boolean}
   */
  async isStale(key, threshold = 5 * 60 * 1000) {
    try {
      const cacheKey = CACHE_KEYS[key] || key;
      const cached = await AsyncStorage.getItem(cacheKey);

      if (!cached) return true;

      const { timestamp, ttl } = JSON.parse(cached);
      const age = Date.now() - timestamp;
      const effectiveTTL = ttl || TTL_CONFIG[key] || 60 * 60 * 1000;

      return age > (effectiveTTL - threshold);
    } catch (error) {
      return true;
    }
  }

  /**
   * Preload common data into cache
   * Call this after user login
   * @param {function} profileFetcher - Function to fetch profile
   * @param {function} goalsFetcher - Function to fetch goals
   */
  async preloadUserData(profileFetcher, goalsFetcher) {
    if (!isOnline) return;

    try {
      const promises = [];

      if (profileFetcher) {
        promises.push(
          profileFetcher().then(data => data && this.set('USER_PROFILE', data))
        );
      }

      if (goalsFetcher) {
        promises.push(
          goalsFetcher().then(data => data && this.set('GOALS', data))
        );
      }

      await Promise.all(promises);
      console.log('[CacheService] User data preloaded');
    } catch (error) {
      console.error('[CacheService] Preload error:', error);
    }
  }

  /**
   * Get cache statistics
   * @returns {object} Cache stats
   */
  async getStats() {
    try {
      const stats = {
        keys: [],
        totalSize: 0,
        oldestCache: null,
        newestCache: null,
      };

      for (const [name, key] of Object.entries(CACHE_KEYS)) {
        const cached = await AsyncStorage.getItem(key);
        if (cached) {
          const { timestamp, ttl } = JSON.parse(cached);
          const size = cached.length;
          const age = Date.now() - timestamp;

          stats.keys.push({
            name,
            size,
            age: Math.round(age / 1000),
            ttl: Math.round((ttl || TTL_CONFIG[name]) / 1000),
            isExpired: age > (ttl || TTL_CONFIG[name]),
          });

          stats.totalSize += size;

          if (!stats.oldestCache || timestamp < stats.oldestCache) {
            stats.oldestCache = timestamp;
          }
          if (!stats.newestCache || timestamp > stats.newestCache) {
            stats.newestCache = timestamp;
          }
        }
      }

      return stats;
    } catch (error) {
      console.error('[CacheService] Get stats error:', error);
      return { keys: [], totalSize: 0 };
    }
  }
}

// Export singleton instance
const cacheService = new CacheService();

// Export keys for direct access
export { CACHE_KEYS, TTL_CONFIG };
export default cacheService;
