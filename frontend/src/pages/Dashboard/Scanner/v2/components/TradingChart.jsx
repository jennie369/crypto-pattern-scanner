import React, { useEffect, useRef, useState, useReducer } from 'react';
import { createChart } from 'lightweight-charts';
import { Wifi, WifiOff, GripHorizontal, CheckCircle, AlertTriangle } from 'lucide-react';
import ChartControls from './ChartControls';
import './TradingChart.css';

/**
 * Trading Chart Component
 * Integration with TradingView Lightweight Charts
 */
export const TradingChart = ({ pattern, symbol = 'BTCUSDT' }) => {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const candlestickSeriesRef = useRef(null);
  const volumeSeriesRef = useRef(null);
  const priceLinesRef = useRef([]); // Track price lines to prevent duplicates

  // 🔥 FIX #5: Track pattern lines (Entry, SL, TP)
  const patternLinesRef = useRef({
    entryLine: null,
    stopLossLine: null,
    takeProfitLine: null,
  });

  // 🔥 FIX #1: Track candle data array for proper updates
  const candleDataRef = useRef([]);

  // 🔥 PHASE 1: Track active symbol to prevent stale updates
  const activeSymbolRef = useRef(null);
  const activeTimeframeRef = useRef(null);

  // 🔥 DEBUG: Track race conditions
  const debugStateRef = useRef({
    historicalLoadTime: null,
    firstWebSocketTime: null,
    chartInitTime: null,
  });

  // 🔥 FIX: Coordinate historical load with WebSocket
  const isLoadingHistoricalRef = useRef(false);
  const historicalLoadedRef = useRef(false);

  // 🔥 FIX #2: Track ping/pong for connection health
  const pingIntervalRef = useRef(null);
  const lastPongRef = useRef(Date.now());

  // 🔥 PHASE 2B: Ref usage verified ✓
  // All data tracking uses refs (candleDataRef, lastCandleTimeRef, activeSymbolRef, etc.)
  // State variables are correctly used ONLY for UI updates (volumeVisible, isLive, currentPrice, etc.)
  // ✅ No unnecessary re-renders

  // Helper function: Convert milliseconds to seconds (TradingView format)
  const toSeconds = (ms) => Math.floor(ms / 1000);

  // State for controls
  const [volumeVisible, setVolumeVisible] = useState(() => {
    const saved = localStorage.getItem('chart_show_volume');
    return saved ? JSON.parse(saved) : true;
  });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTimeframe, setCurrentTimeframe] = useState(() => {
    // 🔥 FIX: Load from localStorage to persist timeframe selection
    const saved = localStorage.getItem('chart_timeframe');
    return saved || pattern?.timeframe || '1h';
  });
  const [isLive, setIsLive] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [currentPrice, setCurrentPrice] = useState(null); // Real-time price display

  // 🔥 FIX #4: Track display info (coin name, pattern info)
  const [displayInfo, setDisplayInfo] = useState({
    symbol: '',
    patternType: '',
    confidence: '',
  });

  const wsRef = useRef(null);
  const realtimePriceLineRef = useRef(null); // Real-time price line
  const lastCandleTimeRef = useRef(null); // Track last candle timestamp

  // Chart resize state
  const [chartHeight, setChartHeight] = useState(500);
  const [isResizing, setIsResizing] = useState(false);
  const startYRef = useRef(0);
  const startHeightRef = useRef(0);

  const minChartHeight = 400;
  const maxChartHeight = 800;

  // Seeded random generator for consistent data per coin
  const seededRandom = (seed) => {
    let x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };

  // Generate mock candlestick data based on timeframe
  const generateMockData = (basePrice, timeframe, coinSymbol) => {
    const data = [];
    let currentPrice = basePrice;
    const now = Math.floor(Date.now() / 1000);

    // Calculate candle count and interval based on timeframe
    const getTimeframeConfig = (tf) => {
      const tfLower = (tf || '1h').toLowerCase();

      // Return { numCandles, intervalSeconds }
      switch(tfLower) {
        case '1m':  return { numCandles: 500, interval: 60 };           // ~8 hours
        case '3m':  return { numCandles: 600, interval: 180 };          // ~30 hours
        case '5m':  return { numCandles: 700, interval: 300 };          // ~2.4 days
        case '15m': return { numCandles: 800, interval: 900 };          // ~8 days
        case '30m': return { numCandles: 900, interval: 1800 };         // ~18 days
        case '1h':  return { numCandles: 1000, interval: 3600 };        // ~41 days
        case '2h':  return { numCandles: 1200, interval: 7200 };        // ~100 days
        case '4h':  return { numCandles: 1500, interval: 14400 };       // ~250 days
        case '6h':  return { numCandles: 1600, interval: 21600 };       // ~1 year
        case '12h': return { numCandles: 1800, interval: 43200 };       // ~2 years
        case '1d':  return { numCandles: 2000, interval: 86400 };       // ~5.5 years
        case '3d':  return { numCandles: 2000, interval: 259200 };      // ~16 years
        case '1w':  return { numCandles: 2000, interval: 604800 };      // ~38 years
        default:    return { numCandles: 1000, interval: 3600 };        // Default 1H
      }
    };

    const { numCandles, interval } = getTimeframeConfig(timeframe);

    // Create seed from coin symbol for consistent data
    const seed = (coinSymbol || 'BTC').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    let randomSeed = seed;

    for (let i = numCandles; i >= 0; i--) {
      // Use seeded random for consistent data per coin
      const change = (seededRandom(randomSeed++) - 0.5) * (basePrice * 0.02);
      const open = currentPrice;
      const close = currentPrice + change;
      const high = Math.max(open, close) + seededRandom(randomSeed++) * (basePrice * 0.01);
      const low = Math.min(open, close) - seededRandom(randomSeed++) * (basePrice * 0.01);

      data.push({
        time: now - (i * interval),  // Use correct interval per timeframe
        open,
        high,
        low,
        close,
      });

      currentPrice = close;
    }

    return data;
  };

  // Generate mock volume data
  const generateMockVolumeData = (candleData) => {
    return candleData.map(candle => ({
      time: candle.time,
      value: Math.random() * 1000000 + 500000,
      color: candle.close >= candle.open ? 'rgba(0, 255, 136, 0.3)' : 'rgba(246, 70, 93, 0.3)',
    }));
  };

  // Clean symbol format: "BTC/USDT" or "BTCUSDT/USDT" -> "BTCUSDT"
  const cleanSymbol = (sym) => {
    if (!sym) return 'BTCUSDT';
    return sym.replace(/\//g, '').replace('USDT', '') + 'USDT';
  };

  // 🔥 FIX #3: Sanitize symbol for Binance API/WebSocket
  /**
   * Sanitizes a trading pair symbol for Binance APIs
   * @param {string} symbol - Raw symbol (e.g., "BTC/USDT", "btc-usdt", "BTCUSDT")
   * @param {boolean} forWebSocket - If true, returns lowercase for WebSocket; if false, uppercase for API
   * @returns {string} - Sanitized symbol (e.g., "btcusdt" for WS, "BTCUSDT" for API)
   */
  const sanitizeSymbol = (symbol, forWebSocket = false) => {
    if (!symbol) return forWebSocket ? 'btcusdt' : 'BTCUSDT';

    // Remove common separators and convert to uppercase
    let cleaned = symbol.replace(/[\/\-_]/g, '').toUpperCase();

    // Remove ALL trailing USDT/BUSD suffixes (handles duplicates like "BAKEUSDT/USDT" → "BAKEUSDUSTT")
    while (cleaned.endsWith('USDT') || cleaned.endsWith('BUSD')) {
      if (cleaned.endsWith('USDT')) {
        cleaned = cleaned.slice(0, -4); // Remove last 4 chars (USDT)
      } else if (cleaned.endsWith('BUSD')) {
        cleaned = cleaned.slice(0, -4); // Remove last 4 chars (BUSD)
      }
    }

    // Add exactly ONE USDT suffix
    cleaned = cleaned + 'USDT';

    // Return lowercase for WebSocket, uppercase for API
    return forWebSocket ? cleaned.toLowerCase() : cleaned.toUpperCase();
  };

  // 🔥 FIX #1: Fetch real historical data from Binance (PRODUCTION READY)
  const fetchHistoricalData = async (coinSymbol, timeframe) => {
    // Set loading flag
    isLoadingHistoricalRef.current = true;
    historicalLoadedRef.current = false;

    const tfLower = (timeframe || '1h').toLowerCase();
    const limit = tfLower === '1m' ? 500 : tfLower === '5m' ? 700 : tfLower === '15m' ? 800 : tfLower === '1h' ? 1000 : tfLower === '4h' ? 1500 : 2000;

    // Debug: Log raw symbol input
    console.log(`[TradingChart] [DEBUG] Raw symbol input: "${coinSymbol}"`);

    // Use sanitizeSymbol for API (uppercase)
    const cleanedSymbol = sanitizeSymbol(coinSymbol, false);

    // Debug: Log sanitized symbol output
    console.log(`[TradingChart] [OK] Sanitized symbol: "${cleanedSymbol}"`);

    // Validation check
    if (cleanedSymbol.includes('/')) {
      console.error('[TradingChart] [ERROR] CRITICAL: Symbol still contains slash after sanitization!', cleanedSymbol);
    }

    // Force fetch LATEST data by setting endTime to NOW
    const now = Date.now();
    const url = `https://fapi.binance.com/fapi/v1/klines?symbol=${cleanedSymbol}&interval=${tfLower}&limit=${limit}&endTime=${now}`;

    console.log(`[TradingChart] [FETCH] Fetching Binance Futures data...`);
    console.log(`[TradingChart]    Symbol: ${cleanedSymbol}`);
    console.log(`[TradingChart]    Timeframe: ${tfLower}`);
    console.log(`[TradingChart]    Limit: ${limit} candles`);
    console.log(`[TradingChart]    URL: ${url}`);

    try {
      const response = await fetch(url);

      // Step 1: Check HTTP status
      if (!response.ok) {
        const errorText = await response.text();
        console.error('[TradingChart] [ERROR] Binance API HTTP Error:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
        });
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Step 2: Parse JSON
      const data = await response.json();

      // Step 3: Validate response structure
      if (!Array.isArray(data)) {
        console.error('[TradingChart] [ERROR] Invalid response format:', {
          type: typeof data,
          data: data,
        });
        throw new Error(`Expected array, got ${typeof data}`);
      }

      // Step 4: Validate we have data
      if (data.length === 0) {
        console.error('[TradingChart] [ERROR] Empty data array from Binance');
        throw new Error('No candles returned');
      }

      // Step 5: Validate first candle structure
      const firstCandle = data[0];
      if (!Array.isArray(firstCandle) || firstCandle.length < 6) {
        console.error('[TradingChart] [ERROR] Invalid candle structure:', firstCandle);
        throw new Error('Invalid candle format');
      }

      console.log(`[TradingChart] [OK] Received ${data.length} candles from Binance`);

      // Transform Binance kline data to TradingView format
      const candleData = data.map(kline => ({
        time: toSeconds(kline[0]),
        open: parseFloat(kline[1]),
        high: parseFloat(kline[2]),
        low: parseFloat(kline[3]),
        close: parseFloat(kline[4]),
      }));

      const volumeData = data.map(kline => ({
        time: toSeconds(kline[0]),
        value: parseFloat(kline[5]),
        color: parseFloat(kline[4]) >= parseFloat(kline[1])
          ? 'rgba(0, 255, 136, 0.3)'
          : 'rgba(246, 70, 93, 0.3)',
      }));

      const lastCandle = candleData[candleData.length - 1];
      console.log(`[TradingChart] [OK] Loaded ${candleData.length} candles`);
      console.log(`[TradingChart]    Latest: $${lastCandle.close.toFixed(2)}`);
      console.log(`[TradingChart]    Time: ${new Date(lastCandle.time * 1000).toLocaleString()}`);

      // Track historical load completion
      debugStateRef.current.historicalLoadTime = Date.now();

      // Mark historical as loaded
      isLoadingHistoricalRef.current = false;
      historicalLoadedRef.current = true;

      return { candleData, volumeData };
    } catch (error) {
      console.error('[TradingChart] [ERROR] CRITICAL ERROR:', error.message);
      console.error('[TradingChart] [ERROR] Stack:', error.stack);

      // Mark as failed (NOT loaded)
      isLoadingHistoricalRef.current = false;
      historicalLoadedRef.current = false;

      // 🔥 FIX: NO MOCK DATA FALLBACK - Show error to user
      throw new Error(`Failed to load ${cleanedSymbol} data: ${error.message}`);
    }
  };

  // 🔥 FIX #5: Clear pattern lines function
  const clearPatternLines = () => {
    if (!candlestickSeriesRef.current) return;

    // Remove entry line
    if (patternLinesRef.current.entryLine) {
      try {
        candlestickSeriesRef.current.removePriceLine(patternLinesRef.current.entryLine);
      } catch (e) {
        // Already removed
      }
      patternLinesRef.current.entryLine = null;
    }

    // Remove stop loss line
    if (patternLinesRef.current.stopLossLine) {
      try {
        candlestickSeriesRef.current.removePriceLine(patternLinesRef.current.stopLossLine);
      } catch (e) {
        // Already removed
      }
      patternLinesRef.current.stopLossLine = null;
    }

    // Remove take profit line
    if (patternLinesRef.current.takeProfitLine) {
      try {
        candlestickSeriesRef.current.removePriceLine(patternLinesRef.current.takeProfitLine);
      } catch (e) {
        // Already removed
      }
      patternLinesRef.current.takeProfitLine = null;
    }

    console.log('[TradingChart] [CLEAR] Pattern lines cleared');
  };

  // 🔥 FIX #5: Draw pattern lines function
  const drawPatternLines = (patternData) => {
    if (!patternData || !candlestickSeriesRef.current) return;

    try {
      // Draw entry line
      if (patternData.entry) {
        patternLinesRef.current.entryLine = candlestickSeriesRef.current.createPriceLine({
          price: parseFloat(patternData.entry),
          color: '#00D9FF',
          lineWidth: 2,
          lineStyle: 2, // Dashed
          axisLabelVisible: true,
          title: 'Entry',
        });
      }

      // Draw stop loss line
      if (patternData.stopLoss) {
        patternLinesRef.current.stopLossLine = candlestickSeriesRef.current.createPriceLine({
          price: parseFloat(patternData.stopLoss),
          color: '#F6465D',
          lineWidth: 2,
          lineStyle: 2,
          axisLabelVisible: true,
          title: 'Stop Loss',
        });
      }

      // Draw take profit line
      if (patternData.takeProfit) {
        patternLinesRef.current.takeProfitLine = candlestickSeriesRef.current.createPriceLine({
          price: parseFloat(patternData.takeProfit),
          color: '#00FF88',
          lineWidth: 2,
          lineStyle: 2,
          axisLabelVisible: true,
          title: 'Take Profit',
        });
      }

      console.log('[TradingChart] [OK] Pattern lines drawn:', {
        entry: patternData.entry,
        stopLoss: patternData.stopLoss,
        takeProfit: patternData.takeProfit,
      });
    } catch (error) {
      console.error('[TradingChart] [ERROR] Error drawing pattern lines:', error);
    }
  };

  // Remove all existing price lines (legacy function - keep for compatibility)
  const clearPriceLines = () => {
    if (candlestickSeriesRef.current && priceLinesRef.current.length > 0) {
      priceLinesRef.current.forEach(line => {
        try {
          candlestickSeriesRef.current.removePriceLine(line);
        } catch (e) {
          // Line already removed
        }
      });
      priceLinesRef.current = [];
    }
  };

  useEffect(() => {
    if (!chartContainerRef.current) return;
    console.log('[TradingChart] Loading chart for:', pattern?.coin || symbol);

    // Create chart instance
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: chartHeight - 100, // Account for controls and timeline
      layout: {
        background: { color: 'transparent' },
        textColor: '#D9D9D9',
      },
      grid: {
        vertLines: { color: 'rgba(255, 255, 255, 0.05)' },
        horzLines: { color: 'rgba(255, 255, 255, 0.05)' },
      },
      crosshair: {
        mode: 1,
      },
      rightPriceScale: {
        borderColor: 'rgba(255, 255, 255, 0.1)',
        autoScale: true, // Auto-scale price as new data comes in
        visible: true,
      },
      timeScale: {
        borderColor: 'rgba(255, 255, 255, 0.1)',
        timeVisible: true,
        secondsVisible: currentTimeframe === '1m', // Show seconds for 1m timeframe
        rightOffset: 5, // 🔥 CENTERED FIX: Small offset for forming candle
        lockVisibleTimeRangeOnResize: false,
        rightBarStaysOnScroll: false, // 🔥 CENTERED FIX: Don't auto-scroll to right
      },
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
        horzTouchDrag: true,
        vertTouchDrag: true,
      },
    });

    chartRef.current = chart;

    // 🔥 DEBUG: Track chart initialization
    debugStateRef.current.chartInitTime = Date.now();
    console.log('[DEBUG] [CHART] Chart initialized:', {
      time: new Date().toISOString(),
      chartRef: !!chartRef.current,
    });

    // Add candlestick series
    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#00FF88',
      downColor: '#F6465D',
      borderVisible: false,
      wickUpColor: '#00FF88',
      wickDownColor: '#F6465D',
    });

    candlestickSeriesRef.current = candlestickSeries;

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
      visible: volumeVisible,
    });

    volumeSeriesRef.current = volumeSeries;

    // Fetch real historical data from Binance
    const coinSymbol = pattern?.coin || symbol;
    fetchHistoricalData(coinSymbol, currentTimeframe).then(({ candleData, volumeData }) => {
      candlestickSeries.setData(candleData);
      volumeSeries.setData(volumeData);

      // 🔥 FIX #1: Store candle data array for real-time updates
      candleDataRef.current = candleData;

      // IMPORTANT: Store the last candle timestamp for WebSocket validation
      if (candleData.length > 0) {
        const lastCandle = candleData[candleData.length - 1];
        lastCandleTimeRef.current = lastCandle.time;
        console.log(`[TradingChart] [CHART] Chart ready. Last candle time: ${lastCandle.time} (${new Date(lastCandle.time * 1000).toLocaleTimeString()})`);
      } else {
        console.warn('[TradingChart] [WARN] No historical data loaded');
      }

      // Scroll to show recent data in TRUE CENTER of chart
      const dataLength = candleData.length;
      if (dataLength > 200) {
        const leftPadding = 100;
        const rightPadding = 100;
        const latestIndex = dataLength - 1;

        chart.timeScale().setVisibleLogicalRange({
          from: latestIndex - leftPadding,
          to: latestIndex + rightPadding,
        });
      } else {
        chart.timeScale().fitContent();
      }

      // 🔥 FIX #5: Pattern lines will be added by useEffect
      // No need to call here - handled by pattern useEffect above
    });

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearPriceLines(); // Clean up price lines

      // Clean up real-time price line
      if (realtimePriceLineRef.current && candlestickSeriesRef.current) {
        try {
          candlestickSeriesRef.current.removePriceLine(realtimePriceLineRef.current);
          realtimePriceLineRef.current = null;
        } catch (e) {
          // Line already removed
        }
      }

      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [pattern, symbol, volumeVisible, chartHeight]);

  // Handle volume visibility toggle
  useEffect(() => {
    if (volumeSeriesRef.current) {
      volumeSeriesRef.current.applyOptions({ visible: volumeVisible });
    }
  }, [volumeVisible]);

  // 🔥 FIX #4: Update display info when symbol or pattern changes
  useEffect(() => {
    const effectiveSymbol = pattern?.coin || symbol || 'BTCUSDT';

    if (pattern) {
      // From pattern scan - show pattern info
      setDisplayInfo({
        symbol: effectiveSymbol,
        patternType: pattern.pattern || pattern.patternType || '',
        confidence: pattern.confidence ? `${pattern.confidence}%` : '',
      });
      console.log('[TradingChart] [DISPLAY] Display info updated (pattern):', effectiveSymbol, pattern.pattern);
    } else {
      // Manual coin selection - NO pattern info
      setDisplayInfo({
        symbol: effectiveSymbol,
        patternType: '',
        confidence: '',
      });
      console.log('[TradingChart] [DISPLAY] Display info updated (manual):', effectiveSymbol);
    }
  }, [symbol, pattern]);

  // 🔥 FIX #5: Auto clear/draw pattern lines when pattern changes
  useEffect(() => {
    // Clear existing lines first
    clearPatternLines();

    // Draw new lines only if pattern exists with entry/sl/tp
    if (pattern && pattern.entry && candlestickSeriesRef.current) {
      // Wait a bit for chart to be ready
      const timer = setTimeout(() => {
        drawPatternLines(pattern);
      }, 300);

      return () => clearTimeout(timer);
    }

    // Cleanup on unmount
    return () => {
      clearPatternLines();
    };
  }, [pattern]);

  // Load saved chart height on mount
  useEffect(() => {
    const saved = localStorage.getItem('chart_height');
    if (saved) {
      setChartHeight(parseInt(saved));
    }
  }, []);

  // WebSocket connection for live updates
  useEffect(() => {
    // 🔥 CRITICAL: Use pattern?.coin if available, otherwise use symbol prop
    // This must match the logic used in fetchHistoricalData!
    const coinSymbol = pattern?.coin || symbol;

    console.log(`[TradingChart] 🔄 Effect triggered:`, {
      coinSymbol,
      symbolProp: symbol,
      patternCoin: pattern?.coin,
      timeframe: currentTimeframe,
      chartReady: !!candlestickSeriesRef.current,
    });

    if (!coinSymbol || !candlestickSeriesRef.current) {
      console.warn('[TradingChart] [WARN] Skipping: No symbol or chart not ready');
      return;
    }

    console.log(`[TradingChart] [INIT] Initializing WebSocket: ${coinSymbol} @ ${currentTimeframe}`);

    // Map timeframe to Binance interval format
    const getWebSocketInterval = (tf) => {
      const tfLower = (tf || '1h').toLowerCase();
      // Binance format: 1m, 3m, 5m, 15m, 30m, 1h, 2h, 4h, 6h, 12h, 1d, 3d, 1w
      return tfLower;
    };

    const wsInterval = getWebSocketInterval(currentTimeframe);

    // 🔥 FIX #2: Use sanitizeSymbol for proper formatting
    const cleanedSymbol = sanitizeSymbol(coinSymbol, false); // Uppercase for logging
    const wsSymbol = sanitizeSymbol(coinSymbol, true); // Lowercase for WebSocket

    // Set active symbol/timeframe BEFORE connecting
    activeSymbolRef.current = cleanedSymbol;
    activeTimeframeRef.current = wsInterval;

    const connectWebSocket = () => {
      try {
        // Close existing connection FIRST
        if (wsRef.current) {
          console.log('[TradingChart] [CLOSE] Closing existing WebSocket before new connection');

          // Clear ping interval
          if (pingIntervalRef.current) {
            clearInterval(pingIntervalRef.current);
            pingIntervalRef.current = null;
          }

          wsRef.current.close();
          wsRef.current = null;
          setIsLive(false);
        }

        const wsUrl = `wss://fstream.binance.com/ws/${wsSymbol}@kline_${wsInterval}`;
        console.log('[TradingChart] [WS] Connecting to:', wsUrl);
        console.log(`[TradingChart]    Symbol: ${wsSymbol} (lowercase for WebSocket)`);
        console.log(`[TradingChart]    Interval: ${wsInterval}`);

        // Reset debug flag for new connection
        window.__firstWSMessageLogged = false;

        const ws = new WebSocket(wsUrl);

        // 🔥 FIX #2: Connection timeout (10 seconds)
        const connectionTimeout = setTimeout(() => {
          if (ws.readyState !== WebSocket.OPEN) {
            console.error('[TradingChart] [TIMEOUT] Connection timeout after 10s');
            console.error('[TradingChart]    URL:', wsUrl);
            console.error('[TradingChart]    State:', ws.readyState);
            ws.close();
          }
        }, 10000);

        ws.onopen = () => {
          clearTimeout(connectionTimeout);
          setIsLive(true);
          lastPongRef.current = Date.now();

          console.log(`[TradingChart] [LIVE] LIVE! WebSocket connected`);
          console.log(`[TradingChart]    Symbol: ${cleanedSymbol}`);
          console.log(`[TradingChart]    Timeframe: ${wsInterval}`);

          // 🔥 FIX #2: Start ping/pong health check
          // Binance sends ping every 20s, we check for stale connection every 30s
          pingIntervalRef.current = setInterval(() => {
            const timeSinceLastPong = Date.now() - lastPongRef.current;

            if (timeSinceLastPong > 60000) {
              // No pong in 60s = stale connection
              console.error('[TradingChart] [ERROR] Stale connection detected (no pong in 60s)');
              console.error('[TradingChart]    Closing and reconnecting...');
              ws.close();
              clearInterval(pingIntervalRef.current);
              pingIntervalRef.current = null;
            } else {
              // Connection healthy
              console.log(`[TradingChart] [PING] Connection healthy (last pong: ${(timeSinceLastPong / 1000).toFixed(1)}s ago)`);
            }
          }, 30000); // Check every 30s
        };

        ws.onmessage = (event) => {
          // 🔥 FIX #2: Handle ping/pong for Binance keepalive
          // Binance sends ping frames every 20s, we must respond with pong or disconnect after 60s
          if (event.data === 'ping') {
            console.log('[TradingChart] [PING] Received ping, sending pong');
            ws.send('pong');
            lastPongRef.current = Date.now();
            return;
          }

          // Handle regular data messages
          let message;
          try {
            message = JSON.parse(event.data);
          } catch (e) {
            console.error('[TradingChart] [ERROR] Failed to parse WebSocket message:', e);
            return;
          }

          // Update last pong time (any message = connection alive)
          lastPongRef.current = Date.now();
          setLastUpdate(Date.now());

          // Wait for historical data to load first
          if (isLoadingHistoricalRef.current) {
            console.log('[WebSocket] ⏳ Waiting for historical data to load...');
            return;
          }

          if (!historicalLoadedRef.current) {
            console.log('[WebSocket] ⏳ Historical data not loaded yet, skipping update');
            return;
          }

          // DEBUG: Log message received occasionally
          console.log('[TradingChart] 📨 WebSocket message received', {
            symbol: cleanedSymbol,
            time: message.k ? new Date(message.k.t).toLocaleTimeString() : 'N/A',
            close: message.k ? parseFloat(message.k.c).toFixed(2) : 'N/A',
            lastCandleTime: lastCandleTimeRef.current,
            historicalLoaded: historicalLoadedRef.current,
          });

          // Extract kline data
          const kline = message.k;
          if (!kline || !candlestickSeriesRef.current) return;

          // 🔥 PHASE 1: Use helper function for time conversion
          const candleTime = toSeconds(kline.t);

          // Validate timestamp is a valid number
          if (!Number.isFinite(candleTime) || candleTime <= 0) {
            console.error('[TradingChart] [ERROR] Invalid candle timestamp:', kline.t);
            return;
          }

          // 🔥 PHASE 1: Verify this update is for current symbol/timeframe
          if (activeSymbolRef.current !== cleanedSymbol ||
              activeTimeframeRef.current !== wsInterval) {
            console.log('[TradingChart] [WARN] Ignoring stale update from old connection');
            return;
          }

          const candle = {
            time: candleTime,
            open: parseFloat(kline.o),
            high: parseFloat(kline.h),
            low: parseFloat(kline.l),
            close: parseFloat(kline.c),
          };

          // DEBUG: Log first WebSocket message
          if (!window.__firstWSMessageLogged) {
            window.__firstWSMessageLogged = true;
            const timeDiff = lastCandleTimeRef.current ? (candleTime - lastCandleTimeRef.current) / 60 : 0;
            console.log(`[TradingChart] [WS] First WS message: Time=${candleTime} (${new Date(candleTime * 1000).toLocaleTimeString()}), Diff=${timeDiff.toFixed(1)}min`);
          }

          // Determine if price is going up or down
          const isUp = candle.close >= candle.open;

          // Update current price for display
          setCurrentPrice({
            price: candle.close,
            isUp: isUp,
            change: ((candle.close - candle.open) / candle.open * 100).toFixed(2),
          });

          // 🔥 FIX #2: PROPER UPDATE LOGIC
          // TradingView Lightweight Charts rules:
          // 1. If time > last time → NEW CANDLE (candle closed)
          // 2. If time === last time → UPDATE CURRENT CANDLE (forming)
          // 3. If time < last time → REJECT (old data)

          const lastTime = lastCandleTimeRef.current;

          if (!lastTime) {
            // First candle ever - use setData() not update()!
            // 🔥 DEBUG: Track first WebSocket candle
            if (debugStateRef.current.firstWebSocketTime === null) {
              debugStateRef.current.firstWebSocketTime = Date.now();

              const timeSinceHistorical = debugStateRef.current.historicalLoadTime
                ? Date.now() - debugStateRef.current.historicalLoadTime
                : 'N/A';

              console.log('[DEBUG] [WS] First WebSocket candle:', {
                time: new Date().toISOString(),
                candle,
                candleTime,
                candleTimeHuman: new Date(candleTime * 1000).toISOString(),
                timeSinceHistorical: timeSinceHistorical + 'ms',
              });
            }

            console.log('[TradingChart] [FIRST] First candle received', {
              symbol: cleanedSymbol,
              time: candleTime,
              close: candle.close,
            });

            // 🔥 CRITICAL: TradingView requires setData() for first candle, not update()
            candleDataRef.current = [candle];
            candlestickSeriesRef.current.setData([candle]);
            lastCandleTimeRef.current = candleTime;
            console.log('[TradingChart] [OK] Set lastCandleTimeRef to:', candleTime);
            return;
          }

          // 🔥 DEBUG: Log time comparison for every message
          console.log('[DEBUG] [TIME] Time comparison:', {
            candleTime,
            lastTime,
            candleTimeHuman: new Date(candleTime * 1000).toISOString(),
            lastTimeHuman: new Date(lastTime * 1000).toISOString(),
            comparison: candleTime > lastTime ? 'NEW (candleTime > lastTime)'
              : candleTime === lastTime ? 'FORMING (candleTime === lastTime)'
              : 'OLD (candleTime < lastTime)',
          });

          if (candleTime < lastTime) {
            // OLD DATA - skip silently (1% logging to avoid spam)
            if (Math.random() < 0.01) {
              console.log(`[TradingChart] ⏭️ Skipping old: ${candleTime} < ${lastTime}`);
            }
            return;
          }

          if (candleTime > lastTime) {
            // NEW CANDLE - Previous candle closed, new one started!
            console.log(`[NEW] NEW CANDLE | ${new Date().toLocaleTimeString()} | ${cleanedSymbol} | Time: ${candleTime} (prev: ${lastTime})`);

            try {
              // 🔥 FIX #1: Add to data array
              candleDataRef.current.push(candle);

              // Keep last 1000 candles
              if (candleDataRef.current.length > 1000) {
                candleDataRef.current.shift();
              }

              // Update with full data to ensure consistency
              candlestickSeriesRef.current.setData(candleDataRef.current);

              // Update tracker
              lastCandleTimeRef.current = candleTime;
              console.log('[TradingChart] [OK] Updated lastCandleTimeRef to:', candleTime);

              // 🔥 CENTERED FIX: Keep chart centered instead of scrolling to right edge
              // Don't call scrollToRealTime() - let user manually scroll if needed
            } catch (e) {
              console.error('[TradingChart] [ERROR] New candle error:', e.message);
            }
          } else {
            // SAME TIME - Update CURRENT forming candle
            // This is where real-time magic happens!
            try {
              // 🔥 DEBUG: Verify series reference before update
              console.log('[DEBUG] [UPDATE] About to update forming candle:', {
                seriesRefExists: !!candlestickSeriesRef.current,
                seriesRefType: typeof candlestickSeriesRef.current,
                candle,
                dataArrayLength: candleDataRef.current.length,
                lastTimeRef: lastCandleTimeRef.current,
              });

              // 🔥 SAFEGUARD: Ensure chart has data before updating
              if (candleDataRef.current.length === 0) {
                console.warn('[TradingChart] [WARN] Forming candle but no data! Initializing...');
                candleDataRef.current = [candle];
                candlestickSeriesRef.current.setData([candle]);
                return;
              }

              // Try to detect if series is stale
              if (candlestickSeriesRef.current) {
                try {
                  const markers = candlestickSeriesRef.current.markers();
                  console.log('[DEBUG] [OK] Series is valid, markers:', markers?.length || 0);
                } catch (error) {
                  console.error('[DEBUG] [ERROR] Series is STALE/INVALID:', error);
                  return; // Don't update stale series
                }
              }

              // Update in data array
              const lastIndex = candleDataRef.current.length - 1;
              candleDataRef.current[lastIndex] = candle;

              // CRITICAL: Use update() for last candle
              candlestickSeriesRef.current.update(candle);

              // 🔥 DEBUG: Log EVERY forming candle update (100% temp)
              console.log(`[UPDATE] FORMING | ${new Date().toLocaleTimeString()} | ${cleanedSymbol} | $${candle.close.toFixed(2)} | H:${candle.high.toFixed(2)} L:${candle.low.toFixed(2)}`);
            } catch (e) {
              console.error('[TradingChart] [ERROR] Update error:', e.message, e.stack);
            }
          }

          // Update volume if visible
          if (volumeSeriesRef.current && volumeVisible) {
            try {
              const volume = {
                time: candle.time,
                value: parseFloat(kline.v),
                color: candle.close >= candle.open
                  ? 'rgba(0, 255, 136, 0.3)'
                  : 'rgba(246, 70, 93, 0.3)',
              };
              volumeSeriesRef.current.update(volume);
            } catch (e) {
              console.error('[TradingChart] [ERROR] Volume update error:', e.message);
            }
          }

          // 🔥 PHASE 1: Throttle remaining logs - only log candle close
          if (kline.x) { // Only log when candle closes
            console.log(`[CLOSE] [${new Date().toLocaleTimeString()}] ${cleanedSymbol} | $${candle.close.toFixed(2)} | ${isUp ? 'UP' : 'DOWN'} CLOSED`);
          }
        };

        ws.onerror = (error) => {
          clearTimeout(connectionTimeout);
          setIsLive(false);
          console.error('[TradingChart] [ERROR] WebSocket error:', error);
        };

        ws.onclose = (event) => {
          clearTimeout(connectionTimeout);
          setIsLive(false);

          // 🔥 FIX #2: Clear ping/pong interval
          if (pingIntervalRef.current) {
            clearInterval(pingIntervalRef.current);
            pingIntervalRef.current = null;
          }

          console.log('[TradingChart] [CLOSE] WebSocket closed:', {
            code: event.code,
            reason: event.reason || 'No reason',
            wasClean: event.wasClean,
            symbol: cleanedSymbol,
            currentActive: activeSymbolRef.current,
          });

          // Clean up real-time price line
          if (realtimePriceLineRef.current && candlestickSeriesRef.current) {
            try {
              candlestickSeriesRef.current.removePriceLine(realtimePriceLineRef.current);
              realtimePriceLineRef.current = null;
            } catch (e) {
              // Line already removed
            }
          }

          // Only reconnect if still the active symbol/timeframe
          if (activeSymbolRef.current === cleanedSymbol &&
              activeTimeframeRef.current === wsInterval) {
            console.log('[TradingChart] [RECONNECT] Reconnecting in 3s...');
            setTimeout(() => {
              // Double-check still active before reconnecting
              if (activeSymbolRef.current === cleanedSymbol &&
                  activeTimeframeRef.current === wsInterval) {
                console.log('[TradingChart] [RECONNECT] Reconnecting now...');
                connectWebSocket();
              } else {
                console.log('[TradingChart] [STOP] Symbol changed during wait, not reconnecting');
              }
            }, 3000);
          } else {
            console.log('[TradingChart] [STOP] Not reconnecting - symbol/timeframe changed');
          }
        };

        wsRef.current = ws;
      } catch (error) {
        setIsLive(false);
        console.error('[TradingChart] [ERROR] WebSocket connection failed:', error);
      }
    };

    connectWebSocket();

    return () => {
      console.log(`[TradingChart] [CLEANUP] Cleanup triggered for ${cleanedSymbol}`, {
        wsExists: !!wsRef.current,
        wsState: wsRef.current?.readyState,
      });

      // 🔥 FIX #2: Clear ping/pong interval
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
        pingIntervalRef.current = null;
      }

      // Clean up real-time price line
      if (realtimePriceLineRef.current && candlestickSeriesRef.current) {
        try {
          candlestickSeriesRef.current.removePriceLine(realtimePriceLineRef.current);
          realtimePriceLineRef.current = null;
        } catch (e) {
          // Already removed
        }
      }

      // Close WebSocket connection
      if (wsRef.current) {
        console.log(`[TradingChart] [CLOSE] Closing WebSocket for ${cleanedSymbol}`);
        wsRef.current.close();
        wsRef.current = null;
      }

      setIsLive(false);
      console.log(`[TradingChart] [OK] Cleanup complete for ${cleanedSymbol}`);
    };
  }, [symbol, pattern, currentTimeframe]); // 🔥 ADDED pattern dependency!

  // Control Handlers
  const handleRefresh = () => {
    console.log('[REFRESH] [TradingChart] Refreshing chart...');

    // Fetch fresh data from Binance
    const coinSymbol = pattern?.coin || symbol;

    fetchHistoricalData(coinSymbol, currentTimeframe).then(({ candleData, volumeData }) => {
      if (candlestickSeriesRef.current && volumeSeriesRef.current) {
        candlestickSeriesRef.current.setData(candleData);
        volumeSeriesRef.current.setData(volumeData);

        // Update last candle timestamp after refresh
        if (candleData.length > 0) {
          const lastCandle = candleData[candleData.length - 1];
          lastCandleTimeRef.current = lastCandle.time;
          console.log('[TradingChart] [REFRESH] Refresh complete. Last candle:', lastCandle.time, new Date(lastCandle.time * 1000).toLocaleString());
        }

        // Scroll to show recent data in TRUE CENTER of chart
        const dataLength = candleData.length;
        if (dataLength > 200) {
          const leftPadding = 100;
          const rightPadding = 100;
          const latestIndex = dataLength - 1;

          chartRef.current.timeScale().setVisibleLogicalRange({
            from: latestIndex - leftPadding,
            to: latestIndex + rightPadding,
          });
        } else {
          chartRef.current.timeScale().fitContent();
        }
      }
    });
  };

  const handleTimeframeChange = (newTimeframe) => {
    console.log(`[TradingChart] [TIMEFRAME] Timeframe changing: ${currentTimeframe} → ${newTimeframe}`);

    // 🔥 FIX: Save to localStorage to persist selection
    localStorage.setItem('chart_timeframe', newTimeframe);
    setCurrentTimeframe(newTimeframe);

    // Fetch new data with new timeframe
    const coinSymbol = pattern?.coin || symbol;
    fetchHistoricalData(coinSymbol, newTimeframe).then(({ candleData, volumeData }) => {
      if (candlestickSeriesRef.current && volumeSeriesRef.current) {
        candlestickSeriesRef.current.setData(candleData);
        volumeSeriesRef.current.setData(volumeData);

        // Update last candle timestamp for new timeframe
        if (candleData.length > 0) {
          const lastCandle = candleData[candleData.length - 1];
          lastCandleTimeRef.current = lastCandle.time;
          console.log(`[TradingChart] [TIMEFRAME] Timeframe changed to ${newTimeframe}. Last candle:`, lastCandle.time);
        }

        // Center the chart
        const dataLength = candleData.length;
        if (dataLength > 200) {
          const leftPadding = 100;
          const rightPadding = 100;
          const latestIndex = dataLength - 1;

          chartRef.current.timeScale().setVisibleLogicalRange({
            from: latestIndex - leftPadding,
            to: latestIndex + rightPadding,
          });
        } else {
          chartRef.current.timeScale().fitContent();
        }
      }
    });
  };

  const handleVolumeToggle = () => {
    const newValue = !volumeVisible;
    setVolumeVisible(newValue);
    localStorage.setItem('chart_show_volume', JSON.stringify(newValue));
    console.log('Volume toggled:', newValue);
  };

  const handleFullscreen = () => {
    if (!chartContainerRef.current) return;

    if (!isFullscreen) {
      // Enter fullscreen
      if (chartContainerRef.current.requestFullscreen) {
        chartContainerRef.current.requestFullscreen();
      } else if (chartContainerRef.current.webkitRequestFullscreen) {
        chartContainerRef.current.webkitRequestFullscreen();
      } else if (chartContainerRef.current.msRequestFullscreen) {
        chartContainerRef.current.msRequestFullscreen();
      }
    } else {
      // Exit fullscreen
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  const handleSettings = () => {
    // TODO: Open settings modal in future phase
    alert('Chart Settings\n\nSettings panel coming soon!\n\nFeatures:\n• Indicator selection\n• Theme customization\n• Time zone settings\n• Price scale options');
  };

  // Chart resize handlers
  const handleResizeStart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('[Chart Resize] Start dragging, current height:', chartHeight);
    setIsResizing(true);
    startYRef.current = e.clientY;
    startHeightRef.current = chartHeight;

    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', handleResizeEnd);
    document.body.style.cursor = 'ns-resize';
    document.body.style.userSelect = 'none';
  };

  const handleResizeMove = (e) => {
    if (!startYRef.current) return;

    const deltaY = e.clientY - startYRef.current;
    const newHeight = Math.min(
      Math.max(startHeightRef.current + deltaY, minChartHeight),
      maxChartHeight
    );

    console.log('[Chart Resize] Moving, deltaY:', deltaY, 'newHeight:', newHeight);
    setChartHeight(newHeight);
  };

  const handleResizeEnd = () => {
    console.log('[Chart Resize] End dragging, final height:', chartHeight);
    setIsResizing(false);
    startYRef.current = 0;
    startHeightRef.current = 0;

    document.removeEventListener('mousemove', handleResizeMove);
    document.removeEventListener('mouseup', handleResizeEnd);
    document.body.style.cursor = 'default';
    document.body.style.userSelect = 'auto';

    // Save to localStorage
    localStorage.setItem('chart_height', chartHeight.toString());
  };

  return (
    <div className="trading-chart-container" style={{ height: `${chartHeight}px` }}>
      {/* Chart Controls Bar - New Compact Design */}
      <ChartControls
        coin={displayInfo.symbol}
        timeframe={currentTimeframe}
        onTimeframeChange={handleTimeframeChange}
        pattern={displayInfo.patternType ? {
          patternName: displayInfo.patternType,
          confidence: displayInfo.confidence,
        } : null}
        volumeVisible={volumeVisible}
        onVolumeToggle={handleVolumeToggle}
        onRefresh={handleRefresh}
        onFullscreen={handleFullscreen}
        isFullscreen={isFullscreen}
        onSettings={handleSettings}
        isLive={isLive}
        lastUpdate={lastUpdate}
        onDateRangeChange={(startDate, endDate) => {
          console.log('[Chart] Date range selected:', startDate, endDate);
          // TODO: Load historical data based on date range
          // For now, just refresh with default data
          handleRefresh();
        }}
      />

      {/* Chart Area - TradingView Lightweight Charts */}
      <div className="chart-card">
        <div ref={chartContainerRef} className="chart-canvas" />

        {/* GEM TRADING Watermark */}
        <div className="chart-watermark">GEM TRADING</div>

        {/* Timeline Axis */}
        <div className="chart-timeline">
          <span>00:00</span>
          <span>06:00</span>
          <span>12:00</span>
          <span>18:00</span>
          <span>24:00</span>
        </div>
      </div>

      {/* Chart Resize Handle */}
      <div
        className={`chart-resize-handle ${isResizing ? 'active' : ''}`}
        onMouseDown={handleResizeStart}
      >
        <div className="resize-grip">
          <GripHorizontal size={20} />
          <span className="resize-hint">Drag to resize chart</span>
        </div>
      </div>
    </div>
  );
};

export default TradingChart;
