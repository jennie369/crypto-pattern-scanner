/**
 * OpposingMapperService - O(1) lookup cho opposing patterns
 *
 * VAN DE TRUOC:
 * - findOpposingPatterns() su dung filter() cho moi pattern = O(n²)
 * - Cham khi co nhieu patterns (100+ patterns)
 *
 * GIAI PHAP:
 * 1. Pre-build Map<direction, patterns[]> mot lan
 * 2. Lookup O(1) thay vi filter O(n)
 * 3. Price range indexing cho TP optimization
 *
 * PERFORMANCE: O(n²) -> O(n) overall
 *
 * USAGE:
 * import { opposingMapper } from '../services/scanner/opposingMapperService';
 *
 * // Build maps once after detecting all patterns
 * opposingMapper.buildMaps(allPatterns);
 *
 * // O(1) lookup
 * const opposing = opposingMapper.getOpposing(currentPattern);
 *
 * // Find optimal TP
 * const optimalTP = opposingMapper.findOptimalTP(pattern, defaultTP);
 */

class OpposingMapperService {
  constructor() {
    this.opposingMap = new Map();
    this.priceRangeIndex = new Map(); // For quick price-based lookup
    this.allPatterns = [];

    // Config
    this.MIN_RR_RATIO = 2.0;
    this.EPSILON = 0.01; // Floating point tolerance

    // Debug
    this.DEBUG = __DEV__ || false;

    // Metrics
    this.metrics = {
      buildTime: 0,
      lookups: 0,
      tpOptimizations: 0,
    };
  }

  /**
   * Build opposing pattern maps from all detected patterns
   * @param {array} patterns - All detected patterns
   * @returns {object} { bullish: [], bearish: [], neutral: [] }
   */
  buildMaps(patterns) {
    const startTime = Date.now();

    // Clear existing maps
    this.opposingMap.clear();
    this.priceRangeIndex.clear();
    this.allPatterns = patterns || [];

    // Initialize direction buckets
    this.opposingMap.set('bullish', []);
    this.opposingMap.set('bearish', []);
    this.opposingMap.set('neutral', []);

    if (!patterns || patterns.length === 0) {
      return {
        bullish: [],
        bearish: [],
        neutral: [],
      };
    }

    // Single pass O(n) to categorize all patterns
    patterns.forEach((pattern, index) => {
      const direction = this._normalizeDirection(pattern);

      // Add index for reference
      const patternWithIndex = { ...pattern, _index: index };

      this.opposingMap.get(direction).push(patternWithIndex);

      // Also index by price range for quick TP optimization
      this._indexByPriceRange(patternWithIndex);
    });

    // Sort each bucket by confidence for priority (highest first)
    this.opposingMap.forEach((bucket, key) => {
      bucket.sort((a, b) => {
        const confA = parseFloat(a.confidence || a.score || 0);
        const confB = parseFloat(b.confidence || b.score || 0);
        return confB - confA;
      });
    });

    this.metrics.buildTime = Date.now() - startTime;

    if (this.DEBUG) {
      console.log('[OpposingMapper] Built maps:', {
        bullish: this.opposingMap.get('bullish').length,
        bearish: this.opposingMap.get('bearish').length,
        neutral: this.opposingMap.get('neutral').length,
        buildTime: this.metrics.buildTime + 'ms',
      });
    }

    return {
      bullish: this.opposingMap.get('bullish'),
      bearish: this.opposingMap.get('bearish'),
      neutral: this.opposingMap.get('neutral'),
    };
  }

  /**
   * Get opposing patterns for a given pattern - O(1) lookup
   * @param {object} pattern - Current pattern
   * @returns {array} Opposing patterns sorted by confidence
   */
  getOpposing(pattern) {
    this.metrics.lookups++;

    const direction = this._normalizeDirection(pattern);

    // Opposing direction lookup
    const opposingDirection = direction === 'bullish' ? 'bearish' :
                              direction === 'bearish' ? 'bullish' : 'neutral';

    return this.opposingMap.get(opposingDirection) || [];
  }

  /**
   * Get same-direction patterns (for confluence)
   * @param {object} pattern - Current pattern
   * @returns {array} Same direction patterns
   */
  getSameDirection(pattern) {
    const direction = this._normalizeDirection(pattern);
    return this.opposingMap.get(direction) || [];
  }

  /**
   * Get opposing patterns within a price range (for TP optimization)
   * @param {object} pattern - Current pattern
   * @param {number} maxDistance - Max price distance to consider (percentage)
   * @returns {array} Nearby opposing patterns sorted by distance
   */
  getOpposingInRange(pattern, maxDistance = 10) {
    const opposing = this.getOpposing(pattern);
    const entry = parseFloat(pattern.entry || pattern.entry_price || 0);

    if (entry <= 0 || maxDistance <= 0) return opposing;

    const maxPriceDistance = entry * (maxDistance / 100);

    return opposing.filter(p => {
      const pEntry = parseFloat(p.entry || p.entry_price || 0);
      return Math.abs(pEntry - entry) <= maxPriceDistance;
    }).sort((a, b) => {
      // Sort by distance to current pattern's entry
      const distA = Math.abs(parseFloat(a.entry || a.entry_price || 0) - entry);
      const distB = Math.abs(parseFloat(b.entry || b.entry_price || 0) - entry);
      return distA - distB;
    });
  }

  /**
   * Find optimal TP based on opposing patterns - O(1) with pre-built map
   * @param {object} pattern - Current pattern
   * @param {number} defaultTP - Default TP if no opposing found
   * @returns {number} Optimal TP price
   */
  findOptimalTP(pattern, defaultTP) {
    this.metrics.tpOptimizations++;

    const entry = parseFloat(pattern.entry || pattern.entry_price || 0);
    const sl = parseFloat(pattern.stopLoss || pattern.stop_loss || 0);

    if (entry <= 0 || sl <= 0) return defaultTP;

    const direction = this._normalizeDirection(pattern);
    const isBullish = direction === 'bullish';
    const risk = Math.abs(entry - sl);

    // Minimum TP for 1:2 R:R
    const minTP = isBullish ? entry + (risk * this.MIN_RR_RATIO) : entry - (risk * this.MIN_RR_RATIO);

    // Get opposing patterns
    const opposing = this.getOpposing(pattern);

    if (opposing.length === 0) {
      return defaultTP || minTP;
    }

    let optimalTP = defaultTP || minTP;
    let bestOpposingZone = null;

    // Find nearest opposing zone that provides at least 1:2 R:R
    for (const opp of opposing) {
      const oppZoneHigh = parseFloat(opp.zoneHigh || opp.zone_high || 0);
      const oppZoneLow = parseFloat(opp.zoneLow || opp.zone_low || 0);

      if (oppZoneHigh <= 0 || oppZoneLow <= 0) continue;

      // For bullish, TP should be at or before opposing zone LOW (resistance)
      // For bearish, TP should be at or before opposing zone HIGH (support)
      const targetLevel = isBullish ? oppZoneLow : oppZoneHigh;

      // Check direction validity
      if (isBullish && targetLevel <= entry) continue; // TP must be above entry for bullish
      if (!isBullish && targetLevel >= entry) continue; // TP must be below entry for bearish

      // Check if this level provides at least minimum R:R
      const reward = Math.abs(targetLevel - entry);
      const rr = risk > 0 ? reward / risk : 0;

      if (rr >= this.MIN_RR_RATIO - this.EPSILON) {
        // This is a valid TP level, check if it's better (closer)
        const currentDistance = Math.abs(optimalTP - entry);
        const newDistance = Math.abs(targetLevel - entry);

        // Prefer closer TP (but still meeting min R:R)
        if (newDistance < currentDistance) {
          optimalTP = targetLevel;
          bestOpposingZone = opp;
        }
      }
    }

    if (this.DEBUG && bestOpposingZone) {
      console.log('[OpposingMapper] TP optimized:', {
        pattern: pattern.type,
        defaultTP,
        optimalTP,
        opposingZone: bestOpposingZone.type,
      });
    }

    // Ensure minimum R:R
    if (isBullish && optimalTP < minTP) optimalTP = minTP;
    if (!isBullish && optimalTP > minTP) optimalTP = minTP;

    return optimalTP;
  }

  /**
   * Find all opposing zones that price would encounter
   * @param {object} pattern - Current pattern
   * @returns {array} Opposing zones in order of encounter
   */
  findOpposingZonesInPath(pattern) {
    const entry = parseFloat(pattern.entry || pattern.entry_price || 0);
    const direction = this._normalizeDirection(pattern);
    const isBullish = direction === 'bullish';

    const opposing = this.getOpposing(pattern);

    // Filter to zones in the path of the trade
    const zonesInPath = opposing.filter(opp => {
      const zoneHigh = parseFloat(opp.zoneHigh || opp.zone_high || 0);
      const zoneLow = parseFloat(opp.zoneLow || opp.zone_low || 0);

      if (zoneHigh <= 0 || zoneLow <= 0) return false;

      // For bullish, zones above entry
      if (isBullish) {
        return zoneLow > entry;
      }
      // For bearish, zones below entry
      return zoneHigh < entry;
    });

    // Sort by distance from entry
    return zonesInPath.sort((a, b) => {
      const aLevel = isBullish
        ? parseFloat(a.zoneLow || a.zone_low || 0)
        : parseFloat(a.zoneHigh || a.zone_high || 0);
      const bLevel = isBullish
        ? parseFloat(b.zoneLow || b.zone_low || 0)
        : parseFloat(b.zoneHigh || b.zone_high || 0);

      return Math.abs(aLevel - entry) - Math.abs(bLevel - entry);
    });
  }

  /**
   * Calculate multiple TP levels based on opposing zones
   * @param {object} pattern - Current pattern
   * @param {number} numLevels - Number of TP levels (default: 3)
   * @returns {array} Array of TP levels
   */
  calculateMultipleTPs(pattern, numLevels = 3) {
    const entry = parseFloat(pattern.entry || pattern.entry_price || 0);
    const sl = parseFloat(pattern.stopLoss || pattern.stop_loss || 0);
    const risk = Math.abs(entry - sl);
    const direction = this._normalizeDirection(pattern);
    const isBullish = direction === 'bullish';

    const tpLevels = [];
    const opposingZones = this.findOpposingZonesInPath(pattern);

    // Default TPs at 1:2, 1:3, 1:4 R:R
    const defaultRRs = [2, 3, 4];

    for (let i = 0; i < numLevels; i++) {
      const rr = defaultRRs[i] || (2 + i);
      const defaultTP = isBullish ? entry + (risk * rr) : entry - (risk * rr);

      // Check if there's an opposing zone before this default TP
      const opposingBefore = opposingZones.find(opp => {
        const level = isBullish
          ? parseFloat(opp.zoneLow || opp.zone_low || 0)
          : parseFloat(opp.zoneHigh || opp.zone_high || 0);

        if (isBullish) {
          return level > entry && level < defaultTP;
        }
        return level < entry && level > defaultTP;
      });

      if (opposingBefore) {
        const level = isBullish
          ? parseFloat(opposingBefore.zoneLow || opposingBefore.zone_low)
          : parseFloat(opposingBefore.zoneHigh || opposingBefore.zone_high);

        tpLevels.push({
          level,
          rr: (Math.abs(level - entry) / risk).toFixed(2),
          source: 'opposing_zone',
          zone: opposingBefore.type,
        });
      } else {
        tpLevels.push({
          level: defaultTP,
          rr: rr.toFixed(2),
          source: 'default',
        });
      }
    }

    return tpLevels;
  }

  /**
   * Clear all maps
   */
  clear() {
    this.opposingMap.clear();
    this.priceRangeIndex.clear();
    this.allPatterns = [];
  }

  /**
   * Get metrics
   */
  getMetrics() {
    return {
      ...this.metrics,
      totalPatterns: this.allPatterns.length,
      bullishCount: this.opposingMap.get('bullish')?.length || 0,
      bearishCount: this.opposingMap.get('bearish')?.length || 0,
    };
  }

  // === PRIVATE HELPERS ===

  _normalizeDirection(pattern) {
    const dir = (pattern?.direction || pattern?.trend || '').toLowerCase();

    if (dir.includes('bull') || dir.includes('long') || dir.includes('up')) {
      return 'bullish';
    }
    if (dir.includes('bear') || dir.includes('short') || dir.includes('down')) {
      return 'bearish';
    }

    // Infer from prices
    const entry = parseFloat(pattern?.entry || pattern?.entry_price || 0);
    const sl = parseFloat(pattern?.stopLoss || pattern?.stop_loss || 0);

    if (entry > 0 && sl > 0) {
      return sl < entry ? 'bullish' : 'bearish';
    }

    return 'neutral';
  }

  _indexByPriceRange(pattern) {
    const entry = parseFloat(pattern.entry || pattern.entry_price || 0);
    if (entry <= 0) return;

    // Round to nearest significant price level
    let bucketSize;
    if (entry < 0.01) bucketSize = 0.0001;
    else if (entry < 0.1) bucketSize = 0.001;
    else if (entry < 1) bucketSize = 0.01;
    else if (entry < 10) bucketSize = 0.1;
    else if (entry < 100) bucketSize = 1;
    else if (entry < 1000) bucketSize = 10;
    else if (entry < 10000) bucketSize = 100;
    else bucketSize = 1000;

    const bucket = Math.floor(entry / bucketSize) * bucketSize;

    if (!this.priceRangeIndex.has(bucket)) {
      this.priceRangeIndex.set(bucket, []);
    }
    this.priceRangeIndex.get(bucket).push(pattern);
  }
}

// Singleton instance
export const opposingMapper = new OpposingMapperService();

// Named export
export { OpposingMapperService };

// Default export
export default opposingMapper;
