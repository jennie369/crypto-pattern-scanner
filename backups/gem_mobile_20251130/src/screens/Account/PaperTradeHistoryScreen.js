/**
 * GEM Mobile - Paper Trade History Screen
 * View closed paper trade positions with stats
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Target,
  Award,
  Filter,
} from 'lucide-react-native';

import { COLORS, GRADIENTS, SPACING, TYPOGRAPHY, GLASS } from '../../utils/tokens';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabase';

const FILTERS = [
  { key: 'all', label: 'Tất cả' },
  { key: 'long', label: 'Long' },
  { key: 'short', label: 'Short' },
  { key: 'win', label: 'Thắng' },
  { key: 'loss', label: 'Thua' },
];

export default function PaperTradeHistoryScreen({ navigation }) {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [trades, setTrades] = useState([]);
  const [stats, setStats] = useState({
    totalTrades: 0,
    wins: 0,
    losses: 0,
    winRate: 0,
    totalPnl: 0,
    avgPnl: 0,
  });
  const [filter, setFilter] = useState('all');

  const loadData = useCallback(async () => {
    if (!user?.id) return;

    try {
      // Get paper trading orders from the correct table
      const { data, error } = await supabase
        .from('paper_trading_orders')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'filled')
        .order('created_at', { ascending: false });

      // Handle table not found gracefully
      if (error && (error.code === 'PGRST205' || error.code === '42P01')) {
        console.warn('[PaperTradeHistory] Table paper_trading_orders not found');
        setTrades([]);
        setStats({
          totalTrades: 0,
          wins: 0,
          losses: 0,
          winRate: 0,
          totalPnl: 0,
          avgPnl: 0,
        });
        return;
      }

      if (error) throw error;

      // Transform data to match UI expectations
      const tradeData = (data || []).map(order => ({
        ...order,
        direction: order.side === 'buy' ? 'LONG' : 'SHORT',
        entry_price: order.price,
        exit_price: null, // Orders table doesn't have exit price
        pnl_percent: order.pnl_percentage || 0,
        position_size: order.total_value,
        closed_at: order.filled_at || order.created_at,
      }));
      setTrades(tradeData);

      // Calculate stats
      const wins = tradeData.filter(t => (t.pnl || 0) > 0).length;
      const losses = tradeData.filter(t => (t.pnl || 0) <= 0).length;
      const totalPnl = tradeData.reduce((sum, t) => sum + (t.pnl || 0), 0);

      setStats({
        totalTrades: tradeData.length,
        wins,
        losses,
        winRate: tradeData.length > 0 ? (wins / tradeData.length) * 100 : 0,
        totalPnl,
        avgPnl: tradeData.length > 0 ? totalPnl / tradeData.length : 0,
      });
    } catch (error) {
      console.error('[PaperTradeHistory] Load error:', error);
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

  const getFilteredTrades = () => {
    switch (filter) {
      case 'long':
        return trades.filter(t => t.direction === 'LONG');
      case 'short':
        return trades.filter(t => t.direction === 'SHORT');
      case 'win':
        return trades.filter(t => (t.pnl || 0) > 0);
      case 'loss':
        return trades.filter(t => (t.pnl || 0) <= 0);
      default:
        return trades;
    }
  };

  const formatCurrency = (value) => {
    if (!value && value !== 0) return '--';
    const sign = value >= 0 ? '+' : '';
    return sign + new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatPercent = (value) => {
    if (!value && value !== 0) return '--';
    const sign = value >= 0 ? '+' : '';
    return sign + value.toFixed(2) + '%';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredTrades = getFilteredTrades();

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
          <Text style={styles.headerTitle}>Lịch Sử Paper Trade</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.gold} />
          }
          showsVerticalScrollIndicator={false}
        >
          {/* Stats Cards */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <BarChart3 size={20} color={COLORS.purple} />
              <Text style={styles.statValue}>{stats.totalTrades}</Text>
              <Text style={styles.statLabel}>Tổng lệnh</Text>
            </View>
            <View style={styles.statCard}>
              <Target size={20} color={COLORS.cyan} />
              <Text style={styles.statValue}>{stats.winRate.toFixed(1)}%</Text>
              <Text style={styles.statLabel}>Win Rate</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Award size={20} color={COLORS.success} />
              <Text style={[styles.statValue, { color: COLORS.success }]}>{stats.wins}</Text>
              <Text style={styles.statLabel}>Thắng</Text>
            </View>
            <View style={styles.statCard}>
              <TrendingDown size={20} color={COLORS.error} />
              <Text style={[styles.statValue, { color: COLORS.error }]}>{stats.losses}</Text>
              <Text style={styles.statLabel}>Thua</Text>
            </View>
          </View>

          {/* Total PnL Card */}
          <View style={styles.pnlCard}>
            <Text style={styles.pnlLabel}>Tổng P&L</Text>
            <Text style={[
              styles.pnlValue,
              { color: stats.totalPnl >= 0 ? COLORS.success : COLORS.error }
            ]}>
              {formatCurrency(stats.totalPnl)} USDT
            </Text>
            <Text style={styles.pnlAvg}>
              Trung bình: {formatCurrency(stats.avgPnl)} / lệnh
            </Text>
          </View>

          {/* Filter Tabs */}
          <View style={styles.filterRow}>
            {FILTERS.map((f) => (
              <TouchableOpacity
                key={f.key}
                style={[styles.filterButton, filter === f.key && styles.filterButtonActive]}
                onPress={() => setFilter(f.key)}
              >
                <Text style={[
                  styles.filterButtonText,
                  filter === f.key && styles.filterButtonTextActive
                ]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Trade List */}
          {filteredTrades.length === 0 ? (
            <View style={styles.emptyState}>
              <BarChart3 size={50} color={COLORS.textMuted} />
              <Text style={styles.emptyText}>Không có lệnh nào</Text>
            </View>
          ) : (
            <View style={styles.tradeList}>
              {filteredTrades.map((trade) => (
                <View key={trade.id} style={styles.tradeCard}>
                  <View style={styles.tradeHeader}>
                    <View style={styles.tradeLeft}>
                      <Text style={styles.tradeSymbol}>{trade.symbol}</Text>
                      <View style={[
                        styles.directionBadge,
                        { backgroundColor: trade.direction === 'LONG' ? `${COLORS.success}20` : `${COLORS.error}20` }
                      ]}>
                        <Text style={[
                          styles.directionText,
                          { color: trade.direction === 'LONG' ? COLORS.success : COLORS.error }
                        ]}>
                          {trade.direction}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.tradeRight}>
                      <Text style={[
                        styles.tradePnl,
                        { color: (trade.pnl || 0) >= 0 ? COLORS.success : COLORS.error }
                      ]}>
                        {formatCurrency(trade.pnl)} USDT
                      </Text>
                      <Text style={[
                        styles.tradePnlPercent,
                        { color: (trade.pnl_percent || 0) >= 0 ? COLORS.success : COLORS.error }
                      ]}>
                        {formatPercent(trade.pnl_percent)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.tradeDetails}>
                    <View style={styles.tradeDetailRow}>
                      <Text style={styles.tradeDetailLabel}>Entry</Text>
                      <Text style={styles.tradeDetailValue}>${trade.entry_price}</Text>
                    </View>
                    <View style={styles.tradeDetailRow}>
                      <Text style={styles.tradeDetailLabel}>Exit</Text>
                      <Text style={styles.tradeDetailValue}>${trade.exit_price || '--'}</Text>
                    </View>
                    <View style={styles.tradeDetailRow}>
                      <Text style={styles.tradeDetailLabel}>Size</Text>
                      <Text style={styles.tradeDetailValue}>{trade.position_size} USDT</Text>
                    </View>
                  </View>

                  <View style={styles.tradeFooter}>
                    <Text style={styles.tradeDate}>{formatDate(trade.closed_at)}</Text>
                    {(trade.pnl || 0) > 0 ? (
                      <TrendingUp size={16} color={COLORS.success} />
                    ) : (
                      <TrendingDown size={16} color={COLORS.error} />
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}

          <View style={{ height: 100 }} />
        </ScrollView>
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

  // Stats
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: GLASS.background,
    borderRadius: 14,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 4,
  },

  // PnL Card
  pnlCard: {
    backgroundColor: GLASS.background,
    borderRadius: GLASS.borderRadius,
    padding: SPACING.lg,
    marginVertical: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.3)',
  },
  pnlLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  pnlValue: {
    fontSize: 28,
    fontWeight: '700',
    marginVertical: 8,
  },
  pnlAvg: {
    fontSize: 12,
    color: COLORS.textMuted,
  },

  // Filter
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: SPACING.lg,
  },
  filterButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  filterButtonActive: {
    backgroundColor: 'rgba(106, 91, 255, 0.2)',
    borderColor: COLORS.purple,
  },
  filterButtonText: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: COLORS.purple,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    backgroundColor: GLASS.background,
    borderRadius: 14,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 16,
  },

  // Trade List
  tradeList: {},
  tradeCard: {
    backgroundColor: GLASS.background,
    borderRadius: 14,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
  },
  tradeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  tradeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  tradeSymbol: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  directionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  directionText: {
    fontSize: 10,
    fontWeight: '700',
  },
  tradeRight: {
    alignItems: 'flex-end',
  },
  tradePnl: {
    fontSize: 16,
    fontWeight: '700',
  },
  tradePnlPercent: {
    fontSize: 12,
    marginTop: 2,
  },
  tradeDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  tradeDetailRow: {
    alignItems: 'center',
  },
  tradeDetailLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  tradeDetailValue: {
    fontSize: 12,
    color: COLORS.textPrimary,
    fontWeight: '500',
    marginTop: 2,
  },
  tradeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  tradeDate: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
});
