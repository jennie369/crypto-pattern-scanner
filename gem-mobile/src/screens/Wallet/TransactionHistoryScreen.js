/**
 * Gemral - Transaction History Screen
 * Feature #14: Virtual Currency
 * Full transaction history list
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ChevronLeft,
  Gem,
  ShoppingCart,
  ArrowUpRight,
  ArrowDownLeft,
  Sparkles,
  Clock,
  Filter,
  Gift,
  Zap,
  CreditCard,
  TrendingUp,
  User,
} from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, GLASS, GRADIENTS } from '../../utils/tokens';
import walletService from '../../services/walletService';
import gemEconomyService from '../../services/gemEconomyService';
import { useAuth } from '../../contexts/AuthContext';

const FILTER_OPTIONS = [
  { id: 'all', label: 'Tất cả' },
  { id: 'purchase', label: 'Nạp tiền' },
  { id: 'gift_sent', label: 'Gửi quà' },
  { id: 'gift_received', label: 'Nhận quà' },
  { id: 'bonus', label: 'Thưởng' },
  { id: 'withdrawal', label: 'Rút tiền' },
];

const TransactionHistoryScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  // Helper to detect if transaction is a gift send based on description
  const isGiftSendTransaction = (t) => {
    // Check type/reference_type first
    if (t.type === 'gift_sent' || (t.type === 'spend' && t.reference_type === 'gift')) {
      return true;
    }
    // Also check description pattern for legacy data
    if (t.description?.includes('Gửi quà') || t.description?.includes('Send gift')) {
      return true;
    }
    return false;
  };

  // Helper to detect if transaction is a gift receive
  const isGiftReceiveTransaction = (t) => {
    if (t.type === 'gift_received' || (t.type === 'receive' && t.reference_type === 'gift')) {
      return true;
    }
    // Also check description pattern
    if (t.description?.includes('Nhận quà') || t.description?.includes('Receive gift')) {
      return true;
    }
    return false;
  };

  useEffect(() => {
    if (selectedFilter === 'all') {
      setFilteredTransactions(transactions);
    } else if (selectedFilter === 'gift_sent') {
      // Filter gift send transactions
      setFilteredTransactions(transactions.filter(isGiftSendTransaction));
    } else if (selectedFilter === 'gift_received') {
      // Filter gift receive transactions
      setFilteredTransactions(transactions.filter(isGiftReceiveTransaction));
    } else {
      setFilteredTransactions(transactions.filter(t => t.type === selectedFilter));
    }
  }, [selectedFilter, transactions]);

  const loadData = async (reset = true) => {
    if (reset) {
      setLoading(true);
      setPage(0);
    }

    let data = [];
    // Use gemEconomyService for transactions from gems_transactions table
    if (user?.id) {
      data = await gemEconomyService.getGemTransactions(user.id, 50, reset ? 0 : page * 50) || [];
      // Debug: log first few transactions to see actual data structure
      console.log('[TransactionHistory] Loaded transactions:', data.slice(0, 3).map(t => ({
        type: t.type,
        amount: t.amount,
        reference_type: t.reference_type,
        description: t.description?.substring(0, 30),
      })));
    } else {
      // Fallback to walletService
      data = await walletService.getTransactions(50, reset ? 0 : page * 50);
    }

    if (reset) {
      setTransactions(data);
    } else {
      setTransactions(prev => [...prev, ...data]);
    }

    setHasMore(data.length === 50);
    setLoading(false);
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData(true);
    setRefreshing(false);
  }, []);

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      setPage(p => p + 1);
      loadData(false);
    }
  };

  const getTransactionIcon = (type, referenceType, amount, description) => {
    // First check description for gift patterns (most reliable for legacy data)
    if (description?.includes('Gửi quà') || description?.includes('Send gift')) {
      return { icon: ArrowUpRight, color: COLORS.error };
    }
    if (description?.includes('Nhận quà') || description?.includes('Receive gift')) {
      return { icon: ArrowDownLeft, color: COLORS.success };
    }

    switch (type) {
      case 'purchase':
        return { icon: ShoppingCart, color: COLORS.success };
      case 'gift_sent':
        return { icon: ArrowUpRight, color: COLORS.error };
      case 'spend':
        // Check if it's a gift spend
        if (referenceType === 'gift') {
          return { icon: ArrowUpRight, color: COLORS.error };
        }
        return { icon: ArrowUpRight, color: COLORS.warning };
      case 'gift_received':
        return { icon: ArrowDownLeft, color: COLORS.success };
      case 'receive':
        // 'receive' is the new type from gems_transactions for gift received
        return { icon: ArrowDownLeft, color: COLORS.success };
      case 'bonus':
        return { icon: Sparkles, color: COLORS.gold };
      case 'withdrawal':
      case 'refund':
        return { icon: ArrowUpRight, color: COLORS.warning };
      default:
        // Fallback: determine by amount sign
        if (amount > 0) {
          return { icon: ArrowDownLeft, color: COLORS.success };
        } else if (amount < 0) {
          return { icon: ArrowUpRight, color: COLORS.error };
        }
        return { icon: Clock, color: COLORS.textMuted };
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderFilterItem = ({ item }) => {
    const isSelected = selectedFilter === item.id;
    return (
      <TouchableOpacity
        style={[styles.filterChip, isSelected && styles.filterChipSelected]}
        onPress={() => setSelectedFilter(item.id)}
      >
        <Text style={[styles.filterChipText, isSelected && styles.filterChipTextSelected]}>
          {item.label}
        </Text>
      </TouchableOpacity>
    );
  };

  // Get thumbnail info based on transaction type
  const getTransactionThumbnail = (item) => {
    const isGiftSend = isGiftSendTransaction(item);
    const isGiftReceive = isGiftReceiveTransaction(item);

    // For gift transactions with related user avatar
    if ((isGiftSend || isGiftReceive) && item.related_user_avatar) {
      return { type: 'avatar', uri: item.related_user_avatar };
    }

    // Default icon-based thumbnails
    if (isGiftSend) return { type: 'icon', icon: Gift, color: COLORS.error };
    if (isGiftReceive) return { type: 'icon', icon: Gift, color: COLORS.success };

    switch (item.type) {
      case 'purchase':
        return { type: 'icon', icon: CreditCard, color: COLORS.success };
      case 'bonus':
      case 'daily_checkin':
        return { type: 'icon', icon: Sparkles, color: COLORS.gold };
      case 'boost':
        return { type: 'icon', icon: Zap, color: COLORS.purple };
      case 'withdrawal':
        return { type: 'icon', icon: TrendingUp, color: COLORS.warning };
      default:
        return { type: 'icon', icon: Gem, color: COLORS.purple };
    }
  };

  // Build display description with sender/receiver name
  const getDisplayDescription = (item) => {
    const isGiftSend = isGiftSendTransaction(item);
    const isGiftReceive = isGiftReceiveTransaction(item);

    // If has related user name, show it for gift transactions
    if (item.related_user_name) {
      if (isGiftSend) {
        return `Gửi quà cho ${item.related_user_name}`;
      }
      if (isGiftReceive) {
        return `Nhận quà từ ${item.related_user_name}`;
      }
    }

    // Return the fixed description (Vietnamese text already fixed in service)
    return item.description || 'Giao dịch';
  };

  const renderItem = ({ item }) => {
    const { icon: Icon, color } = getTransactionIcon(item.type, item.reference_type, item.amount, item.description);
    // For gift sends, force display as negative even if amount is positive in DB
    const isGiftSend = isGiftSendTransaction(item);
    const displayAmount = isGiftSend && item.amount > 0 ? -item.amount : item.amount;
    const isPositive = displayAmount > 0;

    // Get thumbnail info
    const thumbnail = getTransactionThumbnail(item);
    const displayDescription = getDisplayDescription(item);

    return (
      <View style={styles.transactionItem}>
        {/* Thumbnail - Avatar or Icon */}
        {thumbnail.type === 'avatar' ? (
          <Image
            source={{ uri: thumbnail.uri }}
            style={styles.transactionAvatar}
          />
        ) : (
          <View style={[styles.transactionIcon, { backgroundColor: `${thumbnail.color}20` }]}>
            <thumbnail.icon size={18} color={thumbnail.color} />
          </View>
        )}
        <View style={styles.transactionInfo}>
          <Text style={styles.transactionDescription} numberOfLines={2}>
            {displayDescription}
          </Text>
          <Text style={styles.transactionDate}>{formatDate(item.created_at)}</Text>
        </View>
        <View style={styles.transactionAmounts}>
          <View style={styles.amountRow}>
            <Gem size={14} color={isPositive ? COLORS.success : COLORS.error} />
            <Text
              style={[
                styles.transactionAmount,
                { color: isPositive ? COLORS.success : COLORS.error },
              ]}
            >
              {isPositive ? '+' : ''}{walletService.formatGems(displayAmount)}
            </Text>
          </View>
          {item.currency_type && (
            <Text style={styles.currencyType}>{item.currency_type}</Text>
          )}
        </View>
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Clock size={48} color={COLORS.textMuted} />
      <Text style={styles.emptyText}>Chưa có giao dịch nào</Text>
      <Text style={styles.emptySubtext}>
        Các giao dịch của bạn sẽ hiển thị ở đây
      </Text>
    </View>
  );

  if (loading && transactions.length === 0) {
    return (
      <LinearGradient colors={GRADIENTS.background} style={styles.container}>
        <SafeAreaView style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.purple} />
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={GRADIENTS.background} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <ChevronLeft size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Lịch sử giao dịch</Text>
          <View style={styles.headerRight} />
        </View>

        {/* Filter Chips */}
        <View style={styles.filterContainer}>
          <FlatList
            horizontal
            data={FILTER_OPTIONS}
            keyExtractor={(item) => item.id}
            renderItem={renderFilterItem}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterList}
          />
        </View>

        <FlatList
          data={filteredTransactions}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmpty}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={COLORS.purple}
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loading && transactions.length > 0 ? (
              <ActivityIndicator size="small" color={COLORS.purple} style={styles.loader} />
            ) : null
          }
        />
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: GLASS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  headerRight: {
    width: 40,
  },
  filterContainer: {
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  filterList: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
  },
  filterChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    backgroundColor: GLASS.background,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginRight: SPACING.sm,
  },
  filterChipSelected: {
    backgroundColor: 'rgba(106, 91, 255, 0.2)',
    borderColor: COLORS.purple,
  },
  filterChipText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  },
  filterChipTextSelected: {
    color: COLORS.purple,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  listContent: {
    padding: SPACING.lg,
    paddingBottom: 100,
    flexGrow: 1,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GLASS.background,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  transactionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  transactionAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: GLASS.background,
  },
  transactionInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  transactionDescription: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textPrimary,
  },
  transactionDate: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  transactionAmounts: {
    alignItems: 'flex-end',
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  transactionAmount: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  currencyType: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xxl,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginTop: SPACING.lg,
  },
  emptySubtext: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  loader: {
    paddingVertical: SPACING.lg,
  },
});

export default TransactionHistoryScreen;
