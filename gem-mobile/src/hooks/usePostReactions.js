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
import { formatError } from '../utils/errorUtils';
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

  // Ref for immediate blocking of multiple rapid clicks
  // (React state updates are async, so loading state alone can't prevent race conditions)
  const isProcessingRef = useRef(false);

  // Ref to track current reaction synchronously (state updates are async)
  // This ensures we always know the ACTUAL current reaction when calculating optimistic updates
  const currentReactionRef = useRef(initialUserReaction);

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
      currentReactionRef.current = initialUserReaction; // Sync ref
      setUserReaction(initialUserReaction);
      return;
    }

    // Otherwise fetch from API
    const fetchUserReaction = async () => {
      try {
        const reaction = await reactionService.getUserReaction(postId, userId);
        const reactionType = reaction?.reaction_type || null;
        currentReactionRef.current = reactionType; // Sync ref
        setUserReaction(reactionType);
      } catch (err) {
        console.error('[usePostReactions] Fetch error:', formatError(err));
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
   * Enforces one reaction per user per post with immediate blocking
   * @param {string} reactionType - Reaction type to add
   */
  const addReaction = useCallback(
    async (reactionType) => {
      // Use ref for immediate blocking (state updates are async)
      if (!postId || !userId || isProcessingRef.current) {
        console.log('[usePostReactions] Blocked: already processing or missing params');
        return;
      }

      // Immediately block further calls
      isProcessingRef.current = true;

      // Get the ACTUAL current reaction from ref (not state, which might be stale)
      const oldReaction = currentReactionRef.current;

      // Save current state for rollback
      previousReactionRef.current = oldReaction;
      previousCountsRef.current = { ...reactionCounts };

      // Update ref immediately (synchronous) before state (async)
      currentReactionRef.current = reactionType;

      // Optimistic update
      setLoading(true);
      setError(null);
      setUserReaction(reactionType);
      updateCountsOptimistically(reactionType, oldReaction);

      try {
        await reactionService.addReaction(postId, userId, reactionType);
        console.log('[usePostReactions] Reaction added:', reactionType, 'oldReaction:', oldReaction);
      } catch (err) {
        // Rollback on error
        console.error('[usePostReactions] Add error:', formatError(err));
        currentReactionRef.current = previousReactionRef.current; // Rollback ref
        setUserReaction(previousReactionRef.current);
        setReactionCounts(previousCountsRef.current);
        setError(err?.message || 'Có lỗi xảy ra');
      } finally {
        setLoading(false);
        isProcessingRef.current = false; // Release lock
      }
    },
    [postId, userId, reactionCounts, updateCountsOptimistically]
  );

  /**
   * Remove the current reaction
   * Uses immediate blocking to prevent multiple rapid calls
   */
  const removeReaction = useCallback(async () => {
    // Get current reaction from ref (more reliable than state)
    const currentReaction = currentReactionRef.current;

    // Use ref for immediate blocking (state updates are async)
    if (!postId || !userId || !currentReaction || isProcessingRef.current) {
      console.log('[usePostReactions] Remove blocked: already processing or no reaction');
      return;
    }

    // Immediately block further calls
    isProcessingRef.current = true;

    // Save current state for rollback
    previousReactionRef.current = currentReaction;
    previousCountsRef.current = { ...reactionCounts };

    // Update ref immediately (synchronous)
    currentReactionRef.current = null;

    // Optimistic update
    setLoading(true);
    setError(null);
    setUserReaction(null);

    setReactionCounts((prev) => {
      const newCounts = { ...prev };
      if (currentReaction && newCounts[currentReaction] > 0) {
        newCounts[currentReaction] = newCounts[currentReaction] - 1;
        newCounts.total = Math.max(0, (newCounts.total || 0) - 1);
      }
      return newCounts;
    });

    try {
      await reactionService.removeReaction(postId, userId);
      console.log('[usePostReactions] Reaction removed');
    } catch (err) {
      // Rollback on error
      console.error('[usePostReactions] Remove error:', formatError(err));
      currentReactionRef.current = previousReactionRef.current; // Rollback ref
      setUserReaction(previousReactionRef.current);
      setReactionCounts(previousCountsRef.current);
      setError(err?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
      isProcessingRef.current = false; // Release lock
    }
  }, [postId, userId, reactionCounts]);

  /**
   * Toggle reaction (tap behavior)
   * - If no reaction: add 'like'
   * - If same reaction: remove it
   * - If different reaction: change to new one
   * Uses immediate blocking to prevent rapid taps
   *
   * @param {string} reactionType - Reaction type to toggle (default: 'like')
   */
  const toggleReaction = useCallback(
    async (reactionType = 'like') => {
      // Block if already processing
      if (isProcessingRef.current) {
        console.log('[usePostReactions] Toggle blocked: already processing');
        return;
      }

      // Use ref for accurate current reaction (state might be stale)
      const currentReaction = currentReactionRef.current;

      if (currentReaction === reactionType) {
        // Same reaction - remove it
        await removeReaction();
      } else {
        // Different or no reaction - add/change it
        await addReaction(reactionType);
      }
    },
    [addReaction, removeReaction]
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
      console.error('[usePostReactions] Refresh counts error:', formatError(err));
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
