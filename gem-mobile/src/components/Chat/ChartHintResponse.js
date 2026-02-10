// src/components/Chat/ChartHintResponse.js
// ============================================================
// CHART HINT RESPONSE COMPONENT
// Quick chart hint with link to scanner
// ============================================================

import React, { memo, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { TrendingUp, ExternalLink } from 'lucide-react-native';
import { useSettings } from '../../contexts/SettingsContext';

const ChartHintResponse = memo(({
  symbol,
  pattern,
  message,
  onViewChart,
}) => {
  const { colors, gradients, glass, settings, SPACING, TYPOGRAPHY, t } = useSettings();

  const styles = useMemo(() => StyleSheet.create({
    container: {
      backgroundColor: settings.theme === 'light' ? colors.bgDarkest : (glass.background || 'rgba(15, 16, 48, 0.95)'),
      borderRadius: 16,
      padding: SPACING.md,
      marginVertical: SPACING.sm,
      borderLeftWidth: 3,
      borderLeftColor: colors.gold,
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
      color: colors.textPrimary,
    },
    patternBadge: {
      backgroundColor: colors.gold,
      paddingVertical: 2,
      paddingHorizontal: 8,
      borderRadius: 8,
    },
    patternText: {
      fontSize: TYPOGRAPHY.fontSize.xs,
      color: colors.bgDark,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
    },
    message: {
      fontSize: TYPOGRAPHY.fontSize.lg,
      color: colors.textSecondary,
      marginBottom: SPACING.md,
    },
    viewButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: SPACING.xs,
      backgroundColor: colors.gold,
      paddingVertical: SPACING.sm,
      paddingHorizontal: SPACING.md,
      borderRadius: 12,
    },
    viewButtonText: {
      fontSize: TYPOGRAPHY.fontSize.lg,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
      color: colors.bgDark,
    },
  }), [colors, settings.theme, glass, SPACING, TYPOGRAPHY]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TrendingUp size={20} color={colors.gold} />
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
        <ExternalLink size={16} color={colors.bgDark} />
      </TouchableOpacity>
    </View>
  );
});

ChartHintResponse.displayName = 'ChartHintResponse';

export default ChartHintResponse;
