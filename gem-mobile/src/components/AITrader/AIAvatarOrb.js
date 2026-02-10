/**
 * AIAvatarOrb - Animated AI avatar orb with mood states
 * Used in Paper Trade flow and AI Sư Phụ interactions
 */

import React, { useEffect, useRef, useMemo } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Bot, Brain, Shield, Sparkles } from 'lucide-react-native';
import { useSettings } from '../../contexts/SettingsContext';
import { BORDER_RADIUS } from '../../utils/tokens';
import { AI_MOODS } from '../../services/gemMasterAIService';

const AIAvatarOrb = ({
  mood = 'calm',
  size = 'medium',
  isAnimating = true,
  onPress,
  pulseOnChange = true,
  showGlow = true,
  style,
}) => {
  const { colors, gradients, glass, settings, SPACING, TYPOGRAPHY, t } = useSettings();

  // Animation values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.3)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  // Size configurations
  const sizes = {
    small: { container: 40, icon: 20, glow: 50 },
    medium: { container: 60, icon: 28, glow: 80 },
    large: { container: 80, icon: 36, glow: 110 },
  };

  const sizeConfig = sizes[size] || sizes.medium;
  const moodConfig = AI_MOODS[mood] || AI_MOODS.calm;

  // Get mood-based colors
  const getMoodColors = () => {
    switch (mood) {
      case 'calm':
        return ['#00D9FF', '#6A5BFF'];
      case 'warning':
        return ['#FF6B6B', '#FF8C42'];
      case 'angry':
        return ['#DC2626', '#7F1D1D'];
      case 'proud':
        return ['#FFD700', '#FFA500'];
      case 'silent':
        return ['#4A4A4A', '#2D2D2D'];
      default:
        return ['#00D9FF', '#6A5BFF'];
    }
  };

  // Get icon based on mood
  const getIcon = () => {
    const iconProps = {
      size: sizeConfig.icon,
      color: colors.textPrimary,
      strokeWidth: 2,
    };

    switch (mood) {
      case 'angry':
        return <Shield {...iconProps} />;
      case 'proud':
        return <Sparkles {...iconProps} />;
      case 'warning':
        return <Brain {...iconProps} />;
      default:
        return <Bot {...iconProps} />;
    }
  };

  // Pulse animation
  useEffect(() => {
    if (!isAnimating) return;

    const animation = moodConfig.animation;
    let animationSequence;

    if (animation === 'pulse_slow') {
      animationSequence = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
    } else if (animation === 'pulse_fast') {
      animationSequence = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
    } else if (animation === 'shake') {
      animationSequence = Animated.loop(
        Animated.sequence([
          Animated.timing(shakeAnim, {
            toValue: 5,
            duration: 50,
            useNativeDriver: true,
          }),
          Animated.timing(shakeAnim, {
            toValue: -5,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(shakeAnim, {
            toValue: 5,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(shakeAnim, {
            toValue: 0,
            duration: 50,
            useNativeDriver: true,
          }),
          Animated.delay(1000),
        ])
      );
    } else if (animation === 'glow') {
      animationSequence = Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 0.8,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0.3,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
    } else if (animation === 'fade') {
      animationSequence = Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 0.5,
            duration: 3000,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0.2,
            duration: 3000,
            useNativeDriver: true,
          }),
        ])
      );
    }

    if (animationSequence) {
      animationSequence.start();
    }

    return () => {
      animationSequence?.stop();
      pulseAnim.setValue(1);
      glowAnim.setValue(0.3);
      shakeAnim.setValue(0);
    };
  }, [mood, isAnimating]);

  // Pulse on mood change
  useEffect(() => {
    if (pulseOnChange) {
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.3,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(pulseAnim, {
          toValue: 1,
          friction: 4,
          tension: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [mood]);

  const moodColors = getMoodColors();

  const Container = onPress ? TouchableOpacity : View;

  const styles = useMemo(() => StyleSheet.create({
    wrapper: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    glowOuter: {
      position: 'absolute',
    },
    orbContainer: {
      shadowColor: '#6A5BFF',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 12,
      elevation: 8,
    },
    gradient: {
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    },
    innerGlow: {
      position: 'absolute',
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
      top: '10%',
    },
    iconContainer: {
      alignItems: 'center',
      justifyContent: 'center',
    },
  }), [colors, settings.theme, glass, SPACING, TYPOGRAPHY]);

  return (
    <Container
      onPress={onPress}
      activeOpacity={0.8}
      style={[styles.wrapper, style]}
    >
      {/* Outer glow */}
      {showGlow && (
        <Animated.View
          style={[
            styles.glowOuter,
            {
              width: sizeConfig.glow,
              height: sizeConfig.glow,
              borderRadius: sizeConfig.glow / 2,
              backgroundColor: moodConfig.color,
              opacity: glowAnim,
              transform: [{ scale: pulseAnim }],
            },
          ]}
        />
      )}

      {/* Main orb */}
      <Animated.View
        style={[
          styles.orbContainer,
          {
            width: sizeConfig.container,
            height: sizeConfig.container,
            borderRadius: sizeConfig.container / 2,
            transform: [
              { scale: pulseAnim },
              { translateX: shakeAnim },
            ],
          },
        ]}
      >
        <LinearGradient
          colors={moodColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.gradient,
            {
              width: sizeConfig.container,
              height: sizeConfig.container,
              borderRadius: sizeConfig.container / 2,
            },
          ]}
        >
          {/* Inner glow */}
          <View
            style={[
              styles.innerGlow,
              {
                width: sizeConfig.container * 0.6,
                height: sizeConfig.container * 0.6,
                borderRadius: sizeConfig.container * 0.3,
              },
            ]}
          />

          {/* Icon */}
          <View style={styles.iconContainer}>
            {getIcon()}
          </View>
        </LinearGradient>
      </Animated.View>
    </Container>
  );
};

export default AIAvatarOrb;
