/**
 * Action Service - Vision Board 2.0
 * CRUD operations for actions/tasks with action types and reset logic
 *
 * Action Types:
 * - one_time: Complete once, done forever
 * - daily: Reset every day at midnight
 * - weekly: Reset every 7 days
 * - monthly: Reset every 30 days
 * - custom: Reset based on recurrence_days
 *
 * Created: December 10, 2025
 * Updated: December 11, 2025 - Added action types and reset logic
 * Updated: December 14, 2025 - Added tier-based quota limits (per-goal)
 */

import { supabase } from './supabase';
import { calculateGoalProgress, addXPToUser, updateDailySummary, XP_REWARDS } from './goalService';
import TierService from './tierService';

// ============ CONSTANTS ============
const XP_PER_ACTION = 20;
const ACTION_TYPES = ['one_time', 'daily', 'weekly', 'monthly', 'custom'];

// ============ QUOTA CHECKING (PER-GOAL) ============
/**
 * Get count of actions for a specific goal
 * @param {string} goalId
 * @returns {Promise<number>}
 */
export const getActionsCountForGoal = async (goalId) => {
  try {
    const { count, error } = await supabase
      .from('vision_actions')
      .select('*', { count: 'exact', head: true })
      .eq('goal_id', goalId);

    if (error) throw error;
    return count || 0;
  } catch (err) {
    console.error('[actionService] getActionsCountForGoal error:', err);
    return 0;
  }
};

/**
 * Check if user can create more actions for a specific goal based on their tier
 * @param {string} userId
 * @param {string} goalId
 * @returns {Promise<Object>} - { canCreate, quota, upgradeInfo }
 */
export const checkActionQuotaForGoal = async (userId, goalId) => {
  try {
    // Get user tier with expiration check
    const tierInfo = await TierService.getUserTierWithExpiration(userId);
    const tier = tierInfo.tier;

    // Get current actions count for this goal
    const currentCount = await getActionsCountForGoal(goalId);

    // Check quota (actionsPerGoal limit)
    const quota = TierService.checkActionQuota(tier, currentCount);

    // Get upgrade info if at limit
    let upgradeInfo = null;
    if (!quota.canCreate && !quota.isUnlimited) {
      upgradeInfo = TierService.getVisionBoardUpgradeInfo(tier, 'action');
    }

    return {
      canCreate: quota.canCreate,
      quota,
      tierInfo,
      upgradeInfo,
      goalId,
    };
  } catch (err) {
    console.error('[actionService] checkActionQuotaForGoal error:', err);
    // Default to allowing creation on error
    return {
      canCreate: true,
      quota: { canCreate: true, remaining: -1, limit: -1, isUnlimited: true },
      tierInfo: { tier: 'FREE' },
      upgradeInfo: null,
      goalId,
    };
  }
};

// ============ CHECK AND RESET ACTIONS ============
/**
 * Check and reset actions that need to be reset based on their type
 * Called when app opens or comes to foreground on a new day
 */
export const checkAndResetActions = async (userId) => {
  if (!userId) {
    console.warn('[actionService] checkAndResetActions: No userId provided');
    return { success: false, resetCount: 0 };
  }

  try {
    // Try RPC function first (atomic reset)
    const { data, error } = await supabase
      .rpc('reset_user_actions', { p_user_id: userId });

    if (error) {
      console.error('[actionService] checkAndResetActions RPC error:', error);
      // Fallback to client-side reset
      return await clientSideReset(userId);
    }

    console.log('[actionService] Reset result:', data);
    return {
      success: true,
      resetCount: data?.reset_count || 0,
      resetDate: data?.reset_date,
    };
  } catch (err) {
    console.error('[actionService] checkAndResetActions error:', err);
    return { success: false, resetCount: 0 };
  }
};

/**
 * Fallback client-side reset if RPC fails
 */
const clientSideReset = async (userId) => {
  const today = new Date().toISOString().split('T')[0];

  try {
    // Fetch all non-one_time completed actions
    const { data: actions, error } = await supabase
      .from('vision_actions')
      .select('*')
      .eq('user_id', userId)
      .neq('action_type', 'one_time')
      .eq('is_completed', true);

    if (error) throw error;

    const actionsToReset = [];

    for (const action of actions || []) {
      const shouldReset = checkShouldReset(action, today);
      if (shouldReset) {
        actionsToReset.push(action.id);
      }
    }

    // Batch reset
    if (actionsToReset.length > 0) {
      const { error: updateError } = await supabase
        .from('vision_actions')
        .update({
          is_completed: false,
          last_reset_date: today,
        })
        .in('id', actionsToReset);

      if (updateError) throw updateError;
    }

    return { success: true, resetCount: actionsToReset.length };
  } catch (err) {
    console.error('[actionService] clientSideReset error:', err);
    return { success: false, resetCount: 0 };
  }
};

/**
 * Check if an action should be reset based on its type
 */
const checkShouldReset = (action, today) => {
  if (!action?.is_completed) return false;

  const lastReset = action.last_reset_date || action.created_at?.split('T')[0];
  const daysSinceReset = getDaysDiff(lastReset, today);

  switch (action.action_type) {
    case 'daily':
      return daysSinceReset >= 1;
    case 'weekly':
      return daysSinceReset >= 7;
    case 'monthly':
      return daysSinceReset >= 30;
    case 'custom':
      // recurrence_days is stored as INTEGER[] array in database
      const days = Array.isArray(action.recurrence_days)
        ? action.recurrence_days[0]
        : action.recurrence_days;
      return daysSinceReset >= (days || 1);
    default:
      return false;
  }
};

/**
 * Calculate days difference between two dates
 */
const getDaysDiff = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2 - d1);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// ============ GET ACTIONS GROUPED BY TYPE ============
/**
 * Get actions for a goal, grouped by type
 */
export const getGoalActionsGrouped = async (userId, goalId) => {
  if (!userId || !goalId) {
    console.warn('[actionService] getGoalActionsGrouped: Missing params');
    return null;
  }

  try {
    // Try RPC first
    const { data, error } = await supabase
      .rpc('get_goal_actions_grouped', {
        p_user_id: userId,
        p_goal_id: goalId,
      });

    if (error) {
      console.error('[actionService] getGoalActionsGrouped RPC error:', error);
      // Fallback to manual query
      return await manualGetGoalActions(userId, goalId);
    }

    return data;
  } catch (err) {
    console.error('[actionService] getGoalActionsGrouped error:', err);
    return null;
  }
};

/**
 * Manual fallback for getting grouped actions
 */
const manualGetGoalActions = async (userId, goalId) => {
  try {
    const { data: actions, error } = await supabase
      .from('vision_actions')
      .select('*')
      .eq('user_id', userId)
      .eq('goal_id', goalId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Group by type
    const grouped = {
      daily: [],
      weekly: [],
      monthly: [],
      one_time_pending: [],
      one_time_completed: [],
    };

    for (const action of actions || []) {
      const actionType = action.action_type || 'daily';

      if (actionType === 'one_time') {
        if (action.is_completed) {
          grouped.one_time_completed.push(action);
        } else {
          grouped.one_time_pending.push(action);
        }
      } else if (grouped[actionType]) {
        grouped[actionType].push(action);
      } else {
        // Default to daily for unknown types
        grouped.daily.push(action);
      }
    }

    return grouped;
  } catch (err) {
    console.error('[actionService] manualGetGoalActions error:', err);
    return null;
  }
};

// ============ GET ACTION STATS ============
/**
 * Get action completion statistics for a period
 */
export const getActionStats = async (userId, days = 7) => {
  if (!userId) {
    console.warn('[actionService] getActionStats: No userId');
    return null;
  }

  try {
    const { data, error } = await supabase
      .rpc('get_action_stats', {
        p_user_id: userId,
        p_days: days,
      });

    if (error) {
      console.error('[actionService] getActionStats RPC error:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('[actionService] getActionStats error:', err);
    return null;
  }
};

// ============ GET ACTION HISTORY ============
/**
 * Get completion history for an action
 */
export const getActionHistory = async (userId, actionId, limit = 30) => {
  if (!userId || !actionId) {
    console.warn('[actionService] getActionHistory: Missing params');
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('vision_action_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('action_id', actionId)
      .order('completed_date', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return data || [];
  } catch (err) {
    console.error('[actionService] getActionHistory error:', err);
    return [];
  }
};

// ============ GET ACTIONS ============
export const getActions = async (userId, options = {}) => {
  try {
    let query = supabase
      .from('vision_actions')
      .select('*, goal:vision_goals(id, title, color)')
      .eq('user_id', userId);

    if (options.goalId) {
      query = query.eq('goal_id', options.goalId);
    }
    if (options.date) {
      query = query.eq('due_date', options.date);
    }
    if (options.isCompleted !== undefined) {
      query = query.eq('is_completed', options.isCompleted);
    }

    query = query.order('due_date', { ascending: true });

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('[actionService] getActions error:', err);
    return [];
  }
};

// ============ GET TODAY'S ACTIONS ============
export const getTodayActions = async (userId) => {
  const today = new Date().toISOString().split('T')[0];
  return getActions(userId, { date: today });
};

// ============ GET PENDING ACTIONS ============
export const getPendingActions = async (userId) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('vision_actions')
      .select('*, goal:vision_goals(id, title, color)')
      .eq('user_id', userId)
      .eq('is_completed', false)
      .lte('due_date', today)
      .order('due_date', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('[actionService] getPendingActions error:', err);
    return [];
  }
};

// ============ GET ACTIONS SUMMARY ============
export const getActionsSummary = async (userId) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const { data: todayActions, error } = await supabase
      .from('vision_actions')
      .select('is_completed')
      .eq('user_id', userId)
      .eq('due_date', today);

    if (error) throw error;

    const total = todayActions?.length || 0;
    const completed = todayActions?.filter(a => a.is_completed).length || 0;

    return { total, completed };
  } catch (err) {
    console.error('[actionService] getActionsSummary error:', err);
    return { total: 0, completed: 0 };
  }
};

// ============ CREATE ACTION ============
/**
 * Create a new action with tier quota checking (per-goal limit)
 * @param {string} userId
 * @param {Object} actionData
 * @param {Object} options - { skipQuotaCheck: boolean }
 * @returns {Promise<Object>} - Created action or error with quota info
 */
export const createAction = async (userId, actionData, options = {}) => {
  try {
    // Check quota if action belongs to a goal (unless explicitly skipped)
    if (actionData.goalId && !options.skipQuotaCheck) {
      const quotaResult = await checkActionQuotaForGoal(userId, actionData.goalId);

      if (!quotaResult.canCreate) {
        // Return quota error with upgrade info
        const error = new Error('QUOTA_EXCEEDED');
        error.code = 'QUOTA_EXCEEDED';
        error.quota = quotaResult.quota;
        error.upgradeInfo = quotaResult.upgradeInfo;
        error.message = quotaResult.upgradeInfo?.message ||
          `Bạn đã đạt giới hạn ${quotaResult.quota.limit} hành động/mục tiêu. Vui lòng nâng cấp để tạo thêm!`;
        throw error;
      }
    }

    // Prepare recurrence_days as array (PostgreSQL INTEGER[] type)
    let recurrenceDays = null;
    if (actionData.recurrenceDays) {
      recurrenceDays = Array.isArray(actionData.recurrenceDays)
        ? actionData.recurrenceDays
        : [actionData.recurrenceDays];
    }

    const { data, error } = await supabase
      .from('vision_actions')
      .insert({
        user_id: userId,
        goal_id: actionData.goalId || null,
        title: actionData.title,
        description: actionData.description || '',
        due_date: actionData.dueDate || new Date().toISOString().split('T')[0],
        recurrence: actionData.recurrence || 'once',
        recurrence_days: recurrenceDays,
        weight: actionData.weight || 1,
        xp_reward: actionData.xpReward || XP_REWARDS.action_complete,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('[actionService] createAction error:', err);
    throw err;
  }
};

// ============ UPDATE ACTION ============
export const updateAction = async (actionId, updates) => {
  try {
    const { data, error } = await supabase
      .from('vision_actions')
      .update(updates)
      .eq('id', actionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('[actionService] updateAction error:', err);
    throw err;
  }
};

// ============ COMPLETE ACTION ============
export const completeAction = async (actionId, userId) => {
  try {
    // Get action
    const { data: action } = await supabase
      .from('vision_actions')
      .select('*')
      .eq('id', actionId)
      .single();

    if (!action) throw new Error('Action not found');

    const now = new Date();

    // Update action
    await supabase
      .from('vision_actions')
      .update({
        is_completed: true,
        completed_at: now.toISOString(),
        last_completed_at: now.toISOString(),
      })
      .eq('id', actionId);

    // Award XP
    const xpEarned = action.xp_reward || XP_REWARDS.action_complete;
    await addXPToUser(userId, xpEarned);

    // Update goal progress if linked
    if (action.goal_id) {
      await calculateGoalProgress(action.goal_id);
    }

    // Update daily summary
    await updateDailySummary(userId, {
      actions_completed: 1,
    });

    // Handle recurring actions
    if (action.recurrence !== 'once') {
      await handleRecurringAction(action);
    }

    return { action, xpEarned };
  } catch (err) {
    console.error('[actionService] completeAction error:', err);
    throw err;
  }
};

// ============ UNCOMPLETE ACTION ============
export const uncompleteAction = async (actionId) => {
  try {
    await supabase
      .from('vision_actions')
      .update({
        is_completed: false,
        completed_at: null,
      })
      .eq('id', actionId);

    // Get action to recalculate goal
    const { data: action } = await supabase
      .from('vision_actions')
      .select('goal_id')
      .eq('id', actionId)
      .single();

    if (action?.goal_id) {
      await calculateGoalProgress(action.goal_id);
    }

    return true;
  } catch (err) {
    console.error('[actionService] uncompleteAction error:', err);
    throw err;
  }
};

// ============ DELETE ACTION ============
export const deleteAction = async (actionId) => {
  try {
    const { data: action } = await supabase
      .from('vision_actions')
      .select('goal_id')
      .eq('id', actionId)
      .single();

    await supabase
      .from('vision_actions')
      .delete()
      .eq('id', actionId);

    // Recalculate goal progress
    if (action?.goal_id) {
      await calculateGoalProgress(action.goal_id);
    }

    return true;
  } catch (err) {
    console.error('[actionService] deleteAction error:', err);
    throw err;
  }
};

// ============ HANDLE RECURRING ============
const handleRecurringAction = async (action) => {
  // For recurring actions, create next occurrence
  let nextDate = new Date(action.due_date);

  switch (action.recurrence) {
    case 'daily':
      nextDate.setDate(nextDate.getDate() + 1);
      break;
    case 'weekly':
      nextDate.setDate(nextDate.getDate() + 7);
      break;
    case 'monthly':
      nextDate.setMonth(nextDate.getMonth() + 1);
      break;
    default:
      return; // 'once' or unknown - don't create next
  }

  // Reset for next occurrence
  await supabase
    .from('vision_actions')
    .update({
      is_completed: false,
      completed_at: null,
      due_date: nextDate.toISOString().split('T')[0],
    })
    .eq('id', action.id);
};

// ============ TOGGLE ACTION ============
export const toggleAction = async (actionId, userId) => {
  try {
    const { data: action } = await supabase
      .from('vision_actions')
      .select('is_completed')
      .eq('id', actionId)
      .single();

    if (!action) throw new Error('Action not found');

    if (action.is_completed) {
      return await uncompleteAction(actionId);
    } else {
      return await completeAction(actionId, userId);
    }
  } catch (err) {
    console.error('[actionService] toggleAction error:', err);
    throw err;
  }
};

// ============ CREATE ACTION WITH TYPE ============
/**
 * Create a new action with action_type support and tier quota checking
 * @param {string} userId
 * @param {string} goalId
 * @param {Object} actionData
 * @param {Object} options - { skipQuotaCheck: boolean }
 * @returns {Promise<Object>} - { success, action } or { success: false, error, quota }
 */
export const createActionWithType = async (userId, goalId, actionData, options = {}) => {
  if (!userId || !goalId || !actionData?.title) {
    console.warn('[actionService] createActionWithType: Missing required params');
    return { success: false };
  }

  const today = new Date().toISOString().split('T')[0];

  try {
    // Check quota first (unless explicitly skipped)
    if (!options.skipQuotaCheck) {
      const quotaResult = await checkActionQuotaForGoal(userId, goalId);

      if (!quotaResult.canCreate) {
        return {
          success: false,
          error: 'QUOTA_EXCEEDED',
          message: quotaResult.upgradeInfo?.message ||
            `Bạn đã đạt giới hạn ${quotaResult.quota.limit} hành động/mục tiêu. Vui lòng nâng cấp để tạo thêm!`,
          quota: quotaResult.quota,
          upgradeInfo: quotaResult.upgradeInfo,
        };
      }
    }

    // Prepare recurrence_days as array (PostgreSQL INTEGER[] type)
    let recurrenceDays = null;
    if (actionData.recurrence_days) {
      recurrenceDays = Array.isArray(actionData.recurrence_days)
        ? actionData.recurrence_days
        : [actionData.recurrence_days];
    }

    const { data, error } = await supabase
      .from('vision_actions')
      .insert({
        user_id: userId,
        goal_id: goalId,
        title: actionData.title.trim(),
        description: actionData.description || '',
        action_type: actionData.action_type || 'daily',
        recurrence_days: recurrenceDays,
        is_completed: false,
        last_reset_date: today,
        due_date: actionData.due_date || today,
        xp_reward: actionData.xp_reward || XP_PER_ACTION,
      })
      .select()
      .single();

    if (error) throw error;

    return { success: true, action: data };
  } catch (err) {
    console.error('[actionService] createActionWithType error:', err);
    return { success: false, error: err.message };
  }
};

// ============ COMPLETE ACTION WITH XP LOG ============
/**
 * Complete action and log XP (prevents duplicate XP for same day)
 */
export const completeActionWithLog = async (userId, actionId, xpAmount = XP_PER_ACTION) => {
  if (!userId || !actionId) {
    console.warn('[actionService] completeActionWithLog: Missing params');
    return { success: false, xpEarned: 0 };
  }

  const today = new Date().toISOString().split('T')[0];

  try {
    // Try RPC function
    const { data, error } = await supabase
      .rpc('complete_action_with_xp', {
        p_user_id: userId,
        p_action_id: actionId,
        p_xp_amount: xpAmount,
      });

    if (error) {
      console.error('[actionService] completeActionWithLog RPC error:', error);
      // Fallback to simple complete
      return await completeAction(actionId, userId);
    }

    return {
      success: data?.success || false,
      alreadyLogged: data?.already_logged || false,
      xpEarned: data?.xp_earned || 0,
      goalId: data?.goal_id,
    };
  } catch (err) {
    console.error('[actionService] completeActionWithLog error:', err);
    return { success: false, xpEarned: 0 };
  }
};

// ============ UNCOMPLETE ACTION WITH LOG ============
/**
 * Uncomplete action and refund XP if logged today
 */
export const uncompleteActionWithLog = async (userId, actionId) => {
  if (!userId || !actionId) {
    console.warn('[actionService] uncompleteActionWithLog: Missing params');
    return { success: false };
  }

  try {
    // Try RPC function
    const { data, error } = await supabase
      .rpc('uncomplete_action', {
        p_user_id: userId,
        p_action_id: actionId,
      });

    if (error) {
      console.error('[actionService] uncompleteActionWithLog RPC error:', error);
      // Fallback to simple uncomplete
      await uncompleteAction(actionId);
      return { success: true };
    }

    return { success: data?.success || false };
  } catch (err) {
    console.error('[actionService] uncompleteActionWithLog error:', err);
    return { success: false };
  }
};

// ============ TOGGLE ACTION WITH LOG ============
/**
 * Toggle action completion status with XP logging
 */
export const toggleActionWithLog = async (userId, actionId, currentlyCompleted) => {
  if (currentlyCompleted) {
    return await uncompleteActionWithLog(userId, actionId);
  } else {
    return await completeActionWithLog(userId, actionId);
  }
};

export default {
  // Quota functions (per-goal)
  getActionsCountForGoal,
  checkActionQuotaForGoal,
  // Original functions
  getActions,
  getTodayActions,
  getPendingActions,
  getActionsSummary,
  createAction,
  updateAction,
  completeAction,
  uncompleteAction,
  deleteAction,
  toggleAction,
  // New functions for action types
  checkAndResetActions,
  getGoalActionsGrouped,
  getActionStats,
  getActionHistory,
  createActionWithType,
  completeActionWithLog,
  uncompleteActionWithLog,
  toggleActionWithLog,
};
