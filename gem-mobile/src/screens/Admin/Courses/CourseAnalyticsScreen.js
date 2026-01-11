/**
 * Gemral - Course Analytics Screen
 * View course statistics and performance metrics
 * Admin Panel - Course Management
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  ChevronLeft,
  Users,
  BookOpen,
  TrendingUp,
  Award,
  Clock,
  DollarSign,
  BarChart2,
  PieChart,
  Calendar,
  Target,
  CheckCircle,
  AlertCircle,
} from 'lucide-react-native';

import { supabase } from '../../../services/supabase';
import { COLORS, GRADIENTS, SPACING, TYPOGRAPHY, GLASS } from '../../../utils/tokens';
import CustomAlert, { useCustomAlert } from '../../../components/CustomAlert';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const CourseAnalyticsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { courseId, courseTitle } = route.params || {};
  const { alert, AlertComponent } = useCustomAlert();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [courseData, setCourseData] = useState(null);
  const [analytics, setAnalytics] = useState({
    totalStudents: 0,
    activeStudents: 0,
    completedStudents: 0,
    averageProgress: 0,
    totalRevenue: 0,
    totalLessons: 0,
    totalModules: 0,
    quizPassRate: 0,
    avgCompletionTime: 0,
    enrollmentsByMonth: [],
    popularLessons: [],
    recentEnrollments: [],
  });

  const loadData = useCallback(async () => {
    if (!courseId) return;

    try {
      setLoading(true);

      // Load course info
      const { data: course, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();

      if (courseError) throw courseError;
      setCourseData(course);

      // Load modules and lessons count
      const { data: modules } = await supabase
        .from('course_modules')
        .select('id')
        .eq('course_id', courseId);

      const { data: lessons } = await supabase
        .from('course_lessons')
        .select('id')
        .eq('course_id', courseId);

      // Load enrollments
      const { data: enrollments } = await supabase
        .from('course_enrollments')
        .select('*, profiles:user_id(full_name, email)')
        .eq('course_id', courseId)
        .order('enrolled_at', { ascending: false });

      // Load progress data
      const { data: progressData } = await supabase
        .from('course_progress')
        .select('user_id, completed')
        .eq('course_id', courseId);

      // Calculate progress per user
      const userProgress = {};
      progressData?.forEach(p => {
        if (!userProgress[p.user_id]) {
          userProgress[p.user_id] = { completed: 0, total: 0 };
        }
        userProgress[p.user_id].total++;
        if (p.completed) {
          userProgress[p.user_id].completed++;
        }
      });

      // Calculate average progress
      const totalLessonsCount = lessons?.length || 1;
      let totalProgress = 0;
      let completedStudents = 0;
      Object.values(userProgress).forEach(up => {
        const progress = (up.completed / totalLessonsCount) * 100;
        totalProgress += progress;
        if (progress >= 100) completedStudents++;
      });
      const avgProgress = enrollments?.length > 0
        ? Math.round(totalProgress / enrollments.length)
        : 0;

      // Load quiz attempts for pass rate
      const { data: quizAttempts } = await supabase
        .from('quiz_attempts')
        .select('passed')
        .eq('course_id', courseId);

      const passedQuizzes = quizAttempts?.filter(q => q.passed).length || 0;
      const quizPassRate = quizAttempts?.length > 0
        ? Math.round((passedQuizzes / quizAttempts.length) * 100)
        : 0;

      // Calculate enrollments by month (last 6 months)
      const enrollmentsByMonth = [];
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
        const count = enrollments?.filter(e => {
          const enrollDate = new Date(e.enrolled_at);
          return enrollDate >= monthDate && enrollDate <= monthEnd;
        }).length || 0;

        enrollmentsByMonth.push({
          month: monthDate.toLocaleDateString('vi-VN', { month: 'short' }),
          count,
        });
      }

      // Get popular lessons (most completed)
      const lessonCompletions = {};
      progressData?.filter(p => p.completed).forEach(p => {
        // Note: We need lesson_id from progress, this is simplified
      });

      // Calculate active vs expired students
      const activeStudents = enrollments?.filter(e => {
        if (!e.expires_at) return true;
        return new Date(e.expires_at) > new Date();
      }).length || 0;

      // Calculate total revenue (from enrollments with purchase)
      const purchaseEnrollments = enrollments?.filter(e => e.access_type === 'purchase') || [];
      const totalRevenue = purchaseEnrollments.length * (course?.price || 0);

      setAnalytics({
        totalStudents: enrollments?.length || 0,
        activeStudents,
        completedStudents,
        averageProgress: avgProgress,
        totalRevenue,
        totalLessons: lessons?.length || 0,
        totalModules: modules?.length || 0,
        quizPassRate,
        avgCompletionTime: 0, // Would need more data to calculate
        enrollmentsByMonth,
        popularLessons: [],
        recentEnrollments: enrollments?.slice(0, 5) || [],
      });

    } catch (error) {
      console.error('Error loading analytics:', error);
      alert({
        type: 'error',
        title: 'Loi',
        message: 'Khong the tai du lieu thong ke'
      });
    } finally {
      setLoading(false);
    }
  }, [courseId, alert]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getMaxEnrollment = () => {
    return Math.max(...analytics.enrollmentsByMonth.map(e => e.count), 1);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={GRADIENTS.background} style={styles.gradient}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.gold} />
            <Text style={styles.loadingText}>Dang tai thong ke...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={GRADIENTS.background} style={styles.gradient}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <ChevronLeft size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Thong ke khoa hoc</Text>
            <Text style={styles.headerSubtitle} numberOfLines={1}>
              {courseTitle || courseData?.title || 'Khoa hoc'}
            </Text>
          </View>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.gold}
            />
          }
        >
          {/* Overview Stats */}
          <View style={styles.overviewGrid}>
            <View style={[styles.overviewCard, { backgroundColor: 'rgba(99, 102, 241, 0.15)' }]}>
              <Users size={24} color="#6366F1" />
              <Text style={styles.overviewValue}>{analytics.totalStudents}</Text>
              <Text style={styles.overviewLabel}>Tong hoc vien</Text>
            </View>

            <View style={[styles.overviewCard, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
              <CheckCircle size={24} color="#10B981" />
              <Text style={styles.overviewValue}>{analytics.activeStudents}</Text>
              <Text style={styles.overviewLabel}>Dang hoc</Text>
            </View>

            <View style={[styles.overviewCard, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
              <Award size={24} color="#F59E0B" />
              <Text style={styles.overviewValue}>{analytics.completedStudents}</Text>
              <Text style={styles.overviewLabel}>Hoan thanh</Text>
            </View>

            <View style={[styles.overviewCard, { backgroundColor: 'rgba(255, 189, 89, 0.15)' }]}>
              <TrendingUp size={24} color={COLORS.gold} />
              <Text style={styles.overviewValue}>{analytics.averageProgress}%</Text>
              <Text style={styles.overviewLabel}>Tien do TB</Text>
            </View>
          </View>

          {/* Revenue Card */}
          <View style={styles.revenueCard}>
            <View style={styles.revenueHeader}>
              <DollarSign size={24} color={COLORS.gold} />
              <Text style={styles.revenueTitle}>Doanh thu</Text>
            </View>
            <Text style={styles.revenueAmount}>{formatCurrency(analytics.totalRevenue)}</Text>
            <Text style={styles.revenueSubtext}>
              Tu {analytics.totalStudents} hoc vien dang ky
            </Text>
          </View>

          {/* Course Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thong tin khoa hoc</Text>
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                  <BookOpen size={18} color={COLORS.textMuted} />
                  <Text style={styles.infoValue}>{analytics.totalModules}</Text>
                  <Text style={styles.infoLabel}>Modules</Text>
                </View>
                <View style={styles.infoDivider} />
                <View style={styles.infoItem}>
                  <Target size={18} color={COLORS.textMuted} />
                  <Text style={styles.infoValue}>{analytics.totalLessons}</Text>
                  <Text style={styles.infoLabel}>Bai hoc</Text>
                </View>
                <View style={styles.infoDivider} />
                <View style={styles.infoItem}>
                  <Award size={18} color={COLORS.textMuted} />
                  <Text style={styles.infoValue}>{analytics.quizPassRate}%</Text>
                  <Text style={styles.infoLabel}>Quiz dat</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Enrollment Chart */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Dang ky theo thang</Text>
            <View style={styles.chartCard}>
              <View style={styles.barChart}>
                {analytics.enrollmentsByMonth.map((item, index) => (
                  <View key={index} style={styles.barContainer}>
                    <View
                      style={[
                        styles.bar,
                        {
                          height: `${(item.count / getMaxEnrollment()) * 100}%`,
                          backgroundColor: item.count > 0 ? COLORS.gold : 'rgba(255, 255, 255, 0.1)',
                        }
                      ]}
                    />
                    <Text style={styles.barLabel}>{item.month}</Text>
                    <Text style={styles.barValue}>{item.count}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* Recent Enrollments */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Dang ky gan day</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('CourseStudents', { courseId, courseTitle })}
              >
                <Text style={styles.viewAllBtn}>Xem tat ca</Text>
              </TouchableOpacity>
            </View>

            {analytics.recentEnrollments.length === 0 ? (
              <View style={styles.emptyState}>
                <Users size={40} color={COLORS.textMuted} />
                <Text style={styles.emptyText}>Chua co hoc vien nao</Text>
              </View>
            ) : (
              <View style={styles.recentList}>
                {analytics.recentEnrollments.map((enrollment, index) => (
                  <View key={enrollment.id || index} style={styles.recentItem}>
                    <View style={styles.recentAvatar}>
                      <Text style={styles.recentAvatarText}>
                        {(enrollment.profiles?.full_name || enrollment.profiles?.email || '?')[0].toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.recentInfo}>
                      <Text style={styles.recentName}>
                        {enrollment.profiles?.full_name || 'Chua co ten'}
                      </Text>
                      <Text style={styles.recentEmail}>
                        {enrollment.profiles?.email || 'N/A'}
                      </Text>
                    </View>
                    <Text style={styles.recentDate}>
                      {formatDate(enrollment.enrolled_at)}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsSection}>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => navigation.navigate('CourseStudents', { courseId, courseTitle })}
            >
              <Users size={20} color="#fff" />
              <Text style={styles.actionBtnText}>Quan ly hoc vien</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, styles.actionBtnSecondary]}
              onPress={() => navigation.navigate('CourseBuilder', { mode: 'edit', courseId })}
            >
              <BookOpen size={20} color={COLORS.gold} />
              <Text style={[styles.actionBtnText, styles.actionBtnTextSecondary]}>
                Chinh sua khoa hoc
              </Text>
            </TouchableOpacity>
          </View>

          {/* Bottom Spacer */}
          <View style={{ height: 40 }} />
        </ScrollView>

        {AlertComponent}
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  gradient: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  headerSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginTop: 2,
  },

  // Content
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: SPACING.md,
  },

  // Overview Grid
  overviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  overviewCard: {
    width: (SCREEN_WIDTH - SPACING.md * 2 - SPACING.sm) / 2 - 1,
    padding: SPACING.md,
    borderRadius: 16,
    alignItems: 'center',
  },
  overviewValue: {
    fontSize: 24,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginTop: SPACING.sm,
  },
  overviewLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    marginTop: 4,
  },

  // Revenue Card
  revenueCard: {
    backgroundColor: 'linear-gradient(135deg, rgba(255, 189, 89, 0.2) 0%, rgba(255, 189, 89, 0.05) 100%)',
    backgroundColor: GLASS.background,
    borderWidth: 1,
    borderColor: COLORS.gold,
    borderRadius: 16,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  revenueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  revenueTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semiBold,
    color: COLORS.gold,
  },
  revenueAmount: {
    fontSize: 32,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  revenueSubtext: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },

  // Section
  section: {
    marginBottom: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semiBold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  viewAllBtn: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gold,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },

  // Info Card
  infoCard: {
    backgroundColor: GLASS.background,
    borderWidth: 1,
    borderColor: GLASS.border,
    borderRadius: 16,
    padding: SPACING.lg,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  infoItem: {
    alignItems: 'center',
    flex: 1,
  },
  infoValue: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginTop: SPACING.xs,
  },
  infoLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  infoDivider: {
    width: 1,
    height: 40,
    backgroundColor: GLASS.border,
  },

  // Chart Card
  chartCard: {
    backgroundColor: GLASS.background,
    borderWidth: 1,
    borderColor: GLASS.border,
    borderRadius: 16,
    padding: SPACING.lg,
  },
  barChart: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 150,
  },
  barContainer: {
    alignItems: 'center',
    flex: 1,
  },
  bar: {
    width: 24,
    minHeight: 4,
    borderRadius: 4,
    marginBottom: SPACING.xs,
  },
  barLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },
  barValue: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.fontWeight.semiBold,
  },

  // Recent List
  recentList: {
    gap: SPACING.sm,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GLASS.background,
    borderWidth: 1,
    borderColor: GLASS.border,
    borderRadius: 12,
    padding: SPACING.md,
  },
  recentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recentAvatarText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: '#6366F1',
  },
  recentInfo: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  recentName: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.textPrimary,
  },
  recentEmail: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  recentDate: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    backgroundColor: GLASS.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: GLASS.border,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginTop: SPACING.sm,
  },

  // Action Buttons
  actionsSection: {
    gap: SPACING.sm,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: '#6366F1',
    paddingVertical: SPACING.md,
    borderRadius: 12,
  },
  actionBtnSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.gold,
  },
  actionBtnText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semiBold,
    color: '#fff',
  },
  actionBtnTextSecondary: {
    color: COLORS.gold,
  },
});

export default CourseAnalyticsScreen;
