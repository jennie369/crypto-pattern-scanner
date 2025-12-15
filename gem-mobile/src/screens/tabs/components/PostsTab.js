/**
 * Gemral - Posts Tab Component
 * Facebook-style posts list with author info, tagged users, content and images
 * UPDATED: Same features as PostCard - ImageViewer with overlay, action bar layout
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Heart, MessageCircle, FileText, Send, Repeat2, Gift, Bookmark } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, TYPOGRAPHY, GLASS } from '../../../utils/tokens';
import ImageViewer from '../../../components/ImageViewer';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const PostsTab = ({
  posts,
  loading,
  onPostPress,
  onEndReached,
  hasMore,
}) => {
  const navigation = useNavigation();

  // Image viewer state
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  // Track expanded state for each post
  const [expandedPosts, setExpandedPosts] = useState({});

  // Toggle expanded state for a post
  const toggleExpanded = (postId) => {
    setExpandedPosts(prev => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  // Check if content is long enough to need "Xem thêm"
  const isLongContent = (content) => {
    if (!content) return false;
    const plainText = content.replace(/<[^>]*>/g, '');
    return plainText.length > 150;
  };

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

  // Get author info from post
  const getAuthorInfo = (item) => {
    const author = item.author || item.user || {};
    return {
      id: author.id || item.user_id,
      name: author.full_name || author.username || author.email?.split('@')[0] || 'Người dùng',
      avatar: author.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(author.full_name || 'U')}&background=6A5BFF&color=fff`,
    };
  };

  // Get tagged users from post (if any)
  const getTaggedUsers = (item) => {
    return item.tagged_users || item.mentions || item.with_users || [];
  };

  // Navigate to user profile
  const handleAuthorPress = (userId) => {
    if (userId) {
      navigation.navigate('UserProfile', { userId });
    }
  };

  // Handle image press - open ImageViewer
  const handleImagePress = (item) => {
    setSelectedPost(item);
    setImageViewerVisible(true);
  };

  // Get images array for viewer
  const getImages = (item) => {
    if (item.media_urls?.length > 0) return item.media_urls;
    if (item.image_url) return [item.image_url];
    return [];
  };

  const renderPost = ({ item }) => {
    const author = getAuthorInfo(item);
    const taggedUsers = getTaggedUsers(item);

    return (
      <View style={styles.postCard}>
        {/* 1. Author Header - Facebook style */}
        <TouchableOpacity
          style={styles.authorRow}
          onPress={() => onPostPress?.(item)}
          activeOpacity={0.9}
        >
          <TouchableOpacity
            onPress={() => handleAuthorPress(author.id)}
            activeOpacity={0.7}
          >
            <Image
              source={{ uri: author.avatar }}
              style={styles.avatar}
            />
          </TouchableOpacity>
          <View style={styles.authorInfo}>
            <View style={styles.authorNameRow}>
              <TouchableOpacity onPress={() => handleAuthorPress(author.id)}>
                <Text style={styles.authorName}>{author.name}</Text>
              </TouchableOpacity>
              {/* Tagged Users - Facebook style */}
              {taggedUsers.length > 0 && (
                <Text style={styles.taggedText}>
                  {' cùng với '}
                  {taggedUsers.slice(0, 2).map((user, idx) => (
                    <Text key={user.id || idx}>
                      <Text
                        style={styles.taggedName}
                        onPress={() => handleAuthorPress(user.id)}
                      >
                        {user.full_name || user.username || 'Người dùng'}
                      </Text>
                      {idx < Math.min(taggedUsers.length, 2) - 1 && ', '}
                    </Text>
                  ))}
                  {taggedUsers.length > 2 && (
                    <Text style={styles.taggedMore}>
                      {` và ${taggedUsers.length - 2} người khác`}
                    </Text>
                  )}
                </Text>
              )}
            </View>
            <Text style={styles.timestamp}>{formatTimeAgo(item.created_at)}</Text>
          </View>
        </TouchableOpacity>

        {/* 2. Content text with Xem thêm / Thu gọn */}
        {item.content && (
          <View style={styles.contentContainer}>
            <TouchableOpacity onPress={() => onPostPress?.(item)} activeOpacity={0.9}>
              <Text
                style={styles.postExcerpt}
                numberOfLines={expandedPosts[item.id] ? undefined : 3}
              >
                {item.content.replace(/<[^>]*>/g, '')}
              </Text>
            </TouchableOpacity>
            {isLongContent(item.content) && (
              <TouchableOpacity onPress={() => toggleExpanded(item.id)}>
                <Text style={styles.viewMoreText}>
                  {expandedPosts[item.id] ? 'Thu gọn' : 'Xem thêm'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* 3. Post Image - Tap to open ImageViewer */}
        {item.image_url && (
          <TouchableOpacity
            activeOpacity={0.95}
            onPress={() => handleImagePress(item)}
          >
            <Image
              source={{ uri: item.image_url }}
              style={styles.postImage}
              resizeMode="cover"
            />
          </TouchableOpacity>
        )}

        {/* 4. Action Bar - Left icons + Right icons */}
        <View style={styles.actionBar}>
          {/* Left side - Like, Comment, Share */}
          <View style={styles.actionBarLeft}>
            <TouchableOpacity style={styles.actionBtn} activeOpacity={0.7}>
              <Heart
                size={22}
                color={item.user_liked ? '#FF6B6B' : COLORS.textMuted}
                fill={item.user_liked ? '#FF6B6B' : 'transparent'}
              />
              {item.likes_count > 0 && (
                <Text style={[styles.actionCount, item.user_liked && styles.actionCountActive]}>
                  {item.likes_count}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => onPostPress?.(item)}
              activeOpacity={0.7}
            >
              <MessageCircle size={22} color={COLORS.textMuted} />
              {item.comments_count > 0 && (
                <Text style={styles.actionCount}>{item.comments_count}</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionBtn} activeOpacity={0.7}>
              <Send size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Right side - Repost, Gift, Save */}
          <View style={styles.actionBarRight}>
            <TouchableOpacity style={styles.actionBtn} activeOpacity={0.7}>
              <Repeat2 size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} activeOpacity={0.7}>
              <Gift size={20} color={COLORS.gold} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} activeOpacity={0.7}>
              <Bookmark
                size={20}
                color={item.user_saved ? COLORS.gold : COLORS.textMuted}
                fill={item.user_saved ? COLORS.gold : 'transparent'}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

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
    <>
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

      {/* Image Viewer with text overlay */}
      {selectedPost && (
        <ImageViewer
          visible={imageViewerVisible}
          images={getImages(selectedPost)}
          initialIndex={0}
          onClose={() => {
            setImageViewerVisible(false);
            setSelectedPost(null);
          }}
          showCounter={true}
          showActions={false}
          postContent={selectedPost.content}
          authorName={getAuthorInfo(selectedPost).name}
          showOverlay={true}
        />
      )}
    </>
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
  // Facebook-style card: FULL WIDTH
  postCard: {
    backgroundColor: GLASS.background,
    borderRadius: 0,
    marginHorizontal: 0,
    marginBottom: SPACING.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.15)',
  },
  // Author Header
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: SPACING.sm,
    backgroundColor: COLORS.bgMid,
  },
  authorInfo: {
    flex: 1,
  },
  authorNameRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  authorName: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  taggedText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
  },
  taggedName: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.cyan,
  },
  taggedMore: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
  },
  timestamp: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  // Content container
  contentContainer: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  // Content text
  postExcerpt: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textPrimary,
    lineHeight: 24,
  },
  // View more / collapse text
  viewMoreText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },
  // Full width image
  postImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH,
    backgroundColor: COLORS.bgMid,
  },
  // Action Bar - Left + Right split
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  actionBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.lg,
  },
  actionBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionCount: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textMuted,
  },
  actionCountActive: {
    color: '#FF6B6B',
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
