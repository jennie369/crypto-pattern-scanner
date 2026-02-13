/**
 * GEM Mobile - Odds Enhancer Scorecard Component
 * Displays 8 odds enhancers with scores and breakdown
 *
 * Phase 1C: Odds Enhancers + Freshness Tracking
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import {
  Zap,
  Clock,
  Star,
  TrendingUp,
  Globe,
  Layers,
  FastForward,
  Scale,
  ChevronDown,
  ChevronUp,
  Info,
} from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../utils/tokens';
import { ODDS_ENHANCERS } from '../../constants/oddsEnhancersConfig';

// Icon mapping
const ICON_MAP = {
  Zap: Zap,
  Clock: Clock,
  Star: Star,
  TrendingUp: TrendingUp,
  Globe: Globe,
  Layers: Layers,
  FastForward: FastForward,
  Scale: Scale,
};

/**
 * Single enhancer row component
 */
const EnhancerRow = ({ enhancer, score, onInfoPress }) => {
  const IconComponent = ICON_MAP[enhancer.icon] || Info;
  const percentage = (score / enhancer.maxScore) * 100;

  const getScoreColor = () => {
    if (score === 2) return '#22C55E'; // Green
    if (score === 1) return '#FFBD59'; // Yellow/Gold
    return '#EF4444'; // Red
  };

  return (
    <View style={styles.enhancerRow}>
      <View style={styles.enhancerLeft}>
        <View style={[styles.iconContainer, { backgroundColor: getScoreColor() + '20' }]}>
          <IconComponent size={16} color={getScoreColor()} />
        </View>
        <View style={styles.enhancerInfo}>
          <Text style={styles.enhancerName}>{enhancer.nameEn}</Text>
          <Text style={styles.enhancerNameVi}>{enhancer.name}</Text>
        </View>
      </View>

      <View style={styles.enhancerRight}>
        <View style={styles.progressContainer}>
          <View
            style={[
              styles.progressBar,
              {
                width: `${percentage}%`,
                backgroundColor: getScoreColor(),
              },
            ]}
          />
        </View>
        <Text style={[styles.scoreText, { color: getScoreColor() }]}>
          {score}/{enhancer.maxScore}
        </Text>
        <TouchableOpacity onPress={() => onInfoPress?.(enhancer)} style={styles.infoButton}>
          <Info size={14} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

/**
 * Main Scorecard Component
 */
const OddsEnhancerScorecard = ({
  scoreResult,
  collapsed = false,
  onInfoPress,
  style,
}) => {
  const [isExpanded, setIsExpanded] = useState(!collapsed);

  if (!scoreResult) {
    return null;
  }

  const { scores, totalScore, maxScore, grade, gradeColor, isTradeable, advice, breakdown } = scoreResult;

  return (
    <View style={[styles.container, style]}>
      {/* Header with grade */}
      <TouchableOpacity
        style={styles.header}
        onPress={() => setIsExpanded(!isExpanded)}
        activeOpacity={0.7}
      >
        <View style={styles.headerLeft}>
          <View style={[styles.gradeBadge, { backgroundColor: gradeColor }]}>
            <Text style={styles.gradeText}>{grade}</Text>
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>Odds Enhancers</Text>
            <Text style={styles.headerScore}>
              {totalScore}/{maxScore} points
            </Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          {isTradeable ? (
            <View style={styles.tradeableBadge}>
              <Text style={styles.tradeableText}>Tradeable</Text>
            </View>
          ) : (
            <View style={styles.skipBadge}>
              <Text style={styles.skipText}>Skip</Text>
            </View>
          )}
          {isExpanded ? (
            <ChevronUp size={20} color={COLORS.textSecondary} />
          ) : (
            <ChevronDown size={20} color={COLORS.textSecondary} />
          )}
        </View>
      </TouchableOpacity>

      {/* Expanded content */}
      {isExpanded && (
        <View style={styles.content}>
          {/* Score breakdown */}
          <View style={styles.enhancersList}>
            {Object.entries(ODDS_ENHANCERS).map(([key, enhancer]) => (
              <EnhancerRow
                key={enhancer.id}
                enhancer={enhancer}
                score={scores?.[enhancer.id] || 0}
                onInfoPress={onInfoPress}
              />
            ))}
          </View>

          {/* Trade advice */}
          <View style={[styles.adviceContainer, { borderLeftColor: gradeColor }]}>
            <Text style={styles.adviceText}>{advice}</Text>
          </View>
        </View>
      )}
    </View>
  );
};

/**
 * Compact version for pattern cards
 */
export const OddsEnhancerCompact = ({ scoreResult, onPress }) => {
  if (!scoreResult) return null;

  const { totalScore, maxScore, grade, gradeColor, isTradeable } = scoreResult;

  return (
    <TouchableOpacity
      style={styles.compactContainer}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.compactGrade, { backgroundColor: gradeColor }]}>
        <Text style={styles.compactGradeText}>{grade}</Text>
      </View>
      <View style={styles.compactInfo}>
        <Text style={styles.compactScore}>
          {totalScore}/{maxScore}
        </Text>
        <View style={styles.compactProgress}>
          <View
            style={[
              styles.compactProgressBar,
              {
                width: `${(totalScore / maxScore) * 100}%`,
                backgroundColor: gradeColor,
              },
            ]}
          />
        </View>
      </View>
      {isTradeable && (
        <View style={styles.compactTradeable}>
          <Zap size={12} color="#22C55E" />
        </View>
      )}
    </TouchableOpacity>
  );
};

/**
 * Mini badge for list items
 */
export const OddsGradeBadge = ({ grade, color, size = 'medium' }) => {
  const sizes = {
    small: { badge: 20, text: 10 },
    medium: { badge: 28, text: 12 },
    large: { badge: 36, text: 16 },
  };

  const sizeConfig = sizes[size] || sizes.medium;

  return (
    <View
      style={[
        styles.miniBadge,
        {
          width: sizeConfig.badge,
          height: sizeConfig.badge,
          backgroundColor: color || COLORS.textSecondary,
        },
      ]}
    >
      <Text style={[styles.miniBadgeText, { fontSize: sizeConfig.text }]}>
        {grade}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    backgroundColor: COLORS.surfaceLight,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  gradeBadge: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradeText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerInfo: {
    gap: 2,
  },
  headerTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
  },
  headerScore: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  tradeableBadge: {
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
  skipBadge: {
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

  // Content
  content: {
    padding: SPACING.md,
    gap: SPACING.md,
  },
  enhancersList: {
    gap: SPACING.sm,
  },

  // Enhancer row
  enhancerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.xs,
  },
  enhancerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flex: 1,
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: BORDER_RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  enhancerInfo: {
    flex: 1,
  },
  enhancerName: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '500',
  },
  enhancerNameVi: {
    color: COLORS.textSecondary,
    fontSize: 10,
  },
  enhancerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  progressContainer: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
  scoreText: {
    fontSize: 12,
    fontWeight: '600',
    width: 28,
    textAlign: 'center',
  },
  infoButton: {
    padding: 4,
  },

  // Advice
  adviceContainer: {
    borderLeftWidth: 3,
    paddingLeft: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  adviceText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontStyle: 'italic',
  },

  // Compact version
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.surface,
    paddingVertical: 6,
    paddingHorizontal: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  compactGrade: {
    width: 24,
    height: 24,
    borderRadius: BORDER_RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactGradeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  compactInfo: {
    flex: 1,
    gap: 2,
  },
  compactScore: {
    color: COLORS.textSecondary,
    fontSize: 10,
  },
  compactProgress: {
    height: 3,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  compactProgressBar: {
    height: '100%',
    borderRadius: 2,
  },
  compactTradeable: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#22C55E20',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Mini badge
  miniBadge: {
    borderRadius: BORDER_RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniBadgeText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

export default OddsEnhancerScorecard;
