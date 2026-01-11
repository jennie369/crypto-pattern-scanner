/**
 * Gemral - Message Reply Preview Component
 * Shows reply context above the chat input
 *
 * Features:
 * - Shows replied message preview
 * - Dismiss button to cancel reply
 * - Slide-in animation
 * - Media thumbnails for images/videos
 * - Icons for audio/file/sticker messages
 * - Gold accent bar design
 */

import React, { useEffect, useRef, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from '../../../utils/haptics';

// Tokens
import {
  COLORS,
  SPACING,
  TYPOGRAPHY,
} from '../../../utils/tokens';

const MessageReplyPreview = memo(({
  message,
  isOwnMessage,
  senderName,
  onDismiss,
}) => {
  const slideAnim = useRef(new Animated.Value(-60)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  // Animate in when mounted
  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 65,
        friction: 11,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  }, [slideAnim, opacityAnim]);

  // Handle dismiss with animation
  const handleDismiss = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -60,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss?.();
    });
  };

  // Get message preview content with icon/thumbnail info
  const getPreviewContent = () => {
    const messageType = message?.message_type || 'text';

    switch (messageType) {
      case 'image':
        return {
          text: message.caption || 'Photo',
          icon: 'image-outline',
          thumbnail: message.attachment_url,
        };
      case 'video':
        return {
          text: message.caption || 'Video',
          icon: 'videocam-outline',
          thumbnail: message.thumbnail_url || message.attachment_url,
        };
      case 'audio':
      case 'voice':
        return {
          text: 'Voice message',
          icon: 'mic-outline',
        };
      case 'file':
        return {
          text: message.attachment_name || 'File',
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
          text: message?.content || '',
          icon: null,
        };
    }
  };

  const preview = getPreviewContent();

  if (!message) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      {/* Gold accent bar */}
      <View style={styles.accentBar} />

      {/* Content */}
      <View style={styles.content}>
        {/* Header with sender name */}
        <Text style={styles.header}>
          Replying to{' '}
          <Text style={styles.senderName}>
            {isOwnMessage ? 'yourself' : senderName || 'User'}
          </Text>
        </Text>

        {/* Preview row with thumbnail/icon */}
        <View style={styles.previewRow}>
          {/* Thumbnail for media */}
          {preview.thumbnail && (
            <Image
              source={{ uri: preview.thumbnail }}
              style={styles.thumbnail}
              resizeMode="cover"
            />
          )}

          {/* Icon for non-text messages */}
          {preview.icon && !preview.thumbnail && (
            <View style={styles.iconContainer}>
              <Ionicons name={preview.icon} size={16} color={COLORS.gold} />
            </View>
          )}

          {/* Text preview */}
          <Text style={styles.preview} numberOfLines={1}>
            {preview.text}
          </Text>
        </View>
      </View>

      {/* Dismiss button */}
      <TouchableOpacity
        style={styles.dismissButton}
        onPress={handleDismiss}
        activeOpacity={0.7}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="close" size={22} color={COLORS.textMuted} />
      </TouchableOpacity>
    </Animated.View>
  );
});

MessageReplyPreview.displayName = 'MessageReplyPreview';

export default MessageReplyPreview;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: 'rgba(15, 16, 48, 0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(106, 91, 255, 0.3)',
    minHeight: 56,
  },

  // Gold accent bar
  accentBar: {
    width: 4,
    backgroundColor: COLORS.gold,
  },

  // Content
  content: {
    flex: 1,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    justifyContent: 'center',
  },
  header: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginBottom: 2,
  },
  senderName: {
    color: COLORS.gold,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  thumbnail: {
    width: 32,
    height: 32,
    borderRadius: 4,
    marginRight: SPACING.sm,
    backgroundColor: COLORS.glassBg,
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 4,
    backgroundColor: 'rgba(106, 91, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  preview: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textSecondary,
  },

  // Dismiss button
  dismissButton: {
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
