/**
 * GEM Mobile - Pin Bar Pattern Detector
 * Phase 3A: Detect Pin Bar (Rejection) candlestick patterns
 *
 * Pin Bar Requirements:
 * - Long wick on one side (rejection)
 * - Small body
 * - Body positioned at opposite end of wick
 *
 * Bullish Pin Bar: Long lower wick, body at top
 * Bearish Pin Bar: Long upper wick, body at bottom
 */

import { CONFIRMATION_PATTERNS, DETECTION_CONFIG } from '../constants/confirmationConfig';

/**
 * Detect Bullish Pin Bar
 * @param {Object} candle - Candle to check {open, high, low, close, timestamp}
 * @param {Object} options - Detection options
 * @returns {Object|null} Pattern result or null
 */
export const detectBullishPinBar = (candle, options = {}) => {
  const {
    minWickRatio = DETECTION_CONFIG.pinBar.minWickRatio,
    maxBodyPercent = DETECTION_CONFIG.pinBar.maxBodyPercent,
    maxUpperWickPercent = DETECTION_CONFIG.pinBar.maxOppositeWickPercent,
  } = options;

  if (!candle) return null;

  const range = candle.high - candle.low;
  if (range === 0) return null;

  const body = Math.abs(candle.close - candle.open);
  const bodyHigh = Math.max(candle.open, candle.close);
  const bodyLow = Math.min(candle.open, candle.close);

  const upperWick = candle.high - bodyHigh;
  const lowerWick = bodyLow - candle.low;

  // Calculate percentages
  const bodyPercent = (body / range) * 100;
  const upperWickPercent = (upperWick / range) * 100;
  const lowerWickPercent = (lowerWick / range) * 100;

  // Check Pin Bar criteria
  const hasSmallBody = bodyPercent <= maxBodyPercent;
  const hasLongLowerWick = lowerWick >= body * minWickRatio;
  const hasSmallUpperWick = upperWickPercent <= maxUpperWickPercent;

  if (!hasSmallBody || !hasLongLowerWick || !hasSmallUpperWick) {
    return null;
  }

  // Calculate quality based on wick/body ratio
  const wickBodyRatio = body > 0 ? lowerWick / body : lowerWick;
  const quality = wickBodyRatio >= 3 ? 'excellent' : wickBodyRatio >= 2.5 ? 'good' : 'moderate';
  const strength = quality === 'excellent' ? 'strong' : quality === 'good' ? 'moderate' : 'weak';
  const score = quality === 'excellent' ? 3 : quality === 'good' ? 2 : 1;

  return {
    pattern: CONFIRMATION_PATTERNS.BULLISH_PIN_BAR,
    patternId: 'bullish_pin_bar',
    type: 'bullish',

    confirmationCandle: {
      open: candle.open,
      high: candle.high,
      low: candle.low,
      close: candle.close,
      timestamp: candle.timestamp,
    },

    // Metrics
    bodyPercent: bodyPercent.toFixed(1),
    lowerWickPercent: lowerWickPercent.toFixed(1),
    upperWickPercent: upperWickPercent.toFixed(1),
    wickBodyRatio: wickBodyRatio.toFixed(1),

    // Quality
    quality,
    strength,
    score,

    // Trading
    entryPrice: candle.high, // Entry above pin bar
    stopLoss: candle.low,    // Stop below wick

    // Analysis
    rejectionLevel: candle.low,
    rejectionStrength: lowerWickPercent,

    isValid: true,
    detectedAt: new Date().toISOString(),
  };
};

/**
 * Detect Bearish Pin Bar
 * @param {Object} candle - Candle to check
 * @param {Object} options - Detection options
 * @returns {Object|null} Pattern result or null
 */
export const detectBearishPinBar = (candle, options = {}) => {
  const {
    minWickRatio = DETECTION_CONFIG.pinBar.minWickRatio,
    maxBodyPercent = DETECTION_CONFIG.pinBar.maxBodyPercent,
    maxLowerWickPercent = DETECTION_CONFIG.pinBar.maxOppositeWickPercent,
  } = options;

  if (!candle) return null;

  const range = candle.high - candle.low;
  if (range === 0) return null;

  const body = Math.abs(candle.close - candle.open);
  const bodyHigh = Math.max(candle.open, candle.close);
  const bodyLow = Math.min(candle.open, candle.close);

  const upperWick = candle.high - bodyHigh;
  const lowerWick = bodyLow - candle.low;

  const bodyPercent = (body / range) * 100;
  const upperWickPercent = (upperWick / range) * 100;
  const lowerWickPercent = (lowerWick / range) * 100;

  const hasSmallBody = bodyPercent <= maxBodyPercent;
  const hasLongUpperWick = upperWick >= body * minWickRatio;
  const hasSmallLowerWick = lowerWickPercent <= maxLowerWickPercent;

  if (!hasSmallBody || !hasLongUpperWick || !hasSmallLowerWick) {
    return null;
  }

  const wickBodyRatio = body > 0 ? upperWick / body : upperWick;
  const quality = wickBodyRatio >= 3 ? 'excellent' : wickBodyRatio >= 2.5 ? 'good' : 'moderate';
  const strength = quality === 'excellent' ? 'strong' : quality === 'good' ? 'moderate' : 'weak';
  const score = quality === 'excellent' ? 3 : quality === 'good' ? 2 : 1;

  return {
    pattern: CONFIRMATION_PATTERNS.BEARISH_PIN_BAR,
    patternId: 'bearish_pin_bar',
    type: 'bearish',

    confirmationCandle: {
      open: candle.open,
      high: candle.high,
      low: candle.low,
      close: candle.close,
      timestamp: candle.timestamp,
    },

    bodyPercent: bodyPercent.toFixed(1),
    upperWickPercent: upperWickPercent.toFixed(1),
    lowerWickPercent: lowerWickPercent.toFixed(1),
    wickBodyRatio: wickBodyRatio.toFixed(1),

    quality,
    strength,
    score,

    entryPrice: candle.low,
    stopLoss: candle.high,

    rejectionLevel: candle.high,
    rejectionStrength: upperWickPercent,

    isValid: true,
    detectedAt: new Date().toISOString(),
  };
};

/**
 * Detect any Pin Bar (bullish or bearish)
 * @param {Object} candle - Candle to check
 * @param {Object} options - Detection options
 * @returns {Object|null} Pattern result or null
 */
export const detectPinBar = (candle, options = {}) => {
  const bullish = detectBullishPinBar(candle, options);
  if (bullish) return bullish;

  const bearish = detectBearishPinBar(candle, options);
  if (bearish) return bearish;

  return null;
};

/**
 * Detect Hammer (Bullish Pin Bar after downtrend)
 * @param {Array} candles - Array of candles
 * @param {number} index - Index of candle to check
 * @param {Object} options - Detection options
 * @returns {Object|null} Pattern result or null
 */
export const detectHammer = (candles, index, options = {}) => {
  if (!candles || index < 3) return null;

  // Check for prior downtrend (3 consecutive lower closes)
  const priorCandles = candles.slice(index - 3, index);
  const isDowntrend = priorCandles.every((c, i) =>
    i === 0 || c.close < priorCandles[i - 1].close
  );

  if (!isDowntrend) return null;

  const pinBar = detectBullishPinBar(candles[index], options);
  if (!pinBar) return null;

  return {
    ...pinBar,
    pattern: CONFIRMATION_PATTERNS.BULLISH_HAMMER,
    patternId: 'bullish_hammer',
    hasDowntrend: true,
    trendContext: 'downtrend',
    score: pinBar.score + 1, // Bonus for trend context
  };
};

/**
 * Detect Shooting Star (Bearish Pin Bar after uptrend)
 * @param {Array} candles - Array of candles
 * @param {number} index - Index of candle to check
 * @param {Object} options - Detection options
 * @returns {Object|null} Pattern result or null
 */
export const detectShootingStar = (candles, index, options = {}) => {
  if (!candles || index < 3) return null;

  // Check for prior uptrend (3 consecutive higher closes)
  const priorCandles = candles.slice(index - 3, index);
  const isUptrend = priorCandles.every((c, i) =>
    i === 0 || c.close > priorCandles[i - 1].close
  );

  if (!isUptrend) return null;

  const pinBar = detectBearishPinBar(candles[index], options);
  if (!pinBar) return null;

  return {
    ...pinBar,
    pattern: CONFIRMATION_PATTERNS.SHOOTING_STAR,
    patternId: 'shooting_star',
    hasUptrend: true,
    trendContext: 'uptrend',
    score: pinBar.score + 1, // Bonus for trend context
  };
};

/**
 * Check if pin bar aligns with zone type
 * @param {Object} pinBar - Detected pin bar pattern
 * @param {string} zoneType - Zone type (LFZ/HFZ)
 * @returns {boolean} True if aligned
 */
export const isPinBarAlignedWithZone = (pinBar, zoneType) => {
  if (!pinBar) return false;

  // LFZ (demand) expects bullish pin bar
  if (zoneType === 'LFZ' && pinBar.type === 'bullish') return true;

  // HFZ (supply) expects bearish pin bar
  if (zoneType === 'HFZ' && pinBar.type === 'bearish') return true;

  return false;
};

export default {
  detectBullishPinBar,
  detectBearishPinBar,
  detectPinBar,
  detectHammer,
  detectShootingStar,
  isPinBarAlignedWithZone,
};
