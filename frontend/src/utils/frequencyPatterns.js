/**
 * GEM Frequency Patterns Detection
 * Core pattern detector for the 6 GEM Frequency Trading Method patterns
 *
 * Patterns:
 * 1. DPD (Down-Pause-Down) - Bearish Continuation - 68% win rate
 * 2. UPU (Up-Pause-Up) - Bullish Continuation - 71% win rate
 * 3. UPD (Up-Pause-Down) - Bearish Reversal - 65% win rate
 * 4. DPU (Down-Pause-Up) - Bullish Reversal - 69% win rate
 * 5. HFZ (High Frequency Zone) - Supply zone from DPD/UPD
 * 6. LFZ (Low Frequency Zone) - Demand zone from UPU/DPU
 *
 * ⚠️ CRITICAL: This is ZONE RETEST TRADING, not breakout trading!
 */

import { analyzeTrend, isImpulsiveMove } from './trendAnalysis.js';
import { detectPauseZones, createFrequencyZone, validatePauseZone } from './pauseZoneDetection.js';

/**
 * Pattern configuration and icons
 */
const PATTERN_CONFIGS = {
  DPD: {
    type: 'DPD',
    name: 'Down-Pause-Down',
    icon: '🔴📉⏸️📉',
    direction: 'bearish',
    category: 'continuation',
    zoneType: 'HFZ',
    winRate: 0.68,
    avgRR: 2.5
  },
  UPU: {
    type: 'UPU',
    name: 'Up-Pause-Up',
    icon: '🟢📈⏸️📈',
    direction: 'bullish',
    category: 'continuation',
    zoneType: 'LFZ',
    winRate: 0.71,
    avgRR: 2.8
  },
  UPD: {
    type: 'UPD',
    name: 'Up-Pause-Down',
    icon: '🔄📈⏸️📉',
    direction: 'bearish',
    category: 'reversal',
    zoneType: 'HFZ',
    winRate: 0.65,
    avgRR: 2.2
  },
  DPU: {
    type: 'DPU',
    name: 'Down-Pause-Up',
    icon: '🔄📉⏸️📈',
    direction: 'bullish',
    category: 'reversal',
    zoneType: 'LFZ',
    winRate: 0.69,
    avgRR: 2.6
  },
  HFZ: {
    type: 'HFZ',
    name: 'High Frequency Zone',
    icon: '🔺🔴',
    direction: 'bearish',
    category: 'zone',
    color: '#9C0612'
  },
  LFZ: {
    type: 'LFZ',
    name: 'Low Frequency Zone',
    icon: '🔻🟢',
    direction: 'bullish',
    category: 'zone',
    color: '#0ECB81'
  }
};

/**
 * Detect DPD (Down-Pause-Down) - Bearish Continuation Pattern
 * Structure: Downtrend → Pause (1-5 candles) → Resume Down
 *
 * @param {Array} candles - Candlestick data
 * @param {Object} config - Detection configuration
 * @returns {Object|null} Pattern data or null
 */
export function detectDPD(candles, config = {}) {
  const { lookback = 50, minConfidence = 0.6 } = config;

  if (candles.length < lookback) return null;

  const recentCandles = candles.slice(-lookback);

  // Phase 1: Identify downtrend (first move)
  const firstMoveCandles = recentCandles.slice(0, Math.floor(lookback * 0.4));
  const trendAnalysis = analyzeTrend(firstMoveCandles);

  if (trendAnalysis.trend !== 'downtrend') return null;

  // Phase 2: Find pause zone
  const pauseZones = detectPauseZones(recentCandles, {
    minLength: 1,
    maxLength: 5,
    lookbackPeriod: lookback
  });

  if (pauseZones.length === 0) return null;

  // Get most recent pause zone
  const pauseZone = pauseZones[pauseZones.length - 1];
  const validation = validatePauseZone(pauseZone, recentCandles);

  if (!validation.isValid) return null;

  // Phase 3: Check if downtrend resumed after pause
  const afterPauseStart = pauseZone.endIndex + 1;
  const afterPauseCandles = recentCandles.slice(afterPauseStart);

  if (afterPauseCandles.length < 2) return null;

  // Check if price moved down after pause (continuation)
  const resumeDown = isImpulsiveMove(afterPauseCandles, 'down');

  if (!resumeDown) return null;

  // Calculate confidence based on pattern clarity
  const confidence = calculatePatternConfidence({
    trendStrength: trendAnalysis.confidence,
    pauseQuality: validation.confidence,
    resumptionStrength: 70 // TODO: Calculate based on afterPauseCandles
  });

  if (confidence < minConfidence * 100) return null;

  // Create HFZ (High Frequency Zone) from pause
  const hfz = createFrequencyZone(pauseZone, 'HFZ', {
    patternType: 'DPD',
    confidence: confidence / 100
  });

  // Calculate trading levels
  const currentPrice = candles[candles.length - 1].close;
  const levels = calculateTradingLevels(currentPrice, hfz, 'bearish');

  return {
    symbol: candles[0].symbol || 'UNKNOWN',
    patternType: PATTERN_CONFIGS.DPD.name,
    patternCode: 'DPD',
    patternIcon: PATTERN_CONFIGS.DPD.icon,
    patternCategory: 'continuation',
    direction: 'bearish',
    confidence: confidence / 100,
    entry: levels.entry,
    stopLoss: levels.stopLoss,
    takeProfit: levels.takeProfit,
    timestamp: new Date().toISOString(),
    zone: hfz,
    zoneStatus: 'fresh',
    retestCount: 0,
    waitingRetest: true, // ⚠️ CRITICAL: Wait for retest!
    patternImage: null
  };
}

/**
 * Detect UPU (Up-Pause-Up) - Bullish Continuation Pattern
 * Structure: Uptrend → Pause (1-5 candles) → Resume Up
 *
 * @param {Array} candles - Candlestick data
 * @param {Object} config - Detection configuration
 * @returns {Object|null} Pattern data or null
 */
export function detectUPU(candles, config = {}) {
  const { lookback = 50, minConfidence = 0.6 } = config;

  if (candles.length < lookback) return null;

  const recentCandles = candles.slice(-lookback);

  // Phase 1: Identify uptrend (first move)
  const firstMoveCandles = recentCandles.slice(0, Math.floor(lookback * 0.4));
  const trendAnalysis = analyzeTrend(firstMoveCandles);

  if (trendAnalysis.trend !== 'uptrend') return null;

  // Phase 2: Find pause zone
  const pauseZones = detectPauseZones(recentCandles, {
    minLength: 1,
    maxLength: 5,
    lookbackPeriod: lookback
  });

  if (pauseZones.length === 0) return null;

  const pauseZone = pauseZones[pauseZones.length - 1];
  const validation = validatePauseZone(pauseZone, recentCandles);

  if (!validation.isValid) return null;

  // Phase 3: Check if uptrend resumed after pause
  const afterPauseStart = pauseZone.endIndex + 1;
  const afterPauseCandles = recentCandles.slice(afterPauseStart);

  if (afterPauseCandles.length < 2) return null;

  const resumeUp = isImpulsiveMove(afterPauseCandles, 'up');

  if (!resumeUp) return null;

  // Calculate confidence
  const confidence = calculatePatternConfidence({
    trendStrength: trendAnalysis.confidence,
    pauseQuality: validation.confidence,
    resumptionStrength: 70
  });

  if (confidence < minConfidence * 100) return null;

  // Create LFZ (Low Frequency Zone) from pause
  const lfz = createFrequencyZone(pauseZone, 'LFZ', {
    patternType: 'UPU',
    confidence: confidence / 100
  });

  const currentPrice = candles[candles.length - 1].close;
  const levels = calculateTradingLevels(currentPrice, lfz, 'bullish');

  return {
    symbol: candles[0].symbol || 'UNKNOWN',
    patternType: PATTERN_CONFIGS.UPU.name,
    patternCode: 'UPU',
    patternIcon: PATTERN_CONFIGS.UPU.icon,
    patternCategory: 'continuation',
    direction: 'bullish',
    confidence: confidence / 100,
    entry: levels.entry,
    stopLoss: levels.stopLoss,
    takeProfit: levels.takeProfit,
    timestamp: new Date().toISOString(),
    zone: lfz,
    zoneStatus: 'fresh',
    retestCount: 0,
    waitingRetest: true,
    patternImage: null
  };
}

/**
 * Detect UPD (Up-Pause-Down) - Bearish Reversal Pattern
 * Structure: Uptrend → Pause → Reversal Down
 *
 * @param {Array} candles - Candlestick data
 * @param {Object} config - Detection configuration
 * @returns {Object|null} Pattern data or null
 */
export function detectUPD(candles, config = {}) {
  const { lookback = 50, minConfidence = 0.6 } = config;

  if (candles.length < lookback) return null;

  const recentCandles = candles.slice(-lookback);

  // Phase 1: Identify uptrend before pause
  const firstMoveCandles = recentCandles.slice(0, Math.floor(lookback * 0.4));
  const trendAnalysis = analyzeTrend(firstMoveCandles);

  if (trendAnalysis.trend !== 'uptrend') return null;

  // Phase 2: Find pause zone
  const pauseZones = detectPauseZones(recentCandles, {
    minLength: 1,
    maxLength: 5,
    lookbackPeriod: lookback
  });

  if (pauseZones.length === 0) return null;

  const pauseZone = pauseZones[pauseZones.length - 1];
  const validation = validatePauseZone(pauseZone, recentCandles);

  if (!validation.isValid) return null;

  // Phase 3: Check for REVERSAL down (not continuation up)
  const afterPauseStart = pauseZone.endIndex + 1;
  const afterPauseCandles = recentCandles.slice(afterPauseStart);

  if (afterPauseCandles.length < 2) return null;

  const reversalDown = isImpulsiveMove(afterPauseCandles, 'down');

  if (!reversalDown) return null;

  // Calculate confidence (reversals need stronger confirmation)
  const confidence = calculatePatternConfidence({
    trendStrength: trendAnalysis.confidence,
    pauseQuality: validation.confidence,
    resumptionStrength: 60 // Slightly lower for reversals
  }) * 0.9; // Reversals are slightly less reliable

  if (confidence < minConfidence * 100) return null;

  // Create HFZ from pause (now a supply zone)
  const hfz = createFrequencyZone(pauseZone, 'HFZ', {
    patternType: 'UPD',
    confidence: confidence / 100
  });

  const currentPrice = candles[candles.length - 1].close;
  const levels = calculateTradingLevels(currentPrice, hfz, 'bearish');

  return {
    symbol: candles[0].symbol || 'UNKNOWN',
    patternType: PATTERN_CONFIGS.UPD.name,
    patternCode: 'UPD',
    patternIcon: PATTERN_CONFIGS.UPD.icon,
    patternCategory: 'reversal',
    direction: 'bearish',
    confidence: confidence / 100,
    entry: levels.entry,
    stopLoss: levels.stopLoss,
    takeProfit: levels.takeProfit,
    timestamp: new Date().toISOString(),
    zone: hfz,
    zoneStatus: 'fresh',
    retestCount: 0,
    waitingRetest: true,
    patternImage: null
  };
}

/**
 * Detect DPU (Down-Pause-Up) - Bullish Reversal Pattern
 * Structure: Downtrend → Pause → Reversal Up
 *
 * @param {Array} candles - Candlestick data
 * @param {Object} config - Detection configuration
 * @returns {Object|null} Pattern data or null
 */
export function detectDPU(candles, config = {}) {
  const { lookback = 50, minConfidence = 0.6 } = config;

  if (candles.length < lookback) return null;

  const recentCandles = candles.slice(-lookback);

  // Phase 1: Identify downtrend before pause
  const firstMoveCandles = recentCandles.slice(0, Math.floor(lookback * 0.4));
  const trendAnalysis = analyzeTrend(firstMoveCandles);

  if (trendAnalysis.trend !== 'downtrend') return null;

  // Phase 2: Find pause zone
  const pauseZones = detectPauseZones(recentCandles, {
    minLength: 1,
    maxLength: 5,
    lookbackPeriod: lookback
  });

  if (pauseZones.length === 0) return null;

  const pauseZone = pauseZones[pauseZones.length - 1];
  const validation = validatePauseZone(pauseZone, recentCandles);

  if (!validation.isValid) return null;

  // Phase 3: Check for REVERSAL up
  const afterPauseStart = pauseZone.endIndex + 1;
  const afterPauseCandles = recentCandles.slice(afterPauseStart);

  if (afterPauseCandles.length < 2) return null;

  const reversalUp = isImpulsiveMove(afterPauseCandles, 'up');

  if (!reversalUp) return null;

  // Calculate confidence
  const confidence = calculatePatternConfidence({
    trendStrength: trendAnalysis.confidence,
    pauseQuality: validation.confidence,
    resumptionStrength: 60
  }) * 0.9;

  if (confidence < minConfidence * 100) return null;

  // Create LFZ from pause (now a demand zone)
  const lfz = createFrequencyZone(pauseZone, 'LFZ', {
    patternType: 'DPU',
    confidence: confidence / 100
  });

  const currentPrice = candles[candles.length - 1].close;
  const levels = calculateTradingLevels(currentPrice, lfz, 'bullish');

  return {
    symbol: candles[0].symbol || 'UNKNOWN',
    patternType: PATTERN_CONFIGS.DPU.name,
    patternCode: 'DPU',
    patternIcon: PATTERN_CONFIGS.DPU.icon,
    patternCategory: 'reversal',
    direction: 'bullish',
    confidence: confidence / 100,
    entry: levels.entry,
    stopLoss: levels.stopLoss,
    takeProfit: levels.takeProfit,
    timestamp: new Date().toISOString(),
    zone: lfz,
    zoneStatus: 'fresh',
    retestCount: 0,
    waitingRetest: true,
    patternImage: null
  };
}

/**
 * Calculate pattern confidence based on multiple factors
 * @param {Object} factors - Confidence factors
 * @returns {number} Confidence percentage (0-100)
 */
function calculatePatternConfidence(factors) {
  const {
    trendStrength = 50,
    pauseQuality = 50,
    resumptionStrength = 50
  } = factors;

  // Weighted average
  const confidence = (
    trendStrength * 0.4 +
    pauseQuality * 0.3 +
    resumptionStrength * 0.3
  );

  return Math.min(100, Math.max(0, confidence));
}

/**
 * Calculate trading levels (Entry, Stop Loss, Take Profit)
 * based on GEM Frequency Method zone retest strategy
 *
 * @param {number} currentPrice - Current market price
 * @param {Object} zone - Frequency zone (HFZ or LFZ)
 * @param {string} direction - 'bullish' or 'bearish'
 * @returns {Object} Trading levels
 */
function calculateTradingLevels(currentPrice, zone, direction) {
  const zoneMid = zone.mid;
  const zoneRange = zone.high - zone.low;

  if (direction === 'bullish') {
    // LONG setup from LFZ
    const entry = zone.mid; // Enter at zone midpoint on retest
    const stopLoss = zone.low - (zoneRange * 0.5); // SL below zone
    const tp1 = entry + (entry - stopLoss) * 1.5; // 1:1.5 R:R
    const tp2 = entry + (entry - stopLoss) * 2.5; // 1:2.5 R:R
    const tp3 = entry + (entry - stopLoss) * 3.5; // 1:3.5 R:R

    return {
      entry: parseFloat(entry.toFixed(2)),
      stopLoss: parseFloat(stopLoss.toFixed(2)),
      takeProfit: [
        parseFloat(tp1.toFixed(2)),
        parseFloat(tp2.toFixed(2)),
        parseFloat(tp3.toFixed(2))
      ]
    };
  } else {
    // SHORT setup from HFZ
    const entry = zone.mid;
    const stopLoss = zone.high + (zoneRange * 0.5); // SL above zone
    const tp1 = entry - (stopLoss - entry) * 1.5;
    const tp2 = entry - (stopLoss - entry) * 2.5;
    const tp3 = entry - (stopLoss - entry) * 3.5;

    return {
      entry: parseFloat(entry.toFixed(2)),
      stopLoss: parseFloat(stopLoss.toFixed(2)),
      takeProfit: [
        parseFloat(tp1.toFixed(2)),
        parseFloat(tp2.toFixed(2)),
        parseFloat(tp3.toFixed(2))
      ]
    };
  }
}

/**
 * Main pattern scanner - scans for all 6 GEM patterns
 *
 * @param {Array} candles - Candlestick data with {open, high, low, close, time, volume}
 * @param {Object} config - Configuration options
 * @returns {Array} Array of detected patterns
 */
export function scanForPatterns(candles, config = {}) {
  const {
    lookback = 50,
    minConfidence = 0.65,
    enabledPatterns = ['DPD', 'UPU', 'UPD', 'DPU']
  } = config;

  const patterns = [];

  // Scan for each enabled pattern
  if (enabledPatterns.includes('DPD')) {
    const dpd = detectDPD(candles, { lookback, minConfidence });
    if (dpd) patterns.push(dpd);
  }

  if (enabledPatterns.includes('UPU')) {
    const upu = detectUPU(candles, { lookback, minConfidence });
    if (upu) patterns.push(upu);
  }

  if (enabledPatterns.includes('UPD')) {
    const upd = detectUPD(candles, { lookback, minConfidence });
    if (upd) patterns.push(upd);
  }

  if (enabledPatterns.includes('DPU')) {
    const dpu = detectDPU(candles, { lookback, minConfidence });
    if (dpu) patterns.push(dpu);
  }

  // Sort by confidence (highest first)
  patterns.sort((a, b) => b.confidence - a.confidence);

  return patterns;
}

/**
 * Get the best pattern from scan results
 * @param {Array} patterns - Array of detected patterns
 * @returns {Object|null} Best pattern or null
 */
export function getBestPattern(patterns) {
  if (patterns.length === 0) return null;

  // Already sorted by confidence, return first
  return patterns[0];
}

/**
 * Export pattern configurations for UI
 */
export { PATTERN_CONFIGS };
