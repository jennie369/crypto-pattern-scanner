# 🚀 GEM PATTERN SCANNER - REACT IMPLEMENTATION GUIDE

## Complete Guide to Build Binance-Style Pattern Scanner

---

## 📋 PROJECT OVERVIEW

**Objective:** Migrate from Streamlit to React + Vite với TradingView Lightweight Charts

**Tech Stack:**
- React 18 + Vite
- TradingView Lightweight Charts
- Framer Motion (animations)
- Axios (API calls)
- Binance Futures API (WebSocket + REST)

**Layout Structure:**
```
┌──────────────────────────────────────────────────────────────────┐
│  HEADER (Navigation Bar)                                         │
├────────────┬────────────────────────────────┬────────────────────┤
│ LEFT (20%) │  CENTER (50%)                  │  RIGHT (30%)       │
│ Coin List  │  Realtime Interactive Chart    │  Trading Info      │
│            │  (TradingView Lightweight)     │  + Copy Buttons    │
└────────────┴────────────────────────────────┴────────────────────┘
```

---

## 🎯 PHASE 1: SETUP & STRUCTURE (Already Done ✅)

```bash
# Dependencies installed:
npm install lightweight-charts framer-motion axios
```

**Folder Structure Created:**
```
frontend/
├── src/
│   ├── components/      ✅
│   ├── services/        ✅
│   └── utils/           ✅
```

---

## 🔧 PHASE 2: CORE SERVICES

### **File: `src/services/binanceApi.js`**

```javascript
/**
 * Binance Futures API Service
 * Provides REST API and WebSocket connections for realtime data
 */

const FUTURES_API_BASE = 'https://fapi.binance.com';
const FUTURES_WS_BASE = 'wss://fstream.binance.com';

export class BinanceAPI {
  constructor() {
    this.wsConnections = new Map();
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

      const response = await fetch(`${url}?${params}`);
      const data = await response.json();

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
      console.error('Error fetching klines:', error);
      return [];
    }
  }

  /**
   * WebSocket: Subscribe to realtime klines
   * @param {string} symbol - e.g., "BTCUSDT"
   * @param {string} interval - e.g., "1m"
   * @param {Function} onUpdate - callback for updates
   */
  subscribeKlines(symbol, interval, onUpdate) {
    const streamName = `${symbol.toLowerCase()}@kline_${interval}`;
    const ws = new WebSocket(`${FUTURES_WS_BASE}/ws/${streamName}`);

    ws.onmessage = (event) => {
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
    };

    ws.onerror = (error) => console.error('WebSocket error:', error);

    this.wsConnections.set(symbol, ws);
    return ws;
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
   * Close WebSocket connection
   */
  unsubscribe(symbol) {
    const ws = this.wsConnections.get(symbol);
    if (ws) {
      ws.close();
      this.wsConnections.delete(symbol);
    }
  }

  /**
   * Close all connections
   */
  closeAll() {
    this.wsConnections.forEach(ws => ws.close());
    this.wsConnections.clear();
  }
}

// Singleton instance
export const binanceApi = new BinanceAPI();
```

---

## 📈 PHASE 3: TRADING CHART COMPONENT (CRITICAL)

### **File: `src/components/TradingChart.jsx`**

```jsx
import React, { useEffect, useRef, useState } from 'react';
import { createChart } from 'lightweight-charts';
import { binanceApi } from '../services/binanceApi';
import './TradingChart.css';

/**
 * TradingChart Component
 * Interactive realtime chart using TradingView Lightweight Charts
 *
 * Props:
 * - symbol: Coin symbol (e.g., "BTCUSDT")
 * - interval: Timeframe (e.g., "15m", "1h", "4h")
 * - patterns: Array of detected patterns to annotate
 */
export default function TradingChart({ symbol, interval = '15m', patterns = [] }) {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const candleSeriesRef = useRef(null);
  const volumeSeriesRef = useRef(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Create chart instance
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 600,
      layout: {
        background: { color: '#112250' },
        textColor: '#FFFFFF',
      },
      grid: {
        vertLines: { color: 'rgba(255, 255, 255, 0.05)' },
        horzLines: { color: 'rgba(255, 255, 255, 0.05)' },
      },
      crosshair: {
        mode: 1,
        vertLine: {
          color: '#FFBD59',
          width: 1,
          style: 3,
        },
        horzLine: {
          color: '#FFBD59',
          width: 1,
          style: 3,
        },
      },
      rightPriceScale: {
        borderColor: 'rgba(255, 189, 89, 0.3)',
      },
      timeScale: {
        borderColor: 'rgba(255, 189, 89, 0.3)',
        timeVisible: true,
        secondsVisible: false,
      },
    });

    // Add candlestick series
    const candleSeries = chart.addCandlestickSeries({
      upColor: '#0ECB81',
      downColor: '#F6465D',
      borderVisible: false,
      wickUpColor: '#0ECB81',
      wickDownColor: '#F6465D',
    });

    // Add volume series
    const volumeSeries = chart.addHistogramSeries({
      color: '#26a69a',
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: '',
      scaleMargins: {
        top: 0.8,
        bottom: 0,
      },
    });

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;
    volumeSeriesRef.current = volumeSeries;

    // Load historical data
    loadHistoricalData();

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      binanceApi.unsubscribe(symbol);
      chart.remove();
    };
  }, [symbol, interval]);

  const loadHistoricalData = async () => {
    setLoading(true);
    try {
      // Get historical data
      const klines = await binanceApi.getKlines(symbol, interval, 500);

      if (klines.length > 0) {
        candleSeriesRef.current.setData(klines);

        // Set volume data
        const volumeData = klines.map(candle => ({
          time: candle.time,
          value: candle.volume,
          color: candle.close >= candle.open ? 'rgba(14, 203, 129, 0.5)' : 'rgba(246, 70, 93, 0.5)'
        }));
        volumeSeriesRef.current.setData(volumeData);
      }

      // Subscribe to realtime updates
      binanceApi.subscribeKlines(symbol, '1m', (candle, isClosed) => {
        candleSeriesRef.current.update(candle);

        volumeSeriesRef.current.update({
          time: candle.time,
          value: candle.volume,
          color: candle.close >= candle.open ? 'rgba(14, 203, 129, 0.5)' : 'rgba(246, 70, 93, 0.5)'
        });
      });

      setLoading(false);
    } catch (error) {
      console.error('Error loading chart data:', error);
      setLoading(false);
    }
  };

  // Add pattern markers
  useEffect(() => {
    if (!chartRef.current || patterns.length === 0) return;

    patterns.forEach(pattern => {
      // Add marker for pattern detection point
      const marker = {
        time: pattern.timestamp / 1000,
        position: pattern.direction === 'bullish' ? 'belowBar' : 'aboveBar',
        color: pattern.direction === 'bullish' ? '#0ECB81' : '#F6465D',
        shape: pattern.direction === 'bullish' ? 'arrowUp' : 'arrowDown',
        text: pattern.patternType,
      };

      // Note: Lightweight Charts doesn't have markers API in newer versions
      // Use price lines instead
      candleSeriesRef.current.createPriceLine({
        price: pattern.entry,
        color: '#FFBD59',
        lineWidth: 2,
        lineStyle: 2, // Dashed
        axisLabelVisible: true,
        title: `Entry: ${pattern.entry.toFixed(2)}`,
      });

      // Stop Loss line
      candleSeriesRef.current.createPriceLine({
        price: pattern.stopLoss,
        color: '#F6465D',
        lineWidth: 1,
        lineStyle: 2,
        axisLabelVisible: true,
        title: `SL: ${pattern.stopLoss.toFixed(2)}`,
      });

      // Take Profit lines
      pattern.takeProfit.forEach((tp, index) => {
        candleSeriesRef.current.createPriceLine({
          price: tp,
          color: '#0ECB81',
          lineWidth: 1,
          lineStyle: 2,
          axisLabelVisible: true,
          title: `TP${index + 1}: ${tp.toFixed(2)}`,
        });
      });
    });
  }, [patterns]);

  return (
    <div className="trading-chart-container">
      {loading && (
        <div className="chart-loading">
          <div className="spinner"></div>
          <p>Loading chart data...</p>
        </div>
      )}
      <div
        ref={chartContainerRef}
        className="chart"
        style={{ visibility: loading ? 'hidden' : 'visible' }}
      />
    </div>
  );
}
```

### **File: `src/components/TradingChart.css`**

```css
.trading-chart-container {
  position: relative;
  width: 100%;
  height: 600px;
  background: #112250;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.chart {
  width: 100%;
  height: 100%;
}

.chart-loading {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(17, 34, 80, 0.95);
  z-index: 10;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(255, 189, 89, 0.2);
  border-top-color: #FFBD59;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.chart-loading p {
  color: #DEBC81;
  margin-top: 20px;
  font-size: 14px;
}
```

---

## 🔥 NEXT STEPS TO COMPLETE

**I've created the foundation. To finish the app, follow PART 2 of this guide:**

1. ✅ Services created (binanceApi.js)
2. ✅ TradingChart created (with realtime updates)
3. 🔄 **Next:** Create remaining components (CoinListSidebar, TradingInfoSidebar, Header)
4. 🔄 **Next:** Integrate PatternCard from gem-pattern-card-component
5. 🔄 **Next:** Create main App.jsx with 3-column layout

**Total progress:** 30% complete

---

## 📝 IMPORTANT NOTES

- **Token Limit:** Project too large for single session
- **Approach:** I'm creating comprehensive guides you can follow
- **Part 2 Coming:** Will contain all remaining components with full code

**Continue to PART 2 when ready!** 🚀
