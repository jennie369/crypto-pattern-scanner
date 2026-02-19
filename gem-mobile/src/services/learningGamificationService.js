/**
 * GEM Academy - Learning Gamification Service
 * Handles XP, levels, streaks, achievements, daily quests, leaderboard for courses
 */

import { supabase } from './supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_KEY = 'user_learning_stats';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// ========== LEVEL CONFIGURATION ==========
export const LEVEL_CONFIG = {
  1: { xpRequired: 0, title: 'Người mới' },
  2: { xpRequired: 100, title: 'Học viên' },
  3: { xpRequired: 250, title: 'Người học' },
  4: { xpRequired: 500, title: 'Nhà nghiên cứu' },
  5: { xpRequired: 1000, title: 'Chuyên viên' },
  6: { xpRequired: 1750, title: 'Thợ lành nghề' },
  7: { xpRequired: 2750, title: 'Chuyên gia' },
  8: { xpRequired: 4000, title: 'Bậc thầy' },
  9: { xpRequired: 5500, title: 'Đại sứ' },
  10: { xpRequired: 7500, title: 'Huyền thoại' },
};

export const XP_REWARDS = {
  lesson_complete: 10,
  quiz_pass: 20,
  quiz_perfect: 50,
  course_complete: 100,
  daily_quest: 10,
  streak_bonus_7: 25,
  streak_bonus_14: 50,
  streak_bonus_30: 100,
  streak_bonus_100: 200,
};

// ========== USER STATS ==========

export const getUserLearningStats = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession(); const user = session?.user;
    if (!user) throw new Error('User not authenticated');

    // Check cache
    const cached = await AsyncStorage.getItem(CACHE_KEY);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_DURATION) {
        return { success: true, data };
      }
    }

    const { data, error } = await supabase
      .from('user_learning_stats')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Create if not exists
        const { data: newStats, error: createError } = await supabase
          .from('user_learning_stats')
          .insert({ user_id: user.id })
          .select()
          .single();
        if (createError) throw createError;
        return { success: true, data: newStats };
      }
      throw error;
    }

    // Cache result
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify({
      data,
      timestamp: Date.now(),
    }));

    return { success: true, data };
  } catch (error) {
    console.error('[learningGamificationService] getUserLearningStats error:', error);
    return { success: false, error: error.message, data: null };
  }
};

// ========== XP MANAGEMENT ==========

export const addXP = async (amount, actionType, description = '', reference = {}) => {
  try {
    const { data: { session } } = await supabase.auth.getSession(); const user = session?.user;
    if (!user) throw new Error('Not authenticated');

    const { data: stats } = await supabase
      .from('user_learning_stats')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!stats) throw new Error('Stats not found');

    const oldLevel = stats.current_level || 1;
    const newTotalXP = (stats.total_xp || 0) + amount;
    const newLevel = calculateLevel(newTotalXP);
    const xpToNextLevel = calculateXPToNextLevel(newTotalXP, newLevel);
    const leveledUp = newLevel > oldLevel;

    // Update stats
    await supabase
      .from('user_learning_stats')
      .update({
        total_xp: newTotalXP,
        current_level: newLevel,
        xp_to_next_level: xpToNextLevel,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id);

    // Log transaction
    await supabase.from('xp_transactions').insert({
      user_id: user.id,
      amount,
      action_type: actionType,
      description,
      reference_type: reference.type || null,
      reference_id: reference.id || null,
    });

    // Update weekly leaderboard
    await updateWeeklyXP(amount);

    // Clear cache
    await AsyncStorage.removeItem(CACHE_KEY);

    // Check achievements
    await checkXPAchievements(newTotalXP);

    return {
      success: true,
      data: {
        xpGained: amount,
        newTotalXP,
        leveledUp,
        oldLevel,
        newLevel,
        levelTitle: LEVEL_CONFIG[newLevel]?.title || `Level ${newLevel}`,
      },
    };
  } catch (error) {
    console.error('[learningGamificationService] addXP error:', error);
    return { success: false, error: error.message };
  }
};

const calculateLevel = (totalXP) => {
  let level = 1;
  for (const [lvl, config] of Object.entries(LEVEL_CONFIG)) {
    if (totalXP >= config.xpRequired) {
      level = parseInt(lvl);
    } else {
      break;
    }
  }
  return level;
};

const calculateXPToNextLevel = (totalXP, currentLevel) => {
  const nextLevel = currentLevel + 1;
  const nextConfig = LEVEL_CONFIG[nextLevel];
  if (!nextConfig) return 0;
  return nextConfig.xpRequired - totalXP;
};

// ========== STREAK MANAGEMENT ==========

export const updateStreak = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession(); const user = session?.user;
    if (!user) throw new Error('Not authenticated');

    const { data: stats } = await supabase
      .from('user_learning_stats')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!stats) throw new Error('Stats not found');

    const today = new Date().toISOString().split('T')[0];
    const lastActivity = stats.last_activity_date;

    let newStreak = stats.current_streak || 0;
    let streakBroken = false;
    let streakExtended = false;

    if (!lastActivity) {
      newStreak = 1;
      streakExtended = true;
    } else if (lastActivity === today) {
      return { success: true, data: { streak: newStreak, extended: false, broken: false } };
    } else {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      if (lastActivity === yesterdayStr) {
        newStreak = (stats.current_streak || 0) + 1;
        streakExtended = true;
      } else if ((stats.streak_freeze_count || 0) > 0) {
        await supabase
          .from('user_learning_stats')
          .update({
            streak_freeze_count: (stats.streak_freeze_count || 0) - 1,
            last_activity_date: today,
          })
          .eq('user_id', user.id);
        return { success: true, data: { streak: stats.current_streak || 0, freezeUsed: true } };
      } else {
        newStreak = 1;
        streakBroken = true;
      }
    }

    const longestStreak = Math.max(newStreak, stats.longest_streak || 0);

    await supabase
      .from('user_learning_stats')
      .update({
        current_streak: newStreak,
        longest_streak: longestStreak,
        last_activity_date: today,
      })
      .eq('user_id', user.id);

    await checkStreakAchievements(newStreak);

    // Award streak milestone bonus
    if (streakExtended && [7, 14, 30, 100].includes(newStreak)) {
      const bonusXP = XP_REWARDS[`streak_bonus_${newStreak}`] || 50;
      await addXP(bonusXP, 'streak_bonus', `Streak ${newStreak} ngay!`);
    }

    await AsyncStorage.removeItem(CACHE_KEY);

    return {
      success: true,
      data: { streak: newStreak, longestStreak, extended: streakExtended, broken: streakBroken },
    };
  } catch (error) {
    console.error('[learningGamificationService] updateStreak error:', error);
    return { success: false, error: error.message };
  }
};

// ========== ACHIEVEMENTS ==========

export const getAchievementsWithProgress = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession(); const user = session?.user;
    if (!user) return { success: false, error: 'Not authenticated' };

    const { data: achievements } = await supabase
      .from('achievements')
      .select('*')
      .order('category')
      .order('sort_order');

    const { data: userAchievements } = await supabase
      .from('user_achievements')
      .select('achievement_id, earned_at, is_new')
      .eq('user_id', user.id);

    const { data: stats } = await supabase
      .from('user_learning_stats')
      .select('*')
      .eq('user_id', user.id)
      .single();

    const earnedIds = new Set(userAchievements?.map(ua => ua.achievement_id) || []);

    const merged = (achievements || []).map(ach => {
      const earned = earnedIds.has(ach.id);
      const userAch = userAchievements?.find(ua => ua.achievement_id === ach.id);

      let progress = 0;
      if (stats && !earned) {
        switch (ach.requirement_type) {
          case 'streak_days':
            progress = ((stats.current_streak || 0) / ach.requirement_value) * 100;
            break;
          case 'lessons_completed':
            progress = ((stats.total_lessons_completed || 0) / ach.requirement_value) * 100;
            break;
          case 'courses_completed':
            progress = ((stats.total_courses_completed || 0) / ach.requirement_value) * 100;
            break;
          case 'xp_earned':
            progress = ((stats.total_xp || 0) / ach.requirement_value) * 100;
            break;
        }
      }

      return {
        ...ach,
        earned,
        earnedAt: userAch?.earned_at,
        isNew: userAch?.is_new || false,
        progress: earned ? 100 : Math.min(100, Math.round(progress)),
      };
    });

    return {
      success: true,
      data: {
        all: merged,
        grouped: {
          streak: merged.filter(a => a.category === 'streak'),
          learning: merged.filter(a => a.category === 'learning'),
          mastery: merged.filter(a => a.category === 'mastery'),
          general: merged.filter(a => a.category === 'general'),
        },
        earnedCount: earnedIds.size,
        totalCount: achievements?.length || 0,
      },
    };
  } catch (error) {
    console.error('[learningGamificationService] getAchievements error:', error);
    return { success: false, error: error.message };
  }
};

export const awardAchievement = async (achievementCode) => {
  try {
    const { data: { session } } = await supabase.auth.getSession(); const user = session?.user;
    if (!user) throw new Error('Not authenticated');

    const { data: achievement } = await supabase
      .from('achievements')
      .select('*')
      .eq('code', achievementCode)
      .single();

    if (!achievement) return { success: false, error: 'Achievement not found' };

    const { data: existing } = await supabase
      .from('user_achievements')
      .select('id')
      .eq('user_id', user.id)
      .eq('achievement_id', achievement.id)
      .single();

    if (existing) return { success: true, data: { alreadyEarned: true } };

    await supabase
      .from('user_achievements')
      .insert({
        user_id: user.id,
        achievement_id: achievement.id,
        is_new: true,
      });

    if (achievement.xp_reward > 0) {
      await addXP(achievement.xp_reward, 'achievement', achievement.name);
    }

    return { success: true, data: { achievement, newlyEarned: true } };
  } catch (error) {
    console.error('[learningGamificationService] awardAchievement error:', error);
    return { success: false, error: error.message };
  }
};

const checkStreakAchievements = async (streak) => {
  const milestones = [
    { days: 3, code: 'streak_3' },
    { days: 7, code: 'streak_7' },
    { days: 14, code: 'streak_14' },
    { days: 30, code: 'streak_30' },
    { days: 100, code: 'streak_100' },
  ];
  for (const m of milestones) {
    if (streak >= m.days) await awardAchievement(m.code);
  }
};

const checkXPAchievements = async (totalXP) => {
  const milestones = [
    { xp: 500, code: 'xp_500' },
    { xp: 1000, code: 'xp_1000' },
    { xp: 5000, code: 'xp_5000' },
  ];
  for (const m of milestones) {
    if (totalXP >= m.xp) await awardAchievement(m.code);
  }
};

export const checkLessonAchievements = async (totalLessons) => {
  const milestones = [
    { count: 1, code: 'first_lesson' },
    { count: 10, code: 'lessons_10' },
    { count: 50, code: 'lessons_50' },
    { count: 100, code: 'lessons_100' },
  ];
  for (const m of milestones) {
    if (totalLessons >= m.count) await awardAchievement(m.code);
  }
};

export const checkCourseAchievements = async (totalCourses) => {
  const milestones = [
    { count: 1, code: 'first_course' },
    { count: 3, code: 'courses_3' },
    { count: 5, code: 'courses_5' },
  ];
  for (const m of milestones) {
    if (totalCourses >= m.count) await awardAchievement(m.code);
  }
};

export const markAchievementSeen = async (achievementId) => {
  try {
    const { data: { session } } = await supabase.auth.getSession(); const user = session?.user;
    if (!user) return { success: false };

    await supabase
      .from('user_achievements')
      .update({ is_new: false })
      .eq('user_id', user.id)
      .eq('achievement_id', achievementId);

    return { success: true };
  } catch (error) {
    return { success: false };
  }
};

// ========== DAILY QUESTS ==========

export const getTodayQuests = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession(); const user = session?.user;
    if (!user) throw new Error('Not authenticated');

    const today = new Date().toISOString().split('T')[0];

    const { data: quests } = await supabase
      .from('daily_quests')
      .select('*')
      .eq('is_active', true);

    const { data: progress } = await supabase
      .from('user_daily_quest_progress')
      .select('*')
      .eq('user_id', user.id)
      .eq('quest_date', today);

    // Select 3 quests deterministically based on date
    const selectedQuests = selectDailyQuests(quests || [], today);

    const questsWithProgress = selectedQuests.map(quest => {
      const userProgress = progress?.find(p => p.quest_id === quest.id);
      return {
        ...quest,
        currentProgress: userProgress?.current_progress || 0,
        isCompleted: userProgress?.is_completed || false,
        xpClaimed: userProgress?.xp_claimed || false,
      };
    });

    const allCompleted = questsWithProgress.every(q => q.isCompleted);

    return {
      success: true,
      data: {
        quests: questsWithProgress,
        completedCount: questsWithProgress.filter(q => q.isCompleted).length,
        totalCount: questsWithProgress.length,
        allCompleted,
        bonusAvailable: allCompleted && !questsWithProgress.every(q => q.xpClaimed),
        bonusXP: 50,
      },
    };
  } catch (error) {
    console.error('[learningGamificationService] getTodayQuests error:', error);
    return { success: false, error: error.message, data: null };
  }
};

const selectDailyQuests = (allQuests, dateString) => {
  // Create deterministic selection based on date
  const seed = dateString.split('-').join('');
  const shuffled = [...allQuests].sort((a, b) => {
    const hashA = simpleHash(a.code + seed);
    const hashB = simpleHash(b.code + seed);
    return hashA - hashB;
  });

  // Select 1 easy, 1 medium, 1 hard (or fallback)
  const easy = shuffled.filter(q => q.difficulty === 'easy');
  const medium = shuffled.filter(q => q.difficulty === 'medium');
  const hard = shuffled.filter(q => q.difficulty === 'hard');

  const selected = [];
  if (easy[0]) selected.push(easy[0]);
  if (medium[0]) selected.push(medium[0]);
  if (hard[0]) selected.push(hard[0]);
  else if (medium[1]) selected.push(medium[1]);

  return selected.slice(0, 3);
};

const simpleHash = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash);
};

export const updateQuestProgress = async (requirementType, amount = 1) => {
  try {
    const { data: { session } } = await supabase.auth.getSession(); const user = session?.user;
    if (!user) return { success: false };

    const today = new Date().toISOString().split('T')[0];

    // Get quests matching requirement
    const { data: quests } = await supabase
      .from('daily_quests')
      .select('*')
      .eq('requirement_type', requirementType)
      .eq('is_active', true);

    for (const quest of quests || []) {
      // Get or create progress
      let { data: progress } = await supabase
        .from('user_daily_quest_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('quest_id', quest.id)
        .eq('quest_date', today)
        .single();

      if (!progress) {
        const { data: newProgress } = await supabase
          .from('user_daily_quest_progress')
          .insert({
            user_id: user.id,
            quest_id: quest.id,
            quest_date: today,
          })
          .select()
          .single();
        progress = newProgress;
      }

      if (progress && !progress.is_completed) {
        const newProgressVal = Math.min(progress.current_progress + amount, quest.requirement_value);
        const isCompleted = newProgressVal >= quest.requirement_value;

        await supabase
          .from('user_daily_quest_progress')
          .update({
            current_progress: newProgressVal,
            is_completed: isCompleted,
            completed_at: isCompleted ? new Date().toISOString() : null,
          })
          .eq('id', progress.id);
      }
    }

    return { success: true };
  } catch (error) {
    console.error('[learningGamificationService] updateQuestProgress error:', error);
    return { success: false };
  }
};

export const claimQuestReward = async (questId) => {
  try {
    const { data: { session } } = await supabase.auth.getSession(); const user = session?.user;
    if (!user) throw new Error('Not authenticated');

    const today = new Date().toISOString().split('T')[0];

    const { data: progress } = await supabase
      .from('user_daily_quest_progress')
      .select('*, daily_quests(*)')
      .eq('user_id', user.id)
      .eq('quest_id', questId)
      .eq('quest_date', today)
      .single();

    if (!progress?.is_completed) throw new Error('Quest not completed');
    if (progress.xp_claimed) return { success: true, data: { alreadyClaimed: true } };

    await supabase
      .from('user_daily_quest_progress')
      .update({ xp_claimed: true })
      .eq('id', progress.id);

    await addXP(progress.daily_quests.xp_reward, 'daily_quest', progress.daily_quests.name);

    return { success: true, data: { xpReward: progress.daily_quests.xp_reward } };
  } catch (error) {
    console.error('[learningGamificationService] claimQuestReward error:', error);
    return { success: false, error: error.message };
  }
};

// ========== GET DAILY QUEST PROGRESS ==========

export const getDailyQuestProgress = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession(); const user = session?.user;
    if (!user) return { success: false, error: 'Not authenticated', data: [] };

    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('user_daily_quest_progress')
      .select('*')
      .eq('user_id', user.id)
      .eq('quest_date', today);

    if (error) {
      // Graceful degradation if table doesn't exist yet
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        console.log('[learningGamificationService] user_daily_quest_progress table not ready');
        return { success: true, data: [] };
      }
      throw error;
    }

    return { success: true, data: data || [] };
  } catch (error) {
    console.error('[learningGamificationService] getDailyQuestProgress error:', error);
    return { success: false, error: error.message, data: [] };
  }
};

// ========== LEADERBOARD ==========

export const getWeeklyLeaderboard = async (limit = 50) => {
  try {
    const { data: { session } } = await supabase.auth.getSession(); const user = session?.user;

    const now = new Date();
    const monday = new Date(now);
    monday.setDate(now.getDate() - now.getDay() + 1);
    const weekStart = monday.toISOString().split('T')[0];

    const { data: leaderboard } = await supabase
      .from('weekly_leaderboard')
      .select('*, profiles(display_name, avatar_url)')
      .eq('week_start', weekStart)
      .order('weekly_xp', { ascending: false })
      .limit(limit);

    let userPosition = null;
    if (user) {
      const userEntry = leaderboard?.findIndex(e => e.user_id === user.id);
      if (userEntry !== undefined && userEntry >= 0) {
        userPosition = userEntry + 1;
      }
    }

    return {
      success: true,
      data: {
        leaderboard: (leaderboard || []).map((entry, index) => ({
          rank: index + 1,
          userId: entry.user_id,
          displayName: entry.profiles?.display_name || 'Nguoi dung',
          avatarUrl: entry.profiles?.avatar_url,
          weeklyXP: entry.weekly_xp,
          league: entry.league,
          previousRank: entry.previous_rank,
          isCurrentUser: user && entry.user_id === user.id,
        })),
        userPosition,
        weekStart,
      },
    };
  } catch (error) {
    console.error('[learningGamificationService] getWeeklyLeaderboard error:', error);
    return { success: false, error: error.message };
  }
};

const updateWeeklyXP = async (xpAmount) => {
  try {
    const { data: { session } } = await supabase.auth.getSession(); const user = session?.user;
    if (!user) return;

    const now = new Date();
    const monday = new Date(now);
    monday.setDate(now.getDate() - now.getDay() + 1);
    const weekStart = monday.toISOString().split('T')[0];

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    const weekEnd = sunday.toISOString().split('T')[0];

    const { data: existing } = await supabase
      .from('weekly_leaderboard')
      .select('id, weekly_xp')
      .eq('user_id', user.id)
      .eq('week_start', weekStart)
      .single();

    if (existing) {
      await supabase
        .from('weekly_leaderboard')
        .update({ weekly_xp: (existing.weekly_xp || 0) + xpAmount })
        .eq('id', existing.id);
    } else {
      await supabase
        .from('weekly_leaderboard')
        .insert({
          user_id: user.id,
          week_start: weekStart,
          week_end: weekEnd,
          weekly_xp: xpAmount,
        });
    }
  } catch (error) {
    console.error('[learningGamificationService] updateWeeklyXP error:', error);
  }
};

// ========== LEARNING STATS UPDATE ==========

export const incrementLessonStats = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession(); const user = session?.user;
    if (!user) return { success: false };

    const { data: stats } = await supabase
      .from('user_learning_stats')
      .select('total_lessons_completed')
      .eq('user_id', user.id)
      .single();

    const newCount = (stats?.total_lessons_completed || 0) + 1;

    await supabase
      .from('user_learning_stats')
      .update({
        total_lessons_completed: newCount,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id);

    await checkLessonAchievements(newCount);
    await AsyncStorage.removeItem(CACHE_KEY);

    return { success: true, data: { totalLessons: newCount } };
  } catch (error) {
    return { success: false };
  }
};

export const incrementCourseStats = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession(); const user = session?.user;
    if (!user) return { success: false };

    const { data: stats } = await supabase
      .from('user_learning_stats')
      .select('total_courses_completed, total_certificates')
      .eq('user_id', user.id)
      .single();

    const newCourseCount = (stats?.total_courses_completed || 0) + 1;
    const newCertCount = (stats?.total_certificates || 0) + 1;

    await supabase
      .from('user_learning_stats')
      .update({
        total_courses_completed: newCourseCount,
        total_certificates: newCertCount,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id);

    await checkCourseAchievements(newCourseCount);
    await AsyncStorage.removeItem(CACHE_KEY);

    return { success: true, data: { totalCourses: newCourseCount } };
  } catch (error) {
    return { success: false };
  }
};

export const incrementQuizStats = async (isPerfect = false) => {
  try {
    const { data: { session } } = await supabase.auth.getSession(); const user = session?.user;
    if (!user) return { success: false };

    const { data: stats } = await supabase
      .from('user_learning_stats')
      .select('total_quizzes_passed')
      .eq('user_id', user.id)
      .single();

    await supabase
      .from('user_learning_stats')
      .update({
        total_quizzes_passed: (stats?.total_quizzes_passed || 0) + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id);

    if (isPerfect) {
      await awardAchievement('quiz_perfect');
    }

    await AsyncStorage.removeItem(CACHE_KEY);

    return { success: true };
  } catch (error) {
    return { success: false };
  }
};

export const addWatchTime = async (minutes) => {
  try {
    const { data: { session } } = await supabase.auth.getSession(); const user = session?.user;
    if (!user) return { success: false };

    const { data: stats } = await supabase
      .from('user_learning_stats')
      .select('total_watch_time_minutes')
      .eq('user_id', user.id)
      .single();

    await supabase
      .from('user_learning_stats')
      .update({
        total_watch_time_minutes: (stats?.total_watch_time_minutes || 0) + minutes,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id);

    // Update quest progress for watch time
    await updateQuestProgress('watch_minutes', minutes);
    await AsyncStorage.removeItem(CACHE_KEY);

    return { success: true };
  } catch (error) {
    return { success: false };
  }
};

// ========== DEFAULT EXPORT ==========

export default {
  // Config
  LEVEL_CONFIG,
  XP_REWARDS,
  // Stats
  getUserLearningStats,
  // XP
  addXP,
  // Streak
  updateStreak,
  // Achievements
  getAchievementsWithProgress,
  awardAchievement,
  markAchievementSeen,
  checkLessonAchievements,
  checkCourseAchievements,
  // Quests
  getTodayQuests,
  getDailyQuestProgress,
  updateQuestProgress,
  claimQuestReward,
  // Leaderboard
  getWeeklyLeaderboard,
  // Stats updates
  incrementLessonStats,
  incrementCourseStats,
  incrementQuizStats,
  addWatchTime,
};
