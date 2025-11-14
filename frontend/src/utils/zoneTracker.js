/**
 * Zone Tracker Utility
 * GEM Frequency Trading Method - Zone Management System
 *
 * Tracks the lifecycle of frequency zones (HFZ/LFZ):
 * - fresh (⭐⭐⭐⭐⭐) - 0 retests - BEST
 * - tested_1x (⭐⭐⭐⭐) - 1 retest - GOOD
 * - tested_2x (⭐⭐⭐) - 2 retests - OKAY
 * - weak (❌) - 3+ retests - SKIP
 * - broken (❌) - Zone violated - INVALIDATED
 *
 * ⚠️ CRITICAL: Zones should only be traded 1-2 times max!
 */

/**
 * Zone status constants
 */
export const ZONE_STATUS = {
  FRESH: 'fresh',           // 0 retests - Best quality
  TESTED_1X: 'tested_1x',   // 1 retest - Good quality
  TESTED_2X: 'tested_2x',   // 2 retests - Okay quality
  WEAK: 'weak',             // 3+ retests - Skip
  BROKEN: 'broken'          // Zone violated - Invalid
};

/**
 * Zone quality ratings
 */
export const ZONE_QUALITY = {
  [ZONE_STATUS.FRESH]: {
    stars: 5,
    label: '⭐⭐⭐⭐⭐ Fresh (Best)',
    tradeable: true,
    priority: 1
  },
  [ZONE_STATUS.TESTED_1X]: {
    stars: 4,
    label: '⭐⭐⭐⭐ Tested 1x (Good)',
    tradeable: true,
    priority: 2
  },
  [ZONE_STATUS.TESTED_2X]: {
    stars: 3,
    label: '⭐⭐⭐ Tested 2x (Okay)',
    tradeable: true,
    priority: 3
  },
  [ZONE_STATUS.WEAK]: {
    stars: 0,
    label: '❌ Tested 3+ (Skip)',
    tradeable: false,
    priority: 99
  },
  [ZONE_STATUS.BROKEN]: {
    stars: 0,
    label: '❌ Broken (Invalid)',
    tradeable: false,
    priority: 99
  }
};

/**
 * Zone tracker class to manage multiple zones
 */
export class ZoneTracker {
  constructor() {
    this.zones = new Map(); // zoneId -> zone data
    this.activeZones = new Set(); // Currently active zone IDs
  }

  /**
   * Add a new zone to tracker
   * @param {Object} zone - Zone data from pattern detection
   * @returns {string} Zone ID
   */
  addZone(zone) {
    const zoneId = this.generateZoneId(zone);

    const trackedZone = {
      id: zoneId,
      type: zone.type, // 'HFZ' or 'LFZ'
      high: zone.high,
      low: zone.low,
      mid: zone.mid,
      status: ZONE_STATUS.FRESH,
      retestCount: 0,
      createdAt: zone.timestamp || new Date().toISOString(),
      lastTestedAt: null,
      trades: [], // Track trades taken from this zone
      metadata: zone
    };

    this.zones.set(zoneId, trackedZone);
    this.activeZones.add(zoneId);

    return zoneId;
  }

  /**
   * Check if price is retesting a zone
   * @param {number} currentPrice - Current market price
   * @param {number} currentTime - Current timestamp
   * @returns {Array} Array of zones being retested
   */
  checkForRetests(currentPrice, currentTime) {
    const retestingZones = [];

    for (const zoneId of this.activeZones) {
      const zone = this.zones.get(zoneId);

      if (!zone || zone.status === ZONE_STATUS.BROKEN) continue;

      // Check if price is within zone boundaries
      if (currentPrice >= zone.low && currentPrice <= zone.high) {
        // Don't count if already counted this retest recently
        const timeSinceLastTest = zone.lastTestedAt
          ? new Date(currentTime) - new Date(zone.lastTestedAt)
          : Infinity;

        // Only count as new retest if >1 hour since last test
        if (timeSinceLastTest > 3600000) { // 1 hour in ms
          retestingZones.push({
            zoneId,
            zone,
            retestType: zone.type === 'HFZ' ? 'resistance' : 'support'
          });
        }
      }
    }

    return retestingZones;
  }

  /**
   * Record a zone retest
   * @param {string} zoneId - Zone ID
   * @param {number} currentTime - Retest timestamp
   * @returns {Object} Updated zone
   */
  recordRetest(zoneId, currentTime) {
    const zone = this.zones.get(zoneId);
    if (!zone) return null;

    zone.retestCount++;
    zone.lastTestedAt = currentTime;

    // Update zone status based on retest count
    if (zone.retestCount === 1) {
      zone.status = ZONE_STATUS.TESTED_1X;
    } else if (zone.retestCount === 2) {
      zone.status = ZONE_STATUS.TESTED_2X;
    } else if (zone.retestCount >= 3) {
      zone.status = ZONE_STATUS.WEAK;
      this.activeZones.delete(zoneId); // Remove from active zones
    }

    return zone;
  }

  /**
   * Check if zone is broken (price closed beyond zone)
   * @param {string} zoneId - Zone ID
   * @param {number} closePrice - Candle close price
   * @returns {boolean} True if zone broken
   */
  checkZoneBroken(zoneId, closePrice) {
    const zone = this.zones.get(zoneId);
    if (!zone) return false;

    let isBroken = false;

    if (zone.type === 'HFZ') {
      // HFZ broken if price CLOSES above zone high
      isBroken = closePrice > zone.high;
    } else {
      // LFZ broken if price CLOSES below zone low
      isBroken = closePrice < zone.low;
    }

    if (isBroken) {
      zone.status = ZONE_STATUS.BROKEN;
      this.activeZones.delete(zoneId);
    }

    return isBroken;
  }

  /**
   * Get all active (tradeable) zones
   * @returns {Array} Array of active zones
   */
  getActiveZones() {
    const active = [];

    for (const zoneId of this.activeZones) {
      const zone = this.zones.get(zoneId);
      if (zone && ZONE_QUALITY[zone.status].tradeable) {
        active.push(zone);
      }
    }

    // Sort by priority (fresh zones first)
    active.sort((a, b) => {
      return ZONE_QUALITY[a.status].priority - ZONE_QUALITY[b.status].priority;
    });

    return active;
  }

  /**
   * Get zone quality information
   * @param {string} zoneId - Zone ID
   * @returns {Object} Zone quality details
   */
  getZoneQuality(zoneId) {
    const zone = this.zones.get(zoneId);
    if (!zone) return null;

    return {
      ...ZONE_QUALITY[zone.status],
      retestCount: zone.retestCount,
      status: zone.status
    };
  }

  /**
   * Record a trade taken from a zone
   * @param {string} zoneId - Zone ID
   * @param {Object} tradeData - Trade details
   */
  recordTrade(zoneId, tradeData) {
    const zone = this.zones.get(zoneId);
    if (!zone) return;

    zone.trades.push({
      timestamp: new Date().toISOString(),
      ...tradeData
    });

    // If 2+ trades taken, consider removing from active
    if (zone.trades.length >= 2) {
      this.activeZones.delete(zoneId);
    }
  }

  /**
   * Generate unique zone ID
   * @param {Object} zone - Zone data
   * @returns {string} Zone ID
   */
  generateZoneId(zone) {
    const timestamp = zone.timestamp || new Date().toISOString();
    const priceLevel = zone.mid.toFixed(2);
    return `${zone.type}_${priceLevel}_${timestamp}`;
  }

  /**
   * Clean up old zones (older than 30 days)
   */
  cleanup() {
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);

    for (const [zoneId, zone] of this.zones.entries()) {
      const createdAt = new Date(zone.createdAt).getTime();

      if (createdAt < thirtyDaysAgo) {
        this.zones.delete(zoneId);
        this.activeZones.delete(zoneId);
      }
    }
  }

  /**
   * Get statistics about tracked zones
   * @returns {Object} Zone statistics
   */
  getStatistics() {
    const stats = {
      total: this.zones.size,
      active: this.activeZones.size,
      byStatus: {},
      byType: { HFZ: 0, LFZ: 0 }
    };

    for (const status of Object.values(ZONE_STATUS)) {
      stats.byStatus[status] = 0;
    }

    for (const zone of this.zones.values()) {
      stats.byStatus[zone.status]++;
      stats.byType[zone.type]++;
    }

    return stats;
  }
}

/**
 * Update zone status based on market conditions
 * @param {Object} zone - Zone object
 * @param {Array} candles - Recent candlestick data
 * @returns {Object} Updated zone
 */
export function updateZoneStatus(zone, candles) {
  if (!zone || !candles || candles.length === 0) return zone;

  const lastCandle = candles[candles.length - 1];
  const closePrice = lastCandle.close;

  // Check if zone is broken
  if (zone.type === 'HFZ' && closePrice > zone.high) {
    zone.status = ZONE_STATUS.BROKEN;
    zone.broken = true;
  } else if (zone.type === 'LFZ' && closePrice < zone.low) {
    zone.status = ZONE_STATUS.BROKEN;
    zone.broken = true;
  }

  // Update status based on retest count
  if (!zone.broken) {
    if (zone.retestCount === 0) {
      zone.status = ZONE_STATUS.FRESH;
    } else if (zone.retestCount === 1) {
      zone.status = ZONE_STATUS.TESTED_1X;
    } else if (zone.retestCount === 2) {
      zone.status = ZONE_STATUS.TESTED_2X;
    } else {
      zone.status = ZONE_STATUS.WEAK;
    }
  }

  return zone;
}

/**
 * Check if a zone should be traded
 * @param {Object} zone - Zone object
 * @returns {boolean} True if zone is tradeable
 */
export function isZoneTradeable(zone) {
  if (!zone) return false;

  const quality = ZONE_QUALITY[zone.status];
  return quality && quality.tradeable;
}

/**
 * Get zone alert message
 * @param {Object} zone - Zone object
 * @param {string} symbol - Trading symbol
 * @returns {string} Alert message
 */
export function getZoneAlert(zone, symbol) {
  const quality = ZONE_QUALITY[zone.status];

  if (!quality) return null;

  const direction = zone.type === 'HFZ' ? 'SHORT' : 'LONG';
  const zoneType = zone.type === 'HFZ' ? 'resistance' : 'support';

  if (quality.tradeable) {
    return `🔔 ${symbol} approaching ${zoneType} zone! ${quality.label} - Prepare ${direction} entry with confirmation`;
  } else {
    return `⚠️ ${symbol} at weak zone - ${quality.label} - Skip this setup`;
  }
}

/**
 * Calculate zone strength score (0-100)
 * @param {Object} zone - Zone object
 * @returns {number} Strength score
 */
export function calculateZoneStrength(zone) {
  let score = 100;

  // Reduce score based on retest count
  score -= zone.retestCount * 15;

  // Broken zones have 0 strength
  if (zone.status === ZONE_STATUS.BROKEN) {
    return 0;
  }

  // Add bonus for fresh zones
  if (zone.status === ZONE_STATUS.FRESH) {
    score += 10;
  }

  // Factor in zone creation confidence
  if (zone.metadata && zone.metadata.confidence) {
    score = score * zone.metadata.confidence;
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Create a global zone tracker instance
 */
export const globalZoneTracker = new ZoneTracker();
