/**
 * Gemral - Hashtag Feed Screen
 * Shows posts filtered by hashtag
 * Uses dark glass theme from DESIGN_TOKENS
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Hash } from 'lucide-react-native';
import { COLORS, GRADIENTS, SPACING, TYPOGRAPHY, GLASS } from '../../utils/tokens';
import { hashtagService } from '../../services/hashtagService';
import PostCard from './components/PostCard';

const HashtagFeedScreen = ({ route, navigation }) => {
  const { hashtag } = route.params || {};
  const normalizedTag = hashtag?.replace('#', '') || '';

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [postCount, setPostCount] = useState(0);

  // Initial load
  useEffect(() => {
    loadPosts();
    loadCount();
  }, [normalizedTag]);

  const loadCount = async () => {
    const count = await hashtagService.getHashtagCount(normalizedTag);
    setPostCount(count);
  };

  const loadPosts = async (pageNum = 1) => {
    if (!normalizedTag) {
      setLoading(false);
      return;
    }

    try {
      const data = await hashtagService.getPostsByHashtag(normalizedTag, pageNum, 20);

      if (pageNum === 1) {
        setPosts(data);
      } else {
        setPosts(prev => [...prev, ...data]);
      }

      setHasMore(data.length === 20);
      setPage(pageNum);
    } catch (error) {
      console.error('[HashtagFeed] Load error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Pull to refresh
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadPosts(1);
    loadCount();
  }, [normalizedTag]);

  // Load more (infinite scroll)
  const handleLoadMore = useCallback(() => {
    if (hasMore && !loading) {
      loadPosts(page + 1);
    }
  }, [hasMore, loading, page, normalizedTag]);

  // Render post item
  const renderPost = useCallback(({ item }) => (
    <PostCard
      post={item}
      onPress={() => navigation.navigate('PostDetail', { postId: item.id })}
    />
  ), [navigation]);

  // Empty state
  const renderEmpty = () => {
    if (loading) return null;

    return (
      <View style={styles.emptyContainer}>
        <Hash size={48} color={COLORS.textMuted} />
        <Text style={styles.emptyText}>Chưa có bài viết nào</Text>
        <Text style={styles.emptySubtext}>
          Không tìm thấy bài viết với #{normalizedTag}
        </Text>
      </View>
    );
  };

  // Footer loading
  const renderFooter = () => {
    if (!hasMore) return null;
    return (
      <View style={styles.footerLoading}>
        <ActivityIndicator size="small" color={COLORS.gold} />
      </View>
    );
  };

  if (loading && posts.length === 0) {
    return (
      <LinearGradient
        colors={GRADIENTS.background}
        locations={GRADIENTS.backgroundLocations}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.container} edges={['top']}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.gold} />
            <Text style={styles.loadingText}>Đang tải...</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={GRADIENTS.background}
      locations={GRADIENTS.backgroundLocations}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <ArrowLeft size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>#{normalizedTag}</Text>
            <Text style={styles.headerSubtitle}>{postCount} bài viết</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        {/* Posts List */}
        <FlatList
          data={posts}
          renderItem={renderPost}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={COLORS.gold}
              colors={[COLORS.gold]}
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
        />
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textMuted,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.lg,
    backgroundColor: GLASS.background,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(106, 91, 255, 0.2)',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.cyan,
  },
  headerSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  listContent: {
    padding: SPACING.lg,
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xxl * 2,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginTop: SPACING.lg,
  },
  emptySubtext: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textMuted,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  footerLoading: {
    paddingVertical: SPACING.lg,
    alignItems: 'center',
  },
});

export default HashtagFeedScreen;
