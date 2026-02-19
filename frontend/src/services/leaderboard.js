/**
 * Leaderboard Service
 * Gamification and ranking functionality
 */

import { supabase } from '../lib/supabaseClient';

class LeaderboardService {
  /**
   * Get leaderboard rankings
   * @param {Object} options - Filter options
   * @returns {Promise<Object>} Leaderboard data with rankings
   */
  async getLeaderboard({ period = 'all-time', metric = 'win_rate', page = 1, limit = 50 } = {}) {
    try {
      let query = supabase
        .from('user_stats')
        .select(`
          *,
          profiles:user_id(
            id,
            display_name,
            avatar_url,
            scanner_tier,
            created_at
          )
        `, { count: 'exact' });

      // Filter by period
      if (period !== 'all-time') {
        const startDate = this.getStartDateForPeriod(period);
        if (startDate) {
          query = query.gte('period_start', startDate);
        }
      }

      // Order by metric
      const orderColumn = this.getOrderColumn(metric);
      query = query
        .order(orderColumn, { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      const { data, error, count } = await query;
      if (error) throw error;

      // Calculate rankings
      const rankedData = data.map((item, index) => ({
        ...item,
        rank: (page - 1) * limit + index + 1,
        previous_rank: item.previous_rank || null,
        rank_change: item.previous_rank
          ? item.previous_rank - ((page - 1) * limit + index + 1)
          : 0
      }));

      return {
        leaderboard: rankedData,
        total: count,
        page,
        totalPages: Math.ceil(count / limit)
      };
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      throw error;
    }
  }

  /**
   * Get user's rank for a specific metric
   * @param {string} userId - User ID
   * @param {string} metric - Metric to rank by
   * @returns {Promise<number>} User's rank
   */
  async getUserRank(userId, metric = 'win_rate') {
    try {
      const orderColumn = this.getOrderColumn(metric);

      const { data: userStat } = await supabase
        .from('user_stats')
        .select(orderColumn)
        .eq('user_id', userId)
        .single();

      if (!userStat) return null;

      const userValue = userStat[orderColumn];

      const { count } = await supabase
        .from('user_stats')
        .select('*', { count: 'exact', head: true })
        .gt(orderColumn, userValue);

      return (count || 0) + 1;
    } catch (error) {
      console.error('Error getting user rank:', error);
      return null;
    }
  }

  /**
   * Get user's achievements
   * @param {string} userId - User ID
   * @returns {Promise<Array>} List of unlocked achievements
   */
  async getUserAchievements(userId) {
    try {
      const { data, error } = await supabase
        .from('user_achievements')
        .select(`
          *,
          achievements(*)
        `)
        .eq('user_id', userId)
        .order('unlocked_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user achievements:', error);
      throw error;
    }
  }

  /**
   * Get all available achievements
   * @returns {Promise<Array>} List of all achievements
   */
  async getAllAchievements() {
    try {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .order('category', { ascending: true })
        .order('points', { ascending: true });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching achievements:', error);
      throw error;
    }
  }

  /**
   * Award achievement to user
   * @param {string} userId - User ID
   * @param {string} achievementId - Achievement ID
   * @returns {Promise<void>}
   */
  async awardAchievement(userId, achievementId) {
    try {
      const { error } = await supabase
        .from('user_achievements')
        .insert({
          user_id: userId,
          achievement_id: achievementId,
          unlocked_at: new Date().toISOString()
        });

      if (error && error.code !== '23505') throw error; // Ignore duplicate
    } catch (error) {
      console.error('Error awarding achievement:', error);
      throw error;
    }
  }

  /**
   * Update user stats
   * @param {string} userId - User ID
   * @param {Object} stats - Stats object
   * @returns {Promise<void>}
   */
  async updateUserStats(userId, stats) {
    try {
      const { error } = await supabase
        .from('user_stats')
        .upsert({
          user_id: userId,
          total_trades: stats.totalTrades,
          winning_trades: stats.winningTrades,
          losing_trades: stats.losingTrades,
          win_rate: stats.winRate,
          total_profit: stats.totalProfit,
          total_loss: stats.totalLoss,
          roi: stats.roi,
          best_streak: stats.bestStreak,
          current_streak: stats.currentStreak,
          patterns_detected: stats.patternsDetected,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      // Check for achievements
      await this.checkAchievements(userId, stats);
    } catch (error) {
      console.error('Error updating user stats:', error);
      throw error;
    }
  }

  /**
   * Recalculate user stats from database
   * @param {string} userId - User ID
   * @returns {Promise<void>}
   */
  async recalculateUserStats(userId) {
    try {
      // Call the database function to calculate stats
      const { error } = await supabase.rpc('calculate_user_stats', {
        p_user_id: userId
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error recalculating user stats:', error);
      throw error;
    }
  }

  /**
   * Check and award achievements based on stats
   * @param {string} userId - User ID
   * @param {Object} stats - User stats
   * @returns {Promise<void>}
   */
  async checkAchievements(userId, stats) {
    try {
      const achievements = await this.getAllAchievements();

      for (const achievement of achievements) {
        if (this.meetsAchievementCriteria(stats, achievement)) {
          await this.awardAchievement(userId, achievement.id);
        }
      }
    } catch (error) {
      console.error('Error checking achievements:', error);
    }
  }

  /**
   * Check if user meets achievement criteria
   * @param {Object} stats - User stats
   * @param {Object} achievement - Achievement object
   * @returns {boolean} True if criteria met
   */
  meetsAchievementCriteria(stats, achievement) {
    switch (achievement.criteria_type) {
      case 'win_rate':
        return stats.winRate >= achievement.criteria_value && stats.totalTrades >= 10;
      case 'total_trades':
        return stats.totalTrades >= achievement.criteria_value;
      case 'profit':
        return stats.totalProfit >= achievement.criteria_value;
      case 'streak':
        return stats.bestStreak >= achievement.criteria_value;
      case 'patterns':
        return stats.patternsDetected >= achievement.criteria_value;
      default:
        return false;
    }
  }

  /**
   * Get start date for period filter
   * @param {string} period - Period type
   * @returns {string} ISO date string
   */
  getStartDateForPeriod(period) {
    const now = new Date();
    switch (period) {
      case 'weekly':
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        weekStart.setHours(0, 0, 0, 0);
        return weekStart.toISOString();
      case 'monthly':
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        return monthStart.toISOString();
      default:
        return null;
    }
  }

  /**
   * Get order column for metric
   * @param {string} metric - Metric type
   * @returns {string} Column name
   */
  getOrderColumn(metric) {
    const mapping = {
      'win_rate': 'win_rate',
      'profit': 'total_profit',
      'trades': 'total_trades',
      'roi': 'roi',
      'streak': 'best_streak',
      'patterns': 'patterns_detected'
    };
    return mapping[metric] || 'win_rate';
  }

  /**
   * Get available metrics for leaderboard
   * @returns {Array} List of metrics
   */
  getMetrics() {
    return [
      { id: 'win_rate', label: 'Tỷ Lệ Thắng', icon: 'Target', suffix: '%' },
      { id: 'profit', label: 'Lợi Nhuận', icon: 'DollarSign', suffix: '$' },
      { id: 'trades', label: 'Số Giao Dịch', icon: 'BarChart3', suffix: '' },
      { id: 'roi', label: 'Lợi Nhuận ROI', icon: 'TrendingUp', suffix: '%' },
      { id: 'streak', label: 'Chuỗi Thắng', icon: 'Flame', suffix: '' },
      { id: 'patterns', label: 'Số Patterns', icon: 'Activity', suffix: '' }
    ];
  }

  /**
   * Get available time periods
   * @returns {Array} List of periods
   */
  getPeriods() {
    return [
      { id: 'all-time', label: 'Mọi Lúc' },
      { id: 'monthly', label: 'Tháng Này' },
      { id: 'weekly', label: 'Tuần Này' }
    ];
  }
}

export default new LeaderboardService();
