/**
 * CompletionModal.js
 * Celebration modal for completing activities
 * Created: January 28, 2026
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Animated,
  Easing,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Confetti colors
const CONFETTI_COLORS = [
  COLORS.gold,
  COLORS.primary,
  '#FF6B9D',
  '#9D6BFF',
  '#6BFF9D',
  '#FF9D6B',
];

/**
 * Single confetti piece
 */
const ConfettiPiece = ({ delay, startX }) => {
  const translateY = useRef(new Animated.Value(-20)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  const color = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
  const size = 8 + Math.random() * 8;

  useEffect(() => {
    const animation = Animated.parallel([
      Animated.timing(translateY, {
        toValue: 400,
        duration: 2000 + Math.random() * 1000,
        delay,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(translateX, {
        toValue: (Math.random() - 0.5) * 100,
        duration: 2000,
        delay,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: true,
      }),
      Animated.timing(rotate, {
        toValue: 360 * (2 + Math.random() * 2),
        duration: 2000,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 2000,
        delay: delay + 1500,
        useNativeDriver: true,
      }),
    ]);

    animation.start();
  }, [delay, translateY, translateX, rotate, opacity]);

  const spin = rotate.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      style={[
        styles.confetti,
        {
          left: startX,
          width: size,
          height: size,
          backgroundColor: color,
          transform: [{ translateY }, { translateX }, { rotate: spin }],
          opacity,
        },
      ]}
    />
  );
};

/**
 * Confetti shower
 */
const ConfettiShower = ({ count = 30 }) => {
  const confettiPieces = Array.from({ length: count }, (_, i) => ({
    id: i,
    startX: Math.random() * SCREEN_WIDTH,
    delay: Math.random() * 500,
  }));

  return (
    <View style={styles.confettiContainer} pointerEvents="none">
      {confettiPieces.map((piece) => (
        <ConfettiPiece
          key={piece.id}
          startX={piece.startX}
          delay={piece.delay}
        />
      ))}
    </View>
  );
};

/**
 * CompletionModal Component
 */
const CompletionModal = ({
  visible,
  onClose,
  type = 'ritual', // 'ritual', 'goal', 'streak', 'achievement'
  title,
  message,
  xpEarned,
  streak,
  badge,
  showConfetti = true,
  autoClose = true,
  autoCloseDelay = 3000,
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  // Animation on show
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto close
      if (autoClose) {
        const timer = setTimeout(onClose, autoCloseDelay);
        return () => clearTimeout(timer);
      }
    } else {
      scaleAnim.setValue(0);
      opacityAnim.setValue(0);
    }
  }, [visible, autoClose, autoCloseDelay, onClose, scaleAnim, opacityAnim]);

  // Type configurations
  const typeConfig = {
    ritual: {
      icon: 'sparkles',
      colors: [COLORS.gold, '#FFB800'],
      defaultTitle: 'Nghi thức hoàn thành!',
    },
    goal: {
      icon: 'flag',
      colors: [COLORS.success, '#00C853'],
      defaultTitle: 'Mục tiêu đạt được!',
    },
    streak: {
      icon: 'flame',
      colors: ['#FF6B00', '#FF2D00'],
      defaultTitle: 'Streak tăng!',
    },
    achievement: {
      icon: 'trophy',
      colors: [COLORS.primary, COLORS.gold],
      defaultTitle: 'Thành tựu mới!',
    },
  };

  const config = typeConfig[type] || typeConfig.ritual;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        {/* Confetti */}
        {showConfetti && visible && <ConfettiShower />}

        {/* Modal content */}
        <Animated.View
          style={[
            styles.modalContainer,
            {
              opacity: opacityAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <TouchableOpacity activeOpacity={1}>
            {/* Icon badge */}
            <View style={styles.iconContainer}>
              <LinearGradient
                colors={config.colors}
                style={styles.iconGradient}
              >
                {badge ? (
                  <Text style={styles.badgeEmoji}>{badge}</Text>
                ) : (
                  <Ionicons
                    name={config.icon}
                    size={40}
                    color={COLORS.white}
                  />
                )}
              </LinearGradient>
            )}
            </View>

            {/* Title */}
            <Text style={styles.title}>
              {title || config.defaultTitle}
            </Text>

            {/* Message */}
            {message && (
              <Text style={styles.message}>{message}</Text>
            )}

            {/* XP earned */}
            {xpEarned > 0 && (
              <View style={styles.xpContainer}>
                <Ionicons name="star" size={20} color={COLORS.gold} />
              )}
                <Text style={styles.xpText}>+{xpEarned} XP</Text>
              )}
              </View>
            )}

            {/* Streak info */}
            {streak > 0 && (
              <View style={styles.streakContainer}>
                <Ionicons name="flame" size={20} color="#FF6B00" />
                <Text style={styles.streakText}>{streak} ngày liên tiếp</Text>
              )}
              </View>
            )}

            {/* Close button */}
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>Tuyệt vời!</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
};

/**
 * Quick toast-style completion notification
 */
export const CompletionToast = ({
  visible,
  message,
  xpEarned,
  onHide,
}) => {
  const translateY = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.spring(translateY, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.delay(2000),
        Animated.timing(translateY, {
          toValue: -100,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => onHide?.());
    }
  }, [visible, translateY, onHide]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.toast,
        { transform: [{ translateY }] },
      ]}
    >
      <Ionicons name="checkmark-circle" size={24} color={COLORS.success} />
      <Text style={styles.toastMessage}>{message}</Text>
      {xpEarned > 0 && (
        <View style={styles.toastXP}>
          <Text style={styles.toastXPText}>+{xpEarned}</Text>
          <Ionicons name="star" size={14} color={COLORS.gold} />
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    minWidth: 280,
    maxWidth: SCREEN_WIDTH - 40,
  },
  iconContainer: {
    marginBottom: SPACING.md,
  },
  iconGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeEmoji: {
    fontSize: 40,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  message: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  xpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    marginBottom: SPACING.sm,
  },
  xpText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gold,
    marginLeft: SPACING.xs,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  streakText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: '#FF6B00',
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    marginLeft: SPACING.xs,
  },
  closeButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    marginTop: SPACING.sm,
  },
  closeButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.white,
  },

  // Confetti
  confettiContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  confetti: {
    position: 'absolute',
    top: 0,
    borderRadius: 2,
  },

  // Toast
  toast: {
    position: 'absolute',
    top: 60,
    left: SPACING.md,
    right: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  toastMessage: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textPrimary,
    marginLeft: SPACING.sm,
  },
  toastXP: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
  },
  toastXPText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gold,
    marginRight: 4,
  },
});

export default CompletionModal;
