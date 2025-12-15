/**
 * Gemral - Course Builder Screen
 * Create and edit courses with modules management
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import DraggableFlatList, { ScaleDecorator } from 'react-native-draggable-flatlist';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  ChevronLeft,
  Save,
  Plus,
  Trash2,
  Edit2,
  ChevronRight,
  Layers,
  Image as ImageIcon,
  DollarSign,
  Clock,
  Link,
  GripVertical,
  Camera,
  Upload,
  Copy,
} from 'lucide-react-native';

import { supabase } from '../../../services/supabase';
import { useAuth } from '../../../contexts/AuthContext';
import { COLORS, GRADIENTS, SPACING, TYPOGRAPHY, GLASS } from '../../../utils/tokens';

const TIERS = ['FREE', 'TIER1', 'TIER2', 'TIER3'];

const CourseBuilderScreen = ({ navigation, route }) => {
  const { mode = 'create', courseId } = route.params || {};
  const { user, isAdmin } = useAuth();
  const isEditMode = mode === 'edit' && courseId;

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [tierRequired, setTierRequired] = useState('FREE');
  const [price, setPrice] = useState('');
  const [membershipDuration, setMembershipDuration] = useState('');
  const [shopifyProductId, setShopifyProductId] = useState('');
  const [isPublished, setIsPublished] = useState(false);

  // Modules
  const [modules, setModules] = useState([]);

  // UI state
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);

  // Modal state for adding module (Android compatible)
  const [showAddModuleModal, setShowAddModuleModal] = useState(false);
  const [newModuleName, setNewModuleName] = useState('');

  // Thumbnail upload state
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);

  // Load existing course data
  useEffect(() => {
    if (isEditMode) {
      loadCourseData();
    }
  }, [courseId]);

  const loadCourseData = async () => {
    try {
      setLoading(true);

      // Load course
      const { data: course, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();

      if (courseError) throw courseError;

      // Set form values
      setTitle(course.title || '');
      setDescription(course.description || '');
      setThumbnailUrl(course.thumbnail_url || '');
      setTierRequired(course.tier_required || 'FREE');
      setPrice(course.price?.toString() || '');
      setMembershipDuration(course.membership_duration_days?.toString() || '');
      setShopifyProductId(course.shopify_product_id || '');
      setIsPublished(course.is_published || false);

      // Load modules
      const { data: modulesData, error: modulesError } = await supabase
        .from('course_modules')
        .select('*, lessons:course_lessons(count)')
        .eq('course_id', courseId)
        .order('order_index', { ascending: true });

      if (modulesError) throw modulesError;

      setModules(modulesData || []);
    } catch (error) {
      console.error('[CourseBuilderScreen] loadCourseData error:', error);
      Alert.alert('Lỗi', 'Không thể tải dữ liệu khóa học');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  // Generate course ID from title
  const generateCourseId = (title) => {
    return 'course-' + title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .substring(0, 50);
  };

  // Save course
  const handleSave = async () => {
    // Validate
    if (!title.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên khóa học');
      return;
    }

    try {
      setSaving(true);

      const courseData = {
        title: title.trim(),
        description: description.trim(),
        thumbnail_url: thumbnailUrl.trim() || null,
        tier_required: tierRequired,
        price: price ? parseFloat(price) : null,
        membership_duration_days: membershipDuration ? parseInt(membershipDuration) : null,
        shopify_product_id: shopifyProductId.trim() || null,
        is_published: isPublished,
      };

      if (isEditMode) {
        // Update existing course
        const { error } = await supabase
          .from('courses')
          .update(courseData)
          .eq('id', courseId);

        if (error) throw error;
        Alert.alert('Thành công', 'Đã cập nhật khóa học');
      } else {
        // Create new course
        const newId = generateCourseId(title);
        const { error } = await supabase
          .from('courses')
          .insert({
            id: newId,
            ...courseData,
            created_by: user?.id,
          });

        if (error) throw error;

        Alert.alert('Thành công', 'Đã tạo khóa học mới', [
          {
            text: 'OK',
            onPress: () => navigation.replace('CourseBuilder', { mode: 'edit', courseId: newId })
          }
        ]);
      }
    } catch (error) {
      console.error('[CourseBuilderScreen] save error:', error);
      Alert.alert('Lỗi', error.message || 'Không thể lưu khóa học');
    } finally {
      setSaving(false);
    }
  };

  // Add new module - Show modal (Android compatible)
  const handleAddModule = () => {
    if (!isEditMode) {
      Alert.alert('Thông báo', 'Vui lòng lưu khóa học trước khi thêm module');
      return;
    }
    setNewModuleName('');
    setShowAddModuleModal(true);
  };

  // Handle thumbnail upload
  const handleUploadThumbnail = async () => {
    try {
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Lỗi', 'Cần quyền truy cập thư viện ảnh để tải thumbnail');
        return;
      }

      // Pick image
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (result.canceled) return;

      const image = result.assets[0];
      if (!image) return;

      setUploadingThumbnail(true);

      // Generate filename
      const fileExt = image.uri.split('.').pop() || 'jpg';
      const fileName = `course-thumbnails/${courseId || 'new'}-${Date.now()}.${fileExt}`;

      // Read as blob
      const response = await fetch(image.uri);
      const blob = await response.blob();

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('course-images')
        .upload(fileName, blob, {
          contentType: `image/${fileExt}`,
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) {
        console.error('[CourseBuilderScreen] Thumbnail upload error:', uploadError);
        if (uploadError.message?.includes('Bucket not found')) {
          Alert.alert(
            'Lỗi',
            'Storage bucket chưa được tạo.\n\nVui lòng tạo bucket "course-images" trong Supabase Dashboard → Storage.'
          );
        } else {
          Alert.alert('Lỗi', `Không thể upload ảnh: ${uploadError.message}`);
        }
        return;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('course-images')
        .getPublicUrl(fileName);

      setThumbnailUrl(urlData.publicUrl);
      Alert.alert('Thành công', 'Đã tải lên thumbnail');

    } catch (error) {
      console.error('[CourseBuilderScreen] handleUploadThumbnail error:', error);
      Alert.alert('Lỗi', 'Không thể tải ảnh lên');
    } finally {
      setUploadingThumbnail(false);
    }
  };

  // Confirm add module from modal
  const confirmAddModule = async () => {
    if (!newModuleName.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên module');
      return;
    }

    try {
      const moduleId = `module-${courseId}-${Date.now()}`;
      const newOrderIndex = modules.length;

      const { error } = await supabase
        .from('course_modules')
        .insert({
          id: moduleId,
          course_id: courseId,
          title: newModuleName.trim(),
          order_index: newOrderIndex,
        });

      if (error) throw error;

      setModules(prev => [...prev, {
        id: moduleId,
        course_id: courseId,
        title: newModuleName.trim(),
        order_index: newOrderIndex,
        lessons: [{ count: 0 }],
      }]);

      setShowAddModuleModal(false);
      setNewModuleName('');
    } catch (error) {
      console.error('[CourseBuilderScreen] addModule error:', error);
      Alert.alert('Lỗi', 'Không thể thêm module');
    }
  };

  // Edit module
  const handleEditModule = (module) => {
    navigation.navigate('ModuleBuilder', {
      moduleId: module.id,
      courseId: courseId,
      moduleTitle: module.title,
    });
  };

  // Delete module
  const handleDeleteModule = (module) => {
    Alert.alert(
      'Xóa Module',
      `Bạn có chắc muốn xóa "${module.title}"?\nTất cả bài học trong module sẽ bị xóa.`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('course_modules')
                .delete()
                .eq('id', module.id);

              if (error) throw error;

              setModules(prev => prev.filter(m => m.id !== module.id));
            } catch (error) {
              console.error('[CourseBuilderScreen] deleteModule error:', error);
              Alert.alert('Lỗi', 'Không thể xóa module');
            }
          }
        }
      ]
    );
  };

  // Duplicate module with all lessons
  const handleDuplicateModule = async (module) => {
    try {
      const newModuleId = `module-${courseId}-${Date.now()}`;
      const newOrderIndex = modules.length;

      // 1. Create new module
      const { error: moduleError } = await supabase
        .from('course_modules')
        .insert({
          id: newModuleId,
          course_id: courseId,
          title: `${module.title} (Bản sao)`,
          description: module.description,
          order_index: newOrderIndex,
        });

      if (moduleError) throw moduleError;

      // 2. Fetch lessons from original module
      const { data: originalLessons, error: lessonsError } = await supabase
        .from('course_lessons')
        .select('*')
        .eq('module_id', module.id)
        .order('order_index', { ascending: true });

      if (lessonsError) throw lessonsError;

      // 3. Duplicate lessons
      if (originalLessons && originalLessons.length > 0) {
        const duplicatedLessons = originalLessons.map((lesson, idx) => ({
          id: `lesson-${newModuleId}-${idx}-${Date.now()}`,
          module_id: newModuleId,
          title: lesson.title,
          type: lesson.type,
          content: lesson.content,
          video_url: lesson.video_url,
          duration_minutes: lesson.duration_minutes,
          order_index: idx,
          is_free_preview: lesson.is_free_preview,
        }));

        const { error: dupLessonsError } = await supabase
          .from('course_lessons')
          .insert(duplicatedLessons);

        if (dupLessonsError) throw dupLessonsError;
      }

      // 4. Update local state
      setModules(prev => [...prev, {
        id: newModuleId,
        course_id: courseId,
        title: `${module.title} (Bản sao)`,
        order_index: newOrderIndex,
        lessons: [{ count: originalLessons?.length || 0 }],
      }]);

      Alert.alert('Thành công', 'Đã sao chép module và tất cả bài học');
    } catch (error) {
      console.error('[CourseBuilderScreen] duplicateModule error:', error);
      Alert.alert('Lỗi', 'Không thể sao chép module');
    }
  };

  // Render input field
  const renderInput = (label, value, setValue, options = {}) => (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.inputWrapper}>
        {options.icon && (
          <View style={styles.inputIcon}>
            {options.icon}
          </View>
        )}
        <TextInput
          style={[styles.input, options.icon && styles.inputWithIcon, options.multiline && styles.inputMultiline]}
          value={value}
          onChangeText={setValue}
          placeholder={options.placeholder || ''}
          placeholderTextColor={COLORS.textMuted}
          keyboardType={options.keyboardType || 'default'}
          multiline={options.multiline || false}
          numberOfLines={options.numberOfLines || 1}
        />
      </View>
    </View>
  );

  // Render tier selector
  const renderTierSelector = () => (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>Tier yêu cầu</Text>
      <View style={styles.tierSelector}>
        {TIERS.map(tier => (
          <TouchableOpacity
            key={tier}
            style={[
              styles.tierOption,
              tierRequired === tier && styles.tierOptionActive
            ]}
            onPress={() => setTierRequired(tier)}
          >
            <Text style={[
              styles.tierOptionText,
              tierRequired === tier && styles.tierOptionTextActive
            ]}>
              {tier}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  // Handle module reorder via drag-drop
  const handleModuleReorder = async ({ data }) => {
    // Update local state immediately
    setModules(data);

    // Update order_index in database
    try {
      const updates = data.map((module, index) => ({
        id: module.id,
        order_index: index,
      }));

      // Update each module's order_index
      for (const update of updates) {
        await supabase
          .from('course_modules')
          .update({ order_index: update.order_index })
          .eq('id', update.id);
      }
    } catch (error) {
      console.error('[CourseBuilderScreen] reorder error:', error);
      // Reload to get correct order on error
      loadCourseData();
    }
  };

  // Render single module item for DraggableFlatList
  const renderModuleItem = ({ item: module, drag, isActive }) => (
    <ScaleDecorator>
      <TouchableOpacity
        style={[styles.moduleCard, isActive && styles.moduleCardDragging]}
        onPress={() => handleEditModule(module)}
        onLongPress={drag}
        delayLongPress={150}
      >
        <View style={styles.moduleLeft}>
          <TouchableOpacity onLongPress={drag} delayLongPress={50}>
            <GripVertical size={18} color={isActive ? COLORS.gold : COLORS.textMuted} />
          </TouchableOpacity>
          <View style={styles.moduleInfo}>
            <Text style={styles.moduleTitle}>{module.title}</Text>
            <Text style={styles.moduleLessons}>
              {module.lessons?.[0]?.count || 0} bài học
            </Text>
          </View>
        </View>
        <View style={styles.moduleActions}>
          <TouchableOpacity
            style={styles.moduleActionBtn}
            onPress={() => handleDuplicateModule(module)}
          >
            <Copy size={16} color={COLORS.gold} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.moduleActionBtn}
            onPress={() => handleDeleteModule(module)}
          >
            <Trash2 size={16} color={COLORS.error} />
          </TouchableOpacity>
          <ChevronRight size={18} color={COLORS.textMuted} />
        </View>
      </TouchableOpacity>
    </ScaleDecorator>
  );

  // Render modules list with drag-drop support
  const renderModulesList = () => (
    <View style={styles.modulesSection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Modules ({modules.length})</Text>
        <TouchableOpacity style={styles.addModuleBtn} onPress={handleAddModule}>
          <Plus size={18} color="#000" />
          <Text style={styles.addModuleBtnText}>Thêm</Text>
        </TouchableOpacity>
      </View>

      {modules.length === 0 ? (
        <View style={styles.emptyModules}>
          <Layers size={40} color={COLORS.textMuted} />
          <Text style={styles.emptyModulesText}>Chưa có module nào</Text>
        </View>
      ) : (
        <View style={styles.draggableContainer}>
          <DraggableFlatList
            data={modules}
            renderItem={renderModuleItem}
            keyExtractor={(item) => item.id}
            onDragEnd={handleModuleReorder}
            scrollEnabled={false}
          />
          <Text style={styles.dragHint}>Giữ và kéo để sắp xếp lại</Text>
        </View>
      )}
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
              <Text style={styles.headerTitle}>
                {isEditMode ? 'Chỉnh sửa khóa học' : 'Tạo khóa học'}
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

            <KeyboardAvoidingView
              style={{ flex: 1 }}
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
              <ScrollView
                style={styles.content}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
              >
              {/* Basic Info */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Thông tin cơ bản</Text>

                {renderInput('Tên khóa học *', title, setTitle, {
                  placeholder: 'VD: Trading Cơ Bản cho Người Mới'
                })}

                {renderInput('Mô tả', description, setDescription, {
                  placeholder: 'Mô tả ngắn về khóa học...',
                  multiline: true,
                  numberOfLines: 4
                })}

                {/* Thumbnail Upload */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Thumbnail</Text>
                  <View style={styles.thumbnailSection}>
                    {thumbnailUrl ? (
                      <View style={styles.thumbnailPreviewContainer}>
                        <Image
                          source={{ uri: thumbnailUrl }}
                          style={styles.thumbnailPreview}
                          resizeMode="cover"
                        />
                        <TouchableOpacity
                          style={styles.thumbnailRemoveBtn}
                          onPress={() => setThumbnailUrl('')}
                        >
                          <Trash2 size={16} color="#fff" />
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <View style={styles.thumbnailPlaceholder}>
                        <ImageIcon size={32} color={COLORS.textMuted} />
                        <Text style={styles.thumbnailPlaceholderText}>Chưa có ảnh</Text>
                      </View>
                    )}
                    <View style={styles.thumbnailActions}>
                      <TouchableOpacity
                        style={[styles.thumbnailUploadBtn, uploadingThumbnail && styles.thumbnailUploadBtnDisabled]}
                        onPress={handleUploadThumbnail}
                        disabled={uploadingThumbnail}
                      >
                        {uploadingThumbnail ? (
                          <ActivityIndicator size="small" color="#000" />
                        ) : (
                          <Upload size={16} color="#000" />
                        )}
                        <Text style={styles.thumbnailUploadText}>
                          {uploadingThumbnail ? 'Đang tải...' : 'Tải ảnh lên'}
                        </Text>
                      </TouchableOpacity>
                      <Text style={styles.thumbnailHint}>hoặc</Text>
                      <TextInput
                        style={styles.thumbnailUrlInput}
                        value={thumbnailUrl}
                        onChangeText={setThumbnailUrl}
                        placeholder="Nhập URL ảnh..."
                        placeholderTextColor={COLORS.textMuted}
                      />
                    </View>
                  </View>
                </View>
              </View>

              {/* Pricing & Access */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Giá & Quyền truy cập</Text>

                {renderTierSelector()}

                {renderInput('Giá (VNĐ)', price, setPrice, {
                  placeholder: '0 = Miễn phí',
                  keyboardType: 'numeric',
                  icon: <DollarSign size={18} color={COLORS.textMuted} />
                })}

                {renderInput('Thời hạn (ngày)', membershipDuration, setMembershipDuration, {
                  placeholder: 'Để trống = Vĩnh viễn',
                  keyboardType: 'numeric',
                  icon: <Clock size={18} color={COLORS.textMuted} />
                })}

                {renderInput('Shopify Product ID', shopifyProductId, setShopifyProductId, {
                  placeholder: 'ID sản phẩm trên Shopify',
                  icon: <Link size={18} color={COLORS.textMuted} />
                })}
              </View>

              {/* Publish Status */}
              <View style={styles.section}>
                <TouchableOpacity
                  style={styles.publishToggle}
                  onPress={() => setIsPublished(!isPublished)}
                >
                  <View style={[
                    styles.publishIndicator,
                    isPublished && styles.publishIndicatorActive
                  ]} />
                  <Text style={styles.publishLabel}>
                    {isPublished ? 'Đã xuất bản' : 'Bản nháp'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Modules */}
              {isEditMode && renderModulesList()}

              {/* Bottom Spacer */}
              <View style={{ height: 100 }} />
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </LinearGradient>

      {/* Add Module Modal */}
      <Modal
        visible={showAddModuleModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAddModuleModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Thêm Module</Text>
            <TextInput
              style={styles.modalInput}
              value={newModuleName}
              onChangeText={setNewModuleName}
              placeholder="Nhập tên module..."
              placeholderTextColor={COLORS.textMuted}
              autoFocus
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShowAddModuleModal(false)}
              >
                <Text style={styles.modalCancelText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirmBtn}
                onPress={confirmAddModule}
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
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
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
    marginBottom: SPACING.md,
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
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: SPACING.md,
    zIndex: 1,
  },
  input: {
    flex: 1,
    backgroundColor: GLASS.background,
    borderWidth: 1,
    borderColor: GLASS.border,
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textPrimary,
  },
  inputWithIcon: {
    paddingLeft: SPACING.md + 26,
  },
  inputMultiline: {
    minHeight: 100,
    textAlignVertical: 'top',
  },

  // Tier Selector
  tierSelector: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  tierOption: {
    flex: 1,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    backgroundColor: GLASS.background,
    borderWidth: 1,
    borderColor: GLASS.border,
    borderRadius: 10,
    alignItems: 'center',
  },
  tierOptionActive: {
    backgroundColor: 'rgba(255, 189, 89, 0.2)',
    borderColor: COLORS.gold,
  },
  tierOptionText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  tierOptionTextActive: {
    color: COLORS.gold,
  },

  // Publish Toggle
  publishToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.sm,
  },
  publishIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.textMuted,
  },
  publishIndicatorActive: {
    backgroundColor: COLORS.success,
  },
  publishLabel: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textPrimary,
  },

  // Modules
  modulesSection: {
    marginTop: SPACING.md,
  },
  addModuleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.gold,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 8,
  },
  addModuleBtnText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semiBold,
    color: '#000',
  },
  emptyModules: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    backgroundColor: GLASS.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: GLASS.border,
    borderStyle: 'dashed',
  },
  emptyModulesText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginTop: SPACING.sm,
  },
  moduleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: GLASS.background,
    borderWidth: 1,
    borderColor: GLASS.border,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  moduleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flex: 1,
  },
  moduleInfo: {
    flex: 1,
  },
  moduleTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.textPrimary,
  },
  moduleLessons: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  moduleActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  moduleActionBtn: {
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

  // Thumbnail Styles
  thumbnailSection: {
    gap: SPACING.md,
  },
  thumbnailPreviewContainer: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: GLASS.background,
  },
  thumbnailPreview: {
    width: '100%',
    height: 180,
    borderRadius: 12,
  },
  thumbnailRemoveBtn: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnailPlaceholder: {
    height: 120,
    backgroundColor: GLASS.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: GLASS.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  thumbnailPlaceholderText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
  thumbnailActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  thumbnailUploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.gold,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 10,
  },
  thumbnailUploadBtnDisabled: {
    opacity: 0.6,
  },
  thumbnailUploadText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semiBold,
    color: '#000',
  },
  thumbnailHint: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
  thumbnailUrlInput: {
    flex: 1,
    backgroundColor: GLASS.background,
    borderWidth: 1,
    borderColor: GLASS.border,
    borderRadius: 10,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textPrimary,
  },

  // Drag-Drop Styles
  draggableContainer: {
    flex: 1,
  },
  moduleCardDragging: {
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

export default CourseBuilderScreen;
