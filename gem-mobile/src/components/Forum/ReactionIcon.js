/**
 * ReactionIcon Component
 * Renders a single reaction emoji with optional animations
 *
 * Features:
 * - Emoji display with configurable size
 * - Hover scale animation
 * - Staggered entrance animation
 * - Fallback to text label if emoji fails
 */

import React, { memo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import {
  REACTION_CONFIG,
  REACTION_SIZES,
  REACTION_ANIMATIONS,
} from '../../constants/reactions';

/**
 * ReactionIcon - Individual reaction emoji with animations
 *
 * @param {Object} props
 * @param {string} props.type - Reaction type (like, love, haha, wow, sad, angry)
 * @param {number} props.size - Icon size (default: REACTION_SIZES.ICON_SIZE)
 * @param {boolean} props.isHovered - Whether icon is being hovered
 * @param {boolean} props.showAnimation - Trigger entrance animation
 * @param {number} props.index - Index for staggered animation
 * @param {boolean} props.selected - Whether this is the selected reaction
 * @param {Function} props.onLayout - Layout callback for position tracking
 */
const ReactionIcon = ({
  type,
  size = REACTION_SIZES.ICON_SIZE,
  isHovered = false,
  showAnimation = false,
  index = 0,
  selected = false,
  onLayout,
  emojiSize = null, // Optional: override emoji font size
}) => {
  const [useFallback, setUseFallback] = useState(false);

  // Get config for this reaction type
  const config = REACTION_CONFIG[type];

  if (!config) {
    console.warn(`[ReactionIcon] Unknown reaction type: ${type}`);
    return null;
  }

  // Calculate emoji font size based on icon size (90% of size for proper fit)
  // Or use emojiSize override if provided
  const fontSize = emojiSize || Math.round(size * 0.9);

  // Animated style for hover effect
  const hoverStyle = useAnimatedStyle(() => {
    const scale = withSpring(
      isHovered ? REACTION_ANIMATIONS.HOVER_SCALE : 1,
      {
        damping: 15,
        stiffness: 150,
      }
    );

    const translateY = withSpring(isHovered ? -8 : 0, {
      damping: 15,
      stiffness: 150,
    });

    return {
      transform: [{ scale }, { translateY }],
    };
  }, [isHovered]);

  // Animated style for staggered entrance
  const entranceStyle = useAnimatedStyle(() => {
    if (!showAnimation) {
      return {
        opacity: 1,
        transform: [{ translateY: 0 }, { scale: 1 }],
      };
    }

    const delay = index * REACTION_ANIMATIONS.STAGGER_DELAY;

    return {
      opacity: withDelay(delay, withTiming(1, { duration: 150 })),
      transform: [
        {
          translateY: withDelay(
            delay,
            withSpring(0, { damping: 15, stiffness: 150 })
          ),
        },
        {
          scale: withDelay(
            delay,
            withSpring(1, { damping: 15, stiffness: 150 })
          ),
        },
      ],
    };
  }, [showAnimation, index]);

  // Selection animation style
  const selectionStyle = useAnimatedStyle(() => {
    if (!selected) return {};

    return {
      transform: [
        {
          scale: withSequence(
            withTiming(0.8, { duration: 100 }),
            withSpring(1.2, { damping: 10 }),
            withSpring(1, { damping: 15 })
          ),
        },
      ],
    };
  }, [selected]);

  // Calculate container size to prevent emoji clipping
  // Container needs to be slightly larger than fontSize to prevent clipping on mobile
  const containerSize = Math.max(size, Math.round(fontSize * 1.15));

  return (
    <Animated.View
      style={[
        styles.container,
        { width: containerSize, height: containerSize },
        entranceStyle,
        hoverStyle,
        selectionStyle,
      ]}
      onLayout={onLayout}
    >
      {useFallback ? (
        // Fallback: Show label text
        <View
          style={[
            styles.fallbackContainer,
            { backgroundColor: config.color + '33' },
          ]}
        >
          <Text
            style={[
              styles.fallbackText,
              { color: config.color, fontSize: fontSize * 0.4 },
            ]}
          >
            {config.label}
          </Text>
        </View>
      ) : (
        // Normal: Show emoji
        <Text
          style={[styles.emoji, { fontSize }]}
          onError={() => setUseFallback(true)}
        >
          {config.emoji}
        </Text>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    textAlign: 'center',
  },
  fallbackContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 100,
    width: '100%',
    height: '100%',
  },
  fallbackText: {
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default memo(ReactionIcon);
