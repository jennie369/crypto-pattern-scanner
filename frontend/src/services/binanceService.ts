/**
 * Binance WebSocket Service for Real-time Prices
 * Public API - No API key required
 */

import type { Candle, Timeframe } from '../types';

/** Price data from WebSocket */
export interface BinancePriceData {
  symbol: string;
  price: number;
  priceChange: number;
  priceChangePercent: number;
  high: number;
  low: number;
  volume: number;
  quoteVolume: number;
  timestamp: number;
}

/** Candlestick data with additional fields */
export interface CandlestickData extends Candle {
  openTime: number;
  closeTime: number;
  quoteVolume: number;
  trades: number;
  timestamp: Date;
}

/** Price update callback type */
type PriceCallback = (priceData: BinancePriceData) => void;

/** Binance ticker message from WebSocket */
interface BinanceTickerMessage {
  stream: string;
  data: {
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
  };
}

/** Raw kline data from REST API */
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

class BinanceService {
  private ws: WebSocket | null;
  private subscribers: Map<string, PriceCallback[]>;
  private prices: Map<string, BinancePriceData>;
  private reconnectAttempts: number;
  private maxReconnectAttempts: number;
  private reconnectDelay: number;
  private currentSymbols: string[];

  constructor() {
    this.ws = null;
    this.subscribers = new Map();
    this.prices = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000;
    this.currentSymbols = [];
  }

  /**
   * Connect to Binance WebSocket
   */
  connect(symbols: string[]): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected');
      return;
    }

    this.currentSymbols = symbols;

    // Format symbols for Binance (btcusdt, ethusdt, etc.)
    const streams = symbols
      .map(symbol => `${symbol.toLowerCase()}@ticker`)
      .join('/');

    const wsUrl = `wss://stream.binance.com:9443/stream?streams=${streams}`;

    console.log('Connecting to Binance WebSocket:', wsUrl);

    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = (): void => {
      console.log('Connected to Binance WebSocket');
      this.reconnectAttempts = 0;
    };

    this.ws.onmessage = (event: MessageEvent): void => {
      try {
        const message = JSON.parse(event.data as string) as BinanceTickerMessage;

        if (message.stream && message.data) {
          const ticker = message.data;
          const symbol = ticker.s;

          const priceData: BinancePriceData = {
            symbol: symbol,
            price: parseFloat(ticker.c),
            priceChange: parseFloat(ticker.p),
            priceChangePercent: parseFloat(ticker.P),
            high: parseFloat(ticker.h),
            low: parseFloat(ticker.l),
            volume: parseFloat(ticker.v),
            quoteVolume: parseFloat(ticker.q),
            timestamp: ticker.E
          };

          // Store price
          this.prices.set(symbol, priceData);

          // Notify subscribers
          this.notifySubscribers(symbol, priceData);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    this.ws.onerror = (): void => {
      console.error('WebSocket error');
    };

    this.ws.onclose = (): void => {
      console.log('WebSocket closed');
      this.attemptReconnect();
    };
  }

  /**
   * Reconnect logic with exponential backoff
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Reconnecting... (Attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

      setTimeout(() => {
        this.connect(this.currentSymbols);
      }, this.reconnectDelay);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  /**
   * Subscribe to price updates for a symbol
   */
  subscribe(symbol: string, callback: PriceCallback): () => void {
    if (!this.subscribers.has(symbol)) {
      this.subscribers.set(symbol, []);
    }

    this.subscribers.get(symbol)!.push(callback);

    // If price already available, call callback immediately
    const existingPrice = this.prices.get(symbol);
    if (existingPrice) {
      callback(existingPrice);
    }

    // Return unsubscribe function
    return () => {
      const callbacks = this.subscribers.get(symbol);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }

  /**
   * Notify all subscribers of a symbol
   */
  private notifySubscribers(symbol: string, priceData: BinancePriceData): void {
    const callbacks = this.subscribers.get(symbol);
    if (callbacks) {
      callbacks.forEach(callback => callback(priceData));
    }
  }

  /**
   * Get current price for a symbol
   */
  getPrice(symbol: string): BinancePriceData | undefined {
    return this.prices.get(symbol);
  }

  /**
   * Get all current prices
   */
  getAllPrices(): Record<string, BinancePriceData> {
    return Object.fromEntries(this.prices);
  }

  /**
   * Disconnect WebSocket and clear data
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.subscribers.clear();
    this.prices.clear();
    console.log('Binance WebSocket disconnected');
  }

  /**
   * Fetch historical candlestick data (for charts)
   */
  async getCandlestickData(
    symbol: string,
    interval: Timeframe | string = '1h',
    limit: number = 100
  ): Promise<CandlestickData[]> {
    try {
      const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json() as BinanceKlineData[];

      // Format candlestick data
      return data.map((candle): CandlestickData => ({
        time: candle[0] / 1000,
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
    } catch (error) {
      console.error('Error fetching candlestick data:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const binanceService = new BinanceService();
