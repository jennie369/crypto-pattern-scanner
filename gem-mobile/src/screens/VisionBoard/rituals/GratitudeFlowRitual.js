/**
 * GratitudeFlowRitual - Dòng Chảy Biết Ơn
 * Cosmic Glassmorphism Redesign
 * Phases: Start → Input → Sending → Completed
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  withSequence,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Gift, Sparkles, Plus, X, Send, Check } from 'lucide-react-native';

import { useAuth } from '../../../contexts/AuthContext';
import { completeRitual } from '../../../services/ritualService';

// Cosmic Components
import {
  CosmicBackground,
  GlassCard,
  GlassInputCard,
  GlowingOrb,
  GlowButton,
  GlowIconButton,
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

const THEME = COSMIC_COLORS.ritualThemes.gratitude;

const CONFIG = {
  maxGratitudes: 5,
  minGratitudes: 3,
  xpReward: 30,
  sendAnimationDuration: 3000,
};

// ============================================
// GRATITUDE ITEM COMPONENT
// ============================================

const GratitudeItem = ({ text, index, onRemove, sending }) => {
  const opacity = useSharedValue(0);
  const translateX = useSharedValue(-30);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    opacity.value = withDelay(index * 100, withTiming(1, { duration: 300 }));
    translateX.value = withDelay(index * 100, withSpring(0, COSMIC_TIMING.spring.gentle));
  }, []);

  useEffect(() => {
    if (sending) {
      // Animate flying up like stars
      const delay = index * 400;
      opacity.value = withDelay(delay + 1500, withTiming(0, { duration: 500 }));
      translateY.value = withDelay(delay, withTiming(-300, {
        duration: 2000,
        easing: COSMIC_TIMING.easing.smoothIn,
      }));
      scale.value = withDelay(delay, withSequence(
        withTiming(1.1, { duration: 200 }),
        withTiming(0.3, { duration: 1800 })
      ));
    }
  }, [sending]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <GlassCard variant="glow" glowColor={THEME.glow} padding={COSMIC_SPACING.md}>
        <View style={styles.gratitudeItemContent}>
          <Sparkles size={18} color={THEME.primary} strokeWidth={2} />
          <Text style={styles.gratitudeText}>{text}</Text>
          {onRemove && !sending && (
            <GlowIconButton
              icon={<X />}
              variant="ghost"
              size="small"
              onPress={onRemove}
            />
          )}
        </View>
      </GlassCard>
    </Animated.View>
  );
};

// ============================================
// GOLDEN JAR COMPONENT
// ============================================

const GoldenJar = ({ fillLevel, shimmer }) => {
  const shimmerValue = useSharedValue(0);

  useEffect(() => {
    if (shimmer) {
      shimmerValue.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 1000, easing: COSMIC_TIMING.easing.gentle }),
          withTiming(0, { duration: 1000, easing: COSMIC_TIMING.easing.gentle })
        ),
        -1,
        true
      );
    }
  }, [shimmer]);

  return (
    <GlowingOrb
      size={180}
      color={THEME.primary}
      secondaryColor={THEME.secondary}
      gradient={THEME.gradient}
      icon={<Gift />}
      iconSize={70}
      pulseSpeed={2500}
      glowIntensity={0.6 + fillLevel * 0.4}
      showRipples={false}
    />
  );
};

// ============================================
// MAIN COMPONENT
// ============================================

const GratitudeFlowRitual = ({ navigation }) => {
  const { user } = useAuth();

  // State
  const [phase, setPhase] = useState('start'); // start, input, sending, completed
  const [gratitudes, setGratitudes] = useState([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isSoundOn, setIsSoundOn] = useState(true);
  const [xpEarned, setXpEarned] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);

  // Animation values
  const contentOpacity = useSharedValue(1);
  const jarShimmer = useSharedValue(0);

  // Content animation style
  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  // Handlers
  const handleStart = useCallback(() => {
    HAPTIC_PATTERNS.tap();
    contentOpacity.value = withTiming(0, { duration: 300 });
    setTimeout(() => {
      setPhase('input');
      contentOpacity.value = withTiming(1, { duration: 400 });
    }, 300);
  }, []);

  const handleAddGratitude = useCallback(() => {
    if (!currentInput.trim() || gratitudes.length >= CONFIG.maxGratitudes) return;

    HAPTIC_PATTERNS.gratitude.add();
    setGratitudes(prev => [...prev, currentInput.trim()]);
    setCurrentInput('');
  }, [currentInput, gratitudes.length]);

  const handleRemoveGratitude = useCallback((index) => {
    HAPTIC_PATTERNS.tap();
    setGratitudes(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleSendGratitudes = useCallback(() => {
    if (gratitudes.length < CONFIG.minGratitudes) return;

    HAPTIC_PATTERNS.gratitude.send();
    contentOpacity.value = withTiming(0, { duration: 300 });
    setTimeout(() => {
      setPhase('sending');
      contentOpacity.value = withTiming(1, { duration: 400 });
    }, 300);

    // Complete after animation
    setTimeout(() => {
      handleComplete();
    }, CONFIG.sendAnimationDuration + 500);
  }, [gratitudes]);

  const handleComplete = async () => {
    HAPTIC_PATTERNS.gratitude.complete();
    setShowCelebration(true);

    try {
      if (user?.id) {
        const result = await completeRitual(user.id, 'gratitude-flow', {
          gratitudeCount: gratitudes.length,
          gratitudes,
        });
        setXpEarned(result?.xpEarned || CONFIG.xpReward);
        setStreak(result?.newStreak || 1);
      } else {
        setXpEarned(CONFIG.xpReward);
        setStreak(1);
      }
    } catch (err) {
      console.error('[GratitudeFlowRitual] Complete error:', err);
      setXpEarned(CONFIG.xpReward);
      setStreak(1);
    }
  };

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleContinue = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  // Calculate fill level
  const fillLevel = gratitudes.length / CONFIG.maxGratitudes;
  const canSend = gratitudes.length >= CONFIG.minGratitudes;

  // Render Start Phase
  const renderStart = () => (
    <Animated.View style={[styles.phaseContainer, contentAnimatedStyle]}>
      <GoldenJar fillLevel={0} shimmer={true} />

      <View style={styles.textContainer}>
        <TitleText text="Dòng Chảy Biết Ơn" color={THEME.primary} />
        <SubtitleText text="Gửi lòng biết ơn của bạn đến vũ trụ" />
      </View>

      <InstructionText
        text="Viết ít nhất 3 điều bạn biết ơn hôm nay"
        variant="default"
        color={COSMIC_COLORS.text.secondary}
        style={styles.instruction}
      />

      <GlowButton
        label="Bắt đầu"
        variant="gratitude"
        size="large"
        fullWidth
        onPress={handleStart}
        style={styles.startButton}
      />

      <Text style={styles.durationText}>3-5 phút • Nuôi dưỡng tâm hồn</Text>
    </Animated.View>
  );

  // Render Input Phase
  const renderInput = () => (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardAvoid}
    >
      <Animated.View style={[styles.inputPhaseContainer, contentAnimatedStyle]}>
        {/* Jar with progress */}
        <View style={styles.jarContainer}>
          <ProgressRing
            progress={fillLevel}
            size={200}
            strokeWidth={6}
            color={THEME.primary}
            secondaryColor={THEME.secondary}
            showPercentage={false}
            showGlow={true}
          >
            <Gift size={60} color={THEME.primary} strokeWidth={1.5} />
          </ProgressRing>
          <Text style={styles.countText}>
            {gratitudes.length}/{CONFIG.maxGratitudes}
          </Text>
        </View>

        {/* Gratitude list */}
        <ScrollView style={styles.gratitudeList} showsVerticalScrollIndicator={false}>
          {gratitudes.map((text, index) => (
            <GratitudeItem
              key={index}
              text={text}
              index={index}
              onRemove={() => handleRemoveGratitude(index)}
              sending={false}
            />
          ))}
        </ScrollView>

        {/* Input area */}
        {gratitudes.length < CONFIG.maxGratitudes && (
          <GlassInputCard
            focused={inputFocused}
            glowColor={THEME.glow}
            style={styles.inputCard}
          >
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder="Tôi biết ơn..."
                placeholderTextColor={COSMIC_COLORS.text.hint}
                value={currentInput}
                onChangeText={setCurrentInput}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
                onSubmitEditing={handleAddGratitude}
                returnKeyType="done"
              />
              <GlowIconButton
                icon={<Plus />}
                variant="gratitude"
                size="medium"
                onPress={handleAddGratitude}
                disabled={!currentInput.trim()}
              />
            </View>
          </GlassInputCard>
        )}

        {/* Send button */}
        <GlowButton
          label={canSend ? 'Gửi lòng biết ơn' : `Thêm ${CONFIG.minGratitudes - gratitudes.length} điều nữa`}
          icon={<Send />}
          variant={canSend ? 'gratitude' : 'outline'}
          size="large"
          fullWidth
          disabled={!canSend}
          onPress={handleSendGratitudes}
          style={styles.sendButton}
        />
      </Animated.View>
    </KeyboardAvoidingView>
  );

  // Render Sending Phase
  const renderSending = () => (
    <Animated.View style={[styles.phaseContainer, contentAnimatedStyle]}>
      <View style={styles.sendingContainer}>
        {/* Flying gratitudes */}
        {gratitudes.map((text, index) => (
          <GratitudeItem
            key={index}
            text={text}
            index={index}
            sending={true}
          />
        ))}
      </View>

      <InstructionText
        text="Lòng biết ơn đang bay đến vũ trụ..."
        variant="large"
        color={THEME.primary}
        glowColor={THEME.glow}
        pulse={true}
        style={styles.sendingText}
      />
    </Animated.View>
  );

  // Main render
  return (
    <GestureHandlerRootView style={styles.container}>
      <CosmicBackground
        variant="gratitude"
        starDensity="medium"
        showNebula={true}
        showSpotlight={true}
        spotlightIntensity={0.5}
      >
        {/* Golden particles */}
        {/* OPTIMIZED: reduced particle counts */}
        <ParticleField
          variant="golden"
          count={phase === 'sending' ? 25 : 12}
          speed={phase === 'sending' ? 'fast' : 'slow'}
          density="low"
          direction="up"
        />

        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
          {/* Header */}
          <RitualHeader
            title="Dòng Chảy Biết Ơn"
            icon={<Gift />}
            iconColor={THEME.primary}
            onBack={handleBack}
            showSound={true}
            soundEnabled={isSoundOn}
            onSoundToggle={() => setIsSoundOn(!isSoundOn)}
          />

          {/* Content */}
          <View style={styles.content}>
            {phase === 'start' && renderStart()}
            {phase === 'input' && renderInput()}
            {phase === 'sending' && renderSending()}
          </View>
        </SafeAreaView>

        {/* Celebration overlay */}
        <CompletionCelebration
          ritualType="gratitude"
          xpEarned={xpEarned}
          streakCount={streak}
          isNewRecord={streak > 0}
          message={`Bạn đã gửi ${gratitudes.length} lời biết ơn đến vũ trụ.`}
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
  phaseContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: COSMIC_SPACING.xxl,
  },
  keyboardAvoid: {
    flex: 1,
  },
  inputPhaseContainer: {
    flex: 1,
    paddingTop: COSMIC_SPACING.lg,
  },

  // Start phase
  textContainer: {
    alignItems: 'center',
    marginTop: COSMIC_SPACING.xl,
    marginBottom: COSMIC_SPACING.md,
  },
  instruction: {
    marginBottom: COSMIC_SPACING.xl,
    textAlign: 'center',
  },
  startButton: {
    marginTop: COSMIC_SPACING.lg,
  },
  durationText: {
    fontSize: 14,
    color: COSMIC_COLORS.text.muted,
    marginTop: COSMIC_SPACING.md,
  },

  // Input phase
  jarContainer: {
    alignItems: 'center',
    marginBottom: COSMIC_SPACING.lg,
  },
  countText: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME.primary,
    marginTop: COSMIC_SPACING.sm,
  },
  gratitudeList: {
    flex: 1,
    marginBottom: COSMIC_SPACING.md,
  },
  gratitudeItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: COSMIC_SPACING.sm,
  },
  gratitudeText: {
    flex: 1,
    fontSize: 15,
    color: COSMIC_COLORS.text.primary,
    lineHeight: 22,
  },
  inputCard: {
    marginBottom: COSMIC_SPACING.md,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: COSMIC_SPACING.sm,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COSMIC_COLORS.text.primary,
    paddingVertical: COSMIC_SPACING.xs,
  },
  sendButton: {
    marginBottom: COSMIC_SPACING.lg,
  },

  // Sending phase
  sendingContainer: {
    flex: 1,
    justifyContent: 'center',
    width: '100%',
  },
  sendingText: {
    marginTop: COSMIC_SPACING.xl,
    textAlign: 'center',
  },
});

export default GratitudeFlowRitual;
