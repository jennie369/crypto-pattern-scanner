/**
 * GEM Mobile - Look Right Validator Service
 * Validate zone has not been broken ("Look To The Right" rule)
 *
 * Phase 2C: Compression + Inducement + Look Right
 *
 * Look To The Right Rule:
 * - After identifying a zone, check RIGHT side of chart
 * - If price has already broken through zone = INVALID
 * - Only trade zones that are still INTACT
 *
 * Zone becomes invalid when:
 * - Price closes beyond the stop price
 * - Multiple candles trade through zone
 * - Major structure break occurs
 */

// ═══════════════════════════════════════════════════════════
// MAIN VALIDATION
// ═══════════════════════════════════════════════════════════

/**
 * Validate zone using Look To The Right rule
 * @param {Object} zone - Zone to validate
 * @param {Array} candlesAfterZone - Candles after zone formation
 * @param {Object} options - Validation options
 * @returns {Object} Validation result
 */
export const validateLookRight = (zone, candlesAfterZone, options = {}) => {
  const {
    tolerancePercent = 0.5, // Allow 0.5% wick past zone
    minClosesBeyond = 2,    // Need 2 closes to invalidate
  } = options;

  if (!zone || !candlesAfterZone || candlesAfterZone.length === 0) {
    return {
      isValid: true,
      lookRightValid: true,
      reason: 'No candles to validate',
      confidence: 0.5,
      status: 'UNKNOWN',
    };
  }

  const zoneHigh = Math.max(zone.entryPrice, zone.stopPrice);
  const zoneLow = Math.min(zone.entryPrice, zone.stopPrice);
  const zoneWidth = zoneHigh - zoneLow;
  const tolerance = zoneWidth * (tolerancePercent / 100);

  let closesBeyondZone = 0;
  let wicksBeyondZone = 0;
  let maxPenetration = 0;
  let invalidationCandle = null;

  for (const candle of candlesAfterZone) {
    // Check for HFZ (Supply) - invalid if price closes ABOVE zone
    if (zone.zoneType === 'HFZ') {
      if (candle.close > zoneHigh + tolerance) {
        closesBeyondZone++;
        if (!invalidationCandle) {
          invalidationCandle = candle;
        }
      }
      if (candle.high > zoneHigh) {
        wicksBeyondZone++;
        maxPenetration = Math.max(maxPenetration, candle.high - zoneHigh);
      }
    }

    // Check for LFZ (Demand) - invalid if price closes BELOW zone
    if (zone.zoneType === 'LFZ') {
      if (candle.close < zoneLow - tolerance) {
        closesBeyondZone++;
        if (!invalidationCandle) {
          invalidationCandle = candle;
        }
      }
      if (candle.low < zoneLow) {
        wicksBeyondZone++;
        maxPenetration = Math.max(maxPenetration, zoneLow - candle.low);
      }
    }
  }

  // Determine validity
  const isInvalid = closesBeyondZone >= minClosesBeyond;

  // Calculate confidence
  let confidence = 1.0;
  if (closesBeyondZone > 0) confidence -= 0.3 * closesBeyondZone;
  if (wicksBeyondZone > 2) confidence -= 0.1 * (wicksBeyondZone - 2);
  confidence = Math.max(0, confidence);

  // Determine status
  const status = isInvalid ? 'BROKEN' :
    wicksBeyondZone > 0 ? 'TESTED' : 'FRESH';

  return {
    isValid: !isInvalid,
    lookRightValid: !isInvalid,

    // Metrics
    closesBeyondZone,
    wicksBeyondZone,
    maxPenetration,
    maxPenetrationPercent: parseFloat(((maxPenetration / zoneWidth) * 100).toFixed(1)),

    // Invalidation info
    invalidationCandle: invalidationCandle ? {
      timestamp: invalidationCandle.timestamp || invalidationCandle.openTime,
      close: invalidationCandle.close,
      high: invalidationCandle.high,
      low: invalidationCandle.low,
    } : null,

    // Confidence
    confidence: parseFloat(confidence.toFixed(2)),

    // Status
    status,

    // Recommendation
    reason: isInvalid
      ? `Zone broken - ${closesBeyondZone} closes beyond zone`
      : wicksBeyondZone > 0
        ? `Zone tested ${wicksBeyondZone} time(s) but still valid`
        : 'Zone intact - No price action beyond zone',

    recommendation: isInvalid
      ? 'DO NOT TRADE - Zone invalidated'
      : confidence >= 0.8
        ? 'TRADE - Zone valid with high confidence'
        : 'CAUTION - Zone valid but tested',

    validatedAt: new Date().toISOString(),
  };
};

// ═══════════════════════════════════════════════════════════
// INVALIDATION PRICE CALCULATION
// ═══════════════════════════════════════════════════════════

/**
 * Get invalidation price for a zone
 * @param {Object} zone - Zone object
 * @param {number} bufferPercent - Buffer percentage
 * @returns {number} Invalidation price
 */
export const getInvalidationPrice = (zone, bufferPercent = 0.2) => {
  const zoneHigh = Math.max(zone.entryPrice, zone.stopPrice);
  const zoneLow = Math.min(zone.entryPrice, zone.stopPrice);
  const zoneWidth = zoneHigh - zoneLow;
  const buffer = zoneWidth * (bufferPercent / 100);

  if (zone.zoneType === 'HFZ') {
    // HFZ invalid if price goes above
    return zoneHigh + buffer;
  } else {
    // LFZ invalid if price goes below
    return zoneLow - buffer;
  }
};

// ═══════════════════════════════════════════════════════════
// REAL-TIME VALIDATION
// ═══════════════════════════════════════════════════════════

/**
 * Monitor zone validity in real-time
 * @param {Object} zone - Zone object
 * @param {number} currentPrice - Current price
 * @param {number} lastClosePrice - Last candle close price
 * @returns {Object} Real-time validity status
 */
export const checkRealTimeValidity = (zone, currentPrice, lastClosePrice) => {
  const invalidationPrice = getInvalidationPrice(zone);

  if (zone.zoneType === 'HFZ') {
    const isBreaking = currentPrice > invalidationPrice;
    const isBroken = lastClosePrice > invalidationPrice;

    return {
      isBreaking,
      isBroken,
      invalidationPrice,
      distanceToInvalidation: invalidationPrice - currentPrice,
      distancePercent: parseFloat(((invalidationPrice - currentPrice) / currentPrice * 100).toFixed(2)),
      warning: isBreaking && !isBroken
        ? 'Price testing invalidation level'
        : isBroken
          ? 'Zone BROKEN'
          : 'Zone valid',
      warningLevel: isBroken ? 'error' : isBreaking ? 'warning' : 'success',
    };
  } else {
    const isBreaking = currentPrice < invalidationPrice;
    const isBroken = lastClosePrice < invalidationPrice;

    return {
      isBreaking,
      isBroken,
      invalidationPrice,
      distanceToInvalidation: currentPrice - invalidationPrice,
      distancePercent: parseFloat(((currentPrice - invalidationPrice) / currentPrice * 100).toFixed(2)),
      warning: isBreaking && !isBroken
        ? 'Price testing invalidation level'
        : isBroken
          ? 'Zone BROKEN'
          : 'Zone valid',
      warningLevel: isBroken ? 'error' : isBreaking ? 'warning' : 'success',
    };
  }
};

// ═══════════════════════════════════════════════════════════
// BATCH VALIDATION
// ═══════════════════════════════════════════════════════════

/**
 * Batch validate multiple zones
 * @param {Array} zones - Array of zones
 * @param {Array} candles - All candles
 * @param {Object} options - Validation options
 * @returns {Array} Valid zones only
 */
export const batchValidateZones = (zones, candles, options = {}) => {
  const { returnInvalid = false } = options;

  const validatedZones = zones.map(zone => {
    // Find candles after zone formation
    const zoneFormationIndex = findZoneFormationIndex(zone, candles);
    const candlesAfterZone = candles.slice(zoneFormationIndex + 1);

    const validation = validateLookRight(zone, candlesAfterZone, options);

    return {
      ...zone,
      ...validation,
    };
  });

  if (returnInvalid) {
    return validatedZones;
  }

  return validatedZones.filter(z => z.isValid);
};

/**
 * Find index where zone was formed
 * @param {Object} zone - Zone object
 * @param {Array} candles - Candles array
 * @returns {number} Formation index
 */
const findZoneFormationIndex = (zone, candles) => {
  // Find candle closest to zone formation time
  if (zone.formationTimestamp) {
    const idx = candles.findIndex(c => {
      const candleTime = c.timestamp || c.openTime;
      return candleTime >= zone.formationTimestamp;
    });
    return idx >= 0 ? idx : 0;
  }

  // Fallback: find candle that matches zone entry price
  const idx = candles.findIndex(c =>
    c.high >= zone.entryPrice && c.low <= zone.entryPrice
  );
  return idx >= 0 ? idx : 0;
};

// ═══════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════

/**
 * Get status display name in Vietnamese
 * @param {string} status - Status code
 * @returns {string} Display name
 */
export const getStatusDisplayName = (status) => {
  const names = {
    FRESH: 'Còn nguyên',
    TESTED: 'Đã test',
    BROKEN: 'Đã phá',
    UNKNOWN: 'Chưa xác định',
  };
  return names[status] || status;
};

/**
 * Get status color
 * @param {string} status - Status code
 * @returns {string} Color token
 */
export const getStatusColor = (status) => {
  switch (status) {
    case 'FRESH':
      return 'success';
    case 'TESTED':
      return 'warning';
    case 'BROKEN':
      return 'error';
    default:
      return 'textMuted';
  }
};

/**
 * Get confidence level name
 * @param {number} confidence - Confidence score 0-1
 * @returns {string} Confidence level
 */
export const getConfidenceLevel = (confidence) => {
  if (confidence >= 0.9) return 'very_high';
  if (confidence >= 0.7) return 'high';
  if (confidence >= 0.5) return 'medium';
  if (confidence >= 0.3) return 'low';
  return 'very_low';
};

/**
 * Quick check if zone is still valid
 * @param {Object} zone - Zone object
 * @param {Array} candles - Candles after zone
 * @returns {boolean} Whether zone is valid
 */
export const isZoneValid = (zone, candles) => {
  const result = validateLookRight(zone, candles);
  return result.isValid;
};

/**
 * Calculate zone health score
 * @param {Object} zone - Zone object
 * @param {Array} candlesAfterZone - Candles after zone
 * @returns {Object} Health score details
 */
export const calculateZoneHealth = (zone, candlesAfterZone) => {
  const validation = validateLookRight(zone, candlesAfterZone);

  // Base score from confidence
  let healthScore = validation.confidence * 100;

  // Penalty for tests
  if (validation.wicksBeyondZone > 0) {
    healthScore -= validation.wicksBeyondZone * 5;
  }

  // Bonus for fresh zone
  if (validation.status === 'FRESH') {
    healthScore += 10;
  }

  // Clamp to 0-100
  healthScore = Math.max(0, Math.min(100, healthScore));

  return {
    score: Math.round(healthScore),
    status: validation.status,
    confidence: validation.confidence,
    testsCount: validation.wicksBeyondZone,
    closesCount: validation.closesBeyondZone,
    grade: healthScore >= 80 ? 'A' :
      healthScore >= 60 ? 'B' :
        healthScore >= 40 ? 'C' :
          healthScore >= 20 ? 'D' : 'F',
    tradeable: validation.isValid && healthScore >= 50,
  };
};

/**
 * Get detailed analysis for zone validity
 * @param {Object} zone - Zone object
 * @param {Array} candlesAfterZone - Candles after zone
 * @param {number} currentPrice - Current price
 * @returns {Object} Detailed analysis
 */
export const getDetailedAnalysis = (zone, candlesAfterZone, currentPrice) => {
  const validation = validateLookRight(zone, candlesAfterZone);
  const health = calculateZoneHealth(zone, candlesAfterZone);
  const invalidationPrice = getInvalidationPrice(zone);

  // Calculate distance to invalidation
  const distanceToInvalidation = zone.zoneType === 'HFZ'
    ? invalidationPrice - currentPrice
    : currentPrice - invalidationPrice;
  const distancePercent = (distanceToInvalidation / currentPrice) * 100;

  // Risk assessment
  let riskLevel = 'low';
  if (distancePercent < 1) riskLevel = 'high';
  else if (distancePercent < 2) riskLevel = 'medium';

  return {
    ...validation,
    health,
    invalidationPrice,
    currentPrice,
    distanceToInvalidation: parseFloat(distanceToInvalidation.toFixed(8)),
    distancePercent: parseFloat(distancePercent.toFixed(2)),
    riskLevel,
    summary: validation.isValid
      ? `Zone còn valid (${health.grade}). Distance to invalidation: ${distancePercent.toFixed(1)}%`
      : `Zone đã bị phá sau ${validation.closesBeyondZone} lần close beyond.`,
    tradingAdvice: getTradingAdvice(validation, health, riskLevel),
  };
};

/**
 * Get trading advice based on analysis
 * @param {Object} validation - Validation result
 * @param {Object} health - Health score
 * @param {string} riskLevel - Risk level
 * @returns {string} Trading advice
 */
const getTradingAdvice = (validation, health, riskLevel) => {
  if (!validation.isValid) {
    return 'SKIP - Zone đã bị invalidate. Tìm zone khác.';
  }

  if (health.grade === 'A' && riskLevel === 'low') {
    return 'ENTRY - Zone excellent với risk thấp. Có thể trade.';
  }

  if (health.grade === 'A' || health.grade === 'B') {
    if (riskLevel === 'high') {
      return 'CAUTION - Zone tốt nhưng gần invalidation. Giảm size.';
    }
    return 'ENTRY - Zone vẫn valid. Trade với quản lý risk.';
  }

  if (health.grade === 'C') {
    return 'WAIT - Zone đã bị test nhiều. Cân nhắc kỹ hoặc tìm zone mới.';
  }

  return 'SKIP - Zone health thấp. Tìm setup tốt hơn.';
};

// ═══════════════════════════════════════════════════════════
// DEFAULT EXPORT
// ═══════════════════════════════════════════════════════════

const lookRightValidator = {
  validateLookRight,
  getInvalidationPrice,
  checkRealTimeValidity,
  batchValidateZones,
  getStatusDisplayName,
  getStatusColor,
  getConfidenceLevel,
  isZoneValid,
  calculateZoneHealth,
  getDetailedAnalysis,
};

export default lookRightValidator;
