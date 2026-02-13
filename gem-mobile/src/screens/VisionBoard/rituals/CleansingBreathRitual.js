/**
 * CleansingBreathRitual - Hơi Thở Thanh Lọc
 * Cosmic Glassmorphism Redesign
 * Box Breathing Pattern: 4-4-4-4 (Inhale-Hold-Exhale-Rest)
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  withSequence,
  withRepeat,
  runOnJS,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Wind, Leaf, Play, Pause, RotateCcw } from 'lucide-react-native';

import { useAuth } from '../../../contexts/AuthContext';
import { completeRitual, saveReflection } from '../../../services/ritualService';
import ritualSoundService from '../../../services/ritualSoundService';

// Cosmic Components
import {
  VideoBackground,
  GlassCard,
  GlowingOrb,
  GlowButton,
  GlowIconButton,
  ParticleField,
  PulsingCircle,
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
import useVideoPause from '../../../hooks/useVideoPause';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const THEME = COSMIC_COLORS.ritualThemes.breath;

const CONFIG = {
  cycles: 4,
  breathPattern: {
    inhale: { duration: 4000, label: 'Hít vào', color: THEME.phases.inhale },
    hold: { duration: 4000, label: 'Giữ', color: THEME.phases.hold },
    exhale: { duration: 4000, label: 'Thở ra', color: THEME.phases.exhale },
    rest: { duration: 4000, label: 'Nghỉ', color: THEME.phases.rest },
  },
  xpReward: 35,
};

// Phase order for box breathing
const PHASE_ORDER = ['inhale', 'hold', 'exhale', 'rest'];

// ============================================
// PHASE INDICATOR COMPONENT
// ============================================

const PhaseIndicator = ({ phases, currentPhase }) => {
  return (
    <View style={styles.phaseIndicatorContainer}>
      {phases.map((phase, index) => {
        const isActive = phase === currentPhase;
        const isPast = phases.indexOf(currentPhase) > index;
        const config = CONFIG.breathPattern[phase];

        return (
          <View key={phase} style={styles.phaseIndicatorItem}>
            <View
              style={[
                styles.phaseIndicatorDot,
                {
                  backgroundColor: isActive ? config.color : isPast ? config.color : 'rgba(255,255,255,0.2)',
                  transform: [{ scale: isActive ? 1.3 : 1 }],
                },
              ]}
            />
            <Text
              style={[
                styles.phaseIndicatorLabel,
                { color: isActive ? config.color : COSMIC_COLORS.text.muted },
              ]}
            >
              {config.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
};

// ============================================
// BREATHING CIRCLE COMPONENT
// ============================================

const BreathingCircle = ({ phase, timer, isActive }) => {
  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.3);

  const phaseConfig = CONFIG.breathPattern[phase];
  const currentColor = phaseConfig?.color || THEME.primary;

  useEffect(() => {
    if (!isActive) return;

    const targetScale = phase === 'inhale' || phase === 'hold' ? 1.4 : 1;
    const duration = phaseConfig?.duration || 4000;

    scale.value = withTiming(targetScale, {
      duration,
      easing: COSMIC_TIMING.easing.breath,
    });

    glowOpacity.value = withTiming(phase === 'inhale' || phase === 'hold' ? 0.7 : 0.3, {
      duration: duration / 2,
    });
  }, [phase, isActive]);

  const circleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  return (
    <View style={styles.breathingCircleContainer}>
      {/* Outer glow */}
      <Animated.View
        style={[
          styles.breathingGlow,
          { backgroundColor: currentColor },
          glowStyle,
        ]}
      />

      {/* Main circle */}
      <Animated.View style={[styles.breathingCircle, circleStyle]}>
        <View style={[styles.breathingCircleInner, { borderColor: currentColor }]}>
          <Text style={[styles.phaseText, { color: currentColor }]}>
            {phaseConfig?.label || ''}
          </Text>
          <Text style={styles.timerText}>{timer}s</Text>
        </View>
      </Animated.View>
    </View>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================

const CleansingBreathRitual = ({ navigation }) => {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const shouldPauseVideo = useVideoPause();

  // State
  const [ritualPhase, setRitualPhase] = useState('intro'); // intro, breathing, completed
  const [breathPhase, setBreathPhase] = useState('inhale');
  const [currentCycle, setCurrentCycle] = useState(1);
  const [timer, setTimer] = useState(4);
  const [isPaused, setIsPaused] = useState(false);
  const [isSoundOn, setIsSoundOn] = useState(true);
  const [xpEarned, setXpEarned] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [reflection, setReflection] = useState('');

  // Refs
  const timerRef = useRef(null);
  const phaseIndexRef = useRef(0);

  // Animation values
  const contentOpacity = useSharedValue(1);

  // Cleanup
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // ===== SOUND MANAGEMENT =====
  useEffect(() => {
    ritualSoundService.init();
    return () => {
      ritualSoundService.stopAll();
    };
  }, []);

  // Start/stop ambient based on phase and sound toggle
  useEffect(() => {
    if (isSoundOn && ritualPhase === 'breathing' && !isPaused) {
      ritualSoundService.startAmbient('cleansing-breath', 0.3);
    } else {
      ritualSoundService.pauseAmbient();
    }
  }, [ritualPhase, isSoundOn, isPaused]);

  // Play breath cue sounds
  useEffect(() => {
    if (!isSoundOn || ritualPhase !== 'breathing') return;

    if (breathPhase === 'inhale') {
      ritualSoundService.playInhale();
    } else if (breathPhase === 'hold' || breathPhase === 'rest') {
      ritualSoundService.playHold();
    } else if (breathPhase === 'exhale') {
      ritualSoundService.playExhale();
    }
  }, [breathPhase, isSoundOn, ritualPhase]);

  // Breathing logic
  const startBreathing = useCallback(() => {
    setRitualPhase('breathing');
    setBreathPhase('inhale');
    setCurrentCycle(1);
    setTimer(4);
    phaseIndexRef.current = 0;
    runBreathingCycle();
  }, []);

  const runBreathingCycle = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);

    let countdown = 4;
    setTimer(countdown);

    timerRef.current = setInterval(() => {
      if (isPaused) return;

      countdown--;
      setTimer(countdown);

      if (countdown <= 0) {
        // Move to next phase
        phaseIndexRef.current = (phaseIndexRef.current + 1) % PHASE_ORDER.length;
        const nextPhase = PHASE_ORDER[phaseIndexRef.current];

        // Haptic feedback
        HAPTIC_PATTERNS.breath[nextPhase === 'hold' || nextPhase === 'rest' ? 'hold' : nextPhase]();

        // Check if cycle complete
        if (phaseIndexRef.current === 0) {
          setCurrentCycle(prev => {
            const newCycle = prev + 1;
            if (newCycle > CONFIG.cycles) {
              // Ritual complete
              clearInterval(timerRef.current);
              handleComplete();
              return prev;
            }
            return newCycle;
          });
        }

        setBreathPhase(nextPhase);
        countdown = 4;
        setTimer(countdown);
      }
    }, 1000);
  }, [isPaused]);

  // Pause/Resume effect
  useEffect(() => {
    if (ritualPhase === 'breathing' && !isPaused) {
      runBreathingCycle();
    }
  }, [isPaused, ritualPhase]);

  const handlePauseResume = useCallback(() => {
    HAPTIC_PATTERNS.tap();
    setIsPaused(prev => !prev);
  }, []);

  const handleRestart = useCallback(() => {
    HAPTIC_PATTERNS.tap();
    if (timerRef.current) clearInterval(timerRef.current);
    startBreathing();
  }, [startBreathing]);

  const handleComplete = async () => {
    HAPTIC_PATTERNS.breath.cycleComplete();
    setShowCelebration(true);

    // Play completion sound and stop ambient
    if (isSoundOn) {
      ritualSoundService.stopAmbient();
      ritualSoundService.playComplete('cleansing-breath');
    }

    try {
      if (user?.id) {
        const result = await completeRitual(user.id, 'cleansing-breath', {
          completedCycles: CONFIG.cycles,
          reflection,
        });
        setXpEarned(result?.xpEarned || CONFIG.xpReward);
        setStreak(result?.newStreak || 1);
      } else {
        setXpEarned(CONFIG.xpReward);
        setStreak(1);
      }
    } catch (err) {
      console.error('[CleansingBreathRitual] Complete error:', err);
      setXpEarned(CONFIG.xpReward);
      setStreak(1);
    }
  };

  const handleBack = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    navigation.goBack();
  }, [navigation]);

  const handleContinue = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleStart = useCallback(() => {
    HAPTIC_PATTERNS.tap();
    contentOpacity.value = withTiming(0, { duration: 300 });
    setTimeout(() => {
      startBreathing();
      contentOpacity.value = withTiming(1, { duration: 400 });
    }, 300);
  }, [startBreathing]);

  // Animated styles
  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  // Progress calculation
  const totalPhases = CONFIG.cycles * 4;
  const completedPhases = (currentCycle - 1) * 4 + phaseIndexRef.current;
  const progress = completedPhases / totalPhases;

  // Render Intro
  const renderIntro = () => (
    <Animated.View style={[styles.phaseContainer, contentAnimatedStyle]}>
      <GlowingOrb
        size={180}
        color={THEME.primary}
        secondaryColor={THEME.secondary}
        gradient={THEME.gradient}
        icon={<Wind />}
        iconSize={70}
        pulseSpeed={3000}
        glowIntensity={0.7}
        showRipples={false}
      />

      <View style={styles.textContainer}>
        <TitleText text="Hơi Thở Thanh Lọc" color={THEME.primary} />
        <SubtitleText text="Box Breathing - Thanh lọc tâm trí" />
      </View>

      <GlassCard variant="subtle" padding={COSMIC_SPACING.lg} style={styles.infoCard}>
        <Text style={styles.infoTitle}>Kỹ thuật Box Breathing</Text>
        <View style={styles.infoRow}>
          <View style={[styles.infoDot, { backgroundColor: THEME.phases.inhale }]} />
          <Text style={styles.infoText}>Hít vào 4 giây</Text>
        </View>
        <View style={styles.infoRow}>
          <View style={[styles.infoDot, { backgroundColor: THEME.phases.hold }]} />
          <Text style={styles.infoText}>Giữ 4 giây</Text>
        </View>
        <View style={styles.infoRow}>
          <View style={[styles.infoDot, { backgroundColor: THEME.phases.exhale }]} />
          <Text style={styles.infoText}>Thở ra 4 giây</Text>
        </View>
        <View style={styles.infoRow}>
          <View style={[styles.infoDot, { backgroundColor: THEME.phases.rest }]} />
          <Text style={styles.infoText}>Nghỉ 4 giây</Text>
        </View>
      </GlassCard>

      <GlowButton
        label="Bắt đầu thở"
        variant="breath"
        size="large"
        fullWidth
        onPress={handleStart}
        style={styles.startButton}
      />

      <Text style={styles.durationText}>{CONFIG.cycles} chu kỳ • ~3 phút</Text>
    </Animated.View>
  );

  // Render Breathing
  const renderBreathing = () => (
    <Animated.View style={[styles.phaseContainer, contentAnimatedStyle]}>
      {/* Phase indicators */}
      <PhaseIndicator phases={PHASE_ORDER} currentPhase={breathPhase} />

      {/* Breathing circle */}
      <BreathingCircle phase={breathPhase} timer={timer} isActive={!isPaused} />

      {/* Cycle progress */}
      <View style={styles.cycleContainer}>
        <Text style={styles.cycleText}>
          Chu kỳ {currentCycle}/{CONFIG.cycles}
        </Text>
        <ProgressRing
          progress={progress}
          size={60}
          strokeWidth={4}
          color={THEME.primary}
          showPercentage={false}
          showGlow={false}
        />
      </View>

      {/* Controls */}
      <View style={styles.controlsContainer}>
        <GlowIconButton
          icon={<RotateCcw />}
          variant="outline"
          size="medium"
          onPress={handleRestart}
        />
        <GlowButton
          label={isPaused ? 'Tiếp tục' : 'Tạm dừng'}
          icon={isPaused ? <Play /> : <Pause />}
          variant={isPaused ? 'breath' : 'outline'}
          size="medium"
          onPress={handlePauseResume}
        />
      </View>
    </Animated.View>
  );

  // Main render
  return (
    <GestureHandlerRootView style={styles.container}>
      <VideoBackground ritualId="cleansing-breath" paused={shouldPauseVideo}>
        {/* Air particles */}
        <ParticleField
          variant="energy"
          count={20}
          speed="slow"
          density="low"
          direction="float"
          color={THEME.primary}
        />

        <SafeAreaView style={styles.safeArea} edges={['top']}>
          {/* Header */}
          <RitualHeader
            title="Hơi Thở Thanh Lọc"
            icon={<Wind />}
            iconColor={THEME.primary}
            onBack={handleBack}
            showSound={true}
            soundEnabled={isSoundOn}
            onSoundToggle={() => setIsSoundOn(!isSoundOn)}
          />

          {/* Content */}
          <View style={styles.content}>
            {ritualPhase === 'intro' && renderIntro()}
            {ritualPhase === 'breathing' && renderBreathing()}
            {/* Bottom padding for tab bar */}
            <View style={{ height: Math.max(insets.bottom, 20) + 80 }} />
          </View>
        </SafeAreaView>

        {/* Celebration overlay */}
        <CompletionCelebration
          ritualType="breath"
          xpEarned={xpEarned}
          streakCount={streak}
          isNewRecord={streak > 0}
          message="Tâm trí bạn đã được thanh lọc. Hãy cảm nhận sự bình an."
          visible={showCelebration}
          onContinue={handleContinue}
          onWriteReflection={async (text) => {
            setReflection(text);
            if (user?.id) {
              await saveReflection(user.id, 'cleansing-breath', text);
            }
          }}
          showVisionBoardButton={false}
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
  phaseContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 20,
  },

  // Intro
  textContainer: {
    alignItems: 'center',
    marginTop: COSMIC_SPACING.xl,
    marginBottom: COSMIC_SPACING.lg,
  },
  infoCard: {
    width: '100%',
    marginBottom: COSMIC_SPACING.xl,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COSMIC_COLORS.text.primary,
    marginBottom: COSMIC_SPACING.md,
    textAlign: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: COSMIC_SPACING.sm,
  },
  infoDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: COSMIC_SPACING.sm,
  },
  infoText: {
    fontSize: 14,
    color: COSMIC_COLORS.text.secondary,
  },
  startButton: {
    marginTop: COSMIC_SPACING.md,
  },
  durationText: {
    fontSize: 14,
    color: COSMIC_COLORS.text.muted,
    marginTop: COSMIC_SPACING.md,
  },

  // Phase indicators
  phaseIndicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: COSMIC_SPACING.lg,
    marginBottom: COSMIC_SPACING.xl,
  },
  phaseIndicatorItem: {
    alignItems: 'center',
  },
  phaseIndicatorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: COSMIC_SPACING.xs,
  },
  phaseIndicatorLabel: {
    fontSize: 12,
  },

  // Breathing circle
  breathingCircleContainer: {
    width: 250,
    height: 250,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: COSMIC_SPACING.xl,
  },
  // OPTIMIZED: Reduced shadowRadius from 40 to 15
  breathingGlow: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 15,
  },
  breathingCircle: {
    width: 180,
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
  },
  breathingCircleInner: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(13, 13, 43, 0.6)',
  },
  phaseText: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: COSMIC_SPACING.xs,
  },
  timerText: {
    fontSize: 48,
    fontWeight: '300',
    color: COSMIC_COLORS.text.primary,
  },

  // Cycle info
  cycleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: COSMIC_SPACING.md,
    marginBottom: COSMIC_SPACING.xl,
  },
  cycleText: {
    fontSize: 16,
    color: COSMIC_COLORS.text.secondary,
  },

  // Controls
  controlsContainer: {
    flexDirection: 'row',
    gap: COSMIC_SPACING.md,
  },
});

export default CleansingBreathRitual;
