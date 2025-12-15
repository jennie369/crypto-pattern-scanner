/**
 * Gemral - Comment Action Sheet Component
 * Feature #11: Pin/Delete/Report Comments
 * Bottom sheet with comment moderation options
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
  Dimensions,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import { BlurView } from 'expo-blur';
import {
  X,
  Pin,
  Trash2,
  Flag,
  AlertTriangle,
  ChevronRight,
  CheckCircle,
} from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, GLASS, INPUT } from '../utils/tokens';
import commentModerationService from '../services/commentModerationService';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const CommentActionSheet = ({
  visible,
  onClose,
  comment,
  postId,
  onCommentDeleted,
  onCommentPinned,
  onCommentReported,
}) => {
  const [loading, setLoading] = useState(false);
  const [permissions, setPermissions] = useState(null);
  const [mode, setMode] = useState('actions'); // 'actions' or 'report'
  const [selectedReason, setSelectedReason] = useState(null);
  const [reportDetails, setReportDetails] = useState('');
  const [slideAnim] = useState(new Animated.Value(SCREEN_HEIGHT));

  // Fetch permissions on mount
  useEffect(() => {
    if (visible && comment && postId) {
      loadPermissions();
    } else {
      setMode('actions');
      setSelectedReason(null);
      setReportDetails('');
    }
  }, [visible, comment, postId]);

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const loadPermissions = async () => {
    const perms = await commentModerationService.getCommentPermissions(
      comment.id,
      postId
    );
    setPermissions(perms);
  };

  // Handle pin/unpin
  const handleTogglePin = useCallback(async () => {
    if (!comment || loading) return;

    setLoading(true);
    const result = permissions?.isPinned
      ? await commentModerationService.unpinComment(comment.id, postId)
      : await commentModerationService.pinComment(comment.id, postId);
    setLoading(false);

    if (result.success) {
      onCommentPinned?.(result.data);
      onClose?.();
    } else {
      Alert.alert('Lỗi', result.error);
    }
  }, [comment, postId, loading, permissions, onCommentPinned, onClose]);

  // Handle delete
  const handleDelete = useCallback(() => {
    Alert.alert(
      'Xóa bình luận',
      'Bạn có chắc chắn muốn xóa bình luận này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            const result = await commentModerationService.deleteComment(
              comment.id,
              postId
            );
            setLoading(false);

            if (result.success) {
              onCommentDeleted?.(comment.id);
              onClose?.();
            } else {
              Alert.alert('Lỗi', result.error);
            }
          },
        },
      ]
    );
  }, [comment, postId, onCommentDeleted, onClose]);

  // Handle report submission
  const handleSubmitReport = useCallback(async () => {
    if (!selectedReason || loading) return;

    setLoading(true);
    const result = await commentModerationService.reportComment(
      comment.id,
      selectedReason.id,
      selectedReason.id === 'other' ? reportDetails : null
    );
    setLoading(false);

    if (result.success) {
      onCommentReported?.(comment.id);
      onClose?.();
      Alert.alert('Cảm ơn', 'Báo cáo của bạn đã được gửi');
    } else {
      Alert.alert('Lỗi', result.error);
    }
  }, [comment, selectedReason, reportDetails, loading, onCommentReported, onClose]);

  const reportReasons = commentModerationService.getReportReasons();

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* Backdrop */}
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        {/* Sheet */}
        <Animated.View
          style={[
            styles.sheet,
            { transform: [{ translateY: slideAnim }] },
          ]}
        >
          <BlurView intensity={40} tint="dark" style={styles.blurContainer}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.handle} />
              <Text style={styles.title}>
                {mode === 'actions' ? 'Tùy chọn bình luận' : 'Báo cáo bình luận'}
              </Text>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <X size={20} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            {/* Loading */}
            {!permissions ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color={COLORS.purple} />
              </View>
            ) : mode === 'actions' ? (
              /* Actions List */
              <View style={styles.actionsContainer}>
                {/* Pin Option */}
                {permissions.canPin && (
                  <TouchableOpacity
                    style={styles.actionItem}
                    onPress={handleTogglePin}
                    disabled={loading}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.actionIcon, { backgroundColor: 'rgba(106, 91, 255, 0.2)' }]}>
                      <Pin size={20} color={COLORS.purple} />
                    </View>
                    <View style={styles.actionText}>
                      <Text style={styles.actionLabel}>
                        {permissions.isPinned ? 'Bỏ ghim bình luận' : 'Ghim bình luận'}
                      </Text>
                      <Text style={styles.actionSubtitle}>
                        {permissions.isPinned
                          ? 'Bình luận này sẽ không hiển thị đầu tiên'
                          : 'Hiển thị bình luận này lên đầu'}
                      </Text>
                    </View>
                    {loading && <ActivityIndicator size="small" color={COLORS.purple} />}
                  </TouchableOpacity>
                )}

                {/* Delete Option */}
                {permissions.canDelete && (
                  <TouchableOpacity
                    style={styles.actionItem}
                    onPress={handleDelete}
                    disabled={loading}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.actionIcon, { backgroundColor: 'rgba(255, 107, 107, 0.2)' }]}>
                      <Trash2 size={20} color={COLORS.error} />
                    </View>
                    <View style={styles.actionText}>
                      <Text style={[styles.actionLabel, { color: COLORS.error }]}>
                        Xóa bình luận
                      </Text>
                      <Text style={styles.actionSubtitle}>
                        {permissions.isOwn
                          ? 'Xóa bình luận của bạn'
                          : 'Xóa bình luận này khỏi bài viết của bạn'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}

                {/* Report Option */}
                {permissions.canReport && (
                  <TouchableOpacity
                    style={styles.actionItem}
                    onPress={() => setMode('report')}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.actionIcon, { backgroundColor: 'rgba(255, 184, 0, 0.2)' }]}>
                      <Flag size={20} color={COLORS.warning} />
                    </View>
                    <View style={styles.actionText}>
                      <Text style={styles.actionLabel}>Báo cáo bình luận</Text>
                      <Text style={styles.actionSubtitle}>
                        Báo cáo nội dung vi phạm
                      </Text>
                    </View>
                    <ChevronRight size={20} color={COLORS.textMuted} />
                  </TouchableOpacity>
                )}

                {/* No actions available */}
                {!permissions.canPin && !permissions.canDelete && !permissions.canReport && (
                  <View style={styles.noActions}>
                    <Text style={styles.noActionsText}>
                      Không có tùy chọn khả dụng
                    </Text>
                  </View>
                )}
              </View>
            ) : (
              /* Report Form */
              <ScrollView style={styles.reportContainer}>
                <View style={styles.warningBox}>
                  <AlertTriangle size={18} color={COLORS.warning} />
                  <Text style={styles.warningText}>
                    Vui lòng chọn lý do báo cáo bình luận này
                  </Text>
                </View>

                {/* Report Reasons */}
                {reportReasons.map((reason) => (
                  <TouchableOpacity
                    key={reason.id}
                    style={[
                      styles.reasonItem,
                      selectedReason?.id === reason.id && styles.reasonItemActive,
                    ]}
                    onPress={() => setSelectedReason(reason)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.reasonContent}>
                      <Text
                        style={[
                          styles.reasonLabel,
                          selectedReason?.id === reason.id && styles.reasonLabelActive,
                        ]}
                      >
                        {reason.label}
                      </Text>
                      <Text style={styles.reasonDescription}>
                        {reason.description}
                      </Text>
                    </View>
                    {selectedReason?.id === reason.id && (
                      <CheckCircle size={20} color={COLORS.purple} />
                    )}
                  </TouchableOpacity>
                ))}

                {/* Additional details for "other" */}
                {selectedReason?.id === 'other' && (
                  <View style={styles.detailsContainer}>
                    <TextInput
                      style={styles.detailsInput}
                      placeholder="Mô tả lý do báo cáo..."
                      placeholderTextColor={COLORS.textMuted}
                      value={reportDetails}
                      onChangeText={setReportDetails}
                      multiline
                      maxLength={500}
                      textAlignVertical="top"
                    />
                  </View>
                )}

                {/* Submit Button */}
                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    (!selectedReason || loading) && styles.submitButtonDisabled,
                  ]}
                  onPress={handleSubmitReport}
                  disabled={!selectedReason || loading}
                  activeOpacity={0.8}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color={COLORS.textPrimary} />
                  ) : (
                    <Text style={styles.submitButtonText}>Gửi báo cáo</Text>
                  )}
                </TouchableOpacity>

                {/* Back Button */}
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => {
                    setMode('actions');
                    setSelectedReason(null);
                    setReportDetails('');
                  }}
                >
                  <Text style={styles.backButtonText}>Quay lại</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </BlurView>
        </Animated.View>
      </View>
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
  sheet: {
    borderTopLeftRadius: GLASS.borderRadius,
    borderTopRightRadius: GLASS.borderRadius,
    overflow: 'hidden',
    maxHeight: SCREEN_HEIGHT * 0.75,
  },
  blurContainer: {
    backgroundColor: GLASS.background,
    paddingBottom: 34,
  },
  header: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginBottom: SPACING.sm,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  closeButton: {
    position: 'absolute',
    right: SPACING.lg,
    top: SPACING.lg,
    padding: SPACING.xs,
  },
  loadingContainer: {
    padding: SPACING.xxl,
    alignItems: 'center',
  },
  actionsContainer: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionText: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  actionLabel: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.textPrimary,
  },
  actionSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  noActions: {
    padding: SPACING.xxl,
    alignItems: 'center',
  },
  noActionsText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
  },
  reportContainer: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 184, 0, 0.1)',
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  warningText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.warning,
  },
  reasonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: SPACING.sm,
  },
  reasonItemActive: {
    borderColor: COLORS.purple,
    backgroundColor: 'rgba(106, 91, 255, 0.1)',
  },
  reasonContent: {
    flex: 1,
  },
  reasonLabel: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.textSecondary,
  },
  reasonLabelActive: {
    color: COLORS.textPrimary,
  },
  reasonDescription: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  detailsContainer: {
    marginTop: SPACING.md,
  },
  detailsInput: {
    backgroundColor: INPUT.background,
    borderRadius: INPUT.borderRadius,
    borderWidth: 1,
    borderColor: INPUT.borderColor,
    padding: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textPrimary,
    minHeight: 100,
  },
  submitButton: {
    backgroundColor: COLORS.purple,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  backButton: {
    paddingVertical: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  backButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
  },
});

export default CommentActionSheet;
