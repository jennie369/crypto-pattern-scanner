/**
 * GEM Mobile - Scanner Screen (Giao Dich)
 * Full pattern detection with TradingView chart + Scan Now button
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import alertService from '../../services/alertService';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Search,
  Zap,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  RefreshCw,
  Briefcase,
  Layers,
  GripVertical,
} from 'lucide-react-native';
// Note: Using simple state swap for sections instead of DraggableFlatList
// to avoid scroll conflicts with parent ScrollView

import CoinSelector from './components/CoinSelector';
import TradingChart from './components/TradingChart';
import ScanResultsSection from './components/ScanResultsSection';
// V2 Paper Trade Modal with enhanced Binance-style UI
import { PaperTradeModalV2, OpenPositionsSection, MTFAlignmentPanel } from '../../components/Trading';
import { MultiZoneOverlay } from '../../components/Scanner';
import { useSponsorBanners } from '../../components/SponsorBannerSection';
import SponsorBanner from '../../components/SponsorBanner';
import { useTooltip } from '../../components/Common/TooltipProvider';
import { patternDetection } from '../../services/patternDetection';
import zoneManager from '../../services/zoneManager';
import { mtfAlignmentService } from '../../services/mtfAlignmentService';
import {
  checkMultiTFAccess,
  getAvailableTimeframesForTier,
} from '../../services/multiTimeframeScanner';
import { binanceService } from '../../services/binanceService';
import { favoritesService } from '../../services/favoritesService';
import paperTradeService from '../../services/paperTradeService';
import { tierAccessService } from '../../services/tierAccessService';
import { useAuth } from '../../contexts/AuthContext';
import { useScanner } from '../../contexts/ScannerContext';
import { useUpgrade } from '../../hooks/useUpgrade';
import { COLORS, GRADIENTS, SPACING, TYPOGRAPHY, GLASS } from '../../utils/tokens';
import { formatPrice } from '../../utils/formatters';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_HEIGHT = 320;

const ScannerScreen = ({ navigation }) => {
  // Get user and tier from Auth Context
  const { user, userTier } = useAuth();

  // Tooltip hook for feature discovery
  const { showTooltipForScreen, initialized: tooltipInitialized } = useTooltip();

  // Upgrade hook for quota exceeded
  const { onQuotaReached, TIER_TYPES } = useUpgrade();

  // Get persisted scanner state from context
  const {
    scanResults,
    patterns,
    lastScanTime,
    selectedCoins,
    selectedTimeframe,
    multiTFResults,
    setScanResults,
    setPatterns,
    setLastScanTime,
    setSelectedCoins,
    setSelectedTimeframe,
    setMultiTFResults,
  } = useScanner();

  // State for max coins - derived from tier
  const [maxCoins, setMaxCoins] = useState(1000); // Default high for ADMIN

  // Set tier in tierAccessService AND patternDetection when tier changes
  useEffect(() => {
    if (userTier) {
      // Pass userId for database-backed quota tracking
      tierAccessService.setTier(userTier, user?.id);
      // CRITICAL: Also set tier in patternDetection for enhancement features
      patternDetection.setUserTier(userTier);
      const max = tierAccessService.getMaxCoins();
      // -1 means unlimited (TIER3/ADMIN), use 1000 as practical limit
      setMaxCoins(max === -1 ? 1000 : max);
      console.log('[ScannerScreen] User tier set to:', userTier, 'userId:', user?.id, 'maxCoins:', max);
    }
  }, [userTier, user?.id]);

  // Local state (not persisted)
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPrice, setCurrentPrice] = useState(null);
  const [priceChange, setPriceChange] = useState(null);

  // Paper Trade Modal State
  const [paperTradeModalVisible, setPaperTradeModalVisible] = useState(false);
  const [selectedPattern, setSelectedPattern] = useState(null);
  const [openPositionsCount, setOpenPositionsCount] = useState(0);

  // Positions refresh trigger
  const [positionsRefreshTrigger, setPositionsRefreshTrigger] = useState(0);

  // Zone Visualization State
  const [zones, setZones] = useState([]);
  const [zonePreferences, setZonePreferences] = useState(null);
  const [mtfAlignment, setMtfAlignment] = useState(null);
  const [showZones, setShowZones] = useState(true);

  // =====================================================
  // ZONE-PATTERN SYNC STATE (2-way linking)
  // =====================================================
  const [selectedZonePatternId, setSelectedZonePatternId] = useState(null); // Currently selected pattern/zone ID
  const [zoneDisplayMode, setZoneDisplayMode] = useState('all'); // 'all' | 'selected' | 'hidden' - Default to 'all'

  // Section order for drag & drop (scanResults first by default)
  const [sectionOrder, setSectionOrder] = useState(['scanResults', 'openPositions']);

  // SIMPLIFIED drag & drop - only translateY, no fade/scale
  const translateY1 = useSharedValue(0);
  const translateY2 = useSharedValue(0);
  const isDragging = useSharedValue(false);
  const activeDragSection = useSharedValue(0); // 0 = none, 1 = first, 2 = second
  const SWAP_THRESHOLD = 60;
  const SECTION_HEIGHT = 200; // Approximate section height for swap animation

  // Spring config for smooth animations
  const springConfig = {
    damping: 25,
    stiffness: 300,
    mass: 0.8,
  };

  // Swap sections
  const swapSections = useCallback(() => {
    setSectionOrder(prev =>
      prev[0] === 'scanResults'
        ? ['openPositions', 'scanResults']
        : ['scanResults', 'openPositions']
    );
  }, []);

  // Pan gesture for first section
  const panGesture1 = Gesture.Pan()
    .activateAfterLongPress(250)
    .onStart(() => {
      'worklet';
      isDragging.value = true;
      activeDragSection.value = 1;
    })
    .onUpdate((event) => {
      'worklet';
      // Dragged section follows finger
      translateY1.value = event.translationY;
      // Other section moves opposite (proportional)
      const progress = Math.min(Math.abs(event.translationY) / SWAP_THRESHOLD, 1);
      translateY2.value = event.translationY > 0 ? -progress * SECTION_HEIGHT * 0.5 : progress * SECTION_HEIGHT * 0.5;
    })
    .onEnd((event) => {
      'worklet';
      const shouldSwap = Math.abs(event.translationY) > SWAP_THRESHOLD;

      if (shouldSwap) {
        // Animate to swapped positions
        const direction = event.translationY > 0 ? 1 : -1;
        translateY1.value = withSpring(direction * SECTION_HEIGHT, springConfig, () => {
          // Reset positions after swap
          translateY1.value = 0;
          translateY2.value = 0;
          runOnJS(swapSections)();
        });
        translateY2.value = withSpring(-direction * SECTION_HEIGHT, springConfig);
      } else {
        // Spring back
        translateY1.value = withSpring(0, springConfig);
        translateY2.value = withSpring(0, springConfig);
      }

      isDragging.value = false;
      activeDragSection.value = 0;
    });

  // Pan gesture for second section
  const panGesture2 = Gesture.Pan()
    .activateAfterLongPress(250)
    .onStart(() => {
      'worklet';
      isDragging.value = true;
      activeDragSection.value = 2;
    })
    .onUpdate((event) => {
      'worklet';
      // Dragged section follows finger
      translateY2.value = event.translationY;
      // Other section moves opposite (proportional)
      const progress = Math.min(Math.abs(event.translationY) / SWAP_THRESHOLD, 1);
      translateY1.value = event.translationY > 0 ? progress * SECTION_HEIGHT * 0.5 : -progress * SECTION_HEIGHT * 0.5;
    })
    .onEnd((event) => {
      'worklet';
      const shouldSwap = Math.abs(event.translationY) > SWAP_THRESHOLD;

      if (shouldSwap) {
        // Animate to swapped positions
        const direction = event.translationY > 0 ? 1 : -1;
        translateY2.value = withSpring(direction * SECTION_HEIGHT, springConfig, () => {
          // Reset positions after swap
          translateY1.value = 0;
          translateY2.value = 0;
          runOnJS(swapSections)();
        });
        translateY1.value = withSpring(-direction * SECTION_HEIGHT, springConfig);
      } else {
        // Spring back
        translateY1.value = withSpring(0, springConfig);
        translateY2.value = withSpring(0, springConfig);
      }

      isDragging.value = false;
      activeDragSection.value = 0;
    });

  // Animated styles - simplified with subtle scale when dragging
  const animatedStyle1 = useAnimatedStyle(() => {
    const isActive = activeDragSection.value === 1;
    return {
      transform: [
        { translateY: translateY1.value },
        { scale: isActive ? 1.01 : 1 },
      ],
      zIndex: isActive ? 100 : 1,
      opacity: activeDragSection.value === 2 ? 0.85 : 1,
    };
  });

  const animatedStyle2 = useAnimatedStyle(() => {
    const isActive = activeDragSection.value === 2;
    return {
      transform: [
        { translateY: translateY2.value },
        { scale: isActive ? 1.01 : 1 },
      ],
      zIndex: isActive ? 100 : 1,
      opacity: activeDragSection.value === 1 ? 0.85 : 1,
    };
  });

  // NOTE: Multi-TF is now integrated into main scan via timeframesToScan

  // Selected timeframes from CoinSelector (TIER2/3)
  const [selectedScanTimeframes, setSelectedScanTimeframes] = useState([selectedTimeframe]);

  // Scan Quota State (database-backed)
  const [scanQuota, setScanQuota] = useState(null);

  // Check Multi-TF access based on tier
  const multiTFAccess = checkMultiTFAccess(userTier);
  const availableTimeframes = getAvailableTimeframesForTier(userTier);

  // Sponsor banners - use hook to fetch ALL banners for distribution
  const { banners: sponsorBanners, dismissBanner, userId } = useSponsorBanners('scanner', refreshing);

  // WebSocket ref
  const wsRef = useRef(null);
  // Track current expected symbol to prevent stale data from updating UI
  const currentSymbolRef = useRef(null);

  // Currently displayed coin (first selected)
  const displayCoin = selectedCoins[0] || 'BTCUSDT';

  // Subscribe to price updates
  useEffect(() => {
    subscribeToPrice(displayCoin);

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [displayCoin]);

  const subscribeToPrice = async (symbol) => {
    const targetSymbol = symbol.toUpperCase();

    // CRITICAL: Set expected symbol FIRST before any async operations
    currentSymbolRef.current = targetSymbol;
    console.log('[Scanner] Subscribing to:', targetSymbol);

    // Close existing WebSocket
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    // Reset price while switching to avoid showing stale data
    setCurrentPrice(null);
    setPriceChange(null);

    // FIRST: Fetch initial price via REST API immediately (don't wait for WebSocket)
    try {
      const response = await fetch(`https://fapi.binance.com/fapi/v1/ticker/24hr?symbol=${targetSymbol}`);
      const data = await response.json();

      // CRITICAL: Check if we're still expecting this symbol (prevents stale REST response)
      if (currentSymbolRef.current !== targetSymbol) {
        console.log('[Scanner] Ignoring stale REST response for:', targetSymbol, 'current:', currentSymbolRef.current);
        return; // Don't continue if user switched to another coin
      }

      if (data && data.lastPrice) {
        console.log('[Scanner] REST price for', targetSymbol, ':', data.lastPrice);
        setCurrentPrice(parseFloat(data.lastPrice));
        setPriceChange(parseFloat(data.priceChangePercent || 0));
      }
    } catch (restError) {
      console.warn('[Scanner] REST price fetch failed:', restError.message);
    }

    // Check again before creating WebSocket (user might have switched during REST call)
    if (currentSymbolRef.current !== targetSymbol) {
      console.log('[Scanner] Skipping WebSocket for stale symbol:', targetSymbol);
      return;
    }

    // THEN: Connect WebSocket for real-time updates (using FUTURES WebSocket)
    // Use fstream.binance.com for Futures perpetual contracts
    const ws = new WebSocket(
      `wss://fstream.binance.com/ws/${symbol.toLowerCase()}@ticker`
    );

    ws.onopen = () => {
      console.log('[Scanner] WebSocket connected for:', targetSymbol);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        // Verify the message is for the correct symbol (race condition fix)
        const messageSymbol = data.s?.toUpperCase();

        // Double check: both message symbol AND current expected symbol
        if (messageSymbol !== targetSymbol || currentSymbolRef.current !== targetSymbol) {
          console.log('[Scanner] Ignoring stale WS price from:', messageSymbol, 'expected:', currentSymbolRef.current);
          return;
        }

        setCurrentPrice(parseFloat(data.c));
        setPriceChange(parseFloat(data.P));
      } catch (e) {
        console.error('[Scanner] WebSocket parse error:', e);
      }
    };

    ws.onerror = (error) => {
      // WebSocket errors are common due to network issues - try REST fallback
      console.log('[Scanner] WebSocket error for:', targetSymbol, '- using REST fallback');
    };

    ws.onclose = () => {
      console.log('[Scanner] WebSocket closed for:', targetSymbol);
      // Auto-reconnect after 5 seconds if still on same symbol
      setTimeout(() => {
        // Use ref instead of displayCoin to avoid stale closure
        if (currentSymbolRef.current === targetSymbol && !wsRef.current) {
          console.log('[Scanner] Reconnecting WebSocket for:', targetSymbol);
          subscribeToPrice(targetSymbol);
        }
      }, 5000);
    };

    wsRef.current = ws;
  };

  // Handle Scan Now button - accepts optional coins array and timeframes from CoinSelector
  const handleScan = async (coinsToScan = null, timeframesToUse = null) => {
    console.log('[Scanner] handleScan called');
    console.log('[Scanner] coinsToScan param:', coinsToScan);
    console.log('[Scanner] selectedCoins context:', selectedCoins);
    console.log('[Scanner] timeframesToUse param:', timeframesToUse);

    // =====================================================
    // CHECK SCAN QUOTA FIRST (Database-backed)
    // =====================================================
    if (user?.id) {
      try {
        const quotaCheck = await tierAccessService.checkScanLimit();
        console.log('[Scanner] Quota check:', quotaCheck);

        if (!quotaCheck.allowed && !quotaCheck.unlimited) {
          const resetTime = quotaCheck.resetAt
            ? new Date(quotaCheck.resetAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
            : '00:00';

          // Show upgrade popup with tracking
          onQuotaReached(TIER_TYPES.SCANNER, 'scanner_scan_button');

          alertService.warning(
            'Hết lượt scan',
            `Bạn đã dùng hết ${quotaCheck.limit} lượt scan hôm nay.\n\nReset lúc: ${resetTime}\n\nNâng cấp để có thêm lượt scan!`
          );
          return;
        }
      } catch (quotaError) {
        console.error('[Scanner] Quota check error:', quotaError);
        // Continue scanning if quota check fails (graceful degradation)
      }
    }

    // Use provided coins or fall back to selectedCoins
    let coins = coinsToScan || selectedCoins;
    console.log('[Scanner] Coins to scan (after fallback):', coins);

    // Ensure coins is an array
    if (!Array.isArray(coins)) {
      console.error('[Scanner] coins is not an array:', coins);
      coins = [coins].filter(Boolean);
    }

    // Ensure all items are strings (symbol names)
    coins = coins.map(c => {
      if (typeof c === 'string') return c;
      if (c && typeof c === 'object' && c.symbol) return c.symbol;
      return null;
    }).filter(Boolean);

    if (coins.length === 0) {
      alertService.warning('Error', 'Please select at least one coin');
      return;
    }

    // Update selectedCoins if coins were passed from CoinSelector
    if (coinsToScan) {
      setSelectedCoins(coins);
    }

    // Update selected timeframes if passed from CoinSelector
    if (timeframesToUse && Array.isArray(timeframesToUse)) {
      setSelectedScanTimeframes(timeframesToUse);
    }

    try {
      setScanning(true);
      setPatterns([]);
      setScanResults([]);

      console.log('[Scanner] Starting scan...');
      console.log('[Scanner] Coins:', coins.length);
      console.log('[Scanner] Timeframe:', selectedTimeframe);

      const allPatterns = [];
      const resultsPerCoin = [];

      // OPTIMIZED: Adaptive batch size based on coin count
      // More coins = larger batches for faster completion
      const BATCH_SIZE = coins.length > 20 ? 30 : 15;

      // Use timeframes from CoinSelector (TIER2/3 users select their own)
      // For FREE/TIER1, only scan the current selected timeframe
      const timeframesToScan = timeframesToUse && timeframesToUse.length > 0
        ? timeframesToUse
        : (multiTFAccess.hasAccess ? selectedScanTimeframes : [selectedTimeframe]);

      console.log('[Scanner] Timeframes to scan:', timeframesToScan, '| Count:', timeframesToScan.length);

      for (let i = 0; i < coins.length; i += BATCH_SIZE) {
        const batch = coins.slice(i, i + BATCH_SIZE);
        console.log(`[Scanner] Scanning batch ${Math.floor(i/BATCH_SIZE) + 1}/${Math.ceil(coins.length/BATCH_SIZE)}: ${batch.length} coins`);

        // OPTIMIZED: Use Promise.allSettled for resilience - don't fail entire batch on one error
        const batchPromises = batch.map(async (symbol) => {
          try {
            // Add to recent (fire and forget)
            favoritesService.addRecent(symbol).catch(() => {});

            // Scan across timeframes for this coin
            const allPatternsForCoin = [];

            // OPTIMIZED: Scan timeframes in parallel for each coin
            const tfResults = await Promise.allSettled(
              timeframesToScan.map(tf => patternDetection.detectPatterns(symbol, tf))
            );

            tfResults.forEach(result => {
              if (result.status === 'fulfilled' && result.value?.length > 0) {
                allPatternsForCoin.push(...result.value);
              }
            });

            return {
              symbol,
              patterns: allPatternsForCoin,
              scannedAt: new Date(),
              timeframesScanned: timeframesToScan,
            };
          } catch (err) {
            console.log(`[Scanner] Error scanning ${symbol}:`, err.message);
            return {
              symbol,
              patterns: [],
              scannedAt: new Date(),
              error: err.message,
            };
          }
        });

        const batchResults = await Promise.allSettled(batchPromises);

        // Extract successful results
        batchResults.forEach(result => {
          if (result.status === 'fulfilled') {
            resultsPerCoin.push(result.value);
            if (result.value.patterns?.length > 0) {
              allPatterns.push(...result.value.patterns);
            }
          }
        });
      }

      // Sort patterns by confidence
      allPatterns.sort((a, b) => b.confidence - a.confidence);

      // =====================================================
      // ENRICH PATTERNS WITH UNIQUE IDs (for zone-pattern linking)
      // ⚠️ CRITICAL: Use content-based ID, NOT index-based
      // This ensures zones and UI patterns have matching IDs
      // =====================================================
      const generatePatternId = (p) => {
        // Use pattern properties to create a unique ID
        // Format: symbol_type_timeframe_entry_sl (entry & sl make it unique)
        const entryVal = parseFloat(p.entry || p.entryPrice || p.price || 0) || 0;
        const slVal = parseFloat(p.stopLoss || p.stop_loss || 0) || 0;
        const entry = entryVal.toFixed(6);
        const sl = slVal.toFixed(6);
        return `${p.symbol}_${p.name || p.type}_${p.timeframe || selectedTimeframe}_${entry}_${sl}`;
      };

      const enrichedPatterns = allPatterns.map((p) => ({
        ...p,
        pattern_id: generatePatternId(p),
      }));

      // Sort results - coins with patterns first
      resultsPerCoin.sort((a, b) => {
        const aHas = a.patterns.length > 0 ? 1 : 0;
        const bHas = b.patterns.length > 0 ? 1 : 0;
        return bHas - aHas;
      });

      // Also enrich patterns in resultsPerCoin - SAME ID generation!
      const enrichedResults = resultsPerCoin.map(result => ({
        ...result,
        patterns: result.patterns.map((p) => ({
          ...p,
          pattern_id: generatePatternId(p),
        })),
      }));

      setPatterns(enrichedPatterns);
      setScanResults(enrichedResults);
      setLastScanTime(new Date());

      // Reset zone-pattern selection on new scan - default to show all
      setSelectedZonePatternId(null);
      setZoneDisplayMode('all');

      console.log('[Scanner] Scan complete. Patterns found:', enrichedPatterns.length);
      console.log('[Scanner] Results per coin:', enrichedResults.length);

      // =====================================================
      // CREATE ZONES FROM PATTERNS (Zone Visualization)
      // ALWAYS create zones for display - tier controls features (rectangles, persistence)
      // =====================================================
      if (enrichedPatterns.length > 0) {
        try {
          console.log('[Scanner] Creating zones from patterns...');
          console.log('[Scanner] Zone viz enabled:', tierAccessService.isZoneVisualizationEnabled());
          console.log('[Scanner] User tier:', userTier);

          const createdZones = await zoneManager.createZonesFromPatterns(
            enrichedPatterns, // Pass enriched patterns with IDs
            displayCoin,
            selectedTimeframe,
            user?.id
          );
          setZones(createdZones);
          console.log('[Scanner] Zones created:', createdZones.length);

          // Calculate MTF alignment if enabled
          if (tierAccessService.canUseMTFAlignment()) {
            try {
              const alignment = await mtfAlignmentService.calculateMTFAlignment(
                displayCoin,
                user?.id,
                userTier
              );
              setMtfAlignment(alignment);
              console.log('[Scanner] MTF alignment calculated:', alignment?.recommendation);
            } catch (mtfError) {
              console.log('[Scanner] MTF alignment error:', mtfError.message);
            }
          }
        } catch (zoneError) {
          console.log('[Scanner] Zone creation error:', zoneError.message);
        }
      } else {
        setZones([]);
        setMtfAlignment(null);
      }

      // =====================================================
      // INCREMENT SCAN QUOTA (Database-backed)
      // =====================================================
      if (user?.id) {
        try {
          const incrementResult = await tierAccessService.incrementScanCount();
          console.log('[Scanner] Quota incremented:', incrementResult);

          if (incrementResult.limitReached) {
            alertService.info(
              'Thông báo',
              `Bạn đã dùng hết lượt scan hôm nay (${incrementResult.used}/${incrementResult.used + incrementResult.remaining}).`
            );
          }
        } catch (incError) {
          console.error('[Scanner] Quota increment error:', incError);
          // Don't fail scan, just log
        }
      }

      // NOTE: Multi-TF functionality is now integrated into the main scan
      // The main scan already handles multiple timeframes via timeframesToScan
      // Results are shown in ScanResultsSection grouped by coin with timeframe labels

    } catch (error) {
      console.error('[Scanner] Scan error:', error);
      alertService.error('Error', 'Failed to scan. Please try again.');
    } finally {
      setScanning(false);
    }
  };

  // Pull to refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await handleScan();
    setRefreshing(false);
  }, [selectedCoins, selectedTimeframe]);

  const handlePatternPress = (pattern) => {
    navigation.navigate('PatternDetail', { pattern });
  };

  // Paper Trade handlers
  const handlePaperTrade = (pattern) => {
    setSelectedPattern(pattern);
    setPaperTradeModalVisible(true);
  };

  const handlePaperTradeSuccess = async () => {
    // Close modal and clear pattern first
    setPaperTradeModalVisible(false);
    setSelectedPattern(null);

    // Refresh open positions count and trigger OpenPositionsSection reload
    // Wrap in try-catch to prevent unhandled errors from crashing the app
    try {
      const userId = user?.id || null;
      await paperTradeService.init(userId);
      setOpenPositionsCount(paperTradeService.getOpenPositions(userId).length);
      // IMPORTANT: Trigger refresh for OpenPositionsSection to show new position immediately
      setPositionsRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.warn('[ScannerScreen] handlePaperTradeSuccess error:', error?.message);
    }
  };

  const handleViewOpenPositions = () => {
    navigation.navigate('OpenPositions');
  };

  // Load open positions count on mount with CLOUD SYNC
  useEffect(() => {
    const loadPositionsCount = async () => {
      const userId = user?.id || null;
      await paperTradeService.init(userId);
      setOpenPositionsCount(paperTradeService.getOpenPositions(userId).length);
    };
    loadPositionsCount();
  }, [user?.id]);

  // Load scan quota on mount and after each scan
  useEffect(() => {
    const loadQuota = async () => {
      if (user?.id) {
        try {
          const quota = await tierAccessService.checkScanLimit();
          setScanQuota(quota);
          console.log('[Scanner] Quota loaded:', quota);
        } catch (err) {
          console.warn('[Scanner] Failed to load quota:', err);
        }
      }
    };
    loadQuota();
  }, [user?.id, lastScanTime]); // Refresh after each scan

  // Show tooltips for first-time users
  useEffect(() => {
    if (tooltipInitialized && user?.id) {
      // Delay slightly to allow screen to render
      const timer = setTimeout(() => {
        showTooltipForScreen('scanner', { tier: userTier });
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [tooltipInitialized, user?.id, userTier, showTooltipForScreen]);

  // Handle selecting coin from scan results
  // NOTE: Only update state - useEffect will handle subscribeToPrice automatically
  // This prevents race condition that causes price flickering
  const handleSelectFromResults = (symbol) => {
    setSelectedCoins([symbol]);
    // Don't call subscribeToPrice here - useEffect handles it when displayCoin changes
  };

  // formatPrice is now imported from utils/formatters

  // Handle coin selection change
  const handleCoinsChange = (coins) => {
    setSelectedCoins(coins);
  };

  return (
    <LinearGradient
      colors={GRADIENTS.background}
      locations={GRADIENTS.backgroundLocations}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.gold}
              colors={[COLORS.gold]}
              progressViewOffset={100}
            />
          }
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled={true}
          scrollEventThrottle={16}
        >
          {/* 1. Top Row: Coin Selector + Positions Button */}
          <View style={styles.topRow}>
            <View style={styles.coinSelectorWrapper}>
              <CoinSelector
                selected={displayCoin}
                onSelect={(coin) => setSelectedCoins([coin])}
                multiSelect={true}
                selectedCoins={selectedCoins}
                onCoinsChange={handleCoinsChange}
                maxSelection={maxCoins}
                userTier={userTier}
                onScanNow={handleScan}
                isScanning={scanning}
                selectedTimeframe={selectedTimeframe}
                onTimeframesChange={setSelectedScanTimeframes}
              />
            </View>
            <TouchableOpacity
              style={styles.positionsButton}
              onPress={handleViewOpenPositions}
              activeOpacity={0.8}
            >
              <Briefcase size={18} color={COLORS.purple} />
              <Text style={styles.positionsButtonText}>
                {openPositionsCount > 0 ? `(${openPositionsCount})` : ''}
              </Text>
            </TouchableOpacity>
          </View>

          {/* 2. Scan Status Row + Scan Button (Multi-TF auto for TIER2/3) */}
          <View style={styles.scanRow}>
            <View style={styles.statusLeft}>
              <Search size={14} color={COLORS.textMuted} />
              <Text style={styles.statusText}>
                {patterns.length} patterns
              </Text>
              <View style={styles.liveBadge}>
                <Zap size={12} color={COLORS.success} />
                <Text style={styles.liveText}>LIVE</Text>
              </View>
              {/* Show Multi-TF badge if user has access */}
              {multiTFAccess.hasAccess && (
                <View style={styles.multiTFBadge}>
                  <Layers size={10} color={COLORS.gold} />
                  <Text style={styles.multiTFBadgeText}>Multi-TF</Text>
                </View>
              )}

              {/* Scan Quota Badge */}
              {scanQuota && !scanQuota.unlimited && (
                <View style={[
                  styles.quotaBadge,
                  scanQuota.remaining <= 0 && styles.quotaBadgeEmpty,
                  scanQuota.remaining > 0 && scanQuota.remaining <= 3 && styles.quotaBadgeLow,
                ]}>
                  <Text style={[
                    styles.quotaBadgeText,
                    scanQuota.remaining <= 0 && styles.quotaBadgeTextEmpty,
                  ]}>
                    {scanQuota.remaining}/{scanQuota.limit}
                  </Text>
                </View>
              )}
              {scanQuota?.unlimited && (
                <View style={styles.quotaBadgeUnlimited}>
                  <Text style={styles.quotaBadgeTextUnlimited}>∞</Text>
                </View>
              )}
            </View>

            <TouchableOpacity
              style={[styles.scanButton, scanning && styles.scanButtonDisabled]}
              onPress={() => handleScan()}
              disabled={scanning}
              activeOpacity={0.8}
            >
              {scanning ? (
                <>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text style={styles.scanButtonText}>Scanning...</Text>
                </>
              ) : (
                <>
                  <Search size={16} color="#FFFFFF" />
                  <Text style={styles.scanButtonText}>Scan Now</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* 3. Coin Name + Price Section - COMPACT */}
          <View style={styles.priceSection}>
            <View style={styles.priceRowCompact}>
              <View style={styles.coinInfoCompact}>
                <View style={styles.coinIconSmall}>
                  <Text style={styles.coinIconTextSmall}>{displayCoin.replace('USDT', '').charAt(0)}</Text>
                </View>
                <Text style={styles.coinNameCompact}>{displayCoin.replace('USDT', '')}</Text>
              </View>
              <Text style={styles.priceValueCompact}>${formatPrice(currentPrice)}</Text>
              {priceChange !== null && (
                <View style={[
                  styles.priceChangeBadgeCompact,
                  priceChange >= 0 ? styles.priceUp : styles.priceDown,
                ]}>
                  {priceChange >= 0 ? (
                    <TrendingUp size={12} color="#FFFFFF" />
                  ) : (
                    <TrendingDown size={12} color="#FFFFFF" />
                  )}
                  <Text style={styles.priceChangeTextCompact}>
                    {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2).replace('.', ',')}%
                  </Text>
                </View>
              )}
              {lastScanTime && (
                <Text style={styles.lastScanCompact}>
                  {lastScanTime.toLocaleTimeString('vi-VN')}
                </Text>
              )}
            </View>
          </View>

          {/* 4. TradingView Chart - with timeframe selector + toolbar inside */}
          <TradingChart
            symbol={displayCoin}
            timeframe={selectedTimeframe}
            height={CHART_HEIGHT}
            onSymbolPress={() => {/* Could open coin selector */}}
            selectedPattern={selectedPattern}
            patterns={scanResults.find(r => r.symbol === displayCoin)?.patterns || []}
            positionsRefreshTrigger={positionsRefreshTrigger}
            zones={(() => {
              // =====================================================
              // ZONE FILTERING based on zoneDisplayMode + current coin
              // =====================================================
              console.log('[ZONE-DEBUG] showZones:', showZones);
              console.log('[ZONE-DEBUG] zoneDisplayMode:', zoneDisplayMode);
              console.log('[ZONE-DEBUG] zones.length:', zones.length);
              console.log('[ZONE-DEBUG] displayCoin:', displayCoin);
              console.log('[ZONE-DEBUG] selectedZonePatternId:', selectedZonePatternId);

              if (!showZones || zoneDisplayMode === 'hidden') return [];

              // ⚠️ ALWAYS filter by current displayCoin first (zones belong to specific coins)
              const coinZones = zones.filter(z => z.symbol === displayCoin);
              console.log('[ZONE-DEBUG] coinZones for', displayCoin, ':', coinZones.length);

              if (zoneDisplayMode === 'all') return coinZones;

              // 'selected' mode - show only the selected zone
              if (selectedZonePatternId) {
                const filtered = coinZones.filter(z =>
                  z.pattern_id === selectedZonePatternId ||
                  z.metadata?.patternData?.pattern_id === selectedZonePatternId
                );
                console.log('[ZONE-DEBUG] filtered zones:', filtered.length);
                return filtered;
              }
              return []; // No selection = no zones
            })()}
            zonePreferences={zonePreferences}
            selectedZonePatternId={selectedZonePatternId}
            onZonePress={(zone) => {
              console.log('[Scanner] Zone pressed:', zone.pattern_id || zone.id);
              // Sync with pattern list
              const patternId = zone.pattern_id || zone.metadata?.patternData?.pattern_id;
              if (patternId) {
                setSelectedZonePatternId(patternId);
              }
            }}
          />

          {/* MTF Alignment Panel (TIER2+) */}
          {mtfAlignment && tierAccessService.canUseMTFAlignment() && (
            <View style={styles.mtfPanel}>
              <MTFAlignmentPanel
                symbol={displayCoin}
                alignment={mtfAlignment}
                compact
                onExpand={() => {
                  navigation.navigate('MTFDashboard', {
                    symbol: displayCoin,
                    alignment: mtfAlignment,
                  });
                }}
              />
            </View>
          )}

          {/* First Section (based on order) */}
          <Animated.View style={[styles.sectionWrapper, animatedStyle1]}>
            {sectionOrder[0] === 'scanResults' ? (
              <ScanResultsSection
                results={scanResults}
                isScanning={scanning}
                onSelectCoin={handleSelectFromResults}
                onSelectPattern={(pattern) => {
                  console.log('[PATTERN-SELECT] pattern.pattern_id:', pattern.pattern_id);
                  console.log('[PATTERN-SELECT] pattern.entry:', pattern.entry, 'entryPrice:', pattern.entryPrice);
                  setSelectedCoins([pattern.symbol]);
                  // Don't call subscribeToPrice - useEffect handles it
                  if (pattern.timeframe) {
                    setSelectedTimeframe(pattern.timeframe);
                  }
                  setSelectedPattern(pattern);
                  // ⚠️ ZONE-PATTERN SYNC: Update selected zone pattern ID
                  setSelectedZonePatternId(pattern.pattern_id);
                  setZoneDisplayMode('selected'); // Show only this zone
                }}
                onPaperTrade={handlePaperTrade}
                selectedCoin={displayCoin}
                selectedPatternId={selectedZonePatternId}
                userTier={userTier}
                // ⚠️ ZONE TOGGLE PROPS
                zoneDisplayMode={zoneDisplayMode}
                onZoneDisplayModeChange={setZoneDisplayMode}
                onClearZoneSelection={() => setSelectedZonePatternId(null)}
              />
            ) : (
              <OpenPositionsSection
                userId={user?.id}
                navigation={navigation}
                refreshTrigger={positionsRefreshTrigger}
                onViewAllPress={handleViewOpenPositions}
                onViewChart={(symbol) => {
                  setSelectedCoins([symbol]);
                  // Don't call subscribeToPrice - useEffect handles it
                }}
                onPositionClose={() => {
                  setPositionsRefreshTrigger(prev => prev + 1);
                  setOpenPositionsCount(paperTradeService.getOpenPositions(user?.id).length);
                }}
              />
            )}

            {/* Drag Handle */}
            <GestureDetector gesture={panGesture1}>
              <Animated.View style={styles.sectionDragHandle}>
                <GripVertical size={16} color={COLORS.textMuted} />
              </Animated.View>
            </GestureDetector>
          </Animated.View>

          {/* Second Section (based on order) */}
          <Animated.View style={[styles.sectionWrapper, animatedStyle2]}>
            {sectionOrder[1] === 'scanResults' ? (
              <ScanResultsSection
                results={scanResults}
                isScanning={scanning}
                onSelectCoin={handleSelectFromResults}
                onSelectPattern={(pattern) => {
                  console.log('[PATTERN-SELECT] pattern.pattern_id:', pattern.pattern_id);
                  console.log('[PATTERN-SELECT] pattern.entry:', pattern.entry, 'entryPrice:', pattern.entryPrice);
                  setSelectedCoins([pattern.symbol]);
                  // Don't call subscribeToPrice - useEffect handles it
                  if (pattern.timeframe) {
                    setSelectedTimeframe(pattern.timeframe);
                  }
                  setSelectedPattern(pattern);
                  // ⚠️ ZONE-PATTERN SYNC: Update selected zone pattern ID
                  setSelectedZonePatternId(pattern.pattern_id);
                  setZoneDisplayMode('selected'); // Show only this zone
                }}
                onPaperTrade={handlePaperTrade}
                selectedCoin={displayCoin}
                selectedPatternId={selectedZonePatternId}
                userTier={userTier}
                // ⚠️ ZONE TOGGLE PROPS
                zoneDisplayMode={zoneDisplayMode}
                onZoneDisplayModeChange={setZoneDisplayMode}
                onClearZoneSelection={() => setSelectedZonePatternId(null)}
              />
            ) : (
              <OpenPositionsSection
                userId={user?.id}
                navigation={navigation}
                refreshTrigger={positionsRefreshTrigger}
                onViewAllPress={handleViewOpenPositions}
                onViewChart={(symbol) => {
                  setSelectedCoins([symbol]);
                  // Don't call subscribeToPrice - useEffect handles it
                }}
                onPositionClose={() => {
                  setPositionsRefreshTrigger(prev => prev + 1);
                  setOpenPositionsCount(paperTradeService.getOpenPositions(user?.id).length);
                }}
              />
            )}

            {/* Drag Handle */}
            <GestureDetector gesture={panGesture2}>
              <Animated.View style={styles.sectionDragHandle}>
                <GripVertical size={16} color={COLORS.textMuted} />
              </Animated.View>
            </GestureDetector>
          </Animated.View>

          {/* NOTE: Multi-TF functionality is now integrated into main scan results above */}

          {/* Empty State - Only show when not scanning and no results */}
          {!scanning && scanResults.length === 0 && (
            <View style={styles.emptyContainer}>
              <AlertCircle size={48} color={COLORS.textMuted} />
              <Text style={styles.emptyTitle}>Chưa Có Kết Quả</Text>
              <Text style={styles.emptyText}>
                Nhấn "Scan Now" để quét pattern
              </Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={() => handleScan()}
              >
                <RefreshCw size={18} color={COLORS.purple} />
                <Text style={styles.retryText}>Scan Now</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Sponsor Banners - distributed */}
          {sponsorBanners.map((banner) => (
            <SponsorBanner
              key={banner.id}
              banner={banner}
              navigation={navigation}
              userId={userId}
              onDismiss={dismissBanner}
            />
          ))}

          {/* Bottom spacing for tab bar */}
          <View style={{ height: 120 }} />
        </ScrollView>

        {/* Paper Trade Modal V2 - Enhanced Binance-style UI */}
        <PaperTradeModalV2
          visible={paperTradeModalVisible}
          pattern={selectedPattern}
          symbol={selectedPattern?.symbol || selectedCoins?.[0] || 'BTCUSDT'}
          baseAsset={selectedPattern?.baseAsset || selectedPattern?.symbol?.replace(/USDT$/, '') || 'BTC'}
          currentPrice={currentPrice || 0}
          mode={selectedPattern ? 'pattern' : 'custom'}
          onClose={handlePaperTradeSuccess}
        />
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },

  // 1. Top Row: Coin Selector + Positions
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  coinSelectorWrapper: {
    flex: 1,
  },
  positionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(106, 91, 255, 0.2)',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.4)',
  },
  positionsButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },

  // 2. Scan Row - Status + Button
  scanRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: 'rgba(106, 91, 255, 0.08)',
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusText: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(106, 91, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginLeft: 4,
  },
  liveText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.purple,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.burgundy,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.5)',
  },
  scanButtonDisabled: {
    opacity: 0.7,
  },
  scanButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Multi-TF Badge (shows for TIER2/3 users)
  multiTFBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(106, 91, 255, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    marginLeft: 4,
  },
  multiTFBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.purple,
  },

  // Quota Badge Styles - Unified purple theme
  quotaBadge: {
    backgroundColor: 'rgba(106, 91, 255, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginLeft: 4,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.3)',
  },
  quotaBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.purple,
  },
  quotaBadgeLow: {
    backgroundColor: 'rgba(255, 189, 89, 0.15)',
    borderColor: 'rgba(255, 189, 89, 0.3)',
  },
  quotaBadgeEmpty: {
    backgroundColor: 'rgba(255, 107, 107, 0.15)',
    borderColor: 'rgba(255, 107, 107, 0.3)',
  },
  quotaBadgeTextEmpty: {
    color: COLORS.error,
  },
  quotaBadgeUnlimited: {
    backgroundColor: 'rgba(255, 189, 89, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginLeft: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.3)',
  },
  quotaBadgeTextUnlimited: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.gold,
  },

  // 3. Price Section - COMPACT (single row)
  priceSection: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    backgroundColor: 'rgba(106, 91, 255, 0.05)',
  },
  priceRowCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  coinInfoCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  coinIconSmall: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(106, 91, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  coinIconTextSmall: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  coinNameCompact: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  priceValueCompact: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.gold,
  },
  priceChangeBadgeCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 3,
  },
  priceUp: {
    backgroundColor: COLORS.success,
  },
  priceDown: {
    backgroundColor: COLORS.error,
  },
  priceChangeTextCompact: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  lastScanCompact: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginLeft: 'auto',
  },

  // MTF Alignment Panel
  mtfPanel: {
    marginHorizontal: SPACING.md,
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
  },

  // Section wrapper with drag handle
  sectionWrapper: {
    position: 'relative',
    marginHorizontal: SPACING.sm,
    marginBottom: SPACING.xs,
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    backgroundColor: 'transparent',
  },

  // Drag handle for section reordering - inside rounded corners
  sectionDragHandle: {
    position: 'absolute',
    left: 4,
    top: 20,
    width: 20,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(106, 91, 255, 0.3)',
    borderRadius: 6,
    zIndex: 10,
  },

  // Empty State
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    marginHorizontal: SPACING.lg,
    backgroundColor: 'rgba(15, 16, 48, 0.6)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.25)',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 8,
    textAlign: 'center',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(106, 91, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.3)',
    gap: 8,
  },
  retryText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.purple,
  },
});

export default ScannerScreen;
