/**
 * useAccessControl Hook
 *
 * Provides feature access control based on the user's subscription tier.
 * Wraps accessControlService (when available) and falls back to local
 * tier configuration from AuthContext.
 *
 * Features controlled: chatbot, tarot, iching, rituals, voice, export,
 * gamification, emotion, scanner, courses.
 *
 * @example
 * const { tier, canUse, getRemainingQuota, showUpgradeModal, setShowUpgradeModal } = useAccessControl();
 *
 * if (!canUse('chatbot')) {
 *   setShowUpgradeModal(true);
 *   return;
 * }
 *
 * @returns {Object} Access control state and helpers
 * @property {string} tier - Current user tier ('free', 'tier1', 'tier2', 'tier3')
 * @property {Function} canUse - Check if user can use a feature: canUse('chatbot') => boolean
 * @property {Function} getRemainingQuota - Get remaining quota for a feature: getRemainingQuota('chatbot') => number|-1
 * @property {Function} getFeatureConfig - Get full config for a feature
 * @property {boolean} showUpgradeModal - Whether the upgrade modal should be shown
 * @property {Function} setShowUpgradeModal - Control upgrade modal visibility
 * @property {string|null} upgradeFeature - The feature that triggered the upgrade modal
 * @property {Function} requestAccess - Check access and auto-show upgrade modal if denied
 * @property {boolean} loading - Whether auth data is still loading
 * @property {boolean} isFreeTier - Shortcut for tier === 'free'
 * @property {boolean} isPaidTier - Shortcut for tier !== 'free'
 */

import { useState, useCallback, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';

// ============================================================
// TIER CONFIGURATION
// ============================================================

/**
 * Tier limits define what each subscription tier can access.
 * -1 means unlimited. 0 means feature is disabled.
 *
 * Each feature has:
 *   - enabled: whether the feature is accessible at all
 *   - dailyLimit: max uses per day (-1 = unlimited)
 *   - description: human-readable tier description
 */
export const TIER_LIMITS = {
  free: {
    chatbot: { enabled: true, dailyLimit: 5, description: '5 tin nhan/ngay' },
    tarot: { enabled: true, dailyLimit: 1, description: '1 lan rut bai/ngay' },
    iching: { enabled: true, dailyLimit: 1, description: '1 lan gieo que/ngay' },
    rituals: { enabled: false, dailyLimit: 0, description: 'Nang cap de su dung' },
    voice: { enabled: false, dailyLimit: 0, description: 'Nang cap de su dung' },
    export: { enabled: false, dailyLimit: 0, description: 'Nang cap de su dung' },
    gamification: { enabled: true, dailyLimit: -1, description: 'Co ban' },
    emotion: { enabled: true, dailyLimit: 3, description: '3 lan/ngay' },
    scanner: { enabled: true, dailyLimit: 5, description: '5 luot scan/ngay' },
    courses: { enabled: true, dailyLimit: -1, description: 'Khoa hoc mien phi' },
  },
  tier1: {
    chatbot: { enabled: true, dailyLimit: 30, description: '30 tin nhan/ngay' },
    tarot: { enabled: true, dailyLimit: 5, description: '5 lan rut bai/ngay' },
    iching: { enabled: true, dailyLimit: 5, description: '5 lan gieo que/ngay' },
    rituals: { enabled: true, dailyLimit: 3, description: '3 nghi thuc/ngay' },
    voice: { enabled: false, dailyLimit: 0, description: 'Nang cap len Tier 2' },
    export: { enabled: true, dailyLimit: 5, description: '5 lan xuat/ngay' },
    gamification: { enabled: true, dailyLimit: -1, description: 'Day du' },
    emotion: { enabled: true, dailyLimit: 10, description: '10 lan/ngay' },
    scanner: { enabled: true, dailyLimit: 20, description: '20 luot scan/ngay' },
    courses: { enabled: true, dailyLimit: -1, description: 'Tier 1 courses' },
  },
  tier2: {
    chatbot: { enabled: true, dailyLimit: 100, description: '100 tin nhan/ngay' },
    tarot: { enabled: true, dailyLimit: -1, description: 'Khong gioi han' },
    iching: { enabled: true, dailyLimit: -1, description: 'Khong gioi han' },
    rituals: { enabled: true, dailyLimit: -1, description: 'Khong gioi han' },
    voice: { enabled: true, dailyLimit: 10, description: '10 lan/ngay' },
    export: { enabled: true, dailyLimit: -1, description: 'Khong gioi han' },
    gamification: { enabled: true, dailyLimit: -1, description: 'Day du + bonus' },
    emotion: { enabled: true, dailyLimit: -1, description: 'Khong gioi han' },
    scanner: { enabled: true, dailyLimit: 50, description: '50 luot scan/ngay' },
    courses: { enabled: true, dailyLimit: -1, description: 'Tier 1 + Tier 2 courses' },
  },
  tier3: {
    chatbot: { enabled: true, dailyLimit: -1, description: 'Khong gioi han' },
    tarot: { enabled: true, dailyLimit: -1, description: 'Khong gioi han' },
    iching: { enabled: true, dailyLimit: -1, description: 'Khong gioi han' },
    rituals: { enabled: true, dailyLimit: -1, description: 'Khong gioi han' },
    voice: { enabled: true, dailyLimit: -1, description: 'Khong gioi han' },
    export: { enabled: true, dailyLimit: -1, description: 'Khong gioi han' },
    gamification: { enabled: true, dailyLimit: -1, description: 'VIP' },
    emotion: { enabled: true, dailyLimit: -1, description: 'Khong gioi han' },
    scanner: { enabled: true, dailyLimit: -1, description: 'Khong gioi han' },
    courses: { enabled: true, dailyLimit: -1, description: 'Tat ca khoa hoc' },
  },
};

/**
 * All feature names for iteration/validation.
 */
export const FEATURES = [
  'chatbot',
  'tarot',
  'iching',
  'rituals',
  'voice',
  'export',
  'gamification',
  'emotion',
  'scanner',
  'courses',
];

// ============================================================
// LOCAL QUOTA TRACKING (per-session, resets on page reload)
// For persistent quota tracking, use accessControlService when available.
// ============================================================

const sessionQuota = {};

/**
 * Get the session key for a user+feature combo.
 */
function getQuotaKey(userId, feature) {
  const today = new Date().toISOString().split('T')[0];
  return `${userId}_${feature}_${today}`;
}

/**
 * Get current usage count from session storage.
 */
function getSessionUsage(userId, feature) {
  const key = getQuotaKey(userId, feature);
  return sessionQuota[key] || 0;
}

/**
 * Increment usage count in session storage.
 */
function incrementSessionUsage(userId, feature) {
  const key = getQuotaKey(userId, feature);
  sessionQuota[key] = (sessionQuota[key] || 0) + 1;
  return sessionQuota[key];
}

// ============================================================
// HOOK
// ============================================================

export function useAccessControl() {
  const { user, profile, loading: authLoading, getChatbotTier, getScannerTier, getCourseTier } = useAuth();

  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeFeature, setUpgradeFeature] = useState(null);

  /**
   * Resolve the effective tier for the user.
   * Uses the highest tier across chatbot/scanner/course, or falls back to 'free'.
   * Admin/manager users always get tier3.
   */
  const tier = useMemo(() => {
    if (!profile) return 'free';

    // Admin and manager always get full access
    const role = profile.role?.toLowerCase();
    if (role === 'admin' || role === 'manager') return 'tier3';

    // Use the highest tier across all product tiers
    const tiers = [
      getChatbotTier?.() || profile.chatbot_tier || 'free',
      getScannerTier?.() || profile.scanner_tier || 'free',
      getCourseTier?.() || profile.course_tier || 'free',
    ];

    const tierOrder = { free: 0, tier1: 1, tier2: 2, tier3: 3 };
    let highest = 'free';

    for (const t of tiers) {
      if ((tierOrder[t] || 0) > (tierOrder[highest] || 0)) {
        highest = t;
      }
    }

    return highest;
  }, [profile, getChatbotTier, getScannerTier, getCourseTier]);

  /**
   * Get the tier config for a specific feature.
   *
   * Some features use product-specific tiers:
   * - chatbot -> chatbot_tier
   * - scanner -> scanner_tier
   * - courses -> course_tier
   * Others use the overall (highest) tier.
   */
  const getFeatureTier = useCallback((feature) => {
    if (!profile) return 'free';

    const role = profile.role?.toLowerCase();
    if (role === 'admin' || role === 'manager') return 'tier3';

    switch (feature) {
      case 'chatbot':
        return getChatbotTier?.() || profile.chatbot_tier || 'free';
      case 'scanner':
        return getScannerTier?.() || profile.scanner_tier || 'free';
      case 'courses':
        return getCourseTier?.() || profile.course_tier || 'free';
      default:
        // For other features, use overall tier
        return tier;
    }
  }, [profile, tier, getChatbotTier, getScannerTier, getCourseTier]);

  /**
   * Get the full configuration for a feature at the user's tier.
   *
   * @param {string} feature - Feature name (e.g., 'chatbot', 'tarot')
   * @returns {Object} Feature config with enabled, dailyLimit, description
   */
  const getFeatureConfig = useCallback((feature) => {
    if (!FEATURES.includes(feature)) {
      console.warn(`[useAccessControl] Unknown feature: ${feature}`);
      return { enabled: false, dailyLimit: 0, description: 'Unknown feature' };
    }

    const featureTier = getFeatureTier(feature);
    const tierConfig = TIER_LIMITS[featureTier] || TIER_LIMITS.free;
    return tierConfig[feature] || { enabled: false, dailyLimit: 0, description: 'Not configured' };
  }, [getFeatureTier]);

  /**
   * Check if the user can use a specific feature.
   * Returns true if the feature is enabled for their tier AND
   * they haven't exceeded the daily limit (if applicable).
   *
   * @param {string} feature - Feature name
   * @returns {boolean} Whether the user can use this feature
   */
  const canUse = useCallback((feature) => {
    const config = getFeatureConfig(feature);

    if (!config.enabled) return false;
    if (config.dailyLimit === -1) return true; // Unlimited

    if (!user?.id) return false;

    const usage = getSessionUsage(user.id, feature);
    return usage < config.dailyLimit;
  }, [user?.id, getFeatureConfig]);

  /**
   * Get the remaining quota for a feature.
   *
   * @param {string} feature - Feature name
   * @returns {number} Remaining uses. -1 means unlimited. 0 means exhausted or disabled.
   */
  const getRemainingQuota = useCallback((feature) => {
    const config = getFeatureConfig(feature);

    if (!config.enabled) return 0;
    if (config.dailyLimit === -1) return -1; // Unlimited

    if (!user?.id) return 0;

    const usage = getSessionUsage(user.id, feature);
    return Math.max(0, config.dailyLimit - usage);
  }, [user?.id, getFeatureConfig]);

  /**
   * Record usage of a feature (increment session counter).
   * Call this AFTER successfully using the feature.
   *
   * @param {string} feature - Feature name
   * @returns {Object} { success, remaining }
   */
  const recordUsage = useCallback((feature) => {
    if (!user?.id) {
      return { success: false, remaining: 0, error: 'Not authenticated' };
    }

    if (!canUse(feature)) {
      return { success: false, remaining: 0, error: 'Quota exceeded or feature disabled' };
    }

    const newCount = incrementSessionUsage(user.id, feature);
    const config = getFeatureConfig(feature);
    const remaining = config.dailyLimit === -1 ? -1 : Math.max(0, config.dailyLimit - newCount);

    return { success: true, remaining, usage: newCount };
  }, [user?.id, canUse, getFeatureConfig]);

  /**
   * Request access to a feature. If denied, automatically shows the upgrade modal.
   * Use this as a gate before feature usage.
   *
   * @param {string} feature - Feature name
   * @returns {boolean} Whether access is granted
   */
  const requestAccess = useCallback((feature) => {
    const allowed = canUse(feature);

    if (!allowed) {
      setUpgradeFeature(feature);
      setShowUpgradeModal(true);
      return false;
    }

    return true;
  }, [canUse]);

  /**
   * Close the upgrade modal and clear the triggering feature.
   */
  const dismissUpgradeModal = useCallback(() => {
    setShowUpgradeModal(false);
    setUpgradeFeature(null);
  }, []);

  /**
   * Get a human-readable description of the limit for a feature at the current tier.
   *
   * @param {string} feature - Feature name
   * @returns {string} Description of the limit
   */
  const getLimitDescription = useCallback((feature) => {
    const config = getFeatureConfig(feature);
    return config.description || '';
  }, [getFeatureConfig]);

  /**
   * Get the tier required to unlock a feature (the minimum tier where it's enabled).
   *
   * @param {string} feature - Feature name
   * @returns {string|null} Minimum tier needed, or null if available at all tiers
   */
  const getRequiredTier = useCallback((feature) => {
    const tierOrder = ['free', 'tier1', 'tier2', 'tier3'];

    for (const t of tierOrder) {
      const config = TIER_LIMITS[t]?.[feature];
      if (config?.enabled) return t;
    }

    return null;
  }, []);

  // Convenience flags
  const isFreeTier = tier === 'free';
  const isPaidTier = tier !== 'free';

  return {
    // Current tier
    tier,
    isFreeTier,
    isPaidTier,

    // Feature checks
    canUse,
    getRemainingQuota,
    getFeatureConfig,
    getFeatureTier,
    getLimitDescription,
    getRequiredTier,
    recordUsage,

    // Upgrade modal
    showUpgradeModal,
    setShowUpgradeModal,
    upgradeFeature,
    requestAccess,
    dismissUpgradeModal,

    // State
    loading: authLoading,
  };
}

export default useAccessControl;
