/**
 * RITUAL TRACKING SERVICE
 * Smart ritual and habit tracking with gamification integration
 * Handles ritual CRUD, completions, statistics, and coaching
 */

import { supabase } from './supabase';
import cacheService from './cacheService';
import { streakService, STREAK_TYPES } from './streakService';
import { validationService } from './validationService';

// ============================================================
// RITUAL CONSTANTS
// ============================================================

const RITUAL_TYPES = {
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

const RITUAL_FREQUENCIES = {
  DAILY: 'daily',
  WEEKDAYS: 'weekdays',
  WEEKENDS: 'weekends',
  WEEKLY: 'weekly',
  CUSTOM: 'custom',
};

const MOOD_OPTIONS = [
  { value: 'anxious', label: 'Lo lắng', icon: 'frown', color: '#DDA0DD' },
  { value: 'tired', label: 'Mệt mỏi', icon: 'battery-low', color: '#808080' },
  { value: 'neutral', label: 'Bình thường', icon: 'minus-circle', color: '#A9A9A9' },
  { value: 'focused', label: 'Tập trung', icon: 'target', color: '#4169E1' },
  { value: 'calm', label: 'Bình tĩnh', icon: 'cloud', color: '#87CEEB' },
  { value: 'energized', label: 'Tràn đầy năng lượng', icon: 'zap', color: '#FFD700' },
  { value: 'peaceful', label: 'An yên', icon: 'sun', color: '#90EE90' },
  { value: 'grateful', label: 'Biết ơn', icon: 'heart', color: '#FF69B4' },
  { value: 'joyful', label: 'Vui vẻ', icon: 'smile', color: '#FFA500' },
];

// Default rituals for new users
const DEFAULT_RITUALS = [
  {
    name: 'Thiền buổi sáng',
    description: 'Thiền định 10 phút để bắt đầu ngày mới với tâm an tĩnh',
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
    description: 'Đọc và cảm nhận các khẳng định tích cực để nâng cao tần số',
    ritual_type: RITUAL_TYPES.AFFIRMATION,
    duration_minutes: 5,
    scheduled_time: '07:00',
    icon_name: 'sparkles',
    color: '#FFD700',
    sort_order: 2,
    xp_reward: 10,
  },
  {
    name: 'Nhật ký biết ơn',
    description: 'Viết 3 điều biết ơn trong ngày để nuôi dưỡng lòng biết ơn',
    ritual_type: RITUAL_TYPES.GRATITUDE,
    duration_minutes: 5,
    scheduled_time: '21:00',
    icon_name: 'heart',
    color: '#FF69B4',
    sort_order: 3,
    xp_reward: 15,
  },
  {
    name: 'Thiền trước ngủ',
    description: 'Thiền định để thư giãn và chuẩn bị cho giấc ngủ sâu',
    ritual_type: RITUAL_TYPES.MEDITATION,
    duration_minutes: 15,
    scheduled_time: '22:00',
    icon_name: 'moon',
    color: '#6A5BFF',
    sort_order: 4,
    xp_reward: 20,
  },
];

class RitualTrackingService {
  // ============================================================
  // RITUAL CRUD OPERATIONS
  // ============================================================

  /**
   * Get all rituals for user
   * @param {string} userId - User ID
   * @param {boolean} activeOnly - Only active rituals
   * @returns {Promise<Array>} Array of rituals
   */
  async getUserRituals(userId, activeOnly = true) {
    if (!userId) return [];

    try {
      // Check cache
      const cacheKey = activeOnly ? 'RITUALS' : 'RITUALS_ALL';
      const cached = await cacheService.getForUser(cacheKey, userId);
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

      // Cache results
      if (data) {
        await cacheService.setForUser(cacheKey, data, userId);
      }

      return data || [];
    } catch (error) {
      console.error('[RitualTracking] getUserRituals error:', error);
      return [];
    }
  }

  /**
   * Create a new ritual
   * @param {string} userId - User ID
   * @param {Object} ritual - Ritual data
   * @returns {Promise<Object|null>} Created ritual
   */
  async createRitual(userId, ritual) {
    if (!userId || !ritual) return null;

    try {
      // Validate ritual data
      const validation = validationService.validateRitual(ritual);
      if (!validation.valid) {
        console.warn('[RitualTracking] Invalid ritual:', validation.errors);
        return null;
      }

      // Get current max sort order
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

      // Create associated streak
      if (data) {
        await streakService.getOrCreateStreak(userId, STREAK_TYPES.RITUAL, data.id);
      }

      // Invalidate cache
      await this._invalidateCache(userId);

      return data;
    } catch (error) {
      console.error('[RitualTracking] createRitual error:', error);
      return null;
    }
  }

  /**
   * Update a ritual
   * @param {string} ritualId - Ritual ID
   * @param {string} userId - User ID (for authorization)
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object|null>} Updated ritual
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

      // Invalidate cache
      await this._invalidateCache(userId);

      return data;
    } catch (error) {
      console.error('[RitualTracking] updateRitual error:', error);
      return null;
    }
  }

  /**
   * Delete a ritual
   * @param {string} ritualId - Ritual ID
   * @param {string} userId - User ID (for authorization)
   * @returns {Promise<boolean>} Success status
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

      // Invalidate cache
      await this._invalidateCache(userId);

      return true;
    } catch (error) {
      console.error('[RitualTracking] deleteRitual error:', error);
      return false;
    }
  }

  /**
   * Initialize default rituals for new user
   * @param {string} userId - User ID
   * @returns {Promise<number>} Number of rituals created
   */
  async initializeDefaultRituals(userId) {
    if (!userId) return 0;

    try {
      // Check if user already has rituals
      const existing = await this.getUserRituals(userId, false);
      if (existing.length > 0) {
        return existing.length;
      }

      // Try RPC function first
      const { data: count, error } = await supabase
        .rpc('initialize_default_rituals', { p_user_id: userId });

      if (error) {
        console.warn('[RitualTracking] RPC failed, using manual insert');
        // Fallback to manual insert
        for (const ritual of DEFAULT_RITUALS) {
          await this.createRitual(userId, ritual);
        }
        return DEFAULT_RITUALS.length;
      }

      // Invalidate cache
      await this._invalidateCache(userId);

      return count || DEFAULT_RITUALS.length;
    } catch (error) {
      console.error('[RitualTracking] initializeDefaultRituals error:', error);
      return 0;
    }
  }

  // ============================================================
  // COMPLETION TRACKING
  // ============================================================

  /**
   * Complete a ritual
   * @param {string} userId - User ID
   * @param {string} ritualId - Ritual ID
   * @param {Object} completionData - Completion details
   * @returns {Promise<Object>} Completion result
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
        reflection,
      } = completionData;

      // Use RPC function for atomic operation
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

      // Record streak activity
      const streakResult = await streakService.recordActivity(userId, STREAK_TYPES.RITUAL, ritualId);

      // Invalidate cache
      await this._invalidateCache(userId);

      return {
        success: true,
        completionId: result?.completion_id,
        xpEarned: result?.xp_earned || 0,
        streakUpdated: streakResult?.success,
        newStreak: streakResult?.streak || 0,
        newBadges: streakResult?.newBadges || [],
        message: 'Tuyệt vời! Đã hoàn thành ritual!',
      };
    } catch (error) {
      // Check if duplicate completion
      if (error.message?.includes('duplicate') || error.code === '23505') {
        return {
          success: true,
          alreadyCompleted: true,
          message: 'Bạn đã hoàn thành ritual này hôm nay rồi!',
        };
      }

      console.error('[RitualTracking] completeRitual error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get today's ritual status
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Today's status
   */
  async getTodayStatus(userId) {
    if (!userId) return null;

    try {
      // Check cache
      const cached = await cacheService.getForUser('TODAY_RITUALS', userId);
      if (cached) return cached;

      // Use RPC function
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

      // Cache for short time
      await cacheService.setForUser('TODAY_RITUALS', status, userId);

      return status;
    } catch (error) {
      console.error('[RitualTracking] getTodayStatus error:', error);
      return null;
    }
  }

  /**
   * Get completions for date range
   * @param {string} userId - User ID
   * @param {string} startDate - Start date (YYYY-MM-DD)
   * @param {string} endDate - End date (YYYY-MM-DD)
   * @returns {Promise<Array>} Completions
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
   * Get calendar data for ritual completions
   * @param {string} userId - User ID
   * @param {string} startDate - Start date
   * @param {string} endDate - End date
   * @returns {Promise<Array>} Calendar data
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

  // ============================================================
  // STATISTICS & ANALYTICS
  // ============================================================

  /**
   * Get ritual statistics
   * @param {string} userId - User ID
   * @param {string} ritualId - Optional specific ritual
   * @param {number} days - Days to analyze
   * @returns {Promise<Object>} Statistics
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
   * Get coaching message based on performance
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Coaching message
   */
  async getCoachingMessage(userId) {
    if (!userId) return null;

    try {
      const todayStatus = await this.getTodayStatus(userId);
      const stats = await this.getRitualStats(userId, null, 7);

      if (!todayStatus) {
        return {
          type: 'encouragement',
          message: 'Hãy thêm ritual đầu tiên để bắt đầu hành trình!',
          action: 'create_ritual',
        };
      }

      // Perfect day
      if (todayStatus.isPerfectDay) {
        return {
          type: 'celebration',
          message: 'Tuyệt vời! Bạn đã hoàn thành tất cả ritual hôm nay! Năng lượng của bạn đang tỏa sáng!',
          icon: 'star',
          color: '#FFD700',
        };
      }

      // Has uncompleted rituals
      if (todayStatus.nextRitual) {
        const hour = new Date().getHours();
        const ritualHour = parseInt(todayStatus.nextRitual.scheduled_time?.split(':')[0] || '8');

        if (hour >= ritualHour) {
          return {
            type: 'reminder',
            message: `Đã đến giờ "${todayStatus.nextRitual.ritual_name}"! Hãy dành ${todayStatus.nextRitual.duration_minutes || 10} phút cho bản thân.`,
            ritualId: todayStatus.nextRitual.ritual_id,
            icon: 'clock',
          };
        }
      }

      // Check completion rate
      const completionRate = stats?.completion_rate || 0;

      if (completionRate >= 80) {
        return {
          type: 'praise',
          message: `Tuyệt vời! Tỷ lệ hoàn thành ${Math.round(completionRate)}% trong tuần. Hãy tiếp tục duy trì!`,
          icon: 'trophy',
        };
      }

      if (completionRate >= 50) {
        return {
          type: 'encouragement',
          message: 'Bạn đang làm tốt! Mỗi bước nhỏ đều đưa bạn gần hơn đến phiên bản tốt nhất.',
          icon: 'trending-up',
        };
      }

      return {
        type: 'motivation',
        message: 'Mỗi ngày là cơ hội mới. Hãy bắt đầu với một ritual nhỏ hôm nay!',
        icon: 'sunrise',
      };
    } catch (error) {
      console.error('[RitualTracking] getCoachingMessage error:', error);
      return null;
    }
  }

  // ============================================================
  // UTILITY METHODS
  // ============================================================

  /**
   * Get ritual types
   * @returns {Object} Ritual types enum
   */
  getRitualTypes() {
    return RITUAL_TYPES;
  }

  /**
   * Get mood options
   * @returns {Array} Mood options
   */
  getMoodOptions() {
    return MOOD_OPTIONS;
  }

  /**
   * Get frequency options
   * @returns {Object} Frequency enum
   */
  getFrequencyOptions() {
    return RITUAL_FREQUENCIES;
  }

  /**
   * Clear user's cache
   * @private
   */
  async _invalidateCache(userId) {
    if (!userId) return;

    await Promise.all([
      cacheService.invalidate('RITUALS', userId),
      cacheService.invalidate('TODAY_RITUALS', userId),
      cacheService.invalidate('RITUALS_ALL', userId),
    ]);
  }

  /**
   * Get ritual type display info
   * @param {string} ritualType - Ritual type
   * @returns {Object} Display info
   */
  getRitualTypeInfo(ritualType) {
    const typeInfo = {
      [RITUAL_TYPES.MEDITATION]: { label: 'Thiền định', icon: 'cloud', color: '#87CEEB' },
      [RITUAL_TYPES.AFFIRMATION]: { label: 'Affirmation', icon: 'sparkles', color: '#FFD700' },
      [RITUAL_TYPES.GRATITUDE]: { label: 'Biết ơn', icon: 'heart', color: '#FF69B4' },
      [RITUAL_TYPES.JOURNALING]: { label: 'Nhật ký', icon: 'book', color: '#DDA0DD' },
      [RITUAL_TYPES.EXERCISE]: { label: 'Tập thể dục', icon: 'activity', color: '#32CD32' },
      [RITUAL_TYPES.READING]: { label: 'Đọc sách', icon: 'book-open', color: '#8B4513' },
      [RITUAL_TYPES.BREATHING]: { label: 'Hít thở', icon: 'wind', color: '#ADD8E6' },
      [RITUAL_TYPES.VISUALIZATION]: { label: 'Hình dung', icon: 'eye', color: '#9370DB' },
      [RITUAL_TYPES.CUSTOM]: { label: 'Tùy chỉnh', icon: 'star', color: '#FFBD59' },
    };

    return typeInfo[ritualType] || typeInfo[RITUAL_TYPES.CUSTOM];
  }

  /**
   * Calculate days array from frequency
   * @param {string} frequency - Frequency type
   * @returns {Array} Days array (1-7)
   */
  getDaysFromFrequency(frequency) {
    switch (frequency) {
      case RITUAL_FREQUENCIES.DAILY:
        return [1, 2, 3, 4, 5, 6, 7];
      case RITUAL_FREQUENCIES.WEEKDAYS:
        return [1, 2, 3, 4, 5];
      case RITUAL_FREQUENCIES.WEEKENDS:
        return [6, 7];
      case RITUAL_FREQUENCIES.WEEKLY:
        return [1]; // Monday by default
      default:
        return [1, 2, 3, 4, 5, 6, 7];
    }
  }
}

// Export singleton instance
export const ritualTrackingService = new RitualTrackingService();
export default ritualTrackingService;

// Export constants
export { RITUAL_TYPES, RITUAL_FREQUENCIES, MOOD_OPTIONS, DEFAULT_RITUALS };
