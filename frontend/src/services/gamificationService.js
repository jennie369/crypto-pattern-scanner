/**
 * Gamification Service (Web)
 * Ported from gem-mobile/src/services/gamificationService.js
 *
 * Vision Board Streak & Combo System
 * - Streak tracking (affirmation, habit, goal, action, combo)
 * - Daily completion tracking (4 categories)
 * - Combo multiplier system
 * - Achievement unlocking
 * - Habit grid data (GitHub-style)
 * - Wellness & social tracking
 */

import { supabase } from '../lib/supabaseClient';

// Achievement definitions
export const ACHIEVEMENTS = {
  // Streak milestones
  streak_3: { id: 'streak_3', type: 'streak', title: 'Khoi dau tot', description: '3 ngay lien tiep', icon: 'flame', points: 50, threshold: 3 },
  streak_7: { id: 'streak_7', type: 'streak', title: 'Tuan le vang', description: '7 ngay lien tiep', icon: 'star', points: 100, threshold: 7 },
  streak_14: { id: 'streak_14', type: 'streak', title: 'Hai tuan kien tri', description: '14 ngay lien tiep', icon: 'award', points: 200, threshold: 14 },
  streak_30: { id: 'streak_30', type: 'streak', title: 'Chien binh thang', description: '30 ngay lien tiep', icon: 'trophy', points: 500, threshold: 30 },
  streak_100: { id: 'streak_100', type: 'streak', title: 'Bac thay ky luat', description: '100 ngay lien tiep', icon: 'crown', points: 2000, threshold: 100 },

  // Combo achievements
  first_combo: { id: 'first_combo', type: 'combo', title: 'Combo dau tien', description: 'Hoan thanh ca 3 muc trong ngay', icon: 'zap', points: 50 },
  combo_streak_3: { id: 'combo_streak_3', type: 'combo', title: 'Combo 3 ngay', description: '3 ngay full combo lien tiep', icon: 'flame', points: 150, threshold: 3 },
  combo_streak_7: { id: 'combo_streak_7', type: 'combo', title: 'Combo tuan', description: '7 ngay full combo lien tiep', icon: 'star', points: 350, threshold: 7 },

  // Action achievements
  first_action: { id: 'first_action', type: 'action', title: 'Hanh dong dau tien', description: 'Hoan thanh action plan dau tien', icon: 'check-circle', points: 30 },
  action_streak_3: { id: 'action_streak_3', type: 'action', title: 'Nguoi hanh dong', description: '3 ngay hoan thanh action lien tiep', icon: 'target', points: 75, threshold: 3 },
  action_streak_7: { id: 'action_streak_7', type: 'action', title: 'Chien binh hanh dong', description: '7 ngay hoan thanh action lien tiep', icon: 'rocket', points: 175, threshold: 7 },
  action_streak_14: { id: 'action_streak_14', type: 'action', title: 'Bac thay hanh dong', description: '14 ngay hoan thanh action lien tiep', icon: 'crown', points: 400, threshold: 14 },
  action_master: { id: 'action_master', type: 'action', title: 'Action Master', description: 'Hoan thanh 100 action items', icon: 'trophy', points: 500, threshold: 100 },

  // Full combo (4 categories)
  full_combo_4: { id: 'full_combo_4', type: 'combo', title: 'Perfect Day', description: 'Hoan thanh ca 4 muc trong ngay', icon: 'sparkles', points: 100 },

  // Trading
  mindset_first: { id: 'mindset_first', type: 'trading', title: 'Nha giao dich co y thuc', description: 'Hoan thanh danh gia tam the dau tien', icon: 'brain', points: 50 },
  mindset_streak_3: { id: 'mindset_streak_3', type: 'trading', title: 'Trader ky luat', description: '3 ngay check mindset lien tiep', icon: 'target', points: 100, threshold: 3 },
  mindset_streak_7: { id: 'mindset_streak_7', type: 'trading', title: 'Bac thay ky luat trading', description: '7 ngay check mindset lien tiep', icon: 'award', points: 200, threshold: 7 },
  mindset_high_score: { id: 'mindset_high_score', type: 'trading', title: 'Tam the hoan hao', description: 'Dat diem mindset 90+', icon: 'star', points: 100 },
  mindset_compliance: { id: 'mindset_compliance', type: 'trading', title: 'Tuan thu hoan hao', description: 'Khong trade khi diem duoi 60 trong 7 ngay', icon: 'shield', points: 300 },
  paper_trade_first: { id: 'paper_trade_first', type: 'trading', title: 'Trader khoi dau', description: 'Hoan thanh paper trade dau tien', icon: 'trending-up', points: 30 },
  paper_trade_10: { id: 'paper_trade_10', type: 'trading', title: 'Trader tich cuc', description: 'Hoan thanh 10 paper trades', icon: 'activity', points: 100, threshold: 10 },
  paper_trade_win_streak_3: { id: 'paper_trade_win_streak_3', type: 'trading', title: 'Streak thang', description: '3 paper trades thang lien tiep', icon: 'flame', points: 150, threshold: 3 },
  paper_trade_win_rate_60: { id: 'paper_trade_win_rate_60', type: 'trading', title: 'Win Rate 60%', description: 'Dat win rate 60% voi it nhat 10 trades', icon: 'trophy', points: 250 },

  // Wellness
  tarot_first: { id: 'tarot_first', type: 'wellness', title: 'Nha tien tri', description: 'Rut bai Tarot lan dau tien', icon: 'sparkles', points: 30 },
  tarot_streak_7: { id: 'tarot_streak_7', type: 'wellness', title: 'Tarot Master', description: '7 ngay rut Tarot lien tiep', icon: 'star', points: 150, threshold: 7 },
  tarot_streak_30: { id: 'tarot_streak_30', type: 'wellness', title: 'Bac thay Tarot', description: '30 ngay rut Tarot lien tiep', icon: 'crown', points: 500, threshold: 30 },
  iching_first: { id: 'iching_first', type: 'wellness', title: 'Bac thay Kinh Dich', description: 'Gieo que Kinh Dich lan dau tien', icon: 'book-open', points: 30 },
  iching_streak_7: { id: 'iching_streak_7', type: 'wellness', title: 'Hien triet', description: '7 ngay gieo que lien tiep', icon: 'scroll', points: 150, threshold: 7 },
  iching_streak_30: { id: 'iching_streak_30', type: 'wellness', title: 'Dao si Kinh Dich', description: '30 ngay gieo que lien tiep', icon: 'crown', points: 500, threshold: 30 },
  crystal_first: { id: 'crystal_first', type: 'wellness', title: 'Nguoi yeu da', description: 'Mua san pham da quy dau tien', icon: 'gem', points: 50 },
  crystal_collector: { id: 'crystal_collector', type: 'wellness', title: 'Suu tap gia', description: 'Suu tap 5 loai da quy', icon: 'package', points: 200, threshold: 5 },
  meditation_streak_7: { id: 'meditation_streak_7', type: 'wellness', title: 'Tam tinh lang', description: '7 ngay thien dinh lien tiep', icon: 'moon', points: 150, threshold: 7 },
  holistic_master: { id: 'holistic_master', type: 'wellness', title: 'Bac thay toan dien', description: 'Hoan thanh ca Tarot 7 ngay va IChing 7 ngay', icon: 'infinity', points: 500 },

  // Social
  first_post: { id: 'first_post', type: 'social', title: 'Nguoi chia se', description: 'Dang bai viet dau tien', icon: 'message-square', points: 30 },
  post_10: { id: 'post_10', type: 'social', title: 'Nha sang tao noi dung', description: 'Dang 10 bai viet', icon: 'edit-3', points: 100, threshold: 10 },
  viral_post: { id: 'viral_post', type: 'social', title: 'Lan toa', description: 'Nhan 100+ likes cho mot bai viet', icon: 'zap', points: 200 },
  helpful_commenter: { id: 'helpful_commenter', type: 'social', title: 'Nguoi giup do', description: 'Binh luan 50 lan', icon: 'message-circle', points: 150, threshold: 50 },
  first_follower: { id: 'first_follower', type: 'social', title: 'Nguoi duoc theo doi', description: 'Co nguoi theo doi dau tien', icon: 'user-plus', points: 30 },
  influencer_100: { id: 'influencer_100', type: 'social', title: 'Nguoi anh huong', description: 'Co 100 nguoi theo doi', icon: 'users', points: 200, threshold: 100 },
  influencer_1000: { id: 'influencer_1000', type: 'social', title: 'Ngoi sao cong dong', description: 'Co 1000 nguoi theo doi', icon: 'star', points: 500, threshold: 1000 },
  gift_giver: { id: 'gift_giver', type: 'social', title: 'Nguoi hao phong', description: 'Tang 10 qua cho nguoi khac', icon: 'gift', points: 100, threshold: 10 },
  gift_giver_50: { id: 'gift_giver_50', type: 'social', title: 'Nha tai tro', description: 'Tang 50 qua cho nguoi khac', icon: 'heart', points: 300, threshold: 50 },
  referral_champion: { id: 'referral_champion', type: 'social', title: 'Dai su thuong hieu', description: 'Gioi thieu 10 nguoi ban moi', icon: 'share-2', points: 300, threshold: 10 },
};

export const TRACKING_CATEGORIES = ['affirmation', 'habit', 'goal', 'action'];

class GamificationService {
  async trackCompletion(userId, category) {
    if (!TRACKING_CATEGORIES.includes(category)) {
      return { success: false, error: `Invalid category: ${category}` };
    }
    try {
      const { data, error } = await supabase.rpc('track_daily_completion', {
        p_user_id: userId,
        p_category: category,
      });

      if (error) {
        if (error.code === '42883' || error.code === '42P01' || error.message?.includes('does not exist')) {
          return { success: true, combo_count: 0, multiplier: 1.0, newAchievements: [] };
        }
        throw error;
      }

      const achievements = await this.checkAchievements(userId, data, category);
      return { success: true, ...data, category, newAchievements: achievements };
    } catch (error) {
      console.error('[Gamification] Track completion error:', error);
      return { success: false, error: error.message };
    }
  }

  async trackActionCompletion(userId, widgetId = null) {
    return this.trackCompletion(userId, 'action');
  }

  async getDailyStatus(userId) {
    try {
      const { data, error } = await supabase.rpc('get_daily_completion_status', {
        p_user_id: userId,
      });

      if (error) {
        if (error.code === '42883' || error.code === '42P01' || error.message?.includes('does not exist')) {
          return { success: true, affirmationDone: false, habitDone: false, goalDone: false, actionDone: false, comboCount: 0, multiplier: 1.0 };
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
      return { success: false, affirmationDone: false, habitDone: false, goalDone: false, actionDone: false, comboCount: 0, multiplier: 1.0 };
    }
  }

  async getStreak(userId, streakType = 'combo') {
    try {
      const { data, error } = await supabase.rpc('get_user_streak', {
        p_user_id: userId,
        p_streak_type: streakType,
      });

      if (error) {
        if (error.code === '42883' || error.code === '42P01' || error.message?.includes('does not exist')) {
          return { success: true, currentStreak: 0, longestStreak: 0, totalCompletions: 0, lastCompletionDate: null };
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
      return { success: false, currentStreak: 0, longestStreak: 0, totalCompletions: 0, lastCompletionDate: null };
    }
  }

  async getAllStreaks(userId) {
    try {
      const { data: rpcData, error: rpcError } = await supabase.rpc('get_all_user_streaks', {
        p_user_id: userId,
      });

      if (!rpcError && rpcData) {
        const streaks = {};
        rpcData.forEach(streak => {
          streaks[streak.streak_type] = {
            currentStreak: streak.current_streak || 0,
            longestStreak: streak.longest_streak || 0,
            totalCompletions: streak.total_completions || 0,
            lastCompletionDate: streak.last_completion_date,
            freezeCount: streak.freeze_count || 0,
          };
        });
        return { success: true, streaks };
      }

      if (rpcError?.code === '42883') {
        const { data, error } = await supabase
          .from('user_streaks')
          .select('streak_type, current_streak, longest_streak, total_completions, last_completion_date, freeze_count')
          .eq('user_id', userId);

        if (error) {
          return { success: true, streaks: {} };
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
      }

      return { success: true, streaks: {} };
    } catch (error) {
      console.warn('[Gamification] Get all streaks exception:', error?.message);
      return { success: true, streaks: {} };
    }
  }

  async getHabitGridData(userId, days = 35) {
    try {
      const { data, error } = await supabase.rpc('get_habit_grid_data', {
        p_user_id: userId,
        p_days: days,
      });

      if (error) {
        if (error.code === '42883' || error.code === '42P01' || error.message?.includes('does not exist')) {
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

  async getAchievements(userId) {
    try {
      const { data, error } = await supabase
        .from('user_achievements')
        .select('achievement_id, unlocked_at, points_awarded')
        .eq('user_id', userId)
        .order('unlocked_at', { ascending: false });

      if (error) {
        if (error.code === '42P01' || error.message?.includes('does not exist')) {
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

  async checkAchievements(userId, completionData, category = null) {
    const newAchievements = [];

    try {
      if (completionData?.is_full_combo) {
        const awarded = await this.awardAchievement(userId, 'first_combo', 'combo', ACHIEVEMENTS.first_combo.points);
        if (awarded) newAchievements.push(ACHIEVEMENTS.first_combo);
      }

      if (completionData?.is_full_combo_4 || completionData?.combo_count >= 4) {
        const awarded = await this.awardAchievement(userId, 'full_combo_4', 'combo', ACHIEVEMENTS.full_combo_4.points);
        if (awarded) newAchievements.push(ACHIEVEMENTS.full_combo_4);
      }

      if (category === 'action') {
        const awarded = await this.awardAchievement(userId, 'first_action', 'action', ACHIEVEMENTS.first_action.points);
        if (awarded) newAchievements.push(ACHIEVEMENTS.first_action);

        const actionStreak = await this.getStreak(userId, 'action');
        for (const milestone of [3, 7, 14]) {
          if (actionStreak.currentStreak >= milestone) {
            const achievementId = `action_streak_${milestone}`;
            if (ACHIEVEMENTS[achievementId]) {
              const aw = await this.awardAchievement(userId, achievementId, 'action', ACHIEVEMENTS[achievementId].points, milestone);
              if (aw) newAchievements.push(ACHIEVEMENTS[achievementId]);
            }
          }
        }

        if (actionStreak.totalCompletions >= 100) {
          const aw = await this.awardAchievement(userId, 'action_master', 'action', ACHIEVEMENTS.action_master.points, 100);
          if (aw) newAchievements.push(ACHIEVEMENTS.action_master);
        }
      }

      const comboStreak = await this.getStreak(userId, 'combo');
      for (const milestone of [3, 7, 14, 30, 100]) {
        if (comboStreak.currentStreak >= milestone) {
          const achievementId = `streak_${milestone}`;
          if (ACHIEVEMENTS[achievementId]) {
            const aw = await this.awardAchievement(userId, achievementId, 'streak', ACHIEVEMENTS[achievementId].points, milestone);
            if (aw) newAchievements.push(ACHIEVEMENTS[achievementId]);
          }
        }
      }

      for (const milestone of [3, 7]) {
        if (comboStreak.currentStreak >= milestone) {
          const achievementId = `combo_streak_${milestone}`;
          if (ACHIEVEMENTS[achievementId]) {
            const aw = await this.awardAchievement(userId, achievementId, 'combo', ACHIEVEMENTS[achievementId].points, milestone);
            if (aw) newAchievements.push(ACHIEVEMENTS[achievementId]);
          }
        }
      }
    } catch (error) {
      console.error('[Gamification] Check achievements error:', error);
    }

    return newAchievements;
  }

  async awardAchievement(userId, achievementId, achievementType, points = 0, triggerValue = null) {
    try {
      const { data, error } = await supabase.rpc('award_achievement', {
        p_user_id: userId,
        p_achievement_id: achievementId,
        p_achievement_type: achievementType,
        p_points: points,
        p_trigger_value: triggerValue,
      });

      if (error) {
        if (error.code === '42883' || error.code === '42P01' || error.code === '42804' || error.message?.includes('does not exist')) {
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

  async useStreakFreeze(userId, streakType = 'combo') {
    try {
      const { data: streakData, error: fetchError } = await supabase
        .from('user_streaks')
        .select('freeze_count, last_freeze_date')
        .eq('user_id', userId)
        .eq('streak_type', streakType)
        .single();

      if (fetchError) {
        if (fetchError.code === '42703' || fetchError.message?.includes('does not exist')) {
          return { success: false, error: 'Freeze feature not ready' };
        }
        throw fetchError;
      }

      if (!streakData || (streakData.freeze_count || 0) <= 0) {
        return { success: false, error: 'No freezes available' };
      }

      const today = new Date().toISOString().split('T')[0];

      const { error: updateError } = await supabase
        .from('user_streaks')
        .update({
          freeze_count: (streakData.freeze_count || 0) - 1,
          last_freeze_date: today,
          last_completion_date: today,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .eq('streak_type', streakType);

      if (updateError) throw updateError;

      return { success: true, remainingFreezes: (streakData.freeze_count || 0) - 1 };
    } catch (error) {
      console.error('[Gamification] Use streak freeze error:', error);
      return { success: false, error: error.message };
    }
  }

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
        totalPoints: achievements.achievements.reduce((sum, a) => sum + (a.pointsAwarded || 0), 0),
      };
    } catch (error) {
      console.error('[Gamification] Get summary error:', error);
      return { success: false, daily: { comboCount: 0, multiplier: 1.0 }, streak: { currentStreak: 0 }, allStreaks: {}, habitGrid: [], achievements: [], totalPoints: 0 };
    }
  }

  // ============================================
  // WELLNESS TRACKING
  // ============================================

  async trackWellnessActivity(userId, activityType, metadata = {}) {
    const validTypes = ['tarot', 'iching', 'meditation'];
    if (!validTypes.includes(activityType)) {
      return { success: false, error: `Invalid activity type: ${activityType}` };
    }

    try {
      const { data, error } = await supabase.rpc('track_wellness_activity', {
        p_user_id: userId,
        p_activity_type: activityType,
        p_metadata: metadata,
      });

      if (error) {
        if (error.code === '42883' || error.code === '42P01' || error.message?.includes('does not exist')) {
          return { success: true, currentStreak: 0, newAchievements: [] };
        }
        throw error;
      }

      const achievements = await this.checkWellnessAchievements(userId, activityType, data);
      return { success: true, ...data, activityType, newAchievements: achievements };
    } catch (error) {
      console.error('[Gamification] Track wellness activity error:', error);
      return { success: false, error: error.message };
    }
  }

  async checkWellnessAchievements(userId, activityType, data) {
    const newAchievements = [];

    try {
      if (data?.is_first || data?.total_completions === 1) {
        const firstAchievementId = `${activityType}_first`;
        if (ACHIEVEMENTS[firstAchievementId]) {
          const awarded = await this.awardAchievement(userId, firstAchievementId, 'wellness', ACHIEVEMENTS[firstAchievementId].points);
          if (awarded) newAchievements.push(ACHIEVEMENTS[firstAchievementId]);
        }
      }

      const currentStreak = data?.current_streak || 0;
      for (const milestone of [7, 30]) {
        if (currentStreak >= milestone) {
          const achievementId = `${activityType}_streak_${milestone}`;
          if (ACHIEVEMENTS[achievementId]) {
            const awarded = await this.awardAchievement(userId, achievementId, 'wellness', ACHIEVEMENTS[achievementId].points, milestone);
            if (awarded) newAchievements.push(ACHIEVEMENTS[achievementId]);
          }
        }
      }

      if (activityType === 'tarot' || activityType === 'iching') {
        const wellnessStats = await this.getWellnessStats(userId);
        if (wellnessStats.success) {
          const tarotStreak = wellnessStats.stats?.tarot?.current_streak || 0;
          const ichingStreak = wellnessStats.stats?.iching?.current_streak || 0;
          if (tarotStreak >= 7 && ichingStreak >= 7) {
            const awarded = await this.awardAchievement(userId, 'holistic_master', 'wellness', ACHIEVEMENTS.holistic_master.points);
            if (awarded) newAchievements.push(ACHIEVEMENTS.holistic_master);
          }
        }
      }
    } catch (error) {
      console.error('[Gamification] Check wellness achievements error:', error);
    }

    return newAchievements;
  }

  async getWellnessStats(userId) {
    try {
      const { data, error } = await supabase.rpc('get_wellness_stats', {
        p_user_id: userId,
      });

      if (error) {
        if (error.code === '42883' || error.message?.includes('does not exist')) {
          return { success: true, stats: { tarot: { current_streak: 0, longest_streak: 0, total: 0 }, iching: { current_streak: 0, longest_streak: 0, total: 0 }, meditation: { current_streak: 0, longest_streak: 0, total: 0 }, crystals: 0 } };
        }
        throw error;
      }

      return { success: true, stats: data };
    } catch (error) {
      console.error('[Gamification] Get wellness stats error:', error);
      return { success: false, stats: null };
    }
  }

  async trackCrystalPurchase(userId, productInfo) {
    try {
      const { error: insertError } = await supabase.from('crystal_purchases').insert({
        user_id: userId,
        product_id: productInfo.productId,
        product_title: productInfo.title,
        order_id: productInfo.orderId,
      });

      if (insertError && !insertError.message?.includes('does not exist')) {
        throw insertError;
      }

      const { count } = await supabase
        .from('crystal_purchases')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      const crystalCount = count || 0;
      const newAchievements = [];

      if (crystalCount === 1) {
        const awarded = await this.awardAchievement(userId, 'crystal_first', 'wellness', ACHIEVEMENTS.crystal_first.points);
        if (awarded) newAchievements.push(ACHIEVEMENTS.crystal_first);
      }

      if (crystalCount >= 5) {
        const awarded = await this.awardAchievement(userId, 'crystal_collector', 'wellness', ACHIEVEMENTS.crystal_collector.points, 5);
        if (awarded) newAchievements.push(ACHIEVEMENTS.crystal_collector);
      }

      return { success: true, crystalCount, newAchievements };
    } catch (error) {
      console.error('[Gamification] Track crystal purchase error:', error);
      return { success: false, error: error.message };
    }
  }

  // ============================================
  // SOCIAL TRACKING
  // ============================================

  async trackSocialActivity(userId, activityType, newCount = null) {
    const validTypes = ['post', 'comment', 'like_given', 'like_received', 'gift_sent', 'gift_received', 'referral', 'follower', 'following', 'viral_post'];

    if (!validTypes.includes(activityType)) {
      return { success: false, error: `Invalid activity type: ${activityType}` };
    }

    try {
      const { data, error } = await supabase.rpc('update_social_stats', {
        p_user_id: userId,
        p_stat_type: activityType,
        p_increment: 1,
      });

      if (error) {
        if (error.code === '42883' || error.message?.includes('does not exist')) {
          return { success: true, newAchievements: [] };
        }
        throw error;
      }

      const stats = data?.stats || {};
      const achievements = await this.checkSocialAchievements(userId, activityType, stats);
      return { success: true, stats, newAchievements: achievements };
    } catch (error) {
      console.error('[Gamification] Track social activity error:', error);
      return { success: false, error: error.message };
    }
  }

  async checkSocialAchievements(userId, activityType, stats) {
    const newAchievements = [];

    try {
      if (activityType === 'post') {
        const postCount = stats.total_posts || 0;
        if (postCount === 1) {
          const aw = await this.awardAchievement(userId, 'first_post', 'social', ACHIEVEMENTS.first_post.points);
          if (aw) newAchievements.push(ACHIEVEMENTS.first_post);
        }
        if (postCount >= 10) {
          const aw = await this.awardAchievement(userId, 'post_10', 'social', ACHIEVEMENTS.post_10.points, 10);
          if (aw) newAchievements.push(ACHIEVEMENTS.post_10);
        }
      }

      if (activityType === 'comment') {
        if ((stats.total_comments || 0) >= 50) {
          const aw = await this.awardAchievement(userId, 'helpful_commenter', 'social', ACHIEVEMENTS.helpful_commenter.points, 50);
          if (aw) newAchievements.push(ACHIEVEMENTS.helpful_commenter);
        }
      }

      if (activityType === 'follower') {
        const fc = stats.follower_count || 0;
        if (fc === 1) {
          const aw = await this.awardAchievement(userId, 'first_follower', 'social', ACHIEVEMENTS.first_follower.points);
          if (aw) newAchievements.push(ACHIEVEMENTS.first_follower);
        }
        if (fc >= 100) {
          const aw = await this.awardAchievement(userId, 'influencer_100', 'social', ACHIEVEMENTS.influencer_100.points, 100);
          if (aw) newAchievements.push(ACHIEVEMENTS.influencer_100);
        }
        if (fc >= 1000) {
          const aw = await this.awardAchievement(userId, 'influencer_1000', 'social', ACHIEVEMENTS.influencer_1000.points, 1000);
          if (aw) newAchievements.push(ACHIEVEMENTS.influencer_1000);
        }
      }

      if (activityType === 'gift_sent') {
        const gc = stats.total_gifts_sent || 0;
        if (gc >= 10) {
          const aw = await this.awardAchievement(userId, 'gift_giver', 'social', ACHIEVEMENTS.gift_giver.points, 10);
          if (aw) newAchievements.push(ACHIEVEMENTS.gift_giver);
        }
        if (gc >= 50) {
          const aw = await this.awardAchievement(userId, 'gift_giver_50', 'social', ACHIEVEMENTS.gift_giver_50.points, 50);
          if (aw) newAchievements.push(ACHIEVEMENTS.gift_giver_50);
        }
      }

      if (activityType === 'viral_post' && (stats.viral_posts_count || 0) >= 1) {
        const aw = await this.awardAchievement(userId, 'viral_post', 'social', ACHIEVEMENTS.viral_post.points);
        if (aw) newAchievements.push(ACHIEVEMENTS.viral_post);
      }

      if (activityType === 'referral' && (stats.total_referrals || 0) >= 10) {
        const aw = await this.awardAchievement(userId, 'referral_champion', 'social', ACHIEVEMENTS.referral_champion.points, 10);
        if (aw) newAchievements.push(ACHIEVEMENTS.referral_champion);
      }
    } catch (error) {
      console.error('[Gamification] Check social achievements error:', error);
    }

    return newAchievements;
  }

  async getSocialStats(userId) {
    try {
      const { data, error } = await supabase.rpc('get_social_stats', { p_user_id: userId });

      if (error) {
        if (error.code === '42883' || error.message?.includes('does not exist')) {
          return { success: true, stats: { total_posts: 0, total_comments: 0, total_likes_given: 0, total_likes_received: 0, total_gifts_sent: 0, total_gifts_received: 0, total_referrals: 0, follower_count: 0, following_count: 0, viral_posts_count: 0 } };
        }
        throw error;
      }

      return { success: true, stats: data };
    } catch (error) {
      console.error('[Gamification] Get social stats error:', error);
      return { success: false, stats: null };
    }
  }

  async getFullGamificationProfile(userId) {
    try {
      const [summary, wellnessStats, socialStats] = await Promise.all([
        this.getGamificationSummary(userId),
        this.getWellnessStats(userId),
        this.getSocialStats(userId),
      ]);

      return { success: true, ...summary, wellness: wellnessStats.stats, social: socialStats.stats };
    } catch (error) {
      console.error('[Gamification] Get full profile error:', error);
      return { success: false, daily: { comboCount: 0, multiplier: 1.0 }, streak: { currentStreak: 0 }, allStreaks: {}, habitGrid: [], achievements: [], totalPoints: 0, wellness: null, social: null };
    }
  }
}

export default new GamificationService();
