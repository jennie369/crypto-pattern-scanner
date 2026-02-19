/**
 * Comment Service
 * Threaded comments with reactions, moderation, mentions
 * Uses forum_comments table with parent_id / thread_depth
 */

import { supabase } from '../lib/supabaseClient';

class CommentService {
  /**
   * Get threaded comments for a post — flat list → tree built client-side
   * @param {string} postId
   * @returns {Array} Tree of comments
   */
  async getThreadedComments(postId) {
    try {
      const { data, error } = await supabase
        .from('forum_comments')
        .select(`
          *,
          author:profiles(id, full_name, avatar_url, scanner_tier, role)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return this._buildTree(data || []);
    } catch (error) {
      console.error('getThreadedComments error:', error);
      return [];
    }
  }

  /**
   * Build comment tree from flat array using parent_id
   * @param {Array} comments - flat list
   * @returns {Array} Nested tree
   * @private
   */
  _buildTree(comments) {
    const map = new Map();
    const roots = [];

    // Index all comments by id
    comments.forEach(c => {
      map.set(c.id, { ...c, replies: [] });
    });

    // Link children to parents
    comments.forEach(c => {
      const node = map.get(c.id);
      if (c.parent_id && map.has(c.parent_id)) {
        map.get(c.parent_id).replies.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  }

  /**
   * Create a comment on a post
   * @param {string} postId
   * @param {string} content
   * @param {string} userId
   * @param {string|null} parentId - for replies
   * @param {string|null} replyToUserId - mention the parent author
   * @returns {Object} Created comment with author
   */
  async createComment(postId, content, userId, parentId = null, replyToUserId = null) {
    try {
      let threadDepth = 0;

      // Calculate depth if replying
      if (parentId) {
        const { data: parent } = await supabase
          .from('forum_comments')
          .select('thread_depth')
          .eq('id', parentId)
          .single();
        threadDepth = (parent?.thread_depth || 0) + 1;
      }

      const { data: comment, error } = await supabase
        .from('forum_comments')
        .insert({
          post_id: postId,
          content,
          user_id: userId,
          parent_id: parentId,
          reply_to_user_id: replyToUserId,
          thread_depth: threadDepth,
        })
        .select(`
          *,
          author:profiles(id, full_name, avatar_url, scanner_tier, role)
        `)
        .single();

      if (error) throw error;
      return comment;
    } catch (error) {
      console.error('createComment error:', error);
      throw error;
    }
  }

  /**
   * Update a comment's content and track edit
   * @param {string} commentId
   * @param {string} content
   * @returns {Object} Updated comment
   */
  async updateComment(commentId, content) {
    try {
      const { data, error } = await supabase
        .from('forum_comments')
        .update({
          content,
          edited_at: new Date().toISOString(),
        })
        .eq('id', commentId)
        .select(`
          *,
          author:profiles(id, full_name, avatar_url, scanner_tier, role)
        `)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('updateComment error:', error);
      throw error;
    }
  }

  /**
   * Delete a comment
   * @param {string} commentId
   */
  async deleteComment(commentId) {
    try {
      const { error } = await supabase
        .from('forum_comments')
        .delete()
        .eq('id', commentId);
      if (error) throw error;
    } catch (error) {
      console.error('deleteComment error:', error);
      throw error;
    }
  }

  /**
   * Get direct replies to a comment
   * @param {string} commentId
   * @returns {Array}
   */
  async getCommentReplies(commentId) {
    try {
      const { data, error } = await supabase
        .from('forum_comments')
        .select(`
          *,
          author:profiles(id, full_name, avatar_url, scanner_tier, role)
        `)
        .eq('parent_id', commentId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('getCommentReplies error:', error);
      return [];
    }
  }

  /**
   * Toggle reaction on a comment (same upsert logic as post reactions)
   * @param {string} commentId
   * @param {string} type - like|love|haha|wow|sad|angry
   * @param {string} userId
   * @returns {{ action: 'added'|'removed'|'changed', type: string }}
   */
  async toggleCommentReaction(commentId, type, userId) {
    try {
      const { data: existing } = await supabase
        .from('post_reactions')
        .select('id, type')
        .eq('comment_id', commentId)
        .eq('user_id', userId)
        .single();

      if (existing) {
        if (existing.type === type) {
          const { error } = await supabase
            .from('post_reactions')
            .delete()
            .eq('id', existing.id);
          if (error) throw error;
          return { action: 'removed', type };
        } else {
          const { error } = await supabase
            .from('post_reactions')
            .update({ type })
            .eq('id', existing.id);
          if (error) throw error;
          return { action: 'changed', type };
        }
      }

      const { error } = await supabase
        .from('post_reactions')
        .insert({ comment_id: commentId, user_id: userId, type });
      if (error) throw error;
      return { action: 'added', type };
    } catch (error) {
      console.error('toggleCommentReaction error:', error);
      throw error;
    }
  }

  /**
   * Report a comment
   * @param {string} commentId
   * @param {string} userId
   * @param {string} reason
   */
  async reportComment(commentId, userId, reason) {
    try {
      const { error } = await supabase
        .from('comment_reports')
        .insert({
          comment_id: commentId,
          user_id: userId,
          reason,
        });
      if (error) throw error;
    } catch (error) {
      console.error('reportComment error:', error);
      throw error;
    }
  }
}

export default new CommentService();
