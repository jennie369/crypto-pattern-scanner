/**
 * UpgradeSuccessModal - Welcome popup after successful upgrade
 * Shows congratulations message and what user just unlocked
 */

import React, { useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Crown,
  Star,
  Zap,
  Sparkles,
  Check,
  ArrowRight,
  PartyPopper,
  Gift,
} from 'lucide-react-native';
import { useSettings } from '../../contexts/SettingsContext';
import {
  COURSE_BUNDLES,
  SCANNER_PRODUCTS,
  CHATBOT_PRODUCTS,
  MINDSET_COURSES,
} from '../../constants/productConfig';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * Get product info by tier type and tier name
 */
const getProductInfo = (tierType, tierName) => {
  const normalizedTier = tierName?.toUpperCase();

  if (tierType === 'course' || tierType === 'bundle') {
    return COURSE_BUNDLES[normalizedTier] || COURSE_BUNDLES.TIER1;
  }
  if (tierType === 'scanner') {
    return SCANNER_PRODUCTS[normalizedTier] || SCANNER_PRODUCTS.PRO;
  }
  if (tierType === 'chatbot') {
    return CHATBOT_PRODUCTS[normalizedTier] || CHATBOT_PRODUCTS.PRO;
  }
  if (tierType === 'mindset') {
    const key = Object.keys(MINDSET_COURSES).find(
      k => MINDSET_COURSES[k].name?.includes(tierName)
    );
    return key ? MINDSET_COURSES[key] : null;
  }

  return null;
};

/**
 * Get tier icon based on tier level
 */
const getTierIcon = (tierName) => {
  const tier = tierName?.toUpperCase();
  if (tier === 'VIP' || tier === 'TIER3') return Crown;
  if (tier === 'PREMIUM' || tier === 'TIER2') return Star;
  if (tier === 'PRO' || tier === 'TIER1') return Zap;
  return Sparkles;
};

/**
 * Get tier color based on tier level
 */
const getTierColor = (tierName, colors) => {
  const tier = tierName?.toUpperCase();
  if (tier === 'VIP' || tier === 'TIER3') return '#FFD700';
  if (tier === 'PREMIUM' || tier === 'TIER2') return '#6A5BFF';
  if (tier === 'PRO' || tier === 'TIER1') return '#FFB800';
  return colors.gold;
};

/**
 * UpgradeSuccessModal Component
 */
const UpgradeSuccessModal = ({
  visible,
  onClose,
  tierType = 'course', // 'course', 'scanner', 'chatbot', 'mindset'
  tierName = 'TIER1', // 'TIER1', 'PRO', 'PREMIUM', 'VIP', etc.
  onExplore, // Optional callback to navigate to explore features
}) => {
  const { colors, gradients, glass, settings, SPACING, TYPOGRAPHY, t } = useSettings();

  // Animation refs
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const confettiAnim = useRef(new Animated.Value(0)).current;

  // Get product info
  const productInfo = getProductInfo(tierType, tierName);
  const TierIcon = getTierIcon(tierName);
  const tierColor = getTierColor(tierName, colors);

  // Entrance animation
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.loop(
          Animated.sequence([
            Animated.timing(confettiAnim, {
              toValue: 1,
              duration: 1500,
              useNativeDriver: true,
            }),
            Animated.timing(confettiAnim, {
              toValue: 0,
              duration: 1500,
              useNativeDriver: true,
            }),
          ])
        ),
      ]).start();
    } else {
      scaleAnim.setValue(0.5);
      fadeAnim.setValue(0);
      confettiAnim.setValue(0);
    }
  }, [visible]);

  // Get features to display
  const getFeaturesToDisplay = () => {
    if (productInfo?.includes) {
      return productInfo.includes;
    }
    if (productInfo?.features) {
      return productInfo.features;
    }
    return [];
  };

  const features = getFeaturesToDisplay();

  // Get congratulations message based on tier type
  const getCongratsMessage = () => {
    switch (tierType) {
      case 'course':
      case 'bundle':
        return 'Chào mừng bạn đến với hành trình trở thành trader chuyên nghiệp!';
      case 'scanner':
        return 'Bạn đã mở khóa công cụ quét thị trường mạnh mẽ!';
      case 'chatbot':
        return 'AI trợ lý trading của bạn đã được nâng cấp!';
      case 'mindset':
        return 'Chúc mừng bạn bắt đầu hành trình chuyển hóa tâm linh!';
      default:
        return 'Chào mừng bạn đến với GEM Family!';
    }
  };

  // Get CTA text
  const getCtaText = () => {
    switch (tierType) {
      case 'course':
      case 'bundle':
        return 'Bắt đầu học ngay';
      case 'scanner':
        return 'Quét coin ngay';
      case 'chatbot':
        return 'Chat với AI';
      case 'mindset':
        return 'Bắt đầu học ngay';
      default:
        return 'Khám phá ngay';
    }
  };

  const styles = useMemo(() => StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContainer: {
      width: SCREEN_WIDTH * 0.9,
      maxWidth: 380,
    },
    modalContent: {
      borderRadius: 20,
      padding: SPACING.xl,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: 'rgba(255, 189, 89, 0.3)',
      overflow: 'hidden',
    },
    topBorder: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 4,
    },
    closeButton: {
      position: 'absolute',
      top: SPACING.md,
      right: SPACING.md,
      width: 30,
      height: 30,
      justifyContent: 'center',
      alignItems: 'center',
    },
    closeText: {
      fontSize: 28,
      color: colors.textMuted,
      lineHeight: 28,
    },
    iconContainer: {
      width: 100,
      height: 100,
      borderRadius: 50,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: SPACING.md,
      borderWidth: 2,
      borderColor: 'rgba(255, 189, 89, 0.3)',
    },
    confettiEmoji: {
      fontSize: 32,
      marginBottom: SPACING.sm,
    },
    title: {
      fontSize: TYPOGRAPHY.fontSize.xxl || 28,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      color: colors.textPrimary,
      marginBottom: SPACING.xs,
    },
    tierBadge: {
      fontSize: TYPOGRAPHY.fontSize.xl,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      marginBottom: SPACING.md,
    },
    message: {
      fontSize: TYPOGRAPHY.fontSize.md,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 22,
      marginBottom: SPACING.lg,
      paddingHorizontal: SPACING.sm,
    },
    featuresSection: {
      width: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      borderRadius: 12,
      padding: SPACING.md,
      marginBottom: SPACING.lg,
    },
    featuresTitle: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
      color: colors.gold,
      marginBottom: SPACING.sm,
    },
    featureRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 4,
      gap: SPACING.sm,
    },
    featureText: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: colors.textSecondary,
      flex: 1,
    },
    moreFeatures: {
      fontSize: TYPOGRAPHY.fontSize.xs,
      color: colors.textMuted,
      marginTop: SPACING.xs,
      fontStyle: 'italic',
    },
    buttonContainer: {
      width: '100%',
      gap: SPACING.sm,
    },
    exploreButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: SPACING.md,
      borderRadius: 12,
      gap: SPACING.sm,
    },
    exploreButtonText: {
      fontSize: TYPOGRAPHY.fontSize.md,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      color: colors.bgDarkest,
    },
    laterButton: {
      alignItems: 'center',
      paddingVertical: SPACING.sm,
    },
    laterButtonText: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: colors.textMuted,
    },
  }), [colors, settings.theme, glass, SPACING, TYPOGRAPHY]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.modalContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <LinearGradient
            colors={settings.theme === 'light' ? [colors.bgDarkest, colors.bgDarkest] : ['rgba(26, 26, 46, 0.98)', 'rgba(15, 10, 30, 0.98)']}
            style={styles.modalContent}
          >
            {/* Decorative top border */}
            <View style={[styles.topBorder, { backgroundColor: tierColor }]} />

            {/* Close button */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.closeText}>×</Text>
            </TouchableOpacity>

            {/* Success icon with animation */}
            <Animated.View
              style={[
                styles.iconContainer,
                {
                  backgroundColor: `${tierColor}20`,
                  transform: [
                    {
                      rotate: confettiAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0deg', '10deg'],
                      }),
                    },
                  ],
                },
              ]}
            >
              <TierIcon size={48} color={tierColor} />
            </Animated.View>

            {/* Confetti emoji */}
            <Text style={styles.confettiEmoji}>🎉</Text>

            {/* Title */}
            <Text style={styles.title}>Chúc mừng!</Text>
            <Text style={[styles.tierBadge, { color: tierColor }]}>
              {productInfo?.name || tierName}
            </Text>

            {/* Message */}
            <Text style={styles.message}>{getCongratsMessage()}</Text>

            {/* Features unlocked */}
            {features.length > 0 && (
              <View style={styles.featuresSection}>
                <Text style={styles.featuresTitle}>
                  <Gift size={16} color={colors.gold} /> Bạn đã mở khóa:
                </Text>
                {features.slice(0, 4).map((feature, index) => (
                  <View key={index} style={styles.featureRow}>
                    <Check size={16} color={colors.success} />
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
                {features.length > 4 && (
                  <Text style={styles.moreFeatures}>
                    +{features.length - 4} tính năng khác...
                  </Text>
                )}
              </View>
            )}

            {/* CTA Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.exploreButton, { backgroundColor: tierColor }]}
                onPress={() => {
                  onClose();
                  onExplore?.();
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.exploreButtonText}>{getCtaText()}</Text>
                <ArrowRight size={18} color={colors.bgDarkest} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.laterButton}
                onPress={onClose}
                activeOpacity={0.7}
              >
                <Text style={styles.laterButtonText}>Để sau</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default UpgradeSuccessModal;
