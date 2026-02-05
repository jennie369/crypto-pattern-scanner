/**
 * GEM Mobile - Flag Limit (FL) Pattern Detection
 * FL = UPU/DPD with base of ONLY 1-2 candles
 *
 * Phase 2A: Flag Limit + Decision Point + Zone Hierarchy
 *
 * "Every FL is an FTR, but not every FTR is an FL"
 *
 * Flag Limit Requirements:
 * - Must be UPU (bullish) or DPD (bearish) pattern
 * - Base must have ONLY 1-2 candles
 * - Must be WITHIN an existing trend (not at turning point)
 */

import { ZONE_HIERARCHY, FLAG_LIMIT_CONFIG } from '../constants/zoneHierarchyConfig';
import { calculateZoneBoundaries } from './zoneCalculator';

// ═══════════════════════════════════════════════════════════
// BULLISH FLAG LIMIT DETECTION
// ═══════════════════════════════════════════════════════════

/**
 * Detect Bullish Flag Limit (UPU with 1-2 candle base)
 * @param {Array} candles - OHLCV candles
 * @param {Object} options - Detection options
 * @returns {Object|null} Flag Limit zone or null
 */
export const detectBullishFlagLimit = (candles, options = {}) => {
  const {
    minUpMovePercent = FLAG_LIMIT_CONFIG.minMovePercent,
    maxPauseCandles = FLAG_LIMIT_CONFIG.maxBaseCandleCount,
    minContinuationPercent = FLAG_LIMIT_CONFIG.minContinuationPercent,
  } = options;

  if (!candles || candles.length < 10) {
    return null;
  }

  const currentPrice = candles[candles.length - 1].close;
  const results = [];

  // Look for UPU pattern with short base
  for (let i = candles.length - 5; i >= 5; i--) {
    // Try different pause lengths (1 or 2 candles)
    for (let pauseLength = 1; pauseLength <= maxPauseCandles; pauseLength++) {
      const pauseEnd = i;
      const pauseStart = i - pauseLength + 1;

      if (pauseStart < 3) continue;

      const pauseCandles = candles.slice(pauseStart, pauseEnd + 1);
      const pauseHigh = Math.max(...pauseCandles.map(c => c.high));
      const pauseLow = Math.min(...pauseCandles.map(c => c.low));

      // Check UP before pause
      const beforePause = candles.slice(Math.max(0, pauseStart - 5), pauseStart);
      if (beforePause.length < 3) continue;

      const upMoveStart = Math.min(...beforePause.map(c => c.low));
      const upMoveEnd = beforePause[beforePause.length - 1].high;
      const upMovePercent = ((upMoveEnd - upMoveStart) / upMoveStart) * 100;

      if (upMovePercent < minUpMovePercent) continue;

      // Check UP after pause (continuation)
      const afterPause = candles.slice(pauseEnd + 1);
      if (afterPause.length < 2) continue;

      const highAfterPause = Math.max(...afterPause.map(c => c.high));
      const continuationPercent = ((highAfterPause - pauseHigh) / pauseHigh) * 100;

      if (continuationPercent < minContinuationPercent) continue;

      // Verify it's truly a FLAG (not just consolidation)
      // Flag should have minimal price range
      const pauseRange = pauseHigh - pauseLow;
      const avgCandleRange =
        candles.slice(-20).reduce((sum, c) => sum + (c.high - c.low), 0) / 20;

      if (pauseRange > avgCandleRange * 2) continue; // Pause too large

      // Calculate zone
      const zone = calculateZoneBoundaries(pauseCandles, 'LFZ', currentPrice);
      if (!zone) continue;

      results.push({
        pattern: 'FLAG_LIMIT_BULLISH',
        patternCategory: 'flag_limit',
        isFlagLimit: true,
        zoneHierarchy: 'FLAG_LIMIT',
        zoneHierarchyLevel: 3,
        hierarchyConfig: ZONE_HIERARCHY.FLAG_LIMIT,

        // Zone info
        ...zone,

        // FL specific
        upperFlagLimit: pauseHigh,
        lowerFlagLimit: pauseLow,
        baseCandleCount: pauseLength,
        pauseCandleCount: pauseLength,

        // Movement info
        upMoveBeforePause: parseFloat(upMovePercent.toFixed(2)),
        continuationAfterPause: parseFloat(continuationPercent.toFixed(2)),

        // Structure
        structure: {
          upMoveStart,
          upMoveEnd,
          pauseStartIndex: pauseStart,
          pauseEndIndex: pauseEnd,
          continuationHigh: highAfterPause,
        },

        zoneType: 'LFZ',
        tradingBias: 'BUY',
        isValid: true,
        confidence: Math.min(85, 70 + upMovePercent * 2),
        detectedAt: new Date().toISOString(),
      });
    }
  }

  // Return best result (highest confidence)
  if (results.length > 0) {
    return results.sort((a, b) => b.confidence - a.confidence)[0];
  }

  return null;
};

// ═══════════════════════════════════════════════════════════
// BEARISH FLAG LIMIT DETECTION
// ═══════════════════════════════════════════════════════════

/**
 * Detect Bearish Flag Limit (DPD with 1-2 candle base)
 * @param {Array} candles - OHLCV candles
 * @param {Object} options - Detection options
 * @returns {Object|null} Flag Limit zone or null
 */
export const detectBearishFlagLimit = (candles, options = {}) => {
  const {
    minDownMovePercent = FLAG_LIMIT_CONFIG.minMovePercent,
    maxPauseCandles = FLAG_LIMIT_CONFIG.maxBaseCandleCount,
    minContinuationPercent = FLAG_LIMIT_CONFIG.minContinuationPercent,
  } = options;

  if (!candles || candles.length < 10) {
    return null;
  }

  const currentPrice = candles[candles.length - 1].close;
  const results = [];

  for (let i = candles.length - 5; i >= 5; i--) {
    for (let pauseLength = 1; pauseLength <= maxPauseCandles; pauseLength++) {
      const pauseEnd = i;
      const pauseStart = i - pauseLength + 1;

      if (pauseStart < 3) continue;

      const pauseCandles = candles.slice(pauseStart, pauseEnd + 1);
      const pauseHigh = Math.max(...pauseCandles.map(c => c.high));
      const pauseLow = Math.min(...pauseCandles.map(c => c.low));

      // Check DOWN before pause
      const beforePause = candles.slice(Math.max(0, pauseStart - 5), pauseStart);
      if (beforePause.length < 3) continue;

      const downMoveStart = Math.max(...beforePause.map(c => c.high));
      const downMoveEnd = beforePause[beforePause.length - 1].low;
      const downMovePercent = ((downMoveStart - downMoveEnd) / downMoveStart) * 100;

      if (downMovePercent < minDownMovePercent) continue;

      // Check DOWN after pause
      const afterPause = candles.slice(pauseEnd + 1);
      if (afterPause.length < 2) continue;

      const lowAfterPause = Math.min(...afterPause.map(c => c.low));
      const continuationPercent = ((pauseLow - lowAfterPause) / pauseLow) * 100;

      if (continuationPercent < minContinuationPercent) continue;

      // Verify small pause range
      const pauseRange = pauseHigh - pauseLow;
      const avgCandleRange =
        candles.slice(-20).reduce((sum, c) => sum + (c.high - c.low), 0) / 20;

      if (pauseRange > avgCandleRange * 2) continue;

      const zone = calculateZoneBoundaries(pauseCandles, 'HFZ', currentPrice);
      if (!zone) continue;

      results.push({
        pattern: 'FLAG_LIMIT_BEARISH',
        patternCategory: 'flag_limit',
        isFlagLimit: true,
        zoneHierarchy: 'FLAG_LIMIT',
        zoneHierarchyLevel: 3,
        hierarchyConfig: ZONE_HIERARCHY.FLAG_LIMIT,

        ...zone,

        upperFlagLimit: pauseHigh,
        lowerFlagLimit: pauseLow,
        baseCandleCount: pauseLength,
        pauseCandleCount: pauseLength,

        downMoveBeforePause: parseFloat(downMovePercent.toFixed(2)),
        continuationAfterPause: parseFloat(continuationPercent.toFixed(2)),

        structure: {
          downMoveStart,
          downMoveEnd,
          pauseStartIndex: pauseStart,
          pauseEndIndex: pauseEnd,
          continuationLow: lowAfterPause,
        },

        zoneType: 'HFZ',
        tradingBias: 'SELL',
        isValid: true,
        confidence: Math.min(85, 70 + downMovePercent * 2),
        detectedAt: new Date().toISOString(),
      });
    }
  }

  if (results.length > 0) {
    return results.sort((a, b) => b.confidence - a.confidence)[0];
  }

  return null;
};

// ═══════════════════════════════════════════════════════════
// COMBINED DETECTION
// ═══════════════════════════════════════════════════════════

/**
 * Detect any Flag Limit pattern
 * @param {Array} candles - OHLCV candles
 * @param {Object} options - Detection options
 * @returns {Array|null} Array of Flag Limit zones or null
 */
export const detectFlagLimit = (candles, options = {}) => {
  const bullishFL = detectBullishFlagLimit(candles, options);
  const bearishFL = detectBearishFlagLimit(candles, options);

  const results = [];
  if (bullishFL) results.push(bullishFL);
  if (bearishFL) results.push(bearishFL);

  return results.length > 0 ? results : null;
};

// ═══════════════════════════════════════════════════════════
// VALIDATION
// ═══════════════════════════════════════════════════════════

/**
 * Check if a zone qualifies as Flag Limit
 * @param {Object} zone - Zone object
 * @returns {boolean}
 */
export const isValidFlagLimit = (zone) => {
  if (!zone) return false;

  // Must have 1-2 candle base
  const pauseCount = zone.pauseCandleCount || zone.baseCandleCount;
  if (pauseCount > FLAG_LIMIT_CONFIG.maxBaseCandleCount) return false;

  // Must be continuation pattern (UPU or DPD)
  const pattern = zone.pattern?.toUpperCase() || '';
  const validPatterns = [
    ...FLAG_LIMIT_CONFIG.validPatterns,
    'FLAG_LIMIT_BULLISH',
    'FLAG_LIMIT_BEARISH',
  ];

  if (!validPatterns.some(p => pattern.includes(p))) {
    return false;
  }

  return true;
};

/**
 * Convert regular zone to Flag Limit if valid
 * @param {Object} zone - Regular zone
 * @returns {Object} Zone with FL classification if valid
 */
export const classifyAsFlagLimit = (zone) => {
  if (!zone) return zone;

  if (isValidFlagLimit(zone)) {
    return {
      ...zone,
      isFlagLimit: true,
      zoneHierarchy: 'FLAG_LIMIT',
      zoneHierarchyLevel: 3,
      hierarchyConfig: ZONE_HIERARCHY.FLAG_LIMIT,
    };
  }

  return zone;
};

// ═══════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════

export default {
  detectBullishFlagLimit,
  detectBearishFlagLimit,
  detectFlagLimit,
  isValidFlagLimit,
  classifyAsFlagLimit,
};
