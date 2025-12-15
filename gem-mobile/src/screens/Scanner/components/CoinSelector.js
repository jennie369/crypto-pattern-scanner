/**
 * GEM Mobile - Coin Selector (Upgraded)
 * 500+ coins with search, favorites, and multi-select
 * FIXED: Full screen modal, proper scroll, Apply button visible
 */

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  Platform,
  StatusBar,
  Dimensions,
  Animated,
} from 'react-native';
import CustomAlert, { useCustomAlert } from '../../../components/CustomAlert';
import {
  ChevronDown,
  Search,
  Star,
  X,
  CheckSquare,
  Square,
  Clock,
  TrendingUp,
  Zap,
  Lock,
} from 'lucide-react-native';
import { binanceService } from '../../../services/binanceService';
import { favoritesService } from '../../../services/favoritesService';
import { COLORS, SPACING, TYPOGRAPHY, GLASS } from '../../../utils/tokens';
import { formatPrice } from '../../../utils/formatters';
import { tierAccessService } from '../../../services/tierAccessService';
import { MULTI_TF_TIMEFRAMES, checkMultiTFAccess } from '../../../services/multiTimeframeScanner';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const CoinSelector = ({
  selected = 'BTCUSDT',
  onSelect,
  multiSelect = false,
  selectedCoins = [],
  onCoinsChange,
  maxSelection: propMaxSelection,
  userTier = 'FREE', // Issue 14: Pass user tier from parent
  onScanNow, // Callback to trigger scan with selected coins + timeframes
  isScanning = false, // Show scanning state on button
  selectedTimeframe = '5m', // Default timeframe for FREE/TIER1
  onTimeframesChange, // Callback when timeframes are selected (TIER2/3)
}) => {
  // Get max selection from prop (which comes from tierAccessService)
  // If -1 (unlimited for TIER3/ADMIN), use 1000 as practical limit
  const maxSelection = propMaxSelection === -1 ? 1000 : (propMaxSelection || tierAccessService.getMaxCoins());

  // Custom Alert hook for dark themed popups
  const { alert, AlertComponent } = useCustomAlert();

  const [modalVisible, setModalVisible] = useState(false);
  const [allCoins, setAllCoins] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [recentCoins, setRecentCoins] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [tempSelected, setTempSelected] = useState([]);
  const [tickerData, setTickerData] = useState({}); // { symbol: { price, priceChangePercent, quoteVolume } }

  // Multi-Timeframe Selection
  const multiTFAccess = checkMultiTFAccess(userTier);
  const [selectedTimeframes, setSelectedTimeframes] = useState([selectedTimeframe]); // Default to current TF
  const MAX_TIMEFRAMES = 3; // Limit to 3 timeframes per scan
  const MAX_COINS_PER_SCAN = 10; // Limit 10 coins per scan

  // Auto-hide header on scroll - use height animation for proper layout
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerHeight = useRef(new Animated.Value(110)).current; // Full height when visible
  const headerOpacity = useRef(new Animated.Value(1)).current;
  const isHeaderHidden = useRef(false);
  const lastScrollY = useRef(0);
  const HEADER_FULL_HEIGHT = 110; // Actual content height (search 36 + tf 28 + tabs 24 + gaps ~22)
  const HEADER_COLLAPSED_HEIGHT = 0;

  // Show ALL timeframes but mark which are locked for FREE/TIER1
  const allTimeframes = useMemo(() => {
    return MULTI_TF_TIMEFRAMES.map(tf => ({
      ...tf,
      isLocked: !multiTFAccess.hasAccess || !multiTFAccess.allowedTimeframes.includes(tf.value),
    }));
  }, [userTier, multiTFAccess]);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [coins, favs, recent, tickers] = await Promise.all([
        binanceService.getAllCoins(),
        favoritesService.getFavorites(),
        favoritesService.getRecent(),
        binanceService.getAllFuturesTickers(), // Fetch all ticker data
      ]);
      setAllCoins(coins);
      setFavorites(favs);
      setRecentCoins(recent);
      setTickerData(tickers);
    } catch (error) {
      console.error('[CoinSelector] Load error:', error);
      setAllCoins(binanceService.getDefaultCoins());
    } finally {
      setLoading(false);
    }
  };

  // formatPrice is now imported from utils/formatters

  // Format volume (KL = Khối lượng)
  const formatVolume = (vol) => {
    if (!vol || isNaN(vol)) return '0';
    if (vol >= 1e9) return (vol / 1e9).toFixed(2) + 'B';
    if (vol >= 1e6) return (vol / 1e6).toFixed(2) + 'M';
    if (vol >= 1e3) return (vol / 1e3).toFixed(2) + 'K';
    return vol.toFixed(2);
  };

  // Filter coins
  const filteredCoins = useMemo(() => {
    let coins = [...allCoins];

    if (activeTab === 'favorites') {
      coins = coins.filter(c => favorites.includes(c.symbol));
    } else if (activeTab === 'recent') {
      coins = coins.filter(c => recentCoins.includes(c.symbol));
      coins.sort((a, b) => recentCoins.indexOf(a.symbol) - recentCoins.indexOf(b.symbol));
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      coins = coins.filter(c =>
        c.symbol.toLowerCase().includes(query) ||
        c.baseAsset.toLowerCase().includes(query)
      );
    }

    return coins;
  }, [allCoins, favorites, recentCoins, searchQuery, activeTab]);

  const openModal = () => {
    // Debug log for tier
    console.log('[CoinSelector] Opening modal - userTier:', userTier, 'maxSelection:', maxSelection);
    // Start with current selection or empty array
    if (multiSelect) {
      // Only use selectedCoins if they exist, otherwise empty
      setTempSelected(selectedCoins.length > 0 ? [...selectedCoins] : []);
    }
    setSearchQuery('');
    setActiveTab('all');
    // Reset header animation state
    headerHeight.setValue(HEADER_FULL_HEIGHT);
    headerOpacity.setValue(1);
    isHeaderHidden.current = false;
    lastScrollY.current = 0;
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const applySelection = () => {
    if (multiSelect && onCoinsChange) {
      onCoinsChange(tempSelected);
    }
    closeModal();
  };

  // Toggle timeframe selection
  const toggleTimeframe = (tfValue, isLocked) => {
    // Show upgrade tooltip for locked timeframes
    if (isLocked) {
      alert({
        type: 'info',
        title: '🔒 Nâng Cấp Tài Khoản',
        message: 'Tính năng Multi-Timeframe cho phép bạn quét pattern trên nhiều khung thời gian cùng lúc.\n\n✨ Lợi ích:\n• Phát hiện nhiều pattern hơn\n• Xác nhận tín hiệu chính xác hơn\n• Tăng tỷ lệ win rate\n\nNâng cấp lên TIER2 hoặc cao hơn để sử dụng tính năng này!',
        buttons: [
          { text: 'Để sau', style: 'cancel' },
          { text: 'Nâng cấp ngay', onPress: () => {/* Navigate to upgrade screen */} },
        ],
      });
      return;
    }

    setSelectedTimeframes(prev => {
      if (prev.includes(tfValue)) {
        // Don't allow deselecting if it's the last one
        if (prev.length === 1) return prev;
        return prev.filter(tf => tf !== tfValue);
      } else if (prev.length < MAX_TIMEFRAMES) {
        return [...prev, tfValue];
      }
      // Already at max, don't add more
      return prev;
    });
  };

  // Handle Scan Now - apply selection and trigger scan with timeframes
  const handleScanNow = () => {
    if (tempSelected.length === 0) return;

    // Apply the selection first
    if (multiSelect && onCoinsChange) {
      onCoinsChange(tempSelected);
    }

    // Notify parent about selected timeframes
    if (onTimeframesChange) {
      onTimeframesChange(selectedTimeframes);
    }

    // Close modal
    closeModal();

    // Trigger scan with the selected coins AND timeframes
    if (onScanNow) {
      // Small delay to ensure modal is closed before scan starts
      setTimeout(() => {
        onScanNow(tempSelected, selectedTimeframes);
      }, 100);
    }
  };

  const handleCoinSelect = async (coin) => {
    if (multiSelect) {
      toggleCoin(coin.symbol);
    } else {
      onSelect(coin.symbol);
      await favoritesService.addRecent(coin.symbol);
      closeModal();
    }
  };

  const toggleCoin = (symbol) => {
    setTempSelected(prev => {
      if (prev.includes(symbol)) {
        return prev.filter(s => s !== symbol);
      } else if (prev.length < MAX_COINS_PER_SCAN) {
        // Enforce max 10 coins per scan
        return [...prev, symbol];
      } else {
        // Show alert when max reached
        alert({
          type: 'warning',
          title: 'Giới hạn số coin',
          message: `Bạn chỉ có thể chọn tối đa ${MAX_COINS_PER_SCAN} coin mỗi lần quét để đảm bảo tốc độ và hiệu suất.`,
          buttons: [{ text: 'Đã hiểu' }],
        });
        return prev;
      }
    });
  };

  // Clear all selected coins
  const clearSelection = () => {
    setTempSelected([]);
  };

  // Handle scroll to auto-hide/show header
  const handleScroll = useCallback((event) => {
    const currentY = event.nativeEvent.contentOffset.y;
    const diff = currentY - lastScrollY.current;

    // Hide when scrolling down past threshold
    if (currentY > 60 && diff > 5 && !isHeaderHidden.current) {
      isHeaderHidden.current = true;
      Animated.parallel([
        Animated.timing(headerHeight, {
          toValue: HEADER_COLLAPSED_HEIGHT,
          duration: 200,
          useNativeDriver: false, // height can't use native driver
        }),
        Animated.timing(headerOpacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: false,
        }),
      ]).start();
    }
    // Show when scrolling up or near top
    else if ((diff < -8 || currentY < 30) && isHeaderHidden.current) {
      isHeaderHidden.current = false;
      Animated.parallel([
        Animated.timing(headerHeight, {
          toValue: HEADER_FULL_HEIGHT,
          duration: 200,
          useNativeDriver: false,
        }),
        Animated.timing(headerOpacity, {
          toValue: 1,
          duration: 150,
          useNativeDriver: false,
        }),
      ]).start();
    }

    lastScrollY.current = currentY;
  }, []);

  // Expand header manually
  const expandHeader = useCallback(() => {
    isHeaderHidden.current = false;
    Animated.parallel([
      Animated.timing(headerHeight, {
        toValue: HEADER_FULL_HEIGHT,
        duration: 200,
        useNativeDriver: false,
      }),
      Animated.timing(headerOpacity, {
        toValue: 1,
        duration: 150,
        useNativeDriver: false,
      }),
    ]).start();
  }, []);

  const toggleFavorite = async (symbol) => {
    const newFavorites = await favoritesService.toggleFavorite(symbol);
    setFavorites(newFavorites);
  };

  const renderCoinItem = useCallback(({ item }) => {
    const isSelected = multiSelect ? tempSelected.includes(item.symbol) : item.symbol === selected;
    const isFavorite = favorites.includes(item.symbol);
    const ticker = tickerData[item.symbol] || {};
    const priceChange = ticker.priceChangePercent || 0;
    const isPositive = priceChange >= 0;

    return (
      <TouchableOpacity
        style={[styles.coinItem, isSelected && styles.coinItemSelected]}
        onPress={() => handleCoinSelect(item)}
        activeOpacity={0.7}
      >
        {/* Left: Favorite + Checkbox */}
        <TouchableOpacity
          style={styles.favoriteBtn}
          onPress={() => toggleFavorite(item.symbol)}
        >
          <Star
            size={18}
            color={isFavorite ? COLORS.gold : COLORS.textMuted}
            fill={isFavorite ? COLORS.gold : 'transparent'}
          />
        </TouchableOpacity>

        {multiSelect && (
          <View style={styles.checkbox}>
            {isSelected ? (
              <CheckSquare size={20} color={COLORS.gold} />
            ) : (
              <Square size={20} color={COLORS.textMuted} />
            )}
          </View>
        )}

        {/* Middle: Symbol + Volume */}
        <View style={styles.coinInfo}>
          <View style={styles.symbolRow}>
            <Text style={styles.coinSymbol}>{item.symbol}</Text>
            <Text style={styles.perpLabel}>Vĩnh cửu</Text>
          </View>
          <Text style={styles.volumeText}>
            KL {formatVolume(ticker.quoteVolume)} USDT
          </Text>
        </View>

        {/* Right: Price + % Change */}
        <View style={styles.priceInfo}>
          <Text style={styles.priceText}>{formatPrice(ticker.price)}</Text>
          <Text style={[
            styles.changeText,
            isPositive ? styles.changePositive : styles.changeNegative,
          ]}>
            {isPositive ? '+' : ''}{priceChange.toFixed(2)}%
          </Text>
        </View>
      </TouchableOpacity>
    );
  }, [multiSelect, tempSelected, selected, favorites, tickerData]);

  const displayText = useMemo(() => {
    if (multiSelect) {
      return selectedCoins.length === 0
        ? 'Select Coins'
        : selectedCoins.length === 1
          ? selectedCoins[0].replace('USDT', '/USDT')
          : `${selectedCoins.length} coins`;
    }
    return selected.replace('USDT', '/USDT');
  }, [multiSelect, selectedCoins, selected]);

  return (
    <>
      <TouchableOpacity style={styles.selectorButton} onPress={openModal}>
        <View style={styles.selectorContent}>
          <View style={styles.selectorIcon}>
            <TrendingUp size={18} color={COLORS.gold} />
          </View>
          <Text style={styles.selectorText}>{displayText}</Text>
        </View>
        <ChevronDown size={20} color={COLORS.textMuted} />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={closeModal}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {/* Fixed Header - Always visible */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Coins</Text>
              <View style={styles.headerRight}>
                <Text style={styles.selectionBadge}>
                  {tempSelected.length}/{MAX_COINS_PER_SCAN}
                </Text>
                <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                  <X size={22} color={COLORS.textPrimary} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Collapsible Section - Search, Timeframes, Tabs */}
            <Animated.View style={[
              styles.collapsibleSection,
              {
                height: headerHeight,
                opacity: headerOpacity,
              }
            ]}>
              {/* Compact Search + Timeframes Row */}
              <View style={styles.compactRow}>
                {/* Search - smaller */}
                <View style={styles.searchContainerCompact}>
                  <Search size={16} color={COLORS.textMuted} />
                  <TextInput
                    style={styles.searchInputCompact}
                    placeholder="Tìm coin..."
                    placeholderTextColor={COLORS.textMuted}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    autoCapitalize="characters"
                  />
                  {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                      <X size={14} color={COLORS.textMuted} />
                    </TouchableOpacity>
                  )}
                </View>

                {/* TF Count Badge */}
                {multiTFAccess.hasAccess && (
                  <View style={styles.tfBadgeCompact}>
                    <Text style={styles.tfBadgeText}>{selectedTimeframes.length} TF</Text>
                  </View>
                )}
              </View>

              {/* Timeframe Buttons - Single row, compact */}
              <View style={styles.timeframeRowCompact}>
                {allTimeframes.map((tf) => {
                  const isSelected = selectedTimeframes.includes(tf.value);
                  const isDisabled = !isSelected && selectedTimeframes.length >= MAX_TIMEFRAMES;
                  const isLocked = tf.isLocked;
                  return (
                    <TouchableOpacity
                      key={tf.value}
                      style={[
                        styles.tfBtnCompact,
                        isSelected && styles.tfBtnActive,
                        isDisabled && !isLocked && styles.tfBtnDisabled,
                        isLocked && styles.tfBtnLocked,
                      ]}
                      onPress={() => toggleTimeframe(tf.value, isLocked)}
                      activeOpacity={0.7}
                    >
                      {isLocked && <Lock size={9} color={COLORS.textMuted} />}
                      <Text style={[
                        styles.tfBtnText,
                        isSelected && styles.tfBtnTextActive,
                        isLocked && styles.tfBtnTextLocked,
                      ]}>
                        {tf.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Tabs + Clear - Single compact row */}
              <View style={styles.tabsRowCompact}>
                <TouchableOpacity
                  style={[styles.tabCompact, activeTab === 'all' && styles.tabCompactActive]}
                  onPress={() => setActiveTab('all')}
                >
                  <Text style={[styles.tabTextCompact, activeTab === 'all' && styles.tabTextCompactActive]}>
                    All ({allCoins.length})
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.tabCompact, activeTab === 'favorites' && styles.tabCompactActive]}
                  onPress={() => setActiveTab('favorites')}
                >
                  <Star size={12} color={activeTab === 'favorites' ? COLORS.gold : COLORS.textMuted} />
                  <Text style={[styles.tabTextCompact, activeTab === 'favorites' && styles.tabTextCompactActive]}>
                    ({favorites.length})
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.tabCompact, activeTab === 'recent' && styles.tabCompactActive]}
                  onPress={() => setActiveTab('recent')}
                >
                  <Clock size={12} color={activeTab === 'recent' ? COLORS.gold : COLORS.textMuted} />
                </TouchableOpacity>

                {/* Clear button on same row */}
                {multiSelect && tempSelected.length > 0 && (
                  <TouchableOpacity style={styles.clearBtnCompact} onPress={clearSelection}>
                    <X size={12} color={COLORS.error} />
                    <Text style={styles.clearBtnText}>Xóa</Text>
                  </TouchableOpacity>
                )}
              </View>
            </Animated.View>

            {/* Collapsed indicator - tap to expand - inverse of header */}
            <Animated.View
              style={[
                styles.expandBar,
                {
                  height: headerHeight.interpolate({
                    inputRange: [0, HEADER_FULL_HEIGHT],
                    outputRange: [36, 0],
                    extrapolate: 'clamp',
                  }),
                  opacity: headerHeight.interpolate({
                    inputRange: [0, 30],
                    outputRange: [1, 0],
                    extrapolate: 'clamp',
                  }),
                }
              ]}
            >
              <TouchableOpacity onPress={expandHeader} activeOpacity={0.7} style={styles.expandBarTouchable}>
                <Search size={14} color={COLORS.gold} />
                <Text style={styles.expandBarText}>
                  {searchQuery || 'Tìm kiếm'} • {selectedTimeframes.length} TF • {tempSelected.length} coins
                </Text>
                <ChevronDown size={14} color={COLORS.gold} />
              </TouchableOpacity>
            </Animated.View>

            {/* Coins List Container */}
            <View style={styles.coinsListContainer}>
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={COLORS.gold} />
                  <Text style={styles.loadingText}>Loading coins...</Text>
                </View>
              ) : (
                <FlatList
                  data={filteredCoins}
                  renderItem={renderCoinItem}
                  keyExtractor={(item) => item.symbol}
                  style={styles.coinsList}
                  contentContainerStyle={styles.coinsListContent}
                  showsVerticalScrollIndicator={true}
                  initialNumToRender={25}
                  maxToRenderPerBatch={30}
                  windowSize={10}
                  onScroll={handleScroll}
                  scrollEventThrottle={16}
                  ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                      <Text style={styles.emptyText}>Không tìm thấy coin</Text>
                    </View>
                  }
                />
              )}
            </View>

            {/* Scan Now Button (multi-select) - Fixed at bottom */}
            {multiSelect && (
              <View style={styles.applyButtonWrapper}>
                {/* Validation message */}
                {tempSelected.length === 0 && (
                  <Text style={styles.validationText}>Vui lòng chọn ít nhất 1 coin (tối đa {MAX_COINS_PER_SCAN})</Text>
                )}
                {multiTFAccess.hasAccess && selectedTimeframes.length === 0 && (
                  <Text style={styles.validationText}>Vui lòng chọn ít nhất 1 timeframe</Text>
                )}

                <TouchableOpacity
                  style={[
                    styles.applyButton,
                    (tempSelected.length === 0 || isScanning || (multiTFAccess.hasAccess && selectedTimeframes.length === 0)) && styles.applyButtonDisabled,
                  ]}
                  onPress={handleScanNow}
                  disabled={tempSelected.length === 0 || isScanning || (multiTFAccess.hasAccess && selectedTimeframes.length === 0)}
                  activeOpacity={0.8}
                >
                  {isScanning ? (
                    <View style={styles.scanButtonContent}>
                      <ActivityIndicator size="small" color="#FFFFFF" />
                      <Text style={styles.applyButtonText}>Đang quét...</Text>
                    </View>
                  ) : (
                    <View style={styles.scanButtonContent}>
                      <Zap size={20} color="#FFFFFF" />
                      <Text style={styles.applyButtonText}>
                        Scan Now ({tempSelected.length} coin{multiTFAccess.hasAccess ? ` × ${selectedTimeframes.length} TF` : ''})
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        </SafeAreaView>
      </Modal>

      {/* Custom Alert Component */}
      {AlertComponent}
    </>
  );
};

const styles = StyleSheet.create({
  selectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: GLASS.background,
    borderRadius: 14,
    borderWidth: 1.2,
    borderColor: 'rgba(106, 91, 255, 0.3)',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  selectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectorIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(106, 91, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  selectorText: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#0F1030', // App theme dark purple (not pure black)
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  modalContent: {
    flex: 1,
    backgroundColor: '#0F1030', // App theme dark purple
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.sm,
    backgroundColor: '#0F1030',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  selectionBadge: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.gold,
    backgroundColor: 'rgba(255, 189, 89, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  closeButton: {
    padding: 6,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },

  // Collapsible Section
  collapsibleSection: {
    backgroundColor: '#0F1030',
    paddingHorizontal: SPACING.md,
    overflow: 'hidden',
  },
  compactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  searchContainerCompact: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(20, 18, 35, 0.95)',
    borderRadius: 8,
    paddingHorizontal: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
    height: 36,
  },
  searchInputCompact: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textPrimary,
    paddingVertical: 0,
    paddingHorizontal: 6,
  },
  tfBadgeCompact: {
    backgroundColor: 'rgba(255, 189, 89, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tfBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.gold,
  },

  // Compact Timeframe Buttons
  timeframeRowCompact: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: SPACING.xs,
  },
  tfBtnCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: 'rgba(20, 18, 35, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
    gap: 3,
  },
  tfBtnActive: {
    backgroundColor: 'rgba(106, 91, 255, 0.3)',
    borderColor: COLORS.gold,
  },
  tfBtnDisabled: {
    opacity: 0.4,
  },
  tfBtnLocked: {
    backgroundColor: 'rgba(50, 50, 50, 0.4)',
    borderColor: 'rgba(100, 100, 100, 0.3)',
    opacity: 0.5,
  },
  tfBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  tfBtnTextActive: {
    color: COLORS.gold,
  },
  tfBtnTextLocked: {
    color: COLORS.textMuted,
  },

  // Compact Tabs Row
  tabsRowCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  tabCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    gap: 4,
  },
  tabCompactActive: {
    backgroundColor: 'rgba(106, 91, 255, 0.2)',
  },
  tabTextCompact: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  tabTextCompactActive: {
    color: COLORS.gold,
  },
  clearBtnCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
    paddingVertical: 4,
    paddingHorizontal: 8,
    gap: 3,
  },
  clearBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.error,
  },

  // Expand Bar (when collapsed) - height controlled by animation
  expandBar: {
    backgroundColor: 'rgba(106, 91, 255, 0.15)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(106, 91, 255, 0.3)',
    overflow: 'hidden',
  },
  expandBarTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.md,
    height: 36,
  },
  expandBarText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },

  // Legacy styles (keep for compatibility)
  selectionControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SPACING.md,
    marginTop: SPACING.xs,
    gap: SPACING.sm,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: SPACING.sm,
    borderRadius: 6,
    backgroundColor: 'rgba(20, 18, 35, 0.9)',
    gap: 4,
  },
  selectButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  selectionCount: {
    fontSize: 12,
    color: COLORS.gold,
    fontWeight: '700',
    marginLeft: 'auto',
  },
  coinsListContainer: {
    flex: 1,
    position: 'relative',
  },
  coinsList: {
    flex: 1,
  },
  coinsListContent: {
    paddingHorizontal: 4,
    paddingBottom: 100,
    paddingTop: 0,
  },
  coinItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    marginBottom: 1,
    backgroundColor: 'rgba(20, 18, 35, 0.6)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  coinItemSelected: {
    backgroundColor: 'rgba(255, 189, 89, 0.1)',
  },
  favoriteBtn: {
    padding: 6,
    marginRight: 4,
  },
  checkbox: {
    marginRight: SPACING.sm,
  },
  coinInfo: {
    flex: 1,
  },
  symbolRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  coinSymbol: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  perpLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  volumeText: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  priceInfo: {
    alignItems: 'flex-end',
  },
  priceText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  changeText: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
  },
  changePositive: {
    color: '#22C55E',
  },
  changeNegative: {
    color: '#EF4444',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textMuted,
    marginTop: SPACING.md,
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textMuted,
  },
  applyButtonWrapper: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    paddingBottom: 60,
    borderTopWidth: 1,
    borderTopColor: 'rgba(106, 91, 255, 0.2)',
    backgroundColor: '#0F1030',
  },
  applyButton: {
    backgroundColor: COLORS.burgundy,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.gold,
  },
  applyButtonDisabled: {
    backgroundColor: 'rgba(100, 100, 100, 0.3)',
    borderColor: 'rgba(100, 100, 100, 0.5)',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  scanButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },

  // Timeframe Selector Styles (TIER2/3)
  timeframeSelectorContainer: {
    marginHorizontal: SPACING.xxl,
    marginTop: SPACING.lg,
    backgroundColor: 'rgba(106, 91, 255, 0.1)',
    borderRadius: 12,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.3)',
  },
  timeframeSelectorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  timeframeSelectorTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.gold,
  },
  timeframeSelectorCount: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.cyan,
  },
  timeframeButtonsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  timeframeButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: 'rgba(20, 18, 35, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
  },
  timeframeButtonActive: {
    backgroundColor: 'rgba(106, 91, 255, 0.3)',
    borderColor: COLORS.gold,
  },
  timeframeButtonDisabled: {
    backgroundColor: 'rgba(50, 50, 50, 0.3)',
    borderColor: 'rgba(100, 100, 100, 0.2)',
  },
  timeframeButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textSecondary,
  },
  timeframeButtonTextActive: {
    color: COLORS.gold,
  },
  timeframeButtonTextDisabled: {
    color: COLORS.textMuted,
  },

  // Locked timeframe button styles (FREE/TIER1)
  timeframeButtonLocked: {
    backgroundColor: 'rgba(50, 50, 50, 0.4)',
    borderColor: 'rgba(100, 100, 100, 0.3)',
    opacity: 0.6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeframeButtonTextLocked: {
    color: COLORS.textMuted,
  },
  lockIcon: {
    marginRight: 2,
  },
  lockedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(100, 100, 100, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  lockedBadgeText: {
    fontSize: 10,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textMuted,
  },
  timeframeLockHint: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.sm,
    fontStyle: 'italic',
  },

  // Selection controls
  selectButtonTextClear: {
    color: COLORS.error,
  },

  // Validation message
  validationText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.error,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
});

export default CoinSelector;
