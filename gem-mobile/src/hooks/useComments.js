/**
 * useComments Hook
 * Manage threaded comments state
 * Phase 3: Comment Threading (30/12/2024)
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { commentService } from '../services/commentService';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';

const INITIAL_REPLIES_LIMIT = 5;

/**
 * useComments - Hook for managing threaded comments
 * @param {string} postId - Post ID
 * @returns {Object} Comments state and handlers
 */
export const useComments = (postId) => {
  const { user } = useAuth();

  // State
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Reply mode state
  const [replyTo, setReplyTo] = useState(null); // { commentId, userId, userName }

  // Expanded threads
  const [expandedThreads, setExpandedThreads] = useState(new Set());

  // Loaded replies per comment
  const loadedRepliesRef = useRef(new Map()); // commentId -> replies[]

  /**
   * Fetch root comments
   */
  const fetchComments = useCallback(async () => {
    if (!postId) return;

    try {
      setLoading(true);
      setError(null);

      const data = await commentService.getRootComments(postId);
      setComments(data || []);
    } catch (err) {
      console.error('[useComments] Fetch error:', err);
      setError(err.message || 'Khong the tai binh luan');
    } finally {
      setLoading(false);
    }
  }, [postId]);

  /**
   * Load replies for a comment
   * @param {string} commentId - Parent comment ID
   * @param {number} offset - Offset for pagination
   * @returns {Array} Loaded replies
   */
  const loadReplies = useCallback(async (commentId, offset = 0) => {
    try {
      const replies = await commentService.getReplies(
        commentId,
        INITIAL_REPLIES_LIMIT,
        offset
      );

      // Store in ref
      const existing = loadedRepliesRef.current.get(commentId) || [];
      if (offset === 0) {
        loadedRepliesRef.current.set(commentId, replies);
      } else {
        loadedRepliesRef.current.set(commentId, [...existing, ...replies]);
      }

      // Expand thread
      setExpandedThreads((prev) => new Set([...prev, commentId]));

      // Force re-render
      setComments((prev) => [...prev]);

      return replies;
    } catch (err) {
      console.error('[useComments] Load replies error:', err);
      throw err;
    }
  }, []);

  /**
   * Get replies for a comment from cache
   * @param {string} commentId - Comment ID
   * @returns {Array} Cached replies
   */
  const getReplies = useCallback((commentId) => {
    return loadedRepliesRef.current.get(commentId) || [];
  }, []);

  /**
   * Check if thread is expanded
   * @param {string} commentId - Comment ID
   * @returns {boolean} Is expanded
   */
  const isExpanded = useCallback((commentId) => {
    return expandedThreads.has(commentId);
  }, [expandedThreads]);

  /**
   * Toggle thread expand/collapse
   * @param {string} commentId - Comment ID
   */
  const toggleThread = useCallback((commentId) => {
    setExpandedThreads((prev) => {
      const next = new Set(prev);
      if (next.has(commentId)) {
        next.delete(commentId);
      } else {
        next.add(commentId);
        // Load replies if not loaded
        if (!loadedRepliesRef.current.has(commentId)) {
          loadReplies(commentId);
        }
      }
      return next;
    });
  }, [loadReplies]);

  /**
   * Create comment or reply
   * @param {string} content - Comment content
   * @returns {Object} Created comment
   */
  const createComment = useCallback(async (content) => {
    // Validate inputs
    if (!postId) {
      console.error('[useComments] Missing postId');
      throw new Error('Post ID is required');
    }
    if (!user?.id) {
      console.error('[useComments] User not authenticated');
      throw new Error('Bạn cần đăng nhập để bình luận');
    }
    if (!content?.trim()) {
      console.error('[useComments] Empty content');
      throw new Error('Nội dung không được để trống');
    }

    try {
      const commentData = {
        post_id: postId,
        user_id: user.id,
        content: content.trim(),
      };

      // If replying (only pass parent_id, reply_to_user_id doesn't exist in DB)
      if (replyTo) {
        commentData.parent_id = replyTo.commentId;
      }

      console.log('[useComments] Creating comment:', commentData);
      const newComment = await commentService.createComment(commentData);
      console.log('[useComments] Comment created:', newComment?.id);

      // Update state
      if (replyTo) {
        // Add to replies
        const parentId = replyTo.commentId;
        const existing = loadedRepliesRef.current.get(parentId) || [];
        loadedRepliesRef.current.set(parentId, [...existing, newComment]);

        // Expand thread
        setExpandedThreads((prev) => new Set([...prev, parentId]));

        // Update parent's replies_count
        setComments((prev) =>
          prev.map((c) =>
            c.id === parentId
              ? { ...c, replies_count: (c.replies_count || 0) + 1 }
              : c
          )
        );
      } else {
        // Add to root comments
        setComments((prev) => [newComment, ...prev]);
      }

      // Clear reply mode
      setReplyTo(null);

      return newComment;
    } catch (err) {
      console.error('[useComments] Create error:', err);
      throw err;
    }
  }, [postId, user?.id, replyTo]);

  /**
   * Delete comment
   * @param {string} commentId - Comment ID
   * @param {string} parentId - Parent ID (if reply)
   */
  const deleteComment = useCallback(async (commentId, parentId = null) => {
    try {
      await commentService.deleteComment(commentId);

      if (parentId) {
        // Remove from replies
        const existing = loadedRepliesRef.current.get(parentId) || [];
        loadedRepliesRef.current.set(
          parentId,
          existing.filter((r) => r.id !== commentId)
        );

        // Update parent's replies_count
        setComments((prev) =>
          prev.map((c) =>
            c.id === parentId
              ? { ...c, replies_count: Math.max(0, (c.replies_count || 1) - 1) }
              : c
          )
        );
      } else {
        // Remove from root comments
        setComments((prev) => prev.filter((c) => c.id !== commentId));
      }
    } catch (err) {
      console.error('[useComments] Delete error:', err);
      throw err;
    }
  }, []);

  /**
   * Set reply mode
   * @param {Object} comment - Comment to reply to
   */
  const startReply = useCallback((comment) => {
    setReplyTo({
      commentId: comment.parent_id || comment.id, // Reply to root if nested
      userId: comment.user_id,
      authorName: comment.author_name || comment.author?.full_name || comment.author?.display_name || 'Người dùng',
    });
  }, []);

  /**
   * Cancel reply mode
   */
  const cancelReply = useCallback(() => {
    setReplyTo(null);
  }, []);

  /**
   * Refresh comments
   */
  const refresh = useCallback(async () => {
    setRefreshing(true);
    loadedRepliesRef.current.clear();
    setExpandedThreads(new Set());
    await fetchComments();
    setRefreshing(false);
  }, [fetchComments]);

  // Initial fetch
  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  // Realtime subscription
  useEffect(() => {
    if (!postId) return;

    const channel = supabase
      .channel(`comments:${postId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'forum_comments',
          filter: `post_id=eq.${postId}`,
        },
        async (payload) => {
          // Don't add if it's our own comment (already added optimistically)
          if (payload.new.user_id === user?.id) return;

          try {
            // Fetch full comment with user info
            const fullComment = await commentService.getComment(payload.new.id);

            if (payload.new.parent_id) {
              // It's a reply
              const parentId = payload.new.parent_id;
              const existing = loadedRepliesRef.current.get(parentId) || [];
              loadedRepliesRef.current.set(parentId, [...existing, fullComment]);

              // Update parent's replies_count
              setComments((prev) =>
                prev.map((c) =>
                  c.id === parentId
                    ? { ...c, replies_count: (c.replies_count || 0) + 1 }
                    : c
                )
              );
            } else {
              // It's a root comment
              setComments((prev) => [fullComment, ...prev]);
            }
          } catch (err) {
            console.error('[useComments] Realtime fetch error:', err);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'forum_comments',
          filter: `post_id=eq.${postId}`,
        },
        (payload) => {
          // Don't process if it's our own delete (already handled)
          if (payload.old.user_id === user?.id) return;

          if (payload.old.parent_id) {
            const parentId = payload.old.parent_id;
            const existing = loadedRepliesRef.current.get(parentId) || [];
            loadedRepliesRef.current.set(
              parentId,
              existing.filter((r) => r.id !== payload.old.id)
            );
          } else {
            setComments((prev) => prev.filter((c) => c.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [postId, user?.id]);

  return {
    comments,
    loading,
    error,
    refreshing,
    replyTo,
    getReplies,
    isExpanded,
    loadReplies,
    toggleThread,
    createComment,
    deleteComment,
    startReply,
    cancelReply,
    refresh,
  };
};

export default useComments;
