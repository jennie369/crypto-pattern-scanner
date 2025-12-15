/**
 * Tier-based Feature Access Control
 * Defines which features are available for each tier
 * Reused from web version for GEM Mobile
 *
 * PHASE 1 FEATURES (TIER2/3 ONLY):
 * - Volume Confirmation
 * - Trend Analysis
 * - Retest Validation
 * - Quality Filtering
 */

export const TIER_FEATURES = {
  FREE: {
    volumeConfirmation: false,
    trendAnalysis: false,
    retestValidation: false,
    qualityFiltering: false,
    srConfluence: false,
    candleConfirmation: false,
    rsiDivergence: false,
    dynamicRR: false,
    multiTimeframe: false,
    minPatternScore: 40, // Show more patterns (lower quality ok)
    maxPatterns: 3,      // Limit patterns shown
    scanLabel: 'Basic Scan'
  },

  TIER1: {
    volumeConfirmation: false,
    trendAnalysis: false,
    retestValidation: false,
    qualityFiltering: false,
    srConfluence: false,
    candleConfirmation: false,
    rsiDivergence: false,
    dynamicRR: false,
    multiTimeframe: false,
    minPatternScore: 40,
    maxPatterns: 7,
    scanLabel: 'Basic Scan'
  },

  TIER2: {
    volumeConfirmation: true,  // ENABLED
    trendAnalysis: true,       // ENABLED
    retestValidation: true,    // ENABLED
    qualityFiltering: true,    // ENABLED
    srConfluence: true,        // ENABLED
    candleConfirmation: true,  // ENABLED
    rsiDivergence: true,       // ENABLED
    dynamicRR: true,           // ENABLED
    multiTimeframe: true,      // ENABLED (3 TFs)
    minPatternScore: 50,       // Higher quality threshold
    maxPatterns: 15,
    scanLabel: 'Enhanced Scan'
  },

  TIER3: {
    volumeConfirmation: true,  // ENABLED
    trendAnalysis: true,       // ENABLED
    retestValidation: true,    // ENABLED
    qualityFiltering: true,    // ENABLED
    srConfluence: true,        // ENABLED
    candleConfirmation: true,  // ENABLED
    rsiDivergence: true,       // ENABLED
    dynamicRR: true,           // ENABLED
    multiTimeframe: true,      // ENABLED (5 TFs)
    minPatternScore: 45,       // Show slightly more for analysis
    maxPatterns: 50,
    scanLabel: 'Elite Scan'
  },

  // Admin tier for testing
  ADMIN: {
    volumeConfirmation: true,
    trendAnalysis: true,
    retestValidation: true,
    qualityFiltering: true,
    srConfluence: true,
    candleConfirmation: true,
    rsiDivergence: true,
    dynamicRR: true,
    multiTimeframe: true,
    minPatternScore: 35,       // See all patterns for debugging
    maxPatterns: 100,
    scanLabel: 'Admin Scan'
  }
};

/**
 * Check if user has access to a specific feature
 * @param {String} userTier - User's tier (FREE, TIER1, TIER2, TIER3, ADMIN)
 * @param {String} featureName - Feature to check
 * @returns {Boolean}
 */
export function hasFeatureAccess(userTier, featureName) {
  const normalizedTier = normalizeTierName(userTier);
  const tierConfig = TIER_FEATURES[normalizedTier] || TIER_FEATURES.FREE;
  return tierConfig[featureName] === true;
}

/**
 * Get tier configuration
 * @param {String} userTier
 * @returns {Object} Tier config
 */
export function getTierConfig(userTier) {
  const normalizedTier = normalizeTierName(userTier);
  return TIER_FEATURES[normalizedTier] || TIER_FEATURES.FREE;
}

/**
 * Normalize tier name to match TIER_FEATURES keys
 * @param {String} tier - Input tier name
 * @returns {String} Normalized tier name
 */
export function normalizeTierName(tier) {
  if (!tier) return 'FREE';

  const upperTier = tier.toUpperCase();

  // Map common variations (includes aliases from DATABASE_SCHEMA)
  const tierMap = {
    'FREE': 'FREE',
    'TIER1': 'TIER1',
    'TIER2': 'TIER2',
    'TIER3': 'TIER3',
    'ADMIN': 'ADMIN',
    // Aliases (per DATABASE_SCHEMA.md)
    'PRO': 'TIER1',       // PRO = TIER1
    'PREMIUM': 'TIER2',   // PREMIUM = TIER2
    'VIP': 'TIER3',       // VIP = TIER3
  };

  return tierMap[upperTier] || 'FREE';
}

/**
 * Check if user has premium tier (TIER2 or higher)
 * @param {String} userTier
 * @returns {Boolean}
 */
export function isPremiumTier(userTier) {
  const normalizedTier = normalizeTierName(userTier);
  return ['TIER2', 'TIER3', 'ADMIN'].includes(normalizedTier);
}

/**
 * Get features comparison for upgrade prompts
 * Includes Phase 1 + Phase 2 + Phase 3 features
 */
export const FEATURE_COMPARISON = {
  // ====================================
  // PHASE 1 FEATURES
  // ====================================
  volumeConfirmation: {
    name: 'Volume Confirmation',
    description: 'Filter out low-volume false signals',
    impact: '+8-10% win rate',
    requiredTier: 'TIER2',
    phase: 'PHASE_1',
    icon: '📊'
  },
  trendAnalysis: {
    name: 'Trend Context Analysis',
    description: 'Adjust confidence based on market trend',
    impact: '+5-7% win rate',
    requiredTier: 'TIER2',
    phase: 'PHASE_1',
    icon: '📈'
  },
  retestValidation: {
    name: 'Zone Retest Validation',
    description: 'Wait for proper retest - GEM Method core',
    impact: '+8-12% win rate',
    requiredTier: 'TIER2',
    phase: 'PHASE_1',
    icon: '🎯'
  },
  qualityFiltering: {
    name: 'Quality Scoring & Filtering',
    description: 'Show only high-quality setups',
    impact: '+5-8% win rate',
    requiredTier: 'TIER2',
    phase: 'PHASE_1',
    icon: '⭐'
  },

  // ====================================
  // PHASE 2 FEATURES
  // ====================================
  srConfluence: {
    name: 'Support/Resistance Confluence',
    description: 'Validate entries at key price levels',
    impact: '+4-6% win rate',
    requiredTier: 'TIER2',
    phase: 'PHASE_2',
    icon: '🔗'
  },
  candleConfirmation: {
    name: 'Candlestick Confirmation',
    description: 'Wait for candle confirmation signals',
    impact: '+3-5% win rate',
    requiredTier: 'TIER2',
    phase: 'PHASE_2',
    icon: '🕯️'
  },

  // ====================================
  // PHASE 3 FEATURES
  // ====================================
  rsiDivergence: {
    name: 'RSI Divergence Detection',
    description: 'Detect bullish/bearish divergence patterns',
    impact: '+5-8% win rate',
    requiredTier: 'TIER2',
    phase: 'PHASE_3',
    icon: '📉'
  },
  dynamicRR: {
    name: 'Dynamic R:R Optimization',
    description: 'Auto-optimize targets based on volatility & trend',
    impact: '+2-4% win rate',
    requiredTier: 'TIER2',
    phase: 'PHASE_3',
    icon: '⚖️'
  },
  multiTimeframe: {
    name: 'Multi-Timeframe Scanning',
    description: 'Scan patterns across multiple timeframes',
    impact: '+10-15% confluence accuracy',
    requiredTier: 'TIER2',
    phase: 'PHASE_3',
    icon: '🔄'
  }
};

/**
 * Get list of features available for a tier
 * @param {String} userTier
 * @returns {Array} List of available feature names
 */
export function getAvailableFeatures(userTier) {
  const config = getTierConfig(userTier);
  return Object.entries(config)
    .filter(([key, value]) => value === true)
    .map(([key]) => key);
}

/**
 * Get list of locked features for a tier
 * @param {String} userTier
 * @returns {Array} List of locked feature info
 */
export function getLockedFeatures(userTier) {
  const config = getTierConfig(userTier);
  const locked = [];

  Object.entries(FEATURE_COMPARISON).forEach(([key, info]) => {
    if (config[key] !== true) {
      locked.push({
        key,
        ...info
      });
    }
  });

  return locked;
}

/**
 * Get upgrade message based on current tier
 * @param {String} userTier
 * @returns {Object} Upgrade info with message and benefits
 */
export function getUpgradeInfo(userTier) {
  const normalizedTier = normalizeTierName(userTier);

  if (normalizedTier === 'FREE') {
    return {
      showPrompt: true,
      targetTier: 'TIER2',
      message: 'Upgrade to TIER2 for enhanced pattern detection!',
      benefits: [
        '+30-45% higher win rate',
        '8 premium enhancements',
        'Multi-timeframe scanning',
        '15 patterns (vs 3)'
      ]
    };
  }

  if (normalizedTier === 'TIER1') {
    return {
      showPrompt: true,
      targetTier: 'TIER2',
      message: 'Upgrade to TIER2 for premium features!',
      benefits: [
        'Volume & Trend analysis',
        'RSI Divergence detection',
        'Dynamic R:R optimization',
        '15 patterns (vs 7)'
      ]
    };
  }

  if (normalizedTier === 'TIER2') {
    return {
      showPrompt: true,
      targetTier: 'TIER3',
      message: 'Upgrade to TIER3 for maximum features!',
      benefits: [
        'All 24 patterns',
        '5 timeframes (vs 3)',
        'Unlimited pattern display',
        'Priority support'
      ]
    };
  }

  return {
    showPrompt: false,
    targetTier: null,
    message: null,
    benefits: []
  };
}

/**
 * Get tier display info
 * @param {String} tier
 * @returns {Object} Display info with color, label, etc.
 */
export function getTierDisplayInfo(tier) {
  const normalized = normalizeTierName(tier);

  const displayInfo = {
    FREE: {
      label: 'FREE',
      color: '#6C757D',
      bgColor: 'rgba(108, 117, 125, 0.15)',
      icon: '🆓',
      patternCount: 3
    },
    TIER1: {
      label: 'BASIC',
      color: '#17A2B8',
      bgColor: 'rgba(23, 162, 184, 0.15)',
      icon: '🥉',
      patternCount: 7
    },
    TIER2: {
      label: 'PRO',
      color: '#FFC107',
      bgColor: 'rgba(255, 193, 7, 0.15)',
      icon: '🥈',
      patternCount: 15
    },
    TIER3: {
      label: 'ELITE',
      color: '#FF6B6B',
      bgColor: 'rgba(255, 107, 107, 0.15)',
      icon: '🥇',
      patternCount: 24
    },
    ADMIN: {
      label: 'ADMIN',
      color: '#9B59B6',
      bgColor: 'rgba(155, 89, 182, 0.15)',
      icon: '👑',
      patternCount: 24
    }
  };

  return displayInfo[normalized] || displayInfo.FREE;
}

/**
 * Calculate total win rate bonus from enabled features
 * @param {String} userTier
 * @returns {Object} Win rate bonus info
 */
export function calculateWinRateBonus(userTier) {
  const config = getTierConfig(userTier);
  let minBonus = 0;
  let maxBonus = 0;

  Object.entries(FEATURE_COMPARISON).forEach(([key, info]) => {
    if (config[key] === true) {
      // Parse impact string like "+5-8% win rate"
      const match = info.impact.match(/\+(\d+)-(\d+)%/);
      if (match) {
        minBonus += parseInt(match[1]);
        maxBonus += parseInt(match[2]);
      }
    }
  });

  return {
    min: minBonus,
    max: maxBonus,
    text: minBonus > 0 ? `+${minBonus}-${maxBonus}%` : '0%',
    description: minBonus > 0 ? 'Enhanced accuracy' : 'Base accuracy'
  };
}

export default {
  TIER_FEATURES,
  hasFeatureAccess,
  getTierConfig,
  normalizeTierName,
  isPremiumTier,
  FEATURE_COMPARISON,
  getAvailableFeatures,
  getLockedFeatures,
  getUpgradeInfo,
  getTierDisplayInfo,
  calculateWinRateBonus
};
