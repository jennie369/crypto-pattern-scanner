/**
 * CustomModeFields - Editable Entry/SL/TP fields for Custom Mode
 * Used in PaperTradeModal for dual mode trading
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { RotateCcw, Target, Gem, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, GLASS } from '../../utils/tokens';
import DeviationBadge from './DeviationBadge';

/**
 * @param {Object} props
 * @param {number} props.entry - Custom entry price
 * @param {Function} props.setEntry - Setter for entry
 * @param {number} props.stopLoss - Custom stop loss
 * @param {Function} props.setStopLoss - Setter for stop loss
 * @param {number} props.takeProfit - Custom take profit
 * @param {Function} props.setTakeProfit - Setter for take profit
 * @param {number} props.patternEntry - Original pattern entry
 * @param {number} props.patternSL - Original pattern stop loss
 * @param {number} props.patternTP - Original pattern take profit
 * @param {'LONG' | 'SHORT'} props.direction - Trade direction
 * @param {Function} props.onReset - Reset to pattern values
 */
const CustomModeFields = ({
  entry = 0,
  setEntry,
  stopLoss = 0,
  setStopLoss,
  takeProfit = 0,
  setTakeProfit,
  patternEntry = 0,
  patternSL = 0,
  patternTP = 0,
  direction = 'LONG',
  onReset,
  currentMarketPrice = null,  // NEW: Real-time market price
}) => {
  // Display values for inputs (formatted strings)
  const [entryDisplay, setEntryDisplay] = useState('');
  const [slDisplay, setSlDisplay] = useState('');
  const [tpDisplay, setTpDisplay] = useState('');

  // Sync display values when numeric values change from outside
  useEffect(() => {
    if (entry && !entryDisplay) {
      setEntryDisplay(formatForInput(entry));
    }
  }, [entry]);

  useEffect(() => {
    if (stopLoss && !slDisplay) {
      setSlDisplay(formatForInput(stopLoss));
    }
  }, [stopLoss]);

  useEffect(() => {
    if (takeProfit && !tpDisplay) {
      setTpDisplay(formatForInput(takeProfit));
    }
  }, [takeProfit]);

  // Format number for display with thousand separators (Vietnamese format)
  // Decimal: comma (,) | Thousands: dot (.)
  const formatNumber = (num) => {
    if (!num || isNaN(num)) return '0,00';
    let decimals = 2;
    if (num < 1000 && num >= 1) decimals = 4;
    else if (num < 1) decimals = 8;

    const fixed = parseFloat(num).toFixed(decimals);
    const parts = fixed.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return parts.join(',');
  };

  // Round price to appropriate decimal places based on magnitude
  // This prevents floating-point precision issues like 11.610719999999999
  const roundPrice = (price) => {
    if (!price || isNaN(price)) return 0;
    // Price >= 1000: 2 decimals (BTC, ETH)
    // Price >= 100: 3 decimals
    // Price >= 1: 4 decimals
    // Price < 1: 6 decimals (small altcoins like DOGE, SHIB)
    if (price >= 1000) return Math.round(price * 100) / 100;
    if (price >= 100) return Math.round(price * 1000) / 1000;
    if (price >= 1) return Math.round(price * 10000) / 10000;
    return Math.round(price * 1000000) / 1000000;
  };

  // Format number for input display (Vietnamese format: dot for thousands, comma for decimals)
  const formatForInput = (num) => {
    if (!num || isNaN(num)) return '';
    // Round first to prevent floating-point issues
    const rounded = roundPrice(num);
    // For large numbers, add thousand separators (Vietnamese format)
    if (rounded >= 1000) {
      return rounded.toLocaleString('vi-VN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    }
    if (rounded >= 100) {
      return rounded.toLocaleString('vi-VN', {
        minimumFractionDigits: 3,
        maximumFractionDigits: 3,
      });
    }
    if (rounded >= 1) {
      return rounded.toLocaleString('vi-VN', {
        minimumFractionDigits: 4,
        maximumFractionDigits: 4,
      });
    }
    return rounded.toLocaleString('vi-VN', {
      minimumFractionDigits: 6,
      maximumFractionDigits: 6,
    });
  };

  // Calculate deviation percentage
  const calculateDeviation = (custom, pattern) => {
    if (!pattern || pattern === 0) return 0;
    return ((custom - pattern) / pattern) * 100;
  };

  // Calculate SL/TP percent from entry (Vietnamese format)
  const calculatePercent = (from, to) => {
    if (!from || from === 0) return '0%';
    const percent = ((to - from) / from) * 100;
    const sign = percent >= 0 ? '+' : '';
    return `${sign}${percent.toFixed(2).replace('.', ',')}%`;
  };

  // Handle input change - allow commas but parse correctly
  const handleInputChange = (text, setter, setDisplay) => {
    // Store display value as-is (may include commas)
    setDisplay(text);

    // Remove commas for parsing
    const cleaned = text.replace(/,/g, '').replace(/[^0-9.]/g, '');
    // Prevent multiple decimal points
    const parts = cleaned.split('.');
    const formatted = parts.length > 2
      ? parts[0] + '.' + parts.slice(1).join('')
      : cleaned;
    // Round to prevent floating-point precision issues
    const parsed = parseFloat(formatted) || 0;
    setter(roundPrice(parsed));
  };

  // Handle reset - also update display values
  const handleReset = () => {
    setEntry(patternEntry);
    setStopLoss(patternSL);
    setTakeProfit(patternTP);
    setEntryDisplay(formatForInput(patternEntry));
    setSlDisplay(formatForInput(patternSL));
    setTpDisplay(formatForInput(patternTP));
    onReset?.();
  };

  const entryDeviation = calculateDeviation(entry, patternEntry);
  const slDeviation = calculateDeviation(stopLoss, patternSL);
  const tpDeviation = calculateDeviation(takeProfit, patternTP);

  // Check if entry price is invalid for limit order
  // LONG limit: entry should be BELOW market
  // SHORT limit: entry should be ABOVE market
  const isInvalidEntry = currentMarketPrice && entry > 0 && (
    direction === 'LONG'
      ? entry > currentMarketPrice  // LONG entry above market = invalid
      : entry < currentMarketPrice  // SHORT entry below market = invalid
  );

  // Check if it's a valid limit order (waiting for fill)
  const isValidLimitOrder = currentMarketPrice && entry > 0 && (
    direction === 'LONG'
      ? entry < currentMarketPrice  // LONG entry below market = limit buy
      : entry > currentMarketPrice  // SHORT entry above market = limit sell
  );

  return (
    <View style={styles.container}>
      {/* Current Market Price Banner */}
      {currentMarketPrice && (
        <View style={styles.marketPriceBanner}>
          <View style={styles.marketPriceRow}>
            {direction === 'LONG' ? (
              <TrendingUp size={14} color={COLORS.success} />
            ) : (
              <TrendingDown size={14} color={COLORS.error} />
            )}
            <Text style={styles.marketPriceLabel}>Giá thị trường:</Text>
            <Text style={styles.marketPriceValue}>${formatNumber(currentMarketPrice)}</Text>
          </View>
        </View>
      )}

      {/* Entry Field */}
      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>GIÁ VÀO LỆNH</Text>
        <View style={[
          styles.inputWrapper,
          isInvalidEntry && styles.inputInvalid,
          isValidLimitOrder && styles.inputLimit,
        ]}>
          <Text style={styles.currencyPrefix}>$</Text>
          <TextInput
            style={styles.input}
            value={entryDisplay || formatForInput(entry)}
            onChangeText={(text) => handleInputChange(text, setEntry, setEntryDisplay)}
            keyboardType="decimal-pad"
            placeholder="0.00"
            placeholderTextColor={COLORS.textMuted}
          />
        </View>

        {/* Invalid Entry Warning */}
        {isInvalidEntry && (
          <View style={styles.warningBanner}>
            <AlertTriangle size={14} color={COLORS.warning} />
            <Text style={styles.warningText}>
              {direction === 'LONG'
                ? 'Giá vào cao hơn giá TT! Sẽ vào lệnh ngay ở giá TT hoặc chờ khớp.'
                : 'Giá vào thấp hơn giá TT! Sẽ vào lệnh ngay ở giá TT hoặc chờ khớp.'
              }
            </Text>
          </View>
        )}

        {/* Valid Limit Order Info */}
        {isValidLimitOrder && (
          <View style={styles.limitBanner}>
            <Text style={styles.limitText}>
              ⏳ Lệnh giới hạn - Chờ giá đạt ${formatNumber(entry)}
            </Text>
          </View>
        )}

        <View style={styles.patternHint}>
          <Target size={12} color={COLORS.textMuted} />
          <Text style={styles.patternText}>
            Pattern: ${formatNumber(patternEntry)}
          </Text>
        </View>
        <DeviationBadge
          deviation={entryDeviation}
          type="entry"
          direction={direction}
        />
      </View>

      {/* Stop Loss Field */}
      <View style={styles.fieldContainer}>
        <Text style={[styles.fieldLabel, styles.labelError]}>CẮT LỖ</Text>
        <View style={[styles.inputWrapper, styles.inputError]}>
          <Text style={styles.currencyPrefix}>$</Text>
          <TextInput
            style={styles.input}
            value={slDisplay || formatForInput(stopLoss)}
            onChangeText={(text) => handleInputChange(text, setStopLoss, setSlDisplay)}
            keyboardType="decimal-pad"
            placeholder="0.00"
            placeholderTextColor={COLORS.textMuted}
          />
        </View>
        <View style={styles.patternHint}>
          <Target size={12} color={COLORS.textMuted} />
          <Text style={styles.patternText}>
            Pattern: ${formatNumber(patternSL)} ({calculatePercent(patternEntry, patternSL)})
          </Text>
        </View>
        <DeviationBadge
          deviation={slDeviation}
          type="sl"
          direction={direction}
        />
      </View>

      {/* Take Profit Field */}
      <View style={styles.fieldContainer}>
        <Text style={[styles.fieldLabel, styles.labelSuccess]}>CHỐT LỜI</Text>
        <View style={[styles.inputWrapper, styles.inputSuccess]}>
          <Text style={styles.currencyPrefix}>$</Text>
          <TextInput
            style={styles.input}
            value={tpDisplay || formatForInput(takeProfit)}
            onChangeText={(text) => handleInputChange(text, setTakeProfit, setTpDisplay)}
            keyboardType="decimal-pad"
            placeholder="0.00"
            placeholderTextColor={COLORS.textMuted}
          />
        </View>
        <View style={styles.patternHint}>
          <Target size={12} color={COLORS.textMuted} />
          <Text style={styles.patternText}>
            Pattern: ${formatNumber(patternTP)} ({calculatePercent(patternEntry, patternTP)})
          </Text>
        </View>
        <DeviationBadge
          deviation={tpDeviation}
          type="tp"
          direction={direction}
        />
      </View>

      {/* Reset Button */}
      <TouchableOpacity style={styles.resetButton} onPress={handleReset} activeOpacity={0.7}>
        <Gem size={14} color={COLORS.gold} />
        <Text style={styles.resetText}>Reset về GEM Pattern Mode</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  fieldContainer: {
    marginBottom: SPACING.md,
  },
  fieldLabel: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textSecondary,
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  labelError: {
    color: COLORS.error,
  },
  labelSuccess: {
    color: COLORS.success,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GLASS.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    paddingHorizontal: SPACING.md,
  },
  inputError: {
    borderColor: COLORS.error + '40',
  },
  inputSuccess: {
    borderColor: COLORS.success + '40',
  },
  inputInvalid: {
    borderColor: COLORS.warning,
    borderWidth: 2,
  },
  inputLimit: {
    borderColor: COLORS.info || '#00CFFF',
    borderWidth: 1,
  },
  marketPriceBanner: {
    backgroundColor: 'rgba(0, 207, 255, 0.1)',
    padding: SPACING.sm,
    borderRadius: 8,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(0, 207, 255, 0.3)',
  },
  marketPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  marketPriceLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
  marketPriceValue: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginLeft: 4,
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.warning + '15',
    padding: SPACING.sm,
    borderRadius: 8,
    marginTop: 6,
    gap: 6,
    borderWidth: 1,
    borderColor: COLORS.warning + '30',
  },
  warningText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.warning,
    lineHeight: 16,
  },
  limitBanner: {
    backgroundColor: 'rgba(0, 207, 255, 0.1)',
    padding: SPACING.xs,
    borderRadius: 6,
    marginTop: 6,
  },
  limitText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.info || '#00CFFF',
    textAlign: 'center',
  },
  currencyPrefix: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.gold,
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    paddingVertical: SPACING.sm + 4,
  },
  patternHint: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 6,
  },
  patternText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.gold + '15',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 8,
    gap: 8,
    marginTop: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.gold + '30',
  },
  resetText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.gold,
  },
});

export default CustomModeFields;
