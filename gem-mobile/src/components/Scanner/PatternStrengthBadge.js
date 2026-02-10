/**
 * GEM Mobile - Pattern Strength Badge
 * Visual badge showing pattern strength (1-5 stars)
 *
 * GEM Method Strength Ranking:
 * - Reversal patterns (UPD/DPU): 5 stars = 70-72% win rate
 * - Continuation patterns (DPD/UPU): 3 stars = 56-58% win rate
 */

import React, { memo, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Star, TrendingUp, TrendingDown, RefreshCw, ArrowRight } from 'lucide-react-native';
import { useSettings } from '../../contexts/SettingsContext';
import { getPatternConfig } from '../../constants/patternConfig';

const PatternStrengthBadge = memo(({
  pattern,
  size = 'medium', // 'small' | 'medium' | 'large'
  showContext = true,
  showWinRate = true,
  showStars = true,
  compact = false,
  style,
}) => {
  const { colors, gradients, glass, settings, SPACING, TYPOGRAPHY, t } = useSettings();
  const config = getPatternConfig(pattern);

  const {
    name,
    fullName,
    context,
    strength,
    stars,
    winRate,
    tradingBias,
    color,
  } = config;

  const isReversal = context === 'reversal';
  const isBullish = tradingBias === 'BUY';

  // Size configurations
  const sizeConfig = {
    small: {
      starSize: 10,
      fontSize: TYPOGRAPHY.fontSize.xs,
      labelFontSize: TYPOGRAPHY.fontSize.xxs || 10,
      padding: SPACING.xxs,
      gap: 2,
      iconSize: 12,
    },
    medium: {
      starSize: 14,
      fontSize: TYPOGRAPHY.fontSize.sm,
      labelFontSize: TYPOGRAPHY.fontSize.xs,
      padding: SPACING.sm,
      gap: SPACING.xxs,
      iconSize: 16,
    },
    large: {
      starSize: 18,
      fontSize: TYPOGRAPHY.fontSize.md,
      labelFontSize: TYPOGRAPHY.fontSize.sm,
      padding: SPACING.md,
      gap: SPACING.xs,
      iconSize: 20,
    },
  };

  const currentSize = sizeConfig[size] || sizeConfig.medium;

  const styles = useMemo(() => StyleSheet.create({
    container: {
      gap: SPACING.xs,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    patternBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.xs,
      paddingHorizontal: SPACING.sm,
      paddingVertical: SPACING.xxs,
      borderRadius: 8,
    },
    patternName: {
      fontWeight: TYPOGRAPHY.fontWeight.bold,
    },
    starsRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    strengthText: {
      marginLeft: SPACING.xs,
      color: colors.textSecondary,
      fontWeight: TYPOGRAPHY.fontWeight.medium,
    },
    contextRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.sm,
    },
    contextBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: SPACING.sm,
      paddingVertical: SPACING.xxs,
      borderRadius: 8,
    },
    contextText: {
      fontWeight: TYPOGRAPHY.fontWeight.medium,
    },
    winRateBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    winRateLabel: {
      color: colors.textMuted,
    },
    winRateValue: {
      fontWeight: TYPOGRAPHY.fontWeight.bold,
    },
    fullName: {
      fontSize: TYPOGRAPHY.fontSize.xs,
      color: colors.textMuted,
      marginTop: SPACING.xxs,
    },

    // Compact styles
    compactContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.xs,
    },
    compactBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: SPACING.xs,
      paddingVertical: 2,
      borderRadius: 4,
    },
    compactName: {
      fontSize: TYPOGRAPHY.fontSize.xs,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
    },
    compactStars: {
      flexDirection: 'row',
      gap: 1,
    },
    compactWinRate: {
      fontSize: TYPOGRAPHY.fontSize.xs,
      color: colors.textMuted,
    },

    // Standalone styles
    starsOnlyContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 2,
    },
    starsOnlyLabel: {
      marginLeft: SPACING.xxs,
      fontSize: TYPOGRAPHY.fontSize.xs,
      color: colors.textMuted,
    },
    winRateBadgeStandalone: {
      paddingHorizontal: SPACING.sm,
      paddingVertical: SPACING.xxs,
      borderRadius: 8,
    },
    winRateValueStandalone: {
      fontWeight: TYPOGRAPHY.fontWeight.bold,
    },
  }), [colors, settings.theme, glass, SPACING, TYPOGRAPHY]);

  // Render stars
  const renderStars = () => {
    const starElements = [];
    for (let i = 0; i < 5; i++) {
      const isFilled = i < stars;
      starElements.push(
        <Star
          key={i}
          size={currentSize.starSize}
          color={isFilled ? colors.gold : colors.textMuted + '40'}
          fill={isFilled ? colors.gold : 'transparent'}
        />
      );
    }
    return starElements;
  };

  // Get context icon and text
  const getContextInfo = () => {
    if (isReversal) {
      return {
        Icon: RefreshCw,
        text: 'Đảo chiều',
        textEn: 'Reversal',
      };
    }
    return {
      Icon: ArrowRight,
      text: 'Tiếp diễn',
      textEn: 'Continuation',
    };
  };

  const contextInfo = getContextInfo();
  const BiasIcon = isBullish ? TrendingUp : TrendingDown;

  // Compact mode for list items
  if (compact) {
    return (
      <View style={[styles.compactContainer, style]}>
        <View style={[styles.compactBadge, { backgroundColor: color + '20' }]}>
          <Text style={[styles.compactName, { color }]}>{name}</Text>
          <View style={styles.compactStars}>
            {Array.from({ length: stars }).map((_, i) => (
              <Star key={i} size={8} color={colors.gold} fill={colors.gold} />
            ))}
          </View>
        </View>
        {showWinRate && (
          <Text style={styles.compactWinRate}>{(winRate * 100).toFixed(0)}%</Text>
        )}
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      {/* Pattern Name with Bias Icon */}
      <View style={styles.headerRow}>
        <View style={[styles.patternBadge, { backgroundColor: color + '20' }]}>
          <BiasIcon size={currentSize.iconSize} color={color} />
          <Text style={[styles.patternName, { color, fontSize: currentSize.fontSize }]}>
            {name}
          </Text>
        </View>
      </View>

      {/* Stars Row */}
      {showStars && (
        <View style={[styles.starsRow, { gap: currentSize.gap }]}>
          {renderStars()}
          <Text style={[styles.strengthText, { fontSize: currentSize.labelFontSize }]}>
            {strength === 5 ? 'Mạnh nhất' : strength >= 4 ? 'Mạnh' : strength >= 3 ? 'Trung bình' : 'Yếu'}
          </Text>
        </View>
      )}

      {/* Context Badge */}
      {showContext && (
        <View style={styles.contextRow}>
          <View style={[
            styles.contextBadge,
            { backgroundColor: isReversal ? colors.purple + '20' : colors.info + '20' }
          ]}>
            <contextInfo.Icon
              size={currentSize.iconSize - 4}
              color={isReversal ? colors.purple : colors.info}
            />
            <Text style={[
              styles.contextText,
              { color: isReversal ? colors.purple : colors.info, fontSize: currentSize.labelFontSize }
            ]}>
              {contextInfo.text}
            </Text>
          </View>

          {/* Win Rate */}
          {showWinRate && (
            <View style={styles.winRateBadge}>
              <Text style={[styles.winRateLabel, { fontSize: currentSize.labelFontSize }]}>
                Win Rate:
              </Text>
              <Text style={[
                styles.winRateValue,
                {
                  fontSize: currentSize.fontSize,
                  color: winRate >= 0.65 ? colors.success : winRate >= 0.55 ? colors.warning : colors.error
                }
              ]}>
                {(winRate * 100).toFixed(0)}%
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Full Name (large size only) */}
      {size === 'large' && (
        <Text style={styles.fullName}>{fullName}</Text>
      )}
    </View>
  );
});

// Standalone stars component for simple usage
export const StrengthStars = memo(({ strength, size = 12, showLabel = false }) => {
  const { colors, gradients, glass, settings, SPACING, TYPOGRAPHY, t } = useSettings();

  const styles = useMemo(() => StyleSheet.create({
    starsOnlyContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 2,
    },
    starsOnlyLabel: {
      marginLeft: SPACING.xxs,
      fontSize: TYPOGRAPHY.fontSize.xs,
      color: colors.textMuted,
    },
  }), [colors, settings.theme, glass, SPACING, TYPOGRAPHY]);

  return (
    <View style={styles.starsOnlyContainer}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={size}
          color={i < strength ? colors.gold : colors.textMuted + '40'}
          fill={i < strength ? colors.gold : 'transparent'}
        />
      ))}
      {showLabel && (
        <Text style={styles.starsOnlyLabel}>
          {strength}/5
        </Text>
      )}
    </View>
  );
});

// Standalone context badge
export const ContextBadge = memo(({ context, size = 'small' }) => {
  const { colors, gradients, glass, settings, SPACING, TYPOGRAPHY, t } = useSettings();

  const isReversal = context === 'reversal';
  const Icon = isReversal ? RefreshCw : ArrowRight;
  const text = isReversal ? 'Đảo chiều' : 'Tiếp diễn';
  const bgColor = isReversal ? colors.purple + '20' : colors.info + '20';
  const textColor = isReversal ? colors.purple : colors.info;

  const iconSize = size === 'small' ? 12 : size === 'medium' ? 14 : 16;
  const fontSize = size === 'small' ? TYPOGRAPHY.fontSize.xs : TYPOGRAPHY.fontSize.sm;

  const styles = useMemo(() => StyleSheet.create({
    contextBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: SPACING.sm,
      paddingVertical: SPACING.xxs,
      borderRadius: 8,
    },
    contextText: {
      fontWeight: TYPOGRAPHY.fontWeight.medium,
    },
  }), [colors, settings.theme, glass, SPACING, TYPOGRAPHY]);

  return (
    <View style={[styles.contextBadge, { backgroundColor: bgColor }]}>
      <Icon size={iconSize} color={textColor} />
      <Text style={[styles.contextText, { color: textColor, fontSize }]}>
        {text}
      </Text>
    </View>
  );
});

// Win rate badge
export const WinRateBadge = memo(({ winRate, size = 'small' }) => {
  const { colors, gradients, glass, settings, SPACING, TYPOGRAPHY, t } = useSettings();

  const color = winRate >= 0.65 ? colors.success : winRate >= 0.55 ? colors.warning : colors.error;
  const fontSize = size === 'small' ? TYPOGRAPHY.fontSize.xs : TYPOGRAPHY.fontSize.sm;

  const styles = useMemo(() => StyleSheet.create({
    winRateBadgeStandalone: {
      paddingHorizontal: SPACING.sm,
      paddingVertical: SPACING.xxs,
      borderRadius: 8,
    },
    winRateValueStandalone: {
      fontWeight: TYPOGRAPHY.fontWeight.bold,
    },
  }), [colors, settings.theme, glass, SPACING, TYPOGRAPHY]);

  return (
    <View style={[styles.winRateBadgeStandalone, { backgroundColor: color + '20' }]}>
      <Text style={[styles.winRateValueStandalone, { color, fontSize }]}>
        {(winRate * 100).toFixed(0)}%
      </Text>
    </View>
  );
});

PatternStrengthBadge.displayName = 'PatternStrengthBadge';
StrengthStars.displayName = 'StrengthStars';
ContextBadge.displayName = 'ContextBadge';
WinRateBadge.displayName = 'WinRateBadge';

export default PatternStrengthBadge;
