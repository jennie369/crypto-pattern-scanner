/**
 * GEM Scanner - Paper Trade Modal V2
 * Enhanced Binance Futures-style trading interface
 * Supports 4 order types, margin modes, leverage slider, TP/SL
 */

import React, { useState, useCallback, useEffect, memo, useMemo, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  X,
  TrendingUp,
  TrendingDown,
  Check,
  ShieldAlert,
  AlertCircle,
  DollarSign,
  Zap,
} from 'lucide-react-native';

// Components
import OrderTypeSelector from './OrderTypeSelector';
import MarginLeverageBar from './MarginLeverageBar';
import PriceInput from './PriceInput';
import QuantitySlider from './QuantitySlider';
import TPSLSection from './TPSLSection';
import OrderCalculations from './OrderCalculations';
import OnboardingModal from './OnboardingModal';
import ModeTabSelector from './ModeTabSelector';
import ModeBanner from './ModeBanner';
import AIAssessmentSection from './AIAssessmentSection';
import CustomAlert, { useCustomAlert } from '../CustomAlert';

// Services & Constants
import {
  ORDER_TYPES,
  DIRECTIONS,
  MARGIN_MODES,
  LEVERAGE_CONFIG,
} from '../../constants/tradingConstants';
import { getOrderTypeConfig, getInitialOrderState } from '../../constants/orderTypeConfigs';
import {
  calculateOrderDetails,
  calculateLiquidationPrice,
  calculateQuantityFromPercent,
  formatUSDT,
} from '../../services/tradingCalculations';
import { checkShouldShow, markCompleted, markSkipped } from '../../services/onboardingService';
import paperTradeService from '../../services/paperTradeService';
import { createPendingOrder } from '../../services/pendingOrderService';
import { useAuth } from '../../contexts/AuthContext';
import { COLORS, SPACING } from '../../utils/tokens';

// Error Boundary
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={errorStyles.container}>
          <ShieldAlert size={48} color={COLORS.error} />
          <Text style={errorStyles.title}>Đã xảy ra lỗi</Text>
          <Text style={errorStyles.message}>
            {this.state.error?.message || 'Không thể hiển thị Paper Trade'}
          </Text>
          <TouchableOpacity
            style={errorStyles.button}
            onPress={() => this.setState({ hasError: false })}
          >
            <Text style={errorStyles.buttonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

const errorStyles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: COLORS.bgDarkest },
  title: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary, marginTop: 16 },
  message: { fontSize: 14, color: COLORS.textMuted, marginTop: 8, textAlign: 'center' },
  button: { marginTop: 24, backgroundColor: COLORS.gold, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  buttonText: { color: '#000', fontWeight: '700' },
});

// Main Component
const PaperTradeModalV2 = ({
  visible = false,
  onClose,
  pattern = null,  // Pattern data for Pattern mode
  symbol = 'BTCUSDT',
  baseAsset = 'BTC',
  currentPrice = 0,
  onSubmit,
}) => {
  const { user, profile, userTier, isAdmin } = useAuth();
  const { alert, AlertComponent } = useCustomAlert();

  // Core state
  const [loading, setLoading] = useState(false);
  const loadingRef = useRef(false); // Ref to avoid stale closure in alert callbacks
  const [balance, setBalance] = useState(10000);  // Paper trade balance
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [expandedCalculations, setExpandedCalculations] = useState(false);

  // Dual Mode state - Pattern mode or Custom mode
  const [tradeMode, setTradeMode] = useState(pattern ? 'pattern' : 'custom');
  const [customModeLimit, setCustomModeLimit] = useState(null);

  // Order state
  const [orderType, setOrderType] = useState('limit');
  const [direction, setDirection] = useState('LONG');
  // Cross/Isolated removed - always use 'isolated' (safer for paper trading, Cross margin not implemented)
  const marginMode = 'isolated';
  const [leverage, setLeverage] = useState(20);

  // Price state
  const [price, setPrice] = useState('');
  const [stopPrice, setStopPrice] = useState('');
  const [triggerType, setTriggerType] = useState('mark_price');

  // Quantity state
  const [quantity, setQuantity] = useState(0);
  const [quantityPercent, setQuantityPercent] = useState(10);
  const [quantityUnit, setQuantityUnit] = useState('usdt');

  // TP/SL state
  const [tpEnabled, setTPEnabled] = useState(false);
  const [tpPrice, setTPPrice] = useState(null);
  const [tpTriggerType, setTPTriggerType] = useState('mark_price');
  const [slEnabled, setSLEnabled] = useState(false);
  const [slPrice, setSLPrice] = useState(null);
  const [slTriggerType, setSLTriggerType] = useState('mark_price');

  // AI Assessment state (for Custom mode)
  const [aiAssessment, setAIAssessment] = useState(null);

  // Animated scroll for smooth header hide/show
  const scrollY = useRef(new Animated.Value(0)).current;
  const lastScrollY = useRef(0);
  const headerVisible = useRef(true);
  const headerOpacity = useRef(new Animated.Value(1)).current;
  const headerTranslateY = useRef(new Animated.Value(0)).current;

  // Handle scroll with animation
  const handleScroll = useCallback((event) => {
    const currentY = event.nativeEvent.contentOffset.y;
    const diff = currentY - lastScrollY.current;

    // Scroll down > 30px and header is visible -> hide
    if (diff > 5 && currentY > 30 && headerVisible.current) {
      headerVisible.current = false;
      Animated.parallel([
        Animated.timing(headerOpacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(headerTranslateY, {
          toValue: -150,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
    // Scroll up or near top -> show
    else if ((diff < -5 || currentY < 20) && !headerVisible.current) {
      headerVisible.current = true;
      Animated.parallel([
        Animated.timing(headerOpacity, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(headerTranslateY, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }

    lastScrollY.current = currentY;
  }, [headerOpacity, headerTranslateY]);

  // Get order type config
  const orderConfig = useMemo(() => getOrderTypeConfig(orderType), [orderType]);

  // Sync loadingRef with loading state to avoid stale closure in callbacks
  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);

  // Initialize on open
  useEffect(() => {
    if (visible) {
      initializeModal();
    }
  }, [visible]);

  const initializeModal = async () => {
    // Load balance with CLOUD SYNC - ensure service is initialized first
    try {
      await paperTradeService.init(user?.id);
      const paperBalance = paperTradeService.getBalance();
      setBalance(paperBalance || 10000);
    } catch (error) {
      console.warn('[PaperTradeV2] Failed to load balance:', error);
      setBalance(10000);
    }

    // Load custom mode limit for FREE users
    // Pass profile data which contains role, scanner_tier, is_admin, etc.
    try {
      const userWithProfile = {
        id: user?.id,
        ...profile, // role, scanner_tier, karma_level, is_admin, chatbot_tier
      };
      const limit = await paperTradeService.checkCustomModeLimit?.(userWithProfile);
      setCustomModeLimit(limit);
    } catch (error) {
      console.warn('[PaperTradeV2] Failed to load custom mode limit:', error);
      setCustomModeLimit(null); // null = unlimited
    }

    // Set initial price
    if (currentPrice > 0) {
      setPrice(currentPrice.toString());
    }

    // Initialize mode based on pattern
    if (pattern) {
      setTradeMode('pattern');
      initializeFromPattern();
    } else {
      setTradeMode('custom');
    }

    // Check onboarding
    const shouldShow = await checkShouldShow(user?.id);
    if (shouldShow) {
      setTimeout(() => setShowOnboarding(true), 500);
    }
  };

  // Initialize fields from pattern (for Pattern mode)
  const initializeFromPattern = () => {
    if (!pattern) return;

    // Set direction from pattern
    const patternDir = pattern.direction?.toUpperCase?.() ||
      (pattern.direction === 'bullish' ? 'LONG' : 'SHORT');
    setDirection(patternDir === 'LONG' || patternDir === 'BULLISH' ? 'LONG' : 'SHORT');

    // Set entry price
    if (pattern.entry) {
      setPrice(pattern.entry.toString());
    }

    // Set SL
    if (pattern.stopLoss) {
      setSLEnabled(true);
      setSLPrice(pattern.stopLoss);
    }

    // Set TP
    const tp = pattern.takeProfit1 || pattern.takeProfit || pattern.target || pattern.targets?.[0];
    if (tp) {
      setTPEnabled(true);
      setTPPrice(tp);
    }
  };

  // Handle mode change
  const handleModeChange = (newMode) => {
    if (newMode === 'custom_limit_exceeded') {
      // Show upgrade prompt
      alert({
        type: 'warning',
        title: 'Hết lượt Custom Mode',
        message: 'Bạn đã sử dụng hết lượt Custom Mode hôm nay. Nâng cấp lên TIER1+ để không giới hạn.',
        buttons: [
          { text: 'Để sau', style: 'cancel' },
          { text: 'Nâng cấp', onPress: () => { /* TODO: navigate to upgrade */ } },
        ],
      });
      return;
    }

    setTradeMode(newMode);

    // If switching to pattern mode, reinitialize from pattern
    if (newMode === 'pattern' && pattern) {
      initializeFromPattern();
      // Smart order type will be determined at submit time based on current price vs pattern.entry
    }
  };

  // Check if fields should be locked (Pattern mode locks Entry, Direction, TP, SL)
  const isPatternMode = tradeMode === 'pattern';
  const isFieldLocked = Boolean(isPatternMode && pattern);

  // Calculate entry price for order
  const entryPrice = useMemo(() => {
    if (orderType === 'market') {
      return currentPrice;
    }
    return parseFloat(price) || currentPrice;
  }, [orderType, price, currentPrice]);

  // Calculate liquidation price
  const liquidationPrice = useMemo(() => {
    if (!entryPrice || !leverage) return null;
    return calculateLiquidationPrice(entryPrice, leverage, direction);
  }, [entryPrice, leverage, direction]);

  // Calculate TP/SL percentages
  const tpPercent = useMemo(() => {
    if (!tpPrice || !entryPrice) return null;
    const diff = direction === 'LONG'
      ? ((tpPrice - entryPrice) / entryPrice) * 100
      : ((entryPrice - tpPrice) / entryPrice) * 100;
    return diff > 0 ? diff : null;
  }, [tpPrice, entryPrice, direction]);

  const slPercent = useMemo(() => {
    if (!slPrice || !entryPrice) return null;
    const diff = direction === 'LONG'
      ? ((entryPrice - slPrice) / entryPrice) * 100
      : ((slPrice - entryPrice) / entryPrice) * 100;
    return diff > 0 ? diff : null;
  }, [slPrice, entryPrice, direction]);

  // Quantity handlers
  const handleQuantityChange = useCallback((newQuantity, newPercent, newUnit) => {
    setQuantity(newQuantity);
    setQuantityPercent(newPercent);
    if (newUnit) setQuantityUnit(newUnit);
  }, []);

  // Validation
  const validateOrder = useCallback(() => {
    const errors = [];

    // Price validation
    if (orderConfig.requiresPrice && (!price || parseFloat(price) <= 0)) {
      errors.push('Vui lòng nhập giá hợp lệ');
    }

    // Stop price validation
    if (orderConfig.requiresStopPrice && (!stopPrice || parseFloat(stopPrice) <= 0)) {
      errors.push('Vui lòng nhập giá kích hoạt (Stop)');
    }

    // Quantity validation
    if (!quantity || quantity <= 0) {
      errors.push('Vui lòng nhập mức ký quỹ');
    }

    // Margin cannot exceed balance
    if (quantity > balance) {
      errors.push(`Mức ký quỹ không được vượt quá số dư (${formatUSDT(balance)})`);
    }

    // TP/SL validation
    if (tpEnabled && tpPrice) {
      if (direction === 'LONG' && tpPrice <= entryPrice) {
        errors.push('TP phải cao hơn giá vào lệnh cho Long');
      }
      if (direction === 'SHORT' && tpPrice >= entryPrice) {
        errors.push('TP phải thấp hơn giá vào lệnh cho Short');
      }
    }

    if (slEnabled && slPrice) {
      if (direction === 'LONG' && slPrice >= entryPrice) {
        errors.push('SL phải thấp hơn giá vào lệnh cho Long');
      }
      if (direction === 'SHORT' && slPrice <= entryPrice) {
        errors.push('SL phải cao hơn giá vào lệnh cho Short');
      }
    }

    return errors;
  }, [orderConfig, price, stopPrice, quantity, balance, tpEnabled, tpPrice, slEnabled, slPrice, direction, entryPrice]);

  // Submit handler
  const handleSubmit = async () => {
    // Check AI blocking first (Custom mode only)
    if (tradeMode === 'custom' && aiAssessment?.blocked) {
      alert({
        type: 'error',
        title: 'AI Sư Phụ - Không cho phép',
        message: aiAssessment.blockReason || 'Bạn cần có Stop Loss để được phép trade.',
      });
      return;
    }

    const errors = validateOrder();
    if (errors.length > 0) {
      alert({
        type: 'error',
        title: 'Lỗi xác thực',
        message: errors.join('\n'),
      });
      return;
    }

    setLoading(true);

    try {
      // Calculate margin (position size in USDT)
      const marginAmount = quantityUnit === 'usdt'
        ? quantity / leverage  // If input is in USDT, divide by leverage to get margin
        : (quantity * entryPrice) / leverage;  // If input is in coin, calculate margin

      // Calculate coin quantity
      const coinQuantity = (marginAmount * leverage) / entryPrice;

      // ═══════════════════════════════════════════════════════════
      // SMART ORDER TYPE for Pattern Mode
      // Pattern Mode: Use Limit at pattern.entry if price not in zone
      // ═══════════════════════════════════════════════════════════
      let actualOrderType = orderType;
      let patternLimitPrice = null;

      if (isPatternMode && pattern?.entry) {
        const patternEntry = pattern.entry;
        const tolerance = patternEntry * 0.001; // 0.1% tolerance

        if (direction === 'LONG') {
          if (currentPrice <= patternEntry + tolerance) {
            // Giá đã ở hoặc dưới entry → Market OK
            actualOrderType = 'market';
            console.log('[PaperTradeV2] Pattern LONG: Price in zone, using Market');
          } else {
            // Giá cao hơn entry → Limit để chờ giá xuống
            actualOrderType = 'limit';
            patternLimitPrice = patternEntry;
            console.log('[PaperTradeV2] Pattern LONG: Price above entry, using Limit at', patternEntry);
          }
        } else { // SHORT
          if (currentPrice >= patternEntry - tolerance) {
            // Giá đã ở hoặc trên entry → Market OK
            actualOrderType = 'market';
            console.log('[PaperTradeV2] Pattern SHORT: Price in zone, using Market');
          } else {
            // Giá thấp hơn entry → Limit để chờ giá lên
            actualOrderType = 'limit';
            patternLimitPrice = patternEntry;
            console.log('[PaperTradeV2] Pattern SHORT: Price below entry, using Limit at', patternEntry);
          }
        }
      }

      console.log('[PaperTradeV2] Order type:', actualOrderType, 'Pattern mode:', isPatternMode);

      // ═══════════════════════════════════════════════════════════
      // STOP LIMIT / STOP MARKET ORDERS → Create pending order
      // ═══════════════════════════════════════════════════════════
      if (actualOrderType === 'stop_limit' || actualOrderType === 'stop_market') {
        const stopPriceNum = parseFloat(stopPrice);
        const limitPriceNum = parseFloat(price);

        // Create pending order via pendingOrderService
        const pendingOrderData = {
          symbol: symbol,
          base_asset: baseAsset,
          order_type: actualOrderType,
          direction: direction,
          stop_price: stopPriceNum,
          limit_price: actualOrderType === 'stop_limit' ? limitPriceNum : null,
          trigger_type: triggerType,
          quantity: coinQuantity,
          position_size: marginAmount * leverage,
          leverage: leverage,
          margin_mode: marginMode,
          initial_margin: marginAmount,
          take_profit: tpEnabled ? tpPrice : null,
          stop_loss: slEnabled ? slPrice : null,
          tp_trigger_type: tpTriggerType,
          sl_trigger_type: slTriggerType,
          pattern_type: pattern?.patternType || pattern?.type || null,
          timeframe: pattern?.timeframe || '4H',
          confidence: pattern?.confidence || 75,
        };

        console.log('[PaperTradeV2] Creating Stop order:', pendingOrderData);

        const result = await createPendingOrder(user?.id, pendingOrderData);

        if (!result.success) {
          throw new Error(result.error || 'Không thể tạo lệnh chờ');
        }

        // Deduct margin from balance (reserved for pending order)
        const newBalance = paperTradeService.getBalance() - marginAmount;
        if (newBalance < 0) {
          throw new Error('Không đủ số dư');
        }

        alert({
          type: 'success',
          title: 'Lệnh chờ đã tạo!',
          message: `${actualOrderType === 'stop_limit' ? 'Stop Limit' : 'Stop Market'} ${direction}\n` +
            `Stop: ${formatUSDT(stopPriceNum)}` +
            (actualOrderType === 'stop_limit' ? ` → Limit: ${formatUSDT(limitPriceNum)}` : '') +
            `\nMargin: ${formatUSDT(marginAmount)} @ ${leverage}x`,
          buttons: [{ text: 'OK', onPress: handleClose }],
        });
        return;
      }

      // ═══════════════════════════════════════════════════════════
      // LIMIT ORDER → Check if should be pending or execute immediately
      // ═══════════════════════════════════════════════════════════
      if (actualOrderType === 'limit') {
        // Use pattern entry price if in Pattern mode, otherwise use user input
        const limitPriceNum = patternLimitPrice || parseFloat(price);

        // Check if limit order should be pending
        // LONG limit: pending if limitPrice < market (waiting for dip)
        // SHORT limit: pending if limitPrice > market (waiting for pump)
        const shouldBePending = direction === 'LONG'
          ? limitPriceNum < currentPrice
          : limitPriceNum > currentPrice;

        if (shouldBePending) {
          // Create pending limit order
          const pendingOrderData = {
            symbol: symbol,
            base_asset: baseAsset,
            order_type: 'limit',
            direction: direction,
            limit_price: limitPriceNum, // IMPORTANT: Execute at THIS price, not market price
            stop_price: null,
            trigger_type: 'last_price',
            quantity: coinQuantity,
            position_size: marginAmount * leverage,
            leverage: leverage,
            margin_mode: marginMode,
            initial_margin: marginAmount,
            take_profit: tpEnabled ? tpPrice : null,
            stop_loss: slEnabled ? slPrice : null,
            tp_trigger_type: tpTriggerType,
            sl_trigger_type: slTriggerType,
            pattern_type: pattern?.patternType || pattern?.type || null,
            timeframe: pattern?.timeframe || '4H',
            confidence: pattern?.confidence || 75,
          };

          console.log('[PaperTradeV2] Creating pending Limit order at:', limitPriceNum);

          const result = await createPendingOrder(user?.id, pendingOrderData);

          if (!result.success) {
            throw new Error(result.error || 'Không thể tạo lệnh chờ');
          }

          alert({
            type: 'success',
            title: isPatternMode ? 'Lệnh Pattern đã tạo!' : 'Lệnh Limit đã tạo!',
            message: `Chờ khớp khi giá ${direction === 'LONG' ? '≤' : '≥'} ${formatUSDT(limitPriceNum)}\n` +
              `Margin: ${formatUSDT(marginAmount)} @ ${leverage}x`,
            buttons: [{ text: 'OK', onPress: handleClose }],
          });
          return;
        }

        // Limit price already met - execute at LIMIT PRICE (not market price)
        console.log('[PaperTradeV2] Limit price met, executing at limitPrice:', limitPriceNum);
      }

      // ═══════════════════════════════════════════════════════════
      // MARKET ORDER or LIMIT that executes immediately
      // ═══════════════════════════════════════════════════════════
      // Market: Execute at currentPrice
      // Limit (price met): Execute at limitPrice (NOT currentPrice!)
      const executionPrice = actualOrderType === 'market'
        ? currentPrice
        : (patternLimitPrice || parseFloat(price)); // Limit executes at LIMIT PRICE

      // Build pattern object for paperTradeService
      const patternForService = {
        symbol: symbol,
        entry: executionPrice,
        direction: direction,
        stopLoss: slEnabled ? slPrice : (direction === 'LONG' ? executionPrice * 0.98 : executionPrice * 1.02),
        targets: tpEnabled ? [tpPrice] : [(direction === 'LONG' ? executionPrice * 1.04 : executionPrice * 0.96)],
        target1: tpEnabled ? tpPrice : null,
        type: pattern?.patternType || pattern?.type || actualOrderType,
        timeframe: pattern?.timeframe || '4H',
        confidence: pattern?.confidence || 75,
      };

      // Parameters for paperTradeService.openPosition
      const serviceParams = {
        pattern: patternForService,
        positionSize: marginAmount,  // Margin amount
        userId: user?.id || 'anonymous',
        leverage: leverage,
        positionValue: marginAmount * leverage,  // Actual position value
        currentMarketPrice: currentPrice,
        tradeMode: tradeMode,

        // Pattern comparison for Custom mode
        patternEntry: pattern?.entry || executionPrice,
        patternSL: pattern?.stopLoss || 0,
        patternTP: pattern?.takeProfit1 || pattern?.takeProfit || pattern?.target || 0,

        // AI Assessment
        aiScore: aiAssessment?.score || 0,
        aiFeedback: aiAssessment?.warnings?.join(', ') || null,
      };

      console.log('[PaperTradeV2] Executing Market/Limit order:', serviceParams);

      // Submit via service or callback
      if (onSubmit) {
        await onSubmit(serviceParams);
      } else {
        // Use paperTradeService directly
        const result = await paperTradeService.openPosition(serviceParams);
        if (!result) {
          throw new Error('Failed to open position');
        }
      }

      // Success
      alert({
        type: 'success',
        title: 'Thành công!',
        message: `Đã mở lệnh ${direction} ${symbol}\nEntry: ${formatUSDT(executionPrice)}\nMargin: ${formatUSDT(marginAmount)} @ ${leverage}x`,
        buttons: [{ text: 'OK', onPress: handleClose }],
      });

    } catch (error) {
      console.error('[PaperTradeV2] Submit error:', error);
      alert({
        type: 'error',
        title: 'Lỗi',
        message: error.message || 'Không thể tạo lệnh. Vui lòng thử lại.',
      });
    } finally {
      setLoading(false);
    }
  };

  // Close handler - uses loadingRef to avoid stale closure when called from alert buttons
  const handleClose = useCallback(() => {
    if (loadingRef.current) return;
    onClose?.();
  }, [onClose]);

  // Onboarding handlers
  const handleOnboardingComplete = useCallback(() => {
    markCompleted(user?.id);
    setShowOnboarding(false);
  }, [user]);

  const handleOnboardingSkip = useCallback(() => {
    markSkipped(user?.id, 'skip_button');
    setShowOnboarding(false);
  }, [user]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <ErrorBoundary>
        <View style={styles.overlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardAvoid}
          >
            <SafeAreaView style={styles.container} edges={['bottom']}>
              {/* Animated Collapsible Header */}
              <Animated.View
                style={[
                  styles.collapsibleHeader,
                  {
                    opacity: headerOpacity,
                    transform: [{ translateY: headerTranslateY }],
                  },
                ]}
                pointerEvents={headerVisible.current ? 'auto' : 'none'}
              >
                {/* Header */}
                <View style={styles.header}>
                  <View>
                    <Text style={styles.title}>Paper Trade</Text>
                    <Text style={styles.subtitle}>
                      {symbol} • {formatUSDT(currentPrice)}
                    </Text>
                  </View>
                  <View style={styles.headerRight}>
                    <View style={styles.balanceBadge}>
                      <Text style={styles.balanceText}>{formatUSDT(balance)}</Text>
                    </View>
                    <TouchableOpacity onPress={handleClose} disabled={loading}>
                      <X size={24} color={COLORS.textPrimary} />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Mode Tab Selector - Pattern / Custom */}
                {pattern && (
                  <ModeTabSelector
                    activeMode={tradeMode}
                    onModeChange={handleModeChange}
                    customModeLimit={customModeLimit}
                    disabled={loading}
                  />
                )}

                {/* Mode Banner - shows current mode description */}
                <ModeBanner mode={tradeMode} />

                {/* Pattern Mode: Show smart order info in header */}
                {isPatternMode && pattern?.entry && (
                  <View style={styles.patternOrderTypeInfo}>
                    <Zap size={14} color={COLORS.cyan} />
                    <Text style={styles.patternOrderTypeText}>
                      {(() => {
                        const entry = pattern.entry;
                        const tolerance = entry * 0.001;
                        const dir = pattern.direction || direction;
                        if (dir === 'LONG') {
                          return currentPrice <= entry + tolerance
                            ? 'Market - Giá đã trong zone'
                            : `Limit chờ giá ≤ ${formatUSDT(entry).replace('$', '')}`;
                        } else {
                          return currentPrice >= entry - tolerance
                            ? 'Market - Giá đã trong zone'
                            : `Limit chờ giá ≥ ${formatUSDT(entry).replace('$', '')}`;
                        }
                      })()}
                    </Text>
                  </View>
                )}
              </Animated.View>

              <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                onScroll={handleScroll}
                scrollEventThrottle={16}
              >
                {/* Order Type Selector - Only show in Custom mode */}
                {!isPatternMode && (
                  <OrderTypeSelector
                    selectedType={orderType}
                    onSelectType={setOrderType}
                    disabled={loading}
                  />
                )}

                {/* Direction Selector */}
                <View style={styles.directionRow}>
                  <TouchableOpacity
                    style={[
                      styles.directionButton,
                      direction === 'LONG' && styles.longActive,
                      isFieldLocked && styles.lockedButton,
                    ]}
                    onPress={() => !isFieldLocked && setDirection('LONG')}
                    disabled={loading || isFieldLocked}
                  >
                    <TrendingUp size={18} color={direction === 'LONG' ? COLORS.success : COLORS.textMuted} />
                    <Text style={[
                      styles.directionText,
                      direction === 'LONG' && styles.longText,
                    ]}>
                      LONG
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.directionButton,
                      direction === 'SHORT' && styles.shortActive,
                      isFieldLocked && styles.lockedButton,
                    ]}
                    onPress={() => !isFieldLocked && setDirection('SHORT')}
                    disabled={loading || isFieldLocked}
                  >
                    <TrendingDown size={18} color={direction === 'SHORT' ? COLORS.error : COLORS.textMuted} />
                    <Text style={[
                      styles.directionText,
                      direction === 'SHORT' && styles.shortText,
                    ]}>
                      SHORT
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Entry Price Display */}
                <View style={styles.entryPriceRow}>
                  <View style={styles.entryPriceLeft}>
                    <DollarSign size={14} color={COLORS.gold} />
                    <Text style={styles.entryPriceLabel}>Giá vào lệnh:</Text>
                  </View>
                  <View style={styles.entryPriceRight}>
                    <Text style={styles.entryPriceValue}>
                      {formatUSDT(entryPrice)}
                    </Text>
                    {orderType === 'market' && (
                      <View style={styles.marketBadge}>
                        <Text style={styles.marketBadgeText}>Market</Text>
                      </View>
                    )}
                    {isPatternMode && pattern?.entry && (
                      <View style={styles.patternBadge}>
                        <Text style={styles.patternBadgeText}>Pattern</Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* Margin & Leverage */}
                <MarginLeverageBar
                  leverage={leverage}
                  onLeverageChange={setLeverage}
                  liquidationPrice={liquidationPrice}
                  disabled={loading}
                />

                {/* Stop Price (for Stop orders) */}
                {orderConfig.requiresStopPrice && (
                  <PriceInput
                    label="Giá kích hoạt (Stop)"
                    value={stopPrice}
                    onChange={setStopPrice}
                    currentPrice={currentPrice}
                    showBBO={true}
                    showTriggerType={true}
                    triggerType={triggerType}
                    onTriggerTypeChange={setTriggerType}
                    disabled={loading}
                    helpText="Khi giá chạm mức này, lệnh sẽ được kích hoạt"
                  />
                )}

                {/* Limit Price (for Limit orders) */}
                {orderConfig.requiresPrice && (
                  <PriceInput
                    label={orderType === 'stop_limit' ? 'Giá Limit' : 'Giá Entry'}
                    value={price}
                    onChange={setPrice}
                    currentPrice={currentPrice}
                    showBBO={!isFieldLocked}
                    disabled={loading || isFieldLocked}
                    locked={isFieldLocked}
                    lockedText={isFieldLocked ? 'Khóa theo Pattern' : null}
                  />
                )}

                {/* Market price info */}
                {orderType === 'market' && (
                  <View style={styles.marketInfo}>
                    <AlertCircle size={14} color={COLORS.cyan} />
                    <Text style={styles.marketInfoText}>
                      Lệnh sẽ khớp ngay ở giá thị trường: {formatUSDT(currentPrice)}
                    </Text>
                  </View>
                )}

                {/* Quantity Slider */}
                <QuantitySlider
                  value={quantity}
                  percent={quantityPercent}
                  unit={quantityUnit}
                  balance={balance}
                  leverage={leverage}
                  currentPrice={entryPrice}
                  baseAsset={baseAsset}
                  onChange={handleQuantityChange}
                  disabled={loading}
                />

                {/* TP/SL Section */}
                {/* quantity must include leverage for accurate PnL-to-Price calculation */}
                <TPSLSection
                  entryPrice={entryPrice}
                  quantity={quantityUnit === 'usdt' ? (quantity * leverage) / entryPrice : quantity * leverage}
                  direction={direction}
                  leverage={leverage}
                  tpEnabled={tpEnabled}
                  tpPrice={tpPrice}
                  tpTriggerType={tpTriggerType}
                  onTPEnabledChange={setTPEnabled}
                  onTPPriceChange={setTPPrice}
                  onTPTriggerTypeChange={setTPTriggerType}
                  slEnabled={slEnabled}
                  slPrice={slPrice}
                  slTriggerType={slTriggerType}
                  onSLEnabledChange={setSLEnabled}
                  onSLPriceChange={setSLPrice}
                  onSLTriggerTypeChange={setSLTriggerType}
                  disabled={loading}
                  locked={isFieldLocked}
                  lockedText={isFieldLocked ? 'Theo Pattern' : null}
                />

                {/* AI Sư Phụ Assessment - Only in Custom mode */}
                {tradeMode === 'custom' && pattern && (
                  <AIAssessmentSection
                    customEntry={entryPrice}
                    customSL={slEnabled ? slPrice : 0}
                    customTP={tpEnabled ? tpPrice : entryPrice}
                    patternEntry={pattern?.entry || entryPrice}
                    patternSL={pattern?.stopLoss || 0}
                    patternTP={pattern?.takeProfit1 || pattern?.takeProfit || pattern?.target || 0}
                    direction={direction}
                    leverage={leverage}
                    onAssessmentChange={setAIAssessment}
                  />
                )}

                {/* Order Calculations */}
                <OrderCalculations
                  entryPrice={entryPrice}
                  quantity={quantityUnit === 'usdt' ? quantity / entryPrice : quantity}
                  leverage={leverage}
                  direction={direction}
                  marginMode={marginMode}
                  orderType={orderType}
                  tpPercent={tpPercent}
                  slPercent={slPercent}
                  expanded={expandedCalculations}
                  onToggleExpand={() => setExpandedCalculations(!expandedCalculations)}
                />

                {/* Spacer for scroll - ensure content isn't hidden by footer */}
                <View style={{ height: 250 }} />
              </ScrollView>

              {/* Submit Button */}
              <View style={styles.footer}>
                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    direction === 'LONG' ? styles.submitLong : styles.submitShort,
                    loading && styles.submitDisabled,
                  ]}
                  onPress={handleSubmit}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <>
                      <Check size={16} color="#FFF" />
                      <Text style={styles.submitText}>
                        {direction === 'LONG' ? 'Mua/Long' : 'Bán/Short'}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>

              {/* Bottom spacer for Android */}
              <View style={styles.bottomSpacer} />
            </SafeAreaView>
          </KeyboardAvoidingView>
        </View>

        {/* Onboarding Modal */}
        <OnboardingModal
          visible={showOnboarding}
          onComplete={handleOnboardingComplete}
          onSkip={handleOnboardingSkip}
        />

        {AlertComponent}
      </ErrorBoundary>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'flex-end',
  },
  keyboardAvoid: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: COLORS.bgMid,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '92%',
  },
  // Collapsible Header Container - position absolute for smooth animation
  collapsibleHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    backgroundColor: COLORS.bgMid,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  // Header - Compact
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  balanceBadge: {
    backgroundColor: 'rgba(255, 189, 89, 0.15)',
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: 4,
  },
  balanceText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.gold,
  },
  // Content
  content: {
    padding: SPACING.md,
    paddingTop: 215, // Space for compact header (header 36 + info 18 + tabs 42 + banner 30 + orderInfo 30 + margins ~59)
  },
  // Pattern Mode Order Type Info (in header) - Compact
  patternOrderTypeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
    paddingVertical: 6,
    paddingHorizontal: SPACING.sm,
    borderRadius: 6,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.xs,
    gap: 6,
  },
  patternOrderTypeText: {
    fontSize: 11,
    color: COLORS.cyan,
    fontWeight: '600',
  },
  // Direction
  directionRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  directionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    gap: SPACING.sm,
  },
  longActive: {
    backgroundColor: 'rgba(58, 247, 166, 0.15)',
    borderWidth: 1,
    borderColor: COLORS.success,
  },
  shortActive: {
    backgroundColor: 'rgba(255, 107, 107, 0.15)',
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  lockedButton: {
    opacity: 0.6,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
    borderStyle: 'dashed',
  },
  directionText: {
    fontSize: 15,
    fontWeight: '700',
  },
  // Entry Price Display
  entryPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: 'rgba(255, 189, 89, 0.08)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.2)',
  },
  entryPriceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  entryPriceLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  entryPriceRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  entryPriceValue: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.gold,
  },
  marketBadge: {
    backgroundColor: 'rgba(0, 240, 255, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  marketBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.cyan,
  },
  patternBadge: {
    backgroundColor: 'rgba(255, 189, 89, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  patternBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.gold,
  },
  longText: {
    color: COLORS.success,
  },
  shortText: {
    color: COLORS.error,
  },
  // Market info
  marketInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
    padding: SPACING.sm,
    borderRadius: 8,
    marginBottom: SPACING.md,
  },
  marketInfoText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.cyan,
  },
  // Footer
  footer: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  submitLong: {
    backgroundColor: '#059669',  // More muted green
  },
  submitShort: {
    backgroundColor: '#DC2626',  // More muted red
  },
  submitDisabled: {
    opacity: 0.5,
  },
  submitText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFF',
  },
  bottomSpacer: {
    height: Platform.OS === 'android' ? 20 : 0,
  },
});

export default memo(PaperTradeModalV2);
