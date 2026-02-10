/**
 * Goal Service - Vision Board 2.0
 * CRUD operations and progress calculation for goals
 * Created: December 10, 2025
 * Updated: December 14, 2025 - Added tier-based quota limits
 */

import { supabase } from './supabase';
import TierService from './tierService';

// ============ LIFE AREAS ============
// 6 lĩnh vực cuộc sống theo kịch bản demo Vision Board
export const LIFE_AREAS = [
  { id: 'finance', label: 'Tài chính', icon: 'dollar-sign', color: '#FFD700' },
  { id: 'career', label: 'Sự nghiệp', icon: 'briefcase', color: '#4169E1' },
  { id: 'health', label: 'Sức khỏe', icon: 'heart', color: '#FF6B6B' },
  { id: 'relationships', label: 'Tình yêu', icon: 'heart', color: '#FF69B4' },
  { id: 'personal', label: 'Cá nhân', icon: 'user', color: '#9B59B6' },
  { id: 'spiritual', label: 'Tâm thức', icon: 'sparkles', color: '#00CED1' },
];

// ============ XP REWARDS ============
export const XP_REWARDS = {
  add_goal: 50,
  goal_complete: 500,
  goal_complete_early: 750,
  milestone_complete: 50,
  action_complete: 20,
  affirmation_complete: 10,
  habit_check: 15,
  habit_streak_7: 50,
  habit_streak_30: 200,
  ritual_complete: 20,
};

// ============ PROGRESS WEIGHTS ============
const PROGRESS_WEIGHTS = {
  actions: 0.60,      // 60% from actions/tasks
  affirmations: 0.20, // 20% from affirmations
  habits: 0.20,       // 20% from habits
};

// ============ QUOTA CHECKING ============
/**
 * Get current count of user's goals for quota checking
 * @param {string} userId
 * @returns {Promise<number>}
 */
export const getGoalsCount = async (userId) => {
  try {
    const { count, error } = await supabase
      .from('vision_goals')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (error) throw error;
    return count || 0;
  } catch (err) {
    console.error('[goalService] getGoalsCount error:', err);
    return 0;
  }
};

/**
 * Check if user can create more goals based on their tier
 * @param {string} userId
 * @returns {Promise<Object>} - { canCreate, quota, upgradeInfo }
 */
export const checkGoalQuota = async (userId) => {
  try {
    // Get user tier with expiration check
    const tierInfo = await TierService.getUserTierWithExpiration(userId);
    const tier = tierInfo.tier;

    // Get current goals count
    const currentCount = await getGoalsCount(userId);

    // Check quota
    const quota = TierService.checkGoalQuota(tier, currentCount);

    // Get upgrade info if at limit
    let upgradeInfo = null;
    if (!quota.canCreate && !quota.isUnlimited) {
      upgradeInfo = TierService.getVisionBoardUpgradeInfo(tier, 'goal');
    }

    return {
      canCreate: quota.canCreate,
      quota,
      tierInfo,
      upgradeInfo,
    };
  } catch (err) {
    console.error('[goalService] checkGoalQuota error:', err);
    // Default to allowing creation on error
    return {
      canCreate: true,
      quota: { canCreate: true, remaining: -1, limit: -1, isUnlimited: true },
      tierInfo: { tier: 'FREE' },
      upgradeInfo: null,
    };
  }
};

// ============ FETCH FUNCTIONS ============
export const getGoals = async (userId, options = {}) => {
  try {
    let query = supabase
      .from('vision_goals')
      .select('*')
      .eq('user_id', userId);

    if (options.status) {
      query = query.eq('status', options.status);
    }
    if (options.lifeArea) {
      query = query.eq('life_area', options.lifeArea);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('[goalService] getGoals error:', err);
    return [];
  }
};

export const getGoalById = async (goalId) => {
  try {
    const { data, error } = await supabase
      .from('vision_goals')
      .select(`
        *,
        milestones:vision_milestones(*),
        actions:vision_actions(*),
        affirmations:vision_affirmations(*),
        habits:vision_habits(*)
      `)
      .eq('id', goalId)
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('[goalService] getGoalById error:', err);
    return null;
  }
};

export const getActiveGoals = async (userId) => {
  return getGoals(userId, { status: 'active' });
};

export const getGoalsByLifeArea = async (userId, lifeArea) => {
  return getGoals(userId, { lifeArea, status: 'active' });
};

export const getGoalsSummary = async (userId) => {
  try {
    const { data: goals, error } = await supabase
      .from('vision_goals')
      .select('id, status, progress_percent')
      .eq('user_id', userId);

    if (error) throw error;

    const total = goals?.length || 0;
    const active = goals?.filter(g => g.status === 'active').length || 0;
    const completed = goals?.filter(g => g.status === 'completed').length || 0;
    const avgProgress = active > 0
      ? Math.round(goals.filter(g => g.status === 'active').reduce((sum, g) => sum + (g.progress_percent || 0), 0) / active)
      : 0;

    return { total, active, completed, avgProgress };
  } catch (err) {
    console.error('[goalService] getGoalsSummary error:', err);
    return { total: 0, active: 0, completed: 0, avgProgress: 0 };
  }
};

// ============ CREATE ============
/**
 * Create a new goal with tier quota checking
 * @param {string} userId
 * @param {Object} goalData
 * @param {Object} options - { skipQuotaCheck: boolean }
 * @returns {Promise<Object>} - Created goal or error with quota info
 */
export const createGoal = async (userId, goalData, options = {}) => {
  try {
    // Check quota first (unless explicitly skipped, e.g., for admin)
    if (!options.skipQuotaCheck) {
      const quotaResult = await checkGoalQuota(userId);

      if (!quotaResult.canCreate) {
        // Return quota error with upgrade info
        const error = new Error('QUOTA_EXCEEDED');
        error.code = 'QUOTA_EXCEEDED';
        error.quota = quotaResult.quota;
        error.upgradeInfo = quotaResult.upgradeInfo;
        error.message = quotaResult.upgradeInfo?.message ||
          `Bạn đã đạt giới hạn ${quotaResult.quota.limit} mục tiêu. Vui lòng nâng cấp để tạo thêm!`;
        throw error;
      }
    }

    const lifeAreaData = LIFE_AREAS.find(a => a.id === goalData.lifeArea);

    const newGoal = {
      user_id: userId,
      title: goalData.title,
      description: goalData.description || '',
      life_area: goalData.lifeArea,
      icon: goalData.icon || 'target',
      color: goalData.color || lifeAreaData?.color || '#FFBD59',
      cover_image: goalData.coverImage || null, // Hình ảnh minh họa

      target_type: goalData.targetType || 'completion',
      target_value: goalData.targetValue || 100,
      target_unit: goalData.targetUnit || '',
      current_value: 0,

      start_date: goalData.startDate || new Date().toISOString().split('T')[0],
      end_date: goalData.endDate || null,

      progress_percent: 0,
      xp_earned: 0,
      streak: 0,
      best_streak: 0,
      status: 'active',
    };

    const { data, error } = await supabase
      .from('vision_goals')
      .insert(newGoal)
      .select()
      .single();

    if (error) throw error;

    // Award XP for creating goal
    await addXPToUser(userId, XP_REWARDS.add_goal);

    // Create default milestones (25%, 50%, 75%, 100%)
    await createDefaultMilestones(data.id);

    // Update goals_created count
    await updateUserStats(userId, { goals_created: 1 });

    return data;
  } catch (err) {
    console.error('[goalService] createGoal error:', err);
    throw err;
  }
};

// ============ UPDATE ============
export const updateGoal = async (goalId, updates) => {
  try {
    const { data, error } = await supabase
      .from('vision_goals')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', goalId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('[goalService] updateGoal error:', err);
    throw err;
  }
};

// ============ COVER IMAGE ============
/**
 * Upload cover image for a goal
 * @param {string} userId - User ID
 * @param {string} goalId - Goal ID
 * @param {string} imageUri - Local URI of the image
 * @returns {Promise<string|null>} - Public URL of uploaded image
 */
export const uploadGoalCoverImage = async (userId, goalId, imageUri) => {
  try {
    const fileExt = imageUri.split('.').pop() || 'jpg';
    const fileName = `${goalId}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    // Read the file as base64
    const response = await fetch(imageUri);
    const blob = await response.blob();

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('vision-board')
      .upload(filePath, blob, {
        contentType: `image/${fileExt}`,
        upsert: true, // Replace if exists
      });

    if (error) throw error;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('vision-board')
      .getPublicUrl(filePath);

    // Update goal with cover_image URL
    await updateGoal(goalId, { cover_image: publicUrl });

    return publicUrl;
  } catch (err) {
    console.error('[goalService] uploadGoalCoverImage error:', err);
    return null;
  }
};

/**
 * Remove cover image from a goal
 * @param {string} userId - User ID
 * @param {string} goalId - Goal ID
 * @returns {Promise<boolean>}
 */
export const removeGoalCoverImage = async (userId, goalId) => {
  try {
    // Get current goal to find the image path
    const goal = await getGoalById(goalId);
    if (!goal?.cover_image) return true;

    // Extract file path from URL
    const urlParts = goal.cover_image.split('/vision-board/');
    if (urlParts.length > 1) {
      const filePath = urlParts[1];

      // Delete from storage
      await supabase.storage
        .from('vision-board')
        .remove([filePath]);
    }

    // Update goal to remove cover_image
    await updateGoal(goalId, { cover_image: null });

    return true;
  } catch (err) {
    console.error('[goalService] removeGoalCoverImage error:', err);
    return false;
  }
};

// ============ DELETE ============
export const deleteGoal = async (goalId) => {
  try {
    // Cascade delete handles relations
    const { error } = await supabase
      .from('vision_goals')
      .delete()
      .eq('id', goalId);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('[goalService] deleteGoal error:', err);
    throw err;
  }
};

// ============ COMPLETE GOAL ============
export const completeGoal = async (goalId, userId) => {
  try {
    const { data, error } = await supabase
      .from('vision_goals')
      .update({
        status: 'completed',
        progress_percent: 100,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', goalId)
      .select()
      .single();

    if (error) throw error;

    // Award XP
    const xpEarned = data.end_date && new Date() < new Date(data.end_date)
      ? XP_REWARDS.goal_complete_early  // 750 XP for early
      : XP_REWARDS.goal_complete;       // 500 XP normal

    await addXPToUser(userId, xpEarned);

    // Update goals_completed count
    await updateUserStats(userId, { goals_completed: 1 });

    return { goal: data, xpEarned };
  } catch (err) {
    console.error('[goalService] completeGoal error:', err);
    throw err;
  }
};

// ============ PAUSE/RESUME ============
export const pauseGoal = async (goalId) => {
  return updateGoal(goalId, { status: 'paused' });
};

export const resumeGoal = async (goalId) => {
  return updateGoal(goalId, { status: 'active' });
};

// ============ DEFAULT MILESTONES ============
const createDefaultMilestones = async (goalId) => {
  const milestones = [
    { goal_id: goalId, title: 'Khởi đầu', description: 'Hoàn thành 25% mục tiêu', target_percent: 25, xp_reward: 25 },
    { goal_id: goalId, title: 'Nửa đường', description: 'Hoàn thành 50% mục tiêu', target_percent: 50, xp_reward: 50 },
    { goal_id: goalId, title: 'Gần đích', description: 'Hoàn thành 75% mục tiêu', target_percent: 75, xp_reward: 75 },
    { goal_id: goalId, title: 'Hoàn thành', description: 'Hoàn thành 100% mục tiêu', target_percent: 100, xp_reward: 100 },
  ];

  await supabase.from('vision_milestones').insert(milestones);
};

// ============ CALCULATE GOAL PROGRESS ============
export const calculateGoalProgress = async (goalId) => {
  try {
    // Get all related data
    const goal = await getGoalById(goalId);
    if (!goal) return 0;

    // 1. Actions progress (60%)
    const actionsProgress = calculateActionsProgress(goal.actions || []);

    // 2. Affirmations progress (20%)
    const affirmationsProgress = calculateAffirmationsProgress(
      goal.affirmations || [],
      goal.start_date
    );

    // 3. Habits progress (20%)
    const habitsProgress = calculateHabitsProgress(goal.habits || []);

    // Weighted total
    const totalProgress = Math.round(
      (actionsProgress * PROGRESS_WEIGHTS.actions) +
      (affirmationsProgress * PROGRESS_WEIGHTS.affirmations) +
      (habitsProgress * PROGRESS_WEIGHTS.habits)
    );

    // Update goal progress
    await supabase
      .from('vision_goals')
      .update({
        progress_percent: totalProgress,
        updated_at: new Date().toISOString(),
      })
      .eq('id', goalId);

    // Check milestones
    await checkMilestones(goalId, totalProgress, goal.user_id);

    return totalProgress;
  } catch (err) {
    console.error('[goalService] calculateGoalProgress error:', err);
    return 0;
  }
};

// ============ ACTIONS PROGRESS ============
const calculateActionsProgress = (actions) => {
  if (!actions || actions.length === 0) return 0;

  let totalWeight = 0;
  let completedWeight = 0;

  actions.forEach(action => {
    const weight = action.weight || 1;
    totalWeight += weight;
    if (action.is_completed) {
      completedWeight += weight;
    }
  });

  return totalWeight > 0 ? (completedWeight / totalWeight) * 100 : 0;
};

// ============ AFFIRMATIONS PROGRESS ============
const calculateAffirmationsProgress = (affirmations, startDate) => {
  if (!affirmations || affirmations.length === 0) return 0;

  const start = new Date(startDate);
  const now = new Date();
  const daysSinceStart = Math.ceil((now - start) / (1000 * 60 * 60 * 24));

  if (daysSinceStart <= 0) return 0;

  let totalRequired = 0;
  let totalCompleted = 0;

  affirmations.forEach(aff => {
    const timesPerDay = aff.times_per_day || 3;
    totalRequired += timesPerDay * daysSinceStart;
    totalCompleted += aff.times_completed || 0;
  });

  return totalRequired > 0
    ? Math.min(100, (totalCompleted / totalRequired) * 100)
    : 0;
};

// ============ HABITS PROGRESS ============
const calculateHabitsProgress = (habits) => {
  if (!habits || habits.length === 0) return 0;

  let totalScore = 0;

  habits.forEach(habit => {
    // Score based on streak vs target streak
    const targetStreak = habit.target_streak || 30;
    const currentStreak = habit.current_streak || 0;
    const score = Math.min(100, (currentStreak / targetStreak) * 100);
    totalScore += score;
  });

  return totalScore / habits.length;
};

// ============ CHECK MILESTONES ============
export const checkMilestones = async (goalId, currentProgress, userId) => {
  try {
    // Get uncompleted milestones
    const { data: milestones } = await supabase
      .from('vision_milestones')
      .select('*')
      .eq('goal_id', goalId)
      .eq('is_completed', false)
      .order('target_percent', { ascending: true });

    if (!milestones || milestones.length === 0) return [];

    const completedMilestones = [];

    for (const milestone of milestones) {
      if (currentProgress >= milestone.target_percent) {
        // Complete milestone
        await supabase
          .from('vision_milestones')
          .update({
            is_completed: true,
            completed_at: new Date().toISOString(),
          })
          .eq('id', milestone.id);

        // Award XP
        await addXPToUser(userId, milestone.xp_reward);

        completedMilestones.push(milestone);
      }
    }

    return completedMilestones;
  } catch (err) {
    console.error('[goalService] checkMilestones error:', err);
    return [];
  }
};

// ============ GET MILESTONES ============
export const getMilestones = async (goalId) => {
  try {
    const { data, error } = await supabase
      .from('vision_milestones')
      .select('*')
      .eq('goal_id', goalId)
      .order('target_percent', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('[goalService] getMilestones error:', err);
    return [];
  }
};

// ============ CREATE CUSTOM MILESTONE ============
export const createMilestone = async (goalId, milestoneData) => {
  try {
    const { data, error } = await supabase
      .from('vision_milestones')
      .insert({
        goal_id: goalId,
        title: milestoneData.title,
        description: milestoneData.description || '',
        target_percent: milestoneData.targetPercent,
        xp_reward: milestoneData.xpReward || 50,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('[goalService] createMilestone error:', err);
    throw err;
  }
};

// ============ GET NEXT MILESTONE ============
export const getNextMilestone = async (goalId, currentProgress) => {
  try {
    const { data } = await supabase
      .from('vision_milestones')
      .select('*')
      .eq('goal_id', goalId)
      .eq('is_completed', false)
      .gt('target_percent', currentProgress)
      .order('target_percent', { ascending: true })
      .limit(1)
      .single();

    return data || null;
  } catch (err) {
    console.error('[goalService] getNextMilestone error:', err);
    return null;
  }
};

// ============ ADD XP TO USER ============
export const addXPToUser = async (userId, xpAmount) => {
  try {
    const { data: stats } = await supabase
      .from('vision_user_stats')
      .select('total_xp')
      .eq('user_id', userId)
      .single();

    const newTotalXP = (stats?.total_xp || 0) + xpAmount;

    await supabase
      .from('vision_user_stats')
      .upsert({
        user_id: userId,
        total_xp: newTotalXP,
        updated_at: new Date().toISOString(),
      });

    // Update daily summary
    await updateDailySummary(userId, { xp_earned: xpAmount });

    return newTotalXP;
  } catch (err) {
    console.error('[goalService] addXPToUser error:', err);
    return 0;
  }
};

// ============ UPDATE USER STATS ============
export const updateUserStats = async (userId, updates) => {
  try {
    const { data: existing } = await supabase
      .from('vision_user_stats')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (existing) {
      await supabase
        .from('vision_user_stats')
        .update({
          goals_created: (existing.goals_created || 0) + (updates.goals_created || 0),
          goals_completed: (existing.goals_completed || 0) + (updates.goals_completed || 0),
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);
    } else {
      await supabase
        .from('vision_user_stats')
        .insert({
          user_id: userId,
          goals_created: updates.goals_created || 0,
          goals_completed: updates.goals_completed || 0,
        });
    }
  } catch (err) {
    console.error('[goalService] updateUserStats error:', err);
  }
};

// ============ UPDATE DAILY SUMMARY ============
export const updateDailySummary = async (userId, updates) => {
  const today = new Date().toISOString().split('T')[0];

  try {
    // Get existing
    const { data: existing } = await supabase
      .from('vision_daily_summary')
      .select('*')
      .eq('user_id', userId)
      .eq('summary_date', today)
      .single();

    if (existing) {
      // Update
      await supabase
        .from('vision_daily_summary')
        .update({
          actions_completed: (existing.actions_completed || 0) + (updates.actions_completed || 0),
          affirmations_completed: (existing.affirmations_completed || 0) + (updates.affirmations_completed || 0),
          habits_completed: (existing.habits_completed || 0) + (updates.habits_completed || 0),
          ritual_completed: updates.ritual_completed || existing.ritual_completed,
          xp_earned: (existing.xp_earned || 0) + (updates.xp_earned || 0),
        })
        .eq('id', existing.id);
    } else {
      // Create
      await supabase
        .from('vision_daily_summary')
        .insert({
          user_id: userId,
          summary_date: today,
          actions_completed: updates.actions_completed || 0,
          affirmations_completed: updates.affirmations_completed || 0,
          habits_completed: updates.habits_completed || 0,
          ritual_completed: updates.ritual_completed || false,
          xp_earned: updates.xp_earned || 0,
        });
    }
  } catch (err) {
    console.error('[goalService] updateDailySummary error:', err);
  }
};

export default {
  LIFE_AREAS,
  XP_REWARDS,
  // Quota functions
  getGoalsCount,
  checkGoalQuota,
  // CRUD
  getGoals,
  getGoalById,
  getActiveGoals,
  getGoalsByLifeArea,
  getGoalsSummary,
  createGoal,
  updateGoal,
  deleteGoal,
  completeGoal,
  pauseGoal,
  resumeGoal,
  calculateGoalProgress,
  checkMilestones,
  getMilestones,
  createMilestone,
  getNextMilestone,
  addXPToUser,
  updateUserStats,
  updateDailySummary,
};
