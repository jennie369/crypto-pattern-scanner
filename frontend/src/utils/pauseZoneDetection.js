/**
 * Pause Zone Detection Utility
 * GEM Frequency Trading Method - Phase 2: Identify Consolidation Zones
 *
 * Detects "pause zones" - consolidation periods (1-5 candles) with low volatility
 * These zones become HFZ (High Frequency Zone) or LFZ (Low Frequency Zone)
 * Critical for identifying entry points in zone retest trading
 */

import { calculateATR } from './trendAnalysis.js';

/**
 * Calculate candle range (high - low)
 * @param {Object} candle - Candlestick data
 * @returns {number} Range value
 */
function getCandleRange(candle) {
  return candle.high - candle.low;
}

/**
 * Calculate average range of candles
 * @param {Array} candles - Array of candles
 * @returns {number} Average range
 */
function getAverageRange(candles) {
  const sum = candles.reduce((acc, candle) => acc + getCandleRange(candle), 0);
  return sum / candles.length;
}

/**
 * Check if candles form a consolidation (sideways movement)
 * @param {Array} candles - Segment of candles to analyze
 * @param {number} threshold - Maximum allowed range expansion (default: 0.4 = 40%)
 * @returns {boolean} True if consolidating
 */
export function isConsolidating(candles, threshold = 0.4) {
  if (candles.length < 2) return false;

  const avgRange = getAverageRange(candles);
  const high = Math.max(...candles.map(c => c.high));
  const low = Math.min(...candles.map(c => c.low));
  const totalRange = high - low;

  // Consolidation: Total range should not be much larger than average single candle range
  const expectedRange = avgRange * candles.length;
  const rangeExpansion = totalRange / expectedRange;

  return rangeExpansion <= (1 + threshold);
}

/**
 * Detect if a candle segment has decreasing volume
 * Volume typically decreases during pause/consolidation
 *
 * @param {Array} candles - Candles with volume data
 * @returns {boolean} True if volume is decreasing
 */
export function hasDecreasingVolume(candles) {
  if (candles.length < 2) return false;
  if (!candles[0].volume) return false; // No volume data available

  let decreasingCount = 0;
  for (let i = 1; i < candles.length; i++) {
    if (candles[i].volume < candles[i - 1].volume) {
      decreasingCount++;
    }
  }

  // At least 60% of candles should have decreasing volume
  return decreasingCount / (candles.length - 1) >= 0.6;
}

/**
 * Calculate volatility ratio for a candle segment
 * Low volatility indicates pause/consolidation
 *
 * @param {Array} candles - Candles to analyze
 * @param {Array} referenceCandles - Larger dataset for comparison
 * @returns {number} Volatility ratio (0-1, lower = less volatile)
 */
export function calculateVolatilityRatio(candles, referenceCandles) {
  const segmentATR = calculateATR(candles, Math.min(candles.length, 14));
  const referenceATR = calculateATR(referenceCandles, 14);

  if (!segmentATR || !referenceATR) return 1;

  return segmentATR / referenceATR;
}

/**
 * Detect pause zones in candlestick data
 * A pause zone is a consolidation period of 1-5 candles with low volatility
 *
 * @param {Array} candles - Full candlestick dataset
 * @param {Object} config - Configuration options
 * @returns {Array} Array of detected pause zones
 */
export function detectPauseZones(candles, config = {}) {
  const {
    minLength = 1,        // Minimum pause zone length
    maxLength = 5,        // Maximum pause zone length
    volatilityThreshold = 0.6,  // Max volatility ratio (lower = stricter)
    consolidationThreshold = 0.4, // Max range expansion allowed
    lookbackPeriod = 50   // Candles to look back for analysis
  } = config;

  if (candles.length < lookbackPeriod) {
    return [];
  }

  const pauseZones = [];
  const recentCandles = candles.slice(-lookbackPeriod);

  // Scan for pause zones
  for (let i = maxLength; i < recentCandles.length - 1; i++) {
    // Try different pause lengths (1-5 candles)
    for (let length = minLength; length <= maxLength; length++) {
      const startIdx = i - length + 1;
      const pauseSegment = recentCandles.slice(startIdx, i + 1);

      // Check if this segment qualifies as a pause zone
      if (isPauseZone(pauseSegment, recentCandles, {
        volatilityThreshold,
        consolidationThreshold
      })) {
        // Calculate zone boundaries
        const zoneHigh = Math.max(...pauseSegment.map(c => c.high));
        const zoneLow = Math.min(...pauseSegment.map(c => c.low));
        const zoneMid = (zoneHigh + zoneLow) / 2;

        pauseZones.push({
          startIndex: candles.length - lookbackPeriod + startIdx,
          endIndex: candles.length - lookbackPeriod + i,
          length: length,
          high: zoneHigh,
          low: zoneLow,
          mid: zoneMid,
          candles: pauseSegment,
          timestamp: pauseSegment[pauseSegment.length - 1].time,
          volatility: calculateVolatilityRatio(pauseSegment, recentCandles)
        });

        // Move forward to avoid overlapping zones
        i += length;
        break;
      }
    }
  }

  // Filter out overlapping zones, keep the most significant ones
  return filterOverlappingZones(pauseZones);
}

/**
 * Check if a candle segment is a valid pause zone
 *
 * @param {Array} segment - Candle segment to test
 * @param {Array} reference - Reference dataset for comparison
 * @param {Object} thresholds - Threshold configuration
 * @returns {boolean} True if valid pause zone
 */
function isPauseZone(segment, reference, thresholds) {
  const { volatilityThreshold, consolidationThreshold } = thresholds;

  // Check 1: Is it consolidating?
  if (!isConsolidating(segment, consolidationThreshold)) {
    return false;
  }

  // Check 2: Low volatility compared to market
  const volatilityRatio = calculateVolatilityRatio(segment, reference);
  if (volatilityRatio > volatilityThreshold) {
    return false;
  }

  // Check 3: Preferably decreasing volume (optional, not strict)
  // const hasLowVolume = hasDecreasingVolume(segment);

  return true;
}

/**
 * Filter overlapping pause zones, keeping the most significant
 *
 * @param {Array} zones - Array of detected pause zones
 * @returns {Array} Filtered zones
 */
function filterOverlappingZones(zones) {
  if (zones.length === 0) return [];

  // Sort by start index
  zones.sort((a, b) => a.startIndex - b.startIndex);

  const filtered = [zones[0]];

  for (let i = 1; i < zones.length; i++) {
    const current = zones[i];
    const previous = filtered[filtered.length - 1];

    // Check if zones overlap
    if (current.startIndex <= previous.endIndex) {
      // Keep the zone with lower volatility (more stable)
      if (current.volatility < previous.volatility) {
        filtered[filtered.length - 1] = current;
      }
    } else {
      filtered.push(current);
    }
  }

  return filtered;
}

/**
 * Create a frequency zone (HFZ or LFZ) from a pause zone
 * This is what traders will wait to retest
 *
 * @param {Object} pauseZone - Detected pause zone
 * @param {string} type - 'HFZ' (High Frequency) or 'LFZ' (Low Frequency)
 * @param {Object} metadata - Additional pattern metadata
 * @returns {Object} Frequency zone object
 */
export function createFrequencyZone(pauseZone, type, metadata = {}) {
  return {
    type: type, // 'HFZ' or 'LFZ'
    high: pauseZone.high,
    low: pauseZone.low,
    mid: pauseZone.mid,
    startIndex: pauseZone.startIndex,
    endIndex: pauseZone.endIndex,
    timestamp: pauseZone.timestamp,
    status: 'fresh', // fresh, tested_1x, tested_2x, weak, broken
    retestCount: 0,
    createdBy: metadata.patternType || 'unknown',
    confidence: metadata.confidence || 0,
    color: type === 'HFZ' ? '#9C0612' : '#0ECB81', // Burgundy for HFZ, Green for LFZ
    ...metadata
  };
}

/**
 * Find the most recent pause zone before a given index
 * Used to identify the pause in Move-Pause-Move patterns
 *
 * @param {Array} candles - Candlestick data
 * @param {number} beforeIndex - Search before this index
 * @param {Object} config - Configuration
 * @returns {Object|null} Pause zone or null
 */
export function findRecentPauseZone(candles, beforeIndex, config = {}) {
  const {
    maxLookback = 20,
    minLength = 1,
    maxLength = 5,
    volatilityThreshold = 0.6
  } = config;

  const searchStart = Math.max(0, beforeIndex - maxLookback);
  const searchCandles = candles.slice(searchStart, beforeIndex);

  const zones = detectPauseZones(candles.slice(0, beforeIndex), {
    minLength,
    maxLength,
    volatilityThreshold,
    lookbackPeriod: Math.min(searchCandles.length, 50)
  });

  // Return the most recent zone
  if (zones.length > 0) {
    return zones[zones.length - 1];
  }

  return null;
}

/**
 * Validate if a pause zone is significant enough for trading
 * Filters out weak or unclear consolidations
 *
 * @param {Object} pauseZone - Pause zone to validate
 * @param {Array} candles - Full candlestick data
 * @returns {Object} Validation result
 */
export function validatePauseZone(pauseZone, candles) {
  const {
    high,
    low,
    volatility,
    length
  } = pauseZone;

  const zoneRange = high - low;
  const lastPrice = candles[candles.length - 1].close;
  const rangePercent = (zoneRange / lastPrice) * 100;

  // Validation criteria
  const validations = {
    hasReasonableRange: rangePercent >= 0.1 && rangePercent <= 3, // 0.1% - 3% range
    hasLowVolatility: volatility < 0.7,
    hasGoodLength: length >= 1 && length <= 5,
    isClear: true // Could add more complex checks
  };

  const isValid = Object.values(validations).every(v => v === true);

  return {
    isValid,
    confidence: isValid ? 80 : 40,
    rangePercent: rangePercent.toFixed(2),
    validations
  };
}

/**
 * Get pause zone quality score (0-100)
 * Higher score = better quality zone for trading
 *
 * @param {Object} pauseZone - Pause zone to score
 * @returns {number} Quality score
 */
export function getPauseZoneQuality(pauseZone) {
  let score = 100;

  // Penalize high volatility
  if (pauseZone.volatility > 0.5) {
    score -= (pauseZone.volatility - 0.5) * 100;
  }

  // Reward optimal length (3 candles is ideal)
  const lengthDiff = Math.abs(pauseZone.length - 3);
  score -= lengthDiff * 5;

  // Penalize very short zones (less clear)
  if (pauseZone.length === 1) {
    score -= 20;
  }

  return Math.max(0, Math.min(100, score));
}
