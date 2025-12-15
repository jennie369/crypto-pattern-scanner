/**
 * Gemral - Comment Moderation Service
 * Feature #11: Pin/Delete/Report Comments
 * Handles comment moderation operations
 */

import { supabase } from './supabase';

export const commentModerationService = {
  /**
   * Pin a comment (post author only)
   * @param {string} commentId - Comment ID
   * @param {string} postId - Post ID (to verify ownership)
   * @returns {Promise<object>}
   */
  async pinComment(commentId, postId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'Chua dang nhap' };
      }

      // Verify user is post author
      const { data: post, error: postError } = await supabase
        .from('forum_posts')
        .select('user_id')
        .eq('id', postId)
        .single();

      if (postError || post.user_id !== user.id) {
        return { success: false, error: 'Chi tac gia bai viet moi co the ghim binh luan' };
      }

      // Unpin any existing pinned comment on this post
      await supabase
        .from('forum_comments')
        .update({ is_pinned: false, pinned_at: null, pinned_by: null })
        .eq('post_id', postId)
        .eq('is_pinned', true);

      // Pin the new comment
      const { data, error } = await supabase
        .from('forum_comments')
        .update({
          is_pinned: true,
          pinned_at: new Date().toISOString(),
          pinned_by: user.id,
        })
        .eq('id', commentId)
        .select()
        .single();

      if (error) throw error;

      console.log('[CommentModeration] Pinned comment:', commentId);
      return { success: true, data };
    } catch (error) {
      console.error('[CommentModeration] Pin error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Unpin a comment
   * @param {string} commentId - Comment ID
   * @param {string} postId - Post ID
   * @returns {Promise<object>}
   */
  async unpinComment(commentId, postId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'Chua dang nhap' };
      }

      // Verify user is post author
      const { data: post } = await supabase
        .from('forum_posts')
        .select('user_id')
        .eq('id', postId)
        .single();

      if (post?.user_id !== user.id) {
        return { success: false, error: 'Khong co quyen' };
      }

      const { data, error } = await supabase
        .from('forum_comments')
        .update({
          is_pinned: false,
          pinned_at: null,
          pinned_by: null,
        })
        .eq('id', commentId)
        .select()
        .single();

      if (error) throw error;

      console.log('[CommentModeration] Unpinned comment:', commentId);
      return { success: true, data };
    } catch (error) {
      console.error('[CommentModeration] Unpin error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Delete a comment (author or post owner)
   * @param {string} commentId - Comment ID
   * @param {string} postId - Post ID
   * @returns {Promise<object>}
   */
  async deleteComment(commentId, postId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'Chua dang nhap' };
      }

      // Get comment and post info
      const { data: comment } = await supabase
        .from('forum_comments')
        .select('user_id')
        .eq('id', commentId)
        .single();

      const { data: post } = await supabase
        .from('forum_posts')
        .select('user_id')
        .eq('id', postId)
        .single();

      // Check permission: comment author or post author can delete
      const isCommentAuthor = comment?.user_id === user.id;
      const isPostAuthor = post?.user_id === user.id;

      if (!isCommentAuthor && !isPostAuthor) {
        return { success: false, error: 'Khong co quyen xoa binh luan nay' };
      }

      // Soft delete (mark as deleted) or hard delete
      const { error } = await supabase
        .from('forum_comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;

      // Update comment count on post
      await supabase.rpc('decrement_comment_count', { p_post_id: postId });

      console.log('[CommentModeration] Deleted comment:', commentId);
      return { success: true };
    } catch (error) {
      console.error('[CommentModeration] Delete error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Report a comment
   * @param {string} commentId - Comment ID
   * @param {string} reason - Report reason
   * @param {string} details - Optional additional details
   * @returns {Promise<object>}
   */
  async reportComment(commentId, reason, details = null) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'Chua dang nhap' };
      }

      // Check if already reported
      const { data: existing } = await supabase
        .from('comment_reports')
        .select('id')
        .eq('comment_id', commentId)
        .eq('reporter_id', user.id)
        .single();

      if (existing) {
        return { success: false, error: 'Ban da bao cao binh luan nay roi' };
      }

      const { data, error } = await supabase
        .from('comment_reports')
        .insert({
          comment_id: commentId,
          reporter_id: user.id,
          reason,
          details,
        })
        .select()
        .single();

      if (error) throw error;

      console.log('[CommentModeration] Reported comment:', commentId);
      return { success: true, data };
    } catch (error) {
      console.error('[CommentModeration] Report error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get pinned comment for a post
   * @param {string} postId - Post ID
   * @returns {Promise<object|null>}
   */
  async getPinnedComment(postId) {
    try {
      const { data, error } = await supabase
        .from('forum_comments')
        .select(`
          id,
          content,
          created_at,
          is_pinned,
          pinned_at,
          user:user_id (
            id,
            full_name,
            avatar_url
          )
        `)
        .eq('post_id', postId)
        .eq('is_pinned', true)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('[CommentModeration] Get pinned error:', error);
      return null;
    }
  },

  /**
   * Get available report reasons
   */
  getReportReasons() {
    return [
      { id: 'spam', label: 'Spam', description: 'Quang cao hoac noi dung lap lai' },
      { id: 'harassment', label: 'Quay roi', description: 'Ngon ngu tan cong hoac de doa' },
      { id: 'hate_speech', label: 'Ngon tu thu han', description: 'Noi dung phan biet doi xu' },
      { id: 'misinformation', label: 'Thong tin sai lech', description: 'Thong tin gia hoac gay hieu lam' },
      { id: 'violence', label: 'Bao luc', description: 'Noi dung bao luc hoac dang so' },
      { id: 'adult_content', label: 'Noi dung nguoi lon', description: 'Noi dung khieu dam hoac phan cam' },
      { id: 'other', label: 'Ly do khac', description: 'Nhap ly do cu the' },
    ];
  },

  /**
   * Check user's moderation permissions for a comment
   * @param {string} commentId - Comment ID
   * @param {string} postId - Post ID
   * @returns {Promise<object>}
   */
  async getCommentPermissions(commentId, postId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return {
          canPin: false,
          canDelete: false,
          canReport: false,
          isOwn: false,
          isPostAuthor: false,
        };
      }

      const { data: comment } = await supabase
        .from('forum_comments')
        .select('user_id, is_pinned')
        .eq('id', commentId)
        .single();

      const { data: post } = await supabase
        .from('forum_posts')
        .select('user_id')
        .eq('id', postId)
        .single();

      const isOwn = comment?.user_id === user.id;
      const isPostAuthor = post?.user_id === user.id;
      const isPinned = comment?.is_pinned || false;

      return {
        canPin: isPostAuthor,
        canUnpin: isPostAuthor && isPinned,
        canDelete: isOwn || isPostAuthor,
        canReport: !isOwn, // Can't report own comments
        isOwn,
        isPostAuthor,
        isPinned,
      };
    } catch (error) {
      console.error('[CommentModeration] Get permissions error:', error);
      return {
        canPin: false,
        canDelete: false,
        canReport: false,
        isOwn: false,
        isPostAuthor: false,
      };
    }
  },
};

// RPC function for decrementing comment count (run in Supabase SQL editor if not exists)
/*
CREATE OR REPLACE FUNCTION decrement_comment_count(post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE forum_posts
  SET comment_count = GREATEST(COALESCE(comment_count, 0) - 1, 0)
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
*/

export default commentModerationService;
