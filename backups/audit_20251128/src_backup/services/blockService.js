/**
 * Gemral - Block Service
 * Handles hiding posts and blocking users
 */

import { supabase } from './supabase';

export const blockService = {
  /**
   * Hide a post from current user's feed
   * @param {string} postId - Post ID to hide
   */
  async hidePost(postId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        return { success: false, error: 'Chua dang nhap' };
      }

      // Check if already hidden
      const { data: existing } = await supabase
        .from('hidden_posts')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .single();

      if (existing) {
        return { success: true, message: 'Bai viet da bi an' };
      }

      // Hide post
      const { data, error } = await supabase
        .from('hidden_posts')
        .insert({
          post_id: postId,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      console.log('[BlockService] Post hidden:', postId);
      return { success: true, data };
    } catch (error) {
      console.error('[BlockService] Hide post error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Unhide a post
   * @param {string} postId - Post ID to unhide
   */
  async unhidePost(postId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        return { success: false, error: 'Chua dang nhap' };
      }

      const { error } = await supabase
        .from('hidden_posts')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', user.id);

      if (error) throw error;

      console.log('[BlockService] Post unhidden:', postId);
      return { success: true };
    } catch (error) {
      console.error('[BlockService] Unhide post error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get all hidden post IDs for current user
   */
  async getHiddenPostIds() {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) return [];

      const { data, error } = await supabase
        .from('hidden_posts')
        .select('post_id')
        .eq('user_id', user.id);

      if (error) throw error;
      return (data || []).map(item => item.post_id);
    } catch (error) {
      console.error('[BlockService] Get hidden posts error:', error);
      return [];
    }
  },

  /**
   * Block a user
   * @param {string} blockedUserId - User ID to block
   */
  async blockUser(blockedUserId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        return { success: false, error: 'Chua dang nhap' };
      }

      if (user.id === blockedUserId) {
        return { success: false, error: 'Khong the chan chinh minh' };
      }

      // Check if already blocked
      const { data: existing } = await supabase
        .from('blocked_users')
        .select('id')
        .eq('blocker_id', user.id)
        .eq('blocked_id', blockedUserId)
        .single();

      if (existing) {
        return { success: true, message: 'Nguoi dung da bi chan' };
      }

      // Block user
      const { data, error } = await supabase
        .from('blocked_users')
        .insert({
          blocker_id: user.id,
          blocked_id: blockedUserId,
        })
        .select()
        .single();

      if (error) throw error;

      // Also unfollow if following
      await supabase
        .from('user_follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', blockedUserId);

      console.log('[BlockService] User blocked:', blockedUserId);
      return { success: true, data };
    } catch (error) {
      console.error('[BlockService] Block user error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Unblock a user
   * @param {string} blockedUserId - User ID to unblock
   */
  async unblockUser(blockedUserId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        return { success: false, error: 'Chua dang nhap' };
      }

      const { error } = await supabase
        .from('blocked_users')
        .delete()
        .eq('blocker_id', user.id)
        .eq('blocked_id', blockedUserId);

      if (error) throw error;

      console.log('[BlockService] User unblocked:', blockedUserId);
      return { success: true };
    } catch (error) {
      console.error('[BlockService] Unblock user error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Check if a user is blocked
   * @param {string} userId - User ID to check
   */
  async isUserBlocked(userId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) return false;

      const { data } = await supabase
        .from('blocked_users')
        .select('id')
        .eq('blocker_id', user.id)
        .eq('blocked_id', userId)
        .single();

      return !!data;
    } catch (error) {
      return false;
    }
  },

  /**
   * Get all blocked user IDs for current user
   */
  async getBlockedUserIds() {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) return [];

      const { data, error } = await supabase
        .from('blocked_users')
        .select('blocked_id')
        .eq('blocker_id', user.id);

      if (error) throw error;
      return (data || []).map(item => item.blocked_id);
    } catch (error) {
      console.error('[BlockService] Get blocked users error:', error);
      return [];
    }
  },

  /**
   * Get blocked users with profile info
   * @param {number} page - Page number
   * @param {number} limit - Results per page
   */
  async getBlockedUsers(page = 1, limit = 20) {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        return { data: [], count: 0 };
      }

      const offset = (page - 1) * limit;

      const { data, error, count } = await supabase
        .from('blocked_users')
        .select(`
          *,
          blocked:profiles!blocked_id(id, full_name, email, avatar_url)
        `, { count: 'exact' })
        .eq('blocker_id', user.id)
        .order('blocked_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return { data: data || [], count: count || 0 };
    } catch (error) {
      console.error('[BlockService] Get blocked users error:', error);
      return { data: [], count: 0 };
    }
  },
};

export default blockService;
