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
  Clock,
  Gem,
  Brain,
  Scale,
  Percent,
  Layers,
  Timer,
  CheckCircle,
  XCircle,
} from 'lucide-react-native';

import { COLORS, GRADIENTS, SPACING, TYPOGRAPHY, GLASS } from '../../utils/tokens';
import { formatPrice } from '../../utils/formatters';
import { useAuth } from '../../contexts/AuthContext';
import paperTradeService from '../../services/paperTradeService';
import SponsorBannerSection from '../../components/SponsorBannerSection';

// Vietnamese pattern names mapping (same as PatternDetailScreen)
const PATTERN_NAMES_VI = {
  // GEM Frequency patterns (keep uppercase)
  'dpu': 'DPU',
  'dpd': 'DPD',
  'upu': 'UPU',
  'upd': 'UPD',
  'hfz': 'HFZ',
  'lfz': 'LFZ',
  // Classic patterns
  'reversal': 'Đảo Chiều',
  'double_top': 'Hai Đỉnh',
  'double_bottom': 'Hai Đáy',
  'head_shoulders': 'Vai Đầu Vai',
  'inverse_head_shoulders': 'Vai Đầu Vai Ngược',
  'triangle': 'Tam Giác',
  'ascending_triangle': 'Tam Giác Tăng',
  'descending_triangle': 'Tam Giác Giảm',
  'symmetrical_triangle': 'Tam Giác Đối Xứng',
  'symmetric_triangle': 'Tam Giác Đối Xứng',
  'wedge': 'Wedge',
  'rising_wedge': 'Rising Wedge',
  'falling_wedge': 'Falling Wedge',
  'flag': 'Cờ',
  'bull_flag': 'Cờ Tăng',
  'bear_flag': 'Cờ Giảm',
  'channel': 'Kênh Giá',
  'support_bounce': 'Nảy Hỗ Trợ',
  'resistance_reject': 'Từ Chối Kháng Cự',
  'breakout': 'Phá Vỡ',
  'pullback': 'Hồi Về',
  'continuation': 'Tiếp Diễn',
};

// Abbreviations that should stay uppercase
const UPPERCASE_PATTERNS = ['DPU', 'DPD', 'UPU', 'UPD', 'HFZ', 'LFZ', 'H&S', 'HS'];

// Get Vietnamese pattern name
const getPatternNameVI = (patternType) => {
  if (!patternType) return 'N/A';
  const key = patternType.toLowerCase();

  // Check dictionary first
  if (PATTERN_NAMES_VI[key]) {
    return PATTERN_NAMES_VI[key];
  }

  // Check if it's an abbreviation that should stay uppercase
  const upperType = patternType.toUpperCase();
  if (UPPERCASE_PATTERNS.includes(upperType)) {
    return upperType;
  }

  // Fallback: return as-is
  return patternType;
};

// Capitalize first letter
const capitalizeFirst = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

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

  // Diagnostic state
  const [diagnosticReport, setDiagnosticReport] = useState(null);
  const [diagnosing, setDiagnosing] = useState(false);

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
      // Load from paperTradeService with CLOUD SYNC (user.id for cloud data)
      await paperTradeService.init(user.id);

      // Auto-recalculate balance to fix any corrupted data
      await paperTradeService.recalculateBalance();

      // Get equity (includes unrealized P&L)
      const equityData = paperTradeService.getEquity(user.id);
      setCurrentBalance(equityData.equity || DEFAULT_INITIAL_BALANCE);
      setInitialBalance(equityData.initialBalance || DEFAULT_INITIAL_BALANCE);

      // Get BOTH open positions AND closed trades
      const openPositions = paperTradeService.getOpenPositions(user.id);
      const historyData = paperTradeService.getTradeHistory(user.id, 100);

      // Transform open positions to match UI expectations (COMPLETE DATA)
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
        // Additional fields for complete info display
        margin: trade.margin || trade.positionSize,
        position_value: trade.positionValue || (trade.margin || trade.positionSize) * (trade.leverage || 10),
        leverage: trade.leverage || 10,
        confidence: trade.confidence || trade.patternData?.confidence || 75,
        risk_reward: trade.riskRewardRatio || trade.patternData?.riskReward || '1:2',
        win_rate: trade.patternData?.winRate || 65,
        trade_mode: trade.tradeMode || 'pattern',
        ai_score: trade.aiScore || null,
        holding_time: trade.holdingTime || null,
      }));

      // Transform closed trades to match UI expectations (COMPLETE DATA)
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
        // Additional fields for complete info display
        margin: trade.margin || trade.positionSize,
        position_value: trade.positionValue || (trade.margin || trade.positionSize) * (trade.leverage || 10),
        leverage: trade.leverage || 10,
        confidence: trade.confidence || trade.patternData?.confidence || 75,
        risk_reward: trade.riskRewardRatio || trade.patternData?.riskReward || '1:2',
        win_rate: trade.patternData?.winRate || 65,
        trade_mode: trade.tradeMode || 'pattern',
        ai_score: trade.aiScore || null,
        holding_time: trade.holdingTime || null,
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
      message: `Bạn có chắc muốn reset tài khoản Paper Trade?\n\nTất cả lệnh đang mở và lịch sử giao dịch sẽ bị xóa.\nSố dư sẽ được reset về $${initialBalance.toLocaleString('vi-VN')}.`,
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
      message: `Bạn có chắc muốn reset về mặc định?\n\nVốn ban đầu: $${DEFAULT_INITIAL_BALANCE.toLocaleString('vi-VN')}\nTất cả lệnh và lịch sử sẽ bị xóa.`,
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
                message: `Đã reset về mặc định ($${DEFAULT_INITIAL_BALANCE.toLocaleString('vi-VN')}).`,
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
    // Parse number - handle both Vietnamese (10.000,50) and US (10,000.50) formats
    // Remove dots (Vietnamese thousands separator) and commas (US thousands separator)
    const cleanedValue = newInitialBalance.replace(/\./g, '').replace(/,/g, '');
    const amount = parseFloat(cleanedValue);

    if (isNaN(amount) || amount <= 0) {
      alert({ type: 'error', title: 'Lỗi', message: 'Vui lòng nhập số tiền hợp lệ.' });
      return;
    }

    if (amount < 100) {
      alert({ type: 'error', title: 'Lỗi', message: 'Số tiền tối thiểu là $100.' });
      return;
    }

    if (amount > 10000000) {
      alert({ type: 'error', title: 'Lỗi', message: 'Số tiền tối đa là $10.000.000.' });
      return;
    }

    // Helper function to execute the balance change
    const executeBalanceChange = async () => {
      try {
        setSettingsLoading(true);
        await paperTradeService.setInitialBalance(amount, resetAccount);
        await loadData();

        if (resetAccount) {
          setSettingsModalVisible(false);
        }

        alert({
          type: 'success',
          title: 'Thành Công',
          message: resetAccount
            ? `Đã reset tài khoản với vốn ban đầu $${amount.toLocaleString('vi-VN')}.`
            : `Vốn ban đầu đã được đặt thành $${amount.toLocaleString('vi-VN')}.`,
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
    };

    // Reset case needs confirmation since it deletes data
    if (resetAccount) {
      alert({
        type: 'warning',
        title: 'Xác Nhận Reset',
        message: `Đặt vốn ban đầu: $${amount.toLocaleString('vi-VN')}\n\nTất cả lệnh và lịch sử sẽ bị xóa.`,
        buttons: [
          { text: 'Hủy', style: 'cancel' },
          {
            text: 'Xác Nhận Reset',
            style: 'destructive',
            onPress: executeBalanceChange,
          },
        ],
      });
    } else {
      // Non-destructive: execute directly
      await executeBalanceChange();
    }
  };

  // Quick set buttons
  const quickSetAmounts = [1000, 5000, 10000, 50000, 100000];

  // Diagnostic function
  const handleRunDiagnostic = async () => {
    if (!user?.id) {
      alert({ type: 'error', title: 'Lỗi', message: 'Không tìm thấy user ID. Vui lòng đăng nhập lại.' });
      return;
    }

    setDiagnosing(true);
    try {
      const report = await paperTradeService.diagnoseDataStorage(user.id);
      setDiagnosticReport(report);

      // Build detailed message
      let messageLines = ['Kết quả chẩn đoán:\n'];

      // Cloud data
      if (report.supabase?.hasData) {
        messageLines.push(`☁️ Cloud: ${report.supabase.totalTrades || 0} lệnh`);
        if (report.supabase.balance) {
          messageLines.push(`   Số dư: $${report.supabase.balance.toLocaleString('vi-VN')}`);
        }
      } else if (report.supabase?.error) {
        messageLines.push(`☁️ Cloud: Lỗi - ${report.supabase.error}`);
      } else {
        messageLines.push('☁️ Cloud: Không có dữ liệu');
      }

      // User-specific storage
      if (report.userSpecificStorage?.hasData) {
        messageLines.push(`📱 Local (User): ${report.userSpecificStorage.positions + report.userSpecificStorage.history} lệnh`);
      }

      // Legacy storage
      if (report.legacyStorage?.hasData) {
        messageLines.push(`📦 Legacy: ${report.legacyStorage.positions + report.legacyStorage.history} lệnh`);
        if (report.legacyStorage.balance) {
          messageLines.push(`   Số dư: $${report.legacyStorage.balance.toLocaleString('vi-VN')}`);
        }
      }

      messageLines.push('\n💡 ' + report.recommendation);

      const hasAnyData = report.supabase?.hasData || report.legacyStorage?.hasData || report.userSpecificStorage?.hasData;

      alert({
        type: hasAnyData ? 'info' : 'warning',
        title: hasAnyData ? 'Tìm Thấy Dữ Liệu' : 'Không Tìm Thấy',
        message: messageLines.join('\n'),
      });
    } catch (error) {
      console.error('[Diagnostic] Error:', error);
      alert({ type: 'error', title: 'Lỗi', message: error.message });
    } finally {
      setDiagnosing(false);
    }
  };

  // Attempt data recovery
  const handleAttemptRecovery = async () => {
    if (!user?.id) {
      alert({ type: 'error', title: 'Lỗi', message: 'Không tìm thấy user ID. Vui lòng đăng nhập lại.' });
      return;
    }

    alert({
      type: 'info',
      title: 'Khôi Phục Dữ Liệu',
      message: 'Hệ thống sẽ tìm kiếm và khôi phục dữ liệu từ tất cả các nguồn lưu trữ (Cloud, Local, Legacy).',
      buttons: [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Khôi Phục',
          onPress: async () => {
            setDiagnosing(true);
            try {
              const result = await paperTradeService.attemptDataRecovery(user.id);

              if (result.success) {
                await loadData();

                // Format source name in Vietnamese
                let sourceName = 'Cloud (Supabase)';
                if (result.source === 'user_specific_storage') {
                  sourceName = 'Local Storage (User)';
                } else if (result.source === 'legacy_storage') {
                  sourceName = 'Legacy Storage';
                } else if (result.source === 'balance_only') {
                  sourceName = 'Cài đặt số dư';
                }

                // Build message
                let message = `Đã khôi phục từ ${sourceName}:\n\n` +
                  `📈 Lệnh đang mở: ${result.data.positions || 0}\n` +
                  `📋 Lệnh chờ: ${result.data.pending || 0}\n` +
                  `📊 Lịch sử: ${result.data.history || 0}\n` +
                  `💰 Số dư: $${(result.data.balance || 0).toLocaleString('vi-VN')}`;

                if (result.note) {
                  message += `\n\n⚠️ ${result.note}`;
                }

                if (result.syncedToCloud) {
                  message += '\n\n☁️ Đã đồng bộ lên Cloud';
                }

                alert({
                  type: 'success',
                  title: 'Khôi Phục Thành Công!',
                  message,
                });
              } else {
                alert({
                  type: 'error',
                  title: 'Không Thể Khôi Phục',
                  message: result.error || 'Không tìm thấy dữ liệu để khôi phục.',
                });
              }
            } catch (error) {
              console.error('[Recovery] Error:', error);
              alert({ type: 'error', title: 'Lỗi', message: error.message });
            } finally {
              setDiagnosing(false);
            }
          },
        },
      ],
    });
  };

  // Force refresh from cloud
  const handleForceRefreshCloud = async () => {
    if (!user?.id) {
      alert({ type: 'error', title: 'Lỗi', message: 'Không tìm thấy user ID. Vui lòng đăng nhập lại.' });
      return;
    }

    setDiagnosing(true);
    try {
      await paperTradeService.forceRefreshFromCloud(user.id);
      await loadData();
      alert({
        type: 'success',
        title: 'Đã Đồng Bộ',
        message: 'Đã tải lại dữ liệu từ Cloud thành công.',
      });
    } catch (error) {
      console.error('[ForceRefresh] Error:', error);
      alert({ type: 'error', title: 'Lỗi', message: error.message });
    } finally {
      setDiagnosing(false);
    }
  };

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
    // Vietnamese format: dot for thousands, comma for decimals
    return sign + new Intl.NumberFormat('vi-VN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Math.abs(value));
  };

  const formatCurrencySimple = (value) => {
    if (!value && value !== 0) return '--';
    // Vietnamese format: dot for thousands, comma for decimals
    return new Intl.NumberFormat('vi-VN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  // formatPrice is now imported from utils/formatters

  const formatPercent = (value) => {
    if (!value && value !== 0) return '--';
    const sign = value >= 0 ? '+' : '';
    // Vietnamese format: comma for decimals
    return sign + value.toFixed(2).replace('.', ',') + '%';
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

  // Calculate holding time between two dates
  const calculateHoldingTime = (openedAt, closedAt) => {
    if (!openedAt) return '--';
    const opened = new Date(openedAt);
    const closed = closedAt ? new Date(closedAt) : new Date();
    const diffMs = closed - opened;

    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (hours >= 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }

    return `${hours}h ${minutes}m`;
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
            <Settings size={22} color={COLORS.textMuted} />
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
              <BarChart3 size={20} color={COLORS.textMuted} />
              <Text style={styles.statValue}>{stats.openTrades}</Text>
              <Text style={styles.statLabel}>Đang Mở</Text>
            </View>
            <View style={styles.statCard}>
              <BarChart3 size={20} color={COLORS.textMuted} />
              <Text style={styles.statValue}>{stats.totalTrades}</Text>
              <Text style={styles.statLabel}>Đã Đóng</Text>
            </View>
            <View style={styles.statCard}>
              <Target size={20} color={COLORS.textMuted} />
              <Text style={styles.statValue}>{stats.winRate.toFixed(1).replace('.', ',')}%</Text>
              <Text style={styles.statLabel}>Win Rate</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Award size={20} color={COLORS.textMuted} />
              <Text style={[styles.statValue, { color: COLORS.success }]}>{stats.wins}</Text>
              <Text style={styles.statLabel}>Thắng</Text>
            </View>
            <View style={styles.statCard}>
              <TrendingDown size={20} color={COLORS.textMuted} />
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
              <Text style={styles.balanceValue}>${initialBalance.toLocaleString('vi-VN')}</Text>
            </TouchableOpacity>
            <View style={[styles.balanceCard, styles.currentBalanceCard]}>
              <Wallet size={18} color={COLORS.textMuted} />
              <Text style={styles.balanceLabel}>Số Dư Hiện Tại</Text>
              <Text style={styles.balanceValue}>
                ${currentBalance.toLocaleString('vi-VN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Text>
            </View>
          </View>

          {/* Total PnL Card */}
          <View style={styles.pnlCard}>
            <Text style={styles.pnlLabel}>Tổng Lãi/Lỗ</Text>
            <Text
              style={[
                styles.pnlValue,
                { color: stats.totalPnl >= 0 ? COLORS.success : COLORS.error }
              ]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.6}
            >
              {formatCurrency(stats.totalPnl)} USDT
            </Text>
            <Text style={styles.pnlAvg} numberOfLines={1} adjustsFontSizeToFit>
              Trung bình: {formatCurrency(stats.avgPnl)} / lệnh
            </Text>
          </View>

          {/* Filter Tabs - Horizontal Scrollable */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterScrollView}
            contentContainerStyle={styles.filterRow}
          >
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
          </ScrollView>

          {/* Trade List */}
          {filteredTrades.length === 0 ? (
            <View style={styles.emptyState}>
              <BarChart3 size={40} color={COLORS.textMuted} />
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

                    {/* Expanded Content - COMPLETE INFO like PatternDetailScreen */}
                    {isExpanded && (
                      <View style={styles.expandedContent}>
                        {/* Trade Mode Badge */}
                        <View style={styles.tradeModeBadge}>
                          {trade.trade_mode === 'custom' ? (
                            <Brain size={14} color={COLORS.textMuted} />
                          ) : (
                            <Gem size={14} color={COLORS.textMuted} />
                          )}
                          <Text style={styles.tradeModeBadgeText}>
                            {trade.trade_mode === 'custom' ? 'Custom Mode' : 'GEM Pattern'}
                          </Text>
                        </View>

                        {/* Price Levels Section */}
                        <View style={styles.priceLevelsSection}>
                          <View style={styles.priceLevel}>
                            <Text style={styles.priceLevelLabel}>Giá vào lệnh</Text>
                            <Text style={styles.priceLevelValue}>
                              ${formatPrice(trade.entry_price)}
                            </Text>
                          </View>
                          <View style={styles.priceLevel}>
                            <Text style={styles.priceLevelLabel}>{isOpen ? 'Giá hiện tại' : 'Giá ra'}</Text>
                            <Text style={styles.priceLevelValue}>
                              ${formatPrice(isOpen ? trade.current_price : trade.exit_price)}
                            </Text>
                          </View>
                          <View style={styles.priceLevel}>
                            <Text style={[styles.priceLevelLabel, { color: COLORS.success }]}>Chốt lời</Text>
                            <Text style={[styles.priceLevelValue, { color: COLORS.success }]}>
                              ${formatPrice(trade.take_profit)}
                            </Text>
                          </View>
                          <View style={styles.priceLevel}>
                            <Text style={[styles.priceLevelLabel, { color: COLORS.error }]}>Cắt lỗ</Text>
                            <Text style={[styles.priceLevelValue, { color: COLORS.error }]}>
                              ${formatPrice(trade.stop_loss)}
                            </Text>
                          </View>
                        </View>

                        {/* Trade Info Grid - Same as PatternDetailScreen */}
                        <View style={styles.tradeInfoGrid}>
                          <View style={styles.tradeInfoItem}>
                            <Clock size={12} color={COLORS.textMuted} />
                            <Text style={styles.tradeInfoLabel}>Mở lệnh lúc</Text>
                            <Text style={styles.tradeInfoValue}>{formatDate(trade.opened_at)}</Text>
                          </View>
                          <View style={styles.tradeInfoItem}>
                            <DollarSign size={12} color={COLORS.textMuted} />
                            <Text style={styles.tradeInfoLabel}>Ký quỹ</Text>
                            <Text style={styles.tradeInfoValue}>${formatCurrencySimple(trade.margin)}</Text>
                          </View>
                          <View style={styles.tradeInfoItem}>
                            <Layers size={12} color={COLORS.textMuted} />
                            <Text style={styles.tradeInfoLabel}>Giá trị lệnh</Text>
                            <Text style={styles.tradeInfoValue}>${formatCurrencySimple(trade.position_value)}</Text>
                          </View>
                          <View style={styles.tradeInfoItem}>
                            <Target size={12} color={COLORS.textMuted} />
                            <Text style={styles.tradeInfoLabel}>Pattern</Text>
                            <Text style={styles.tradeInfoValue}>
                              {getPatternNameVI(trade.pattern_type)}
                            </Text>
                          </View>
                          <View style={styles.tradeInfoItem}>
                            <Timer size={12} color={COLORS.textMuted} />
                            <Text style={styles.tradeInfoLabel}>Khung TG</Text>
                            <Text style={styles.tradeInfoValue}>{trade.timeframe?.toUpperCase() || '4H'}</Text>
                          </View>
                          <View style={styles.tradeInfoItem}>
                            <Scale size={12} color={COLORS.textMuted} />
                            <Text style={styles.tradeInfoLabel}>Đòn bẩy</Text>
                            <Text style={styles.tradeInfoValue}>{trade.leverage}x</Text>
                          </View>
                          <View style={styles.tradeInfoItem}>
                            <Percent size={12} color={COLORS.textMuted} />
                            <Text style={styles.tradeInfoLabel}>Độ tin cậy</Text>
                            <Text style={styles.tradeInfoValue}>{trade.confidence}%</Text>
                          </View>
                          <View style={styles.tradeInfoItem}>
                            <BarChart3 size={12} color={COLORS.textMuted} />
                            <Text style={styles.tradeInfoLabel}>Tỷ lệ R:R</Text>
                            <Text style={styles.tradeInfoValue}>{trade.risk_reward}</Text>
                          </View>
                          <View style={styles.tradeInfoItem}>
                            <Award size={12} color={COLORS.textMuted} />
                            <Text style={styles.tradeInfoLabel}>Win Rate</Text>
                            <Text style={styles.tradeInfoValue}>{trade.win_rate}%</Text>
                          </View>
                        </View>

                        {/* AI Score for Custom Mode */}
                        {trade.trade_mode === 'custom' && trade.ai_score !== null && (
                          <View style={styles.aiScoreRow}>
                            <Brain size={14} color={COLORS.textMuted} />
                            <Text style={styles.aiScoreLabel}>Điểm AI đánh giá</Text>
                            <View style={[
                              styles.aiScoreBadge,
                              {
                                backgroundColor:
                                  trade.ai_score >= 80 ? COLORS.success + '30' :
                                  trade.ai_score >= 60 ? COLORS.gold + '30' :
                                  trade.ai_score >= 40 ? COLORS.warning + '30' : COLORS.error + '30'
                              }
                            ]}>
                              <Text style={[
                                styles.aiScoreValue,
                                {
                                  color:
                                    trade.ai_score >= 80 ? COLORS.success :
                                    trade.ai_score >= 60 ? COLORS.gold :
                                    trade.ai_score >= 40 ? COLORS.warning : COLORS.error
                                }
                              ]}>
                                {trade.ai_score}/100
                              </Text>
                            </View>
                          </View>
                        )}

                        {/* Result & Exit Info for closed trades */}
                        {!isOpen && (
                          <View style={styles.closedInfoSection}>
                            <View style={styles.resultRow}>
                              {trade.result === 'WIN' ? (
                                <CheckCircle size={16} color={COLORS.success} />
                              ) : (
                                <XCircle size={16} color={COLORS.error} />
                              )}
                              <Text style={[
                                styles.resultText,
                                { color: trade.result === 'WIN' ? COLORS.success : COLORS.error }
                              ]}>
                                {trade.result === 'WIN' ? 'THẮNG' : 'THUA'}
                              </Text>
                              <View style={[
                                styles.exitReasonBadge,
                                trade.exit_reason === 'LIQUIDATION' && { backgroundColor: 'rgba(220, 38, 38, 0.2)' }
                              ]}>
                                <Text style={[
                                  styles.exitReasonText,
                                  trade.exit_reason === 'LIQUIDATION' && { color: COLORS.error }
                                ]}>
                                  {trade.exit_reason === 'STOP_LOSS' ? 'Cắt lỗ (SL)' :
                                   trade.exit_reason === 'TAKE_PROFIT' ? 'Chốt lời (TP)' :
                                   trade.exit_reason === 'LIQUIDATION' ? 'Thanh lý' :
                                   trade.exit_reason === 'MANUAL' ? 'Đóng tay' : 'Đóng tay'}
                                </Text>
                              </View>
                            </View>
                            <View style={styles.holdingTimeRow}>
                              <Timer size={12} color={COLORS.textMuted} />
                              <Text style={styles.holdingTimeLabel}>Thời gian giữ:</Text>
                              <Text style={styles.holdingTimeValue}>
                                {trade.holding_time || calculateHoldingTime(trade.opened_at, trade.closed_at)}
                              </Text>
                            </View>
                            <Text style={styles.closedAtText}>
                              Đóng lúc: {formatDate(trade.closed_at)}
                            </Text>
                          </View>
                        )}

                        {/* P&L Footer */}
                        <View style={styles.tradeFooter}>
                          <View style={styles.pnlSummary}>
                            <Text style={styles.pnlSummaryLabel}>
                              {isOpen ? 'Lãi/Lỗ Chưa Chốt' : 'Lãi/Lỗ Đã Chốt'}
                            </Text>
                            <Text style={[styles.pnlSummaryValue, { color: pnlColor }]}>
                              {formatCurrency(trade.pnl)} USDT ({formatPercent(trade.pnl_percent)})
                            </Text>
                          </View>
                          {(trade.pnl || 0) >= 0 ? (
                            <TrendingUp size={20} color={COLORS.success} />
                          ) : (
                            <TrendingDown size={20} color={COLORS.error} />
                          )}
                        </View>

                        {/* View Chart Button - Navigate to PatternDetailScreen */}
                        <TouchableOpacity
                          style={styles.viewChartButton}
                          onPress={() => {
                            // Build pattern data for PatternDetailScreen
                            const patternData = {
                              symbol: trade.symbol,
                              type: trade.pattern_type,
                              patternType: trade.pattern_type,
                              timeframe: trade.timeframe,
                              direction: trade.direction,
                              entry: trade.entry_price,
                              entryPrice: trade.entry_price,
                              stopLoss: trade.stop_loss,
                              takeProfit: trade.take_profit,
                              confidence: trade.confidence,
                              riskReward: trade.risk_reward,
                              winRate: trade.win_rate,
                              // Position data for paper trade
                              positionId: trade.id,
                              margin: trade.margin,
                              positionSize: trade.position_size,
                              positionValue: trade.position_value,
                              quantity: trade.quantity,
                              leverage: trade.leverage,
                              orderType: trade.order_type || 'market',
                              order_type: trade.order_type || 'market',
                              unrealizedPnL: isOpen ? trade.pnl : undefined,
                              unrealizedPnLPercent: isOpen ? trade.pnl_percent : undefined,
                              realizedPnL: !isOpen ? trade.pnl : undefined,
                              status: trade.status,
                              tradeMode: trade.trade_mode,
                              openedAt: trade.opened_at,
                            };
                            navigation.navigate('PatternDetail', { pattern: patternData });
                          }}
                          activeOpacity={0.7}
                        >
                          <Target size={16} color={COLORS.gold} />
                          <Text style={styles.viewChartButtonText}>Xem Chi Tiết</Text>
                        </TouchableOpacity>
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
                      <Text style={styles.settingsValue}>${initialBalance.toLocaleString('vi-VN')}</Text>
                    </View>
                    <View style={styles.settingsRow}>
                      <Text style={styles.settingsLabel}>Số dư hiện tại:</Text>
                      <Text style={[styles.settingsValue, { color: COLORS.gold }]}>
                        ${currentBalance.toLocaleString('vi-VN', { minimumFractionDigits: 2 })}
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
                        Xóa tất cả lệnh, giữ nguyên vốn ban đầu (${initialBalance.toLocaleString('vi-VN')})
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
                        Reset tất cả về ${DEFAULT_INITIAL_BALANCE.toLocaleString('vi-VN')} ban đầu
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>

                {/* Data Recovery Section */}
                <View style={styles.settingsSection}>
                  <Text style={styles.settingsSectionTitle}>🔧 Khắc Phục Sự Cố</Text>

                  <TouchableOpacity
                    style={[styles.resetButton, diagnosing && styles.buttonDisabled]}
                    onPress={handleForceRefreshCloud}
                    disabled={diagnosing}
                  >
                    {diagnosing ? (
                      <ActivityIndicator size="small" color={COLORS.info} />
                    ) : (
                      <RefreshCw size={18} color={COLORS.info} />
                    )}
                    <View style={styles.resetButtonContent}>
                      <Text style={[styles.resetButtonText, { color: COLORS.info }]}>Đồng Bộ Từ Cloud</Text>
                      <Text style={styles.resetButtonDesc}>
                        Tải lại dữ liệu từ Supabase
                      </Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.resetButton, diagnosing && styles.buttonDisabled, { borderColor: 'rgba(76, 175, 80, 0.3)' }]}
                    onPress={handleAttemptRecovery}
                    disabled={diagnosing}
                  >
                    <RefreshCw size={18} color={COLORS.success} />
                    <View style={styles.resetButtonContent}>
                      <Text style={[styles.resetButtonText, { color: COLORS.success }]}>Khôi Phục Dữ Liệu</Text>
                      <Text style={styles.resetButtonDesc}>
                        Tìm và khôi phục từ tất cả nguồn (Cloud, Local, Legacy)
                      </Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.resetButton, diagnosing && styles.buttonDisabled, { borderColor: 'rgba(158, 158, 158, 0.3)' }]}
                    onPress={handleRunDiagnostic}
                    disabled={diagnosing}
                  >
                    <BarChart3 size={18} color={COLORS.textMuted} />
                    <View style={styles.resetButtonContent}>
                      <Text style={[styles.resetButtonText, { color: COLORS.textMuted }]}>Chẩn Đoán</Text>
                      <Text style={styles.resetButtonDesc}>
                        Kiểm tra dữ liệu trong các nguồn lưu trữ
                      </Text>
                    </View>
                  </TouchableOpacity>

                  {/* Show diagnostic report if available */}
                  {diagnosticReport && (
                    <View style={styles.diagnosticReport}>
                      <Text style={styles.diagnosticTitle}>Kết Quả Chẩn Đoán:</Text>
                      <Text style={styles.diagnosticText}>
                        • Cloud: {diagnosticReport.supabase?.totalTrades || 0} lệnh
                        {diagnosticReport.supabase?.error ? ` (Lỗi: ${diagnosticReport.supabase.error})` : ''}
                      </Text>
                      <Text style={styles.diagnosticText}>
                        • User Storage: {diagnosticReport.userSpecificStorage?.positions || 0} vị thế, {diagnosticReport.userSpecificStorage?.history || 0} lịch sử
                      </Text>
                      <Text style={styles.diagnosticText}>
                        • Legacy Storage: {diagnosticReport.legacyStorage?.positions || 0} vị thế, {diagnosticReport.legacyStorage?.history || 0} lịch sử
                      </Text>
                      <Text style={[styles.diagnosticText, { color: COLORS.gold, marginTop: 8 }]}>
                        💡 {diagnosticReport.recommendation}
                      </Text>
                    </View>
                  )}
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
    gap: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  statCard: {
    flex: 1,
    backgroundColor: GLASS.background,
    borderRadius: 10,
    padding: SPACING.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 4,
  },
  statLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
  },

  // Balance Row
  balanceRow: {
    flexDirection: 'row',
    gap: SPACING.xs,
    marginTop: SPACING.xs,
  },
  balanceCard: {
    flex: 1,
    backgroundColor: GLASS.background,
    borderRadius: 10,
    padding: SPACING.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  currentBalanceCard: {
    borderColor: 'rgba(255, 255, 255, 0.15)',
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
    borderRadius: 12,
    padding: SPACING.md,
    paddingHorizontal: SPACING.lg,
    marginVertical: SPACING.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  pnlLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  pnlValue: {
    fontSize: 22,
    fontWeight: '700',
    marginVertical: 4,
    width: '100%',
    textAlign: 'center',
  },
  pnlAvg: {
    fontSize: 11,
    color: COLORS.textMuted,
  },

  // Filter
  filterScrollView: {
    marginBottom: SPACING.md,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 6,
    paddingRight: SPACING.lg,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  filterButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  filterButtonText: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: COLORS.textPrimary,
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
  tradeList: {
    backgroundColor: GLASS.background,
    borderRadius: 14,
    overflow: 'hidden',
  },
  tradeCard: {
    backgroundColor: 'transparent',
    padding: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  tradeCardOpen: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  expandedContent: {
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  openBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  openBadgeText: {
    fontSize: 8,
    fontWeight: '600',
    color: COLORS.textPrimary,
    letterSpacing: 0.3,
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
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    paddingHorizontal: SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 8,
    padding: SPACING.sm,
  },
  viewChartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: SPACING.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  viewChartButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gold,
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
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#0D0B14',
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
    backgroundColor: 'rgba(20, 18, 30, 0.95)',
    borderRadius: 14,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.3)',
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
    backgroundColor: 'rgba(20, 18, 30, 0.95)',
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
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
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
    backgroundColor: 'rgba(20, 18, 30, 0.95)',
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
    backgroundColor: 'rgba(20, 18, 30, 0.95)',
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
    backgroundColor: 'rgba(255, 189, 89, 0.2)',
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

  // ═══════════════════════════════════════════════════════════
  // EXPANDED CARD STYLES - Complete info like PatternDetailScreen
  // ═══════════════════════════════════════════════════════════

  // Trade Mode Badge
  tradeModeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 6,
    marginBottom: SPACING.xs,
  },
  tradeModeBadgeText: {
    fontSize: 10,
    fontWeight: '500',
    color: COLORS.textMuted,
  },

  // Price Levels Section
  priceLevelsSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 10,
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  priceLevel: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    paddingVertical: 6,
  },
  priceLevelLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginBottom: 2,
  },
  priceLevelValue: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },

  // Trade Info Grid
  tradeInfoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: SPACING.sm,
  },
  tradeInfoItem: {
    width: '32%',
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    gap: 2,
  },
  tradeInfoLabel: {
    fontSize: 9,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  tradeInfoValue: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },

  // AI Score Row
  aiScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 8,
    marginBottom: SPACING.sm,
  },
  aiScoreLabel: {
    flex: 1,
    fontSize: 11,
    color: COLORS.textMuted,
  },
  aiScoreBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  aiScoreValue: {
    fontSize: 12,
    fontWeight: '700',
  },

  // Closed Trade Info Section
  closedInfoSection: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 10,
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  resultText: {
    fontSize: 14,
    fontWeight: '700',
  },
  exitReasonBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  exitReasonText: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  holdingTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  holdingTimeLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  holdingTimeValue: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  closedAtText: {
    fontSize: 10,
    color: COLORS.textMuted,
  },

  // P&L Summary
  pnlSummary: {
    flex: 1,
  },
  pnlSummaryLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginBottom: 2,
  },
  pnlSummaryValue: {
    fontSize: 14,
    fontWeight: '700',
  },

  // Diagnostic Report Styles
  diagnosticReport: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 10,
    padding: SPACING.md,
    marginTop: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  diagnosticTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  diagnosticText: {
    fontSize: 11,
    color: COLORS.textMuted,
    lineHeight: 18,
  },
});
