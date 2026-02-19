/**
 * usePosts — Infinite scroll hook for forum post feeds
 * Manages pagination, loading, refresh, and feed type switching
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import feedService from '../services/feedService';
import forumService from '../services/forum';

/**
 * @param {'personalized'|'following'|'popular'|'latest'|'academy'|'hashtag'|'custom'} feedType
 * @param {{ userId?: string, hashtag?: string, feedId?: string, limit?: number }} options
 * @returns {{ posts, loading, hasMore, error, fetchNextPage, refresh }}
 */
export function usePosts(feedType = 'latest', options = {}) {
  const { userId, hashtag, feedId, limit = 20 } = options;

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);
  const pageRef = useRef(1);
  const fetchingRef = useRef(false);

  /**
   * Fetch a page of posts based on feed type
   * @param {number} page
   */
  const fetchPage = useCallback(async (page) => {
    const opts = { page, limit };

    switch (feedType) {
      case 'personalized':
        return feedService.getPersonalizedFeed(userId, opts);
      case 'following':
        return feedService.getFollowingFeed(userId, opts);
      case 'popular':
        return feedService.getPopularFeed(opts);
      case 'latest':
        return feedService.getLatestFeed(opts);
      case 'academy':
        return feedService.getAcademyFeed(opts);
      case 'hashtag':
        return forumService.getPostsByHashtag(hashtag, page, limit);
      case 'custom':
        return feedService.getCustomFeedPosts(feedId, opts);
      default:
        return feedService.getLatestFeed(opts);
    }
  }, [feedType, userId, hashtag, feedId, limit]);

  /**
   * Load next page — appends to existing posts
   */
  const fetchNextPage = useCallback(async () => {
    if (fetchingRef.current || !hasMore) return;
    fetchingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const result = await fetchPage(pageRef.current);
      const newPosts = result.posts || result.threads || [];

      if (newPosts.length < limit) {
        setHasMore(false);
      }

      setPosts(prev => pageRef.current === 1 ? newPosts : [...prev, ...newPosts]);
      pageRef.current += 1;
    } catch (err) {
      console.error('usePosts fetchNextPage error:', err);
      setError(err);
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, [fetchPage, hasMore, limit]);

  /**
   * Reset and reload from page 1
   */
  const refresh = useCallback(async () => {
    pageRef.current = 1;
    setHasMore(true);
    setPosts([]);
    setError(null);
    fetchingRef.current = false;
    // Will trigger useEffect
  }, []);

  // Load first page on mount and when feedType/key deps change
  useEffect(() => {
    pageRef.current = 1;
    setHasMore(true);
    setPosts([]);
    setError(null);
    fetchingRef.current = false;

    // Fetch first page
    const load = async () => {
      fetchingRef.current = true;
      setLoading(true);
      try {
        const result = await fetchPage(1);
        const newPosts = result.posts || result.threads || [];
        setPosts(newPosts);
        setHasMore(newPosts.length >= limit);
        pageRef.current = 2;
      } catch (err) {
        console.error('usePosts initial load error:', err);
        setError(err);
      } finally {
        setLoading(false);
        fetchingRef.current = false;
      }
    };

    load();
  }, [feedType, userId, hashtag, feedId]); // eslint-disable-line react-hooks/exhaustive-deps

  return { posts, loading, hasMore, error, fetchNextPage, refresh };
}

export default usePosts;
