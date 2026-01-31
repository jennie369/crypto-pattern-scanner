/**
 * Vision Board - Stats Service
 * Handles user statistics, daily scores, streaks, and XP tracking
 *
 * @fileoverview Comprehensive stats management for Vision Board
 */

import { supabase } from '../../lib/supabaseClient';
import { getGoalsSummary } from './goalService';
import { getHabitsSummary, getTodaysHabits } from './habitService';
import { getAffirmationsSummary } from './affirmationService';

/**
 * XP Level thresholds
 * Each level requires progressively more XP
 */
export const XP_LEVELS = [
  { level: 1, xp: 0, title: 'Beginner' },
  { level: 2, xp: 100, title: 'Novice' },
  { level: 3, xp: 250, title: 'Apprentice' },
  { level: 4, xp: 500, title: 'Practitioner' },
  { level: 5, xp: 1000, title: 'Achiever' },
  { level: 6, xp: 2000, title: 'Performer' },
  { level: 7, xp: 3500, title: 'Expert' },
  { level: 8, xp: 5500, title: 'Master' },
  { level: 9, xp: 8000, title: 'Champion' },
  { level: 10, xp: 12000, title: 'Legend' },
  { level: 11, xp: 17000, title: 'Visionary' },
  { level: 12, xp: 25000, title: 'Enlightened' },
  { level: 13, xp: 35000, title: 'Transcendent' },
  { level: 14, xp: 50000, title: 'Immortal' },
  { level: 15, xp: 75000, title: 'Divine' },
];

/**
 * Daily score weights
 */
export const DAILY_SCORE_WEIGHTS = {
  habits: 0.4,       // 40% from habits
  goals: 0.3,        // 30% from goal progress
  affirmations: 0.2, // 20% from affirmations
  rituals: 0.1,      // 10% from rituals
};

/**
 * Get or create user stats
 *
 * @param {string} userId - User ID
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export const getUserStats = async (userId) => {
  try {
    let { data: stats, error } = await supabase
      .from('vision_user_stats')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code === 'PGRST116') {
      // Not found, create new stats
      const { data: newStats, error: createError } = await supabase
        .from('vision_user_stats')
        .insert({
          user_id: userId,
          total_xp: 0,
          current_streak: 0,
          longest_streak: 0,
          total_goals_completed: 0,
          total_habits_checked: 0,
          total_affirmations_read: 0,
          total_rituals_completed: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (createError) throw createError;
      stats = newStats;
    } else if (error) {
      throw error;
    }

    // Calculate level from XP
    if (stats) {
      stats.level = calculateLevel(stats.total_xp || 0);
      stats.levelProgress = calculateLevelProgress(stats.total_xp || 0);
    }

    return { data: stats, error: null };
  } catch (error) {
    console.error('Error getting user stats:', error);
    return { data: null, error };
  }
};

/**
 * Calculate user level from total XP
 *
 * @param {number} totalXP - Total XP earned
 * @returns {Object} Level info
 */
export const calculateLevel = (totalXP) => {
  let currentLevel = XP_LEVELS[0];

  for (const level of XP_LEVELS) {
    if (totalXP >= level.xp) {
      currentLevel = level;
    } else {
      break;
    }
  }

  return currentLevel;
};

/**
 * Calculate progress to next level
 *
 * @param {number} totalXP - Total XP earned
 * @returns {Object} Progress info
 */
export const calculateLevelProgress = (totalXP) => {
  const currentLevel = calculateLevel(totalXP);
  const currentIndex = XP_LEVELS.findIndex((l) => l.level === currentLevel.level);
  const nextLevel = XP_LEVELS[currentIndex + 1];

  if (!nextLevel) {
    return {
      currentXP: totalXP,
      xpForCurrentLevel: currentLevel.xp,
      xpForNextLevel: null,
      progress: 100,
      xpToNextLevel: 0,
      isMaxLevel: true,
    };
  }

  const xpInCurrentLevel = totalXP - currentLevel.xp;
  const xpNeededForNextLevel = nextLevel.xp - currentLevel.xp;
  const progress = Math.round((xpInCurrentLevel / xpNeededForNextLevel) * 100);

  return {
    currentXP: totalXP,
    xpForCurrentLevel: currentLevel.xp,
    xpForNextLevel: nextLevel.xp,
    progress: Math.min(progress, 100),
    xpToNextLevel: nextLevel.xp - totalXP,
    isMaxLevel: false,
    nextLevel,
  };
};

/**
 * Update user stats after an action
 *
 * @param {string} userId - User ID
 * @param {Object} updates - Stats to update
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export const updateUserStats = async (userId, updates) => {
  try {
    // Get current stats first
    const { data: current } = await getUserStats(userId);

    if (!current) {
      throw new Error('Failed to get user stats');
    }

    const updatedStats = {
      ...updates,
      updated_at: new Date().toISOString(),
    };

    // If updating XP, calculate new level
    if (updates.total_xp !== undefined) {
      const newLevel = calculateLevel(updates.total_xp);
      updatedStats.current_level = newLevel.level;
    }

    const { data, error } = await supabase
      .from('vision_user_stats')
      .update(updatedStats)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error updating user stats:', error);
    return { data: null, error };
  }
};

/**
 * Calculate and get daily score
 *
 * @param {string} userId - User ID
 * @returns {Promise<{data: Object, error: Error|null}>}
 */
export const getDailyScore = async (userId) => {
  try {
    // Get today's habits completion
    const { completed: habitsCompleted, total: habitsTotal } = await getTodaysHabits(userId);
    const habitScore = habitsTotal > 0 ? (habitsCompleted / habitsTotal) * 100 : 0;

    // Get goal progress (average of active goals)
    const { data: goalsSummary } = await getGoalsSummary(userId);
    const goalScore = goalsSummary?.averageProgress || 0;

    // Get affirmations read today
    const { data: affirmationsSummary } = await getAffirmationsSummary(userId);
    const affirmationScore = affirmationsSummary?.todayReadings > 0 ? 100 : 0;

    // Get rituals completed today
    const today = new Date().toISOString().split('T')[0];
    const { count: ritualsToday } = await supabase
      .from('ritual_logs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('completed_at', `${today}T00:00:00`)
      .lte('completed_at', `${today}T23:59:59`);

    const ritualScore = (ritualsToday || 0) > 0 ? Math.min(ritualsToday * 50, 100) : 0;

    // Calculate weighted daily score
    const dailyScore = Math.round(
      habitScore * DAILY_SCORE_WEIGHTS.habits +
      goalScore * DAILY_SCORE_WEIGHTS.goals +
      affirmationScore * DAILY_SCORE_WEIGHTS.affirmations +
      ritualScore * DAILY_SCORE_WEIGHTS.rituals
    );

    const breakdown = {
      habits: {
        score: Math.round(habitScore),
        completed: habitsCompleted,
        total: habitsTotal,
        weight: DAILY_SCORE_WEIGHTS.habits,
      },
      goals: {
        score: Math.round(goalScore),
        active: goalsSummary?.active || 0,
        completed: goalsSummary?.completed || 0,
        weight: DAILY_SCORE_WEIGHTS.goals,
      },
      affirmations: {
        score: Math.round(affirmationScore),
        readToday: affirmationsSummary?.todayReadings || 0,
        weight: DAILY_SCORE_WEIGHTS.affirmations,
      },
      rituals: {
        score: Math.round(ritualScore),
        completedToday: ritualsToday || 0,
        weight: DAILY_SCORE_WEIGHTS.rituals,
      },
    };

    return {
      data: {
        dailyScore,
        breakdown,
        date: today,
      },
      error: null,
    };
  } catch (error) {
    console.error('Error calculating daily score:', error);
    return { data: { dailyScore: 0, breakdown: {} }, error };
  }
};

/**
 * Save daily summary (call at end of day or on demand)
 *
 * @param {string} userId - User ID
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export const saveDailySummary = async (userId) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Check if already saved today
    const { data: existing } = await supabase
      .from('vision_daily_summary')
      .select('id')
      .eq('user_id', userId)
      .eq('date', today)
      .single();

    // Get daily score
    const { data: scoreData } = await getDailyScore(userId);

    const summaryData = {
      user_id: userId,
      date: today,
      daily_score: scoreData?.dailyScore || 0,
      habits_completed: scoreData?.breakdown?.habits?.completed || 0,
      habits_total: scoreData?.breakdown?.habits?.total || 0,
      goals_progress: scoreData?.breakdown?.goals?.score || 0,
      affirmations_read: scoreData?.breakdown?.affirmations?.readToday || 0,
      rituals_completed: scoreData?.breakdown?.rituals?.completedToday || 0,
      updated_at: new Date().toISOString(),
    };

    let result;
    if (existing) {
      // Update existing
      result = await supabase
        .from('vision_daily_summary')
        .update(summaryData)
        .eq('id', existing.id)
        .select()
        .single();
    } else {
      // Insert new
      summaryData.created_at = new Date().toISOString();
      result = await supabase
        .from('vision_daily_summary')
        .insert(summaryData)
        .select()
        .single();
    }

    if (result.error) throw result.error;

    return { data: result.data, error: null };
  } catch (error) {
    console.error('Error saving daily summary:', error);
    return { data: null, error };
  }
};

/**
 * Get daily summaries history
 *
 * @param {string} userId - User ID
 * @param {number} days - Number of days to fetch
 * @returns {Promise<{data: Array, error: Error|null}>}
 */
export const getDailySummaryHistory = async (userId, days = 30) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('vision_daily_summary')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate.toISOString().split('T')[0])
      .order('date', { ascending: false });

    if (error) throw error;

    return { data: data || [], error: null };
  } catch (error) {
    console.error('Error fetching daily summary history:', error);
    return { data: [], error };
  }
};

/**
 * Update activity streak
 *
 * @param {string} userId - User ID
 * @returns {Promise<{currentStreak: number, longestStreak: number, error: Error|null}>}
 */
export const updateActivityStreak = async (userId) => {
  try {
    // Get daily summaries to calculate streak
    const { data: summaries } = await getDailySummaryHistory(userId, 365);

    if (!summaries || summaries.length === 0) {
      return { currentStreak: 0, longestStreak: 0, error: null };
    }

    // Create set of active days (score > 0)
    const activeDays = new Set(
      summaries
        .filter((s) => s.daily_score > 0)
        .map((s) => s.date)
    );

    // Calculate current streak
    let currentStreak = 0;
    const today = new Date();
    const checkDate = new Date(today);

    while (true) {
      const dateStr = checkDate.toISOString().split('T')[0];
      if (activeDays.has(dateStr)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (dateStr === today.toISOString().split('T')[0]) {
        // Today might not have activity yet, check yesterday
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    // Get current longest streak from DB
    const { data: stats } = await getUserStats(userId);
    const longestStreak = Math.max(stats?.longest_streak || 0, currentStreak);

    // Update stats
    await supabase
      .from('vision_user_stats')
      .update({
        current_streak: currentStreak,
        longest_streak: longestStreak,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    return { currentStreak, longestStreak, error: null };
  } catch (error) {
    console.error('Error updating streak:', error);
    return { currentStreak: 0, longestStreak: 0, error };
  }
};

/**
 * Get comprehensive dashboard stats
 *
 * @param {string} userId - User ID
 * @returns {Promise<Object>}
 */
export const getDashboardStats = async (userId) => {
  try {
    // Fetch all stats in parallel
    const [
      userStats,
      goalsSummary,
      habitsSummary,
      affirmationsSummary,
      dailyScore,
    ] = await Promise.all([
      getUserStats(userId),
      getGoalsSummary(userId),
      getHabitsSummary(userId),
      getAffirmationsSummary(userId),
      getDailyScore(userId),
    ]);

    return {
      data: {
        user: userStats.data,
        goals: goalsSummary.data,
        habits: habitsSummary.data,
        affirmations: affirmationsSummary.data,
        daily: dailyScore.data,
      },
      error: null,
    };
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    return { data: null, error };
  }
};

/**
 * Get activity calendar data (for heatmap display)
 *
 * @param {string} userId - User ID
 * @param {number} months - Number of months to fetch
 * @returns {Promise<{data: Object, error: Error|null}>}
 */
export const getActivityCalendar = async (userId, months = 3) => {
  try {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const { data: summaries, error } = await supabase
      .from('vision_daily_summary')
      .select('date, daily_score, habits_completed, habits_total')
      .eq('user_id', userId)
      .gte('date', startDate.toISOString().split('T')[0])
      .order('date', { ascending: true });

    if (error) throw error;

    // Convert to calendar format
    const calendar = {};
    for (const summary of summaries || []) {
      calendar[summary.date] = {
        score: summary.daily_score,
        habitsCompleted: summary.habits_completed,
        habitsTotal: summary.habits_total,
        // Intensity level for heatmap (0-4)
        intensity: Math.min(Math.floor(summary.daily_score / 25), 4),
      };
    }

    return { data: calendar, error: null };
  } catch (error) {
    console.error('Error getting activity calendar:', error);
    return { data: {}, error };
  }
};

/**
 * Get XP history for charts
 *
 * @param {string} userId - User ID
 * @param {number} days - Number of days
 * @returns {Promise<{data: Array, error: Error|null}>}
 */
export const getXPHistory = async (userId, days = 30) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Try to get from XP transactions table
    const { data, error } = await supabase
      .from('xp_transactions')
      .select('amount, source, created_at')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true });

    if (error) {
      // Table might not exist, return empty
      return { data: [], error: null };
    }

    return { data: data || [], error: null };
  } catch (error) {
    console.error('Error getting XP history:', error);
    return { data: [], error };
  }
};

export default {
  XP_LEVELS,
  DAILY_SCORE_WEIGHTS,
  getUserStats,
  calculateLevel,
  calculateLevelProgress,
  updateUserStats,
  getDailyScore,
  saveDailySummary,
  getDailySummaryHistory,
  updateActivityStreak,
  getDashboardStats,
  getActivityCalendar,
  getXPHistory,
};
