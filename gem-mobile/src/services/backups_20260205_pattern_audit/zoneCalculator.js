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
// SMART TP/SL CALCULATIONS
// ═══════════════════════════════════════════════════════════

/**
 * Find swing highs from candles
 * @param {Array} candles - OHLCV candles
 * @param {number} lookback - Number of candles to look back (default 50)
 * @param {number} strength - Swing strength (candles on each side, default 3)
 * @returns {Array} Array of swing high prices sorted by recency
 */
export const findSwingHighs = (candles, lookback = 50, strength = 3) => {
  if (!candles || candles.length < lookback) return [];

  const recentCandles = candles.slice(-lookback);
  const swingHighs = [];

  for (let i = strength; i < recentCandles.length - strength; i++) {
    const current = recentCandles[i];
    let isSwingHigh = true;

    // Check if current high is higher than surrounding candles
    for (let j = 1; j <= strength; j++) {
      if (recentCandles[i - j].high >= current.high ||
          recentCandles[i + j].high >= current.high) {
        isSwingHigh = false;
        break;
      }
    }

    if (isSwingHigh) {
      swingHighs.push({
        price: current.high,
        index: candles.length - lookback + i,
        timestamp: current.timestamp || current.time,
      });
    }
  }

  // Sort by index (most recent first)
  return swingHighs.sort((a, b) => b.index - a.index);
};

/**
 * Find swing lows from candles
 * @param {Array} candles - OHLCV candles
 * @param {number} lookback - Number of candles to look back (default 50)
 * @param {number} strength - Swing strength (candles on each side, default 3)
 * @returns {Array} Array of swing low prices sorted by recency
 */
export const findSwingLows = (candles, lookback = 50, strength = 3) => {
  if (!candles || candles.length < lookback) return [];

  const recentCandles = candles.slice(-lookback);
  const swingLows = [];

  for (let i = strength; i < recentCandles.length - strength; i++) {
    const current = recentCandles[i];
    let isSwingLow = true;

    // Check if current low is lower than surrounding candles
    for (let j = 1; j <= strength; j++) {
      if (recentCandles[i - j].low <= current.low ||
          recentCandles[i + j].low <= current.low) {
        isSwingLow = false;
        break;
      }
    }

    if (isSwingLow) {
      swingLows.push({
        price: current.low,
        index: candles.length - lookback + i,
        timestamp: current.timestamp || current.time,
      });
    }
  }

  // Sort by index (most recent first)
  return swingLows.sort((a, b) => b.index - a.index);
};

/**
 * Calculate smart Take Profit with ATR capping and swing targets
 * @param {Object} params - Parameters for TP calculation
 * @returns {Object} Smart TP result with price and reasoning
 */
export const calculateSmartTP = ({
  entry,
  stopLoss,
  direction, // 'LONG' or 'SHORT'
  candles,
  atr = null,
  minRR = 2.0, // Minimum Risk:Reward ratio
  maxATRMultiple = 3.5, // Maximum TP distance in ATR units
  patternHeight = null, // Optional pattern-based target
}) => {
  if (!entry || !stopLoss || !candles || candles.length < 20) {
    return { price: null, reasoning: 'Insufficient data' };
  }

  // Calculate ATR if not provided
  const calculatedATR = atr || calculateATR(candles, 14);
  if (calculatedATR <= 0) {
    return { price: null, reasoning: 'Invalid ATR' };
  }

  // Calculate risk (distance from entry to SL)
  const risk = Math.abs(entry - stopLoss);

  // Calculate minimum TP based on R:R
  const minTPDistance = risk * minRR;

  // Calculate max TP based on ATR (prevent unrealistic targets)
  const maxTPDistance = calculatedATR * maxATRMultiple;

  let targetPrice;
  let reasoning = [];
  let method = 'default';

  if (direction === 'LONG') {
    // === LONG TRADE ===
    // Find swing highs as potential resistance/targets
    const swingHighs = findSwingHighs(candles, 100, 3);

    // Filter swing highs that are above entry
    const validTargets = swingHighs
      .filter(sh => sh.price > entry)
      .sort((a, b) => a.price - b.price); // Sort by price (lowest first = nearest target)

    // Find the recent high (potential ATH or local high)
    const recentHigh = Math.max(...candles.slice(-100).map(c => c.high));

    // Start with minimum TP based on R:R
    let baseTP = entry + minTPDistance;
    reasoning.push(`Base TP (${minRR}:1 R:R): ${baseTP.toFixed(6)}`);

    // If we have valid swing targets, use the nearest one above base TP
    if (validTargets.length > 0) {
      const nearestTarget = validTargets.find(t => t.price >= baseTP);
      if (nearestTarget) {
        baseTP = nearestTarget.price;
        method = 'swing_high';
        reasoning.push(`Swing high target: ${baseTP.toFixed(6)}`);
      }
    }

    // If pattern height is provided and reasonable, consider it
    if (patternHeight && patternHeight > 0) {
      const patternTP = entry + patternHeight;
      // Only use pattern TP if it's between min and max
      if (patternTP >= entry + minTPDistance && patternTP <= entry + maxTPDistance) {
        baseTP = Math.min(baseTP, patternTP);
        method = 'pattern_height';
        reasoning.push(`Pattern-based target: ${patternTP.toFixed(6)}`);
      }
    }

    // Cap by ATR maximum
    const maxTP = entry + maxTPDistance;
    if (baseTP > maxTP) {
      baseTP = maxTP;
      method = 'atr_capped';
      reasoning.push(`ATR capped (${maxATRMultiple}x ATR): ${maxTP.toFixed(6)}`);
    }

    // Never exceed recent high (practical limit)
    if (baseTP > recentHigh) {
      baseTP = recentHigh * 0.995; // 0.5% below recent high
      method = 'recent_high_capped';
      reasoning.push(`Capped below recent high: ${baseTP.toFixed(6)}`);
    }

    targetPrice = baseTP;

  } else {
    // === SHORT TRADE ===
    // Find swing lows as potential support/targets
    const swingLows = findSwingLows(candles, 100, 3);

    // Filter swing lows that are below entry
    const validTargets = swingLows
      .filter(sl => sl.price < entry)
      .sort((a, b) => b.price - a.price); // Sort by price (highest first = nearest target)

    // Find the recent low
    const recentLow = Math.min(...candles.slice(-100).map(c => c.low));

    // Start with minimum TP based on R:R
    let baseTP = entry - minTPDistance;
    reasoning.push(`Base TP (${minRR}:1 R:R): ${baseTP.toFixed(6)}`);

    // If we have valid swing targets, use the nearest one below base TP
    if (validTargets.length > 0) {
      const nearestTarget = validTargets.find(t => t.price <= baseTP);
      if (nearestTarget) {
        baseTP = nearestTarget.price;
        method = 'swing_low';
        reasoning.push(`Swing low target: ${baseTP.toFixed(6)}`);
      }
    }

    // If pattern height is provided and reasonable, consider it
    if (patternHeight && patternHeight > 0) {
      const patternTP = entry - patternHeight;
      // Only use pattern TP if it's between min and max
      if (patternTP <= entry - minTPDistance && patternTP >= entry - maxTPDistance) {
        baseTP = Math.max(baseTP, patternTP);
        method = 'pattern_height';
        reasoning.push(`Pattern-based target: ${patternTP.toFixed(6)}`);
      }
    }

    // Cap by ATR maximum
    const maxTP = entry - maxTPDistance;
    if (baseTP < maxTP) {
      baseTP = maxTP;
      method = 'atr_capped';
      reasoning.push(`ATR capped (${maxATRMultiple}x ATR): ${maxTP.toFixed(6)}`);
    }

    // Never go below recent low (practical limit)
    if (baseTP < recentLow) {
      baseTP = recentLow * 1.005; // 0.5% above recent low
      method = 'recent_low_capped';
      reasoning.push(`Capped above recent low: ${baseTP.toFixed(6)}`);
    }

    targetPrice = baseTP;
  }

  // Calculate final R:R
  const finalReward = Math.abs(targetPrice - entry);
  const finalRR = risk > 0 ? finalReward / risk : 0;

  return {
    price: targetPrice,
    method,
    reasoning: reasoning.join(' → '),
    riskReward: parseFloat(finalRR.toFixed(2)),
    atr: calculatedATR,
    risk,
    reward: finalReward,
    isValid: finalRR >= 1.5, // At least 1.5:1 R:R
  };
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
  // Smart TP functions
  findSwingHighs,
  findSwingLows,
  calculateSmartTP,
};

export default zoneCalculator;
