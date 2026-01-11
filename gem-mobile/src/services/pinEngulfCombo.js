/**
 * GEM Mobile - Pin Bar + Engulfing Combo Detector
 * Phase 3B: Detect powerful Pin + Engulf combo patterns
 *
 * Pin & Engulf Combo:
 * When both Pin Bar AND Engulfing pattern occur at zone
 * = VERY STRONG confirmation signal
 *
 * Scenarios:
 * 1. Pin Bar followed by Engulfing (most common)
 * 2. Engulfing candle that is also a Pin Bar (rare but strong)
 * 3. Pin Bar that gets engulfed next candle (continuation)
 */

import { detectPinBar } from './pinBarDetector';
import { detectEngulfing } from './engulfingDetector';

/**
 * Detect Pin + Engulf combo at zone
 * @param {Array} candles - Last 3-4 candles at zone
 * @param {Object} zone - The zone {zoneType: 'LFZ' | 'HFZ'}
 * @returns {Object|null} Combo pattern or null
 */
export const detectPinEngulfCombo = (candles, zone) => {
  if (!candles || candles.length < 2) return null;

  const current = candles[candles.length - 1];
  const previous = candles[candles.length - 2];
  const twoBefore = candles.length >= 3 ? candles[candles.length - 3] : null;

  const expectedType = zone?.zoneType === 'LFZ' ? 'bullish' : 'bearish';

  // Scenario 1: Pin Bar followed by Engulfing (most common)
  const pinBarOnPrevious = detectPinBar(previous);
  const engulfingOnCurrent = detectEngulfing(current, previous);

  if (pinBarOnPrevious && engulfingOnCurrent &&
      pinBarOnPrevious.type === expectedType &&
      engulfingOnCurrent.type === expectedType) {

    const pinScore = pinBarOnPrevious.score || 2;
    const engulfScore = engulfingOnCurrent.score || 3;
    const comboBonus = 2;
    const totalScore = pinScore + engulfScore + comboBonus;

    return {
      comboType: 'pin_then_engulf',
      comboTypeVi: 'Pin Bar → Engulfing',
      hasPinEngulfCombo: true,
      type: expectedType,

      pinBar: {
        ...pinBarOnPrevious,
        candleIndex: -2,
      },
      engulfing: {
        ...engulfingOnCurrent,
        candleIndex: -1,
      },

      // Combined scoring
      score: totalScore,
      scoreBreakdown: {
        pinBar: pinScore,
        engulfing: engulfScore,
        comboBonus,
      },

      strength: 'very_strong',
      strengthVi: 'Rất Mạnh',
      reliability: 85,

      entryPrice: current.close,
      stopLoss: expectedType === 'bullish'
        ? Math.min(previous.low, current.low)
        : Math.max(previous.high, current.high),

      recommendation: 'A+ ENTRY - Pin + Engulf combo at zone!',
      recommendationVi: 'A+ ENTRY - Combo Pin + Engulf tại zone!',

      detectedAt: new Date().toISOString(),
    };
  }

  // Scenario 2: Engulfing that is also a Pin Bar (rare but very strong)
  const pinBarOnCurrent = detectPinBar(current);
  const engulfingCurrent = detectEngulfing(current, previous);

  if (pinBarOnCurrent && engulfingCurrent &&
      pinBarOnCurrent.type === expectedType &&
      engulfingCurrent.type === expectedType) {

    const pinScore = pinBarOnCurrent.score || 2;
    const engulfScore = engulfingCurrent.score || 3;
    const comboBonus = 3; // Higher bonus for same candle

    return {
      comboType: 'pin_engulf_same_candle',
      comboTypeVi: 'Pin + Engulf cùng nến',
      hasPinEngulfCombo: true,
      type: expectedType,

      pinBar: {
        ...pinBarOnCurrent,
        candleIndex: -1,
      },
      engulfing: {
        ...engulfingCurrent,
        candleIndex: -1,
      },

      score: pinScore + engulfScore + comboBonus,
      scoreBreakdown: {
        pinBar: pinScore,
        engulfing: engulfScore,
        comboBonus,
      },

      strength: 'extremely_strong',
      strengthVi: 'Cực Mạnh',
      reliability: 90,

      entryPrice: current.close,
      stopLoss: expectedType === 'bullish' ? current.low : current.high,

      recommendation: 'A++ ENTRY - Same candle Pin + Engulf!',
      recommendationVi: 'A++ ENTRY - Pin + Engulf cùng nến!',

      detectedAt: new Date().toISOString(),
    };
  }

  // Scenario 3: Two-candle Pin that gets engulfed with continuation
  if (twoBefore) {
    const olderPinBar = detectPinBar(twoBefore);
    const followingEngulfing = detectEngulfing(previous, twoBefore);

    if (olderPinBar && followingEngulfing &&
        olderPinBar.type === expectedType &&
        followingEngulfing.type === expectedType) {

      // Check if current candle continues the move
      const continuationConfirmed = expectedType === 'bullish'
        ? current.close > previous.close
        : current.close < previous.close;

      if (continuationConfirmed) {
        const pinScore = olderPinBar.score || 2;
        const engulfScore = followingEngulfing.score || 3;
        const comboBonus = 1; // Lower bonus for continuation pattern

        return {
          comboType: 'pin_engulf_continuation',
          comboTypeVi: 'Pin + Engulf + Continuation',
          hasPinEngulfCombo: true,
          type: expectedType,

          pinBar: {
            ...olderPinBar,
            candleIndex: -3,
          },
          engulfing: {
            ...followingEngulfing,
            candleIndex: -2,
          },

          score: pinScore + engulfScore + comboBonus,
          scoreBreakdown: {
            pinBar: pinScore,
            engulfing: engulfScore,
            comboBonus,
          },

          strength: 'strong',
          strengthVi: 'Mạnh',
          reliability: 80,

          entryPrice: current.close,
          stopLoss: expectedType === 'bullish'
            ? Math.min(twoBefore.low, previous.low)
            : Math.max(twoBefore.high, previous.high),

          recommendation: 'A ENTRY - Pin + Engulf with continuation',
          recommendationVi: 'A ENTRY - Pin + Engulf có continuation',

          detectedAt: new Date().toISOString(),
        };
      }
    }
  }

  return null;
};

/**
 * Quick check for any strong combo at zone
 * @param {Array} candles - Candles at zone
 * @param {Object} zone - Zone data
 * @param {number} minScore - Minimum score to consider strong (default 6)
 * @returns {boolean} True if has strong combo
 */
export const hasStrongCombo = (candles, zone, minScore = 6) => {
  const combo = detectPinEngulfCombo(candles, zone);
  return combo !== null && combo.score >= minScore;
};

/**
 * Get combo summary for display
 * @param {Object} combo - Detected combo
 * @returns {Object} Summary for UI
 */
export const getComboSummary = (combo) => {
  if (!combo) {
    return {
      hasCombo: false,
      label: 'Không có combo',
      labelEn: 'No combo',
    };
  }

  return {
    hasCombo: true,
    type: combo.comboType,
    typeVi: combo.comboTypeVi,
    score: combo.score,
    strength: combo.strengthVi,
    strengthEn: combo.strength,
    reliability: combo.reliability,
    recommendation: combo.recommendationVi,
    recommendationEn: combo.recommendation,
    entryPrice: combo.entryPrice,
    stopLoss: combo.stopLoss,
  };
};

/**
 * Compare combo with regular confirmation
 * @param {Object} combo - Pin + Engulf combo
 * @param {Object} singlePattern - Single confirmation pattern
 * @returns {Object} Comparison result
 */
export const compareWithSinglePattern = (combo, singlePattern) => {
  const comboScore = combo?.score || 0;
  const singleScore = singlePattern?.score || 0;

  return {
    preferCombo: comboScore > singleScore,
    scoreDifference: comboScore - singleScore,
    reliabilityDifference: (combo?.reliability || 0) - (singlePattern?.pattern?.reliability || 0),
    recommendation: comboScore > singleScore
      ? 'Ưu tiên combo - Score cao hơn và reliability tốt hơn'
      : 'Có thể dùng single pattern nếu không có combo',
  };
};

/**
 * Get all combos from multiple candle windows
 * @param {Array} candles - All candles at zone
 * @param {Object} zone - Zone data
 * @returns {Array} All detected combos
 */
export const scanForCombos = (candles, zone) => {
  if (!candles || candles.length < 3) return [];

  const combos = [];

  // Scan with sliding window
  for (let i = 2; i < candles.length; i++) {
    const window = candles.slice(Math.max(0, i - 2), i + 1);
    const combo = detectPinEngulfCombo(window, zone);
    if (combo) {
      combos.push({
        ...combo,
        windowEnd: i,
      });
    }
  }

  // Sort by score (highest first)
  return combos.sort((a, b) => b.score - a.score);
};

export default {
  detectPinEngulfCombo,
  hasStrongCombo,
  getComboSummary,
  compareWithSinglePattern,
  scanForCombos,
};
