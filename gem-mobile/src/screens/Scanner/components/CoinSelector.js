/**
 * GEM Mobile - Coin Selector (Upgraded)
 * 500+ coins with search, favorites, and multi-select
 * FIXED: Full screen modal, proper scroll, Apply button visible
 */

import React, { useState, useEffect, useMemo, useCallback, useRef, memo } from 'react';
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
  DeviceEventEmitter,
} from 'react-native';
import CustomAlert, { useCustomAlert } from '../../../components/CustomAlert';
import {
  ChevronDown,
  ChevronUp,
  Search,
  Star,
  X,
  CheckSquare,
  Square,
  Clock,
  TrendingUp,
  Zap,
  Lock,
  ArrowUpDown,
  SlidersHorizontal,
} from 'lucide-react-native';
import { binanceService } from '../../../services/binanceService';
import { favoritesService } from '../../../services/favoritesService';
import { COLORS, SPACING, TYPOGRAPHY, GLASS } from '../../../utils/tokens';
import { formatPrice } from '../../../utils/formatters';
import { FORCE_REFRESH_EVENT } from '../../../utils/loadingStateManager';
import { tierAccessService } from '../../../services/tierAccessService';
import { MULTI_TF_TIMEFRAMES, checkMultiTFAccess } from '../../../services/multiTimeframeScanner';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const ITEM_HEIGHT = 58; // Fixed height for getItemLayout optimization

// Memoized Coin Item Component for better scroll performance
const CoinItem = memo(({
  item,
  isSelected,
  isFavorite,
  ticker,
  multiSelect,
  onPress,
  onToggleFavorite,
  onToggleCoin,
}) => {
  const priceChange = ticker?.priceChangePercent || 0;
  const isPositive = priceChange >= 0;

  // Format volume
  const formatVolume = (vol) => {
    if (!vol || isNaN(vol)) return '0';
    if (vol >= 1e9) return (vol / 1e9).toFixed(2) + 'B';
    if (vol >= 1e6) return (vol / 1e6).toFixed(2) + 'M';
    if (vol >= 1e3) return (vol / 1e3).toFixed(2) + 'K';
    return vol.toFixed(2);
  };

  return (
    <TouchableOpacity
      style={[styles.coinItem, isSelected && styles.coinItemSelected]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Left: Favorite + Checkbox */}
      <TouchableOpacity
        style={styles.favoriteBtn}
        onPress={onToggleFavorite}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Star
          size={20}
          color={isFavorite ? COLORS.gold : COLORS.textMuted}
          fill={isFavorite ? COLORS.gold : 'transparent'}
        />
      </TouchableOpacity>

      {multiSelect && (
        <TouchableOpacity
          style={styles.checkbox}
          onPress={onToggleCoin}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          {isSelected ? (
            <CheckSquare size={24} color={COLORS.gold} />
          ) : (
            <Square size={24} color={COLORS.textMuted} />
          )}
        </TouchableOpacity>
      )}

      {/* Middle: Symbol + Volume */}
      <View style={styles.coinInfo}>
        <View style={styles.symbolRow}>
          <Text style={styles.coinSymbol}>{item.symbol}</Text>
          <Text style={styles.perpLabel}>Vĩnh cửu</Text>
        </View>
        <Text style={styles.volumeText}>
          KL {formatVolume(ticker?.quoteVolume)} USDT
        </Text>
      </View>

      {/* Right: Price + % Change */}
      <View style={styles.priceInfo}>
        <Text style={styles.priceText}>{formatPrice(ticker?.price)}</Text>
        <Text style={[
          styles.changeText,
          isPositive ? styles.changePositive : styles.changeNegative,
        ]}>
          {isPositive ? '+' : ''}{priceChange.toFixed(2)}%
        </Text>
      </View>
    </TouchableOpacity>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for memo - only re-render when these change
  return (
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.isFavorite === nextProps.isFavorite &&
    prevProps.ticker?.price === nextProps.ticker?.price &&
    prevProps.ticker?.priceChangePercent === nextProps.ticker?.priceChangePercent
  );
});

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

  // Sorting state - Binance style
  const [sortBy, setSortBy] = useState('volume'); // 'name', 'volume', 'price', 'change'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc', 'desc'

  // Multi-Timeframe Selection
  const multiTFAccess = checkMultiTFAccess(userTier);
  const [selectedTimeframes, setSelectedTimeframes] = useState([selectedTimeframe]); // Default to current TF
  const MAX_TIMEFRAMES = 3; // Limit to 3 timeframes per scan
  const MAX_COINS_PER_SCAN = 10; // Limit 10 coins per scan

  // FlatList ref for scroll optimization
  const flatListRef = useRef(null);

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

  // Rule 31: Recovery listener for app resume
  useEffect(() => {
    const listener = DeviceEventEmitter.addListener(FORCE_REFRESH_EVENT, () => {
      console.log('[CoinSelector] Force refresh received');
      setLoading(false);
      setTimeout(() => loadData(), 50); // Rule 57: Break React 18 batch
    });
    return () => listener.remove();
  }, []);

  // Real-time price updates when modal is open (every 1 second like Binance)
  useEffect(() => {
    if (!modalVisible) return;

    const updateTickers = async () => {
      try {
        // Pass silent=true to suppress console logs during real-time updates
        const tickers = await binanceService.getAllFuturesTickers(true);
        setTickerData(tickers);
      } catch (error) {
        // Silent fail for real-time updates
      }
    };

    // Update immediately then every 1 second
    updateTickers();
    const interval = setInterval(updateTickers, 1000);

    return () => clearInterval(interval);
  }, [modalVisible]);

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

  // Filter and sort coins - Binance style
  const filteredCoins = useMemo(() => {
    let coins = [...allCoins];

    if (activeTab === 'favorites') {
      coins = coins.filter(c => favorites.includes(c.symbol));
    } else if (activeTab === 'recent') {
      coins = coins.filter(c => recentCoins.includes(c.symbol));
      // Recent tab uses its own order
      coins.sort((a, b) => recentCoins.indexOf(a.symbol) - recentCoins.indexOf(b.symbol));
      // Skip further sorting for recent
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        coins = coins.filter(c =>
          c.symbol.toLowerCase().includes(query) ||
          c.baseAsset.toLowerCase().includes(query)
        );
      }
      return coins;
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      coins = coins.filter(c =>
        c.symbol.toLowerCase().includes(query) ||
        c.baseAsset.toLowerCase().includes(query)
      );
    }

    // Apply sorting - Binance style
    coins.sort((a, b) => {
      const tickerA = tickerData[a.symbol] || {};
      const tickerB = tickerData[b.symbol] || {};
      let comparison = 0;

      switch (sortBy) {
        case 'name':
          comparison = a.symbol.localeCompare(b.symbol);
          break;
        case 'volume':
          comparison = (tickerB.quoteVolume || 0) - (tickerA.quoteVolume || 0);
          break;
        case 'price':
          comparison = (tickerB.price || 0) - (tickerA.price || 0);
          break;
        case 'change':
          comparison = (tickerB.priceChangePercent || 0) - (tickerA.priceChangePercent || 0);
          break;
        default:
          comparison = (tickerB.quoteVolume || 0) - (tickerA.quoteVolume || 0);
      }

      return sortOrder === 'asc' ? -comparison : comparison;
    });

    return coins;
  }, [allCoins, favorites, recentCoins, searchQuery, activeTab, sortBy, sortOrder, tickerData]);

  // Toggle sort - Binance style (tap same column to toggle order)
  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc'); // Default to descending
    }
  };

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
    setModalVisible(true);
  };

  const closeModal = (saveSelection = true) => {
    // IMPORTANT: Always save selection when closing modal
    // This ensures coins aren't lost when user clicks X button
    if (saveSelection && multiSelect && onCoinsChange && tempSelected.length > 0) {
      console.log('[CoinSelector] Saving selection on close:', tempSelected.length, 'coins');
      onCoinsChange(tempSelected);
    }
    setModalVisible(false);
  };

  const applySelection = () => {
    if (multiSelect && onCoinsChange) {
      onCoinsChange(tempSelected);
    }
    closeModal(false); // Don't save again, already saved above
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

    // Store the selection before closing
    const coinsToScan = [...tempSelected];
    const timeframesToScan = [...selectedTimeframes];

    // Apply the selection first
    if (multiSelect && onCoinsChange) {
      onCoinsChange(coinsToScan);
    }

    // Notify parent about selected timeframes
    if (onTimeframesChange) {
      onTimeframesChange(timeframesToScan);
    }

    // Close modal without saving again
    closeModal(false);

    // Trigger scan with the selected coins AND timeframes
    if (onScanNow) {
      // Small delay to ensure modal is closed before scan starts
      setTimeout(() => {
        console.log('[CoinSelector] Triggering scan with:', coinsToScan.length, 'coins,', timeframesToScan.length, 'timeframes');
        onScanNow(coinsToScan, timeframesToScan);
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

  // getItemLayout for FlatList optimization - fixed height items
  const getItemLayout = useCallback((data, index) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  }), []);

  const toggleFavorite = useCallback(async (symbol) => {
    const newFavorites = await favoritesService.toggleFavorite(symbol);
    setFavorites(newFavorites);
  }, []);

  // Memoized render function using the CoinItem component
  const renderCoinItem = useCallback(({ item }) => {
    const isSelected = multiSelect ? tempSelected.includes(item.symbol) : item.symbol === selected;
    const isFavorite = favorites.includes(item.symbol);
    const ticker = tickerData[item.symbol];

    return (
      <CoinItem
        item={item}
        isSelected={isSelected}
        isFavorite={isFavorite}
        ticker={ticker}
        multiSelect={multiSelect}
        onPress={() => handleCoinSelect(item)}
        onToggleFavorite={() => toggleFavorite(item.symbol)}
        onToggleCoin={() => toggleCoin(item.symbol)}
      />
    );
  }, [multiSelect, tempSelected, selected, favorites, tickerData, handleCoinSelect, toggleFavorite, toggleCoin]);

  // Key extractor for FlatList
  const keyExtractor = useCallback((item) => item.symbol, []);

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

            {/* Header Section - Search, Timeframes, Tabs */}
            <View style={styles.collapsibleSection}>
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

              {/* Timeframe Buttons - Single row, IMPROVED TOUCH */}
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
                      activeOpacity={0.6}
                      delayPressIn={0}
                      hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
                    >
                      {isLocked && <Lock size={10} color={COLORS.textMuted} />}
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

              {/* Tabs + Clear - IMPROVED TOUCH TARGETS */}
              <View style={styles.tabsRowCompact}>
                <TouchableOpacity
                  style={[styles.tabCompact, activeTab === 'all' && styles.tabCompactActive]}
                  onPress={() => setActiveTab('all')}
                  activeOpacity={0.6}
                  delayPressIn={0}
                  hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
                >
                  <Text style={[styles.tabTextCompact, activeTab === 'all' && styles.tabTextCompactActive]}>
                    All ({allCoins.length})
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.tabCompact, activeTab === 'favorites' && styles.tabCompactActive]}
                  onPress={() => setActiveTab('favorites')}
                  activeOpacity={0.6}
                  delayPressIn={0}
                  hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
                >
                  <Star size={14} color={activeTab === 'favorites' ? COLORS.gold : COLORS.textMuted} />
                  <Text style={[styles.tabTextCompact, activeTab === 'favorites' && styles.tabTextCompactActive]}>
                    ({favorites.length})
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.tabCompact, activeTab === 'recent' && styles.tabCompactActive]}
                  onPress={() => setActiveTab('recent')}
                  activeOpacity={0.6}
                  delayPressIn={0}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Clock size={16} color={activeTab === 'recent' ? COLORS.gold : COLORS.textMuted} />
                </TouchableOpacity>

                {/* Clear button on same row */}
                {multiSelect && tempSelected.length > 0 && (
                  <TouchableOpacity
                    style={styles.clearBtnCompact}
                    onPress={clearSelection}
                    activeOpacity={0.6}
                    delayPressIn={0}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <X size={14} color={COLORS.error} />
                    <Text style={styles.clearBtnText}>Xóa</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Sort Header - Binance style */}
            <View style={styles.sortHeader}>
              <TouchableOpacity
                style={styles.sortColumn}
                onPress={() => handleSort('name')}
                activeOpacity={0.7}
              >
                <Text style={[styles.sortLabel, sortBy === 'name' && styles.sortLabelActive]}>
                  Tên
                </Text>
                {sortBy === 'name' && (
                  sortOrder === 'asc' ?
                    <ChevronUp size={12} color={COLORS.gold} /> :
                    <ChevronDown size={12} color={COLORS.gold} />
                )}
                <Text style={styles.sortDivider}>/</Text>
                <TouchableOpacity onPress={() => handleSort('volume')}>
                  <Text style={[styles.sortLabel, sortBy === 'volume' && styles.sortLabelActive]}>
                    KL
                  </Text>
                </TouchableOpacity>
                {sortBy === 'volume' && (
                  sortOrder === 'asc' ?
                    <ChevronUp size={12} color={COLORS.gold} /> :
                    <ChevronDown size={12} color={COLORS.gold} />
                )}
              </TouchableOpacity>

              <View style={styles.sortColumnRight}>
                <TouchableOpacity
                  style={styles.sortItem}
                  onPress={() => handleSort('price')}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.sortLabel, sortBy === 'price' && styles.sortLabelActive]}>
                    Giá
                  </Text>
                  {sortBy === 'price' && (
                    sortOrder === 'asc' ?
                      <ChevronUp size={12} color={COLORS.gold} /> :
                      <ChevronDown size={12} color={COLORS.gold} />
                  )}
                </TouchableOpacity>
                <Text style={styles.sortDivider}>/</Text>
                <TouchableOpacity
                  style={styles.sortItem}
                  onPress={() => handleSort('change')}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.sortLabel, sortBy === 'change' && styles.sortLabelActive]}>
                    24h%
                  </Text>
                  {sortBy === 'change' && (
                    sortOrder === 'asc' ?
                      <ChevronUp size={12} color={COLORS.gold} /> :
                      <ChevronDown size={12} color={COLORS.gold} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Coins List Container */}
            <View style={styles.coinsListContainer}>
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={COLORS.gold} />
                  <Text style={styles.loadingText}>Loading coins...</Text>
                </View>
              ) : (
                <FlatList
                  ref={flatListRef}
                  data={filteredCoins}
                  renderItem={renderCoinItem}
                  keyExtractor={keyExtractor}
                  getItemLayout={getItemLayout}
                  style={styles.coinsList}
                  contentContainerStyle={styles.coinsListContent}
                  showsVerticalScrollIndicator={true}
                  // Performance optimizations
                  initialNumToRender={15}
                  maxToRenderPerBatch={10}
                  updateCellsBatchingPeriod={50}
                  windowSize={5}
                  removeClippedSubviews={true}
                  // Better touch handling
                  keyboardShouldPersistTaps="handled"
                  keyboardDismissMode="on-drag"
                  // Disable momentum for smoother feel
                  decelerationRate="fast"
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

  // Header Section (search, timeframes, tabs)
  collapsibleSection: {
    backgroundColor: '#0F1030',
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xs,
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

  // Compact Timeframe Buttons - IMPROVED TOUCH TARGETS
  timeframeRowCompact: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: SPACING.xs,
  },
  tfBtnCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 28, // Reduced for compact display
    minWidth: 36,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: 'rgba(20, 18, 35, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
    gap: 2,
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
    fontSize: 12, // Compact size
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  tfBtnTextActive: {
    color: COLORS.gold,
  },
  tfBtnTextLocked: {
    color: COLORS.textMuted,
  },

  // Compact Tabs Row - IMPROVED TOUCH TARGETS
  tabsRowCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  tabCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 36, // Minimum touch target
    minWidth: 44, // Minimum touch target
    paddingVertical: 8, // Increased from 4
    paddingHorizontal: 12, // Increased from 8
    borderRadius: 8,
    gap: 4,
  },
  tabCompactActive: {
    backgroundColor: 'rgba(106, 91, 255, 0.2)',
  },
  tabTextCompact: {
    fontSize: 13, // Increased from 11 for readability
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  tabTextCompactActive: {
    color: COLORS.gold,
  },
  clearBtnCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 'auto',
    minHeight: 36, // Minimum touch target
    paddingVertical: 8, // Increased from 4
    paddingHorizontal: 12, // Increased from 8
    borderRadius: 8,
    gap: 4,
  },
  clearBtnText: {
    fontSize: 13, // Increased from 11
    fontWeight: '600',
    color: COLORS.error,
  },

  // Sort Header - Binance style
  sortHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    backgroundColor: 'rgba(20, 18, 35, 0.8)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  sortColumn: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sortColumnRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  sortLabelActive: {
    color: COLORS.gold,
    fontWeight: '700',
  },
  sortDivider: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginHorizontal: 4,
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
    height: ITEM_HEIGHT, // Fixed height for getItemLayout optimization
    paddingVertical: 8,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(20, 18, 35, 0.6)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  coinItemSelected: {
    backgroundColor: 'rgba(255, 189, 89, 0.1)',
  },
  favoriteBtn: {
    padding: 10, // Increased from 6 for better touch target
    marginRight: 2,
    minWidth: 38, // Ensure minimum touch area
    minHeight: 38,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkbox: {
    padding: 8, // Added padding for better touch target
    marginRight: SPACING.xs,
    minWidth: 36, // Ensure minimum touch area
    minHeight: 36,
    justifyContent: 'center',
    alignItems: 'center',
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
    gap: 6,
  },
  timeframeButton: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: 'rgba(20, 18, 35, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
    minWidth: 40,
    alignItems: 'center',
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
    fontSize: 13,
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
    gap: 2,
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
