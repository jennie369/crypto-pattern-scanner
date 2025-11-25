/**
 * GEM Mobile - Trading Chart
 * FUTURES Binance + Volume/Theme/Fullscreen controls
 * Design tokens v3.0 compliant
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Dimensions,
  StatusBar,
  Platform,
} from 'react-native';
import { WebView } from 'react-native-webview';
import {
  Maximize2,
  Minimize2,
  BarChart2,
  Sun,
  Moon,
  X,
} from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, GLASS } from '../../../utils/tokens';
import { ALL_TIMEFRAMES } from './TimeframeSelector';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const TradingChart = ({
  symbol = 'BTCUSDT',
  timeframe = '4h',
  height = 350,
  onSymbolPress,
}) => {
  const [showVolume, setShowVolume] = useState(true);
  const [darkTheme, setDarkTheme] = useState(true);
  const [fullScreen, setFullScreen] = useState(false);
  const webViewRef = useRef(null);
  const [key, setKey] = useState(0); // Force reload

  // Reload chart when settings change
  useEffect(() => {
    setKey(prev => prev + 1);
  }, [showVolume, darkTheme, symbol, timeframe]);

  // Get TradingView interval from timeframe
  const getTVInterval = () => {
    const tfData = ALL_TIMEFRAMES?.find(tf => tf.key === timeframe);
    return tfData?.tradingview || '240';
  };

  // Generate TradingView widget HTML
  // USING FUTURES: BINANCE:BTCUSDT.P (Perpetual)
  const getChartHTML = () => {
    const tvSymbol = `BINANCE:${symbol.replace('USDT', '')}USDT.P`; // .P = Perpetual Futures
    const interval = getTVInterval();
    const theme = darkTheme ? 'dark' : 'light';
    const bgColor = darkTheme ? '#05040B' : '#FFFFFF';
    const gridColor = darkTheme ? 'rgba(106, 91, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    const textColor = darkTheme ? '#9CA3B0' : '#333333';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          html, body {
            width: 100%;
            height: 100%;
            background: ${bgColor};
            overflow: hidden;
          }
          #chart { width: 100%; height: 100%; }
        </style>
      </head>
      <body>
        <div id="chart"></div>
        <script src="https://s3.tradingview.com/tv.js"></script>
        <script>
          new TradingView.widget({
            "autosize": true,
            "symbol": "${tvSymbol}",
            "interval": "${interval}",
            "timezone": "Asia/Ho_Chi_Minh",
            "theme": "${theme}",
            "style": "1",
            "locale": "vi_VN",
            "toolbar_bg": "${bgColor}",
            "enable_publishing": false,
            "hide_top_toolbar": false,
            "hide_legend": false,
            "hide_side_toolbar": true,
            "allow_symbol_change": false,
            "save_image": false,
            "container_id": "chart",
            "studies": ${showVolume ? '["Volume@tv-basicstudies"]' : '[]'},
            "overrides": {
              "paneProperties.background": "${bgColor}",
              "paneProperties.vertGridProperties.color": "${gridColor}",
              "paneProperties.horzGridProperties.color": "${gridColor}",
              "symbolWatermarkProperties.transparency": 90,
              "scalesProperties.textColor": "${textColor}",
              "mainSeriesProperties.candleStyle.upColor": "#3AF7A6",
              "mainSeriesProperties.candleStyle.downColor": "#FF6B6B",
              "mainSeriesProperties.candleStyle.wickUpColor": "#3AF7A6",
              "mainSeriesProperties.candleStyle.wickDownColor": "#FF6B6B",
              "mainSeriesProperties.candleStyle.borderUpColor": "#3AF7A6",
              "mainSeriesProperties.candleStyle.borderDownColor": "#FF6B6B"
            }
          });
        </script>
      </body>
      </html>
    `;
  };

  // Toggle volume
  const toggleVolume = () => {
    setShowVolume(!showVolume);
  };

  // Toggle theme
  const toggleTheme = () => {
    setDarkTheme(!darkTheme);
  };

  // Render chart
  const renderChart = (isFullScreen = false) => (
    <View style={[
      styles.chartWrapper,
      isFullScreen && styles.chartWrapperFullScreen,
      !darkTheme && styles.chartWrapperLight,
      { height: isFullScreen ? '100%' : height }
    ]}>
      <WebView
        key={key}
        ref={webViewRef}
        source={{ html: getChartHTML() }}
        style={styles.webView}
        scrollEnabled={false}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={true}
        originWhitelist={['*']}
        mixedContentMode="always"
      />

      {/* Chart Controls */}
      <View style={[
        styles.controls,
        isFullScreen && styles.controlsFullScreen
      ]}>
        {/* Volume Toggle */}
        <TouchableOpacity
          style={[styles.controlButton, showVolume && styles.controlButtonActive]}
          onPress={toggleVolume}
        >
          <BarChart2 size={18} color={showVolume ? COLORS.gold : COLORS.textMuted} />
        </TouchableOpacity>

        {/* Theme Toggle */}
        <TouchableOpacity
          style={[styles.controlButton, !darkTheme && styles.controlButtonLight]}
          onPress={toggleTheme}
        >
          {darkTheme ? (
            <Sun size={18} color={COLORS.textMuted} />
          ) : (
            <Moon size={18} color="#333333" />
          )}
        </TouchableOpacity>

        {/* Full Screen Toggle */}
        <TouchableOpacity
          style={[styles.controlButton, !darkTheme && styles.controlButtonLight]}
          onPress={() => setFullScreen(!fullScreen)}
        >
          {isFullScreen ? (
            <Minimize2 size={18} color={darkTheme ? COLORS.textMuted : '#333333'} />
          ) : (
            <Maximize2 size={18} color={darkTheme ? COLORS.textMuted : '#333333'} />
          )}
        </TouchableOpacity>
      </View>

      {/* Symbol Badge */}
      <TouchableOpacity
        style={styles.symbolBadge}
        onPress={onSymbolPress}
        activeOpacity={0.8}
      >
        <Text style={styles.symbolText}>{symbol.replace('USDT', '/USDT')}</Text>
        <View style={styles.futuresBadge}>
          <Text style={styles.futuresText}>PERP</Text>
        </View>
      </TouchableOpacity>
    </View>
  );

  return (
    <>
      {/* Normal Chart */}
      <View style={styles.container}>
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
    marginVertical: SPACING.md,
  },

  chartWrapper: {
    borderRadius: GLASS.borderRadius,
    overflow: 'hidden',
    backgroundColor: COLORS.bgDarkest,
    borderWidth: 1.2,
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
    flex: 1,
    backgroundColor: 'transparent',
  },

  controls: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    gap: 8,
  },

  controlsFullScreen: {
    top: Platform.OS === 'ios' ? 50 : 20,
    right: 20,
  },

  controlButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  controlButtonActive: {
    backgroundColor: 'rgba(255, 189, 89, 0.3)',
    borderWidth: 1,
    borderColor: COLORS.gold,
  },

  controlButtonLight: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },

  symbolBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  symbolText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: '#FFFFFF',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },

  futuresBadge: {
    backgroundColor: COLORS.purple,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },

  futuresText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: '#FFFFFF',
  },

  fullScreenContainer: {
    flex: 1,
    backgroundColor: COLORS.bgDarkest,
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
