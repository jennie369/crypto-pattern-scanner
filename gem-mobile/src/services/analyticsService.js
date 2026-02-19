/**
 * Gemral - Analytics Service
 * Handles post view tracking and analytics
 */

import { supabase } from './supabase';

export const analyticsService = {
  /**
   * Track a post view
   * @param {string} postId - Post ID being viewed
   * @param {string} source - Where the view came from (feed, search, profile, etc.)
   */
  async trackView(postId, source = 'feed') {
    try {
      const { data: { session } } = await supabase.auth.getSession(); const user = session?.user;

      // Track even for anonymous users (viewer_id will be null)
      const { data, error } = await supabase
        .from('post_views')
        .insert({
          post_id: postId,
          viewer_id: user?.id || null,
          source: source,
          view_duration_seconds: 0,
        })
        .select()
        .single();

      if (error) {
        // Ignore duplicate errors for same session
        if (!error.message.includes('duplicate')) {
          throw error;
        }
      }

      return { success: true, viewId: data?.id };
    } catch (error) {
      console.error('[AnalyticsService] Track view error:', error);
      return { success: false };
    }
  },

  /**
   * Update view duration when user leaves post
   * @param {string} viewId - View record ID
   * @param {number} durationSeconds - Time spent viewing
   */
  async updateViewDuration(viewId, durationSeconds) {
    try {
      if (!viewId) return { success: false };

      const { error } = await supabase
        .from('post_views')
        .update({ view_duration_seconds: durationSeconds })
        .eq('id', viewId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('[AnalyticsService] Update duration error:', error);
      return { success: false };
    }
  },

  /**
   * Get analytics for a post (author only)
   * @param {string} postId - Post ID
   */
  async getPostAnalytics(postId) {
    try {
      const { data: { session } } = await supabase.auth.getSession(); const user = session?.user;

      if (!user) {
        return { success: false, error: 'Chua dang nhap' };
      }

      // Verify user is the post author
      const { data: post } = await supabase
        .from('forum_posts')
        .select('user_id, likes_count, comments_count, shares_count')
        .eq('id', postId)
        .single();

      if (!post) {
        return { success: false, error: 'Bai viet khong ton tai' };
      }

      if (post.user_id !== user.id) {
        return { success: false, error: 'Chi tac gia moi co the xem thong ke' };
      }

      // Get view stats
      const { data: viewStats } = await supabase
        .from('post_views')
        .select('viewer_id, view_duration_seconds, source, viewed_at')
        .eq('post_id', postId);

      // Calculate analytics
      const totalViews = viewStats?.length || 0;
      const uniqueViewers = new Set(viewStats?.map(v => v.viewer_id).filter(Boolean)).size;
      const avgDuration = totalViews > 0
        ? (viewStats.reduce((sum, v) => sum + (v.view_duration_seconds || 0), 0) / totalViews).toFixed(1)
        : 0;

      // Get view sources breakdown
      const sourceBreakdown = {};
      viewStats?.forEach(v => {
        sourceBreakdown[v.source] = (sourceBreakdown[v.source] || 0) + 1;
      });

      // Get views over time (last 7 days)
      const last7Days = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const dayViews = viewStats?.filter(v => v.viewed_at.startsWith(dateStr)).length || 0;
        last7Days.push({ date: dateStr, views: dayViews });
      }

      // Get saves count
      const { count: savesCount } = await supabase
        .from('forum_saved')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', postId);

      return {
        success: true,
        data: {
          totalViews,
          uniqueViewers,
          avgViewDuration: parseFloat(avgDuration),
          likesCount: post.likes_count || 0,
          commentsCount: post.comments_count || 0,
          savesCount: savesCount || 0,
          sharesCount: post.shares_count || 0,
          sourceBreakdown,
          viewsOverTime: last7Days,
          engagementRate: totalViews > 0
            ? (((post.likes_count || 0) + (post.comments_count || 0)) / totalViews * 100).toFixed(1)
            : 0,
        }
      };
    } catch (error) {
      console.error('[AnalyticsService] Get analytics error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get analytics summary for all user's posts
   */
  async getOverallAnalytics() {
    try {
      const { data: { session } } = await supabase.auth.getSession(); const user = session?.user;

      if (!user) {
        return { success: false, error: 'Chua dang nhap' };
      }

      // Get all user's posts
      const { data: posts } = await supabase
        .from('forum_posts')
        .select('id, likes_count, comments_count, shares_count, created_at')
        .eq('user_id', user.id)
        .eq('status', 'published');

      if (!posts || posts.length === 0) {
        return {
          success: true,
          data: {
            totalPosts: 0,
            totalViews: 0,
            totalLikes: 0,
            totalComments: 0,
            avgEngagementRate: 0,
          }
        };
      }

      const postIds = posts.map(p => p.id);

      // Get total views
      const { count: totalViews } = await supabase
        .from('post_views')
        .select('*', { count: 'exact', head: true })
        .in('post_id', postIds);

      // Calculate totals
      const totalLikes = posts.reduce((sum, p) => sum + (p.likes_count || 0), 0);
      const totalComments = posts.reduce((sum, p) => sum + (p.comments_count || 0), 0);
      const totalShares = posts.reduce((sum, p) => sum + (p.shares_count || 0), 0);

      return {
        success: true,
        data: {
          totalPosts: posts.length,
          totalViews: totalViews || 0,
          totalLikes,
          totalComments,
          totalShares,
          avgEngagementRate: totalViews > 0
            ? ((totalLikes + totalComments) / totalViews * 100).toFixed(1)
            : 0,
        }
      };
    } catch (error) {
      console.error('[AnalyticsService] Get overall analytics error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get top performing posts
   * @param {number} limit - Number of posts to return
   */
  async getTopPosts(limit = 5) {
    try {
      const { data: { session } } = await supabase.auth.getSession(); const user = session?.user;

      if (!user) {
        return { success: false, error: 'Chua dang nhap' };
      }

      const { data: posts, error } = await supabase
        .from('forum_posts')
        .select('id, title, likes_count, comments_count, created_at')
        .eq('user_id', user.id)
        .eq('status', 'published')
        .order('likes_count', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return { success: true, data: posts || [] };
    } catch (error) {
      console.error('[AnalyticsService] Get top posts error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Increment share count
   * @param {string} postId - Post ID
   */
  async incrementShareCount(postId) {
    try {
      const { error } = await supabase
        .rpc('increment_share_count', { p_post_id: postId });

      if (error) {
        // Fallback: direct update
        const { data: post } = await supabase
          .from('forum_posts')
          .select('shares_count')
          .eq('id', postId)
          .single();

        await supabase
          .from('forum_posts')
          .update({ shares_count: (post?.shares_count || 0) + 1 })
          .eq('id', postId);
      }

      return { success: true };
    } catch (error) {
      console.error('[AnalyticsService] Increment share error:', error);
      return { success: false };
    }
  },
};

export default analyticsService;
