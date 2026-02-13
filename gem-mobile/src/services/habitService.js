/**
 * Habit Service - Vision Board 2.0
 * CRUD operations for habits with streak tracking
 * Created: December 10, 2025
 * Updated: December 14, 2025 - Added tier-based quota limits
 */

import { supabase } from './supabase';
import { addXPToUser, updateDailySummary, XP_REWARDS } from './goalService';
import TierService from './tierService';

// ============ ERROR LOGGING HELPER ============
// Supabase errors are objects that don't serialize well in React Native console
const formatSupabaseError = (error) => {
  if (!error) return 'Unknown error';
  if (typeof error === 'string') return error;
  const parts = [];
  if (error.message) parts.push(`message: ${error.message}`);
  if (error.code) parts.push(`code: ${error.code}`);
  if (error.details) parts.push(`details: ${error.details}`);
  if (error.hint) parts.push(`hint: ${error.hint}`);
  return parts.length > 0 ? parts.join(', ') : JSON.stringify(error);
};

// ============ QUOTA CHECKING ============
/**
 * Get current count of user's habits for quota checking
 * @param {string} userId
 * @returns {Promise<number>}
 */
export const getHabitsCount = async (userId) => {
  try {
    const { count, error } = await supabase
      .from('vision_habits')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (error) throw error;
    return count || 0;
  } catch (err) {
    console.error('[habitService] getHabitsCount error:', formatSupabaseError(err));
    return 0;
  }
};

/**
 * Check if user can create more habits based on their tier
 * @param {string} userId
 * @returns {Promise<Object>} - { canCreate, quota, upgradeInfo }
 */
export const checkHabitQuota = async (userId) => {
  try {
    // Get user tier with expiration check
    const tierInfo = await TierService.getUserTierWithExpiration(userId);
    const tier = tierInfo.tier;

    // Get current habits count
    const currentCount = await getHabitsCount(userId);

    // Check quota
    const quota = TierService.checkHabitQuota(tier, currentCount);

    // Get upgrade info if at limit
    let upgradeInfo = null;
    if (!quota.canCreate && !quota.isUnlimited) {
      upgradeInfo = TierService.getVisionBoardUpgradeInfo(tier, 'habit');
    }

    return {
      canCreate: quota.canCreate,
      quota,
      tierInfo,
      upgradeInfo,
    };
  } catch (err) {
    console.error('[habitService] checkHabitQuota error:', formatSupabaseError(err));
    // Default to allowing creation on error
    return {
      canCreate: true,
      quota: { canCreate: true, remaining: -1, limit: -1, isUnlimited: true },
      tierInfo: { tier: 'FREE' },
      upgradeInfo: null,
    };
  }
};

// ============ GET HABITS ============
export const getHabits = async (userId, options = {}) => {
  try {
    let query = supabase
      .from('vision_habits')
      .select('*, goal:vision_goals(id, title, color)')
      .eq('user_id', userId);

    if (options.goalId) {
      query = query.eq('goal_id', options.goalId);
    }
    if (options.lifeArea) {
      query = query.eq('life_area', options.lifeArea);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('[habitService] getHabits error:', formatSupabaseError(err));
    return [];
  }
};

// ============ GET TODAY'S HABITS ============
export const getTodayHabits = async (userId) => {
  try {
    const habits = await getHabits(userId);
    const today = new Date().toISOString().split('T')[0];

    return Promise.all(habits.map(async (habit) => {
      const { data } = await supabase
        .from('vision_habit_logs')
        .select('*')
        .eq('habit_id', habit.id)
        .eq('log_date', today)
        .single();

      return {
        ...habit,
        isCompletedToday: !!data,
        todayLog: data,
      };
    }));
  } catch (err) {
    console.error('[habitService] getTodayHabits error:', formatSupabaseError(err));
    return [];
  }
};

// ============ GET HABITS SUMMARY ============
export const getHabitsSummary = async (userId) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Get total habits
    const { data: habits } = await supabase
      .from('vision_habits')
      .select('id')
      .eq('user_id', userId);

    const total = habits?.length || 0;

    // Get today's completed
    const { count } = await supabase
      .from('vision_habit_logs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('log_date', today);

    return {
      total,
      completed: count || 0,
    };
  } catch (err) {
    console.error('[habitService] getHabitsSummary error:', formatSupabaseError(err));
    return { total: 0, completed: 0 };
  }
};

// ============ CREATE HABIT ============
/**
 * Create a new habit with tier quota checking
 * @param {string} userId
 * @param {Object} habitData
 * @param {Object} options - { skipQuotaCheck: boolean }
 * @returns {Promise<Object>} - Created habit or error with quota info
 */
export const createHabit = async (userId, habitData, options = {}) => {
  try {
    // Check quota first (unless explicitly skipped, e.g., for admin)
    if (!options.skipQuotaCheck) {
      const quotaResult = await checkHabitQuota(userId);

      if (!quotaResult.canCreate) {
        // Return quota error with upgrade info
        const error = new Error('QUOTA_EXCEEDED');
        error.code = 'QUOTA_EXCEEDED';
        error.quota = quotaResult.quota;
        error.upgradeInfo = quotaResult.upgradeInfo;
        error.message = quotaResult.upgradeInfo?.message ||
          `Bạn đã đạt giới hạn ${quotaResult.quota.limit} thói quen. Vui lòng nâng cấp để tạo thêm!`;
        throw error;
      }
    }

    const { data, error } = await supabase
      .from('vision_habits')
      .insert({
        user_id: userId,
        goal_id: habitData.goalId || null,
        title: habitData.title,
        description: habitData.description || '',
        frequency: habitData.frequency || 'daily',
        target_streak: habitData.targetStreak || 30,
        life_area: habitData.lifeArea || null,
        icon: habitData.icon || 'check-circle',
        color: habitData.color || '#4CAF50',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('[habitService] createHabit error:', formatSupabaseError(err));
    throw err;
  }
};

// ============ UPDATE HABIT ============
export const updateHabit = async (habitId, updates) => {
  try {
    const { data, error } = await supabase
      .from('vision_habits')
      .update(updates)
      .eq('id', habitId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('[habitService] updateHabit error:', formatSupabaseError(err));
    throw err;
  }
};

// ============ CHECK HABIT ============
export const checkHabit = async (habitId, userId) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Check if already logged today
    const { data: existing } = await supabase
      .from('vision_habit_logs')
      .select('*')
      .eq('habit_id', habitId)
      .eq('log_date', today)
      .single();

    if (existing) {
      throw new Error('Habit already checked today');
    }

    // Get habit
    const { data: habit } = await supabase
      .from('vision_habits')
      .select('*')
      .eq('id', habitId)
      .single();

    if (!habit) throw new Error('Habit not found');

    // Calculate new streak
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const { data: yesterdayLog } = await supabase
      .from('vision_habit_logs')
      .select('*')
      .eq('habit_id', habitId)
      .eq('log_date', yesterdayStr)
      .single();

    const newStreak = yesterdayLog ? (habit.current_streak || 0) + 1 : 1;
    const newBestStreak = Math.max(habit.best_streak || 0, newStreak);

    // Log today
    await supabase
      .from('vision_habit_logs')
      .insert({
        habit_id: habitId,
        user_id: userId,
        log_date: today,
      });

    // Update habit streak
    await supabase
      .from('vision_habits')
      .update({
        current_streak: newStreak,
        best_streak: newBestStreak,
        last_checked_at: new Date().toISOString(),
      })
      .eq('id', habitId);

    // Calculate XP with streak bonuses
    let xpEarned = XP_REWARDS.habit_check;
    let streakBonus = null;

    if (newStreak === 7) {
      xpEarned += XP_REWARDS.habit_streak_7;
      streakBonus = { days: 7, bonus: XP_REWARDS.habit_streak_7 };
    }
    if (newStreak === 30) {
      xpEarned += XP_REWARDS.habit_streak_30;
      streakBonus = { days: 30, bonus: XP_REWARDS.habit_streak_30 };
    }

    await addXPToUser(userId, xpEarned);

    // Update daily summary
    await updateDailySummary(userId, {
      habits_completed: 1,
    });

    return {
      newStreak,
      newBestStreak,
      xpEarned,
      streakBonus,
    };
  } catch (err) {
    console.error('[habitService] checkHabit error:', formatSupabaseError(err));
    throw err;
  }
};

// ============ UNCHECK HABIT ============
export const uncheckHabit = async (habitId, userId) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Delete today's log
    await supabase
      .from('vision_habit_logs')
      .delete()
      .eq('habit_id', habitId)
      .eq('log_date', today);

    // Recalculate streak - complex logic, simplified here
    // For now, just decrement current streak
    const { data: habit } = await supabase
      .from('vision_habits')
      .select('current_streak')
      .eq('id', habitId)
      .single();

    await supabase
      .from('vision_habits')
      .update({
        current_streak: Math.max(0, (habit?.current_streak || 1) - 1),
      })
      .eq('id', habitId);

    return true;
  } catch (err) {
    console.error('[habitService] uncheckHabit error:', formatSupabaseError(err));
    throw err;
  }
};

// ============ DELETE HABIT ============
export const deleteHabit = async (habitId) => {
  try {
    // Delete logs first
    await supabase
      .from('vision_habit_logs')
      .delete()
      .eq('habit_id', habitId);

    // Delete habit
    await supabase
      .from('vision_habits')
      .delete()
      .eq('id', habitId);

    return true;
  } catch (err) {
    console.error('[habitService] deleteHabit error:', formatSupabaseError(err));
    throw err;
  }
};

// ============ GET HABIT BY ID ============
export const getHabitById = async (habitId) => {
  try {
    const { data, error } = await supabase
      .from('vision_habits')
      .select('*, goal:vision_goals(id, title, color)')
      .eq('id', habitId)
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('[habitService] getHabitById error:', formatSupabaseError(err));
    return null;
  }
};

// ============ TOGGLE HABIT ============
export const toggleHabit = async (habitId, userId) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Check if already logged today
    const { data: existing } = await supabase
      .from('vision_habit_logs')
      .select('*')
      .eq('habit_id', habitId)
      .eq('log_date', today)
      .single();

    if (existing) {
      return await uncheckHabit(habitId, userId);
    } else {
      return await checkHabit(habitId, userId);
    }
  } catch (err) {
    console.error('[habitService] toggleHabit error:', formatSupabaseError(err));
    throw err;
  }
};

// ============ GET HABIT STREAK HISTORY ============
export const getHabitStreakHistory = async (habitId, days = 30) => {
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('vision_habit_logs')
      .select('log_date')
      .eq('habit_id', habitId)
      .gte('log_date', startDate.toISOString().split('T')[0])
      .lte('log_date', endDate.toISOString().split('T')[0])
      .order('log_date', { ascending: true });

    if (error) throw error;

    // Create a map of completed dates
    const completedDates = new Set(data?.map(log => log.log_date) || []);

    // Generate array of dates with completion status
    const history = [];
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      history.push({
        date: dateStr,
        completed: completedDates.has(dateStr),
      });
    }

    return history;
  } catch (err) {
    console.error('[habitService] getHabitStreakHistory error:', formatSupabaseError(err));
    return [];
  }
};

export default {
  // Quota functions
  getHabitsCount,
  checkHabitQuota,
  // CRUD
  getHabits,
  getTodayHabits,
  getHabitsSummary,
  createHabit,
  updateHabit,
  checkHabit,
  uncheckHabit,
  deleteHabit,
  getHabitById,
  toggleHabit,
  getHabitStreakHistory,
};
