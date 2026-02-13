/**
 * Binance WebSocket Service
 * Real-time price streaming with NO DELAY
 *
 * Features:
 * - Real-time trade stream from Binance
 * - Auto-reconnection with exponential backoff
 * - Connection pooling (one WS per symbol)
 * - Multiple subscribers per symbol
 * - Price caching
 * - Graceful cleanup
 */

const BINANCE_WS_BASE_URL = 'wss://stream.binance.com:9443/ws';
const MAX_RECONNECT_ATTEMPTS = 5;
const INITIAL_RECONNECT_DELAY = 1000; // 1 second
const MAX_RECONNECT_DELAY = 30000; // 30 seconds

class BinanceWebSocketManager {
  constructor() {
    // Connection management
    this.connections = new Map(); // symbol -> { ws, subscribers, reconnectAttempts, reconnectTimer }

    // Price cache
    this.priceCache = new Map(); // symbol -> { price, timestamp }

    // Debug mode
    this.debug = process.env.NODE_ENV === 'development';
  }

  /**
   * Format symbol for Binance WebSocket
   * @param {string} symbol - Trading pair (e.g., 'BTCUSDT')
   * @returns {string} Formatted symbol (e.g., 'btcusdt')
   */
  formatSymbol(symbol) {
    return symbol.toLowerCase().replace(/[^a-z0-9]/g, '');
  }

  /**
   * Subscribe to real-time price updates for a symbol
   * @param {string} symbol - Trading pair (e.g., 'BTCUSDT')
   * @param {Function} callback - Called with price updates: { symbol, price, timestamp }
   * @returns {Function} Unsubscribe function
   */
  subscribe(symbol, callback) {
    const formattedSymbol = this.formatSymbol(symbol);

    if (!this.connections.has(formattedSymbol)) {
      // Create new connection for this symbol
      this.connect(formattedSymbol);
    }

    const connection = this.connections.get(formattedSymbol);

    // Add subscriber
    const subscriberId = `${formattedSymbol}_${Date.now()}_${Math.random()}`;
    connection.subscribers.set(subscriberId, callback);

    this.log(`Subscribed to ${formattedSymbol.toUpperCase()} (${connection.subscribers.size} subscribers)`);

    // Return cached price immediately if available
    if (this.priceCache.has(formattedSymbol)) {
      const cached = this.priceCache.get(formattedSymbol);
      callback({
        symbol: symbol.toUpperCase(),
        price: cached.price,
        timestamp: cached.timestamp,
        cached: true
      });
    }

    // Return unsubscribe function
    return () => this.unsubscribe(formattedSymbol, subscriberId);
  }

  /**
   * Unsubscribe from price updates
   * @param {string} formattedSymbol - Formatted symbol
   * @param {string} subscriberId - Subscriber ID
   */
  unsubscribe(formattedSymbol, subscriberId) {
    const connection = this.connections.get(formattedSymbol);
    if (!connection) return;

    connection.subscribers.delete(subscriberId);
    this.log(`Unsubscribed from ${formattedSymbol.toUpperCase()} (${connection.subscribers.size} subscribers remaining)`);

    // If no more subscribers, close connection after 5 seconds
    if (connection.subscribers.size === 0) {
      setTimeout(() => {
        if (connection.subscribers.size === 0) {
          this.disconnect(formattedSymbol);
        }
      }, 5000);
    }
  }

  /**
   * Connect to Binance WebSocket for a symbol
   * @param {string} formattedSymbol - Formatted symbol
   */
  connect(formattedSymbol) {
    const url = `${BINANCE_WS_BASE_URL}/${formattedSymbol}@trade`;

    try {
      const ws = new WebSocket(url);

      // Initialize connection data
      const connection = {
        ws,
        subscribers: new Map(),
        reconnectAttempts: 0,
        reconnectTimer: null
      };

      this.connections.set(formattedSymbol, connection);

      // WebSocket event handlers
      ws.onopen = () => {
        this.log(`✅ Connected to ${formattedSymbol.toUpperCase()}`);
        connection.reconnectAttempts = 0; // Reset reconnect counter
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          // Binance trade stream format:
          // { e: 'trade', s: 'BTCUSDT', p: '43210.50', ... }

          const price = parseFloat(data.p);
          const timestamp = data.T || Date.now();

          // Update cache
          this.priceCache.set(formattedSymbol, { price, timestamp });

          // Notify all subscribers
          const update = {
            symbol: data.s || formattedSymbol.toUpperCase(),
            price,
            timestamp,
            cached: false
          };

          connection.subscribers.forEach(callback => {
            try {
              callback(update);
            } catch (error) {
              console.error(`Error in subscriber callback for ${formattedSymbol}:`, error);
            }
          });
        } catch (error) {
          console.error(`Error parsing WebSocket message for ${formattedSymbol}:`, error);
        }
      };

      ws.onerror = (error) => {
        console.error(`WebSocket error for ${formattedSymbol}:`, error);
      };

      ws.onclose = (event) => {
        this.log(`Disconnected from ${formattedSymbol.toUpperCase()} (code: ${event.code})`);

        // Only attempt reconnect if there are still subscribers
        if (connection.subscribers.size > 0) {
          this.reconnect(formattedSymbol);
        }
      };

    } catch (error) {
      console.error(`Failed to create WebSocket for ${formattedSymbol}:`, error);
    }
  }

  /**
   * Reconnect with exponential backoff
   * @param {string} formattedSymbol - Formatted symbol
   */
  reconnect(formattedSymbol) {
    const connection = this.connections.get(formattedSymbol);
    if (!connection) return;

    // Clear any existing reconnect timer
    if (connection.reconnectTimer) {
      clearTimeout(connection.reconnectTimer);
    }

    // Check max reconnect attempts
    if (connection.reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      console.error(`Max reconnect attempts reached for ${formattedSymbol.toUpperCase()}`);

      // Notify subscribers about connection failure
      connection.subscribers.forEach(callback => {
        try {
          callback({
            symbol: formattedSymbol.toUpperCase(),
            error: 'Connection lost',
            reconnectFailed: true
          });
        } catch (error) {
          console.error('Error notifying subscriber:', error);
        }
      });

      return;
    }

    // Calculate delay with exponential backoff
    const delay = Math.min(
      INITIAL_RECONNECT_DELAY * Math.pow(2, connection.reconnectAttempts),
      MAX_RECONNECT_DELAY
    );

    connection.reconnectAttempts++;
    this.log(`Reconnecting to ${formattedSymbol.toUpperCase()} in ${delay}ms (attempt ${connection.reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`);

    connection.reconnectTimer = setTimeout(() => {
      this.connect(formattedSymbol);
    }, delay);
  }

  /**
   * Disconnect from a symbol
   * @param {string} formattedSymbol - Formatted symbol
   */
  disconnect(formattedSymbol) {
    const connection = this.connections.get(formattedSymbol);
    if (!connection) return;

    // Clear reconnect timer
    if (connection.reconnectTimer) {
      clearTimeout(connection.reconnectTimer);
    }

    // Close WebSocket
    if (connection.ws && connection.ws.readyState === WebSocket.OPEN) {
      connection.ws.close();
    }

    // Remove from connections
    this.connections.delete(formattedSymbol);
    this.log(`Disconnected from ${formattedSymbol.toUpperCase()}`);
  }

  /**
   * Get current cached price for a symbol
   * @param {string} symbol - Trading pair
   * @returns {Object|null} { price, timestamp } or null if not cached
   */
  getCurrentPrice(symbol) {
    const formattedSymbol = this.formatSymbol(symbol);
    return this.priceCache.get(formattedSymbol) || null;
  }

  /**
   * Disconnect all connections and cleanup
   */
  disconnectAll() {
    this.log('Disconnecting all WebSocket connections');

    this.connections.forEach((connection, symbol) => {
      this.disconnect(symbol);
    });

    this.connections.clear();
    this.priceCache.clear();
  }

  /**
   * Get connection stats
   * @returns {Object} Connection statistics
   */
  getStats() {
    const stats = {
      activeConnections: this.connections.size,
      cachedPrices: this.priceCache.size,
      symbols: []
    };

    this.connections.forEach((connection, symbol) => {
      stats.symbols.push({
        symbol: symbol.toUpperCase(),
        subscribers: connection.subscribers.size,
        reconnectAttempts: connection.reconnectAttempts,
        connected: connection.ws.readyState === WebSocket.OPEN
      });
    });

    return stats;
  }

  /**
   * Debug logging
   * @param {string} message - Log message
   */
  log(message) {
    if (this.debug) {
      console.log(`[BinanceWS] ${message}`);
    }
  }
}

// Export singleton instance
const binanceWebSocketManager = new BinanceWebSocketManager();

export default binanceWebSocketManager;

/**
 * Example usage:
 *
 * import binanceWS from './services/binanceWebSocket';
 *
 * // Subscribe to BTC price
 * const unsubscribe = binanceWS.subscribe('BTCUSDT', (update) => {
 *   console.log('BTC Price:', update.price);
 * });
 *
 * // Later, unsubscribe
 * unsubscribe();
 *
 * // Get current cached price
 * const btcPrice = binanceWS.getCurrentPrice('BTCUSDT');
 * console.log('Cached BTC Price:', btcPrice.price);
 */
