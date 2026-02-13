/**
 * Binance WebSocket Service for Real-time Prices
 * Public API - No API key required
 */

class BinanceService {
  constructor() {
    this.ws = null
    this.subscribers = new Map()
    this.prices = new Map()
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.reconnectDelay = 3000
  }

  /**
   * Connect to Binance WebSocket
   * @param {Array<string>} symbols - Array of symbols (e.g., ['BTCUSDT', 'ETHUSDT'])
   */
  connect(symbols) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log('✅ WebSocket already connected')
      return
    }

    // Format symbols for Binance (btcusdt, ethusdt, etc.)
    const streams = symbols
      .map(symbol => `${symbol.toLowerCase()}@ticker`)
      .join('/')

    const wsUrl = `wss://stream.binance.com:9443/stream?streams=${streams}`

    console.log('🔌 Connecting to Binance WebSocket:', wsUrl)

    this.ws = new WebSocket(wsUrl)

    this.ws.onopen = () => {
      console.log('✅ Connected to Binance WebSocket')
      this.reconnectAttempts = 0
    }

    this.ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data)

        if (message.stream && message.data) {
          const ticker = message.data
          const symbol = ticker.s // e.g., BTCUSDT

          const priceData = {
            symbol: symbol,
            price: parseFloat(ticker.c), // Current price
            priceChange: parseFloat(ticker.p), // Price change
            priceChangePercent: parseFloat(ticker.P), // Price change %
            high: parseFloat(ticker.h), // 24h high
            low: parseFloat(ticker.l), // 24h low
            volume: parseFloat(ticker.v), // 24h volume
            quoteVolume: parseFloat(ticker.q), // 24h quote volume
            timestamp: ticker.E // Event time
          }

          // Store price
          this.prices.set(symbol, priceData)

          // Notify subscribers
          this.notifySubscribers(symbol, priceData)
        }
      } catch (error) {
        console.error('❌ Error parsing WebSocket message:', error)
      }
    }

    this.ws.onerror = (error) => {
      console.error('❌ WebSocket error:', error)
    }

    this.ws.onclose = () => {
      console.log('🔌 WebSocket closed')
      this.attemptReconnect(symbols)
    }
  }

  /**
   * Reconnect logic with exponential backoff
   */
  attemptReconnect(symbols) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      console.log(`🔄 Reconnecting... (Attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`)

      setTimeout(() => {
        this.connect(symbols)
      }, this.reconnectDelay)
    } else {
      console.error('❌ Max reconnection attempts reached')
    }
  }

  /**
   * Subscribe to price updates for a symbol
   * @param {string} symbol - Symbol to subscribe to (e.g., 'BTCUSDT')
   * @param {Function} callback - Callback function to receive price updates
   * @returns {Function} Unsubscribe function
   */
  subscribe(symbol, callback) {
    if (!this.subscribers.has(symbol)) {
      this.subscribers.set(symbol, [])
    }

    this.subscribers.get(symbol).push(callback)

    // If price already available, call callback immediately
    if (this.prices.has(symbol)) {
      callback(this.prices.get(symbol))
    }

    // Return unsubscribe function
    return () => {
      const callbacks = this.subscribers.get(symbol)
      if (callbacks) {
        const index = callbacks.indexOf(callback)
        if (index > -1) {
          callbacks.splice(index, 1)
        }
      }
    }
  }

  /**
   * Notify all subscribers of a symbol
   */
  notifySubscribers(symbol, priceData) {
    const callbacks = this.subscribers.get(symbol)
    if (callbacks) {
      callbacks.forEach(callback => callback(priceData))
    }
  }

  /**
   * Get current price for a symbol
   * @param {string} symbol
   * @returns {Object|undefined}
   */
  getPrice(symbol) {
    return this.prices.get(symbol)
  }

  /**
   * Get all current prices
   * @returns {Object}
   */
  getAllPrices() {
    return Object.fromEntries(this.prices)
  }

  /**
   * Disconnect WebSocket and clear data
   */
  disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    this.subscribers.clear()
    this.prices.clear()
    console.log('🔌 Binance WebSocket disconnected')
  }

  /**
   * Fetch historical candlestick data (for charts)
   * @param {string} symbol - e.g., 'BTCUSDT'
   * @param {string} interval - e.g., '1h', '4h', '1d'
   * @param {number} limit - Number of candles (default: 100)
   * @returns {Promise<Array>}
   */
  async getCandlestickData(symbol, interval = '1h', limit = 100) {
    try {
      // 🔥 FIX: Normalize timeframe to lowercase (Binance requires lowercase)
      const normalizedInterval = interval.toLowerCase();

      // 🔥 FIX: Use Futures API (fapi.binance.com) to avoid CORS issues
      // Futures API has better CORS support than spot API (api.binance.com)
      const url = `https://fapi.binance.com/fapi/v1/klines?symbol=${symbol}&interval=${normalizedInterval}&limit=${limit}`;

      console.log(`[BinanceService] Fetching klines: ${symbol} ${normalizedInterval}`);

      const response = await fetch(url);

      if (!response.ok) {
        // Fallback to spot API if futures fails (some coins may not be on futures)
        console.warn(`[BinanceService] Futures API failed for ${symbol}, trying spot API...`);
        const spotUrl = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${normalizedInterval}&limit=${limit}`;
        const spotResponse = await fetch(spotUrl);

        if (!spotResponse.ok) {
          throw new Error(`HTTP error! status: ${spotResponse.status}`);
        }

        const spotData = await spotResponse.json();
        return this._formatCandleData(spotData);
      }

      const data = await response.json();
      return this._formatCandleData(data);
    } catch (error) {
      console.error('❌ Error fetching candlestick data:', error);
      throw error;
    }
  }

  // Helper to format candle data
  _formatCandleData(data) {
    return data.map(candle => ({
      openTime: candle[0],
      open: parseFloat(candle[1]),
      high: parseFloat(candle[2]),
      low: parseFloat(candle[3]),
      close: parseFloat(candle[4]),
      volume: parseFloat(candle[5]),
      closeTime: candle[6],
      quoteVolume: parseFloat(candle[7]),
      trades: candle[8],
      timestamp: new Date(candle[0])
    }));
  }
}

// Export singleton instance
export const binanceService = new BinanceService()
