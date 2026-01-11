/**
 * GEM Mobile - Engulfing Pattern Detector
 * Phase 3A: Detect Bullish and Bearish Engulfing patterns
 *
 * Engulfing Pattern Requirements:
 * - Current candle body COMPLETELY covers previous candle body
 * - Current candle is opposite direction of previous
 * - The bigger the engulfing, the stronger the signal
 */

import { CONFIRMATION_PATTERNS, DETECTION_CONFIG } from '../constants/confirmationConfig';

/**
 * Detect Bullish Engulfing Pattern
 * @param {Object} current - Current candle {open, high, low, close, timestamp}
 * @param {Object} previous - Previous candle
 * @param {Object} options - Detection options
 * @returns {Object|null} Pattern result or null
 */
export const detectBullishEngulfing = (current, previous, options = {}) => {
  const { minEngulfPercent = DETECTION_CONFIG.engulfing.minEngulfPercent } = options;

  if (!current || !previous) return null;

  // Previous must be bearish (red)
  const prevIsBearish = previous.close < previous.open;
  if (!prevIsBearish) return null;

  // Current must be bullish (green)
  const currIsBullish = current.close > current.open;
  if (!currIsBullish) return null;

  // Current body must engulf previous body
  const prevBodyHigh = Math.max(previous.open, previous.close);
  const prevBodyLow = Math.min(previous.open, previous.close);
  const currBodyHigh = Math.max(current.open, current.close);
  const currBodyLow = Math.min(current.open, current.close);

  const engulfs = currBodyLow <= prevBodyLow && currBodyHigh >= prevBodyHigh;
  if (!engulfs) return null;

  // Calculate engulfing strength
  const prevBodySize = prevBodyHigh - prevBodyLow;
  const currBodySize = currBodyHigh - currBodyLow;
  const engulfRatio = prevBodySize > 0 ? (currBodySize / prevBodySize) * 100 : 100;

  if (engulfRatio < minEngulfPercent) return null;

  // Determine strength based on engulf ratio
  const strength = engulfRatio >= 150 ? 'strong' : engulfRatio >= 120 ? 'moderate' : 'weak';
  const score = engulfRatio >= 150 ? 4 : engulfRatio >= 120 ? 3 : 2;

  return {
    pattern: CONFIRMATION_PATTERNS.BULLISH_ENGULFING,
    patternId: 'bullish_engulfing',
    type: 'bullish',

    // Candle info
    confirmationCandle: {
      open: current.open,
      high: current.high,
      low: current.low,
      close: current.close,
      timestamp: current.timestamp,
    },
    previousCandle: {
      open: previous.open,
      high: previous.high,
      low: previous.low,
      close: previous.close,
    },

    // Metrics
    engulfRatio: engulfRatio.toFixed(1),
    bodySize: currBodySize,
    prevBodySize: prevBodySize,

    // Quality
    strength,
    score,

    // Trading
    entryPrice: current.close,
    stopLoss: current.low,

    isValid: true,
    detectedAt: new Date().toISOString(),
  };
};

/**
 * Detect Bearish Engulfing Pattern
 * @param {Object} current - Current candle
 * @param {Object} previous - Previous candle
 * @param {Object} options - Detection options
 * @returns {Object|null} Pattern result or null
 */
export const detectBearishEngulfing = (current, previous, options = {}) => {
  const { minEngulfPercent = DETECTION_CONFIG.engulfing.minEngulfPercent } = options;

  if (!current || !previous) return null;

  // Previous must be bullish (green)
  const prevIsBullish = previous.close > previous.open;
  if (!prevIsBullish) return null;

  // Current must be bearish (red)
  const currIsBearish = current.close < current.open;
  if (!currIsBearish) return null;

  // Calculate bodies
  const prevBodyHigh = Math.max(previous.open, previous.close);
  const prevBodyLow = Math.min(previous.open, previous.close);
  const currBodyHigh = Math.max(current.open, current.close);
  const currBodyLow = Math.min(current.open, current.close);

  // Current must engulf previous
  const engulfs = currBodyLow <= prevBodyLow && currBodyHigh >= prevBodyHigh;
  if (!engulfs) return null;

  // Calculate engulf ratio
  const prevBodySize = prevBodyHigh - prevBodyLow;
  const currBodySize = currBodyHigh - currBodyLow;
  const engulfRatio = prevBodySize > 0 ? (currBodySize / prevBodySize) * 100 : 100;

  if (engulfRatio < minEngulfPercent) return null;

  const strength = engulfRatio >= 150 ? 'strong' : engulfRatio >= 120 ? 'moderate' : 'weak';
  const score = engulfRatio >= 150 ? 4 : engulfRatio >= 120 ? 3 : 2;

  return {
    pattern: CONFIRMATION_PATTERNS.BEARISH_ENGULFING,
    patternId: 'bearish_engulfing',
    type: 'bearish',

    confirmationCandle: {
      open: current.open,
      high: current.high,
      low: current.low,
      close: current.close,
      timestamp: current.timestamp,
    },
    previousCandle: {
      open: previous.open,
      high: previous.high,
      low: previous.low,
      close: previous.close,
    },

    engulfRatio: engulfRatio.toFixed(1),
    bodySize: currBodySize,
    prevBodySize: prevBodySize,

    strength,
    score,

    entryPrice: current.close,
    stopLoss: current.high,

    isValid: true,
    detectedAt: new Date().toISOString(),
  };
};

/**
 * Detect any Engulfing pattern (bullish or bearish)
 * @param {Object} current - Current candle
 * @param {Object} previous - Previous candle
 * @param {Object} options - Detection options
 * @returns {Object|null} Pattern result or null
 */
export const detectEngulfing = (current, previous, options = {}) => {
  // Try bullish first
  const bullish = detectBullishEngulfing(current, previous, options);
  if (bullish) return bullish;

  // Try bearish
  const bearish = detectBearishEngulfing(current, previous, options);
  if (bearish) return bearish;

  return null;
};

/**
 * Check if engulfing pattern aligns with zone type
 * @param {Object} engulfing - Detected engulfing pattern
 * @param {string} zoneType - Zone type (LFZ/HFZ)
 * @returns {boolean} True if aligned
 */
export const isEngulfingAlignedWithZone = (engulfing, zoneType) => {
  if (!engulfing) return false;

  // LFZ (demand) expects bullish engulfing
  if (zoneType === 'LFZ' && engulfing.type === 'bullish') return true;

  // HFZ (supply) expects bearish engulfing
  if (zoneType === 'HFZ' && engulfing.type === 'bearish') return true;

  return false;
};

export default {
  detectBullishEngulfing,
  detectBearishEngulfing,
  detectEngulfing,
  isEngulfingAlignedWithZone,
};
