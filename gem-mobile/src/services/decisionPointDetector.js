/**
 * GEM Mobile - Decision Point (DP) Detection
 * DP = Origin of major impulsive move
 *
 * Phase 2A: Flag Limit + Decision Point + Zone Hierarchy
 *
 * Decision Point Requirements:
 * - Must be the ORIGIN of a significant price move
 * - The move from DP must be IMPULSIVE (strong, fast)
 * - Usually marks the start of a new trend or major swing
 * - Zone is where Smart Money made a critical decision
 */

import { ZONE_HIERARCHY, DECISION_POINT_CONFIG } from '../constants/zoneHierarchyConfig';
import { calculateZoneBoundaries, findSwingHighs, findSwingLows } from './zoneCalculator';

// ═══════════════════════════════════════════════════════════
// BULLISH DECISION POINT
// ═══════════════════════════════════════════════════════════

/**
 * Find Bullish Decision Point (origin of up move)
 */
const findBullishDP = (candles, startIndex, options) => {
  const {
    minMovePercent,
    minMoveMultiple,
    maxPauseCandles,
    currentPrice,
    impulsiveRatio,
  } = options;

  // Look for consolidation/pause before move
  for (let pauseLength = 1; pauseLength <= maxPauseCandles; pauseLength++) {
    const pauseStart = startIndex - pauseLength;
    if (pauseStart < 0) continue;

    const pauseCandles = candles.slice(pauseStart, startIndex + 1);
    const pauseHigh = Math.max(...pauseCandles.map(c => c.high));
    const pauseLow = Math.min(...pauseCandles.map(c => c.low));
    const pauseRange = pauseHigh - pauseLow;

    // Look for impulsive move AFTER pause
    const afterPause = candles.slice(
      startIndex + 1,
      Math.min(startIndex + 20, candles.length)
    );
    if (afterPause.length < 5) continue;

    const highAfterPause = Math.max(...afterPause.map(c => c.high));
    const moveSize = highAfterPause - pauseLow;
    const movePercent = (moveSize / pauseLow) * 100;

    // Check if move is significant
    if (movePercent < minMovePercent) continue;

    // Check if move is multiple of pause range
    if (pauseRange > 0 && moveSize < pauseRange * minMoveMultiple) continue;

    // Check if move was IMPULSIVE (mostly up candles)
    const upCandles = afterPause.filter(c => c.close > c.open).length;
    if (upCandles / afterPause.length < impulsiveRatio) continue;

    const zone = calculateZoneBoundaries(pauseCandles, 'LFZ', currentPrice);
    if (!zone) continue;

    // ✅ FIX: Extract timestamps for zone positioning on chart
    let startTime = candles[pauseStart]?.time || candles[pauseStart]?.timestamp;
    let endTime = candles[startIndex]?.time || candles[startIndex]?.timestamp;
    if (startTime && startTime > 9999999999) startTime = Math.floor(startTime / 1000);
    if (endTime && endTime > 9999999999) endTime = Math.floor(endTime / 1000);

    return {
      pattern: 'DECISION_POINT_BULLISH',
      patternCategory: 'decision_point',
      isDecisionPoint: true,
      zoneHierarchy: 'DECISION_POINT',
      zoneHierarchyLevel: 1,
      hierarchyConfig: ZONE_HIERARCHY.DECISION_POINT,

      ...zone,

      // DP specific
      dpMoveSize: moveSize,
      dpMovePercent: parseFloat(movePercent.toFixed(2)),
      dpMoveMultiple: parseFloat((moveSize / pauseRange).toFixed(1)),
      originCandleCount: pauseLength,

      // ✅ FIX: Add time fields for zone chart positioning
      startTime,
      endTime,
      formationTime: startTime,
      startCandleIndex: pauseStart,
      endCandleIndex: startIndex,

      // Structure
      structure: {
        originStartIndex: pauseStart,
        originEndIndex: startIndex,
        moveStart: pauseLow,
        moveEnd: highAfterPause,
      },

      zoneType: 'LFZ',
      tradingBias: 'BUY',
      importance: 'high',
      isValid: true,
      confidence: Math.min(95, 75 + movePercent * 2),
      detectedAt: new Date().toISOString(),
    };
  }

  return null;
};

// ═══════════════════════════════════════════════════════════
// BEARISH DECISION POINT
// ═══════════════════════════════════════════════════════════

/**
 * Find Bearish Decision Point (origin of down move)
 */
const findBearishDP = (candles, startIndex, options) => {
  const {
    minMovePercent,
    minMoveMultiple,
    maxPauseCandles,
    currentPrice,
    impulsiveRatio,
  } = options;

  for (let pauseLength = 1; pauseLength <= maxPauseCandles; pauseLength++) {
    const pauseStart = startIndex - pauseLength;
    if (pauseStart < 0) continue;

    const pauseCandles = candles.slice(pauseStart, startIndex + 1);
    const pauseHigh = Math.max(...pauseCandles.map(c => c.high));
    const pauseLow = Math.min(...pauseCandles.map(c => c.low));
    const pauseRange = pauseHigh - pauseLow;

    const afterPause = candles.slice(
      startIndex + 1,
      Math.min(startIndex + 20, candles.length)
    );
    if (afterPause.length < 5) continue;

    const lowAfterPause = Math.min(...afterPause.map(c => c.low));
    const moveSize = pauseHigh - lowAfterPause;
    const movePercent = (moveSize / pauseHigh) * 100;

    if (movePercent < minMovePercent) continue;
    if (pauseRange > 0 && moveSize < pauseRange * minMoveMultiple) continue;

    // Check if move was impulsive (mostly down candles)
    const downCandles = afterPause.filter(c => c.close < c.open).length;
    if (downCandles / afterPause.length < impulsiveRatio) continue;

    const zone = calculateZoneBoundaries(pauseCandles, 'HFZ', currentPrice);
    if (!zone) continue;

    // ✅ FIX: Extract timestamps for zone positioning on chart
    let startTime = candles[pauseStart]?.time || candles[pauseStart]?.timestamp;
    let endTime = candles[startIndex]?.time || candles[startIndex]?.timestamp;
    if (startTime && startTime > 9999999999) startTime = Math.floor(startTime / 1000);
    if (endTime && endTime > 9999999999) endTime = Math.floor(endTime / 1000);

    return {
      pattern: 'DECISION_POINT_BEARISH',
      patternCategory: 'decision_point',
      isDecisionPoint: true,
      zoneHierarchy: 'DECISION_POINT',
      zoneHierarchyLevel: 1,
      hierarchyConfig: ZONE_HIERARCHY.DECISION_POINT,

      ...zone,

      dpMoveSize: moveSize,
      dpMovePercent: parseFloat(movePercent.toFixed(2)),
      dpMoveMultiple: parseFloat((moveSize / pauseRange).toFixed(1)),
      originCandleCount: pauseLength,

      // ✅ FIX: Add time fields for zone chart positioning
      startTime,
      endTime,
      formationTime: startTime,
      startCandleIndex: pauseStart,
      endCandleIndex: startIndex,

      structure: {
        originStartIndex: pauseStart,
        originEndIndex: startIndex,
        moveStart: pauseHigh,
        moveEnd: lowAfterPause,
      },

      zoneType: 'HFZ',
      tradingBias: 'SELL',
      importance: 'high',
      isValid: true,
      confidence: Math.min(95, 75 + movePercent * 2),
      detectedAt: new Date().toISOString(),
    };
  }

  return null;
};

// ═══════════════════════════════════════════════════════════
// FILTER DUPLICATES
// ═══════════════════════════════════════════════════════════

/**
 * Filter duplicate/overlapping DPs
 */
const filterDuplicateDPs = (dps) => {
  if (!dps || dps.length === 0) return [];

  // Sort by move percent (largest first)
  const sorted = [...dps].sort(
    (a, b) => parseFloat(b.dpMovePercent) - parseFloat(a.dpMovePercent)
  );

  const unique = [];

  for (const dp of sorted) {
    // Check if overlaps with existing
    const overlaps = unique.some(existing => {
      const dpEntry = dp.entryPrice;
      const dpStop = dp.stopPrice;
      const exEntry = existing.entryPrice;
      const exStop = existing.stopPrice;

      // Check price overlap
      const dpMin = Math.min(dpEntry, dpStop);
      const dpMax = Math.max(dpEntry, dpStop);
      const exMin = Math.min(exEntry, exStop);
      const exMax = Math.max(exEntry, exStop);

      const overlap = dpMax >= exMin && dpMin <= exMax;
      return overlap && dp.zoneType === existing.zoneType;
    });

    if (!overlaps) {
      unique.push(dp);
    }
  }

  return unique;
};

// ═══════════════════════════════════════════════════════════
// MAIN DETECTION FUNCTION
// ═══════════════════════════════════════════════════════════

/**
 * Detect Decision Points
 * @param {Array} candles - OHLCV candles
 * @param {Object} options - Detection options
 * @returns {Array|null} Array of Decision Point zones
 */
export const detectDecisionPoints = (candles, options = {}) => {
  const {
    lookback = 50,
    minMovePercent = DECISION_POINT_CONFIG.minMovePercent,
    minMoveMultiple = DECISION_POINT_CONFIG.minMoveMultiple,
    maxPauseCandles = DECISION_POINT_CONFIG.maxOriginCandles,
    impulsiveRatio = DECISION_POINT_CONFIG.impulsiveRatio,
  } = options;

  if (!candles || candles.length < lookback) {
    return null;
  }

  const currentPrice = candles[candles.length - 1].close;
  const decisionPoints = [];

  const detectionOptions = {
    minMovePercent,
    minMoveMultiple,
    maxPauseCandles,
    currentPrice,
    impulsiveRatio,
  };

  // Look for major moves and trace back to origin
  for (let i = candles.length - 10; i >= Math.max(5, candles.length - lookback); i--) {
    // Check for major UP move origin (Bullish DP)
    const bullishDP = findBullishDP(candles, i, detectionOptions);
    if (bullishDP) {
      decisionPoints.push(bullishDP);
    }

    // Check for major DOWN move origin (Bearish DP)
    const bearishDP = findBearishDP(candles, i, detectionOptions);
    if (bearishDP) {
      decisionPoints.push(bearishDP);
    }
  }

  // Filter duplicates and return most significant
  const uniqueDPs = filterDuplicateDPs(decisionPoints);

  return uniqueDPs.length > 0 ? uniqueDPs : null;
};

// ═══════════════════════════════════════════════════════════
// VALIDATION
// ═══════════════════════════════════════════════════════════

/**
 * Check if a zone qualifies as Decision Point
 * @param {Object} zone - Zone object
 * @returns {boolean}
 */
export const isValidDecisionPoint = (zone) => {
  if (!zone) return false;

  // Must have significant move
  const movePercent = zone.dpMovePercent || 0;
  if (movePercent < DECISION_POINT_CONFIG.minMovePercent) return false;

  // Must have sufficient move multiple
  const moveMultiple = zone.dpMoveMultiple || 0;
  if (moveMultiple < DECISION_POINT_CONFIG.minMoveMultiple) return false;

  return true;
};

/**
 * Get the best Decision Point from array
 * @param {Array} dps - Array of Decision Points
 * @returns {Object|null} Best DP or null
 */
export const getBestDecisionPoint = (dps) => {
  if (!dps || dps.length === 0) return null;

  // Sort by move percent (largest first)
  const sorted = [...dps].sort(
    (a, b) => parseFloat(b.dpMovePercent) - parseFloat(a.dpMovePercent)
  );

  return sorted[0];
};

// ═══════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════

export default {
  detectDecisionPoints,
  isValidDecisionPoint,
  getBestDecisionPoint,
};
