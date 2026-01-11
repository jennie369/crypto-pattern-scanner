/**
 * AddActionModal - Vision Board 2.0
 * Modal for adding new actions to a goal with action type selection
 *
 * Action Types:
 * - daily: Reset every day (core habits)
 * - weekly: Reset every 7 days (periodic tasks)
 * - monthly: Reset every 30 days (monthly reviews)
 * - one_time: Complete once, done forever (setup tasks)
 *
 * Created: December 11, 2025
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Vibration,
} from 'react-native';
import {
  X,
  Repeat,
  Calendar,
  CalendarDays,
  Check,
  Plus,
  Sparkles,
} from 'lucide-react-native';

// Design tokens
const COLORS = {
  bgDark: '#05040B',
  bgMid: '#0F0A1F',
  textPrimary: '#FFFFFF',
  textSecondary: 'rgba(255,255,255,0.7)',
  textMuted: 'rgba(255,255,255,0.4)',
  gold: '#FFBD59',
  green: '#3AF7A6',
  blue: '#3B82F6',
  purple: '#A855F7',
  border: 'rgba(255,255,255,0.1)',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
};

const TYPOGRAPHY = {
  fontSize: {
    xs: 11,
    sm: 13,
    base: 15,
    lg: 17,
    xl: 20,
  },
  fontWeight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
};

// Action type configuration
const ACTION_TYPES = [
  {
    id: 'daily',
    label: 'Hàng ngày',
    icon: Repeat,
    color: COLORS.green,
    bgColor: 'rgba(58, 247, 166, 0.15)',
    description: 'Reset mỗi ngày, phù hợp cho thói quen cần lặp lại',
  },
  {
    id: 'weekly',
    label: 'Hàng tuần',
    icon: Calendar,
    color: COLORS.blue,
    bgColor: 'rgba(59, 130, 246, 0.15)',
    description: 'Reset mỗi 7 ngày, cho các hoạt động định kỳ',
  },
  {
    id: 'monthly',
    label: 'Hàng tháng',
    icon: CalendarDays,
    color: COLORS.purple,
    bgColor: 'rgba(168, 85, 247, 0.15)',
    description: 'Reset mỗi 30 ngày, cho review và đánh giá',
  },
  {
    id: 'one_time',
    label: 'Một lần',
    icon: Check,
    color: COLORS.gold,
    bgColor: 'rgba(255, 189, 89, 0.15)',
    description: 'Hoàn thành 1 lần là xong, không reset',
  },
];

/**
 * AddActionModal Component
 * @param {boolean} visible - Modal visibility
 * @param {function} onClose - Close callback
 * @param {function} onSave - Save callback with action data
 * @param {string} goalTitle - Title of the goal for context
 * @param {boolean} isLoading - Loading state
 */
const AddActionModal = ({
  visible,
  onClose,
  onSave,
  goalTitle = '',
  isLoading = false,
}) => {
  const [title, setTitle] = useState('');
  const [actionType, setActionType] = useState('daily');
  const [error, setError] = useState('');

  // Reset form when modal opens
  const handleOpen = useCallback(() => {
    setTitle('');
    setActionType('daily');
    setError('');
  }, []);

  // Validate and save
  const handleSave = useCallback(() => {
    // Validation
    if (!title.trim()) {
      setError('Vui lòng nhập mô tả hành động');
      Vibration.vibrate(50);
      return;
    }

    if (title.trim().length < 3) {
      setError('Mô tả hành động phải có ít nhất 3 ký tự');
      Vibration.vibrate(50);
      return;
    }

    // Clear error
    setError('');

    // Save
    onSave({
      title: title.trim(),
      action_type: actionType,
    });

    // Reset form
    setTitle('');
    setActionType('daily');
    onClose();
  }, [title, actionType, onSave, onClose]);

  // Handle close
  const handleClose = useCallback(() => {
    setTitle('');
    setActionType('daily');
    setError('');
    onClose();
  }, [onClose]);

  // Select action type
  const handleSelectType = useCallback((typeId) => {
    setActionType(typeId);
    Vibration.vibrate(10);
  }, []);

  // Get selected type config
  const selectedType = ACTION_TYPES.find(t => t.id === actionType) || ACTION_TYPES[0];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
      onShow={handleOpen}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleContainer}>
              <Plus size={20} color={COLORS.gold} />
              <Text style={styles.headerTitle}>Thêm Hành Động</Text>
            </View>
            <TouchableOpacity
              onPress={handleClose}
              style={styles.closeButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <X size={24} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Goal context */}
          {goalTitle && (
            <View style={styles.goalContext}>
              <Sparkles size={14} color={COLORS.gold} />
              <Text style={styles.goalContextText} numberOfLines={1}>
                Cho mục tiêu: {goalTitle}
              </Text>
            </View>
          )}

          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Title input */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Mô tả hành động</Text>
              <TextInput
                style={[
                  styles.input,
                  error && styles.inputError,
                ]}
                placeholder="VD: Dành 30 phút đọc sách mỗi ngày"
                placeholderTextColor={COLORS.textMuted}
                value={title}
                onChangeText={(text) => {
                  setTitle(text);
                  if (error) setError('');
                }}
                multiline
                maxLength={200}
                textAlignVertical="top"
              />
              <View style={styles.inputFooter}>
                {error ? (
                  <Text style={styles.errorText}>{error}</Text>
                ) : (
                  <Text style={styles.charCount}>{title.length}/200</Text>
                )}
              </View>
            </View>

            {/* Action type selection */}
            <View style={styles.typeSection}>
              <Text style={styles.inputLabel}>Loại hành động</Text>

              {ACTION_TYPES.map((type) => {
                const Icon = type.icon;
                const isSelected = actionType === type.id;

                return (
                  <TouchableOpacity
                    key={type.id}
                    style={[
                      styles.typeOption,
                      isSelected && [
                        styles.typeOptionSelected,
                        { borderColor: type.color },
                      ],
                    ]}
                    onPress={() => handleSelectType(type.id)}
                    activeOpacity={0.7}
                  >
                    <View
                      style={[
                        styles.typeIconContainer,
                        { backgroundColor: type.bgColor },
                      ]}
                    >
                      <Icon
                        size={20}
                        color={isSelected ? type.color : COLORS.textMuted}
                      />
                    </View>
                    <View style={styles.typeContent}>
                      <Text
                        style={[
                          styles.typeLabel,
                          isSelected && { color: type.color },
                        ]}
                      >
                        {type.label}
                      </Text>
                      <Text style={styles.typeDescription}>
                        {type.description}
                      </Text>
                    </View>
                    {isSelected && (
                      <View style={[styles.typeCheck, { backgroundColor: type.color }]}>
                        <Check size={14} color={COLORS.bgDarkest} />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Info tip */}
            <View style={styles.infoTip}>
              <Text style={styles.infoTipText}>
                Hành động <Text style={{ color: selectedType.color }}>{selectedType.label.toLowerCase()}</Text> sẽ{' '}
                {selectedType.id === 'one_time'
                  ? 'chỉ cần hoàn thành một lần.'
                  : `tự động reset ${selectedType.id === 'daily' ? 'mỗi ngày' : selectedType.id === 'weekly' ? 'mỗi tuần' : 'mỗi tháng'} để bạn tick lại.`}
              </Text>
            </View>
          </ScrollView>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleClose}
            >
              <Text style={styles.cancelButtonText}>Hủy</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.saveButton,
                (!title.trim() || isLoading) && styles.saveButtonDisabled,
              ]}
              onPress={handleSave}
              disabled={!title.trim() || isLoading}
            >
              <Plus size={18} color={COLORS.bgDarkest} />
              <Text style={styles.saveButtonText}>
                {isLoading ? 'Đang lưu...' : 'Thêm Hành Động'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: COLORS.bgMid,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.md,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Goal context
  goalContext: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.md,
  },
  goalContextText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    flex: 1,
  },

  // Scroll view
  scrollView: {
    paddingHorizontal: SPACING.xl,
  },

  // Input section
  inputSection: {
    marginBottom: SPACING.lg,
  },
  inputLabel: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.lg,
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.fontSize.base,
    minHeight: 100,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  inputFooter: {
    marginTop: SPACING.xs,
    alignItems: 'flex-end',
  },
  charCount: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
  },
  errorText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#EF4444',
  },

  // Type section
  typeSection: {
    marginBottom: SPACING.lg,
  },
  typeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  typeOptionSelected: {
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  typeIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  typeContent: {
    flex: 1,
  },
  typeLabel: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  typeDescription: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    lineHeight: 18,
  },
  typeCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: SPACING.sm,
  },

  // Info tip
  infoTip: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 8,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.gold,
  },
  infoTipText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },

  // Actions
  actions: {
    flexDirection: 'row',
    padding: SPACING.xl,
    paddingBottom: Platform.OS === 'ios' ? 34 : SPACING.xl,
    gap: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  cancelButton: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.fontSize.base,
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.lg,
    backgroundColor: COLORS.gold,
    borderRadius: 12,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: COLORS.bgDarkest,
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
});

export default AddActionModal;
