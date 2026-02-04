/**
 * ROI Analytics API Service
 * Phase E - Admin ROI Dashboard
 * Handles all ROI analytics and AI report operations
 */

import { supabase } from './supabase';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pgfkbcnzqozzkohwbgbk.supabase.co';

export const roiAnalyticsService = {
  // ============ ROI Summary ============

  /**
   * Get comprehensive ROI summary
   * @param {number} days - Number of days to analyze (default 30)
   */
  async getRoiSummary(days = 30) {
    try {
      const { data, error } = await supabase.rpc('get_admin_roi_summary', {
        p_days: days,
      });

      if (error) throw error;

      return {
        success: true,
        data: data || {},
      };
    } catch (error) {
      console.error('[ROI Analytics] getRoiSummary error:', error);
      return {
        success: false,
        error: error.message,
        data: {},
      };
    }
  },

  // ============ AI Reports ============

  /**
   * Get AI reports with pagination
   * @param {Object} params - Query params
   */
  async getAiReports({ status = 'all', page = 1, limit = 20 } = {}) {
    try {
      let query = supabase
        .from('admin_ai_daily_reports')
        .select('*', { count: 'exact' })
        .order('report_date', { ascending: false });

      if (status !== 'all') {
        query = query.eq('status', status);
      }

      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, count, error } = await query;

      if (error) throw error;

      return {
        success: true,
        reports: data || [],
        total: count || 0,
      };
    } catch (error) {
      console.error('[ROI Analytics] getAiReports error:', error);
      return {
        success: false,
        reports: [],
        total: 0,
        error: error.message,
      };
    }
  },

  /**
   * Get a single AI report by date
   * @param {string} date - Report date (YYYY-MM-DD)
   */
  async getAiReportByDate(date) {
    try {
      const { data, error } = await supabase
        .from('admin_ai_daily_reports')
        .select('*')
        .eq('report_date', date)
        .single();

      if (error) throw error;

      return {
        success: true,
        report: data,
      };
    } catch (error) {
      console.error('[ROI Analytics] getAiReportByDate error:', error);
      return {
        success: false,
        report: null,
        error: error.message,
      };
    }
  },

  /**
   * Get the latest completed AI report
   */
  async getLatestAiReport() {
    try {
      const { data, error } = await supabase.rpc('get_latest_ai_report');

      if (error) throw error;

      return {
        success: data?.success || false,
        report: data?.success ? data : null,
        error: data?.error,
      };
    } catch (error) {
      console.error('[ROI Analytics] getLatestAiReport error:', error);
      return {
        success: false,
        report: null,
        error: error.message,
      };
    }
  },

  /**
   * Trigger a new AI report generation
   * @param {string} date - Target date (defaults to today)
   */
  async triggerAiReport(date = null) {
    try {
      const targetDate = date || new Date().toISOString().split('T')[0];

      // Create pending report entry
      const { error: insertError } = await supabase
        .from('admin_ai_daily_reports')
        .upsert(
          {
            report_date: targetDate,
            status: 'pending',
            raw_data: {},
            created_at: new Date().toISOString(),
          },
          {
            onConflict: 'report_date',
          }
        );

      if (insertError) throw insertError;

      // Call the edge function
      const response = await fetch(`${SUPABASE_URL}/functions/v1/roi-ai-report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ date: targetDate }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const result = await response.json();

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.error('[ROI Analytics] triggerAiReport error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  /**
   * Retry a failed AI report
   * @param {string} date - Report date to retry
   */
  async retryAiReport(date) {
    try {
      // Reset status to pending
      const { error: updateError } = await supabase
        .from('admin_ai_daily_reports')
        .update({
          status: 'pending',
          error_message: null,
          updated_at: new Date().toISOString(),
        })
        .eq('report_date', date);

      if (updateError) throw updateError;

      // Trigger generation
      return this.triggerAiReport(date);
    } catch (error) {
      console.error('[ROI Analytics] retryAiReport error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // ============ Export ============

  /**
   * Export ROI data as HTML
   * @param {Object} params - Export params
   */
  async exportHtml({ startDate, endDate, config = {} } = {}) {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const response = await fetch(`${SUPABASE_URL}/functions/v1/roi-export-html`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          start_date: startDate,
          end_date: endDate,
          user_id: user?.id,
          config,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const result = await response.json();

      return {
        success: true,
        ...result,
      };
    } catch (error) {
      console.error('[ROI Analytics] exportHtml error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  /**
   * Get export history
   * @param {Object} params - Query params
   */
  async getExportHistory({ page = 1, limit = 20 } = {}) {
    try {
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const { data, count, error } = await supabase
        .from('proof_export_history')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;

      return {
        success: true,
        exports: data || [],
        total: count || 0,
      };
    } catch (error) {
      console.error('[ROI Analytics] getExportHistory error:', error);
      return {
        success: false,
        exports: [],
        total: 0,
        error: error.message,
      };
    }
  },

  // ============ Health Snapshots ============

  /**
   * Get health distribution over time
   * @param {number} days - Number of days
   */
  async getHealthTrend(days = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('account_health_snapshots')
        .select('snapshot_date, health_status')
        .gte('snapshot_date', startDate.toISOString().split('T')[0])
        .order('snapshot_date', { ascending: true });

      if (error) throw error;

      // Group by date and status
      const grouped = {};
      (data || []).forEach((row) => {
        const date = row.snapshot_date;
        if (!grouped[date]) {
          grouped[date] = { healthy: 0, warning: 0, danger: 0, burned: 0, wiped: 0 };
        }
        const status = row.health_status || 'healthy';
        if (grouped[date][status] !== undefined) {
          grouped[date][status]++;
        }
      });

      const trend = Object.entries(grouped).map(([date, counts]) => ({
        date,
        ...counts,
      }));

      return {
        success: true,
        trend,
      };
    } catch (error) {
      console.error('[ROI Analytics] getHealthTrend error:', error);
      return {
        success: false,
        trend: [],
        error: error.message,
      };
    }
  },

  /**
   * Get burn events summary
   * @param {number} days - Number of days
   */
  async getBurnEventsSummary(days = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('account_burn_events')
        .select('event_date, direction, new_status')
        .gte('event_date', startDate.toISOString().split('T')[0])
        .order('event_date', { ascending: true });

      if (error) throw error;

      // Calculate summary
      const degrading = (data || []).filter((e) => e.direction === 'degrading').length;
      const recovering = (data || []).filter((e) => e.direction === 'recovering').length;

      // Group by date
      const byDate = {};
      (data || []).forEach((row) => {
        const date = row.event_date;
        if (!byDate[date]) {
          byDate[date] = { degrading: 0, recovering: 0 };
        }
        if (row.direction === 'degrading') byDate[date].degrading++;
        else byDate[date].recovering++;
      });

      return {
        success: true,
        summary: {
          total_degrading: degrading,
          total_recovering: recovering,
          net_change: recovering - degrading,
        },
        byDate: Object.entries(byDate).map(([date, counts]) => ({ date, ...counts })),
      };
    } catch (error) {
      console.error('[ROI Analytics] getBurnEventsSummary error:', error);
      return {
        success: false,
        summary: { total_degrading: 0, total_recovering: 0, net_change: 0 },
        byDate: [],
        error: error.message,
      };
    }
  },

  // ============ Cohorts ============

  /**
   * Get cohort comparison data
   * @param {string} groupBy - Group by field
   */
  async getCohortComparison(groupBy = 'practice_level') {
    try {
      const { data, error } = await supabase.rpc('compare_cohorts', {
        p_group_by: groupBy,
        p_min_trades: 5,
      });

      if (error) throw error;

      return {
        success: true,
        cohorts: data || [],
      };
    } catch (error) {
      console.error('[ROI Analytics] getCohortComparison error:', error);
      return {
        success: false,
        cohorts: [],
        error: error.message,
      };
    }
  },

  // ============ Correlations ============

  /**
   * Get all correlation analyses
   */
  async getAllCorrelations() {
    try {
      const [ritual, scanner, karma, discipline, morning] = await Promise.allSettled([
        supabase.rpc('correlation_ritual_vs_winrate', { p_min_days: 7, p_min_trades: 5 }),
        supabase.rpc('correlation_scanner_vs_manual', { p_min_days: 7, p_min_trades: 5 }),
        supabase.rpc('correlation_karma_vs_burn', { p_min_users: 10 }),
        supabase.rpc('correlation_discipline_vs_performance', { p_min_days: 7 }),
        supabase.rpc('correlation_morning_ritual_vs_trading', { p_min_days: 7 }),
      ]);

      return {
        success: true,
        correlations: {
          ritual_vs_winrate: ritual.status === 'fulfilled' ? ritual.value.data : null,
          scanner_vs_manual: scanner.status === 'fulfilled' ? scanner.value.data : null,
          karma_vs_burn: karma.status === 'fulfilled' ? karma.value.data : null,
          discipline_vs_performance:
            discipline.status === 'fulfilled' ? discipline.value.data : null,
          morning_ritual_vs_trading:
            morning.status === 'fulfilled' ? morning.value.data : null,
        },
      };
    } catch (error) {
      console.error('[ROI Analytics] getAllCorrelations error:', error);
      return {
        success: false,
        correlations: {},
        error: error.message,
      };
    }
  },

  // ============ Real-time Subscriptions ============

  /**
   * Subscribe to AI report updates
   */
  subscribeToReports(callback) {
    return supabase
      .channel('admin_ai_reports_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'admin_ai_daily_reports' },
        callback
      )
      .subscribe();
  },

  /**
   * Unsubscribe from channel
   */
  unsubscribe(subscription) {
    if (subscription) {
      supabase.removeChannel(subscription);
    }
  },
};

export default roiAnalyticsService;
