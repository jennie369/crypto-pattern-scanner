/**
 * GEM Mobile - Stats Widget
 * Day 17-19: AI Chat → Dashboard Integration
 *
 * Displays user activity statistics.
 * Uses design tokens for consistent styling.
 */

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { TrendingUp, Flame, Sparkles, Heart, BarChart2, ChevronRight } from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, GLASS } from '../../utils/tokens';
import widgetManagementService from '../../services/widgetManagementService';

const StatsWidget = ({ widget, userId, onViewDetails }) => {
  const [stats, setStats] = useState({
    activeGoals: 0,
    streak: 0,
    affirmationsCompleted: 0,
    totalWidgets: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      if (userId) {
        const userStats = await widgetManagementService.getWidgetStats(userId);
        setStats(userStats);
      } else if (widget?.data) {
        // Use widget data if provided
        setStats({
          activeGoals: widget.data.activeGoals || 0,
          streak: widget.data.streak || 0,
          affirmationsCompleted: widget.data.affirmationsCompleted || 0,
          totalWidgets: widget.data.meditationMinutes || 0, // Repurposed field
        });
      }
    } catch (error) {
      console.error('[StatsWidget] Error loading stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const statItems = [
    {
      icon: TrendingUp,
      value: stats.activeGoals,
      label: 'Active Goals',
      color: COLORS.gold,
    },
    {
      icon: Flame,
      value: stats.streak,
      label: 'Day Streak',
      color: COLORS.error,
    },
    {
      icon: Sparkles,
      value: stats.affirmationsCompleted,
      label: 'Affirmations',
      color: COLORS.purple,
    },
    {
      icon: Heart,
      value: stats.totalWidgets,
      label: 'Total Widgets',
      color: '#E91E63',
    },
  ];

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails();
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <BarChart2 size={SPACING.xl} color={COLORS.gold} />
        <Text style={styles.title}>Your Stats</Text>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        {statItems.map((item, index) => (
          <View key={index} style={styles.statCard}>
            <item.icon size={SPACING.xxxl} color={item.color} />
            <Text style={styles.statNumber}>
              {isLoading ? '-' : item.value}
            </Text>
            <Text style={styles.statLabel}>{item.label}</Text>
          </View>
        ))}
      </View>

      {/* View Details Button */}
      <TouchableOpacity
        style={styles.detailsButton}
        onPress={handleViewDetails}
        activeOpacity={0.7}
      >
        <Text style={styles.detailsButtonText}>View Details</Text>
        <ChevronRight size={TYPOGRAPHY.fontSize.xxl} color={COLORS.gold} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 189, 89, 0.05)',
    borderRadius: GLASS.borderRadius,
    padding: SPACING.lg,
    borderWidth: GLASS.borderWidth,
    borderColor: 'rgba(255, 189, 89, 0.2)',
    marginBottom: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: SPACING.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: SPACING.md,
  },
  statNumber: {
    fontSize: TYPOGRAPHY.fontSize.hero,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginTop: SPACING.sm,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    padding: SPACING.md,
  },
  detailsButtonText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.gold,
  },
});

export default StatsWidget;
