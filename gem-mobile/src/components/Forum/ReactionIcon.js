/**
 * ReactionIcon Component - OPTIMIZED VERSION
 * Renders a single reaction emoji
 *
 * Performance optimizations:
 * - Removed heavy reanimated animations
 * - Simple static rendering
 * - Minimal re-renders with memo
 */

import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { REACTION_CONFIG } from '../../constants/reactions';

/**
 * ReactionIcon - Simple emoji display
 *
 * @param {Object} props
 * @param {string} props.type - Reaction type (like, love, haha, wow, sad, angry)
 * @param {number} props.size - Icon size (default: 20)
 */
const ReactionIcon = ({
  type,
  size = 16,
  emojiSize = null,
}) => {
  const config = REACTION_CONFIG[type];

  if (!config) {
    return null;
  }

  // Calculate emoji font size (proportional to size)
  const fontSize = emojiSize || Math.round(size * 0.9);
  // Container needs padding ratio to prevent clipping (1.3x for safety)
  const containerSize = Math.round(size * 1.3);

  return (
    <View style={[styles.container, { width: containerSize, height: containerSize }]}>
      <Text style={[styles.emoji, { fontSize }]}>
        {config.emoji}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'visible',
  },
  emoji: {
    textAlign: 'center',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
});

export default memo(ReactionIcon);
