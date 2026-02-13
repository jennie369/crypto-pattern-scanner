/**
 * GEM Mobile - Confirmation Badge Component
 * Phase 3A: Display confirmation pattern badges and indicators
 */

import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import {
  TrendingUp,
  TrendingDown,
  ArrowUp,
  ArrowDown,
  Minus,
  Sunrise,
  Sunset,
  Check,
  X,
  Star,
} from 'lucide-react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '../../utils/tokens';
import { getConfirmationStrength } from '../../constants/confirmationConfig';

// Map pattern IDs to icons
const PATTERN_ICONS = {
  bullish_engulfing: TrendingUp,
  bearish_engulfing: TrendingDown,
  bullish_pin_bar: ArrowUp,
  bearish_pin_bar: ArrowDown,
  bullish_hammer: ArrowUp,
  shooting_star: ArrowDown,
  morning_star: Sunrise,
  evening_star: Sunset,
  inside_bar: Minus,
  doji: Minus,
};

/**
 * Main Confirmation Badge component
 */
const ConfirmationBadge = memo(({
  confirmation,
  showScore = true,
  size = 'medium',
  onPress,
}) => {
  // No confirmation state
  if (!confirmation) {
    return (
      <View style={[styles.noBadge, styles[size]]}>
        <X size={14} color={COLORS.textMuted} />
        <Text style={styles.noText}>Chờ Confirmation</Text>
      </View>
    );
  }

  const {
    patternId,
    pattern,
    type,
    score,
  } = confirmation;

  const IconComponent = PATTERN_ICONS[patternId] || Check;
  const strengthConfig = getConfirmationStrength(score);
  const isBullish = type === 'bullish';
  const isBearish = type === 'bearish';

  const typeColor = isBullish
    ? COLORS.success
    : isBearish
      ? COLORS.error
      : COLORS.gold;

  const containerStyle = [
    styles.container,
    styles[size],
    {
      borderColor: typeColor,
      backgroundColor: typeColor + '10',
    },
  ];

  const content = (
    <View style={containerStyle}>
      <View style={[styles.iconContainer, { backgroundColor: typeColor + '20' }]}>
        <IconComponent
          size={size === 'small' ? 14 : 18}
          color={typeColor}
        />
      </View>

      <View style={styles.textContainer}>
        <Text style={[styles.patternName, { color: typeColor }]}>
          {pattern?.nameVi || patternId}
        </Text>

        {showScore && (
          <View style={styles.scoreContainer}>
            <View style={[styles.strengthDot, { backgroundColor: strengthConfig.color }]} />
            <Text style={styles.strengthText}>{strengthConfig.label}</Text>
          </View>
        )}
      </View>

      {showScore && (
        <View style={[styles.scoreBadge, { backgroundColor: strengthConfig.color }]}>
          <Text style={styles.scoreText}>{score}</Text>
        </View>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={() => onPress(confirmation)} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
});

/**
 * Compact indicator for list items
 */
export const ConfirmationIndicator = memo(({ hasConfirmation, type }) => {
  const color = hasConfirmation
    ? (type === 'bullish' ? COLORS.success : type === 'bearish' ? COLORS.error : COLORS.gold)
    : COLORS.textMuted;

  return (
    <View style={[styles.indicator, { backgroundColor: color + '20' }]}>
      {hasConfirmation ? (
        <Check size={12} color={color} />
      ) : (
        <Minus size={12} color={color} />
      )}
    </View>
  );
});

/**
 * Score-only badge for inline display
 */
export const ConfirmationScoreBadge = memo(({ score }) => {
  const strength = getConfirmationStrength(score);

  return (
    <View style={[styles.inlineScore, { backgroundColor: strength.color + '20' }]}>
      <Star size={10} color={strength.color} fill={strength.color} />
      <Text style={[styles.inlineScoreText, { color: strength.color }]}>
        {score}
      </Text>
    </View>
  );
});

/**
 * Pattern type label
 */
export const PatternTypeLabel = memo(({ type }) => {
  const color = type === 'bullish'
    ? COLORS.success
    : type === 'bearish'
      ? COLORS.error
      : COLORS.gold;

  const label = type === 'bullish'
    ? 'Tăng'
    : type === 'bearish'
      ? 'Giảm'
      : 'Trung tính';

  return (
    <View style={[styles.typeLabel, { backgroundColor: color + '15', borderColor: color }]}>
      <Text style={[styles.typeLabelText, { color }]}>{label}</Text>
    </View>
  );
});

/**
 * Confirmation strength bar
 */
export const ConfirmationStrengthBar = memo(({ score, maxScore = 6 }) => {
  const strength = getConfirmationStrength(score);
  const fillPercent = Math.min((score / maxScore) * 100, 100);

  return (
    <View style={styles.strengthBar}>
      <View style={styles.strengthBarTrack}>
        <View
          style={[
            styles.strengthBarFill,
            {
              width: `${fillPercent}%`,
              backgroundColor: strength.color,
            },
          ]}
        />
      </View>
      <Text style={[styles.strengthBarLabel, { color: strength.color }]}>
        {strength.label}
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  // Main container
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    gap: SPACING.sm,
  },

  // Size variants
  small: {
    padding: SPACING.xs,
    gap: SPACING.xs,
  },
  medium: {
    padding: SPACING.sm,
    gap: SPACING.sm,
  },
  large: {
    padding: SPACING.md,
    gap: SPACING.sm,
  },

  // No confirmation state
  noBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    padding: SPACING.sm,
    backgroundColor: COLORS.glassBg,
    borderRadius: BORDER_RADIUS.sm,
  },
  noText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },

  // Icon container
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Text container
  textContainer: {
    flex: 1,
  },
  patternName: {
    fontSize: 13,
    fontWeight: '600',
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  strengthDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  strengthText: {
    fontSize: 11,
    color: COLORS.textMuted,
  },

  // Score badge
  scoreBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  scoreText: {
    fontSize: 13,
    color: COLORS.bgDarkest,
    fontWeight: '700',
  },

  // Indicator
  indicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Inline score
  inlineScore: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.xs,
  },
  inlineScoreText: {
    fontSize: 11,
    fontWeight: '600',
  },

  // Type label
  typeLabel: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.xs,
    borderWidth: 1,
  },
  typeLabelText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },

  // Strength bar
  strengthBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  strengthBarTrack: {
    flex: 1,
    height: 4,
    backgroundColor: COLORS.glassBg,
    borderRadius: 2,
    overflow: 'hidden',
  },
  strengthBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  strengthBarLabel: {
    fontSize: 11,
    fontWeight: '500',
    minWidth: 60,
    textAlign: 'right',
  },
});

ConfirmationBadge.displayName = 'ConfirmationBadge';
ConfirmationIndicator.displayName = 'ConfirmationIndicator';
ConfirmationScoreBadge.displayName = 'ConfirmationScoreBadge';
PatternTypeLabel.displayName = 'PatternTypeLabel';
ConfirmationStrengthBar.displayName = 'ConfirmationStrengthBar';

export default ConfirmationBadge;
