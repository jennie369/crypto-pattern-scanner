/**
 * Reading History Service
 * Handles CRUD operations for Tarot and I-Ching reading history
 */

import { supabase } from './supabase';

const PAGE_SIZE = 20;

class ReadingHistoryService {
  /**
   * Save a tarot reading to history
   * @param {string} userId - User ID
   * @param {Object} readingData - Reading data
   * @returns {Promise<{data: Object|null, error: string|null}>}
   */
  async saveTarotReading(userId, readingData) {
    try {
      if (!userId) {
        return { data: null, error: 'User ID required' };
      }

      const { data, error } = await supabase
        .from('tarot_readings')
        .insert({
          user_id: userId,
          spread_type: readingData.spreadType || readingData.spread_type,
          spread_id: readingData.spreadId || readingData.spread_id,
          question: readingData.question || null,
          life_area: readingData.lifeArea || readingData.life_area || 'general',
          cards: readingData.cards || [],
          overall_interpretation: readingData.overallInterpretation || readingData.overall_interpretation || null,
          ai_interpretation: readingData.aiInterpretation || readingData.ai_interpretation || null,
          crystal_recommendations: readingData.crystalRecommendations || readingData.crystal_recommendations || [],
          affirmation: readingData.affirmation || null,
          reversed_enabled: readingData.reversedEnabled || readingData.reversed_enabled || false,
          reading_duration_seconds: readingData.readingDuration || readingData.reading_duration_seconds || null,
        })
        .select()
        .single();

      if (error) {
        console.error('[ReadingHistoryService] saveTarotReading error:', error);
        return { data: null, error: error.message };
      }

      console.log('[ReadingHistoryService] Tarot reading saved:', data?.id);
      return { data, error: null };
    } catch (err) {
      console.error('[ReadingHistoryService] saveTarotReading exception:', err);
      return { data: null, error: err?.message || 'Unknown error' };
    }
  }

  /**
   * Save an I-Ching reading to history
   * @param {string} userId - User ID
   * @param {Object} readingData - Reading data
   * @returns {Promise<{data: Object|null, error: string|null}>}
   */
  async saveIChingReading(userId, readingData) {
    try {
      if (!userId) {
        return { data: null, error: 'User ID required' };
      }

      const { data, error } = await supabase
        .from('iching_readings')
        .insert({
          user_id: userId,
          question: readingData.question || null,
          life_area: readingData.lifeArea || readingData.life_area || 'general',
          present_hexagram: readingData.presentHexagram || readingData.present_hexagram,
          changing_lines: readingData.changingLines || readingData.changing_lines || [],
          future_hexagram: readingData.futureHexagram || readingData.future_hexagram || null,
          cast_results: readingData.castResults || readingData.cast_results || [],
          present_interpretation: readingData.presentInterpretation || readingData.present_interpretation || null,
          changing_interpretation: readingData.changingInterpretation || readingData.changing_interpretation || null,
          future_interpretation: readingData.futureInterpretation || readingData.future_interpretation || null,
          overall_interpretation: readingData.overallInterpretation || readingData.overall_interpretation || null,
          ai_interpretation: readingData.aiInterpretation || readingData.ai_interpretation || null,
          crystal_recommendations: readingData.crystalRecommendations || readingData.crystal_recommendations || [],
          affirmation: readingData.affirmation || null,
          casting_method: readingData.castingMethod || readingData.casting_method || 'random',
        })
        .select()
        .single();

      if (error) {
        console.error('[ReadingHistoryService] saveIChingReading error:', error);
        return { data: null, error: error.message };
      }

      console.log('[ReadingHistoryService] I-Ching reading saved:', data?.id);
      return { data, error: null };
    } catch (err) {
      console.error('[ReadingHistoryService] saveIChingReading exception:', err);
      return { data: null, error: err?.message || 'Unknown error' };
    }
  }

  /**
   * Get reading history using RPC function
   * @param {string} userId - User ID
   * @param {Object} options - Query options
   * @returns {Promise<{data: Array, hasMore: boolean, error: string|null}>}
   */
  async getReadings(userId, options = {}) {
    try {
      const {
        type = 'all', // 'all', 'tarot', 'iching'
        lifeArea = null,
        starredOnly = false,
        page = 0,
        limit = PAGE_SIZE,
      } = options;

      const { data, error } = await supabase.rpc('get_reading_history', {
        p_user_id: userId,
        p_type: type,
        p_life_area: lifeArea,
        p_starred_only: starredOnly,
        p_limit: limit + 1, // Get one extra to check hasMore
        p_offset: page * limit,
      });

      if (error) {
        console.error('[ReadingHistoryService] getReadings error:', error);
        return { data: [], hasMore: false, error: error.message };
      }

      const hasMore = data?.length > limit;
      const readings = hasMore ? data.slice(0, limit) : data || [];

      return { data: readings, hasMore, error: null };
    } catch (err) {
      console.error('[ReadingHistoryService] getReadings exception:', err);
      return { data: [], hasMore: false, error: err?.message || 'Unknown error' };
    }
  }

  /**
   * Get a single tarot reading by ID
   * @param {string} readingId - Reading ID
   * @param {string} userId - User ID for security check
   * @returns {Promise<{data: Object|null, error: string|null}>}
   */
  async getTarotReadingById(readingId, userId) {
    try {
      const { data, error } = await supabase
        .from('tarot_readings')
        .select('*')
        .eq('id', readingId)
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('[ReadingHistoryService] getTarotReadingById error:', error);
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (err) {
      console.error('[ReadingHistoryService] getTarotReadingById exception:', err);
      return { data: null, error: err?.message || 'Unknown error' };
    }
  }

  /**
   * Get a single I-Ching reading by ID
   * @param {string} readingId - Reading ID
   * @param {string} userId - User ID for security check
   * @returns {Promise<{data: Object|null, error: string|null}>}
   */
  async getIChingReadingById(readingId, userId) {
    try {
      const { data, error } = await supabase
        .from('iching_readings')
        .select('*')
        .eq('id', readingId)
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('[ReadingHistoryService] getIChingReadingById error:', error);
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (err) {
      console.error('[ReadingHistoryService] getIChingReadingById exception:', err);
      return { data: null, error: err?.message || 'Unknown error' };
    }
  }

  /**
   * Toggle star status for a reading
   * @param {string} readingId - Reading ID
   * @param {string} type - 'tarot' or 'iching'
   * @returns {Promise<{data: boolean|null, error: string|null}>}
   */
  async toggleStar(readingId, type) {
    try {
      const { data, error } = await supabase.rpc('toggle_reading_star', {
        p_reading_id: readingId,
        p_type: type,
      });

      if (error) {
        console.error('[ReadingHistoryService] toggleStar error:', error);
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (err) {
      console.error('[ReadingHistoryService] toggleStar exception:', err);
      return { data: null, error: err?.message || 'Unknown error' };
    }
  }

  /**
   * Update notes for a tarot reading
   * @param {string} readingId - Reading ID
   * @param {string} userId - User ID
   * @param {string} notes - Notes text
   * @returns {Promise<{data: Object|null, error: string|null}>}
   */
  async updateTarotNotes(readingId, userId, notes) {
    try {
      const { data, error } = await supabase
        .from('tarot_readings')
        .update({ notes })
        .eq('id', readingId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('[ReadingHistoryService] updateTarotNotes error:', error);
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (err) {
      console.error('[ReadingHistoryService] updateTarotNotes exception:', err);
      return { data: null, error: err?.message || 'Unknown error' };
    }
  }

  /**
   * Update notes for an I-Ching reading
   * @param {string} readingId - Reading ID
   * @param {string} userId - User ID
   * @param {string} notes - Notes text
   * @returns {Promise<{data: Object|null, error: string|null}>}
   */
  async updateIChingNotes(readingId, userId, notes) {
    try {
      const { data, error } = await supabase
        .from('iching_readings')
        .update({ notes })
        .eq('id', readingId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('[ReadingHistoryService] updateIChingNotes error:', error);
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (err) {
      console.error('[ReadingHistoryService] updateIChingNotes exception:', err);
      return { data: null, error: err?.message || 'Unknown error' };
    }
  }

  /**
   * Delete a tarot reading
   * @param {string} readingId - Reading ID
   * @param {string} userId - User ID
   * @returns {Promise<{success: boolean, error: string|null}>}
   */
  async deleteTarotReading(readingId, userId) {
    try {
      const { error } = await supabase
        .from('tarot_readings')
        .delete()
        .eq('id', readingId)
        .eq('user_id', userId);

      if (error) {
        console.error('[ReadingHistoryService] deleteTarotReading error:', error);
        return { success: false, error: error.message };
      }

      return { success: true, error: null };
    } catch (err) {
      console.error('[ReadingHistoryService] deleteTarotReading exception:', err);
      return { success: false, error: err?.message || 'Unknown error' };
    }
  }

  /**
   * Delete an I-Ching reading
   * @param {string} readingId - Reading ID
   * @param {string} userId - User ID
   * @returns {Promise<{success: boolean, error: string|null}>}
   */
  async deleteIChingReading(readingId, userId) {
    try {
      const { error } = await supabase
        .from('iching_readings')
        .delete()
        .eq('id', readingId)
        .eq('user_id', userId);

      if (error) {
        console.error('[ReadingHistoryService] deleteIChingReading error:', error);
        return { success: false, error: error.message };
      }

      return { success: true, error: null };
    } catch (err) {
      console.error('[ReadingHistoryService] deleteIChingReading exception:', err);
      return { success: false, error: err?.message || 'Unknown error' };
    }
  }

  /**
   * Get reading statistics for a user
   * @param {string} userId - User ID
   * @returns {Promise<{data: Object|null, error: string|null}>}
   */
  async getReadingStats(userId) {
    try {
      const { data, error } = await supabase.rpc('get_reading_stats', {
        p_user_id: userId,
      });

      if (error) {
        console.error('[ReadingHistoryService] getReadingStats error:', error);
        return { data: null, error: error.message };
      }

      // RPC returns array, get first row
      const stats = data?.[0] || {
        total_readings: 0,
        tarot_count: 0,
        iching_count: 0,
        starred_count: 0,
        this_week_count: 0,
      };

      return { data: stats, error: null };
    } catch (err) {
      console.error('[ReadingHistoryService] getReadingStats exception:', err);
      return { data: null, error: err?.message || 'Unknown error' };
    }
  }

  /**
   * Link reading to a vision goal
   * @param {string} readingId - Reading ID
   * @param {string} type - 'tarot' or 'iching'
   * @param {string} goalId - Vision goal ID
   * @param {string} userId - User ID
   * @returns {Promise<{success: boolean, error: string|null}>}
   */
  async linkToVisionGoal(readingId, type, goalId, userId) {
    try {
      const table = type === 'tarot' ? 'tarot_readings' : 'iching_readings';

      const { error } = await supabase
        .from(table)
        .update({ vision_goal_id: goalId })
        .eq('id', readingId)
        .eq('user_id', userId);

      if (error) {
        console.error('[ReadingHistoryService] linkToVisionGoal error:', error);
        return { success: false, error: error.message };
      }

      return { success: true, error: null };
    } catch (err) {
      console.error('[ReadingHistoryService] linkToVisionGoal exception:', err);
      return { success: false, error: err?.message || 'Unknown error' };
    }
  }
}

export const readingHistoryService = new ReadingHistoryService();
export default readingHistoryService;
