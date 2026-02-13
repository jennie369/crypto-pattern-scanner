/**
 * Gamification Service
 * Vision Board Streak & Combo System
 *
 * Features:
 * - Streak tracking (affirmation, habit, goal, combo)
 * - Daily completion tracking (3 categories)
 * - Combo multiplier system (x1, x1.5, x2)
 * - Achievement unlocking
 * - Habit grid data (GitHub-style)
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
};

class GamificationService {
  /**
   * Track completion of a category
   * @param {string} userId - User ID
   * @param {string} category - 'affirmation' | 'habit' | 'goal'
   * @returns {Promise<Object>} - Completion result with combo info
   */
  async trackCompletion(userId, category) {
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

      // Check for achievements
      const achievements = await this.checkAchievements(userId, data);

      return {
        success: true,
        ...data,
        newAchievements: achievements,
      };
    } catch (error) {
      console.error('[Gamification] Track completion error:', error);
      return { success: false, error: error.message };
    }
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
        comboCount: 0,
        multiplier: 1.0,
      };
    }
  }

  /**
   * Get user streak for a type
   * @param {string} userId - User ID
   * @param {string} streakType - 'affirmation' | 'habit' | 'goal' | 'combo'
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
   * @returns {Promise<Array>} - Newly unlocked achievements
   */
  async checkAchievements(userId, completionData) {
    const newAchievements = [];

    try {
      // Check for first combo
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
}

export default new GamificationService();
