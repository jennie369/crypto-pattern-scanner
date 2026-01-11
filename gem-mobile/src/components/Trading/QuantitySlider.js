/**
 * GEM Scanner - Margin Slider Component
 * Margin (ký quỹ) input with slider and quick buttons
 * Shows: Margin amount, Position value (leveraged), Coin quantity
 */

import React, { memo, useCallback, useState, useMemo } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { RefreshCw, Wallet } from 'lucide-react-native';
import { COLORS, SPACING } from '../../utils/tokens';
import { POSITION_SIZE_CONFIG } from '../../constants/tradingConstants';
import {
  formatNumber,
  formatUSDT,
} from '../../services/tradingCalculations';

const QuantitySlider = ({
  value = 0,  // Current margin amount (USDT)
  percent = 10,  // Current percentage of balance
  unit = 'usdt',  // 'usdt' or 'coin'
  balance = 0,  // Available balance
  leverage = 1,  // Current leverage
  currentPrice = 0,  // Current market price
  baseAsset = 'BTC',  // Base asset symbol
  onChange,  // (marginAmount, percent, unit) => void
  onPercentChange,  // (percent) => void
  onUnitChange,  // (unit) => void
  disabled = false,
  error = null,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [inputText, setInputText] = useState('');

  // Calculate position value (margin × leverage)
  const positionValue = useMemo(() => {
    return value * leverage;
  }, [value, leverage]);

  // Calculate coin quantity
  const coinQuantity = useMemo(() => {
    if (!currentPrice) return 0;
    return positionValue / currentPrice;
  }, [positionValue, currentPrice]);

  // Check if margin exceeds balance
  const exceedsBalance = useMemo(() => {
    return value > balance && balance > 0;
  }, [value, balance]);

  // Handle direct input change - allow any number
  const handleInputChange = useCallback((text) => {
    // Allow empty, numbers, and single decimal point
    if (text === '' || text === '.') {
      setInputText(text);
      if (onChange) {
        onChange(0, 0, unit);
      }
      return;
    }

    // Clean and validate input
    const cleaned = text.replace(/[^0-9.]/g, '');
    // Only allow one decimal point
    const parts = cleaned.split('.');
    const validText = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : cleaned;

    setInputText(validText);

    const numValue = parseFloat(validText) || 0;

    // Calculate percent based on balance
    const newPercent = balance > 0 ? Math.min(100, (numValue / balance) * 100) : 0;

    if (onChange) {
      onChange(numValue, newPercent, unit);
    }
  }, [unit, balance, onChange]);

  // Handle slider change
  const handleSliderChange = useCallback((newPercent) => {
    // Calculate margin amount from percent
    const marginAmount = (balance * newPercent) / 100;

    setInputText(marginAmount > 0 ? formatNumber(marginAmount, 2) : '');

    if (onChange) {
      onChange(marginAmount, newPercent, unit);
    }
  }, [balance, unit, onChange]);

  // Handle quick percent button
  const handleQuickPercent = useCallback((quickPercent) => {
    handleSliderChange(quickPercent);
  }, [handleSliderChange]);

  // Handle unit toggle
  const handleUnitToggle = useCallback(() => {
    const newUnit = unit === 'usdt' ? 'coin' : 'usdt';

    if (onUnitChange) {
      onUnitChange(newUnit);
    }
  }, [unit, onUnitChange]);

  // Get display value
  const displayValue = useMemo(() => {
    if (inputText !== '') return inputText;
    if (!value) return '';
    return formatNumber(value, 2);
  }, [value, inputText]);

  // Sync inputText when value changes from outside
  React.useEffect(() => {
    if (!isFocused && value > 0) {
      setInputText(formatNumber(value, 2));
    }
  }, [value, isFocused]);

  return (
    <View style={styles.container}>
      {/* Label Row */}
      <View style={styles.labelRow}>
        <Text style={styles.label}>Mức ký quỹ</Text>
        <View style={styles.balanceRow}>
          <Wallet size={12} color={COLORS.textMuted} />
          <Text style={styles.balanceText}>
            Khả dụng: <Text style={styles.balanceValue}>{formatUSDT(balance)}</Text>
          </Text>
        </View>
      </View>

      {/* Input Row */}
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputContainerFocused,
          (error || exceedsBalance) && styles.inputContainerError,
          disabled && styles.inputContainerDisabled,
        ]}
      >
        <TextInput
          style={styles.input}
          value={displayValue}
          onChangeText={handleInputChange}
          placeholder="0.00"
          placeholderTextColor={COLORS.textDisabled}
          keyboardType="decimal-pad"
          onFocus={() => {
            setIsFocused(true);
            setInputText(value > 0 ? String(value) : '');
          }}
          onBlur={() => {
            setIsFocused(false);
            if (value > 0) {
              setInputText(formatNumber(value, 2));
            }
          }}
          editable={!disabled}
        />

        {/* Unit display */}
        <View style={styles.unitDisplay}>
          <Text style={styles.unitText}>USDT</Text>
        </View>
      </View>

      {/* Position Value Info */}
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Giá trị vị thế:</Text>
        <Text style={styles.infoValue}>{formatUSDT(positionValue)}</Text>
        <Text style={styles.infoSeparator}>≈</Text>
        <Text style={styles.infoValue}>{formatNumber(coinQuantity, 6)} {baseAsset}</Text>
      </View>

      {/* Slider */}
      <View style={styles.sliderContainer}>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={100}
          value={percent}
          onValueChange={handleSliderChange}
          step={1}
          minimumTrackTintColor={COLORS.gold}
          maximumTrackTintColor="rgba(255, 255, 255, 0.2)"
          thumbTintColor={COLORS.gold}
          disabled={disabled}
        />

        {/* Percent display */}
        <Text style={styles.percentDisplay}>{Math.round(percent)}%</Text>
      </View>

      {/* Quick Percent Buttons */}
      <View style={styles.quickButtons}>
        {POSITION_SIZE_CONFIG.quickPercents.map((quickPercent) => (
          <TouchableOpacity
            key={quickPercent}
            style={[
              styles.quickButton,
              Math.round(percent) === quickPercent && styles.quickButtonActive,
            ]}
            onPress={() => handleQuickPercent(quickPercent)}
            disabled={disabled}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.quickButtonText,
                Math.round(percent) === quickPercent && styles.quickButtonTextActive,
              ]}
            >
              {quickPercent}%
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Error Message */}
      {(error || exceedsBalance) && (
        <Text style={styles.errorText}>
          {error || 'Mức ký quỹ vượt quá số dư khả dụng'}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  // Label Row
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  balanceText: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  balanceValue: {
    color: COLORS.gold,
    fontWeight: '600',
  },
  // Input Container
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  inputContainerFocused: {
    borderColor: COLORS.gold,
    backgroundColor: 'rgba(255, 189, 89, 0.05)',
  },
  inputContainerError: {
    borderColor: COLORS.error,
  },
  inputContainerDisabled: {
    opacity: 0.5,
  },
  input: {
    flex: 1,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  // Unit Toggle
  unitToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255, 255, 255, 0.1)',
  },
  unitText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  // Unit Display
  unitDisplay: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255, 255, 255, 0.1)',
  },
  // Position Value Info Row
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 6,
    gap: 4,
  },
  infoLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  infoValue: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.gold,
  },
  infoSeparator: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginHorizontal: 4,
  },
  // Equivalent
  equivalentText: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
    textAlign: 'right',
  },
  // Slider
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  slider: {
    flex: 1,
    height: 40,
  },
  percentDisplay: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.gold,
    minWidth: 50,
    textAlign: 'right',
  },
  // Quick Buttons
  quickButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.xs,
    gap: SPACING.xs,
  },
  quickButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'transparent',
    alignItems: 'center',
  },
  quickButtonActive: {
    backgroundColor: 'rgba(255, 189, 89, 0.15)',
    borderColor: 'rgba(255, 189, 89, 0.4)',
  },
  quickButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  quickButtonTextActive: {
    color: COLORS.gold,
    fontWeight: '700',
  },
  // Position Info
  positionInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  positionInfoItem: {
    alignItems: 'center',
  },
  positionInfoLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginBottom: 2,
  },
  positionInfoValue: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  // Error
  errorText: {
    fontSize: 11,
    color: COLORS.error,
    marginTop: SPACING.xs,
  },
});

export default memo(QuantitySlider);
