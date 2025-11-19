/**
 * Tier Helper Utilities
 * Handles tier level conversion and access checking
 * Supports UPPERCASE tier values (FREE, TIER1, TIER2, TIER3)
 */

/**
 * Convert tier string to numeric level for comparison
 * @param {string} tierString - Tier value ('FREE', 'TIER1', 'TIER2', 'TIER3')
 * @returns {number} - Tier level (0-3)
 */
export const getTierLevel = (tierString) => {
  if (!tierString) return 0;

  const normalized = tierString.toUpperCase().trim();

  const mapping = {
    'FREE': 0,
    'TIER1': 1,
    'TIER2': 2,
    'TIER3': 3,
    // Backward compatibility
    'TIER_1': 1,
    'TIER_2': 2,
    'TIER_3': 3,
  };

  return mapping[normalized] || 0;
};

/**
 * Convert tier number to label string
 * @param {number} tierNum - Tier level (0-3)
 * @returns {string} - Tier label ('FREE', 'TIER1', etc.)
 */
export const getTierLabel = (tierNum) => {
  if (tierNum === 0 || tierNum === null || tierNum === undefined) {
    return 'FREE';
  }
  return `TIER${tierNum}`;
};

/**
 * Check if user has access to content with required tier
 * @param {string} userTier - User's current tier
 * @param {number|string} requiredTier - Required tier (can be number or string)
 * @returns {boolean} - True if user has access
 */
export const hasAccess = (userTier, requiredTier) => {
  const userLevel = getTierLevel(userTier);
  const requiredLevel = typeof requiredTier === 'number'
    ? requiredTier
    : getTierLevel(requiredTier);

  return userLevel >= requiredLevel;
};

/**
 * Get tier badge configuration (color, icon, label)
 * @param {number} tierNum - Tier level (1-3)
 * @returns {object} - Badge configuration
 */
export const getTierBadge = (tierNum) => {
  const badges = {
    1: {
      label: 'TIER 1',
      color: 'var(--tier1-color)',
      bg: 'var(--tier1-bg)',
      border: 'var(--tier1-border)',
      icon: '💎',
      name: 'Gold'
    },
    2: {
      label: 'TIER 2',
      color: 'var(--tier2-color)',
      bg: 'var(--tier2-bg)',
      border: 'var(--tier2-border)',
      icon: '💎',
      name: 'Purple'
    },
    3: {
      label: 'TIER 3',
      color: 'var(--tier3-color)',
      bg: 'var(--tier3-bg)',
      border: 'var(--tier3-border)',
      icon: '💎',
      name: 'Pink'
    }
  };

  return badges[tierNum] || {
    label: 'FREE',
    color: 'var(--tier-free-color)',
    bg: 'var(--tier-free-bg)',
    border: 'transparent',
    icon: '🔓',
    name: 'Free'
  };
};

/**
 * Format price for display (Vietnamese Dong)
 * @param {number} price - Price in VND
 * @returns {string} - Formatted price string
 */
export const formatPrice = (price) => {
  if (price === 0) return 'Miễn phí';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price);
};

/**
 * Get tier upgrade path
 * @param {string} currentTier - Current user tier
 * @returns {object} - Next tier info
 */
export const getNextTier = (currentTier) => {
  const currentLevel = getTierLevel(currentTier);

  if (currentLevel >= 3) {
    return null; // Already at max tier
  }

  const nextLevel = currentLevel + 1;
  const nextTier = getTierLabel(nextLevel);
  const badge = getTierBadge(nextLevel);

  return {
    tier: nextTier,
    level: nextLevel,
    ...badge
  };
};

/**
 * Calculate tier progress percentage
 * @param {string} currentTier - Current tier
 * @param {number} maxTier - Maximum tier (default 3)
 * @returns {number} - Progress percentage (0-100)
 */
export const getTierProgress = (currentTier, maxTier = 3) => {
  const currentLevel = getTierLevel(currentTier);
  return Math.round((currentLevel / maxTier) * 100);
};

/**
 * Check if user needs to upgrade for feature
 * @param {string} userTier - User's current tier
 * @param {string|number} featureTier - Required tier for feature
 * @returns {object} - Upgrade info { needsUpgrade, toTier, fromTier }
 */
export const checkUpgradeNeeded = (userTier, featureTier) => {
  const hasUserAccess = hasAccess(userTier, featureTier);

  if (hasUserAccess) {
    return {
      needsUpgrade: false,
      toTier: null,
      fromTier: userTier
    };
  }

  const requiredLevel = typeof featureTier === 'number'
    ? featureTier
    : getTierLevel(featureTier);

  return {
    needsUpgrade: true,
    toTier: getTierLabel(requiredLevel),
    fromTier: userTier,
    badge: getTierBadge(requiredLevel)
  };
};
