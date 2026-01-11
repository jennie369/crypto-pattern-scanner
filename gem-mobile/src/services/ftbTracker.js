/**
 * GEM Mobile - FTB (First Time Back) Tracker
 * Track First Time Back opportunities for zones
 *
 * Phase 2B: FTB Tracking
 *
 * FTB = First Time Back
 * The FIRST time price returns to a zone after formation
 *
 * This is the BEST entry timing because:
 * - Zone is still FRESH (no orders filled yet)
 * - Smart Money still has interest
 * - Highest probability of reversal
 */

import { supabase } from './supabase';

// ═══════════════════════════════════════════════════════════
// FTB STATUS CHECKING
// ═══════════════════════════════════════════════════════════

/**
 * Check if zone is at FTB
 * @param {Object} zone - Zone object
 * @param {number} currentPrice - Current market price
 * @param {number} testCount - Number of times zone has been tested
 * @returns {Object} FTB status
 */
export const checkFTBStatus = (zone, currentPrice, testCount = 0) => {
  if (!zone) return null;

  const isFirstTimeBack = testCount === 0;
  const entryPrice = zone.entryPrice || 0;
  const stopPrice = zone.stopPrice || 0;

  const zoneHigh = Math.max(entryPrice, stopPrice);
  const zoneLow = Math.min(entryPrice, stopPrice);
  const zoneMid = (zoneHigh + zoneLow) / 2;
  const zoneWidth = zoneHigh - zoneLow;

  // Check if price is at or near zone
  const distanceToZone = Math.min(
    Math.abs(currentPrice - zoneHigh),
    Math.abs(currentPrice - zoneLow)
  );
  const distancePercent = (distanceToZone / currentPrice) * 100;

  const isInZone = currentPrice >= zoneLow && currentPrice <= zoneHigh;
  const isApproaching = distancePercent < 1; // Within 1%
  const isNear = distancePercent < 0.5; // Within 0.5%

  // Determine FTB quality
  let ftbQuality = 'none';
  if (isFirstTimeBack && isInZone) ftbQuality = 'perfect';
  else if (isFirstTimeBack && isNear) ftbQuality = 'excellent';
  else if (isFirstTimeBack && isApproaching) ftbQuality = 'good';
  else if (!isFirstTimeBack && isInZone) ftbQuality = 'tested';

  // Check approach direction
  const isBullishZone = zone.zoneType === 'LFZ' || zone.tradingBias === 'BUY';
  const correctApproach = isBullishZone
    ? currentPrice < entryPrice
    : currentPrice > entryPrice;

  return {
    isFirstTimeBack,
    isFTB: isFirstTimeBack && (isInZone || isApproaching),
    testCount,

    priceStatus: {
      isInZone,
      isApproaching,
      isNear,
      distancePercent: parseFloat(distancePercent.toFixed(2)),
      distanceAbsolute: distanceToZone,
      currentPrice,
      zoneMid,
    },

    ftbQuality,
    correctApproach,

    recommendation: getFTBRecommendation(isFirstTimeBack, isInZone, isApproaching),

    tradingAdvice: isFirstTimeBack
      ? 'FTB - Entry tốt nhất! Zone còn 100% orders.'
      : testCount === 1
        ? 'Tested 1x - Zone còn ~70% orders. Vẫn trade được.'
        : testCount === 2
          ? 'Tested 2x - Zone còn ~50% orders. Cân nhắc kỹ.'
          : 'Tested nhiều - Zone likely exhausted. Consider skip.',

    // Stars rating (5 = best)
    stars: isFirstTimeBack ? 5 : testCount === 1 ? 4 : testCount === 2 ? 3 : 2,
  };
};

/**
 * Get FTB recommendation text
 */
const getFTBRecommendation = (isFirstTimeBack, isInZone, isApproaching) => {
  if (isFirstTimeBack && isInZone) {
    return 'ENTRY NOW - Perfect FTB setup';
  }
  if (isFirstTimeBack && isApproaching) {
    return 'SET ALERT - Price approaching FTB zone';
  }
  if (!isFirstTimeBack && isInZone) {
    return 'CAUTION - Zone already tested';
  }
  return 'MONITOR - Wait for price to approach';
};

// ═══════════════════════════════════════════════════════════
// DATABASE OPERATIONS
// ═══════════════════════════════════════════════════════════

/**
 * Update zone FTB status in database
 * @param {string} zoneHistoryId - Zone history record ID
 * @returns {Object} Updated zone
 */
export const markZoneTested = async (zoneHistoryId) => {
  try {
    const { data: zone, error: fetchError } = await supabase
      .from('zone_history')
      .select('test_count, is_ftb, first_test_at')
      .eq('id', zoneHistoryId)
      .single();

    if (fetchError) throw fetchError;

    const now = new Date().toISOString();
    const newTestCount = (zone?.test_count || 0) + 1;

    const { data, error } = await supabase
      .from('zone_history')
      .update({
        test_count: newTestCount,
        is_ftb: false, // No longer FTB after first test
        first_test_at: zone?.first_test_at || now,
        last_test_at: now,
        updated_at: now,
      })
      .eq('id', zoneHistoryId)
      .select()
      .single();

    if (error) throw error;

    return {
      ...data,
      wasFirstTest: (zone?.test_count || 0) === 0,
      newTestCount,
    };
  } catch (error) {
    console.error('[FTBTracker] Error marking zone tested:', error);
    throw error;
  }
};

/**
 * Get all FTB opportunities for a symbol
 * @param {string} userId - User ID
 * @param {string} symbol - Trading symbol
 * @param {number} currentPrice - Current market price
 * @returns {Array} FTB opportunities
 */
export const getFTBOpportunities = async (userId, symbol, currentPrice) => {
  try {
    const { data: zones, error } = await supabase
      .from('zone_history')
      .select('*')
      .eq('user_id', userId)
      .eq('symbol', symbol)
      .eq('is_broken', false)
      .eq('test_count', 0) // Only untested zones (FTB)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Calculate distance and filter by proximity
    const opportunities = (zones || [])
      .map(zone => ({
        ...zone,
        ftbStatus: checkFTBStatus(zone, currentPrice, zone.test_count || 0),
      }))
      .filter(z => z.ftbStatus?.priceStatus?.isApproaching || z.ftbStatus?.priceStatus?.isInZone)
      .sort((a, b) =>
        parseFloat(a.ftbStatus?.priceStatus?.distancePercent || 0) -
        parseFloat(b.ftbStatus?.priceStatus?.distancePercent || 0)
      );

    return opportunities;
  } catch (error) {
    console.error('[FTBTracker] Error getting FTB opportunities:', error);
    return [];
  }
};

/**
 * Get all FTB zones for user (across all symbols)
 * @param {string} userId - User ID
 * @param {Object} options - Query options
 * @returns {Array} FTB zones
 */
export const getAllFTBZones = async (userId, options = {}) => {
  const { limit = 50, onlyApproaching = false, currentPrices = {} } = options;

  try {
    const { data: zones, error } = await supabase
      .from('zone_history')
      .select('*')
      .eq('user_id', userId)
      .eq('is_broken', false)
      .eq('test_count', 0)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    let results = (zones || []).map(zone => ({
      ...zone,
      ftbStatus: currentPrices[zone.symbol]
        ? checkFTBStatus(zone, currentPrices[zone.symbol], 0)
        : null,
    }));

    if (onlyApproaching) {
      results = results.filter(z =>
        z.ftbStatus?.priceStatus?.isApproaching || z.ftbStatus?.priceStatus?.isInZone
      );
    }

    return results;
  } catch (error) {
    console.error('[FTBTracker] Error getting all FTB zones:', error);
    return [];
  }
};

// ═══════════════════════════════════════════════════════════
// ALERT MONITORING
// ═══════════════════════════════════════════════════════════

/**
 * Monitor price for FTB alerts
 * @param {Object} zone - Zone to monitor
 * @param {number} currentPrice - Current price
 * @param {number} previousPrice - Previous price
 * @returns {Object} Alert status
 */
export const shouldAlertFTB = (zone, currentPrice, previousPrice) => {
  const testCount = zone?.testCount || zone?.test_count || 0;
  const ftbStatus = checkFTBStatus(zone, currentPrice, testCount);
  const prevStatus = checkFTBStatus(zone, previousPrice, testCount);

  if (!ftbStatus || !prevStatus) {
    return { shouldAlert: false };
  }

  // Alert if just entered approaching range
  if (ftbStatus.priceStatus?.isApproaching && !prevStatus.priceStatus?.isApproaching) {
    return {
      shouldAlert: true,
      type: 'approaching',
      priority: 'medium',
      message: `Price approaching FTB zone ${zone.symbol}`,
      zone,
      ftbStatus,
    };
  }

  // Alert if just entered zone
  if (ftbStatus.priceStatus?.isInZone && !prevStatus.priceStatus?.isInZone) {
    return {
      shouldAlert: true,
      type: 'entered',
      priority: 'high',
      message: `Price entered FTB zone ${zone.symbol} - Entry opportunity!`,
      zone,
      ftbStatus,
    };
  }

  return { shouldAlert: false };
};

/**
 * Batch check for FTB alerts
 * @param {Array} zones - Zones to check
 * @param {Object} currentPrices - Current prices by symbol
 * @param {Object} previousPrices - Previous prices by symbol
 * @returns {Array} Alerts to trigger
 */
export const batchCheckFTBAlerts = (zones, currentPrices, previousPrices) => {
  const alerts = [];

  (zones || []).forEach(zone => {
    const symbol = zone.symbol;
    const currentPrice = currentPrices[symbol];
    const previousPrice = previousPrices[symbol];

    if (currentPrice && previousPrice) {
      const alertResult = shouldAlertFTB(zone, currentPrice, previousPrice);
      if (alertResult.shouldAlert) {
        alerts.push(alertResult);
      }
    }
  });

  // Sort by priority (high first)
  return alerts.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return (priorityOrder[a.priority] || 2) - (priorityOrder[b.priority] || 2);
  });
};

// ═══════════════════════════════════════════════════════════
// FRESHNESS ANALYSIS
// ═══════════════════════════════════════════════════════════

/**
 * Get freshness tier based on test count
 * @param {number} testCount - Number of tests
 * @returns {Object} Freshness tier info
 */
export const getFreshnessTier = (testCount) => {
  if (testCount === 0) {
    return {
      tier: 'virgin',
      label: 'First Time Back',
      color: '#FFD700', // Gold
      ordersRemaining: 100,
      winRateModifier: 1.0,
    };
  }
  if (testCount === 1) {
    return {
      tier: 'fresh',
      label: 'Tested Once',
      color: '#22C55E', // Green
      ordersRemaining: 70,
      winRateModifier: 0.9,
    };
  }
  if (testCount === 2) {
    return {
      tier: 'used',
      label: 'Tested Twice',
      color: '#F97316', // Orange
      ordersRemaining: 50,
      winRateModifier: 0.75,
    };
  }
  return {
    tier: 'stale',
    label: 'Multiple Tests',
    color: '#EF4444', // Red
    ordersRemaining: 30,
    winRateModifier: 0.5,
  };
};

/**
 * Calculate adjusted win rate based on freshness
 * @param {number} baseWinRate - Base win rate (0-1)
 * @param {number} testCount - Number of tests
 * @returns {number} Adjusted win rate
 */
export const getAdjustedWinRate = (baseWinRate, testCount) => {
  const tier = getFreshnessTier(testCount);
  return parseFloat((baseWinRate * tier.winRateModifier).toFixed(2));
};

// ═══════════════════════════════════════════════════════════
// SUMMARY STATISTICS
// ═══════════════════════════════════════════════════════════

/**
 * Get FTB summary for a user
 * @param {string} userId - User ID
 * @returns {Object} FTB summary
 */
export const getFTBSummary = async (userId) => {
  try {
    const { data: zones, error } = await supabase
      .from('zone_history')
      .select('test_count, is_ftb, is_broken')
      .eq('user_id', userId)
      .eq('is_broken', false);

    if (error) throw error;

    const summary = {
      total: zones?.length || 0,
      ftb: 0,
      testedOnce: 0,
      testedTwice: 0,
      stale: 0,
    };

    (zones || []).forEach(z => {
      const testCount = z.test_count || 0;
      if (testCount === 0) summary.ftb++;
      else if (testCount === 1) summary.testedOnce++;
      else if (testCount === 2) summary.testedTwice++;
      else summary.stale++;
    });

    return {
      ...summary,
      ftbPercent: summary.total > 0
        ? parseFloat(((summary.ftb / summary.total) * 100).toFixed(1))
        : 0,
    };
  } catch (error) {
    console.error('[FTBTracker] Error getting FTB summary:', error);
    return null;
  }
};

// ═══════════════════════════════════════════════════════════
// DEFAULT EXPORT
// ═══════════════════════════════════════════════════════════

const ftbTracker = {
  checkFTBStatus,
  markZoneTested,
  getFTBOpportunities,
  getAllFTBZones,
  shouldAlertFTB,
  batchCheckFTBAlerts,
  getFreshnessTier,
  getAdjustedWinRate,
  getFTBSummary,
};

export default ftbTracker;
