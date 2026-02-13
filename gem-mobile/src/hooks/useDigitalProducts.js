/**
 * Gemral - useDigitalProducts Hook
 * State management for digital products with tier-based access control
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { digitalProductService } from '../services/digitalProductService';
import { useAuth } from '../contexts/AuthContext';
import {
  canAccessProduct,
  DIGITAL_CATEGORIES,
} from '../utils/digitalProductsConfig';

// =========== GLOBAL CACHE for instant display ===========
const digitalProductsCache = {
  all: null,
  byCategory: {},
  hero: null,
  trending: null,
  recommended: {},
  lastFetch: {},
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
};

/**
 * Main hook for digital products
 * @param {object} options - Hook options
 * @returns {object}
 */
export const useDigitalProducts = (options = {}) => {
  const {
    category = 'all',
    autoFetch = true,
    trackViews = true,
  } = options;

  const { user, profile } = useAuth() || {};
  const hasFetched = useRef(false);

  // Get cached data for instant display - checks both hook cache and service cache
  const getCachedData = () => {
    // First check hook-level cache
    const hookCached = category === 'all'
      ? digitalProductsCache.all
      : digitalProductsCache.byCategory[category];
    if (hookCached && hookCached.length > 0) {
      return hookCached;
    }
    // Then check service-level cache (might be populated by preload)
    const serviceCache = digitalProductService.getCachedProducts?.();
    if (serviceCache && serviceCache.length > 0) {
      // Sync to hook cache
      if (category === 'all') {
        digitalProductsCache.all = serviceCache;
      }
      digitalProductsCache.lastFetch.all = Date.now();
      return serviceCache;
    }
    return [];
  };

  // State - Initialize from cache for instant display
  const [products, setProducts] = useState(() => getCachedData());
  const [loading, setLoading] = useState(() => getCachedData().length === 0);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(category);

  // User tier (prioritize course_tier, then general tier)
  const userTier = useMemo(() => {
    return profile?.course_tier || profile?.tier || 'free';
  }, [profile]);

  // Fetch products by category
  const fetchProducts = useCallback(async (forceRefresh = false) => {
    const cacheKey = selectedCategory === 'all' ? 'all' : `cat_${selectedCategory}`;
    const now = Date.now();
    const lastFetch = digitalProductsCache.lastFetch[cacheKey] || 0;
    const cacheExpired = now - lastFetch > digitalProductsCache.CACHE_DURATION;

    // Use cache if available and not expired (unless force refresh)
    if (!forceRefresh && !cacheExpired) {
      const cached = selectedCategory === 'all'
        ? digitalProductsCache.all
        : digitalProductsCache.byCategory[selectedCategory];
      if (cached && cached.length > 0) {
        setLoading(false);
        setRefreshing(false);
        return;
      }
    }

    try {
      setError(null);
      const data = await digitalProductService.getProductsByCategory(selectedCategory);
      setProducts(data || []);

      // Update cache
      if (selectedCategory === 'all') {
        digitalProductsCache.all = data || [];
      } else {
        digitalProductsCache.byCategory[selectedCategory] = data || [];
      }
      digitalProductsCache.lastFetch[cacheKey] = Date.now();
    } catch (err) {
      console.error('[useDigitalProducts] Fetch error:', err);
      setError(err.message || 'Không thể tải sản phẩm');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedCategory]);

  // Initial fetch - only once per mount
  useEffect(() => {
    if (autoFetch && !hasFetched.current) {
      hasFetched.current = true;
      // Only show loading if no cached data
      const cached = getCachedData();
      if (cached.length === 0) {
        setLoading(true);
      }
      fetchProducts();
    }
  }, [autoFetch]);

  // Refresh handler
  const refresh = useCallback(async () => {
    setRefreshing(true);
    digitalProductService.clearCache();
    await fetchProducts(true);
  }, [fetchProducts]);

  // Change category
  const changeCategory = useCallback((newCategory) => {
    setSelectedCategory(newCategory);
    setLoading(true);
  }, []);

  // Search products
  const searchProducts = useCallback(async (query) => {
    if (!query?.trim()) {
      await fetchProducts();
      return;
    }

    setLoading(true);
    try {
      const results = await digitalProductService.searchProducts(query);
      setProducts(results);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [fetchProducts]);

  // Check access for a product
  const checkAccess = useCallback((product) => {
    const productTier = product?.tier || 'free';
    const productType = product?.subscriptionType || 'course';

    return canAccessProduct(userTier, productTier, productType);
  }, [userTier]);

  // Products with access info
  const productsWithAccess = useMemo(() => {
    return products.map(product => ({
      ...product,
      canAccess: checkAccess(product),
      isLocked: !checkAccess(product),
    }));
  }, [products, checkAccess]);

  // Track product view
  const trackView = useCallback((product, source = 'shop_tab') => {
    if (!trackViews || !product?.id) return;

    digitalProductService.trackView(
      product.id,
      product.subscriptionType || 'course',
      product.tier,
      source
    );
  }, [trackViews]);

  // Track product click
  const trackClick = useCallback((product, clickType) => {
    if (!product?.id) return;

    digitalProductService.trackClick(
      product.id,
      clickType,
      product.tier,
      userTier
    );
  }, [userTier]);

  return {
    // Data
    products: productsWithAccess,
    loading,
    refreshing,
    error,
    userTier,
    selectedCategory,
    categories: DIGITAL_CATEGORIES,

    // Actions
    refresh,
    changeCategory,
    searchProducts,
    checkAccess,
    trackView,
    trackClick,

    // Helpers
    isEmpty: !loading && products.length === 0,
    hasError: !!error,
  };
};

/**
 * Hook for hero/featured products
 * @param {number} limit - Max products
 * @returns {object}
 */
export const useHeroProducts = (limit = 5) => {
  const hasFetched = useRef(false);

  // Initialize from cache for instant display
  const [products, setProducts] = useState(() => digitalProductsCache.hero || []);
  const [loading, setLoading] = useState(() => !digitalProductsCache.hero || digitalProductsCache.hero.length === 0);

  useEffect(() => {
    // Skip if already fetched this session
    if (hasFetched.current) return;
    hasFetched.current = true;

    const now = Date.now();
    const lastFetch = digitalProductsCache.lastFetch.hero || 0;
    const cacheExpired = now - lastFetch > digitalProductsCache.CACHE_DURATION;

    // Use cache if valid
    if (digitalProductsCache.hero && digitalProductsCache.hero.length > 0 && !cacheExpired) {
      setLoading(false);
      return;
    }

    const fetchHero = async () => {
      try {
        const data = await digitalProductService.getHeroProducts(limit);
        setProducts(data || []);
        // Update cache
        digitalProductsCache.hero = data || [];
        digitalProductsCache.lastFetch.hero = Date.now();
      } catch (err) {
        console.error('[useHeroProducts] Error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHero();
  }, [limit]);

  return { products, loading };
};

/**
 * Hook for trending products
 * @param {number} limit - Max products
 * @returns {object}
 */
export const useTrendingProducts = (limit = 10) => {
  const hasFetched = useRef(false);

  // Initialize from cache for instant display
  const [products, setProducts] = useState(() => digitalProductsCache.trending || []);
  const [loading, setLoading] = useState(() => !digitalProductsCache.trending || digitalProductsCache.trending.length === 0);

  useEffect(() => {
    // Skip if already fetched this session
    if (hasFetched.current) return;
    hasFetched.current = true;

    const now = Date.now();
    const lastFetch = digitalProductsCache.lastFetch.trending || 0;
    const cacheExpired = now - lastFetch > digitalProductsCache.CACHE_DURATION;

    // Use cache if valid
    if (digitalProductsCache.trending && digitalProductsCache.trending.length > 0 && !cacheExpired) {
      setLoading(false);
      return;
    }

    const fetchTrending = async () => {
      try {
        const data = await digitalProductService.getTrendingProducts(limit);
        setProducts(data || []);
        // Update cache
        digitalProductsCache.trending = data || [];
        digitalProductsCache.lastFetch.trending = Date.now();
      } catch (err) {
        console.error('[useTrendingProducts] Error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTrending();
  }, [limit]);

  return { products, loading };
};

/**
 * Hook for recommended products
 * @param {number} limit - Max products
 * @returns {object}
 */
export const useRecommendedProducts = (limit = 6) => {
  const { user } = useAuth() || {};
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const data = await digitalProductService.getRecommendedProducts(user.id, limit);
        setProducts(data || []);
      } catch (err) {
        console.error('[useRecommendedProducts] Error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [user?.id, limit]);

  return { products, loading };
};

export default useDigitalProducts;
