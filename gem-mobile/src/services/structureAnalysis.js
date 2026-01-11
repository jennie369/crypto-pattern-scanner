/**
 * GEM Mobile - Structure Analysis Service
 * Market structure analysis - Swing points, BOS, trend identification
 *
 * Phase 1B: Foundation for Quasimodo + FTR Detection
 */

// ═══════════════════════════════════════════════════════════
// SWING POINT DETECTION
// ═══════════════════════════════════════════════════════════

/**
 * Identify swing high points
 * @param {Array} candles - OHLCV candles
 * @param {number} lookback - Candles each side to confirm swing (default 3)
 * @returns {Array} Array of swing high objects
 */
export const findSwingHighs = (candles, lookback = 3) => {
  const swingHighs = [];

  if (!candles || candles.length < lookback * 2 + 1) {
    return swingHighs;
  }

  for (let i = lookback; i < candles.length - lookback; i++) {
    const current = candles[i];
    let isSwingHigh = true;

    // Check if current high is higher than surrounding candles
    for (let j = i - lookback; j <= i + lookback; j++) {
      if (j !== i && candles[j].high >= current.high) {
        isSwingHigh = false;
        break;
      }
    }

    if (isSwingHigh) {
      swingHighs.push({
        index: i,
        price: current.high,
        timestamp: current.timestamp || current.time || current.openTime,
        candle: current,
        type: 'swing_high',
      });
    }
  }

  return swingHighs;
};

/**
 * Identify swing low points
 * @param {Array} candles - OHLCV candles
 * @param {number} lookback - Candles each side to confirm swing (default 3)
 * @returns {Array} Array of swing low objects
 */
export const findSwingLows = (candles, lookback = 3) => {
  const swingLows = [];

  if (!candles || candles.length < lookback * 2 + 1) {
    return swingLows;
  }

  for (let i = lookback; i < candles.length - lookback; i++) {
    const current = candles[i];
    let isSwingLow = true;

    // Check if current low is lower than surrounding candles
    for (let j = i - lookback; j <= i + lookback; j++) {
      if (j !== i && candles[j].low <= current.low) {
        isSwingLow = false;
        break;
      }
    }

    if (isSwingLow) {
      swingLows.push({
        index: i,
        price: current.low,
        timestamp: current.timestamp || current.time || current.openTime,
        candle: current,
        type: 'swing_low',
      });
    }
  }

  return swingLows;
};

/**
 * Combine and sort swing points chronologically
 * @param {Array} candles - OHLCV candles
 * @param {number} lookback - Swing detection lookback
 * @returns {Array} Combined swing points
 */
export const getAllSwingPoints = (candles, lookback = 3) => {
  const highs = findSwingHighs(candles, lookback);
  const lows = findSwingLows(candles, lookback);

  return [...highs, ...lows].sort((a, b) => a.index - b.index);
};

// ═══════════════════════════════════════════════════════════
// TREND IDENTIFICATION
// ═══════════════════════════════════════════════════════════

/**
 * Identify trend based on swing structure
 * @param {Array} swingPoints - Array of swing points
 * @returns {Object} Trend analysis
 */
export const identifyTrend = (swingPoints) => {
  if (!swingPoints || swingPoints.length < 4) {
    return { trend: 'unknown', confidence: 0 };
  }

  const recentSwings = swingPoints.slice(-6); // Last 6 swings

  let higherHighs = 0;
  let higherLows = 0;
  let lowerHighs = 0;
  let lowerLows = 0;

  const highs = recentSwings.filter(s => s.type === 'swing_high');
  const lows = recentSwings.filter(s => s.type === 'swing_low');

  // Count HH/HL for uptrend
  for (let i = 1; i < highs.length; i++) {
    if (highs[i].price > highs[i - 1].price) higherHighs++;
    else lowerHighs++;
  }

  for (let i = 1; i < lows.length; i++) {
    if (lows[i].price > lows[i - 1].price) higherLows++;
    else lowerLows++;
  }

  // Determine trend
  const upScore = higherHighs + higherLows;
  const downScore = lowerHighs + lowerLows;
  const total = upScore + downScore;

  if (total === 0) {
    return { trend: 'ranging', confidence: 0.5 };
  }

  const upConfidence = upScore / total;
  const downConfidence = downScore / total;

  if (upConfidence > 0.6) {
    return {
      trend: 'uptrend',
      confidence: upConfidence,
      structure: { higherHighs, higherLows, lowerHighs, lowerLows },
    };
  } else if (downConfidence > 0.6) {
    return {
      trend: 'downtrend',
      confidence: downConfidence,
      structure: { higherHighs, higherLows, lowerHighs, lowerLows },
    };
  } else {
    return {
      trend: 'ranging',
      confidence: 0.5,
      structure: { higherHighs, higherLows, lowerHighs, lowerLows },
    };
  }
};

/**
 * Identify trend from candles directly
 * @param {Array} candles - OHLCV candles
 * @param {number} period - Lookback period
 * @returns {Object} Trend analysis
 */
export const identifyTrendFromCandles = (candles, period = 20) => {
  if (!candles || candles.length < period) {
    return { trend: 'unknown', confidence: 0 };
  }

  const recentCandles = candles.slice(-period);
  const firstPrice = recentCandles[0].close;
  const lastPrice = recentCandles[recentCandles.length - 1].close;
  const priceChange = ((lastPrice - firstPrice) / firstPrice) * 100;

  // Calculate average true range for volatility context
  let atrSum = 0;
  for (let i = 1; i < recentCandles.length; i++) {
    const tr = Math.max(
      recentCandles[i].high - recentCandles[i].low,
      Math.abs(recentCandles[i].high - recentCandles[i - 1].close),
      Math.abs(recentCandles[i].low - recentCandles[i - 1].close)
    );
    atrSum += tr;
  }
  const atr = atrSum / (recentCandles.length - 1);
  const atrPercent = (atr / lastPrice) * 100;

  // Determine trend strength based on move vs volatility
  const moveVsVolatility = Math.abs(priceChange) / (atrPercent * Math.sqrt(period));

  if (priceChange > 2 && moveVsVolatility > 0.5) {
    return {
      trend: 'uptrend',
      confidence: Math.min(0.9, 0.5 + moveVsVolatility * 0.2),
      priceChange,
      atrPercent,
    };
  } else if (priceChange < -2 && moveVsVolatility > 0.5) {
    return {
      trend: 'downtrend',
      confidence: Math.min(0.9, 0.5 + moveVsVolatility * 0.2),
      priceChange,
      atrPercent,
    };
  } else {
    return {
      trend: 'ranging',
      confidence: 0.5,
      priceChange,
      atrPercent,
    };
  }
};

// ═══════════════════════════════════════════════════════════
// BREAK OF STRUCTURE (BOS) DETECTION
// ═══════════════════════════════════════════════════════════

/**
 * Detect Break of Structure (BOS)
 * @param {Array} candles - OHLCV candles
 * @param {Array} swingPoints - Swing points
 * @param {string} direction - 'up', 'down', or 'auto'
 * @returns {Object|null} BOS details or null
 */
export const detectBOS = (candles, swingPoints, direction = 'auto') => {
  if (!swingPoints || swingPoints.length < 3) {
    return null;
  }

  const highs = swingPoints.filter(s => s.type === 'swing_high');
  const lows = swingPoints.filter(s => s.type === 'swing_low');

  // For bearish BOS: Price makes Lower Low (breaks below previous swing low)
  if (direction === 'down' || direction === 'auto') {
    if (lows.length >= 2) {
      const lastLow = lows[lows.length - 1];
      const prevLow = lows[lows.length - 2];

      if (lastLow.price < prevLow.price) {
        return {
          type: 'bearish_bos',
          direction: 'down',
          breakPrice: prevLow.price,
          newLow: lastLow.price,
          breakIndex: lastLow.index,
          timestamp: lastLow.timestamp,
          confirmed: true,
          breakDistance: prevLow.price - lastLow.price,
          breakPercent: ((prevLow.price - lastLow.price) / prevLow.price * 100).toFixed(2),
        };
      }
    }
  }

  // For bullish BOS: Price makes Higher High (breaks above previous swing high)
  if (direction === 'up' || direction === 'auto') {
    if (highs.length >= 2) {
      const lastHigh = highs[highs.length - 1];
      const prevHigh = highs[highs.length - 2];

      if (lastHigh.price > prevHigh.price) {
        return {
          type: 'bullish_bos',
          direction: 'up',
          breakPrice: prevHigh.price,
          newHigh: lastHigh.price,
          breakIndex: lastHigh.index,
          timestamp: lastHigh.timestamp,
          confirmed: true,
          breakDistance: lastHigh.price - prevHigh.price,
          breakPercent: ((lastHigh.price - prevHigh.price) / prevHigh.price * 100).toFixed(2),
        };
      }
    }
  }

  return null;
};

/**
 * Detect Change of Character (CHoCH) - first BOS after trend
 * @param {Array} candles - OHLCV candles
 * @param {Array} swingPoints - Swing points
 * @returns {Object|null} CHoCH details or null
 */
export const detectCHoCH = (candles, swingPoints) => {
  if (!swingPoints || swingPoints.length < 6) {
    return null;
  }

  // Analyze trend before recent swings
  const earlierSwings = swingPoints.slice(0, -3);
  const trend = identifyTrend(earlierSwings);

  if (trend.trend === 'ranging' || trend.trend === 'unknown') {
    return null;
  }

  // Look for opposite BOS
  const expectedBOSDirection = trend.trend === 'uptrend' ? 'down' : 'up';
  const bos = detectBOS(candles, swingPoints, expectedBOSDirection);

  if (bos) {
    return {
      ...bos,
      isChoCH: true,
      priorTrend: trend.trend,
      priorTrendConfidence: trend.confidence,
    };
  }

  return null;
};

// ═══════════════════════════════════════════════════════════
// SWING POINT UTILITIES
// ═══════════════════════════════════════════════════════════

/**
 * Find last significant high before a given index
 * @param {Array} swingPoints - Swing points
 * @param {number} index - Reference index
 * @returns {Object|null} Swing high or null
 */
export const findLastHighBefore = (swingPoints, index) => {
  const highs = swingPoints
    .filter(s => s.type === 'swing_high' && s.index < index)
    .sort((a, b) => b.index - a.index);

  return highs[0] || null;
};

/**
 * Find last significant low before a given index
 * @param {Array} swingPoints - Swing points
 * @param {number} index - Reference index
 * @returns {Object|null} Swing low or null
 */
export const findLastLowBefore = (swingPoints, index) => {
  const lows = swingPoints
    .filter(s => s.type === 'swing_low' && s.index < index)
    .sort((a, b) => b.index - a.index);

  return lows[0] || null;
};

/**
 * Find highest high in a range
 * @param {Array} swingPoints - Swing points
 * @param {number} startIndex - Start index
 * @param {number} endIndex - End index
 * @returns {Object|null} Highest swing high or null
 */
export const findHighestHigh = (swingPoints, startIndex = 0, endIndex = Infinity) => {
  const highs = swingPoints.filter(
    s => s.type === 'swing_high' && s.index >= startIndex && s.index <= endIndex
  );

  if (highs.length === 0) return null;

  return highs.reduce((max, h) => (h.price > max.price ? h : max), highs[0]);
};

/**
 * Find lowest low in a range
 * @param {Array} swingPoints - Swing points
 * @param {number} startIndex - Start index
 * @param {number} endIndex - End index
 * @returns {Object|null} Lowest swing low or null
 */
export const findLowestLow = (swingPoints, startIndex = 0, endIndex = Infinity) => {
  const lows = swingPoints.filter(
    s => s.type === 'swing_low' && s.index >= startIndex && s.index <= endIndex
  );

  if (lows.length === 0) return null;

  return lows.reduce((min, l) => (l.price < min.price ? l : min), lows[0]);
};

/**
 * Get N recent swing highs
 * @param {Array} swingPoints - Swing points
 * @param {number} count - Number of highs to return
 * @returns {Array} Recent swing highs
 */
export const getRecentSwingHighs = (swingPoints, count = 3) => {
  return swingPoints
    .filter(s => s.type === 'swing_high')
    .slice(-count);
};

/**
 * Get N recent swing lows
 * @param {Array} swingPoints - Swing points
 * @param {number} count - Number of lows to return
 * @returns {Array} Recent swing lows
 */
export const getRecentSwingLows = (swingPoints, count = 3) => {
  return swingPoints
    .filter(s => s.type === 'swing_low')
    .slice(-count);
};

/**
 * Find swing points between two indexes
 * @param {Array} swingPoints - Swing points
 * @param {number} startIndex - Start index
 * @param {number} endIndex - End index
 * @returns {Array} Swing points in range
 */
export const findSwingsBetween = (swingPoints, startIndex, endIndex) => {
  return swingPoints.filter(s => s.index > startIndex && s.index < endIndex);
};

// ═══════════════════════════════════════════════════════════
// SUPPORT/RESISTANCE LEVEL DETECTION
// ═══════════════════════════════════════════════════════════

/**
 * Find key support levels from swing lows
 * @param {Array} swingLows - Swing low points
 * @param {number} tolerance - Price tolerance for grouping (percentage)
 * @returns {Array} Key support levels
 */
export const findSupportLevels = (swingLows, tolerance = 0.5) => {
  if (!swingLows || swingLows.length === 0) return [];

  const levels = [];
  const used = new Set();

  for (const low of swingLows) {
    if (used.has(low.index)) continue;

    // Find other lows near this price
    const cluster = swingLows.filter(l => {
      if (used.has(l.index)) return false;
      const priceDiff = Math.abs(l.price - low.price) / low.price * 100;
      return priceDiff <= tolerance;
    });

    if (cluster.length >= 2) {
      const avgPrice = cluster.reduce((sum, l) => sum + l.price, 0) / cluster.length;
      levels.push({
        price: avgPrice,
        touches: cluster.length,
        points: cluster,
        type: 'support',
        strength: cluster.length,
      });
      cluster.forEach(l => used.add(l.index));
    }
  }

  return levels.sort((a, b) => b.strength - a.strength);
};

/**
 * Find key resistance levels from swing highs
 * @param {Array} swingHighs - Swing high points
 * @param {number} tolerance - Price tolerance for grouping (percentage)
 * @returns {Array} Key resistance levels
 */
export const findResistanceLevels = (swingHighs, tolerance = 0.5) => {
  if (!swingHighs || swingHighs.length === 0) return [];

  const levels = [];
  const used = new Set();

  for (const high of swingHighs) {
    if (used.has(high.index)) continue;

    const cluster = swingHighs.filter(h => {
      if (used.has(h.index)) return false;
      const priceDiff = Math.abs(h.price - high.price) / high.price * 100;
      return priceDiff <= tolerance;
    });

    if (cluster.length >= 2) {
      const avgPrice = cluster.reduce((sum, h) => sum + h.price, 0) / cluster.length;
      levels.push({
        price: avgPrice,
        touches: cluster.length,
        points: cluster,
        type: 'resistance',
        strength: cluster.length,
      });
      cluster.forEach(h => used.add(h.index));
    }
  }

  return levels.sort((a, b) => b.strength - a.strength);
};

// ═══════════════════════════════════════════════════════════
// DEFAULT EXPORT
// ═══════════════════════════════════════════════════════════

const structureAnalysis = {
  // Swing point detection
  findSwingHighs,
  findSwingLows,
  getAllSwingPoints,

  // Trend identification
  identifyTrend,
  identifyTrendFromCandles,

  // BOS detection
  detectBOS,
  detectCHoCH,

  // Swing point utilities
  findLastHighBefore,
  findLastLowBefore,
  findHighestHigh,
  findLowestLow,
  getRecentSwingHighs,
  getRecentSwingLows,
  findSwingsBetween,

  // S/R detection
  findSupportLevels,
  findResistanceLevels,
};

export default structureAnalysis;
