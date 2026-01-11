/**
 * CommentItem Component
 * Single comment in livestream feed
 *
 * Features:
 * - Platform badge (Gemral, TikTok, Facebook)
 * - Avatar and username
 * - Gift indicator
 * - Highlight animation for AI responses
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import tokens, { COLORS } from '../../utils/tokens';

// Platform icons and colors
const PLATFORMS = {
  gemral: {
    name: 'Gemral',
    icon: 'gem',
    iconSet: FontAwesome5,
    color: tokens.colors.primary,
    gradient: [tokens.colors.primary, tokens.colors.primaryDark],
  },
  tiktok: {
    name: 'TikTok',
    icon: 'musical-notes',
    iconSet: Ionicons,
    color: '#69C9D0',
    gradient: ['#EE1D52', '#69C9D0'],
  },
  facebook: {
    name: 'Facebook',
    icon: 'logo-facebook',
    iconSet: Ionicons,
    color: '#1877F2',
    gradient: ['#1877F2', '#42B72A'],
  },
};

const CommentItem = ({
  comment,
  isHighlighted = false,
  isAIResponse = false,
  style,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Entry animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const platform = PLATFORMS[comment.platform] || PLATFORMS.gemral;
  const IconComponent = platform.iconSet;

  // Format time
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Animated.View
      style={[
        styles.container,
        isHighlighted && styles.highlighted,
        isAIResponse && styles.aiResponse,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
        style,
      ]}
    >
      {/* Platform badge */}
      <LinearGradient
        colors={platform.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.platformBadge}
      >
        <IconComponent
          name={platform.icon}
          size={10}
          color={tokens.colors.white}
        />
      </LinearGradient>

      {/* Avatar */}
      <View style={styles.avatarContainer}>
        {comment.platform_avatar ? (
          <Image
            source={{ uri: comment.platform_avatar }}
            style={styles.avatar}
          />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Text style={styles.avatarInitial}>
              {(comment.platform_username || 'U')[0].toUpperCase()}
            </Text>
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.username} numberOfLines={1}>
            {comment.platform_username || 'Người dùng'}
          </Text>
          <Text style={styles.time}>
            {formatTime(comment.created_at)}
          </Text>
        </View>

        <Text style={styles.message}>
          {comment.message}
        </Text>

        {/* Gift indicator */}
        {comment.has_gift && (
          <View style={styles.giftContainer}>
            <Ionicons name="gift" size={14} color={COLORS.warning} />
            <Text style={styles.giftText}>
              {comment.gift_type || 'Quà'} x{comment.gift_value || 1}
            </Text>
          </View>
        )}
      </View>

      {/* AI Response indicator */}
      {isAIResponse && (
        <View style={styles.aiIndicator}>
          <FontAwesome5 name="robot" size={12} color={tokens.colors.primary} />
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: tokens.spacing.sm,
    paddingHorizontal: tokens.spacing.md,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: tokens.radius.md,
    marginBottom: tokens.spacing.xs,
  },
  highlighted: {
    backgroundColor: 'rgba(168,85,247,0.15)',
    borderWidth: 1,
    borderColor: tokens.colors.primary + '40',
  },
  aiResponse: {
    backgroundColor: 'rgba(59,130,246,0.15)',
    borderLeftWidth: 3,
    borderLeftColor: tokens.colors.primary,
  },
  platformBadge: {
    position: 'absolute',
    top: -4,
    left: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  avatarContainer: {
    marginRight: tokens.spacing.sm,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: tokens.colors.surfaceDark,
  },
  avatarPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: tokens.colors.primary + '40',
  },
  avatarInitial: {
    fontSize: tokens.fontSize.md,
    fontWeight: '600',
    color: tokens.colors.primary,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  username: {
    flex: 1,
    fontSize: tokens.fontSize.sm,
    fontWeight: '600',
    color: tokens.colors.textPrimary,
  },
  time: {
    fontSize: tokens.fontSize.xs,
    color: tokens.colors.textSecondary,
  },
  message: {
    fontSize: tokens.fontSize.md,
    color: tokens.colors.textPrimary,
    lineHeight: 20,
  },
  giftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: tokens.spacing.xs,
    gap: 4,
  },
  giftText: {
    fontSize: tokens.fontSize.xs,
    color: COLORS.warning,
    fontWeight: '500',
  },
  aiIndicator: {
    position: 'absolute',
    top: tokens.spacing.xs,
    right: tokens.spacing.xs,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: tokens.colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CommentItem;
