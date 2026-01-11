/**
 * GEM Mobile - Binance Service
 * WebSocket connection for real-time prices + REST API for candles
 * Uses Binance FUTURES API (fapi.binance.com) for coin list to ensure all coins are tradeable
 */

class BinanceService {
  constructor() {
    this.ws = null;
    this.singleSymbolWs = null; // Single symbol WebSocket for detail screens
    this.currentWsSymbol = null;
    this.subscribers = new Map();
    this.prices = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000;
    this.baseUrl = 'https://api.binance.com/api/v3';
    this.futuresBaseUrl = 'https://fapi.binance.com/fapi/v1';
    this.allCoins = [];
    this.coinsCacheTime = 0;
    this.CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

    // CANDLE CACHE - stores candles by symbol:interval key
    this.candleCache = new Map();
    this.CANDLE_CACHE_DURATION = 60 * 1000; // 1 minute cache for candles
  }

  /**
   * Get all trading pairs from Binance FUTURES (ensures coins work with TradingChart)
   * Only returns USDT perpetual futures pairs that are actively trading
   */
  async getAllCoins() {
    try {
      // Check cache
      if (this.allCoins.length > 0 && Date.now() - this.coinsCacheTime < this.CACHE_DURATION) {
        console.log('[Binance] Using cached Futures coins:', this.allCoins.length);
        return this.allCoins;
      }

      console.log('[Binance] Fetching all coins from FUTURES exchange info...');

      const response = await fetch(`${this.futuresBaseUrl}/exchangeInfo`);
      const data = await response.json();

      // Filter USDT perpetual pairs only, trading status
      const usdtPairs = data.symbols
        .filter(symbol =>
          symbol.quoteAsset === 'USDT' &&
          symbol.status === 'TRADING' &&
          symbol.contractType === 'PERPETUAL' && // Only perpetual futures
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
      const symbolsParam = JSON.stringify(symbols);
      const response = await fetch(
        `${this.baseUrl}/ticker/24hr?symbols=${encodeURIComponent(symbolsParam)}`
      );
      const data = await response.json();

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
   */
  async getAllFuturesTickers() {
    try {
      console.log('[Binance] Fetching all Futures tickers...');
      const response = await fetch(`${this.futuresBaseUrl}/ticker/24hr`);
      const data = await response.json();

      // Convert array to map for fast lookup
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

      console.log('[Binance] Loaded tickers for', Object.keys(tickerMap).length, 'symbols');
      return tickerMap;

    } catch (error) {
      console.error('[Binance] getAllFuturesTickers error:', error);
      return {};
    }
  }

  /**
   * Connect to Binance WebSocket for real-time prices
   */
  connect(symbols) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log('[Binance] WebSocket already connected');
      return;
    }

    const streams = symbols
      .map(symbol => `${symbol.toLowerCase()}@ticker`)
      .join('/');

    const wsUrl = `wss://stream.binance.com:9443/stream?streams=${streams}`;
    console.log('[Binance] Connecting to WebSocket...');

    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      console.log('[Binance] WebSocket connected');
      this.reconnectAttempts = 0;
    };

    this.ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.stream && message.data) {
          const ticker = message.data;
          const symbol = ticker.s;

          const priceData = {
            symbol: symbol,
            price: parseFloat(ticker.c),
            priceChange: parseFloat(ticker.p),
            priceChangePercent: parseFloat(ticker.P),
            high: parseFloat(ticker.h),
            low: parseFloat(ticker.l),
            volume: parseFloat(ticker.v),
            timestamp: ticker.E,
          };

          this.prices.set(symbol, priceData);
          this.notifySubscribers(symbol, priceData);
        }
      } catch (error) {
        console.error('[Binance] Parse error:', error);
      }
    };

    this.ws.onerror = (error) => {
      // WebSocket errors in React Native don't have detailed messages
      const readyState = this.ws?.readyState;
      if (readyState !== WebSocket.CLOSING && readyState !== WebSocket.CLOSED) {
        console.warn('[Binance] WebSocket error (state:', readyState, ')');
      }
    };

    this.ws.onclose = (event) => {
      // Only log if unexpected close
      if (event?.code && event.code !== 1000 && event.code !== 1001) {
        console.log('[Binance] WebSocket closed (code:', event.code, ')');
      }
      this.attemptReconnect(symbols);
    };
  }

  attemptReconnect(symbols) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`[Binance] Reconnecting... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      setTimeout(() => this.connect(symbols), this.reconnectDelay);
    }
  }

  subscribe(symbol, callback) {
    if (!this.subscribers.has(symbol)) {
      this.subscribers.set(symbol, []);
    }
    this.subscribers.get(symbol).push(callback);

    // If we have cached price, send immediately
    if (this.prices.has(symbol)) {
      callback(this.prices.get(symbol));
    } else {
      // Fetch initial price via REST API immediately (don't wait for WebSocket)
      this.fetchAndNotifyPrice(symbol, callback);
    }

    // Auto-connect WebSocket for this symbol if not connected
    this.ensureWebSocketForSymbol(symbol);

    return () => {
      const callbacks = this.subscribers.get(symbol);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) callbacks.splice(index, 1);
      }
    };
  }

  /**
   * Fetch price via REST API and notify callback immediately
   */
  async fetchAndNotifyPrice(symbol, callback) {
    try {
      const url = `${this.futuresBaseUrl}/ticker/24hr?symbol=${symbol}`;
      const response = await fetch(url);
      const data = await response.json();

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
   * Ensure WebSocket is connected for a specific symbol
   * Creates a dedicated connection for single symbol real-time updates
   */
  ensureWebSocketForSymbol(symbol) {
    // If main WebSocket is already handling this symbol, skip
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      return;
    }

    // Create/update single symbol WebSocket connection
    if (!this.singleSymbolWs || this.singleSymbolWs.readyState !== WebSocket.OPEN || this.currentWsSymbol !== symbol) {
      // Close existing single symbol connection
      if (this.singleSymbolWs) {
        this.singleSymbolWs.close();
      }

      this.currentWsSymbol = symbol;
      const wsUrl = `wss://fstream.binance.com/ws/${symbol.toLowerCase()}@ticker`;
      console.log(`[Binance] Connecting single symbol WebSocket for ${symbol}...`);

      this.singleSymbolWs = new WebSocket(wsUrl);

      this.singleSymbolWs.onopen = () => {
        console.log(`[Binance] Single symbol WebSocket connected for ${symbol}`);
      };

      this.singleSymbolWs.onmessage = (event) => {
        try {
          const ticker = JSON.parse(event.data);
          if (ticker.s) {
            const priceData = {
              symbol: ticker.s,
              price: parseFloat(ticker.c),
              priceChange: parseFloat(ticker.p),
              priceChangePercent: parseFloat(ticker.P),
              high: parseFloat(ticker.h),
              low: parseFloat(ticker.l),
              volume: parseFloat(ticker.v),
              timestamp: ticker.E,
            };

            this.prices.set(ticker.s, priceData);
            this.notifySubscribers(ticker.s, priceData);
          }
        } catch (error) {
          console.error('[Binance] Single WS parse error:', error);
        }
      };

      this.singleSymbolWs.onerror = (error) => {
        // WebSocket errors in React Native don't have detailed messages
        // Only log if it's unexpected (not during intentional close)
        const readyState = this.singleSymbolWs?.readyState;
        if (readyState !== WebSocket.CLOSING && readyState !== WebSocket.CLOSED) {
          console.warn(`[Binance] WebSocket error for ${symbol} (state: ${readyState})`);
        }
      };

      this.singleSymbolWs.onclose = (event) => {
        // Only log if unexpected close (code 1000 = normal, 1001 = going away)
        if (event?.code && event.code !== 1000 && event.code !== 1001) {
          console.log(`[Binance] WebSocket closed for ${symbol} (code: ${event.code})`);
        }
        // Reconnect after delay if still subscribed
        if (this.subscribers.has(symbol) && this.subscribers.get(symbol).length > 0) {
          setTimeout(() => this.ensureWebSocketForSymbol(symbol), 3000);
        }
      };
    }
  }

  notifySubscribers(symbol, priceData) {
    const callbacks = this.subscribers.get(symbol);
    if (callbacks) {
      callbacks.forEach(cb => cb(priceData));
    }
  }

  getPrice(symbol) {
    return this.prices.get(symbol);
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    if (this.singleSymbolWs) {
      this.singleSymbolWs.close();
      this.singleSymbolWs = null;
      this.currentWsSymbol = null;
    }
  }

  /**
   * Get candlestick data from Binance FUTURES API
   * Using Futures API for consistency with TradingChart
   * OPTIMIZED: Added caching to reduce API calls during batch scans
   */
  async getCandles(symbol, interval = '1h', limit = 100) {
    try {
      // Check cache first
      const cacheKey = `${symbol}:${interval}:${limit}`;
      const cached = this.candleCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.CANDLE_CACHE_DURATION) {
        return cached.data;
      }

      const url = `${this.futuresBaseUrl}/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;
      const response = await fetch(url);
      const data = await response.json();

      // Check if response is an error
      if (data.code && data.msg) {
        console.error('[Binance] Futures klines error:', data.msg);
        return [];
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
      const url = `${this.futuresBaseUrl}/ticker/24hr?symbol=${symbol}`;
      const response = await fetch(url);
      return await response.json();
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
      // First check WebSocket cache
      const cachedPrice = this.prices.get(symbol);
      if (cachedPrice && Date.now() - cachedPrice.timestamp < 60000) {
        return cachedPrice.price;
      }

      // Fetch from REST API
      const url = `${this.futuresBaseUrl}/ticker/price?symbol=${symbol}`;
      const response = await fetch(url);
      const data = await response.json();

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
