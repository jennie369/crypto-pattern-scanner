/**
 * KarmaStatCard - Stats display card with icon and trend
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react-native';
import { useSettings } from '../../contexts/SettingsContext';

const KarmaStatCard = ({
  label = '',
  value = 0,
  subValue = null,
  icon: Icon = null,
  iconColor = null,
  trend = null, // 'up' | 'down' | 'neutral' | null
  trendValue = null,
  compact = false,
  style,
}) => {
  const { colors, gradients, glass, settings, SPACING, TYPOGRAPHY, t } = useSettings();

  // Default iconColor to colors.cyan if not provided
  const resolvedIconColor = iconColor || colors.cyan;

  // Get trend icon and color
  const getTrendInfo = () => {
    if (!trend) return null;

    switch (trend) {
      case 'up':
        return { icon: TrendingUp, color: colors.success };
      case 'down':
        return { icon: TrendingDown, color: colors.error };
      case 'neutral':
        return { icon: Minus, color: colors.textMuted };
      default:
        return null;
    }
  };

  const trendInfo = getTrendInfo();

  // Format value for display
  const formatValue = (val) => {
    if (typeof val === 'number') {
      return val.toLocaleString();
    }
    return val || '0';
  };

  const styles = useMemo(() => StyleSheet.create({
    container: {
      borderRadius: SPACING.lg,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: settings.theme === 'light' ? colors.border : 'rgba(255, 255, 255, 0.1)',
    },
    gradient: {
      padding: SPACING.lg,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.sm,
      marginBottom: SPACING.md,
    },
    iconContainer: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
    },
    label: {
      color: colors.textMuted,
      fontSize: TYPOGRAPHY.sizes.sm,
      flex: 1,
    },
    valueContainer: {
      marginBottom: SPACING.sm,
    },
    value: {
      color: colors.textPrimary,
      fontSize: TYPOGRAPHY.sizes.xxxl,
      fontWeight: '700',
    },
    subValue: {
      color: colors.textSecondary,
      fontSize: TYPOGRAPHY.sizes.sm,
      marginTop: 2,
    },
    trendContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.xs,
    },
    trendText: {
      fontSize: TYPOGRAPHY.sizes.sm,
      fontWeight: '600',
    },
    trendLabel: {
      color: colors.textMuted,
      fontSize: TYPOGRAPHY.sizes.xs,
    },
    // Compact styles
    compactContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: settings.theme === 'light' ? colors.bgDarkest : (glass.background || 'rgba(15, 16, 48, 0.5)'),
      borderRadius: SPACING.md,
      padding: SPACING.md,
      gap: SPACING.sm,
      borderWidth: 1,
      borderColor: settings.theme === 'light' ? colors.border : 'rgba(255, 255, 255, 0.1)',
    },
    compactIconContainer: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    compactContent: {
      flex: 1,
    },
    compactLabel: {
      color: colors.textMuted,
      fontSize: TYPOGRAPHY.sizes.xs,
      marginBottom: 2,
    },
    compactValueRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    compactValue: {
      color: colors.textPrimary,
      fontSize: TYPOGRAPHY.sizes.lg,
      fontWeight: '700',
    },
    compactTrend: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 2,
    },
    compactTrendText: {
      fontSize: TYPOGRAPHY.sizes.xs,
      fontWeight: '600',
    },
  }), [colors, settings.theme, glass, SPACING, TYPOGRAPHY]);

  if (compact) {
    return (
      <View style={[styles.compactContainer, style]}>
        {Icon && (
          <View style={[styles.compactIconContainer, { backgroundColor: resolvedIconColor + '20' }]}>
            <Icon size={16} color={resolvedIconColor} strokeWidth={2} />
          </View>
        )}
        <View style={styles.compactContent}>
          <Text style={styles.compactLabel} numberOfLines={1}>{label}</Text>
          <View style={styles.compactValueRow}>
            <Text style={styles.compactValue}>{formatValue(value)}</Text>
            {trendInfo && trendValue !== null && (
              <View style={styles.compactTrend}>
                <trendInfo.icon size={12} color={trendInfo.color} strokeWidth={2} />
                <Text style={[styles.compactTrendText, { color: trendInfo.color }]}>
                  {trendValue}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    );
  }

  const gradientColors = settings.theme === 'light'
    ? [colors.bgDarkest, colors.bgDarkest]
    : ['rgba(15, 16, 48, 0.8)', 'rgba(15, 16, 48, 0.4)'];

  return (
    <View style={[styles.container, style]}>
      <LinearGradient
        colors={gradientColors}
        style={styles.gradient}
      >
        {/* Header with icon */}
        <View style={styles.header}>
          {Icon && (
            <View style={[styles.iconContainer, { backgroundColor: resolvedIconColor + '20' }]}>
              <Icon size={20} color={resolvedIconColor} strokeWidth={2} />
            </View>
          )}
          <Text style={styles.label} numberOfLines={1}>{label}</Text>
        </View>

        {/* Value */}
        <View style={styles.valueContainer}>
          <Text style={styles.value}>{formatValue(value)}</Text>
          {subValue !== null && (
            <Text style={styles.subValue}>{subValue}</Text>
          )}
        </View>

        {/* Trend indicator */}
        {trendInfo && (
          <View style={styles.trendContainer}>
            <trendInfo.icon size={14} color={trendInfo.color} strokeWidth={2} />
            {trendValue !== null && (
              <Text style={[styles.trendText, { color: trendInfo.color }]}>
                {trend === 'up' ? '+' : ''}{trendValue}
              </Text>
            )}
            <Text style={styles.trendLabel}>so voi hom qua</Text>
          </View>
        )}
      </LinearGradient>
    </View>
  );
};

export default KarmaStatCard;
