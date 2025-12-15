/**
 * Gemral - useCache Hook
 *
 * React hook for cache operations with loading states
 * Automatically handles offline mode
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import cacheService, { CACHE_KEYS } from '../services/cacheService';

/**
 * Hook for caching data with automatic refresh
 * @param {string} cacheKey - Key from CACHE_KEYS
 * @param {function} fetcher - Async function to fetch fresh data
 * @param {object} options - Hook options
 * @returns {object} { data, loading, error, refresh, fromCache, isOnline }
 */
export const useCache = (cacheKey, fetcher, options = {}) => {
  const {
    enabled = true,           // Enable/disable the hook
    refreshOnMount = true,    // Refresh on component mount
    refreshOnFocus = false,   // Refresh when app comes to foreground
    staleTime = 5000,         // Time before considering data stale (ms)
    onSuccess = null,         // Callback on successful fetch
    onError = null,           // Callback on error
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fromCache, setFromCache] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  const fetcherRef = useRef(fetcher);
  const isMounted = useRef(true);

  // Update fetcher ref
  useEffect(() => {
    fetcherRef.current = fetcher;
  }, [fetcher]);

  // Check online status
  useEffect(() => {
    setIsOnline(cacheService.isOnline());

    const interval = setInterval(() => {
      const online = cacheService.isOnline();
      if (online !== isOnline) {
        setIsOnline(online);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isOnline]);

  // Fetch data
  const fetchData = useCallback(async (forceRefresh = false) => {
    if (!enabled) return;

    setLoading(true);
    setError(null);

    try {
      const result = await cacheService.getWithFallback(
        cacheKey,
        fetcherRef.current,
        forceRefresh
      );

      if (!isMounted.current) return;

      setData(result.data);
      setFromCache(result.fromCache);
      setError(result.error);

      if (!result.error && result.data !== null) {
        onSuccess?.(result.data, result.fromCache);
      } else if (result.error) {
        onError?.(result.error);
      }
    } catch (err) {
      if (!isMounted.current) return;

      setError(err.message);
      onError?.(err.message);
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [cacheKey, enabled, onSuccess, onError]);

  // Manual refresh
  const refresh = useCallback(() => {
    return fetchData(true);
  }, [fetchData]);

  // Initial fetch
  useEffect(() => {
    isMounted.current = true;

    if (refreshOnMount) {
      fetchData();
    }

    return () => {
      isMounted.current = false;
    };
  }, [cacheKey]);

  // Invalidate cache and refetch
  const invalidate = useCallback(async () => {
    await cacheService.remove(cacheKey);
    return fetchData(true);
  }, [cacheKey, fetchData]);

  // Set data manually (also updates cache)
  const setDataManually = useCallback(async (newData) => {
    setData(newData);
    await cacheService.set(cacheKey, newData);
  }, [cacheKey]);

  return {
    data,
    loading,
    error,
    refresh,
    invalidate,
    setData: setDataManually,
    fromCache,
    isOnline,
  };
};

/**
 * Hook for checking online status
 * @returns {object} { isOnline }
 */
export const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Initialize
    setIsOnline(cacheService.isOnline());

    // Poll for changes
    const interval = setInterval(() => {
      setIsOnline(cacheService.isOnline());
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return { isOnline };
};

/**
 * Hook for cache stats (for debugging)
 * @returns {object} Cache statistics
 */
export const useCacheStats = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const loadStats = async () => {
      const data = await cacheService.getStats();
      setStats(data);
    };

    loadStats();
  }, []);

  const refresh = useCallback(async () => {
    const data = await cacheService.getStats();
    setStats(data);
  }, []);

  return { stats, refresh };
};

export default useCache;
