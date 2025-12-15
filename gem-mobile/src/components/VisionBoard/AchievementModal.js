/**
 * AchievementModal Component
 * Vision Board Gamification - Achievement Unlock Celebration
 *
 * Features:
 * - Celebration animation when achievement unlocked
 * - Achievement icon, title, description
 * - Points earned display
 * - Confetti effect
 *
 * Design: Liquid Glass theme, dark mode
 */

import React, { memo, useEffect, useRef } from 'react';
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
import { BlurView } from 'expo-blur';
import {
  Flame,
  Star,
  Award,
  Trophy,
  Crown,
  Zap,
  X,
  Sparkles,
} from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, GLASS } from '../../utils/tokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Icon mapping
const ICON_MAP = {
  flame: Flame,
  star: Star,
  award: Award,
  trophy: Trophy,
  crown: Crown,
  zap: Zap,
  sparkles: Sparkles,
};

const AchievementModal = memo(({
  visible,
  onClose,
  achievement,
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible && achievement) {
      // Entrance animation
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();

      // Glow animation loop
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      scaleAnim.setValue(0);
      rotateAnim.setValue(0);
      glowAnim.setValue(0);
    }
  }, [visible, achievement]);

  if (!achievement) return null;

  const IconComponent = ICON_MAP[achievement.icon] || Star;

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <BlurView intensity={40} tint="dark" style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        <Animated.View
          style={[
            styles.container,
            { transform: [{ scale: scaleAnim }] },
          ]}
        >
          <LinearGradient
            colors={['rgba(15, 16, 48, 0.95)', 'rgba(15, 16, 48, 0.85)']}
            style={styles.gradient}
          >
            {/* Close button */}
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X size={24} color={COLORS.textMuted} />
            </TouchableOpacity>

            {/* Achievement icon with glow */}
            <View style={styles.iconContainer}>
              <Animated.View
                style={[
                  styles.iconGlow,
                  { opacity: glowOpacity },
                ]}
              />
              <Animated.View
                style={[
                  styles.iconCircle,
                  { transform: [{ rotate: rotateInterpolate }] },
                ]}
              >
                <LinearGradient
                  colors={[COLORS.gold, COLORS.purple]}
                  style={styles.iconGradient}
                >
                  <IconComponent size={48} color="#FFF" />
                </LinearGradient>
              </Animated.View>
            </View>

            {/* Title */}
            <Text style={styles.congratsText}>Chúc mừng!</Text>
            <Text style={styles.title}>{achievement.title}</Text>
            <Text style={styles.description}>{achievement.description}</Text>

            {/* Points */}
            <View style={styles.pointsContainer}>
              <Zap size={20} color={COLORS.gold} fill={COLORS.gold} />
              <Text style={styles.pointsText}>+{achievement.points}</Text>
              <Text style={styles.pointsLabel}>điểm</Text>
            </View>

            {/* Continue button */}
            <TouchableOpacity
              style={styles.continueButton}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#9C0612', '#6B0F1A']}
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>Tiếp tục</Text>
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>
      </BlurView>
    </Modal>
  );
});

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    width: SCREEN_WIDTH * 0.85,
    maxWidth: 340,
    borderRadius: GLASS.borderRadius,
    borderWidth: GLASS.borderWidth,
    borderColor: COLORS.gold,
    overflow: 'hidden',
  },
  gradient: {
    padding: SPACING.xxl,
    alignItems: 'center',
  },

  // Close button
  closeButton: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },

  // Icon
  iconContainer: {
    marginBottom: SPACING.lg,
    position: 'relative',
  },
  iconGlow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.gold,
    top: -10,
    left: -10,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
  },
  iconGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Text
  congratsText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.gold,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    marginBottom: SPACING.xs,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.display,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  description: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },

  // Points
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: 'rgba(255, 189, 89, 0.15)',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.xl,
  },
  pointsText: {
    fontSize: TYPOGRAPHY.fontSize.display,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gold,
  },
  pointsLabel: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
  },

  // Button
  continueButton: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  buttonGradient: {
    paddingVertical: SPACING.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.gold,
    borderRadius: 12,
  },
  buttonText: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
});

export default AchievementModal;
