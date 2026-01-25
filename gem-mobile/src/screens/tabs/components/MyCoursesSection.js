/**
 * MyCoursesSection - User's Courses Panel (Admin Panel Style)
 * Displays user's enrolled courses, progress stats, and quick navigation
 *
 * Layout style similar to Admin Panel but for regular users
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import {
  GraduationCap,
  BookOpen,
  Award,
  ChevronRight,
  PlayCircle,
  CheckCircle,
  Clock,
} from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';

import { COLORS, SPACING, TYPOGRAPHY, GLASS } from '../../../utils/tokens';
import { useAuth } from '../../../contexts/AuthContext';
import courseService from '../../../services/courseService';

export default function MyCoursesSection({ navigation }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEnrolled: 0,
    inProgress: 0,
    completed: 0,
    notStarted: 0,
  });

  // Load course stats on focus
  useFocusEffect(
    useCallback(() => {
      if (user?.id) {
        loadCourseStats();
      } else {
        setLoading(false);
      }
    }, [user?.id])
  );

  const loadCourseStats = async () => {
    try {
      setLoading(true);

      // Get course stats
      const courseStats = await courseService.getUserCourseStats(user.id);
      setStats(courseStats);
    } catch (error) {
      console.error('[MyCoursesSection] Load stats error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Don't render if not logged in
  if (!user) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Header Row */}
      <View style={styles.header}>
        <GraduationCap size={18} color={COLORS.gold} />
        <Text style={styles.headerText}>KHÓA HỌC CỦA TÔI</Text>
      </View>

      {/* Main Navigation Button - All Courses */}
      <TouchableOpacity
        style={styles.mainButton}
        onPress={() => navigation.navigate('Shop', { screen: 'CourseList', params: { sourceTab: 'Account' } })}
        activeOpacity={0.8}
      >
        <View style={styles.mainButtonContent}>
          <BookOpen size={18} color={COLORS.gold} />
          <Text style={styles.mainButtonText}>Tất Cả Khóa Học</Text>
        </View>
        <ChevronRight size={18} color={COLORS.textMuted} />
      </TouchableOpacity>

      {/* Quick Actions Row */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={[styles.quickBtn, styles.quickBtnWide]}
          onPress={() => navigation.navigate('Shop', { screen: 'CourseList', params: { filter: 'enrolled', sourceTab: 'Account' } })}
        >
          <PlayCircle size={18} color={COLORS.gold} />
          <Text style={styles.quickText}>Đang học</Text>
          {stats.inProgress > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{stats.inProgress}</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.quickBtn, styles.quickBtnWide]}
          onPress={() => navigation.navigate('Shop', { screen: 'CourseList', params: { filter: 'completed', sourceTab: 'Account' } })}
        >
          <Award size={18} color={COLORS.gold} />
          <Text style={styles.quickText}>Hoàn thành</Text>
          {stats.completed > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{stats.completed}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <TouchableOpacity
          style={styles.statItem}
          onPress={() => navigation.navigate('Shop', { screen: 'CourseList', params: { filter: 'enrolled', sourceTab: 'Account' } })}
          activeOpacity={0.7}
        >
          <View style={[styles.statIconContainer, { backgroundColor: 'rgba(255, 189, 89, 0.15)' }]}>
            <BookOpen size={16} color={COLORS.gold} />
          </View>
          {loading ? (
            <ActivityIndicator size="small" color={COLORS.gold} />
          ) : (
            <Text style={styles.statValue}>{stats.totalEnrolled}</Text>
          )}
          <Text style={styles.statLabel}>Đã đăng ký</Text>
        </TouchableOpacity>

        <View style={styles.statDivider} />

        <TouchableOpacity
          style={styles.statItem}
          onPress={() => navigation.navigate('Shop', { screen: 'CourseList', params: { filter: 'enrolled', sourceTab: 'Account' } })}
          activeOpacity={0.7}
        >
          <View style={[styles.statIconContainer, { backgroundColor: 'rgba(255, 189, 89, 0.15)' }]}>
            <Clock size={16} color={COLORS.gold} />
          </View>
          {loading ? (
            <ActivityIndicator size="small" color={COLORS.gold} />
          ) : (
            <Text style={styles.statValue}>{stats.inProgress}</Text>
          )}
          <Text style={styles.statLabel}>Đang học</Text>
        </TouchableOpacity>

        <View style={styles.statDivider} />

        <TouchableOpacity
          style={styles.statItem}
          onPress={() => navigation.navigate('Shop', { screen: 'CourseList', params: { filter: 'completed', sourceTab: 'Account' } })}
          activeOpacity={0.7}
        >
          <View style={[styles.statIconContainer, { backgroundColor: 'rgba(255, 189, 89, 0.15)' }]}>
            <CheckCircle size={16} color={COLORS.gold} />
          </View>
          {loading ? (
            <ActivityIndicator size="small" color={COLORS.gold} />
          ) : (
            <Text style={styles.statValue}>{stats.completed}</Text>
          )}
          <Text style={styles.statLabel}>Hoàn thành</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: GLASS.background,
    borderRadius: 14,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.3)',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  headerText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gold,
    letterSpacing: 1.5,
  },

  // Main Navigation Button
  mainButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(106, 91, 255, 0.15)',
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  mainButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  mainButtonText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },

  // Quick Actions
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  quickBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 10,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.1)',
    gap: SPACING.sm,
    minHeight: 48,
  },
  quickBtnWide: {
    // Already set by flex: 1
  },
  quickText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  badge: {
    backgroundColor: COLORS.gold,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.bgDarkest,
  },

  // Stats Row
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 12,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.1)',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  statValue: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
});
