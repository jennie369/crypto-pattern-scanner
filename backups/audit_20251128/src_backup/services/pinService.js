/**
 * Gemral - Pin Service
 * Feature #20: Pin posts to profile
 */

import { supabase } from './supabase';

const MAX_PINNED_POSTS = 3;

export const pinService = {
  /**
   * Pin a post to profile
   * @param {string} postId - Post ID to pin
   */
  async pinPost(postId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { success: false, error: 'Chua dang nhap' };

      // Check if user owns the post
      const { data: post, error: postError } = await supabase
        .from('forum_posts')
        .select('id, user_id')
        .eq('id', postId)
        .single();

      if (postError || !post) {
        return { success: false, error: 'Khong tim thay bai viet' };
      }

      if (post.user_id !== user.id) {
        return { success: false, error: 'Ban chi co the ghim bai viet cua minh' };
      }

      // Check current pinned count
      const pinnedCount = await this.getPinnedCount();
      if (pinnedCount >= MAX_PINNED_POSTS) {
        return {
          success: false,
          error: `Ban chi co the ghim toi da ${MAX_PINNED_POSTS} bai viet`,
        };
      }

      // Get next pin order
      const { data: existingPins } = await supabase
        .from('pinned_posts')
        .select('pin_order')
        .eq('user_id', user.id)
        .order('pin_order', { ascending: false })
        .limit(1);

      const nextOrder = existingPins?.[0]?.pin_order + 1 || 1;

      // Create pin
      const { data, error } = await supabase
        .from('pinned_posts')
        .insert({
          user_id: user.id,
          post_id: postId,
          pin_order: nextOrder,
          pinned_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        // Check if already pinned
        if (error.code === '23505') {
          return { success: false, error: 'Bai viet nay da duoc ghim' };
        }
        throw error;
      }

      console.log('[PinService] Post pinned:', postId);
      return { success: true, data };
    } catch (error) {
      console.error('[PinService] Pin error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Unpin a post
   * @param {string} postId - Post ID to unpin
   */
  async unpinPost(postId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { success: false, error: 'Chua dang nhap' };

      const { error } = await supabase
        .from('pinned_posts')
        .delete()
        .eq('user_id', user.id)
        .eq('post_id', postId);

      if (error) throw error;

      console.log('[PinService] Post unpinned:', postId);
      return { success: true };
    } catch (error) {
      console.error('[PinService] Unpin error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Check if a post is pinned
   * @param {string} postId - Post ID to check
   */
  async isPostPinned(postId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data } = await supabase
        .from('pinned_posts')
        .select('id')
        .eq('user_id', user.id)
        .eq('post_id', postId)
        .single();

      return !!data;
    } catch (error) {
      return false;
    }
  },

  /**
   * Get user's pinned posts
   * @param {string} userId - User ID (optional, defaults to current user)
   */
  async getPinnedPosts(userId = null) {
    try {
      let targetUserId = userId;

      if (!targetUserId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];
        targetUserId = user.id;
      }

      const { data, error } = await supabase
        .from('pinned_posts')
        .select(`
          id,
          pin_order,
          pinned_at,
          post:post_id (
            id,
            title,
            content,
            images,
            likes_count,
            comments_count,
            created_at,
            topic,
            user:user_id (
              id,
              full_name,
              avatar_url
            )
          )
        `)
        .eq('user_id', targetUserId)
        .order('pin_order', { ascending: true });

      if (error) throw error;

      return (data || []).map(pin => ({
        ...pin.post,
        pinned: true,
        pinOrder: pin.pin_order,
        pinnedAt: pin.pinned_at,
      }));
    } catch (error) {
      console.error('[PinService] Get pinned posts error:', error);
      return [];
    }
  },

  /**
   * Get pinned post IDs for a user
   * @param {string} userId - User ID
   */
  async getPinnedPostIds(userId = null) {
    try {
      let targetUserId = userId;

      if (!targetUserId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];
        targetUserId = user.id;
      }

      const { data, error } = await supabase
        .from('pinned_posts')
        .select('post_id')
        .eq('user_id', targetUserId);

      if (error) throw error;
      return (data || []).map(pin => pin.post_id);
    } catch (error) {
      return [];
    }
  },

  /**
   * Get count of pinned posts
   */
  async getPinnedCount() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return 0;

      const { count, error } = await supabase
        .from('pinned_posts')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      return 0;
    }
  },

  /**
   * Reorder pinned posts
   * @param {Array} newOrder - Array of { postId, order } objects
   */
  async reorderPins(newOrder) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { success: false, error: 'Chua dang nhap' };

      // Update each pin's order
      const updates = newOrder.map(({ postId, order }) =>
        supabase
          .from('pinned_posts')
          .update({ pin_order: order })
          .eq('user_id', user.id)
          .eq('post_id', postId)
      );

      await Promise.all(updates);

      console.log('[PinService] Pins reordered');
      return { success: true };
    } catch (error) {
      console.error('[PinService] Reorder error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Toggle pin status
   * @param {string} postId - Post ID
   */
  async togglePin(postId) {
    const isPinned = await this.isPostPinned(postId);
    if (isPinned) {
      return await this.unpinPost(postId);
    } else {
      return await this.pinPost(postId);
    }
  },

  /**
   * Constants
   */
  MAX_PINNED_POSTS,
};

export default pinService;
