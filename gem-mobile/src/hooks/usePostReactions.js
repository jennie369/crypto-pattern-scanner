/**
 * usePostReactions Hook
 * Manages post reaction state with optimistic updates and realtime sync
 *
 * Features:
 * - Fetch user's current reaction
 * - Add/update/remove reactions
 * - Optimistic UI updates with rollback on error
 * - Realtime subscription for live count updates
 * - Top reactions calculation
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import reactionService from '../services/reactionService';
import {
  REACTION_ORDER,
  DEFAULT_REACTION_COUNTS,
} from '../constants/reactions';

/**
 * Custom hook for managing post reactions
 *
 * @param {string} postId - Post ID to manage reactions for
 * @param {Object|null} initialCounts - Initial reaction counts from post data
 * @param {string|null} initialUserReaction - Initial user reaction from post data
 * @returns {Object} Reaction state and handlers
 */
export const usePostReactions = (
  postId,
  initialCounts = null,
  initialUserReaction = null
) => {
  const { user } = useAuth();
  const userId = user?.id;

  // State
  const [userReaction, setUserReaction] = useState(initialUserReaction);
  const [reactionCounts, setReactionCounts] = useState(
    initialCounts || { ...DEFAULT_REACTION_COUNTS }
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Refs for optimistic updates rollback
  const previousReactionRef = useRef(null);
  const previousCountsRef = useRef(null);
  const subscriptionRef = useRef(null);

  /**
   * Calculate total count
   */
  const totalCount = useMemo(() => {
    return reactionCounts?.total || 0;
  }, [reactionCounts]);

  /**
   * Calculate top 3 reactions (sorted by count, only non-zero)
   */
  const topReactions = useMemo(() => {
    if (!reactionCounts || typeof reactionCounts !== 'object') {
      return [];
    }

    return REACTION_ORDER
      .filter((type) => (reactionCounts[type] || 0) > 0)
      .sort((a, b) => (reactionCounts[b] || 0) - (reactionCounts[a] || 0))
      .slice(0, 3)
      .map((type) => ({
        type,
        count: reactionCounts[type] || 0,
      }));
  }, [reactionCounts]);

  /**
   * Fetch user's current reaction on mount
   */
  useEffect(() => {
    if (!postId || !userId) return;

    // If initial reaction was provided, use it
    if (initialUserReaction !== null) {
      setUserReaction(initialUserReaction);
      return;
    }

    // Otherwise fetch from API
    const fetchUserReaction = async () => {
      try {
        const reaction = await reactionService.getUserReaction(postId, userId);
        setUserReaction(reaction?.reaction_type || null);
      } catch (err) {
        console.error('[usePostReactions] Fetch error:', err);
      }
    };

    fetchUserReaction();
  }, [postId, userId, initialUserReaction]);

  /**
   * Subscribe to realtime reaction count updates
   */
  useEffect(() => {
    if (!postId) return;

    // Subscribe to reaction counts changes
    subscriptionRef.current = reactionService.subscribeToReactionCounts(
      postId,
      (newCounts) => {
        setReactionCounts(newCounts);
      }
    );

    return () => {
      // Cleanup subscription
      if (subscriptionRef.current) {
        reactionService.unsubscribe(subscriptionRef.current);
        subscriptionRef.current = null;
      }
    };
  }, [postId]);

  /**
   * Update counts optimistically when adding a reaction
   * @param {string} newType - New reaction type
   * @param {string|null} oldType - Previous reaction type (null if none)
   */
  const updateCountsOptimistically = useCallback((newType, oldType) => {
    setReactionCounts((prev) => {
      const newCounts = { ...prev };

      // Decrement old reaction if exists
      if (oldType && newCounts[oldType] > 0) {
        newCounts[oldType] = newCounts[oldType] - 1;
        newCounts.total = Math.max(0, (newCounts.total || 0) - 1);
      }

      // Increment new reaction
      if (newType) {
        newCounts[newType] = (newCounts[newType] || 0) + 1;
        newCounts.total = (newCounts.total || 0) + 1;
      }

      return newCounts;
    });
  }, []);

  /**
   * Add or update a reaction
   * @param {string} reactionType - Reaction type to add
   */
  const addReaction = useCallback(
    async (reactionType) => {
      if (!postId || !userId || loading) return;

      // Save current state for rollback
      previousReactionRef.current = userReaction;
      previousCountsRef.current = { ...reactionCounts };

      // Optimistic update
      setLoading(true);
      setError(null);
      setUserReaction(reactionType);
      updateCountsOptimistically(reactionType, userReaction);

      try {
        await reactionService.addReaction(postId, userId, reactionType);
        console.log('[usePostReactions] Reaction added:', reactionType);
      } catch (err) {
        // Rollback on error
        console.error('[usePostReactions] Add error:', err);
        setUserReaction(previousReactionRef.current);
        setReactionCounts(previousCountsRef.current);
        setError(err?.message || 'Có lỗi xảy ra');
      } finally {
        setLoading(false);
      }
    },
    [postId, userId, userReaction, reactionCounts, loading, updateCountsOptimistically]
  );

  /**
   * Remove the current reaction
   */
  const removeReaction = useCallback(async () => {
    if (!postId || !userId || !userReaction || loading) return;

    // Save current state for rollback
    previousReactionRef.current = userReaction;
    previousCountsRef.current = { ...reactionCounts };

    // Optimistic update
    setLoading(true);
    setError(null);

    const oldType = userReaction;
    setUserReaction(null);

    setReactionCounts((prev) => {
      const newCounts = { ...prev };
      if (oldType && newCounts[oldType] > 0) {
        newCounts[oldType] = newCounts[oldType] - 1;
        newCounts.total = Math.max(0, (newCounts.total || 0) - 1);
      }
      return newCounts;
    });

    try {
      await reactionService.removeReaction(postId, userId);
      console.log('[usePostReactions] Reaction removed');
    } catch (err) {
      // Rollback on error
      console.error('[usePostReactions] Remove error:', err);
      setUserReaction(previousReactionRef.current);
      setReactionCounts(previousCountsRef.current);
      setError(err?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  }, [postId, userId, userReaction, reactionCounts, loading]);

  /**
   * Toggle reaction (tap behavior)
   * - If no reaction: add 'like'
   * - If same reaction: remove it
   * - If different reaction: change to new one
   *
   * @param {string} reactionType - Reaction type to toggle (default: 'like')
   */
  const toggleReaction = useCallback(
    async (reactionType = 'like') => {
      if (userReaction === reactionType) {
        // Same reaction - remove it
        await removeReaction();
      } else {
        // Different or no reaction - add/change it
        await addReaction(reactionType);
      }
    },
    [userReaction, addReaction, removeReaction]
  );

  /**
   * Check if user has reacted
   */
  const hasReacted = useMemo(() => {
    return !!userReaction;
  }, [userReaction]);

  /**
   * Refresh reaction counts from server
   */
  const refreshCounts = useCallback(async () => {
    if (!postId) return;

    try {
      const counts = await reactionService.getReactionCounts(postId);
      setReactionCounts(counts);
    } catch (err) {
      console.error('[usePostReactions] Refresh counts error:', err);
    }
  }, [postId]);

  return {
    // State
    userReaction,
    reactionCounts,
    totalCount,
    topReactions,
    hasReacted,
    loading,
    error,

    // Actions
    addReaction,
    removeReaction,
    toggleReaction,
    refreshCounts,

    // Utilities
    formatCount: reactionService.formatCount,
  };
};

export default usePostReactions;
