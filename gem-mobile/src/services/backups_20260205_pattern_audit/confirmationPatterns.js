/**
 * GEM Mobile - Confirmation Patterns Service
 * Phase 3A: Main service for all candlestick confirmation patterns
 *
 * Includes: Engulfing, Pin Bar, Hammer, Shooting Star, Inside Bar,
 * Doji, Morning Star, Evening Star detection
 */

import { detectEngulfing } from './engulfingDetector';
import { detectPinBar, detectHammer, detectShootingStar } from './pinBarDetector';
import {
  CONFIRMATION_PATTERNS,
  getConfirmationStrength,
  DETECTION_CONFIG,
} from '../constants/confirmationConfig';

/**
 * Detect Inside Bar pattern
 * Inside Bar = Current candle completely within previous candle range
 * @param {Object} current - Current candle
 * @param {Object} previous - Previous candle
 * @returns {Object|null} Pattern result or null
 */
export const detectInsideBar = (current, previous) => {
  if (!current || !previous) return null;

  // Current must be completely inside previous
  const isInside =
    current.high <= previous.high &&
    current.low >= previous.low;

  if (!isInside) return null;

  // Calculate compression ratio
  const previousRange = previous.high - previous.low;
  const currentRange = current.high - current.low;
  const compressionRatio = previousRange > 0 ? (currentRange / previousRange) * 100 : 100;

  return {
    pattern: CONFIRMATION_PATTERNS.INSIDE_BAR,
    patternId: 'inside_bar',
    type: 'neutral',

    confirmationCandle: {
      open: current.open,
      high: current.high,
      low: current.low,
      close: current.close,
      timestamp: current.timestamp,
    },
    motherBar: {
      open: previous.open,
      high: previous.high,
      low: previous.low,
      close: previous.close,
    },

    compressionRatio: compressionRatio.toFixed(1),
    breakoutLong: previous.high,
    breakoutShort: previous.low,

    strength: 'moderate',
    score: 1,

    note: 'Consolidation - Đợi breakout để xác định hướng',
    isValid: true,
    detectedAt: new Date().toISOString(),
  };
};

/**
 * Detect Doji pattern
 * Doji = Open ≈ Close (tiny body relative to range)
 * @param {Object} candle - Candle to check
 * @param {Object} options - Detection options
 * @returns {Object|null} Pattern result or null
 */
export const detectDoji = (candle, options = {}) => {
  const { maxBodyPercent = DETECTION_CONFIG.doji.maxBodyPercent } = options;

  if (!candle) return null;

  const range = candle.high - candle.low;
  if (range === 0) return null;

  const body = Math.abs(candle.close - candle.open);
  const bodyPercent = (body / range) * 100;

  if (bodyPercent > maxBodyPercent) return null;

  // Determine Doji type based on wick positions
  const upperWick = candle.high - Math.max(candle.open, candle.close);
  const lowerWick = Math.min(candle.open, candle.close) - candle.low;

  let dojiType = 'standard';
  if (upperWick > lowerWick * 2) {
    dojiType = 'gravestone'; // Long upper wick = bearish signal
  } else if (lowerWick > upperWick * 2) {
    dojiType = 'dragonfly'; // Long lower wick = bullish signal
  } else if (upperWick > range * 0.3 && lowerWick > range * 0.3) {
    dojiType = 'long_legged'; // Both wicks long = high indecision
  }

  return {
    pattern: CONFIRMATION_PATTERNS.DOJI,
    patternId: 'doji',
    type: 'neutral',
    dojiType,
    dojiTypeVi: {
      standard: 'Doji chuẩn',
      gravestone: 'Doji Bia Mộ',
      dragonfly: 'Doji Chuồn Chuồn',
      long_legged: 'Doji Chân Dài',
    }[dojiType],

    confirmationCandle: {
      open: candle.open,
      high: candle.high,
      low: candle.low,
      close: candle.close,
      timestamp: candle.timestamp,
    },

    bodyPercent: bodyPercent.toFixed(1),
    upperWickPercent: ((upperWick / range) * 100).toFixed(1),
    lowerWickPercent: ((lowerWick / range) * 100).toFixed(1),

    strength: 'weak',
    score: 1,

    note: 'Doji = Indecision. Cần thêm confirmation từ nến tiếp theo.',
    isValid: true,
    detectedAt: new Date().toISOString(),
  };
};

/**
 * Detect Morning Star pattern (3-candle bullish reversal)
 * 1. Strong bearish candle
 * 2. Small body (indecision/Doji)
 * 3. Strong bullish candle closing above first candle midpoint
 * @param {Array} candles - Array of candles
 * @param {number} index - Index of third candle
 * @returns {Object|null} Pattern result or null
 */
export const detectMorningStar = (candles, index) => {
  if (!candles || index < 2) return null;

  const first = candles[index - 2];
  const second = candles[index - 1];
  const third = candles[index];

  if (!first || !second || !third) return null;

  // First candle: Strong bearish
  const firstIsBearish = first.close < first.open;
  const firstBodySize = Math.abs(first.open - first.close);
  const firstRange = first.high - first.low;
  const firstBodyPercent = firstRange > 0 ? (firstBodySize / firstRange) * 100 : 0;

  if (!firstIsBearish || firstBodyPercent < DETECTION_CONFIG.morningStar.minFirstBodyPercent) {
    return null;
  }

  // Second candle: Small body (indecision)
  const secondBodySize = Math.abs(second.open - second.close);
  const secondRange = second.high - second.low;
  const secondBodyPercent = secondRange > 0 ? (secondBodySize / secondRange) * 100 : 0;

  if (secondBodyPercent > DETECTION_CONFIG.morningStar.maxSecondBodyPercent) {
    return null;
  }

  // Third candle: Strong bullish, closes above first candle's midpoint
  const thirdIsBullish = third.close > third.open;
  const firstMidpoint = (first.open + first.close) / 2;

  if (!thirdIsBullish || third.close < firstMidpoint) {
    return null;
  }

  return {
    pattern: CONFIRMATION_PATTERNS.MORNING_STAR,
    patternId: 'morning_star',
    type: 'bullish',

    candles: {
      first: { open: first.open, close: first.close, type: 'bearish' },
      second: { open: second.open, close: second.close, type: 'indecision' },
      third: { open: third.open, close: third.close, type: 'bullish' },
    },

    confirmationCandle: {
      open: third.open,
      high: third.high,
      low: third.low,
      close: third.close,
      timestamp: third.timestamp,
    },

    strength: 'strong',
    score: 4,

    entryPrice: third.close,
    stopLoss: Math.min(first.low, second.low, third.low),

    note: '3-candle bullish reversal pattern',
    isValid: true,
    detectedAt: new Date().toISOString(),
  };
};

/**
 * Detect Evening Star pattern (3-candle bearish reversal)
 * 1. Strong bullish candle
 * 2. Small body (indecision/Doji)
 * 3. Strong bearish candle closing below first candle midpoint
 * @param {Array} candles - Array of candles
 * @param {number} index - Index of third candle
 * @returns {Object|null} Pattern result or null
 */
export const detectEveningStar = (candles, index) => {
  if (!candles || index < 2) return null;

  const first = candles[index - 2];
  const second = candles[index - 1];
  const third = candles[index];

  if (!first || !second || !third) return null;

  // First candle: Strong bullish
  const firstIsBullish = first.close > first.open;
  const firstBodySize = Math.abs(first.open - first.close);
  const firstRange = first.high - first.low;
  const firstBodyPercent = firstRange > 0 ? (firstBodySize / firstRange) * 100 : 0;

  if (!firstIsBullish || firstBodyPercent < DETECTION_CONFIG.morningStar.minFirstBodyPercent) {
    return null;
  }

  // Second candle: Small body
  const secondBodySize = Math.abs(second.open - second.close);
  const secondRange = second.high - second.low;
  const secondBodyPercent = secondRange > 0 ? (secondBodySize / secondRange) * 100 : 0;

  if (secondBodyPercent > DETECTION_CONFIG.morningStar.maxSecondBodyPercent) {
    return null;
  }

  // Third candle: Strong bearish, closes below first candle's midpoint
  const thirdIsBearish = third.close < third.open;
  const firstMidpoint = (first.open + first.close) / 2;

  if (!thirdIsBearish || third.close > firstMidpoint) {
    return null;
  }

  return {
    pattern: CONFIRMATION_PATTERNS.EVENING_STAR,
    patternId: 'evening_star',
    type: 'bearish',

    candles: {
      first: { open: first.open, close: first.close, type: 'bullish' },
      second: { open: second.open, close: second.close, type: 'indecision' },
      third: { open: third.open, close: third.close, type: 'bearish' },
    },

    confirmationCandle: {
      open: third.open,
      high: third.high,
      low: third.low,
      close: third.close,
      timestamp: third.timestamp,
    },

    strength: 'strong',
    score: 4,

    entryPrice: third.close,
    stopLoss: Math.max(first.high, second.high, third.high),

    note: '3-candle bearish reversal pattern',
    isValid: true,
    detectedAt: new Date().toISOString(),
  };
};

/**
 * Scan for all confirmation patterns at a zone
 * @param {Array} candles - Recent candles at zone (at least 3)
 * @param {Object} zone - The zone to check {zoneType: 'LFZ'|'HFZ'}
 * @returns {Array} Array of detected patterns sorted by score
 */
export const scanConfirmationPatterns = (candles, zone) => {
  if (!candles || candles.length < 3) return [];

  const patterns = [];
  const expectedType = zone?.zoneType === 'LFZ' ? 'bullish' : 'bearish';

  // Get last candles
  const current = candles[candles.length - 1];
  const previous = candles[candles.length - 2];
  const lastIndex = candles.length - 1;

  // Check Engulfing
  const engulfing = detectEngulfing(current, previous);
  if (engulfing && (engulfing.type === expectedType || engulfing.type === 'neutral')) {
    patterns.push(engulfing);
  }

  // Check Pin Bar
  const pinBar = detectPinBar(current);
  if (pinBar && (pinBar.type === expectedType || pinBar.type === 'neutral')) {
    patterns.push(pinBar);
  }

  // Check Hammer/Shooting Star (context-aware pin bars)
  if (expectedType === 'bullish') {
    const hammer = detectHammer(candles, lastIndex);
    if (hammer) patterns.push(hammer);
  } else {
    const shootingStar = detectShootingStar(candles, lastIndex);
    if (shootingStar) patterns.push(shootingStar);
  }

  // Check Inside Bar (neutral - works for both)
  const insideBar = detectInsideBar(current, previous);
  if (insideBar) {
    patterns.push(insideBar);
  }

  // Check Doji (neutral - works for both)
  const doji = detectDoji(current);
  if (doji) {
    patterns.push(doji);
  }

  // Check Morning/Evening Star (3-candle patterns)
  if (expectedType === 'bullish') {
    const morningStar = detectMorningStar(candles, lastIndex);
    if (morningStar) patterns.push(morningStar);
  } else {
    const eveningStar = detectEveningStar(candles, lastIndex);
    if (eveningStar) patterns.push(eveningStar);
  }

  // Sort by score (highest first)
  return patterns.sort((a, b) => (b.score || 0) - (a.score || 0));
};

/**
 * Get the best (highest score) confirmation pattern
 * @param {Array} candles - Recent candles
 * @param {Object} zone - Zone to check
 * @returns {Object|null} Best pattern or null
 */
export const getBestConfirmation = (candles, zone) => {
  const patterns = scanConfirmationPatterns(candles, zone);
  return patterns[0] || null;
};

/**
 * Calculate total confirmation score from multiple patterns
 * @param {Array} patterns - Array of detected patterns
 * @returns {number} Total score
 */
export const calculateConfirmationScore = (patterns) => {
  if (!patterns || patterns.length === 0) return 0;
  return patterns.reduce((sum, p) => sum + (p.score || 0), 0);
};

/**
 * Check if confirmation aligns with trade direction
 * @param {Object} confirmation - Detected confirmation pattern
 * @param {string} direction - Trade direction ('LONG'|'SHORT')
 * @returns {boolean} True if aligned
 */
export const isConfirmationAligned = (confirmation, direction) => {
  if (!confirmation) return false;

  if (direction === 'LONG') {
    return confirmation.type === 'bullish' || confirmation.type === 'neutral';
  }
  if (direction === 'SHORT') {
    return confirmation.type === 'bearish' || confirmation.type === 'neutral';
  }
  return false;
};

/**
 * Get confirmation summary for display
 * @param {Object} confirmation - Detected confirmation pattern
 * @returns {Object} Summary object
 */
export const getConfirmationSummary = (confirmation) => {
  if (!confirmation) {
    return {
      hasConfirmation: false,
      label: 'Chờ Confirmation',
      labelEn: 'Awaiting Confirmation',
      strength: getConfirmationStrength(0),
      score: 0,
    };
  }

  return {
    hasConfirmation: true,
    patternId: confirmation.patternId,
    patternName: confirmation.pattern?.nameVi || confirmation.patternId,
    patternNameEn: confirmation.pattern?.name || confirmation.patternId,
    type: confirmation.type,
    label: confirmation.pattern?.nameVi || 'Confirmation',
    strength: getConfirmationStrength(confirmation.score),
    score: confirmation.score,
    entryPrice: confirmation.entryPrice,
    stopLoss: confirmation.stopLoss,
  };
};

export default {
  detectInsideBar,
  detectDoji,
  detectMorningStar,
  detectEveningStar,
  scanConfirmationPatterns,
  getBestConfirmation,
  calculateConfirmationScore,
  isConfirmationAligned,
  getConfirmationSummary,
};
