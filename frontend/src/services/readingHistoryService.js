/**
 * Reading History Service (Web)
 * Ported from gem-mobile/src/services/readingHistoryService.js
 *
 * Handles CRUD operations for Tarot and I-Ching reading history
 */

import { supabase } from '../lib/supabaseClient';

const PAGE_SIZE = 20;

class ReadingHistoryService {
  /**
   * Save a tarot reading to history
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
   */
  async getReadings(userId, options = {}) {
    try {
      const {
        type = 'all',
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
        p_limit: limit + 1,
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
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (err) {
      return { data: null, error: err?.message || 'Unknown error' };
    }
  }

  /**
   * Update notes for an I-Ching reading
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
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (err) {
      return { data: null, error: err?.message || 'Unknown error' };
    }
  }

  /**
   * Delete a tarot reading
   */
  async deleteTarotReading(readingId, userId) {
    try {
      const { error } = await supabase
        .from('tarot_readings')
        .delete()
        .eq('id', readingId)
        .eq('user_id', userId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, error: null };
    } catch (err) {
      return { success: false, error: err?.message || 'Unknown error' };
    }
  }

  /**
   * Delete an I-Ching reading
   */
  async deleteIChingReading(readingId, userId) {
    try {
      const { error } = await supabase
        .from('iching_readings')
        .delete()
        .eq('id', readingId)
        .eq('user_id', userId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, error: null };
    } catch (err) {
      return { success: false, error: err?.message || 'Unknown error' };
    }
  }

  /**
   * Get reading statistics for a user
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
        return { success: false, error: error.message };
      }

      return { success: true, error: null };
    } catch (err) {
      return { success: false, error: err?.message || 'Unknown error' };
    }
  }

  /**
   * Get a reading from the unified divination_readings table
   */
  async getDivinationReadingById(readingId, userId) {
    try {
      const { data, error } = await supabase
        .from('divination_readings')
        .select('*')
        .eq('id', readingId)
        .eq('user_id', userId)
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      if (data) {
        const transformed = {
          ...data,
          reading_type: data.type,
          _source: 'divination_readings',
          spread_type: data.spread_type,
          present_hexagram: data.hexagram_data ? {
            ...data.hexagram_data,
            number: data.hexagram_number,
          } : null,
          hexagram_number: data.hexagram_number,
          overall_interpretation: data.interpretation,
          ai_interpretation: data.interpretation,
        };
        return { data: transformed, error: null };
      }

      return { data: null, error: null };
    } catch (err) {
      return { data: null, error: err?.message || 'Unknown error' };
    }
  }

  /**
   * Update notes for a divination reading (unified table)
   */
  async updateDivinationNotes(readingId, userId, notes) {
    try {
      const { data, error } = await supabase
        .from('divination_readings')
        .update({ notes })
        .eq('id', readingId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (err) {
      return { data: null, error: err?.message || 'Unknown error' };
    }
  }

  /**
   * Delete a divination reading (unified table)
   */
  async deleteDivinationReading(readingId, userId) {
    try {
      const { error } = await supabase
        .from('divination_readings')
        .delete()
        .eq('id', readingId)
        .eq('user_id', userId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, error: null };
    } catch (err) {
      return { success: false, error: err?.message || 'Unknown error' };
    }
  }
}

export const readingHistoryService = new ReadingHistoryService();
export default readingHistoryService;
