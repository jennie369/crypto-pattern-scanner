/**
 * GEM Mobile - Freshness Tracker Service
 * Track zone tests and order absorption
 *
 * Phase 1C: Odds Enhancers + Freshness Tracking
 *
 * Concept: Each time price returns to a zone, ~30-40% of pending orders get filled
 * - FTB (First Time Back): 100% orders available - BEST
 * - 1st Test: ~60-70% orders left
 * - 2nd Test: ~36-49% orders left
 * - 3rd+ Test: <30% orders left - STALE
 */

import { supabase } from './supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ═══════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════

const FRESHNESS_STATUS = {
  FRESH: 'fresh',      // 0 tests (FTB)
  TESTED: 'tested',    // 1-2 tests
  STALE: 'stale',      // 3+ tests
};

const ORDER_ABSORPTION_RATE = 0.35; // 35% orders absorbed per test

const ZONE_CACHE_KEY = '@gem_zone_history_cache';

// ═══════════════════════════════════════════════════════════
// ZONE CREATION & TRACKING
// ═══════════════════════════════════════════════════════════

/**
 * Register a new zone for tracking
 * @param {string} userId - User ID
 * @param {Object} zoneData - Zone information
 * @returns {Object} Created zone history record
 */
export const registerZone = async (userId, zoneData) => {
  try {
    const {
      symbol,
      timeframe,
      zoneType,
      pattern,
      patternCategory,
      entryPrice,
      stopPrice,
      zoneWidth,
      zoneHierarchy,
      confluenceDetails,
    } = zoneData;

    // Check for existing zone at same level
    const existingZone = await findMatchingZone(userId, symbol, timeframe, entryPrice, stopPrice);
    if (existingZone) {
      console.log('[FreshnessTracker] Zone already exists:', existingZone.id);
      return existingZone;
    }

    const { data, error } = await supabase
      .from('zone_history')
      .insert({
        user_id: userId,
        symbol,
        timeframe,
        zone_type: zoneType,
        pattern,
        pattern_category: patternCategory || 'basic',
        entry_price: entryPrice,
        stop_price: stopPrice,
        zone_width: zoneWidth,
        zone_hierarchy_level: zoneHierarchy || 4,
        confluence_count: confluenceDetails?.length || 0,
        confluence_details: confluenceDetails,
        test_count: 0,
      })
      .select()
      .single();

    if (error) throw error;

    // Update local cache
    await updateLocalCache(data);

    console.log('[FreshnessTracker] Zone registered:', data.id);
    return data;
  } catch (error) {
    console.error('[FreshnessTracker] Error registering zone:', error);
    return null;
  }
};

/**
 * Find matching zone (within tolerance)
 */
const findMatchingZone = async (userId, symbol, timeframe, entryPrice, stopPrice) => {
  try {
    const tolerance = Math.abs(entryPrice - stopPrice) * 0.1; // 10% of zone width

    const { data, error } = await supabase
      .from('zone_history')
      .select('*')
      .eq('user_id', userId)
      .eq('symbol', symbol)
      .eq('timeframe', timeframe)
      .eq('is_broken', false)
      .gte('entry_price', entryPrice - tolerance)
      .lte('entry_price', entryPrice + tolerance);

    if (error) throw error;
    return data?.[0] || null;
  } catch (error) {
    console.error('[FreshnessTracker] Error finding zone:', error);
    return null;
  }
};

// ═══════════════════════════════════════════════════════════
// ZONE TESTING
// ═══════════════════════════════════════════════════════════

/**
 * Record a zone test (price touched zone)
 * @param {string} zoneId - Zone history ID
 * @returns {Object} Updated zone with new test count
 */
export const recordZoneTest = async (zoneId) => {
  try {
    // Get current zone
    const { data: zone, error: fetchError } = await supabase
      .from('zone_history')
      .select('*')
      .eq('id', zoneId)
      .single();

    if (fetchError) throw fetchError;

    const newTestCount = (zone.test_count || 0) + 1;
    const now = new Date().toISOString();

    // Update zone
    const { data, error } = await supabase
      .from('zone_history')
      .update({
        test_count: newTestCount,
        first_test_at: zone.first_test_at || now,
        last_test_at: now,
        updated_at: now,
      })
      .eq('id', zoneId)
      .select()
      .single();

    if (error) throw error;

    // Update local cache
    await updateLocalCache(data);

    console.log(`[FreshnessTracker] Zone tested. Count: ${newTestCount}`);
    return data;
  } catch (error) {
    console.error('[FreshnessTracker] Error recording test:', error);
    return null;
  }
};

/**
 * Mark zone as broken
 * @param {string} zoneId - Zone history ID
 * @param {number} breakPrice - Price at which zone broke
 */
export const markZoneBroken = async (zoneId, breakPrice) => {
  try {
    const { data, error } = await supabase
      .from('zone_history')
      .update({
        is_broken: true,
        broken_at: new Date().toISOString(),
        broken_price: breakPrice,
        updated_at: new Date().toISOString(),
      })
      .eq('id', zoneId)
      .select()
      .single();

    if (error) throw error;

    // Update local cache
    await updateLocalCache(data);

    console.log('[FreshnessTracker] Zone marked broken:', zoneId);
    return data;
  } catch (error) {
    console.error('[FreshnessTracker] Error marking zone broken:', error);
    return null;
  }
};

// ═══════════════════════════════════════════════════════════
// FRESHNESS CALCULATIONS
// ═══════════════════════════════════════════════════════════

/**
 * Get freshness status from test count
 * @param {number} testCount - Number of tests
 * @returns {string} Freshness status
 */
export const getFreshnessStatus = (testCount) => {
  const count = testCount || 0;
  if (count === 0) return FRESHNESS_STATUS.FRESH;
  if (count <= 2) return FRESHNESS_STATUS.TESTED;
  return FRESHNESS_STATUS.STALE;
};

/**
 * Calculate remaining order percentage
 * Uses compound absorption rate
 * @param {number} testCount - Number of tests
 * @returns {number} Percentage of orders remaining (0-100)
 */
export const getRemainingOrdersPercent = (testCount) => {
  const count = testCount || 0;
  if (count === 0) return 100;

  // Compound: remaining = (1 - absorption_rate) ^ tests
  const remaining = Math.pow(1 - ORDER_ABSORPTION_RATE, count);
  return Math.round(remaining * 100);
};

/**
 * Get freshness score for odds enhancers (0-2)
 * @param {number} testCount - Number of tests
 * @returns {number} Freshness score
 */
export const getFreshnessScore = (testCount) => {
  const count = testCount || 0;
  if (count === 0) return 2; // Fresh/FTB
  if (count <= 2) return 1;  // Tested
  return 0;                   // Stale
};

/**
 * Check if zone is FTB (First Time Back)
 * @param {number} testCount - Number of tests
 * @returns {boolean}
 */
export const isFTB = (testCount) => {
  return (testCount || 0) === 0;
};

/**
 * Get freshness display info
 * @param {number} testCount - Number of tests
 * @returns {Object} Display info with status, color, icon, label
 */
export const getFreshnessDisplayInfo = (testCount) => {
  const status = getFreshnessStatus(testCount);
  const remaining = getRemainingOrdersPercent(testCount);
  const count = testCount || 0;

  const statusConfig = {
    [FRESHNESS_STATUS.FRESH]: {
      color: '#22C55E',
      icon: 'sparkles',
      label: 'Fresh (FTB)',
      labelVi: 'Tươi Mới',
      description: 'Chưa test - 100% orders',
    },
    [FRESHNESS_STATUS.TESTED]: {
      color: '#FFBD59',
      icon: 'refresh-cw',
      label: `Tested (${count}x)`,
      labelVi: `Đã Test (${count}x)`,
      description: `${remaining}% orders còn lại`,
    },
    [FRESHNESS_STATUS.STALE]: {
      color: '#EF4444',
      icon: 'alert-circle',
      label: `Stale (${count}x)`,
      labelVi: `Cũ (${count}x)`,
      description: `<${remaining}% orders - nên skip`,
    },
  };

  return {
    ...statusConfig[status],
    status,
    testCount: count,
    remainingPercent: remaining,
    isFTB: count === 0,
  };
};

// ═══════════════════════════════════════════════════════════
// ZONE QUERIES
// ═══════════════════════════════════════════════════════════

/**
 * Get active zones for a symbol
 * @param {string} userId - User ID
 * @param {string} symbol - Trading pair
 * @param {string} timeframe - Optional timeframe filter
 * @returns {Array} Active zones
 */
export const getActiveZones = async (userId, symbol, timeframe = null) => {
  try {
    let query = supabase
      .from('zone_history')
      .select('*')
      .eq('user_id', userId)
      .eq('symbol', symbol)
      .eq('is_broken', false)
      .order('created_at', { ascending: false });

    if (timeframe) {
      query = query.eq('timeframe', timeframe);
    }

    const { data, error } = await query;
    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('[FreshnessTracker] Error fetching zones:', error);
    return [];
  }
};

/**
 * Get fresh zones only (FTB)
 * @param {string} userId - User ID
 * @param {string} symbol - Trading pair
 * @returns {Array} Fresh zones
 */
export const getFreshZones = async (userId, symbol) => {
  try {
    const { data, error } = await supabase
      .from('zone_history')
      .select('*')
      .eq('user_id', userId)
      .eq('symbol', symbol)
      .eq('is_broken', false)
      .eq('test_count', 0)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('[FreshnessTracker] Error fetching fresh zones:', error);
    return [];
  }
};

/**
 * Get zone statistics for a user
 * @param {string} userId - User ID
 * @returns {Object} Zone statistics
 */
export const getZoneStatistics = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('zone_history')
      .select('test_count, is_broken, zone_type')
      .eq('user_id', userId);

    if (error) throw error;
    if (!data || data.length === 0) {
      return {
        totalZones: 0,
        activeZones: 0,
        freshZones: 0,
        testedZones: 0,
        staleZones: 0,
        brokenZones: 0,
      };
    }

    let stats = {
      totalZones: data.length,
      activeZones: 0,
      freshZones: 0,
      testedZones: 0,
      staleZones: 0,
      brokenZones: 0,
      hfzCount: 0,
      lfzCount: 0,
    };

    data.forEach((zone) => {
      if (zone.is_broken) {
        stats.brokenZones++;
      } else {
        stats.activeZones++;
        const status = getFreshnessStatus(zone.test_count);
        if (status === FRESHNESS_STATUS.FRESH) stats.freshZones++;
        else if (status === FRESHNESS_STATUS.TESTED) stats.testedZones++;
        else stats.staleZones++;
      }

      if (zone.zone_type === 'HFZ') stats.hfzCount++;
      else if (zone.zone_type === 'LFZ') stats.lfzCount++;
    });

    return stats;
  } catch (error) {
    console.error('[FreshnessTracker] Error fetching statistics:', error);
    return null;
  }
};

// ═══════════════════════════════════════════════════════════
// LOCAL CACHE (for offline support)
// ═══════════════════════════════════════════════════════════

/**
 * Update local cache with zone data
 */
const updateLocalCache = async (zone) => {
  try {
    const cacheStr = await AsyncStorage.getItem(ZONE_CACHE_KEY);
    const cache = cacheStr ? JSON.parse(cacheStr) : {};

    cache[zone.id] = zone;

    await AsyncStorage.setItem(ZONE_CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.error('[FreshnessTracker] Cache update error:', error);
  }
};

/**
 * Get zone from local cache
 * @param {string} zoneId - Zone ID
 * @returns {Object|null} Cached zone
 */
export const getZoneFromCache = async (zoneId) => {
  try {
    const cacheStr = await AsyncStorage.getItem(ZONE_CACHE_KEY);
    if (!cacheStr) return null;

    const cache = JSON.parse(cacheStr);
    return cache[zoneId] || null;
  } catch (error) {
    console.error('[FreshnessTracker] Cache read error:', error);
    return null;
  }
};

/**
 * Clear zone cache
 */
export const clearZoneCache = async () => {
  try {
    await AsyncStorage.removeItem(ZONE_CACHE_KEY);
    console.log('[FreshnessTracker] Cache cleared');
  } catch (error) {
    console.error('[FreshnessTracker] Cache clear error:', error);
  }
};

// ═══════════════════════════════════════════════════════════
// HTF ZONE LINKING
// ═══════════════════════════════════════════════════════════

/**
 * Link LTF zone to HTF parent zone
 * @param {string} ltfZoneId - LTF zone ID
 * @param {string} htfZoneId - HTF zone ID
 */
export const linkToHTFZone = async (ltfZoneId, htfZoneId) => {
  try {
    const { error } = await supabase
      .from('zone_history')
      .update({
        htf_zone_id: htfZoneId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', ltfZoneId);

    if (error) throw error;
    console.log('[FreshnessTracker] Linked LTF to HTF zone');
    return true;
  } catch (error) {
    console.error('[FreshnessTracker] Error linking zones:', error);
    return false;
  }
};

// ═══════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════

export const FRESHNESS = FRESHNESS_STATUS;

export default {
  // Zone management
  registerZone,
  recordZoneTest,
  markZoneBroken,
  linkToHTFZone,

  // Freshness calculations
  getFreshnessStatus,
  getRemainingOrdersPercent,
  getFreshnessScore,
  getFreshnessDisplayInfo,
  isFTB,

  // Queries
  getActiveZones,
  getFreshZones,
  getZoneStatistics,

  // Cache
  getZoneFromCache,
  clearZoneCache,

  // Constants
  FRESHNESS: FRESHNESS_STATUS,
};
