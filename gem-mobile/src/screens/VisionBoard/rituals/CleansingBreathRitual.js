/**
 * CleansingBreathRitual - Thở Thanh Lọc
 * Vision Board 2.0 - Breathing exercise with visual feedback
 * Created: December 10, 2025
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Vibration,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';
import {
  ArrowLeft,
  Wind,
  Volume2,
  VolumeX,
  Check,
  Sparkles,
  Play,
  Pause,
} from 'lucide-react-native';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import { useAuth } from '../../../contexts/AuthContext';
import { completeRitual } from '../../../services/ritualService';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const BREATH_COLORS = {
  inhale: '#667EEA',
  hold: '#764BA2',
  exhale: '#4ECDC4',
  rest: '#44A08D',
};

const BREATH_CIRCLE_SIZE = 200;

// Breath phases
const BREATH_PHASES = [
  { phase: 'inhale', duration: 4000, text: 'Hít vào...', color: BREATH_COLORS.inhale },
  { phase: 'hold', duration: 4000, text: 'Giữ hơi...', color: BREATH_COLORS.hold },
  { phase: 'exhale', duration: 4000, text: 'Thở ra...', color: BREATH_COLORS.exhale },
  { phase: 'rest', duration: 4000, text: 'Nghỉ...', color: BREATH_COLORS.rest },
];

// Breath Circle Component
const BreathCircle = ({ phase, progress }) => {
  const scaleAnim = useRef(new Animated.Value(0.6)).current;
  const glowOpacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const targetScale = phase === 'inhale' || phase === 'hold' ? 1.3 : 0.6;
    const targetGlow = phase === 'inhale' || phase === 'hold' ? 0.8 : 0.3;

    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: targetScale,
        duration: 4000,
        useNativeDriver: true,
      }),
      Animated.timing(glowOpacity, {
        toValue: targetGlow,
        duration: 4000,
        useNativeDriver: true,
      }),
    ]).start();

    return () => {
      scaleAnim.stopAnimation();
      glowOpacity.stopAnimation();
    };
  }, [phase]);

  const currentPhaseData = BREATH_PHASES.find(p => p.phase === phase) || BREATH_PHASES[0];

  return (
    <View style={styles.breathCircleContainer}>
      {/* Outer glow */}
      <Animated.View
        style={[
          styles.breathGlow,
          {
            opacity: glowOpacity,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Svg width={BREATH_CIRCLE_SIZE + 100} height={BREATH_CIRCLE_SIZE + 100}>
          <Defs>
            <RadialGradient id="breathGlow" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor={currentPhaseData.color} stopOpacity="0.6" />
              <Stop offset="100%" stopColor={currentPhaseData.color} stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Circle
            cx={(BREATH_CIRCLE_SIZE + 100) / 2}
            cy={(BREATH_CIRCLE_SIZE + 100) / 2}
            r={BREATH_CIRCLE_SIZE / 2 + 40}
            fill="url(#breathGlow)"
          />
        </Svg>
      </Animated.View>

      {/* Main circle */}
      <Animated.View
        style={[
          styles.breathCircle,
          {
            backgroundColor: currentPhaseData.color,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Wind size={50} color="#fff" />
      </Animated.View>
    </View>
  );
};

// Counter display
const Counter = ({ count }) => {
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.2,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [count]);

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Text style={styles.counterText}>{count}</Text>
    </Animated.View>
  );
};

const CleansingBreathRitual = ({ navigation }) => {
  const { user } = useAuth();
  const [phase, setPhase] = useState('start'); // start, breathing, completed
  const [currentBreathPhase, setCurrentBreathPhase] = useState(0);
  const [currentCycle, setCurrentCycle] = useState(0);
  const [counter, setCounter] = useState(4);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [sound, setSound] = useState(null);

  const totalCycles = 4;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const intervalRef = useRef(null);
  const phaseTimeoutRef = useRef(null);

  // Load ambient sound
  useEffect(() => {
    const loadSound = async () => {
      try {
        const { sound: audioSound } = await Audio.Sound.createAsync(
          require('../../../assets/sounds/breathing.mp3'),
          { isLooping: true, volume: 0.3 }
        );
        setSound(audioSound);
      } catch (err) {
        console.log('Sound not available');
      }
    };

    loadSound();

    return () => {
      if (sound) sound.unloadAsync();
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (phaseTimeoutRef.current) clearTimeout(phaseTimeoutRef.current);
    };
  }, []);

  // Fade in animation
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  // Breathing logic
  useEffect(() => {
    if (phase !== 'breathing' || isPaused) return;

    // Counter countdown
    setCounter(4);
    intervalRef.current = setInterval(() => {
      setCounter(prev => {
        if (prev <= 1) return 4;
        return prev - 1;
      });
    }, 1000);

    // Phase transition
    phaseTimeoutRef.current = setTimeout(() => {
      const nextPhaseIndex = (currentBreathPhase + 1) % BREATH_PHASES.length;

      // If we've completed a full cycle
      if (nextPhaseIndex === 0) {
        const nextCycle = currentCycle + 1;
        if (nextCycle >= totalCycles) {
          handleComplete();
          return;
        }
        setCurrentCycle(nextCycle);
      }

      setCurrentBreathPhase(nextPhaseIndex);
      Vibration.vibrate(50);
    }, BREATH_PHASES[currentBreathPhase].duration);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (phaseTimeoutRef.current) clearTimeout(phaseTimeoutRef.current);
    };
  }, [phase, currentBreathPhase, isPaused]);

  const startRitual = async () => {
    setPhase('breathing');
    setCurrentBreathPhase(0);
    setCurrentCycle(0);
    setCounter(4);
    Vibration.vibrate(100);

    if (sound && !isMuted) {
      await sound.playAsync();
    }
  };

  const handleComplete = async () => {
    setPhase('completed');
    Vibration.vibrate([0, 100, 50, 100, 50, 100]);

    if (sound) {
      await sound.stopAsync();
    }

    // Save completion
    if (user?.id) {
      try {
        await completeRitual(user.id, 'cleansing-breath', `${totalCycles} cycles`);
      } catch (err) {
        console.error('Failed to save ritual:', err);
      }
    }
  };

  const togglePause = async () => {
    setIsPaused(!isPaused);
    if (sound) {
      if (isPaused) {
        await sound.playAsync();
      } else {
        await sound.pauseAsync();
      }
    }
  };

  const toggleMute = async () => {
    setIsMuted(!isMuted);
    if (sound) {
      if (isMuted) {
        await sound.playAsync();
      } else {
        await sound.pauseAsync();
      }
    }
  };

  const currentPhaseData = BREATH_PHASES[currentBreathPhase];

  return (
    <LinearGradient
      colors={['#0D1B2A', '#1B263B', '#415A77']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ArrowLeft size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>Thở Thanh Lọc</Text>
          <TouchableOpacity onPress={toggleMute} style={styles.muteButton}>
            {isMuted ? (
              <VolumeX size={24} color="#fff" />
            ) : (
              <Volume2 size={24} color="#fff" />
            )}
          </TouchableOpacity>
        </View>

        {/* Main Content */}
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          {phase === 'start' && (
            <View style={styles.startScreen}>
              <Wind size={80} color={BREATH_COLORS.inhale} />
              <Text style={styles.subtitle}>Làm sạch năng lượng tiêu cực</Text>
              <Text style={styles.description}>
                Kỹ thuật thở 4-4-4-4:{'\n'}
                Hít vào 4 nhịp - Giữ 4 nhịp - Thở ra 4 nhịp - Nghỉ 4 nhịp{'\n\n'}
                Thực hiện {totalCycles} vòng (~{Math.ceil(totalCycles * 16 / 60)} phút)
              </Text>
              <TouchableOpacity style={styles.startButton} onPress={startRitual}>
                <Text style={styles.startButtonText}>Bắt đầu</Text>
              </TouchableOpacity>
            </View>
          )}

          {phase === 'breathing' && (
            <View style={styles.breathingPhase}>
              {/* Cycle indicator */}
              <View style={styles.cycleIndicator}>
                <Text style={styles.cycleText}>
                  Vòng {currentCycle + 1}/{totalCycles}
                </Text>
                <View style={styles.cycleDots}>
                  {Array.from({ length: totalCycles }).map((_, i) => (
                    <View
                      key={i}
                      style={[
                        styles.cycleDot,
                        i <= currentCycle && styles.cycleDotActive,
                      ]}
                    />
                  ))}
                </View>
              </View>

              {/* Breath circle */}
              <BreathCircle
                phase={currentPhaseData.phase}
                progress={counter / 4}
              />

              {/* Phase text and counter */}
              <View style={styles.phaseInfo}>
                <Text style={[styles.phaseText, { color: currentPhaseData.color }]}>
                  {currentPhaseData.text}
                </Text>
                <Counter count={counter} />
              </View>

              {/* Pause button */}
              <TouchableOpacity style={styles.pauseButton} onPress={togglePause}>
                {isPaused ? (
                  <Play size={24} color="#fff" fill="#fff" />
                ) : (
                  <Pause size={24} color="#fff" fill="#fff" />
                )}
              </TouchableOpacity>

              {isPaused && (
                <Text style={styles.pausedText}>Đã tạm dừng</Text>
              )}
            </View>
          )}

          {phase === 'completed' && (
            <View style={styles.completionScreen}>
              <View style={styles.completionIcon}>
                <Check size={60} color="#4CAF50" />
              </View>
              <Text style={styles.completionTitle}>Hoàn thành!</Text>
              <Text style={styles.completionText}>
                Bạn đã hoàn thành {totalCycles} vòng thở thanh lọc.{'\n'}
                Năng lượng của bạn đã được làm sạch.
              </Text>
              <View style={styles.xpBadge}>
                <Sparkles size={20} color="#FFD700" />
                <Text style={styles.xpText}>+30 XP</Text>
              </View>
              <TouchableOpacity
                style={styles.doneButton}
                onPress={() => navigation.goBack()}
              >
                <Text style={styles.doneButtonText}>Hoàn tất</Text>
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  muteButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    paddingBottom: 40,
  },
  startScreen: {
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 16,
  },
  description: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    marginTop: 16,
    paddingHorizontal: 16,
    lineHeight: 24,
  },
  startButton: {
    backgroundColor: BREATH_COLORS.inhale,
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 30,
    marginTop: 32,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  breathingPhase: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cycleIndicator: {
    position: 'absolute',
    top: 40,
    alignItems: 'center',
  },
  cycleText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 8,
  },
  cycleDots: {
    flexDirection: 'row',
    gap: 8,
  },
  cycleDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  cycleDotActive: {
    backgroundColor: BREATH_COLORS.inhale,
  },
  breathCircleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: BREATH_CIRCLE_SIZE + 100,
    height: BREATH_CIRCLE_SIZE + 100,
  },
  breathGlow: {
    position: 'absolute',
  },
  breathCircle: {
    width: BREATH_CIRCLE_SIZE,
    height: BREATH_CIRCLE_SIZE,
    borderRadius: BREATH_CIRCLE_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  phaseInfo: {
    alignItems: 'center',
    marginTop: 40,
  },
  phaseText: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 12,
  },
  counterText: {
    fontSize: 60,
    fontWeight: '700',
    color: '#fff',
  },
  pauseButton: {
    position: 'absolute',
    bottom: 80,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pausedText: {
    position: 'absolute',
    bottom: 40,
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
  },
  completionScreen: {
    alignItems: 'center',
  },
  completionIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(76,175,80,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  completionTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginTop: 24,
  },
  completionText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 12,
    textAlign: 'center',
    lineHeight: 24,
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,215,0,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 20,
    gap: 8,
  },
  xpText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFD700',
  },
  doneButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 48,
    paddingVertical: 14,
    borderRadius: 25,
    marginTop: 32,
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default CleansingBreathRitual;
