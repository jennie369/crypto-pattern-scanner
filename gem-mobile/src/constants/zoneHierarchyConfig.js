/**
 * GEM Mobile - Zone Hierarchy Configuration
 * Classification system: DP > FTR > FL > Regular
 *
 * Phase 2A: Flag Limit + Decision Point + Zone Hierarchy
 */

// ═══════════════════════════════════════════════════════════
// ZONE HIERARCHY LEVELS
// ═══════════════════════════════════════════════════════════

export const ZONE_HIERARCHY = {
  DECISION_POINT: {
    level: 1,
    name: 'Decision Point',
    nameVi: 'Điểm Quyết Định',
    shortName: 'DP',
    strength: 5,
    stars: 5,
    starsDisplay: '⭐⭐⭐⭐⭐',
    color: '#9C0612', // Burgundy
    colorLight: '#9C061220',
    description: 'Origin của major move - Zone mạnh nhất',
    descriptionEn: 'Origin of major move - Strongest zone',
    oddsBonus: 2, // +2 to zone_origin score
    priority: 1,
    icon: 'Crown',
  },
  FTR: {
    level: 2,
    name: 'Fail To Return',
    nameVi: 'Thất Bại Quay Lại',
    shortName: 'FTR',
    strength: 4,
    stars: 4,
    starsDisplay: '⭐⭐⭐⭐',
    color: '#FFBD59', // Gold
    colorLight: '#FFBD5920',
    description: 'Zone sau khi break S/R - Trend confirmation',
    descriptionEn: 'Zone after S/R break - Trend confirmation',
    oddsBonus: 1,
    priority: 2,
    icon: 'Target',
  },
  FLAG_LIMIT: {
    level: 3,
    name: 'Flag Limit',
    nameVi: 'Giới Hạn Cờ',
    shortName: 'FL',
    strength: 3,
    stars: 3,
    starsDisplay: '⭐⭐⭐',
    color: '#22C55E', // Green
    colorLight: '#22C55E20',
    description: 'Zone trong trend với base 1-2 nến',
    descriptionEn: 'Zone in trend with 1-2 candle base',
    oddsBonus: 1,
    priority: 3,
    icon: 'Flag',
  },
  REGULAR: {
    level: 4,
    name: 'Regular Zone',
    nameVi: 'Zone Thường',
    shortName: 'REG',
    strength: 2,
    stars: 2,
    starsDisplay: '⭐⭐',
    color: '#6B7280', // Gray
    colorLight: '#6B728020',
    description: 'Zone thông thường - Cần thêm confluence',
    descriptionEn: 'Regular zone - Needs additional confluence',
    oddsBonus: 0,
    priority: 4,
    icon: 'Circle',
  },
};

// ═══════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════

/**
 * Get hierarchy config by level
 * @param {number} level - Hierarchy level (1-4)
 * @returns {Object} Hierarchy config
 */
export const getHierarchyByLevel = (level) => {
  return Object.values(ZONE_HIERARCHY).find(h => h.level === level) || ZONE_HIERARCHY.REGULAR;
};

/**
 * Get hierarchy config by name
 * @param {string} name - Hierarchy name (e.g., 'DECISION_POINT', 'decision_point', 'dp')
 * @returns {Object} Hierarchy config
 */
export const getHierarchyByName = (name) => {
  if (!name) return ZONE_HIERARCHY.REGULAR;

  const normalized = name.toUpperCase().replace(/[^A-Z_]/g, '').replace(' ', '_');

  // Direct match
  if (ZONE_HIERARCHY[normalized]) {
    return ZONE_HIERARCHY[normalized];
  }

  // Short name match
  const byShortName = Object.values(ZONE_HIERARCHY).find(
    h => h.shortName.toUpperCase() === normalized
  );
  if (byShortName) return byShortName;

  return ZONE_HIERARCHY.REGULAR;
};

/**
 * Compare zone priorities (for sorting)
 * @param {Object} zoneA - First zone
 * @param {Object} zoneB - Second zone
 * @returns {number} Comparison result (-1, 0, 1)
 */
export const compareZonePriority = (zoneA, zoneB) => {
  const getLevel = (zone) => {
    if (!zone) return 4;
    if (zone.zoneHierarchyLevel) return zone.zoneHierarchyLevel;
    const config = getHierarchyByName(zone.zoneHierarchy);
    return config.level;
  };

  return getLevel(zoneA) - getLevel(zoneB);
};

/**
 * Get hierarchy odds bonus for odds enhancers
 * @param {number|string} hierarchy - Level number or hierarchy name
 * @returns {number} Odds bonus (0-2)
 */
export const getHierarchyOddsBonus = (hierarchy) => {
  if (typeof hierarchy === 'number') {
    return getHierarchyByLevel(hierarchy).oddsBonus;
  }
  return getHierarchyByName(hierarchy).oddsBonus;
};

/**
 * Check if zone is premium (DP, FTR, or FL)
 * @param {Object} zone - Zone object
 * @returns {boolean}
 */
export const isPremiumZone = (zone) => {
  if (!zone) return false;

  const level = zone.zoneHierarchyLevel || getHierarchyByName(zone.zoneHierarchy).level;
  return level <= 3; // DP, FTR, FL are premium
};

/**
 * Get all hierarchy levels as array
 * @returns {Array} Sorted hierarchy configs
 */
export const getAllHierarchyLevels = () => {
  return Object.values(ZONE_HIERARCHY).sort((a, b) => a.level - b.level);
};

/**
 * Get hierarchy display info for UI
 * @param {string} hierarchyName - Hierarchy name
 * @returns {Object} Display info
 */
export const getHierarchyDisplayInfo = (hierarchyName) => {
  const config = getHierarchyByName(hierarchyName);
  return {
    shortName: config.shortName,
    name: config.name,
    nameVi: config.nameVi,
    color: config.color,
    colorLight: config.colorLight,
    icon: config.icon,
    stars: config.stars,
    starsDisplay: config.starsDisplay,
    description: config.description,
    level: config.level,
  };
};

// ═══════════════════════════════════════════════════════════
// FLAG LIMIT SPECIFIC
// ═══════════════════════════════════════════════════════════

export const FLAG_LIMIT_CONFIG = {
  maxBaseCandleCount: 2, // Maximum 2 candles in FL base
  minMovePercent: 1.0,   // Minimum 1% move before pause
  minContinuationPercent: 0.5, // Minimum 0.5% continuation after pause
  validPatterns: ['UPU', 'DPD'], // Only continuation patterns
};

// ═══════════════════════════════════════════════════════════
// DECISION POINT SPECIFIC
// ═══════════════════════════════════════════════════════════

export const DECISION_POINT_CONFIG = {
  minMovePercent: 3.0,   // Minimum 3% move from DP
  minMoveMultiple: 3,    // Move must be 3x the DP zone width
  maxOriginCandles: 5,   // DP origin can have up to 5 candles
  impulsiveRatio: 0.6,   // 60%+ candles must be in move direction
};

// ═══════════════════════════════════════════════════════════
// DEFAULT EXPORT
// ═══════════════════════════════════════════════════════════

export default {
  ZONE_HIERARCHY,
  FLAG_LIMIT_CONFIG,
  DECISION_POINT_CONFIG,
  getHierarchyByLevel,
  getHierarchyByName,
  compareZonePriority,
  getHierarchyOddsBonus,
  isPremiumZone,
  getAllHierarchyLevels,
  getHierarchyDisplayInfo,
};
