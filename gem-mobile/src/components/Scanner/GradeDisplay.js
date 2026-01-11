/**
 * GEM Mobile - Grade Display Component
 * Visual display for pattern grades (A+ to F)
 *
 * Phase 1C: Odds Enhancers + Freshness Tracking
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {
  Award,
  Star,
  TrendingUp,
  AlertTriangle,
  XCircle,
  Check,
  Info,
} from 'lucide-react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '../../utils/tokens';
import {
  GRADE_THRESHOLDS,
  getGradeFromScore,
  getPositionSizeFromGrade,
  getTradeAdvice,
} from '../../constants/oddsEnhancersConfig';

// Icon mapping for grades
const GRADE_ICONS = {
  'A+': Award,
  'A': Star,
  'B': TrendingUp,
  'C': AlertTriangle,
  'D': AlertTriangle,
  'F': XCircle,
};

/**
 * Main Grade Display - Large circular badge
 */
const GradeDisplay = ({
  grade,
  score,
  maxScore = 16,
  size = 'large',
  showScore = true,
  showLabel = true,
  onPress,
  style,
}) => {
  const gradeInfo = GRADE_THRESHOLDS[grade] || GRADE_THRESHOLDS['F'];
  const IconComponent = GRADE_ICONS[grade] || AlertTriangle;

  const sizes = {
    small: { container: 48, text: 18, icon: 16, score: 10 },
    medium: { container: 64, text: 24, icon: 20, score: 12 },
    large: { container: 80, text: 32, icon: 24, score: 14 },
    xlarge: { container: 100, text: 40, icon: 28, score: 16 },
  };

  const sizeConfig = sizes[size] || sizes.large;

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress}
    >
      {/* Main badge */}
      <View
        style={[
          styles.badge,
          {
            width: sizeConfig.container,
            height: sizeConfig.container,
            backgroundColor: gradeInfo.color,
          },
        ]}
      >
        <Text style={[styles.gradeText, { fontSize: sizeConfig.text }]}>
          {grade}
        </Text>
      </View>

      {/* Score below */}
      {showScore && (
        <Text style={[styles.scoreText, { fontSize: sizeConfig.score }]}>
          {score}/{maxScore}
        </Text>
      )}

      {/* Label */}
      {showLabel && (
        <Text style={styles.labelText}>{gradeInfo.description}</Text>
      )}
    </TouchableOpacity>
  );
};

/**
 * Grade Badge - Compact inline badge
 */
export const GradeBadge = ({
  grade,
  size = 'medium',
  showIcon = false,
  style,
}) => {
  const gradeInfo = GRADE_THRESHOLDS[grade] || GRADE_THRESHOLDS['F'];
  const IconComponent = GRADE_ICONS[grade] || AlertTriangle;

  const sizes = {
    tiny: { padding: 2, text: 8, icon: 8 },
    small: { padding: 4, text: 10, icon: 10 },
    medium: { padding: 6, text: 12, icon: 12 },
    large: { padding: 8, text: 14, icon: 14 },
  };

  const sizeConfig = sizes[size] || sizes.medium;

  return (
    <View
      style={[
        styles.gradeBadge,
        {
          paddingHorizontal: sizeConfig.padding * 1.5,
          paddingVertical: sizeConfig.padding,
          backgroundColor: gradeInfo.color,
        },
        style,
      ]}
    >
      {showIcon && (
        <IconComponent size={sizeConfig.icon} color="#FFFFFF" />
      )}
      <Text style={[styles.gradeBadgeText, { fontSize: sizeConfig.text }]}>
        {grade}
      </Text>
    </View>
  );
};

/**
 * Grade Progress Ring - Circular progress with grade
 */
export const GradeProgressRing = ({
  score,
  maxScore = 16,
  size = 80,
  strokeWidth = 6,
  style,
}) => {
  const gradeInfo = getGradeFromScore(score);
  const percentage = (score / maxScore) * 100;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <View style={[styles.ringContainer, { width: size, height: size }, style]}>
      {/* Background circle */}
      <View
        style={[
          styles.ringBackground,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
          },
        ]}
      />

      {/* Progress arc (simplified - using View transform) */}
      <View
        style={[
          styles.ringProgress,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: gradeInfo.color,
            transform: [{ rotate: `${(percentage / 100) * 360 - 90}deg` }],
          },
        ]}
      />

      {/* Center content */}
      <View style={styles.ringCenter}>
        <Text style={[styles.ringGrade, { color: gradeInfo.color }]}>
          {gradeInfo.grade}
        </Text>
        <Text style={styles.ringScore}>
          {score}/{maxScore}
        </Text>
      </View>
    </View>
  );
};

/**
 * Position Size Indicator - Shows recommended position size based on grade
 */
export const PositionSizeIndicator = ({
  grade,
  size = 'medium',
  style,
}) => {
  const gradeInfo = GRADE_THRESHOLDS[grade] || GRADE_THRESHOLDS['F'];
  const positionSize = getPositionSizeFromGrade(grade);

  const sizes = {
    small: { width: 80, text: 10 },
    medium: { width: 120, text: 12 },
    large: { width: 160, text: 14 },
  };

  const sizeConfig = sizes[size] || sizes.medium;

  return (
    <View style={[styles.positionContainer, { width: sizeConfig.width }, style]}>
      <Text style={[styles.positionLabel, { fontSize: sizeConfig.text - 2 }]}>
        Position Size
      </Text>
      <View style={styles.positionTrack}>
        <View
          style={[
            styles.positionFill,
            {
              width: `${positionSize}%`,
              backgroundColor: gradeInfo.color,
            },
          ]}
        />
      </View>
      <Text style={[styles.positionPercent, { fontSize: sizeConfig.text, color: gradeInfo.color }]}>
        {positionSize}%
      </Text>
    </View>
  );
};

/**
 * Grade Legend - Shows all grade levels
 */
export const GradeLegend = ({ currentGrade, style }) => {
  const grades = ['A+', 'A', 'B', 'C', 'D', 'F'];

  return (
    <View style={[styles.legendContainer, style]}>
      {grades.map((grade) => {
        const gradeInfo = GRADE_THRESHOLDS[grade];
        const isActive = currentGrade === grade;

        return (
          <View
            key={grade}
            style={[
              styles.legendItem,
              isActive && styles.legendItemActive,
              { borderColor: gradeInfo.color },
            ]}
          >
            <View
              style={[
                styles.legendDot,
                { backgroundColor: gradeInfo.color },
              ]}
            />
            <Text
              style={[
                styles.legendText,
                isActive && { color: gradeInfo.color, fontWeight: 'bold' },
              ]}
            >
              {grade}
            </Text>
            <Text style={styles.legendRange}>
              {gradeInfo.min}-{gradeInfo.max}
            </Text>
          </View>
        );
      })}
    </View>
  );
};

/**
 * Trade Decision Card - Full trade decision display with grade
 */
export const TradeDecisionCard = ({
  grade,
  score,
  maxScore = 16,
  onInfoPress,
  style,
}) => {
  const gradeInfo = GRADE_THRESHOLDS[grade] || GRADE_THRESHOLDS['F'];
  const positionSize = getPositionSizeFromGrade(grade);
  const advice = getTradeAdvice(grade);
  const isTradeable = positionSize > 0;
  const IconComponent = GRADE_ICONS[grade] || AlertTriangle;

  return (
    <View style={[styles.decisionCard, { borderLeftColor: gradeInfo.color }, style]}>
      <View style={styles.decisionHeader}>
        <View style={styles.decisionLeft}>
          <View style={[styles.decisionBadge, { backgroundColor: gradeInfo.color }]}>
            <Text style={styles.decisionGrade}>{grade}</Text>
          </View>
          <View style={styles.decisionInfo}>
            <Text style={styles.decisionTitle}>Trade Decision</Text>
            <Text style={[styles.decisionScore, { color: gradeInfo.color }]}>
              {score}/{maxScore} points
            </Text>
          </View>
        </View>

        {isTradeable ? (
          <View style={styles.tradeableTag}>
            <Check size={12} color="#22C55E" />
            <Text style={styles.tradeableText}>Trade</Text>
          </View>
        ) : (
          <View style={styles.skipTag}>
            <XCircle size={12} color="#EF4444" />
            <Text style={styles.skipText}>Skip</Text>
          </View>
        )}

        {onInfoPress && (
          <TouchableOpacity onPress={onInfoPress} style={styles.decisionInfoBtn}>
            <Info size={16} color={COLORS.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.decisionBody}>
        <Text style={styles.adviceText}>{advice}</Text>
      </View>

      {isTradeable && (
        <View style={styles.decisionFooter}>
          <View style={styles.footerItem}>
            <Text style={styles.footerLabel}>Recommended Size</Text>
            <Text style={[styles.footerValue, { color: gradeInfo.color }]}>
              {positionSize}%
            </Text>
          </View>
          <View style={styles.footerDivider} />
          <View style={styles.footerItem}>
            <Text style={styles.footerLabel}>Grade Meaning</Text>
            <Text style={styles.footerValue}>{gradeInfo.description}</Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  // Main display
  container: {
    alignItems: 'center',
    gap: SPACING.xs,
  },
  badge: {
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  gradeText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  scoreText: {
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  labelText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    textAlign: 'center',
    maxWidth: 120,
  },

  // Grade badge (inline)
  gradeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: BORDER_RADIUS.sm,
  },
  gradeBadgeText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },

  // Progress ring
  ringContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringBackground: {
    position: 'absolute',
    borderColor: COLORS.border,
  },
  ringProgress: {
    position: 'absolute',
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  ringCenter: {
    alignItems: 'center',
  },
  ringGrade: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  ringScore: {
    color: COLORS.textSecondary,
    fontSize: 10,
  },

  // Position size
  positionContainer: {
    gap: 4,
  },
  positionLabel: {
    color: COLORS.textSecondary,
  },
  positionTrack: {
    height: 6,
    backgroundColor: COLORS.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  positionFill: {
    height: '100%',
    borderRadius: 3,
  },
  positionPercent: {
    fontWeight: '600',
    textAlign: 'right',
  },

  // Legend
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  legendItemActive: {
    backgroundColor: COLORS.surfaceLight,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    color: COLORS.textSecondary,
    fontSize: 11,
  },
  legendRange: {
    color: COLORS.textSecondary,
    fontSize: 9,
  },

  // Trade decision card
  decisionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    borderLeftWidth: 4,
    overflow: 'hidden',
  },
  decisionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.surfaceLight,
  },
  decisionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flex: 1,
  },
  decisionBadge: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  decisionGrade: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  decisionInfo: {
    gap: 2,
  },
  decisionTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
  },
  decisionScore: {
    fontSize: 12,
  },
  tradeableTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#22C55E20',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
  },
  tradeableText: {
    color: '#22C55E',
    fontSize: 11,
    fontWeight: '600',
  },
  skipTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EF444420',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
  },
  skipText: {
    color: '#EF4444',
    fontSize: 11,
    fontWeight: '600',
  },
  decisionInfoBtn: {
    padding: 8,
    marginLeft: SPACING.xs,
  },
  decisionBody: {
    padding: SPACING.md,
  },
  adviceText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  decisionFooter: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    padding: SPACING.md,
  },
  footerItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  footerLabel: {
    color: COLORS.textSecondary,
    fontSize: 10,
  },
  footerValue: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  footerDivider: {
    width: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: SPACING.sm,
  },
});

export default GradeDisplay;
