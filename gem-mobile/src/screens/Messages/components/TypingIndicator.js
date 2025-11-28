/**
 * Gemral - Typing Indicator Component
 * Animated bouncing dots showing who is typing
 *
 * Features:
 * - Bouncing dots animation (loop with staggered delays)
 * - Display typing users names
 * - Glass-morphism styling
 */

import React, { useEffect, useRef, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
} from 'react-native';

// Tokens
import {
  COLORS,
  SPACING,
  TYPOGRAPHY,
} from '../../../utils/tokens';

const TypingIndicator = memo(({ users }) => {
  // Animation refs for bouncing dots
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  // Bouncing animation
  useEffect(() => {
    const createBounceAnimation = (dot, delay) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, {
            toValue: -6,
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

    const animation = Animated.parallel([
      createBounceAnimation(dot1, 0),
      createBounceAnimation(dot2, 150),
      createBounceAnimation(dot3, 300),
    ]);

    animation.start();

    return () => {
      animation.stop();
    };
  }, [dot1, dot2, dot3]);

  // Get typing users text
  const getTypingText = () => {
    if (!users || users.length === 0) return '';

    const names = users.map(u => u.display_name || 'Someone');

    if (names.length === 1) {
      return `${names[0]} is typing`;
    } else if (names.length === 2) {
      return `${names[0]} and ${names[1]} are typing`;
    } else {
      return `${names.length} people are typing`;
    }
  };

  if (!users || users.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Dots container */}
      <View style={styles.dotsContainer}>
        <Animated.View
          style={[
            styles.dot,
            { transform: [{ translateY: dot1 }] },
          ]}
        />
        <Animated.View
          style={[
            styles.dot,
            { transform: [{ translateY: dot2 }] },
          ]}
        />
        <Animated.View
          style={[
            styles.dot,
            { transform: [{ translateY: dot3 }] },
          ]}
        />
      </View>

      {/* Text */}
      <Text style={styles.text}>{getTypingText()}</Text>
    </View>
  );
});

TypingIndicator.displayName = 'TypingIndicator';

export default TypingIndicator;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginLeft: 40, // Align with messages (avatar width + margin)
  },

  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 16, 48, 0.7)',
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.textMuted,
    marginHorizontal: 2,
  },

  text: {
    marginLeft: SPACING.sm,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    fontStyle: 'italic',
  },
});
