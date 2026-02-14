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
 *
 * ZONE VISUALIZATION FEATURES:
 * - Zone Rectangles (filled zones on chart)
 * - Zone Labels (Buy/Sell badges)
 * - Zone Lifecycle (Fresh/Tested/Broken tracking)
 * - Historical Zones (show past zones)
 * - MTF Alignment (multi-timeframe zone confluence)
 * - Zone Alerts (price test notifications)
 * - Zone Customization (color customization)
 * - Zone Export (export zones to file)
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
    // Zone Visualization Features
    zoneRectangles: false,
    zoneLabels: false,
    zoneLifecycle: false,
    historicalZones: false,
    mtfAlignment: false,
    zoneAlerts: false,
    zoneCustomization: false,
    zoneExport: false,
    multipleZones: false,
    minPatternScore: 40, // Show more patterns (lower quality ok)
    maxPatterns: 3,      // Limit patterns shown
    maxZonesDisplayed: 1,
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
    // Zone Visualization Features
    zoneRectangles: true,     // ENABLED
    zoneLabels: true,         // ENABLED
    zoneLifecycle: false,
    historicalZones: false,
    mtfAlignment: false,
    zoneAlerts: true,         // ENABLED (limited)
    zoneCustomization: false,
    zoneExport: false,
    multipleZones: true,      // ENABLED (up to 3)
    minPatternScore: 40,
    maxPatterns: 7,
    maxZonesDisplayed: 3,
    scanLabel: 'Pro Scan'
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
    // Zone Visualization Features
    zoneRectangles: true,      // ENABLED
    zoneLabels: true,          // ENABLED
    zoneLifecycle: true,       // ENABLED
    historicalZones: true,     // ENABLED
    mtfAlignment: true,        // ENABLED (3 TFs)
    zoneAlerts: true,          // ENABLED (10 per coin)
    zoneCustomization: true,   // ENABLED
    zoneExport: false,
    multipleZones: true,       // ENABLED (up to 10)
    minPatternScore: 50,       // Higher quality threshold
    maxPatterns: 15,
    maxZonesDisplayed: 10,
    scanLabel: 'Premium Scan'
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
    // Zone Visualization Features
    zoneRectangles: true,      // ENABLED
    zoneLabels: true,          // ENABLED
    zoneLifecycle: true,       // ENABLED
    historicalZones: true,     // ENABLED
    mtfAlignment: true,        // ENABLED (5 TFs)
    zoneAlerts: true,          // ENABLED (unlimited)
    zoneCustomization: true,   // ENABLED
    zoneExport: true,          // ENABLED
    multipleZones: true,       // ENABLED (up to 20)
    minPatternScore: 45,       // Show slightly more for analysis
    maxPatterns: 50,
    maxZonesDisplayed: 20,
    scanLabel: 'VIP Scan'
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
    // Zone Visualization Features
    zoneRectangles: true,
    zoneLabels: true,
    zoneLifecycle: true,
    historicalZones: true,
    mtfAlignment: true,
    zoneAlerts: true,
    zoneCustomization: true,
    zoneExport: true,
    multipleZones: true,
    minPatternScore: 35,       // See all patterns for debugging
    maxPatterns: 100,
    maxZonesDisplayed: 50,
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
  },

  // ====================================
  // ZONE VISUALIZATION FEATURES
  // ====================================
  zoneRectangles: {
    name: 'Zone Rectangles',
    nameVi: 'Vùng Zone',
    description: 'Display filled zone rectangles on chart instead of simple lines',
    descriptionVi: 'Hiển thị vùng zone đầy màu thay vì đường đơn giản',
    impact: '+5-10% visual clarity',
    requiredTier: 'TIER1',
    phase: 'ZONE_VISUALIZATION',
    icon: '🟩'
  },
  zoneLabels: {
    name: 'Zone Labels',
    nameVi: 'Nhãn Zone',
    description: 'Show Buy/Sell labels with strength percentage on zones',
    descriptionVi: 'Hiển thị nhãn Buy/Sell với % độ mạnh trên zone',
    impact: '+3-5% decision clarity',
    requiredTier: 'TIER1',
    phase: 'ZONE_VISUALIZATION',
    icon: '🏷️'
  },
  zoneLifecycle: {
    name: 'Zone Lifecycle Tracking',
    nameVi: 'Vòng đời Zone',
    description: 'Track zone status: Fresh → Tested → Broken',
    descriptionVi: 'Theo dõi trạng thái zone: Fresh → Tested → Broken',
    impact: '+8-12% zone strength accuracy',
    requiredTier: 'TIER2',
    phase: 'ZONE_VISUALIZATION',
    icon: '🔄'
  },
  historicalZones: {
    name: 'Historical Zones',
    nameVi: 'Zone lịch sử',
    description: 'View past zones and their test history',
    descriptionVi: 'Xem zone quá khứ và lịch sử test',
    impact: '+5-8% pattern recognition',
    requiredTier: 'TIER2',
    phase: 'ZONE_VISUALIZATION',
    icon: '📜'
  },
  mtfAlignment: {
    name: 'MTF Zone Alignment',
    nameVi: 'Đồng thuận MTF',
    description: 'Multi-timeframe zone confluence analysis (HTF/ITF/LTF)',
    descriptionVi: 'Phân tích đồng thuận zone đa khung thời gian',
    impact: '+15-25% high probability setups',
    requiredTier: 'TIER2',
    phase: 'ZONE_VISUALIZATION',
    icon: '🎯'
  },
  zoneAlerts: {
    name: 'Zone Alerts',
    nameVi: 'Cảnh báo Zone',
    description: 'Get notified when price tests or breaks a zone',
    descriptionVi: 'Nhận thông báo khi giá test hoặc phá zone',
    impact: 'Real-time trading signals',
    requiredTier: 'TIER1',
    phase: 'ZONE_VISUALIZATION',
    icon: '🔔'
  },
  zoneCustomization: {
    name: 'Zone Customization',
    nameVi: 'Tùy chỉnh Zone',
    description: 'Customize zone colors and display preferences',
    descriptionVi: 'Tùy chỉnh màu sắc và cách hiển thị zone',
    impact: 'Personalized experience',
    requiredTier: 'TIER2',
    phase: 'ZONE_VISUALIZATION',
    icon: '🎨'
  },
  zoneExport: {
    name: 'Zone Export',
    nameVi: 'Xuất Zone',
    description: 'Export zones to CSV/JSON for external analysis',
    descriptionVi: 'Xuất zone ra CSV/JSON để phân tích bên ngoài',
    impact: 'Advanced data analysis',
    requiredTier: 'TIER3',
    phase: 'ZONE_VISUALIZATION',
    icon: '📤'
  },
  multipleZones: {
    name: 'Multiple Zones Display',
    nameVi: 'Hiển thị nhiều Zone',
    description: 'Display multiple zones per timeframe (up to tier limit)',
    descriptionVi: 'Hiển thị nhiều zone trên cùng khung (theo tier)',
    impact: '+10-15% opportunity detection',
    requiredTier: 'TIER1',
    phase: 'ZONE_VISUALIZATION',
    icon: '📊'
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
      label: 'PRO',
      color: '#17A2B8',
      bgColor: 'rgba(23, 162, 184, 0.15)',
      icon: '🥉',
      patternCount: 7
    },
    TIER2: {
      label: 'PREMIUM',
      color: '#FFC107',
      bgColor: 'rgba(255, 193, 7, 0.15)',
      icon: '🥈',
      patternCount: 15
    },
    TIER3: {
      label: 'VIP',
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
