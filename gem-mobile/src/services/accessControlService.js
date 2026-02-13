/**
 * ACCESS CONTROL SERVICE
 * Tier-based feature access control and usage tracking
 * Manages feature limits, usage counting, and upgrade prompts
 */

import { supabase } from './supabase';
import cacheService from './cacheService';

// ============================================================
// TIER CONFIGURATION
// ============================================================

const TIERS = {
  FREE: 'FREE',
  TIER1: 'TIER1',
  TIER2: 'TIER2',
  TIER3: 'TIER3',
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
};

// Feature access matrix
const FEATURE_ACCESS = {
  // Chatbot features
  chatbot_basic: {
    [TIERS.FREE]: { enabled: true, daily_limit: 10, description: 'Chat cơ bản với GEM Master' },
    [TIERS.TIER1]: { enabled: true, daily_limit: 50, description: 'Chat với GEM Master' },
    [TIERS.TIER2]: { enabled: true, daily_limit: 200, description: 'Chat không giới hạn' },
    [TIERS.TIER3]: { enabled: true, daily_limit: Infinity, description: 'Chat VIP' },
  },

  // Memory features
  memory_basic: {
    [TIERS.FREE]: { enabled: true, retention_days: 7, max_memories: 10 },
    [TIERS.TIER1]: { enabled: true, retention_days: 30, max_memories: 50 },
    [TIERS.TIER2]: { enabled: true, retention_days: 90, max_memories: 200 },
    [TIERS.TIER3]: { enabled: true, retention_days: Infinity, max_memories: Infinity },
  },

  // Personalization
  personalization: {
    [TIERS.FREE]: { enabled: false },
    [TIERS.TIER1]: { enabled: true, level: 'basic' },
    [TIERS.TIER2]: { enabled: true, level: 'advanced' },
    [TIERS.TIER3]: { enabled: true, level: 'full' },
  },

  // Proactive AI
  proactive_messages: {
    [TIERS.FREE]: { enabled: false },
    [TIERS.TIER1]: { enabled: true, types: ['daily_insight', 'streak_alert'] },
    [TIERS.TIER2]: { enabled: true, types: ['daily_insight', 'streak_alert', 'ritual_reminder', 'pattern_observation'] },
    [TIERS.TIER3]: { enabled: true, types: 'all' },
  },

  // Emotion detection
  emotion_detection: {
    [TIERS.FREE]: { enabled: false },
    [TIERS.TIER1]: { enabled: true, level: 'basic', show_frequency: false },
    [TIERS.TIER2]: { enabled: true, level: 'advanced', show_frequency: true },
    [TIERS.TIER3]: { enabled: true, level: 'full', show_frequency: true, history_days: 90 },
  },

  // Ritual tracking
  rituals: {
    [TIERS.FREE]: { enabled: true, max_rituals: 2, gamification: false },
    [TIERS.TIER1]: { enabled: true, max_rituals: 5, gamification: true },
    [TIERS.TIER2]: { enabled: true, max_rituals: 15, gamification: true },
    [TIERS.TIER3]: { enabled: true, max_rituals: Infinity, gamification: true },
  },

  // Divination
  tarot: {
    [TIERS.FREE]: { enabled: true, daily_limit: 1 },
    [TIERS.TIER1]: { enabled: true, daily_limit: 3 },
    [TIERS.TIER2]: { enabled: true, daily_limit: 10 },
    [TIERS.TIER3]: { enabled: true, daily_limit: Infinity },
  },

  iching: {
    [TIERS.FREE]: { enabled: true, daily_limit: 1 },
    [TIERS.TIER1]: { enabled: true, daily_limit: 3 },
    [TIERS.TIER2]: { enabled: true, daily_limit: 10 },
    [TIERS.TIER3]: { enabled: true, daily_limit: Infinity },
  },

  numerology: {
    [TIERS.FREE]: { enabled: false },
    [TIERS.TIER1]: { enabled: true, daily_limit: 2 },
    [TIERS.TIER2]: { enabled: true, daily_limit: 10 },
    [TIERS.TIER3]: { enabled: true, daily_limit: Infinity },
  },

  // RAG search
  rag_search: {
    [TIERS.FREE]: { enabled: false },
    [TIERS.TIER1]: { enabled: true, course_access: ['tier1'] },
    [TIERS.TIER2]: { enabled: true, course_access: ['tier1', 'tier2'] },
    [TIERS.TIER3]: { enabled: true, course_access: 'all' },
  },

  // Advanced features
  voice_input: {
    [TIERS.FREE]: { enabled: false },
    [TIERS.TIER1]: { enabled: false },
    [TIERS.TIER2]: { enabled: true },
    [TIERS.TIER3]: { enabled: true },
  },

  export_data: {
    [TIERS.FREE]: { enabled: false },
    [TIERS.TIER1]: { enabled: false },
    [TIERS.TIER2]: { enabled: true, formats: ['pdf'] },
    [TIERS.TIER3]: { enabled: true, formats: ['pdf', 'csv', 'json'] },
  },
};

// Upgrade prompts
const UPGRADE_PROMPTS = {
  chatbot_basic: {
    FREE: {
      title: 'Nâng cấp để chat nhiều hơn',
      message: 'Bạn đã dùng hết lượt chat miễn phí hôm nay. Nâng cấp lên TIER 1 để có 50 lượt/ngày!',
      targetTier: TIERS.TIER1,
    },
    TIER1: {
      title: 'Muốn chat không giới hạn?',
      message: 'Nâng cấp lên TIER 2 để chat thoải mái với GEM Master!',
      targetTier: TIERS.TIER2,
    },
  },
  memory_basic: {
    FREE: {
      title: 'Để GEM nhớ bạn lâu hơn',
      message: 'Nâng cấp để GEM Master nhớ các cuộc trò chuyện tới 30 ngày!',
      targetTier: TIERS.TIER1,
    },
  },
  personalization: {
    FREE: {
      title: 'Trải nghiệm cá nhân hóa',
      message: 'Nâng cấp để GEM Master hiểu và cá nhân hóa câu trả lời cho bạn!',
      targetTier: TIERS.TIER1,
    },
  },
  proactive_messages: {
    FREE: {
      title: 'Nhận thông báo từ GEM',
      message: 'Nâng cấp để nhận daily insights và streak alerts từ GEM Master!',
      targetTier: TIERS.TIER1,
    },
  },
  emotion_detection: {
    FREE: {
      title: 'Theo dõi cảm xúc',
      message: 'Nâng cấp để GEM Master nhận biết và phản hồi theo cảm xúc của bạn!',
      targetTier: TIERS.TIER1,
    },
  },
  rituals: {
    FREE: {
      title: 'Thêm ritual để tăng tần số',
      message: 'Nâng cấp để tạo tới 5 ritual và mở khóa gamification!',
      targetTier: TIERS.TIER1,
    },
  },
  numerology: {
    FREE: {
      title: 'Khám phá thần số học',
      message: 'Nâng cấp để truy cập tính năng thần số học!',
      targetTier: TIERS.TIER1,
    },
  },
  rag_search: {
    FREE: {
      title: 'Tìm kiếm trong khóa học',
      message: 'Nâng cấp để GEM Master tìm kiếm và tham chiếu nội dung khóa học!',
      targetTier: TIERS.TIER1,
    },
  },
};

class AccessControlService {
  // ============================================================
  // ACCESS CHECKING
  // ============================================================

  /**
   * Check if user can access a feature
   * @param {string} userTier - User's tier (FREE, TIER1, TIER2, TIER3, ADMIN, MANAGER)
   * @param {string} featureKey - Feature key from FEATURE_ACCESS
   * @returns {Object} Access result with enabled status and config
   */
  canAccess(userTier, featureKey) {
    const tier = userTier || TIERS.FREE;

    // ADMIN and MANAGER bypass all restrictions
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
      // Unknown feature, deny by default
      return {
        enabled: false,
        reason: 'unknown_feature',
        message: 'Tính năng không xác định',
      };
    }

    const tierConfig = featureConfig[tier];

    if (!tierConfig || !tierConfig.enabled) {
      return {
        enabled: false,
        reason: 'tier_required',
        message: 'Tính năng này yêu cầu nâng cấp',
        upgradePrompt: UPGRADE_PROMPTS[featureKey]?.[tier],
      };
    }

    return {
      enabled: true,
      config: tierConfig,
    };
  }

  /**
   * Check daily usage limit
   * @param {string} userId - User ID
   * @param {string} userTier - User's tier
   * @param {string} featureKey - Feature key
   * @returns {Promise<Object>} Limit check result
   */
  async checkDailyLimit(userId, userTier, featureKey) {
    if (!userId) {
      return { allowed: false, reason: 'no_user' };
    }

    const access = this.canAccess(userTier, featureKey);
    if (!access.enabled) {
      return {
        allowed: false,
        reason: access.reason,
        upgradePrompt: access.upgradePrompt,
      };
    }

    const dailyLimit = access.config?.daily_limit;

    // No limit configured
    if (!dailyLimit || dailyLimit === Infinity) {
      return { allowed: true, unlimited: true };
    }

    try {
      // Get today's usage
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
        upgradePrompt: usage >= dailyLimit ? UPGRADE_PROMPTS[featureKey]?.[userTier] : null,
      };
    } catch (error) {
      console.error('[AccessControl] checkDailyLimit error:', error);
      // Allow on error to not block user
      return { allowed: true, error: true };
    }
  }

  /**
   * Check max count limit (e.g., max rituals, max memories)
   * @param {string} userId - User ID
   * @param {string} userTier - User's tier
   * @param {string} featureKey - Feature key
   * @param {number} currentCount - Current count
   * @returns {Object} Max count check result
   */
  checkMaxCount(userId, userTier, featureKey, currentCount = 0) {
    const access = this.canAccess(userTier, featureKey);
    if (!access.enabled) {
      return {
        allowed: false,
        reason: access.reason,
        upgradePrompt: access.upgradePrompt,
      };
    }

    // Check various max limits
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
      upgradePrompt: currentCount >= maxLimit ? UPGRADE_PROMPTS[featureKey]?.[userTier] : null,
    };
  }

  // ============================================================
  // USAGE TRACKING
  // ============================================================

  /**
   * Record feature usage
   * @param {string} userId - User ID
   * @param {string} featureKey - Feature key
   * @returns {Promise<number>} New usage count
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

      // Invalidate cache
      await cacheService.invalidate('FEATURE_USAGE', userId);

      return data || 1;
    } catch (error) {
      console.error('[AccessControl] recordUsage error:', error);
      return 0;
    }
  }

  /**
   * Get usage summary for user
   * @param {string} userId - User ID
   * @param {string} userTier - User's tier
   * @returns {Promise<Object>} Usage summary
   */
  async getUsageSummary(userId, userTier) {
    if (!userId) return null;

    try {
      // Check cache
      const cached = await cacheService.getForUser('FEATURE_USAGE', userId);
      if (cached) return cached;

      // Get today's usage for key features
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

      // Cache the summary
      await cacheService.setForUser('FEATURE_USAGE', summary, userId);

      return summary;
    } catch (error) {
      console.error('[AccessControl] getUsageSummary error:', error);
      return null;
    }
  }

  // ============================================================
  // TIER-SPECIFIC HELPERS
  // ============================================================

  /**
   * Get memory retention days for tier
   * @param {string} userTier - User's tier
   * @returns {number} Retention days
   */
  getMemoryRetentionDays(userTier) {
    const access = this.canAccess(userTier, 'memory_basic');
    return access.config?.retention_days || 7;
  }

  /**
   * Get upgrade prompt for feature
   * @param {string} featureKey - Feature key
   * @param {string} currentTier - Current tier
   * @returns {Object|null} Upgrade prompt
   */
  getUpgradePrompt(featureKey, currentTier) {
    return UPGRADE_PROMPTS[featureKey]?.[currentTier] || null;
  }

  /**
   * Get feature config for tier
   * @param {string} featureKey - Feature key
   * @param {string} userTier - User's tier
   * @returns {Object|null} Feature config
   */
  getFeatureConfig(featureKey, userTier) {
    const tier = userTier || TIERS.FREE;
    return FEATURE_ACCESS[featureKey]?.[tier] || null;
  }

  /**
   * Check if user has premium features
   * @param {string} userTier - User's tier
   * @returns {boolean} Has premium
   */
  hasPremiumFeatures(userTier) {
    return userTier !== TIERS.FREE;
  }

  /**
   * Get all features with access status
   * @param {string} userTier - User's tier
   * @returns {Object} All features with status
   */
  getAllFeatureStatus(userTier) {
    const tier = userTier || TIERS.FREE;
    const status = {};

    for (const [featureKey, config] of Object.entries(FEATURE_ACCESS)) {
      const tierConfig = config[tier];
      status[featureKey] = {
        enabled: tierConfig?.enabled || false,
        config: tierConfig,
        upgradePrompt: !tierConfig?.enabled ? UPGRADE_PROMPTS[featureKey]?.[tier] : null,
      };
    }

    return status;
  }

  // ============================================================
  // UTILITY METHODS
  // ============================================================

  /**
   * Get tiers enum
   * @returns {Object} Tiers
   */
  getTiers() {
    return TIERS;
  }

  /**
   * Get feature access matrix
   * @returns {Object} Feature access
   */
  getFeatureAccess() {
    return FEATURE_ACCESS;
  }

  /**
   * Clear user's cache
   * @param {string} userId - User ID
   */
  async clearCache(userId) {
    if (userId) {
      await cacheService.invalidate('FEATURE_USAGE', userId);
    }
  }

  /**
   * Get tier display name
   * @param {string} tier - Tier code
   * @returns {string} Display name
   */
  getTierDisplayName(tier) {
    const names = {
      [TIERS.FREE]: 'Miễn phí',
      [TIERS.TIER1]: 'Cơ bản',
      [TIERS.TIER2]: 'Nâng cao',
      [TIERS.TIER3]: 'VIP',
      [TIERS.ADMIN]: 'Admin',
      [TIERS.MANAGER]: 'Manager',
    };
    return names[tier] || 'Không xác định';
  }

  /**
   * Get tier from product/purchase
   * @param {string} productId - Product ID
   * @returns {string} Tier
   */
  getTierFromProduct(productId) {
    // Map product IDs to tiers
    const productTierMap = {
      // Add your product IDs here
      'gem_tier1': TIERS.TIER1,
      'gem_tier2': TIERS.TIER2,
      'gem_tier3': TIERS.TIER3,
      'gem_vip': TIERS.TIER3,
    };

    return productTierMap[productId] || null;
  }
}

// Export singleton instance
export const accessControlService = new AccessControlService();
export default accessControlService;

// Export constants
export { TIERS, FEATURE_ACCESS, UPGRADE_PROMPTS };
