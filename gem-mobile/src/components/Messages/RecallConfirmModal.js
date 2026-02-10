/**
 * RecallConfirmModal Component
 * Modal xác nhận thu hồi tin nhắn
 *
 * Features:
 * - Confirmation dialog before recalling
 * - Shows time limit warning (24h text, 1h media)
 * - Message preview
 * - Loading state during recall
 */

import React, { memo, useCallback, useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSettings } from '../../contexts/SettingsContext';

/**
 * RecallConfirmModal - Modal xác nhận thu hồi tin nhắn
 *
 * @param {boolean} visible - Modal visibility
 * @param {object} message - Message to recall
 * @param {function} onConfirm - Callback when confirmed
 * @param {function} onCancel - Callback when cancelled
 */
const RecallConfirmModal = memo(({
  visible,
  message,
  onConfirm,
  onCancel,
}) => {
  const { colors, gradients, glass, settings, SPACING, TYPOGRAPHY, t } = useSettings();
  const [isRecalling, setIsRecalling] = useState(false);

  // ========== STYLES ==========
  const styles = useMemo(() => StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: SPACING.lg,
    },
    container: {
      backgroundColor: settings.theme === 'light' ? colors.bgDarkest : (glass.background || colors.glassBg),
      borderRadius: 20,
      padding: SPACING.xl,
      width: '100%',
      maxWidth: 340,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: 'rgba(106, 91, 255, 0.3)',
    },
    iconContainer: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: 'rgba(255, 189, 89, 0.15)',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: SPACING.md,
    },
    title: {
      fontSize: TYPOGRAPHY.fontSize.xl,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      color: colors.textPrimary,
      marginBottom: SPACING.sm,
    },
    description: {
      fontSize: TYPOGRAPHY.fontSize.base,
      color: colors.textMuted,
      textAlign: 'center',
      lineHeight: 22,
    },
    note: {
      color: colors.gold,
      fontSize: TYPOGRAPHY.fontSize.sm,
    },
    previewContainer: {
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      borderRadius: 12,
      padding: SPACING.md,
      marginTop: SPACING.md,
      width: '100%',
    },
    previewText: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: colors.textMuted,
      fontStyle: 'italic',
    },
    mediaPreview: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.sm,
    },
    mediaText: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: colors.textMuted,
    },
    buttonContainer: {
      flexDirection: 'row',
      gap: SPACING.md,
      marginTop: SPACING.xl,
      width: '100%',
    },
    button: {
      flex: 1,
      paddingVertical: SPACING.md,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 48,
    },
    cancelButton: {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    confirmButton: {
      backgroundColor: colors.burgundy,
    },
    cancelButtonText: {
      fontSize: TYPOGRAPHY.fontSize.base,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
      color: colors.textPrimary,
    },
    confirmButtonText: {
      fontSize: TYPOGRAPHY.fontSize.base,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
      color: colors.textPrimary,
    },
  }), [colors, settings.theme, glass, SPACING, TYPOGRAPHY]);

  const handleConfirm = useCallback(async () => {
    setIsRecalling(true);
    try {
      await onConfirm?.();
    } finally {
      setIsRecalling(false);
    }
  }, [onConfirm]);

  const isMediaMessage = ['image', 'video', 'audio', 'file'].includes(message?.message_type);
  const timeLimit = isMediaMessage ? '1 giờ' : '24 giờ';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Icon */}
          <View style={styles.iconContainer}>
            <Ionicons name="alert-circle" size={32} color={colors.gold} />
          </View>

          {/* Title */}
          <Text style={styles.title}>Thu hồi tin nhắn?</Text>

          {/* Description */}
          <Text style={styles.description}>
            Tin nhắn này sẽ bị xóa cho tất cả mọi người trong cuộc trò chuyện.
            {'\n\n'}
            <Text style={styles.note}>
              Lưu ý: Bạn chỉ có thể thu hồi tin nhắn trong vòng {timeLimit} sau khi gửi.
            </Text>
          </Text>

          {/* Preview */}
          {message?.content && (
            <View style={styles.previewContainer}>
              <Text style={styles.previewText} numberOfLines={2}>
                "{message.content}"
              </Text>
            </View>
          )}

          {/* Media preview */}
          {isMediaMessage && !message?.content && (
            <View style={styles.previewContainer}>
              <View style={styles.mediaPreview}>
                <Ionicons
                  name={
                    message?.message_type === 'image' ? 'image-outline' :
                    message?.message_type === 'video' ? 'videocam-outline' :
                    message?.message_type === 'audio' ? 'mic-outline' :
                    'document-outline'
                  }
                  size={20}
                  color={colors.textMuted}
                />
                <Text style={styles.mediaText}>
                  {message?.message_type === 'image' ? 'Hình ảnh' :
                   message?.message_type === 'video' ? 'Video' :
                   message?.message_type === 'audio' ? 'Tin nhắn thoại' :
                   'Tệp đính kèm'}
                </Text>
              </View>
            </View>
          )}

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onCancel}
              disabled={isRecalling}
            >
              <Text style={styles.cancelButtonText}>Hủy</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.confirmButton]}
              onPress={handleConfirm}
              disabled={isRecalling}
            >
              {isRecalling ? (
                <ActivityIndicator size="small" color={colors.textPrimary} />
              ) : (
                <Text style={styles.confirmButtonText}>Thu hồi</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
});

RecallConfirmModal.displayName = 'RecallConfirmModal';

export default RecallConfirmModal;
