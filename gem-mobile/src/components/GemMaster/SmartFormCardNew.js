// src/components/GemMaster/SmartFormCardNew.js
// Widget Suggestion Card - VIETNAMESE COMPLETE
// Fixed: Dark theme Modal instead of Alert

import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Plus, ChevronRight, X, Sparkles, CheckCircle, AlertCircle } from 'lucide-react-native';
import { supabase } from '../../services/supabase';
import gemMasterService from '../../services/gemMasterService';
import { COLORS, SPACING, TYPOGRAPHY } from '../../utils/tokens';

const SmartFormCardNew = ({ widget, onDismiss }) => {
  const navigation = useNavigation();
  const [alertModal, setAlertModal] = useState({ visible: false, title: '', message: '', buttons: [], isSuccess: false });

  // Custom Alert function (dark theme)
  const showAlert = (title, message, buttons = [{ text: 'OK', onPress: () => {} }], isSuccess = false) => {
    setAlertModal({ visible: true, title, message, buttons, isSuccess });
  };

  const hideAlert = () => {
    setAlertModal({ visible: false, title: '', message: '', buttons: [], isSuccess: false });
  };

  const handleAddToVisionBoard = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        showAlert('Thông báo', 'Vui lòng đăng nhập để sử dụng tính năng này.');
        return;
      }

      console.log('[SmartForm] Adding widget:', widget?.title);

      const result = await gemMasterService.saveWidgetToVisionBoard(widget, user.id);

      if (result.success) {
        showAlert(
          'Đã thêm!',
          `Mục tiêu "${widget?.title || 'Affirmation'}" đã được thêm vào Vision Board của bạn.`,
          [
            {
              text: 'OK',
              onPress: () => {
                hideAlert();
                onDismiss?.();
              },
            },
            {
              text: 'XEM VISION BOARD',
              onPress: () => {
                hideAlert();
                onDismiss?.();
                navigation.navigate('Account', {
                  screen: 'VisionBoard',
                });
              },
            },
          ],
          true // isSuccess
        );
      } else {
        throw new Error(result.error || 'Lỗi không xác định');
      }
    } catch (error) {
      console.error('[SmartForm] Error:', error);
      showAlert('Lỗi', `Không thể thêm mục tiêu: ${error.message}`);
    }
  }, [widget, navigation, onDismiss]);

  // Don't render if no widget
  if (!widget) {
    console.log('[SmartForm] No widget provided');
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Sparkles size={18} color="#FFBD59" />
          <Text style={styles.title}>🎁 Thêm vào Vision Board?</Text>
        </View>
        <TouchableOpacity
          onPress={onDismiss}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <X size={20} color="#718096" />
        </TouchableOpacity>
      </View>

      {/* Description - HIỆN TÊN MỤC TIÊU */}
      <Text style={styles.description}>
        Tôi có thể tạo <Text style={styles.highlight}>{widget.title || 'mục tiêu'}</Text> cho bạn.
      </Text>

      {/* Mục Tiêu Tag */}
      <View style={styles.tagContainer}>
        <View style={styles.tag}>
          <Text style={styles.tagIcon}>{widget.icon || '✨'}</Text>
          <Text style={styles.tagText}>{widget.title || 'Mục tiêu'}</Text>
        </View>
      </View>

      {/* Explanation */}
      <View style={styles.explanationBox}>
        <Text style={styles.explanationLabel}>💡 Vision Board là gì?</Text>
        <Text style={styles.explanationText}>
          {widget.explanation || 'Đây là "bảng mục tiêu số" giúp bạn nhắc nhở và theo dõi tiến trình mỗi ngày.'}
        </Text>
      </View>

      {/* Affirmations Preview */}
      {widget.affirmations && widget.affirmations.length > 0 && (
        <View style={styles.previewBox}>
          <Text style={styles.previewLabel}>✅ Bao gồm {widget.affirmations.length} câu khẳng định:</Text>
          {widget.affirmations.slice(0, 2).map((aff, index) => (
            <Text key={index} style={styles.previewItem}>• "{aff}"</Text>
          ))}
          {widget.affirmations.length > 2 && (
            <Text style={styles.previewMore}>+{widget.affirmations.length - 2} câu khác...</Text>
          )}
        </View>
      )}

      {/* Buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.skipButton} onPress={onDismiss}>
          <Text style={styles.skipText}>Bỏ qua</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.addButton} onPress={handleAddToVisionBoard}>
          <Plus size={16} color="#0A0F1C" />
          <Text style={styles.addText}>Thêm Mục Tiêu</Text>
          <ChevronRight size={16} color="#0A0F1C" />
        </TouchableOpacity>
      </View>

      {/* Custom Dark Theme Alert Modal */}
      <Modal
        visible={alertModal.visible}
        transparent
        animationType="fade"
        onRequestClose={hideAlert}
      >
        <Pressable style={styles.modalOverlay} onPress={hideAlert}>
          <View style={styles.modalContainer}>
            <Pressable onPress={(e) => e.stopPropagation()}>
              <View style={styles.modalContent}>
                {/* Success/Error Icon */}
                <View style={styles.modalIconContainer}>
                  {alertModal.isSuccess ? (
                    <CheckCircle size={48} color={COLORS.success || '#10B981'} />
                  ) : (
                    <AlertCircle size={48} color={COLORS.gold} />
                  )}
                </View>

                {/* Modal Header */}
                <Text style={styles.modalTitle}>{alertModal.title}</Text>

                {/* Modal Message */}
                <Text style={styles.modalMessage}>{alertModal.message}</Text>

                {/* Modal Buttons */}
                <View style={styles.modalButtons}>
                  {alertModal.buttons.map((button, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.modalButton,
                        index === alertModal.buttons.length - 1 && styles.modalButtonPrimary,
                      ]}
                      onPress={button.onPress}
                    >
                      <Text
                        style={[
                          styles.modalButtonText,
                          index === alertModal.buttons.length - 1 && styles.modalButtonTextPrimary,
                        ]}
                      >
                        {button.text}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 189, 89, 0.08)',
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.25)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFBD59',
  },
  description: {
    fontSize: 14,
    color: '#E2E8F0',
    marginBottom: 12,
    lineHeight: 20,
  },
  highlight: {
    color: '#FFBD59',
    fontWeight: '600',
  },
  tagContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 189, 89, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  tagIcon: {
    fontSize: 16,
  },
  tagText: {
    color: '#FFBD59',
    fontSize: 13,
    fontWeight: '600',
  },
  explanationBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  explanationLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFBD59',
    marginBottom: 4,
  },
  explanationText: {
    fontSize: 12,
    color: '#A0AEC0',
    lineHeight: 18,
  },
  previewBox: {
    marginBottom: 16,
  },
  previewLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#E2E8F0',
    marginBottom: 8,
  },
  previewItem: {
    fontSize: 12,
    color: '#A0AEC0',
    marginLeft: 8,
    marginBottom: 4,
    fontStyle: 'italic',
  },
  previewMore: {
    fontSize: 11,
    color: '#718096',
    marginLeft: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skipButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  skipText: {
    color: '#718096',
    fontSize: 14,
    fontWeight: '500',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFBD59',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    gap: 6,
  },
  addText: {
    color: '#0A0F1C',
    fontSize: 14,
    fontWeight: '700',
  },
  // Modal styles - Dark theme
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    maxWidth: 340,
  },
  modalContent: {
    backgroundColor: COLORS.bgCard || '#1a1a2e',
    borderRadius: SPACING.lg,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.3)',
    alignItems: 'center',
  },
  modalIconContainer: {
    marginBottom: SPACING.md,
  },
  modalTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gold,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  modalMessage: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.xl,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.md,
    width: '100%',
  },
  modalButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: SPACING.md,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  modalButtonPrimary: {
    backgroundColor: COLORS.gold,
  },
  modalButtonText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textMuted,
  },
  modalButtonTextPrimary: {
    color: '#0A0F1C',
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
});

export default SmartFormCardNew;
