/**
 * Gemral - Biometric Setup Modal
 * Modal hướng dẫn và setup biometric authentication
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Animated,
  Dimensions,
} from 'react-native';
import {
  Scan,
  Fingerprint,
  Shield,
  CheckCircle,
  XCircle,
  X,
} from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, GLASS, BUTTON } from '../../utils/tokens';
import biometricService from '../../services/biometricService';

const { width } = Dimensions.get('window');

/**
 * BiometricSetupModal - Modal hướng dẫn và setup biometric
 *
 * @param {boolean} visible - Show/hide modal
 * @param {Function} onClose - Callback khi đóng modal
 * @param {Function} onSuccess - Callback khi setup thành công
 * @param {string} email - User email để lưu
 * @param {string} refreshToken - Refresh token để lưu
 */
const BiometricSetupModal = ({
  visible,
  onClose,
  onSuccess,
  email,
  refreshToken,
}) => {
  // ========== STATE ==========
  const [step, setStep] = useState('intro'); // intro, authenticating, success, error
  const [biometricType, setBiometricType] = useState('Face ID');
  const [error, setError] = useState(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.9));

  // ========== EFFECTS ==========
  useEffect(() => {
    if (visible) {
      checkBiometricType();
      setStep('intro');
      setError(null);

      // Animate in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  // ========== CHECK TYPE ==========
  const checkBiometricType = useCallback(async () => {
    const support = await biometricService.checkSupport();
    setBiometricType(support.typeName);
  }, []);

  // ========== HANDLERS ==========
  const handleEnable = useCallback(async () => {
    setStep('authenticating');
    setError(null);

    try {
      const result = await biometricService.enable(email, refreshToken);

      if (result.success) {
        setStep('success');
        // Auto close after success
        setTimeout(() => {
          onSuccess?.(result.typeName);
          onClose?.();
        }, 1500);
      } else {
        setError(result.error);
        setStep('error');
      }
    } catch (err) {
      setError('Không thể bật sinh trắc học');
      setStep('error');
    }
  }, [email, refreshToken, onSuccess, onClose]);

  const handleClose = useCallback(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose?.();
    });
  }, [onClose, fadeAnim, scaleAnim]);

  const handleRetry = useCallback(() => {
    setStep('intro');
    setError(null);
  }, []);

  // ========== RENDER HELPERS ==========
  const IconComponent = biometricType.includes('Face') ||
                        biometricType.includes('khuôn mặt')
    ? Scan
    : Fingerprint;

  const renderIntro = () => (
    <>
      <View style={styles.iconContainer}>
        <IconComponent size={48} color={COLORS.gold} />
      </View>

      <Text style={styles.title}>Bật {biometricType}?</Text>

      <Text style={styles.description}>
        Đăng nhập nhanh hơn với {biometricType}. Thông tin đăng nhập sẽ được mã hoá
        và lưu trữ an toàn trên thiết bị của bạn.
      </Text>

      <View style={styles.benefitsList}>
        <View style={styles.benefitItem}>
          <Shield size={16} color={COLORS.success} />
          <Text style={styles.benefitText}>Bảo mật cao với mã hoá cục bộ</Text>
        </View>
        <View style={styles.benefitItem}>
          <CheckCircle size={16} color={COLORS.success} />
          <Text style={styles.benefitText}>Đăng nhập chỉ với 1 chạm</Text>
        </View>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleClose}
        >
          <Text style={styles.secondaryButtonText}>Để sau</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleEnable}
        >
          <Text style={styles.primaryButtonText}>Bật ngay</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  const renderAuthenticating = () => (
    <>
      <View style={styles.iconContainer}>
        <ActivityIndicator size="large" color={COLORS.gold} />
      </View>

      <Text style={styles.title}>Đang xác thực...</Text>

      <Text style={styles.description}>
        Vui lòng xác thực bằng {biometricType} để tiếp tục
      </Text>
    </>
  );

  const renderSuccess = () => (
    <>
      <View style={[styles.iconContainer, styles.successIcon]}>
        <CheckCircle size={48} color={COLORS.success} />
      </View>

      <Text style={styles.title}>Đã bật thành công!</Text>

      <Text style={styles.description}>
        Từ giờ bạn có thể đăng nhập nhanh bằng {biometricType}
      </Text>
    </>
  );

  const renderError = () => (
    <>
      <View style={[styles.iconContainer, styles.errorIcon]}>
        <XCircle size={48} color={COLORS.error} />
      </View>

      <Text style={styles.title}>Không thể bật</Text>

      <Text style={styles.description}>
        {error || 'Đã có lỗi xảy ra. Vui lòng thử lại.'}
      </Text>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleClose}
        >
          <Text style={styles.secondaryButtonText}>Đóng</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleRetry}
        >
          <Text style={styles.primaryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  // ========== MAIN RENDER ==========
  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <Animated.View
        style={[
          styles.overlay,
          { opacity: fadeAnim },
        ]}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={handleClose}
        />

        <Animated.View
          style={[
            styles.modalContainer,
            { transform: [{ scale: scaleAnim }] },
          ]}
        >
          {/* Close button */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleClose}
          >
            <X size={20} color={COLORS.textMuted} />
          </TouchableOpacity>

          {/* Content based on step */}
          {step === 'intro' && renderIntro()}
          {step === 'authenticating' && renderAuthenticating()}
          {step === 'success' && renderSuccess()}
          {step === 'error' && renderError()}
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

// ============================================
// STYLES
// ============================================
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContainer: {
    width: width - 48,
    backgroundColor: 'rgba(15, 16, 48, 0.95)',
    borderRadius: GLASS.borderRadius,
    padding: GLASS.padding,
    alignItems: 'center',
    borderWidth: GLASS.borderWidth,
    borderColor: 'rgba(106, 91, 255, 0.3)',
  },
  closeButton: {
    position: 'absolute',
    top: SPACING.lg,
    right: SPACING.lg,
    padding: SPACING.xs,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 189, 89, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xxl,
    marginTop: SPACING.md,
  },
  successIcon: {
    backgroundColor: 'rgba(58, 247, 166, 0.1)',
  },
  errorIcon: {
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.display,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  description: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SPACING.xxl,
    paddingHorizontal: SPACING.sm,
  },
  benefitsList: {
    width: '100%',
    gap: SPACING.md,
    marginBottom: SPACING.xxxl,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  benefitText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textSecondary,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    width: '100%',
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xxl,
    borderRadius: BUTTON.primary.borderRadius,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textMuted,
  },
  primaryButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xxl,
    borderRadius: BUTTON.primary.borderRadius,
    backgroundColor: COLORS.gold,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.bgDarkest,
  },
});

export default BiometricSetupModal;
