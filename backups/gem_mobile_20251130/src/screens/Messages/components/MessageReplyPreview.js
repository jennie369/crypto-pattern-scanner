/**
 * Gemral - Message Reply Preview Component
 * Shows reply context above the chat input
 *
 * Features:
 * - Shows replied message preview
 * - Dismiss button to cancel reply
 * - Slide-in animation
 * - Different styling for own vs other's messages
 */

import React, { useEffect, useRef, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
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

  // Get message preview content
  const getPreviewContent = () => {
    if (message?.attachment_url) {
      switch (message.message_type) {
        case 'image':
          return '📷 Photo';
        case 'video':
          return '🎥 Video';
        case 'voice':
          return '🎤 Voice message';
        case 'file':
          return '📎 File';
        default:
          return message.content || 'Attachment';
      }
    }
    return message?.content || '';
  };

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
      {/* Reply indicator bar */}
      <View style={[
        styles.indicatorBar,
        isOwnMessage ? styles.indicatorBarOwn : styles.indicatorBarOther,
      ]} />

      {/* Content */}
      <View style={styles.content}>
        {/* Reply icon and sender */}
        <View style={styles.header}>
          <Ionicons
            name="arrow-undo"
            size={14}
            color={isOwnMessage ? COLORS.purple : COLORS.cyan}
          />
          <Text style={[
            styles.senderName,
            isOwnMessage ? styles.senderNameOwn : styles.senderNameOther,
          ]}>
            {isOwnMessage ? 'You' : senderName || 'Unknown'}
          </Text>
        </View>

        {/* Message preview */}
        <Text style={styles.preview} numberOfLines={1}>
          {getPreviewContent()}
        </Text>
      </View>

      {/* Dismiss button */}
      <TouchableOpacity
        style={styles.dismissButton}
        onPress={handleDismiss}
        activeOpacity={0.7}
      >
        <Ionicons name="close" size={20} color={COLORS.textMuted} />
      </TouchableOpacity>
    </Animated.View>
  );
});

MessageReplyPreview.displayName = 'MessageReplyPreview';

export default MessageReplyPreview;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 16, 48, 0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(106, 91, 255, 0.2)',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },

  // Indicator bar (colored left border)
  indicatorBar: {
    width: 3,
    height: '100%',
    borderRadius: 2,
    marginRight: SPACING.sm,
  },
  indicatorBarOwn: {
    backgroundColor: COLORS.purple,
  },
  indicatorBarOther: {
    backgroundColor: COLORS.cyan,
  },

  // Content
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
    gap: SPACING.xs,
  },
  senderName: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  senderNameOwn: {
    color: COLORS.purple,
  },
  senderNameOther: {
    color: COLORS.cyan,
  },
  preview: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },

  // Dismiss button
  dismissButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: SPACING.sm,
  },
});
