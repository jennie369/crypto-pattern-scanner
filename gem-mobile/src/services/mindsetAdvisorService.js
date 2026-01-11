/**
 * Mindset Advisor Service
 * Trading Psychology Assessment & Recommendations
 *
 * 5-Layer USP System:
 * 1. Technical Analysis (Scanner patterns)
 * 2. Psychological Assessment (Emotional state)
 * 3. Spiritual Guidance (GemMaster divinations)
 * 4. Vision Board Integration (Goals & habits)
 * 5. Daily Rituals (Breathing exercises)
 *
 * Score Formula: Emotional(40%) + History(30%) + Discipline(30%)
 *
 * Created: December 13, 2025
 */

import { supabase } from './supabase';
import paperTradeService from './paperTradeService';
import gamificationService from './gamificationService';

// Score thresholds and recommendations
export const SCORE_THRESHOLDS = {
  READY: 80,      // 80-100: Green light
  PREPARE: 60,    // 60-79: Yellow, need preparation
  CAUTION: 40,    // 40-59: Orange, should wait
  STOP: 0,        // 0-39: Red, don't trade
};

// Score colors
export const SCORE_COLORS = {
  ready: '#3AF7A6',
  prepare: '#FFBD59',
  caution: '#FF9500',
  stop: '#FF6B6B',
};

// Mood scores
const MOOD_SCORES = {
  calm: 100,
  neutral: 70,
  anxious: 40,
  excited: 30, // Over-excitement is dangerous in trading
};

// Energy level scores (3 is optimal)
const ENERGY_SCORES = {
  1: 50,  // Too low
  2: 80,
  3: 100, // Optimal
  4: 80,
  5: 50,  // Too high/wired
};

// Sleep quality scores
const SLEEP_SCORES = {
  good: 100,
  average: 70,
  poor: 40,
};

// Trading-specific affirmations
export const TRADING_AFFIRMATIONS = [
  'Tôi tuân thủ kỷ luật trading',
  'Tôi chấp nhận cả thắng và thua',
  'Tôi không để cảm xúc điều khiển quyết định',
  'Mỗi trade là một bài học',
  'Tôi kiên nhẫn chờ đợi setup hoàn hảo',
  'Tôi bảo vệ vốn trước hết',
  'Tôi tin vào kế hoạch của mình',
  'Tôi bình tĩnh trước mọi biến động',
  'Tôi học hỏi từ mọi sai lầm',
  'Tôi là một trader có kỷ luật',
];

// Trading habits suggestions
export const TRADING_HABITS = [
  'Review trading journal mỗi sáng',
  'Đọc 1 affirmation trước khi trade',
  'Breathing 2 phút trước phiên',
  'Ghi chép sau mỗi trade',
  'Kiểm tra tin tức kinh tế',
  'Đặt stop loss trước khi vào lệnh',
];

// Trading goal templates
export const TRADING_GOAL_TEMPLATES = [
  {
    title: 'Tuân thủ Risk Management',
    description: 'Không vượt quá 2% risk mỗi lệnh',
    target: 30,
    unit: 'lệnh',
    lifeArea: 'finance',
  },
  {
    title: 'Kiểm tra Mindset trước trade',
    description: 'Luôn đánh giá tâm thế trước khi vào lệnh',
    target: 20,
    unit: 'lần',
    lifeArea: 'personal',
  },
  {
    title: 'Giữ win rate trên 50%',
    description: 'Duy trì tỷ lệ thắng hơn 50%',
    target: 50,
    unit: '%',
    lifeArea: 'finance',
  },
  {
    title: 'Hoàn thành trading journal',
    description: 'Ghi chép đầy đủ mỗi trade',
    target: 30,
    unit: 'ngày',
    lifeArea: 'personal',
  },
];

class MindsetAdvisorService {
  /**
   * Calculate complete mindset score
   * @param {string} userId - User ID
   * @param {Object} emotionalResponses - User's emotional assessment answers
   * @param {Object} context - Optional context (pattern info, source screen)
   * @returns {Promise<Object>} - Complete assessment result
   */
  async calculateMindsetScore(userId, emotionalResponses, context = {}) {
    try {
      // 1. Calculate emotional score (40%)
      const emotionalResult = this.calculateEmotionalScore(emotionalResponses);

      // 2. Calculate history score from paperTradeService (30%)
      const historyResult = await this.calculateHistoryScore(userId);

      // 3. Calculate discipline score from gamificationService (30%)
      const disciplineResult = await this.calculateDisciplineScore(userId);

      // 4. Calculate weighted total score
      const totalScore = Math.round(
        emotionalResult.score * 0.4 +
        historyResult.score * 0.3 +
        disciplineResult.score * 0.3
      );

      // 5. Generate recommendation
      const recommendation = this.generateRecommendation(totalScore);

      // 6. Build complete result
      const result = {
        totalScore,
        recommendation: recommendation.status,
        recommendationMessage: recommendation.message,
        suggestions: recommendation.suggestions,

        breakdown: {
          emotional: {
            score: emotionalResult.score,
            weight: 40,
            weighted: Math.round(emotionalResult.score * 0.4),
            details: emotionalResult.details,
          },
          history: {
            score: historyResult.score,
            weight: 30,
            weighted: Math.round(historyResult.score * 0.3),
            details: historyResult.details,
          },
          discipline: {
            score: disciplineResult.score,
            weight: 30,
            weighted: Math.round(disciplineResult.score * 0.3),
            details: disciplineResult.details,
          },
        },

        context: {
          patternSymbol: context.patternSymbol,
          patternType: context.patternType,
          patternTimeframe: context.patternTimeframe,
          sourceScreen: context.sourceScreen || 'paper_trade_modal',
        },

        timestamp: new Date().toISOString(),
      };

      return { success: true, ...result };
    } catch (error) {
      console.error('[MindsetAdvisor] Calculate score error:', error);
      return {
        success: false,
        error: error.message,
        totalScore: 50, // Default neutral score
        recommendation: 'prepare',
        recommendationMessage: 'Không thể đánh giá đầy đủ. Hãy cẩn thận.',
      };
    }
  }

  /**
   * Calculate emotional score from user responses
   * @param {Object} responses - Emotional assessment responses
   * @returns {Object} - Score and details
   */
  calculateEmotionalScore(responses) {
    const { mood, energyLevel, sleepQuality, fomoLevel, revengeTradingUrge } = responses;

    // Calculate individual scores
    const moodScore = MOOD_SCORES[mood] || 50;
    const energyScore = ENERGY_SCORES[energyLevel] || 50;
    const sleepScore = sleepQuality ? SLEEP_SCORES[sleepQuality] : 70;

    // FOMO and revenge trading are negative indicators (1=best, 5=worst)
    const fomoScore = fomoLevel ? (6 - fomoLevel) * 20 : 60; // 1->100, 5->20
    const revengeScore = revengeTradingUrge ? (6 - revengeTradingUrge) * 20 : 60;

    // Calculate weighted average
    // Mood: 30%, Energy: 15%, Sleep: 15%, FOMO: 20%, Revenge: 20%
    const totalScore = Math.round(
      moodScore * 0.30 +
      energyScore * 0.15 +
      sleepScore * 0.15 +
      fomoScore * 0.20 +
      revengeScore * 0.20
    );

    return {
      score: Math.min(100, Math.max(0, totalScore)),
      details: {
        mood: { value: mood, score: moodScore },
        energy: { value: energyLevel, score: energyScore },
        sleep: { value: sleepQuality, score: sleepScore },
        fomo: { value: fomoLevel, score: fomoScore },
        revenge: { value: revengeTradingUrge, score: revengeScore },
      },
    };
  }

  /**
   * Calculate history score from paper trading performance
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - Score and details
   */
  async calculateHistoryScore(userId) {
    try {
      // Initialize paper trade service with CLOUD SYNC
      await paperTradeService.init(userId);

      // Get stats and recent history
      const stats = paperTradeService.getStats(userId);
      const history = paperTradeService.getTradeHistory(userId, 5);

      // No trading history = neutral score
      if (stats.totalTrades === 0) {
        return {
          score: 70, // Neutral-positive for new traders
          details: {
            winRate: 0,
            last5Trades: 'N/A',
            streak: 'New Trader',
            message: 'Chưa có lịch sử giao dịch',
          },
        };
      }

      // Calculate win rate score
      // >60% = 100, 50-60% = 80, 40-50% = 60, <40% = 40
      let winRateScore;
      if (stats.winRate >= 60) winRateScore = 100;
      else if (stats.winRate >= 50) winRateScore = 80;
      else if (stats.winRate >= 40) winRateScore = 60;
      else winRateScore = 40;

      // Calculate last 5 trades score
      const last5 = history.slice(0, 5);
      const wins = last5.filter(t => t.result === 'WIN').length;
      const last5String = last5.map(t => t.result === 'WIN' ? 'W' : 'L').join('');

      let last5Score;
      if (wins >= 4) last5Score = 100;      // 4-5 wins
      else if (wins >= 3) last5Score = 80;  // 3 wins
      else if (wins >= 2) last5Score = 60;  // 2 wins
      else if (wins >= 1) last5Score = 40;  // 1 win
      else last5Score = 20;                  // 0 wins

      // Calculate streak score
      let streakScore = 60; // Neutral
      let streakMessage = '';

      // Check for win/loss streaks
      if (last5.length > 0) {
        const firstResult = last5[0]?.result;
        let streak = 0;

        for (const trade of last5) {
          if (trade.result === firstResult) streak++;
          else break;
        }

        if (firstResult === 'WIN') {
          streakScore = Math.min(100, 60 + streak * 10);
          streakMessage = `${streak} thắng liên tiếp`;
        } else {
          streakScore = Math.max(20, 60 - streak * 15);
          streakMessage = `${streak} thua liên tiếp`;
        }
      }

      // Calculate weighted total
      // Win rate: 50%, Last 5: 30%, Streak: 20%
      const totalScore = Math.round(
        winRateScore * 0.50 +
        last5Score * 0.30 +
        streakScore * 0.20
      );

      return {
        score: Math.min(100, Math.max(0, totalScore)),
        details: {
          winRate: Math.round(stats.winRate),
          winRateScore,
          last5Trades: last5String || 'N/A',
          last5Score,
          streak: streakMessage || 'Neutral',
          streakScore,
          totalTrades: stats.totalTrades,
          recentPnL: stats.totalPnL,
        },
      };
    } catch (error) {
      console.error('[MindsetAdvisor] History score error:', error);
      return {
        score: 60,
        details: {
          error: error.message,
          message: 'Không thể đọc lịch sử giao dịch',
        },
      };
    }
  }

  /**
   * Calculate discipline score from gamification data
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - Score and details
   */
  async calculateDisciplineScore(userId) {
    try {
      // Get daily status from gamification service
      const dailyStatus = await gamificationService.getDailyStatus(userId);

      // Count completed items (25 points each)
      let baseScore = 0;
      const completedItems = [];

      if (dailyStatus.affirmationDone) {
        baseScore += 25;
        completedItems.push('Affirmation');
      }
      if (dailyStatus.habitDone) {
        baseScore += 25;
        completedItems.push('Habit');
      }
      if (dailyStatus.goalDone) {
        baseScore += 25;
        completedItems.push('Goal');
      }
      if (dailyStatus.actionDone) {
        baseScore += 25;
        completedItems.push('Action');
      }

      // Combo bonus: +5 per combo count
      const comboBonus = Math.min(20, (dailyStatus.comboCount || 0) * 5);
      const totalScore = Math.min(100, baseScore + comboBonus);

      // Get streak info for extra context
      const streakData = await gamificationService.getStreak(userId, 'combo');

      return {
        score: totalScore,
        details: {
          affirmationDone: dailyStatus.affirmationDone,
          habitDone: dailyStatus.habitDone,
          goalDone: dailyStatus.goalDone,
          actionDone: dailyStatus.actionDone,
          comboCount: dailyStatus.comboCount || 0,
          comboBonus,
          completedItems,
          currentStreak: streakData.currentStreak || 0,
          multiplier: dailyStatus.multiplier || 1.0,
        },
      };
    } catch (error) {
      console.error('[MindsetAdvisor] Discipline score error:', error);
      return {
        score: 50, // Neutral fallback
        details: {
          error: error.message,
          message: 'Không thể đọc dữ liệu kỷ luật',
        },
      };
    }
  }

  /**
   * Generate recommendation based on total score
   * @param {number} score - Total mindset score (0-100)
   * @returns {Object} - Recommendation with status, message, and suggestions
   */
  generateRecommendation(score) {
    if (score >= SCORE_THRESHOLDS.READY) {
      return {
        status: 'ready',
        message: 'Tâm thế sẵn sàng giao dịch!',
        suggestions: [
          'Bạn đang ở trạng thái tốt nhất',
          'Hãy tuân thủ kế hoạch đã đặt ra',
          'Đặt stop loss trước khi vào lệnh',
        ],
        canProceed: true,
        showWarning: false,
      };
    }

    if (score >= SCORE_THRESHOLDS.PREPARE) {
      return {
        status: 'prepare',
        message: 'Cần chuẩn bị thêm trước khi giao dịch',
        suggestions: [
          'Làm bài tập breathing 2-4 phút',
          'Đọc lại affirmation trading',
          'Xem xét lại kế hoạch giao dịch',
          'Đảm bảo đã nghỉ ngơi đủ',
        ],
        canProceed: true,
        showWarning: true,
      };
    }

    if (score >= SCORE_THRESHOLDS.CAUTION) {
      return {
        status: 'caution',
        message: 'Nên chờ đợi - Tâm thế chưa phù hợp',
        suggestions: [
          'Hỏi GemMaster để được tư vấn',
          'Thực hành nghi lễ thở trước',
          'Đánh giá lại cảm xúc của bạn',
          'Có thể bỏ lỡ cơ hội này là tốt hơn',
        ],
        canProceed: false,
        showWarning: true,
      };
    }

    return {
      status: 'stop',
      message: 'Không nên giao dịch hôm nay',
      suggestions: [
        'Nghỉ ngơi và thư giãn',
        'Không giao dịch khi cảm xúc tiêu cực',
        'Tìm hoạt động khác để thư giãn',
        'Quay lại khi tâm thế tốt hơn',
      ],
      canProceed: false,
      showWarning: true,
    };
  }

  /**
   * Log assessment to database
   * @param {string} userId - User ID
   * @param {Object} assessment - Assessment result
   * @param {string} userDecision - User's decision after assessment
   * @returns {Promise<Object>}
   */
  async logAssessment(userId, assessment, userDecision = null) {
    try {
      const { data, error } = await supabase
        .from('trading_mindset_logs')
        .insert({
          user_id: userId,

          // Emotional
          emotional_score: assessment.breakdown?.emotional?.score || 0,
          mood: assessment.breakdown?.emotional?.details?.mood?.value || 'neutral',
          energy_level: assessment.breakdown?.emotional?.details?.energy?.value || 3,
          sleep_quality: assessment.breakdown?.emotional?.details?.sleep?.value || 'average',
          fomo_level: assessment.breakdown?.emotional?.details?.fomo?.value || 3,
          revenge_trading_urge: assessment.breakdown?.emotional?.details?.revenge?.value || 1,

          // History
          history_score: assessment.breakdown?.history?.score || 0,
          recent_win_rate: assessment.breakdown?.history?.details?.winRate || null,
          last_5_trades_result: assessment.breakdown?.history?.details?.last5Trades || null,
          current_trade_streak: 0,

          // Discipline
          discipline_score: assessment.breakdown?.discipline?.score || 0,
          affirmation_done: assessment.breakdown?.discipline?.details?.affirmationDone || false,
          habit_done: assessment.breakdown?.discipline?.details?.habitDone || false,
          goal_done: assessment.breakdown?.discipline?.details?.goalDone || false,
          action_done: assessment.breakdown?.discipline?.details?.actionDone || false,
          combo_count: assessment.breakdown?.discipline?.details?.comboCount || 0,

          // Final
          total_score: assessment.totalScore,
          recommendation: assessment.recommendation,
          recommendation_message: assessment.recommendationMessage,

          // Context
          pattern_symbol: assessment.context?.patternSymbol || null,
          pattern_type: assessment.context?.patternType || null,
          pattern_timeframe: assessment.context?.patternTimeframe || null,
          source_screen: assessment.context?.sourceScreen || 'paper_trade_modal',

          // Decision
          user_decision: userDecision,
          proceeded_to_trade: userDecision === 'proceed',
        })
        .select()
        .single();

      if (error) {
        // Graceful degradation if table doesn't exist yet
        if (error.code === '42P01' || error.message?.includes('does not exist')) {
          console.log('[MindsetAdvisor] trading_mindset_logs table not ready');
          return { success: true, logged: false };
        }
        throw error;
      }

      return { success: true, logged: true, id: data.id };
    } catch (error) {
      console.error('[MindsetAdvisor] Log assessment error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update user decision after assessment
   * @param {string} logId - Assessment log ID
   * @param {string} decision - User decision
   * @param {boolean} proceeded - Whether user proceeded to trade
   */
  async updateDecision(logId, decision, proceeded = false) {
    try {
      const { error } = await supabase
        .from('trading_mindset_logs')
        .update({
          user_decision: decision,
          proceeded_to_trade: proceeded,
        })
        .eq('id', logId);

      if (error && error.code !== '42P01') throw error;

      return { success: true };
    } catch (error) {
      console.error('[MindsetAdvisor] Update decision error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get assessment history
   * @param {string} userId - User ID
   * @param {number} limit - Number of records
   * @returns {Promise<Object>}
   */
  async getAssessmentHistory(userId, limit = 10) {
    try {
      const { data, error } = await supabase.rpc('get_mindset_history', {
        p_user_id: userId,
        p_limit: limit,
      });

      if (error) {
        if (error.code === '42883' || error.message?.includes('does not exist')) {
          return { success: true, history: [] };
        }
        throw error;
      }

      return { success: true, history: data || [] };
    } catch (error) {
      console.error('[MindsetAdvisor] Get history error:', error);
      return { success: false, history: [], error: error.message };
    }
  }

  /**
   * Get mindset statistics
   * @param {string} userId - User ID
   * @param {number} days - Number of days to analyze
   * @returns {Promise<Object>}
   */
  async getMindsetStats(userId, days = 30) {
    try {
      const { data, error } = await supabase.rpc('get_mindset_stats', {
        p_user_id: userId,
        p_days: days,
      });

      if (error) {
        if (error.code === '42883' || error.message?.includes('does not exist')) {
          return { success: true, stats: null };
        }
        throw error;
      }

      return { success: true, stats: data?.[0] || null };
    } catch (error) {
      console.error('[MindsetAdvisor] Get stats error:', error);
      return { success: false, stats: null, error: error.message };
    }
  }

  /**
   * Get today's latest mindset score (for quick widget)
   * @param {string} userId - User ID
   * @returns {Promise<Object>}
   */
  async getTodayScore(userId) {
    try {
      const { data, error } = await supabase.rpc('get_today_mindset_score', {
        p_user_id: userId,
      });

      if (error) {
        if (error.code === '42883' || error.message?.includes('does not exist')) {
          return { success: true, hasScore: false };
        }
        throw error;
      }

      if (data && data.length > 0) {
        return {
          success: true,
          hasScore: true,
          score: data[0].total_score,
          recommendation: data[0].recommendation,
          timestamp: data[0].created_at,
        };
      }

      return { success: true, hasScore: false };
    } catch (error) {
      console.error('[MindsetAdvisor] Get today score error:', error);
      return { success: false, hasScore: false, error: error.message };
    }
  }

  /**
   * Get random trading affirmation
   * @returns {string}
   */
  getRandomAffirmation() {
    return TRADING_AFFIRMATIONS[Math.floor(Math.random() * TRADING_AFFIRMATIONS.length)];
  }

  /**
   * Get score color
   * @param {number} score - Score value
   * @returns {string} - Color hex
   */
  getScoreColor(score) {
    if (score >= SCORE_THRESHOLDS.READY) return SCORE_COLORS.ready;
    if (score >= SCORE_THRESHOLDS.PREPARE) return SCORE_COLORS.prepare;
    if (score >= SCORE_THRESHOLDS.CAUTION) return SCORE_COLORS.caution;
    return SCORE_COLORS.stop;
  }

  /**
   * Get recommendation status from score
   * @param {number} score - Score value
   * @returns {string} - Status
   */
  getStatusFromScore(score) {
    if (score >= SCORE_THRESHOLDS.READY) return 'ready';
    if (score >= SCORE_THRESHOLDS.PREPARE) return 'prepare';
    if (score >= SCORE_THRESHOLDS.CAUTION) return 'caution';
    return 'stop';
  }
}

export default new MindsetAdvisorService();
