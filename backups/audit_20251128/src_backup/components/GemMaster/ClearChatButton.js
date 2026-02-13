/**
 * GEM Mobile - Clear Chat Button Component
 * Reset chat with confirmation dialog
 *
 * Placed in header or as action button
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable
} from 'react-native';
import { Trash2, AlertTriangle, X } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, TYPOGRAPHY, GLASS } from '../../utils/tokens';

/**
 * ClearChatButton Component
 * @param {Object} props
 * @param {Function} props.onClear - Callback when confirmed
 * @param {string} props.variant - Button variant ('icon', 'text', 'full')
 * @param {Object} props.style - Additional container style
 */
const ClearChatButton = ({
  onClear,
  variant = 'icon',
  style
}) => {
  const [showConfirm, setShowConfirm] = useState(false);

  const handlePress = () => {
    setShowConfirm(true);
  };

  const handleConfirm = () => {
    setShowConfirm(false);
    onClear?.();
  };

  const handleCancel = () => {
    setShowConfirm(false);
  };

  // Render button based on variant
  const renderButton = () => {
    switch (variant) {
      case 'icon':
        return (
          <TouchableOpacity
            style={[styles.iconButton, style]}
            onPress={handlePress}
            activeOpacity={0.7}
          >
            <Trash2 size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
        );

      case 'text':
        return (
          <TouchableOpacity
            style={[styles.textButton, style]}
            onPress={handlePress}
            activeOpacity={0.7}
          >
            <Trash2 size={16} color={COLORS.danger} />
            <Text style={styles.textButtonLabel}>Xóa chat</Text>
          </TouchableOpacity>
        );

      case 'full':
        return (
          <TouchableOpacity
            style={[styles.fullButton, style]}
            onPress={handlePress}
            activeOpacity={0.7}
          >
            <Trash2 size={18} color="#FF6B6B" />
            <Text style={styles.fullButtonLabel}>Xóa lịch sử chat</Text>
          </TouchableOpacity>
        );

      default:
        return (
          <TouchableOpacity
            style={[styles.iconButton, style]}
            onPress={handlePress}
            activeOpacity={0.7}
          >
            <Trash2 size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
        );
    }
  };

  return (
    <>
      {renderButton()}

      {/* Confirmation Modal */}
      <Modal
        visible={showConfirm}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCancel}
      >
        <Pressable style={styles.modalOverlay} onPress={handleCancel}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <View style={styles.warningIcon}>
                <AlertTriangle size={24} color="#FFB800" />
              </View>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleCancel}
              >
                <X size={20} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            {/* Content */}
            <Text style={styles.modalTitle}>Xóa lịch sử chat?</Text>
            <Text style={styles.modalDescription}>
              Toàn bộ cuộc trò chuyện sẽ bị xóa và không thể khôi phục.
              Bạn có chắc chắn muốn tiếp tục?
            </Text>

            {/* Actions */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCancel}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleConfirm}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={['#FF6B6B', '#FF4444']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.confirmButton}
                >
                  <Trash2 size={16} color="#FFFFFF" />
                  <Text style={styles.confirmButtonText}>Xóa</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  // Icon variant
  iconButton: {
    padding: SPACING.xs,
    borderRadius: 8
  },

  // Text variant
  textButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: SPACING.xs
  },
  textButtonLabel: {
    color: COLORS.danger,
    fontSize: 12,
    fontWeight: '500'
  },

  // Full variant
  fullButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.3)',
    borderRadius: 12
  },
  fullButtonLabel: {
    color: '#FF6B6B',
    fontSize: 14,
    fontWeight: '600'
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg
  },
  modalContent: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: COLORS.bgDark,
    borderRadius: 16,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: GLASS.border
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md
  },
  warningIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 184, 0, 0.15)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  closeButton: {
    padding: 4
  },
  modalTitle: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: SPACING.sm
  },
  modalDescription: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: SPACING.lg
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: SPACING.sm
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)'
  },
  cancelButtonText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '600'
  },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700'
  }
});

export default ClearChatButton;
