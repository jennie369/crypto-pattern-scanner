/**
 * Gemral - User Profile Screen
 * View other user's profile with follow functionality
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Users, FileText, Settings, MessageCircle, Grid3X3, List } from 'lucide-react-native';
import PostCard from './components/PostCard';
import { forumService } from '../../services/forumService';
import { useAuth } from '../../contexts/AuthContext';
import { COLORS, GRADIENTS, SPACING, TYPOGRAPHY, GLASS } from '../../utils/tokens';
import { UserBadges } from '../../components/UserBadge';
import { ImageGrid } from '../../components/Image';

const UserProfileScreen = ({ route, navigation }) => {
  const { userId } = route.params;
  const { user: currentUser, isAuthenticated } = useAuth();

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [stats, setStats] = useState({
    followers: 0,
    following: 0,
    posts: 0,
  });
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  const isOwnProfile = currentUser?.id === userId;

  // Filter posts with images for grid view
  const postsWithImages = posts.filter(post => post.image_url || post.thumbnail_url || post.media_urls?.length > 0);

  // Load profile data
  useEffect(() => {
    loadProfileData();
  }, [userId]);

  const loadProfileData = async () => {
    try {
      setLoading(true);

      // Load profile, posts, stats, and follow status in parallel
      const [profileData, userPosts, followersCount, followingCount, following] = await Promise.all([
        forumService.getUserProfile(userId),
        forumService.getUserPosts(userId),
        forumService.getFollowersCount(userId),
        forumService.getFollowingCount(userId),
        currentUser ? forumService.isFollowing(userId) : false,
      ]);

      setProfile(profileData);
      setPosts(userPosts);
      setStats({
        followers: followersCount,
        following: followingCount,
        posts: userPosts.length,
      });
      setIsFollowing(following);

    } catch (error) {
      console.error('[UserProfile] Load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadProfileData();
    setRefreshing(false);
  }, [userId]);

  // Handle follow/unfollow
  const handleFollowToggle = async () => {
    if (!isAuthenticated) {
      navigation.navigate('Auth');
      return;
    }

    setFollowLoading(true);
    try {
      if (isFollowing) {
        await forumService.unfollowUser(userId);
        setIsFollowing(false);
        setStats(prev => ({ ...prev, followers: Math.max(0, prev.followers - 1) }));
      } else {
        await forumService.followUser(userId);
        setIsFollowing(true);
        setStats(prev => ({ ...prev, followers: prev.followers + 1 }));
      }
    } catch (error) {
      console.error('[UserProfile] Follow error:', error);
    } finally {
      setFollowLoading(false);
    }
  };

  // Navigate to post detail
  const handlePostPress = (post) => {
    navigation.navigate('PostDetail', { postId: post.id });
  };

  // Render header
  const renderHeader = () => (
    <View style={styles.profileSection}>
      {/* Avatar */}
      <Image
        source={{
          uri: profile?.avatar_url ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.full_name || 'U')}&background=6A5BFF&color=fff&size=200`
        }}
        style={styles.avatar}
      />

      {/* Name with Badges */}
      <View style={styles.nameRow}>
        <Text style={styles.name}>{profile?.full_name || 'Người dùng'}</Text>
        <UserBadges user={profile} size="medium" maxBadges={3} />
      </View>
      {profile?.username && (
        <Text style={styles.username}>@{profile.username}</Text>
      )}

      {/* Bio */}
      {profile?.bio && (
        <Text style={styles.bio}>{profile.bio}</Text>
      )}

      {/* Stats */}
      <View style={styles.statsRow}>
        <TouchableOpacity style={styles.statItem}>
          <Text style={styles.statValue}>{stats.posts}</Text>
          <Text style={styles.statLabel}>Bài viết</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.statItem}>
          <Text style={styles.statValue}>{stats.followers}</Text>
          <Text style={styles.statLabel}>Người theo dõi</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.statItem}>
          <Text style={styles.statValue}>{stats.following}</Text>
          <Text style={styles.statLabel}>Đang theo dõi</Text>
        </TouchableOpacity>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        {isOwnProfile ? (
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <Settings size={18} color={COLORS.textPrimary} />
            <Text style={styles.editButtonText}>Chỉnh sửa</Text>
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity
              style={[
                styles.followButton,
                isFollowing && styles.followingButton,
              ]}
              onPress={handleFollowToggle}
              disabled={followLoading}
            >
              {followLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Users size={18} color={isFollowing ? COLORS.gold : '#FFFFFF'} />
                  <Text style={[
                    styles.followButtonText,
                    isFollowing && styles.followingButtonText,
                  ]}>
                    {isFollowing ? 'Đang theo dõi' : 'Theo dõi'}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.messageButton}>
              <MessageCircle size={18} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* View Mode Toggle */}
      <View style={styles.viewToggle}>
        <TouchableOpacity
          style={[styles.toggleButton, viewMode === 'grid' && styles.toggleButtonActive]}
          onPress={() => setViewMode('grid')}
        >
          <Grid3X3 size={20} color={viewMode === 'grid' ? COLORS.gold : COLORS.textMuted} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, viewMode === 'list' && styles.toggleButtonActive]}
          onPress={() => setViewMode('list')}
        >
          <List size={20} color={viewMode === 'list' ? COLORS.gold : COLORS.textMuted} />
        </TouchableOpacity>
      </View>
    </View>
  );

  // Render empty state
  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <FileText size={48} color={COLORS.textMuted} />
      <Text style={styles.emptyText}>Chưa có bài viết nào</Text>
    </View>
  );

  if (loading) {
    return (
      <LinearGradient colors={GRADIENTS.background} style={styles.gradient}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.gold} />
        </View>
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
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <ArrowLeft size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Trang cá nhân</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Posts with Grid/List Toggle */}
        <FlatList
          data={viewMode === 'grid' ? [] : posts}
          renderItem={({ item }) => (
            <PostCard
              post={item}
              onPress={() => handlePostPress(item)}
            />
          )}
          keyExtractor={(item) => item.id?.toString()}
          ListHeaderComponent={
            <>
              {renderHeader()}
              {viewMode === 'grid' && (
                <ImageGrid
                  posts={postsWithImages}
                  columns={3}
                  spacing={2}
                  onPostPress={handlePostPress}
                  showEmpty={true}
                  emptyMessage="Chưa có bài viết có ảnh"
                />
              )}
            </>
          }
          ListEmptyComponent={viewMode === 'list' ? renderEmpty : null}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.gold}
            />
          }
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

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
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
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },

  // Profile Section
  profileSection: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
    paddingHorizontal: SPACING.lg,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: COLORS.gold,
    marginBottom: SPACING.md,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: SPACING.xs,
  },
  name: {
    fontSize: 24,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  username: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textMuted,
    marginBottom: SPACING.sm,
  },
  bio: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    lineHeight: 22,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: GLASS.background,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 22,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.cyan,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginTop: 2,
  },

  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  followButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.burgundy,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xxl,
    borderRadius: 25,
    gap: SPACING.xs,
  },
  followingButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.gold,
  },
  followButtonText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: '#FFFFFF',
  },
  followingButtonText: {
    color: COLORS.gold,
  },
  messageButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: GLASS.background,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GLASS.background,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xxl,
    borderRadius: 25,
    gap: SPACING.xs,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.3)',
  },
  editButtonText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },

  // View Toggle
  viewToggle: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.md,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(106, 91, 255, 0.2)',
    width: '100%',
  },
  toggleButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  toggleButtonActive: {
    backgroundColor: 'rgba(255, 189, 89, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.3)',
  },

  // List
  listContent: {
    paddingHorizontal: SPACING.md,
    paddingBottom: 100,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.huge,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textMuted,
    marginTop: SPACING.md,
  },
});

export default UserProfileScreen;
