/**
 * ═══════════════════════════════════════════════════════════════════════════
 * INSIGHTS ONBOARDING
 * ROI Proof System - Phase D
 * First-time onboarding modal for Personal Insights feature
 * ═══════════════════════════════════════════════════════════════════════════
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import {
  TrendingUp,
  Users,
  Brain,
  Target,
  X,
} from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, GRADIENTS, POPUP } from '../../utils/tokens';

const ONBOARDING_KEY = '@gem_insights_onboarding_seen';
const { width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * Feature items for onboarding
 */
const FEATURES = [
  {
    icon: TrendingUp,
    title: 'Theo dõi tiến bộ',
    description: 'Xem KPIs quan trọng: Win rate, Kỷ luật, Lợi nhuận',
  },
  {
    icon: Users,
    title: 'So sánh cộng đồng',
    description: 'Biết vị trí của bạn so với các trader khác',
  },
  {
    icon: Brain,
    title: 'Phân tích AI',
    description: 'Nhận insights cá nhân hóa dựa trên dữ liệu của bạn',
  },
  {
    icon: Target,
    title: 'Gợi ý cải thiện',
    description: 'Bước tiếp theo để nâng cao hiệu quả trading',
  },
];

/**
 * InsightsOnboarding Component
 *
 * @param {Object} props
 * @param {boolean} props.visible - Force show modal (for testing)
 * @param {Function} props.onDismiss - Called when modal is dismissed
 */
const InsightsOnboarding = ({ visible: forcedVisible, onDismiss }) => {
  const [visible, setVisible] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);

  // Check if user has seen onboarding
  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        if (forcedVisible !== undefined) {
          setVisible(forcedVisible);
          setHasChecked(true);
          return;
        }

        const seen = await AsyncStorage.getItem(ONBOARDING_KEY);
        if (!seen) {
          setVisible(true);
        }
        setHasChecked(true);
      } catch (error) {
        console.error('[InsightsOnboarding] Check error:', error);
        setHasChecked(true);
      }
    };

    checkOnboarding();
  }, [forcedVisible]);

  // Handle dismiss
  const handleDismiss = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
      setVisible(false);
      onDismiss?.();
    } catch (error) {
      console.error('[InsightsOnboarding] Dismiss error:', error);
      setVisible(false);
    }
  };

  // Handle skip
  const handleSkip = () => {
    handleDismiss();
  };

  if (!hasChecked || !visible) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <BlurView
        style={styles.blurContainer}
        intensity={POPUP.overlay.blurIntensity.ios}
        tint="dark"
      >
        <View style={styles.overlay}>
          <View style={styles.modalContainer}>
            {/* Close button */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleSkip}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <X size={24} color={COLORS.textMuted} />
            </TouchableOpacity>

            {/* Header */}
            <LinearGradient
              colors={GRADIENTS.gold}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.headerGradient}
            >
              <Text style={styles.headerEmoji}>📊</Text>
            </LinearGradient>

            <Text style={styles.title}>Personal Insights</Text>
            <Text style={styles.subtitle}>
              Chứng minh ROI bằng dữ liệu thực
            </Text>

            {/* Features */}
            <View style={styles.featuresContainer}>
              {FEATURES.map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  <View style={styles.featureIcon}>
                    <feature.icon
                      size={20}
                      color={COLORS.gold}
                      strokeWidth={2}
                    />
                  </View>
                  <View style={styles.featureContent}>
                    <Text style={styles.featureTitle}>{feature.title}</Text>
                    <Text style={styles.featureDescription}>
                      {feature.description}
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            {/* CTA Button */}
            <TouchableOpacity
              style={styles.ctaButton}
              onPress={handleDismiss}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={GRADIENTS.primaryButton}
                style={styles.ctaGradient}
              >
                <Text style={styles.ctaText}>Bắt đầu khám phá</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Skip link */}
            <TouchableOpacity
              style={styles.skipButton}
              onPress={handleSkip}
            >
              <Text style={styles.skipText}>Bỏ qua</Text>
            </TouchableOpacity>
          </View>
        </View>
      </BlurView>
    </Modal>
  );
};

/**
 * Hook to check if onboarding has been seen
 */
export const useInsightsOnboarding = () => {
  const [hasSeen, setHasSeen] = useState(true); // Default true to prevent flash

  useEffect(() => {
    const check = async () => {
      try {
        const seen = await AsyncStorage.getItem(ONBOARDING_KEY);
        setHasSeen(!!seen);
      } catch {
        setHasSeen(true);
      }
    };
    check();
  }, []);

  const markAsSeen = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
      setHasSeen(true);
    } catch (error) {
      console.error('[useInsightsOnboarding] markAsSeen error:', error);
    }
  };

  const reset = async () => {
    try {
      await AsyncStorage.removeItem(ONBOARDING_KEY);
      setHasSeen(false);
    } catch (error) {
      console.error('[useInsightsOnboarding] reset error:', error);
    }
  };

  return { hasSeen, markAsSeen, reset };
};

const styles = StyleSheet.create({
  blurContainer: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: POPUP.overlay.backgroundColor,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modalContainer: {
    width: SCREEN_WIDTH - SPACING.lg * 2,
    maxWidth: 340,
    backgroundColor: POPUP.glassCard.backgroundColor,
    borderRadius: POPUP.glassCard.borderRadius,
    borderWidth: POPUP.glassCard.borderWidth,
    borderColor: POPUP.glassCard.borderColor,
    padding: SPACING.xl,
    alignItems: 'center',
  },

  // Close button
  closeButton: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    zIndex: 1,
  },

  // Header
  headerGradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  headerEmoji: {
    fontSize: 28,
  },

  title: {
    fontSize: TYPOGRAPHY.fontSize.display,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },

  // Features
  featuresContainer: {
    width: '100%',
    marginBottom: SPACING.xl,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 189, 89, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  featureDescription: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    lineHeight: 18,
  },

  // CTA Button
  ctaButton: {
    width: '100%',
    marginBottom: SPACING.sm,
  },
  ctaGradient: {
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.gold,
  },
  ctaText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },

  // Skip
  skipButton: {
    paddingVertical: SPACING.sm,
  },
  skipText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textMuted,
  },
});

export default InsightsOnboarding;
