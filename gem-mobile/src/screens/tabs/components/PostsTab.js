/**
 * Gemral - Posts Tab Component
 * Uses full PostCard component with ALL features from Home feed:
 * - Reactions (ForumReactionButton)
 * - Comments (inline with replies)
 * - Share, Repost, Gift sheets
 * - Edit/Delete functionality
 * - Double-tap to like
 * - Image gallery, Link previews
 * - User badges, Markdown parsing
 */

import React, { useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { FileText } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../utils/tokens';
import PostCard from '../../Forum/components/PostCard';

const PostsTab = ({
  posts,
  loading,
  onPostPress,
  onPostUpdate,
  onEndReached,
  hasMore,
}) => {
  const navigation = useNavigation();

  // Handle post press - navigate to post detail
  const handlePostPress = useCallback((post) => {
    if (onPostPress) {
      onPostPress(post);
    } else {
      navigation.navigate('PostDetail', { postId: post.id });
    }
  }, [navigation, onPostPress]);

  // Handle post updates (delete, hide, edit, etc.)
  const handlePostUpdate = useCallback((postId, updates) => {
    if (onPostUpdate) {
      onPostUpdate(postId, updates);
    }
  }, [onPostUpdate]);

  // Render post using full PostCard component
  const renderPost = useCallback(({ item }) => (
    <PostCard
      post={item}
      onPress={() => handlePostPress(item)}
      onUpdate={handlePostUpdate}
    />
  ), [handlePostPress, handlePostUpdate]);

  const renderEmpty = () => {
    // Show loading indicator when still loading
    if (loading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={COLORS.gold} />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <FileText size={64} color={COLORS.textMuted} strokeWidth={1.5} />
        <Text style={styles.emptyTitle}>Chưa có bài viết</Text>
        <Text style={styles.emptySubtitle}>
          Các bài viết sẽ xuất hiện ở đây
        </Text>
      </View>
    );
  };

  const renderFooter = () => {
    if (!hasMore || !loading) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color={COLORS.gold} />
      </View>
    );
  };

  if (loading && posts.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.gold} />
      </View>
    );
  }

  return (
    <FlatList
      data={posts}
      renderItem={renderPost}
      keyExtractor={(item, index) => `post-${item.id || 'unknown'}-${index}`}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      ListEmptyComponent={renderEmpty}
      ListFooterComponent={renderFooter}
      scrollEnabled={false}
    />
  );
};

const styles = StyleSheet.create({
  listContent: {
    paddingVertical: 0,
    paddingBottom: 20,
  },
  loadingContainer: {
    paddingVertical: SPACING.huge,
    alignItems: 'center',
  },
  emptyContainer: {
    paddingVertical: SPACING.huge,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  emptySubtitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  loadingText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
    marginTop: SPACING.md,
  },
  footer: {
    paddingVertical: SPACING.lg,
    alignItems: 'center',
  },
});

export default PostsTab;
