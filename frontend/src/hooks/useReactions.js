/**
 * useReactions — Reaction state management with optimistic updates
 * Tracks current user's reaction and aggregate counts for a post
 */

import { useState, useCallback, useEffect } from 'react';
import forumService from '../services/forum';

const EMPTY_COUNTS = { like: 0, love: 0, haha: 0, wow: 0, sad: 0, angry: 0, total: 0 };

/**
 * @param {string} postId
 * @param {string|null} currentUserId
 * @returns {{ counts, myReaction, loading, toggleReaction, refresh }}
 */
export function useReactions(postId, currentUserId) {
  const [counts, setCounts] = useState(EMPTY_COUNTS);
  const [myReaction, setMyReaction] = useState(null); // null | 'like' | 'love' | ...
  const [loading, setLoading] = useState(false);

  /**
   * Fetch reaction counts and current user's reaction
   */
  const fetchReactions = useCallback(async () => {
    if (!postId) return;
    setLoading(true);
    try {
      const [countsData, allReactions] = await Promise.all([
        forumService.getReactionCounts(postId),
        currentUserId ? forumService.getReactions(postId) : Promise.resolve([]),
      ]);

      setCounts(countsData);

      // Find current user's reaction
      if (currentUserId) {
        const mine = allReactions.find(r => r.user_id === currentUserId);
        setMyReaction(mine?.type || null);
      }
    } catch (err) {
      console.error('useReactions fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [postId, currentUserId]);

  // Load on mount
  useEffect(() => {
    fetchReactions();
  }, [fetchReactions]);

  /**
   * Toggle a reaction type — optimistic update
   * @param {string} type - like|love|haha|wow|sad|angry
   */
  const toggleReaction = useCallback(async (type) => {
    if (!currentUserId || !postId) return;

    // Optimistic update
    const prevCounts = { ...counts };
    const prevMyReaction = myReaction;

    if (myReaction === type) {
      // Removing reaction
      setMyReaction(null);
      setCounts(prev => ({
        ...prev,
        [type]: Math.max(0, (prev[type] || 0) - 1),
        total: Math.max(0, (prev.total || 0) - 1),
      }));
    } else {
      // Adding or changing
      if (myReaction) {
        // Decrement old
        setCounts(prev => ({
          ...prev,
          [myReaction]: Math.max(0, (prev[myReaction] || 0) - 1),
          [type]: (prev[type] || 0) + 1,
        }));
      } else {
        setCounts(prev => ({
          ...prev,
          [type]: (prev[type] || 0) + 1,
          total: (prev.total || 0) + 1,
        }));
      }
      setMyReaction(type);
    }

    try {
      await forumService.toggleReaction(postId, type, currentUserId);
    } catch (err) {
      // Rollback on failure
      console.error('useReactions toggleReaction error:', err);
      setCounts(prevCounts);
      setMyReaction(prevMyReaction);
    }
  }, [postId, currentUserId, counts, myReaction]);

  return {
    counts,
    myReaction,
    loading,
    toggleReaction,
    refresh: fetchReactions,
  };
}

export default useReactions;
