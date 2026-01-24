// src/services/userContextService.js
// ============================================================
// USER CONTEXT SERVICE
// Build và cache user context cho AI personalization
// ============================================================

import { supabase } from './supabase';

const SERVICE_NAME = '[UserContextService]';

// ============================================================
// CONSTANTS
// ============================================================

const CACHE_DURATION_MS = 60 * 60 * 1000; // 1 hour
const MAX_RECENT_TOPICS = 10;
const MAX_INSIGHTS = 15;

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Validate userId
 * @param {string} userId
 * @returns {boolean}
 */
const isValidUserId = (userId) => {
  if (!userId || typeof userId !== 'string') {
    console.warn(SERVICE_NAME, 'Invalid userId:', userId);
    return false;
  }
  return true;
};

/**
 * Safe parse JSON với fallback
 * @param {any} data
 * @param {any} fallback
 * @returns {any}
 */
const safeParseJson = (data, fallback = {}) => {
  if (!data) return fallback;
  if (typeof data === 'object') return data;
  try {
    return JSON.parse(data);
  } catch (e) {
    console.warn(SERVICE_NAME, 'JSON parse error:', e.message);
    return fallback;
  }
};

// ============================================================
// CORE FUNCTIONS
// ============================================================

/**
 * Get user's basic profile
 * @param {string} userId
 * @returns {Promise<object>}
 */
export const getUserBasicProfile = async (userId) => {
  console.log(SERVICE_NAME, 'getUserBasicProfile started:', userId);

  if (!isValidUserId(userId)) {
    return { preferred_name: 'bạn', transformation_days: 0 };
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('full_name, display_name, created_at')
      .eq('id', userId)
      .single();

    if (error) {
      console.warn(SERVICE_NAME, 'getUserBasicProfile error:', error.message);
      return { preferred_name: 'bạn', transformation_days: 0 };
    }

    // Calculate transformation days
    const startDate = data?.created_at;
    const transformationDays = startDate
      ? Math.floor((Date.now() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    // Get preferred name
    const preferredName = data?.display_name || data?.full_name || 'bạn';

    console.log(SERVICE_NAME, 'getUserBasicProfile success:', {
      name: preferredName,
      days: transformationDays
    });

    return {
      preferred_name: preferredName,
      transformation_days: transformationDays,
      avg_frequency: 200, // Default frequency
    };
  } catch (err) {
    console.error(SERVICE_NAME, 'getUserBasicProfile exception:', err.message);
    return { preferred_name: 'bạn', transformation_days: 0 };
  }
};

/**
 * Get user's tier information
 * @param {string} userId
 * @returns {Promise<object>}
 */
export const getUserTierInfo = async (userId) => {
  console.log(SERVICE_NAME, 'getUserTierInfo started:', userId);

  if (!isValidUserId(userId)) {
    return { scanner_tier: 'FREE', chatbot_tier: 'FREE' };
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('scanner_tier, chatbot_tier, course_tier, subscription_expires_at')
      .eq('id', userId)
      .single();

    if (error) {
      console.warn(SERVICE_NAME, 'getUserTierInfo error:', error.message);
      return { scanner_tier: 'FREE', chatbot_tier: 'FREE' };
    }

    // Check expiry
    const isExpired = data?.subscription_expires_at && new Date(data.subscription_expires_at) < new Date();

    console.log(SERVICE_NAME, 'getUserTierInfo success:', {
      scanner: data?.scanner_tier,
      chatbot: data?.chatbot_tier,
      expired: isExpired
    });

    return {
      scanner_tier: isExpired ? 'FREE' : (data?.scanner_tier || 'FREE'),
      chatbot_tier: isExpired ? 'FREE' : (data?.chatbot_tier || 'FREE'),
      courses_tier: isExpired ? 'FREE' : (data?.course_tier || 'FREE'),
      is_premium: !isExpired && data?.scanner_tier !== 'FREE',
    };
  } catch (err) {
    console.error(SERVICE_NAME, 'getUserTierInfo exception:', err.message);
    return { scanner_tier: 'FREE', chatbot_tier: 'FREE' };
  }
};

/**
 * Get user's recent conversation topics
 * @param {string} userId
 * @param {number} days
 * @returns {Promise<string[]>}
 */
export const getRecentTopics = async (userId, days = 7) => {
  console.log(SERVICE_NAME, 'getRecentTopics started:', { userId, days });

  if (!isValidUserId(userId)) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .rpc('get_user_recent_topics', {
        p_user_id: userId,
        p_days: days,
        p_limit: MAX_RECENT_TOPICS
      });

    if (error) {
      console.warn(SERVICE_NAME, 'getRecentTopics error:', error.message);
      return [];
    }

    const topics = (data || []).map(t => t.topic);
    console.log(SERVICE_NAME, 'getRecentTopics success:', topics.length, 'topics');

    return topics;
  } catch (err) {
    console.error(SERVICE_NAME, 'getRecentTopics exception:', err.message);
    return [];
  }
};

/**
 * Get user's AI insights
 * @param {string} userId
 * @returns {Promise<object[]>}
 */
export const getUserInsights = async (userId) => {
  console.log(SERVICE_NAME, 'getUserInsights started:', userId);

  if (!isValidUserId(userId)) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .rpc('get_user_active_insights', {
        p_user_id: userId,
        p_limit: MAX_INSIGHTS
      });

    if (error) {
      console.warn(SERVICE_NAME, 'getUserInsights error:', error.message);
      return [];
    }

    console.log(SERVICE_NAME, 'getUserInsights success:', (data || []).length, 'insights');
    return data || [];
  } catch (err) {
    console.error(SERVICE_NAME, 'getUserInsights exception:', err.message);
    return [];
  }
};

/**
 * Build complete user context string for AI prompt
 * @param {string} userId
 * @returns {Promise<string>}
 */
export const buildUserContext = async (userId) => {
  console.log(SERVICE_NAME, 'buildUserContext started:', userId);

  if (!isValidUserId(userId)) {
    return '**USER CONTEXT:** Không có thông tin user.';
  }

  try {
    // Fetch all data in parallel
    const [profile, tierInfo, recentTopics, insights] = await Promise.all([
      getUserBasicProfile(userId),
      getUserTierInfo(userId),
      getRecentTopics(userId, 7),
      getUserInsights(userId),
    ]);

    // Build insights string
    const insightStrings = (insights || [])
      .filter(i => i.confidence >= 0.6)
      .slice(0, 5)
      .map(i => `- ${i.insight_type}: ${i.content}`);

    // Build context string
    const contextString = `
**USER CONTEXT:**
- Tên: ${profile.preferred_name || 'bạn'}
- Tier: ${tierInfo.scanner_tier || 'FREE'} (Scanner), ${tierInfo.chatbot_tier || 'FREE'} (Chatbot)
- Ngày tham gia: ${profile.transformation_days || 0} ngày
- Tần số trung bình: ${profile.avg_frequency || 200}Hz
- Chủ đề hay hỏi: ${(recentTopics || []).slice(0, 5).join(', ') || 'Chưa có'}
${insightStrings.length > 0 ? '\n**INSIGHTS:**\n' + insightStrings.join('\n') : ''}
`.trim();

    console.log(SERVICE_NAME, 'buildUserContext success, length:', contextString.length);
    return contextString;
  } catch (err) {
    console.error(SERVICE_NAME, 'buildUserContext exception:', err.message);
    return '**USER CONTEXT:** Không thể tải thông tin user.';
  }
};

/**
 * Get cached context or build new one
 * @param {string} userId
 * @param {boolean} forceRefresh
 * @returns {Promise<string>}
 */
export const getCachedUserContext = async (userId, forceRefresh = false) => {
  console.log(SERVICE_NAME, 'getCachedUserContext started:', { userId, forceRefresh });

  if (!isValidUserId(userId)) {
    return '**USER CONTEXT:** Không có thông tin user.';
  }

  try {
    // Check cache first (unless forceRefresh)
    if (!forceRefresh) {
      const { data: cached, error: cacheError } = await supabase
        .from('user_context_cache')
        .select('context_data, expires_at, is_stale')
        .eq('user_id', userId)
        .single();

      if (!cacheError && cached && !cached.is_stale) {
        const isExpired = new Date(cached.expires_at) < new Date();
        if (!isExpired && cached.context_data?.context_string) {
          console.log(SERVICE_NAME, 'getCachedUserContext: Using cache');
          return cached.context_data.context_string;
        }
      }
    }

    // Build new context
    console.log(SERVICE_NAME, 'getCachedUserContext: Building new context');
    const contextString = await buildUserContext(userId);

    // Save to cache (upsert)
    const { error: upsertError } = await supabase
      .from('user_context_cache')
      .upsert({
        user_id: userId,
        context_data: { context_string: contextString },
        is_stale: false,
        last_built_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + CACHE_DURATION_MS).toISOString(),
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id'
      });

    if (upsertError) {
      console.warn(SERVICE_NAME, 'Cache upsert error:', upsertError.message);
    }

    return contextString;
  } catch (err) {
    console.error(SERVICE_NAME, 'getCachedUserContext exception:', err.message);
    return await buildUserContext(userId);
  }
};

/**
 * Invalidate user context cache
 * @param {string} userId
 */
export const invalidateUserContextCache = async (userId) => {
  console.log(SERVICE_NAME, 'invalidateUserContextCache:', userId);

  if (!isValidUserId(userId)) return;

  try {
    await supabase
      .from('user_context_cache')
      .update({ is_stale: true, updated_at: new Date().toISOString() })
      .eq('user_id', userId);
  } catch (err) {
    console.error(SERVICE_NAME, 'invalidateUserContextCache error:', err.message);
  }
};

/**
 * Save a new user insight
 * @param {string} userId
 * @param {object} insight
 * @returns {Promise<boolean>}
 */
export const saveUserInsight = async (userId, insight) => {
  console.log(SERVICE_NAME, 'saveUserInsight started:', { userId, type: insight?.type });

  if (!isValidUserId(userId)) return false;
  if (!insight?.type || !insight?.content) {
    console.warn(SERVICE_NAME, 'saveUserInsight: Invalid insight data');
    return false;
  }

  try {
    const { error } = await supabase
      .from('user_ai_insights')
      .insert({
        user_id: userId,
        insight_type: insight.type,
        content: insight.content,
        confidence: insight.confidence || 0.5,
        source_message_id: insight.sourceMessageId || null,
      });

    if (error) {
      console.error(SERVICE_NAME, 'saveUserInsight error:', error.message);
      return false;
    }

    // Invalidate cache
    await invalidateUserContextCache(userId);

    console.log(SERVICE_NAME, 'saveUserInsight success');
    return true;
  } catch (err) {
    console.error(SERVICE_NAME, 'saveUserInsight exception:', err.message);
    return false;
  }
};

/**
 * Save conversation topic
 * @param {string} userId
 * @param {object} topicData
 * @returns {Promise<boolean>}
 */
export const saveConversationTopic = async (userId, topicData) => {
  console.log(SERVICE_NAME, 'saveConversationTopic started:', { userId, topic: topicData?.topic });

  if (!isValidUserId(userId)) return false;
  if (!topicData?.topic) {
    console.warn(SERVICE_NAME, 'saveConversationTopic: Invalid topic data');
    return false;
  }

  try {
    const { error } = await supabase
      .from('conversation_topics')
      .insert({
        user_id: userId,
        topic: topicData.topic,
        category: topicData.category || 'general',
        sentiment: topicData.sentiment || 'neutral',
        conversation_id: topicData.conversationId || null,
      });

    if (error) {
      console.error(SERVICE_NAME, 'saveConversationTopic error:', error.message);
      return false;
    }

    console.log(SERVICE_NAME, 'saveConversationTopic success');
    return true;
  } catch (err) {
    console.error(SERVICE_NAME, 'saveConversationTopic exception:', err.message);
    return false;
  }
};

// ============================================================
// EXPORTS
// ============================================================

export default {
  getUserBasicProfile,
  getUserTierInfo,
  getRecentTopics,
  getUserInsights,
  buildUserContext,
  getCachedUserContext,
  invalidateUserContextCache,
  saveUserInsight,
  saveConversationTopic,
};
