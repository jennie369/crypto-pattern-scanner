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
  Platform,
  ScrollView,
  Dimensions,
  Keyboard,
} from 'react-native';
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
  Easing,
} from 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Gift, Sparkles, Plus, X, Send, Check, Star } from 'lucide-react-native';

import { useAuth } from '../../../contexts/AuthContext';
import { completeRitual, saveReflection } from '../../../services/ritualService';
import useVideoPause from '../../../hooks/useVideoPause';

// Cosmic Components
import {
  VideoBackground,
  RitualAnimation,
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

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');
const THEME = COSMIC_COLORS.ritualThemes.gratitude;

const CONFIG = {
  maxGratitudes: 5,
  minGratitudes: 3,
  xpReward: 30,
  sendAnimationDuration: 4000,
};

// ============================================
// FLYING GRATITUDE ITEM (for sending phase)
// ============================================

const FlyingGratitudeItem = ({ text, index, totalItems }) => {
  const opacity = useSharedValue(1);
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const scale = useSharedValue(1);
  const rotate = useSharedValue(0);

  useEffect(() => {
    const delay = index * 500;

    // Random horizontal drift
    const randomDrift = (Math.random() - 0.5) * 100;

    // Animate flying up with star-like effect
    translateY.value = withDelay(delay, withTiming(-SCREEN_HEIGHT * 0.7, {
      duration: 3000,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    }));

    translateX.value = withDelay(delay, withTiming(randomDrift, {
      duration: 3000,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    }));

    scale.value = withDelay(delay, withSequence(
      withTiming(1.2, { duration: 300 }),
      withTiming(0.2, { duration: 2700 })
    ));

    opacity.value = withDelay(delay + 2000, withTiming(0, { duration: 1000 }));

    rotate.value = withDelay(delay, withTiming(randomDrift > 0 ? 15 : -15, {
      duration: 3000,
    }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
      { rotate: `${rotate.value}deg` },
    ],
  }));

  return (
    <Animated.View style={[styles.flyingItem, animatedStyle]}>
      <View style={styles.flyingItemInner}>
        <Star size={16} color={THEME.primary} fill={THEME.primary} />
        <Text style={styles.flyingItemText} numberOfLines={1}>{text}</Text>
      </View>
    </Animated.View>
  );
};

// ============================================
// GRATITUDE ITEM COMPONENT (for input list) - OPTIMIZED: No animation delays
// ============================================

const GratitudeItem = React.memo(({ text, onRemove }) => {
  // No animation - render instantly for better UX
  return (
    <View style={styles.gratitudeItemWrapper}>
      <GlassCard variant="glow" glowColor={THEME.glow} padding={COSMIC_SPACING.md}>
        <View style={styles.gratitudeItemContent}>
          <Sparkles size={18} color={THEME.primary} strokeWidth={2} />
          <Text style={styles.gratitudeText}>{text}</Text>
          {onRemove && (
            <GlowIconButton
              icon={<X />}
              variant="ghost"
              size="small"
              onPress={onRemove}
            />
          )}
        </View>
      </GlassCard>
    </View>
  );
});

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
  const insets = useSafeAreaInsets();
  const shouldPauseVideo = useVideoPause();
  const scrollViewRef = useRef(null);
  const inputRef = useRef(null);

  // State
  const [phase, setPhase] = useState('start'); // start, input, sending, completed
  const [gratitudes, setGratitudes] = useState([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isSoundOn, setIsSoundOn] = useState(true);
  const [xpEarned, setXpEarned] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [reflection, setReflection] = useState('');

  // Animation values
  const contentOpacity = useSharedValue(1);
  const jarShimmer = useSharedValue(0);

  // Keyboard listeners - track keyboard height for manual offset
  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });

    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // Content animation style
  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  // Handlers - OPTIMIZED: Instant phase transitions
  const handleStart = useCallback(() => {
    HAPTIC_PATTERNS.tap();
    setPhase('input'); // Instant transition
  }, []);

  const handleAddGratitude = useCallback(() => {
    if (!currentInput.trim() || gratitudes.length >= CONFIG.maxGratitudes) return;

    HAPTIC_PATTERNS.gratitude.add();
    setGratitudes(prev => [...prev, currentInput.trim()]);
    setCurrentInput('');
    Keyboard.dismiss();
  }, [currentInput, gratitudes.length]);

  const handleRemoveGratitude = useCallback((index) => {
    HAPTIC_PATTERNS.tap();
    setGratitudes(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleSendGratitudes = useCallback(() => {
    if (gratitudes.length < CONFIG.minGratitudes) return;

    HAPTIC_PATTERNS.gratitude.send();
    Keyboard.dismiss();
    setPhase('sending'); // Instant transition

    // Complete after animation
    setTimeout(() => {
      handleComplete();
    }, CONFIG.sendAnimationDuration);
  }, [gratitudes]);

  const handleComplete = async () => {
    HAPTIC_PATTERNS.gratitude.complete();
    setShowCelebration(true);

    try {
      if (user?.id) {
        const result = await completeRitual(user.id, 'gratitude-flow', {
          gratitudeCount: gratitudes.length,
          gratitudes,
          reflection,
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

  // Render Input Phase - Redesigned for better keyboard handling
  const renderInput = () => (
    <ScrollView
      ref={scrollViewRef}
      style={styles.inputScrollView}
      contentContainerStyle={styles.inputScrollContent}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      bounces={false}
    >
      <Animated.View style={contentAnimatedStyle}>
        {/* Compact header with count - always visible */}
        <View style={styles.inputHeader}>
          <View style={styles.compactCountContainer}>
            <Gift size={28} color={THEME.primary} strokeWidth={1.5} />
            <Text style={styles.compactCountText}>
              {gratitudes.length}/{CONFIG.maxGratitudes}
            </Text>
          </View>
          <ProgressRing
            progress={fillLevel}
            size={50}
            strokeWidth={3}
            color={THEME.primary}
            secondaryColor={THEME.secondary}
            showPercentage={false}
            showGlow={false}
          />
        </View>

        {/* Gratitude list - renders instantly */}
        {gratitudes.length > 0 && (
          <View style={styles.gratitudeListWrapper}>
            {gratitudes.map((text, index) => (
              <GratitudeItem
                key={`gratitude-${index}`}
                text={text}
                onRemove={() => handleRemoveGratitude(index)}
              />
            ))}
          </View>
        )}

        {/* Input area - positioned for visibility */}
        {gratitudes.length < CONFIG.maxGratitudes && (
          <GlassInputCard
            focused={inputFocused}
            glowColor={THEME.glow}
            style={styles.inputCard}
          >
            <View style={styles.inputRow}>
              <TextInput
                ref={inputRef}
                style={styles.input}
                placeholder="Tôi biết ơn..."
                placeholderTextColor={COSMIC_COLORS.text.hint}
                value={currentInput}
                onChangeText={setCurrentInput}
                onFocus={() => {
                  setInputFocused(true);
                  // Scroll to input after a tiny delay to ensure keyboard is accounted for
                  setTimeout(() => {
                    scrollViewRef.current?.scrollToEnd({ animated: true });
                  }, 100);
                }}
                onBlur={() => setInputFocused(false)}
                onSubmitEditing={handleAddGratitude}
                returnKeyType="done"
                blurOnSubmit={false}
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

        {/* Bottom padding - add keyboard height when keyboard is visible */}
        <View style={{ height: keyboardHeight > 0 ? keyboardHeight + 20 : Math.max(insets.bottom, 20) + 80 }} />
      </Animated.View>
    </ScrollView>
  );

  // Render Sending Phase
  const renderSending = () => (
    <Animated.View style={[styles.sendingPhaseContainer, contentAnimatedStyle]}>
      {/* Lottie Animation - Golden Orbs */}
      <View style={styles.lottieContainer}>
        <RitualAnimation
          animationId="golden-orbs"
          autoPlay={true}
          loop={true}
          size={SCREEN_WIDTH * 0.9}
        />
      </View>

      {/* Flying gratitudes container - positioned at bottom, flying up */}
      <View style={styles.flyingContainer}>
        {gratitudes.map((text, index) => (
          <FlyingGratitudeItem
            key={`flying-${index}`}
            text={text}
            index={index}
            totalItems={gratitudes.length}
          />
        ))}
      </View>

      {/* Text at center */}
      <View style={styles.sendingTextContainer}>
        <Text style={styles.sendingMainText}>
          Lòng biết ơn đang bay đến vũ trụ...
        </Text>
        <Text style={styles.sendingSubText}>
          {gratitudes.length} điều biết ơn từ trái tim bạn
        </Text>
      </View>
    </Animated.View>
  );

  // Main render
  return (
    <GestureHandlerRootView style={styles.container}>
      <VideoBackground ritualId="gratitude-flow" paused={shouldPauseVideo}>
        {/* Golden particles */}
        <ParticleField
          variant="golden"
          count={phase === 'sending' ? 30 : 12}
          speed={phase === 'sending' ? 'fast' : 'slow'}
          density="low"
          direction="up"
        />

        <SafeAreaView style={styles.safeArea} edges={['top']}>
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
            {/* Bottom padding for tab bar */}
            {phase !== 'input' && <View style={{ height: Math.max(insets.bottom, 20) + 80 }} />}
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
          onWriteReflection={async (text) => {
            setReflection(text);
            if (user?.id) {
              await saveReflection(user.id, 'gratitude-flow', text);
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

  // Start phase
  phaseContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 20,
  },
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

  // Input phase - redesigned for keyboard
  inputScrollView: {
    flex: 1,
  },
  inputScrollContent: {
    flexGrow: 1,
    paddingTop: COSMIC_SPACING.sm,
  },
  inputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: COSMIC_SPACING.sm,
    marginBottom: COSMIC_SPACING.md,
  },
  compactCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: COSMIC_SPACING.sm,
  },
  compactCountText: {
    fontSize: 20,
    fontWeight: '700',
    color: THEME.primary,
  },
  gratitudeListWrapper: {
    marginBottom: COSMIC_SPACING.sm,
  },
  gratitudeItemWrapper: {
    marginBottom: COSMIC_SPACING.sm,
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
    paddingVertical: COSMIC_SPACING.sm,
  },
  sendButton: {
    marginBottom: COSMIC_SPACING.md,
  },

  // Sending phase
  sendingPhaseContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lottieContainer: {
    position: 'absolute',
    top: '15%',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 0,
  },
  flyingContainer: {
    position: 'absolute',
    bottom: SCREEN_HEIGHT * 0.25,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  flyingItem: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 189, 89, 0.2)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.4)',
  },
  flyingItemInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  flyingItemText: {
    color: THEME.primary,
    fontSize: 14,
    fontWeight: '500',
    maxWidth: 200,
  },
  sendingTextContainer: {
    alignItems: 'center',
    paddingHorizontal: COSMIC_SPACING.xl,
    marginTop: SCREEN_HEIGHT * 0.1,
  },
  sendingMainText: {
    fontSize: 22,
    fontWeight: '600',
    color: THEME.primary,
    textAlign: 'center',
    textShadowColor: 'rgba(255, 189, 89, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  sendingSubText: {
    fontSize: 15,
    color: COSMIC_COLORS.text.secondary,
    textAlign: 'center',
    marginTop: COSMIC_SPACING.sm,
  },
});

export default GratitudeFlowRitual;
