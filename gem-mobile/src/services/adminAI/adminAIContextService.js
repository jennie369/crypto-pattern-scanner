/**
 * GEM AI Trading Brain - Context Service
 * Builds comprehensive context for AI prompts
 *
 * Aggregates:
 * - Market data (price, trend, indicators)
 * - Pattern data (detected patterns, confidence)
 * - Zone data (active zones, freshness)
 * - Position data (open positions, P&L)
 * - Chart context (timeframe, visible range)
 */

import { adminAIMarketService } from './adminAIMarketService';
import { adminAIPositionService } from './adminAIPositionService';

// ═══════════════════════════════════════════════════════════
// CONTEXT TYPES
// ═══════════════════════════════════════════════════════════
export const CONTEXT_TYPES = {
  MARKET: 'market',
  PATTERN: 'pattern',
  ZONE: 'zone',
  POSITION: 'position',
  CHART: 'chart',
  FULL: 'full',
};

class AdminAIContextService {
  constructor() {
    this.lastContext = null;
    this.contextCache = new Map();
    this.cacheTimeout = 10000; // 10 seconds cache
  }

  // ═══════════════════════════════════════════════════════════
  // BUILD CONTEXT
  // ═══════════════════════════════════════════════════════════

  /**
   * Build comprehensive context for AI
   * @param {Object} options - Context options
   * @param {string} options.symbol - Trading pair
   * @param {string} options.timeframe - Chart timeframe
   * @param {number} options.currentPrice - Current price
   * @param {Array} options.patterns - Detected patterns
   * @param {Array} options.zones - Active zones
   * @param {Array} options.scanResults - Scan results
   * @param {string} options.userId - User ID for positions
   * @param {Array} options.types - Which context types to include
   * @returns {Promise<Object>} Complete context object
   */
  async buildContext(options = {}) {
    const {
      symbol = 'BTCUSDT',
      timeframe = '4h',
      currentPrice,
      patterns = [],
      zones = [],
      scanResults = [],
      userId,
      types = ['market', 'pattern', 'zone', 'position'],
    } = options;

    const context = {
      timestamp: Date.now(),
      symbol,
      timeframe,
      currentPrice,
    };

    try {
      // Build each context type in parallel where possible
      const buildPromises = [];

      if (types.includes('market')) {
        buildPromises.push(
          this._buildMarketContext(symbol, timeframe, currentPrice)
            .then((data) => { context.market = data; })
        );
      }

      if (types.includes('position') && userId) {
        buildPromises.push(
          this._buildPositionContext(userId, currentPrice ? { [symbol]: currentPrice } : {})
            .then((data) => { context.position = data; })
        );
      }

      await Promise.all(buildPromises);

      // Build synchronous contexts
      if (types.includes('pattern')) {
        context.pattern = this._buildPatternContext(patterns, scanResults);
      }

      if (types.includes('zone')) {
        context.zone = this._buildZoneContext(zones, currentPrice);
      }

      this.lastContext = context;
      return context;
    } catch (error) {
      console.error('[AdminAIContext] buildContext error:', error);
      return {
        ...context,
        error: error.message,
      };
    }
  }

  /**
   * Build market context
   * @private
   */
  async _buildMarketContext(symbol, timeframe, currentPrice) {
    try {
      const snapshot = await adminAIMarketService.getMarketSnapshot(symbol, timeframe);
      const candles = await adminAIMarketService.getRecentCandles(symbol, timeframe, 10);

      // Analyze last candle
      const lastCandle = candles[candles.length - 1];
      const lastCandleAnalysis = lastCandle
        ? adminAIMarketService.analyzeCandle(lastCandle)
        : null;

      // Detect multi-candle patterns
      const candlePatterns = adminAIMarketService.detectMultiCandlePatterns(candles);

      return {
        price: currentPrice || snapshot.price,
        change24h: snapshot.change24h,
        high24h: snapshot.high24h,
        low24h: snapshot.low24h,
        volume24h: snapshot.volume24h,
        trend: snapshot.trend,
        indicators: snapshot.indicators,
        lastCandle: lastCandleAnalysis,
        candlePatterns,
        recentCandles: candles.slice(-5).map((c) => ({
          open: c.open,
          high: c.high,
          low: c.low,
          close: c.close,
          isBullish: c.close > c.open,
        })),
      };
    } catch (error) {
      console.error('[AdminAIContext] _buildMarketContext error:', error);
      return { error: error.message };
    }
  }

  /**
   * Build pattern context
   * @private
   */
  _buildPatternContext(patterns, scanResults) {
    // Process detected patterns
    const processedPatterns = patterns.map((p) => ({
      name: p.name || p.patternName,
      direction: p.direction,
      confidence: p.confidence || p.score,
      type: p.type,
      entryPrice: p.entryPrice,
      stopLoss: p.stopLoss,
      takeProfit: p.takeProfit,
      riskReward: p.riskReward || p.rr,
      zoneType: p.zoneType,
      zoneStatus: p.zoneStatus,
    }));

    // Process scan results
    const processedScanResults = scanResults.map((r) => ({
      symbol: r.symbol,
      pattern: r.patternName || r.pattern,
      direction: r.direction,
      confidence: r.confidence || r.score,
      timeframe: r.timeframe,
    }));

    // Summary statistics
    const longPatterns = processedPatterns.filter((p) => p.direction === 'LONG');
    const shortPatterns = processedPatterns.filter((p) => p.direction === 'SHORT');
    const highConfidence = processedPatterns.filter((p) => (p.confidence || 0) >= 75);

    return {
      patterns: processedPatterns,
      scanResults: processedScanResults,
      summary: {
        total: processedPatterns.length,
        longCount: longPatterns.length,
        shortCount: shortPatterns.length,
        highConfidenceCount: highConfidence.length,
        dominantDirection: longPatterns.length > shortPatterns.length ? 'LONG' :
                          shortPatterns.length > longPatterns.length ? 'SHORT' : 'NEUTRAL',
      },
    };
  }

  /**
   * Build zone context
   * @private
   */
  _buildZoneContext(zones, currentPrice) {
    if (!zones || zones.length === 0) {
      return {
        zones: [],
        nearestZone: null,
        summary: { total: 0, hfzCount: 0, lfzCount: 0 },
      };
    }

    // Process zones
    const processedZones = zones.map((z) => {
      const zoneHigh = z.high || z.priceHigh;
      const zoneLow = z.low || z.priceLow;
      const zoneCenter = (zoneHigh + zoneLow) / 2;

      // Calculate distance from current price
      let distance = null;
      let position = 'unknown';
      if (currentPrice) {
        if (currentPrice > zoneHigh) {
          distance = ((currentPrice - zoneHigh) / currentPrice) * 100;
          position = 'above';
        } else if (currentPrice < zoneLow) {
          distance = ((zoneLow - currentPrice) / currentPrice) * 100;
          position = 'below';
        } else {
          distance = 0;
          position = 'inside';
        }
      }

      return {
        id: z.id,
        type: z.type || (z.isResistance ? 'HFZ' : 'LFZ'),
        high: zoneHigh,
        low: zoneLow,
        center: zoneCenter,
        width: ((zoneHigh - zoneLow) / zoneLow) * 100,
        touches: z.touches || z.touchCount || 0,
        freshness: this._getZoneFreshness(z.touches || z.touchCount || 0),
        distance: distance !== null ? parseFloat(distance.toFixed(2)) : null,
        position,
        timeframe: z.timeframe,
      };
    });

    // Find nearest zone
    const nearestZone = processedZones
      .filter((z) => z.distance !== null)
      .sort((a, b) => Math.abs(a.distance) - Math.abs(b.distance))[0] || null;

    // Summary
    const hfzZones = processedZones.filter((z) => z.type === 'HFZ' || z.type === 'resistance');
    const lfzZones = processedZones.filter((z) => z.type === 'LFZ' || z.type === 'support');
    const freshZones = processedZones.filter((z) => z.freshness === 'fresh');

    return {
      zones: processedZones,
      nearestZone,
      summary: {
        total: processedZones.length,
        hfzCount: hfzZones.length,
        lfzCount: lfzZones.length,
        freshCount: freshZones.length,
      },
    };
  }

  /**
   * Get zone freshness label
   * @private
   */
  _getZoneFreshness(touches) {
    if (touches === 0) return 'fresh';
    if (touches === 1) return 'tested_1x';
    if (touches === 2) return 'tested_2x';
    return 'exhausted';
  }

  /**
   * Build position context
   * @private
   */
  async _buildPositionContext(userId, currentPrices = {}) {
    try {
      const analysis = await adminAIPositionService.analyzeAllPositions(userId, currentPrices);

      return {
        positions: analysis.positions,
        totalPnL: analysis.totalPnL,
        totalPnLPercent: analysis.totalPnLPercent,
        positionCount: analysis.positionCount,
        riskLevel: analysis.riskLevel,
        alerts: analysis.alerts.slice(0, 5), // Limit alerts
        balanceInfo: analysis.balanceInfo,
      };
    } catch (error) {
      console.error('[AdminAIContext] _buildPositionContext error:', error);
      return { error: error.message, positions: [] };
    }
  }

  // ═══════════════════════════════════════════════════════════
  // FORMAT FOR PROMPT
  // ═══════════════════════════════════════════════════════════

  /**
   * Format context for AI system prompt
   * @param {Object} context - Context object from buildContext
   * @returns {string} Formatted context string
   */
  formatContextForPrompt(context) {
    if (!context) return '';

    const parts = [];

    // Header
    parts.push(`## CURRENT CONTEXT`);
    parts.push(`Symbol: ${context.symbol} | Timeframe: ${context.timeframe}`);
    parts.push(`Price: $${context.currentPrice || 'N/A'}`);
    parts.push(`Timestamp: ${new Date(context.timestamp).toISOString()}`);
    parts.push('');

    // Market context
    if (context.market && !context.market.error) {
      parts.push('### MARKET DATA');
      parts.push(`- 24h Change: ${context.market.change24h?.toFixed(2) || 'N/A'}%`);
      parts.push(`- Trend: ${context.market.trend?.toUpperCase() || 'N/A'}`);
      if (context.market.indicators) {
        const ind = context.market.indicators;
        parts.push(`- RSI(14): ${ind.rsi?.toFixed(1) || 'N/A'}`);
        parts.push(`- SMA20: $${ind.sma20?.toFixed(2) || 'N/A'}`);
        parts.push(`- ATR(14): $${ind.atr?.toFixed(2) || 'N/A'}`);
      }
      if (context.market.lastCandle) {
        parts.push(`- Last Candle: ${context.market.lastCandle.type} (${context.market.lastCandle.signal || 'neutral'})`);
      }
      if (context.market.candlePatterns?.length > 0) {
        parts.push(`- Candle Patterns: ${context.market.candlePatterns.map((p) => p.type).join(', ')}`);
      }
      parts.push('');
    }

    // Pattern context
    if (context.pattern) {
      parts.push('### DETECTED PATTERNS');
      if (context.pattern.patterns.length === 0) {
        parts.push('- No patterns detected');
      } else {
        context.pattern.patterns.forEach((p) => {
          parts.push(`- ${p.name}: ${p.direction} (${p.confidence || 0}% confidence)`);
          if (p.entryPrice) parts.push(`  Entry: $${p.entryPrice}`);
          if (p.riskReward) parts.push(`  R:R: ${p.riskReward}`);
        });
      }
      parts.push(`- Summary: ${context.pattern.summary.total} patterns (${context.pattern.summary.longCount} LONG, ${context.pattern.summary.shortCount} SHORT)`);
      parts.push('');
    }

    // Zone context
    if (context.zone) {
      parts.push('### ACTIVE ZONES');
      if (context.zone.zones.length === 0) {
        parts.push('- No zones detected');
      } else {
        context.zone.zones.slice(0, 5).forEach((z) => {
          const freshLabel = z.freshness === 'fresh' ? '🟢' :
                            z.freshness === 'tested_1x' ? '🟡' :
                            z.freshness === 'tested_2x' ? '🟠' : '🔴';
          parts.push(`- ${z.type} ${freshLabel}: $${z.low?.toFixed(2)} - $${z.high?.toFixed(2)} (${z.distance?.toFixed(1) || '?'}% ${z.position})`);
        });
      }
      if (context.zone.nearestZone) {
        parts.push(`- Nearest: ${context.zone.nearestZone.type} at ${context.zone.nearestZone.distance?.toFixed(1)}% ${context.zone.nearestZone.position}`);
      }
      parts.push('');
    }

    // Position context
    if (context.position && !context.position.error) {
      parts.push('### OPEN POSITIONS');
      if (context.position.positionCount === 0) {
        parts.push('- No open positions');
      } else {
        context.position.positions.forEach((p) => {
          const pnlEmoji = p.pnlPercent >= 0 ? '📈' : '📉';
          parts.push(`- ${p.symbol} ${p.side}: ${pnlEmoji} ${p.pnlPercent}% (Risk: ${p.riskLevel})`);
        });
        parts.push(`- Total P&L: ${context.position.totalPnLPercent}%`);
        parts.push(`- Portfolio Risk: ${context.position.riskLevel}`);
      }
      if (context.position.alerts?.length > 0) {
        parts.push('- Alerts:');
        context.position.alerts.forEach((a) => {
          parts.push(`  ${a.message}`);
        });
      }
      parts.push('');
    }

    return parts.join('\n');
  }

  // ═══════════════════════════════════════════════════════════
  // CACHE MANAGEMENT
  // ═══════════════════════════════════════════════════════════

  /**
   * Get cached context if still valid
   * @param {string} key - Cache key
   * @returns {Object|null} Cached context or null
   */
  getCachedContext(key) {
    const cached = this.contextCache.get(key);
    if (!cached) return null;

    if (Date.now() - cached.timestamp > this.cacheTimeout) {
      this.contextCache.delete(key);
      return null;
    }

    return cached.data;
  }

  /**
   * Set context in cache
   * @param {string} key - Cache key
   * @param {Object} data - Context data
   */
  setCachedContext(key, data) {
    this.contextCache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * Clear all cached contexts
   */
  clearCache() {
    this.contextCache.clear();
  }

  /**
   * Get last built context
   * @returns {Object|null} Last context
   */
  getLastContext() {
    return this.lastContext;
  }
}

// Export singleton
export const adminAIContextService = new AdminAIContextService();
export default adminAIContextService;
