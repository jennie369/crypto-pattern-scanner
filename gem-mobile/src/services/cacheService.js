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
  // Messaging cache keys
  CONVERSATIONS: '@gem_cache_conversations',
  PINNED_CONVERSATIONS: '@gem_cache_pinned_convos',
  ARCHIVED_CONVERSATIONS: '@gem_cache_archived_convos',
  DELETED_CONVERSATIONS: '@gem_cache_deleted_convos',
  // GEM Master Chatbot Enhancement keys
  CHATBOT_PROFILE: '@gem_cache_chatbot_profile',
  RECENT_MEMORIES: '@gem_cache_memories',
  RITUALS: '@gem_cache_rituals',
  TODAY_RITUALS: '@gem_cache_today_rituals',
  STREAKS: '@gem_cache_streaks',
  GAMIFICATION: '@gem_cache_gamification',
  PENDING_MESSAGES: '@gem_cache_pending_messages',
  EMOTION_STATE: '@gem_cache_emotion',
  TOOLTIPS_SEEN: '@gem_cache_tooltips',
  FEATURE_USAGE: '@gem_cache_feature_usage',
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
  // Messaging TTLs
  CONVERSATIONS: 5 * 60 * 1000,          // 5 minutes
  PINNED_CONVERSATIONS: 15 * 60 * 1000,  // 15 minutes
  ARCHIVED_CONVERSATIONS: 15 * 60 * 1000, // 15 minutes
  // GEM Master Chatbot Enhancement TTLs
  CHATBOT_PROFILE: 5 * 60 * 1000,        // 5 minutes
  RECENT_MEMORIES: 2 * 60 * 1000,        // 2 minutes
  RITUALS: 5 * 60 * 1000,                // 5 minutes
  TODAY_RITUALS: 1 * 60 * 1000,          // 1 minute
  STREAKS: 1 * 60 * 1000,                // 1 minute
  GAMIFICATION: 2 * 60 * 1000,           // 2 minutes
  PENDING_MESSAGES: 1 * 60 * 1000,       // 1 minute
  EMOTION_STATE: 30 * 1000,              // 30 seconds
  TOOLTIPS_SEEN: -1,                     // Permanent (no expiration)
  FEATURE_USAGE: 30 * 1000,              // 30 seconds
};

// Memory cache size limit to prevent unbounded growth
const MAX_MEMORY_CACHE_SIZE = 100;

// Network state
let isOnline = true;
let networkListenerUnsubscribe = null;

class CacheService {
  constructor() {
    this._initialized = false;
    this._memoryCache = new Map(); // In-memory cache for fast access
    this._hitCount = 0;
    this._missCount = 0;
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

  // ============================================================
  // USER-SPECIFIC CACHE METHODS (for GEM Master Chatbot)
  // ============================================================

  /**
   * Get user-specific data from cache
   * @param {string} key - Cache key from CACHE_KEYS
   * @param {string} userId - User ID
   * @returns {any|null} Cached data or null
   */
  async getForUser(key, userId) {
    if (!userId) return null;
    const userKey = `${key}_${userId}`;
    return this.get(userKey);
  }

  /**
   * Set user-specific data in cache
   * @param {string} key - Cache key from CACHE_KEYS
   * @param {string} userId - User ID
   * @param {any} data - Data to cache
   */
  async setForUser(key, userId, data) {
    if (!userId) return;
    const userKey = `${key}_${userId}`;
    await this.set(userKey, data);
  }

  /**
   * Remove user-specific data from cache
   * @param {string} key - Cache key
   * @param {string} userId - User ID
   */
  async removeForUser(key, userId) {
    if (!userId) return;
    const userKey = `${key}_${userId}`;
    await this.remove(userKey);
  }

  /**
   * Clear all cache for a specific user
   * @param {string} userId - User ID
   */
  async clearUserCache(userId) {
    if (!userId) return;

    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const userKeys = allKeys.filter(k => k.includes(`_${userId}`));
      if (userKeys.length > 0) {
        await AsyncStorage.multiRemove(userKeys);
      }

      // Also clear memory cache for user
      for (const [key] of this._memoryCache) {
        if (key.includes(`_${userId}`)) {
          this._memoryCache.delete(key);
        }
      }

      console.log(`[CacheService] Cleared cache for user ${userId}`);
    } catch (error) {
      console.error('[CacheService] Clear user cache error:', error);
    }
  }

  /**
   * Get from memory cache (ultra-fast, no async)
   * @param {string} key - Cache key
   * @param {string} userId - Optional user ID
   * @returns {any|null} Cached data or null
   */
  getFromMemory(key, userId = null) {
    const cacheKey = userId ? `${key}_${userId}` : key;
    const cached = this._memoryCache.get(cacheKey);

    if (!cached) {
      this._missCount++;
      return null;
    }

    const ttl = TTL_CONFIG[key] || 60 * 1000;
    if (ttl !== -1 && Date.now() - cached.timestamp > ttl) {
      this._memoryCache.delete(cacheKey);
      this._missCount++;
      return null;
    }

    this._hitCount++;
    return cached.data;
  }

  /**
   * Set in memory cache (ultra-fast, no async)
   * Evicts oldest entries when cache exceeds MAX_MEMORY_CACHE_SIZE
   * @param {string} key - Cache key
   * @param {any} data - Data to cache
   * @param {string} userId - Optional user ID
   */
  setInMemory(key, data, userId = null) {
    const cacheKey = userId ? `${key}_${userId}` : key;

    // Evict oldest entries if at capacity (and not replacing existing)
    if (!this._memoryCache.has(cacheKey) && this._memoryCache.size >= MAX_MEMORY_CACHE_SIZE) {
      // Find and remove the oldest entry by timestamp
      let oldestKey = null;
      let oldestTime = Infinity;
      for (const [k, v] of this._memoryCache) {
        if (v.timestamp < oldestTime) {
          oldestTime = v.timestamp;
          oldestKey = k;
        }
      }
      if (oldestKey) {
        this._memoryCache.delete(oldestKey);
      }
    }

    this._memoryCache.set(cacheKey, {
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * Invalidate memory cache
   * @param {string} key - Cache key
   * @param {string} userId - Optional user ID
   */
  invalidateMemory(key, userId = null) {
    const cacheKey = userId ? `${key}_${userId}` : key;
    this._memoryCache.delete(cacheKey);
  }

  /**
   * Invalidate both memory and async cache for a key
   * @param {string} key - Cache key
   * @param {string} userId - Optional user ID
   */
  async invalidate(key, userId = null) {
    // Invalidate memory cache
    this.invalidateMemory(key, userId);

    // Remove from async storage
    if (userId) {
      await this.removeForUser(key, userId);
    } else {
      await this.remove(key);
    }
  }

  /**
   * Get or fetch pattern with user-specific caching
   * @param {string} key - Cache key
   * @param {string} userId - User ID
   * @param {function} fetcher - Async function to fetch data
   * @returns {any} Data from cache or fetch
   */
  async getOrFetchForUser(key, userId, fetcher) {
    // Try memory cache first
    const memCached = this.getFromMemory(key, userId);
    if (memCached !== null) {
      return memCached;
    }

    // Try async cache
    const cached = await this.getForUser(key, userId);
    if (cached !== null) {
      // Store in memory for faster subsequent access
      this.setInMemory(key, cached, userId);
      return cached;
    }

    // Fetch fresh data
    try {
      const data = await fetcher();
      if (data !== null && data !== undefined) {
        await this.setForUser(key, userId, data);
        this.setInMemory(key, data, userId);
      }
      return data;
    } catch (error) {
      console.error(`[CacheService] Fetch error for ${key}:`, error);
      return null;
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
