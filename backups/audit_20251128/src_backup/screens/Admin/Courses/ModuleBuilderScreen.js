/**
 * Gemral - Module Builder Screen
 * Edit module and manage lessons
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import DraggableFlatList, { ScaleDecorator } from 'react-native-draggable-flatlist';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  ChevronLeft,
  Save,
  Plus,
  Trash2,
  ChevronRight,
  FileText,
  Play,
  HelpCircle,
  GripVertical,
  Eye,
  Copy,
} from 'lucide-react-native';

import { supabase } from '../../../services/supabase';
import { useAuth } from '../../../contexts/AuthContext';
import { COLORS, GRADIENTS, SPACING, TYPOGRAPHY, GLASS } from '../../../utils/tokens';

const LESSON_TYPES = [
  { value: 'video', label: 'Video', icon: Play, color: COLORS.success },
  { value: 'article', label: 'Bài viết', icon: FileText, color: COLORS.gold },
  { value: 'quiz', label: 'Quiz', icon: HelpCircle, color: '#6A5BFF' },
];

const ModuleBuilderScreen = ({ navigation, route }) => {
  const { moduleId, courseId, moduleTitle: initialTitle } = route.params || {};
  const { isAdmin } = useAuth();

  // Form state
  const [title, setTitle] = useState(initialTitle || '');
  const [description, setDescription] = useState('');
  const [lessons, setLessons] = useState([]);

  // UI state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Modal state for adding lesson (Android compatible)
  const [showAddLessonModal, setShowAddLessonModal] = useState(false);
  const [newLessonName, setNewLessonName] = useState('');
  const [newLessonType, setNewLessonType] = useState('video');

  // Load module data
  useEffect(() => {
    loadModuleData();
  }, [moduleId]);

  const loadModuleData = async () => {
    try {
      setLoading(true);

      // Load module
      const { data: module, error: moduleError } = await supabase
        .from('course_modules')
        .select('*')
        .eq('id', moduleId)
        .single();

      if (moduleError) throw moduleError;

      setTitle(module.title || '');
      setDescription(module.description || '');

      // Load lessons
      const { data: lessonsData, error: lessonsError } = await supabase
        .from('course_lessons')
        .select('*')
        .eq('module_id', moduleId)
        .order('order_index', { ascending: true });

      if (lessonsError) throw lessonsError;

      setLessons(lessonsData || []);
    } catch (error) {
      console.error('[ModuleBuilderScreen] loadModuleData error:', error);
      Alert.alert('Lỗi', 'Không thể tải dữ liệu module');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  // Save module
  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên module');
      return;
    }

    try {
      setSaving(true);

      const { error } = await supabase
        .from('course_modules')
        .update({
          title: title.trim(),
          description: description.trim(),
        })
        .eq('id', moduleId);

      if (error) throw error;

      Alert.alert('Thành công', 'Đã cập nhật module');
    } catch (error) {
      console.error('[ModuleBuilderScreen] save error:', error);
      Alert.alert('Lỗi', 'Không thể lưu module');
    } finally {
      setSaving(false);
    }
  };

  // Show add lesson modal (Android compatible)
  const showAddLessonOptions = () => {
    setNewLessonName('');
    setNewLessonType('video');
    setShowAddLessonModal(true);
  };

  // Confirm add lesson from modal
  const confirmAddLesson = async () => {
    if (!newLessonName.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên bài học');
      return;
    }

    try {
      const lessonId = `lesson-${moduleId}-${Date.now()}`;
      const newOrderIndex = lessons.length;

      const { error } = await supabase
        .from('course_lessons')
        .insert({
          id: lessonId,
          module_id: moduleId,
          course_id: courseId,
          title: newLessonName.trim(),
          type: newLessonType,
          order_index: newOrderIndex,
          duration_minutes: 0,
        });

      if (error) throw error;

      const newLesson = {
        id: lessonId,
        module_id: moduleId,
        course_id: courseId,
        title: newLessonName.trim(),
        type: newLessonType,
        order_index: newOrderIndex,
        duration_minutes: 0,
      };

      setLessons(prev => [...prev, newLesson]);
      setShowAddLessonModal(false);

      // Navigate to lesson builder
      navigation.navigate('LessonBuilder', {
        lessonId: lessonId,
        courseId: courseId,
        moduleId: moduleId,
        lessonType: newLessonType,
      });

    } catch (error) {
      console.error('[ModuleBuilderScreen] addLesson error:', error);
      Alert.alert('Lỗi', 'Không thể thêm bài học');
    }
  };

  // Edit lesson
  const handleEditLesson = (lesson) => {
    navigation.navigate('LessonBuilder', {
      lessonId: lesson.id,
      courseId: courseId,
      moduleId: moduleId,
      lessonType: lesson.type,
    });
  };

  // Delete lesson
  const handleDeleteLesson = (lesson) => {
    Alert.alert(
      'Xóa bài học',
      `Bạn có chắc muốn xóa "${lesson.title}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('course_lessons')
                .delete()
                .eq('id', lesson.id);

              if (error) throw error;

              setLessons(prev => prev.filter(l => l.id !== lesson.id));
            } catch (error) {
              console.error('[ModuleBuilderScreen] deleteLesson error:', error);
              Alert.alert('Lỗi', 'Không thể xóa bài học');
            }
          }
        }
      ]
    );
  };

  // Duplicate lesson
  const handleDuplicateLesson = async (lesson) => {
    try {
      const newLessonId = `lesson-${moduleId}-${Date.now()}`;
      const newOrderIndex = lessons.length;

      // Create duplicated lesson
      const { error } = await supabase
        .from('course_lessons')
        .insert({
          id: newLessonId,
          module_id: moduleId,
          course_id: courseId,
          title: `${lesson.title} (Bản sao)`,
          type: lesson.type,
          content: lesson.content,
          video_url: lesson.video_url,
          duration_minutes: lesson.duration_minutes,
          order_index: newOrderIndex,
          is_free_preview: lesson.is_free_preview,
        });

      if (error) throw error;

      // Update local state
      setLessons(prev => [...prev, {
        ...lesson,
        id: newLessonId,
        title: `${lesson.title} (Bản sao)`,
        order_index: newOrderIndex,
      }]);

      Alert.alert('Thành công', 'Đã sao chép bài học');
    } catch (error) {
      console.error('[ModuleBuilderScreen] duplicateLesson error:', error);
      Alert.alert('Lỗi', 'Không thể sao chép bài học');
    }
  };

  // Get lesson type info
  const getLessonTypeInfo = (type) => {
    return LESSON_TYPES.find(t => t.value === type) || LESSON_TYPES[0];
  };

  // Handle lesson reorder via drag-drop
  const handleLessonReorder = async ({ data }) => {
    // Update local state immediately
    setLessons(data);

    // Update order_index in database
    try {
      const updates = data.map((lesson, index) => ({
        id: lesson.id,
        order_index: index,
      }));

      // Update each lesson's order_index
      for (const update of updates) {
        await supabase
          .from('course_lessons')
          .update({ order_index: update.order_index })
          .eq('id', update.id);
      }
    } catch (error) {
      console.error('[ModuleBuilderScreen] reorder error:', error);
      // Reload to get correct order on error
      loadModuleData();
    }
  };

  // Render lesson item for DraggableFlatList
  const renderLessonItem = ({ item: lesson, drag, isActive }) => {
    const typeInfo = getLessonTypeInfo(lesson.type);
    const TypeIcon = typeInfo.icon;

    return (
      <ScaleDecorator>
        <TouchableOpacity
          style={[styles.lessonCard, isActive && styles.lessonCardDragging]}
          onPress={() => handleEditLesson(lesson)}
          onLongPress={drag}
          delayLongPress={150}
        >
          <View style={styles.lessonLeft}>
            <TouchableOpacity onLongPress={drag} delayLongPress={50}>
              <GripVertical size={18} color={isActive ? COLORS.gold : COLORS.textMuted} />
            </TouchableOpacity>
            <View style={[styles.lessonTypeIcon, { backgroundColor: `${typeInfo.color}20` }]}>
              <TypeIcon size={16} color={typeInfo.color} />
            </View>
            <View style={styles.lessonInfo}>
              <Text style={styles.lessonTitle} numberOfLines={1}>{lesson.title}</Text>
              <View style={styles.lessonMeta}>
                <Text style={styles.lessonType}>{typeInfo.label}</Text>
                {lesson.duration_minutes > 0 && (
                  <Text style={styles.lessonDuration}>{lesson.duration_minutes} phút</Text>
                )}
                {lesson.is_preview && (
                  <View style={styles.previewBadge}>
                    <Eye size={10} color={COLORS.gold} />
                    <Text style={styles.previewText}>Preview</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
          <View style={styles.lessonActions}>
            <TouchableOpacity
              style={styles.lessonActionBtn}
              onPress={() => handleDuplicateLesson(lesson)}
            >
              <Copy size={16} color={COLORS.gold} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.lessonActionBtn}
              onPress={() => handleDeleteLesson(lesson)}
            >
              <Trash2 size={16} color={COLORS.error} />
            </TouchableOpacity>
            <ChevronRight size={18} color={COLORS.textMuted} />
          </View>
        </TouchableOpacity>
      </ScaleDecorator>
    );
  };

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
    <GestureHandlerRootView style={{ flex: 1 }}>
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
              <Text style={styles.headerTitle} numberOfLines={1}>
                {title || 'Module'}
              </Text>
              <TouchableOpacity
                style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#000" />
                ) : (
                  <Save size={20} color="#000" />
                )}
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.content}
              contentContainerStyle={styles.contentContainer}
              showsVerticalScrollIndicator={false}
            >
            {/* Module Info */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Thông tin Module</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Tên module *</Text>
                <TextInput
                  style={styles.input}
                  value={title}
                  onChangeText={setTitle}
                  placeholder="VD: Module 1 - Giới thiệu"
                  placeholderTextColor={COLORS.textMuted}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Mô tả</Text>
                <TextInput
                  style={[styles.input, styles.inputMultiline]}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Mô tả nội dung module..."
                  placeholderTextColor={COLORS.textMuted}
                  multiline
                  numberOfLines={3}
                />
              </View>
            </View>

            {/* Lessons */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Bài học ({lessons.length})</Text>
                <TouchableOpacity
                  style={styles.addLessonBtn}
                  onPress={showAddLessonOptions}
                >
                  <Plus size={18} color="#000" />
                  <Text style={styles.addLessonBtnText}>Thêm</Text>
                </TouchableOpacity>
              </View>

              {lessons.length === 0 ? (
                <View style={styles.emptyLessons}>
                  <FileText size={40} color={COLORS.textMuted} />
                  <Text style={styles.emptyLessonsText}>Chưa có bài học nào</Text>
                  <Text style={styles.emptyLessonsHint}>
                    Nhấn "Thêm" để tạo bài học mới
                  </Text>
                </View>
              ) : (
                <View style={styles.draggableContainer}>
                  <DraggableFlatList
                    data={lessons}
                    renderItem={renderLessonItem}
                    keyExtractor={(item) => item.id}
                    onDragEnd={handleLessonReorder}
                    scrollEnabled={false}
                  />
                  <Text style={styles.dragHint}>Giữ và kéo để sắp xếp lại</Text>
                </View>
              )}
            </View>

            {/* Bottom Spacer */}
            <View style={{ height: 100 }} />
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>

      {/* Add Lesson Modal */}
      <Modal
        visible={showAddLessonModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAddLessonModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Thêm bài học</Text>

            {/* Lesson Type Selector */}
            <Text style={styles.modalLabel}>Loại bài học</Text>
            <View style={styles.lessonTypeSelector}>
              {LESSON_TYPES.map((type) => {
                const TypeIcon = type.icon;
                return (
                  <TouchableOpacity
                    key={type.value}
                    style={[
                      styles.lessonTypeOption,
                      newLessonType === type.value && styles.lessonTypeOptionActive,
                    ]}
                    onPress={() => setNewLessonType(type.value)}
                  >
                    <TypeIcon size={20} color={newLessonType === type.value ? type.color : COLORS.textMuted} />
                    <Text
                      style={[
                        styles.lessonTypeText,
                        newLessonType === type.value && { color: type.color },
                      ]}
                    >
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Lesson Name Input */}
            <Text style={styles.modalLabel}>Tên bài học</Text>
            <TextInput
              style={styles.modalInput}
              value={newLessonName}
              onChangeText={setNewLessonName}
              placeholder="VD: Bài 1 - Giới thiệu..."
              placeholderTextColor={COLORS.textMuted}
              autoFocus
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShowAddLessonModal(false)}
              >
                <Text style={styles.modalCancelText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirmBtn}
                onPress={confirmAddLesson}
              >
                <Text style={styles.modalConfirmText}>Thêm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      </View>
    </GestureHandlerRootView>
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
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginHorizontal: SPACING.sm,
  },
  saveBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.gold,
    borderRadius: 12,
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },

  // Content
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: SPACING.md,
  },

  // Sections
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
  },

  // Input
  inputGroup: {
    marginBottom: SPACING.md,
  },
  inputLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginBottom: SPACING.xs,
  },
  input: {
    backgroundColor: GLASS.background,
    borderWidth: 1,
    borderColor: GLASS.border,
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textPrimary,
  },
  inputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },

  // Add Lesson
  addLessonBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.gold,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 8,
  },
  addLessonBtnText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semiBold,
    color: '#000',
  },

  // Empty State
  emptyLessons: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    backgroundColor: GLASS.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: GLASS.border,
    borderStyle: 'dashed',
  },
  emptyLessonsText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textPrimary,
    marginTop: SPACING.sm,
  },
  emptyLessonsHint: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },

  // Lessons List
  lessonsList: {
    gap: SPACING.sm,
  },
  lessonCard: {
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
    gap: SPACING.sm,
    flex: 1,
  },
  lessonTypeIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lessonInfo: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.textPrimary,
  },
  lessonMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginTop: 2,
  },
  lessonType: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
  },
  lessonDuration: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
  },
  previewBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: 'rgba(255, 189, 89, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  previewText: {
    fontSize: 10,
    color: COLORS.gold,
    fontWeight: TYPOGRAPHY.fontWeight.semiBold,
  },
  lessonActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  lessonActionBtn: {
    padding: SPACING.xs,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modalContent: {
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    padding: SPACING.lg,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: GLASS.border,
  },
  modalTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  modalLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginBottom: SPACING.xs,
  },
  modalInput: {
    backgroundColor: GLASS.background,
    borderWidth: 1,
    borderColor: GLASS.border,
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textPrimary,
    marginBottom: SPACING.lg,
  },
  lessonTypeSelector: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  lessonTypeOption: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xs,
    backgroundColor: GLASS.background,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: GLASS.border,
    gap: 4,
  },
  lessonTypeOptionActive: {
    borderColor: COLORS.gold,
    backgroundColor: 'rgba(255, 189, 89, 0.1)',
  },
  lessonTypeText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
  },
  modalActions: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  modalConfirmBtn: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: 10,
    backgroundColor: COLORS.gold,
    alignItems: 'center',
  },
  modalConfirmText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: '#000',
    fontWeight: TYPOGRAPHY.fontWeight.semiBold,
  },

  // Drag-Drop Styles
  draggableContainer: {
    flex: 1,
  },
  lessonCardDragging: {
    borderColor: COLORS.gold,
    backgroundColor: 'rgba(255, 189, 89, 0.15)',
    elevation: 8,
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  dragHint: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.sm,
    fontStyle: 'italic',
  },
});

export default ModuleBuilderScreen;
