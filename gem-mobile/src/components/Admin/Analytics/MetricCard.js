/**
 * MetricCard Component
 * Admin Analytics Dashboard - GEM Platform
 *
 * Displays a single metric with:
 * - Title and icon
 * - Main value (formatted)
 * - Trend indicator (up/down/neutral)
 * - Optional subtitle
 * - Tooltip support
 *
 * Created: January 30, 2026
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  HelpCircle,
} from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, GLASS } from '../../../utils/tokens';

const MetricCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = COLORS.purple,
  trend = null, // 'up' | 'down' | 'neutral'
  trendValue = null, // e.g., "+12%"
  trendLabel = null, // e.g., "vs last week"
  color = COLORS.purple,
  size = 'medium', // 'small' | 'medium' | 'large'
  onPress,
  onTooltipPress,
  tooltipText,
  style,
}) => {
  const getTrendColor = () => {
    if (trend === 'up') return COLORS.success;
    if (trend === 'down') return COLORS.error;
    return COLORS.textMuted;
  };

  const getTrendIcon = () => {
    if (trend === 'up') return TrendingUp;
    if (trend === 'down') return TrendingDown;
    return Minus;
  };

  const TrendIcon = getTrendIcon();
  const trendColor = getTrendColor();

  const sizeStyles = {
    small: {
      card: styles.cardSmall,
      title: styles.titleSmall,
      value: styles.valueSmall,
      icon: 16,
    },
    medium: {
      card: styles.cardMedium,
      title: styles.titleMedium,
      value: styles.valueMedium,
      icon: 20,
    },
    large: {
      card: styles.cardLarge,
      title: styles.titleLarge,
      value: styles.valueLarge,
      icon: 24,
    },
  };

  const currentSize = sizeStyles[size] || sizeStyles.medium;

  const CardWrapper = onPress ? TouchableOpacity : View;

  return (
    <CardWrapper
      style={[
        styles.card,
        currentSize.card,
        { borderLeftColor: color },
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Header: Icon + Title + Tooltip */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {Icon && (
            <View style={[styles.iconContainer, { backgroundColor: `${iconColor}20` }]}>
              <Icon size={currentSize.icon} color={iconColor} />
            </View>
          )}
          <Text style={[styles.title, currentSize.title]} numberOfLines={1}>
            {title}
          </Text>
        </View>
        {tooltipText && onTooltipPress && (
          <TouchableOpacity onPress={onTooltipPress} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <HelpCircle size={16} color={COLORS.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Main Value */}
      <Text style={[styles.value, currentSize.value]} numberOfLines={1}>
        {value}
      </Text>

      {/* Footer: Subtitle + Trend */}
      <View style={styles.footer}>
        {subtitle && (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        )}

        {trend && trendValue && (
          <View style={[styles.trendBadge, { backgroundColor: `${trendColor}20` }]}>
            <TrendIcon size={12} color={trendColor} />
            <Text style={[styles.trendValue, { color: trendColor }]}>
              {trendValue}
            </Text>
            {trendLabel && (
              <Text style={styles.trendLabel}>{trendLabel}</Text>
            )}
          </View>
        )}
      </View>
    </CardWrapper>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: GLASS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
    borderLeftWidth: 4,
    padding: SPACING.md,
  },
  cardSmall: {
    padding: SPACING.sm,
  },
  cardMedium: {
    padding: SPACING.md,
  },
  cardLarge: {
    padding: SPACING.lg,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  title: {
    color: COLORS.textSecondary,
    flex: 1,
  },
  titleSmall: {
    fontSize: 12,
  },
  titleMedium: {
    fontSize: 13,
  },
  titleLarge: {
    fontSize: 14,
  },

  value: {
    color: COLORS.textPrimary,
    fontWeight: '700',
    marginBottom: SPACING.xs,
  },
  valueSmall: {
    fontSize: 20,
  },
  valueMedium: {
    fontSize: 26,
  },
  valueLarge: {
    fontSize: 32,
  },

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    flex: 1,
  },

  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  trendValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  trendLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginLeft: 2,
  },
});

export default MetricCard;
