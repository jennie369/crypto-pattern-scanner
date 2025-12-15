/**
 * Gemral - Tooltip Component
 *
 * Displays feature discovery tooltips and tutorials
 * Animated modal with icon, title, description
 */

import React, { useEffect, useRef } from 'react';
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

import { COLORS, SPACING, TYPOGRAPHY, GLASS } from '../../utils/tokens';

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
  ctaText = 'Đã hiểu!',
  position = 'bottom', // 'top', 'bottom', 'center'
  onDismiss,
  onCTA,
  showSkip = false,
  onSkip,
  tourStep, // Current tour step (1-based)
  totalSteps, // Total steps in tour
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

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

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onDismiss}>
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />

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
                <X size={20} color={COLORS.textMuted} />
              </TouchableOpacity>

              {/* Icon */}
              <View style={styles.iconContainer}>
                <IconComponent size={32} color={COLORS.gold} />
              </View>

              {/* Tour Progress */}
              {tourStep && totalSteps && (
                <View style={styles.tourProgress}>
                  <Text style={styles.tourProgressText}>
                    Bước {tourStep}/{totalSteps}
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
                    <Text style={styles.skipText}>Bỏ qua</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={[styles.ctaButton, showSkip && styles.ctaButtonSmall]}
                  onPress={onCTA || onDismiss}
                >
                  <Text style={styles.ctaText}>{ctaText}</Text>
                  <ChevronRight size={18} color={COLORS.bgDark} />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  backdrop: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  container: {
    backgroundColor: COLORS.bgMid,
    borderRadius: 20,
    padding: SPACING.xl,
    ...GLASS,
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.2)',
    maxWidth: SCREEN_WIDTH - 32,
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
    color: COLORS.gold,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  description: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
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
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  skipText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
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
    backgroundColor: COLORS.gold,
    flex: 1,
    maxWidth: 200,
  },
  ctaButtonSmall: {
    flex: 0,
  },
  ctaText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.bgDark,
  },
});

export default Tooltip;
