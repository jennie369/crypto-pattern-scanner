/**
 * Binance Futures API Service
 * Provides REST API and WebSocket connections for realtime data
 */

const FUTURES_API_BASE = 'https://fapi.binance.com';
const FUTURES_WS_BASE = 'wss://fstream.binance.com';

export class BinanceAPI {
  constructor() {
    this.wsConnections = new Map();
    this.connectionStates = new Map(); // Track connection state per symbol
    this.reconnectAttempts = new Map(); // Track reconnection attempts
    this.heartbeatIntervals = new Map(); // Track heartbeat timers
    this.reconnectTimeouts = new Map(); // Track reconnection timeouts
  }

  /**
   * REST API: Get historical klines
   * @param {string} symbol - e.g., "BTCUSDT"
   * @param {string} interval - e.g., "15m", "1h", "4h", "1d"
   * @param {number} limit - number of candles (default: 500)
   */
  async getKlines(symbol, interval = '15m', limit = 500) {
    try {
      const url = `${FUTURES_API_BASE}/fapi/v1/klines`;
      const params = new URLSearchParams({
        symbol: symbol.toUpperCase(),
        interval,
        limit: limit.toString()
      });

      console.log(`📡 Fetching klines: ${url}?${params}`);
      const response = await fetch(`${url}?${params}`);

      // Check if response is OK before parsing
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${response.statusText}. ${errorText}`);
      }

      const data = await response.json();

      // Validate data format
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error('API returned empty or invalid data');
      }

      console.log(`✅ Received ${data.length} candles for ${symbol}`);

      // Convert to Lightweight Charts format
      return data.map(candle => ({
        time: candle[0] / 1000, // Convert ms to seconds
        open: parseFloat(candle[1]),
        high: parseFloat(candle[2]),
        low: parseFloat(candle[3]),
        close: parseFloat(candle[4]),
        volume: parseFloat(candle[5])
      }));
    } catch (error) {
      console.error(`❌ Error fetching klines for ${symbol}:`, error.message || error);
      throw error; // Re-throw instead of returning empty array
    }
  }

  /**
   * Get connection status for a symbol
   */
  getConnectionStatus(symbol) {
    return this.connectionStates.get(symbol) || 'disconnected';
  }

  /**
   * WebSocket: Subscribe to realtime klines with auto-reconnection
   * @param {string} symbol - e.g., "BTCUSDT"
   * @param {string} interval - e.g., "1m"
   * @param {Function} onUpdate - callback for updates
   * @param {Function} onStateChange - callback for connection state changes
   */
  subscribeKlines(symbol, interval, onUpdate, onStateChange = null) {
    const MAX_RECONNECT_ATTEMPTS = 10;
    const BASE_RECONNECT_DELAY = 1000; // 1 second
    const MAX_RECONNECT_DELAY = 16000; // 16 seconds

    const connect = () => {
      // Clean up existing connection if any
      this.cleanupConnection(symbol);

      const streamName = `${symbol.toLowerCase()}@kline_${interval}`;
      const wsUrl = `${FUTURES_WS_BASE}/ws/${streamName}`;

      console.log(`🔌 Connecting to ${symbol} WebSocket...`);
      this.setConnectionState(symbol, 'connecting', onStateChange);

      const ws = new WebSocket(wsUrl);
      let lastMessageTime = Date.now();

      // Connection opened successfully
      ws.onopen = () => {
        console.log(`✅ ${symbol} WebSocket connected`);
        this.reconnectAttempts.set(symbol, 0); // Reset attempts
        this.setConnectionState(symbol, 'connected', onStateChange);
        lastMessageTime = Date.now();

        // Start heartbeat monitoring
        this.startHeartbeat(symbol, ws, lastMessageTime);
      };

      // Receive message
      ws.onmessage = (event) => {
        lastMessageTime = Date.now();

        try {
          const data = JSON.parse(event.data);
          const kline = data.k;

          const candle = {
            time: kline.t / 1000,
            open: parseFloat(kline.o),
            high: parseFloat(kline.h),
            low: parseFloat(kline.l),
            close: parseFloat(kline.c),
            volume: parseFloat(kline.v)
          };

          onUpdate(candle, kline.x); // x = is candle closed?
        } catch (error) {
          console.error(`❌ Error parsing ${symbol} message:`, error);
        }
      };

      // Connection closed
      ws.onclose = (event) => {
        console.log(`🔌 ${symbol} WebSocket closed (code: ${event.code}, reason: ${event.reason})`);
        this.cleanupHeartbeat(symbol);

        const currentAttempts = this.reconnectAttempts.get(symbol) || 0;

        if (currentAttempts < MAX_RECONNECT_ATTEMPTS) {
          // Calculate exponential backoff delay
          const delay = Math.min(
            BASE_RECONNECT_DELAY * Math.pow(2, currentAttempts),
            MAX_RECONNECT_DELAY
          );

          this.reconnectAttempts.set(symbol, currentAttempts + 1);
          this.setConnectionState(symbol, 'reconnecting', onStateChange);

          console.log(`🔄 ${symbol} reconnecting in ${delay}ms (attempt ${currentAttempts + 1}/${MAX_RECONNECT_ATTEMPTS})`);

          const timeoutId = setTimeout(() => {
            connect();
          }, delay);

          this.reconnectTimeouts.set(symbol, timeoutId);
        } else {
          console.error(`❌ ${symbol} Max reconnection attempts reached`);
          this.setConnectionState(symbol, 'failed', onStateChange);
        }
      };

      // Connection error
      ws.onerror = (error) => {
        console.error(`❌ ${symbol} WebSocket error:`, error);
        this.setConnectionState(symbol, 'error', onStateChange);
      };

      this.wsConnections.set(symbol, ws);
    };

    // Start initial connection
    connect();
  }

  /**
   * Start heartbeat monitoring
   */
  startHeartbeat(symbol, ws, lastMessageTime) {
    const HEARTBEAT_INTERVAL = 30000; // Check every 30 seconds
    const MAX_MESSAGE_AGE = 120000; // Reconnect if no message for 2 minutes

    const intervalId = setInterval(() => {
      const timeSinceLastMessage = Date.now() - lastMessageTime;

      if (timeSinceLastMessage > MAX_MESSAGE_AGE) {
        console.warn(`⚠️ ${symbol} No message for ${Math.round(timeSinceLastMessage / 1000)}s, reconnecting...`);
        ws.close(); // Trigger reconnection via onclose handler
        this.cleanupHeartbeat(symbol);
      } else {
        console.log(`💓 ${symbol} heartbeat OK (last message: ${Math.round(timeSinceLastMessage / 1000)}s ago)`);
      }
    }, HEARTBEAT_INTERVAL);

    this.heartbeatIntervals.set(symbol, intervalId);
  }

  /**
   * Clean up heartbeat interval
   */
  cleanupHeartbeat(symbol) {
    const intervalId = this.heartbeatIntervals.get(symbol);
    if (intervalId) {
      clearInterval(intervalId);
      this.heartbeatIntervals.delete(symbol);
    }
  }

  /**
   * Set connection state and notify listeners
   */
  setConnectionState(symbol, state, onStateChange) {
    this.connectionStates.set(symbol, state);
    console.log(`🔌 ${symbol} connection state: ${state}`);

    if (onStateChange) {
      onStateChange(state);
    }
  }

  /**
   * Clean up connection resources
   */
  cleanupConnection(symbol) {
    // Clear reconnection timeout
    const timeoutId = this.reconnectTimeouts.get(symbol);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.reconnectTimeouts.delete(symbol);
    }

    // Clear heartbeat
    this.cleanupHeartbeat(symbol);

    // Close WebSocket if exists
    const ws = this.wsConnections.get(symbol);
    if (ws && ws.readyState !== WebSocket.CLOSED) {
      ws.close();
    }
  }

  /**
   * WebSocket: Subscribe to ticker (24h stats)
   */
  subscribeTicker(symbol, onUpdate) {
    const streamName = `${symbol.toLowerCase()}@ticker`;
    const ws = new WebSocket(`${FUTURES_WS_BASE}/ws/${streamName}`);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onUpdate({
        symbol: data.s,
        price: parseFloat(data.c),
        priceChange: parseFloat(data.p),
        priceChangePercent: parseFloat(data.P),
        high24h: parseFloat(data.h),
        low24h: parseFloat(data.l),
        volume24h: parseFloat(data.v)
      });
    };

    return ws;
  }

  /**
   * Close WebSocket connection and cleanup resources
   */
  unsubscribe(symbol) {
    console.log(`🔌 Unsubscribing from ${symbol}`);
    this.cleanupConnection(symbol);
    this.wsConnections.delete(symbol);
    this.connectionStates.delete(symbol);
    this.reconnectAttempts.delete(symbol);
  }

  /**
   * Close all connections and cleanup all resources
   */
  closeAll() {
    console.log('🔌 Closing all connections');
    this.wsConnections.forEach((ws, symbol) => {
      this.cleanupConnection(symbol);
    });
    this.wsConnections.clear();
    this.connectionStates.clear();
    this.reconnectAttempts.clear();
    this.heartbeatIntervals.clear();
    this.reconnectTimeouts.clear();
  }
}

// Singleton instance
export const binanceApi = new BinanceAPI();
