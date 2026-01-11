/**
 * GEM Mobile - Stacked Zones Detector
 * Detect multiple zones overlapping at same price area
 *
 * Phase 2B: Stacked Zones Detection
 *
 * Stacked Zones = A+ Setup with extremely high reversal probability
 * Example: Daily LFZ + 4H LFZ + 1H LFZ + Fib 61.8% = 4 confluences
 */

// ═══════════════════════════════════════════════════════════
// ZONE OVERLAP DETECTION
// ═══════════════════════════════════════════════════════════

/**
 * Check if two zones overlap
 * @param {Object} zone1 - First zone
 * @param {Object} zone2 - Second zone
 * @param {number} tolerance - Overlap tolerance percentage
 * @returns {boolean} True if zones overlap
 */
export const zonesOverlap = (zone1, zone2, tolerance = 0.5) => {
  if (!zone1 || !zone2) return false;

  // Get zone boundaries
  const z1High = Math.max(zone1.entryPrice || 0, zone1.stopPrice || 0);
  const z1Low = Math.min(zone1.entryPrice || 0, zone1.stopPrice || 0);
  const z2High = Math.max(zone2.entryPrice || 0, zone2.stopPrice || 0);
  const z2Low = Math.min(zone2.entryPrice || 0, zone2.stopPrice || 0);

  if (z1High <= 0 || z2High <= 0) return false;

  // Add tolerance
  const toleranceAmount = (z1High - z1Low) * (tolerance / 100);

  // Check overlap
  const overlaps = !(z1High + toleranceAmount < z2Low || z2High + toleranceAmount < z1Low);

  return overlaps;
};

/**
 * Calculate overlap percentage between zones
 * @param {Object} zone1 - First zone
 * @param {Object} zone2 - Second zone
 * @returns {number} Overlap percentage
 */
export const calculateOverlapPercent = (zone1, zone2) => {
  if (!zonesOverlap(zone1, zone2)) return 0;

  const z1High = Math.max(zone1.entryPrice || 0, zone1.stopPrice || 0);
  const z1Low = Math.min(zone1.entryPrice || 0, zone1.stopPrice || 0);
  const z2High = Math.max(zone2.entryPrice || 0, zone2.stopPrice || 0);
  const z2Low = Math.min(zone2.entryPrice || 0, zone2.stopPrice || 0);

  const overlapHigh = Math.min(z1High, z2High);
  const overlapLow = Math.max(z1Low, z2Low);
  const overlapSize = overlapHigh - overlapLow;

  const smallerZoneSize = Math.min(z1High - z1Low, z2High - z2Low);

  if (smallerZoneSize <= 0) return 0;

  return (overlapSize / smallerZoneSize) * 100;
};

// ═══════════════════════════════════════════════════════════
// STACKED ZONES DETECTION
// ═══════════════════════════════════════════════════════════

/**
 * Detect stacked zones from multiple timeframes
 * @param {Object} zonesPerTimeframe - Object with timeframe as key, zones as value
 * @param {Object} options - Detection options
 * @returns {Array} Array of stacked zone groups
 */
export const detectStackedZones = (zonesPerTimeframe, options = {}) => {
  const { minConfluence = 2, overlapTolerance = 0.5 } = options;

  // Flatten all zones with timeframe info
  const allZones = [];
  Object.entries(zonesPerTimeframe || {}).forEach(([timeframe, zones]) => {
    (zones || []).forEach(zone => {
      allZones.push({ ...zone, timeframe });
    });
  });

  if (allZones.length < minConfluence) return [];

  // Group overlapping zones
  const stackedGroups = [];
  const used = new Set();

  for (let i = 0; i < allZones.length; i++) {
    if (used.has(i)) continue;

    const group = [allZones[i]];
    used.add(i);

    for (let j = i + 1; j < allZones.length; j++) {
      if (used.has(j)) continue;

      // Check if overlaps with any zone in group
      const overlapsWithGroup = group.some(groupZone =>
        zonesOverlap(groupZone, allZones[j], overlapTolerance)
      );

      if (overlapsWithGroup) {
        group.push(allZones[j]);
        used.add(j);
      }
    }

    if (group.length >= minConfluence) {
      stackedGroups.push(createStackedZoneResult(group));
    }
  }

  return stackedGroups;
};

/**
 * Create result object for stacked zone group
 * @param {Array} zones - Array of overlapping zones
 * @returns {Object} Stacked zone result
 */
const createStackedZoneResult = (zones) => {
  // Calculate combined zone boundaries
  const allHighs = zones.map(z => Math.max(z.entryPrice || 0, z.stopPrice || 0));
  const allLows = zones.map(z => Math.min(z.entryPrice || 0, z.stopPrice || 0));

  const combinedHigh = Math.max(...allHighs);
  const combinedLow = Math.min(...allLows);

  // Find the tightest zone (smallest range) for entry
  const sortedByRange = [...zones].sort((a, b) => {
    const rangeA = Math.abs((a.entryPrice || 0) - (a.stopPrice || 0));
    const rangeB = Math.abs((b.entryPrice || 0) - (b.stopPrice || 0));
    return rangeA - rangeB;
  });

  const tightestZone = sortedByRange[0];

  // Determine zone type (majority vote)
  const hfzCount = zones.filter(z => z.zoneType === 'HFZ').length;
  const lfzCount = zones.filter(z => z.zoneType === 'LFZ').length;
  const zoneType = hfzCount > lfzCount ? 'HFZ' : 'LFZ';

  // Get unique timeframes (sorted HTF first)
  const timeframeOrder = ['1M', '1w', '1d', '4h', '1h', '30m', '15m', '5m', '1m'];
  const timeframes = [...new Set(zones.map(z => z.timeframe))].sort((a, b) => {
    return timeframeOrder.indexOf(a) - timeframeOrder.indexOf(b);
  });

  // Calculate confluence score
  const confluenceScore = calculateConfluenceScore(zones);

  return {
    isStacked: true,
    stackedCount: zones.length,
    confluenceScore,

    // Combined zone (use tightest for entry)
    entryPrice: tightestZone.entryPrice,
    stopPrice: tightestZone.stopPrice,
    zoneWidth: Math.abs((tightestZone.entryPrice || 0) - (tightestZone.stopPrice || 0)),

    // Full range
    combinedHigh,
    combinedLow,
    combinedRange: combinedHigh - combinedLow,

    // Type
    zoneType,
    tradingBias: zoneType === 'HFZ' ? 'SELL' : 'BUY',

    // Components
    zones: zones.map(z => ({
      timeframe: z.timeframe,
      zoneType: z.zoneType,
      pattern: z.pattern || z.patternType,
      entryPrice: z.entryPrice,
      stopPrice: z.stopPrice,
      zoneHierarchy: z.zoneHierarchy,
      isFTR: z.isFTR || false,
      isDecisionPoint: z.isDecisionPoint || false,
      isFlagLimit: z.isFlagLimit || false,
    })),

    timeframes,
    htfTimeframe: timeframes[0],

    // Quality
    quality: getStackedQuality(zones.length),
    recommendation: getStackedRecommendation(confluenceScore),

    detectedAt: new Date().toISOString(),
  };
};

/**
 * Calculate confluence score for stacked zones
 * @param {Array} zones - Array of zones
 * @returns {number} Confluence score
 */
const calculateConfluenceScore = (zones) => {
  let score = zones.length; // Base: 1 point per zone

  // Bonus for multiple timeframes
  const uniqueTFs = new Set(zones.map(z => z.timeframe)).size;
  score += (uniqueTFs - 1) * 2;

  // Bonus for hierarchy
  zones.forEach(z => {
    const hierarchy = z.zoneHierarchy?.toUpperCase?.() || z.zoneHierarchy;
    if (hierarchy === 'DECISION_POINT' || z.isDecisionPoint) score += 3;
    else if (hierarchy === 'FTR' || z.isFTR) score += 2;
    else if (hierarchy === 'FLAG_LIMIT' || z.isFlagLimit) score += 1;
  });

  // Bonus for same zone type
  const allSameType = zones.every(z => z.zoneType === zones[0].zoneType);
  if (allSameType) score += 2;

  // Bonus for fresh zones (FTB)
  const freshZones = zones.filter(z => (z.testCount || 0) === 0);
  score += freshZones.length;

  return score;
};

/**
 * Get quality rating based on zone count
 */
const getStackedQuality = (count) => {
  if (count >= 5) return 'exceptional';
  if (count >= 4) return 'excellent';
  if (count >= 3) return 'good';
  return 'moderate';
};

/**
 * Get trading recommendation based on confluence score
 */
const getStackedRecommendation = (score) => {
  if (score >= 15) return 'A+ Setup - Full position với high confidence';
  if (score >= 10) return 'A Setup - 75% position recommended';
  if (score >= 6) return 'B Setup - 50% position với SL tight';
  return 'C Setup - Chờ thêm confirmation';
};

// ═══════════════════════════════════════════════════════════
// CONFLUENCE FACTOR ANALYSIS
// ═══════════════════════════════════════════════════════════

/**
 * Find all confluence factors for a zone
 * @param {Object} zone - Target zone
 * @param {Array} allZones - All available zones
 * @param {Object} otherFactors - Additional factors (fib levels, S/R, etc.)
 * @returns {Object} Confluence analysis
 */
export const findConfluenceFactors = (zone, allZones, otherFactors = {}) => {
  const factors = [];

  // Zone overlaps
  const overlapping = (allZones || []).filter(z =>
    z !== zone && zonesOverlap(zone, z)
  );

  overlapping.forEach(z => {
    const hierarchy = z.zoneHierarchy?.toUpperCase?.() || z.zoneHierarchy;
    factors.push({
      type: 'zone_overlap',
      description: `${z.timeframe || 'N/A'} ${z.zoneType || 'Zone'}`,
      strength: hierarchy === 'DECISION_POINT' ? 3 :
                hierarchy === 'FTR' ? 2 : 1,
    });
  });

  // Fibonacci levels
  if (otherFactors.fibLevels) {
    const nearFib = otherFactors.fibLevels.find(fib =>
      Math.abs((zone.entryPrice || 0) - fib.price) / (zone.entryPrice || 1) < 0.005
    );
    if (nearFib) {
      factors.push({
        type: 'fibonacci',
        description: `Fib ${nearFib.level}%`,
        strength: nearFib.level === 61.8 || nearFib.level === 78.6 ? 2 : 1,
      });
    }
  }

  // Previous S/R levels
  if (otherFactors.srLevels) {
    const nearSR = otherFactors.srLevels.find(sr =>
      Math.abs((zone.entryPrice || 0) - sr.price) / (zone.entryPrice || 1) < 0.005
    );
    if (nearSR) {
      factors.push({
        type: 'support_resistance',
        description: nearSR.type === 'support' ? 'Previous Support' : 'Previous Resistance',
        strength: 2,
      });
    }
  }

  // Round number levels
  if (otherFactors.roundNumbers) {
    const nearRound = otherFactors.roundNumbers.find(rn =>
      Math.abs((zone.entryPrice || 0) - rn.price) / (zone.entryPrice || 1) < 0.002
    );
    if (nearRound) {
      factors.push({
        type: 'round_number',
        description: `Round Level ${nearRound.price}`,
        strength: 1,
      });
    }
  }

  return {
    factors,
    totalStrength: factors.reduce((sum, f) => sum + f.strength, 0),
    count: factors.length,
  };
};

// ═══════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════

/**
 * Get best stacked zone (highest confluence score)
 * @param {Array} stackedZones - Array of stacked zones
 * @returns {Object|null} Best stacked zone
 */
export const getBestStackedZone = (stackedZones) => {
  if (!stackedZones || stackedZones.length === 0) return null;

  return stackedZones.reduce((best, current) =>
    (current.confluenceScore || 0) > (best.confluenceScore || 0) ? current : best
  );
};

/**
 * Filter stacked zones by minimum confluence
 * @param {Array} stackedZones - Array of stacked zones
 * @param {number} minScore - Minimum confluence score
 * @returns {Array} Filtered zones
 */
export const filterByMinConfluence = (stackedZones, minScore = 6) => {
  return (stackedZones || []).filter(z => (z.confluenceScore || 0) >= minScore);
};

/**
 * Get stacked zones summary statistics
 * @param {Array} stackedZones - Array of stacked zones
 * @returns {Object} Summary stats
 */
export const getStackedZonesSummary = (stackedZones) => {
  if (!stackedZones || stackedZones.length === 0) {
    return {
      total: 0,
      exceptional: 0,
      excellent: 0,
      good: 0,
      moderate: 0,
      avgConfluence: 0,
    };
  }

  const qualityCounts = {
    exceptional: 0,
    excellent: 0,
    good: 0,
    moderate: 0,
  };

  stackedZones.forEach(z => {
    const quality = z.quality || 'moderate';
    if (qualityCounts[quality] !== undefined) {
      qualityCounts[quality]++;
    }
  });

  const totalConfluence = stackedZones.reduce((sum, z) => sum + (z.confluenceScore || 0), 0);

  return {
    total: stackedZones.length,
    ...qualityCounts,
    avgConfluence: parseFloat((totalConfluence / stackedZones.length).toFixed(1)),
  };
};

// ═══════════════════════════════════════════════════════════
// DEFAULT EXPORT
// ═══════════════════════════════════════════════════════════

const stackedZonesDetector = {
  zonesOverlap,
  calculateOverlapPercent,
  detectStackedZones,
  findConfluenceFactors,
  getBestStackedZone,
  filterByMinConfluence,
  getStackedZonesSummary,
};

export default stackedZonesDetector;
