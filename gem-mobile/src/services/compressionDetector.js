/**
 * GEM Mobile - Compression Detector Service
 * Detect compression patterns (triangles/wedges) approaching zones
 *
 * Phase 2C: Compression + Inducement + Look Right
 *
 * Compression = Price squeezing into tighter range toward zone
 *
 * Why it matters:
 * - Shows decreasing momentum (buyers/sellers exhausted)
 * - Energy building up for explosive move
 * - High probability of reversal when hits zone
 *
 * Types:
 * - Descending Triangle into LFZ (bullish)
 * - Ascending Triangle into HFZ (bearish)
 * - Symmetrical compression (neutral, follow zone type)
 */

// ═══════════════════════════════════════════════════════════
// MAIN COMPRESSION DETECTION
// ═══════════════════════════════════════════════════════════

/**
 * Detect compression approaching a zone
 * @param {Array} candles - Recent candles approaching zone
 * @param {Object} zone - Target zone
 * @param {Object} options - Detection options
 * @returns {Object|null} Compression result or null
 */
export const detectCompression = (candles, zone, options = {}) => {
  const {
    minCandles = 5,
    maxCandles = 20,
    minCompressionRatio = 0.5, // Final range should be < 50% of initial
  } = options;

  if (!candles || candles.length < minCandles || !zone) {
    return null;
  }

  const recentCandles = candles.slice(-maxCandles);

  // Calculate range progression
  const ranges = [];
  for (let i = 0; i < recentCandles.length - 2; i += 3) {
    const chunk = recentCandles.slice(i, i + 3);
    const high = Math.max(...chunk.map(c => c.high));
    const low = Math.min(...chunk.map(c => c.low));
    ranges.push({ high, low, range: high - low });
  }

  if (ranges.length < 2) return null;

  // Check if ranges are decreasing (compression)
  const initialRange = ranges[0].range;
  const finalRange = ranges[ranges.length - 1].range;
  const compressionRatio = finalRange / initialRange;

  if (compressionRatio > minCompressionRatio) {
    return null; // Not enough compression
  }

  // Determine compression type
  const compressionType = determineCompressionType(ranges, zone);

  // Calculate quality
  const quality = calculateCompressionQuality(compressionRatio, ranges.length);

  // Check if compression is toward the zone
  const isTowardZone = checkCompressionDirection(recentCandles, zone);

  if (!isTowardZone) return null;

  return {
    hasCompression: true,
    compressionType,
    compressionQuality: quality,

    // Metrics
    initialRange,
    finalRange,
    compressionRatio: parseFloat(compressionRatio.toFixed(2)),
    compressionPercent: parseFloat(((1 - compressionRatio) * 100).toFixed(1)),
    candleCount: recentCandles.length,

    // Ranges detail
    ranges: ranges.map((r, i) => ({
      index: i,
      range: r.range,
      high: r.high,
      low: r.low,
    })),

    // Trading implication
    implication: getCompressionImplication(compressionType, zone.zoneType),
    recommendation: quality === 'excellent'
      ? 'A+ Entry condition - Compression into zone'
      : quality === 'good'
        ? 'Good entry - Wait for zone touch'
        : 'Moderate compression - Need confirmation',

    detectedAt: new Date().toISOString(),
  };
};

// ═══════════════════════════════════════════════════════════
// COMPRESSION TYPE ANALYSIS
// ═══════════════════════════════════════════════════════════

/**
 * Determine compression type based on highs/lows pattern
 * @param {Array} ranges - Range progression
 * @param {Object} zone - Target zone
 * @returns {string} Compression type
 */
const determineCompressionType = (ranges, zone) => {
  const highsTrend = analyzeTrend(ranges.map(r => r.high));
  const lowsTrend = analyzeTrend(ranges.map(r => r.low));

  // Descending triangle: Lower highs, flat lows
  if (highsTrend === 'descending' && lowsTrend === 'flat') {
    return 'descending_triangle';
  }

  // Ascending triangle: Flat highs, higher lows
  if (highsTrend === 'flat' && lowsTrend === 'ascending') {
    return 'ascending_triangle';
  }

  // Descending wedge: Lower highs, lower lows (converging)
  if (highsTrend === 'descending' && lowsTrend === 'descending') {
    return 'descending_wedge';
  }

  // Ascending wedge: Higher highs, higher lows (converging)
  if (highsTrend === 'ascending' && lowsTrend === 'ascending') {
    return 'ascending_wedge';
  }

  // Symmetrical: Both converging equally
  if (highsTrend === 'descending' && lowsTrend === 'ascending') {
    return 'symmetrical';
  }

  return 'undefined_compression';
};

/**
 * Analyze trend of a series
 * @param {Array} values - Array of values
 * @returns {string} Trend direction
 */
const analyzeTrend = (values) => {
  if (values.length < 2) return 'flat';

  let ascending = 0;
  let descending = 0;

  for (let i = 1; i < values.length; i++) {
    if (values[i] > values[i - 1] * 1.001) ascending++;
    else if (values[i] < values[i - 1] * 0.999) descending++;
  }

  const total = values.length - 1;
  if (ascending > total * 0.6) return 'ascending';
  if (descending > total * 0.6) return 'descending';
  return 'flat';
};

// ═══════════════════════════════════════════════════════════
// QUALITY & DIRECTION ANALYSIS
// ═══════════════════════════════════════════════════════════

/**
 * Calculate compression quality
 * @param {number} ratio - Compression ratio
 * @param {number} rangeCount - Number of range segments
 * @returns {string} Quality rating
 */
const calculateCompressionQuality = (ratio, rangeCount) => {
  let score = 0;

  // Compression ratio (lower = better)
  if (ratio < 0.3) score += 3;
  else if (ratio < 0.4) score += 2;
  else if (ratio < 0.5) score += 1;

  // Number of compression waves
  if (rangeCount >= 5) score += 2;
  else if (rangeCount >= 3) score += 1;

  if (score >= 4) return 'excellent';
  if (score >= 2) return 'good';
  return 'moderate';
};

/**
 * Check if compression is moving toward zone
 * @param {Array} candles - Candles
 * @param {Object} zone - Target zone
 * @returns {boolean} Whether moving toward zone
 */
const checkCompressionDirection = (candles, zone) => {
  const startPrice = candles[0].close;
  const endPrice = candles[candles.length - 1].close;

  if (zone.zoneType === 'LFZ') {
    // Price should be moving down toward demand zone
    return endPrice < startPrice;
  } else {
    // Price should be moving up toward supply zone
    return endPrice > startPrice;
  }
};

/**
 * Get trading implication
 * @param {string} compressionType - Type of compression
 * @param {string} zoneType - Zone type (LFZ/HFZ)
 * @returns {string} Trading implication
 */
const getCompressionImplication = (compressionType, zoneType) => {
  const implications = {
    descending_triangle: {
      LFZ: 'BULLISH - Sellers exhausted, bouncing từ demand likely',
      HFZ: 'CAUTION - May break through supply',
    },
    ascending_triangle: {
      LFZ: 'CAUTION - May break through demand',
      HFZ: 'BEARISH - Buyers exhausted, rejection từ supply likely',
    },
    descending_wedge: {
      LFZ: 'VERY BULLISH - Strong reversal pattern at demand',
      HFZ: 'NEUTRAL - Wait for zone reaction',
    },
    ascending_wedge: {
      LFZ: 'NEUTRAL - Wait for zone reaction',
      HFZ: 'VERY BEARISH - Strong reversal pattern at supply',
    },
    symmetrical: {
      LFZ: 'BULLISH - Follow zone type',
      HFZ: 'BEARISH - Follow zone type',
    },
  };

  return implications[compressionType]?.[zoneType] || 'Monitor zone reaction';
};

// ═══════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════

/**
 * Quick check for compression presence
 * @param {Array} candles - Candles
 * @param {Object} zone - Target zone
 * @returns {boolean} Whether compression exists
 */
export const hasCompressionApproach = (candles, zone) => {
  const result = detectCompression(candles, zone);
  return result !== null;
};

/**
 * Get compression type display name in Vietnamese
 * @param {string} type - Compression type
 * @returns {string} Display name
 */
export const getCompressionTypeName = (type) => {
  const names = {
    descending_triangle: 'Tam Giác Giảm',
    ascending_triangle: 'Tam Giác Tăng',
    descending_wedge: 'Falling Wedge',
    ascending_wedge: 'Rising Wedge',
    symmetrical: 'Tam Giác Đối Xứng',
    undefined_compression: 'Nén Giá',
  };
  return names[type] || 'Nén Giá';
};

/**
 * Get compression quality color
 * @param {string} quality - Quality rating
 * @returns {string} Color token
 */
export const getCompressionQualityColor = (quality) => {
  switch (quality) {
    case 'excellent':
      return 'gold';
    case 'good':
      return 'success';
    default:
      return 'warning';
  }
};

/**
 * Analyze compression with more detail
 * @param {Array} candles - Candles
 * @param {Object} zone - Target zone
 * @returns {Object} Detailed compression analysis
 */
export const analyzeCompressionDetail = (candles, zone, options = {}) => {
  const compression = detectCompression(candles, zone, options);

  if (!compression) {
    return {
      hasCompression: false,
      reason: 'No compression detected',
    };
  }

  // Calculate additional metrics
  const priceRange = candles[candles.length - 1].close - candles[0].close;
  const priceChangePercent = (priceRange / candles[0].close) * 100;

  // Calculate time span
  const startTime = candles[0].timestamp || candles[0].openTime;
  const endTime = candles[candles.length - 1].timestamp || candles[candles.length - 1].openTime;
  const timeSpanMs = endTime - startTime;
  const timeSpanHours = timeSpanMs / (1000 * 60 * 60);

  return {
    ...compression,
    analysis: {
      priceChangePercent: parseFloat(priceChangePercent.toFixed(2)),
      timeSpanHours: parseFloat(timeSpanHours.toFixed(1)),
      avgRangeReduction: compression.ranges.length > 1
        ? parseFloat(((compression.ranges[0].range - compression.ranges[compression.ranges.length - 1].range) / compression.ranges[0].range * 100).toFixed(1))
        : 0,
    },
    tradingNote: getTradingNote(compression, zone),
  };
};

/**
 * Get trading note for compression
 * @param {Object} compression - Compression result
 * @param {Object} zone - Target zone
 * @returns {string} Trading note
 */
const getTradingNote = (compression, zone) => {
  const { compressionType, compressionQuality } = compression;

  if (compressionQuality === 'excellent') {
    if (zone.zoneType === 'LFZ' && (compressionType === 'descending_triangle' || compressionType === 'descending_wedge')) {
      return 'A+ Setup: Excellent compression into demand zone. High probability bounce.';
    }
    if (zone.zoneType === 'HFZ' && (compressionType === 'ascending_triangle' || compressionType === 'ascending_wedge')) {
      return 'A+ Setup: Excellent compression into supply zone. High probability rejection.';
    }
  }

  if (compressionQuality === 'good') {
    return 'Good Setup: Compression detected. Wait for zone touch and confirmation.';
  }

  return 'Moderate Setup: Compression present but needs additional confirmation.';
};

// ═══════════════════════════════════════════════════════════
// DEFAULT EXPORT
// ═══════════════════════════════════════════════════════════

const compressionDetector = {
  detectCompression,
  hasCompressionApproach,
  getCompressionTypeName,
  getCompressionQualityColor,
  analyzeCompressionDetail,
};

export default compressionDetector;
