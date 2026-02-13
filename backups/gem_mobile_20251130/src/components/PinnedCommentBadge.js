/**
 * Gemral - Pinned Comment Badge Component
 * Feature #11: Pin/Delete/Report Comments
 * Visual indicator for pinned comments
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Pin } from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '../utils/tokens';

const PinnedCommentBadge = ({ showLabel = true, size = 'normal' }) => {
  const isSmall = size === 'small';

  return (
    <View style={[styles.container, isSmall && styles.containerSmall]}>
      <Pin
        size={isSmall ? 10 : 12}
        color={COLORS.purple}
        style={styles.icon}
      />
      {showLabel && (
        <Text style={[styles.label, isSmall && styles.labelSmall]}>
          Ghim
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(106, 91, 255, 0.15)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 4,
  },
  containerSmall: {
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: 8,
  },
  icon: {
    transform: [{ rotate: '-45deg' }],
  },
  label: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.purple,
    textTransform: 'uppercase',
  },
  labelSmall: {
    fontSize: 8,
  },
});

export default PinnedCommentBadge;
