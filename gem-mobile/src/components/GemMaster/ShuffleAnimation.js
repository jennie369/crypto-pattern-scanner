/**
 * ShuffleAnimation Component
 * Visual deck shuffling animation before card selection
 */

import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Image } from 'react-native';
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
import * as Haptics from 'expo-haptics';
import { COLORS, SPACING, TYPOGRAPHY } from '../../utils/tokens';
import { CARD_BACK } from '../../assets/tarot';

const NUM_CARDS = 7; // Number of cards in shuffle animation

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
  }, [cardAnimations, deckGlow, duration]);

  const completeShuffling = useCallback(() => {
    // Stop all animations and reset
    cancelAnimation(deckGlow);
    deckGlow.value = withTiming(0);

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
  }, [cardAnimations, deckGlow, onComplete]);

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
  const glowStyle = useAnimatedStyle(() => ({
    opacity: deckGlow.value,
    transform: [{ scale: interpolate(deckGlow.value, [0, 1], [1, 1.1]) }],
  }));

  const renderCard = (index) => {
    const card = cardAnimations[index];

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [
        { translateX: card.translateX.value },
        { translateY: card.translateY.value },
        { rotate: `${card.rotate.value}deg` },
        { scale: card.scale.value },
      ],
      zIndex: NUM_CARDS - index,
    }));

    return (
      <Animated.View
        key={index}
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
  };

  // ========== RENDER ==========
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handleTap}
      activeOpacity={1}
    >
      {/* Glow effect */}
      <Animated.View style={[styles.glow, glowStyle]} />

      {/* Card deck */}
      <View style={styles.deck}>
        {Array.from({ length: NUM_CARDS }, (_, index) => renderCard(index))}
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
    minHeight: 250,
  },
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
  },
  shuffleText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.gold,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
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
  },
});

export default ShuffleAnimation;
