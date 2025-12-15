/**
 * WaterManifestRitual - Hiện Thực Hóa Bằng Nước
 * Vision Board 2.0 - Water blessing ritual
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
  TextInput,
  Vibration,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';
import {
  ArrowLeft,
  Droplet,
  Volume2,
  VolumeX,
  Check,
  Sparkles,
  ChevronRight,
} from 'lucide-react-native';
import Svg, { Circle, Ellipse, Defs, RadialGradient, Stop, Path } from 'react-native-svg';
import { useAuth } from '../../../contexts/AuthContext';
import { completeRitual } from '../../../services/ritualService';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const WATER_COLORS = {
  primary: '#4ECDC4',
  secondary: '#44A08D',
  light: '#88E5DD',
  dark: '#2D9A90',
  glow: '#00FFE0',
};

const GLASS_SIZE = 180;

// Water Ripple Animation
const WaterRipple = ({ isActive }) => {
  const scale1 = useRef(new Animated.Value(0.5)).current;
  const scale2 = useRef(new Animated.Value(0.5)).current;
  const scale3 = useRef(new Animated.Value(0.5)).current;
  const opacity1 = useRef(new Animated.Value(0.8)).current;
  const opacity2 = useRef(new Animated.Value(0.8)).current;
  const opacity3 = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (!isActive) return;

    const createRipple = (scale, opacity, delay) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.parallel([
            Animated.timing(scale, {
              toValue: 2,
              duration: 2000,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0,
              duration: 2000,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(scale, {
              toValue: 0.5,
              duration: 0,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0.8,
              duration: 0,
              useNativeDriver: true,
            }),
          ]),
        ])
      );
    };

    const anim1 = createRipple(scale1, opacity1, 0);
    const anim2 = createRipple(scale2, opacity2, 600);
    const anim3 = createRipple(scale3, opacity3, 1200);

    anim1.start();
    anim2.start();
    anim3.start();

    return () => {
      anim1.stop();
      anim2.stop();
      anim3.stop();
    };
  }, [isActive]);

  if (!isActive) return null;

  return (
    <View style={styles.rippleContainer}>
      <Animated.View
        style={[
          styles.ripple,
          { transform: [{ scale: scale1 }], opacity: opacity1 },
        ]}
      />
      <Animated.View
        style={[
          styles.ripple,
          { transform: [{ scale: scale2 }], opacity: opacity2 },
        ]}
      />
      <Animated.View
        style={[
          styles.ripple,
          { transform: [{ scale: scale3 }], opacity: opacity3 },
        ]}
      />
    </View>
  );
};

// Water Glass Component
const WaterGlass = ({ fillLevel, glowing }) => {
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (glowing) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0.5,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      glowAnim.setValue(0);
    }

    return () => glowAnim.stopAnimation();
  }, [glowing]);

  return (
    <View style={styles.glassContainer}>
      {/* Glow effect */}
      {glowing && (
        <Animated.View
          style={[
            styles.glassGlow,
            { opacity: glowAnim },
          ]}
        >
          <Svg width={GLASS_SIZE + 80} height={GLASS_SIZE + 120}>
            <Defs>
              <RadialGradient id="glassGlow" cx="50%" cy="50%" r="50%">
                <Stop offset="0%" stopColor={WATER_COLORS.glow} stopOpacity="0.5" />
                <Stop offset="100%" stopColor={WATER_COLORS.glow} stopOpacity="0" />
              </RadialGradient>
            </Defs>
            <Ellipse
              cx={(GLASS_SIZE + 80) / 2}
              cy={(GLASS_SIZE + 120) / 2}
              rx={GLASS_SIZE / 2 + 30}
              ry={GLASS_SIZE / 2 + 50}
              fill="url(#glassGlow)"
            />
          </Svg>
        </Animated.View>
      )}

      {/* Glass SVG */}
      <Svg width={GLASS_SIZE} height={GLASS_SIZE + 40} viewBox="0 0 100 120">
        {/* Glass outline */}
        <Path
          d="M15,10 L20,100 L80,100 L85,10"
          fill="none"
          stroke="rgba(255,255,255,0.5)"
          strokeWidth="2"
        />
        {/* Water fill */}
        <Path
          d={`M17,${100 - fillLevel * 80} L18,100 L82,100 L83,${100 - fillLevel * 80}`}
          fill={WATER_COLORS.primary}
          opacity={0.7}
        />
        {/* Water surface */}
        <Ellipse
          cx="50"
          cy={100 - fillLevel * 80}
          rx="33"
          ry="4"
          fill={WATER_COLORS.light}
          opacity={0.8}
        />
      </Svg>
    </View>
  );
};

// Step indicator
const StepIndicator = ({ currentStep, totalSteps }) => (
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

const RITUAL_STEPS = [
  {
    title: 'Chuẩn bị',
    description: 'Đặt một ly nước sạch trước mặt bạn.\nNgồi thoải mái và thả lỏng cơ thể.',
    action: 'Tiếp tục',
  },
  {
    title: 'Viết ý định',
    description: 'Viết rõ ràng điều bạn muốn hiện thực hóa.\nHãy viết như nó đã xảy ra.',
    input: true,
    placeholder: 'Tôi đã đạt được...',
    action: 'Tiếp tục',
  },
  {
    title: 'Nạp năng lượng',
    description: 'Đặt hai tay bao quanh ly nước.\nTập trung ý định vào nước trong 30 giây.',
    duration: 30000,
    action: 'Hoàn thành',
  },
  {
    title: 'Uống nước',
    description: 'Từ từ uống hết ly nước.\nCảm nhận ý định lan tỏa trong cơ thể.',
    action: 'Đã uống xong',
  },
];

const WaterManifestRitual = ({ navigation }) => {
  const { user } = useAuth();
  const [phase, setPhase] = useState('start'); // start, ritual, completed
  const [currentStep, setCurrentStep] = useState(0);
  const [intention, setIntention] = useState('');
  const [isCharging, setIsCharging] = useState(false);
  const [chargeProgress, setChargeProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [sound, setSound] = useState(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const chargeInterval = useRef(null);

  // Load ambient sound
  useEffect(() => {
    const loadSound = async () => {
      try {
        const { sound: audioSound } = await Audio.Sound.createAsync(
          require('../../../assets/sounds/water.mp3'),
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
      if (chargeInterval.current) clearInterval(chargeInterval.current);
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

  const startRitual = async () => {
    setPhase('ritual');
    setCurrentStep(0);
    Vibration.vibrate(100);

    if (sound && !isMuted) {
      await sound.playAsync();
    }
  };

  const nextStep = () => {
    const step = RITUAL_STEPS[currentStep];

    // Validate input step
    if (step.input && !intention.trim()) {
      return;
    }

    // Handle charging step
    if (step.duration && !isCharging) {
      startCharging();
      return;
    }

    // Move to next step or complete
    if (currentStep < RITUAL_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
      setIsCharging(false);
      setChargeProgress(0);
      Vibration.vibrate(50);
    } else {
      handleComplete();
    }
  };

  const startCharging = () => {
    setIsCharging(true);
    setChargeProgress(0);

    const step = RITUAL_STEPS[currentStep];
    const duration = step.duration || 30000;
    const interval = 100;
    let elapsed = 0;

    chargeInterval.current = setInterval(() => {
      elapsed += interval;
      setChargeProgress(elapsed / duration);

      if (elapsed >= duration) {
        clearInterval(chargeInterval.current);
        chargeInterval.current = null;
        setIsCharging(false);

        // Move to next step directly after charging completes
        if (currentStep < RITUAL_STEPS.length - 1) {
          setCurrentStep(prev => prev + 1);
          setChargeProgress(0);
          Vibration.vibrate(50);
        } else {
          handleComplete();
        }
      }
    }, interval);
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
        await completeRitual(user.id, 'water-manifest', intention);
      } catch (err) {
        console.error('Failed to save ritual:', err);
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

  const currentStepData = RITUAL_STEPS[currentStep];

  return (
    <LinearGradient
      colors={['#0A1628', '#152238', '#1E3A5F']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ArrowLeft size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>Hiện Thực Hóa Bằng Nước</Text>
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
              <Droplet size={80} color={WATER_COLORS.primary} fill={WATER_COLORS.primary} />
              <Text style={styles.subtitle}>Nạp ý định vào nước và uống</Text>
              <Text style={styles.description}>
                Nước có khả năng ghi nhớ thông tin.{'\n'}
                Viết ý định, nạp năng lượng vào nước{'\n'}
                và uống để hiện thực hóa.
              </Text>
              <TouchableOpacity style={styles.startButton} onPress={startRitual}>
                <Text style={styles.startButtonText}>Bắt đầu</Text>
              </TouchableOpacity>
            </View>
          )}

          {phase === 'ritual' && (
            <View style={styles.ritualPhase}>
              <StepIndicator
                currentStep={currentStep}
                totalSteps={RITUAL_STEPS.length}
              />

              {/* Water Glass Visual */}
              <View style={styles.visualContainer}>
                <WaterRipple isActive={isCharging} />
                <WaterGlass
                  fillLevel={currentStep >= 3 ? 0 : 0.75}
                  glowing={isCharging}
                />
              </View>

              {/* Step Content */}
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>{currentStepData.title}</Text>
                <Text style={styles.stepDescription}>{currentStepData.description}</Text>

                {/* Input field */}
                {currentStepData.input && (
                  <TextInput
                    style={styles.intentionInput}
                    placeholder={currentStepData.placeholder}
                    placeholderTextColor="rgba(255,255,255,0.4)"
                    value={intention}
                    onChangeText={setIntention}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                  />
                )}

                {/* Charging progress */}
                {isCharging && (
                  <View style={styles.chargingContainer}>
                    <View style={styles.progressBar}>
                      <View
                        style={[
                          styles.progressFill,
                          { width: `${chargeProgress * 100}%` },
                        ]}
                      />
                    </View>
                    <Text style={styles.chargingText}>
                      Đang nạp năng lượng... {Math.round(chargeProgress * 30)}s
                    </Text>
                  </View>
                )}

                {/* Action button */}
                {!isCharging && (
                  <TouchableOpacity
                    style={[
                      styles.actionButton,
                      currentStepData.input && !intention.trim() && styles.actionButtonDisabled,
                    ]}
                    onPress={nextStep}
                    disabled={currentStepData.input && !intention.trim()}
                  >
                    <Text style={styles.actionButtonText}>{currentStepData.action}</Text>
                    <ChevronRight size={20} color="#0A1628" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}

          {phase === 'completed' && (
            <View style={styles.completionScreen}>
              <View style={styles.completionIcon}>
                <Check size={60} color="#4CAF50" />
              </View>
              <Text style={styles.completionTitle}>Tuyệt vời!</Text>
              <Text style={styles.completionText}>
                Ý định của bạn đã được nạp vào cơ thể.{'\n'}
                Hãy tin tưởng và để vũ trụ hiện thực hóa.
              </Text>
              {intention && (
                <View style={styles.intentionCard}>
                  <Sparkles size={16} color={WATER_COLORS.primary} />
                  <Text style={styles.intentionText}>{intention}</Text>
                </View>
              )}
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
    padding: 24,
    paddingBottom: 40,
  },
  startScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
    lineHeight: 24,
  },
  startButton: {
    backgroundColor: WATER_COLORS.primary,
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 30,
    marginTop: 32,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0A1628',
  },
  ritualPhase: {
    flex: 1,
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 24,
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  stepDotActive: {
    backgroundColor: WATER_COLORS.primary,
    width: 24,
  },
  stepDotCompleted: {
    backgroundColor: WATER_COLORS.secondary,
  },
  visualContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 280,
  },
  rippleContainer: {
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
    borderColor: WATER_COLORS.glow,
  },
  glassContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glassGlow: {
    position: 'absolute',
  },
  stepContent: {
    flex: 1,
    alignItems: 'center',
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  stepDescription: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  intentionInput: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#fff',
    minHeight: 100,
    marginBottom: 20,
  },
  chargingContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  progressBar: {
    width: '80%',
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: WATER_COLORS.glow,
    borderRadius: 4,
  },
  chargingText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: WATER_COLORS.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 25,
    gap: 8,
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0A1628',
  },
  completionScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
  intentionCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(78,205,196,0.15)',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    maxWidth: '90%',
    gap: 12,
  },
  intentionText: {
    flex: 1,
    fontSize: 14,
    color: WATER_COLORS.light,
    fontStyle: 'italic',
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

export default WaterManifestRitual;
