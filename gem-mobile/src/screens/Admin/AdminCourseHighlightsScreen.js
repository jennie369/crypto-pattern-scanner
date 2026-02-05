/**
 * GEM Mobile - Admin Course Highlights Screen
 * Manage the featured/highlighted course section
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Modal,
  TextInput,
  Switch,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import {
  ArrowLeft,
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  X,
  Sparkles,
  ChevronDown,
  Check,
  Search,
  Image as ImageIcon,
  Award,
  Camera,
  Upload,
} from 'lucide-react-native';

import { COLORS, GRADIENTS, SPACING, TYPOGRAPHY, BORDER_RADIUS, GLASS } from '../../utils/tokens';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabase';
import CustomAlert from '../../components/CustomAlert';
import imageService from '../../services/imageService';

const BADGE_COLORS = [
  { label: 'Vàng', value: 'gold' },
  { label: 'Tím', value: 'purple' },
  { label: 'Xanh dương', value: 'cyan' },
  { label: 'Xanh lá', value: 'green' },
  { label: 'Đỏ', value: 'red' },
];

export default function AdminCourseHighlightsScreen({ navigation }) {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [highlights, setHighlights] = useState([]);
  const [courses, setCourses] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingHighlight, setEditingHighlight] = useState(null);
  const [saving, setSaving] = useState(false);
  const [coursePickerVisible, setCoursePickerVisible] = useState(false);
  const [courseSearch, setCourseSearch] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  // Alert state
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    buttons: [{ text: 'OK' }],
    type: 'default',
  });

  const showAlert = (title, message, buttons = [{ text: 'OK' }], type = 'default') => {
    setAlertConfig({ visible: true, title, message, buttons, type });
  };

  const closeAlert = () => {
    setAlertConfig((prev) => ({ ...prev, visible: false }));
  };

  // Form state
  const [form, setForm] = useState({
    course_id: '',
    custom_title: '',
    custom_subtitle: '',
    custom_description: '',
    custom_image_url: '',
    badge_text: 'Nổi bật',
    badge_color: 'gold',
    cta_text: 'Xem chi tiết',
    is_active: true,
    display_order: 0,
    show_price: true,
    show_students: true,
    show_rating: true,
    show_lessons: true,
  });

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load highlights
      const { data: highlightsData, error: highlightsError } = await supabase
        .from('course_highlights')
        .select(`
          *,
          courses (
            id,
            title,
            thumbnail_url,
            price
          )
        `)
        .order('display_order');

      if (highlightsError) throw highlightsError;
      setHighlights(highlightsData || []);

      // Load all courses for picker
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('id, title, thumbnail_url, price, is_published')
        .eq('is_published', true)
        .order('title');

      if (coursesError) throw coursesError;
      setCourses(coursesData || []);

    } catch (err) {
      console.error('[AdminCourseHighlights] Load error:', err);
      showAlert('Lỗi', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  // Open modal for new or edit
  const openModal = (highlight = null) => {
    if (highlight) {
      setEditingHighlight(highlight);
      setForm({
        course_id: highlight.course_id || '',
        custom_title: highlight.custom_title || '',
        custom_subtitle: highlight.custom_subtitle || '',
        custom_description: highlight.custom_description || '',
        custom_image_url: highlight.custom_image_url || '',
        badge_text: highlight.badge_text || 'Nổi bật',
        badge_color: highlight.badge_color || 'gold',
        cta_text: highlight.cta_text || 'Xem chi tiết',
        is_active: highlight.is_active ?? true,
        display_order: highlight.display_order || 0,
        show_price: highlight.show_price ?? true,
        show_students: highlight.show_students ?? true,
        show_rating: highlight.show_rating ?? true,
        show_lessons: highlight.show_lessons ?? true,
      });
    } else {
      setEditingHighlight(null);
      setForm({
        course_id: '',
        custom_title: '',
        custom_subtitle: '',
        custom_description: '',
        custom_image_url: '',
        badge_text: 'Nổi bật',
        badge_color: 'gold',
        cta_text: 'Xem chi tiết',
        is_active: true,
        display_order: 0,
        show_price: true,
        show_students: true,
        show_rating: true,
        show_lessons: true,
      });
    }
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingHighlight(null);
  };

  // Save highlight
  const handleSave = async () => {
    if (!form.course_id) {
      showAlert('Lỗi', 'Vui lòng chọn khóa học');
      return;
    }

    try {
      setSaving(true);

      const payload = {
        course_id: form.course_id,
        custom_title: form.custom_title || null,
        custom_subtitle: form.custom_subtitle || null,
        custom_description: form.custom_description || null,
        custom_image_url: form.custom_image_url || null,
        badge_text: form.badge_text,
        badge_color: form.badge_color,
        cta_text: form.cta_text,
        is_active: form.is_active,
        display_order: form.display_order,
        show_price: form.show_price,
        show_students: form.show_students,
        show_rating: form.show_rating,
        show_lessons: form.show_lessons,
        created_by: user?.id,
      };

      if (editingHighlight) {
        // Update
        const { error } = await supabase
          .from('course_highlights')
          .update(payload)
          .eq('id', editingHighlight.id);

        if (error) throw error;
        showAlert('Thành công', 'Đã cập nhật khóa học nổi bật');
      } else {
        // Insert
        const { error } = await supabase
          .from('course_highlights')
          .insert(payload);

        if (error) throw error;
        showAlert('Thành công', 'Đã thêm khóa học nổi bật');
      }

      closeModal();
      loadData();
    } catch (err) {
      console.error('[AdminCourseHighlights] Save error:', err);
      showAlert('Lỗi', err.message);
    } finally {
      setSaving(false);
    }
  };

  // Delete highlight
  const handleDelete = (highlight) => {
    showAlert(
      'Xác nhận xóa',
      `Bạn có chắc muốn xóa "${highlight.courses?.title || 'khóa học này'}" khỏi danh sách nổi bật?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('course_highlights')
                .delete()
                .eq('id', highlight.id);

              if (error) throw error;
              showAlert('Thành công', 'Đã xóa khóa học nổi bật');
              loadData();
            } catch (err) {
              showAlert('Lỗi', err.message);
            }
          },
        },
      ],
      'warning'
    );
  };

  // Toggle active status
  const handleToggleActive = async (highlight) => {
    try {
      const { error } = await supabase
        .from('course_highlights')
        .update({ is_active: !highlight.is_active })
        .eq('id', highlight.id);

      if (error) throw error;
      loadData();
    } catch (err) {
      showAlert('Lỗi', err.message);
    }
  };

  // Get selected course info
  const getSelectedCourse = () => {
    return courses.find(c => c.id === form.course_id);
  };

  // Pick image from library
  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        showAlert('Cần quyền truy cập', 'Vui lòng cho phép truy cập thư viện ảnh trong Cài đặt');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.[0]) {
        await uploadImage(result.assets[0].uri);
      }
    } catch (err) {
      console.error('[AdminCourseHighlights] Pick image error:', err);
      showAlert('Lỗi', 'Không thể chọn hình ảnh');
    }
  };

  // Take photo with camera
  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        showAlert('Cần quyền camera', 'Vui lòng cho phép truy cập camera trong Cài đặt');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.[0]) {
        await uploadImage(result.assets[0].uri);
      }
    } catch (err) {
      console.error('[AdminCourseHighlights] Camera error:', err);
      showAlert('Lỗi', 'Không thể chụp ảnh');
    }
  };

  // Upload image to Supabase Storage
  const uploadImage = async (uri) => {
    try {
      setUploadingImage(true);

      const timestamp = Date.now();
      const fileName = `highlights/highlight_${timestamp}.jpg`;

      // Upload using imageService
      const publicUrl = await imageService.uploadToStorage(uri, fileName);

      // Update form with the new URL
      setForm(prev => ({ ...prev, custom_image_url: publicUrl }));
      showAlert('Thành công', 'Đã tải lên hình ảnh');
    } catch (err) {
      console.error('[AdminCourseHighlights] Upload error:', err);
      showAlert('Lỗi', 'Không thể tải lên hình ảnh: ' + err.message);
    } finally {
      setUploadingImage(false);
    }
  };

  // Clear custom image
  const clearCustomImage = () => {
    setForm(prev => ({ ...prev, custom_image_url: '' }));
  };

  // Filter courses by search
  const filteredCourses = courses.filter(c =>
    c.title.toLowerCase().includes(courseSearch.toLowerCase())
  );

  // Render highlight card
  const renderHighlightCard = (highlight) => {
    const course = highlight.courses;

    return (
      <View key={highlight.id} style={styles.card}>
        {/* Image */}
        <Image
          source={{ uri: highlight.custom_image_url || course?.thumbnail_url }}
          style={styles.cardImage}
        />

        {/* Content */}
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <View style={[
              styles.badge,
              { backgroundColor: COLORS[highlight.badge_color] || COLORS.gold }
            ]}>
              <Text style={styles.badgeText}>{highlight.badge_text}</Text>
            </View>
            <View style={[
              styles.statusBadge,
              highlight.is_active ? styles.statusActive : styles.statusInactive
            ]}>
              {highlight.is_active ? (
                <Eye size={12} color={COLORS.success} />
              ) : (
                <EyeOff size={12} color={COLORS.textMuted} />
              )}
            </View>
          </View>

          <Text style={styles.cardTitle} numberOfLines={2}>
            {highlight.custom_title || course?.title || 'N/A'}
          </Text>

          {highlight.custom_subtitle && (
            <Text style={styles.cardSubtitle} numberOfLines={2}>
              {highlight.custom_subtitle}
            </Text>
          )}

          {/* Actions */}
          <View style={styles.cardActions}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.editBtn]}
              onPress={() => openModal(highlight)}
            >
              <Edit2 size={16} color={COLORS.gold} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, styles.toggleBtn]}
              onPress={() => handleToggleActive(highlight)}
            >
              {highlight.is_active ? (
                <EyeOff size={16} color={COLORS.textMuted} />
              ) : (
                <Eye size={16} color={COLORS.success} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, styles.deleteBtn]}
              onPress={() => handleDelete(highlight)}
            >
              <Trash2 size={16} color={COLORS.error} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  // Render course picker modal
  const renderCoursePicker = () => (
    <Modal
      visible={coursePickerVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setCoursePickerVisible(false)}
    >
      <View style={styles.pickerOverlay}>
        <View style={styles.pickerContainer}>
          <View style={styles.pickerHeader}>
            <Text style={styles.pickerTitle}>Chọn khóa học</Text>
            <TouchableOpacity onPress={() => setCoursePickerVisible(false)}>
              <X size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Search */}
          <View style={styles.searchBox}>
            <Search size={18} color={COLORS.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm khóa học..."
              placeholderTextColor={COLORS.textMuted}
              value={courseSearch}
              onChangeText={setCourseSearch}
            />
          </View>

          {/* Course list */}
          <ScrollView style={styles.pickerList}>
            {filteredCourses.map((course) => (
              <TouchableOpacity
                key={course.id}
                style={[
                  styles.pickerItem,
                  form.course_id === course.id && styles.pickerItemSelected
                ]}
                onPress={() => {
                  setForm(prev => ({ ...prev, course_id: course.id }));
                  setCoursePickerVisible(false);
                }}
              >
                <Image
                  source={{ uri: course.thumbnail_url }}
                  style={styles.pickerItemImage}
                />
                <View style={styles.pickerItemContent}>
                  <Text style={styles.pickerItemTitle} numberOfLines={2}>
                    {course.title}
                  </Text>
                  <Text style={styles.pickerItemPrice}>
                    {!course.price || course.price === 0 ? 'Miễn phí' : `${course.price?.toLocaleString()}đ`}
                  </Text>
                </View>
                {form.course_id === course.id && (
                  <Check size={20} color={COLORS.gold} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <LinearGradient
      colors={GRADIENTS.background}
      locations={GRADIENTS.backgroundLocations}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <ArrowLeft size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Khóa học nổi bật</Text>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => openModal()}
          >
            <Plus size={24} color={COLORS.gold} />
          </TouchableOpacity>
        </View>

        {/* Content */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.gold} />
          </View>
        ) : (
          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.contentContainer}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor={COLORS.gold}
              />
            }
          >
            {/* Info banner */}
            <View style={styles.infoBanner}>
              <Sparkles size={20} color={COLORS.gold} />
              <Text style={styles.infoText}>
                Khóa học nổi bật sẽ được hiển thị ở vị trí đặc biệt trong trang khóa học
              </Text>
            </View>

            {/* Highlights list */}
            {highlights.length === 0 ? (
              <View style={styles.emptyState}>
                <Award size={48} color={COLORS.textMuted} />
                <Text style={styles.emptyTitle}>Chưa có khóa học nổi bật</Text>
                <Text style={styles.emptySubtitle}>
                  Thêm khóa học để hiển thị ở vị trí nổi bật
                </Text>
                <TouchableOpacity
                  style={styles.emptyBtn}
                  onPress={() => openModal()}
                >
                  <Plus size={18} color={COLORS.bgDarkest} />
                  <Text style={styles.emptyBtnText}>Thêm khóa học</Text>
                </TouchableOpacity>
              </View>
            ) : (
              highlights.map(renderHighlightCard)
            )}
          </ScrollView>
        )}

        {/* Edit Modal */}
        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={closeModal}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalOverlay}
          >
            <View style={styles.modalContainer}>
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {editingHighlight ? 'Chỉnh sửa' : 'Thêm khóa học nổi bật'}
                </Text>
                <TouchableOpacity onPress={closeModal}>
                  <X size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
              </View>

              {/* Modal Content */}
              <ScrollView style={styles.modalContent}>
                {/* Course Picker */}
                <Text style={styles.label}>Khóa học *</Text>
                <TouchableOpacity
                  style={styles.pickerBtn}
                  onPress={() => setCoursePickerVisible(true)}
                >
                  {getSelectedCourse() ? (
                    <View style={styles.selectedCourse}>
                      <Image
                        source={{ uri: getSelectedCourse()?.thumbnail_url }}
                        style={styles.selectedImage}
                      />
                      <Text style={styles.selectedTitle} numberOfLines={1}>
                        {getSelectedCourse()?.title}
                      </Text>
                    </View>
                  ) : (
                    <Text style={styles.pickerPlaceholder}>Chọn khóa học...</Text>
                  )}
                  <ChevronDown size={20} color={COLORS.textMuted} />
                </TouchableOpacity>

                {/* Custom Title */}
                <Text style={styles.label}>Tiêu đề tùy chỉnh</Text>
                <TextInput
                  style={styles.input}
                  value={form.custom_title}
                  onChangeText={(v) => setForm(prev => ({ ...prev, custom_title: v }))}
                  placeholder="Để trống để dùng tiêu đề gốc"
                  placeholderTextColor={COLORS.textMuted}
                />

                {/* Custom Subtitle */}
                <Text style={styles.label}>Phụ đề tùy chỉnh</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={form.custom_subtitle}
                  onChangeText={(v) => setForm(prev => ({ ...prev, custom_subtitle: v }))}
                  placeholder="Mô tả ngắn gọn..."
                  placeholderTextColor={COLORS.textMuted}
                  multiline
                  numberOfLines={3}
                />

                {/* Custom Image */}
                <Text style={styles.label}>Hình ảnh banner tùy chỉnh</Text>
                {form.custom_image_url ? (
                  <View style={styles.imagePreviewContainer}>
                    <Image
                      source={{ uri: form.custom_image_url }}
                      style={styles.imagePreview}
                    />
                    <TouchableOpacity
                      style={styles.clearImageBtn}
                      onPress={clearCustomImage}
                    >
                      <X size={16} color={COLORS.textPrimary} />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.imagePickerContainer}>
                    {uploadingImage ? (
                      <View style={styles.uploadingContainer}>
                        <ActivityIndicator size="large" color={COLORS.gold} />
                        <Text style={styles.uploadingText}>Đang tải lên...</Text>
                      </View>
                    ) : (
                      <>
                        <View style={styles.imagePickerButtons}>
                          <TouchableOpacity
                            style={styles.imagePickerBtn}
                            onPress={pickImage}
                          >
                            <View style={[styles.imageIconCircle, { backgroundColor: 'rgba(59, 130, 246, 0.2)' }]}>
                              <ImageIcon size={24} color="#3B82F6" />
                            </View>
                            <Text style={styles.imagePickerBtnText}>Thư viện</Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={styles.imagePickerBtn}
                            onPress={takePhoto}
                          >
                            <View style={[styles.imageIconCircle, { backgroundColor: 'rgba(106, 91, 255, 0.2)' }]}>
                              <Camera size={24} color="#6A5BFF" />
                            </View>
                            <Text style={styles.imagePickerBtnText}>Chụp ảnh</Text>
                          </TouchableOpacity>
                        </View>
                        <Text style={styles.imagePickerHint}>
                          Để trống để dùng hình gốc của khóa học
                        </Text>
                      </>
                    )}
                  </View>
                )}

                {/* Badge Text */}
                <Text style={styles.label}>Nhãn badge</Text>
                <TextInput
                  style={styles.input}
                  value={form.badge_text}
                  onChangeText={(v) => setForm(prev => ({ ...prev, badge_text: v }))}
                  placeholder="VD: Nổi bật, Hot, Bestseller"
                  placeholderTextColor={COLORS.textMuted}
                />

                {/* Badge Color */}
                <Text style={styles.label}>Màu badge</Text>
                <View style={styles.colorPicker}>
                  {BADGE_COLORS.map((color) => (
                    <TouchableOpacity
                      key={color.value}
                      style={[
                        styles.colorOption,
                        { backgroundColor: COLORS[color.value] || COLORS.gold },
                        form.badge_color === color.value && styles.colorOptionSelected
                      ]}
                      onPress={() => setForm(prev => ({ ...prev, badge_color: color.value }))}
                    >
                      {form.badge_color === color.value && (
                        <Check size={14} color={COLORS.bgDarkest} />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>

                {/* CTA Text */}
                <Text style={styles.label}>Nút CTA</Text>
                <TextInput
                  style={styles.input}
                  value={form.cta_text}
                  onChangeText={(v) => setForm(prev => ({ ...prev, cta_text: v }))}
                  placeholder="VD: Xem chi tiết"
                  placeholderTextColor={COLORS.textMuted}
                />

                {/* Display Order */}
                <Text style={styles.label}>Thứ tự hiển thị</Text>
                <TextInput
                  style={styles.input}
                  value={String(form.display_order)}
                  onChangeText={(v) => setForm(prev => ({ ...prev, display_order: parseInt(v) || 0 }))}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={COLORS.textMuted}
                />

                {/* Toggle Options */}
                <View style={styles.toggleSection}>
                  <View style={styles.toggleRow}>
                    <Text style={styles.toggleLabel}>Kích hoạt</Text>
                    <Switch
                      value={form.is_active}
                      onValueChange={(v) => setForm(prev => ({ ...prev, is_active: v }))}
                      trackColor={{ false: COLORS.bgDarkest, true: COLORS.gold }}
                      thumbColor={form.is_active ? COLORS.textPrimary : COLORS.textMuted}
                    />
                  </View>

                  <View style={styles.toggleRow}>
                    <Text style={styles.toggleLabel}>Hiện giá</Text>
                    <Switch
                      value={form.show_price}
                      onValueChange={(v) => setForm(prev => ({ ...prev, show_price: v }))}
                      trackColor={{ false: COLORS.bgDarkest, true: COLORS.gold }}
                      thumbColor={form.show_price ? COLORS.textPrimary : COLORS.textMuted}
                    />
                  </View>

                  <View style={styles.toggleRow}>
                    <Text style={styles.toggleLabel}>Hiện số học viên</Text>
                    <Switch
                      value={form.show_students}
                      onValueChange={(v) => setForm(prev => ({ ...prev, show_students: v }))}
                      trackColor={{ false: COLORS.bgDarkest, true: COLORS.gold }}
                      thumbColor={form.show_students ? COLORS.textPrimary : COLORS.textMuted}
                    />
                  </View>

                  <View style={styles.toggleRow}>
                    <Text style={styles.toggleLabel}>Hiện đánh giá</Text>
                    <Switch
                      value={form.show_rating}
                      onValueChange={(v) => setForm(prev => ({ ...prev, show_rating: v }))}
                      trackColor={{ false: COLORS.bgDarkest, true: COLORS.gold }}
                      thumbColor={form.show_rating ? COLORS.textPrimary : COLORS.textMuted}
                    />
                  </View>

                  <View style={styles.toggleRow}>
                    <Text style={styles.toggleLabel}>Hiện số bài học</Text>
                    <Switch
                      value={form.show_lessons}
                      onValueChange={(v) => setForm(prev => ({ ...prev, show_lessons: v }))}
                      trackColor={{ false: COLORS.bgDarkest, true: COLORS.gold }}
                      thumbColor={form.show_lessons ? COLORS.textPrimary : COLORS.textMuted}
                    />
                  </View>
                </View>
              </ScrollView>

              {/* Modal Footer */}
              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={closeModal}
                >
                  <Text style={styles.cancelBtnText}>Hủy</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
                  onPress={handleSave}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator size="small" color={COLORS.bgDarkest} />
                  ) : (
                    <Text style={styles.saveBtnText}>Lưu</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>

        {/* Course Picker Modal */}
        {renderCoursePicker()}

        {/* Custom Alert */}
        <CustomAlert
          visible={alertConfig.visible}
          title={alertConfig.title}
          message={alertConfig.message}
          buttons={alertConfig.buttons}
          type={alertConfig.type}
          onClose={closeAlert}
        />
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
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

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
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
    color: COLORS.gold,
  },
  addBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Content
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: SPACING.lg,
    paddingBottom: 100,
  },

  // Info Banner
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 189, 89, 0.1)',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  infoText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gold,
  },

  // Card
  card: {
    flexDirection: 'row',
    backgroundColor: GLASS.background,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  cardImage: {
    width: 100,
    height: 120,
    backgroundColor: COLORS.bgDarkest,
  },
  cardContent: {
    flex: 1,
    padding: SPACING.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  badge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.full,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.bgDarkest,
  },
  statusBadge: {
    padding: 4,
    borderRadius: BORDER_RADIUS.full,
  },
  statusActive: {
    backgroundColor: 'rgba(58, 247, 166, 0.2)',
  },
  statusInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  cardTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xxs,
  },
  cardSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
  cardActions: {
    flexDirection: 'row',
    marginTop: SPACING.sm,
    gap: SPACING.sm,
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editBtn: {
    backgroundColor: 'rgba(255, 189, 89, 0.2)',
  },
  toggleBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  deleteBtn: {
    backgroundColor: 'rgba(255, 99, 71, 0.2)',
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.huge,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
  },
  emptySubtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  emptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gold,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    marginTop: SPACING.lg,
    gap: SPACING.xs,
  },
  emptyBtnText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.bgDarkest,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: COLORS.bgDarkest,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  modalContent: {
    padding: SPACING.lg,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: SPACING.lg,
    gap: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },

  // Form
  label: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
    marginTop: SPACING.md,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },

  // Picker Button
  pickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  pickerPlaceholder: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
  },
  selectedCourse: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: SPACING.sm,
  },
  selectedImage: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.sm,
  },
  selectedTitle: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textPrimary,
  },

  // Color Picker
  colorPicker: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorOptionSelected: {
    borderWidth: 2,
    borderColor: COLORS.textPrimary,
  },

  // Toggle Section
  toggleSection: {
    marginTop: SPACING.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  toggleLabel: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textPrimary,
  },

  // Buttons
  cancelBtn: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  cancelBtnText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.textSecondary,
  },
  saveBtn: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    backgroundColor: COLORS.gold,
  },
  saveBtnDisabled: {
    opacity: 0.5,
  },
  saveBtnText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.bgDarkest,
  },

  // Course Picker Modal
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  pickerContainer: {
    backgroundColor: COLORS.bgDarkest,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    maxHeight: '80%',
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  pickerTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    margin: SPACING.lg,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textPrimary,
  },
  pickerList: {
    maxHeight: 400,
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  pickerItemSelected: {
    backgroundColor: 'rgba(255, 189, 89, 0.15)',
    borderWidth: 1,
    borderColor: COLORS.gold,
  },
  pickerItemImage: {
    width: 50,
    height: 50,
    borderRadius: BORDER_RADIUS.sm,
    marginRight: SPACING.md,
  },
  pickerItemContent: {
    flex: 1,
  },
  pickerItemTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.textPrimary,
  },
  pickerItemPrice: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gold,
    marginTop: 2,
  },

  // Image Picker
  imagePreviewContainer: {
    position: 'relative',
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
  },
  imagePreview: {
    width: '100%',
    height: 180,
    borderRadius: BORDER_RADIUS.md,
    resizeMode: 'cover',
    backgroundColor: COLORS.bgDarkest,
  },
  clearImageBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePickerContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderStyle: 'dashed',
    padding: SPACING.lg,
    alignItems: 'center',
  },
  uploadingContainer: {
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
  },
  uploadingText: {
    color: COLORS.gold,
    fontSize: TYPOGRAPHY.fontSize.md,
  },
  imagePickerButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.xl,
    marginBottom: SPACING.sm,
  },
  imagePickerBtn: {
    alignItems: 'center',
    minWidth: 80,
  },
  imageIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
  },
  imagePickerBtnText: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  imagePickerHint: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.fontSize.xs,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
});
