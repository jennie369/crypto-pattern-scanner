/**
 * GEM Mobile - MPL (Most Penetrated Level) Calculator
 * Phase 3B: Calculate the most penetrated price level within a zone
 *
 * MPL = Most Penetrated Level
 *
 * Within a zone, find the price level where:
 * - Most wicks have touched (penetrated)
 * - This is where Smart Money has most orders
 * - Using MPL as entry gives tighter stop loss
 *
 * For HFZ: MPL is usually near the zone high
 * For LFZ: MPL is usually near the zone low
 */

/**
 * Calculate MPL for a zone
 * @param {Object} zone - The zone {entryPrice, stopPrice, zoneType}
 * @param {Array} candlesInZone - Candles that touched the zone
 * @param {Object} options - Calculation options
 * @returns {Object|null} MPL result or null
 */
export const calculateMPL = (zone, candlesInZone, options = {}) => {
  const {
    precision = 10,    // Number of levels to check
    minTouches = 2,    // Minimum touches to be valid
  } = options;

  if (!zone || !candlesInZone || candlesInZone.length < minTouches) {
    return null;
  }

  const zoneHigh = Math.max(zone.entryPrice, zone.stopPrice);
  const zoneLow = Math.min(zone.entryPrice, zone.stopPrice);
  const zoneRange = zoneHigh - zoneLow;

  if (zoneRange === 0) return null;

  const step = zoneRange / precision;

  // Create price levels to check
  const levels = [];
  for (let i = 0; i <= precision; i++) {
    levels.push({
      price: zoneLow + (step * i),
      touches: 0,
      penetrations: 0, // Wicks that went past this level
      candleIndices: [],
    });
  }

  // Count touches and penetrations for each level
  candlesInZone.forEach((candle, candleIndex) => {
    levels.forEach(level => {
      // Check if candle touched this level
      if (candle.low <= level.price && candle.high >= level.price) {
        level.touches++;
        level.candleIndices.push(candleIndex);
      }

      // Check penetration based on zone type
      if (zone.zoneType === 'HFZ') {
        // For supply, penetration is wick going above then closing below
        if (candle.high > level.price && candle.close < level.price) {
          level.penetrations++;
        }
      } else {
        // For demand, penetration is wick going below then closing above
        if (candle.low < level.price && candle.close > level.price) {
          level.penetrations++;
        }
      }
    });
  });

  // Find level with most penetrations
  const sortedByPenetration = [...levels].sort((a, b) => b.penetrations - a.penetrations);
  const mplLevel = sortedByPenetration[0];

  if (mplLevel.penetrations < minTouches) {
    return null;
  }

  // Calculate MPL quality
  const quality = calculateMPLQuality(mplLevel, levels, zone);

  // Calculate improvement metrics
  const mplPrice = mplLevel.price;
  const stopReduction = Math.abs(zone.entryPrice - mplPrice);
  const stopReductionPercent = zone.zoneWidth > 0
    ? (stopReduction / zone.zoneWidth * 100)
    : 0;

  return {
    mplPrice,
    penetrations: mplLevel.penetrations,
    touches: mplLevel.touches,

    // Improvement over zone entry
    improvement: {
      originalEntry: zone.entryPrice,
      mplEntry: mplPrice,
      stopReduction,
      stopReductionPercent: stopReductionPercent.toFixed(1),
    },

    quality,
    qualityScore: quality === 'excellent' ? 3 : quality === 'good' ? 2 : 1,

    // All levels for visualization (sorted high to low)
    allLevels: levels.sort((a, b) => b.price - a.price),

    // Position in zone (0-1)
    positionInZone: ((mplPrice - zoneLow) / zoneRange).toFixed(2),

    recommendation: getMPLRecommendation(quality, zone.zoneType),
    recommendationVi: getMPLRecommendationVi(quality, zone.zoneType),

    calculatedAt: new Date().toISOString(),
  };
};

/**
 * Calculate MPL quality based on penetration metrics
 * @param {Object} mplLevel - The MPL level
 * @param {Array} allLevels - All analyzed levels
 * @param {Object} zone - Zone data
 * @returns {string} Quality: excellent, good, moderate
 */
const calculateMPLQuality = (mplLevel, allLevels, zone) => {
  const maxPenetrations = Math.max(...allLevels.map(l => l.penetrations));
  const avgPenetrations = allLevels.reduce((sum, l) => sum + l.penetrations, 0) / allLevels.length;

  let score = 0;

  // Score based on penetration count
  if (mplLevel.penetrations >= 5) score += 3;
  else if (mplLevel.penetrations >= 3) score += 2;
  else score += 1;

  // Score based on how much better than average
  if (mplLevel.penetrations > avgPenetrations * 2) score += 2;
  else if (mplLevel.penetrations > avgPenetrations * 1.5) score += 1;

  // Score based on position in zone
  const zoneHigh = Math.max(zone.entryPrice, zone.stopPrice);
  const zoneLow = Math.min(zone.entryPrice, zone.stopPrice);
  const positionInZone = (mplLevel.price - zoneLow) / (zoneHigh - zoneLow);

  // For HFZ, MPL should be in upper half; for LFZ, in lower half
  const isOptimalPosition =
    (zone.zoneType === 'HFZ' && positionInZone > 0.5) ||
    (zone.zoneType === 'LFZ' && positionInZone < 0.5);

  if (isOptimalPosition) score += 1;

  if (score >= 5) return 'excellent';
  if (score >= 3) return 'good';
  return 'moderate';
};

/**
 * Get MPL recommendation in English
 */
const getMPLRecommendation = (quality, zoneType) => {
  const action = zoneType === 'HFZ' ? 'SELL' : 'BUY';

  if (quality === 'excellent') {
    return `Use MPL for ${action} entry - Excellent penetration cluster`;
  }
  if (quality === 'good') {
    return `Consider MPL for ${action} - Good penetration level`;
  }
  return `MPL available but moderate quality - Use zone edge instead`;
};

/**
 * Get MPL recommendation in Vietnamese
 */
const getMPLRecommendationVi = (quality, zoneType) => {
  const action = zoneType === 'HFZ' ? 'SELL' : 'BUY';

  if (quality === 'excellent') {
    return `Dùng MPL cho ${action} - Cụm penetration xuất sắc`;
  }
  if (quality === 'good') {
    return `Cân nhắc MPL cho ${action} - Mức penetration tốt`;
  }
  return `MPL chất lượng trung bình - Nên dùng cạnh zone`;
};

/**
 * Quick check if zone has valid MPL
 * @param {Object} zone - Zone data
 * @param {Array} candlesInZone - Candles in zone
 * @returns {boolean} True if has valid MPL
 */
export const hasMPL = (zone, candlesInZone) => {
  const mpl = calculateMPL(zone, candlesInZone);
  return mpl !== null;
};

/**
 * Get MPL summary for display
 * @param {Object} mpl - Calculated MPL
 * @returns {Object} Summary for UI
 */
export const getMPLSummary = (mpl) => {
  if (!mpl) {
    return {
      hasMPL: false,
      label: 'Không có MPL',
      labelEn: 'No MPL',
    };
  }

  return {
    hasMPL: true,
    price: mpl.mplPrice,
    quality: mpl.quality,
    qualityVi: mpl.quality === 'excellent' ? 'Xuất sắc' : mpl.quality === 'good' ? 'Tốt' : 'Trung bình',
    penetrations: mpl.penetrations,
    stopImprovement: mpl.improvement?.stopReductionPercent + '%',
    recommendation: mpl.recommendationVi,
  };
};

/**
 * Calculate new R:R with MPL entry
 * @param {Object} zone - Zone data
 * @param {Object} mpl - Calculated MPL
 * @param {number} targetPrice - Target price for trade
 * @returns {Object} R:R comparison
 */
export const calculateMPLRiskReward = (zone, mpl, targetPrice) => {
  if (!zone || !mpl || !targetPrice) return null;

  const originalEntry = zone.entryPrice;
  const mplEntry = mpl.mplPrice;
  const stopPrice = zone.stopPrice;

  const originalRisk = Math.abs(originalEntry - stopPrice);
  const mplRisk = Math.abs(mplEntry - stopPrice);

  const originalReward = Math.abs(targetPrice - originalEntry);
  const mplReward = Math.abs(targetPrice - mplEntry);

  const originalRR = originalRisk > 0 ? (originalReward / originalRisk) : 0;
  const mplRR = mplRisk > 0 ? (mplReward / mplRisk) : 0;

  return {
    original: {
      entry: originalEntry,
      risk: originalRisk,
      reward: originalReward,
      rr: originalRR.toFixed(2),
    },
    withMPL: {
      entry: mplEntry,
      risk: mplRisk,
      reward: mplReward,
      rr: mplRR.toFixed(2),
    },
    improvement: {
      rrIncrease: (mplRR - originalRR).toFixed(2),
      rrIncreasePercent: originalRR > 0
        ? (((mplRR - originalRR) / originalRR) * 100).toFixed(1)
        : '0',
      riskReduction: (originalRisk - mplRisk).toFixed(4),
      riskReductionPercent: originalRisk > 0
        ? (((originalRisk - mplRisk) / originalRisk) * 100).toFixed(1)
        : '0',
    },
  };
};

export default {
  calculateMPL,
  hasMPL,
  getMPLSummary,
  calculateMPLRiskReward,
};
