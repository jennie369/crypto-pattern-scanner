/**
 * QuotedMessageBubble Component
 * Compact display of original message in a reply
 *
 * Features:
 * - Compact quote with gold accent bar
 * - Sender name highlighted
 * - Truncated content preview
 * - Icons for media types
 * - Thumbnail for images/videos
 * - Tap to scroll to original message
 */

import React, { memo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, TYPOGRAPHY } from '../../utils/tokens';

/**
 * QuotedMessageBubble - Inline quote of original message
 *
 * @param {Object} props
 * @param {Object} props.originalMessage - The message being quoted
 * @param {boolean} props.isOwnReply - Is this reply from current user
 * @param {Function} props.onPress - Callback when quote is tapped (scroll to original)
 */
const QuotedMessageBubble = memo(({
  originalMessage,
  isOwnReply = false,
  onPress,
}) => {
  // Handle deleted message
  if (!originalMessage) {
    return (
      <TouchableOpacity
        style={styles.container}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={styles.accentBar} />
        <View style={styles.content}>
          <Text style={styles.deletedText}>Message deleted</Text>
        </View>
      </TouchableOpacity>
    );
  }

  // Get sender info
  const senderName = originalMessage.users?.display_name || 'User';
  const messageType = originalMessage.message_type || 'text';

  // Determine content to display
  const getQuoteContent = useCallback(() => {
    switch (messageType) {
      case 'image':
        return {
          text: originalMessage.caption || 'Photo',
          icon: 'image-outline',
          thumbnail: originalMessage.attachment_url,
        };
      case 'video':
        return {
          text: originalMessage.caption || 'Video',
          icon: 'videocam-outline',
          thumbnail: originalMessage.thumbnail_url,
        };
      case 'audio':
        const duration = originalMessage.attachment_duration;
        const durationText = duration
          ? `${Math.floor(duration / 60)}:${String(Math.floor(duration % 60)).padStart(2, '0')}`
          : '';
        return {
          text: `Voice message ${durationText}`.trim(),
          icon: 'mic-outline',
        };
      case 'file':
        return {
          text: originalMessage.attachment_name || 'File',
          icon: 'document-outline',
        };
      case 'sticker':
        return {
          text: 'Sticker',
          icon: 'happy-outline',
        };
      case 'gif':
        return {
          text: 'GIF',
          icon: 'images-outline',
        };
      default:
        return {
          text: originalMessage.content || '',
          icon: null,
        };
    }
  }, [messageType, originalMessage]);

  const quoteContent = getQuoteContent();

  return (
    <TouchableOpacity
      style={[styles.container, isOwnReply && styles.containerOwn]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Gold accent bar */}
      <View style={styles.accentBar} />

      {/* Main content */}
      <View style={styles.content}>
        {/* Sender name */}
        <Text style={styles.senderName} numberOfLines={1}>
          {senderName}
        </Text>

        {/* Content row */}
        <View style={styles.contentRow}>
          {/* Thumbnail for media */}
          {quoteContent.thumbnail && (
            <Image
              source={{ uri: quoteContent.thumbnail }}
              style={styles.thumbnail}
              resizeMode="cover"
            />
          )}

          {/* Icon for non-text messages */}
          {quoteContent.icon && !quoteContent.thumbnail && (
            <Ionicons
              name={quoteContent.icon}
              size={14}
              color={COLORS.textMuted}
              style={styles.icon}
            />
          )}

          {/* Text content */}
          <Text style={styles.quoteText} numberOfLines={1}>
            {quoteContent.text}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
});

QuotedMessageBubble.displayName = 'QuotedMessageBubble';

export default QuotedMessageBubble;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    overflow: 'hidden',
    minHeight: 44,
  },
  containerOwn: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  accentBar: {
    width: 3,
    backgroundColor: COLORS.gold,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    justifyContent: 'center',
  },
  senderName: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.gold,
    marginBottom: 2,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  thumbnail: {
    width: 28,
    height: 28,
    borderRadius: 4,
    marginRight: SPACING.xs,
    backgroundColor: COLORS.glassBg,
  },
  icon: {
    marginRight: SPACING.xs,
  },
  quoteText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
  deletedText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    fontStyle: 'italic',
  },
});
