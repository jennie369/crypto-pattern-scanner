/**
 * Shadow Mode Service
 * Compare paper trades vs real trades from Binance
 */

import { supabase } from './supabase';
import binanceApiService from './binanceApiService';
import karmaService from './karmaService';

// Gap thresholds for severity
const GAP_THRESHOLDS = {
  PNL_WARNING: -20, // Warning if real PnL < paper by 20%
  PNL_CRITICAL: -50, // Critical if real PnL < paper by 50%
  WIN_RATE_WARNING: -10, // Warning if win rate gap > 10%
  WIN_RATE_CRITICAL: -25, // Critical if win rate gap > 25%
};

// Karma adjustments based on shadow analysis
const KARMA_ADJUSTMENTS = {
  CONSISTENCY_HIGH: 20, // Real matches paper closely
  CONSISTENCY_MEDIUM: 10,
  CONSISTENCY_LOW: -10,
  UNDERPERFORM_WARNING: -20,
  UNDERPERFORM_CRITICAL: -50,
};

class ShadowModeService {
  constructor() {
    this.initialized = false;
    this.cache = new Map();
  }

  /**
   * Initialize service
   */
  async initialize() {
    if (this.initialized) return;
    this.initialized = true;
  }

  // =====================================================
  // STATUS & CONNECTION
  // =====================================================

  /**
   * Check if Shadow Mode is enabled for user
   */
  async isEnabled(userId) {
    try {
      const status = await binanceApiService.getConnectionStatus(userId);
      return status?.connected === true;
    } catch (error) {
      console.error('[ShadowMode] isEnabled error:', error);
      return false;
    }
  }

  /**
   * Get connection status with details
   */
  async getConnectionStatus(userId) {
    try {
      const status = await binanceApiService.getConnectionStatus(userId);
      return status;
    } catch (error) {
      console.error('[ShadowMode] getConnectionStatus error:', error);
      return { connected: false };
    }
  }

  // =====================================================
  // SYNC & DATA
  // =====================================================

  /**
   * Sync trades from Binance
   */
  async syncTrades(userId, days = 30) {
    try {
      const result = await binanceApiService.syncTrades(userId, { days });
      return result;
    } catch (error) {
      console.error('[ShadowMode] syncTrades error:', error);
      throw error;
    }
  }

  /**
   * Get real trades from database
   */
  async getRealTrades(userId, options = {}) {
    const {
      limit = 50,
      offset = 0,
      startDate = null,
      endDate = null,
      symbol = null,
    } = options;

    try {
      let query = supabase
        .from('real_trades')
        .select('*')
        .eq('user_id', userId)
        .order('trade_time', { ascending: false })
        .range(offset, offset + limit - 1);

      if (startDate) {
        query = query.gte('trade_time', startDate);
      }
      if (endDate) {
        query = query.lte('trade_time', endDate);
      }
      if (symbol) {
        query = query.eq('symbol', symbol);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('[ShadowMode] getRealTrades error:', error);
      return [];
    }
  }

  // =====================================================
  // COMPARISON & ANALYSIS
  // =====================================================

  /**
   * Get comparison stats between paper and real trades
   */
  async getComparisonStats(userId, startDate = null, endDate = null) {
    try {
      // Default to last 30 days
      if (!startDate) {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        startDate = thirtyDaysAgo.toISOString().split('T')[0];
      }
      if (!endDate) {
        endDate = new Date().toISOString().split('T')[0];
      }

      const { data, error } = await supabase.rpc('get_shadow_comparison_stats', {
        p_user_id: userId,
        p_start_date: startDate,
        p_end_date: endDate,
      });

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('[ShadowMode] getComparisonStats error:', error);
      return null;
    }
  }

  /**
   * Analyze performance gaps and generate issues
   */
  analyzeIssues(stats) {
    if (!stats) return { issues: [], severity: 'info', recommendations: [] };

    const issues = [];
    const recommendations = [];
    let severity = 'info';

    const pnlGap = stats.gaps?.pnl_gap_percent || 0;
    const winRateGap = stats.gaps?.win_rate_gap || 0;

    // Check PnL gap
    if (pnlGap < GAP_THRESHOLDS.PNL_CRITICAL) {
      issues.push({
        type: 'pnl_critical',
        severity: 'critical',
        message: `Lợi nhuận thực tế thấp hơn Paper Trade ${Math.abs(pnlGap).toFixed(1)}%`,
        detail: 'Đây là dấu hiệu nghiêm trọng của việc không tuân thủ kế hoạch giao dịch',
      });
      severity = 'critical';
    } else if (pnlGap < GAP_THRESHOLDS.PNL_WARNING) {
      issues.push({
        type: 'pnl_warning',
        severity: 'warning',
        message: `Lợi nhuận thực tế thấp hơn Paper Trade ${Math.abs(pnlGap).toFixed(1)}%`,
        detail: 'Cần xem xét lại tâm lý và kỷ luật khi giao dịch thực',
      });
      if (severity === 'info') severity = 'warning';
    }

    // Check win rate gap
    if (winRateGap < GAP_THRESHOLDS.WIN_RATE_CRITICAL) {
      issues.push({
        type: 'win_rate_critical',
        severity: 'critical',
        message: `Tỷ lệ thắng thực tế thấp hơn ${Math.abs(winRateGap).toFixed(1)}%`,
        detail: 'Bạn đang ra quyết định kém hơn nhiều khi giao dịch thực',
      });
      severity = 'critical';
    } else if (winRateGap < GAP_THRESHOLDS.WIN_RATE_WARNING) {
      issues.push({
        type: 'win_rate_warning',
        severity: 'warning',
        message: `Tỷ lệ thắng thực tế thấp hơn ${Math.abs(winRateGap).toFixed(1)}%`,
        detail: 'Có vấn đề về tâm lý khi giao dịch với tiền thật',
      });
      if (severity === 'info') severity = 'warning';
    }

    // Check if real trades much fewer than paper
    const paperCount = stats.paper?.count || 0;
    const realCount = stats.real?.count || 0;

    if (paperCount > 0 && realCount < paperCount * 0.3) {
      issues.push({
        type: 'low_activity',
        severity: 'info',
        message: 'Số lệnh thực tế ít hơn nhiều so với Paper Trade',
        detail: 'Bạn có thể đang e ngại khi giao dịch thực',
      });
    }

    // Generate recommendations
    if (issues.length > 0) {
      recommendations.push({
        action: 'review_emotions',
        message: 'Xem lại trạng thái cảm xúc khi giao dịch thực',
        karmaBonus: 5,
      });

      if (pnlGap < GAP_THRESHOLDS.PNL_WARNING) {
        recommendations.push({
          action: 'reduce_size',
          message: 'Giảm size giao dịch thực để giảm áp lực tâm lý',
          karmaBonus: 10,
        });
      }

      if (winRateGap < GAP_THRESHOLDS.WIN_RATE_WARNING) {
        recommendations.push({
          action: 'follow_plan',
          message: 'Tuân thủ đúng kế hoạch như khi Paper Trade',
          karmaBonus: 15,
        });
      }

      recommendations.push({
        action: 'meditation',
        message: 'Thực hiện thiền định trước khi giao dịch',
        karmaBonus: 5,
      });
    }

    return { issues, severity, recommendations };
  }

  // =====================================================
  // REPORTS
  // =====================================================

  /**
   * Generate shadow report
   */
  async generateReport(userId, reportType = 'weekly') {
    try {
      const { data, error } = await supabase.rpc('generate_shadow_report', {
        p_user_id: userId,
        p_report_type: reportType,
      });

      if (error) throw error;

      // Get the full report
      const report = await this.getReport(data);

      // Adjust karma based on report
      if (report) {
        await this.adjustKarmaFromReport(userId, report);
      }

      return report;
    } catch (error) {
      console.error('[ShadowMode] generateReport error:', error);
      throw error;
    }
  }

  /**
   * Get specific report by ID
   */
  async getReport(reportId) {
    try {
      const { data, error } = await supabase
        .from('shadow_reports')
        .select('*')
        .eq('id', reportId)
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('[ShadowMode] getReport error:', error);
      return null;
    }
  }

  /**
   * Get recent reports
   */
  async getReports(userId, limit = 10) {
    try {
      const { data, error } = await supabase.rpc('get_shadow_reports', {
        p_user_id: userId,
        p_limit: limit,
      });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('[ShadowMode] getReports error:', error);
      return [];
    }
  }

  /**
   * Adjust karma based on shadow report
   */
  async adjustKarmaFromReport(userId, report) {
    try {
      let karmaChange = 0;
      let reason = '';

      const pnlGap = report.pnl_gap_percent || 0;
      const winRateGap = report.win_rate_gap || 0;

      // Determine karma adjustment
      if (pnlGap >= -5 && winRateGap >= -5) {
        // High consistency
        karmaChange = KARMA_ADJUSTMENTS.CONSISTENCY_HIGH;
        reason = 'Shadow Mode: Kết quả thực tế phù hợp với Paper Trade';
      } else if (pnlGap >= -15 && winRateGap >= -10) {
        // Medium consistency
        karmaChange = KARMA_ADJUSTMENTS.CONSISTENCY_MEDIUM;
        reason = 'Shadow Mode: Kết quả thực tế chấp nhận được';
      } else if (pnlGap < GAP_THRESHOLDS.PNL_CRITICAL || winRateGap < GAP_THRESHOLDS.WIN_RATE_CRITICAL) {
        // Critical underperformance
        karmaChange = KARMA_ADJUSTMENTS.UNDERPERFORM_CRITICAL;
        reason = 'Shadow Mode: Kết quả thực tế kém hơn nhiều so với Paper Trade';
      } else if (pnlGap < GAP_THRESHOLDS.PNL_WARNING || winRateGap < GAP_THRESHOLDS.WIN_RATE_WARNING) {
        // Warning underperformance
        karmaChange = KARMA_ADJUSTMENTS.UNDERPERFORM_WARNING;
        reason = 'Shadow Mode: Kết quả thực tế kém hơn Paper Trade';
      }

      if (karmaChange !== 0) {
        await karmaService.updateKarma(userId, karmaChange, 'shadow_report', {
          detail: reason,
          relatedId: report.id,
        });

        // Update report with karma adjustment
        await supabase
          .from('shadow_reports')
          .update({
            karma_adjustment: karmaChange,
            karma_reason: reason,
          })
          .eq('id', report.id);
      }

      return { karmaChange, reason };
    } catch (error) {
      console.error('[ShadowMode] adjustKarmaFromReport error:', error);
      return { karmaChange: 0, reason: '' };
    }
  }

  // =====================================================
  // SUMMARY HELPERS
  // =====================================================

  /**
   * Get quick summary for dashboard
   */
  async getQuickSummary(userId) {
    try {
      const [status, stats, reports] = await Promise.all([
        this.getConnectionStatus(userId),
        this.getComparisonStats(userId),
        this.getReports(userId, 3),
      ]);

      if (!status.connected) {
        return {
          enabled: false,
          status,
        };
      }

      const analysis = this.analyzeIssues(stats);

      return {
        enabled: true,
        status,
        stats,
        analysis,
        recentReports: reports,
        lastSyncAt: status.last_sync_at,
      };
    } catch (error) {
      console.error('[ShadowMode] getQuickSummary error:', error);
      return { enabled: false };
    }
  }
}

const shadowModeService = new ShadowModeService();
export default shadowModeService;
