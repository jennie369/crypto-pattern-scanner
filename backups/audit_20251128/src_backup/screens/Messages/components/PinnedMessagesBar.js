/**
 * Gemral - Pinned Messages Bar Component
 * Shows pinned messages at top of chat
 *
 * Features:
 * - Tap to scroll to pinned message
 * - Swipe horizontally for multiple pins
 * - Pin count indicator
 * - Expandable preview
 */

import React, { useRef, memo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from '../../../utils/haptics';

// Tokens
import {
  COLORS,
  SPACING,
  TYPOGRAPHY,
} from '../../../utils/tokens';

const PinnedMessagesBar = memo(({
  pinnedMessages = [],
  currentIndex = 0,
  onPress,
  onViewAll,
  onUnpin,
}) => {
  const scrollViewRef = useRef(null);

  // Handle pin press
  const handlePress = useCallback((message, index) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.(message, index);
  }, [onPress]);

  // Handle view all
  const handleViewAll = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onViewAll?.();
  }, [onViewAll]);

  if (!pinnedMessages || pinnedMessages.length === 0) {
    return null;
  }

  const currentMessage = pinnedMessages[currentIndex] || pinnedMessages[0];

  return (
    <View style={styles.container}>
      {/* Pin Icon */}
      <View style={styles.iconContainer}>
        <Ionicons name="pin" size={16} color={COLORS.gold} />
      </View>

      {/* Message Preview */}
      <TouchableOpacity
        style={styles.content}
        onPress={() => handlePress(currentMessage, currentIndex)}
        activeOpacity={0.7}
      >
        <View style={styles.header}>
          <Text style={styles.label}>Pinned Message</Text>
          {pinnedMessages.length > 1 && (
            <Text style={styles.counter}>
              {currentIndex + 1} of {pinnedMessages.length}
            </Text>
          )}
        </View>
        <Text style={styles.preview} numberOfLines={1}>
          {currentMessage.content || 'Media message'}
        </Text>
      </TouchableOpacity>

      {/* Actions */}
      <View style={styles.actions}>
        {pinnedMessages.length > 1 && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleViewAll}
            activeOpacity={0.7}
          >
            <Ionicons name="list" size={18} color={COLORS.textSecondary} />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onUnpin?.(currentMessage.id)}
          activeOpacity={0.7}
        >
          <Ionicons name="close" size={18} color={COLORS.textMuted} />
        </TouchableOpacity>
      </View>
    </View>
  );
});

PinnedMessagesBar.displayName = 'PinnedMessagesBar';

export default PinnedMessagesBar;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 16, 48, 0.95)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 189, 89, 0.2)',
  },

  // Icon
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 189, 89, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },

  // Content
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  label: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.gold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  counter: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    marginLeft: SPACING.sm,
  },
  preview: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  },

  // Actions
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  actionButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
