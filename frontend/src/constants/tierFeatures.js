/**
 * Tier-based Feature Access Control
 * Defines which features are available for each tier
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
    minPatternScore: 40, // Show more patterns (lower quality ok)
    scanLabel: 'Basic Scan'
  },

  TIER1: {
    volumeConfirmation: false,
    trendAnalysis: false,
    retestValidation: false,
    qualityFiltering: false,
    minPatternScore: 40,
    scanLabel: 'Basic Scan'
  },

  TIER2: {
    volumeConfirmation: true,  // ENABLED
    trendAnalysis: true,       // ENABLED
    retestValidation: true,    // ENABLED
    qualityFiltering: true,    // ENABLED
    minPatternScore: 50,       // Higher quality threshold
    scanLabel: 'Enhanced Scan'
  },

  TIER3: {
    volumeConfirmation: true,  // ENABLED
    trendAnalysis: true,       // ENABLED
    retestValidation: true,    // ENABLED
    qualityFiltering: true,    // ENABLED
    minPatternScore: 45,       // Show slightly more for analysis
    scanLabel: 'Elite Scan'
  },

  // Admin tier for testing
  admin: {
    volumeConfirmation: true,
    trendAnalysis: true,
    retestValidation: true,
    qualityFiltering: true,
    minPatternScore: 35,       // See all patterns for debugging
    scanLabel: 'Admin Scan'
  }
};

/**
 * Check if user has access to a specific feature
 * @param {String} userTier - User's tier (FREE, TIER1, TIER2, TIER3, admin)
 * @param {String} featureName - Feature to check
 * @returns {Boolean}
 */
export function hasFeatureAccess(userTier, featureName) {
  // Normalize tier name
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

  // Map common variations
  const tierMap = {
    'FREE': 'FREE',
    'TIER1': 'TIER1',
    'TIER2': 'TIER2',
    'TIER3': 'TIER3',
    'ADMIN': 'admin',
    // Lowercase variations
    'free': 'FREE',
    'tier1': 'TIER1',
    'tier2': 'TIER2',
    'tier3': 'TIER3',
  };

  return tierMap[tier] || tierMap[upperTier] || 'FREE';
}

/**
 * Check if user has premium tier (TIER2 or higher)
 * @param {String} userTier
 * @returns {Boolean}
 */
export function isPremiumTier(userTier) {
  const normalizedTier = normalizeTierName(userTier);
  return ['TIER2', 'TIER3', 'admin'].includes(normalizedTier);
}

/**
 * Get features comparison for upgrade prompts
 * Includes Phase 1 + Phase 2 features
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
    phase: 'PHASE_1'
  },
  trendAnalysis: {
    name: 'Trend Context Analysis',
    description: 'Adjust confidence based on market trend',
    impact: '+5-7% win rate',
    requiredTier: 'TIER2',
    phase: 'PHASE_1'
  },
  retestValidation: {
    name: 'Zone Retest Validation',
    description: 'Wait for proper retest - GEM Method core',
    impact: '+8-12% win rate',
    requiredTier: 'TIER2',
    phase: 'PHASE_1'
  },
  qualityFiltering: {
    name: 'Quality Scoring & Filtering',
    description: 'Show only high-quality setups',
    impact: '+5-8% win rate',
    requiredTier: 'TIER2',
    phase: 'PHASE_1'
  },

  // ====================================
  // PHASE 2 FEATURES
  // ====================================
  srConfluence: {
    name: 'Support/Resistance Confluence',
    description: 'Validate entries at key price levels',
    impact: '+4-6% win rate',
    requiredTier: 'TIER2',
    phase: 'PHASE_2'
  },
  candleConfirmation: {
    name: 'Candlestick Confirmation',
    description: 'Wait for candle confirmation signals',
    impact: '+3-5% win rate',
    requiredTier: 'TIER2',
    phase: 'PHASE_2'
  },

  // ====================================
  // PHASE 3 FEATURES
  // ====================================
  rsiDivergence: {
    name: 'RSI Divergence Detection',
    description: 'Detect bullish/bearish divergence patterns',
    impact: '+5-8% win rate',
    requiredTier: 'TIER2',
    phase: 'PHASE_3'
  },
  dynamicRR: {
    name: 'Dynamic R:R Optimization',
    description: 'Auto-optimize targets based on volatility & trend',
    impact: '+2-4% win rate',
    requiredTier: 'TIER2',
    phase: 'PHASE_3'
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
 * Get upgrade message based on current tier
 * @param {String} userTier
 * @returns {String} Upgrade message
 */
export function getUpgradeMessage(userTier) {
  const normalizedTier = normalizeTierName(userTier);

  if (normalizedTier === 'FREE') {
    return 'Upgrade to TIER2 for enhanced pattern detection with 30-45% higher win rate!';
  }
  if (normalizedTier === 'TIER1') {
    return 'Upgrade to TIER2 for Volume, Trend, and Quality analysis features!';
  }
  return null; // TIER2/3 don't need upgrade prompt
}

export default {
  TIER_FEATURES,
  hasFeatureAccess,
  getTierConfig,
  normalizeTierName,
  isPremiumTier,
  FEATURE_COMPARISON,
  getAvailableFeatures,
  getUpgradeMessage
};
