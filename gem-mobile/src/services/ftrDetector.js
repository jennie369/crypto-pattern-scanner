/**
 * GEM Mobile - FTR (Fail To Return) Zone Detector
 * Detects FTR continuation zones after S/R breaks
 *
 * Phase 1B: FTR Detection
 *
 * FTR Structure (Bullish):
 *                          New High 2
 *                             ↗
 *   ═══════════════════════════════ Resistance (broken)
 *              ↑            /
 *   New High 1 │    ┌──────┐
 *              │    │ BASE │ ← FTR ZONE
 *              │    └──────┘
 *              │       /
 *             /       /
 *   ═══════════════════════ Previous Support
 */

import {
  findSwingHighs,
  findSwingLows,
  getAllSwingPoints,
} from './structureAnalysis';
import { getAdvancedPatternConfig } from '../constants/advancedPatternConfig';
import { calculateZoneBoundaries } from './zoneCalculator';

// ═══════════════════════════════════════════════════════════
// BULLISH FTR DETECTION
// ═══════════════════════════════════════════════════════════

/**
 * Detect Bullish FTR Zone
 *
 * @param {Array} candles - OHLCV candles
 * @param {Object} options - Detection options
 * @returns {Object|null} FTR zone or null
 */
export const detectBullishFTR = (candles, options = {}) => {
  const {
    lookback = 3,
    minBreakDistance = 0.5, // % above resistance
    maxReturnPercent = 30, // Base must stay above this % of break distance
  } = options;

  if (!candles || candles.length < 30) {
    return null;
  }

  try {
    const swingHighs = findSwingHighs(candles, lookback);
    const swingLows = findSwingLows(candles, lookback);

    if (swingHighs.length < 3) {
      return null;
    }

    const recentHighs = swingHighs.slice(-5);

    // Find potential resistance level and break high
    for (let i = recentHighs.length - 1; i >= 2; i--) {
      const potentialBreakHigh = recentHighs[i];
      const potentialResistance = recentHighs[i - 1];

      // Check if break high is above resistance
      if (potentialBreakHigh.price <= potentialResistance.price) {
        continue;
      }

      const breakDistance = potentialBreakHigh.price - potentialResistance.price;
      const breakPercent = (breakDistance / potentialResistance.price) * 100;

      if (breakPercent < minBreakDistance) {
        continue; // Not a significant break
      }

      // Find the base (pullback after break that didn't return to resistance)
      const baseLows = swingLows.filter(
        l =>
          l.index > potentialBreakHigh.index &&
          l.price > potentialResistance.price // Must stay above resistance (Fail To Return)
      );

      if (baseLows.length === 0) {
        continue; // No base formed yet or returned to resistance
      }

      const baseLowest = baseLows.reduce(
        (min, l) => (l.price < min.price ? l : min),
        baseLows[0]
      );

      // Verify it's truly FTR (base stayed above resistance)
      const returnDistance = potentialBreakHigh.price - baseLowest.price;
      const returnPercent = (returnDistance / breakDistance) * 100;

      if (returnPercent > maxReturnPercent) {
        continue; // Returned too much, not a clean FTR
      }

      // Check for confirmation (new high after base)
      const confirmingHighs = swingHighs.filter(
        h => h.index > baseLowest.index && h.price > potentialBreakHigh.price
      );

      if (confirmingHighs.length === 0) {
        continue; // No confirmation yet
      }

      // Extract base candles for zone calculation
      const baseStartIndex = potentialBreakHigh.index;
      const baseEndIndex = baseLowest.index;
      const baseCandles = candles.slice(baseStartIndex, baseEndIndex + 1);

      if (baseCandles.length < 2) {
        continue;
      }

      const currentPrice = candles[candles.length - 1].close;
      const zone = calculateZoneBoundaries(baseCandles, 'LFZ', currentPrice);

      if (!zone) continue;

      const config = getAdvancedPatternConfig('FTR_BULLISH');

      // ✅ FIX: Extract timestamps for zone positioning on chart
      let startTime = candles[baseStartIndex]?.time || candles[baseStartIndex]?.timestamp;
      let endTime = candles[baseEndIndex]?.time || candles[baseEndIndex]?.timestamp;
      if (startTime && startTime > 9999999999) startTime = Math.floor(startTime / 1000);
      if (endTime && endTime > 9999999999) endTime = Math.floor(endTime / 1000);

      return {
        pattern: 'FTR_BULLISH',
        patternType: 'FTR_BULLISH',
        config,
        isFTR: true,
        category: 'ftr',

        // ✅ FIX: Time fields for zone chart positioning
        startTime,
        endTime,
        formationTime: startTime,
        startCandleIndex: baseStartIndex,
        endCandleIndex: baseEndIndex,

        // Zone info (compatible with Phase 1A)
        ...zone,
        zone: {
          entryPrice: zone.entryPrice,
          stopPrice: zone.stopPrice,
          stopLossPrice: zone.stopLossPrice,
          zoneWidth: zone.zoneWidth,
          zoneWidthPercent: zone.zoneWidthPercent,
        },

        // FTR specific
        resistanceLevel: potentialResistance.price,
        breakHigh: potentialBreakHigh.price,
        baseLowest: baseLowest.price,
        confirmationHigh: confirmingHighs[0].price,

        // Analysis
        breakDistance,
        breakPercent: parseFloat(breakPercent.toFixed(2)),
        returnPercent: parseFloat(returnPercent.toFixed(2)),

        // Structure
        structure: {
          resistance: {
            price: potentialResistance.price,
            index: potentialResistance.index,
            timestamp: potentialResistance.timestamp,
          },
          breakPoint: {
            price: potentialBreakHigh.price,
            index: potentialBreakHigh.index,
            timestamp: potentialBreakHigh.timestamp,
          },
          base: {
            start: baseStartIndex,
            end: baseEndIndex,
            lowest: {
              price: baseLowest.price,
              index: baseLowest.index,
              timestamp: baseLowest.timestamp,
            },
          },
          confirmation: {
            price: confirmingHighs[0].price,
            index: confirmingHighs[0].index,
            timestamp: confirmingHighs[0].timestamp,
          },
        },

        // Distance to zone
        distanceToEntry: zone.entryPrice - currentPrice,
        distanceToEntryPercent: parseFloat(
          (((zone.entryPrice - currentPrice) / currentPrice) * 100).toFixed(2)
        ),

        // Trading info
        zoneType: 'LFZ',
        tradingBias: 'BUY',
        strength: 4,
        stars: 4,
        winRate: config?.winRate || 0.68,
        isValid: true,
        currentPrice,
        detectedAt: new Date().toISOString(),
      };
    }

    return null;
  } catch (error) {
    console.error('[FTRDetector] Bullish FTR error:', error);
    return null;
  }
};

// ═══════════════════════════════════════════════════════════
// BEARISH FTR DETECTION
// ═══════════════════════════════════════════════════════════

/**
 * Detect Bearish FTR Zone
 *
 * Structure (inverted):
 *   ═══════════════════════ Previous Resistance
 *             \       \
 *              \       \
 *               │    └──────┘
 *               │    │ BASE │ ← FTR ZONE
 *               │    └──────┘
 *   New Low 1   │       \
 *               ↓        \
 *   ═══════════════════════════════ Support (broken)
 *                        \
 *                         ↘
 *                      New Low 2
 *
 * @param {Array} candles - OHLCV candles
 * @param {Object} options - Detection options
 * @returns {Object|null} FTR zone or null
 */
export const detectBearishFTR = (candles, options = {}) => {
  const {
    lookback = 3,
    minBreakDistance = 0.5,
    maxReturnPercent = 30,
  } = options;

  if (!candles || candles.length < 30) {
    return null;
  }

  try {
    const swingHighs = findSwingHighs(candles, lookback);
    const swingLows = findSwingLows(candles, lookback);

    if (swingLows.length < 3) {
      return null;
    }

    const recentLows = swingLows.slice(-5);

    for (let i = recentLows.length - 1; i >= 2; i--) {
      const potentialBreakLow = recentLows[i];
      const potentialSupport = recentLows[i - 1];

      if (potentialBreakLow.price >= potentialSupport.price) {
        continue;
      }

      const breakDistance = potentialSupport.price - potentialBreakLow.price;
      const breakPercent = (breakDistance / potentialSupport.price) * 100;

      if (breakPercent < minBreakDistance) {
        continue;
      }

      // Find base (pullback after break that didn't return to support)
      const baseHighs = swingHighs.filter(
        h =>
          h.index > potentialBreakLow.index &&
          h.price < potentialSupport.price // Must stay below support
      );

      if (baseHighs.length === 0) {
        continue;
      }

      const baseHighest = baseHighs.reduce(
        (max, h) => (h.price > max.price ? h : max),
        baseHighs[0]
      );

      const returnDistance = baseHighest.price - potentialBreakLow.price;
      const returnPercent = (returnDistance / breakDistance) * 100;

      if (returnPercent > maxReturnPercent) {
        continue;
      }

      // Check for confirmation (new low after base)
      const confirmingLows = swingLows.filter(
        l => l.index > baseHighest.index && l.price < potentialBreakLow.price
      );

      if (confirmingLows.length === 0) {
        continue;
      }

      const baseStartIndex = potentialBreakLow.index;
      const baseEndIndex = baseHighest.index;
      const baseCandles = candles.slice(baseStartIndex, baseEndIndex + 1);

      if (baseCandles.length < 2) {
        continue;
      }

      const currentPrice = candles[candles.length - 1].close;
      const zone = calculateZoneBoundaries(baseCandles, 'HFZ', currentPrice);

      if (!zone) continue;

      const config = getAdvancedPatternConfig('FTR_BEARISH');

      // ✅ FIX: Extract timestamps for zone positioning on chart
      let startTime = candles[baseStartIndex]?.time || candles[baseStartIndex]?.timestamp;
      let endTime = candles[baseEndIndex]?.time || candles[baseEndIndex]?.timestamp;
      if (startTime && startTime > 9999999999) startTime = Math.floor(startTime / 1000);
      if (endTime && endTime > 9999999999) endTime = Math.floor(endTime / 1000);

      return {
        pattern: 'FTR_BEARISH',
        patternType: 'FTR_BEARISH',
        config,
        isFTR: true,
        category: 'ftr',

        // ✅ FIX: Time fields for zone chart positioning
        startTime,
        endTime,
        formationTime: startTime,
        startCandleIndex: baseStartIndex,
        endCandleIndex: baseEndIndex,

        ...zone,
        zone: {
          entryPrice: zone.entryPrice,
          stopPrice: zone.stopPrice,
          stopLossPrice: zone.stopLossPrice,
          zoneWidth: zone.zoneWidth,
          zoneWidthPercent: zone.zoneWidthPercent,
        },

        supportLevel: potentialSupport.price,
        breakLow: potentialBreakLow.price,
        baseHighest: baseHighest.price,
        confirmationLow: confirmingLows[0].price,

        breakDistance,
        breakPercent: parseFloat(breakPercent.toFixed(2)),
        returnPercent: parseFloat(returnPercent.toFixed(2)),

        structure: {
          support: {
            price: potentialSupport.price,
            index: potentialSupport.index,
            timestamp: potentialSupport.timestamp,
          },
          breakPoint: {
            price: potentialBreakLow.price,
            index: potentialBreakLow.index,
            timestamp: potentialBreakLow.timestamp,
          },
          base: {
            start: baseStartIndex,
            end: baseEndIndex,
            highest: {
              price: baseHighest.price,
              index: baseHighest.index,
              timestamp: baseHighest.timestamp,
            },
          },
          confirmation: {
            price: confirmingLows[0].price,
            index: confirmingLows[0].index,
            timestamp: confirmingLows[0].timestamp,
          },
        },

        distanceToEntry: currentPrice - zone.entryPrice,
        distanceToEntryPercent: parseFloat(
          (((currentPrice - zone.entryPrice) / currentPrice) * 100).toFixed(2)
        ),

        zoneType: 'HFZ',
        tradingBias: 'SELL',
        strength: 4,
        stars: 4,
        winRate: config?.winRate || 0.66,
        isValid: true,
        currentPrice,
        detectedAt: new Date().toISOString(),
      };
    }

    return null;
  } catch (error) {
    console.error('[FTRDetector] Bearish FTR error:', error);
    return null;
  }
};

// ═══════════════════════════════════════════════════════════
// MAIN DETECTION FUNCTIONS
// ═══════════════════════════════════════════════════════════

/**
 * Detect any FTR zone
 * @param {Array} candles - OHLCV candles
 * @param {Object} options - Detection options
 * @returns {Array|null} Array of FTR zones or null
 */
export const detectFTR = (candles, options = {}) => {
  const bullishFTR = detectBullishFTR(candles, options);
  const bearishFTR = detectBearishFTR(candles, options);

  const results = [];
  if (bullishFTR) results.push(bullishFTR);
  if (bearishFTR) results.push(bearishFTR);

  return results.length > 0 ? results : null;
};

/**
 * Detect all FTR zones (returns array)
 * @param {Array} candles - OHLCV candles
 * @param {Object} options - Detection options
 * @returns {Array} Array of FTR zones found
 */
export const detectAllFTR = (candles, options = {}) => {
  const patterns = [];

  const bullishFTR = detectBullishFTR(candles, options);
  if (bullishFTR) patterns.push(bullishFTR);

  const bearishFTR = detectBearishFTR(candles, options);
  if (bearishFTR) patterns.push(bearishFTR);

  // Sort by break percent (larger break = stronger FTR)
  return patterns.sort((a, b) => b.breakPercent - a.breakPercent);
};

// ═══════════════════════════════════════════════════════════
// FRESHNESS TRACKING
// ═══════════════════════════════════════════════════════════

/**
 * Check FTR freshness (First Time Back tracking)
 * @param {Object} ftrZone - FTR zone object
 * @param {number} currentPrice - Current market price
 * @param {number} testCount - How many times zone has been tested
 * @returns {Object} Freshness status
 */
export const checkFTRFreshness = (ftrZone, currentPrice, testCount = 0) => {
  if (!ftrZone) return null;

  const { entryPrice, pauseLow, pauseHigh, tradingBias } = ftrZone;

  const isFirstTimeBack = testCount === 0;
  const isInZone = currentPrice >= (pauseLow || entryPrice * 0.99) &&
                   currentPrice <= (pauseHigh || entryPrice * 1.01);

  const distanceToEntry = Math.abs(currentPrice - entryPrice);
  const distancePercent = (distanceToEntry / currentPrice) * 100;
  const isApproaching = !isInZone && distancePercent < 1; // Within 1%

  // Determine quality based on test count
  let quality;
  if (testCount === 0) {
    quality = 'excellent';
  } else if (testCount === 1) {
    quality = 'good';
  } else if (testCount === 2) {
    quality = 'fair';
  } else {
    quality = 'stale';
  }

  // Check if approaching from correct direction
  let correctApproach = false;
  if (tradingBias === 'BUY') {
    correctApproach = currentPrice < entryPrice;
  } else {
    correctApproach = currentPrice > entryPrice;
  }

  return {
    isFirstTimeBack,
    isFresh: testCount <= 1,
    isInZone,
    isApproaching,
    correctApproach,
    testCount,
    quality,
    distancePercent: parseFloat(distancePercent.toFixed(2)),
    readyToTrade: isApproaching && correctApproach && testCount <= 1,
  };
};

/**
 * Update zone test count when price enters zone
 * @param {Object} ftrZone - FTR zone object
 * @param {number} currentPrice - Current price
 * @returns {Object} Updated zone with test count
 */
export const updateZoneTestCount = (ftrZone, currentPrice) => {
  if (!ftrZone) return ftrZone;

  const freshness = checkFTRFreshness(ftrZone, currentPrice, ftrZone.testCount || 0);

  if (freshness.isInZone && !ftrZone._lastWasInZone) {
    // Price just entered zone
    return {
      ...ftrZone,
      testCount: (ftrZone.testCount || 0) + 1,
      lastTestAt: new Date().toISOString(),
      firstTestAt: ftrZone.firstTestAt || new Date().toISOString(),
      _lastWasInZone: true,
    };
  } else if (!freshness.isInZone) {
    return {
      ...ftrZone,
      _lastWasInZone: false,
    };
  }

  return ftrZone;
};

// ═══════════════════════════════════════════════════════════
// DEFAULT EXPORT
// ═══════════════════════════════════════════════════════════

const ftrDetector = {
  detectBullishFTR,
  detectBearishFTR,
  detectFTR,
  detectAllFTR,
  checkFTRFreshness,
  updateZoneTestCount,
};

export default ftrDetector;
