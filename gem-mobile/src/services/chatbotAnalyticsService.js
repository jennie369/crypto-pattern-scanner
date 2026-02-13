// src/services/chatbotAnalyticsService.js
// ============================================================
// CHATBOT ANALYTICS SERVICE
// Track queries, responses, and feedback
// ============================================================

import { supabase } from './supabase';

const SERVICE_NAME = '[ChatbotAnalyticsService]';

// ============================================================
// CORE FUNCTIONS
// ============================================================

/**
 * Track a chatbot query
 * @param {object} data
 * @returns {Promise<string|null>} analytics record id
 */
export const trackQuery = async (data) => {
  console.log(SERVICE_NAME, 'trackQuery started:', {
    query: data?.query?.substring(0, 30),
    intent: data?.intent
  });

  if (!data?.query) {
    console.warn(SERVICE_NAME, 'trackQuery: No query provided');
    return null;
  }

  try {
    const { data: result, error } = await supabase
      .from('chatbot_analytics')
      .insert({
        user_id: data.userId || null,
        query: data.query,
        query_intent: data.intent || null,
        matched_faq_key: data.faqKey || null,
        response_type: data.responseType || 'text',
        confidence: data.confidence || null,
        response_time_ms: data.responseTimeMs || null,
        user_tier: data.userTier || 'FREE',
        session_id: data.sessionId || null,
      })
      .select('id')
      .single();

    if (error) {
      console.error(SERVICE_NAME, 'trackQuery error:', error.message);
      return null;
    }

    console.log(SERVICE_NAME, 'trackQuery success:', result?.id);
    return result?.id || null;
  } catch (err) {
    console.error(SERVICE_NAME, 'trackQuery exception:', err.message);
    return null;
  }
};

/**
 * Update analytics with feedback
 * @param {string} analyticsId
 * @param {string} feedback - 'thumbs_up' | 'thumbs_down'
 * @param {string} comment
 * @returns {Promise<boolean>}
 */
export const updateFeedback = async (analyticsId, feedback, comment = null) => {
  console.log(SERVICE_NAME, 'updateFeedback:', { analyticsId, feedback });

  if (!analyticsId) {
    console.warn(SERVICE_NAME, 'updateFeedback: No analyticsId');
    return false;
  }

  if (!['thumbs_up', 'thumbs_down', 'none'].includes(feedback)) {
    console.warn(SERVICE_NAME, 'updateFeedback: Invalid feedback value');
    return false;
  }

  try {
    const { error } = await supabase
      .from('chatbot_analytics')
      .update({
        user_feedback: feedback,
        feedback_comment: comment,
      })
      .eq('id', analyticsId);

    if (error) {
      console.error(SERVICE_NAME, 'updateFeedback error:', error.message);
      return false;
    }

    console.log(SERVICE_NAME, 'updateFeedback success');
    return true;
  } catch (err) {
    console.error(SERVICE_NAME, 'updateFeedback exception:', err.message);
    return false;
  }
};

/**
 * Get analytics summary for admin
 * @param {number} days
 * @returns {Promise<object>}
 */
export const getAnalyticsSummary = async (days = 7) => {
  console.log(SERVICE_NAME, 'getAnalyticsSummary:', days, 'days');

  try {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from('chatbot_analytics')
      .select('query_intent, user_feedback, matched_faq_key')
      .gte('created_at', startDate);

    if (error) {
      console.error(SERVICE_NAME, 'getAnalyticsSummary error:', error.message);
      return {};
    }

    const records = data || [];

    // Calculate stats
    const summary = {
      totalQueries: records.length,
      byIntent: {},
      byFeedback: {
        thumbs_up: 0,
        thumbs_down: 0,
        none: 0,
      },
      unmatchedQueries: 0,
    };

    for (const record of records) {
      // By intent
      const intent = record.query_intent || 'UNKNOWN';
      summary.byIntent[intent] = (summary.byIntent[intent] || 0) + 1;

      // By feedback
      const feedback = record.user_feedback || 'none';
      summary.byFeedback[feedback] = (summary.byFeedback[feedback] || 0) + 1;

      // Unmatched
      if (!record.matched_faq_key) {
        summary.unmatchedQueries++;
      }
    }

    console.log(SERVICE_NAME, 'getAnalyticsSummary success:', summary);
    return summary;
  } catch (err) {
    console.error(SERVICE_NAME, 'getAnalyticsSummary exception:', err.message);
    return {};
  }
};

/**
 * Get unmatched queries for knowledge base improvement
 * @param {number} limit
 * @returns {Promise<array>}
 */
export const getUnmatchedQueries = async (limit = 50) => {
  console.log(SERVICE_NAME, 'getUnmatchedQueries:', limit);

  try {
    const { data, error } = await supabase
      .from('chatbot_analytics')
      .select('query, query_intent, created_at')
      .is('matched_faq_key', null)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error(SERVICE_NAME, 'getUnmatchedQueries error:', error.message);
      return [];
    }

    console.log(SERVICE_NAME, 'getUnmatchedQueries success:', (data || []).length);
    return data || [];
  } catch (err) {
    console.error(SERVICE_NAME, 'getUnmatchedQueries exception:', err.message);
    return [];
  }
};

/**
 * Get user's query history
 * @param {string} userId
 * @param {number} limit
 * @returns {Promise<array>}
 */
export const getUserQueryHistory = async (userId, limit = 20) => {
  console.log(SERVICE_NAME, 'getUserQueryHistory:', { userId, limit });

  if (!userId) {
    console.warn(SERVICE_NAME, 'getUserQueryHistory: No userId');
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('chatbot_analytics')
      .select('id, query, query_intent, user_feedback, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error(SERVICE_NAME, 'getUserQueryHistory error:', error.message);
      return [];
    }

    console.log(SERVICE_NAME, 'getUserQueryHistory success:', (data || []).length);
    return data || [];
  } catch (err) {
    console.error(SERVICE_NAME, 'getUserQueryHistory exception:', err.message);
    return [];
  }
};

/**
 * Get popular queries (for suggestions)
 * @param {number} days
 * @param {number} limit
 * @returns {Promise<array>}
 */
export const getPopularQueries = async (days = 7, limit = 10) => {
  console.log(SERVICE_NAME, 'getPopularQueries:', { days, limit });

  try {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    // Get queries grouped by similarity (simplified - just get recent queries)
    const { data, error } = await supabase
      .from('chatbot_analytics')
      .select('query, query_intent')
      .gte('created_at', startDate)
      .eq('user_feedback', 'thumbs_up')
      .order('created_at', { ascending: false })
      .limit(limit * 2);

    if (error) {
      console.error(SERVICE_NAME, 'getPopularQueries error:', error.message);
      return [];
    }

    // Remove duplicates and return unique queries
    const uniqueQueries = [];
    const seen = new Set();

    for (const item of (data || [])) {
      const normalized = item.query?.toLowerCase().trim();
      if (normalized && !seen.has(normalized)) {
        seen.add(normalized);
        uniqueQueries.push(item);
      }
      if (uniqueQueries.length >= limit) break;
    }

    console.log(SERVICE_NAME, 'getPopularQueries success:', uniqueQueries.length);
    return uniqueQueries;
  } catch (err) {
    console.error(SERVICE_NAME, 'getPopularQueries exception:', err.message);
    return [];
  }
};

/**
 * Get feedback stats for a time period
 * @param {number} days
 * @returns {Promise<object>}
 */
export const getFeedbackStats = async (days = 30) => {
  console.log(SERVICE_NAME, 'getFeedbackStats:', days, 'days');

  try {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from('chatbot_analytics')
      .select('user_feedback')
      .gte('created_at', startDate)
      .not('user_feedback', 'eq', 'none');

    if (error) {
      console.error(SERVICE_NAME, 'getFeedbackStats error:', error.message);
      return { thumbsUp: 0, thumbsDown: 0, total: 0, satisfactionRate: 0 };
    }

    const records = data || [];
    const thumbsUp = records.filter(r => r.user_feedback === 'thumbs_up').length;
    const thumbsDown = records.filter(r => r.user_feedback === 'thumbs_down').length;
    const total = thumbsUp + thumbsDown;
    const satisfactionRate = total > 0 ? Math.round((thumbsUp / total) * 100) : 0;

    const stats = {
      thumbsUp,
      thumbsDown,
      total,
      satisfactionRate,
    };

    console.log(SERVICE_NAME, 'getFeedbackStats success:', stats);
    return stats;
  } catch (err) {
    console.error(SERVICE_NAME, 'getFeedbackStats exception:', err.message);
    return { thumbsUp: 0, thumbsDown: 0, total: 0, satisfactionRate: 0 };
  }
};

// ============================================================
// EXPORTS
// ============================================================

export default {
  trackQuery,
  updateFeedback,
  getAnalyticsSummary,
  getUnmatchedQueries,
  getUserQueryHistory,
  getPopularQueries,
  getFeedbackStats,
};
