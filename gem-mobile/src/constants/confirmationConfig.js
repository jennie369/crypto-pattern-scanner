/**
 * GEM Mobile - Confirmation Patterns Configuration
 * Phase 3A: Candlestick confirmation patterns for zone entries
 */

import { COLORS } from '../utils/tokens';

/**
 * All confirmation pattern definitions
 */
export const CONFIRMATION_PATTERNS = {
  BULLISH_ENGULFING: {
    id: 'bullish_engulfing',
    name: 'Bullish Engulfing',
    nameVi: 'Nhấn Chìm Tăng',
    type: 'bullish',
    strength: 3,
    reliability: 75,
    description: 'Nến tăng nuốt trọn nến giảm trước đó',
    icon: 'TrendingUp',
    color: COLORS.success,
  },
  BEARISH_ENGULFING: {
    id: 'bearish_engulfing',
    name: 'Bearish Engulfing',
    nameVi: 'Nhấn Chìm Giảm',
    type: 'bearish',
    strength: 3,
    reliability: 75,
    description: 'Nến giảm nuốt trọn nến tăng trước đó',
    icon: 'TrendingDown',
    color: COLORS.error,
  },
  BULLISH_PIN_BAR: {
    id: 'bullish_pin_bar',
    name: 'Bullish Pin Bar',
    nameVi: 'Pin Bar Tăng',
    type: 'bullish',
    strength: 2,
    reliability: 70,
    description: 'Râu dưới dài, body nhỏ ở trên - Rejection từ dưới',
    icon: 'ArrowUp',
    color: COLORS.success,
  },
  BEARISH_PIN_BAR: {
    id: 'bearish_pin_bar',
    name: 'Bearish Pin Bar',
    nameVi: 'Pin Bar Giảm',
    type: 'bearish',
    strength: 2,
    reliability: 70,
    description: 'Râu trên dài, body nhỏ ở dưới - Rejection từ trên',
    icon: 'ArrowDown',
    color: COLORS.error,
  },
  BULLISH_HAMMER: {
    id: 'bullish_hammer',
    name: 'Hammer',
    nameVi: 'Búa',
    type: 'bullish',
    strength: 2,
    reliability: 65,
    description: 'Tương tự Pin Bar, xuất hiện sau downtrend',
    icon: 'Hammer',
    color: COLORS.success,
  },
  SHOOTING_STAR: {
    id: 'shooting_star',
    name: 'Shooting Star',
    nameVi: 'Sao Băng',
    type: 'bearish',
    strength: 2,
    reliability: 65,
    description: 'Ngược với Hammer, xuất hiện sau uptrend',
    icon: 'Star',
    color: COLORS.error,
  },
  INSIDE_BAR: {
    id: 'inside_bar',
    name: 'Inside Bar',
    nameVi: 'Nến Trong',
    type: 'neutral',
    strength: 1,
    reliability: 60,
    description: 'Nến nằm hoàn toàn trong range nến trước - Consolidation',
    icon: 'Minus',
    color: COLORS.gold,
  },
  MORNING_STAR: {
    id: 'morning_star',
    name: 'Morning Star',
    nameVi: 'Sao Mai',
    type: 'bullish',
    strength: 3,
    reliability: 80,
    description: '3 nến: Giảm mạnh → Doji/Nhỏ → Tăng mạnh',
    icon: 'Sunrise',
    color: COLORS.success,
  },
  EVENING_STAR: {
    id: 'evening_star',
    name: 'Evening Star',
    nameVi: 'Sao Hôm',
    type: 'bearish',
    strength: 3,
    reliability: 80,
    description: '3 nến: Tăng mạnh → Doji/Nhỏ → Giảm mạnh',
    icon: 'Sunset',
    color: COLORS.error,
  },
  DOJI: {
    id: 'doji',
    name: 'Doji',
    nameVi: 'Doji',
    type: 'neutral',
    strength: 1,
    reliability: 55,
    description: 'Open ≈ Close - Indecision, cần confirmation thêm',
    icon: 'Minus',
    color: COLORS.textSecondary,
  },
};

/**
 * Get pattern configuration by ID
 * @param {string} patternId - Pattern ID
 * @returns {Object|undefined} Pattern config
 */
export const getPatternConfig = (patternId) => {
  return Object.values(CONFIRMATION_PATTERNS).find(p => p.id === patternId);
};

/**
 * Get all patterns by type (bullish/bearish/neutral)
 * @param {string} type - Pattern type
 * @returns {Array} Matching patterns
 */
export const getPatternsByType = (type) => {
  return Object.values(CONFIRMATION_PATTERNS).filter(p => p.type === type);
};

/**
 * Confirmation strength thresholds
 */
export const CONFIRMATION_THRESHOLDS = {
  STRONG: { minScore: 5, label: 'Mạnh', labelEn: 'Strong', color: COLORS.success },
  MODERATE: { minScore: 3, label: 'Trung Bình', labelEn: 'Moderate', color: COLORS.gold },
  WEAK: { minScore: 1, label: 'Yếu', labelEn: 'Weak', color: COLORS.warning },
  NONE: { minScore: 0, label: 'Chưa Có', labelEn: 'None', color: COLORS.textSecondary },
};

/**
 * Get confirmation strength category based on score
 * @param {number} score - Confirmation score
 * @returns {Object} Strength configuration
 */
export const getConfirmationStrength = (score) => {
  if (score >= CONFIRMATION_THRESHOLDS.STRONG.minScore) return CONFIRMATION_THRESHOLDS.STRONG;
  if (score >= CONFIRMATION_THRESHOLDS.MODERATE.minScore) return CONFIRMATION_THRESHOLDS.MODERATE;
  if (score >= CONFIRMATION_THRESHOLDS.WEAK.minScore) return CONFIRMATION_THRESHOLDS.WEAK;
  return CONFIRMATION_THRESHOLDS.NONE;
};

/**
 * Entry trigger types
 */
export const ENTRY_TRIGGERS = {
  BREAK_HIGH: { id: 'break_high', label: 'Break High', labelVi: 'Phá đỉnh nến' },
  BREAK_LOW: { id: 'break_low', label: 'Break Low', labelVi: 'Phá đáy nến' },
  CLOSE_ABOVE: { id: 'close_above', label: 'Close Above', labelVi: 'Close trên' },
  CLOSE_BELOW: { id: 'close_below', label: 'Close Below', labelVi: 'Close dưới' },
  IMMEDIATE: { id: 'immediate', label: 'Immediate', labelVi: 'Ngay lập tức' },
};

/**
 * Detection configuration
 */
export const DETECTION_CONFIG = {
  engulfing: {
    minEngulfPercent: 100, // Current body must be >= 100% of previous
  },
  pinBar: {
    minWickRatio: 2,        // Wick must be 2x body
    maxBodyPercent: 35,     // Body < 35% of total range
    maxOppositeWickPercent: 25, // Opposite wick < 25%
  },
  doji: {
    maxBodyPercent: 10, // Body < 10% of range = Doji
  },
  morningStar: {
    minFirstBodyPercent: 50, // First candle body > 50%
    maxSecondBodyPercent: 40, // Middle candle body < 40%
  },
};

export default {
  CONFIRMATION_PATTERNS,
  getPatternConfig,
  getPatternsByType,
  CONFIRMATION_THRESHOLDS,
  getConfirmationStrength,
  ENTRY_TRIGGERS,
  DETECTION_CONFIG,
};
