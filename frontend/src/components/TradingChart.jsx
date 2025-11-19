import React, { useEffect, useRef, useState } from 'react';
import { createChart } from 'lightweight-charts';
import { BarChart3, RefreshCw, Circle, Coins, TrendingUp, TrendingDown, ChevronDown, BarChart, Maximize2, Minimize2 } from 'lucide-react';
import { detectSupportResistance, formatSRForChart, filterSRByTier } from '../services/supportResistance';
import { useAuth } from '../contexts/AuthContext';
import './TradingChart.css';

/**
 * FULL-FEATURED TradingChart with NEW HEADER STYLE
 * - Live status with last update timer
 * - Redesigned header matching new UI requirements
 * - GEM TRADING watermark
 * - Proper coin switching
 */
export default function TradingChart({ symbol, interval = '1h', patterns = [], onIntervalChange, userTier = 'free' }) {
  // ✅ DEBUG: Log every render
  console.log('🎨🎨🎨 TradingChart RENDER - Symbol:', symbol, 'Time:', new Date().toLocaleTimeString());

  const { user } = useAuth();
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const candleSeriesRef = useRef(null);
  const volumeSeriesRef = useRef(null);
  const priceLinesToRemove = useRef([]); // Track price lines to prevent duplicates
  const srLinesToRemove = useRef([]); // Track S/R lines to prevent duplicates

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showVolume, setShowVolume] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [timeframe, setTimeframe] = useState(interval);
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  const [timeSinceUpdate, setTimeSinceUpdate] = useState('0s ago');
  const [currentPrice, setCurrentPrice] = useState(null);
  const [priceChange, setPriceChange] = useState(0);
  const [srData, setSrData] = useState(null);
  const [showSR, setShowSR] = useState(true); // Toggle S/R display

  // Update timer for "Last update: Xs ago"
  useEffect(() => {
    const timer = setInterval(() => {
      const seconds = Math.floor((Date.now() - lastUpdate) / 1000);
      if (seconds < 60) {
        setTimeSinceUpdate(`${seconds}s ago`);
      } else {
        const minutes = Math.floor(seconds / 60);
        setTimeSinceUpdate(`${minutes}m ago`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [lastUpdate]);

  // Step 1: Create chart once when component mounts
  useEffect(() => {
    if (!chartContainerRef.current) {
      console.log('❌ [Chart] No container ref');
      return;
    }

    if (chartRef.current) {
      console.log('ℹ️ [Chart] Chart already exists, skipping creation');
      return;
    }

    console.log('🎨 [Chart] Creating chart instance...');

    try {
      const chart = createChart(chartContainerRef.current, {
        width: chartContainerRef.current.clientWidth,
        height: isFullscreen ? window.innerHeight - 200 : 500,
        layout: {
          background: { color: 'transparent' },
          textColor: '#d1d5db',
        },
        grid: {
          vertLines: { color: 'rgba(255, 255, 255, 0.05)' },
          horzLines: { color: 'rgba(255, 255, 255, 0.05)' },
        },
        rightPriceScale: {
          borderColor: 'rgba(255, 255, 255, 0.1)',
        },
        timeScale: {
          borderColor: 'rgba(255, 255, 255, 0.1)',
          timeVisible: true,
          secondsVisible: false,
        },
      });

      const candleSeries = chart.addCandlestickSeries({
        upColor: '#10B981',
        downColor: '#EF4444',
        borderUpColor: '#10B981',
        borderDownColor: '#EF4444',
        wickUpColor: '#10B981',
        wickDownColor: '#EF4444',
      });

      const volumeSeries = chart.addHistogramSeries({
        color: 'rgba(16, 185, 129, 0.3)',
        priceFormat: { type: 'volume' },
        priceScaleId: '',
        scaleMargins: {
          top: 0.8,
          bottom: 0,
        },
      });

      chartRef.current = chart;
      candleSeriesRef.current = candleSeries;
      volumeSeriesRef.current = volumeSeries;

      console.log('✅ [Chart] Chart created successfully');

      // Handle resize
      const handleResize = () => {
        if (chartContainerRef.current && chartRef.current) {
          chartRef.current.applyOptions({
            width: chartContainerRef.current.clientWidth,
            height: isFullscreen ? window.innerHeight - 200 : 500,
          });
        }
      };

      window.addEventListener('resize', handleResize);

      // Cleanup
      return () => {
        console.log('🧹 [Chart] Cleaning up...');
        window.removeEventListener('resize', handleResize);
        if (chartRef.current) {
          chartRef.current.remove();
          chartRef.current = null;
          candleSeriesRef.current = null;
          volumeSeriesRef.current = null;
        }
      };
    } catch (err) {
      console.error('💥 [Chart] Error creating chart:', err);
      setError('Failed to create chart');
    }
  }, [isFullscreen]); // Re-create when fullscreen changes

  // Step 2: Load data when symbol or timeframe changes
  useEffect(() => {
    if (!symbol) {
      console.log('⏸️ [Chart] No symbol selected');
      return;
    }

    if (!candleSeriesRef.current || !volumeSeriesRef.current) {
      console.log('⏸️ [Chart] Series not ready yet');
      return;
    }

    console.log('═══════════════════════════════════════');
    console.log('🔄 [Chart] Symbol changed to:', symbol);
    console.log('⏰ [Chart] Timeframe:', timeframe);
    console.log('📊 [Chart] Show volume:', showVolume);
    console.log('🔑 [Chart] Component key (force remount)');
    console.log('═══════════════════════════════════════');

    // ✅ CRITICAL: Clear old data first to prevent caching
    if (candleSeriesRef.current) {
      candleSeriesRef.current.setData([]);
      console.log('🧹 [Chart] Cleared old candlestick data');
    }
    if (volumeSeriesRef.current) {
      volumeSeriesRef.current.setData([]);
      console.log('🧹 [Chart] Cleared old volume data');
    }

    // Small delay to ensure clear completes before loading new data
    setTimeout(() => {
      loadData(symbol, timeframe);
    }, 50);
  }, [symbol, timeframe, showVolume]);

  const loadData = async (sym, intv) => {
    console.log('📡 [Chart] Fetching data from Binance Futures for:', sym);
    setIsLoading(true);
    setError(null);

    try {
      // ✅ Direct Binance Futures API call
      const url = `https://fapi.binance.com/fapi/v1/klines?symbol=${sym}&interval=${intv}&limit=500`;
      console.log('📡 [Chart] URL:', url);

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ [Chart] Received', data.length, 'candles for', sym);

      // Transform candlestick data
      const candleData = data.map(d => ({
        time: Math.floor(d[0] / 1000), // Convert ms to seconds
        open: parseFloat(d[1]),
        high: parseFloat(d[2]),
        low: parseFloat(d[3]),
        close: parseFloat(d[4]),
      }));

      // Transform volume data with colors
      const volumeData = candleData.map((candle, idx) => ({
        time: candle.time,
        value: parseFloat(data[idx][5]),
        color: candle.close >= candle.open
          ? 'rgba(16, 185, 129, 0.3)'
          : 'rgba(239, 68, 68, 0.3)',
      }));

      console.log('📊 [Chart] First candle:', candleData[0]);
      console.log('📊 [Chart] Last candle:', candleData[candleData.length - 1]);

      // Calculate price change
      if (candleData.length >= 2) {
        const latestClose = candleData[candleData.length - 1].close;
        const previousClose = candleData[candleData.length - 2].close;
        const change = ((latestClose - previousClose) / previousClose) * 100;
        setCurrentPrice(latestClose);
        setPriceChange(change);
      }

      // Set data
      if (candleSeriesRef.current && volumeSeriesRef.current) {
        console.log('📊 [Chart] Setting candlestick data for', sym);
        candleSeriesRef.current.setData(candleData);

        // Set volume data only if volume is enabled
        if (showVolume) {
          console.log('📊 [Chart] Setting volume data...');
          volumeSeriesRef.current.setData(volumeData);
        } else {
          console.log('📊 [Chart] Hiding volume...');
          volumeSeriesRef.current.setData([]);
        }

        console.log('✅ [Chart] Data set successfully for', sym);

        // ===== 🎯 DETECT SUPPORT/RESISTANCE LEVELS =====
        console.log('🔍 [S/R] Detecting support/resistance levels...');
        const rawCandleData = data.map(d => ({
          time: Math.floor(d[0] / 1000),
          open: parseFloat(d[1]),
          high: parseFloat(d[2]),
          low: parseFloat(d[3]),
          close: parseFloat(d[4]),
          volume: parseFloat(d[5])
        }));

        const detectedSR = detectSupportResistance(rawCandleData, {
          lookback: 100,
          minTouches: 2,
          touchThreshold: 0.002,
          volumeWeight: 0.3
        });

        console.log('✅ [S/R] Detected:', detectedSR.supports.length, 'supports,', detectedSR.resistances.length, 'resistances');

        // Filter by tier (FREE: 3 levels max, TIER 1+: all levels)
        const filteredSR = filterSRByTier(detectedSR, userTier);
        setSrData(filteredSR);

        // Add S/R lines to chart if enabled
        if (showSR && filteredSR) {
          addSRLines(filteredSR, candleData[candleData.length - 1].close);
        }

        // ===== 🔥 FORCE REDRAW - CRITICAL FIX =====
        if (chartRef.current) {
          console.log('🔄 [Chart] Force redraw chart...');

          // Method 1: Fit content to visible range
          chartRef.current.timeScale().fitContent();

          // Method 2: Reset time scale
          try {
            chartRef.current.timeScale().resetTimeScale();
          } catch (e) {
            console.log('⚠️ resetTimeScale not available');
          }

          // Method 3: Scroll to latest data
          try {
            chartRef.current.timeScale().scrollToRealTime();
          } catch (e) {
            // Scroll to end manually
            if (candleData.length > 0) {
              const lastTime = candleData[candleData.length - 1].time;
              chartRef.current.timeScale().scrollToPosition(-3, false);
            }
          }

          console.log('✅ [Chart] Force redraw completed');
        }

        // ✅ Add price lines (with duplicate prevention)
        if (patterns && patterns.length > 0) {
          console.log('📍 [Chart] Adding price lines for', patterns.length, 'patterns');
          addPriceLines(patterns[0]);
        }
      } else {
        console.error('❌ [Chart] Series refs are null!');
      }

      setLastUpdate(Date.now());
      setIsLoading(false);
    } catch (err) {
      console.error('💥 [Chart] Error loading data:', err);
      setError(err.message);
      setIsLoading(false);
    }
  };

  // ✅ FIX: Prevent duplicate price lines
  const addPriceLines = (pattern) => {
    if (!candleSeriesRef.current) {
      console.log('⚠️ [Chart] Cannot add price lines - series not ready');
      return;
    }

    try {
      console.log('📍 [Chart] Removing old price lines...');

      // Remove all existing price lines
      priceLinesToRemove.current.forEach(line => {
        try {
          candleSeriesRef.current.removePriceLine(line);
        } catch (e) {
          // Ignore if already removed
        }
      });
      priceLinesToRemove.current = [];

      console.log('📍 [Chart] Adding new price lines...');

      const newLines = [];

      // Entry
      if (pattern.entry) {
        const entryLine = candleSeriesRef.current.createPriceLine({
          price: pattern.entry,
          color: '#3B82F6',
          lineWidth: 2,
          lineStyle: 2,
          axisLabelVisible: true,
          title: 'Entry',
        });
        newLines.push(entryLine);
      }

      // Stop Loss
      if (pattern.stopLoss) {
        const slLine = candleSeriesRef.current.createPriceLine({
          price: pattern.stopLoss,
          color: '#EF4444',
          lineWidth: 2,
          lineStyle: 2,
          axisLabelVisible: true,
          title: 'SL',
        });
        newLines.push(slLine);
      }

      // Take Profit
      if (pattern.takeProfit && pattern.takeProfit[0]) {
        const tpLine = candleSeriesRef.current.createPriceLine({
          price: pattern.takeProfit[0],
          color: '#10B981',
          lineWidth: 2,
          lineStyle: 2,
          axisLabelVisible: true,
          title: 'TP',
        });
        newLines.push(tpLine);
      }

      // Store references for next removal
      priceLinesToRemove.current = newLines;

      console.log('✅ [Chart] Price lines added:', newLines.length);
    } catch (err) {
      console.error('❌ [Chart] Error adding price lines:', err);
    }
  };

  // ✅ Add Support/Resistance lines to chart
  const addSRLines = (srData, currentPrice) => {
    if (!candleSeriesRef.current) {
      console.log('⚠️ [S/R] Cannot add S/R lines - series not ready');
      return;
    }

    try {
      console.log('📍 [S/R] Removing old S/R lines...');

      // Remove all existing S/R lines
      srLinesToRemove.current.forEach(line => {
        try {
          candleSeriesRef.current.removePriceLine(line);
        } catch (e) {
          // Ignore if already removed
        }
      });
      srLinesToRemove.current = [];

      console.log('📍 [S/R] Adding new S/R lines...');

      const newLines = [];

      // Add support lines
      srData.supports.forEach((support, index) => {
        const color = getColorByStrength(support.strength, 'support');
        const line = candleSeriesRef.current.createPriceLine({
          price: support.price,
          color: color,
          lineWidth: index === 0 ? 2 : 1,
          lineStyle: 0, // Solid
          axisLabelVisible: true,
          title: `S ${support.strength}%`,
        });
        newLines.push(line);
      });

      // Add resistance lines
      srData.resistances.forEach((resistance, index) => {
        const color = getColorByStrength(resistance.strength, 'resistance');
        const line = candleSeriesRef.current.createPriceLine({
          price: resistance.price,
          color: color,
          lineWidth: index === 0 ? 2 : 1,
          lineStyle: 0, // Solid
          axisLabelVisible: true,
          title: `R ${resistance.strength}%`,
        });
        newLines.push(line);
      });

      // Store references for next removal
      srLinesToRemove.current = newLines;

      console.log('✅ [S/R] S/R lines added:', newLines.length);
    } catch (err) {
      console.error('❌ [S/R] Error adding S/R lines:', err);
    }
  };

  // Helper function to get color based on strength
  const getColorByStrength = (strength, type) => {
    const baseColor = type === 'support' ? '#4CAF50' : '#F44336';

    if (strength >= 80) return baseColor;
    if (strength >= 60) return type === 'support' ? '#66BB6A' : '#EF5350';
    if (strength >= 40) return type === 'support' ? '#81C784' : '#E57373';
    return type === 'support' ? 'rgba(76, 175, 80, 0.4)' : 'rgba(244, 67, 54, 0.4)';
  };

  const handleRefresh = () => {
    if (symbol) {
      console.log('🔄 [Chart] Manual refresh triggered for', symbol);
      loadData(symbol, timeframe);
    }
  };

  const handleTimeframeChange = (tf) => {
    console.log('⏰ [Chart] Timeframe changed to:', tf);
    setTimeframe(tf);
    if (onIntervalChange) {
      onIntervalChange(tf);
    }
  };

  const handleVolumeToggle = () => {
    console.log('📊 [Chart] Volume toggled:', !showVolume);
    setShowVolume(!showVolume);
  };

  const handleFullscreenToggle = () => {
    console.log('⬆️ [Chart] Fullscreen toggled:', !isFullscreen);
    setIsFullscreen(!isFullscreen);
  };

  const timeframes = ['1m', '3m', '5m', '15m', '30m', '1h', '2h', '4h', '6h', '12h', '1d', '3d'];

  return (
    <div className={`trading-chart-wrapper ${isFullscreen ? 'fullscreen' : ''}`}>
      {!symbol ? (
        <div className="chart-empty">
          <div className="empty-icon"><BarChart3 className="w-16 h-16" /></div>
          <h3>Select a coin to view chart</h3>
          <p>Click on a scan result from the left sidebar</p>
        </div>
      ) : (
        <>
          {/* ===== NEW HEADER DESIGN ===== */}
          <div className="chart-header-new">
            {/* Row 1: Coin info & price */}
            <div className="header-row-1">
              <div className="coin-info-left">
                <span className="coin-icon"><Coins className="w-6 h-6" /></span>
                <span className="coin-name-large">
                  {symbol.replace('USDT', '')}USDT
                </span>
                <span className="coin-type">Perpetual</span>
              </div>

              {currentPrice && (
                <div className="coin-price-info">
                  <span className="coin-price-large">${currentPrice.toFixed(2)}</span>
                  <span className={`coin-change ${priceChange >= 0 ? 'positive' : 'negative'}`}>
                    {priceChange >= 0 ? <TrendingUp className="w-4 h-4 inline" /> : <TrendingDown className="w-4 h-4 inline" />}
                    {Math.abs(priceChange).toFixed(2)}%
                  </span>
                </div>
              )}
            </div>

            {/* Row 2: Live status & refresh */}
            <div className="header-row-2">
              <div className="live-status-group">
                <div className="live-indicator">
                  <span className="live-dot"><Circle className="w-3 h-3 fill-green-500 text-green-500" /></span>
                  <span className="live-text">Live</span>
                </div>
                <span className="last-update">Last update: {timeSinceUpdate}</span>
              </div>

              <button className="btn-refresh-new" onClick={handleRefresh}>
                <RefreshCw className="w-4 h-4 inline mr-1" /> Refresh
              </button>
            </div>

            {/* Row 3: Timeframes & actions */}
            <div className="header-row-3">
              <div className="timeframe-buttons-new">
                {timeframes.map(tf => (
                  <button
                    key={tf}
                    className={`btn-tf ${timeframe === tf ? 'active' : ''}`}
                    onClick={() => handleTimeframeChange(tf)}
                  >
                    {tf}
                  </button>
                ))}
              </div>

              <div className="chart-actions-new">
                <button
                  className={`btn-volume ${showVolume ? 'active' : ''}`}
                  onClick={handleVolumeToggle}
                >
                  <BarChart className="w-4 h-4 inline mr-1" /> Volume
                </button>
                <button
                  className="btn-fullscreen"
                  onClick={handleFullscreenToggle}
                >
                  {isFullscreen ? <><Minimize2 className="w-4 h-4 inline mr-1" /> Exit</> : <><Maximize2 className="w-4 h-4 inline mr-1" /> Full</>}
                </button>
              </div>
            </div>
          </div>

          {/* Pattern badge floating if exists */}
          {patterns && patterns[0] && patterns[0].patternType && (
            <div className="pattern-indicator-floating">
              <span className="pattern-badge-large">
                {patterns[0].patternIcon || <BarChart3 className="w-4 h-4 inline" />} {patterns[0].patternType}
              </span>
            </div>
          )}

          {/* ===== CHART CONTAINER WITH WATERMARK ===== */}
          <div className="chart-container-new">
            <div ref={chartContainerRef} className="chart-canvas" />

            {/* ✅ GEM TRADING WATERMARK */}
            <div className="chart-watermark">GEM TRADING</div>

            {isLoading && (
              <div className="chart-overlay">
                <div className="spinner" />
                <p>Loading chart data...</p>
              </div>
            )}

            {error && (
              <div className="chart-overlay error">
                <div className="error-icon"><ChevronDown className="w-8 h-8" /></div>
                <p>{error}</p>
                <button onClick={handleRefresh}>
                  Retry
                </button>
              </div>
            )}
          </div>

          {/* ===== TRADE LEVELS BOTTOM ===== */}
          {patterns && patterns.length > 0 && patterns[0].entry && (
            <div className="trade-levels-bottom">
              <div className="level-card entry-card">
                <span className="level-label">ENTRY</span>
                <span className="level-price">${patterns[0].entry.toFixed(2)}</span>
              </div>
              <div className="level-card sl-card">
                <span className="level-label">STOP LOSS</span>
                <span className="level-price">${patterns[0].stopLoss.toFixed(2)}</span>
              </div>
              <div className="level-card tp-card">
                <span className="level-label">TAKE PROFIT</span>
                <span className="level-price">${patterns[0].takeProfit[0].toFixed(2)}</span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
