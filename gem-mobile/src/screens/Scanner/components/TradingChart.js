/**
 * GEM Mobile - Trading Chart v4
 * Using lightweight-charts library for full customization
 * Features: Volume toggle, Price lines (Entry/SL/TP), Dark/Light theme
 */

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Dimensions,
  StatusBar,
  Platform,
  ActivityIndicator,
  PanResponder,
} from 'react-native';
import { WebView } from 'react-native-webview';
import {
  Minimize2,
  X,
} from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../utils/tokens';
import ChartToolbar from '../../../components/Trading/ChartToolbar';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Binance kline intervals mapping
const TIMEFRAME_TO_BINANCE = {
  '1m': '1m',
  '5m': '5m',
  '15m': '15m',
  '30m': '30m',
  '1h': '1h',
  '4h': '4h',
  '1d': '1d',
  '1D': '1d',
  '1w': '1w',
  '1W': '1w',
};

const TradingChart = ({
  symbol = 'BTCUSDT',
  timeframe = '4h',
  height = 350,
  onSymbolPress,
  onTimeframeChange,
  selectedPattern = null,
  patterns = [],
}) => {
  const [showVolume, setShowVolume] = useState(true);
  const [darkTheme, setDarkTheme] = useState(true);
  const [fullScreen, setFullScreen] = useState(false);
  const [showPriceLines, setShowPriceLines] = useState(true);
  const [activeTimeframe, setActiveTimeframe] = useState(timeframe);
  const [isLoading, setIsLoading] = useState(true);
  const webViewRef = useRef(null);

  // WebView key for force remount
  const [webViewKey, setWebViewKey] = useState(0);

  // Sync activeTimeframe when prop timeframe changes from parent
  useEffect(() => {
    if (timeframe !== activeTimeframe) {
      console.log('[TradingChart] Timeframe changed from parent:', timeframe);
      setActiveTimeframe(timeframe);
      setWebViewKey(prev => prev + 1); // Force reload chart with new timeframe
    }
  }, [timeframe]);

  // Pattern price data
  const displayPattern = selectedPattern || (patterns.length > 0 ? patterns[0] : null);
  const patternEntry = displayPattern?.entry || 0;
  const patternSL = displayPattern?.stopLoss || 0;
  const patternTP = displayPattern?.target || displayPattern?.takeProfit1 || displayPattern?.takeProfit || displayPattern?.targets?.[0] || 0;
  const patternDirection = displayPattern?.direction || 'LONG';
  const hasPatternData = displayPattern && patternEntry > 0;

  // PanResponder to prevent parent ScrollView from intercepting
  const panResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onStartShouldSetPanResponderCapture: () => false,
    onMoveShouldSetPanResponderCapture: () => false,
    onPanResponderTerminationRequest: () => false,
    onShouldBlockNativeResponder: () => false,
  }), []);

  // Get Binance interval
  const getBinanceInterval = useCallback(() => {
    return TIMEFRAME_TO_BINANCE[activeTimeframe] || '4h';
  }, [activeTimeframe]);

  // Generate chart HTML with lightweight-charts
  const generateChartHTML = useCallback(() => {
    const binanceSymbol = symbol.toUpperCase();
    const interval = getBinanceInterval();
    const bgColor = darkTheme ? '#0D0D0D' : '#FFFFFF';
    const textColor = darkTheme ? '#D1D4DC' : '#131722';
    const gridColor = darkTheme ? 'rgba(42, 46, 57, 0.5)' : 'rgba(42, 46, 57, 0.1)';

    // Price lines config
    const entryPrice = showPriceLines && hasPatternData ? patternEntry : 0;
    const slPrice = showPriceLines && hasPatternData ? patternSL : 0;
    const tpPrice = showPriceLines && hasPatternData ? patternTP : 0;

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <script src="https://unpkg.com/lightweight-charts@4.1.0/dist/lightweight-charts.standalone.production.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body {
      width: 100%;
      height: 100%;
      overflow: hidden;
      background: ${bgColor};
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    #chart-container {
      width: 100%;
      height: 100%;
      position: relative;
    }
    .loading {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: ${textColor};
      font-size: 14px;
    }
    .error-container {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      text-align: center;
      padding: 20px;
    }
    .error-icon {
      font-size: 48px;
      margin-bottom: 10px;
    }
    .error-title {
      color: #EF4444;
      font-size: 16px;
      font-weight: bold;
      margin-bottom: 5px;
    }
    .error-msg {
      color: ${textColor};
      font-size: 13px;
      opacity: 0.7;
    }
  </style>
</head>
<body>
  <div id="chart-container">
    <div class="loading" id="loading">Loading chart...</div>
  </div>
  <script>
    const SYMBOL = '${binanceSymbol}';
    const INTERVAL = '${interval}';
    const SHOW_VOLUME = ${showVolume};
    const DARK_THEME = ${darkTheme};
    const ENTRY_PRICE = ${entryPrice};
    const SL_PRICE = ${slPrice};
    const TP_PRICE = ${tpPrice};

    let chart = null;
    let candleSeries = null;
    let volumeSeries = null;
    let ws = null;

    // Create chart
    function createChart() {
      const container = document.getElementById('chart-container');

      chart = LightweightCharts.createChart(container, {
        width: container.clientWidth,
        height: container.clientHeight,
        layout: {
          background: { type: 'solid', color: '${bgColor}' },
          textColor: '${textColor}',
        },
        grid: {
          vertLines: { color: '${gridColor}' },
          horzLines: { color: '${gridColor}' },
        },
        crosshair: {
          mode: LightweightCharts.CrosshairMode.Normal,
          vertLine: {
            color: 'rgba(106, 91, 255, 0.5)',
            width: 1,
            style: LightweightCharts.LineStyle.Dashed,
          },
          horzLine: {
            color: 'rgba(106, 91, 255, 0.5)',
            width: 1,
            style: LightweightCharts.LineStyle.Dashed,
          },
        },
        rightPriceScale: {
          borderColor: '${gridColor}',
          scaleMargins: {
            top: 0.1,
            bottom: SHOW_VOLUME ? 0.25 : 0.1,
          },
        },
        timeScale: {
          borderColor: '${gridColor}',
          timeVisible: true,
          secondsVisible: false,
        },
        handleScale: {
          mouseWheel: true,
          pinch: true,
          axisPressedMouseMove: true,
        },
        handleScroll: {
          mouseWheel: true,
          pressedMouseMove: true,
          horzTouchDrag: true,
          vertTouchDrag: true,
        },
      });

      // Candlestick series
      candleSeries = chart.addCandlestickSeries({
        upColor: '#22C55E',
        downColor: '#EF4444',
        borderUpColor: '#22C55E',
        borderDownColor: '#EF4444',
        wickUpColor: '#22C55E',
        wickDownColor: '#EF4444',
      });

      // Volume series (if enabled)
      if (SHOW_VOLUME) {
        volumeSeries = chart.addHistogramSeries({
          color: '#6A5BFF',
          priceFormat: { type: 'volume' },
          priceScaleId: '',
        });
        volumeSeries.priceScale().applyOptions({
          scaleMargins: { top: 0.8, bottom: 0 },
        });
      }

      // Add price lines if pattern data exists
      if (ENTRY_PRICE > 0) {
        candleSeries.createPriceLine({
          price: ENTRY_PRICE,
          color: '#3B82F6',
          lineWidth: 2,
          lineStyle: LightweightCharts.LineStyle.Dashed,
          axisLabelVisible: true,
          title: 'ENTRY',
        });
      }
      if (TP_PRICE > 0) {
        candleSeries.createPriceLine({
          price: TP_PRICE,
          color: '#22C55E',
          lineWidth: 2,
          lineStyle: LightweightCharts.LineStyle.Dashed,
          axisLabelVisible: true,
          title: 'TP',
        });
      }
      if (SL_PRICE > 0) {
        candleSeries.createPriceLine({
          price: SL_PRICE,
          color: '#EF4444',
          lineWidth: 2,
          lineStyle: LightweightCharts.LineStyle.Dashed,
          axisLabelVisible: true,
          title: 'SL',
        });
      }

      // Handle resize
      window.addEventListener('resize', () => {
        chart.applyOptions({
          width: container.clientWidth,
          height: container.clientHeight,
        });
      });
    }

    // Fetch historical data from Binance (try Futures first, fallback to Spot)
    async function fetchKlines() {
      let data = null;
      let useFutures = true;

      try {
        // Try Futures API first
        const futuresUrl = 'https://fapi.binance.com/fapi/v1/klines?symbol=' + SYMBOL + '&interval=' + INTERVAL + '&limit=500';
        const futuresResponse = await fetch(futuresUrl);
        const futuresData = await futuresResponse.json();

        if (Array.isArray(futuresData) && futuresData.length > 0) {
          data = futuresData;
        } else {
          throw new Error('No futures data');
        }
      } catch (futuresError) {
        console.log('Futures API failed, trying Spot API...');
        useFutures = false;

        try {
          // Fallback to Spot API
          const spotUrl = 'https://api.binance.com/api/v3/klines?symbol=' + SYMBOL + '&interval=' + INTERVAL + '&limit=500';
          const spotResponse = await fetch(spotUrl);
          const spotData = await spotResponse.json();

          if (Array.isArray(spotData) && spotData.length > 0) {
            data = spotData;
          } else {
            throw new Error('No spot data either');
          }
        } catch (spotError) {
          console.error('Both APIs failed:', spotError);
          document.getElementById('loading').innerHTML = \`
            <div class="error-container">
              <div class="error-icon">📊</div>
              <div class="error-title">Không thể tải dữ liệu</div>
              <div class="error-msg">Symbol: \${SYMBOL}<br>Coin này không khả dụng</div>
            </div>
          \`;
          return;
        }
      }

      try {
        const candles = data.map(k => ({
          time: k[0] / 1000,
          open: parseFloat(k[1]),
          high: parseFloat(k[2]),
          low: parseFloat(k[3]),
          close: parseFloat(k[4]),
        }));

        const volumes = data.map(k => ({
          time: k[0] / 1000,
          value: parseFloat(k[5]),
          color: parseFloat(k[4]) >= parseFloat(k[1]) ? 'rgba(34, 197, 94, 0.5)' : 'rgba(239, 68, 68, 0.5)',
        }));

        candleSeries.setData(candles);
        if (SHOW_VOLUME && volumeSeries) {
          volumeSeries.setData(volumes);
        }

        document.getElementById('loading').style.display = 'none';

        // Connect WebSocket for live updates
        connectWebSocket(useFutures);
      } catch (error) {
        console.error('Data processing error:', error);
        document.getElementById('loading').innerHTML = \`
          <div class="error-container">
            <div class="error-icon">📊</div>
            <div class="error-title">Lỗi xử lý dữ liệu</div>
            <div class="error-msg">Symbol: \${SYMBOL}<br>Vui lòng thử lại sau</div>
          </div>
        \`;
      }
    }

    // WebSocket for live updates (supports both Futures and Spot)
    let currentUseFutures = true;

    function connectWebSocket(useFutures = true) {
      currentUseFutures = useFutures;
      // Futures: fstream.binance.com, Spot: stream.binance.com
      const wsBase = useFutures ? 'wss://fstream.binance.com/ws/' : 'wss://stream.binance.com:9443/ws/';
      const wsUrl = wsBase + SYMBOL.toLowerCase() + '@kline_' + INTERVAL;
      ws = new WebSocket(wsUrl);

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.k) {
            const k = msg.k;
            const candle = {
              time: k.t / 1000,
              open: parseFloat(k.o),
              high: parseFloat(k.h),
              low: parseFloat(k.l),
              close: parseFloat(k.c),
            };
            candleSeries.update(candle);

            if (SHOW_VOLUME && volumeSeries) {
              volumeSeries.update({
                time: k.t / 1000,
                value: parseFloat(k.v),
                color: parseFloat(k.c) >= parseFloat(k.o) ? 'rgba(34, 197, 94, 0.5)' : 'rgba(239, 68, 68, 0.5)',
              });
            }
          }
        } catch (e) {
          console.error('WS parse error:', e);
        }
      };

      ws.onerror = (error) => {
        console.error('WS error:', error);
      };

      ws.onclose = () => {
        // Reconnect after 3 seconds
        setTimeout(() => connectWebSocket(currentUseFutures), 3000);
      };
    }

    // Initialize
    createChart();
    fetchKlines();
  </script>
</body>
</html>`;
  }, [symbol, activeTimeframe, showVolume, darkTheme, showPriceLines, hasPatternData, patternEntry, patternSL, patternTP, getBinanceInterval]);

  // Toggle functions
  const toggleVolume = useCallback(() => {
    setShowVolume(prev => !prev);
    setWebViewKey(prev => prev + 1);
  }, []);

  const toggleTheme = useCallback(() => {
    setDarkTheme(prev => !prev);
    setWebViewKey(prev => prev + 1);
  }, []);

  const togglePriceLines = useCallback(() => {
    setShowPriceLines(prev => !prev);
    setWebViewKey(prev => prev + 1);
  }, []);

  const handleTimeframeChange = useCallback((newTimeframe) => {
    setActiveTimeframe(newTimeframe);
    onTimeframeChange?.(newTimeframe);
    setWebViewKey(prev => prev + 1);
  }, [onTimeframeChange]);

  // Reload when symbol changes
  useEffect(() => {
    setWebViewKey(prev => prev + 1);
  }, [symbol]);

  // Reload when pattern changes
  useEffect(() => {
    if (showPriceLines) {
      setWebViewKey(prev => prev + 1);
    }
  }, [selectedPattern, showPriceLines]);

  const refreshChart = useCallback(() => {
    setIsLoading(true);
    setWebViewKey(prev => prev + 1);
  }, []);

  // Render chart
  const renderChart = (isFullScreen = false) => (
    <View
      style={[
        styles.chartWrapper,
        isFullScreen && styles.chartWrapperFullScreen,
        !darkTheme && styles.chartWrapperLight,
        { height: isFullScreen ? '100%' : height }
      ]}
      {...panResponder.panHandlers}
    >
      <WebView
        key={`lwc-${webViewKey}-${showVolume}-${darkTheme}-${showPriceLines}`}
        ref={webViewRef}
        source={{ html: generateChartHTML() }}
        style={styles.webView}
        scrollEnabled={true}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={false}
        onLoadStart={() => setIsLoading(true)}
        onLoadEnd={() => setIsLoading(false)}
        originWhitelist={['*']}
        mixedContentMode="always"
        cacheEnabled={false}
        nestedScrollEnabled={true}
        overScrollMode="never"
        bounces={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        androidLayerType="hardware"
      />

      {/* Loading overlay */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={COLORS.gold} />
        </View>
      )}

      {/* Controls only show in fullscreen mode */}
      {isFullScreen && (
        <View style={styles.controlsFullScreen}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => setFullScreen(false)}
          >
            <Minimize2 size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <>
      {/* Normal Chart */}
      <View style={styles.container}>
        {/* Chart Toolbar - ABOVE CHART */}
        <ChartToolbar
          timeframes={['1m', '5m', '15m', '1h', '4h', '1D', '1W']}
          activeTimeframe={activeTimeframe}
          onTimeframeChange={handleTimeframeChange}
          showPriceLines={showPriceLines}
          onTogglePriceLines={togglePriceLines}
          showVolume={showVolume}
          onToggleVolume={toggleVolume}
          onToggleTheme={toggleTheme}
          onZoomIn={() => {}}
          onZoomOut={() => {}}
          onFullscreen={() => setFullScreen(true)}
          compact={true}
        />

        {/* Chart WebView */}
        {renderChart(false)}
      </View>

      {/* Full Screen Modal */}
      <Modal
        visible={fullScreen}
        animationType="fade"
        supportedOrientations={['portrait', 'landscape']}
        onRequestClose={() => setFullScreen(false)}
      >
        <StatusBar hidden={fullScreen} />
        <View style={[
          styles.fullScreenContainer,
          !darkTheme && styles.fullScreenContainerLight
        ]}>
          {renderChart(true)}

          {/* Close button */}
          <TouchableOpacity
            style={styles.closeFullScreen}
            onPress={() => setFullScreen(false)}
          >
            <X size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.xs,
  },

  chartWrapper: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#0D0D0D',
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.3)',
  },

  chartWrapperFullScreen: {
    borderRadius: 0,
    borderWidth: 0,
  },

  chartWrapperLight: {
    backgroundColor: '#FFFFFF',
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },

  webView: {
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
  },

  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(13, 13, 13, 0.8)',
  },

  controlsFullScreen: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    right: 20,
    flexDirection: 'row',
    gap: 8,
  },

  controlButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  fullScreenContainer: {
    flex: 1,
    backgroundColor: '#0D0D0D',
  },

  fullScreenContainerLight: {
    backgroundColor: '#FFFFFF',
  },

  closeFullScreen: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default TradingChart;
