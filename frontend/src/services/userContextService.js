/**
 * User Context Service (Web)
 * Ported from gem-mobile/src/services/userContextService.js
 *
 * Builds and caches user context for AI personalisation.
 * Aggregates profile data, tier info, recent conversation topics,
 * and AI-generated insights into a formatted context string that
 * is injected into AI prompts for personalised responses.
 *
 * @fileoverview This service is the bridge between user data and the AI.
 * It answers the question: "What does GEM Master know about this user?"
 * The resulting context string is prepended to AI prompts so the model
 * can address the user by name, respect tier limits, reference past
 * topics, and leverage behavioural insights.
 *
 * Caching strategy:
 * - Server-side: user_context_cache table (1-hour TTL, staleness flag)
 * - Client-side: localStorage (for quick reads within the same session)
 *
 * IMPORTANT:
 * - Uses `from('profiles')` NOT `from('users')`.
 * - Uses localStorage instead of AsyncStorage (web environment).
 * - All Supabase queries use the authenticated user's session.
 */

import { supabase } from '../lib/supabaseClient';

// ============================================================
// CONSTANTS
// ============================================================

/** @type {string} Service log prefix for console output */
const SERVICE_NAME = '[UserContextService]';

/** @type {number} Server-side cache duration in ms (1 hour) */
const CACHE_DURATION_MS = 60 * 60 * 1000;

/** @type {number} Max recent topics to include in context */
const MAX_RECENT_TOPICS = 10;

/** @type {number} Max insights to fetch from DB */
const MAX_INSIGHTS = 15;

/** @type {string} localStorage key prefix for client-side context cache */
const LOCAL_CACHE_PREFIX = 'gem_user_ctx_';

/** @type {number} Client-side cache TTL in ms (15 minutes) */
const LOCAL_CACHE_DURATION = 15 * 60 * 1000;

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Validate that a userId is a non-empty string.
 *
 * @param {string} userId - The ID to validate
 * @returns {boolean} True if valid
 * @private
 */
const isValidUserId = (userId) => {
  if (!userId || typeof userId !== 'string') {
    console.warn(SERVICE_NAME, 'Invalid userId:', userId);
    return false;
  }
  return true;
};

/**
 * Read a cached context string from localStorage.
 * Returns null if expired or absent.
 *
 * @param {string} userId - User ID for cache key
 * @returns {string|null} Cached context string or null
 * @private
 */
const getLocalCache = (userId) => {
  try {
    const raw = localStorage.getItem(`${LOCAL_CACHE_PREFIX}${userId}`);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts > LOCAL_CACHE_DURATION) return null;
    return data;
  } catch {
    return null;
  }
};

/**
 * Write a context string to the localStorage cache.
 *
 * @param {string} userId - User ID for cache key
 * @param {string} contextString - The context string to cache
 * @private
 */
const setLocalCache = (userId, contextString) => {
  try {
    localStorage.setItem(
      `${LOCAL_CACHE_PREFIX}${userId}`,
      JSON.stringify({ data: contextString, ts: Date.now() }),
    );
  } catch {
    // localStorage full or unavailable -- ignore
  }
};

/**
 * Remove the cached context from localStorage.
 *
 * @param {string} userId - User ID for cache key
 * @private
 */
const clearLocalCache = (userId) => {
  try {
    localStorage.removeItem(`${LOCAL_CACHE_PREFIX}${userId}`);
  } catch {
    // ignore
  }
};

// ============================================================
// CORE FUNCTIONS
// ============================================================

/**
 * Fetch the user's basic profile from the `profiles` table.
 * Computes `transformation_days` (days since account creation)
 * and extracts the preferred display name.
 *
 * @param {string} userId - Auth user ID (UUID)
 * @returns {Promise<{preferred_name: string, transformation_days: number, avg_frequency: number}>}
 *   Profile data. Returns safe defaults on error.
 */
export const getUserBasicProfile = async (userId) => {
  if (!isValidUserId(userId)) {
    return { preferred_name: 'you', transformation_days: 0 };
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('full_name, display_name, created_at')
      .eq('id', userId)
      .single();

    if (error) {
      console.warn(SERVICE_NAME, 'getUserBasicProfile error:', error.message);
      return { preferred_name: 'you', transformation_days: 0 };
    }

    // Days since account creation
    const startDate = data?.created_at;
    const transformationDays = startDate
      ? Math.floor((Date.now() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    // Prefer display_name > full_name > fallback
    const preferredName = data?.display_name || data?.full_name || 'you';

    return {
      preferred_name: preferredName,
      transformation_days: transformationDays,
      avg_frequency: 200, // Default frequency value
    };
  } catch (err) {
    console.error(SERVICE_NAME, 'getUserBasicProfile exception:', err.message);
    return { preferred_name: 'you', transformation_days: 0 };
  }
};

/**
 * Fetch the user's subscription tier information from `profiles`.
 * Checks subscription expiry and falls back to FREE if expired.
 *
 * @param {string} userId - Auth user ID (UUID)
 * @returns {Promise<{scanner_tier: string, chatbot_tier: string, courses_tier: string, is_premium: boolean}>}
 *   Tier data. Returns FREE tiers on error.
 */
export const getUserTierInfo = async (userId) => {
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

    // Check if subscription has expired
    const isExpired = data?.subscription_expires_at
      && new Date(data.subscription_expires_at) < new Date();

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
 * Fetch the user's recent conversation topics from the server.
 * Uses the `get_user_recent_topics` RPC which returns topics
 * ordered by recency within the given day window.
 *
 * @param {string} userId - Auth user ID
 * @param {number} [days=7] - How many days back to look
 * @returns {Promise<string[]>} Array of topic strings (may be empty)
 */
export const getRecentTopics = async (userId, days = 7) => {
  if (!isValidUserId(userId)) return [];

  try {
    const { data, error } = await supabase
      .rpc('get_user_recent_topics', {
        p_user_id: userId,
        p_days: days,
        p_limit: MAX_RECENT_TOPICS,
      });

    if (error) {
      console.warn(SERVICE_NAME, 'getRecentTopics error:', error.message);
      return [];
    }

    return (data || []).map(t => t.topic);
  } catch (err) {
    console.error(SERVICE_NAME, 'getRecentTopics exception:', err.message);
    return [];
  }
};

/**
 * Fetch AI-generated insights about the user. Insights are created
 * by the AI during conversations and stored in `user_ai_insights`.
 * Uses the `get_user_active_insights` RPC.
 *
 * @param {string} userId - Auth user ID
 * @returns {Promise<Array<{insight_type: string, content: string, confidence: number}>>}
 *   Array of insight objects (may be empty)
 */
export const getUserInsights = async (userId) => {
  if (!isValidUserId(userId)) return [];

  try {
    const { data, error } = await supabase
      .rpc('get_user_active_insights', {
        p_user_id: userId,
        p_limit: MAX_INSIGHTS,
      });

    if (error) {
      console.warn(SERVICE_NAME, 'getUserInsights error:', error.message);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error(SERVICE_NAME, 'getUserInsights exception:', err.message);
    return [];
  }
};

/**
 * Build a complete user context string for injection into AI prompts.
 * Fetches profile, tiers, topics, and insights in parallel, then
 * formats them into a structured markdown string.
 *
 * Only insights with confidence >= 0.6 are included (max 5).
 *
 * @param {string} userId - Auth user ID
 * @returns {Promise<string>} Formatted context string
 */
export const buildUserContext = async (userId) => {
  if (!isValidUserId(userId)) {
    return '**USER CONTEXT:** No user information available.';
  }

  try {
    // Fetch all context data in parallel for performance
    const [profile, tierInfo, recentTopics, insights] = await Promise.all([
      getUserBasicProfile(userId),
      getUserTierInfo(userId),
      getRecentTopics(userId, 7),
      getUserInsights(userId),
    ]);

    // Filter high-confidence insights and format
    const insightStrings = (insights || [])
      .filter(i => i.confidence >= 0.6)
      .slice(0, 5)
      .map(i => `- ${i.insight_type}: ${i.content}`);

    // Build structured context string
    const contextString = `
**USER CONTEXT:**
- Name: ${profile.preferred_name || 'user'}
- Tier: ${tierInfo.scanner_tier || 'FREE'} (Scanner), ${tierInfo.chatbot_tier || 'FREE'} (Chatbot)
- Days since joining: ${profile.transformation_days || 0}
- Average frequency: ${profile.avg_frequency || 200}Hz
- Common topics: ${(recentTopics || []).slice(0, 5).join(', ') || 'None yet'}
${insightStrings.length > 0 ? '\n**INSIGHTS:**\n' + insightStrings.join('\n') : ''}
`.trim();

    return contextString;
  } catch (err) {
    console.error(SERVICE_NAME, 'buildUserContext exception:', err.message);
    return '**USER CONTEXT:** Unable to load user information.';
  }
};

/**
 * Get the user context string, preferring cached versions.
 * Check order: localStorage -> server-side cache -> build fresh.
 *
 * When a fresh context is built, it is persisted to both the
 * server-side `user_context_cache` table and localStorage.
 *
 * @param {string} userId - Auth user ID
 * @param {boolean} [forceRefresh=false] - If true, skip all caches and rebuild
 * @returns {Promise<string>} The user context string
 */
export const getCachedUserContext = async (userId, forceRefresh = false) => {
  if (!isValidUserId(userId)) {
    return '**USER CONTEXT:** No user information available.';
  }

  try {
    // 1. Check localStorage cache first (fastest)
    if (!forceRefresh) {
      const localCached = getLocalCache(userId);
      if (localCached) {
        console.log(SERVICE_NAME, 'getCachedUserContext: Using localStorage cache');
        return localCached;
      }
    }

    // 2. Check server-side cache
    if (!forceRefresh) {
      const { data: cached, error: cacheError } = await supabase
        .from('user_context_cache')
        .select('context_data, expires_at, is_stale')
        .eq('user_id', userId)
        .single();

      if (!cacheError && cached && !cached.is_stale) {
        const isExpired = new Date(cached.expires_at) < new Date();
        if (!isExpired && cached.context_data?.context_string) {
          console.log(SERVICE_NAME, 'getCachedUserContext: Using server cache');
          // Also populate localStorage for next time
          setLocalCache(userId, cached.context_data.context_string);
          return cached.context_data.context_string;
        }
      }
    }

    // 3. Build fresh context
    console.log(SERVICE_NAME, 'getCachedUserContext: Building new context');
    const contextString = await buildUserContext(userId);

    // Persist to localStorage
    setLocalCache(userId, contextString);

    // Persist to server-side cache (upsert)
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
        onConflict: 'user_id',
      });

    if (upsertError) {
      console.warn(SERVICE_NAME, 'Cache upsert error:', upsertError.message);
    }

    return contextString;
  } catch (err) {
    console.error(SERVICE_NAME, 'getCachedUserContext exception:', err.message);
    // Last resort: build without caching
    return await buildUserContext(userId);
  }
};

/**
 * Invalidate the user context cache on both server and client.
 * Call this when user data changes (profile update, new insight, etc.)
 * so the next AI prompt gets fresh context.
 *
 * @param {string} userId - Auth user ID
 * @returns {Promise<void>}
 */
export const invalidateUserContextCache = async (userId) => {
  if (!isValidUserId(userId)) return;

  // Clear localStorage immediately
  clearLocalCache(userId);

  try {
    // Mark server-side cache as stale
    await supabase
      .from('user_context_cache')
      .update({ is_stale: true, updated_at: new Date().toISOString() })
      .eq('user_id', userId);
  } catch (err) {
    console.error(SERVICE_NAME, 'invalidateUserContextCache error:', err.message);
  }
};

/**
 * Save an AI-generated insight about the user.
 * Insights are observations the AI makes during conversations, such as:
 * - "User is interested in trading patterns"
 * - "User prefers morning meditation"
 * - "User is going through a career transition"
 *
 * Saving an insight automatically invalidates the context cache.
 *
 * @param {string} userId - Auth user ID
 * @param {Object} insight - Insight data
 * @param {string} insight.type - Insight category (e.g. 'interest', 'preference', 'life_event')
 * @param {string} insight.content - Human-readable insight text
 * @param {number} [insight.confidence=0.5] - Confidence score 0-1
 * @param {string} [insight.sourceMessageId] - UUID of the message that triggered this insight
 * @returns {Promise<boolean>} True if saved successfully
 */
export const saveUserInsight = async (userId, insight) => {
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

    // Invalidate context cache so next AI prompt includes new insight
    await invalidateUserContextCache(userId);
    return true;
  } catch (err) {
    console.error(SERVICE_NAME, 'saveUserInsight exception:', err.message);
    return false;
  }
};

/**
 * Save a conversation topic for later retrieval in user context.
 * Topics are extracted from conversations and stored in the
 * `conversation_topics` table for building the "Common topics" field.
 *
 * @param {string} userId - Auth user ID
 * @param {Object} topicData - Topic data
 * @param {string} topicData.topic - The topic text (e.g. "Bitcoin trading strategy")
 * @param {string} [topicData.category='general'] - Topic category
 * @param {string} [topicData.sentiment='neutral'] - Sentiment ('positive'|'neutral'|'negative')
 * @param {string} [topicData.conversationId] - UUID of the conversation
 * @returns {Promise<boolean>} True if saved successfully
 */
export const saveConversationTopic = async (userId, topicData) => {
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

    return true;
  } catch (err) {
    console.error(SERVICE_NAME, 'saveConversationTopic exception:', err.message);
    return false;
  }
};

/**
 * Track the user's current mood. Persisted to localStorage for quick
 * access by the AI and other services within the same session.
 *
 * @param {string} userId - Auth user ID
 * @param {string} mood - Mood value (e.g. 'happy', 'anxious', 'calm')
 * @param {string} [source='manual'] - Where the mood was detected ('manual', 'ai_detected', 'ritual')
 */
export const trackUserMood = (userId, mood, source = 'manual') => {
  if (!isValidUserId(userId) || !mood) return;

  try {
    const moodData = {
      mood,
      source,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem(`gem_user_mood_${userId}`, JSON.stringify(moodData));
  } catch {
    // localStorage unavailable -- ignore
  }
};

/**
 * Get the user's most recently tracked mood from localStorage.
 *
 * @param {string} userId - Auth user ID
 * @returns {{mood: string, source: string, timestamp: string}|null}
 *   The mood data or null if none tracked
 */
export const getUserMood = (userId) => {
  if (!isValidUserId(userId)) return null;

  try {
    const raw = localStorage.getItem(`gem_user_mood_${userId}`);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

/**
 * Track a favourite topic for the user. Stored in localStorage as
 * a set of topics the user has explicitly starred or frequently revisits.
 *
 * @param {string} userId - Auth user ID
 * @param {string} topic - Topic to add to favourites
 */
export const addFavouriteTopic = (userId, topic) => {
  if (!isValidUserId(userId) || !topic) return;

  try {
    const key = `gem_fav_topics_${userId}`;
    const raw = localStorage.getItem(key);
    const topics = raw ? JSON.parse(raw) : [];

    if (!topics.includes(topic)) {
      topics.push(topic);
      // Keep max 20 favourite topics
      if (topics.length > 20) topics.shift();
      localStorage.setItem(key, JSON.stringify(topics));
    }
  } catch {
    // ignore
  }
};

/**
 * Get the user's favourite topics from localStorage.
 *
 * @param {string} userId - Auth user ID
 * @returns {string[]} Array of favourite topic strings
 */
export const getFavouriteTopics = (userId) => {
  if (!isValidUserId(userId)) return [];

  try {
    const raw = localStorage.getItem(`gem_fav_topics_${userId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

/**
 * Record a user interaction for building interaction history.
 * Stored in localStorage with a rolling window of the last 50 interactions.
 *
 * @param {string} userId - Auth user ID
 * @param {Object} interaction - Interaction data
 * @param {string} interaction.type - Interaction type ('chat', 'tarot', 'ritual', 'iching', etc.)
 * @param {string} [interaction.detail] - Additional detail text
 * @param {Object} [interaction.metadata] - Extra metadata
 */
export const recordInteraction = (userId, interaction) => {
  if (!isValidUserId(userId) || !interaction?.type) return;

  try {
    const key = `gem_interactions_${userId}`;
    const raw = localStorage.getItem(key);
    const history = raw ? JSON.parse(raw) : [];

    history.push({
      type: interaction.type,
      detail: interaction.detail || null,
      metadata: interaction.metadata || null,
      timestamp: new Date().toISOString(),
    });

    // Keep last 50 interactions
    const trimmed = history.slice(-50);
    localStorage.setItem(key, JSON.stringify(trimmed));
  } catch {
    // ignore
  }
};

/**
 * Get the user's recent interaction history from localStorage.
 *
 * @param {string} userId - Auth user ID
 * @param {number} [limit=20] - Max number of interactions to return
 * @returns {Array<{type: string, detail: string|null, metadata: Object|null, timestamp: string}>}
 */
export const getInteractionHistory = (userId, limit = 20) => {
  if (!isValidUserId(userId)) return [];

  try {
    const raw = localStorage.getItem(`gem_interactions_${userId}`);
    if (!raw) return [];
    const history = JSON.parse(raw);
    return history.slice(-limit);
  } catch {
    return [];
  }
};

/**
 * Clear all localStorage data owned by this service for a user.
 * Call this on logout to prevent stale data across accounts.
 *
 * @param {string} userId - Auth user ID
 */
export const clearUserContextLocalStorage = (userId) => {
  if (!isValidUserId(userId)) return;

  try {
    clearLocalCache(userId);
    localStorage.removeItem(`gem_user_mood_${userId}`);
    localStorage.removeItem(`gem_fav_topics_${userId}`);
    localStorage.removeItem(`gem_interactions_${userId}`);
  } catch {
    // ignore
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
  trackUserMood,
  getUserMood,
  addFavouriteTopic,
  getFavouriteTopics,
  recordInteraction,
  getInteractionHistory,
  clearUserContextLocalStorage,
};
