/**
 * Ritual Service
 * Handles ritual completions, streaks, and XP tracking
 *
 * @fileoverview Trader Rituals management service
 */

import { supabase } from '../lib/supabaseClient';

/**
 * Ritual Types Configuration
 */
export const RITUAL_TYPES = {
  heart_expansion: {
    id: 'heart_expansion',
    name: 'Heart Expansion',
    description: 'Open your heart to abundance and love',
    duration: 180, // 3 minutes
    tier: 'FREE',
    xp: 25,
    color: '#FF69B4',
    icon: 'Heart',
    phases: ['intro', 'breath', 'visualize', 'complete'],
  },
  gratitude_flow: {
    id: 'gratitude_flow',
    name: 'Gratitude Flow',
    description: 'Express gratitude for your blessings',
    duration: 180,
    tier: 'FREE',
    xp: 25,
    color: '#FFD700',
    icon: 'Sun',
    phases: ['intro', 'breath', 'write', 'complete'],
  },
  cleansing_breath: {
    id: 'cleansing_breath',
    name: 'Cleansing Breath',
    description: 'Release stress and negative energy',
    duration: 240, // 4 minutes
    tier: 'TIER1',
    xp: 30,
    color: '#00F0FF',
    icon: 'Wind',
    phases: ['intro', 'breath', 'breath_deep', 'complete'],
  },
  water_manifest: {
    id: 'water_manifest',
    name: 'Water Manifestation',
    description: 'Program water with your intentions',
    duration: 300, // 5 minutes
    tier: 'TIER1',
    xp: 30,
    color: '#4169E1',
    icon: 'Droplets',
    phases: ['intro', 'breath', 'intention', 'complete'],
  },
  letter_universe: {
    id: 'letter_universe',
    name: 'Letter to Universe',
    description: 'Write your desires to the universe',
    duration: 300,
    tier: 'TIER1',
    xp: 30,
    color: '#A855F7',
    icon: 'Mail',
    phases: ['intro', 'breath', 'write', 'send', 'complete'],
  },
  burn_release: {
    id: 'burn_release',
    name: 'Burn & Release',
    description: 'Let go of what no longer serves you',
    duration: 240,
    tier: 'TIER2',
    xp: 35,
    color: '#FF6B35',
    icon: 'Flame',
    phases: ['intro', 'breath', 'write', 'burn', 'complete'],
  },
  star_wish: {
    id: 'star_wish',
    name: 'Star Wish',
    description: 'Make a wish upon a star',
    duration: 180,
    tier: 'TIER2',
    xp: 35,
    color: '#FFFFFF',
    icon: 'Star',
    phases: ['intro', 'breath', 'wish', 'complete'],
  },
  crystal_healing: {
    id: 'crystal_healing',
    name: 'Crystal Healing',
    description: 'Channel healing energy through crystals',
    duration: 300,
    tier: 'TIER2',
    xp: 35,
    color: '#9B59B6',
    icon: 'Gem',
    phases: ['intro', 'breath', 'visualize', 'heal', 'complete'],
  },
};

/**
 * Tier access for rituals
 */
export const TIER_RITUAL_ACCESS = {
  FREE: ['heart_expansion', 'gratitude_flow'],
  TIER1: ['heart_expansion', 'gratitude_flow', 'cleansing_breath', 'water_manifest', 'letter_universe'],
  TIER2: Object.keys(RITUAL_TYPES),
  TIER3: Object.keys(RITUAL_TYPES),
  ADMIN: Object.keys(RITUAL_TYPES),
  MANAGER: Object.keys(RITUAL_TYPES),
};

/**
 * Check if user can access a ritual
 *
 * @param {string} ritualId - Ritual ID
 * @param {string} tier - User's tier
 * @returns {boolean}
 */
export const canAccessRitual = (ritualId, tier) => {
  const effectiveTier = tier?.toUpperCase() || 'FREE';
  const allowedRituals = TIER_RITUAL_ACCESS[effectiveTier] || TIER_RITUAL_ACCESS.FREE;
  return allowedRituals.includes(ritualId);
};

/**
 * Get all rituals with access info
 *
 * @param {string} tier - User's tier
 * @returns {Array} Rituals with locked status
 */
export const getRituals = (tier) => {
  return Object.values(RITUAL_TYPES).map((ritual) => ({
    ...ritual,
    locked: !canAccessRitual(ritual.id, tier),
  }));
};

/**
 * Get ritual by ID
 *
 * @param {string} ritualId - Ritual ID
 * @returns {Object|null}
 */
export const getRitualById = (ritualId) => {
  return RITUAL_TYPES[ritualId] || null;
};

/**
 * Complete a ritual and award XP
 *
 * @param {string} userId - User ID
 * @param {string} ritualId - Ritual ID
 * @param {Object} metadata - Completion metadata (reflection, duration, etc.)
 * @returns {Promise<{success: boolean, xpAwarded: number, error?: Error}>}
 */
export const completeRitual = async (userId, ritualId, metadata = {}) => {
  const ritual = RITUAL_TYPES[ritualId];
  if (!ritual) {
    return { success: false, error: new Error('Invalid ritual') };
  }

  try {
    // Check for duplicate completion today
    const today = new Date().toISOString().split('T')[0];
    const { data: existingLog } = await supabase
      .from('calendar_ritual_logs')
      .select('id')
      .eq('user_id', userId)
      .eq('ritual_slug', ritualId)
      .gte('completed_at', `${today}T00:00:00`)
      .lte('completed_at', `${today}T23:59:59`)
      .limit(1);

    if (existingLog?.length > 0) {
      return {
        success: true,
        xpAwarded: 0,
        alreadyCompletedToday: true,
      };
    }

    // Create completion log
    const { error: logError } = await supabase
      .from('calendar_ritual_logs')
      .insert({
        user_id: userId,
        ritual_slug: ritualId,
        ritual_name: ritual.name,
        duration_seconds: metadata.durationSeconds || ritual.duration,
        reflection: metadata.reflection || null,
        completed_at: new Date().toISOString(),
      });

    if (logError) throw logError;

    // Award XP
    let xpAwarded = 0;
    try {
      // Update user stats
      const { data: stats } = await supabase
        .from('vision_user_stats')
        .select('total_xp, total_rituals_completed')
        .eq('user_id', userId)
        .single();

      if (stats) {
        await supabase
          .from('vision_user_stats')
          .update({
            total_xp: (stats.total_xp || 0) + ritual.xp,
            total_rituals_completed: (stats.total_rituals_completed || 0) + 1,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId);

        xpAwarded = ritual.xp;
      }
    } catch {
      // Stats table might not exist for this user
    }

    return { success: true, xpAwarded };
  } catch (error) {
    console.error('Error completing ritual:', error);
    return { success: false, error };
  }
};

/**
 * Get today's completed rituals
 *
 * @param {string} userId - User ID
 * @returns {Promise<{data: Array, error?: Error}>}
 */
export const getTodaysCompletedRituals = async (userId) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('calendar_ritual_logs')
      .select('ritual_slug, completed_at')
      .eq('user_id', userId)
      .gte('completed_at', `${today}T00:00:00`)
      .lte('completed_at', `${today}T23:59:59`);

    if (error) throw error;

    return { data: data || [] };
  } catch (error) {
    console.error('Error fetching today\'s rituals:', error);
    return { data: [], error };
  }
};

/**
 * Get ritual completion history
 *
 * @param {string} userId - User ID
 * @param {number} days - Number of days
 * @returns {Promise<{data: Array, error?: Error}>}
 */
export const getRitualHistory = async (userId, days = 30) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('calendar_ritual_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('completed_at', startDate.toISOString())
      .order('completed_at', { ascending: false });

    if (error) throw error;

    return { data: data || [] };
  } catch (error) {
    console.error('Error fetching ritual history:', error);
    return { data: [], error };
  }
};

/**
 * Get ritual streak
 *
 * @param {string} userId - User ID
 * @returns {Promise<{currentStreak: number, longestStreak: number}>}
 */
export const getRitualStreak = async (userId) => {
  try {
    const { data: logs } = await supabase
      .from('calendar_ritual_logs')
      .select('completed_at')
      .eq('user_id', userId)
      .order('completed_at', { ascending: false })
      .limit(365);

    if (!logs || logs.length === 0) {
      return { currentStreak: 0, longestStreak: 0 };
    }

    // Get unique dates
    const uniqueDates = [...new Set(
      logs.map((log) => new Date(log.completed_at).toISOString().split('T')[0])
    )].sort().reverse();

    // Calculate current streak
    let currentStreak = 0;
    const today = new Date().toISOString().split('T')[0];
    const checkDate = new Date();

    // If not completed today, check from yesterday
    if (!uniqueDates.includes(today)) {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    while (uniqueDates.includes(checkDate.toISOString().split('T')[0])) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }

    return { currentStreak, longestStreak: currentStreak };
  } catch (error) {
    console.error('Error calculating ritual streak:', error);
    return { currentStreak: 0, longestStreak: 0 };
  }
};

export default {
  RITUAL_TYPES,
  TIER_RITUAL_ACCESS,
  canAccessRitual,
  getRituals,
  getRitualById,
  completeRitual,
  getTodaysCompletedRituals,
  getRitualHistory,
  getRitualStreak,
};
