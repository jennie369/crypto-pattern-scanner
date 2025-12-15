/**
 * Gemral - Notification Preference Service
 * Feature #14: Turn Off Notifications for specific posts
 */

import { supabase } from './supabase';

export const notificationPreferenceService = {
  /**
   * Mute notifications for a post
   * @param {string} postId - Post ID to mute
   */
  async mutePost(postId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { success: false, error: 'Chua dang nhap' };

      const { data, error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: user.id,
          post_id: postId,
          muted: true,
          muted_at: new Date().toISOString(),
        }, { onConflict: 'user_id,post_id' })
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('[NotificationPref] Mute error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Unmute notifications for a post
   * @param {string} postId - Post ID to unmute
   */
  async unmutePost(postId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { success: false, error: 'Chua dang nhap' };

      const { error } = await supabase
        .from('notification_preferences')
        .delete()
        .eq('user_id', user.id)
        .eq('post_id', postId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('[NotificationPref] Unmute error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Check if post is muted
   * @param {string} postId - Post ID to check
   */
  async isPostMuted(postId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data } = await supabase
        .from('notification_preferences')
        .select('muted')
        .eq('user_id', user.id)
        .eq('post_id', postId)
        .single();

      return data?.muted || false;
    } catch (error) {
      return false;
    }
  },

  /**
   * Get all muted post IDs for current user
   */
  async getMutedPostIds() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('notification_preferences')
        .select('post_id')
        .eq('user_id', user.id)
        .eq('muted', true);

      if (error) throw error;
      return (data || []).map(item => item.post_id);
    } catch (error) {
      console.error('[NotificationPref] Get muted posts error:', error);
      return [];
    }
  },

  /**
   * Toggle mute status for a post
   * @param {string} postId - Post ID
   */
  async toggleMute(postId) {
    const isMuted = await this.isPostMuted(postId);
    if (isMuted) {
      return await this.unmutePost(postId);
    } else {
      return await this.mutePost(postId);
    }
  },
};

export default notificationPreferenceService;
