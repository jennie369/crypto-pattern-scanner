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
  Alert,
} from 'react-native';
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
} from 'lucide-react-native';

import CoinSelector from './components/CoinSelector';
import TimeframeSelector from './components/TimeframeSelector';
import TradingChart from './components/TradingChart';
import PatternCard from './components/PatternCard';
import ScanResultsSection from './components/ScanResultsSection';
import PaperTradeModal from './components/PaperTradeModal';
import { patternDetection } from '../../services/patternDetection';
import { binanceService } from '../../services/binanceService';
import { favoritesService } from '../../services/favoritesService';
import paperTradeService from '../../services/paperTradeService';
import { COLORS, GRADIENTS, SPACING, TYPOGRAPHY, GLASS } from '../../utils/tokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_HEIGHT = 320;

const ScannerScreen = ({ navigation }) => {
  // State
  const [selectedCoins, setSelectedCoins] = useState(['BTCUSDT']);
  const [selectedTimeframe, setSelectedTimeframe] = useState('4h');
  const [patterns, setPatterns] = useState([]);
  const [scanResults, setScanResults] = useState([]); // Results per coin
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPrice, setCurrentPrice] = useState(null);
  const [priceChange, setPriceChange] = useState(null);
  const [lastScanTime, setLastScanTime] = useState(null);

  // Paper Trade Modal State
  const [paperTradeModalVisible, setPaperTradeModalVisible] = useState(false);
  const [selectedPattern, setSelectedPattern] = useState(null);
  const [openPositionsCount, setOpenPositionsCount] = useState(0);

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
    if (wsRef.current) {
      wsRef.current.close();
    }

    const ws = new WebSocket(
      `wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@ticker`
    );

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
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
      console.log('[Scanner] WebSocket closed');
    };

    wsRef.current = ws;
  };

  // Handle Scan Now button
  const handleScan = async () => {
    if (selectedCoins.length === 0) {
      Alert.alert('Error', 'Please select at least one coin');
      return;
    }

    try {
      setScanning(true);
      setPatterns([]);
      setScanResults([]);

      console.log('[Scanner] Starting scan...');
      console.log('[Scanner] Coins:', selectedCoins);
      console.log('[Scanner] Timeframe:', selectedTimeframe);

      const allPatterns = [];
      const resultsPerCoin = [];

      // Scan each selected coin
      for (const symbol of selectedCoins) {
        console.log(`[Scanner] Scanning ${symbol}...`);

        // Add to recent
        await favoritesService.addRecent(symbol);

        // Detect patterns
        const detected = await patternDetection.detectPatterns(symbol, selectedTimeframe);

        // Store result for this coin
        resultsPerCoin.push({
          symbol,
          patterns: detected || [],
          scannedAt: new Date(),
        });

        if (detected && detected.length > 0) {
          allPatterns.push(...detected);
        }
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

    } catch (error) {
      console.error('[Scanner] Scan error:', error);
      Alert.alert('Error', 'Failed to scan. Please try again.');
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
    // Refresh open positions count
    await paperTradeService.init();
    setOpenPositionsCount(paperTradeService.getOpenPositions().length);
    Alert.alert('Success', 'Paper trade opened successfully!');
  };

  const handleViewOpenPositions = () => {
    navigation.navigate('OpenPositions');
  };

  // Load open positions count on mount
  useEffect(() => {
    const loadPositionsCount = async () => {
      await paperTradeService.init();
      setOpenPositionsCount(paperTradeService.getOpenPositions().length);
    };
    loadPositionsCount();
  }, []);

  // Handle selecting coin from scan results
  const handleSelectFromResults = (symbol) => {
    setSelectedCoins([symbol]);
    subscribeToPrice(symbol);
  };

  const formatPrice = (price) => {
    if (!price) return '--';
    if (price >= 1000) return price.toFixed(2);
    if (price >= 1) return price.toFixed(4);
    return price.toFixed(6);
  };

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
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <View>
                <Text style={styles.title}>Giao Dich</Text>
                <Text style={styles.subtitle}>Pattern Scanner</Text>
              </View>
              {/* Open Positions Button */}
              <TouchableOpacity
                style={styles.openPositionsButton}
                onPress={handleViewOpenPositions}
                activeOpacity={0.8}
              >
                <Briefcase size={18} color="#FFFFFF" />
                <Text style={styles.openPositionsText}>
                  Positions {openPositionsCount > 0 ? `(${openPositionsCount})` : ''}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.priceRow}>
              <View style={styles.priceBox}>
                <Text style={styles.priceLabel}>{displayCoin.replace('USDT', '/USDT')}</Text>
                <Text style={styles.priceValue}>${formatPrice(currentPrice)}</Text>
                {priceChange !== null && (
                  <View style={[
                    styles.priceChangeBadge,
                    priceChange >= 0 ? styles.priceUp : styles.priceDown,
                  ]}>
                    {priceChange >= 0 ? (
                      <TrendingUp size={12} color={COLORS.success} />
                    ) : (
                      <TrendingDown size={12} color={COLORS.error} />
                    )}
                    <Text style={[
                      styles.priceChangeText,
                      { color: priceChange >= 0 ? COLORS.success : COLORS.error },
                    ]}>
                      {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Controls */}
          <View style={styles.controls}>
            <CoinSelector
              selected={displayCoin}
              onSelect={(coin) => setSelectedCoins([coin])}
              multiSelect={true}
              selectedCoins={selectedCoins}
              onCoinsChange={handleCoinsChange}
              maxSelection={50}
            />
            <TimeframeSelector
              selected={selectedTimeframe}
              onSelect={setSelectedTimeframe}
            />
          </View>

          {/* Scan Status Row */}
          <View style={styles.statusBar}>
            <View style={styles.statusLeft}>
              <Search size={16} color={COLORS.textMuted} />
              <Text style={styles.statusText}>
                {patterns.length} patterns found
              </Text>
            </View>
            <View style={styles.statusRight}>
              <Zap size={14} color={COLORS.success} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          </View>

          {/* SCAN NOW BUTTON */}
          <TouchableOpacity
            style={[styles.scanButton, scanning && styles.scanButtonDisabled]}
            onPress={handleScan}
            disabled={scanning}
            activeOpacity={0.8}
          >
            {scanning ? (
              <>
                <ActivityIndicator size="small" color="#FFFFFF" />
                <Text style={styles.scanButtonText}>
                  Scanning {selectedCoins.length} coin{selectedCoins.length > 1 ? 's' : ''}...
                </Text>
              </>
            ) : (
              <>
                <Search size={20} color="#FFFFFF" />
                <Text style={styles.scanButtonText}>Scan Now</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Last scan time */}
          {lastScanTime && (
            <Text style={styles.lastScanText}>
              Last scan: {lastScanTime.toLocaleTimeString('vi-VN')}
            </Text>
          )}

          {/* TRADINGVIEW CHART - WITH CONTROLS */}
          <TradingChart
            symbol={displayCoin}
            timeframe={selectedTimeframe}
            height={CHART_HEIGHT}
            onSymbolPress={() => {/* Could open coin selector */}}
          />

          {/* Scan Results Section - Shows after scan */}
          {(scanning || scanResults.length > 0) && (
            <View style={styles.scanResultsWrapper}>
              <ScanResultsSection
                results={scanResults}
                isScanning={scanning}
                onSelectCoin={handleSelectFromResults}
                selectedCoin={displayCoin}
              />
            </View>
          )}

          {/* Patterns Section */}
          <View style={styles.patternsSection}>
            <Text style={styles.sectionTitle}>
              Detected Patterns ({patterns.length})
            </Text>

            {scanning ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.gold} />
                <Text style={styles.loadingText}>
                  Scanning {selectedCoins.length} coins...
                </Text>
              </View>
            ) : patterns.length > 0 ? (
              patterns.map((pattern, index) => (
                <PatternCard
                  key={pattern.id || `${pattern.patternType}-${index}`}
                  pattern={pattern}
                  onPress={() => handlePatternPress(pattern)}
                  onPaperTrade={handlePaperTrade}
                />
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <AlertCircle size={48} color={COLORS.textMuted} />
                <Text style={styles.emptyTitle}>No Patterns Detected</Text>
                <Text style={styles.emptyText}>
                  Try scanning different timeframes or coins
                </Text>
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={handleScan}
                >
                  <RefreshCw size={18} color={COLORS.gold} />
                  <Text style={styles.retryText}>Scan Again</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Pattern Legend */}
          {patterns.length > 0 && (
            <View style={styles.legend}>
              <Text style={styles.legendTitle}>Pattern Types</Text>
              <View style={styles.legendItems}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: COLORS.success }]} />
                  <Text style={styles.legendText}>LONG - Bullish</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: COLORS.error }]} />
                  <Text style={styles.legendText}>SHORT - Bearish</Text>
                </View>
              </View>
            </View>
          )}

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

  // Header
  header: {
    backgroundColor: GLASS.background,
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(106, 91, 255, 0.2)',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  priceBox: {
    alignItems: 'flex-end',
  },
  priceLabel: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  priceValue: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.cyan,
  },
  priceChangeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 4,
    gap: 4,
  },
  priceUp: {
    backgroundColor: 'rgba(58, 247, 166, 0.15)',
  },
  priceDown: {
    backgroundColor: 'rgba(255, 107, 107, 0.15)',
  },
  priceChangeText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // Controls
  controls: {
    backgroundColor: GLASS.background,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(106, 91, 255, 0.2)',
    padding: SPACING.lg,
    gap: SPACING.md,
  },

  // Status Bar
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusText: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  statusRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(58, 247, 166, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  liveText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.success,
  },

  // Scan Button
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#9C0612',
    marginHorizontal: SPACING.lg,
    marginVertical: SPACING.md,
    paddingVertical: 16,
    borderRadius: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.3)',
    shadowColor: 'rgba(156, 6, 18, 0.5)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 15,
    elevation: 8,
  },
  scanButtonDisabled: {
    opacity: 0.7,
  },
  scanButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  lastScanText: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },

  // Scan Results
  scanResultsWrapper: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },

  // Patterns Section
  patternsSection: {
    paddingHorizontal: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.gold,
    marginBottom: SPACING.md,
  },

  // Loading
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 15,
    color: COLORS.textMuted,
    marginTop: 16,
  },

  // Empty State
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
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

  // Legend
  legend: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    padding: SPACING.lg,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
  },
  legendTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginBottom: SPACING.sm,
  },
  legendItems: {
    flexDirection: 'row',
    gap: 24,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },

  // Open Positions Button
  openPositionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.purple,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    gap: 6,
  },
  openPositionsText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  priceRow: {
    marginTop: SPACING.md,
  },
});

export default ScannerScreen;
