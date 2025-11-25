/**
 * GEM Mobile - Coin Selector (Upgraded)
 * 500+ coins with search, favorites, and multi-select
 * FIXED: Full screen modal, proper scroll, Apply button visible
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
} from 'react-native';
import {
  ChevronDown,
  Search,
  Star,
  X,
  CheckSquare,
  Square,
  Clock,
  TrendingUp,
} from 'lucide-react-native';
import { binanceService } from '../../../services/binanceService';
import { favoritesService } from '../../../services/favoritesService';
import { COLORS, SPACING, TYPOGRAPHY, GLASS } from '../../../utils/tokens';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const CoinSelector = ({
  selected = 'BTCUSDT',
  onSelect,
  multiSelect = false,
  selectedCoins = [],
  onCoinsChange,
  maxSelection = 50, // Increased from 20 to 50
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [allCoins, setAllCoins] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [recentCoins, setRecentCoins] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [tempSelected, setTempSelected] = useState([]);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [coins, favs, recent] = await Promise.all([
        binanceService.getAllCoins(),
        favoritesService.getFavorites(),
        favoritesService.getRecent(),
      ]);
      setAllCoins(coins);
      setFavorites(favs);
      setRecentCoins(recent);
    } catch (error) {
      console.error('[CoinSelector] Load error:', error);
      setAllCoins(binanceService.getDefaultCoins());
    } finally {
      setLoading(false);
    }
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
    // Start with current selection or empty array
    if (multiSelect) {
      // Only use selectedCoins if they exist, otherwise empty
      setTempSelected(selectedCoins.length > 0 ? [...selectedCoins] : []);
    }
    setSearchQuery('');
    setActiveTab('all');
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
      } else if (prev.length < maxSelection) {
        return [...prev, symbol];
      }
      return prev;
    });
  };

  const selectAll = () => {
    // Select ALL visible coins (up to maxSelection)
    const visibleSymbols = filteredCoins.map(c => c.symbol);
    // Replace current selection with all visible coins
    setTempSelected(visibleSymbols.slice(0, maxSelection));
    console.log(`[CoinSelector] Selected ${Math.min(visibleSymbols.length, maxSelection)} coins`);
  };

  // Check if all visible coins are selected
  const isAllSelected = useMemo(() => {
    if (filteredCoins.length === 0) return false;
    const visibleSymbols = filteredCoins.map(c => c.symbol);
    return visibleSymbols.slice(0, maxSelection).every(s => tempSelected.includes(s));
  }, [filteredCoins, tempSelected, maxSelection]);

  const deselectAll = () => {
    setTempSelected([]);
  };

  const toggleFavorite = async (symbol) => {
    const newFavorites = await favoritesService.toggleFavorite(symbol);
    setFavorites(newFavorites);
  };

  const renderCoinItem = useCallback(({ item }) => {
    const isSelected = multiSelect ? tempSelected.includes(item.symbol) : item.symbol === selected;
    const isFavorite = favorites.includes(item.symbol);

    return (
      <TouchableOpacity
        style={[styles.coinItem, isSelected && styles.coinItemSelected]}
        onPress={() => handleCoinSelect(item)}
        activeOpacity={0.7}
      >
        {multiSelect && (
          <View style={styles.checkbox}>
            {isSelected ? (
              <CheckSquare size={22} color={COLORS.gold} />
            ) : (
              <Square size={22} color={COLORS.textMuted} />
            )}
          </View>
        )}

        <View style={styles.coinInfo}>
          <View style={[styles.coinIcon, isFavorite && styles.coinIconFavorite]}>
            <Text style={styles.coinIconText}>{item.baseAsset.charAt(0)}</Text>
          </View>
          <View>
            <Text style={styles.coinSymbol}>{item.baseAsset}</Text>
            <Text style={styles.coinPair}>{item.displayName}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={() => toggleFavorite(item.symbol)}
        >
          <Star
            size={20}
            color={isFavorite ? COLORS.gold : COLORS.textMuted}
            fill={isFavorite ? COLORS.gold : 'transparent'}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  }, [multiSelect, tempSelected, selected, favorites]);

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
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{multiSelect ? 'Select Coins' : 'Choose Coin'}</Text>
              <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                <X size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>

            {/* Search */}
            <View style={styles.searchContainer}>
              <Search size={20} color={COLORS.textMuted} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search coins..."
                placeholderTextColor={COLORS.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCapitalize="characters"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <X size={18} color={COLORS.textMuted} />
                </TouchableOpacity>
              )}
            </View>

            {/* Tabs */}
            <View style={styles.tabsContainer}>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'all' && styles.tabActive]}
                onPress={() => setActiveTab('all')}
              >
                <TrendingUp size={14} color={activeTab === 'all' ? COLORS.gold : COLORS.textMuted} />
                <Text style={[styles.tabText, activeTab === 'all' && styles.tabTextActive]}>
                  All ({allCoins.length})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tab, activeTab === 'favorites' && styles.tabActive]}
                onPress={() => setActiveTab('favorites')}
              >
                <Star size={14} color={activeTab === 'favorites' ? COLORS.gold : COLORS.textMuted} />
                <Text style={[styles.tabText, activeTab === 'favorites' && styles.tabTextActive]}>
                  Favorites ({favorites.length})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tab, activeTab === 'recent' && styles.tabActive]}
                onPress={() => setActiveTab('recent')}
              >
                <Clock size={14} color={activeTab === 'recent' ? COLORS.gold : COLORS.textMuted} />
                <Text style={[styles.tabText, activeTab === 'recent' && styles.tabTextActive]}>
                  Recent
                </Text>
              </TouchableOpacity>
            </View>

            {/* Selection controls (multi-select) */}
            {multiSelect && (
              <View style={styles.selectionControls}>
                <TouchableOpacity
                  style={[styles.selectButton, isAllSelected && styles.selectButtonActive]}
                  onPress={isAllSelected ? deselectAll : selectAll}
                >
                  {isAllSelected ? (
                    <CheckSquare size={16} color={COLORS.gold} />
                  ) : (
                    <Square size={16} color={COLORS.textMuted} />
                  )}
                  <Text style={[styles.selectButtonText, isAllSelected && styles.selectButtonTextActive]}>
                    {isAllSelected ? 'Deselect All' : 'Select All'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.selectButton} onPress={deselectAll}>
                  <X size={16} color={COLORS.textMuted} />
                  <Text style={styles.selectButtonText}>Clear</Text>
                </TouchableOpacity>
                <Text style={styles.selectionCount}>
                  {tempSelected.length}/{Math.min(filteredCoins.length, maxSelection)}
                </Text>
              </View>
            )}

            {/* Coins List */}
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
                showsVerticalScrollIndicator={false}
                initialNumToRender={20}
                maxToRenderPerBatch={30}
                windowSize={10}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No coins found</Text>
                  </View>
                }
              />
            )}

            {/* Apply Button (multi-select) - Fixed at bottom */}
            {multiSelect && (
              <View style={styles.applyButtonWrapper}>
                <TouchableOpacity
                  style={[styles.applyButton, tempSelected.length === 0 && styles.applyButtonDisabled]}
                  onPress={applySelection}
                  disabled={tempSelected.length === 0}
                >
                  <Text style={styles.applyButtonText}>
                    Apply ({tempSelected.length} coins)
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </SafeAreaView>
      </Modal>
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
    backgroundColor: COLORS.bgDark,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  modalContent: {
    flex: 1,
    backgroundColor: COLORS.bgDark,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xxl,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(106, 91, 255, 0.2)',
    backgroundColor: COLORS.bgDark,
  },
  closeButton: {
    padding: SPACING.sm,
  },
  modalTitle: {
    fontSize: TYPOGRAPHY.fontSize.display,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GLASS.background,
    borderRadius: 12,
    marginHorizontal: SPACING.xxl,
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.3)',
  },
  searchInput: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textPrimary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: SPACING.xxl,
    marginTop: SPACING.lg,
    gap: SPACING.sm,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 20,
    backgroundColor: GLASS.background,
    gap: 6,
  },
  tabActive: {
    backgroundColor: 'rgba(106, 91, 255, 0.2)',
    borderWidth: 1,
    borderColor: COLORS.purple,
  },
  tabText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textMuted,
  },
  tabTextActive: {
    color: COLORS.gold,
  },
  selectionControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SPACING.xxl,
    marginTop: SPACING.md,
    gap: SPACING.md,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: SPACING.sm,
    borderRadius: 8,
    backgroundColor: GLASS.background,
    gap: 6,
  },
  selectButtonActive: {
    backgroundColor: 'rgba(106, 91, 255, 0.25)',
    borderWidth: 1,
    borderColor: COLORS.gold,
  },
  selectButtonText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textSecondary,
  },
  selectButtonTextActive: {
    color: COLORS.gold,
  },
  selectionCount: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gold,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    marginLeft: 'auto',
  },
  coinsList: {
    flex: 1,
    marginTop: SPACING.md,
  },
  coinsListContent: {
    paddingHorizontal: SPACING.xxl,
    paddingBottom: SPACING.xxl,
  },
  coinItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
    borderRadius: 12,
    backgroundColor: GLASS.background,
    borderWidth: 1.2,
    borderColor: 'rgba(106, 91, 255, 0.2)',
  },
  coinItemSelected: {
    borderColor: COLORS.gold,
    backgroundColor: 'rgba(106, 91, 255, 0.25)',
  },
  checkbox: {
    marginRight: SPACING.md,
  },
  coinInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  coinIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(106, 91, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  coinIconFavorite: {
    backgroundColor: 'rgba(255, 189, 89, 0.2)',
  },
  coinIconText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.purple,
  },
  coinSymbol: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  coinPair: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  favoriteButton: {
    padding: SPACING.sm,
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
    paddingHorizontal: SPACING.xxl,
    paddingVertical: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(106, 91, 255, 0.2)',
    backgroundColor: COLORS.bgDark,
  },
  applyButton: {
    backgroundColor: COLORS.burgundy,
    paddingVertical: SPACING.lg,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.gold,
  },
  applyButtonDisabled: {
    backgroundColor: 'rgba(100, 100, 100, 0.3)',
    borderColor: 'rgba(100, 100, 100, 0.5)',
  },
  applyButtonText: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
});

export default CoinSelector;
