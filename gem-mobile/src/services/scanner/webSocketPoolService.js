/**
 * WebSocketPoolService - Single pooled WebSocket connection
 *
 * VAN DE TRUOC:
 * - Tao WebSocket rieng cho moi symbol (N connections)
 * - Memory leak khi khong cleanup
 * - Price updates khong debounce -> UI lag
 *
 * GIAI PHAP:
 * - Single connection cho tat ca symbols
 * - Auto-reconnect voi exponential backoff
 * - Debounced price updates (100ms batching)
 * - Memory-efficient subscription management
 *
 * PERFORMANCE: N connections -> 1 connection (95% reduction)
 *
 * USAGE:
 * import { wsPool, useWebSocketPrice, useWebSocketPrices } from '../services/scanner/webSocketPoolService';
 *
 * // In component - single symbol
 * const price = useWebSocketPrice('BTCUSDT');
 *
 * // Multiple symbols
 * const prices = useWebSocketPrices(['BTCUSDT', 'ETHUSDT']);
 *
 * // Manual subscription
 * const unsubscribe = wsPool.subscribe('BTCUSDT', (data) => { ... });
 */

import { useEffect, useState, useRef, useMemo } from 'react';
import { AppState } from 'react-native';

// Constants
const WS_URL = 'wss://stream.binance.com:9443/ws';
const BATCH_INTERVAL = 100; // ms
const RECONNECT_BASE_DELAY = 1000; // ms
const MAX_RECONNECT_ATTEMPTS = 10;
const MAX_SYMBOLS_PER_CONNECTION = 200;

class WebSocketPoolService {
  constructor() {
    this.ws = null;
    this.subscriptions = new Map(); // symbol -> Set of callbacks
    this.priceBuffer = {}; // Batched price updates
    this.batchInterval = null;
    this.reconnectAttempts = 0;
    this.isConnecting = false;
    this.isConnected = false;
    this.permanentlyDisconnected = false;
    this.appStateSubscription = null;
    this.messageId = 1;

    // Debug mode
    this.DEBUG = __DEV__ || false;

    // Metrics
    this.metrics = {
      messagesReceived: 0,
      updatesSent: 0,
      reconnects: 0,
    };
  }

  /**
   * Initialize the WebSocket pool
   * @returns {void}
   */
  init() {
    if (this.ws || this.isConnecting) {
      if (this.DEBUG) {
        console.log('[WSPool] Already initialized or connecting');
      }
      return;
    }

    this._connect();
    this._startBatchInterval();
    this._setupAppStateListener();
  }

  /**
   * Subscribe to price updates for a symbol
   * @param {string} symbol - Trading symbol (e.g., 'BTCUSDT')
   * @param {function} callback - Called with { symbol, price, change24h, high24h, low24h, volume }
   * @returns {function} Unsubscribe function
   */
  subscribe(symbol, callback) {
    if (!symbol || typeof callback !== 'function') {
      console.warn('[WSPool] Invalid subscription params');
      return () => {};
    }

    const upperSymbol = symbol.toUpperCase();

    // Add to subscriptions
    if (!this.subscriptions.has(upperSymbol)) {
      this.subscriptions.set(upperSymbol, new Set());

      // Subscribe on WebSocket if connected
      if (this.isConnected) {
        this._subscribeSymbol(upperSymbol);
      }
    }

    this.subscriptions.get(upperSymbol).add(callback);

    if (this.DEBUG) {
      console.log(`[WSPool] Subscribed to ${upperSymbol}, total subs: ${this.subscriptions.size}`);
    }

    // Return unsubscribe function
    return () => {
      this.unsubscribe(upperSymbol, callback);
    };
  }

  /**
   * Unsubscribe from price updates
   * @param {string} symbol - Trading symbol
   * @param {function} callback - The callback to remove
   */
  unsubscribe(symbol, callback) {
    const upperSymbol = symbol.toUpperCase();

    if (this.subscriptions.has(upperSymbol)) {
      this.subscriptions.get(upperSymbol).delete(callback);

      // If no more callbacks, unsubscribe from WebSocket
      if (this.subscriptions.get(upperSymbol).size === 0) {
        this.subscriptions.delete(upperSymbol);

        if (this.isConnected) {
          this._unsubscribeSymbol(upperSymbol);
        }
      }
    }

    if (this.DEBUG) {
      console.log(`[WSPool] Unsubscribed from ${upperSymbol}, remaining subs: ${this.subscriptions.size}`);
    }
  }

  /**
   * Subscribe to multiple symbols at once
   * @param {array} symbols - Array of symbols
   * @param {function} callback - Callback for all price updates
   * @returns {function} Unsubscribe all function
   */
  subscribeMultiple(symbols, callback) {
    if (!symbols || !Array.isArray(symbols)) {
      return () => {};
    }

    const unsubscribes = symbols.map(s => this.subscribe(s, callback));

    return () => {
      unsubscribes.forEach(unsub => unsub());
    };
  }

  /**
   * Get current price for a symbol (if available in buffer)
   * @param {string} symbol - Trading symbol
   * @returns {object|null} Price data or null
   */
  getCurrentPrice(symbol) {
    const upperSymbol = symbol.toUpperCase();
    return this.priceBuffer[upperSymbol] || null;
  }

  /**
   * Get all current prices
   * @returns {object} { symbol: priceData }
   */
  getAllPrices() {
    return { ...this.priceBuffer };
  }

  /**
   * Check if connected
   * @returns {boolean}
   */
  isPoolConnected() {
    return this.isConnected;
  }

  /**
   * Get subscription count
   * @returns {number}
   */
  getSubscriptionCount() {
    return this.subscriptions.size;
  }

  /**
   * Disconnect and cleanup
   */
  destroy() {
    this._stopBatchInterval();
    this._removeAppStateListener();

    if (this.ws) {
      try {
        this.ws.close();
      } catch (e) {
        // Ignore close errors
      }
      this.ws = null;
    }

    this.subscriptions.clear();
    this.priceBuffer = {};
    this.isConnected = false;
    this.isConnecting = false;
    this.reconnectAttempts = 0;
    this.permanentlyDisconnected = false;

    if (this.DEBUG) {
      console.log('[WSPool] Destroyed');
    }
  }

  /**
   * Force reconnect
   */
  reconnect() {
    this.destroy();
    this.reconnectAttempts = 0;
    this.init();
  }

  /**
   * Get metrics
   */
  getMetrics() {
    return {
      ...this.metrics,
      isConnected: this.isConnected,
      subscriptionCount: this.subscriptions.size,
      reconnectAttempts: this.reconnectAttempts,
    };
  }

  // === PRIVATE METHODS ===

  _connect() {
    if (this.isConnecting || this.isConnected) return;

    this.isConnecting = true;

    try {
      if (this.DEBUG) {
        console.log('[WSPool] Connecting to:', WS_URL);
      }

      this.ws = new WebSocket(WS_URL);

      this.ws.onopen = () => {
        console.log('[WSPool] Connected');
        this.isConnected = true;
        this.isConnecting = false;
        this.reconnectAttempts = 0;

        // Subscribe to all existing symbols
        if (this.subscriptions.size > 0) {
          this._subscribeAllSymbols();
        }
      };

      this.ws.onmessage = (event) => {
        this.metrics.messagesReceived++;
        try {
          const data = JSON.parse(event.data);
          this._handleMessage(data);
        } catch (err) {
          if (this.DEBUG) {
            console.error('[WSPool] Message parse error:', err);
          }
        }
      };

      this.ws.onerror = (error) => {
        console.error('[WSPool] Error:', error?.message || error);
      };

      this.ws.onclose = (event) => {
        console.log('[WSPool] Closed:', event?.code, event?.reason);
        this.isConnected = false;
        this.isConnecting = false;
        this.ws = null;

        // Attempt reconnect
        this._scheduleReconnect();
      };

    } catch (err) {
      console.error('[WSPool] Connect error:', err);
      this.isConnecting = false;
      this._scheduleReconnect();
    }
  }

  _handleMessage(data) {
    // Handle subscription response
    if (data.result === null && data.id) {
      if (this.DEBUG) {
        console.log('[WSPool] Subscription confirmed, id:', data.id);
      }
      return;
    }

    // Handle ticker data
    if (data.e === '24hrTicker') {
      const symbol = data.s; // Symbol
      const price = parseFloat(data.c); // Current price
      const change24h = parseFloat(data.P); // 24h change percent
      const high24h = parseFloat(data.h);
      const low24h = parseFloat(data.l);
      const volume = parseFloat(data.v);
      const quoteVolume = parseFloat(data.q);

      // Buffer the update
      this.priceBuffer[symbol] = {
        symbol,
        price,
        change24h,
        high24h,
        low24h,
        volume,
        quoteVolume,
        timestamp: Date.now(),
      };
    }

    // Handle mini ticker (lighter weight)
    if (data.e === '24hrMiniTicker') {
      const symbol = data.s;
      const price = parseFloat(data.c);

      this.priceBuffer[symbol] = {
        ...this.priceBuffer[symbol],
        symbol,
        price,
        timestamp: Date.now(),
      };
    }
  }

  _subscribeAllSymbols() {
    const symbols = Array.from(this.subscriptions.keys());

    if (symbols.length === 0) return;

    // Batch subscribe (max 200 per message)
    for (let i = 0; i < symbols.length; i += MAX_SYMBOLS_PER_CONNECTION) {
      const batch = symbols.slice(i, i + MAX_SYMBOLS_PER_CONNECTION);
      this._subscribeBatch(batch);
    }
  }

  _subscribeBatch(symbols) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

    const streams = symbols.map(s => `${s.toLowerCase()}@ticker`);

    const msg = {
      method: 'SUBSCRIBE',
      params: streams,
      id: this.messageId++,
    };

    try {
      this.ws.send(JSON.stringify(msg));
      if (this.DEBUG) {
        console.log('[WSPool] Subscribed to batch:', symbols.length, 'symbols');
      }
    } catch (err) {
      console.error('[WSPool] Subscribe error:', err);
    }
  }

  _subscribeSymbol(symbol) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

    const msg = {
      method: 'SUBSCRIBE',
      params: [`${symbol.toLowerCase()}@ticker`],
      id: this.messageId++,
    };

    try {
      this.ws.send(JSON.stringify(msg));
      if (this.DEBUG) {
        console.log('[WSPool] Subscribing to:', symbol);
      }
    } catch (err) {
      console.error('[WSPool] Subscribe error:', err);
    }
  }

  _unsubscribeSymbol(symbol) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

    const msg = {
      method: 'UNSUBSCRIBE',
      params: [`${symbol.toLowerCase()}@ticker`],
      id: this.messageId++,
    };

    try {
      this.ws.send(JSON.stringify(msg));
      if (this.DEBUG) {
        console.log('[WSPool] Unsubscribing from:', symbol);
      }
    } catch (err) {
      console.error('[WSPool] Unsubscribe error:', err);
    }
  }

  _startBatchInterval() {
    if (this.batchInterval) return;

    this.batchInterval = setInterval(() => {
      this._flushPriceBuffer();
    }, BATCH_INTERVAL);
  }

  _stopBatchInterval() {
    if (this.batchInterval) {
      clearInterval(this.batchInterval);
      this.batchInterval = null;
    }
  }

  _flushPriceBuffer() {
    const updates = { ...this.priceBuffer };

    if (Object.keys(updates).length === 0) return;

    // Notify subscribers
    Object.entries(updates).forEach(([symbol, data]) => {
      const callbacks = this.subscriptions.get(symbol);
      if (callbacks) {
        callbacks.forEach(cb => {
          try {
            cb(data);
            this.metrics.updatesSent++;
          } catch (err) {
            if (this.DEBUG) {
              console.error('[WSPool] Callback error:', err);
            }
          }
        });
      }
    });
  }

  /**
   * Reset reconnect counter and reconnect - used by health monitor
   * to revive permanently dead connections
   */
  resetAndReconnect() {
    console.log('[WSPool] resetAndReconnect called - resetting reconnect counter');
    this.reconnectAttempts = 0;
    this.permanentlyDisconnected = false;
    if (!this.isConnected && !this.isConnecting) {
      this._connect();
      this._startBatchInterval();
      this._setupAppStateListener();
    }
  }

  _scheduleReconnect() {
    if (this.reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      console.error('[WSPool] Max reconnect attempts reached');
      this.permanentlyDisconnected = true;
      return;
    }

    // Don't reconnect if no subscriptions
    if (this.subscriptions.size === 0) {
      if (this.DEBUG) {
        console.log('[WSPool] No subscriptions, skipping reconnect');
      }
      return;
    }

    const delay = RECONNECT_BASE_DELAY * Math.pow(2, this.reconnectAttempts);
    this.reconnectAttempts++;
    this.metrics.reconnects++;

    console.log(`[WSPool] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);

    setTimeout(() => {
      this._connect();
    }, delay);
  }

  _setupAppStateListener() {
    if (this.appStateSubscription) return;

    this.appStateSubscription = AppState.addEventListener('change', (state) => {
      if (state === 'active' && !this.isConnected && !this.isConnecting && this.subscriptions.size > 0) {
        console.log('[WSPool] App active, reconnecting...');
        this.reconnectAttempts = 0;
        this._connect();
      }
    });
  }

  _removeAppStateListener() {
    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
      this.appStateSubscription = null;
    }
  }
}

// Singleton instance
export const wsPool = new WebSocketPoolService();

// === REACT HOOKS ===

/**
 * Hook for subscribing to a single symbol's price
 * @param {string} symbol - Trading symbol
 * @returns {object|null} Price data or null
 */
export const useWebSocketPrice = (symbol) => {
  const [price, setPrice] = useState(null);

  useEffect(() => {
    if (!symbol) return;

    wsPool.init(); // Ensure initialized

    const unsubscribe = wsPool.subscribe(symbol, (data) => {
      setPrice(data);
    });

    return unsubscribe;
  }, [symbol]);

  return price;
};

/**
 * Hook for subscribing to multiple symbols' prices
 * @param {array} symbols - Array of trading symbols
 * @returns {object} { symbol: priceData }
 */
export const useWebSocketPrices = (symbols) => {
  const [prices, setPrices] = useState({});
  const symbolsKey = useMemo(() => symbols?.sort().join(',') || '', [symbols]);

  useEffect(() => {
    if (!symbols || symbols.length === 0) return;

    wsPool.init(); // Ensure initialized

    const unsubscribe = wsPool.subscribeMultiple(symbols, (data) => {
      setPrices(prev => ({
        ...prev,
        [data.symbol]: data,
      }));
    });

    return unsubscribe;
  }, [symbolsKey]);

  return prices;
};

/**
 * Hook for connection status
 * @returns {boolean} Is connected
 */
export const useWebSocketStatus = () => {
  const [isConnected, setIsConnected] = useState(wsPool.isPoolConnected());

  useEffect(() => {
    const interval = setInterval(() => {
      setIsConnected(wsPool.isPoolConnected());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return isConnected;
};

// Named exports
export { WebSocketPoolService };

// Default export
export default wsPool;
