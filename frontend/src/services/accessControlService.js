/**
 * Access Control Service (Web)
 * Ported from gem-mobile/src/services/accessControlService.js
 *
 * Tier-based feature access control, usage tracking, and upgrade prompts.
 * Manages daily usage limits, max-count limits (rituals, memories), and
 * provides upgrade prompt data for the UI when limits are reached.
 *
 * @fileoverview Centralised access control for the GEM web platform.
 * All feature gating decisions flow through this service. Usage counts
 * are tracked server-side via Supabase RPC functions; this service
 * provides a client-side facade with localStorage caching for the
 * usage summary.
 *
 * IMPORTANT:
 * - ADMIN and MANAGER tiers bypass ALL restrictions.
 * - On RPC errors the service fails-open (allows the action) to avoid
 *   blocking paying users due to transient DB issues.
 * - Uses `from('profiles')` for any profile queries (NOT 'users').
 * - Uses localStorage instead of AsyncStorage (web environment).
 */

import { supabase } from '../lib/supabaseClient';

// ============================================================
// TIER DEFINITIONS
// ============================================================

/**
 * Enum of all supported subscription tiers.
 * @readonly
 * @enum {string}
 */
export const TIERS = {
  FREE: 'FREE',
  TIER1: 'TIER1',
  TIER2: 'TIER2',
  TIER3: 'TIER3',
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
};

// ============================================================
// FEATURE ACCESS MATRIX
// ============================================================

/**
 * Complete feature-access configuration matrix.
 * Each top-level key is a feature identifier. Within each feature,
 * keys are tier names mapping to the config object for that tier.
 *
 * Config shapes vary per feature but always include `enabled: boolean`.
 * Common additional fields:
 * - `daily_limit` {number|Infinity} - Max uses per day
 * - `max_rituals` / `max_memories` {number|Infinity} - Max item count
 * - `retention_days` {number|Infinity} - Memory retention window
 * - `level` {string} - Feature depth ('basic'|'advanced'|'full')
 * - `types` {string[]|'all'} - Allowed sub-feature types
 * - `course_access` {string[]|'all'} - Course tiers accessible
 * - `formats` {string[]} - Export formats available
 *
 * @type {Object<string, Object<string, Object>>}
 */
export const FEATURE_ACCESS = {
  // -- Chatbot --
  chatbot_basic: {
    [TIERS.FREE]: { enabled: true, daily_limit: 10, description: 'Basic chat with GEM Master' },
    [TIERS.TIER1]: { enabled: true, daily_limit: 50, description: 'Chat with GEM Master' },
    [TIERS.TIER2]: { enabled: true, daily_limit: 200, description: 'Unlimited chat' },
    [TIERS.TIER3]: { enabled: true, daily_limit: Infinity, description: 'VIP Chat' },
  },

  // -- Memory --
  memory_basic: {
    [TIERS.FREE]: { enabled: true, retention_days: 7, max_memories: 10 },
    [TIERS.TIER1]: { enabled: true, retention_days: 30, max_memories: 50 },
    [TIERS.TIER2]: { enabled: true, retention_days: 90, max_memories: 200 },
    [TIERS.TIER3]: { enabled: true, retention_days: Infinity, max_memories: Infinity },
  },

  // -- Personalisation --
  personalization: {
    [TIERS.FREE]: { enabled: false },
    [TIERS.TIER1]: { enabled: true, level: 'basic' },
    [TIERS.TIER2]: { enabled: true, level: 'advanced' },
    [TIERS.TIER3]: { enabled: true, level: 'full' },
  },

  // -- Proactive AI messages --
  proactive_messages: {
    [TIERS.FREE]: { enabled: false },
    [TIERS.TIER1]: { enabled: true, types: ['daily_insight', 'streak_alert'] },
    [TIERS.TIER2]: { enabled: true, types: ['daily_insight', 'streak_alert', 'ritual_reminder', 'pattern_observation'] },
    [TIERS.TIER3]: { enabled: true, types: 'all' },
  },

  // -- Emotion detection --
  emotion_detection: {
    [TIERS.FREE]: { enabled: false },
    [TIERS.TIER1]: { enabled: true, level: 'basic', show_frequency: false },
    [TIERS.TIER2]: { enabled: true, level: 'advanced', show_frequency: true },
    [TIERS.TIER3]: { enabled: true, level: 'full', show_frequency: true, history_days: 90 },
  },

  // -- Rituals --
  rituals: {
    [TIERS.FREE]: { enabled: true, max_rituals: 2, gamification: false },
    [TIERS.TIER1]: { enabled: true, max_rituals: 5, gamification: true },
    [TIERS.TIER2]: { enabled: true, max_rituals: 15, gamification: true },
    [TIERS.TIER3]: { enabled: true, max_rituals: Infinity, gamification: true },
  },

  // -- Divination: Tarot --
  tarot: {
    [TIERS.FREE]: { enabled: true, daily_limit: 1 },
    [TIERS.TIER1]: { enabled: true, daily_limit: 3 },
    [TIERS.TIER2]: { enabled: true, daily_limit: 10 },
    [TIERS.TIER3]: { enabled: true, daily_limit: Infinity },
  },

  // -- Divination: I Ching --
  iching: {
    [TIERS.FREE]: { enabled: true, daily_limit: 1 },
    [TIERS.TIER1]: { enabled: true, daily_limit: 3 },
    [TIERS.TIER2]: { enabled: true, daily_limit: 10 },
    [TIERS.TIER3]: { enabled: true, daily_limit: Infinity },
  },

  // -- Divination: Numerology --
  numerology: {
    [TIERS.FREE]: { enabled: false },
    [TIERS.TIER1]: { enabled: true, daily_limit: 2 },
    [TIERS.TIER2]: { enabled: true, daily_limit: 10 },
    [TIERS.TIER3]: { enabled: true, daily_limit: Infinity },
  },

  // -- RAG search --
  rag_search: {
    [TIERS.FREE]: { enabled: false },
    [TIERS.TIER1]: { enabled: true, course_access: ['tier1'] },
    [TIERS.TIER2]: { enabled: true, course_access: ['tier1', 'tier2'] },
    [TIERS.TIER3]: { enabled: true, course_access: 'all' },
  },

  // -- Voice input --
  voice_input: {
    [TIERS.FREE]: { enabled: false },
    [TIERS.TIER1]: { enabled: false },
    [TIERS.TIER2]: { enabled: true },
    [TIERS.TIER3]: { enabled: true },
  },

  // -- Data export --
  export_data: {
    [TIERS.FREE]: { enabled: false },
    [TIERS.TIER1]: { enabled: false },
    [TIERS.TIER2]: { enabled: true, formats: ['pdf'] },
    [TIERS.TIER3]: { enabled: true, formats: ['pdf', 'csv', 'json'] },
  },
};

// ============================================================
// UPGRADE PROMPTS
// ============================================================

/**
 * Contextual upgrade prompt copy keyed by feature then by current tier.
 * Used by the UI to show targeted upgrade CTAs when a limit is reached.
 *
 * @type {Object<string, Object<string, {title: string, message: string, targetTier: string}>>}
 */
export const UPGRADE_PROMPTS = {
  chatbot_basic: {
    FREE: { title: 'Upgrade for more chats', message: 'You have used all free chats today. Upgrade to TIER 1 for 50/day!', targetTier: TIERS.TIER1 },
    TIER1: { title: 'Want unlimited chat?', message: 'Upgrade to TIER 2 for unlimited chatting with GEM Master!', targetTier: TIERS.TIER2 },
  },
  memory_basic: {
    FREE: { title: 'Let GEM remember you longer', message: 'Upgrade so GEM Master remembers conversations up to 30 days!', targetTier: TIERS.TIER1 },
  },
  personalization: {
    FREE: { title: 'Personalized experience', message: 'Upgrade so GEM Master personalizes responses for you!', targetTier: TIERS.TIER1 },
  },
  proactive_messages: {
    FREE: { title: 'Get notifications from GEM', message: 'Upgrade to receive daily insights and streak alerts!', targetTier: TIERS.TIER1 },
  },
  emotion_detection: {
    FREE: { title: 'Track your emotions', message: 'Upgrade so GEM Master detects and responds to your emotions!', targetTier: TIERS.TIER1 },
  },
  rituals: {
    FREE: { title: 'Add more rituals', message: 'Upgrade to create up to 5 rituals and unlock gamification!', targetTier: TIERS.TIER1 },
  },
  numerology: {
    FREE: { title: 'Explore numerology', message: 'Upgrade to access numerology features!', targetTier: TIERS.TIER1 },
  },
  rag_search: {
    FREE: { title: 'Search in courses', message: 'Upgrade so GEM Master can search and reference course content!', targetTier: TIERS.TIER1 },
  },
};

// ============================================================
// localStorage CACHE HELPERS
// ============================================================

/** @type {number} Usage summary cache TTL in ms (5 minutes) */
const USAGE_CACHE_DURATION = 5 * 60 * 1000;

/** @type {string} localStorage key prefix for this service */
const CACHE_PREFIX = 'gem_access_';

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
    const raw = localStorage.getItem(`${CACHE_PREFIX}${key}_${userId}`);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts > USAGE_CACHE_DURATION) return null;
    return data;
  } catch {
    return null;
  }
};

/**
 * Write a value to the localStorage cache with a timestamp.
 *
 * @param {string} key - Cache key suffix
 * @param {*} data - Data to cache (must be JSON-serialisable)
 * @param {string} userId - User ID for namespacing
 * @private
 */
const setCache = (key, data, userId) => {
  try {
    localStorage.setItem(
      `${CACHE_PREFIX}${key}_${userId}`,
      JSON.stringify({ data, ts: Date.now() }),
    );
  } catch {
    // localStorage full or unavailable -- ignore
  }
};

/**
 * Remove a cached value from localStorage.
 *
 * @param {string} key - Cache key suffix
 * @param {string} userId - User ID for namespacing
 * @private
 */
const invalidateLocalCache = (key, userId) => {
  try {
    localStorage.removeItem(`${CACHE_PREFIX}${key}_${userId}`);
  } catch {
    // ignore
  }
};

// ============================================================
// ACCESS CONTROL SERVICE CLASS
// ============================================================

class AccessControlService {
  // ----------------------------------------------------------
  // ACCESS CHECKING
  // ----------------------------------------------------------

  /**
   * Check whether a user's tier grants access to a feature.
   * ADMIN and MANAGER tiers bypass all restrictions and receive
   * an unlimited config object.
   *
   * @param {string} userTier - The user's subscription tier (e.g. 'FREE', 'TIER1', 'ADMIN')
   * @param {string} featureKey - Key from the FEATURE_ACCESS matrix (e.g. 'chatbot_basic', 'tarot')
   * @returns {{enabled: boolean, unlimited?: boolean, config?: Object, reason?: string, message?: string, upgradePrompt?: Object|null}}
   *   Result object. If `enabled` is false, `reason` and optionally `upgradePrompt` explain why.
   */
  canAccess(userTier, featureKey) {
    const tier = userTier || TIERS.FREE;

    // ADMIN / MANAGER bypass all restrictions
    if (tier === TIERS.ADMIN || tier === TIERS.MANAGER) {
      return {
        enabled: true,
        unlimited: true,
        config: {
          enabled: true,
          daily_limit: Infinity,
          max_rituals: Infinity,
          max_memories: Infinity,
          retention_days: Infinity,
          level: 'full',
          types: 'all',
          show_frequency: true,
          history_days: Infinity,
          gamification: true,
          course_access: 'all',
          formats: ['pdf', 'csv', 'json'],
        },
      };
    }

    const featureConfig = FEATURE_ACCESS[featureKey];

    if (!featureConfig) {
      return { enabled: false, reason: 'unknown_feature', message: 'Unknown feature' };
    }

    const tierConfig = featureConfig[tier];

    if (!tierConfig || !tierConfig.enabled) {
      return {
        enabled: false,
        reason: 'tier_required',
        message: 'This feature requires an upgrade',
        upgradePrompt: UPGRADE_PROMPTS[featureKey]?.[tier] || null,
      };
    }

    return { enabled: true, config: tierConfig };
  }

  /**
   * Check whether a user has remaining daily usage for a feature.
   * Calls the server-side `get_feature_usage_today` RPC function to
   * retrieve the current count, then compares against the tier limit.
   *
   * On RPC error the service fails-open (returns `allowed: true`) so
   * paying users are never blocked by transient DB issues.
   *
   * @param {string} userId - Auth user ID (UUID)
   * @param {string} userTier - Subscription tier
   * @param {string} featureKey - Feature identifier from FEATURE_ACCESS
   * @returns {Promise<{allowed: boolean, usage?: number, limit?: number, remaining?: number, unlimited?: boolean, reason?: string|null, upgradePrompt?: Object|null, error?: boolean}>}
   */
  async checkDailyLimit(userId, userTier, featureKey) {
    if (!userId) {
      return { allowed: false, reason: 'no_user' };
    }

    const access = this.canAccess(userTier, featureKey);
    if (!access.enabled) {
      return { allowed: false, reason: access.reason, upgradePrompt: access.upgradePrompt };
    }

    const dailyLimit = access.config?.daily_limit;

    // No limit configured or infinite
    if (!dailyLimit || dailyLimit === Infinity) {
      return { allowed: true, unlimited: true };
    }

    try {
      const { data: currentUsage, error } = await supabase
        .rpc('get_feature_usage_today', {
          p_user_id: userId,
          p_feature_key: featureKey,
        });

      if (error) throw error;

      const usage = currentUsage || 0;
      const remaining = Math.max(0, dailyLimit - usage);

      return {
        allowed: usage < dailyLimit,
        usage,
        limit: dailyLimit,
        remaining,
        reason: usage >= dailyLimit ? 'daily_limit_reached' : null,
        upgradePrompt: usage >= dailyLimit ? UPGRADE_PROMPTS[featureKey]?.[userTier] || null : null,
      };
    } catch (error) {
      console.error('[AccessControl] checkDailyLimit error:', error);
      // Fail-open: allow on error so users are not blocked
      return { allowed: true, error: true };
    }
  }

  /**
   * Check whether the user has room to create more items
   * (e.g. rituals, memories). This is a synchronous check --
   * no DB call is made, the caller must supply the current count.
   *
   * @param {string} userId - Auth user ID (for consistency; unused in logic)
   * @param {string} userTier - Subscription tier
   * @param {string} featureKey - Feature identifier
   * @param {number} [currentCount=0] - The user's current item count
   * @returns {{allowed: boolean, current?: number, max?: number, remaining?: number, unlimited?: boolean, reason?: string|null, upgradePrompt?: Object|null}}
   */
  checkMaxCount(userId, userTier, featureKey, currentCount = 0) {
    const access = this.canAccess(userTier, featureKey);
    if (!access.enabled) {
      return { allowed: false, reason: access.reason, upgradePrompt: access.upgradePrompt };
    }

    const maxRituals = access.config?.max_rituals;
    const maxMemories = access.config?.max_memories;
    const maxLimit = maxRituals || maxMemories;

    if (!maxLimit || maxLimit === Infinity) {
      return { allowed: true, unlimited: true };
    }

    const remaining = Math.max(0, maxLimit - currentCount);

    return {
      allowed: currentCount < maxLimit,
      current: currentCount,
      max: maxLimit,
      remaining,
      reason: currentCount >= maxLimit ? 'max_count_reached' : null,
      upgradePrompt: currentCount >= maxLimit ? UPGRADE_PROMPTS[featureKey]?.[userTier] || null : null,
    };
  }

  // ----------------------------------------------------------
  // USAGE TRACKING
  // ----------------------------------------------------------

  /**
   * Record one unit of feature usage on the server.
   * Calls the `increment_feature_usage` RPC and invalidates the
   * local usage cache.
   *
   * @param {string} userId - Auth user ID
   * @param {string} featureKey - Feature identifier
   * @returns {Promise<number>} New usage count (0 on error)
   */
  async recordUsage(userId, featureKey) {
    if (!userId || !featureKey) return 0;

    try {
      const { data, error } = await supabase
        .rpc('increment_feature_usage', {
          p_user_id: userId,
          p_feature_key: featureKey,
        });

      if (error) throw error;

      // Invalidate localStorage cache
      invalidateLocalCache('USAGE', userId);

      return data || 1;
    } catch (error) {
      console.error('[AccessControl] recordUsage error:', error);
      return 0;
    }
  }

  /**
   * Get a summary of today's usage across key features.
   * Results are cached in localStorage for 5 minutes to reduce
   * redundant RPC calls during the same session.
   *
   * @param {string} userId - Auth user ID
   * @param {string} userTier - Subscription tier
   * @returns {Promise<Object<string, {usage: number, limit: number|undefined, remaining: number|undefined, unlimited: boolean|undefined}>|null>}
   *   Usage summary keyed by feature, or null on error
   */
  async getUsageSummary(userId, userTier) {
    if (!userId) return null;

    try {
      // Check localStorage cache first
      const cached = getCached('USAGE', userId);
      if (cached) return cached;

      const features = ['chatbot_basic', 'tarot', 'iching', 'numerology'];
      const summary = {};

      for (const feature of features) {
        const limitCheck = await this.checkDailyLimit(userId, userTier, feature);
        summary[feature] = {
          usage: limitCheck.usage || 0,
          limit: limitCheck.limit,
          remaining: limitCheck.remaining,
          unlimited: limitCheck.unlimited,
        };
      }

      // Persist to localStorage
      setCache('USAGE', summary, userId);

      return summary;
    } catch (error) {
      console.error('[AccessControl] getUsageSummary error:', error);
      return null;
    }
  }

  // ----------------------------------------------------------
  // TIER-SPECIFIC HELPERS
  // ----------------------------------------------------------

  /**
   * Get the memory retention period (in days) for the given tier.
   *
   * @param {string} userTier - Subscription tier
   * @returns {number} Number of days memories are retained (default 7)
   */
  getMemoryRetentionDays(userTier) {
    const access = this.canAccess(userTier, 'memory_basic');
    return access.config?.retention_days || 7;
  }

  /**
   * Get the upgrade prompt object for a feature at the given tier.
   * Returns null if no prompt is configured (e.g. already at max tier).
   *
   * @param {string} featureKey - Feature identifier
   * @param {string} currentTier - The user's current tier
   * @returns {{title: string, message: string, targetTier: string}|null}
   */
  getUpgradePrompt(featureKey, currentTier) {
    return UPGRADE_PROMPTS[featureKey]?.[currentTier] || null;
  }

  /**
   * Get the raw config object for a feature at a specific tier.
   * Useful for reading feature-specific fields (e.g. `formats`, `course_access`).
   *
   * @param {string} featureKey - Feature identifier
   * @param {string} userTier - Subscription tier
   * @returns {Object|null} Config object or null if feature/tier is unknown
   */
  getFeatureConfig(featureKey, userTier) {
    const tier = userTier || TIERS.FREE;
    return FEATURE_ACCESS[featureKey]?.[tier] || null;
  }

  /**
   * Quick boolean check: does the user have any paid tier?
   *
   * @param {string} userTier - Subscription tier
   * @returns {boolean} True if the user is on any tier above FREE
   */
  hasPremiumFeatures(userTier) {
    return userTier !== TIERS.FREE;
  }

  /**
   * Get the status of every feature for the given tier.
   * Useful for rendering a feature comparison table or settings page.
   *
   * @param {string} userTier - Subscription tier
   * @returns {Object<string, {enabled: boolean, config: Object|undefined, upgradePrompt: Object|null}>}
   */
  getAllFeatureStatus(userTier) {
    const tier = userTier || TIERS.FREE;
    const status = {};

    for (const [featureKey, config] of Object.entries(FEATURE_ACCESS)) {
      const tierConfig = config[tier];
      status[featureKey] = {
        enabled: tierConfig?.enabled || false,
        config: tierConfig,
        upgradePrompt: !tierConfig?.enabled ? UPGRADE_PROMPTS[featureKey]?.[tier] || null : null,
      };
    }

    return status;
  }

  // ----------------------------------------------------------
  // UTILITY METHODS
  // ----------------------------------------------------------

  /**
   * Get the TIERS enum object.
   *
   * @returns {{FREE: string, TIER1: string, TIER2: string, TIER3: string, ADMIN: string, MANAGER: string}}
   */
  getTiers() {
    return TIERS;
  }

  /**
   * Get the full FEATURE_ACCESS matrix (for debugging or admin UI).
   *
   * @returns {Object<string, Object<string, Object>>}
   */
  getFeatureAccess() {
    return FEATURE_ACCESS;
  }

  /**
   * Clear the localStorage usage cache for a specific user.
   * Call this on logout or when usage is known to have changed.
   *
   * @param {string} userId - Auth user ID
   */
  clearCache(userId) {
    if (userId) {
      invalidateLocalCache('USAGE', userId);
    }
  }

  /**
   * Get a human-readable display name for a tier.
   *
   * @param {string} tier - Tier code (e.g. 'TIER1', 'FREE')
   * @returns {string} Display name (e.g. 'Basic', 'VIP')
   */
  getTierDisplayName(tier) {
    const names = {
      [TIERS.FREE]: 'Free',
      [TIERS.TIER1]: 'Basic',
      [TIERS.TIER2]: 'Advanced',
      [TIERS.TIER3]: 'VIP',
      [TIERS.ADMIN]: 'Admin',
      [TIERS.MANAGER]: 'Manager',
    };
    return names[tier] || 'Unknown';
  }

  /**
   * Map a Shopify product ID to the corresponding subscription tier.
   *
   * @param {string} productId - Shopify product identifier
   * @returns {string|null} Tier code or null if no mapping exists
   */
  getTierFromProduct(productId) {
    const productTierMap = {
      'gem_tier1': TIERS.TIER1,
      'gem_tier2': TIERS.TIER2,
      'gem_tier3': TIERS.TIER3,
      'gem_vip': TIERS.TIER3,
    };
    return productTierMap[productId] || null;
  }
}

// ============================================================
// SINGLETON & EXPORTS
// ============================================================

export const accessControlService = new AccessControlService();

// Named exports for tree-shaking and direct imports
export const canAccess = (...args) => accessControlService.canAccess(...args);
export const checkDailyLimit = (...args) => accessControlService.checkDailyLimit(...args);
export const checkMaxCount = (...args) => accessControlService.checkMaxCount(...args);
export const recordUsage = (...args) => accessControlService.recordUsage(...args);
export const getUsageSummary = (...args) => accessControlService.getUsageSummary(...args);
export const getMemoryRetentionDays = (...args) => accessControlService.getMemoryRetentionDays(...args);
export const getUpgradePrompt = (...args) => accessControlService.getUpgradePrompt(...args);
export const getFeatureConfig = (...args) => accessControlService.getFeatureConfig(...args);
export const hasPremiumFeatures = (...args) => accessControlService.hasPremiumFeatures(...args);
export const getAllFeatureStatus = (...args) => accessControlService.getAllFeatureStatus(...args);
export const getTierDisplayName = (...args) => accessControlService.getTierDisplayName(...args);
export const getTierFromProduct = (...args) => accessControlService.getTierFromProduct(...args);
export const clearAccessCache = (...args) => accessControlService.clearCache(...args);

export default accessControlService;
