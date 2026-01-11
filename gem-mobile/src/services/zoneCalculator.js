/**
 * GEM Mobile - Zone Calculator Service
 * Zone boundary calculation based on GEM Method
 *
 * GEM Method Zone Rules:
 * - HFZ (Supply): Entry = LOW of pause (near), Stop = HIGH of pause (far)
 * - LFZ (Demand): Entry = HIGH of pause (near), Stop = LOW of pause (far)
 *
 * "Near" and "Far" are relative to current price direction
 */

import { getPatternConfig, getZoneTypeConfig } from '../constants/patternConfig';

// ═══════════════════════════════════════════════════════════
// ZONE BOUNDARY CALCULATIONS
// ═══════════════════════════════════════════════════════════

/**
 * Calculate zone boundaries from pause candles
 * @param {Array} pauseCandles - Array of candles in the pause period
 * @param {string} zoneType - 'HFZ' or 'LFZ'
 * @param {number} currentPrice - Current market price
 * @returns {Object|null} Zone object with entry, stop, width
 */
export const calculateZoneBoundaries = (pauseCandles, zoneType, currentPrice) => {
  if (!pauseCandles || pauseCandles.length === 0) {
    console.warn('[ZoneCalculator] No pause candles provided');
    return null;
  }

  // Find high and low of pause period
  const pauseHigh = Math.max(...pauseCandles.map(c => c?.high || 0));
  const pauseLow = Math.min(...pauseCandles.filter(c => c?.low > 0).map(c => c.low));
  const zoneWidth = pauseHigh - pauseLow;

  // Validate
  if (pauseHigh <= 0 || pauseLow <= 0 || zoneWidth < 0) {
    console.warn('[ZoneCalculator] Invalid candle data');
    return null;
  }

  let entryPrice, stopPrice;

  if (zoneType === 'HFZ') {
    // HFZ (Supply): Price coming from below, expecting to drop
    // Entry = LOW of pause (near price - where we expect first touch)
    // Stop = HIGH of pause (far price - invalidation level)
    entryPrice = pauseLow;
    stopPrice = pauseHigh;
  } else if (zoneType === 'LFZ') {
    // LFZ (Demand): Price coming from above, expecting to rise
    // Entry = HIGH of pause (near price - where we expect first touch)
    // Stop = LOW of pause (far price - invalidation level)
    entryPrice = pauseHigh;
    stopPrice = pauseLow;
  } else {
    console.warn(`[ZoneCalculator] Unknown zone type: ${zoneType}`);
    return null;
  }

  // Calculate zone width as percentage
  const zoneWidthPercent = currentPrice > 0 ? (zoneWidth / currentPrice) * 100 : 0;

  // Calculate buffer for stop loss (10% of zone width as buffer)
  const stopBuffer = zoneWidth * 0.1;
  const stopLossPrice = zoneType === 'HFZ'
    ? stopPrice + stopBuffer
    : stopPrice - stopBuffer;

  return {
    zoneType,
    entryPrice,
    stopPrice,
    stopLossPrice,
    zoneWidth,
    zoneWidthPercent: parseFloat(zoneWidthPercent.toFixed(2)),
    pauseHigh,
    pauseLow,
    pauseCandleCount: pauseCandles.length,
    isValid: zoneWidth > 0,
  };
};

/**
 * Validate zone quality based on width relative to ATR
 * @param {Object} zone - Zone object
 * @param {number} atr - Average True Range for context
 * @returns {Object} Validation result
 */
export const validateZoneWidth = (zone, atr) => {
  if (!zone || !atr || atr <= 0) {
    return { isValid: false, reason: 'Thiếu dữ liệu', widthRatio: 0 };
  }

  const widthRatio = zone.zoneWidth / atr;

  // Zone width should be between 0.3x and 4x ATR
  if (widthRatio < 0.3) {
    return {
      isValid: false,
      isExtended: false,
      reason: 'Zone quá hẹp',
      widthRatio,
      quality: 'poor',
      suggestion: 'Zone có thể không đủ significant',
    };
  }

  if (widthRatio > 4) {
    return {
      isValid: true,
      isExtended: true,
      reason: 'Zone quá rộng - cần refine',
      widthRatio,
      quality: 'extended',
      suggestion: 'Zoom xuống LTF để tìm zone chính xác hơn',
    };
  }

  // Quality assessment
  let quality = 'acceptable';
  if (widthRatio <= 1.0) quality = 'excellent';
  else if (widthRatio <= 1.5) quality = 'good';
  else if (widthRatio <= 2.5) quality = 'acceptable';

  return {
    isValid: true,
    isExtended: false,
    widthRatio: parseFloat(widthRatio.toFixed(2)),
    quality,
    reason: null,
    suggestion: null,
  };
};

/**
 * Calculate risk/reward ratio
 * @param {Object} zone - Zone object
 * @param {number} targetPrice - Take profit target
 * @returns {Object|null} R:R calculation
 */
export const calculateRiskReward = (zone, targetPrice) => {
  if (!zone || !targetPrice) return null;

  const { entryPrice, stopLossPrice, zoneType } = zone;

  if (!entryPrice || !stopLossPrice) return null;

  let risk, reward;

  if (zoneType === 'HFZ') {
    // Sell trade: Entry high, target low
    risk = Math.abs(stopLossPrice - entryPrice);
    reward = Math.abs(entryPrice - targetPrice);
  } else {
    // Buy trade: Entry low, target high
    risk = Math.abs(entryPrice - stopLossPrice);
    reward = Math.abs(targetPrice - entryPrice);
  }

  const ratio = risk > 0 ? reward / risk : 0;

  return {
    risk,
    reward,
    ratio: parseFloat(ratio.toFixed(2)),
    ratioDisplay: `1:${ratio.toFixed(1)}`,
    isAcceptable: ratio >= 2.0, // Minimum 2:1 R:R
    isGood: ratio >= 3.0,
    isExcellent: ratio >= 4.0,
  };
};

/**
 * Calculate distance from current price to zone
 * @param {number} currentPrice - Current market price
 * @param {Object} zone - Zone object
 * @returns {Object} Distance information
 */
export const calculateDistanceToZone = (currentPrice, zone) => {
  if (!currentPrice || !zone) {
    return { absolute: 0, percent: 0, isInZone: false, isApproaching: false };
  }

  const distance = Math.abs(currentPrice - zone.entryPrice);
  const percent = currentPrice > 0 ? (distance / currentPrice) * 100 : 0;

  return {
    absolute: distance,
    percent: parseFloat(percent.toFixed(2)),
    isInZone: currentPrice >= zone.pauseLow && currentPrice <= zone.pauseHigh,
    isApproaching: percent < 1.0, // Within 1%
    isNear: percent < 2.0, // Within 2%
  };
};

/**
 * Calculate estimated target when opposing zone not known
 * @param {Object} zone - Zone object
 * @param {number} currentPrice - Current market price
 * @returns {number} Estimated target price
 */
export const calculateEstimatedTarget = (zone, currentPrice) => {
  if (!zone) return currentPrice;

  // Default target: 2x zone width from entry
  const targetDistance = zone.zoneWidth * 2;

  if (zone.zoneType === 'HFZ') {
    return zone.entryPrice - targetDistance;
  } else {
    return zone.entryPrice + targetDistance;
  }
};

/**
 * Create complete zone result object
 * @param {Object} params - All zone parameters
 * @returns {Object|null} Complete zone result
 */
export const createZoneResult = ({
  symbol,
  timeframe,
  pattern,
  pauseCandles,
  currentPrice,
  opposingZonePrice = null,
  atr = null,
}) => {
  const patternConfig = getPatternConfig(pattern);
  const zoneType = patternConfig.type;
  const zoneTypeConfig = getZoneTypeConfig(zoneType);

  const zone = calculateZoneBoundaries(pauseCandles, zoneType, currentPrice);

  if (!zone) return null;

  // Calculate target (opposing zone or estimated)
  const targetPrice = opposingZonePrice || calculateEstimatedTarget(zone, currentPrice);
  const riskReward = calculateRiskReward(zone, targetPrice);
  const distanceToZone = calculateDistanceToZone(currentPrice, zone);

  // Validate zone width if ATR provided
  const zoneValidation = atr ? validateZoneWidth(zone, atr) : { isValid: true };

  return {
    // Basic info
    symbol,
    timeframe,
    pattern,

    // Pattern config
    patternConfig: {
      name: patternConfig.name,
      fullName: patternConfig.fullName,
      context: patternConfig.context,
      strength: patternConfig.strength,
      stars: patternConfig.stars,
      winRate: patternConfig.winRate,
      tradingBias: patternConfig.tradingBias,
      color: patternConfig.color,
    },

    // Zone type config
    zoneTypeConfig: {
      name: zoneTypeConfig.name,
      fullName: zoneTypeConfig.fullName,
      vietnameseName: zoneTypeConfig.vietnameseName,
      color: zoneTypeConfig.color,
      colorMuted: zoneTypeConfig.colorMuted,
    },

    // Zone boundaries
    ...zone,

    // Risk/Reward
    targetPrice,
    riskReward,

    // Distance
    distanceToZone,

    // Validation
    zoneValidation,

    // Metadata
    currentPrice,
    detectedAt: new Date().toISOString(),
  };
};

/**
 * Extract pause candles from pattern result
 * @param {Array} candles - All candles
 * @param {Object} patternResult - Pattern detection result
 * @returns {Array} Pause candles
 */
export const extractPauseCandles = (candles, patternResult) => {
  const { pauseStartIndex, pauseEndIndex, departureIndex } = patternResult;

  // Use explicit pause indices if available
  if (pauseStartIndex !== undefined && pauseEndIndex !== undefined) {
    return candles.slice(pauseStartIndex, pauseEndIndex + 1);
  }

  // Fallback: Use candles around departure point
  const depIndex = departureIndex || candles.length - 1;
  const lookback = Math.min(6, depIndex);
  return candles.slice(depIndex - lookback, depIndex);
};

/**
 * Calculate ATR (Average True Range)
 * @param {Array} candles - OHLCV candles
 * @param {number} period - ATR period (default 14)
 * @returns {number} ATR value
 */
export const calculateATR = (candles, period = 14) => {
  if (!candles || candles.length < period + 1) return 0;

  const trueRanges = [];

  for (let i = 1; i < candles.length; i++) {
    const high = candles[i].high;
    const low = candles[i].low;
    const prevClose = candles[i - 1].close;

    const tr = Math.max(
      high - low,
      Math.abs(high - prevClose),
      Math.abs(low - prevClose)
    );
    trueRanges.push(tr);
  }

  // Calculate ATR as SMA of true ranges
  const recentTRs = trueRanges.slice(-period);
  const atr = recentTRs.reduce((sum, tr) => sum + tr, 0) / recentTRs.length;

  return atr;
};

// ═══════════════════════════════════════════════════════════
// DEFAULT EXPORT
// ═══════════════════════════════════════════════════════════

const zoneCalculator = {
  calculateZoneBoundaries,
  validateZoneWidth,
  calculateRiskReward,
  calculateDistanceToZone,
  calculateEstimatedTarget,
  createZoneResult,
  extractPauseCandles,
  calculateATR,
};

export default zoneCalculator;
