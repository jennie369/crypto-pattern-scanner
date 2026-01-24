/**
 * Gemral - Conversation Item Component
 * Individual conversation item with TikTok-style glass UI
 *
 * Features:
 * - Avatar with online indicator
 * - Unread count badge
 * - Last message preview
 * - Swipe actions (archive, delete)
 * - Animated entrance
 */

import React, { useRef, useEffect, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

// Components
import OnlineIndicator from './OnlineIndicator';
import PinnedConversationBadge from '../../../components/Messages/PinnedConversationBadge';

// Services
import presenceService from '../../../services/presenceService';

// Tokens
import {
  COLORS,
  GRADIENTS,
  SPACING,
  TYPOGRAPHY,
  TOUCH,
} from '../../../utils/tokens';

const ConversationItem = memo(({ conversation, currentUserId, onPress, index, isPinned }) => {
  // Get other participant info
  const otherParticipant = conversation.other_participant ||
    conversation.conversation_participants?.find(p => p.user_id !== currentUserId)?.profiles;

  const isGroup = conversation.is_group;
  const displayName = isGroup
    ? conversation.name
    : otherParticipant?.display_name || 'Unknown User';
  const avatarUrl = isGroup
    ? null
    : otherParticipant?.avatar_url;
  const onlineStatus = otherParticipant?.online_status;
  const isOnline = presenceService.isOnline(onlineStatus);

  // Unread count
  const unreadCount = conversation.my_unread_count || 0;

  // Latest message
  const latestMessage = conversation.latest_message;
  const messagePreview = latestMessage?.content || 'No messages yet';
  const isOwnMessage = latestMessage?.sender_id === currentUserId;

  // Time formatting
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Animated entrance
  const translateY = useRef(new Animated.Value(30)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const delay = index * 50; // Stagger animation
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [index, translateY, opacity]);

  // Get initials for avatar fallback
  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name[0].toUpperCase();
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <TouchableOpacity
        style={[styles.touchable, isPinned && styles.touchablePinned]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {/* Pinned Badge */}
        {isPinned && <PinnedConversationBadge />}

        {/* Avatar Section */}
        <View style={styles.avatarContainer}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatar} />
          ) : (
            <LinearGradient
              colors={isGroup ? [COLORS.purple, COLORS.cyan] : GRADIENTS.avatar}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.avatarFallback}
            >
              {isGroup ? (
                <Ionicons name="people" size={20} color={COLORS.textPrimary} />
              ) : (
                <Text style={styles.avatarInitials}>{getInitials(displayName)}</Text>
              )}
            </LinearGradient>
          )}

          {/* Online Indicator */}
          {!isGroup && isOnline && (
            <OnlineIndicator size="md" style={styles.onlineIndicator} />
          )}
        </View>

        {/* Content Section */}
        <View style={styles.content}>
          {/* Name Row */}
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>
              {displayName}
            </Text>
            <Text style={[styles.time, unreadCount > 0 && styles.timeUnread]}>
              {formatTime(latestMessage?.created_at)}
            </Text>
          </View>

          {/* Message Row */}
          <View style={styles.messageRow}>
            <Text
              style={[styles.message, unreadCount > 0 && styles.messageUnread]}
              numberOfLines={1}
            >
              {isOwnMessage && 'You: '}
              {messagePreview}
            </Text>

            {/* Unread Badge */}
            {unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
});

ConversationItem.displayName = 'ConversationItem';

export default ConversationItem;

const styles = StyleSheet.create({
  container: {
    // Facebook-style borderless - no margin horizontal
  },
  touchable: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    // Borderless - only bottom separator
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    position: 'relative',
  },
  touchablePinned: {
    backgroundColor: 'rgba(255, 189, 89, 0.05)',
  },

  // Avatar
  avatarContainer: {
    position: 'relative',
    marginRight: SPACING.md,
  },
  avatar: {
    width: TOUCH.avatarMd,
    height: TOUCH.avatarMd,
    borderRadius: TOUCH.avatarMd / 2,
    backgroundColor: COLORS.glassBg,
  },
  avatarFallback: {
    width: TOUCH.avatarMd,
    height: TOUCH.avatarMd,
    borderRadius: TOUCH.avatarMd / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },

  // Online Indicator
  onlineIndicator: {
    position: 'absolute',
    bottom: -2,
    right: -2,
  },

  // Content
  content: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xxs,
  },
  name: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginRight: SPACING.sm,
  },
  time: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
  timeUnread: {
    color: COLORS.gold,
  },

  // Message
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  message: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textMuted,
    marginRight: SPACING.sm,
  },
  messageUnread: {
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },

  // Unread Badge
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.burgundy,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xs,
  },
  unreadText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
});
