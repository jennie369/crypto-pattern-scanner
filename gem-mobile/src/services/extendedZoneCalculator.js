/**
 * GEM Mobile - Extended Zone Calculator
 * Phase 3B: Calculate extended zones when new highs/lows form
 *
 * Extended Zone Concept:
 * When price makes a new high/low WITHIN the existing pattern structure,
 * the zone boundary extends to include the new extreme.
 *
 * Example for HFZ (Supply):
 * - Original zone: 100-105 (entry at 100, stop at 105)
 * - New high forms at 107 during distribution
 * - Extended zone: 100-107 (stop moves to 107)
 *
 * This is important because:
 * - More orders accumulated at new level
 * - Stop hunters may sweep to extended level
 * - More accurate entry/stop placement
 */

/**
 * Check if zone should be extended based on new candles
 * @param {Object} zone - Original zone data
 * @param {Array} candles - Candles after zone formation
 * @returns {Object} Extended zone info
 */
export const checkZoneExtension = (zone, candles) => {
  if (!zone || !candles || candles.length === 0) {
    return { shouldExtend: false, zone };
  }

  const originalEntry = zone.entryPrice;
  const originalStop = zone.stopPrice;
  const zoneType = zone.zoneType;

  let shouldExtend = false;
  let newStop = originalStop;
  let extensionCandle = null;

  if (zoneType === 'HFZ') {
    // For Supply zone, check for new highs
    candles.forEach(candle => {
      if (candle.high > newStop) {
        shouldExtend = true;
        newStop = candle.high;
        extensionCandle = candle;
      }
    });
  } else {
    // For Demand zone (LFZ), check for new lows
    candles.forEach(candle => {
      if (candle.low < newStop) {
        shouldExtend = true;
        newStop = candle.low;
        extensionCandle = candle;
      }
    });
  }

  if (!shouldExtend) {
    return { shouldExtend: false, zone };
  }

  const originalWidth = Math.abs(originalEntry - originalStop);
  const newWidth = Math.abs(originalEntry - newStop);
  const extensionPercent = originalWidth > 0
    ? ((newWidth - originalWidth) / originalWidth) * 100
    : 0;

  return {
    shouldExtend: true,
    zone: {
      ...zone,
      isExtended: true,
      originalEntryPrice: originalEntry,
      originalStopPrice: originalStop,
      entryPrice: originalEntry, // Entry stays same
      stopPrice: newStop,        // Stop extends
      zoneWidth: newWidth,
      extensionCount: (zone.extensionCount || 0) + 1,
      extendedAt: new Date().toISOString(),

      extension: {
        originalWidth,
        newWidth,
        extensionAmount: Math.abs(newStop - originalStop),
        extensionPercent: extensionPercent.toFixed(1),
        extensionCandle: extensionCandle ? {
          timestamp: extensionCandle.timestamp,
          high: extensionCandle.high,
          low: extensionCandle.low,
          close: extensionCandle.close,
        } : null,
      },
    },
    extensionCandle,
  };
};

/**
 * Auto-extend zone based on real-time price/candle
 * @param {Object} zone - Current zone
 * @param {Object} currentCandle - Current candle data
 * @returns {Object} Updated zone (extended or original)
 */
export const autoExtendZone = (zone, currentCandle) => {
  if (!zone || !currentCandle) return zone;

  const { stopPrice, zoneType, entryPrice } = zone;

  if (zoneType === 'HFZ' && currentCandle.high > stopPrice) {
    const originalStop = zone.originalStopPrice || stopPrice;
    const newWidth = Math.abs(entryPrice - currentCandle.high);
    const originalWidth = Math.abs(entryPrice - originalStop);
    const extensionPercent = originalWidth > 0
      ? ((newWidth - originalWidth) / originalWidth) * 100
      : 0;

    return {
      ...zone,
      isExtended: true,
      originalStopPrice: originalStop,
      stopPrice: currentCandle.high,
      zoneWidth: newWidth,
      extensionCount: (zone.extensionCount || 0) + 1,
      extendedAt: new Date().toISOString(),
      extension: {
        originalWidth,
        newWidth,
        extensionAmount: Math.abs(currentCandle.high - originalStop),
        extensionPercent: extensionPercent.toFixed(1),
      },
    };
  }

  if (zoneType === 'LFZ' && currentCandle.low < stopPrice) {
    const originalStop = zone.originalStopPrice || stopPrice;
    const newWidth = Math.abs(entryPrice - currentCandle.low);
    const originalWidth = Math.abs(entryPrice - originalStop);
    const extensionPercent = originalWidth > 0
      ? ((newWidth - originalWidth) / originalWidth) * 100
      : 0;

    return {
      ...zone,
      isExtended: true,
      originalStopPrice: originalStop,
      stopPrice: currentCandle.low,
      zoneWidth: newWidth,
      extensionCount: (zone.extensionCount || 0) + 1,
      extendedAt: new Date().toISOString(),
      extension: {
        originalWidth,
        newWidth,
        extensionAmount: Math.abs(currentCandle.low - originalStop),
        extensionPercent: extensionPercent.toFixed(1),
      },
    };
  }

  return zone;
};

/**
 * Get extension history/summary for a zone
 * @param {Object} zone - Zone data
 * @returns {Object} Extension summary
 */
export const getExtensionHistory = (zone) => {
  if (!zone?.isExtended) {
    return {
      isExtended: false,
      history: [],
      summary: null,
    };
  }

  const originalStop = zone.originalStopPrice;
  const currentStop = zone.stopPrice;
  const totalExtension = Math.abs(currentStop - originalStop);
  const extensionCount = zone.extensionCount || 1;

  return {
    isExtended: true,
    originalStop,
    currentStop,
    totalExtension,
    extensionCount,
    extendedAt: zone.extendedAt,
    summary: {
      originalWidth: zone.extension?.originalWidth,
      currentWidth: zone.zoneWidth,
      extensionPercent: zone.extension?.extensionPercent || '0',
    },
  };
};

/**
 * Calculate risk adjustment for extended zone
 * @param {Object} zone - Extended zone
 * @returns {Object} Risk adjustment info
 */
export const calculateExtendedRisk = (zone) => {
  if (!zone?.isExtended) {
    return {
      requiresAdjustment: false,
      originalRisk: zone?.zoneWidth,
      adjustedRisk: zone?.zoneWidth,
    };
  }

  const originalWidth = zone.extension?.originalWidth || zone.zoneWidth;
  const newWidth = zone.zoneWidth;
  const riskIncrease = ((newWidth - originalWidth) / originalWidth) * 100;

  return {
    requiresAdjustment: riskIncrease > 20, // Adjust if >20% increase
    originalRisk: originalWidth,
    adjustedRisk: newWidth,
    riskIncreasePercent: riskIncrease.toFixed(1),
    positionSizeAdjustment: riskIncrease > 20
      ? (originalWidth / newWidth * 100).toFixed(0)
      : '100',
    recommendation: riskIncrease > 50
      ? 'Skip hoặc giảm 50%+ position size'
      : riskIncrease > 20
        ? 'Giảm position size tương ứng'
        : 'Position size bình thường',
  };
};

/**
 * Check if zone extension is valid (not too wide)
 * @param {Object} zone - Zone to check
 * @param {number} maxExtensionPercent - Maximum allowed extension (default 100%)
 * @returns {boolean} True if extension is valid
 */
export const isValidExtension = (zone, maxExtensionPercent = 100) => {
  if (!zone?.isExtended) return true;

  const extensionPercent = parseFloat(zone.extension?.extensionPercent || 0);
  return extensionPercent <= maxExtensionPercent;
};

export default {
  checkZoneExtension,
  autoExtendZone,
  getExtensionHistory,
  calculateExtendedRisk,
  isValidExtension,
};
