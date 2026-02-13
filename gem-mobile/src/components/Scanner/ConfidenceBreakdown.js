/**
 * =====================================================
 * File: src/components/Scanner/ConfidenceBreakdown.js
 * Description: Confidence score breakdown display
 * Access: TIER 1+ (confidenceBreakdown feature)
 * =====================================================
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import {
  TrendingUp,
  Volume2,
  Target,
  BarChart2,
  Activity,
  GitBranch,
  Layers,
  ChevronDown,
  ChevronUp,
  Info,
} from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '../../utils/tokens';

/**
 * Factor configuration with icons and labels
 */
const FACTOR_CONFIG = {
  volume: {
    label: 'Volume',
    icon: Volume2,
    maxScore: 20,
    description: 'Volume confirmation on pattern',
  },
  zoneRetest: {
    label: 'Zone Retest',
    icon: Target,
    maxScore: 15,
    description: 'Price retested zone before entry',
  },
  htfAlignment: {
    label: 'HTF Trend',
    icon: TrendingUp,
    maxScore: 15,
    description: 'Alignment with higher timeframe trend',
  },
  patternQuality: {
    label: 'Pattern Quality',
    icon: Layers,
    maxScore: 10,
    description: 'Pattern symmetry and clarity',
  },
  swingQuality: {
    label: 'Swing Quality',
    icon: Activity,
    maxScore: 10,
    description: 'Swing point confirmation',
  },
  rsiDivergence: {
    label: 'RSI Divergence',
    icon: GitBranch,
    maxScore: 10,
    description: 'RSI divergence detected',
  },
  srConfluence: {
    label: 'S/R Confluence',
    icon: BarChart2,
    maxScore: 10,
    description: 'Nearby support/resistance levels',
  },
};

/**
 * Get color based on score percentage
 */
function getScoreColor(score, maxScore) {
  const percent = (score / maxScore) * 100;
  if (percent >= 70) return COLORS.success || '#0ECB81';
  if (percent >= 40) return COLORS.warning || '#FFBD59';
  if (percent > 0) return COLORS.error || '#F6465D';
  return COLORS.textMuted || '#666';
}

/**
 * Get color for grade
 */
function getGradeColor(grade) {
  switch (grade) {
    case 'A+':
    case 'A':
      return '#0ECB81';
    case 'B+':
    case 'B':
      return '#FFBD59';
    case 'C':
      return '#F6465D';
    default:
      return '#888';
  }
}

/**
 * Score bar component
 */
const ScoreBar = ({ score, maxScore, color }) => {
  const width = Math.max(0, Math.min(100, (score / maxScore) * 100));

  return (
    <View style={styles.scoreBarContainer}>
      <View style={styles.scoreBarBackground}>
        <Animated.View
          style={[
            styles.scoreBarFill,
            { width: `${width}%`, backgroundColor: color },
          ]}
        />
      </View>
      <Text style={[styles.scoreValue, { color }]}>
        {score > 0 ? `+${score}` : score}
      </Text>
    </View>
  );
};

/**
 * Single factor row
 */
const FactorRow = ({ factorKey, data, onPress }) => {
  const config = FACTOR_CONFIG[factorKey];
  if (!config) return null;

  const Icon = config.icon;
  const score = data?.score || 0;
  const maxScore = config.maxScore;
  const color = getScoreColor(score, maxScore);

  return (
    <TouchableOpacity
      style={styles.factorRow}
      onPress={() => onPress?.(factorKey, data)}
      activeOpacity={0.7}
    >
      <View style={styles.factorLeft}>
        <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
          <Icon size={14} color={color} />
        </View>
        <Text style={styles.factorLabel}>{config.label}</Text>
      </View>
      <ScoreBar score={score} maxScore={maxScore} color={color} />
    </TouchableOpacity>
  );
};

/**
 * ConfidenceBreakdown Component
 *
 * @param {Object} props
 * @param {number} props.score - Total confidence score
 * @param {string} props.grade - Confidence grade (A+, A, B+, B, C, REJECT)
 * @param {Object} props.breakdown - Score breakdown by factor
 * @param {Array} props.warnings - Warning messages
 * @param {string} props.recommendation - Trading recommendation
 * @param {boolean} props.expanded - Whether to show full breakdown
 * @param {Function} props.onToggle - Toggle expanded state
 * @param {Function} props.onFactorPress - Factor item press handler
 * @param {Object} props.style - Additional container style
 */
const ConfidenceBreakdown = ({
  score = 0,
  grade = 'C',
  gradeInfo = {},
  breakdown = {},
  warnings = [],
  recommendation = '',
  expanded = false,
  onToggle,
  onFactorPress,
  style,
}) => {
  const gradeColor = getGradeColor(grade);
  const factorKeys = Object.keys(breakdown).filter(k => FACTOR_CONFIG[k]);

  return (
    <View style={[styles.container, style]}>
      {/* Header */}
      <TouchableOpacity
        style={styles.header}
        onPress={onToggle}
        activeOpacity={0.7}
      >
        <View style={styles.headerLeft}>
          <View style={[styles.gradeCircle, { borderColor: gradeColor }]}>
            <Text style={[styles.gradeText, { color: gradeColor }]}>{grade}</Text>
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.scoreText}>Confidence: {score}%</Text>
            <Text style={[styles.gradeLabel, { color: gradeColor }]}>
              {gradeInfo?.label || grade}
            </Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          {expanded ? (
            <ChevronUp size={20} color={COLORS.textSecondary} />
          ) : (
            <ChevronDown size={20} color={COLORS.textSecondary} />
          )}
        </View>
      </TouchableOpacity>

      {/* Expanded content */}
      {expanded && (
        <View style={styles.expandedContent}>
          {/* Factor breakdown */}
          <View style={styles.factorsContainer}>
            {factorKeys.map(key => (
              <FactorRow
                key={key}
                factorKey={key}
                data={breakdown[key]}
                onPress={onFactorPress}
              />
            ))}
          </View>

          {/* Warnings */}
          {warnings?.length > 0 && (
            <View style={styles.warningsContainer}>
              {warnings.map((warning, index) => (
                <View key={index} style={styles.warningRow}>
                  <Info size={12} color={COLORS.warning || '#FFBD59'} />
                  <Text style={styles.warningText}>{warning}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Recommendation */}
          {recommendation && (
            <View style={styles.recommendationContainer}>
              <Text style={styles.recommendationText}>{recommendation}</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

/**
 * Compact version for pattern list items
 */
export const ConfidenceCompact = ({ score, grade }) => {
  const gradeColor = getGradeColor(grade);

  return (
    <View style={styles.compactContainer}>
      <View style={[styles.compactGrade, { borderColor: gradeColor }]}>
        <Text style={[styles.compactGradeText, { color: gradeColor }]}>{grade}</Text>
      </View>
      <Text style={styles.compactScore}>{score}%</Text>
    </View>
  );
};

/**
 * Mini badge for inline display
 */
export const ConfidenceBadge = ({ score, grade, size = 'md' }) => {
  const gradeColor = getGradeColor(grade);
  const isSmall = size === 'sm';

  return (
    <View style={[
      styles.badgeContainer,
      { backgroundColor: `${gradeColor}20`, borderColor: gradeColor },
      isSmall && styles.badgeSmall,
    ]}>
      <Text style={[
        styles.badgeText,
        { color: gradeColor },
        isSmall && styles.badgeTextSmall,
      ]}>
        {grade} | {score}%
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.cardBg || '#1A1A2E',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border || '#2D2D44',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md || 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm || 8,
  },
  headerInfo: {
    marginLeft: SPACING.sm || 8,
  },
  headerRight: {
    padding: 4,
  },
  gradeCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  gradeText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  scoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary || '#FFF',
  },
  gradeLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  expandedContent: {
    paddingHorizontal: SPACING.md || 12,
    paddingBottom: SPACING.md || 12,
  },
  factorsContainer: {
    gap: SPACING.xs || 6,
  },
  factorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  factorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs || 6,
    flex: 1,
  },
  iconContainer: {
    width: 24,
    height: 24,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  factorLabel: {
    fontSize: 13,
    color: COLORS.textSecondary || '#AAA',
  },
  scoreBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: 100,
  },
  scoreBarBackground: {
    flex: 1,
    height: 4,
    backgroundColor: COLORS.border || '#2D2D44',
    borderRadius: 2,
    overflow: 'hidden',
  },
  scoreBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  scoreValue: {
    fontSize: 12,
    fontWeight: '600',
    width: 30,
    textAlign: 'right',
  },
  warningsContainer: {
    marginTop: SPACING.md || 12,
    padding: SPACING.sm || 8,
    backgroundColor: 'rgba(255, 189, 89, 0.1)',
    borderRadius: 8,
    gap: 4,
  },
  warningRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  warningText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.warning || '#FFBD59',
  },
  recommendationContainer: {
    marginTop: SPACING.sm || 8,
    padding: SPACING.sm || 8,
    backgroundColor: 'rgba(14, 203, 129, 0.1)',
    borderRadius: 8,
  },
  recommendationText: {
    fontSize: 12,
    color: COLORS.success || '#0ECB81',
    fontStyle: 'italic',
  },
  // Compact styles
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  compactGrade: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
  },
  compactGradeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  compactScore: {
    fontSize: 12,
    color: COLORS.textSecondary || '#AAA',
  },
  // Badge styles
  badgeContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  badgeSmall: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  badgeTextSmall: {
    fontSize: 10,
  },
});

export default ConfidenceBreakdown;
