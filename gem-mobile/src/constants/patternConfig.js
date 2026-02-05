/**
 * GEM Mobile - Pattern Configuration
 * CORRECT strength ranking: Reversal patterns > Continuation patterns
 *
 * GEM Method Rule (from reference documents):
 * - UPD (Reversal) = 5 stars = Win rate 65%, R:R 2.2
 * - DPU (Reversal) = 5 stars = Win rate 69%, R:R 2.6
 * - DPD (Continuation) = 3 stars = Win rate 68%, R:R 2.5
 * - UPU (Continuation) = 3 stars = Win rate 71%, R:R 2.8
 */

// ═══════════════════════════════════════════════════════════
// PATTERN CONFIGURATION
// ═══════════════════════════════════════════════════════════

export const PATTERN_CONFIG = {
  // ⭐⭐⭐⭐⭐ REVERSAL PATTERNS - STRONGEST
  UPD: {
    name: 'UPD',
    fullName: 'Up-Pause-Down',
    type: 'HFZ', // High Frequency Zone (Supply)
    context: 'reversal',
    strength: 5,
    stars: 5,
    starsDisplay: '⭐⭐⭐⭐⭐',
    winRate: 0.65,
    riskReward: 2.2,
    description: 'Tăng → Nghỉ → Giảm (Đảo chiều từ tăng sang giảm)',
    descriptionEn: 'Up → Pause → Down (Reversal from uptrend)',
    tradingBias: 'SELL',
    color: '#EF4444', // Red for bearish
    icon: 'TrendingDown',
  },

  DPU: {
    name: 'DPU',
    fullName: 'Down-Pause-Up',
    type: 'LFZ', // Low Frequency Zone (Demand)
    context: 'reversal',
    strength: 5,
    stars: 5,
    starsDisplay: '⭐⭐⭐⭐⭐',
    winRate: 0.69,
    riskReward: 2.6,
    description: 'Giảm → Nghỉ → Tăng (Đảo chiều từ giảm sang tăng)',
    descriptionEn: 'Down → Pause → Up (Reversal from downtrend)',
    tradingBias: 'BUY',
    color: '#22C55E', // Green for bullish
    icon: 'TrendingUp',
  },

  // ⭐⭐⭐ CONTINUATION PATTERNS - MEDIUM
  DPD: {
    name: 'DPD',
    fullName: 'Down-Pause-Down',
    type: 'HFZ',
    context: 'continuation',
    strength: 3,
    stars: 3,
    starsDisplay: '⭐⭐⭐',
    winRate: 0.68,
    riskReward: 2.5,
    description: 'Giảm → Nghỉ → Giảm tiếp (Tiếp tục xu hướng giảm)',
    descriptionEn: 'Down → Pause → Down (Continuation of downtrend)',
    tradingBias: 'SELL',
    color: '#F97316', // Orange
    icon: 'TrendingDown',
  },

  UPU: {
    name: 'UPU',
    fullName: 'Up-Pause-Up',
    type: 'LFZ',
    context: 'continuation',
    strength: 3,
    stars: 3,
    starsDisplay: '⭐⭐⭐',
    winRate: 0.71,
    riskReward: 2.8,
    description: 'Tăng → Nghỉ → Tăng tiếp (Tiếp tục xu hướng tăng)',
    descriptionEn: 'Up → Pause → Up (Continuation of uptrend)',
    tradingBias: 'BUY',
    color: '#84CC16', // Lime
    icon: 'TrendingUp',
  },

  // ⭐⭐⭐⭐ CLASSIC REVERSAL PATTERNS
  'Head & Shoulders': {
    name: 'H&S',
    fullName: 'Head & Shoulders',
    type: 'HFZ',
    context: 'reversal',
    strength: 4,
    stars: 4,
    starsDisplay: '⭐⭐⭐⭐',
    winRate: 0.72,
    riskReward: 3.0,
    description: 'Đầu vai - Đảo chiều giảm',
    descriptionEn: 'Classic bearish reversal pattern',
    tradingBias: 'SELL',
    color: '#EF4444',
    icon: 'TrendingDown',
  },

  'Inverse H&S': {
    name: 'IH&S',
    fullName: 'Inverse Head & Shoulders',
    type: 'LFZ',
    context: 'reversal',
    strength: 4,
    stars: 4,
    starsDisplay: '⭐⭐⭐⭐',
    winRate: 0.75,
    riskReward: 3.0,
    description: 'Đầu vai ngược - Đảo chiều tăng',
    descriptionEn: 'Classic bullish reversal pattern',
    tradingBias: 'BUY',
    color: '#22C55E',
    icon: 'TrendingUp',
  },

  'Double Top': {
    name: 'DT',
    fullName: 'Double Top',
    type: 'HFZ',
    context: 'reversal',
    strength: 4,
    stars: 4,
    starsDisplay: '⭐⭐⭐⭐',
    winRate: 0.68,
    riskReward: 2.5,
    description: 'Đỉnh đôi - Đảo chiều giảm',
    descriptionEn: 'Two peaks at similar level - bearish reversal',
    tradingBias: 'SELL',
    color: '#EF4444',
    icon: 'TrendingDown',
  },

  'Double Bottom': {
    name: 'DB',
    fullName: 'Double Bottom',
    type: 'LFZ',
    context: 'reversal',
    strength: 4,
    stars: 4,
    starsDisplay: '⭐⭐⭐⭐',
    winRate: 0.70,
    riskReward: 2.7,
    description: 'Đáy đôi - Đảo chiều tăng',
    descriptionEn: 'Two troughs at similar level - bullish reversal',
    tradingBias: 'BUY',
    color: '#22C55E',
    icon: 'TrendingUp',
  },
};

// ═══════════════════════════════════════════════════════════
// PATTERN STRENGTH ORDER (for sorting)
// ═══════════════════════════════════════════════════════════
export const PATTERN_STRENGTH_ORDER = [
  'UPD',      // 5 stars - Reversal
  'DPU',      // 5 stars - Reversal
  'Head & Shoulders',
  'Inverse H&S',
  'Double Top',
  'Double Bottom',
  'DPD',      // 3 stars - Continuation
  'UPU',      // 3 stars - Continuation
];

// ═══════════════════════════════════════════════════════════
// ZONE TYPE CONFIGURATION
// ═══════════════════════════════════════════════════════════
export const ZONE_TYPE_CONFIG = {
  HFZ: {
    name: 'HFZ',
    fullName: 'High Frequency Zone',
    alternativeName: 'Supply Zone',
    vietnameseName: 'Vùng Cung',
    description: 'Vùng cung - Giá có xu hướng giảm khi chạm',
    descriptionEn: 'Supply zone - Price tends to drop when touched',
    tradingBias: 'SELL',
    color: '#EF4444',
    colorMuted: 'rgba(239, 68, 68, 0.2)',
    icon: 'TrendingDown',
    entryRule: 'Entry = LOW of pause (near price)',
    stopRule: 'Stop = HIGH of pause (far price)',
  },
  LFZ: {
    name: 'LFZ',
    fullName: 'Low Frequency Zone',
    alternativeName: 'Demand Zone',
    vietnameseName: 'Vùng Cầu',
    description: 'Vùng cầu - Giá có xu hướng tăng khi chạm',
    descriptionEn: 'Demand zone - Price tends to rise when touched',
    tradingBias: 'BUY',
    color: '#22C55E',
    colorMuted: 'rgba(34, 197, 94, 0.2)',
    icon: 'TrendingUp',
    entryRule: 'Entry = HIGH of pause (near price)',
    stopRule: 'Stop = LOW of pause (far price)',
  },
};

// ═══════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════

/**
 * Get pattern configuration safely
 * @param {string} patternName - Pattern name (UPD, DPU, DPD, UPU, etc.)
 * @returns {Object} Pattern configuration
 */
export const getPatternConfig = (patternName) => {
  return PATTERN_CONFIG[patternName] || {
    name: patternName,
    fullName: patternName,
    type: 'unknown',
    context: 'unknown',
    strength: 1,
    stars: 1,
    starsDisplay: '⭐',
    winRate: 0.50,
    description: patternName,
    tradingBias: 'NEUTRAL',
    color: '#6B7280',
    icon: 'HelpCircle',
  };
};

/**
 * Get zone type configuration
 * @param {string} zoneType - 'HFZ' or 'LFZ'
 * @returns {Object} Zone type configuration
 */
export const getZoneTypeConfig = (zoneType) => {
  return ZONE_TYPE_CONFIG[zoneType] || ZONE_TYPE_CONFIG.HFZ;
};

/**
 * Compare pattern strength for sorting
 * Higher strength = should come first
 * @param {string} patternA - First pattern name
 * @param {string} patternB - Second pattern name
 * @returns {number} Comparison result (-1, 0, 1)
 */
export const comparePatternStrength = (patternA, patternB) => {
  const configA = getPatternConfig(patternA);
  const configB = getPatternConfig(patternB);

  // Primary: by strength (descending)
  const strengthDiff = configB.strength - configA.strength;
  if (strengthDiff !== 0) return strengthDiff;

  // Secondary: by win rate (descending)
  return configB.winRate - configA.winRate;
};

/**
 * Sort patterns by strength
 * @param {Array} patterns - Array of pattern objects with patternType field
 * @returns {Array} Sorted patterns
 */
export const sortPatternsByStrength = (patterns) => {
  return [...patterns].sort((a, b) => {
    const patternNameA = a.patternType || a.pattern || a.name;
    const patternNameB = b.patternType || b.pattern || b.name;
    return comparePatternStrength(patternNameA, patternNameB);
  });
};

/**
 * Check if pattern is reversal type
 * @param {string} patternName - Pattern name
 * @returns {boolean} True if reversal pattern
 */
export const isReversalPattern = (patternName) => {
  const config = getPatternConfig(patternName);
  return config.context === 'reversal';
};

/**
 * Check if pattern is continuation type
 * @param {string} patternName - Pattern name
 * @returns {boolean} True if continuation pattern
 */
export const isContinuationPattern = (patternName) => {
  const config = getPatternConfig(patternName);
  return config.context === 'continuation';
};

/**
 * Get all patterns of a specific strength
 * @param {number} strength - Strength level (1-5)
 * @returns {Array} Array of pattern names
 */
export const getPatternsByStrength = (strength) => {
  return Object.entries(PATTERN_CONFIG)
    .filter(([_, config]) => config.strength === strength)
    .map(([name]) => name);
};

/**
 * Get all reversal patterns
 * @returns {Array} Array of reversal pattern names
 */
export const getReversalPatterns = () => {
  return Object.entries(PATTERN_CONFIG)
    .filter(([_, config]) => config.context === 'reversal')
    .map(([name]) => name);
};

/**
 * Get all continuation patterns
 * @returns {Array} Array of continuation pattern names
 */
export const getContinuationPatterns = () => {
  return Object.entries(PATTERN_CONFIG)
    .filter(([_, config]) => config.context === 'continuation')
    .map(([name]) => name);
};

export default {
  PATTERN_CONFIG,
  PATTERN_STRENGTH_ORDER,
  ZONE_TYPE_CONFIG,
  getPatternConfig,
  getZoneTypeConfig,
  comparePatternStrength,
  sortPatternsByStrength,
  isReversalPattern,
  isContinuationPattern,
  getPatternsByStrength,
  getReversalPatterns,
  getContinuationPatterns,
};
