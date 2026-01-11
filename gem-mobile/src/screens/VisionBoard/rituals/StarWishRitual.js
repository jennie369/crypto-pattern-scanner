/**
 * StarWishRitual - Ước Nguyện Sao Băng
 * Cosmic Glassmorphism Redesign - NEW RITUAL
 * Phases: SelectStar → MakeWish → Granted
 * Features: Interactive star field, Star selection, Shooting star animation
 */

import React, { useState, useEffect, useCallback, memo, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Pressable,
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
import { GestureHandlerRootView, Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Star, Sparkles, Wand2 } from 'lucide-react-native';

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

const THEME = COSMIC_COLORS.ritualThemes.star;

const CONFIG = {
  xpReward: 25,
  starCount: 35,
  maxChars: 200,
};

// ============================================
// INTERACTIVE STAR COMPONENT
// ============================================

const InteractiveStar = memo(({ star, onSelect, isSelected }) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(star.brightness);
  const glowScale = useSharedValue(0);

  useEffect(() => {
    // Twinkle animation
    opacity.value = withRepeat(
      withSequence(
        withTiming(star.brightness, { duration: 1000 + Math.random() * 1000 }),
        withTiming(star.brightness * 0.5, { duration: 1000 + Math.random() * 1000 })
      ),
      -1,
      true
    );

    // Selection effect
    if (isSelected) {
      scale.value = withSpring(1.5, COSMIC_TIMING.spring.bouncy);
      glowScale.value = withRepeat(
        withSequence(
          withTiming(1.2, { duration: 800 }),
          withTiming(1, { duration: 800 })
        ),
        -1,
        true
      );
    } else {
      scale.value = withSpring(1, COSMIC_TIMING.spring.gentle);
      glowScale.value = withTiming(0, { duration: 200 });
    }

    return () => {
      cancelAnimation(scale);
      cancelAnimation(opacity);
      cancelAnimation(glowScale);
    };
  }, [isSelected, star.brightness]);

  const starStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const glowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: glowScale.value }],
    opacity: glowScale.value > 0 ? 0.6 : 0,
  }));

  const handlePress = () => {
    HAPTIC_PATTERNS.tap();
    onSelect(star.id);
  };

  return (
    <Pressable
      style={[styles.starTouchArea, { left: star.x - 20, top: star.y - 20 }]}
      onPress={handlePress}
    >
      {/* Glow effect when selected */}
      <Animated.View
        style={[
          styles.starGlow,
          { backgroundColor: THEME.glow },
          glowStyle,
        ]}
      />
      {/* Star */}
      <Animated.View
        style={[
          styles.starDot,
          {
            width: star.size,
            height: star.size,
            backgroundColor: isSelected ? '#FFD700' : '#FFF',
          },
          starStyle,
        ]}
      />
    </Pressable>
  );
});

// ============================================
// STAR FIELD COMPONENT
// ============================================

const StarField = memo(({ stars, selectedStarId, onSelectStar }) => {
  return (
    <View style={styles.starField}>
      {stars.map((star) => (
        <InteractiveStar
          key={star.id}
          star={star}
          isSelected={selectedStarId === star.id}
          onSelect={onSelectStar}
        />
      ))}
    </View>
  );
});

// ============================================
// SHOOTING STAR ANIMATION
// ============================================

const ShootingStarAnimation = memo(({ visible, onComplete }) => {
  const translateX = useSharedValue(-100);
  const translateY = useSharedValue(-50);
  const opacity = useSharedValue(0);
  const tailWidth = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      // Shooting star flies across screen
      opacity.value = withSequence(
        withTiming(1, { duration: 200 }),
        withDelay(1800, withTiming(0, { duration: 300 }))
      );

      translateX.value = withTiming(SCREEN_WIDTH + 100, {
        duration: 2000,
        easing: Easing.out(Easing.quad),
      });

      translateY.value = withTiming(SCREEN_HEIGHT * 0.4, {
        duration: 2000,
        easing: Easing.out(Easing.quad),
      }, (finished) => {
        if (finished && onComplete) {
          runOnJS(onComplete)();
        }
      });

      tailWidth.value = withSequence(
        withTiming(150, { duration: 300 }),
        withDelay(1400, withTiming(0, { duration: 300 }))
      );
    }

    return () => {
      cancelAnimation(translateX);
      cancelAnimation(translateY);
      cancelAnimation(opacity);
      cancelAnimation(tailWidth);
    };
  }, [visible, onComplete]);

  const starStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: '45deg' },
    ],
    opacity: opacity.value,
  }));

  const tailStyle = useAnimatedStyle(() => ({
    width: tailWidth.value,
  }));

  if (!visible) return null;

  return (
    <Animated.View style={[styles.shootingStar, starStyle]}>
      <View style={styles.shootingStarHead} />
      <Animated.View style={tailStyle}>
        <LinearGradient
          colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.3)', 'transparent']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.shootingStarTail}
        />
      </Animated.View>
    </Animated.View>
  );
});

// ============================================
// SELECTED STAR VISUAL
// ============================================

const SelectedStarVisual = memo(({ star }) => {
  const pulseScale = useSharedValue(1);
  const rotateValue = useSharedValue(0);
  const glowOpacity = useSharedValue(0.5);

  useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 1000 }),
        withTiming(1, { duration: 1000 })
      ),
      -1,
      true
    );

    rotateValue.value = withRepeat(
      withTiming(360, { duration: 20000, easing: Easing.linear }),
      -1
    );

    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 1500 }),
        withTiming(0.4, { duration: 1500 })
      ),
      -1,
      true
    );

    return () => {
      cancelAnimation(pulseScale);
      cancelAnimation(rotateValue);
      cancelAnimation(glowOpacity);
    };
  }, []);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: pulseScale.value },
      { rotate: `${rotateValue.value}deg` },
    ],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  return (
    <View style={styles.selectedStarContainer}>
      <Animated.View style={[styles.selectedStarGlow, glowStyle]} />
      <Animated.View style={containerStyle}>
        <Star size={80} color="#FFD700" fill="#FFD700" strokeWidth={1} />
      </Animated.View>
      <View style={styles.selectedStarSparkles}>
        <Sparkles size={24} color="#FFF" style={styles.sparkle1} />
        <Sparkles size={18} color="#FFF" style={styles.sparkle2} />
        <Sparkles size={20} color="#FFF" style={styles.sparkle3} />
      </View>
    </View>
  );
});

// ============================================
// MAIN COMPONENT
// ============================================

const StarWishRitual = ({ navigation }) => {
  const { user } = useAuth();

  // Generate stars
  const stars = useMemo(() => {
    return Array.from({ length: CONFIG.starCount }, (_, i) => ({
      id: i,
      x: 30 + Math.random() * (SCREEN_WIDTH - 60),
      y: 100 + Math.random() * (SCREEN_HEIGHT * 0.4),
      size: 2 + Math.random() * 4,
      brightness: 0.4 + Math.random() * 0.6,
    }));
  }, []);

  // State
  const [phase, setPhase] = useState('select'); // select, wish, granting, granted
  const [selectedStarId, setSelectedStarId] = useState(null);
  const [wish, setWish] = useState('');
  const [inputFocused, setInputFocused] = useState(false);
  const [isSoundOn, setIsSoundOn] = useState(true);
  const [xpEarned, setXpEarned] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showShootingStar, setShowShootingStar] = useState(false);

  // Animation values
  const contentOpacity = useSharedValue(1);

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  // Get selected star data
  const selectedStar = useMemo(() => {
    return stars.find(s => s.id === selectedStarId);
  }, [stars, selectedStarId]);

  // Handlers
  const handleSelectStar = useCallback((starId) => {
    setSelectedStarId(starId);
    HAPTIC_PATTERNS.cosmic.starSelect();
  }, []);

  const handleConfirmStar = useCallback(() => {
    if (selectedStarId === null) return;

    HAPTIC_PATTERNS.tap();
    contentOpacity.value = withTiming(0, { duration: 300 });

    setTimeout(() => {
      setPhase('wish');
      contentOpacity.value = withTiming(1, { duration: 400 });
    }, 300);
  }, [selectedStarId]);

  const handleMakeWish = useCallback(async () => {
    if (!wish.trim()) return;

    HAPTIC_PATTERNS.press();
    setPhase('granting');

    // Show shooting star animation
    setTimeout(() => {
      setShowShootingStar(true);
    }, 500);
  }, [wish]);

  const handleShootingStarComplete = useCallback(async () => {
    HAPTIC_PATTERNS.cosmic.wishGranted();
    setPhase('granted');
    setShowCelebration(true);

    try {
      if (user?.id) {
        const result = await completeRitual(user.id, 'star-wish', {
          wish,
          starId: selectedStarId,
        });
        setXpEarned(result?.xpEarned || CONFIG.xpReward);
        setStreak(result?.newStreak || 1);
      } else {
        setXpEarned(CONFIG.xpReward);
        setStreak(1);
      }
    } catch (err) {
      console.error('[StarWishRitual] Complete error:', err);
      setXpEarned(CONFIG.xpReward);
      setStreak(1);
    }
  }, [wish, selectedStarId, user]);

  const handleBack = useCallback(() => {
    if (phase === 'wish') {
      setPhase('select');
    } else {
      navigation.goBack();
    }
  }, [phase, navigation]);

  const handleContinue = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  // Render Select Phase
  const renderSelectPhase = () => (
    <Animated.View style={[styles.selectContainer, contentAnimatedStyle]}>
      <View style={styles.instructionTop}>
        <TitleText text="Chọn Ngôi Sao" color={THEME.primary} />
        <SubtitleText text="Chạm vào ngôi sao bạn muốn gửi điều ước" />
      </View>

      {/* Interactive star field */}
      <StarField
        stars={stars}
        selectedStarId={selectedStarId}
        onSelectStar={handleSelectStar}
      />

      {/* Selected star info */}
      {selectedStarId !== null && (
        <View style={styles.selectedInfo}>
          <GlassCard variant="glow" glowColor={THEME.glow} padding={COSMIC_SPACING.md}>
            <View style={styles.selectedInfoContent}>
              <Star size={20} color="#FFD700" fill="#FFD700" />
              <Text style={styles.selectedInfoText}>
                Ngôi sao #{selectedStarId + 1} đã được chọn
              </Text>
            </View>
          </GlassCard>

          <GlowButton
            label="Tiếp tục"
            icon={<Wand2 />}
            variant="star"
            size="large"
            fullWidth
            onPress={handleConfirmStar}
            style={styles.continueButton}
          />
        </View>
      )}
    </Animated.View>
  );

  // Render Wish Phase
  const renderWishPhase = () => (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardAvoid}
    >
      <Animated.View style={[styles.wishContainer, contentAnimatedStyle]}>
        {/* Selected star visual */}
        <SelectedStarVisual star={selectedStar} />

        <View style={styles.wishTextContainer}>
          <TitleText text="Điều Ước Của Bạn" color="#FFD700" />
          <SubtitleText text="Viết điều ước và gửi lên ngôi sao" />
        </View>

        <GlassInputCard
          focused={inputFocused}
          glowColor="rgba(255, 215, 0, 0.3)"
          style={styles.wishInputCard}
        >
          <TextInput
            style={styles.wishInput}
            placeholder="Tôi ước..."
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
          icon={<Star />}
          variant="star"
          size="large"
          fullWidth
          disabled={!wish.trim()}
          onPress={handleMakeWish}
          style={styles.wishButton}
        />
      </Animated.View>
    </KeyboardAvoidingView>
  );

  // Render Granting Phase
  const renderGrantingPhase = () => (
    <View style={styles.grantingContainer}>
      <ShootingStarAnimation
        visible={showShootingStar}
        onComplete={handleShootingStarComplete}
      />

      <View style={styles.grantingMessage}>
        <Sparkles size={40} color="#FFD700" />
        <Text style={styles.grantingText}>Điều ước đang bay đến những vì sao...</Text>
      </View>
    </View>
  );

  // Main render
  return (
    <GestureHandlerRootView style={styles.container}>
      <CosmicBackground
        variant="star"
        starDensity="high"
        showNebula={true}
        showSpotlight={phase === 'wish'}
        spotlightIntensity={0.4}
      >
        {/* Star particles - OPTIMIZED: reduced count */}
        <ParticleField
          variant="stars"
          count={15}
          speed="slow"
          density="low"
          direction="none"
        />

        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
          {/* Header */}
          <RitualHeader
            title="Ước Nguyện Sao Băng"
            icon={<Star />}
            iconColor="#FFD700"
            onBack={phase !== 'granting' && phase !== 'granted' ? handleBack : undefined}
            showSound={true}
            soundEnabled={isSoundOn}
            onSoundToggle={() => setIsSoundOn(!isSoundOn)}
          />

          {/* Content */}
          <View style={styles.content}>
            {phase === 'select' && renderSelectPhase()}
            {phase === 'wish' && renderWishPhase()}
            {(phase === 'granting' || phase === 'granted') && renderGrantingPhase()}
          </View>
        </SafeAreaView>

        {/* Celebration overlay */}
        <CompletionCelebration
          ritualType="star"
          xpEarned={xpEarned}
          streakCount={streak}
          isNewRecord={streak > 0}
          message="Điều ước của bạn đã được ngôi sao nhận. Hãy tin tưởng và chờ đợi phép màu."
          visible={showCelebration}
          onContinue={handleContinue}
          showVisionBoardButton={true}
          showReflectionButton={false}
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
  },
  keyboardAvoid: {
    flex: 1,
  },

  // Select phase
  selectContainer: {
    flex: 1,
  },
  instructionTop: {
    alignItems: 'center',
    paddingHorizontal: COSMIC_SPACING.lg,
    paddingTop: COSMIC_SPACING.md,
  },
  starField: {
    flex: 1,
    position: 'relative',
  },
  starTouchArea: {
    position: 'absolute',
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  starGlow: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  starDot: {
    borderRadius: 10,
    shadowColor: '#FFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 5,
  },
  selectedInfo: {
    paddingHorizontal: COSMIC_SPACING.lg,
    paddingBottom: COSMIC_SPACING.xl,
  },
  selectedInfoContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: COSMIC_SPACING.sm,
  },
  selectedInfoText: {
    fontSize: 16,
    color: COSMIC_COLORS.text.primary,
    fontWeight: '500',
  },
  continueButton: {
    marginTop: COSMIC_SPACING.md,
  },

  // Wish phase
  wishContainer: {
    flex: 1,
    paddingHorizontal: COSMIC_SPACING.lg,
    justifyContent: 'center',
    paddingBottom: COSMIC_SPACING.xxl,
  },
  selectedStarContainer: {
    alignItems: 'center',
    marginBottom: COSMIC_SPACING.xl,
  },
  selectedStarGlow: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 215, 0, 0.3)',
  },
  selectedStarSparkles: {
    position: 'absolute',
    width: 120,
    height: 120,
  },
  sparkle1: {
    position: 'absolute',
    top: -10,
    right: 0,
  },
  sparkle2: {
    position: 'absolute',
    bottom: 0,
    left: -5,
  },
  sparkle3: {
    position: 'absolute',
    top: 20,
    left: 10,
  },
  wishTextContainer: {
    alignItems: 'center',
    marginBottom: COSMIC_SPACING.lg,
  },
  wishInputCard: {
    marginBottom: COSMIC_SPACING.lg,
  },
  wishInput: {
    minHeight: 100,
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
  wishButton: {
    marginTop: COSMIC_SPACING.md,
  },

  // Granting phase
  grantingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shootingStar: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
  },
  // OPTIMIZED: Reduced shadowRadius from 15 to 8
  shootingStarHead: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFF',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  shootingStarTail: {
    height: 3,
    borderRadius: 2,
  },
  grantingMessage: {
    alignItems: 'center',
    gap: COSMIC_SPACING.md,
  },
  grantingText: {
    fontSize: 18,
    color: COSMIC_COLORS.text.secondary,
    textAlign: 'center',
  },
});

export default StarWishRitual;
