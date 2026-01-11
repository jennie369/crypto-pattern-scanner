/**
 * LetterToUniverseRitual - Thư Gửi Vũ Trụ
 * Cosmic Glassmorphism Redesign
 * Phases: Write → Sending → Received
 * Features: Shooting stars, God rays, Nebula clouds, Letter animation
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
} from 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Send, Sparkles, Star, Mail } from 'lucide-react-native';

import { useAuth } from '../../../contexts/AuthContext';
import { completeRitual } from '../../../services/ritualService';

// Cosmic Components
import {
  CosmicBackground,
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

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const THEME = COSMIC_COLORS.ritualThemes.letter;

const CONFIG = {
  xpReward: 25,
  animationDuration: 20000, // 20 seconds
  maxChars: 500,
};

// ============================================
// SHOOTING STAR COMPONENT
// ============================================

const ShootingStar = memo(({ delay, startX, startY, duration = 2500 }) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    // Start animation after delay
    translateX.value = withDelay(delay,
      withTiming(250, { duration, easing: Easing.out(Easing.quad) })
    );
    translateY.value = withDelay(delay,
      withTiming(350, { duration, easing: Easing.out(Easing.quad) })
    );
    opacity.value = withDelay(delay,
      withSequence(
        withTiming(1, { duration: 300 }),
        withTiming(0, { duration: duration - 300 })
      )
    );

    return () => {
      cancelAnimation(translateX);
      cancelAnimation(translateY);
      cancelAnimation(opacity);
    };
  }, [delay, duration]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateX: startX + translateX.value },
      { translateY: startY + translateY.value },
      { rotate: '45deg' },
    ],
  }));

  return (
    <Animated.View style={[styles.shootingStar, animatedStyle]}>
      <View style={styles.starHead} />
      <LinearGradient
        colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.3)', 'transparent']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.starTail}
      />
    </Animated.View>
  );
});

// ============================================
// GOD RAYS COMPONENT
// ============================================

const GodRays = memo(({ visible }) => {
  const rotation = useSharedValue(0);
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(0.5, { duration: 2500 });
      scale.value = withSpring(1, { damping: 15, stiffness: 30 });
      rotation.value = withRepeat(
        withTiming(360, { duration: 40000, easing: Easing.linear }),
        -1
      );
    }

    return () => {
      cancelAnimation(rotation);
      cancelAnimation(scale);
      cancelAnimation(opacity);
    };
  }, [visible]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  if (!visible) return null;

  const rays = Array.from({ length: 12 }, (_, i) => (
    <View
      key={i}
      style={[styles.ray, { transform: [{ rotate: `${i * 30}deg` }] }]}
    >
      <LinearGradient
        colors={['rgba(255,248,225,0.7)', 'rgba(255,248,225,0.2)', 'transparent']}
        style={styles.rayGradient}
      />
    </View>
  ));

  return (
    <Animated.View style={[styles.godRaysContainer, containerStyle]}>
      {rays}
      <View style={styles.centerGlow} />
    </Animated.View>
  );
});

// ============================================
// NEBULA CLOUD COMPONENT
// ============================================

const NebulaCloud = memo(({ color, size, x, y, delay }) => {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.5);

  useEffect(() => {
    opacity.value = withDelay(delay,
      withTiming(0.35, { duration: 3500 })
    );
    scale.value = withDelay(delay,
      withRepeat(
        withSequence(
          withTiming(1.15, { duration: 5000, easing: Easing.inOut(Easing.sin) }),
          withTiming(0.85, { duration: 5000, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      )
    );

    return () => {
      cancelAnimation(opacity);
      cancelAnimation(scale);
    };
  }, [delay]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      style={[
        styles.nebulaCloud,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          left: x,
          top: y,
        },
        animatedStyle,
      ]}
    />
  );
});

// ============================================
// COSMIC LETTER COMPONENT
// ============================================

const CosmicLetter = memo(({ visible, onComplete }) => {
  const translateY = useSharedValue(0);
  const rotate = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const glowScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.4);

  useEffect(() => {
    if (visible) {
      // Phase 1: Slow lift with gentle rotation (0-3.5s)
      translateY.value = withTiming(-180, {
        duration: 3500,
        easing: Easing.out(Easing.cubic),
      });
      rotate.value = withTiming(7, {
        duration: 3500,
        easing: Easing.inOut(Easing.sin),
      });
      glowOpacity.value = withTiming(1, { duration: 2500 });
      glowScale.value = withRepeat(
        withSequence(
          withTiming(1.2, { duration: 800 }),
          withTiming(1, { duration: 800 })
        ),
        -1,
        true
      );

      // Phase 2: Transform into light (3.5-6.5s)
      scale.value = withDelay(3500,
        withTiming(0.2, {
          duration: 3000,
          easing: Easing.in(Easing.cubic),
        })
      );
      opacity.value = withDelay(3500,
        withTiming(0, { duration: 2800 }, (finished) => {
          if (finished && onComplete) {
            runOnJS(onComplete)();
          }
        })
      );
    }

    return () => {
      cancelAnimation(translateY);
      cancelAnimation(rotate);
      cancelAnimation(scale);
      cancelAnimation(opacity);
      cancelAnimation(glowScale);
      cancelAnimation(glowOpacity);
    };
  }, [visible, onComplete]);

  const letterStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
      { scale: scale.value },
    ],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    transform: [{ scale: glowScale.value }],
  }));

  if (!visible) return null;

  return (
    <Animated.View style={[styles.cosmicLetter, letterStyle]}>
      <Animated.View style={[styles.letterGlow, glowStyle]} />
      <View style={styles.letterEnvelope}>
        <LinearGradient
          colors={[THEME.primary, THEME.secondary, '#7C3AED']}
          style={styles.letterGradient}
        >
          <Mail size={32} color="#FFF" />
        </LinearGradient>
      </View>
    </Animated.View>
  );
});

// ============================================
// TWINKLING STARS FIELD
// ============================================

// OPTIMIZED: Reduced count from 50 to 20 for performance
const TwinklingStarsField = memo(({ visible, count = 20 }) => {
  const stars = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * SCREEN_WIDTH,
      y: Math.random() * SCREEN_HEIGHT * 0.7,
      size: 1.5 + Math.random() * 2.5,
      delay: Math.random() * 3000,
    }));
  }, [count]);

  if (!visible) return null;

  return (
    <View style={styles.twinklingField}>
      {stars.map((star) => (
        <TwinklingStar key={star.id} {...star} />
      ))}
    </View>
  );
});

const TwinklingStar = memo(({ x, y, size, delay }) => {
  const opacity = useSharedValue(0.2);

  useEffect(() => {
    opacity.value = withDelay(delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 1200 + Math.random() * 800 }),
          withTiming(0.2, { duration: 1200 + Math.random() * 800 })
        ),
        -1,
        true
      )
    );

    return () => {
      cancelAnimation(opacity);
    };
  }, [delay]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.twinklingStar,
        {
          left: x,
          top: y,
          width: size,
          height: size,
        },
        animatedStyle,
      ]}
    />
  );
});

// ============================================
// MAIN COMPONENT
// ============================================

const LetterToUniverseRitual = ({ navigation }) => {
  const { user } = useAuth();

  // State
  const [phase, setPhase] = useState('write'); // write, sending, received
  const [wish, setWish] = useState('');
  const [inputFocused, setInputFocused] = useState(false);
  const [isSoundOn, setIsSoundOn] = useState(true);
  const [xpEarned, setXpEarned] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);

  // Animation states
  const [showLetter, setShowLetter] = useState(false);
  const [showGodRays, setShowGodRays] = useState(false);
  const [showNebula, setShowNebula] = useState(false);
  const [showTwinklingStars, setShowTwinklingStars] = useState(false);
  const [showShootingStars, setShowShootingStars] = useState(false);
  const [showMessage, setShowMessage] = useState(false);

  // Animation values
  const contentOpacity = useSharedValue(1);
  const messageOpacity = useSharedValue(0);

  // Content animation style
  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  const messageAnimatedStyle = useAnimatedStyle(() => ({
    opacity: messageOpacity.value,
  }));

  // Shooting stars data
  const shootingStars = useMemo(() => [
    { delay: 6000, startX: -30, startY: 80, duration: 2800 },
    { delay: 7500, startX: 80, startY: 30, duration: 2400 },
    { delay: 9000, startX: SCREEN_WIDTH - 120, startY: 60, duration: 2600 },
    { delay: 10500, startX: 150, startY: 120, duration: 3000 },
    { delay: 12000, startX: SCREEN_WIDTH - 180, startY: 100, duration: 2700 },
    { delay: 14000, startX: 20, startY: 180, duration: 2900 },
  ], []);

  // Nebula clouds data
  const nebulaClouds = useMemo(() => [
    { color: 'rgba(168, 85, 247, 0.25)', size: 320, x: -80, y: 80, delay: 8000 },
    { color: 'rgba(236, 72, 153, 0.2)', size: 280, x: SCREEN_WIDTH - 180, y: 180, delay: 9000 },
    { color: 'rgba(139, 92, 246, 0.18)', size: 220, x: 30, y: SCREEN_HEIGHT - 450, delay: 10000 },
    { color: 'rgba(124, 58, 237, 0.15)', size: 200, x: SCREEN_WIDTH - 120, y: SCREEN_HEIGHT - 350, delay: 11000 },
  ], []);

  // Handlers
  const handleSendWish = useCallback(async () => {
    if (!wish.trim()) return;

    HAPTIC_PATTERNS.cosmic.letterSend();
    setPhase('sending');

    // Start animation timeline
    setShowLetter(true);

    // 5s: God rays appear (after letter starts fading)
    setTimeout(() => {
      setShowGodRays(true);
      HAPTIC_PATTERNS.tap();
    }, 5000);

    // 6s: Shooting stars begin
    setTimeout(() => setShowShootingStars(true), 6000);

    // 8s: Nebula clouds appear
    setTimeout(() => setShowNebula(true), 8000);

    // 12s: Twinkling stars appear
    setTimeout(() => setShowTwinklingStars(true), 12000);

    // 15s: Success message
    setTimeout(() => {
      setShowMessage(true);
      messageOpacity.value = withTiming(1, { duration: 2000 });
      HAPTIC_PATTERNS.cosmic.wishGranted();
    }, 15000);

    // 18s: Complete
    setTimeout(async () => {
      setPhase('received');
      setShowCelebration(true);

      try {
        if (user?.id) {
          const result = await completeRitual(user.id, 'letter-to-universe', {
            wish,
          });
          setXpEarned(result?.xpEarned || CONFIG.xpReward);
          setStreak(result?.newStreak || 1);
        } else {
          setXpEarned(CONFIG.xpReward);
          setStreak(1);
        }
      } catch (err) {
        console.error('[LetterToUniverseRitual] Complete error:', err);
        setXpEarned(CONFIG.xpReward);
        setStreak(1);
      }
    }, 18000);
  }, [wish, user]);

  const handleLetterComplete = useCallback(() => {
    setShowLetter(false);
  }, []);

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
    >
      <Animated.View style={[styles.writeContainer, contentAnimatedStyle]}>
        <View style={styles.iconContainer}>
          <View style={styles.mailIconWrapper}>
            <View style={styles.mailIconGlow} />
            <Mail size={60} color={THEME.primary} strokeWidth={1.5} />
          </View>
        </View>

        <View style={styles.textContainer}>
          <TitleText text="Thư Gửi Vũ Trụ" color={THEME.primary} />
          <SubtitleText text="Viết điều ước và gửi lên những vì sao" />
        </View>

        <GlassInputCard
          focused={inputFocused}
          glowColor={THEME.glow}
          style={styles.inputCard}
        >
          <TextInput
            style={styles.wishInput}
            placeholder="Điều ước của bạn..."
            placeholderTextColor={COSMIC_COLORS.text.hint}
            multiline
            value={wish}
            onChangeText={setWish}
            onFocus={() => setInputFocused(true)}
            onBlur={() => setInputFocused(false)}
            maxLength={CONFIG.maxChars}
            textAlignVertical="top"
          />
          <Text style={styles.charCount}>{wish.length}/{CONFIG.maxChars}</Text>
        </GlassInputCard>

        <GlowButton
          label="Gửi Điều Ước"
          icon={<Send />}
          variant="letter"
          size="large"
          fullWidth
          disabled={!wish.trim()}
          onPress={handleSendWish}
          style={styles.sendButton}
        />
      </Animated.View>
    </KeyboardAvoidingView>
  );

  // Render Sending Phase
  const renderSendingPhase = () => (
    <View style={styles.sendingContainer}>
      {/* Nebula clouds */}
      {showNebula && nebulaClouds.map((cloud, i) => (
        <NebulaCloud key={`nebula-${i}`} {...cloud} />
      ))}

      {/* God rays */}
      <GodRays visible={showGodRays} />

      {/* Shooting stars */}
      {showShootingStars && shootingStars.map((star, i) => (
        <ShootingStar key={`shooting-${i}`} {...star} />
      ))}

      {/* Twinkling stars - OPTIMIZED: reduced from 60 to 20 */}
      <TwinklingStarsField visible={showTwinklingStars} count={20} />

      {/* Cosmic letter animation */}
      <CosmicLetter
        visible={showLetter}
        onComplete={handleLetterComplete}
      />

      {/* Success message */}
      {showMessage && (
        <Animated.View style={[styles.messageContainer, messageAnimatedStyle]}>
          <View style={styles.messageIconWrap}>
            <View style={styles.messageIconGlow} />
            <Sparkles size={40} color={THEME.primary} />
          </View>
          <Text style={styles.messageTitle}>Điều Ước Đã Được Gửi</Text>
          <Text style={styles.messageSubtitle}>
            Vũ trụ đã nhận được thông điệp của bạn
          </Text>
        </Animated.View>
      )}
    </View>
  );

  // Main render
  return (
    <GestureHandlerRootView style={styles.container}>
      <CosmicBackground
        variant="letter"
        starDensity="high"
        showNebula={phase === 'sending'}
        showSpotlight={phase === 'sending'}
        spotlightIntensity={0.5}
      >
        {/* Sparkle particles - OPTIMIZED: reduced count */}
        <ParticleField
          variant={phase === 'sending' ? 'sparkles' : 'stars'}
          count={phase === 'sending' ? 20 : 12}
          speed={phase === 'sending' ? 'medium' : 'slow'}
          density="low"
          direction="up"
        />

        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
          {/* Header */}
          <RitualHeader
            title="Thư Gửi Vũ Trụ"
            icon={<Mail />}
            iconColor={THEME.primary}
            onBack={phase === 'write' ? handleBack : undefined}
            showSound={true}
            soundEnabled={isSoundOn}
            onSoundToggle={() => setIsSoundOn(!isSoundOn)}
          />

          {/* Content */}
          <View style={styles.content}>
            {phase === 'write' && renderWritePhase()}
            {(phase === 'sending' || phase === 'received') && renderSendingPhase()}
          </View>
        </SafeAreaView>

        {/* Celebration overlay */}
        <CompletionCelebration
          ritualType="letter"
          xpEarned={xpEarned}
          streakCount={streak}
          isNewRecord={streak > 0}
          message="Điều ước của bạn đã bay đến những vì sao. Hãy tin tưởng và để vũ trụ làm việc."
          visible={showCelebration}
          onContinue={handleContinue}
          showVisionBoardButton={true}
          showReflectionButton={true}
        />
      </CosmicBackground>
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

  // Write phase
  writeContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: COSMIC_SPACING.xxl,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: COSMIC_SPACING.lg,
  },
  mailIconWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(168, 85, 247, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mailIconGlow: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(168, 85, 247, 0.2)',
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: COSMIC_SPACING.lg,
  },
  inputCard: {
    marginBottom: COSMIC_SPACING.lg,
  },
  wishInput: {
    minHeight: 140,
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
  sendButton: {
    marginTop: COSMIC_SPACING.md,
  },

  // Sending phase
  sendingContainer: {
    flex: 1,
    position: 'relative',
  },

  // Shooting star
  shootingStar: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
  },
  // OPTIMIZED: Removed shadow for performance
  starHead: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#FFF',
  },
  starTail: {
    width: 100,
    height: 2.5,
    marginLeft: -3,
    borderRadius: 2,
  },

  // God rays
  godRaysContainer: {
    position: 'absolute',
    width: 450,
    height: 450,
    left: SCREEN_WIDTH / 2 - 225,
    top: SCREEN_HEIGHT / 2 - 300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ray: {
    position: 'absolute',
    width: 450,
    height: 450,
    alignItems: 'center',
  },
  rayGradient: {
    width: 5,
    height: 225,
    borderRadius: 3,
  },
  // OPTIMIZED: Reduced shadowRadius from 50 to 15
  centerGlow: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: THEME.primary,
    shadowColor: THEME.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
  },

  // Nebula cloud - OPTIMIZED: Removed heavy shadow
  nebulaCloud: {
    position: 'absolute',
  },

  // Twinkling stars - OPTIMIZED: Removed shadow
  twinklingField: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  twinklingStar: {
    position: 'absolute',
    backgroundColor: '#FFF',
    borderRadius: 10,
  },

  // Cosmic letter
  cosmicLetter: {
    position: 'absolute',
    left: SCREEN_WIDTH / 2 - 50,
    top: SCREEN_HEIGHT / 2 - 50,
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // OPTIMIZED: Reduced shadowRadius from 50 to 15
  letterGlow: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(168, 85, 247, 0.35)',
    shadowColor: THEME.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
  },
  // OPTIMIZED: Reduced shadowRadius from 25 to 10
  letterEnvelope: {
    width: 80,
    height: 65,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#FFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  letterGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Message
  messageContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: SCREEN_HEIGHT / 2 - 100,
    alignItems: 'center',
    paddingHorizontal: COSMIC_SPACING.lg,
  },
  messageIconWrap: {
    position: 'relative',
    marginBottom: COSMIC_SPACING.md,
  },
  messageIconGlow: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(168, 85, 247, 0.2)',
    top: -25,
    left: -25,
  },
  messageTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: COSMIC_COLORS.text.primary,
    marginTop: COSMIC_SPACING.sm,
    textAlign: 'center',
  },
  messageSubtitle: {
    fontSize: 16,
    color: COSMIC_COLORS.text.secondary,
    marginTop: COSMIC_SPACING.xs,
    textAlign: 'center',
  },
});

export default LetterToUniverseRitual;
