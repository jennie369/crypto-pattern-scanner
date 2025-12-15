/**
 * Gemral - Saved Posts Screen
 * Shows all bookmarked posts
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Bookmark, FileText } from 'lucide-react-native';
import { COLORS, GRADIENTS, SPACING, TYPOGRAPHY, GLASS } from '../../utils/tokens';
import { forumService } from '../../services/forumService';
import { useAuth } from '../../contexts/AuthContext';
import PostCard from '../Forum/components/PostCard';

export default function SavedPostsScreen({ navigation }) {
  const { user } = useAuth();
  const [savedPosts, setSavedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadSavedPosts = useCallback(async () => {
    if (!user?.id) return;

    try {
      const data = await forumService.getSavedPosts();
      setSavedPosts(data || []);
    } catch (error) {
      console.error('[SavedPosts] Load error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadSavedPosts();
  }, [loadSavedPosts]);

  const onRefresh = () => {
    setRefreshing(true);
    loadSavedPosts();
  };

  const handlePostPress = (post) => {
    navigation.navigate('Home', {
      screen: 'PostDetail',
      params: { postId: post.id },
    });
  };

  const handleUnsave = async (postId) => {
    try {
      await forumService.unsavePost(postId);
      setSavedPosts(prev => prev.filter(p => p.id !== postId));
    } catch (error) {
      console.error('[SavedPosts] Unsave error:', error);
    }
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Bookmark size={64} color={COLORS.textMuted} strokeWidth={1.5} />
      <Text style={styles.emptyTitle}>Chưa có bài viết đã lưu</Text>
      <Text style={styles.emptySubtitle}>
        Chạm vào icon bookmark để lưu bài viết bạn thích
      </Text>
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
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Bài Viết Đã Lưu</Text>
            {savedPosts.length > 0 && (
              <Text style={styles.headerCount}>{savedPosts.length} bài viết</Text>
            )}
          </View>
          <View style={{ width: 40 }} />
        </View>

        {/* Content */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.gold} />
          </View>
        ) : (
          <FlatList
            data={savedPosts}
            keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
            renderItem={({ item }) => (
              <PostCard
                post={{ ...item, user_saved: true }}
                onPress={() => handlePostPress(item)}
                onUpdate={(postId, updates) => {
                  if (updates.hidden || updates.deleted) {
                    setSavedPosts(prev => prev.filter(p => p.id !== postId));
                  }
                }}
              />
            )}
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
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  headerCount: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginTop: 2,
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
  },
});
