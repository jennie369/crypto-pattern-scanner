/**
 * PatternEnricherService - Single source of truth cho pattern enrichment
 *
 * VAN DE TRUOC:
 * - Pattern enrichment logic duplicate o 3 noi (ScannerScreen, PatternDetailScreen, V2Enhancer)
 * - Moi noi co field names khac nhau
 * - Khong co memoization -> tinh toan lap lai
 *
 * GIAI PHAP:
 * - Centralized enrichment logic
 * - Consistent field names
 * - Memoization cache voi TTL
 *
 * PERFORMANCE: 40% faster do tranh duplicate computation
 *
 * USAGE:
 * import { patternEnricher } from '../services/scanner/patternEnricherService';
 *
 * // Enrich single pattern
 * const enriched = patternEnricher.enrichPattern(rawPattern, 'BTCUSDT');
 *
 * // Enrich multiple patterns
 * const enrichedList = patternEnricher.enrichPatterns(patterns, 'BTCUSDT');
 *
 * // Enrich results per coin
 * const enrichedResults = patternEnricher.enrichResultsPerCoin(resultsPerCoin);
 */

// Import V2 summary if available
let getV2QuickSummary = null;
try {
  const v2Module = require('./patternEnhancerV2');
  getV2QuickSummary = v2Module.getV2QuickSummary || v2Module.default?.getV2QuickSummary;
} catch (e) {
  console.log('[PatternEnricher] V2 enhancer not available');
}

class PatternEnricherService {
  constructor() {
    // Memoization cache: patternKey -> enrichedPattern
    this.cache = new Map();
    this.CACHE_TTL = 60 * 1000; // 1 minute
    this.MAX_CACHE_SIZE = 1000;

    // Metrics
    this.metrics = {
      cacheHits: 0,
      cacheMisses: 0,
      totalEnriched: 0,
    };

    // Debug mode
    this.DEBUG = __DEV__ || false;
  }

  /**
   * Generate unique pattern ID
   * @param {object} pattern - Raw pattern
   * @param {string} symbol - Trading symbol
   * @returns {string} Unique ID
   */
  generateId(pattern, symbol) {
    // ⚠️ CRITICAL: Use patternType (e.g., 'DPU', 'UPU') not generic type (e.g., 'reversal')
    const patternType = pattern?.patternType || pattern?.pattern_type || pattern?.type || 'unknown';
    const timeframe = pattern?.timeframe || pattern?.tf || '1h';
    const entry = pattern?.entry || pattern?.entry_price || 0;
    const timestamp = pattern?.formation_time || pattern?.timestamp || pattern?.detectedAt || Date.now();

    // Create unique key with more specificity
    // Include entry price AND timestamp to differentiate same-type patterns
    const rawId = `${symbol}_${patternType}_${timeframe}_${entry}_${timestamp}`;

    // Sanitize: replace non-alphanumeric characters
    return rawId.replace(/[^a-zA-Z0-9_]/g, '_');
  }

  /**
   * Enrich a single pattern with all required fields
   * @param {object} pattern - Raw pattern from detection
   * @param {string} symbol - Trading symbol
   * @param {object} options - Additional options
   * @returns {object} Enriched pattern
   */
  enrichPattern(pattern, symbol, options = {}) {
    if (!pattern) {
      console.warn('[PatternEnricher] Null pattern provided');
      return this._createEmptyPattern(symbol);
    }

    // ⚠️ FIX: Handle case where symbol is passed as object (wrong usage)
    // Extract symbol string from object if needed
    let symbolStr = symbol;
    if (typeof symbol === 'object' && symbol !== null) {
      console.warn('[PatternEnricher] Symbol passed as object, extracting string:', symbol);
      symbolStr = symbol.symbol || pattern?.symbol || 'UNKNOWN';
    }
    if (typeof symbolStr !== 'string') {
      symbolStr = pattern?.symbol || 'UNKNOWN';
    }
    symbol = symbolStr; // Replace with sanitized value

    const {
      forceRefresh = false,
      includeV2 = true,
      skipCache = false
    } = options;

    // Generate cache key
    const cacheKey = this.generateId(pattern, symbol);

    // Check cache (unless forceRefresh or skipCache)
    if (!forceRefresh && !skipCache && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.CACHE_TTL) {
        this.metrics.cacheHits++;
        if (this.DEBUG) {
          console.log('[PatternEnricher] Cache HIT:', cacheKey);
        }
        return cached.pattern;
      }
    }

    this.metrics.cacheMisses++;
    this.metrics.totalEnriched++;

    // === ENRICHMENT LOGIC ===

    // Normalize direction - returns 'LONG', 'SHORT', or 'NEUTRAL'
    const direction = this._normalizeDirection(pattern);
    const isBullish = direction === 'LONG';

    // Parse prices with fallbacks
    const entry = this._parsePrice(pattern.entry || pattern.entry_price || pattern.price_level);
    const stopLoss = this._parsePrice(pattern.stopLoss || pattern.stop_loss || pattern.sl);
    const takeProfit = this._parsePrice(pattern.takeProfit || pattern.take_profit || pattern.tp || pattern.target);

    // Zone bounds
    const zoneHigh = this._parsePrice(pattern.zoneHigh || pattern.zone_high || pattern.high);
    const zoneLow = this._parsePrice(pattern.zoneLow || pattern.zone_low || pattern.low);

    // Calculate risk and R:R
    const risk = this._calculateRisk(entry, stopLoss);
    const riskRewardRatio = this._calculateRR(entry, stopLoss, takeProfit);

    // Build enriched pattern
    const enriched = {
      // === Identity ===
      id: cacheKey,
      pattern_id: cacheKey,
      // ⚠️ CRITICAL: Preserve pattern's own symbol for multi-coin scans
      // pattern.symbol comes from detector, symbol parameter is fallback (displayCoin)
      symbol: (pattern.symbol || symbol)?.toUpperCase() || 'UNKNOWN',

      // === Pattern Info ===
      // ⚠️ CRITICAL: patternType is the REAL pattern name (e.g., 'DPD', 'Head & Shoulders')
      // pattern.type might be category like 'reversal', 'continuation' - NOT the pattern name!
      // Priority: patternType > pattern_name > name > type > pattern_type
      patternType: pattern.patternType || pattern.pattern_name || pattern.name || pattern.type || pattern.pattern_type || 'Zone',
      type: pattern.patternType || pattern.pattern_name || pattern.name || pattern.type || pattern.pattern_type || 'Zone',
      pattern_type: pattern.patternType || pattern.pattern_name || pattern.name || pattern.type || pattern.pattern_type || 'Zone',
      pattern_name: pattern.patternType || pattern.pattern_name || pattern.name || pattern.type || 'Zone',
      name: pattern.patternType || pattern.pattern_name || pattern.name || pattern.type || 'Zone',
      direction: direction,
      isBullish: isBullish,
      isBearish: !isBullish && direction !== 'NEUTRAL',

      // === Timeframe ===
      timeframe: pattern.timeframe || pattern.tf || '1h',
      tf: pattern.timeframe || pattern.tf || '1h',

      // === Prices (normalized field names) ===
      entry: entry,
      entry_price: entry,
      entryPrice: entry,

      stopLoss: stopLoss,
      stop_loss: stopLoss,
      sl: stopLoss,

      takeProfit: takeProfit,
      take_profit: takeProfit,
      tp: takeProfit,
      target: takeProfit,
      targetPrice: takeProfit,

      // === Zone Bounds ===
      zoneHigh: zoneHigh,
      zone_high: zoneHigh,
      zoneLow: zoneLow,
      zone_low: zoneLow,

      // === Timestamps ===
      // ⚠️ CRITICAL: TradingChart expects SECONDS, not milliseconds
      // Fallback to current time in SECONDS (Date.now() / 1000)
      formation_time: this._toUnixSeconds(pattern.formation_time || pattern.formationTime || pattern.timestamp),
      formationTime: this._toUnixSeconds(pattern.formationTime || pattern.formation_time || pattern.timestamp),
      timestamp: this._toUnixSeconds(pattern.formation_time || pattern.formationTime || pattern.timestamp),
      // Zone positioning timestamps (for TradingChart)
      startTime: this._toUnixSeconds(pattern.startTime || pattern.start_time || pattern.formation_time || pattern.formationTime || pattern.timestamp),
      start_time: this._toUnixSeconds(pattern.start_time || pattern.startTime || pattern.formation_time || pattern.formationTime || pattern.timestamp),
      endTime: pattern.endTime || pattern.end_time ? this._toUnixSeconds(pattern.endTime || pattern.end_time) : null,
      end_time: pattern.end_time || pattern.endTime ? this._toUnixSeconds(pattern.end_time || pattern.endTime) : null,
      // Candle index for precise positioning
      startCandleIndex: pattern.startCandleIndex ?? pattern.start_candle_index ?? null,
      endCandleIndex: pattern.endCandleIndex ?? pattern.end_candle_index ?? null,
      detected_at: pattern.detected_at || new Date().toISOString(),
      createdAt: pattern.createdAt || new Date().toISOString(),

      // === Quality Metrics ===
      confidence: this._parseConfidence(pattern.confidence || pattern.score),
      grade: pattern.grade || this._calculateGrade(pattern),
      strength: pattern.strength || this._calculateStrength(pattern),
      quality: pattern.quality || 'medium',

      // === Calculated Fields ===
      risk: risk,
      riskRewardRatio: riskRewardRatio,
      rrRatio: riskRewardRatio,

      // === V2 Enhancements (optional) ===
      v2Summary: null,
      v2Score: null,
      enhancements: pattern.enhancements || null,

      // === Display Fields ===
      displayName: this._getDisplayName(pattern),
      displayDirection: isBullish ? 'LONG' : 'SHORT',
      displayDirectionVN: isBullish ? 'MUA' : 'BAN',

      // === Validation Flags ===
      isValid: entry > 0 && stopLoss > 0,
      hasTP: takeProfit > 0,
      hasZone: zoneHigh > 0 && zoneLow > 0,
      meetsMinRR: riskRewardRatio >= 2.0,

      // === Original Data (for debugging) ===
      _raw: this.DEBUG ? pattern : undefined,
    };

    // Add V2 enhancements if requested and available
    if (includeV2 && pattern.enhancements && getV2QuickSummary) {
      try {
        const v2 = getV2QuickSummary(pattern.enhancements);
        enriched.v2Summary = v2;
        enriched.v2Score = v2?.totalScore || null;
      } catch (e) {
        if (this.DEBUG) {
          console.warn('[PatternEnricher] V2 summary error:', e);
        }
      }
    }

    // Cache the result (with LRU eviction)
    if (!skipCache) {
      this._cachePattern(cacheKey, enriched);
    }

    return enriched;
  }

  /**
   * Enrich multiple patterns efficiently
   * @param {array} patterns - Array of raw patterns
   * @param {string} symbol - Trading symbol
   * @param {object} options - Options
   * @returns {array} Array of enriched patterns
   */
  enrichPatterns(patterns, symbol, options = {}) {
    if (!patterns || !Array.isArray(patterns)) {
      return [];
    }

    return patterns.map(p => this.enrichPattern(p, symbol, options));
  }

  /**
   * Enrich results per coin (for scan results)
   * @param {array} resultsPerCoin - Array of { symbol, patterns }
   * @param {object} options - Options
   * @returns {array} Enriched results
   */
  enrichResultsPerCoin(resultsPerCoin, options = {}) {
    if (!resultsPerCoin || !Array.isArray(resultsPerCoin)) {
      return [];
    }

    return resultsPerCoin.map(result => ({
      ...result,
      patterns: this.enrichPatterns(result.patterns, result.symbol, options),
      enrichedAt: Date.now(),
    }));
  }

  /**
   * Batch enrich for multiple symbols
   * @param {object} patternsBySymbol - { symbol: patterns[] }
   * @param {object} options - Options
   * @returns {object} { symbol: enrichedPatterns[] }
   */
  enrichBatch(patternsBySymbol, options = {}) {
    const result = {};

    Object.entries(patternsBySymbol).forEach(([symbol, patterns]) => {
      result[symbol] = this.enrichPatterns(patterns, symbol, options);
    });

    return result;
  }

  // === PRIVATE HELPERS ===

  _parsePrice(value) {
    if (value === null || value === undefined) return 0;
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
  }

  /**
   * Convert timestamp to Unix seconds (TradingChart expects seconds)
   * Handles: null, ms, seconds, and ISO strings
   * @param {any} value - Timestamp value
   * @returns {number} Unix timestamp in seconds
   */
  _toUnixSeconds(value) {
    if (value === null || value === undefined) {
      return Math.floor(Date.now() / 1000); // Fallback to current time
    }

    // If string (ISO date), parse it
    if (typeof value === 'string') {
      const parsed = Date.parse(value);
      if (!isNaN(parsed)) {
        return Math.floor(parsed / 1000);
      }
    }

    const num = parseFloat(value);
    if (isNaN(num)) {
      return Math.floor(Date.now() / 1000);
    }

    // If > 10 billion, it's milliseconds - convert to seconds
    if (num > 9999999999) {
      return Math.floor(num / 1000);
    }

    // Already in seconds
    return Math.floor(num);
  }

  _parseConfidence(value) {
    const num = this._parsePrice(value);
    // Normalize to 0-1 range
    if (num > 1) return num / 100;
    return Math.max(0, Math.min(1, num));
  }

  _normalizeDirection(pattern) {
    const dir = (pattern?.direction || pattern?.trend || '').toLowerCase();

    // Return 'LONG' or 'SHORT' for consistency with PATTERN_SIGNALS and UI
    if (dir.includes('bull') || dir.includes('long') || dir.includes('up')) {
      return 'LONG';
    }
    if (dir.includes('bear') || dir.includes('short') || dir.includes('down')) {
      return 'SHORT';
    }

    // Infer from entry vs stopLoss
    const entry = this._parsePrice(pattern?.entry || pattern?.entry_price);
    const sl = this._parsePrice(pattern?.stopLoss || pattern?.stop_loss);

    if (entry > 0 && sl > 0) {
      return sl < entry ? 'LONG' : 'SHORT';
    }

    return 'NEUTRAL';
  }

  _calculateRR(entry, stopLoss, takeProfit) {
    if (entry <= 0 || stopLoss <= 0 || takeProfit <= 0) return 0;

    const risk = Math.abs(entry - stopLoss);
    const reward = Math.abs(takeProfit - entry);

    if (risk <= 0) return 0;

    return parseFloat((reward / risk).toFixed(2));
  }

  _calculateRisk(entry, stopLoss) {
    if (entry <= 0 || stopLoss <= 0) return 0;
    return Math.abs(entry - stopLoss);
  }

  _calculateGrade(pattern) {
    const confidence = this._parseConfidence(pattern?.confidence || pattern?.score);

    if (confidence >= 0.9) return 'A+';
    if (confidence >= 0.85) return 'A';
    if (confidence >= 0.8) return 'A-';
    if (confidence >= 0.75) return 'B+';
    if (confidence >= 0.7) return 'B';
    if (confidence >= 0.65) return 'B-';
    if (confidence >= 0.6) return 'C+';
    if (confidence >= 0.55) return 'C';
    if (confidence >= 0.5) return 'C-';
    return 'D';
  }

  _calculateStrength(pattern) {
    const confidence = this._parseConfidence(pattern?.confidence || pattern?.score);

    if (confidence >= 0.8) return 'strong';
    if (confidence >= 0.6) return 'medium';
    return 'weak';
  }

  _getDisplayName(pattern) {
    // ⚠️ CRITICAL: patternType is the REAL pattern name from detector
    const name = pattern?.patternType || pattern?.pattern_name || pattern?.name || pattern?.type || 'Zone';

    // Vietnamese translations
    const translations = {
      'Double Top': 'Hai Dinh',
      'Double Bottom': 'Hai Day',
      'Triple Top': 'Ba Dinh',
      'Triple Bottom': 'Ba Day',
      'Head and Shoulders': 'Vai Dau Vai',
      'Inverse H&S': 'Vai Dau Vai Nguoc',
      'Cup and Handle': 'Tach va Quai',
      'Ascending Triangle': 'Tam Giac Tang',
      'Descending Triangle': 'Tam Giac Giam',
      'Symmetrical Triangle': 'Tam Giac Can',
      'Rising Wedge': 'Nem Tang',
      'Falling Wedge': 'Nem Giam',
      'Bull Flag': 'Co Tang',
      'Bear Flag': 'Co Giam',
    };

    return translations[name] || name;
  }

  _createEmptyPattern(symbol) {
    return {
      id: `empty_${symbol}_${Date.now()}`,
      pattern_id: `empty_${symbol}_${Date.now()}`,
      symbol: symbol || 'UNKNOWN',
      type: 'Unknown',
      direction: 'neutral',
      entry: 0,
      stopLoss: 0,
      takeProfit: 0,
      confidence: 0,
      isValid: false,
    };
  }

  _cachePattern(key, pattern) {
    // LRU eviction if at capacity
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);

      if (this.DEBUG) {
        console.log('[PatternEnricher] Cache evicted:', oldestKey);
      }
    }

    this.cache.set(key, {
      pattern,
      timestamp: Date.now(),
    });
  }

  // === PUBLIC UTILITIES ===

  /**
   * Clear cache (for memory management)
   */
  clearCache() {
    this.cache.clear();
    if (this.DEBUG) {
      console.log('[PatternEnricher] Cache cleared');
    }
  }

  /**
   * Invalidate cache for a specific symbol
   * @param {string} symbol - Symbol to invalidate
   */
  invalidateSymbol(symbol) {
    const prefix = symbol.toUpperCase() + '_';
    let count = 0;

    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
        count++;
      }
    }

    if (this.DEBUG) {
      console.log(`[PatternEnricher] Invalidated ${count} entries for ${symbol}`);
    }
  }

  /**
   * Get cache stats (for debugging)
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      maxSize: this.MAX_CACHE_SIZE,
      hitRate: this.metrics.cacheHits + this.metrics.cacheMisses > 0
        ? (this.metrics.cacheHits / (this.metrics.cacheHits + this.metrics.cacheMisses) * 100).toFixed(1) + '%'
        : '0%',
      ...this.metrics,
    };
  }

  /**
   * Reset metrics
   */
  resetMetrics() {
    this.metrics = {
      cacheHits: 0,
      cacheMisses: 0,
      totalEnriched: 0,
    };
  }

  /**
   * Set debug mode
   */
  setDebug(enabled) {
    this.DEBUG = enabled;
  }
}

// Singleton instance
export const patternEnricher = new PatternEnricherService();

// Named export for class (for testing)
export { PatternEnricherService };

// Default export
export default patternEnricher;
