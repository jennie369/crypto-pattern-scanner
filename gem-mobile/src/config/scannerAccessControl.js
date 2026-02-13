/**
 * Scanner Access Control - Tier-based feature gating
 *
 * TIERS:
 * - FREE (0): Basic patterns, 1 timeframe, limited coins
 * - TIER1/SILVER (1): More patterns, 3 timeframes, more coins
 * - TIER2/GOLD (2): All patterns, all timeframes, unlimited
 * - TIER3/DIAMOND (3): All features + priority support
 * - ADMIN (99): Full access
 *
 * USAGE:
 * import {
 *   canAccessFeature,
 *   canUsePattern,
 *   getTierLimits,
 *   SCANNER_ACCESS_TIERS
 * } from '../config/scannerAccessControl';
 *
 * if (canAccessFeature(userTier, 'websocketEnabled')) {
 *   // Enable real-time prices
 * }
 */

// =====================================================
// TIER DEFINITIONS
// =====================================================

export const SCANNER_ACCESS_TIERS = {
  FREE: {
    level: 0,
    name: 'Free',
    nameVN: 'Miễn phí',
    color: '#888888',
    features: {
      // Limits
      maxCoins: 10,
      maxTimeframes: 1,
      maxPatternsPerScan: 20,
      scanCooldown: 60, // seconds between scans

      // Allowed timeframes
      allowedTimeframes: ['1h'],

      // Allowed patterns (basic only)
      allowedPatterns: [
        'Double Top',
        'Double Bottom',
        'Support',
        'Resistance',
        'LFZ',
        'HFZ',
      ],

      // Features
      cacheEnabled: false,
      websocketEnabled: false,
      notificationsEnabled: false,
      v2EnhancementsEnabled: false,
      opposingPatternTP: false,
      multiTFScan: false,
      volumeValidation: false,
      swingQuality: false,
      zoneRetest: false,
      mtfAnalysis: false,

      // UI
      showSkeletonLoading: true,
      showProgressBar: true,
      virtualizedList: false,
    },
  },

  TIER1: {
    level: 1,
    name: 'Silver',
    nameVN: 'Bạc',
    color: '#C0C0C0',
    features: {
      // Limits
      maxCoins: 50,
      maxTimeframes: 3,
      maxPatternsPerScan: 50,
      scanCooldown: 30,

      // Allowed timeframes
      allowedTimeframes: ['15m', '1h', '4h'],

      // Allowed patterns (intermediate)
      allowedPatterns: [
        'Double Top',
        'Double Bottom',
        'Triple Top',
        'Triple Bottom',
        'Head and Shoulders',
        'Inverse H&S',
        'Ascending Triangle',
        'Descending Triangle',
        'Symmetrical Triangle',
        'Support',
        'Resistance',
        'LFZ',
        'HFZ',
      ],

      // Features
      cacheEnabled: true,
      websocketEnabled: true,
      notificationsEnabled: true,
      v2EnhancementsEnabled: false,
      opposingPatternTP: false,
      multiTFScan: true,
      volumeValidation: true,
      swingQuality: false,
      zoneRetest: true,
      mtfAnalysis: false,

      // UI
      showSkeletonLoading: true,
      showProgressBar: true,
      virtualizedList: true,
    },
  },

  TIER2: {
    level: 2,
    name: 'Gold',
    nameVN: 'Vàng',
    color: '#FFD700',
    features: {
      // Limits
      maxCoins: 200,
      maxTimeframes: 5,
      maxPatternsPerScan: 200,
      scanCooldown: 10,

      // Allowed timeframes
      allowedTimeframes: ['5m', '15m', '1h', '4h', '1d'],

      // Allowed patterns (all)
      allowedPatterns: 'ALL',

      // Features
      cacheEnabled: true,
      websocketEnabled: true,
      notificationsEnabled: true,
      v2EnhancementsEnabled: true,
      opposingPatternTP: true,
      multiTFScan: true,
      volumeValidation: true,
      swingQuality: true,
      zoneRetest: true,
      mtfAnalysis: true,

      // UI
      showSkeletonLoading: true,
      showProgressBar: true,
      virtualizedList: true,
    },
  },

  TIER3: {
    level: 3,
    name: 'Diamond',
    nameVN: 'Kim cương',
    color: '#B9F2FF',
    features: {
      // Limits (-1 = unlimited)
      maxCoins: -1,
      maxTimeframes: -1,
      maxPatternsPerScan: -1,
      scanCooldown: 0,

      // Allowed timeframes
      allowedTimeframes: 'ALL',

      // Allowed patterns
      allowedPatterns: 'ALL',

      // Features
      cacheEnabled: true,
      websocketEnabled: true,
      notificationsEnabled: true,
      v2EnhancementsEnabled: true,
      opposingPatternTP: true,
      multiTFScan: true,
      volumeValidation: true,
      swingQuality: true,
      zoneRetest: true,
      mtfAnalysis: true,
      prioritySupport: true,
      apiAccess: true,
      customAlerts: true,
      exportData: true,

      // UI
      showSkeletonLoading: true,
      showProgressBar: true,
      virtualizedList: true,
    },
  },

  ADMIN: {
    level: 99,
    name: 'Admin',
    nameVN: 'Quản trị',
    color: '#FF0000',
    features: {
      // All unlimited
      maxCoins: -1,
      maxTimeframes: -1,
      maxPatternsPerScan: -1,
      scanCooldown: 0,
      allowedTimeframes: 'ALL',
      allowedPatterns: 'ALL',

      // All features enabled
      cacheEnabled: true,
      websocketEnabled: true,
      notificationsEnabled: true,
      v2EnhancementsEnabled: true,
      opposingPatternTP: true,
      multiTFScan: true,
      volumeValidation: true,
      swingQuality: true,
      zoneRetest: true,
      mtfAnalysis: true,
      prioritySupport: true,
      apiAccess: true,
      customAlerts: true,
      exportData: true,
      debugMode: true,
      adminPanel: true,

      // UI
      showSkeletonLoading: true,
      showProgressBar: true,
      virtualizedList: true,
    },
  },
};

// Aliases for backwards compatibility
SCANNER_ACCESS_TIERS.SILVER = SCANNER_ACCESS_TIERS.TIER1;
SCANNER_ACCESS_TIERS.GOLD = SCANNER_ACCESS_TIERS.TIER2;
SCANNER_ACCESS_TIERS.DIAMOND = SCANNER_ACCESS_TIERS.TIER3;

// =====================================================
// ALL TIMEFRAMES
// =====================================================

export const ALL_TIMEFRAMES = [
  '1m', '3m', '5m', '15m', '30m',
  '1h', '2h', '4h', '6h', '8h', '12h',
  '1d', '3d', '1w', '1M',
];

// =====================================================
// ALL PATTERNS
// =====================================================

export const ALL_PATTERNS = [
  // Basic zones
  'LFZ', 'HFZ', 'Support', 'Resistance',

  // Double patterns
  'Double Top', 'Double Bottom',

  // Triple patterns
  'Triple Top', 'Triple Bottom',

  // Head and Shoulders
  'Head and Shoulders', 'Inverse H&S', 'Inverse Head and Shoulders',

  // Triangles
  'Ascending Triangle', 'Descending Triangle', 'Symmetrical Triangle',

  // Wedges
  'Rising Wedge', 'Falling Wedge',

  // Flags
  'Bull Flag', 'Bear Flag',

  // Cup and Handle
  'Cup and Handle', 'Inverse Cup and Handle',

  // Candlestick
  'Hammer', 'Inverted Hammer', 'Doji', 'Engulfing',
  'Morning Star', 'Evening Star', 'Shooting Star',

  // Advanced
  'DPD', 'DPU', 'UPD', 'UPU',
  'Quasimodo', 'QM', 'Diamond',
];

// =====================================================
// HELPER FUNCTIONS
// =====================================================

/**
 * Get tier config from tier name or level
 * @param {string|number} tier - Tier name or level
 * @returns {object} Tier config
 */
export function getTierConfig(tier) {
  if (typeof tier === 'number') {
    // Find by level
    const found = Object.values(SCANNER_ACCESS_TIERS).find(t => t.level === tier);
    return found || SCANNER_ACCESS_TIERS.FREE;
  }

  // Find by name (case-insensitive)
  const upperTier = String(tier).toUpperCase();
  return SCANNER_ACCESS_TIERS[upperTier] || SCANNER_ACCESS_TIERS.FREE;
}

/**
 * Check if user can access a feature
 * @param {string|number} userTier - User's tier
 * @param {string} feature - Feature name
 * @returns {boolean}
 */
export function canAccessFeature(userTier, feature) {
  const tier = getTierConfig(userTier);
  const value = tier.features[feature];

  // Handle boolean features
  if (typeof value === 'boolean') return value;

  // Handle numeric features (-1 = unlimited, which is truthy)
  if (typeof value === 'number') return value !== 0;

  // Handle 'ALL' string
  if (value === 'ALL') return true;

  // Handle arrays (non-empty = has access)
  if (Array.isArray(value)) return value.length > 0;

  return false;
}

/**
 * Check if pattern type is allowed
 * @param {string|number} userTier - User's tier
 * @param {string} patternType - Pattern type name
 * @returns {boolean}
 */
export function canUsePattern(userTier, patternType) {
  const tier = getTierConfig(userTier);
  const allowed = tier.features.allowedPatterns;

  if (allowed === 'ALL') return true;
  if (!Array.isArray(allowed)) return false;

  // Case-insensitive match
  const upperPattern = String(patternType).toUpperCase();
  return allowed.some(p => p.toUpperCase() === upperPattern);
}

/**
 * Check if timeframe is allowed
 * @param {string|number} userTier - User's tier
 * @param {string} timeframe - Timeframe
 * @returns {boolean}
 */
export function canUseTimeframe(userTier, timeframe) {
  const tier = getTierConfig(userTier);
  const allowed = tier.features.allowedTimeframes;

  if (allowed === 'ALL') return true;
  if (!Array.isArray(allowed)) return false;

  return allowed.includes(timeframe);
}

/**
 * Get limits for tier
 * @param {string|number} userTier - User's tier
 * @returns {object} Limits
 */
export function getTierLimits(userTier) {
  const tier = getTierConfig(userTier);
  return {
    maxCoins: tier.features.maxCoins,
    maxTimeframes: tier.features.maxTimeframes,
    maxPatternsPerScan: tier.features.maxPatternsPerScan,
    scanCooldown: tier.features.scanCooldown,
  };
}

/**
 * Get allowed timeframes for tier
 * @param {string|number} userTier - User's tier
 * @returns {string[]} Timeframes
 */
export function getAllowedTimeframes(userTier) {
  const tier = getTierConfig(userTier);
  const allowed = tier.features.allowedTimeframes;

  if (allowed === 'ALL') return ALL_TIMEFRAMES;
  return Array.isArray(allowed) ? allowed : ['1h'];
}

/**
 * Get allowed patterns for tier
 * @param {string|number} userTier - User's tier
 * @returns {string[]} Patterns
 */
export function getAllowedPatterns(userTier) {
  const tier = getTierConfig(userTier);
  const allowed = tier.features.allowedPatterns;

  if (allowed === 'ALL') return ALL_PATTERNS;
  return Array.isArray(allowed) ? allowed : [];
}

/**
 * Get tier display info
 * @param {string|number} userTier - User's tier
 * @returns {object} { name, nameVN, color, level }
 */
export function getTierDisplayInfo(userTier) {
  const tier = getTierConfig(userTier);
  return {
    name: tier.name,
    nameVN: tier.nameVN,
    color: tier.color,
    level: tier.level,
  };
}

/**
 * Check if upgrade is available
 * @param {string|number} currentTier - Current tier
 * @returns {object|null} Next tier info or null if max
 */
export function getUpgradeInfo(currentTier) {
  const current = getTierConfig(currentTier);

  if (current.level >= 3) return null; // Already at max (or admin)

  const nextLevel = current.level + 1;
  const nextTier = Object.values(SCANNER_ACCESS_TIERS).find(t => t.level === nextLevel);

  if (!nextTier) return null;

  return {
    currentTier: current,
    nextTier,
    newFeatures: Object.entries(nextTier.features)
      .filter(([key, value]) => {
        const currentValue = current.features[key];
        return value !== currentValue;
      })
      .map(([key]) => key),
  };
}

// =====================================================
// DEFAULT EXPORT
// =====================================================

export default {
  SCANNER_ACCESS_TIERS,
  ALL_TIMEFRAMES,
  ALL_PATTERNS,
  getTierConfig,
  canAccessFeature,
  canUsePattern,
  canUseTimeframe,
  getTierLimits,
  getAllowedTimeframes,
  getAllowedPatterns,
  getTierDisplayInfo,
  getUpgradeInfo,
};
