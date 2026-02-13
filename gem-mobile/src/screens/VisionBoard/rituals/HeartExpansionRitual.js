/**
 * HeartExpansionRitual - Mở Rộng Trái Tim
 * Cosmic Glassmorphism Redesign
 * 4 Phases: Intro → Breath Sync → Heart Expansion → Completion
 */

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
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
  interpolate,
  Extrapolation,
  cancelAnimation,
} from 'react-native-reanimated';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import { Heart, Sparkles, Send } from 'lucide-react-native';

import { useAuth } from '../../../contexts/AuthContext';
import { completeRitual, saveReflection } from '../../../services/ritualService';
import ritualSoundService from '../../../services/ritualSoundService';
import useVideoPause from '../../../hooks/useVideoPause';

// Cosmic Components
import {
  VideoBackground,
  RitualAnimation,
  GlassCard,
  GlassInputCard,
  GlowingOrb,
  GlowButton,
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

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ============================================
// CONFIG
// ============================================

const CONFIG = {
  duration: 7 * 60, // 7 minutes total
  breathCycles: 4,
  breathPattern: { inhale: 4000, hold: 2000, exhale: 6000 }, // milliseconds
  expansionDuration: 150, // seconds for expansion phase
  xpReward: 25,
};

const THEME = COSMIC_COLORS.ritualThemes.heart;

// ============================================
// LOVE TARGET BUTTONS
// ============================================

const LoveTargetButton = ({ label, icon, selected, onPress, delay }) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 400 }));
    translateY.value = withDelay(delay, withSpring(0, COSMIC_TIMING.spring.gentle));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <GlowButton
        label={label}
        icon={icon}
        variant={selected ? 'heart' : 'outline'}
        size="small"
        onPress={onPress}
        style={styles.targetButton}
      />
    </Animated.View>
  );
};

// ============================================
// EXPANDING RINGS
// ============================================

const ExpandingRing = ({ index, active, color }) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (active) {
      scale.value = 1;
      opacity.value = 0.6;
      scale.value = withDelay(
        index * 200,
        withTiming(2.5, { duration: 1000, easing: COSMIC_TIMING.easing.smoothOut })
      );
      opacity.value = withDelay(
        index * 200,
        withTiming(0, { duration: 1000, easing: COSMIC_TIMING.easing.smoothOut })
      );
    }
  }, [active]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.expandingRing,
        { borderColor: color },
        animatedStyle,
      ]}
    />
  );
};

// ============================================
// MAIN COMPONENT
// ============================================

const HeartExpansionRitual = ({ navigation }) => {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const shouldPauseVideo = useVideoPause();
  const heartAnimationRef = useRef(null);

  // ===== STATE =====
  const [phase, setPhase] = useState('intro'); // intro, breath, expansion, completion
  const [breathCycle, setBreathCycle] = useState(0);
  const [breathPhase, setBreathPhase] = useState('idle'); // idle, inhale, hold, exhale
  const [energyLevel, setEnergyLevel] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(CONFIG.expansionDuration);
  const [isSoundOn, setIsSoundOn] = useState(true);
  const [reflection, setReflection] = useState('');
  const [showReflection, setShowReflection] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);
  const [streak, setStreak] = useState(0);
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [expandRingsActive, setExpandRingsActive] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  // ===== REFS =====
  const breathTimerRef = useRef(null);
  const expansionTimerRef = useRef(null);
  const energyLevelRef = useRef(0); // Track energyLevel for interval

  // ===== ANIMATION VALUES =====
  const orbGlowIntensity = useSharedValue(0.6);
  const contentOpacity = useSharedValue(1);

  // ===== SYNC ENERGY LEVEL REF =====
  useEffect(() => {
    energyLevelRef.current = energyLevel;
  }, [energyLevel]);

  // ===== CLEANUP =====
  useEffect(() => {
    return () => {
      if (breathTimerRef.current) clearTimeout(breathTimerRef.current);
      if (expansionTimerRef.current) clearInterval(expansionTimerRef.current);
    };
  }, []);

  // ===== SOUND MANAGEMENT =====
  useEffect(() => {
    // Initialize sound service
    ritualSoundService.init();

    return () => {
      // Cleanup sounds on unmount
      ritualSoundService.stopAll();
    };
  }, []);

  // Start/stop ambient based on phase and sound toggle
  useEffect(() => {
    if (isSoundOn && (phase === 'breath' || phase === 'expansion')) {
      ritualSoundService.startAmbient('heart-expansion', 0.4);
    } else {
      ritualSoundService.stopAmbient();
    }
  }, [phase, isSoundOn]);

  // ===== BREATH LOGIC =====
  const runBreathPhase = useCallback((phaseType) => {
    setBreathPhase(phaseType);
    HAPTIC_PATTERNS.breath[phaseType === 'hold' ? 'hold' : phaseType === 'inhale' ? 'inhale' : 'exhale']();

    const duration = CONFIG.breathPattern[phaseType] || CONFIG.breathPattern.inhale;

    breathTimerRef.current = setTimeout(() => {
      if (phaseType === 'inhale') {
        runBreathPhase('hold');
      } else if (phaseType === 'hold') {
        runBreathPhase('exhale');
      } else if (phaseType === 'exhale') {
        // Cycle complete
        HAPTIC_PATTERNS.breath.cycleComplete();
        setBreathCycle(prev => {
          const newCycle = prev + 1;
          if (newCycle >= CONFIG.breathCycles) {
            // Move to expansion phase
            setTimeout(() => {
              contentOpacity.value = withTiming(0, { duration: 300 });
              setTimeout(() => {
                setPhase('expansion');
                contentOpacity.value = withTiming(1, { duration: 400 });
              }, 300);
            }, 500);
          } else {
            // Next cycle
            setTimeout(() => runBreathPhase('inhale'), 800);
          }
          return newCycle;
        });
      }
    }, duration);
  }, []);

  // ===== START BREATH =====
  const handleStart = useCallback(() => {
    HAPTIC_PATTERNS.tap();
    contentOpacity.value = withTiming(0, { duration: 300 });
    setTimeout(() => {
      setPhase('breath');
      setBreathCycle(0);
      contentOpacity.value = withTiming(1, { duration: 400 });
      setTimeout(() => runBreathPhase('inhale'), 500);
    }, 300);
  }, [runBreathPhase]);

  // ===== EXPANSION TIMER =====
  useEffect(() => {
    if (phase === 'expansion') {
      // Reset timer when entering expansion phase
      setTimeRemaining(CONFIG.expansionDuration);

      expansionTimerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          // Use ref to get latest energyLevel (avoids stale closure)
          if (prev <= 1 || energyLevelRef.current >= 100) {
            clearInterval(expansionTimerRef.current);
            handleComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (expansionTimerRef.current) clearInterval(expansionTimerRef.current);
    };
  }, [phase]); // Removed energyLevel - using ref instead

  // ===== HEART GESTURES =====
  const handleHeartPress = useCallback(() => {
    HAPTIC_PATTERNS.tap();
    orbGlowIntensity.value = withSequence(
      withTiming(1, { duration: 150 }),
      withTiming(0.6, { duration: 300 })
    );

    if (phase === 'expansion') {
      setEnergyLevel(prev => Math.min(100, prev + 5));
      // Play sparkle sound on heart tap
      if (isSoundOn) ritualSoundService.playSparkle();
    }
  }, [phase, isSoundOn]);

  const handleHeartLongPress = useCallback(() => {
    HAPTIC_PATTERNS.energy.build(1);
    setExpandRingsActive(true);
    setTimeout(() => setExpandRingsActive(false), 100);

    if (phase === 'expansion') {
      setEnergyLevel(prev => Math.min(100, prev + 15));
    }
  }, [phase]);

  // ===== COMPLETE HANDLER =====
  const handleComplete = async () => {
    HAPTIC_PATTERNS.celebration();
    setShowCelebration(true);

    // Play completion sound and stop ambient
    if (isSoundOn) {
      ritualSoundService.stopAmbient();
      ritualSoundService.playComplete('heart-expansion');
    }

    try {
      if (user?.id) {
        const result = await completeRitual(user.id, 'heart-expansion', {
          energyLevel,
          breathCycles: breathCycle,
          reflection,
        });
        setXpEarned(result?.xpEarned || CONFIG.xpReward);
        setStreak(result?.newStreak || 1);
      } else {
        setXpEarned(CONFIG.xpReward);
        setStreak(1);
      }
    } catch (err) {
      console.error('[HeartExpansionRitual] Complete error:', err);
      setXpEarned(CONFIG.xpReward);
      setStreak(1);
    }
  };

  // ===== NAVIGATION HANDLERS =====
  const handleBack = useCallback(() => {
    if (breathTimerRef.current) clearTimeout(breathTimerRef.current);
    if (expansionTimerRef.current) clearInterval(expansionTimerRef.current);
    navigation.goBack();
  }, [navigation]);

  const handleContinue = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  // ===== SKIP BREATH =====
  const handleSkipBreath = useCallback(() => {
    if (breathTimerRef.current) clearTimeout(breathTimerRef.current);
    contentOpacity.value = withTiming(0, { duration: 300 });
    setTimeout(() => {
      setPhase('expansion');
      contentOpacity.value = withTiming(1, { duration: 400 });
    }, 300);
  }, []);

  // ===== FORMAT TIME =====
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // ===== ANIMATED STYLES =====
  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  // ===== RENDER INTRO PHASE =====
  const renderIntro = () => (
    <Animated.View style={[styles.phaseContainer, contentAnimatedStyle]}>
      <GlowingOrb
        size={180}
        color={THEME.primary}
        secondaryColor={THEME.secondary}
        gradient={THEME.gradient}
        icon={<Heart />}
        iconSize={70}
        pulseSpeed={2000}
        glowIntensity={0.8}
        onPress={handleHeartPress}
        showRipples={true}
      />

      <View style={styles.introTextContainer}>
        <TitleText text="Mở Rộng Trái Tim" color={THEME.primary} />
        <SubtitleText text="Hít vào – mở rộng, thở ra – yêu thương lan tỏa" />
      </View>

      <GlowButton
        label="Bắt đầu nghi thức"
        variant="heart"
        size="large"
        fullWidth
        onPress={handleStart}
        style={styles.startButton}
      />

      <Text style={styles.durationText}>7 phút • Chữa lành cảm xúc</Text>
    </Animated.View>
  );

  // ===== RENDER BREATH PHASE =====
  const renderBreath = () => (
    <Animated.View style={[styles.phaseContainer, contentAnimatedStyle]}>
      <PulsingCircle
        size={220}
        pattern="inhale-exhale"
        customPattern={{
          phases: [
            { name: 'inhale', label: 'Hít vào', duration: CONFIG.breathPattern.inhale, scale: 1.3 },
            { name: 'hold', label: 'Giữ', duration: CONFIG.breathPattern.hold, scale: 1.3 },
            { name: 'exhale', label: 'Thở ra', duration: CONFIG.breathPattern.exhale, scale: 1 },
          ],
        }}
        color={THEME.primary}
        cycles={CONFIG.breathCycles}
        showGuide={true}
        showPhaseLabel={true}
        showTimer={true}
        showPhaseIndicators={true}
        hapticFeedback={true}
        onCycleComplete={(cycle) => setBreathCycle(cycle)}
        onComplete={() => {
          contentOpacity.value = withTiming(0, { duration: 300 });
          setTimeout(() => {
            setPhase('expansion');
            contentOpacity.value = withTiming(1, { duration: 400 });
          }, 300);
        }}
        autoStart={true}
      />

      <InstructionText
        text="Đặt tay lên tim, cảm nhận nhịp đập"
        variant="default"
        color={COSMIC_COLORS.text.secondary}
        style={styles.breathInstruction}
      />

      <View style={styles.breathActions}>
        <GlowButton
          label="Bỏ qua"
          variant="ghost"
          size="small"
          onPress={handleSkipBreath}
        />
      </View>
    </Animated.View>
  );

  // ===== RENDER EXPANSION PHASE =====
  const renderExpansion = () => (
    <Animated.View style={[styles.phaseContainer, contentAnimatedStyle]}>
      {/* Expanding rings container */}
      <View style={styles.heartAreaContainer}>
        {[0, 1, 2].map(index => (
          <ExpandingRing
            key={index}
            index={index}
            active={expandRingsActive}
            color={THEME.primary}
          />
        ))}

        <GlowingOrb
          size={160}
          color={THEME.primary}
          secondaryColor={THEME.secondary}
          gradient={THEME.gradient}
          icon={<Heart />}
          iconSize={60}
          pulseSpeed={1500}
          glowIntensity={0.9}
          onPress={handleHeartPress}
          onLongPress={handleHeartLongPress}
          showRipples={true}
        />
      </View>

      <InstructionText
        text="Chạm liên tục vào trái tim để tăng năng lượng. Chọn Bản thân, Người thân hoặc Vũ trụ để gửi yêu thương đến nơi bạn muốn."
        variant="default"
        color={COSMIC_COLORS.text.secondary}
        style={styles.expansionInstruction}
      />

      {/* Love targets */}
      <View style={styles.targetsContainer}>
        <LoveTargetButton
          label="Bản thân"
          icon={<Heart size={16} />}
          selected={selectedTarget === 'self'}
          onPress={() => {
            setSelectedTarget('self');
            setEnergyLevel(prev => Math.min(100, prev + 10));
            HAPTIC_PATTERNS.tap();
          }}
          delay={0}
        />
        <LoveTargetButton
          label="Người thân"
          icon={<Heart size={16} />}
          selected={selectedTarget === 'family'}
          onPress={() => {
            setSelectedTarget('family');
            setEnergyLevel(prev => Math.min(100, prev + 10));
            HAPTIC_PATTERNS.tap();
          }}
          delay={100}
        />
        <LoveTargetButton
          label="Vũ trụ"
          icon={<Sparkles size={16} />}
          selected={selectedTarget === 'universe'}
          onPress={() => {
            setSelectedTarget('universe');
            setEnergyLevel(prev => Math.min(100, prev + 10));
            HAPTIC_PATTERNS.tap();
          }}
          delay={200}
        />
      </View>

      {/* Energy bar */}
      <GlassCard variant="subtle" padding={COSMIC_SPACING.md} style={styles.energyCard}>
        <View style={styles.energyRow}>
          <Text style={styles.energyLabel}>Năng lượng yêu thương</Text>
          <Text style={styles.energyPercent}>{energyLevel}%</Text>
        </View>
        <View style={styles.energyBarBg}>
          <Animated.View
            style={[
              styles.energyBarFill,
              { width: `${energyLevel}%`, backgroundColor: THEME.primary },
            ]}
          />
        </View>
      </GlassCard>

      {/* Timer */}
      <Text style={styles.timerText}>
        Thời gian còn: {formatTime(timeRemaining)}
      </Text>
    </Animated.View>
  );

  // ===== MAIN RENDER =====
  return (
    <GestureHandlerRootView style={styles.container}>
      <VideoBackground ritualId="heart-expansion" paused={shouldPauseVideo}>
        {/* Heart particles overlay */}
        {phase === 'expansion' && (
          <ParticleField
            variant="hearts"
            count={20}
            speed="slow"
            density="low"
            direction="float"
          />
        )}

        <SafeAreaView style={styles.safeArea} edges={['top']}>
          {/* Header */}
          <RitualHeader
            title="Mở Rộng Trái Tim"
            icon={<Heart />}
            iconColor={THEME.primary}
            onBack={handleBack}
            showSound={true}
            soundEnabled={isSoundOn}
            onSoundToggle={() => setIsSoundOn(!isSoundOn)}
            showTimer={phase === 'expansion'}
            timeRemaining={timeRemaining}
          />

          {/* Content */}
          <View style={styles.content}>
            {phase === 'intro' && renderIntro()}
            {phase === 'breath' && renderBreath()}
            {phase === 'expansion' && renderExpansion()}
            {/* Bottom padding for tab bar */}
            <View style={{ height: Math.max(insets.bottom, 20) + 80 }} />
          </View>
        </SafeAreaView>

        {/* Celebration overlay */}
        <CompletionCelebration
          ritualType="heart"
          xpEarned={xpEarned}
          streakCount={streak}
          isNewRecord={streak > 0}
          message="Trái tim bạn đã được mở rộng. Yêu thương đang lan tỏa."
          visible={showCelebration}
          onContinue={handleContinue}
          onWriteReflection={async (text) => {
            setReflection(text);
            // Save reflection to database and calendar
            if (user?.id) {
              await saveReflection(user.id, 'heart-expansion', text);
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
  phaseContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 20,
  },

  // Intro
  introTextContainer: {
    alignItems: 'center',
    marginTop: COSMIC_SPACING.xl,
    marginBottom: COSMIC_SPACING.xl,
  },
  startButton: {
    marginTop: COSMIC_SPACING.lg,
  },
  durationText: {
    fontSize: 14,
    color: COSMIC_COLORS.text.muted,
    marginTop: COSMIC_SPACING.md,
  },

  // Breath
  breathInstruction: {
    marginTop: COSMIC_SPACING.xl,
  },
  breathActions: {
    marginTop: COSMIC_SPACING.xl,
  },

  // Expansion
  heartAreaContainer: {
    width: 250,
    height: 250,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: COSMIC_SPACING.lg,
  },
  expandingRing: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 2,
  },
  expansionInstruction: {
    marginBottom: COSMIC_SPACING.lg,
  },
  targetsContainer: {
    flexDirection: 'row',
    gap: COSMIC_SPACING.sm,
    marginBottom: COSMIC_SPACING.xl,
  },
  targetButton: {
    minWidth: 100,
  },
  energyCard: {
    width: '100%',
    marginBottom: COSMIC_SPACING.md,
  },
  energyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: COSMIC_SPACING.sm,
  },
  energyLabel: {
    fontSize: 14,
    color: COSMIC_COLORS.text.secondary,
  },
  energyPercent: {
    fontSize: 16,
    fontWeight: '600',
    color: COSMIC_COLORS.ritualThemes.heart.primary,
  },
  energyBarBg: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  energyBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  timerText: {
    fontSize: 14,
    color: COSMIC_COLORS.text.muted,
  },
});

export default HeartExpansionRitual;
