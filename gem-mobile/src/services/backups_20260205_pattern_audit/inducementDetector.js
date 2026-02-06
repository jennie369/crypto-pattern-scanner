/**
 * GEM Mobile - Inducement Detector Service
 * Detect inducement/stop hunt/liquidity grab patterns
 *
 * Phase 2C: Compression + Inducement + Look Right
 *
 * Inducement = Fake breakout to grab liquidity before real move
 *
 * Also known as:
 * - Stop Hunt
 * - Liquidity Grab
 * - Fake Breakout
 * - Spring/Upthrust (Wyckoff)
 *
 * What happens:
 * 1. Price breaks obvious S/R level briefly
 * 2. Triggers stop losses of traders
 * 3. Smart Money absorbs liquidity
 * 4. Price reverses sharply in opposite direction
 */

import { findSwingHighs, findSwingLows } from './structureAnalysis';

// ═══════════════════════════════════════════════════════════
// MAIN INDUCEMENT DETECTION
// ═══════════════════════════════════════════════════════════

/**
 * Detect inducement near a zone
 * @param {Array} candles - OHLCV candles
 * @param {Object} zone - Target zone
 * @param {Object} options - Detection options
 * @returns {Object|null} Inducement result or null
 */
export const detectInducement = (candles, zone, options = {}) => {
  const {
    lookback = 20,
    minWickPercent = 50, // Wick should be > 50% of candle range
    maxBodyPercent = 30, // Body should be < 30% of range
  } = options;

  if (!candles || candles.length < lookback || !zone) {
    return null;
  }

  const recentCandles = candles.slice(-lookback);
  const zoneHigh = Math.max(zone.entryPrice, zone.stopPrice);
  const zoneLow = Math.min(zone.entryPrice, zone.stopPrice);

  // Look for inducement candles
  for (let i = recentCandles.length - 1; i >= 0; i--) {
    const candle = recentCandles[i];
    const range = candle.high - candle.low;
    if (range === 0) continue;

    const body = Math.abs(candle.close - candle.open);
    const bodyPercent = (body / range) * 100;

    // For LFZ (demand) - look for wick below zone then close above
    if (zone.zoneType === 'LFZ') {
      const lowerWick = Math.min(candle.open, candle.close) - candle.low;
      const lowerWickPercent = (lowerWick / range) * 100;

      // Check if candle wicked below zone but closed above
      if (candle.low < zoneLow &&
          candle.close > zoneLow &&
          lowerWickPercent >= minWickPercent &&
          bodyPercent <= maxBodyPercent) {

        return createInducementResult(candle, zone, 'bullish_inducement', i, recentCandles);
      }
    }

    // For HFZ (supply) - look for wick above zone then close below
    if (zone.zoneType === 'HFZ') {
      const upperWick = candle.high - Math.max(candle.open, candle.close);
      const upperWickPercent = (upperWick / range) * 100;

      // Check if candle wicked above zone but closed below
      if (candle.high > zoneHigh &&
          candle.close < zoneHigh &&
          upperWickPercent >= minWickPercent &&
          bodyPercent <= maxBodyPercent) {

        return createInducementResult(candle, zone, 'bearish_inducement', i, recentCandles);
      }
    }
  }

  return null;
};

// ═══════════════════════════════════════════════════════════
// RESULT CREATION
// ═══════════════════════════════════════════════════════════

/**
 * Create inducement result object
 * @param {Object} candle - Inducement candle
 * @param {Object} zone - Target zone
 * @param {string} type - Inducement type
 * @param {number} index - Candle index
 * @param {Array} candles - All candles
 * @returns {Object} Inducement result
 */
const createInducementResult = (candle, zone, type, index, candles) => {
  const isBullish = type === 'bullish_inducement';
  const range = candle.high - candle.low;
  const body = Math.abs(candle.close - candle.open);

  // Calculate how far price went past zone (liquidity swept)
  const zoneLevel = isBullish
    ? Math.min(zone.entryPrice, zone.stopPrice)
    : Math.max(zone.entryPrice, zone.stopPrice);

  const sweepDistance = isBullish
    ? zoneLevel - candle.low
    : candle.high - zoneLevel;

  // Check if followed by reversal
  const followingCandles = candles.slice(index + 1);
  const hasReversal = checkReversalAfterInducement(followingCandles, isBullish);

  // Calculate wick percent
  const wickDistance = isBullish
    ? Math.min(candle.open, candle.close) - candle.low
    : candle.high - Math.max(candle.open, candle.close);

  return {
    hasInducement: true,
    inducementType: type,

    // Candle info
    inducementCandle: {
      high: candle.high,
      low: candle.low,
      open: candle.open,
      close: candle.close,
      timestamp: candle.timestamp || candle.openTime,
    },

    // Price levels
    inducementPrice: isBullish ? candle.low : candle.high,
    zoneBoundary: zoneLevel,

    // Metrics
    sweepDistance,
    sweepPercent: parseFloat(((sweepDistance / zoneLevel) * 100).toFixed(2)),
    wickPercent: parseFloat(((wickDistance / range) * 100).toFixed(1)),
    bodyPercent: parseFloat(((body / range) * 100).toFixed(1)),

    // Analysis
    hasReversal,
    reversalConfirmed: hasReversal && followingCandles.length >= 2,

    // Trading implication
    implication: isBullish
      ? 'Stops swept below zone - Smart Money accumulated. BULLISH.'
      : 'Stops swept above zone - Smart Money distributed. BEARISH.',

    recommendation: hasReversal
      ? `${isBullish ? 'BUY' : 'SELL'} after inducement - Reversal confirmed`
      : 'Wait for reversal confirmation',

    quality: calculateInducementQuality(sweepDistance, zone, hasReversal),

    detectedAt: new Date().toISOString(),
  };
};

// ═══════════════════════════════════════════════════════════
// REVERSAL & QUALITY ANALYSIS
// ═══════════════════════════════════════════════════════════

/**
 * Check if price reversed after inducement
 * @param {Array} followingCandles - Candles after inducement
 * @param {boolean} isBullish - Whether bullish inducement
 * @returns {boolean} Whether reversal occurred
 */
const checkReversalAfterInducement = (followingCandles, isBullish) => {
  if (!followingCandles || followingCandles.length < 2) return false;

  const first = followingCandles[0];
  const second = followingCandles[1];

  if (isBullish) {
    // After bullish inducement, should see up candles
    return first.close > first.open && second.close > second.open;
  } else {
    // After bearish inducement, should see down candles
    return first.close < first.open && second.close < second.open;
  }
};

/**
 * Calculate inducement quality
 * @param {number} sweepDistance - Sweep distance
 * @param {Object} zone - Target zone
 * @param {boolean} hasReversal - Whether reversal confirmed
 * @returns {string} Quality rating
 */
const calculateInducementQuality = (sweepDistance, zone, hasReversal) => {
  let score = 0;

  // Sweep depth
  const zoneWidth = Math.abs(zone.entryPrice - zone.stopPrice);
  const sweepRatio = sweepDistance / zoneWidth;

  if (sweepRatio >= 0.3) score += 2;
  else if (sweepRatio >= 0.1) score += 1;

  // Reversal confirmed
  if (hasReversal) score += 2;

  if (score >= 3) return 'excellent';
  if (score >= 2) return 'good';
  return 'moderate';
};

// ═══════════════════════════════════════════════════════════
// LIQUIDITY POOL DETECTION
// ═══════════════════════════════════════════════════════════

/**
 * Detect liquidity pools (areas where stops likely clustered)
 * @param {Array} candles - OHLCV candles
 * @param {number} lookback - Lookback period
 * @returns {Object} Liquidity pools
 */
export const detectLiquidityPools = (candles, lookback = 50) => {
  if (!candles || candles.length < lookback) {
    return {
      buyStopPools: [],
      sellStopPools: [],
      allPools: [],
    };
  }

  const recentCandles = candles.slice(-lookback);
  const swingHighs = findSwingHighs(recentCandles, 2);
  const swingLows = findSwingLows(recentCandles, 2);

  // Liquidity above swing highs (buy stops)
  const buyStopPools = swingHighs.map(sh => ({
    type: 'buy_stops',
    level: sh.price,
    strength: calculatePoolStrength(sh, swingHighs),
    timestamp: sh.timestamp,
  }));

  // Liquidity below swing lows (sell stops)
  const sellStopPools = swingLows.map(sl => ({
    type: 'sell_stops',
    level: sl.price,
    strength: calculatePoolStrength(sl, swingLows),
    timestamp: sl.timestamp,
  }));

  return {
    buyStopPools,
    sellStopPools,
    allPools: [...buyStopPools, ...sellStopPools].sort((a, b) => b.level - a.level),
  };
};

/**
 * Calculate liquidity pool strength
 * @param {Object} swing - Swing point
 * @param {Array} allSwings - All swings of same type
 * @returns {string} Strength rating
 */
const calculatePoolStrength = (swing, allSwings) => {
  // Count equal/similar levels (clusters = more liquidity)
  const tolerance = swing.price * 0.002; // 0.2% tolerance
  const sameLevel = allSwings.filter(s =>
    Math.abs(s.price - swing.price) < tolerance
  ).length;

  if (sameLevel >= 3) return 'very_high';
  if (sameLevel >= 2) return 'high';
  return 'medium';
};

// ═══════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════

/**
 * Quick check for inducement presence
 * @param {Array} candles - Candles
 * @param {Object} zone - Target zone
 * @returns {boolean} Whether inducement exists
 */
export const hasInducement = (candles, zone) => {
  const result = detectInducement(candles, zone);
  return result !== null;
};

/**
 * Get inducement type display name in Vietnamese
 * @param {string} type - Inducement type
 * @returns {string} Display name
 */
export const getInducementTypeName = (type) => {
  const names = {
    bullish_inducement: 'Stop Hunt Bullish',
    bearish_inducement: 'Stop Hunt Bearish',
  };
  return names[type] || 'Inducement';
};

/**
 * Get inducement quality color
 * @param {string} quality - Quality rating
 * @returns {string} Color token
 */
export const getInducementQualityColor = (quality) => {
  switch (quality) {
    case 'excellent':
      return 'gold';
    case 'good':
      return 'success';
    default:
      return 'warning';
  }
};

/**
 * Analyze inducement with more detail
 * @param {Array} candles - Candles
 * @param {Object} zone - Target zone
 * @param {Object} options - Options
 * @returns {Object} Detailed inducement analysis
 */
export const analyzeInducementDetail = (candles, zone, options = {}) => {
  const inducement = detectInducement(candles, zone, options);

  if (!inducement) {
    return {
      hasInducement: false,
      reason: 'No inducement detected',
    };
  }

  // Get liquidity context
  const liquidityPools = detectLiquidityPools(candles, 50);

  // Check if inducement targeted specific liquidity pool
  const targetedPool = liquidityPools.allPools.find(pool => {
    const tolerance = pool.level * 0.005;
    return Math.abs(pool.level - inducement.inducementPrice) < tolerance;
  });

  return {
    ...inducement,
    liquidityContext: {
      targetedPool,
      nearbyBuyStops: liquidityPools.buyStopPools.slice(0, 3),
      nearbySellStops: liquidityPools.sellStopPools.slice(0, 3),
    },
    tradingNote: getTradingNote(inducement),
  };
};

/**
 * Get trading note for inducement
 * @param {Object} inducement - Inducement result
 * @returns {string} Trading note
 */
const getTradingNote = (inducement) => {
  const { inducementType, quality, reversalConfirmed } = inducement;

  if (reversalConfirmed && quality === 'excellent') {
    return inducementType === 'bullish_inducement'
      ? 'A+ Setup: Strong bullish inducement with confirmed reversal. BUY signal.'
      : 'A+ Setup: Strong bearish inducement with confirmed reversal. SELL signal.';
  }

  if (quality === 'good') {
    return 'Good Setup: Inducement detected. Wait for confirmation before entry.';
  }

  return 'Moderate Setup: Possible inducement. Monitor for reversal confirmation.';
};

/**
 * Check if price is approaching liquidity pool
 * @param {number} currentPrice - Current price
 * @param {Array} pools - Liquidity pools
 * @param {number} threshold - Threshold percentage
 * @returns {Object|null} Nearest approaching pool or null
 */
export const checkApproachingLiquidity = (currentPrice, pools, threshold = 1.0) => {
  for (const pool of pools) {
    const distance = Math.abs(pool.level - currentPrice);
    const distancePercent = (distance / currentPrice) * 100;

    if (distancePercent <= threshold) {
      return {
        pool,
        distancePercent: parseFloat(distancePercent.toFixed(2)),
        direction: currentPrice > pool.level ? 'approaching_below' : 'approaching_above',
        warning: pool.type === 'buy_stops'
          ? 'Price approaching buy stop liquidity - Possible squeeze up'
          : 'Price approaching sell stop liquidity - Possible sweep down',
      };
    }
  }

  return null;
};

// ═══════════════════════════════════════════════════════════
// DEFAULT EXPORT
// ═══════════════════════════════════════════════════════════

const inducementDetector = {
  detectInducement,
  detectLiquidityPools,
  hasInducement,
  getInducementTypeName,
  getInducementQualityColor,
  analyzeInducementDetail,
  checkApproachingLiquidity,
};

export default inducementDetector;
