/**
 * GEM Scanner - Price Input Component
 * Price input with +/- buttons, BBO button, and increment controls
 */

import React, { memo, useCallback, useState, useEffect, useMemo } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';
import { Plus, Minus, Crosshair, HelpCircle, Lock } from 'lucide-react-native';
import { useSettings } from '../../contexts/SettingsContext';
import { formatPrice } from '../../services/tradingCalculations';

const PriceInput = ({
  label = 'Giá',
  labelEn = 'Price',
  value = '',
  onChange,
  currentPrice = 0,
  placeholder = '0.00',
  decimals = 8,
  showBBO = true,
  showIncrement = true,
  incrementPercent = 0.1,  // 0.1% per click
  disabled = false,
  error = null,
  helpText = null,
  triggerType = null,  // For stop orders
  onTriggerTypeChange = null,
  showTriggerType = false,
  locked = false,  // For Pattern mode - field is locked
  lockedText = null,  // Text to show when locked
}) => {
  const { colors, gradients, glass, settings, SPACING, TYPOGRAPHY, t } = useSettings();
  const [isFocused, setIsFocused] = useState(false);

  const styles = useMemo(() => StyleSheet.create({
    container: {
      marginBottom: SPACING.md,
    },
    // Label
    labelRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: SPACING.xs,
    },
    labelWithLock: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.xs,
    },
    label: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    lockedBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: 'rgba(255, 215, 0, 0.15)',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
    },
    lockedText: {
      fontSize: 9,
      fontWeight: '600',
      color: colors.gold,
    },
    helpButton: {
      marginLeft: SPACING.xs,
      padding: 2,
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
      borderColor: colors.gold,
      backgroundColor: 'rgba(255, 189, 89, 0.05)',
    },
    inputContainerError: {
      borderColor: colors.error,
      backgroundColor: 'rgba(255, 107, 107, 0.05)',
    },
    inputContainerDisabled: {
      opacity: 0.5,
    },
    inputContainerLocked: {
      borderColor: 'rgba(255, 215, 0, 0.3)',
      borderStyle: 'dashed',
      backgroundColor: 'rgba(255, 215, 0, 0.05)',
    },
    // Input
    input: {
      flex: 1,
      paddingVertical: SPACING.md,
      paddingHorizontal: SPACING.sm,
      fontSize: 16,
      fontWeight: '600',
      color: colors.textPrimary,
      textAlign: 'center',
    },
    // Increment Buttons
    incrementButton: {
      padding: SPACING.md,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
    // BBO Button
    bboButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingVertical: SPACING.sm,
      paddingHorizontal: SPACING.md,
      backgroundColor: 'rgba(0, 240, 255, 0.1)',
      borderLeftWidth: 1,
      borderLeftColor: 'rgba(255, 255, 255, 0.1)',
    },
    bboButtonDisabled: {
      opacity: 0.5,
    },
    bboText: {
      fontSize: 10,
      fontWeight: '700',
      color: colors.cyan,
    },
    bboTextDisabled: {
      color: colors.textDisabled,
    },
    // Trigger Type
    triggerTypeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: SPACING.sm,
    },
    triggerTypeLabel: {
      fontSize: 11,
      color: colors.textMuted,
    },
    triggerTypeButtons: {
      flexDirection: 'row',
      gap: SPACING.xs,
    },
    triggerTypeButton: {
      paddingVertical: SPACING.xs,
      paddingHorizontal: SPACING.sm,
      borderRadius: 4,
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      borderWidth: 1,
      borderColor: 'transparent',
    },
    triggerTypeButtonActive: {
      backgroundColor: 'rgba(0, 240, 255, 0.15)',
      borderColor: 'rgba(0, 240, 255, 0.4)',
    },
    triggerTypeText: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.textMuted,
    },
    triggerTypeTextActive: {
      color: colors.cyan,
    },
    // Current Price
    currentPriceText: {
      fontSize: 11,
      color: colors.textMuted,
      marginTop: SPACING.xs,
      textAlign: 'right',
    },
    currentPriceValue: {
      color: colors.cyan,
      fontWeight: '600',
    },
    // Error & Help
    errorText: {
      fontSize: 11,
      color: colors.error,
      marginTop: SPACING.xs,
    },
    helpText: {
      fontSize: 11,
      color: colors.textMuted,
      marginTop: SPACING.xs,
      fontStyle: 'italic',
    },
  }), [colors, settings.theme, glass, SPACING, TYPOGRAPHY]);

  // Calculate increment value based on current price
  const getIncrementValue = useCallback(() => {
    if (!currentPrice) return 1;
    return currentPrice * (incrementPercent / 100);
  }, [currentPrice, incrementPercent]);

  // Handle text change
  const handleChange = useCallback((text) => {
    // Allow only numbers and one decimal point
    const cleaned = text.replace(/[^0-9.]/g, '');
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      return; // Invalid: more than one decimal point
    }
    if (parts[1] && parts[1].length > decimals) {
      return; // Too many decimal places
    }
    if (onChange) {
      onChange(cleaned);
    }
  }, [decimals, onChange]);

  // Increment price
  const handleIncrement = useCallback(() => {
    if (disabled) return;
    const current = parseFloat(value) || currentPrice || 0;
    const increment = getIncrementValue();
    const newValue = (current + increment).toFixed(decimals);
    if (onChange) {
      onChange(newValue);
    }
  }, [value, currentPrice, getIncrementValue, decimals, onChange, disabled]);

  // Decrement price
  const handleDecrement = useCallback(() => {
    if (disabled) return;
    const current = parseFloat(value) || currentPrice || 0;
    const increment = getIncrementValue();
    const newValue = Math.max(0, current - increment).toFixed(decimals);
    if (onChange) {
      onChange(newValue);
    }
  }, [value, currentPrice, getIncrementValue, decimals, onChange, disabled]);

  // Set to current price (BBO)
  const handleSetCurrentPrice = useCallback(() => {
    if (disabled || !currentPrice) return;
    if (onChange) {
      onChange(currentPrice.toString());
    }
  }, [currentPrice, onChange, disabled]);

  return (
    <View style={styles.container}>
      {/* Label Row */}
      <View style={styles.labelRow}>
        <View style={styles.labelWithLock}>
          <Text style={styles.label}>{label}</Text>
          {locked && (
            <View style={styles.lockedBadge}>
              <Lock size={10} color={colors.gold} />
              {lockedText && <Text style={styles.lockedText}>{lockedText}</Text>}
            </View>
          )}
        </View>
        {helpText && (
          <TouchableOpacity style={styles.helpButton}>
            <HelpCircle size={14} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Input Row */}
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputContainerFocused,
          error && styles.inputContainerError,
          disabled && styles.inputContainerDisabled,
          locked && styles.inputContainerLocked,
        ]}
      >
        {/* Decrement Button */}
        {showIncrement && (
          <TouchableOpacity
            style={styles.incrementButton}
            onPress={handleDecrement}
            disabled={disabled}
            activeOpacity={0.7}
          >
            <Minus size={16} color={disabled ? colors.textDisabled : colors.textSecondary} />
          </TouchableOpacity>
        )}

        {/* Input */}
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={handleChange}
          placeholder={placeholder}
          placeholderTextColor={colors.textDisabled}
          keyboardType="decimal-pad"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          editable={!disabled}
          selectTextOnFocus
        />

        {/* Increment Button */}
        {showIncrement && (
          <TouchableOpacity
            style={styles.incrementButton}
            onPress={handleIncrement}
            disabled={disabled}
            activeOpacity={0.7}
          >
            <Plus size={16} color={disabled ? colors.textDisabled : colors.textSecondary} />
          </TouchableOpacity>
        )}

        {/* BBO Button (Best Bid Offer) */}
        {showBBO && (
          <TouchableOpacity
            style={[styles.bboButton, disabled && styles.bboButtonDisabled]}
            onPress={handleSetCurrentPrice}
            disabled={disabled}
            activeOpacity={0.7}
          >
            <Crosshair size={14} color={disabled ? colors.textDisabled : colors.cyan} />
            <Text style={[styles.bboText, disabled && styles.bboTextDisabled]}>BBO</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Trigger Type Selector (for Stop orders) */}
      {showTriggerType && onTriggerTypeChange && (
        <View style={styles.triggerTypeRow}>
          <Text style={styles.triggerTypeLabel}>Loại kích hoạt:</Text>
          <View style={styles.triggerTypeButtons}>
            <TouchableOpacity
              style={[
                styles.triggerTypeButton,
                triggerType === 'last_price' && styles.triggerTypeButtonActive,
              ]}
              onPress={() => onTriggerTypeChange('last_price')}
              disabled={disabled}
            >
              <Text
                style={[
                  styles.triggerTypeText,
                  triggerType === 'last_price' && styles.triggerTypeTextActive,
                ]}
              >
                Last
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.triggerTypeButton,
                triggerType === 'mark_price' && styles.triggerTypeButtonActive,
              ]}
              onPress={() => onTriggerTypeChange('mark_price')}
              disabled={disabled}
            >
              <Text
                style={[
                  styles.triggerTypeText,
                  triggerType === 'mark_price' && styles.triggerTypeTextActive,
                ]}
              >
                Mark
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Current Price Reference */}
      {currentPrice > 0 && (
        <Text style={styles.currentPriceText}>
          Giá hiện tại: <Text style={styles.currentPriceValue}>{formatPrice(currentPrice)}</Text>
        </Text>
      )}

      {/* Error Message */}
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}

      {/* Help Text */}
      {helpText && !error && (
        <Text style={styles.helpText}>{helpText}</Text>
      )}
    </View>
  );
};

export default memo(PriceInput);
