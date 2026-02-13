/**
 * useInfiniteProducts Hook
 * Infinite scroll pagination for products
 * Uses Intersection Observer for efficient loading
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useShopStore } from '../stores/shopStore';

const PRODUCTS_PER_PAGE = 12;

export function useInfiniteProducts(options = {}) {
  const {
    category = 'all',
    priceRange = 'all',
    sortBy = 'newest',
    searchQuery = ''
  } = options;

  const { products, loading: storeLoading, fetchProducts } = useShopStore();

  const [displayedProducts, setDisplayedProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const observerRef = useRef(null);
  const lastProductRef = useRef(null);

  // Filter products based on criteria
  const filterProducts = useCallback(() => {
    let filtered = [...products];

    // Filter by category
    if (category !== 'all') {
      filtered = filtered.filter(p => {
        const tags = p.tags?.join(' ').toLowerCase() || '';
        const productType = p.productType?.toLowerCase() || '';
        return tags.includes(category) || productType.includes(category);
      });
    }

    // Filter by price range
    if (priceRange !== 'all') {
      const [min, max] = priceRange.split('-').map(Number);
      filtered = filtered.filter(p => {
        const price = parseFloat(p.variants?.edges?.[0]?.node?.priceV2?.amount || 0);
        if (max) {
          return price >= min && price <= max;
        }
        return price >= min;
      });
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.title?.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query) ||
        p.tags?.join(' ').toLowerCase().includes(query)
      );
    }

    // Sort products
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        break;
      case 'price-asc':
        filtered.sort((a, b) => {
          const priceA = parseFloat(a.variants?.edges?.[0]?.node?.priceV2?.amount || 0);
          const priceB = parseFloat(b.variants?.edges?.[0]?.node?.priceV2?.amount || 0);
          return priceA - priceB;
        });
        break;
      case 'price-desc':
        filtered.sort((a, b) => {
          const priceA = parseFloat(a.variants?.edges?.[0]?.node?.priceV2?.amount || 0);
          const priceB = parseFloat(b.variants?.edges?.[0]?.node?.priceV2?.amount || 0);
          return priceB - priceA;
        });
        break;
      case 'popular':
        // Sort by some popularity metric if available
        break;
      default:
        break;
    }

    return filtered;
  }, [products, category, priceRange, sortBy, searchQuery]);

  // Reset and reload when filters change
  useEffect(() => {
    setPage(1);
    const filtered = filterProducts();
    setDisplayedProducts(filtered.slice(0, PRODUCTS_PER_PAGE));
    setHasMore(filtered.length > PRODUCTS_PER_PAGE);
  }, [category, priceRange, sortBy, searchQuery, filterProducts]);

  // Load more products
  const loadMore = useCallback(() => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);

    // Simulate loading delay for smooth UX
    setTimeout(() => {
      const filtered = filterProducts();
      const nextPage = page + 1;
      const startIndex = page * PRODUCTS_PER_PAGE;
      const endIndex = startIndex + PRODUCTS_PER_PAGE;
      const newProducts = filtered.slice(startIndex, endIndex);

      if (newProducts.length > 0) {
        setDisplayedProducts(prev => [...prev, ...newProducts]);
        setPage(nextPage);
        setHasMore(endIndex < filtered.length);
      } else {
        setHasMore(false);
      }

      setIsLoadingMore(false);
    }, 300);
  }, [page, hasMore, isLoadingMore, filterProducts]);

  // Set up Intersection Observer for infinite scroll
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          loadMore();
        }
      },
      {
        root: null,
        rootMargin: '100px',
        threshold: 0.1
      }
    );

    if (lastProductRef.current) {
      observerRef.current.observe(lastProductRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, isLoadingMore, loadMore]);

  // Set ref for last product element
  const setLastProductRef = useCallback((element) => {
    lastProductRef.current = element;

    if (observerRef.current && element) {
      observerRef.current.observe(element);
    }
  }, []);

  // Refresh products
  const refresh = useCallback(async () => {
    await fetchProducts();
    setPage(1);
    const filtered = filterProducts();
    setDisplayedProducts(filtered.slice(0, PRODUCTS_PER_PAGE));
    setHasMore(filtered.length > PRODUCTS_PER_PAGE);
  }, [fetchProducts, filterProducts]);

  return {
    products: displayedProducts,
    loading: storeLoading,
    isLoadingMore,
    hasMore,
    loadMore,
    refresh,
    setLastProductRef,
    totalCount: filterProducts().length,
    displayedCount: displayedProducts.length
  };
}

export default useInfiniteProducts;
