/**
 * Gemral - Content Analytics Service
 * Analytics for push notifications and auto-posts
 */

import { supabase } from './supabase';

class ContentAnalyticsService {
  // ==========================================
  // DASHBOARD STATS
  // ==========================================

  /**
   * Get dashboard overview stats
   * @param {Date} startDate - Start of date range
   * @param {Date} endDate - End of date range
   */
  async getDashboardStats(startDate = null, endDate = null) {
    try {
      // Default to last 7 days
      if (!startDate) {
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
      }
      if (!endDate) {
        endDate = new Date();
      }

      // Try RPC first, fallback to direct queries if RPC doesn't exist
      try {
        const { data, error } = await supabase.rpc('get_content_dashboard_stats', {
          p_start_date: startDate.toISOString(),
          p_end_date: endDate.toISOString(),
        });

        if (!error && data) {
          return {
            success: true,
            data: data?.[0] || this._getDefaultStats(),
          };
        }
      } catch (rpcError) {
        console.warn('[ContentAnalytics] RPC not available, using fallback:', rpcError.message);
      }

      // Fallback: Calculate stats from direct table queries
      const [pushResult, postResult] = await Promise.all([
        supabase
          .from('notification_schedule')
          .select('id, status, total_delivered, total_opened, total_clicked', { count: 'exact' })
          .gte('scheduled_at', startDate.toISOString())
          .lte('scheduled_at', endDate.toISOString()),
        supabase
          .from('content_calendar')
          .select('id, status', { count: 'exact' })
          .gte('scheduled_date', startDate.toISOString().split('T')[0])
          .lte('scheduled_date', endDate.toISOString().split('T')[0]),
      ]);

      const pushData = pushResult.data || [];
      const postData = postResult.data || [];

      const totalDelivered = pushData.reduce((sum, n) => sum + (n.total_delivered || 0), 0);
      const totalOpened = pushData.reduce((sum, n) => sum + (n.total_opened || 0), 0);
      const totalClicked = pushData.reduce((sum, n) => sum + (n.total_clicked || 0), 0);

      return {
        success: true,
        data: {
          push_count: pushResult.count || 0,
          post_count: postResult.count || 0,
          total_sent: pushData.filter(n => n.status === 'sent').length,
          total_delivered: totalDelivered,
          total_opened: totalOpened,
          total_clicked: totalClicked,
          total_views: 0,
          total_likes: 0,
          avg_open_rate: totalDelivered > 0 ? ((totalOpened / totalDelivered) * 100).toFixed(1) : 0,
          avg_click_rate: totalDelivered > 0 ? ((totalClicked / totalDelivered) * 100).toFixed(1) : 0,
          avg_engagement_rate: 0,
        },
      };
    } catch (error) {
      console.error('[ContentAnalytics] getDashboardStats error:', error);
      return { success: true, data: this._getDefaultStats() };
    }
  }

  _getDefaultStats() {
    return {
      push_count: 0,
      post_count: 0,
      total_sent: 0,
      total_delivered: 0,
      total_opened: 0,
      total_clicked: 0,
      total_views: 0,
      total_likes: 0,
      avg_open_rate: 0,
      avg_click_rate: 0,
      avg_engagement_rate: 0,
    };
  }

  /**
   * Get today's quick stats
   */
  async getTodayStats() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Get push notifications today
      const { count: pushCount } = await supabase
        .from('notification_schedule')
        .select('id', { count: 'exact', head: true })
        .gte('scheduled_at', today.toISOString())
        .lt('scheduled_at', tomorrow.toISOString());

      // Get posts today
      const { count: postCount } = await supabase
        .from('content_calendar')
        .select('id', { count: 'exact', head: true })
        .gte('scheduled_date', today.toISOString().split('T')[0])
        .lt('scheduled_date', tomorrow.toISOString().split('T')[0]);

      return {
        success: true,
        data: {
          pushToday: pushCount || 0,
          postToday: postCount || 0,
        },
      };
    } catch (error) {
      console.error('[ContentAnalytics] getTodayStats error:', error);
      return { success: false, data: { pushToday: 0, postToday: 0 } };
    }
  }

  // ==========================================
  // PUSH NOTIFICATION STATS
  // ==========================================

  /**
   * Get push notification stats for date range
   */
  async getPushStats(startDate, endDate) {
    try {
      // Try RPC first
      try {
        const { data, error } = await supabase.rpc('get_notification_stats_by_date_range', {
          p_start_date: startDate.toISOString(),
          p_end_date: endDate.toISOString(),
        });

        if (!error && data) {
          return { success: true, data: data?.[0] || {} };
        }
      } catch (rpcError) {
        console.warn('[ContentAnalytics] RPC not available, using fallback');
      }

      // Fallback: Direct query
      const { data: notifications, count } = await supabase
        .from('notification_schedule')
        .select('*', { count: 'exact' })
        .gte('scheduled_at', startDate.toISOString())
        .lte('scheduled_at', endDate.toISOString());

      const stats = {
        total_notifications: count || 0,
        total_sent: (notifications || []).filter(n => n.status === 'sent').length,
        total_delivered: (notifications || []).reduce((sum, n) => sum + (n.total_delivered || 0), 0),
        total_opened: (notifications || []).reduce((sum, n) => sum + (n.total_opened || 0), 0),
        total_clicked: (notifications || []).reduce((sum, n) => sum + (n.total_clicked || 0), 0),
      };

      return { success: true, data: stats };
    } catch (error) {
      console.error('[ContentAnalytics] getPushStats error:', error);
      return { success: true, data: {} };
    }
  }

  /**
   * Get top performing push notifications
   */
  async getTopPushNotifications(limit = 10, orderBy = 'total_opened') {
    try {
      const { data, error } = await supabase
        .from('notification_schedule')
        .select('*')
        .eq('status', 'sent')
        .gt('total_delivered', 0)
        .order(orderBy, { ascending: false })
        .limit(limit);

      if (error) throw error;

      // Calculate rates
      const withRates = (data || []).map(n => ({
        ...n,
        openRate: n.total_delivered > 0
          ? ((n.total_opened / n.total_delivered) * 100).toFixed(1)
          : '0',
        clickRate: n.total_delivered > 0
          ? ((n.total_clicked / n.total_delivered) * 100).toFixed(1)
          : '0',
        conversionRate: n.total_clicked > 0
          ? ((n.total_converted / n.total_clicked) * 100).toFixed(1)
          : '0',
      }));

      return { success: true, data: withRates };
    } catch (error) {
      console.error('[ContentAnalytics] getTopPushNotifications error:', error);
      return { success: false, data: [], error: error.message };
    }
  }

  // ==========================================
  // POST STATS
  // ==========================================

  /**
   * Get post stats for date range
   */
  async getPostStats(startDate, endDate) {
    try {
      const { data, error } = await supabase
        .from('content_calendar')
        .select(`
          id,
          title,
          platform,
          status,
          posted_at
        `)
        .gte('scheduled_date', startDate.toISOString().split('T')[0])
        .lte('scheduled_date', endDate.toISOString().split('T')[0])
        .eq('status', 'posted');

      if (error) throw error;

      // Group by platform
      const platformStats = {};
      (data || []).forEach(post => {
        if (!platformStats[post.platform]) {
          platformStats[post.platform] = { count: 0, posts: [] };
        }
        platformStats[post.platform].count++;
        platformStats[post.platform].posts.push(post);
      });

      return {
        success: true,
        data: {
          total: data?.length || 0,
          byPlatform: platformStats,
          posts: data || [],
        },
      };
    } catch (error) {
      console.error('[ContentAnalytics] getPostStats error:', error);
      return { success: false, data: {}, error: error.message };
    }
  }

  /**
   * Get top performing posts
   */
  async getTopPosts(limit = 10) {
    try {
      // Get posts with their analytics
      const { data, error } = await supabase
        .from('content_analytics')
        .select(`
          *,
          content_calendar:content_id (
            id,
            title,
            platform,
            content_type,
            posted_at
          )
        `)
        .eq('content_type', 'post')
        .order('engagement_rate', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return { success: true, data: data || [] };
    } catch (error) {
      console.error('[ContentAnalytics] getTopPosts error:', error);
      return { success: false, data: [], error: error.message };
    }
  }

  // ==========================================
  // COMBINED ANALYTICS
  // ==========================================

  /**
   * Get top performing content (push + posts)
   */
  async getTopPerforming(type = null, limit = 10, orderBy = 'open_rate') {
    try {
      // Try RPC first
      try {
        const { data, error } = await supabase.rpc('get_top_performing_content', {
          p_content_type: type,
          p_limit: limit,
          p_order_by: orderBy,
        });

        if (!error && data) {
          return { success: true, data: data || [] };
        }
      } catch (rpcError) {
        console.warn('[ContentAnalytics] RPC not available, using fallback');
      }

      // Fallback: Combine top push notifications and top posts
      const results = [];

      if (!type || type === 'push') {
        const topPush = await this.getTopPushNotifications(limit);
        if (topPush.success) {
          results.push(...topPush.data.map(n => ({ ...n, content_type: 'push' })));
        }
      }

      if (!type || type === 'post') {
        const topPosts = await this.getTopPosts(limit);
        if (topPosts.success) {
          results.push(...topPosts.data.map(p => ({ ...p, content_type: 'post' })));
        }
      }

      // Sort by open rate or specified field and limit
      const sorted = results
        .sort((a, b) => parseFloat(b.openRate || b.open_rate || 0) - parseFloat(a.openRate || a.open_rate || 0))
        .slice(0, limit);

      return { success: true, data: sorted };
    } catch (error) {
      console.error('[ContentAnalytics] getTopPerforming error:', error);
      return { success: true, data: [] };
    }
  }

  /**
   * Get hourly breakdown for charts
   */
  async getHourlyBreakdown(startDate, endDate, contentType = 'push') {
    try {
      // Try RPC first
      try {
        const { data, error } = await supabase.rpc('get_content_hourly_breakdown', {
          p_start_date: startDate.toISOString(),
          p_end_date: endDate.toISOString(),
          p_content_type: contentType,
        });

        if (!error && data) {
          // Fill in missing hours with zeros
          const hours = {};
          for (let i = 0; i < 24; i++) {
            const hour = i.toString().padStart(2, '0');
            hours[hour] = { opens: 0, clicks: 0, rate: 0 };
          }

          (data || []).forEach(item => {
            hours[item.hour] = {
              opens: parseInt(item.total_opens) || 0,
              clicks: parseInt(item.total_clicks) || 0,
              rate: parseFloat(item.avg_open_rate) || 0,
            };
          });

          return {
            success: true,
            data: Object.entries(hours).map(([hour, stats]) => ({
              hour,
              ...stats,
            })),
          };
        }
      } catch (rpcError) {
        console.warn('[ContentAnalytics] RPC not available, using fallback');
      }

      // Fallback: Return empty hourly data (24 hours of zeros)
      const hours = {};
      for (let i = 0; i < 24; i++) {
        const hour = i.toString().padStart(2, '0');
        hours[hour] = { opens: 0, clicks: 0, rate: 0 };
      }

      // Try to get data from notification_schedule if available
      if (contentType === 'push') {
        try {
          const { data: notifications } = await supabase
            .from('notification_schedule')
            .select('scheduled_at, total_opened, total_clicked')
            .eq('status', 'sent')
            .gte('scheduled_at', startDate.toISOString())
            .lte('scheduled_at', endDate.toISOString());

          (notifications || []).forEach(n => {
            if (n.scheduled_at) {
              const hour = new Date(n.scheduled_at).getHours().toString().padStart(2, '0');
              hours[hour].opens += n.total_opened || 0;
              hours[hour].clicks += n.total_clicked || 0;
            }
          });
        } catch (e) {
          // Silently fail, return zeros
        }
      }

      return {
        success: true,
        data: Object.entries(hours).map(([hour, stats]) => ({
          hour,
          ...stats,
        })),
      };
    } catch (error) {
      console.error('[ContentAnalytics] getHourlyBreakdown error:', error);
      // Return empty hourly breakdown on error
      const emptyHours = [];
      for (let i = 0; i < 24; i++) {
        emptyHours.push({ hour: i.toString().padStart(2, '0'), opens: 0, clicks: 0, rate: 0 });
      }
      return { success: true, data: emptyHours };
    }
  }

  // ==========================================
  // SEGMENT ANALYTICS
  // ==========================================

  /**
   * Get performance by segment
   */
  async getSegmentPerformance() {
    try {
      // Get segment stats from content_analytics
      const { data, error } = await supabase
        .from('content_analytics')
        .select('segment_stats')
        .eq('content_type', 'push')
        .not('segment_stats', 'is', null)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      // Aggregate segment stats
      const segments = {
        all: { opens: 0, clicks: 0, count: 0 },
        traders: { opens: 0, clicks: 0, count: 0 },
        spiritual: { opens: 0, clicks: 0, count: 0 },
        tier1_plus: { opens: 0, clicks: 0, count: 0 },
        inactive_3d: { opens: 0, clicks: 0, count: 0 },
      };

      (data || []).forEach(item => {
        if (item.segment_stats) {
          Object.entries(item.segment_stats).forEach(([segment, stats]) => {
            if (segments[segment]) {
              segments[segment].opens += stats.opens || 0;
              segments[segment].clicks += stats.clicks || 0;
              segments[segment].count++;
            }
          });
        }
      });

      // Calculate rates
      Object.keys(segments).forEach(segment => {
        const s = segments[segment];
        s.openRate = s.opens > 0 && s.count > 0
          ? ((s.opens / s.count) * 100).toFixed(1)
          : '0';
      });

      return { success: true, data: segments };
    } catch (error) {
      console.error('[ContentAnalytics] getSegmentPerformance error:', error);
      return { success: false, data: {}, error: error.message };
    }
  }

  // ==========================================
  // A/B TEST RESULTS
  // ==========================================

  /**
   * Get A/B test results
   */
  async getABTestResults(limit = 10) {
    try {
      const { data, error } = await supabase
        .from('notification_schedule')
        .select('*')
        .eq('ab_test_enabled', true)
        .eq('status', 'sent')
        .order('sent_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      // Get analytics for each
      const withAnalytics = await Promise.all(
        (data || []).map(async notification => {
          const { data: analytics } = await supabase
            .from('content_analytics')
            .select('ab_variant_stats, ab_winner')
            .eq('notification_id', notification.id)
            .single();

          return {
            ...notification,
            ab_analytics: analytics || {},
          };
        })
      );

      return { success: true, data: withAnalytics };
    } catch (error) {
      console.error('[ContentAnalytics] getABTestResults error:', error);
      return { success: false, data: [], error: error.message };
    }
  }

  // ==========================================
  // TEMPLATE ANALYTICS
  // ==========================================

  /**
   * Get template performance
   */
  async getTemplatePerformance(type = 'push', limit = 10) {
    try {
      const { data, error } = await supabase
        .from('notification_templates')
        .select('*')
        .eq('type', type)
        .eq('is_active', true)
        .gt('usage_count', 0)
        .order('avg_open_rate', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return { success: true, data: data || [] };
    } catch (error) {
      console.error('[ContentAnalytics] getTemplatePerformance error:', error);
      return { success: false, data: [], error: error.message };
    }
  }

  // ==========================================
  // EXPORT
  // ==========================================

  /**
   * Export analytics data to JSON
   */
  async exportAnalytics(startDate, endDate) {
    try {
      const [
        dashboardStats,
        pushStats,
        postStats,
        topPush,
        topPosts,
        hourlyBreakdown,
        segmentPerformance,
      ] = await Promise.all([
        this.getDashboardStats(startDate, endDate),
        this.getPushStats(startDate, endDate),
        this.getPostStats(startDate, endDate),
        this.getTopPushNotifications(20),
        this.getTopPosts(20),
        this.getHourlyBreakdown(startDate, endDate),
        this.getSegmentPerformance(),
      ]);

      return {
        success: true,
        data: {
          period: {
            start: startDate.toISOString(),
            end: endDate.toISOString(),
          },
          overview: dashboardStats.data,
          push: {
            stats: pushStats.data,
            topPerforming: topPush.data,
          },
          posts: {
            stats: postStats.data,
            topPerforming: topPosts.data,
          },
          hourlyBreakdown: hourlyBreakdown.data,
          segments: segmentPerformance.data,
          exportedAt: new Date().toISOString(),
        },
      };
    } catch (error) {
      console.error('[ContentAnalytics] exportAnalytics error:', error);
      return { success: false, error: error.message };
    }
  }
}

export const contentAnalyticsService = new ContentAnalyticsService();
export default contentAnalyticsService;
