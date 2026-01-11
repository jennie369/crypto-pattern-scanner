/**
 * GEM Mobile - Advanced Pattern Configuration
 * Configuration for Quasimodo (QM), FTR, FL, DP patterns
 *
 * Phase 1B: Quasimodo + FTR Detection
 */

// ═══════════════════════════════════════════════════════════
// ADVANCED PATTERN CONFIGURATION
// ═══════════════════════════════════════════════════════════

export const ADVANCED_PATTERN_CONFIG = {
  // ═════════════════════════════════════════════════════════
  // QUASIMODO PATTERNS (5 stars - strongest reversal)
  // ═════════════════════════════════════════════════════════

  QUASIMODO_BEARISH: {
    name: 'QM Bearish',
    fullName: 'Quasimodo Bearish',
    category: 'quasimodo',
    type: 'HFZ',
    context: 'reversal',
    strength: 5,
    stars: 5,
    starsDisplay: '⭐⭐⭐⭐⭐',
    winRate: 0.75,
    description: 'Pattern đảo chiều mạnh - Bắt đỉnh trend tăng',
    descriptionEn: 'Strong reversal pattern - Catch uptrend top',
    tradingBias: 'SELL',
    color: '#DC2626',
    icon: 'TrendingDown',
    requirements: {
      priorTrend: 'uptrend',
      bosDirection: 'down',
      minSwings: 4, // LS, Head, RS, BOS
    },
    entryRule: 'Entry tại QML (Higher Low trước Head)',
    stopRule: 'Stop trên MPL (Head) + buffer',
  },

  QUASIMODO_BULLISH: {
    name: 'QM Bullish',
    fullName: 'Quasimodo Bullish',
    category: 'quasimodo',
    type: 'LFZ',
    context: 'reversal',
    strength: 5,
    stars: 5,
    starsDisplay: '⭐⭐⭐⭐⭐',
    winRate: 0.73,
    description: 'Pattern đảo chiều mạnh - Bắt đáy trend giảm',
    descriptionEn: 'Strong reversal pattern - Catch downtrend bottom',
    tradingBias: 'BUY',
    color: '#16A34A',
    icon: 'TrendingUp',
    requirements: {
      priorTrend: 'downtrend',
      bosDirection: 'up',
      minSwings: 4,
    },
    entryRule: 'Entry tại QML (Lower High trước Head)',
    stopRule: 'Stop dưới MPL (Head) + buffer',
  },

  // ═════════════════════════════════════════════════════════
  // FTR (FAIL TO RETURN) PATTERNS (4 stars - strong continuation)
  // ═════════════════════════════════════════════════════════

  FTR_BULLISH: {
    name: 'FTR Bullish',
    fullName: 'Fail To Return - Bullish',
    category: 'ftr',
    type: 'LFZ',
    context: 'continuation',
    strength: 4,
    stars: 4,
    starsDisplay: '⭐⭐⭐⭐',
    winRate: 0.68,
    description: 'Zone sau khi phá Resistance - Continuation Up',
    descriptionEn: 'Zone after breaking Resistance - Continuation Up',
    tradingBias: 'BUY',
    color: '#22C55E',
    icon: 'ArrowUpRight',
    requirements: {
      breakDirection: 'up',
      mustNotReturn: true,
      newHighRequired: true,
    },
    entryRule: 'Entry tại HIGH của base zone (near price)',
    stopRule: 'Stop dưới LOW của base zone (far price)',
  },

  FTR_BEARISH: {
    name: 'FTR Bearish',
    fullName: 'Fail To Return - Bearish',
    category: 'ftr',
    type: 'HFZ',
    context: 'continuation',
    strength: 4,
    stars: 4,
    starsDisplay: '⭐⭐⭐⭐',
    winRate: 0.66,
    description: 'Zone sau khi phá Support - Continuation Down',
    descriptionEn: 'Zone after breaking Support - Continuation Down',
    tradingBias: 'SELL',
    color: '#EF4444',
    icon: 'ArrowDownRight',
    requirements: {
      breakDirection: 'down',
      mustNotReturn: true,
      newLowRequired: true,
    },
    entryRule: 'Entry tại LOW của base zone (near price)',
    stopRule: 'Stop trên HIGH của base zone (far price)',
  },

  // ═════════════════════════════════════════════════════════
  // FLAG LIMIT PATTERNS (for future Phase 1C)
  // ═════════════════════════════════════════════════════════

  FLAG_LIMIT_BULLISH: {
    name: 'FL Bullish',
    fullName: 'Flag Limit Bullish',
    category: 'flag_limit',
    type: 'LFZ',
    context: 'continuation',
    strength: 4,
    stars: 4,
    starsDisplay: '⭐⭐⭐⭐',
    winRate: 0.65,
    description: 'Pullback trong uptrend tạo vùng demand',
    tradingBias: 'BUY',
    color: '#10B981',
    icon: 'Flag',
  },

  FLAG_LIMIT_BEARISH: {
    name: 'FL Bearish',
    fullName: 'Flag Limit Bearish',
    category: 'flag_limit',
    type: 'HFZ',
    context: 'continuation',
    strength: 4,
    stars: 4,
    starsDisplay: '⭐⭐⭐⭐',
    winRate: 0.65,
    description: 'Pullback trong downtrend tạo vùng supply',
    tradingBias: 'SELL',
    color: '#F59E0B',
    icon: 'Flag',
  },

  // ═════════════════════════════════════════════════════════
  // DECISION POINT PATTERNS (for future Phase 1C)
  // ═════════════════════════════════════════════════════════

  DECISION_POINT_BULLISH: {
    name: 'DP Bullish',
    fullName: 'Decision Point Bullish',
    category: 'decision_point',
    type: 'LFZ',
    context: 'reversal',
    strength: 4,
    stars: 4,
    starsDisplay: '⭐⭐⭐⭐',
    winRate: 0.64,
    description: 'Nến quyết định phá vỡ vùng tích lũy lên',
    tradingBias: 'BUY',
    color: '#8B5CF6',
    icon: 'Zap',
  },

  DECISION_POINT_BEARISH: {
    name: 'DP Bearish',
    fullName: 'Decision Point Bearish',
    category: 'decision_point',
    type: 'HFZ',
    context: 'reversal',
    strength: 4,
    stars: 4,
    starsDisplay: '⭐⭐⭐⭐',
    winRate: 0.64,
    description: 'Nến quyết định phá vỡ vùng tích lũy xuống',
    tradingBias: 'SELL',
    color: '#EC4899',
    icon: 'Zap',
  },
};

// ═══════════════════════════════════════════════════════════
// PATTERN CATEGORY CONFIGURATION
// ═══════════════════════════════════════════════════════════

export const PATTERN_CATEGORY_CONFIG = {
  basic: {
    name: 'Basic',
    fullName: 'Basic Patterns',
    description: 'UPD, DPU, DPD, UPU và các pattern cơ bản',
    color: '#6B7280',
    priority: 3,
  },
  quasimodo: {
    name: 'QM',
    fullName: 'Quasimodo',
    description: 'Pattern đảo chiều mạnh nhất với BOS confirmation',
    color: '#DC2626',
    priority: 1,
  },
  ftr: {
    name: 'FTR',
    fullName: 'Fail To Return',
    description: 'Zone continuation sau khi phá S/R',
    color: '#22C55E',
    priority: 2,
  },
  flag_limit: {
    name: 'FL',
    fullName: 'Flag Limit',
    description: 'Pullback zone trong trend mạnh',
    color: '#F59E0B',
    priority: 2,
  },
  decision_point: {
    name: 'DP',
    fullName: 'Decision Point',
    description: 'Nến quyết định phá vỡ vùng tích lũy',
    color: '#8B5CF6',
    priority: 2,
  },
};

// ═══════════════════════════════════════════════════════════
// PATTERN HIERARCHY (for display priority)
// ═══════════════════════════════════════════════════════════

export const PATTERN_HIERARCHY = {
  QUASIMODO_BEARISH: 1,
  QUASIMODO_BULLISH: 1,
  FTR_BEARISH: 2,
  FTR_BULLISH: 2,
  FLAG_LIMIT_BEARISH: 3,
  FLAG_LIMIT_BULLISH: 3,
  DECISION_POINT_BEARISH: 3,
  DECISION_POINT_BULLISH: 3,
  UPD: 4,
  DPU: 4,
  'Head & Shoulders': 5,
  'Inverse H&S': 5,
  'Double Top': 5,
  'Double Bottom': 5,
  DPD: 6,
  UPU: 6,
};

// ═══════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════

/**
 * Get advanced pattern configuration
 * @param {string} patternName - Pattern name
 * @returns {Object|null} Pattern configuration or null
 */
export const getAdvancedPatternConfig = (patternName) => {
  return ADVANCED_PATTERN_CONFIG[patternName] || null;
};

/**
 * Check if pattern is advanced type
 * @param {string} patternName - Pattern name
 * @returns {boolean} True if advanced pattern
 */
export const isAdvancedPattern = (patternName) => {
  return Object.keys(ADVANCED_PATTERN_CONFIG).includes(patternName);
};

/**
 * Check if pattern is Quasimodo type
 * @param {string} patternName - Pattern name
 * @returns {boolean} True if QM pattern
 */
export const isQuasimodoPattern = (patternName) => {
  const config = ADVANCED_PATTERN_CONFIG[patternName];
  return config?.category === 'quasimodo';
};

/**
 * Check if pattern is FTR type
 * @param {string} patternName - Pattern name
 * @returns {boolean} True if FTR pattern
 */
export const isFTRPattern = (patternName) => {
  const config = ADVANCED_PATTERN_CONFIG[patternName];
  return config?.category === 'ftr';
};

/**
 * Get pattern category configuration
 * @param {string} category - Category name
 * @returns {Object} Category configuration
 */
export const getCategoryConfig = (category) => {
  return PATTERN_CATEGORY_CONFIG[category] || PATTERN_CATEGORY_CONFIG.basic;
};

/**
 * Get pattern hierarchy priority
 * @param {string} patternName - Pattern name
 * @returns {number} Priority (lower = higher priority)
 */
export const getPatternPriority = (patternName) => {
  return PATTERN_HIERARCHY[patternName] || 99;
};

/**
 * Sort patterns by hierarchy
 * @param {Array} patterns - Array of pattern objects
 * @returns {Array} Sorted patterns
 */
export const sortPatternsByHierarchy = (patterns) => {
  return [...patterns].sort((a, b) => {
    const priorityA = getPatternPriority(a.pattern || a.patternType);
    const priorityB = getPatternPriority(b.pattern || b.patternType);
    return priorityA - priorityB;
  });
};

/**
 * Get all patterns by category
 * @param {string} category - Category name
 * @returns {Array} Array of pattern configs
 */
export const getPatternsByCategory = (category) => {
  return Object.entries(ADVANCED_PATTERN_CONFIG)
    .filter(([_, config]) => config.category === category)
    .map(([name, config]) => ({ name, ...config }));
};

// ═══════════════════════════════════════════════════════════
// DEFAULT EXPORT
// ═══════════════════════════════════════════════════════════

export default {
  ADVANCED_PATTERN_CONFIG,
  PATTERN_CATEGORY_CONFIG,
  PATTERN_HIERARCHY,
  getAdvancedPatternConfig,
  isAdvancedPattern,
  isQuasimodoPattern,
  isFTRPattern,
  getCategoryConfig,
  getPatternPriority,
  sortPatternsByHierarchy,
  getPatternsByCategory,
};
