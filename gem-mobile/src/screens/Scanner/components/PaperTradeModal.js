/**
 * Gemral - Paper Trade Modal
 * Open simulated trades from pattern detection
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import alertService from '../../../services/alertService';
import {
  X,
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertTriangle,
  Target,
  Percent,
  Calculator,
  CheckCircle,
  Brain,
  Info,
  HelpCircle,
  Clock,  // NEW: For limit order indicator
} from 'lucide-react-native';
import { useAuth } from '../../../contexts/AuthContext';
import paperTradeService from '../../../services/paperTradeService';
import notificationService from '../../../services/notificationService';
import { COLORS, SPACING, TYPOGRAPHY, GLASS } from '../../../utils/tokens';
import { formatPrice, formatConfidence, formatCurrency } from '../../../utils/formatters';
import ErrorBoundary from '../../../components/ErrorBoundary';
import { MindsetCheckModal, AITradeGuard } from '../../../components/Trading';
import { SCORE_COLORS } from '../../../services/mindsetAdvisorService';
import { AIAvatarOrb } from '../../../components/AITrader';
import useAITradeAnalysis from '../../../hooks/useAITradeAnalysis';

// Dual Mode Components
import ModeTabSelector from '../../../components/Trading/ModeTabSelector';
import ModeBanner from '../../../components/Trading/ModeBanner';
import PatternModeFields from '../../../components/Trading/PatternModeFields';
import CustomModeFields from '../../../components/Trading/CustomModeFields';
import AIAssessmentSection from '../../../components/Trading/AIAssessmentSection';

// Fetch with timeout to prevent hanging requests on stalled mobile connections
const fetchWithTimeout = async (url, timeoutMs = 10000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeoutMs}ms`);
    }
    throw error;
  }
};

/**
 * Inner content component - wrapped by ErrorBoundary
 */
const PaperTradeContent = ({ pattern, onClose, onSuccess }) => {
  const { user, profile } = useAuth();
  const [positionSize, setPositionSize] = useState('100'); // This is MARGIN (collateral)
  const [leverage, setLeverage] = useState(10); // Default 10x leverage like Binance Futures
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState(0);
  const [successPosition, setSuccessPosition] = useState(null); // For success modal

  // Leverage options (common Binance Futures options)
  const leverageOptions = [1, 5, 10, 20, 50, 100];

  // Mindset check state
  const [showMindsetCheck, setShowMindsetCheck] = useState(false);
  const [mindsetResult, setMindsetResult] = useState(null);

  // Dual Mode state
  const [tradeMode, setTradeMode] = useState('pattern'); // 'pattern' | 'custom'
  const [customEntry, setCustomEntry] = useState(0);
  const [customSL, setCustomSL] = useState(0);
  const [customTP, setCustomTP] = useState(0);
  const [aiAssessment, setAiAssessment] = useState(null);
  const [customModeLimit, setCustomModeLimit] = useState(null);

  // AI Sư Phụ integration
  const {
    aiState,
    analyzing: aiAnalyzing,
    analyzeBeforeTrade,
    analyzeAfterTrade,
    dismissMessage,
    completeUnlock,
    getMoodColor,
  } = useAITradeAnalysis();
  const [showAIGuard, setShowAIGuard] = useState(false);

  // Calculation tooltip state
  const [showCalcTooltip, setShowCalcTooltip] = useState(false);

  // Helper to get score color
  const getScoreColor = (score) => {
    if (score >= 80) return SCORE_COLORS.ready;
    if (score >= 60) return SCORE_COLORS.prepare;
    if (score >= 40) return SCORE_COLORS.caution;
    return SCORE_COLORS.stop;
  };

  // Live market price from Binance (for accurate limit order detection)
  const [liveMarketPrice, setLiveMarketPrice] = useState(null);

  // Load balance and custom mode limit on mount
  useEffect(() => {
    loadBalance();
    loadCustomModeLimit();
  }, [user]);

  // Fetch LIVE market price from Binance when modal opens
  useEffect(() => {
    const fetchLivePrice = async () => {
      if (!pattern?.symbol) return;

      try {
        // P6 FIX #5: Use Futures API — Spot returns 400 for futures-only symbols
        const response = await fetchWithTimeout(
          `https://fapi.binance.com/fapi/v1/ticker/price?symbol=${pattern.symbol}`
        );
        const data = await response.json();
        if (data?.price) {
          const price = parseFloat(data.price);
          setLiveMarketPrice(price);
          console.log('[PaperTrade] Live price fetched:', {
            symbol: pattern.symbol,
            price,
            patternEntry: pattern?.entry,
          });
        }
      } catch (error) {
        console.log('[PaperTrade] Failed to fetch live price:', error.message);
      }
    };

    fetchLivePrice();
    // Refresh every 2 seconds while modal is open for more real-time updates
    const interval = setInterval(fetchLivePrice, 2000);
    return () => clearInterval(interval);
  }, [pattern?.symbol, pattern?.entry]);

  const loadBalance = async () => {
    try {
      // Initialize with CLOUD SYNC using user ID
      await paperTradeService.init(user?.id);
      setBalance(paperTradeService.getBalance() || 10000);
    } catch (error) {
      console.error('[PaperTrade] Balance load error:', error);
      setBalance(10000); // Default fallback
    }
  };

  // Load custom mode limit for FREE users
  // Pass profile data which contains role, scanner_tier, is_admin, etc.
  const loadCustomModeLimit = async () => {
    try {
      const userWithProfile = {
        id: user?.id,
        ...profile, // role, scanner_tier, karma_level, is_admin, chatbot_tier
      };
      const limit = await paperTradeService.checkCustomModeLimit(userWithProfile);
      setCustomModeLimit(limit);
    } catch (error) {
      console.error('[PaperTrade] Custom mode limit error:', error);
      setCustomModeLimit(null);
    }
  };

  // Issue 18: Safe null checks for pattern properties - MOVED HERE before using pattern
  if (!pattern) return null;

  const isLong = pattern.direction === 'LONG';
  const directionColor = isLong ? COLORS.success : COLORS.error;
  const directionBg = isLong ? 'rgba(58, 247, 166, 0.15)' : 'rgba(255, 107, 107, 0.15)';

  // Get take profit value (support multiple field names from different patterns)
  // MUST be defined BEFORE patternTP uses it
  // Support both camelCase (patternDetection) and snake_case (zoneManager) naming
  const getTakeProfit = () => {
    return pattern.target || pattern.takeProfit || pattern.takeProfit1 ||
           pattern.target_1 || pattern.take_profit || pattern.tp ||
           pattern.targets?.[0] || ((pattern.entry || pattern.entry_price) * (isLong ? 1.02 : 0.98));
  };

  // Pattern values (from props) - support both naming conventions
  const patternEntry = pattern?.entry || pattern?.entry_price || 0;
  const patternSL = pattern?.stopLoss || pattern?.stop_loss || pattern?.sl || 0;
  const patternTP = getTakeProfit();

  // Active values based on mode
  const activeEntry = tradeMode === 'pattern' ? patternEntry : customEntry;
  const activeSL = tradeMode === 'pattern' ? patternSL : customSL;
  const activeTP = tradeMode === 'pattern' ? patternTP : customTP;

  // Get current market price (for limit order detection)
  // Priority: Live price from Binance > pattern.currentPrice > pattern.price
  // NOTE: Do NOT fallback to patternEntry - that would break limit order detection
  const currentMarketPrice = liveMarketPrice || pattern?.currentPrice || pattern?.price || null;

  // NEW: Detect if this would be a limit order (custom mode only)
  const isLimitOrder = useMemo(() => {
    if (tradeMode !== 'custom' || !currentMarketPrice || !customEntry) {
      return false;
    }

    const dir = (pattern?.direction || '').toUpperCase();
    let result = false;

    if (dir === 'LONG') {
      // LONG limit: entry below market (waiting for dip)
      result = customEntry < currentMarketPrice;
    } else {
      // SHORT limit: entry above market (waiting for pump)
      result = customEntry > currentMarketPrice;
    }

    // Debug logging
    console.log('[PaperTrade] Limit order check:', {
      tradeMode,
      direction: dir,
      customEntry,
      currentMarketPrice,
      liveMarketPrice,
      isLimitOrder: result,
    });

    return result;
  }, [tradeMode, customEntry, currentMarketPrice, pattern?.direction, liveMarketPrice]);

  // Handle mode change
  const handleModeChange = (newMode) => {
    // Handle limit exceeded signal
    if (newMode === 'custom_limit_exceeded') {
      alertService.confirm(
        'Hết lượt Custom Mode',
        `Bạn đã dùng hết ${customModeLimit?.dailyLimit || 3} lượt Custom Mode hôm nay. Nâng cấp lên TIER1 để không giới hạn!`,
        [
          { text: 'Để sau', style: 'cancel' },
          { text: 'Nâng cấp', onPress: () => {} }, // TODO: Navigate to subscription
        ]
      );
      return;
    }

    // If switching to Custom first time, copy pattern values
    if (newMode === 'custom' && tradeMode === 'pattern') {
      setCustomEntry(patternEntry);
      setCustomSL(patternSL);
      setCustomTP(patternTP);
    }

    setTradeMode(newMode);
  };

  // Reset custom values to pattern
  const handleResetToPattern = () => {
    setCustomEntry(patternEntry);
    setCustomSL(patternSL);
    setCustomTP(patternTP);
  };

  // Handle AI assessment change
  const handleAIAssessmentChange = (assessment) => {
    setAiAssessment(assessment);
  };

  // Calculate values - Binance Futures style with leverage
  // Uses active values based on mode (pattern or custom)
  const calculations = useMemo(() => {
    const margin = parseFloat(positionSize) || 0; // Margin (collateral)
    const positionValue = margin * leverage; // Actual position value
    // Use active values based on trade mode
    const entry = activeEntry || pattern?.entry || 0;
    const sl = activeSL || pattern?.stopLoss || 0;
    const tp = activeTP || getTakeProfit();

    // Quantity based on position value (not margin)
    const quantity = entry > 0 ? positionValue / entry : 0;

    // Price movement percentages
    const riskPercent = entry > 0 ? ((sl - entry) / entry) * 100 : 0;
    const rewardPercent = entry > 0 ? ((tp - entry) / entry) * 100 : 0;

    // P&L = position_value × price_change_percent (Binance Futures formula)
    // Or equivalently: |price_diff| × quantity
    const riskAmount = Math.abs(entry - sl) * quantity;
    const rewardAmount = Math.abs(tp - entry) * quantity;

    // Alternatively calculated as: margin × leverage × percent_change
    // riskAmount = margin * leverage * Math.abs(riskPercent) / 100;
    // rewardAmount = margin * leverage * Math.abs(rewardPercent) / 100;

    const rr = riskAmount > 0 ? rewardAmount / riskAmount : 0;

    // Liquidation price (simplified - actual formula varies by exchange)
    // For LONG: liq_price = entry × (1 - 1/leverage + maintenance_margin_rate)
    // Simplified: liq_price ≈ entry × (1 - 0.9/leverage)
    const liqPrice = isLong
      ? entry * (1 - 0.9 / leverage)
      : entry * (1 + 0.9 / leverage);

    // Check if stop loss is beyond liquidation
    const slBeyondLiq = isLong
      ? sl <= liqPrice
      : sl >= liqPrice;

    return {
      margin,
      positionValue,
      quantity,
      riskPercent: Math.abs(riskPercent).toFixed(2),
      rewardPercent: Math.abs(rewardPercent).toFixed(2),
      riskAmount: riskAmount.toFixed(2),
      rewardAmount: rewardAmount.toFixed(2),
      riskReward: rr.toFixed(1),
      takeProfit: tp,
      liqPrice,
      slBeyondLiq,
      // ROE (Return on Equity) - profit/loss as % of margin
      roePercent: margin > 0 ? ((rewardAmount / margin) * 100).toFixed(1) : '0.0',
      riskRoePercent: margin > 0 ? ((riskAmount / margin) * 100).toFixed(1) : '0.0',
    };
  }, [positionSize, leverage, pattern, isLong, activeEntry, activeSL, activeTP]);

  // Quick size buttons
  const quickSizes = ['50', '100', '250', '500', '1000'];

  // Percentage buttons
  const percentButtons = [
    { label: '10%', value: balance * 0.1 },
    { label: '25%', value: balance * 0.25 },
    { label: '50%', value: balance * 0.5 },
    { label: '100%', value: balance },
  ];

  // formatPrice is imported from utils/formatters at the top of the file

  // Handle open trade
  const handleOpenTrade = async () => {
    const size = parseFloat(positionSize);

    if (!size || size <= 0) {
      alertService.error('Lỗi', 'Vui lòng nhập số tiền hợp lệ');
      return;
    }

    if (size > balance) {
      alertService.error('Lỗi', `Số dư không đủ. Số dư hiện tại: $${formatCurrency(balance)}`);
      return;
    }

    // VALIDATION: Custom Mode entry price must make sense
    // For LIMIT orders to work correctly:
    // - LONG limit: entry BELOW market (waiting for dip)
    // - SHORT limit: entry ABOVE market (waiting for pump)
    // If entry is on the "wrong side", it should execute as MARKET at current price
    if (tradeMode === 'custom' && currentMarketPrice) {
      const dir = (pattern?.direction || '').toUpperCase();
      const isInvalidEntry = dir === 'LONG'
        ? customEntry > currentMarketPrice  // LONG entry above market = invalid limit
        : customEntry < currentMarketPrice; // SHORT entry below market = invalid limit

      if (isInvalidEntry) {
        // Ask user: Execute at market price or cancel?
        alertService.confirm(
          'Giá vào lệnh không hợp lệ',
          dir === 'LONG'
            ? `Giá vào ($${formatPrice(customEntry)}) cao hơn giá thị trường ($${formatPrice(currentMarketPrice)}).\n\nLệnh LONG limit phải có giá vào THẤP hơn giá hiện tại.\n\nBạn muốn vào lệnh ngay ở giá thị trường?`
            : `Giá vào ($${formatPrice(customEntry)}) thấp hơn giá thị trường ($${formatPrice(currentMarketPrice)}).\n\nLệnh SHORT limit phải có giá vào CAO hơn giá hiện tại.\n\nBạn muốn vào lệnh ngay ở giá thị trường?`,
          [
            { text: 'Huỷ', style: 'cancel' },
            {
              text: 'Vào ở giá thị trường',
              onPress: () => {
                // Update entry to market price and re-trigger
                setCustomEntry(currentMarketPrice);
                alertService.success('Đã cập nhật', `Giá vào đã đổi thành $${formatPrice(currentMarketPrice)}. Bấm Mua/Bán lại để xác nhận.`);
              },
            },
          ]
        );
        return;
      }
    }

    try {
      setLoading(true);

      // AI Sư Phụ pre-trade analysis (use active values)
      const tradeData = {
        symbol: pattern.symbol,
        direction: pattern.direction,
        entry: activeEntry,
        stopLoss: activeSL,
        takeProfit: activeTP,
        positionSize: size,
        patternType: pattern.type,
        confidence: pattern.confidence,
        tradeMode, // Include mode for AI context
      };

      // Pass scanner tier for paid user bypass logic
      const scannerTier = user?.scanner_tier || 'FREE';
      const aiResult = await analyzeBeforeTrade(tradeData, {
        marketData: pattern,
        mindsetScore: mindsetResult?.score,
        scannerTier, // IMPORTANT: Paid users get softer AI enforcement
      });

      // If AI blocks the trade, show AI guard modal
      if (!aiResult.allowed) {
        setShowAIGuard(true);
        setLoading(false);
        return;
      }

      // Check if AI blocked in custom mode
      if (tradeMode === 'custom' && aiAssessment?.blocked) {
        alertService.error('Không thể mở lệnh', aiAssessment.blockReason || 'AI không cho phép trade này');
        setLoading(false);
        return;
      }

      // Calculate deviations for custom mode
      const entryDeviationPercent = tradeMode === 'custom' && patternEntry > 0
        ? ((customEntry - patternEntry) / patternEntry) * 100
        : 0;
      const slDeviationPercent = tradeMode === 'custom' && patternSL > 0
        ? ((customSL - patternSL) / patternSL) * 100
        : 0;
      const tpDeviationPercent = tradeMode === 'custom' && patternTP > 0
        ? ((customTP - patternTP) / patternTP) * 100
        : 0;

      // Create modified pattern with active values for custom mode
      const activePattern = {
        ...pattern,
        entry: activeEntry,
        stopLoss: activeSL,
        target: activeTP,
        targets: [activeTP],
      };

      // CRITICAL: Ensure user is authenticated before opening position
      if (!user?.id) {
        console.error('[PaperTrade] ❌ Cannot open position - user not authenticated!');
        Alert.alert('Lỗi', 'Bạn cần đăng nhập để mở lệnh Paper Trade');
        return;
      }

      // Debug: Log values before opening position
      console.log('[PaperTrade] Opening position with:', {
        tradeMode,
        activeEntry,
        currentMarketPrice,
        liveMarketPrice,
        userId: user.id,
        willBeLimit: tradeMode === 'custom' && currentMarketPrice &&
          (pattern?.direction === 'LONG' ? activeEntry < currentMarketPrice : activeEntry > currentMarketPrice),
      });

      const position = await paperTradeService.openPosition({
        pattern: activePattern,
        positionSize: size, // This is margin
        leverage,
        positionValue: size * leverage, // Actual position value
        userId: user?.id,
        currentMarketPrice,  // NEW: For limit order detection
        // Dual mode fields
        tradeMode,
        patternEntry,
        patternSL,
        patternTP,
        entryDeviationPercent,
        slDeviationPercent,
        tpDeviationPercent,
        aiScore: aiAssessment?.score || 0,
        aiFeedback: aiAssessment || null,
      });

      // AI Sư Phụ post-trade analysis (update karma)
      await analyzeAfterTrade(
        { ...tradeData, id: position.id },
        { result: 'opened' }
      );

      // Refresh custom mode limit after custom trade
      if (tradeMode === 'custom') {
        loadCustomModeLimit();
      }

      // Send push notification for market orders (not pending/limit orders)
      // Pending orders will get notification when they fill
      if (position.status === 'OPEN') {
        await notificationService.sendPositionOpenedNotification(position, user?.id);
      }

      // Show custom success modal instead of native Alert
      setSuccessPosition({ ...position, positionSize: size, leverage, positionValue: size * leverage, tradeMode });
    } catch (error) {
      console.error('[PaperTrade] Open error:', error);
      alertService.error('Lỗi', error.message || 'Không thể mở position');
    } finally {
      setLoading(false);
    }
  };

  // Handle AI unlock
  const handleAIUnlock = async (unlockId, karmaBonus) => {
    const result = await completeUnlock(unlockId, karmaBonus);
    if (result?.success) {
      setShowAIGuard(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.overlay}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.content}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContent}
          >
            {/* Header */}
            <View style={styles.header}>
              <View>
                <Text style={styles.title}>Paper Trade</Text>
                <Text style={styles.subtitle}>Giao dịch giả lập</Text>
              </View>
              <View style={styles.headerRight}>
                {/* AI Sư Phụ Orb - Hiển thị mood và trigger AI analysis */}
                <TouchableOpacity
                  style={styles.aiOrbButton}
                  onPress={async () => {
                    // Nếu đã có AI message/warning/block -> Hiển thị AITradeGuard modal
                    if (aiState.showMessage || aiState.isBlocked) {
                      setShowAIGuard(true);
                    } else {
                      // Chưa có warning -> Trigger AI phân tích trade setup hiện tại
                      const size = parseFloat(positionSize) || 100;
                      const tradeData = {
                        symbol: pattern.symbol,
                        direction: pattern.direction,
                        entry: patternEntry,  // Use normalized value that supports both naming conventions
                        stopLoss: patternSL,  // Use normalized value
                        takeProfit: patternTP, // Use normalized value
                        positionSize: size,
                        patternType: pattern.type || pattern.patternType,
                        confidence: pattern.confidence,
                      };

                      // Gọi AI phân tích
                      const scannerTier = user?.scanner_tier || 'FREE';
                      const result = await analyzeBeforeTrade(tradeData, {
                        marketData: pattern,
                        mindsetScore: mindsetResult?.score,
                        scannerTier, // IMPORTANT: Paid users get softer AI enforcement
                        manualTrigger: true, // Đánh dấu user chủ động bấm
                      });

                      // Nếu AI trả về warning/block -> Mở AITradeGuard modal
                      if (!result.allowed) {
                        setShowAIGuard(true);
                      } else {
                        // Trade được AI approve -> Show alert xác nhận
                        alertService.success(
                          'AI Sư Phụ',
                          `Setup chấp nhận được. R:R ${calculations.riskReward}:1. Đặt SL đúng chỗ. Không dời.`
                        );
                      }
                    }
                  }}
                  activeOpacity={0.8}
                  disabled={aiAnalyzing}
                >
                  <AIAvatarOrb
                    mood={aiState.mood}
                    size="small"
                    isAnimating={aiAnalyzing || aiState.isBlocked}
                    pulseOnChange={true}
                  />
                </TouchableOpacity>
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                  <X size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Pattern Card */}
            <View style={[styles.patternCard, { borderLeftColor: directionColor }]}>
              <View style={styles.patternHeader}>
                <View style={styles.symbolContainer}>
                  <Text style={styles.symbol}>
                    {pattern.symbol?.replace('USDT', '/USDT')}
                  </Text>
                  <View style={[styles.directionBadge, { backgroundColor: directionColor }]}>
                    {isLong ? (
                      <TrendingUp size={14} color="#000" />
                    ) : (
                      <TrendingDown size={14} color="#FFF" />
                    )}
                    <Text style={[styles.directionText, { color: isLong ? '#000' : '#FFF' }]}>
                      {pattern.direction}
                    </Text>
                  </View>
                </View>

                <View style={styles.confidenceBadge}>
                  <Text style={styles.confidenceText}>
                    {formatConfidence(pattern.confidence || 70, 1)}
                  </Text>
                </View>
              </View>

              <View style={styles.patternMeta}>
                <View style={[styles.typeBadge, { backgroundColor: directionBg }]}>
                  <Text style={[styles.typeText, { color: directionColor }]}>
                    {pattern.type}
                  </Text>
                </View>
                <Text style={styles.timeframe}>{pattern.timeframe}</Text>
              </View>
            </View>

            {/* Mode Tab Selector */}
            <ModeTabSelector
              activeMode={tradeMode}
              onModeChange={handleModeChange}
              customModeLimit={customModeLimit}
            />

            {/* Mode Banner */}
            <ModeBanner mode={tradeMode} />

            {/* Price Levels - Conditional based on mode */}
            {tradeMode === 'pattern' ? (
              <PatternModeFields
                entry={patternEntry}
                stopLoss={patternSL}
                takeProfit={patternTP}
                direction={pattern?.direction || 'LONG'}
              />
            ) : (
              <CustomModeFields
                entry={customEntry}
                setEntry={setCustomEntry}
                stopLoss={customSL}
                setStopLoss={setCustomSL}
                takeProfit={customTP}
                setTakeProfit={setCustomTP}
                patternEntry={patternEntry}
                patternSL={patternSL}
                patternTP={patternTP}
                direction={pattern?.direction || 'LONG'}
                onReset={handleResetToPattern}
                currentMarketPrice={liveMarketPrice}
              />
            )}

            {/* Current Market Price Display - Both Modes */}
            <View style={styles.currentPriceContainer}>
              <View style={styles.currentPriceRow}>
                <Text style={styles.currentPriceLabel}>Giá Thị Trường Hiện Tại</Text>
                {liveMarketPrice ? (
                  <Text style={styles.currentPriceValue}>
                    ${formatPrice(liveMarketPrice)}
                  </Text>
                ) : (
                  <Text style={styles.currentPriceLoading}>Đang tải...</Text>
                )}
              </View>
              {liveMarketPrice && activeEntry > 0 && (
                <Text style={[
                  styles.currentPriceDiff,
                  { color: liveMarketPrice >= activeEntry ? COLORS.success : COLORS.error }
                ]}>
                  {liveMarketPrice >= activeEntry
                    ? `+${(((liveMarketPrice - activeEntry) / activeEntry) * 100).toFixed(2)}% so với Entry`
                    : `${(((liveMarketPrice - activeEntry) / activeEntry) * 100).toFixed(2)}% so với Entry`}
                </Text>
              )}
            </View>

            {/* NEW: Limit Order Warning Banner */}
            {isLimitOrder && (
              <View style={styles.limitOrderBanner}>
                <Clock size={16} color={COLORS.warning} />
                <View style={styles.limitOrderTextContainer}>
                  <Text style={styles.limitOrderTitle}>Lệnh Giới Hạn (Limit Order)</Text>
                  <Text style={styles.limitOrderDesc}>
                    Lệnh sẽ chờ khớp khi giá thị trường đạt ${formatPrice(customEntry)}
                  </Text>
                  <Text style={styles.limitOrderNote}>
                    Giá TT hiện tại: ${formatPrice(currentMarketPrice)}
                  </Text>
                </View>
              </View>
            )}

            {/* AI Assessment - Custom Mode only */}
            {tradeMode === 'custom' && (
              <AIAssessmentSection
                customEntry={customEntry}
                customSL={customSL}
                customTP={customTP}
                patternEntry={patternEntry}
                patternSL={patternSL}
                patternTP={patternTP}
                direction={pattern?.direction || 'LONG'}
                leverage={leverage}
                onAssessmentChange={handleAIAssessmentChange}
              />
            )}

            {/* Balance Display */}
            <View style={styles.balanceRow}>
              <Text style={styles.balanceLabel}>Số Dư Paper Trade</Text>
              <Text style={styles.balanceValue}>
                ${formatCurrency(balance)}
              </Text>
            </View>

            {/* Position Size Input */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Margin (Ký Quỹ - USDT)</Text>
              <View style={styles.inputWrapper}>
                <DollarSign size={20} color={COLORS.gold} />
                <TextInput
                  style={styles.input}
                  value={positionSize}
                  onChangeText={setPositionSize}
                  keyboardType="decimal-pad"
                  placeholder="100"
                  placeholderTextColor={COLORS.textMuted}
                  selectTextOnFocus
                />
                <Text style={styles.inputSuffix}>USDT</Text>
              </View>
            </View>

            {/* Leverage Selector */}
            <View style={styles.leverageSection}>
              <View style={styles.leverageHeader}>
                <Text style={styles.inputLabel}>Đòn Bẩy</Text>
                <Text style={styles.leverageValue}>{leverage}x</Text>
              </View>
              <View style={styles.leverageRow}>
                {leverageOptions.map((lev) => (
                  <TouchableOpacity
                    key={lev}
                    style={[
                      styles.leverageButton,
                      leverage === lev && styles.leverageButtonActive,
                    ]}
                    onPress={() => setLeverage(lev)}
                  >
                    <Text
                      style={[
                        styles.leverageText,
                        leverage === lev && styles.leverageTextActive,
                      ]}
                    >
                      {lev}x
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {/* Position Value Display */}
              <View style={styles.positionValueRow}>
                <Text style={styles.positionValueLabel}>Giá Trị Vị Thế:</Text>
                <Text style={styles.positionValueAmount}>
                  ${formatCurrency(calculations.positionValue)}
                </Text>
              </View>
            </View>

            {/* Quick Size Buttons */}
            <View style={styles.quickSizeSection}>
              <Text style={styles.quickSizeLabel}>Chọn Nhanh</Text>
              <View style={styles.quickSizeRow}>
                {quickSizes.map((size) => (
                  <TouchableOpacity
                    key={size}
                    style={[
                      styles.quickSizeButton,
                      positionSize === size && styles.quickSizeButtonActive,
                    ]}
                    onPress={() => setPositionSize(size)}
                  >
                    <Text
                      style={[
                        styles.quickSizeText,
                        positionSize === size && styles.quickSizeTextActive,
                      ]}
                    >
                      ${size}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Percentage Buttons */}
            <View style={styles.percentSection}>
              <Text style={styles.percentLabel}>Theo % Số Dư</Text>
              <View style={styles.percentRow}>
                {percentButtons.map((btn) => {
                  const isActive = positionSize === btn.value.toFixed(0);
                  return (
                    <TouchableOpacity
                      key={btn.label}
                      style={[
                        styles.percentButton,
                        isActive && styles.percentButtonActive,
                      ]}
                      onPress={() => setPositionSize(btn.value.toFixed(0))}
                    >
                      <Text style={[
                        styles.percentText,
                        isActive && styles.percentTextActive,
                      ]}>
                        {btn.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Risk/Reward Summary */}
            <View style={styles.summaryCard}>
              <View style={styles.summaryHeader}>
                <Calculator size={18} color={COLORS.gold} />
                <Text style={styles.summaryTitle}>Tính Toán</Text>
                <TouchableOpacity
                  style={styles.summaryInfoButton}
                  onPress={() => setShowCalcTooltip(true)}
                >
                  <HelpCircle size={16} color={COLORS.info} />
                </TouchableOpacity>
              </View>

              <View style={styles.summaryGrid}>
                <View style={styles.summaryItem}>
                  <AlertTriangle size={16} color={COLORS.error} />
                  <Text style={styles.summaryLabel}>Rủi Ro (PnL)</Text>
                  <Text style={[styles.summaryValue, { color: COLORS.error }]}>
                    -${formatCurrency(parseFloat(calculations.riskAmount))}
                  </Text>
                </View>

                <View style={styles.summaryItem}>
                  <Target size={16} color={COLORS.success} />
                  <Text style={styles.summaryLabel}>Lợi Nhuận (PnL)</Text>
                  <Text style={[styles.summaryValue, { color: COLORS.success }]}>
                    +${formatCurrency(parseFloat(calculations.rewardAmount))}
                  </Text>
                </View>

                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>ROI% Rủi Ro</Text>
                  <Text style={[styles.summaryValue, { color: COLORS.error }]}>
                    -{calculations.riskRoePercent}%
                  </Text>
                </View>

                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>ROI% Lợi Nhuận</Text>
                  <Text style={[styles.summaryValue, { color: COLORS.success }]}>
                    +{calculations.roePercent}%
                  </Text>
                </View>

                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Tỷ Lệ R:R</Text>
                  <Text style={[styles.summaryValue, { color: COLORS.gold }]}>
                    1:{calculations.riskReward}
                  </Text>
                </View>

                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Số Lượng</Text>
                  <Text style={styles.summaryValue}>
                    {formatPrice(calculations.quantity)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Calculation Tooltip Modal */}
            <Modal
              visible={showCalcTooltip}
              transparent
              animationType="fade"
              onRequestClose={() => setShowCalcTooltip(false)}
            >
              <TouchableOpacity
                style={styles.calcTooltipOverlay}
                activeOpacity={1}
                onPress={() => setShowCalcTooltip(false)}
              >
                <View style={styles.calcTooltipContent}>
                  <View style={styles.calcTooltipHeader}>
                    <Calculator size={20} color={COLORS.gold} />
                    <Text style={styles.calcTooltipTitle}>Giải Thích Tính Toán</Text>
                    <TouchableOpacity onPress={() => setShowCalcTooltip(false)}>
                      <X size={20} color={COLORS.textMuted} />
                    </TouchableOpacity>
                  </View>

                  <ScrollView showsVerticalScrollIndicator={false}>
                    {/* Tiền Lỗ Tối Đa */}
                    <View style={styles.calcTooltipSection}>
                      <View style={styles.calcTooltipRow}>
                        <AlertTriangle size={14} color={COLORS.error} />
                        <Text style={styles.calcTooltipLabel}>Tiền Lỗ Tối Đa</Text>
                      </View>
                      <Text style={styles.calcTooltipDesc}>
                        Số tiền bạn có thể mất nếu giá chạm mức cắt lỗ.{'\n'}
                        Công thức: |Giá vào - Cắt lỗ| × Số lượng coin
                      </Text>
                    </View>

                    {/* Tiền Lãi Tiềm Năng */}
                    <View style={styles.calcTooltipSection}>
                      <View style={styles.calcTooltipRow}>
                        <Target size={14} color={COLORS.success} />
                        <Text style={styles.calcTooltipLabel}>Tiền Lãi Tiềm Năng</Text>
                      </View>
                      <Text style={styles.calcTooltipDesc}>
                        Số tiền bạn có thể lãi nếu giá chạm mức chốt lời.{'\n'}
                        Công thức: |Chốt lời - Giá vào| × Số lượng coin
                      </Text>
                    </View>

                    {/* % Lỗ Trên Vốn */}
                    <View style={styles.calcTooltipSection}>
                      <View style={styles.calcTooltipRow}>
                        <Percent size={14} color={COLORS.error} />
                        <Text style={styles.calcTooltipLabel}>% Lỗ Trên Vốn (ROI)</Text>
                      </View>
                      <Text style={styles.calcTooltipDesc}>
                        Phần trăm lỗ so với tiền ký quỹ ban đầu.{'\n'}
                        Công thức: (Tiền lỗ / Tiền ký quỹ) × 100%{'\n'}
                        Ví dụ: Ký quỹ $100, Lỗ $50 → -50%
                      </Text>
                    </View>

                    {/* % Lãi Trên Vốn */}
                    <View style={styles.calcTooltipSection}>
                      <View style={styles.calcTooltipRow}>
                        <Percent size={14} color={COLORS.success} />
                        <Text style={styles.calcTooltipLabel}>% Lãi Trên Vốn (ROI)</Text>
                      </View>
                      <Text style={styles.calcTooltipDesc}>
                        Phần trăm lãi so với tiền ký quỹ ban đầu.{'\n'}
                        Công thức: (Tiền lãi / Tiền ký quỹ) × 100%{'\n'}
                        Ví dụ: Ký quỹ $100, Lãi $150 → +150%
                      </Text>
                    </View>

                    {/* Tỷ Lệ Lãi/Lỗ */}
                    <View style={styles.calcTooltipSection}>
                      <View style={styles.calcTooltipRow}>
                        <DollarSign size={14} color={COLORS.gold} />
                        <Text style={styles.calcTooltipLabel}>Tỷ Lệ Lãi/Lỗ (R:R)</Text>
                      </View>
                      <Text style={styles.calcTooltipDesc}>
                        So sánh tiền lãi tiềm năng với tiền lỗ tối đa.{'\n'}
                        1:2 nghĩa là chấp nhận lỗ 1 để có thể lãi 2.{'\n'}
                        Tỷ lệ càng cao càng tốt (khuyến nghị ≥ 1:1.5)
                      </Text>
                    </View>

                    {/* Số Lượng */}
                    <View style={styles.calcTooltipSection}>
                      <View style={styles.calcTooltipRow}>
                        <Calculator size={14} color={COLORS.cyan} />
                        <Text style={styles.calcTooltipLabel}>Số Lượng</Text>
                      </View>
                      <Text style={styles.calcTooltipDesc}>
                        Số lượng coin bạn sẽ mua/bán.{'\n'}
                        Công thức: Giá trị vị thế / Giá vào{'\n'}
                        Giá trị vị thế = Tiền ký quỹ × Đòn bẩy
                      </Text>
                    </View>
                  </ScrollView>

                  <TouchableOpacity
                    style={styles.calcTooltipCloseButton}
                    onPress={() => setShowCalcTooltip(false)}
                  >
                    <Text style={styles.calcTooltipCloseText}>Đã hiểu</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            </Modal>

            {/* Win Rate Info */}
            <View style={styles.winRateCard}>
              <View style={styles.winRateHeader}>
                <CheckCircle size={16} color={COLORS.success} />
                <Text style={styles.winRateTitle}>Tỷ Lệ Thắng Dự Kiến</Text>
              </View>
              <Text style={styles.winRateValue}>
                {/* confidence is 0-100 from patternDetection, not 0-1 */}
                {formatConfidence(pattern.confidence || 70, 1)}
              </Text>
              <Text style={styles.winRateSubtext}>Dựa trên dữ liệu lịch sử</Text>
            </View>

            {/* Mindset Check Button */}
            <TouchableOpacity
              style={styles.mindsetCheckButton}
              onPress={() => setShowMindsetCheck(true)}
              activeOpacity={0.8}
            >
              <Brain size={18} color={COLORS.gold} />
              <Text style={styles.mindsetCheckText}>Kiểm Tra Tâm Thế</Text>
              {mindsetResult && (
                <View style={[styles.scoreBadge, { backgroundColor: getScoreColor(mindsetResult.score) }]}>
                  <Text style={styles.scoreBadgeText}>{mindsetResult.score}</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Open Trade Button */}
            <TouchableOpacity
              style={[styles.openButton, loading && styles.openButtonDisabled]}
              onPress={handleOpenTrade}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  {isLong ? (
                    <TrendingUp size={20} color="#FFFFFF" />
                  ) : (
                    <TrendingDown size={20} color="#FFFFFF" />
                  )}
                  <Text style={styles.openButtonText}>MỞ LỆNH PAPER TRADE</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Disclaimer */}
            <Text style={styles.disclaimer}>
              Đây là giao dịch giả lập. Không có tiền thật nào bị rủi ro.
            </Text>
          </ScrollView>

          {/* Mindset Check Modal */}
          <MindsetCheckModal
            visible={showMindsetCheck}
            pattern={pattern}
            sourceScreen="paper_trade_modal"
            onClose={() => setShowMindsetCheck(false)}
            onResult={(result) => {
              setMindsetResult(result);
              setShowMindsetCheck(false);
            }}
          />

          {/* AI Sư Phụ Trade Guard Modal */}
          <AITradeGuard
            visible={showAIGuard}
            aiState={aiState}
            analyzing={aiAnalyzing}
            onClose={() => setShowAIGuard(false)}
            onUnlock={handleAIUnlock}
            onDismiss={() => {
              dismissMessage();
              setShowAIGuard(false);
            }}
          />

          {/* Success Modal Overlay - Dark themed */}
          {successPosition && (
            <View style={styles.successOverlay}>
              <View style={styles.successModal}>
                <View style={[styles.successIconContainer, successPosition.status === 'PENDING' && styles.pendingIconContainer]}>
                  {successPosition.status === 'PENDING' ? (
                    <Clock size={48} color={COLORS.warning} />
                  ) : (
                    <CheckCircle size={48} color={COLORS.success} />
                  )}
                </View>
                <Text style={styles.successTitle}>
                  {successPosition.status === 'PENDING' ? 'Lệnh Chờ Đã Tạo!' : 'Paper Trade Opened!'}
                </Text>
                <Text style={styles.successSymbol}>
                  {successPosition.symbol?.replace('USDT', '/USDT')} {successPosition.direction}
                </Text>

                {/* Order Type Badge */}
                {successPosition.status === 'PENDING' && (
                  <View style={styles.pendingBadge}>
                    <Clock size={12} color={COLORS.warning} />
                    <Text style={styles.pendingBadgeText}>Lệnh Giới Hạn - Đang Chờ Khớp</Text>
                  </View>
                )}

                {/* Trade Mode Badge */}
                <View style={[styles.tradeModeSuccessBadge, { backgroundColor: successPosition.tradeMode === 'custom' ? COLORS.warning + '20' : COLORS.gold + '20' }]}>
                  <Text style={[styles.tradeModeSuccessText, { color: successPosition.tradeMode === 'custom' ? COLORS.warning : COLORS.gold }]}>
                    {successPosition.tradeMode === 'custom' ? 'Custom Mode' : 'GEM Pattern'}
                  </Text>
                </View>

                <View style={styles.successDetails}>
                  <View style={styles.successRow}>
                    <Text style={styles.successLabel}>
                      {successPosition.status === 'PENDING' ? 'Giá Chờ' : 'Entry'}
                    </Text>
                    <Text style={styles.successValue}>${formatPrice(successPosition.entryPrice)}</Text>
                  </View>
                  {successPosition.status === 'PENDING' && currentMarketPrice && (
                    <View style={styles.successRow}>
                      <Text style={styles.successLabel}>Giá TT Hiện Tại</Text>
                      <Text style={[styles.successValue, { color: COLORS.cyan }]}>${formatPrice(currentMarketPrice)}</Text>
                    </View>
                  )}
                  <View style={styles.successRow}>
                    <Text style={styles.successLabel}>Size</Text>
                    <Text style={styles.successValue}>${formatCurrency(successPosition.positionSize)}</Text>
                  </View>
                  <View style={styles.successRow}>
                    <Text style={[styles.successLabel, { color: COLORS.error }]}>Stop Loss</Text>
                    <Text style={[styles.successValue, { color: COLORS.error }]}>${formatPrice(successPosition.stopLoss)}</Text>
                  </View>
                  <View style={styles.successRow}>
                    <Text style={[styles.successLabel, { color: COLORS.success }]}>Take Profit</Text>
                    <Text style={[styles.successValue, { color: COLORS.success }]}>${formatPrice(successPosition.takeProfit)}</Text>
                  </View>
                </View>

                {successPosition.status === 'PENDING' && (
                  <Text style={styles.pendingNote}>
                    Lệnh sẽ tự động khớp khi giá thị trường đạt giá chờ. Xem lệnh chờ tại màn hình "Lệnh Đang Mở".
                  </Text>
                )}

                <TouchableOpacity
                  style={styles.successButton}
                  onPress={() => {
                    setSuccessPosition(null);
                    onClose();
                    onSuccess?.(successPosition);
                  }}
                >
                  <Text style={styles.successButtonText}>OK</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'flex-end',
  },

  content: {
    backgroundColor: COLORS.glassBg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: SPACING.lg,
    paddingBottom: 20,
    maxHeight: '92%',
  },

  scrollContent: {
    paddingBottom: 60,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.lg,
  },

  title: {
    fontSize: TYPOGRAPHY.fontSize.xxxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },

  subtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginTop: 2,
  },

  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },

  aiOrbButton: {
    padding: 4,
  },

  closeButton: {
    padding: 4,
  },

  // Pattern Card
  patternCard: {
    backgroundColor: GLASS.background,
    borderRadius: 16,
    borderLeftWidth: 4,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },

  patternHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },

  symbolContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  symbol: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },

  directionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 4,
  },

  directionText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },

  confidenceBadge: {
    backgroundColor: 'rgba(106, 91, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.purple,
  },

  confidenceText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gold,
  },

  patternMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },

  typeText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },

  timeframe: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },

  // Price Levels
  levelsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: SPACING.lg,
  },

  levelBox: {
    flex: 1,
    backgroundColor: GLASS.background,
    borderRadius: 12,
    padding: SPACING.md,
    alignItems: 'center',
  },

  levelLabel: {
    fontSize: 9,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textMuted,
    letterSpacing: 0.5,
    marginBottom: 6,
  },

  levelValue: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },

  levelPercent: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 4,
  },

  // Balance
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: GLASS.background,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.3)',
  },

  balanceLabel: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
  },

  balanceValue: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gold,
  },

  // Input
  inputSection: {
    marginBottom: SPACING.md,
  },

  inputLabel: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },

  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GLASS.background,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(106, 91, 255, 0.3)',
    paddingHorizontal: SPACING.lg,
  },

  input: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    paddingVertical: SPACING.lg,
    marginLeft: SPACING.sm,
  },

  inputSuffix: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textMuted,
  },

  // Quick Sizes
  // Leverage Selector Styles
  leverageSection: {
    marginBottom: SPACING.md,
  },

  leverageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },

  leverageValue: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gold,
  },

  leverageRow: {
    flexDirection: 'row',
    gap: 6,
  },

  leverageButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: 10,
    backgroundColor: GLASS.background,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },

  leverageButtonActive: {
    backgroundColor: 'rgba(255, 183, 77, 0.15)',
    borderColor: COLORS.gold,
  },

  leverageText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textMuted,
  },

  leverageTextActive: {
    color: COLORS.gold,
  },

  positionValueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },

  positionValueLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },

  positionValueAmount: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.success,
  },

  quickSizeSection: {
    marginBottom: SPACING.md,
  },

  quickSizeLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginBottom: SPACING.sm,
  },

  quickSizeRow: {
    flexDirection: 'row',
    gap: 8,
  },

  quickSizeButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: 10,
    backgroundColor: GLASS.background,
    alignItems: 'center',
  },

  quickSizeButtonActive: {
    backgroundColor: 'rgba(106, 91, 255, 0.2)',
    borderWidth: 1,
    borderColor: COLORS.purple,
  },

  quickSizeText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textMuted,
  },

  quickSizeTextActive: {
    color: COLORS.gold,
  },

  // Percent Buttons
  percentSection: {
    marginBottom: SPACING.lg,
  },

  percentLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginBottom: SPACING.sm,
  },

  percentRow: {
    flexDirection: 'row',
    gap: 8,
  },

  percentButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    borderRadius: 8,
    backgroundColor: GLASS.background,
    gap: 4,
  },

  percentButtonActive: {
    backgroundColor: 'rgba(106, 91, 255, 0.2)',
    borderWidth: 1,
    borderColor: COLORS.purple,
  },

  percentText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textMuted,
  },

  percentTextActive: {
    color: COLORS.gold,
  },

  // Summary Card
  summaryCard: {
    backgroundColor: GLASS.background,
    borderRadius: 14,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },

  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: SPACING.md,
  },

  summaryTitle: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },

  summaryInfoButton: {
    padding: 4,
  },

  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },

  summaryItem: {
    width: '47%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  summaryLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },

  summaryValue: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginLeft: 'auto',
  },

  // Win Rate Card
  winRateCard: {
    backgroundColor: 'rgba(58, 247, 166, 0.1)',
    borderRadius: 14,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(58, 247, 166, 0.3)',
  },

  winRateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: SPACING.sm,
  },

  winRateTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textSecondary,
  },

  winRateValue: {
    fontSize: 32,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.success,
  },

  winRateSubtext: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    marginTop: 4,
  },

  // Mindset Check Button
  mindsetCheckButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 189, 89, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.3)',
    borderRadius: 12,
    paddingVertical: SPACING.md,
    marginBottom: SPACING.md,
    gap: 8,
  },

  mindsetCheckText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.gold,
  },

  scoreBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 'auto',
    marginRight: SPACING.md,
  },

  scoreBadgeText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: '#FFFFFF',
  },

  // Open Button
  openButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.burgundy,
    paddingVertical: SPACING.lg,
    borderRadius: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.3)',
  },

  openButtonDisabled: {
    opacity: 0.6,
  },

  openButtonText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: '#FFFFFF',
  },

  // Disclaimer
  disclaimer: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.lg,
  },

  // Issue 18: Error fallback styles
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xxl,
  },

  errorTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.error,
    marginBottom: SPACING.md,
  },

  errorMessage: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },

  errorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.error,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    gap: SPACING.sm,
  },

  errorButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: '#FFFFFF',
  },

  // Success Modal - Dark themed
  successOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },

  successModal: {
    backgroundColor: 'rgba(15, 25, 45, 0.85)',
    borderRadius: 16,
    padding: 20,
    paddingTop: 24,
    alignItems: 'center',
    width: '80%',
    maxWidth: 280,
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.3)',
  },

  successIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(74, 222, 128, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(74, 222, 128, 0.5)',
  },

  successTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFBD59',
    marginBottom: 6,
    textAlign: 'center',
  },

  successSymbol: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.lg,
  },

  successDetails: {
    width: '100%',
    backgroundColor: GLASS.background,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },

  successRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },

  successLabel: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
  },

  successValue: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },

  successButton: {
    backgroundColor: '#FFBD59',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 22,
    minWidth: 120,
    alignItems: 'center',
  },

  successButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a2e',
  },

  // Trade Mode Badge in Success Modal
  tradeModeSuccessBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: SPACING.sm,
    marginBottom: SPACING.sm,
  },

  tradeModeSuccessText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },

  // NEW: Limit Order Banner Styles
  limitOrderBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255, 189, 89, 0.15)',
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.3)',
    gap: SPACING.sm,
  },

  limitOrderTextContainer: {
    flex: 1,
  },

  limitOrderTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.warning,
    marginBottom: 4,
  },

  limitOrderDesc: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },

  limitOrderNote: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
  },

  // Current Market Price Display
  currentPriceContainer: {
    backgroundColor: 'rgba(0, 207, 255, 0.1)',
    borderRadius: 12,
    padding: SPACING.md,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(0, 207, 255, 0.25)',
  },

  currentPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  currentPriceLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.cyan,
  },

  currentPriceValue: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },

  currentPriceLoading: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    fontStyle: 'italic',
  },

  currentPriceDiff: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    marginTop: 4,
    textAlign: 'right',
  },

  // NEW: Pending Order Styles in Success Modal
  pendingIconContainer: {
    backgroundColor: 'rgba(255, 189, 89, 0.15)',
    borderColor: 'rgba(255, 189, 89, 0.5)',
  },

  pendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 189, 89, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
    marginBottom: SPACING.sm,
  },

  pendingBadgeText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.warning,
  },

  pendingNote: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.sm,
    lineHeight: 18,
  },

  // Calculation Tooltip Modal Styles
  calcTooltipOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },

  calcTooltipContent: {
    backgroundColor: COLORS.glassBg,
    borderRadius: 16,
    padding: SPACING.lg,
    maxWidth: 360,
    width: '100%',
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: COLORS.gold + '30',
  },

  calcTooltipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
    gap: 10,
  },

  calcTooltipTitle: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gold,
  },

  calcTooltipSection: {
    backgroundColor: GLASS.background,
    borderRadius: 10,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },

  calcTooltipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },

  calcTooltipLabel: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },

  calcTooltipDesc: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },

  calcTooltipCloseButton: {
    backgroundColor: COLORS.gold,
    paddingVertical: SPACING.sm,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: SPACING.sm,
  },

  calcTooltipCloseText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.bgDarkest,
  },
});

/**
 * Issue 18: Wrapper component with ErrorBoundary
 * Prevents crashes from null pattern or calculation errors
 */
const PaperTradeModal = ({ visible, pattern, onClose, onSuccess }) => {
  // Early return if not visible or no pattern
  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <ErrorBoundary
        showDetails={__DEV__}
        fallback={({ error, resetError }) => (
          <View style={styles.overlay}>
            <View style={styles.content}>
              <View style={styles.errorContainer}>
                <Text style={styles.errorTitle}>Đã xảy ra lỗi</Text>
                <Text style={styles.errorMessage}>
                  Không thể mở Paper Trade. Vui lòng thử lại.
                </Text>
                <TouchableOpacity style={styles.errorButton} onPress={onClose}>
                  <X size={18} color="#FFF" />
                  <Text style={styles.errorButtonText}>Đóng</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      >
        <PaperTradeContent
          pattern={pattern}
          onClose={onClose}
          onSuccess={onSuccess}
        />
      </ErrorBoundary>
    </Modal>
  );
};

export default PaperTradeModal;
