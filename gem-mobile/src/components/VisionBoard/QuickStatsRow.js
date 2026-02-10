/**
 * Quick Stats Row Component
 * 4 mini stat cards (Goals, Affirmations, Habits, XP)
 *
 * Created: December 9, 2025
 * Part of Vision Board 2.0 Redesign
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import * as Icons from 'lucide-react-native';
import { useSettings } from '../../contexts/SettingsContext';

const QuickStatsRow = ({
  stats = {
    goals: { completed: 0, total: 0 },
    affirmations: { completed: 0, total: 0 },
    habits: { completed: 0, total: 0 },
    xpToday: 0,
  },
  onStatPress,
  style,
}) => {
  const statCards = [
    {
      key: 'goals',
      icon: Icons.Target,
      label: 'Mục tiêu',
      value: `${stats.goals?.completed || 0}/${stats.goals?.total || 0}`,
      color: COLORS.purple,
      bgColor: 'rgba(106, 91, 255, 0.15)',
    },
    {
      key: 'affirmations',
      icon: Icons.Heart,
      label: 'Khẳng định',
      value: `${stats.affirmations?.completed || 0}/${stats.affirmations?.total || 0}`,
      color: '#FF6B9D',
      bgColor: 'rgba(255, 107, 157, 0.15)',
    },
    {
      key: 'habits',
      icon: Icons.Repeat,
      label: 'Thói quen',
      value: `${stats.habits?.completed || 0}/${stats.habits?.total || 0}`,
      color: COLORS.success,
      bgColor: 'rgba(58, 247, 166, 0.15)',
    },
    {
      key: 'xp',
      icon: Icons.Sparkles,
      label: 'XP hôm nay',
      value: `+${stats.xpToday || 0}`,
      color: COLORS.gold,
      bgColor: 'rgba(255, 189, 89, 0.15)',
    },
  ];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.container, style]}
    >
      {statCards.map((stat) => {
        const IconComponent = stat.icon;
        return (
          <TouchableOpacity
            key={stat.key}
            style={[styles.statCard, { backgroundColor: stat.bgColor }]}
            onPress={() => onStatPress?.(stat.key)}
            activeOpacity={0.7}
          >
            <View style={[styles.iconContainer, { backgroundColor: `${stat.color}30` }]}>
              <IconComponent size={18} color={stat.color} />
            </View>
            <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

// Grid version (2x2)
export const QuickStatsGrid = ({
  stats = {},
  onStatPress,
  style,
}) => {
  const statCards = [
    {
      key: 'goals',
      icon: Icons.Target,
      label: 'Mục tiêu',
      value: stats.goals?.completed || 0,
      total: stats.goals?.total || 0,
      color: COLORS.purple,
    },
    {
      key: 'affirmations',
      icon: Icons.Heart,
      label: 'Khẳng định',
      value: stats.affirmations?.completed || 0,
      total: stats.affirmations?.total || 0,
      color: '#FF6B9D',
    },
    {
      key: 'habits',
      icon: Icons.Repeat,
      label: 'Thói quen',
      value: stats.habits?.completed || 0,
      total: stats.habits?.total || 0,
      color: COLORS.success,
    },
    {
      key: 'xp',
      icon: Icons.Sparkles,
      label: 'XP hôm nay',
      value: stats.xpToday || 0,
      total: null,
      color: COLORS.gold,
    },
  ];

  return (
    <View style={[styles.gridContainer, style]}>
      {statCards.map((stat) => {
        const IconComponent = stat.icon;
        const progress = stat.total ? (stat.value / stat.total) * 100 : 0;

        return (
          <TouchableOpacity
            key={stat.key}
            style={styles.gridCard}
            onPress={() => onStatPress?.(stat.key)}
            activeOpacity={0.7}
          >
            <View style={styles.gridCardHeader}>
              <IconComponent size={16} color={stat.color} />
              <Text style={styles.gridCardLabel}>{stat.label}</Text>
            </View>

            <Text style={[styles.gridCardValue, { color: stat.color }]}>
              {stat.total ? `${stat.value}/${stat.total}` : `+${stat.value}`}
            </Text>

            {stat.total && (
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${progress}%`, backgroundColor: stat.color },
                  ]}
                />
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

// Single stat card
export const StatCard = ({
  icon: IconComponent,
  label,
  value,
  color = COLORS.purple,
  onPress,
  style,
}) => {
  return (
    <TouchableOpacity
      style={[styles.singleStatCard, style]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={[styles.singleIconContainer, { backgroundColor: `${color}20` }]}>
        <IconComponent size={20} color={color} />
      </View>
      <View style={styles.singleStatInfo}>
        <Text style={styles.singleStatLabel}>{label}</Text>
        <Text style={[styles.singleStatValue, { color }]}>{value}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: SPACING.xs,
    gap: SPACING.sm,
  },
  statCard: {
    width: 90,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    borderRadius: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
  },
  statValue: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  statLabel: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.fontSize.xs,
    marginTop: SPACING.xxs,
    textAlign: 'center',
  },

  // Grid styles
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  gridCard: {
    width: '48%',
    backgroundColor: COLORS.glassBg,
    borderRadius: SPACING.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
  },
  gridCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  gridCardLabel: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.fontSize.xs,
    marginLeft: SPACING.xs,
  },
  gridCardValue: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    marginBottom: SPACING.xs,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },

  // Single stat card styles
  singleStatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.glassBg,
    borderRadius: SPACING.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
  },
  singleIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  singleStatInfo: {
    flex: 1,
  },
  singleStatLabel: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.fontSize.xs,
  },
  singleStatValue: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    marginTop: SPACING.xxs,
  },
});

export default QuickStatsRow;
