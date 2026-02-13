/**
 * GEM Mobile - Pattern Detail Screen
 * Detailed view of detected pattern with chart
 * Optimized UI with combined sections
 */

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Modal,
  TextInput,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Target,
  Shield,
  Clock,
  AlertTriangle,
  X,
  Edit3,
  Gem,
  Brain,
  DollarSign,
  Percent,
  Info,
  ChevronDown,
} from 'lucide-react-native';
import { binanceService } from '../../services/binanceService';
import { COLORS, GRADIENTS, SPACING, TYPOGRAPHY, GLASS } from '../../utils/tokens';
import { formatPrice, formatCurrency } from '../../utils/formatters';
import EnhancementStatsCard from '../../components/Trading/EnhancementStatsCard';
import { MTFAlignmentPanel } from '../../components/Trading';
import { ZoneRectangle } from '../../components/Scanner';
import TradingChart from './components/TradingChart';
import { TierUpgradeModal } from '../../components/TierUpgradePrompt';
import { useAuth } from '../../contexts/AuthContext';
import paperTradeService from '../../services/paperTradeService';
import { useAlert } from '../../components/AlertProvider';
import { tierAccessService } from '../../services/tierAccessService';
import { mtfAlignmentService } from '../../services/mtfAlignmentService';
import zoneManager from '../../services/zoneManager';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Vietnamese pattern names mapping
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

// Vietnamese pattern descriptions - CLEAR explanations
const PATTERN_DESCRIPTIONS_VI = {
  'reversal': 'Giá có thể đổi hướng từ tăng sang giảm hoặc ngược lại. Thích hợp để vào lệnh ngược xu hướng hiện tại.',
  'double_top': 'Giá chạm vùng kháng cự 2 lần và không vượt qua được. Tín hiệu bán mạnh, giá có thể giảm sâu.',
  'double_bottom': 'Giá chạm vùng hỗ trợ 2 lần và không thủng được. Tín hiệu mua mạnh, giá có thể tăng cao.',
  'head_shoulders': 'Mẫu hình có 3 đỉnh, đỉnh giữa cao nhất. Khi phá neckline sẽ giảm mạnh. Tín hiệu bán.',
  'inverse_head_shoulders': 'Mẫu hình có 3 đáy, đáy giữa thấp nhất. Khi phá neckline sẽ tăng mạnh. Tín hiệu mua.',
  'triangle': 'Giá đang nén lại, chuẩn bị breakout. Chờ xác nhận hướng breakout trước khi vào lệnh.',
  'ascending_triangle': 'Đáy nâng dần trong khi đỉnh ngang. Thường breakout lên. Tín hiệu mua khi phá kháng cự.',
  'descending_triangle': 'Đỉnh hạ dần trong khi đáy ngang. Thường breakout xuống. Tín hiệu bán khi phá hỗ trợ.',
  'symmetrical_triangle': 'Giá hội tụ về 1 điểm. Breakout có thể lên hoặc xuống. Chờ xác nhận.',
  'wedge': 'Giá di chuyển trong kênh dốc đang thu hẹp. Thường đảo chiều khi thoát khỏi wedge.',
  'rising_wedge': 'Giá tăng nhưng đang yếu dần. Tín hiệu giảm khi phá đáy wedge.',
  'falling_wedge': 'Giá giảm nhưng đang yếu dần. Tín hiệu tăng khi phá đỉnh wedge.',
  'flag': 'Nghỉ ngắn sau sóng mạnh. Giá sẽ tiếp tục theo hướng trước đó.',
  'bull_flag': 'Cờ sau sóng tăng. Tín hiệu mua khi phá cạnh trên cờ.',
  'bear_flag': 'Cờ sau sóng giảm. Tín hiệu bán khi phá cạnh dưới cờ.',
  'channel': 'Giá dao động trong kênh. Mua ở đáy kênh, bán ở đỉnh kênh.',
  'support_bounce': 'Giá đang nảy lên từ vùng hỗ trợ mạnh. Tín hiệu mua với SL dưới hỗ trợ.',
  'resistance_reject': 'Giá bị đẩy xuống từ vùng kháng cự mạnh. Tín hiệu bán với SL trên kháng cự.',
  'breakout': 'Giá vừa phá vỡ vùng quan trọng với khối lượng lớn. Theo hướng breakout.',
  'pullback': 'Giá đang hồi về sau breakout. Cơ hội vào lệnh với giá tốt hơn.',
  'continuation': 'Xu hướng hiện tại vẫn mạnh và có thể tiếp tục. Theo hướng xu hướng.',
  'default': 'Tín hiệu được phát hiện bởi thuật toán GEM Frequency. Kiểm tra các yếu tố xác nhận trước khi giao dịch.',
};

// Format number with proper decimal places (Vietnamese format: comma for decimals)
const formatNumber = (num, decimals = 2) => {
  if (!num || isNaN(num)) return '0,00';
  return num.toLocaleString('vi-VN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

const PatternDetailScreen = ({ navigation, route }) => {
  // Safe access to pattern with fallback
  const pattern = route.params?.pattern || {};
  const fromPosition = route.params?.fromPosition || false;
  const positionId = route.params?.positionId || null;

  // Guard: If no valid pattern, show error state
  const isValidPattern = pattern?.symbol && (pattern?.entry || pattern?.entryPrice);

  const [currentPrice, setCurrentPrice] = useState(pattern?.currentPrice || pattern?.entry || pattern?.entryPrice || 0);
  const [priceChange, setPriceChange] = useState(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showDescTooltip, setShowDescTooltip] = useState(false);

  // Position management states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [isClosing, setIsClosing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Tooltip state - only one tooltip open at a time (Binance style)
  const [activeTooltip, setActiveTooltip] = useState(null);

  // Zone Visualization State
  const [zoneData, setZoneData] = useState(null);
  const [mtfAlignment, setMtfAlignment] = useState(null);
  const [loadingZone, setLoadingZone] = useState(false);

  // Tooltip explanations for each field
  const TOOLTIP_TEXTS = {
    pattern: 'Loại pattern kỹ thuật được phát hiện. GEM Frequency patterns (DPU, DPD, UPU, UPD) có độ chính xác cao hơn.',
    timeframe: 'Khung thời gian của nến được phân tích. Khung lớn hơn (4H, 1D) thường ổn định hơn khung nhỏ.',
    leverage: 'Đòn bẩy nhân số vốn của bạn. 10x = lãi/lỗ x10. Đòn bẩy cao = rủi ro cao.',
    orderType: 'Market: khớp ngay tại giá hiện tại. Limit: chờ giá về mức đặt. Stop: kích hoạt khi giá chạm mức.',
    confidence: 'Độ tin cậy của tín hiệu dựa trên nhiều yếu tố kỹ thuật. Trên 70% được xem là mạnh.',
    riskReward: 'Tỷ lệ lợi nhuận/rủi ro. 1:2 nghĩa là bạn có thể lãi 2$ cho mỗi 1$ rủi ro.',
    winRate: 'Tỷ lệ thắng lịch sử của pattern này trong điều kiện tương tự.',
    margin: 'Số tiền ký quỹ ban đầu bạn đặt vào lệnh.',
    positionValue: 'Giá trị thực của lệnh = Ký quỹ × Đòn bẩy.',
    openTime: 'Thời điểm bạn mở lệnh này.',
  };

  // AutoHide header animation
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });
  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, -60],
    extrapolate: 'clamp',
  });

  // Check if this is a Custom Mode position (can be edited)
  const isCustomMode = pattern?.tradeMode === 'custom' || pattern?.trade_mode === 'custom';
  const isGemPatternMode = !isCustomMode;

  const { showAlert } = useAlert() || {};

  // Get user tier from AuthContext
  const { userTier: contextUserTier, user } = useAuth() || {};
  const userTier = contextUserTier || 'FREE';

  // Get safe area insets for proper header positioning
  const insets = useSafeAreaInsets();

  const isLong = pattern?.direction === 'LONG';
  const directionColor = isLong ? COLORS.success : COLORS.error;

  // Get price levels
  const entryPrice = pattern?.entry || pattern?.entryPrice || 0;
  const slPrice = pattern?.stopLoss || 0;
  const tpPrice = pattern?.takeProfit || pattern?.target || pattern?.targets?.[0] || pattern?.target1 || 0;

  // Subscribe to price updates (for non-position views)
  // When fromPosition=true, we use onPriceUpdate from TradingChart for perfect sync
  useEffect(() => {
    if (!pattern?.symbol) return;
    // Skip if viewing from position - will use onPriceUpdate callback from chart
    if (fromPosition) return;

    const unsubscribe = binanceService.subscribe(pattern.symbol, (data) => {
      setCurrentPrice(data.price);
      setPriceChange(data.priceChangePercent);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [pattern?.symbol, fromPosition]);

  // Callback for real-time price sync from TradingChart
  const handleChartPriceUpdate = useCallback((price) => {
    if (price && !isNaN(price)) {
      setCurrentPrice(price);
    }
  }, []);

  // Fetch zone data and MTF alignment for TIER1+
  useEffect(() => {
    const fetchZoneData = async () => {
      if (!pattern?.symbol || !tierAccessService.isZoneVisualizationEnabled()) return;

      setLoadingZone(true);
      try {
        // ✅ Get formation_time from pattern (when pattern was detected)
        // This is the CORRECT timestamp for zone positioning
        const formationTime = pattern.formation_time || pattern.formationTime ||
                              pattern.start_time || pattern.startTime ||
                              pattern.openedAt;

        console.log('[PatternDetail] Zone formation time:', {
          formation_time: pattern.formation_time,
          start_time: pattern.start_time,
          openedAt: pattern.openedAt,
          resolved: formationTime
        });

        // Create zone from pattern if it has zone boundaries
        if (pattern.zoneHigh && pattern.zoneLow) {
          setZoneData({
            ...pattern,
            high: pattern.zoneHigh,
            low: pattern.zoneLow,
            status: pattern.zoneStatus || 'FRESH',
            strength: pattern.strength || 100,
            type: pattern.direction === 'LONG' ? 'LFZ' : 'HFZ',
            // ✅ Mark as position zone if viewing from open position
            isPositionZone: fromPosition,
            // ✅ Use formation_time for correct zone positioning
            formation_time: formationTime,
            start_time: formationTime,
          });
        } else if (pattern.entry && pattern.stopLoss) {
          // Fallback: create zone from entry/SL levels
          const isLong = pattern.direction === 'LONG';
          setZoneData({
            ...pattern,
            high: isLong ? pattern.entry : pattern.stopLoss,
            low: isLong ? pattern.stopLoss : pattern.entry,
            status: 'FRESH',
            strength: pattern.confidence || 80,
            type: isLong ? 'LFZ' : 'HFZ',
            // ✅ Mark as position zone if viewing from open position
            isPositionZone: fromPosition,
            // ✅ Use formation_time for correct zone positioning
            formation_time: formationTime,
            start_time: formationTime,
          });
        }

        // Fetch MTF alignment for TIER2+
        if (tierAccessService.canUseMTFAlignment()) {
          try {
            const alignment = await mtfAlignmentService.calculateMTFAlignment(
              pattern.symbol,
              user?.id,
              userTier
            );
            setMtfAlignment(alignment);
          } catch (mtfError) {
            console.log('[PatternDetail] MTF alignment error:', mtfError.message);
          }
        }
      } catch (error) {
        console.log('[PatternDetail] Zone data error:', error.message);
      } finally {
        setLoadingZone(false);
      }
    };

    fetchZoneData();
  }, [pattern, user?.id, userTier]);

  const formatTime = (timestamp) => {
    if (!timestamp) return '--';
    return new Date(timestamp).toLocaleString('vi-VN', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get Vietnamese pattern description
  const getPatternDescriptionVI = () => {
    const patternType = (pattern?.patternType || pattern?.type || '').toLowerCase();
    return PATTERN_DESCRIPTIONS_VI[patternType] || PATTERN_DESCRIPTIONS_VI['default'];
  };

  // Get Vietnamese pattern name
  const getPatternNameVI = () => {
    const rawType = pattern?.patternType || pattern?.type || '';
    const patternType = rawType.toLowerCase();

    // Check dictionary first
    if (PATTERN_NAMES_VI[patternType]) {
      return PATTERN_NAMES_VI[patternType];
    }

    // Check if it's an abbreviation that should stay uppercase
    const upperType = rawType.toUpperCase();
    if (UPPERCASE_PATTERNS.includes(upperType)) {
      return upperType;
    }

    return null;
  };

  // Capitalize first letter (but keep abbreviations uppercase)
  const capitalizeFirst = (str) => {
    if (!str) return '';
    const upperStr = str.toUpperCase();
    if (UPPERCASE_PATTERNS.includes(upperStr)) {
      return upperStr;
    }
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  // Get display pattern name (Vietnamese + English)
  const getPatternDisplayName = () => {
    const rawType = pattern?.patternType || pattern?.type || 'Pattern';
    const englishName = capitalizeFirst(rawType);
    const viName = getPatternNameVI();
    if (viName && viName !== englishName) {
      return `${viName} (${englishName})`;
    }
    return englishName;
  };

  // ═══════════════════════════════════════════════════════════
  // POSITION MANAGEMENT HANDLERS
  // ═══════════════════════════════════════════════════════════

  const handleClosePosition = async () => {
    if (!positionId || !currentPrice) return;

    setIsClosing(true);
    try {
      await paperTradeService.closePosition(positionId, currentPrice, 'MANUAL');
      showAlert?.(
        'Đã đóng lệnh',
        `Đã đóng lệnh ${pattern?.symbol} tại giá $${formatPrice(currentPrice)}`,
        [{ text: 'OK' }],
        'success'
      );
      navigation.goBack();
    } catch (error) {
      showAlert?.('Lỗi', error.message || 'Không thể đóng lệnh', [{ text: 'OK' }], 'error');
    } finally {
      setIsClosing(false);
      setShowCloseModal(false);
    }
  };

  const handleOpenEdit = (field) => {
    if (isGemPatternMode) {
      showAlert?.(
        'Không thể chỉnh sửa',
        'Lệnh GEM Pattern Mode không thể chỉnh sửa TP/SL. Chỉ có Custom Mode mới có thể chỉnh.',
        [{ text: 'OK' }],
        'warning'
      );
      return;
    }

    setEditingField(field);
    if (field === 'tp') {
      setEditValue(formatPrice(tpPrice));
    } else if (field === 'sl') {
      setEditValue(formatPrice(slPrice));
    } else if (field === 'leverage') {
      setEditValue(String(pattern?.leverage || 10));
    }
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!positionId || !editValue) return;

    const numValue = parseFloat(editValue.replace(/,/g, ''));
    if (isNaN(numValue) || numValue <= 0) {
      showAlert?.('Lỗi', 'Giá trị không hợp lệ', [{ text: 'OK' }], 'error');
      return;
    }

    setIsUpdating(true);
    try {
      const updateData = {};
      if (editingField === 'tp') {
        updateData.takeProfit = numValue;
      } else if (editingField === 'sl') {
        updateData.stopLoss = numValue;
      } else if (editingField === 'leverage') {
        updateData.leverage = numValue;
      }

      await paperTradeService.updatePosition(positionId, updateData);

      showAlert?.(
        'Đã cập nhật',
        `${editingField === 'tp' ? 'Chốt lời' : editingField === 'sl' ? 'Cắt lỗ' : 'Đòn bẩy'} đã được cập nhật`,
        [{ text: 'OK' }],
        'success'
      );
      setShowEditModal(false);

      navigation.setParams({
        pattern: { ...pattern, [editingField === 'tp' ? 'takeProfit' : editingField === 'sl' ? 'stopLoss' : 'leverage']: numValue },
      });
    } catch (error) {
      showAlert?.('Lỗi', error.message || 'Không thể cập nhật', [{ text: 'OK' }], 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  // Calculate unrealized P&L - MEMOIZED with currentPrice dependency for real-time updates
  const pnlData = useMemo(() => {
    if (!fromPosition) return { pnl: 0, percent: 0, roe: 0, margin: 0, leverage: 10, quantity: 0 };
    if (!currentPrice || !entryPrice) return { pnl: 0, percent: 0, roe: 0, margin: 0, leverage: 10, quantity: 0 };

    const priceDiff = isLong
      ? currentPrice - entryPrice
      : entryPrice - currentPrice;

    const margin = pattern?.margin || pattern?.positionSize || 0;
    const leverage = pattern?.leverage || 10;
    const positionValue = pattern?.positionValue || (margin * leverage);
    const quantity = pattern?.quantity || (positionValue > 0 ? positionValue / entryPrice : 0);

    const pnl = priceDiff * quantity;
    const percent = entryPrice > 0 ? (priceDiff / entryPrice) * 100 : 0;
    const roe = percent * leverage;

    return { pnl, percent, roe, margin, leverage, quantity };
  }, [fromPosition, currentPrice, entryPrice, isLong, pattern?.margin, pattern?.positionSize, pattern?.leverage, pattern?.positionValue, pattern?.quantity]);

  const { pnl: unrealizedPnL, percent: unrealizedPercent, roe: unrealizedROE, margin: calculatedMargin, leverage: calculatedLeverage } = pnlData;

  // Calculate profit/loss potential
  const potentialProfit = entryPrice > 0
    ? (isLong
        ? ((tpPrice - entryPrice) / entryPrice) * 100
        : ((entryPrice - tpPrice) / entryPrice) * 100)
    : 0;

  const potentialLoss = entryPrice > 0
    ? (isLong
        ? ((entryPrice - slPrice) / entryPrice) * 100
        : ((slPrice - entryPrice) / entryPrice) * 100)
    : 0;

  // Build pattern object for TradingChart - MEMOIZED to prevent flickering
  const chartPattern = useMemo(() => ({
    entry: entryPrice,
    stopLoss: slPrice,
    takeProfit: tpPrice,
    target: tpPrice,
    direction: pattern?.direction || 'LONG',
  }), [entryPrice, slPrice, tpPrice, pattern?.direction]);

  // If pattern is invalid, show error and back button
  if (!isValidPattern) {
    return (
      <LinearGradient
        colors={GRADIENTS.background}
        locations={GRADIENTS.backgroundLocations}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.container} edges={['top']}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
              <ArrowLeft size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Chi Tiết Lệnh</Text>
            <View style={{ width: 40 }} />
          </View>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
            <AlertTriangle size={64} color={COLORS.error} />
            <Text style={{ color: COLORS.textPrimary, fontSize: 18, fontWeight: 'bold', marginTop: 16 }}>
              Pattern không hợp lệ
            </Text>
            <Text style={{ color: COLORS.textMuted, fontSize: 14, marginTop: 8, textAlign: 'center' }}>
              Không thể tải thông tin pattern. Vui lòng quay lại và thử lại.
            </Text>
            <TouchableOpacity
              style={{ marginTop: 24, backgroundColor: COLORS.purple, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 }}
              onPress={() => navigation.goBack()}
            >
              <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Quay lại</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={GRADIENTS.background}
      locations={GRADIENTS.backgroundLocations}
      style={styles.gradient}
    >
      <View style={styles.container}>
        {/* AutoHide Header - with safe area padding */}
        <Animated.View style={[
          styles.header,
          {
            paddingTop: insets.top + SPACING.sm,
            opacity: headerOpacity,
            transform: [{ translateY: headerTranslateY }],
          }
        ]}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <ArrowLeft size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>
              {pattern?.symbol?.replace('USDT', '/USDT') || 'N/A'}
            </Text>
            <Text style={styles.headerSubtitle}>
              {getPatternDisplayName()} • {pattern?.timeframe?.toUpperCase() || '4H'} • {pattern?.direction || 'LONG'}
            </Text>
          </View>
          <View style={[styles.badge, { backgroundColor: `${directionColor}20` }]}>
            {isLong ? (
              <TrendingUp size={16} color={directionColor} strokeWidth={2.5} />
            ) : (
              <TrendingDown size={16} color={directionColor} strokeWidth={2.5} />
            )}
            <Text style={[styles.badgeText, { color: directionColor }]}>
              {pattern?.direction || 'LONG'}
            </Text>
          </View>
        </Animated.View>

        <Animated.ScrollView
          style={[styles.scroll, { paddingTop: insets.top + 70 }]}
          showsVerticalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true }
          )}
          scrollEventThrottle={16}
        >
          {/* Trade Mode Badge - Only show for open positions */}
          {fromPosition && (
            <View style={styles.tradeModeBadgeContainer}>
              <View style={[
                styles.tradeModeBadge,
                { backgroundColor: 'rgba(255, 255, 255, 0.1)' }
              ]}>
                {isCustomMode ? (
                  <Brain size={16} color={COLORS.textSecondary} />
                ) : (
                  <Gem size={16} color={COLORS.textSecondary} />
                )}
                <Text style={[
                  styles.tradeModeBadgeText,
                  { color: COLORS.textPrimary }
                ]}>
                  {isCustomMode ? 'Custom Mode' : 'GEM Pattern Mode'}
                </Text>
                {isCustomMode && (
                  <Text style={styles.editableHint}>(Có thể chỉnh sửa)</Text>
                )}
              </View>
            </View>
          )}

          {/* Chart - Using Binance Futures with Zone Visualization */}
          <View style={styles.chartSection}>
            <TradingChart
              symbol={pattern?.symbol || 'BTCUSDT'}
              timeframe={pattern?.timeframe || '4h'}
              height={350}
              selectedPattern={chartPattern}
              zones={zoneData ? [zoneData] : []}
              onPriceUpdate={fromPosition ? handleChartPriceUpdate : null}
            />
          </View>

          {/* Combined Price & Levels Card */}
          <View style={styles.combinedCard}>
            {/* P&L + Current Price Row (swapped: PnL on left, Price on right) */}
            <View style={styles.priceRow}>
              {fromPosition ? (
                <>
                  {/* PnL Section - Left */}
                  <View style={styles.pnlSection}>
                    <Text style={styles.pnlLabel}>Lãi/Lỗ Chưa Chốt</Text>
                    <Text style={[
                      styles.pnlValue,
                      { color: unrealizedPnL >= 0 ? COLORS.success : COLORS.error }
                    ]}>
                      {unrealizedPnL >= 0 ? '+' : ''}${formatNumber(Math.abs(unrealizedPnL))}
                    </Text>
                    <Text style={[
                      styles.pnlPercent,
                      { color: unrealizedPnL >= 0 ? COLORS.success : COLORS.error }
                    ]}>
                      {unrealizedPercent >= 0 ? '+' : ''}{unrealizedPercent.toFixed(2).replace('.', ',')}% • ROI: {unrealizedROE >= 0 ? '+' : ''}{unrealizedROE.toFixed(2).replace('.', ',')}%
                    </Text>
                  </View>
                  {/* Current Price - Right */}
                  <View style={styles.priceSection}>
                    <Text style={styles.priceLabel}>Giá Hiện Tại</Text>
                    <Text style={styles.priceValue}>${formatPrice(currentPrice)}</Text>
                  </View>
                </>
              ) : (
                /* Only show Current Price if not from position */
                <View style={styles.priceSection}>
                  <Text style={styles.priceLabel}>Giá Hiện Tại</Text>
                  <Text style={styles.priceValue}>${formatPrice(currentPrice)}</Text>
                </View>
              )}
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Price Levels - 2x2 Grid Layout */}
            <Text style={styles.sectionTitle}>Các Mức Giá</Text>

            {/* Row 1: Entry + Take Profit */}
            <View style={styles.priceLevelsRow}>
              {/* Entry Price */}
              <View style={styles.priceLevelCard}>
                <View style={styles.priceLevelHeader}>
                  <Target size={14} color={COLORS.textSecondary} />
                  <Text style={styles.priceLevelLabel}>Giá Vào Lệnh</Text>
                </View>
                <Text style={[styles.priceLevelValue, { color: COLORS.textPrimary }]}>
                  ${formatPrice(entryPrice)}
                </Text>
              </View>

              {/* Take Profit */}
              <TouchableOpacity
                style={[styles.priceLevelCard, styles.priceLevelCardTP]}
                onPress={() => fromPosition && handleOpenEdit('tp')}
                disabled={!fromPosition}
                activeOpacity={fromPosition && isCustomMode ? 0.7 : 1}
              >
                <View style={styles.priceLevelHeader}>
                  <TrendingUp size={14} color={COLORS.success} />
                  <Text style={styles.priceLevelLabel}>Chốt Lời</Text>
                  {fromPosition && isCustomMode && (
                    <Edit3 size={10} color={COLORS.success} />
                  )}
                </View>
                <Text style={[styles.priceLevelValue, { color: COLORS.success }]}>
                  ${formatPrice(tpPrice)}
                </Text>
                <Text style={styles.priceLevelPercent}>+{potentialProfit.toFixed(2)}%</Text>
              </TouchableOpacity>
            </View>

            {/* Row 2: Stop Loss + Liquidation */}
            <View style={styles.priceLevelsRow}>
              {/* Stop Loss */}
              <TouchableOpacity
                style={[styles.priceLevelCard, styles.priceLevelCardSL]}
                onPress={() => fromPosition && handleOpenEdit('sl')}
                disabled={!fromPosition}
                activeOpacity={fromPosition && isCustomMode ? 0.7 : 1}
              >
                <View style={styles.priceLevelHeader}>
                  <Shield size={14} color={COLORS.error} />
                  <Text style={styles.priceLevelLabel}>Cắt Lỗ</Text>
                  {fromPosition && isCustomMode && (
                    <Edit3 size={10} color={COLORS.error} />
                  )}
                </View>
                <Text style={[styles.priceLevelValue, { color: COLORS.error }]}>
                  ${formatPrice(slPrice)}
                </Text>
                <Text style={[styles.priceLevelPercent, { color: COLORS.error }]}>
                  -{potentialLoss.toFixed(2)}%
                </Text>
              </TouchableOpacity>

              {/* Liquidation Price */}
              <View style={[styles.priceLevelCard, styles.priceLevelCardLiq]}>
                <View style={styles.priceLevelHeader}>
                  <AlertTriangle size={14} color={COLORS.error} />
                  <Text style={styles.priceLevelLabel}>Thanh Lý</Text>
                </View>
                <Text style={[styles.priceLevelValue, { color: COLORS.textPrimary }]}>
                  ${formatPrice((() => {
                    // Binance Futures Liquidation Price Calculation
                    // LONG: Liq = Entry × (1 - IMR + MMR) → BELOW entry
                    // SHORT: Liq = Entry × (1 + IMR - MMR) → ABOVE entry
                    // MMR (Maintenance Margin Rate) ≈ 0.4% for most pairs
                    const leverage = pattern?.leverage || 10;
                    const mmr = 0.004; // 0.4% maintenance margin
                    const imr = 1 / leverage; // initial margin rate
                    const direction = (pattern?.direction || 'LONG').toUpperCase();

                    if (direction === 'LONG') {
                      return entryPrice * (1 - imr + mmr);
                    } else {
                      // SHORT: liquidation is ABOVE entry
                      return entryPrice * (1 + imr - mmr);
                    }
                  })())}
                </Text>
                <Text style={[styles.priceLevelPercent, { color: COLORS.textSecondary }]}>
                  {(() => {
                    const lev = pattern?.leverage || 10;
                    const pct = ((1 / lev) * 100 - 0.4).toFixed(1);
                    const dir = (pattern?.direction || 'LONG').toUpperCase();
                    // LONG: liquidation below entry (-%)
                    // SHORT: liquidation above entry (+%)
                    return dir === 'LONG' ? `-${pct}%` : `+${pct}%`;
                  })()}
                </Text>
              </View>
            </View>

            {/* Close Position Button - Inside Card for open positions */}
            {fromPosition && (
              <>
                <View style={styles.divider} />
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setShowCloseModal(true)}
                  activeOpacity={0.8}
                >
                  <X size={12} color="#FFF" />
                  <Text style={styles.closeButtonText}>Đóng Lệnh</Text>
                </TouchableOpacity>
                {isCustomMode ? (
                  <Text style={styles.editHintText}>
                    Bấm vào Chốt Lời hoặc Cắt Lỗ để chỉnh sửa
                  </Text>
                ) : (
                  <View style={styles.lockedModeHint}>
                    <Gem size={12} color={COLORS.textSecondary} />
                    <Text style={styles.lockedModeText}>
                      GEM Pattern - TP/SL đã được tối ưu
                    </Text>
                  </View>
                )}
              </>
            )}
          </View>

          {/* Trade Info Card - Combined with Stats */}
          {/* Tap anywhere overlay to dismiss tooltips */}
          {activeTooltip && (
            <TouchableOpacity
              style={styles.tooltipDismissOverlay}
              activeOpacity={1}
              onPress={() => setActiveTooltip(null)}
            />
          )}

          <View style={styles.tradeInfoCard}>
            <Text style={styles.sectionTitle}>Thông Tin Lệnh</Text>

            <View style={styles.tradeInfoGrid}>
              {fromPosition && (
                <>
                  <TouchableOpacity
                    style={styles.tradeInfoItem}
                    onPress={() => setActiveTooltip(activeTooltip === 'openTime' ? null : 'openTime')}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.tradeInfoLabelDotted}>Mở lệnh lúc</Text>
                    <Text style={styles.tradeInfoValue}>
                      {formatTime(pattern?.openedAt)}
                    </Text>
                    {activeTooltip === 'openTime' && (
                      <View style={styles.tooltipBubbleLeft}>
                        <Text style={styles.tooltipText}>{TOOLTIP_TEXTS.openTime}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.tradeInfoItem}
                    onPress={() => setActiveTooltip(activeTooltip === 'margin' ? null : 'margin')}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.tradeInfoLabelDotted}>Ký quỹ</Text>
                    <Text style={styles.tradeInfoValue}>
                      ${formatNumber(pattern?.margin || pattern?.positionSize || 0)}
                    </Text>
                    {activeTooltip === 'margin' && (
                      <View style={styles.tooltipBubble}>
                        <Text style={styles.tooltipText}>{TOOLTIP_TEXTS.margin}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.tradeInfoItem}
                    onPress={() => setActiveTooltip(activeTooltip === 'positionValue' ? null : 'positionValue')}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.tradeInfoLabelDotted}>Giá trị lệnh</Text>
                    <Text style={styles.tradeInfoValue}>
                      ${formatNumber(pattern?.positionValue || (pattern?.margin || 0) * (pattern?.leverage || 10))}
                    </Text>
                    {activeTooltip === 'positionValue' && (
                      <View style={styles.tooltipBubbleRight}>
                        <Text style={styles.tooltipText}>{TOOLTIP_TEXTS.positionValue}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </>
              )}
              <TouchableOpacity
                style={styles.tradeInfoItem}
                onPress={() => setActiveTooltip(activeTooltip === 'pattern' ? null : 'pattern')}
                activeOpacity={0.7}
              >
                <Text style={styles.tradeInfoLabelDotted}>Pattern</Text>
                <Text style={styles.tradeInfoValue}>
                  {getPatternNameVI() || capitalizeFirst(pattern?.patternType || pattern?.type || 'N/A')}
                </Text>
                {activeTooltip === 'pattern' && (
                  <View style={styles.tooltipBubbleLeft}>
                    <Text style={styles.tooltipText}>{TOOLTIP_TEXTS.pattern}</Text>
                  </View>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.tradeInfoItem}
                onPress={() => setActiveTooltip(activeTooltip === 'timeframe' ? null : 'timeframe')}
                activeOpacity={0.7}
              >
                <Text style={styles.tradeInfoLabelDotted}>Khung TG</Text>
                <Text style={styles.tradeInfoValue}>
                  {pattern?.timeframe?.toUpperCase() || '4H'}
                </Text>
                {activeTooltip === 'timeframe' && (
                  <View style={styles.tooltipBubble}>
                    <Text style={styles.tooltipText}>{TOOLTIP_TEXTS.timeframe}</Text>
                  </View>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.tradeInfoItem}
                onPress={() => setActiveTooltip(activeTooltip === 'leverage' ? null : 'leverage')}
                activeOpacity={0.7}
              >
                <Text style={styles.tradeInfoLabelDotted}>Đòn bẩy</Text>
                <Text style={styles.tradeInfoValue}>
                  {pattern?.leverage || 10}x
                </Text>
                {activeTooltip === 'leverage' && (
                  <View style={styles.tooltipBubbleRight}>
                    <Text style={styles.tooltipText}>{TOOLTIP_TEXTS.leverage}</Text>
                  </View>
                )}
              </TouchableOpacity>
              {/* V2 Features: Order Type */}
              <TouchableOpacity
                style={styles.tradeInfoItem}
                onPress={() => setActiveTooltip(activeTooltip === 'orderType' ? null : 'orderType')}
                activeOpacity={0.7}
              >
                <Text style={styles.tradeInfoLabelDotted}>Loại lệnh</Text>
                <Text style={styles.tradeInfoValue}>
                  {pattern?.order_type === 'limit' || pattern?.order_type === 'LIMIT' ? 'Limit' :
                   pattern?.order_type === 'market' || pattern?.order_type === 'MARKET' ? 'Market' :
                   pattern?.order_type === 'stop_limit' ? 'Stop Limit' :
                   pattern?.order_type === 'stop_market' ? 'Stop Market' :
                   pattern?.orderType === 'limit' || pattern?.orderType === 'LIMIT' ? 'Limit' :
                   pattern?.orderType === 'market' || pattern?.orderType === 'MARKET' ? 'Market' :
                   pattern?.orderType === 'stop_limit' ? 'Stop Limit' :
                   pattern?.orderType === 'stop_market' ? 'Stop Market' :
                   'Market'}
                </Text>
                {activeTooltip === 'orderType' && (
                  <View style={styles.tooltipBubbleLeft}>
                    <Text style={styles.tooltipText}>{TOOLTIP_TEXTS.orderType}</Text>
                  </View>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.tradeInfoItem}
                onPress={() => setActiveTooltip(activeTooltip === 'confidence' ? null : 'confidence')}
                activeOpacity={0.7}
              >
                <Text style={styles.tradeInfoLabelDotted}>Độ tin cậy</Text>
                <Text style={styles.tradeInfoValue}>
                  {Math.round(pattern?.confidence || 75)}%
                </Text>
                {activeTooltip === 'confidence' && (
                  <View style={styles.tooltipBubble}>
                    <Text style={styles.tooltipText}>{TOOLTIP_TEXTS.confidence}</Text>
                  </View>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.tradeInfoItem}
                onPress={() => setActiveTooltip(activeTooltip === 'riskReward' ? null : 'riskReward')}
                activeOpacity={0.7}
              >
                <Text style={styles.tradeInfoLabelDotted}>Tỷ lệ R:R</Text>
                <Text style={styles.tradeInfoValue}>
                  {(() => {
                    const rr = pattern?.riskReward || pattern?.risk_reward;
                    // If already in "1:X" format, return as-is with comma decimal
                    if (typeof rr === 'string' && rr.includes(':')) {
                      return rr.replace('.', ',');
                    }
                    // If number, format as "1:X"
                    if (typeof rr === 'number') {
                      return `1:${rr.toFixed(1).replace('.', ',')}`;
                    }
                    // Default
                    return '1:2,0';
                  })()}
                </Text>
                {activeTooltip === 'riskReward' && (
                  <View style={styles.tooltipBubbleRight}>
                    <Text style={styles.tooltipText}>{TOOLTIP_TEXTS.riskReward}</Text>
                  </View>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.tradeInfoItem}
                onPress={() => setActiveTooltip(activeTooltip === 'winRate' ? null : 'winRate')}
                activeOpacity={0.7}
              >
                <Text style={styles.tradeInfoLabelDotted}>Win Rate</Text>
                <Text style={styles.tradeInfoValue}>
                  {Math.round(pattern?.winRate || 65)}%
                </Text>
                {activeTooltip === 'winRate' && (
                  <View style={styles.tooltipBubbleLeft}>
                    <Text style={styles.tooltipText}>{TOOLTIP_TEXTS.winRate}</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* AI Score for Custom Mode */}
            {isCustomMode && pattern?.aiScore !== undefined && (
              <View style={styles.aiScoreRow}>
                <Text style={styles.tradeInfoLabel}>Điểm AI đánh giá</Text>
                <View style={[
                  styles.aiScoreBadge,
                  { backgroundColor: pattern.aiScore >= 80 ? COLORS.success + '30' :
                    pattern.aiScore >= 60 ? COLORS.gold + '30' :
                    pattern.aiScore >= 40 ? COLORS.warning + '30' : COLORS.error + '30' }
                ]}>
                  <Text style={[
                    styles.aiScoreText,
                    { color: pattern.aiScore >= 80 ? COLORS.success :
                      pattern.aiScore >= 60 ? COLORS.gold :
                      pattern.aiScore >= 40 ? COLORS.warning : COLORS.error }
                  ]}>
                    {pattern.aiScore}/100
                  </Text>
                </View>
              </View>
            )}

            {/* Pattern Description with Inline Tooltip */}
            <View style={styles.descriptionSection}>
              <View style={styles.descriptionHeader}>
                <Text style={styles.descLabel}>Mô tả Pattern</Text>
                <TouchableOpacity onPress={() => setShowDescTooltip(!showDescTooltip)}>
                  <Info size={14} color={showDescTooltip ? COLORS.gold : COLORS.textMuted} />
                </TouchableOpacity>
              </View>
              <Text style={styles.descriptionText}>
                {getPatternDescriptionVI()}
              </Text>
              {/* Inline Tooltip - tap anywhere to dismiss */}
              {showDescTooltip && (
                <TouchableOpacity
                  style={styles.inlineTooltip}
                  activeOpacity={1}
                  onPress={() => setShowDescTooltip(false)}
                >
                  <Text style={styles.inlineTooltipText}>
                    Mô tả pattern giải thích tín hiệu kỹ thuật. Đây là dự đoán dựa trên phân tích lịch sử và không đảm bảo kết quả.
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Detection Time - Only show when NOT from position */}
            {!fromPosition && (
              <View style={styles.timeInfo}>
                <Clock size={12} color={COLORS.textMuted} />
                <Text style={styles.timeText}>
                  Phát hiện: {formatTime(pattern?.detectedAt || pattern?.openedAt)}
                </Text>
              </View>
            )}
          </View>

          {/* Enhancement Stats Card - ADMIN Only */}
          <View style={styles.enhancementSection}>
            <EnhancementStatsCard
              pattern={pattern}
              userTier={userTier}
              onUpgradePress={() => setShowUpgradeModal(true)}
              expanded={true}
            />
          </View>

          {/* Zone Visualization Section - TIER1+ */}
          {zoneData && tierAccessService.isZoneVisualizationEnabled() && (
            <View style={styles.zoneSection}>
              <Text style={styles.zoneSectionTitle}>Zone Visualization</Text>
              <ZoneRectangle
                zone={zoneData}
                showLabel
                onPress={() => {
                  // Could show zone detail modal
                }}
              />
            </View>
          )}

          {/* MTF Alignment Panel - TIER2+ */}
          {mtfAlignment && tierAccessService.canUseMTFAlignment() && (
            <View style={styles.mtfSection}>
              <MTFAlignmentPanel
                symbol={pattern?.symbol}
                alignment={mtfAlignment}
                onRefresh={async () => {
                  try {
                    const newAlignment = await mtfAlignmentService.calculateMTFAlignment(
                      pattern.symbol,
                      user?.id,
                      userTier
                    );
                    setMtfAlignment(newAlignment);
                  } catch (error) {
                    console.log('[PatternDetail] MTF refresh error:', error.message);
                  }
                }}
              />
            </View>
          )}

          {/* Warning */}
          <View style={styles.warningCard}>
            <AlertTriangle size={16} color={COLORS.textMuted} />
            <Text style={styles.warningText}>
              Đây không phải lời khuyên tài chính. Hãy tự nghiên cứu và quản lý rủi ro phù hợp.
            </Text>
          </View>

          {/* Bottom spacing - increased for better scroll */}
          <View style={{ height: 300 }} />
        </Animated.ScrollView>

        {/* Close Position Confirmation Modal */}
        <Modal
          visible={showCloseModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowCloseModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Đóng Lệnh?</Text>
              <Text style={styles.modalDesc}>
                Bạn có chắc muốn đóng lệnh {pattern?.symbol} {pattern?.direction}?
              </Text>
              <View style={styles.modalPnLPreview}>
                <Text style={styles.modalPnLLabel}>P&L dự kiến:</Text>
                <Text style={[
                  styles.modalPnLValue,
                  { color: unrealizedPnL >= 0 ? COLORS.success : COLORS.error }
                ]}>
                  {unrealizedPnL >= 0 ? '+' : ''}${formatNumber(Math.abs(unrealizedPnL))}
                </Text>
              </View>
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.modalCancelButton}
                  onPress={() => setShowCloseModal(false)}
                >
                  <Text style={styles.modalCancelText}>Hủy</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.modalConfirmButton,
                    { backgroundColor: unrealizedPnL >= 0 ? COLORS.success : COLORS.error }
                  ]}
                  onPress={handleClosePosition}
                  disabled={isClosing}
                >
                  {isClosing ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <Text style={styles.modalConfirmText}>Xác nhận</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Edit TP/SL Modal */}
        <Modal
          visible={showEditModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowEditModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                Chỉnh sửa {editingField === 'tp' ? 'Chốt Lời' : editingField === 'sl' ? 'Cắt Lỗ' : 'Đòn Bẩy'}
              </Text>
              <View style={styles.editInputContainer}>
                <Text style={styles.editInputPrefix}>$</Text>
                <TextInput
                  style={styles.editInput}
                  value={editValue}
                  onChangeText={setEditValue}
                  keyboardType="decimal-pad"
                  placeholder="0.00"
                  placeholderTextColor={COLORS.textMuted}
                />
              </View>
              <Text style={styles.editCurrentLabel}>
                Giá hiện tại: ${formatPrice(currentPrice)}
              </Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.modalCancelButton}
                  onPress={() => setShowEditModal(false)}
                >
                  <Text style={styles.modalCancelText}>Hủy</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalConfirmButton, { backgroundColor: COLORS.gold }]}
                  onPress={handleSaveEdit}
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <ActivityIndicator size="small" color="#000" />
                  ) : (
                    <Text style={[styles.modalConfirmText, { color: '#000' }]}>Lưu</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Tier Upgrade Modal */}
        <TierUpgradeModal
          visible={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          userTier={userTier}
          onUpgrade={(targetTier) => {
            setShowUpgradeModal(false);
            navigation.navigate('Shop');
          }}
        />
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: GLASS.background,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(106, 91, 255, 0.2)',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  headerSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  scroll: {
    flex: 1,
  },
  chartSection: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },

  // Combined Card Styles
  combinedCard: {
    backgroundColor: GLASS.background,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
    padding: SPACING.md,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.3)',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priceSection: {
    flex: 1,
    alignItems: 'flex-end',
  },
  pnlSection: {
    flex: 1,
    alignItems: 'flex-start',
  },
  priceLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
  },
  priceValue: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  pnlLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
  },
  pnlValue: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    marginTop: 2,
  },
  pnlPercent: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: SPACING.sm,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  levelItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  levelLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  levelLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  },
  levelRight: {
    alignItems: 'flex-end',
  },
  levelValue: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  profitText: {
    fontSize: TYPOGRAPHY.fontSize.xxs || 10,
    color: COLORS.success,
  },
  lossText: {
    fontSize: TYPOGRAPHY.fontSize.xxs || 10,
    color: COLORS.error,
  },
  // ═══════════════════════════════════════════════════════════
  // NEW Price Levels Grid Styles - 2x2 COMPACT layout
  // ═══════════════════════════════════════════════════════════
  priceLevelsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 6,
  },
  priceLevelCard: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
  },
  priceLevelCardTP: {
    borderColor: 'rgba(58, 247, 166, 0.3)',
    backgroundColor: 'rgba(58, 247, 166, 0.05)',
  },
  priceLevelCardSL: {
    borderColor: 'rgba(255, 107, 107, 0.3)',
    backgroundColor: 'rgba(255, 107, 107, 0.05)',
  },
  priceLevelCardLiq: {
    borderColor: 'rgba(255, 107, 107, 0.3)',
    backgroundColor: 'rgba(255, 107, 107, 0.05)',
  },
  priceLevelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginBottom: 2,
  },
  priceLevelLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    flex: 1,
  },
  priceLevelValue: {
    fontSize: 13,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  priceLevelPercent: {
    fontSize: 9,
    color: COLORS.success,
    marginTop: 1,
  },
  closeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.error,
    paddingVertical: 6,
    paddingHorizontal: SPACING.md,
    borderRadius: 6,
    gap: 4,
    marginTop: SPACING.xs,
    alignSelf: 'center',
  },
  closeButtonText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: '#FFF',
  },
  editHintText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  lockedModeHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: SPACING.xs,
  },
  lockedModeText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textSecondary,
  },

  // Trade Info Card
  tradeInfoCard: {
    backgroundColor: GLASS.background,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
    padding: SPACING.md,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.3)',
  },
  tradeInfoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    overflow: 'visible',
    zIndex: 1,
  },
  tradeInfoItem: {
    width: '32%',
    backgroundColor: 'rgba(15, 16, 48, 0.5)',
    padding: SPACING.xs,
    borderRadius: 6,
    overflow: 'visible',
    zIndex: 10,
    position: 'relative',
  },
  tradeInfoLabel: {
    fontSize: TYPOGRAPHY.fontSize.xxs || 10,
    color: COLORS.textMuted,
    marginBottom: 2,
  },
  tradeInfoLabelDotted: {
    fontSize: TYPOGRAPHY.fontSize.xxs || 10,
    color: COLORS.textMuted,
    marginBottom: 2,
    textDecorationLine: 'underline',
    textDecorationStyle: 'dotted',
  },
  tradeInfoValue: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  // Binance-style tooltip
  tooltipDismissOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
  // Base tooltip style - for MIDDLE column items (centered)
  tooltipBubble: {
    position: 'absolute',
    bottom: '100%', // Appear ABOVE the item
    left: '50%',
    marginLeft: -100, // Half of width to center (200/2)
    marginBottom: 6,
    backgroundColor: 'rgba(26, 27, 61, 0.98)',
    borderRadius: 8,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(139, 125, 255, 0.4)',
    zIndex: 99999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 50,
    width: 200,
  },
  // LEFT column items - tooltip extends to the right
  tooltipBubbleLeft: {
    position: 'absolute',
    bottom: '100%',
    left: 0, // Align with left edge of item
    marginBottom: 6,
    backgroundColor: 'rgba(26, 27, 61, 0.98)',
    borderRadius: 8,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(139, 125, 255, 0.4)',
    zIndex: 99999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 50,
    width: 200,
  },
  // RIGHT column items - tooltip extends to the left
  tooltipBubbleRight: {
    position: 'absolute',
    bottom: '100%',
    right: 0, // Align with right edge of item
    marginBottom: 6,
    backgroundColor: 'rgba(26, 27, 61, 0.98)',
    borderRadius: 8,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(139, 125, 255, 0.4)',
    zIndex: 99999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 50,
    width: 200,
  },
  tooltipText: {
    fontSize: 12,
    color: COLORS.textPrimary, // Match app text color
    lineHeight: 18,
    fontWeight: '400',
  },
  aiScoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.sm,
    paddingTop: SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  aiScoreBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: 6,
  },
  aiScoreText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  descriptionSection: {
    marginTop: SPACING.sm,
    paddingTop: SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  descriptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  descLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
  },
  descriptionText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  inlineTooltip: {
    marginTop: SPACING.xs,
    padding: SPACING.sm,
    backgroundColor: 'rgba(255, 189, 89, 0.15)',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.gold,
  },
  inlineTooltipText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.gold,
    lineHeight: 16,
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: SPACING.sm,
  },
  timeText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
  },

  // Trade Mode Badge
  tradeModeBadgeContainer: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  tradeModeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    borderRadius: 8,
    gap: 6,
  },
  tradeModeBadgeText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  editableHint: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    marginLeft: 4,
  },

  // Enhancement Section
  enhancementSection: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },

  // Zone Visualization Section
  zoneSection: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  zoneSectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },

  // MTF Alignment Section
  mtfSection: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },

  // Warning Card
  warningCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.xs,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
    padding: SPACING.sm,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  warningText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    lineHeight: 16,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modalContent: {
    backgroundColor: COLORS.glassBg || '#1A1A2E',
    borderRadius: 16,
    padding: SPACING.lg,
    width: '100%',
    maxWidth: 320,
    borderWidth: 1,
    borderColor: COLORS.gold + '30',
  },
  modalTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  modalDesc: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  modalPnLPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: GLASS.background,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 10,
    marginBottom: SPACING.md,
  },
  modalPnLLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
  modalPnLValue: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
    backgroundColor: GLASS.background,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textSecondary,
  },
  modalConfirmButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalConfirmText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: '#FFF',
  },

  // Edit Input Styles
  editInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GLASS.background,
    borderRadius: 10,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  editInputPrefix: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gold,
    marginRight: 8,
  },
  editInput: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    paddingVertical: SPACING.sm,
  },
  editCurrentLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },

});

export default PatternDetailScreen;
