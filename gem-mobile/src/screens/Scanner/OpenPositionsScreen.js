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
  ActivityIndicator,
} from 'react-native';
import CustomAlert from '../../components/CustomAlert';
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
  History,
} from 'lucide-react-native';
import { useAuth } from '../../contexts/AuthContext';
import paperTradeService from '../../services/paperTradeService';
import { binanceService } from '../../services/binanceService';
import { COLORS, GRADIENTS, SPACING, TYPOGRAPHY, GLASS } from '../../utils/tokens';
import { formatPrice, formatCurrency } from '../../utils/formatters';
import SponsorBannerSection from '../../components/SponsorBannerSection';

export default function OpenPositionsScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();

  const [positions, setPositions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [closingId, setClosingId] = useState(null);

  // Custom Alert state
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    buttons: [{ text: 'OK' }],
    type: 'default',
  });

  // Custom alert function to replace Alert.alert()
  const showAlert = (title, message, buttons = [{ text: 'OK' }], type = 'default') => {
    setAlertConfig({ visible: true, title, message, buttons, type });
  };

  const closeAlert = () => {
    setAlertConfig((prev) => ({ ...prev, visible: false }));
  };

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
          showAlert(
            closed.result === 'WIN' ? 'Chạm Chốt lời!' : 'Chạm Cắt lỗ!',
            `${closed.symbol} ${closed.direction}\n` +
              `P/L: ${closed.realizedPnL >= 0 ? '+' : ''}$${formatCurrency(closed.realizedPnL)}`,
            [{ text: 'OK' }],
            closed.result === 'WIN' ? 'success' : 'error'
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
    showAlert(
      'Đóng lệnh?',
      `${position.symbol} ${position.direction}\n` +
        `P/L: ${position.unrealizedPnL >= 0 ? '+' : ''}$${formatCurrency(position.unrealizedPnL)}`,
      [
        { text: 'Huỷ', style: 'cancel' },
        {
          text: 'Đóng',
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
              showAlert('Đã đóng!', 'Lệnh đã được đóng thành công.', [{ text: 'OK' }], 'success');
            } catch (error) {
              showAlert('Lỗi', error.message, [{ text: 'OK' }], 'error');
            } finally {
              setClosingId(null);
            }
          },
        },
      ],
      'warning'
    );
  };

  // formatPrice and formatCurrency are imported from utils/formatters

  // Format P&L with thousand separators
  const formatPnL = (pnl, percent) => {
    const sign = pnl >= 0 ? '+' : '';
    return `${sign}$${formatCurrency(Math.abs(pnl))} (${sign}${percent.toFixed(2)}%)`;
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
            <Text style={styles.detailLabel}>Giá vào</Text>
            <Text style={styles.detailValue}>${formatPrice(item.entryPrice)}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Hiện tại</Text>
            <Text style={[styles.detailValue, { color: pnlColor }]}>
              ${formatPrice(item.currentPrice)}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={[styles.detailLabel, { color: COLORS.error }]}>Cắt lỗ</Text>
            <Text style={[styles.detailValue, { color: COLORS.error }]}>
              ${formatPrice(item.stopLoss)}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={[styles.detailLabel, { color: COLORS.success }]}>Chốt lời</Text>
            <Text style={[styles.detailValue, { color: COLORS.success }]}>
              ${formatPrice(item.takeProfit)}
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.positionFooter}>
          <View style={styles.footerItem}>
            <DollarSign size={14} color={COLORS.textMuted} />
            <Text style={styles.footerText}>${formatCurrency(item.positionSize)}</Text>
          </View>
          <View style={styles.footerItem}>
            <Clock size={14} color={COLORS.textMuted} />
            <Text style={styles.footerText}>
              {paperTradeService.calculateHoldingTime(item.openedAt)}
            </Text>
          </View>
          <View style={styles.footerItem}>
            <Target size={14} color={COLORS.textMuted} />
            <Text style={styles.footerText}>{item.patternType || 'Mẫu'}</Text>
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
          <Text style={styles.balanceLabel}>Số Dư Paper Trade</Text>
          <Text style={styles.balanceValue}>${formatCurrency(stats?.balance || 10000)}</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Đang Mở</Text>
          <Text style={[styles.statValue, { color: COLORS.purple }]}>
            {stats?.openTrades || 0}
          </Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Đã Đóng</Text>
          <Text style={[styles.statValue, { color: COLORS.cyan }]}>
            {stats?.totalTrades || 0}
          </Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Win Rate</Text>
          <Text style={[styles.statValue, { color: COLORS.gold }]}>
            {(stats?.winRate || 0).toFixed(1)}%
          </Text>
        </View>
      </View>
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Tổng P/L</Text>
          <Text
            style={[
              styles.statValue,
              { color: (stats?.totalPnL || 0) >= 0 ? COLORS.success : COLORS.error },
            ]}
          >
            {(stats?.totalPnL || 0) >= 0 ? '+' : ''}${formatCurrency(Math.abs(stats?.totalPnL || 0))}
          </Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statLabel, { color: COLORS.success }]}>Thắng</Text>
          <Text style={[styles.statValue, { color: COLORS.success }]}>
            {stats?.wins || 0}
          </Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statLabel, { color: COLORS.error }]}>Thua</Text>
          <Text style={[styles.statValue, { color: COLORS.error }]}>
            {stats?.losses || 0}
          </Text>
        </View>
      </View>
    </View>
  );

  // Render empty state
  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <BarChart2 size={64} color={COLORS.textMuted} />
      <Text style={styles.emptyTitle}>Chưa có lệnh nào</Text>
      <Text style={styles.emptySubtitle}>
        Mở paper trade từ Pattern Scanner để bắt đầu
      </Text>
      <TouchableOpacity
        style={styles.scanButton}
        onPress={() => navigation.navigate('ScannerMain')}
      >
        <Text style={styles.scanButtonText}>Quét mẫu</Text>
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
          <Text style={styles.title}>Lệnh đang mở</Text>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.historyButton}
              onPress={() => navigation.navigate('PaperTradeHistory')}
            >
              <History size={20} color={COLORS.purple} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.refreshButton} onPress={updatePrices}>
              <RefreshCw size={20} color={COLORS.gold} />
            </TouchableOpacity>
          </View>
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
            ListFooterComponent={() => (
              <View style={styles.footerContainer}>
                {/* Quick Action to History */}
                <TouchableOpacity
                  style={styles.viewHistoryButton}
                  onPress={() => navigation.navigate('PaperTradeHistory')}
                >
                  <History size={18} color={COLORS.gold} />
                  <Text style={styles.viewHistoryText}>Xem Lịch Sử Paper Trade</Text>
                </TouchableOpacity>

                {/* Sponsor Banner */}
                <SponsorBannerSection
                  screenName="paper_trade"
                  navigation={navigation}
                  maxBanners={1}
                />
              </View>
            )}
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

      {/* Custom Alert */}
      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
        type={alertConfig.type}
        onClose={closeAlert}
      />
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  historyButton: {
    padding: SPACING.xs,
    backgroundColor: 'rgba(106, 91, 255, 0.15)',
    borderRadius: 8,
  },
  refreshButton: {
    padding: SPACING.xs,
  },

  // List
  listContent: {
    padding: SPACING.md,
    paddingBottom: 180,
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

  // Footer Container
  footerContainer: {
    marginTop: SPACING.lg,
  },
  viewHistoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 189, 89, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.3)',
    borderRadius: 12,
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  viewHistoryText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.gold,
  },
});
