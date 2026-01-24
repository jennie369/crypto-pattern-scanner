/**
 * Add Event Modal Component
 * Modal for creating new calendar events
 *
 * Created: January 2026
 * Part of Vision Board Calendar Feature
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { BlurView } from 'expo-blur';
import * as Icons from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { COLORS, TYPOGRAPHY, SPACING, GLASS, INPUT } from '../../utils/tokens';
import calendarService, { EVENT_SOURCE_TYPES, SOURCE_TYPE_COLORS } from '../../services/calendarService';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// Event color options
const COLOR_OPTIONS = [
  { color: '#6A5BFF', name: 'Tím' },
  { color: '#FFBD59', name: 'Vàng' },
  { color: '#3AF7A6', name: 'Xanh lá' },
  { color: '#00F0FF', name: 'Xanh dương' },
  { color: '#FF6B6B', name: 'Đỏ' },
  { color: '#F093FB', name: 'Hồng' },
];

// Life area options
const LIFE_AREA_OPTIONS = [
  { key: 'finance', label: 'Tài chính', icon: 'DollarSign' },
  { key: 'crypto', label: 'Crypto', icon: 'Bitcoin' },
  { key: 'relationships', label: 'Mối quan hệ', icon: 'Heart' },
  { key: 'career', label: 'Sự nghiệp', icon: 'Briefcase' },
  { key: 'health', label: 'Sức khỏe', icon: 'Activity' },
  { key: 'personal', label: 'Phát triển cá nhân', icon: 'Star' },
  { key: 'spiritual', label: 'Tâm thức', icon: 'Sparkles' },
];

const AddEventModal = ({
  visible,
  date,
  userId,
  onClose,
  onEventCreated,
}) => {
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0].color);
  const [selectedLifeArea, setSelectedLifeArea] = useState(null);
  const [isAllDay, setIsAllDay] = useState(true);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Reset form when modal opens
  useEffect(() => {
    if (visible) {
      setTitle('');
      setDescription('');
      setSelectedColor(COLOR_OPTIONS[0].color);
      setSelectedLifeArea(null);
      setIsAllDay(true);
      setStartTime('');
      setEndTime('');
      setError(null);
    }
  }, [visible]);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    return d.toLocaleDateString('vi-VN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  // Handle create event
  const handleCreateEvent = async () => {
    // Validate
    if (!title.trim()) {
      setError('Vui lòng nhập tiêu đề sự kiện');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    if (!userId) {
      setError('Không thể xác định người dùng');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const eventData = {
        title: title.trim(),
        description: description.trim() || null,
        date: date,
        sourceType: EVENT_SOURCE_TYPES.MANUAL,
        color: selectedColor,
        icon: 'calendar',
        lifeArea: selectedLifeArea,
        isAllDay: isAllDay,
        startTime: !isAllDay && startTime ? startTime : null,
        endTime: !isAllDay && endTime ? endTime : null,
        priority: 1,
        metadata: {
          created_from: 'calendar_modal',
        },
      };

      const result = await calendarService.createEvent(userId, eventData);

      if (result.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onEventCreated?.(result.event);
        onClose();
      } else {
        setError(result.error || 'Không thể tạo sự kiện');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } catch (err) {
      console.error('[AddEventModal] Create error:', err);
      setError(err.message || 'Đã xảy ra lỗi');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <BlurView intensity={20} style={styles.blurContainer}>
          <TouchableOpacity
            style={styles.dismissArea}
            activeOpacity={1}
            onPress={onClose}
          />

          <View style={styles.modalContainer}>
            {/* Handle bar */}
            <View style={styles.handleBar} />

            {/* Header */}
            <View style={styles.header}>
              <View>
                <Text style={styles.headerTitle}>Thêm sự kiện</Text>
                <Text style={styles.headerDate}>{formatDate(date)}</Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Icons.X size={24} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            {/* Form */}
            <ScrollView
              style={styles.formContainer}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Error message */}
              {error && (
                <View style={styles.errorContainer}>
                  <Icons.AlertCircle size={16} color={COLORS.error} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              {/* Title input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Tiêu đề *</Text>
                <TextInput
                  style={styles.input}
                  value={title}
                  onChangeText={setTitle}
                  placeholder="Nhập tiêu đề sự kiện..."
                  placeholderTextColor={COLORS.textMuted}
                  maxLength={100}
                  autoFocus
                />
              </View>

              {/* Description input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Mô tả</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Thêm mô tả chi tiết..."
                  placeholderTextColor={COLORS.textMuted}
                  multiline
                  numberOfLines={3}
                  maxLength={500}
                />
              </View>

              {/* Color picker */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Màu sắc</Text>
                <View style={styles.colorPicker}>
                  {COLOR_OPTIONS.map((option) => (
                    <TouchableOpacity
                      key={option.color}
                      style={[
                        styles.colorOption,
                        { backgroundColor: option.color },
                        selectedColor === option.color && styles.colorOptionSelected,
                      ]}
                      onPress={() => {
                        setSelectedColor(option.color);
                        Haptics.selectionAsync();
                      }}
                    >
                      {selectedColor === option.color && (
                        <Icons.Check size={16} color="#fff" />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Life area picker */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Lĩnh vực (tùy chọn)</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.lifeAreaPicker}
                >
                  {LIFE_AREA_OPTIONS.map((area) => {
                    const AreaIcon = Icons[area.icon] || Icons.Tag;
                    const isSelected = selectedLifeArea === area.key;
                    return (
                      <TouchableOpacity
                        key={area.key}
                        style={[
                          styles.lifeAreaOption,
                          isSelected && styles.lifeAreaOptionSelected,
                        ]}
                        onPress={() => {
                          setSelectedLifeArea(isSelected ? null : area.key);
                          Haptics.selectionAsync();
                        }}
                      >
                        <AreaIcon
                          size={16}
                          color={isSelected ? COLORS.textPrimary : COLORS.textMuted}
                        />
                        <Text
                          style={[
                            styles.lifeAreaLabel,
                            isSelected && styles.lifeAreaLabelSelected,
                          ]}
                        >
                          {area.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              {/* All day toggle */}
              <TouchableOpacity
                style={styles.toggleRow}
                onPress={() => {
                  setIsAllDay(!isAllDay);
                  Haptics.selectionAsync();
                }}
              >
                <View style={styles.toggleInfo}>
                  <Icons.Clock size={20} color={COLORS.textMuted} />
                  <Text style={styles.toggleLabel}>Cả ngày</Text>
                </View>
                <View
                  style={[
                    styles.toggle,
                    isAllDay && styles.toggleActive,
                  ]}
                >
                  <View
                    style={[
                      styles.toggleThumb,
                      isAllDay && styles.toggleThumbActive,
                    ]}
                  />
                </View>
              </TouchableOpacity>

              {/* Time inputs (if not all day) */}
              {!isAllDay && (
                <View style={styles.timeRow}>
                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.inputLabel}>Bắt đầu</Text>
                    <TextInput
                      style={styles.input}
                      value={startTime}
                      onChangeText={setStartTime}
                      placeholder="09:00"
                      placeholderTextColor={COLORS.textMuted}
                      keyboardType="numbers-and-punctuation"
                    />
                  </View>
                  <View style={styles.timeSeparator}>
                    <Icons.ArrowRight size={16} color={COLORS.textMuted} />
                  </View>
                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.inputLabel}>Kết thúc</Text>
                    <TextInput
                      style={styles.input}
                      value={endTime}
                      onChangeText={setEndTime}
                      placeholder="10:00"
                      placeholderTextColor={COLORS.textMuted}
                      keyboardType="numbers-and-punctuation"
                    />
                  </View>
                </View>
              )}

              {/* Spacer */}
              <View style={{ height: 20 }} />
            </ScrollView>

            {/* Create button */}
            <View style={styles.footer}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={onClose}
                disabled={loading}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.createButton,
                  loading && styles.createButtonDisabled,
                ]}
                onPress={handleCreateEvent}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color={COLORS.bgDarkest} />
                ) : (
                  <>
                    <Icons.Plus size={18} color={COLORS.bgDarkest} />
                    <Text style={styles.createButtonText}>Tạo sự kiện</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </BlurView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  blurContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  dismissArea: {
    flex: 1,
  },
  modalContainer: {
    backgroundColor: COLORS.bgMid,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: SCREEN_HEIGHT * 0.85,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitle: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  headerDate: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.fontSize.sm,
    marginTop: 4,
  },
  closeButton: {
    padding: SPACING.xs,
  },
  formContainer: {
    padding: SPACING.lg,
    maxHeight: SCREEN_HEIGHT * 0.5,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(231, 76, 60, 0.15)',
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  errorText: {
    color: COLORS.error,
    fontSize: TYPOGRAPHY.fontSize.sm,
    flex: 1,
  },
  inputGroup: {
    marginBottom: SPACING.lg,
  },
  inputLabel: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    marginBottom: SPACING.sm,
  },
  input: {
    backgroundColor: INPUT.background,
    borderRadius: INPUT.borderRadius,
    borderWidth: 1,
    borderColor: INPUT.borderColor,
    padding: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textPrimary,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  colorPicker: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  colorOption: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorOptionSelected: {
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  lifeAreaPicker: {
    flexDirection: 'row',
  },
  lifeAreaOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 20,
    backgroundColor: COLORS.glassBg,
    marginRight: SPACING.sm,
    gap: SPACING.xs,
  },
  lifeAreaOptionSelected: {
    backgroundColor: COLORS.purple,
  },
  lifeAreaLabel: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.fontSize.sm,
  },
  lifeAreaLabelSelected: {
    color: COLORS.textPrimary,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: SPACING.md,
  },
  toggleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  toggleLabel: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.fontSize.md,
  },
  toggle: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.glassBg,
    padding: 2,
  },
  toggleActive: {
    backgroundColor: COLORS.purple,
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.textMuted,
  },
  toggleThumbActive: {
    backgroundColor: COLORS.textPrimary,
    marginLeft: 'auto',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: SPACING.sm,
  },
  timeSeparator: {
    paddingBottom: SPACING.md + 14,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    gap: SPACING.md,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  createButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    borderRadius: 12,
    backgroundColor: COLORS.gold,
    gap: SPACING.xs,
  },
  createButtonDisabled: {
    opacity: 0.7,
  },
  createButtonText: {
    color: COLORS.bgDarkest,
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
});

export default AddEventModal;
