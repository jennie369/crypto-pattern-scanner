/**
 * BurnReleaseRitual - Đốt & Buông Bỏ
 * Cosmic Glassmorphism Redesign - NEW RITUAL
 * Phases: Write → Burning → AshRising → Completed
 * Features: Flame animations, Paper burn effect, Spark & ash particles
 */

import React, { useState, useRef, useEffect, useCallback, memo, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withRepeat,
  withSequence,
  withDelay,
  runOnJS,
  Easing,
  cancelAnimation,
  interpolate,
  interpolateColor,
} from 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Flame, Wind, Feather, Sparkles } from 'lucide-react-native';

import { useAuth } from '../../../contexts/AuthContext';
import { completeRitual, saveReflection } from '../../../services/ritualService';

// Cosmic Components
import {
  VideoBackground,
  RitualAnimation,
  GlassCard,
  GlassInputCard,
  GlowButton,
  ParticleField,
  CompletionCelebration,
  InstructionText,
  TitleText,
  SubtitleText,
  RitualHeader,
  COSMIC_COLORS,
  COSMIC_SPACING,
  COSMIC_RADIUS,
  HAPTIC_PATTERNS,
  COSMIC_TIMING,
} from '../../../components/Rituals/cosmic';
import useVideoPause from '../../../hooks/useVideoPause';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const THEME = COSMIC_COLORS.ritualThemes.burn;

const CONFIG = {
  xpReward: 35,
  burnDuration: 5000, // 5 seconds for burn animation (reduced from 8)
  maxChars: 300,
};

// ============================================
// FLAME COMPONENT
// ============================================

const FlameParticle = memo(({ index, total }) => {
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  const baseX = ((index / total) - 0.5) * 100;
  const delay = Math.random() * 500;

  useEffect(() => {
    translateY.value = withDelay(delay,
      withRepeat(
        withSequence(
          withTiming(0, { duration: 0 }),
          withTiming(-60 - Math.random() * 40, { duration: 800 + Math.random() * 400 })
        ),
        -1
      )
    );

    translateX.value = withDelay(delay,
      withRepeat(
        withSequence(
          withTiming(-10 + Math.random() * 20, { duration: 400 }),
          withTiming(-10 + Math.random() * 20, { duration: 400 })
        ),
        -1,
        true
      )
    );

    scale.value = withDelay(delay,
      withRepeat(
        withSequence(
          withTiming(0.3, { duration: 0 }),
          withTiming(1, { duration: 200 }),
          withTiming(0.5, { duration: 600 })
        ),
        -1
      )
    );

    opacity.value = withDelay(delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 200 }),
          withTiming(0, { duration: 600 })
        ),
        -1
      )
    );

    return () => {
      cancelAnimation(translateY);
      cancelAnimation(translateX);
      cancelAnimation(scale);
      cancelAnimation(opacity);
    };
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: baseX + translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  const size = 12 + Math.random() * 12;
  const color = Math.random() > 0.5 ? THEME.primary : THEME.secondary;

  return (
    <Animated.View
      style={[
        styles.flameParticle,
        {
          width: size,
          height: size * 1.5,
          backgroundColor: color,
          borderRadius: size / 2,
        },
        animatedStyle,
      ]}
    />
  );
});

const FlameEffect = memo(({ active }) => {
  const particles = useMemo(() =>
    Array.from({ length: 20 }, (_, i) => ({ id: i })),
    []
  );

  if (!active) return null;

  return (
    <View style={styles.flameContainer}>
      {particles.map((p) => (
        <FlameParticle key={p.id} index={p.id} total={20} />
      ))}
    </View>
  );
});

// ============================================
// SPARK COMPONENT
// ============================================

const Spark = memo(({ delay, startX, startY }) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.5);

  const randomAngle = Math.random() * Math.PI * 2;
  const distance = 50 + Math.random() * 100;
  const endX = Math.cos(randomAngle) * distance;
  const endY = Math.sin(randomAngle) * distance - 80; // Bias upward

  useEffect(() => {
    translateX.value = withDelay(delay,
      withTiming(endX, { duration: 1000, easing: Easing.out(Easing.quad) })
    );
    translateY.value = withDelay(delay,
      withTiming(endY, { duration: 1000, easing: Easing.out(Easing.quad) })
    );
    opacity.value = withDelay(delay,
      withSequence(
        withTiming(1, { duration: 100 }),
        withTiming(0, { duration: 900 })
      )
    );
    scale.value = withDelay(delay,
      withSequence(
        withTiming(1, { duration: 100 }),
        withTiming(0.3, { duration: 900 })
      )
    );

    return () => {
      cancelAnimation(translateX);
      cancelAnimation(translateY);
      cancelAnimation(opacity);
      cancelAnimation(scale);
    };
  }, [delay, endX, endY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: startX + translateX.value },
      { translateY: startY + translateY.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.spark, animatedStyle]} />
  );
});

// ============================================
// ASH PARTICLE COMPONENT
// ============================================

const AshParticle = memo(({ delay, startX }) => {
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    translateY.value = withDelay(delay,
      withTiming(-SCREEN_HEIGHT * 0.6, {
        duration: 4000 + Math.random() * 2000,
        easing: Easing.out(Easing.quad),
      })
    );
    translateX.value = withDelay(delay,
      withRepeat(
        withSequence(
          withTiming(-20 + Math.random() * 40, { duration: 1000 }),
          withTiming(-20 + Math.random() * 40, { duration: 1000 })
        ),
        -1,
        true
      )
    );
    rotate.value = withDelay(delay,
      withRepeat(
        withTiming(360, { duration: 3000, easing: Easing.linear }),
        -1
      )
    );
    opacity.value = withDelay(delay,
      withSequence(
        withTiming(0.8, { duration: 500 }),
        withDelay(3000, withTiming(0, { duration: 1500 }))
      )
    );

    return () => {
      cancelAnimation(translateY);
      cancelAnimation(translateX);
      cancelAnimation(rotate);
      cancelAnimation(opacity);
    };
  }, [delay]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: startX + translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
    ],
    opacity: opacity.value,
  }));

  const size = 4 + Math.random() * 6;

  return (
    <Animated.View
      style={[
        styles.ashParticle,
        { width: size, height: size },
        animatedStyle,
      ]}
    />
  );
});

// ============================================
// BURNING PAPER COMPONENT
// ============================================

const BurningPaper = memo(({ text, onBurnComplete }) => {
  const burnProgress = useSharedValue(0);
  const paperScale = useSharedValue(1);
  const paperOpacity = useSharedValue(1);
  const charOpacity = useSharedValue(1);
  const glowIntensity = useSharedValue(0);

  const sparks = useMemo(() =>
    Array.from({ length: 30 }, (_, i) => ({
      id: i,
      delay: i * 150 + Math.random() * 500,
      startX: -50 + Math.random() * 100,
      startY: 50 + Math.random() * 100,
    })),
    []
  );

  const ashes = useMemo(() =>
    Array.from({ length: 25 }, (_, i) => ({
      id: i,
      delay: 2000 + i * 200,
      startX: -60 + Math.random() * 120,
    })),
    []
  );

  useEffect(() => {
    // Start burn animation
    burnProgress.value = withTiming(1, {
      duration: CONFIG.burnDuration,
      easing: Easing.inOut(Easing.quad),
    });

    // Glow intensity during burn
    glowIntensity.value = withSequence(
      withTiming(1, { duration: 800 }),
      withDelay(CONFIG.burnDuration - 2000, withTiming(0, { duration: 1200 }))
    );

    // Char effect - faster
    charOpacity.value = withDelay(1000,
      withTiming(0, { duration: 2500 })
    );

    // Paper shrink and fade - faster
    paperScale.value = withDelay(2000,
      withTiming(0.8, { duration: 1500 })
    );
    paperOpacity.value = withDelay(3000,
      withTiming(0, { duration: 2000 }, (finished) => {
        if (finished && onBurnComplete) {
          runOnJS(onBurnComplete)();
        }
      })
    );

    return () => {
      cancelAnimation(burnProgress);
      cancelAnimation(paperScale);
      cancelAnimation(paperOpacity);
      cancelAnimation(charOpacity);
      cancelAnimation(glowIntensity);
    };
  }, [onBurnComplete]);

  const paperStyle = useAnimatedStyle(() => ({
    transform: [{ scale: paperScale.value }],
    opacity: paperOpacity.value,
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: charOpacity.value,
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowIntensity.value * 0.6,
  }));

  const burnOverlayStyle = useAnimatedStyle(() => {
    const height = interpolate(burnProgress.value, [0, 1], [0, 100]);
    return {
      height: `${height}%`,
    };
  });

  return (
    <View style={styles.burningPaperContainer}>
      {/* Glow effect */}
      <Animated.View style={[styles.burnGlow, glowStyle]} />

      {/* Paper with burn effect */}
      <Animated.View style={[styles.paper, paperStyle]}>
        <View style={styles.paperInner}>
          {/* Original text */}
          <Animated.Text style={[styles.paperText, textStyle]}>
            {text}
          </Animated.Text>

          {/* Burn overlay (from bottom) */}
          <Animated.View style={[styles.burnOverlay, burnOverlayStyle]}>
            <LinearGradient
              colors={['transparent', 'rgba(50, 30, 20, 0.9)', '#1a0a05']}
              style={styles.burnGradient}
            />
          </Animated.View>

          {/* Ember edge */}
          <Animated.View style={[styles.emberEdge, burnOverlayStyle]}>
            <LinearGradient
              colors={[THEME.primary, THEME.secondary, 'transparent']}
              style={styles.emberGradient}
            />
          </Animated.View>
        </View>
      </Animated.View>

      {/* Flame effect - replaced by Lottie fire-ball */}

      {/* Sparks */}
      {sparks.map((spark) => (
        <Spark key={spark.id} {...spark} />
      ))}

      {/* Ash particles */}
      {ashes.map((ash) => (
        <AshParticle key={ash.id} {...ash} />
      ))}
    </View>
  );
});

// ============================================
// MAIN COMPONENT
// ============================================

const BurnReleaseRitual = ({ navigation }) => {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const shouldPauseVideo = useVideoPause();

  // State
  const [phase, setPhase] = useState('write'); // write, burning, completed
  const [releaseText, setReleaseText] = useState('');
  const [inputFocused, setInputFocused] = useState(false);
  const [isSoundOn, setIsSoundOn] = useState(true);
  const [xpEarned, setXpEarned] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showAshMessage, setShowAshMessage] = useState(false);
  const [reflection, setReflection] = useState('');

  // Animation values
  const contentOpacity = useSharedValue(1);
  const messageOpacity = useSharedValue(0);
  const textOverlayOpacity = useSharedValue(1);
  const textOverlayScale = useSharedValue(1);

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  const messageAnimatedStyle = useAnimatedStyle(() => ({
    opacity: messageOpacity.value,
  }));

  const textOverlayAnimatedStyle = useAnimatedStyle(() => ({
    opacity: textOverlayOpacity.value,
    transform: [
      { scale: textOverlayScale.value },
    ],
  }));

  // Handlers
  // Ref to prevent double-tap
  const isTransitioning = useRef(false);

  const handleStartBurn = useCallback(() => {
    if (!releaseText.trim()) return;

    // Prevent double-tap
    if (isTransitioning.current) return;
    isTransitioning.current = true;

    HAPTIC_PATTERNS.fire.ignite();

    // Fade out content first
    contentOpacity.value = withTiming(0, { duration: 300 }, (finished) => {
      if (finished) {
        // Only proceed if animation completed successfully
        runOnJS(setPhase)('burning');
      }
    });

    // Delay the rest of animations
    setTimeout(() => {
      contentOpacity.value = withTiming(1, { duration: 400 });

      // Animate text overlay - fade out and shrink with paper (faster)
      textOverlayOpacity.value = withDelay(800,
        withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.quad) })
      );
      textOverlayScale.value = withDelay(500,
        withTiming(0.7, { duration: 2500, easing: Easing.inOut(Easing.quad) })
      );
    }, 350); // Slightly longer to ensure phase change happened
  }, [releaseText]);

  const handleBurnComplete = useCallback(async () => {
    HAPTIC_PATTERNS.fire.burn();

    // Show ash rising message
    setShowAshMessage(true);
    messageOpacity.value = withTiming(1, { duration: 800 });

    // Complete after short delay (reduced from 3000 to 1500)
    setTimeout(async () => {
      setShowCelebration(true);

      try {
        if (user?.id) {
          const result = await completeRitual(user.id, 'burn-release', {
            releaseText,
            reflection,
          });
          setXpEarned(result?.xpEarned || CONFIG.xpReward);
          setStreak(result?.newStreak || 1);
        } else {
          setXpEarned(CONFIG.xpReward);
          setStreak(1);
        }
      } catch (err) {
        console.error('[BurnReleaseRitual] Complete error:', err);
        setXpEarned(CONFIG.xpReward);
        setStreak(1);
      }

      setPhase('completed');
    }, 1500);
  }, [releaseText, user]);

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleContinue = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  // Render Write Phase
  const renderWritePhase = () => (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardAvoid}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.writeContainer, contentAnimatedStyle]}>
          <View style={styles.iconContainer}>
            <View style={styles.flameIconWrapper}>
              <View style={styles.flameIconGlow} />
              <Flame size={60} color={THEME.primary} strokeWidth={1.5} />
            </View>
          </View>

          <View style={styles.textContainer}>
            <TitleText text="Đốt & Buông Bỏ" color={THEME.primary} />
            <SubtitleText text="Viết điều bạn muốn buông bỏ và đốt cháy" />
          </View>

          <InstructionText
            text="Hãy viết ra những suy nghĩ tiêu cực, nỗi sợ hãi, hay điều gì đang cản trở bạn. Sau đó, nhìn chúng cháy thành tro."
            variant="default"
            color={COSMIC_COLORS.text.secondary}
            style={styles.instruction}
          />

          <GlassInputCard
            focused={inputFocused}
            glowColor={THEME.glow}
            style={styles.inputCard}
          >
            <TextInput
              style={styles.releaseInput}
              placeholder="Tôi buông bỏ..."
              placeholderTextColor={COSMIC_COLORS.text.hint}
              multiline
              value={releaseText}
              onChangeText={setReleaseText}
              onFocus={() => setInputFocused(true)}
              onBlur={() => setInputFocused(false)}
              maxLength={CONFIG.maxChars}
              textAlignVertical="top"
              returnKeyType="done"
              blurOnSubmit={true}
              onSubmitEditing={() => Keyboard.dismiss()}
            />
            <Text style={styles.charCount}>{releaseText.length}/{CONFIG.maxChars}</Text>
          </GlassInputCard>

          <GlowButton
            label="Đốt & Buông Bỏ"
            icon={<Flame />}
            variant="burn"
            size="large"
            fullWidth
            disabled={!releaseText.trim()}
            onPress={() => {
              Keyboard.dismiss();
              handleStartBurn();
            }}
            style={styles.burnButton}
          />
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );

  // Render Burning Phase
  const renderBurningPhase = () => (
    <View style={styles.burningContainer}>
      {/* Paper with text overlay - centered */}
      <View style={styles.paperWithTextContainer}>
        {/* Lottie Animation - Paper Burn */}
        <View style={styles.paperLottieWrapper}>
          <RitualAnimation
            animationId="paper-burn"
            autoPlay={true}
            loop={false}
            speed={0.6}
          />
        </View>

        {/* User's text overlaid on paper */}
        <Animated.View style={[styles.paperTextOverlay, textOverlayAnimatedStyle]}>
          <Text style={styles.overlayText} numberOfLines={6}>
            {releaseText}
          </Text>
        </Animated.View>

        {/* Fire Ball positioned at bottom edge of paper - hide when ash message shows */}
        {!showAshMessage && (
          <View style={styles.fireOnPaper}>
            <RitualAnimation
              animationId="fire-ball"
              autoPlay={true}
              loop={true}
              speed={1}
            />
          </View>
        )}
      </View>

      {/* Hidden BurningPaper for timing only */}
      <View style={styles.hiddenBurnTimer}>
        <BurningPaper
          text={releaseText}
          onBurnComplete={handleBurnComplete}
        />
      </View>

      {/* Ash rising message - at bottom of screen */}
      {showAshMessage && (
        <Animated.View style={[styles.ashMessageContainer, messageAnimatedStyle]}>
          <View style={styles.ashIconWrap}>
            <Wind size={32} color={COSMIC_COLORS.text.secondary} />
          </View>
          <Text style={styles.ashMessageTitle}>Đã Buông Bỏ</Text>
          <Text style={styles.ashMessageSubtitle}>
            Những gánh nặng đã hóa thành tro bụi và bay đi...
          </Text>
        </Animated.View>
      )}
    </View>
  );

  // Main render
  return (
    <GestureHandlerRootView style={styles.container}>
      <VideoBackground ritualId="burn-release" paused={shouldPauseVideo}>
        {/* Fire particles - OPTIMIZED: reduced count */}
        <ParticleField
          variant="fire"
          count={phase === 'burning' ? 25 : 10}
          speed={phase === 'burning' ? 'fast' : 'slow'}
          density="low"
          direction="up"
        />

        <SafeAreaView style={styles.safeArea} edges={['top']}>
          {/* Header */}
          <RitualHeader
            title="Đốt & Buông Bỏ"
            icon={<Flame />}
            iconColor={THEME.primary}
            onBack={phase === 'write' ? handleBack : undefined}
            showSound={true}
            soundEnabled={isSoundOn}
            onSoundToggle={() => setIsSoundOn(!isSoundOn)}
          />

          {/* Content */}
          <View style={styles.content}>
            {phase === 'write' && renderWritePhase()}
            {(phase === 'burning' || phase === 'completed') && renderBurningPhase()}
            {/* Bottom padding for tab bar */}
            <View style={{ height: Math.max(insets.bottom, 20) + 80 }} />
          </View>
        </SafeAreaView>

        {/* Celebration overlay */}
        <CompletionCelebration
          ritualType="burn"
          xpEarned={xpEarned}
          streakCount={streak}
          isNewRecord={streak > 0}
          message="Bạn đã buông bỏ những gánh nặng. Hãy tiến về phía trước với tâm hồn nhẹ nhàng hơn."
          visible={showCelebration}
          onContinue={handleContinue}
          onWriteReflection={async (text) => {
            setReflection(text);
            if (user?.id) {
              await saveReflection(user.id, 'burn-release', text);
            }
          }}
          showVisionBoardButton={true}
          showReflectionButton={true}
        />
      </VideoBackground>
    </GestureHandlerRootView>
  );
};

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: COSMIC_SPACING.lg,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },

  // Write phase
  writeContainer: {
    paddingBottom: 40,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: COSMIC_SPACING.lg,
  },
  flameIconWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 107, 53, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flameIconGlow: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 107, 53, 0.25)',
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: COSMIC_SPACING.md,
  },
  instruction: {
    marginBottom: COSMIC_SPACING.lg,
    textAlign: 'center',
    paddingHorizontal: COSMIC_SPACING.md,
  },
  inputCard: {
    marginBottom: COSMIC_SPACING.lg,
  },
  releaseInput: {
    minHeight: 120,
    fontSize: 16,
    color: COSMIC_COLORS.text.primary,
    lineHeight: 24,
    textAlignVertical: 'top',
  },
  charCount: {
    textAlign: 'right',
    fontSize: 12,
    color: COSMIC_COLORS.text.muted,
    marginTop: COSMIC_SPACING.xs,
  },
  burnButton: {
    marginTop: COSMIC_SPACING.md,
  },

  // Burning phase
  burningContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paperWithTextContainer: {
    width: SCREEN_WIDTH * 0.8,
    height: SCREEN_WIDTH * 1.1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  paperLottieWrapper: {
    position: 'absolute',
    width: '100%',
    height: '85%',
    top: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  paperTextOverlay: {
    position: 'absolute',
    top: '8%',
    left: '12%',
    right: '12%',
    height: '55%',
    zIndex: 2,
    paddingHorizontal: 15,
    paddingVertical: 20,
    justifyContent: 'center',
  },
  overlayText: {
    fontSize: 15,
    color: '#2a2a2a',
    lineHeight: 24,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  fireOnPaper: {
    position: 'absolute',
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    width: 150,
    height: 150,
  },
  hiddenBurnTimer: {
    position: 'absolute',
    opacity: 0,
    pointerEvents: 'none',
  },
  burningPaperContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: SCREEN_WIDTH * 0.8,
    height: 300,
  },
  burnGlow: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: THEME.glow,
  },
  // OPTIMIZED: Reduced shadowRadius from 20 to 10
  paper: {
    width: '100%',
    minHeight: 180,
    borderRadius: COSMIC_RADIUS.lg,
    overflow: 'hidden',
    backgroundColor: '#f5f0e6',
    shadowColor: THEME.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  paperInner: {
    flex: 1,
    padding: COSMIC_SPACING.lg,
    position: 'relative',
  },
  paperText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    fontStyle: 'italic',
  },
  burnOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
  },
  burnGradient: {
    flex: 1,
  },
  emberEdge: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 8,
    overflow: 'hidden',
  },
  emberGradient: {
    flex: 1,
  },

  // Flame effect
  flameContainer: {
    position: 'absolute',
    bottom: 20,
    left: '50%',
    marginLeft: -50,
    width: 100,
    height: 80,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  // OPTIMIZED: Removed shadow for performance
  flameParticle: {
    position: 'absolute',
    bottom: 0,
  },

  // Spark
  spark: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FFD700',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 5,
  },

  // Ash particle
  ashParticle: {
    position: 'absolute',
    backgroundColor: '#666',
    borderRadius: 2,
  },

  // Ash message
  ashMessageContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 120,
    alignItems: 'center',
    paddingHorizontal: COSMIC_SPACING.lg,
    zIndex: 1,
  },
  ashIconWrap: {
    marginBottom: COSMIC_SPACING.md,
  },
  ashMessageTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COSMIC_COLORS.text.primary,
    textAlign: 'center',
  },
  ashMessageSubtitle: {
    fontSize: 16,
    color: COSMIC_COLORS.text.secondary,
    textAlign: 'center',
    marginTop: COSMIC_SPACING.xs,
  },
});

export default BurnReleaseRitual;
