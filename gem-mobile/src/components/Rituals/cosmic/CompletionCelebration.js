/**
 * CompletionCelebration - ELEGANT REDESIGN
 * Minimalist, premium design with subtle animations
 * Includes reflection input modal
 */

import React, { useEffect, useState, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedReaction,
  withTiming,
  withSpring,
  withDelay,
  withSequence,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Check, Flame, Star, ChevronRight, X, Send, PenLine } from 'lucide-react-native';

import {
  COSMIC_COLORS,
  COSMIC_SPACING,
  COSMIC_RADIUS,
} from '../../../theme/cosmicTokens';
import { COSMIC_TIMING } from '../../../utils/cosmicAnimations';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ============================================
// RITUAL THEMES
// ============================================

const RITUAL_THEMES = {
  heart: {
    icon: '💖',
    color: COSMIC_COLORS.ritualThemes.heart.primary,
    gradient: COSMIC_COLORS.ritualThemes.heart.gradient,
    title: 'Mở Rộng Trái Tim',
  },
  gratitude: {
    icon: '🙏',
    color: COSMIC_COLORS.ritualThemes.gratitude.primary,
    gradient: COSMIC_COLORS.ritualThemes.gratitude.gradient,
    title: 'Tri Ân',
  },
  breath: {
    icon: '🌬️',
    color: COSMIC_COLORS.ritualThemes.breath.primary,
    gradient: COSMIC_COLORS.ritualThemes.breath.gradient,
    title: 'Hơi Thở Thanh Lọc',
  },
  water: {
    icon: '💧',
    color: COSMIC_COLORS.ritualThemes.water.primary,
    gradient: COSMIC_COLORS.ritualThemes.water.gradient,
    title: 'Lập Trình Nước',
  },
  letter: {
    icon: '✉️',
    color: COSMIC_COLORS.ritualThemes.letter.primary,
    gradient: COSMIC_COLORS.ritualThemes.letter.gradient,
    title: 'Thư Gửi Vũ Trụ',
  },
  burn: {
    icon: '🔥',
    color: COSMIC_COLORS.ritualThemes.burn.primary,
    gradient: COSMIC_COLORS.ritualThemes.burn.gradient,
    title: 'Đốt Cháy & Giải Phóng',
  },
  star: {
    icon: '⭐',
    color: COSMIC_COLORS.ritualThemes.star.primary,
    gradient: ['#FFFFFF', '#E0E0E0', '#C0C0C0'],
    title: 'Điều Ước Sao Băng',
  },
};

// ============================================
// FLOATING PARTICLES - Subtle background effect
// ============================================

const FloatingParticle = React.memo(({ delay, size, x, color }) => {
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(0.6, { duration: 500 }));
    translateY.value = withDelay(
      delay,
      withTiming(-100, { duration: 4000 + Math.random() * 2000, easing: Easing.linear })
    );
    opacity.value = withDelay(delay + 3000, withTiming(0, { duration: 1000 }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.floatingParticle,
        {
          left: x,
          width: size,
          height: size,
          backgroundColor: color,
          borderRadius: size / 2,
        },
        animatedStyle,
      ]}
    />
  );
});

// ============================================
// ELEGANT CHECKMARK
// ============================================

const ElegantCheckmark = React.memo(({ color, gradient, delay }) => {
  const scale = useSharedValue(0);
  const ringScale = useSharedValue(0.8);
  const ringOpacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withDelay(
      delay,
      withSpring(1, { damping: 12, stiffness: 100 })
    );
    ringScale.value = withDelay(delay + 200, withTiming(1.4, { duration: 600 }));
    ringOpacity.value = withDelay(delay + 200, withSequence(
      withTiming(0.5, { duration: 200 }),
      withTiming(0, { duration: 400 })
    ));
  }, [delay]);

  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringScale.value }],
    opacity: ringOpacity.value,
  }));

  return (
    <View style={styles.checkmarkWrapper}>
      <Animated.View style={[styles.checkmarkRing, { borderColor: color }, ringStyle]} />
      <Animated.View style={checkStyle}>
        <LinearGradient
          colors={gradient}
          style={styles.checkmarkCircle}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Check size={28} color="#FFF" strokeWidth={3} />
        </LinearGradient>
      </Animated.View>
    </View>
  );
});

// ============================================
// XP DISPLAY - Compact & Elegant
// ============================================

const XPDisplay = React.memo(({ xp, delay, color }) => {
  const [displayXP, setDisplayXP] = useState(0);
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const xpProgress = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 300 }));
    scale.value = withDelay(delay, withSpring(1, { damping: 15, stiffness: 150 }));
    xpProgress.value = withDelay(delay, withTiming(1, {
      duration: 800,
      easing: Easing.out(Easing.cubic),
    }));
  }, [xp, delay]);

  useAnimatedReaction(
    () => xpProgress.value,
    (progress) => {
      const currentXP = Math.round(xp * progress);
      runOnJS(setDisplayXP)(currentXP);
    },
    [xp]
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.xpWrapper, animatedStyle]}>
      <View style={[styles.xpBadge, { backgroundColor: color + '20' }]}>
        <Star size={14} color={color} fill={color} />
        <Text style={[styles.xpText, { color }]}>+{displayXP} XP</Text>
      </View>
    </Animated.View>
  );
});

// ============================================
// STREAK DISPLAY - Inline & Minimal
// ============================================

const StreakDisplay = React.memo(({ streak, isNewRecord, delay }) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(10);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 300 }));
    translateY.value = withDelay(delay, withSpring(0, { damping: 15 }));
  }, [delay]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  if (!streak || streak < 1) return null;

  return (
    <Animated.View style={[styles.streakWrapper, animatedStyle]}>
      <View style={styles.streakInline}>
        <Flame size={16} color={COSMIC_COLORS.glow.orange} fill={COSMIC_COLORS.glow.orange} />
        <Text style={styles.streakText}>
          <Text style={styles.streakNumber}>{streak}</Text> ngày liên tiếp
        </Text>
        {isNewRecord && (
          <View style={styles.recordBadge}>
            <Text style={styles.recordText}>MỚI</Text>
          </View>
        )}
      </View>
    </Animated.View>
  );
});

// ============================================
// ELEGANT BUTTON
// ============================================

const ElegantButton = React.memo(({ label, onPress, variant = 'primary', color, delay, icon }) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 300 }));
    translateY.value = withDelay(delay, withSpring(0, { damping: 15 }));
  }, [delay]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const isPrimary = variant === 'primary';

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        style={[
          styles.elegantButton,
          isPrimary && { backgroundColor: color },
          !isPrimary && styles.outlineButton,
        ]}
      >
        {icon && !isPrimary && icon}
        <Text style={[
          styles.buttonText,
          isPrimary && styles.primaryButtonText,
          !isPrimary && { color: COSMIC_COLORS.text.secondary },
        ]}>
          {label}
        </Text>
        {isPrimary && <ChevronRight size={18} color="#FFF" />}
      </TouchableOpacity>
    </Animated.View>
  );
});

// ============================================
// REFLECTION INPUT VIEW
// ============================================

const ReflectionInput = React.memo(({ visible, onClose, onSubmit, color, ritualTitle }) => {
  const [text, setText] = useState('');
  const inputRef = useRef(null);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(50);

  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 300 });
      translateY.value = withSpring(0, { damping: 15 });
      setTimeout(() => inputRef.current?.focus(), 400);
    } else {
      opacity.value = withTiming(0, { duration: 200 });
      translateY.value = withTiming(50, { duration: 200 });
    }
  }, [visible]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const handleSubmit = () => {
    if (text.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onSubmit?.(text.trim());
    }
    setText('');
    onClose();
  };

  if (!visible) return null;

  return (
    <Animated.View style={[styles.reflectionOverlay, containerStyle]}>
      <TouchableOpacity
        style={styles.reflectionBackdrop}
        activeOpacity={1}
        onPress={() => {
          Keyboard.dismiss();
          onClose();
        }}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.reflectionKeyboard}
      >
        <Animated.View style={[styles.reflectionCard, cardStyle]}>
          {/* Header */}
          <View style={styles.reflectionHeader}>
            <View style={styles.reflectionTitleRow}>
              <PenLine size={20} color={color} />
              <Text style={styles.reflectionTitle}>Suy ngẫm</Text>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <X size={22} color={COSMIC_COLORS.text.muted} />
            </TouchableOpacity>
          </View>

          <Text style={styles.reflectionSubtitle}>
            Ghi lại cảm xúc sau {ritualTitle}
          </Text>

          {/* Input */}
          <View style={[styles.reflectionInputContainer, { borderColor: color + '40' }]}>
            <TextInput
              ref={inputRef}
              style={styles.reflectionTextInput}
              placeholder="Tôi cảm thấy..."
              placeholderTextColor={COSMIC_COLORS.text.hint}
              multiline
              value={text}
              onChangeText={setText}
              maxLength={500}
            />
          </View>

          <Text style={styles.reflectionCharCount}>{text.length}/500</Text>

          {/* Actions */}
          <View style={styles.reflectionActions}>
            <TouchableOpacity
              style={styles.reflectionCancelBtn}
              onPress={onClose}
            >
              <Text style={styles.reflectionCancelText}>Bỏ qua</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.reflectionSubmitBtn, { backgroundColor: color }]}
              onPress={handleSubmit}
              disabled={!text.trim()}
            >
              <Send size={16} color="#FFF" />
              <Text style={styles.reflectionSubmitText}>Lưu</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Animated.View>
  );
});

// ============================================
// MAIN COMPONENT
// ============================================

const CompletionCelebration = ({
  ritualType = 'heart',
  xpEarned = 50,
  streakCount = 0,
  isNewRecord = false,
  message = 'Bạn đã hoàn thành nghi lễ!',
  onContinue,
  onAddToVisionBoard,
  onWriteReflection,
  showVisionBoardButton = true,
  showReflectionButton = true,
  visible = true,
  style,
}) => {
  const theme = RITUAL_THEMES[ritualType] || RITUAL_THEMES.heart;
  const [showReflectionInput, setShowReflectionInput] = useState(false);

  // Animation values
  const containerOpacity = useSharedValue(0);
  const contentOpacity = useSharedValue(0);

  // Generate floating particles
  const particles = useMemo(() =>
    Array.from({ length: 8 }, (_, i) => ({
      id: i,
      delay: 500 + i * 300,
      size: 3 + Math.random() * 4,
      x: Math.random() * SCREEN_WIDTH,
      color: i % 2 === 0 ? theme.color : COSMIC_COLORS.glow.gold,
    })),
  [theme.color]);

  // Haptic trigger
  const triggerHaptic = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  // Animation sequence
  useEffect(() => {
    if (visible) {
      containerOpacity.value = withTiming(1, { duration: 400 });
      contentOpacity.value = withDelay(300, withTiming(1, { duration: 400 }));

      // Trigger haptic after checkmark appears
      setTimeout(triggerHaptic, 500);
    }
  }, [visible]);

  // Animated styles
  const containerStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
  }));

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  // Handle reflection button press
  const handleReflectionPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowReflectionInput(true);
  };

  // Handle reflection submit
  const handleReflectionSubmit = (text) => {
    onWriteReflection?.(text);
  };

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, containerStyle, style]}>
      {/* Background */}
      <LinearGradient
        colors={['rgba(5, 4, 11, 0.97)', 'rgba(13, 13, 43, 0.99)']}
        style={StyleSheet.absoluteFill}
      />

      {/* Floating particles */}
      <View style={styles.particlesContainer} pointerEvents="none">
        {particles.map((p) => (
          <FloatingParticle key={p.id} {...p} />
        ))}
      </View>

      {/* Main content */}
      <Animated.View style={[styles.content, contentStyle]}>
        {/* Checkmark */}
        <ElegantCheckmark color={theme.color} gradient={theme.gradient} delay={200} />

        {/* Title */}
        <Text style={styles.title}>Hoàn thành!</Text>

        {/* Ritual name with XP inline */}
        <View style={styles.infoRow}>
          <Text style={styles.ritualName}>{theme.title}</Text>
          <XPDisplay xp={xpEarned} delay={600} color={theme.color} />
        </View>

        {/* Message */}
        <Text style={styles.message}>{message}</Text>

        {/* Streak */}
        <StreakDisplay streak={streakCount} isNewRecord={isNewRecord} delay={800} />

        {/* Divider */}
        <View style={styles.divider} />

        {/* Buttons */}
        <View style={styles.buttonsContainer}>
          {showReflectionButton && (
            <ElegantButton
              label="Viết suy ngẫm"
              variant="outline"
              icon={<PenLine size={16} color={COSMIC_COLORS.text.secondary} style={{ marginRight: 6 }} />}
              onPress={handleReflectionPress}
              delay={1000}
            />
          )}

          <ElegantButton
            label="Tiếp tục"
            variant="primary"
            color={theme.color}
            onPress={onContinue}
            delay={1100}
          />
        </View>
      </Animated.View>

      {/* Reflection Input Modal */}
      <ReflectionInput
        visible={showReflectionInput}
        onClose={() => setShowReflectionInput(false)}
        onSubmit={handleReflectionSubmit}
        color={theme.color}
        ritualTitle={theme.title}
      />
    </Animated.View>
  );
};

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  particlesContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  floatingParticle: {
    position: 'absolute',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: COSMIC_SPACING.xl,
    maxWidth: 340,
    width: '100%',
  },

  // Checkmark
  checkmarkWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: COSMIC_SPACING.lg,
  },
  checkmarkRing: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
  },
  checkmarkCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Title
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: COSMIC_COLORS.text.primary,
    marginBottom: COSMIC_SPACING.xs,
    letterSpacing: 0.5,
  },

  // Info row
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: COSMIC_SPACING.sm,
    marginBottom: COSMIC_SPACING.sm,
  },
  ritualName: {
    fontSize: 15,
    fontWeight: '500',
    color: COSMIC_COLORS.text.secondary,
  },

  // XP
  xpWrapper: {},
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    gap: 4,
  },
  xpText: {
    fontSize: 13,
    fontWeight: '700',
  },

  // Message
  message: {
    fontSize: 14,
    color: COSMIC_COLORS.text.muted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: COSMIC_SPACING.md,
  },

  // Streak
  streakWrapper: {
    marginBottom: COSMIC_SPACING.md,
  },
  streakInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 149, 0, 0.1)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  streakText: {
    fontSize: 13,
    color: COSMIC_COLORS.text.secondary,
  },
  streakNumber: {
    fontWeight: '700',
    color: COSMIC_COLORS.glow.orange,
  },
  recordBadge: {
    backgroundColor: COSMIC_COLORS.glow.orange,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    marginLeft: 4,
  },
  recordText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#000',
  },

  // Divider
  divider: {
    width: 40,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 1,
    marginVertical: COSMIC_SPACING.lg,
  },

  // Buttons
  buttonsContainer: {
    width: '100%',
    gap: COSMIC_SPACING.sm,
    alignItems: 'center',
  },
  elegantButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 24,
    gap: 6,
    minWidth: 160,
  },
  outlineButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  primaryButtonText: {
    color: '#FFF',
  },

  // Reflection Input
  reflectionOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 110,
  },
  reflectionBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  reflectionKeyboard: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: COSMIC_SPACING.lg,
  },
  reflectionCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: COSMIC_COLORS.bgCard,
    borderRadius: COSMIC_RADIUS.xl,
    padding: COSMIC_SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  reflectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: COSMIC_SPACING.xs,
  },
  reflectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: COSMIC_SPACING.sm,
  },
  reflectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COSMIC_COLORS.text.primary,
  },
  reflectionSubtitle: {
    fontSize: 13,
    color: COSMIC_COLORS.text.muted,
    marginBottom: COSMIC_SPACING.md,
  },
  reflectionInputContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: COSMIC_RADIUS.md,
    borderWidth: 1,
    padding: COSMIC_SPACING.md,
    minHeight: 120,
  },
  reflectionTextInput: {
    fontSize: 15,
    color: COSMIC_COLORS.text.primary,
    lineHeight: 22,
    textAlignVertical: 'top',
    minHeight: 100,
  },
  reflectionCharCount: {
    fontSize: 11,
    color: COSMIC_COLORS.text.hint,
    textAlign: 'right',
    marginTop: COSMIC_SPACING.xs,
    marginBottom: COSMIC_SPACING.md,
  },
  reflectionActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: COSMIC_SPACING.sm,
  },
  reflectionCancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  reflectionCancelText: {
    fontSize: 14,
    color: COSMIC_COLORS.text.muted,
  },
  reflectionSubmitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  reflectionSubmitText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
});

export default React.memo(CompletionCelebration);
