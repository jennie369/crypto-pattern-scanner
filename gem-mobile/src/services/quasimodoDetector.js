/**
 * GEM Mobile - Quasimodo (QM) Pattern Detector
 * Detects Quasimodo reversal patterns
 *
 * Phase 1B: Quasimodo Detection
 *
 * Quasimodo Structure (Bearish):
 *         HEAD (Highest High)
 *          /\
 *    LS   /  \    RS
 *    /\  /    \   /\
 *   /  \/      \ /  \
 *  /   HL1     \/    \
 *              LL      → BOS (Lower Low)
 *
 * QML = HL1 (Higher Low before head) - Entry Point
 * MPL = HEAD - Invalidation Level
 */

import {
  findSwingHighs,
  findSwingLows,
  getAllSwingPoints,
  identifyTrend,
  identifyTrendFromCandles,
  detectBOS,
  findHighestHigh,
  findLowestLow,
} from './structureAnalysis';
import { getAdvancedPatternConfig } from '../constants/advancedPatternConfig';

// ═══════════════════════════════════════════════════════════
// BEARISH QUASIMODO DETECTION
// ═══════════════════════════════════════════════════════════

/**
 * Detect Bearish Quasimodo Pattern
 *
 * @param {Array} candles - OHLCV candles
 * @param {Object} options - Detection options
 * @returns {Object|null} QM pattern or null
 */
export const detectBearishQM = (candles, options = {}) => {
  const {
    lookback = 3,
    minQMLtoMPLRatio = 0.3, // Minimum % distance from QML to MPL
    minCandlesForTrend = 20, // Minimum candles to establish trend
  } = options;

  if (!candles || candles.length < 50) {
    console.log('[QMDetector] Not enough candles for bearish QM');
    return null;
  }

  try {
    // Get swing points
    const swingPoints = getAllSwingPoints(candles, lookback);
    const highs = swingPoints.filter(s => s.type === 'swing_high');
    const lows = swingPoints.filter(s => s.type === 'swing_low');

    if (highs.length < 3 || lows.length < 2) {
      return null;
    }

    // Check for prior uptrend
    const earlierSwings = swingPoints.slice(0, Math.max(4, swingPoints.length - 4));
    const trendAnalysis = identifyTrend(earlierSwings);

    // Also check candle-based trend
    const candleTrend = identifyTrendFromCandles(
      candles.slice(0, -10),
      minCandlesForTrend
    );

    if (trendAnalysis.trend !== 'uptrend' && candleTrend.trend !== 'uptrend') {
      return null; // No prior uptrend
    }

    // Find HEAD (highest high in recent swings)
    const recentStartIndex = Math.max(0, swingPoints.length - 15);
    const head = findHighestHigh(swingPoints, candles.length - 30, candles.length);

    if (!head) {
      return null;
    }

    // Find Left Shoulder (swing high before head)
    const leftShoulderCandidates = highs
      .filter(h => h.index < head.index && h.price < head.price)
      .sort((a, b) => b.index - a.index);

    const leftShoulder = leftShoulderCandidates[0];

    if (!leftShoulder) {
      return null;
    }

    // Find HL1 (Higher Low between LS and Head) - This is QML
    const hl1Candidates = lows
      .filter(l => l.index > leftShoulder.index && l.index < head.index)
      .sort((a, b) => b.price - a.price); // Highest low first

    const hl1 = hl1Candidates[0];

    if (!hl1) {
      return null;
    }

    // Find Right Shoulder (swing high after head, lower than head)
    const rightShoulderCandidates = highs
      .filter(h => h.index > head.index && h.price < head.price)
      .sort((a, b) => a.index - b.index);

    const rightShoulder = rightShoulderCandidates[0];

    // Find BOS (Lower Low after head - breaks below HL1)
    const bosCandidates = lows
      .filter(l => l.index > head.index && l.price < hl1.price)
      .sort((a, b) => a.index - b.index);

    const bos = bosCandidates[0];

    if (!bos) {
      // No BOS confirmation yet - pattern not complete
      return null;
    }

    // Calculate QML and MPL
    const qmlPrice = hl1.price;
    const mplPrice = head.price;
    const currentPrice = candles[candles.length - 1].close;

    // Validate QML to MPL distance (should be significant)
    const qmlToMPLDistance = mplPrice - qmlPrice;
    const qmlToMPLRatio = (qmlToMPLDistance / currentPrice) * 100;

    if (qmlToMPLRatio < minQMLtoMPLRatio) {
      return null; // QML too close to MPL
    }

    // Check if price is above QML (opportunity exists)
    if (currentPrice < qmlPrice * 0.98) {
      return null; // Price already below QML, missed the trade
    }

    // Calculate stop loss with buffer
    const stopLossBuffer = qmlToMPLDistance * 0.02; // 2% of zone
    const stopLossPrice = mplPrice + stopLossBuffer;

    // Calculate target (using 1:2 R:R minimum)
    const riskAmount = stopLossPrice - qmlPrice;
    const targetPrice = qmlPrice - riskAmount * 2;

    const config = getAdvancedPatternConfig('QUASIMODO_BEARISH');

    // ✅ FIX: Extract timestamps for zone positioning on chart
    // QML zone starts at hl1 (the higher low before head)
    let startTime = hl1.timestamp || candles[hl1.index]?.time;
    let endTime = head.timestamp || candles[head.index]?.time;
    if (startTime && startTime > 9999999999) startTime = Math.floor(startTime / 1000);
    if (endTime && endTime > 9999999999) endTime = Math.floor(endTime / 1000);

    return {
      pattern: 'QUASIMODO_BEARISH',
      patternType: 'QUASIMODO_BEARISH',
      config,

      // ✅ FIX: Time fields for zone chart positioning
      startTime,
      endTime,
      formationTime: startTime,
      startCandleIndex: hl1.index,
      endCandleIndex: head.index,

      // Key levels
      qmlPrice,
      mplPrice,
      entryPrice: qmlPrice,
      stopLossPrice,
      targetPrice,

      // Zone boundaries (compatible with Phase 1A)
      zone: {
        entryPrice: qmlPrice,
        stopPrice: mplPrice,
        stopLossPrice,
        zoneWidth: qmlToMPLDistance,
        zoneWidthPercent: parseFloat(qmlToMPLRatio.toFixed(2)),
      },

      // Structure points
      leftShoulder: {
        price: leftShoulder.price,
        index: leftShoulder.index,
        timestamp: leftShoulder.timestamp,
      },
      head: {
        price: head.price,
        index: head.index,
        timestamp: head.timestamp,
      },
      rightShoulder: rightShoulder
        ? {
            price: rightShoulder.price,
            index: rightShoulder.index,
            timestamp: rightShoulder.timestamp,
          }
        : null,
      hl1: {
        price: hl1.price,
        index: hl1.index,
        timestamp: hl1.timestamp,
      },
      bos: {
        price: bos.price,
        index: bos.index,
        timestamp: bos.timestamp,
        confirmed: true,
      },

      // Analysis
      qmlToMPLDistance,
      qmlToMPLPercent: parseFloat(qmlToMPLRatio.toFixed(2)),
      distanceToQML: currentPrice - qmlPrice,
      distanceToQMLPercent: parseFloat(
        (((currentPrice - qmlPrice) / currentPrice) * 100).toFixed(2)
      ),

      // Trend context
      priorTrend: {
        swing: trendAnalysis,
        candle: candleTrend,
      },

      // Risk/Reward
      riskReward: {
        risk: riskAmount,
        reward: riskAmount * 2,
        ratio: 2.0,
        ratioDisplay: '1:2',
        isAcceptable: true,
      },

      // Trading info
      zoneType: 'HFZ',
      tradingBias: 'SELL',
      category: 'quasimodo',
      strength: 5,
      stars: 5,
      winRate: config?.winRate || 0.75,
      isValid: true,
      currentPrice,
      detectedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('[QMDetector] Bearish QM error:', error);
    return null;
  }
};

// ═══════════════════════════════════════════════════════════
// BULLISH QUASIMODO DETECTION
// ═══════════════════════════════════════════════════════════

/**
 * Detect Bullish Quasimodo Pattern
 *
 * Structure (inverted):
 *              HH      → BOS (Higher High)
 *              /\
 *   \    /\   /  \
 *    \  /  \ /    \
 *     \/    \/     \
 *    LH1   HEAD
 *    (QML) (Lowest Low)
 *
 * @param {Array} candles - OHLCV candles
 * @param {Object} options - Detection options
 * @returns {Object|null} QM pattern or null
 */
export const detectBullishQM = (candles, options = {}) => {
  const {
    lookback = 3,
    minQMLtoMPLRatio = 0.3,
    minCandlesForTrend = 20,
  } = options;

  if (!candles || candles.length < 50) {
    return null;
  }

  try {
    const swingPoints = getAllSwingPoints(candles, lookback);
    const highs = swingPoints.filter(s => s.type === 'swing_high');
    const lows = swingPoints.filter(s => s.type === 'swing_low');

    if (highs.length < 2 || lows.length < 3) {
      return null;
    }

    // Check for prior downtrend
    const earlierSwings = swingPoints.slice(0, Math.max(4, swingPoints.length - 4));
    const trendAnalysis = identifyTrend(earlierSwings);
    const candleTrend = identifyTrendFromCandles(
      candles.slice(0, -10),
      minCandlesForTrend
    );

    if (trendAnalysis.trend !== 'downtrend' && candleTrend.trend !== 'downtrend') {
      return null;
    }

    // Find HEAD (lowest low in recent swings)
    const head = findLowestLow(swingPoints, candles.length - 30, candles.length);

    if (!head) {
      return null;
    }

    // Find Left Shoulder (swing low before head)
    const leftShoulderCandidates = lows
      .filter(l => l.index < head.index && l.price > head.price)
      .sort((a, b) => b.index - a.index);

    const leftShoulder = leftShoulderCandidates[0];

    if (!leftShoulder) {
      return null;
    }

    // Find LH1 (Lower High between LS and Head) - This is QML
    const lh1Candidates = highs
      .filter(h => h.index > leftShoulder.index && h.index < head.index)
      .sort((a, b) => a.price - b.price); // Lowest high first

    const lh1 = lh1Candidates[0];

    if (!lh1) {
      return null;
    }

    // Find Right Shoulder (swing low after head, higher than head)
    const rightShoulderCandidates = lows
      .filter(l => l.index > head.index && l.price > head.price)
      .sort((a, b) => a.index - b.index);

    const rightShoulder = rightShoulderCandidates[0];

    // Find BOS (Higher High after head - breaks above LH1)
    const bosCandidates = highs
      .filter(h => h.index > head.index && h.price > lh1.price)
      .sort((a, b) => a.index - b.index);

    const bos = bosCandidates[0];

    if (!bos) {
      return null;
    }

    const qmlPrice = lh1.price;
    const mplPrice = head.price;
    const currentPrice = candles[candles.length - 1].close;

    const qmlToMPLDistance = qmlPrice - mplPrice;
    const qmlToMPLRatio = (qmlToMPLDistance / currentPrice) * 100;

    if (qmlToMPLRatio < minQMLtoMPLRatio) {
      return null;
    }

    // Check if price is below QML
    if (currentPrice > qmlPrice * 1.02) {
      return null;
    }

    const stopLossBuffer = qmlToMPLDistance * 0.02;
    const stopLossPrice = mplPrice - stopLossBuffer;

    const riskAmount = qmlPrice - stopLossPrice;
    const targetPrice = qmlPrice + riskAmount * 2;

    const config = getAdvancedPatternConfig('QUASIMODO_BULLISH');

    // ✅ FIX: Extract timestamps for zone positioning on chart
    // QML zone starts at lh1 (the lower high before head)
    let startTime = lh1.timestamp || candles[lh1.index]?.time;
    let endTime = head.timestamp || candles[head.index]?.time;
    if (startTime && startTime > 9999999999) startTime = Math.floor(startTime / 1000);
    if (endTime && endTime > 9999999999) endTime = Math.floor(endTime / 1000);

    return {
      pattern: 'QUASIMODO_BULLISH',
      patternType: 'QUASIMODO_BULLISH',
      config,

      // ✅ FIX: Time fields for zone chart positioning
      startTime,
      endTime,
      formationTime: startTime,
      startCandleIndex: lh1.index,
      endCandleIndex: head.index,

      qmlPrice,
      mplPrice,
      entryPrice: qmlPrice,
      stopLossPrice,
      targetPrice,

      zone: {
        entryPrice: qmlPrice,
        stopPrice: mplPrice,
        stopLossPrice,
        zoneWidth: qmlToMPLDistance,
        zoneWidthPercent: parseFloat(qmlToMPLRatio.toFixed(2)),
      },

      leftShoulder: {
        price: leftShoulder.price,
        index: leftShoulder.index,
        timestamp: leftShoulder.timestamp,
      },
      head: {
        price: head.price,
        index: head.index,
        timestamp: head.timestamp,
      },
      rightShoulder: rightShoulder
        ? {
            price: rightShoulder.price,
            index: rightShoulder.index,
            timestamp: rightShoulder.timestamp,
          }
        : null,
      lh1: {
        price: lh1.price,
        index: lh1.index,
        timestamp: lh1.timestamp,
      },
      bos: {
        price: bos.price,
        index: bos.index,
        timestamp: bos.timestamp,
        confirmed: true,
      },

      qmlToMPLDistance,
      qmlToMPLPercent: parseFloat(qmlToMPLRatio.toFixed(2)),
      distanceToQML: qmlPrice - currentPrice,
      distanceToQMLPercent: parseFloat(
        (((qmlPrice - currentPrice) / currentPrice) * 100).toFixed(2)
      ),

      priorTrend: {
        swing: trendAnalysis,
        candle: candleTrend,
      },

      riskReward: {
        risk: riskAmount,
        reward: riskAmount * 2,
        ratio: 2.0,
        ratioDisplay: '1:2',
        isAcceptable: true,
      },

      zoneType: 'LFZ',
      tradingBias: 'BUY',
      category: 'quasimodo',
      strength: 5,
      stars: 5,
      winRate: config?.winRate || 0.73,
      isValid: true,
      currentPrice,
      detectedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('[QMDetector] Bullish QM error:', error);
    return null;
  }
};

// ═══════════════════════════════════════════════════════════
// MAIN DETECTION FUNCTION
// ═══════════════════════════════════════════════════════════

/**
 * Detect any QM pattern (bearish or bullish)
 * @param {Array} candles - OHLCV candles
 * @param {Object} options - Detection options
 * @returns {Object|null} Best QM pattern found
 */
export const detectQuasimodo = (candles, options = {}) => {
  const bearishQM = detectBearishQM(candles, options);
  const bullishQM = detectBullishQM(candles, options);

  // Return the more recent/stronger pattern
  if (bearishQM && bullishQM) {
    // Return the one with larger QML to MPL distance (stronger pattern)
    return bearishQM.qmlToMPLDistance > bullishQM.qmlToMPLDistance
      ? bearishQM
      : bullishQM;
  }

  return bearishQM || bullishQM || null;
};

/**
 * Detect all QM patterns (returns array)
 * @param {Array} candles - OHLCV candles
 * @param {Object} options - Detection options
 * @returns {Array} Array of QM patterns found
 */
export const detectAllQuasimodo = (candles, options = {}) => {
  const patterns = [];

  const bearishQM = detectBearishQM(candles, options);
  if (bearishQM) patterns.push(bearishQM);

  const bullishQM = detectBullishQM(candles, options);
  if (bullishQM) patterns.push(bullishQM);

  // Sort by QML to MPL distance (larger = stronger)
  return patterns.sort((a, b) => b.qmlToMPLDistance - a.qmlToMPLDistance);
};

/**
 * Check if price is approaching QML
 * @param {Object} qmPattern - QM pattern object
 * @param {number} currentPrice - Current market price
 * @param {number} thresholdPercent - Approaching threshold (default 2%)
 * @returns {Object} Approach status
 */
export const checkQMLApproach = (qmPattern, currentPrice, thresholdPercent = 2) => {
  if (!qmPattern || !qmPattern.qmlPrice) {
    return { isApproaching: false };
  }

  const { qmlPrice, tradingBias } = qmPattern;
  const distancePercent = Math.abs(currentPrice - qmlPrice) / currentPrice * 100;
  const isApproaching = distancePercent <= thresholdPercent;

  let approachDirection;
  if (tradingBias === 'SELL') {
    approachDirection = currentPrice > qmlPrice ? 'from_above' : 'from_below';
  } else {
    approachDirection = currentPrice < qmlPrice ? 'from_below' : 'from_above';
  }

  return {
    isApproaching,
    distancePercent: parseFloat(distancePercent.toFixed(2)),
    approachDirection,
    isInZone: distancePercent <= 0.5,
    readyToTrade: isApproaching && approachDirection === (tradingBias === 'SELL' ? 'from_below' : 'from_above'),
  };
};

// ═══════════════════════════════════════════════════════════
// DEFAULT EXPORT
// ═══════════════════════════════════════════════════════════

const quasimodoDetector = {
  detectBearishQM,
  detectBullishQM,
  detectQuasimodo,
  detectAllQuasimodo,
  checkQMLApproach,
};

export default quasimodoDetector;
