/**
 * GEM Mobile - Zone Manager Service
 * Manages zone lifecycle: creation, tracking, testing, and deletion
 *
 * Zone Lifecycle: FRESH → TESTED_1X → TESTED_2X → TESTED_3X_PLUS → BROKEN → EXPIRED
 * Zone Types: HFZ (Supply/Resistance) | LFZ (Demand/Support)
 */

import { supabase } from './supabase';
import tierAccessService from './tierAccessService';

// ============================================================
// CONSTANTS
// ============================================================

/**
 * Zone status constants
 * FRESH: Never tested, highest strength
 * TESTED_1X: Tested once, still strong
 * TESTED_2X: Tested twice, getting weaker
 * TESTED_3X_PLUS: Tested 3+ times, weak
 * BROKEN: Price broke through zone
 * EXPIRED: Zone too old (30+ days)
 */
export const ZONE_STATUS = {
  FRESH: 'FRESH',
  TESTED_1X: 'TESTED_1X',
  TESTED_2X: 'TESTED_2X',
  TESTED_3X_PLUS: 'TESTED_3X_PLUS',
  BROKEN: 'BROKEN',
  EXPIRED: 'EXPIRED',
};

/**
 * Zone type constants
 * HFZ: High Frequency Zone (Supply/Resistance) - Price likely to drop
 * LFZ: Low Frequency Zone (Demand/Support) - Price likely to rise
 */
export const ZONE_TYPE = {
  HFZ: 'HFZ', // Supply/Resistance
  LFZ: 'LFZ', // Demand/Support
};

/**
 * Zone hierarchy ranking (lower = stronger)
 * Decision Point zones are strongest
 */
export const HIERARCHY_RANK = {
  DECISION_POINT: 1,
  FTR: 2,         // Failed To Return
  FLAG_LIMIT: 3,
  REGULAR: 4,
};

/**
 * Strength values by status
 */
export const STRENGTH_BY_STATUS = {
  FRESH: 100,
  TESTED_1X: 80,
  TESTED_2X: 60,
  TESTED_3X_PLUS: 40,
  BROKEN: 0,
  EXPIRED: 0,
};

/**
 * Zone colors by type (dark theme)
 */
export const ZONE_COLORS = {
  HFZ: {
    fill: 'rgba(255, 107, 107, 0.25)',    // Red with transparency
    border: '#FF6B6B',
    label: '#FF6B6B',
    labelBg: 'rgba(255, 107, 107, 0.9)',
  },
  LFZ: {
    fill: 'rgba(78, 205, 196, 0.25)',     // Teal with transparency
    border: '#4ECDC4',
    label: '#4ECDC4',
    labelBg: 'rgba(78, 205, 196, 0.9)',
  },
  BROKEN: {
    fill: 'rgba(108, 117, 125, 0.15)',    // Gray with low transparency
    border: '#6C757D',
    label: '#6C757D',
    labelBg: 'rgba(108, 117, 125, 0.9)',
  },
};

// Zone break buffer (0.5% beyond zone = broken)
const ZONE_BREAK_BUFFER = 0.005;

// Zone expiry in days
const ZONE_EXPIRY_DAYS = 30;

// ============================================================
// ZONE MANAGER CLASS
// ============================================================

class ZoneManager {
  constructor() {
    this.activeZonesCache = new Map();
    this.lastCacheUpdate = null;
    this.cacheExpiryMs = 60000; // 1 minute cache
  }

  // ============================================================
  // ZONE CREATION
  // ============================================================

  /**
   * Create zones from detected patterns
   * @param {Array} patterns - Array of detected patterns
   * @param {string} symbol - Trading pair (e.g., 'BTCUSDT')
   * @param {string} timeframe - Timeframe (e.g., '1h', '4h')
   * @param {string} userId - User ID
   * @returns {Promise<Array>} Created zones
   */
  async createZonesFromPatterns(patterns, symbol, timeframe, userId) {
    if (!patterns || patterns.length === 0) {
      console.log('[ZoneManager] No patterns to create zones from');
      return [];
    }

    // Get tier limits
    const maxZones = tierAccessService.getMaxZonesDisplayed();
    const canSaveToDb = tierAccessService.isZoneVisualizationEnabled();

    // Sort patterns by grade/confidence
    const sortedPatterns = [...patterns].sort((a, b) => {
      // Sort by grade first (A+ > A > B > C)
      const gradeOrder = { 'A+': 0, 'A': 1, 'B': 2, 'C': 3, 'D': 4 };
      const gradeA = gradeOrder[a.grade] ?? 5;
      const gradeB = gradeOrder[b.grade] ?? 5;
      if (gradeA !== gradeB) return gradeA - gradeB;

      // Then by confidence
      return (b.confidence || 0) - (a.confidence || 0);
    });

    // Limit patterns by tier
    const limitedPatterns = maxZones === -1
      ? sortedPatterns
      : sortedPatterns.slice(0, maxZones);

    const zones = [];

    for (const pattern of limitedPatterns) {
      try {
        const zone = this._patternToZone(pattern, symbol, timeframe, userId);

        if (!zone) {
          console.log(`[ZoneManager] ❌ Zone creation failed for ${pattern.patternType || pattern.name}`);
          continue;
        }

        if (!this._isValidZone(zone)) {
          console.log(`[ZoneManager] ❌ Zone validation failed for ${pattern.patternType || pattern.name}:`, {
            zone_high: zone.zone_high,
            zone_low: zone.zone_low,
            thickness: ((zone.zone_high - zone.zone_low) / zone.zone_low * 100).toFixed(2) + '%',
          });
          continue;
        }

        // Zone is valid - add it
        if (canSaveToDb && userId) {
          // Save to database
          const savedZone = await this._saveZoneToDb(zone);
          if (savedZone) {
            // ⚠️ CRITICAL: Merge pattern_id and metadata back - DB doesn't store these
            zones.push({
              ...savedZone,
              pattern_id: zone.pattern_id,
              metadata: zone.metadata,
            });
          }
        } else {
          // Just return in-memory zone
          zones.push({ ...zone, id: `temp_${Date.now()}_${zones.length}` });
        }
        console.log(`[ZoneManager] ✅ Zone created for ${pattern.patternType || pattern.name}`);
      } catch (error) {
        console.error('[ZoneManager] Error creating zone from pattern:', error);
      }
    }

    // Update cache
    this._updateCache(symbol, timeframe, userId, zones);

    console.log(`[ZoneManager] Created ${zones.length} zones for ${symbol} ${timeframe}`);

    // 🔴 DEBUG: Log start_time/end_time for ALL created zones
    zones.forEach((z, i) => {
      console.log(`[ZoneManager] 🔴 ZONE[${i}] ${z.pattern_type}:`, {
        start_time: z.start_time,
        end_time: z.end_time,
        start_candle_index: z.start_candle_index,
        zone_high: z.zone_high,
        zone_low: z.zone_low,
      });
    });

    return zones;
  }

  /**
   * Convert pattern to zone object
   * @private
   */
  _patternToZone(pattern, symbol, timeframe, userId) {
    // ⚠️ Use pattern's own symbol and timeframe when available (for multi-coin scans)
    const actualSymbol = pattern.symbol || symbol;
    const actualTimeframe = pattern.timeframe || timeframe;

    // Determine zone type based on pattern direction
    const direction = pattern.direction || pattern.signalType;
    const isLong = direction === 'LONG';
    const zoneType = isLong ? ZONE_TYPE.LFZ : ZONE_TYPE.HFZ;

    // Get entry and stopLoss values
    const entry = parseFloat(pattern.entry || pattern.entryPrice || pattern.price || 0);
    const stopLoss = parseFloat(pattern.stopLoss || pattern.stop_loss || 0);

    // 🔴 DEBUG: Log pattern info for troubleshooting
    console.log(`[ZoneManager] _patternToZone: ${pattern.patternType || pattern.name}`, {
      entry,
      stopLoss,
      direction,
      isLong,
      zoneType,
      pattern_id: pattern.pattern_id,
    });

    // ⚠️ FIX: Calculate zone boundaries based on DIRECTION
    // LONG: SL below entry → zoneLow = SL, zoneHigh = entry
    // SHORT: SL above entry → zoneLow = entry, zoneHigh = SL
    let zoneHigh, zoneLow;
    if (pattern.zoneHigh && pattern.zoneLow) {
      // Use explicit zone bounds if provided
      zoneHigh = parseFloat(pattern.zoneHigh);
      zoneLow = parseFloat(pattern.zoneLow);
    } else if (isLong) {
      // LONG: entry is top of zone, SL is bottom
      zoneHigh = entry;
      zoneLow = stopLoss > 0 ? stopLoss : entry * 0.98;
    } else {
      // SHORT: SL is top of zone (above entry), entry is bottom
      zoneHigh = stopLoss > 0 ? stopLoss : entry * 1.02;
      zoneLow = entry;
    }

    // Ensure zoneHigh > zoneLow
    if (zoneHigh <= zoneLow) {
      // Swap if needed
      [zoneHigh, zoneLow] = [Math.max(zoneHigh, zoneLow), Math.min(zoneHigh, zoneLow)];
    }

    if (!zoneHigh || !zoneLow || zoneHigh <= zoneLow) {
      console.warn('[ZoneManager] Invalid zone boundaries:', { zoneHigh, zoneLow, direction });
      return null;
    }

    // Calculate entry and stop prices
    const entryPrice = pattern.entry || (zoneType === ZONE_TYPE.LFZ ? zoneLow : zoneHigh);
    const stopPrice = pattern.stopLoss || (zoneType === ZONE_TYPE.LFZ ? zoneLow * 0.98 : zoneHigh * 1.02);

    // Calculate target prices (1:2 and 1:3 R:R)
    const riskAmount = Math.abs(entryPrice - stopPrice);
    const target1 = zoneType === ZONE_TYPE.LFZ
      ? entryPrice + (riskAmount * 2)
      : entryPrice - (riskAmount * 2);
    const target2 = zoneType === ZONE_TYPE.LFZ
      ? entryPrice + (riskAmount * 3)
      : entryPrice - (riskAmount * 3);

    // ⚠️ CRITICAL: Extract time and candle index data for zone width calculation
    // Don't fallback to Date.now() - if no time data, let chart handle positioning
    const startTime = pattern.startTime || pattern.formationTime || null;
    const endTime = pattern.endTime || null;
    const startCandleIndex = pattern.startCandleIndex ?? null;
    const endCandleIndex = pattern.endCandleIndex ?? null;

    // Debug: Log what time data we received from pattern
    console.log(`[ZoneManager] Pattern ${pattern.patternType || pattern.name}:`, {
      'pattern.startTime': pattern.startTime,
      'pattern.endTime': pattern.endTime,
      'pattern.startCandleIndex': pattern.startCandleIndex,
      'pattern.endCandleIndex': pattern.endCandleIndex,
      'pattern.points': pattern.points ? Object.keys(pattern.points) : 'NO POINTS',
      'extracted startTime': startTime,
      'extracted endTime': endTime,
    });

    return {
      user_id: userId,
      symbol: actualSymbol,
      timeframe: actualTimeframe,
      zone_type: zoneType,
      zone_high: zoneHigh,
      zone_low: zoneLow,
      entry_price: entryPrice,
      stop_price: stopPrice,
      target_1: target1,
      target_2: target2,
      // ⚠️ CRITICAL: Zone time and candle index fields
      start_time: startTime,
      end_time: endTime,
      start_candle_index: startCandleIndex,
      end_candle_index: endCandleIndex,
      // ⚠️ FIX: Use actual pattern name, not category
      // Priority: patternType > name > type > pattern_type
      pattern_type: pattern.patternType || pattern.name || pattern.type || pattern.pattern_type || 'UNKNOWN',
      // Store original pattern name for tooltip display
      pattern_name: pattern.patternType || pattern.name || pattern.type || 'Unknown Pattern',
      pattern_grade: pattern.grade || 'C',
      pattern_confidence: pattern.confidence || pattern.oddsScore || 50,
      status: ZONE_STATUS.FRESH,
      strength: STRENGTH_BY_STATUS.FRESH,
      test_count: 0,
      hierarchy_rank: this._getHierarchyRank(pattern),
      formation_candle_time: pattern.formationTime || new Date().toISOString(),
      odds_score: pattern.oddsScore || pattern.confidence || 50,
      // ⚠️ ZONE-PATTERN SYNC: Store pattern ID for 2-way linking
      pattern_id: pattern.pattern_id || null,
      metadata: {
        patternData: pattern,
        createdAt: new Date().toISOString(),
      },
    };
  }

  /**
   * Validate zone boundaries
   * @private
   */
  _isValidZone(zone) {
    // Zone high <= low
    if (zone.zone_high <= zone.zone_low) {
      console.warn('[ZoneManager] Zone high <= low');
      return false;
    }

    // Zone too thin (<0.05%) - very lenient
    const thickness = (zone.zone_high - zone.zone_low) / zone.zone_low;
    if (thickness < 0.0005) {
      console.warn('[ZoneManager] Zone too thin:', thickness, zone.pattern_type);
      return false;
    }

    // Zone too thick (>50%) - lenient for crypto volatility
    // QM zones span QML→MPL, Rounding Bottom spans bottom→entry
    // In crypto, these can easily reach 30-40% on volatile altcoins
    if (thickness > 0.50) {
      console.warn('[ZoneManager] Zone too thick:', thickness, zone.pattern_type);
      return false;
    }

    return true;
  }

  /**
   * Get hierarchy rank from pattern
   * @private
   */
  _getHierarchyRank(pattern) {
    const patternType = (pattern.name || pattern.type || '').toUpperCase();

    if (patternType.includes('DECISION') || patternType.includes('DP')) {
      return HIERARCHY_RANK.DECISION_POINT;
    }
    if (patternType.includes('FTR') || patternType.includes('FAILED')) {
      return HIERARCHY_RANK.FTR;
    }
    if (patternType.includes('FLAG') || patternType.includes('LIMIT')) {
      return HIERARCHY_RANK.FLAG_LIMIT;
    }
    return HIERARCHY_RANK.REGULAR;
  }

  /**
   * Save zone to database
   * @private
   */
  async _saveZoneToDb(zone) {
    try {
      // Debug: Log what we're saving
      console.log(`[ZoneManager] Saving zone to DB: start_time=${zone.start_time}, end_time=${zone.end_time}`);

      const { data, error } = await supabase
        .from('detected_zones')
        .insert({
          user_id: zone.user_id,
          symbol: zone.symbol,
          timeframe: zone.timeframe,
          zone_type: zone.zone_type,
          zone_high: zone.zone_high,
          zone_low: zone.zone_low,
          entry_price: zone.entry_price,
          stop_price: zone.stop_price,
          // ⚠️ CRITICAL: Zone time bounds - keep null if not available, don't fallback to Date.now()
          start_time: zone.start_time || null,
          end_time: zone.end_time || null,
          start_candle_index: zone.start_candle_index ?? null,
          // end_candle_index not in current schema - use end_time instead
          targets: JSON.stringify([zone.target_1, zone.target_2].filter(Boolean)),
          pattern_type: zone.pattern_type,
          pattern_grade: zone.pattern_grade,
          pattern_confidence: zone.pattern_confidence || zone.odds_score || 50,
          status: zone.status,
          strength: zone.strength,
          test_count: zone.test_count,
          hierarchy_rank: zone.hierarchy_rank,
          odds_score: zone.odds_score,
        })
        .select()
        .single();

      if (error) {
        console.error('[ZoneManager] Error saving zone:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('[ZoneManager] Database error:', error);
      return null;
    }
  }

  // ============================================================
  // ZONE RETRIEVAL
  // ============================================================

  /**
   * Get active (non-broken) zones for display
   * @param {string} symbol - Trading pair
   * @param {string} timeframe - Timeframe
   * @param {string} userId - User ID
   * @returns {Promise<Array>} Active zones
   */
  async getActiveZones(symbol, timeframe, userId) {
    try {
      // Check cache first
      const cacheKey = `${symbol}_${timeframe}_${userId}`;
      const cached = this.activeZonesCache.get(cacheKey);
      if (cached && (Date.now() - this.lastCacheUpdate) < this.cacheExpiryMs) {
        return cached;
      }

      const { data, error } = await supabase
        .from('detected_zones')
        .select('*')
        .eq('user_id', userId)
        .eq('symbol', symbol)
        .eq('timeframe', timeframe)
        .not('status', 'in', `(${ZONE_STATUS.BROKEN},${ZONE_STATUS.EXPIRED})`)
        .order('hierarchy_rank', { ascending: true })
        .order('strength', { ascending: false });

      if (error) {
        console.error('[ZoneManager] Error fetching zones:', error);
        return [];
      }

      // Apply tier limits
      const zones = tierAccessService.filterZonesByTier(data || []);

      // Update cache
      this._updateCache(symbol, timeframe, userId, zones);

      return zones;
    } catch (error) {
      console.error('[ZoneManager] Error in getActiveZones:', error);
      return [];
    }
  }

  /**
   * Get zones for chart display with options
   * @param {string} symbol - Trading pair
   * @param {string} timeframe - Timeframe
   * @param {string} userId - User ID
   * @param {Object} options - Display options
   * @returns {Promise<Array>} Zones for chart
   */
  async getZonesForChart(symbol, timeframe, userId, options = {}) {
    const {
      includeHistorical = false,
      includeBroken = false,
      zoneTypes = [ZONE_TYPE.HFZ, ZONE_TYPE.LFZ],
      minStrength = 0,
    } = options;

    try {
      let query = supabase
        .from('detected_zones')
        .select('*')
        .eq('user_id', userId)
        .eq('symbol', symbol)
        .eq('timeframe', timeframe)
        .in('zone_type', zoneTypes)
        .gte('strength', minStrength);

      // Filter by status
      if (!includeBroken) {
        query = query.not('status', 'eq', ZONE_STATUS.BROKEN);
      }
      if (!includeHistorical) {
        query = query.not('status', 'eq', ZONE_STATUS.EXPIRED);
      }

      // Check tier access for historical zones
      if (includeHistorical && !tierAccessService.canViewHistoricalZones()) {
        query = query.not('status', 'eq', ZONE_STATUS.EXPIRED);
      }

      const { data, error } = await query
        .order('zone_high', { ascending: false });

      if (error) {
        console.error('[ZoneManager] Error fetching zones for chart:', error);
        return [];
      }

      // Apply tier limits
      return tierAccessService.filterZonesByTier(data || []);
    } catch (error) {
      console.error('[ZoneManager] Error in getZonesForChart:', error);
      return [];
    }
  }

  // ============================================================
  // ZONE TESTING & LIFECYCLE
  // ============================================================

  /**
   * Check if price is inside a zone
   * @param {Object} zone - Zone object
   * @param {number} price - Current price
   * @returns {boolean}
   */
  isPriceInZone(zone, price) {
    return price >= zone.zone_low && price <= zone.zone_high;
  }

  /**
   * Check if zone is broken by price
   * @param {Object} zone - Zone object
   * @param {number} closePrice - Candle close price
   * @returns {boolean}
   */
  isZoneBroken(zone, closePrice) {
    const buffer = zone.zone_type === ZONE_TYPE.HFZ
      ? zone.zone_high * (1 + ZONE_BREAK_BUFFER)
      : zone.zone_low * (1 - ZONE_BREAK_BUFFER);

    if (zone.zone_type === ZONE_TYPE.HFZ) {
      // HFZ breaks when price closes above zone + buffer
      return closePrice > buffer;
    } else {
      // LFZ breaks when price closes below zone - buffer
      return closePrice < buffer;
    }
  }

  /**
   * Record a zone test event
   * @param {string} zoneId - Zone ID
   * @param {number} testPrice - Price that tested zone
   * @param {string} result - Test result (BOUNCE/PENETRATE/BREAK)
   * @param {string} candlePattern - Optional candle pattern at test
   * @returns {Promise<Object>} Updated zone
   */
  async recordZoneTest(zoneId, testPrice, result, candlePattern = null) {
    try {
      // Calculate penetration percentage
      const { data: zone } = await supabase
        .from('detected_zones')
        .select('*')
        .eq('id', zoneId)
        .single();

      if (!zone) {
        console.error('[ZoneManager] Zone not found:', zoneId);
        return null;
      }

      const zoneRange = zone.zone_high - zone.zone_low;
      let penetrationPct = 0;

      if (zone.zone_type === ZONE_TYPE.HFZ) {
        penetrationPct = Math.max(0, (testPrice - zone.zone_low) / zoneRange * 100);
      } else {
        penetrationPct = Math.max(0, (zone.zone_high - testPrice) / zoneRange * 100);
      }

      // Insert test history
      const { error: historyError } = await supabase
        .from('zone_test_history')
        .insert({
          zone_id: zoneId,
          test_price: testPrice,
          test_result: result,
          candle_pattern: candlePattern,
          penetration_percentage: penetrationPct,
        });

      if (historyError) {
        console.error('[ZoneManager] Error recording test history:', historyError);
      }

      // Update zone status
      const newTestCount = zone.test_count + 1;
      let newStatus = zone.status;
      let newStrength = zone.strength;

      if (result === 'BREAK') {
        newStatus = ZONE_STATUS.BROKEN;
        newStrength = 0;
      } else {
        // Update status based on test count
        if (newTestCount === 1) {
          newStatus = ZONE_STATUS.TESTED_1X;
          newStrength = STRENGTH_BY_STATUS.TESTED_1X;
        } else if (newTestCount === 2) {
          newStatus = ZONE_STATUS.TESTED_2X;
          newStrength = STRENGTH_BY_STATUS.TESTED_2X;
        } else {
          newStatus = ZONE_STATUS.TESTED_3X_PLUS;
          newStrength = STRENGTH_BY_STATUS.TESTED_3X_PLUS;
        }
      }

      // Update zone in database
      const { data: updatedZone, error: updateError } = await supabase
        .from('detected_zones')
        .update({
          test_count: newTestCount,
          status: newStatus,
          strength: newStrength,
          last_test_time: new Date().toISOString(),
          last_test_price: testPrice,
        })
        .eq('id', zoneId)
        .select()
        .single();

      if (updateError) {
        console.error('[ZoneManager] Error updating zone:', updateError);
        return null;
      }

      // Invalidate cache
      this._invalidateCache(zone.symbol, zone.timeframe, zone.user_id);

      return updatedZone;
    } catch (error) {
      console.error('[ZoneManager] Error in recordZoneTest:', error);
      return null;
    }
  }

  /**
   * Mark zone as broken
   * @param {string} zoneId - Zone ID
   * @returns {Promise<Object>} Updated zone
   */
  async markZoneBroken(zoneId) {
    try {
      const { data, error } = await supabase
        .from('detected_zones')
        .update({
          status: ZONE_STATUS.BROKEN,
          strength: 0,
          broken_at: new Date().toISOString(),
        })
        .eq('id', zoneId)
        .select()
        .single();

      if (error) {
        console.error('[ZoneManager] Error marking zone broken:', error);
        return null;
      }

      // Invalidate cache
      if (data) {
        this._invalidateCache(data.symbol, data.timeframe, data.user_id);
      }

      return data;
    } catch (error) {
      console.error('[ZoneManager] Error in markZoneBroken:', error);
      return null;
    }
  }

  // ============================================================
  // ZONE DELETION
  // ============================================================

  /**
   * Delete a zone (soft delete)
   * @param {string} zoneId - Zone ID
   * @returns {Promise<boolean>} Success
   */
  async deleteZone(zoneId) {
    try {
      const { error } = await supabase
        .from('detected_zones')
        .update({
          is_deleted: true,
          deleted_at: new Date().toISOString(),
        })
        .eq('id', zoneId);

      if (error) {
        console.error('[ZoneManager] Error deleting zone:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('[ZoneManager] Error in deleteZone:', error);
      return false;
    }
  }

  /**
   * Clear all zones for a symbol/timeframe
   * @param {string} symbol - Trading pair
   * @param {string} timeframe - Timeframe
   * @param {string} userId - User ID
   * @returns {Promise<boolean>} Success
   */
  async clearZones(symbol, timeframe, userId) {
    try {
      const { error } = await supabase
        .from('detected_zones')
        .update({
          is_deleted: true,
          deleted_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .eq('symbol', symbol)
        .eq('timeframe', timeframe);

      if (error) {
        console.error('[ZoneManager] Error clearing zones:', error);
        return false;
      }

      // Invalidate cache
      this._invalidateCache(symbol, timeframe, userId);

      return true;
    } catch (error) {
      console.error('[ZoneManager] Error in clearZones:', error);
      return false;
    }
  }

  // ============================================================
  // ZONE DISPLAY HELPERS
  // ============================================================

  /**
   * Get zone colors based on type and preferences
   * @param {Object} zone - Zone object
   * @param {Object} preferences - User preferences (optional)
   * @returns {Object} Colors object
   */
  getZoneColor(zone, preferences = null) {
    if (zone.status === ZONE_STATUS.BROKEN) {
      return ZONE_COLORS.BROKEN;
    }

    const defaultColors = ZONE_COLORS[zone.zone_type] || ZONE_COLORS.HFZ;

    // Apply custom colors if user has tier access and preferences
    if (preferences && tierAccessService.canCustomizeZones()) {
      return {
        fill: preferences.hfzFillColor && zone.zone_type === ZONE_TYPE.HFZ
          ? preferences.hfzFillColor
          : preferences.lfzFillColor && zone.zone_type === ZONE_TYPE.LFZ
            ? preferences.lfzFillColor
            : defaultColors.fill,
        border: preferences.hfzBorderColor && zone.zone_type === ZONE_TYPE.HFZ
          ? preferences.hfzBorderColor
          : preferences.lfzBorderColor && zone.zone_type === ZONE_TYPE.LFZ
            ? preferences.lfzBorderColor
            : defaultColors.border,
        label: defaultColors.label,
        labelBg: defaultColors.labelBg,
      };
    }

    return defaultColors;
  }

  /**
   * Get zone strength stars (1-5)
   * @param {Object} zone - Zone object
   * @returns {number} Number of stars
   */
  getZoneStrengthStars(zone) {
    const strength = zone.strength || 0;

    if (strength >= 100) return 5;
    if (strength >= 80) return 4;
    if (strength >= 60) return 3;
    if (strength >= 40) return 2;
    if (strength > 0) return 1;
    return 0;
  }

  /**
   * Get zone label text
   * @param {Object} zone - Zone object
   * @returns {string} Label text (e.g., "Buy 80%" or "Sell 100%")
   */
  getZoneLabel(zone) {
    if (zone.status === ZONE_STATUS.BROKEN) {
      return 'Broken';
    }

    const action = zone.zone_type === ZONE_TYPE.LFZ ? 'Buy' : 'Sell';
    const strength = zone.strength || 0;

    return `${action} ${strength}%`;
  }

  /**
   * Get zone status display text
   * @param {Object} zone - Zone object
   * @returns {Object} Status display info
   */
  getZoneStatusDisplay(zone) {
    const statusInfo = {
      [ZONE_STATUS.FRESH]: { text: 'Fresh', color: '#4ECDC4', icon: 'Sparkles' },
      [ZONE_STATUS.TESTED_1X]: { text: 'Tested 1x', color: '#FFC107', icon: 'AlertCircle' },
      [ZONE_STATUS.TESTED_2X]: { text: 'Tested 2x', color: '#FF9800', icon: 'AlertTriangle' },
      [ZONE_STATUS.TESTED_3X_PLUS]: { text: 'Tested 3x+', color: '#FF5722', icon: 'AlertOctagon' },
      [ZONE_STATUS.BROKEN]: { text: 'Broken', color: '#6C757D', icon: 'XCircle' },
      [ZONE_STATUS.EXPIRED]: { text: 'Expired', color: '#6C757D', icon: 'Clock' },
    };

    return statusInfo[zone.status] || statusInfo[ZONE_STATUS.FRESH];
  }

  // ============================================================
  // CACHE MANAGEMENT
  // ============================================================

  /**
   * Update zones cache
   * @private
   */
  _updateCache(symbol, timeframe, userId, zones) {
    const cacheKey = `${symbol}_${timeframe}_${userId}`;
    this.activeZonesCache.set(cacheKey, zones);
    this.lastCacheUpdate = Date.now();
  }

  /**
   * Invalidate cache for symbol/timeframe
   * @private
   */
  _invalidateCache(symbol, timeframe, userId) {
    const cacheKey = `${symbol}_${timeframe}_${userId}`;
    this.activeZonesCache.delete(cacheKey);
  }

  /**
   * Clear all caches
   */
  clearAllCaches() {
    this.activeZonesCache.clear();
    this.lastCacheUpdate = null;
  }
}

// Export singleton instance
export const zoneManager = new ZoneManager();
export default zoneManager;
