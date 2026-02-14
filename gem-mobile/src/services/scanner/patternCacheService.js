/**
 * PatternCacheService - Cache pattern detection results
 *
 * VAN DE TRUOC:
 * - Moi lan scan deu fetch fresh data
 * - Duplicate requests cho cung symbol/timeframe
 * - Khong co request deduplication
 *
 * GIAI PHAP:
 * - TTL-based expiration (2 minutes default)
 * - Symbol + Timeframe keyed cache
 * - Request deduplication (concurrent requests share result)
 * - LRU eviction khi cache day
 *
 * PERFORMANCE: Eliminates redundant API calls
 *
 * USAGE:
 * import { patternCache } from '../services/scanner/patternCacheService';
 *
 * // Check cache first
 * const cached = patternCache.get('BTCUSDT', '1h');
 *
 * // Or use getOrFetch for automatic caching with deduplication
 * const patterns = await patternCache.getOrFetch('BTCUSDT', '1h', async () => {
 *   return await detectPatterns(candles);
 * });
 */

class PatternCacheService {
  constructor() {
    this.cache = new Map();
    this.pendingRequests = new Map(); // For deduplication

    this.DEFAULT_TTL = 5 * 60 * 1000;
    this.SCANNER_TTL = 60 * 1000;
    this.MAX_CACHE_SIZE = 1000;
    this.STALE_WHILE_REVALIDATE = 2 * 60 * 1000;

    // Debug
    this.DEBUG = __DEV__ || false;

    // Metrics
    this.metrics = {
      hits: 0,
      misses: 0,
      staleHits: 0,
      deduped: 0,
      evictions: 0,
    };
  }

  /**
   * Generate cache key
   * @param {string} symbol - Trading symbol
   * @param {string} timeframe - Timeframe
   * @returns {string} Cache key
   */
  _getKey(symbol, timeframe) {
    return `${symbol?.toUpperCase() || 'UNKNOWN'}_${timeframe || '1h'}`;
  }

  /**
   * Get cached patterns if valid
   * @param {string} symbol - Trading symbol
   * @param {string} timeframe - Timeframe
   * @param {number} ttl - Custom TTL in ms (optional)
   * @returns {array|null} Cached patterns or null
   */
  get(symbol, timeframe, ttl = this.DEFAULT_TTL) {
    const key = this._getKey(symbol, timeframe);
    const cached = this.cache.get(key);

    if (!cached) {
      this.metrics.misses++;
      return null;
    }

    const age = Date.now() - cached.timestamp;

    // Check expiration
    if (age > ttl) {
      this.cache.delete(key);
      this.metrics.misses++;

      if (this.DEBUG) {
        console.log(`[PatternCache] Expired: ${key}, age: ${Math.round(age / 1000)}s`);
      }
      return null;
    }

    this.metrics.hits++;

    if (this.DEBUG) {
      console.log(`[PatternCache] HIT: ${key}, age: ${Math.round(age / 1000)}s`);
    }

    return cached.patterns;
  }

  /**
   * Get cached patterns (returns stale if within STALE_WHILE_REVALIDATE)
   * @param {string} symbol - Trading symbol
   * @param {string} timeframe - Timeframe
   * @returns {{ patterns: array|null, isStale: boolean }}
   */
  getWithStale(symbol, timeframe) {
    const key = this._getKey(symbol, timeframe);
    const cached = this.cache.get(key);

    if (!cached) {
      return { patterns: null, isStale: false };
    }

    const age = Date.now() - cached.timestamp;

    // Fresh
    if (age <= this.DEFAULT_TTL) {
      this.metrics.hits++;
      return { patterns: cached.patterns, isStale: false };
    }

    // Stale but usable
    if (age <= this.DEFAULT_TTL + this.STALE_WHILE_REVALIDATE) {
      this.metrics.staleHits++;
      return { patterns: cached.patterns, isStale: true };
    }

    // Too old
    this.cache.delete(key);
    return { patterns: null, isStale: false };
  }

  /**
   * Store patterns in cache
   * @param {string} symbol - Trading symbol
   * @param {string} timeframe - Timeframe
   * @param {array} patterns - Detected patterns
   * @param {object} metadata - Optional metadata
   */
  set(symbol, timeframe, patterns, metadata = {}) {
    const key = this._getKey(symbol, timeframe);

    // Evict oldest if at capacity (LRU)
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
      this.metrics.evictions++;

      if (this.DEBUG) {
        console.log(`[PatternCache] Evicted: ${oldestKey}`);
      }
    }

    this.cache.set(key, {
      patterns: patterns || [],
      timestamp: Date.now(),
      symbol,
      timeframe,
      ...metadata,
    });

    if (this.DEBUG) {
      console.log(`[PatternCache] SET: ${key}, patterns: ${patterns?.length || 0}`);
    }
  }

  /**
   * Get or fetch patterns with deduplication
   * @param {string} symbol - Trading symbol
   * @param {string} timeframe - Timeframe
   * @param {function} fetchFn - Async function to fetch patterns if not cached
   * @param {object} options - { forceRefresh, ttl }
   * @returns {Promise<array>} Patterns
   */
  getTTLForType(dataType) {
    if (dataType === 'scanner') return this.SCANNER_TTL;
    return this.DEFAULT_TTL;
  }

  async getOrFetch(symbol, timeframe, fetchFn, options = {}) {
    const { forceRefresh = false, dataType } = options;
    const ttl = options.ttl ?? this.getTTLForType(dataType);
    const key = this._getKey(symbol, timeframe);

    // Check cache first (unless forceRefresh)
    if (!forceRefresh) {
      const cached = this.get(symbol, timeframe, ttl);
      if (cached) return cached;
    }

    // Check if request already pending (deduplication)
    if (this.pendingRequests.has(key)) {
      this.metrics.deduped++;

      if (this.DEBUG) {
        console.log(`[PatternCache] Dedup: waiting for ${key}`);
      }

      return this.pendingRequests.get(key);
    }

    // Create new request
    const request = (async () => {
      try {
        const patterns = await fetchFn();
        this.set(symbol, timeframe, patterns);
        return patterns || [];
      } catch (err) {
        console.error(`[PatternCache] Fetch error for ${key}:`, err);
        throw err;
      } finally {
        this.pendingRequests.delete(key);
      }
    })();

    this.pendingRequests.set(key, request);
    return request;
  }

  /**
   * Invalidate cache for a symbol
   * @param {string} symbol - Trading symbol
   * @param {string} timeframe - Optional specific timeframe
   */
  invalidate(symbol, timeframe = null) {
    if (timeframe) {
      const key = this._getKey(symbol, timeframe);
      this.cache.delete(key);

      if (this.DEBUG) {
        console.log(`[PatternCache] Invalidated: ${key}`);
      }
    } else {
      // Invalidate all timeframes for this symbol
      const prefix = symbol?.toUpperCase() + '_';
      let count = 0;

      for (const key of this.cache.keys()) {
        if (key.startsWith(prefix)) {
          this.cache.delete(key);
          count++;
        }
      }

      if (this.DEBUG) {
        console.log(`[PatternCache] Invalidated ${count} entries for: ${symbol}`);
      }
    }
  }

  /**
   * Invalidate all entries older than specified age
   * @param {number} maxAge - Max age in ms
   */
  invalidateOlderThan(maxAge) {
    const cutoff = Date.now() - maxAge;
    let count = 0;

    for (const [key, value] of this.cache.entries()) {
      if (value.timestamp < cutoff) {
        this.cache.delete(key);
        count++;
      }
    }

    if (this.DEBUG) {
      console.log(`[PatternCache] Invalidated ${count} old entries`);
    }

    return count;
  }

  /**
   * Check if symbol/timeframe is cached and fresh
   * @param {string} symbol - Trading symbol
   * @param {string} timeframe - Timeframe
   * @returns {boolean}
   */
  has(symbol, timeframe) {
    return this.get(symbol, timeframe) !== null;
  }

  /**
   * Get cache age for a key
   * @param {string} symbol - Trading symbol
   * @param {string} timeframe - Timeframe
   * @returns {number|null} Age in ms or null if not cached
   */
  getAge(symbol, timeframe) {
    const key = this._getKey(symbol, timeframe);
    const cached = this.cache.get(key);

    if (!cached) return null;

    return Date.now() - cached.timestamp;
  }

  /**
   * Clear entire cache
   */
  clear() {
    this.cache.clear();
    this.pendingRequests.clear();

    if (this.DEBUG) {
      console.log('[PatternCache] Cleared');
    }
  }

  /**
   * Get cache statistics
   * @returns {object} Stats
   */
  getStats() {
    const entries = [];

    this.cache.forEach((value, key) => {
      entries.push({
        key,
        patterns: value.patterns?.length || 0,
        age: Math.round((Date.now() - value.timestamp) / 1000) + 's',
      });
    });

    // Sort by age (oldest first)
    entries.sort((a, b) => parseInt(b.age) - parseInt(a.age));

    return {
      size: this.cache.size,
      maxSize: this.MAX_CACHE_SIZE,
      pendingRequests: this.pendingRequests.size,
      hitRate: this.metrics.hits + this.metrics.misses > 0
        ? ((this.metrics.hits / (this.metrics.hits + this.metrics.misses)) * 100).toFixed(1) + '%'
        : '0%',
      ...this.metrics,
      entries: entries.slice(0, 20), // Top 20 entries
    };
  }

  /**
   * Reset metrics
   */
  resetMetrics() {
    this.metrics = {
      hits: 0,
      misses: 0,
      staleHits: 0,
      deduped: 0,
      evictions: 0,
    };
  }

  /**
   * Set configuration
   * @param {object} config - { defaultTTL, maxCacheSize }
   */
  setConfig(config) {
    if (config.defaultTTL) {
      this.DEFAULT_TTL = config.defaultTTL;
    }
    if (config.scannerTTL) {
      this.SCANNER_TTL = config.scannerTTL;
    }
    if (config.maxCacheSize) {
      this.MAX_CACHE_SIZE = config.maxCacheSize;
    }
    if (config.staleWhileRevalidate) {
      this.STALE_WHILE_REVALIDATE = config.staleWhileRevalidate;
    }
  }

  /**
   * Set debug mode
   */
  setDebug(enabled) {
    this.DEBUG = enabled;
  }

  /**
   * Export cache to JSON (for persistence)
   * @returns {string} JSON string
   */
  exportToJSON() {
    const data = {};
    this.cache.forEach((value, key) => {
      data[key] = value;
    });
    return JSON.stringify(data);
  }

  /**
   * Import cache from JSON
   * @param {string} json - JSON string
   */
  importFromJSON(json) {
    try {
      const data = JSON.parse(json);
      Object.entries(data).forEach(([key, value]) => {
        // Only import if not expired
        if (Date.now() - value.timestamp < this.DEFAULT_TTL) {
          this.cache.set(key, value);
        }
      });

      if (this.DEBUG) {
        console.log(`[PatternCache] Imported ${this.cache.size} entries`);
      }
    } catch (err) {
      console.error('[PatternCache] Import error:', err);
    }
  }
}

// Singleton instance
export const patternCache = new PatternCacheService();

// Named export
export { PatternCacheService };

// Default export
export default patternCache;
