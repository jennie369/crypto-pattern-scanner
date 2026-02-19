/**
 * Ritual Tracking Service (Web)
 * Ported from gem-mobile/src/services/ritualTrackingService.js
 *
 * Smart ritual and habit tracking with gamification integration.
 * Handles user-created custom ritual CRUD, completion tracking,
 * streak management, daily progress, statistics, and coaching messages.
 *
 * @fileoverview This service manages the user_rituals + ritual_completions
 * tables (user-created custom rituals). It complements the existing
 * ritualService.js which handles predefined "playground" rituals
 * (heart_expansion, gratitude_flow, etc.) stored in ritual_logs.
 *
 * Key differences from ritualService.js:
 * - ritualService.js: predefined rituals (RITUAL_TYPES), ritual_logs table
 * - ritualTrackingService.js: user-created rituals, user_rituals + ritual_completions tables,
 *   gamification/XP integration, streak tracking, coaching, calendar view
 *
 * Uses localStorage instead of cacheService (web environment).
 * Uses `from('profiles')` NOT `from('users')`.
 * Integrates with streakService for streak management and XP awards.
 */

import { supabase } from '../lib/supabaseClient';
import { streakService, STREAK_TYPES } from './streakService';

// ============================================================
// RITUAL CONSTANTS
// ============================================================

/**
 * Supported ritual type identifiers.
 * Used for categorisation, icon selection, and display.
 *
 * @readonly
 * @enum {string}
 */
export const RITUAL_TYPES = {
  MEDITATION: 'meditation',
  AFFIRMATION: 'affirmation',
  GRATITUDE: 'gratitude',
  JOURNALING: 'journaling',
  EXERCISE: 'exercise',
  READING: 'reading',
  BREATHING: 'breathing',
  VISUALIZATION: 'visualization',
  CUSTOM: 'custom',
};

/**
 * Supported ritual frequency schedules.
 *
 * @readonly
 * @enum {string}
 */
export const RITUAL_FREQUENCIES = {
  DAILY: 'daily',
  WEEKDAYS: 'weekdays',
  WEEKENDS: 'weekends',
  WEEKLY: 'weekly',
  CUSTOM: 'custom',
};

/**
 * Pre/post ritual mood options for tracking emotional shifts.
 * Each option includes a value key, label, icon name, and colour.
 *
 * @type {Array<{value: string, label: string, icon: string, color: string}>}
 */
export const MOOD_OPTIONS = [
  { value: 'anxious', label: 'Anxious', icon: 'frown', color: '#DDA0DD' },
  { value: 'tired', label: 'Tired', icon: 'battery-low', color: '#808080' },
  { value: 'neutral', label: 'Neutral', icon: 'minus-circle', color: '#A9A9A9' },
  { value: 'focused', label: 'Focused', icon: 'target', color: '#4169E1' },
  { value: 'calm', label: 'Calm', icon: 'cloud', color: '#87CEEB' },
  { value: 'energized', label: 'Energized', icon: 'zap', color: '#FFD700' },
  { value: 'peaceful', label: 'Peaceful', icon: 'sun', color: '#90EE90' },
  { value: 'grateful', label: 'Grateful', icon: 'heart', color: '#FF69B4' },
  { value: 'joyful', label: 'Joyful', icon: 'smile', color: '#FFA500' },
];

/**
 * Default rituals seeded for new users who have no custom rituals yet.
 *
 * @type {Array<Object>}
 */
const DEFAULT_RITUALS = [
  {
    name: 'Morning Meditation',
    description: '10 minute meditation to start the day with a calm mind',
    ritual_type: RITUAL_TYPES.MEDITATION,
    duration_minutes: 10,
    scheduled_time: '06:30',
    icon_name: 'sun',
    color: '#87CEEB',
    sort_order: 1,
    xp_reward: 20,
  },
  {
    name: 'Affirmation',
    description: 'Read and feel positive affirmations to raise your frequency',
    ritual_type: RITUAL_TYPES.AFFIRMATION,
    duration_minutes: 5,
    scheduled_time: '07:00',
    icon_name: 'sparkles',
    color: '#FFD700',
    sort_order: 2,
    xp_reward: 10,
  },
  {
    name: 'Gratitude Journal',
    description: 'Write 3 things you are grateful for today',
    ritual_type: RITUAL_TYPES.GRATITUDE,
    duration_minutes: 5,
    scheduled_time: '21:00',
    icon_name: 'heart',
    color: '#FF69B4',
    sort_order: 3,
    xp_reward: 15,
  },
  {
    name: 'Evening Meditation',
    description: 'Meditation to relax and prepare for deep sleep',
    ritual_type: RITUAL_TYPES.MEDITATION,
    duration_minutes: 15,
    scheduled_time: '22:00',
    icon_name: 'moon',
    color: '#6A5BFF',
    sort_order: 4,
    xp_reward: 20,
  },
];

// ============================================================
// localStorage CACHE HELPERS
// ============================================================

/** @type {number} Cache TTL in ms (5 minutes) */
const CACHE_DURATION = 5 * 60 * 1000;

/**
 * Read a cached value from localStorage. Returns null if expired or absent.
 *
 * @param {string} key - Cache key suffix
 * @param {string} userId - User ID for namespacing
 * @returns {*|null} Cached data or null
 * @private
 */
const getCached = (key, userId) => {
  try {
    const raw = localStorage.getItem(`ritual_${key}_${userId}`);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_DURATION) return null;
    return data;
  } catch {
    return null;
  }
};

/**
 * Write a value to the localStorage cache with a timestamp.
 *
 * @param {string} key - Cache key suffix
 * @param {*} data - Data to cache
 * @param {string} userId - User ID for namespacing
 * @private
 */
const setCache = (key, data, userId) => {
  try {
    localStorage.setItem(`ritual_${key}_${userId}`, JSON.stringify({ data, ts: Date.now() }));
  } catch {
    // localStorage full or unavailable -- ignore
  }
};

/**
 * Invalidate all ritual-related caches for a user.
 * Called after any mutation (create, update, delete, complete).
 *
 * @param {string} userId - User ID
 * @private
 */
const invalidateCache = (userId) => {
  try {
    localStorage.removeItem(`ritual_RITUALS_${userId}`);
    localStorage.removeItem(`ritual_TODAY_RITUALS_${userId}`);
    localStorage.removeItem(`ritual_RITUALS_ALL_${userId}`);
  } catch {
    // ignore
  }
};

// ============================================================
// RITUAL TRACKING SERVICE CLASS
// ============================================================

class RitualTrackingService {
  // ----------------------------------------------------------
  // RITUAL CRUD OPERATIONS
  // ----------------------------------------------------------

  /**
   * Get all rituals for a user, optionally filtering to active-only.
   * Results are cached in localStorage for 5 minutes.
   *
   * @param {string} userId - Auth user ID
   * @param {boolean} [activeOnly=true] - If true, only return active rituals
   * @returns {Promise<Array<Object>>} Array of ritual objects from user_rituals table
   */
  async getUserRituals(userId, activeOnly = true) {
    if (!userId) return [];

    try {
      const cacheKey = activeOnly ? 'RITUALS' : 'RITUALS_ALL';
      const cached = getCached(cacheKey, userId);
      if (cached) return cached;

      let query = supabase
        .from('user_rituals')
        .select('*')
        .eq('user_id', userId)
        .order('sort_order', { ascending: true });

      if (activeOnly) {
        query = query.eq('is_active', true);
      }

      const { data, error } = await query;

      if (error) throw error;

      if (data) {
        setCache(cacheKey, data, userId);
      }

      return data || [];
    } catch (error) {
      console.error('[RitualTracking] getUserRituals error:', error);
      return [];
    }
  }

  /**
   * Create a new user-defined ritual. Validates that a name is provided,
   * assigns a sort_order, persists to the database, and creates an
   * associated streak record via streakService.
   *
   * @param {string} userId - Auth user ID
   * @param {Object} ritual - Ritual data
   * @param {string} ritual.name - Ritual name (required, non-empty)
   * @param {string} [ritual.description] - Optional description
   * @param {string} [ritual.ritual_type='custom'] - One of RITUAL_TYPES
   * @param {string} [ritual.frequency='daily'] - One of RITUAL_FREQUENCIES
   * @param {number[]} [ritual.scheduled_days=[1..7]] - Days of week (1=Mon..7=Sun)
   * @param {string} [ritual.scheduled_time='08:00'] - HH:MM format
   * @param {number} [ritual.duration_minutes=10] - Expected duration
   * @param {boolean} [ritual.reminder_enabled=true] - Whether to send reminders
   * @param {number} [ritual.reminder_minutes_before=15] - Minutes before to remind
   * @param {number} [ritual.xp_reward=10] - XP awarded on completion
   * @param {string} [ritual.icon_name='sparkles'] - Icon identifier
   * @param {string} [ritual.color='#FFBD59'] - Hex colour
   * @returns {Promise<Object|null>} Created ritual row or null on error
   */
  async createRitual(userId, ritual) {
    if (!userId || !ritual) return null;

    try {
      // Basic validation
      if (!ritual.name || ritual.name.trim().length === 0) {
        console.warn('[RitualTracking] Invalid ritual: missing name');
        return null;
      }

      // Determine next sort_order
      const existingRituals = await this.getUserRituals(userId, false);
      const maxOrder = Math.max(0, ...existingRituals.map(r => r.sort_order || 0));

      const ritualData = {
        user_id: userId,
        name: ritual.name,
        description: ritual.description || null,
        ritual_type: ritual.ritual_type || RITUAL_TYPES.CUSTOM,
        frequency: ritual.frequency || RITUAL_FREQUENCIES.DAILY,
        scheduled_days: ritual.scheduled_days || [1, 2, 3, 4, 5, 6, 7],
        scheduled_time: ritual.scheduled_time || '08:00',
        duration_minutes: ritual.duration_minutes || 10,
        reminder_enabled: ritual.reminder_enabled !== false,
        reminder_minutes_before: ritual.reminder_minutes_before || 15,
        xp_reward: ritual.xp_reward || 10,
        icon_name: ritual.icon_name || 'sparkles',
        color: ritual.color || '#FFBD59',
        sort_order: maxOrder + 1,
      };

      const { data, error } = await supabase
        .from('user_rituals')
        .insert(ritualData)
        .select()
        .single();

      if (error) throw error;

      // Create associated streak record for gamification
      if (data) {
        await streakService.getOrCreateStreak(userId, STREAK_TYPES.RITUAL, data.id);
      }

      invalidateCache(userId);
      return data;
    } catch (error) {
      console.error('[RitualTracking] createRitual error:', error);
      return null;
    }
  }

  /**
   * Update an existing ritual. Only the owner (userId match) can update.
   *
   * @param {string} ritualId - UUID of the ritual to update
   * @param {string} userId - Auth user ID (for authorisation check via RLS)
   * @param {Object} updates - Partial ritual object with fields to change
   * @returns {Promise<Object|null>} Updated ritual row or null on error
   */
  async updateRitual(ritualId, userId, updates) {
    if (!ritualId || !userId) return null;

    try {
      const { data, error } = await supabase
        .from('user_rituals')
        .update(updates)
        .eq('id', ritualId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;

      invalidateCache(userId);
      return data;
    } catch (error) {
      console.error('[RitualTracking] updateRitual error:', error);
      return null;
    }
  }

  /**
   * Delete a ritual permanently. Only the owner can delete.
   *
   * @param {string} ritualId - UUID of the ritual to delete
   * @param {string} userId - Auth user ID
   * @returns {Promise<boolean>} True if deleted successfully
   */
  async deleteRitual(ritualId, userId) {
    if (!ritualId || !userId) return false;

    try {
      const { error } = await supabase
        .from('user_rituals')
        .delete()
        .eq('id', ritualId)
        .eq('user_id', userId);

      if (error) throw error;

      invalidateCache(userId);
      return true;
    } catch (error) {
      console.error('[RitualTracking] deleteRitual error:', error);
      return false;
    }
  }

  /**
   * Seed default rituals for a new user who has none.
   * First attempts the server-side RPC `initialize_default_rituals`;
   * falls back to sequential client-side inserts if the RPC does not exist.
   *
   * @param {string} userId - Auth user ID
   * @returns {Promise<number>} Number of rituals created (or existing count)
   */
  async initializeDefaultRituals(userId) {
    if (!userId) return 0;

    try {
      // Skip if user already has rituals
      const existing = await this.getUserRituals(userId, false);
      if (existing.length > 0) {
        return existing.length;
      }

      // Try server-side batch insert first
      const { data: count, error } = await supabase
        .rpc('initialize_default_rituals', { p_user_id: userId });

      if (error) {
        console.warn('[RitualTracking] RPC failed, using manual insert');
        for (const ritual of DEFAULT_RITUALS) {
          await this.createRitual(userId, ritual);
        }
        return DEFAULT_RITUALS.length;
      }

      invalidateCache(userId);
      return count || DEFAULT_RITUALS.length;
    } catch (error) {
      console.error('[RitualTracking] initializeDefaultRituals error:', error);
      return 0;
    }
  }

  // ----------------------------------------------------------
  // COMPLETION TRACKING
  // ----------------------------------------------------------

  /**
   * Mark a ritual as completed for today. Uses the server-side
   * `complete_ritual` RPC for atomic XP award + completion insert.
   * Also records streak activity via streakService.
   *
   * Duplicate completions (same ritual + same day) are handled
   * gracefully by catching unique constraint violations.
   *
   * @param {string} userId - Auth user ID
   * @param {string} ritualId - UUID of the ritual to complete
   * @param {Object} [completionData={}] - Optional completion metadata
   * @param {number} [completionData.duration_actual] - Actual duration in minutes
   * @param {number} [completionData.quality_rating] - Quality rating (1-5)
   * @param {string} [completionData.mood_before] - Mood before ritual (from MOOD_OPTIONS)
   * @param {string} [completionData.mood_after] - Mood after ritual
   * @param {string} [completionData.notes] - Free-text notes or reflection
   * @returns {Promise<{success: boolean, completionId?: string, xpEarned?: number, streakUpdated?: boolean, newStreak?: number, newBadges?: Array, alreadyCompleted?: boolean, message?: string, error?: string}>}
   */
  async completeRitual(userId, ritualId, completionData = {}) {
    if (!userId || !ritualId) return { success: false, error: 'Missing user or ritual ID' };

    try {
      const {
        duration_actual,
        quality_rating,
        mood_before,
        mood_after,
        notes,
      } = completionData;

      const { data, error } = await supabase
        .rpc('complete_ritual', {
          p_user_id: userId,
          p_ritual_id: ritualId,
          p_duration_actual: duration_actual || null,
          p_quality_rating: quality_rating || null,
          p_mood_before: mood_before || null,
          p_mood_after: mood_after || null,
          p_notes: notes || null,
        });

      if (error) throw error;

      const result = data?.[0] || data;

      // Record streak activity for gamification XP
      const streakResult = await streakService.recordActivity(userId, STREAK_TYPES.RITUAL, ritualId);

      invalidateCache(userId);

      return {
        success: true,
        completionId: result?.completion_id,
        xpEarned: result?.xp_earned || 0,
        streakUpdated: streakResult?.success,
        newStreak: streakResult?.streak || 0,
        newBadges: streakResult?.newBadges || [],
        message: 'Ritual completed!',
      };
    } catch (error) {
      // Handle duplicate completion for same day gracefully
      if (error.message?.includes('duplicate') || error.code === '23505') {
        return { success: true, alreadyCompleted: true, message: 'Already completed this ritual today!' };
      }

      console.error('[RitualTracking] completeRitual error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get today's ritual status including which are completed and
   * which are still pending. Includes summary metrics like completion rate.
   *
   * @param {string} userId - Auth user ID
   * @returns {Promise<{rituals: Array, completedCount: number, totalCount: number, completionRate: number, isPerfectDay: boolean, nextRitual: Object|null}|null>}
   */
  async getTodayStatus(userId) {
    if (!userId) return null;

    try {
      const cached = getCached('TODAY_RITUALS', userId);
      if (cached) return cached;

      const { data, error } = await supabase
        .rpc('get_today_ritual_status', { p_user_id: userId });

      if (error) throw error;

      const rituals = data || [];
      const completed = rituals.filter(r => r.is_completed).length;
      const total = rituals.length;

      const status = {
        rituals,
        completedCount: completed,
        totalCount: total,
        completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
        isPerfectDay: completed === total && total > 0,
        nextRitual: rituals.find(r => !r.is_completed) || null,
      };

      setCache('TODAY_RITUALS', status, userId);
      return status;
    } catch (error) {
      console.error('[RitualTracking] getTodayStatus error:', error);
      return null;
    }
  }

  /**
   * Get ritual completions within a date range.
   * Each completion includes its parent ritual info (name, type, icon, colour).
   *
   * @param {string} userId - Auth user ID
   * @param {string} startDate - Start date in YYYY-MM-DD format
   * @param {string} endDate - End date in YYYY-MM-DD format
   * @returns {Promise<Array<Object>>} Completion records with joined ritual data
   */
  async getCompletions(userId, startDate, endDate) {
    if (!userId) return [];

    try {
      const { data, error } = await supabase
        .from('ritual_completions')
        .select(`
          *,
          ritual:user_rituals(id, name, ritual_type, icon_name, color)
        `)
        .eq('user_id', userId)
        .gte('completion_date', startDate)
        .lte('completion_date', endDate)
        .order('completed_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('[RitualTracking] getCompletions error:', error);
      return [];
    }
  }

  /**
   * Get calendar-view data for ritual completions. Returns one row
   * per day with completion counts, used for heatmap/calendar rendering.
   *
   * @param {string} userId - Auth user ID
   * @param {string} startDate - Start date in YYYY-MM-DD format
   * @param {string} endDate - End date in YYYY-MM-DD format
   * @returns {Promise<Array<{date: string, completed: number, total: number}>>}
   */
  async getCalendarData(userId, startDate, endDate) {
    if (!userId) return [];

    try {
      const { data, error } = await supabase
        .rpc('get_ritual_calendar', {
          p_user_id: userId,
          p_start_date: startDate,
          p_end_date: endDate,
        });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('[RitualTracking] getCalendarData error:', error);
      return [];
    }
  }

  // ----------------------------------------------------------
  // STATISTICS & ANALYTICS
  // ----------------------------------------------------------

  /**
   * Get ritual performance statistics over a given number of days.
   * Can return stats for a specific ritual or all rituals combined.
   *
   * @param {string} userId - Auth user ID
   * @param {string|null} [ritualId=null] - Specific ritual UUID, or null for all
   * @param {number} [days=30] - Number of days to analyse
   * @returns {Promise<{completion_rate: number, total_completions: number, total_xp: number, avg_quality: number, ...}|null>}
   */
  async getRitualStats(userId, ritualId = null, days = 30) {
    if (!userId) return null;

    try {
      const { data, error } = await supabase
        .rpc('get_ritual_stats', {
          p_user_id: userId,
          p_ritual_id: ritualId,
          p_days: days,
        });

      if (error) throw error;
      return data?.[0] || data || null;
    } catch (error) {
      console.error('[RitualTracking] getRitualStats error:', error);
      return null;
    }
  }

  /**
   * Generate a contextual coaching message based on today's progress
   * and recent performance. Used by the AI coach or ritual dashboard.
   *
   * Returns different message types:
   * - 'encouragement': No rituals set up yet
   * - 'celebration': Perfect day (all rituals completed)
   * - 'reminder': Time-sensitive nudge for the next pending ritual
   * - 'praise': High weekly completion rate (>=80%)
   * - 'encouragement': Moderate rate (>=50%)
   * - 'motivation': Low rate (<50%)
   *
   * @param {string} userId - Auth user ID
   * @returns {Promise<{type: string, message: string, icon?: string, color?: string, ritualId?: string, action?: string}|null>}
   */
  async getCoachingMessage(userId) {
    if (!userId) return null;

    try {
      const todayStatus = await this.getTodayStatus(userId);
      const stats = await this.getRitualStats(userId, null, 7);

      if (!todayStatus) {
        return {
          type: 'encouragement',
          message: 'Add your first ritual to start your journey!',
          action: 'create_ritual',
        };
      }

      // Perfect day celebration
      if (todayStatus.isPerfectDay) {
        return {
          type: 'celebration',
          message: 'Amazing! You completed all rituals today! Your energy is shining!',
          icon: 'star',
          color: '#FFD700',
        };
      }

      // Time-based reminder for next pending ritual
      if (todayStatus.nextRitual) {
        const hour = new Date().getHours();
        const ritualHour = parseInt(todayStatus.nextRitual.scheduled_time?.split(':')[0] || '8');

        if (hour >= ritualHour) {
          return {
            type: 'reminder',
            message: `Time for "${todayStatus.nextRitual.ritual_name}"! Take ${todayStatus.nextRitual.duration_minutes || 10} minutes for yourself.`,
            ritualId: todayStatus.nextRitual.ritual_id,
            icon: 'clock',
          };
        }
      }

      // Performance-based messages
      const completionRate = stats?.completion_rate || 0;

      if (completionRate >= 80) {
        return {
          type: 'praise',
          message: `Great job! ${Math.round(completionRate)}% completion rate this week. Keep it up!`,
          icon: 'trophy',
        };
      }

      if (completionRate >= 50) {
        return {
          type: 'encouragement',
          message: 'You are doing well! Every small step brings you closer to your best self.',
          icon: 'trending-up',
        };
      }

      return {
        type: 'motivation',
        message: 'Every day is a new opportunity. Start with one small ritual today!',
        icon: 'sunrise',
      };
    } catch (error) {
      console.error('[RitualTracking] getCoachingMessage error:', error);
      return null;
    }
  }

  /**
   * Get the daily ritual progress as a percentage (0-100).
   * Convenience wrapper around getTodayStatus for dashboard widgets.
   *
   * @param {string} userId - Auth user ID
   * @returns {Promise<{completed: number, total: number, percent: number}>}
   */
  async getDailyProgress(userId) {
    if (!userId) return { completed: 0, total: 0, percent: 0 };

    try {
      const status = await this.getTodayStatus(userId);
      if (!status) return { completed: 0, total: 0, percent: 0 };

      return {
        completed: status.completedCount,
        total: status.totalCount,
        percent: status.completionRate,
      };
    } catch (error) {
      console.error('[RitualTracking] getDailyProgress error:', error);
      return { completed: 0, total: 0, percent: 0 };
    }
  }

  // ----------------------------------------------------------
  // UTILITY METHODS
  // ----------------------------------------------------------

  /**
   * Get the RITUAL_TYPES enum.
   *
   * @returns {Object<string, string>}
   */
  getRitualTypes() {
    return RITUAL_TYPES;
  }

  /**
   * Get the MOOD_OPTIONS array for rendering mood selectors.
   *
   * @returns {Array<{value: string, label: string, icon: string, color: string}>}
   */
  getMoodOptions() {
    return MOOD_OPTIONS;
  }

  /**
   * Get the RITUAL_FREQUENCIES enum.
   *
   * @returns {Object<string, string>}
   */
  getFrequencyOptions() {
    return RITUAL_FREQUENCIES;
  }

  /**
   * Get display metadata (label, icon, colour) for a ritual type.
   *
   * @param {string} ritualType - One of RITUAL_TYPES values
   * @returns {{label: string, icon: string, color: string}}
   */
  getRitualTypeInfo(ritualType) {
    const typeInfo = {
      [RITUAL_TYPES.MEDITATION]: { label: 'Meditation', icon: 'cloud', color: '#87CEEB' },
      [RITUAL_TYPES.AFFIRMATION]: { label: 'Affirmation', icon: 'sparkles', color: '#FFD700' },
      [RITUAL_TYPES.GRATITUDE]: { label: 'Gratitude', icon: 'heart', color: '#FF69B4' },
      [RITUAL_TYPES.JOURNALING]: { label: 'Journaling', icon: 'book', color: '#DDA0DD' },
      [RITUAL_TYPES.EXERCISE]: { label: 'Exercise', icon: 'activity', color: '#32CD32' },
      [RITUAL_TYPES.READING]: { label: 'Reading', icon: 'book-open', color: '#8B4513' },
      [RITUAL_TYPES.BREATHING]: { label: 'Breathing', icon: 'wind', color: '#ADD8E6' },
      [RITUAL_TYPES.VISUALIZATION]: { label: 'Visualization', icon: 'eye', color: '#9370DB' },
      [RITUAL_TYPES.CUSTOM]: { label: 'Custom', icon: 'star', color: '#FFBD59' },
    };

    return typeInfo[ritualType] || typeInfo[RITUAL_TYPES.CUSTOM];
  }

  /**
   * Convert a frequency enum value to an array of day numbers (1=Mon..7=Sun).
   * Useful for building schedule displays or validation.
   *
   * @param {string} frequency - One of RITUAL_FREQUENCIES values
   * @returns {number[]} Array of day numbers
   */
  getDaysFromFrequency(frequency) {
    switch (frequency) {
      case RITUAL_FREQUENCIES.DAILY: return [1, 2, 3, 4, 5, 6, 7];
      case RITUAL_FREQUENCIES.WEEKDAYS: return [1, 2, 3, 4, 5];
      case RITUAL_FREQUENCIES.WEEKENDS: return [6, 7];
      case RITUAL_FREQUENCIES.WEEKLY: return [1]; // Monday by default
      default: return [1, 2, 3, 4, 5, 6, 7];
    }
  }

  /**
   * Get the default rituals list (for display or manual seeding).
   *
   * @returns {Array<Object>} Default ritual definitions
   */
  getDefaultRituals() {
    return DEFAULT_RITUALS;
  }

  /**
   * Clear all localStorage caches for a user.
   * Call this on logout to prevent stale data across accounts.
   *
   * @param {string} userId - Auth user ID
   */
  clearCache(userId) {
    if (userId) {
      invalidateCache(userId);
    }
  }
}

// ============================================================
// SINGLETON & EXPORTS
// ============================================================

export const ritualTrackingService = new RitualTrackingService();

// Named exports for tree-shaking and direct imports
export const getUserRituals = (...args) => ritualTrackingService.getUserRituals(...args);
export const createRitual = (...args) => ritualTrackingService.createRitual(...args);
export const updateRitual = (...args) => ritualTrackingService.updateRitual(...args);
export const deleteRitual = (...args) => ritualTrackingService.deleteRitual(...args);
export const initializeDefaultRituals = (...args) => ritualTrackingService.initializeDefaultRituals(...args);
export const completeRitual = (...args) => ritualTrackingService.completeRitual(...args);
export const getTodayStatus = (...args) => ritualTrackingService.getTodayStatus(...args);
export const getCompletions = (...args) => ritualTrackingService.getCompletions(...args);
export const getCalendarData = (...args) => ritualTrackingService.getCalendarData(...args);
export const getRitualStats = (...args) => ritualTrackingService.getRitualStats(...args);
export const getCoachingMessage = (...args) => ritualTrackingService.getCoachingMessage(...args);
export const getDailyProgress = (...args) => ritualTrackingService.getDailyProgress(...args);

export default ritualTrackingService;
