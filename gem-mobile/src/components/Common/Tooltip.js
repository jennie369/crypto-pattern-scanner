/**
 * Gemral - Tooltip Component
 *
 * Displays feature discovery tooltips and tutorials
 * Animated modal with icon, title, description
 * Theme-aware with i18n support
 */

import React, { useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Modal,
} from 'react-native';
import { BlurView } from 'expo-blur';
import {
  X,
  Scan,
  Sparkles,
  Briefcase,
  Users,
  ShoppingBag,
  GraduationCap,
  Layers,
  BookOpen,
  HelpCircle,
  ChevronRight,
} from 'lucide-react-native';

import { useSettings } from '../../contexts/SettingsContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Icon mapping
const ICONS = {
  Scan,
  Sparkles,
  Briefcase,
  Users,
  ShoppingBag,
  GraduationCap,
  Layers,
  BookOpen,
  HelpCircle,
};

const Tooltip = ({
  visible,
  title,
  description,
  icon = 'HelpCircle',
  ctaText, // Will use i18n default
  position = 'bottom', // 'top', 'bottom', 'center'
  onDismiss,
  onCTA,
  showSkip = false,
  onSkip,
  tourStep, // Current tour step (1-based)
  totalSteps, // Total steps in tour
}) => {
  const { colors, settings, glass, SPACING, TYPOGRAPHY, t } = useSettings();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // i18n text with fallbacks
  const ctaLabel = ctaText || t('common.understood', 'Đã hiểu!');
  const skipLabel = t('common.skip', 'Bỏ qua');
  const stepLabel = t('common.step', 'Bước');

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 50,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const IconComponent = ICONS[icon] || HelpCircle;

  const getPositionStyle = () => {
    switch (position) {
      case 'top':
        return { justifyContent: 'flex-start', paddingTop: 100 };
      case 'center':
        return { justifyContent: 'center' };
      case 'bottom':
      default:
        return { justifyContent: 'flex-end', paddingBottom: 120 };
    }
  };

  // Theme-aware styles
  const styles = useMemo(() => StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: settings.theme === 'light' ? 'rgba(0, 0, 0, 0.4)' : 'rgba(0, 0, 0, 0.6)',
    },
    backdrop: {
      flex: 1,
      paddingHorizontal: SPACING.lg,
    },
    container: {
      backgroundColor: settings.theme === 'light' ? colors.glassBg : colors.bgMid,
      borderRadius: glass.borderRadius || 20,
      padding: SPACING.xl,
      borderWidth: 1,
      borderColor: settings.theme === 'light' ? colors.border : 'rgba(255, 189, 89, 0.2)',
      maxWidth: SCREEN_WIDTH - 32,
      ...(settings.theme === 'light' ? {
        shadowColor: glass.shadowColor,
        shadowOffset: glass.shadowOffset,
        shadowOpacity: glass.shadowOpacity,
        shadowRadius: glass.shadowRadius,
        elevation: glass.elevation,
      } : {}),
    },
    closeButton: {
      position: 'absolute',
      top: SPACING.sm,
      right: SPACING.sm,
      padding: 8,
      zIndex: 10,
    },
    iconContainer: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: 'rgba(255, 189, 89, 0.15)',
      justifyContent: 'center',
      alignItems: 'center',
      alignSelf: 'center',
      marginBottom: SPACING.lg,
    },
    tourProgress: {
      backgroundColor: 'rgba(255, 189, 89, 0.15)',
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.xs,
      borderRadius: 12,
      alignSelf: 'center',
      marginBottom: SPACING.md,
    },
    tourProgressText: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
      color: colors.gold,
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
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 22,
      marginBottom: SPACING.xl,
    },
    actions: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: SPACING.md,
    },
    skipButton: {
      paddingVertical: SPACING.md,
      paddingHorizontal: SPACING.lg,
      borderRadius: 12,
      backgroundColor: settings.theme === 'light' ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.05)',
    },
    skipText: {
      fontSize: TYPOGRAPHY.fontSize.md,
      color: colors.textMuted,
      fontWeight: TYPOGRAPHY.fontWeight.medium,
    },
    ctaButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
      paddingVertical: SPACING.md,
      paddingHorizontal: SPACING.xl,
      borderRadius: 12,
      backgroundColor: colors.gold,
      flex: 1,
      maxWidth: 200,
    },
    ctaButtonSmall: {
      flex: 0,
    },
    ctaText: {
      fontSize: TYPOGRAPHY.fontSize.md,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
      color: colors.bgDarkest,
    },
  }), [colors, settings.theme, glass, SPACING, TYPOGRAPHY]);

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onDismiss}>
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <BlurView
          intensity={settings.theme === 'light' ? 20 : 40}
          tint={settings.theme === 'light' ? 'light' : 'dark'}
          style={StyleSheet.absoluteFill}
        />

        <TouchableOpacity
          style={[styles.backdrop, getPositionStyle()]}
          activeOpacity={1}
          onPress={onDismiss}
        >
          <Animated.View
            style={[
              styles.container,
              {
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
              {/* Close button */}
              <TouchableOpacity style={styles.closeButton} onPress={onDismiss}>
                <X size={20} color={colors.textMuted} />
              </TouchableOpacity>

              {/* Icon */}
              <View style={styles.iconContainer}>
                <IconComponent size={32} color={colors.gold} />
              </View>

              {/* Tour Progress */}
              {tourStep && totalSteps && (
                <View style={styles.tourProgress}>
                  <Text style={styles.tourProgressText}>
                    {stepLabel} {tourStep}/{totalSteps}
                  </Text>
                </View>
              )}

              {/* Content */}
              <Text style={styles.title}>{title || ''}</Text>
              <Text style={styles.description}>{description || ''}</Text>

              {/* Actions */}
              <View style={styles.actions}>
                {showSkip && (
                  <TouchableOpacity style={styles.skipButton} onPress={onSkip || onDismiss}>
                    <Text style={styles.skipText}>{skipLabel}</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={[styles.ctaButton, showSkip && styles.ctaButtonSmall]}
                  onPress={onCTA || onDismiss}
                >
                  <Text style={styles.ctaText}>{ctaLabel}</Text>
                  <ChevronRight size={18} color={colors.bgDarkest} />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Animated.View>
    </Modal>
  );
};

export default Tooltip;
