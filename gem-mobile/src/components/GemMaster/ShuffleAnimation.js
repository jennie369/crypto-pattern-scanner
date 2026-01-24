/**
 * ShuffleAnimation Component
 * Visual deck shuffling animation before card selection
 */

import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Image, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  withRepeat,
  withDelay,
  interpolate,
  cancelAnimation,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { COLORS, SPACING, TYPOGRAPHY } from '../../utils/tokens';
import { CARD_BACK } from '../../assets/tarot';

const NUM_CARDS = 7; // Number of cards in shuffle animation
const NUM_PARTICLES = 8; // Number of floating particles
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ORB_SIZE = Math.min(SCREEN_WIDTH * 0.55, 220); // Responsive orb size

// ========== SEPARATE COMPONENTS FOR HOOKS COMPLIANCE ==========

/**
 * Particle Component - Properly uses hooks at component level
 */
const Particle = React.memo(({ particle, index }) => {
  const particleStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: particle.translateX.value },
      { translateY: particle.translateY.value },
      { scale: particle.scale.value },
    ],
    opacity: particle.opacity.value,
  }));

  return (
    <Animated.View style={[styles.particle, particleStyle]}>
      <LinearGradient
        colors={['#FFD700', '#FFBD59', 'transparent']}
        style={styles.particleGlow}
      />
    </Animated.View>
  );
});

/**
 * ShuffleCard Component - Properly uses hooks at component level
 */
const ShuffleCard = React.memo(({ card, index, totalCards }) => {
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: card.translateX.value },
      { translateY: card.translateY.value },
      { rotate: `${card.rotate.value}deg` },
      { scale: card.scale.value },
    ],
    zIndex: totalCards - index,
  }));

  return (
    <Animated.View
      style={[
        styles.card,
        animatedStyle,
        { marginLeft: index === 0 ? 0 : -60 },
      ]}
    >
      <Image
        source={CARD_BACK}
        style={styles.cardBackImage}
        resizeMode="cover"
      />
    </Animated.View>
  );
});

const ShuffleAnimation = ({
  onComplete,
  duration = 3000,
  autoStart = true,
  showTapHint = true,
}) => {
  const [isShuffling, setIsShuffling] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  // Animation values for each card
  const cardAnimations = Array.from({ length: NUM_CARDS }, () => ({
    translateX: useSharedValue(0),
    translateY: useSharedValue(0),
    rotate: useSharedValue(0),
    scale: useSharedValue(1),
  }));

  const deckGlow = useSharedValue(0);
  const orbPulse = useSharedValue(1);
  const orbRotate = useSharedValue(0);
  const innerGlow = useSharedValue(0);
  const ringExpand = useSharedValue(0);

  // Particle animations
  const particleAnimations = Array.from({ length: NUM_PARTICLES }, () => ({
    translateY: useSharedValue(0),
    translateX: useSharedValue(0),
    opacity: useSharedValue(0),
    scale: useSharedValue(0),
  }));

  // ========== ANIMATION FUNCTIONS ==========
  const setShufflingState = useCallback((value) => {
    setIsShuffling(value);
  }, []);

  const setCompleteState = useCallback((value) => {
    setIsComplete(value);
  }, []);

  const startShuffle = useCallback(() => {
    'worklet';
    runOnJS(setShufflingState)(true);
    runOnJS(setCompleteState)(false);

    // Haptic feedback
    runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium);

    // Animate deck glow
    deckGlow.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 500 }),
        withTiming(0.3, { duration: 500 })
      ),
      -1,
      true
    );

    // Orb pulse animation - breathing effect
    orbPulse.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 1200, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.95, { duration: 1200, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );

    // Orb slow rotation
    orbRotate.value = withRepeat(
      withTiming(360, { duration: 8000, easing: Easing.linear }),
      -1,
      false
    );

    // Inner glow pulsing
    innerGlow.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.4, { duration: 800, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Ring expansion animation
    ringExpand.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1500, easing: Easing.out(Easing.cubic) }),
        withTiming(0, { duration: 0 })
      ),
      -1,
      false
    );

    // Particle animations - floating up and fading
    particleAnimations.forEach((particle, index) => {
      const angle = (index / NUM_PARTICLES) * Math.PI * 2;
      const radius = ORB_SIZE * 0.35;
      const startX = Math.cos(angle) * radius;
      const startY = Math.sin(angle) * radius;
      const delay = index * 200;

      particle.translateX.value = startX;
      particle.translateY.value = withDelay(
        delay,
        withRepeat(
          withSequence(
            withTiming(startY - 60, { duration: 2000, easing: Easing.out(Easing.cubic) }),
            withTiming(startY, { duration: 0 })
          ),
          -1,
          false
        )
      );

      particle.opacity.value = withDelay(
        delay,
        withRepeat(
          withSequence(
            withTiming(0.8, { duration: 400 }),
            withTiming(0, { duration: 1600, easing: Easing.in(Easing.cubic) })
          ),
          -1,
          false
        )
      );

      particle.scale.value = withDelay(
        delay,
        withRepeat(
          withSequence(
            withTiming(1, { duration: 400 }),
            withTiming(0.3, { duration: 1600 })
          ),
          -1,
          false
        )
      );
    });

    // Shuffle animation for each card
    cardAnimations.forEach((card, index) => {
      const delay = index * 80;

      // Fan out animation
      card.translateX.value = withDelay(
        delay,
        withRepeat(
          withSequence(
            withTiming((index - 3) * 40, { duration: 300, easing: Easing.out(Easing.cubic) }),
            withTiming((3 - index) * 40, { duration: 300, easing: Easing.out(Easing.cubic) })
          ),
          Math.floor(duration / 600),
          false
        )
      );

      card.translateY.value = withDelay(
        delay,
        withRepeat(
          withSequence(
            withTiming(-20 - (index % 3) * 10, { duration: 250 }),
            withTiming(0, { duration: 250 })
          ),
          Math.floor(duration / 500),
          false
        )
      );

      card.rotate.value = withDelay(
        delay,
        withRepeat(
          withSequence(
            withTiming((index - 3) * 8, { duration: 300 }),
            withTiming((3 - index) * 8, { duration: 300 })
          ),
          Math.floor(duration / 600),
          false
        )
      );
    });
  }, [cardAnimations, deckGlow, duration, orbPulse, orbRotate, innerGlow, ringExpand, particleAnimations]);

  const completeShuffling = useCallback(() => {
    // Stop all animations and reset
    cancelAnimation(deckGlow);
    cancelAnimation(orbPulse);
    cancelAnimation(orbRotate);
    cancelAnimation(innerGlow);
    cancelAnimation(ringExpand);

    deckGlow.value = withTiming(0);
    orbPulse.value = withSpring(1);
    orbRotate.value = withTiming(0);
    innerGlow.value = withTiming(0);
    ringExpand.value = withTiming(0);

    // Stop particle animations
    particleAnimations.forEach((particle) => {
      cancelAnimation(particle.translateY);
      cancelAnimation(particle.opacity);
      cancelAnimation(particle.scale);
      particle.opacity.value = withTiming(0);
    });

    cardAnimations.forEach((card) => {
      cancelAnimation(card.translateX);
      cancelAnimation(card.translateY);
      cancelAnimation(card.rotate);

      card.translateX.value = withSpring(0, { damping: 15 });
      card.translateY.value = withSpring(0, { damping: 15 });
      card.rotate.value = withSpring(0, { damping: 15 });
    });

    // Haptic feedback
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    setIsShuffling(false);
    setIsComplete(true);

    // Notify parent
    if (onComplete) {
      setTimeout(onComplete, 300);
    }
  }, [cardAnimations, deckGlow, orbPulse, orbRotate, innerGlow, ringExpand, particleAnimations, onComplete]);

  const handleTap = useCallback(() => {
    if (isShuffling) {
      completeShuffling();
    } else if (!isComplete) {
      startShuffle();
    }
  }, [isShuffling, isComplete, completeShuffling, startShuffle]);

  // ========== EFFECTS ==========
  useEffect(() => {
    if (autoStart) {
      const timer = setTimeout(() => {
        startShuffle();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [autoStart, startShuffle]);

  // Auto-complete after duration
  useEffect(() => {
    if (isShuffling) {
      const timer = setTimeout(() => {
        completeShuffling();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isShuffling, duration, completeShuffling]);

  // ========== ANIMATED STYLES ==========
  // Main orb container - pulse and rotate
  const orbContainerStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: orbPulse.value },
      { rotate: `${orbRotate.value}deg` },
    ],
  }));

  // Inner glow effect
  const innerGlowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(innerGlow.value, [0, 1], [0.3, 0.8]),
    transform: [{ scale: interpolate(innerGlow.value, [0, 1], [0.8, 1.1]) }],
  }));

  // Expanding ring animation
  const ringStyle = useAnimatedStyle(() => ({
    opacity: interpolate(ringExpand.value, [0, 0.3, 1], [0.6, 0.3, 0]),
    transform: [{ scale: interpolate(ringExpand.value, [0, 1], [0.5, 1.8]) }],
  }));

  // Legacy glow style (keeping for fallback)
  const glowStyle = useAnimatedStyle(() => ({
    opacity: deckGlow.value,
    transform: [{ scale: interpolate(deckGlow.value, [0, 1], [1, 1.1]) }],
  }));


  // ========== RENDER ==========
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handleTap}
      activeOpacity={1}
    >
      {/* 3D Mystical Orb Effect */}
      <Animated.View style={[styles.orbContainer, orbContainerStyle]}>
        {/* Expanding Ring - outermost */}
        <Animated.View style={[styles.expandingRing, ringStyle]}>
          <LinearGradient
            colors={['transparent', 'rgba(106, 91, 255, 0.4)', 'transparent']}
            style={styles.ringGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
        </Animated.View>

        {/* Outer glow layer - soft purple */}
        <View style={styles.outerGlow}>
          <LinearGradient
            colors={['transparent', 'rgba(140, 100, 255, 0.15)', 'rgba(106, 91, 255, 0.3)', 'transparent']}
            style={styles.outerGlowGradient}
            locations={[0, 0.3, 0.6, 1]}
          />
        </View>

        {/* Middle glow layer - vibrant purple/magenta */}
        <View style={styles.middleGlow}>
          <LinearGradient
            colors={[
              'rgba(138, 43, 226, 0.1)',
              'rgba(148, 87, 235, 0.4)',
              'rgba(186, 85, 211, 0.6)',
              'rgba(138, 43, 226, 0.4)',
              'rgba(75, 0, 130, 0.2)',
            ]}
            style={styles.middleGlowGradient}
            locations={[0, 0.25, 0.5, 0.75, 1]}
          />
        </View>

        {/* Inner core - bright center with 3D effect */}
        <Animated.View style={[styles.innerCore, innerGlowStyle]}>
          <LinearGradient
            colors={[
              'rgba(255, 255, 255, 0.9)',
              'rgba(220, 180, 255, 0.8)',
              'rgba(180, 130, 255, 0.7)',
              'rgba(140, 80, 220, 0.6)',
            ]}
            style={styles.innerCoreGradient}
            locations={[0, 0.3, 0.6, 1]}
          />
        </Animated.View>

        {/* Highlight spot for 3D effect */}
        <View style={styles.highlightSpot}>
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.8)', 'transparent']}
            style={styles.highlightGradient}
            start={{ x: 0.3, y: 0 }}
            end={{ x: 0.7, y: 1 }}
          />
        </View>

        {/* Floating particles */}
        {isShuffling && particleAnimations.map((particle, index) => (
          <Particle key={`particle-${index}`} particle={particle} index={index} />
        ))}
      </Animated.View>

      {/* Card deck */}
      <View style={styles.deck}>
        {cardAnimations.map((card, index) => (
          <ShuffleCard key={index} card={card} index={index} totalCards={NUM_CARDS} />
        ))}
      </View>

      {/* Status text */}
      <View style={styles.textContainer}>
        {isShuffling && (
          <Text style={styles.shuffleText}>Đang xáo bài...</Text>
        )}
        {!isShuffling && !isComplete && showTapHint && (
          <Text style={styles.hintText}>Chạm để bắt đầu xáo bài</Text>
        )}
        {isComplete && (
          <Text style={styles.completeText}>Sẵn sàng rút bài</Text>
        )}
      </View>

      {/* Tap to stop hint */}
      {isShuffling && (
        <Text style={styles.stopHint}>Chạm để dừng khi bạn đã sẵn sàng</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl,
    minHeight: 300,
  },
  // 3D Orb styles
  orbContainer: {
    position: 'absolute',
    width: ORB_SIZE,
    height: ORB_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Expanding ring effect
  expandingRing: {
    position: 'absolute',
    width: ORB_SIZE * 1.2,
    height: ORB_SIZE * 1.2,
    borderRadius: ORB_SIZE * 0.6,
    borderWidth: 2,
    borderColor: 'rgba(106, 91, 255, 0.3)',
  },
  ringGradient: {
    width: '100%',
    height: '100%',
    borderRadius: ORB_SIZE * 0.6,
  },
  // Outer glow - largest, most subtle
  outerGlow: {
    position: 'absolute',
    width: ORB_SIZE,
    height: ORB_SIZE,
    borderRadius: ORB_SIZE / 2,
    overflow: 'hidden',
  },
  outerGlowGradient: {
    width: '100%',
    height: '100%',
    borderRadius: ORB_SIZE / 2,
  },
  // Middle glow - medium size, more vibrant
  middleGlow: {
    position: 'absolute',
    width: ORB_SIZE * 0.75,
    height: ORB_SIZE * 0.75,
    borderRadius: (ORB_SIZE * 0.75) / 2,
    overflow: 'hidden',
  },
  middleGlowGradient: {
    width: '100%',
    height: '100%',
    borderRadius: (ORB_SIZE * 0.75) / 2,
  },
  // Inner core - smallest, brightest
  innerCore: {
    position: 'absolute',
    width: ORB_SIZE * 0.45,
    height: ORB_SIZE * 0.45,
    borderRadius: (ORB_SIZE * 0.45) / 2,
    overflow: 'hidden',
  },
  innerCoreGradient: {
    width: '100%',
    height: '100%',
    borderRadius: (ORB_SIZE * 0.45) / 2,
  },
  // Highlight for 3D sphere effect
  highlightSpot: {
    position: 'absolute',
    top: ORB_SIZE * 0.15,
    left: ORB_SIZE * 0.25,
    width: ORB_SIZE * 0.2,
    height: ORB_SIZE * 0.12,
    borderRadius: ORB_SIZE * 0.1,
    overflow: 'hidden',
    transform: [{ rotate: '-20deg' }],
  },
  highlightGradient: {
    width: '100%',
    height: '100%',
  },
  // Floating particles
  particle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  particleGlow: {
    width: '100%',
    height: '100%',
    borderRadius: 4,
  },
  // Legacy glow (removed but keeping for reference)
  glow: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: COLORS.purpleGlow,
    opacity: 0,
  },
  deck: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 150,
    zIndex: 10,
  },
  card: {
    width: 80,
    height: 120,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: COLORS.gold,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  cardBackImage: {
    width: '100%',
    height: '100%',
    borderRadius: 6,
  },
  textContainer: {
    marginTop: SPACING.lg,
    alignItems: 'center',
    zIndex: 10,
  },
  shuffleText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.gold,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  hintText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textMuted,
  },
  completeText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.success,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  stopHint: {
    position: 'absolute',
    bottom: 0,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    zIndex: 10,
  },
});

export default ShuffleAnimation;
