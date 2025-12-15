/**
 * Gamification Service
 * Vision Board Streak & Combo System
 *
 * Features:
 * - Streak tracking (affirmation, habit, goal, action, combo)
 * - Daily completion tracking (4 categories)
 * - Combo multiplier system (x1, x1.25, x1.5, x1.75, x2)
 * - Achievement unlocking
 * - Habit grid data (GitHub-style)
 * - Action/Action Plan tracking
 *
 * Updated: December 11, 2025 - Added 'action' category
 */

import { supabase } from './supabase';

// Achievement definitions
export const ACHIEVEMENTS = {
  // Streak milestones
  streak_3: {
    id: 'streak_3',
    type: 'streak',
    title: 'Khởi đầu tốt',
    description: '3 ngày liên tiếp',
    icon: 'flame',
    points: 50,
    threshold: 3,
  },
  streak_7: {
    id: 'streak_7',
    type: 'streak',
    title: 'Tuần lễ vàng',
    description: '7 ngày liên tiếp',
    icon: 'star',
    points: 100,
    threshold: 7,
  },
  streak_14: {
    id: 'streak_14',
    type: 'streak',
    title: 'Hai tuần kiên trì',
    description: '14 ngày liên tiếp',
    icon: 'award',
    points: 200,
    threshold: 14,
  },
  streak_30: {
    id: 'streak_30',
    type: 'streak',
    title: 'Chiến binh tháng',
    description: '30 ngày liên tiếp',
    icon: 'trophy',
    points: 500,
    threshold: 30,
  },
  streak_100: {
    id: 'streak_100',
    type: 'streak',
    title: 'Bậc thầy kỷ luật',
    description: '100 ngày liên tiếp',
    icon: 'crown',
    points: 2000,
    threshold: 100,
  },

  // Combo achievements
  first_combo: {
    id: 'first_combo',
    type: 'combo',
    title: 'Combo đầu tiên',
    description: 'Hoàn thành cả 3 mục trong ngày',
    icon: 'zap',
    points: 50,
  },
  combo_streak_3: {
    id: 'combo_streak_3',
    type: 'combo',
    title: 'Combo 3 ngày',
    description: '3 ngày full combo liên tiếp',
    icon: 'flame',
    points: 150,
    threshold: 3,
  },
  combo_streak_7: {
    id: 'combo_streak_7',
    type: 'combo',
    title: 'Combo tuần',
    description: '7 ngày full combo liên tiếp',
    icon: 'star',
    points: 350,
    threshold: 7,
  },

  // Action achievements
  first_action: {
    id: 'first_action',
    type: 'action',
    title: 'Hành động đầu tiên',
    description: 'Hoàn thành action plan đầu tiên',
    icon: 'check-circle',
    points: 30,
  },
  action_streak_3: {
    id: 'action_streak_3',
    type: 'action',
    title: 'Người hành động',
    description: '3 ngày hoàn thành action liên tiếp',
    icon: 'target',
    points: 75,
    threshold: 3,
  },
  action_streak_7: {
    id: 'action_streak_7',
    type: 'action',
    title: 'Chiến binh hành động',
    description: '7 ngày hoàn thành action liên tiếp',
    icon: 'rocket',
    points: 175,
    threshold: 7,
  },
  action_streak_14: {
    id: 'action_streak_14',
    type: 'action',
    title: 'Bậc thầy hành động',
    description: '14 ngày hoàn thành action liên tiếp',
    icon: 'crown',
    points: 400,
    threshold: 14,
  },
  action_master: {
    id: 'action_master',
    type: 'action',
    title: 'Action Master',
    description: 'Hoàn thành 100 action items',
    icon: 'trophy',
    points: 500,
    threshold: 100,
  },

  // Full combo (4 categories) achievement
  full_combo_4: {
    id: 'full_combo_4',
    type: 'combo',
    title: 'Perfect Day',
    description: 'Hoàn thành cả 4 mục trong ngày',
    icon: 'sparkles',
    points: 100,
  },

  // Trading Mindset Achievements
  mindset_first: {
    id: 'mindset_first',
    type: 'trading',
    title: 'Nhà giao dịch có ý thức',
    description: 'Hoàn thành đánh giá tâm thế đầu tiên',
    icon: 'brain',
    points: 50,
  },
  mindset_streak_3: {
    id: 'mindset_streak_3',
    type: 'trading',
    title: 'Trader kỷ luật',
    description: '3 ngày check mindset liên tiếp',
    icon: 'target',
    points: 100,
    threshold: 3,
  },
  mindset_streak_7: {
    id: 'mindset_streak_7',
    type: 'trading',
    title: 'Bậc thầy kỷ luật trading',
    description: '7 ngày check mindset liên tiếp',
    icon: 'award',
    points: 200,
    threshold: 7,
  },
  mindset_high_score: {
    id: 'mindset_high_score',
    type: 'trading',
    title: 'Tâm thế hoàn hảo',
    description: 'Đạt điểm mindset 90+',
    icon: 'star',
    points: 100,
  },
  mindset_compliance: {
    id: 'mindset_compliance',
    type: 'trading',
    title: 'Tuân thủ hoàn hảo',
    description: 'Không trade khi điểm dưới 60 trong 7 ngày',
    icon: 'shield',
    points: 300,
  },
  paper_trade_first: {
    id: 'paper_trade_first',
    type: 'trading',
    title: 'Trader khởi đầu',
    description: 'Hoàn thành paper trade đầu tiên',
    icon: 'trending-up',
    points: 30,
  },
  paper_trade_10: {
    id: 'paper_trade_10',
    type: 'trading',
    title: 'Trader tích cực',
    description: 'Hoàn thành 10 paper trades',
    icon: 'activity',
    points: 100,
    threshold: 10,
  },
  paper_trade_win_streak_3: {
    id: 'paper_trade_win_streak_3',
    type: 'trading',
    title: 'Streak thắng',
    description: '3 paper trades thắng liên tiếp',
    icon: 'flame',
    points: 150,
    threshold: 3,
  },
  paper_trade_win_rate_60: {
    id: 'paper_trade_win_rate_60',
    type: 'trading',
    title: 'Win Rate 60%',
    description: 'Đạt win rate 60% với ít nhất 10 trades',
    icon: 'trophy',
    points: 250,
  },

  // ============================================
  // WELLNESS ACHIEVEMENTS
  // ============================================
  tarot_first: {
    id: 'tarot_first',
    type: 'wellness',
    title: 'Nhà tiên tri',
    description: 'Rút bài Tarot lần đầu tiên',
    icon: 'sparkles',
    points: 30,
  },
  tarot_streak_7: {
    id: 'tarot_streak_7',
    type: 'wellness',
    title: 'Tarot Master',
    description: '7 ngày rút Tarot liên tiếp',
    icon: 'star',
    points: 150,
    threshold: 7,
  },
  tarot_streak_30: {
    id: 'tarot_streak_30',
    type: 'wellness',
    title: 'Bậc thầy Tarot',
    description: '30 ngày rút Tarot liên tiếp',
    icon: 'crown',
    points: 500,
    threshold: 30,
  },
  iching_first: {
    id: 'iching_first',
    type: 'wellness',
    title: 'Bậc thầy Kinh Dịch',
    description: 'Gieo quẻ Kinh Dịch lần đầu tiên',
    icon: 'book-open',
    points: 30,
  },
  iching_streak_7: {
    id: 'iching_streak_7',
    type: 'wellness',
    title: 'Hiền triết',
    description: '7 ngày gieo quẻ liên tiếp',
    icon: 'scroll',
    points: 150,
    threshold: 7,
  },
  iching_streak_30: {
    id: 'iching_streak_30',
    type: 'wellness',
    title: 'Đạo sĩ Kinh Dịch',
    description: '30 ngày gieo quẻ liên tiếp',
    icon: 'crown',
    points: 500,
    threshold: 30,
  },
  crystal_first: {
    id: 'crystal_first',
    type: 'wellness',
    title: 'Người yêu đá',
    description: 'Mua sản phẩm đá quý đầu tiên',
    icon: 'gem',
    points: 50,
  },
  crystal_collector: {
    id: 'crystal_collector',
    type: 'wellness',
    title: 'Sưu tập gia',
    description: 'Sưu tập 5 loại đá quý',
    icon: 'package',
    points: 200,
    threshold: 5,
  },
  meditation_streak_7: {
    id: 'meditation_streak_7',
    type: 'wellness',
    title: 'Tâm tĩnh lặng',
    description: '7 ngày thiền định liên tiếp',
    icon: 'moon',
    points: 150,
    threshold: 7,
  },
  holistic_master: {
    id: 'holistic_master',
    type: 'wellness',
    title: 'Bậc thầy toàn diện',
    description: 'Hoàn thành cả Tarot 7 ngày và IChing 7 ngày',
    icon: 'infinity',
    points: 500,
  },

  // ============================================
  // SOCIAL ACHIEVEMENTS
  // ============================================
  first_post: {
    id: 'first_post',
    type: 'social',
    title: 'Người chia sẻ',
    description: 'Đăng bài viết đầu tiên',
    icon: 'message-square',
    points: 30,
  },
  post_10: {
    id: 'post_10',
    type: 'social',
    title: 'Nhà sáng tạo nội dung',
    description: 'Đăng 10 bài viết',
    icon: 'edit-3',
    points: 100,
    threshold: 10,
  },
  viral_post: {
    id: 'viral_post',
    type: 'social',
    title: 'Lan tỏa',
    description: 'Nhận 100+ likes cho một bài viết',
    icon: 'zap',
    points: 200,
  },
  helpful_commenter: {
    id: 'helpful_commenter',
    type: 'social',
    title: 'Người giúp đỡ',
    description: 'Bình luận 50 lần',
    icon: 'message-circle',
    points: 150,
    threshold: 50,
  },
  first_follower: {
    id: 'first_follower',
    type: 'social',
    title: 'Người được theo dõi',
    description: 'Có người theo dõi đầu tiên',
    icon: 'user-plus',
    points: 30,
  },
  influencer_100: {
    id: 'influencer_100',
    type: 'social',
    title: 'Người ảnh hưởng',
    description: 'Có 100 người theo dõi',
    icon: 'users',
    points: 200,
    threshold: 100,
  },
  influencer_1000: {
    id: 'influencer_1000',
    type: 'social',
    title: 'Ngôi sao cộng đồng',
    description: 'Có 1000 người theo dõi',
    icon: 'star',
    points: 500,
    threshold: 1000,
  },
  gift_giver: {
    id: 'gift_giver',
    type: 'social',
    title: 'Người hào phóng',
    description: 'Tặng 10 quà cho người khác',
    icon: 'gift',
    points: 100,
    threshold: 10,
  },
  gift_giver_50: {
    id: 'gift_giver_50',
    type: 'social',
    title: 'Nhà tài trợ',
    description: 'Tặng 50 quà cho người khác',
    icon: 'heart',
    points: 300,
    threshold: 50,
  },
  referral_champion: {
    id: 'referral_champion',
    type: 'social',
    title: 'Đại sứ thương hiệu',
    description: 'Giới thiệu 10 người bạn mới',
    icon: 'share-2',
    points: 300,
    threshold: 10,
  },
};

// Valid tracking categories
export const TRACKING_CATEGORIES = ['affirmation', 'habit', 'goal', 'action'];

class GamificationService {
  /**
   * Track completion of a category
   * @param {string} userId - User ID
   * @param {string} category - 'affirmation' | 'habit' | 'goal' | 'action'
   * @returns {Promise<Object>} - Completion result with combo info
   */
  async trackCompletion(userId, category) {
    // Validate category
    if (!TRACKING_CATEGORIES.includes(category)) {
      console.warn(`[Gamification] Invalid category: ${category}`);
      return { success: false, error: `Invalid category: ${category}` };
    }
    try {
      const { data, error } = await supabase.rpc('track_daily_completion', {
        p_user_id: userId,
        p_category: category,
      });

      // Graceful degradation if function/tables don't exist
      if (error) {
        if (error.code === '42883' || error.code === '42P01' || error.message?.includes('does not exist')) {
          console.log('[Gamification] track_daily_completion not ready yet - skipping');
          return {
            success: true,
            combo_count: 0,
            multiplier: 1.0,
            newAchievements: [],
          };
        }
        throw error;
      }

      // Check for achievements (pass category for action-specific achievements)
      const achievements = await this.checkAchievements(userId, data, category);

      return {
        success: true,
        ...data,
        category,
        newAchievements: achievements,
      };
    } catch (error) {
      console.error('[Gamification] Track completion error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Track action/action_plan completion
   * Convenience method for action tracking
   * @param {string} userId - User ID
   * @param {string} widgetId - Widget ID (optional, for tracking specific widget)
   * @returns {Promise<Object>} - Completion result
   */
  async trackActionCompletion(userId, widgetId = null) {
    console.log('[Gamification] Tracking action completion for user:', userId, 'widget:', widgetId);
    return this.trackCompletion(userId, 'action');
  }

  /**
   * Get daily completion status
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - Today's completion status
   */
  async getDailyStatus(userId) {
    try {
      const { data, error } = await supabase.rpc('get_daily_completion_status', {
        p_user_id: userId,
      });

      // Graceful degradation if function doesn't exist
      if (error) {
        if (error.code === '42883' || error.code === '42P01' || error.message?.includes('does not exist')) {
          console.log('[Gamification] get_daily_completion_status not ready yet');
          return {
            success: true,
            affirmationDone: false,
            habitDone: false,
            goalDone: false,
            actionDone: false,
            comboCount: 0,
            multiplier: 1.0,
          };
        }
        throw error;
      }

      return {
        success: true,
        affirmationDone: data?.affirmation_done || false,
        habitDone: data?.habit_done || false,
        goalDone: data?.goal_done || false,
        actionDone: data?.action_done || false,
        comboCount: data?.combo_count || 0,
        multiplier: data?.multiplier || 1.0,
      };
    } catch (error) {
      console.error('[Gamification] Get daily status error:', error);
      return {
        success: false,
        affirmationDone: false,
        habitDone: false,
        goalDone: false,
        actionDone: false,
        comboCount: 0,
        multiplier: 1.0,
      };
    }
  }

  /**
   * Get user streak for a type
   * @param {string} userId - User ID
   * @param {string} streakType - 'affirmation' | 'habit' | 'goal' | 'action' | 'combo'
   * @returns {Promise<Object>} - Streak data
   */
  async getStreak(userId, streakType = 'combo') {
    try {
      const { data, error } = await supabase.rpc('get_user_streak', {
        p_user_id: userId,
        p_streak_type: streakType,
      });

      // Graceful degradation if function doesn't exist
      if (error) {
        if (error.code === '42883' || error.code === '42P01' || error.message?.includes('does not exist')) {
          console.log('[Gamification] get_user_streak not ready yet');
          return {
            success: true,
            currentStreak: 0,
            longestStreak: 0,
            totalCompletions: 0,
            lastCompletionDate: null,
          };
        }
        throw error;
      }

      const streakData = data?.[0] || {};
      return {
        success: true,
        currentStreak: streakData.current_streak || 0,
        longestStreak: streakData.longest_streak || 0,
        totalCompletions: streakData.total_completions || 0,
        lastCompletionDate: streakData.last_completion_date,
      };
    } catch (error) {
      console.error('[Gamification] Get streak error:', error);
      return {
        success: false,
        currentStreak: 0,
        longestStreak: 0,
        totalCompletions: 0,
        lastCompletionDate: null,
      };
    }
  }

  /**
   * Get all streaks for user
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - All streak types
   */
  async getAllStreaks(userId) {
    try {
      // Select only columns we know exist, freeze_count is optional
      const { data, error } = await supabase
        .from('user_streaks')
        .select('streak_type, current_streak, longest_streak, total_completions, last_completion_date')
        .eq('user_id', userId);

      // Graceful degradation if table/column doesn't exist
      if (error) {
        if (error.code === '42P01' || error.code === '42703' || error.message?.includes('does not exist')) {
          console.log('[Gamification] user_streaks table/columns not ready yet');
          return { success: true, streaks: {} };
        }
        throw error;
      }

      const streaks = {};
      (data || []).forEach(streak => {
        streaks[streak.streak_type] = {
          currentStreak: streak.current_streak || 0,
          longestStreak: streak.longest_streak || 0,
          totalCompletions: streak.total_completions || 0,
          lastCompletionDate: streak.last_completion_date,
          freezeCount: streak.freeze_count || 0,
        };
      });

      return { success: true, streaks };
    } catch (error) {
      console.error('[Gamification] Get all streaks error:', error);
      return { success: false, streaks: {} };
    }
  }

  /**
   * Get habit grid data (last N days)
   * @param {string} userId - User ID
   * @param {number} days - Number of days (default 35 for 5x7 grid)
   * @returns {Promise<Array>} - Grid data
   */
  async getHabitGridData(userId, days = 35) {
    try {
      const { data, error } = await supabase.rpc('get_habit_grid_data', {
        p_user_id: userId,
        p_days: days,
      });

      // Graceful degradation if function doesn't exist
      if (error) {
        if (error.code === '42883' || error.code === '42P01' || error.message?.includes('does not exist')) {
          console.log('[Gamification] get_habit_grid_data not ready yet');
          return { success: true, gridData: [] };
        }
        throw error;
      }

      return {
        success: true,
        gridData: (data || []).map(row => ({
          date: row.completion_date,
          affirmationDone: row.affirmation_done,
          habitDone: row.habit_done,
          goalDone: row.goal_done,
          actionDone: row.action_done || false,
          comboCount: row.combo_count,
        })),
      };
    } catch (error) {
      console.error('[Gamification] Get habit grid error:', error);
      return { success: false, gridData: [] };
    }
  }

  /**
   * Get user achievements
   * @param {string} userId - User ID
   * @returns {Promise<Array>} - Unlocked achievements
   */
  async getAchievements(userId) {
    try {
      const { data, error } = await supabase
        .from('user_achievements')
        .select('achievement_id, unlocked_at, points_awarded')
        .eq('user_id', userId)
        .order('unlocked_at', { ascending: false });

      // Graceful degradation if table doesn't exist yet
      if (error) {
        if (error.code === '42P01' || error.message?.includes('does not exist')) {
          console.log('[Gamification] user_achievements table not ready yet');
          return { success: true, achievements: [] };
        }
        throw error;
      }

      return {
        success: true,
        achievements: (data || []).map(a => ({
          ...ACHIEVEMENTS[a.achievement_id],
          unlockedAt: a.unlocked_at,
          pointsAwarded: a.points_awarded,
        })),
      };
    } catch (error) {
      console.error('[Gamification] Get achievements error:', error);
      return { success: false, achievements: [] };
    }
  }

  /**
   * Check and award achievements
   * @param {string} userId - User ID
   * @param {Object} completionData - Data from track_daily_completion
   * @param {string} category - Category that was just completed
   * @returns {Promise<Array>} - Newly unlocked achievements
   */
  async checkAchievements(userId, completionData, category = null) {
    const newAchievements = [];

    try {
      // Check for first combo (3 categories - legacy)
      if (completionData?.is_full_combo) {
        const awarded = await this.awardAchievement(
          userId,
          'first_combo',
          'combo',
          ACHIEVEMENTS.first_combo.points
        );
        if (awarded) {
          newAchievements.push(ACHIEVEMENTS.first_combo);
        }
      }

      // Check for full combo 4 (all 4 categories)
      if (completionData?.is_full_combo_4 || completionData?.combo_count >= 4) {
        const awarded = await this.awardAchievement(
          userId,
          'full_combo_4',
          'combo',
          ACHIEVEMENTS.full_combo_4.points
        );
        if (awarded) {
          newAchievements.push(ACHIEVEMENTS.full_combo_4);
        }
      }

      // Check for first action achievement
      if (category === 'action') {
        const awarded = await this.awardAchievement(
          userId,
          'first_action',
          'action',
          ACHIEVEMENTS.first_action.points
        );
        if (awarded) {
          newAchievements.push(ACHIEVEMENTS.first_action);
        }

        // Check action streak milestones
        const actionStreak = await this.getStreak(userId, 'action');
        const actionMilestones = [3, 7, 14];
        for (const milestone of actionMilestones) {
          if (actionStreak.currentStreak >= milestone) {
            const achievementId = `action_streak_${milestone}`;
            if (ACHIEVEMENTS[achievementId]) {
              const awarded = await this.awardAchievement(
                userId,
                achievementId,
                'action',
                ACHIEVEMENTS[achievementId].points,
                milestone
              );
              if (awarded) {
                newAchievements.push(ACHIEVEMENTS[achievementId]);
              }
            }
          }
        }

        // Check action master (100 total completions)
        if (actionStreak.totalCompletions >= 100) {
          const awarded = await this.awardAchievement(
            userId,
            'action_master',
            'action',
            ACHIEVEMENTS.action_master.points,
            100
          );
          if (awarded) {
            newAchievements.push(ACHIEVEMENTS.action_master);
          }
        }
      }

      // Check streak milestones for combo
      const comboStreak = await this.getStreak(userId, 'combo');
      const streakMilestones = [3, 7, 14, 30, 100];

      for (const milestone of streakMilestones) {
        if (comboStreak.currentStreak >= milestone) {
          const achievementId = `streak_${milestone}`;
          if (ACHIEVEMENTS[achievementId]) {
            const awarded = await this.awardAchievement(
              userId,
              achievementId,
              'streak',
              ACHIEVEMENTS[achievementId].points,
              milestone
            );
            if (awarded) {
              newAchievements.push(ACHIEVEMENTS[achievementId]);
            }
          }
        }
      }

      // Check combo streak milestones
      const comboMilestones = [3, 7];
      for (const milestone of comboMilestones) {
        if (comboStreak.currentStreak >= milestone) {
          const achievementId = `combo_streak_${milestone}`;
          if (ACHIEVEMENTS[achievementId]) {
            const awarded = await this.awardAchievement(
              userId,
              achievementId,
              'combo',
              ACHIEVEMENTS[achievementId].points,
              milestone
            );
            if (awarded) {
              newAchievements.push(ACHIEVEMENTS[achievementId]);
            }
          }
        }
      }
    } catch (error) {
      console.error('[Gamification] Check achievements error:', error);
    }

    return newAchievements;
  }

  /**
   * Award an achievement
   * @param {string} userId - User ID
   * @param {string} achievementId - Achievement ID
   * @param {string} achievementType - Type
   * @param {number} points - Points to award
   * @param {number} triggerValue - Optional trigger value
   * @returns {Promise<boolean>} - True if newly awarded
   */
  async awardAchievement(userId, achievementId, achievementType, points = 0, triggerValue = null) {
    try {
      // Try using the RPC function first
      const { data, error } = await supabase.rpc('award_achievement', {
        p_user_id: userId,
        p_achievement_id: achievementId,
        p_achievement_type: achievementType,
        p_points: points,
        p_trigger_value: triggerValue,
      });

      // Graceful degradation if function/table doesn't exist or type mismatch
      if (error) {
        // 42883 = function not found, 42P01 = table not found, 42804 = type mismatch
        if (error.code === '42883' || error.code === '42P01' || error.code === '42804' || error.message?.includes('does not exist')) {
          console.log('[Gamification] award_achievement not ready yet (code:', error.code, ')');
          return false;
        }
        throw error;
      }
      return data === true;
    } catch (error) {
      console.error('[Gamification] Award achievement error:', error);
      return false;
    }
  }

  /**
   * Use streak freeze
   * @param {string} userId - User ID
   * @param {string} streakType - Streak type to freeze
   * @returns {Promise<Object>} - Result
   */
  async useStreakFreeze(userId, streakType = 'combo') {
    try {
      // Check if user has freezes available
      const { data: streakData, error: fetchError } = await supabase
        .from('user_streaks')
        .select('freeze_count, last_freeze_date')
        .eq('user_id', userId)
        .eq('streak_type', streakType)
        .single();

      // Graceful degradation if column doesn't exist
      if (fetchError) {
        if (fetchError.code === '42703' || fetchError.message?.includes('does not exist')) {
          console.log('[Gamification] freeze_count column not ready yet');
          return { success: false, error: 'Tính năng freeze chưa sẵn sàng' };
        }
        throw fetchError;
      }

      if (!streakData || (streakData.freeze_count || 0) <= 0) {
        return { success: false, error: 'Không có freeze khả dụng' };
      }

      const today = new Date().toISOString().split('T')[0];

      // Update freeze
      const { error: updateError } = await supabase
        .from('user_streaks')
        .update({
          freeze_count: (streakData.freeze_count || 0) - 1,
          last_freeze_date: today,
          last_completion_date: today, // Maintain streak
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .eq('streak_type', streakType);

      if (updateError) throw updateError;

      return {
        success: true,
        remainingFreezes: (streakData.freeze_count || 0) - 1,
      };
    } catch (error) {
      console.error('[Gamification] Use streak freeze error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get gamification summary for dashboard
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - Summary data
   */
  async getGamificationSummary(userId) {
    try {
      const [dailyStatus, comboStreak, allStreaks, gridData, achievements] = await Promise.all([
        this.getDailyStatus(userId),
        this.getStreak(userId, 'combo'),
        this.getAllStreaks(userId),
        this.getHabitGridData(userId, 35),
        this.getAchievements(userId),
      ]);

      return {
        success: true,
        daily: dailyStatus,
        streak: comboStreak,
        allStreaks: allStreaks.streaks,
        habitGrid: gridData.gridData,
        achievements: achievements.achievements,
        totalPoints: achievements.achievements.reduce(
          (sum, a) => sum + (a.pointsAwarded || 0),
          0
        ),
      };
    } catch (error) {
      console.error('[Gamification] Get summary error:', error);
      return {
        success: false,
        daily: { comboCount: 0, multiplier: 1.0 },
        streak: { currentStreak: 0 },
        allStreaks: {},
        habitGrid: [],
        achievements: [],
        totalPoints: 0,
      };
    }
  }

  // ============================================
  // WELLNESS TRACKING
  // ============================================

  /**
   * Track wellness activity (tarot, iching, meditation)
   * @param {string} userId - User ID
   * @param {string} activityType - 'tarot' | 'iching' | 'meditation'
   * @param {Object} metadata - Optional metadata
   * @returns {Promise<Object>} - Result with achievements
   */
  async trackWellnessActivity(userId, activityType, metadata = {}) {
    const validTypes = ['tarot', 'iching', 'meditation'];
    if (!validTypes.includes(activityType)) {
      console.warn(`[Gamification] Invalid wellness activity: ${activityType}`);
      return { success: false, error: `Invalid activity type: ${activityType}` };
    }

    try {
      const { data, error } = await supabase.rpc('track_wellness_activity', {
        p_user_id: userId,
        p_activity_type: activityType,
        p_metadata: metadata,
      });

      // Graceful degradation
      if (error) {
        if (error.code === '42883' || error.code === '42P01' || error.message?.includes('does not exist')) {
          console.log('[Gamification] track_wellness_activity not ready yet');
          return { success: true, currentStreak: 0, newAchievements: [] };
        }
        throw error;
      }

      // Check for wellness achievements
      const achievements = await this.checkWellnessAchievements(userId, activityType, data);

      return {
        success: true,
        ...data,
        activityType,
        newAchievements: achievements,
      };
    } catch (error) {
      console.error('[Gamification] Track wellness activity error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Check and award wellness achievements
   * @param {string} userId - User ID
   * @param {string} activityType - Activity type
   * @param {Object} data - Activity data
   * @returns {Promise<Array>} - New achievements
   */
  async checkWellnessAchievements(userId, activityType, data) {
    const newAchievements = [];

    try {
      // Check first-time achievements
      if (data?.is_first || data?.total_completions === 1) {
        const firstAchievementId = `${activityType}_first`;
        if (ACHIEVEMENTS[firstAchievementId]) {
          const awarded = await this.awardAchievement(
            userId,
            firstAchievementId,
            'wellness',
            ACHIEVEMENTS[firstAchievementId].points
          );
          if (awarded) {
            newAchievements.push(ACHIEVEMENTS[firstAchievementId]);
          }
        }
      }

      // Check streak milestones
      const currentStreak = data?.current_streak || 0;
      const streakMilestones = [7, 30];

      for (const milestone of streakMilestones) {
        if (currentStreak >= milestone) {
          const achievementId = `${activityType}_streak_${milestone}`;
          if (ACHIEVEMENTS[achievementId]) {
            const awarded = await this.awardAchievement(
              userId,
              achievementId,
              'wellness',
              ACHIEVEMENTS[achievementId].points,
              milestone
            );
            if (awarded) {
              newAchievements.push(ACHIEVEMENTS[achievementId]);
            }
          }
        }
      }

      // Check holistic master (both tarot 7 and iching 7)
      if (activityType === 'tarot' || activityType === 'iching') {
        const wellnessStats = await this.getWellnessStats(userId);
        if (wellnessStats.success) {
          const tarotStreak = wellnessStats.stats?.tarot?.current_streak || 0;
          const ichingStreak = wellnessStats.stats?.iching?.current_streak || 0;

          if (tarotStreak >= 7 && ichingStreak >= 7) {
            const awarded = await this.awardAchievement(
              userId,
              'holistic_master',
              'wellness',
              ACHIEVEMENTS.holistic_master.points
            );
            if (awarded) {
              newAchievements.push(ACHIEVEMENTS.holistic_master);
            }
          }
        }
      }
    } catch (error) {
      console.error('[Gamification] Check wellness achievements error:', error);
    }

    return newAchievements;
  }

  /**
   * Get wellness stats for user
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - Wellness stats
   */
  async getWellnessStats(userId) {
    try {
      const { data, error } = await supabase.rpc('get_wellness_stats', {
        p_user_id: userId,
      });

      if (error) {
        if (error.code === '42883' || error.message?.includes('does not exist')) {
          console.log('[Gamification] get_wellness_stats not ready yet');
          return {
            success: true,
            stats: {
              tarot: { current_streak: 0, longest_streak: 0, total: 0 },
              iching: { current_streak: 0, longest_streak: 0, total: 0 },
              meditation: { current_streak: 0, longest_streak: 0, total: 0 },
              crystals: 0,
            },
          };
        }
        throw error;
      }

      return { success: true, stats: data };
    } catch (error) {
      console.error('[Gamification] Get wellness stats error:', error);
      return { success: false, stats: null };
    }
  }

  /**
   * Track crystal purchase
   * @param {string} userId - User ID
   * @param {Object} productInfo - Product info
   * @returns {Promise<Object>} - Result with achievements
   */
  async trackCrystalPurchase(userId, productInfo) {
    try {
      // Insert purchase record
      const { error: insertError } = await supabase.from('crystal_purchases').insert({
        user_id: userId,
        product_id: productInfo.productId,
        product_title: productInfo.title,
        order_id: productInfo.orderId,
      });

      if (insertError && !insertError.message?.includes('does not exist')) {
        throw insertError;
      }

      // Get crystal count
      const { count, error: countError } = await supabase
        .from('crystal_purchases')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      const crystalCount = count || 0;
      const newAchievements = [];

      // Check first crystal
      if (crystalCount === 1) {
        const awarded = await this.awardAchievement(
          userId,
          'crystal_first',
          'wellness',
          ACHIEVEMENTS.crystal_first.points
        );
        if (awarded) {
          newAchievements.push(ACHIEVEMENTS.crystal_first);
        }
      }

      // Check crystal collector (5+)
      if (crystalCount >= 5) {
        const awarded = await this.awardAchievement(
          userId,
          'crystal_collector',
          'wellness',
          ACHIEVEMENTS.crystal_collector.points,
          5
        );
        if (awarded) {
          newAchievements.push(ACHIEVEMENTS.crystal_collector);
        }
      }

      return {
        success: true,
        crystalCount,
        newAchievements,
      };
    } catch (error) {
      console.error('[Gamification] Track crystal purchase error:', error);
      return { success: false, error: error.message };
    }
  }

  // ============================================
  // SOCIAL TRACKING
  // ============================================

  /**
   * Track social activity
   * @param {string} userId - User ID
   * @param {string} activityType - 'post' | 'comment' | 'follower' | 'gift_sent' | 'referral'
   * @param {number} newCount - Current total count (optional)
   * @returns {Promise<Object>} - Result with achievements
   */
  async trackSocialActivity(userId, activityType, newCount = null) {
    const validTypes = ['post', 'comment', 'like_given', 'like_received', 'gift_sent', 'gift_received', 'referral', 'follower', 'following', 'viral_post'];

    if (!validTypes.includes(activityType)) {
      console.warn(`[Gamification] Invalid social activity: ${activityType}`);
      return { success: false, error: `Invalid activity type: ${activityType}` };
    }

    try {
      // Update social stats
      const { data, error } = await supabase.rpc('update_social_stats', {
        p_user_id: userId,
        p_stat_type: activityType,
        p_increment: 1,
      });

      if (error) {
        if (error.code === '42883' || error.message?.includes('does not exist')) {
          console.log('[Gamification] update_social_stats not ready yet');
          return { success: true, newAchievements: [] };
        }
        throw error;
      }

      // Check for social achievements
      const stats = data?.stats || {};
      const achievements = await this.checkSocialAchievements(userId, activityType, stats);

      return {
        success: true,
        stats,
        newAchievements: achievements,
      };
    } catch (error) {
      console.error('[Gamification] Track social activity error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Check and award social achievements
   * @param {string} userId - User ID
   * @param {string} activityType - Activity type
   * @param {Object} stats - Social stats
   * @returns {Promise<Array>} - New achievements
   */
  async checkSocialAchievements(userId, activityType, stats) {
    const newAchievements = [];

    try {
      // Post achievements
      if (activityType === 'post') {
        const postCount = stats.total_posts || 0;

        if (postCount === 1) {
          const awarded = await this.awardAchievement(userId, 'first_post', 'social', ACHIEVEMENTS.first_post.points);
          if (awarded) newAchievements.push(ACHIEVEMENTS.first_post);
        }

        if (postCount >= 10) {
          const awarded = await this.awardAchievement(userId, 'post_10', 'social', ACHIEVEMENTS.post_10.points, 10);
          if (awarded) newAchievements.push(ACHIEVEMENTS.post_10);
        }
      }

      // Comment achievements
      if (activityType === 'comment') {
        const commentCount = stats.total_comments || 0;

        if (commentCount >= 50) {
          const awarded = await this.awardAchievement(userId, 'helpful_commenter', 'social', ACHIEVEMENTS.helpful_commenter.points, 50);
          if (awarded) newAchievements.push(ACHIEVEMENTS.helpful_commenter);
        }
      }

      // Follower achievements
      if (activityType === 'follower') {
        const followerCount = stats.follower_count || 0;

        if (followerCount === 1) {
          const awarded = await this.awardAchievement(userId, 'first_follower', 'social', ACHIEVEMENTS.first_follower.points);
          if (awarded) newAchievements.push(ACHIEVEMENTS.first_follower);
        }

        if (followerCount >= 100) {
          const awarded = await this.awardAchievement(userId, 'influencer_100', 'social', ACHIEVEMENTS.influencer_100.points, 100);
          if (awarded) newAchievements.push(ACHIEVEMENTS.influencer_100);
        }

        if (followerCount >= 1000) {
          const awarded = await this.awardAchievement(userId, 'influencer_1000', 'social', ACHIEVEMENTS.influencer_1000.points, 1000);
          if (awarded) newAchievements.push(ACHIEVEMENTS.influencer_1000);
        }
      }

      // Gift achievements
      if (activityType === 'gift_sent') {
        const giftCount = stats.total_gifts_sent || 0;

        if (giftCount >= 10) {
          const awarded = await this.awardAchievement(userId, 'gift_giver', 'social', ACHIEVEMENTS.gift_giver.points, 10);
          if (awarded) newAchievements.push(ACHIEVEMENTS.gift_giver);
        }

        if (giftCount >= 50) {
          const awarded = await this.awardAchievement(userId, 'gift_giver_50', 'social', ACHIEVEMENTS.gift_giver_50.points, 50);
          if (awarded) newAchievements.push(ACHIEVEMENTS.gift_giver_50);
        }
      }

      // Viral post achievement
      if (activityType === 'viral_post') {
        const viralCount = stats.viral_posts_count || 0;

        if (viralCount >= 1) {
          const awarded = await this.awardAchievement(userId, 'viral_post', 'social', ACHIEVEMENTS.viral_post.points);
          if (awarded) newAchievements.push(ACHIEVEMENTS.viral_post);
        }
      }

      // Referral achievements
      if (activityType === 'referral') {
        const referralCount = stats.total_referrals || 0;

        if (referralCount >= 10) {
          const awarded = await this.awardAchievement(userId, 'referral_champion', 'social', ACHIEVEMENTS.referral_champion.points, 10);
          if (awarded) newAchievements.push(ACHIEVEMENTS.referral_champion);
        }
      }
    } catch (error) {
      console.error('[Gamification] Check social achievements error:', error);
    }

    return newAchievements;
  }

  /**
   * Get social stats for user
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - Social stats
   */
  async getSocialStats(userId) {
    try {
      const { data, error } = await supabase.rpc('get_social_stats', {
        p_user_id: userId,
      });

      if (error) {
        if (error.code === '42883' || error.message?.includes('does not exist')) {
          console.log('[Gamification] get_social_stats not ready yet');
          return {
            success: true,
            stats: {
              total_posts: 0,
              total_comments: 0,
              total_likes_given: 0,
              total_likes_received: 0,
              total_gifts_sent: 0,
              total_gifts_received: 0,
              total_referrals: 0,
              follower_count: 0,
              following_count: 0,
              viral_posts_count: 0,
            },
          };
        }
        throw error;
      }

      return { success: true, stats: data };
    } catch (error) {
      console.error('[Gamification] Get social stats error:', error);
      return { success: false, stats: null };
    }
  }

  /**
   * Get full gamification profile including wellness and social
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - Full profile
   */
  async getFullGamificationProfile(userId) {
    try {
      const [summary, wellnessStats, socialStats] = await Promise.all([
        this.getGamificationSummary(userId),
        this.getWellnessStats(userId),
        this.getSocialStats(userId),
      ]);

      return {
        success: true,
        ...summary,
        wellness: wellnessStats.stats,
        social: socialStats.stats,
      };
    } catch (error) {
      console.error('[Gamification] Get full profile error:', error);
      return {
        success: false,
        daily: { comboCount: 0, multiplier: 1.0 },
        streak: { currentStreak: 0 },
        allStreaks: {},
        habitGrid: [],
        achievements: [],
        totalPoints: 0,
        wellness: null,
        social: null,
      };
    }
  }
}

export default new GamificationService();
