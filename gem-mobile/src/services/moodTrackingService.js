/**
 * Mood Tracking Service - Daily mood check-ins
 * Part of Calendar Smart Journal System
 *
 * Created: January 28, 2026
 */

import { supabase } from './supabase';
import { checkCalendarAccess, canAccessMiddayMood } from '../config/calendarAccessControl';

const SERVICE_NAME = '[MoodTrackingService]';

// ==================== CONSTANTS ====================

export const MOODS = {
  HAPPY: { id: 'happy', label: 'Vui ve', icon: 'Smile', score: 5, color: '#3AF7A6' },
  EXCITED: { id: 'excited', label: 'Hung khoi', icon: 'Sparkles', score: 5, color: '#FFD700' },
  PEACEFUL: { id: 'peaceful', label: 'Binh yen', icon: 'Heart', score: 4, color: '#00F0FF' },
  CONTENT: { id: 'content', label: 'Hai long', icon: 'Check', score: 4, color: '#6A5BFF' },
  NEUTRAL: { id: 'neutral', label: 'Binh thuong', icon: 'Meh', score: 3, color: '#9CA3AF' },
  TIRED: { id: 'tired', label: 'Met moi', icon: 'Battery', score: 2, color: '#6B7280' },
  ANXIOUS: { id: 'anxious', label: 'Lo lang', icon: 'AlertCircle', score: 2, color: '#FFB800' },
  SAD: { id: 'sad', label: 'Buon', icon: 'Frown', score: 2, color: '#6B7280' },
  STRESSED: { id: 'stressed', label: 'Cang thang', icon: 'Zap', score: 1, color: '#FF6B6B' },
  ANGRY: { id: 'angry', label: 'Tuc gian', icon: 'Flame', score: 1, color: '#9C0612' },
};

export const MOOD_FACTORS = [
  { id: 'good_sleep', label: 'Ngu ngon', category: 'positive' },
  { id: 'exercise', label: 'Tap the duc', category: 'positive' },
  { id: 'meditation', label: 'Thien dinh', category: 'positive' },
  { id: 'social', label: 'Gap go ban be', category: 'positive' },
  { id: 'achievement', label: 'Hoan thanh viec', category: 'positive' },
  { id: 'nature', label: 'Ra ngoai thien nhien', category: 'positive' },
  { id: 'poor_sleep', label: 'Ngu khong ngon', category: 'negative' },
  { id: 'stress', label: 'Cong viec cang thang', category: 'negative' },
  { id: 'health', label: 'Van de suc khoe', category: 'negative' },
  { id: 'weather', label: 'Thoi tiet xau', category: 'negative' },
  { id: 'conflict', label: 'Xung dot/Mau thuan', category: 'negative' },
  { id: 'financial', label: 'Lo lang tai chinh', category: 'negative' },
];

export const CHECK_IN_TYPES = {
  MORNING: 'morning',
  MIDDAY: 'midday',
  EVENING: 'evening',
};

// ==================== HELPERS ====================

/**
 * Get mood object by id
 */
export const getMoodById = (moodId) => {
  if (!moodId) return null;
  const key = moodId.toUpperCase();
  return MOODS[key] || null;
};

/**
 * Get all moods as array
 */
export const getMoodsArray = () => Object.values(MOODS);

/**
 * Get positive factors
 */
export const getPositiveFactors = () => MOOD_FACTORS.filter(f => f.category === 'positive');

/**
 * Get negative factors
 */
export const getNegativeFactors = () => MOOD_FACTORS.filter(f => f.category === 'negative');

// ==================== FUNCTIONS ====================

/**
 * Get or create today's mood entry
 */
export const getOrCreateTodayMood = async (userId) => {
  const today = new Date().toISOString().split('T')[0];

  try {
    // Try to get existing
    const { data: existing, error: fetchError } = await supabase
      .from('calendar_daily_mood')
      .select('*')
      .eq('user_id', userId)
      .eq('mood_date', today)
      .single();

    if (existing && !fetchError) {
      return { success: true, data: existing, isNew: false };
    }

    // Create new
    const { data: created, error: createError } = await supabase
      .from('calendar_daily_mood')
      .insert({
        user_id: userId,
        mood_date: today,
      })
      .select()
      .single();

    if (createError) throw createError;

    return { success: true, data: created, isNew: true };

  } catch (error) {
    console.error(`${SERVICE_NAME} getOrCreateTodayMood error:`, error);
    return { success: false, error: error.message };
  }
};

/**
 * Save mood check-in
 */
export const saveMoodCheckIn = async (userId, checkInType, data, userTier = 'free', userRole = null) => {
  console.log(`${SERVICE_NAME} saveMoodCheckIn`, { userId, checkInType });

  try {
    // Check access
    const access = checkCalendarAccess('mood_tracking', userTier, userRole);
    if (!access.allowed) {
      return { success: false, error: access.reason };
    }

    // Check midday access
    if (checkInType === CHECK_IN_TYPES.MIDDAY && !canAccessMiddayMood(userTier, userRole)) {
      return {
        success: false,
        error: 'Midday check-in yeu cau nang cap',
        requiresUpgrade: true,
      };
    }

    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toISOString();

    // Build update object based on check-in type
    let updateData = {};

    switch (checkInType) {
      case CHECK_IN_TYPES.MORNING:
        updateData = {
          morning_mood: data.mood,
          morning_mood_score: getMoodById(data.mood)?.score || 3,
          morning_note: data.note || null,
          morning_energy: data.energy || null,
          morning_sleep_quality: data.sleep_quality || null,
          morning_checked_at: now,
        };
        break;

      case CHECK_IN_TYPES.MIDDAY:
        updateData = {
          midday_mood: data.mood,
          midday_mood_score: getMoodById(data.mood)?.score || 3,
          midday_note: data.note || null,
          midday_checked_at: now,
        };
        break;

      case CHECK_IN_TYPES.EVENING:
        updateData = {
          evening_mood: data.mood,
          evening_mood_score: getMoodById(data.mood)?.score || 3,
          evening_note: data.note || null,
          evening_productivity: data.productivity || null,
          evening_gratitude: data.gratitude || null,
          evening_checked_at: now,
          day_highlight: data.highlight || null,
          day_lowlight: data.lowlight || null,
        };
        break;

      default:
        return { success: false, error: 'Invalid check-in type' };
    }

    // Add factors if provided
    if (data.factors && Array.isArray(data.factors)) {
      updateData.mood_factors = data.factors;
    }

    // Get or create today's mood
    const result = await getOrCreateTodayMood(userId);
    if (!result.success) return result;

    const currentMood = result.data;

    // Calculate overall mood based on available check-ins
    const morningScore = updateData.morning_mood_score || currentMood.morning_mood_score;
    const middayScore = updateData.midday_mood_score || currentMood.midday_mood_score;
    const eveningScore = updateData.evening_mood_score || currentMood.evening_mood_score;

    const scores = [morningScore, middayScore, eveningScore].filter(s => s != null);
    if (scores.length > 0) {
      const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
      updateData.overall_mood_score = avgScore;

      // Determine overall mood based on average score
      const moodByScore = getMoodsArray().find(m => m.score === avgScore);
      if (moodByScore) {
        updateData.overall_mood = moodByScore.id;
      }
    }

    updateData.updated_at = now;

    // Update
    const { data: updated, error } = await supabase
      .from('calendar_daily_mood')
      .update(updateData)
      .eq('id', currentMood.id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      data: updated,
      checkInType,
      isFirstCheckIn: result.isNew,
    };

  } catch (error) {
    console.error(`${SERVICE_NAME} saveMoodCheckIn error:`, error);
    return { success: false, error: error.message };
  }
};

/**
 * Get mood for specific date
 */
export const getMoodForDate = async (userId, date) => {
  try {
    const { data, error } = await supabase
      .from('calendar_daily_mood')
      .select('*')
      .eq('user_id', userId)
      .eq('mood_date', date)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows

    return { success: true, data: data || null };

  } catch (error) {
    console.error(`${SERVICE_NAME} getMoodForDate error:`, error);
    return { success: false, error: error.message, data: null };
  }
};

/**
 * Get mood history for date range
 */
export const getMoodHistory = async (userId, startDate, endDate) => {
  try {
    const { data, error } = await supabase
      .from('calendar_daily_mood')
      .select('*')
      .eq('user_id', userId)
      .gte('mood_date', startDate)
      .lte('mood_date', endDate)
      .order('mood_date', { ascending: false });

    if (error) throw error;

    return { success: true, data: data || [] };

  } catch (error) {
    console.error(`${SERVICE_NAME} getMoodHistory error:`, error);
    return { success: false, error: error.message, data: [] };
  }
};

/**
 * Get mood statistics
 */
export const getMoodStats = async (userId, startDate, endDate) => {
  try {
    const { data, error } = await supabase
      .from('calendar_daily_mood')
      .select('overall_mood, overall_mood_score, mood_factors, mood_date')
      .eq('user_id', userId)
      .gte('mood_date', startDate)
      .lte('mood_date', endDate);

    if (error) throw error;

    const entries = data || [];
    const stats = {
      total_days: entries.length,
      avg_score: 0,
      mood_distribution: {},
      factor_frequency: {},
      best_day: null,
      worst_day: null,
      streak: 0,
    };

    if (entries.length === 0) {
      return { success: true, data: stats };
    }

    // Calculate stats
    let totalScore = 0;
    let bestScore = 0;
    let worstScore = 5;

    entries.forEach(entry => {
      const score = entry.overall_mood_score || 0;
      totalScore += score;

      // Best/worst
      if (score > bestScore) {
        bestScore = score;
        stats.best_day = { date: entry.mood_date, score, mood: entry.overall_mood };
      }
      if (score < worstScore && score > 0) {
        worstScore = score;
        stats.worst_day = { date: entry.mood_date, score, mood: entry.overall_mood };
      }

      // Distribution
      if (entry.overall_mood) {
        stats.mood_distribution[entry.overall_mood] =
          (stats.mood_distribution[entry.overall_mood] || 0) + 1;
      }

      // Factors
      (entry.mood_factors || []).forEach(factor => {
        stats.factor_frequency[factor] = (stats.factor_frequency[factor] || 0) + 1;
      });
    });

    stats.avg_score = parseFloat((totalScore / entries.length).toFixed(1));

    return { success: true, data: stats };

  } catch (error) {
    console.error(`${SERVICE_NAME} getMoodStats error:`, error);
    return { success: false, error: error.message };
  }
};

/**
 * Get pending check-in for today
 * Returns which check-in type should be shown based on time of day
 */
export const getPendingCheckIn = async (userId, userTier = 'free', userRole = null) => {
  try {
    const result = await getOrCreateTodayMood(userId);
    if (!result.success) return result;

    const mood = result.data;
    const now = new Date();
    const hour = now.getHours();

    // Determine which check-in is pending based on time
    // Morning: 5-11
    // Midday: 11-17
    // Evening: 17-24

    let pendingType = null;
    let isOptional = false;

    if (hour >= 5 && hour < 11) {
      if (!mood.morning_checked_at) {
        pendingType = CHECK_IN_TYPES.MORNING;
      }
    } else if (hour >= 11 && hour < 17) {
      if (!mood.morning_checked_at) {
        pendingType = CHECK_IN_TYPES.MORNING;
      } else if (!mood.midday_checked_at && canAccessMiddayMood(userTier, userRole)) {
        pendingType = CHECK_IN_TYPES.MIDDAY;
        isOptional = true;
      }
    } else if (hour >= 17) {
      if (!mood.evening_checked_at) {
        pendingType = CHECK_IN_TYPES.EVENING;
      } else if (!mood.morning_checked_at) {
        pendingType = CHECK_IN_TYPES.MORNING;
        isOptional = true; // Late morning check-in
      }
    }

    return {
      success: true,
      pendingType,
      isOptional,
      todayMood: mood,
      hasAnyCheckIn: !!(mood.morning_checked_at || mood.midday_checked_at || mood.evening_checked_at),
    };

  } catch (error) {
    console.error(`${SERVICE_NAME} getPendingCheckIn error:`, error);
    return { success: false, error: error.message };
  }
};

/**
 * Get check-in labels in Vietnamese
 */
export const getCheckInLabel = (checkInType) => {
  switch (checkInType) {
    case CHECK_IN_TYPES.MORNING:
      return 'Buoi sang';
    case CHECK_IN_TYPES.MIDDAY:
      return 'Giua ngay';
    case CHECK_IN_TYPES.EVENING:
      return 'Buoi toi';
    default:
      return '';
  }
};

/**
 * Get check-in prompts
 */
export const getCheckInPrompt = (checkInType) => {
  switch (checkInType) {
    case CHECK_IN_TYPES.MORNING:
      return 'Ban cam thay the nao sau khi ngu day?';
    case CHECK_IN_TYPES.MIDDAY:
      return 'Ngay cua ban dang dien ra the nao?';
    case CHECK_IN_TYPES.EVENING:
      return 'Ban cam thay the nao khi nhin lai ngay hom nay?';
    default:
      return 'Ban dang cam thay the nao?';
  }
};

/**
 * Update day highlight/lowlight
 */
export const updateDayNotes = async (userId, date, highlight, lowlight) => {
  try {
    const { data, error } = await supabase
      .from('calendar_daily_mood')
      .update({
        day_highlight: highlight || null,
        day_lowlight: lowlight || null,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('mood_date', date)
      .select()
      .single();

    if (error) throw error;

    return { success: true, data };

  } catch (error) {
    console.error(`${SERVICE_NAME} updateDayNotes error:`, error);
    return { success: false, error: error.message };
  }
};

export default {
  // Constants
  MOODS,
  MOOD_FACTORS,
  CHECK_IN_TYPES,

  // Helpers
  getMoodById,
  getMoodsArray,
  getPositiveFactors,
  getNegativeFactors,
  getCheckInLabel,
  getCheckInPrompt,

  // CRUD
  getOrCreateTodayMood,
  saveMoodCheckIn,
  getMoodForDate,
  getMoodHistory,
  getMoodStats,
  getPendingCheckIn,
  updateDayNotes,
};
