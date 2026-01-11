/**
 * LoadMoreReplies Component
 * Button to load additional replies
 * Phase 3: Comment Threading (30/12/2024)
 */

import React, { memo, useState } from 'react';
import {
  StyleSheet,
  Pressable,
  Text,
  View,
  ActivityIndicator,
} from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import { COLORS, SPACING } from '../../utils/tokens';

/**
 * LoadMoreReplies - Load more button for replies
 *
 * @param {Object} props
 * @param {number} props.remaining - Number of remaining replies
 * @param {Function} props.onPress - Load more callback
 * @param {number} props.depth - Thread depth for styling
 */
const LoadMoreReplies = ({
  remaining,
  onPress,
  depth = 1,
}) => {
  const [loading, setLoading] = useState(false);

  const handlePress = async () => {
    if (loading) return;

    setLoading(true);
    try {
      await onPress?.();
    } finally {
      setLoading(false);
    }
  };

  const indent = depth * 48;

  if (remaining <= 0) return null;

  return (
    <Pressable
      style={[styles.container, { marginLeft: indent }]}
      onPress={handlePress}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator size="small" color={COLORS.gold} />
      ) : (
        <>
          <ChevronDown size={16} color={COLORS.gold} />
          <Text style={styles.text}>
            Xem them {remaining} tra loi
          </Text>
        </>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  text: {
    fontSize: 13,
    color: COLORS.gold,
    fontWeight: '500',
    marginLeft: 4,
  },
});

export default memo(LoadMoreReplies);
