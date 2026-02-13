/**
 * Vision Board - Tier Service
 * Handles tier-based quota enforcement for Vision Board features
 *
 * @fileoverview Tier limits and quota checking for goals, habits, affirmations
 */

import { supabase, getCurrentUser } from '../../lib/supabaseClient';

/**
 * Vision Board Tier Limits
 * Defines maximum allowed items per tier
 */
export const TIER_LIMITS = {
  goals: {
    FREE: 3,
    TIER1: 10,
    TIER2: 50,
    TIER3: -1, // Unlimited
    ADMIN: -1,
    MANAGER: -1,
  },
  habits: {
    FREE: 3,
    TIER1: 10,
    TIER2: 30,
    TIER3: -1,
    ADMIN: -1,
    MANAGER: -1,
  },
  affirmations: {
    FREE: 5,
    TIER1: 20,
    TIER2: 50,
    TIER3: -1,
    ADMIN: -1,
    MANAGER: -1,
  },
};

/**
 * Feature access per tier
 */
export const TIER_FEATURES = {
  FREE: {
    basicGoals: true,
    basicHabits: true,
    basicAffirmations: true,
    progressTracking: true,
    streakTracking: false,
    milestones: false,
    exportData: false,
    customCategories: false,
  },
  TIER1: {
    basicGoals: true,
    basicHabits: true,
    basicAffirmations: true,
    progressTracking: true,
    streakTracking: true,
    milestones: true,
    exportData: false,
    customCategories: false,
  },
  TIER2: {
    basicGoals: true,
    basicHabits: true,
    basicAffirmations: true,
    progressTracking: true,
    streakTracking: true,
    milestones: true,
    exportData: true,
    customCategories: true,
  },
  TIER3: {
    basicGoals: true,
    basicHabits: true,
    basicAffirmations: true,
    progressTracking: true,
    streakTracking: true,
    milestones: true,
    exportData: true,
    customCategories: true,
  },
  ADMIN: {
    basicGoals: true,
    basicHabits: true,
    basicAffirmations: true,
    progressTracking: true,
    streakTracking: true,
    milestones: true,
    exportData: true,
    customCategories: true,
  },
  MANAGER: {
    basicGoals: true,
    basicHabits: true,
    basicAffirmations: true,
    progressTracking: true,
    streakTracking: true,
    milestones: true,
    exportData: true,
    customCategories: true,
  },
};

/**
 * Get effective tier from user profile
 * Handles role-based tier override (admin/manager)
 *
 * @param {Object} profile - User profile from Supabase
 * @returns {string} Effective tier level
 */
export const getEffectiveTier = (profile) => {
  if (!profile) return 'FREE';

  // Admin and Manager bypass tier limits
  const role = profile.role?.toUpperCase();
  if (role === 'ADMIN' || role === 'MANAGER') {
    return role;
  }

  // Return user's subscription tier or default to FREE
  const tier = profile.tier?.toUpperCase() || 'FREE';
  return ['FREE', 'TIER1', 'TIER2', 'TIER3'].includes(tier) ? tier : 'FREE';
};

/**
 * Check if user can create more goals
 *
 * @param {string} userId - User ID
 * @param {string} tier - User's tier level
 * @returns {Promise<{allowed: boolean, current: number, limit: number, message?: string}>}
 */
export const checkGoalQuota = async (userId, tier) => {
  const effectiveTier = tier || 'FREE';
  const limit = TIER_LIMITS.goals[effectiveTier];

  // Unlimited check
  if (limit === -1) {
    return { allowed: true, current: 0, limit: -1 };
  }

  try {
    const { count, error } = await supabase
      .from('vision_goals')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_archived', false);

    if (error) throw error;

    const current = count || 0;
    const allowed = current < limit;

    return {
      allowed,
      current,
      limit,
      message: allowed
        ? null
        : `You've reached your goal limit (${limit}). Upgrade to create more goals.`,
    };
  } catch (error) {
    console.error('Error checking goal quota:', error);
    // Allow creation on error (optimistic)
    return { allowed: true, current: 0, limit, error: error.message };
  }
};

/**
 * Check if user can create more habits
 *
 * @param {string} userId - User ID
 * @param {string} tier - User's tier level
 * @returns {Promise<{allowed: boolean, current: number, limit: number, message?: string}>}
 */
export const checkHabitQuota = async (userId, tier) => {
  const effectiveTier = tier || 'FREE';
  const limit = TIER_LIMITS.habits[effectiveTier];

  if (limit === -1) {
    return { allowed: true, current: 0, limit: -1 };
  }

  try {
    const { count, error } = await supabase
      .from('vision_habits')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_active', true);

    if (error) throw error;

    const current = count || 0;
    const allowed = current < limit;

    return {
      allowed,
      current,
      limit,
      message: allowed
        ? null
        : `You've reached your habit limit (${limit}). Upgrade to track more habits.`,
    };
  } catch (error) {
    console.error('Error checking habit quota:', error);
    return { allowed: true, current: 0, limit, error: error.message };
  }
};

/**
 * Check if user can create more affirmations
 *
 * @param {string} userId - User ID
 * @param {string} tier - User's tier level
 * @returns {Promise<{allowed: boolean, current: number, limit: number, message?: string}>}
 */
export const checkAffirmationQuota = async (userId, tier) => {
  const effectiveTier = tier || 'FREE';
  const limit = TIER_LIMITS.affirmations[effectiveTier];

  if (limit === -1) {
    return { allowed: true, current: 0, limit: -1 };
  }

  try {
    const { count, error } = await supabase
      .from('vision_affirmations')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_active', true);

    if (error) throw error;

    const current = count || 0;
    const allowed = current < limit;

    return {
      allowed,
      current,
      limit,
      message: allowed
        ? null
        : `You've reached your affirmation limit (${limit}). Upgrade for more affirmations.`,
    };
  } catch (error) {
    console.error('Error checking affirmation quota:', error);
    return { allowed: true, current: 0, limit, error: error.message };
  }
};

/**
 * Get all quotas for a user
 *
 * @param {string} userId - User ID
 * @param {string} tier - User's tier level
 * @returns {Promise<Object>} All quota information
 */
export const getAllQuotas = async (userId, tier) => {
  const [goals, habits, affirmations] = await Promise.all([
    checkGoalQuota(userId, tier),
    checkHabitQuota(userId, tier),
    checkAffirmationQuota(userId, tier),
  ]);

  return { goals, habits, affirmations };
};

/**
 * Check if a feature is available for a tier
 *
 * @param {string} tier - User's tier level
 * @param {string} featureName - Feature to check
 * @returns {boolean} Whether feature is available
 */
export const hasFeature = (tier, featureName) => {
  const effectiveTier = tier || 'FREE';
  return TIER_FEATURES[effectiveTier]?.[featureName] === true;
};

/**
 * Get upgrade benefits when upgrading from current tier
 *
 * @param {string} currentTier - Current tier level
 * @returns {Object|null} Upgrade benefits or null if at max
 */
export const getUpgradeBenefits = (currentTier) => {
  const tierOrder = ['FREE', 'TIER1', 'TIER2', 'TIER3'];
  const currentIndex = tierOrder.indexOf(currentTier);

  if (currentIndex === -1 || currentIndex >= tierOrder.length - 1) {
    return null;
  }

  const nextTier = tierOrder[currentIndex + 1];
  const currentLimits = {
    goals: TIER_LIMITS.goals[currentTier],
    habits: TIER_LIMITS.habits[currentTier],
    affirmations: TIER_LIMITS.affirmations[currentTier],
  };
  const nextLimits = {
    goals: TIER_LIMITS.goals[nextTier],
    habits: TIER_LIMITS.habits[nextTier],
    affirmations: TIER_LIMITS.affirmations[nextTier],
  };

  const benefits = [];

  if (nextLimits.goals > currentLimits.goals || nextLimits.goals === -1) {
    benefits.push({
      icon: 'Target',
      text: nextLimits.goals === -1
        ? 'Unlimited goals'
        : `${nextLimits.goals} goals (currently ${currentLimits.goals})`,
    });
  }

  if (nextLimits.habits > currentLimits.habits || nextLimits.habits === -1) {
    benefits.push({
      icon: 'CheckCircle',
      text: nextLimits.habits === -1
        ? 'Unlimited habits'
        : `${nextLimits.habits} habits (currently ${currentLimits.habits})`,
    });
  }

  if (nextLimits.affirmations > currentLimits.affirmations || nextLimits.affirmations === -1) {
    benefits.push({
      icon: 'Heart',
      text: nextLimits.affirmations === -1
        ? 'Unlimited affirmations'
        : `${nextLimits.affirmations} affirmations (currently ${currentLimits.affirmations})`,
    });
  }

  // Add feature unlocks
  const currentFeatures = TIER_FEATURES[currentTier];
  const nextFeatures = TIER_FEATURES[nextTier];

  if (!currentFeatures.streakTracking && nextFeatures.streakTracking) {
    benefits.push({ icon: 'Flame', text: 'Streak tracking' });
  }
  if (!currentFeatures.milestones && nextFeatures.milestones) {
    benefits.push({ icon: 'Flag', text: 'Goal milestones' });
  }
  if (!currentFeatures.exportData && nextFeatures.exportData) {
    benefits.push({ icon: 'Download', text: 'Export data' });
  }
  if (!currentFeatures.customCategories && nextFeatures.customCategories) {
    benefits.push({ icon: 'Folder', text: 'Custom categories' });
  }

  return {
    nextTier,
    benefits,
  };
};

export default {
  TIER_LIMITS,
  TIER_FEATURES,
  getEffectiveTier,
  checkGoalQuota,
  checkHabitQuota,
  checkAffirmationQuota,
  getAllQuotas,
  hasFeature,
  getUpgradeBenefits,
};
