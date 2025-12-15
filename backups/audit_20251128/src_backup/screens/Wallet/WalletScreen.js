/**
 * Gemral - Wallet Screen
 * Feature #14: Virtual Currency
 * View balance, transactions, and buy gems
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ChevronLeft,
  Gem,
  Diamond,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Gift,
  Clock,
  ShoppingCart,
  Sparkles,
} from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, GLASS, GRADIENTS } from '../../utils/tokens';
import walletService from '../../services/walletService';

const WalletScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [balance, setBalance] = useState({ gems: 0, diamonds: 0 });
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    await Promise.all([loadBalance(), loadTransactions()]);
    setLoading(false);
  };

  const loadBalance = async () => {
    const result = await walletService.getBalance();
    if (result.success) {
      setBalance(result.data);
    }
  };

  const loadTransactions = async () => {
    const data = await walletService.getTransactions(50);
    setTransactions(data);
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, []);

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'purchase':
        return { icon: ShoppingCart, color: COLORS.success };
      case 'gift_sent':
        return { icon: ArrowUpRight, color: COLORS.error };
      case 'gift_received':
        return { icon: ArrowDownLeft, color: COLORS.success };
      case 'bonus':
        return { icon: Sparkles, color: COLORS.gold };
      case 'withdrawal':
        return { icon: ArrowUpRight, color: COLORS.warning };
      default:
        return { icon: Clock, color: COLORS.textMuted };
    }
  };

  const formatTransactionDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Hôm nay';
    if (days === 1) return 'Hôm qua';
    if (days < 7) return `${days} ngày trước`;

    return date.toLocaleDateString('vi-VN');
  };

  if (loading) {
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
          <Text style={styles.headerTitle}>Ví của tôi</Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={COLORS.purple}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {/* Balance Card */}
          <View style={styles.balanceCard}>
            <LinearGradient
              colors={['rgba(106, 91, 255, 0.3)', 'rgba(0, 240, 255, 0.2)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.balanceGradient}
            >
              <Text style={styles.balanceLabel}>Số dư hiện tại</Text>

              {/* Gems Balance */}
              <View style={styles.balanceRow}>
                <View style={styles.balanceItem}>
                  <View style={styles.currencyIcon}>
                    <Gem size={24} color={COLORS.purple} />
                  </View>
                  <View>
                    <Text style={styles.balanceAmount}>
                      {walletService.formatGems(balance.gems)}
                    </Text>
                    <Text style={styles.currencyName}>Gems</Text>
                  </View>
                </View>

                <View style={styles.balanceItem}>
                  <View style={[styles.currencyIcon, { backgroundColor: 'rgba(0, 240, 255, 0.2)' }]}>
                    <Diamond size={24} color={COLORS.cyan} />
                  </View>
                  <View>
                    <Text style={styles.balanceAmount}>
                      {walletService.formatGems(balance.diamonds)}
                    </Text>
                    <Text style={styles.currencyName}>Diamonds</Text>
                  </View>
                </View>
              </View>

              {/* Stats */}
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Đã nhận</Text>
                  <Text style={styles.statValue}>
                    {walletService.formatGems(balance.totalEarned)}
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Đã chi</Text>
                  <Text style={styles.statValue}>
                    {walletService.formatGems(balance.totalSpent)}
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* Buy Gems Button */}
          <TouchableOpacity
            style={styles.buyButton}
            onPress={() => navigation.navigate('BuyGems')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={GRADIENTS.primaryButton}
              style={styles.buyButtonGradient}
            >
              <Plus size={20} color={COLORS.textPrimary} />
              <Text style={styles.buyButtonText}>Nạp Gems</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.quickActionItem}
              onPress={() => navigation.navigate('GiftCatalog')}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: 'rgba(255, 107, 107, 0.2)' }]}>
                <Gift size={20} color="#FF6B6B" />
              </View>
              <Text style={styles.quickActionLabel}>Gửi quà</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionItem}
              onPress={() => navigation.navigate('TransactionHistory')}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: 'rgba(106, 91, 255, 0.2)' }]}>
                <Clock size={20} color={COLORS.purple} />
              </View>
              <Text style={styles.quickActionLabel}>Lịch sử</Text>
            </TouchableOpacity>
          </View>

          {/* Transaction History */}
          <View style={styles.transactionsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Giao dịch gần đây</Text>
              <TouchableOpacity onPress={() => navigation.navigate('TransactionHistory')}>
                <Text style={styles.seeAllText}>Xem tất cả</Text>
              </TouchableOpacity>
            </View>

            {transactions.length === 0 ? (
              <View style={styles.emptyTransactions}>
                <Text style={styles.emptyText}>Chưa có giao dịch nào</Text>
              </View>
            ) : (
              transactions.slice(0, 5).map((transaction) => {
                const { icon: Icon, color } = getTransactionIcon(transaction.type);
                const isPositive = transaction.amount > 0;

                return (
                  <View key={transaction.id} style={styles.transactionItem}>
                    <View style={[styles.transactionIcon, { backgroundColor: `${color}20` }]}>
                      <Icon size={18} color={color} />
                    </View>
                    <View style={styles.transactionInfo}>
                      <Text style={styles.transactionDescription} numberOfLines={1}>
                        {transaction.description}
                      </Text>
                      <Text style={styles.transactionDate}>
                        {formatTransactionDate(transaction.created_at)}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.transactionAmount,
                        { color: isPositive ? COLORS.success : COLORS.error },
                      ]}
                    >
                      {isPositive ? '+' : ''}{walletService.formatGems(transaction.amount)}
                    </Text>
                  </View>
                );
              })
            )}
          </View>
        </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: SPACING.lg,
    paddingBottom: 100,
  },
  balanceCard: {
    borderRadius: GLASS.borderRadius,
    overflow: 'hidden',
  },
  balanceGradient: {
    padding: SPACING.xl,
    borderRadius: GLASS.borderRadius,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.3)',
  },
  balanceLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginBottom: SPACING.md,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  balanceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  currencyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(106, 91, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  balanceAmount: {
    fontSize: TYPOGRAPHY.fontSize.hero,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  currencyName: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.lg,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
  },
  statValue: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  buyButton: {
    marginTop: SPACING.lg,
    borderRadius: 12,
    overflow: 'hidden',
  },
  buyButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
    gap: SPACING.sm,
  },
  buyButtonText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  quickActions: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.lg,
  },
  quickActionItem: {
    flex: 1,
    backgroundColor: GLASS.background,
    borderRadius: 12,
    padding: SPACING.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  quickActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  quickActionLabel: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
  },
  transactionsSection: {
    marginTop: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  seeAllText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.purple,
  },
  emptyTransactions: {
    backgroundColor: GLASS.background,
    borderRadius: 12,
    padding: SPACING.xxl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GLASS.background,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
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
  transactionAmount: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
});

export default WalletScreen;
