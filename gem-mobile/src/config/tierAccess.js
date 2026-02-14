/**
 * GEM Mobile - Tier Access Configuration
 * Issue #14 & #21: Tier-based feature access
 * SYNC FROM WEB VERSION
 */

/**
 * Tier Access Configuration
 * Defines permissions for each tier level
 */
export const TIER_ACCESS = {
  FREE: {
    name: 'Free',
    price: 0,
    coins: {
      max: 20,
      list: [
        'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT',
        'DOGEUSDT', 'ADAUSDT', 'AVAXUSDT', 'DOTUSDT', 'MATICUSDT',
        'LINKUSDT', 'UNIUSDT', 'ATOMUSDT', 'LTCUSDT', 'ETCUSDT',
        'XLMUSDT', 'FILUSDT', 'TRXUSDT', 'NEARUSDT', 'ALGOUSDT',
      ],
    },
    patterns: {
      allowed: ['DPD', 'UPU', 'DPU'],
      count: 3,
    },
    features: {
      scan: true,
      alerts: false,
      paperTrade: false,
      advancedStats: false,
      aiSignals: false,
      whaleTracking: false,
    },
    limits: {
      scansPerDay: 5,
      alertsPerCoin: 0,
    },
    // Zone Visualization Configuration - FREE tier per user's table
    zoneVisualization: {
      enabled: false,            // ❌ Zone Rectangles NOT available
      maxZonesDisplayed: 1,      // Max 1 zone
      zoneRectangles: false,     // ❌ No rectangles
      zoneLabels: false,         // ❌ No labels
      zoneLifecycle: false,      // ❌ No lifecycle
      historicalZones: false,    // ❌ No historical
      mtfTimeframes: 0,          // ❌ No MTF
      zoneAlerts: 0,             // ❌ No alerts
      customColors: false,       // ❌ No colors
      zoneExport: false,         // ❌ No export
    },
  },

  TIER1: {
    name: 'Tier 1 - Pro',
    price: 11000000, // 11M VND
    coins: {
      max: 50,
      list: 'TOP_50',
    },
    patterns: {
      allowed: ['DPD', 'UPU', 'HEAD_SHOULDERS'],
      count: 3,
    },
    features: {
      scan: true,
      alerts: true,
      paperTrade: true,
      advancedStats: false,
      aiSignals: false,
      whaleTracking: false,
    },
    limits: {
      scansPerDay: -1, // Unlimited (updated Jan 2026)
      alertsPerCoin: 3,
    },
    // Zone Visualization Configuration - TIER1 per user's table
    zoneVisualization: {
      enabled: true,              // ✅ Zone Rectangles
      maxZonesDisplayed: 3,       // Up to 3 zones
      zoneRectangles: true,       // Filled rectangles
      zoneLabels: true,           // Buy/Sell labels
      zoneLifecycle: false,       // No lifecycle tracking
      historicalZones: false,     // No historical zones
      mtfTimeframes: 0,           // No MTF analysis
      zoneAlerts: 3,              // 3 alerts per coin
      customColors: false,        // No color customization
      zoneExport: false,          // No zone export
    },
  },

  TIER2: {
    name: 'Tier 2 - Premium',
    price: 21000000, // 21M VND
    coins: {
      max: 200,
      list: 'TOP_200',
    },
    patterns: {
      allowed: ['DPD', 'UPU', 'UPD', 'DPU', 'HEAD_SHOULDERS', 'DOUBLE_TOP', 'DOUBLE_BOTTOM'],
      count: 7,
    },
    features: {
      scan: true,
      alerts: true,
      paperTrade: true,
      advancedStats: true,
      aiSignals: false,
      whaleTracking: false,
    },
    limits: {
      scansPerDay: -1, // Unlimited
      alertsPerCoin: 10,
    },
    // Zone Visualization Configuration
    zoneVisualization: {
      enabled: true,              // Zone visualization enabled
      maxZonesDisplayed: 10,      // Up to 10 zones
      zoneRectangles: true,       // Filled rectangles
      zoneLabels: true,           // Buy/Sell labels
      zoneLifecycle: true,        // Lifecycle tracking (Fresh/Tested/Broken)
      historicalZones: true,      // Show historical zones
      mtfTimeframes: 3,           // HTF, ITF, LTF analysis
      zoneAlerts: 10,             // 10 alerts per coin
      customColors: true,         // Color customization allowed
      zoneExport: false,          // No zone export
    },
  },

  TIER3: {
    name: 'Tier 3 - VIP',
    price: 68000000, // 68M VND
    coins: {
      max: -1, // Unlimited (all 437+)
      list: 'ALL',
    },
    patterns: {
      allowed: 'ALL',
      count: -1,
    },
    features: {
      scan: true,
      alerts: true,
      paperTrade: true,
      advancedStats: true,
      aiSignals: true,
      whaleTracking: true,
    },
    limits: {
      scansPerDay: -1,
      alertsPerCoin: -1,
    },
    // Zone Visualization Configuration
    zoneVisualization: {
      enabled: true,              // Zone visualization enabled
      maxZonesDisplayed: 20,      // Up to 20 zones
      zoneRectangles: true,       // Filled rectangles
      zoneLabels: true,           // Buy/Sell labels
      zoneLifecycle: true,        // Lifecycle tracking
      historicalZones: true,      // Show historical zones
      mtfTimeframes: 5,           // All timeframes
      zoneAlerts: -1,             // Unlimited alerts
      customColors: true,         // Color customization allowed
      zoneExport: true,           // Zone export enabled
    },
  },

  ADMIN: {
    name: 'Admin',
    price: 0,
    coins: { max: -1, list: 'ALL' },
    patterns: { allowed: 'ALL', count: -1 },
    features: {
      scan: true,
      alerts: true,
      paperTrade: true,
      advancedStats: true,
      aiSignals: true,
      whaleTracking: true,
    },
    limits: {
      scansPerDay: -1,
      alertsPerCoin: -1,
    },
    // Zone Visualization Configuration - Full Access
    zoneVisualization: {
      enabled: true,              // Zone visualization enabled
      maxZonesDisplayed: 50,      // Up to 50 zones
      zoneRectangles: true,       // Filled rectangles
      zoneLabels: true,           // Buy/Sell labels
      zoneLifecycle: true,        // Lifecycle tracking
      historicalZones: true,      // Show historical zones
      mtfTimeframes: 12,          // All 12 timeframes
      zoneAlerts: -1,             // Unlimited alerts
      customColors: true,         // Color customization allowed
      zoneExport: true,           // Zone export enabled
    },
  },
};

/**
 * All available patterns
 */
export const ALL_PATTERNS = [
  { key: 'DPD', name: 'Down-Peak-Down', direction: 'SHORT' },
  { key: 'UPU', name: 'Up-Peak-Up', direction: 'LONG' },
  { key: 'UPD', name: 'Up-Peak-Down', direction: 'LONG' },
  { key: 'DPU', name: 'Down-Peak-Up', direction: 'SHORT' },
  { key: 'HEAD_SHOULDERS', name: 'Head and Shoulders', direction: 'SHORT' },
  { key: 'INV_HEAD_SHOULDERS', name: 'Inverse H&S', direction: 'LONG' },
  { key: 'DOUBLE_TOP', name: 'Double Top', direction: 'SHORT' },
  { key: 'DOUBLE_BOTTOM', name: 'Double Bottom', direction: 'LONG' },
  { key: 'TRIPLE_TOP', name: 'Triple Top', direction: 'SHORT' },
  { key: 'TRIPLE_BOTTOM', name: 'Triple Bottom', direction: 'LONG' },
  { key: 'ASCENDING_TRIANGLE', name: 'Ascending Triangle', direction: 'LONG' },
  { key: 'DESCENDING_TRIANGLE', name: 'Descending Triangle', direction: 'SHORT' },
  { key: 'SYMMETRICAL_TRIANGLE', name: 'Symmetrical Triangle', direction: 'NEUTRAL' },
  { key: 'BULL_FLAG', name: 'Bull Flag', direction: 'LONG' },
  { key: 'BEAR_FLAG', name: 'Bear Flag', direction: 'SHORT' },
  { key: 'RISING_WEDGE', name: 'Rising Wedge', direction: 'SHORT' },
  { key: 'FALLING_WEDGE', name: 'Falling Wedge', direction: 'LONG' },
];

/**
 * Get max coins for a tier
 */
export const getMaxCoins = (tier) => {
  return TIER_ACCESS[tier]?.coins?.max || TIER_ACCESS.FREE.coins.max;
};

/**
 * Check if tier can select all coins
 */
export const canSelectAllCoins = (tier, totalCoins) => {
  const maxAllowed = getMaxCoins(tier);
  if (maxAllowed === -1) return true;
  return totalCoins <= maxAllowed;
};

/**
 * Get allowed patterns for a tier
 */
export const getAllowedPatterns = (tier) => {
  const config = TIER_ACCESS[tier]?.patterns || TIER_ACCESS.FREE.patterns;
  if (config.allowed === 'ALL') {
    return ALL_PATTERNS.map(p => p.key);
  }
  return config.allowed;
};

/**
 * Check if a pattern is allowed for a tier
 */
export const isPatternAllowed = (tier, patternKey) => {
  const allowed = getAllowedPatterns(tier);
  return allowed.includes(patternKey);
};

/**
 * Check if a feature is enabled for a tier
 */
export const hasFeature = (tier, featureName) => {
  return TIER_ACCESS[tier]?.features?.[featureName] === true;
};

/**
 * Get tier display name
 */
export const getTierName = (tier) => {
  return TIER_ACCESS[tier]?.name || 'Free';
};

/**
 * Get upgrade benefits when upgrading to next tier
 */
export const getUpgradeBenefits = (currentTier) => {
  const tiers = Object.keys(TIER_ACCESS);
  const currentIndex = tiers.indexOf(currentTier);
  const nextTier = tiers[currentIndex + 1];

  if (!nextTier || nextTier === 'ADMIN') {
    return null;
  }

  const current = TIER_ACCESS[currentTier];
  const next = TIER_ACCESS[nextTier];
  const benefits = [];

  // More coins
  if (next.coins.max > current.coins.max || next.coins.max === -1) {
    benefits.push({
      icon: 'Coins',
      text: next.coins.max === -1
        ? 'Tất cả coins (437+)'
        : `${next.coins.max} coins (hiện có ${current.coins.max})`,
    });
  }

  // More patterns
  if (next.patterns.count > current.patterns.count || next.patterns.count === -1) {
    benefits.push({
      icon: 'TrendingUp',
      text: next.patterns.count === -1
        ? 'Tất cả patterns'
        : `${next.patterns.count} patterns (hiện có ${current.patterns.count})`,
    });
  }

  // Features
  if (next.features.paperTrade && !current.features.paperTrade) {
    benefits.push({ icon: 'Wallet', text: 'Paper Trading' });
  }
  if (next.features.advancedStats && !current.features.advancedStats) {
    benefits.push({ icon: 'BarChart2', text: 'Advanced Statistics' });
  }
  if (next.features.aiSignals && !current.features.aiSignals) {
    benefits.push({ icon: 'Brain', text: 'AI Signals' });
  }
  if (next.features.whaleTracking && !current.features.whaleTracking) {
    benefits.push({ icon: 'Fish', text: 'Whale Tracking' });
  }

  return {
    nextTier,
    nextTierName: next.name,
    nextTierPrice: next.price,
    benefits,
  };
};

export default {
  TIER_ACCESS,
  ALL_PATTERNS,
  getMaxCoins,
  canSelectAllCoins,
  getAllowedPatterns,
  isPatternAllowed,
  hasFeature,
  getTierName,
  getUpgradeBenefits,
};
