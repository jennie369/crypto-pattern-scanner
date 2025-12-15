/**
 * Volume Analysis Utility
 * Analyzes volume patterns to confirm price action signals
 * Used to filter out low-volume false signals
 *
 * @module volumeAnalysis
 * @description Critical for GEM Method - Volume confirms conviction
 */

/**
 * Calculate average volume over a period
 * @param {Array} volumes - Array of volume values
 * @returns {Number} Average volume
 */
function calculateAverageVolume(volumes) {
  if (!volumes || volumes.length === 0) return 0;
  const sum = volumes.reduce((acc, vol) => acc + vol, 0);
  return sum / volumes.length;
}

/**
 * Analyze volume profile for a pattern
 * @param {Array} candles - Array of OHLCV candles [{open, high, low, close, volume, time}]
 * @param {Object} patternRange - {start: index, end: index}
 * @returns {Object} Volume analysis results
 */
export function analyzeVolumeProfile(candles, patternRange = {}) {
  if (!candles || candles.length < 20) {
    console.log('[Volume Analysis] Insufficient candles for analysis');
    return {
      avgVolume: 0,
      recentVolume: 0,
      volumeRatio: 1,
      volumeScore: 50,
      hasVolumeConfirmation: true, // Default pass if no data
      volumeTrend: 'NEUTRAL',
      error: 'Insufficient data'
    };
  }

  const start = patternRange.start || Math.max(0, candles.length - 50);
  const end = patternRange.end || candles.length - 1;

  // Extract volumes
  const allVolumes = candles.map(c => c.volume || 0);

  // Calculate 20-period average volume (baseline)
  const lookbackPeriod = Math.min(20, candles.length);
  const baselineStart = Math.max(0, end - lookbackPeriod - 10);
  const baselineVolumes = allVolumes.slice(baselineStart, baselineStart + lookbackPeriod);
  const avgVolume = calculateAverageVolume(baselineVolumes);

  // Calculate recent volume (last 5 candles)
  const recentVolumes = allVolumes.slice(-5);
  const recentVolume = calculateAverageVolume(recentVolumes);

  // Volume ratio: Recent vs Average
  const volumeRatio = avgVolume > 0 ? recentVolume / avgVolume : 1;

  // Determine volume trend
  let volumeTrend = 'NEUTRAL';
  if (volumeRatio >= 1.5) {
    volumeTrend = 'INCREASING';
  } else if (volumeRatio >= 1.2) {
    volumeTrend = 'SLIGHTLY_INCREASING';
  } else if (volumeRatio <= 0.5) {
    volumeTrend = 'DECREASING';
  } else if (volumeRatio <= 0.8) {
    volumeTrend = 'SLIGHTLY_DECREASING';
  }

  // Calculate volume score (0-100)
  // Higher ratio = higher score (up to a point)
  let volumeScore = 50; // Base score

  if (volumeRatio >= 2.0) {
    volumeScore = 95; // Very high volume = strong confirmation
  } else if (volumeRatio >= 1.5) {
    volumeScore = 85;
  } else if (volumeRatio >= 1.2) {
    volumeScore = 75;
  } else if (volumeRatio >= 1.0) {
    volumeScore = 65;
  } else if (volumeRatio >= 0.8) {
    volumeScore = 55;
  } else if (volumeRatio >= 0.5) {
    volumeScore = 40;
  } else {
    volumeScore = 25; // Very low volume = weak signal
  }

  // Volume confirmation threshold
  // Require at least 80% of average volume for confirmation
  const hasVolumeConfirmation = volumeRatio >= 0.8;

  const result = {
    avgVolume: Math.round(avgVolume),
    recentVolume: Math.round(recentVolume),
    volumeRatio: Number(volumeRatio.toFixed(2)),
    volumeScore: Math.round(volumeScore),
    hasVolumeConfirmation,
    volumeTrend
  };

  console.log('[Volume Analysis] Result:', result);

  return result;
}

/**
 * Check if volume confirms the pattern direction
 * Bullish patterns need volume on up moves
 * Bearish patterns need volume on down moves
 *
 * @param {Array} candles - Recent candles (last 10)
 * @param {String} direction - 'LONG' or 'SHORT'
 * @returns {Object} Direction confirmation result
 */
export function confirmVolumeDirection(candles, direction) {
  if (!candles || candles.length < 5) {
    return { confirms: true, reason: 'Insufficient data' };
  }

  const recentCandles = candles.slice(-10);

  // Separate up candles and down candles
  const upCandles = recentCandles.filter(c => c.close > c.open);
  const downCandles = recentCandles.filter(c => c.close < c.open);

  const avgUpVolume = calculateAverageVolume(upCandles.map(c => c.volume));
  const avgDownVolume = calculateAverageVolume(downCandles.map(c => c.volume));

  let confirms = true;
  let reason = '';

  if (direction === 'LONG' || direction === 'BULLISH') {
    // For LONG: Want higher volume on up candles
    if (avgDownVolume > avgUpVolume * 1.3) {
      confirms = false;
      reason = 'More volume on down candles - weak buying';
    } else if (avgUpVolume > avgDownVolume * 1.2) {
      reason = 'Strong buying volume';
    } else {
      reason = 'Neutral volume distribution';
    }
  } else if (direction === 'SHORT' || direction === 'BEARISH') {
    // For SHORT: Want higher volume on down candles
    if (avgUpVolume > avgDownVolume * 1.3) {
      confirms = false;
      reason = 'More volume on up candles - weak selling';
    } else if (avgDownVolume > avgUpVolume * 1.2) {
      reason = 'Strong selling volume';
    } else {
      reason = 'Neutral volume distribution';
    }
  }

  console.log('[Volume Direction] Check:', { direction, confirms, reason, avgUpVolume, avgDownVolume });

  return {
    confirms,
    reason,
    avgUpVolume: Math.round(avgUpVolume),
    avgDownVolume: Math.round(avgDownVolume),
    volumeBias: avgUpVolume > avgDownVolume ? 'BULLISH' : avgDownVolume > avgUpVolume ? 'BEARISH' : 'NEUTRAL'
  };
}

/**
 * Analyze volume spike (for breakout patterns)
 * @param {Array} candles - OHLCV candles
 * @param {Number} spikeThreshold - Multiplier threshold (default 2x)
 * @returns {Object} Spike analysis
 */
export function analyzeVolumeSpike(candles, spikeThreshold = 2) {
  if (!candles || candles.length < 21) {
    return { hasSpike: false, spikeRatio: 0 };
  }

  const volumes = candles.map(c => c.volume || 0);
  const avgVolume = calculateAverageVolume(volumes.slice(-21, -1)); // Exclude last candle
  const lastVolume = volumes[volumes.length - 1];

  const spikeRatio = avgVolume > 0 ? lastVolume / avgVolume : 0;
  const hasSpike = spikeRatio >= spikeThreshold;

  return {
    hasSpike,
    spikeRatio: Number(spikeRatio.toFixed(2)),
    lastVolume: Math.round(lastVolume),
    avgVolume: Math.round(avgVolume),
    spikeStrength: hasSpike ? (spikeRatio >= 3 ? 'STRONG' : 'MODERATE') : 'NONE'
  };
}

export default {
  analyzeVolumeProfile,
  confirmVolumeDirection,
  analyzeVolumeSpike
};
