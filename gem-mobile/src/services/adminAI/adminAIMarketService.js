/**
 * GEM AI Trading Brain - Market Service
 * Real-time market data for AI analysis
 *
 * Features:
 * - Current price and 24h change
 * - Recent candles for analysis
 * - Candle pattern detection
 * - Basic indicators (SMA, RSI, ATR)
 * - WebSocket price subscription
 */

import { binanceService } from '../binanceService';

// Fetch with timeout to prevent hanging requests on stalled mobile connections
const FETCH_TIMEOUT = 10000;
const fetchWithTimeout = async (url, options = {}, timeoutMs = FETCH_TIMEOUT) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error(`Binance API request timeout after ${timeoutMs}ms`);
    }
    throw error;
  }
};

// ═══════════════════════════════════════════════════════════
// CANDLE PATTERN DEFINITIONS
// ═══════════════════════════════════════════════════════════
const CANDLE_TYPES = {
  DOJI: 'doji',
  HAMMER: 'hammer',
  SHOOTING_STAR: 'shooting_star',
  BULLISH_ENGULFING: 'bullish_engulfing',
  BEARISH_ENGULFING: 'bearish_engulfing',
  MORNING_STAR: 'morning_star',
  EVENING_STAR: 'evening_star',
  DRAGONFLY: 'dragonfly_doji',
  GRAVESTONE: 'gravestone_doji',
  SPINNING_TOP: 'spinning_top',
  MARUBOZU_BULL: 'marubozu_bullish',
  MARUBOZU_BEAR: 'marubozu_bearish',
  UNKNOWN: 'unknown',
};

class AdminAIMarketService {
  constructor() {
    this.wsSubscriptions = new Map();
    this.priceCache = new Map();
    this.lastUpdate = null;

    // API response caching to reduce API calls
    this.tickerCache = new Map();
    this.candleCache = new Map();
    this.TICKER_CACHE_DURATION = 30000; // 30 seconds
    this.CANDLE_CACHE_DURATION = 60000; // 60 seconds
  }

  // ═══════════════════════════════════════════════════════════
  // MARKET SNAPSHOT
  // ═══════════════════════════════════════════════════════════

  /**
   * Get current market snapshot for a symbol
   * @param {string} symbol - Trading pair (e.g., 'BTCUSDT')
   * @param {string} timeframe - Timeframe for trend analysis
   * @returns {Promise<Object>} Market snapshot
   */
  async getMarketSnapshot(symbol, timeframe = '4h') {
    try {
      // Get 24h ticker data and candles in parallel
      const [ticker, candles] = await Promise.all([
        this._fetch24hTicker(symbol).catch((err) => {
          // Only log once per 30 seconds to reduce spam
          if (!this._lastTickerError || Date.now() - this._lastTickerError > 30000) {
            console.warn('[AdminAIMarket] Ticker unavailable:', err.message);
            this._lastTickerError = Date.now();
          }
          return null;
        }),
        this.getRecentCandles(symbol, timeframe, 50),
      ]);

      // Calculate trend from candles (even if ticker failed)
      const trend = this._calculateTrend(candles);

      // Calculate basic indicators
      const indicators = this.calculateIndicators(candles);

      // Build snapshot with available data
      const snapshot = {
        symbol,
        timeframe,
        price: ticker ? parseFloat(ticker.lastPrice) : (candles.length > 0 ? candles[candles.length - 1].close : null),
        change24h: ticker ? parseFloat(ticker.priceChangePercent) : null,
        high24h: ticker ? parseFloat(ticker.highPrice) : null,
        low24h: ticker ? parseFloat(ticker.lowPrice) : null,
        volume24h: ticker ? parseFloat(ticker.volume) : null,
        quoteVolume24h: ticker ? parseFloat(ticker.quoteVolume) : null,
        trend,
        indicators,
        timestamp: Date.now(),
      };

      return snapshot;
    } catch (error) {
      // Only log once per 30 seconds
      if (!this._lastSnapshotError || Date.now() - this._lastSnapshotError > 30000) {
        console.warn('[AdminAIMarket] getMarketSnapshot error:', error.message);
        this._lastSnapshotError = Date.now();
      }
      return {
        symbol,
        timeframe,
        price: null,
        change24h: null,
        trend: 'unknown',
        error: error.message,
        timestamp: Date.now(),
      };
    }
  }

  /**
   * Fetch 24h ticker data from Binance with caching
   * @private
   */
  async _fetch24hTicker(symbol) {
    // Check cache first
    const cacheKey = `ticker_${symbol}`;
    const cached = this.tickerCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.TICKER_CACHE_DURATION) {
      return cached.data;
    }

    try {
      // P6 FIX #5: Use Futures API — coin list comes from Futures, Spot returns 400 for futures-only symbols
      const response = await fetchWithTimeout(`https://fapi.binance.com/fapi/v1/ticker/24hr?symbol=${symbol}`, {
        headers: { 'Accept': 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`Ticker API error: ${response.status}`);
      }

      const data = await response.json();

      // Cache the result
      this.tickerCache.set(cacheKey, { data, timestamp: Date.now() });

      return data;
    } catch (error) {
      // Return cached data if available (even if expired)
      if (cached) {
        console.log('[AdminAIMarket] Using stale ticker cache due to error');
        return cached.data;
      }
      throw error;
    }
  }

  // ═══════════════════════════════════════════════════════════
  // CANDLE DATA
  // ═══════════════════════════════════════════════════════════

  /**
   * Get recent candles for analysis with caching
   * @param {string} symbol - Trading pair
   * @param {string} timeframe - Candle timeframe
   * @param {number} count - Number of candles
   * @returns {Promise<Array>} Array of candle objects
   */
  async getRecentCandles(symbol, timeframe = '4h', count = 20) {
    // Check cache first
    const cacheKey = `candles_${symbol}_${timeframe}_${count}`;
    const cached = this.candleCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CANDLE_CACHE_DURATION) {
      return cached.data;
    }

    try {
      // P6 FIX #5: Use Futures API — coin list comes from Futures, Spot returns 400 for futures-only symbols
      const response = await fetchWithTimeout(
        `https://fapi.binance.com/fapi/v1/klines?symbol=${symbol}&interval=${timeframe}&limit=${count}`,
        { headers: { 'Accept': 'application/json' } }
      );

      if (!response.ok) {
        throw new Error(`Candles API error: ${response.status}`);
      }

      const data = await response.json();

      const candles = data.map((candle) => ({
        time: candle[0],
        open: parseFloat(candle[1]),
        high: parseFloat(candle[2]),
        low: parseFloat(candle[3]),
        close: parseFloat(candle[4]),
        volume: parseFloat(candle[5]),
        closeTime: candle[6],
        quoteVolume: parseFloat(candle[7]),
        trades: candle[8],
      }));

      // Cache the result
      this.candleCache.set(cacheKey, { data: candles, timestamp: Date.now() });

      return candles;
    } catch (error) {
      // Return cached data if available (even if expired)
      if (cached) {
        console.log('[AdminAIMarket] Using stale candle cache due to error');
        return cached.data;
      }
      console.error('[AdminAIMarket] getRecentCandles error:', error);
      return [];
    }
  }

  // ═══════════════════════════════════════════════════════════
  // CANDLE PATTERN ANALYSIS
  // ═══════════════════════════════════════════════════════════

  /**
   * Analyze a single candle for pattern
   * @param {Object} candle - Candle object
   * @returns {Object} Pattern analysis result
   */
  analyzeCandle(candle) {
    if (!candle) return { type: CANDLE_TYPES.UNKNOWN, confidence: 0 };

    const { open, high, low, close } = candle;
    const body = Math.abs(close - open);
    const range = high - low;
    const upperWick = high - Math.max(open, close);
    const lowerWick = Math.min(open, close) - low;
    const isBullish = close > open;

    // Prevent division by zero
    if (range === 0) return { type: CANDLE_TYPES.DOJI, confidence: 100 };

    const bodyPercent = (body / range) * 100;
    const upperWickPercent = (upperWick / range) * 100;
    const lowerWickPercent = (lowerWick / range) * 100;

    // Doji - very small body
    if (bodyPercent < 10) {
      if (lowerWickPercent > 60) {
        return { type: CANDLE_TYPES.DRAGONFLY, confidence: 80, signal: 'bullish' };
      }
      if (upperWickPercent > 60) {
        return { type: CANDLE_TYPES.GRAVESTONE, confidence: 80, signal: 'bearish' };
      }
      return { type: CANDLE_TYPES.DOJI, confidence: 90, signal: 'neutral' };
    }

    // Hammer - small body, long lower wick
    if (isBullish && lowerWickPercent > 60 && upperWickPercent < 20 && bodyPercent < 30) {
      return { type: CANDLE_TYPES.HAMMER, confidence: 85, signal: 'bullish' };
    }

    // Shooting Star - small body, long upper wick
    if (!isBullish && upperWickPercent > 60 && lowerWickPercent < 20 && bodyPercent < 30) {
      return { type: CANDLE_TYPES.SHOOTING_STAR, confidence: 85, signal: 'bearish' };
    }

    // Marubozu - full body, no/small wicks
    if (bodyPercent > 80) {
      if (isBullish) {
        return { type: CANDLE_TYPES.MARUBOZU_BULL, confidence: 75, signal: 'bullish' };
      } else {
        return { type: CANDLE_TYPES.MARUBOZU_BEAR, confidence: 75, signal: 'bearish' };
      }
    }

    // Spinning Top - small body, equal wicks
    if (bodyPercent < 35 && Math.abs(upperWickPercent - lowerWickPercent) < 20) {
      return { type: CANDLE_TYPES.SPINNING_TOP, confidence: 70, signal: 'neutral' };
    }

    return {
      type: CANDLE_TYPES.UNKNOWN,
      confidence: 0,
      isBullish,
      bodyPercent,
      upperWickPercent,
      lowerWickPercent,
    };
  }

  /**
   * Detect multi-candle patterns
   * @param {Array} candles - Array of candles (most recent last)
   * @returns {Array} Detected patterns
   */
  detectMultiCandlePatterns(candles) {
    if (!candles || candles.length < 3) return [];

    const patterns = [];
    const len = candles.length;

    // Check last 3 candles for patterns
    const c1 = candles[len - 3]; // First
    const c2 = candles[len - 2]; // Middle
    const c3 = candles[len - 1]; // Last

    // Bullish Engulfing
    if (this._isEngulfing(candles[len - 2], candles[len - 1], 'bullish')) {
      patterns.push({
        type: CANDLE_TYPES.BULLISH_ENGULFING,
        confidence: 80,
        signal: 'bullish',
        candles: [len - 2, len - 1],
      });
    }

    // Bearish Engulfing
    if (this._isEngulfing(candles[len - 2], candles[len - 1], 'bearish')) {
      patterns.push({
        type: CANDLE_TYPES.BEARISH_ENGULFING,
        confidence: 80,
        signal: 'bearish',
        candles: [len - 2, len - 1],
      });
    }

    // Morning Star
    if (this._isMorningStar(c1, c2, c3)) {
      patterns.push({
        type: CANDLE_TYPES.MORNING_STAR,
        confidence: 85,
        signal: 'bullish',
        candles: [len - 3, len - 2, len - 1],
      });
    }

    // Evening Star
    if (this._isEveningStar(c1, c2, c3)) {
      patterns.push({
        type: CANDLE_TYPES.EVENING_STAR,
        confidence: 85,
        signal: 'bearish',
        candles: [len - 3, len - 2, len - 1],
      });
    }

    return patterns;
  }

  /**
   * Check for engulfing pattern
   * @private
   */
  _isEngulfing(prev, curr, type) {
    if (!prev || !curr) return false;

    const prevBody = Math.abs(prev.close - prev.open);
    const currBody = Math.abs(curr.close - curr.open);
    const prevBullish = prev.close > prev.open;
    const currBullish = curr.close > curr.open;

    if (type === 'bullish') {
      return !prevBullish && currBullish && currBody > prevBody * 1.1 &&
             curr.open < prev.close && curr.close > prev.open;
    } else {
      return prevBullish && !currBullish && currBody > prevBody * 1.1 &&
             curr.open > prev.close && curr.close < prev.open;
    }
  }

  /**
   * Check for morning star pattern
   * @private
   */
  _isMorningStar(c1, c2, c3) {
    if (!c1 || !c2 || !c3) return false;

    const c1Body = Math.abs(c1.close - c1.open);
    const c2Body = Math.abs(c2.close - c2.open);
    const c3Body = Math.abs(c3.close - c3.open);

    // First candle: bearish with decent body
    // Second candle: small body (star)
    // Third candle: bullish with decent body
    return (c1.close < c1.open) && // First bearish
           (c2Body < c1Body * 0.3) && // Second small
           (c3.close > c3.open) && // Third bullish
           (c3.close > (c1.open + c1.close) / 2); // Close above midpoint of first
  }

  /**
   * Check for evening star pattern
   * @private
   */
  _isEveningStar(c1, c2, c3) {
    if (!c1 || !c2 || !c3) return false;

    const c1Body = Math.abs(c1.close - c1.open);
    const c2Body = Math.abs(c2.close - c2.open);
    const c3Body = Math.abs(c3.close - c3.open);

    return (c1.close > c1.open) && // First bullish
           (c2Body < c1Body * 0.3) && // Second small
           (c3.close < c3.open) && // Third bearish
           (c3.close < (c1.open + c1.close) / 2); // Close below midpoint of first
  }

  // ═══════════════════════════════════════════════════════════
  // INDICATORS
  // ═══════════════════════════════════════════════════════════

  /**
   * Calculate basic indicators from candles
   * @param {Array} candles - Array of candle objects
   * @returns {Object} Indicator values
   */
  calculateIndicators(candles) {
    if (!candles || candles.length < 20) {
      return { sma20: null, sma50: null, rsi: null, atr: null };
    }

    const closes = candles.map((c) => c.close);

    return {
      sma20: this._calculateSMA(closes, 20),
      sma50: candles.length >= 50 ? this._calculateSMA(closes, 50) : null,
      rsi: this._calculateRSI(closes, 14),
      atr: this._calculateATR(candles, 14),
    };
  }

  /**
   * Calculate Simple Moving Average
   * @private
   */
  _calculateSMA(prices, period) {
    if (prices.length < period) return null;
    const slice = prices.slice(-period);
    return slice.reduce((sum, p) => sum + p, 0) / period;
  }

  /**
   * Calculate RSI
   * @private
   */
  _calculateRSI(prices, period = 14) {
    if (prices.length < period + 1) return null;

    let gains = 0;
    let losses = 0;

    // Calculate initial average gain/loss
    for (let i = prices.length - period; i < prices.length; i++) {
      const change = prices[i] - prices[i - 1];
      if (change >= 0) {
        gains += change;
      } else {
        losses -= change;
      }
    }

    const avgGain = gains / period;
    const avgLoss = losses / period;

    if (avgLoss === 0) return 100;

    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  }

  /**
   * Calculate ATR (Average True Range)
   * @private
   */
  _calculateATR(candles, period = 14) {
    if (candles.length < period + 1) return null;

    const trueRanges = [];

    for (let i = 1; i < candles.length; i++) {
      const high = candles[i].high;
      const low = candles[i].low;
      const prevClose = candles[i - 1].close;

      const tr = Math.max(
        high - low,
        Math.abs(high - prevClose),
        Math.abs(low - prevClose)
      );
      trueRanges.push(tr);
    }

    // Calculate average of last 'period' true ranges
    const recentTRs = trueRanges.slice(-period);
    return recentTRs.reduce((sum, tr) => sum + tr, 0) / period;
  }

  // ═══════════════════════════════════════════════════════════
  // TREND ANALYSIS
  // ═══════════════════════════════════════════════════════════

  /**
   * Calculate current trend from candles
   * @private
   */
  _calculateTrend(candles) {
    if (!candles || candles.length < 20) return 'unknown';

    const closes = candles.map((c) => c.close);
    const sma20 = this._calculateSMA(closes, 20);
    const currentPrice = closes[closes.length - 1];

    // Also check price action
    const recentCloses = closes.slice(-10);
    const oldCloses = closes.slice(-20, -10);
    const recentAvg = recentCloses.reduce((a, b) => a + b, 0) / 10;
    const oldAvg = oldCloses.reduce((a, b) => a + b, 0) / 10;

    if (currentPrice > sma20 && recentAvg > oldAvg) {
      return 'uptrend';
    } else if (currentPrice < sma20 && recentAvg < oldAvg) {
      return 'downtrend';
    } else {
      return 'sideways';
    }
  }

  // ═══════════════════════════════════════════════════════════
  // WEBSOCKET SUBSCRIPTION
  // ═══════════════════════════════════════════════════════════

  /**
   * Subscribe to real-time price updates
   * @param {string} symbol - Trading pair
   * @param {Function} callback - Called with price updates
   * @returns {Function} Unsubscribe function
   */
  subscribeToPrice(symbol, callback) {
    const wsUrl = `wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@trade`;

    const ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const price = parseFloat(data.p);
        this.priceCache.set(symbol, price);
        this.lastUpdate = Date.now();
        callback({
          symbol,
          price,
          quantity: parseFloat(data.q),
          time: data.T,
        });
      } catch (error) {
        console.error('[AdminAIMarket] WS parse error:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('[AdminAIMarket] WS error:', error);
    };

    ws.onclose = () => {
      this.wsSubscriptions.delete(symbol);
    };

    this.wsSubscriptions.set(symbol, ws);

    // Return unsubscribe function
    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
      this.wsSubscriptions.delete(symbol);
    };
  }

  /**
   * Get cached price
   * @param {string} symbol - Trading pair
   * @returns {number|null} Cached price or null
   */
  getCachedPrice(symbol) {
    return this.priceCache.get(symbol) || null;
  }

  /**
   * Cleanup all subscriptions and caches
   */
  cleanup() {
    for (const [symbol, ws] of this.wsSubscriptions) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    }
    this.wsSubscriptions.clear();
    this.priceCache.clear();
    this.tickerCache.clear();
    this.candleCache.clear();
  }

  /**
   * Clear expired cache entries to prevent memory buildup
   */
  clearExpiredCache() {
    const now = Date.now();

    // Clear expired ticker cache
    for (const [key, value] of this.tickerCache) {
      if (now - value.timestamp > this.TICKER_CACHE_DURATION * 2) {
        this.tickerCache.delete(key);
      }
    }

    // Clear expired candle cache
    for (const [key, value] of this.candleCache) {
      if (now - value.timestamp > this.CANDLE_CACHE_DURATION * 2) {
        this.candleCache.delete(key);
      }
    }
  }
}

// Export singleton
export const adminAIMarketService = new AdminAIMarketService();
export default adminAIMarketService;
