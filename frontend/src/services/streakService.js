/**
 * Streak Service (Web)
 * Ported from gem-mobile/src/services/streakService.js
 *
 * Enhanced streak tracking with gamification
 * Badges, levels, XP, and milestone tracking
 * Uses localStorage instead of cacheService
 */

import { supabase } from '../lib/supabaseClient';

// ============================================================
// GAMIFICATION CONSTANTS
// ============================================================

export const STREAK_TYPES = {
  CHAT: 'chat',
  RITUAL: 'ritual',
  MEDITATION: 'meditation',
  GRATITUDE: 'gratitude',
  AFFIRMATION: 'affirmation',
  DIVINATION: 'divination',
  GENERAL: 'general',
};

export const LEVELS = [
  { level: 1, name: 'Nguoi moi', minPoints: 0, maxPoints: 99, icon: 'seedling', color: '#90EE90' },
  { level: 2, name: 'Hoc vien', minPoints: 100, maxPoints: 299, icon: 'sprout', color: '#32CD32' },
  { level: 3, name: 'Thuc hanh vien', minPoints: 300, maxPoints: 599, icon: 'leaf', color: '#228B22' },
  { level: 4, name: 'Hanh gia', minPoints: 600, maxPoints: 999, icon: 'tree', color: '#006400' },
  { level: 5, name: 'Nha tu tap', minPoints: 1000, maxPoints: 1999, icon: 'mountain', color: '#4169E1' },
  { level: 6, name: 'Nguoi giac ngo', minPoints: 2000, maxPoints: 3999, icon: 'sunrise', color: '#FFD700' },
  { level: 7, name: 'Nguoi dan duong', minPoints: 4000, maxPoints: 7999, icon: 'sun', color: '#FF8C00' },
  { level: 8, name: 'Bac thay', minPoints: 8000, maxPoints: Infinity, icon: 'star', color: '#9400D3' },
];

export const BADGES = {
  streak_7: { id: 'streak_7', name: 'Tuan dau tien', description: '7 ngay lien tiep', icon: 'award', color: '#CD7F32', requirement: 7, xpReward: 50 },
  streak_14: { id: 'streak_14', name: '2 tuan kien tri', description: '14 ngay lien tiep', icon: 'award', color: '#C0C0C0', requirement: 14, xpReward: 100 },
  streak_21: { id: 'streak_21', name: '3 tuan chuyen hoa', description: '21 ngay - hinh thanh thoi quen', icon: 'award', color: '#FFD700', requirement: 21, xpReward: 150 },
  streak_30: { id: 'streak_30', name: 'Thang dau tien', description: '30 ngay khong gian doan', icon: 'trophy', color: '#FFD700', requirement: 30, xpReward: 200 },
  streak_60: { id: 'streak_60', name: '2 thang kien dinh', description: '60 ngay dong hanh', icon: 'trophy', color: '#E5E4E2', requirement: 60, xpReward: 350 },
  streak_90: { id: 'streak_90', name: 'Quy dau tien', description: '90 ngay - thoi quen ben vung', icon: 'crown', color: '#B9F2FF', requirement: 90, xpReward: 500 },
  streak_100: { id: 'streak_100', name: '100 ngay', description: 'Cot moc dang nho', icon: 'star', color: '#FF69B4', requirement: 100, xpReward: 600 },
  streak_365: { id: 'streak_365', name: 'Mot nam tron ven', description: '365 ngay - bac thay thoi quen', icon: 'crown', color: '#9400D3', requirement: 365, xpReward: 2000 },
};

export const XP_REWARDS = {
  daily_chat: 10,
  ritual_complete: 15,
  meditation_complete: 20,
  divination_use: 5,
  streak_maintain: 5,
  perfect_day: 25,
};

// ============================================================
// localStorage CACHE HELPERS
// ============================================================

const CACHE_DURATION = 5 * 60 * 1000; // 5 min

const getCached = (key, userId) => {
  try {
    const raw = localStorage.getItem(`streak_${key}_${userId}`);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_DURATION) return null;
    return data;
  } catch {
    return null;
  }
};

const setCache = (key, data, userId) => {
  try {
    localStorage.setItem(`streak_${key}_${userId}`, JSON.stringify({ data, ts: Date.now() }));
  } catch { /* ignore */ }
};

const invalidateCache = (key, userId) => {
  try {
    localStorage.removeItem(`streak_${key}_${userId}`);
  } catch { /* ignore */ }
};

class StreakService {
  /**
   * Get all streaks for user
   */
  async getUserStreaks(userId) {
    if (!userId) return [];

    try {
      const cached = getCached('STREAKS', userId);
      if (cached) return cached;

      const { data, error } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', userId)
        .order('current_streak', { ascending: false });

      if (error) throw error;

      if (data) {
        setCache('STREAKS', data, userId);
      }

      return data || [];
    } catch (error) {
      console.error('[StreakService] getUserStreaks error:', error);
      return [];
    }
  }

  /**
   * Get or create a specific streak
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

      invalidateCache('STREAKS', userId);
      return data;
    } catch (error) {
      console.error('[StreakService] createStreak error:', error);
      return null;
    }
  }

  /**
   * Record activity and update streak
   */
  async recordActivity(userId, streakType = STREAK_TYPES.GENERAL, ritualId = null) {
    if (!userId) return { success: false, error: 'No user ID' };

    try {
      let streak = await this.getOrCreateStreak(userId, streakType, ritualId);
      if (!streak) {
        return { success: false, error: 'Could not get/create streak' };
      }

      const today = new Date().toISOString().split('T')[0];
      const lastActivityDate = streak.last_completion_date;

      if (lastActivityDate === today) {
        return {
          success: true,
          alreadyRecorded: true,
          streak: streak.current_streak,
          message: 'Activity already recorded today',
        };
      }

      let newStreak = streak.current_streak;
      let streakBroken = false;
      let newStreakStartDate = streak.streak_start_date;

      if (lastActivityDate) {
        const lastDate = new Date(lastActivityDate);
        const todayDate = new Date(today);
        const diffDays = Math.floor((todayDate - lastDate) / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          newStreak = streak.current_streak + 1;
        } else if (diffDays > 1) {
          streakBroken = true;
          newStreak = 1;
          newStreakStartDate = today;
        }
      } else {
        newStreak = 1;
        newStreakStartDate = today;
      }

      const xpEarned = XP_REWARDS.streak_maintain + (streakBroken ? 0 : Math.min(newStreak, 10));
      const newTotalPoints = (streak.total_points || 0) + xpEarned;
      const newLevel = this.calculateLevel(newTotalPoints);

      const currentBadges = streak.badges_earned || [];
      const { newBadges, totalBadgeXP } = this.checkNewBadges(newStreak, currentBadges);
      const allBadges = [...currentBadges, ...newBadges.map(b => b.id)];

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

      invalidateCache('STREAKS', userId);
      invalidateCache('GAMIFICATION', userId);

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
      };
    } catch (error) {
      console.error('[StreakService] recordActivity error:', error);
      return { success: false, error: error.message };
    }
  }

  // ============================================================
  // LEVEL & BADGE SYSTEM
  // ============================================================

  calculateLevel(points) {
    for (let i = LEVELS.length - 1; i >= 0; i--) {
      if (points >= LEVELS[i].minPoints) {
        return LEVELS[i].level;
      }
    }
    return 1;
  }

  getLevelInfo(level) {
    return LEVELS.find(l => l.level === level) || LEVELS[0];
  }

  getNextLevelInfo(currentLevel, currentPoints) {
    const current = this.getLevelInfo(currentLevel);
    const next = LEVELS.find(l => l.level === currentLevel + 1);

    if (!next) {
      return {
        isMaxLevel: true,
        currentLevel,
        currentLevelName: current.name,
        message: 'Max level reached!',
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

  getAllBadges(earnedBadges = []) {
    return Object.values(BADGES).map(badge => ({
      ...badge,
      earned: earnedBadges.includes(badge.id),
    }));
  }

  // ============================================================
  // GAMIFICATION SUMMARY
  // ============================================================

  async getGamificationSummary(userId) {
    if (!userId) return null;

    try {
      const cached = getCached('GAMIFICATION', userId);
      if (cached) return cached;

      const streaks = await this.getUserStreaks(userId);

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
        currentStreak: mainStreak.current_streak || 0,
        longestStreak: mainStreak.longest_streak || 0,
        streakStartDate: mainStreak.streak_start_date,
        lastActivityDate: mainStreak.last_completion_date,
        level: currentLevel,
        levelName: levelInfo.name,
        levelIcon: levelInfo.icon,
        levelColor: levelInfo.color,
        totalPoints,
        ...nextLevelInfo,
        badges: allBadges,
        earnedBadgesCount: earnedBadges.length,
        totalBadges: Object.keys(BADGES).length,
        streaksByType: streaks.reduce((acc, s) => {
          acc[s.streak_type] = {
            current: s.current_streak,
            longest: s.longest_streak,
          };
          return acc;
        }, {}),
      };

      setCache('GAMIFICATION', summary, userId);
      return summary;
    } catch (error) {
      console.error('[StreakService] getGamificationSummary error:', error);
      return null;
    }
  }

  /**
   * Check if user's streak is at risk
   */
  async checkStreakRisk(userId, streakType = STREAK_TYPES.CHAT) {
    if (!userId) return null;

    try {
      const streak = await this.getOrCreateStreak(userId, streakType);
      if (!streak) return null;

      const today = new Date().toISOString().split('T')[0];
      const lastActivity = streak.last_completion_date;

      if (!lastActivity) {
        return { atRisk: false, currentStreak: 0, message: 'Start your first streak today!' };
      }

      if (lastActivity === today) {
        return { atRisk: false, currentStreak: streak.current_streak, completedToday: true };
      }

      const lastDate = new Date(lastActivity);
      const todayDate = new Date(today);
      const diffDays = Math.floor((todayDate - lastDate) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        const hour = new Date().getHours();
        const urgency = hour >= 20 ? 'high' : hour >= 18 ? 'medium' : 'low';
        return {
          atRisk: true,
          urgency,
          currentStreak: streak.current_streak,
          hoursLeft: 24 - hour,
        };
      }

      return {
        atRisk: false,
        streakBroken: true,
        previousStreak: streak.current_streak,
      };
    } catch (error) {
      console.error('[StreakService] checkStreakRisk error:', error);
      return null;
    }
  }

  // ============================================================
  // UTILITY METHODS
  // ============================================================

  getStreakTypes() { return STREAK_TYPES; }
  getAllLevels() { return LEVELS; }
  getBadge(badgeId) { return BADGES[badgeId] || null; }

  clearCache(userId) {
    if (userId) {
      invalidateCache('STREAKS', userId);
      invalidateCache('GAMIFICATION', userId);
    }
  }

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

      this.clearCache(userId);

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

export const streakService = new StreakService();
export default streakService;
