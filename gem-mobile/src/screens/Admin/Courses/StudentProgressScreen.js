/**
 * Gemral - Student Progress Screen
 * View detailed learning progress for a specific student
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  ChevronLeft,
  User,
  BookOpen,
  Clock,
  Award,
  CheckCircle,
  Circle,
  Play,
  FileText,
  HelpCircle,
  TrendingUp,
  Calendar,
} from 'lucide-react-native';

import { supabase } from '../../../services/supabase';
import { COLORS, GRADIENTS, SPACING, TYPOGRAPHY, GLASS } from '../../../utils/tokens';
import progressService from '../../../services/progressService';
import CustomAlert, { useCustomAlert } from '../../../components/CustomAlert';

const StudentProgressScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { userId, courseId, userName } = route.params || {};
  const { alert, AlertComponent } = useCustomAlert();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [studentData, setStudentData] = useState(null);
  const [progressData, setProgressData] = useState(null);
  const [lessonProgress, setLessonProgress] = useState([]);
  const [quizAttempts, setQuizAttempts] = useState([]);

  const loadData = useCallback(async () => {
    if (!userId || !courseId) return;

    try {
      setLoading(true);

      // Load student info
      const { data: enrollment, error: enrollError } = await supabase
        .from('course_enrollments')
        .select('*, profiles:user_id(full_name, email, avatar_url)')
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .single();

      if (enrollError && enrollError.code !== 'PGRST116') {
        console.error('Enrollment error:', enrollError);
      }

      // Load course info
      const { data: course } = await supabase
        .from('courses')
        .select('*, course_modules(*, course_lessons(*))')
        .eq('id', courseId)
        .single();

      // Load progress summary
      let progressSummary = null;
      try {
        progressSummary = await progressService.getCourseProgressSummary(userId, courseId);
      } catch (err) {
        console.log('Progress summary not available:', err);
      }

      // Load lesson progress
      const { data: lessonProgressData } = await supabase
        .from('course_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .order('updated_at', { ascending: false });

      // Load quiz attempts
      const { data: quizData } = await supabase
        .from('quiz_attempts')
        .select('*, quizzes(title, passing_score)')
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .order('completed_at', { ascending: false });

      // Prepare lesson list with progress
      const allLessons = [];
      if (course?.course_modules) {
        course.course_modules
          .sort((a, b) => a.order_index - b.order_index)
          .forEach(module => {
            if (module.course_lessons) {
              module.course_lessons
                .sort((a, b) => a.order_index - b.order_index)
                .forEach(lesson => {
                  const progress = lessonProgressData?.find(p => p.lesson_id === lesson.id);
                  allLessons.push({
                    ...lesson,
                    moduleName: module.title,
                    completed: progress?.completed || false,
                    completedAt: progress?.completed_at,
                    watchTime: progress?.watch_time_seconds || 0,
                    lastPosition: progress?.last_position_seconds || 0,
                  });
                });
            }
          });
      }

      setStudentData({
        ...enrollment,
        course,
        profile: enrollment?.profiles,
      });
      setProgressData(progressSummary);
      setLessonProgress(allLessons);
      setQuizAttempts(quizData || []);

    } catch (error) {
      console.error('Error loading student progress:', error);
      alert({
        type: 'error',
        title: 'Loi',
        message: 'Khong the tai du lieu tien do'
      });
    } finally {
      setLoading(false);
    }
  }, [userId, courseId, alert]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0 phut';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours} gio ${minutes} phut`;
    }
    return `${minutes} phut`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getLessonIcon = (type) => {
    switch (type) {
      case 'video': return Play;
      case 'article': return FileText;
      case 'quiz': return HelpCircle;
      default: return BookOpen;
    }
  };

  const completedCount = lessonProgress.filter(l => l.completed).length;
  const totalCount = lessonProgress.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const totalWatchTime = lessonProgress.reduce((sum, l) => sum + (l.watchTime || 0), 0);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={GRADIENTS.background} style={styles.gradient}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.gold} />
            <Text style={styles.loadingText}>Dang tai...</Text>
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
            <Text style={styles.headerTitle}>Tien do hoc vien</Text>
            <Text style={styles.headerSubtitle} numberOfLines={1}>
              {userName || 'Hoc vien'}
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
          {/* Student Info Card */}
          <View style={styles.studentCard}>
            <View style={styles.avatarContainer}>
              <User size={28} color={COLORS.gold} />
            </View>
            <View style={styles.studentInfo}>
              <Text style={styles.studentName}>
                {studentData?.profile?.full_name || userName || 'Chua co ten'}
              </Text>
              <Text style={styles.studentEmail}>
                {studentData?.profile?.email || 'N/A'}
              </Text>
              <Text style={styles.enrolledDate}>
                Dang ky: {formatDate(studentData?.enrolled_at)}
              </Text>
            </View>
          </View>

          {/* Progress Overview */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tong quan tien do</Text>

            <View style={styles.progressCard}>
              {/* Progress Circle */}
              <View style={styles.progressCircleContainer}>
                <View style={styles.progressCircle}>
                  <Text style={styles.progressPercent}>{progressPercent}%</Text>
                  <Text style={styles.progressLabel}>Hoan thanh</Text>
                </View>
              </View>

              {/* Stats Grid */}
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <BookOpen size={20} color={COLORS.gold} />
                  <Text style={styles.statValue}>{completedCount}/{totalCount}</Text>
                  <Text style={styles.statLabel}>Bai hoc</Text>
                </View>

                <View style={styles.statItem}>
                  <Clock size={20} color="#6A5BFF" />
                  <Text style={styles.statValue}>{formatDuration(totalWatchTime)}</Text>
                  <Text style={styles.statLabel}>Thoi gian hoc</Text>
                </View>

                <View style={styles.statItem}>
                  <Award size={20} color="#10B981" />
                  <Text style={styles.statValue}>{quizAttempts.filter(q => q.passed).length}</Text>
                  <Text style={styles.statLabel}>Quiz dat</Text>
                </View>

                <View style={styles.statItem}>
                  <TrendingUp size={20} color="#F59E0B" />
                  <Text style={styles.statValue}>
                    {quizAttempts.length > 0
                      ? `${Math.round(quizAttempts.reduce((sum, q) => sum + (q.score_percentage || 0), 0) / quizAttempts.length)}%`
                      : 'N/A'}
                  </Text>
                  <Text style={styles.statLabel}>Diem TB Quiz</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Lessons Progress */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Chi tiet bai hoc ({completedCount}/{totalCount})</Text>

            {lessonProgress.length === 0 ? (
              <View style={styles.emptyState}>
                <BookOpen size={40} color={COLORS.textMuted} />
                <Text style={styles.emptyText}>Chua co du lieu bai hoc</Text>
              </View>
            ) : (
              <View style={styles.lessonsList}>
                {lessonProgress.map((lesson, index) => {
                  const LessonIcon = getLessonIcon(lesson.type);
                  return (
                    <View key={lesson.id} style={styles.lessonItem}>
                      <View style={styles.lessonLeft}>
                        <View style={[
                          styles.lessonStatus,
                          lesson.completed && styles.lessonStatusCompleted
                        ]}>
                          {lesson.completed ? (
                            <CheckCircle size={18} color="#10B981" />
                          ) : (
                            <Circle size={18} color={COLORS.textMuted} />
                          )}
                        </View>
                        <View style={styles.lessonInfo}>
                          <Text style={styles.lessonModuleName}>{lesson.moduleName}</Text>
                          <Text style={[
                            styles.lessonTitle,
                            lesson.completed && styles.lessonTitleCompleted
                          ]}>
                            {lesson.title}
                          </Text>
                          <View style={styles.lessonMeta}>
                            <LessonIcon size={12} color={COLORS.textMuted} />
                            <Text style={styles.lessonType}>
                              {lesson.type === 'video' ? 'Video' : lesson.type === 'article' ? 'Bai viet' : 'Quiz'}
                            </Text>
                            {lesson.watchTime > 0 && (
                              <Text style={styles.lessonWatchTime}>
                                {formatDuration(lesson.watchTime)}
                              </Text>
                            )}
                          </View>
                        </View>
                      </View>
                      {lesson.completedAt && (
                        <Text style={styles.completedAt}>
                          {new Date(lesson.completedAt).toLocaleDateString('vi-VN')}
                        </Text>
                      )}
                    </View>
                  );
                })}
              </View>
            )}
          </View>

          {/* Quiz Attempts */}
          {quizAttempts.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Lich su lam Quiz ({quizAttempts.length})</Text>

              <View style={styles.quizList}>
                {quizAttempts.map((attempt) => (
                  <View key={attempt.id} style={styles.quizItem}>
                    <View style={styles.quizHeader}>
                      <HelpCircle size={18} color="#6A5BFF" />
                      <Text style={styles.quizTitle}>{attempt.quizzes?.title || 'Quiz'}</Text>
                      <View style={[
                        styles.quizBadge,
                        attempt.passed ? styles.quizBadgePassed : styles.quizBadgeFailed
                      ]}>
                        <Text style={[
                          styles.quizBadgeText,
                          attempt.passed ? styles.quizBadgeTextPassed : styles.quizBadgeTextFailed
                        ]}>
                          {attempt.passed ? 'DAT' : 'CHUA DAT'}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.quizDetails}>
                      <Text style={styles.quizScore}>
                        Diem: {attempt.score}/{attempt.max_score} ({attempt.score_percentage}%)
                      </Text>
                      <Text style={styles.quizDate}>
                        {formatDate(attempt.completed_at)}
                      </Text>
                    </View>
                    <View style={styles.quizProgressBar}>
                      <View
                        style={[
                          styles.quizProgressFill,
                          {
                            width: `${attempt.score_percentage}%`,
                            backgroundColor: attempt.passed ? '#10B981' : '#EF4444',
                          }
                        ]}
                      />
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

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

  // Student Card
  studentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GLASS.background,
    borderWidth: 1,
    borderColor: GLASS.border,
    borderRadius: 16,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  avatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 189, 89, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  studentInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  studentName: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  studentEmail: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  enrolledDate: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    marginTop: 4,
  },

  // Section
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semiBold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },

  // Progress Card
  progressCard: {
    backgroundColor: GLASS.background,
    borderWidth: 1,
    borderColor: GLASS.border,
    borderRadius: 16,
    padding: SPACING.lg,
  },
  progressCircleContainer: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  progressCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 8,
    borderColor: COLORS.gold,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 189, 89, 0.1)',
  },
  progressPercent: {
    fontSize: 28,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gold,
  },
  progressLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
  },

  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
  },
  statValue: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginTop: SPACING.xs,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    marginTop: 2,
  },

  // Lessons List
  lessonsList: {
    gap: SPACING.sm,
  },
  lessonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: GLASS.background,
    borderWidth: 1,
    borderColor: GLASS.border,
    borderRadius: 12,
    padding: SPACING.md,
  },
  lessonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  lessonStatus: {
    marginRight: SPACING.sm,
  },
  lessonStatusCompleted: {},
  lessonInfo: {
    flex: 1,
  },
  lessonModuleName: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.gold,
    marginBottom: 2,
  },
  lessonTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.textPrimary,
  },
  lessonTitleCompleted: {
    color: COLORS.textSecondary,
  },
  lessonMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  lessonType: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
  },
  lessonWatchTime: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    marginLeft: SPACING.sm,
  },
  completedAt: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: '#10B981',
  },

  // Quiz List
  quizList: {
    gap: SPACING.sm,
  },
  quizItem: {
    backgroundColor: GLASS.background,
    borderWidth: 1,
    borderColor: GLASS.border,
    borderRadius: 12,
    padding: SPACING.md,
  },
  quizHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  quizTitle: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.textPrimary,
  },
  quizBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  quizBadgePassed: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  quizBadgeFailed: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  quizBadgeText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  quizBadgeTextPassed: {
    color: '#10B981',
  },
  quizBadgeTextFailed: {
    color: '#EF4444',
  },
  quizDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  quizScore: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  },
  quizDate: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
  },
  quizProgressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  quizProgressFill: {
    height: '100%',
    borderRadius: 2,
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
});

export default StudentProgressScreen;
