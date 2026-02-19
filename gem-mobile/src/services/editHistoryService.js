/**
 * Gemral - Edit History Service
 * Feature #18: View edit history of posts/comments
 */

import { supabase } from './supabase';

export const editHistoryService = {
  /**
   * Get edit history for a post
   * @param {string} postId - Post ID
   */
  async getPostEditHistory(postId) {
    try {
      const { data, error } = await supabase
        .from('post_edit_history')
        .select(`
          id,
          post_id,
          title_before,
          content_before,
          title_after,
          content_after,
          edited_at,
          editor:edited_by (
            id,
            full_name,
            avatar_url
          )
        `)
        .eq('post_id', postId)
        .order('edited_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('[EditHistory] Get post history error:', error);
      return [];
    }
  },

  /**
   * Get edit history for a comment
   * @param {string} commentId - Comment ID
   */
  async getCommentEditHistory(commentId) {
    try {
      const { data, error } = await supabase
        .from('comment_edit_history')
        .select(`
          id,
          comment_id,
          content_before,
          content_after,
          edited_at,
          editor:edited_by (
            id,
            full_name,
            avatar_url
          )
        `)
        .eq('comment_id', commentId)
        .order('edited_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('[EditHistory] Get comment history error:', error);
      return [];
    }
  },

  /**
   * Save post edit to history
   * @param {string} postId - Post ID
   * @param {object} previousVersion - Previous content { title, content }
   * @param {object} newVersion - New content { title, content }
   */
  async savePostEdit(postId, previousVersion, newVersion) {
    try {
      const { data: { session } } = await supabase.auth.getSession(); const user = session?.user;
      if (!user) return { success: false, error: 'Chua dang nhap' };

      const { data, error } = await supabase
        .from('post_edit_history')
        .insert({
          post_id: postId,
          edited_by: user.id,
          title_before: previousVersion.title,
          content_before: previousVersion.content,
          title_after: newVersion?.title || previousVersion.title,
          content_after: newVersion?.content || previousVersion.content,
          edited_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      console.log('[EditHistory] Post edit saved:', data.id);
      return { success: true, data };
    } catch (error) {
      console.error('[EditHistory] Save post edit error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Save comment edit to history
   * @param {string} commentId - Comment ID
   * @param {string} previousContent - Previous comment content
   * @param {string} newContent - New comment content
   */
  async saveCommentEdit(commentId, previousContent, newContent) {
    try {
      const { data: { session } } = await supabase.auth.getSession(); const user = session?.user;
      if (!user) return { success: false, error: 'Chua dang nhap' };

      const { data, error } = await supabase
        .from('comment_edit_history')
        .insert({
          comment_id: commentId,
          edited_by: user.id,
          content_before: previousContent,
          content_after: newContent || previousContent,
          edited_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      console.log('[EditHistory] Comment edit saved:', data.id);
      return { success: true, data };
    } catch (error) {
      console.error('[EditHistory] Save comment edit error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get edit count for a post
   * @param {string} postId - Post ID
   */
  async getPostEditCount(postId) {
    try {
      const { count, error } = await supabase
        .from('post_edit_history')
        .select('id', { count: 'exact', head: true })
        .eq('post_id', postId);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      return 0;
    }
  },

  /**
   * Get edit count for a comment
   * @param {string} commentId - Comment ID
   */
  async getCommentEditCount(commentId) {
    try {
      const { count, error } = await supabase
        .from('comment_edit_history')
        .select('id', { count: 'exact', head: true })
        .eq('comment_id', commentId);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      return 0;
    }
  },

  /**
   * Format time since edit
   * @param {string} isoDate - ISO date string
   */
  formatEditTime(isoDate) {
    const date = new Date(isoDate);
    const now = new Date();
    const diff = now - date;

    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Vua xong';
    if (minutes < 60) return `${minutes} phut truoc`;
    if (hours < 24) return `${hours} gio truoc`;
    if (days < 7) return `${days} ngay truoc`;

    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  },

  /**
   * Compare two versions and highlight differences
   * @param {string} oldText - Previous version
   * @param {string} newText - Current version
   */
  compareDiff(oldText, newText) {
    // Simple word-by-word diff
    const oldWords = oldText.split(/\s+/);
    const newWords = newText.split(/\s+/);

    const result = {
      added: [],
      removed: [],
      unchanged: [],
    };

    // Find removed words
    oldWords.forEach((word, index) => {
      if (!newWords.includes(word)) {
        result.removed.push({ word, index });
      }
    });

    // Find added words
    newWords.forEach((word, index) => {
      if (!oldWords.includes(word)) {
        result.added.push({ word, index });
      }
    });

    return result;
  },
};

export default editHistoryService;
