// src/components/Trading/CoinSelectorModal.js
import React, { useState, useCallback, useMemo, memo } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  FlatList,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Search, Check, CheckSquare, Square, ChevronDown } from 'lucide-react-native';

const CoinSelectorModal = ({
  visible,
  onClose,
  coins = [],
  selectedCoins = [],
  onApply,
  loading = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [localSelected, setLocalSelected] = useState(selectedCoins);
  const [activeTab, setActiveTab] = useState('all');

  // CRITICAL: Không giới hạn 50 coins
  const MAX_COINS = 500; // Tăng lên 500

  const tabs = useMemo(() => [
    { id: 'all', label: `Tất cả (${coins.length})` },
    { id: 'selected', label: `Đã chọn (${localSelected.length})` },
    { id: 'favorites', label: 'Yêu thích' },
  ], [coins.length, localSelected.length]);

  const filteredCoins = useMemo(() => {
    let result = coins;

    // Filter by tab
    if (activeTab === 'selected') {
      result = coins.filter(c => localSelected.includes(c.symbol));
    }

    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(c =>
        c.symbol?.toLowerCase().includes(query) ||
        c.name?.toLowerCase().includes(query)
      );
    }

    return result;
  }, [coins, activeTab, searchQuery, localSelected]);

  // SELECT ALL - KHÔNG GIỚI HẠN 50
  const handleSelectAll = useCallback(() => {
    const allSymbols = filteredCoins.slice(0, MAX_COINS).map(c => c.symbol);
    setLocalSelected(allSymbols);
  }, [filteredCoins]);

  const handleDeselectAll = useCallback(() => {
    setLocalSelected([]);
  }, []);

  const handleToggleCoin = useCallback((symbol) => {
    setLocalSelected(prev => {
      if (prev.includes(symbol)) {
        return prev.filter(s => s !== symbol);
      }
      if (prev.length >= MAX_COINS) {
        return prev; // Đã đạt giới hạn
      }
      return [...prev, symbol];
    });
  }, []);

  const handleApply = useCallback(() => {
    onApply(localSelected);
    onClose();
  }, [localSelected, onApply, onClose]);

  const renderCoinItem = useCallback(({ item }) => {
    const isSelected = localSelected.includes(item.symbol);

    return (
      <TouchableOpacity
        style={[styles.coinItem, isSelected && styles.coinItemSelected]}
        onPress={() => handleToggleCoin(item.symbol)}
      >
        <View style={styles.coinInfo}>
          <Text style={styles.coinSymbol}>{item.symbol}</Text>
          {item.name && (
            <Text style={styles.coinName} numberOfLines={1}>{item.name}</Text>
          )}
        </View>

        {isSelected ? (
          <CheckSquare size={22} color="#FFBD59" />
        ) : (
          <Square size={22} color="#4A5568" />
        )}
      </TouchableOpacity>
    );
  }, [localSelected, handleToggleCoin]);

  const isAllSelected = filteredCoins.length > 0 &&
    filteredCoins.every(c => localSelected.includes(c.symbol));

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <SafeAreaView style={styles.container} edges={['bottom']}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Chọn Coins để Scan</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Search */}
          <View style={styles.searchContainer}>
            <Search size={18} color="#718096" />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm kiếm coin..."
              placeholderTextColor="#718096"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Tabs */}
          <View style={styles.tabs}>
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab.id}
                style={[styles.tab, activeTab === tab.id && styles.tabActive]}
                onPress={() => setActiveTab(tab.id)}
              >
                <Text style={[
                  styles.tabText,
                  activeTab === tab.id && styles.tabTextActive
                ]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Select All / Deselect All */}
          <View style={styles.selectAllRow}>
            <TouchableOpacity
              style={styles.selectAllButton}
              onPress={isAllSelected ? handleDeselectAll : handleSelectAll}
            >
              {isAllSelected ? (
                <CheckSquare size={18} color="#FFBD59" />
              ) : (
                <Square size={18} color="#A0AEC0" />
              )}
              <Text style={styles.selectAllText}>
                {isAllSelected ? 'Bỏ chọn tất cả' : `Chọn tất cả (${Math.min(filteredCoins.length, MAX_COINS)})`}
              </Text>
            </TouchableOpacity>

            <Text style={styles.countText}>
              {localSelected.length}/{MAX_COINS}
            </Text>
          </View>

          {/* Coin List */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FFBD59" />
              <Text style={styles.loadingText}>Đang tải danh sách coins...</Text>
            </View>
          ) : (
            <FlatList
              data={filteredCoins}
              keyExtractor={(item) => item.symbol}
              renderItem={renderCoinItem}
              style={styles.list}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              initialNumToRender={20}
              maxToRenderPerBatch={20}
              windowSize={10}
            />
          )}

          {/* CRITICAL: Apply Button với padding bottom */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
            >
              <Text style={styles.cancelText}>Hủy</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.applyButton,
                localSelected.length === 0 && styles.applyButtonDisabled
              ]}
              onPress={handleApply}
              disabled={localSelected.length === 0}
            >
              <Check size={18} color="#0A0F1C" />
              <Text style={styles.applyText}>
                Áp dụng ({localSelected.length} coins)
              </Text>
            </TouchableOpacity>
          </View>

          {/* Extra bottom padding for Android */}
          <View style={styles.bottomSpacer} />
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#1A202C',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  closeButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginHorizontal: 16,
    marginVertical: 12,
  },
  searchInput: {
    flex: 1,
    height: 44,
    color: '#FFFFFF',
    fontSize: 14,
    marginLeft: 8,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 12,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  tabActive: {
    backgroundColor: 'rgba(255, 189, 89, 0.2)',
  },
  tabText: {
    fontSize: 13,
    color: '#A0AEC0',
  },
  tabTextActive: {
    color: '#FFBD59',
    fontWeight: '600',
  },
  selectAllRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  selectAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  selectAllText: {
    fontSize: 14,
    color: '#A0AEC0',
  },
  countText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFBD59',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    color: '#A0AEC0',
    fontSize: 14,
  },
  coinItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 10,
    marginBottom: 8,
  },
  coinItemSelected: {
    backgroundColor: 'rgba(255, 189, 89, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.3)',
  },
  coinInfo: {
    flex: 1,
  },
  coinSymbol: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  coinName: {
    fontSize: 12,
    color: '#718096',
    marginTop: 2,
  },
  // CRITICAL: Footer với padding đủ
  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#A0AEC0',
  },
  applyButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#FFBD59',
    gap: 8,
  },
  applyButtonDisabled: {
    backgroundColor: '#4A5568',
    opacity: 0.6,
  },
  applyText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0A0F1C',
  },
  // CRITICAL: Extra padding for Android bottom
  bottomSpacer: {
    height: Platform.OS === 'android' ? 24 : 0,
  },
});

export default memo(CoinSelectorModal);
