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
   */
  static TIER_LIMITS = {
    FREE: {
      queries: 5,
      voice: 3,         // Voice messages per day
      scanner: 'FREE',
      chatbot: 'FREE',
      patterns: 3,
      name: 'Free',
      color: '#FF6B6B'
    },
    TIER1: {
      queries: 15,
      voice: -1,        // Unlimited voice
      scanner: 'PRO',
      chatbot: 'PRO',
      patterns: 7,
      name: 'Tier 1',
      color: '#FFBD59'
    },
    PRO: {
      queries: 15,
      voice: -1,        // Unlimited voice
      scanner: 'PRO',
      chatbot: 'PRO',
      patterns: 7,
      name: 'Pro',
      color: '#FFBD59'
    },
    TIER2: {
      queries: 50,
      voice: -1,        // Unlimited voice
      scanner: 'PREMIUM',
      chatbot: 'PREMIUM',
      patterns: 15,
      name: 'Tier 2',
      color: '#6A5BFF'
    },
    PREMIUM: {
      queries: 50,
      voice: -1,        // Unlimited voice
      scanner: 'PREMIUM',
      chatbot: 'PREMIUM',
      patterns: 15,
      name: 'Premium',
      color: '#6A5BFF'
    },
    TIER3: {
      queries: -1,      // Unlimited
      voice: -1,        // Unlimited voice
      scanner: 'VIP',
      chatbot: 'VIP',
      patterns: 24,
      name: 'Tier 3 VIP',
      color: '#FFD700'
    },
    VIP: {
      queries: -1,      // Unlimited
      voice: -1,        // Unlimited voice
      scanner: 'VIP',
      chatbot: 'VIP',
      patterns: 24,
      name: 'VIP',
      color: '#FFD700'
    },
    ADMIN: {
      queries: -1,      // Unlimited
      voice: -1,        // Unlimited voice
      scanner: 'ADMIN',
      chatbot: 'ADMIN',
      patterns: -1,     // Unlimited patterns
      name: 'Admin',
      color: '#FF00FF'  // Magenta for admin
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
}

export default TierService;
