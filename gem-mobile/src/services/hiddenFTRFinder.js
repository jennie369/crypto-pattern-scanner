/**
 * GEM Mobile - Hidden FTR Finder
 * Find Hidden FTR (FTR visible only on LTF within HTF zone)
 *
 * Phase 2B: Hidden FTR Detection
 *
 * Purpose:
 * - Refine wide HTF zones
 * - Find precise entry points
 * - Reduce stop loss size
 * - Improve R:R significantly
 */

import { detectFTR } from './ftrDetector';
import { zonesOverlap } from './stackedZonesDetector';

// ═══════════════════════════════════════════════════════════
// HIDDEN FTR DETECTION
// ═══════════════════════════════════════════════════════════

/**
 * Find Hidden FTR within a HTF zone
 * @param {Object} htfZone - High timeframe zone
 * @param {Array} ltfCandles - Lower timeframe candles
 * @param {string} ltfTimeframe - LTF timeframe string
 * @returns {Object|null} Hidden FTR or null
 */
export const findHiddenFTR = (htfZone, ltfCandles, ltfTimeframe) => {
  if (!htfZone || !ltfCandles || ltfCandles.length < 30) {
    return null;
  }

  const htfHigh = Math.max(htfZone.entryPrice || 0, htfZone.stopPrice || 0);
  const htfLow = Math.min(htfZone.entryPrice || 0, htfZone.stopPrice || 0);
  const htfZoneWidth = htfHigh - htfLow;

  // Zone too narrow to refine
  if (htfZoneWidth <= 0 || htfZoneWidth < htfLow * 0.001) {
    return null;
  }

  // Filter LTF candles that are within HTF zone range
  const zoneCandles = ltfCandles.filter(c =>
    (c.high >= htfLow && c.low <= htfHigh) ||
    (c.close >= htfLow && c.close <= htfHigh)
  );

  if (zoneCandles.length < 10) {
    return null;
  }

  // Detect FTR on LTF
  const ltfFTRs = detectFTR(ltfCandles);

  if (!ltfFTRs || ltfFTRs.length === 0) {
    return null;
  }

  // Find FTR that falls within HTF zone
  const hiddenFTR = ltfFTRs.find(ftr => {
    const ftrHigh = Math.max(ftr.entryPrice || 0, ftr.stopPrice || 0);
    const ftrLow = Math.min(ftr.entryPrice || 0, ftr.stopPrice || 0);

    // FTR must be inside HTF zone
    return ftrHigh <= htfHigh && ftrLow >= htfLow;
  });

  if (!hiddenFTR) {
    return null;
  }

  // Calculate improvement
  const hiddenFTRWidth = Math.abs((hiddenFTR.entryPrice || 0) - (hiddenFTR.stopPrice || 0));
  const widthReduction = ((htfZoneWidth - hiddenFTRWidth) / htfZoneWidth) * 100;

  return {
    ...hiddenFTR,
    isHiddenFTR: true,
    parentZone: {
      timeframe: htfZone.timeframe,
      entryPrice: htfZone.entryPrice,
      stopPrice: htfZone.stopPrice,
      zoneWidth: htfZoneWidth,
      zoneType: htfZone.zoneType,
    },
    hiddenFTRTimeframe: ltfTimeframe,
    refinement: {
      originalWidth: htfZoneWidth,
      refinedWidth: hiddenFTRWidth,
      widthReduction: parseFloat(widthReduction.toFixed(1)),
      rrImprovement: parseFloat((htfZoneWidth / hiddenFTRWidth).toFixed(1)) + 'x',
    },
    recommendation: widthReduction > 50
      ? 'Excellent refinement - Use Hidden FTR for entry'
      : widthReduction > 30
        ? 'Good refinement - Consider Hidden FTR'
        : 'Moderate refinement - HTF zone still valid',
    quality: widthReduction > 50 ? 'excellent' : widthReduction > 30 ? 'good' : 'moderate',
  };
};

// ═══════════════════════════════════════════════════════════
// TIMEFRAME MAPPING
// ═══════════════════════════════════════════════════════════

/**
 * Get recommended LTF for a given HTF
 * @param {string} htfTimeframe - Higher timeframe
 * @returns {Array} Recommended lower timeframes
 */
export const getRecommendedLTF = (htfTimeframe) => {
  const mapping = {
    '1M': ['1w', '1d'],
    '1w': ['1d', '4h'],
    '1d': ['4h', '1h'],
    '4h': ['1h', '30m'],
    '1h': ['15m', '5m'],
    '30m': ['5m', '1m'],
    '15m': ['5m', '1m'],
    '5m': ['1m'],
  };

  return mapping[htfTimeframe] || ['15m', '5m'];
};

/**
 * Get timeframe hierarchy level (higher = more important)
 * @param {string} timeframe - Timeframe string
 * @returns {number} Hierarchy level
 */
export const getTimeframeLevel = (timeframe) => {
  const levels = {
    '1M': 8,
    '1w': 7,
    '1d': 6,
    '4h': 5,
    '1h': 4,
    '30m': 3,
    '15m': 2,
    '5m': 1,
    '1m': 0,
  };
  return levels[timeframe] ?? 0;
};

// ═══════════════════════════════════════════════════════════
// NESTED ZONES DETECTION (Zone-in-Zone)
// ═══════════════════════════════════════════════════════════

/**
 * Find nested zones (Zone-in-Zone)
 * @param {Array} htfZones - Higher timeframe zones
 * @param {Array} ltfZones - Lower timeframe zones
 * @returns {Array} Nested zone pairs
 */
export const findNestedZones = (htfZones, ltfZones) => {
  const nested = [];

  (htfZones || []).forEach(htfZone => {
    (ltfZones || []).forEach(ltfZone => {
      // Check if LTF zone is completely inside HTF zone
      const htfHigh = Math.max(htfZone.entryPrice || 0, htfZone.stopPrice || 0);
      const htfLow = Math.min(htfZone.entryPrice || 0, htfZone.stopPrice || 0);
      const ltfHigh = Math.max(ltfZone.entryPrice || 0, ltfZone.stopPrice || 0);
      const ltfLow = Math.min(ltfZone.entryPrice || 0, ltfZone.stopPrice || 0);

      const isNested = ltfHigh <= htfHigh && ltfLow >= htfLow;

      if (isNested && ltfZone.zoneType === htfZone.zoneType) {
        nested.push({
          parentZone: htfZone,
          childZone: ltfZone,
          confluenceStrength: calculateNestedStrength(htfZone, ltfZone),
          refinementPercent: parseFloat(
            (((htfHigh - htfLow) - (ltfHigh - ltfLow)) / (htfHigh - htfLow) * 100).toFixed(1)
          ),
        });
      }
    });
  });

  // Sort by confluence strength
  return nested.sort((a, b) => b.confluenceStrength - a.confluenceStrength);
};

/**
 * Calculate nested zone confluence strength
 * @param {Object} htfZone - HTF zone
 * @param {Object} ltfZone - LTF zone
 * @returns {number} Confluence strength
 */
const calculateNestedStrength = (htfZone, ltfZone) => {
  let strength = 3; // Base strength for nested

  // Bonus for same hierarchy
  const htfHierarchy = htfZone.zoneHierarchy?.toUpperCase?.() || htfZone.zoneHierarchy;
  const ltfHierarchy = ltfZone.zoneHierarchy?.toUpperCase?.() || ltfZone.zoneHierarchy;

  if (htfHierarchy === ltfHierarchy) {
    strength += 1;
  }

  // Bonus for DP/FTR
  if (htfHierarchy === 'DECISION_POINT' || htfZone.isDecisionPoint) strength += 2;
  if (ltfHierarchy === 'DECISION_POINT' || ltfZone.isDecisionPoint) strength += 2;
  if (htfHierarchy === 'FTR' || htfZone.isFTR) strength += 1;
  if (ltfHierarchy === 'FTR' || ltfZone.isFTR) strength += 1;

  // Bonus for freshness
  if ((htfZone.testCount || 0) === 0) strength += 1;
  if ((ltfZone.testCount || 0) === 0) strength += 1;

  return strength;
};

// ═══════════════════════════════════════════════════════════
// AUTO REFINEMENT
// ═══════════════════════════════════════════════════════════

/**
 * Auto-refine zone to LTF
 * @param {Object} htfZone - HTF zone to refine
 * @param {Function} fetchCandlesForTimeframe - Function to fetch candles
 * @returns {Object|null} Hidden FTR or null
 */
export const autoRefineZone = async (htfZone, fetchCandlesForTimeframe) => {
  if (!htfZone || !fetchCandlesForTimeframe) return null;

  const recommendedLTFs = getRecommendedLTF(htfZone.timeframe);

  for (const ltf of recommendedLTFs) {
    try {
      const ltfCandles = await fetchCandlesForTimeframe(htfZone.symbol, ltf);
      const hiddenFTR = findHiddenFTR(htfZone, ltfCandles, ltf);

      if (hiddenFTR && parseFloat(hiddenFTR.refinement?.widthReduction || 0) > 30) {
        return hiddenFTR;
      }
    } catch (error) {
      console.warn(`[HiddenFTR] Error fetching ${ltf} candles:`, error);
    }
  }

  return null;
};

/**
 * Batch auto-refine multiple zones
 * @param {Array} htfZones - Array of HTF zones
 * @param {Function} fetchCandlesForTimeframe - Function to fetch candles
 * @returns {Array} Refined zones
 */
export const batchAutoRefine = async (htfZones, fetchCandlesForTimeframe) => {
  const results = [];

  for (const zone of (htfZones || [])) {
    const refined = await autoRefineZone(zone, fetchCandlesForTimeframe);
    if (refined) {
      results.push({
        original: zone,
        refined,
      });
    }
  }

  return results;
};

// ═══════════════════════════════════════════════════════════
// VALIDATION
// ═══════════════════════════════════════════════════════════

/**
 * Validate Hidden FTR quality
 * @param {Object} hiddenFTR - Hidden FTR to validate
 * @returns {Object} Validation result
 */
export const validateHiddenFTR = (hiddenFTR) => {
  if (!hiddenFTR) {
    return { isValid: false, reason: 'No Hidden FTR provided' };
  }

  const widthReduction = hiddenFTR.refinement?.widthReduction || 0;

  if (widthReduction < 20) {
    return {
      isValid: false,
      reason: 'Width reduction too small (<20%)',
      recommendation: 'Use original HTF zone instead',
    };
  }

  if (!hiddenFTR.parentZone) {
    return {
      isValid: false,
      reason: 'Missing parent zone reference',
    };
  }

  return {
    isValid: true,
    quality: widthReduction > 50 ? 'excellent' : 'good',
    recommendation: hiddenFTR.recommendation,
  };
};

// ═══════════════════════════════════════════════════════════
// DEFAULT EXPORT
// ═══════════════════════════════════════════════════════════

const hiddenFTRFinder = {
  findHiddenFTR,
  getRecommendedLTF,
  getTimeframeLevel,
  findNestedZones,
  autoRefineZone,
  batchAutoRefine,
  validateHiddenFTR,
};

export default hiddenFTRFinder;
