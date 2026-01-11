/**
 * ReactionDisplay Component
 * Displays grouped reactions below message bubble
 */

import React, { useCallback, memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { COLORS, SPACING, TYPOGRAPHY } from '../../utils/tokens';

/**
 * ReactionDisplay - Shows reactions grouped by emoji
 *
 * @param {Object} props
 * @param {Array} props.reactions - Grouped reactions [{emoji, count, hasOwn, users}]
 * @param {boolean} props.isOwn - Is this message from current user
 * @param {Function} props.onPress - Callback when reaction row is pressed (opens modal)
 * @param {Function} props.onLongPress - Callback when long-pressed (quick toggle)
 * @param {Function} props.onReactionPress - Callback when specific reaction is pressed
 */
const ReactionDisplay = memo(({
  reactions = [],
  isOwn = false,
  onPress,
  onLongPress,
  onReactionPress,
}) => {
  // ========== HANDLERS ==========
  const handlePress = useCallback(() => {
    Haptics.selectionAsync();
    onPress?.();
  }, [onPress]);

  const handleReactionPress = useCallback((emoji) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onReactionPress?.(emoji);
  }, [onReactionPress]);

  const handleLongPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onLongPress?.();
  }, [onLongPress]);

  // ========== RENDER ==========
  if (!reactions || reactions.length === 0) return null;

  return (
    <TouchableOpacity
      style={[
        styles.container,
        isOwn ? styles.containerOwn : styles.containerOther,
      ]}
      onPress={handlePress}
      onLongPress={handleLongPress}
      activeOpacity={0.7}
    >
      {reactions.map((reaction) => (
        <TouchableOpacity
          key={reaction.emoji}
          style={[
            styles.reactionChip,
            reaction.hasOwn && styles.reactionChipOwn,
          ]}
          onPress={() => handleReactionPress(reaction.emoji)}
          activeOpacity={0.8}
        >
          <Text style={styles.emoji}>{reaction.emoji}</Text>
          {reaction.count > 1 && (
            <Text style={[
              styles.count,
              reaction.hasOwn && styles.countOwn,
            ]}>
              {reaction.count > 99 ? '99+' : reaction.count}
            </Text>
          )}
        </TouchableOpacity>
      ))}
    </TouchableOpacity>
  );
});

ReactionDisplay.displayName = 'ReactionDisplay';

export default ReactionDisplay;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: -SPACING.xs,
    gap: SPACING.xxs,
  },
  containerOwn: {
    justifyContent: 'flex-end',
  },
  containerOther: {
    justifyContent: 'flex-start',
  },
  reactionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 16, 48, 0.9)',
    borderRadius: 12,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
  },
  reactionChipOwn: {
    borderColor: COLORS.gold,
    backgroundColor: 'rgba(255, 189, 89, 0.15)',
  },
  emoji: {
    fontSize: 14,
  },
  count: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginLeft: 3,
    fontWeight: '500',
  },
  countOwn: {
    color: COLORS.gold,
  },
});
