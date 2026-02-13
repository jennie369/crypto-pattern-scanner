/**
 * GEM Academy - XP Gain Toast
 * Animated toast notification when XP is earned
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Zap, Star, BookOpen, CheckCircle, Trophy, Flame } from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../utils/tokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Action type icons
const ACTION_ICONS = {
  lesson_complete: BookOpen,
  quiz_pass: CheckCircle,
  quiz_perfect: Star,
  course_complete: Trophy,
  streak_bonus: Flame,
  achievement: Star,
  quest_complete: Zap,
  default: Zap,
};

// Action type colors
const ACTION_COLORS = {
  lesson_complete: COLORS.success,
  quiz_pass: COLORS.cyan,
  quiz_perfect: COLORS.gold,
  course_complete: COLORS.gold,
  streak_bonus: '#FF6B35',
  achievement: COLORS.purple,
  quest_complete: COLORS.gold,
  default: COLORS.cyan,
};

const XPGainToast = ({
  visible = false,
  amount = 0,
  actionType = 'default',
  message = null,
  duration = 2000,
  onHide,
  position = 'top', // 'top' or 'bottom'
}) => {
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const IconComponent = ACTION_ICONS[actionType] || ACTION_ICONS.default;
  const color = ACTION_COLORS[actionType] || ACTION_COLORS.default;

  useEffect(() => {
    if (visible) {
      // Reset
      const startValue = position === 'top' ? -100 : 100;
      slideAnim.setValue(startValue);
      scaleAnim.setValue(0.8);
      opacityAnim.setValue(0);

      // Animate in
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 100,
          friction: 10,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto hide
      const timer = setTimeout(() => {
        animateOut();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const animateOut = () => {
    const endValue = position === 'top' ? -100 : 100;

    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: endValue,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onHide) onHide();
    });
  };

  if (!visible) return null;

  const displayMessage = message || getDefaultMessage(actionType);

  return (
    <Animated.View
      style={[
        styles.container,
        position === 'top' ? styles.containerTop : styles.containerBottom,
        {
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim },
          ],
          opacity: opacityAnim,
        },
      ]}
    >
      <LinearGradient
        colors={[`${color}20`, `${color}10`]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        {/* Icon */}
        <View style={[styles.iconContainer, { backgroundColor: `${color}30` }]}>
          <IconComponent size={20} color={color} strokeWidth={2.5} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={[styles.amount, { color }]}>+{amount} XP</Text>
          <Text style={styles.message} numberOfLines={1}>{displayMessage}</Text>
        </View>

        {/* Glow effect */}
        <View style={[styles.glow, { backgroundColor: color }]} />
      </LinearGradient>
    </Animated.View>
  );
};

const getDefaultMessage = (actionType) => {
  const messages = {
    lesson_complete: 'Hoàn thành bài học',
    quiz_pass: 'Vượt qua quiz',
    quiz_perfect: 'Điểm tuyệt đối!',
    course_complete: 'Hoàn thành khóa học',
    streak_bonus: 'Streak bonus',
    achievement: 'Mở khóa thành tích',
    quest_complete: 'Hoàn thành nhiệm vụ',
  };
  return messages[actionType] || 'XP earned';
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: SPACING.lg,
    right: SPACING.lg,
    zIndex: 9999,
    alignItems: 'center',
  },
  containerTop: {
    top: 60,
  },
  containerBottom: {
    bottom: 100,
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.3)',
    backgroundColor: 'rgba(15, 16, 48, 0.9)',
    maxWidth: SCREEN_WIDTH - SPACING.lg * 2,
    overflow: 'hidden',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  content: {
    flex: 1,
  },
  amount: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  message: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  glow: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 4,
    height: '100%',
    opacity: 0.5,
  },
});

export default XPGainToast;
