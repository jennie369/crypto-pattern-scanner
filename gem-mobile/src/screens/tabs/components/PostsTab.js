/**
 * Gemral - Posts Tab Component
 * Displays user's posts in profile
 */

import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Heart, MessageCircle, Clock, FileText } from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, GLASS } from '../../../utils/tokens';

const PostsTab = ({
  posts,
  loading,
  onPostPress,
  onEndReached,
  hasMore,
}) => {
  // Format time ago
  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút`;
    if (diffHours < 24) return `${diffHours} giờ`;
    if (diffDays < 7) return `${diffDays} ngày`;
    return date.toLocaleDateString('vi-VN');
  };

  const renderPost = ({ item }) => (
    <TouchableOpacity
      style={styles.postCard}
      onPress={() => onPostPress?.(item)}
      activeOpacity={0.7}
    >
      {/* Post Image (if exists) */}
      {item.image_url && (
        <Image
          source={{ uri: item.image_url }}
          style={styles.postImage}
          resizeMode="cover"
        />
      )}

      {/* Post Content */}
      <View style={styles.postContent}>
        <Text style={styles.postTitle} numberOfLines={2}>
          {item.title}
        </Text>

        {item.content && (
          <Text style={styles.postExcerpt} numberOfLines={2}>
            {item.content.replace(/<[^>]*>/g, '').substring(0, 100)}
          </Text>
        )}

        {/* Post Meta */}
        <View style={styles.postMeta}>
          <View style={styles.metaItem}>
            <Clock size={12} color={COLORS.textMuted} />
            <Text style={styles.metaText}>
              {formatTimeAgo(item.created_at)}
            </Text>
          </View>

          <View style={styles.metaItem}>
            <Heart size={12} color={COLORS.error} />
            <Text style={styles.metaText}>
              {item.likes_count || 0}
            </Text>
          </View>

          <View style={styles.metaItem}>
            <MessageCircle size={12} color={COLORS.purple} />
            <Text style={styles.metaText}>
              {item.comments_count || 0}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <FileText size={64} color={COLORS.textMuted} strokeWidth={1.5} />
      <Text style={styles.emptyTitle}>Chưa có bài viết</Text>
      <Text style={styles.emptySubtitle}>
        Các bài viết sẽ xuất hiện ở đây
      </Text>
    </View>
  );

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
      scrollEnabled={false} // Parent ScrollView handles scrolling
    />
  );
};

const styles = StyleSheet.create({
  listContent: {
    paddingVertical: SPACING.md,
  },
  loadingContainer: {
    paddingVertical: SPACING.huge,
    alignItems: 'center',
  },
  postCard: {
    backgroundColor: GLASS.background,
    borderRadius: 12,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.15)',
  },
  postImage: {
    width: '100%',
    height: 160,
    backgroundColor: COLORS.bgMid,
  },
  postContent: {
    padding: SPACING.md,
  },
  postTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
    lineHeight: 20,
  },
  postExcerpt: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: SPACING.sm,
  },
  postMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginTop: SPACING.xs,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
  emptyContainer: {
    paddingVertical: SPACING.huge,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  emptySubtitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  footer: {
    paddingVertical: SPACING.lg,
    alignItems: 'center',
  },
});

export default PostsTab;
