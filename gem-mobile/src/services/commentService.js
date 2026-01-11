/**
 * Comment Service
 * API service for threaded comments
 * Phase 3: Comment Threading (30/12/2024)
 */

import { supabase } from './supabase';

const INITIAL_REPLIES_LIMIT = 5;

class CommentService {
  /**
   * Get root comments for a post (parent_id IS NULL)
   * @param {string} postId - Post ID
   * @param {number} limit - Max comments to fetch
   * @param {number} offset - Offset for pagination
   * @returns {Array} Root comments with author info
   */
  async getRootComments(postId, limit = 20, offset = 0) {
    try {
      const { data, error } = await supabase
        .from('forum_comments')
        .select(`
          *,
          author:user_id(
            id,
            display_name,
            full_name,
            avatar_url,
            username
          )
        `)
        .eq('post_id', postId)
        .is('parent_id', null)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      // Transform to flat structure
      return (data || []).map(comment => ({
        ...comment,
        author_name: comment.author?.display_name || comment.author?.full_name || comment.author?.username || 'Người dùng',
        author_avatar: comment.author?.avatar_url,
        author_username: comment.author?.username,
      }));
    } catch (err) {
      console.error('[CommentService] getRootComments error:', err);
      throw err;
    }
  }

  /**
   * Get replies for a comment
   * @param {string} parentId - Parent comment ID
   * @param {number} limit - Max replies to fetch
   * @param {number} offset - Offset for pagination
   * @returns {Array} Replies with author info
   */
  async getReplies(parentId, limit = INITIAL_REPLIES_LIMIT, offset = 0) {
    try {
      const { data, error } = await supabase
        .from('forum_comments')
        .select(`
          *,
          author:user_id(
            id,
            display_name,
            full_name,
            avatar_url,
            username
          ),
          reply_to_user:reply_to_user_id(
            id,
            display_name,
            full_name,
            username
          )
        `)
        .eq('parent_id', parentId)
        .order('created_at', { ascending: true })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return (data || []).map(comment => ({
        ...comment,
        author_name: comment.author?.display_name || comment.author?.full_name || comment.author?.username || 'Người dùng',
        author_avatar: comment.author?.avatar_url,
        author_username: comment.author?.username,
        reply_to_name: comment.reply_to_user?.display_name || comment.reply_to_user?.full_name || comment.reply_to_user?.username,
      }));
    } catch (err) {
      console.error('[CommentService] getReplies error:', err);
      throw err;
    }
  }

  /**
   * Get single comment with user info
   * @param {string} commentId - Comment ID
   * @returns {Object} Comment with author info
   */
  async getComment(commentId) {
    try {
      const { data, error } = await supabase
        .from('forum_comments')
        .select(`
          *,
          author:user_id(
            id,
            display_name,
            full_name,
            avatar_url,
            username
          ),
          reply_to_user:reply_to_user_id(
            id,
            display_name,
            full_name,
            username
          )
        `)
        .eq('id', commentId)
        .single();

      if (error) throw error;

      return {
        ...data,
        author_name: data.author?.display_name || data.author?.full_name || data.author?.username || 'Người dùng',
        author_avatar: data.author?.avatar_url,
        author_username: data.author?.username,
        reply_to_name: data.reply_to_user?.display_name || data.reply_to_user?.full_name || data.reply_to_user?.username,
      };
    } catch (err) {
      console.error('[CommentService] getComment error:', err);
      throw err;
    }
  }

  /**
   * Create comment or reply
   * @param {Object} params
   * @param {string} params.post_id - Post ID
   * @param {string} params.user_id - User ID
   * @param {string} params.content - Comment content
   * @param {string} params.parent_id - Parent comment ID (for replies)
   * @param {string} params.reply_to_user_id - User being replied to
   * @returns {Object} Created comment
   */
  async createComment({
    post_id,
    user_id,
    content,
    parent_id = null,
    reply_to_user_id = null,
  }) {
    try {
      const { data, error } = await supabase
        .from('forum_comments')
        .insert({
          post_id,
          user_id,
          content,
          parent_id,
          reply_to_user_id,
        })
        .select()
        .single();

      if (error) throw error;

      // Fetch full comment with user info
      return this.getComment(data.id);
    } catch (err) {
      console.error('[CommentService] createComment error:', err);
      throw err;
    }
  }

  /**
   * Update comment content
   * @param {string} commentId - Comment ID
   * @param {string} content - New content
   * @returns {Object} Updated comment
   */
  async updateComment(commentId, content) {
    try {
      const { data, error } = await supabase
        .from('forum_comments')
        .update({
          content,
          updated_at: new Date().toISOString(),
          edited_at: new Date().toISOString(),
          edit_count: supabase.rpc('increment', { row_id: commentId }),
        })
        .eq('id', commentId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('[CommentService] updateComment error:', err);
      throw err;
    }
  }

  /**
   * Delete comment
   * @param {string} commentId - Comment ID
   * @returns {boolean} Success
   */
  async deleteComment(commentId) {
    try {
      const { error } = await supabase
        .from('forum_comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('[CommentService] deleteComment error:', err);
      throw err;
    }
  }

  /**
   * Get comments count for post
   * @param {string} postId - Post ID
   * @returns {number} Total comments count
   */
  async getCommentsCount(postId) {
    try {
      const { count, error } = await supabase
        .from('forum_comments')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', postId);

      if (error) throw error;
      return count || 0;
    } catch (err) {
      console.error('[CommentService] getCommentsCount error:', err);
      return 0;
    }
  }

  /**
   * Like/unlike a comment
   * @param {string} commentId - Comment ID
   * @param {string} userId - User ID
   * @returns {boolean} Is now liked
   */
  async toggleCommentLike(commentId, userId) {
    try {
      // Check if already liked
      const { data: existing } = await supabase
        .from('forum_likes')
        .select('id')
        .eq('comment_id', commentId)
        .eq('user_id', userId)
        .single();

      if (existing) {
        // Unlike
        await supabase
          .from('forum_likes')
          .delete()
          .eq('id', existing.id);
        return false;
      } else {
        // Like
        await supabase
          .from('forum_likes')
          .insert({
            comment_id: commentId,
            user_id: userId,
          });
        return true;
      }
    } catch (err) {
      console.error('[CommentService] toggleCommentLike error:', err);
      throw err;
    }
  }
}

export const commentService = new CommentService();
export default commentService;
