/**
 * GEM Mobile - Tier Service
 * Quản lý tier access cho users
 *
 * TIER LOGIC:
 * - User có thể mua Bundle (khóa học + scanner + chatbot)
 * - Hoặc mua standalone Chatbot (PRO/PREMIUM/VIP)
 * - Highest tier purchased = user tier
 *
 * TIERS:
 * - FREE: 5 queries/day (default)
 * - TIER1/PRO: 15 queries/day (39k/month hoặc Bundle 11M)
 * - TIER2/PREMIUM: 50 queries/day (59k/month hoặc Bundle 21M)
 * - TIER3/VIP: Unlimited (99k/month hoặc Bundle 68M)
 */

import { supabase } from './supabase';

class TierService {
  /**
   * Tier limits configuration
   * queries: -1 = unlimited
   *
   * VISION BOARD LIMITS (bundled with Chatbot tier):
   * - goals: Max số lượng goals user có thể tạo
   * - actionsPerGoal: Max actions mỗi goal
   * - affirmations: Max affirmations tổng cộng
   * - habits: Max habits tổng cộng
   *
   * CHATBOT PRICING:
   * - FREE: 5 queries/day (default)
   * - PRO: 39.000đ/tháng hoặc Bundle Tier 1 (11M)
   * - PREMIUM: 59.000đ/tháng hoặc Bundle Tier 2 (21M)
   * - VIP: 99.000đ/tháng hoặc Bundle Tier 3 (68M)
   */
  static TIER_LIMITS = {
    FREE: {
      queries: 5,
      voice: 3,         // Voice messages per day
      scanner: 'FREE',
      chatbot: 'FREE',
      patterns: 3,
      name: 'Free',
      color: '#FF6B6B',
      // Vision Board limits
      visionBoard: {
        goals: 3,
        actionsPerGoal: 5,
        affirmations: 5,
        habits: 3,
      }
    },
    TIER1: {
      queries: 15,
      voice: -1,        // Unlimited voice
      scanner: 'PRO',
      chatbot: 'PRO',
      patterns: 7,
      name: 'Tier 1',
      color: '#FFBD59',
      // Vision Board limits
      visionBoard: {
        goals: 10,
        actionsPerGoal: 15,
        affirmations: 20,
        habits: 10,
      }
    },
    PRO: {
      queries: 15,
      voice: -1,        // Unlimited voice
      scanner: 'PRO',
      chatbot: 'PRO',
      patterns: 7,
      name: 'Pro',
      color: '#FFBD59',
      // Vision Board limits
      visionBoard: {
        goals: 10,
        actionsPerGoal: 15,
        affirmations: 20,
        habits: 10,
      }
    },
    TIER2: {
      queries: 50,
      voice: -1,        // Unlimited voice
      scanner: 'PREMIUM',
      chatbot: 'PREMIUM',
      patterns: 15,
      name: 'Tier 2',
      color: '#6A5BFF',
      // Vision Board limits
      visionBoard: {
        goals: 30,
        actionsPerGoal: 30,
        affirmations: 50,
        habits: 20,
      }
    },
    PREMIUM: {
      queries: 50,
      voice: -1,        // Unlimited voice
      scanner: 'PREMIUM',
      chatbot: 'PREMIUM',
      patterns: 15,
      name: 'Premium',
      color: '#6A5BFF',
      // Vision Board limits
      visionBoard: {
        goals: 30,
        actionsPerGoal: 30,
        affirmations: 50,
        habits: 20,
      }
    },
    TIER3: {
      queries: -1,      // Unlimited
      voice: -1,        // Unlimited voice
      scanner: 'VIP',
      chatbot: 'VIP',
      patterns: 24,
      name: 'Tier 3 VIP',
      color: '#FFD700',
      // Vision Board limits - Unlimited
      visionBoard: {
        goals: -1,
        actionsPerGoal: -1,
        affirmations: -1,
        habits: -1,
      }
    },
    VIP: {
      queries: -1,      // Unlimited
      voice: -1,        // Unlimited voice
      scanner: 'VIP',
      chatbot: 'VIP',
      patterns: 24,
      name: 'VIP',
      color: '#FFD700',
      // Vision Board limits - Unlimited
      visionBoard: {
        goals: -1,
        actionsPerGoal: -1,
        affirmations: -1,
        habits: -1,
      }
    },
    ADMIN: {
      queries: -1,      // Unlimited
      voice: -1,        // Unlimited voice
      scanner: 'ADMIN',
      chatbot: 'ADMIN',
      patterns: -1,     // Unlimited patterns
      name: 'Admin',
      color: '#FF00FF', // Magenta for admin
      // Vision Board limits - Unlimited
      visionBoard: {
        goals: -1,
        actionsPerGoal: -1,
        affirmations: -1,
        habits: -1,
      }
    }
  };

  /**
   * Tier hierarchy for comparison
   */
  static TIER_HIERARCHY = {
    'FREE': 0,
    'TIER1': 1,
    'PRO': 1,
    'TIER2': 2,
    'PREMIUM': 2,
    'TIER3': 3,
    'VIP': 3,
    'ADMIN': 99  // Admin has highest priority
  };

  /**
   * Get user tier from purchases and profile
   * @param {string} userId
   * @returns {Promise<string>} - 'FREE' | 'TIER1' | 'TIER2' | 'TIER3' | 'ADMIN'
   */
  static async getUserTier(userId) {
    try {
      if (!userId) {
        console.log('[TierService] No userId, returning FREE');
        return 'FREE';
      }

      // First check profiles table for tiers and admin status
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('chatbot_tier, scanner_tier, course_tier, is_admin, role')
        .eq('id', userId)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('[TierService] Profile error:', profileError);
      }

      // ADMIN CHECK: If user is admin, return ADMIN tier (unlimited access)
      if (profile) {
        const isAdmin = profile.is_admin === true ||
                        profile.role === 'admin' ||
                        profile.role === 'ADMIN' ||
                        profile.scanner_tier === 'ADMIN' ||
                        profile.chatbot_tier === 'ADMIN';

        if (isAdmin) {
          console.log(`[TierService] User ${userId} is ADMIN - granting ADMIN access (unlimited)`);
          return 'ADMIN'; // Admin gets unlimited access
        }
      }

      let highestTier = 'FREE';
      let highestLevel = 0;

      // Check profile tiers
      if (profile) {
        const profileTiers = [
          profile.chatbot_tier,
          profile.scanner_tier,
          profile.course_tier
        ].filter(Boolean);

        profileTiers.forEach(tier => {
          const normalizedTier = this.normalizeTier(tier);
          const level = this.TIER_HIERARCHY[normalizedTier] || 0;
          if (level > highestLevel) {
            highestLevel = level;
            highestTier = normalizedTier;
          }
        });
      }

      // Also check user_purchases table if exists
      const { data: purchases, error: purchasesError } = await supabase
        .from('user_purchases')
        .select('product_type, product_tier, is_active')
        .eq('user_id', userId)
        .eq('is_active', true);

      if (!purchasesError && purchases && purchases.length > 0) {
        purchases.forEach(purchase => {
          let purchaseTier = 'FREE';

          // Bundle purchases
          if (purchase.product_type === 'bundle') {
            purchaseTier = purchase.product_tier || 'TIER1';
          }

          // Standalone chatbot/scanner purchases
          if (purchase.product_type === 'chatbot' || purchase.product_type === 'scanner') {
            const tierMap = {
              'PRO': 'TIER1',
              'PREMIUM': 'TIER2',
              'VIP': 'TIER3'
            };
            purchaseTier = tierMap[purchase.product_tier] || 'TIER1';
          }

          const normalizedTier = this.normalizeTier(purchaseTier);
          const level = this.TIER_HIERARCHY[normalizedTier] || 0;
          if (level > highestLevel) {
            highestLevel = level;
            highestTier = normalizedTier;
          }
        });
      }

      console.log(`[TierService] User ${userId} tier: ${highestTier}`);
      return highestTier;

    } catch (error) {
      console.error('[TierService] Error getting user tier:', error);
      return 'FREE';
    }
  }

  /**
   * Normalize tier name to standard format
   * @param {string} tier
   * @returns {string}
   */
  static normalizeTier(tier) {
    if (!tier) return 'FREE';

    const upperTier = tier.toUpperCase();

    // Map various tier names to standard tiers
    const tierMap = {
      'FREE': 'FREE',
      'TIER1': 'TIER1',
      'TIER2': 'TIER2',
      'TIER3': 'TIER3',
      'PRO': 'TIER1',
      'PREMIUM': 'TIER2',
      'VIP': 'TIER3',
      'TIER_1': 'TIER1',
      'TIER_2': 'TIER2',
      'TIER_3': 'TIER3',
      'ADMIN': 'ADMIN'  // Keep ADMIN as is
    };

    return tierMap[upperTier] || 'FREE';
  }

  /**
   * Get tier limits
   * @param {string} tier
   * @returns {Object}
   */
  static getTierLimits(tier) {
    const normalizedTier = this.normalizeTier(tier);
    return this.TIER_LIMITS[normalizedTier] || this.TIER_LIMITS.FREE;
  }

  /**
   * Get display name for tier
   * @param {string} tier
   * @returns {string}
   */
  static getTierDisplayName(tier) {
    const limits = this.getTierLimits(tier);
    return limits.name || 'Free';
  }

  /**
   * Get tier color
   * @param {string} tier
   * @returns {string}
   */
  static getTierColor(tier) {
    const limits = this.getTierLimits(tier);
    return limits.color || '#FF6B6B';
  }

  /**
   * Check if tier has unlimited queries
   * @param {string} tier
   * @returns {boolean}
   */
  static isUnlimited(tier) {
    const limits = this.getTierLimits(tier);
    return limits.queries === -1;
  }

  /**
   * Get next tier upgrade info
   * @param {string} currentTier
   * @returns {Object|null}
   */
  static getNextTierInfo(currentTier) {
    const normalizedTier = this.normalizeTier(currentTier);

    // ADMIN and TIER3/VIP don't need upgrades
    if (normalizedTier === 'ADMIN' || normalizedTier === 'TIER3') {
      return null;
    }

    const upgrades = {
      FREE: {
        tier: 'TIER1',
        name: 'PRO',
        fullName: 'TIER 1: NỀN TẢNG TRADER',
        price: '39.000đ/tháng',
        bundlePrice: '11 triệu',
        benefits: [
          '15 câu hỏi/ngày (thay vì 5)',
          'Phân tích chuyên sâu',
          'Response time ~5s',
          'Memory context (10 câu)'
        ],
        productId: 'gem-chatbot-pro',
        bundleId: 'tier-1-bundle'
      },
      TIER1: {
        tier: 'TIER2',
        name: 'PREMIUM',
        fullName: 'TIER 2: TẦN SỐ THỊNH VƯỢNG',
        price: '59.000đ/tháng',
        bundlePrice: '21 triệu',
        benefits: [
          '50 câu hỏi/ngày (thay vì 15)',
          'Phân tích expert-level',
          'Priority response ~3s',
          'Memory context (30 câu)'
        ],
        productId: 'gem-chatbot-premium',
        bundleId: 'tier-2-bundle'
      },
      TIER2: {
        tier: 'TIER3',
        name: 'VIP',
        fullName: 'TIER 3: ĐẾ CHẾ BẬC THẦY',
        price: '99.000đ/tháng',
        bundlePrice: '68 triệu',
        benefits: [
          'Không giới hạn câu hỏi',
          'Phân tích expert-level',
          'Priority response ~2s',
          'Memory context (50 câu)',
          'Custom prompts'
        ],
        productId: 'gem-chatbot-vip',
        bundleId: 'tier-3-vip-bundle'
      }
    };

    return upgrades[normalizedTier] || null;
  }

  /**
   * Compare two tiers
   * @param {string} tier1
   * @param {string} tier2
   * @returns {number} - -1 if tier1 < tier2, 0 if equal, 1 if tier1 > tier2
   */
  static compareTiers(tier1, tier2) {
    const level1 = this.TIER_HIERARCHY[this.normalizeTier(tier1)] || 0;
    const level2 = this.TIER_HIERARCHY[this.normalizeTier(tier2)] || 0;

    if (level1 < level2) return -1;
    if (level1 > level2) return 1;
    return 0;
  }

  /**
   * Check if user is admin
   * @param {string} userId
   * @returns {Promise<boolean>}
   */
  static async isAdmin(userId) {
    try {
      if (!userId) return false;

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('is_admin, role, scanner_tier, chatbot_tier')
        .eq('id', userId)
        .single();

      if (error || !profile) return false;

      return profile.is_admin === true ||
             profile.role === 'admin' ||
             profile.role === 'ADMIN' ||
             profile.scanner_tier === 'ADMIN' ||
             profile.chatbot_tier === 'ADMIN';
    } catch (error) {
      console.error('[TierService] Error checking admin:', error);
      return false;
    }
  }

  /**
   * Check if tier is admin
   * @param {string} tier
   * @returns {boolean}
   */
  static isTierAdmin(tier) {
    return this.normalizeTier(tier) === 'ADMIN';
  }

  // ========================================
  // VOICE INPUT QUOTA (Day 11-12)
  // ========================================

  /**
   * Get voice limit for tier
   * @param {string} tier
   * @returns {number} - -1 = unlimited
   */
  static getVoiceLimit(tier) {
    const limits = this.getTierLimits(tier);
    return limits.voice || 3;
  }

  /**
   * Check if tier has unlimited voice
   * @param {string} tier
   * @returns {boolean}
   */
  static hasUnlimitedVoice(tier) {
    const limits = this.getTierLimits(tier);
    return limits.voice === -1;
  }

  /**
   * Get voice quota info for display
   * @param {string} tier
   * @param {number} usedToday - Voice messages used today
   * @returns {Object}
   */
  static getVoiceQuotaInfo(tier, usedToday = 0) {
    const normalizedTier = this.normalizeTier(tier);
    const limits = this.getTierLimits(normalizedTier);

    if (limits.voice === -1) {
      return {
        isUnlimited: true,
        used: usedToday,
        limit: -1,
        remaining: -1,
        canUse: true,
        displayText: 'Không giới hạn'
      };
    }

    const remaining = Math.max(0, limits.voice - usedToday);

    return {
      isUnlimited: false,
      used: usedToday,
      limit: limits.voice,
      remaining: remaining,
      canUse: remaining > 0,
      displayText: `${remaining}/${limits.voice} còn lại`
    };
  }

  // ========================================
  // VISION BOARD QUOTA (Bundled with Chatbot)
  // ========================================

  /**
   * Get Vision Board limits for a tier
   * @param {string} tier
   * @returns {Object} - { goals, actionsPerGoal, affirmations, habits }
   */
  static getVisionBoardLimits(tier) {
    const normalizedTier = this.normalizeTier(tier);
    const limits = this.getTierLimits(normalizedTier);
    return limits.visionBoard || {
      goals: 3,
      actionsPerGoal: 5,
      affirmations: 5,
      habits: 3,
    };
  }

  /**
   * Check if user can create more goals
   * @param {string} tier
   * @param {number} currentCount - Current number of goals
   * @returns {Object} - { canCreate, remaining, limit, isUnlimited }
   */
  static checkGoalQuota(tier, currentCount) {
    const vbLimits = this.getVisionBoardLimits(tier);
    const limit = vbLimits.goals;

    if (limit === -1) {
      return {
        canCreate: true,
        remaining: -1,
        limit: -1,
        isUnlimited: true,
        displayText: 'Không giới hạn'
      };
    }

    const remaining = Math.max(0, limit - currentCount);
    return {
      canCreate: remaining > 0,
      remaining,
      limit,
      isUnlimited: false,
      displayText: `${currentCount}/${limit}`
    };
  }

  /**
   * Check if user can create more actions for a goal
   * @param {string} tier
   * @param {number} currentCount - Current actions in this goal
   * @returns {Object}
   */
  static checkActionQuota(tier, currentCount) {
    const vbLimits = this.getVisionBoardLimits(tier);
    const limit = vbLimits.actionsPerGoal;

    if (limit === -1) {
      return {
        canCreate: true,
        remaining: -1,
        limit: -1,
        isUnlimited: true,
        displayText: 'Không giới hạn'
      };
    }

    const remaining = Math.max(0, limit - currentCount);
    return {
      canCreate: remaining > 0,
      remaining,
      limit,
      isUnlimited: false,
      displayText: `${currentCount}/${limit}`
    };
  }

  /**
   * Check if user can create more affirmations
   * @param {string} tier
   * @param {number} currentCount
   * @returns {Object}
   */
  static checkAffirmationQuota(tier, currentCount) {
    const vbLimits = this.getVisionBoardLimits(tier);
    const limit = vbLimits.affirmations;

    if (limit === -1) {
      return {
        canCreate: true,
        remaining: -1,
        limit: -1,
        isUnlimited: true,
        displayText: 'Không giới hạn'
      };
    }

    const remaining = Math.max(0, limit - currentCount);
    return {
      canCreate: remaining > 0,
      remaining,
      limit,
      isUnlimited: false,
      displayText: `${currentCount}/${limit}`
    };
  }

  /**
   * Check if user can create more habits
   * @param {string} tier
   * @param {number} currentCount
   * @returns {Object}
   */
  static checkHabitQuota(tier, currentCount) {
    const vbLimits = this.getVisionBoardLimits(tier);
    const limit = vbLimits.habits;

    if (limit === -1) {
      return {
        canCreate: true,
        remaining: -1,
        limit: -1,
        isUnlimited: true,
        displayText: 'Không giới hạn'
      };
    }

    const remaining = Math.max(0, limit - currentCount);
    return {
      canCreate: remaining > 0,
      remaining,
      limit,
      isUnlimited: false,
      displayText: `${currentCount}/${limit}`
    };
  }

  /**
   * Get Vision Board quota summary for display
   * @param {string} tier
   * @param {Object} currentCounts - { goals, actions, affirmations, habits }
   * @returns {Object} - Summary with all quotas
   */
  static getVisionBoardQuotaSummary(tier, currentCounts = {}) {
    const vbLimits = this.getVisionBoardLimits(tier);

    return {
      goals: this.checkGoalQuota(tier, currentCounts.goals || 0),
      actions: this.checkActionQuota(tier, currentCounts.actions || 0),
      affirmations: this.checkAffirmationQuota(tier, currentCounts.affirmations || 0),
      habits: this.checkHabitQuota(tier, currentCounts.habits || 0),
      tier: this.normalizeTier(tier),
      tierName: this.getTierDisplayName(tier),
      tierColor: this.getTierColor(tier),
    };
  }

  /**
   * Get upgrade message for Vision Board
   * @param {string} tier
   * @param {string} widgetType - 'goal', 'action', 'affirmation', 'habit'
   * @returns {Object|null}
   */
  static getVisionBoardUpgradeInfo(tier, widgetType) {
    const nextTier = this.getNextTierInfo(tier);
    if (!nextTier) return null;

    const currentLimits = this.getVisionBoardLimits(tier);
    const nextLimits = this.getVisionBoardLimits(nextTier.tier);

    const limitMap = {
      goal: { current: currentLimits.goals, next: nextLimits.goals, label: 'mục tiêu' },
      action: { current: currentLimits.actionsPerGoal, next: nextLimits.actionsPerGoal, label: 'hành động/mục tiêu' },
      affirmation: { current: currentLimits.affirmations, next: nextLimits.affirmations, label: 'khẳng định' },
      habit: { current: currentLimits.habits, next: nextLimits.habits, label: 'thói quen' },
    };

    const info = limitMap[widgetType];
    if (!info) return null;

    const nextDisplay = info.next === -1 ? 'Không giới hạn' : info.next;

    return {
      message: `Bạn đã đạt giới hạn ${info.current} ${info.label}. Nâng cấp lên ${nextTier.name} để có ${nextDisplay} ${info.label}!`,
      nextTier: nextTier.name,
      nextTierPrice: nextTier.price,
      currentLimit: info.current,
      nextLimit: info.next,
      productId: nextTier.productId,
      bundleId: nextTier.bundleId,
    };
  }

  // ========================================
  // SUBSCRIPTION EXPIRATION HELPERS
  // ========================================

  /**
   * Get user tier with expiration check
   * Uses chatbot_tier as the primary tier for Vision Board
   * @param {string} userId
   * @returns {Promise<Object>} - { tier, expiresAt, isExpired, daysRemaining }
   */
  static async getUserTierWithExpiration(userId) {
    try {
      if (!userId) {
        return { tier: 'FREE', expiresAt: null, isExpired: false, daysRemaining: null };
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('chatbot_tier, chatbot_tier_expires_at, scanner_tier, scanner_tier_expires_at, is_admin, role')
        .eq('id', userId)
        .single();

      if (error || !profile) {
        return { tier: 'FREE', expiresAt: null, isExpired: false, daysRemaining: null };
      }

      // Admin check
      if (profile.is_admin || profile.role === 'admin' || profile.role === 'ADMIN') {
        return { tier: 'ADMIN', expiresAt: null, isExpired: false, daysRemaining: null };
      }

      // Use chatbot_tier for Vision Board (bundled)
      const tier = this.normalizeTier(profile.chatbot_tier);
      const expiresAt = profile.chatbot_tier_expires_at;

      if (!expiresAt) {
        // Lifetime access or FREE tier
        return { tier, expiresAt: null, isExpired: false, daysRemaining: null };
      }

      const now = new Date();
      const expireDate = new Date(expiresAt);
      const isExpired = expireDate < now;
      const daysRemaining = isExpired ? 0 : Math.ceil((expireDate - now) / (1000 * 60 * 60 * 24));

      // If expired, treat as FREE
      const effectiveTier = isExpired ? 'FREE' : tier;

      return {
        tier: effectiveTier,
        originalTier: tier,
        expiresAt,
        isExpired,
        daysRemaining,
        warningLevel: daysRemaining <= 3 ? 'critical' :
                      daysRemaining <= 7 ? 'warning' :
                      daysRemaining <= 14 ? 'notice' : null
      };
    } catch (error) {
      console.error('[TierService] Error getting tier with expiration:', error);
      return { tier: 'FREE', expiresAt: null, isExpired: false, daysRemaining: null };
    }
  }
}

export default TierService;
