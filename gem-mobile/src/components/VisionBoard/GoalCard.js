/**
 * Goal Card Component
 * Goal progress card with progress bar
 *
 * Created: December 9, 2025
 * Part of Vision Board 2.0 Redesign
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Icons from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, SPACING, GLASS } from '../../utils/tokens';

// Life area configuration - 6 lĩnh vực cuộc sống theo kịch bản demo
const LIFE_AREA_CONFIG = {
  finance: { label: 'Tài chính', icon: 'Wallet', color: COLORS.gold },
  career: { label: 'Sự nghiệp', icon: 'Briefcase', color: COLORS.purple },
  health: { label: 'Sức khỏe', icon: 'Heart', color: COLORS.success },
  relationships: { label: 'Tình yêu', icon: 'Heart', color: '#FF6B9D' },
  personal: { label: 'Cá nhân', icon: 'User', color: COLORS.cyan },
  spiritual: { label: 'Tâm thức', icon: 'Sparkles', color: COLORS.burgundy },
};

const GoalCard = ({
  goal,
  onPress,
  showActions = true,
  style,
}) => {
  const lifeArea = goal?.content?.life_area || goal?.life_area || 'personal';
  const config = LIFE_AREA_CONFIG[lifeArea] || LIFE_AREA_CONFIG.personal;
  const IconComponent = Icons[config.icon] || Icons.Target;

  const title = goal?.content?.title || goal?.title || 'Mục tiêu';
  const progress = goal?.content?.progress || goal?.progress || 0;
  const deadline = goal?.content?.deadline || goal?.deadline;
  const actionsCompleted = goal?.actions_completed || 0;
  const actionsTotal = goal?.actions_total || 0;
  const isCompleted = goal?.is_completed || false;

  // Format deadline
  const formatDeadline = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.ceil((date - now) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { text: 'Quá hạn', color: COLORS.error };
    if (diffDays === 0) return { text: 'Hôm nay', color: COLORS.gold };
    if (diffDays === 1) return { text: 'Ngày mai', color: COLORS.gold };
    if (diffDays <= 7) return { text: `${diffDays} ngày`, color: COLORS.cyan };
    return { text: date.toLocaleDateString('vi-VN'), color: COLORS.textMuted };
  };

  const deadlineInfo = formatDeadline(deadline);

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={() => onPress?.(goal)}
      activeOpacity={0.8}
    >
      {/* Top section */}
      <View style={styles.topSection}>
        <View style={[styles.iconContainer, { backgroundColor: `${config.color}20` }]}>
          <IconComponent size={20} color={config.color} />
        </View>

        <View style={styles.goalInfo}>
          <Text style={styles.lifeAreaLabel}>{config.label}</Text>
          <Text style={styles.goalTitle} numberOfLines={2}>{title}</Text>
        </View>

        {isCompleted && (
          <View style={styles.completedBadge}>
            <Icons.CheckCircle size={20} color={COLORS.success} />
          </View>
        )}
      </View>

      {/* Progress section */}
      <View style={styles.progressSection}>
        <View style={styles.progressBar}>
          <LinearGradient
            colors={[config.color, `${config.color}80`]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.progressFill, { width: `${Math.min(100, progress)}%` }]}
          />
        </View>
        <Text style={[styles.progressText, { color: config.color }]}>
          {progress}%
        </Text>
      </View>

      {/* Bottom section */}
      <View style={styles.bottomSection}>
        {/* Actions count */}
        {showActions && actionsTotal > 0 && (
          <View style={styles.actionsInfo}>
            <Icons.ListTodo size={14} color={COLORS.textMuted} />
            <Text style={styles.actionsText}>
              {actionsCompleted}/{actionsTotal} hành động
            </Text>
          </View>
        )}

        {/* Deadline */}
        {deadlineInfo && (
          <View style={styles.deadlineInfo}>
            <Icons.Calendar size={14} color={deadlineInfo.color} />
            <Text style={[styles.deadlineText, { color: deadlineInfo.color }]}>
              {deadlineInfo.text}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

// Horizontal scroll list of goals
export const GoalCardsRow = ({
  goals = [],
  onGoalPress,
  onViewAll,
  title = 'Mục tiêu của tôi',
  style,
}) => {
  return (
    <View style={[styles.rowContainer, style]}>
      {/* Header */}
      <View style={styles.rowHeader}>
        <View style={styles.rowHeaderLeft}>
          <Icons.Target size={18} color={COLORS.purple} />
          <Text style={styles.rowTitle}>{title}</Text>
        </View>
        {onViewAll && goals.length > 0 && (
          <TouchableOpacity onPress={onViewAll} style={styles.viewAllButton}>
            <Text style={styles.viewAllText}>Xem tất cả</Text>
            <Icons.ChevronRight size={14} color={COLORS.purple} />
          </TouchableOpacity>
        )}
      </View>

      {/* Goals scroll */}
      {goals.length === 0 ? (
        <View style={styles.emptyState}>
          <Icons.Target size={40} color={COLORS.textMuted} />
          <Text style={styles.emptyText}>Chưa có mục tiêu nào</Text>
          <TouchableOpacity style={styles.addGoalButton}>
            <Icons.Plus size={16} color={COLORS.purple} />
            <Text style={styles.addGoalText}>Thêm mục tiêu</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {goals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onPress={onGoalPress}
              style={styles.scrollGoalCard}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
};

// Compact goal card for grid
export const GoalCardCompact = ({
  goal,
  onPress,
}) => {
  const lifeArea = goal?.content?.life_area || 'personal';
  const config = LIFE_AREA_CONFIG[lifeArea] || LIFE_AREA_CONFIG.personal;
  const IconComponent = Icons[config.icon] || Icons.Target;
  const progress = goal?.content?.progress || goal?.progress || 0;

  return (
    <TouchableOpacity
      style={styles.compactCard}
      onPress={() => onPress?.(goal)}
    >
      <View style={[styles.compactIcon, { backgroundColor: `${config.color}20` }]}>
        <IconComponent size={16} color={config.color} />
      </View>
      <Text style={styles.compactTitle} numberOfLines={1}>
        {goal?.content?.title || goal?.title || 'Mục tiêu'}
      </Text>
      <View style={styles.compactProgressContainer}>
        <View style={styles.compactProgressBar}>
          <View
            style={[
              styles.compactProgressFill,
              { width: `${progress}%`, backgroundColor: config.color },
            ]}
          />
        </View>
        <Text style={[styles.compactProgressText, { color: config.color }]}>
          {progress}%
        </Text>
      </View>
    </TouchableOpacity>
  );
};

// Mini milestone indicator
export const MilestoneIndicator = ({ progress = 0 }) => {
  const milestones = [25, 50, 75, 100];

  return (
    <View style={styles.milestoneContainer}>
      {milestones.map((milestone) => (
        <View
          key={milestone}
          style={[
            styles.milestoneDot,
            progress >= milestone && styles.milestoneDotReached,
          ]}
        >
          {progress >= milestone && (
            <Icons.Check size={8} color={COLORS.bgDarkest} />
          )}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.glassBg,
    borderRadius: GLASS.borderRadius,
    padding: SPACING.lg,
    borderWidth: GLASS.borderWidth,
    borderColor: 'rgba(106, 91, 255, 0.3)',
    width: 260,
  },
  topSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  goalInfo: {
    flex: 1,
  },
  lifeAreaLabel: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  goalTitle: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    marginTop: SPACING.xxs,
    lineHeight: 22,
  },
  completedBadge: {
    marginLeft: SPACING.sm,
  },
  progressSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: SPACING.sm,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    minWidth: 40,
    textAlign: 'right',
  },
  bottomSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionsText: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.fontSize.xs,
    marginLeft: SPACING.xs,
  },
  deadlineInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deadlineText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    marginLeft: SPACING.xs,
  },

  // Row styles
  rowContainer: {
    marginBottom: SPACING.lg,
  },
  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  rowHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowTitle: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    marginLeft: SPACING.sm,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    color: COLORS.purple,
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
  },
  scrollGoalCard: {
    marginRight: 0,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    marginHorizontal: SPACING.lg,
    backgroundColor: COLORS.glassBg,
    borderRadius: GLASS.borderRadius,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
    borderStyle: 'dashed',
  },
  emptyText: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.fontSize.sm,
    marginTop: SPACING.md,
  },
  addGoalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.purple,
  },
  addGoalText: {
    color: COLORS.purple,
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    marginLeft: SPACING.xs,
  },

  // Compact styles
  compactCard: {
    backgroundColor: COLORS.glassBg,
    borderRadius: SPACING.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
  },
  compactIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  compactTitle: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    marginBottom: SPACING.sm,
  },
  compactProgressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compactProgressBar: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
    marginRight: SPACING.sm,
  },
  compactProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  compactProgressText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },

  // Milestone styles
  milestoneContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.sm,
  },
  milestoneDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  milestoneDotReached: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
  },
});

export default GoalCard;
