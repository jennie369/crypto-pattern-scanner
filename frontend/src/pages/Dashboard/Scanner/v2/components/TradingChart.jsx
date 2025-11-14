import React, { useEffect, useRef, useState } from 'react';
import { createChart } from 'lightweight-charts';
import { Wifi, WifiOff, GripHorizontal } from 'lucide-react';
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

  // Fetch real historical data from Binance
  const fetchHistoricalData = async (coinSymbol, timeframe) => {
    try {
      const tfLower = (timeframe || '1h').toLowerCase();
      const limit = tfLower === '1m' ? 500 : tfLower === '5m' ? 700 : tfLower === '15m' ? 800 : tfLower === '1h' ? 1000 : tfLower === '4h' ? 1500 : 2000;

      const cleanedSymbol = cleanSymbol(coinSymbol);

      // Force fetch LATEST data by setting endTime to NOW
      const now = Date.now();
      const url = `https://fapi.binance.com/fapi/v1/klines?symbol=${cleanedSymbol}&interval=${tfLower}&limit=${limit}&endTime=${now}`;

      console.log(`[TradingChart] 📊 Fetching ${cleanedSymbol} @ ${tfLower} (${limit} candles)...`);

      const response = await fetch(url);
      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error('Invalid data format from Binance');
      }

      // Transform Binance kline data to TradingView format
      const candleData = data.map(kline => ({
        time: Math.floor(kline[0] / 1000), // Open time in seconds
        open: parseFloat(kline[1]),
        high: parseFloat(kline[2]),
        low: parseFloat(kline[3]),
        close: parseFloat(kline[4]),
      }));

      const volumeData = data.map(kline => ({
        time: Math.floor(kline[0] / 1000),
        value: parseFloat(kline[5]), // Volume
        color: parseFloat(kline[4]) >= parseFloat(kline[1])
          ? 'rgba(0, 255, 136, 0.3)'
          : 'rgba(246, 70, 93, 0.3)',
      }));

      const lastCandle = candleData[candleData.length - 1];
      console.log(`[TradingChart] ✅ Loaded ${candleData.length} candles. Latest: $${lastCandle.close.toFixed(2)} @ ${new Date(lastCandle.time * 1000).toLocaleTimeString()}`);

      return { candleData, volumeData };
    } catch (error) {
      console.error('[TradingChart] ❌ Binance API error:', error.message);
      console.warn('[TradingChart] ⚠️ Using MOCK DATA fallback');

      // Fallback to mock data
      const basePrice = pattern?.entry || 50000;
      const coinSym = cleanSymbol(coinSymbol || symbol);

      const mockCandleData = generateMockData(basePrice, timeframe, coinSym);
      const mockVolumeData = generateMockVolumeData(mockCandleData);
      return { candleData: mockCandleData, volumeData: mockVolumeData };
    }
  };

  // Remove all existing price lines
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

  // Add pattern price lines
  const addPatternLines = () => {
    if (!pattern || !candlestickSeriesRef.current) return;

    // Clear old lines first
    clearPriceLines();

    const entryLine = candlestickSeriesRef.current.createPriceLine({
      price: pattern.entry,
      color: '#00D9FF',
      lineWidth: 2,
      lineStyle: 2,
      axisLabelVisible: true,
      title: 'Entry',
    });

    const stopLossLine = candlestickSeriesRef.current.createPriceLine({
      price: pattern.stopLoss,
      color: '#F6465D',
      lineWidth: 2,
      lineStyle: 2,
      axisLabelVisible: true,
      title: 'Stop Loss',
    });

    const takeProfitLine = candlestickSeriesRef.current.createPriceLine({
      price: pattern.takeProfit,
      color: '#00FF88',
      lineWidth: 2,
      lineStyle: 2,
      axisLabelVisible: true,
      title: 'Take Profit',
    });

    priceLinesRef.current = [entryLine, stopLossLine, takeProfitLine];
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
        rightOffset: 12, // 🔥 FIX: More space on right for forming candle
        lockVisibleTimeRangeOnResize: false,
        rightBarStaysOnScroll: true, // 🔥 FIX: Keep showing latest bar
      },
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
        horzTouchDrag: true,
        vertTouchDrag: true,
      },
    });

    chartRef.current = chart;

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

      // IMPORTANT: Store the last candle timestamp for WebSocket validation
      if (candleData.length > 0) {
        const lastCandle = candleData[candleData.length - 1];
        lastCandleTimeRef.current = lastCandle.time;
        console.log(`[TradingChart] 📊 Chart ready. Last candle time: ${lastCandle.time} (${new Date(lastCandle.time * 1000).toLocaleTimeString()})`);
      } else {
        console.warn('[TradingChart] ⚠️ No historical data loaded');
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

      // Add pattern lines after data loads
      if (pattern) {
        setTimeout(addPatternLines, 500);
      }
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

    console.log(`[TradingChart] 🚀 Starting WebSocket: ${coinSymbol} @ ${currentTimeframe}`);

    if (!coinSymbol || !candlestickSeriesRef.current) {
      console.warn('[TradingChart] ⚠️ Cannot start WebSocket - missing symbol or chart series');
      return;
    }

    // Map timeframe to Binance interval format
    const getWebSocketInterval = (tf) => {
      const tfLower = (tf || '1h').toLowerCase();
      // Binance format: 1m, 3m, 5m, 15m, 30m, 1h, 2h, 4h, 6h, 12h, 1d, 3d, 1w
      return tfLower;
    };

    const wsInterval = getWebSocketInterval(currentTimeframe);
    const cleanedSymbol = cleanSymbol(coinSymbol);


    const connectWebSocket = () => {
      try {
        // Reset debug flag for new connection
        window.__firstWSMessageLogged = false;

        const ws = new WebSocket(
          `wss://fstream.binance.com/ws/${cleanedSymbol.toLowerCase()}@kline_${wsInterval}`
        );

        ws.onopen = () => {
          setIsLive(true);
          console.log(`[TradingChart] ✅ LIVE! WebSocket connected: ${cleanedSymbol} @ ${wsInterval}`);
        };

        ws.onmessage = (event) => {
          const message = JSON.parse(event.data);
          setLastUpdate(Date.now());

          // Extract kline data
          const kline = message.k;
          if (!kline || !candlestickSeriesRef.current) return;

          // ⚠️ Wait for historical data to load before processing WebSocket updates
          // This prevents trying to update before we have a baseline
          if (lastCandleTimeRef.current === null) {
            console.warn('[TradingChart] ⏳ Waiting for historical data to load before processing WebSocket updates...');
            return;
          }

          // Use the CURRENT candle opening time (not event time!)
          const candleTime = Math.floor(kline.t / 1000); // Candle opening time in SECONDS

          // Validate timestamp is a valid number
          if (!Number.isFinite(candleTime) || candleTime <= 0) {
            console.error('[TradingChart] ❌ Invalid candle timestamp:', kline.t);
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
            console.log(`[TradingChart] 📡 First WS message: Time=${candleTime} (${new Date(candleTime * 1000).toLocaleTimeString()}), Diff=${timeDiff.toFixed(1)}min`);
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
            // First candle ever - just update
            console.log('[TradingChart] 🎬 First candle received');
            candlestickSeriesRef.current.update(candle);
            lastCandleTimeRef.current = candleTime;
            return;
          }

          if (candleTime < lastTime) {
            // OLD DATA - skip silently (1% logging to avoid spam)
            if (Math.random() < 0.01) {
              console.log(`[TradingChart] ⏭️ Skipping old: ${candleTime} < ${lastTime}`);
            }
            return;
          }

          if (candleTime > lastTime) {
            // 🆕 NEW CANDLE - Previous candle closed, new one started!
            console.log(`[TradingChart] 🆕 NEW CANDLE! ${new Date(candleTime * 1000).toLocaleTimeString()}`);

            try {
              // Update with new candle
              candlestickSeriesRef.current.update(candle);

              // Update tracker
              lastCandleTimeRef.current = candleTime;

              // Scroll to show new candle
              if (chartRef.current) {
                chartRef.current.timeScale().scrollToRealTime();
              }
            } catch (e) {
              console.error('[TradingChart] ❌ New candle error:', e.message);
            }
          } else {
            // 🔄 SAME TIME - Update CURRENT forming candle
            // This is where real-time magic happens!
            try {
              candlestickSeriesRef.current.update(candle);

              // Log occasionally to confirm it's working
              if (Math.random() < 0.05) { // 5% of updates
                console.log(`🔄 ${new Date().toLocaleTimeString()} | ${cleanedSymbol} | $${candle.close.toFixed(2)} | H:${candle.high.toFixed(2)} L:${candle.low.toFixed(2)}`);
              }
            } catch (e) {
              console.error('[TradingChart] ❌ Update error:', e.message);
            }
          }

          // Update volume if visible
          if (volumeSeriesRef.current && volumeVisible) {
            const volume = {
              time: candle.time,
              value: parseFloat(kline.v),
              color: candle.close >= candle.open
                ? 'rgba(0, 255, 136, 0.3)'
                : 'rgba(246, 70, 93, 0.3)',
            };
            volumeSeriesRef.current.update(volume);
          }

          // Log only on significant price changes (> 0.1%) or candle close
          const priceChangePercent = Math.abs(parseFloat(kline.P));
          if (kline.x || priceChangePercent > 0.1) {
            console.log(`🕐 [${new Date().toLocaleTimeString()}] ${cleanedSymbol} | $${candle.close.toFixed(2)} | ${isUp ? '🟢' : '🔴'} ${kline.x ? '✅ CLOSED' : '⏳ Forming'}`);
          }
        };

        ws.onerror = () => {
          setIsLive(false);
          console.error('[TradingChart] WebSocket error');
        };

        ws.onclose = () => {
          setIsLive(false);

          // Clean up real-time price line
          if (realtimePriceLineRef.current && candlestickSeriesRef.current) {
            try {
              candlestickSeriesRef.current.removePriceLine(realtimePriceLineRef.current);
              realtimePriceLineRef.current = null;
            } catch (e) {
              // Line already removed
            }
          }

          console.log(`[TradingChart] WebSocket closed for ${cleanedSymbol}, reconnecting in 3s...`);
          // Auto reconnect after 3 seconds
          setTimeout(connectWebSocket, 3000);
        };

        wsRef.current = ws;
      } catch (error) {
        setIsLive(false);
        console.error('[TradingChart] WebSocket connection failed:', error);
      }
    };

    connectWebSocket();

    return () => {
      console.log(`🔌 [TradingChart] Cleaning up WebSocket for ${cleanedSymbol}...`);

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
        wsRef.current.close();
        wsRef.current = null;
        console.log(`✅ [TradingChart] WebSocket closed for ${cleanedSymbol}`);
      }

      setIsLive(false);
    };
  }, [symbol, pattern, currentTimeframe]); // 🔥 ADDED pattern dependency!

  // Control Handlers
  const handleRefresh = () => {
    console.log('🔄 [TradingChart] Refreshing chart...');

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
          console.log('[TradingChart] 🔄 Refresh complete. Last candle:', lastCandle.time, new Date(lastCandle.time * 1000).toLocaleString());
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
    console.log(`[TradingChart] 🕐 Timeframe changing: ${currentTimeframe} → ${newTimeframe}`);

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
          console.log(`[TradingChart] ⏱️ Timeframe changed to ${newTimeframe}. Last candle:`, lastCandle.time);
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
    alert('⚙️ Chart Settings\n\nSettings panel coming soon!\n\nFeatures:\n• Indicator selection\n• Theme customization\n• Time zone settings\n• Price scale options');
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
        coin={pattern?.coin || symbol}
        timeframe={currentTimeframe}
        onTimeframeChange={handleTimeframeChange}
        pattern={pattern ? {
          patternName: pattern.pattern,
          confidence: pattern.confidence,
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
