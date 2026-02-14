/**
 * GEM Mobile - Binance Service
 * REST API for candles + real-time prices via WebSocket pool
 * Uses Binance FUTURES API (fapi.binance.com) for coin list to ensure all coins are tradeable
 *
 * P1-8: WebSocket consolidated — delegates to webSocketPoolService (single pooled connection)
 * P2-5: Ticker updates throttled to max 1 per second per symbol
 */

import { wsPool } from './scanner/webSocketPoolService';

const RATE_LIMIT = 1200;
const RATE_WINDOW = 60000;
let requestTimestamps = [];

const checkRateLimit = () => {
  const now = Date.now();
  requestTimestamps = requestTimestamps.filter(t => now - t < RATE_WINDOW);
  if (requestTimestamps.length >= RATE_LIMIT * 0.8) {
    console.warn(`[Binance] Rate limit warning: ${requestTimestamps.length}/${RATE_LIMIT} requests in last minute`);
  }
  if (requestTimestamps.length >= RATE_LIMIT) {
    throw new Error('Binance API rate limit reached. Please wait before making more requests.');
  }
  requestTimestamps.push(now);
};

class BinanceService {
  constructor() {
    this.baseUrl = 'https://api.binance.com/api/v3';
    this.futuresBaseUrl = 'https://fapi.binance.com/fapi/v1';
    this.allCoins = [];
    this.coinsCacheTime = 0;
    this.CACHE_DURATION = 5 * 60 * 1000;

    this.prices = new Map(); // Local price cache (binanceService format)

    this.candleCache = new Map();
    this.CANDLE_CACHE_DURATION = 60 * 1000;

    // WebSocket: delegates to wsPool with per-symbol subscriber fan-out + throttle
    this._symbolSubscribers = new Map(); // symbol -> Set<callback>
    this._poolUnsubscribes = new Map();  // symbol -> unsubscribe function from wsPool
    this._lastNotifyTime = new Map();    // symbol -> timestamp (throttle tracking)
    this._THROTTLE_MS = 1000;            // P2-5: Max 1 update per second per symbol
  }

  /**
   * Get all trading pairs from Binance FUTURES (ensures coins work with TradingChart)
   * Only returns USDT perpetual futures pairs that are actively trading
   */
  async getAllCoins() {
    try {
      if (this.allCoins.length > 0 && Date.now() - this.coinsCacheTime < this.CACHE_DURATION) {
        console.log('[Binance] Using cached Futures coins:', this.allCoins.length);
        return this.allCoins;
      }

      checkRateLimit();
      console.log('[Binance] Fetching all coins from FUTURES exchange info...');

      const response = await fetch(`${this.futuresBaseUrl}/exchangeInfo`);
      const data = await response.json();

      if (data && typeof data.code === 'number' && data.code < 0) {
        throw new Error(`Binance API error ${data.code}: ${data.msg}`);
      }

      const usdtPairs = data.symbols
        .filter(symbol =>
          symbol.quoteAsset === 'USDT' &&
          symbol.status === 'TRADING' &&
          (symbol.contractType === 'PERPETUAL' || symbol.contractType === 'TRADIFI_PERPETUAL') &&
          !symbol.symbol.includes('_') // Exclude delivery contracts like BTCUSDT_230929
        )
        .map(symbol => ({
          symbol: symbol.symbol,
          baseAsset: symbol.baseAsset,
          quoteAsset: symbol.quoteAsset,
          displayName: `${symbol.baseAsset}/USDT`,
        }))
        .sort((a, b) => a.baseAsset.localeCompare(b.baseAsset));

      console.log('[Binance] Loaded Futures coins:', usdtPairs.length);

      // Cache
      this.allCoins = usdtPairs;
      this.coinsCacheTime = Date.now();

      return usdtPairs;

    } catch (error) {
      console.error('[Binance] getAllCoins error:', error);
      return this.getDefaultCoins();
    }
  }

  /**
   * Get popular coins (default list)
   */
  getDefaultCoins() {
    return [
      { symbol: 'BTCUSDT', baseAsset: 'BTC', displayName: 'BTC/USDT' },
      { symbol: 'ETHUSDT', baseAsset: 'ETH', displayName: 'ETH/USDT' },
      { symbol: 'BNBUSDT', baseAsset: 'BNB', displayName: 'BNB/USDT' },
      { symbol: 'SOLUSDT', baseAsset: 'SOL', displayName: 'SOL/USDT' },
      { symbol: 'XRPUSDT', baseAsset: 'XRP', displayName: 'XRP/USDT' },
      { symbol: 'ADAUSDT', baseAsset: 'ADA', displayName: 'ADA/USDT' },
      { symbol: 'DOGEUSDT', baseAsset: 'DOGE', displayName: 'DOGE/USDT' },
      { symbol: 'AVAXUSDT', baseAsset: 'AVAX', displayName: 'AVAX/USDT' },
      { symbol: 'DOTUSDT', baseAsset: 'DOT', displayName: 'DOT/USDT' },
      { symbol: 'MATICUSDT', baseAsset: 'MATIC', displayName: 'MATIC/USDT' },
      { symbol: 'LINKUSDT', baseAsset: 'LINK', displayName: 'LINK/USDT' },
      { symbol: 'ATOMUSDT', baseAsset: 'ATOM', displayName: 'ATOM/USDT' },
    ];
  }

  /**
   * Get 24h tickers for multiple symbols (Spot API)
   */
  async get24hTickers(symbols) {
    try {
      checkRateLimit();
      const symbolsParam = JSON.stringify(symbols);
      const response = await fetch(
        `${this.baseUrl}/ticker/24hr?symbols=${encodeURIComponent(symbolsParam)}`
      );
      const data = await response.json();

      if (data && typeof data.code === 'number' && data.code < 0) {
        throw new Error(`Binance API error ${data.code}: ${data.msg}`);
      }

      return data.map(ticker => ({
        symbol: ticker.symbol,
        price: parseFloat(ticker.lastPrice),
        priceChange: parseFloat(ticker.priceChange),
        priceChangePercent: parseFloat(ticker.priceChangePercent),
        volume: parseFloat(ticker.volume),
        quoteVolume: parseFloat(ticker.quoteVolume),
      }));

    } catch (error) {
      console.error('[Binance] get24hTickers error:', error);
      return [];
    }
  }

  /**
   * Get ALL 24h tickers from Binance Futures (for CoinSelector)
   * Returns map: { symbol: { price, priceChangePercent, volume, quoteVolume } }
   * Optimized for real-time updates (no console logs, minimal caching)
   */
  async getAllFuturesTickers(silent = false) {
    try {
      const now = Date.now();
      if (this._tickerCache && (now - this._tickerCacheTime) < 800) {
        return this._tickerCache;
      }

      checkRateLimit();
      const response = await fetch(`${this.futuresBaseUrl}/ticker/24hr`);
      const data = await response.json();

      if (data && typeof data.code === 'number' && data.code < 0) {
        throw new Error(`Binance API error ${data.code}: ${data.msg}`);
      }

      const tickerMap = {};
      data.forEach(ticker => {
        tickerMap[ticker.symbol] = {
          price: parseFloat(ticker.lastPrice),
          priceChange: parseFloat(ticker.priceChange),
          priceChangePercent: parseFloat(ticker.priceChangePercent),
          volume: parseFloat(ticker.volume), // Base asset volume
          quoteVolume: parseFloat(ticker.quoteVolume), // USDT volume
        };
      });

      // Cache the result
      this._tickerCache = tickerMap;
      this._tickerCacheTime = now;

      if (!silent) {
        console.log('[Binance] Loaded tickers for', Object.keys(tickerMap).length, 'symbols');
      }
      return tickerMap;

    } catch (error) {
      if (!silent) {
        console.error('[Binance] getAllFuturesTickers error:', error);
      }
      // Return cached data if available on error
      return this._tickerCache || {};
    }
  }

  /**
   * Subscribe to real-time price updates for a symbol.
   * Delegates to webSocketPoolService (single pooled connection) with:
   * - Per-symbol fan-out to multiple subscribers
   * - 1s throttle per symbol (P2-5)
   * - Data format adaptation (wsPool format -> binanceService format)
   *
   * @param {string} symbol - Trading symbol (e.g., 'BTCUSDT')
   * @param {function} callback - Called with { symbol, price, priceChange, priceChangePercent, high, low, volume, timestamp }
   * @returns {function} Unsubscribe function
   */
  subscribe(symbol, callback) {
    if (!symbol || typeof callback !== 'function') return () => {};

    // Ensure wsPool is initialized
    wsPool.init();

    // First subscriber for this symbol: create the single wsPool subscription
    if (!this._symbolSubscribers.has(symbol)) {
      this._symbolSubscribers.set(symbol, new Set());

      // Single wsPool subscription per symbol — handles WS lifecycle
      const poolUnsub = wsPool.subscribe(symbol, (data) => {
        // P2-5: Throttle — max 1 update per second per symbol
        const now = Date.now();
        const lastTime = this._lastNotifyTime.get(symbol) || 0;
        if (now - lastTime < this._THROTTLE_MS) return;
        this._lastNotifyTime.set(symbol, now);

        // Adapt wsPool format to binanceService format
        const priceData = {
          symbol: data.symbol,
          price: data.price,
          priceChange: 0,
          priceChangePercent: data.change24h || 0,
          high: data.high24h || 0,
          low: data.low24h || 0,
          volume: data.volume || 0,
          timestamp: data.timestamp || Date.now(),
        };

        // Update local cache
        this.prices.set(symbol, priceData);

        // Fan-out: notify all subscribers for this symbol
        // C4 pattern: snapshot before iterating to prevent race conditions
        const callbacks = this._symbolSubscribers.get(symbol);
        if (callbacks && callbacks.size > 0) {
          const snapshot = [...callbacks];
          snapshot.forEach(cb => {
            try {
              if (this._symbolSubscribers.has(symbol) && this._symbolSubscribers.get(symbol).has(cb)) {
                cb(priceData);
              }
            } catch (err) {
              console.warn('[Binance] Subscriber callback error:', err?.message || err);
            }
          });
        }
      });

      this._poolUnsubscribes.set(symbol, poolUnsub);
    }

    // Add this callback to the per-symbol subscriber set
    this._symbolSubscribers.get(symbol).add(callback);

    // Send cached price immediately if available, otherwise fetch via REST
    const cachedPrice = this.prices.get(symbol);
    if (cachedPrice) {
      callback(cachedPrice);
    } else {
      this.fetchAndNotifyPrice(symbol, callback);
    }

    // Return unsubscribe function
    return () => {
      const callbacks = this._symbolSubscribers.get(symbol);
      if (callbacks) {
        callbacks.delete(callback);

        // If no more subscribers for this symbol, clean up pool subscription
        if (callbacks.size === 0) {
          this._symbolSubscribers.delete(symbol);
          const poolUnsub = this._poolUnsubscribes.get(symbol);
          if (poolUnsub) {
            poolUnsub();
            this._poolUnsubscribes.delete(symbol);
          }
          this._lastNotifyTime.delete(symbol);
        }
      }
    };
  }

  /**
   * Fetch price via REST API and notify callback immediately
   * Used for initial price when no cached data available
   */
  async fetchAndNotifyPrice(symbol, callback) {
    try {
      checkRateLimit();
      const url = `${this.futuresBaseUrl}/ticker/24hr?symbol=${symbol}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data && typeof data.code === 'number' && data.code < 0) {
        throw new Error(`Binance API error ${data.code}: ${data.msg}`);
      }

      if (data && data.lastPrice) {
        const priceData = {
          symbol: symbol,
          price: parseFloat(data.lastPrice),
          priceChange: parseFloat(data.priceChange || 0),
          priceChangePercent: parseFloat(data.priceChangePercent || 0),
          high: parseFloat(data.highPrice || 0),
          low: parseFloat(data.lowPrice || 0),
          volume: parseFloat(data.volume || 0),
          timestamp: Date.now(),
        };

        this.prices.set(symbol, priceData);
        callback(priceData);
      }
    } catch (error) {
      console.error(`[Binance] fetchAndNotifyPrice error for ${symbol}:`, error);
    }
  }

  /**
   * Get cached price for a symbol
   * Checks local cache first, then wsPool
   */
  getPrice(symbol) {
    const local = this.prices.get(symbol);
    if (local) return local;

    // Fallback: check wsPool buffer and adapt format
    const poolPrice = wsPool.getCurrentPrice(symbol);
    if (poolPrice) {
      return {
        symbol: poolPrice.symbol,
        price: poolPrice.price,
        priceChange: 0,
        priceChangePercent: poolPrice.change24h || 0,
        high: poolPrice.high24h || 0,
        low: poolPrice.low24h || 0,
        volume: poolPrice.volume || 0,
        timestamp: poolPrice.timestamp || Date.now(),
      };
    }

    return null;
  }

  /**
   * Clear local state. wsPool lifecycle is managed separately.
   */
  disconnect() {
    // Unsubscribe all pool subscriptions
    this._poolUnsubscribes.forEach(unsub => {
      try { unsub(); } catch (e) { /* ignore */ }
    });
    this._poolUnsubscribes.clear();
    this._symbolSubscribers.clear();
    this._lastNotifyTime.clear();
    this.prices.clear();
  }

  /**
   * Get candlestick data from Binance FUTURES API
   * Using Futures API for consistency with TradingChart
   * OPTIMIZED: Added caching to reduce API calls during batch scans
   */
  async getCandles(symbol, interval = '1h', limit = 100) {
    try {
      const cacheKey = `${symbol}:${interval}:${limit}`;
      const cached = this.candleCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.CANDLE_CACHE_DURATION) {
        return cached.data;
      }

      checkRateLimit();
      const url = `${this.futuresBaseUrl}/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data && typeof data.code === 'number' && data.code < 0) {
        throw new Error(`Binance API error ${data.code}: ${data.msg}`);
      }

      const candles = data.map(candle => ({
        timestamp: candle[0],
        open: parseFloat(candle[1]),
        high: parseFloat(candle[2]),
        low: parseFloat(candle[3]),
        close: parseFloat(candle[4]),
        volume: parseFloat(candle[5]),
        closeTime: candle[6],
      }));

      // Store in cache
      this.candleCache.set(cacheKey, { data: candles, timestamp: Date.now() });

      // Clean old cache entries (keep max 100)
      if (this.candleCache.size > 100) {
        const oldestKey = this.candleCache.keys().next().value;
        this.candleCache.delete(oldestKey);
      }

      return candles;
    } catch (error) {
      console.error('[Binance] Error fetching candles:', error);
      return [];
    }
  }

  /**
   * Clear candle cache (call before new scan session)
   */
  clearCandleCache() {
    this.candleCache.clear();
    console.log('[Binance] Candle cache cleared');
  }

  /**
   * Get 24hr ticker for a symbol from Binance FUTURES
   */
  async get24hrTicker(symbol) {
    try {
      checkRateLimit();
      const url = `${this.futuresBaseUrl}/ticker/24hr?symbol=${symbol}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data && typeof data.code === 'number' && data.code < 0) {
        throw new Error(`Binance API error ${data.code}: ${data.msg}`);
      }

      return data;
    } catch (error) {
      console.error('[Binance] Error fetching ticker:', error);
      return null;
    }
  }

  /**
   * Get current price for a symbol via REST API
   * Used for paper trade price updates when WebSocket not connected
   */
  async getCurrentPrice(symbol) {
    try {
      const cachedPrice = this.prices.get(symbol);
      if (cachedPrice && Date.now() - cachedPrice.timestamp < 60000) {
        return cachedPrice.price;
      }

      checkRateLimit();
      const url = `${this.futuresBaseUrl}/ticker/price?symbol=${symbol}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data && typeof data.code === 'number' && data.code < 0) {
        throw new Error(`Binance API error ${data.code}: ${data.msg}`);
      }

      if (data && data.price) {
        const price = parseFloat(data.price);
        // Update cache
        this.prices.set(symbol, {
          symbol,
          price,
          timestamp: Date.now(),
        });
        return price;
      }

      return null;
    } catch (error) {
      console.error(`[Binance] getCurrentPrice error for ${symbol}:`, error);
      return null;
    }
  }
}

export const binanceService = new BinanceService();
export default binanceService;
