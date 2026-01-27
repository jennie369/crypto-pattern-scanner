/**
 * Message Request Item Component
 * Individual item in the message requests list
 *
 * Features:
 * - Avatar with online status
 * - Message preview
 * - Wants to call badge
 * - Accept/Decline/Block buttons
 * - Animated entrance
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

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

export default function MessageRequestItem({
  request,
  onAccept,
  onDecline,
  onBlock,
  onViewProfile,
  onPreview,
  isProcessing = false,
  index = 0,
}) {
  const { requester, message_preview, messages_count, wants_to_call, created_at } = request;

  // Animation
  const translateY = useRef(new Animated.Value(30)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        delay: index * 50,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        delay: index * 50,
        useNativeDriver: true,
      }),
    ]).start();
  }, [index]);

  // Format time
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return 'Vừa xong';
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
  };

  // Get initials
  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name[0].toUpperCase();
  };

  // Check online status
  const isOnline = presenceService?.isOnline?.(requester?.online_status) ?? false;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      <TouchableOpacity
        style={styles.content}
        onPress={onPreview}
        activeOpacity={0.7}
        disabled={isProcessing}
      >
        {/* Avatar */}
        <TouchableOpacity
          style={styles.avatarContainer}
          onPress={onViewProfile}
          activeOpacity={0.8}
        >
          {requester?.avatar_url ? (
            <Image
              source={{ uri: requester.avatar_url }}
              style={styles.avatar}
            />
          ) : (
            <LinearGradient
              colors={GRADIENTS.avatar || [COLORS.purple, COLORS.cyan]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.avatarFallback}
            >
              <Text style={styles.avatarInitials}>
                {getInitials(requester?.display_name)}
              </Text>
            </LinearGradient>
          )}
          {/* Online indicator */}
          {isOnline && <View style={styles.onlineIndicator} />}
        </TouchableOpacity>

        {/* Info */}
        <View style={styles.infoContainer}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>
              {requester?.display_name || 'Unknown User'}
            </Text>
            <Text style={styles.time}>{formatTime(created_at)}</Text>
          </View>

          {/* Badges */}
          <View style={styles.badgesRow}>
            {wants_to_call && (
              <View style={styles.callBadge}>
                <Ionicons name="call" size={12} color={COLORS.cyan} />
                <Text style={styles.callBadgeText}>Muốn gọi cho bạn</Text>
              </View>
            )}
            {messages_count > 1 && (
              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>{messages_count} tin nhắn</Text>
              </View>
            )}
          </View>

          {/* Message preview */}
          <Text style={styles.preview} numberOfLines={2}>
            {message_preview || 'Tin nhắn mới'}
          </Text>

          {/* Actions */}
          <View style={styles.actionsRow}>
            {isProcessing ? (
              <ActivityIndicator size="small" color={COLORS.gold} />
            ) : (
              <>
                {/* Accept Button */}
                <TouchableOpacity
                  style={styles.acceptButton}
                  onPress={onAccept}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={[COLORS.purple, COLORS.cyan]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.acceptButtonGradient}
                  >
                    <Ionicons name="checkmark" size={16} color={COLORS.textPrimary} />
                    <Text style={styles.acceptButtonText}>Chấp nhận</Text>
                  </LinearGradient>
                </TouchableOpacity>

                {/* Decline Button */}
                <TouchableOpacity
                  style={styles.declineButton}
                  onPress={onDecline}
                  activeOpacity={0.7}
                >
                  <Text style={styles.declineButtonText}>Từ chối</Text>
                </TouchableOpacity>

                {/* Block Button */}
                <TouchableOpacity
                  style={styles.blockButton}
                  onPress={onBlock}
                  activeOpacity={0.7}
                >
                  <Ionicons name="ban" size={18} color={COLORS.error} />
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  content: {
    flexDirection: 'row',
    padding: SPACING.md,
    backgroundColor: 'rgba(15, 16, 48, 0.6)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
  },

  // Avatar
  avatarContainer: {
    marginRight: SPACING.md,
    position: 'relative',
  },
  avatar: {
    width: TOUCH.avatarLg,
    height: TOUCH.avatarLg,
    borderRadius: TOUCH.avatarLg / 2,
    backgroundColor: COLORS.glassBg,
  },
  avatarFallback: {
    width: TOUCH.avatarLg,
    height: TOUCH.avatarLg,
    borderRadius: TOUCH.avatarLg / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.success,
    borderWidth: 2,
    borderColor: 'rgba(15, 16, 48, 0.9)',
  },

  // Info
  infoContainer: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
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

  // Badges
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  callBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 245, 255, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 4,
  },
  callBadgeText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.cyan,
  },
  countBadge: {
    backgroundColor: 'rgba(106, 91, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  countBadgeText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.purple,
  },

  // Preview
  preview: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: SPACING.sm,
  },

  // Actions
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.xs,
  },
  acceptButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  acceptButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: 6,
  },
  acceptButtonText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  declineButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
  },
  declineButtonText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.textSecondary,
  },
  blockButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
