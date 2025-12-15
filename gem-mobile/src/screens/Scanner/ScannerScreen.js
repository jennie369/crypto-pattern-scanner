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
} from 'lucide-react-native';

import CoinSelector from './components/CoinSelector';
import TradingChart from './components/TradingChart';
import ScanResultsSection from './components/ScanResultsSection';
import MultiTFResultsSection from './components/MultiTFResultsSection';
import PaperTradeModal from './components/PaperTradeModal';
import { useSponsorBanners } from '../../components/SponsorBannerSection';
import SponsorBannerCard from '../../components/SponsorBannerCard';
import { useTooltip } from '../../components/Common/TooltipProvider';
import { patternDetection } from '../../services/patternDetection';
import {
  scanMultipleTimeframes,
  checkMultiTFAccess,
  getAvailableTimeframesForTier,
  MULTI_TF_TIMEFRAMES,
} from '../../services/multiTimeframeScanner';
import { binanceService } from '../../services/binanceService';
import { favoritesService } from '../../services/favoritesService';
import paperTradeService from '../../services/paperTradeService';
import { tierAccessService } from '../../services/tierAccessService';
import { useAuth } from '../../contexts/AuthContext';
import { useScanner } from '../../contexts/ScannerContext';
import { COLORS, GRADIENTS, SPACING, TYPOGRAPHY, GLASS } from '../../utils/tokens';
import { formatPrice } from '../../utils/formatters';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_HEIGHT = 320;

const ScannerScreen = ({ navigation }) => {
  // Get user and tier from Auth Context
  const { user, userTier } = useAuth();

  // Tooltip hook for feature discovery
  const { showTooltipForScreen, initialized: tooltipInitialized } = useTooltip();

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

  // Multi-Timeframe Scan State - scanning status only (results in context)
  const [multiTFScanning, setMultiTFScanning] = useState(false);

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

  const subscribeToPrice = (symbol) => {
    // Close existing WebSocket
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    // Reset price while switching to avoid showing stale data
    setCurrentPrice(null);
    setPriceChange(null);

    const ws = new WebSocket(
      `wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@ticker`
    );

    // Track the symbol this WebSocket is for (prevents race condition)
    const targetSymbol = symbol.toUpperCase();

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        // Verify the message is for the correct symbol (race condition fix)
        const messageSymbol = data.s?.toUpperCase();
        if (messageSymbol && messageSymbol !== targetSymbol) {
          console.log('[Scanner] Ignoring stale price from:', messageSymbol, 'expected:', targetSymbol);
          return;
        }
        setCurrentPrice(parseFloat(data.c));
        setPriceChange(parseFloat(data.P));
      } catch (e) {
        console.error('[Scanner] WebSocket parse error:', e);
      }
    };

    ws.onerror = (error) => {
      // WebSocket errors are common due to network issues - just log quietly
      console.log('[Scanner] WebSocket connection issue - will retry on next interaction');
    };

    ws.onclose = () => {
      // Silently handle close
      console.log('[Scanner] WebSocket closed for:', targetSymbol);
    };

    wsRef.current = ws;
  };

  // Handle Scan Now button - accepts optional coins array and timeframes from CoinSelector
  const handleScan = async (coinsToScan = null, timeframesToUse = null) => {
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

      // Sort results - coins with patterns first
      resultsPerCoin.sort((a, b) => {
        const aHas = a.patterns.length > 0 ? 1 : 0;
        const bHas = b.patterns.length > 0 ? 1 : 0;
        return bHas - aHas;
      });

      setPatterns(allPatterns);
      setScanResults(resultsPerCoin);
      setLastScanTime(new Date());

      console.log('[Scanner] Scan complete. Patterns found:', allPatterns.length);
      console.log('[Scanner] Results per coin:', resultsPerCoin.length);

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

      // =====================================================
      // TIER2/3 AUTO Multi-TF Scan - runs automatically!
      // =====================================================
      if (multiTFAccess.hasAccess && coins.length === 1) {
        // Only run Multi-TF for single coin scan (performance)
        const symbol = coins[0];
        console.log('[Scanner] Auto-running Multi-TF scan for TIER2/3 user...');

        try {
          setMultiTFScanning(true);

          const timeframesToScan = availableTimeframes
            .slice(0, multiTFAccess.maxTimeframes)
            .map(tf => tf.value);

          const multiResults = await scanMultipleTimeframes(symbol, timeframesToScan, userTier);
          setMultiTFResults(multiResults);

          console.log('[Scanner] Multi-TF Scan complete:', multiResults?.confluence?.length || 0, 'confluence patterns');
        } catch (mtfError) {
          console.error('[Scanner] Multi-TF Scan error:', mtfError);
          // Don't show alert - just log, main scan already succeeded
        } finally {
          setMultiTFScanning(false);
        }
      } else if (coins.length > 1) {
        // Clear multi-TF results for multi-coin scans
        setMultiTFResults(null);
      }

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
    setPaperTradeModalVisible(false);
    setSelectedPattern(null);
    // Refresh open positions count - filter by current user
    await paperTradeService.init();
    const userId = user?.id || null;
    setOpenPositionsCount(paperTradeService.getOpenPositions(userId).length);
  };

  const handleViewOpenPositions = () => {
    navigation.navigate('OpenPositions');
  };

  // Load open positions count on mount - filter by current user
  useEffect(() => {
    const loadPositionsCount = async () => {
      await paperTradeService.init();
      const userId = user?.id || null;
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
  const handleSelectFromResults = (symbol) => {
    setSelectedCoins([symbol]);
    subscribeToPrice(symbol);
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
            />
          }
          showsVerticalScrollIndicator={false}
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
              <Briefcase size={18} color="#FFFFFF" />
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
                    {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
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
          />

          {/* Scan Results Section - Merged with Detected Patterns */}
          {/* Uses CoinAccordion - only 1 coin open at a time */}
          <View style={styles.scanResultsWrapper}>
            <ScanResultsSection
              results={scanResults}
              isScanning={scanning}
              onSelectCoin={handleSelectFromResults}
              onSelectPattern={(pattern) => {
                setSelectedCoins([pattern.symbol]);
                subscribeToPrice(pattern.symbol);
                // Auto-switch timeframe to match pattern's timeframe
                if (pattern.timeframe) {
                  setSelectedTimeframe(pattern.timeframe);
                }
                setSelectedPattern(pattern); // Show price lines on chart
              }}
              onPaperTrade={handlePaperTrade}
              selectedCoin={displayCoin}
              selectedPatternId={selectedPattern?.id}
              userTier={userTier}
            />
          </View>

          {/* Multi-Timeframe Results Section - Auto for TIER2/3 (single coin only) */}
          {multiTFAccess.hasAccess && selectedCoins.length === 1 && (
            <MultiTFResultsSection
              results={multiTFResults}
              isScanning={multiTFScanning}
              userTier={userTier}
              onUpgradePress={() => navigation.navigate('Shop')}
            />
          )}

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
                onPress={handleScan}
              >
                <RefreshCw size={18} color={COLORS.gold} />
                <Text style={styles.retryText}>Scan Now</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Sponsor Banners - distributed */}
          {sponsorBanners.map((banner) => (
            <SponsorBannerCard
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

        {/* Paper Trade Modal */}
        <PaperTradeModal
          visible={paperTradeModalVisible}
          pattern={selectedPattern}
          onClose={() => {
            setPaperTradeModalVisible(false);
            setSelectedPattern(null);
          }}
          onSuccess={handlePaperTradeSuccess}
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
    backgroundColor: COLORS.purple,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    gap: 4,
  },
  positionsButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // 2. Scan Row - Status + Button
  scanRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
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
    backgroundColor: 'rgba(58, 247, 166, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginLeft: 4,
  },
  liveText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.success,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#9C0612',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    gap: 6,
    borderWidth: 1.5,
    borderColor: COLORS.gold,
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
    backgroundColor: 'rgba(255, 189, 89, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    marginLeft: 4,
  },
  multiTFBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.gold,
  },

  // Quota Badge Styles
  quotaBadge: {
    backgroundColor: 'rgba(0, 255, 136, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginLeft: 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 136, 0.3)',
  },
  quotaBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.success,
  },
  quotaBadgeLow: {
    backgroundColor: 'rgba(255, 185, 0, 0.15)',
    borderColor: 'rgba(255, 185, 0, 0.3)',
  },
  quotaBadgeEmpty: {
    backgroundColor: 'rgba(255, 107, 107, 0.15)',
    borderColor: 'rgba(255, 107, 107, 0.3)',
  },
  quotaBadgeTextEmpty: {
    color: COLORS.error,
  },
  quotaBadgeUnlimited: {
    backgroundColor: 'rgba(106, 91, 255, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginLeft: 4,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.3)',
  },
  quotaBadgeTextUnlimited: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.purple,
  },

  // 3. Price Section - COMPACT (single row)
  priceSection: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
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
    backgroundColor: 'rgba(106, 91, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  coinIconTextSmall: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.purple,
  },
  coinNameCompact: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  priceValueCompact: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.cyan,
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

  // Scan Results - MINIMAL spacing
  scanResultsWrapper: {
    marginHorizontal: SPACING.sm,
    marginBottom: SPACING.sm,
    marginTop: 0,
  },

  // Empty State
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    marginHorizontal: SPACING.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 18,
    borderWidth: 1.2,
    borderColor: 'rgba(106, 91, 255, 0.2)',
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
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.3)',
    gap: 8,
  },
  retryText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gold,
  },
});

export default ScannerScreen;
