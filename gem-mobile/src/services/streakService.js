/**
 * STREAK SERVICE
 * Enhanced streak tracking with gamification
 * Badges, levels, XP, and milestone tracking
 */

import { supabase } from './supabase';
import cacheService from './cacheService';

// ============================================================
// GAMIFICATION CONSTANTS
// ============================================================

// Streak types
const STREAK_TYPES = {
  CHAT: 'chat',
  RITUAL: 'ritual',
  MEDITATION: 'meditation',
  GRATITUDE: 'gratitude',
  AFFIRMATION: 'affirmation',
  DIVINATION: 'divination',
  GENERAL: 'general',
};

// Levels configuration
const LEVELS = [
  { level: 1, name: 'Người mới', minPoints: 0, maxPoints: 99, icon: 'seedling', color: '#90EE90' },
  { level: 2, name: 'Học viên', minPoints: 100, maxPoints: 299, icon: 'sprout', color: '#32CD32' },
  { level: 3, name: 'Thực hành viên', minPoints: 300, maxPoints: 599, icon: 'leaf', color: '#228B22' },
  { level: 4, name: 'Hành giả', minPoints: 600, maxPoints: 999, icon: 'tree', color: '#006400' },
  { level: 5, name: 'Nhà tu tập', minPoints: 1000, maxPoints: 1999, icon: 'mountain', color: '#4169E1' },
  { level: 6, name: 'Người giác ngộ', minPoints: 2000, maxPoints: 3999, icon: 'sunrise', color: '#FFD700' },
  { level: 7, name: 'Người dẫn đường', minPoints: 4000, maxPoints: 7999, icon: 'sun', color: '#FF8C00' },
  { level: 8, name: 'Bậc thầy', minPoints: 8000, maxPoints: Infinity, icon: 'star', color: '#9400D3' },
];

// Badges configuration
const BADGES = {
  streak_7: {
    id: 'streak_7',
    name: 'Tuần đầu tiên',
    description: '7 ngày liên tiếp',
    icon: 'award',
    color: '#CD7F32', // Bronze
    requirement: 7,
    xpReward: 50,
  },
  streak_14: {
    id: 'streak_14',
    name: '2 tuần kiên trì',
    description: '14 ngày liên tiếp',
    icon: 'award',
    color: '#C0C0C0', // Silver
    requirement: 14,
    xpReward: 100,
  },
  streak_21: {
    id: 'streak_21',
    name: '3 tuần chuyển hóa',
    description: '21 ngày - hình thành thói quen',
    icon: 'award',
    color: '#FFD700', // Gold
    requirement: 21,
    xpReward: 150,
  },
  streak_30: {
    id: 'streak_30',
    name: 'Tháng đầu tiên',
    description: '30 ngày không gián đoạn',
    icon: 'trophy',
    color: '#FFD700',
    requirement: 30,
    xpReward: 200,
  },
  streak_60: {
    id: 'streak_60',
    name: '2 tháng kiên định',
    description: '60 ngày đồng hành',
    icon: 'trophy',
    color: '#E5E4E2', // Platinum
    requirement: 60,
    xpReward: 350,
  },
  streak_90: {
    id: 'streak_90',
    name: 'Quý đầu tiên',
    description: '90 ngày - thói quen bền vững',
    icon: 'crown',
    color: '#B9F2FF', // Diamond
    requirement: 90,
    xpReward: 500,
  },
  streak_100: {
    id: 'streak_100',
    name: '100 ngày',
    description: 'Cột mốc đáng nhớ',
    icon: 'star',
    color: '#FF69B4',
    requirement: 100,
    xpReward: 600,
  },
  streak_365: {
    id: 'streak_365',
    name: 'Một năm trọn vẹn',
    description: '365 ngày - bậc thầy thói quen',
    icon: 'crown',
    color: '#9400D3',
    requirement: 365,
    xpReward: 2000,
  },
};

// XP rewards per activity
const XP_REWARDS = {
  daily_chat: 10,
  ritual_complete: 15,
  meditation_complete: 20,
  divination_use: 5,
  streak_maintain: 5,
  perfect_day: 25, // All rituals completed
};

class StreakService {
  // ============================================================
  // STREAK MANAGEMENT
  // ============================================================

  /**
   * Get all streaks for user
   * @param {string} userId - User ID
   * @returns {Promise<Array>} Array of streak records
   */
  async getUserStreaks(userId) {
    if (!userId) return [];

    try {
      // Check cache first
      const cached = await cacheService.getForUser('STREAKS', userId);
      if (cached) return cached;

      const { data, error } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', userId)
        .order('current_streak', { ascending: false });

      if (error) throw error;

      // Cache the results
      if (data) {
        await cacheService.setForUser('STREAKS', data, userId);
      }

      return data || [];
    } catch (error) {
      console.error('[StreakService] getUserStreaks error:', error);
      return [];
    }
  }

  /**
   * Get or create a specific streak
   * @param {string} userId - User ID
   * @param {string} streakType - Streak type
   * @param {string} ritualId - Optional ritual ID
   * @returns {Promise<Object|null>} Streak record
   */
  async getOrCreateStreak(userId, streakType = STREAK_TYPES.GENERAL, ritualId = null) {
    if (!userId) return null;

    try {
      let query = supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', userId)
        .eq('streak_type', streakType);

      if (ritualId) {
        query = query.eq('ritual_id', ritualId);
      } else {
        query = query.is('ritual_id', null);
      }

      const { data, error } = await query.single();

      if (error && error.code === 'PGRST116') {
        // Not found, create new streak
        return await this.createStreak(userId, streakType, ritualId);
      }

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('[StreakService] getOrCreateStreak error:', error);
      return null;
    }
  }

  /**
   * Create a new streak record
   * @param {string} userId - User ID
   * @param {string} streakType - Streak type
   * @param {string} ritualId - Optional ritual ID
   * @returns {Promise<Object|null>} Created streak
   */
  async createStreak(userId, streakType, ritualId = null) {
    if (!userId) return null;

    try {
      const streakData = {
        user_id: userId,
        streak_type: streakType,
        current_streak: 0,
        longest_streak: 0,
        total_points: 0,
        current_level: 1,
        badges_earned: [],
        streak_start_date: null,
        last_completion_date: null,
      };

      if (ritualId) {
        streakData.ritual_id = ritualId;
      }

      const { data, error } = await supabase
        .from('user_streaks')
        .insert(streakData)
        .select()
        .single();

      if (error) throw error;

      // Invalidate cache
      await cacheService.invalidate('STREAKS', userId);

      return data;
    } catch (error) {
      console.error('[StreakService] createStreak error:', error);
      return null;
    }
  }

  /**
   * Record activity and update streak
   * @param {string} userId - User ID
   * @param {string} streakType - Type of activity
   * @param {string} ritualId - Optional ritual ID
   * @returns {Promise<Object>} Update result with badge info
   */
  async recordActivity(userId, streakType = STREAK_TYPES.GENERAL, ritualId = null) {
    if (!userId) return { success: false, error: 'No user ID' };

    try {
      // Get or create streak
      let streak = await this.getOrCreateStreak(userId, streakType, ritualId);
      if (!streak) {
        return { success: false, error: 'Could not get/create streak' };
      }

      const today = new Date().toISOString().split('T')[0];
      const lastActivityDate = streak.last_completion_date;

      // Check if already recorded today
      if (lastActivityDate === today) {
        return {
          success: true,
          alreadyRecorded: true,
          streak: streak.current_streak,
          message: 'Đã ghi nhận hoạt động hôm nay',
        };
      }

      // Calculate new streak
      let newStreak = streak.current_streak;
      let streakBroken = false;
      let newStreakStartDate = streak.streak_start_date;

      if (lastActivityDate) {
        const lastDate = new Date(lastActivityDate);
        const todayDate = new Date(today);
        const diffDays = Math.floor((todayDate - lastDate) / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          // Consecutive day
          newStreak = streak.current_streak + 1;
        } else if (diffDays > 1) {
          // Streak broken
          streakBroken = true;
          newStreak = 1;
          newStreakStartDate = today;
        }
      } else {
        // First activity
        newStreak = 1;
        newStreakStartDate = today;
      }

      // Calculate XP
      const xpEarned = XP_REWARDS.streak_maintain + (streakBroken ? 0 : Math.min(newStreak, 10));
      const newTotalPoints = (streak.total_points || 0) + xpEarned;
      const newLevel = this.calculateLevel(newTotalPoints);

      // Check for new badges
      const currentBadges = streak.badges_earned || [];
      const { newBadges, totalBadgeXP } = this.checkNewBadges(newStreak, currentBadges);
      const allBadges = [...currentBadges, ...newBadges.map(b => b.id)];

      // Update streak record
      const { data, error } = await supabase
        .from('user_streaks')
        .update({
          current_streak: newStreak,
          longest_streak: Math.max(streak.longest_streak || 0, newStreak),
          last_completion_date: today,
          streak_start_date: newStreakStartDate,
          total_points: newTotalPoints + totalBadgeXP,
          current_level: newLevel,
          badges_earned: allBadges,
        })
        .eq('id', streak.id)
        .select()
        .single();

      if (error) throw error;

      // Invalidate cache
      await cacheService.invalidate('STREAKS', userId);
      await cacheService.invalidate('GAMIFICATION', userId);

      return {
        success: true,
        streak: newStreak,
        longestStreak: data.longest_streak,
        streakBroken,
        previousStreak: streak.current_streak,
        xpEarned: xpEarned + totalBadgeXP,
        totalPoints: data.total_points,
        level: newLevel,
        levelName: LEVELS[newLevel - 1]?.name || 'Unknown',
        newBadges,
        message: streakBroken
          ? 'Streak mới bắt đầu! Hãy duy trì nhé.'
          : newStreak > streak.current_streak
          ? `Tuyệt vời! Streak ${newStreak} ngày!`
          : 'Đã ghi nhận hoạt động!',
      };
    } catch (error) {
      console.error('[StreakService] recordActivity error:', error);
      return { success: false, error: error.message };
    }
  }

  // ============================================================
  // LEVEL & BADGE SYSTEM
  // ============================================================

  /**
   * Calculate level from total points
   * @param {number} points - Total XP points
   * @returns {number} Level (1-8)
   */
  calculateLevel(points) {
    for (let i = LEVELS.length - 1; i >= 0; i--) {
      if (points >= LEVELS[i].minPoints) {
        return LEVELS[i].level;
      }
    }
    return 1;
  }

  /**
   * Get level info
   * @param {number} level - Level number
   * @returns {Object} Level configuration
   */
  getLevelInfo(level) {
    return LEVELS.find(l => l.level === level) || LEVELS[0];
  }

  /**
   * Get next level progress info
   * @param {number} currentLevel - Current level
   * @param {number} currentPoints - Current points
   * @returns {Object} Progress to next level
   */
  getNextLevelInfo(currentLevel, currentPoints) {
    const current = this.getLevelInfo(currentLevel);
    const next = LEVELS.find(l => l.level === currentLevel + 1);

    if (!next) {
      return {
        isMaxLevel: true,
        currentLevel,
        currentLevelName: current.name,
        message: 'Bạn đã đạt cấp độ cao nhất!',
      };
    }

    const pointsToNext = next.minPoints - currentPoints;
    const progress = (currentPoints - current.minPoints) / (next.minPoints - current.minPoints);

    return {
      isMaxLevel: false,
      currentLevel,
      currentLevelName: current.name,
      nextLevel: next.level,
      nextLevelName: next.name,
      currentPoints,
      pointsToNext,
      progress: Math.min(1, Math.max(0, progress)),
      progressPercent: Math.round(progress * 100),
    };
  }

  /**
   * Check for new badges earned
   * @param {number} currentStreak - Current streak count
   * @param {Array} earnedBadges - Already earned badge IDs
   * @returns {Object} New badges and total XP
   */
  checkNewBadges(currentStreak, earnedBadges = []) {
    const newBadges = [];
    let totalBadgeXP = 0;

    for (const [badgeId, badge] of Object.entries(BADGES)) {
      if (!earnedBadges.includes(badgeId) && currentStreak >= badge.requirement) {
        newBadges.push(badge);
        totalBadgeXP += badge.xpReward;
      }
    }

    return { newBadges, totalBadgeXP };
  }

  /**
   * Get all badges with earned status
   * @param {Array} earnedBadges - Array of earned badge IDs
   * @returns {Array} All badges with earned status
   */
  getAllBadges(earnedBadges = []) {
    return Object.values(BADGES).map(badge => ({
      ...badge,
      earned: earnedBadges.includes(badge.id),
    }));
  }

  // ============================================================
  // GAMIFICATION SUMMARY
  // ============================================================

  /**
   * Get full gamification summary for user
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Gamification summary
   */
  async getGamificationSummary(userId) {
    if (!userId) return null;

    try {
      // Check cache first
      const cached = await cacheService.getForUser('GAMIFICATION', userId);
      if (cached) return cached;

      const streaks = await this.getUserStreaks(userId);

      // Find main streak (chat or general)
      const mainStreak = streaks.find(s => s.streak_type === STREAK_TYPES.CHAT)
        || streaks.find(s => s.streak_type === STREAK_TYPES.GENERAL)
        || { current_streak: 0, longest_streak: 0, total_points: 0, current_level: 1, badges_earned: [] };

      const currentLevel = mainStreak.current_level || 1;
      const totalPoints = mainStreak.total_points || 0;
      const earnedBadges = mainStreak.badges_earned || [];

      const levelInfo = this.getLevelInfo(currentLevel);
      const nextLevelInfo = this.getNextLevelInfo(currentLevel, totalPoints);
      const allBadges = this.getAllBadges(earnedBadges);

      const summary = {
        // Streak info
        currentStreak: mainStreak.current_streak || 0,
        longestStreak: mainStreak.longest_streak || 0,
        streakStartDate: mainStreak.streak_start_date,
        lastActivityDate: mainStreak.last_completion_date,

        // Level info
        level: currentLevel,
        levelName: levelInfo.name,
        levelIcon: levelInfo.icon,
        levelColor: levelInfo.color,

        // Points & progress
        totalPoints,
        ...nextLevelInfo,

        // Badges
        badges: allBadges,
        earnedBadgesCount: earnedBadges.length,
        totalBadges: Object.keys(BADGES).length,

        // All streaks by type
        streaksByType: streaks.reduce((acc, s) => {
          acc[s.streak_type] = {
            current: s.current_streak,
            longest: s.longest_streak,
          };
          return acc;
        }, {}),
      };

      // Cache the summary
      await cacheService.setForUser('GAMIFICATION', summary, userId);

      return summary;
    } catch (error) {
      console.error('[StreakService] getGamificationSummary error:', error);
      return null;
    }
  }

  /**
   * Check if user's streak is at risk
   * @param {string} userId - User ID
   * @param {string} streakType - Streak type to check
   * @returns {Promise<Object>} Risk assessment
   */
  async checkStreakRisk(userId, streakType = STREAK_TYPES.CHAT) {
    if (!userId) return null;

    try {
      const streak = await this.getOrCreateStreak(userId, streakType);
      if (!streak) return null;

      const today = new Date().toISOString().split('T')[0];
      const lastActivity = streak.last_completion_date;

      if (!lastActivity) {
        return {
          atRisk: false,
          currentStreak: 0,
          message: 'Bắt đầu streak đầu tiên của bạn ngay hôm nay!',
        };
      }

      if (lastActivity === today) {
        return {
          atRisk: false,
          currentStreak: streak.current_streak,
          completedToday: true,
          message: 'Tuyệt vời! Bạn đã duy trì streak hôm nay.',
        };
      }

      const lastDate = new Date(lastActivity);
      const todayDate = new Date(today);
      const diffDays = Math.floor((todayDate - lastDate) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        // Still in window, but at risk
        const hour = new Date().getHours();
        const urgency = hour >= 20 ? 'high' : hour >= 18 ? 'medium' : 'low';

        return {
          atRisk: true,
          urgency,
          currentStreak: streak.current_streak,
          hoursLeft: 24 - hour,
          message: urgency === 'high'
            ? `Streak ${streak.current_streak} ngày sắp mất! Hành động ngay!`
            : `Đừng quên duy trì streak ${streak.current_streak} ngày hôm nay nhé!`,
        };
      }

      // Streak already broken
      return {
        atRisk: false,
        streakBroken: true,
        previousStreak: streak.current_streak,
        message: `Streak trước đó là ${streak.current_streak} ngày. Bắt đầu lại nhé!`,
      };
    } catch (error) {
      console.error('[StreakService] checkStreakRisk error:', error);
      return null;
    }
  }

  // ============================================================
  // UTILITY METHODS
  // ============================================================

  /**
   * Get streak types
   * @returns {Object} Streak types enum
   */
  getStreakTypes() {
    return STREAK_TYPES;
  }

  /**
   * Get all levels
   * @returns {Array} Levels configuration
   */
  getAllLevels() {
    return LEVELS;
  }

  /**
   * Get badge by ID
   * @param {string} badgeId - Badge ID
   * @returns {Object|null} Badge configuration
   */
  getBadge(badgeId) {
    return BADGES[badgeId] || null;
  }

  /**
   * Clear user's streak cache
   * @param {string} userId - User ID
   */
  async clearCache(userId) {
    if (userId) {
      await cacheService.invalidate('STREAKS', userId);
      await cacheService.invalidate('GAMIFICATION', userId);
    }
  }

  /**
   * Award bonus XP
   * @param {string} userId - User ID
   * @param {number} xp - XP amount
   * @param {string} reason - Reason for bonus
   * @returns {Promise<Object>} Update result
   */
  async awardBonusXP(userId, xp, reason = 'bonus') {
    if (!userId || !xp) return { success: false };

    try {
      const streak = await this.getOrCreateStreak(userId, STREAK_TYPES.CHAT);
      if (!streak) return { success: false };

      const newPoints = (streak.total_points || 0) + xp;
      const newLevel = this.calculateLevel(newPoints);

      const { error } = await supabase
        .from('user_streaks')
        .update({
          total_points: newPoints,
          current_level: newLevel,
        })
        .eq('id', streak.id);

      if (error) throw error;

      // Clear cache
      await this.clearCache(userId);

      return {
        success: true,
        xpAwarded: xp,
        reason,
        newTotal: newPoints,
        newLevel,
      };
    } catch (error) {
      console.error('[StreakService] awardBonusXP error:', error);
      return { success: false, error: error.message };
    }
  }
}

// Export singleton instance
export const streakService = new StreakService();
export default streakService;

// Export constants
export { STREAK_TYPES, LEVELS, BADGES, XP_REWARDS };
