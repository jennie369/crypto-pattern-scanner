/**
 * GEM Mobile - Advanced Pattern Statistics
 * Issue #20: Port from Web version
 * Calculates advanced pattern quality metrics
 */

import { calculateRR, formatPrice, formatConfidence } from './formatters';

/**
 * Calculate advanced statistics for a pattern
 * @param {object} pattern - Pattern data with entry, stopLoss, takeProfit
 * @param {array} historicalData - OHLCV candle data
 */
export const calculateAdvancedStats = (pattern, historicalData = []) => {
  if (!pattern) return null;

  const { entry, stopLoss, takeProfit, confidence = 60, direction = 'LONG' } = pattern;

  // Basic calculations
  const riskPercent = calculateRiskPercent(pattern);
  const rewardPercent = calculateRewardPercent(pattern);
  const rrRatio = calculateRR(pattern);

  // Advanced stats (require historical data)
  const zoneRetest = checkZoneRetest(pattern, historicalData);
  const volumeConfirmation = checkVolumeConfirmation(pattern, historicalData);
  const trendAlignment = checkTrendAlignment(pattern, historicalData);

  // Win rate adjustments
  const baseWinRate = pattern.baseWinRate || 60;
  const adjustedWinRate = calculateAdjustedWinRate(pattern, historicalData);

  // Quality score
  const qualityScore = calculateQualityScore(pattern, historicalData);

  return {
    // Basic stats
    confidence,
    direction,
    entry,
    stopLoss,
    takeProfit,

    // Risk/Reward
    riskPercent,
    rewardPercent,
    rrRatio,

    // Advanced confirmations
    zoneRetest,
    volumeConfirmation,
    trendAlignment,

    // Win rate
    baseWinRate,
    adjustedWinRate,

    // Quality
    qualityScore,

    // Time-based
    expectedDuration: estimateTradeDuration(pattern),
    optimalEntry: findOptimalEntry(pattern, historicalData),
  };
};

/**
 * Calculate risk percentage
 */
export const calculateRiskPercent = (pattern) => {
  if (!pattern?.entry || !pattern?.stopLoss) return 0;
  return Math.abs(pattern.entry - pattern.stopLoss) / pattern.entry * 100;
};

/**
 * Calculate reward percentage
 */
export const calculateRewardPercent = (pattern) => {
  if (!pattern?.entry || !pattern?.takeProfit) return 0;
  return Math.abs(pattern.takeProfit - pattern.entry) / pattern.entry * 100;
};

/**
 * Check Zone Retest
 * Determines if price has retested the breakout zone
 */
export const checkZoneRetest = (pattern, historicalData = []) => {
  if (!pattern || !historicalData || historicalData.length < 5) {
    return { found: false, quality: 'NONE' };
  }

  const { entry, direction } = pattern;
  const recentCandles = historicalData.slice(-20);

  // Calculate average volume
  const volumes = recentCandles.map(c => c.volume || 0);
  const avgVolume = volumes.reduce((a, b) => a + b, 0) / volumes.length;

  let retestFound = false;
  let retestQuality = 'NONE';
  let retestCandle = null;

  for (let i = 0; i < recentCandles.length; i++) {
    const candle = recentCandles[i];
    const candleVolume = candle.volume || 0;

    if (direction === 'LONG') {
      // Check if price dipped back to entry zone and bounced
      if (candle.low <= entry * 1.01 && candle.close > entry) {
        retestFound = true;
        retestQuality = candleVolume > avgVolume * 1.2 ? 'STRONG' : 'WEAK';
        retestCandle = candle;
        break;
      }
    } else {
      // SHORT: Check if price wicked up to entry and rejected
      if (candle.high >= entry * 0.99 && candle.close < entry) {
        retestFound = true;
        retestQuality = candleVolume > avgVolume * 1.2 ? 'STRONG' : 'WEAK';
        retestCandle = candle;
        break;
      }
    }
  }

  return {
    found: retestFound,
    quality: retestQuality,
    candle: retestCandle,
    winRateBonus: retestFound ? (retestQuality === 'STRONG' ? 15 : 10) : 0,
  };
};

/**
 * Check Volume Confirmation
 * Analyzes if volume confirms the pattern direction
 */
export const checkVolumeConfirmation = (pattern, historicalData = []) => {
  if (!pattern || !historicalData || historicalData.length < 10) {
    return { confirmed: false, strength: 'NONE', ratio: 0 };
  }

  const { direction } = pattern;
  const recentCandles = historicalData.slice(-10);

  // Calculate volume metrics
  const volumes = recentCandles.map(c => c.volume || 0);
  const avgVolume = volumes.reduce((a, b) => a + b, 0) / volumes.length;
  const latestVolume = volumes[volumes.length - 1];

  // Calculate volume trend
  const volumeTrend = volumes.slice(-5).reduce((a, b) => a + b, 0) / 5 >
    volumes.slice(0, 5).reduce((a, b) => a + b, 0) / 5;

  // Calculate bullish vs bearish volume
  let bullishVolume = 0;
  let bearishVolume = 0;

  recentCandles.forEach(candle => {
    if (candle.close > candle.open) {
      bullishVolume += candle.volume || 0;
    } else {
      bearishVolume += candle.volume || 0;
    }
  });

  const volumeRatio = latestVolume / avgVolume;
  const bullBearRatio = bullishVolume / (bearishVolume || 1);

  // Determine confirmation
  let confirmed = false;
  let strength = 'NONE';

  if (direction === 'LONG') {
    confirmed = bullBearRatio > 1.2 && volumeTrend;
    strength = confirmed ? (volumeRatio > 1.5 ? 'HIGH' : 'MEDIUM') : 'LOW';
  } else {
    confirmed = bullBearRatio < 0.8 && volumeTrend;
    strength = confirmed ? (volumeRatio > 1.5 ? 'HIGH' : 'MEDIUM') : 'LOW';
  }

  return {
    confirmed,
    strength,
    ratio: volumeRatio.toFixed(2),
    bullBearRatio: bullBearRatio.toFixed(2),
    winRateBonus: confirmed ? (strength === 'HIGH' ? 10 : 5) : 0,
  };
};

/**
 * Check Trend Alignment
 * Determines if pattern aligns with higher timeframe trend
 */
export const checkTrendAlignment = (pattern, historicalData = []) => {
  if (!pattern || !historicalData || historicalData.length < 20) {
    return { aligned: false, trend: 'NEUTRAL' };
  }

  const { direction } = pattern;

  // Calculate simple moving averages
  const closes = historicalData.map(c => c.close);
  const sma10 = closes.slice(-10).reduce((a, b) => a + b, 0) / 10;
  const sma20 = closes.slice(-20).reduce((a, b) => a + b, 0) / 20;
  const currentPrice = closes[closes.length - 1];

  // Determine trend
  let trend = 'NEUTRAL';
  if (currentPrice > sma10 && sma10 > sma20) {
    trend = 'UPTREND';
  } else if (currentPrice < sma10 && sma10 < sma20) {
    trend = 'DOWNTREND';
  }

  // Check alignment
  const aligned =
    (direction === 'LONG' && trend === 'UPTREND') ||
    (direction === 'SHORT' && trend === 'DOWNTREND');

  return {
    aligned,
    trend,
    sma10: formatPrice(sma10),
    sma20: formatPrice(sma20),
    winRateBonus: aligned ? 5 : 0,
  };
};

/**
 * Calculate Adjusted Win Rate
 * Based on multiple confirmation factors
 */
export const calculateAdjustedWinRate = (pattern, historicalData = []) => {
  let winRate = pattern?.baseWinRate || 60;

  // Zone retest bonus
  const zoneRetest = checkZoneRetest(pattern, historicalData);
  winRate += zoneRetest.winRateBonus;

  // Volume confirmation bonus
  const volumeConf = checkVolumeConfirmation(pattern, historicalData);
  winRate += volumeConf.winRateBonus;

  // Trend alignment bonus
  const trendAlign = checkTrendAlignment(pattern, historicalData);
  winRate += trendAlign.winRateBonus;

  // R:R ratio bonus
  const rr = calculateRR(pattern);
  if (rr >= 3) winRate += 10;
  else if (rr >= 2) winRate += 5;

  // Confidence bonus
  if (pattern?.confidence >= 80) winRate += 5;

  // Cap at 95%
  return Math.min(winRate, 95);
};

/**
 * Calculate Quality Score (0-100)
 * Overall pattern quality rating
 */
export const calculateQualityScore = (pattern, historicalData = []) => {
  let score = 0;

  // Base confidence (max 30 points)
  const confidence = pattern?.confidence || 0;
  score += (confidence / 100) * 30;

  // Zone retest (max 25 points)
  const retest = checkZoneRetest(pattern, historicalData);
  if (retest.found) {
    score += retest.quality === 'STRONG' ? 25 : 15;
  }

  // Volume confirmation (max 20 points)
  const volume = checkVolumeConfirmation(pattern, historicalData);
  if (volume.confirmed) {
    score += volume.strength === 'HIGH' ? 20 : 10;
  }

  // R:R ratio (max 15 points)
  const rr = calculateRR(pattern);
  score += Math.min(rr * 5, 15);

  // Trend alignment (max 10 points)
  const trend = checkTrendAlignment(pattern, historicalData);
  if (trend.aligned) score += 10;

  return Math.round(score);
};

/**
 * Get Quality Score Label
 */
export const getQualityLabel = (score) => {
  if (score >= 80) return { label: 'Tuyệt vời', color: '#22C55E' };
  if (score >= 60) return { label: 'Tốt', color: '#84CC16' };
  if (score >= 40) return { label: 'Trung bình', color: '#FFD700' };
  if (score >= 20) return { label: 'Yếu', color: '#F97316' };
  return { label: 'Kém', color: '#EF4444' };
};

/**
 * Estimate Trade Duration
 * Based on pattern type and timeframe
 */
export const estimateTradeDuration = (pattern) => {
  const { timeframe = '4h', name = '' } = pattern || {};

  const timeframeHours = {
    '1m': 0.5,
    '5m': 2,
    '15m': 6,
    '1h': 24,
    '4h': 72,
    '1d': 168,
    '1w': 336,
  };

  const baseHours = timeframeHours[timeframe] || 24;

  // Pattern-specific multipliers
  const patternMultipliers = {
    DPD: 1,
    UPU: 1,
    HEAD_SHOULDERS: 1.5,
    DOUBLE_TOP: 1.2,
    DOUBLE_BOTTOM: 1.2,
    TRIANGLE: 2,
    FLAG: 0.8,
  };

  const multiplier = patternMultipliers[name] || 1;
  const hours = baseHours * multiplier;

  if (hours < 24) return `${Math.round(hours)} giờ`;
  if (hours < 168) return `${Math.round(hours / 24)} ngày`;
  return `${Math.round(hours / 168)} tuần`;
};

/**
 * Find Optimal Entry
 * Suggests best entry point based on support levels
 */
export const findOptimalEntry = (pattern, historicalData = []) => {
  if (!pattern || !historicalData || historicalData.length < 10) {
    return { price: pattern?.entry, reason: 'Current entry' };
  }

  const { entry, direction } = pattern;
  const recentLows = historicalData.slice(-10).map(c => c.low);
  const recentHighs = historicalData.slice(-10).map(c => c.high);

  if (direction === 'LONG') {
    // Find nearby support level
    const support = Math.min(...recentLows);
    if (support < entry && support > entry * 0.98) {
      return {
        price: support,
        reason: 'Vùng hỗ trợ gần nhất',
        improvement: ((entry - support) / entry * 100).toFixed(2) + '%',
      };
    }
  } else {
    // Find nearby resistance level
    const resistance = Math.max(...recentHighs);
    if (resistance > entry && resistance < entry * 1.02) {
      return {
        price: resistance,
        reason: 'Vùng kháng cự gần nhất',
        improvement: ((resistance - entry) / entry * 100).toFixed(2) + '%',
      };
    }
  }

  return { price: entry, reason: 'Entry hiện tại là tối ưu' };
};

export default {
  calculateAdvancedStats,
  calculateRiskPercent,
  calculateRewardPercent,
  checkZoneRetest,
  checkVolumeConfirmation,
  checkTrendAlignment,
  calculateAdjustedWinRate,
  calculateQualityScore,
  getQualityLabel,
  estimateTradeDuration,
  findOptimalEntry,
};
