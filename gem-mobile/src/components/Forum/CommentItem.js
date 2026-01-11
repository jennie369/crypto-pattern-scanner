/**
 * CommentItem Component
 * Single comment with reply support
 * Phase 3: Comment Threading (30/12/2024)
 */

import React, { memo, useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  Image,
  Alert,
} from 'react-native';
import Animated, {
  FadeIn,
  SlideInLeft,
  Layout,
} from 'react-native-reanimated';
import { User, MoreHorizontal } from 'lucide-react-native';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import MentionText from './MentionText';
import { useAuth } from '../../contexts/AuthContext';
import { COLORS, SPACING } from '../../utils/tokens';

const AVATAR_SIZE_ROOT = 40;
const AVATAR_SIZE_REPLY = 32;

/**
 * CommentItem - Single comment with actions
 *
 * @param {Object} props
 * @param {Object} props.comment - Comment data
 * @param {number} props.depth - Thread depth (0, 1, 2)
 * @param {Function} props.onReply - Reply callback
 * @param {Function} props.onDelete - Delete callback
 * @param {Function} props.onUserPress - User avatar tap callback
 * @param {Function} props.onMentionPress - Mention tap callback
 * @param {boolean} props.isNew - Animate as new comment
 */
const CommentItem = ({
  comment,
  depth = 0,
  onReply,
  onDelete,
  onUserPress,
  onMentionPress,
  isNew = false,
}) => {
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);

  // Determine avatar size based on depth
  const avatarSize = depth === 0 ? AVATAR_SIZE_ROOT : AVATAR_SIZE_REPLY;

  // Calculate indent
  const indent = depth * 48;

  // Check if own comment
  const isOwn = user?.id === comment?.user_id;

  // Format timestamp
  const timeAgo = comment?.created_at
    ? formatDistanceToNow(new Date(comment.created_at), {
        addSuffix: true,
        locale: vi,
      })
    : '';

  // Get author info with fallbacks
  const authorName = comment?.author_name
    || comment?.author?.display_name
    || comment?.author?.full_name
    || 'Nguoi dung';
  const authorAvatar = comment?.author_avatar
    || comment?.author?.avatar_url;

  // Handle like
  const handleLike = useCallback(() => {
    setLiked((prev) => !prev);
    // TODO: Implement comment like API
  }, []);

  // Handle delete
  const handleDelete = useCallback(() => {
    Alert.alert(
      'Xoa binh luan',
      'Ban co chac muon xoa binh luan nay?',
      [
        { text: 'Huy', style: 'cancel' },
        {
          text: 'Xoa',
          style: 'destructive',
          onPress: () => onDelete?.(comment?.id, comment?.parent_id),
        },
      ]
    );
  }, [comment?.id, comment?.parent_id, onDelete]);

  // Handle more menu
  const handleMore = useCallback(() => {
    Alert.alert(
      'Tuy chon',
      null,
      [
        ...(isOwn
          ? [{ text: 'Xoa binh luan', onPress: handleDelete, style: 'destructive' }]
          : [{ text: 'Bao cao', onPress: () => {} }]),
        { text: 'Huy', style: 'cancel' },
      ]
    );
  }, [isOwn, handleDelete]);

  if (!comment) return null;

  return (
    <Animated.View
      entering={isNew ? SlideInLeft.springify() : FadeIn}
      layout={Layout.springify()}
      style={[styles.container, { marginLeft: indent }]}
    >
      {/* Avatar */}
      <Pressable
        onPress={() => onUserPress?.(comment.user_id)}
        style={styles.avatarContainer}
      >
        {authorAvatar ? (
          <Image
            source={{ uri: authorAvatar }}
            style={[styles.avatar, { width: avatarSize, height: avatarSize }]}
          />
        ) : (
          <View
            style={[
              styles.avatar,
              styles.avatarPlaceholder,
              { width: avatarSize, height: avatarSize },
            ]}
          >
            <User size={avatarSize * 0.5} color={COLORS.textMuted} />
          </View>
        )}
      </Pressable>

      {/* Content */}
      <View style={styles.content}>
        {/* Bubble */}
        <View style={styles.bubble}>
          {/* Author */}
          <Pressable onPress={() => onUserPress?.(comment.user_id)}>
            <Text style={styles.authorName}>
              {authorName}
            </Text>
          </Pressable>

          {/* Comment text with mentions */}
          <MentionText
            text={comment.content}
            replyToName={comment.reply_to_name}
            onMentionPress={onMentionPress}
            style={styles.commentText}
          />
        </View>

        {/* Actions row */}
        <View style={styles.actionsRow}>
          {/* Timestamp */}
          <Text style={styles.timestamp}>{timeAgo}</Text>

          {/* Like */}
          <Pressable
            style={styles.actionButton}
            onPress={handleLike}
          >
            <Text style={[styles.actionText, liked && styles.actionTextActive]}>
              Thich
            </Text>
          </Pressable>

          {/* Reply */}
          <Pressable
            style={styles.actionButton}
            onPress={() => onReply?.(comment)}
          >
            <Text style={styles.actionText}>Tra loi</Text>
          </Pressable>

          {/* More */}
          <Pressable
            style={styles.moreButton}
            onPress={handleMore}
          >
            <MoreHorizontal size={16} color={COLORS.textMuted} />
          </Pressable>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
  },
  avatarContainer: {
    marginRight: SPACING.sm,
  },
  avatar: {
    borderRadius: 100,
  },
  avatarPlaceholder: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  bubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  authorName: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  commentText: {
    fontSize: 15,
    color: COLORS.textPrimary,
    lineHeight: 20,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    paddingLeft: SPACING.sm,
  },
  timestamp: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginRight: SPACING.md,
  },
  actionButton: {
    marginRight: SPACING.md,
    paddingVertical: 2,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  actionTextActive: {
    color: COLORS.gold,
  },
  moreButton: {
    padding: 4,
    marginLeft: 'auto',
  },
});

export default memo(CommentItem);
