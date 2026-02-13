/**
 * entryWorkflow.js
 *
 * Entry Status Workflow System for TIER 2
 *
 * 6-Step Workflow:
 * 1. PATTERN_DETECTED - Pattern identified by scanner
 * 2. ZONE_CREATED - HFZ/LFZ zone established
 * 3. APPROACHING_ZONE - Price moving toward zone
 * 4. IN_ZONE - Price inside the zone
 * 5. CONFIRMATION - Confirmation candle detected (ONLY STEP THAT ALLOWS ENTRY)
 * 6. ZONE_BROKEN - Zone invalidated
 *
 * This system enforces RETEST-based entries and prevents BREAKOUT trading
 */

// Entry Workflow Steps
export const ENTRY_WORKFLOW = {
  PATTERN_DETECTED: {
    id: 'PATTERN_DETECTED',
    label: 'Pattern Detected',
    description: 'GEM pattern identified by scanner',
    allowEntry: false,
    icon: '🔍',
    color: '#94a3b8'
  },
  ZONE_CREATED: {
    id: 'ZONE_CREATED',
    label: 'Zone Created',
    description: 'HFZ/LFZ zone established at pattern level',
    allowEntry: false,
    icon: '📍',
    color: '#3b82f6'
  },
  APPROACHING_ZONE: {
    id: 'APPROACHING_ZONE',
    label: 'Approaching Zone',
    description: 'Price moving back toward the zone',
    allowEntry: false,
    icon: '🎯',
    color: '#f59e0b'
  },
  IN_ZONE: {
    id: 'IN_ZONE',
    label: 'In Zone',
    description: 'Price has entered the zone - wait for confirmation',
    allowEntry: false,
    icon: '⏳',
    color: '#8b5cf6'
  },
  CONFIRMATION: {
    id: 'CONFIRMATION',
    label: 'Confirmation',
    description: 'Confirmation candle detected - READY TO ENTER',
    allowEntry: true, // *** ONLY THIS STEP ALLOWS ENTRY ***
    icon: '✅',
    color: '#10b981'
  },
  ZONE_BROKEN: {
    id: 'ZONE_BROKEN',
    label: 'Zone Broken',
    description: 'Zone invalidated - DO NOT ENTER',
    allowEntry: false,
    icon: '❌',
    color: '#ef4444'
  }
};

/**
 * Determine current entry status based on pattern and price
 * @param {Object} pattern - Pattern data with zone info
 * @param {number} currentPrice - Current market price
 * @param {Object} latestCandle - Latest candlestick data
 * @returns {Object} Current status step
 */
export function determineEntryStatus(pattern, currentPrice, latestCandle) {
  if (!pattern || !pattern.zone) {
    return ENTRY_WORKFLOW.PATTERN_DETECTED;
  }

  const zone = pattern.zone;
  const isLong = zone.type === 'LFZ';
  const isShort = zone.type === 'HFZ';

  // Check if zone is broken
  const zoneBrokenThreshold = 0.02; // 2% beyond zone
  if (isLong && currentPrice < zone.bottom * (1 - zoneBrokenThreshold)) {
    return ENTRY_WORKFLOW.ZONE_BROKEN;
  }
  if (isShort && currentPrice > zone.top * (1 + zoneBrokenThreshold)) {
    return ENTRY_WORKFLOW.ZONE_BROKEN;
  }

  // Check if price is in zone
  const inZone = currentPrice >= zone.bottom && currentPrice <= zone.top;

  if (inZone) {
    // Check for confirmation candle
    const confirmation = checkConfirmationCandle(latestCandle, zone.type);

    if (confirmation && confirmation.hasConfirmation) {
      return ENTRY_WORKFLOW.CONFIRMATION; // *** ONLY STEP THAT ALLOWS ENTRY ***
    }

    return ENTRY_WORKFLOW.IN_ZONE;
  }

  // Check if approaching zone
  const approachThreshold = 0.05; // Within 5% of zone
  const distanceToZone = isLong
    ? (currentPrice - zone.top) / zone.top
    : (zone.bottom - currentPrice) / zone.bottom;

  if (distanceToZone > 0 && distanceToZone <= approachThreshold) {
    return ENTRY_WORKFLOW.APPROACHING_ZONE;
  }

  // Default: zone created, waiting for retest
  return ENTRY_WORKFLOW.ZONE_CREATED;
}

/**
 * Check for confirmation candle patterns
 * @param {Object} candle - Candlestick data
 * @param {string} zoneType - HFZ or LFZ
 * @returns {Object} Confirmation details
 */
export function checkConfirmationCandle(candle, zoneType) {
  if (!candle || !candle.open || !candle.high || !candle.low || !candle.close) {
    return {
      hasConfirmation: false,
      type: null,
      strength: null,
      direction: null,
      details: null
    };
  }

  const { open, high, low, close } = candle;
  const body = Math.abs(close - open);
  const totalRange = high - low;
  const upperWick = high - Math.max(open, close);
  const lowerWick = Math.min(open, close) - low;

  const bodyPercent = (body / totalRange) * 100;
  const upperWickPercent = (upperWick / totalRange) * 100;
  const lowerWickPercent = (lowerWick / totalRange) * 100;

  // Pin Bar / Hammer (Bullish at LFZ)
  if (zoneType === 'LFZ' && lowerWickPercent >= 60 && bodyPercent <= 30) {
    const strength = lowerWickPercent >= 70 ? 'Strong' : lowerWickPercent >= 65 ? 'Medium' : 'Weak';

    return {
      hasConfirmation: true,
      type: 'Pin Bar / Hammer',
      strength: strength,
      direction: 'Bullish',
      details: {
        bodyPercent: bodyPercent.toFixed(1),
        wickPercent: lowerWickPercent.toFixed(1),
        rejection: 'Strong rejection of lower prices'
      }
    };
  }

  // Shooting Star / Pin Bar (Bearish at HFZ)
  if (zoneType === 'HFZ' && upperWickPercent >= 60 && bodyPercent <= 30) {
    const strength = upperWickPercent >= 70 ? 'Strong' : upperWickPercent >= 65 ? 'Medium' : 'Weak';

    return {
      hasConfirmation: true,
      type: 'Shooting Star / Pin Bar',
      strength: strength,
      direction: 'Bearish',
      details: {
        bodyPercent: bodyPercent.toFixed(1),
        wickPercent: upperWickPercent.toFixed(1),
        rejection: 'Strong rejection of higher prices'
      }
    };
  }

  // Bullish Engulfing (at LFZ)
  if (zoneType === 'LFZ' && close > open && bodyPercent >= 60) {
    return {
      hasConfirmation: true,
      type: 'Bullish Engulfing',
      strength: 'Strong',
      direction: 'Bullish',
      details: {
        bodyPercent: bodyPercent.toFixed(1),
        move: 'Strong bullish momentum'
      }
    };
  }

  // Bearish Engulfing (at HFZ)
  if (zoneType === 'HFZ' && close < open && bodyPercent >= 60) {
    return {
      hasConfirmation: true,
      type: 'Bearish Engulfing',
      strength: 'Strong',
      direction: 'Bearish',
      details: {
        bodyPercent: bodyPercent.toFixed(1),
        move: 'Strong bearish momentum'
      }
    };
  }

  // No confirmation
  return {
    hasConfirmation: false,
    type: null,
    strength: null,
    direction: null,
    details: null
  };
}

/**
 * Get zone quality/strength based on test count and age
 * @param {Object} zone - Zone data
 * @returns {Object} Zone quality info
 */
export function getZoneQuality(zone) {
  if (!zone) {
    return { stars: 0, label: 'Unknown', color: '#94a3b8' };
  }

  const testCount = zone.testCount || 0;
  const ageInDays = zone.createdAt
    ? Math.floor((Date.now() - new Date(zone.createdAt).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  // Fresh zone (0 tests)
  if (testCount === 0) {
    return { stars: 5, label: 'Fresh Zone', color: '#10b981' };
  }

  // Lightly tested (1-2 tests)
  if (testCount <= 2) {
    return { stars: 4, label: 'Strong Zone', color: '#3b82f6' };
  }

  // Moderately tested (3-4 tests)
  if (testCount <= 4) {
    return { stars: 3, label: 'Moderate Zone', color: '#f59e0b' };
  }

  // Heavily tested (5-6 tests)
  if (testCount <= 6) {
    return { stars: 2, label: 'Weak Zone', color: '#ef4444' };
  }

  // Over-tested (7+ tests)
  return { stars: 1, label: 'Very Weak Zone', color: '#7f1d1d' };
}

/**
 * Check if entry is allowed at current status
 * @param {Object} status - Current workflow status
 * @returns {boolean} Whether entry is allowed
 */
export function isEntryAllowed(status) {
  return status && status.allowEntry === true;
}

/**
 * Get warning message for current status
 * @param {Object} status - Current workflow status
 * @returns {string|null} Warning message
 */
export function getStatusWarning(status) {
  if (!status) return null;

  switch (status.id) {
    case 'PATTERN_DETECTED':
      return '⚠️ DO NOT ENTER YET - Wait for price to retest the zone';

    case 'ZONE_CREATED':
      return '⚠️ DO NOT ENTER YET - Wait for price to return to zone';

    case 'APPROACHING_ZONE':
      return '👀 WATCH CLOSELY - Price approaching zone, prepare for entry';

    case 'IN_ZONE':
      return '⏳ WAIT FOR CONFIRMATION - Do not enter without confirmation candle';

    case 'CONFIRMATION':
      return '✅ READY TO ENTER - Confirmation detected, execute trade now!';

    case 'ZONE_BROKEN':
      return '❌ DO NOT ENTER - Zone is broken, pattern invalidated';

    default:
      return null;
  }
}

/**
 * Validate if this is a RETEST entry (not BREAKOUT)
 * @param {Object} pattern - Pattern data
 * @param {Object} status - Current status
 * @returns {Object} Validation result
 */
export function validateRetestEntry(pattern, status) {
  // Entry is only valid if:
  // 1. Status is CONFIRMATION
  // 2. Price has retested the zone (not breaking out)

  if (!status || status.id !== 'CONFIRMATION') {
    return {
      isValid: false,
      reason: 'Not at confirmation stage',
      entryType: 'NONE'
    };
  }

  // This is a valid RETEST entry
  return {
    isValid: true,
    reason: 'Valid RETEST entry with confirmation',
    entryType: 'RETEST'
  };
}
