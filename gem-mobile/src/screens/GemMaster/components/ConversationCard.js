/**
 * Gemral - Conversation Card Component
 *
 * Displays a single conversation in the history list
 * Features: title, preview, date, message count, swipe-to-delete
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { MessageSquare, Trash2, Archive, Clock } from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, GLASS } from '../../../utils/tokens';
import { Swipeable } from 'react-native-gesture-handler';

/**
 * Format relative time
 * @param {string} dateString - ISO date string
 * @returns {string} - Formatted relative time
 */
const formatRelativeTime = (dateString) => {
  if (!dateString) return '';

  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Vừa xong';
  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays < 7) return `${diffDays} ngày trước`;

  // Show date for older items
  return date.toLocaleDateString('vi-VN', {
    day: 'numeric',
    month: 'short',
  });
};

const ConversationCard = ({
  conversation,
  onPress,
  onDelete,
  onArchive,
  isArchived = false,
}) => {
  const {
    id,
    title = 'Cuộc trò chuyện',
    preview = '',
    message_count = 0,
    last_message_at,
  } = conversation;

  // Render swipe actions (delete, archive)
  const renderRightActions = (progress, dragX) => {
    const scale = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    });

    return (
      <View style={styles.swipeActions}>
        {/* Archive/Unarchive Button */}
        <TouchableOpacity
          style={[styles.swipeButton, styles.archiveButton]}
          onPress={() => onArchive?.(id)}
          activeOpacity={0.8}
        >
          <Animated.View style={{ transform: [{ scale }] }}>
            <Archive size={20} color={COLORS.textPrimary} />
          </Animated.View>
        </TouchableOpacity>

        {/* Delete Button */}
        <TouchableOpacity
          style={[styles.swipeButton, styles.deleteButton]}
          onPress={() => onDelete?.(id)}
          activeOpacity={0.8}
        >
          <Animated.View style={{ transform: [{ scale }] }}>
            <Trash2 size={20} color="#FFFFFF" />
          </Animated.View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <Swipeable
      renderRightActions={renderRightActions}
      overshootRight={false}
      friction={2}
    >
      <TouchableOpacity
        style={styles.container}
        onPress={() => onPress?.(id)}
        activeOpacity={0.8}
      >
        {/* Icon */}
        <View style={styles.iconContainer}>
          <MessageSquare size={20} color={COLORS.gold} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Title Row */}
          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
            {isArchived && (
              <View style={styles.archivedBadge}>
                <Text style={styles.archivedText}>Archived</Text>
              </View>
            )}
          </View>

          {/* Preview */}
          {preview ? (
            <Text style={styles.preview} numberOfLines={2}>
              {preview}
            </Text>
          ) : null}

          {/* Meta Row */}
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Clock size={12} color={COLORS.textMuted} />
              <Text style={styles.metaText}>
                {formatRelativeTime(last_message_at)}
              </Text>
            </View>
            <Text style={styles.messageCount}>
              {message_count} tin nhắn
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </Swipeable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: GLASS.background,
    borderRadius: GLASS.borderRadius,
    borderWidth: GLASS.borderWidth,
    borderColor: 'rgba(106, 91, 255, 0.3)',
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    gap: SPACING.md,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 189, 89, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    gap: SPACING.xs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  title: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  archivedBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
  },
  archivedText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
  },
  preview: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textMuted,
    lineHeight: 18,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING.xs,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSubtle,
  },
  messageCount: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.gold,
  },

  // Swipe actions
  swipeActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  swipeButton: {
    width: 70,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  archiveButton: {
    backgroundColor: 'rgba(106, 91, 255, 0.8)',
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },
  deleteButton: {
    backgroundColor: '#FF6B6B',
    borderTopRightRadius: GLASS.borderRadius,
    borderBottomRightRadius: GLASS.borderRadius,
  },
});

export default ConversationCard;
