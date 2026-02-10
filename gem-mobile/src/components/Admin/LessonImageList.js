/**
 * Gemral - Lesson Image List Component
 * Danh sach hinh anh da upload cho lesson
 * Supports: edit, delete, copy URL/HTML, reorder
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  Modal,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import {
  Trash2,
  Copy,
  Edit2,
  X,
  Check,
  Inbox,
  ExternalLink,
  ChevronUp,
  ChevronDown,
} from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';

import { useSettings } from '../../contexts/SettingsContext';
import courseImageService from '../../services/courseImageService';
import CustomAlert, { useCustomAlert } from '../CustomAlert';

const LessonImageList = ({
  images = [],
  onDelete,
  onUpdate,
  onReorder,
  loading = false,
}) => {
  const { colors, gradients, glass, settings, SPACING, TYPOGRAPHY } = useSettings();
  const { alert, AlertComponent } = useCustomAlert();

  const [editingImage, setEditingImage] = useState(null);
  const [editForm, setEditForm] = useState({
    position_id: '',
    title: '',
    caption: '',
    alt_text: '',
  });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  // ========== COPY HANDLERS ==========
  const copyUrl = useCallback(
    async (url) => {
      try {
        await Clipboard.setStringAsync(url);
        alert({
          type: 'success',
          title: 'Da sao chep',
          message: 'URL hinh anh da duoc sao chep vao clipboard',
          buttons: [{ text: 'OK' }],
        });
      } catch (error) {
        alert({
          type: 'error',
          title: 'Loi',
          message: 'Khong the sao chep URL',
          buttons: [{ text: 'OK' }],
        });
      }
    },
    [alert]
  );

  const copyHtmlTag = useCallback(
    async (image) => {
      const altText = (image.alt_text || image.title || '').replace(/"/g, '&quot;');
      const htmlTag = `<img src="${image.image_url}" alt="${altText}" data-position="${image.position_id}" />`;
      try {
        await Clipboard.setStringAsync(htmlTag);
        alert({
          type: 'success',
          title: 'Da sao chep',
          message: 'The HTML da duoc sao chep. Paste vao noi dung bai hoc.',
          buttons: [{ text: 'OK' }],
        });
      } catch (error) {
        alert({
          type: 'error',
          title: 'Loi',
          message: 'Khong the sao chep',
          buttons: [{ text: 'OK' }],
        });
      }
    },
    [alert]
  );

  // ========== DELETE HANDLER ==========
  const handleDelete = useCallback(
    (image) => {
      alert({
        type: 'warning',
        title: 'Xac nhan xoa',
        message: `Ban co chac muon xoa hinh "${image.position_id || image.file_name}"?\n\nLuu y: Neu hinh dang duoc su dung trong noi dung, can xoa thu cong trong HTML.`,
        buttons: [
          { text: 'Huy', style: 'cancel' },
          {
            text: 'Xoa',
            style: 'destructive',
            onPress: async () => {
              setDeletingId(image.id);
              try {
                await onDelete?.(image);
              } finally {
                setDeletingId(null);
              }
            },
          },
        ],
      });
    },
    [onDelete, alert]
  );

  // ========== EDIT MODAL ==========
  const openEditModal = useCallback((image) => {
    setEditingImage(image);
    setEditForm({
      position_id: image.position_id || '',
      title: image.title || '',
      caption: image.caption || '',
      alt_text: image.alt_text || '',
    });
    setFormErrors({});
  }, []);

  const closeEditModal = useCallback(() => {
    // Check if form changed
    if (editingImage) {
      const hasChanges =
        editForm.position_id !== (editingImage.position_id || '') ||
        editForm.title !== (editingImage.title || '') ||
        editForm.caption !== (editingImage.caption || '') ||
        editForm.alt_text !== (editingImage.alt_text || '');

      if (hasChanges) {
        alert({
          type: 'warning',
          title: 'Huy thay doi?',
          message: 'Ban co thay doi chua luu. Ban co chac muon huy?',
          buttons: [
            { text: 'Tiep tuc sua', style: 'cancel' },
            {
              text: 'Huy',
              style: 'destructive',
              onPress: () => setEditingImage(null),
            },
          ],
        });
        return;
      }
    }
    setEditingImage(null);
  }, [editingImage, editForm, alert]);

  const validateForm = useCallback(() => {
    const errors = {};

    // Validate position_id
    const validation = courseImageService.validatePositionId(
      editForm.position_id,
      images,
      editingImage?.id
    );

    if (!validation.valid) {
      errors.position_id = validation.error;
    }

    // Validate title length
    if (editForm.title && editForm.title.length > 200) {
      errors.title = 'Tieu de toi da 200 ky tu';
    }

    // Validate caption length
    if (editForm.caption && editForm.caption.length > 1000) {
      errors.caption = 'Mo ta toi da 1000 ky tu';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [editForm, images, editingImage]);

  const saveEdit = useCallback(async () => {
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    try {
      await onUpdate?.(editingImage.id, editForm);
      setEditingImage(null);
      alert({
        type: 'success',
        title: 'Thanh cong',
        message: 'Da cap nhat thong tin hinh anh',
        buttons: [{ text: 'OK' }],
      });
    } catch (error) {
      alert({
        type: 'error',
        title: 'Loi',
        message: error.message || 'Khong the luu thay doi',
        buttons: [{ text: 'OK' }],
      });
    } finally {
      setSaving(false);
    }
  }, [editingImage, editForm, onUpdate, validateForm, alert]);

  // ========== REORDER HANDLERS ==========
  const moveUp = useCallback(
    (index) => {
      if (index <= 0) return;
      const newImages = [...images];
      [newImages[index - 1], newImages[index]] = [newImages[index], newImages[index - 1]];
      onReorder?.(newImages);
    },
    [images, onReorder]
  );

  const moveDown = useCallback(
    (index) => {
      if (index >= images.length - 1) return;
      const newImages = [...images];
      [newImages[index], newImages[index + 1]] = [newImages[index + 1], newImages[index]];
      onReorder?.(newImages);
    },
    [images, onReorder]
  );

  const styles = useMemo(() => StyleSheet.create({
    container: {
      marginTop: SPACING.lg,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: SPACING.md,
    },
    sectionTitle: {
      color: colors.textPrimary,
      fontSize: TYPOGRAPHY.fontSize.md,
      fontWeight: TYPOGRAPHY.fontWeight.semiBold,
    },
    headerHint: {
      color: colors.textMuted,
      fontSize: TYPOGRAPHY.fontSize.sm,
    },
    loadingContainer: {
      alignItems: 'center',
      padding: SPACING.xl,
    },
    loadingText: {
      color: colors.textSecondary,
      marginTop: SPACING.sm,
    },
    imageCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: settings.theme === 'light' ? colors.bgDarkest : (glass.background || 'rgba(15, 16, 48, 0.95)'),
      borderRadius: 10,
      padding: SPACING.sm,
      marginBottom: SPACING.sm,
      borderWidth: 1,
      borderColor: glass.border,
    },
    imageCardDeleting: {
      opacity: 0.5,
    },
    sortButtons: {
      marginRight: SPACING.xs,
    },
    sortBtn: {
      padding: 4,
    },
    sortBtnDisabled: {
      opacity: 0.3,
    },
    thumbnail: {
      width: 56,
      height: 56,
      borderRadius: 8,
      backgroundColor: '#000',
    },
    info: {
      flex: 1,
      marginLeft: SPACING.sm,
      marginRight: SPACING.xs,
    },
    positionId: {
      color: colors.gold,
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: TYPOGRAPHY.fontWeight.semiBold,
    },
    title: {
      color: colors.textSecondary,
      fontSize: TYPOGRAPHY.fontSize.sm,
      marginTop: 2,
    },
    dimensions: {
      color: colors.textMuted,
      fontSize: TYPOGRAPHY.fontSize.xs,
      marginTop: 2,
    },
    actions: {
      flexDirection: 'row',
      gap: 4,
    },
    actionBtn: {
      padding: SPACING.sm,
      borderRadius: 6,
      backgroundColor: settings.theme === 'light' ? colors.bgDarkest : (glass.background || 'rgba(15, 16, 48, 0.95)'),
    },
    emptyContainer: {
      alignItems: 'center',
      padding: SPACING.xl,
    },
    emptyList: {
      flexGrow: 1,
    },
    emptyText: {
      color: colors.textSecondary,
      fontSize: TYPOGRAPHY.fontSize.md,
      marginTop: SPACING.sm,
    },
    emptyHint: {
      color: colors.textMuted,
      fontSize: TYPOGRAPHY.fontSize.sm,
      marginTop: SPACING.xs,
    },
    // Modal styles
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.8)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: settings.theme === 'light' ? colors.bgDarkest : (gradients.background?.[0] || 'rgba(15, 16, 48, 0.95)'),
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      padding: SPACING.lg,
      maxHeight: '90%',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: SPACING.md,
    },
    modalTitle: {
      color: colors.textPrimary,
      fontSize: TYPOGRAPHY.fontSize.lg,
      fontWeight: TYPOGRAPHY.fontWeight.semiBold,
    },
    modalCloseBtn: {
      padding: SPACING.xs,
    },
    modalPreview: {
      width: '100%',
      height: 120,
      borderRadius: 8,
      backgroundColor: '#000',
      marginBottom: SPACING.md,
    },
    formGroup: {
      marginBottom: SPACING.md,
    },
    label: {
      color: colors.textSecondary,
      fontSize: TYPOGRAPHY.fontSize.sm,
      marginBottom: SPACING.xs,
      fontWeight: TYPOGRAPHY.fontWeight.medium,
    },
    required: {
      color: colors.error,
    },
    input: {
      backgroundColor: settings.theme === 'light' ? colors.bgDarkest : (glass.background || 'rgba(15, 16, 48, 0.95)'),
      borderWidth: 1,
      borderColor: glass.border,
      borderRadius: 8,
      padding: SPACING.md,
      color: colors.textPrimary,
      fontSize: TYPOGRAPHY.fontSize.md,
    },
    inputError: {
      borderColor: colors.error,
    },
    textArea: {
      minHeight: 80,
      textAlignVertical: 'top',
    },
    inputHint: {
      color: colors.textMuted,
      fontSize: TYPOGRAPHY.fontSize.xs,
      marginTop: SPACING.xs,
    },
    errorText: {
      color: colors.error,
      fontSize: TYPOGRAPHY.fontSize.xs,
      marginTop: SPACING.xs,
    },
    saveBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.gold,
      padding: SPACING.md,
      borderRadius: 10,
      marginTop: SPACING.sm,
      gap: SPACING.sm,
    },
    saveBtnDisabled: {
      opacity: 0.7,
    },
    saveBtnText: {
      color: '#000',
      fontSize: TYPOGRAPHY.fontSize.md,
      fontWeight: TYPOGRAPHY.fontWeight.semiBold,
    },
  }), [colors, settings.theme, glass, gradients, SPACING, TYPOGRAPHY]);

  // ========== RENDER ITEM ==========
  const renderItem = useCallback(
    ({ item, index }) => {
      const isDeleting = deletingId === item.id;

      return (
        <View style={[styles.imageCard, isDeleting && styles.imageCardDeleting]}>
          {/* Sort Buttons */}
          <View style={styles.sortButtons}>
            <TouchableOpacity
              style={[styles.sortBtn, index === 0 && styles.sortBtnDisabled]}
              onPress={() => moveUp(index)}
              disabled={index === 0}
            >
              <ChevronUp
                size={16}
                color={index === 0 ? colors.textMuted : colors.textPrimary}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.sortBtn,
                index === images.length - 1 && styles.sortBtnDisabled,
              ]}
              onPress={() => moveDown(index)}
              disabled={index === images.length - 1}
            >
              <ChevronDown
                size={16}
                color={
                  index === images.length - 1 ? colors.textMuted : colors.textPrimary
                }
              />
            </TouchableOpacity>
          </View>

          {/* Thumbnail */}
          <Image
            source={{ uri: item.image_url }}
            style={styles.thumbnail}
            resizeMode="cover"
          />

          {/* Info */}
          <View style={styles.info}>
            <Text style={styles.positionId} numberOfLines={1}>
              {item.position_id || `image-${index + 1}`}
            </Text>
            <Text style={styles.title} numberOfLines={1}>
              {item.title || item.file_name || 'Chua dat ten'}
            </Text>
            {item.width && item.height && (
              <Text style={styles.dimensions}>
                {item.width} x {item.height}
              </Text>
            )}
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            {/* Copy URL */}
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => copyUrl(item.image_url)}
            >
              <Copy size={16} color="#3B82F6" />
            </TouchableOpacity>

            {/* Copy HTML */}
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => copyHtmlTag(item)}
            >
              <ExternalLink size={16} color="#00F0FF" />
            </TouchableOpacity>

            {/* Edit */}
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => openEditModal(item)}
            >
              <Edit2 size={16} color={colors.gold} />
            </TouchableOpacity>

            {/* Delete */}
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => handleDelete(item)}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <ActivityIndicator size="small" color={colors.error} />
              ) : (
                <Trash2 size={16} color={colors.error} />
              )}
            </TouchableOpacity>
          </View>
        </View>
      );
    },
    [images, deletingId, copyUrl, copyHtmlTag, openEditModal, handleDelete, moveUp, moveDown, styles, colors]
  );

  // ========== EMPTY STATE ==========
  const renderEmpty = useMemo(
    () => (
      <View style={styles.emptyContainer}>
        <Inbox size={48} color={colors.textMuted} />
        <Text style={styles.emptyText}>Chua co hinh anh nao</Text>
        <Text style={styles.emptyHint}>Upload hinh anh o tren de bat dau</Text>
      </View>
    ),
    [styles, colors]
  );

  // ========== LOADING STATE ==========
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.gold} />
        <Text style={styles.loadingText}>Dang tai hinh anh...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>
          Hinh anh da tai len ({images.length})
        </Text>
        {images.length > 1 && (
          <Text style={styles.headerHint}>Dung arrows de sap xep</Text>
        )}
      </View>

      {/* List */}
      <FlatList
        data={images}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={renderEmpty}
        scrollEnabled={false}
        contentContainerStyle={images.length === 0 ? styles.emptyList : null}
      />

      {/* Edit Modal */}
      <Modal
        visible={!!editingImage}
        animationType="slide"
        transparent={true}
        onRequestClose={closeEditModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chinh sua hinh anh</Text>
              <TouchableOpacity style={styles.modalCloseBtn} onPress={closeEditModal}>
                <X size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            {/* Preview */}
            {editingImage && (
              <Image
                source={{ uri: editingImage.image_url }}
                style={styles.modalPreview}
                resizeMode="contain"
              />
            )}

            {/* Form */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>
                Position ID <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, formErrors.position_id && styles.inputError]}
                value={editForm.position_id}
                onChangeText={(t) => {
                  setEditForm((prev) => ({ ...prev, position_id: t }));
                  if (formErrors.position_id) {
                    setFormErrors((prev) => ({ ...prev, position_id: null }));
                  }
                }}
                placeholder="diagram-1, chart-btc, hero-image..."
                placeholderTextColor={colors.textMuted}
                autoCapitalize="none"
                autoCorrect={false}
              />
              {formErrors.position_id ? (
                <Text style={styles.errorText}>{formErrors.position_id}</Text>
              ) : (
                <Text style={styles.inputHint}>
                  ID duy nhat de tham chieu trong HTML. Chi dung chu, so, dau - va _
                </Text>
              )}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Tieu de</Text>
              <TextInput
                style={[styles.input, formErrors.title && styles.inputError]}
                value={editForm.title}
                onChangeText={(t) => setEditForm((prev) => ({ ...prev, title: t }))}
                placeholder="Tieu de hien thi khi hover"
                placeholderTextColor={colors.textMuted}
                maxLength={200}
              />
              {formErrors.title && (
                <Text style={styles.errorText}>{formErrors.title}</Text>
              )}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Mo ta (Caption)</Text>
              <TextInput
                style={[
                  styles.input,
                  styles.textArea,
                  formErrors.caption && styles.inputError,
                ]}
                value={editForm.caption}
                onChangeText={(t) => setEditForm((prev) => ({ ...prev, caption: t }))}
                placeholder="Mo ta hien thi duoi hinh anh"
                placeholderTextColor={colors.textMuted}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                maxLength={1000}
              />
              {formErrors.caption && (
                <Text style={styles.errorText}>{formErrors.caption}</Text>
              )}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Alt Text (Accessibility)</Text>
              <TextInput
                style={styles.input}
                value={editForm.alt_text}
                onChangeText={(t) => setEditForm((prev) => ({ ...prev, alt_text: t }))}
                placeholder="Mo ta cho nguoi khiem thi va SEO"
                placeholderTextColor={colors.textMuted}
                maxLength={300}
              />
              <Text style={styles.inputHint}>
                Mo ta noi dung hinh cho nguoi su dung screen reader
              </Text>
            </View>

            {/* Save Button */}
            <TouchableOpacity
              style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
              onPress={saveEdit}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#000" />
              ) : (
                <Check size={18} color="#000" />
              )}
              <Text style={styles.saveBtnText}>
                {saving ? 'Dang luu...' : 'Luu thay doi'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {AlertComponent}
    </View>
  );
};

export default LessonImageList;
