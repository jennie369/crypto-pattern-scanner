/**
 * Gemral - Open Positions Screen
 * View and manage paper trade positions
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  X,
  DollarSign,
  Target,
  Clock,
  Wallet,
  BarChart2,
  RefreshCw,
} from 'lucide-react-native';
import { useAuth } from '../../contexts/AuthContext';
import paperTradeService from '../../services/paperTradeService';
import { binanceService } from '../../services/binanceService';
import { COLORS, GRADIENTS, SPACING, TYPOGRAPHY, GLASS } from '../../utils/tokens';

export default function OpenPositionsScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();

  const [positions, setPositions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [closingId, setClosingId] = useState(null);

  // Load positions on focus
  useFocusEffect(
    useCallback(() => {
      loadData();
      // Set up price update interval
      const interval = setInterval(updatePrices, 10000); // Update every 10s
      return () => clearInterval(interval);
    }, [])
  );

  const loadData = async () => {
    try {
      await paperTradeService.init();
      const openPositions = paperTradeService.getOpenPositions(user?.id);
      const tradeStats = paperTradeService.getStats(user?.id);
      setPositions(openPositions);
      setStats(tradeStats);
      // Update prices immediately
      await updatePrices();
    } catch (error) {
      console.error('[OpenPositions] Load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePrices = async () => {
    try {
      const currentPositions = paperTradeService.getOpenPositions(user?.id);
      if (currentPositions.length === 0) return;

      // Get current prices for all symbols
      const symbols = [...new Set(currentPositions.map((p) => p.symbol))];
      const prices = {};

      for (const symbol of symbols) {
        try {
          const price = await binanceService.getCurrentPrice(symbol);
          if (price) prices[symbol] = price;
        } catch (e) {
          console.log(`[OpenPositions] Failed to get price for ${symbol}`);
        }
      }

      // Update positions with new prices
      const result = await paperTradeService.updatePrices(prices);

      // Reload if any positions were closed
      if (result.closed.length > 0) {
        for (const closed of result.closed) {
          Alert.alert(
            closed.result === 'WIN' ? 'Take Profit Hit!' : 'Stop Loss Hit!',
            `${closed.symbol} ${closed.direction}\n` +
              `P/L: ${closed.realizedPnL >= 0 ? '+' : ''}$${closed.realizedPnL.toFixed(2)}`,
            [{ text: 'OK' }]
          );
        }
      }

      // Update state
      setPositions(paperTradeService.getOpenPositions(user?.id));
      setStats(paperTradeService.getStats(user?.id));
    } catch (error) {
      console.log('[OpenPositions] Update prices error:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Close position manually
  const handleClosePosition = async (position) => {
    Alert.alert(
      'Dong Position?',
      `${position.symbol} ${position.direction}\n` +
        `P/L: ${position.unrealizedPnL >= 0 ? '+' : ''}$${position.unrealizedPnL.toFixed(2)}`,
      [
        { text: 'Huy', style: 'cancel' },
        {
          text: 'Dong',
          style: 'destructive',
          onPress: async () => {
            try {
              setClosingId(position.id);
              await paperTradeService.closePosition(
                position.id,
                position.currentPrice,
                'MANUAL'
              );
              await loadData();
              Alert.alert('Da dong!', 'Position da duoc dong thanh cong.');
            } catch (error) {
              Alert.alert('Loi', error.message);
            } finally {
              setClosingId(null);
            }
          },
        },
      ]
    );
  };

  // Format price
  const formatPrice = (price) => {
    if (!price) return '--';
    if (price >= 1000) return price.toLocaleString('en-US', { maximumFractionDigits: 2 });
    if (price >= 1) return price.toFixed(4);
    return price.toFixed(6);
  };

  // Format P&L
  const formatPnL = (pnl, percent) => {
    const sign = pnl >= 0 ? '+' : '';
    return `${sign}$${pnl.toFixed(2)} (${sign}${percent.toFixed(2)}%)`;
  };

  // Render position card
  const renderPosition = ({ item }) => {
    const isLong = item.direction === 'LONG';
    const pnlColor = item.unrealizedPnL >= 0 ? COLORS.success : COLORS.error;
    const directionColor = isLong ? COLORS.success : COLORS.error;
    const isClosing = closingId === item.id;

    return (
      <View style={styles.positionCard}>
        {/* Header */}
        <View style={styles.positionHeader}>
          <View style={styles.symbolRow}>
            <Text style={styles.symbolText}>{item.symbol.replace('USDT', '/USDT')}</Text>
            <View style={[styles.directionBadge, { backgroundColor: directionColor }]}>
              {isLong ? (
                <TrendingUp size={12} color="#000" />
              ) : (
                <TrendingDown size={12} color="#FFF" />
              )}
              <Text style={[styles.directionText, { color: isLong ? '#000' : '#FFF' }]}>
                {item.direction}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => handleClosePosition(item)}
            disabled={isClosing}
          >
            {isClosing ? (
              <ActivityIndicator size="small" color={COLORS.error} />
            ) : (
              <X size={20} color={COLORS.error} />
            )}
          </TouchableOpacity>
        </View>

        {/* P&L */}
        <View style={styles.pnlRow}>
          <Text style={[styles.pnlValue, { color: pnlColor }]}>
            {formatPnL(item.unrealizedPnL, item.unrealizedPnLPercent)}
          </Text>
        </View>

        {/* Details Grid */}
        <View style={styles.detailsGrid}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Entry</Text>
            <Text style={styles.detailValue}>${formatPrice(item.entryPrice)}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Hien Tai</Text>
            <Text style={[styles.detailValue, { color: pnlColor }]}>
              ${formatPrice(item.currentPrice)}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={[styles.detailLabel, { color: COLORS.error }]}>Stop Loss</Text>
            <Text style={[styles.detailValue, { color: COLORS.error }]}>
              ${formatPrice(item.stopLoss)}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={[styles.detailLabel, { color: COLORS.success }]}>Take Profit</Text>
            <Text style={[styles.detailValue, { color: COLORS.success }]}>
              ${formatPrice(item.takeProfit)}
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.positionFooter}>
          <View style={styles.footerItem}>
            <DollarSign size={14} color={COLORS.textMuted} />
            <Text style={styles.footerText}>${item.positionSize.toFixed(2)}</Text>
          </View>
          <View style={styles.footerItem}>
            <Clock size={14} color={COLORS.textMuted} />
            <Text style={styles.footerText}>
              {paperTradeService.calculateHoldingTime(item.openedAt)}
            </Text>
          </View>
          <View style={styles.footerItem}>
            <Target size={14} color={COLORS.textMuted} />
            <Text style={styles.footerText}>{item.patternType || 'Pattern'}</Text>
          </View>
        </View>
      </View>
    );
  };

  // Render stats header
  const renderStats = () => (
    <View style={styles.statsContainer}>
      <View style={styles.balanceCard}>
        <Wallet size={24} color={COLORS.gold} />
        <View>
          <Text style={styles.balanceLabel}>So Du Paper Trade</Text>
          <Text style={styles.balanceValue}>${stats?.balance?.toFixed(2) || '10,000.00'}</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Dang Mo</Text>
          <Text style={[styles.statValue, { color: COLORS.purple }]}>
            {stats?.openTrades || 0}
          </Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Tong P/L</Text>
          <Text
            style={[
              styles.statValue,
              { color: (stats?.totalPnL || 0) >= 0 ? COLORS.success : COLORS.error },
            ]}
          >
            {(stats?.totalPnL || 0) >= 0 ? '+' : ''}${(stats?.totalPnL || 0).toFixed(2)}
          </Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Win Rate</Text>
          <Text style={[styles.statValue, { color: COLORS.gold }]}>
            {(stats?.winRate || 0).toFixed(1)}%
          </Text>
        </View>
      </View>
    </View>
  );

  // Render empty state
  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <BarChart2 size={64} color={COLORS.textMuted} />
      <Text style={styles.emptyTitle}>Chua co position nao</Text>
      <Text style={styles.emptySubtitle}>
        Mo paper trade tu Pattern Scanner de bat dau
      </Text>
      <TouchableOpacity
        style={styles.scanButton}
        onPress={() => navigation.navigate('Scanner')}
      >
        <Text style={styles.scanButtonText}>Scan Patterns</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <LinearGradient
      colors={GRADIENTS.background}
      locations={GRADIENTS.backgroundLocations}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <ArrowLeft size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Open Positions</Text>
          <TouchableOpacity style={styles.refreshButton} onPress={updatePrices}>
            <RefreshCw size={20} color={COLORS.gold} />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.gold} />
          </View>
        ) : (
          <FlatList
            data={positions}
            renderItem={renderPosition}
            keyExtractor={(item) => item.id}
            ListHeaderComponent={renderStats}
            ListEmptyComponent={renderEmpty}
            contentContainerStyle={[
              styles.listContent,
              positions.length === 0 && styles.emptyListContent,
            ]}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={COLORS.gold}
              />
            }
          />
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.lg,
    backgroundColor: GLASS.background,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(106, 91, 255, 0.2)',
  },
  backButton: {
    padding: SPACING.xs,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  refreshButton: {
    padding: SPACING.xs,
  },

  // List
  listContent: {
    padding: SPACING.md,
    paddingBottom: 100,
  },
  emptyListContent: {
    flex: 1,
  },

  // Stats
  statsContainer: {
    marginBottom: SPACING.lg,
  },
  balanceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    backgroundColor: GLASS.background,
    padding: SPACING.lg,
    borderRadius: 16,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.3)',
  },
  balanceLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
  balanceValue: {
    fontSize: TYPOGRAPHY.fontSize.xxxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gold,
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  statBox: {
    flex: 1,
    backgroundColor: GLASS.background,
    padding: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  statValue: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },

  // Position Card
  positionCard: {
    backgroundColor: GLASS.background,
    borderRadius: 16,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
  },
  positionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  symbolRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  symbolText: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  directionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  directionText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  closeButton: {
    padding: SPACING.xs,
  },

  // P&L
  pnlRow: {
    marginBottom: SPACING.md,
  },
  pnlValue: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },

  // Details
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  detailItem: {
    width: '48%',
    backgroundColor: 'rgba(15, 16, 48, 0.5)',
    padding: SPACING.sm,
    borderRadius: 8,
  },
  detailLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },

  // Footer
  positionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
  },

  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xxl,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  emptySubtitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  scanButton: {
    backgroundColor: COLORS.burgundy,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xxl,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.3)',
  },
  scanButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
});
