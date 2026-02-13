/**
 * Gemral - Typing Indicator Component
 * Animated dots showing AI is thinking
 */

import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { Sparkles } from 'lucide-react-native';
import { COLORS, SPACING, GLASS } from '../../../utils/tokens';

const TypingIndicator = () => {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animateDot = (dot, delay) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ])
      );
    };

    const animation1 = animateDot(dot1, 0);
    const animation2 = animateDot(dot2, 150);
    const animation3 = animateDot(dot3, 300);

    animation1.start();
    animation2.start();
    animation3.start();

    return () => {
      animation1.stop();
      animation2.stop();
      animation3.stop();
    };
  }, [dot1, dot2, dot3]);

  const getDotStyle = (animValue) => ({
    opacity: animValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 1],
    }),
    transform: [
      {
        translateY: animValue.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -4],
        }),
      },
    ],
  });

  return (
    <View style={styles.container}>
      {/* Avatar */}
      <View style={styles.avatar}>
        <Sparkles size={16} color={COLORS.gold} />
      </View>

      {/* Bubble with dots */}
      <View style={styles.bubble}>
        <View style={styles.dotsContainer}>
          <Animated.View style={[styles.dot, getDotStyle(dot1)]} />
          <Animated.View style={[styles.dot, getDotStyle(dot2)]} />
          <Animated.View style={[styles.dot, getDotStyle(dot3)]} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: GLASS.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: GLASS.borderWidth,
    borderColor: COLORS.purple,
  },
  bubble: {
    backgroundColor: GLASS.background,
    borderWidth: GLASS.borderWidth,
    borderColor: COLORS.inputBorder,
    borderRadius: GLASS.borderRadius,
    borderBottomLeftRadius: SPACING.xs,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  dot: {
    width: SPACING.sm,
    height: SPACING.sm,
    borderRadius: SPACING.xs,
    backgroundColor: COLORS.gold,
  },
});

export default TypingIndicator;
