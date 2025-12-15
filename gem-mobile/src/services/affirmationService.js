/**
 * Affirmation Service - Vision Board 2.0
 * CRUD operations for affirmations
 * Created: December 10, 2025
 * Updated: December 14, 2025 - Added tier-based quota limits
 */

import { supabase } from './supabase';
import { addXPToUser, updateDailySummary, XP_REWARDS } from './goalService';
import TierService from './tierService';

// ============ QUOTA CHECKING ============
/**
 * Get current count of user's affirmations for quota checking
 * @param {string} userId
 * @returns {Promise<number>}
 */
export const getAffirmationsCount = async (userId) => {
  try {
    const { count, error } = await supabase
      .from('vision_affirmations')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (error) throw error;
    return count || 0;
  } catch (err) {
    console.error('[affirmationService] getAffirmationsCount error:', err);
    return 0;
  }
};

/**
 * Check if user can create more affirmations based on their tier
 * @param {string} userId
 * @returns {Promise<Object>} - { canCreate, quota, upgradeInfo }
 */
export const checkAffirmationQuota = async (userId) => {
  try {
    // Get user tier with expiration check
    const tierInfo = await TierService.getUserTierWithExpiration(userId);
    const tier = tierInfo.tier;

    // Get current affirmations count
    const currentCount = await getAffirmationsCount(userId);

    // Check quota
    const quota = TierService.checkAffirmationQuota(tier, currentCount);

    // Get upgrade info if at limit
    let upgradeInfo = null;
    if (!quota.canCreate && !quota.isUnlimited) {
      upgradeInfo = TierService.getVisionBoardUpgradeInfo(tier, 'affirmation');
    }

    return {
      canCreate: quota.canCreate,
      quota,
      tierInfo,
      upgradeInfo,
    };
  } catch (err) {
    console.error('[affirmationService] checkAffirmationQuota error:', err);
    // Default to allowing creation on error
    return {
      canCreate: true,
      quota: { canCreate: true, remaining: -1, limit: -1, isUnlimited: true },
      tierInfo: { tier: 'FREE' },
      upgradeInfo: null,
    };
  }
};

// ============ GET AFFIRMATIONS ============
export const getAffirmations = async (userId, options = {}) => {
  try {
    let query = supabase
      .from('vision_affirmations')
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
    console.error('[affirmationService] getAffirmations error:', err);
    return [];
  }
};

// ============ GET TODAY'S AFFIRMATIONS ============
export const getTodayAffirmations = async (userId) => {
  try {
    const affirmations = await getAffirmations(userId);
    const today = new Date().toISOString().split('T')[0];

    // Check today's completion status for each
    return Promise.all(affirmations.map(async (aff) => {
      const { count } = await supabase
        .from('vision_affirmation_logs')
        .select('*', { count: 'exact', head: true })
        .eq('affirmation_id', aff.id)
        .gte('completed_at', today);

      const completedToday = count || 0;
      const timesPerDay = aff.times_per_day || 3;

      return {
        ...aff,
        completedToday,
        remainingToday: Math.max(0, timesPerDay - completedToday),
        isCompletedToday: completedToday >= timesPerDay,
      };
    }));
  } catch (err) {
    console.error('[affirmationService] getTodayAffirmations error:', err);
    return [];
  }
};

// ============ GET AFFIRMATIONS SUMMARY ============
export const getAffirmationsSummary = async (userId) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Get total affirmations and required completions
    const { data: affirmations } = await supabase
      .from('vision_affirmations')
      .select('id, times_per_day')
      .eq('user_id', userId);

    const totalRequired = affirmations?.reduce((sum, a) => sum + (a.times_per_day || 3), 0) || 0;

    // Get today's completed
    const { count } = await supabase
      .from('vision_affirmation_logs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('completed_at', today);

    return {
      total: totalRequired,
      completed: count || 0,
    };
  } catch (err) {
    console.error('[affirmationService] getAffirmationsSummary error:', err);
    return { total: 0, completed: 0 };
  }
};

// ============ CREATE AFFIRMATION ============
/**
 * Create a new affirmation with tier quota checking
 * @param {string} userId
 * @param {Object} affData
 * @param {Object} options - { skipQuotaCheck: boolean }
 * @returns {Promise<Object>} - Created affirmation or error with quota info
 */
export const createAffirmation = async (userId, affData, options = {}) => {
  try {
    // Check quota first (unless explicitly skipped, e.g., for admin)
    if (!options.skipQuotaCheck) {
      const quotaResult = await checkAffirmationQuota(userId);

      if (!quotaResult.canCreate) {
        // Return quota error with upgrade info
        const error = new Error('QUOTA_EXCEEDED');
        error.code = 'QUOTA_EXCEEDED';
        error.quota = quotaResult.quota;
        error.upgradeInfo = quotaResult.upgradeInfo;
        error.message = quotaResult.upgradeInfo?.message ||
          `Bạn đã đạt giới hạn ${quotaResult.quota.limit} khẳng định. Vui lòng nâng cấp để tạo thêm!`;
        throw error;
      }
    }

    const { data, error } = await supabase
      .from('vision_affirmations')
      .insert({
        user_id: userId,
        goal_id: affData.goalId || null,
        text: affData.text,
        audio_url: affData.audioUrl || null,
        life_area: affData.lifeArea || null,
        times_per_day: affData.timesPerDay || 3,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('[affirmationService] createAffirmation error:', err);
    throw err;
  }
};

// ============ UPDATE AFFIRMATION ============
export const updateAffirmation = async (affirmationId, updates) => {
  try {
    const { data, error } = await supabase
      .from('vision_affirmations')
      .update(updates)
      .eq('id', affirmationId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('[affirmationService] updateAffirmation error:', err);
    throw err;
  }
};

// ============ COMPLETE AFFIRMATION ============
export const completeAffirmation = async (affirmationId, userId) => {
  try {
    // Log completion
    await supabase
      .from('vision_affirmation_logs')
      .insert({
        affirmation_id: affirmationId,
        user_id: userId,
        completed_at: new Date().toISOString(),
      });

    // Update total count on affirmation
    const { data: aff } = await supabase
      .from('vision_affirmations')
      .select('times_completed')
      .eq('id', affirmationId)
      .single();

    await supabase
      .from('vision_affirmations')
      .update({
        times_completed: (aff?.times_completed || 0) + 1,
      })
      .eq('id', affirmationId);

    // Award XP
    const xpEarned = XP_REWARDS.affirmation_complete;
    await addXPToUser(userId, xpEarned);

    // Update daily summary
    await updateDailySummary(userId, {
      affirmations_completed: 1,
    });

    return { xpEarned };
  } catch (err) {
    console.error('[affirmationService] completeAffirmation error:', err);
    throw err;
  }
};

// ============ DELETE AFFIRMATION ============
export const deleteAffirmation = async (affirmationId) => {
  try {
    // Delete logs first
    await supabase
      .from('vision_affirmation_logs')
      .delete()
      .eq('affirmation_id', affirmationId);

    // Delete affirmation
    await supabase
      .from('vision_affirmations')
      .delete()
      .eq('id', affirmationId);

    return true;
  } catch (err) {
    console.error('[affirmationService] deleteAffirmation error:', err);
    throw err;
  }
};

// ============ GET AFFIRMATION BY ID ============
export const getAffirmationById = async (affirmationId) => {
  try {
    const { data, error } = await supabase
      .from('vision_affirmations')
      .select('*, goal:vision_goals(id, title, color)')
      .eq('id', affirmationId)
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('[affirmationService] getAffirmationById error:', err);
    return null;
  }
};

// ============ GET RANDOM AFFIRMATION ============
export const getRandomAffirmation = async (userId) => {
  try {
    const affirmations = await getAffirmations(userId);
    if (affirmations.length === 0) return null;

    const randomIndex = Math.floor(Math.random() * affirmations.length);
    return affirmations[randomIndex];
  } catch (err) {
    console.error('[affirmationService] getRandomAffirmation error:', err);
    return null;
  }
};

export default {
  // Quota functions
  getAffirmationsCount,
  checkAffirmationQuota,
  // CRUD
  getAffirmations,
  getTodayAffirmations,
  getAffirmationsSummary,
  createAffirmation,
  updateAffirmation,
  completeAffirmation,
  deleteAffirmation,
  getAffirmationById,
  getRandomAffirmation,
};
