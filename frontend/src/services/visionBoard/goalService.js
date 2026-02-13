/**
 * Vision Board - Goal Service
 * Handles goal CRUD, progress tracking, milestones, and XP
 *
 * @fileoverview Complete goal management with tier-based quotas
 */

import { supabase } from '../../lib/supabaseClient';
import { checkGoalQuota, getEffectiveTier } from './tierService';

/**
 * Life Areas for goal categorization
 */
export const LIFE_AREAS = [
  { key: 'personal', label: 'Personal Growth', icon: 'User', color: '#6A5BFF' },
  { key: 'career', label: 'Career & Work', icon: 'Briefcase', color: '#FFBD59' },
  { key: 'health', label: 'Health & Fitness', icon: 'Heart', color: '#FF6B6B' },
  { key: 'finance', label: 'Finance', icon: 'DollarSign', color: '#3AF7A6' },
  { key: 'relationships', label: 'Relationships', icon: 'Users', color: '#FF69B4' },
  { key: 'education', label: 'Education', icon: 'Book', color: '#00F0FF' },
  { key: 'spiritual', label: 'Spiritual', icon: 'Star', color: '#A855F7' },
  { key: 'trading', label: 'Trading', icon: 'TrendingUp', color: '#FFBD59' },
];

/**
 * XP Rewards configuration
 */
export const XP_REWARDS = {
  createGoal: 10,
  completeAction: 15,
  completeMilestone: 50,
  completeGoal: 100,
  streakBonus7: 25,
  streakBonus30: 100,
  dailyProgress: 5,
};

/**
 * Progress calculation weights
 */
export const PROGRESS_WEIGHTS = {
  actions: 0.6,      // 60% from actions
  affirmations: 0.2, // 20% from affirmations
  habits: 0.2,       // 20% from habits
};

/**
 * Goal status options
 */
export const GOAL_STATUS = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  PAUSED: 'paused',
  ARCHIVED: 'archived',
};

/**
 * Get all goals for a user
 *
 * @param {string} userId - User ID
 * @param {Object} options - Filter options
 * @returns {Promise<{data: Array, error: Error|null}>}
 */
export const getGoals = async (userId, options = {}) => {
  const {
    lifeArea = null,
    status = null,
    includeArchived = false,
    limit = 50,
    offset = 0,
  } = options;

  try {
    let query = supabase
      .from('vision_goals')
      .select(`
        *,
        milestones:vision_milestones(
          id, title, is_completed, completed_at, order_index
        ),
        actions:vision_actions(
          id, title, is_completed, completed_at, order_index
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (!includeArchived) {
      query = query.eq('is_archived', false);
    }

    if (lifeArea) {
      query = query.eq('life_area', lifeArea);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Calculate progress for each goal
    const goalsWithProgress = (data || []).map((goal) => ({
      ...goal,
      progress: calculateGoalProgress(goal),
      isOverdue: isGoalOverdue(goal),
    }));

    return { data: goalsWithProgress, error: null };
  } catch (error) {
    console.error('Error fetching goals:', error);
    return { data: [], error };
  }
};

/**
 * Get a single goal by ID
 *
 * @param {string} goalId - Goal ID
 * @param {string} userId - User ID for authorization
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export const getGoalById = async (goalId, userId) => {
  try {
    const { data, error } = await supabase
      .from('vision_goals')
      .select(`
        *,
        milestones:vision_milestones(
          id, title, description, is_completed, completed_at, order_index
        ),
        actions:vision_actions(
          id, title, description, is_completed, completed_at, due_date, order_index
        )
      `)
      .eq('id', goalId)
      .eq('user_id', userId)
      .single();

    if (error) throw error;

    if (data) {
      data.progress = calculateGoalProgress(data);
      data.isOverdue = isGoalOverdue(data);
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error fetching goal:', error);
    return { data: null, error };
  }
};

/**
 * Create a new goal with quota check
 *
 * @param {string} userId - User ID
 * @param {Object} goalData - Goal data
 * @param {string} tier - User's tier for quota check
 * @returns {Promise<{data: Object|null, error: Error|null, quotaExceeded?: boolean}>}
 */
export const createGoal = async (userId, goalData, tier) => {
  try {
    // Check quota first
    const quotaCheck = await checkGoalQuota(userId, tier);
    if (!quotaCheck.allowed) {
      return {
        data: null,
        error: new Error(quotaCheck.message),
        quotaExceeded: true,
      };
    }

    // Validate required fields
    if (!goalData.title?.trim()) {
      return { data: null, error: new Error('Goal title is required') };
    }

    // Prepare goal data
    const newGoal = {
      user_id: userId,
      title: goalData.title.trim(),
      description: goalData.description?.trim() || null,
      life_area: goalData.lifeArea || 'personal',
      target_date: goalData.targetDate || null,
      status: GOAL_STATUS.ACTIVE,
      is_archived: false,
      icon: goalData.icon || null,
      color: goalData.color || null,
      progress: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('vision_goals')
      .insert(newGoal)
      .select()
      .single();

    if (error) throw error;

    // Award XP for creating goal
    await awardXP(userId, XP_REWARDS.createGoal, 'goal_created', data.id);

    // Create initial milestones if provided
    if (goalData.milestones?.length > 0) {
      await createMilestones(data.id, goalData.milestones);
    }

    // Create initial actions if provided
    if (goalData.actions?.length > 0) {
      await createActions(data.id, goalData.actions);
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error creating goal:', error);
    return { data: null, error };
  }
};

/**
 * Update a goal
 *
 * @param {string} goalId - Goal ID
 * @param {Object} updates - Fields to update
 * @param {string} userId - User ID for authorization
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export const updateGoal = async (goalId, updates, userId) => {
  try {
    // Sanitize updates
    const allowedFields = [
      'title', 'description', 'life_area', 'target_date',
      'status', 'is_archived', 'icon', 'color', 'progress',
    ];

    const sanitizedUpdates = {};
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        sanitizedUpdates[field] = updates[field];
      }
    }
    sanitizedUpdates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('vision_goals')
      .update(sanitizedUpdates)
      .eq('id', goalId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error updating goal:', error);
    return { data: null, error };
  }
};

/**
 * Delete a goal (soft delete - archive)
 *
 * @param {string} goalId - Goal ID
 * @param {string} userId - User ID for authorization
 * @param {boolean} hardDelete - Permanently delete if true
 * @returns {Promise<{success: boolean, error: Error|null}>}
 */
export const deleteGoal = async (goalId, userId, hardDelete = false) => {
  try {
    if (hardDelete) {
      // Delete related records first
      await supabase.from('vision_milestones').delete().eq('goal_id', goalId);
      await supabase.from('vision_actions').delete().eq('goal_id', goalId);

      const { error } = await supabase
        .from('vision_goals')
        .delete()
        .eq('id', goalId)
        .eq('user_id', userId);

      if (error) throw error;
    } else {
      // Soft delete (archive)
      const { error } = await supabase
        .from('vision_goals')
        .update({
          is_archived: true,
          status: GOAL_STATUS.ARCHIVED,
          updated_at: new Date().toISOString(),
        })
        .eq('id', goalId)
        .eq('user_id', userId);

      if (error) throw error;
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Error deleting goal:', error);
    return { success: false, error };
  }
};

/**
 * Complete a goal and award XP
 *
 * @param {string} goalId - Goal ID
 * @param {string} userId - User ID
 * @returns {Promise<{data: Object|null, xpAwarded: number, error: Error|null}>}
 */
export const completeGoal = async (goalId, userId) => {
  try {
    const { data, error } = await supabase
      .from('vision_goals')
      .update({
        status: GOAL_STATUS.COMPLETED,
        progress: 100,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', goalId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    // Award XP for completing goal
    const xpAwarded = await awardXP(userId, XP_REWARDS.completeGoal, 'goal_completed', goalId);

    return { data, xpAwarded, error: null };
  } catch (error) {
    console.error('Error completing goal:', error);
    return { data: null, xpAwarded: 0, error };
  }
};

// ==================== MILESTONES ====================

/**
 * Create milestones for a goal
 *
 * @param {string} goalId - Goal ID
 * @param {Array} milestones - Milestone data array
 * @returns {Promise<{data: Array, error: Error|null}>}
 */
export const createMilestones = async (goalId, milestones) => {
  try {
    const milestonesData = milestones.map((m, index) => ({
      goal_id: goalId,
      title: m.title,
      description: m.description || null,
      order_index: m.orderIndex ?? index,
      is_completed: false,
      created_at: new Date().toISOString(),
    }));

    const { data, error } = await supabase
      .from('vision_milestones')
      .insert(milestonesData)
      .select();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error creating milestones:', error);
    return { data: [], error };
  }
};

/**
 * Toggle milestone completion
 *
 * @param {string} milestoneId - Milestone ID
 * @param {string} userId - User ID
 * @returns {Promise<{data: Object|null, xpAwarded: number, error: Error|null}>}
 */
export const toggleMilestone = async (milestoneId, userId) => {
  try {
    // Get current milestone state
    const { data: milestone, error: fetchError } = await supabase
      .from('vision_milestones')
      .select('*, goal:vision_goals!inner(user_id)')
      .eq('id', milestoneId)
      .single();

    if (fetchError) throw fetchError;

    // Verify ownership
    if (milestone.goal.user_id !== userId) {
      throw new Error('Unauthorized');
    }

    const newCompleted = !milestone.is_completed;

    const { data, error } = await supabase
      .from('vision_milestones')
      .update({
        is_completed: newCompleted,
        completed_at: newCompleted ? new Date().toISOString() : null,
      })
      .eq('id', milestoneId)
      .select()
      .single();

    if (error) throw error;

    // Award XP only when completing
    let xpAwarded = 0;
    if (newCompleted) {
      xpAwarded = await awardXP(userId, XP_REWARDS.completeMilestone, 'milestone_completed', milestoneId);
    }

    // Update goal progress
    await updateGoalProgress(milestone.goal_id);

    return { data, xpAwarded, error: null };
  } catch (error) {
    console.error('Error toggling milestone:', error);
    return { data: null, xpAwarded: 0, error };
  }
};

// ==================== ACTIONS ====================

/**
 * Create actions for a goal
 *
 * @param {string} goalId - Goal ID
 * @param {Array} actions - Action data array
 * @returns {Promise<{data: Array, error: Error|null}>}
 */
export const createActions = async (goalId, actions) => {
  try {
    const actionsData = actions.map((a, index) => ({
      goal_id: goalId,
      title: a.title,
      description: a.description || null,
      due_date: a.dueDate || null,
      order_index: a.orderIndex ?? index,
      is_completed: false,
      created_at: new Date().toISOString(),
    }));

    const { data, error } = await supabase
      .from('vision_actions')
      .insert(actionsData)
      .select();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error creating actions:', error);
    return { data: [], error };
  }
};

/**
 * Add a single action to a goal
 *
 * @param {string} goalId - Goal ID
 * @param {Object} actionData - Action data
 * @param {string} userId - User ID for authorization
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export const addAction = async (goalId, actionData, userId) => {
  try {
    // Verify goal ownership
    const { data: goal } = await supabase
      .from('vision_goals')
      .select('id, user_id')
      .eq('id', goalId)
      .eq('user_id', userId)
      .single();

    if (!goal) {
      throw new Error('Goal not found or unauthorized');
    }

    // Get current max order_index
    const { data: existingActions } = await supabase
      .from('vision_actions')
      .select('order_index')
      .eq('goal_id', goalId)
      .order('order_index', { ascending: false })
      .limit(1);

    const nextIndex = existingActions?.[0]?.order_index + 1 || 0;

    const { data, error } = await supabase
      .from('vision_actions')
      .insert({
        goal_id: goalId,
        title: actionData.title,
        description: actionData.description || null,
        due_date: actionData.dueDate || null,
        order_index: nextIndex,
        is_completed: false,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error adding action:', error);
    return { data: null, error };
  }
};

/**
 * Toggle action completion
 *
 * @param {string} actionId - Action ID
 * @param {string} userId - User ID
 * @returns {Promise<{data: Object|null, xpAwarded: number, error: Error|null}>}
 */
export const toggleAction = async (actionId, userId) => {
  try {
    // Get current action state
    const { data: action, error: fetchError } = await supabase
      .from('vision_actions')
      .select('*, goal:vision_goals!inner(id, user_id)')
      .eq('id', actionId)
      .single();

    if (fetchError) throw fetchError;

    // Verify ownership
    if (action.goal.user_id !== userId) {
      throw new Error('Unauthorized');
    }

    const newCompleted = !action.is_completed;

    const { data, error } = await supabase
      .from('vision_actions')
      .update({
        is_completed: newCompleted,
        completed_at: newCompleted ? new Date().toISOString() : null,
      })
      .eq('id', actionId)
      .select()
      .single();

    if (error) throw error;

    // Award XP only when completing
    let xpAwarded = 0;
    if (newCompleted) {
      xpAwarded = await awardXP(userId, XP_REWARDS.completeAction, 'action_completed', actionId);
    }

    // Update goal progress
    await updateGoalProgress(action.goal.id);

    return { data, xpAwarded, error: null };
  } catch (error) {
    console.error('Error toggling action:', error);
    return { data: null, xpAwarded: 0, error };
  }
};

/**
 * Delete an action
 *
 * @param {string} actionId - Action ID
 * @param {string} userId - User ID
 * @returns {Promise<{success: boolean, error: Error|null}>}
 */
export const deleteAction = async (actionId, userId) => {
  try {
    // Verify ownership through goal
    const { data: action } = await supabase
      .from('vision_actions')
      .select('goal:vision_goals!inner(user_id, id)')
      .eq('id', actionId)
      .single();

    if (!action || action.goal.user_id !== userId) {
      throw new Error('Unauthorized');
    }

    const { error } = await supabase
      .from('vision_actions')
      .delete()
      .eq('id', actionId);

    if (error) throw error;

    // Update goal progress
    await updateGoalProgress(action.goal.id);

    return { success: true, error: null };
  } catch (error) {
    console.error('Error deleting action:', error);
    return { success: false, error };
  }
};

// ==================== PROGRESS & XP ====================

/**
 * Calculate goal progress from actions, milestones
 *
 * @param {Object} goal - Goal with nested actions and milestones
 * @returns {number} Progress percentage (0-100)
 */
export const calculateGoalProgress = (goal) => {
  if (!goal) return 0;

  const actions = goal.actions || [];
  const milestones = goal.milestones || [];

  // If no trackable items, return stored progress
  if (actions.length === 0 && milestones.length === 0) {
    return goal.progress || 0;
  }

  // Calculate action progress (weighted 60%)
  let actionProgress = 0;
  if (actions.length > 0) {
    const completedActions = actions.filter((a) => a.is_completed).length;
    actionProgress = (completedActions / actions.length) * 100 * PROGRESS_WEIGHTS.actions;
  }

  // Calculate milestone progress (use remaining weight)
  let milestoneProgress = 0;
  if (milestones.length > 0) {
    const completedMilestones = milestones.filter((m) => m.is_completed).length;
    const milestoneWeight = 1 - PROGRESS_WEIGHTS.actions;
    milestoneProgress = (completedMilestones / milestones.length) * 100 * milestoneWeight;
  } else if (actions.length > 0) {
    // If no milestones, give actions full weight
    actionProgress = (actions.filter((a) => a.is_completed).length / actions.length) * 100;
    return Math.round(actionProgress);
  }

  return Math.round(actionProgress + milestoneProgress);
};

/**
 * Update goal progress in database
 *
 * @param {string} goalId - Goal ID
 * @returns {Promise<void>}
 */
export const updateGoalProgress = async (goalId) => {
  try {
    // Fetch goal with relations
    const { data: goal } = await supabase
      .from('vision_goals')
      .select(`
        *,
        milestones:vision_milestones(*),
        actions:vision_actions(*)
      `)
      .eq('id', goalId)
      .single();

    if (!goal) return;

    const progress = calculateGoalProgress(goal);

    await supabase
      .from('vision_goals')
      .update({
        progress,
        updated_at: new Date().toISOString(),
      })
      .eq('id', goalId);
  } catch (error) {
    console.error('Error updating goal progress:', error);
  }
};

/**
 * Award XP to user
 *
 * @param {string} userId - User ID
 * @param {number} amount - XP amount
 * @param {string} source - Source of XP (e.g., 'goal_completed')
 * @param {string} referenceId - Reference ID (e.g., goal ID)
 * @returns {Promise<number>} XP awarded
 */
export const awardXP = async (userId, amount, source, referenceId = null) => {
  try {
    // Update user stats
    const { data: stats } = await supabase
      .from('vision_user_stats')
      .select('total_xp')
      .eq('user_id', userId)
      .single();

    if (stats) {
      await supabase
        .from('vision_user_stats')
        .update({
          total_xp: (stats.total_xp || 0) + amount,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);
    } else {
      // Create stats record if doesn't exist
      await supabase
        .from('vision_user_stats')
        .insert({
          user_id: userId,
          total_xp: amount,
          current_streak: 0,
          longest_streak: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
    }

    // Log XP transaction (optional - if table exists)
    try {
      await supabase.from('xp_transactions').insert({
        user_id: userId,
        amount,
        source,
        reference_id: referenceId,
        created_at: new Date().toISOString(),
      });
    } catch {
      // XP transactions table may not exist
    }

    return amount;
  } catch (error) {
    console.error('Error awarding XP:', error);
    return 0;
  }
};

/**
 * Check if goal is overdue
 *
 * @param {Object} goal - Goal object
 * @returns {boolean}
 */
export const isGoalOverdue = (goal) => {
  if (!goal.target_date || goal.status === GOAL_STATUS.COMPLETED) {
    return false;
  }
  return new Date(goal.target_date) < new Date();
};

/**
 * Get goals summary statistics
 *
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Summary stats
 */
export const getGoalsSummary = async (userId) => {
  try {
    const { data: goals, error } = await supabase
      .from('vision_goals')
      .select('status, progress, life_area')
      .eq('user_id', userId)
      .eq('is_archived', false);

    if (error) throw error;

    const summary = {
      total: goals.length,
      active: goals.filter((g) => g.status === GOAL_STATUS.ACTIVE).length,
      completed: goals.filter((g) => g.status === GOAL_STATUS.COMPLETED).length,
      paused: goals.filter((g) => g.status === GOAL_STATUS.PAUSED).length,
      averageProgress: 0,
      byLifeArea: {},
    };

    if (goals.length > 0) {
      summary.averageProgress = Math.round(
        goals.reduce((sum, g) => sum + (g.progress || 0), 0) / goals.length
      );

      // Count by life area
      for (const goal of goals) {
        const area = goal.life_area || 'personal';
        summary.byLifeArea[area] = (summary.byLifeArea[area] || 0) + 1;
      }
    }

    return { data: summary, error: null };
  } catch (error) {
    console.error('Error getting goals summary:', error);
    return { data: null, error };
  }
};

export default {
  LIFE_AREAS,
  XP_REWARDS,
  PROGRESS_WEIGHTS,
  GOAL_STATUS,
  getGoals,
  getGoalById,
  createGoal,
  updateGoal,
  deleteGoal,
  completeGoal,
  createMilestones,
  toggleMilestone,
  createActions,
  addAction,
  toggleAction,
  deleteAction,
  calculateGoalProgress,
  updateGoalProgress,
  awardXP,
  isGoalOverdue,
  getGoalsSummary,
};
