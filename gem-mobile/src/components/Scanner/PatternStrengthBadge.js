/**
 * GEM Mobile - Pattern Strength Badge
 * Visual badge showing pattern strength (1-5 stars)
 *
 * GEM Method Strength Ranking:
 * - Reversal patterns (UPD/DPU): 5 stars = 70-72% win rate
 * - Continuation patterns (DPD/UPU): 3 stars = 56-58% win rate
 */

import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Star, TrendingUp, TrendingDown, RefreshCw, ArrowRight } from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, GLASS, BORDER_RADIUS } from '../../utils/tokens';
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

  // Render stars
  const renderStars = () => {
    const starElements = [];
    for (let i = 0; i < 5; i++) {
      const isFilled = i < stars;
      starElements.push(
        <Star
          key={i}
          size={currentSize.starSize}
          color={isFilled ? COLORS.gold : COLORS.textMuted + '40'}
          fill={isFilled ? COLORS.gold : 'transparent'}
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
              <Star key={i} size={8} color={COLORS.gold} fill={COLORS.gold} />
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
            { backgroundColor: isReversal ? COLORS.purple + '20' : COLORS.info + '20' }
          ]}>
            <contextInfo.Icon
              size={currentSize.iconSize - 4}
              color={isReversal ? COLORS.purple : COLORS.info}
            />
            <Text style={[
              styles.contextText,
              { color: isReversal ? COLORS.purple : COLORS.info, fontSize: currentSize.labelFontSize }
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
                  color: winRate >= 0.65 ? COLORS.success : winRate >= 0.55 ? COLORS.warning : COLORS.error
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
  return (
    <View style={styles.starsOnlyContainer}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={size}
          color={i < strength ? COLORS.gold : COLORS.textMuted + '40'}
          fill={i < strength ? COLORS.gold : 'transparent'}
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
  const isReversal = context === 'reversal';
  const Icon = isReversal ? RefreshCw : ArrowRight;
  const text = isReversal ? 'Đảo chiều' : 'Tiếp diễn';
  const bgColor = isReversal ? COLORS.purple + '20' : COLORS.info + '20';
  const textColor = isReversal ? COLORS.purple : COLORS.info;

  const iconSize = size === 'small' ? 12 : size === 'medium' ? 14 : 16;
  const fontSize = size === 'small' ? TYPOGRAPHY.fontSize.xs : TYPOGRAPHY.fontSize.sm;

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
  const color = winRate >= 0.65 ? COLORS.success : winRate >= 0.55 ? COLORS.warning : COLORS.error;
  const fontSize = size === 'small' ? TYPOGRAPHY.fontSize.xs : TYPOGRAPHY.fontSize.sm;

  return (
    <View style={[styles.winRateBadgeStandalone, { backgroundColor: color + '20' }]}>
      <Text style={[styles.winRateValueStandalone, { color, fontSize }]}>
        {(winRate * 100).toFixed(0)}%
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
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
    borderRadius: BORDER_RADIUS.sm,
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
    color: COLORS.textSecondary,
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
    borderRadius: BORDER_RADIUS.sm,
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
    color: COLORS.textMuted,
  },
  winRateValue: {
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  fullName: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
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
    borderRadius: BORDER_RADIUS.xs,
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
    color: COLORS.textMuted,
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
    color: COLORS.textMuted,
  },
  winRateBadgeStandalone: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xxs,
    borderRadius: BORDER_RADIUS.sm,
  },
  winRateValueStandalone: {
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
});

PatternStrengthBadge.displayName = 'PatternStrengthBadge';
StrengthStars.displayName = 'StrengthStars';
ContextBadge.displayName = 'ContextBadge';
WinRateBadge.displayName = 'WinRateBadge';

export default PatternStrengthBadge;
