/**
 * useFeed Hook
 * Manage feed state with different feed types
 * Phase 4: View Count & Algorithm (30/12/2024)
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';

/**
 * Feed type configurations
 */
const FEED_CONFIGS = {
  latest: {
    orderBy: 'created_at',
    ascending: false,
    label: 'Moi nhat',
  },
  hot: {
    orderBy: 'hot_score',
    ascending: false,
    label: 'Noi bat',
  },
  trending: {
    orderBy: 'trending_score',
    ascending: false,
    label: 'Xu huong',
  },
  foryou: {
    orderBy: 'hot_score',
    ascending: false,
    personalized: true,
    label: 'Cho ban',
  },
};

const PAGE_SIZE = 20;

// Common select query for posts
const POST_SELECT_QUERY = `
  *,
  profiles:user_id (
    id,
    username,
    full_name,
    avatar_url,
    role,
    scanner_tier,
    chatbot_tier,
    verified_seller,
    verified_trader,
    level_badge,
    role_badge,
    achievement_badges
  ),
  categories:category_id (
    id,
    name,
    color
  )
`;

/**
 * useFeed - Hook for managing feed with different types
 *
 * @param {string} initialType - Initial feed type ('latest', 'hot', 'trending', 'foryou')
 * @returns {Object} Feed state and handlers
 */
export const useFeed = (initialType = 'latest') => {
  const { user } = useAuth();

  // State
  const [feedType, setFeedType] = useState(initialType);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);

  // Refs
  const isMountedRef = useRef(true);
  const loadingRef = useRef(false);

  // Get config for current feed type
  const config = useMemo(() => FEED_CONFIGS[feedType] || FEED_CONFIGS.latest, [feedType]);

  /**
   * Fetch posts from database
   */
  const fetchPosts = useCallback(async (pageNum = 0, isRefresh = false) => {
    // Prevent duplicate calls
    if (loadingRef.current) return;
    loadingRef.current = true;

    try {
      if (isRefresh) {
        setRefreshing(true);
      } else if (pageNum === 0) {
        setLoading(true);
      }
      setError(null);

      // Build query
      let query = supabase
        .from('forum_posts')
        .select(POST_SELECT_QUERY)
        .or('is_deleted.is.null,is_deleted.eq.false')
        .eq('status', 'published');

      // Add ordering
      query = query.order(config.orderBy, { ascending: config.ascending });

      // Add pagination
      const from = pageNum * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      query = query.range(from, to);

      const { data, error: queryError } = await query;

      if (queryError) throw queryError;

      if (!isMountedRef.current) return;

      // Transform posts for PostCard compatibility
      const transformedPosts = (data || []).map(post => ({
        ...post,
        author: post.profiles,
        category: post.categories,
      }));

      if (pageNum === 0) {
        setPosts(transformedPosts);
      } else {
        setPosts(prev => {
          // Deduplicate
          const existingIds = new Set(prev.map(p => p.id));
          const newPosts = transformedPosts.filter(p => !existingIds.has(p.id));
          return [...prev, ...newPosts];
        });
      }

      setHasMore(transformedPosts.length === PAGE_SIZE);
      setPage(pageNum);

    } catch (err) {
      console.error('[useFeed] Fetch error:', err);
      if (isMountedRef.current) {
        setError(err?.message || 'Khong the tai bai viet');
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
        setRefreshing(false);
      }
      loadingRef.current = false;
    }
  }, [config]);

  /**
   * Change feed type
   */
  const changeFeedType = useCallback((newType) => {
    if (newType === feedType) return;
    if (!FEED_CONFIGS[newType]) {
      console.warn('[useFeed] Unknown feed type:', newType);
      return;
    }

    setFeedType(newType);
    setPage(0);
    setHasMore(true);
    setPosts([]);
  }, [feedType]);

  /**
   * Load more posts
   */
  const loadMore = useCallback(() => {
    if (!loading && !refreshing && hasMore && !loadingRef.current) {
      fetchPosts(page + 1);
    }
  }, [loading, refreshing, hasMore, page, fetchPosts]);

  /**
   * Refresh feed
   */
  const refresh = useCallback(() => {
    setPage(0);
    setHasMore(true);
    fetchPosts(0, true);
  }, [fetchPosts]);

  // Initial fetch and refetch on type change
  useEffect(() => {
    fetchPosts(0);
  }, [feedType]); // Re-fetch when feedType changes

  // Cleanup
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return {
    feedType,
    posts,
    loading,
    error,
    refreshing,
    hasMore,
    changeFeedType,
    loadMore,
    refresh,
    config,
  };
};

export default useFeed;
