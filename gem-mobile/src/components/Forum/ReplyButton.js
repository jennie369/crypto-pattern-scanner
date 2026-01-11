/**
 * ReplyButton Component
 * Button to reply to a comment
 * Phase 3: Comment Threading (30/12/2024)
 */

import React, { memo } from 'react';
import { StyleSheet, Pressable, Text } from 'react-native';
import { MessageCircle } from 'lucide-react-native';
import { COLORS, SPACING } from '../../utils/tokens';

/**
 * ReplyButton - Triggers reply mode
 *
 * @param {Object} props
 * @param {Function} props.onPress - Press callback
 * @param {number} props.repliesCount - Number of replies (optional display)
 * @param {boolean} props.compact - Compact mode
 */
const ReplyButton = ({
  onPress,
  repliesCount,
  compact = false,
}) => {
  return (
    <Pressable
      style={[styles.container, compact && styles.containerCompact]}
      onPress={onPress}
      hitSlop={10}
    >
      <MessageCircle
        size={compact ? 14 : 16}
        color={COLORS.textMuted}
        strokeWidth={2}
      />
      <Text style={[styles.text, compact && styles.textCompact]}>
        Tra loi
      </Text>
      {repliesCount > 0 && !compact && (
        <Text style={styles.count}>{repliesCount}</Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
  },
  containerCompact: {
    paddingVertical: 2,
    paddingHorizontal: SPACING.xs,
  },
  text: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginLeft: 4,
    fontWeight: '500',
  },
  textCompact: {
    fontSize: 12,
  },
  count: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginLeft: 4,
  },
});

export default memo(ReplyButton);
