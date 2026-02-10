/**
 * GEM Scanner - Take Profit / Stop Loss Section Component
 * TP/SL inputs with trigger types, presets, and P&L preview
 * Supports both Price mode and PnL mode (like Binance Futures)
 */

import React, { memo, useCallback, useState, useMemo, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Switch,
} from 'react-native';
import { Target, Shield, TrendingUp, TrendingDown, HelpCircle, Lock, DollarSign, BarChart2 } from 'lucide-react-native';
import { useSettings } from '../../contexts/SettingsContext';
import { TPSL_CONFIG } from '../../constants/tradingConstants';
import {
  calculateTPPrice,
  calculateSLPrice,
  calculatePnLAtPrice,
  calculateRiskReward,
  formatPrice,
  formatUSDT,
  formatPercent,
} from '../../services/tradingCalculations';

// Input modes for TP/SL
const INPUT_MODES = {
  PRICE: 'price',   // Enter price directly
  PNL: 'pnl',       // Enter PnL amount, auto-calculate price
};

const TPSLSection = ({
  entryPrice = 0,
  quantity = 0,
  direction = 'LONG',
  leverage = 1,
  // TP
  tpEnabled = false,
  tpPrice = null,
  onTPEnabledChange,
  onTPPriceChange,
  // SL
  slEnabled = false,
  slPrice = null,
  onSLEnabledChange,
  onSLPriceChange,
  // General
  disabled = false,
  showRiskReward = true,
  locked = false,  // For Pattern mode - TP/SL are locked
  lockedText = null,  // Text to show when locked
}) => {
  const { colors, gradients, glass, settings, SPACING, TYPOGRAPHY, t } = useSettings();

  const [showTPInput, setShowTPInput] = useState(false);
  const [showSLInput, setShowSLInput] = useState(false);

  // Input mode states (Price vs PnL)
  const [tpInputMode, setTPInputMode] = useState(INPUT_MODES.PRICE);
  const [slInputMode, setSLInputMode] = useState(INPUT_MODES.PRICE);

  // PnL amount states (for PnL mode input)
  const [tpPnlInput, setTPPnlInput] = useState('');
  const [slPnlInput, setSLPnlInput] = useState('');

  const styles = useMemo(() => StyleSheet.create({
    container: {
      marginBottom: SPACING.md,
      backgroundColor: settings.theme === 'light' ? colors.bgDarkest : (glass.background || 'rgba(255, 255, 255, 0.02)'),
      borderRadius: 12,
      padding: SPACING.md,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    // Header
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: SPACING.md,
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.sm,
    },
    headerTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    lockedBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
    },
    lockedText: {
      fontSize: 9,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    helpButton: {
      padding: 4,
    },
    // Section
    section: {
      marginBottom: SPACING.md,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    sectionTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.xs,
    },
    sectionTitle: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    sectionContent: {
      marginTop: SPACING.sm,
      paddingLeft: SPACING.lg,
    },
    // Price Input
    priceInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      borderRadius: 8,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.1)',
      overflow: 'hidden',
    },
    inputError: {
      borderColor: colors.error,
    },
    inputLocked: {
      borderColor: 'rgba(255, 255, 255, 0.2)',
      borderStyle: 'dashed',
      backgroundColor: 'rgba(255, 255, 255, 0.03)',
    },
    priceInput: {
      flex: 1,
      paddingVertical: SPACING.sm,
      paddingHorizontal: SPACING.md,
      fontSize: 14,
      fontWeight: '600',
      color: colors.textPrimary,
    },
    percentBadge: {
      paddingVertical: SPACING.xs,
      paddingHorizontal: SPACING.sm,
      backgroundColor: 'rgba(58, 247, 166, 0.15)',
      fontSize: 11,
      fontWeight: '700',
      color: colors.success,
    },
    percentBadgeLoss: {
      backgroundColor: 'rgba(255, 107, 107, 0.15)',
      color: colors.error,
    },
    errorText: {
      fontSize: 10,
      color: colors.error,
      marginTop: SPACING.xs,
    },
    // Presets
    presetRow: {
      flexDirection: 'row',
      gap: SPACING.xs,
      marginTop: SPACING.sm,
    },
    presetButton: {
      flex: 1,
      paddingVertical: SPACING.xs,
      borderRadius: 4,
      backgroundColor: 'rgba(58, 247, 166, 0.1)',
      borderWidth: 1,
      borderColor: 'transparent',
      alignItems: 'center',
    },
    presetButtonActive: {
      backgroundColor: 'rgba(58, 247, 166, 0.2)',
      borderColor: colors.success,
    },
    presetButtonLoss: {
      backgroundColor: 'rgba(255, 107, 107, 0.1)',
    },
    presetButtonLossActive: {
      backgroundColor: 'rgba(255, 107, 107, 0.2)',
      borderColor: colors.error,
    },
    presetText: {
      fontSize: 10,
      fontWeight: '600',
      color: colors.success,
    },
    presetTextLoss: {
      color: colors.error,
    },
    presetTextActive: {
      fontWeight: '700',
    },
    presetTextLossActive: {
      color: colors.error,
      fontWeight: '700',
    },
    // PnL Preview
    pnlPreview: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.xs,
      marginTop: SPACING.sm,
      padding: SPACING.sm,
      backgroundColor: 'rgba(58, 247, 166, 0.1)',
      borderRadius: 6,
    },
    pnlPreviewLoss: {
      backgroundColor: 'rgba(255, 107, 107, 0.1)',
    },
    pnlText: {
      fontSize: 11,
      color: colors.success,
    },
    pnlTextLoss: {
      color: colors.error,
    },
    pnlValue: {
      fontWeight: '700',
    },
    pnlValueLoss: {
      fontWeight: '700',
      color: colors.error,
    },
    // Risk:Reward
    riskRewardContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingTop: SPACING.md,
      borderTopWidth: 1,
      borderTopColor: 'rgba(255, 255, 255, 0.05)',
    },
    riskRewardLabel: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    riskRewardValue: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.sm,
    },
    riskRewardRatio: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    goodRatioBadge: {
      backgroundColor: colors.success,
      paddingHorizontal: SPACING.sm,
      paddingVertical: 2,
      borderRadius: 4,
    },
    goodRatioText: {
      fontSize: 9,
      fontWeight: '700',
      color: '#000',
    },
    // Input Mode Toggle (Price vs PnL)
    inputModeToggle: {
      flexDirection: 'row',
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      borderRadius: 6,
      padding: 2,
      marginBottom: SPACING.sm,
    },
    inputModeTab: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
      paddingVertical: 6,
      paddingHorizontal: 8,
      borderRadius: 4,
    },
    inputModeTabActive: {
      backgroundColor: 'rgba(58, 247, 166, 0.2)',
    },
    inputModeTabLoss: {
      // Default style for loss tabs
    },
    inputModeTabLossActive: {
      backgroundColor: 'rgba(255, 107, 107, 0.2)',
    },
    inputModeText: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.textMuted,
    },
    inputModeTextActive: {
      color: colors.success,
    },
    inputModeTextLossActive: {
      color: colors.error,
    },
    // PnL Input Mode
    pnlInputWrapper: {
      // Container for PnL input and calculated price
    },
    pnlInputPrefix: {
      paddingLeft: SPACING.md,
      fontSize: 16,
      fontWeight: '700',
      color: colors.success,
    },
    pnlInputPrefixLoss: {
      color: colors.error,
    },
    pnlInputSuffix: {
      paddingRight: SPACING.md,
      fontSize: 12,
      fontWeight: '600',
      color: colors.textMuted,
    },
    // Calculated Price Row (shown in PnL mode)
    calculatedPriceRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginTop: 6,
      paddingLeft: 4,
    },
    calculatedPriceLabel: {
      fontSize: 11,
      color: colors.textMuted,
    },
    calculatedPriceValue: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.success,
    },
    calculatedPriceValueLoss: {
      color: colors.error,
    },
    calculatedPricePercent: {
      fontSize: 10,
      color: colors.success,
      opacity: 0.8,
    },
    calculatedPricePercentLoss: {
      color: colors.error,
    },
  }), [colors, settings.theme, glass, SPACING, TYPOGRAPHY]);

  // Calculate TP/SL percentages from entry
  const tpPercent = useMemo(() => {
    if (!tpPrice || !entryPrice) return 0;
    const diff = direction === 'LONG'
      ? ((tpPrice - entryPrice) / entryPrice) * 100
      : ((entryPrice - tpPrice) / entryPrice) * 100;
    return diff;
  }, [tpPrice, entryPrice, direction]);

  const slPercent = useMemo(() => {
    if (!slPrice || !entryPrice) return 0;
    const diff = direction === 'LONG'
      ? ((entryPrice - slPrice) / entryPrice) * 100
      : ((slPrice - entryPrice) / entryPrice) * 100;
    return diff;
  }, [slPrice, entryPrice, direction]);

  // ═══════════════════════════════════════════════════════════
  // PnL Mode: Calculate price from PnL amount
  // Formula:
  // LONG TP: price = entryPrice + (pnlAmount / quantity)
  // LONG SL: price = entryPrice - (lossAmount / quantity)
  // SHORT TP: price = entryPrice - (pnlAmount / quantity)
  // SHORT SL: price = entryPrice + (lossAmount / quantity)
  // ═══════════════════════════════════════════════════════════

  // Calculate TP price from PnL amount
  const calculateTPFromPnL = useCallback((pnlAmount) => {
    if (!entryPrice || !quantity || quantity <= 0 || !pnlAmount) return null;
    const pnl = Math.abs(parseFloat(pnlAmount) || 0);
    if (pnl <= 0) return null;

    // For TP, pnl is always positive (profit)
    const priceChange = pnl / quantity;
    const newPrice = direction === 'LONG'
      ? entryPrice + priceChange
      : entryPrice - priceChange;

    return Math.max(0, newPrice);
  }, [entryPrice, quantity, direction]);

  // Calculate SL price from loss amount
  const calculateSLFromPnL = useCallback((lossAmount) => {
    if (!entryPrice || !quantity || quantity <= 0 || !lossAmount) return null;
    const loss = Math.abs(parseFloat(lossAmount) || 0);
    if (loss <= 0) return null;

    // For SL, loss is always positive (we lose this amount)
    const priceChange = loss / quantity;
    const newPrice = direction === 'LONG'
      ? entryPrice - priceChange
      : entryPrice + priceChange;

    return Math.max(0, newPrice);
  }, [entryPrice, quantity, direction]);

  // Handle TP PnL input change
  const handleTPPnlInputChange = useCallback((text) => {
    const cleaned = text.replace(/,/g, '').replace(/[^0-9.]/g, '');
    setTPPnlInput(cleaned);

    const calculatedPrice = calculateTPFromPnL(cleaned);
    if (calculatedPrice && onTPPriceChange) {
      onTPPriceChange(calculatedPrice);
    }
  }, [calculateTPFromPnL, onTPPriceChange]);

  // Handle SL PnL input change
  const handleSLPnlInputChange = useCallback((text) => {
    const cleaned = text.replace(/,/g, '').replace(/[^0-9.]/g, '');
    setSLPnlInput(cleaned);

    const calculatedPrice = calculateSLFromPnL(cleaned);
    if (calculatedPrice && onSLPriceChange) {
      onSLPriceChange(calculatedPrice);
    }
  }, [calculateSLFromPnL, onSLPriceChange]);

  // Sync PnL input when TP price changes (for display when in Price mode)
  useEffect(() => {
    if (tpInputMode === INPUT_MODES.PRICE && tpPrice && quantity > 0 && entryPrice > 0) {
      // Calculate what PnL would be for current TP price
      const pnl = calculatePnLAtPrice(entryPrice, tpPrice, quantity, direction);
      if (pnl !== null && pnl > 0) {
        setTPPnlInput(pnl.toFixed(2));
      }
    }
  }, [tpPrice, tpInputMode, quantity, entryPrice, direction]);

  // Sync PnL input when SL price changes (for display when in Price mode)
  useEffect(() => {
    if (slInputMode === INPUT_MODES.PRICE && slPrice && quantity > 0 && entryPrice > 0) {
      // Calculate what loss would be for current SL price
      const pnl = calculatePnLAtPrice(entryPrice, slPrice, quantity, direction);
      if (pnl !== null) {
        setSLPnlInput(Math.abs(pnl).toFixed(2));
      }
    }
  }, [slPrice, slInputMode, quantity, entryPrice, direction]);

  // Recalculate TP price when in PnL mode and quantity/entryPrice/direction changes
  useEffect(() => {
    if (tpInputMode === INPUT_MODES.PNL && tpPnlInput && quantity > 0 && entryPrice > 0) {
      const calculatedPrice = calculateTPFromPnL(tpPnlInput);
      if (calculatedPrice && calculatedPrice !== tpPrice && onTPPriceChange) {
        onTPPriceChange(calculatedPrice);
      }
    }
  }, [tpInputMode, quantity, entryPrice, direction, tpPnlInput, calculateTPFromPnL, tpPrice, onTPPriceChange]);

  // Recalculate SL price when in PnL mode and quantity/entryPrice/direction changes
  useEffect(() => {
    if (slInputMode === INPUT_MODES.PNL && slPnlInput && quantity > 0 && entryPrice > 0) {
      const calculatedPrice = calculateSLFromPnL(slPnlInput);
      if (calculatedPrice && calculatedPrice !== slPrice && onSLPriceChange) {
        onSLPriceChange(calculatedPrice);
      }
    }
  }, [slInputMode, quantity, entryPrice, direction, slPnlInput, calculateSLFromPnL, slPrice, onSLPriceChange]);

  // Calculate P&L at TP/SL
  const tpPnL = useMemo(() => {
    if (!tpPrice || !entryPrice || !quantity) return null;
    return calculatePnLAtPrice(entryPrice, tpPrice, quantity, direction);
  }, [tpPrice, entryPrice, quantity, direction]);

  const slPnL = useMemo(() => {
    if (!slPrice || !entryPrice || !quantity) return null;
    return calculatePnLAtPrice(entryPrice, slPrice, quantity, direction);
  }, [slPrice, entryPrice, quantity, direction]);

  // Calculate Risk:Reward
  const riskReward = useMemo(() => {
    if (!tpPrice || !slPrice || !entryPrice) return null;
    return calculateRiskReward(entryPrice, tpPrice, slPrice, direction);
  }, [tpPrice, slPrice, entryPrice, direction]);

  // Handle TP preset
  const handleTPPreset = useCallback((percent) => {
    const price = calculateTPPrice(entryPrice, percent, direction);
    if (onTPPriceChange) {
      onTPPriceChange(price);
    }
    if (!tpEnabled && onTPEnabledChange) {
      onTPEnabledChange(true);
    }
  }, [entryPrice, direction, tpEnabled, onTPPriceChange, onTPEnabledChange]);

  // Handle SL preset
  const handleSLPreset = useCallback((percent) => {
    const price = calculateSLPrice(entryPrice, percent, direction);
    if (onSLPriceChange) {
      onSLPriceChange(price);
    }
    if (!slEnabled && onSLEnabledChange) {
      onSLEnabledChange(true);
    }
  }, [entryPrice, direction, slEnabled, onSLPriceChange, onSLEnabledChange]);

  // Handle direct price input - strip commas and non-numeric chars
  const handleTPPriceInput = useCallback((text) => {
    // Remove commas and any non-numeric chars except decimal point
    const cleaned = text.replace(/,/g, '').replace(/[^0-9.]/g, '');
    const price = parseFloat(cleaned) || 0;
    if (onTPPriceChange) {
      onTPPriceChange(price);
    }
  }, [onTPPriceChange]);

  const handleSLPriceInput = useCallback((text) => {
    // Remove commas and any non-numeric chars except decimal point
    const cleaned = text.replace(/,/g, '').replace(/[^0-9.]/g, '');
    const price = parseFloat(cleaned) || 0;
    if (onSLPriceChange) {
      onSLPriceChange(price);
    }
  }, [onSLPriceChange]);

  // Validate TP/SL
  const tpError = useMemo(() => {
    if (!tpEnabled || !tpPrice) return null;
    if (direction === 'LONG' && tpPrice <= entryPrice) {
      return 'TP phải cao hơn giá vào lệnh';
    }
    if (direction === 'SHORT' && tpPrice >= entryPrice) {
      return 'TP phải thấp hơn giá vào lệnh';
    }
    return null;
  }, [tpEnabled, tpPrice, entryPrice, direction]);

  const slError = useMemo(() => {
    if (!slEnabled || !slPrice) return null;
    if (direction === 'LONG' && slPrice >= entryPrice) {
      return 'SL phải thấp hơn giá vào lệnh';
    }
    if (direction === 'SHORT' && slPrice <= entryPrice) {
      return 'SL phải cao hơn giá vào lệnh';
    }
    return null;
  }, [slEnabled, slPrice, entryPrice, direction]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>TP/SL</Text>
          {locked && (
            <View style={styles.lockedBadge}>
              <Lock size={10} color={colors.textSecondary} />
              {lockedText && <Text style={styles.lockedText}>{lockedText}</Text>}
            </View>
          )}
        </View>
        <TouchableOpacity style={styles.helpButton}>
          <HelpCircle size={14} color={colors.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Take Profit Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Target size={16} color={colors.success} />
            <Text style={styles.sectionTitle}>Chốt lời (TP)</Text>
          </View>
          <Switch
            value={tpEnabled}
            onValueChange={onTPEnabledChange}
            trackColor={{ false: 'rgba(255, 255, 255, 0.1)', true: 'rgba(58, 247, 166, 0.3)' }}
            thumbColor={tpEnabled ? colors.success : colors.textMuted}
            disabled={Boolean(disabled || locked)}
          />
        </View>

        {tpEnabled && (
          <View style={styles.sectionContent}>
            {/* Input Mode Toggle - Price vs PnL */}
            {!locked && (
              <View style={styles.inputModeToggle}>
                <TouchableOpacity
                  style={[
                    styles.inputModeTab,
                    tpInputMode === INPUT_MODES.PRICE && styles.inputModeTabActive,
                  ]}
                  onPress={() => setTPInputMode(INPUT_MODES.PRICE)}
                  disabled={disabled}
                >
                  <BarChart2 size={12} color={tpInputMode === INPUT_MODES.PRICE ? colors.success : colors.textMuted} />
                  <Text style={[
                    styles.inputModeText,
                    tpInputMode === INPUT_MODES.PRICE && styles.inputModeTextActive,
                  ]}>Giá</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.inputModeTab,
                    tpInputMode === INPUT_MODES.PNL && styles.inputModeTabActive,
                  ]}
                  onPress={() => setTPInputMode(INPUT_MODES.PNL)}
                  disabled={disabled}
                >
                  <DollarSign size={12} color={tpInputMode === INPUT_MODES.PNL ? colors.success : colors.textMuted} />
                  <Text style={[
                    styles.inputModeText,
                    tpInputMode === INPUT_MODES.PNL && styles.inputModeTextActive,
                  ]}>Lời (USDT)</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Price Input Mode */}
            {(tpInputMode === INPUT_MODES.PRICE || locked) && (
              <View style={[styles.priceInputContainer, tpError && styles.inputError, locked && styles.inputLocked]}>
                <TextInput
                  style={styles.priceInput}
                  value={tpPrice ? formatPrice(tpPrice) : ''}
                  onChangeText={handleTPPriceInput}
                  placeholder="Giá TP"
                  placeholderTextColor={colors.textDisabled}
                  keyboardType="decimal-pad"
                  editable={!disabled && !locked}
                />
                {tpPercent > 0 && (
                  <Text style={styles.percentBadge}>+{tpPercent.toFixed(1).replace('.', ',')}%</Text>
                )}
              </View>
            )}

            {/* PnL Input Mode */}
            {tpInputMode === INPUT_MODES.PNL && !locked && (
              <View style={styles.pnlInputWrapper}>
                <View style={[styles.priceInputContainer, tpError && styles.inputError]}>
                  <Text style={styles.pnlInputPrefix}>+</Text>
                  <TextInput
                    style={styles.priceInput}
                    value={tpPnlInput}
                    onChangeText={handleTPPnlInputChange}
                    placeholder="Số tiền lời"
                    placeholderTextColor={colors.textDisabled}
                    keyboardType="decimal-pad"
                    editable={!disabled}
                  />
                  <Text style={styles.pnlInputSuffix}>USDT</Text>
                </View>
                {/* Show calculated price */}
                {tpPrice > 0 && (
                  <View style={styles.calculatedPriceRow}>
                    <Text style={styles.calculatedPriceLabel}>→ Giá TP:</Text>
                    <Text style={styles.calculatedPriceValue}>{formatPrice(tpPrice)}</Text>
                    {tpPercent > 0 && (
                      <Text style={styles.calculatedPricePercent}>(+{tpPercent.toFixed(1).replace('.', ',')}%)</Text>
                    )}
                  </View>
                )}
              </View>
            )}

            {/* Error */}
            {tpError && <Text style={styles.errorText}>{tpError}</Text>}

            {/* Presets - only show in Price mode */}
            {!locked && tpInputMode === INPUT_MODES.PRICE && (
              <View style={styles.presetRow}>
                {TPSL_CONFIG.tpPresets.map((percent) => (
                  <TouchableOpacity
                    key={percent}
                    style={[
                      styles.presetButton,
                      Math.abs(tpPercent - percent) < 0.5 && styles.presetButtonActive,
                    ]}
                    onPress={() => handleTPPreset(percent)}
                    disabled={disabled}
                  >
                    <Text
                      style={[
                        styles.presetText,
                        Math.abs(tpPercent - percent) < 0.5 && styles.presetTextActive,
                      ]}
                    >
                      +{percent}%
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* P&L Preview */}
            {tpPnL !== null && (
              <View style={styles.pnlPreview}>
                <TrendingUp size={14} color={colors.success} />
                <Text style={styles.pnlText}>
                  Lời ước tính: <Text style={styles.pnlValue}>{formatUSDT(tpPnL)}</Text>
                  {' '}({formatPercent(tpPercent * leverage, true)} ROI)
                </Text>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Stop Loss Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Shield size={16} color={colors.error} />
            <Text style={styles.sectionTitle}>Cắt lỗ (SL)</Text>
          </View>
          <Switch
            value={slEnabled}
            onValueChange={onSLEnabledChange}
            trackColor={{ false: 'rgba(255, 255, 255, 0.1)', true: 'rgba(255, 107, 107, 0.3)' }}
            thumbColor={slEnabled ? colors.error : colors.textMuted}
            disabled={Boolean(disabled || locked)}
          />
        </View>

        {slEnabled && (
          <View style={styles.sectionContent}>
            {/* Input Mode Toggle - Price vs PnL */}
            {!locked && (
              <View style={styles.inputModeToggle}>
                <TouchableOpacity
                  style={[
                    styles.inputModeTab,
                    styles.inputModeTabLoss,
                    slInputMode === INPUT_MODES.PRICE && styles.inputModeTabLossActive,
                  ]}
                  onPress={() => setSLInputMode(INPUT_MODES.PRICE)}
                  disabled={disabled}
                >
                  <BarChart2 size={12} color={slInputMode === INPUT_MODES.PRICE ? colors.error : colors.textMuted} />
                  <Text style={[
                    styles.inputModeText,
                    slInputMode === INPUT_MODES.PRICE && styles.inputModeTextLossActive,
                  ]}>Giá</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.inputModeTab,
                    styles.inputModeTabLoss,
                    slInputMode === INPUT_MODES.PNL && styles.inputModeTabLossActive,
                  ]}
                  onPress={() => setSLInputMode(INPUT_MODES.PNL)}
                  disabled={disabled}
                >
                  <DollarSign size={12} color={slInputMode === INPUT_MODES.PNL ? colors.error : colors.textMuted} />
                  <Text style={[
                    styles.inputModeText,
                    slInputMode === INPUT_MODES.PNL && styles.inputModeTextLossActive,
                  ]}>Lỗ (USDT)</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Price Input Mode */}
            {(slInputMode === INPUT_MODES.PRICE || locked) && (
              <View style={[styles.priceInputContainer, slError && styles.inputError, locked && styles.inputLocked]}>
                <TextInput
                  style={styles.priceInput}
                  value={slPrice ? formatPrice(slPrice) : ''}
                  onChangeText={handleSLPriceInput}
                  placeholder="Giá SL"
                  placeholderTextColor={colors.textDisabled}
                  keyboardType="decimal-pad"
                  editable={!disabled && !locked}
                />
                {slPercent > 0 && (
                  <Text style={[styles.percentBadge, styles.percentBadgeLoss]}>-{slPercent.toFixed(1).replace('.', ',')}%</Text>
                )}
              </View>
            )}

            {/* PnL Input Mode */}
            {slInputMode === INPUT_MODES.PNL && !locked && (
              <View style={styles.pnlInputWrapper}>
                <View style={[styles.priceInputContainer, slError && styles.inputError]}>
                  <Text style={[styles.pnlInputPrefix, styles.pnlInputPrefixLoss]}>-</Text>
                  <TextInput
                    style={styles.priceInput}
                    value={slPnlInput}
                    onChangeText={handleSLPnlInputChange}
                    placeholder="Số tiền lỗ tối đa"
                    placeholderTextColor={colors.textDisabled}
                    keyboardType="decimal-pad"
                    editable={!disabled}
                  />
                  <Text style={styles.pnlInputSuffix}>USDT</Text>
                </View>
                {/* Show calculated price */}
                {slPrice > 0 && (
                  <View style={styles.calculatedPriceRow}>
                    <Text style={styles.calculatedPriceLabel}>→ Giá SL:</Text>
                    <Text style={[styles.calculatedPriceValue, styles.calculatedPriceValueLoss]}>{formatPrice(slPrice)}</Text>
                    {slPercent > 0 && (
                      <Text style={[styles.calculatedPricePercent, styles.calculatedPricePercentLoss]}>(-{slPercent.toFixed(1).replace('.', ',')}%)</Text>
                    )}
                  </View>
                )}
              </View>
            )}

            {/* Error */}
            {slError && <Text style={styles.errorText}>{slError}</Text>}

            {/* Presets - only show in Price mode */}
            {!locked && slInputMode === INPUT_MODES.PRICE && (
              <View style={styles.presetRow}>
                {TPSL_CONFIG.slPresets.map((percent) => (
                  <TouchableOpacity
                    key={percent}
                    style={[
                      styles.presetButton,
                      styles.presetButtonLoss,
                      Math.abs(slPercent - percent) < 0.5 && styles.presetButtonLossActive,
                    ]}
                    onPress={() => handleSLPreset(percent)}
                    disabled={disabled}
                  >
                    <Text
                      style={[
                        styles.presetText,
                        styles.presetTextLoss,
                        Math.abs(slPercent - percent) < 0.5 && styles.presetTextLossActive,
                      ]}
                    >
                      -{percent}%
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* P&L Preview */}
            {slPnL !== null && (
              <View style={[styles.pnlPreview, styles.pnlPreviewLoss]}>
                <TrendingDown size={14} color={colors.error} />
                <Text style={[styles.pnlText, styles.pnlTextLoss]}>
                  Lỗ ước tính: <Text style={styles.pnlValueLoss}>{formatUSDT(Math.abs(slPnL))}</Text>
                  {' '}({formatPercent(-slPercent * leverage, false)} ROI)
                </Text>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Risk:Reward Display */}
      {showRiskReward && riskReward && tpEnabled && slEnabled && (
        <View style={styles.riskRewardContainer}>
          <Text style={styles.riskRewardLabel}>Risk:Reward</Text>
          <View style={styles.riskRewardValue}>
            <Text style={styles.riskRewardRatio}>{riskReward.ratioString}</Text>
            {riskReward.ratio >= 2 && (
              <View style={styles.goodRatioBadge}>
                <Text style={styles.goodRatioText}>Tốt</Text>
              </View>
            )}
          </View>
        </View>
      )}
    </View>
  );
};

export default memo(TPSLSection);
