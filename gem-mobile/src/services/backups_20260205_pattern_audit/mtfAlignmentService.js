/**
 * GEM Mobile - Multi-Timeframe (MTF) Alignment Service
 * Analyzes zone confluence across different timeframes
 *
 * Timeframe Hierarchy:
 * - HTF (Higher Timeframe): 1D, 1W - Major structure
 * - ITF (Intermediate Timeframe): 4H - Trading zones
 * - LTF (Lower Timeframe): 1H, 15m - Entry timing
 *
 * Features:
 * - Calculate MTF alignment score
 * - Identify high-probability confluences
 * - Cache alignment data
 * - Generate trade recommendations
 */

import { supabase } from './supabase';
import { zoneManager, ZONE_TYPE, ZONE_STATUS } from './zoneManager';
import { multiPatternScanner } from './multiPatternScanner';
import tierAccessService from './tierAccessService';

// ============================================================
// CONSTANTS
// ============================================================

/**
 * Timeframe definitions
 */
export const TIMEFRAMES = {
  HTF: ['1d', '1w'],      // Higher Timeframe
  ITF: ['4h'],            // Intermediate Timeframe
  LTF: ['1h', '15m'],     // Lower Timeframe
};

/**
 * Timeframe weights for scoring
 */
const TF_WEIGHTS = {
  '1w': 1.5,
  '1d': 1.3,
  '4h': 1.0,
  '1h': 0.8,
  '15m': 0.6,
};

/**
 * Alignment score thresholds
 */
export const ALIGNMENT_LEVELS = {
  HIGH_PROBABILITY: 80,     // Strong confluence across TFs
  NORMAL: 50,               // Moderate confluence
  LOW: 30,                  // Weak confluence
  SKIP: 0,                  // No alignment
};

/**
 * Alignment status
 */
export const ALIGNMENT_STATUS = {
  ALIGNED: 'ALIGNED',           // All timeframes agree
  PARTIAL: 'PARTIAL',           // Some timeframes agree
  CONFLICTING: 'CONFLICTING',   // Timeframes disagree
  INSUFFICIENT: 'INSUFFICIENT', // Not enough data
};

/**
 * Trade recommendations
 */
export const RECOMMENDATION = {
  HIGH_PROBABILITY: 'HIGH_PROBABILITY',
  NORMAL: 'NORMAL',
  SKIP: 'SKIP',
  WAIT: 'WAIT',
};

/**
 * Cache expiry in milliseconds
 */
const CACHE_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

// ============================================================
// MTF ALIGNMENT SERVICE CLASS
// ============================================================

class MTFAlignmentService {
  constructor() {
    this.alignmentCache = new Map();
    this.lastCacheUpdate = new Map();
  }

  // ============================================================
  // MAIN ALIGNMENT METHODS
  // ============================================================

  /**
   * Calculate MTF alignment for a symbol
   * @param {string} symbol - Trading pair (e.g., 'BTCUSDT')
   * @param {string} userId - User ID
   * @param {string} userTier - User's tier
   * @returns {Promise<Object>} Alignment data
   */
  async calculateMTFAlignment(symbol, userId, userTier) {
    // Check tier access
    const allowedTFs = tierAccessService.getMTFTimeframesAllowed();
    if (allowedTFs === 0) {
      console.log('[MTFAlignment] MTF not available for tier:', userTier);
      return this._getInsufficientDataResult(symbol, 'Tier does not support MTF');
    }

    // Check cache
    const cacheKey = `${symbol}_${userId}`;
    const cached = this._getCachedAlignment(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      console.log(`[MTFAlignment] Calculating alignment for ${symbol}...`);

      // Determine which timeframes to analyze based on tier
      const timeframesToAnalyze = this._getTimeframesForTier(allowedTFs);

      // Fetch zones for each timeframe
      const zonesByTF = {};
      for (const tf of timeframesToAnalyze) {
        const zones = await zoneManager.getActiveZones(symbol, tf, userId);
        zonesByTF[tf] = zones;
      }

      // If not enough data, scan for patterns
      const tfWithZones = Object.entries(zonesByTF).filter(([_, zones]) => zones.length > 0);
      if (tfWithZones.length < 2) {
        // Scan for zones on missing timeframes
        for (const tf of timeframesToAnalyze) {
          if (zonesByTF[tf].length === 0) {
            const scanResult = await multiPatternScanner.scanAllPatterns(
              symbol,
              tf,
              userTier,
              { userId, createZones: true, maxPatterns: 3 }
            );
            zonesByTF[tf] = scanResult.zones || [];
          }
        }
      }

      // Categorize zones by timeframe type
      const htfZones = this._getZonesForTFType(zonesByTF, 'HTF');
      const itfZones = this._getZonesForTFType(zonesByTF, 'ITF');
      const ltfZones = this._getZonesForTFType(zonesByTF, 'LTF');

      // Calculate alignment
      const alignment = this._calculateAlignment(htfZones, itfZones, ltfZones);

      // Get recommendation
      const recommendation = this._getRecommendation(alignment.score);

      // Build result
      const result = {
        symbol,
        htf: {
          zones: htfZones,
          direction: this._getZoneDirection(htfZones),
          strength: this._getAverageStrength(htfZones),
        },
        itf: {
          zones: itfZones,
          direction: this._getZoneDirection(itfZones),
          strength: this._getAverageStrength(itfZones),
        },
        ltf: {
          zones: ltfZones,
          direction: this._getZoneDirection(ltfZones),
          strength: this._getAverageStrength(ltfZones),
        },
        alignment,
        recommendation,
        timestamp: new Date().toISOString(),
      };

      // Cache result
      this._cacheAlignment(cacheKey, result);

      // Save to database if significant alignment
      if (alignment.score >= ALIGNMENT_LEVELS.NORMAL) {
        await this._saveAlignmentToDb(userId, symbol, result);
      }

      console.log(`[MTFAlignment] ${symbol} alignment: ${alignment.score}% - ${recommendation}`);

      return result;

    } catch (error) {
      console.error('[MTFAlignment] Error calculating alignment:', error);
      return this._getInsufficientDataResult(symbol, error.message);
    }
  }

  /**
   * Get alignment score between zones
   * @param {Object} htfZone - Higher timeframe zone
   * @param {Object} itfZone - Intermediate timeframe zone
   * @param {Object} ltfZone - Lower timeframe zone
   * @returns {number} Alignment score (0-100)
   */
  getAlignmentScore(htfZone, itfZone, ltfZone) {
    const zones = [htfZone, itfZone, ltfZone].filter(z => z);

    if (zones.length < 2) {
      return 0;
    }

    let score = 0;
    let maxScore = 100;

    // Check direction alignment (40 points)
    const directions = zones.map(z => z.zone_type);
    const allSameDirection = directions.every(d => d === directions[0]);
    if (allSameDirection) {
      score += 40;
    } else if (directions.filter(d => d === directions[0]).length >= 2) {
      score += 20;
    }

    // Check price overlap (30 points)
    const hasOverlap = this._checkZoneOverlap(zones);
    if (hasOverlap) {
      score += 30;
    }

    // Check strength alignment (20 points)
    const avgStrength = this._getAverageStrength(zones);
    if (avgStrength >= 80) {
      score += 20;
    } else if (avgStrength >= 60) {
      score += 15;
    } else if (avgStrength >= 40) {
      score += 10;
    }

    // Bonus for HTF alignment (10 points)
    if (htfZone && htfZone.strength >= 80) {
      score += 10;
    }

    return Math.min(score, maxScore);
  }

  /**
   * Get trade recommendation based on alignment
   * @param {number} alignmentScore - Alignment score
   * @returns {string} Recommendation
   */
  _getRecommendation(alignmentScore) {
    if (alignmentScore >= ALIGNMENT_LEVELS.HIGH_PROBABILITY) {
      return RECOMMENDATION.HIGH_PROBABILITY;
    }
    if (alignmentScore >= ALIGNMENT_LEVELS.NORMAL) {
      return RECOMMENDATION.NORMAL;
    }
    if (alignmentScore >= ALIGNMENT_LEVELS.LOW) {
      return RECOMMENDATION.WAIT;
    }
    return RECOMMENDATION.SKIP;
  }

  // ============================================================
  // HELPER METHODS
  // ============================================================

  /**
   * Get timeframes based on tier allowance
   * @private
   */
  _getTimeframesForTier(allowedTFs) {
    if (allowedTFs >= 5) {
      return ['1w', '1d', '4h', '1h', '15m'];
    }
    if (allowedTFs >= 3) {
      return ['1d', '4h', '1h'];
    }
    return ['4h', '1h'];
  }

  /**
   * Get zones for a timeframe type
   * @private
   */
  _getZonesForTFType(zonesByTF, tfType) {
    const tfs = TIMEFRAMES[tfType] || [];
    const allZones = [];

    for (const tf of tfs) {
      if (zonesByTF[tf]) {
        allZones.push(...zonesByTF[tf]);
      }
    }

    return allZones;
  }

  /**
   * Calculate alignment between zone groups
   * @private
   */
  _calculateAlignment(htfZones, itfZones, ltfZones) {
    // Get best zone from each timeframe group
    const htfBest = htfZones.sort((a, b) => b.strength - a.strength)[0];
    const itfBest = itfZones.sort((a, b) => b.strength - a.strength)[0];
    const ltfBest = ltfZones.sort((a, b) => b.strength - a.strength)[0];

    const score = this.getAlignmentScore(htfBest, itfBest, ltfBest);

    // Determine status
    let status = ALIGNMENT_STATUS.INSUFFICIENT;
    const availableZones = [htfBest, itfBest, ltfBest].filter(z => z);

    if (availableZones.length >= 2) {
      const directions = availableZones.map(z => z.zone_type);
      const allSame = directions.every(d => d === directions[0]);

      if (allSame && score >= ALIGNMENT_LEVELS.HIGH_PROBABILITY) {
        status = ALIGNMENT_STATUS.ALIGNED;
      } else if (allSame) {
        status = ALIGNMENT_STATUS.PARTIAL;
      } else {
        status = ALIGNMENT_STATUS.CONFLICTING;
      }
    }

    // Determine direction
    const directionVotes = { LFZ: 0, HFZ: 0 };
    availableZones.forEach(z => {
      const weight = TF_WEIGHTS[z.timeframe] || 1;
      directionVotes[z.zone_type] += weight;
    });

    const direction = directionVotes.LFZ > directionVotes.HFZ ? 'LONG' : 'SHORT';

    return {
      score,
      status,
      direction,
      htfDirection: htfBest?.zone_type === ZONE_TYPE.LFZ ? 'LONG' : 'SHORT',
      itfDirection: itfBest?.zone_type === ZONE_TYPE.LFZ ? 'LONG' : 'SHORT',
      ltfDirection: ltfBest?.zone_type === ZONE_TYPE.LFZ ? 'LONG' : 'SHORT',
    };
  }

  /**
   * Get zone direction from zone type
   * @private
   */
  _getZoneDirection(zones) {
    if (!zones || zones.length === 0) return null;

    const lfzCount = zones.filter(z => z.zone_type === ZONE_TYPE.LFZ).length;
    const hfzCount = zones.filter(z => z.zone_type === ZONE_TYPE.HFZ).length;

    return lfzCount >= hfzCount ? 'LONG' : 'SHORT';
  }

  /**
   * Get average strength of zones
   * @private
   */
  _getAverageStrength(zones) {
    if (!zones || zones.length === 0) return 0;

    const total = zones.reduce((sum, z) => sum + (z.strength || 0), 0);
    return Math.round(total / zones.length);
  }

  /**
   * Check if zones overlap in price
   * @private
   */
  _checkZoneOverlap(zones) {
    if (zones.length < 2) return false;

    for (let i = 0; i < zones.length; i++) {
      for (let j = i + 1; j < zones.length; j++) {
        const z1 = zones[i];
        const z2 = zones[j];

        // Check if zones overlap in price
        const overlap = Math.min(z1.zone_high, z2.zone_high) >= Math.max(z1.zone_low, z2.zone_low);
        if (overlap) return true;

        // Check if zones are close (within 2%)
        const avgPrice = (z1.zone_high + z1.zone_low + z2.zone_high + z2.zone_low) / 4;
        const distance = Math.abs((z1.zone_high + z1.zone_low) / 2 - (z2.zone_high + z2.zone_low) / 2);
        if (distance / avgPrice < 0.02) return true;
      }
    }

    return false;
  }

  /**
   * Get insufficient data result
   * @private
   */
  _getInsufficientDataResult(symbol, reason) {
    return {
      symbol,
      htf: { zones: [], direction: null, strength: 0 },
      itf: { zones: [], direction: null, strength: 0 },
      ltf: { zones: [], direction: null, strength: 0 },
      alignment: {
        score: 0,
        status: ALIGNMENT_STATUS.INSUFFICIENT,
        direction: null,
      },
      recommendation: RECOMMENDATION.SKIP,
      error: reason,
      timestamp: new Date().toISOString(),
    };
  }

  // ============================================================
  // CACHE METHODS
  // ============================================================

  /**
   * Get cached alignment
   * @private
   */
  _getCachedAlignment(cacheKey) {
    const lastUpdate = this.lastCacheUpdate.get(cacheKey);
    if (lastUpdate && (Date.now() - lastUpdate) < CACHE_EXPIRY_MS) {
      return this.alignmentCache.get(cacheKey);
    }
    return null;
  }

  /**
   * Cache alignment result
   * @private
   */
  _cacheAlignment(cacheKey, result) {
    this.alignmentCache.set(cacheKey, result);
    this.lastCacheUpdate.set(cacheKey, Date.now());
  }

  /**
   * Save alignment to database
   * @private
   */
  async _saveAlignmentToDb(userId, symbol, alignment) {
    try {
      const { error } = await supabase
        .from('mtf_alignment_cache')
        .upsert({
          user_id: userId,
          symbol,
          htf_direction: alignment.htf.direction,
          htf_strength: alignment.htf.strength,
          itf_direction: alignment.itf.direction,
          itf_strength: alignment.itf.strength,
          ltf_direction: alignment.ltf.direction,
          ltf_strength: alignment.ltf.strength,
          confluence_score: alignment.alignment.score,
          recommendation: alignment.recommendation,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,symbol',
        });

      if (error) {
        console.error('[MTFAlignment] Error saving to database:', error);
      }
    } catch (error) {
      console.error('[MTFAlignment] Database error:', error);
    }
  }

  /**
   * Clear cache for symbol
   * @param {string} symbol - Trading pair
   * @param {string} userId - User ID
   */
  clearCache(symbol, userId) {
    const cacheKey = `${symbol}_${userId}`;
    this.alignmentCache.delete(cacheKey);
    this.lastCacheUpdate.delete(cacheKey);
  }

  /**
   * Clear all caches
   */
  clearAllCaches() {
    this.alignmentCache.clear();
    this.lastCacheUpdate.clear();
  }

  /**
   * Get cached alignment for display (returns null if not available)
   * @param {string} symbol - Trading pair
   * @param {string} userId - User ID
   * @returns {Object|null} Cached alignment or null
   */
  getCachedAlignmentSync(symbol, userId) {
    const cacheKey = `${symbol}_${userId}`;
    return this._getCachedAlignment(cacheKey);
  }
}

// Export singleton instance
export const mtfAlignmentService = new MTFAlignmentService();
export default mtfAlignmentService;
