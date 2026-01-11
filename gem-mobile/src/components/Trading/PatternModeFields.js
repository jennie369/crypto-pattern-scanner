/**
 * PatternModeFields - Locked Entry/SL/TP fields for Pattern Mode
 * Used in PaperTradeModal for dual mode trading
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Lock } from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, GLASS } from '../../utils/tokens';

/**
 * @param {Object} props
 * @param {number} props.entry - Entry price from pattern
 * @param {number} props.stopLoss - Stop loss price from pattern
 * @param {number} props.takeProfit - Take profit price from pattern
 * @param {'LONG' | 'SHORT'} props.direction - Trade direction
 */
const PatternModeFields = ({
  entry = 0,
  stopLoss = 0,
  takeProfit = 0,
  direction = 'LONG',
}) => {
  // Calculate percentages from entry (Vietnamese format)
  const calculatePercent = (from, to) => {
    if (!from || from === 0) return '0%';
    const percent = ((to - from) / from) * 100;
    const sign = percent >= 0 ? '+' : '';
    return `${sign}${percent.toFixed(2).replace('.', ',')}%`;
  };

  // Format number for display (Vietnamese format: comma decimal, dot thousands)
  const formatNumber = (num) => {
    if (!num || isNaN(num)) return '0,00';
    let decimals = 2;
    if (num < 1000 && num >= 1) decimals = 2;
    else if (num < 1) decimals = 8;

    const fixed = parseFloat(num).toFixed(decimals);
    const parts = fixed.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return parts.join(',');
  };

  const slPercent = calculatePercent(entry, stopLoss);
  const tpPercent = calculatePercent(entry, takeProfit);

  return (
    <View style={styles.container}>
      {/* Entry Price */}
      <View style={styles.fieldBox}>
        <Text style={styles.fieldLabel}>ĐIỂM VÀO</Text>
        <Text style={styles.fieldValue}>${formatNumber(entry)}</Text>
        <View style={styles.lockBadge}>
          <Lock size={10} color={COLORS.textMuted} />
          <Text style={styles.lockText}>Auto</Text>
        </View>
      </View>

      {/* Stop Loss */}
      <View style={styles.fieldBox}>
        <Text style={[styles.fieldLabel, styles.labelError]}>CẮT LỖ</Text>
        <Text style={[styles.fieldValue, styles.valueError]}>
          ${formatNumber(stopLoss)}
        </Text>
        <View style={styles.lockBadge}>
          <Lock size={10} color={COLORS.textMuted} />
          <Text style={styles.lockText}>{slPercent}</Text>
        </View>
      </View>

      {/* Take Profit */}
      <View style={styles.fieldBox}>
        <Text style={[styles.fieldLabel, styles.labelSuccess]}>CHỐT LỜI</Text>
        <Text style={[styles.fieldValue, styles.valueSuccess]}>
          ${formatNumber(takeProfit)}
        </Text>
        <View style={styles.lockBadge}>
          <Lock size={10} color={COLORS.textMuted} />
          <Text style={styles.lockText}>{tpPercent}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    gap: 8,
  },
  fieldBox: {
    flex: 1,
    backgroundColor: GLASS.background,
    borderRadius: 12,
    padding: SPACING.sm,
    alignItems: 'center',
  },
  fieldLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textMuted,
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  labelError: {
    color: COLORS.error,
  },
  labelSuccess: {
    color: COLORS.success,
  },
  fieldValue: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  valueError: {
    color: COLORS.error,
  },
  valueSuccess: {
    color: COLORS.success,
  },
  lockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgDarkest,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 4,
  },
  lockText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
  },
});

export default PatternModeFields;
