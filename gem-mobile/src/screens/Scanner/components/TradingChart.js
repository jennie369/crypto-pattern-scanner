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
  Layers,
  Eye,
  EyeOff,
} from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../utils/tokens';
import ChartToolbar from '../../../components/Trading/ChartToolbar';
import { DrawingToolbar, OrderLinesToggle, OrderLinesSettings } from '../../../components/Trading';
import DrawingListModal from '../../../components/Trading/DrawingListModal';
import { useAuth } from '../../../contexts/AuthContext';
import drawingService from '../../../services/drawingService';
import { useOrderLines } from '../../../hooks/useOrderLines';
import { chartPreferencesService } from '../../../services/chartPreferencesService';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Binance kline intervals mapping (must match Binance API intervals exactly)
const TIMEFRAME_TO_BINANCE = {
  // Seconds (spot only)
  '1s': '1s',
  // Minutes
  '1m': '1m',
  '3m': '3m',
  '5m': '5m',
  '15m': '15m',
  '30m': '30m',
  // Hours
  '1h': '1h',
  '2h': '2h',
  '4h': '4h',
  '6h': '6h',
  '8h': '8h',
  '12h': '12h',
  // Days
  '1d': '1d',
  '1D': '1d',
  '3d': '3d',
  '3D': '3d',
  // Weeks
  '1w': '1w',
  '1W': '1w',
  // Months
  '1M': '1M',
};

const TradingChart = ({
  symbol = 'BTCUSDT',
  timeframe = '4h',
  height = 350,
  onSymbolPress,
  onTimeframeChange,
  selectedPattern = null,
  patterns = [],
  positionsRefreshTrigger = 0, // Increment when positions change to refresh order lines
  // Zone Visualization Props (NEW)
  zones = [],
  zonePreferences = null,
  onZonePress = null,
  // ⚠️ ZONE-PATTERN SYNC: For highlighting the selected zone
  selectedZonePatternId = null,
  // ═══════════════════════════════════════════════════════════
  // POSITION ZONE TOGGLE PROPS (NEW)
  // ═══════════════════════════════════════════════════════════
  showPositionZone = true,
  onTogglePositionZone = null,
  selectedPosition = null, // The currently selected position (for zone info)
  // ═══════════════════════════════════════════════════════════
  // REAL-TIME PRICE CALLBACK (for P&L sync)
  // ═══════════════════════════════════════════════════════════
  onPriceUpdate = null, // Callback when price updates: (price) => void
  // ═══════════════════════════════════════════════════════════
  // ZONE DISPLAY MODE (for ChartToolbar toggle)
  // ═══════════════════════════════════════════════════════════
  zoneDisplayMode = 'all', // 'all' | 'selected' | 'hidden'
  onZoneDisplayModeChange = null,
}) => {
  const [showVolume, setShowVolume] = useState(true);
  const [darkTheme, setDarkTheme] = useState(true);
  const [fullScreen, setFullScreen] = useState(false);
  const [showPriceLines, setShowPriceLines] = useState(true);
  const [activeTimeframe, setActiveTimeframe] = useState(timeframe);
  const [isLoading, setIsLoading] = useState(true);
  const webViewRef = useRef(null);

  // Drawing state
  const [showDrawingToolbar, setShowDrawingToolbar] = useState(false);
  const [drawingMode, setDrawingMode] = useState(null);
  const [drawings, setDrawings] = useState([]);
  const [magnetMode, setMagnetMode] = useState(true);
  const [pendingPoints, setPendingPoints] = useState(0);
  const [tempDrawingData, setTempDrawingData] = useState(null);
  // New drawing states
  const [selectedColor, setSelectedColor] = useState('#FFBD59');
  const [selectedLineStyle, setSelectedLineStyle] = useState('solid');
  const [showDrawingList, setShowDrawingList] = useState(false);
  // Order lines state
  const [showOrderLines, setShowOrderLines] = useState(true);
  const [showOrderLinesSettings, setShowOrderLinesSettings] = useState(false);
  // Chart ready state
  const [chartReady, setChartReady] = useState(false);

  // Auth context for user ID
  const { user } = useAuth();

  // Order lines hook
  const {
    orderLines,
    preferences: orderLinesPreferences,
    refresh: refreshOrderLines,
    toggleVisibility: toggleOrderLineVisibility,
    lineCount: orderLineCount,
    positionCount,
    pendingCount,
  } = useOrderLines(symbol, showOrderLines, positionsRefreshTrigger);

  // WebView key for force remount
  const [webViewKey, setWebViewKey] = useState(0);

  // Track if timeframe change is programmatic (to avoid race condition)
  const isProgrammaticChange = useRef(false);

  // Store the timeframe used for HTML generation (only changes on explicit reload)
  const htmlTimeframeRef = useRef(timeframe);

  // Store zones in ref for injection when chart becomes ready (fixes timing issue)
  const zonesRef = useRef(zones);
  const zonePreferencesRef = useRef(zonePreferences);
  const symbolRef = useRef(symbol);

  // Keep refs updated
  useEffect(() => {
    zonesRef.current = zones;
    zonePreferencesRef.current = zonePreferences;
    symbolRef.current = symbol;
    console.log('[TradingChart] Refs updated:', { zonesCount: zones?.length, symbol });
  }, [zones, zonePreferences, symbol]);

  // Reset chartReady when WebView reloads
  useEffect(() => {
    setChartReady(false);
    // Update the HTML timeframe ref when WebView is about to reload
    htmlTimeframeRef.current = activeTimeframe;
    console.log('[TradingChart] WebView reload - htmlTimeframeRef set to:', activeTimeframe);
  }, [webViewKey]);

  // Sync activeTimeframe when prop timeframe changes from parent
  // BUT skip if change was initiated by handleTimeframeChange (to avoid race condition)
  useEffect(() => {
    if (timeframe !== activeTimeframe) {
      // Skip if this is a programmatic change from handleTimeframeChange
      if (isProgrammaticChange.current) {
        console.log('[TradingChart] Skipping parent sync - programmatic change in progress');
        isProgrammaticChange.current = false;
        return;
      }

      console.log('[TradingChart] Timeframe changed from parent:', timeframe);
      const binanceInterval = TIMEFRAME_TO_BINANCE[timeframe] || timeframe;
      setActiveTimeframe(timeframe);

      // ✅ FIX: Clear zones IMMEDIATELY when timeframe changes to prevent zone bleed
      // This ensures old zones don't appear while new data loads
      if (chartReady && webViewRef.current) {
        webViewRef.current.injectJavaScript(`
          if (window.clearZones) {
            window.clearZones();
            console.log('[Chart] Zones cleared on TF change');
          }
          true;
        `);
      }

      // ✅ FIX: Reset chartReady to prevent zone injection before new data loads
      // The timeframe_changed message will set it back to true
      setChartReady(false);

      // Use injection method if chart was ready, otherwise reload
      if (webViewRef.current) {
        webViewRef.current.injectJavaScript(`
          if (window.changeTimeframe) {
            window.changeTimeframe('${binanceInterval}');
          }
          true;
        `);
      } else {
        htmlTimeframeRef.current = timeframe; // Sync ref before reload
        setWebViewKey(prev => prev + 1);
      }
    }
  }, [timeframe, chartReady]);

  // Pattern price data
  const displayPattern = selectedPattern || (patterns.length > 0 ? patterns[0] : null);
  const patternEntry = displayPattern?.entry || 0;
  const patternSL = displayPattern?.stopLoss || 0;
  const patternTP = displayPattern?.target || displayPattern?.takeProfit1 || displayPattern?.takeProfit || displayPattern?.targets?.[0] || 0;
  const patternDirection = displayPattern?.direction || 'LONG';
  const hasPatternData = displayPattern && patternEntry > 0;

  // Load drawings when symbol/timeframe changes
  useEffect(() => {
    const loadDrawings = async () => {
      if (!user?.id || !symbol) return;

      const { data, error } = await drawingService.fetchDrawings(
        user.id,
        symbol,
        activeTimeframe
      );

      if (!error && data) {
        setDrawings(data);
        // Send drawings to WebView if chart is ready
        if (webViewRef.current && chartReady) {
          webViewRef.current.injectJavaScript(`
            if (window.loadDrawings) {
              window.loadDrawings(${JSON.stringify(data)});
            }
            true;
          `);
        }
      }
    };

    loadDrawings();
  }, [user?.id, symbol, activeTimeframe]);

  // Re-inject drawings and sync drawing settings when chart becomes ready (after any WebView reload)
  useEffect(() => {
    if (!chartReady || !webViewRef.current) return;

    // Small delay to ensure WebView is fully ready
    const timer = setTimeout(() => {
      // Sync current drawing color and line style
      webViewRef.current?.injectJavaScript(`
        if (window.setDrawingColor) {
          window.setDrawingColor('${selectedColor}');
        }
        if (window.setDrawingLineStyle) {
          window.setDrawingLineStyle('${selectedLineStyle}');
        }
        true;
      `);

      // Re-inject drawings if there are any
      if (drawings.length > 0) {
        console.log('[TradingChart] Re-injecting drawings after chart ready:', drawings.length);
        webViewRef.current?.injectJavaScript(`
          if (window.loadDrawings) {
            window.loadDrawings(${JSON.stringify(drawings)});
          }
          true;
        `);
      }
    }, 150);

    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chartReady]); // Only run when chartReady changes - selectedColor/selectedLineStyle/drawings are intentionally read at execution time

  // Update drawings in WebView when drawings array changes (new drawing saved, drawing deleted, etc.)
  useEffect(() => {
    if (!chartReady || !webViewRef.current) return;

    webViewRef.current.injectJavaScript(`
      if (window.loadDrawings) {
        window.loadDrawings(${JSON.stringify(drawings)});
      }
      true;
    `);
  }, [drawings, chartReady]);

  // Send order lines to WebView when they change and chart is ready
  useEffect(() => {
    if (!webViewRef.current || !chartReady) return;

    const injectOrderLines = () => {
      if (showOrderLines && orderLines.length > 0) {
        console.log('[TradingChart] Injecting order lines:', orderLines.length);
        webViewRef.current?.injectJavaScript(`
          if (window.updateOrderLines) {
            window.updateOrderLines(${JSON.stringify(orderLines)});
            console.log('Order lines updated:', ${orderLines.length});
          }
          true;
        `);
      } else {
        // Clear order lines if disabled or empty
        webViewRef.current?.injectJavaScript(`
          if (window.clearOrderLines) {
            window.clearOrderLines();
          }
          true;
        `);
      }
    };

    // Small delay to ensure any previous operations complete
    const timer = setTimeout(injectOrderLines, 100);
    return () => clearTimeout(timer);
  }, [orderLines, showOrderLines, chartReady]);

  // Send pattern lines to WebView with smart filtering against order lines
  useEffect(() => {
    if (!webViewRef.current || !chartReady) return;

    const injectPatternLines = () => {
      // Only inject pattern lines if enabled and has pattern data
      if (showPriceLines && hasPatternData) {
        const patternData = {
          entry: patternEntry,
          tp: patternTP,
          sl: patternSL,
          direction: patternDirection,
        };

        // zonesEnabled = true means use canvas zones (TIER1+), hide labels
        // zonesEnabled = false means FREE tier, show labels on price lines
        const zonesEnabled = zones && zones.length > 0;
        console.log('[TradingChart] Injecting pattern lines:', patternData, 'zonesEnabled:', zonesEnabled);
        webViewRef.current?.injectJavaScript(`
          if (window.updatePatternLines) {
            window.updatePatternLines(
              ${JSON.stringify(patternData)},
              ${JSON.stringify(showOrderLines ? orderLines : [])},
              ${zonesEnabled}
            );
          }
          true;
        `);
      } else {
        // Clear pattern lines if disabled
        webViewRef.current?.injectJavaScript(`
          if (window.clearPatternLines) {
            window.clearPatternLines();
          }
          true;
        `);
      }
    };

    // Small delay to ensure order lines are processed first
    const timer = setTimeout(injectPatternLines, 200);
    return () => clearTimeout(timer);
  }, [showPriceLines, hasPatternData, patternEntry, patternTP, patternSL, patternDirection, orderLines, showOrderLines, chartReady, zones]);

  // Track if symbol is pending change (to avoid injecting to wrong WebView)
  const pendingSymbolChangeRef = useRef(false);

  // Detect symbol change EARLY and set pending flag
  useEffect(() => {
    // This effect runs when symbol prop changes
    // Set flag so zone injection is deferred until new chart is ready
    pendingSymbolChangeRef.current = true;
    // CRITICAL: Reset chartReady so zones wait for new chart to be initialized
    setChartReady(false);
    console.log('[TradingChart] Symbol changed, deferring zone injection, resetting chartReady:', symbol);

    // CRITICAL: Clear old zones in WebView immediately to prevent stale zone rendering
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript(`
        if (window.clearZones) {
          window.clearZones();
          console.log('[Chart] Zones cleared on symbol change');
        }
        true;
      `);
    }
  }, [symbol]);

  // Send zones to WebView when zones change and chart is already ready
  useEffect(() => {
    console.log('[TradingChart] Zone change effect:', {
      zonesCount: zones?.length || 0,
      chartReady,
      hasWebView: !!webViewRef.current,
      pendingSymbolChange: pendingSymbolChangeRef.current,
      firstZone: zones?.[0] ? { id: zones[0].id, zone_high: zones[0].zone_high, zone_low: zones[0].zone_low } : null
    });

    // Skip if chart not ready OR if symbol just changed (WebView will reload)
    if (!chartReady || !webViewRef.current || pendingSymbolChangeRef.current) {
      console.log('[TradingChart] Zone injection skipped:', { chartReady, pendingSymbolChange: pendingSymbolChangeRef.current });
      return;
    }

    const timer = setTimeout(() => {
      if (zones && zones.length > 0) {
        console.log('[TradingChart] Injecting zones from zone change:', zones.length);
        webViewRef.current?.injectJavaScript(`
          if (window.updateZones) {
            window.updateZones(${JSON.stringify(zones)}, ${JSON.stringify(zonePreferences)});
          }
          true;
        `);
      } else {
        webViewRef.current?.injectJavaScript(`
          if (window.clearZones) {
            window.clearZones();
          }
          true;
        `);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [zones, zonePreferences, chartReady]);

  // CRITICAL: Inject zones when chartReady changes to true (fixes timing issue)
  // This ensures zones stored in ref are injected even if they were set before chart was ready
  useEffect(() => {
    if (!chartReady || !webViewRef.current) return;

    // Clear the pending symbol change flag - new chart is now ready
    pendingSymbolChangeRef.current = false;

    const currentZones = zonesRef.current;
    const currentPrefs = zonePreferencesRef.current;
    const currentSymbol = symbolRef.current;

    console.log('[TradingChart] Chart became ready - checking stored zones:', {
      zonesCount: currentZones?.length || 0,
      symbol: currentSymbol,
      propSymbol: symbol,
      pendingSymbolChange: false
    });

    // Inject zones from ref (zones were stored before chart was ready)
    if (currentZones && currentZones.length > 0) {
      // Longer delay to ensure chart is fully initialized
      const timer = setTimeout(() => {
        // Double-check refs are still valid and WebView exists
        const latestZones = zonesRef.current;
        const latestPrefs = zonePreferencesRef.current;

        if (latestZones && latestZones.length > 0 && webViewRef.current) {
          console.log('[TradingChart] ✅ Injecting stored zones after chart ready:', latestZones.length);
          webViewRef.current.injectJavaScript(`
            if (window.updateZones) {
              window.updateZones(${JSON.stringify(latestZones)}, ${JSON.stringify(latestPrefs)});
            }
            true;
          `);
        } else {
          console.log('[TradingChart] ❌ No zones to inject or WebView gone:', { zonesCount: latestZones?.length, hasWebView: !!webViewRef.current });
        }
      }, 400);
      return () => clearTimeout(timer);
    } else {
      console.log('[TradingChart] No stored zones to inject');
    }
  }, [chartReady, symbol]);

  // Handle drawing tool selection
  const handleSelectDrawingTool = useCallback((toolId) => {
    if (drawingMode === toolId) {
      // Deselect if already selected
      setDrawingMode(null);
      setPendingPoints(0);
      setTempDrawingData(null);
    } else {
      setDrawingMode(toolId);
      setPendingPoints(0);
      setTempDrawingData(null);
    }

    // Send to WebView
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript(`
        if (window.setDrawingMode) {
          window.setDrawingMode('${toolId === drawingMode ? null : toolId}');
        }
        true;
      `);
    }
  }, [drawingMode]);

  // Handle delete all drawings
  const handleDeleteAllDrawings = useCallback(async () => {
    if (!user?.id || !symbol) return;

    const { success } = await drawingService.deleteAllDrawings(user.id, symbol);

    if (success) {
      setDrawings([]);
      // Clear drawings in WebView
      if (webViewRef.current) {
        webViewRef.current.injectJavaScript(`
          if (window.clearAllDrawings) {
            window.clearAllDrawings();
          }
          true;
        `);
      }
    }
  }, [user?.id, symbol]);

  // Handle delete single drawing
  const handleDeleteDrawing = useCallback(async (drawingId) => {
    const { success } = await drawingService.deleteDrawing(drawingId);
    if (success) {
      setDrawings(prev => prev.filter(d => d.id !== drawingId));
      // Remove from WebView
      if (webViewRef.current) {
        webViewRef.current.injectJavaScript(`
          if (window.removeDrawing) {
            window.removeDrawing('${drawingId}');
          }
          true;
        `);
      }
    }
  }, []);

  // Handle update drawing (color change)
  const handleUpdateDrawing = useCallback(async (drawingId, updates) => {
    const { success } = await drawingService.updateDrawing(drawingId, updates);
    if (success) {
      setDrawings(prev => prev.map(d =>
        d.id === drawingId ? { ...d, ...updates } : d
      ));
      // Update in WebView
      if (webViewRef.current) {
        webViewRef.current.injectJavaScript(`
          if (window.updateDrawing) {
            window.updateDrawing('${drawingId}', ${JSON.stringify(updates)});
          }
          true;
        `);
      }
    }
  }, []);

  // Handle color change
  const handleColorChange = useCallback((color) => {
    setSelectedColor(color);
    // Send to WebView
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript(`
        if (window.setDrawingColor) {
          window.setDrawingColor('${color}');
        }
        true;
      `);
    }
  }, []);

  // Handle line style change
  const handleLineStyleChange = useCallback((style) => {
    setSelectedLineStyle(style);
    // Send to WebView
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript(`
        if (window.setDrawingLineStyle) {
          window.setDrawingLineStyle('${style}');
        }
        true;
      `);
    }
  }, []);

  // Handle WebView message (drawing clicks)
  const handleWebViewMessage = useCallback(async (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      // Debug logs from WebView
      if (data.type === 'debug_log') {
        console.log('[WebView]', data.message, data.data);
        return;
      }

      if (data.type === 'drawing_complete') {
        // Save drawing to database
        const newDrawing = {
          user_id: user?.id,
          symbol,
          timeframe: activeTimeframe,
          tool_type: data.toolType,
          drawing_data: data.drawingData,
          visible_timeframes: ['1m', '5m', '15m', '1h', '4h', '1d', '1w'],
        };

        const { data: savedDrawing, error } = await drawingService.saveDrawing(newDrawing);

        if (!error && savedDrawing) {
          setDrawings(prev => [...prev, savedDrawing]);
          console.log('[TradingChart] Drawing saved:', savedDrawing.id);
        }

        // Reset drawing mode
        setPendingPoints(0);
        setTempDrawingData(null);
      } else if (data.type === 'drawing_pending') {
        setPendingPoints(data.points || 0);
        setTempDrawingData(data.tempData || null);
      } else if (data.type === 'drawing_deleted') {
        // Remove from local state
        setDrawings(prev => prev.filter(d => d.id !== data.drawingId));
        // Delete from database
        await drawingService.deleteDrawing(data.drawingId);
      } else if (data.type === 'chart_ready') {
        // Chart has loaded data and is ready for order lines
        console.log('[TradingChart] Chart ready signal received:', data.symbol, data.candles);
        console.log('[TradingChart] Current zonesRef at chart_ready:', zonesRef.current?.length, zonesRef.current?.[0]?.id);
        setChartReady(true);
      } else if (data.type === 'price_update') {
        // Real-time price update from WebSocket - emit to parent for P&L sync
        if (onPriceUpdate && data.price) {
          onPriceUpdate(data.price);
        }
      } else if (data.type === 'zone_update_debug') {
        // Debug: Zone update received in WebView
        console.log('[TradingChart] 🔵 WEBVIEW zone_update_debug:', data);
      } else if (data.type === 'zone_render_debug') {
        // Debug: Zone render details from WebView
        console.log('[TradingChart] 🟢 WEBVIEW zone_render_debug:', data);
      } else if (data.type === 'zone_draw_start') {
        // Debug: Zone draw started
        console.log('[TradingChart] 🎨 WEBVIEW zone_draw_start:', data);
      } else if (data.type === 'timeframe_changed') {
        // Timeframe was changed via JavaScript (without WebView reload)
        console.log('[TradingChart] Timeframe changed:', data.interval, 'candles:', data.candles);

        // Refresh order lines
        if (webViewRef.current && showOrderLines && orderLines.length > 0) {
          setTimeout(() => {
            webViewRef.current?.injectJavaScript(`
              if (window.updateOrderLines) {
                window.updateOrderLines(${JSON.stringify(orderLines)});
              }
              true;
            `);
          }, 100);
        }

        // Refresh drawings
        if (webViewRef.current && drawings.length > 0) {
          setTimeout(() => {
            webViewRef.current?.injectJavaScript(`
              if (window.loadDrawings) {
                window.loadDrawings(${JSON.stringify(drawings)});
              }
              true;
            `);
          }, 150);
        }

        // ✅ FIX: Set chartReady=true AFTER new data loaded
        // This triggers the chartReady effect which injects zones from zonesRef.current
        // Replacing the stale-closure zone injection that used old zones prop
        setChartReady(true);
      } else if (data.type === 'zone_press') {
        // Handle zone press event
        console.log('[TradingChart] Zone pressed:', data.zoneId);
        onZonePress?.(data.zone);
      } else if (data.type === 'zone_skip') {
        // Debug: Zone was skipped during rendering
        console.log('[TradingChart] ⚠️ ZONE SKIPPED:', data.reason, data);
      } else if (data.type === 'zone_draw_success') {
        // Debug: Zone drawing succeeded
        console.log('[TradingChart] ✅ ZONE DRAWN:', data);
      }
    } catch (e) {
      console.log('[TradingChart] Message parse error:', e);
    }
  }, [user?.id, symbol, activeTimeframe, showOrderLines, orderLines, drawings, zones, zonePreferences, onZonePress]);

  // Toggle drawing toolbar
  const handleToggleDrawing = useCallback(() => {
    setShowDrawingToolbar(prev => {
      const newValue = !prev;
      if (!newValue) {
        // Reset drawing mode when closing toolbar
        setDrawingMode(null);
        setPendingPoints(0);
        setTempDrawingData(null);
        if (webViewRef.current) {
          webViewRef.current.injectJavaScript(`
            if (window.setDrawingMode) {
              window.setDrawingMode(null);
            }
            true;
          `);
        }
      }
      return newValue;
    });
  }, []);

  // PanResponder to prevent parent ScrollView from intercepting chart interactions
  // Key: Don't capture (let WebView handle), but block native responder
  const panResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => false,        // Don't become responder
    onMoveShouldSetPanResponder: () => false,         // Don't become responder
    onStartShouldSetPanResponderCapture: () => false, // Don't capture - let WebView handle
    onMoveShouldSetPanResponderCapture: () => false,  // Don't capture - let WebView handle
    onPanResponderTerminationRequest: () => false,    // Don't allow termination
    onShouldBlockNativeResponder: () => true,         // Block parent native scroll
  }), []);

  // Get Binance interval for HTML generation (uses ref to avoid triggering HTML regeneration)
  const getBinanceIntervalForHtml = useCallback(() => {
    return TIMEFRAME_TO_BINANCE[htmlTimeframeRef.current] || '4h';
  }, []); // No dependencies - reads from ref

  // Generate chart HTML with lightweight-charts
  // IMPORTANT: Uses htmlTimeframeRef instead of activeTimeframe to prevent reload on timeframe change
  const generateChartHTML = useCallback(() => {
    const binanceSymbol = symbol.toUpperCase();
    const interval = getBinanceIntervalForHtml();
    const bgColor = darkTheme ? '#0D0D0D' : '#FFFFFF';
    const textColor = darkTheme ? '#D1D4DC' : '#131722';
    const gridColor = darkTheme ? 'rgba(42, 46, 57, 0.5)' : 'rgba(42, 46, 57, 0.1)';

    // Price lines config - Pattern lines (from scan) and Order lines (from positions) are SEPARATE
    // Pattern lines show suggested Entry/SL/TP from scan results
    // Order lines show actual Entry/SL/TP from open positions
    const entryPrice = showPriceLines && hasPatternData ? patternEntry : 0;
    const slPrice = showPriceLines && hasPatternData ? patternSL : 0;
    const tpPrice = showPriceLines && hasPatternData ? patternTP : 0;

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <script src="https://cdn.jsdelivr.net/npm/lightweight-charts@4.1.0/dist/lightweight-charts.standalone.production.js"></script>
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
      font-size: 13px;
      text-align: center;
    }
    .loading-spinner {
      width: 32px;
      height: 32px;
      border: 3px solid rgba(106, 91, 255, 0.3);
      border-top-color: #FFBD59;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 10px;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
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
    <div class="loading" id="loading">
      <div class="loading-spinner"></div>
      <div>Đang tải dữ liệu...</div>
    </div>
  </div>
  <script>
    // ✅ CODE VERSION: 2026-01-16-v2 (tooltip debounce + zone clipping fix)
    console.log('[TradingChart] CODE VERSION: 2026-01-16-v2');

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

    // Helper function to calculate precision based on price (global scope)
    function calculatePricePrecision(price) {
      if (!price || price <= 0) return { precision: 2, minMove: 0.01 };
      if (price >= 1000) return { precision: 2, minMove: 0.01 };
      if (price >= 1) return { precision: 4, minMove: 0.0001 };
      if (price >= 0.01) return { precision: 6, minMove: 0.000001 };
      return { precision: 8, minMove: 0.00000001 };
    }

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
          autoScale: true,
          scaleMargins: {
            top: 0.15,
            bottom: SHOW_VOLUME ? 0.28 : 0.15,
          },
          alignLabels: true,
          borderVisible: true,
          entireTextOnly: false,
        },
        localization: {
          priceFormatter: (price) => {
            if (price >= 10000) {
              return price.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
            } else if (price >= 1000) {
              return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            } else if (price >= 100) {
              return price.toFixed(2);
            } else if (price >= 1) {
              return price.toFixed(4);
            } else if (price >= 0.01) {
              return price.toFixed(6);
            } else if (price >= 0.0001) {
              return price.toFixed(8);
            } else {
              // For very small prices, use scientific notation or max decimals
              return price.toPrecision(4);
            }
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

      // Get initial precision from entry price or a reasonable default
      const initialPrice = ENTRY_PRICE > 0 ? ENTRY_PRICE : 1;
      const { precision, minMove } = calculatePricePrecision(initialPrice);

      // Candlestick series with dynamic price formatting
      candleSeries = chart.addCandlestickSeries({
        upColor: '#22C55E',
        downColor: '#EF4444',
        borderUpColor: '#22C55E',
        borderDownColor: '#EF4444',
        wickUpColor: '#22C55E',
        wickDownColor: '#EF4444',
        priceFormat: {
          type: 'price',
          precision: precision,
          minMove: minMove,
        },
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

      // Pattern lines will be added dynamically via updatePatternLines
      // This allows us to hide them when order lines are present at similar prices
      // Pattern lines use cyan color and dotted style to distinguish from order lines

      // Handle resize
      window.addEventListener('resize', () => {
        chart.applyOptions({
          width: container.clientWidth,
          height: container.clientHeight,
        });
        // Resize zone canvas to match
        resizeZoneCanvas();
      });
    }

    // Fetch historical data from Binance (try Futures first, fallback to Spot)
    async function fetchKlines() {
      let data = null;
      let useFutures = true;

      // Add cache-busting to ensure fresh data
      const cacheBuster = Date.now() + '_' + Math.random().toString(36).substr(2, 9);

      console.log('Fetching klines for', SYMBOL, 'interval:', INTERVAL);

      try {
        // Try Futures API first (use _cb for cache busting, not timestamp)
        const futuresUrl = 'https://fapi.binance.com/fapi/v1/klines?symbol=' + SYMBOL + '&interval=' + INTERVAL + '&limit=1500&_cb=' + cacheBuster;
        console.log('Fetching Futures:', futuresUrl);
        const futuresResponse = await fetch(futuresUrl, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
          }
        });
        const futuresData = await futuresResponse.json();

        if (Array.isArray(futuresData) && futuresData.length > 0) {
          data = futuresData;
          console.log('Fetched', futuresData.length, 'candles from Futures API');
          console.log('First candle time:', new Date(futuresData[0][0]).toISOString());
          console.log('Last candle time:', new Date(futuresData[futuresData.length-1][0]).toISOString());
        } else {
          console.log('Futures returned invalid data:', futuresData);
          throw new Error('No futures data');
        }
      } catch (futuresError) {
        console.log('Futures API failed:', futuresError.message, '- trying Spot...');
        useFutures = false;

        try {
          // Fallback to Spot API
          const spotUrl = 'https://api.binance.com/api/v3/klines?symbol=' + SYMBOL + '&interval=' + INTERVAL + '&limit=1500&_cb=' + cacheBuster;
          console.log('Fetching Spot:', spotUrl);
          const spotResponse = await fetch(spotUrl, {
            cache: 'no-store',
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache'
            }
          });
          const spotData = await spotResponse.json();

          if (Array.isArray(spotData) && spotData.length > 0) {
            data = spotData;
            console.log('Fetched', spotData.length, 'candles from Spot API');
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

        // Update price format based on actual data
        if (candles.length > 0) {
          const lastPrice = candles[candles.length - 1].close;
          const { precision: newPrecision, minMove: newMinMove } = calculatePricePrecision(lastPrice);
          candleSeries.applyOptions({
            priceFormat: {
              type: 'price',
              precision: newPrecision,
              minMove: newMinMove,
            },
          });
        }

        candleSeries.setData(candles);
        storeCandleDataForMagnet(candles);  // Store for magnet mode
        if (SHOW_VOLUME && volumeSeries) {
          volumeSeries.setData(volumes);
        }

        // Initialize current live price for PnL calculation
        if (candles.length > 0) {
          currentLivePrice = candles[candles.length - 1].close;
        }

        // Auto-fit chart to show all data with proper margins
        chart.timeScale().fitContent();

        // Small delay then scroll to show recent data with whitespace on right
        setTimeout(() => {
          if (candles.length > 100) {
            const lastBarIndex = candles.length - 1;
            const visibleBars = 100;
            const defaultRightWhitespace = 25; // Default whitespace on right (like in Binance)

            // Use setVisibleLogicalRange to include whitespace
            chart.timeScale().setVisibleLogicalRange({
              from: lastBarIndex - visibleBars + 1,
              to: lastBarIndex + defaultRightWhitespace
            });

            console.log('Initial chart setup: rightWhitespace =', defaultRightWhitespace);
          }

          // ✅ Canvas-based zones auto-update via requestAnimationFrame loop
          // No manual repositioning needed - zones will redraw on next frame
          if (activeZones && activeZones.length > 0) {
            console.log('[Chart] ✅ Zones will auto-update on canvas (', activeZones.length, 'zones)');
          }
        }, 100);

        document.getElementById('loading').style.display = 'none';

        // Signal to React Native that chart is ready
        window.ReactNativeWebView?.postMessage(JSON.stringify({
          type: 'chart_ready',
          symbol: SYMBOL,
          candles: candles.length
        }));

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
            const closePrice = parseFloat(k.c);
            const candle = {
              time: k.t / 1000,
              open: parseFloat(k.o),
              high: parseFloat(k.h),
              low: parseFloat(k.l),
              close: closePrice,
            };
            candleSeries.update(candle);

            if (SHOW_VOLUME && volumeSeries) {
              volumeSeries.update({
                time: k.t / 1000,
                value: parseFloat(k.v),
                color: closePrice >= parseFloat(k.o) ? 'rgba(34, 197, 94, 0.5)' : 'rgba(239, 68, 68, 0.5)',
              });
            }

            // Real-time PnL update with live price
            updatePnlOverlays(closePrice);

            // ✅ Emit price to React Native for P&L sync
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'price_update',
                price: closePrice,
                symbol: SYMBOL
              }));
            }
          }
        } catch (e) {
          console.error('WS parse error:', e);
        }
      };

      ws.onerror = (error) => {
        console.error('WS error:', error);
      };

      ws.onopen = () => {
        console.log('WebSocket connected:', wsUrl);
      };

      ws.onclose = () => {
        console.log('WebSocket closed, reconnecting...');
        // Reconnect after 3 seconds
        setTimeout(() => connectWebSocket(currentUseFutures), 3000);
      };
    }

    // Change timeframe without reloading (called from React Native)
    let currentInterval = INTERVAL;
    let savedPositionData = null; // Store position globally for restoration

    // Helper to send debug logs to React Native
    function debugLog(message, data) {
      console.log(message, data);
      window.ReactNativeWebView?.postMessage(JSON.stringify({
        type: 'debug_log',
        message: message,
        data: data
      }));
    }

    window.changeTimeframe = function(newInterval) {
      if (newInterval === currentInterval) return;

      debugLog('=== CHANGING TIMEFRAME ===', { from: currentInterval, to: newInterval });

      // Save position data using multiple methods for reliability
      savedPositionData = {
        centerTime: 0,
        visibleBars: 100,
        isViewingLatest: true
      };

      // Method 1: Get visible time range
      const visibleRange = chart.timeScale().getVisibleRange();
      debugLog('visibleRange', visibleRange);

      // Method 2: Get logical range (bar indices)
      const logicalRange = chart.timeScale().getVisibleLogicalRange();
      debugLog('logicalRange', logicalRange);

      // Check if we have candle data
      debugLog('lastCandleData.length', lastCandleData.length);

      if (visibleRange && visibleRange.from && visibleRange.to) {
        // Calculate center time
        savedPositionData.centerTime = Math.floor((visibleRange.from + visibleRange.to) / 2);
        debugLog('centerTime saved', { time: savedPositionData.centerTime, date: new Date(savedPositionData.centerTime * 1000).toISOString() });
      }

      if (logicalRange) {
        savedPositionData.visibleBars = Math.round(logicalRange.to - logicalRange.from);

        const totalBars = lastCandleData.length;
        const lastBarIndex = totalBars - 1;

        // IMPORTANT: Save the whitespace on the right (how many "bar widths" between last candle and right edge)
        // This preserves the visual position of the latest candle
        savedPositionData.rightWhitespace = Math.max(0, logicalRange.to - lastBarIndex);

        // Also save the position of the last candle relative to the visible range
        // (0 = last candle at left edge, 1 = last candle at right edge)
        const lastCandlePosition = (lastBarIndex - logicalRange.from) / (logicalRange.to - logicalRange.from);
        savedPositionData.lastCandlePosition = lastCandlePosition;

        debugLog('position info', {
          visibleBars: savedPositionData.visibleBars,
          totalBars,
          rightWhitespace: savedPositionData.rightWhitespace.toFixed(1),
          lastCandlePosition: savedPositionData.lastCandlePosition.toFixed(2)
        });
      }

      // If we have candle data, also save the center candle's time directly
      if (lastCandleData.length > 0 && logicalRange) {
        const centerBarIndex = Math.floor((logicalRange.from + logicalRange.to) / 2);
        const clampedIndex = Math.max(0, Math.min(lastCandleData.length - 1, Math.round(centerBarIndex)));
        savedPositionData.centerCandleTime = lastCandleData[clampedIndex].time;
        debugLog('centerCandleTime saved', { index: clampedIndex, time: savedPositionData.centerCandleTime, date: new Date(savedPositionData.centerCandleTime * 1000).toISOString() });
      }

      debugLog('Final savedPositionData', savedPositionData);

      // Close existing WebSocket
      if (ws) {
        ws.onclose = null;
        ws.close();
        ws = null;
      }

      // Update interval
      currentInterval = newInterval;

      // Show loading indicator
      const loadingEl = document.getElementById('loading');
      if (loadingEl) {
        loadingEl.style.display = 'flex';
        loadingEl.innerHTML = '<div class="loading-spinner"></div><div>Đang tải...</div>';
      }

      // Fetch new data
      fetchNewTimeframeData(newInterval);
    };

    async function fetchNewTimeframeData(interval) {
      let data = null;
      let useFutures = currentUseFutures;

      // Add timestamp to prevent caching
      const cacheBuster = Date.now() + '_' + Math.random().toString(36).substr(2, 9);

      debugLog('=== FETCHING NEW DATA ===', { interval, savedPositionData });

      try {
        // Use _cb (cache buster) instead of timestamp to avoid Binance API confusion
        const futuresUrl = 'https://fapi.binance.com/fapi/v1/klines?symbol=' + SYMBOL + '&interval=' + interval + '&limit=1500&_cb=' + cacheBuster;
        debugLog('Fetching Futures', { url: futuresUrl });
        const futuresResponse = await fetch(futuresUrl, {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
        });
        const futuresData = await futuresResponse.json();

        if (Array.isArray(futuresData) && futuresData.length > 0) {
          data = futuresData;
          useFutures = true;
          debugLog('Fetched candles from Futures', { count: futuresData.length });
        } else {
          debugLog('Futures returned invalid data', { response: futuresData });
          throw new Error('No futures data');
        }
      } catch (futuresError) {
        debugLog('Futures failed', { error: futuresError.message });
        useFutures = false;

        try {
          // Fallback to Spot API
          const spotUrl = 'https://api.binance.com/api/v3/klines?symbol=' + SYMBOL + '&interval=' + interval + '&limit=1500&_cb=' + cacheBuster;
          debugLog('Trying Spot fallback', { url: spotUrl });
          const spotResponse = await fetch(spotUrl, {
            cache: 'no-store',
            headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
          });
          const spotData = await spotResponse.json();

          if (Array.isArray(spotData) && spotData.length > 0) {
            data = spotData;
            debugLog('Fetched candles from Spot (fallback)', { count: spotData.length });
          } else {
            debugLog('Spot returned no data', spotData);
          }
        } catch (spotError) {
          debugLog('Both APIs failed', { error: spotError.message });
          document.getElementById('loading').style.display = 'none';
          return;
        }
      }

      if (!data) {
        debugLog('No data to display', null);
        document.getElementById('loading').style.display = 'none';
        return;
      }

      debugLog('Processing candles', { count: data.length });

      // Process data
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

      // Update price format
      if (candles.length > 0) {
        const lastPrice = candles[candles.length - 1].close;
        const { precision: newPrecision, minMove: newMinMove } = calculatePricePrecision(lastPrice);
        candleSeries.applyOptions({
          priceFormat: { type: 'price', precision: newPrecision, minMove: newMinMove },
        });
      }

      // Update chart data
      candleSeries.setData(candles);
      storeCandleDataForMagnet(candles);

      if (SHOW_VOLUME && volumeSeries) {
        volumeSeries.setData(volumes);
      }

      if (candles.length > 0) {
        currentLivePrice = candles[candles.length - 1].close;
      }

      // Disable auto-scroll to right when restoring position
      chart.timeScale().applyOptions({
        shiftVisibleRangeOnNewBar: false,
      });

      // Small delay to ensure chart has processed new data
      await new Promise(resolve => setTimeout(resolve, 50));

      // === RESTORE POSITION ===
      try {
      const totalBars = candles.length;
      const oldestTime = candles[0].time;
      const latestTime = candles[totalBars - 1].time;

      debugLog('=== RESTORING POSITION ===', {
        totalBars,
        oldestTime: new Date(oldestTime * 1000).toISOString(),
        latestTime: new Date(latestTime * 1000).toISOString()
      });

      // Get target time from saved data - prefer centerCandleTime if available
      let targetTime = 0;
      if (savedPositionData) {
        targetTime = savedPositionData.centerCandleTime || savedPositionData.centerTime || 0;
        debugLog('Restore target', {
          targetTime: targetTime ? new Date(targetTime * 1000).toISOString() : 'none',
          savedPositionData
        });
      } else {
        debugLog('No savedPositionData!', null);
      }

      const visibleBars = Math.min(savedPositionData?.visibleBars || 100, totalBars);
      const rightWhitespace = savedPositionData?.rightWhitespace || 0;
      const lastCandlePosition = savedPositionData?.lastCandlePosition || 1;

      debugLog('Restore params', { visibleBars, rightWhitespace: rightWhitespace.toFixed(1), lastCandlePosition: lastCandlePosition.toFixed(2) });

      // NEW APPROACH: Preserve the visual position of the latest candle
      // Instead of centering on a time, we position based on where the last candle was on screen
      if (savedPositionData && rightWhitespace >= 0) {
        // Calculate the logical range that preserves the last candle's position
        const lastBarIndex = totalBars - 1;

        // The end of the logical range should be: lastBarIndex + rightWhitespace
        const logicalEnd = lastBarIndex + rightWhitespace;
        const logicalStart = logicalEnd - visibleBars;

        debugLog('DECISION: Preserving last candle position', {
          lastBarIndex,
          logicalStart: logicalStart.toFixed(1),
          logicalEnd: logicalEnd.toFixed(1)
        });

        // Convert logical range to time range
        // For the start, we need to find the candle at that logical index (or clamp to 0)
        const startIndex = Math.max(0, Math.floor(logicalStart));
        // For the end time, we use the last candle's time (the whitespace is handled by the chart)
        const endIndex = Math.min(totalBars - 1, Math.ceil(logicalEnd));

        // Set the visible logical range directly (this preserves whitespace)
        chart.timeScale().setVisibleLogicalRange({
          from: logicalStart,
          to: logicalEnd
        });

        debugLog('Set logical range', {
          from: logicalStart.toFixed(1),
          to: logicalEnd.toFixed(1),
          visibleBars,
          rightWhitespace: rightWhitespace.toFixed(1)
        });

        // Verify the range was set correctly
        setTimeout(() => {
          const actualLogical = chart.timeScale().getVisibleLogicalRange();
          const actualTime = chart.timeScale().getVisibleRange();
          debugLog('Range after 100ms', {
            logicalFrom: actualLogical?.from?.toFixed(1),
            logicalTo: actualLogical?.to?.toFixed(1),
            timeFrom: actualTime ? new Date(actualTime.from * 1000).toISOString() : 'null',
            timeTo: actualTime ? new Date(actualTime.to * 1000).toISOString() : 'null'
          });
        }, 100);
      }
      // Target time is before our data range - show oldest data
      else if (targetTime > 0 && targetTime < oldestTime) {
        debugLog('DECISION: Target time older than data -> showing oldest', null);
        chart.timeScale().setVisibleRange({
          from: candles[0].time,
          to: candles[Math.min(visibleBars - 1, totalBars - 1)].time,
        });
      }
      // Fallback: show latest
      else {
        debugLog('DECISION: Fallback -> showing latest candles', { targetTime, oldestTime, latestTime });
        if (totalBars > 100) {
          chart.timeScale().setVisibleRange({
            from: candles[totalBars - 100].time,
            to: candles[totalBars - 1].time,
          });
        } else {
          chart.timeScale().fitContent();
        }
      }

        debugLog('Position restore complete', null);
      } catch (restoreError) {
        debugLog('ERROR restoring position', { error: restoreError.message, stack: restoreError.stack });
        // Fallback: just fit content
        chart.timeScale().fitContent();
      }

      debugLog('=== TIMEFRAME CHANGE COMPLETE ===', { interval });

      // 🔴 CRITICAL: Reposition zones after timeframe change
      if (typeof updateAllZonePositions === 'function') {
        console.log('[Chart] Repositioning zones after timeframe change');
        setTimeout(() => updateAllZonePositions(), 50);
      }

      // Hide loading
      document.getElementById('loading').style.display = 'none';

      // Clear saved position data
      savedPositionData = null;

      // Reconnect WebSocket
      currentUseFutures = useFutures;
      connectWebSocketForInterval(interval, useFutures);

      // Update PnL
      if (currentLivePrice > 0) {
        updatePnlOverlays(currentLivePrice);
      }

      // Notify React Native
      window.ReactNativeWebView?.postMessage(JSON.stringify({
        type: 'timeframe_changed',
        interval: interval,
        candles: candles.length
      }));
    }

    function connectWebSocketForInterval(interval, useFutures) {
      if (ws) {
        ws.onclose = null;
        ws.close();
      }

      const wsBase = useFutures ? 'wss://fstream.binance.com/ws/' : 'wss://stream.binance.com:9443/ws/';
      const wsUrl = wsBase + SYMBOL.toLowerCase() + '@kline_' + interval;
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('WebSocket reconnected for interval:', interval);
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.k) {
            const k = msg.k;
            const closePrice = parseFloat(k.c);
            const candle = {
              time: k.t / 1000,
              open: parseFloat(k.o),
              high: parseFloat(k.h),
              low: parseFloat(k.l),
              close: closePrice,
            };
            candleSeries.update(candle);

            if (SHOW_VOLUME && volumeSeries) {
              volumeSeries.update({
                time: k.t / 1000,
                value: parseFloat(k.v),
                color: closePrice >= parseFloat(k.o) ? 'rgba(34, 197, 94, 0.5)' : 'rgba(239, 68, 68, 0.5)',
              });
            }

            // Real-time PnL update
            updatePnlOverlays(closePrice);

            // ✅ Emit price to React Native for P&L sync
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'price_update',
                price: closePrice,
                symbol: SYMBOL
              }));
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
        console.log('WebSocket closed');
        setTimeout(() => connectWebSocketForInterval(interval, useFutures), 3000);
      };
    }

    // ==========================================
    // DRAWING TOOLS FUNCTIONALITY
    // ==========================================

    let currentDrawingMode = null;
    let drawingPriceLines = [];  // Store drawing price lines
    let pendingDrawing = null;   // Store pending multi-click drawing
    let loadedDrawings = [];     // Store loaded drawings data
    let magnetModeEnabled = true;
    let lastCandleData = [];     // Store candle data for magnet mode
    let currentDrawingColor = '${selectedColor}';  // Current drawing color
    let currentLineStyle = '${selectedLineStyle}'; // Current line style (solid, dashed, dotted)

    // Fibonacci levels
    const FIBONACCI_LEVELS = [
      { value: 0, label: '0%', color: '#787B86' },
      { value: 0.236, label: '23.6%', color: '#F7525F' },
      { value: 0.382, label: '38.2%', color: '#FF9800' },
      { value: 0.5, label: '50%', color: '#4CAF50' },
      { value: 0.618, label: '61.8%', color: '#2196F3' },
      { value: 0.786, label: '78.6%', color: '#9C27B0' },
      { value: 1, label: '100%', color: '#787B86' },
    ];

    // Set drawing mode from React Native
    window.setDrawingMode = function(mode) {
      currentDrawingMode = mode;
      pendingDrawing = null;
      // Notify React Native about mode change
      window.ReactNativeWebView?.postMessage(JSON.stringify({
        type: 'drawing_pending',
        points: 0,
        tempData: null
      }));
    };

    // Load drawings from React Native
    window.loadDrawings = function(drawings) {
      loadedDrawings = drawings;
      // Clear existing drawing lines
      clearAllDrawingLines();
      // Render each drawing
      drawings.forEach(d => renderDrawing(d));
    };

    // Clear all drawing lines
    window.clearAllDrawings = function() {
      clearAllDrawingLines();
      loadedDrawings = [];
    };

    // Set drawing color from React Native
    window.setDrawingColor = function(color) {
      currentDrawingColor = color;
    };

    // Set line style from React Native
    window.setDrawingLineStyle = function(style) {
      currentLineStyle = style;
    };

    // Remove single drawing by ID
    window.removeDrawing = function(drawingId) {
      // Remove from loadedDrawings
      loadedDrawings = loadedDrawings.filter(d => d.id !== drawingId);
      // Remove price lines with this drawing ID
      const toRemove = drawingPriceLines.filter(line => line._drawingId === drawingId);
      toRemove.forEach(line => {
        try {
          candleSeries.removePriceLine(line);
        } catch (e) {}
      });
      drawingPriceLines = drawingPriceLines.filter(line => line._drawingId !== drawingId);
    };

    // Update drawing (e.g., color change)
    window.updateDrawing = function(drawingId, updates) {
      // Find drawing in loaded drawings
      const drawingIndex = loadedDrawings.findIndex(d => d.id === drawingId);
      if (drawingIndex === -1) return;

      // Update local data
      loadedDrawings[drawingIndex] = { ...loadedDrawings[drawingIndex], ...updates };

      // Re-render the drawing
      // First remove old lines
      const toRemove = drawingPriceLines.filter(line => line._drawingId === drawingId);
      toRemove.forEach(line => {
        try {
          candleSeries.removePriceLine(line);
        } catch (e) {}
      });
      drawingPriceLines = drawingPriceLines.filter(line => line._drawingId !== drawingId);

      // Re-render with new data
      renderDrawing(loadedDrawings[drawingIndex]);
    };

    // Get line style value for lightweight-charts
    function getLineStyleValue(style) {
      switch (style) {
        case 'dashed': return LightweightCharts.LineStyle.Dashed;
        case 'dotted': return LightweightCharts.LineStyle.Dotted;
        default: return LightweightCharts.LineStyle.Solid;
      }
    }

    function clearAllDrawingLines() {
      drawingPriceLines.forEach(line => {
        try {
          candleSeries.removePriceLine(line);
        } catch (e) {}
      });
      drawingPriceLines = [];
    }

    // ==========================================
    // ORDER LINES FUNCTIONALITY (Binance-style)
    // With Real-time PnL Overlay
    // ==========================================
    let orderLinesPriceLines = [];  // Store order price lines
    let positionsData = [];  // Store position data for real-time PnL calculation
    let currentLivePrice = 0;  // Current live price from WebSocket
    let pnlOverlayContainer = null;  // Container for PnL overlays

    // Create PnL overlay container
    function createPnlOverlayContainer() {
      if (pnlOverlayContainer) return;
      pnlOverlayContainer = document.createElement('div');
      pnlOverlayContainer.id = 'pnl-overlay-container';
      pnlOverlayContainer.style.cssText = 'position:absolute;top:0;left:0;right:0;bottom:0;pointer-events:none;z-index:100;';
      document.getElementById('chart-container').appendChild(pnlOverlayContainer);
    }

    // Format price with Vietnamese format (dot for thousands, comma for decimals)
    function formatPnlPrice(value) {
      const absValue = Math.abs(value);
      let formatted;
      if (absValue >= 1000) {
        // Vietnamese format: dot for thousands, comma for decimals
        const fixed = absValue.toFixed(2);
        const parts = fixed.split('.');
        parts[0] = parts[0].replace(/\\B(?=(\\d{3})+(?!\\d))/g, '.');
        formatted = parts.join(',');
      } else if (absValue >= 1) {
        formatted = absValue.toFixed(2).replace('.', ',');
      } else {
        formatted = absValue.toFixed(4).replace('.', ',');
      }
      return formatted;
    }

    // Calculate PnL for a position
    function calculatePositionPnL(position, currentPrice) {
      if (!position || !currentPrice || !position.entryPrice) return { pnl: 0, pnlPercent: 0 };

      const entryPrice = parseFloat(position.entryPrice);
      const quantity = parseFloat(position.quantity) || 0;
      const leverage = parseFloat(position.leverage) || 1;
      const isLong = position.direction === 'LONG';

      // Calculate PnL
      const priceDiff = isLong ? (currentPrice - entryPrice) : (entryPrice - currentPrice);
      const pnl = priceDiff * quantity;

      // Calculate PnL percent with leverage
      const pnlPercent = ((priceDiff / entryPrice) * leverage * 100);

      return { pnl, pnlPercent };
    }

    // Update PnL overlays with current price
    function updatePnlOverlays(price) {
      if (!pnlOverlayContainer || !chart || positionsData.length === 0) return;

      currentLivePrice = price;

      positionsData.forEach(position => {
        const overlayId = 'pnl-' + position.id;
        let overlay = document.getElementById(overlayId);

        let pnlValue, priceCoord;

        if (position.type === 'entry') {
          // Real-time PnL for entry line
          const { pnl } = calculatePositionPnL(position, price);
          pnlValue = pnl;
          priceCoord = position.entryPrice;
        } else if (position.type === 'take_profit' || position.type === 'stop_loss') {
          // Static expected PnL for TP/SL
          pnlValue = position.expectedPnl;
          priceCoord = position.price;
        } else {
          return;
        }

        const isProfit = pnlValue >= 0;

        // Get Y coordinate
        const y = candleSeries.priceToCoordinate(priceCoord);
        if (y === null) return;

        // Format PnL text - only Entry has PNL prefix
        const pnlSign = isProfit ? '+' : '-';
        const pnlPrefix = position.type === 'entry' ? 'PNL ' : '';
        const pnlText = pnlPrefix + pnlSign + '$' + formatPnlPrice(Math.abs(pnlValue));

        if (!overlay) {
          // Create new overlay - NO background, just colored text
          overlay = document.createElement('div');
          overlay.id = overlayId;
          overlay.style.cssText = 'position:absolute;left:8px;font-size:11px;font-weight:700;white-space:nowrap;text-shadow:0 0 3px rgba(0,0,0,0.8),0 0 6px rgba(0,0,0,0.5);transform:translateY(-100%);';
          pnlOverlayContainer.appendChild(overlay);
        }

        // Update position (above the line) and content - only text color, no background
        overlay.style.top = (y - 2) + 'px';
        overlay.style.color = isProfit ? '#22C55E' : '#EF4444';
        overlay.textContent = pnlText;
      });
    }

    // Remove all PnL overlays
    function clearPnlOverlays() {
      if (pnlOverlayContainer) {
        pnlOverlayContainer.innerHTML = '';
      }
    }

    // Update order lines from React Native
    window.updateOrderLines = function(lines) {
      // Create overlay container if not exists
      createPnlOverlayContainer();

      // Clear existing order lines and overlays
      orderLinesPriceLines.forEach(line => {
        try {
          candleSeries.removePriceLine(line);
        } catch (e) {}
      });
      orderLinesPriceLines = [];
      clearPnlOverlays();
      positionsData = [];

      // Sort lines by price to detect overlapping labels
      const sortedLines = [...lines].sort((a, b) => a.price - b.price);

      // Track which prices already have visible axis labels
      const visibleLabelPrices = [];
      const OVERLAP_THRESHOLD = 0.015; // 1.5% - labels closer than this will overlap

      // Check if a price would overlap with existing visible labels
      function wouldOverlap(price) {
        return visibleLabelPrices.some(existingPrice => {
          const diff = Math.abs((price - existingPrice) / existingPrice);
          return diff < OVERLAP_THRESHOLD;
        });
      }

      // Render each order line
      sortedLines.forEach(lineData => {
        try {
          const lineStyle = lineData.lineStyle === 2
            ? LightweightCharts.LineStyle.Dotted
            : lineData.lineStyle === 1
              ? LightweightCharts.LineStyle.Dashed
              : LightweightCharts.LineStyle.Solid;

          // Just show label, PnL will be in overlay for all line types
          let title = lineData.label || '';

          // Hide axis label if too close to another line's label to prevent overlap
          // Entry lines get priority for axis labels
          const isEntryLine = lineData.type === 'entry' || lineData.type === 'pending_entry';
          const shouldShowAxisLabel = isEntryLine || !wouldOverlap(lineData.price);

          if (shouldShowAxisLabel) {
            visibleLabelPrices.push(lineData.price);
          }

          const priceLine = candleSeries.createPriceLine({
            price: lineData.price,
            color: lineData.color,
            lineWidth: 2,
            lineStyle: lineStyle,
            axisLabelVisible: shouldShowAxisLabel,
            title: title, // Always show title (on the line itself)
          });
          priceLine._orderLineId = lineData.id;
          priceLine._orderLineType = lineData.type;
          orderLinesPriceLines.push(priceLine);

          // Store position data for PnL overlay
          if (lineData.type === 'entry') {
            positionsData.push({
              id: lineData.id,
              type: 'entry',
              entryPrice: lineData.price,
              quantity: lineData.quantity || 0,
              direction: lineData.direction,
              leverage: lineData.leverage || 1,
              positionId: lineData.positionId,
            });
          } else if ((lineData.type === 'take_profit' || lineData.type === 'stop_loss') && lineData.expectedPnl !== undefined) {
            // Store TP/SL data for static PnL overlay
            positionsData.push({
              id: lineData.id,
              type: lineData.type,
              price: lineData.price,
              expectedPnl: lineData.expectedPnl,
            });
          }
        } catch (e) {
          console.error('Error creating order line:', e);
        }
      });

      // Initial PnL update with current price
      if (currentLivePrice > 0) {
        updatePnlOverlays(currentLivePrice);
      }
    };

    // Clear all order lines
    window.clearOrderLines = function() {
      orderLinesPriceLines.forEach(line => {
        try {
          candleSeries.removePriceLine(line);
        } catch (e) {}
      });
      orderLinesPriceLines = [];
      clearPnlOverlays();
      positionsData = [];
    };

    // Subscribe to chart scale changes to update PnL overlay positions
    function setupPnlOverlayPositionUpdates() {
      if (!chart) return;

      // Update overlay positions when price scale changes (zoom/scroll)
      chart.subscribeCrosshairMove(() => {
        if (currentLivePrice > 0 && positionsData.length > 0) {
          // Debounce position updates
          requestAnimationFrame(() => updatePnlOverlayPositions());
        }
      });

      // Also update on visible range changes
      chart.timeScale().subscribeVisibleLogicalRangeChange(() => {
        if (currentLivePrice > 0 && positionsData.length > 0) {
          requestAnimationFrame(() => updatePnlOverlayPositions());
        }
      });
    }

    // Update only positions (not PnL values) - for scroll/zoom
    function updatePnlOverlayPositions() {
      if (!pnlOverlayContainer || !chart || positionsData.length === 0) return;

      positionsData.forEach(position => {
        const overlayId = 'pnl-' + position.id;
        const overlay = document.getElementById(overlayId);
        if (!overlay) return;

        // Get price coordinate based on type
        let priceCoord;
        if (position.type === 'entry') {
          priceCoord = position.entryPrice;
        } else if (position.type === 'take_profit' || position.type === 'stop_loss') {
          priceCoord = position.price;
        } else {
          return;
        }

        const y = candleSeries.priceToCoordinate(priceCoord);
        if (y === null) {
          overlay.style.display = 'none';
        } else {
          overlay.style.display = 'block';
          overlay.style.top = (y - 2) + 'px';
        }
      });
    }

    // ==========================================
    // PATTERN LINES FUNCTIONALITY (Scan Results)
    // Distinct from Order Lines with smart filtering
    // ==========================================
    let patternPriceLines = [];  // Store pattern price lines
    let currentOrderLinesData = [];  // Store current order lines for comparison

    // Check if a price is close to any order line (within threshold %)
    function isPriceCloseToOrderLine(price, threshold = 0.5) {
      if (!price || currentOrderLinesData.length === 0) return false;
      return currentOrderLinesData.some(orderLine => {
        const diff = Math.abs((orderLine.price - price) / price) * 100;
        return diff <= threshold;
      });
    }

    // Update pattern lines from React Native (with smart filtering)
    // NOTE: If zones are enabled (TIER1+), labels hidden - use tap-to-select on canvas zones
    //       If zones NOT enabled (FREE), show labels on price lines
    window.updatePatternLines = function(patternData, orderLinesData, zonesEnabled) {
      // Store order lines for comparison
      currentOrderLinesData = orderLinesData || [];

      // Clear existing pattern lines
      patternPriceLines.forEach(line => {
        try {
          candleSeries.removePriceLine(line);
        } catch (e) {}
      });
      patternPriceLines = [];

      if (!patternData) return;

      const { entry, tp, sl, direction } = patternData;

      // Track visible label prices to prevent overlap
      const visiblePatternPrices = [];
      const PATTERN_OVERLAP_THRESHOLD = 0.015; // 1.5%

      function wouldPatternLabelOverlap(price) {
        // Check against order lines
        if (isPriceCloseToOrderLine(price, 1.5)) return true;
        // Check against other pattern lines
        return visiblePatternPrices.some(existingPrice => {
          const diff = Math.abs((price - existingPrice) / existingPrice);
          return diff < PATTERN_OVERLAP_THRESHOLD;
        });
      }

      // =====================================================
      // ZONES DISABLED (FREE tier): Show full labels on price lines
      // ZONES ENABLED (TIER1+): No labels, use tap-to-select on canvas
      // =====================================================
      const showLabels = !zonesEnabled; // FREE tier shows labels

      // Pattern Entry line
      if (entry > 0 && !isPriceCloseToOrderLine(entry, 0.8)) {
        const showAxisLabel = showLabels && !wouldPatternLabelOverlap(entry);
        if (showAxisLabel) visiblePatternPrices.push(entry);

        const entryLine = candleSeries.createPriceLine({
          price: entry,
          color: showLabels ? '#00F0FF' : 'rgba(0, 240, 255, 0.3)',
          lineWidth: 1,
          lineStyle: LightweightCharts.LineStyle.Dotted,
          axisLabelVisible: showAxisLabel,
          title: showLabels ? 'P-Entry' : '',
        });
        entryLine._patternLine = true;
        patternPriceLines.push(entryLine);
      }

      // Pattern TP line
      if (tp > 0 && !isPriceCloseToOrderLine(tp, 0.8)) {
        const showAxisLabel = showLabels && !wouldPatternLabelOverlap(tp);
        if (showAxisLabel) visiblePatternPrices.push(tp);

        const tpLine = candleSeries.createPriceLine({
          price: tp,
          color: showLabels ? '#22C55E80' : 'rgba(34, 197, 94, 0.3)',
          lineWidth: 1,
          lineStyle: LightweightCharts.LineStyle.Dotted,
          axisLabelVisible: showAxisLabel,
          title: showLabels ? 'P-TP' : '',
        });
        tpLine._patternLine = true;
        patternPriceLines.push(tpLine);
      }

      // Pattern SL line
      if (sl > 0 && !isPriceCloseToOrderLine(sl, 0.8)) {
        const showAxisLabel = showLabels && !wouldPatternLabelOverlap(sl);
        if (showAxisLabel) visiblePatternPrices.push(sl);

        const slLine = candleSeries.createPriceLine({
          price: sl,
          color: showLabels ? '#EF444480' : 'rgba(239, 68, 68, 0.3)',
          lineWidth: 1,
          lineStyle: LightweightCharts.LineStyle.Dotted,
          axisLabelVisible: showAxisLabel,
          title: showLabels ? 'P-SL' : '',
        });
        slLine._patternLine = true;
        patternPriceLines.push(slLine);
      }
    };

    // Clear all pattern lines
    window.clearPatternLines = function() {
      patternPriceLines.forEach(line => {
        try {
          candleSeries.removePriceLine(line);
        } catch (e) {}
      });
      patternPriceLines = [];
    };

    // ==========================================
    // ZONE VISUALIZATION - CANVAS-BASED (STICKY WITH CHART)
    // Zones are drawn on canvas and move with chart pan/scroll
    // ==========================================
    let activeZones = [];        // Store zone data
    let zoneCanvas = null;       // Canvas overlay for zones
    let zoneCtx = null;          // Canvas 2D context
    let zoneAnimationId = null;  // Animation frame ID
    let selectedZoneIndex = null; // TAP-TO-SELECT: Currently selected zone
    let zoneTooltip = null;      // Tooltip element for zone info
    let zoneBounds = [];         // Store zone rectangles for hit detection

    // Create zone canvas overlay
    function createZoneCanvas() {
      if (zoneCanvas) return;

      const chartEl = document.getElementById('chart-container');
      if (!chartEl) return;

      zoneCanvas = document.createElement('canvas');
      zoneCanvas.id = 'zone-canvas';
      // ✅ ALWAYS pointer-events:none - use chart.subscribeClick() for zone selection
      // This ensures chart pan/zoom is NEVER blocked
      zoneCanvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:3;';

      // Get chart dimensions
      const rect = chartEl.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      zoneCanvas.width = rect.width * dpr;
      zoneCanvas.height = rect.height * dpr;
      zoneCanvas.style.width = rect.width + 'px';
      zoneCanvas.style.height = rect.height + 'px';

      zoneCtx = zoneCanvas.getContext('2d');
      zoneCtx.scale(dpr, dpr);

      // ✅ NO touch/click listeners on canvas - using chart.subscribeClick() instead
      // This prevents blocking chart pan/zoom

      chartEl.appendChild(zoneCanvas);
      console.log('[Zone] Canvas created (pointer-events:none, using chart.subscribeClick):', rect.width, 'x', rect.height);
    }

    // ✅ Zone canvas ALWAYS has pointer-events:none - no need to toggle
    function updateZoneCanvasPointerEvents() {
      // Keep pointer-events:none always - zone selection via chart.subscribeClick()
      if (zoneCanvas) {
        zoneCanvas.style.pointerEvents = 'none';
      }
    }

    // ==========================================
    // TAP-TO-SELECT FUNCTIONS
    // ==========================================

    // Find zone at point (x, y are chart-relative coordinates from chart.subscribeClick)
    function findZoneAtPoint(x, y) {
      if (!zoneCanvas || zoneBounds.length === 0) return null;

      // x and y are already chart-relative from chart.subscribeClick(param.point.x, param.point.y)

      // Check each zone's bounds (in reverse order - top zones first)
      for (let i = zoneBounds.length - 1; i >= 0; i--) {
        const bounds = zoneBounds[i];
        if (x >= bounds.left && x <= bounds.right &&
            y >= bounds.top && y <= bounds.bottom) {
          return bounds.index;
        }
      }
      return null;
    }

    // Handle touch tap on zone
    function handleZoneTap(e) {
      try {
        if (!e.touches || e.touches.length === 0) return;
        if (!activeZones || activeZones.length === 0) return; // No zones to select

        const touch = e.touches[0];
        const clickedIndex = findZoneAtPoint(touch.clientX, touch.clientY);

        if (clickedIndex !== null && clickedIndex < activeZones.length) {
          selectedZoneIndex = clickedIndex;
          const zone = activeZones[clickedIndex];
          if (zone) showZoneTooltip(zone, touch.clientX, touch.clientY);
          console.log('[Zone] TAP selected zone:', clickedIndex);

          // ⚠️ ZONE-PATTERN SYNC: Notify React Native of zone selection
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'zone_press',
              zoneId: zone.id || zone.pattern_id,
              zone: zone
            }));
          }
        } else {
          selectedZoneIndex = null;
          hideZoneTooltip();
          console.log('[Zone] TAP deselected');
        }
        // Redraw immediately
        drawZonesOnCanvas();
      } catch (err) {
        console.error('[Zone] handleZoneTap error:', err);
      }
    }

    // Handle click on zone (for web)
    function handleZoneClick(e) {
      try {
        if (!activeZones || activeZones.length === 0) return; // No zones to select

        const clickedIndex = findZoneAtPoint(e.clientX, e.clientY);

        if (clickedIndex !== null && clickedIndex < activeZones.length) {
          selectedZoneIndex = clickedIndex;
          const zone = activeZones[clickedIndex];
          if (zone) showZoneTooltip(zone, e.clientX, e.clientY);
          console.log('[Zone] CLICK selected zone:', clickedIndex);

          // ⚠️ ZONE-PATTERN SYNC: Notify React Native of zone selection
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'zone_press',
              zoneId: zone.id || zone.pattern_id,
              zone: zone
            }));
          }
        } else {
          selectedZoneIndex = null;
          hideZoneTooltip();
          console.log('[Zone] CLICK deselected');
        }
        drawZonesOnCanvas();
      } catch (err) {
        console.error('[Zone] handleZoneClick error:', err);
      }
    }

    // ✅ Tooltip auto-hide timeout reference (MUST be declared before showZoneTooltip)
    let tooltipAutoHideTimeout = null;
    // ✅ Debounce flag to prevent tooltip from being hidden immediately after showing
    let tooltipJustShown = false;
    let tooltipDebounceTimeout = null;

    // ✅ VIETNAMESE TRANSLATIONS for pattern types
    function translatePatternType(type) {
      const translations = {
        'continuation': 'Tiếp diễn',
        'reversal': 'Đảo chiều',
        'DPD': 'DPD (Giảm-Tăng-Giảm)',
        'DPU': 'DPU (Giảm-Tăng-Tăng)',
        'UPD': 'UPD (Tăng-Tăng-Giảm)',
        'UPU': 'UPU (Tăng-Giảm-Tăng)',
        'Double Top': 'Hai Đỉnh',
        'Double Bottom': 'Hai Đáy',
        'Triple Top': 'Ba Đỉnh',
        'Triple Bottom': 'Ba Đáy',
        'Head and Shoulders': 'Vai Đầu Vai',
        'Inverse H&S': 'Vai Đầu Vai Ngược',
        'Inverse Head': 'Vai Đầu Vai Ngược',
        'Cup and Handle': 'Tách và Quai',
        'Cup Handle': 'Tách và Quai',
        'Descending Triangle': 'Tam Giác Giảm',
        'Ascending Triangle': 'Tam Giác Tăng',
        'Symmetrical Triangle': 'Tam Giác Cân',
        'Rising Wedge': 'Rising Wedge',
        'Falling Wedge': 'Falling Wedge',
        'Bull Flag': 'Cờ Tăng',
        'Bear Flag': 'Cờ Giảm',
        'Hammer': 'Nến Búa',
        'Doji': 'Nến Doji',
        'Engulfing': 'Nến Nhấn Chìm',
        'Morning Star': 'Sao Mai',
        'Evening Star': 'Sao Hôm',
        'Bullish': 'Tăng giá',
        'Bearish': 'Giảm giá',
        'Zone': 'Vùng giá',
        'LFZ': 'Vùng Cầu',
        'HFZ': 'Vùng Cung',
      };
      // Check for partial matches
      for (const [key, value] of Object.entries(translations)) {
        if (type && type.toUpperCase().includes(key.toUpperCase())) {
          return value;
        }
      }
      return type || 'Vùng giá';
    }

    // Show tooltip with zone info - ✅ VIETNAMESE VERSION
    function showZoneTooltip(zone, x, y) {
      try {
        hideZoneTooltip(); // Remove existing

        if (!zone) return;

        const chartEl = document.getElementById('chart-container');
        if (!chartEl) return;

        // Get zone data - prioritize pattern_name for actual name display
        const patternName = zone.pattern_name || zone.patternType || zone.pattern_type || 'Zone';
        // Check if it's a category name that needs translation, otherwise use as-is
        const isCategory = ['reversal', 'continuation', 'LFZ', 'HFZ'].includes(patternName.toLowerCase());
        const patternTypeVN = isCategory ? translatePatternType(patternName) : patternName;
        const entryPrice = parseFloat(zone.entry_price || zone.entryPrice || zone.entry || zone.price_level || 0);
        const stopLoss = parseFloat(zone.stop_loss || zone.stopLoss || zone.stop_price || zone.sl || 0);

        // ✅✅✅ CRITICAL FIX: Derive direction from STOP LOSS position vs ENTRY
        // - SL < Entry → LONG (MUA) - SL ở dưới bảo vệ lệnh mua
        // - SL > Entry → SHORT (BÁN) - SL ở trên bảo vệ lệnh bán
        // This is the ONLY correct way - SL position defines trade direction!
        const isShortForCalc = stopLoss > 0 && entryPrice > 0 && stopLoss > entryPrice;
        let direction = isShortForCalc ? 'SHORT' : 'LONG';

        // ✅ Get TP from multiple sources, FALLBACK: calculate if missing
        let takeProfit = parseFloat(zone.take_profit || zone.takeProfit || zone.target_1 || zone.tp || zone.target || zone.targetPrice || 0);

        // ✅ VALIDATE TP direction: For SHORT, TP must be BELOW entry. For LONG, TP must be ABOVE entry.
        const tpOnWrongSide = takeProfit > 0 && (
          (isShortForCalc && takeProfit > entryPrice) ||
          (!isShortForCalc && takeProfit < entryPrice)
        );

        // ✅ CALCULATE TP if missing OR on wrong side (R:R = 1:2 default)
        if ((!takeProfit || takeProfit <= 0 || tpOnWrongSide) && entryPrice > 0 && stopLoss > 0) {
          const risk = Math.abs(entryPrice - stopLoss);
          // Use direction based on entry vs current price
          takeProfit = isShortForCalc ? entryPrice - (risk * 2) : entryPrice + (risk * 2);
        }

        // Calculate R:R
        let rrRatio = '-';
        if (entryPrice > 0 && stopLoss > 0 && takeProfit > 0) {
          const risk = Math.abs(entryPrice - stopLoss);
          const reward = Math.abs(takeProfit - entryPrice);
          if (risk > 0) {
            rrRatio = (reward / risk).toFixed(1);
          }
        }

        // ✅ Format prices VIETNAMESE: 95.880,50 (chấm ngăn nghìn, phẩy decimal)
        function formatPriceVN(price) {
          if (!price && price !== 0) return '-';
          const num = parseFloat(price);
          if (isNaN(num)) return '-';

          // Số nhỏ < 1: 0,2716
          if (Math.abs(num) < 1) {
            return num.toFixed(4).replace('.', ',');
          }

          // Số lớn: 95.880,50
          const fixed = num.toFixed(2);
          const [integer, decimal] = fixed.split('.');
          const intFormatted = integer.replace(/\\B(?=(\\d{3})+(?!\\d))/g, '.');
          return intFormatted + ',' + decimal;
        }
        const formatPrice = formatPriceVN;

        // Create tooltip element
        zoneTooltip = document.createElement('div');
        zoneTooltip.id = 'zone-tooltip';

        // Use the direction already calculated from entry vs current price
        const isShort = direction === 'SHORT';
        const dirColor = isShort ? '#dc3545' : '#0ecb81';
        // ✅ VIETNAMESE direction labels
        const dirLabelVN = isShort ? 'BÁN' : 'MUA';

        zoneTooltip.style.cssText = \`
          position: absolute;
          background: rgba(17, 34, 80, 0.95);
          border: 1px solid rgba(255,255,255,0.3);
          border-radius: 8px;
          padding: 10px;
          font-size: 11px;
          color: #ffffff;
          z-index: 100;
          pointer-events: none;
          box-shadow: 0 4px 12px rgba(0,0,0,0.5);
          min-width: 160px;
        \`;

        // ✅ CLEAN DESIGN: Mostly white text, only SL red and TP green
        zoneTooltip.innerHTML = \`
          <div style="font-weight:bold;margin-bottom:6px;color:#fff;font-size:13px">\${patternTypeVN}</div>
          <div style="display:flex;justify-content:space-between;margin-bottom:4px">
            <span style="color:#aaa">Hướng:</span>
            <span style="color:\${dirColor};font-weight:bold">\${dirLabelVN}</span>
          </div>
          <div style="display:flex;justify-content:space-between;margin-bottom:4px">
            <span style="color:#fff">Điểm vào:</span>
            <span style="color:#fff">\${formatPrice(entryPrice)}</span>
          </div>
          <div style="display:flex;justify-content:space-between;margin-bottom:4px">
            <span style="color:#dc3545">Cắt lỗ:</span>
            <span style="color:#dc3545">\${formatPrice(stopLoss)}</span>
          </div>
          <div style="display:flex;justify-content:space-between;margin-bottom:4px">
            <span style="color:#0ecb81">Chốt lời:</span>
            <span style="color:#0ecb81">\${formatPrice(takeProfit)}</span>
          </div>
          <div style="display:flex;justify-content:space-between;border-top:1px solid #444;padding-top:6px;margin-top:6px">
            <span style="color:#aaa">Tỷ lệ R:R:</span>
            <span style="color:#fff;font-weight:bold">1:\${rrRatio}</span>
          </div>
        \`;

        // ✅ Position tooltip at TOP LEFT corner of chart - never overlaps zones
        // Fixed position: top-left corner, away from price action
        const tooltipX = 10;
        const tooltipY = 10;

        zoneTooltip.style.left = tooltipX + 'px';
        zoneTooltip.style.top = tooltipY + 'px';

        chartEl.appendChild(zoneTooltip);

        // ✅ Set debounce flag to prevent immediate hide from double-tap/click
        tooltipJustShown = true;
        if (tooltipDebounceTimeout) clearTimeout(tooltipDebounceTimeout);
        tooltipDebounceTimeout = setTimeout(() => {
          tooltipJustShown = false;
        }, 4500); // 4500ms debounce window - prevents tooltip from disappearing too quickly

        // ⚠️ AUTO-HIDE after 5 seconds
        if (tooltipAutoHideTimeout) {
          clearTimeout(tooltipAutoHideTimeout);
        }
        tooltipAutoHideTimeout = setTimeout(() => {
          hideZoneTooltip(true); // Force hide after timeout
        }, 5000); // 5 seconds

        console.log('[Zone] Tooltip shown, will auto-hide in 5s');

      } catch (err) {
        console.error('[Zone] showZoneTooltip error:', err);
      }
    }

    // Hide tooltip
    // @param {boolean} force - Force hide even if just shown (for auto-hide timeout)
    function hideZoneTooltip(force = false) {
      try {
        // ✅ DEBOUNCE: Don't hide if tooltip was just shown (prevents double-tap issue)
        if (!force && tooltipJustShown) {
          console.log('[Zone] Ignoring hide - tooltip just shown (debounce)');
          return;
        }

        // Clear any pending auto-hide timeout
        if (tooltipAutoHideTimeout) {
          clearTimeout(tooltipAutoHideTimeout);
          tooltipAutoHideTimeout = null;
        }
        // Clear debounce timeout
        if (tooltipDebounceTimeout) {
          clearTimeout(tooltipDebounceTimeout);
          tooltipDebounceTimeout = null;
        }
        tooltipJustShown = false;

        if (zoneTooltip && zoneTooltip.parentNode) {
          zoneTooltip.parentNode.removeChild(zoneTooltip);
        }
        zoneTooltip = null;
      } catch (err) {
        console.error('[Zone] hideZoneTooltip error:', err);
        zoneTooltip = null;
      }
    }

    // Resize zone canvas when chart resizes
    function resizeZoneCanvas() {
      if (!zoneCanvas) return;

      const chartEl = document.getElementById('chart-container');
      if (!chartEl) return;

      const rect = chartEl.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      zoneCanvas.width = rect.width * dpr;
      zoneCanvas.height = rect.height * dpr;
      zoneCanvas.style.width = rect.width + 'px';
      zoneCanvas.style.height = rect.height + 'px';

      zoneCtx = zoneCanvas.getContext('2d');
      zoneCtx.scale(dpr, dpr);
    }

    // Draw all zones on canvas - called every frame
    // ✅ SWIFT ALGO STYLE: Darker colors, labels always visible, cyan entry line
    function drawZonesOnCanvas() {
      if (!zoneCanvas || !zoneCtx || !chart || !candleSeries) {
        // Only log once to avoid spam
        if (!window._zoneCanvasDebugLogged) {
          window._zoneCanvasDebugLogged = true;
          console.log('[Zone] drawZonesOnCanvas SKIP - missing:', { zoneCanvas: !!zoneCanvas, zoneCtx: !!zoneCtx, chart: !!chart, candleSeries: !!candleSeries });
        }
        return;
      }
      if (activeZones.length === 0) return;
      // Reset debug flag when we have zones
      window._zoneCanvasDebugLogged = false;

      const chartEl = document.getElementById('chart-container');
      if (!chartEl) return;

      const rect = chartEl.getBoundingClientRect();
      const timeScale = chart.timeScale();
      const priceScaleWidth = 55; // Right price scale width

      // Clear canvas
      zoneCtx.clearRect(0, 0, rect.width, rect.height);

      // Reset zone bounds for hit detection
      zoneBounds = [];

      // Check if any zone is selected (for dimming non-selected zones)
      const hasSelection = selectedZoneIndex !== null && selectedZoneIndex >= 0;

      // Draw each zone
      activeZones.forEach((zone, idx) => {
        const isSelected = (idx === selectedZoneIndex);
        const isDimmed = hasSelection && !isSelected; // Dim non-selected zones when one is selected

        // ✅ COLORS - Normal vs Dimmed (when another zone is selected)
        const DARK_RED = isDimmed ? 'rgba(139, 0, 0, 0.10)' : 'rgba(139, 0, 0, 0.30)';
        const DARK_GREEN = isDimmed ? 'rgba(0, 100, 0, 0.10)' : 'rgba(0, 100, 0, 0.30)';
        const SELECTED_RED = 'rgba(180, 30, 30, 0.50)';
        const SELECTED_GREEN = 'rgba(30, 130, 30, 0.50)';
        const CYAN_ENTRY = isDimmed ? 'rgba(0, 255, 255, 0.3)' : '#00FFFF';
        const LABEL_ALPHA = isDimmed ? 0.25 : 1.0; // For text labels

        // Get time values
        let startTime = zone.start_time || zone.startTime || zone.formation_time;
        let endTime = zone.end_time || zone.endTime;

        // ✅ DEBUG: Log original timestamps from zone data
        if (idx === 0) {
          console.log('[Zone] RAW zone data:', {
            id: zone.id,
            isPositionZone: zone.isPositionZone,
            start_time: zone.start_time,
            startTime: zone.startTime,
            formation_time: zone.formation_time,
            end_time: zone.end_time,
            resolvedStartTime: startTime,
            resolvedEndTime: endTime,
            lastCandleDataLen: lastCandleData?.length || 0
          });
        }

        // Convert ms to seconds if needed
        if (startTime && startTime > 9999999999) startTime = Math.floor(startTime / 1000);
        if (endTime && endTime > 9999999999) endTime = Math.floor(endTime / 1000);

        // ✅ ZONE POSITIONING: Use formation_time (when pattern was detected)
        // Zone must be sticky to the exact candles where pattern formed
        // This ensures zone moves correctly with zoom/pan
        if (idx === 0) {
          console.log('[Zone] Using formation time for positioning:', {
            startTime,
            endTime,
            isPositionZone: zone.isPositionZone,
            lastCandleDataLen: lastCandleData?.length || 0
          });
        }

        // ✅ FIX: If no startTime, try to get timestamp from candle index
        if ((!startTime || startTime <= 0) && lastCandleData && lastCandleData.length > 0) {
          const candleIdx = zone.start_candle_index ?? zone.startCandleIndex;
          if (candleIdx !== null && candleIdx !== undefined && candleIdx >= 0) {
            const effectiveIdx = Math.min(candleIdx, lastCandleData.length - 1);
            const candle = lastCandleData[effectiveIdx];
            if (candle?.time) {
              startTime = candle.time;
            }
          }
        }

        // Skip zones with no valid timestamp after all attempts
        if (!startTime || startTime <= 0) {
          console.log('[Zone] SKIP - no valid startTime for zone:', zone.id);
          return; // Zone cannot be positioned - skip silently
        }

        // ⚠️ VALIDATION: Check if zone is beyond visible data range
        // Get visible time range from the chart
        const visibleRange = timeScale.getVisibleLogicalRange();
        if (visibleRange) {
          // Get the last bar's time as reference for "future" check
          const barsInfo = candleSeries.barsInLogicalRange(visibleRange);
          if (barsInfo && barsInfo.barsBefore !== undefined) {
            // If startTime maps to a position far beyond last candle, skip it
            const x1Test = timeScale.timeToCoordinate(startTime);
            if (x1Test !== null && x1Test > rect.width - priceScaleWidth - 20) {
              // Zone starts beyond visible candles - position at last visible area instead
              console.log('[Zone] Zone positioned beyond candles, clamping to edge:', zone.pattern_type);
            }
          }
        }

        // Get X coordinates
        let x1 = timeScale.timeToCoordinate(startTime);
        const x2 = endTime ? timeScale.timeToCoordinate(endTime) : null;

        // ⚠️ IMPROVED FALLBACK: If x1 is null, use candle index or intelligent positioning
        // Don't just use fixed "8 candles from right" - try to anchor to actual candles
        if (x1 === null && lastCandleData && lastCandleData.length > 0) {
          // PRIORITY 1: Use start_candle_index if available and valid
          const candleIdx = zone.start_candle_index ?? zone.startCandleIndex;
          if (candleIdx !== null && candleIdx !== undefined && candleIdx >= 0 && candleIdx < lastCandleData.length) {
            const candle = lastCandleData[candleIdx];
            if (candle?.time) {
              startTime = candle.time;
              x1 = timeScale.timeToCoordinate(startTime);
              if (idx === 0) {
                console.log('[Zone] FALLBACK via candle index:', candleIdx, 'x1:', x1);
              }
            }
          }

          // PRIORITY 2: If startTime exists but is in the past (before visible data), find closest candle
          if (x1 === null && startTime > 0) {
            // Find the candle closest to startTime
            let closestIdx = 0;
            let closestDiff = Infinity;
            for (let i = 0; i < lastCandleData.length; i++) {
              const diff = Math.abs(lastCandleData[i].time - startTime);
              if (diff < closestDiff) {
                closestDiff = diff;
                closestIdx = i;
              }
            }
            const closestCandle = lastCandleData[closestIdx];
            if (closestCandle?.time) {
              startTime = closestCandle.time;
              x1 = timeScale.timeToCoordinate(startTime);
              if (idx === 0) {
                console.log('[Zone] FALLBACK via closest candle at idx:', closestIdx, 'x1:', x1);
              }
            }
          }

          // PRIORITY 3: Last resort - position near recent candles (not fixed at 8)
          if (x1 === null) {
            // Use 20% from right edge based on candle count
            const fallbackIndex = Math.max(0, Math.floor(lastCandleData.length * 0.8));
            const fallbackCandle = lastCandleData[fallbackIndex];
            if (fallbackCandle?.time) {
              startTime = fallbackCandle.time;
              x1 = timeScale.timeToCoordinate(startTime);
              if (idx === 0) {
                console.log('[Zone] FALLBACK via proportional position:', fallbackIndex, 'x1:', x1);
              }
            }
          }
        }

        // If still null after fallback, skip silently
        if (x1 === null) {
          return;
        }

        // ✅ DEBUG: Log zone coordinate calculation for first zone
        if (idx === 0) {
          console.log('[Zone] CALC zone #0:', {
            id: zone.id,
            startTime,
            endTime,
            x1,
            entry_price: zone.entry_price || zone.entryPrice,
            stop_loss: zone.stop_loss || zone.stopLoss,
            zone_high: zone.zone_high,
            zone_low: zone.zone_low,
          });
        }

        // ✅ CRITICAL: Recalculate x2 from endTime (in case it was updated by fallback)
        // This ensures zone width is TIME-BASED, not pixel-based
        let x2Final = null;
        if (endTime) {
          x2Final = timeScale.timeToCoordinate(endTime);
        }

        // Calculate zone position and width using TIME-BASED coordinates
        let left = x1;
        let right = x2Final !== null ? x2Final : (left + 120); // Default width ~120px if no end_time
        let width = right - left;

        // Ensure reasonable width: min 40px, max 180px
        if (width < 40) width = 40;
        if (width > 180) width = 180;

        // ⚠️ FIX: Get position of last candle to prevent zones in empty space
        // Find the x-coordinate of the most recent candle (use lastCandleData for reliability)
        const lastCandleX = (() => {
          try {
            if (lastCandleData && lastCandleData.length > 0) {
              const lastTime = lastCandleData[lastCandleData.length - 1].time;
              const coord = timeScale.timeToCoordinate(lastTime);
              if (coord !== null) return coord;
            }
          } catch (e) {
            console.warn('[Zone] Error getting last candle X:', e);
          }
          return rect.width - priceScaleWidth - 20; // Fallback to near right edge
        })();

        // ⚠️ CRITICAL: Don't let zones extend beyond last candle
        // Use tight margin (10px) to prevent floating zones
        const maxRight = lastCandleX !== null ? lastCandleX + 10 : rect.width - priceScaleWidth;

        // ✅ DEBUG: Log position check for first zone
        if (idx === 0) {
          console.log('[Zone] POSITION zone #0:', { left, width, lastCandleX, maxRight, willSkip: left > maxRight });
        }

        if (left > maxRight) {
          // Zone starts beyond last candle - skip it entirely
          window.ReactNativeWebView?.postMessage(JSON.stringify({ type: 'zone_skip', reason: 'beyond_last_candle', left, maxRight, zoneId: zone.id }));
          return;
        }
        if (left + width > maxRight) {
          // Clip width to not extend beyond last candle
          width = maxRight - left;
          // If clipped width is too small, skip the zone instead of forcing minimum
          if (width < 20) {
            window.ReactNativeWebView?.postMessage(JSON.stringify({ type: 'zone_skip', reason: 'width_too_small', width, zoneId: zone.id }));
            return;
          }
        }

        // Clip to chart area
        if (left + width > rect.width - priceScaleWidth) {
          width = rect.width - priceScaleWidth - left;
        }
        if (left < 0) {
          width = width + left;
          left = 0;
        }
        if (width <= 0) return;

        // ✅✅✅ CRITICAL FIX: Determine direction based on STOP LOSS position vs ENTRY
        // - SL < Entry → LONG (MUA) - SL ở dưới bảo vệ lệnh mua
        // - SL > Entry → SHORT (BÁN) - SL ở trên bảo vệ lệnh bán
        // This is the ONLY correct way - SL position defines trade direction!
        const entryForDir = parseFloat(zone.entry_price || zone.entryPrice || zone.zone_high || zone.zone_low || 0);
        const slForDir = parseFloat(zone.stop_loss || zone.stopLoss || zone.stop_price || zone.sl || 0);

        // Skip zones with invalid entry or SL
        if (!entryForDir || entryForDir <= 0 || isNaN(entryForDir)) {
          window.ReactNativeWebView?.postMessage(JSON.stringify({ type: 'zone_skip', reason: 'invalid_entry', entryForDir }));
          return;
        }

        // ✅ CORRECT RULE: SL above entry = SHORT, SL below entry = LONG
        const isShort = slForDir > 0 && slForDir > entryForDir;

        // Get price levels
        const entryPrice = parseFloat(zone.entry_price || zone.entryPrice || zone.entry || zone.price_level || 0);
        const stopLoss = parseFloat(zone.stop_loss || zone.stopLoss || zone.stop_price || zone.sl || 0);

        // ✅ Get TP from multiple sources + FALLBACK calculation
        let takeProfit = parseFloat(zone.take_profit || zone.takeProfit || zone.target_1 || zone.tp || zone.target || zone.targetPrice || 0);

        // ✅ VALIDATE TP direction: For SHORT, TP must be BELOW entry. For LONG, TP must be ABOVE entry.
        // If TP is on wrong side, recalculate it
        const tpOnWrongSide = takeProfit > 0 && (
          (isShort && takeProfit > entryPrice) ||  // SHORT but TP above entry = wrong
          (!isShort && takeProfit < entryPrice)    // LONG but TP below entry = wrong
        );

        // ✅ CALCULATE TP if missing OR on wrong side (R:R = 1:2 default)
        if ((!takeProfit || takeProfit <= 0 || tpOnWrongSide) && entryPrice > 0 && stopLoss > 0) {
          const risk = Math.abs(entryPrice - stopLoss);
          // BUY (not short) = TP above entry, SELL (short) = TP below entry
          takeProfit = isShort ? entryPrice - (risk * 2) : entryPrice + (risk * 2);
        }

        // Fallback to zone_high/zone_low if no entry price
        if (!entryPrice || entryPrice <= 0) {
          const high = parseFloat(zone.zone_high || zone.zoneHigh || zone.high || 0);
          const low = parseFloat(zone.zone_low || zone.zoneLow || zone.low || 0);
          if (high > 0 && low > 0) {
            const y1 = candleSeries.priceToCoordinate(high);
            const y2 = candleSeries.priceToCoordinate(low);
            if (y1 !== null && y2 !== null) {
              const top = Math.min(y1, y2);
              const height = Math.abs(y2 - y1);
              zoneCtx.fillStyle = isShort
                ? (isSelected ? SELECTED_RED : DARK_RED)
                : (isSelected ? SELECTED_GREEN : DARK_GREEN);
              zoneCtx.fillRect(left, top, width, Math.max(height, 5));

              // Store bounds for hit detection
              zoneBounds.push({ index: idx, left, right: left + width, top, bottom: top + height });

              // Draw border if selected
              if (isSelected) {
                zoneCtx.strokeStyle = isShort ? '#dc3545' : '#0ecb81';
                zoneCtx.lineWidth = 2;
                zoneCtx.strokeRect(left, top, width, height);
              }
            }
          }
          return;
        }

        // Convert prices to Y coordinates
        const entryY = candleSeries.priceToCoordinate(entryPrice);
        const slY = stopLoss > 0 ? candleSeries.priceToCoordinate(stopLoss) : null;
        const tpY = takeProfit > 0 ? candleSeries.priceToCoordinate(takeProfit) : null;

        if (entryY === null) {
          console.log('[Zone] SKIP zone - entryY is null for:', zone.id, 'entryPrice:', entryPrice);
          window.ReactNativeWebView?.postMessage(JSON.stringify({ type: 'zone_skip', reason: 'entryY_null', zoneId: zone.id, entryPrice }));
          return;
        }

        // ✅ DEBUG: Log Y coordinates for first zone
        if (idx === 0) {
          console.log('[Zone] Y-COORDS zone #0:', { entryY, slY, tpY, entryPrice, stopLoss, takeProfit });
        }

        // Calculate zone bounds for hit detection
        let zoneTop = entryY;
        let zoneBottom = entryY;
        if (slY !== null) {
          zoneTop = Math.min(zoneTop, slY);
          zoneBottom = Math.max(zoneBottom, slY);
        }
        if (tpY !== null) {
          zoneTop = Math.min(zoneTop, tpY);
          zoneBottom = Math.max(zoneBottom, tpY);
        }

        // Store bounds for hit detection
        zoneBounds.push({
          index: idx,
          left,
          right: left + width,
          top: zoneTop,
          bottom: zoneBottom
        });
        // Debug: Confirm zone drawing started
        if (idx === 0 && !window._zoneDrawDebugLogged) {
          window._zoneDrawDebugLogged = true;
          console.log('[Zone] ✅ DRAWING zone:', zone.id, 'at x:', left, 'width:', width, 'entryY:', entryY, 'slY:', slY, 'tpY:', tpY, 'isShort:', isShort);
          window.ReactNativeWebView?.postMessage(JSON.stringify({
            type: 'zone_draw_success',
            zoneId: zone.id,
            left, width, entryY, slY, tpY, isShort
          }));
        }

        // ✅ Format price for labels - VIETNAMESE: 95.880,50
        function formatPriceVN(price) {
          if (!price && price !== 0) return '-';
          const num = parseFloat(price);
          if (isNaN(num)) return '-';
          // Số nhỏ < 1: 0,2716
          if (Math.abs(num) < 1) {
            return num.toFixed(4).replace('.', ',');
          }
          // Số lớn: 95.880,50
          const fixed = num.toFixed(2);
          const [integer, decimal] = fixed.split('.');
          const intFormatted = integer.replace(/\\B(?=(\\d{3})+(?!\\d))/g, '.');
          return intFormatted + ',' + decimal;
        }
        const formatPrice = formatPriceVN;
        const labelX = left + 4;

        if (isShort) {
          // === SHORT/SELL Pattern ===
          // SL above entry (RED), TP below entry (GREEN)

          // 1. STOP LOSS Zone (DARK RED - above entry)
          if (slY !== null && slY < entryY) {
            const slTop = slY;
            const slHeight = entryY - slY;
            zoneCtx.fillStyle = isSelected ? SELECTED_RED : DARK_RED;
            zoneCtx.fillRect(left, slTop, width, Math.max(slHeight, 3));

            // SL Line (dashed) - dim when not selected
            zoneCtx.globalAlpha = LABEL_ALPHA;
            zoneCtx.setLineDash([4, 4]);
            zoneCtx.strokeStyle = '#dc3545';
            zoneCtx.lineWidth = 1;
            zoneCtx.beginPath();
            zoneCtx.moveTo(left, slTop);
            zoneCtx.lineTo(left + width, slTop);
            zoneCtx.stroke();
            zoneCtx.setLineDash([]);

            // ✅ SL Label - dim when not selected
            zoneCtx.fillStyle = '#dc3545';
            zoneCtx.font = 'bold 10px Arial';
            zoneCtx.fillText('Cắt lỗ ' + formatPrice(stopLoss), labelX, slTop - 4);
            zoneCtx.globalAlpha = 1.0;
          }

          // 2. ENTRY LINE - ✅ CYAN COLOR with "Bán" label
          zoneCtx.globalAlpha = LABEL_ALPHA;
          zoneCtx.fillStyle = CYAN_ENTRY;
          zoneCtx.fillRect(left, entryY - 1, width, 2);

          // Entry label - "Bán" for SHORT (VIETNAMESE)
          zoneCtx.fillStyle = CYAN_ENTRY;
          zoneCtx.font = 'bold 11px Arial';
          zoneCtx.fillText('Bán ' + formatPrice(entryPrice), labelX, entryY - 6);
          zoneCtx.globalAlpha = 1.0;

          // 3. TAKE PROFIT Zone (DARK GREEN - below entry)
          if (tpY !== null && tpY > entryY) {
            const tpHeight = tpY - entryY;
            zoneCtx.fillStyle = isSelected ? SELECTED_GREEN : DARK_GREEN;
            zoneCtx.fillRect(left, entryY, width, Math.max(tpHeight, 3));

            // TP Line (dashed) - dim when not selected
            zoneCtx.globalAlpha = LABEL_ALPHA;
            zoneCtx.setLineDash([4, 4]);
            zoneCtx.strokeStyle = '#0ecb81';
            zoneCtx.lineWidth = 1;
            zoneCtx.beginPath();
            zoneCtx.moveTo(left, tpY);
            zoneCtx.lineTo(left + width, tpY);
            zoneCtx.stroke();
            zoneCtx.setLineDash([]);

            // ✅ TP Label - dim when not selected
            zoneCtx.fillStyle = '#0ecb81';
            zoneCtx.font = 'bold 10px Arial';
            zoneCtx.fillText('Chốt lời ' + formatPrice(takeProfit), labelX, tpY + 14);
            zoneCtx.globalAlpha = 1.0;
          }

          // Draw border when selected
          if (isSelected) {
            zoneCtx.strokeStyle = '#dc3545';
            zoneCtx.lineWidth = 2;
            zoneCtx.strokeRect(left, zoneTop, width, zoneBottom - zoneTop);
          }

        } else {
          // === LONG/BUY Pattern ===
          // TP above entry (GREEN), SL below entry (RED)

          // 1. TAKE PROFIT Zone (DARK GREEN - above entry)
          if (tpY !== null && tpY < entryY) {
            const tpTop = tpY;
            const tpHeight = entryY - tpY;
            zoneCtx.fillStyle = isSelected ? SELECTED_GREEN : DARK_GREEN;
            zoneCtx.fillRect(left, tpTop, width, Math.max(tpHeight, 3));

            // TP Line (dashed)
            zoneCtx.globalAlpha = LABEL_ALPHA;
            zoneCtx.setLineDash([4, 4]);
            zoneCtx.strokeStyle = '#0ecb81';
            zoneCtx.lineWidth = 1;
            zoneCtx.beginPath();
            zoneCtx.moveTo(left, tpTop);
            zoneCtx.lineTo(left + width, tpTop);
            zoneCtx.stroke();
            zoneCtx.setLineDash([]);

            // ✅ TP Label - dim when not selected
            zoneCtx.fillStyle = '#0ecb81';
            zoneCtx.font = 'bold 10px Arial';
            zoneCtx.fillText('Chốt lời ' + formatPrice(takeProfit), labelX, tpTop - 4);
            zoneCtx.globalAlpha = 1.0;
          }

          // 2. ENTRY LINE - ✅ CYAN COLOR with "Mua" label
          zoneCtx.globalAlpha = LABEL_ALPHA;
          zoneCtx.fillStyle = CYAN_ENTRY;
          zoneCtx.fillRect(left, entryY - 1, width, 2);

          // Entry label - "Mua" for LONG (VIETNAMESE)
          zoneCtx.fillStyle = CYAN_ENTRY;
          zoneCtx.font = 'bold 11px Arial';
          zoneCtx.fillText('Mua ' + formatPrice(entryPrice), labelX, entryY - 6);
          zoneCtx.globalAlpha = 1.0;

          // 3. STOP LOSS Zone (DARK RED - below entry)
          if (slY !== null && slY > entryY) {
            const slHeight = slY - entryY;
            zoneCtx.fillStyle = isSelected ? SELECTED_RED : DARK_RED;
            zoneCtx.fillRect(left, entryY, width, Math.max(slHeight, 3));

            // SL Line (dashed)
            zoneCtx.globalAlpha = LABEL_ALPHA;
            zoneCtx.setLineDash([4, 4]);
            zoneCtx.strokeStyle = '#dc3545';
            zoneCtx.lineWidth = 1;
            zoneCtx.beginPath();
            zoneCtx.moveTo(left, slY);
            zoneCtx.lineTo(left + width, slY);
            zoneCtx.stroke();
            zoneCtx.setLineDash([]);

            // ✅ SL Label - dim when not selected
            zoneCtx.fillStyle = '#dc3545';
            zoneCtx.font = 'bold 10px Arial';
            zoneCtx.fillText('Cắt lỗ ' + formatPrice(stopLoss), labelX, slY + 14);
            zoneCtx.globalAlpha = 1.0;
          }

          // Draw border when selected
          if (isSelected) {
            zoneCtx.strokeStyle = '#0ecb81';
            zoneCtx.lineWidth = 2;
            zoneCtx.strokeRect(left, zoneTop, width, zoneBottom - zoneTop);
          }
        }
      });
    }

    // Start zone animation loop - runs every frame for smooth zone movement
    function startZoneAnimation() {
      function animate() {
        drawZonesOnCanvas();
        zoneAnimationId = requestAnimationFrame(animate);
      }
      animate();
    }

    // Stop zone animation
    function stopZoneAnimation() {
      if (zoneAnimationId) {
        cancelAnimationFrame(zoneAnimationId);
        zoneAnimationId = null;
      }
    }

    // ✅ Canvas-based zone animation is handled by drawZonesOnCanvas()
    // No DOM-based position updates needed - zones automatically follow chart coordinates

    // ✅ Update zones from React Native - CANVAS-BASED VERSION
    window.updateZones = function(zones, preferences) {
      // Send debug info back to React Native
      window.ReactNativeWebView?.postMessage(JSON.stringify({
        type: 'zone_update_debug',
        zonesReceived: zones?.length || 0,
        firstZone: zones?.[0] ? {
          id: zones[0].id,
          zone_high: zones[0].zone_high,
          zone_low: zones[0].zone_low,
          symbol: zones[0].symbol
        } : null,
        chartExists: !!chart,
        candleSeriesExists: !!candleSeries
      }));

      // Clear existing zones first
      window.clearZones();

      if (!zones || !Array.isArray(zones) || zones.length === 0) {
        updateZoneCanvasPointerEvents(); // Ensure pointer events are disabled
        return;
      }

      // Create canvas overlay if needed
      createZoneCanvas();

      // Get current price for proximity sorting
      const lastCandle = lastCandleData && lastCandleData.length > 0
        ? lastCandleData[lastCandleData.length - 1]
        : null;
      const currentPrice = lastCandle ? lastCandle.close : 90000;

      // Sort zones by proximity to current price (closest first)
      const sortedZones = [...zones].sort((a, b) => {
        const midA = ((a.zone_high || a.high) + (a.zone_low || a.low)) / 2;
        const midB = ((b.zone_high || b.high) + (b.zone_low || b.low)) / 2;
        const distA = Math.abs(midA - currentPrice);
        const distB = Math.abs(midB - currentPrice);
        return distA - distB;
      });

      // Show up to 6 zones closest to current price
      const MAX_ZONES = preferences?.maxZones || 6;
      const zonesToRender = sortedZones.slice(0, MAX_ZONES);

      console.log('[Chart.updateZones] Showing', zonesToRender.length, 'zones closest to price', currentPrice);

      // Debug: Send zone data to RN for verification
      window.ReactNativeWebView?.postMessage(JSON.stringify({
        type: 'zone_render_debug',
        zonesToRender: zonesToRender.length,
        lastCandleDataLength: lastCandleData?.length || 0,
        firstZoneDetails: zonesToRender[0] ? {
          id: zonesToRender[0].id,
          zone_high: zonesToRender[0].zone_high,
          zone_low: zonesToRender[0].zone_low,
          entry_price: zonesToRender[0].entry_price,
          stop_loss: zonesToRender[0].stop_loss,
          start_time: zonesToRender[0].start_time,
          end_time: zonesToRender[0].end_time,
          isPositionZone: zonesToRender[0].isPositionZone,
        } : null
      }));

      // Store zones in activeZones array for canvas rendering
      activeZones = zonesToRender.map((zone, idx) => ({
        ...zone,
        index: idx,
      }));

      // Start animation loop (zones now move with chart pan/scroll)
      startZoneAnimation();

      // Enable pointer events for tap-to-select now that we have zones
      updateZoneCanvasPointerEvents();
    };

    // ✅ Clear all zones - CANVAS-BASED VERSION
    window.clearZones = function() {
      // Stop animation loop
      stopZoneAnimation();
      zoneDrawDebugSent = false; // Reset debug flag

      // Clear canvas
      if (zoneCanvas && zoneCtx) {
        const rect = zoneCanvas.getBoundingClientRect();
        zoneCtx.clearRect(0, 0, rect.width, rect.height);
      }

      // Clear zone data and selection
      activeZones = [];
      zoneBounds = [];
      selectedZoneIndex = null;
      hideZoneTooltip(true); // Force hide when clearing all zones

      // Disable pointer events since no zones to tap
      updateZoneCanvasPointerEvents();

      console.log('[Chart.clearZones] ✅ Cleared all zones (canvas)');
    };

    // Update a single zone - triggers re-render on next animation frame
    window.updateSingleZone = function(zoneId, updates) {
      console.log('[Chart.updateSingleZone] Update requested for zone:', zoneId);
      // Canvas-based system auto-updates on each animation frame
      // Just update the zone data in activeZones array
      const zoneIndex = activeZones.findIndex(z => z.id === zoneId);
      if (zoneIndex >= 0) {
        activeZones[zoneIndex] = { ...activeZones[zoneIndex], ...updates };
      }
    };

    // Render a single drawing
    function renderDrawing(drawing) {
      const data = drawing.drawing_data;
      const toolType = drawing.tool_type;

      switch (toolType) {
        case 'horizontal_line':
          renderHorizontalLine(data, drawing.id);
          break;
        case 'trend_line':
          // Trend lines not natively supported - using price lines as approximation
          renderTrendLine(data, drawing.id);
          break;
        case 'rectangle':
          renderRectangle(data, drawing.id);
          break;
        case 'fibonacci_retracement':
          renderFibonacci(data, drawing.id);
          break;
        case 'long_position':
          renderPosition(data, drawing.id, 'long');
          break;
        case 'short_position':
          renderPosition(data, drawing.id, 'short');
          break;
      }
    }

    // Render horizontal line
    function renderHorizontalLine(data, id) {
      const lineStyle = data.lineStyle ? getLineStyleValue(data.lineStyle) : LightweightCharts.LineStyle.Solid;
      const line = candleSeries.createPriceLine({
        price: data.price,
        color: data.color || '#FFBD59',
        lineWidth: 2,
        lineStyle: lineStyle,
        axisLabelVisible: true,
        title: '',
      });
      line._drawingId = id;
      drawingPriceLines.push(line);
    }

    // Render trend line (shows start and end horizontal lines)
    function renderTrendLine(data, id) {
      const color = data.color || '#00F0FF';
      const lineStyle = data.lineStyle ? getLineStyleValue(data.lineStyle) : LightweightCharts.LineStyle.Dashed;

      // Start price line
      const startLine = candleSeries.createPriceLine({
        price: data.startPrice,
        color: color,
        lineWidth: 2,
        lineStyle: lineStyle,
        axisLabelVisible: true,
        title: 'START',
      });
      startLine._drawingId = id;
      drawingPriceLines.push(startLine);

      // End price line
      const endLine = candleSeries.createPriceLine({
        price: data.endPrice,
        color: color,
        lineWidth: 2,
        lineStyle: lineStyle,
        axisLabelVisible: true,
        title: 'END',
      });
      endLine._drawingId = id;
      drawingPriceLines.push(endLine);
    }

    // Render rectangle (using top and bottom lines)
    function renderRectangle(data, id) {
      const color = data.color || '#6A5BFF';
      const lineStyle = data.lineStyle ? getLineStyleValue(data.lineStyle) : LightweightCharts.LineStyle.Dotted;

      const topLine = candleSeries.createPriceLine({
        price: Math.max(data.startPrice, data.endPrice),
        color: color,
        lineWidth: 2,
        lineStyle: lineStyle,
        axisLabelVisible: true,
        title: 'TOP',
      });
      topLine._drawingId = id;
      drawingPriceLines.push(topLine);

      const bottomLine = candleSeries.createPriceLine({
        price: Math.min(data.startPrice, data.endPrice),
        color: color,
        lineWidth: 2,
        lineStyle: lineStyle,
        axisLabelVisible: true,
        title: 'BTM',
      });
      bottomLine._drawingId = id;
      drawingPriceLines.push(bottomLine);
    }

    // Render fibonacci retracement
    function renderFibonacci(data, id) {
      const startPrice = data.startPrice;
      const endPrice = data.endPrice;
      const range = endPrice - startPrice;

      FIBONACCI_LEVELS.forEach(level => {
        const price = startPrice + (range * level.value);
        const line = candleSeries.createPriceLine({
          price: price,
          color: level.color,
          lineWidth: 1,
          lineStyle: LightweightCharts.LineStyle.Dashed,
          axisLabelVisible: true,
          title: level.label,
        });
        line._drawingId = id;
        drawingPriceLines.push(line);
      });
    }

    // Render long/short position
    function renderPosition(data, id, type) {
      const entryPrice = data.entryPrice;
      const tpPercent = type === 'long' ? 0.04 : -0.04;  // +4% for long, -4% for short
      const slPercent = type === 'long' ? -0.02 : 0.02;  // -2% for long, +2% for short
      const tpPrice = entryPrice * (1 + tpPercent);
      const slPrice = entryPrice * (1 + slPercent);

      // Entry line
      const entryLine = candleSeries.createPriceLine({
        price: entryPrice,
        color: '#3B82F6',
        lineWidth: 2,
        lineStyle: LightweightCharts.LineStyle.Solid,
        axisLabelVisible: true,
        title: type === 'long' ? 'LONG' : 'SHORT',
      });
      entryLine._drawingId = id;
      drawingPriceLines.push(entryLine);

      // TP line
      const tpLine = candleSeries.createPriceLine({
        price: tpPrice,
        color: '#22C55E',
        lineWidth: 1,
        lineStyle: LightweightCharts.LineStyle.Dashed,
        axisLabelVisible: true,
        title: 'TP',
      });
      tpLine._drawingId = id;
      drawingPriceLines.push(tpLine);

      // SL line
      const slLine = candleSeries.createPriceLine({
        price: slPrice,
        color: '#EF4444',
        lineWidth: 1,
        lineStyle: LightweightCharts.LineStyle.Dashed,
        axisLabelVisible: true,
        title: 'SL',
      });
      slLine._drawingId = id;
      drawingPriceLines.push(slLine);
    }

    // Apply magnet mode - snap to nearest OHLC
    function applyMagnetMode(price, time) {
      if (!magnetModeEnabled || lastCandleData.length === 0) return price;

      // Find candle closest to the clicked time
      let closestCandle = null;
      let minTimeDiff = Infinity;

      for (const candle of lastCandleData) {
        const timeDiff = Math.abs(candle.time - time);
        if (timeDiff < minTimeDiff) {
          minTimeDiff = timeDiff;
          closestCandle = candle;
        }
      }

      if (!closestCandle) return price;

      // Find nearest OHLC value
      const ohlc = [closestCandle.open, closestCandle.high, closestCandle.low, closestCandle.close];
      let nearestPrice = price;
      let minPriceDiff = Infinity;

      for (const p of ohlc) {
        const diff = Math.abs(p - price);
        if (diff < minPriceDiff) {
          minPriceDiff = diff;
          nearestPrice = p;
        }
      }

      // Only snap if within 2% of the price
      const snapThreshold = price * 0.02;
      return minPriceDiff < snapThreshold ? nearestPrice : price;
    }

    // Handle chart click for drawing AND zone selection
    function setupDrawingClickHandler() {
      chart.subscribeClick(param => {
        console.log('[Zone] ===== CLICK EVENT =====', Date.now());
        if (!param.point) return;

        // ✅ ZONE SELECTION via chart.subscribeClick() (not canvas touch events)
        // This allows pan/zoom to work while still enabling zone taps
        if (!currentDrawingMode && activeZones && activeZones.length > 0) {
          const clickedZoneIndex = findZoneAtPoint(param.point.x, param.point.y);
          console.log('[Zone] Click at:', param.point.x, param.point.y, '-> zoneIndex:', clickedZoneIndex, 'zoneBounds:', zoneBounds.length);

          if (clickedZoneIndex !== null && clickedZoneIndex < activeZones.length) {
            selectedZoneIndex = clickedZoneIndex;
            const zone = activeZones[clickedZoneIndex];
            if (zone) {
              console.log('[Zone] SHOWING tooltip for zone:', zone.pattern_type || zone.pattern_name);
              showZoneTooltip(zone, param.point.x, param.point.y);
            }
            console.log('[Zone] chart.subscribeClick selected zone:', clickedZoneIndex);

            // ⚠️ ZONE-PATTERN SYNC: Notify React Native of zone selection
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'zone_press',
                zoneId: zone.id || zone.pattern_id,
                zone: zone
              }));
            }
          } else {
            console.log('[Zone] HIDING tooltip - clicked outside zone, tooltipJustShown:', tooltipJustShown);
            selectedZoneIndex = null;
            hideZoneTooltip();
            console.log('[Zone] chart.subscribeClick deselected');
          }
          drawZonesOnCanvas();
          return; // Don't process as drawing when zone selection happened
        }

        // Drawing mode handling
        if (!currentDrawingMode || !param.time) return;

        const price = candleSeries.coordinateToPrice(param.point.y);
        const time = param.time;

        // Apply magnet mode
        const snappedPrice = applyMagnetMode(price, time);

        // Handle based on tool type
        switch (currentDrawingMode) {
          case 'horizontal_line':
            handleHorizontalLineClick(snappedPrice);
            break;
          case 'trend_line':
            handleTwoClickTool(snappedPrice, time, 'trend_line');
            break;
          case 'rectangle':
            handleTwoClickTool(snappedPrice, time, 'rectangle');
            break;
          case 'fibonacci_retracement':
            handleTwoClickTool(snappedPrice, time, 'fibonacci_retracement');
            break;
          case 'long_position':
            handlePositionClick(snappedPrice, 'long');
            break;
          case 'short_position':
            handlePositionClick(snappedPrice, 'short');
            break;
        }
      });
    }

    // Handle horizontal line (1 click)
    function handleHorizontalLineClick(price) {
      const drawingData = {
        price: price,
        color: currentDrawingColor,
        lineStyle: currentLineStyle,
      };

      // Notify React Native
      window.ReactNativeWebView?.postMessage(JSON.stringify({
        type: 'drawing_complete',
        toolType: 'horizontal_line',
        drawingData: drawingData
      }));

      // Render immediately
      renderHorizontalLine(drawingData, 'temp_' + Date.now());
    }

    // Handle 2-click tools (trend_line, rectangle, fibonacci)
    function handleTwoClickTool(price, time, toolType) {
      if (!pendingDrawing) {
        // First click
        pendingDrawing = {
          toolType: toolType,
          startPrice: price,
          startTime: time
        };

        // Notify React Native about pending state
        window.ReactNativeWebView?.postMessage(JSON.stringify({
          type: 'drawing_pending',
          points: 1,
          tempData: pendingDrawing
        }));
      } else if (pendingDrawing.toolType === toolType) {
        // Second click - complete the drawing
        const drawingData = {
          startPrice: pendingDrawing.startPrice,
          startTime: pendingDrawing.startTime,
          endPrice: price,
          endTime: time,
          color: currentDrawingColor,
          lineStyle: currentLineStyle,
        };

        // Notify React Native
        window.ReactNativeWebView?.postMessage(JSON.stringify({
          type: 'drawing_complete',
          toolType: toolType,
          drawingData: drawingData
        }));

        // Render immediately
        const tempId = 'temp_' + Date.now();
        if (toolType === 'trend_line') {
          renderTrendLine(drawingData, tempId);
        } else if (toolType === 'rectangle') {
          renderRectangle(drawingData, tempId);
        } else if (toolType === 'fibonacci_retracement') {
          renderFibonacci(drawingData, tempId);
        }

        // Reset pending
        pendingDrawing = null;
      }
    }

    // Handle position click (1 click)
    function handlePositionClick(price, type) {
      const drawingData = {
        entryPrice: price,
      };

      // Notify React Native
      window.ReactNativeWebView?.postMessage(JSON.stringify({
        type: 'drawing_complete',
        toolType: type + '_position',
        drawingData: drawingData
      }));

      // Render immediately
      renderPosition(drawingData, 'temp_' + Date.now(), type);
    }

    // Store candle data for magnet mode when fetched
    function storeCandleDataForMagnet(candles) {
      lastCandleData = candles;
    }

    // Initialize
    createChart();
    fetchKlines();
    setupDrawingClickHandler();
    setupPnlOverlayPositionUpdates();
  </script>
</body>
</html>`;
  }, [symbol, showVolume, darkTheme, showPriceLines, hasPatternData, patternEntry, patternSL, patternTP, getBinanceIntervalForHtml]);
  // NOTE: activeTimeframe is NOT in dependencies - we use htmlTimeframeRef instead to prevent reload on timeframe change
  // Note: selectedColor and selectedLineStyle are NOT included as dependencies
  // because they are injected via setDrawingColor/setDrawingLineStyle JS functions
  // Including them would cause unnecessary WebView reloads and lose drawings

  // Toggle functions - update htmlTimeframeRef before reload to use current timeframe
  const toggleVolume = useCallback(() => {
    setShowVolume(prev => !prev);
    htmlTimeframeRef.current = activeTimeframe; // Sync ref before reload
    setWebViewKey(prev => prev + 1);
  }, [activeTimeframe]);

  const toggleTheme = useCallback(() => {
    setDarkTheme(prev => !prev);
    htmlTimeframeRef.current = activeTimeframe; // Sync ref before reload
    setWebViewKey(prev => prev + 1);
  }, [activeTimeframe]);

  const togglePriceLines = useCallback(() => {
    setShowPriceLines(prev => !prev);
    htmlTimeframeRef.current = activeTimeframe; // Sync ref before reload
    setWebViewKey(prev => prev + 1);
  }, [activeTimeframe]);

  const handleTimeframeChange = useCallback((newTimeframe) => {
    const binanceInterval = TIMEFRAME_TO_BINANCE[newTimeframe] || newTimeframe;

    console.log('[TradingChart] handleTimeframeChange:', newTimeframe, '-> binance:', binanceInterval);

    // Mark as programmatic change to prevent race condition with useEffect
    isProgrammaticChange.current = true;

    // Update state
    setActiveTimeframe(newTimeframe);
    onTimeframeChange?.(newTimeframe);

    // If chart is ready, change timeframe without reloading WebView
    // This preserves the scroll position
    if (chartReady && webViewRef.current) {
      console.log('[TradingChart] Using injection method for timeframe change');
      webViewRef.current.injectJavaScript(`
        if (window.changeTimeframe) {
          window.changeTimeframe('${binanceInterval}');
        }
        true;
      `);
    } else {
      // Fallback: reload WebView if chart not ready
      console.log('[TradingChart] Chart not ready, reloading WebView');
      htmlTimeframeRef.current = newTimeframe; // Use new timeframe for reload
      setWebViewKey(prev => prev + 1);
    }
  }, [onTimeframeChange, chartReady]);

  // Track previous values to prevent unnecessary reloads
  const prevSymbolRef = useRef(symbol);
  const prevPatternRef = useRef(null);

  // Reload when symbol changes
  useEffect(() => {
    if (prevSymbolRef.current !== symbol) {
      prevSymbolRef.current = symbol;
      htmlTimeframeRef.current = activeTimeframe; // Sync ref before reload
      setWebViewKey(prev => prev + 1);
    }
  }, [symbol, activeTimeframe]);

  // Reload when pattern PRICE VALUES change (not reference)
  useEffect(() => {
    if (!showPriceLines) return;

    const currentPattern = selectedPattern || (patterns.length > 0 ? patterns[0] : null);
    const prevPattern = prevPatternRef.current;

    // Only reload if actual price values changed
    const currentEntry = currentPattern?.entry || 0;
    const currentSL = currentPattern?.stopLoss || 0;
    const currentTP = currentPattern?.target || currentPattern?.takeProfit || 0;

    const prevEntry = prevPattern?.entry || 0;
    const prevSL = prevPattern?.stopLoss || 0;
    const prevTP = prevPattern?.target || prevPattern?.takeProfit || 0;

    if (currentEntry !== prevEntry || currentSL !== prevSL || currentTP !== prevTP) {
      prevPatternRef.current = currentPattern;
      htmlTimeframeRef.current = activeTimeframe; // Sync ref before reload
      setWebViewKey(prev => prev + 1);
    }
  }, [selectedPattern, patterns, showPriceLines, activeTimeframe]);

  const refreshChart = useCallback(() => {
    setIsLoading(true);
    htmlTimeframeRef.current = activeTimeframe; // Sync ref before reload
    setWebViewKey(prev => prev + 1);
  }, [activeTimeframe]);

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
        onMessage={handleWebViewMessage}
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
          activeTimeframe={activeTimeframe}
          onTimeframeChange={handleTimeframeChange}
          showPriceLines={showPriceLines}
          onTogglePriceLines={togglePriceLines}
          showVolume={showVolume}
          onToggleVolume={toggleVolume}
          zoneDisplayMode={zoneDisplayMode}
          onZoneDisplayModeChange={onZoneDisplayModeChange}
          onToggleDrawing={handleToggleDrawing}
          onToggleTheme={toggleTheme}
          onZoomIn={() => {}}
          onZoomOut={() => {}}
          onFullscreen={() => setFullScreen(true)}
          activeIndicators={showDrawingToolbar ? ['drawing'] : []}
          compact={true}
        />

        {/* Drawing Toolbar */}
        <DrawingToolbar
          visible={showDrawingToolbar}
          activeTool={drawingMode}
          magnetMode={magnetMode}
          pendingPoints={pendingPoints}
          onSelectTool={handleSelectDrawingTool}
          onToggleMagnet={() => setMagnetMode(prev => !prev)}
          onDeleteAll={handleDeleteAllDrawings}
          onClose={handleToggleDrawing}
          selectedColor={selectedColor}
          onColorChange={handleColorChange}
          selectedLineStyle={selectedLineStyle}
          onLineStyleChange={handleLineStyleChange}
          drawings={drawings}
          onShowDrawingList={() => setShowDrawingList(true)}
        />

        {/* Order Lines Toggle Row */}
        <View style={styles.orderLinesRow}>
          <OrderLinesToggle
            enabled={showOrderLines}
            onToggle={() => {
              setShowOrderLines(prev => {
                const newValue = !prev;
                // Clear order lines in WebView when disabled
                if (!newValue && webViewRef.current) {
                  webViewRef.current.injectJavaScript(`
                    if (window.clearOrderLines) {
                      window.clearOrderLines();
                    }
                    true;
                  `);
                }
                return newValue;
              });
            }}
            onSettingsPress={() => setShowOrderLinesSettings(true)}
            lineCount={orderLineCount}
            positionCount={positionCount}
            pendingCount={pendingCount}
          />

          {/* Position Zone Toggle - Show zone from selected position */}
          {selectedPosition && onTogglePositionZone && (
            <TouchableOpacity
              style={[
                styles.positionZoneToggle,
                showPositionZone && styles.positionZoneToggleActive,
              ]}
              onPress={onTogglePositionZone}
              activeOpacity={0.7}
            >
              <Layers size={14} color={showPositionZone ? COLORS.cyan : COLORS.textMuted} />
              {showPositionZone ? (
                <Eye size={12} color={COLORS.cyan} />
              ) : (
                <EyeOff size={12} color={COLORS.textMuted} />
              )}
              <Text style={[
                styles.positionZoneToggleText,
                showPositionZone && styles.positionZoneToggleTextActive,
              ]}>
                Zone
              </Text>
            </TouchableOpacity>
          )}
        </View>

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

      {/* Drawing List Modal */}
      <DrawingListModal
        visible={showDrawingList}
        onClose={() => setShowDrawingList(false)}
        drawings={drawings}
        onDeleteDrawing={handleDeleteDrawing}
        onUpdateDrawing={handleUpdateDrawing}
      />

      {/* Order Lines Settings Modal */}
      <OrderLinesSettings
        visible={showOrderLinesSettings}
        onClose={() => setShowOrderLinesSettings(false)}
        preferences={orderLinesPreferences}
        onPreferencesChange={(newPrefs) => {
          // Refresh order lines when preferences change
          refreshOrderLines();
        }}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.xs,
  },

  orderLinesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(15, 16, 48, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(106, 91, 255, 0.2)',
  },

  // Position Zone Toggle Button Styles
  positionZoneToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: 'rgba(106, 91, 255, 0.1)',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  positionZoneToggleActive: {
    backgroundColor: 'rgba(0, 207, 255, 0.15)',
    borderColor: 'rgba(0, 207, 255, 0.3)',
  },
  positionZoneToggleText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  positionZoneToggleTextActive: {
    color: COLORS.cyan,
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
