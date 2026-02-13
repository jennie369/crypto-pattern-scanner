/**
 * GEM Mobile - Portfolio Screen
 * Manage crypto portfolio with real-time prices
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  Plus,
  TrendingUp,
  TrendingDown,
  Wallet,
  Edit2,
  Trash2,
  X,
  Search,
} from 'lucide-react-native';

import { COLORS, GRADIENTS, SPACING, TYPOGRAPHY, GLASS } from '../../utils/tokens';
import { useAuth } from '../../contexts/AuthContext';
import { portfolioService } from '../../services/portfolioService';

export default function PortfolioScreen({ navigation }) {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [portfolio, setPortfolio] = useState([]);
  const [summary, setSummary] = useState(null);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editItem, setEditItem] = useState(null);

  // Form state
  const [formSymbol, setFormSymbol] = useState('');
  const [formQuantity, setFormQuantity] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const loadData = useCallback(async () => {
    if (!user?.id) return;

    try {
      const portfolioData = await portfolioService.getUserPortfolio(user.id);
      setPortfolio(portfolioData);

      const summaryData = await portfolioService.getPortfolioSummary(user.id);
      setSummary(summaryData);
    } catch (error) {
      console.error('[Portfolio] Load error:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleSearch = async (query) => {
    setFormSymbol(query);
    if (query.length < 1) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    const results = await portfolioService.searchCoin(query);
    setSearchResults(results);
    setSearching(false);
  };

  const selectCoin = (coin) => {
    setFormSymbol(coin.symbol);
    setSearchResults([]);
  };

  const openAddModal = () => {
    setFormSymbol('');
    setFormQuantity('');
    setFormPrice('');
    setFormNotes('');
    setEditItem(null);
    setAddModalVisible(true);
  };

  const openEditModal = (item) => {
    setFormSymbol(item.symbol);
    setFormQuantity(item.quantity.toString());
    setFormPrice(item.avg_buy_price.toString());
    setFormNotes(item.notes || '');
    setEditItem(item);
    setAddModalVisible(true);
  };

  const handleSave = async () => {
    if (!formSymbol || !formQuantity || !formPrice) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
      return;
    }

    const quantity = parseFloat(formQuantity);
    const price = parseFloat(formPrice);

    if (isNaN(quantity) || isNaN(price) || quantity <= 0 || price <= 0) {
      Alert.alert('Lỗi', 'Số lượng và giá phải là số dương');
      return;
    }

    try {
      if (editItem) {
        // Update existing
        const result = await portfolioService.updateCoin(editItem.id, {
          symbol: formSymbol.toUpperCase(),
          quantity,
          avg_buy_price: price,
          notes: formNotes,
        });

        if (result.success) {
          Alert.alert('Thành công', 'Đã cập nhật coin');
        } else {
          Alert.alert('Lỗi', result.error);
        }
      } else {
        // Add new
        const result = await portfolioService.addCoin(
          user.id,
          formSymbol,
          quantity,
          price,
          formNotes
        );

        if (result.success) {
          Alert.alert('Thành công', 'Đã thêm coin vào portfolio');
        } else {
          Alert.alert('Lỗi', result.error);
        }
      }

      setAddModalVisible(false);
      await loadData();
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể lưu');
    }
  };

  const handleDelete = (item) => {
    Alert.alert(
      'Xác nhận',
      `Bạn có chắc muốn xóa ${item.symbol} khỏi portfolio?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            const result = await portfolioService.deleteCoin(item.id);
            if (result.success) {
              await loadData();
            } else {
              Alert.alert('Lỗi', result.error);
            }
          },
        },
      ]
    );
  };

  const formatCurrency = (value, decimals = 2) => {
    if (!value && value !== 0) return '--';
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  };

  const formatPrice = (price) => {
    if (!price) return '--';
    if (price >= 1000) return formatCurrency(price, 2);
    if (price >= 1) return formatCurrency(price, 4);
    return formatCurrency(price, 6);
  };

  if (loading) {
    return (
      <LinearGradient colors={GRADIENTS.background} style={styles.gradient}>
        <SafeAreaView style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.gold} />
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={GRADIENTS.background} style={styles.gradient}>
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ArrowLeft size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Portfolio</Text>
          <TouchableOpacity onPress={openAddModal} style={styles.addButton}>
            <Plus size={24} color={COLORS.gold} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.gold} />
          }
          showsVerticalScrollIndicator={false}
        >
          {/* Summary Card */}
          {summary && (
            <View style={styles.summaryCard}>
              <View style={styles.summaryHeader}>
                <Wallet size={24} color={COLORS.gold} />
                <Text style={styles.summaryTitle}>Tổng giá trị</Text>
              </View>
              <Text style={styles.summaryValue}>${formatCurrency(summary.totalValue)}</Text>
              <View style={styles.summaryPnl}>
                {summary.totalPnl >= 0 ? (
                  <TrendingUp size={16} color={COLORS.success} />
                ) : (
                  <TrendingDown size={16} color={COLORS.error} />
                )}
                <Text style={[
                  styles.summaryPnlText,
                  { color: summary.totalPnl >= 0 ? COLORS.success : COLORS.error }
                ]}>
                  ${formatCurrency(Math.abs(summary.totalPnl))} ({summary.totalPnlPercent >= 0 ? '+' : ''}{formatCurrency(summary.totalPnlPercent)}%)
                </Text>
              </View>
            </View>
          )}

          {/* Portfolio List */}
          {portfolio.length === 0 ? (
            <View style={styles.emptyState}>
              <Wallet size={60} color={COLORS.textMuted} />
              <Text style={styles.emptyTitle}>Portfolio trống</Text>
              <Text style={styles.emptyText}>Thêm coin để theo dõi tài sản của bạn</Text>
              <TouchableOpacity style={styles.emptyButton} onPress={openAddModal}>
                <Plus size={20} color={COLORS.textPrimary} />
                <Text style={styles.emptyButtonText}>Thêm coin</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.portfolioList}>
              {portfolio.map((item) => (
                <View key={item.id} style={styles.coinCard}>
                  <View style={styles.coinHeader}>
                    <View style={styles.coinSymbolBox}>
                      <Text style={styles.coinSymbol}>{item.symbol}</Text>
                    </View>
                    <View style={styles.coinInfo}>
                      <Text style={styles.coinQuantity}>{formatCurrency(item.quantity, 4)}</Text>
                      <Text style={styles.coinPrice}>${formatPrice(item.currentPrice)}</Text>
                    </View>
                    <View style={styles.coinValue}>
                      <Text style={styles.coinTotalValue}>${formatCurrency(item.totalValue)}</Text>
                      <View style={[
                        styles.coinPnlBadge,
                        { backgroundColor: item.pnl >= 0 ? `${COLORS.success}20` : `${COLORS.error}20` }
                      ]}>
                        <Text style={[
                          styles.coinPnlText,
                          { color: item.pnl >= 0 ? COLORS.success : COLORS.error }
                        ]}>
                          {item.pnlPercent >= 0 ? '+' : ''}{formatCurrency(item.pnlPercent)}%
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.coinFooter}>
                    <Text style={styles.coinAvgPrice}>
                      Giá vốn: ${formatPrice(item.avg_buy_price)}
                    </Text>
                    <View style={styles.coinActions}>
                      <TouchableOpacity
                        style={styles.coinActionButton}
                        onPress={() => openEditModal(item)}
                      >
                        <Edit2 size={16} color={COLORS.textMuted} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.coinActionButton}
                        onPress={() => handleDelete(item)}
                      >
                        <Trash2 size={16} color={COLORS.error} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Add/Edit Modal */}
        <Modal
          visible={addModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setAddModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {editItem ? 'Sửa coin' : 'Thêm coin'}
                </Text>
                <TouchableOpacity onPress={() => setAddModalVisible(false)}>
                  <X size={24} color={COLORS.textMuted} />
                </TouchableOpacity>
              </View>

              {/* Symbol Input with Search */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Symbol</Text>
                <View style={styles.searchInput}>
                  <Search size={18} color={COLORS.textMuted} />
                  <TextInput
                    style={styles.input}
                    value={formSymbol}
                    onChangeText={handleSearch}
                    placeholder="VD: BTC, ETH..."
                    placeholderTextColor={COLORS.textMuted}
                    autoCapitalize="characters"
                  />
                </View>
                {searchResults.length > 0 && (
                  <View style={styles.searchResults}>
                    {searchResults.slice(0, 5).map((coin) => (
                      <TouchableOpacity
                        key={coin.symbol}
                        style={styles.searchResultItem}
                        onPress={() => selectCoin(coin)}
                      >
                        <Text style={styles.searchResultText}>{coin.symbol}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* Quantity Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Số lượng</Text>
                <TextInput
                  style={styles.inputFull}
                  value={formQuantity}
                  onChangeText={setFormQuantity}
                  placeholder="0.00"
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="decimal-pad"
                />
              </View>

              {/* Price Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Giá mua trung bình (USD)</Text>
                <TextInput
                  style={styles.inputFull}
                  value={formPrice}
                  onChangeText={setFormPrice}
                  placeholder="0.00"
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="decimal-pad"
                />
              </View>

              {/* Notes Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Ghi chú (tùy chọn)</Text>
                <TextInput
                  style={[styles.inputFull, styles.inputMultiline]}
                  value={formNotes}
                  onChangeText={setFormNotes}
                  placeholder="Ghi chú..."
                  placeholderTextColor={COLORS.textMuted}
                  multiline
                  numberOfLines={2}
                />
              </View>

              {/* Buttons */}
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setAddModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Hủy</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                  <Text style={styles.saveButtonText}>Lưu</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.lg },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
  addButton: { padding: 8 },

  // Summary Card
  summaryCard: {
    backgroundColor: GLASS.background,
    borderRadius: GLASS.borderRadius,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.3)',
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: SPACING.sm,
  },
  summaryTitle: { fontSize: 14, color: COLORS.gold, fontWeight: '600' },
  summaryValue: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  summaryPnl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  summaryPnlText: { fontSize: 14, fontWeight: '600' },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    backgroundColor: GLASS.background,
    borderRadius: GLASS.borderRadius,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: SPACING.lg,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 8,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.burgundy,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
    marginTop: SPACING.lg,
  },
  emptyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },

  // Portfolio List
  portfolioList: {},
  coinCard: {
    backgroundColor: GLASS.background,
    borderRadius: 14,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
  },
  coinHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coinSymbolBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(106, 91, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  coinSymbol: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.purple,
  },
  coinInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  coinQuantity: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  coinPrice: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  coinValue: {
    alignItems: 'flex-end',
  },
  coinTotalValue: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  coinPnlBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 4,
  },
  coinPnlText: {
    fontSize: 12,
    fontWeight: '600',
  },
  coinFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  coinAvgPrice: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  coinActions: {
    flexDirection: 'row',
    gap: 12,
  },
  coinActionButton: {
    padding: 6,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.bgMid,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: SPACING.lg,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  inputGroup: {
    marginBottom: SPACING.md,
  },
  inputLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 8,
  },
  searchInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.3)',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textPrimary,
    paddingVertical: 14,
    marginLeft: 10,
  },
  inputFull: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 16,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.3)',
  },
  inputMultiline: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  searchResults: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 10,
    marginTop: 4,
    overflow: 'hidden',
  },
  searchResultItem: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  searchResultText: {
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.lg,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.textMuted,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: COLORS.burgundy,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
});
