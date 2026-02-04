/**
 * ═══════════════════════════════════════════════════════════════════════════
 * INSIGHT CARD
 * ROI Proof System - Phase D
 * Card for displaying AI insights and recommendations
 * ═══════════════════════════════════════════════════════════════════════════
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import {
  TrendingUp,
  TrendingDown,
  Award,
  Shield,
  AlertTriangle,
  AlertOctagon,
  Star,
  Clock,
  Heart,
  Users,
  Info,
  Sparkles,
  Search,
  Calendar,
  ClipboardCheck,
  Sunrise,
} from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../utils/tokens';
import { INSIGHT_TYPES } from '../../services/proofAnalyticsService';

/**
 * Icon mapping
 */
const ICONS = {
  TrendingUp,
  TrendingDown,
  Award,
  Shield,
  AlertTriangle,
  AlertOctagon,
  Star,
  Clock,
  Heart,
  Users,
  Info,
  Sparkles,
  Search,
  Calendar,
  ClipboardCheck,
  Sunrise,
};

/**
 * Type configuration
 */
const TYPE_CONFIG = {
  [INSIGHT_TYPES.POSITIVE]: {
    bgColor: 'rgba(58, 247, 166, 0.1)',
    borderColor: 'rgba(58, 247, 166, 0.3)',
    iconColor: COLORS.success,
    textColor: COLORS.textPrimary,
  },
  [INSIGHT_TYPES.WARNING]: {
    bgColor: 'rgba(255, 184, 0, 0.1)',
    borderColor: 'rgba(255, 184, 0, 0.3)',
    iconColor: COLORS.warning,
    textColor: COLORS.textPrimary,
  },
  [INSIGHT_TYPES.NEUTRAL]: {
    bgColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    iconColor: COLORS.textMuted,
    textColor: COLORS.textSecondary,
  },
};

/**
 * InsightCard Component
 *
 * @param {Object} props
 * @param {Object} props.insight - Insight object { type, icon, text }
 * @param {Function} props.onPress - Optional press handler
 * @param {Object} props.style - Additional container styles
 */
const InsightCard = ({ insight, onPress, style }) => {
  const { type = INSIGHT_TYPES.NEUTRAL, icon = 'Info', text = '' } = insight || {};

  const config = TYPE_CONFIG[type] || TYPE_CONFIG[INSIGHT_TYPES.NEUTRAL];
  const IconComponent = ICONS[icon] || ICONS.Info;

  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container
      style={[
        styles.container,
        {
          backgroundColor: config.bgColor,
          borderColor: config.borderColor,
        },
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <IconComponent
          size={20}
          color={config.iconColor}
          strokeWidth={2}
        />
      </View>
      <Text style={[styles.text, { color: config.textColor }]}>
        {text}
      </Text>
    </Container>
  );
};

/**
 * InsightsList Component
 * Renders a list of insight cards
 */
export const InsightsList = ({
  insights = [],
  title = 'Phân tích AI',
  onInsightPress,
  style,
}) => {
  if (!insights || insights.length === 0) {
    return (
      <View style={[styles.listContainer, style]}>
        <Text style={styles.listTitle}>{title}</Text>
        <View style={styles.emptyState}>
          <Info size={24} color={COLORS.textMuted} />
          <Text style={styles.emptyText}>Chưa có phân tích</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.listContainer, style]}>
      <Text style={styles.listTitle}>{title}</Text>
      {insights.map((insight, index) => (
        <InsightCard
          key={`insight-${index}`}
          insight={insight}
          onPress={onInsightPress ? () => onInsightPress(insight, index) : undefined}
          style={index < insights.length - 1 ? styles.insightItem : undefined}
        />
      ))}
    </View>
  );
};

/**
 * NextStepCard Component
 * Card for action recommendations
 */
export const NextStepCard = ({
  step,
  onPress,
  style,
}) => {
  const { title, description, icon = 'Star' } = step || {};
  const IconComponent = ICONS[icon] || ICONS.Star;

  return (
    <TouchableOpacity
      style={[styles.stepCard, style]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.stepIconContainer}>
        <IconComponent
          size={24}
          color={COLORS.gold}
          strokeWidth={2}
        />
      </View>
      <View style={styles.stepContent}>
        <Text style={styles.stepTitle}>{title}</Text>
        <Text style={styles.stepDescription} numberOfLines={2}>
          {description}
        </Text>
      </View>
      <View style={styles.stepArrow}>
        <Text style={styles.arrowText}>{'>'}</Text>
      </View>
    </TouchableOpacity>
  );
};

/**
 * NextStepsList Component
 */
export const NextStepsList = ({
  steps = [],
  title = 'Bước tiếp theo',
  onStepPress,
  style,
}) => {
  if (!steps || steps.length === 0) {
    return null;
  }

  return (
    <View style={[styles.stepsListContainer, style]}>
      <Text style={styles.listTitle}>{title}</Text>
      {steps.map((step, index) => (
        <NextStepCard
          key={`step-${index}`}
          step={step}
          onPress={onStepPress ? () => onStepPress(step) : undefined}
          style={index < steps.length - 1 ? styles.stepItem : undefined}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  // Insight Card
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  text: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.base,
    lineHeight: 22,
  },

  // List Container
  listContainer: {
    backgroundColor: 'rgba(15, 16, 48, 0.55)',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
  },
  listTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  insightItem: {
    marginBottom: SPACING.sm,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textMuted,
    marginTop: SPACING.sm,
  },

  // Step Card
  stepCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: 'rgba(255, 189, 89, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.2)',
  },
  stepIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 189, 89, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  stepDescription: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  stepArrow: {
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowText: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    color: COLORS.gold,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },

  // Steps List
  stepsListContainer: {
    backgroundColor: 'rgba(15, 16, 48, 0.55)',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
  },
  stepItem: {
    marginBottom: SPACING.sm,
  },
});

export default React.memo(InsightCard);
