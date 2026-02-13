/**
 * Vision Board - Affirmation Service
 * Handles affirmation CRUD, daily displays, and reading logs
 *
 * @fileoverview Affirmation management with tier-based quotas
 */

import { supabase } from '../../lib/supabaseClient';
import { checkAffirmationQuota } from './tierService';
import { awardXP } from './goalService';

/**
 * Affirmation categories
 */
export const AFFIRMATION_CATEGORIES = [
  { key: 'confidence', label: 'Confidence', icon: 'Shield', color: '#FFBD59' },
  { key: 'abundance', label: 'Abundance', icon: 'DollarSign', color: '#3AF7A6' },
  { key: 'health', label: 'Health', icon: 'Heart', color: '#FF6B6B' },
  { key: 'love', label: 'Love', icon: 'Heart', color: '#FF69B4' },
  { key: 'success', label: 'Success', icon: 'Trophy', color: '#FFBD59' },
  { key: 'peace', label: 'Peace', icon: 'Sun', color: '#00F0FF' },
  { key: 'trading', label: 'Trading', icon: 'TrendingUp', color: '#6A5BFF' },
  { key: 'custom', label: 'Custom', icon: 'Star', color: '#A855F7' },
];

/**
 * XP rewards
 */
export const AFFIRMATION_XP = {
  create: 5,
  read: 3,
  streak7: 25,
};

/**
 * Default affirmations for new users
 */
export const DEFAULT_AFFIRMATIONS = [
  {
    text: 'I am confident in my trading decisions',
    category: 'trading',
  },
  {
    text: 'I attract abundance and prosperity into my life',
    category: 'abundance',
  },
  {
    text: 'I am patient and disciplined in my approach',
    category: 'success',
  },
  {
    text: 'I learn and grow from every trade, win or lose',
    category: 'trading',
  },
  {
    text: 'I am grateful for all the opportunities that come my way',
    category: 'abundance',
  },
];

/**
 * Get all affirmations for a user
 *
 * @param {string} userId - User ID
 * @param {Object} options - Filter options
 * @returns {Promise<{data: Array, error: Error|null}>}
 */
export const getAffirmations = async (userId, options = {}) => {
  const { includeInactive = false, category = null } = options;

  try {
    let query = supabase
      .from('vision_affirmations')
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

    return { data: data || [], error: null };
  } catch (error) {
    console.error('Error fetching affirmations:', error);
    return { data: [], error };
  }
};

/**
 * Get a single affirmation by ID
 *
 * @param {string} affirmationId - Affirmation ID
 * @param {string} userId - User ID
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export const getAffirmationById = async (affirmationId, userId) => {
  try {
    const { data, error } = await supabase
      .from('vision_affirmations')
      .select('*')
      .eq('id', affirmationId)
      .eq('user_id', userId)
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error fetching affirmation:', error);
    return { data: null, error };
  }
};

/**
 * Create a new affirmation with quota check
 *
 * @param {string} userId - User ID
 * @param {Object} affirmationData - Affirmation data
 * @param {string} tier - User's tier
 * @returns {Promise<{data: Object|null, error: Error|null, quotaExceeded?: boolean}>}
 */
export const createAffirmation = async (userId, affirmationData, tier) => {
  try {
    // Check quota
    const quotaCheck = await checkAffirmationQuota(userId, tier);
    if (!quotaCheck.allowed) {
      return {
        data: null,
        error: new Error(quotaCheck.message),
        quotaExceeded: true,
      };
    }

    // Validate
    if (!affirmationData.text?.trim()) {
      return { data: null, error: new Error('Affirmation text is required') };
    }

    const newAffirmation = {
      user_id: userId,
      text: affirmationData.text.trim(),
      category: affirmationData.category || 'custom',
      is_favorite: affirmationData.isFavorite || false,
      is_active: true,
      read_count: 0,
      last_read_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('vision_affirmations')
      .insert(newAffirmation)
      .select()
      .single();

    if (error) throw error;

    // Award XP
    await awardXP(userId, AFFIRMATION_XP.create, 'affirmation_created', data.id);

    return { data, error: null };
  } catch (error) {
    console.error('Error creating affirmation:', error);
    return { data: null, error };
  }
};

/**
 * Update an affirmation
 *
 * @param {string} affirmationId - Affirmation ID
 * @param {Object} updates - Fields to update
 * @param {string} userId - User ID
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export const updateAffirmation = async (affirmationId, updates, userId) => {
  try {
    const allowedFields = ['text', 'category', 'is_favorite', 'is_active'];

    const sanitizedUpdates = {};
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        sanitizedUpdates[field] = updates[field];
      }
    }
    sanitizedUpdates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('vision_affirmations')
      .update(sanitizedUpdates)
      .eq('id', affirmationId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error updating affirmation:', error);
    return { data: null, error };
  }
};

/**
 * Delete an affirmation
 *
 * @param {string} affirmationId - Affirmation ID
 * @param {string} userId - User ID
 * @param {boolean} hardDelete - Permanently delete if true
 * @returns {Promise<{success: boolean, error: Error|null}>}
 */
export const deleteAffirmation = async (affirmationId, userId, hardDelete = false) => {
  try {
    if (hardDelete) {
      // Delete logs first
      await supabase.from('vision_affirmation_logs').delete().eq('affirmation_id', affirmationId);

      const { error } = await supabase
        .from('vision_affirmations')
        .delete()
        .eq('id', affirmationId)
        .eq('user_id', userId);

      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('vision_affirmations')
        .update({
          is_active: false,
          updated_at: new Date().toISOString(),
        })
        .eq('id', affirmationId)
        .eq('user_id', userId);

      if (error) throw error;
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Error deleting affirmation:', error);
    return { success: false, error };
  }
};

/**
 * Toggle favorite status
 *
 * @param {string} affirmationId - Affirmation ID
 * @param {string} userId - User ID
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export const toggleFavorite = async (affirmationId, userId) => {
  try {
    // Get current state
    const { data: current, error: fetchError } = await supabase
      .from('vision_affirmations')
      .select('is_favorite')
      .eq('id', affirmationId)
      .eq('user_id', userId)
      .single();

    if (fetchError) throw fetchError;

    const { data, error } = await supabase
      .from('vision_affirmations')
      .update({
        is_favorite: !current.is_favorite,
        updated_at: new Date().toISOString(),
      })
      .eq('id', affirmationId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error toggling favorite:', error);
    return { data: null, error };
  }
};

/**
 * Log an affirmation reading
 *
 * @param {string} affirmationId - Affirmation ID
 * @param {string} userId - User ID
 * @returns {Promise<{xpAwarded: number, error: Error|null}>}
 */
export const logReading = async (affirmationId, userId) => {
  try {
    // Create log entry
    await supabase
      .from('vision_affirmation_logs')
      .insert({
        affirmation_id: affirmationId,
        user_id: userId,
        read_at: new Date().toISOString(),
      });

    // Update affirmation read count
    const { data: affirmation } = await supabase
      .from('vision_affirmations')
      .select('read_count')
      .eq('id', affirmationId)
      .single();

    await supabase
      .from('vision_affirmations')
      .update({
        read_count: (affirmation?.read_count || 0) + 1,
        last_read_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', affirmationId);

    // Award XP (limited to once per day per affirmation)
    const today = new Date().toISOString().split('T')[0];
    const { count } = await supabase
      .from('vision_affirmation_logs')
      .select('*', { count: 'exact', head: true })
      .eq('affirmation_id', affirmationId)
      .eq('user_id', userId)
      .gte('read_at', `${today}T00:00:00`)
      .lte('read_at', `${today}T23:59:59`);

    // Only award XP for first read today
    let xpAwarded = 0;
    if (count === 1) {
      xpAwarded = await awardXP(userId, AFFIRMATION_XP.read, 'affirmation_read', affirmationId);
    }

    return { xpAwarded, error: null };
  } catch (error) {
    console.error('Error logging reading:', error);
    return { xpAwarded: 0, error };
  }
};

/**
 * Get today's affirmation (random from favorites or all)
 *
 * @param {string} userId - User ID
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export const getTodaysAffirmation = async (userId) => {
  try {
    // First try favorites
    let { data: affirmations, error } = await supabase
      .from('vision_affirmations')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .eq('is_favorite', true);

    if (error) throw error;

    // If no favorites, get all
    if (!affirmations || affirmations.length === 0) {
      const result = await supabase
        .from('vision_affirmations')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true);

      affirmations = result.data || [];
    }

    if (affirmations.length === 0) {
      return { data: null, error: null };
    }

    // Use date as seed for consistent daily selection
    const today = new Date();
    const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    const index = seed % affirmations.length;

    return { data: affirmations[index], error: null };
  } catch (error) {
    console.error('Error getting today\'s affirmation:', error);
    return { data: null, error };
  }
};

/**
 * Get random affirmation
 *
 * @param {string} userId - User ID
 * @param {string} excludeId - ID to exclude (for "next" functionality)
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export const getRandomAffirmation = async (userId, excludeId = null) => {
  try {
    let query = supabase
      .from('vision_affirmations')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true);

    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { data: affirmations, error } = await query;

    if (error) throw error;

    if (!affirmations || affirmations.length === 0) {
      return { data: null, error: null };
    }

    const randomIndex = Math.floor(Math.random() * affirmations.length);
    return { data: affirmations[randomIndex], error: null };
  } catch (error) {
    console.error('Error getting random affirmation:', error);
    return { data: null, error };
  }
};

/**
 * Get affirmations summary
 *
 * @param {string} userId - User ID
 * @returns {Promise<Object>}
 */
export const getAffirmationsSummary = async (userId) => {
  try {
    const { data: affirmations, error } = await supabase
      .from('vision_affirmations')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true);

    if (error) throw error;

    // Get today's readings
    const today = new Date().toISOString().split('T')[0];
    const { count: todayReadings } = await supabase
      .from('vision_affirmation_logs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('read_at', `${today}T00:00:00`)
      .lte('read_at', `${today}T23:59:59`);

    const summary = {
      total: affirmations?.length || 0,
      favorites: affirmations?.filter((a) => a.is_favorite).length || 0,
      totalReadings: affirmations?.reduce((sum, a) => sum + (a.read_count || 0), 0) || 0,
      todayReadings: todayReadings || 0,
      byCategory: {},
    };

    // Count by category
    for (const aff of affirmations || []) {
      const cat = aff.category || 'custom';
      summary.byCategory[cat] = (summary.byCategory[cat] || 0) + 1;
    }

    return { data: summary, error: null };
  } catch (error) {
    console.error('Error getting affirmations summary:', error);
    return { data: null, error };
  }
};

/**
 * Seed default affirmations for new user
 *
 * @param {string} userId - User ID
 * @returns {Promise<{data: Array, error: Error|null}>}
 */
export const seedDefaultAffirmations = async (userId) => {
  try {
    // Check if user already has affirmations
    const { count } = await supabase
      .from('vision_affirmations')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (count > 0) {
      return { data: [], error: null }; // Already has affirmations
    }

    const affirmationsData = DEFAULT_AFFIRMATIONS.map((aff) => ({
      user_id: userId,
      text: aff.text,
      category: aff.category,
      is_favorite: false,
      is_active: true,
      read_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    const { data, error } = await supabase
      .from('vision_affirmations')
      .insert(affirmationsData)
      .select();

    if (error) throw error;

    return { data: data || [], error: null };
  } catch (error) {
    console.error('Error seeding affirmations:', error);
    return { data: [], error };
  }
};

export default {
  AFFIRMATION_CATEGORIES,
  AFFIRMATION_XP,
  DEFAULT_AFFIRMATIONS,
  getAffirmations,
  getAffirmationById,
  createAffirmation,
  updateAffirmation,
  deleteAffirmation,
  toggleFavorite,
  logReading,
  getTodaysAffirmation,
  getRandomAffirmation,
  getAffirmationsSummary,
  seedDefaultAffirmations,
};
