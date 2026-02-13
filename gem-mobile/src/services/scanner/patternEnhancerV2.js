/**
 * =====================================================
 * File: src/services/scanner/patternEnhancerV2.js
 * Description: V2 Pattern Enhancement Integration
 * Purpose: Integrates new validators with existing patternDetection
 * IMPORTANT: Does NOT modify zone drawing code
 * =====================================================
 */

import { validatePatternVolume, validateBreakoutVolume } from './volumeValidator';
import { validateZoneRetest, isPriceApproachingZone } from './zoneRetestValidator';
import { validateHigherTFTrend, analyzeTrend } from './mtfAnalyzer';
import { validateSwingQuality } from './swingPointValidator';
import { calculateConfidenceV2 } from './confidenceCalculatorV2';
import { getScannerConfig, getMergedConfig, isFeatureEnabled } from './scannerConfigService';
import { hasAccess, getAccessConfig } from '../../constants/scannerAccess';
import { CONFIDENCE_CONFIG } from '../../constants/scannerDefaults';

/**
 * Apply V2 enhancements to a pattern
 *
 * @param {Object} pattern - Base pattern from patternDetection
 * @param {Array} candles - OHLCV candle data
 * @param {Object} zone - Zone object from pattern { high, low, type, direction }
 * @param {Object} options - Enhancement options
 * @param {number} options.userTier - User tier level (0-3)
 * @param {string} options.symbol - Trading symbol
 * @param {string} options.timeframe - Timeframe
 * @param {Array} options.historicalCandles - Historical candles for volume avg
 * @returns {Promise<Object>} Enhanced pattern with V2 validation data
 *
 * @example
 * const enhanced = await applyV2Enhancements(pattern, candles, zone, {
 *   userTier: 1,
 *   symbol: 'BTCUSDT',
 *   timeframe: '1h',
 *   historicalCandles: historicalData,
 * });
 */
export async function applyV2Enhancements(pattern, candles, zone, options = {}) {
  const { userTier = 0, symbol, timeframe, historicalCandles } = options;

  console.log('[patternEnhancerV2] Starting V2 enhancements:', {
    patternType: pattern?.type || pattern?.patternType,
    direction: pattern?.direction,
    symbol,
    timeframe,
    userTier,
  });

  // Get user config
  const config = await getMergedConfig(userTier);
  const accessConfig = getAccessConfig(userTier);

  // Initialize V2 enhancement data
  const v2Enhancements = {
    version: 2,
    userTier,
    validations: {},
    scores: {},
    warnings: [],
  };

  // === 1. VOLUME VALIDATION (TIER 1+) ===
  if (hasAccess(userTier, 'volumeValidation') && historicalCandles?.length > 0) {
    try {
      const patternCandles = candles.slice(-5); // Last 5 candles of pattern
      const volumeResult = validatePatternVolume(patternCandles, historicalCandles, {
        volumeThresholds: {
          STRONG: config.volume_strong,
          GOOD: config.volume_good,
          ACCEPTABLE: config.volume_acceptable,
          MINIMUM: config.volume_minimum,
          REJECT: config.volume_reject,
        },
      });

      v2Enhancements.validations.volume = volumeResult;
      v2Enhancements.scores.volume = volumeResult.score;

      if (!volumeResult.valid && volumeResult.grade === 'REJECT') {
        v2Enhancements.warnings.push('Volume qua thap - pattern co the khong manh');
      }

      console.log('[patternEnhancerV2] Volume validation:', volumeResult.grade, volumeResult.score);
    } catch (error) {
      console.error('[patternEnhancerV2] Volume validation error:', error);
      v2Enhancements.validations.volume = { valid: false, error: error.message };
    }
  } else {
    v2Enhancements.validations.volume = { locked: true, requiredTier: 1 };
  }

  // === 2. ZONE RETEST VALIDATION (TIER 1+) ===
  if (hasAccess(userTier, 'zoneRetest') && zone) {
    try {
      const recentCandles = candles.slice(-config.zone_retest_lookback || -5);
      const retestResult = validateZoneRetest(zone, recentCandles, {
        zoneRetestLookback: config.zone_retest_lookback,
      });

      v2Enhancements.validations.zoneRetest = retestResult;
      v2Enhancements.scores.zoneRetest = retestResult.score;

      if (!retestResult.valid && config.zone_retest_required) {
        v2Enhancements.warnings.push('Chua co zone retest - can doi price retest zone');
      }

      console.log('[patternEnhancerV2] Zone retest:', retestResult.valid ? retestResult.retestStrength : 'Not found');
    } catch (error) {
      console.error('[patternEnhancerV2] Zone retest error:', error);
      v2Enhancements.validations.zoneRetest = { valid: false, error: error.message };
    }
  } else {
    v2Enhancements.validations.zoneRetest = { locked: true, requiredTier: 1 };
  }

  // === 3. MTF ANALYSIS (TIER 2+) ===
  if (hasAccess(userTier, 'mtfAnalysis') && symbol && timeframe) {
    try {
      const mtfResult = await validateHigherTFTrend(symbol, timeframe, pattern.direction, {
        mtfTrendStrengthThreshold: config.mtf_strength_threshold,
      });

      v2Enhancements.validations.htfAlignment = mtfResult;
      v2Enhancements.scores.htfAlignment = (mtfResult.bonus || 0) + (mtfResult.penalty || 0);

      if (!mtfResult.valid) {
        v2Enhancements.warnings.push(mtfResult.reason || 'Nguoc trend timeframe cao hon');
      }

      console.log('[patternEnhancerV2] MTF analysis:', mtfResult.valid ? 'Aligned' : 'Counter', mtfResult.bonus, mtfResult.penalty);
    } catch (error) {
      console.error('[patternEnhancerV2] MTF analysis error:', error);
      v2Enhancements.validations.htfAlignment = { valid: true, error: error.message, bonus: 0, penalty: 0 };
    }
  } else {
    v2Enhancements.validations.htfAlignment = { locked: true, requiredTier: 2 };
  }

  // === 4. SWING QUALITY (TIER 2+) ===
  if (hasAccess(userTier, 'swingQuality')) {
    try {
      const swingResult = validateSwingQuality(candles, pattern, {
        swingLookback: config.swing_lookback,
        swingMinConfirmations: config.swing_min_confirmations,
      });

      v2Enhancements.validations.swingQuality = swingResult;
      v2Enhancements.scores.swingQuality = swingResult.score;

      console.log('[patternEnhancerV2] Swing quality:', swingResult.quality, swingResult.score);
    } catch (error) {
      console.error('[patternEnhancerV2] Swing quality error:', error);
      v2Enhancements.validations.swingQuality = { valid: false, error: error.message };
    }
  } else {
    v2Enhancements.validations.swingQuality = { locked: true, requiredTier: 2 };
  }

  // === 5. BREAKOUT VALIDATION (TIER 1+ - for breakout patterns) ===
  const breakoutPatterns = ['TRIANGLE', 'FLAG', 'WEDGE', 'ASCENDING_TRIANGLE', 'DESCENDING_TRIANGLE', 'SYMMETRICAL_TRIANGLE'];
  if (hasAccess(userTier, 'breakoutValidation') && breakoutPatterns.includes(pattern?.type?.toUpperCase())) {
    try {
      const breakoutLevel = pattern.breakoutLevel || (pattern.direction === 'LONG' ? zone?.high : zone?.low);
      if (breakoutLevel) {
        const breakoutResult = validateBreakoutVolume(candles, breakoutLevel, pattern.direction);
        v2Enhancements.validations.breakout = breakoutResult;
        v2Enhancements.scores.breakout = breakoutResult.score;

        if (!breakoutResult.valid) {
          v2Enhancements.warnings.push(breakoutResult.reason || 'Breakout chua duoc confirm');
        }
      }
    } catch (error) {
      console.error('[patternEnhancerV2] Breakout validation error:', error);
    }
  }

  // === 6. CALCULATE CONFIDENCE V2 ===
  const confidenceFactors = {
    volume: v2Enhancements.validations.volume,
    zoneRetest: v2Enhancements.validations.zoneRetest,
    htfAlignment: v2Enhancements.validations.htfAlignment,
    swingQuality: v2Enhancements.validations.swingQuality,
    config: {
      zoneRetestRequired: config.zone_retest_required,
    },
  };

  // Add pattern quality from existing enhancements if available
  if (pattern.enhancements?.candle) {
    confidenceFactors.candleConfirmation = {
      valid: pattern.enhancements.candle.hasConfirmation,
      score: pattern.enhancements.candle.score,
      type: pattern.enhancements.candle.signals?.[0],
    };
  }

  // Add RSI divergence from existing enhancements if available
  if (pattern.enhancements?.rsi) {
    confidenceFactors.rsiDivergence = {
      type: pattern.enhancements.rsi.type,
      strength: pattern.enhancements.rsi.hasDivergence ? 'MEDIUM' : null,
      rsiValue: pattern.enhancements.rsi.currentRSI,
    };
  }

  // Add S/R confluence from existing enhancements if available
  if (pattern.enhancements?.confluence) {
    confidenceFactors.srConfluence = {
      score: pattern.enhancements.confluence.score,
      levels: pattern.enhancements.confluence.notes,
      count: pattern.enhancements.confluence.hasConfluence ? 1 : 0,
    };
  }

  const confidenceV2 = calculateConfidenceV2(confidenceFactors);

  v2Enhancements.confidence = confidenceV2;

  // Combine warnings
  v2Enhancements.warnings = [...v2Enhancements.warnings, ...(confidenceV2.warnings || [])];

  console.log('[patternEnhancerV2] V2 Confidence:', confidenceV2.score, confidenceV2.grade);

  // === BUILD ENHANCED PATTERN ===
  return {
    ...pattern,
    // V2 data
    v2: v2Enhancements,
    // Override confidence with V2 score if higher tier
    confidence: userTier >= 1 ? confidenceV2.score : pattern.confidence,
    confidenceV2: confidenceV2.score,
    confidenceGrade: confidenceV2.grade,
    confidenceBreakdown: confidenceV2.breakdown,
    // Validation summary
    volumeValid: v2Enhancements.validations.volume?.valid,
    volumeGrade: v2Enhancements.validations.volume?.grade,
    volumeRatio: v2Enhancements.validations.volume?.volumeRatio,
    retestValid: v2Enhancements.validations.zoneRetest?.valid,
    retestStrength: v2Enhancements.validations.zoneRetest?.retestStrength,
    htfAligned: v2Enhancements.validations.htfAlignment?.valid,
    htfTrend: v2Enhancements.validations.htfAlignment?.htfTrend,
    // Warnings
    v2Warnings: v2Enhancements.warnings,
    recommendation: confidenceV2.recommendation,
    // Flag
    hasV2Enhancements: true,
  };
}

/**
 * Check if pattern should be rejected based on V2 validations
 *
 * @param {Object} v2Enhancements - V2 enhancement data
 * @returns {Object} { reject: boolean, reason: string }
 */
export function shouldRejectPattern(v2Enhancements) {
  if (!v2Enhancements) {
    return { reject: false };
  }

  // Volume reject
  if (v2Enhancements.validations?.volume?.grade === 'REJECT') {
    return {
      reject: true,
      reason: 'Volume qua thap - khong du xac nhan',
    };
  }

  // Strong counter HTF trend
  if (v2Enhancements.validations?.htfAlignment?.valid === false &&
      v2Enhancements.validations?.htfAlignment?.penalty <= -15) {
    return {
      reject: true,
      reason: 'Nguoc trend timeframe cao hon qua manh',
    };
  }

  // Very low confidence
  if (v2Enhancements.confidence?.score < CONFIDENCE_CONFIG.MIN_THRESHOLD) {
    return {
      reject: true,
      reason: `Confidence qua thap (${v2Enhancements.confidence.score}% < ${CONFIDENCE_CONFIG.MIN_THRESHOLD}%)`,
    };
  }

  return { reject: false };
}

/**
 * Filter patterns based on V2 validations
 *
 * @param {Array} patterns - Array of enhanced patterns
 * @param {Object} filters - Filter options
 * @returns {Array} Filtered patterns
 */
export function filterPatternsV2(patterns, filters = {}) {
  const {
    minConfidence = CONFIDENCE_CONFIG.MIN_THRESHOLD,
    minGrade = 'C',
    volumeRequired = false,
    retestRequired = false,
    htfAlignedOnly = false,
  } = filters;

  const gradeOrder = { 'A+': 6, 'A': 5, 'B+': 4, 'B': 3, 'C': 2, 'REJECT': 1 };
  const minGradeValue = gradeOrder[minGrade] || 0;

  return patterns.filter(p => {
    // Confidence filter
    if ((p.confidenceV2 || p.confidence) < minConfidence) {
      return false;
    }

    // Grade filter
    const patternGradeValue = gradeOrder[p.confidenceGrade] || 0;
    if (patternGradeValue < minGradeValue) {
      return false;
    }

    // Volume filter
    if (volumeRequired && !p.volumeValid) {
      return false;
    }

    // Retest filter
    if (retestRequired && !p.retestValid) {
      return false;
    }

    // HTF alignment filter
    if (htfAlignedOnly && p.htfAligned === false) {
      return false;
    }

    return true;
  });
}

/**
 * Sort patterns by V2 score
 *
 * @param {Array} patterns - Array of enhanced patterns
 * @param {string} sortBy - Sort field ('confidence', 'grade', 'volume')
 * @returns {Array} Sorted patterns
 */
export function sortPatternsV2(patterns, sortBy = 'confidence') {
  const gradeOrder = { 'A+': 6, 'A': 5, 'B+': 4, 'B': 3, 'C': 2, 'REJECT': 1 };

  return [...patterns].sort((a, b) => {
    switch (sortBy) {
      case 'grade':
        const gradeA = gradeOrder[a.confidenceGrade] || 0;
        const gradeB = gradeOrder[b.confidenceGrade] || 0;
        if (gradeA !== gradeB) return gradeB - gradeA;
        return (b.confidenceV2 || b.confidence) - (a.confidenceV2 || a.confidence);

      case 'volume':
        const volA = a.volumeRatio || 0;
        const volB = b.volumeRatio || 0;
        return volB - volA;

      case 'confidence':
      default:
        return (b.confidenceV2 || b.confidence) - (a.confidenceV2 || a.confidence);
    }
  });
}

/**
 * Get V2 enhancement summary for display
 *
 * @param {Object} pattern - Enhanced pattern
 * @returns {Object} Summary object
 */
export function getV2Summary(pattern) {
  if (!pattern?.v2) {
    return null;
  }

  const { v2 } = pattern;

  return {
    confidence: v2.confidence?.score,
    grade: v2.confidence?.grade,
    isValid: v2.confidence?.isValid,
    volume: {
      valid: v2.validations.volume?.valid,
      grade: v2.validations.volume?.grade,
      ratio: v2.validations.volume?.volumeRatio,
      locked: v2.validations.volume?.locked,
    },
    retest: {
      valid: v2.validations.zoneRetest?.valid,
      strength: v2.validations.zoneRetest?.retestStrength,
      locked: v2.validations.zoneRetest?.locked,
    },
    htf: {
      valid: v2.validations.htfAlignment?.valid,
      trend: v2.validations.htfAlignment?.htfTrend,
      timeframe: v2.validations.htfAlignment?.htfTimeframe,
      locked: v2.validations.htfAlignment?.locked,
    },
    swing: {
      valid: v2.validations.swingQuality?.valid,
      quality: v2.validations.swingQuality?.quality,
      locked: v2.validations.swingQuality?.locked,
    },
    warnings: v2.warnings,
    recommendation: v2.confidence?.recommendation,
  };
}

export default {
  applyV2Enhancements,
  shouldRejectPattern,
  filterPatternsV2,
  sortPatternsV2,
  getV2Summary,
};
