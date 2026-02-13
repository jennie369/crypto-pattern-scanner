/**
 * Gemral - Report Modal Component
 * Modal for reporting posts or comments
 * Uses dark glass theme from DESIGN_TOKENS
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { BlurView } from 'expo-blur';
import {
  X,
  AlertTriangle,
  Check,
  Flag,
} from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, GLASS, INPUT } from '../utils/tokens';
import { reportService, REPORT_REASONS } from '../services/reportService';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const ReportModal = ({
  visible,
  onClose,
  postId,
  commentId,
  onSuccess,
}) => {
  const [selectedReason, setSelectedReason] = useState(null);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    if (!selectedReason) {
      setError('Vui lòng chọn lý do báo cáo');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let result;
      if (postId) {
        result = await reportService.reportPost(postId, selectedReason, description);
      } else if (commentId) {
        result = await reportService.reportComment(commentId, selectedReason, description);
      }

      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          onSuccess?.();
          handleClose();
        }, 1500);
      } else {
        setError(result.error || 'Có lỗi xảy ra');
      }
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedReason(null);
    setDescription('');
    setSuccess(false);
    setError(null);
    onClose();
  };

  const renderContent = () => {
    if (success) {
      return (
        <View style={styles.successContainer}>
          <View style={styles.successIcon}>
            <Check size={32} color={COLORS.success} />
          </View>
          <Text style={styles.successTitle}>Đã gửi báo cáo</Text>
          <Text style={styles.successSubtitle}>
            Cảm ơn bạn đã giúp chúng tôi cải thiện cộng đồng
          </Text>
        </View>
      );
    }

    return (
      <>
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Flag size={24} color={COLORS.error} />
          </View>
          <Text style={styles.title}>Báo cáo bài viết</Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleClose}
          >
            <X size={24} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        <Text style={styles.subtitle}>
          Vui lòng cho chúng tôi biết lý do bạn báo cáo nội dung này
        </Text>

        {/* Reason options */}
        <ScrollView style={styles.optionsContainer}>
          {REPORT_REASONS.map((reason) => (
            <TouchableOpacity
              key={reason.id}
              style={[
                styles.optionItem,
                selectedReason === reason.id && styles.optionItemSelected,
              ]}
              onPress={() => setSelectedReason(reason.id)}
            >
              <View style={styles.optionRadio}>
                {selectedReason === reason.id && (
                  <View style={styles.optionRadioInner} />
                )}
              </View>
              <View style={styles.optionText}>
                <Text style={styles.optionLabel}>{reason.label}</Text>
                <Text style={styles.optionDescription}>{reason.description}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Additional description */}
        {selectedReason === 'other' && (
          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionLabel}>Mô tả chi tiết</Text>
            <TextInput
              style={styles.descriptionInput}
              value={description}
              onChangeText={setDescription}
              placeholder="Nhập mô tả chi tiết..."
              placeholderTextColor={COLORS.textMuted}
              multiline
              numberOfLines={3}
              maxLength={500}
            />
          </View>
        )}

        {/* Error message */}
        {error && (
          <View style={styles.errorContainer}>
            <AlertTriangle size={16} color={COLORS.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Submit button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            (!selectedReason || loading) && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={!selectedReason || loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.textPrimary} />
          ) : (
            <Text style={styles.submitButtonText}>Gửi báo cáo</Text>
          )}
        </TouchableOpacity>
      </>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={handleClose}
        />

        <View style={styles.modalContainer}>
          <BlurView
            intensity={80}
            tint="dark"
            style={styles.blurContainer}
          >
            <View style={styles.content}>
              {renderContent()}
            </View>
          </BlurView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalContainer: {
    maxHeight: SCREEN_HEIGHT * 0.75,
    borderTopLeftRadius: GLASS.borderRadius,
    borderTopRightRadius: GLASS.borderRadius,
    overflow: 'hidden',
  },
  blurContainer: {
    borderTopLeftRadius: GLASS.borderRadius,
    borderTopRightRadius: GLASS.borderRadius,
  },
  content: {
    backgroundColor: GLASS.background,
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl + 20,
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  title: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subtitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textMuted,
    marginBottom: SPACING.lg,
    lineHeight: 22,
  },
  // Options
  optionsContainer: {
    maxHeight: 280,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: SPACING.md,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  optionItemSelected: {
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderColor: COLORS.error,
  },
  optionRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.textMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
    marginTop: 2,
  },
  optionRadioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.error,
  },
  optionText: {
    flex: 1,
  },
  optionLabel: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  optionDescription: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
  },
  // Description input
  descriptionContainer: {
    marginTop: SPACING.md,
  },
  descriptionLabel: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
    marginBottom: SPACING.sm,
  },
  descriptionInput: {
    backgroundColor: INPUT.background,
    borderRadius: INPUT.borderRadius,
    borderWidth: 1,
    borderColor: INPUT.borderColor,
    padding: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textPrimary,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  // Error
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    padding: SPACING.md,
    borderRadius: 8,
    marginTop: SPACING.md,
  },
  errorText: {
    flex: 1,
    marginLeft: SPACING.sm,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.error,
  },
  // Submit button
  submitButton: {
    backgroundColor: COLORS.error,
    borderRadius: 12,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  submitButtonDisabled: {
    backgroundColor: 'rgba(255, 107, 107, 0.3)',
  },
  submitButtonText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  // Success state
  successContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  successIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(58, 247, 166, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  successTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.success,
    marginBottom: SPACING.sm,
  },
  successSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
});

export default ReportModal;
