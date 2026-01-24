/**
 * Ritual Recommendation Service
 * Personalized ritual recommendations based on user behavior
 * Phase 3: VisionBoard Upgrade
 */

import { supabase } from './supabase';
import { RITUAL_TYPES } from './ritualService';

const SERVICE_NAME = '[ritualRecommendationService]';

// Cache duration in milliseconds (6 hours)
const CACHE_DURATION = 6 * 60 * 60 * 1000;

// Time-based ritual mappings
const TIME_BASED_RITUALS = {
  morning: ['gratitude-flow', 'heart-expansion', 'water-manifest'], // 5-11
  afternoon: ['letter-to-universe', 'star-wish', 'water-manifest'], // 11-17
  evening: ['burn-release', 'cleansing-breath', 'gratitude-flow'], // 17-22
  night: ['cleansing-breath', 'heart-expansion'], // 22-5
};

// Mood-based ritual mappings
const MOOD_BASED_RITUALS = {
  anxious: ['cleansing-breath', 'heart-expansion'],
  sad: ['gratitude-flow', 'heart-expansion'],
  stressed: ['burn-release', 'cleansing-breath'],
  hopeful: ['star-wish', 'letter-to-universe'],
  grateful: ['gratitude-flow', 'water-manifest'],
  default: ['gratitude-flow', 'heart-expansion', 'cleansing-breath'],
};

// Focus area mappings
const FOCUS_AREA_RITUALS = {
  healing: ['heart-expansion', 'cleansing-breath', 'burn-release'],
  abundance: ['water-manifest', 'gratitude-flow', 'letter-to-universe'],
  love: ['heart-expansion', 'gratitude-flow'],
  manifestation: ['star-wish', 'letter-to-universe', 'water-manifest'],
  release: ['burn-release', 'cleansing-breath'],
};

/**
 * Get current time period
 * @returns {string} morning | afternoon | evening | night
 */
const getCurrentTimePeriod = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 11) return 'morning';
  if (hour >= 11 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 22) return 'evening';
  return 'night';
};

/**
 * Get recommended rituals for current time
 * @returns {array} Array of ritual slugs
 */
export const getTimeBasedRecommendations = () => {
  const period = getCurrentTimePeriod();
  return TIME_BASED_RITUALS[period] || TIME_BASED_RITUALS.morning;
};

/**
 * Get recommendations based on mood
 * @param {string} mood - User's current mood
 * @returns {array} Array of ritual slugs
 */
export const getMoodBasedRecommendations = (mood) => {
  return MOOD_BASED_RITUALS[mood?.toLowerCase()] || MOOD_BASED_RITUALS.default;
};

/**
 * Get recommendations based on focus area
 * @param {string} focusArea - User's focus area
 * @returns {array} Array of ritual slugs
 */
export const getFocusBasedRecommendations = (focusArea) => {
  return FOCUS_AREA_RITUALS[focusArea?.toLowerCase()] || [];
};

/**
 * Get personalized recommendations
 * Combines user history, time, and preferences
 * @param {string} userId - User ID
 * @param {object} options - Options { mood, focusArea, limit }
 * @returns {Promise<object>}
 */
export const getPersonalizedRecommendations = async (userId, options = {}) => {
  const { mood, focusArea, limit = 3 } = options;

  try {
    // Get cached recommendations first
    const cached = await getCachedRecommendations(userId);
    if (cached && !options.forceRefresh) {
      console.log(SERVICE_NAME, 'Using cached recommendations');
      return cached;
    }

    // Get user's recent completions
    const completedToday = await getTodayCompletions(userId);

    // Get user's ritual history to find favorites
    const favorites = await getUserFavoriteRituals(userId);

    // Build recommendations
    const allRituals = Object.keys(RITUAL_TYPES);
    const scores = {};

    // Initialize scores
    allRituals.forEach((ritualId) => {
      scores[ritualId] = 0;
    });

    // Time-based scoring
    const timeRecs = getTimeBasedRecommendations();
    timeRecs.forEach((ritualId, index) => {
      if (scores[ritualId] !== undefined) {
        scores[ritualId] += 10 - index * 2; // First gets 10, second 8, third 6
      }
    });

    // Mood-based scoring (if provided)
    if (mood) {
      const moodRecs = getMoodBasedRecommendations(mood);
      moodRecs.forEach((ritualId, index) => {
        if (scores[ritualId] !== undefined) {
          scores[ritualId] += 8 - index * 2;
        }
      });
    }

    // Focus area scoring (if provided)
    if (focusArea) {
      const focusRecs = getFocusBasedRecommendations(focusArea);
      focusRecs.forEach((ritualId, index) => {
        if (scores[ritualId] !== undefined) {
          scores[ritualId] += 6 - index;
        }
      });
    }

    // Favorite rituals bonus
    favorites.forEach((fav) => {
      if (scores[fav.ritualId] !== undefined) {
        scores[fav.ritualId] += 5;
      }
    });

    // Penalize already completed today
    completedToday.forEach((ritualId) => {
      if (scores[ritualId] !== undefined) {
        scores[ritualId] -= 20; // Strong penalty
      }
    });

    // Sort by score
    const sortedRituals = Object.entries(scores)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([ritualId, score]) => ({
        ritualId,
        score,
        ritual: RITUAL_TYPES[ritualId],
      }));

    // Build result
    const result = {
      suggestedRituals: sortedRituals,
      optimalTime: getCurrentTimePeriod(),
      focusAreas: focusArea ? [focusArea] : ['healing', 'abundance'],
      personalizedMessage: getPersonalizedMessage(sortedRituals[0]?.ritualId, mood),
      generatedAt: new Date().toISOString(),
    };

    // Cache the result
    await cacheRecommendations(userId, result);

    return result;
  } catch (err) {
    console.error(SERVICE_NAME, 'getPersonalizedRecommendations failed:', err?.message);

    // Fallback to time-based recommendations
    const fallbackRituals = getTimeBasedRecommendations().slice(0, limit);
    return {
      suggestedRituals: fallbackRituals.map((ritualId) => ({
        ritualId,
        score: 10,
        ritual: RITUAL_TYPES[ritualId],
      })),
      optimalTime: getCurrentTimePeriod(),
      focusAreas: ['healing', 'abundance'],
      personalizedMessage: 'Hãy bắt đầu ngày mới với nghi thức phù hợp!',
      generatedAt: new Date().toISOString(),
    };
  }
};

/**
 * Get today's completed rituals for user
 * @param {string} userId
 * @returns {Promise<array>}
 */
const getTodayCompletions = async (userId) => {
  if (!userId) return [];

  try {
    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase
      .from('vision_ritual_completions')
      .select('ritual_id')
      .eq('user_id', userId)
      .gte('completed_at', `${today}T00:00:00`);

    return data?.map((c) => c.ritual_id) || [];
  } catch (err) {
    console.warn(SERVICE_NAME, 'getTodayCompletions error:', err?.message);
    return [];
  }
};

/**
 * Get user's favorite rituals (most completed)
 * @param {string} userId
 * @returns {Promise<array>}
 */
const getUserFavoriteRituals = async (userId) => {
  if (!userId) return [];

  try {
    const { data } = await supabase
      .from('vision_ritual_streaks')
      .select('ritual_id, total_completions')
      .eq('user_id', userId)
      .order('total_completions', { ascending: false })
      .limit(3);

    return (
      data?.map((s) => ({
        ritualId: s.ritual_id,
        completions: s.total_completions,
      })) || []
    );
  } catch (err) {
    console.warn(SERVICE_NAME, 'getUserFavoriteRituals error:', err?.message);
    return [];
  }
};

/**
 * Get cached recommendations
 * @param {string} userId
 * @returns {Promise<object|null>}
 */
const getCachedRecommendations = async (userId) => {
  if (!userId) return null;

  try {
    const { data } = await supabase
      .from('user_recommendations')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!data) return null;

    // Check if expired
    const expiresAt = new Date(data.expires_at);
    if (expiresAt < new Date()) {
      return null; // Cache expired
    }

    return {
      suggestedRituals: data.suggested_rituals || [],
      optimalTime: data.optimal_time,
      focusAreas: data.focus_areas || [],
      personalizedMessage: data.personalized_message,
      generatedAt: data.created_at,
    };
  } catch (err) {
    // Table might not exist
    console.warn(SERVICE_NAME, 'getCachedRecommendations error:', err?.message);
    return null;
  }
};

/**
 * Cache recommendations
 * @param {string} userId
 * @param {object} recommendations
 */
const cacheRecommendations = async (userId, recommendations) => {
  if (!userId) return;

  try {
    const expiresAt = new Date(Date.now() + CACHE_DURATION).toISOString();

    await supabase.from('user_recommendations').upsert(
      {
        user_id: userId,
        suggested_rituals: recommendations.suggestedRituals,
        optimal_time: recommendations.optimalTime,
        focus_areas: recommendations.focusAreas,
        personalized_message: recommendations.personalizedMessage,
        expires_at: expiresAt,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    );
  } catch (err) {
    // Table might not exist
    console.warn(SERVICE_NAME, 'cacheRecommendations error:', err?.message);
  }
};

/**
 * Generate personalized message
 * @param {string} topRitualId
 * @param {string} mood
 * @returns {string}
 */
const getPersonalizedMessage = (topRitualId, mood) => {
  const period = getCurrentTimePeriod();

  const messages = {
    morning: {
      default: 'Chào buổi sáng! Hãy bắt đầu ngày mới với năng lượng tích cực.',
      'gratitude-flow': 'Buổi sáng tuyệt vời để gửi lời biết ơn đến vũ trụ!',
      'heart-expansion': 'Mở rộng trái tim để đón nhận ngày mới đầy yêu thương.',
    },
    afternoon: {
      default: 'Giữa ngày là thời điểm lý tưởng để manifest điều bạn mong muốn.',
      'letter-to-universe': 'Hãy viết thư gửi vũ trụ những ước mơ của bạn!',
      'star-wish': 'Gửi điều ước lên những vì sao đang chờ đón.',
    },
    evening: {
      default: 'Buổi tối là lúc để buông bỏ và thanh lọc năng lượng.',
      'burn-release': 'Đốt cháy những gánh nặng và để chúng tan thành tro bụi.',
      'cleansing-breath': 'Thở sâu để giải phóng stress và tìm lại bình yên.',
    },
    night: {
      default: 'Đêm yên tĩnh là thời khắc để kết nối với bản thân.',
      'cleansing-breath': 'Thanh lọc tâm hồn trước khi chìm vào giấc ngủ.',
      'heart-expansion': 'Gửi yêu thương đến những người thân yêu trước khi ngủ.',
    },
  };

  // Mood-specific messages
  if (mood === 'anxious') {
    return 'Hít thở sâu... mọi thứ sẽ ổn thôi. Hãy để nghi thức giúp bạn tìm lại bình yên.';
  }
  if (mood === 'sad') {
    return 'Hãy nhẹ nhàng với bản thân. Mỗi nghi thức là một cái ôm từ vũ trụ.';
  }
  if (mood === 'stressed') {
    return 'Dành vài phút để buông bỏ. Bạn xứng đáng được nghỉ ngơi.';
  }

  return messages[period]?.[topRitualId] || messages[period]?.default || messages.morning.default;
};

/**
 * Get quick suggestion (single ritual)
 * @param {string} userId
 * @returns {Promise<object>}
 */
export const getQuickSuggestion = async (userId) => {
  const recommendations = await getPersonalizedRecommendations(userId, { limit: 1 });
  return recommendations.suggestedRituals[0] || null;
};

export default {
  getTimeBasedRecommendations,
  getMoodBasedRecommendations,
  getFocusBasedRecommendations,
  getPersonalizedRecommendations,
  getQuickSuggestion,
};
