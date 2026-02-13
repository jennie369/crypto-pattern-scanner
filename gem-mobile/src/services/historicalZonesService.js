/**
 * Historical Zones Service
 * Query and filter historical zones with various options
 *
 * Features:
 * - Filter by status (FRESH, TESTED, BROKEN)
 * - Filter by age (days)
 * - Get zone statistics
 * - Calculate win rate
 */

import { supabase } from './supabase';
import tierAccessService from './tierAccessService';

// ============================================================
// CONSTANTS
// ============================================================

// Default max age for historical zones (days)
const DEFAULT_MAX_AGE = 30;

// Default limit for zone queries
const DEFAULT_LIMIT = 20;

// Status groups for filtering
const STATUS_GROUPS = {
  FRESH: ['FRESH'],
  TESTED: ['TESTED_1X', 'TESTED_2X', 'TESTED_3X_PLUS'],
  BROKEN: ['BROKEN'],
  EXPIRED: ['EXPIRED'],
  ACTIVE: ['FRESH', 'TESTED_1X', 'TESTED_2X', 'TESTED_3X_PLUS'],
  ALL: ['FRESH', 'TESTED_1X', 'TESTED_2X', 'TESTED_3X_PLUS', 'BROKEN', 'EXPIRED'],
};

// ============================================================
// HISTORICAL ZONES SERVICE CLASS
// ============================================================

class HistoricalZonesService {
  constructor() {
    this.cache = new Map();
    this.cacheExpiry = 60000; // 1 minute
    this.lastCacheUpdate = null;
  }

  /**
   * Get historical zones with filters
   * @param {string} symbol - Trading pair (e.g., 'BTCUSDT')
   * @param {string} timeframe - Timeframe (e.g., '1h', '4h')
   * @param {string} userId - User ID
   * @param {Object} options - Filter options
   * @returns {Promise<Array>} Filtered zones
   */
  async getHistoricalZones(symbol, timeframe, userId, options = {}) {
    const {
      showFresh = true,
      showTested = true,
      showBroken = false,
      showExpired = false,
      maxAge = DEFAULT_MAX_AGE,
      limit = DEFAULT_LIMIT,
      zoneTypes = ['HFZ', 'LFZ'],
      minStrength = 0,
      sortBy = 'created_at',
      sortOrder = 'desc',
    } = options;

    try {
      // Check tier access for historical zones
      if (!tierAccessService.canViewHistoricalZones()) {
        console.log('[HistoricalZones] User tier does not allow historical zones');
        return [];
      }

      // Build status filter
      const statusFilter = [];
      if (showFresh) statusFilter.push(...STATUS_GROUPS.FRESH);
      if (showTested) statusFilter.push(...STATUS_GROUPS.TESTED);
      if (showBroken) statusFilter.push(...STATUS_GROUPS.BROKEN);
      if (showExpired) statusFilter.push(...STATUS_GROUPS.EXPIRED);

      if (statusFilter.length === 0) {
        return [];
      }

      // Calculate min date based on maxAge
      const minDate = new Date();
      minDate.setDate(minDate.getDate() - maxAge);

      // Build query
      let query = supabase
        .from('detected_zones')
        .select('*')
        .eq('user_id', userId)
        .eq('symbol', symbol)
        .eq('timeframe', timeframe)
        .eq('is_deleted', false)
        .in('status', statusFilter)
        .in('zone_type', zoneTypes)
        .gte('strength', minStrength)
        .gte('created_at', minDate.toISOString());

      // Apply sorting
      if (sortBy === 'strength') {
        query = query.order('strength', { ascending: sortOrder === 'asc' });
      } else if (sortBy === 'test_count') {
        query = query.order('test_count', { ascending: sortOrder === 'asc' });
      } else if (sortBy === 'zone_high') {
        query = query.order('zone_high', { ascending: sortOrder === 'asc' });
      } else {
        query = query.order('created_at', { ascending: sortOrder === 'asc' });
      }

      // Apply limit
      query = query.limit(limit);

      const { data, error } = await query;

      if (error) {
        console.error('[HistoricalZones] Query error:', error);
        return [];
      }

      // Apply tier limits
      const filteredData = tierAccessService.filterZonesByTier(data || []);

      console.log('[HistoricalZones] Found', filteredData.length, 'zones for', symbol, timeframe);

      return filteredData;
    } catch (error) {
      console.error('[HistoricalZones] getHistoricalZones error:', error);
      return [];
    }
  }

  /**
   * Get active zones only (not broken or expired)
   * @param {string} symbol - Trading pair
   * @param {string} timeframe - Timeframe
   * @param {string} userId - User ID
   * @param {Object} options - Additional options
   * @returns {Promise<Array>} Active zones
   */
  async getActiveZones(symbol, timeframe, userId, options = {}) {
    return this.getHistoricalZones(symbol, timeframe, userId, {
      ...options,
      showFresh: true,
      showTested: true,
      showBroken: false,
      showExpired: false,
    });
  }

  /**
   * Get zone statistics for a symbol/timeframe
   * @param {string} symbol - Trading pair
   * @param {string} timeframe - Timeframe
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Zone statistics
   */
  async getZoneStats(symbol, timeframe, userId) {
    try {
      // Get all zones including broken for stats
      const zones = await this.getHistoricalZones(symbol, timeframe, userId, {
        showFresh: true,
        showTested: true,
        showBroken: true,
        showExpired: false,
        maxAge: 90, // 90 days for stats
        limit: 500,
      });

      const stats = {
        total: zones.length,
        fresh: zones.filter(z => z.status === 'FRESH').length,
        tested: zones.filter(z => STATUS_GROUPS.TESTED.includes(z.status)).length,
        broken: zones.filter(z => z.status === 'BROKEN').length,
        hfz: zones.filter(z => z.zone_type === 'HFZ').length,
        lfz: zones.filter(z => z.zone_type === 'LFZ').length,
        avgStrength: this._calculateAvgStrength(zones),
        winRate: this._calculateWinRate(zones),
        avgTestCount: this._calculateAvgTestCount(zones),
      };

      return stats;
    } catch (error) {
      console.error('[HistoricalZones] getZoneStats error:', error);
      return {
        total: 0,
        fresh: 0,
        tested: 0,
        broken: 0,
        hfz: 0,
        lfz: 0,
        avgStrength: 0,
        winRate: 0,
        avgTestCount: 0,
      };
    }
  }

  /**
   * Get zones near current price
   * @param {string} symbol - Trading pair
   * @param {string} timeframe - Timeframe
   * @param {string} userId - User ID
   * @param {number} currentPrice - Current market price
   * @param {number} range - Price range percentage (default 5%)
   * @returns {Promise<Array>} Zones near current price
   */
  async getZonesNearPrice(symbol, timeframe, userId, currentPrice, range = 0.05) {
    try {
      const allZones = await this.getActiveZones(symbol, timeframe, userId, {
        limit: 100,
      });

      const minPrice = currentPrice * (1 - range);
      const maxPrice = currentPrice * (1 + range);

      // Filter zones that overlap with price range
      const nearbyZones = allZones.filter(zone => {
        const zoneHigh = zone.zone_high;
        const zoneLow = zone.zone_low;

        // Check if zone overlaps with price range
        return (zoneLow <= maxPrice && zoneHigh >= minPrice);
      });

      // Sort by proximity to current price
      nearbyZones.sort((a, b) => {
        const distA = Math.min(
          Math.abs(currentPrice - a.zone_high),
          Math.abs(currentPrice - a.zone_low)
        );
        const distB = Math.min(
          Math.abs(currentPrice - b.zone_high),
          Math.abs(currentPrice - b.zone_low)
        );
        return distA - distB;
      });

      return nearbyZones;
    } catch (error) {
      console.error('[HistoricalZones] getZonesNearPrice error:', error);
      return [];
    }
  }

  /**
   * Get zones by hierarchy rank
   * @param {string} symbol - Trading pair
   * @param {string} timeframe - Timeframe
   * @param {string} userId - User ID
   * @param {number} maxRank - Maximum hierarchy rank (1 = strongest)
   * @returns {Promise<Array>} Filtered zones
   */
  async getZonesByHierarchy(symbol, timeframe, userId, maxRank = 2) {
    try {
      const allZones = await this.getActiveZones(symbol, timeframe, userId, {
        limit: 50,
      });

      // Filter by hierarchy rank
      const filteredZones = allZones.filter(z => (z.hierarchy_rank || 4) <= maxRank);

      // Sort by hierarchy rank (ascending - best first)
      filteredZones.sort((a, b) => (a.hierarchy_rank || 4) - (b.hierarchy_rank || 4));

      return filteredZones;
    } catch (error) {
      console.error('[HistoricalZones] getZonesByHierarchy error:', error);
      return [];
    }
  }

  /**
   * Search zones by pattern type
   * @param {string} symbol - Trading pair
   * @param {string} timeframe - Timeframe
   * @param {string} userId - User ID
   * @param {string} patternType - Pattern type to search
   * @returns {Promise<Array>} Matching zones
   */
  async searchZonesByPattern(symbol, timeframe, userId, patternType) {
    try {
      const { data, error } = await supabase
        .from('detected_zones')
        .select('*')
        .eq('user_id', userId)
        .eq('symbol', symbol)
        .eq('timeframe', timeframe)
        .eq('is_deleted', false)
        .ilike('pattern_type', `%${patternType}%`)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('[HistoricalZones] searchZonesByPattern error:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('[HistoricalZones] searchZonesByPattern error:', error);
      return [];
    }
  }

  // ============================================================
  // PRIVATE HELPER METHODS
  // ============================================================

  /**
   * Calculate win rate from zones
   * Win = zones that were tested but not broken
   * @private
   */
  _calculateWinRate(zones) {
    const testedZones = zones.filter(z => (z.test_count || 0) > 0);

    if (testedZones.length === 0) return 0;

    const bouncedZones = testedZones.filter(z => z.status !== 'BROKEN');
    return Math.round((bouncedZones.length / testedZones.length) * 100);
  }

  /**
   * Calculate average strength
   * @private
   */
  _calculateAvgStrength(zones) {
    if (zones.length === 0) return 0;

    const totalStrength = zones.reduce((sum, z) => sum + (z.strength || 0), 0);
    return Math.round(totalStrength / zones.length);
  }

  /**
   * Calculate average test count
   * @private
   */
  _calculateAvgTestCount(zones) {
    if (zones.length === 0) return 0;

    const totalTests = zones.reduce((sum, z) => sum + (z.test_count || 0), 0);
    return Math.round((totalTests / zones.length) * 10) / 10;
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
    this.lastCacheUpdate = null;
  }
}

// Export singleton instance
export const historicalZonesService = new HistoricalZonesService();
export default historicalZonesService;
