/**
 * LetterToUniverseRitual - Thư Gửi Vũ Trụ
 * Vision Board 2.0 - GALAXY COSMIC Animation
 *
 * REDESIGN v3: Galaxy/Cosmic style with:
 * - Shooting stars falling slowly
 * - God rays emanating from center
 * - Nebula gradient purple/pink/blue
 * - Soft glow effects
 * - 20-22 second animation timeline
 *
 * Created: December 11, 2025
 */

import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  TextInput,
  Easing,
  Vibration,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  Send,
  Sparkles,
  Check,
} from 'lucide-react-native';
import { useAuth } from '../../../contexts/AuthContext';
import { completeRitual } from '../../../services/ritualService';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ============ GALAXY COLORS ============
const GALAXY = {
  nebulaPurple: '#8B5CF6',
  nebulaPink: '#EC4899',
  nebulaBlue: '#3B82F6',
  nebulaCyan: '#06B6D4',
  starWhite: '#FFFFFF',
  starGold: '#FFD700',
  lightCore: '#FFF8E1',
  spaceBlack: '#05040B',
  spaceDark: '#0F0A1F',
};

// ============ CONFIG ============
const CONFIG = {
  xpReward: 25,
  animationDuration: 22000, // 22 seconds total
};

// ============ SHOOTING STAR COMPONENT ============
const ShootingStar = memo(({ delay, startX, startY, duration = 2500 }) => {
  const position = useRef(new Animated.ValueXY({ x: startX, y: startY })).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let isMounted = true;
    let animation = null;

    const timer = setTimeout(() => {
      if (!isMounted) return;

      animation = Animated.parallel([
        // Fade in then out
        Animated.sequence([
          Animated.timing(opacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: duration - 300,
            useNativeDriver: true,
          }),
        ]),
        // Move diagonally down-right
        Animated.timing(position, {
          toValue: { x: startX + 250, y: startY + 350 },
          duration: duration,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]);

      animation.start();
    }, delay);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      if (animation) animation.stop();
      opacity.stopAnimation();
      position.stopAnimation();
    };
  }, [delay, startX, startY, duration]);

  return (
    <Animated.View
      style={[
        styles.shootingStar,
        {
          opacity,
          transform: [
            { translateX: position.x },
            { translateY: position.y },
            { rotate: '45deg' },
          ],
        },
      ]}
    >
      {/* Star head */}
      <View style={styles.starHead} />
      {/* Tail gradient */}
      <LinearGradient
        colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.3)', 'transparent']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.starTail}
      />
    </Animated.View>
  );
});

// ============ GOD RAYS COMPONENT ============
const GodRays = memo(({ visible }) => {
  const rotation = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const rotationLoopRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    if (visible && isMounted) {
      // Fade in
      Animated.timing(opacity, {
        toValue: 0.5,
        duration: 2500,
        useNativeDriver: true,
      }).start();

      // Scale up
      Animated.spring(scale, {
        toValue: 1,
        friction: 10,
        tension: 30,
        useNativeDriver: true,
      }).start();

      // Slow rotation
      rotationLoopRef.current = Animated.loop(
        Animated.timing(rotation, {
          toValue: 1,
          duration: 40000, // 40 giây xoay 1 vòng
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      rotationLoopRef.current.start();
    }

    return () => {
      isMounted = false;
      if (rotationLoopRef.current) rotationLoopRef.current.stop();
      rotation.stopAnimation();
      scale.stopAnimation();
      opacity.stopAnimation();
    };
  }, [visible]);

  const spin = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  if (!visible) return null;

  const rays = Array.from({ length: 12 }, (_, i) => (
    <View
      key={i}
      style={[
        styles.ray,
        {
          transform: [{ rotate: `${i * 30}deg` }],
        },
      ]}
    >
      <LinearGradient
        colors={['rgba(255,248,225,0.7)', 'rgba(255,248,225,0.2)', 'transparent']}
        style={styles.rayGradient}
      />
    </View>
  ));

  return (
    <Animated.View
      style={[
        styles.godRaysContainer,
        {
          opacity,
          transform: [{ scale }, { rotate: spin }],
        },
      ]}
    >
      {rays}
      {/* Center glow */}
      <View style={styles.centerGlow} />
    </Animated.View>
  );
});

// ============ NEBULA CLOUD COMPONENT ============
const NebulaCloud = memo(({ color, size, x, y, delay }) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.5)).current;
  const pulseLoopRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    const timer = setTimeout(() => {
      if (!isMounted) return;

      // Fade in
      Animated.timing(opacity, {
        toValue: 0.35,
        duration: 3500,
        useNativeDriver: true,
      }).start();

      // Pulse animation
      pulseLoopRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(scale, {
            toValue: 1.15,
            duration: 5000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 0.85,
            duration: 5000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      );
      pulseLoopRef.current.start();
    }, delay);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      if (pulseLoopRef.current) pulseLoopRef.current.stop();
      opacity.stopAnimation();
      scale.stopAnimation();
    };
  }, [delay]);

  return (
    <Animated.View
      style={[
        styles.nebulaCloud,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          left: x,
          top: y,
          opacity,
          transform: [{ scale }],
        },
      ]}
    />
  );
});

// ============ TWINKLING STAR COMPONENT ============
const TwinklingStar = memo(({ x, y, size, delay }) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const twinkleLoopRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    const timer = setTimeout(() => {
      if (!isMounted) return;

      twinkleLoopRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(opacity, {
            toValue: 1,
            duration: 1200 + Math.random() * 800,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0.15,
            duration: 1200 + Math.random() * 800,
            useNativeDriver: true,
          }),
        ])
      );
      twinkleLoopRef.current.start();
    }, delay);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      if (twinkleLoopRef.current) twinkleLoopRef.current.stop();
      opacity.stopAnimation();
    };
  }, [delay]);

  return (
    <Animated.View
      style={[
        styles.twinklingStar,
        {
          left: x,
          top: y,
          width: size,
          height: size,
          opacity,
        },
      ]}
    />
  );
});

// ============ COSMIC LETTER COMPONENT ============
const CosmicLetter = memo(({ visible, onComplete }) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const glowOpacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    let isMounted = true;
    let phase1Animation = null;
    let phase2Timer = null;

    if (visible && isMounted) {
      // Phase 1: Slow lift with gentle rotation (0-3.5s)
      phase1Animation = Animated.parallel([
        Animated.timing(translateY, {
          toValue: -180,
          duration: 3500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(rotate, {
          toValue: 1,
          duration: 3500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(glowOpacity, {
          toValue: 1,
          duration: 2500,
          useNativeDriver: true,
        }),
      ]);
      phase1Animation.start();

      // Phase 2: Transform into light (3.5-6.5s)
      phase2Timer = setTimeout(() => {
        if (!isMounted) return;

        Animated.parallel([
          Animated.timing(scale, {
            toValue: 0.2,
            duration: 3000,
            easing: Easing.in(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 2800,
            useNativeDriver: true,
          }),
          Animated.timing(glowOpacity, {
            toValue: 0.6,
            duration: 1500,
            useNativeDriver: true,
          }),
        ]).start(() => {
          if (isMounted && onComplete) {
            onComplete();
          }
        });
      }, 3500);
    }

    return () => {
      isMounted = false;
      if (phase1Animation) phase1Animation.stop();
      if (phase2Timer) clearTimeout(phase2Timer);
      translateY.stopAnimation();
      rotate.stopAnimation();
      scale.stopAnimation();
      opacity.stopAnimation();
      glowOpacity.stopAnimation();
    };
  }, [visible, onComplete]);

  const rotateInterpolate = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '7deg'],
  });

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.cosmicLetter,
        {
          opacity,
          transform: [
            { translateY },
            { rotate: rotateInterpolate },
            { scale },
          ],
        },
      ]}
    >
      {/* Glow behind letter */}
      <Animated.View
        style={[
          styles.letterGlow,
          { opacity: glowOpacity },
        ]}
      />
      {/* Letter envelope */}
      <View style={styles.letterEnvelope}>
        <LinearGradient
          colors={[GALAXY.lightCore, GALAXY.starGold, '#FFA500']}
          style={styles.letterGradient}
        >
          <Send size={28} color="#FFF" style={{ transform: [{ rotate: '-20deg' }] }} />
        </LinearGradient>
      </View>
    </Animated.View>
  );
});

// ============ MAIN COMPONENT ============
export default function LetterToUniverseRitual({ navigation }) {
  const { user } = useAuth();

  // State
  const [wish, setWish] = useState('');
  const [phase, setPhase] = useState('input'); // input, animating, complete
  const [showLetter, setShowLetter] = useState(false);
  const [showGodRays, setShowGodRays] = useState(false);
  const [showNebula, setShowNebula] = useState(false);
  const [showStars, setShowStars] = useState(false);
  const [showShootingStars, setShowShootingStars] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);

  const messageOpacity = useRef(new Animated.Value(0)).current;

  // Generate shooting stars data
  const shootingStars = [
    { delay: 8000, startX: -30, startY: 80, duration: 2800 },
    { delay: 9800, startX: 80, startY: 30, duration: 2400 },
    { delay: 11500, startX: SCREEN_WIDTH - 120, startY: 60, duration: 2600 },
    { delay: 13200, startX: 150, startY: 120, duration: 3000 },
    { delay: 15000, startX: SCREEN_WIDTH - 180, startY: 100, duration: 2700 },
    { delay: 17000, startX: 20, startY: 180, duration: 2900 },
  ];

  // Generate nebula clouds
  const nebulaClouds = [
    { color: 'rgba(139, 92, 246, 0.25)', size: 320, x: -80, y: 80, delay: 10000 },
    { color: 'rgba(236, 72, 153, 0.2)', size: 280, x: SCREEN_WIDTH - 180, y: 180, delay: 11500 },
    { color: 'rgba(59, 130, 246, 0.18)', size: 220, x: 30, y: SCREEN_HEIGHT - 450, delay: 12500 },
    { color: 'rgba(6, 182, 212, 0.15)', size: 200, x: SCREEN_WIDTH - 120, y: SCREEN_HEIGHT - 350, delay: 13500 },
  ];

  // Generate twinkling stars
  const twinklingStars = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    x: Math.random() * SCREEN_WIDTH,
    y: Math.random() * SCREEN_HEIGHT * 0.75,
    size: 1.5 + Math.random() * 2.5,
    delay: 15000 + Math.random() * 3500,
  }));

  // Background stars (static)
  const backgroundStars = Array.from({ length: 120 }, (_, i) => ({
    id: i,
    x: Math.random() * SCREEN_WIDTH,
    y: Math.random() * SCREEN_HEIGHT,
    size: 0.8 + Math.random() * 1.8,
    opacity: 0.15 + Math.random() * 0.35,
  }));

  const handleSendWish = useCallback(async () => {
    if (!wish.trim()) return;

    setPhase('animating');
    Vibration.vibrate(30);

    // Start letter animation
    setShowLetter(true);

    // Timeline của animation
    // 6.5s: God rays xuất hiện (after letter fades)
    setTimeout(() => {
      setShowGodRays(true);
      Vibration.vibrate(20);
    }, 6500);

    // 8s: Shooting stars bắt đầu
    setTimeout(() => setShowShootingStars(true), 8000);

    // 10s: Nebula xuất hiện
    setTimeout(() => setShowNebula(true), 10000);

    // 15s: Twinkling stars
    setTimeout(() => setShowStars(true), 15000);

    // 18s: Message hiện
    setTimeout(() => {
      setShowMessage(true);
      Animated.timing(messageOpacity, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      }).start();
    }, 18000);

    // 22s: Complete
    setTimeout(async () => {
      setPhase('complete');

      try {
        if (user?.id) {
          const result = await completeRitual(user.id, 'letter-to-universe', wish);
          setXpEarned(result?.xpEarned || CONFIG.xpReward);
        } else {
          setXpEarned(CONFIG.xpReward);
        }
      } catch (err) {
        console.error('[LetterToUniverse] Complete error:', err);
        setXpEarned(CONFIG.xpReward);
      }
    }, CONFIG.animationDuration);
  }, [wish, user]);

  const handleLetterComplete = useCallback(() => {
    // Letter has transformed into light
    setShowLetter(false);
  }, []);

  const handleFinish = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleCancel = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  // ============ RENDER INPUT PHASE ============
  if (phase === 'input') {
    return (
      <LinearGradient
        colors={[GALAXY.spaceBlack, GALAXY.spaceDark, '#1a0b2e']}
        style={styles.container}
      >
        {/* Background stars */}
        {backgroundStars.map((star) => (
          <View
            key={star.id}
            style={[
              styles.bgStar,
              {
                left: star.x,
                top: star.y,
                width: star.size,
                height: star.size,
                opacity: star.opacity,
              },
            ]}
          />
        ))}

        {/* Header */}
        <SafeAreaView edges={['top']} style={styles.header}>
          <TouchableOpacity onPress={handleCancel} style={styles.backButton}>
            <ArrowLeft size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Thư Gửi Vũ Trụ</Text>
          <View style={{ width: 40 }} />
        </SafeAreaView>

        <View style={styles.inputContainer}>
          <Text style={styles.title}>Thư Gửi Vũ Trụ</Text>
          <Text style={styles.subtitle}>
            Viết điều ước của bạn và gửi lên những vì sao
          </Text>

          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.wishInput}
              placeholder="Điều ước của bạn..."
              placeholderTextColor="rgba(255,255,255,0.35)"
              multiline
              value={wish}
              onChangeText={setWish}
              maxLength={500}
              textAlignVertical="top"
            />
            <Text style={styles.charCount}>{wish.length}/500</Text>
          </View>

          <TouchableOpacity
            style={[
              styles.sendButton,
              !wish.trim() && styles.sendButtonDisabled,
            ]}
            onPress={handleSendWish}
            disabled={!wish.trim()}
          >
            <LinearGradient
              colors={wish.trim() ? [GALAXY.nebulaPurple, GALAXY.nebulaPink] : ['#333', '#222']}
              style={styles.sendButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Send size={20} color="#FFF" />
              <Text style={styles.sendButtonText}>Gửi Điều Ước</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
            <Text style={styles.cancelText}>Hủy</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  // ============ RENDER ANIMATION & COMPLETE PHASE ============
  return (
    <LinearGradient
      colors={[GALAXY.spaceBlack, GALAXY.spaceDark, '#1a0b2e']}
      style={styles.container}
    >
      {/* Background stars (static) */}
      {backgroundStars.map((star) => (
        <View
          key={`bg-${star.id}`}
          style={[
            styles.bgStar,
            {
              left: star.x,
              top: star.y,
              width: star.size,
              height: star.size,
              opacity: star.opacity,
            },
          ]}
        />
      ))}

      {/* Nebula clouds */}
      {showNebula && nebulaClouds.map((cloud, i) => (
        <NebulaCloud key={`nebula-${i}`} {...cloud} />
      ))}

      {/* God rays from center */}
      <GodRays visible={showGodRays} />

      {/* Shooting stars */}
      {showShootingStars && shootingStars.map((star, i) => (
        <ShootingStar key={`shooting-${i}`} {...star} />
      ))}

      {/* Twinkling stars */}
      {showStars && twinklingStars.map((star) => (
        <TwinklingStar key={`twinkle-${star.id}`} {...star} />
      ))}

      {/* Cosmic letter animation */}
      <CosmicLetter
        visible={showLetter}
        onComplete={handleLetterComplete}
      />

      {/* Completion message */}
      {showMessage && (
        <Animated.View
          style={[
            styles.messageContainer,
            { opacity: messageOpacity },
          ]}
        >
          <View style={styles.messageIconWrap}>
            <View style={styles.messageIconGlow} />
            <Sparkles size={36} color={GALAXY.starGold} />
          </View>
          <Text style={styles.messageTitle}>Điều Ước Đã Được Gửi</Text>
          <Text style={styles.messageSubtitle}>
            Vũ trụ đã nhận được thông điệp của bạn
          </Text>

          {phase === 'complete' && (
            <>
              <View style={styles.xpBadge}>
                <Sparkles size={14} color={GALAXY.starGold} />
                <Text style={styles.xpText}>+{xpEarned || CONFIG.xpReward} XP</Text>
              </View>

              <TouchableOpacity
                style={styles.finishButton}
                onPress={handleFinish}
              >
                <LinearGradient
                  colors={[GALAXY.nebulaPurple, GALAXY.nebulaBlue]}
                  style={styles.finishButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Check size={20} color="#FFF" />
                  <Text style={styles.finishButtonText}>Hoàn Thành</Text>
                </LinearGradient>
              </TouchableOpacity>
            </>
          )}
        </Animated.View>
      )}
    </LinearGradient>
  );
}

// ============ STYLES ============
const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },

  // Background stars
  bgStar: {
    position: 'absolute',
    backgroundColor: '#FFF',
    borderRadius: 10,
  },

  // Input phase
  inputContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    marginBottom: 32,
  },
  inputWrapper: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.25)',
    marginBottom: 24,
  },
  wishInput: {
    minHeight: 160,
    padding: 18,
    color: '#fff',
    fontSize: 16,
    lineHeight: 24,
  },
  charCount: {
    textAlign: 'right',
    paddingRight: 16,
    paddingBottom: 12,
    fontSize: 12,
    color: 'rgba(255,255,255,0.35)',
  },
  sendButton: {
    width: '100%',
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 12,
  },
  sendButtonDisabled: {
    opacity: 0.45,
  },
  sendButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  sendButtonText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '600',
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  cancelText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 15,
  },

  // Shooting star
  shootingStar: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
  },
  starHead: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#FFF',
    shadowColor: '#FFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
  },
  starTail: {
    width: 100,
    height: 2.5,
    marginLeft: -3,
    borderRadius: 2,
  },

  // God rays
  godRaysContainer: {
    position: 'absolute',
    width: 450,
    height: 450,
    left: SCREEN_WIDTH / 2 - 225,
    top: SCREEN_HEIGHT / 2 - 280,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ray: {
    position: 'absolute',
    width: 450,
    height: 450,
    alignItems: 'center',
  },
  rayGradient: {
    width: 5,
    height: 225,
    borderRadius: 3,
  },
  centerGlow: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: GALAXY.lightCore,
    shadowColor: GALAXY.lightCore,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 50,
  },

  // Nebula cloud
  nebulaCloud: {
    position: 'absolute',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 80,
  },

  // Twinkling star
  twinklingStar: {
    position: 'absolute',
    backgroundColor: '#FFF',
    borderRadius: 10,
    shadowColor: '#FFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 5,
  },

  // Cosmic letter
  cosmicLetter: {
    position: 'absolute',
    left: SCREEN_WIDTH / 2 - 45,
    top: SCREEN_HEIGHT / 2 - 45,
    width: 90,
    height: 90,
    alignItems: 'center',
    justifyContent: 'center',
  },
  letterGlow: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 248, 225, 0.35)',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 50,
  },
  letterEnvelope: {
    width: 70,
    height: 55,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#FFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 25,
  },
  letterGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Message
  messageContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: SCREEN_HEIGHT / 2 - 120,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  messageIconWrap: {
    position: 'relative',
    marginBottom: 16,
  },
  messageIconGlow: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    top: -22,
    left: -22,
  },
  messageTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#fff',
    marginTop: 8,
    textAlign: 'center',
  },
  messageSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.65)',
    marginTop: 8,
    textAlign: 'center',
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.25)',
  },
  xpText: {
    fontSize: 15,
    fontWeight: '700',
    color: GALAXY.starGold,
  },
  finishButton: {
    marginTop: 28,
    borderRadius: 14,
    overflow: 'hidden',
  },
  finishButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 40,
    gap: 10,
  },
  finishButtonText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '600',
  },
});
