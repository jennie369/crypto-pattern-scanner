/**
 * PartnerOnboarding
 * First-time onboarding tour for new CTV/KOL partners
 * Reference: GEM_PARTNERSHIP_IMPLEMENTATION_PHASE3.md
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import {
  Link,
  BarChart2,
  Gift,
  Users,
  Star,
  ArrowRight,
  Check,
} from 'lucide-react-native';

import { useSettings } from '../../contexts/SettingsContext';
import { CTV_TIER_CONFIG, KOL_CONFIG } from '../../constants/partnershipConstants';

const { width } = Dimensions.get('window');

const PartnerOnboarding = ({ visible, type = 'ctv', onComplete }) => {
  const { colors, gradients, glass, settings, SPACING, TYPOGRAPHY, t } = useSettings();
  const [currentStep, setCurrentStep] = useState(0);

  const CTV_STEPS = useMemo(() => [
    {
      Icon: Star,
      title: 'Chào mừng Đối Tác mới! 🎉',
      description: 'Bạn đã chính thức trở thành CTV Đồng. Hãy bắt đầu hành trình kiếm thu nhập cùng GEM!',
      color: colors.gold,
    },
    {
      Icon: Link,
      title: 'Tạo Link Giới Thiệu',
      description: 'Chia sẻ link affiliate của bạn trên mạng xã hội. Khi có người mua qua link, bạn nhận hoa hồng!',
      color: colors.info,
    },
    {
      Icon: BarChart2,
      title: 'Theo Dõi Doanh Thu',
      description: 'Xem thống kê doanh số, hoa hồng và tiến độ thăng cấp trong Dashboard.',
      color: colors.success,
    },
    {
      Icon: Gift,
      title: 'Trung Tâm Tài Nguyên',
      description: 'Tải banners, videos và templates để quảng bá sản phẩm hiệu quả hơn.',
      color: '#9C27B0',
    },
    {
      Icon: Users,
      title: 'Xây Dựng Đội Nhóm',
      description: 'Giới thiệu người khác đăng ký CTV. Bạn nhận thêm hoa hồng từ doanh số của họ!',
      color: colors.gold,
    },
  ], [colors]);

  const KOL_STEPS = useMemo(() => [
    {
      Icon: Star,
      title: 'Chào mừng KOL Affiliate! ⭐',
      description: 'Bạn đã trở thành KOL với hoa hồng 20% + 3.5% sub-affiliate. Hãy tận dụng tối đa!',
      color: '#9C27B0',
    },
    {
      Icon: Link,
      title: 'Link Affiliate Độc Quyền',
      description: 'Link KOL của bạn được tracking riêng. Share trên tất cả các kênh của bạn!',
      color: colors.info,
    },
    {
      Icon: Gift,
      title: 'KOL Resources',
      description: 'Bạn được truy cập exclusive creative kit và co-marketing opportunities.',
      color: '#9C27B0',
    },
    {
      Icon: BarChart2,
      title: 'Dashboard Nâng Cao',
      description: 'Theo dõi chi tiết conversions, sub-affiliates và earnings realtime.',
      color: colors.success,
    },
    {
      Icon: Users,
      title: 'Sub-Affiliate Network',
      description: 'Mỗi người đăng ký qua link bạn sẽ thành sub-affiliate. Bạn nhận 3.5% từ họ!',
      color: colors.gold,
    },
  ], [colors]);

  const steps = type === 'kol' ? KOL_STEPS : CTV_STEPS;
  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      onComplete?.();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleSkip = () => {
    onComplete?.();
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const Icon = currentStepData.Icon;

  const styles = useMemo(() => StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.85)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: SPACING.lg,
    },
    container: {
      width: '100%',
      maxWidth: 360,
      backgroundColor: settings.theme === 'light' ? colors.bgDarkest : (glass.background || 'rgba(15, 16, 48, 0.95)'),
      borderRadius: 20,
      padding: SPACING.xl,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.gold + '30',
    },
    skipButton: {
      position: 'absolute',
      top: SPACING.md,
      right: SPACING.md,
      padding: SPACING.xs,
    },
    skipText: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: colors.textMuted,
    },
    content: {
      alignItems: 'center',
      marginTop: SPACING.lg,
    },
    iconContainer: {
      width: 100,
      height: 100,
      borderRadius: 50,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: SPACING.lg,
    },
    title: {
      fontSize: TYPOGRAPHY.fontSize.xl,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      color: colors.textPrimary,
      textAlign: 'center',
      marginBottom: SPACING.sm,
    },
    description: {
      fontSize: TYPOGRAPHY.fontSize.md,
      color: colors.textMuted,
      textAlign: 'center',
      lineHeight: 22,
      paddingHorizontal: SPACING.sm,
    },
    progressContainer: {
      flexDirection: 'row',
      marginVertical: SPACING.xl,
    },
    progressDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.border,
      marginHorizontal: 4,
    },
    progressDotActive: {
      backgroundColor: colors.gold,
      width: 24,
    },
    progressDotCompleted: {
      backgroundColor: colors.success,
    },
    buttonContainer: {
      flexDirection: 'row',
      gap: SPACING.sm,
      width: '100%',
    },
    prevButton: {
      flex: 1,
      paddingVertical: SPACING.md,
      paddingHorizontal: SPACING.lg,
      borderRadius: 12,
      backgroundColor: colors.bgDark,
      alignItems: 'center',
    },
    prevButtonText: {
      fontSize: TYPOGRAPHY.fontSize.md,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
      color: colors.textMuted,
    },
    actionButton: {
      flex: 2,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.gold,
      paddingVertical: SPACING.md,
      paddingHorizontal: SPACING.xl,
      borderRadius: 12,
      gap: SPACING.xs,
    },
    actionButtonFull: {
      flex: 1,
    },
    actionButtonText: {
      fontSize: TYPOGRAPHY.fontSize.md,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      color: colors.bgDark,
    },
    stepCounter: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: colors.textMuted,
      marginTop: SPACING.md,
    },
  }), [colors, settings.theme, glass, SPACING, TYPOGRAPHY]);

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Skip button */}
          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipText}>Bo qua</Text>
          </TouchableOpacity>

          {/* Content */}
          <View style={styles.content}>
            <View style={[styles.iconContainer, { backgroundColor: `${currentStepData.color}20` }]}>
              <Icon size={48} color={currentStepData.color} />
            </View>

            <Text style={styles.title}>{currentStepData.title}</Text>
            <Text style={styles.description}>{currentStepData.description}</Text>
          </View>

          {/* Progress dots */}
          <View style={styles.progressContainer}>
            {steps.map((_, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => setCurrentStep(index)}
                style={[
                  styles.progressDot,
                  index === currentStep && styles.progressDotActive,
                  index < currentStep && styles.progressDotCompleted,
                ]}
              />
            ))}
          </View>

          {/* Action buttons */}
          <View style={styles.buttonContainer}>
            {currentStep > 0 && (
              <TouchableOpacity style={styles.prevButton} onPress={handlePrevious}>
                <Text style={styles.prevButtonText}>Truoc</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.actionButton, currentStep === 0 && styles.actionButtonFull]}
              onPress={handleNext}
            >
              <Text style={styles.actionButtonText}>
                {isLastStep ? 'Bat dau ngay!' : 'Tiep theo'}
              </Text>
              {isLastStep ? (
                <Check size={20} color={colors.bgDark} />
              ) : (
                <ArrowRight size={20} color={colors.bgDark} />
              )}
            </TouchableOpacity>
          </View>

          {/* Step counter */}
          <Text style={styles.stepCounter}>
            {currentStep + 1} / {steps.length}
          </Text>
        </View>
      </View>
    </Modal>
  );
};

export default PartnerOnboarding;
