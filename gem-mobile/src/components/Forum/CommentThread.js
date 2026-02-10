/**
 * CommentThread Component
 * Thread container with replies
 * Phase 3: Comment Threading (30/12/2024)
 */

import React, { memo, useState, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import Animated, {
  FadeIn,
  Layout,
} from 'react-native-reanimated';
import { ChevronDown, ChevronUp } from 'lucide-react-native';
import CommentItem from './CommentItem';
import ThreadLine from './ThreadLine';
import LoadMoreReplies from './LoadMoreReplies';
import { useSettings } from '../../contexts/SettingsContext';

const INITIAL_REPLIES_SHOWN = 5;

/**
 * CommentThread - Thread container with root comment and replies
 *
 * @param {Object} props
 * @param {Object} props.comment - Root comment data
 * @param {Array} props.replies - Loaded replies array
 * @param {boolean} props.isExpanded - Thread expanded state
 * @param {Function} props.onToggle - Toggle expand callback
 * @param {Function} props.onLoadMore - Load more replies callback
 * @param {Function} props.onReply - Reply callback
 * @param {Function} props.onDelete - Delete callback
 * @param {Function} props.onUserPress - User tap callback
 * @param {Function} props.onMentionPress - Mention tap callback
 */
const CommentThread = ({
  comment,
  replies = [],
  isExpanded = false,
  onToggle,
  onLoadMore,
  onReply,
  onDelete,
  onUserPress,
  onMentionPress,
}) => {
  const { colors, gradients, glass, settings, SPACING, TYPOGRAPHY, t } = useSettings();
  const [loadingMore, setLoadingMore] = useState(false);

  // Calculate remaining replies
  const totalReplies = comment?.replies_count || 0;
  const loadedReplies = replies?.length || 0;
  const remainingReplies = totalReplies - loadedReplies;
  const hasMoreReplies = remainingReplies > 0;

  // Handle expand toggle
  const handleToggle = useCallback(() => {
    onToggle?.(comment?.id);
  }, [comment?.id, onToggle]);

  // Handle load more
  const handleLoadMore = useCallback(async () => {
    if (loadingMore) return;

    setLoadingMore(true);
    try {
      await onLoadMore?.(comment?.id, loadedReplies);
    } finally {
      setLoadingMore(false);
    }
  }, [comment?.id, loadedReplies, loadingMore, onLoadMore]);

  // Memoized styles
  const styles = useMemo(() => StyleSheet.create({
    container: {
      marginBottom: SPACING.sm,
    },
    viewRepliesButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: SPACING.xs,
      paddingHorizontal: SPACING.md,
      marginLeft: 56, // Avatar + spacing
    },
    viewRepliesText: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.gold,
      marginLeft: 4,
    },
    repliesContainer: {
      position: 'relative',
      marginTop: SPACING.xs,
    },
    collapseButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: SPACING.xs,
      paddingHorizontal: SPACING.md,
      marginLeft: 56,
    },
    collapseText: {
      fontSize: 12,
      color: colors.textMuted,
      marginLeft: 4,
    },
    threadLineContainer: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: 0,
    },
    replyWrapper: {
      position: 'relative',
    },
    loadingContainer: {
      paddingVertical: SPACING.md,
      alignItems: 'center',
    },
  }), [colors, settings.theme, glass, SPACING, TYPOGRAPHY]);

  if (!comment) return null;

  return (
    <View style={styles.container}>
      {/* Root Comment */}
      <CommentItem
        comment={comment}
        depth={0}
        onReply={onReply}
        onDelete={onDelete}
        onUserPress={onUserPress}
        onMentionPress={onMentionPress}
      />

      {/* View Replies Button (collapsed state) */}
      {totalReplies > 0 && !isExpanded && (
        <Pressable style={styles.viewRepliesButton} onPress={handleToggle}>
          <ChevronDown size={16} color={colors.gold} />
          <Text style={styles.viewRepliesText}>
            Xem {totalReplies} tra loi
          </Text>
        </Pressable>
      )}

      {/* Replies (expanded state) */}
      {isExpanded && (
        <Animated.View
          entering={FadeIn.duration(200)}
          layout={Layout.springify()}
          style={styles.repliesContainer}
        >
          {/* Collapse button */}
          <Pressable style={styles.collapseButton} onPress={handleToggle}>
            <ChevronUp size={16} color={colors.textMuted} />
            <Text style={styles.collapseText}>An tra loi</Text>
          </Pressable>

          {/* Thread line */}
          <View style={styles.threadLineContainer}>
            <ThreadLine depth={1} />
          </View>

          {/* Reply items */}
          {replies.map((reply, index) => (
            <View key={reply?.id || index} style={styles.replyWrapper}>
              <CommentItem
                comment={reply}
                depth={reply?.thread_depth || 1}
                onReply={onReply}
                onDelete={onDelete}
                onUserPress={onUserPress}
                onMentionPress={onMentionPress}
              />
            </View>
          ))}

          {/* Load more button */}
          {hasMoreReplies && (
            <LoadMoreReplies
              remaining={remainingReplies}
              onPress={handleLoadMore}
              depth={1}
            />
          )}

          {/* Loading indicator */}
          {loadingMore && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={colors.gold} />
            </View>
          )}
        </Animated.View>
      )}
    </View>
  );
};

export default memo(CommentThread);
