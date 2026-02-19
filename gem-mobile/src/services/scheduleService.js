/**
 * Gemral - Schedule Service
 * Feature #16: Schedule Posts for later publishing
 */

import { supabase } from './supabase';

export const scheduleService = {
  /**
   * Schedule a post for later publishing
   * @param {object} postData - Post content { title, content, topic, images, poll }
   * @param {Date} scheduledAt - When to publish
   */
  async schedulePost(postData, scheduledAt) {
    try {
      const { data: { session } } = await supabase.auth.getSession(); const user = session?.user;
      if (!user) return { success: false, error: 'Chua dang nhap' };

      const { data, error } = await supabase
        .from('scheduled_posts')
        .insert({
          user_id: user.id,
          title: postData.title,
          content: postData.content,
          topic: postData.topic,
          images: postData.images || [],
          poll_data: postData.poll || null,
          scheduled_at: scheduledAt.toISOString(),
          status: 'pending',
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      console.log('[ScheduleService] Post scheduled:', data.id);
      return { success: true, data };
    } catch (error) {
      console.error('[ScheduleService] Schedule error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get all scheduled posts for current user
   * @param {string} status - Filter by status: 'pending', 'published', 'failed', 'cancelled'
   */
  async getScheduledPosts(status = null) {
    try {
      const { data: { session } } = await supabase.auth.getSession(); const user = session?.user;
      if (!user) return [];

      let query = supabase
        .from('scheduled_posts')
        .select('*')
        .eq('user_id', user.id)
        .order('scheduled_at', { ascending: true });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;
      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('[ScheduleService] Get posts error:', error);
      return [];
    }
  },

  /**
   * Get upcoming scheduled posts (next 7 days)
   */
  async getUpcomingPosts() {
    try {
      const { data: { session } } = await supabase.auth.getSession(); const user = session?.user;
      if (!user) return [];

      const now = new Date();
      const weekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

      const { data, error } = await supabase
        .from('scheduled_posts')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'pending')
        .gte('scheduled_at', now.toISOString())
        .lte('scheduled_at', weekLater.toISOString())
        .order('scheduled_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('[ScheduleService] Get upcoming error:', error);
      return [];
    }
  },

  /**
   * Update a scheduled post
   * @param {string} postId - Scheduled post ID
   * @param {object} updates - Fields to update
   */
  async updateScheduledPost(postId, updates) {
    try {
      const { data: { session } } = await supabase.auth.getSession(); const user = session?.user;
      if (!user) return { success: false, error: 'Chua dang nhap' };

      const { data, error } = await supabase
        .from('scheduled_posts')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', postId)
        .eq('user_id', user.id)
        .eq('status', 'pending')
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('[ScheduleService] Update error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Reschedule a post
   * @param {string} postId - Scheduled post ID
   * @param {Date} newScheduledAt - New scheduled time
   */
  async reschedulePost(postId, newScheduledAt) {
    return this.updateScheduledPost(postId, {
      scheduled_at: newScheduledAt.toISOString(),
    });
  },

  /**
   * Cancel a scheduled post
   * @param {string} postId - Scheduled post ID
   */
  async cancelScheduledPost(postId) {
    try {
      const { data: { session } } = await supabase.auth.getSession(); const user = session?.user;
      if (!user) return { success: false, error: 'Chua dang nhap' };

      const { error } = await supabase
        .from('scheduled_posts')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
        })
        .eq('id', postId)
        .eq('user_id', user.id)
        .eq('status', 'pending');

      if (error) throw error;

      console.log('[ScheduleService] Post cancelled:', postId);
      return { success: true };
    } catch (error) {
      console.error('[ScheduleService] Cancel error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Delete a scheduled post
   * @param {string} postId - Scheduled post ID
   */
  async deleteScheduledPost(postId) {
    try {
      const { data: { session } } = await supabase.auth.getSession(); const user = session?.user;
      if (!user) return { success: false, error: 'Chua dang nhap' };

      const { error } = await supabase
        .from('scheduled_posts')
        .delete()
        .eq('id', postId)
        .eq('user_id', user.id);

      if (error) throw error;

      console.log('[ScheduleService] Post deleted:', postId);
      return { success: true };
    } catch (error) {
      console.error('[ScheduleService] Delete error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Publish a scheduled post immediately
   * @param {string} postId - Scheduled post ID
   */
  async publishNow(postId) {
    try {
      const { data: { session } } = await supabase.auth.getSession(); const user = session?.user;
      if (!user) return { success: false, error: 'Chua dang nhap' };

      // Get the scheduled post
      const { data: scheduledPost, error: fetchError } = await supabase
        .from('scheduled_posts')
        .select('*')
        .eq('id', postId)
        .eq('user_id', user.id)
        .eq('status', 'pending')
        .single();

      if (fetchError || !scheduledPost) {
        throw new Error('Khong tim thay bai viet');
      }

      // Create the actual post
      const { data: newPost, error: createError } = await supabase
        .from('forum_posts')
        .insert({
          user_id: user.id,
          title: scheduledPost.title,
          content: scheduledPost.content,
          topic: scheduledPost.topic,
          images: scheduledPost.images,
          poll_data: scheduledPost.poll_data,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (createError) throw createError;

      // Update scheduled post status
      await supabase
        .from('scheduled_posts')
        .update({
          status: 'published',
          published_at: new Date().toISOString(),
          published_post_id: newPost.id,
        })
        .eq('id', postId);

      console.log('[ScheduleService] Post published:', newPost.id);
      return { success: true, data: newPost };
    } catch (error) {
      console.error('[ScheduleService] Publish error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get count of pending scheduled posts
   */
  async getPendingCount() {
    try {
      const { data: { session } } = await supabase.auth.getSession(); const user = session?.user;
      if (!user) return 0;

      const { count, error } = await supabase
        .from('scheduled_posts')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'pending');

      if (error) throw error;
      return count || 0;
    } catch (error) {
      return 0;
    }
  },

  /**
   * Format schedule time display
   * @param {string} isoDate - ISO date string
   */
  formatScheduleTime(isoDate) {
    const date = new Date(isoDate);
    const now = new Date();
    const diff = date - now;

    // If less than 24 hours
    if (diff < 24 * 60 * 60 * 1000 && diff > 0) {
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (hours > 0) {
        return `${hours} gio ${minutes} phut nua`;
      }
      return `${minutes} phut nua`;
    }

    // Format date
    const options = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };

    return date.toLocaleDateString('vi-VN', options);
  },
};

export default scheduleService;
