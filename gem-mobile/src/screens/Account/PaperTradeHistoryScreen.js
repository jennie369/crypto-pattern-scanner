/**
 * GEM Mobile - Paper Trade History Screen
 * View closed paper trade positions with stats
 * Includes reset and custom initial balance settings
 * Updated: Collapsible trade cards + Sponsor Banner
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
  Modal,
  TextInput,
  Animated,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import CustomAlert, { useCustomAlert } from '../../components/CustomAlert';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Target,
  Award,
  Filter,
  Wallet,
  Banknote,
  Settings,
  RefreshCw,
  DollarSign,
  X,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  PlayCircle,
} from 'lucide-react-native';

import { COLORS, GRADIENTS, SPACING, TYPOGRAPHY, GLASS } from '../../utils/tokens';
import { formatPrice } from '../../utils/formatters';
import { useAuth } from '../../contexts/AuthContext';
import paperTradeService from '../../services/paperTradeService';
import SponsorBannerSection from '../../components/SponsorBannerSection';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const DEFAULT_INITIAL_BALANCE = 10000; // $10,000 default starting capital

const FILTERS = [
  { key: 'all', label: 'Tất cả' },
  { key: 'open', label: 'Đang Mở' },
  { key: 'closed', label: 'Đã Đóng' },
  { key: 'long', label: 'Long' },
  { key: 'short', label: 'Short' },
  { key: 'win', label: 'Thắng' },
  { key: 'loss', label: 'Thua' },
];

export default function PaperTradeHistoryScreen({ navigation }) {
  const { user } = useAuth();
  const { alert, AlertComponent } = useCustomAlert();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [trades, setTrades] = useState([]);
  const [stats, setStats] = useState({
    totalTrades: 0,
    openTrades: 0,
    wins: 0,
    losses: 0,
    winRate: 0,
    totalPnl: 0,
    realizedPnl: 0,
    unrealizedPnl: 0,
    avgPnl: 0,
    usedMargin: 0,
  });
  const [currentBalance, setCurrentBalance] = useState(DEFAULT_INITIAL_BALANCE);
  const [initialBalance, setInitialBalance] = useState(DEFAULT_INITIAL_BALANCE);
  const [filter, setFilter] = useState('all');

  // Settings Modal State
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [newInitialBalance, setNewInitialBalance] = useState('');
  const [settingsLoading, setSettingsLoading] = useState(false);

  // Expanded trade cards state
  const [expandedIds, setExpandedIds] = useState(new Set());

  // Toggle trade card expansion
  const toggleExpand = useCallback((id) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const loadData = useCallback(async () => {
    if (!user?.id) return;

    try {
      // Load from paperTradeService (AsyncStorage) - this has complete trade data with exit prices
      await paperTradeService.init();

      // Auto-recalculate balance to fix any corrupted data
      await paperTradeService.recalculateBalance();

      // Get equity (includes unrealized P&L)
      const equityData = paperTradeService.getEquity(user.id);
      setCurrentBalance(equityData.equity || DEFAULT_INITIAL_BALANCE);
      setInitialBalance(equityData.initialBalance || DEFAULT_INITIAL_BALANCE);

      // Get BOTH open positions AND closed trades
      const openPositions = paperTradeService.getOpenPositions(user.id);
      const historyData = paperTradeService.getTradeHistory(user.id, 100);

      // Transform open positions to match UI expectations
      const openTradeData = openPositions.map(trade => ({
        id: trade.id,
        symbol: trade.symbol,
        direction: trade.direction,
        entry_price: trade.entryPrice,
        exit_price: null, // Not closed yet
        current_price: trade.currentPrice,
        pnl: trade.unrealizedPnL || 0,
        pnl_percent: trade.unrealizedPnLPercent || 0,
        position_size: trade.positionSize,
        opened_at: trade.openedAt,
        closed_at: null,
        result: null,
        exit_reason: null,
        pattern_type: trade.patternType,
        timeframe: trade.timeframe,
        status: 'OPEN',
        stop_loss: trade.stopLoss,
        take_profit: trade.takeProfit,
      }));

      // Transform closed trades to match UI expectations
      const closedTradeData = historyData.map(trade => ({
        id: trade.id,
        symbol: trade.symbol,
        direction: trade.direction,
        entry_price: trade.entryPrice,
        exit_price: trade.exitPrice,
        current_price: trade.exitPrice,
        pnl: trade.realizedPnL || 0,
        pnl_percent: trade.realizedPnLPercent || 0,
        position_size: trade.positionSize,
        opened_at: trade.openedAt,
        closed_at: trade.closedAt,
        result: trade.result,
        exit_reason: trade.exitReason,
        pattern_type: trade.patternType,
        timeframe: trade.timeframe,
        status: 'CLOSED',
        stop_loss: trade.stopLoss,
        take_profit: trade.takeProfit,
      }));

      // Combine: open positions first, then closed trades
      setTrades([...openTradeData, ...closedTradeData]);

      // Get stats from paperTradeService (now includes unrealized P&L)
      const serviceStats = paperTradeService.getStats(user.id);
      setStats({
        totalTrades: serviceStats.totalTrades, // Closed trades
        openTrades: serviceStats.openTrades,
        wins: serviceStats.wins,
        losses: serviceStats.losses,
        winRate: serviceStats.winRate,
        totalPnl: serviceStats.totalPnL, // Realized + Unrealized
        realizedPnl: serviceStats.realizedPnL || 0,
        unrealizedPnl: serviceStats.unrealizedPnL || 0,
        avgPnl: serviceStats.avgPnL,
        usedMargin: serviceStats.usedMargin || 0,
      });
    } catch (error) {
      console.error('[PaperTradeHistory] Load error:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Refresh data when screen is focused (real-time sync with OpenPositionsScreen)
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Open settings modal
  const handleOpenSettings = () => {
    setNewInitialBalance(initialBalance.toString());
    setSettingsModalVisible(true);
  };

  // Reset account with current initial balance
  const handleResetAccount = async () => {
    alert({
      type: 'warning',
      title: 'Xác Nhận Reset',
      message: `Bạn có chắc muốn reset tài khoản Paper Trade?\n\nTất cả lệnh đang mở và lịch sử giao dịch sẽ bị xóa.\nSố dư sẽ được reset về $${initialBalance.toLocaleString()}.`,
      buttons: [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              setSettingsLoading(true);
              await paperTradeService.resetAll();
              await loadData();
              setSettingsModalVisible(false);
              alert({
                type: 'success',
                title: 'Thành Công',
                message: 'Tài khoản Paper Trade đã được reset.',
              });
            } catch (error) {
              console.error('[PaperTrade] Reset error:', error);
              alert({
                type: 'error',
                title: 'Lỗi',
                message: error.message || 'Không thể reset tài khoản.',
              });
            } finally {
              setSettingsLoading(false);
            }
          },
        },
      ],
    });
  };

  // Reset to default ($10,000)
  const handleResetToDefault = async () => {
    alert({
      type: 'warning',
      title: 'Reset Về Mặc Định',
      message: 'Bạn có chắc muốn reset về mặc định?\n\nVốn ban đầu: $10,000\nTất cả lệnh và lịch sử sẽ bị xóa.',
      buttons: [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              setSettingsLoading(true);
              await paperTradeService.resetToDefault();
              await loadData();
              setSettingsModalVisible(false);
              alert({
                type: 'success',
                title: 'Thành Công',
                message: 'Đã reset về mặc định ($10,000).',
              });
            } catch (error) {
              console.error('[PaperTrade] Reset to default error:', error);
              alert({
                type: 'error',
                title: 'Lỗi',
                message: error.message || 'Không thể reset.',
              });
            } finally {
              setSettingsLoading(false);
            }
          },
        },
      ],
    });
  };

  // Set new initial balance
  const handleSetInitialBalance = async (resetAccount = false) => {
    const amount = parseFloat(newInitialBalance.replace(/,/g, ''));

    if (isNaN(amount) || amount <= 0) {
      alert({ type: 'error', title: 'Lỗi', message: 'Vui lòng nhập số tiền hợp lệ.' });
      return;
    }

    if (amount < 100) {
      alert({ type: 'error', title: 'Lỗi', message: 'Số tiền tối thiểu là $100.' });
      return;
    }

    if (amount > 10000000) {
      alert({ type: 'error', title: 'Lỗi', message: 'Số tiền tối đa là $10,000,000.' });
      return;
    }

    const confirmMessage = resetAccount
      ? `Đặt vốn ban đầu: $${amount.toLocaleString()}\n\nTất cả lệnh và lịch sử sẽ bị xóa.`
      : `Đặt vốn ban đầu: $${amount.toLocaleString()}\n\nSố dư hiện tại sẽ được điều chỉnh theo sự thay đổi.`;

    alert({
      type: 'warning',
      title: 'Xác Nhận',
      message: confirmMessage,
      buttons: [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xác Nhận',
          onPress: async () => {
            try {
              setSettingsLoading(true);
              await paperTradeService.setInitialBalance(amount, resetAccount);
              await loadData();
              setSettingsModalVisible(false);
              alert({
                type: 'success',
                title: 'Thành Công',
                message: `Vốn ban đầu đã được đặt thành $${amount.toLocaleString()}.`,
              });
            } catch (error) {
              console.error('[PaperTrade] Set initial balance error:', error);
              alert({
                type: 'error',
                title: 'Lỗi',
                message: error.message || 'Không thể đặt số tiền.',
              });
            } finally {
              setSettingsLoading(false);
            }
          },
        },
      ],
    });
  };

  // Quick set buttons
  const quickSetAmounts = [1000, 5000, 10000, 50000, 100000];

  const getFilteredTrades = () => {
    switch (filter) {
      case 'open':
        return trades.filter(t => t.status === 'OPEN');
      case 'closed':
        return trades.filter(t => t.status === 'CLOSED');
      case 'long':
        return trades.filter(t => t.direction === 'LONG');
      case 'short':
        return trades.filter(t => t.direction === 'SHORT');
      case 'win':
        return trades.filter(t => t.status === 'CLOSED' && (t.pnl || 0) > 0);
      case 'loss':
        return trades.filter(t => t.status === 'CLOSED' && (t.pnl || 0) <= 0);
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

  const formatCurrencySimple = (value) => {
    if (!value && value !== 0) return '--';
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  // formatPrice is now imported from utils/formatters

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
          <TouchableOpacity onPress={handleOpenSettings} style={styles.settingsButton}>
            <Settings size={22} color={COLORS.gold} />
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
          {/* Stats Cards */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <BarChart3 size={20} color={COLORS.purple} />
              <Text style={styles.statValue}>{stats.openTrades}</Text>
              <Text style={styles.statLabel}>Đang Mở</Text>
            </View>
            <View style={styles.statCard}>
              <BarChart3 size={20} color={COLORS.cyan} />
              <Text style={styles.statValue}>{stats.totalTrades}</Text>
              <Text style={styles.statLabel}>Đã Đóng</Text>
            </View>
            <View style={styles.statCard}>
              <Target size={20} color={COLORS.gold} />
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

          {/* Balance Cards - Capital & Current Balance */}
          <View style={styles.balanceRow}>
            <TouchableOpacity style={styles.balanceCard} onPress={handleOpenSettings} activeOpacity={0.7}>
              <View style={styles.balanceCardHeader}>
                <Banknote size={18} color={COLORS.textMuted} />
                <Settings size={12} color={COLORS.textMuted} style={{ marginLeft: 4 }} />
              </View>
              <Text style={styles.balanceLabel}>Vốn Ban Đầu</Text>
              <Text style={styles.balanceValue}>${initialBalance.toLocaleString()}</Text>
            </TouchableOpacity>
            <View style={[styles.balanceCard, styles.currentBalanceCard]}>
              <Wallet size={18} color={COLORS.gold} />
              <Text style={styles.balanceLabel}>Số Dư Hiện Tại</Text>
              <Text style={[styles.balanceValue, { color: COLORS.gold }]}>
                ${currentBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Text>
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
              {filteredTrades.map((trade) => {
                const isOpen = trade.status === 'OPEN';
                const isExpanded = expandedIds.has(trade.id);
                const pnlColor = (trade.pnl || 0) >= 0 ? COLORS.success : COLORS.error;

                return (
                  <TouchableOpacity
                    key={trade.id}
                    style={[styles.tradeCard, isOpen && styles.tradeCardOpen]}
                    onPress={() => toggleExpand(trade.id)}
                    activeOpacity={0.8}
                  >
                    {/* Compact Header - Always Visible */}
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
                        {isOpen && (
                          <View style={styles.openBadge}>
                            <Text style={styles.openBadgeText}>ĐANG MỞ</Text>
                          </View>
                        )}
                      </View>
                      <View style={styles.tradeRightCompact}>
                        <Text style={[styles.tradePnl, { color: pnlColor }]}>
                          {formatCurrency(trade.pnl)} USDT
                        </Text>
                        {isExpanded ? (
                          <ChevronUp size={16} color={COLORS.textMuted} />
                        ) : (
                          <ChevronDown size={16} color={COLORS.textMuted} />
                        )}
                      </View>
                    </View>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <View style={styles.expandedContent}>
                        {/* Price Info */}
                        <View style={styles.tradeDetails}>
                          <View style={styles.tradeDetailRow}>
                            <Text style={styles.tradeDetailLabel}>Giá vào</Text>
                            <Text style={styles.tradeDetailValue}>${formatPrice(trade.entry_price)}</Text>
                          </View>
                          <View style={styles.tradeDetailRow}>
                            <Text style={styles.tradeDetailLabel}>{isOpen ? 'Giá hiện tại' : 'Giá ra'}</Text>
                            <Text style={[styles.tradeDetailValue, isOpen && { color: pnlColor }]}>
                              ${formatPrice(isOpen ? trade.current_price : trade.exit_price)}
                            </Text>
                          </View>
                          <View style={styles.tradeDetailRow}>
                            <Text style={styles.tradeDetailLabel}>Khối lượng</Text>
                            <Text style={styles.tradeDetailValue}>{formatCurrencySimple(trade.position_size)} USDT</Text>
                          </View>
                        </View>

                        {/* SL/TP for open trades */}
                        {isOpen && (
                          <View style={styles.slTpRow}>
                            <View style={styles.slTpItem}>
                              <Text style={[styles.tradeDetailLabel, { color: COLORS.error }]}>SL</Text>
                              <Text style={[styles.tradeDetailValue, { color: COLORS.error }]}>
                                ${formatPrice(trade.stop_loss)}
                              </Text>
                            </View>
                            <View style={styles.slTpItem}>
                              <Text style={[styles.tradeDetailLabel, { color: COLORS.success }]}>TP</Text>
                              <Text style={[styles.tradeDetailValue, { color: COLORS.success }]}>
                                ${formatPrice(trade.take_profit)}
                              </Text>
                            </View>
                          </View>
                        )}

                        {/* P/L Percent & Date Footer */}
                        <View style={styles.tradeFooter}>
                          <Text style={[styles.tradePnlPercent, { color: pnlColor }]}>
                            {formatPercent(trade.pnl_percent)}
                          </Text>
                          <Text style={styles.tradeDate}>
                            {isOpen ? `Mở: ${formatDate(trade.opened_at)}` : formatDate(trade.closed_at)}
                          </Text>
                          {(trade.pnl || 0) > 0 ? (
                            <TrendingUp size={16} color={COLORS.success} />
                          ) : (
                            <TrendingDown size={16} color={COLORS.error} />
                          )}
                        </View>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* Sponsor Banner */}
          <SponsorBannerSection
            screenName="paper_trade"
            navigation={navigation}
            maxBanners={1}
          />

          <View style={{ height: 150 }} />
        </ScrollView>

        {/* Settings Modal */}
        <Modal
          visible={settingsModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setSettingsModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Cài Đặt Paper Trade</Text>
                <TouchableOpacity
                  onPress={() => setSettingsModalVisible(false)}
                  style={styles.modalCloseButton}
                >
                  <X size={22} color={COLORS.textPrimary} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
                {/* Current Settings */}
                <View style={styles.settingsSection}>
                  <Text style={styles.settingsSectionTitle}>Cài Đặt Hiện Tại</Text>
                  <View style={styles.currentSettingsCard}>
                    <View style={styles.settingsRow}>
                      <Text style={styles.settingsLabel}>Vốn ban đầu:</Text>
                      <Text style={styles.settingsValue}>${initialBalance.toLocaleString()}</Text>
                    </View>
                    <View style={styles.settingsRow}>
                      <Text style={styles.settingsLabel}>Số dư hiện tại:</Text>
                      <Text style={[styles.settingsValue, { color: COLORS.gold }]}>
                        ${currentBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </Text>
                    </View>
                    <View style={styles.settingsRow}>
                      <Text style={styles.settingsLabel}>Lệnh đang mở:</Text>
                      <Text style={styles.settingsValue}>{stats.openTrades}</Text>
                    </View>
                    <View style={styles.settingsRow}>
                      <Text style={styles.settingsLabel}>Tổng lệnh đã đóng:</Text>
                      <Text style={styles.settingsValue}>{stats.totalTrades}</Text>
                    </View>
                  </View>
                </View>

                {/* Set Initial Balance */}
                <View style={styles.settingsSection}>
                  <Text style={styles.settingsSectionTitle}>Đặt Vốn Ban Đầu Mới</Text>
                  <View style={styles.inputContainer}>
                    <DollarSign size={20} color={COLORS.textMuted} />
                    <TextInput
                      style={styles.input}
                      value={newInitialBalance}
                      onChangeText={setNewInitialBalance}
                      placeholder="Nhập số tiền..."
                      placeholderTextColor={COLORS.textMuted}
                      keyboardType="numeric"
                      editable={!settingsLoading}
                    />
                  </View>

                  {/* Quick Set Buttons */}
                  <View style={styles.quickSetRow}>
                    {quickSetAmounts.map((amount) => (
                      <TouchableOpacity
                        key={amount}
                        style={[
                          styles.quickSetButton,
                          parseFloat(newInitialBalance) === amount && styles.quickSetButtonActive,
                        ]}
                        onPress={() => setNewInitialBalance(amount.toString())}
                        disabled={settingsLoading}
                      >
                        <Text style={[
                          styles.quickSetText,
                          parseFloat(newInitialBalance) === amount && styles.quickSetTextActive,
                        ]}>
                          ${amount >= 1000 ? `${amount / 1000}K` : amount}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Apply Buttons */}
                  <TouchableOpacity
                    style={[styles.applyButton, settingsLoading && styles.buttonDisabled]}
                    onPress={() => handleSetInitialBalance(false)}
                    disabled={settingsLoading}
                  >
                    {settingsLoading ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <>
                        <DollarSign size={18} color="#FFFFFF" />
                        <Text style={styles.applyButtonText}>Áp Dụng (Giữ Lịch Sử)</Text>
                      </>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.applyButtonSecondary, settingsLoading && styles.buttonDisabled]}
                    onPress={() => handleSetInitialBalance(true)}
                    disabled={settingsLoading}
                  >
                    <RefreshCw size={18} color={COLORS.gold} />
                    <Text style={styles.applyButtonSecondaryText}>Áp Dụng & Reset Tài Khoản</Text>
                  </TouchableOpacity>
                </View>

                {/* Reset Options */}
                <View style={styles.settingsSection}>
                  <Text style={styles.settingsSectionTitle}>Tùy Chọn Reset</Text>

                  <TouchableOpacity
                    style={[styles.resetButton, settingsLoading && styles.buttonDisabled]}
                    onPress={handleResetAccount}
                    disabled={settingsLoading}
                  >
                    <RefreshCw size={18} color={COLORS.warning} />
                    <View style={styles.resetButtonContent}>
                      <Text style={styles.resetButtonText}>Reset Tài Khoản</Text>
                      <Text style={styles.resetButtonDesc}>
                        Xóa tất cả lệnh, giữ nguyên vốn ban đầu (${initialBalance.toLocaleString()})
                      </Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.resetButtonDanger, settingsLoading && styles.buttonDisabled]}
                    onPress={handleResetToDefault}
                    disabled={settingsLoading}
                  >
                    <AlertTriangle size={18} color={COLORS.error} />
                    <View style={styles.resetButtonContent}>
                      <Text style={styles.resetButtonTextDanger}>Reset Về Mặc Định</Text>
                      <Text style={styles.resetButtonDesc}>
                        Reset tất cả về $10,000 ban đầu
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>

                {/* Info Note */}
                <View style={styles.infoNote}>
                  <AlertTriangle size={14} color={COLORS.warning} />
                  <Text style={styles.infoNoteText}>
                    Lưu ý: Paper Trade chỉ dùng để thực hành. Kết quả không phản ánh giao dịch thực tế.
                  </Text>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {AlertComponent}
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

  // Balance Row
  balanceRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  balanceCard: {
    flex: 1,
    backgroundColor: GLASS.background,
    borderRadius: 14,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
  },
  currentBalanceCard: {
    borderColor: 'rgba(255, 189, 89, 0.3)',
  },
  balanceLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 6,
    letterSpacing: 0.3,
  },
  balanceValue: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
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
    padding: SPACING.sm,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.xs,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
  },
  tradeCardOpen: {
    borderColor: 'rgba(106, 91, 255, 0.5)',
    borderWidth: 2,
  },
  expandedContent: {
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  openBadge: {
    backgroundColor: 'rgba(106, 91, 255, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.purple,
  },
  openBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.purple,
    letterSpacing: 0.5,
  },
  slTpRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    marginTop: SPACING.xs,
  },
  slTpItem: {
    alignItems: 'center',
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
  tradeRightCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tradePnl: {
    fontSize: 14,
    fontWeight: '700',
  },
  tradePnlPercent: {
    fontSize: 12,
  },
  tradeDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.xs,
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
    marginTop: SPACING.xs,
    paddingTop: SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  tradeDate: {
    fontSize: 11,
    color: COLORS.textMuted,
  },

  // Settings Button
  settingsButton: {
    padding: 8,
  },

  // Balance Card Header
  balanceCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.3)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  modalCloseButton: {
    padding: 4,
  },
  modalContent: {
    padding: SPACING.lg,
  },

  // Settings Section
  settingsSection: {
    marginBottom: SPACING.xl,
  },
  settingsSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  currentSettingsCard: {
    backgroundColor: GLASS.background,
    borderRadius: 14,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
  },
  settingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  settingsLabel: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  settingsValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },

  // Input
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GLASS.background,
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.3)',
    marginBottom: SPACING.md,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: SPACING.sm,
    fontSize: 16,
    color: COLORS.textPrimary,
  },

  // Quick Set
  quickSetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: SPACING.md,
  },
  quickSetButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  quickSetButtonActive: {
    backgroundColor: 'rgba(106, 91, 255, 0.2)',
    borderColor: COLORS.purple,
  },
  quickSetText: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  quickSetTextActive: {
    color: COLORS.purple,
  },

  // Apply Button
  applyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.purple,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    marginBottom: SPACING.sm,
  },
  applyButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  applyButtonSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.5)',
  },
  applyButtonSecondaryText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gold,
  },
  buttonDisabled: {
    opacity: 0.5,
  },

  // Reset Buttons
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GLASS.background,
    paddingVertical: 14,
    paddingHorizontal: SPACING.md,
    borderRadius: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.3)',
    marginBottom: SPACING.sm,
  },
  resetButtonDanger: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GLASS.background,
    paddingVertical: 14,
    paddingHorizontal: SPACING.md,
    borderRadius: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 48, 0.3)',
  },
  resetButtonContent: {
    flex: 1,
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.warning,
  },
  resetButtonTextDanger: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.error,
  },
  resetButtonDesc: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },

  // Info Note
  infoNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255, 189, 89, 0.1)',
    padding: SPACING.md,
    borderRadius: 10,
    gap: 8,
    marginBottom: SPACING.xl,
  },
  infoNoteText: {
    flex: 1,
    fontSize: 11,
    color: COLORS.warning,
    lineHeight: 16,
  },
});
