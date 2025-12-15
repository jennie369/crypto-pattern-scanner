/**
 * ComboTracker Component
 * Vision Board Gamification - Daily Combo Display
 *
 * IMPORTANT: This component is DISPLAY ONLY!
 * Tracking happens automatically when user interacts with:
 * - AffirmationSection (affirmation_done)
 * - ActionPlanSection (habit_done)
 * - GoalCard check-in (goal_done)
 *
 * Features:
 * - 3 category indicators (Khẳng định, Thói quen, Mục tiêu)
 * - Combo multiplier display (x1, x1.5, x2)
 * - Visual progress ring
 *
 * Design: Liquid Glass theme, dark mode
 */

import React, { memo, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles, Target, ListChecks, Check, Zap } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { COLORS, SPACING, TYPOGRAPHY, GLASS } from '../../utils/tokens';
import Svg, { Circle } from 'react-native-svg';

// Category definitions with tooltips
const CATEGORIES = [
  {
    id: 'affirmation',
    label: 'Khẳng định',
    icon: Sparkles,
    color: COLORS.purple,
    tooltip: 'Bấm nút Done sau khi đọc khẳng định',
  },
  {
    id: 'habit',
    label: 'Thói quen',
    icon: ListChecks,
    color: COLORS.cyan,
    tooltip: 'Tick hoàn thành các bước trong kế hoạch hành động',
  },
  {
    id: 'goal',
    label: 'Mục tiêu',
    icon: Target,
    color: COLORS.gold,
    tooltip: 'Tick hoàn thành mục tiêu hoặc hoàn thành tất cả bước hành động',
  },
];

// Multiplier badge component
const MultiplierBadge = memo(({ multiplier, comboCount }) => {
  const getMultiplierColor = () => {
    if (multiplier >= 2.0) return COLORS.gold;
    if (multiplier >= 1.5) return COLORS.success;
    return COLORS.textMuted;
  };

  const color = getMultiplierColor();

  return (
    <View style={[styles.multiplierBadge, { borderColor: color }]}>
      <Zap size={14} color={color} fill={multiplier >= 2.0 ? color : 'transparent'} />
      <Text style={[styles.multiplierText, { color }]}>
        x{multiplier.toFixed(1)}
      </Text>
    </View>
  );
});

// Category indicator component with tooltip
const CategoryIndicator = memo(({ category, isDone, showTooltip, onToggleTooltip }) => {
  const IconComponent = category.icon;

  return (
    <TouchableOpacity
      style={styles.categoryItem}
      onPress={onToggleTooltip}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.categoryIcon,
          {
            borderColor: isDone ? category.color : 'rgba(255,255,255,0.2)',
            backgroundColor: isDone ? category.color + '20' : 'transparent',
          },
        ]}
      >
        {isDone ? (
          <Check size={18} color={category.color} />
        ) : (
          <IconComponent size={18} color={COLORS.textMuted} />
        )}
      </View>
      <Text
        style={[
          styles.categoryLabel,
          { color: isDone ? category.color : COLORS.textMuted },
        ]}
      >
        {category.label}
      </Text>
      {showTooltip && (
        <View style={styles.categoryTooltip}>
          <Text style={styles.categoryTooltipText}>{category.tooltip}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
});

// Progress ring component
const ProgressRing = memo(({ progress, size = 60, strokeWidth = 4 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 3) * circumference;

  return (
    <View style={[styles.progressRing, { width: size, height: size }]}>
      <Svg width={size} height={size} style={styles.progressSvg}>
        {/* Background circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={progress === 3 ? COLORS.gold : COLORS.purple}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={styles.progressText}>
        <Text style={styles.progressCount}>{progress}</Text>
        <Text style={styles.progressTotal}>/3</Text>
      </View>
    </View>
  );
});

const ComboTracker = memo(({
  affirmationDone = false,
  habitDone = false,
  goalDone = false,
  comboCount = 0,
  multiplier = 1.0,
}) => {
  const [activeTooltip, setActiveTooltip] = useState(null);

  const categoryStatus = useMemo(() => ({
    affirmation: affirmationDone,
    habit: habitDone,
    goal: goalDone,
  }), [affirmationDone, habitDone, goalDone]);

  const isFullCombo = comboCount === 3;

  const handleToggleTooltip = (categoryId) => {
    setActiveTooltip(activeTooltip === categoryId ? null : categoryId);
  };

  return (
    <View style={styles.container}>
      <BlurView intensity={GLASS.blur} tint="dark" style={styles.blurContainer}>
        <LinearGradient
          colors={['rgba(15, 16, 48, 0.55)', 'rgba(15, 16, 48, 0.4)']}
          style={styles.gradient}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Combo hôm nay</Text>
            <MultiplierBadge multiplier={multiplier} comboCount={comboCount} />
          </View>

          {/* Content */}
          <View style={styles.content}>
            {/* Progress Ring */}
            <ProgressRing progress={comboCount} />

            {/* Category Indicators */}
            <View style={styles.categories}>
              {CATEGORIES.map(category => (
                <CategoryIndicator
                  key={category.id}
                  category={category}
                  isDone={categoryStatus[category.id]}
                  showTooltip={activeTooltip === category.id}
                  onToggleTooltip={() => handleToggleTooltip(category.id)}
                />
              ))}
            </View>
          </View>

          {/* Full combo message */}
          {isFullCombo && (
            <View style={styles.comboMessage}>
              <Zap size={16} color={COLORS.gold} fill={COLORS.gold} />
              <Text style={styles.comboMessageText}>
                Tuyệt vời! Full Combo x2
              </Text>
            </View>
          )}
        </LinearGradient>
      </BlurView>

      {/* Glow effect for full combo */}
      {isFullCombo && <View style={styles.glowEffect} />}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    borderRadius: GLASS.borderRadius,
    overflow: 'hidden',
    borderWidth: GLASS.borderWidth,
    borderColor: 'rgba(106, 91, 255, 0.3)',
  },
  blurContainer: {
    overflow: 'hidden',
    borderRadius: GLASS.borderRadius - GLASS.borderWidth,
  },
  gradient: {
    padding: SPACING.lg,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  multiplierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  multiplierText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },

  // Content
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  // Progress Ring
  progressRing: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressSvg: {
    position: 'absolute',
  },
  progressText: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  progressCount: {
    fontSize: TYPOGRAPHY.fontSize.display,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  progressTotal: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
  },

  // Categories
  categories: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginLeft: SPACING.lg,
  },
  categoryItem: {
    alignItems: 'center',
    gap: SPACING.xs,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  categoryTooltip: {
    position: 'absolute',
    bottom: '100%',
    left: -40,
    right: -40,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    borderRadius: 8,
    padding: SPACING.sm,
    marginBottom: 8,
    zIndex: 100,
    borderWidth: 1,
    borderColor: COLORS.gold + '40',
  },
  categoryTooltipText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textPrimary,
    textAlign: 'center',
    lineHeight: 16,
  },

  // Combo message
  comboMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.gold + '15',
    borderRadius: 8,
  },
  comboMessageText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.gold,
  },

  // Glow effect
  glowEffect: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: COLORS.gold,
    opacity: 0.6,
  },
});

export default ComboTracker;
