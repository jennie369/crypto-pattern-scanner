/**
 * Confirmation Validator Utility
 * GEM Frequency Trading Method - Entry Confirmation System
 *
 * ⚠️ CRITICAL: Confirmation is MANDATORY before entry!
 *
 * Validates candlestick patterns for entry confirmation:
 *
 * LONG Entry (at LFZ - Low Frequency Zone):
 * - Hammer (long lower wick)
 * - Bullish pin bar
 * - Bullish engulfing
 * - Strong bounce candle
 *
 * SHORT Entry (at HFZ - High Frequency Zone):
 * - Shooting star (long upper wick)
 * - Bearish pin bar
 * - Bearish engulfing
 * - Strong rejection candle
 *
 * No confirmation = NO ENTRY!
 */

/**
 * Calculate candle body size
 * @param {Object} candle - Candlestick data
 * @returns {number} Body size
 */
function getBodySize(candle) {
  return Math.abs(candle.close - candle.open);
}

/**
 * Calculate candle total range
 * @param {Object} candle - Candlestick data
 * @returns {number} Total range (high - low)
 */
function getCandleRange(candle) {
  return candle.high - candle.low;
}

/**
 * Calculate upper wick size
 * @param {Object} candle - Candlestick data
 * @returns {number} Upper wick size
 */
function getUpperWick(candle) {
  return candle.high - Math.max(candle.open, candle.close);
}

/**
 * Calculate lower wick size
 * @param {Object} candle - Candlestick data
 * @returns {number} Lower wick size
 */
function getLowerWick(candle) {
  return Math.min(candle.open, candle.close) - candle.low;
}

/**
 * Check if candle is bullish (close > open)
 * @param {Object} candle - Candlestick data
 * @returns {boolean} True if bullish
 */
function isBullish(candle) {
  return candle.close > candle.open;
}

/**
 * Check if candle is bearish (close < open)
 * @param {Object} candle - Candlestick data
 * @returns {boolean} True if bearish
 */
function isBearish(candle) {
  return candle.close < candle.open;
}

/**
 * Detect Hammer pattern - Bullish reversal
 * Long lower wick (2-3x body), small upper wick, bullish body
 *
 * @param {Object} candle - Candlestick data
 * @returns {Object} Detection result
 */
export function isHammer(candle) {
  const body = getBodySize(candle);
  const range = getCandleRange(candle);
  const lowerWick = getLowerWick(candle);
  const upperWick = getUpperWick(candle);

  // Body should be in upper part of range
  const bodyRatio = body / range;

  // Lower wick should be at least 2x the body
  const wickBodyRatio = lowerWick / Math.max(body, 0.001);

  // Upper wick should be small
  const upperWickRatio = upperWick / range;

  const isValid = (
    isBullish(candle) &&
    bodyRatio < 0.4 &&       // Small body
    wickBodyRatio >= 2 &&    // Long lower wick
    upperWickRatio < 0.15    // Small upper wick
  );

  return {
    isValid,
    type: 'hammer',
    strength: isValid ? Math.min(100, wickBodyRatio * 30) : 0,
    description: 'Bullish hammer - Strong bounce signal'
  };
}

/**
 * Detect Shooting Star pattern - Bearish reversal
 * Long upper wick (2-3x body), small lower wick, bearish body
 *
 * @param {Object} candle - Candlestick data
 * @returns {Object} Detection result
 */
export function isShootingStar(candle) {
  const body = getBodySize(candle);
  const range = getCandleRange(candle);
  const upperWick = getUpperWick(candle);
  const lowerWick = getLowerWick(candle);

  const bodyRatio = body / range;
  const wickBodyRatio = upperWick / Math.max(body, 0.001);
  const lowerWickRatio = lowerWick / range;

  const isValid = (
    isBearish(candle) &&
    bodyRatio < 0.4 &&       // Small body
    wickBodyRatio >= 2 &&    // Long upper wick
    lowerWickRatio < 0.15    // Small lower wick
  );

  return {
    isValid,
    type: 'shooting_star',
    strength: isValid ? Math.min(100, wickBodyRatio * 30) : 0,
    description: 'Bearish shooting star - Strong rejection signal'
  };
}

/**
 * Detect Bullish Pin Bar
 * Similar to hammer but can be bearish or bullish candle
 *
 * @param {Object} candle - Candlestick data
 * @returns {Object} Detection result
 */
export function isBullishPinBar(candle) {
  const body = getBodySize(candle);
  const range = getCandleRange(candle);
  const lowerWick = getLowerWick(candle);
  const upperWick = getUpperWick(candle);

  const wickBodyRatio = lowerWick / Math.max(body, 0.001);
  const lowerWickRatio = lowerWick / range;

  const isValid = (
    lowerWickRatio >= 0.6 &&  // Long lower wick (60%+ of range)
    wickBodyRatio >= 2 &&      // Wick 2x+ body
    upperWick < body           // Upper wick smaller than body
  );

  return {
    isValid,
    type: 'bullish_pin_bar',
    strength: isValid ? Math.min(100, lowerWickRatio * 120) : 0,
    description: 'Bullish pin bar - Rejection of lower prices'
  };
}

/**
 * Detect Bearish Pin Bar
 * Long upper wick showing rejection
 *
 * @param {Object} candle - Candlestick data
 * @returns {Object} Detection result
 */
export function isBearishPinBar(candle) {
  const body = getBodySize(candle);
  const range = getCandleRange(candle);
  const upperWick = getUpperWick(candle);
  const lowerWick = getLowerWick(candle);

  const wickBodyRatio = upperWick / Math.max(body, 0.001);
  const upperWickRatio = upperWick / range;

  const isValid = (
    upperWickRatio >= 0.6 &&  // Long upper wick
    wickBodyRatio >= 2 &&
    lowerWick < body
  );

  return {
    isValid,
    type: 'bearish_pin_bar',
    strength: isValid ? Math.min(100, upperWickRatio * 120) : 0,
    description: 'Bearish pin bar - Rejection of higher prices'
  };
}

/**
 * Detect Bullish Engulfing pattern
 * Current bullish candle engulfs previous bearish candle
 *
 * @param {Object} currentCandle - Current candle
 * @param {Object} previousCandle - Previous candle
 * @returns {Object} Detection result
 */
export function isBullishEngulfing(currentCandle, previousCandle) {
  if (!previousCandle) {
    return { isValid: false, type: 'bullish_engulfing', strength: 0 };
  }

  const currentBullish = isBullish(currentCandle);
  const previousBearish = isBearish(previousCandle);

  // Current candle must completely engulf previous candle's body
  const engulfs = (
    currentCandle.open < previousCandle.close &&
    currentCandle.close > previousCandle.open
  );

  const isValid = currentBullish && previousBearish && engulfs;

  // Calculate strength based on how much it engulfs
  let strength = 0;
  if (isValid) {
    const currentBody = getBodySize(currentCandle);
    const previousBody = getBodySize(previousCandle);
    strength = Math.min(100, (currentBody / previousBody) * 50);
  }

  return {
    isValid,
    type: 'bullish_engulfing',
    strength,
    description: 'Bullish engulfing - Strong reversal pattern'
  };
}

/**
 * Detect Bearish Engulfing pattern
 * Current bearish candle engulfs previous bullish candle
 *
 * @param {Object} currentCandle - Current candle
 * @param {Object} previousCandle - Previous candle
 * @returns {Object} Detection result
 */
export function isBearishEngulfing(currentCandle, previousCandle) {
  if (!previousCandle) {
    return { isValid: false, type: 'bearish_engulfing', strength: 0 };
  }

  const currentBearish = isBearish(currentCandle);
  const previousBullish = isBullish(previousCandle);

  const engulfs = (
    currentCandle.open > previousCandle.close &&
    currentCandle.close < previousCandle.open
  );

  const isValid = currentBearish && previousBullish && engulfs;

  let strength = 0;
  if (isValid) {
    const currentBody = getBodySize(currentCandle);
    const previousBody = getBodySize(previousCandle);
    strength = Math.min(100, (currentBody / previousBody) * 50);
  }

  return {
    isValid,
    type: 'bearish_engulfing',
    strength,
    description: 'Bearish engulfing - Strong reversal pattern'
  };
}

/**
 * Detect strong bullish bounce candle
 * Large bullish candle with strong body
 *
 * @param {Object} candle - Candlestick data
 * @returns {Object} Detection result
 */
export function isStrongBullishCandle(candle) {
  const body = getBodySize(candle);
  const range = getCandleRange(candle);
  const bodyRatio = body / range;

  const isValid = isBullish(candle) && bodyRatio >= 0.7;

  return {
    isValid,
    type: 'strong_bullish',
    strength: isValid ? bodyRatio * 100 : 0,
    description: 'Strong bullish candle - Powerful momentum'
  };
}

/**
 * Detect strong bearish rejection candle
 * Large bearish candle with strong body
 *
 * @param {Object} candle - Candlestick data
 * @returns {Object} Detection result
 */
export function isStrongBearishCandle(candle) {
  const body = getBodySize(candle);
  const range = getCandleRange(candle);
  const bodyRatio = body / range;

  const isValid = isBearish(candle) && bodyRatio >= 0.7;

  return {
    isValid,
    type: 'strong_bearish',
    strength: isValid ? bodyRatio * 100 : 0,
    description: 'Strong bearish candle - Powerful rejection'
  };
}

/**
 * Validate LONG entry confirmation at LFZ (Low Frequency Zone)
 * Checks for bullish reversal patterns
 *
 * @param {Object} candle - Current candle at zone
 * @param {Object} previousCandle - Previous candle
 * @param {Object} zone - LFZ zone data
 * @returns {Object} Validation result
 */
export function validateLongConfirmation(candle, previousCandle, zone) {
  // Check all bullish patterns
  const hammer = isHammer(candle);
  const bullishPin = isBullishPinBar(candle);
  const engulfing = isBullishEngulfing(candle, previousCandle);
  const strongBullish = isStrongBullishCandle(candle);

  // Find the best (strongest) confirmation
  const patterns = [hammer, bullishPin, engulfing, strongBullish];
  const validPatterns = patterns.filter(p => p.isValid);

  if (validPatterns.length === 0) {
    return {
      isConfirmed: false,
      confidence: 0,
      pattern: null,
      message: '❌ No bullish confirmation - DO NOT ENTER'
    };
  }

  // Get strongest pattern
  const bestPattern = validPatterns.reduce((best, current) =>
    current.strength > best.strength ? current : best
  );

  // Additional check: Candle should close within or above LFZ
  const closeInZone = candle.close >= zone.low && candle.close <= zone.high;
  const closeAboveZone = candle.close > zone.mid;

  const positionBonus = closeAboveZone ? 1.1 : (closeInZone ? 1.0 : 0.9);
  const finalConfidence = Math.min(100, bestPattern.strength * positionBonus);

  return {
    isConfirmed: true,
    confidence: finalConfidence,
    pattern: bestPattern.type,
    description: bestPattern.description,
    message: `✅ LONG confirmation: ${bestPattern.description} (${finalConfidence.toFixed(0)}%)`
  };
}

/**
 * Validate SHORT entry confirmation at HFZ (High Frequency Zone)
 * Checks for bearish rejection patterns
 *
 * @param {Object} candle - Current candle at zone
 * @param {Object} previousCandle - Previous candle
 * @param {Object} zone - HFZ zone data
 * @returns {Object} Validation result
 */
export function validateShortConfirmation(candle, previousCandle, zone) {
  // Check all bearish patterns
  const shootingStar = isShootingStar(candle);
  const bearishPin = isBearishPinBar(candle);
  const engulfing = isBearishEngulfing(candle, previousCandle);
  const strongBearish = isStrongBearishCandle(candle);

  const patterns = [shootingStar, bearishPin, engulfing, strongBearish];
  const validPatterns = patterns.filter(p => p.isValid);

  if (validPatterns.length === 0) {
    return {
      isConfirmed: false,
      confidence: 0,
      pattern: null,
      message: '❌ No bearish confirmation - DO NOT ENTER'
    };
  }

  const bestPattern = validPatterns.reduce((best, current) =>
    current.strength > best.strength ? current : best
  );

  // Candle should close within or below HFZ
  const closeInZone = candle.close >= zone.low && candle.close <= zone.high;
  const closeBelowZone = candle.close < zone.mid;

  const positionBonus = closeBelowZone ? 1.1 : (closeInZone ? 1.0 : 0.9);
  const finalConfidence = Math.min(100, bestPattern.strength * positionBonus);

  return {
    isConfirmed: true,
    confidence: finalConfidence,
    pattern: bestPattern.type,
    description: bestPattern.description,
    message: `✅ SHORT confirmation: ${bestPattern.description} (${finalConfidence.toFixed(0)}%)`
  };
}

/**
 * Main confirmation validator
 * Determines if entry should be taken based on confirmation
 *
 * @param {Object} candle - Current candle
 * @param {Object} previousCandle - Previous candle
 * @param {Object} zone - Zone being tested (HFZ or LFZ)
 * @param {string} direction - 'bullish' or 'bearish'
 * @returns {Object} Validation result
 */
export function validateEntryConfirmation(candle, previousCandle, zone, direction) {
  if (!candle || !zone) {
    return {
      isConfirmed: false,
      confidence: 0,
      message: '❌ Invalid data - Cannot validate'
    };
  }

  // Check if price is actually at the zone
  const priceInZone = candle.close >= zone.low && candle.close <= zone.high;

  if (!priceInZone) {
    return {
      isConfirmed: false,
      confidence: 0,
      message: '⚠️ Price not at zone - Wait for retest'
    };
  }

  // Validate based on direction
  if (direction === 'bullish') {
    return validateLongConfirmation(candle, previousCandle, zone);
  } else {
    return validateShortConfirmation(candle, previousCandle, zone);
  }
}

/**
 * Get confirmation requirements for display
 * @param {string} direction - 'bullish' or 'bearish'
 * @returns {Array} List of required confirmation patterns
 */
export function getConfirmationRequirements(direction) {
  if (direction === 'bullish') {
    return [
      { pattern: 'Hammer', description: 'Long lower wick, small body' },
      { pattern: 'Bullish Pin Bar', description: 'Rejection of lower prices' },
      { pattern: 'Bullish Engulfing', description: 'Engulfs previous bearish candle' },
      { pattern: 'Strong Bullish Candle', description: 'Large body, bullish close' }
    ];
  } else {
    return [
      { pattern: 'Shooting Star', description: 'Long upper wick, small body' },
      { pattern: 'Bearish Pin Bar', description: 'Rejection of higher prices' },
      { pattern: 'Bearish Engulfing', description: 'Engulfs previous bullish candle' },
      { pattern: 'Strong Bearish Candle', description: 'Large body, bearish close' }
    ];
  }
}
