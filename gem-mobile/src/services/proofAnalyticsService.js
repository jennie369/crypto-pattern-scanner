/**
 * ═══════════════════════════════════════════════════════════════════════════
 * PROOF ANALYTICS SERVICE
 * ROI Proof System - Phase D
 * Personal insights, progress tracking, and community comparison
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { supabase } from './supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import accountHealthService from './accountHealthService';

const ANALYTICS_CACHE_KEY = '@gem_proof_analytics_cache';
const INSIGHTS_CACHE_KEY = '@gem_personal_insights_cache';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * KPI types for progress tracking
 */
export const KPI_TYPES = {
  WIN_RATE: 'win_rate',
  DISCIPLINE: 'discipline',
  PNL: 'pnl',
  RITUALS: 'rituals',
};

/**
 * Insight types for AI insights
 */
export const INSIGHT_TYPES = {
  POSITIVE: 'positive',
  WARNING: 'warning',
  NEUTRAL: 'neutral',
};

class ProofAnalyticsService {
  // Cache
  cachedProgress = null;
  cachedComparison = null;
  lastFetch = null;

  // ═══════════════════════════════════════════════════════════════════════
  // PERSONAL PROGRESS
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Get personal progress with 4 KPIs
   * @param {string} userId - User ID
   */
  async getPersonalProgress(userId) {
    try {
      if (!userId) {
        return { success: false, error: 'No user ID', data: null };
      }

      // Get user progress analysis from RPC
      const { data, error } = await supabase.rpc('user_progress_analysis', {
        p_user_id: userId,
      });

      if (error) throw error;

      const current = data?.current || {};
      const previous = data?.previous || {};
      const changes = data?.changes || {};
      const percentiles = data?.percentiles || {};

      // Build 4 KPI cards
      const kpis = [
        {
          id: KPI_TYPES.WIN_RATE,
          label: 'Tỷ lệ thắng',
          value: current.avg_win_rate ?? 0,
          previousValue: previous.avg_win_rate ?? 0,
          change: changes.win_rate_change ?? 0,
          percentile: percentiles.win_rate_percentile ?? 50,
          suffix: '%',
          icon: 'TrendingUp',
          color: this.getChangeColor(changes.win_rate_change),
        },
        {
          id: KPI_TYPES.DISCIPLINE,
          label: 'Điểm kỷ luật',
          value: current.avg_discipline ?? 0,
          previousValue: previous.avg_discipline ?? 0,
          change: changes.discipline_change ?? 0,
          percentile: percentiles.discipline_percentile ?? 50,
          suffix: '',
          icon: 'Shield',
          color: this.getChangeColor(changes.discipline_change),
        },
        {
          id: KPI_TYPES.PNL,
          label: 'Lợi nhuận 30 ngày',
          value: current.total_pnl ?? 0,
          previousValue: previous.total_pnl ?? 0,
          change: changes.pnl_change ?? 0,
          percentile: percentiles.pnl_percentile ?? 50,
          prefix: '$',
          icon: 'DollarSign',
          color: this.getChangeColor(changes.pnl_change),
        },
        {
          id: KPI_TYPES.RITUALS,
          label: 'Ngày hoạt động',
          value: current.active_days ?? 0,
          previousValue: 0,
          change: 0,
          suffix: ' ngày',
          icon: 'Calendar',
          color: '#3AF7A6',
        },
      ];

      return {
        success: true,
        data: {
          kpis,
          practiceLevel: current.practice_level || 'inactive',
          traderType: current.trader_type || 'manual_trader',
          wellnessType: current.wellness_type || 'ritual_inactive',
          disciplineType: current.discipline_type || 'moderate',
          profileDate: current.profile_date,
          hasImproved: changes.practice_level_improved || false,
        },
      };
    } catch (error) {
      console.error('[ProofAnalyticsService] getPersonalProgress error:', error);
      return { success: false, error: error?.message || 'Unknown error', data: null };
    }
  }

  /**
   * Get monthly evolution data for chart
   * @param {string} userId - User ID
   */
  async getMonthlyEvolution(userId) {
    try {
      if (!userId) {
        return { success: false, error: 'No user ID', data: [] };
      }

      const { data, error } = await supabase.rpc('user_progress_analysis', {
        p_user_id: userId,
      });

      if (error) throw error;

      const evolution = data?.evolution || [];

      // Transform for chart display
      const chartData = evolution.map(item => ({
        month: item.month,
        monthLabel: this.formatMonth(item.month),
        winRate: item.avg_win_rate ?? 0,
        pnl: item.total_pnl ?? 0,
        discipline: item.avg_discipline ?? 0,
        activeDays: item.active_days ?? 0,
        trades: item.trades ?? 0,
      })).reverse(); // Oldest first for chart

      return { success: true, data: chartData };
    } catch (error) {
      console.error('[ProofAnalyticsService] getMonthlyEvolution error:', error);
      return { success: false, error: error?.message || 'Unknown error', data: [] };
    }
  }

  /**
   * Get community comparison data
   * @param {string} userId - User ID
   */
  async getCommunityComparison(userId) {
    try {
      if (!userId) {
        return { success: false, error: 'No user ID', data: null };
      }

      const { data, error } = await supabase.rpc('get_user_cohort_comparison', {
        p_user_id: userId,
      });

      if (error) throw error;

      if (!data || data.success === false) {
        return { success: false, error: data?.error || 'No data', data: null };
      }

      const user = data.user || {};
      const cohort = data.cohort || {};
      const comparison = data.comparison || {};

      // Build comparison bars
      const comparisons = [
        {
          id: 'win_rate',
          label: 'Tỷ lệ thắng',
          userValue: user.win_rate ?? 0,
          communityValue: cohort.avg_win_rate ?? 0,
          difference: comparison.win_rate_vs_cohort ?? 0,
          suffix: '%',
          isAboveAverage: (comparison.win_rate_vs_cohort ?? 0) > 0,
        },
        {
          id: 'discipline',
          label: 'Điểm kỷ luật',
          userValue: user.discipline ?? 0,
          communityValue: cohort.avg_discipline ?? 0,
          difference: comparison.discipline_vs_cohort ?? 0,
          suffix: '',
          isAboveAverage: (comparison.discipline_vs_cohort ?? 0) > 0,
        },
        {
          id: 'pnl',
          label: 'Lợi nhuận 30 ngày',
          userValue: user.pnl ?? 0,
          communityValue: cohort.avg_pnl ?? 0,
          difference: comparison.pnl_vs_cohort ?? 0,
          prefix: '$',
          isAboveAverage: (comparison.pnl_vs_cohort ?? 0) > 0,
        },
        {
          id: 'rituals',
          label: 'Ritual mỗi tháng',
          userValue: user.rituals ?? 0,
          communityValue: cohort.avg_rituals ?? 0,
          difference: (user.rituals ?? 0) - (cohort.avg_rituals ?? 0),
          suffix: '',
          isAboveAverage: (user.rituals ?? 0) > (cohort.avg_rituals ?? 0),
        },
      ];

      return {
        success: true,
        data: {
          comparisons,
          cohortName: cohort.name || 'Cộng đồng',
          cohortSize: cohort.size || 0,
          isAboveAverage: comparison.is_above_average || false,
          practiceLevel: user.practice_level,
        },
      };
    } catch (error) {
      console.error('[ProofAnalyticsService] getCommunityComparison error:', error);
      return { success: false, error: error?.message || 'Unknown error', data: null };
    }
  }

  /**
   * Get personal insights (local AI - no Gemini call needed)
   * @param {string} userId - User ID
   */
  async getPersonalInsights(userId) {
    try {
      if (!userId) {
        return { success: false, error: 'No user ID', data: [] };
      }

      // Get all the data we need
      const [progressResult, comparisonResult, healthResult] = await Promise.allSettled([
        this.getPersonalProgress(userId),
        this.getCommunityComparison(userId),
        accountHealthService.getLatestSnapshot(userId),
      ]);

      const progress = progressResult.status === 'fulfilled' ? progressResult.value.data : null;
      const comparison = comparisonResult.status === 'fulfilled' ? comparisonResult.value.data : null;
      const health = healthResult.status === 'fulfilled' ? healthResult.value.data : null;

      const insights = [];

      // Generate insights based on data
      if (progress) {
        // Win rate insights
        const winRateKpi = progress.kpis?.find(k => k.id === KPI_TYPES.WIN_RATE);
        if (winRateKpi) {
          if (winRateKpi.change > 5) {
            insights.push({
              type: INSIGHT_TYPES.POSITIVE,
              icon: 'TrendingUp',
              text: `Tỷ lệ thắng của bạn tăng ${winRateKpi.change.toFixed(1)}% so với tháng trước. Tiếp tục giữ vững phong độ!`,
            });
          } else if (winRateKpi.change < -5) {
            insights.push({
              type: INSIGHT_TYPES.WARNING,
              icon: 'TrendingDown',
              text: `Tỷ lệ thắng giảm ${Math.abs(winRateKpi.change).toFixed(1)}%. Hãy xem lại nhật ký trading để tìm nguyên nhân.`,
            });
          }

          if (winRateKpi.percentile >= 80) {
            insights.push({
              type: INSIGHT_TYPES.POSITIVE,
              icon: 'Award',
              text: `Bạn nằm trong top ${100 - winRateKpi.percentile}% về tỷ lệ thắng trong cộng đồng!`,
            });
          }
        }

        // Discipline insights
        const disciplineKpi = progress.kpis?.find(k => k.id === KPI_TYPES.DISCIPLINE);
        if (disciplineKpi) {
          if (disciplineKpi.value >= 80) {
            insights.push({
              type: INSIGHT_TYPES.POSITIVE,
              icon: 'Shield',
              text: 'Kỷ luật trading của bạn rất tốt. Đây là yếu tố quan trọng nhất để thành công lâu dài.',
            });
          } else if (disciplineKpi.value < 50) {
            insights.push({
              type: INSIGHT_TYPES.WARNING,
              icon: 'AlertTriangle',
              text: 'Điểm kỷ luật dưới 50 cho thấy bạn cần cải thiện việc tuân thủ kế hoạch trading.',
            });
          }
        }

        // Practice level insights
        if (progress.practiceLevel === 'devoted') {
          insights.push({
            type: INSIGHT_TYPES.POSITIVE,
            icon: 'Star',
            text: 'Bạn là người tập luyện chăm chỉ nhất! 26+ ngày hoạt động trong tháng.',
          });
        } else if (progress.practiceLevel === 'inactive') {
          insights.push({
            type: INSIGHT_TYPES.WARNING,
            icon: 'Clock',
            text: 'Bạn chưa hoạt động nhiều trong tháng này. Hãy cố gắng duy trì đều đặn để thấy kết quả.',
          });
        }
      }

      // Health insights
      if (health) {
        if (health.health_status === 'healthy') {
          insights.push({
            type: INSIGHT_TYPES.POSITIVE,
            icon: 'Heart',
            text: 'Tài khoản của bạn đang trong tình trạng khỏe mạnh. Tiếp tục quản lý rủi ro tốt!',
          });
        } else if (health.isCritical) {
          insights.push({
            type: INSIGHT_TYPES.WARNING,
            icon: 'AlertOctagon',
            text: 'Tài khoản đang ở mức nguy hiểm. Hãy dừng trading và xem xét lại chiến lược.',
          });
        }
      }

      // Comparison insights
      if (comparison) {
        if (comparison.isAboveAverage) {
          insights.push({
            type: INSIGHT_TYPES.POSITIVE,
            icon: 'Users',
            text: `Bạn đang vượt trội hơn mức trung bình của nhóm ${this.getPracticeLevelLabel(comparison.practiceLevel)}.`,
          });
        }
      }

      // Limit to 5 insights
      const limitedInsights = insights.slice(0, 5);

      // If no insights, add default
      if (limitedInsights.length === 0) {
        limitedInsights.push({
          type: INSIGHT_TYPES.NEUTRAL,
          icon: 'Info',
          text: 'Tiếp tục trading và làm ritual để nhận được phân tích chi tiết hơn.',
        });
      }

      return { success: true, data: limitedInsights };
    } catch (error) {
      console.error('[ProofAnalyticsService] getPersonalInsights error:', error);
      return { success: false, error: error?.message || 'Unknown error', data: [] };
    }
  }

  /**
   * Get next steps recommendations
   * @param {string} userId - User ID
   */
  async getNextSteps(userId) {
    try {
      if (!userId) {
        return { success: false, error: 'No user ID', data: [] };
      }

      const progressResult = await this.getPersonalProgress(userId);
      const progress = progressResult.data;

      const steps = [];

      if (!progress) {
        steps.push({
          id: 'start',
          title: 'Bắt đầu hành trình',
          description: 'Hoàn thành ritual buổi sáng để khởi đầu ngày mới với tinh thần tốt.',
          action: 'RitualPlayground',
          icon: 'Sunrise',
        });
        return { success: true, data: steps };
      }

      // Based on practice level
      if (progress.practiceLevel === 'inactive' || progress.practiceLevel === 'casual') {
        steps.push({
          id: 'increase_activity',
          title: 'Tăng thời gian hoạt động',
          description: 'Cố gắng hoạt động ít nhất 15 ngày/tháng để nâng cấp lên Regular.',
          action: 'VisionBoard',
          icon: 'Calendar',
        });
      }

      // Based on discipline
      const disciplineKpi = progress.kpis?.find(k => k.id === KPI_TYPES.DISCIPLINE);
      if (disciplineKpi && disciplineKpi.value < 70) {
        steps.push({
          id: 'improve_discipline',
          title: 'Cải thiện kỷ luật',
          description: 'Sử dụng checklist trước mỗi lệnh và ghi nhật ký trading đều đặn.',
          action: 'TradingJournal',
          icon: 'ClipboardCheck',
        });
      }

      // Based on wellness type
      if (progress.wellnessType === 'ritual_inactive') {
        steps.push({
          id: 'start_rituals',
          title: 'Bắt đầu Ritual',
          description: 'Người làm ritual buổi sáng có tỷ lệ thắng cao hơn 15% trung bình.',
          action: 'RitualPlayground',
          icon: 'Sparkles',
        });
      }

      // Based on win rate
      const winRateKpi = progress.kpis?.find(k => k.id === KPI_TYPES.WIN_RATE);
      if (winRateKpi && winRateKpi.value < 50) {
        steps.push({
          id: 'use_scanner',
          title: 'Sử dụng Scanner',
          description: 'Scanner AI giúp tìm setup chất lượng cao với win rate cải thiện đáng kể.',
          action: 'ScannerScreen',
          icon: 'Search',
        });
      }

      // Default step
      if (steps.length === 0) {
        steps.push({
          id: 'maintain',
          title: 'Duy trì phong độ',
          description: 'Bạn đang làm rất tốt! Tiếp tục duy trì kỷ luật và ritual hàng ngày.',
          action: 'Dashboard',
          icon: 'Star',
        });
      }

      return { success: true, data: steps.slice(0, 3) };
    } catch (error) {
      console.error('[ProofAnalyticsService] getNextSteps error:', error);
      return { success: false, error: error?.message || 'Unknown error', data: [] };
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  // CORRELATION DATA (for admin)
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Get all correlation data
   */
  async getAllCorrelations() {
    try {
      const [ritualVsWinrate, scannerVsManual, karmaVsBurn, disciplineVsPerf, morningRitual] =
        await Promise.all([
          supabase.rpc('correlation_ritual_vs_winrate'),
          supabase.rpc('correlation_scanner_vs_manual'),
          supabase.rpc('correlation_karma_vs_burn'),
          supabase.rpc('correlation_discipline_vs_performance'),
          supabase.rpc('correlation_morning_ritual_vs_trading'),
        ]);

      return {
        success: true,
        data: {
          ritualVsWinrate: ritualVsWinrate.data,
          scannerVsManual: scannerVsManual.data,
          karmaVsBurn: karmaVsBurn.data,
          disciplineVsPerformance: disciplineVsPerf.data,
          morningRitualVsTrading: morningRitual.data,
        },
      };
    } catch (error) {
      console.error('[ProofAnalyticsService] getAllCorrelations error:', error);
      return { success: false, error: error?.message || 'Unknown error', data: null };
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  // HELPER METHODS
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Get color based on change value
   */
  getChangeColor(change) {
    if (change == null) return '#6B7280';
    if (change > 0) return '#3AF7A6'; // success
    if (change < 0) return '#FF6B6B'; // error
    return '#6B7280'; // neutral
  }

  /**
   * Format month string for display
   */
  formatMonth(monthStr) {
    if (!monthStr) return '';
    const [year, month] = monthStr.split('-');
    const months = ['Th1', 'Th2', 'Th3', 'Th4', 'Th5', 'Th6', 'Th7', 'Th8', 'Th9', 'Th10', 'Th11', 'Th12'];
    return months[parseInt(month, 10) - 1] || month;
  }

  /**
   * Get practice level label in Vietnamese
   */
  getPracticeLevelLabel(level) {
    const labels = {
      inactive: 'Không hoạt động',
      casual: 'Bình thường',
      regular: 'Đều đặn',
      committed: 'Cam kết',
      devoted: 'Tận tụy',
    };
    return labels[level] || level;
  }

  /**
   * Get trader type label in Vietnamese
   */
  getTraderTypeLabel(type) {
    const labels = {
      scanner_user: 'Dùng Scanner',
      manual_trader: 'Trading thủ công',
      hybrid: 'Kết hợp',
      non_trader: 'Chưa trading',
    };
    return labels[type] || type;
  }

  /**
   * Get wellness type label in Vietnamese
   */
  getWellnessTypeLabel(type) {
    const labels = {
      ritual_active: 'Ritual tích cực',
      ritual_casual: 'Ritual bình thường',
      ritual_inactive: 'Chưa làm Ritual',
    };
    return labels[type] || type;
  }

  /**
   * Get discipline type label in Vietnamese
   */
  getDisciplineTypeLabel(type) {
    const labels = {
      disciplined: 'Kỷ luật cao',
      moderate: 'Kỷ luật vừa',
      undisciplined: 'Cần cải thiện',
    };
    return labels[type] || type;
  }

  /**
   * Clear all cached data
   */
  async clearCache() {
    this.cachedProgress = null;
    this.cachedComparison = null;
    this.lastFetch = null;
    await AsyncStorage.multiRemove([ANALYTICS_CACHE_KEY, INSIGHTS_CACHE_KEY]);
    console.log('[ProofAnalyticsService] Cache cleared');
  }
}

export const proofAnalyticsService = new ProofAnalyticsService();
export default proofAnalyticsService;
