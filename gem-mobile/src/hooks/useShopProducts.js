/**
 * useShopProducts - Custom hook để fetch và quản lý sản phẩm Shop
 * Sử dụng shopifyService và shopConfig
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import shopifyService from '../services/shopifyService';
import { SHOP_SECTIONS, SHOP_DEFAULTS, SHOP_TABS, filterProductsByTags } from '../utils/shopConfig';

/**
 * Hook fetch tất cả sản phẩm
 */
export const useAllProducts = (options = {}) => {
  const { limit = SHOP_DEFAULTS.productsPerPage, autoFetch = true } = options;

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const cursorRef = useRef(null);

  const fetchProducts = useCallback(async (reset = false) => {
    if (loading) return;

    try {
      setLoading(true);
      setError(null);

      if (reset) {
        cursorRef.current = null;
        setProducts([]);
      }

      const result = await shopifyService.getProducts(limit, cursorRef.current);

      if (result?.products) {
        setProducts(prev => reset ? result.products : [...prev, ...result.products]);
        cursorRef.current = result.pageInfo?.endCursor || null;
        setHasMore(result.pageInfo?.hasNextPage || false);
      }
    } catch (err) {
      console.error('useAllProducts error:', err);
      setError(err.message || 'Không thể tải sản phẩm');
    } finally {
      setLoading(false);
    }
  }, [limit, loading]);

  const refresh = useCallback(() => {
    return fetchProducts(true);
  }, [fetchProducts]);

  const loadMore = useCallback(() => {
    if (hasMore && !loading) {
      return fetchProducts(false);
    }
  }, [fetchProducts, hasMore, loading]);

  useEffect(() => {
    if (autoFetch) {
      fetchProducts(true);
    }
  }, [autoFetch]);

  return {
    products,
    loading,
    error,
    hasMore,
    refresh,
    loadMore,
    fetchProducts,
  };
};

/**
 * Hook fetch sản phẩm theo tag
 */
export const useProductsByTag = (tag, options = {}) => {
  const { limit = SHOP_DEFAULTS.sectionsLimit, autoFetch = true } = options;

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProducts = useCallback(async () => {
    if (!tag || loading) return;

    try {
      setLoading(true);
      setError(null);

      const result = await shopifyService.getProductsByTags([tag], limit);

      if (result?.products) {
        setProducts(result.products);
      }
    } catch (err) {
      console.error(`useProductsByTag [${tag}] error:`, err);
      setError(err.message || 'Không thể tải sản phẩm');
    } finally {
      setLoading(false);
    }
  }, [tag, limit, loading]);

  const refresh = useCallback(() => {
    return fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    if (autoFetch && tag) {
      fetchProducts();
    }
  }, [tag, autoFetch]);

  return {
    products,
    loading,
    error,
    refresh,
    fetchProducts,
  };
};

/**
 * Hook fetch sản phẩm cho một section cụ thể
 * Sử dụng section.type và section.tags từ SHOP_SECTIONS config
 */
export const useSectionProducts = (sectionId, options = {}) => {
  const section = SHOP_SECTIONS.find(s => s.id === sectionId);
  const { limit = section?.limit || SHOP_DEFAULTS.sectionsLimit, autoFetch = true } = options;

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProducts = useCallback(async () => {
    if (!section || loading) return;

    try {
      setLoading(true);
      setError(null);

      let result = [];

      // Xử lý theo section type
      switch (section.type) {
        case 'personalized':
          // "Dành Cho Bạn" - Lấy sản phẩm random
          result = await shopifyService.getForYouProducts(null, limit);
          break;

        case 'tagged':
          // Sections có tags - filter theo tags array
          if (section.tags && section.tags.length > 0) {
            result = await shopifyService.getProductsByTags(section.tags, limit);
          }
          break;

        case 'all':
          // Lấy tất cả sản phẩm
          result = await shopifyService.getProducts({ limit });
          break;

        default:
          // Fallback: lấy sản phẩm random
          result = await shopifyService.getForYouProducts(null, limit);
      }

      // Xử lý kết quả - có thể là array hoặc object với .products
      const productsList = Array.isArray(result) ? result : (result?.products || []);
      setProducts(productsList);

    } catch (err) {
      console.error(`useSectionProducts [${sectionId}] error:`, err);
      setError(err.message || 'Không thể tải sản phẩm');
    } finally {
      setLoading(false);
    }
  }, [sectionId, section, limit, loading]);

  const refresh = useCallback(() => {
    return fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    if (autoFetch && section) {
      fetchProducts();
    }
  }, [sectionId, autoFetch]);

  return {
    products,
    loading,
    error,
    section,
    refresh,
    fetchProducts,
  };
};

/**
 * Hook fetch tất cả sections cho Shop home
 * Sử dụng section.type và section.tags từ SHOP_SECTIONS config
 */
export const useShopSections = (options = {}) => {
  const { autoFetch = true } = options;

  const [sectionsData, setSectionsData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loadedSections, setLoadedSections] = useState(new Set());

  const fetchSection = useCallback(async (section) => {
    if (loadedSections.has(section.id)) return;

    try {
      let result = [];

      // Xử lý theo section type
      switch (section.type) {
        case 'personalized':
          // "Dành Cho Bạn" - Lấy sản phẩm random
          result = await shopifyService.getForYouProducts(null, section.limit);
          break;

        case 'tagged':
          // Sections có tags - filter theo tags array
          if (section.tags && section.tags.length > 0) {
            result = await shopifyService.getProductsByTags(section.tags, section.limit);
          }
          break;

        case 'all':
          // Lấy tất cả sản phẩm
          result = await shopifyService.getProducts({ limit: section.limit });
          break;

        default:
          // Fallback: lấy sản phẩm random
          result = await shopifyService.getForYouProducts(null, section.limit);
      }

      // Xử lý kết quả - có thể là array hoặc object với .products
      const productsList = Array.isArray(result) ? result : (result?.products || []);

      setSectionsData(prev => ({
        ...prev,
        [section.id]: {
          ...section,
          products: productsList,
          loaded: true,
        }
      }));
      setLoadedSections(prev => new Set([...prev, section.id]));

    } catch (err) {
      console.error(`fetchSection [${section.id}] error:`, err);
      setSectionsData(prev => ({
        ...prev,
        [section.id]: {
          ...section,
          products: [],
          error: err.message,
          loaded: true,
        }
      }));
    }
  }, [loadedSections]);

  const fetchAllSections = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch từng section song song
      await Promise.all(
        SHOP_SECTIONS.map(section => fetchSection(section))
      );
    } catch (err) {
      console.error('fetchAllSections error:', err);
      setError(err.message || 'Không thể tải sản phẩm');
    } finally {
      setLoading(false);
    }
  }, [fetchSection]);

  const refresh = useCallback(() => {
    setLoadedSections(new Set());
    setSectionsData({});
    return fetchAllSections();
  }, [fetchAllSections]);

  const getSectionData = useCallback((sectionId) => {
    return sectionsData[sectionId] || null;
  }, [sectionsData]);

  useEffect(() => {
    if (autoFetch) {
      fetchAllSections();
    }
  }, [autoFetch]);

  return {
    sectionsData,
    sections: SHOP_SECTIONS,
    loading,
    error,
    refresh,
    fetchAllSections,
    fetchSection,
    getSectionData,
  };
};

/**
 * Hook filter sản phẩm theo category tab
 * Sử dụng tags array từ SHOP_TABS config
 */
export const useFilteredProducts = (allProducts, categoryId) => {
  const [filteredProducts, setFilteredProducts] = useState([]);

  useEffect(() => {
    if (!allProducts?.length) {
      setFilteredProducts([]);
      return;
    }

    if (!categoryId || categoryId === 'all') {
      setFilteredProducts(allProducts);
      return;
    }

    // Lấy tags array từ SHOP_TABS config dựa trên categoryId
    const tabConfig = SHOP_TABS.find(tab => tab.id === categoryId);
    const tags = tabConfig?.tags || [];

    if (tags.length === 0) {
      // Không có tags config -> hiển thị tất cả
      setFilteredProducts(allProducts);
      return;
    }

    // Filter sản phẩm theo tags array (OR logic)
    const filtered = filterProductsByTags(allProducts, tags);
    setFilteredProducts(filtered);
  }, [allProducts, categoryId]);

  return filteredProducts;
};

/**
 * Hook tìm kiếm sản phẩm
 */
export const useProductSearch = (options = {}) => {
  const { limit = SHOP_DEFAULTS.productsPerPage } = options;

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');

  const search = useCallback(async (searchQuery) => {
    if (!searchQuery?.trim()) {
      setResults([]);
      setQuery('');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setQuery(searchQuery);

      const result = await shopifyService.searchProducts(searchQuery, limit);

      if (result?.products) {
        setResults(result.products);
      }
    } catch (err) {
      console.error('useProductSearch error:', err);
      setError(err.message || 'Không thể tìm kiếm');
    } finally {
      setLoading(false);
    }
  }, [limit]);

  const clear = useCallback(() => {
    setResults([]);
    setQuery('');
    setError(null);
  }, []);

  return {
    results,
    loading,
    error,
    query,
    search,
    clear,
  };
};

// Default export
export default {
  useAllProducts,
  useProductsByTag,
  useSectionProducts,
  useShopSections,
  useFilteredProducts,
  useProductSearch,
};
