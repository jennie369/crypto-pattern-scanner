/**
 * GEM Mobile - Confidence Bar
 * Visual progress bar for pattern confidence
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../utils/tokens';
import { formatConfidence } from '../../../utils/formatters';

const ConfidenceBar = ({ confidence }) => {
  // Safe confidence value - handle decimal (0.8) or percentage (80)
  const confidenceValue = confidence > 1 ? confidence : confidence * 100;

  const getColor = () => {
    if (confidenceValue >= 80) return COLORS.success;
    if (confidenceValue >= 60) return COLORS.gold;
    return COLORS.error;
  };

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>Độ Tin Cậy</Text>
        <Text style={[styles.value, { color: getColor() }]}>
          {formatConfidence(confidenceValue, 1)}
        </Text>
      </View>
      <View style={styles.barBackground}>
        <View
          style={[
            styles.barFill,
            { width: `${Math.min(confidenceValue, 100)}%`, backgroundColor: getColor() },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  label: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
  value: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  barBackground: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },
});

export default ConfidenceBar;
