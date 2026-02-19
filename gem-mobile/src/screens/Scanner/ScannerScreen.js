/**
 * GEM Mobile - Scanner Screen (Giao Dich)
 * Full pattern detection with TradingView chart + Scan Now button
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
  DeviceEventEmitter,
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
  Building2,
  ArrowRight,
} from 'lucide-react-native';
// Note: Using simple state swap for sections instead of DraggableFlatList
// to avoid scroll conflicts with parent ScrollView

import CoinSelector from './components/CoinSelector';
import TradingChart from './components/TradingChart';
import ScanResultsSection from './components/ScanResultsSection';
// V2 Paper Trade Modal with enhanced Binance-style UI
import { PaperTradeModalV2, OpenPositionsSection } from '../../components/Trading';
import { AdminAIBubble } from '../../components/AdminAI';
import { MultiZoneOverlay } from '../../components/Scanner';
import { useSponsorBanners } from '../../components/SponsorBannerSection';
import SponsorBanner from '../../components/SponsorBanner';
import { useTooltip } from '../../components/Common/TooltipProvider';
import { patternDetection } from '../../services/patternDetection';
import zoneManager from '../../services/zoneManager';
// Scanner V2 Enhancements
import { applyV2Enhancements, shouldRejectPattern } from '../../services/scanner/patternEnhancerV2';
import { getMergedConfig } from '../../services/scanner/scannerConfigService';
import { hasAccess } from '../../constants/scannerAccess';
// MTF Service removed - integrated into main scan
import {
  checkMultiTFAccess,
  getAvailableTimeframesForTier,
  analyzeMultiTFResults,
  calculatePatternTimeframeStrength,
  PATTERN_STRENGTH_RANKING,
  TIMEFRAME_STRENGTH,
} from '../../services/multiTimeframeScanner';
import { binanceService } from '../../services/binanceService';
import { favoritesService } from '../../services/favoritesService';
import paperTradeService from '../../services/paperTradeService';
import { tierAccessService } from '../../services/tierAccessService';
import { exchangeAffiliateService } from '../../services/exchangeAffiliateService';
import { useAuth } from '../../contexts/AuthContext';
import { useScanner } from '../../contexts/ScannerContext';
import { useUpgrade } from '../../hooks/useUpgrade';
import { COLORS, GRADIENTS, SPACING, TYPOGRAPHY, GLASS } from '../../utils/tokens';
import { formatPrice } from '../../utils/formatters';
import { StateView } from '../../components/Common';
import { FORCE_REFRESH_EVENT } from '../../utils/loadingStateManager';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_HEIGHT = 320;

// Fetch with timeout to prevent hanging requests on stalled mobile connections
const fetchWithTimeout = async (url, timeoutMs = 10000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeoutMs}ms`);
    }
    throw error;
  }
};

const ScannerScreen = ({ navigation }) => {
  // Get user and tier from Auth Context
  const { user, userTier, isAdmin } = useAuth();

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
    zones,
    setScanResults,
    setPatterns,
    setLastScanTime,
    setSelectedCoins,
    setSelectedTimeframe,
    setMultiTFResults,
    setZones,
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
  const [scanError, setScanError] = useState(null); // C9 FIX: Error state for scan failures
  const scanIdRef = useRef(0); // Track scan generation to prevent old scan's finally from interfering

  // Paper Trade Modal State
  const [paperTradeModalVisible, setPaperTradeModalVisible] = useState(false);
  const [selectedPattern, setSelectedPattern] = useState(null);
  const [openPositionsCount, setOpenPositionsCount] = useState(0);

  // Positions refresh trigger
  const [positionsRefreshTrigger, setPositionsRefreshTrigger] = useState(0);

  // Zone Visualization State (zones from ScannerContext)
  const [zonePreferences, setZonePreferences] = useState(null);
  // MTF state removed - integrated into main scan
  const [showZones, setShowZones] = useState(true);

  // =====================================================
  // ZONE-PATTERN SYNC STATE (2-way linking)
  // =====================================================
  const [selectedZonePatternId, setSelectedZonePatternId] = useState(null); // Currently selected pattern/zone ID
  const [zoneDisplayMode, setZoneDisplayMode] = useState('all'); // 'all' | 'selected' | 'hidden' - Default to 'all'

  // =====================================================
  // POSITION ZONE STATE - Show zone from open position
  // =====================================================
  const [selectedPosition, setSelectedPosition] = useState(null); // Currently selected position
  const [showPositionZone, setShowPositionZone] = useState(true); // Toggle for position zone visibility
  const [zoneViewSource, setZoneViewSource] = useState(null); // 'position' | 'scan' | null - tracks where zones come from

  // =====================================================
  // EXCHANGE AFFILIATE STATE - Show CTA for users without exchange
  // =====================================================
  const [hasExchangeAccount, setHasExchangeAccount] = useState(true); // Default true to hide banner until checked

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

  // Reset zone display mode when coin changes to show all zones for new coin
  useEffect(() => {
    console.log('[Scanner] displayCoin changed to:', displayCoin, '- resetting zoneDisplayMode to all');
    setZoneDisplayMode('all');
    setSelectedZonePatternId(null);
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
      const response = await fetchWithTimeout(`https://fapi.binance.com/fapi/v1/ticker/24hr?symbol=${targetSymbol}`);
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
    // ADMIN users have unlimited scans - skip quota check
    // Add timeout to prevent hanging if Supabase is slow
    // =====================================================
    const isAdminUser = userTier === 'ADMIN' || userTier === 'admin';
    console.log('[Scanner] User tier:', userTier, '| isAdmin:', isAdminUser);

    if (user?.id && !isAdminUser) {
      try {
        // Wrap quota check with 3 second timeout
        const quotaCheckPromise = tierAccessService.checkScanLimit();
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Quota check timeout')), 3000)
        );

        const quotaCheck = await Promise.race([quotaCheckPromise, timeoutPromise]);
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
        console.warn('[Scanner] Quota check skipped (timeout or error):', quotaError?.message);
        // Continue scanning if quota check fails or times out (graceful degradation)
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

    // Track this scan's ID — if FORCE_REFRESH or another scan starts, this ID becomes stale
    const currentScanId = ++scanIdRef.current;

    try {
      // B11 FIX: Clear candle cache before new scan to ensure fresh data
      binanceService.clearCandleCache();

      setScanning(true);
      setScanError(null);               // C9 FIX: Clear error on new scan
      setSelectedPosition(null);        // Clear position when scanning
      setShowPositionZone(false);
      setZoneViewSource('scan');         // Mark source as scan
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
        // Bail out early if scan was superseded by FORCE_REFRESH or new scan
        if (scanIdRef.current !== currentScanId) {
          console.log('[Scanner] Scan superseded mid-batch, aborting');
          break;
        }
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
            // B10 FIX: Pass userTier explicitly instead of relying on singleton state
            const tfResults = await Promise.allSettled(
              timeframesToScan.map(tf => patternDetection.detectPatterns(symbol, tf, userTier))
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
      // V2 ENHANCEMENTS: Quick confidence recalculation
      // Full V2 (MTF, Volume API) calculated on pattern detail
      // =====================================================
      const getV2QuickSummary = (pattern) => {
        // Volume grade based on existing volumeRatio
        const volumeRatio = pattern.volumeRatio || pattern.enhancements?.volume?.ratio || 0;
        const volumeGrade = volumeRatio >= 2.0 ? 'STRONG' : volumeRatio >= 1.5 ? 'GOOD' : volumeRatio >= 1.2 ? 'ACCEPTABLE' : volumeRatio >= 1.0 ? 'MINIMUM' : 'WEAK';

        // Confidence grade
        const conf = pattern.confidence || 0;
        const confGrade = conf >= 85 ? 'A+' : conf >= 75 ? 'A' : conf >= 65 ? 'B+' : conf >= 55 ? 'B' : 'C';

        return {
          version: 2,
          userTier,
          validations: {
            volume: hasAccess(userTier, 'volumeValidation')
              ? { valid: volumeRatio >= 1.0, grade: volumeGrade, volumeRatio }
              : { locked: true, requiredTier: 1 },
            zoneRetest: hasAccess(userTier, 'zoneRetest')
              ? { pending: true } // Calculated on detail view
              : { locked: true, requiredTier: 1 },
            htfAlignment: hasAccess(userTier, 'mtfAnalysis')
              ? { pending: true } // Requires API call, done on detail view
              : { locked: true, requiredTier: 2 },
            swingQuality: hasAccess(userTier, 'swingQuality')
              ? { pending: true }
              : { locked: true, requiredTier: 2 },
          },
          confidence: {
            score: pattern.confidence,
            grade: confGrade,
          },
          warnings: [],
        };
      };

      // =====================================================
      // ENRICH PATTERNS WITH UNIQUE IDs (for zone-pattern linking)
      // ⚠️ CRITICAL: Use content-based ID, NOT index-based
      // This ensures zones and UI patterns have matching IDs
      // =====================================================
      const generatePatternId = (p) => {
        // Use pattern properties to create a unique ID
        // Format: symbol_type_timeframe_entry_sl (entry & sl make it unique)
        // ⚠️ FIX: Check patternType first (used by Ascending Triangle, Double Top, etc.)
        const entryVal = parseFloat(p.entry || p.entryPrice || p.price || 0) || 0;
        const slVal = parseFloat(p.stopLoss || p.stop_loss || 0) || 0;
        const entry = entryVal.toFixed(6);
        const sl = slVal.toFixed(6);
        const patternName = p.patternType || p.name || p.type || 'unknown';
        return `${p.symbol}_${patternName}_${p.timeframe || selectedTimeframe}_${entry}_${sl}`;
      };

      const enrichedPatterns = allPatterns.map((p) => {
        const v2Summary = getV2QuickSummary(p);
        const volRatio = p.enhancements?.volume?.ratio || 0;

        // Calculate pattern-timeframe strength
        const patternType = p.patternName || p.pattern || p.type || p.patternType;
        const strengthAnalysis = calculatePatternTimeframeStrength(patternType, p.timeframe);

        return {
          ...p,
          pattern_id: generatePatternId(p),
          // V2 enhancements for TIER 1+ users
          v2: v2Summary,
          hasV2Enhancements: userTier >= 1,
          confidenceGrade: v2Summary.confidence.grade,
          volumeRatio: volRatio, // Hoist to top level for easy access
          volumeValid: hasAccess(userTier, 'volumeValidation') ? volRatio >= 1.0 : undefined,
          volumeGrade: hasAccess(userTier, 'volumeValidation') ? v2Summary.validations.volume.grade : undefined,
          // Pattern-Timeframe strength analysis
          strengthAnalysis,
          combinedScore: strengthAnalysis.combinedScore,
          adjustedWinRate: strengthAnalysis.adjustedWinRate,
          patternTier: strengthAnalysis.patternTier,
        };
      });

      // Sort results - coins with patterns first
      resultsPerCoin.sort((a, b) => {
        const aHas = a.patterns.length > 0 ? 1 : 0;
        const bHas = b.patterns.length > 0 ? 1 : 0;
        return bHas - aHas;
      });

      // Also enrich patterns in resultsPerCoin - SAME ID generation + V2!
      const enrichedResults = resultsPerCoin.map(result => ({
        ...result,
        patterns: result.patterns.map((p) => {
          const v2Summary = getV2QuickSummary(p);
          const volRatio = p.enhancements?.volume?.ratio || 0;

          // Calculate pattern-timeframe strength
          const patternType = p.patternName || p.pattern || p.type || p.patternType;
          const strengthAnalysis = calculatePatternTimeframeStrength(patternType, p.timeframe);

          return {
            ...p,
            pattern_id: generatePatternId(p),
            // V2 enhancements for TIER 1+ users
            v2: v2Summary,
            hasV2Enhancements: userTier >= 1,
            confidenceGrade: v2Summary.confidence.grade,
            volumeRatio: volRatio, // Hoist to top level for easy access
            volumeValid: hasAccess(userTier, 'volumeValidation') ? volRatio >= 1.0 : undefined,
            volumeGrade: hasAccess(userTier, 'volumeValidation') ? v2Summary.validations.volume.grade : undefined,
            // Pattern-Timeframe strength analysis
            strengthAnalysis,
            combinedScore: strengthAnalysis.combinedScore,
            adjustedWinRate: strengthAnalysis.adjustedWinRate,
            patternTier: strengthAnalysis.patternTier,
          };
        }),
      }));

      // Sort enrichedPatterns by combined score (pattern + timeframe strength)
      enrichedPatterns.sort((a, b) => {
        // Primary: combined score (pattern strength + timeframe reliability)
        if (b.combinedScore !== a.combinedScore) {
          return b.combinedScore - a.combinedScore;
        }
        // Secondary: confidence
        return (b.confidence || 0) - (a.confidence || 0);
      });

      // Debug V2 data
      if (enrichedPatterns.length > 0) {
        console.log('[Scanner V2] Sample pattern V2 data:', {
          userTier,
          hasV2: enrichedPatterns[0].hasV2Enhancements,
          confidenceGrade: enrichedPatterns[0].confidenceGrade,
          volumeRatio: enrichedPatterns[0].volumeRatio,
          volumeGrade: enrichedPatterns[0].volumeGrade,
          combinedScore: enrichedPatterns[0].combinedScore,
          patternTier: enrichedPatterns[0].patternTier,
          v2: enrichedPatterns[0].v2,
        });
      }

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
      // Rule 29: Timeout guard on post-scan operations that could hang
      // =====================================================
      if (scanIdRef.current !== currentScanId) {
        console.log('[Scanner] Scan superseded, skipping post-processing');
      } else if (enrichedPatterns.length > 0) {
        try {
          console.log('[Scanner] Creating zones from patterns...');
          console.log('[Scanner] Zone viz enabled:', tierAccessService.isZoneVisualizationEnabled());
          console.log('[Scanner] User tier:', userTier);

          const createdZones = await Promise.race([
            zoneManager.createZonesFromPatterns(
              enrichedPatterns, // Pass enriched patterns with IDs
              displayCoin,
              selectedTimeframe,
              user?.id
            ),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Zone creation timeout')), 15000)),
          ]);
          setZones(createdZones);
          console.log('[Scanner] Zones created:', createdZones.length);

          // MTF alignment now integrated into main scan results
        } catch (zoneError) {
          console.log('[Scanner] Zone creation error:', zoneError.message);
        }
      } else {
        setZones([]);
      }

      // =====================================================
      // INCREMENT SCAN QUOTA (Database-backed)
      // =====================================================
      if (user?.id && scanIdRef.current === currentScanId) {
        try {
          const incrementResult = await Promise.race([
            tierAccessService.incrementScanCount(),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Quota increment timeout')), 8000)),
          ]);
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
      if (scanIdRef.current === currentScanId) {
        setScanError(error?.message || 'Không thể quét. Vui lòng thử lại.');
        alertService.error('Error', 'Failed to scan. Please try again.');
      }
    } finally {
      // Only clear scanning if this is still the active scan
      // If FORCE_REFRESH or a new scan superseded us, don't touch scanning state
      if (scanIdRef.current === currentScanId) {
        setScanning(false);
      }
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
    // ═══════════════════════════════════════════════════════════
    // MERGE ZONE DATA - Find matching zone and add zone boundaries
    // This is needed so zone can be displayed when viewing position later
    // ═══════════════════════════════════════════════════════════
    let enrichedPattern = { ...pattern };

    // Try to find matching zone by pattern_id
    const patternId = pattern.pattern_id || pattern.id;
    if (patternId && zones.length > 0) {
      const matchingZone = zones.find(z =>
        z.pattern_id === patternId ||
        z.metadata?.patternData?.pattern_id === patternId
      );

      if (matchingZone) {
        console.log('[PaperTrade] Found matching zone:', matchingZone.pattern_id);
        enrichedPattern = {
          ...enrichedPattern,
          // Add zone boundaries
          zone_high: matchingZone.zone_high,
          zone_low: matchingZone.zone_low,
          zoneHigh: matchingZone.zone_high,
          zoneLow: matchingZone.zone_low,
          // ✅ FIX: Add ALL time variants for zone positioning
          start_time: matchingZone.start_time || matchingZone.startTime,
          startTime: matchingZone.startTime || matchingZone.start_time,
          end_time: matchingZone.end_time || matchingZone.endTime,
          endTime: matchingZone.endTime || matchingZone.end_time,
          formation_time: matchingZone.formation_time || matchingZone.formationTime || matchingZone.start_time,
          formationTime: matchingZone.formationTime || matchingZone.formation_time || matchingZone.startTime,
          // P6 FIX #3: Prefer detection target (correct R:R) over zone target_1
          // Also set canonical takeProfit field so V2 modal finds it first
          entry_price: matchingZone.entry_price || enrichedPattern.entry,
          stop_loss: matchingZone.stop_loss || enrichedPattern.stopLoss,
          target_1: matchingZone.target_1 || enrichedPattern.target,
          take_profit: enrichedPattern.target || matchingZone.target_1 || enrichedPattern.takeProfit,
          takeProfit: enrichedPattern.target || matchingZone.target_1 || enrichedPattern.takeProfit,
        };
      } else {
        console.log('[PaperTrade] No matching zone found for pattern:', patternId);
        // Calculate zone boundaries from entry and stopLoss
        const entry = pattern.entry || pattern.entry_price || 0;
        const sl = pattern.stopLoss || pattern.stop_loss || 0;
        if (entry > 0 && sl > 0) {
          const isLong = pattern.direction === 'LONG';
          enrichedPattern = {
            ...enrichedPattern,
            zone_high: isLong ? entry : sl,
            zone_low: isLong ? sl : entry,
            zoneHigh: isLong ? entry : sl,
            zoneLow: isLong ? sl : entry,
          };
          console.log('[PaperTrade] Calculated zone bounds from Entry/SL');
        }
      }
    } else if (!patternId) {
      // No pattern_id - calculate zone from entry/SL
      const entry = pattern.entry || pattern.entry_price || 0;
      const sl = pattern.stopLoss || pattern.stop_loss || 0;
      if (entry > 0 && sl > 0) {
        const isLong = pattern.direction === 'LONG';
        enrichedPattern = {
          ...enrichedPattern,
          zone_high: isLong ? entry : sl,
          zone_low: isLong ? sl : entry,
          zoneHigh: isLong ? entry : sl,
          zoneLow: isLong ? sl : entry,
        };
        console.log('[PaperTrade] Calculated zone bounds from Entry/SL (no pattern_id)');
      }
    }

    // ✅ FIX: Ensure all time variants exist for zone positioning in chart
    // Even if no matching zone, preserve original pattern's timestamps
    const patternStartTime = enrichedPattern.start_time || enrichedPattern.startTime ||
                             enrichedPattern.formation_time || enrichedPattern.formationTime ||
                             pattern.start_time || pattern.startTime ||
                             pattern.formation_time || pattern.formationTime;
    if (patternStartTime) {
      enrichedPattern.start_time = patternStartTime;
      enrichedPattern.startTime = patternStartTime;
      enrichedPattern.formation_time = patternStartTime;
      enrichedPattern.formationTime = patternStartTime;
    }

    console.log('[PaperTrade] Enriched pattern zone data:', {
      zone_high: enrichedPattern.zone_high,
      zone_low: enrichedPattern.zone_low,
      start_time: enrichedPattern.start_time,
      formation_time: enrichedPattern.formation_time,
      end_time: enrichedPattern.end_time,
      timeframe: enrichedPattern.timeframe,
    });

    setSelectedPattern(enrichedPattern);
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

  // Check if user has exchange account (for CTA banner)
  useEffect(() => {
    const checkExchangeAccount = async () => {
      if (user?.id) {
        try {
          const hasExchange = await exchangeAffiliateService.hasRegisteredExchange();
          setHasExchangeAccount(hasExchange);
        } catch (error) {
          console.warn('[Scanner] Exchange check error:', error);
          setHasExchangeAccount(true); // Hide banner on error
        }
      }
    };
    checkExchangeAccount();
  }, [user?.id]);

  // ✅ Restore zones from cache when tab is focused
  useFocusEffect(
    useCallback(() => {
      // Reset zone display mode to show all zones when returning to tab
      console.log('[Scanner] Tab focused - resetting zoneDisplayMode to all');
      setZoneDisplayMode('all');
      setSelectedZonePatternId(null);

      const restoreZonesFromCache = async () => {
        // Only restore if zones are empty and we have scan results
        if (zones.length === 0 && scanResults.length > 0 && user?.id) {
          try {
            const cachedZones = await zoneManager.getZonesForChart(
              displayCoin,
              selectedTimeframe,
              user.id
            );
            if (cachedZones && cachedZones.length > 0) {
              console.log('[Scanner] Restored zones from cache:', cachedZones.length);
              setZones(cachedZones);
            }
          } catch (error) {
            console.log('[Scanner] No cached zones to restore:', error.message);
          }
        }
      };
      restoreZonesFromCache();
    }, [zones.length, scanResults.length, displayCoin, selectedTimeframe, user?.id])
  );

  // Listen for FORCE_REFRESH_EVENT from health monitor / recovery system
  useEffect(() => {
    const listener = DeviceEventEmitter.addListener(FORCE_REFRESH_EVENT, () => {
      console.log('[Scanner] Force refresh event received');
      scanIdRef.current++; // Invalidate any in-progress scan so its finally won't reset state
      setLoading(false);
      setScanning(false);
    });
    return () => listener.remove();
  }, []);

  // Handle selecting coin from scan results
  // NOTE: Only update state - useEffect will handle subscribeToPrice automatically
  // This prevents race condition that causes price flickering
  const handleSelectFromResults = (symbol) => {
    setSelectedCoins([symbol]);
    setSelectedPosition(null);       // Clear position
    setShowPositionZone(false);      // Hide position zone
    setZoneViewSource('scan');       // Mark source as scan
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
            onTimeframeChange={(newTf) => {
              // P6 FIX #1b: Sync context when user changes TF via chart toolbar.
              // clearResults: false — multi-TF scan results stay; zone filter at
              // line ~1403 already filters by selectedTimeframe.
              setSelectedTimeframe(newTf, { clearResults: false });
            }}
            onSymbolPress={() => {/* Could open coin selector */}}
            selectedPattern={selectedPattern}
            patterns={scanResults.find(r => r.symbol === displayCoin)?.patterns || []}
            positionsRefreshTrigger={positionsRefreshTrigger}
            zones={(() => {
              // =====================================================
              // ZONE FILTERING based on zoneDisplayMode + current coin
              // + POSITION ZONE from selected open position
              // =====================================================
              let resultZones = [];

              // ═══════════════════════════════════════════════════════════
              // 1. POSITION ZONE - from selected open position (Pattern Mode)
              // Only show when zoneViewSource === 'position' or null (not 'scan')
              // ═══════════════════════════════════════════════════════════
              if (showPositionZone && selectedPosition && zoneViewSource !== 'scan') {
                const pd = selectedPosition.patternData || {};

                console.log('[ZONE] Position zone check:', {
                  showPositionZone,
                  positionSymbol: selectedPosition.symbol,
                  displayCoin,
                  symbolMatch: selectedPosition.symbol === displayCoin,
                  entryPrice: selectedPosition.entryPrice,
                  stopLoss: selectedPosition.stopLoss,
                  direction: selectedPosition.direction,
                  hasPatternData: !!pd && Object.keys(pd).length > 0,
                  patternDataKeys: Object.keys(pd),
                  pd_zone_high: pd.zone_high,
                  pd_zone_low: pd.zone_low,
                  pd_zoneHigh: pd.zoneHigh,
                  pd_zoneLow: pd.zoneLow,
                });

                // Only show if position is for current displayCoin
                if (selectedPosition.symbol === displayCoin) {
                  // ═══════════════════════════════════════════════════════════
                  // PRIORITY: Use position fields directly (always available from Supabase)
                  // FALLBACK: Use patternData (only available for in-memory positions)
                  // ═══════════════════════════════════════════════════════════
                  const entry = parseFloat(selectedPosition.entryPrice || pd.entry || pd.entry_price || 0);
                  const sl = parseFloat(selectedPosition.stopLoss || pd.stopLoss || pd.stop_loss || 0);
                  const tp = parseFloat(selectedPosition.takeProfit || pd.take_profit || pd.target || pd.target_1 || 0);
                  const isLong = selectedPosition.direction === 'LONG';

                  console.log('[ZONE] Position values for zone calc:', {
                    positionEntryPrice: selectedPosition.entryPrice,
                    positionStopLoss: selectedPosition.stopLoss,
                    positionDirection: selectedPosition.direction,
                    pdEntry: pd.entry || pd.entry_price,
                    pdStopLoss: pd.stopLoss || pd.stop_loss,
                    parsedEntry: entry,
                    parsedSL: sl,
                  });

                  // Calculate zone boundaries from entry/SL
                  let zoneHigh = 0;
                  let zoneLow = 0;

                  // First check if patternData has explicit zone bounds
                  if (pd.zone_high && pd.zone_low) {
                    zoneHigh = parseFloat(pd.zone_high || pd.zoneHigh);
                    zoneLow = parseFloat(pd.zone_low || pd.zoneLow);
                    console.log('[ZONE] Using patternData zone bounds:', { zoneHigh, zoneLow });
                  }

                  // If no explicit zone, calculate from entry/SL
                  if ((zoneHigh <= 0 || zoneLow <= 0) && entry > 0 && sl > 0) {
                    // LONG: zone from SL (bottom) to Entry (top)
                    // SHORT: zone from Entry (bottom) to SL (top)
                    zoneHigh = isLong ? entry : sl;
                    zoneLow = isLong ? sl : entry;
                    console.log('[ZONE] Calculated zone from entry/SL:', { zoneHigh, zoneLow, isLong });
                  }

                  // ⚠️ FALLBACK: If still no zone and we have entry, create a 2% zone around entry
                  if ((zoneHigh <= 0 || zoneLow <= 0) && entry > 0) {
                    // Create zone: 1% above and 1% below entry (2% total thickness)
                    zoneHigh = entry * 1.01;
                    zoneLow = entry * 0.99;
                    console.log('[ZONE] Fallback zone (2% around entry):', { zoneHigh, zoneLow, entry });
                  }

                  // ⚠️ R:R CHECK: Only draw zone if Risk:Reward >= 1:2
                  // Risk = distance from entry to SL
                  // Reward = distance from entry to TP
                  const risk = Math.abs(entry - sl);
                  const reward = tp > 0 ? Math.abs(tp - entry) : 0;
                  const rrRatio = risk > 0 ? reward / risk : 0;

                  // Minimum R:R is 1:2 (reward must be at least 2x risk)
                  const MIN_RR_RATIO = 2.0;

                  if (rrRatio < MIN_RR_RATIO && tp > 0) {
                    console.log('[ZONE] ❌ Zone NOT created - R:R < 1:2:', {
                      risk: risk.toFixed(4),
                      reward: reward.toFixed(4),
                      rrRatio: rrRatio.toFixed(2),
                      entry,
                      sl,
                      tp,
                      required: MIN_RR_RATIO,
                    });
                    // Skip zone creation - R:R doesn't meet minimum requirements
                  }

                  // Only create zone if we have valid boundaries
                  // ✅ R:R check bypassed for position zones - user already opened the trade
                  if (zoneHigh > 0 && zoneLow > 0) {
                    // ✅ USE FORMATION_TIME from patternData (when pattern was detected)
                    // This is the CORRECT position where the pattern candles formed
                    // Zone must be sticky to these exact candles
                    const formationTime = pd.formation_time || pd.formationTime || pd.start_time || pd.startTime;
                    const endFormationTime = pd.end_time || pd.endTime;

                    // Fallback: if no formation_time, use position openedAt
                    const openedAt = selectedPosition.openedAt || selectedPosition.created_at;
                    let startTime = formationTime;
                    let endTime = endFormationTime;

                    // Convert to seconds if in milliseconds
                    if (startTime && startTime > 9999999999) startTime = Math.floor(startTime / 1000);
                    if (endTime && endTime > 9999999999) endTime = Math.floor(endTime / 1000);
                    if (!startTime && openedAt) {
                      startTime = typeof openedAt === 'string' ? Math.floor(new Date(openedAt).getTime() / 1000) : Math.floor(openedAt / 1000);
                    }

                    if (!startTime) {
                      // Last resort: no time data available for position zone
                      // This prevents chart from placing zone at 8 candles from right
                      console.log('[ZONE] ⚠️ No time data for position zone - will use chart fallback');
                    }

                    console.log('[ZONE] Formation time from patternData:', {
                      formationTime,
                      endFormationTime,
                      openedAt,
                      resolvedStartTime: startTime,
                      resolvedEndTime: endTime,
                    });

                    const positionZone = {
                      id: `position-${selectedPosition.id}`,
                      pattern_id: `position-${selectedPosition.id}`,
                      symbol: selectedPosition.symbol,
                      direction: selectedPosition.direction,
                      pattern_type: pd.pattern_type || pd.patternType || selectedPosition.patternType || 'Position Zone',
                      zone_high: zoneHigh,
                      zone_low: zoneLow,
                      start_time: startTime,
                      startTime: startTime,              // camelCase variant for TradingChart
                      end_time: endTime,
                      endTime: endTime,                  // camelCase variant for TradingChart
                      formation_time: startTime, // ✅ Explicit formation_time for chart positioning
                      formationTime: startTime,          // camelCase variant for TradingChart
                      entry_price: entry,
                      stop_loss: sl,
                      take_profit: tp,
                      target_1: tp,
                      isPositionZone: true,
                      positionId: selectedPosition.id,
                    };
                    console.log('[ZONE] ✅ Position zone CREATED:', {
                      id: positionZone.id,
                      zone_high: zoneHigh,
                      zone_low: zoneLow,
                      entry_price: entry,
                      stop_loss: sl,
                      start_time: startTime,
                      end_time: endTime,
                    });
                    resultZones.push(positionZone);
                  } else {
                    console.log('[ZONE] ❌ Zone NOT created - invalid bounds:', { zoneHigh, zoneLow, entry, sl });
                  }
                }
              }

              // ═══════════════════════════════════════════════════════════
              // 2. SCAN RESULT ZONES - from scan results (if enabled)
              // Only show when zoneViewSource !== 'position'
              // ═══════════════════════════════════════════════════════════
              console.log('[ZONE] DEBUG:', {
                showZones,
                zoneDisplayMode,
                zoneViewSource,
                selectedZonePatternId,
                totalZones: zones.length,
                displayCoin,
              });
              if (showZones && zoneDisplayMode !== 'hidden' && zoneViewSource !== 'position') {
                // ✅ FIX: Filter by BOTH symbol AND timeframe to prevent cross-TF zone mixing
                const coinZones = zones.filter(z =>
                  z.symbol === displayCoin &&
                  z.timeframe === selectedTimeframe
                );
                console.log('[ZONE] coinZones filtered:', coinZones.length, 'from', zones.length, 'for TF:', selectedTimeframe);

                // Debug: Log pattern_ids of all coinZones
                if (coinZones.length > 0) {
                  console.log('[ZONE] coinZones pattern_ids:', coinZones.map(z => ({
                    zone_pattern_id: z.pattern_id,
                    metadata_pattern_id: z.metadata?.patternData?.pattern_id,
                  })));
                }

                if (zoneDisplayMode === 'all') {
                  resultZones = [...resultZones, ...coinZones];
                } else if (zoneDisplayMode === 'selected') {
                  // ⚠️ FIX: When in 'selected' mode, show the selected zone OR all zones if no specific one selected
                  if (selectedZonePatternId) {
                    const filtered = coinZones.filter(z =>
                      z.pattern_id === selectedZonePatternId ||
                      z.metadata?.patternData?.pattern_id === selectedZonePatternId
                    );
                    console.log('[ZONE] Filtered by selectedZonePatternId:', filtered.length, 'matches');

                    // If no exact match found, try partial match (handle floating point precision issues)
                    if (filtered.length === 0 && selectedZonePatternId) {
                      // Extract symbol and pattern type from selectedZonePatternId
                      // Format: BTRUSDT_continuation_4h_0.074403_0.055909
                      const parts = selectedZonePatternId.split('_');
                      if (parts.length >= 3) {
                        const [symbol, patternName, timeframe] = parts;
                        const partialFiltered = coinZones.filter(z => {
                          const zParts = (z.pattern_id || '').split('_');
                          const zMeta = (z.metadata?.patternData?.pattern_id || '').split('_');
                          return (
                            (zParts[0] === symbol && zParts[1] === patternName && zParts[2] === timeframe) ||
                            (zMeta[0] === symbol && zMeta[1] === patternName && zMeta[2] === timeframe)
                          );
                        });
                        if (partialFiltered.length > 0) {
                          console.log('[ZONE] Partial match found:', partialFiltered.length);
                          resultZones = [...resultZones, ...partialFiltered];
                        }
                      }
                    } else {
                      resultZones = [...resultZones, ...filtered];
                    }
                  } else {
                    // No specific pattern selected but in 'selected' mode - show all coinZones
                    // This happens when user hasn't clicked a pattern yet
                    console.log('[ZONE] No selectedZonePatternId, showing all coinZones');
                    resultZones = [...resultZones, ...coinZones];
                  }
                }
              }

              console.log('[ZONE] Final resultZones to TradingChart:', resultZones.length, resultZones.map(z => ({ id: z.id, zone_high: z.zone_high, zone_low: z.zone_low })));
              return resultZones;
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
            // ═══════════════════════════════════════════════════════════
            // POSITION ZONE PROPS - Show zone from selected open position
            // ═══════════════════════════════════════════════════════════
            showPositionZone={showPositionZone}
            onTogglePositionZone={() => setShowPositionZone(prev => !prev)}
            selectedPosition={selectedPosition}
            // ═══════════════════════════════════════════════════════════
            // ZONE DISPLAY MODE (for ChartToolbar toggle)
            // ═══════════════════════════════════════════════════════════
            zoneDisplayMode={zoneDisplayMode}
            onZoneDisplayModeChange={setZoneDisplayMode}
          />

          {/* MTF Panel removed - integrated into scan results */}

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
                  // P6 FIX #1: Don't clear results when selecting a cross-TF pattern
                  if (pattern.timeframe) {
                    setSelectedTimeframe(pattern.timeframe, { clearResults: false });
                  }
                  setSelectedPattern(pattern);
                  setSelectedPosition(null);
                  setShowPositionZone(false);
                  setZoneViewSource('scan');
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
                onViewChart={(symbol, position) => {
                  const pd = position?.patternData || {};
                  // Get pattern's original timeframe to ensure chart shows correct data range
                  const patternTimeframe = pd.timeframe || position?.timeframe || selectedTimeframe;
                  console.log('[ZONE] onViewChart called:', {
                    symbol,
                    positionId: position?.id,
                    entryPrice: position?.entryPrice,
                    stopLoss: position?.stopLoss,
                    direction: position?.direction,
                    patternTimeframe,
                    patternDataKeys: pd ? Object.keys(pd) : [],
                  });
                  // Set all states together - React will batch them
                  setSelectedCoins([symbol]);
                  setSelectedPosition(position || null);
                  setShowPositionZone(true); // Auto-show zone when position selected
                  setZoneViewSource('position'); // Mark source as position
                  // ✅ FIX: Set timeframe to pattern's original timeframe
                  // This ensures chart loads correct data range containing formation_time
                  if (patternTimeframe) {
                    setSelectedTimeframe(patternTimeframe);
                  }
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
                  // P6 FIX #1: Don't clear results when selecting a cross-TF pattern
                  if (pattern.timeframe) {
                    setSelectedTimeframe(pattern.timeframe, { clearResults: false });
                  }
                  setSelectedPattern(pattern);
                  setSelectedPosition(null);
                  setShowPositionZone(false);
                  setZoneViewSource('scan');
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
                onViewChart={(symbol, position) => {
                  const pd = position?.patternData || {};
                  // Get pattern's original timeframe to ensure chart shows correct data range
                  const patternTimeframe = pd.timeframe || position?.timeframe || selectedTimeframe;
                  console.log('[ZONE] onViewChart called:', {
                    symbol,
                    positionId: position?.id,
                    entryPrice: position?.entryPrice,
                    stopLoss: position?.stopLoss,
                    direction: position?.direction,
                    patternTimeframe,
                    patternDataKeys: pd ? Object.keys(pd) : [],
                  });
                  // Set all states together - React will batch them
                  setSelectedCoins([symbol]);
                  setSelectedPosition(position || null);
                  setShowPositionZone(true); // Auto-show zone when position selected
                  setZoneViewSource('position'); // Mark source as position
                  // ✅ FIX: Set timeframe to pattern's original timeframe
                  // This ensures chart loads correct data range containing formation_time
                  if (patternTimeframe) {
                    setSelectedTimeframe(patternTimeframe);
                  }
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

          {/* C9 FIX: Error State - Show when scan fails */}
          {!scanning && scanError && scanResults.length === 0 && (
            <StateView
              type="error"
              compact
              message={scanError}
              onRetry={() => {
                setScanError(null);
                handleScan();
              }}
            />
          )}

          {/* Empty State - Only show when not scanning, no error, and no results */}
          {!scanning && !scanError && scanResults.length === 0 && (
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

          {/* Exchange Affiliate CTA - Show for users without exchange account */}
          {!hasExchangeAccount && user?.id && (
            <TouchableOpacity
              style={styles.exchangeCTABanner}
              onPress={() => navigation.navigate('ExchangeOnboarding', { source: 'scanner' })}
              activeOpacity={0.8}
            >
              <View style={styles.exchangeCTAContent}>
                <View style={styles.exchangeCTAIconContainer}>
                  <Building2 size={20} color={COLORS.gold} />
                </View>
                <View style={styles.exchangeCTAText}>
                  <Text style={styles.exchangeCTATitle}>Muốn trade thật?</Text>
                  <Text style={styles.exchangeCTASubtitle}>Đăng ký sàn qua GEM để nhận ưu đãi</Text>
                </View>
              </View>
              <ArrowRight size={18} color={COLORS.gold} />
            </TouchableOpacity>
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

        {/* Admin AI Trading Brain - Floating bubble, admin only */}
        <AdminAIBubble
          symbol={displayCoin}
          timeframe={selectedTimeframe}
          currentPrice={currentPrice}
          priceChange={priceChange}
          scanResults={scanResults}
          zones={zones}
          patterns={patterns}
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
    backgroundColor: '#22C55E', // Match TradingView chart green
  },
  priceDown: {
    backgroundColor: '#EF4444', // Match TradingView chart red
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

  // MTF Panel style removed

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

  // Exchange CTA Banner
  exchangeCTABanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.sm,
    padding: SPACING.md,
    backgroundColor: 'rgba(255, 189, 89, 0.1)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.3)',
  },
  exchangeCTAContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  exchangeCTAIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 189, 89, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  exchangeCTAText: {
    flex: 1,
  },
  exchangeCTATitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.gold,
    marginBottom: 2,
  },
  exchangeCTASubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
});

export default ScannerScreen;
