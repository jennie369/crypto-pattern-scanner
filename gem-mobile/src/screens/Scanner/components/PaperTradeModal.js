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
  Alert,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
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
} from 'lucide-react-native';
import { useAuth } from '../../../contexts/AuthContext';
import paperTradeService from '../../../services/paperTradeService';
import { COLORS, SPACING, TYPOGRAPHY, GLASS } from '../../../utils/tokens';

const PaperTradeModal = ({ visible, pattern, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [positionSize, setPositionSize] = useState('100');
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState(0);

  // Load balance on mount
  useEffect(() => {
    if (visible) {
      loadBalance();
    }
  }, [visible]);

  const loadBalance = async () => {
    await paperTradeService.init();
    setBalance(paperTradeService.getBalance());
  };

  if (!pattern) return null;

  const isLong = pattern.direction === 'LONG';
  const directionColor = isLong ? COLORS.success : COLORS.error;
  const directionBg = isLong ? 'rgba(58, 247, 166, 0.15)' : 'rgba(255, 107, 107, 0.15)';

  // Calculate values
  const calculations = useMemo(() => {
    const size = parseFloat(positionSize) || 0;
    const entry = pattern.entry || 0;
    const sl = pattern.stopLoss || 0;
    const tp = pattern.targets?.[0] || pattern.entry * (isLong ? 1.02 : 0.98);

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

  // Format price based on value
  const formatPrice = (price) => {
    if (!price) return '--';
    if (price >= 1000)
      return `${price.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
    if (price >= 1) return `${price.toFixed(4)}`;
    return `${price.toFixed(6)}`;
  };

  // Handle open trade
  const handleOpenTrade = async () => {
    const size = parseFloat(positionSize);

    if (!size || size <= 0) {
      Alert.alert('Loi', 'Vui long nhap so tien hop le');
      return;
    }

    if (size > balance) {
      Alert.alert('Loi', `So du khong du. So du hien tai: $${balance.toFixed(2)}`);
      return;
    }

    try {
      setLoading(true);

      const position = await paperTradeService.openPosition({
        pattern,
        positionSize: size,
        userId: user?.id,
      });

      Alert.alert(
        'Paper Trade Opened!',
        `${position.symbol.replace('USDT', '/USDT')} ${position.direction}\n\n` +
          `Entry: $${formatPrice(position.entryPrice)}\n` +
          `Size: $${size.toFixed(2)}\n` +
          `Stop Loss: $${formatPrice(position.stopLoss)}\n` +
          `Take Profit: $${formatPrice(position.takeProfit)}`,
        [
          {
            text: 'OK',
            onPress: () => {
              onClose();
              onSuccess?.(position);
            },
          },
        ]
      );
    } catch (error) {
      console.error('[PaperTrade] Open error:', error);
      Alert.alert('Loi', error.message || 'Khong the mo position');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.content}>
          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {/* Header */}
            <View style={styles.header}>
              <View>
                <Text style={styles.title}>Paper Trade</Text>
                <Text style={styles.subtitle}>Giao dich gia lap</Text>
              </View>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <X size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
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
                    {Math.round((pattern.confidence || 0.7) * 100)}%
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
                <Text style={styles.levelLabel}>DIEM VAO</Text>
                <Text style={styles.levelValue}>${formatPrice(pattern.entry)}</Text>
              </View>

              <View style={styles.levelBox}>
                <Text style={[styles.levelLabel, { color: COLORS.error }]}>CAT LO</Text>
                <Text style={[styles.levelValue, { color: COLORS.error }]}>
                  ${formatPrice(pattern.stopLoss)}
                </Text>
                <Text style={styles.levelPercent}>({calculations.riskPercent}%)</Text>
              </View>

              <View style={styles.levelBox}>
                <Text style={[styles.levelLabel, { color: COLORS.success }]}>CHOT LOI</Text>
                <Text style={[styles.levelValue, { color: COLORS.success }]}>
                  ${formatPrice(pattern.targets?.[0])}
                </Text>
                <Text style={[styles.levelPercent, { color: COLORS.success }]}>
                  (+{calculations.rewardPercent}%)
                </Text>
              </View>
            </View>

            {/* Balance Display */}
            <View style={styles.balanceRow}>
              <Text style={styles.balanceLabel}>So Du Paper Trade</Text>
              <Text style={styles.balanceValue}>${balance.toFixed(2)}</Text>
            </View>

            {/* Position Size Input */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>So Tien Dau Tu (USDT)</Text>
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
              <Text style={styles.quickSizeLabel}>Chon Nhanh</Text>
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
              <Text style={styles.percentLabel}>Theo % So Du</Text>
              <View style={styles.percentRow}>
                {percentButtons.map((btn) => (
                  <TouchableOpacity
                    key={btn.label}
                    style={styles.percentButton}
                    onPress={() => setPositionSize(btn.value.toFixed(0))}
                  >
                    <Percent size={12} color={COLORS.textMuted} />
                    <Text style={styles.percentText}>{btn.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Risk/Reward Summary */}
            <View style={styles.summaryCard}>
              <View style={styles.summaryHeader}>
                <Calculator size={18} color={COLORS.gold} />
                <Text style={styles.summaryTitle}>Tinh Toan</Text>
              </View>

              <View style={styles.summaryGrid}>
                <View style={styles.summaryItem}>
                  <AlertTriangle size={16} color={COLORS.error} />
                  <Text style={styles.summaryLabel}>Rui Ro</Text>
                  <Text style={[styles.summaryValue, { color: COLORS.error }]}>
                    -${calculations.riskAmount}
                  </Text>
                </View>

                <View style={styles.summaryItem}>
                  <Target size={16} color={COLORS.success} />
                  <Text style={styles.summaryLabel}>Loi Nhuan</Text>
                  <Text style={[styles.summaryValue, { color: COLORS.success }]}>
                    +${calculations.rewardAmount}
                  </Text>
                </View>

                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Ty Le RR</Text>
                  <Text style={[styles.summaryValue, { color: COLORS.gold }]}>
                    1:{calculations.riskReward}
                  </Text>
                </View>

                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>So Luong</Text>
                  <Text style={styles.summaryValue}>{calculations.quantity.toFixed(6)}</Text>
                </View>
              </View>
            </View>

            {/* Win Rate Info */}
            <View style={styles.winRateCard}>
              <View style={styles.winRateHeader}>
                <CheckCircle size={16} color={COLORS.success} />
                <Text style={styles.winRateTitle}>Ty Le Thang Du Kien</Text>
              </View>
              <Text style={styles.winRateValue}>
                {Math.round((pattern.confidence || 0.7) * 100)}%
              </Text>
              <Text style={styles.winRateSubtext}>Dua tren du lieu lich su</Text>
            </View>

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
                  <Text style={styles.openButtonText}>Mo Paper Trade</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Disclaimer */}
            <Text style={styles.disclaimer}>
              Day la giao dich gia lap. Khong co tien that nao bi rui ro.
            </Text>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
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
    paddingBottom: 40,
    maxHeight: '90%',
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

  percentText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textMuted,
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
});

export default PaperTradeModal;
