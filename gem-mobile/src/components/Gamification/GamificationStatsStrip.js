/**
 * GEM Academy - Gamification Stats Strip
 * Shows XP, streak, level, courses in a horizontal bar
 * Vietnamese labels with subtitles
 */

import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Flame, Zap, Trophy, BookOpen, ChevronRight } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, TYPOGRAPHY, GLASS, BORDER_RADIUS } from '../../utils/tokens';
import { getUserLearningStats } from '../../services/learningGamificationService';

const StatItem = ({ icon: Icon, value, label, subtitle, color = COLORS.gold, onPress }) => (
  <TouchableOpacity
    style={styles.statItem}
    onPress={onPress}
    disabled={!onPress}
    activeOpacity={onPress ? 0.7 : 1}
  >
    <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
      <Icon size={18} color={color} strokeWidth={2.5} />
    </View>
    <View style={styles.statText}>
      <Text style={[styles.statValue, { color }]} numberOfLines={1}>{value}</Text>
      <Text style={styles.statLabel} numberOfLines={1}>{label}</Text>
    </View>
  </TouchableOpacity>
);

const GamificationStatsStrip = ({
  userId = null,
  onPressStreak,
  onPressXP,
  onPressLevel,
  onPressCourses,
  style = {},
}) => {
  const navigation = useNavigation();
  const [stats, setStats] = useState({
    currentStreak: 0,
    totalXP: 0,
    currentLevel: 1,
    totalCoursesCompleted: 0,
  });
  const [loading, setLoading] = useState(true);
  const hasLoaded = useRef(false);

  const loadStats = useCallback(async () => {
    // Prevent multiple loads
    if (hasLoaded.current) return;
    hasLoaded.current = true;

    try {
      setLoading(true);
      const result = await getUserLearningStats();
      if (result.success && result.data) {
        setStats({
          currentStreak: result.data.current_streak || 0,
          totalXP: result.data.total_xp || 0,
          currentLevel: result.data.current_level || 1,
          totalCoursesCompleted: result.data.total_courses_completed || 0,
        });
      }
    } catch (error) {
      console.error('[GamificationStatsStrip] loadStats error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const formatNumber = (num) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  const handleNavigateToAchievements = () => {
    navigation.navigate('CourseAchievements');
  };

  return (
    <View style={[styles.container, style]}>
      <LinearGradient
        colors={['rgba(15, 16, 48, 0.8)', 'rgba(15, 16, 48, 0.6)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        <View style={styles.statsRow}>
          <StatItem
            icon={Flame}
            value={stats.currentStreak}
            label="Chuỗi"
            color="#FF6B35"
            onPress={onPressStreak}
          />
          <View style={styles.divider} />
          <StatItem
            icon={Zap}
            value={formatNumber(stats.totalXP)}
            label="Điểm"
            color={COLORS.cyan}
            onPress={onPressXP}
          />
          <View style={styles.divider} />
          <StatItem
            icon={Trophy}
            value={stats.currentLevel}
            label="Cấp"
            color={COLORS.gold}
            onPress={onPressLevel}
          />
          <View style={styles.divider} />
          <StatItem
            icon={BookOpen}
            value={stats.totalCoursesCompleted}
            label="Khóa"
            color={COLORS.success}
            onPress={onPressCourses}
          />
        </View>

        <TouchableOpacity
          style={styles.viewAllButton}
          onPress={handleNavigateToAchievements}
          activeOpacity={0.7}
        >
          <ChevronRight size={18} color={COLORS.textMuted} />
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  statsRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statItem: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 55,
    maxWidth: 70,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  statText: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 1,
    textAlign: 'center',
  },
  divider: {
    width: 1,
    height: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: SPACING.xs,
  },
  viewAllButton: {
    padding: SPACING.xs,
    marginLeft: SPACING.xs,
  },
});

// Memoize to prevent unnecessary re-renders
export default memo(GamificationStatsStrip);
