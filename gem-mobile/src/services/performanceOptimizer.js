/**
 * Performance Optimizer Service
 * Phase 5: Production
 *
 * Performance optimization features:
 * - LRU Memory Cache with TTL
 * - Persistent Cache (AsyncStorage)
 * - Request Deduplication
 * - Request Batching
 * - Circuit Breaker Pattern
 * - Lazy Loading Support
 * - Performance Metrics
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';

// ============================================================================
// LRU MEMORY CACHE
// ============================================================================

class LRUCache {
  constructor(maxSize = 100, defaultTTL = 5 * 60 * 1000) {
    this.maxSize = maxSize;
    this.defaultTTL = defaultTTL;
    this.cache = new Map();
    this.accessOrder = [];
  }

  get(key) {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Check TTL
    if (Date.now() > entry.expiresAt) {
      this.delete(key);
      return null;
    }

    // Update access order
    this.updateAccessOrder(key);
    return entry.value;
  }

  set(key, value, ttl = this.defaultTTL) {
    // Evict if at capacity
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      this.evictLRU();
    }

    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttl,
      createdAt: Date.now(),
    });

    this.updateAccessOrder(key);
  }

  delete(key) {
    this.cache.delete(key);
    this.accessOrder = this.accessOrder.filter((k) => k !== key);
  }

  updateAccessOrder(key) {
    this.accessOrder = this.accessOrder.filter((k) => k !== key);
    this.accessOrder.push(key);
  }

  evictLRU() {
    if (this.accessOrder.length > 0) {
      const oldest = this.accessOrder.shift();
      this.cache.delete(oldest);
    }
  }

  clear() {
    this.cache.clear();
    this.accessOrder = [];
  }

  getStats() {
    let validEntries = 0;
    let expiredEntries = 0;
    const now = Date.now();

    this.cache.forEach((entry) => {
      if (now > entry.expiresAt) {
        expiredEntries++;
      } else {
        validEntries++;
      }
    });

    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      validEntries,
      expiredEntries,
      utilizationPercent: ((this.cache.size / this.maxSize) * 100).toFixed(1),
    };
  }
}

// ============================================================================
// PERSISTENT CACHE (AsyncStorage)
// ============================================================================

class PersistentCache {
  constructor(prefix = 'cache_') {
    this.prefix = prefix;
  }

  async get(key) {
    try {
      const data = await AsyncStorage.getItem(this.prefix + key);
      if (!data) return null;

      const entry = JSON.parse(data);

      // Check TTL
      if (Date.now() > entry.expiresAt) {
        await this.delete(key);
        return null;
      }

      return entry.value;
    } catch (error) {
      console.warn('[PersistentCache] Get error:', error);
      return null;
    }
  }

  async set(key, value, ttl = 24 * 60 * 60 * 1000) {
    try {
      const entry = {
        value,
        expiresAt: Date.now() + ttl,
        createdAt: Date.now(),
      };

      await AsyncStorage.setItem(this.prefix + key, JSON.stringify(entry));
    } catch (error) {
      console.warn('[PersistentCache] Set error:', error);
    }
  }

  async delete(key) {
    try {
      await AsyncStorage.removeItem(this.prefix + key);
    } catch (error) {
      console.warn('[PersistentCache] Delete error:', error);
    }
  }

  async clear() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter((k) => k.startsWith(this.prefix));
      await AsyncStorage.multiRemove(cacheKeys);
    } catch (error) {
      console.warn('[PersistentCache] Clear error:', error);
    }
  }

  async getStats() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter((k) => k.startsWith(this.prefix));

      let validEntries = 0;
      let expiredEntries = 0;
      let totalSize = 0;

      for (const key of cacheKeys) {
        const data = await AsyncStorage.getItem(key);
        if (data) {
          totalSize += data.length;
          const entry = JSON.parse(data);
          if (Date.now() > entry.expiresAt) {
            expiredEntries++;
          } else {
            validEntries++;
          }
        }
      }

      return {
        totalEntries: cacheKeys.length,
        validEntries,
        expiredEntries,
        estimatedSizeKB: (totalSize / 1024).toFixed(2),
      };
    } catch (error) {
      return { error: error.message };
    }
  }
}

// ============================================================================
// REQUEST DEDUPLICATION
// ============================================================================

class RequestDeduplicator {
  constructor() {
    this.pendingRequests = new Map();
  }

  async deduplicate(key, requestFn) {
    // If request is already in flight, return the existing promise
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key);
    }

    // Create new request
    const promise = requestFn()
      .then((result) => {
        this.pendingRequests.delete(key);
        return result;
      })
      .catch((error) => {
        this.pendingRequests.delete(key);
        throw error;
      });

    this.pendingRequests.set(key, promise);
    return promise;
  }

  getPendingCount() {
    return this.pendingRequests.size;
  }
}

// ============================================================================
// REQUEST BATCHING
// ============================================================================

class RequestBatcher {
  constructor(options = {}) {
    this.batchSize = options.batchSize || 10;
    this.batchDelay = options.batchDelay || 50; // ms
    this.queue = [];
    this.timeout = null;
    this.processFn = options.processFn || (async (items) => items);
  }

  add(item) {
    return new Promise((resolve, reject) => {
      this.queue.push({ item, resolve, reject });

      // If batch is full, process immediately
      if (this.queue.length >= this.batchSize) {
        this.processBatch();
      } else if (!this.timeout) {
        // Otherwise, wait for more items
        this.timeout = setTimeout(() => this.processBatch(), this.batchDelay);
      }
    });
  }

  async processBatch() {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }

    if (this.queue.length === 0) return;

    const batch = this.queue.splice(0, this.batchSize);
    const items = batch.map((b) => b.item);

    try {
      const results = await this.processFn(items);

      // Resolve each promise with corresponding result
      batch.forEach((b, index) => {
        b.resolve(results[index]);
      });
    } catch (error) {
      // Reject all promises in batch
      batch.forEach((b) => {
        b.reject(error);
      });
    }
  }

  getQueueLength() {
    return this.queue.length;
  }
}

// ============================================================================
// CIRCUIT BREAKER
// ============================================================================

class CircuitBreaker {
  constructor(options = {}) {
    this.failureThreshold = options.failureThreshold || 5;
    this.resetTimeout = options.resetTimeout || 30000; // 30 seconds
    this.halfOpenMaxCalls = options.halfOpenMaxCalls || 3;

    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = null;
    this.halfOpenCalls = 0;
  }

  async execute(fn) {
    if (this.state === 'OPEN') {
      // Check if we should try half-open
      if (Date.now() - this.lastFailureTime >= this.resetTimeout) {
        this.state = 'HALF_OPEN';
        this.halfOpenCalls = 0;
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }

    if (this.state === 'HALF_OPEN') {
      this.halfOpenCalls++;
      if (this.halfOpenCalls > this.halfOpenMaxCalls) {
        throw new Error('Circuit breaker is HALF_OPEN - max calls exceeded');
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  onSuccess() {
    this.failureCount = 0;
    this.successCount++;

    if (this.state === 'HALF_OPEN') {
      // Close circuit after successful half-open call
      this.state = 'CLOSED';
      this.halfOpenCalls = 0;
    }
  }

  onFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN';
    }
  }

  getState() {
    return {
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      lastFailureTime: this.lastFailureTime,
    };
  }

  reset() {
    this.state = 'CLOSED';
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = null;
    this.halfOpenCalls = 0;
  }
}

// ============================================================================
// PERFORMANCE METRICS
// ============================================================================

class PerformanceMetrics {
  constructor() {
    this.metrics = [];
    this.maxMetrics = 1000;
  }

  record(name, value, unit = 'ms', tags = {}) {
    this.metrics.push({
      name,
      value,
      unit,
      tags,
      timestamp: Date.now(),
    });

    // Trim if too many
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }
  }

  startTimer(name) {
    const start = Date.now();
    return {
      stop: (tags = {}) => {
        const duration = Date.now() - start;
        this.record(name, duration, 'ms', tags);
        return duration;
      },
    };
  }

  getMetrics(name, since = Date.now() - 60000) {
    return this.metrics.filter((m) => m.name === name && m.timestamp >= since);
  }

  getAverages(since = Date.now() - 60000) {
    const filtered = this.metrics.filter((m) => m.timestamp >= since);
    const grouped = {};

    filtered.forEach((m) => {
      if (!grouped[m.name]) {
        grouped[m.name] = { sum: 0, count: 0 };
      }
      grouped[m.name].sum += m.value;
      grouped[m.name].count++;
    });

    const averages = {};
    Object.keys(grouped).forEach((name) => {
      averages[name] = {
        avg: (grouped[name].sum / grouped[name].count).toFixed(2),
        count: grouped[name].count,
      };
    });

    return averages;
  }

  async flushToServer() {
    if (this.metrics.length === 0) return;

    try {
      const metricsToSend = this.metrics.splice(0, 100);
      await supabase.rpc('record_performance_metrics', {
        metrics: metricsToSend.map((m) => ({
          name: m.name,
          value: m.value,
          unit: m.unit,
          tags: m.tags,
        })),
      });
    } catch (error) {
      console.warn('[PerformanceMetrics] Flush error:', error);
    }
  }
}

// ============================================================================
// OPTIMIZED DATA FETCHER
// ============================================================================

class OptimizedDataFetcher {
  constructor() {
    this.memoryCache = new LRUCache(200, 5 * 60 * 1000);
    this.persistentCache = new PersistentCache('data_');
    this.deduplicator = new RequestDeduplicator();
    this.circuitBreaker = new CircuitBreaker();
    this.metrics = new PerformanceMetrics();
  }

  async fetch(key, fetchFn, options = {}) {
    const {
      useMemoryCache = true,
      usePersistentCache = false,
      memoryTTL = 5 * 60 * 1000,
      persistentTTL = 24 * 60 * 60 * 1000,
      deduplicate = true,
    } = options;

    const timer = this.metrics.startTimer('data_fetch');

    // 1. Check memory cache
    if (useMemoryCache) {
      const cached = this.memoryCache.get(key);
      if (cached) {
        timer.stop({ source: 'memory_cache' });
        return cached;
      }
    }

    // 2. Check persistent cache
    if (usePersistentCache) {
      const cached = await this.persistentCache.get(key);
      if (cached) {
        // Also populate memory cache
        if (useMemoryCache) {
          this.memoryCache.set(key, cached, memoryTTL);
        }
        timer.stop({ source: 'persistent_cache' });
        return cached;
      }
    }

    // 3. Fetch with deduplication and circuit breaker
    const fetchWithProtection = async () => {
      return this.circuitBreaker.execute(fetchFn);
    };

    const doFetch = deduplicate
      ? () => this.deduplicator.deduplicate(key, fetchWithProtection)
      : fetchWithProtection;

    try {
      const result = await doFetch();

      // Cache results
      if (useMemoryCache) {
        this.memoryCache.set(key, result, memoryTTL);
      }
      if (usePersistentCache) {
        await this.persistentCache.set(key, result, persistentTTL);
      }

      timer.stop({ source: 'network' });
      return result;
    } catch (error) {
      timer.stop({ source: 'error' });
      throw error;
    }
  }

  invalidate(key) {
    this.memoryCache.delete(key);
    this.persistentCache.delete(key);
  }

  async invalidatePattern(pattern) {
    // For memory cache - check all keys
    const regex = new RegExp(pattern);
    const keysToDelete = [];

    this.memoryCache.cache.forEach((_, key) => {
      if (regex.test(key)) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach((key) => this.memoryCache.delete(key));
  }

  getStats() {
    return {
      memoryCache: this.memoryCache.getStats(),
      circuitBreaker: this.circuitBreaker.getState(),
      pendingRequests: this.deduplicator.getPendingCount(),
      metrics: this.metrics.getAverages(),
    };
  }
}

// ============================================================================
// LAZY LOADING HELPER
// ============================================================================

class LazyLoader {
  constructor() {
    this.loaded = new Set();
    this.loading = new Map();
  }

  async load(key, loadFn, dependencies = []) {
    // Check if already loaded
    if (this.loaded.has(key)) {
      return true;
    }

    // Check if currently loading
    if (this.loading.has(key)) {
      return this.loading.get(key);
    }

    // Wait for dependencies
    for (const dep of dependencies) {
      if (!this.loaded.has(dep)) {
        throw new Error(`Dependency not loaded: ${dep}`);
      }
    }

    // Start loading
    const promise = loadFn()
      .then(() => {
        this.loaded.add(key);
        this.loading.delete(key);
        return true;
      })
      .catch((error) => {
        this.loading.delete(key);
        throw error;
      });

    this.loading.set(key, promise);
    return promise;
  }

  isLoaded(key) {
    return this.loaded.has(key);
  }

  isLoading(key) {
    return this.loading.has(key);
  }

  reset() {
    this.loaded.clear();
    this.loading.clear();
  }
}

// ============================================================================
// IMAGE PRELOADER
// ============================================================================

class ImagePreloader {
  constructor() {
    this.preloaded = new Set();
    this.failed = new Set();
  }

  async preload(urls) {
    const promises = urls.map(async (url) => {
      if (this.preloaded.has(url) || this.failed.has(url)) {
        return;
      }

      try {
        // Use Image.prefetch for React Native
        const { Image } = require('react-native');
        await Image.prefetch(url);
        this.preloaded.add(url);
      } catch (error) {
        this.failed.add(url);
      }
    });

    await Promise.allSettled(promises);
  }

  isPreloaded(url) {
    return this.preloaded.has(url);
  }

  getStats() {
    return {
      preloaded: this.preloaded.size,
      failed: this.failed.size,
    };
  }

  clear() {
    this.preloaded.clear();
    this.failed.clear();
  }
}

// ============================================================================
// MAIN PERFORMANCE OPTIMIZER
// ============================================================================

class PerformanceOptimizer {
  constructor() {
    this.dataFetcher = new OptimizedDataFetcher();
    this.lazyLoader = new LazyLoader();
    this.imagePreloader = new ImagePreloader();
    this.batcher = null;
    this.flushInterval = null;
  }

  initialize() {
    // Start metrics flush interval
    this.flushInterval = setInterval(() => {
      this.dataFetcher.metrics.flushToServer();
    }, 60000); // Flush every minute
  }

  // Optimized fetch with caching and deduplication
  async fetch(key, fetchFn, options = {}) {
    return this.dataFetcher.fetch(key, fetchFn, options);
  }

  // Invalidate cache
  invalidate(key) {
    this.dataFetcher.invalidate(key);
  }

  // Preload images
  async preloadImages(urls) {
    return this.imagePreloader.preload(urls);
  }

  // Lazy load module
  async lazyLoad(key, loadFn, dependencies = []) {
    return this.lazyLoader.load(key, loadFn, dependencies);
  }

  // Create batched request handler
  createBatcher(processFn, options = {}) {
    return new RequestBatcher({ ...options, processFn });
  }

  // Record custom metric
  recordMetric(name, value, unit = 'ms', tags = {}) {
    this.dataFetcher.metrics.record(name, value, unit, tags);
  }

  // Start timer
  startTimer(name) {
    return this.dataFetcher.metrics.startTimer(name);
  }

  // Get performance stats
  getStats() {
    return {
      ...this.dataFetcher.getStats(),
      lazyLoader: {
        loaded: this.lazyLoader.loaded.size,
        loading: this.lazyLoader.loading.size,
      },
      images: this.imagePreloader.getStats(),
    };
  }

  // Clear all caches
  clearCaches() {
    this.dataFetcher.memoryCache.clear();
    this.dataFetcher.persistentCache.clear();
    this.imagePreloader.clear();
  }

  // Cleanup
  cleanup() {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    this.dataFetcher.metrics.flushToServer();
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export const performanceOptimizer = new PerformanceOptimizer();

export {
  LRUCache,
  PersistentCache,
  RequestDeduplicator,
  RequestBatcher,
  CircuitBreaker,
  PerformanceMetrics,
  OptimizedDataFetcher,
  LazyLoader,
  ImagePreloader,
};

export default performanceOptimizer;
