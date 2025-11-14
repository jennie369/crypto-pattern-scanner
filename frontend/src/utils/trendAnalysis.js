/**
 * Trend Analysis Utility
 * GEM Frequency Trading Method - Phase 1: Identify Market Trend
 *
 * Detects uptrends and downtrends in price data
 * Essential for pattern detection (DPD, UPU, UPD, DPU)
 */

/**
 * Calculate Simple Moving Average
 * @param {Array} candles - Array of candlestick data [{open, high, low, close, time}]
 * @param {number} period - SMA period
 * @param {number} endIndex - End index for calculation
 * @returns {number} SMA value
 */
export function calculateSMA(candles, period, endIndex) {
  if (endIndex < period - 1) return null;

  let sum = 0;
  for (let i = endIndex - period + 1; i <= endIndex; i++) {
    sum += candles[i].close;
  }

  return sum / period;
}

/**
 * Calculate Exponential Moving Average
 * @param {Array} candles - Array of candlestick data
 * @param {number} period - EMA period
 * @returns {Array} Array of EMA values
 */
export function calculateEMA(candles, period) {
  if (candles.length < period) return [];

  const ema = [];
  const multiplier = 2 / (period + 1);

  // First EMA value is SMA
  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += candles[i].close;
  }
  ema[period - 1] = sum / period;

  // Calculate subsequent EMA values
  for (let i = period; i < candles.length; i++) {
    ema[i] = (candles[i].close - ema[i - 1]) * multiplier + ema[i - 1];
  }

  return ema;
}

/**
 * Identify trend direction using EMA crossover
 * @param {Array} candles - Array of candlestick data
 * @param {number} fastPeriod - Fast EMA period (default: 9)
 * @param {number} slowPeriod - Slow EMA period (default: 21)
 * @returns {string} 'uptrend', 'downtrend', or 'sideways'
 */
export function identifyTrend(candles, fastPeriod = 9, slowPeriod = 21) {
  if (candles.length < slowPeriod) {
    return 'sideways';
  }

  const fastEMA = calculateEMA(candles, fastPeriod);
  const slowEMA = calculateEMA(candles, slowPeriod);

  const lastIndex = candles.length - 1;
  const lastFast = fastEMA[lastIndex];
  const lastSlow = slowEMA[lastIndex];

  // Calculate trend strength
  const trendDiff = ((lastFast - lastSlow) / lastSlow) * 100;

  // Threshold: 0.5% difference to confirm trend
  const threshold = 0.5;

  if (trendDiff > threshold) {
    return 'uptrend';
  } else if (trendDiff < -threshold) {
    return 'downtrend';
  }

  return 'sideways';
}

/**
 * Detect if price is making higher highs and higher lows (uptrend)
 * or lower highs and lower lows (downtrend)
 *
 * @param {Array} candles - Recent candle data (minimum 5 candles)
 * @param {number} lookback - Number of candles to analyze (default: 5)
 * @returns {Object} { trend: 'up'|'down'|'sideways', strength: number }
 */
export function detectTrendStructure(candles, lookback = 5) {
  if (candles.length < lookback) {
    return { trend: 'sideways', strength: 0 };
  }

  const recentCandles = candles.slice(-lookback);
  let higherHighs = 0;
  let higherLows = 0;
  let lowerHighs = 0;
  let lowerLows = 0;

  for (let i = 1; i < recentCandles.length; i++) {
    const current = recentCandles[i];
    const previous = recentCandles[i - 1];

    // Check highs
    if (current.high > previous.high) {
      higherHighs++;
    } else if (current.high < previous.high) {
      lowerHighs++;
    }

    // Check lows
    if (current.low > previous.low) {
      higherLows++;
    } else if (current.low < previous.low) {
      lowerLows++;
    }
  }

  // Calculate trend strength (0-100)
  const totalComparisons = lookback - 1;

  // Uptrend: Higher highs AND higher lows
  const uptrendScore = ((higherHighs + higherLows) / (totalComparisons * 2)) * 100;

  // Downtrend: Lower highs AND lower lows
  const downtrendScore = ((lowerHighs + lowerLows) / (totalComparisons * 2)) * 100;

  // Determine trend
  if (uptrendScore >= 70) {
    return { trend: 'up', strength: uptrendScore };
  } else if (downtrendScore >= 70) {
    return { trend: 'down', strength: downtrendScore };
  }

  return { trend: 'sideways', strength: 0 };
}

/**
 * Check if candles are in an impulsive move (strong directional movement)
 * Used to identify the "Move" phase in Move-Pause-Move patterns
 *
 * @param {Array} candles - Candle segment to analyze
 * @param {string} direction - 'up' or 'down'
 * @returns {boolean} True if impulsive move detected
 */
export function isImpulsiveMove(candles, direction) {
  if (candles.length < 2) return false;

  let consecutiveMoves = 0;
  const requiredConsecutive = Math.max(2, Math.floor(candles.length * 0.6)); // 60% of candles

  for (let i = 0; i < candles.length; i++) {
    const candle = candles[i];
    const bodySize = Math.abs(candle.close - candle.open);
    const candleRange = candle.high - candle.low;

    // Check if candle has strong body (>60% of range)
    const hasStrongBody = bodySize / candleRange > 0.6;

    if (direction === 'up') {
      // Bullish candle: close > open
      if (candle.close > candle.open && hasStrongBody) {
        consecutiveMoves++;
      }
    } else {
      // Bearish candle: close < open
      if (candle.close < candle.open && hasStrongBody) {
        consecutiveMoves++;
      }
    }
  }

  return consecutiveMoves >= requiredConsecutive;
}

/**
 * Calculate Average True Range (ATR) for volatility measurement
 * @param {Array} candles - Array of candlestick data
 * @param {number} period - ATR period (default: 14)
 * @returns {number} ATR value
 */
export function calculateATR(candles, period = 14) {
  if (candles.length < period + 1) return null;

  const trueRanges = [];

  for (let i = 1; i < candles.length; i++) {
    const current = candles[i];
    const previous = candles[i - 1];

    const tr = Math.max(
      current.high - current.low,
      Math.abs(current.high - previous.close),
      Math.abs(current.low - previous.close)
    );

    trueRanges.push(tr);
  }

  // Calculate average of last 'period' true ranges
  const startIndex = Math.max(0, trueRanges.length - period);
  const relevantTRs = trueRanges.slice(startIndex);
  const sum = relevantTRs.reduce((acc, tr) => acc + tr, 0);

  return sum / relevantTRs.length;
}

/**
 * Comprehensive trend analysis combining multiple indicators
 * This is the main function to use for GEM pattern detection
 *
 * @param {Array} candles - Array of candlestick data
 * @param {Object} config - Configuration options
 * @returns {Object} Trend analysis result
 */
export function analyzeTrend(candles, config = {}) {
  const {
    fastEMA = 9,
    slowEMA = 21,
    lookback = 5,
    atrPeriod = 14
  } = config;

  if (candles.length < slowEMA) {
    return {
      trend: 'unknown',
      strength: 0,
      confidence: 0,
      atr: null,
      details: 'Insufficient data'
    };
  }

  // Get trend from EMA crossover
  const emaTrend = identifyTrend(candles, fastEMA, slowEMA);

  // Get trend structure (higher highs/lows)
  const structure = detectTrendStructure(candles, lookback);

  // Calculate ATR for volatility context
  const atr = calculateATR(candles, atrPeriod);

  // Determine final trend with consensus
  let finalTrend = 'sideways';
  let confidence = 0;

  if (emaTrend === 'uptrend' && structure.trend === 'up') {
    finalTrend = 'uptrend';
    confidence = structure.strength;
  } else if (emaTrend === 'downtrend' && structure.trend === 'down') {
    finalTrend = 'downtrend';
    confidence = structure.strength;
  } else if (emaTrend !== 'sideways' || structure.trend !== 'sideways') {
    // Partial agreement
    finalTrend = emaTrend !== 'sideways' ? emaTrend : structure.trend === 'up' ? 'uptrend' : 'downtrend';
    confidence = structure.strength * 0.7; // Reduced confidence
  }

  return {
    trend: finalTrend,
    strength: structure.strength,
    confidence: Math.round(confidence),
    atr: atr,
    emaTrend: emaTrend,
    structureTrend: structure.trend,
    details: `EMA: ${emaTrend}, Structure: ${structure.trend}`
  };
}

/**
 * Check if current market conditions are suitable for GEM pattern trading
 * @param {Array} candles - Array of candlestick data
 * @returns {Object} Market condition assessment
 */
export function assessMarketConditions(candles) {
  const trendAnalysis = analyzeTrend(candles);
  const lastCandle = candles[candles.length - 1];
  const avgVolume = candles.slice(-20).reduce((sum, c) => sum + (c.volume || 0), 0) / 20;

  return {
    isTrending: trendAnalysis.trend !== 'sideways' && trendAnalysis.confidence >= 60,
    trend: trendAnalysis.trend,
    confidence: trendAnalysis.confidence,
    volatility: trendAnalysis.atr ? 'normal' : 'unknown',
    volumeStatus: lastCandle.volume > avgVolume * 1.2 ? 'high' : 'normal',
    tradeable: trendAnalysis.trend !== 'sideways' && trendAnalysis.confidence >= 60
  };
}
