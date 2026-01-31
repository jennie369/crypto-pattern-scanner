/**
 * Vision Board - Habit Service
 * Handles habit CRUD, daily check-ins, and streak tracking
 *
 * @fileoverview Habit management with streak calculations and XP awards
 */

import { supabase } from '../../lib/supabaseClient';
import { checkHabitQuota } from './tierService';
import { awardXP, XP_REWARDS } from './goalService';

/**
 * Habit frequency options
 */
export const HABIT_FREQUENCIES = [
  { key: 'daily', label: 'Daily', daysPerWeek: 7 },
  { key: 'weekdays', label: 'Weekdays', daysPerWeek: 5 },
  { key: 'weekends', label: 'Weekends', daysPerWeek: 2 },
  { key: 'custom', label: 'Custom Days', daysPerWeek: null },
];

/**
 * Habit categories
 */
export const HABIT_CATEGORIES = [
  { key: 'health', label: 'Health', icon: 'Heart', color: '#FF6B6B' },
  { key: 'productivity', label: 'Productivity', icon: 'Zap', color: '#FFBD59' },
  { key: 'mindfulness', label: 'Mindfulness', icon: 'Sun', color: '#A855F7' },
  { key: 'learning', label: 'Learning', icon: 'Book', color: '#00F0FF' },
  { key: 'fitness', label: 'Fitness', icon: 'Activity', color: '#3AF7A6' },
  { key: 'trading', label: 'Trading', icon: 'TrendingUp', color: '#6A5BFF' },
  { key: 'social', label: 'Social', icon: 'Users', color: '#FF69B4' },
  { key: 'other', label: 'Other', icon: 'Star', color: '#FFFFFF' },
];

/**
 * XP rewards for habit actions
 */
export const HABIT_XP = {
  complete: 20,
  streakBonus7: 50,
  streakBonus30: 150,
  streakBonus100: 500,
};

/**
 * Get all habits for a user
 *
 * @param {string} userId - User ID
 * @param {Object} options - Filter options
 * @returns {Promise<{data: Array, error: Error|null}>}
 */
export const getHabits = async (userId, options = {}) => {
  const { includeInactive = false, category = null } = options;

  try {
    let query = supabase
      .from('vision_habits')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (!includeInactive) {
      query = query.eq('is_active', true);
    }

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Get today's logs for all habits
    const today = new Date().toISOString().split('T')[0];
    const habitIds = (data || []).map((h) => h.id);

    let todayLogs = [];
    if (habitIds.length > 0) {
      const { data: logs } = await supabase
        .from('vision_habit_logs')
        .select('habit_id, completed_at')
        .in('habit_id', habitIds)
        .gte('completed_at', `${today}T00:00:00`)
        .lte('completed_at', `${today}T23:59:59`);

      todayLogs = logs || [];
    }

    // Merge today's completion status
    const habitsWithStatus = (data || []).map((habit) => ({
      ...habit,
      completedToday: todayLogs.some((log) => log.habit_id === habit.id),
    }));

    return { data: habitsWithStatus, error: null };
  } catch (error) {
    console.error('Error fetching habits:', error);
    return { data: [], error };
  }
};

/**
 * Get a single habit by ID with stats
 *
 * @param {string} habitId - Habit ID
 * @param {string} userId - User ID
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export const getHabitById = async (habitId, userId) => {
  try {
    const { data: habit, error } = await supabase
      .from('vision_habits')
      .select('*')
      .eq('id', habitId)
      .eq('user_id', userId)
      .single();

    if (error) throw error;

    if (habit) {
      // Get streak info
      habit.streakInfo = await calculateStreak(habitId);

      // Check if completed today
      const today = new Date().toISOString().split('T')[0];
      const { data: todayLog } = await supabase
        .from('vision_habit_logs')
        .select('id')
        .eq('habit_id', habitId)
        .gte('completed_at', `${today}T00:00:00`)
        .lte('completed_at', `${today}T23:59:59`)
        .limit(1);

      habit.completedToday = (todayLog?.length || 0) > 0;
    }

    return { data: habit, error: null };
  } catch (error) {
    console.error('Error fetching habit:', error);
    return { data: null, error };
  }
};

/**
 * Create a new habit with quota check
 *
 * @param {string} userId - User ID
 * @param {Object} habitData - Habit data
 * @param {string} tier - User's tier
 * @returns {Promise<{data: Object|null, error: Error|null, quotaExceeded?: boolean}>}
 */
export const createHabit = async (userId, habitData, tier) => {
  try {
    // Check quota
    const quotaCheck = await checkHabitQuota(userId, tier);
    if (!quotaCheck.allowed) {
      return {
        data: null,
        error: new Error(quotaCheck.message),
        quotaExceeded: true,
      };
    }

    // Validate
    if (!habitData.title?.trim()) {
      return { data: null, error: new Error('Habit title is required') };
    }

    const newHabit = {
      user_id: userId,
      title: habitData.title.trim(),
      description: habitData.description?.trim() || null,
      category: habitData.category || 'other',
      frequency: habitData.frequency || 'daily',
      custom_days: habitData.customDays || null, // [0,1,2,3,4,5,6] for days
      reminder_time: habitData.reminderTime || null,
      icon: habitData.icon || null,
      color: habitData.color || null,
      current_streak: 0,
      longest_streak: 0,
      total_completions: 0,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('vision_habits')
      .insert(newHabit)
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error creating habit:', error);
    return { data: null, error };
  }
};

/**
 * Update a habit
 *
 * @param {string} habitId - Habit ID
 * @param {Object} updates - Fields to update
 * @param {string} userId - User ID
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export const updateHabit = async (habitId, updates, userId) => {
  try {
    const allowedFields = [
      'title', 'description', 'category', 'frequency',
      'custom_days', 'reminder_time', 'icon', 'color', 'is_active',
    ];

    const sanitizedUpdates = {};
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        sanitizedUpdates[field] = updates[field];
      }
    }
    sanitizedUpdates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('vision_habits')
      .update(sanitizedUpdates)
      .eq('id', habitId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error updating habit:', error);
    return { data: null, error };
  }
};

/**
 * Delete a habit (soft delete - deactivate)
 *
 * @param {string} habitId - Habit ID
 * @param {string} userId - User ID
 * @param {boolean} hardDelete - Permanently delete if true
 * @returns {Promise<{success: boolean, error: Error|null}>}
 */
export const deleteHabit = async (habitId, userId, hardDelete = false) => {
  try {
    if (hardDelete) {
      // Delete logs first
      await supabase.from('vision_habit_logs').delete().eq('habit_id', habitId);

      const { error } = await supabase
        .from('vision_habits')
        .delete()
        .eq('id', habitId)
        .eq('user_id', userId);

      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('vision_habits')
        .update({
          is_active: false,
          updated_at: new Date().toISOString(),
        })
        .eq('id', habitId)
        .eq('user_id', userId);

      if (error) throw error;
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Error deleting habit:', error);
    return { success: false, error };
  }
};

/**
 * Check/complete a habit for today
 *
 * @param {string} habitId - Habit ID
 * @param {string} userId - User ID
 * @returns {Promise<{data: Object|null, xpAwarded: number, streakBonus: number, error: Error|null}>}
 */
export const checkHabit = async (habitId, userId) => {
  try {
    // Verify ownership
    const { data: habit, error: habitError } = await supabase
      .from('vision_habits')
      .select('*')
      .eq('id', habitId)
      .eq('user_id', userId)
      .single();

    if (habitError || !habit) {
      throw new Error('Habit not found or unauthorized');
    }

    // Check if already completed today
    const today = new Date().toISOString().split('T')[0];
    const { data: existingLog } = await supabase
      .from('vision_habit_logs')
      .select('id')
      .eq('habit_id', habitId)
      .gte('completed_at', `${today}T00:00:00`)
      .lte('completed_at', `${today}T23:59:59`)
      .limit(1);

    if (existingLog?.length > 0) {
      // Already completed today
      return {
        data: habit,
        xpAwarded: 0,
        streakBonus: 0,
        alreadyCompleted: true,
        error: null,
      };
    }

    // Create log entry
    const { error: logError } = await supabase
      .from('vision_habit_logs')
      .insert({
        habit_id: habitId,
        user_id: userId,
        completed_at: new Date().toISOString(),
      });

    if (logError) throw logError;

    // Calculate new streak
    const streakInfo = await calculateStreak(habitId);
    const newStreak = streakInfo.currentStreak;
    const longestStreak = Math.max(habit.longest_streak || 0, newStreak);

    // Update habit stats
    const { data: updatedHabit, error: updateError } = await supabase
      .from('vision_habits')
      .update({
        current_streak: newStreak,
        longest_streak: longestStreak,
        total_completions: (habit.total_completions || 0) + 1,
        last_completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', habitId)
      .select()
      .single();

    if (updateError) throw updateError;

    // Award XP
    let xpAwarded = await awardXP(userId, HABIT_XP.complete, 'habit_completed', habitId);
    let streakBonus = 0;

    // Streak bonuses
    if (newStreak === 7) {
      streakBonus = await awardXP(userId, HABIT_XP.streakBonus7, 'habit_streak_7', habitId);
    } else if (newStreak === 30) {
      streakBonus = await awardXP(userId, HABIT_XP.streakBonus30, 'habit_streak_30', habitId);
    } else if (newStreak === 100) {
      streakBonus = await awardXP(userId, HABIT_XP.streakBonus100, 'habit_streak_100', habitId);
    }

    return {
      data: { ...updatedHabit, completedToday: true, streakInfo },
      xpAwarded,
      streakBonus,
      error: null,
    };
  } catch (error) {
    console.error('Error checking habit:', error);
    return { data: null, xpAwarded: 0, streakBonus: 0, error };
  }
};

/**
 * Uncheck/uncomplete a habit for today
 *
 * @param {string} habitId - Habit ID
 * @param {string} userId - User ID
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export const uncheckHabit = async (habitId, userId) => {
  try {
    // Verify ownership
    const { data: habit, error: habitError } = await supabase
      .from('vision_habits')
      .select('*')
      .eq('id', habitId)
      .eq('user_id', userId)
      .single();

    if (habitError || !habit) {
      throw new Error('Habit not found or unauthorized');
    }

    // Delete today's log
    const today = new Date().toISOString().split('T')[0];
    const { error: deleteError } = await supabase
      .from('vision_habit_logs')
      .delete()
      .eq('habit_id', habitId)
      .gte('completed_at', `${today}T00:00:00`)
      .lte('completed_at', `${today}T23:59:59`);

    if (deleteError) throw deleteError;

    // Recalculate streak
    const streakInfo = await calculateStreak(habitId);

    // Update habit stats
    const { data: updatedHabit, error: updateError } = await supabase
      .from('vision_habits')
      .update({
        current_streak: streakInfo.currentStreak,
        total_completions: Math.max(0, (habit.total_completions || 0) - 1),
        updated_at: new Date().toISOString(),
      })
      .eq('id', habitId)
      .select()
      .single();

    if (updateError) throw updateError;

    return { data: { ...updatedHabit, completedToday: false, streakInfo }, error: null };
  } catch (error) {
    console.error('Error unchecking habit:', error);
    return { data: null, error };
  }
};

/**
 * Calculate current streak for a habit
 *
 * @param {string} habitId - Habit ID
 * @returns {Promise<{currentStreak: number, lastCompleted: Date|null}>}
 */
export const calculateStreak = async (habitId) => {
  try {
    // Get all logs ordered by date descending
    const { data: logs, error } = await supabase
      .from('vision_habit_logs')
      .select('completed_at')
      .eq('habit_id', habitId)
      .order('completed_at', { ascending: false })
      .limit(365); // Check up to 1 year

    if (error) throw error;

    if (!logs || logs.length === 0) {
      return { currentStreak: 0, lastCompleted: null };
    }

    // Calculate streak (consecutive days)
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Create set of completed dates for quick lookup
    const completedDates = new Set(
      logs.map((log) => new Date(log.completed_at).toISOString().split('T')[0])
    );

    // Check consecutive days starting from today
    const checkDate = new Date(today);
    const todayStr = today.toISOString().split('T')[0];

    // If not completed today, check if completed yesterday (streak may still be active)
    if (!completedDates.has(todayStr)) {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    // Count consecutive days
    while (completedDates.has(checkDate.toISOString().split('T')[0])) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }

    return {
      currentStreak: streak,
      lastCompleted: logs[0] ? new Date(logs[0].completed_at) : null,
    };
  } catch (error) {
    console.error('Error calculating streak:', error);
    return { currentStreak: 0, lastCompleted: null };
  }
};

/**
 * Get streak history for calendar display
 *
 * @param {string} habitId - Habit ID
 * @param {number} days - Number of days to fetch
 * @returns {Promise<{data: Object, error: Error|null}>}
 */
export const getStreakHistory = async (habitId, days = 30) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data: logs, error } = await supabase
      .from('vision_habit_logs')
      .select('completed_at')
      .eq('habit_id', habitId)
      .gte('completed_at', startDate.toISOString())
      .order('completed_at', { ascending: true });

    if (error) throw error;

    // Convert to date map for easy lookup
    const dateMap = {};
    for (const log of logs || []) {
      const dateStr = new Date(log.completed_at).toISOString().split('T')[0];
      dateMap[dateStr] = true;
    }

    return { data: dateMap, error: null };
  } catch (error) {
    console.error('Error fetching streak history:', error);
    return { data: {}, error };
  }
};

/**
 * Get habits summary statistics
 *
 * @param {string} userId - User ID
 * @returns {Promise<Object>}
 */
export const getHabitsSummary = async (userId) => {
  try {
    const { data: habits, error } = await supabase
      .from('vision_habits')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true);

    if (error) throw error;

    // Get today's completions
    const today = new Date().toISOString().split('T')[0];
    const habitIds = (habits || []).map((h) => h.id);

    let todayCompleted = 0;
    if (habitIds.length > 0) {
      const { count } = await supabase
        .from('vision_habit_logs')
        .select('*', { count: 'exact', head: true })
        .in('habit_id', habitIds)
        .gte('completed_at', `${today}T00:00:00`)
        .lte('completed_at', `${today}T23:59:59`);

      todayCompleted = count || 0;
    }

    const summary = {
      total: habits?.length || 0,
      completedToday: todayCompleted,
      completionRate: habits?.length > 0 ? Math.round((todayCompleted / habits.length) * 100) : 0,
      totalCompletions: habits?.reduce((sum, h) => sum + (h.total_completions || 0), 0) || 0,
      longestStreak: habits?.reduce((max, h) => Math.max(max, h.longest_streak || 0), 0) || 0,
      activeStreaks: habits?.filter((h) => (h.current_streak || 0) > 0).length || 0,
    };

    return { data: summary, error: null };
  } catch (error) {
    console.error('Error getting habits summary:', error);
    return { data: null, error };
  }
};

/**
 * Get today's habits with completion status
 *
 * @param {string} userId - User ID
 * @returns {Promise<{data: Array, completed: number, total: number, error: Error|null}>}
 */
export const getTodaysHabits = async (userId) => {
  try {
    const result = await getHabits(userId, { includeInactive: false });

    if (result.error) throw result.error;

    const habits = result.data || [];
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0-6

    // Filter habits that are scheduled for today
    const todaysHabits = habits.filter((habit) => {
      if (habit.frequency === 'daily') return true;
      if (habit.frequency === 'weekdays') return dayOfWeek >= 1 && dayOfWeek <= 5;
      if (habit.frequency === 'weekends') return dayOfWeek === 0 || dayOfWeek === 6;
      if (habit.frequency === 'custom' && habit.custom_days) {
        return habit.custom_days.includes(dayOfWeek);
      }
      return true;
    });

    const completed = todaysHabits.filter((h) => h.completedToday).length;

    return {
      data: todaysHabits,
      completed,
      total: todaysHabits.length,
      error: null,
    };
  } catch (error) {
    console.error('Error getting today\'s habits:', error);
    return { data: [], completed: 0, total: 0, error };
  }
};

export default {
  HABIT_FREQUENCIES,
  HABIT_CATEGORIES,
  HABIT_XP,
  getHabits,
  getHabitById,
  createHabit,
  updateHabit,
  deleteHabit,
  checkHabit,
  uncheckHabit,
  calculateStreak,
  getStreakHistory,
  getHabitsSummary,
  getTodaysHabits,
};
