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
} from 'react-native-reanimated';
import { GestureHandlerRootView, Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Star, Sparkles, Wand2 } from 'lucide-react-native';

import { useAuth } from '../../../contexts/AuthContext';
import { completeRitual, saveReflection } from '../../../services/ritualService';
import ritualSoundService from '../../../services/ritualSoundService';

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
// REALISTIC CELESTIAL STAR VISUAL
// ============================================

const RealisticStar = memo(() => {
  const pulseScale = useSharedValue(1);
  const innerPulse = useSharedValue(1);
  const rayOpacity = useSharedValue(0.6);
  const shimmerRotate = useSharedValue(0);

  useEffect(() => {
    // Main pulse
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );

    // Inner core pulse (faster)
    innerPulse.value = withRepeat(
      withSequence(
        withTiming(1.15, { duration: 1200, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.95, { duration: 1200, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );

    // Ray shimmer
    rayOpacity.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 1500 }),
        withTiming(0.4, { duration: 1500 })
      ),
      -1,
      true
    );

    // Slow rotation for shimmer effect
    shimmerRotate.value = withRepeat(
      withTiming(360, { duration: 30000, easing: Easing.linear }),
      -1
    );

    return () => {
      cancelAnimation(pulseScale);
      cancelAnimation(innerPulse);
      cancelAnimation(rayOpacity);
      cancelAnimation(shimmerRotate);
    };
  }, []);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const innerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: innerPulse.value }],
  }));

  const rayStyle = useAnimatedStyle(() => ({
    opacity: rayOpacity.value,
    transform: [{ rotate: `${shimmerRotate.value}deg` }],
  }));

  // Star point rays
  const renderRays = () => {
    const rays = [];
    const rayCount = 8;
    for (let i = 0; i < rayCount; i++) {
      const angle = (i * 360) / rayCount;
      const isLong = i % 2 === 0;
      rays.push(
        <View
          key={i}
          style={[
            styles.starRay,
            {
              transform: [{ rotate: `${angle}deg` }],
              height: isLong ? 90 : 60,
            },
          ]}
        >
          <LinearGradient
            colors={['rgba(255, 248, 220, 0.9)', 'rgba(255, 215, 0, 0.4)', 'transparent']}
            style={[styles.starRayGradient, { height: isLong ? 90 : 60 }]}
          />
        </View>
      );
    }
    return rays;
  };

  return (
    <View style={styles.realisticStarContainer}>
      {/* Outermost soft glow */}
      <View style={styles.starOuterGlow}>
        <LinearGradient
          colors={['rgba(255, 215, 0, 0.25)', 'rgba(255, 215, 0, 0.08)', 'transparent']}
          style={styles.starOuterGlowGradient}
        />
      </View>

      {/* Ray layer */}
      <Animated.View style={[styles.starRayContainer, rayStyle]}>
        {renderRays()}
      </Animated.View>

      {/* Main star body with gradient */}
      <Animated.View style={[styles.starBodyOuter, containerStyle]}>
        <LinearGradient
          colors={['rgba(255, 250, 230, 0.3)', 'rgba(255, 223, 120, 0.5)', 'rgba(255, 180, 50, 0.3)']}
          style={styles.starBodyGradient}
          start={{ x: 0.2, y: 0.2 }}
          end={{ x: 0.8, y: 0.8 }}
        />
      </Animated.View>

      {/* Middle glow ring */}
      <Animated.View style={containerStyle}>
        <View style={styles.starMiddleGlow}>
          <LinearGradient
            colors={['transparent', 'rgba(255, 245, 200, 0.6)', 'rgba(255, 230, 150, 0.8)', 'rgba(255, 245, 200, 0.6)', 'transparent']}
            style={styles.starMiddleGlowGradient}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
          />
        </View>
      </Animated.View>

      {/* Inner bright core */}
      <Animated.View style={[styles.starInnerCore, innerStyle]}>
        <LinearGradient
          colors={['#FFFEF8', '#FFF8E7', '#FFE4A0']}
          style={styles.starInnerCoreGradient}
          start={{ x: 0.3, y: 0.3 }}
          end={{ x: 0.7, y: 0.7 }}
        />
      </Animated.View>

      {/* Hottest white center */}
      <View style={styles.starHotCenter} />

      {/* Lens flare effect - small dots */}
      <View style={[styles.lensFlare, { top: -25, left: 35 }]} />
      <View style={[styles.lensFlare, styles.lensFlareMedium, { bottom: -20, right: 30 }]} />
      <View style={[styles.lensFlare, styles.lensFlareSmall, { top: 20, right: -15 }]} />
    </View>
  );
});

const SelectedStarVisual = memo(({ star }) => {
  return (
    <View style={styles.selectedStarContainer}>
      <RealisticStar />
    </View>
  );
});

// ============================================
// MAIN COMPONENT
// ============================================

const StarWishRitual = ({ navigation }) => {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const shouldPauseVideo = useVideoPause();

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
  const [reflection, setReflection] = useState('');

  // Animation values
  const contentOpacity = useSharedValue(1);

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  // Get selected star data
  const selectedStar = useMemo(() => {
    return stars.find(s => s.id === selectedStarId);
  }, [stars, selectedStarId]);

  // ===== SOUND MANAGEMENT =====
  useEffect(() => {
    ritualSoundService.init();
    return () => {
      ritualSoundService.stopAll();
    };
  }, []);

  // Start/stop ambient based on phase and sound toggle
  useEffect(() => {
    if (isSoundOn && (phase === 'select' || phase === 'wish' || phase === 'granting')) {
      ritualSoundService.startAmbient('star-wish', 0.4);
    } else if (phase === 'granted') {
      ritualSoundService.stopAmbient();
    }
  }, [phase, isSoundOn]);

  // Handlers
  const handleSelectStar = useCallback((starId) => {
    setSelectedStarId(starId);
    HAPTIC_PATTERNS.cosmic.starSelect();
    // Play sparkle sound when selecting star
    if (isSoundOn) ritualSoundService.playSparkle();
  }, [isSoundOn]);

  // OPTIMIZED: Instant phase transition
  const handleConfirmStar = useCallback(() => {
    if (selectedStarId === null) return;
    HAPTIC_PATTERNS.tap();
    setPhase('wish'); // Instant transition
  }, [selectedStarId]);

  const handleMakeWish = useCallback(async () => {
    if (!wish.trim()) return;

    HAPTIC_PATTERNS.press();
    // Play whoosh sound when making wish
    if (isSoundOn) ritualSoundService.playWhoosh();
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

    // Play completion sound and stop ambient
    if (isSoundOn) {
      ritualSoundService.stopAmbient();
      ritualSoundService.playComplete('star-wish');
    }

    try {
      if (user?.id) {
        const result = await completeRitual(user.id, 'star-wish', {
          wish,
          starId: selectedStarId,
          reflection,
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
        <View style={[styles.selectedInfo, { paddingBottom: Math.max(insets.bottom, 20) + 80 }]}>
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
      <ScrollView
        contentContainerStyle={styles.wishScrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
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
            returnKeyType="done"
            blurOnSubmit={true}
            onSubmitEditing={() => Keyboard.dismiss()}
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
          onPress={() => {
            Keyboard.dismiss();
            handleMakeWish();
          }}
          style={styles.wishButton}
        />
      </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );

  // Render Granting Phase
  const renderGrantingPhase = () => (
    <View style={styles.grantingContainer}>
      {/* Lottie Animation - Shooting Star */}
      {showShootingStar && (
        <View style={styles.lottieContainer}>
          <RitualAnimation
            animationId="shooting-star"
            autoPlay={true}
            loop={false}
            size={SCREEN_WIDTH * 0.9}
            onAnimationFinish={handleShootingStarComplete}
          />
        </View>
      )}

      <View style={styles.grantingMessage}>
        <Sparkles size={40} color="#FFD700" />
        <Text style={styles.grantingText}>Điều ước đang bay đến những vì sao...</Text>
      </View>
    </View>
  );

  // Main render
  return (
    <GestureHandlerRootView style={styles.container}>
      <VideoBackground ritualId="star-wish" paused={shouldPauseVideo}>
        {/* Star particles - OPTIMIZED: reduced count */}
        <ParticleField
          variant="stars"
          count={15}
          speed="slow"
          density="low"
          direction="none"
        />

        <SafeAreaView style={styles.safeArea} edges={['top']}>
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
          onWriteReflection={async (text) => {
            setReflection(text);
            if (user?.id) {
              await saveReflection(user.id, 'star-wish', text);
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
  },
  keyboardAvoid: {
    flex: 1,
  },
  wishScrollContent: {
    flexGrow: 1,
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
    paddingBottom: 120,
  },
  selectedStarContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: COSMIC_SPACING.xl,
    height: 200,
  },

  // Realistic Star Styles
  realisticStarContainer: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  starOuterGlow: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    overflow: 'hidden',
  },
  starOuterGlowGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 100,
  },
  starRayContainer: {
    position: 'absolute',
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  starRay: {
    position: 'absolute',
    width: 6,
    alignItems: 'center',
  },
  starRayGradient: {
    width: 3,
    borderRadius: 1.5,
  },
  starBodyOuter: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
  },
  starBodyGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
  },
  starMiddleGlow: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
  },
  starMiddleGlowGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 25,
  },
  starInnerCore: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    overflow: 'hidden',
  },
  starInnerCoreGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 15,
  },
  starHotCenter: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFFFF8',
    shadowColor: '#FFFFF0',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
  },
  lensFlare: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  lensFlareMedium: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 250, 220, 0.6)',
  },
  lensFlareSmall: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
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
  lottieContainer: {
    position: 'absolute',
    top: '20%',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
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
