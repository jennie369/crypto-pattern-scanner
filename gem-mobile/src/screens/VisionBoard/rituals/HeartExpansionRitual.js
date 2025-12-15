/**
 * HeartExpansionRitual - Mở Rộng Trái Tim
 * Vision Board 2.0 - Full Implementation
 * 4 Phases: Intro → Breath Sync → Heart Expansion → Completion
 * Created: December 10, 2025
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  TextInput,
  Vibration,
  PanResponder,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  Heart,
  Volume2,
  VolumeX,
  MoreVertical,
  RotateCcw,
  ChevronRight,
  Edit3,
  Star,
  Target,
  Check,
} from 'lucide-react-native';
import { useAuth } from '../../../contexts/AuthContext';
import { completeRitual } from '../../../services/ritualService';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ============ CONFIG ============
const CONFIG = {
  duration: 7 * 60, // 7 minutes total
  breathCycles: 6,
  breathPattern: { inhale: 4, hold: 2, exhale: 6 }, // 12s per cycle
  heartExpansionDuration: 150, // 2.5 minutes
  xpReward: 25,
};

const THEME = {
  primary: '#FF69B4',
  secondary: '#FFB6C1',
  accent: '#FFD700',
  glow: 'rgba(255, 105, 180, 0.4)',
  bgGradient: ['#1a0b2e', '#2d1b4e', '#1a0b2e'],
};

// ============ SUB-COMPONENTS ============

// Background Stars
const BackgroundStar = ({ size, top, left, delay }) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(opacity, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 1000, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: '#fff',
        top,
        left,
        opacity,
      }}
    />
  );
};

// Animated Heart with glow effect
const AnimatedHeart = ({ glowIntensity, scale, isBeating }) => {
  const glowAnim = useRef(new Animated.Value(0)).current;
  const beatScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(glowAnim, {
      toValue: glowIntensity,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [glowIntensity]);

  useEffect(() => {
    if (isBeating) {
      const beatAnim = Animated.loop(
        Animated.sequence([
          Animated.timing(beatScale, { toValue: 1.05, duration: 500, useNativeDriver: true }),
          Animated.timing(beatScale, { toValue: 1, duration: 500, useNativeDriver: true }),
        ])
      );
      beatAnim.start();
      return () => beatAnim.stop();
    }
  }, [isBeating]);

  return (
    <Animated.View
      style={[
        styles.heartContainer,
        {
          transform: [{ scale: Animated.multiply(scale, beatScale) }],
          shadowColor: THEME.primary,
          shadowRadius: glowAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [10, 50],
          }),
          shadowOpacity: glowAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0.3, 0.9],
          }),
        },
      ]}
    >
      <Heart size={120} color={THEME.primary} fill={THEME.primary} />
    </Animated.View>
  );
};

// Love Wave animation when swiping
const LoveWave = ({ active, direction, waveId }) => {
  const waveAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (active) {
      waveAnim.setValue(0);
      opacityAnim.setValue(1);

      Animated.parallel([
        Animated.timing(waveAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [active, waveId]);

  const translateX = waveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, direction === 'left' ? -120 : 120],
  });

  const scaleValue = waveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.8],
  });

  return (
    <Animated.View
      style={[
        styles.loveWave,
        direction === 'left' ? { left: -50 } : { right: -50 },
        {
          opacity: opacityAnim,
          transform: [{ translateX }, { scale: scaleValue }],
        },
      ]}
    >
      <Text style={styles.waveText}>
        {direction === 'left' ? '～～～' : '～～～'}
      </Text>
    </Animated.View>
  );
};

// Breath Circle for sync phase
const BreathCircle = ({ breathState, cycleProgress }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let toValue = 1;
    let duration = 1000;

    switch (breathState) {
      case 'inhale':
        toValue = 1.5;
        duration = CONFIG.breathPattern.inhale * 1000;
        break;
      case 'hold':
        toValue = 1.5;
        duration = 100;
        break;
      case 'exhale':
        toValue = 1;
        duration = CONFIG.breathPattern.exhale * 1000;
        break;
    }

    Animated.timing(scaleAnim, {
      toValue,
      duration,
      useNativeDriver: true,
    }).start();
  }, [breathState]);

  return (
    <Animated.View style={[styles.breathCircle, { transform: [{ scale: scaleAnim }] }]}>
      <LinearGradient
        colors={[THEME.glow, 'rgba(255, 105, 180, 0.2)']}
        style={styles.breathCircleInner}
      />
    </Animated.View>
  );
};

// Particle burst on completion
const ParticleBurst = ({ active }) => {
  const particles = useRef(
    [...Array(12)].map((_, i) => ({
      angle: (360 / 12) * i,
      anim: new Animated.Value(0),
      opacity: new Animated.Value(1),
    }))
  ).current;

  useEffect(() => {
    if (active) {
      particles.forEach((p, i) => {
        p.anim.setValue(0);
        p.opacity.setValue(1);
        Animated.parallel([
          Animated.timing(p.anim, {
            toValue: 1,
            duration: 1000,
            delay: i * 50,
            useNativeDriver: true,
          }),
          Animated.timing(p.opacity, {
            toValue: 0,
            duration: 1000,
            delay: i * 50 + 500,
            useNativeDriver: true,
          }),
        ]).start();
      });
    }
  }, [active]);

  if (!active) return null;

  return (
    <View style={styles.particleBurstContainer}>
      {particles.map((p, i) => {
        const rad = (p.angle * Math.PI) / 180;
        return (
          <Animated.View
            key={i}
            style={{
              position: 'absolute',
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: THEME.accent,
              opacity: p.opacity,
              transform: [
                {
                  translateX: p.anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, Math.cos(rad) * 100],
                  }),
                },
                {
                  translateY: p.anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, Math.sin(rad) * 100],
                  }),
                },
              ],
            }}
          />
        );
      })}
    </View>
  );
};

// ============ MAIN COMPONENT ============
const HeartExpansionRitual = ({ navigation }) => {
  const { user } = useAuth();

  // ===== STATE =====
  const [phase, setPhase] = useState('intro'); // intro, breath, expansion, completion
  const [breathCycle, setBreathCycle] = useState(0);
  const [breathState, setBreathState] = useState('idle');
  const [breathTimer, setBreathTimer] = useState(0);
  const [energyLevel, setEnergyLevel] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(CONFIG.heartExpansionDuration);
  const [glowIntensity, setGlowIntensity] = useState(0.3);
  const [waveKey, setWaveKey] = useState(0);
  const [waveActive, setWaveActive] = useState({ left: false, right: false });
  const [isSoundOn, setIsSoundOn] = useState(true);
  const [reflection, setReflection] = useState('');
  const [showReflectionInput, setShowReflectionInput] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showParticleBurst, setShowParticleBurst] = useState(false);

  // ===== REFS =====
  const heartScale = useRef(new Animated.Value(1)).current;
  const breathIntervalRef = useRef(null);
  const timerRef = useRef(null);
  const introHeartScale = useRef(new Animated.Value(1)).current;

  // Background stars (memoized)
  const backgroundStars = React.useMemo(() => {
    return [...Array(25)].map((_, i) => ({
      id: i,
      size: 1 + Math.random() * 2.5,
      top: Math.random() * SCREEN_HEIGHT,
      left: Math.random() * SCREEN_WIDTH,
      delay: Math.random() * 2000,
    }));
  }, []);

  // ===== INTRO HEART PULSE =====
  useEffect(() => {
    if (phase === 'intro') {
      const pulseAnim = Animated.loop(
        Animated.sequence([
          Animated.timing(introHeartScale, { toValue: 1.08, duration: 800, useNativeDriver: true }),
          Animated.timing(introHeartScale, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      );
      pulseAnim.start();
      return () => pulseAnim.stop();
    }
  }, [phase]);

  // ===== BREATH LOGIC =====
  const runBreathCycle = useCallback(() => {
    const { inhale, hold, exhale } = CONFIG.breathPattern;
    let currentPhase = 'inhale';
    let timer = inhale;

    setBreathState('inhale');
    setBreathTimer(inhale);
    Vibration.vibrate(30);

    breathIntervalRef.current = setInterval(() => {
      timer--;
      setBreathTimer(timer);

      if (timer <= 0) {
        if (currentPhase === 'inhale') {
          currentPhase = 'hold';
          timer = hold;
          setBreathState('hold');
          setBreathTimer(hold);
        } else if (currentPhase === 'hold') {
          currentPhase = 'exhale';
          timer = exhale;
          setBreathState('exhale');
          setBreathTimer(exhale);
        } else if (currentPhase === 'exhale') {
          clearInterval(breathIntervalRef.current);

          setBreathCycle((prev) => {
            const newCycle = prev + 1;
            if (newCycle >= CONFIG.breathCycles) {
              setTimeout(() => setPhase('expansion'), 500);
            } else {
              setTimeout(() => runBreathCycle(), 800);
            }
            return newCycle;
          });
        }
      }
    }, 1000);
  }, []);

  // ===== EXPANSION TIMER =====
  useEffect(() => {
    if (phase === 'expansion') {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1 || energyLevel >= 100) {
            clearInterval(timerRef.current);
            handleComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase]);

  // Check energy completion
  useEffect(() => {
    if (phase === 'expansion' && energyLevel >= 100) {
      if (timerRef.current) clearInterval(timerRef.current);
      handleComplete();
    }
  }, [energyLevel, phase]);

  // ===== CLEANUP =====
  useEffect(() => {
    return () => {
      if (breathIntervalRef.current) clearInterval(breathIntervalRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // ===== GESTURE HANDLER FOR HEART EXPANSION =====
  const lastGestureRef = useRef({ dx: 0, dy: 0 });
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        setGlowIntensity(1);
        Vibration.vibrate(40);
      },
      onPanResponderMove: (_, gestureState) => {
        const { dx, dy } = gestureState;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Trigger wave when dragged far enough
        if (distance > 60 && Math.abs(dx - lastGestureRef.current.dx) > 30) {
          lastGestureRef.current = { dx, dy };
          setWaveKey((k) => k + 1);

          if (dx < 0) {
            setWaveActive({ left: true, right: false });
          } else {
            setWaveActive({ left: false, right: true });
          }

          // Increase energy
          setEnergyLevel((prev) => Math.min(100, prev + 8));
          Vibration.vibrate(20);

          // Reset wave after short delay
          setTimeout(() => setWaveActive({ left: false, right: false }), 150);
        }
      },
      onPanResponderRelease: () => {
        setGlowIntensity(0.4);
        lastGestureRef.current = { dx: 0, dy: 0 };
      },
    })
  ).current;

  // ===== HANDLERS =====
  const handleStart = () => {
    setPhase('breath');
    setBreathCycle(0);
    runBreathCycle();
  };

  const handleSkipBreath = () => {
    if (breathIntervalRef.current) clearInterval(breathIntervalRef.current);
    setPhase('expansion');
  };

  const handleRepeatCycle = () => {
    if (breathIntervalRef.current) clearInterval(breathIntervalRef.current);
    runBreathCycle();
  };

  const handleComplete = async () => {
    setShowParticleBurst(true);
    Vibration.vibrate([0, 50, 100, 50]);

    try {
      if (user?.id) {
        const result = await completeRitual(user.id, 'heart-expansion', {
          energyLevel,
          breathCycles: breathCycle,
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

    setTimeout(() => {
      setShowParticleBurst(false);
      setPhase('completion');
    }, 1500);
  };

  const handleSaveReflection = () => {
    setShowReflectionInput(true);
  };

  const handleFinish = () => {
    navigation.goBack();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getBreathInstruction = () => {
    switch (breathState) {
      case 'inhale':
        return 'Đặt tay lên tim, hít sâu...';
      case 'hold':
        return 'Giữ hơi, cảm nhận nhịp tim...';
      case 'exhale':
        return 'Thở ra nhẹ nhàng, thả lỏng...';
      default:
        return '';
    }
  };

  // ===== RENDER PHASES =====
  const renderIntro = () => (
    <View style={styles.phaseContainer}>
      <Animated.View style={[styles.introHeartContainer, { transform: [{ scale: introHeartScale }] }]}>
        <Heart size={100} color={THEME.primary} fill={THEME.primary} />
      </Animated.View>

      <Text style={styles.introText}>
        Hít vào – mở rộng,{'\n'}thở ra – yêu thương lan tỏa
      </Text>

      <TouchableOpacity style={styles.startButton} onPress={handleStart}>
        <LinearGradient
          colors={['rgba(255, 215, 0, 0.2)', 'rgba(255, 215, 0, 0.05)']}
          style={styles.startButtonGradient}
        >
          <Text style={styles.startButtonText}>Bắt đầu nghi thức</Text>
        </LinearGradient>
      </TouchableOpacity>

      <Text style={styles.durationText}>7 phút • Chữa lành cảm xúc</Text>
    </View>
  );

  const renderBreath = () => (
    <View style={styles.phaseContainer}>
      <BreathCircle breathState={breathState} cycleProgress={breathTimer} />

      <Text style={styles.breathStateText}>
        {breathState === 'inhale' && `HÍT VÀO ${breathTimer}s`}
        {breathState === 'hold' && `GIỮ ${breathTimer}s`}
        {breathState === 'exhale' && `THỞ RA ${breathTimer}s`}
      </Text>

      <View style={styles.progressContainer}>
        <View
          style={[
            styles.progressBar,
            {
              width: `${
                ((CONFIG.breathPattern.inhale +
                  CONFIG.breathPattern.hold +
                  CONFIG.breathPattern.exhale -
                  breathTimer) /
                  (CONFIG.breathPattern.inhale +
                    CONFIG.breathPattern.hold +
                    CONFIG.breathPattern.exhale)) *
                100
              }%`,
            },
          ]}
        />
      </View>

      <Text style={styles.instructionText}>{getBreathInstruction()}</Text>

      <Text style={styles.cycleText}>
        Chu kỳ: {breathCycle + 1}/{CONFIG.breathCycles}
      </Text>

      <View style={styles.breathButtons}>
        <TouchableOpacity style={styles.breathButton} onPress={handleRepeatCycle}>
          <RotateCcw size={18} color="#fff" />
          <Text style={styles.breathButtonText}>Lặp nhịp</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.breathButton} onPress={handleSkipBreath}>
          <Text style={styles.breathButtonText}>Tiếp tục</Text>
          <ChevronRight size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderExpansion = () => (
    <View style={styles.phaseContainer} {...panResponder.panHandlers}>
      <View style={styles.heartArea}>
        <LoveWave active={waveActive.left} direction="left" waveId={waveKey} />
        <AnimatedHeart glowIntensity={glowIntensity} scale={heartScale} isBeating={true} />
        <LoveWave active={waveActive.right} direction="right" waveId={waveKey} />
      </View>

      <Text style={styles.instructionText}>
        Chạm giữ vào trái tim{'\n'}rồi vuốt ra để lan tỏa yêu thương
      </Text>

      <View style={styles.energyContainer}>
        <Text style={styles.energyLabel}>Năng lượng:</Text>
        <View style={styles.energyBarBg}>
          <LinearGradient
            colors={[THEME.primary, THEME.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.energyBarFill, { width: `${energyLevel}%` }]}
          />
        </View>
        <Text style={styles.energyText}>{energyLevel}%</Text>
      </View>

      <Text style={styles.timerText}>Thời gian còn: {formatTime(timeRemaining)}</Text>
    </View>
  );

  const renderCompletion = () => (
    <View style={styles.completionContainer}>
      <ParticleBurst active={showParticleBurst} />

      <View style={styles.completionHeart}>
        <Heart size={80} color={THEME.primary} fill={THEME.primary} />
        <Text style={styles.sparkles}>✦ ・ ✦ ・ ✦ ・ ✦</Text>
      </View>

      <Text style={styles.completionTitle}>Trái tim bạn đã được mở rộng ✦</Text>

      <View style={styles.rewardsRow}>
        <Text style={styles.rewardText}>+{xpEarned} XP</Text>
        <Text style={styles.rewardText}>🔥 {streak} ngày streak</Text>
      </View>

      {showReflectionInput ? (
        <View style={styles.reflectionContainer}>
          <TextInput
            style={styles.reflectionInput}
            placeholder="Cảm nhận của bạn..."
            placeholderTextColor="rgba(255,255,255,0.4)"
            value={reflection}
            onChangeText={setReflection}
            multiline
          />
          <TouchableOpacity
            style={styles.saveReflectionBtn}
            onPress={() => setShowReflectionInput(false)}
          >
            <Text style={styles.saveReflectionText}>Lưu</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <TouchableOpacity style={styles.actionButton} onPress={handleSaveReflection}>
            <Edit3 size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Ghi cảm nhận</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Star size={20} color={THEME.accent} />
            <Text style={styles.actionButtonText}>Thêm vào Vision Board</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Target size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Liên kết với mục tiêu</Text>
          </TouchableOpacity>
        </>
      )}

      <TouchableOpacity style={styles.finishButton} onPress={handleFinish}>
        <Check size={20} color="#1a0b2e" />
        <Text style={styles.finishButtonText}>Hoàn thành</Text>
      </TouchableOpacity>
    </View>
  );

  // ===== MAIN RENDER =====
  return (
    <LinearGradient colors={THEME.bgGradient} style={styles.container}>
      {/* Background Stars */}
      {backgroundStars.map((star) => (
        <BackgroundStar
          key={star.id}
          size={star.size}
          top={star.top}
          left={star.left}
          delay={star.delay}
        />
      ))}

      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
            <ArrowLeft size={24} color="#fff" />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Heart size={20} color={THEME.primary} />
            <Text style={styles.headerTitle}>Mở Rộng Trái Tim</Text>
          </View>

          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.headerBtn} onPress={() => setIsSoundOn(!isSoundOn)}>
              {isSoundOn ? (
                <Volume2 size={22} color="#fff" />
              ) : (
                <VolumeX size={22} color="rgba(255,255,255,0.5)" />
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerBtn}>
              <MoreVertical size={22} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Content */}
        {phase === 'intro' && renderIntro()}
        {phase === 'breath' && renderBreath()}
        {phase === 'expansion' && renderExpansion()}
        {phase === 'completion' && renderCompletion()}
      </SafeAreaView>
    </LinearGradient>
  );
};

// ============ STYLES ============
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 8,
  },

  // Phase container
  phaseContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 40,
  },

  // Intro
  introHeartContainer: {
    marginBottom: 40,
    shadowColor: THEME.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
  },
  introText: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: 40,
  },
  startButton: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: THEME.accent,
    overflow: 'hidden',
    marginBottom: 24,
  },
  startButtonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 40,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: THEME.accent,
  },
  durationText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
  },

  // Breath
  breathCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  breathCircleInner: {
    width: '100%',
    height: '100%',
    borderRadius: 80,
  },
  breathStateText: {
    fontSize: 28,
    fontWeight: '700',
    color: THEME.primary,
    marginBottom: 16,
  },
  progressContainer: {
    width: '80%',
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    marginBottom: 24,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: THEME.primary,
    borderRadius: 4,
  },
  instructionText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 24,
  },
  cycleText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 32,
  },
  breathButtons: {
    flexDirection: 'row',
    gap: 40,
  },
  breathButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
  },
  breathButtonText: {
    fontSize: 15,
    color: '#fff',
  },

  // Heart expansion
  heartArea: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: SCREEN_WIDTH,
    height: 200,
    marginBottom: 32,
  },
  heartContainer: {
    shadowOffset: { width: 0, height: 0 },
    elevation: 20,
  },
  loveWave: {
    position: 'absolute',
  },
  waveText: {
    fontSize: 36,
    color: THEME.secondary,
  },
  energyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 16,
  },
  energyLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
  },
  energyBarBg: {
    width: 140,
    height: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 6,
    overflow: 'hidden',
  },
  energyBarFill: {
    height: '100%',
    borderRadius: 6,
  },
  energyText: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.primary,
    width: 40,
  },
  timerText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 16,
  },

  // Completion
  completionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  particleBurstContainer: {
    position: 'absolute',
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completionHeart: {
    alignItems: 'center',
    marginBottom: 24,
  },
  sparkles: {
    fontSize: 18,
    color: THEME.accent,
    marginTop: 12,
  },
  completionTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  rewardsRow: {
    flexDirection: 'row',
    gap: 32,
    marginBottom: 32,
  },
  rewardText: {
    fontSize: 16,
    color: THEME.accent,
    fontWeight: '600',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 12,
  },
  actionButtonText: {
    fontSize: 16,
    color: '#fff',
  },
  reflectionContainer: {
    width: '100%',
    marginBottom: 16,
  },
  reflectionInput: {
    width: '100%',
    height: 100,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    padding: 16,
    color: '#fff',
    fontSize: 15,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  saveReflectionBtn: {
    alignSelf: 'flex-end',
    paddingVertical: 8,
    paddingHorizontal: 20,
    backgroundColor: THEME.primary,
    borderRadius: 8,
  },
  saveReflectionText: {
    color: '#fff',
    fontWeight: '600',
  },
  finishButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    paddingVertical: 16,
    backgroundColor: THEME.accent,
    borderRadius: 12,
    marginTop: 16,
  },
  finishButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a0b2e',
  },
});

export default HeartExpansionRitual;
