/**
 * Pro Scanner Benefit Modal
 * Shows when user is eligible for free Pro Scanner from trading course landing page
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { tradingLeadsService } from '../../services/tradingLeadsService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ProScannerBenefitModal = ({
  visible,
  onClose,
  onActivated,
  benefitInfo,
  userEmail,
  userId,
}) => {
  const [loading, setLoading] = useState(false);
  const [activated, setActivated] = useState(false);
  const [error, setError] = useState(null);
  const [activationResult, setActivationResult] = useState(null);

  const handleActivate = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await tradingLeadsService.activateProScanner(userEmail, userId);

      if (result.success) {
        setActivated(true);
        setActivationResult(result);
        await tradingLeadsService.markBenefitChecked();

        if (onActivated) {
          onActivated(result);
        }
      } else {
        setError(result.error || 'Không thể kích hoạt. Vui lòng thử lại.');
      }
    } catch (err) {
      setError('Có lỗi xảy ra. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = async () => {
    await tradingLeadsService.markBenefitChecked();
    onClose();
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // Success screen after activation
  if (activated && activationResult) {
    return (
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={handleClose}
      >
        <View style={styles.overlay}>
          <View style={styles.modalContainer}>
            <LinearGradient
              colors={['#1a472a', '#0d2818']}
              style={styles.successGradient}
            >
              <View style={styles.iconContainer}>
                <Ionicons name="checkmark-circle" size={80} color="#22c55e" />
              </View>

              <Text style={styles.successTitle}>KÍCH HOẠT THÀNH CÔNG!</Text>

              <View style={styles.benefitBox}>
                <Text style={styles.benefitLabel}>PRO Scanner của bạn</Text>
                <Text style={styles.benefitDays}>
                  {activationResult.days || 30} NGÀY
                </Text>
                <Text style={styles.benefitExpiry}>
                  Hết hạn: {formatDate(activationResult.expiresAt)}
                </Text>
              </View>

              <View style={styles.featuresContainer}>
                <Text style={styles.featuresTitle}>Tính năng PRO bao gồm:</Text>
                {[
                  'Quét pattern không giới hạn',
                  'Multi-timeframe analysis',
                  'AI Trade Assessment',
                  'Paper Trading không giới hạn',
                  'Thông báo real-time',
                ].map((feature, index) => (
                  <View key={index} style={styles.featureRow}>
                    <Ionicons name="checkmark" size={16} color="#22c55e" />
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity style={styles.doneButton} onPress={handleClose}>
                <Text style={styles.doneButtonText}>BẮT ĐẦU SỬ DỤNG</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </View>
      </Modal>
    );
  }

  // Main modal - show benefit offer
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <LinearGradient
            colors={['#9C0612', '#2d0a0e']}
            style={styles.gradient}
          >
            {/* Close button */}
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>

            {/* Gift icon */}
            <View style={styles.giftIconContainer}>
              <Text style={styles.giftEmoji}>🎁</Text>
            </View>

            {/* Title */}
            <Text style={styles.title}>QUÀ TẶNG ĐẶC BIỆT!</Text>
            <Text style={styles.subtitle}>
              Bạn là người thứ{' '}
              <Text style={styles.highlight}>#{benefitInfo?.queueNumber}</Text>
              {'\n'}trong 50 người đầu tiên đăng ký!
            </Text>

            {/* Benefit box */}
            <View style={styles.offerBox}>
              <View style={styles.offerRow}>
                <Ionicons name="analytics" size={24} color="#FFBD59" />
                <View style={styles.offerTextContainer}>
                  <Text style={styles.offerTitle}>PRO Scanner</Text>
                  <Text style={styles.offerValue}>
                    {benefitInfo?.scannerDays || 30} ngày miễn phí
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              <Text style={styles.offerNote}>
                Trị giá <Text style={styles.strikethrough}>500.000đ</Text>{' '}
                <Text style={styles.freeText}>MIỄN PHÍ</Text>
              </Text>
            </View>

            {/* Error message */}
            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Activate button */}
            <TouchableOpacity
              style={styles.activateButton}
              onPress={handleActivate}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#9C0612" size="small" />
              ) : (
                <>
                  <Ionicons name="gift" size={20} color="#9C0612" />
                  <Text style={styles.activateButtonText}>NHẬN NGAY</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Skip link */}
            <TouchableOpacity onPress={handleClose} style={styles.skipButton}>
              <Text style={styles.skipText}>Để sau</Text>
            </TouchableOpacity>

            {/* Email note */}
            <Text style={styles.emailNote}>
              Email đăng ký: {userEmail}
            </Text>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: SCREEN_WIDTH - 40,
    maxWidth: 400,
    borderRadius: 20,
    overflow: 'hidden',
  },
  gradient: {
    padding: 24,
    alignItems: 'center',
  },
  successGradient: {
    padding: 24,
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  giftIconContainer: {
    marginBottom: 16,
  },
  giftEmoji: {
    fontSize: 60,
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#22c55e',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  highlight: {
    color: '#FFBD59',
    fontWeight: '700',
    fontSize: 18,
  },
  offerBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    borderWidth: 2,
    borderColor: '#FFBD59',
    marginBottom: 20,
  },
  offerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  offerTextContainer: {
    marginLeft: 12,
  },
  offerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  offerValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFBD59',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 189, 89, 0.3)',
    marginVertical: 12,
  },
  offerNote: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  strikethrough: {
    textDecorationLine: 'line-through',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  freeText: {
    color: '#22c55e',
    fontWeight: '700',
  },
  errorContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
    width: '100%',
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 13,
    textAlign: 'center',
  },
  activateButton: {
    backgroundColor: '#FFBD59',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    gap: 8,
  },
  activateButtonText: {
    color: '#9C0612',
    fontSize: 16,
    fontWeight: '800',
  },
  skipButton: {
    marginTop: 12,
    padding: 8,
  },
  skipText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 13,
  },
  emailNote: {
    marginTop: 16,
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.4)',
  },
  // Success screen styles
  benefitBox: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
  benefitLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 4,
  },
  benefitDays: {
    fontSize: 32,
    fontWeight: '900',
    color: '#22c55e',
    marginBottom: 4,
  },
  benefitExpiry: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  featuresContainer: {
    width: '100%',
    marginBottom: 20,
  },
  featuresTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  featureText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  doneButton: {
    backgroundColor: '#22c55e',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
    width: '100%',
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
});

export default ProScannerBenefitModal;
