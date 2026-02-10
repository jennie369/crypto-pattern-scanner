/**
 * QuickMindsetWidget Component
 * Compact badge showing last mindset assessment score
 * Used in Scanner QuickActionBar and other places
 *
 * Created: December 13, 2025
 */

import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Brain, ChevronRight, AlertCircle } from 'lucide-react-native';
import { useAuth } from '../../contexts/AuthContext';
import mindsetAdvisorService, { SCORE_COLORS } from '../../services/mindsetAdvisorService';
import { useSettings } from '../../contexts/SettingsContext';

const QuickMindsetWidget = ({
  onPress,
  compact = false,
  showLabel = true,
  style,
}) => {
  const { user } = useAuth();
  const { colors, gradients, glass, settings, SPACING, TYPOGRAPHY, t } = useSettings();
  const [todayScore, setTodayScore] = useState(null);
  const [loading, setLoading] = useState(true);

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: settings.theme === 'light' ? colors.bgDarkest : (glass.background || 'rgba(15, 16, 48, 0.95)'),
      borderRadius: 12,
      borderWidth: 1,
      borderColor: 'rgba(255, 189, 89, 0.2)',
      paddingVertical: SPACING.md,
      paddingHorizontal: SPACING.md,
    },

    leftSection: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.sm,
    },

    iconContainer: {
      width: 36,
      height: 36,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },

    labelContainer: {
      gap: 2,
    },

    label: {
      fontSize: TYPOGRAPHY.fontSize.md,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
      color: colors.textPrimary,
    },

    status: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: TYPOGRAPHY.fontWeight.medium,
    },

    statusEmpty: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: colors.textMuted,
    },

    rightSection: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.sm,
    },

    scoreContainer: {
      paddingHorizontal: SPACING.md,
      paddingVertical: 6,
      borderRadius: 10,
      borderWidth: 1,
    },

    scoreValue: {
      fontSize: TYPOGRAPHY.fontSize.lg,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
    },

    checkContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },

    checkText: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
      color: colors.gold,
    },

    // Compact styles
    compactContainer: {
      alignItems: 'center',
      justifyContent: 'center',
    },

    scoreBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
      borderWidth: 1,
      gap: 4,
    },

    scoreText: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
    },

    emptyBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      gap: 4,
    },

    emptyText: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      color: colors.textMuted,
    },
  }), [colors, settings.theme, glass, SPACING, TYPOGRAPHY]);

  // Load today's score on mount
  useEffect(() => {
    loadTodayScore();
  }, [user?.id]);

  const loadTodayScore = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      const result = await mindsetAdvisorService.getTodayScore(user.id);
      if (result.success && result.hasScore) {
        setTodayScore({
          score: result.score,
          recommendation: result.recommendation,
          timestamp: result.timestamp,
        });
      }
    } catch (error) {
      console.error('[QuickMindset] Load error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get color based on score/recommendation
  const getColor = () => {
    if (!todayScore) return colors.textMuted;
    return SCORE_COLORS[todayScore.recommendation] || colors.gold;
  };

  // Compact version (just badge)
  if (compact) {
    return (
      <TouchableOpacity
        style={[styles.compactContainer, style]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {todayScore ? (
          <View style={[styles.scoreBadge, { backgroundColor: `${getColor()}20`, borderColor: getColor() }]}>
            <Brain size={12} color={getColor()} />
            <Text style={[styles.scoreText, { color: getColor() }]}>
              {todayScore.score}
            </Text>
          </View>
        ) : (
          <View style={styles.emptyBadge}>
            <Brain size={14} color={colors.textMuted} />
            <Text style={styles.emptyText}>?</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  }

  // Full version with label
  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.leftSection}>
        <View style={[styles.iconContainer, { backgroundColor: `${getColor()}15` }]}>
          <Brain size={18} color={getColor()} />
        </View>
        {showLabel && (
          <View style={styles.labelContainer}>
            <Text style={styles.label}>Tam The</Text>
            {todayScore ? (
              <Text style={[styles.status, { color: getColor() }]}>
                {getStatusLabel(todayScore.recommendation)}
              </Text>
            ) : (
              <Text style={styles.statusEmpty}>Chua kiem tra</Text>
            )}
          </View>
        )}
      </View>

      <View style={styles.rightSection}>
        {todayScore ? (
          <View style={[styles.scoreContainer, { backgroundColor: `${getColor()}15`, borderColor: getColor() }]}>
            <Text style={[styles.scoreValue, { color: getColor() }]}>
              {todayScore.score}
            </Text>
          </View>
        ) : (
          <View style={styles.checkContainer}>
            <AlertCircle size={16} color={colors.gold} />
            <Text style={styles.checkText}>Kiem tra</Text>
          </View>
        )}
        <ChevronRight size={16} color={colors.textMuted} />
      </View>
    </TouchableOpacity>
  );
};

// Helper function for status labels
const getStatusLabel = (recommendation) => {
  switch (recommendation) {
    case 'ready':
      return 'San sang';
    case 'prepare':
      return 'Chuan bi';
    case 'caution':
      return 'Can than';
    case 'stop':
      return 'Dung lai';
    default:
      return 'Kiem tra';
  }
};

export default QuickMindsetWidget;
