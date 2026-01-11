/**
 * DeviationBadge - Badge showing deviation from pattern value
 * Used in CustomModeFields for real-time feedback
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '../../utils/tokens';

/**
 * @param {Object} props
 * @param {number} props.deviation - Percentage deviation from pattern
 * @param {'entry' | 'sl' | 'tp'} props.type - Field type
 * @param {'LONG' | 'SHORT'} props.direction - Trade direction
 */
const DeviationBadge = ({
  deviation = 0,
  type = 'entry',
  direction = 'LONG',
}) => {
  // Return null if deviation is too small
  if (Math.abs(deviation) < 0.1) return null;

  // Determine style based on type and deviation
  const getStyle = () => {
    // For Stop Loss
    if (type === 'sl') {
      // SL wider than pattern = more dangerous
      if (direction === 'LONG') {
        // LONG: lower SL = wider = more risk
        return deviation < -1 ? 'warning' : deviation > 1 ? 'success' : 'neutral';
      } else {
        // SHORT: higher SL = wider = more risk
        return deviation > 1 ? 'warning' : deviation < -1 ? 'success' : 'neutral';
      }
    }

    // For Take Profit
    if (type === 'tp') {
      // TP further than pattern = harder to achieve
      if (direction === 'LONG') {
        // LONG: higher TP = further = harder
        return deviation > 2 ? 'info' : deviation < -2 ? 'warning' : 'neutral';
      } else {
        // SHORT: lower TP = further = harder
        return deviation < -2 ? 'info' : deviation > 2 ? 'warning' : 'neutral';
      }
    }

    // For Entry
    return Math.abs(deviation) > 1 ? 'warning' : 'neutral';
  };

  const style = getStyle();

  const colorMap = {
    warning: COLORS.warning,
    success: COLORS.success,
    info: COLORS.info,
    neutral: COLORS.textMuted,
  };

  const IconComponent = {
    warning: AlertTriangle,
    success: CheckCircle,
    info: Info,
    neutral: Info,
  }[style];

  const getMessage = () => {
    const absDeviation = Math.abs(deviation).toFixed(2);

    if (type === 'sl') {
      if (style === 'warning') {
        return `SL rộng hơn pattern ${absDeviation}%`;
      }
      if (style === 'success') {
        return `SL chặt hơn pattern ${absDeviation}%`;
      }
    }

    if (type === 'tp') {
      if (style === 'info') {
        return `TP xa hơn pattern ${absDeviation}%`;
      }
      if (style === 'warning') {
        return `TP gần hơn pattern ${absDeviation}%`;
      }
    }

    return `Lệch ${absDeviation}% so với pattern`;
  };

  const color = colorMap[style];

  return (
    <View style={[styles.badge, { borderColor: color + '40' }]}>
      <IconComponent size={12} color={color} />
      <Text style={[styles.badgeText, { color }]}>
        {getMessage()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgDarkest,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    gap: 6,
    marginTop: 4,
  },
  badgeText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    flex: 1,
  },
});

export default DeviationBadge;
