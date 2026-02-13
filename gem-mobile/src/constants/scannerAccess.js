/**
 * =====================================================
 * File: src/constants/scannerAccess.js
 * Description: Scanner feature access control by tier
 * Version: 3.1
 * =====================================================
 */

/**
 * Scanner Access Configuration by Tier
 *
 * FREE: Basic scanning, limited features
 * TIER1: Volume & Zone Retest validation, Paper Trade
 * TIER2: Multi-timeframe, Advanced filters
 * TIER3: All features, custom thresholds
 */
export const SCANNER_ACCESS = {
  FREE: {
    tier: 0,
    name: 'Free',
    maxScansPerDay: 5,
    maxSymbols: 3,
    maxSymbolsPerScan: 1,
    timeframes: ['1h', '4h', '1d'],

    features: {
      // Pattern detection
      basicPatterns: true,
      advancedPatterns: false,

      // Validation (V2 features)
      volumeValidation: false,
      zoneRetest: false,
      mtfAnalysis: false,
      swingQuality: false,
      rsiDivergence: false,
      breakoutValidation: false,

      // UI features
      confidenceBreakdown: false,
      validationBadges: false,
      qualityGrades: false,

      // Trading
      paperTrade: false,
      zones: false,
      drawingTools: false,

      // Alerts
      alerts: false,
      pushNotifications: false,

      // Settings
      customThresholds: false,
      advancedFilters: false,
    },

    limits: {
      maxZonesPerChart: 0,
      maxAlertsPerCoin: 0,
      maxSavedResults: 10,
    },

    patterns: {
      count: 3,
      allowed: ['DPD', 'UPU', 'HEAD_SHOULDERS'],
    },
  },

  TIER1: {
    tier: 1,
    name: 'Tier 1',
    maxScansPerDay: -1,       // Unlimited
    maxSymbols: 50,
    maxSymbolsPerScan: 10,
    timeframes: ['15m', '30m', '1h', '4h', '1d'],

    features: {
      // Pattern detection
      basicPatterns: true,
      advancedPatterns: false,

      // Validation (V2 features)
      volumeValidation: true,       // ✅ NEW
      zoneRetest: true,             // ✅ NEW
      mtfAnalysis: false,
      swingQuality: false,
      rsiDivergence: false,
      breakoutValidation: true,     // ✅ NEW

      // UI features
      confidenceBreakdown: true,    // ✅ NEW
      validationBadges: true,       // ✅ NEW
      qualityGrades: true,          // ✅ NEW

      // Trading
      paperTrade: true,
      zones: true,
      drawingTools: true,

      // Alerts
      alerts: true,
      pushNotifications: true,

      // Settings
      customThresholds: false,
      advancedFilters: false,
    },

    limits: {
      maxZonesPerChart: 5,
      maxAlertsPerCoin: 3,
      maxSavedResults: 50,
      maxPendingOrders: 5,
    },

    patterns: {
      count: 7,
      allowed: [
        'DPD', 'UPU', 'HEAD_SHOULDERS',
        'DPU', 'UPD', 'DOUBLE_TOP', 'DOUBLE_BOTTOM',
      ],
    },
  },

  TIER2: {
    tier: 2,
    name: 'Tier 2',
    maxScansPerDay: -1,       // Unlimited
    maxSymbols: 200,
    maxSymbolsPerScan: 20,
    timeframes: ['5m', '15m', '30m', '1h', '2h', '4h', '1d'],

    features: {
      // Pattern detection
      basicPatterns: true,
      advancedPatterns: true,

      // Validation (V2 features)
      volumeValidation: true,
      zoneRetest: true,
      mtfAnalysis: true,            // ✅ NEW
      swingQuality: true,           // ✅ NEW
      rsiDivergence: true,          // ✅ NEW
      breakoutValidation: true,

      // UI features
      confidenceBreakdown: true,
      validationBadges: true,
      qualityGrades: true,

      // Trading
      paperTrade: true,
      zones: true,
      drawingTools: true,

      // Alerts
      alerts: true,
      pushNotifications: true,

      // Settings
      customThresholds: false,
      advancedFilters: true,        // ✅ NEW
    },

    limits: {
      maxZonesPerChart: 20,
      maxAlertsPerCoin: 10,
      maxSavedResults: 200,
      maxPendingOrders: 20,
      mtfTimeframes: 3,             // Can analyze 3 higher TFs
    },

    patterns: {
      count: 15,
      allowed: [
        'DPD', 'UPU', 'HEAD_SHOULDERS',
        'DPU', 'UPD', 'DOUBLE_TOP', 'DOUBLE_BOTTOM',
        'INVERSE_HEAD_SHOULDERS', 'ASCENDING_TRIANGLE', 'DESCENDING_TRIANGLE',
        'SYMMETRICAL_TRIANGLE', 'HFZ', 'LFZ', 'ROUNDING_BOTTOM', 'ROUNDING_TOP',
      ],
    },
  },

  TIER3: {
    tier: 3,
    name: 'Tier 3',
    maxScansPerDay: -1,       // Unlimited
    maxSymbols: -1,           // Unlimited
    maxSymbolsPerScan: -1,    // Unlimited
    timeframes: ['1m', '3m', '5m', '15m', '30m', '1h', '2h', '4h', '8h', '1d', '1w', '1M'],

    features: {
      // Pattern detection
      basicPatterns: true,
      advancedPatterns: true,

      // Validation (V2 features)
      volumeValidation: true,
      zoneRetest: true,
      mtfAnalysis: true,
      swingQuality: true,
      rsiDivergence: true,
      breakoutValidation: true,

      // UI features
      confidenceBreakdown: true,
      validationBadges: true,
      qualityGrades: true,

      // Trading
      paperTrade: true,
      zones: true,
      drawingTools: true,

      // Alerts
      alerts: true,
      pushNotifications: true,

      // Settings
      customThresholds: true,       // ✅ NEW - Can adjust thresholds
      advancedFilters: true,

      // Premium
      aiSignals: true,
      whaleTracking: true,
      apiAccess: true,
    },

    limits: {
      maxZonesPerChart: -1,         // Unlimited
      maxAlertsPerCoin: -1,         // Unlimited
      maxSavedResults: -1,          // Unlimited
      maxPendingOrders: -1,         // Unlimited
      mtfTimeframes: 5,             // Can analyze 5 higher TFs
    },

    patterns: {
      count: 24,
      allowed: 'ALL',               // All patterns
    },
  },
};

/**
 * Get tier key from tier number or string
 * @param {number|string} tier - User tier (0-3 or 'FREE'/'TIER1'/'TIER2'/'TIER3')
 * @returns {string} Tier key ('FREE', 'TIER1', 'TIER2', 'TIER3')
 */
export function getTierKey(tier) {
  // Handle string tiers (from AuthContext)
  if (typeof tier === 'string') {
    const upper = tier.toUpperCase();
    if (upper === 'TIER3' || upper === 'ADMIN') return 'TIER3';
    if (upper === 'TIER2') return 'TIER2';
    if (upper === 'TIER1') return 'TIER1';
    return 'FREE';
  }
  // Handle numeric tiers
  if (tier >= 3) return 'TIER3';
  if (tier === 2) return 'TIER2';
  if (tier === 1) return 'TIER1';
  return 'FREE';
}

/**
 * Check if user has access to a specific feature
 *
 * @param {number} userTier - User tier (0-3)
 * @param {string} feature - Feature name
 * @returns {boolean}
 */
export function hasAccess(userTier, feature) {
  const tierKey = getTierKey(userTier);
  const access = SCANNER_ACCESS[tierKey];

  if (!access?.features) return false;
  return access.features[feature] === true;
}

/**
 * Get full access configuration for a tier
 *
 * @param {number} userTier - User tier (0-3)
 * @returns {Object} Access configuration
 */
export function getAccessConfig(userTier) {
  const tierKey = getTierKey(userTier);
  return SCANNER_ACCESS[tierKey] || SCANNER_ACCESS.FREE;
}

/**
 * Get limit value for a tier
 *
 * @param {number} userTier - User tier
 * @param {string} limitName - Limit name
 * @returns {number} Limit value (-1 = unlimited)
 */
export function getLimit(userTier, limitName) {
  const config = getAccessConfig(userTier);
  return config.limits?.[limitName] ?? 0;
}

/**
 * Check if value is within limit
 *
 * @param {number} userTier - User tier
 * @param {string} limitName - Limit name
 * @param {number} currentValue - Current value to check
 * @returns {boolean}
 */
export function isWithinLimit(userTier, limitName, currentValue) {
  const limit = getLimit(userTier, limitName);
  if (limit === -1) return true; // Unlimited
  return currentValue < limit;
}

/**
 * Get allowed patterns for a tier
 *
 * @param {number} userTier - User tier
 * @returns {string[]} Array of pattern types
 */
export function getAllowedPatterns(userTier) {
  const config = getAccessConfig(userTier);
  if (config.patterns.allowed === 'ALL') {
    // Return all patterns for TIER3
    return [
      'DPD', 'UPU', 'HEAD_SHOULDERS',
      'DPU', 'UPD', 'DOUBLE_TOP', 'DOUBLE_BOTTOM',
      'INVERSE_HEAD_SHOULDERS', 'ASCENDING_TRIANGLE', 'DESCENDING_TRIANGLE',
      'SYMMETRICAL_TRIANGLE', 'HFZ', 'LFZ', 'ROUNDING_BOTTOM', 'ROUNDING_TOP',
      'BULL_FLAG', 'BEAR_FLAG', 'WEDGE', 'CUP_HANDLE',
      'ENGULFING', 'MORNING_STAR', 'EVENING_STAR', 'THREE_METHODS', 'HAMMER', 'FLAG',
    ];
  }
  return config.patterns.allowed || [];
}

/**
 * Check if a pattern is allowed for a tier
 *
 * @param {number} userTier - User tier
 * @param {string} patternType - Pattern type
 * @returns {boolean}
 */
export function isPatternAllowed(userTier, patternType) {
  const config = getAccessConfig(userTier);
  if (config.patterns.allowed === 'ALL') return true;
  return (config.patterns.allowed || []).includes(patternType);
}

/**
 * Get allowed timeframes for a tier
 *
 * @param {number} userTier - User tier
 * @returns {string[]} Array of timeframes
 */
export function getAllowedTimeframes(userTier) {
  const config = getAccessConfig(userTier);
  return config.timeframes || ['1h', '4h', '1d'];
}

/**
 * Check if timeframe is allowed
 *
 * @param {number} userTier - User tier
 * @param {string} timeframe - Timeframe to check
 * @returns {boolean}
 */
export function isTimeframeAllowed(userTier, timeframe) {
  const allowed = getAllowedTimeframes(userTier);
  return allowed.includes(timeframe);
}

/**
 * Get upgrade suggestion for a feature
 *
 * @param {string} feature - Feature name
 * @returns {Object} Upgrade info { tier, tierName, description }
 */
export function getUpgradeSuggestion(feature) {
  // Find minimum tier that has this feature
  const tiers = ['FREE', 'TIER1', 'TIER2', 'TIER3'];

  for (const tierKey of tiers) {
    if (SCANNER_ACCESS[tierKey]?.features?.[feature]) {
      return {
        tier: SCANNER_ACCESS[tierKey].tier,
        tierName: SCANNER_ACCESS[tierKey].name,
        description: getFeatureDescription(feature),
      };
    }
  }

  return null;
}

/**
 * Get feature description for upgrade prompts
 */
function getFeatureDescription(feature) {
  const descriptions = {
    volumeValidation: 'Xac thuc volume de loc pattern yeu',
    zoneRetest: 'Xac thuc zone retest truoc khi vao lenh',
    mtfAnalysis: 'Phan tich trend timeframe cao hon',
    swingQuality: 'Danh gia chat luong swing point',
    rsiDivergence: 'Phat hien phan ky RSI',
    confidenceBreakdown: 'Xem chi tiet diem confidence',
    customThresholds: 'Tuy chinh nguong xac thuc',
    advancedFilters: 'Bo loc nang cao',
    paperTrade: 'Giao dich mo phong',
    zones: 'Hien thi zone tren chart',
    alerts: 'Thong bao pattern',
  };
  return descriptions[feature] || feature;
}

/**
 * Feature list with tier requirements
 */
export const FEATURE_TIERS = {
  basicPatterns: 0,
  advancedPatterns: 2,
  volumeValidation: 1,
  zoneRetest: 1,
  breakoutValidation: 1,
  mtfAnalysis: 2,
  swingQuality: 2,
  rsiDivergence: 2,
  confidenceBreakdown: 1,
  validationBadges: 1,
  qualityGrades: 1,
  paperTrade: 1,
  zones: 1,
  drawingTools: 1,
  alerts: 1,
  pushNotifications: 1,
  customThresholds: 3,
  advancedFilters: 2,
  aiSignals: 3,
  whaleTracking: 3,
  apiAccess: 3,
};

export default {
  SCANNER_ACCESS,
  getTierKey,
  hasAccess,
  getAccessConfig,
  getLimit,
  isWithinLimit,
  getAllowedPatterns,
  isPatternAllowed,
  getAllowedTimeframes,
  isTimeframeAllowed,
  getUpgradeSuggestion,
  FEATURE_TIERS,
};
