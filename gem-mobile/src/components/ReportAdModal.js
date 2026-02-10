/**
 * GEM Mobile - Report Ad Modal Component
 * Facebook-style report/hide ad dialog
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
} from 'react-native';
import {
  X,
  EyeOff,
  Flag,
  AlertTriangle,
  ThumbsDown,
  Ban,
  Shield,
  CheckCircle,
} from 'lucide-react-native';
import { COLORS, SPACING } from '../utils/tokens';

// Report reasons
const REPORT_REASONS = [
  {
    id: 'not_interested',
    icon: ThumbsDown,
    title: 'Không quan tâm',
    description: 'Tôi không muốn thấy loại quảng cáo này',
    type: 'hide',
  },
  {
    id: 'repetitive',
    icon: EyeOff,
    title: 'Thấy quá nhiều lần',
    description: 'Quảng cáo này hiển thị quá thường xuyên',
    type: 'hide',
  },
  {
    id: 'misleading',
    icon: AlertTriangle,
    title: 'Gây hiểu lầm hoặc scam',
    description: 'Nội dung quảng cáo không trung thực',
    type: 'report',
  },
  {
    id: 'inappropriate',
    icon: Ban,
    title: 'Nội dung không phù hợp',
    description: 'Quảng cáo chứa nội dung không phù hợp',
    type: 'report',
  },
  {
    id: 'spam',
    icon: Flag,
    title: 'Spam',
    description: 'Đây là spam hoặc quảng cáo lừa đảo',
    type: 'report',
  },
];

/**
 * ReportAdModal - Report/Hide ad dialog
 * @param {boolean} visible - Whether the modal is visible
 * @param {function} onClose - Callback to close the modal
 * @param {function} onHide - Callback when user hides the ad
 * @param {function} onReport - Callback when user reports the ad with reason
 * @param {boolean} loading - Whether an action is in progress
 */
export default function ReportAdModal({
  visible,
  onClose,
  onHide,
  onReport,
  loading = false,
}) {
  const [selectedReason, setSelectedReason] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const handleReasonSelect = async (reason) => {
    setSelectedReason(reason.id);

    if (reason.type === 'hide') {
      await onHide?.();
    } else {
      await onReport?.(reason.id);
    }

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setSelectedReason(null);
      onClose?.();
    }, 1500);
  };

  const handleClose = () => {
    setSelectedReason(null);
    setSubmitted(false);
    onClose?.();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              {submitted ? 'Cảm ơn phản hồi của bạn' : 'Ẩn hoặc báo cáo quảng cáo'}
            </Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <X size={24} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Content */}
          {submitted ? (
            <View style={styles.successContainer}>
              <View style={styles.successIcon}>
                <CheckCircle size={48} color={COLORS.success} />
              </View>
              <Text style={styles.successTitle}>Đã ghi nhận!</Text>
              <Text style={styles.successDescription}>
                Chúng tôi sẽ cải thiện quảng cáo dựa trên phản hồi của bạn.
              </Text>
            </View>
          ) : (
            <View style={styles.content}>
              {/* Info */}
              <View style={styles.infoBox}>
                <Shield size={20} color={COLORS.gold} />
                <Text style={styles.infoText}>
                  Phản hồi của bạn giúp chúng tôi cải thiện trải nghiệm quảng cáo
                </Text>
              </View>

              {/* Report Options */}
              {REPORT_REASONS.map((reason) => {
                const Icon = reason.icon;
                return (
                  <TouchableOpacity
                    key={reason.id}
                    style={[
                      styles.optionItem,
                      selectedReason === reason.id && styles.optionItemSelected,
                    ]}
                    onPress={() => handleReasonSelect(reason)}
                    disabled={loading}
                    activeOpacity={0.7}
                  >
                    <View
                      style={[
                        styles.optionIcon,
                        reason.type === 'report' && styles.optionIconWarning,
                      ]}
                    >
                      <Icon
                        size={20}
                        color={reason.type === 'report' ? COLORS.error : COLORS.textMuted}
                      />
                    </View>
                    <View style={styles.optionContent}>
                      <Text style={styles.optionTitle}>{reason.title}</Text>
                      <Text style={styles.optionDescription}>{reason.description}</Text>
                    </View>
                    {loading && selectedReason === reason.id && (
                      <ActivityIndicator size="small" color={COLORS.gold} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#1C1B23',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34, // Safe area
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 16,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 18,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    gap: 12,
  },
  optionItemSelected: {
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderWidth: 1,
    borderColor: COLORS.gold,
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionIconWarning: {
    backgroundColor: 'rgba(255, 82, 82, 0.1)',
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  optionDescription: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  successIcon: {
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  successDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
  },
});
