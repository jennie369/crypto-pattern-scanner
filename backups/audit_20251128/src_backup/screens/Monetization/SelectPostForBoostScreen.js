/**
 * Gemral - Select Post For Boost Screen
 * Allows user to select one of their posts to boost
 * Dark glass theme
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Zap, Image as ImageIcon, FileText, MessageCircle, Heart } from 'lucide-react-native';
import { COLORS, GRADIENTS, SPACING, TYPOGRAPHY, GLASS } from '../../utils/tokens';
import forumService from '../../services/forumService';
import { useAuth } from '../../contexts/AuthContext';

export default function SelectPostForBoostScreen({ navigation }) {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadPosts = useCallback(async () => {
    if (!user?.id) return;

    try {
      // Load user's posts
      const result = await forumService.getUserPosts(user.id);
      if (result && Array.isArray(result)) {
        setPosts(result);
      } else if (result?.data) {
        setPosts(result.data);
      }
    } catch (error) {
      console.error('[SelectPostForBoost] Load error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const onRefresh = () => {
    setRefreshing(true);
    loadPosts();
  };

  const handleSelectPost = (post) => {
    navigation.navigate('BoostPost', { postId: post.id, post });
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('vi-VN', {
      day: 'numeric',
      month: 'short',
    });
  };

  const renderPostItem = ({ item }) => (
    <TouchableOpacity
      style={styles.postItem}
      onPress={() => handleSelectPost(item)}
      activeOpacity={0.7}
    >
      {/* Post Preview Image */}
      <View style={styles.postPreview}>
        {item.media_urls?.[0] ? (
          <Image source={{ uri: item.media_urls[0] }} style={styles.postImage} />
        ) : (
          <View style={styles.postImagePlaceholder}>
            <FileText size={24} color={COLORS.textMuted} />
          </View>
        )}
      </View>

      <View style={styles.postInfo}>
        {/* Post Content */}
        <Text style={styles.postContent} numberOfLines={2}>
          {item.content || item.title || 'Bài viết'}
        </Text>

        {/* Post Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Heart size={14} color={COLORS.textMuted} />
            <Text style={styles.statValue}>{item.likes_count || 0}</Text>
          </View>
          <View style={styles.statItem}>
            <MessageCircle size={14} color={COLORS.textMuted} />
            <Text style={styles.statValue}>{item.comments_count || 0}</Text>
          </View>
          <Text style={styles.dateText}>{formatDate(item.created_at)}</Text>
        </View>
      </View>

      {/* Boost Icon */}
      <View style={styles.boostIcon}>
        <Zap size={20} color={COLORS.gold} />
      </View>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <FileText size={64} color={COLORS.textMuted} strokeWidth={1.5} />
      <Text style={styles.emptyTitle}>Chưa có bài viết nào</Text>
      <Text style={styles.emptySubtitle}>
        Tạo bài viết trước rồi quay lại để boost
      </Text>
      <TouchableOpacity
        style={styles.createPostBtn}
        onPress={() => navigation.navigate('Forum', { screen: 'CreatePost' })}
      >
        <Text style={styles.createPostText}>Tạo bài viết</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <LinearGradient
      colors={GRADIENTS.background}
      locations={GRADIENTS.backgroundLocations}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ArrowLeft size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chọn Bài Viết</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Zap size={20} color={COLORS.gold} />
          <Text style={styles.infoText}>
            Chọn bài viết bạn muốn boost để tăng lượt tiếp cận
          </Text>
        </View>

        {/* Content */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.gold} />
          </View>
        ) : (
          <FlatList
            data={posts}
            keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
            renderItem={renderPostItem}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={renderEmpty}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={COLORS.gold}
              />
            }
          />
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
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
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    backgroundColor: 'rgba(255, 189, 89, 0.1)',
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    padding: SPACING.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.2)',
  },
  infoText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: SPACING.lg,
    flexGrow: 1,
  },
  postItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GLASS.background,
    borderRadius: GLASS.borderRadius,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
  },
  postPreview: {
    width: 70,
    height: 70,
    borderRadius: 10,
    overflow: 'hidden',
    marginRight: SPACING.md,
  },
  postImage: {
    width: '100%',
    height: '100%',
  },
  postImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(106, 91, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  postInfo: {
    flex: 1,
  },
  postContent: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
    lineHeight: 20,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
  dateText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
  boostIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 189, 89, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.huge,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  emptySubtitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  createPostBtn: {
    backgroundColor: COLORS.gold,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: 20,
  },
  createPostText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: '#112250',
  },
});
