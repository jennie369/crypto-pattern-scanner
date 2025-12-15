/**
 * Gemral - Admin Course List Screen
 * Displays all courses with management options
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import CustomAlert, { useCustomAlert } from '../../../components/CustomAlert';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Plus,
  BookOpen,
  Users,
  BarChart2,
  Eye,
  EyeOff,
  Edit2,
  Trash2,
  ChevronRight,
  ChevronLeft,
  Layers,
  FileText,
  Copy,
} from 'lucide-react-native';

import { supabase } from '../../../services/supabase';
import { useAuth } from '../../../contexts/AuthContext';
import { COLORS, GRADIENTS, SPACING, TYPOGRAPHY, GLASS } from '../../../utils/tokens';

const CourseListScreen = ({ navigation }) => {
  const { user, isAdmin } = useAuth();
  const { alert, AlertComponent } = useCustomAlert();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Check admin access
  useEffect(() => {
    if (!isAdmin) {
      alert({
        type: 'error',
        title: 'Lỗi',
        message: 'Bạn không có quyền truy cập trang này',
        buttons: [{ text: 'OK', onPress: () => navigation.goBack() }],
      });
    }
  }, [isAdmin]);

  // Fetch courses
  const fetchCourses = useCallback(async () => {
    try {
      // Get courses with counts
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false });

      if (coursesError) throw coursesError;

      // Get counts for each course
      const coursesWithStats = await Promise.all(
        (coursesData || []).map(async (course) => {
          // Get modules count
          const { count: modulesCount } = await supabase
            .from('course_modules')
            .select('id', { count: 'exact', head: true })
            .eq('course_id', course.id);

          // Get lessons count
          const { count: lessonsCount } = await supabase
            .from('course_lessons')
            .select('id', { count: 'exact', head: true })
            .eq('course_id', course.id);

          // Get enrollments count
          const { count: studentsCount } = await supabase
            .from('course_enrollments')
            .select('id', { count: 'exact', head: true })
            .eq('course_id', course.id);

          return {
            ...course,
            modulesCount: modulesCount || 0,
            lessonsCount: lessonsCount || 0,
            studentsCount: studentsCount || 0,
          };
        })
      );

      setCourses(coursesWithStats);
    } catch (error) {
      console.error('[CourseListScreen] fetchCourses error:', error);
      alert({
        type: 'error',
        title: 'Lỗi',
        message: 'Không thể tải danh sách khóa học',
        buttons: [{ text: 'OK' }],
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCourses();
    setRefreshing(false);
  };

  // Navigation handlers
  const handleCreateCourse = () => {
    navigation.navigate('CourseBuilder', { mode: 'create' });
  };

  const handleEditCourse = (course) => {
    navigation.navigate('CourseBuilder', { mode: 'edit', courseId: course.id });
  };

  const handleViewStudents = (course) => {
    navigation.navigate('CourseStudents', { courseId: course.id, courseTitle: course.title });
  };

  // Toggle publish status
  const handleTogglePublish = async (course) => {
    try {
      const newStatus = !course.is_published;
      const { error } = await supabase
        .from('courses')
        .update({ is_published: newStatus })
        .eq('id', course.id);

      if (error) throw error;

      // Update local state
      setCourses(prev =>
        prev.map(c =>
          c.id === course.id ? { ...c, is_published: newStatus } : c
        )
      );

      alert({
        type: 'success',
        title: 'Thành công',
        message: newStatus ? 'Khóa học đã được xuất bản' : 'Khóa học đã chuyển sang nháp',
        buttons: [{ text: 'OK' }],
      });
    } catch (error) {
      console.error('[CourseListScreen] togglePublish error:', error);
      alert({
        type: 'error',
        title: 'Lỗi',
        message: 'Không thể cập nhật trạng thái',
        buttons: [{ text: 'OK' }],
      });
    }
  };

  // Delete course
  const handleDeleteCourse = (course) => {
    alert({
      type: 'warning',
      title: 'Xóa khóa học',
      message: `Bạn có chắc muốn xóa "${course.title}"?\n\nHành động này sẽ xóa tất cả modules, bài học và quiz liên quan. Không thể hoàn tác.`,
      buttons: [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('courses')
                .delete()
                .eq('id', course.id);

              if (error) throw error;

              setCourses(prev => prev.filter(c => c.id !== course.id));
              alert({
                type: 'success',
                title: 'Thành công',
                message: 'Đã xóa khóa học',
                buttons: [{ text: 'OK' }],
              });
            } catch (error) {
              console.error('[CourseListScreen] delete error:', error);
              alert({
                type: 'error',
                title: 'Lỗi',
                message: 'Không thể xóa khóa học',
                buttons: [{ text: 'OK' }],
              });
            }
          }
        }
      ],
    });
  };

  // Duplicate course with all modules and lessons
  const handleDuplicateCourse = async (course) => {
    try {
      // Generate new course ID
      const newCourseId = `course-${Date.now()}`;

      // 1. Create new course (as draft)
      const { error: courseError } = await supabase
        .from('courses')
        .insert({
          id: newCourseId,
          title: `${course.title} (Bản sao)`,
          description: course.description,
          thumbnail_url: course.thumbnail_url,
          tier_required: course.tier_required,
          price: course.price,
          membership_duration_days: course.membership_duration_days,
          shopify_product_id: null, // Clear Shopify link for duplicated course
          is_published: false, // Always draft
          created_by: user?.id,
        });

      if (courseError) throw courseError;

      // 2. Fetch original modules
      const { data: originalModules, error: modulesError } = await supabase
        .from('course_modules')
        .select('*')
        .eq('course_id', course.id)
        .order('order_index', { ascending: true });

      if (modulesError) throw modulesError;

      // 3. Duplicate modules and their lessons
      if (originalModules && originalModules.length > 0) {
        for (const module of originalModules) {
          const newModuleId = `module-${newCourseId}-${module.order_index}-${Date.now()}`;

          // Create duplicated module
          const { error: dupModuleError } = await supabase
            .from('course_modules')
            .insert({
              id: newModuleId,
              course_id: newCourseId,
              title: module.title,
              description: module.description,
              order_index: module.order_index,
            });

          if (dupModuleError) throw dupModuleError;

          // Fetch original lessons for this module
          const { data: originalLessons, error: lessonsError } = await supabase
            .from('course_lessons')
            .select('*')
            .eq('module_id', module.id)
            .order('order_index', { ascending: true });

          if (lessonsError) throw lessonsError;

          // Duplicate lessons
          if (originalLessons && originalLessons.length > 0) {
            const duplicatedLessons = originalLessons.map((lesson, idx) => ({
              id: `lesson-${newModuleId}-${idx}-${Date.now()}`,
              module_id: newModuleId,
              course_id: newCourseId,
              title: lesson.title,
              type: lesson.type,
              content: lesson.content,
              video_url: lesson.video_url,
              duration_minutes: lesson.duration_minutes,
              order_index: lesson.order_index,
              is_free_preview: lesson.is_free_preview,
            }));

            const { error: dupLessonsError } = await supabase
              .from('course_lessons')
              .insert(duplicatedLessons);

            if (dupLessonsError) throw dupLessonsError;
          }
        }
      }

      alert({
        type: 'success',
        title: 'Thành công',
        message: 'Đã sao chép khóa học với tất cả modules và bài học',
        buttons: [{ text: 'OK', onPress: () => fetchCourses() }],
      });
    } catch (error) {
      console.error('[CourseListScreen] duplicateCourse error:', error);
      alert({
        type: 'error',
        title: 'Lỗi',
        message: 'Không thể sao chép khóa học',
        buttons: [{ text: 'OK' }],
      });
    }
  };

  // Render course card
  const renderCourseItem = ({ item }) => (
    <TouchableOpacity
      style={styles.courseCard}
      onPress={() => handleEditCourse(item)}
      activeOpacity={0.7}
    >
      {/* Header */}
      <View style={styles.courseHeader}>
        <View style={styles.courseTitleRow}>
          <BookOpen size={20} color={COLORS.gold} />
          <Text style={styles.courseTitle} numberOfLines={1}>
            {item.title}
          </Text>
        </View>
        <View style={[
          styles.statusBadge,
          item.is_published ? styles.statusPublished : styles.statusDraft
        ]}>
          <Text style={[
            styles.statusText,
            { color: item.is_published ? COLORS.success : COLORS.gold }
          ]}>
            {item.is_published ? 'Đã xuất bản' : 'Nháp'}
          </Text>
        </View>
      </View>

      {/* Description */}
      {item.description && (
        <Text style={styles.courseDescription} numberOfLines={2}>
          {item.description}
        </Text>
      )}

      {/* Stats */}
      <View style={styles.courseStats}>
        <View style={styles.statItem}>
          <Users size={14} color={COLORS.textMuted} />
          <Text style={styles.statText}>{item.studentsCount} học viên</Text>
        </View>
        <View style={styles.statItem}>
          <Layers size={14} color={COLORS.textMuted} />
          <Text style={styles.statText}>{item.modulesCount} modules</Text>
        </View>
        <View style={styles.statItem}>
          <FileText size={14} color={COLORS.textMuted} />
          <Text style={styles.statText}>{item.lessonsCount} bài học</Text>
        </View>
      </View>

      {/* Tier & Price */}
      <View style={styles.tierRow}>
        <Text style={styles.tierLabel}>Tier:</Text>
        <Text style={styles.tierValue}>{item.tier_required || 'FREE'}</Text>
        {item.price > 0 && (
          <>
            <Text style={styles.tierLabel}>Giá:</Text>
            <Text style={styles.priceValue}>
              {item.price?.toLocaleString()}đ
            </Text>
          </>
        )}
      </View>

      {/* Actions */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => handleViewStudents(item)}
        >
          <Users size={16} color={COLORS.success} />
          <Text style={[styles.actionLabel, { color: COLORS.success }]}>Học viên</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => handleTogglePublish(item)}
        >
          {item.is_published ? (
            <>
              <EyeOff size={16} color={COLORS.error} />
              <Text style={[styles.actionLabel, { color: COLORS.error }]}>Ẩn</Text>
            </>
          ) : (
            <>
              <Eye size={16} color={COLORS.success} />
              <Text style={[styles.actionLabel, { color: COLORS.success }]}>Hiện</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => handleDuplicateCourse(item)}
        >
          <Copy size={16} color="#6A5BFF" />
          <Text style={[styles.actionLabel, { color: '#6A5BFF' }]}>Nhân bản</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => handleEditCourse(item)}
        >
          <Edit2 size={16} color={COLORS.gold} />
          <Text style={[styles.actionLabel, { color: COLORS.gold }]}>Sửa</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => handleDeleteCourse(item)}
        >
          <Trash2 size={16} color={COLORS.error} />
          <Text style={[styles.actionLabel, { color: COLORS.error }]}>Xóa</Text>
        </TouchableOpacity>

        <ChevronRight size={16} color={COLORS.textMuted} style={{ marginLeft: 'auto' }} />
      </View>
    </TouchableOpacity>
  );

  // Empty state
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <BookOpen size={64} color={COLORS.textMuted} />
      <Text style={styles.emptyTitle}>Chưa có khóa học nào</Text>
      <Text style={styles.emptySubtitle}>
        Tạo khóa học đầu tiên để bắt đầu
      </Text>
      <TouchableOpacity style={styles.emptyBtn} onPress={handleCreateCourse}>
        <Plus size={20} color="#000" />
        <Text style={styles.emptyBtnText}>Tạo khóa học</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={GRADIENTS.background} style={styles.gradient}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.gold} />
            <Text style={styles.loadingText}>Đang tải...</Text>
          </View>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={GRADIENTS.background} style={styles.gradient}>
        <SafeAreaView style={styles.safeArea}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => navigation.goBack()}
            >
              <ChevronLeft size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Quản lý khóa học</Text>
            <TouchableOpacity style={styles.createBtn} onPress={handleCreateCourse}>
              <Plus size={20} color="#000" />
            </TouchableOpacity>
          </View>

          {/* Course List */}
          <FlatList
            data={courses}
            renderItem={renderCourseItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={COLORS.gold}
                colors={[COLORS.gold]}
              />
            }
            ListEmptyComponent={renderEmptyState}
            showsVerticalScrollIndicator={false}
          />

          {AlertComponent}
        </SafeAreaView>
      </LinearGradient>
    </View>
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
  safeArea: {
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
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  createBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.gold,
    borderRadius: 12,
  },

  // List
  listContent: {
    padding: SPACING.md,
    paddingBottom: 120, // Account for bottom tab bar
  },

  // Course Card
  courseCard: {
    backgroundColor: GLASS.background,
    borderRadius: 16,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: GLASS.border,
  },
  courseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  courseTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: SPACING.sm,
  },
  courseTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusPublished: {
    backgroundColor: 'rgba(58, 247, 166, 0.15)',
  },
  statusDraft: {
    backgroundColor: 'rgba(255, 189, 89, 0.15)',
  },
  statusText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.semiBold,
  },
  courseDescription: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginBottom: SPACING.sm,
    lineHeight: 20,
  },

  // Stats
  courseStats: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.sm,
    paddingVertical: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
  },

  // Tier
  tierRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  tierLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
  },
  tierValue: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.semiBold,
    color: COLORS.gold,
  },
  priceValue: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.semiBold,
    color: COLORS.success,
  },

  // Actions
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  actionBtn: {
    width: 56,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    paddingVertical: SPACING.xs,
  },
  actionLabel: {
    fontSize: 9,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    marginTop: 2,
    textAlign: 'center',
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.huge * 2,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semiBold,
    color: COLORS.textPrimary,
    marginTop: SPACING.lg,
  },
  emptySubtitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
    marginBottom: SPACING.lg,
  },
  emptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.gold,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: 12,
  },
  emptyBtnText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semiBold,
    color: '#000',
  },
});

export default CourseListScreen;
