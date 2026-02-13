/**
 * Gemral - Badge Service
 * Centralized badge logic and definitions for user badges
 * Consistent with web app implementation
 */

import { COLORS } from '../utils/tokens';

// ═══════════════════════════════════════════════════════════
// BADGE COLORS - Match database badge_definitions
// ═══════════════════════════════════════════════════════════
export const BADGE_COLORS = {
  // Verification badges
  verified_seller: COLORS.success,    // #3AF7A6
  verified_trader: COLORS.info,       // #3B82F6

  // Tier badges
  tier_free: 'rgba(255, 255, 255, 0.3)',
  tier_1: '#00D9FF',                  // Cyan
  tier_2: COLORS.gold,                // #FFBD59
  tier_3: '#FFD700',                  // Gold (was white)

  // Level badges (based on win rate)
  bronze: '#CD7F32',
  silver: '#C0C0C0',
  gold: '#FFD700',
  diamond: '#B9F2FF',

  // Role badges
  admin: '#FFD700',                   // Gold (was COLORS.error)
  moderator: '#F59E0B',               // Amber
  mentor: '#10B981',                  // Emerald

  // Achievement badges
  top_trader: COLORS.gold,            // #FFBD59
  pattern_master: '#8B5CF6',          // Purple
  early_adopter: '#FFD700',
  whale: '#00D9FF',
  streak_master: '#F97316',
  community_star: '#EC4899',
};

// ═══════════════════════════════════════════════════════════
// BADGE ICONS - Lucide icon names
// ═══════════════════════════════════════════════════════════
export const BADGE_ICONS = {
  // Verification
  verified_seller: 'ShieldCheck',
  verified_trader: 'BadgeCheck',

  // Tier
  tier_free: 'User',
  tier_1: 'Star',
  tier_2: 'Sparkles',
  tier_3: 'Crown',

  // Level
  bronze: 'TrendingUp',
  silver: 'TrendingUp',
  gold: 'TrendingUp',
  diamond: 'Gem',

  // Role
  admin: 'Shield',
  moderator: 'ShieldAlert',
  mentor: 'GraduationCap',

  // Achievement
  top_trader: 'Trophy',
  pattern_master: 'Target',
  early_adopter: 'Rocket',
  whale: 'Waves',
  streak_master: 'Flame',
  community_star: 'Star',
};

// ═══════════════════════════════════════════════════════════
// BADGE LABELS - Display names
// ═══════════════════════════════════════════════════════════
export const BADGE_LABELS = {
  // Verification
  verified_seller: 'Verified Seller',
  verified_trader: 'Verified Trader',

  // Tier
  tier_free: 'Free',
  tier_1: 'Tier 1',
  tier_2: 'Tier 2',
  tier_3: 'Tier 3',

  // Level
  bronze: 'Bronze',
  silver: 'Silver',
  gold: 'Gold',
  diamond: 'Diamond',

  // Role
  admin: 'Admin',
  moderator: 'Moderator',
  mentor: 'Mentor',

  // Achievement
  top_trader: 'Top Trader',
  pattern_master: 'Pattern Master',
  early_adopter: 'Early Adopter',
  whale: 'Whale',
  streak_master: 'Streak Master',
  community_star: 'Community Star',
};

// ═══════════════════════════════════════════════════════════
// BADGE PRIORITY - Higher number = higher priority
// ═══════════════════════════════════════════════════════════
export const BADGE_PRIORITY = {
  // Verification (highest)
  verified_seller: 100,
  verified_trader: 99,

  // Role
  admin: 90,
  moderator: 85,
  mentor: 80,

  // Tier
  tier_3: 70,
  tier_2: 65,
  tier_1: 60,
  tier_free: 50,

  // Level
  diamond: 45,
  gold: 40,
  silver: 35,
  bronze: 30,

  // Achievement (lowest)
  top_trader: 25,
  pattern_master: 24,
  early_adopter: 23,
  whale: 22,
  streak_master: 21,
  community_star: 20,
};

// ═══════════════════════════════════════════════════════════
// SIZE CONFIGURATIONS
// ═══════════════════════════════════════════════════════════
export const BADGE_SIZES = {
  tiny: {
    iconSize: 12,
    containerSize: 16,
    fontSize: 8,
    borderRadius: 4,
  },
  small: {
    iconSize: 14,
    containerSize: 20,
    fontSize: 9,
    borderRadius: 5,
  },
  medium: {
    iconSize: 16,
    containerSize: 24,
    fontSize: 10,
    borderRadius: 6,
  },
  large: {
    iconSize: 20,
    containerSize: 32,
    fontSize: 12,
    borderRadius: 8,
  },
};

// ═══════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════

/**
 * Convert scanner_tier/chatbot_tier to badge type
 * @param {string} tier - e.g., 'FREE', 'TIER1', 'TIER2', 'TIER3', 'ADMIN', '999'
 * @returns {string} Badge type e.g., 'tier_free', 'tier_1', 'tier_2', 'tier_3'
 */
export const tierToBadgeType = (tier) => {
  if (!tier) return 'tier_free';

  const normalizedTier = tier.toString().toUpperCase();

  switch (normalizedTier) {
    case 'TIER3':
    case 'TIER_3':
    case '3':
    case 'ADMIN':
    case '999':
      return 'tier_3';
    case 'TIER2':
    case 'TIER_2':
    case '2':
      return 'tier_2';
    case 'TIER1':
    case 'TIER_1':
    case '1':
      return 'tier_1';
    case 'FREE':
    case 'TIER0':
    case '0':
    default:
      return 'tier_free';
  }
};

/**
 * Get all badges for a user profile
 * @param {Object} profile - User profile object
 * @returns {Array} Array of badge objects sorted by priority
 */
export const getUserBadges = (profile) => {
  if (!profile) return [];

  const badges = [];

  // 1. Verification badges (highest priority)
  if (profile.verified_seller) {
    badges.push({
      type: 'verified_seller',
      category: 'verification',
    });
  }

  if (profile.verified_trader) {
    badges.push({
      type: 'verified_trader',
      category: 'verification',
    });
  }

  // 2. Role badges
  const role = profile.role?.toLowerCase();
  if (role === 'admin') {
    badges.push({ type: 'admin', category: 'role' });
  } else if (role === 'moderator') {
    badges.push({ type: 'moderator', category: 'role' });
  } else if (role === 'mentor') {
    badges.push({ type: 'mentor', category: 'role' });
  }

  // Also check role_badge field
  if (profile.role_badge && profile.role_badge !== role) {
    const roleBadge = profile.role_badge.toLowerCase();
    if (['admin', 'moderator', 'mentor'].includes(roleBadge)) {
      const exists = badges.some(b => b.type === roleBadge);
      if (!exists) {
        badges.push({ type: roleBadge, category: 'role' });
      }
    }
  }

  // 3. Tier badges (use highest tier)
  const scannerTier = profile.scanner_tier;
  const chatbotTier = profile.chatbot_tier;

  // Get highest tier
  const tierBadge = tierToBadgeType(scannerTier || chatbotTier);
  if (tierBadge && tierBadge !== 'tier_free') {
    badges.push({ type: tierBadge, category: 'tier' });
  }

  // 4. Level badges (skip bronze as it's default)
  const levelBadge = profile.level_badge?.toLowerCase();
  if (levelBadge && levelBadge !== 'bronze') {
    if (['silver', 'gold', 'diamond'].includes(levelBadge)) {
      badges.push({ type: levelBadge, category: 'level' });
    }
  }

  // 5. Achievement badges (first one only)
  if (profile.achievement_badges) {
    let achievements = profile.achievement_badges;

    // Parse if string
    if (typeof achievements === 'string') {
      try {
        achievements = JSON.parse(achievements);
      } catch {
        achievements = [];
      }
    }

    // Handle array
    if (Array.isArray(achievements) && achievements.length > 0) {
      const firstAchievement = achievements[0].toLowerCase().replace(/\s+/g, '_');
      if (BADGE_COLORS[firstAchievement]) {
        badges.push({ type: firstAchievement, category: 'achievement' });
      }
    }
  }

  // Sort by priority (highest first)
  badges.sort((a, b) => {
    const priorityA = BADGE_PRIORITY[a.type] || 0;
    const priorityB = BADGE_PRIORITY[b.type] || 0;
    return priorityB - priorityA;
  });

  return badges;
};

/**
 * Get badge configuration by type
 * @param {string} type - Badge type
 * @returns {Object} Badge configuration
 */
export const getBadgeConfig = (type) => {
  return {
    type,
    color: BADGE_COLORS[type] || COLORS.textMuted,
    icon: BADGE_ICONS[type] || 'Circle',
    label: BADGE_LABELS[type] || type,
    priority: BADGE_PRIORITY[type] || 0,
  };
};

/**
 * Get size configuration
 * @param {string} size - 'tiny', 'small', 'medium', 'large'
 * @returns {Object} Size configuration
 */
export const getBadgeSizeConfig = (size = 'small') => {
  return BADGE_SIZES[size] || BADGE_SIZES.small;
};

export default {
  BADGE_COLORS,
  BADGE_ICONS,
  BADGE_LABELS,
  BADGE_PRIORITY,
  BADGE_SIZES,
  tierToBadgeType,
  getUserBadges,
  getBadgeConfig,
  getBadgeSizeConfig,
};
