/**
 * RitualPlaygroundScreen - Màn hình chính cho nghi thức
 * Vision Board 2.0 - Ritual Playground
 *
 * Features:
 * - Cosmic/Mystic theme với animations
 * - Hỗ trợ nhiều loại nghi thức
 * - Particle effects và ambient sounds
 * - Drag & drop interactions
 *
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
  StatusBar,
  TextInput,
  PanResponder,
  Modal,
  ScrollView,
  Vibration,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';
import {
  ArrowLeft,
  MoreVertical,
  Volume2,
  VolumeX,
  Mail,
  Flame,
  Star,
  Wind,
  Heart,
  Gift,
  Sparkles,
  Send,
  Mic,
  BookOpen,
  Play,
  Pause,
  Check,
  X,
  Moon,
  Sun,
  Feather,
  Clock,
} from 'lucide-react-native';
import Svg, { Circle, Path, Defs, RadialGradient, Stop, G, Rect, Line } from 'react-native-svg';
import { COLORS, TYPOGRAPHY, SPACING } from '../../utils/tokens';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ========== BURN RITUAL CONSTANTS ==========
const FIRE_ALTAR_SIZE = 200; // Kích thước bàn thờ lửa
const FIRE_CORE_SIZE = 140; // Lõi lửa
const PAPER_WIDTH = 220; // Giấy để đốt - rộng hơn
const PAPER_HEIGHT = 180; // Cao hơn để chứa text
const FLAME_COLORS = {
  core: '#FFFFFF', // Lõi trắng nóng
  inner: '#FFC940', // Vàng cam trong
  outer: '#FF9330', // Cam ngoài
  tip: '#FF6B6B', // Đầu ngọn lửa đỏ
  mystical: '#A45CFF', // Viền huyền bí tím
};
const PAPER_COLOR = '#FCE2BF'; // Màu giấy da

// Icon mapping
const RITUAL_ICONS = {
  Mail,
  Flame,
  Star,
  Wind,
  Heart,
  Gift,
  Sparkles,
  Moon,
  Sun,
  Feather,
};

// Ritual types configuration
const RITUAL_CONFIGS = {
  'letter-to-universe': {
    title: 'Thư Gửi Vũ Trụ',
    subtitle: 'Gửi điều ước đến vũ trụ bao la',
    icon: 'Mail',
    prompt: 'Viết điều ước của bạn gửi đến vũ trụ...',
    actionLabel: 'Kéo thư lên bầu trời',
    completionMessage: 'Điều ước của bạn đã được gửi đến vũ trụ',
    gradients: {
      background: ['#0D0221', '#1A0533', '#2D1B4E'],
      accent: ['#6A5BFF', '#9D4EDD'],
    },
    targetZone: 'sky',
    transformTo: 'star',
  },
  'burn-release': {
    title: 'Đốt & Giải Phóng',
    subtitle: 'Buông bỏ và chuyển hóa năng lượng',
    icon: 'Flame',
    prompt: 'Viết ra điều bạn muốn buông bỏ...',
    actionLabel: 'Kéo giấy vào ngọn lửa',
    completionMessage: 'Bạn đã được giải phóng khỏi gánh nặng đó',
    gradients: {
      background: ['#1A0A0A', '#2D1010', '#3D1515'],
      accent: ['#FF6B6B', '#FF8E53'],
    },
    targetZone: 'fire',
    transformTo: 'ash',
  },
  'star-wish': {
    title: 'Nghi Thức Ước Sao',
    subtitle: 'Ước nguyện dưới ánh sao',
    icon: 'Star',
    prompt: 'Nhắm mắt và ghi lại điều ước của bạn...',
    actionLabel: 'Kéo điều ước lên ngôi sao',
    completionMessage: 'Ngôi sao đã nhận được điều ước của bạn',
    gradients: {
      background: ['#0A1628', '#152238', '#1E3A5F'],
      accent: ['#4ECDC4', '#44A08D'],
    },
    targetZone: 'star',
    transformTo: 'sparkle',
  },
  'purify-breathwork': {
    title: 'Thở Thanh Lọc',
    subtitle: 'Làm sạch không gian cảm xúc',
    icon: 'Wind',
    prompt: 'Ghi lại cảm xúc bạn muốn thanh lọc...',
    actionLabel: 'Thổi cảm xúc vào gió',
    completionMessage: 'Không gian cảm xúc của bạn đã được thanh lọc',
    gradients: {
      background: ['#0D1B2A', '#1B263B', '#415A77'],
      accent: ['#667EEA', '#764BA2'],
    },
    targetZone: 'wind',
    transformTo: 'breeze',
  },
  'heart-opening': {
    title: 'Mở Rộng Trái Tim',
    subtitle: 'Nghi thức tần số yêu thương',
    icon: 'Heart',
    prompt: 'Viết ra người hoặc điều bạn muốn gửi yêu thương...',
    actionLabel: 'Gửi tình yêu từ trái tim',
    completionMessage: 'Tình yêu đã được lan tỏa từ trái tim bạn',
    gradients: {
      background: ['#1A0A1A', '#2D152D', '#4A1F4A'],
      accent: ['#F093FB', '#F5576C'],
    },
    targetZone: 'heart',
    transformTo: 'love',
  },
  'gratitude-flow': {
    title: 'Dòng Chảy Biết Ơn',
    subtitle: 'Thu hút thêm nhiều phước lành',
    icon: 'Gift',
    prompt: 'Viết ra những điều bạn biết ơn trong cuộc sống...',
    actionLabel: 'Gửi lòng biết ơn vào vũ trụ',
    completionMessage: 'Lòng biết ơn của bạn đã lan tỏa ra vũ trụ',
    gradients: {
      background: ['#1A1500', '#2D2500', '#4A3D00'],
      accent: ['#FFD700', '#FFA500'],
    },
    targetZone: 'golden',
    transformTo: 'blessing',
  },
};

// Particle Component - WITH CLEANUP TO PREVENT INFINITE LOOP
const Particle = ({ delay = 0, style, color = '#FFD700' }) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    let isMounted = true;

    const animate = () => {
      if (!isMounted) return;

      opacity.setValue(0);
      translateY.setValue(0);
      scale.setValue(0.3);

      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: -100,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 0.5,
            duration: 2000,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => {
        if (isMounted) animate();
      });
    };

    animate();

    return () => {
      isMounted = false;
      opacity.stopAnimation();
      translateY.stopAnimation();
      scale.stopAnimation();
    };
  }, []); // Empty deps - only run once on mount

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          backgroundColor: color,
          opacity,
          transform: [{ translateY }, { scale }],
        },
        style,
      ]}
    />
  );
};

// Star Component for background - WITH CLEANUP
const BackgroundStar = ({ size = 2, top, left, delay = 0 }) => {
  const opacity = useRef(new Animated.Value(0.3)).current;
  const animationRef = useRef(null);

  useEffect(() => {
    animationRef.current = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 1000 + Math.random() * 1000,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 1000 + Math.random() * 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animationRef.current.start();

    return () => {
      if (animationRef.current) {
        animationRef.current.stop();
      }
      opacity.stopAnimation();
    };
  }, []); // Empty deps

  return (
    <Animated.View
      style={[
        styles.backgroundStar,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          top,
          left,
          opacity,
        },
      ]}
    />
  );
};

// ========== BURN RITUAL COMPONENTS ==========
// Sacred Flame - Ngọn lửa thiêng với hiệu ứng flame flicker

// Ember Particle - Tàn lửa bay lên - WITH CLEANUP
const EmberParticle = ({ delay = 0, startX = 0 }) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(startX)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    let isMounted = true;

    const animate = () => {
      if (!isMounted) return;

      translateY.setValue(0);
      translateX.setValue(startX);
      opacity.setValue(0);
      scale.setValue(0.5 + Math.random() * 0.5);

      const driftX = (Math.random() - 0.5) * 60;
      const duration = 1200 + Math.random() * 800;

      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          // Bay lên
          Animated.timing(translateY, {
            toValue: -180 - Math.random() * 80,
            duration: duration,
            useNativeDriver: true,
          }),
          // Drift sang trái/phải
          Animated.timing(translateX, {
            toValue: startX + driftX,
            duration: duration,
            useNativeDriver: true,
          }),
          // Fade in rồi out
          Animated.sequence([
            Animated.timing(opacity, {
              toValue: 1,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.delay(duration - 600),
            Animated.timing(opacity, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }),
          ]),
          // Scale nhỏ dần
          Animated.timing(scale, {
            toValue: 0.2,
            duration: duration,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => {
        if (isMounted) animate();
      });
    };

    animate();

    return () => {
      isMounted = false;
      translateY.stopAnimation();
      translateX.stopAnimation();
      opacity.stopAnimation();
      scale.stopAnimation();
    };
  }, []); // Empty deps

  const emberColor = Math.random() > 0.5 ? FLAME_COLORS.inner : FLAME_COLORS.outer;

  return (
    <Animated.View
      style={{
        position: 'absolute',
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: emberColor,
        opacity,
        transform: [{ translateX }, { translateY }, { scale }],
        shadowColor: emberColor,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 4,
      }}
    />
  );
};

// Sacred Flame SVG Component
const SacredFlameSVG = ({ size = FIRE_ALTAR_SIZE, flickerScale = 1 }) => (
  <Svg width={size} height={size * 1.2} viewBox="0 0 100 120">
    <Defs>
      {/* Gradient cho ngọn lửa chính */}
      <RadialGradient id="flameGradMain" cx="50%" cy="80%" r="60%">
        <Stop offset="0%" stopColor={FLAME_COLORS.core} stopOpacity="1" />
        <Stop offset="30%" stopColor={FLAME_COLORS.inner} stopOpacity="0.95" />
        <Stop offset="70%" stopColor={FLAME_COLORS.outer} stopOpacity="0.85" />
        <Stop offset="100%" stopColor={FLAME_COLORS.tip} stopOpacity="0" />
      </RadialGradient>
      {/* Gradient cho viền huyền bí */}
      <RadialGradient id="flameGradMystic" cx="50%" cy="90%" r="50%">
        <Stop offset="0%" stopColor="transparent" stopOpacity="0" />
        <Stop offset="60%" stopColor={FLAME_COLORS.mystical} stopOpacity="0.3" />
        <Stop offset="100%" stopColor={FLAME_COLORS.mystical} stopOpacity="0.6" />
      </RadialGradient>
      {/* Glow effect */}
      <RadialGradient id="flameGlow" cx="50%" cy="70%" r="70%">
        <Stop offset="0%" stopColor={FLAME_COLORS.inner} stopOpacity="0.4" />
        <Stop offset="50%" stopColor={FLAME_COLORS.outer} stopOpacity="0.2" />
        <Stop offset="100%" stopColor="transparent" stopOpacity="0" />
      </RadialGradient>
    </Defs>

    {/* Outer glow */}
    <Circle cx="50" cy="85" r="45" fill="url(#flameGlow)" />

    {/* Ngọn lửa chính - Hình dạng flame tự nhiên */}
    <Path
      d={`
        M50 ${15 - flickerScale * 5}
        Q35 35, 30 55
        Q25 75, 35 90
        Q45 100, 50 100
        Q55 100, 65 90
        Q75 75, 70 55
        Q65 35, 50 ${15 - flickerScale * 5}
        Z
      `}
      fill="url(#flameGradMain)"
    />

    {/* Ngọn lửa bên trong - Lõi trắng nóng */}
    <Path
      d={`
        M50 ${35 - flickerScale * 3}
        Q42 50, 40 65
        Q38 80, 45 88
        Q50 92, 55 88
        Q62 80, 60 65
        Q58 50, 50 ${35 - flickerScale * 3}
        Z
      `}
      fill={FLAME_COLORS.core}
      opacity="0.9"
    />

    {/* Viền huyền bí */}
    <Path
      d={`
        M50 ${10 - flickerScale * 6}
        Q30 30, 22 55
        Q15 85, 35 98
        Q50 108, 65 98
        Q85 85, 78 55
        Q70 30, 50 ${10 - flickerScale * 6}
        Z
      `}
      fill="none"
      stroke={FLAME_COLORS.mystical}
      strokeWidth="2"
      opacity="0.5"
    />

    {/* Đế lửa - Bàn thờ */}
    <Circle cx="50" cy="100" r="25" fill="rgba(255, 100, 50, 0.3)" />
    <Circle cx="50" cy="100" r="18" fill="rgba(255, 150, 50, 0.5)" />
  </Svg>
);

// Sacred Flame Component với Animations
const SacredFlame = ({ isActive = true, isPeaceMode = false }) => {
  const flickerAnim = useRef(new Animated.Value(1)).current;
  const glowPulseAnim = useRef(new Animated.Value(0.6)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Flame flicker animation (6-14% variation)
  useEffect(() => {
    if (!isActive) return;

    const flickerLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(flickerAnim, {
          toValue: 1 + (Math.random() * 0.08 + 0.06), // 6-14% tăng
          duration: 100 + Math.random() * 100,
          useNativeDriver: true,
        }),
        Animated.timing(flickerAnim, {
          toValue: 1 - (Math.random() * 0.08 + 0.06), // 6-14% giảm
          duration: 100 + Math.random() * 100,
          useNativeDriver: true,
        }),
      ])
    );
    flickerLoop.start();
    return () => flickerLoop.stop();
  }, [isActive, flickerAnim]);

  // Glow pulse animation (3-5s cycle)
  useEffect(() => {
    const glowLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(glowPulseAnim, {
          toValue: 1,
          duration: isPeaceMode ? 4000 : 2000,
          useNativeDriver: false,
        }),
        Animated.timing(glowPulseAnim, {
          toValue: isPeaceMode ? 0.4 : 0.6,
          duration: isPeaceMode ? 4000 : 2000,
          useNativeDriver: false,
        }),
      ])
    );
    glowLoop.start();
    return () => glowLoop.stop();
  }, [isPeaceMode, glowPulseAnim]);

  // Peace mode - Soft flame
  useEffect(() => {
    Animated.timing(scaleAnim, {
      toValue: isPeaceMode ? 0.8 : 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [isPeaceMode, scaleAnim]);

  // Tạo embers
  const embers = React.useMemo(() => {
    return [...Array(12)].map((_, i) => ({
      id: i,
      delay: i * 200,
      startX: (Math.random() - 0.5) * 40,
    }));
  }, []);

  const glowOpacity = glowPulseAnim.interpolate({
    inputRange: [0.4, 1],
    outputRange: [0.3, 0.8],
  });

  return (
    <View style={burnStyles.sacredFlameContainer}>
      {/* Outer glow aura */}
      <Animated.View
        style={[
          burnStyles.flameOuterGlow,
          {
            opacity: glowOpacity,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      />

      {/* Flame SVG */}
      <Animated.View
        style={{
          transform: [
            { scale: scaleAnim },
            { scaleY: flickerAnim },
          ],
        }}
      >
        <SacredFlameSVG size={FIRE_ALTAR_SIZE} flickerScale={1} />
      </Animated.View>

      {/* Embers floating up */}
      <View style={burnStyles.embersContainer}>
        {embers.map((ember) => (
          <EmberParticle
            key={ember.id}
            delay={ember.delay}
            startX={ember.startX}
          />
        ))}
      </View>

      {/* Label */}
      <Text style={burnStyles.flameLabel}>Ngọn Lửa Thiêng</Text>
    </View>
  );
};

// Ash Particle - Tro bay theo gió
const AshParticle = ({ delay = 0, startX = 0, startY = 0 }) => {
  const translateY = useRef(new Animated.Value(startY)).current;
  const translateX = useRef(new Animated.Value(startX)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const windDirection = Math.random() > 0.5 ? 1 : -1;
    const duration = 1400 + Math.random() * 600;

    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        // Bay lên và sang ngang (theo gió)
        Animated.timing(translateY, {
          toValue: startY - 200 - Math.random() * 100,
          duration: duration,
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: startX + windDirection * (80 + Math.random() * 60),
          duration: duration,
          useNativeDriver: true,
        }),
        // Xoay
        Animated.timing(rotate, {
          toValue: windDirection * (2 + Math.random() * 2),
          duration: duration,
          useNativeDriver: true,
        }),
        // Fade out
        Animated.timing(opacity, {
          toValue: 0,
          duration: duration,
          useNativeDriver: true,
        }),
        // Thu nhỏ
        Animated.timing(scale, {
          toValue: 0.3,
          duration: duration,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [delay, startX, startY, translateY, translateX, opacity, rotate, scale]);

  const rotateInterpolate = rotate.interpolate({
    inputRange: [-4, 0, 4],
    outputRange: ['-720deg', '0deg', '720deg'],
  });

  return (
    <Animated.View
      style={{
        position: 'absolute',
        width: 8 + Math.random() * 6,
        height: 4 + Math.random() * 4,
        borderRadius: 2,
        backgroundColor: '#444',
        opacity,
        transform: [
          { translateX },
          { translateY },
          { rotate: rotateInterpolate },
          { scale },
        ],
      }}
    />
  );
};

// Ash Burst - Vụ nổ tro khi giấy cháy hết
const AshBurst = ({ visible, onComplete }) => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (visible) {
      const count = 20;
      const newParticles = [...Array(count)].map((_, i) => ({
        id: `ash-${Date.now()}-${i}`,
        delay: Math.random() * 200,
        startX: (Math.random() - 0.5) * 60,
        startY: Math.random() * 30,
      }));
      setParticles(newParticles);

      // Callback sau khi animation xong
      const timer = setTimeout(() => {
        if (onComplete) onComplete();
      }, 2000);

      return () => clearTimeout(timer);
    } else {
      setParticles([]);
    }
  }, [visible, onComplete]);

  if (!visible || particles.length === 0) return null;

  return (
    <View style={burnStyles.ashBurstContainer}>
      {particles.map((p) => (
        <AshParticle
          key={p.id}
          delay={p.delay}
          startX={p.startX}
          startY={p.startY}
        />
      ))}
    </View>
  );
};

// Spark Burst - Tia lửa bắn ra khi giấy chạm lửa
const SparkParticle = ({ angle, delay, distance }) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const scale = useRef(new Animated.Value(1.5)).current;

  const targetX = Math.cos(angle * Math.PI / 180) * distance;
  const targetY = Math.sin(angle * Math.PI / 180) * distance;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: targetX,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: targetY,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 0.3,
          duration: 250,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  const sparkColor = Math.random() > 0.3 ? FLAME_COLORS.inner : FLAME_COLORS.core;

  return (
    <Animated.View
      style={{
        position: 'absolute',
        width: 5,
        height: 5,
        borderRadius: 2.5,
        backgroundColor: sparkColor,
        opacity,
        transform: [{ translateX }, { translateY }, { scale }],
        shadowColor: sparkColor,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 6,
      }}
    />
  );
};

// Spark Burst Container
const SparkBurst = ({ visible }) => {
  const [sparks, setSparks] = useState([]);

  useEffect(() => {
    if (visible) {
      const count = 16;
      const newSparks = [...Array(count)].map((_, i) => ({
        id: `spark-${Date.now()}-${i}`,
        angle: (360 / count) * i + (Math.random() - 0.5) * 20,
        delay: Math.random() * 50,
        distance: 40 + Math.random() * 40,
      }));
      setSparks(newSparks);
    } else {
      setSparks([]);
    }
  }, [visible]);

  if (!visible || sparks.length === 0) return null;

  return (
    <View style={burnStyles.sparkBurstContainer}>
      {sparks.map((s) => (
        <SparkParticle
          key={s.id}
          angle={s.angle}
          delay={s.delay}
          distance={s.distance}
        />
      ))}
    </View>
  );
};

// Burnable Paper Component - Giấy có thể đốt cháy
const BurnablePaper = ({
  content,
  isDragging,
  isNearFlame,
  burnProgress, // 0 = chưa cháy, 1 = cháy hoàn toàn
  position,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const curlAnim = useRef(new Animated.Value(0)).current;
  const edgeGlowAnim = useRef(new Animated.Value(0)).current;

  // Drag state animations
  useEffect(() => {
    if (isDragging) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1.1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.5,
          duration: 200,
          useNativeDriver: false,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [isDragging, scaleAnim, glowAnim]);

  // Near flame effects - viền đỏ, cong nhẹ
  useEffect(() => {
    if (isNearFlame) {
      Animated.parallel([
        Animated.timing(edgeGlowAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(curlAnim, {
          toValue: 0.05, // 3-7% curl
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(edgeGlowAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }),
        Animated.timing(curlAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isNearFlame, edgeGlowAnim, curlAnim]);

  // Edge glow colors
  const edgeBorderColor = edgeGlowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(0,0,0,0.1)', 'rgba(255, 100, 50, 0.8)'],
  });

  const edgeShadowOpacity = edgeGlowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.2, 0.8],
  });

  return (
    <Animated.View
      style={[
        burnStyles.burnablePaper,
        {
          transform: [
            { translateX: position.x },
            { translateY: position.y },
            { scale: scaleAnim },
            { rotateZ: curlAnim.interpolate({
              inputRange: [0, 0.1],
              outputRange: ['0deg', '3deg'],
            })},
          ],
          borderColor: edgeBorderColor,
          shadowOpacity: edgeShadowOpacity,
        },
      ]}
    >
      {/* Paper background texture */}
      <View style={burnStyles.paperTexture}>
        {/* Rough edges simulation */}
        <View style={burnStyles.paperEdgeTop} />
        <View style={burnStyles.paperEdgeBottom} />
      </View>

      {/* Content */}
      <View style={burnStyles.paperContent}>
        <Text style={burnStyles.paperText} numberOfLines={6}>
          {content || 'Điều bạn muốn buông bỏ...'}
        </Text>
      </View>

      {/* Drag hint */}
      {!isDragging && (
        <View style={burnStyles.paperDragHint}>
          <Flame size={14} color="rgba(255, 100, 50, 0.7)" />
          <Text style={burnStyles.paperDragHintText}>
            Kéo giấy vào ngọn lửa
          </Text>
        </View>
      )}
    </Animated.View>
  );
};

// Burning Paper Animation - Giấy đang cháy
const BurningPaper = ({ content, onBurnComplete }) => {
  const burnMaskAnim = useRef(new Animated.Value(0)).current;
  const darkenAnim = useRef(new Animated.Value(0)).current;
  const crumbleAnim = useRef(new Animated.Value(1)).current;
  const [showAsh, setShowAsh] = useState(false);

  useEffect(() => {
    // Burn sequence: 0.3-1.4s burning, 1.4-2.4s dissolve
    Animated.sequence([
      // Contact flash đã xử lý bên ngoài
      // Burning phase (1.1s)
      Animated.parallel([
        Animated.timing(burnMaskAnim, {
          toValue: 1,
          duration: 1100,
          useNativeDriver: false,
        }),
        Animated.timing(darkenAnim, {
          toValue: 0.7,
          duration: 1100,
          useNativeDriver: false,
        }),
      ]),
      // Dissolve phase (1.0s)
      Animated.parallel([
        Animated.timing(crumbleAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      setShowAsh(true);
    });
  }, [burnMaskAnim, darkenAnim, crumbleAnim]);

  // Background darken
  const paperBgColor = darkenAnim.interpolate({
    inputRange: [0, 0.7],
    outputRange: [PAPER_COLOR, '#3D2817'],
  });

  // Edge burn color
  const edgeColor = burnMaskAnim.interpolate({
    inputRange: [0, 0.3, 1],
    outputRange: ['transparent', FLAME_COLORS.outer, '#222'],
  });

  return (
    <View style={burnStyles.burningPaperContainer}>
      <Animated.View
        style={[
          burnStyles.burningPaper,
          {
            backgroundColor: paperBgColor,
            borderColor: edgeColor,
            opacity: crumbleAnim,
            transform: [
              { scale: crumbleAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.5, 1],
              })},
            ],
          },
        ]}
      >
        {/* Burn overlay - từ viền vào */}
        <Animated.View
          style={[
            burnStyles.burnOverlay,
            {
              opacity: burnMaskAnim,
            },
          ]}
        />

        {/* Content fading */}
        <Animated.Text
          style={[
            burnStyles.burningPaperText,
            {
              opacity: burnMaskAnim.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [1, 0.5, 0],
              }),
            },
          ]}
          numberOfLines={6}
        >
          {content}
        </Animated.Text>
      </Animated.View>

      {/* Ash particles */}
      <AshBurst visible={showAsh} onComplete={onBurnComplete} />
    </View>
  );
};

// Burn Completion Modal - Modal hoàn thành nghi thức đốt
const BurnCompletionModal = ({ visible, onClose }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();

      // Breathing glow
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: false,
          }),
          Animated.timing(glowAnim, {
            toValue: 0.5,
            duration: 1500,
            useNativeDriver: false,
          }),
        ]),
        { iterations: 2 }
      ).start();
    } else {
      scaleAnim.setValue(0);
      opacityAnim.setValue(0);
    }
  }, [visible, scaleAnim, opacityAnim, glowAnim]);

  if (!visible) return null;

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0.5, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Modal transparent visible={visible} animationType="none">
      <View style={burnStyles.completionOverlay}>
        {/* Background breathing glow */}
        <Animated.View
          style={[
            burnStyles.completionGlowBg,
            { opacity: glowOpacity },
          ]}
        />

        <Animated.View
          style={[
            burnStyles.completionCard,
            {
              opacity: opacityAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <LinearGradient
            colors={['#2D1010', '#1A0A0A', '#0D0505']}
            style={burnStyles.completionGradient}
          >
            {/* Icon */}
            <View style={burnStyles.completionIconWrap}>
              <Animated.View
                style={[
                  burnStyles.completionIconGlow,
                  { opacity: glowOpacity },
                ]}
              />
              <Wind size={50} color="#FFFFFF" />
            </View>

            {/* Message */}
            <Text style={burnStyles.completionTitle}>
              Bạn đã buông bỏ
            </Text>
            <Text style={burnStyles.completionSubtitle}>
              Bạn tự do rồi.
            </Text>

            {/* Sparkles decoration */}
            <View style={burnStyles.completionSparkles}>
              <Sparkles size={16} color="rgba(255, 150, 50, 0.6)" />
            </View>

            {/* Actions */}
            <View style={burnStyles.completionActions}>
              <TouchableOpacity
                style={burnStyles.completionBtnPrimary}
                onPress={onClose}
              >
                <LinearGradient
                  colors={[FLAME_COLORS.outer, FLAME_COLORS.tip]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={burnStyles.completionBtnGradient}
                >
                  <Text style={burnStyles.completionBtnText}>Tiếp tục</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={burnStyles.completionBtnSecondary}
                onPress={onClose}
              >
                <Text style={burnStyles.completionBtnSecondaryText}>
                  Viết điều cần buông bỏ khác
                </Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
};

// Burn Ritual Styles
const burnStyles = StyleSheet.create({
  // Sacred Flame
  sacredFlameContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: FIRE_ALTAR_SIZE + 60,
    height: FIRE_ALTAR_SIZE * 1.4,
  },
  flameOuterGlow: {
    position: 'absolute',
    width: FIRE_ALTAR_SIZE + 100,
    height: FIRE_ALTAR_SIZE + 100,
    borderRadius: (FIRE_ALTAR_SIZE + 100) / 2,
    backgroundColor: 'transparent',
    shadowColor: FLAME_COLORS.outer,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 60,
  },
  embersContainer: {
    position: 'absolute',
    bottom: 40,
    width: 80,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flameLabel: {
    position: 'absolute',
    bottom: -10,
    fontSize: 13,
    color: 'rgba(255, 200, 150, 0.8)',
    fontWeight: '500',
  },

  // Ash Burst
  ashBurstContainer: {
    position: 'absolute',
    width: PAPER_WIDTH,
    height: PAPER_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Spark Burst
  sparkBurstContainer: {
    position: 'absolute',
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Burnable Paper
  burnablePaper: {
    width: PAPER_WIDTH,
    height: PAPER_HEIGHT,
    backgroundColor: PAPER_COLOR,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.1)',
    padding: SPACING.md,
    // Soft shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  paperTexture: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 8,
    overflow: 'hidden',
  },
  paperEdgeTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  paperEdgeBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
  paperContent: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.sm,
  },
  paperText: {
    fontSize: 18,
    lineHeight: 26,
    color: '#4A3728',
    textAlign: 'center',
    fontStyle: 'italic',
    // Calligraphy feel
    fontWeight: '400',
  },
  paperDragHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  paperDragHintText: {
    fontSize: 12,
    color: 'rgba(74, 55, 40, 0.7)',
    fontStyle: 'italic',
  },

  // Burning Paper
  burningPaperContainer: {
    width: PAPER_WIDTH,
    height: PAPER_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  burningPaper: {
    width: PAPER_WIDTH,
    height: PAPER_HEIGHT,
    borderRadius: 8,
    borderWidth: 3,
    padding: SPACING.md,
    overflow: 'hidden',
  },
  burnOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(50, 20, 10, 0.7)',
    borderRadius: 8,
  },
  burningPaperText: {
    fontSize: 18,
    lineHeight: 26,
    color: '#FFE4C4',
    textAlign: 'center',
    fontStyle: 'italic',
  },

  // Burn Completion Modal
  completionOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  completionGlowBg: {
    position: 'absolute',
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.5,
    backgroundColor: 'transparent',
    shadowColor: FLAME_COLORS.outer,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 100,
  },
  completionCard: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 100, 50, 0.3)',
  },
  completionGradient: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  completionIconWrap: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 100, 50, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  completionIconGlow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'transparent',
    shadowColor: FLAME_COLORS.outer,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 30,
  },
  completionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  completionSubtitle: {
    fontSize: 18,
    color: 'rgba(255, 200, 150, 0.9)',
    fontStyle: 'italic',
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  completionSparkles: {
    marginBottom: SPACING.lg,
  },
  completionActions: {
    width: '100%',
    gap: SPACING.md,
  },
  completionBtnPrimary: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  completionBtnGradient: {
    paddingVertical: 14,
    paddingHorizontal: SPACING.xl,
    alignItems: 'center',
  },
  completionBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  completionBtnSecondary: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  completionBtnSecondaryText: {
    fontSize: 14,
    color: 'rgba(255, 200, 150, 0.8)',
  },
});

// ========== COSMIC LETTER COMPONENT (Redesigned) ==========
// Beautiful letter with cosmic gradient, wax seal, shimmer effects
const LETTER_WIDTH = 280;
const LETTER_HEIGHT = 360;

// Wax Seal SVG Component
const WaxSeal = ({ size = 48 }) => (
  <Svg width={size} height={size} viewBox="0 0 48 48">
    <Defs>
      <RadialGradient id="sealGrad" cx="50%" cy="50%" r="50%">
        <Stop offset="0%" stopColor="#FFD700" stopOpacity="1" />
        <Stop offset="50%" stopColor="#B8860B" stopOpacity="1" />
        <Stop offset="100%" stopColor="#8B6914" stopOpacity="1" />
      </RadialGradient>
    </Defs>
    <Circle cx="24" cy="24" r="22" fill="url(#sealGrad)" />
    <Circle cx="24" cy="24" r="18" fill="none" stroke="#FFE55C" strokeWidth="1.5" opacity="0.6" />
    <G transform="translate(24, 24)">
      <Path d="M0,-10 L2,-3 L9,-3 L3,2 L5,9 L0,5 L-5,9 L-3,2 L-9,-3 L-2,-3 Z" fill="#FFE55C" opacity="0.9" />
    </G>
  </Svg>
);

// Orbiting Star Particle - WITH CLEANUP
const OrbitingStar = ({ delay = 0, radius = 160, duration = 8000 }) => {
  const rotation = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0.4)).current;
  const orbitLoopRef = useRef(null);
  const twinkleLoopRef = useRef(null);

  useEffect(() => {
    // Orbit animation
    orbitLoopRef.current = Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: duration,
        useNativeDriver: true,
      })
    );
    orbitLoopRef.current.start();

    // Twinkle animation
    twinkleLoopRef.current = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    twinkleLoopRef.current.start();

    return () => {
      if (orbitLoopRef.current) orbitLoopRef.current.stop();
      if (twinkleLoopRef.current) twinkleLoopRef.current.stop();
      rotation.stopAnimation();
      opacity.stopAnimation();
    };
  }, []); // Empty deps

  const translateX = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, Math.PI * 2],
  });

  return (
    <Animated.View
      style={{
        position: 'absolute',
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#FFD700',
        opacity,
        transform: [
          {
            translateX: rotation.interpolate({
              inputRange: [0, 0.25, 0.5, 0.75, 1],
              outputRange: [radius, 0, -radius, 0, radius],
            }),
          },
          {
            translateY: rotation.interpolate({
              inputRange: [0, 0.25, 0.5, 0.75, 1],
              outputRange: [0, -radius * 0.6, 0, radius * 0.6, 0],
            }),
          },
        ],
        shadowColor: '#FFD700',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 4,
      }}
    />
  );
};

// Shimmer Effect Component
const ShimmerEffect = ({ width, height }) => {
  const shimmerPosition = useRef(new Animated.Value(-width)).current;

  useEffect(() => {
    const animate = () => {
      shimmerPosition.setValue(-width);
      Animated.timing(shimmerPosition, {
        toValue: width * 2,
        duration: 6000,
        useNativeDriver: true,
      }).start(() => {
        setTimeout(animate, 1000); // Wait 1s before next shimmer
      });
    };

    const timer = setTimeout(animate, 2000); // Start after 2s
    return () => clearTimeout(timer);
  }, [shimmerPosition, width]);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: 60,
        height: height,
        backgroundColor: 'transparent',
        transform: [{ translateX: shimmerPosition }, { rotate: '-20deg' }],
        overflow: 'hidden',
      }}
      pointerEvents="none"
    >
      <LinearGradient
        colors={['transparent', 'rgba(255, 255, 255, 0.15)', 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ flex: 1, width: 60 }}
      />
    </Animated.View>
  );
};

// Draggable Letter/Paper Component - REDESIGNED
const DraggablePaper = ({
  content,
  isDragging,
  position,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.7)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const shadowAnim = useRef(new Animated.Value(15)).current;

  // Idle glow pulse animation (always running)
  useEffect(() => {
    const glowLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: false,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.7,
          duration: 1500,
          useNativeDriver: false,
        }),
      ])
    );
    glowLoop.start();
    return () => glowLoop.stop();
  }, [glowAnim]);

  // Drag state animations
  useEffect(() => {
    if (isDragging) {
      // Scale up + intensify glow + extend shadow
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1.12,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(shadowAnim, {
          toValue: 30,
          duration: 200,
          useNativeDriver: false,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(shadowAnim, {
          toValue: 15,
          duration: 200,
          useNativeDriver: false,
        }),
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isDragging, scaleAnim, shadowAnim, rotateAnim]);

  // Glow opacity interpolation
  const glowOpacity = glowAnim.interpolate({
    inputRange: [0.7, 1],
    outputRange: [0.5, 0.9],
  });

  return (
    <Animated.View
      style={[
        styles.cosmicLetter,
        {
          transform: [
            { translateX: position.x },
            { translateY: position.y },
            { scale: scaleAnim },
            { rotate: rotateAnim.interpolate({
              inputRange: [-1, 0, 1],
              outputRange: ['-5deg', '0deg', '5deg'],
            })},
          ],
        },
      ]}
    >
      {/* Outer Glow Aura - Multi-layer */}
      <Animated.View
        style={[
          styles.letterOuterGlow,
          {
            opacity: glowOpacity,
            shadowRadius: shadowAnim,
          },
        ]}
      />

      {/* Orbiting Stars (only when not dragging to save performance) */}
      {!isDragging && (
        <View style={styles.orbitingStarsContainer}>
          <OrbitingStar delay={0} radius={155} duration={10000} />
          <OrbitingStar delay={2500} radius={160} duration={12000} />
          <OrbitingStar delay={5000} radius={150} duration={9000} />
        </View>
      )}

      {/* Letter Frame with Gradient */}
      <LinearGradient
        colors={['#9C5BFF', '#4EDFE9', '#B96CFF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.letterGradient}
      >
        {/* Inner border glow */}
        <View style={styles.letterInnerBorder} />

        {/* Paper texture overlay (subtle) */}
        <View style={styles.paperTextureOverlay} />

        {/* Shimmer effect */}
        <ShimmerEffect width={LETTER_WIDTH} height={LETTER_HEIGHT} />

        {/* Wax Seal at top */}
        <View style={styles.waxSealContainer}>
          <WaxSeal size={52} />
        </View>

        {/* Letter Content */}
        <View style={styles.letterContentContainer}>
          <Text style={styles.letterContent} numberOfLines={8}>
            {content || 'Nguyện ước của bạn...'}
          </Text>
        </View>

        {/* Bottom decoration */}
        <View style={styles.letterDecoration}>
          <View style={styles.decorationLine} />
          <Sparkles size={14} color="rgba(255, 215, 0, 0.8)" />
          <View style={styles.decorationLine} />
        </View>

        {/* Drag hint (when not dragging) */}
        {!isDragging && (
          <View style={styles.letterDragHint}>
            <Text style={styles.letterDragHintText}>Kéo thư lên bầu trời</Text>
            <View style={styles.dragArrow}>
              <Svg width={20} height={20} viewBox="0 0 20 20">
                <Path
                  d="M10 15 L10 5 M5 9 L10 4 L15 9"
                  stroke="rgba(255,255,255,0.7)"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </View>
          </View>
        )}
      </LinearGradient>
    </Animated.View>
  );
};

// Target Zone Component (Sky/Fire/etc)
const TargetZone = React.memo(({ type, isActive, config }) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0.3)).current;
  const animationRef = useRef(null);

  useEffect(() => {
    // Stop previous animation
    if (animationRef.current) {
      animationRef.current.stop();
      animationRef.current = null;
    }

    if (isActive) {
      animationRef.current = Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(pulseAnim, {
              toValue: 1.2,
              duration: 800,
              useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
              toValue: 0.8,
              duration: 800,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 800,
              useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
              toValue: 0.4,
              duration: 800,
              useNativeDriver: true,
            }),
          ]),
        ])
      );
      animationRef.current.start();
    } else {
      pulseAnim.setValue(1);
      opacityAnim.setValue(0.3);
    }

    return () => {
      if (animationRef.current) {
        animationRef.current.stop();
      }
    };
  }, [isActive, pulseAnim, opacityAnim]);

  const renderTargetVisual = () => {
    switch (type) {
      case 'sky':
        return (
          <View style={styles.skyTarget}>
            <Animated.View
              style={[
                styles.skyGlow,
                {
                  opacity: opacityAnim,
                  transform: [{ scale: pulseAnim }],
                },
              ]}
            >
              <LinearGradient
                colors={['rgba(106, 91, 255, 0.4)', 'rgba(157, 78, 221, 0.2)', 'transparent']}
                style={styles.skyGlowGradient}
              />
            </Animated.View>
            <Moon size={40} color="#FFD700" />
            <Text style={styles.targetLabel}>Bầu trời vũ trụ</Text>
          </View>
        );

      case 'fire':
        // Sử dụng SacredFlame component thay vì icon đơn giản
        return (
          <SacredFlame isActive={isActive} isPeaceMode={false} />
        );

      case 'star':
        return (
          <View style={styles.starTarget}>
            <Animated.View
              style={[
                styles.starGlow,
                {
                  opacity: opacityAnim,
                  transform: [{ scale: pulseAnim }],
                },
              ]}
            >
              <LinearGradient
                colors={['rgba(78, 205, 196, 0.4)', 'rgba(68, 160, 141, 0.2)', 'transparent']}
                style={styles.starGlowGradient}
              />
            </Animated.View>
            <Star size={45} color="#4ECDC4" fill="#4ECDC4" />
            <Text style={styles.targetLabel}>Ngôi sao ước</Text>
          </View>
        );

      case 'wind':
        return (
          <View style={styles.windTarget}>
            <Animated.View
              style={[
                styles.windGlow,
                {
                  opacity: opacityAnim,
                  transform: [{ scale: pulseAnim }],
                },
              ]}
            >
              <LinearGradient
                colors={['rgba(102, 126, 234, 0.4)', 'rgba(118, 75, 162, 0.2)', 'transparent']}
                style={styles.windGlowGradient}
              />
            </Animated.View>
            <Wind size={45} color="#667EEA" />
            <Text style={styles.targetLabel}>Làn gió thanh lọc</Text>
          </View>
        );

      case 'heart':
        return (
          <View style={styles.heartTarget}>
            <Animated.View
              style={[
                styles.heartGlow,
                {
                  opacity: opacityAnim,
                  transform: [{ scale: pulseAnim }],
                },
              ]}
            >
              <LinearGradient
                colors={['rgba(240, 147, 251, 0.4)', 'rgba(245, 87, 108, 0.2)', 'transparent']}
                style={styles.heartGlowGradient}
              />
            </Animated.View>
            <Heart size={45} color="#F093FB" fill="#F093FB" />
            <Text style={styles.targetLabel}>Trái tim yêu thương</Text>
          </View>
        );

      case 'golden':
        return (
          <View style={styles.goldenTarget}>
            <Animated.View
              style={[
                styles.goldenGlow,
                {
                  opacity: opacityAnim,
                  transform: [{ scale: pulseAnim }],
                },
              ]}
            >
              <LinearGradient
                colors={['rgba(255, 215, 0, 0.4)', 'rgba(255, 165, 0, 0.2)', 'transparent']}
                style={styles.goldenGlowGradient}
              />
            </Animated.View>
            <Gift size={45} color="#FFD700" />
            <Text style={styles.targetLabel}>Phước lành vũ trụ</Text>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.targetZone}>
      {renderTargetVisual()}
    </View>
  );
});

// ========== STAR BURST EFFECT ==========
// Radial explosion particles when wish is sent - hiệu ứng pháo hoa khi hoàn thành
const StarBurstParticle = ({ angle, delay, color = '#FFD700', distance }) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const scale = useRef(new Animated.Value(1)).current;

  // Tính toán vị trí đích dựa trên góc và khoảng cách
  const targetX = Math.cos(angle * Math.PI / 180) * distance;
  const targetY = Math.sin(angle * Math.PI / 180) * distance;

  useEffect(() => {
    // Chạy animation ngay khi mount
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        // Di chuyển ra ngoài
        Animated.timing(translateX, {
          toValue: targetX,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: targetY,
          duration: 400,
          useNativeDriver: true,
        }),
        // Scale: phóng to rồi thu nhỏ
        Animated.sequence([
          Animated.timing(scale, {
            toValue: 1.5,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 0.3,
            duration: 250,
            useNativeDriver: true,
          }),
        ]),
        // Fade out
        Animated.timing(opacity, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: color,
        opacity,
        transform: [{ translateX }, { translateY }, { scale }],
        shadowColor: color,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 8,
        elevation: 5,
      }}
    />
  );
};

// Star Burst Container - tạo hiệu ứng pháo hoa radial
const StarBurst = ({ visible }) => {
  // Tạo particles một lần khi visible thay đổi
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (visible) {
      const count = 24; // Số lượng particles
      const colors = ['#FFD700', '#8B5CF6', '#FFFFFF', '#4EDFE9', '#FF6B9D', '#F97316'];
      const newParticles = [...Array(count)].map((_, i) => ({
        id: `${Date.now()}-${i}`, // Unique key để force re-render
        angle: (360 / count) * i + (Math.random() - 0.5) * 15,
        delay: Math.random() * 80,
        distance: 60 + Math.random() * 80, // 60-140px
        color: colors[Math.floor(Math.random() * colors.length)],
      }));
      setParticles(newParticles);
    } else {
      setParticles([]);
    }
  }, [visible]);

  if (!visible || particles.length === 0) return null;

  return (
    <View style={styles.starBurstContainer}>
      {particles.map((p) => (
        <StarBurstParticle
          key={p.id}
          angle={p.angle}
          delay={p.delay}
          distance={p.distance}
          color={p.color}
        />
      ))}
    </View>
  );
};

// Pulsing Star Icon for completion - WITH CLEANUP
const PulsingStar = () => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const pulseLoopRef = useRef(null);

  useEffect(() => {
    // Initial pop-in animation
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1.3,
        tension: 100,
        friction: 5,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse loop (3 times as per wireframe)
    pulseLoopRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: false,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.5,
          duration: 400,
          useNativeDriver: false,
        }),
      ]),
      { iterations: 3 }
    );
    pulseLoopRef.current.start();

    return () => {
      if (pulseLoopRef.current) pulseLoopRef.current.stop();
      scaleAnim.stopAnimation();
      glowAnim.stopAnimation();
    };
  }, []); // Empty deps

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0.5, 1],
    outputRange: [0.4, 0.9],
  });

  return (
    <Animated.View
      style={[
        styles.pulsingStarContainer,
        { transform: [{ scale: scaleAnim }] },
      ]}
    >
      <Animated.View
        style={[
          styles.pulsingStarGlow,
          { opacity: glowOpacity },
        ]}
      />
      <Star size={60} color="#FFD700" fill="#FFD700" />
    </Animated.View>
  );
};

// Completion Modal - REDESIGNED with star burst
const CompletionModal = ({ visible, message, onClose, accentColors }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const [showBurst, setShowBurst] = useState(false);

  useEffect(() => {
    if (visible) {
      setShowBurst(true);
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0);
      opacityAnim.setValue(0);
      setShowBurst(false);
    }
  }, [visible, scaleAnim, opacityAnim]);

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none">
      <View style={styles.completionOverlay}>
        {/* Star Burst Effect at center */}
        <View style={styles.burstPositioner}>
          <StarBurst visible={showBurst} />
        </View>

        <Animated.View
          style={[
            styles.completionModal,
            {
              opacity: opacityAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <LinearGradient
            colors={['#1A0A2E', '#2D1B4E', '#16082A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.completionGradient}
          >
            {/* Background sparkles */}
            <View style={styles.completionSparkles}>
              {[...Array(12)].map((_, i) => (
                <Particle
                  key={i}
                  delay={i * 150}
                  color={i % 2 === 0 ? '#FFD700' : '#8B5CF6'}
                  style={{
                    position: 'absolute',
                    left: 10 + Math.random() * 260,
                    top: 10 + Math.random() * 180,
                  }}
                />
              ))}
            </View>

            {/* Pulsing Star Icon */}
            <PulsingStar />

            {/* Message */}
            <Text style={styles.completionTitle}>Nguyện ước đã được gửi!</Text>
            <Text style={styles.completionMessage}>{message}</Text>

            {/* Wish saved indicator */}
            <View style={styles.wishSavedIndicator}>
              <Star size={14} color="#FFD700" fill="#FFD700" />
              <Text style={styles.wishSavedText}>
                Nguyện ước đã trở thành ngôi sao trên bầu trời
              </Text>
            </View>

            {/* Actions */}
            <View style={styles.completionActions}>
              <TouchableOpacity
                style={styles.completionActionBtn}
                onPress={onClose}
              >
                <LinearGradient
                  colors={['#9C5BFF', '#4EDFE9']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.completionActionGradient}
                >
                  <Text style={styles.completionActionText}>Tiếp tục</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
};

// Main Screen Component
const RitualPlaygroundScreen = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const ritual = route?.params?.ritual || {};
  const ritualId = ritual?.id || 'letter-to-universe';
  const config = RITUAL_CONFIGS[ritualId] || RITUAL_CONFIGS['letter-to-universe'];

  // States
  const [ritualText, setRitualText] = useState('');
  const [stage, setStage] = useState('input'); // input, dragging, animating, burning, completed
  const [isSoundOn, setIsSoundOn] = useState(true);
  const [showCompletion, setShowCompletion] = useState(false);
  const [isTargetActive, setIsTargetActive] = useState(false);
  const [sound, setSound] = useState(null);

  // Burn ritual specific states
  const isBurnRitual = ritualId === 'burn-release';
  const [showSparkBurst, setShowSparkBurst] = useState(false);
  const [showBurnCompletion, setShowBurnCompletion] = useState(false);
  const [isPeaceMode, setIsPeaceMode] = useState(false);
  const [isNearFlame, setIsNearFlame] = useState(false);

  // Animation refs
  const paperPosition = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const paperOpacity = useRef(new Animated.Value(1)).current;
  const transformScale = useRef(new Animated.Value(0)).current;
  const backgroundOpacity = useRef(new Animated.Value(0)).current;

  // Letter-to-Universe absorption animation refs
  const absorptionScale = useRef(new Animated.Value(1)).current;
  const absorptionRotate = useRef(new Animated.Value(0)).current;
  const absorptionY = useRef(new Animated.Value(0)).current;
  const starOpacity = useRef(new Animated.Value(0)).current;
  const [showParticleBurst, setShowParticleBurst] = useState(false);
  const [showAbsorbedStar, setShowAbsorbedStar] = useState(false);
  const isAbsorbingRef = useRef(false); // Use ref to prevent double trigger (avoid re-render loops)
  const absorptionAnimRef = useRef(null); // Track animation

  // Callback refs for PanResponder (avoid stale closures)
  const handleRitualCompleteRef = useRef(null);
  const isTargetActiveRef = useRef(false);
  const isNearFlameRef = useRef(false); // Track isNearFlame without causing re-renders

  // Pan responder for drag - using useMemo to recreate when needed
  const panResponder = React.useMemo(() => {
    return PanResponder.create({
      onStartShouldSetPanResponder: () => {
        // Always accept touch when in dragging stage
        return stage === 'dragging';
      },
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Accept movement if there's actual drag
        return stage === 'dragging' &&
               (Math.abs(gestureState.dx) > 2 || Math.abs(gestureState.dy) > 2);
      },
      onPanResponderGrant: () => {
        // Haptic feedback when starting drag
        Vibration.vibrate(10);
        // Reset position to current before starting new drag
        paperPosition.setOffset({
          x: paperPosition.x._value,
          y: paperPosition.y._value,
        });
        paperPosition.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event(
        [null, { dx: paperPosition.x, dy: paperPosition.y }],
        {
          useNativeDriver: false,
          listener: (_, gesture) => {
            // Check if near target zone (dragged up enough)
            const nearTarget = gesture.dy < -150;
            const approachingTarget = gesture.dy < -80;
            const inContactZone = gesture.dy < -180; // Contact zone for both rituals

            // TRIGGER ANIMATION IMMEDIATELY when entering contact zone
            if (inContactZone && !isAbsorbingRef.current) {
              isAbsorbingRef.current = true;
              // Flatten offset to get correct position values for animation
              paperPosition.flattenOffset();
              if (handleRitualCompleteRef.current) {
                handleRitualCompleteRef.current();
              }
              return; // Exit early, no need to continue tracking
            }

            // Update visual feedback states (only if not already animating)
            if (!isAbsorbingRef.current) {
              if (nearTarget !== isTargetActiveRef.current) {
                isTargetActiveRef.current = nearTarget;
                setIsTargetActive(nearTarget);
                if (nearTarget) {
                  Vibration.vibrate(5); // Light haptic when entering target zone
                }
              }

              // Burn ritual: update isNearFlame state for edge glow effect (only when changed)
              if (isBurnRitual && approachingTarget !== isNearFlameRef.current) {
                isNearFlameRef.current = approachingTarget;
                setIsNearFlame(approachingTarget);
              }
            }
          },
        }
      ),
      onPanResponderRelease: (_, gesture) => {
        // Flatten offset back to value
        paperPosition.flattenOffset();

        // Get total Y movement (current value includes offset)
        const totalDy = paperPosition.y._value;

        if (totalDy < -150) {
          // Successfully dropped in target zone
          if (handleRitualCompleteRef.current) {
            handleRitualCompleteRef.current();
          }
        } else {
          // Reset position with spring animation
          Animated.spring(paperPosition, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
            tension: 40,
            friction: 7,
          }).start();
        }
        isTargetActiveRef.current = false;
        setIsTargetActive(false);
      },
      onPanResponderTerminate: () => {
        // Reset if gesture is interrupted
        paperPosition.flattenOffset();
        Animated.spring(paperPosition, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: false,
        }).start();
        isTargetActiveRef.current = false;
        setIsTargetActive(false);
      },
    });
  }, [stage, paperPosition]);

  // Initialize background animation
  useEffect(() => {
    Animated.timing(backgroundOpacity, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [backgroundOpacity]);

  // Cleanup sound on unmount
  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  // Handle begin ritual
  const handleBeginRitual = () => {
    if (!ritualText.trim()) {
      return;
    }
    // Reset all animation states
    isAbsorbingRef.current = false;
    setShowParticleBurst(false);
    setShowAbsorbedStar(false);
    absorptionScale.setValue(1);
    absorptionRotate.setValue(0);
    absorptionY.setValue(0);
    paperOpacity.setValue(1);
    starOpacity.setValue(0);
    paperPosition.setValue({ x: 0, y: 0 });

    setStage('dragging');
    Vibration.vibrate(50);
  };

  // Handle ritual completion
  const handleRitualComplete = useCallback(() => {
    if (isBurnRitual) {
      // BURN RITUAL FLOW
      // 0.0s - Contact: Flash + Spark burst
      setStage('animating');
      setShowSparkBurst(true);
      Vibration.vibrate([0, 40, 50, 40]); // Contact haptic

      // Sau 300ms, bắt đầu burning phase
      setTimeout(() => {
        setShowSparkBurst(false);
        setStage('burning');
      }, 300);

    } else {
      // LETTER-TO-UNIVERSE ABSORPTION ANIMATION
      // Triggered IMMEDIATELY when letter enters sky zone
      setStage('animating');
      Vibration.vibrate([0, 30, 50, 30]);

      // Reset absorption animation values
      absorptionScale.setValue(1);
      absorptionRotate.setValue(0);
      absorptionY.setValue(0);
      paperOpacity.setValue(1);
      starOpacity.setValue(0);

      // PHASE 1: Letter shrinks + rotates + moves up + fades (0-350ms)
      // Scale: 1 → 0.8 → 0.4 → 0.1
      // Rotate: 0° → 7°
      // Note: Using useNativeDriver: false because paperPosition uses false
      const phase1 = Animated.parallel([
        Animated.timing(absorptionScale, {
          toValue: 0.1,
          duration: 350,
          useNativeDriver: false,
        }),
        Animated.timing(absorptionRotate, {
          toValue: 7,
          duration: 350,
          useNativeDriver: false,
        }),
        Animated.timing(absorptionY, {
          toValue: -80, // Move up slightly during absorption
          duration: 350,
          useNativeDriver: false,
        }),
        Animated.timing(paperOpacity, {
          toValue: 0,
          duration: 300,
          delay: 50, // Start fading slightly after scale begins
          useNativeDriver: false,
        }),
      ]);

      // Store animation ref for cleanup
      absorptionAnimRef.current = phase1;

      phase1.start(() => {
        // PHASE 2: Particle Burst + Star Appear (350-700ms)
        setShowParticleBurst(true);
        Vibration.vibrate(20); // Light haptic for star birth

        // After 350ms burst, show star
        setTimeout(() => {
          setShowParticleBurst(false);
          setShowAbsorbedStar(true);

          // Star twinkle animation
          Animated.timing(starOpacity, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            // PHASE 3: Show completion modal after 500ms
            setTimeout(() => {
              setStage('completed');
              setShowCompletion(true);
            }, 500);
          });
        }, 350);
      });
    }
  }, [isBurnRitual, paperOpacity, absorptionScale, absorptionRotate, absorptionY, starOpacity]);

  // Handle burn complete - sau khi giấy cháy hết
  const handleBurnComplete = useCallback(() => {
    setStage('completed');
    setIsPeaceMode(true); // Flame softens
    Vibration.vibrate(30); // Soft completion haptic

    // Hiện success message sau 500ms
    setTimeout(() => {
      setShowBurnCompletion(true);
    }, 500);
  }, []);

  // Handle close burn completion
  const handleCloseBurnCompletion = () => {
    setShowBurnCompletion(false);
    navigation.goBack();
  };

  // Keep handleRitualComplete ref updated for PanResponder
  useEffect(() => {
    handleRitualCompleteRef.current = handleRitualComplete;
  }, [handleRitualComplete]);

  // Handle close completion
  const handleCloseCompletion = () => {
    setShowCompletion(false);
    navigation.goBack();
  };

  // Toggle sound
  const toggleSound = () => {
    setIsSoundOn(!isSoundOn);
  };

  // Get ritual icon
  const RitualIcon = RITUAL_ICONS[config.icon] || Sparkles;

  // Generate background stars (memoized to prevent re-creation every render)
  const backgroundStars = React.useMemo(() => {
    return [...Array(30)].map((_, i) => ({
      id: i,
      size: 1 + Math.random() * 2,
      top: Math.random() * SCREEN_HEIGHT,
      left: Math.random() * SCREEN_WIDTH,
      delay: Math.random() * 2000,
    }));
  }, []); // Empty deps = only create once on mount

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Background */}
      <Animated.View style={[styles.backgroundContainer, { opacity: backgroundOpacity }]}>
        <LinearGradient
          colors={config.gradients.background}
          style={styles.backgroundGradient}
        >
          {/* Background stars */}
          {backgroundStars.map((star) => (
            <BackgroundStar
              key={star.id}
              size={star.size}
              top={star.top}
              left={star.left}
              delay={star.delay}
            />
          ))}
        </LinearGradient>
      </Animated.View>

      {/* Header */}
      <SafeAreaView edges={['top']} style={styles.header}>
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <RitualIcon size={20} color={config.gradients.accent[0]} />
          <Text style={styles.headerTitle}>{config.title}</Text>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerBtn} onPress={toggleSound}>
            {isSoundOn ? (
              <Volume2 size={22} color="#FFFFFF" />
            ) : (
              <VolumeX size={22} color="rgba(255,255,255,0.5)" />
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerBtn}>
            <MoreVertical size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Main Content */}
      <View style={styles.mainContent}>
        {/* Target Zone (top area) */}
        {stage !== 'input' && (
          <View style={styles.targetZoneContainer}>
            <TargetZone
              type={config.targetZone}
              isActive={isTargetActive}
              config={config}
            />
          </View>
        )}

        {/* Ritual Stage Area */}
        <View style={styles.ritualStage}>
          {/* Floating particles */}
          <View style={styles.particlesContainer}>
            {[...Array(6)].map((_, i) => (
              <Particle
                key={i}
                delay={i * 500}
                color={config.gradients.accent[0]}
                style={{
                  position: 'absolute',
                  left: 30 + (i % 3) * 100,
                  bottom: 50 + Math.floor(i / 3) * 100,
                }}
              />
            ))}
          </View>

          {/* ===== BURN RITUAL: Burnable Paper ===== */}
          {isBurnRitual && (stage === 'dragging') && (
            <Animated.View
              {...panResponder.panHandlers}
              style={[
                styles.draggablePaperContainer,
                {
                  transform: [
                    { translateX: paperPosition.x },
                    { translateY: paperPosition.y },
                  ],
                },
              ]}
            >
              <BurnablePaper
                content={ritualText}
                isDragging={stage === 'dragging'}
                isNearFlame={isNearFlame}
                position={{ x: 0, y: 0 }}
              />
            </Animated.View>
          )}

          {/* ===== BURN RITUAL: Spark Burst khi chạm lửa ===== */}
          {isBurnRitual && showSparkBurst && (
            <View style={styles.sparkBurstPositioner}>
              <SparkBurst visible={showSparkBurst} />
            </View>
          )}

          {/* ===== BURN RITUAL: Burning Paper Animation ===== */}
          {isBurnRitual && stage === 'burning' && (
            <View style={styles.burningPaperPositioner}>
              <BurningPaper
                content={ritualText}
                onBurnComplete={handleBurnComplete}
              />
            </View>
          )}

          {/* ===== DEFAULT RITUAL: Draggable Paper (when dragging) ===== */}
          {!isBurnRitual && stage === 'dragging' && (
            <Animated.View
              {...panResponder.panHandlers}
              style={[
                styles.draggablePaperContainer,
                {
                  opacity: 1,
                  transform: [
                    { translateX: paperPosition.x },
                    { translateY: paperPosition.y },
                  ],
                },
              ]}
            >
              <DraggablePaper
                content={ritualText}
                isDragging={true}
                position={{ x: 0, y: 0 }}
                accentColors={config.gradients.accent}
              />
            </Animated.View>
          )}

          {/* ===== DEFAULT RITUAL: Absorption Animation (when animating) ===== */}
          {/* Letter continues from dragged position, shrinks, rotates, moves up, fades */}
          {/* Note: Using useNativeDriver: false for Animated.add compatibility */}
          {!isBurnRitual && stage === 'animating' && !showAbsorbedStar && (
            <Animated.View
              style={[
                styles.draggablePaperContainer,
                {
                  opacity: paperOpacity,
                  transform: [
                    { translateX: paperPosition.x },
                    { translateY: Animated.add(paperPosition.y, absorptionY) }, // Combined: drag position + animation movement
                    { scale: absorptionScale },
                    {
                      rotate: absorptionRotate.interpolate({
                        inputRange: [0, 7],
                        outputRange: ['0deg', '7deg'],
                      }),
                    },
                  ],
                },
              ]}
            >
              <DraggablePaper
                content={ritualText}
                isDragging={false}
                position={{ x: 0, y: 0 }}
                accentColors={config.gradients.accent}
              />
            </Animated.View>
          )}

          {/* ===== DEFAULT RITUAL: Particle Burst Effect ===== */}
          {!isBurnRitual && showParticleBurst && (
            <View style={styles.burstPositioner}>
              <StarBurst visible={showParticleBurst} />
            </View>
          )}

          {/* ===== DEFAULT RITUAL: Absorbed Star (after paper disappears) ===== */}
          {!isBurnRitual && showAbsorbedStar && (
            <Animated.View
              style={[
                styles.burstPositioner,
                { opacity: starOpacity },
              ]}
            >
              <View style={styles.starGlowContainer}>
                <View style={styles.starGlow} />
                <Star size={60} color="#FFD700" fill="#FFD700" />
              </View>
            </Animated.View>
          )}
        </View>

        {/* Input Panel (when in input stage) */}
        {stage === 'input' && (
          <View style={styles.inputPanel}>
            {/* Ritual subtitle */}
            <Text style={styles.ritualSubtitle}>{config.subtitle}</Text>

            {/* Prompt */}
            <Text style={styles.inputPrompt}>{config.prompt}</Text>

            {/* Text input */}
            <View style={styles.textInputContainer}>
              <TextInput
                style={styles.textInput}
                placeholder="Viết ở đây..."
                placeholderTextColor="rgba(255,255,255,0.4)"
                multiline
                value={ritualText}
                onChangeText={setRitualText}
                textAlignVertical="top"
              />

              {/* Voice input button */}
              <TouchableOpacity style={styles.voiceInputBtn}>
                <Mic size={20} color="rgba(255,255,255,0.6)" />
              </TouchableOpacity>
            </View>

            {/* CTA Buttons */}
            <View style={styles.ctaContainer}>
              <TouchableOpacity
                style={[
                  styles.beginRitualBtn,
                  !ritualText.trim() && styles.beginRitualBtnDisabled,
                ]}
                onPress={handleBeginRitual}
                disabled={!ritualText.trim()}
              >
                <LinearGradient
                  colors={
                    ritualText.trim()
                      ? config.gradients.accent
                      : ['rgba(100,100,100,0.3)', 'rgba(100,100,100,0.2)']
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.beginRitualGradient}
                >
                  <Play size={20} color="#FFFFFF" />
                  <Text style={styles.beginRitualText}>Bắt đầu nghi thức</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Action hint (when dragging) */}
        {stage === 'dragging' && (
          <View style={styles.actionHint}>
            <Sparkles size={16} color="rgba(255,255,255,0.7)" />
            <Text style={styles.actionHintText}>{config.actionLabel}</Text>
          </View>
        )}
      </View>

      {/* Bottom Actions */}
      <SafeAreaView edges={['bottom']} style={styles.bottomBar}>
        <View style={styles.bottomActions}>
          <TouchableOpacity style={styles.bottomActionBtn}>
            <Volume2 size={18} color="rgba(255,255,255,0.6)" />
            <Text style={styles.bottomActionText}>Âm thanh</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.bottomActionBtn}>
            <BookOpen size={18} color="rgba(255,255,255,0.6)" />
            <Text style={styles.bottomActionText}>Hướng dẫn</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.bottomActionBtn}>
            <Clock size={18} color="rgba(255,255,255,0.6)" />
            <Text style={styles.bottomActionText}>Lịch sử</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Completion Modal - Default rituals */}
      {!isBurnRitual && (
        <CompletionModal
          visible={showCompletion}
          message={config.completionMessage}
          onClose={handleCloseCompletion}
          accentColors={config.gradients.accent}
        />
      )}

      {/* Burn Completion Modal - Burn ritual */}
      {isBurnRitual && (
        <BurnCompletionModal
          visible={showBurnCompletion}
          onClose={handleCloseBurnCompletion}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0221',
  },

  // Background
  backgroundContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  backgroundGradient: {
    flex: 1,
  },
  backgroundStar: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  headerBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: '#FFFFFF',
  },
  headerRight: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },

  // Main Content
  mainContent: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },

  // Target Zone
  targetZoneContainer: {
    alignItems: 'center',
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.lg,
  },
  targetZone: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  skyTarget: {
    alignItems: 'center',
  },
  skyGlow: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  skyGlowGradient: {
    flex: 1,
    borderRadius: 100,
  },
  fireTarget: {
    alignItems: 'center',
  },
  fireGlow: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  fireGlowGradient: {
    flex: 1,
    borderRadius: 100,
  },
  starTarget: {
    alignItems: 'center',
  },
  starGlow: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  starGlowGradient: {
    flex: 1,
    borderRadius: 100,
  },
  windTarget: {
    alignItems: 'center',
  },
  windGlow: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  windGlowGradient: {
    flex: 1,
    borderRadius: 100,
  },
  heartTarget: {
    alignItems: 'center',
  },
  heartGlow: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  heartGlowGradient: {
    flex: 1,
    borderRadius: 100,
  },
  goldenTarget: {
    alignItems: 'center',
  },
  goldenGlow: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  goldenGlowGradient: {
    flex: 1,
    borderRadius: 100,
  },
  targetLabel: {
    marginTop: SPACING.sm,
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
  },

  // Ritual Stage
  ritualStage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  particlesContainer: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: 'none',
  },
  particle: {
    width: 6,
    height: 6,
    borderRadius: 3,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },

  // Draggable Paper Container
  draggablePaperContainer: {
    position: 'absolute',
    zIndex: 100,
  },

  // ========== COSMIC LETTER STYLES ==========
  cosmicLetter: {
    width: LETTER_WIDTH,
    height: LETTER_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  letterOuterGlow: {
    position: 'absolute',
    width: LETTER_WIDTH + 60,
    height: LETTER_HEIGHT + 60,
    borderRadius: 50,
    backgroundColor: 'transparent',
    // Multi-color glow effect
    shadowColor: '#B56AFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 40,
    // Secondary glow layers achieved through overlapping
  },
  orbitingStarsContainer: {
    position: 'absolute',
    width: LETTER_WIDTH,
    height: LETTER_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  letterGradient: {
    width: LETTER_WIDTH,
    height: LETTER_HEIGHT,
    borderRadius: 28,
    padding: SPACING.lg,
    position: 'relative',
    overflow: 'hidden',
    // Soft border
    borderWidth: 2,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  letterInnerBorder: {
    position: 'absolute',
    top: 4,
    left: 4,
    right: 4,
    bottom: 4,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    pointerEvents: 'none',
  },
  paperTextureOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    opacity: 0.12,
    pointerEvents: 'none',
  },
  waxSealContainer: {
    alignItems: 'center',
    marginTop: -8,
    marginBottom: SPACING.md,
    // Drop shadow for seal
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  letterContentContainer: {
    flex: 1,
    paddingHorizontal: SPACING.sm,
    justifyContent: 'center',
  },
  letterContent: {
    fontSize: 18,
    color: '#FFFFFF',
    lineHeight: 28,
    textAlign: 'center',
    // Calligraphy/Handwriting style
    fontStyle: 'italic',
    fontWeight: '400',
    textShadowColor: 'rgba(255, 215, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  letterDecoration: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  decorationLine: {
    width: 40,
    height: 1,
    backgroundColor: 'rgba(255, 215, 0, 0.4)',
  },
  letterDragHint: {
    alignItems: 'center',
    marginTop: SPACING.md,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.15)',
  },
  letterDragHintText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
    fontStyle: 'italic',
    marginBottom: 4,
  },
  dragArrow: {
    opacity: 0.7,
  },

  // Legacy styles (kept for compatibility)
  draggablePaper: {
    width: 200,
    minHeight: 150,
    borderRadius: 16,
    overflow: 'hidden',
  },
  paperGradient: {
    padding: SPACING.md,
    minHeight: 150,
    position: 'relative',
  },
  paperGlow: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    borderRadius: 26,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 20,
  },
  paperContent: {
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 22,
    fontStyle: 'italic',
  },
  dragIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: SPACING.md,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  dragIndicatorText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },

  // Transform Animation
  transformAnimation: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  starGlowContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  starGlow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFD700',
    opacity: 0.3,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 40,
    elevation: 20,
  },

  // Input Panel
  inputPanel: {
    paddingBottom: SPACING.xl,
  },
  ritualSubtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginBottom: SPACING.lg,
    fontStyle: 'italic',
  },
  inputPrompt: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: SPACING.md,
    fontWeight: '500',
  },
  textInputContainer: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    minHeight: 150,
    position: 'relative',
  },
  textInput: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 24,
    minHeight: 120,
  },
  voiceInputBtn: {
    position: 'absolute',
    bottom: SPACING.sm,
    right: SPACING.sm,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // CTA
  ctaContainer: {
    gap: SPACING.md,
  },
  beginRitualBtn: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  beginRitualBtnDisabled: {
    opacity: 0.6,
  },
  beginRitualGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: 16,
    paddingHorizontal: SPACING.xl,
  },
  beginRitualText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // Action Hint
  actionHint: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  actionHintText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    fontStyle: 'italic',
  },

  // Bottom Bar
  bottomBar: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  bottomActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: SPACING.md,
  },
  bottomActionBtn: {
    alignItems: 'center',
    gap: 4,
  },
  bottomActionText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
  },

  // Completion Modal - REDESIGNED
  completionOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  burstPositioner: {
    position: 'absolute',
    top: '15%', // Position in sky zone area
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  starBurstContainer: {
    width: 300,
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sparkBurstPositioner: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 200,
  },
  burningPaperPositioner: {
    position: 'absolute',
    top: '45%',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 150,
  },
  completionModal: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(156, 91, 255, 0.3)',
  },
  completionGradient: {
    padding: SPACING.xl,
    paddingTop: SPACING.lg,
    alignItems: 'center',
    position: 'relative',
  },
  completionSparkles: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: 'none',
  },
  pulsingStarContainer: {
    marginBottom: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulsingStarGlow: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFD700',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 30,
  },
  completionIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  completionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFD700',
    marginBottom: SPACING.sm,
    textAlign: 'center',
    textShadowColor: 'rgba(255, 215, 0, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  completionMessage: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.md,
  },
  wishSavedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginBottom: SPACING.lg,
  },
  wishSavedText: {
    fontSize: 12,
    color: 'rgba(255, 215, 0, 0.9)',
    fontStyle: 'italic',
  },
  completionActions: {
    width: '100%',
  },
  completionActionBtn: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  completionActionGradient: {
    paddingVertical: 14,
    paddingHorizontal: SPACING.xl,
    alignItems: 'center',
  },
  completionActionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default RitualPlaygroundScreen;
