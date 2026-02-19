/**
 * Gemral - Link Order Screen (V4 - Secure with OTP)
 * Liên kết đơn hàng thủ công với xác thực email OTP
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Dimensions,
  DeviceEventEmitter,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import CustomAlert, { useCustomAlert } from '../../components/CustomAlert';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import {
  ArrowLeft,
  Link as LinkIcon,
  Mail,
  Hash,
  Info,
  Send,
  Shield,
  CheckCircle,
  Clock,
} from 'lucide-react-native';
import { useAuth } from '../../contexts/AuthContext';
import {
  linkOrderByNumber,
  linkOrderAfterVerification,
  requestEmailVerification,
  verifyEmailOTP,
} from '../../services/orderService';
import { COLORS, SPACING, TYPOGRAPHY, GRADIENTS } from '../../utils/tokens';
import { FORCE_REFRESH_EVENT } from '../../utils/loadingStateManager';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// OTP Input component
const OTPInput = ({ value, onChange, length = 6, disabled }) => {
  const inputRefs = useRef([]);
  const [localValue, setLocalValue] = useState(Array(length).fill(''));

  useEffect(() => {
    if (value) {
      const chars = value.split('').slice(0, length);
      setLocalValue([...chars, ...Array(length - chars.length).fill('')]);
    }
  }, [value, length]);

  const handleChange = (text, index) => {
    if (disabled) return;

    const newValue = [...localValue];
    newValue[index] = text.replace(/[^0-9]/g, '').slice(-1);
    setLocalValue(newValue);
    onChange(newValue.join(''));

    // Auto-focus next input
    if (text && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (disabled) return;

    if (e.nativeEvent.key === 'Backspace' && !localValue[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (text) => {
    if (disabled) return;

    const digits = text.replace(/[^0-9]/g, '').slice(0, length);
    const newValue = [...digits.split(''), ...Array(length - digits.length).fill('')];
    setLocalValue(newValue);
    onChange(newValue.join(''));

    // Focus last filled input
    if (digits.length > 0) {
      const focusIndex = Math.min(digits.length, length - 1);
      inputRefs.current[focusIndex]?.focus();
    }
  };

  return (
    <View style={styles.otpContainer}>
      {Array(length).fill(0).map((_, index) => (
        <TextInput
          key={index}
          ref={(ref) => (inputRefs.current[index] = ref)}
          style={[
            styles.otpInput,
            localValue[index] && styles.otpInputFilled,
            disabled && styles.otpInputDisabled,
          ]}
          value={localValue[index]}
          onChangeText={(text) => handleChange(text, index)}
          onKeyPress={(e) => handleKeyPress(e, index)}
          keyboardType="number-pad"
          maxLength={1}
          selectTextOnFocus
          editable={!disabled}
          onPaste={(e) => handlePaste(e.nativeEvent.text)}
        />
      ))}
    </View>
  );
};

const LinkOrderScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { alert, AlertComponent } = useCustomAlert();
  const insets = useSafeAreaInsets();

  // ========== STATE ==========
  const [orderNumber, setOrderNumber] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [linkType, setLinkType] = useState('order'); // 'order' or 'email'

  // Verification state
  const [verificationStep, setVerificationStep] = useState('input'); // 'input' | 'otp' | 'success'
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [emailVerified, setEmailVerified] = useState(false);

  // Rule 31: Recovery listener for app resume
  useEffect(() => {
    const listener = DeviceEventEmitter.addListener(FORCE_REFRESH_EVENT, () => {
      console.log('[LinkOrderScreen] Force refresh received');
      setLoading(false);
      setSendingOtp(false);
    });
    return () => listener.remove();
  }, []);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // ========== HANDLERS ==========
  const handleBack = () => {
    if (verificationStep === 'otp') {
      setVerificationStep('input');
      setOtp('');
    } else {
      navigation.goBack();
    }
  };

  const handleSendOtp = async () => {
    if (!email.trim()) {
      alert({ type: 'error', title: 'Lỗi', message: 'Vui lòng nhập email' });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      alert({ type: 'error', title: 'Lỗi', message: 'Email không hợp lệ' });
      return;
    }

    setSendingOtp(true);
    try {
      const purpose = linkType === 'order' ? 'link_order' : 'link_email';
      const result = await requestEmailVerification(
        user.id,
        email.trim().toLowerCase(),
        purpose,
        linkType === 'order' ? orderNumber.trim() : null
      );

      if (result.success) {
        setOtpSent(true);
        setVerificationStep('otp');
        setCountdown(60); // 60 seconds resend cooldown
        alert({
          type: 'success',
          title: 'Đã gửi mã OTP',
          message: `Mã xác thực đã được gửi đến ${email}. Vui lòng kiểm tra hộp thư.`,
        });
      } else {
        alert({ type: 'error', title: 'Lỗi', message: result.message });
      }
    } catch (error) {
      alert({ type: 'error', title: 'Lỗi', message: error.message || 'Không thể gửi mã OTP' });
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      alert({ type: 'error', title: 'Lỗi', message: 'Vui lòng nhập đủ 6 số mã OTP' });
      return;
    }

    setLoading(true);
    try {
      const purpose = linkType === 'order' ? 'link_order' : 'link_email';
      const verifyResult = await verifyEmailOTP(
        user.id,
        email.trim().toLowerCase(),
        otp,
        purpose
      );

      if (!verifyResult.success) {
        alert({ type: 'error', title: 'Lỗi', message: verifyResult.message });
        setLoading(false);
        return;
      }

      setEmailVerified(true);

      // If linking order, complete the order link
      if (linkType === 'order' && orderNumber.trim()) {
        const linkResult = await linkOrderAfterVerification(
          user.id,
          orderNumber.trim(),
          email.trim().toLowerCase()
        );

        if (linkResult.success) {
          setVerificationStep('success');
          alert({
            type: 'success',
            title: 'Thành công',
            message: linkResult.message,
            buttons: [{ text: 'OK', onPress: () => navigation.goBack() }],
          });
        } else {
          alert({ type: 'error', title: 'Lỗi', message: linkResult.message });
        }
      } else {
        // Just email verification
        setVerificationStep('success');
        alert({
          type: 'success',
          title: 'Thành công',
          message: 'Email đã được xác thực và liên kết thành công!',
          buttons: [{ text: 'OK', onPress: () => navigation.goBack() }],
        });
      }
    } catch (error) {
      alert({ type: 'error', title: 'Lỗi', message: error.message || 'Không thể xác thực' });
    } finally {
      setLoading(false);
    }
  };

  const handleLinkOrder = async () => {
    if (!orderNumber.trim()) {
      alert({ type: 'error', title: 'Lỗi', message: 'Vui lòng nhập số đơn hàng' });
      return;
    }
    if (!email.trim()) {
      alert({ type: 'error', title: 'Lỗi', message: 'Vui lòng nhập email đặt hàng' });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      alert({ type: 'error', title: 'Lỗi', message: 'Email không hợp lệ' });
      return;
    }

    setLoading(true);
    try {
      const result = await linkOrderByNumber(
        user.id,
        orderNumber.trim(),
        email.trim().toLowerCase()
      );

      if (result.requiresVerification) {
        // Need to verify email first
        alert({
          type: 'info',
          title: 'Cần xác thực',
          message: result.message,
          buttons: [
            { text: 'Gửi mã OTP', onPress: handleSendOtp },
            { text: 'Hủy', style: 'cancel' },
          ],
        });
      } else if (result.success) {
        alert({
          type: 'success',
          title: 'Thành công',
          message: result.message,
          buttons: [{ text: 'OK', onPress: () => navigation.goBack() }],
        });
      } else {
        alert({ type: 'error', title: 'Lỗi', message: result.message });
      }
    } catch (error) {
      alert({ type: 'error', title: 'Lỗi', message: error.message || 'Không thể liên kết đơn hàng' });
    } finally {
      setLoading(false);
    }
  };

  const handleLinkEmail = async () => {
    if (!email.trim()) {
      alert({ type: 'error', title: 'Lỗi', message: 'Vui lòng nhập email' });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      alert({ type: 'error', title: 'Lỗi', message: 'Email không hợp lệ' });
      return;
    }

    // Always require OTP for email linking
    handleSendOtp();
  };

  // ========== RENDER OTP VERIFICATION STEP ==========
  const renderOtpStep = () => (
    <View style={styles.otpStepContainer}>
      {/* OTP Header */}
      <View style={styles.otpHeader}>
        <View style={styles.otpIconContainer}>
          <Shield size={32} color={COLORS.gold} />
        </View>
        <Text style={styles.otpTitle}>Nhập mã xác thực</Text>
        <Text style={styles.otpSubtitle}>
          Mã OTP gồm 6 chữ số đã được gửi đến:{'\n'}
          <Text style={styles.otpEmail}>{email}</Text>
        </Text>
      </View>

      {/* OTP Input */}
      <OTPInput
        value={otp}
        onChange={setOtp}
        length={6}
        disabled={loading}
      />

      {/* Countdown / Resend */}
      <View style={styles.resendContainer}>
        {countdown > 0 ? (
          <View style={styles.countdownRow}>
            <Clock size={16} color={COLORS.textMuted} />
            <Text style={styles.countdownText}>
              Gửi lại sau {countdown}s
            </Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.resendButton}
            onPress={handleSendOtp}
            disabled={sendingOtp}
          >
            {sendingOtp ? (
              <ActivityIndicator size="small" color={COLORS.gold} />
            ) : (
              <>
                <Send size={16} color={COLORS.gold} />
                <Text style={styles.resendText}>Gửi lại mã</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Verify Button */}
      <TouchableOpacity
        style={[styles.submitButton, (loading || otp.length < 6) && styles.submitButtonDisabled]}
        onPress={handleVerifyOtp}
        disabled={loading || otp.length < 6}
      >
        {loading ? (
          <ActivityIndicator color={COLORS.bgDarkest} />
        ) : (
          <>
            <CheckCircle size={20} color={COLORS.bgDarkest} />
            <Text style={styles.submitText}>Xác nhận</Text>
          </>
        )}
      </TouchableOpacity>

      {/* Security note */}
      <View style={styles.securityNote}>
        <Shield size={14} color={COLORS.textMuted} />
        <Text style={styles.securityNoteText}>
          Mã OTP chỉ có hiệu lực trong 15 phút. Không chia sẻ mã này với bất kỳ ai.
        </Text>
      </View>
    </View>
  );

  // ========== MAIN RENDER ==========
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={GRADIENTS.background}
        locations={GRADIENTS.backgroundLocations}
        style={styles.gradientBg}
      >
        <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <ArrowLeft size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {verificationStep === 'otp' ? 'Xác thực email' : 'Liên kết đơn hàng'}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {verificationStep === 'otp' ? (
            renderOtpStep()
          ) : (
            <>
              {/* Tab Selector */}
              <View style={styles.tabContainer}>
                <TouchableOpacity
                  style={[styles.tab, linkType === 'order' && styles.tabActive]}
                  onPress={() => setLinkType('order')}
                >
                  <Hash
                    size={18}
                    color={linkType === 'order' ? COLORS.bgDarkest : COLORS.textMuted}
                  />
                  <Text
                    style={[styles.tabText, linkType === 'order' && styles.tabTextActive]}
                  >
                    Theo số đơn
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.tab, linkType === 'email' && styles.tabActive]}
                  onPress={() => setLinkType('email')}
                >
                  <Mail
                    size={18}
                    color={linkType === 'email' ? COLORS.bgDarkest : COLORS.textMuted}
                  />
                  <Text
                    style={[styles.tabText, linkType === 'email' && styles.tabTextActive]}
                  >
                    Theo email
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Instructions */}
              <View style={styles.instructions}>
                <Info size={20} color={COLORS.gold} />
                <Text style={styles.instructionText}>
                  {linkType === 'order'
                    ? 'Nhập số đơn hàng và email đã dùng khi đặt hàng. Bạn sẽ nhận mã OTP qua email để xác thực.'
                    : 'Liên kết email để tự động hiển thị tất cả đơn hàng. Bạn sẽ nhận mã OTP qua email để xác thực.'}
                </Text>
              </View>

              {/* Security Banner */}
              <View style={styles.securityBanner}>
                <Shield size={18} color={COLORS.cyan} />
                <Text style={styles.securityBannerText}>
                  Xác thực OTP bảo vệ thông tin đơn hàng của bạn
                </Text>
              </View>

              {/* Form */}
              <View style={styles.form}>
                {linkType === 'order' && (
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>
                      Số đơn hàng <Text style={styles.required}>*</Text>
                    </Text>
                    <View style={styles.inputWrapper}>
                      <Hash size={20} color={COLORS.textMuted} />
                      <TextInput
                        style={styles.input}
                        value={orderNumber}
                        onChangeText={setOrderNumber}
                        placeholder="VD: 1001 hoặc #1001 hoặc GEM-1001"
                        placeholderTextColor={COLORS.textMuted}
                        keyboardType="default"
                        autoCapitalize="none"
                        autoCorrect={false}
                      />
                    </View>
                    <Text style={styles.inputHint}>
                      Nhập số đơn hàng từ email Shopify (VD: 1001, #1001, GEM-1001)
                    </Text>
                  </View>
                )}

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>
                    Email đặt hàng <Text style={styles.required}>*</Text>
                  </Text>
                  <View style={styles.inputWrapper}>
                    <Mail size={20} color={COLORS.textMuted} />
                    <TextInput
                      style={styles.input}
                      value={email}
                      onChangeText={setEmail}
                      placeholder="email@example.com"
                      placeholderTextColor={COLORS.textMuted}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>
                  <Text style={styles.inputHint}>
                    Email bạn đã dùng khi mua hàng trên Shopify
                  </Text>
                </View>
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                onPress={linkType === 'order' ? handleLinkOrder : handleLinkEmail}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={COLORS.bgDarkest} />
                ) : (
                  <>
                    <LinkIcon size={20} color={COLORS.bgDarkest} />
                    <Text style={styles.submitText}>
                      {linkType === 'order' ? 'Liên kết đơn hàng' : 'Gửi mã xác thực'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              {/* Help Section */}
              <View style={styles.helpSection}>
                <Text style={styles.helpTitle}>Câu hỏi thường gặp</Text>

                <View style={styles.helpItem}>
                  <Text style={styles.helpQuestion}>Tại sao cần xác thực OTP?</Text>
                  <Text style={styles.helpAnswer}>
                    Xác thực OTP bảo vệ thông tin đơn hàng của bạn, đảm bảo chỉ chủ
                    sở hữu email mới có thể xem và liên kết đơn hàng.
                  </Text>
                </View>

                <View style={styles.helpItem}>
                  <Text style={styles.helpQuestion}>Tìm số đơn hàng ở đâu?</Text>
                  <Text style={styles.helpAnswer}>
                    Kiểm tra email xác nhận đơn hàng từ Shopify. Số đơn hàng thường
                    bắt đầu bằng # (ví dụ: #1001).
                  </Text>
                </View>

                <View style={styles.helpItem}>
                  <Text style={styles.helpQuestion}>
                    Không nhận được mã OTP?
                  </Text>
                  <Text style={styles.helpAnswer}>
                    Kiểm tra hộp thư spam/junk. Nếu vẫn không nhận được sau 2 phút,
                    nhấn "Gửi lại mã" để nhận mã mới.
                  </Text>
                </View>
              </View>
            </>
          )}

          <View style={{ height: insets.bottom + 100 }} />
        </ScrollView>
      </KeyboardAvoidingView>
      {AlertComponent}
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientBg: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.glassBorder,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: SPACING.md,
  },

  // Tab Selector
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.glassBg,
    borderRadius: 8,
    padding: 4,
    marginBottom: SPACING.lg,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    borderRadius: 6,
  },
  tabActive: {
    backgroundColor: COLORS.gold,
  },
  tabText: {
    marginLeft: SPACING.xs,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
  },
  tabTextActive: {
    color: COLORS.bgDarkest,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },

  // Instructions
  instructions: {
    flexDirection: 'row',
    padding: SPACING.md,
    backgroundColor: COLORS.glassBg,
    borderRadius: 8,
    marginBottom: SPACING.md,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.gold,
  },
  instructionText: {
    flex: 1,
    marginLeft: SPACING.sm,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
    lineHeight: 20,
  },

  // Security Banner
  securityBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
    borderRadius: 8,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.2)',
  },
  securityBannerText: {
    flex: 1,
    marginLeft: SPACING.sm,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.cyan,
  },

  // Form
  form: {
    marginBottom: SPACING.lg,
  },
  inputGroup: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  required: {
    color: COLORS.error,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.glassBg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    paddingHorizontal: SPACING.md,
  },
  input: {
    flex: 1,
    paddingVertical: SPACING.md,
    marginLeft: SPACING.sm,
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textPrimary,
  },
  inputHint: {
    marginTop: SPACING.xs,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },

  // Submit Button
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.gold,
    paddingVertical: SPACING.md,
    borderRadius: 8,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitText: {
    marginLeft: SPACING.sm,
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.bgDarkest,
  },

  // Help Section
  helpSection: {
    marginTop: SPACING.xl,
    padding: SPACING.md,
    backgroundColor: COLORS.glassBg,
    borderRadius: 8,
  },
  helpTitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  helpItem: {
    marginBottom: SPACING.md,
  },
  helpQuestion: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.gold,
    marginBottom: 4,
  },
  helpAnswer: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
    lineHeight: 20,
  },

  // OTP Step
  otpStepContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  otpHeader: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  otpIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  otpTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  otpSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
  otpEmail: {
    color: COLORS.gold,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },

  // OTP Input
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  otpInput: {
    width: 48,
    height: 56,
    borderRadius: 8,
    backgroundColor: COLORS.glassBg,
    borderWidth: 2,
    borderColor: COLORS.glassBorder,
    textAlign: 'center',
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  otpInputFilled: {
    borderColor: COLORS.gold,
    backgroundColor: 'rgba(255, 215, 0, 0.05)',
  },
  otpInputDisabled: {
    opacity: 0.5,
  },

  // Resend
  resendContainer: {
    marginBottom: SPACING.lg,
  },
  countdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countdownText: {
    marginLeft: SPACING.xs,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
  },
  resendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  resendText: {
    marginLeft: SPACING.xs,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.gold,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },

  // Security Note
  securityNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: SPACING.md,
    marginTop: SPACING.lg,
  },
  securityNoteText: {
    flex: 1,
    marginLeft: SPACING.xs,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    lineHeight: 18,
  },
});

export default LinkOrderScreen;
