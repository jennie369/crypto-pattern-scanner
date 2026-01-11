/**
 * CommentFeed Component
 * Real-time scrolling comments list for livestream
 *
 * Features:
 * - Auto-scroll to new comments
 * - Manual scroll pause
 * - Load more on scroll up
 * - Empty state
 */

import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CommentItem from './CommentItem';
import tokens from '../../utils/tokens';

const CommentFeed = ({
  comments = [],
  highlightedCommentId,
  aiResponseIds = [],
  onLoadMore,
  isLoading = false,
  style,
}) => {
  const flatListRef = useRef(null);
  const [isAutoScroll, setIsAutoScroll] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;

  // Auto-scroll when new comments arrive
  useEffect(() => {
    if (isAutoScroll && comments.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } else if (comments.length > 0 && !isAutoScroll) {
      setShowScrollButton(true);
    }
  }, [comments.length, isAutoScroll]);

  // Handle scroll event
  const handleScroll = useCallback((event) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const isNearBottom =
      layoutMeasurement.height + contentOffset.y >= contentSize.height - 100;

    if (isNearBottom) {
      setIsAutoScroll(true);
      setShowScrollButton(false);
    } else {
      setIsAutoScroll(false);
    }

    // Load more when near top
    if (contentOffset.y < 50 && onLoadMore && !isLoading) {
      onLoadMore();
    }
  }, [onLoadMore, isLoading]);

  // Scroll to bottom
  const scrollToBottom = () => {
    flatListRef.current?.scrollToEnd({ animated: true });
    setIsAutoScroll(true);
    setShowScrollButton(false);
  };

  // Render single comment
  const renderComment = useCallback(({ item, index }) => (
    <CommentItem
      comment={item}
      isHighlighted={item.id === highlightedCommentId}
      isAIResponse={aiResponseIds.includes(item.id)}
    />
  ), [highlightedCommentId, aiResponseIds]);

  // Key extractor
  const keyExtractor = useCallback((item) => item.id?.toString(), []);

  // Empty state
  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons
        name="chatbubbles-outline"
        size={48}
        color={tokens.colors.textSecondary}
      />
      <Text style={styles.emptyText}>
        Chưa có bình luận nào
      </Text>
      <Text style={styles.emptySubtext}>
        Hãy là người đầu tiên bình luận!
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, style]}>
      <FlatList
        ref={flatListRef}
        data={comments}
        renderItem={renderComment}
        keyExtractor={keyExtractor}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContent,
          comments.length === 0 && styles.emptyContent,
        ]}
        ListEmptyComponent={renderEmpty}
        onEndReachedThreshold={0.5}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={15}
      />

      {/* Scroll to bottom button */}
      {showScrollButton && (
        <Animated.View style={styles.scrollButtonContainer}>
          <TouchableOpacity
            style={styles.scrollButton}
            onPress={scrollToBottom}
            activeOpacity={0.8}
          >
            <Ionicons
              name="chevron-down"
              size={20}
              color={tokens.colors.white}
            />
            <Text style={styles.scrollButtonText}>
              Bình luận mới
            </Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  listContent: {
    paddingVertical: tokens.spacing.sm,
    paddingHorizontal: tokens.spacing.sm,
  },
  emptyContent: {
    flex: 1,
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: tokens.spacing.xxl,
  },
  emptyText: {
    fontSize: tokens.fontSize.lg,
    color: tokens.colors.textSecondary,
    marginTop: tokens.spacing.md,
  },
  emptySubtext: {
    fontSize: tokens.fontSize.sm,
    color: tokens.colors.textTertiary,
    marginTop: tokens.spacing.xs,
  },
  scrollButtonContainer: {
    position: 'absolute',
    bottom: tokens.spacing.md,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  scrollButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tokens.colors.primary,
    paddingVertical: tokens.spacing.xs,
    paddingHorizontal: tokens.spacing.md,
    borderRadius: tokens.radius.full,
    gap: tokens.spacing.xs,
    shadowColor: tokens.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  scrollButtonText: {
    fontSize: tokens.fontSize.sm,
    color: tokens.colors.white,
    fontWeight: '600',
  },
});

export default CommentFeed;
