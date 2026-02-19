/**
 * =====================================================
 * ExchangeOnboardingScreen
 * =====================================================
 *
 * 4-step wizard để đăng ký sàn giao dịch:
 * 1. Chọn sàn - Grid cards với exchanges
 * 2. Thông tin sàn - Ưu đãi, features, CTA mở link
 * 3. Xác nhận - Input email đã dùng để đăng ký
 * 4. Hoàn tất - Success, next steps
 *
 * Access: All tiers
 *
 * =====================================================
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Linking,
  DeviceEventEmitter,
} from 'react-native';
import { FORCE_REFRESH_EVENT } from '../../utils/loadingStateManager';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  ChevronRight,
  Check,
  ExternalLink,
  Gift,
  Shield,
  Star,
  Wallet,
  Copy,
  CheckCircle,
  Info,
} from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';

// Theme
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../theme';

// Components
import { ExchangeCard } from '../../components/Exchange';

// Services
import { exchangeAffiliateService } from '../../services/exchangeAffiliateService';

// Constants
import {
  EXCHANGE_ONBOARDING_STEPS,
  getExchangeConfig,
  getAffiliateLink,
} from '../../constants/exchangeConfig';

/**
 * Progress Bar Component
 */
const ProgressBar = ({ currentStep, totalSteps }) => {
  return (
    <View style={styles.progressContainer}>
      {Array.from({ length: totalSteps }).map((_, index) => (
        <View key={index} style={styles.progressItem}>
          <View
            style={[
              styles.progressDot,
              index < currentStep && styles.progressDotCompleted,
              index === currentStep && styles.progressDotActive,
            ]}
          >
            {index < currentStep && <Check size={12} color={COLORS.textPrimary} />}
          </View>
          {index < totalSteps - 1 && (
            <View
              style={[
                styles.progressLine,
                index < currentStep && styles.progressLineCompleted,
              ]}
            />
          )}
        </View>
      ))}
    </View>
  );
};

/**
 * Step 1: Select Exchange
 */
const SelectExchangeStep = ({ exchanges, selectedExchange, onSelect }) => {
  return (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Chọn sàn giao dịch</Text>
      <Text style={styles.stepDescription}>
        Chọn sàn phù hợp với bạn. Đăng ký qua GEM để nhận ưu đãi giảm phí giao dịch.
      </Text>

      <ScrollView style={styles.exchangeList} showsVerticalScrollIndicator={false}>
        {exchanges.map((exchange) => (
          <ExchangeCard
            key={exchange.id}
            exchangeId={exchange.id}
            exchangeConfig={exchange}
            onPress={() => onSelect(exchange)}
          />
        ))}
      </ScrollView>
    </View>
  );
};

/**
 * Step 2: Exchange Info & Open Link
 */
const ExchangeInfoStep = ({ exchange, onOpenLink, linkOpened }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyRef = async () => {
    if (exchange.refCode || exchange.affiliate_ref_code) {
      await Clipboard.setStringAsync(exchange.refCode || exchange.affiliate_ref_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <View style={styles.stepContent}>
      <View style={styles.exchangeHeader}>
        <View style={[styles.exchangeLogo, { backgroundColor: exchange.bgColor || 'rgba(255,255,255,0.1)' }]}>
          <Text style={[styles.exchangeLogoText, { color: exchange.color }]}>
            {exchange.displayName?.charAt(0) || exchange.display_name?.charAt(0)}
          </Text>
        </View>
        <View>
          <Text style={styles.exchangeName}>
            {exchange.displayName || exchange.display_name}
          </Text>
          {(exchange.isRecommended || exchange.is_recommended) && (
            <View style={styles.recommendedBadge}>
              <Star size={10} color={COLORS.gold} fill={COLORS.gold} />
              <Text style={styles.recommendedText}>Sàn khuyên nghị</Text>
            </View>
          )}
        </View>
      </View>

      <Text style={styles.stepDescription}>
        {exchange.description}
      </Text>

      {/* Features */}
      <View style={styles.featuresSection}>
        <Text style={styles.sectionTitle}>Tính năng nổi bật</Text>
        {exchange.features?.map((feature, index) => (
          <View key={index} style={styles.featureRow}>
            <Check size={14} color={COLORS.success} />
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
      </View>

      {/* Commission discount */}
      {(exchange.commission?.userDiscount || exchange.user_fee_discount) && (
        <View style={styles.discountBanner}>
          <Gift size={20} color={COLORS.primary} />
          <View style={styles.discountContent}>
            <Text style={styles.discountTitle}>Ưu đãi khi đăng ký qua GEM</Text>
            <Text style={styles.discountValue}>
              Giảm {((exchange.commission?.userDiscount || exchange.user_fee_discount) * 100).toFixed(0)}% phí giao dịch
            </Text>
          </View>
        </View>
      )}

      {/* Ref Code */}
      <View style={styles.refCodeSection}>
        <Text style={styles.refCodeLabel}>Mã giới thiệu:</Text>
        <TouchableOpacity style={styles.refCodeBox} onPress={handleCopyRef}>
          <Text style={styles.refCodeValue}>
            {exchange.refCode || exchange.affiliate_ref_code}
          </Text>
          {copied ? (
            <Check size={16} color={COLORS.success} />
          ) : (
            <Copy size={16} color={COLORS.textSecondary} />
          )}
        </TouchableOpacity>
      </View>

      {/* Open Link Button */}
      <TouchableOpacity
        style={[styles.primaryButton, linkOpened && styles.primaryButtonSuccess]}
        onPress={onOpenLink}
        activeOpacity={0.8}
      >
        {linkOpened ? (
          <>
            <CheckCircle size={20} color={COLORS.textPrimary} />
            <Text style={styles.primaryButtonText}>Đã mở trang đăng ký</Text>
          </>
        ) : (
          <>
            <ExternalLink size={20} color={COLORS.textPrimary} />
            <Text style={styles.primaryButtonText}>Mở trang đăng ký</Text>
          </>
        )}
      </TouchableOpacity>

      <View style={styles.instructionBox}>
        <Info size={16} color={COLORS.textSecondary} />
        <Text style={styles.instructionText}>
          Sau khi đăng ký thành công, quay lại đây để xác nhận tài khoản.
        </Text>
      </View>
    </View>
  );
};

/**
 * Step 3: Confirm Signup
 */
const ConfirmSignupStep = ({ exchange, email, onEmailChange, onConfirm, loading, error }) => {
  return (
    <View style={styles.stepContent}>
      <View style={styles.confirmHeader}>
        <CheckCircle size={48} color={COLORS.success} />
        <Text style={styles.stepTitle}>Xác nhận đăng ký</Text>
      </View>

      <Text style={styles.stepDescription}>
        Nhập email bạn đã dùng để đăng ký {exchange.displayName || exchange.display_name} để chúng tôi xác nhận và liên kết tài khoản.
      </Text>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Email đăng ký {exchange.displayName || exchange.display_name}</Text>
        <TextInput
          style={styles.textInput}
          value={email}
          onChangeText={onEmailChange}
          placeholder="email@example.com"
          placeholderTextColor={COLORS.textMuted}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>

      <View style={styles.privacyNote}>
        <Shield size={14} color={COLORS.textMuted} />
        <Text style={styles.privacyText}>
          Email chỉ dùng để xác nhận tài khoản, không chia sẻ với bên thứ ba.
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.primaryButton, !email && styles.primaryButtonDisabled]}
        onPress={onConfirm}
        disabled={!email || loading}
        activeOpacity={0.8}
      >
        <Text style={styles.primaryButtonText}>
          {loading ? 'Đang xác nhận...' : 'Xác nhận đăng ký'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

/**
 * Step 4: Complete
 */
const CompleteStep = ({ exchange, onDeposit, onConnectAPI, canConnectAPI, onDone }) => {
  return (
    <View style={styles.stepContent}>
      <View style={styles.successHeader}>
        <View style={styles.successIcon}>
          <CheckCircle size={64} color={COLORS.success} />
        </View>
        <Text style={styles.successTitle}>Đăng ký thành công!</Text>
        <Text style={styles.successDescription}>
          Tài khoản {exchange.displayName || exchange.display_name} đã được liên kết với GEM.
        </Text>
      </View>

      <Text style={styles.nextStepsTitle}>Bước tiếp theo</Text>

      <View style={styles.nextStepsContainer}>
        <TouchableOpacity style={styles.nextStepCard} onPress={onDeposit}>
          <Wallet size={24} color={COLORS.primary} />
          <View style={styles.nextStepContent}>
            <Text style={styles.nextStepTitle}>Nạp tiền vào sàn</Text>
            <Text style={styles.nextStepDescription}>
              Nạp USDT để bắt đầu trade các pattern chất lượng
            </Text>
          </View>
          <ChevronRight size={20} color={COLORS.textSecondary} />
        </TouchableOpacity>

        {canConnectAPI && (
          <TouchableOpacity style={styles.nextStepCard} onPress={onConnectAPI}>
            <Shield size={24} color={COLORS.gold} />
            <View style={styles.nextStepContent}>
              <Text style={styles.nextStepTitle}>Kết nối API</Text>
              <Text style={styles.nextStepDescription}>
                Xem số dư trực tiếp trên GEM (TIER 2+)
              </Text>
            </View>
            <ChevronRight size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity style={styles.doneButton} onPress={onDone}>
        <Text style={styles.doneButtonText}>Hoàn tất</Text>
      </TouchableOpacity>
    </View>
  );
};

/**
 * Main ExchangeOnboardingScreen
 */
const ExchangeOnboardingScreen = ({ navigation, route }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [exchanges, setExchanges] = useState([]);
  const [selectedExchange, setSelectedExchange] = useState(null);
  const [linkOpened, setLinkOpened] = useState(false);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [canConnectAPI, setCanConnectAPI] = useState(false);

  const source = route?.params?.source || 'onboarding';

  // Load exchanges
  useEffect(() => {
    loadExchanges();
  }, []);

  // Rule 31: Recovery listener for app resume
  useEffect(() => {
    const listener = DeviceEventEmitter.addListener(FORCE_REFRESH_EVENT, () => {
      console.log('[ExchangeOnboarding] Force refresh received');
      setLoading(false);
      setTimeout(() => loadExchanges(), 50); // Rule 57: Break React 18 batch
    });
    return () => listener.remove();
  }, []);

  const loadExchanges = async () => {
    try {
      const data = await exchangeAffiliateService.getAllExchanges();
      setExchanges(data);
    } catch (err) {
      console.error('[ExchangeOnboarding] Error loading exchanges:', err);
    }
  };

  // Handle back navigation
  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setError('');
    } else {
      navigation.goBack();
    }
  }, [currentStep, navigation]);

  // Step 1: Select exchange
  const handleSelectExchange = useCallback((exchange) => {
    setSelectedExchange(exchange);
    setCurrentStep(1);
  }, []);

  // Step 2: Open link
  const handleOpenLink = useCallback(async () => {
    if (!selectedExchange) return;

    try {
      const result = await exchangeAffiliateService.openExchangeSignup(
        selectedExchange.id,
        source
      );

      if (result.success) {
        setLinkOpened(true);
      } else if (result.link) {
        // Fallback: try opening link directly
        const canOpen = await Linking.canOpenURL(result.link);
        if (canOpen) {
          await Linking.openURL(result.link);
          setLinkOpened(true);
        } else {
          Alert.alert('Lỗi', 'Không thể mở link. Vui lòng copy mã giới thiệu và đăng ký thủ công.');
        }
      }
    } catch (err) {
      console.error('[ExchangeOnboarding] Error opening link:', err);
      Alert.alert('Lỗi', 'Không thể mở link. Vui lòng thử lại.');
    }
  }, [selectedExchange, source]);

  // Move to confirm step
  const handleContinueToConfirm = useCallback(() => {
    if (linkOpened) {
      setCurrentStep(2);
    }
  }, [linkOpened]);

  // Step 3: Confirm signup
  const handleConfirm = useCallback(async () => {
    if (!email || !selectedExchange) return;

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Email không hợp lệ');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await exchangeAffiliateService.confirmExchangeSignup(
        selectedExchange.id,
        email
      );

      if (result.success) {
        setCurrentStep(3);
      } else {
        setError(result.error || 'Không thể xác nhận. Vui lòng thử lại.');
      }
    } catch (err) {
      console.error('[ExchangeOnboarding] Error confirming:', err);
      setError('Lỗi hệ thống. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, [email, selectedExchange]);

  // Step 4 actions
  const handleDeposit = useCallback(async () => {
    if (!selectedExchange) return;
    const link = getAffiliateLink(selectedExchange.id, 'deposit');
    if (link) {
      await Linking.openURL(link);
    }
  }, [selectedExchange]);

  const handleConnectAPI = useCallback(() => {
    navigation.navigate('APIConnection', {
      exchangeId: selectedExchange?.id,
    });
  }, [navigation, selectedExchange]);

  const handleDone = useCallback(() => {
    navigation.navigate('ExchangeAccounts');
  }, [navigation]);

  // Render current step
  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <SelectExchangeStep
            exchanges={exchanges}
            selectedExchange={selectedExchange}
            onSelect={handleSelectExchange}
          />
        );
      case 1:
        return (
          <ExchangeInfoStep
            exchange={selectedExchange}
            onOpenLink={handleOpenLink}
            linkOpened={linkOpened}
          />
        );
      case 2:
        return (
          <ConfirmSignupStep
            exchange={selectedExchange}
            email={email}
            onEmailChange={setEmail}
            onConfirm={handleConfirm}
            loading={loading}
            error={error}
          />
        );
      case 3:
        return (
          <CompleteStep
            exchange={selectedExchange}
            onDeposit={handleDeposit}
            onConnectAPI={handleConnectAPI}
            canConnectAPI={canConnectAPI}
            onDone={handleDone}
          />
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ArrowLeft size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đăng ký sàn giao dịch</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Progress */}
      <ProgressBar currentStep={currentStep} totalSteps={4} />

      {/* Step indicator */}
      <View style={styles.stepIndicator}>
        <Text style={styles.stepIndicatorText}>
          {EXCHANGE_ONBOARDING_STEPS[currentStep]?.title}
        </Text>
      </View>

      {/* Content */}
      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {renderStep()}
        </ScrollView>

        {/* Continue button for Step 1 */}
        {currentStep === 1 && linkOpened && (
          <View style={styles.bottomButton}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleContinueToConfirm}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>Tiếp tục xác nhận</Text>
              <ChevronRight size={20} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgDarkest,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  backButton: {
    padding: SPACING.xs,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  headerRight: {
    width: 32,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
  },
  progressItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressDotActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  progressDotCompleted: {
    borderColor: COLORS.success,
    backgroundColor: COLORS.success,
  },
  progressLine: {
    width: 40,
    height: 2,
    backgroundColor: COLORS.border,
    marginHorizontal: 4,
  },
  progressLineCompleted: {
    backgroundColor: COLORS.success,
  },
  stepIndicator: {
    alignItems: 'center',
    paddingBottom: SPACING.sm,
  },
  stepIndicatorText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: 100,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  stepDescription: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: SPACING.lg,
  },
  exchangeList: {
    flex: 1,
  },
  // Step 2 styles
  exchangeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  exchangeLogo: {
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  exchangeLogoText: {
    fontSize: 28,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  exchangeName: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  recommendedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  recommendedText: {
    fontSize: 11,
    color: '#FFD700',
  },
  featuresSection: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: 6,
  },
  featureText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textPrimary,
  },
  discountBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(106, 91, 255, 0.1)',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  discountContent: {
    flex: 1,
  },
  discountTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  },
  discountValue: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.primary,
  },
  refCodeSection: {
    marginBottom: SPACING.lg,
  },
  refCodeLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  refCodeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
  },
  refCodeValue: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.primary,
    letterSpacing: 1,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  primaryButtonSuccess: {
    backgroundColor: COLORS.success,
  },
  primaryButtonDisabled: {
    backgroundColor: COLORS.surface,
    opacity: 0.6,
  },
  primaryButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  instructionBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  instructionText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  // Step 3 styles
  confirmHeader: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  inputContainer: {
    marginBottom: SPACING.lg,
  },
  inputLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  textInput: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  errorText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#EF4444',
    marginTop: SPACING.xs,
  },
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.lg,
  },
  privacyText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.textMuted,
  },
  // Step 4 styles
  successHeader: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  successIcon: {
    marginBottom: SPACING.md,
  },
  successTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.success,
    marginBottom: SPACING.sm,
  },
  successDescription: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  nextStepsTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  nextStepsContainer: {
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  nextStepCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    gap: SPACING.md,
  },
  nextStepContent: {
    flex: 1,
  },
  nextStepTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  nextStepDescription: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  },
  doneButton: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  doneButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  bottomButton: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.md,
    backgroundColor: COLORS.bgDarkest,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
});

export default ExchangeOnboardingScreen;
