// src/components/Chat/ChartHintResponse.js
// ============================================================
// CHART HINT RESPONSE COMPONENT
// Quick chart hint with link to scanner
// ============================================================

import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { TrendingUp, ExternalLink } from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '../../utils/tokens';

const ChartHintResponse = memo(({
  symbol,
  pattern,
  message,
  onViewChart,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TrendingUp size={20} color={COLORS.gold} />
        <Text style={styles.symbol}>{symbol || 'BTCUSDT'}</Text>
        {pattern && (
          <View style={styles.patternBadge}>
            <Text style={styles.patternText}>{pattern}</Text>
          </View>
        )}
      </View>

      <Text style={styles.message}>{message || ''}</Text>

      <TouchableOpacity
        style={styles.viewButton}
        onPress={onViewChart}
        activeOpacity={0.7}
      >
        <Text style={styles.viewButtonText}>Xem Chart</Text>
        <ExternalLink size={16} color={COLORS.bgDark} />
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: SPACING.md,
    marginVertical: SPACING.sm,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.gold,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  symbol: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  patternBadge: {
    backgroundColor: COLORS.gold,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  patternText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.bgDark,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  message: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.gold,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 12,
  },
  viewButtonText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.bgDark,
  },
});

ChartHintResponse.displayName = 'ChartHintResponse';

export default ChartHintResponse;
