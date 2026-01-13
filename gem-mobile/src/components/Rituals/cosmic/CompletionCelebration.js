/**
 * CompletionCelebration - PERFORMANCE OPTIMIZED
 * Reduced confetti count, replaced setInterval with Reanimated
 * Simplified animations for smooth 60fps
 */

import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
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
import { CheckCircle, Flame, Star, Sparkles, PenLine, Plus } from 'lucide-react-native';

import {
  COSMIC_COLORS,
  COSMIC_SPACING,
  COSMIC_RADIUS,
} from '../../../theme/cosmicTokens';
import { COSMIC_TIMING } from '../../../utils/cosmicAnimations';
import GlassCard from './GlassCard';
import GlowButton from './GlowButton';

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
// CONFETTI - OPTIMIZED (reduced count, simpler animation)
// ============================================

const ConfettiParticle = React.memo(({ index, color, delay, startX, endX, size }) => {
  const translateY = useSharedValue(-50);
  const translateX = useSharedValue(startX);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    const particleDelay = delay + index * 80; // Slower stagger

    opacity.value = withDelay(particleDelay, withTiming(1, { duration: 200 }));
    translateX.value = withDelay(
      particleDelay,
      withTiming(endX, { duration: 2000, easing: Easing.out(Easing.quad) })
    );
    translateY.value = withDelay(
      particleDelay,
      withTiming(SCREEN_HEIGHT + 50, { duration: 2500, easing: Easing.in(Easing.quad) })
    );
    rotate.value = withDelay(
      particleDelay,
      withTiming(Math.random() * 360, { duration: 2500, easing: Easing.linear })
    );
    opacity.value = withDelay(
      particleDelay + 2000,
      withTiming(0, { duration: 500 })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.confettiParticle,
        {
          width: size,
          height: size,
          backgroundColor: color,
          borderRadius: Math.random() > 0.5 ? size / 2 : 2,
        },
        animatedStyle,
      ]}
    />
  );
});

// Pre-generate confetti data for consistent renders
const generateConfettiData = (count, colors) => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    color: colors[i % colors.length],
    startX: (Math.random() - 0.5) * SCREEN_WIDTH,
    endX: (Math.random() - 0.5) * SCREEN_WIDTH + (Math.random() - 0.5) * 100,
    size: 8 + Math.random() * 8,
  }));
};

// ============================================
// SPARKLE BURST - SIMPLIFIED
// ============================================

const SparkleBurst = React.memo(({ color, delay }) => {
  // Reduced to 8 sparkles instead of 12
  const sparkles = useMemo(() =>
    Array.from({ length: 8 }, (_, i) => ({
      id: i,
      angle: (i / 8) * Math.PI * 2,
      distance: 60 + Math.random() * 30,
    })),
  []);

  return (
    <View style={styles.sparkleContainer}>
      {sparkles.map((sparkle) => (
        <SparkleParticle
          key={sparkle.id}
          angle={sparkle.angle}
          distance={sparkle.distance}
          color={color}
          delay={delay}
        />
      ))}
    </View>
  );
});

const SparkleParticle = React.memo(({ angle, distance, color, delay }) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0);

  useEffect(() => {
    const targetX = Math.cos(angle) * distance;
    const targetY = Math.sin(angle) * distance;

    opacity.value = withDelay(delay, withTiming(1, { duration: 100 }));
    scale.value = withDelay(delay, withSequence(
      withSpring(1.2, { damping: 12, stiffness: 200 }),
      withTiming(0, { duration: 400 })
    ));
    translateX.value = withDelay(delay, withTiming(targetX, { duration: 500, easing: Easing.out(Easing.quad) }));
    translateY.value = withDelay(delay, withTiming(targetY, { duration: 500, easing: Easing.out(Easing.quad) }));
    opacity.value = withDelay(delay + 300, withTiming(0, { duration: 200 }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.sparkle, animatedStyle]}>
      <Sparkles size={14} color={color} strokeWidth={2} />
    </Animated.View>
  );
});

// ============================================
// XP COUNTER - OPTIMIZED (no setInterval)
// ============================================

const XPCounter = React.memo(({ xp, delay }) => {
  const [displayXP, setDisplayXP] = useState(0);
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const xpProgress = useSharedValue(0);

  // Trigger haptic when complete
  const onCountComplete = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 300 }));
    scale.value = withDelay(delay, withSpring(1, COSMIC_TIMING.spring.bouncy));

    // Use Reanimated to animate XP counter
    xpProgress.value = withDelay(delay, withTiming(1, {
      duration: 1200,
      easing: Easing.out(Easing.cubic),
    }, (finished) => {
      if (finished) {
        runOnJS(onCountComplete)();
      }
    }));
  }, [xp, delay]);

  // Update display value from animation
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
    <Animated.View style={[styles.xpContainer, animatedStyle]}>
      <LinearGradient
        colors={[COSMIC_COLORS.glow.gold, COSMIC_COLORS.glow.orange]}
        style={styles.xpBadge}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Star size={20} color="#FFF" fill="#FFF" strokeWidth={0} />
        <Text style={styles.xpText}>+{displayXP} XP</Text>
      </LinearGradient>
    </Animated.View>
  );
});

// ============================================
// STREAK BADGE
// ============================================

const StreakBadge = React.memo(({ streak, isNewRecord, delay }) => {
  const translateX = useSharedValue(100);
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 300 }));
    translateX.value = withDelay(delay, withSpring(0, COSMIC_TIMING.spring.gentle));
  }, [delay]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: opacity.value,
  }));

  if (!streak || streak < 1) return null;

  return (
    <Animated.View style={[styles.streakContainer, animatedStyle]}>
      <GlassCard variant="glow" glowColor={COSMIC_COLORS.glow.orange} padding={COSMIC_SPACING.md}>
        <View style={styles.streakContent}>
          <Flame size={24} color={COSMIC_COLORS.glow.orange} fill={COSMIC_COLORS.glow.orange} />
          <Text style={styles.streakNumber}>{streak}</Text>
          <Text style={styles.streakLabel}>ngày liên tiếp</Text>
          {isNewRecord && (
            <View style={styles.newRecordBadge}>
              <Text style={styles.newRecordText}>KỶ LỤC MỚI!</Text>
            </View>
          )}
        </View>
      </GlassCard>
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

  // Animation values
  const containerOpacity = useSharedValue(0);
  const iconScale = useSharedValue(0);
  const contentOpacity = useSharedValue(0);
  const buttonsOpacity = useSharedValue(0);

  // Pre-generate confetti data (REDUCED to 15 particles)
  const confettiData = useMemo(() => {
    const colors = [
      theme.color,
      COSMIC_COLORS.glow.gold,
      COSMIC_COLORS.glow.cyan,
      COSMIC_COLORS.glow.pink,
      '#FFFFFF',
    ];
    return generateConfettiData(15, colors);
  }, [theme.color]);

  // Haptic trigger
  const triggerHaptic = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  // Animation sequence
  useEffect(() => {
    if (visible) {
      containerOpacity.value = withTiming(1, { duration: 300 });

      iconScale.value = withDelay(200, withSequence(
        withSpring(1.3, COSMIC_TIMING.spring.bouncy),
        withTiming(1, { duration: 200 })
      ), (finished) => {
        if (finished) {
          runOnJS(triggerHaptic)();
        }
      });

      contentOpacity.value = withDelay(600, withTiming(1, { duration: 400 }));
      buttonsOpacity.value = withDelay(1800, withTiming(1, { duration: 400 }));
    }
  }, [visible]);

  // Animated styles
  const containerStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
  }));

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  const buttonsStyle = useAnimatedStyle(() => ({
    opacity: buttonsOpacity.value,
  }));

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, containerStyle, style]}>
      {/* Background overlay */}
      <LinearGradient
        colors={['rgba(5, 4, 11, 0.95)', 'rgba(13, 13, 43, 0.98)']}
        style={StyleSheet.absoluteFill}
      />

      {/* Confetti - REDUCED COUNT */}
      <View style={styles.confettiContainer} pointerEvents="none">
        {confettiData.map((particle) => (
          <ConfettiParticle
            key={particle.id}
            index={particle.id}
            color={particle.color}
            startX={particle.startX}
            endX={particle.endX}
            size={particle.size}
            delay={200}
          />
        ))}
      </View>

      {/* Main content */}
      <View style={styles.content}>
        {/* Icon with sparkle burst */}
        <View style={styles.iconWrapper}>
          <SparkleBurst color={theme.color} delay={400} />
          <Animated.View style={[styles.iconContainer, iconStyle]}>
            <LinearGradient
              colors={theme.gradient}
              style={styles.iconBackground}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <CheckCircle size={48} color="#FFF" strokeWidth={2} />
            </LinearGradient>
          </Animated.View>
        </View>

        {/* Title and message */}
        <Animated.View style={[styles.textContainer, contentStyle]}>
          <Text style={styles.title}>Hoàn thành!</Text>
          <Text style={styles.ritualName}>{theme.title}</Text>
          <Text style={styles.message}>{message}</Text>
        </Animated.View>

        {/* XP Counter */}
        <XPCounter xp={xpEarned} delay={800} />

        {/* Streak Badge */}
        <StreakBadge streak={streakCount} isNewRecord={isNewRecord} delay={1200} />

        {/* Action Buttons */}
        <Animated.View style={[styles.buttonsContainer, buttonsStyle]}>
          {showVisionBoardButton && onAddToVisionBoard && (
            <GlowButton
              label="Thêm vào Vision Board"
              icon={<Plus />}
              variant="outline"
              fullWidth
              onPress={onAddToVisionBoard}
              style={styles.button}
            />
          )}

          {showReflectionButton && onWriteReflection && (
            <GlowButton
              label="Viết suy ngẫm"
              icon={<PenLine />}
              variant="outline"
              fullWidth
              onPress={onWriteReflection}
              style={styles.button}
            />
          )}

          <GlowButton
            label="Tiếp tục"
            variant={ritualType}
            fullWidth
            onPress={onContinue}
            style={styles.button}
          />
        </Animated.View>
      </View>
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
  confettiContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  confettiParticle: {
    position: 'absolute',
    top: 0,
    left: SCREEN_WIDTH / 2,
  },
  sparkleContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sparkle: {
    position: 'absolute',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: COSMIC_SPACING.xl,
    maxWidth: 400,
    width: '100%',
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: COSMIC_SPACING.xl,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBackground: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: COSMIC_SPACING.lg,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: COSMIC_COLORS.text.primary,
    marginBottom: COSMIC_SPACING.xs,
  },
  ritualName: {
    fontSize: 18,
    fontWeight: '500',
    color: COSMIC_COLORS.text.secondary,
    marginBottom: COSMIC_SPACING.sm,
  },
  message: {
    fontSize: 16,
    color: COSMIC_COLORS.text.muted,
    textAlign: 'center',
    lineHeight: 24,
  },
  xpContainer: {
    marginBottom: COSMIC_SPACING.lg,
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: COSMIC_SPACING.sm,
    paddingHorizontal: COSMIC_SPACING.lg,
    borderRadius: COSMIC_RADIUS.round,
    gap: COSMIC_SPACING.xs,
  },
  xpText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
  },
  streakContainer: {
    marginBottom: COSMIC_SPACING.xl,
    width: '100%',
  },
  streakContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: COSMIC_SPACING.sm,
  },
  streakNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: COSMIC_COLORS.glow.orange,
  },
  streakLabel: {
    fontSize: 14,
    color: COSMIC_COLORS.text.secondary,
  },
  newRecordBadge: {
    backgroundColor: COSMIC_COLORS.glow.gold,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: COSMIC_RADIUS.sm,
  },
  newRecordText: {
    fontSize: 10,
    fontWeight: '700',
    color: COSMIC_COLORS.bgDeepSpace,
  },
  buttonsContainer: {
    width: '100%',
    gap: COSMIC_SPACING.sm,
  },
  button: {
    marginBottom: 0,
  },
});

export default React.memo(CompletionCelebration);
