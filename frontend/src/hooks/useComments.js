/**
 * useComments — Threaded comments hook
 * Manages comment tree, CRUD, and reactions for a post
 */

import { useState, useCallback, useEffect } from 'react';
import commentService from '../services/commentService';

/**
 * @param {string} postId
 * @returns {{ comments, loading, error, addComment, editComment, deleteComment, toggleReaction, refresh }}
 */
export function useComments(postId) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetch threaded comments for the post
   */
  const fetchComments = useCallback(async () => {
    if (!postId) return;
    setLoading(true);
    setError(null);
    try {
      const tree = await commentService.getThreadedComments(postId);
      setComments(tree);
    } catch (err) {
      console.error('useComments fetch error:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  // Load on mount / postId change
  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  /**
   * Add a new comment (top-level or reply)
   * @param {string} content
   * @param {string} userId
   * @param {string|null} parentId
   * @param {string|null} replyToUserId
   * @returns {Object} Created comment
   */
  const addComment = useCallback(async (content, userId, parentId = null, replyToUserId = null) => {
    try {
      const comment = await commentService.createComment(postId, content, userId, parentId, replyToUserId);
      // Re-fetch to get proper tree structure
      await fetchComments();
      return comment;
    } catch (err) {
      console.error('useComments addComment error:', err);
      throw err;
    }
  }, [postId, fetchComments]);

  /**
   * Edit an existing comment
   * @param {string} commentId
   * @param {string} content
   * @returns {Object}
   */
  const editComment = useCallback(async (commentId, content) => {
    try {
      const updated = await commentService.updateComment(commentId, content);
      await fetchComments();
      return updated;
    } catch (err) {
      console.error('useComments editComment error:', err);
      throw err;
    }
  }, [fetchComments]);

  /**
   * Delete a comment
   * @param {string} commentId
   */
  const deleteComment = useCallback(async (commentId) => {
    try {
      await commentService.deleteComment(commentId);
      await fetchComments();
    } catch (err) {
      console.error('useComments deleteComment error:', err);
      throw err;
    }
  }, [fetchComments]);

  /**
   * Toggle reaction on a comment
   * @param {string} commentId
   * @param {string} type
   * @param {string} userId
   */
  const toggleReaction = useCallback(async (commentId, type, userId) => {
    try {
      return await commentService.toggleCommentReaction(commentId, type, userId);
    } catch (err) {
      console.error('useComments toggleReaction error:', err);
      throw err;
    }
  }, []);

  return {
    comments,
    loading,
    error,
    addComment,
    editComment,
    deleteComment,
    toggleReaction,
    refresh: fetchComments,
  };
}

export default useComments;
