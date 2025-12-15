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
} from 'lucide-react-native';
import { useAuth } from '../../../contexts/AuthContext';
import paperTradeService from '../../../services/paperTradeService';
import { COLORS, SPACING, TYPOGRAPHY, GLASS } from '../../../utils/tokens';
import { formatPrice, formatConfidence, formatCurrency } from '../../../utils/formatters';
import ErrorBoundary from '../../../components/ErrorBoundary';
import { MindsetCheckModal, AITradeGuard } from '../../../components/Trading';
import { SCORE_COLORS } from '../../../services/mindsetAdvisorService';
import { AIAvatarOrb } from '../../../components/AITrader';
import useAITradeAnalysis from '../../../hooks/useAITradeAnalysis';

/**
 * Inner content component - wrapped by ErrorBoundary
 */
const PaperTradeContent = ({ pattern, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [positionSize, setPositionSize] = useState('100');
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState(0);
  const [successPosition, setSuccessPosition] = useState(null); // For success modal

  // Mindset check state
  const [showMindsetCheck, setShowMindsetCheck] = useState(false);
  const [mindsetResult, setMindsetResult] = useState(null);

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

  // Helper to get score color
  const getScoreColor = (score) => {
    if (score >= 80) return SCORE_COLORS.ready;
    if (score >= 60) return SCORE_COLORS.prepare;
    if (score >= 40) return SCORE_COLORS.caution;
    return SCORE_COLORS.stop;
  };

  // Load balance on mount
  useEffect(() => {
    loadBalance();
  }, []);

  const loadBalance = async () => {
    try {
      await paperTradeService.init();
      setBalance(paperTradeService.getBalance() || 10000);
    } catch (error) {
      console.error('[PaperTrade] Balance load error:', error);
      setBalance(10000); // Default fallback
    }
  };

  // Issue 18: Safe null checks for pattern properties
  if (!pattern) return null;

  const isLong = pattern.direction === 'LONG';
  const directionColor = isLong ? COLORS.success : COLORS.error;
  const directionBg = isLong ? 'rgba(58, 247, 166, 0.15)' : 'rgba(255, 107, 107, 0.15)';

  // Get take profit value (support multiple field names from different patterns)
  const getTakeProfit = () => {
    return pattern.target || pattern.takeProfit || pattern.takeProfit1 || pattern.targets?.[0] || (pattern.entry * (isLong ? 1.02 : 0.98));
  };

  // Calculate values
  const calculations = useMemo(() => {
    const size = parseFloat(positionSize) || 0;
    const entry = pattern.entry || 0;
    const sl = pattern.stopLoss || 0;
    // Support multiple target field names
    const tp = getTakeProfit();

    const quantity = entry > 0 ? size / entry : 0;

    const riskPercent = entry > 0 ? ((sl - entry) / entry) * 100 : 0;

    const rewardPercent = entry > 0 ? ((tp - entry) / entry) * 100 : 0;

    const riskAmount = Math.abs(entry - sl) * quantity;
    const rewardAmount = Math.abs(tp - entry) * quantity;

    const rr = riskAmount > 0 ? rewardAmount / riskAmount : 0;

    return {
      quantity,
      riskPercent: Math.abs(riskPercent).toFixed(2),
      rewardPercent: Math.abs(rewardPercent).toFixed(2),
      riskAmount: riskAmount.toFixed(2),
      rewardAmount: rewardAmount.toFixed(2),
      riskReward: rr.toFixed(1),
      takeProfit: tp,
    };
  }, [positionSize, pattern, isLong]);

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

    try {
      setLoading(true);

      // AI Sư Phụ pre-trade analysis
      const tradeData = {
        symbol: pattern.symbol,
        direction: pattern.direction,
        entry: pattern.entry,
        stopLoss: pattern.stopLoss,
        takeProfit: getTakeProfit(),
        positionSize: size,
        patternType: pattern.type,
        confidence: pattern.confidence,
      };

      const aiResult = await analyzeBeforeTrade(tradeData, {
        marketData: pattern,
        mindsetScore: mindsetResult?.score,
      });

      // If AI blocks the trade, show AI guard modal
      if (!aiResult.allowed) {
        setShowAIGuard(true);
        setLoading(false);
        return;
      }

      const position = await paperTradeService.openPosition({
        pattern,
        positionSize: size,
        userId: user?.id,
      });

      // AI Sư Phụ post-trade analysis (update karma)
      await analyzeAfterTrade(
        { ...tradeData, id: position.id },
        { result: 'opened' }
      );

      // Show custom success modal instead of native Alert
      setSuccessPosition({ ...position, positionSize: size });
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
                {/* AI Sư Phụ Orb */}
                <TouchableOpacity
                  style={styles.aiOrbButton}
                  onPress={() => aiState.showMessage && setShowAIGuard(true)}
                  activeOpacity={0.8}
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

            {/* Price Levels */}
            <View style={styles.levelsContainer}>
              <View style={styles.levelBox}>
                <Text style={styles.levelLabel}>ĐIỂM VÀO</Text>
                <Text style={styles.levelValue}>${formatPrice(pattern.entry)}</Text>
              </View>

              <View style={styles.levelBox}>
                <Text style={[styles.levelLabel, { color: COLORS.error }]}>CẮT LỖ</Text>
                <Text style={[styles.levelValue, { color: COLORS.error }]}>
                  ${formatPrice(pattern.stopLoss)}
                </Text>
                <Text style={styles.levelPercent}>({calculations.riskPercent}%)</Text>
              </View>

              <View style={styles.levelBox}>
                <Text style={[styles.levelLabel, { color: COLORS.success }]}>CHỐT LỜI</Text>
                <Text style={[styles.levelValue, { color: COLORS.success }]}>
                  ${formatPrice(calculations.takeProfit)}
                </Text>
                <Text style={[styles.levelPercent, { color: COLORS.success }]}>
                  (+{calculations.rewardPercent}%)
                </Text>
              </View>
            </View>

            {/* Balance Display */}
            <View style={styles.balanceRow}>
              <Text style={styles.balanceLabel}>Số Dư Paper Trade</Text>
              <Text style={styles.balanceValue}>
                ${formatCurrency(balance)}
              </Text>
            </View>

            {/* Position Size Input */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Số Tiền Đầu Tư (USDT)</Text>
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
              </View>

              <View style={styles.summaryGrid}>
                <View style={styles.summaryItem}>
                  <AlertTriangle size={16} color={COLORS.error} />
                  <Text style={styles.summaryLabel}>Rủi Ro</Text>
                  <Text style={[styles.summaryValue, { color: COLORS.error }]}>
                    -${formatCurrency(parseFloat(calculations.riskAmount))}
                  </Text>
                </View>

                <View style={styles.summaryItem}>
                  <Target size={16} color={COLORS.success} />
                  <Text style={styles.summaryLabel}>Lợi Nhuận</Text>
                  <Text style={[styles.summaryValue, { color: COLORS.success }]}>
                    +${formatCurrency(parseFloat(calculations.rewardAmount))}
                  </Text>
                </View>

                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Tỷ Lệ RR</Text>
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
                <View style={styles.successIconContainer}>
                  <CheckCircle size={48} color={COLORS.success} />
                </View>
                <Text style={styles.successTitle}>Paper Trade Opened!</Text>
                <Text style={styles.successSymbol}>
                  {successPosition.symbol?.replace('USDT', '/USDT')} {successPosition.direction}
                </Text>

                <View style={styles.successDetails}>
                  <View style={styles.successRow}>
                    <Text style={styles.successLabel}>Entry</Text>
                    <Text style={styles.successValue}>${formatPrice(successPosition.entryPrice)}</Text>
                  </View>
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
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
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
    borderColor: 'rgba(100, 150, 200, 0.25)',
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
    color: '#FFFFFF',
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
    backgroundColor: 'rgba(245, 245, 245, 0.95)',
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
