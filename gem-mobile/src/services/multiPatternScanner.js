/**
 * GEM Mobile - Multi-Pattern Scanner Service
 * Scans for multiple patterns simultaneously and creates zones
 *
 * Features:
 * - Scan all allowed patterns for user's tier
 * - Enrich patterns with zone data
 * - Calculate odds score
 * - Deduplicate overlapping patterns
 * - Sort by grade/confidence
 */

import { binanceService } from './binanceService';
import { detectAllPatterns } from './patternDetection';
import { zoneManager, ZONE_TYPE } from './zoneManager';
import tierAccessService from './tierAccessService';
import { TIER_FEATURES } from '../constants/tierFeatures';

// ============================================================
// CONSTANTS
// ============================================================

/**
 * Minimum confidence threshold for patterns
 */
const MIN_CONFIDENCE = 70;

/**
 * Maximum patterns per scan (before tier limit)
 */
const MAX_PATTERNS_PER_SCAN = 20;

/**
 * Lookback candles for pattern detection
 */
const LOOKBACK_CANDLES = 200;

/**
 * Price overlap threshold for deduplication (%)
 */
const OVERLAP_THRESHOLD = 0.02; // 2%

/**
 * Pattern type to zone type mapping
 */
const PATTERN_TO_ZONE_TYPE = {
  // LONG patterns → LFZ (Demand/Support)
  'UPU': ZONE_TYPE.LFZ,
  'DPU': ZONE_TYPE.LFZ,
  'Double Bottom': ZONE_TYPE.LFZ,
  'Inverse H&S': ZONE_TYPE.LFZ,
  'Ascending Triangle': ZONE_TYPE.LFZ,
  'LFZ': ZONE_TYPE.LFZ,
  'Rounding Bottom': ZONE_TYPE.LFZ,
  'Falling Wedge': ZONE_TYPE.LFZ,
  'Bull Flag': ZONE_TYPE.LFZ,
  'Triple Bottom': ZONE_TYPE.LFZ,

  // SHORT patterns → HFZ (Supply/Resistance)
  'DPD': ZONE_TYPE.HFZ,
  'UPD': ZONE_TYPE.HFZ,
  'Double Top': ZONE_TYPE.HFZ,
  'Head & Shoulders': ZONE_TYPE.HFZ,
  'Descending Triangle': ZONE_TYPE.HFZ,
  'HFZ': ZONE_TYPE.HFZ,
  'Rounding Top': ZONE_TYPE.HFZ,
  'Rising Wedge': ZONE_TYPE.HFZ,
  'Bear Flag': ZONE_TYPE.HFZ,
  'Triple Top': ZONE_TYPE.HFZ,
};

/**
 * Grade to score mapping for sorting
 */
const GRADE_SCORE = {
  'A+': 100,
  'A': 90,
  'B+': 80,
  'B': 70,
  'C+': 60,
  'C': 50,
  'D': 40,
  'F': 0,
};

// ============================================================
// MULTI-PATTERN SCANNER
// ============================================================

class MultiPatternScanner {
  constructor() {
    this.lastScanResults = new Map();
    this.scanInProgress = new Map();
  }

  /**
   * Scan for ALL allowed patterns on a symbol/timeframe
   * @param {string} symbol - Trading pair (e.g., 'BTCUSDT')
   * @param {string} timeframe - Timeframe (e.g., '1h', '4h')
   * @param {string} userTier - User's tier
   * @param {Object} options - Scan options
   * @returns {Promise<Object>} Scan results with patterns and zones
   */
  async scanAllPatterns(symbol, timeframe, userTier, options = {}) {
    const {
      userId = null,
      includeEnhancements = true,
      minConfidence = MIN_CONFIDENCE,
      maxPatterns = MAX_PATTERNS_PER_SCAN,
      createZones = true,
    } = options;

    const scanKey = `${symbol}_${timeframe}`;

    // Prevent duplicate scans
    if (this.scanInProgress.get(scanKey)) {
      console.log('[MultiPatternScanner] Scan already in progress for:', scanKey);
      return this.lastScanResults.get(scanKey) || { patterns: [], zones: [] };
    }

    this.scanInProgress.set(scanKey, true);

    try {
      console.log(`[MultiPatternScanner] Scanning ${symbol} ${timeframe} for patterns...`);

      // 1. Fetch candles
      const candles = await this._fetchCandles(symbol, timeframe, LOOKBACK_CANDLES);
      if (!candles || candles.length < 50) {
        console.warn('[MultiPatternScanner] Not enough candles for pattern detection');
        return { patterns: [], zones: [], error: 'Insufficient data' };
      }

      // 2. Get allowed patterns for tier
      const allowedPatterns = tierAccessService.getAllowedPatterns();
      console.log(`[MultiPatternScanner] Tier ${userTier} allows ${allowedPatterns.length} patterns`);

      // 3. Detect patterns
      const detectedPatterns = await this._detectPatterns(
        symbol,
        timeframe,
        candles,
        allowedPatterns,
        userTier,
        includeEnhancements
      );

      // 4. Filter by confidence
      const filteredPatterns = detectedPatterns.filter(p =>
        (p.confidence || p.score || 0) >= minConfidence
      );

      // 5. Enrich with zone data
      const enrichedPatterns = this._enrichWithZoneData(filteredPatterns, candles);

      // 6. Calculate odds score (TIER2+)
      const scoredPatterns = this._calculateOddsScore(enrichedPatterns, userTier);

      // 7. Deduplicate overlapping patterns
      const uniquePatterns = this._deduplicatePatterns(scoredPatterns);

      // 8. Sort by grade/confidence
      const sortedPatterns = this._sortPatterns(uniquePatterns);

      // 9. Apply tier limit
      const tierConfig = TIER_FEATURES[userTier] || TIER_FEATURES.FREE;
      const tierMaxPatterns = tierConfig.maxPatterns || 3;
      const limitedPatterns = sortedPatterns.slice(0, Math.min(maxPatterns, tierMaxPatterns));

      // 10. Create zones if enabled and user has tier access
      let zones = [];
      if (createZones && userId && tierAccessService.isZoneVisualizationEnabled()) {
        zones = await zoneManager.createZonesFromPatterns(
          limitedPatterns,
          symbol,
          timeframe,
          userId
        );
      }

      const result = {
        patterns: limitedPatterns,
        zones,
        totalDetected: detectedPatterns.length,
        filtered: filteredPatterns.length,
        displayed: limitedPatterns.length,
        scanTime: new Date().toISOString(),
        symbol,
        timeframe,
        tier: userTier,
      };

      // Cache results
      this.lastScanResults.set(scanKey, result);

      console.log(`[MultiPatternScanner] Found ${limitedPatterns.length} patterns, created ${zones.length} zones`);

      return result;

    } catch (error) {
      console.error('[MultiPatternScanner] Scan error:', error);
      return { patterns: [], zones: [], error: error.message };

    } finally {
      this.scanInProgress.set(scanKey, false);
    }
  }

  /**
   * Scan for a single pattern type (backward compatible)
   * @param {string} symbol - Trading pair
   * @param {string} timeframe - Timeframe
   * @param {string} patternType - Pattern type to scan
   * @param {string} userTier - User's tier
   * @returns {Promise<Object>} Scan results
   */
  async scanPattern(symbol, timeframe, patternType, userTier) {
    // Check if pattern is allowed for tier
    if (!tierAccessService.isPatternAllowed(patternType)) {
      console.warn(`[MultiPatternScanner] Pattern ${patternType} not allowed for tier ${userTier}`);
      return { patterns: [], error: 'Pattern not allowed for your tier' };
    }

    const result = await this.scanAllPatterns(symbol, timeframe, userTier, {
      maxPatterns: 5,
      createZones: false,
    });

    // Filter to only the requested pattern type
    const filtered = result.patterns.filter(p =>
      (p.name === patternType || p.type === patternType)
    );

    return {
      ...result,
      patterns: filtered,
      displayed: filtered.length,
    };
  }

  /**
   * Fetch candles from Binance
   * @private
   */
  async _fetchCandles(symbol, timeframe, limit) {
    try {
      const candles = await binanceService.getCandles(symbol, timeframe, limit);
      return candles;
    } catch (error) {
      console.error('[MultiPatternScanner] Error fetching candles:', error);
      return null;
    }
  }

  /**
   * Detect patterns using patternDetection service
   * @private
   */
  async _detectPatterns(symbol, timeframe, candles, allowedPatterns, userTier, includeEnhancements) {
    try {
      // Use existing pattern detection
      const patterns = await detectAllPatterns(candles, {
        symbol,
        timeframe,
        patternTypes: allowedPatterns,
        includeEnhancements: includeEnhancements && tierAccessService.hasFeature('qualityFiltering'),
        tier: userTier,
      });

      return patterns || [];
    } catch (error) {
      console.error('[MultiPatternScanner] Error detecting patterns:', error);
      return [];
    }
  }

  /**
   * Enrich patterns with zone boundaries
   * @private
   */
  _enrichWithZoneData(patterns, candles) {
    return patterns.map(pattern => {
      // Extract candle indexes from pattern.points
      const candleIndexes = this._extractCandleIndexes(pattern, candles);

      // Calculate zone boundaries if not present
      const zoneData = (!pattern.zoneHigh || !pattern.zoneLow)
        ? this._calculateZoneBoundaries(pattern, candles)
        : {};

      // Get timestamps from candles (candles use 'timestamp' property, not 'time')
      const startCandle = candles[candleIndexes.start];
      const endCandle = candles[candleIndexes.end];

      // Convert to seconds for lightweight-charts (it uses Unix seconds, not milliseconds)
      const startTime = startCandle?.timestamp ? Math.floor(startCandle.timestamp / 1000) : null;
      const endTime = endCandle?.timestamp ? Math.floor(endCandle.timestamp / 1000) : null;

      console.log(`[MultiPatternScanner] Pattern ${pattern.patternType}: startIdx=${candleIndexes.start}, endIdx=${candleIndexes.end}, startTime=${startTime}, endTime=${endTime}`);

      return {
        ...pattern,
        ...zoneData,
        startCandleIndex: candleIndexes.start,
        endCandleIndex: candleIndexes.end,
        startTime,
        endTime,
      };
    });
  }

  /**
   * Extract start/end candle indexes from pattern points
   * @private
   * @param {Object} pattern - Pattern object
   * @param {Array} candles - Candle data array
   * @returns {Object} { start, end } candle indexes
   */
  _extractCandleIndexes(pattern, candles) {
    const indexes = [];

    // Collect all indexes from pattern.points
    if (pattern.points) {
      Object.values(pattern.points).forEach(point => {
        if (point?.index !== undefined && point.index !== null) {
          indexes.push(point.index);
        }
      });
    }

    // Also check pattern.startIndex / endIndex if available
    if (pattern.startIndex !== undefined) indexes.push(pattern.startIndex);
    if (pattern.endIndex !== undefined) indexes.push(pattern.endIndex);

    // Check pattern.formationIndex
    if (pattern.formationIndex !== undefined) indexes.push(pattern.formationIndex);

    // Fallback to lookback calculation if no indexes found
    if (indexes.length === 0) {
      const lookback = pattern.lookbackBars || pattern.lookback || 10;
      const candleCount = candles?.length || 100;
      return {
        start: Math.max(0, candleCount - lookback - 5),
        end: Math.max(0, candleCount - 1),
      };
    }

    return {
      start: Math.min(...indexes),
      end: Math.max(...indexes),
    };
  }

  /**
   * Calculate zone boundaries from pattern data
   * @private
   */
  _calculateZoneBoundaries(pattern, candles) {
    const entry = pattern.entry || pattern.price;
    const stop = pattern.stopLoss || pattern.stop;
    const direction = pattern.direction || pattern.signalType;

    if (!entry) {
      return { zoneHigh: 0, zoneLow: 0 };
    }

    // Get recent candles for ATR calculation
    const recentCandles = candles.slice(-14);
    const atr = this._calculateATR(recentCandles);

    // Zone width based on ATR (0.5x - 1.5x ATR)
    const zoneWidth = atr * 0.75;

    let zoneHigh, zoneLow;

    if (direction === 'LONG') {
      // LFZ: Zone below entry
      zoneLow = stop || (entry - zoneWidth);
      zoneHigh = entry;
    } else {
      // HFZ: Zone above entry
      zoneHigh = stop || (entry + zoneWidth);
      zoneLow = entry;
    }

    // Determine zone type
    const zoneType = PATTERN_TO_ZONE_TYPE[pattern.name] ||
      (direction === 'LONG' ? ZONE_TYPE.LFZ : ZONE_TYPE.HFZ);

    return {
      zoneHigh,
      zoneLow,
      zoneType,
      zoneWidth,
    };
  }

  /**
   * Calculate ATR (Average True Range)
   * @private
   */
  _calculateATR(candles) {
    if (!candles || candles.length < 2) return 0;

    let trSum = 0;
    for (let i = 1; i < candles.length; i++) {
      const high = parseFloat(candles[i].high);
      const low = parseFloat(candles[i].low);
      const prevClose = parseFloat(candles[i - 1].close);

      const tr = Math.max(
        high - low,
        Math.abs(high - prevClose),
        Math.abs(low - prevClose)
      );
      trSum += tr;
    }

    return trSum / (candles.length - 1);
  }

  /**
   * Calculate odds score based on pattern characteristics
   * @private
   */
  _calculateOddsScore(patterns, userTier) {
    // Only calculate for TIER2+
    if (!tierAccessService.hasFeature('qualityFiltering')) {
      return patterns;
    }

    return patterns.map(pattern => {
      let score = pattern.confidence || pattern.score || 50;

      // Add bonuses for various factors
      const bonuses = {
        volumeConfirmed: pattern.volumeConfirmed ? 5 : 0,
        trendAligned: pattern.trendAligned ? 5 : 0,
        retestValid: pattern.retestValid ? 8 : 0,
        srConfluence: pattern.srConfluence ? 6 : 0,
        candleConfirmed: pattern.candleConfirmed ? 4 : 0,
        rsiDivergence: pattern.rsiDivergence ? 7 : 0,
      };

      const totalBonus = Object.values(bonuses).reduce((sum, b) => sum + b, 0);
      score = Math.min(100, score + totalBonus);

      // Calculate odds enhancer score (OE)
      let oeScore = 0;
      if (pattern.grade) {
        oeScore = GRADE_SCORE[pattern.grade] || 50;
      }

      return {
        ...pattern,
        oddsScore: score,
        oeScore,
        bonuses,
      };
    });
  }

  /**
   * Deduplicate overlapping patterns
   * @private
   */
  _deduplicatePatterns(patterns) {
    if (!patterns || patterns.length <= 1) return patterns;

    const unique = [];
    const processed = new Set();

    // Sort by score first
    const sorted = [...patterns].sort((a, b) =>
      (b.oddsScore || b.confidence || 0) - (a.oddsScore || a.confidence || 0)
    );

    for (const pattern of sorted) {
      const key = this._getPatternKey(pattern);

      if (processed.has(key)) continue;

      // Check for overlapping patterns
      const isOverlapping = unique.some(existing =>
        this._patternsOverlap(pattern, existing)
      );

      if (!isOverlapping) {
        unique.push(pattern);
        processed.add(key);
      }
    }

    return unique;
  }

  /**
   * Generate unique key for pattern
   * @private
   */
  _getPatternKey(pattern) {
    const price = Math.round((pattern.entry || pattern.price || 0) * 100);
    return `${pattern.name}_${pattern.direction}_${price}`;
  }

  /**
   * Check if two patterns overlap in price
   * @private
   */
  _patternsOverlap(p1, p2) {
    const price1 = p1.entry || p1.price || 0;
    const price2 = p2.entry || p2.price || 0;

    if (price1 === 0 || price2 === 0) return false;

    // Check if same direction
    if (p1.direction !== p2.direction) return false;

    // Check price overlap
    const priceDiff = Math.abs(price1 - price2) / Math.max(price1, price2);
    return priceDiff < OVERLAP_THRESHOLD;
  }

  /**
   * Sort patterns by grade then confidence
   * @private
   */
  _sortPatterns(patterns) {
    return [...patterns].sort((a, b) => {
      // Sort by grade first
      const gradeA = GRADE_SCORE[a.grade] || 50;
      const gradeB = GRADE_SCORE[b.grade] || 50;

      if (gradeA !== gradeB) return gradeB - gradeA;

      // Then by odds score
      const scoreA = a.oddsScore || a.confidence || 0;
      const scoreB = b.oddsScore || b.confidence || 0;

      return scoreB - scoreA;
    });
  }

  /**
   * Get cached scan results
   * @param {string} symbol - Trading pair
   * @param {string} timeframe - Timeframe
   * @returns {Object|null} Cached results
   */
  getCachedResults(symbol, timeframe) {
    const scanKey = `${symbol}_${timeframe}`;
    return this.lastScanResults.get(scanKey) || null;
  }

  /**
   * Clear scan cache
   */
  clearCache() {
    this.lastScanResults.clear();
    this.scanInProgress.clear();
  }

  /**
   * Check if scan is in progress
   * @param {string} symbol - Trading pair
   * @param {string} timeframe - Timeframe
   * @returns {boolean}
   */
  isScanInProgress(symbol, timeframe) {
    const scanKey = `${symbol}_${timeframe}`;
    return this.scanInProgress.get(scanKey) || false;
  }
}

// Export singleton instance
export const multiPatternScanner = new MultiPatternScanner();
export default multiPatternScanner;
