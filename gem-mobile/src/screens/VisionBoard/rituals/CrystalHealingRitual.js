/**
 * CrystalHealingRitual - Chữa Lành Bằng Pha Lê
 * Cosmic Glassmorphism Design
 * 4 Phases: Intro → Crystal Selection → Healing → Completion
 */

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
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
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Gem, Sparkles, Heart, Shield, Sun, Moon, Zap } from 'lucide-react-native';

import { useAuth } from '../../../contexts/AuthContext';
import { completeRitual, saveReflection } from '../../../services/ritualService';
import ritualSoundService from '../../../services/ritualSoundService';
import useVideoPause from '../../../hooks/useVideoPause';

// Cosmic Components
import {
  VideoBackground,
  RitualAnimation,
  GlassCard,
  GlowingOrb,
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

// ============================================
// CONFIG
// ============================================

const CONFIG = {
  duration: 5 * 60, // 5 minutes total
  healingDuration: 90, // seconds for healing phase
  xpReward: 30,
};

const THEME = COSMIC_COLORS.ritualThemes.crystal;

// Crystal types with healing properties
const CRYSTALS = [
  {
    id: 'amethyst',
    name: 'Thạch Anh Tím',
    englishName: 'Amethyst',
    color: '#9B59B6',
    icon: Moon,
    property: 'Bình an & Trực giác',
    description: 'Thanh lọc tâm trí, tăng cường trực giác và mang lại giấc ngủ sâu.',
  },
  {
    id: 'rose-quartz',
    name: 'Thạch Anh Hồng',
    englishName: 'Rose Quartz',
    color: '#FFB6C1',
    icon: Heart,
    property: 'Tình yêu & Chữa lành',
    description: 'Mở rộng trái tim, thu hút tình yêu và chữa lành vết thương cảm xúc.',
  },
  {
    id: 'clear-quartz',
    name: 'Thạch Anh Trắng',
    englishName: 'Clear Quartz',
    color: '#E8E8E8',
    icon: Sun,
    property: 'Khuếch đại & Rõ ràng',
    description: 'Khuếch đại năng lượng, mang lại sự rõ ràng trong suy nghĩ.',
  },
  {
    id: 'citrine',
    name: 'Citrine',
    englishName: 'Citrine',
    color: '#F4D03F',
    icon: Zap,
    property: 'Thịnh vượng & Niềm vui',
    description: 'Thu hút sự thịnh vượng, mang lại niềm vui và năng lượng tích cực.',
  },
  {
    id: 'obsidian',
    name: 'Obsidian',
    englishName: 'Obsidian',
    color: '#1C1C1C',
    icon: Shield,
    property: 'Bảo vệ & Nền tảng',
    description: 'Bảo vệ khỏi năng lượng tiêu cực, giúp tiếp đất và ổn định.',
  },
  {
    id: 'turquoise',
    name: 'Ngọc Lam',
    englishName: 'Turquoise',
    color: '#48C9B0',
    icon: Sparkles,
    property: 'Giao tiếp & Sáng tạo',
    description: 'Tăng cường giao tiếp, kích thích sáng tạo và mang lại may mắn.',
  },
];

// ============================================
// CRYSTAL CARD COMPONENT
// ============================================

const CrystalCard = React.memo(({ crystal, selected, onSelect, delay }) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(30);
  const scale = useSharedValue(1);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 400 }));
    translateY.value = withDelay(delay, withSpring(0, COSMIC_TIMING.spring.gentle));
  }, []);

  useEffect(() => {
    if (selected) {
      scale.value = withSequence(
        withTiming(1.05, { duration: 150 }),
        withTiming(1, { duration: 150 })
      );
    }
  }, [selected]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  const IconComponent = crystal.icon;

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => onSelect(crystal)}
        style={[
          styles.crystalCard,
          selected && styles.crystalCardSelected,
          { borderColor: selected ? crystal.color : 'rgba(255, 255, 255, 0.1)' },
        ]}
      >
        <View style={[styles.crystalIconContainer, { backgroundColor: crystal.color + '30' }]}>
          <IconComponent size={28} color={crystal.color} />
        </View>
        <Text style={styles.crystalName}>{crystal.name}</Text>
        <Text style={styles.crystalProperty}>{crystal.property}</Text>
        {selected && (
          <View style={[styles.selectedIndicator, { backgroundColor: crystal.color }]} />
        )}
      </TouchableOpacity>
    </Animated.View>
  );
});

// ============================================
// GLOWING CRYSTAL COMPONENT
// ============================================

const GlowingCrystal = React.memo(({ crystal, onPress }) => {
  const glowIntensity = useSharedValue(0.6);
  const rotation = useSharedValue(0);

  useEffect(() => {
    glowIntensity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2000 }),
        withTiming(0.6, { duration: 2000 })
      ),
      -1,
      true
    );
    rotation.value = withRepeat(
      withTiming(360, { duration: 20000 }),
      -1,
      false
    );
  }, []);

  const IconComponent = crystal.icon;

  return (
    <GlowingOrb
      size={180}
      color={crystal.color}
      secondaryColor={THEME.secondary}
      gradient={[crystal.color, THEME.primary, THEME.deep]}
      icon={<IconComponent size={70} color="#FFFFFF" />}
      iconSize={70}
      pulseSpeed={2500}
      glowIntensity={0.8}
      onPress={onPress}
      showRipples={true}
    />
  );
});

// ============================================
// MAIN COMPONENT
// ============================================

const CrystalHealingRitual = ({ navigation }) => {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const shouldPauseVideo = useVideoPause();

  // ===== STATE =====
  const [phase, setPhase] = useState('intro'); // intro, selection, healing, completion
  const [selectedCrystal, setSelectedCrystal] = useState(null);
  const [healingProgress, setHealingProgress] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(CONFIG.healingDuration);
  const [isSoundOn, setIsSoundOn] = useState(true);
  const [reflection, setReflection] = useState('');
  const [showReflection, setShowReflection] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);

  // ===== REFS =====
  const healingTimerRef = useRef(null);
  const progressRef = useRef(0);

  // ===== ANIMATION VALUES =====
  const contentOpacity = useSharedValue(1);

  // ===== SYNC PROGRESS REF =====
  useEffect(() => {
    progressRef.current = healingProgress;
  }, [healingProgress]);

  // ===== CLEANUP =====
  useEffect(() => {
    return () => {
      if (healingTimerRef.current) clearInterval(healingTimerRef.current);
    };
  }, []);

  // ===== HEALING TIMER =====
  useEffect(() => {
    if (phase === 'healing') {
      setTimeRemaining(CONFIG.healingDuration);
      setHealingProgress(0);

      healingTimerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1 || progressRef.current >= 100) {
            clearInterval(healingTimerRef.current);
            handleComplete();
            return 0;
          }
          return prev - 1;
        });
        setHealingProgress(prev => Math.min(100, prev + (100 / CONFIG.healingDuration)));
      }, 1000);
    }

    return () => {
      if (healingTimerRef.current) clearInterval(healingTimerRef.current);
    };
  }, [phase]);

  // ===== SOUND MANAGEMENT =====
  useEffect(() => {
    ritualSoundService.init();
    return () => {
      ritualSoundService.stopAll();
    };
  }, []);

  // Start/stop ambient based on phase and sound toggle
  useEffect(() => {
    if (isSoundOn && (phase === 'selection' || phase === 'healing')) {
      ritualSoundService.startAmbient('crystal-healing', 0.4);
    } else if (phase === 'completion') {
      ritualSoundService.stopAmbient();
    }
  }, [phase, isSoundOn]);

  // ===== HANDLERS =====
  const handleStart = useCallback(() => {
    HAPTIC_PATTERNS.tap();
    contentOpacity.value = withTiming(0, { duration: 300 });
    setTimeout(() => {
      setPhase('selection');
      contentOpacity.value = withTiming(1, { duration: 400 });
    }, 300);
  }, []);

  const handleSelectCrystal = useCallback((crystal) => {
    HAPTIC_PATTERNS.tap();
    // Play chime sound when selecting crystal
    if (isSoundOn) ritualSoundService.playChime();
    setSelectedCrystal(crystal);
  }, [isSoundOn]);

  const handleStartHealing = useCallback(() => {
    if (!selectedCrystal) return;
    HAPTIC_PATTERNS.success();
    contentOpacity.value = withTiming(0, { duration: 300 });
    setTimeout(() => {
      setPhase('healing');
      contentOpacity.value = withTiming(1, { duration: 400 });
    }, 300);
  }, [selectedCrystal]);

  const handleCrystalPress = useCallback(() => {
    HAPTIC_PATTERNS.tap();
    // Play sparkle sound on crystal press
    if (isSoundOn) ritualSoundService.playSparkle();
    setHealingProgress(prev => Math.min(100, prev + 5));
  }, [isSoundOn]);

  const handleComplete = async () => {
    HAPTIC_PATTERNS.celebration();
    setShowCelebration(true);

    // Play completion sound and stop ambient
    if (isSoundOn) {
      ritualSoundService.stopAmbient();
      ritualSoundService.playComplete('crystal-healing');
    }

    try {
      if (user?.id) {
        const result = await completeRitual(user.id, 'crystal-healing', {
          crystal: selectedCrystal?.id,
          crystalName: selectedCrystal?.name,
          healingProgress,
          reflection,
        });
        setXpEarned(result?.xpEarned || CONFIG.xpReward);
        setStreak(result?.newStreak || 1);
      } else {
        setXpEarned(CONFIG.xpReward);
        setStreak(1);
      }
    } catch (err) {
      console.error('[CrystalHealingRitual] Complete error:', err);
      setXpEarned(CONFIG.xpReward);
      setStreak(1);
    }
  };

  // ===== NAVIGATION HANDLERS =====
  const handleBack = useCallback(() => {
    if (healingTimerRef.current) clearInterval(healingTimerRef.current);
    navigation.goBack();
  }, [navigation]);

  const handleContinue = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

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
        icon={<Gem size={70} color="#FFFFFF" />}
        iconSize={70}
        pulseSpeed={2000}
        glowIntensity={0.8}
        showRipples={true}
      />

      <View style={styles.introTextContainer}>
        <TitleText text="Chữa Lành Bằng Pha Lê" color={THEME.primary} />
        <SubtitleText text="Kết nối với năng lượng thiêng liêng của đá quý" />
      </View>

      <GlowButton
        label="Bắt đầu nghi thức"
        variant="primary"
        size="large"
        fullWidth
        onPress={handleStart}
        style={[styles.startButton, { backgroundColor: THEME.primary }]}
      />

      <Text style={styles.durationText}>5 phút - Năng lượng chữa lành</Text>
    </Animated.View>
  );

  // ===== RENDER SELECTION PHASE =====
  const renderSelection = () => (
    <Animated.View style={[styles.phaseContainer, contentAnimatedStyle]}>
      <InstructionText
        text="Chọn viên pha lê mà bạn cảm thấy kết nối"
        variant="title"
        color={COSMIC_COLORS.text.primary}
        style={styles.selectionTitle}
      />

      <ScrollView
        style={styles.crystalScrollView}
        contentContainerStyle={styles.crystalGrid}
        showsVerticalScrollIndicator={false}
      >
        {CRYSTALS.map((crystal, index) => (
          <CrystalCard
            key={crystal.id}
            crystal={crystal}
            selected={selectedCrystal?.id === crystal.id}
            onSelect={handleSelectCrystal}
            delay={index * 100}
          />
        ))}
      </ScrollView>

      {selectedCrystal && (
        <GlassCard variant="glow" padding={COSMIC_SPACING.md} style={styles.selectedInfoCard}>
          <Text style={[styles.selectedCrystalName, { color: selectedCrystal.color }]}>
            {selectedCrystal.name}
          </Text>
          <Text style={styles.selectedCrystalDesc}>
            {selectedCrystal.description}
          </Text>
        </GlassCard>
      )}

      <GlowButton
        label="Bắt đầu chữa lành"
        variant="primary"
        size="large"
        fullWidth
        disabled={!selectedCrystal}
        onPress={handleStartHealing}
        style={[styles.continueButton, selectedCrystal && { backgroundColor: selectedCrystal.color }]}
      />
    </Animated.View>
  );

  // ===== RENDER HEALING PHASE =====
  const renderHealing = () => (
    <Animated.View style={[styles.phaseContainer, contentAnimatedStyle]}>
      {/* Lottie Animation - Crystal Glow */}
      <TouchableOpacity
        style={styles.lottieContainer}
        activeOpacity={0.9}
        onPress={handleCrystalPress}
      >
        <RitualAnimation
          animationId="crystal-glow"
          autoPlay={true}
          loop={true}
          size={SCREEN_WIDTH * 0.85}
        />
      </TouchableOpacity>

      <InstructionText
        text={`Chạm vào quả cầu ${selectedCrystal?.name || 'Pha Lê'} để tăng năng lượng nhanh hơn`}
        variant="default"
        color={COSMIC_COLORS.text.secondary}
        style={styles.healingInstruction}
      />

      {/* Healing progress */}
      <GlassCard variant="subtle" padding={COSMIC_SPACING.md} style={styles.progressCard}>
        <View style={styles.progressRow}>
          <Text style={styles.progressLabel}>Năng lượng chữa lành</Text>
          <Text style={[styles.progressPercent, { color: selectedCrystal?.color || THEME.primary }]}>
            {Math.round(healingProgress)}%
          </Text>
        </View>
        <View style={styles.progressBarBg}>
          <Animated.View
            style={[
              styles.progressBarFill,
              {
                width: `${healingProgress}%`,
                backgroundColor: selectedCrystal?.color || THEME.primary,
              },
            ]}
          />
        </View>
      </GlassCard>

      {/* Timer */}
      <Text style={styles.timerText}>
        Thời gian còn: {formatTime(timeRemaining)}
      </Text>

      {/* Tap instruction */}
      <Text style={styles.tapHint}>
        Chạm vào quả cầu {selectedCrystal?.name || 'Pha Lê'} để tăng năng lượng
      </Text>
    </Animated.View>
  );

  // ===== MAIN RENDER =====
  return (
    <GestureHandlerRootView style={styles.container}>
      <VideoBackground ritualId="crystal-healing" paused={shouldPauseVideo}>
        {/* Sparkle particles overlay */}
        {phase === 'healing' && (
          <ParticleField
            variant="sparkles"
            count={25}
            speed="slow"
            density="medium"
            direction="float"
          />
        )}

        <SafeAreaView style={styles.safeArea} edges={['top']}>
          {/* Header */}
          <RitualHeader
            title="Chữa Lành Pha Lê"
            icon={<Gem />}
            iconColor={selectedCrystal?.color || THEME.primary}
            onBack={handleBack}
            showSound={true}
            soundEnabled={isSoundOn}
            onSoundToggle={() => setIsSoundOn(!isSoundOn)}
            showTimer={phase === 'healing'}
            timeRemaining={timeRemaining}
          />

          {/* Content */}
          <View style={styles.content}>
            {phase === 'intro' && renderIntro()}
            {phase === 'selection' && renderSelection()}
            {phase === 'healing' && renderHealing()}
            {/* Bottom padding for tab bar */}
            <View style={{ height: Math.max(insets.bottom, 20) + 80 }} />
          </View>
        </SafeAreaView>

        {/* Celebration overlay */}
        <CompletionCelebration
          ritualType="crystal"
          xpEarned={xpEarned}
          streakCount={streak}
          isNewRecord={streak > 0}
          message={`Năng lượng ${selectedCrystal?.name || 'pha lê'} đã chữa lành tâm hồn bạn.`}
          visible={showCelebration}
          onContinue={handleContinue}
          onWriteReflection={async (text) => {
            setReflection(text);
            if (user?.id) {
              await saveReflection(user.id, 'crystal-healing', text);
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

  // Selection
  selectionTitle: {
    marginBottom: COSMIC_SPACING.lg,
  },
  crystalScrollView: {
    flex: 1,
    width: '100%',
  },
  crystalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: COSMIC_SPACING.lg,
  },
  crystalCard: {
    width: (SCREEN_WIDTH - COSMIC_SPACING.lg * 2 - COSMIC_SPACING.md) / 2,
    backgroundColor: 'rgba(13, 13, 43, 0.6)',
    borderRadius: COSMIC_RADIUS.lg,
    borderWidth: 1.5,
    padding: COSMIC_SPACING.md,
    marginBottom: COSMIC_SPACING.md,
    alignItems: 'center',
    overflow: 'hidden',
  },
  crystalCardSelected: {
    backgroundColor: 'rgba(155, 89, 182, 0.15)',
  },
  crystalIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: COSMIC_SPACING.sm,
  },
  crystalName: {
    fontSize: 14,
    fontWeight: '600',
    color: COSMIC_COLORS.text.primary,
    textAlign: 'center',
    marginBottom: 4,
  },
  crystalProperty: {
    fontSize: 11,
    color: COSMIC_COLORS.text.muted,
    textAlign: 'center',
  },
  selectedIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
  },
  selectedInfoCard: {
    width: '100%',
    marginBottom: COSMIC_SPACING.md,
  },
  selectedCrystalName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: COSMIC_SPACING.xs,
    textAlign: 'center',
  },
  selectedCrystalDesc: {
    fontSize: 14,
    color: COSMIC_COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  continueButton: {
    marginTop: COSMIC_SPACING.sm,
  },

  // Healing
  lottieContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: COSMIC_SPACING.md,
  },
  healingInstruction: {
    marginBottom: COSMIC_SPACING.lg,
  },
  progressCard: {
    width: '100%',
    marginBottom: COSMIC_SPACING.md,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: COSMIC_SPACING.sm,
  },
  progressLabel: {
    fontSize: 14,
    color: COSMIC_COLORS.text.secondary,
  },
  progressPercent: {
    fontSize: 16,
    fontWeight: '600',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  timerText: {
    fontSize: 14,
    color: COSMIC_COLORS.text.muted,
  },
  tapHint: {
    fontSize: 12,
    color: COSMIC_COLORS.text.hint,
    marginTop: COSMIC_SPACING.sm,
    fontStyle: 'italic',
  },
});

export default CrystalHealingRitual;
