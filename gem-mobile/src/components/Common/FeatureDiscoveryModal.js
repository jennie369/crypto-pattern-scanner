/**
 * Gemral - Feature Discovery Modal
 * Shows contextual feature tips and upgrade prompts
 * Theme-aware with i18n support
 *
 * Features:
 * - Slide-up animation
 * - Icon-based visual cues
 * - Action button with custom text
 * - "Later" dismiss option
 * - Upgrade prompt variant (gold styling)
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
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import {
  X,
  Scan,
  TrendingUp,
  Target,
  Brain,
  Star,
  MessageCircle,
  Award,
  Gift,
  Shield,
  Users,
  Clock,
  Sparkles,
  Crown,
  Zap,
  BookOpen,
  DollarSign,
  Heart,
  Flame,
  Settings,
  Bell,
  Share2,
  ChevronRight,
} from 'lucide-react-native';

import { useSettings } from '../../contexts/SettingsContext';

const { height } = Dimensions.get('window');

// Icon mapping for discovery prompts
const ICON_MAP = {
  scan: Scan,
  trending: TrendingUp,
  target: Target,
  brain: Brain,
  star: Star,
  message: MessageCircle,
  award: Award,
  gift: Gift,
  shield: Shield,
  users: Users,
  clock: Clock,
  sparkles: Sparkles,
  crown: Crown,
  zap: Zap,
  book: BookOpen,
  dollar: DollarSign,
  heart: Heart,
  flame: Flame,
  settings: Settings,
  bell: Bell,
  share: Share2,
};

const FeatureDiscoveryModal = ({
  discovery,
  visible,
  onDismiss,
  onAction,
}) => {
  const { colors, settings, glass, SPACING, TYPOGRAPHY, t } = useSettings();
  const slideAnim = useRef(new Animated.Value(height)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // i18n text
  const upgradeLabel = t('common.upgrade', 'Nâng cấp');
  const exploreLabel = t('common.exploreNow', 'Khám phá ngay');
  const laterLabel = t('common.later', 'Để sau');

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 50,
          friction: 9,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: height,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, slideAnim, fadeAnim]);

  // Theme-aware styles
  const styles = useMemo(() => StyleSheet.create({
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: settings.theme === 'light' ? 'rgba(0, 0, 0, 0.4)' : 'rgba(0, 0, 0, 0.6)',
    },
    container: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
    },
    blurContainer: {
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      overflow: 'hidden',
    },
    content: {
      backgroundColor: settings.theme === 'light' ? colors.bgDarkest : (glass.background || 'rgba(15, 16, 48, 0.95)'),
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      borderWidth: glass.borderWidth || 1,
      borderBottomWidth: 0,
      borderColor: settings.theme === 'light' ? colors.border : `${colors.purple}40`,
      paddingHorizontal: SPACING.xl,
      paddingTop: SPACING.md,
      paddingBottom: SPACING.xxxl,
      alignItems: 'center',
    },
    handle: {
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.textMuted,
      marginBottom: SPACING.xl,
    },
    closeButton: {
      position: 'absolute',
      top: SPACING.md,
      right: SPACING.md,
      padding: SPACING.sm,
      zIndex: 10,
    },
    iconContainer: {
      width: 72,
      height: 72,
      borderRadius: 36,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: SPACING.lg,
    },
    iconContainerUpgrade: {
      backgroundColor: 'transparent',
    },
    iconGradient: {
      width: 72,
      height: 72,
      borderRadius: 36,
      justifyContent: 'center',
      alignItems: 'center',
    },
    upgradeBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.gold,
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.xs,
      borderRadius: 12,
      marginBottom: SPACING.md,
      gap: 4,
    },
    upgradeBadgeText: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      color: colors.bgDarkest,
    },
    title: {
      fontSize: TYPOGRAPHY.fontSize.xxxl,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      color: colors.textPrimary,
      textAlign: 'center',
      marginBottom: SPACING.sm,
    },
    titleUpgrade: {
      color: colors.gold,
    },
    message: {
      fontSize: TYPOGRAPHY.fontSize.lg,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 22,
      marginBottom: SPACING.xl,
      paddingHorizontal: SPACING.md,
    },
    featuresList: {
      width: '100%',
      marginBottom: SPACING.xl,
    },
    featureItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: SPACING.sm,
    },
    featureBullet: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.purple || colors.burgundy,
      marginRight: SPACING.md,
    },
    featureText: {
      fontSize: TYPOGRAPHY.fontSize.lg,
      color: colors.textPrimary,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.purple || colors.burgundy,
      paddingVertical: SPACING.md,
      paddingHorizontal: SPACING.xxl,
      borderRadius: 12,
      width: '100%',
      marginBottom: SPACING.md,
      gap: 8,
    },
    actionButtonUpgrade: {
      backgroundColor: 'transparent',
      padding: 0,
      overflow: 'hidden',
    },
    actionButtonGradient: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: SPACING.md,
      paddingHorizontal: SPACING.xxl,
      borderRadius: 12,
      width: '100%',
      gap: 8,
    },
    actionButtonText: {
      fontSize: TYPOGRAPHY.fontSize.xl,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      color: colors.textPrimary,
    },
    actionButtonTextUpgrade: {
      fontSize: TYPOGRAPHY.fontSize.xl,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      color: colors.bgDarkest,
    },
    laterButton: {
      paddingVertical: SPACING.md,
    },
    laterButtonText: {
      fontSize: TYPOGRAPHY.fontSize.lg,
      color: colors.textMuted,
    },
  }), [colors, settings.theme, glass, SPACING, TYPOGRAPHY]);

  if (!discovery) return null;

  const isUpgrade = discovery?.type === 'upgrade' || discovery?.isUpgrade;
  const IconComponent = ICON_MAP[discovery?.icon] || Sparkles;
  const iconColor = isUpgrade ? colors.gold : (discovery?.iconColor || colors.purple || colors.burgundy);

  const handleAction = () => {
    onAction?.(discovery);
  };

  const handleDismiss = () => {
    onDismiss?.(discovery?.key || discovery?.id);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleDismiss}
    >
      {/* Backdrop */}
      <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={handleDismiss}
        />
      </Animated.View>

      {/* Modal Content */}
      <Animated.View
        style={[
          styles.container,
          { transform: [{ translateY: slideAnim }] },
        ]}
      >
        <BlurView
          intensity={settings.theme === 'light' ? 40 : 80}
          tint={settings.theme === 'light' ? 'light' : 'dark'}
          style={styles.blurContainer}
        >
          <View style={styles.content}>
            {/* Close Button */}
            <TouchableOpacity
              onPress={handleDismiss}
              style={styles.closeButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <X size={20} color={colors.textMuted} />
            </TouchableOpacity>

            {/* Handle indicator */}
            <View style={styles.handle} />

            {/* Icon */}
            <View
              style={[
                styles.iconContainer,
                isUpgrade && styles.iconContainerUpgrade,
                { backgroundColor: `${iconColor}20` },
              ]}
            >
              {isUpgrade ? (
                <LinearGradient
                  colors={[colors.gold, colors.goldBright || '#FFD700']}
                  style={styles.iconGradient}
                >
                  <IconComponent size={32} color={colors.bgDarkest} />
                </LinearGradient>
              ) : (
                <IconComponent size={32} color={iconColor} />
              )}
            </View>

            {/* Badge for Upgrade */}
            {isUpgrade && (
              <View style={styles.upgradeBadge}>
                <Crown size={12} color={colors.bgDarkest} />
                <Text style={styles.upgradeBadgeText}>{upgradeLabel}</Text>
              </View>
            )}

            {/* Title */}
            <Text style={[styles.title, isUpgrade && styles.titleUpgrade]}>
              {discovery?.title || ''}
            </Text>

            {/* Message */}
            <Text style={styles.message}>
              {discovery?.message || discovery?.description || ''}
            </Text>

            {/* Features list (if provided) */}
            {(discovery?.features || []).length > 0 && (
              <View style={styles.featuresList}>
                {(discovery?.features || []).map((feature, index) => (
                  <View key={index} style={styles.featureItem}>
                    <View style={styles.featureBullet} />
                    <Text style={styles.featureText}>{feature || ''}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Action Button */}
            <TouchableOpacity
              onPress={handleAction}
              style={[
                styles.actionButton,
                isUpgrade && styles.actionButtonUpgrade,
              ]}
              activeOpacity={0.8}
            >
              {isUpgrade ? (
                <LinearGradient
                  colors={[colors.gold, colors.goldBright || '#FFD700']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.actionButtonGradient}
                >
                  <Text style={styles.actionButtonTextUpgrade}>
                    {discovery?.actionText || exploreLabel}
                  </Text>
                  <ChevronRight size={18} color={colors.bgDarkest} />
                </LinearGradient>
              ) : (
                <>
                  <Text style={styles.actionButtonText}>
                    {discovery?.actionText || exploreLabel}
                  </Text>
                  <ChevronRight size={18} color={colors.textPrimary} />
                </>
              )}
            </TouchableOpacity>

            {/* Later Button */}
            <TouchableOpacity
              onPress={handleDismiss}
              style={styles.laterButton}
              activeOpacity={0.7}
            >
              <Text style={styles.laterButtonText}>{laterLabel}</Text>
            </TouchableOpacity>
          </View>
        </BlurView>
      </Animated.View>
    </Modal>
  );
};

export default FeatureDiscoveryModal;
