/**
 * GEM Mobile - Zone Hierarchy Service
 * Zone classification and hierarchy management
 *
 * Phase 2A: Flag Limit + Decision Point + Zone Hierarchy
 *
 * Hierarchy (strongest to weakest):
 * 1. Decision Point (DP) / Quasimodo (QM) - Level 1
 * 2. Fail To Return (FTR) - Level 2
 * 3. Flag Limit (FL) - Level 3
 * 4. Regular Zone - Level 4
 */

import {
  ZONE_HIERARCHY,
  getHierarchyByLevel,
  getHierarchyByName,
  getHierarchyOddsBonus,
} from '../constants/zoneHierarchyConfig';
import { isValidFlagLimit } from './flagLimitDetector';

// ═══════════════════════════════════════════════════════════
// ZONE CLASSIFICATION
// ═══════════════════════════════════════════════════════════

/**
 * Classify a zone into hierarchy
 * @param {Object} zone - Zone object
 * @returns {Object} Classified zone with hierarchy info
 */
export const classifyZone = (zone) => {
  if (!zone) return null;

  let hierarchyLevel = 4; // Default: Regular
  let hierarchyName = 'REGULAR';

  // Check for Decision Point
  if (zone.isDecisionPoint || zone.patternCategory === 'decision_point') {
    hierarchyLevel = 1;
    hierarchyName = 'DECISION_POINT';
  }
  // Check for Quasimodo (same level as DP)
  else if (
    zone.patternCategory === 'quasimodo' ||
    zone.pattern?.toUpperCase()?.includes('QUASIMODO') ||
    zone.pattern?.toUpperCase()?.includes('QM')
  ) {
    hierarchyLevel = 1;
    hierarchyName = 'DECISION_POINT';
  }
  // Check for FTR
  else if (zone.isFTR || zone.patternCategory === 'ftr') {
    hierarchyLevel = 2;
    hierarchyName = 'FTR';
  }
  // Check for Flag Limit
  else if (zone.isFlagLimit || isValidFlagLimit(zone)) {
    hierarchyLevel = 3;
    hierarchyName = 'FLAG_LIMIT';
  }
  // Regular zone
  else {
    hierarchyLevel = 4;
    hierarchyName = 'REGULAR';
  }

  const hierarchyConfig = ZONE_HIERARCHY[hierarchyName];

  return {
    ...zone,
    zoneHierarchy: hierarchyName,
    zoneHierarchyLevel: hierarchyLevel,
    hierarchyConfig,
    hierarchyOddsBonus: hierarchyConfig.oddsBonus,
  };
};

// ═══════════════════════════════════════════════════════════
// SORTING & FILTERING
// ═══════════════════════════════════════════════════════════

/**
 * Sort zones by hierarchy priority
 * @param {Array} zones - Array of zones
 * @returns {Array} Sorted zones (strongest first)
 */
export const sortZonesByHierarchy = (zones) => {
  if (!zones || zones.length === 0) return [];

  // First classify all zones
  const classified = zones.map(classifyZone).filter(Boolean);

  // Sort by hierarchy level (1 = strongest)
  return classified.sort((a, b) => {
    // Primary: Hierarchy level
    if (a.zoneHierarchyLevel !== b.zoneHierarchyLevel) {
      return a.zoneHierarchyLevel - b.zoneHierarchyLevel;
    }

    // Secondary: Freshness (lower test count = fresher)
    const aTestCount = a.testCount || a.zone_test_count || 0;
    const bTestCount = b.testCount || b.zone_test_count || 0;
    if (aTestCount !== bTestCount) {
      return aTestCount - bTestCount;
    }

    // Tertiary: Odds score (higher = better)
    const aScore = a.oddsScore || a.odds_score || 0;
    const bScore = b.oddsScore || b.odds_score || 0;
    if (aScore !== bScore) {
      return bScore - aScore;
    }

    // Quaternary: Confidence (higher = better)
    const aConf = a.confidence || 0;
    const bConf = b.confidence || 0;
    return bConf - aConf;
  });
};

/**
 * Filter zones by minimum hierarchy level
 * @param {Array} zones - Array of zones
 * @param {number} maxLevel - Maximum level to include (1 = DP only, 4 = all)
 * @returns {Array} Filtered zones
 */
export const filterByHierarchy = (zones, maxLevel = 4) => {
  if (!zones) return [];

  const classified = zones.map(classifyZone).filter(Boolean);
  return classified.filter(z => z.zoneHierarchyLevel <= maxLevel);
};

/**
 * Filter only premium zones (DP, FTR, FL)
 * @param {Array} zones - Array of zones
 * @returns {Array} Premium zones only
 */
export const filterPremiumZones = (zones) => {
  return filterByHierarchy(zones, 3);
};

// ═══════════════════════════════════════════════════════════
// ZONE SELECTION
// ═══════════════════════════════════════════════════════════

/**
 * Get best zone from list
 * @param {Array} zones - Array of zones
 * @returns {Object|null} Best zone or null
 */
export const getBestZone = (zones) => {
  const sorted = sortZonesByHierarchy(zones);
  return sorted[0] || null;
};

/**
 * Get best zone for each type (bullish/bearish)
 * @param {Array} zones - Array of zones
 * @returns {Object} { bullish: zone, bearish: zone }
 */
export const getBestZonesByDirection = (zones) => {
  const sorted = sortZonesByHierarchy(zones);

  const bullish = sorted.find(
    z => z.zoneType === 'LFZ' || z.tradingBias === 'BUY'
  );
  const bearish = sorted.find(
    z => z.zoneType === 'HFZ' || z.tradingBias === 'SELL'
  );

  return { bullish, bearish };
};

// ═══════════════════════════════════════════════════════════
// GROUPING
// ═══════════════════════════════════════════════════════════

/**
 * Group zones by hierarchy
 * @param {Array} zones - Array of zones
 * @returns {Object} Grouped zones
 */
export const groupByHierarchy = (zones) => {
  if (!zones || zones.length === 0) {
    return {
      decisionPoints: [],
      ftrZones: [],
      flagLimits: [],
      regularZones: [],
    };
  }

  const classified = zones.map(classifyZone).filter(Boolean);

  return {
    decisionPoints: classified.filter(z => z.zoneHierarchyLevel === 1),
    ftrZones: classified.filter(z => z.zoneHierarchyLevel === 2),
    flagLimits: classified.filter(z => z.zoneHierarchyLevel === 3),
    regularZones: classified.filter(z => z.zoneHierarchyLevel === 4),
  };
};

/**
 * Group zones by direction and hierarchy
 * @param {Array} zones - Array of zones
 * @returns {Object} Grouped zones by direction
 */
export const groupByDirectionAndHierarchy = (zones) => {
  const groups = groupByHierarchy(zones);

  return {
    bullish: {
      decisionPoints: groups.decisionPoints.filter(
        z => z.zoneType === 'LFZ' || z.tradingBias === 'BUY'
      ),
      ftrZones: groups.ftrZones.filter(
        z => z.zoneType === 'LFZ' || z.tradingBias === 'BUY'
      ),
      flagLimits: groups.flagLimits.filter(
        z => z.zoneType === 'LFZ' || z.tradingBias === 'BUY'
      ),
      regularZones: groups.regularZones.filter(
        z => z.zoneType === 'LFZ' || z.tradingBias === 'BUY'
      ),
    },
    bearish: {
      decisionPoints: groups.decisionPoints.filter(
        z => z.zoneType === 'HFZ' || z.tradingBias === 'SELL'
      ),
      ftrZones: groups.ftrZones.filter(
        z => z.zoneType === 'HFZ' || z.tradingBias === 'SELL'
      ),
      flagLimits: groups.flagLimits.filter(
        z => z.zoneType === 'HFZ' || z.tradingBias === 'SELL'
      ),
      regularZones: groups.regularZones.filter(
        z => z.zoneType === 'HFZ' || z.tradingBias === 'SELL'
      ),
    },
  };
};

// ═══════════════════════════════════════════════════════════
// STATISTICS
// ═══════════════════════════════════════════════════════════

/**
 * Calculate hierarchy distribution stats
 * @param {Array} zones - Array of zones
 * @returns {Object} Statistics
 */
export const getHierarchyStats = (zones) => {
  if (!zones || zones.length === 0) {
    return {
      total: 0,
      decisionPoints: 0,
      ftrZones: 0,
      flagLimits: 0,
      regularZones: 0,
      premiumCount: 0,
      premiumPercent: '0.0',
      averageLevel: 0,
    };
  }

  const groups = groupByHierarchy(zones);
  const premiumCount =
    groups.decisionPoints.length +
    groups.ftrZones.length +
    groups.flagLimits.length;

  // Calculate average level
  const classified = zones.map(classifyZone).filter(Boolean);
  const totalLevel = classified.reduce((sum, z) => sum + z.zoneHierarchyLevel, 0);

  return {
    total: zones.length,
    decisionPoints: groups.decisionPoints.length,
    ftrZones: groups.ftrZones.length,
    flagLimits: groups.flagLimits.length,
    regularZones: groups.regularZones.length,
    premiumCount,
    premiumPercent: ((premiumCount / zones.length) * 100).toFixed(1),
    averageLevel: (totalLevel / classified.length).toFixed(1),
  };
};

/**
 * Get hierarchy summary for display
 * @param {Array} zones - Array of zones
 * @returns {Array} Summary for UI display
 */
export const getHierarchySummary = (zones) => {
  const stats = getHierarchyStats(zones);

  return [
    {
      level: 1,
      name: 'Decision Point',
      shortName: 'DP',
      count: stats.decisionPoints,
      color: ZONE_HIERARCHY.DECISION_POINT.color,
      icon: ZONE_HIERARCHY.DECISION_POINT.icon,
    },
    {
      level: 2,
      name: 'FTR',
      shortName: 'FTR',
      count: stats.ftrZones,
      color: ZONE_HIERARCHY.FTR.color,
      icon: ZONE_HIERARCHY.FTR.icon,
    },
    {
      level: 3,
      name: 'Flag Limit',
      shortName: 'FL',
      count: stats.flagLimits,
      color: ZONE_HIERARCHY.FLAG_LIMIT.color,
      icon: ZONE_HIERARCHY.FLAG_LIMIT.icon,
    },
    {
      level: 4,
      name: 'Regular',
      shortName: 'REG',
      count: stats.regularZones,
      color: ZONE_HIERARCHY.REGULAR.color,
      icon: ZONE_HIERARCHY.REGULAR.icon,
    },
  ];
};

// ═══════════════════════════════════════════════════════════
// ODDS ENHANCERS INTEGRATION
// ═══════════════════════════════════════════════════════════

/**
 * Apply hierarchy bonus to odds score
 * @param {Object} zone - Zone with odds score
 * @returns {Object} Zone with adjusted odds score
 */
export const applyHierarchyBonus = (zone) => {
  if (!zone) return zone;

  const classified = classifyZone(zone);
  const bonus = classified.hierarchyOddsBonus || 0;
  const currentScore = zone.oddsScore || zone.odds_score || 0;

  // Cap at max score of 16
  const adjustedScore = Math.min(16, currentScore + bonus);

  return {
    ...classified,
    oddsScoreOriginal: currentScore,
    oddsScore: adjustedScore,
    hierarchyBonusApplied: bonus,
  };
};

// ═══════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════

export default {
  classifyZone,
  sortZonesByHierarchy,
  filterByHierarchy,
  filterPremiumZones,
  getBestZone,
  getBestZonesByDirection,
  groupByHierarchy,
  groupByDirectionAndHierarchy,
  getHierarchyStats,
  getHierarchySummary,
  applyHierarchyBonus,
};
