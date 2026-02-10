/**
 * ReplyQuotePreview Component
 * Animated preview bar when replying to a message
 *
 * Features:
 * - Animated slide-in from bottom
 * - Gold accent bar on left
 * - Sender name + content preview
 * - Media thumbnail for image/video
 * - Icon labels for non-text messages
 * - Close button to dismiss
 */

import React, { useEffect, useRef, memo, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSettings } from '../../contexts/SettingsContext';

/**
 * ReplyQuotePreview - Display preview bar when replying
 *
 * @param {Object} props
 * @param {Object} props.message - Message being replied to
 * @param {string} props.senderName - Name of original sender
 * @param {boolean} props.isOwnMessage - Is replying to own message
 * @param {Function} props.onDismiss - Callback to cancel reply
 */
const ReplyQuotePreview = memo(({
  message,
  senderName,
  isOwnMessage = false,
  onDismiss,
}) => {
  const { colors, gradients, glass, settings, SPACING, TYPOGRAPHY, t } = useSettings();

  // Animation
  const slideAnim = useRef(new Animated.Value(60)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  // ========== STYLES ==========
  const styles = useMemo(() => StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'stretch',
      backgroundColor: settings.theme === 'light' ? colors.bgDarkest : (glass.background || 'rgba(15, 16, 48, 0.95)'),
      borderTopWidth: 1,
      borderTopColor: 'rgba(106, 91, 255, 0.3)',
      minHeight: 56,
    },
    accentBar: {
      width: 4,
      backgroundColor: colors.gold,
    },
    content: {
      flex: 1,
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.sm,
      justifyContent: 'center',
    },
    header: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: colors.textMuted,
      marginBottom: 2,
    },
    headerName: {
      color: colors.gold,
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
      backgroundColor: colors.glassBg,
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
    previewText: {
      flex: 1,
      fontSize: TYPOGRAPHY.fontSize.base,
      color: colors.textSecondary,
    },
    closeButton: {
      width: 44,
      alignItems: 'center',
      justifyContent: 'center',
    },
  }), [colors, settings.theme, glass, SPACING, TYPOGRAPHY]);

  useEffect(() => {
    // Slide in animation
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 120,
        friction: 14,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Handle dismiss with animation
  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 60,
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

  // Determine message type and content
  const getMessagePreview = () => {
    if (!message) return { text: '', icon: null };

    const messageType = message.message_type || 'text';

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
          text: message.content || '',
          icon: null,
        };
    }
  };

  const preview = getMessagePreview();
  const displayName = isOwnMessage ? 'yourself' : (senderName || 'User');

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

      {/* Content area */}
      <View style={styles.content}>
        {/* Header */}
        <Text style={styles.header}>
          Replying to <Text style={styles.headerName}>{displayName}</Text>
        </Text>

        {/* Preview row */}
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
              <Ionicons name={preview.icon} size={18} color={colors.gold} />
            </View>
          )}

          {/* Text preview */}
          <Text style={styles.previewText} numberOfLines={1}>
            {preview.text}
          </Text>
        </View>
      </View>

      {/* Close button */}
      <TouchableOpacity
        style={styles.closeButton}
        onPress={handleDismiss}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="close" size={22} color={colors.textMuted} />
      </TouchableOpacity>
    </Animated.View>
  );
});

ReplyQuotePreview.displayName = 'ReplyQuotePreview';

export default ReplyQuotePreview;
