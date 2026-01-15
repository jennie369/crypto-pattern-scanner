/**
 * WaterManifestRitual - Hiện Thực Hóa Bằng Nước
 * Cosmic Glassmorphism Redesign
 * Phases: Start → Prepare → Intention → Charging → Drink → Completed
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
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
  interpolateColor,
  cancelAnimation,
} from 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Svg, { Path, Ellipse, Defs, LinearGradient as SvgGradient, Stop, Circle } from 'react-native-svg';
import { Droplet, Sparkles, ChevronRight, Zap, Heart } from 'lucide-react-native';

import { useAuth } from '../../../contexts/AuthContext';
import { completeRitual } from '../../../services/ritualService';

// Cosmic Components
import {
  CosmicBackground,
  GlassCard,
  GlassInputCard,
  GlowButton,
  ParticleField,
  ProgressRing,
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

const THEME = COSMIC_COLORS.ritualThemes.water;

const CONFIG = {
  chargeDuration: 30000, // 30 seconds
  xpReward: 30,
};

// ============================================
// WATER GLASS COMPONENT
// ============================================

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedEllipse = Animated.createAnimatedComponent(Ellipse);

const WaterGlass = ({ fillLevel = 0.75, glowing = false, charging = false }) => {
  const glowOpacity = useSharedValue(0.3);
  const waveOffset = useSharedValue(0);
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    if (glowing) {
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(0.8, { duration: 1000 }),
          withTiming(0.3, { duration: 1000 })
        ),
        -1,
        true
      );
    } else {
      glowOpacity.value = withTiming(0.3, { duration: 300 });
    }

    return () => {
      cancelAnimation(glowOpacity);
    };
  }, [glowing]);

  useEffect(() => {
    // Wave animation
    waveOffset.value = withRepeat(
      withTiming(10, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );

    if (charging) {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 800 }),
          withTiming(1, { duration: 800 })
        ),
        -1,
        true
      );
    }

    return () => {
      cancelAnimation(waveOffset);
      cancelAnimation(pulseScale);
    };
  }, [charging]);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const waterLevel = 100 - fillLevel * 70; // Map fill level to SVG coordinates

  return (
    <Animated.View style={[styles.glassContainer, containerStyle]}>
      {/* Outer glow */}
      <Animated.View style={[styles.glassOuterGlow, glowStyle]}>
        <View style={[styles.glowCircle, { backgroundColor: THEME.glow }]} />
      </Animated.View>

      {/* Glass SVG */}
      <Svg width={160} height={200} viewBox="0 0 100 125">
        <Defs>
          <SvgGradient id="waterGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor={THEME.primary} stopOpacity="0.9" />
            <Stop offset="100%" stopColor={THEME.secondary} stopOpacity="0.7" />
          </SvgGradient>
          <SvgGradient id="glassGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="rgba(255,255,255,0.3)" />
            <Stop offset="50%" stopColor="rgba(255,255,255,0.1)" />
            <Stop offset="100%" stopColor="rgba(255,255,255,0.3)" />
          </SvgGradient>
        </Defs>

        {/* Glass body */}
        <Path
          d="M20,15 L25,110 Q50,115 75,110 L80,15 Q50,10 20,15"
          fill="url(#glassGradient)"
          stroke="rgba(255,255,255,0.4)"
          strokeWidth="1.5"
        />

        {/* Water fill */}
        {fillLevel > 0 && (
          <>
            <Path
              d={`M23,${waterLevel} L25,110 Q50,115 75,110 L77,${waterLevel} Q50,${waterLevel - 3} 23,${waterLevel}`}
              fill="url(#waterGradient)"
            />
            {/* Water surface highlight */}
            <Ellipse
              cx="50"
              cy={waterLevel}
              rx="27"
              ry="3"
              fill={THEME.primary}
              opacity={0.5}
            />
          </>
        )}

        {/* Glass rim highlight */}
        <Ellipse
          cx="50"
          cy="15"
          rx="30"
          ry="5"
          fill="none"
          stroke="rgba(255,255,255,0.5)"
          strokeWidth="1"
        />

        {/* Sparkle effects when charging */}
        {charging && (
          <>
            <Circle cx="35" cy={waterLevel + 20} r="2" fill="#fff" opacity={0.8} />
            <Circle cx="55" cy={waterLevel + 35} r="1.5" fill="#fff" opacity={0.6} />
            <Circle cx="65" cy={waterLevel + 15} r="2" fill="#fff" opacity={0.7} />
          </>
        )}
      </Svg>
    </Animated.View>
  );
};

// ============================================
// WATER RIPPLES COMPONENT
// ============================================

const WaterRipples = ({ active }) => {
  const ripple1Scale = useSharedValue(0.5);
  const ripple1Opacity = useSharedValue(0);
  const ripple2Scale = useSharedValue(0.5);
  const ripple2Opacity = useSharedValue(0);
  const ripple3Scale = useSharedValue(0.5);
  const ripple3Opacity = useSharedValue(0);

  useEffect(() => {
    if (active) {
      // Ripple 1
      ripple1Scale.value = withRepeat(
        withSequence(
          withTiming(0.5, { duration: 0 }),
          withTiming(2, { duration: 2000 })
        ),
        -1
      );
      ripple1Opacity.value = withRepeat(
        withSequence(
          withTiming(0.8, { duration: 0 }),
          withTiming(0, { duration: 2000 })
        ),
        -1
      );

      // Ripple 2 (delayed)
      ripple2Scale.value = withDelay(600,
        withRepeat(
          withSequence(
            withTiming(0.5, { duration: 0 }),
            withTiming(2, { duration: 2000 })
          ),
          -1
        )
      );
      ripple2Opacity.value = withDelay(600,
        withRepeat(
          withSequence(
            withTiming(0.8, { duration: 0 }),
            withTiming(0, { duration: 2000 })
          ),
          -1
        )
      );

      // Ripple 3 (more delayed)
      ripple3Scale.value = withDelay(1200,
        withRepeat(
          withSequence(
            withTiming(0.5, { duration: 0 }),
            withTiming(2, { duration: 2000 })
          ),
          -1
        )
      );
      ripple3Opacity.value = withDelay(1200,
        withRepeat(
          withSequence(
            withTiming(0.8, { duration: 0 }),
            withTiming(0, { duration: 2000 })
          ),
          -1
        )
      );
    }

    return () => {
      cancelAnimation(ripple1Scale);
      cancelAnimation(ripple1Opacity);
      cancelAnimation(ripple2Scale);
      cancelAnimation(ripple2Opacity);
      cancelAnimation(ripple3Scale);
      cancelAnimation(ripple3Opacity);
    };
  }, [active]);

  const ripple1Style = useAnimatedStyle(() => ({
    transform: [{ scale: ripple1Scale.value }],
    opacity: ripple1Opacity.value,
  }));

  const ripple2Style = useAnimatedStyle(() => ({
    transform: [{ scale: ripple2Scale.value }],
    opacity: ripple2Opacity.value,
  }));

  const ripple3Style = useAnimatedStyle(() => ({
    transform: [{ scale: ripple3Scale.value }],
    opacity: ripple3Opacity.value,
  }));

  if (!active) return null;

  return (
    <View style={styles.ripplesContainer}>
      <Animated.View style={[styles.ripple, ripple1Style]} />
      <Animated.View style={[styles.ripple, ripple2Style]} />
      <Animated.View style={[styles.ripple, ripple3Style]} />
    </View>
  );
};

// ============================================
// ENERGY LINES COMPONENT
// ============================================

const EnergyLines = ({ active }) => {
  // OPTIMIZED: reduced from 6 to 3 lines for better performance
  const lines = [0, 1, 2];

  return (
    <View style={styles.energyLinesContainer}>
      {active && lines.map((index) => (
        <EnergyLine key={index} index={index} />
      ))}
    </View>
  );
};

const EnergyLine = ({ index }) => {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0);
  // OPTIMIZED: adjusted for 3 lines instead of 6
  const angle = (index / 3) * Math.PI * 2;
  const radius = 120;
  const startX = Math.cos(angle) * radius;
  const startY = Math.sin(angle) * radius;

  useEffect(() => {
    const delay = index * 200;

    translateY.value = withDelay(delay,
      withRepeat(
        withSequence(
          withTiming(0, { duration: 0 }),
          withTiming(-80, { duration: 1500, easing: Easing.out(Easing.quad) })
        ),
        -1
      )
    );

    opacity.value = withDelay(delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 300 }),
          withTiming(0, { duration: 1200 })
        ),
        -1
      )
    );

    return () => {
      cancelAnimation(translateY);
      cancelAnimation(opacity);
    };
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: startX },
      { translateY: startY + translateY.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.energyLine, animatedStyle]}>
      <Zap size={16} color={THEME.primary} fill={THEME.primary} />
    </Animated.View>
  );
};

// ============================================
// STEP INDICATOR
// ============================================

const StepIndicator = ({ currentStep, totalSteps }) => {
  return (
    <View style={styles.stepIndicator}>
      {Array.from({ length: totalSteps }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.stepDot,
            i < currentStep && styles.stepDotCompleted,
            i === currentStep && styles.stepDotActive,
          ]}
        />
      ))}
    </View>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================

const RITUAL_STEPS = [
  {
    key: 'prepare',
    title: 'Chuẩn bị',
    description: 'Đặt một ly nước sạch trước mặt bạn.\nNgồi thoải mái và thả lỏng cơ thể.',
    action: 'Đã sẵn sàng',
  },
  {
    key: 'intention',
    title: 'Viết ý định',
    description: 'Viết rõ ràng điều bạn muốn hiện thực hóa.\nHãy viết như nó đã xảy ra.',
    input: true,
    placeholder: 'Tôi đã đạt được...',
    action: 'Tiếp tục',
  },
  {
    key: 'charging',
    title: 'Nạp năng lượng',
    description: 'Đặt hai tay bao quanh ly nước.\nTập trung ý định vào nước.',
    duration: CONFIG.chargeDuration,
    action: 'Đang nạp...',
  },
  {
    key: 'drink',
    title: 'Uống nước',
    description: 'Từ từ uống hết ly nước.\nCảm nhận ý định lan tỏa trong cơ thể.',
    action: 'Đã uống xong',
  },
];

const WaterManifestRitual = ({ navigation }) => {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  // State
  const [phase, setPhase] = useState('start'); // start, ritual, completed
  const [currentStep, setCurrentStep] = useState(0);
  const [intention, setIntention] = useState('');
  const [isCharging, setIsCharging] = useState(false);
  const [chargeProgress, setChargeProgress] = useState(0);
  const [isSoundOn, setIsSoundOn] = useState(true);
  const [inputFocused, setInputFocused] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);

  // Refs
  const chargeInterval = useRef(null);

  // Animation values
  const contentOpacity = useSharedValue(1);

  // Content animation style
  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  // Cleanup
  useEffect(() => {
    return () => {
      if (chargeInterval.current) {
        clearInterval(chargeInterval.current);
      }
    };
  }, []);

  // Handlers
  const handleStart = useCallback(() => {
    HAPTIC_PATTERNS.tap();
    contentOpacity.value = withTiming(0, { duration: 300 });
    setTimeout(() => {
      setPhase('ritual');
      setCurrentStep(0);
      contentOpacity.value = withTiming(1, { duration: 400 });
    }, 300);
  }, []);

  const handleNextStep = useCallback(() => {
    const step = RITUAL_STEPS[currentStep] || RITUAL_STEPS[0];

    // Validate input step
    if (step.input && !intention.trim()) {
      HAPTIC_PATTERNS.warning();
      return;
    }

    // Handle charging step
    if (step.duration && !isCharging) {
      startCharging();
      return;
    }

    HAPTIC_PATTERNS.tap();

    // Move to next step or complete
    if (currentStep < RITUAL_STEPS.length - 1) {
      contentOpacity.value = withTiming(0, { duration: 200 });
      setTimeout(() => {
        setCurrentStep(prev => prev + 1);
        setIsCharging(false);
        setChargeProgress(0);
        contentOpacity.value = withTiming(1, { duration: 300 });
      }, 200);
    } else {
      handleComplete();
    }
  }, [currentStep, intention, isCharging]);

  const startCharging = useCallback(() => {
    setIsCharging(true);
    setChargeProgress(0);
    HAPTIC_PATTERNS.water.charge();

    const duration = CONFIG.chargeDuration;
    const interval = 100;
    let elapsed = 0;

    chargeInterval.current = setInterval(() => {
      elapsed += interval;
      const progress = elapsed / duration;
      setChargeProgress(progress);

      // Haptic feedback at intervals
      if (elapsed % 5000 === 0) {
        HAPTIC_PATTERNS.tap();
      }

      if (elapsed >= duration) {
        clearInterval(chargeInterval.current);
        chargeInterval.current = null;
        setIsCharging(false);
        HAPTIC_PATTERNS.success();

        // Move to next step
        if (currentStep < RITUAL_STEPS.length - 1) {
          contentOpacity.value = withTiming(0, { duration: 200 });
          setTimeout(() => {
            setCurrentStep(prev => prev + 1);
            setChargeProgress(0);
            contentOpacity.value = withTiming(1, { duration: 300 });
          }, 200);
        }
      }
    }, interval);
  }, [currentStep]);

  const handleComplete = async () => {
    HAPTIC_PATTERNS.success();
    setShowCelebration(true);

    try {
      if (user?.id) {
        const result = await completeRitual(user.id, 'water-manifest', {
          intention,
        });
        setXpEarned(result?.xpEarned || CONFIG.xpReward);
        setStreak(result?.newStreak || 1);
      } else {
        setXpEarned(CONFIG.xpReward);
        setStreak(1);
      }
    } catch (err) {
      console.error('[WaterManifestRitual] Complete error:', err);
      setXpEarned(CONFIG.xpReward);
      setStreak(1);
    }
  };

  const handleBack = useCallback(() => {
    if (chargeInterval.current) {
      clearInterval(chargeInterval.current);
    }
    navigation.goBack();
  }, [navigation]);

  const handleContinue = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const currentStepData = RITUAL_STEPS[currentStep] || RITUAL_STEPS[0];
  const fillLevel = currentStep >= 3 ? 0 : 0.75; // Empty after drinking

  // Render Start Phase
  const renderStart = () => (
    <Animated.View style={[styles.phaseContainer, contentAnimatedStyle]}>
      <View style={styles.iconContainer}>
        <WaterGlass fillLevel={0.75} glowing={true} />
      </View>

      <View style={styles.textContainer}>
        <TitleText text="Hiện Thực Hóa Bằng Nước" color={THEME.primary} />
        <SubtitleText text="Nạp ý định vào nước và uống" />
      </View>

      <InstructionText
        text="Nước có khả năng ghi nhớ thông tin. Viết ý định, nạp năng lượng vào nước và uống để hiện thực hóa."
        variant="default"
        color={COSMIC_COLORS.text.secondary}
        style={styles.instruction}
      />

      <GlowButton
        label="Bắt đầu"
        variant="water"
        size="large"
        fullWidth
        onPress={handleStart}
        style={styles.startButton}
      />

      <Text style={styles.durationText}>5-7 phút • Hiện thực hóa</Text>
    </Animated.View>
  );

  // Render Ritual Phase
  const renderRitual = () => (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardAvoid}
    >
      <Animated.View style={[styles.ritualContainer, contentAnimatedStyle]}>
        {/* Step indicator */}
        <StepIndicator
          currentStep={currentStep}
          totalSteps={RITUAL_STEPS.length}
        />

        {/* Visual container */}
        <View style={styles.visualContainer}>
          <WaterRipples active={isCharging} />
          <EnergyLines active={isCharging} />
          <WaterGlass
            fillLevel={fillLevel}
            glowing={isCharging || currentStep === 3}
            charging={isCharging}
          />

          {/* Progress ring around glass during charging */}
          {isCharging && (
            <View style={styles.progressOverlay}>
              <ProgressRing
                progress={chargeProgress}
                size={220}
                strokeWidth={4}
                color={THEME.primary}
                secondaryColor={THEME.secondary}
                showPercentage={false}
                showGlow={true}
              />
            </View>
          )}
        </View>

        {/* Step content */}
        <View style={styles.stepContent}>
          <Text style={styles.stepTitle}>{currentStepData.title}</Text>
          <Text style={styles.stepDescription}>{currentStepData.description}</Text>

          {/* Input field */}
          {currentStepData.input && (
            <GlassInputCard
              focused={inputFocused}
              glowColor={THEME.glow}
              style={styles.inputCard}
            >
              <TextInput
                style={styles.intentionInput}
                placeholder={currentStepData.placeholder}
                placeholderTextColor={COSMIC_COLORS.text.hint}
                value={intention}
                onChangeText={setIntention}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </GlassInputCard>
          )}

          {/* Charging progress text */}
          {isCharging && (
            <View style={styles.chargingInfo}>
              <Sparkles size={18} color={THEME.primary} />
              <Text style={styles.chargingText}>
                Đang nạp năng lượng... {Math.round(chargeProgress * 30)}s
              </Text>
            </View>
          )}

          {/* Action button */}
          {!isCharging && (
            <GlowButton
              label={currentStepData.action}
              icon={<ChevronRight />}
              variant="water"
              size="large"
              fullWidth
              disabled={currentStepData.input && !intention.trim()}
              onPress={handleNextStep}
              style={styles.actionButton}
            />
          )}
        </View>
      </Animated.View>
    </KeyboardAvoidingView>
  );

  // Main render
  return (
    <GestureHandlerRootView style={styles.container}>
      <CosmicBackground
        variant="water"
        starDensity="medium"
        showNebula={true}
        showSpotlight={true}
        spotlightIntensity={0.4}
      >
        {/* Water particles - OPTIMIZED: reduced counts */}
        <ParticleField
          variant="water"
          count={isCharging ? 20 : 10}
          speed={isCharging ? 'medium' : 'slow'}
          density="low"
          direction="up"
        />

        <SafeAreaView style={styles.safeArea} edges={['top']}>
          {/* Header */}
          <RitualHeader
            title="Hiện Thực Hóa Bằng Nước"
            icon={<Droplet />}
            iconColor={THEME.primary}
            onBack={handleBack}
            showSound={true}
            soundEnabled={isSoundOn}
            onSoundToggle={() => setIsSoundOn(!isSoundOn)}
          />

          {/* Content */}
          <View style={styles.content}>
            {phase === 'start' && renderStart()}
            {phase === 'ritual' && renderRitual()}
            {/* Bottom padding for tab bar */}
            <View style={{ height: Math.max(insets.bottom, 20) + 80 }} />
          </View>
        </SafeAreaView>

        {/* Celebration overlay */}
        <CompletionCelebration
          ritualType="water"
          xpEarned={xpEarned}
          streakCount={streak}
          isNewRecord={streak > 0}
          message={`Ý định của bạn đã được nạp vào cơ thể.\nHãy tin tưởng và để vũ trụ hiện thực hóa.`}
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
    paddingHorizontal: COSMIC_SPACING.lg,
  },
  keyboardAvoid: {
    flex: 1,
  },
  phaseContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 20,
  },
  ritualContainer: {
    flex: 1,
    paddingTop: COSMIC_SPACING.md,
  },

  // Start phase
  iconContainer: {
    marginBottom: COSMIC_SPACING.lg,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: COSMIC_SPACING.md,
  },
  instruction: {
    marginBottom: COSMIC_SPACING.xl,
    textAlign: 'center',
    paddingHorizontal: COSMIC_SPACING.md,
  },
  startButton: {
    marginTop: COSMIC_SPACING.lg,
  },
  durationText: {
    fontSize: 14,
    color: COSMIC_COLORS.text.muted,
    marginTop: COSMIC_SPACING.md,
  },

  // Step indicator
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: COSMIC_SPACING.lg,
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  stepDotActive: {
    backgroundColor: THEME.primary,
    width: 24,
  },
  stepDotCompleted: {
    backgroundColor: THEME.secondary,
  },

  // Visual container
  visualContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 280,
    marginBottom: COSMIC_SPACING.lg,
  },
  progressOverlay: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Glass
  glassContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glassOuterGlow: {
    position: 'absolute',
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    opacity: 0.3,
  },

  // Ripples
  ripplesContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ripple: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: THEME.glow,
  },

  // Energy lines
  energyLinesContainer: {
    position: 'absolute',
    width: 300,
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  energyLine: {
    position: 'absolute',
  },

  // Step content
  stepContent: {
    flex: 1,
    alignItems: 'center',
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: COSMIC_COLORS.text.primary,
    marginBottom: COSMIC_SPACING.sm,
    textAlign: 'center',
  },
  stepDescription: {
    fontSize: 16,
    color: COSMIC_COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: COSMIC_SPACING.lg,
  },

  // Input
  inputCard: {
    width: '100%',
    marginBottom: COSMIC_SPACING.lg,
  },
  intentionInput: {
    fontSize: 16,
    color: COSMIC_COLORS.text.primary,
    minHeight: 100,
    textAlignVertical: 'top',
  },

  // Charging
  chargingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: COSMIC_SPACING.sm,
    marginBottom: COSMIC_SPACING.lg,
  },
  chargingText: {
    fontSize: 16,
    color: THEME.primary,
    fontWeight: '500',
  },

  // Action button
  actionButton: {
    marginBottom: COSMIC_SPACING.lg,
  },
});

export default WaterManifestRitual;
