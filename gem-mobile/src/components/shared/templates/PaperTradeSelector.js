/**
 * PaperTradeSelector.js
 * Component to select from paper trade history for auto-filling trading journal
 *
 * Created: 2026-02-03
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  Animated,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import {
  History,
  X,
  Check,
  TrendingUp,
  TrendingDown,
  ArrowRight,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import {
  COSMIC_COLORS,
  COSMIC_SPACING,
  COSMIC_RADIUS,
  COSMIC_TYPOGRAPHY,
} from '../../../theme/cosmicTokens';
import paperTradeService from '../../../services/paperTradeService';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * PaperTradeSelector Component
 * Shows recent paper trade history for auto-filling trading journal
 *
 * @param {string} userId - User ID
 * @param {function} onSelect - Callback when a trade is selected
 * @param {boolean} disabled - Disable interaction
 */
const PaperTradeSelector = ({
  userId,
  onSelect,
  disabled = false,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(false);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(50)).current;

  // Load recent trades
  const loadTrades = async () => {
    if (!userId) return;

    setLoading(true);
    try {
      await paperTradeService.init(userId);

      // Get recent closed trades (history)
      const history = paperTradeService.tradeHistory || [];

      // Also get open positions for in-progress trades
      const openPositions = paperTradeService.openPositions || [];

      // Combine and sort by date (most recent first)
      const allTrades = [
        ...openPositions.map(t => ({ ...t, isOpen: true })),
        ...history.map(t => ({ ...t, isOpen: false })),
      ].sort((a, b) => {
        const dateA = new Date(a.closedAt || a.openedAt || a.createdAt);
        const dateB = new Date(b.closedAt || b.openedAt || b.createdAt);
        return dateB - dateA;
      });

      // Take only recent 20 trades
      setTrades(allTrades.slice(0, 20));
    } catch (error) {
      console.error('[PaperTradeSelector] Error loading trades:', error);
    } finally {
      setLoading(false);
    }
  };

  // Open modal
  const handleOpen = () => {
    if (disabled) return;
    setModalVisible(true);
    loadTrades();
  };

  // Close modal
  const handleClose = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 50,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setModalVisible(false);
    });
  };

  // Handle trade selection
  const handleSelect = (trade) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Transform trade data to match trading journal fields
    const formData = {
      pair: formatSymbol(trade.symbol),
      direction: trade.side?.toLowerCase() === 'buy' ? 'long' : 'short',
      entry_price: trade.entryPrice?.toString() || '',
      exit_price: trade.exitPrice?.toString() || '',
      position_size: trade.quantity?.toString() || '',
      pnl: trade.pnl?.toFixed(2)?.toString() || '',
    };

    onSelect?.(formData);
    handleClose();
  };

  // Animate on open
  useEffect(() => {
    if (modalVisible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [modalVisible, fadeAnim, slideAnim]);

  // Format symbol (BTCUSDT -> BTC/USDT)
  const formatSymbol = (symbol) => {
    if (!symbol) return '';
    // Remove USDT suffix and add /USDT
    if (symbol.endsWith('USDT')) {
      return symbol.replace('USDT', '/USDT');
    }
    return symbol;
  };

  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Render trade item
  const renderTradeItem = ({ item }) => {
    const isLong = item.side?.toLowerCase() === 'buy';
    const isProfit = (item.pnl || 0) >= 0;
    const pnlColor = isProfit ? COSMIC_COLORS.functional.success : COSMIC_COLORS.functional.error;

    return (
      <TouchableOpacity
        style={styles.tradeItem}
        onPress={() => handleSelect(item)}
        activeOpacity={0.7}
      >
        <View style={styles.tradeLeft}>
          {/* Direction Icon */}
          <View style={[
            styles.directionIcon,
            { backgroundColor: isLong ? COSMIC_COLORS.glow.green + '20' : COSMIC_COLORS.glow.orange + '20' }
          ]}>
            {isLong ? (
              <TrendingUp size={16} color={COSMIC_COLORS.glow.green} />
            ) : (
              <TrendingDown size={16} color={COSMIC_COLORS.glow.orange} />
            )}
          </View>

          {/* Trade Info */}
          <View style={styles.tradeInfo}>
            <View style={styles.tradeHeader}>
              <Text style={styles.symbol}>{formatSymbol(item.symbol)}</Text>
              {item.isOpen && (
                <View style={styles.openBadge}>
                  <Text style={styles.openBadgeText}>Đang mở</Text>
                </View>
              )}
            </View>
            <Text style={styles.tradeDetails}>
              {isLong ? 'Long' : 'Short'} • {item.quantity} • ${item.entryPrice?.toFixed(2)}
            </Text>
            <Text style={styles.tradeDate}>{formatDate(item.closedAt || item.openedAt)}</Text>
          </View>
        </View>

        {/* PnL */}
        <View style={styles.tradeRight}>
          {item.pnl !== undefined && item.pnl !== null && !item.isOpen && (
            <Text style={[styles.pnl, { color: pnlColor }]}>
              {isProfit ? '+' : ''}{item.pnl?.toFixed(2)} USDT
            </Text>
          )}
          <ArrowRight size={16} color={COSMIC_COLORS.text.muted} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Select Button */}
      <TouchableOpacity
        style={[
          styles.selectButton,
          disabled && styles.selectButtonDisabled,
        ]}
        onPress={handleOpen}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <History size={16} color={COSMIC_COLORS.glow.gold} />
        <Text style={styles.selectButtonText}>Chọn từ Paper Trade</Text>
      </TouchableOpacity>

      {/* Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="none"
        onRequestClose={handleClose}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={handleClose}
        >
          <Animated.View
            style={[
              styles.modal,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <TouchableOpacity activeOpacity={1}>
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Chọn giao dịch Paper Trade</Text>
                <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                  <X size={24} color={COSMIC_COLORS.text.muted} />
                </TouchableOpacity>
              </View>

              <Text style={styles.modalSubtitle}>
                Chọn một giao dịch để tự động điền vào nhật ký
              </Text>

              {/* Trade List */}
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={COSMIC_COLORS.glow.gold} />
                  <Text style={styles.loadingText}>Đang tải lịch sử...</Text>
                </View>
              ) : trades.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <History size={48} color={COSMIC_COLORS.text.hint} />
                  <Text style={styles.emptyText}>Chưa có giao dịch Paper Trade</Text>
                  <Text style={styles.emptySubtext}>
                    Thực hiện giao dịch Paper Trade từ Scanner để thấy chúng ở đây
                  </Text>
                </View>
              ) : (
                <FlatList
                  data={trades}
                  renderItem={renderTradeItem}
                  keyExtractor={(item) => item.id}
                  style={styles.tradeList}
                  showsVerticalScrollIndicator={false}
                  ItemSeparatorComponent={() => <View style={styles.separator} />}
                />
              )}
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: COSMIC_SPACING.md,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: COSMIC_SPACING.sm,
    backgroundColor: COSMIC_COLORS.glow.gold + '15',
    borderRadius: COSMIC_RADIUS.md,
    borderWidth: 1,
    borderColor: COSMIC_COLORS.glow.gold + '40',
    borderStyle: 'dashed',
    paddingVertical: COSMIC_SPACING.md,
    paddingHorizontal: COSMIC_SPACING.lg,
  },
  selectButtonDisabled: {
    opacity: 0.5,
  },
  selectButtonText: {
    fontSize: COSMIC_TYPOGRAPHY.fontSize.md,
    fontWeight: COSMIC_TYPOGRAPHY.fontWeight.medium,
    color: COSMIC_COLORS.glow.gold,
  },

  // Modal
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: COSMIC_COLORS.bgNebula,
    borderTopLeftRadius: COSMIC_RADIUS.xxl,
    borderTopRightRadius: COSMIC_RADIUS.xxl,
    maxHeight: SCREEN_HEIGHT * 0.7,
    borderWidth: 1,
    borderColor: COSMIC_COLORS.glass.border,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: COSMIC_SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COSMIC_COLORS.glass.border,
  },
  modalTitle: {
    fontSize: COSMIC_TYPOGRAPHY.fontSize.lg,
    fontWeight: COSMIC_TYPOGRAPHY.fontWeight.semibold,
    color: COSMIC_COLORS.text.primary,
  },
  closeButton: {
    padding: COSMIC_SPACING.xs,
  },
  modalSubtitle: {
    fontSize: COSMIC_TYPOGRAPHY.fontSize.sm,
    color: COSMIC_COLORS.text.muted,
    paddingHorizontal: COSMIC_SPACING.lg,
    paddingVertical: COSMIC_SPACING.sm,
  },

  // Trade List
  tradeList: {
    maxHeight: SCREEN_HEIGHT * 0.5,
  },
  tradeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: COSMIC_SPACING.lg,
    paddingVertical: COSMIC_SPACING.md,
  },
  tradeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: COSMIC_SPACING.md,
    flex: 1,
  },
  directionIcon: {
    width: 36,
    height: 36,
    borderRadius: COSMIC_RADIUS.round,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tradeInfo: {
    flex: 1,
  },
  tradeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: COSMIC_SPACING.sm,
  },
  symbol: {
    fontSize: COSMIC_TYPOGRAPHY.fontSize.md,
    fontWeight: COSMIC_TYPOGRAPHY.fontWeight.semibold,
    color: COSMIC_COLORS.text.primary,
  },
  openBadge: {
    backgroundColor: COSMIC_COLORS.glow.cyan + '20',
    paddingHorizontal: COSMIC_SPACING.xs,
    paddingVertical: 2,
    borderRadius: COSMIC_RADIUS.xs,
  },
  openBadgeText: {
    fontSize: COSMIC_TYPOGRAPHY.fontSize.xs,
    color: COSMIC_COLORS.glow.cyan,
  },
  tradeDetails: {
    fontSize: COSMIC_TYPOGRAPHY.fontSize.sm,
    color: COSMIC_COLORS.text.secondary,
    marginTop: 2,
  },
  tradeDate: {
    fontSize: COSMIC_TYPOGRAPHY.fontSize.xs,
    color: COSMIC_COLORS.text.hint,
    marginTop: 2,
  },
  tradeRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: COSMIC_SPACING.sm,
  },
  pnl: {
    fontSize: COSMIC_TYPOGRAPHY.fontSize.sm,
    fontWeight: COSMIC_TYPOGRAPHY.fontWeight.semibold,
  },
  separator: {
    height: 1,
    backgroundColor: COSMIC_COLORS.glass.border,
    marginHorizontal: COSMIC_SPACING.lg,
  },

  // Loading
  loadingContainer: {
    padding: COSMIC_SPACING.xxl,
    alignItems: 'center',
    gap: COSMIC_SPACING.md,
  },
  loadingText: {
    fontSize: COSMIC_TYPOGRAPHY.fontSize.md,
    color: COSMIC_COLORS.text.muted,
  },

  // Empty
  emptyContainer: {
    padding: COSMIC_SPACING.xxl,
    alignItems: 'center',
    gap: COSMIC_SPACING.sm,
  },
  emptyText: {
    fontSize: COSMIC_TYPOGRAPHY.fontSize.md,
    fontWeight: COSMIC_TYPOGRAPHY.fontWeight.medium,
    color: COSMIC_COLORS.text.secondary,
    marginTop: COSMIC_SPACING.sm,
  },
  emptySubtext: {
    fontSize: COSMIC_TYPOGRAPHY.fontSize.sm,
    color: COSMIC_COLORS.text.hint,
    textAlign: 'center',
    maxWidth: 250,
  },
});

export default PaperTradeSelector;
