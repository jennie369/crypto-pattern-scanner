/**
 * Binance Futures API Service
 * Provides REST API and WebSocket connections for realtime data
 */

import type {
  Candle,
  Timeframe,
  ConnectionState,
  TickerData,
  CandleUpdateCallback,
  ConnectionStateCallback,
  TickerUpdateCallback,
} from '../types';

const FUTURES_API_BASE = 'https://fapi.binance.com';
const FUTURES_WS_BASE = 'wss://fstream.binance.com';

/** Raw kline data from Binance API */
type BinanceKlineData = [
  number,   // 0: Open time
  string,   // 1: Open
  string,   // 2: High
  string,   // 3: Low
  string,   // 4: Close
  string,   // 5: Volume
  number,   // 6: Close time
  string,   // 7: Quote asset volume
  number,   // 8: Number of trades
  string,   // 9: Taker buy base asset volume
  string,   // 10: Taker buy quote asset volume
  string,   // 11: Ignore
];

/** WebSocket kline message */
interface BinanceKlineMessage {
  e: string;     // Event type
  E: number;     // Event time
  s: string;     // Symbol
  k: {
    t: number;   // Kline start time
    T: number;   // Kline close time
    s: string;   // Symbol
    i: string;   // Interval
    f: number;   // First trade ID
    L: number;   // Last trade ID
    o: string;   // Open price
    c: string;   // Close price
    h: string;   // High price
    l: string;   // Low price
    v: string;   // Base asset volume
    n: number;   // Number of trades
    x: boolean;  // Is this kline closed?
    q: string;   // Quote asset volume
    V: string;   // Taker buy base asset volume
    Q: string;   // Taker buy quote asset volume
    B: string;   // Ignore
  };
}

/** WebSocket ticker message */
interface BinanceTickerMessage {
  e: string;     // Event type
  E: number;     // Event time
  s: string;     // Symbol
  c: string;     // Close price
  p: string;     // Price change
  P: string;     // Price change percent
  h: string;     // High price
  l: string;     // Low price
  v: string;     // Total traded base asset volume
  q: string;     // Total traded quote asset volume
}

export class BinanceAPI {
  private wsConnections: Map<string, WebSocket>;
  private connectionStates: Map<string, ConnectionState>;
  private reconnectAttempts: Map<string, number>;
  private heartbeatIntervals: Map<string, NodeJS.Timeout>;
  private reconnectTimeouts: Map<string, NodeJS.Timeout>;

  constructor() {
    this.wsConnections = new Map();
    this.connectionStates = new Map();
    this.reconnectAttempts = new Map();
    this.heartbeatIntervals = new Map();
    this.reconnectTimeouts = new Map();
  }

  /**
   * REST API: Get historical klines
   * @param symbol - e.g., "BTCUSDT"
   * @param interval - e.g., "15m", "1h", "4h", "1d"
   * @param limit - number of candles (default: 500)
   */
  async getKlines(symbol: string, interval: Timeframe = '15m', limit: number = 500): Promise<Candle[]> {
    try {
      const url = `${FUTURES_API_BASE}/fapi/v1/klines`;
      const params = new URLSearchParams({
        symbol: symbol.toUpperCase(),
        interval,
        limit: limit.toString()
      });

      console.log(`📡 Fetching klines: ${url}?${params}`);
      const response = await fetch(`${url}?${params}`);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${response.statusText}. ${errorText}`);
      }

      const data = await response.json() as BinanceKlineData[];

      if (!Array.isArray(data) || data.length === 0) {
        throw new Error('API returned empty or invalid data');
      }

      console.log(`✅ Received ${data.length} candles for ${symbol}`);

      return data.map((candle): Candle => ({
        time: candle[0] / 1000,
        open: parseFloat(candle[1]),
        high: parseFloat(candle[2]),
        low: parseFloat(candle[3]),
        close: parseFloat(candle[4]),
        volume: parseFloat(candle[5])
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`❌ Error fetching klines for ${symbol}:`, errorMessage);
      throw error;
    }
  }

  /**
   * Get connection status for a symbol
   */
  getConnectionStatus(symbol: string): ConnectionState {
    return this.connectionStates.get(symbol) || 'disconnected';
  }

  /**
   * WebSocket: Subscribe to realtime klines with auto-reconnection
   * @param symbol - e.g., "BTCUSDT"
   * @param interval - e.g., "1m"
   * @param onUpdate - callback for updates
   * @param onStateChange - callback for connection state changes
   */
  subscribeKlines(
    symbol: string,
    interval: Timeframe,
    onUpdate: CandleUpdateCallback,
    onStateChange: ConnectionStateCallback | null = null
  ): void {
    const MAX_RECONNECT_ATTEMPTS = 10;
    const BASE_RECONNECT_DELAY = 1000;
    const MAX_RECONNECT_DELAY = 16000;

    const connect = (): void => {
      this.cleanupConnection(symbol);

      const streamName = `${symbol.toLowerCase()}@kline_${interval}`;
      const wsUrl = `${FUTURES_WS_BASE}/ws/${streamName}`;

      console.log(`🔌 Connecting to ${symbol} WebSocket...`);
      this.setConnectionState(symbol, 'connecting', onStateChange);

      const ws = new WebSocket(wsUrl);
      let lastMessageTime = Date.now();

      ws.onopen = (): void => {
        console.log(`✅ ${symbol} WebSocket connected`);
        this.reconnectAttempts.set(symbol, 0);
        this.setConnectionState(symbol, 'connected', onStateChange);
        lastMessageTime = Date.now();

        this.startHeartbeat(symbol, ws, () => lastMessageTime);
      };

      ws.onmessage = (event: MessageEvent): void => {
        lastMessageTime = Date.now();

        try {
          const data = JSON.parse(event.data as string) as BinanceKlineMessage;
          const kline = data.k;

          const candle: Candle = {
            time: kline.t / 1000,
            open: parseFloat(kline.o),
            high: parseFloat(kline.h),
            low: parseFloat(kline.l),
            close: parseFloat(kline.c),
            volume: parseFloat(kline.v)
          };

          onUpdate(candle, kline.x);
        } catch (error) {
          console.error(`❌ Error parsing ${symbol} message:`, error);
        }
      };

      ws.onclose = (event: CloseEvent): void => {
        console.log(`🔌 ${symbol} WebSocket closed (code: ${event.code}, reason: ${event.reason})`);
        this.cleanupHeartbeat(symbol);

        const currentAttempts = this.reconnectAttempts.get(symbol) || 0;

        if (currentAttempts < MAX_RECONNECT_ATTEMPTS) {
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

      ws.onerror = (): void => {
        console.error(`❌ ${symbol} WebSocket error`);
        this.setConnectionState(symbol, 'error', onStateChange);
      };

      this.wsConnections.set(symbol, ws);
    };

    connect();
  }

  /**
   * Start heartbeat monitoring
   */
  private startHeartbeat(
    symbol: string,
    ws: WebSocket,
    getLastMessageTime: () => number
  ): void {
    const HEARTBEAT_INTERVAL = 30000;
    const MAX_MESSAGE_AGE = 120000;

    const intervalId = setInterval(() => {
      const timeSinceLastMessage = Date.now() - getLastMessageTime();

      if (timeSinceLastMessage > MAX_MESSAGE_AGE) {
        console.warn(`⚠️ ${symbol} No message for ${Math.round(timeSinceLastMessage / 1000)}s, reconnecting...`);
        ws.close();
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
  private cleanupHeartbeat(symbol: string): void {
    const intervalId = this.heartbeatIntervals.get(symbol);
    if (intervalId) {
      clearInterval(intervalId);
      this.heartbeatIntervals.delete(symbol);
    }
  }

  /**
   * Set connection state and notify listeners
   */
  private setConnectionState(
    symbol: string,
    state: ConnectionState,
    onStateChange: ConnectionStateCallback | null
  ): void {
    this.connectionStates.set(symbol, state);
    console.log(`🔌 ${symbol} connection state: ${state}`);

    if (onStateChange) {
      onStateChange(state);
    }
  }

  /**
   * Clean up connection resources
   */
  private cleanupConnection(symbol: string): void {
    const timeoutId = this.reconnectTimeouts.get(symbol);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.reconnectTimeouts.delete(symbol);
    }

    this.cleanupHeartbeat(symbol);

    const ws = this.wsConnections.get(symbol);
    if (ws && ws.readyState !== WebSocket.CLOSED) {
      ws.close();
    }
  }

  /**
   * WebSocket: Subscribe to ticker (24h stats)
   */
  subscribeTicker(symbol: string, onUpdate: TickerUpdateCallback): WebSocket {
    const streamName = `${symbol.toLowerCase()}@ticker`;
    const ws = new WebSocket(`${FUTURES_WS_BASE}/ws/${streamName}`);

    ws.onmessage = (event: MessageEvent): void => {
      const data = JSON.parse(event.data as string) as BinanceTickerMessage;
      const ticker: TickerData = {
        symbol: data.s,
        price: parseFloat(data.c),
        priceChange: parseFloat(data.p),
        priceChangePercent: parseFloat(data.P),
        high24h: parseFloat(data.h),
        low24h: parseFloat(data.l),
        volume24h: parseFloat(data.v)
      };
      onUpdate(ticker);
    };

    return ws;
  }

  /**
   * Close WebSocket connection and cleanup resources
   */
  unsubscribe(symbol: string): void {
    console.log(`🔌 Unsubscribing from ${symbol}`);
    this.cleanupConnection(symbol);
    this.wsConnections.delete(symbol);
    this.connectionStates.delete(symbol);
    this.reconnectAttempts.delete(symbol);
  }

  /**
   * Close all connections and cleanup all resources
   */
  closeAll(): void {
    console.log('🔌 Closing all connections');
    this.wsConnections.forEach((_ws, symbol) => {
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
