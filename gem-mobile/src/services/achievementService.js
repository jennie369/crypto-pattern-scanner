/**
 * achievementService.js
 * Achievement tracking and management
 * Created: January 27, 2026
 */

import { supabase } from '../config/supabase';

const SERVICE_NAME = '[achievementService]';

// Achievement definitions
export const ACHIEVEMENTS = {
  // Ritual achievements
  first_ritual: {
    id: 'first_ritual',
    type: 'ritual_count',
    title: 'Khởi Đầu Tâm Linh',
    description: 'Hoàn thành nghi thức đầu tiên',
    target: 1,
    xpReward: 50,
    badge: '🌟',
  },
  ritual_master_10: {
    id: 'ritual_master_10',
    type: 'ritual_count',
    title: 'Người Thực Hành',
    description: 'Hoàn thành 10 nghi thức',
    target: 10,
    xpReward: 100,
    badge: '✨',
  },
  ritual_master_50: {
    id: 'ritual_master_50',
    type: 'ritual_count',
    title: 'Bậc Thầy Nghi Thức',
    description: 'Hoàn thành 50 nghi thức',
    target: 50,
    xpReward: 250,
    badge: '🔮',
  },
  ritual_master_100: {
    id: 'ritual_master_100',
    type: 'ritual_count',
    title: 'Đạo Sư Tâm Linh',
    description: 'Hoàn thành 100 nghi thức',
    target: 100,
    xpReward: 500,
    badge: '👑',
  },

  // Streak achievements
  streak_3: {
    id: 'streak_3',
    type: 'ritual_streak',
    title: 'Bắt Đầu Streak',
    description: 'Duy trì streak 3 ngày liên tiếp',
    target: 3,
    xpReward: 75,
    badge: '🔥',
  },
  streak_7: {
    id: 'streak_7',
    type: 'ritual_streak',
    title: 'Tuần Lễ Kiên Trì',
    description: 'Duy trì streak 7 ngày liên tiếp',
    target: 7,
    xpReward: 150,
    badge: '💪',
  },
  streak_30: {
    id: 'streak_30',
    type: 'ritual_streak',
    title: 'Tháng Kỷ Luật',
    description: 'Duy trì streak 30 ngày liên tiếp',
    target: 30,
    xpReward: 500,
    badge: '🏆',
  },
  streak_100: {
    id: 'streak_100',
    type: 'ritual_streak',
    title: 'Huyền Thoại',
    description: 'Duy trì streak 100 ngày liên tiếp',
    target: 100,
    xpReward: 1000,
    badge: '🌈',
  },

  // Goal achievements
  first_goal: {
    id: 'first_goal',
    type: 'goal_complete',
    title: 'Mục Tiêu Đầu Tiên',
    description: 'Hoàn thành mục tiêu đầu tiên',
    target: 1,
    xpReward: 100,
    badge: '🎯',
  },
  goal_setter: {
    id: 'goal_setter',
    type: 'goal_complete',
    title: 'Người Đặt Mục Tiêu',
    description: 'Hoàn thành 5 mục tiêu',
    target: 5,
    xpReward: 250,
    badge: '🏹',
  },

  // Habit achievements
  habit_streak_7: {
    id: 'habit_streak_7',
    type: 'habit_streak',
    title: 'Thói Quen Mới',
    description: 'Duy trì thói quen 7 ngày',
    target: 7,
    xpReward: 100,
    badge: '🔄',
  },
  habit_streak_21: {
    id: 'habit_streak_21',
    type: 'habit_streak',
    title: 'Hình Thành Thói Quen',
    description: 'Duy trì thói quen 21 ngày',
    target: 21,
    xpReward: 300,
    badge: '💎',
  },

  // Divination achievements
  first_reading: {
    id: 'first_reading',
    type: 'divination_count',
    title: 'Người Tìm Kiếm',
    description: 'Thực hiện lần bói đầu tiên',
    target: 1,
    xpReward: 50,
    badge: '🃏',
  },
  divination_expert: {
    id: 'divination_expert',
    type: 'divination_count',
    title: 'Nhà Tiên Tri',
    description: 'Thực hiện 20 lần bói',
    target: 20,
    xpReward: 200,
    badge: '🔮',
  },

  // XP milestones
  xp_1000: {
    id: 'xp_1000',
    type: 'xp_milestone',
    title: 'Nghìn Điểm',
    description: 'Đạt 1,000 XP',
    target: 1000,
    xpReward: 100,
    badge: '⭐',
  },
  xp_5000: {
    id: 'xp_5000',
    type: 'xp_milestone',
    title: 'Năm Nghìn',
    description: 'Đạt 5,000 XP',
    target: 5000,
    xpReward: 250,
    badge: '🌟',
  },
  xp_10000: {
    id: 'xp_10000',
    type: 'xp_milestone',
    title: 'Vạn Điểm',
    description: 'Đạt 10,000 XP',
    target: 10000,
    xpReward: 500,
    badge: '💫',
  },
};

/**
 * Get all achievements for a user
 */
export const getUserAchievements = async (userId) => {
  if (!userId) return [];

  try {
    const { data, error } = await supabase
      .from('user_achievements')
      .select('*')
      .eq('user_id', userId)
      .order('unlocked_at', { ascending: false });

    if (error) throw error;

    // Merge with achievement definitions
    return (data || []).map(a => ({
      ...a,
      ...ACHIEVEMENTS[a.achievement_id],
    }));
  } catch (err) {
    console.error(SERVICE_NAME, 'Get achievements error:', err);
    return [];
  }
};

/**
 * Get unlocked achievements
 */
export const getUnlockedAchievements = async (userId) => {
  if (!userId) return [];

  try {
    const { data, error } = await supabase
      .from('user_achievements')
      .select('*')
      .eq('user_id', userId)
      .eq('is_completed', true)
      .order('unlocked_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(a => ({
      ...a,
      ...ACHIEVEMENTS[a.achievement_id],
    }));
  } catch (err) {
    console.error(SERVICE_NAME, 'Get unlocked error:', err);
    return [];
  }
};

/**
 * Check and update achievement progress
 */
export const checkAchievementProgress = async (userId, type, currentValue) => {
  if (!userId) return null;

  try {
    // Find achievements of this type
    const achievementsOfType = Object.values(ACHIEVEMENTS)
      .filter(a => a.type === type);

    const newlyUnlocked = [];

    for (const achievement of achievementsOfType) {
      // Check if user has this achievement tracked
      const { data: existing } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', userId)
        .eq('achievement_id', achievement.id)
        .single();

      if (existing?.is_completed) {
        // Already unlocked, skip
        continue;
      }

      const progress = Math.min(currentValue, achievement.target);
      const isCompleted = progress >= achievement.target;

      if (existing) {
        // Update existing
        const { error } = await supabase
          .from('user_achievements')
          .update({
            progress,
            is_completed: isCompleted,
            unlocked_at: isCompleted ? new Date().toISOString() : null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id);

        if (error) throw error;

        if (isCompleted && !existing.is_completed) {
          newlyUnlocked.push(achievement);
        }
      } else {
        // Create new
        const { error } = await supabase
          .from('user_achievements')
          .insert({
            user_id: userId,
            achievement_id: achievement.id,
            achievement_type: achievement.type,
            progress,
            target: achievement.target,
            is_completed: isCompleted,
            unlocked_at: isCompleted ? new Date().toISOString() : null,
          });

        if (error) throw error;

        if (isCompleted) {
          newlyUnlocked.push(achievement);
        }
      }
    }

    return newlyUnlocked;
  } catch (err) {
    console.error(SERVICE_NAME, 'Check progress error:', err);
    return null;
  }
};

/**
 * Get achievement by ID
 */
export const getAchievement = (achievementId) => {
  return ACHIEVEMENTS[achievementId] || null;
};

/**
 * Get achievements by type
 */
export const getAchievementsByType = (type) => {
  return Object.values(ACHIEVEMENTS).filter(a => a.type === type);
};

/**
 * Get next achievement for a type
 */
export const getNextAchievement = async (userId, type, currentValue) => {
  const achievementsOfType = Object.values(ACHIEVEMENTS)
    .filter(a => a.type === type)
    .sort((a, b) => a.target - b.target);

  for (const achievement of achievementsOfType) {
    if (currentValue < achievement.target) {
      return {
        ...achievement,
        progress: currentValue,
        remaining: achievement.target - currentValue,
        percentage: Math.round((currentValue / achievement.target) * 100),
      };
    }
  }

  return null;
};

/**
 * Award XP for achievement
 */
export const awardAchievementXP = async (userId, achievementId) => {
  if (!userId || !achievementId) return false;

  const achievement = ACHIEVEMENTS[achievementId];
  if (!achievement) return false;

  try {
    // Add XP to user
    const { error } = await supabase.rpc('add_xp_to_user', {
      p_user_id: userId,
      p_xp_amount: achievement.xpReward,
      p_source: 'achievement',
      p_source_id: achievementId,
    });

    if (error) throw error;

    console.log(SERVICE_NAME, 'Awarded XP:', achievement.xpReward, 'for', achievementId);
    return true;
  } catch (err) {
    console.error(SERVICE_NAME, 'Award XP error:', err);
    return false;
  }
};

export default {
  ACHIEVEMENTS,
  getUserAchievements,
  getUnlockedAchievements,
  checkAchievementProgress,
  getAchievement,
  getAchievementsByType,
  getNextAchievement,
  awardAchievementXP,
};
