/**
 * PinnedConversationBadge Component
 * Badge indicator for pinned conversations
 *
 * Features:
 * - Pin icon with gold background
 * - Absolute positioned for overlay on conversation item
 */

import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../utils/tokens';

/**
 * PinnedConversationBadge - Badge hiển thị conversation đã pin
 */
const PinnedConversationBadge = memo(() => {
  return (
    <View style={styles.container}>
      <Ionicons name="pin" size={10} color={COLORS.gold} />
    </View>
  );
});

PinnedConversationBadge.displayName = 'PinnedConversationBadge';

export default PinnedConversationBadge;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 4,
    right: 4,
    padding: 4,
    backgroundColor: 'rgba(255, 189, 89, 0.2)',
    borderRadius: 8,
  },
});
