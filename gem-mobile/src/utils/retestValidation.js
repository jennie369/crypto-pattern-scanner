/**
 * Zone Retest Validation
 * Validates that price has properly retested the pattern zone
 * Critical for GEM Method - wait for retest, not breakout
 *
 * @module retestValidation
 */

/**
 * Calculate distance from price to zone
 * @param {Number} currentPrice - Current price
 * @param {Object} zone - {top, bottom}
 * @returns {Number} Distance percentage (positive = outside zone)
 */
export function calculateDistanceFromZone(currentPrice, zone) {
  if (!zone || !zone.top || !zone.bottom) return 0;

  if (currentPrice > zone.top) {
    return ((currentPrice - zone.top) / zone.top) * 100;
  } else if (currentPrice < zone.bottom) {
    return ((zone.bottom - currentPrice) / zone.bottom) * 100;
  }
  return 0; // Inside zone
}

/**
 * Check if price is inside zone
 * @param {Number} price - Price to check
 * @param {Object} zone - {top, bottom}
 * @param {Number} tolerance - Tolerance percentage (default 0.5%)
 * @returns {Boolean}
 */
export function isPriceInZone(price, zone, tolerance = 0.5) {
  if (!zone || !zone.top || !zone.bottom) return false;

  const toleranceAmount = (zone.top - zone.bottom) * (tolerance / 100);
  const expandedTop = zone.top + toleranceAmount;
  const expandedBottom = zone.bottom - toleranceAmount;

  return price >= expandedBottom && price <= expandedTop;
}

/**
 * Count number of retests at zone
 * @param {Array} priceHistory - Array of {timestamp, price}
 * @param {Object} zone - {top, bottom}
 * @param {Number} sinceTimestamp - Count retests after this time
 * @returns {Number} Retest count
 */
export function countRetests(priceHistory, zone, sinceTimestamp = 0) {
  if (!priceHistory || priceHistory.length === 0) return 0;

  let retestCount = 0;
  let wasOutsideZone = false;
  let lastState = null;

  const relevantPrices = priceHistory.filter(p => p.timestamp > sinceTimestamp);

  relevantPrices.forEach(p => {
    const inZone = isPriceInZone(p.price, zone);

    if (!inZone && lastState === 'inside') {
      wasOutsideZone = true;
    } else if (inZone && wasOutsideZone) {
      retestCount++;
      wasOutsideZone = false;
    }

    lastState = inZone ? 'inside' : 'outside';
  });

  return retestCount;
}

/**
 * Validate zone retest for a pattern
 * @param {Object} pattern - Pattern object with zone, direction, detectedAt
 * @param {Number} currentPrice - Current price
 * @param {Array} priceHistory - Price history since detection [{timestamp, price}]
 * @returns {Object} Retest validation result
 */
export function validateRetest(pattern, currentPrice, priceHistory = []) {
  const { zone, direction, detectedAt } = pattern;

  // If no zone defined, can't validate retest
  if (!zone || !zone.top || !zone.bottom) {
    console.log('[Retest Validation] No zone defined for pattern');
    return {
      hasRetested: false,
      canSkipRetest: true, // Allow pattern without zone to pass
      error: 'No zone defined for pattern'
    };
  }

  // Check if price is currently in zone
  const inZone = isPriceInZone(currentPrice, zone);
  const distanceFromZone = calculateDistanceFromZone(currentPrice, zone);

  // If not in zone, waiting for price to come back
  if (!inZone) {
    console.log('[Retest Validation] Price outside zone, waiting for retest', {
      currentPrice,
      zone,
      distance: distanceFromZone.toFixed(2) + '%'
    });

    return {
      hasRetested: false,
      waitingForRetest: true,
      distanceFromZone,
      currentPrice,
      zone,
      reason: distanceFromZone > 5 ? 'TOO_FAR_FROM_ZONE' : 'WAITING_FOR_PULLBACK'
    };
  }

  // Price is in zone - check if it moved away and came back (proper retest)
  const pricesSinceDetection = priceHistory.filter(p => p.timestamp > (detectedAt || 0));

  // If just detected, no history yet
  if (pricesSinceDetection.length === 0) {
    console.log('[Retest Validation] Just detected, waiting for price action');
    return {
      hasRetested: false,
      waitingForRetest: true,
      reason: 'JUST_DETECTED',
      distanceFromZone: 0
    };
  }

  // Check if price moved away from zone
  let movedAway = false;
  const zoneMidpoint = (zone.top + zone.bottom) / 2;
  const moveThreshold = 0.015; // 1.5% move required

  if (direction === 'SHORT' || direction === 'BEARISH') {
    // For SHORT: Price should move UP from zone, then come back down
    movedAway = pricesSinceDetection.some(p => p.price > zone.top * (1 + moveThreshold));
  } else if (direction === 'LONG' || direction === 'BULLISH') {
    // For LONG: Price should move DOWN from zone, then come back up
    movedAway = pricesSinceDetection.some(p => p.price < zone.bottom * (1 - moveThreshold));
  } else {
    // For BREAKOUT patterns, any significant move counts
    movedAway = pricesSinceDetection.some(p => {
      const distance = Math.abs(p.price - zoneMidpoint) / zoneMidpoint;
      return distance > moveThreshold;
    });
  }

  // If moved away and now back in zone = valid retest
  if (movedAway && inZone) {
    const retestCount = countRetests(priceHistory, zone, detectedAt);

    console.log('[Retest Validation] Valid retest detected!', {
      retestCount,
      direction,
      currentPrice,
      zone
    });

    return {
      hasRetested: true,
      retestCount: Math.max(1, retestCount),
      retestQuality: retestCount >= 2 ? 'STRONG' : 'MODERATE',
      currentPrice,
      zone,
      distanceFromZone: 0
    };
  }

  // In zone but hasn't moved away yet - fresh detection
  console.log('[Retest Validation] In zone but no retest yet', {
    movedAway,
    inZone,
    reason: movedAway ? 'MOVED_AWAY_NOT_BACK' : 'NOT_MOVED_AWAY_YET'
  });

  return {
    hasRetested: false,
    waitingForRetest: true,
    reason: movedAway ? 'MOVED_AWAY_NOT_BACK' : 'NOT_MOVED_AWAY_YET',
    distanceFromZone: 0,
    inZone: true
  };
}

/**
 * Get retest status description for UI
 * @param {Object} retestResult - Result from validateRetest
 * @returns {Object} UI-friendly status
 */
export function getRetestStatus(retestResult) {
  if (!retestResult) {
    return { status: 'UNKNOWN', label: 'Unknown', color: 'gray' };
  }

  if (retestResult.hasRetested) {
    const quality = retestResult.retestQuality || 'MODERATE';
    return {
      status: 'CONFIRMED',
      label: `Retest ${quality === 'STRONG' ? 'Confirmed' : 'OK'}`,
      color: quality === 'STRONG' ? 'green' : 'lime',
      retestCount: retestResult.retestCount
    };
  }

  if (retestResult.waitingForRetest) {
    const distance = retestResult.distanceFromZone || 0;

    if (distance > 5) {
      return {
        status: 'FAR',
        label: `${distance.toFixed(1)}% away`,
        color: 'orange'
      };
    }

    return {
      status: 'WAITING',
      label: 'Waiting for retest',
      color: 'yellow'
    };
  }

  if (retestResult.canSkipRetest) {
    return {
      status: 'SKIPPED',
      label: 'No zone',
      color: 'gray'
    };
  }

  return { status: 'UNKNOWN', label: 'Unknown', color: 'gray' };
}

export default {
  validateRetest,
  calculateDistanceFromZone,
  isPriceInZone,
  countRetests,
  getRetestStatus
};
