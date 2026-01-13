/**
 * Gemral - useDigitalProducts Hook
 * State management for digital products with tier-based access control
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { digitalProductService } from '../services/digitalProductService';
import { useAuth } from '../contexts/AuthContext';
import {
  canAccessProduct,
  DIGITAL_CATEGORIES,
} from '../utils/digitalProductsConfig';

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

  // State
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(category);

  // User tier (prioritize course_tier, then general tier)
  const userTier = useMemo(() => {
    return profile?.course_tier || profile?.tier || 'free';
  }, [profile]);

  // Fetch products by category
  const fetchProducts = useCallback(async (forceRefresh = false) => {
    try {
      setError(null);
      const data = await digitalProductService.getProductsByCategory(selectedCategory);
      setProducts(data || []);
    } catch (err) {
      console.error('[useDigitalProducts] Fetch error:', err);
      setError(err.message || 'Không thể tải sản phẩm');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedCategory]);

  // Initial fetch
  useEffect(() => {
    if (autoFetch) {
      setLoading(true);
      fetchProducts();
    }
  }, [autoFetch, fetchProducts]);

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
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await digitalProductService.getHeroProducts(limit);
        setProducts(data || []);
      } catch (err) {
        console.error('[useHeroProducts] Error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [limit]);

  return { products, loading };
};

/**
 * Hook for trending products
 * @param {number} limit - Max products
 * @returns {object}
 */
export const useTrendingProducts = (limit = 10) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await digitalProductService.getTrendingProducts(limit);
        setProducts(data || []);
      } catch (err) {
        console.error('[useTrendingProducts] Error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
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
