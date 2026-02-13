/**
 * Gemral - User Profile Screen
 * View other user's profile with follow functionality
 * UPDATED: Same layout as ProfileFullScreen with tabs (Bài Viết, Hình Ảnh, Video)
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Users, FileText, MessageCircle, Image as ImageIcon, Video } from 'lucide-react-native';
import { forumService } from '../../services/forumService';
import messagingService from '../../services/messagingService';
import { useAuth } from '../../contexts/AuthContext';
import { COLORS, GRADIENTS, SPACING, TYPOGRAPHY, GLASS } from '../../utils/tokens';
import { UserBadges } from '../../components/UserBadge';

// Import Tab components from ProfileFullScreen
import PostsTab from '../tabs/components/PostsTab';
import PhotosTab from '../tabs/components/PhotosTab';
import VideosTab from '../tabs/components/VideosTab';

const UserProfileScreen = ({ route, navigation }) => {
  // Support both userId and username params (for @mentions)
  const { userId: paramUserId, username: paramUsername } = route.params || {};
  const { user: currentUser, isAuthenticated } = useAuth();

  const [resolvedUserId, setResolvedUserId] = useState(paramUserId);
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [contentLoading, setContentLoading] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [messageLoading, setMessageLoading] = useState(false);
  const [stats, setStats] = useState({
    followers: 0,
    following: 0,
    posts: 0,
  });
  const [activeTab, setActiveTab] = useState('posts'); // 'posts', 'photos', 'videos'
  const [notFound, setNotFound] = useState(false);

  const isOwnProfile = currentUser?.id === resolvedUserId;

  // Resolve username to userId if needed
  useEffect(() => {
    const resolveUser = async () => {
      if (paramUserId) {
        setResolvedUserId(paramUserId);
        return;
      }

      if (paramUsername) {
        try {
          console.log('[UserProfile] Resolving username:', paramUsername);
          const user = await forumService.getUserByUsername(paramUsername);
          if (user?.id) {
            console.log('[UserProfile] Found user:', user.id, user.full_name);
            setResolvedUserId(user.id);
          } else {
            console.warn('[UserProfile] User not found for username:', paramUsername);
            setNotFound(true);
            setLoading(false);
          }
        } catch (error) {
          console.error('[UserProfile] Error resolving username:', error);
          setNotFound(true);
          setLoading(false);
        }
      }
    };

    resolveUser();
  }, [paramUserId, paramUsername]);

  // Load profile data when userId is resolved
  useEffect(() => {
    if (resolvedUserId) {
      loadProfileData();
    }
  }, [resolvedUserId]);

  const loadProfileData = async () => {
    if (!resolvedUserId) return;

    try {
      setLoading(true);

      // Load profile, posts, stats, and follow status in parallel
      const [profileData, userPosts, followersCount, followingCount, following] = await Promise.all([
        forumService.getUserProfile(resolvedUserId),
        forumService.getUserPosts(resolvedUserId),
        forumService.getFollowersCount(resolvedUserId),
        forumService.getFollowingCount(resolvedUserId),
        currentUser ? forumService.isFollowing(resolvedUserId) : false,
      ]);

      setProfile(profileData);
      setPosts(userPosts);

      // Filter photos (posts with images) - include stats for overlay
      const photoPosts = userPosts.filter(p => p.image_url || p.thumbnail_url || p.media_urls?.length > 0);
      setPhotos(photoPosts.map(p => ({
        id: p.id,
        image_url: p.image_url || p.thumbnail_url || p.media_urls?.[0],
        created_at: p.created_at,
        likes_count: p.likes_count || 0,
        comments_count: p.comments_count || 0,
        views_count: p.views_count || 0,
      })));

      // Videos placeholder
      setVideos([]);

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
  }, [resolvedUserId]);

  // Handle follow/unfollow
  const handleFollowToggle = async () => {
    if (!isAuthenticated) {
      navigation.navigate('Auth');
      return;
    }

    setFollowLoading(true);
    try {
      if (isFollowing) {
        await forumService.unfollowUser(resolvedUserId);
        setIsFollowing(false);
        setStats(prev => ({ ...prev, followers: Math.max(0, prev.followers - 1) }));
      } else {
        await forumService.followUser(resolvedUserId);
        setIsFollowing(true);
        setStats(prev => ({ ...prev, followers: prev.followers + 1 }));
      }
    } catch (error) {
      console.error('[UserProfile] Follow error:', error);
    } finally {
      setFollowLoading(false);
    }
  };

  // Handle send message - create or get conversation, then navigate
  const handleSendMessage = async () => {
    if (!isAuthenticated) {
      navigation.navigate('Auth');
      return;
    }

    if (!resolvedUserId) return;

    try {
      setMessageLoading(true);

      // Create or get existing conversation
      const conversation = await messagingService.createConversation([resolvedUserId]);

      if (conversation?.id) {
        // Navigate to Chat screen through Messages stack
        navigation.navigate('Messages', {
          screen: 'Chat',
          params: {
            conversationId: conversation.id,
            conversation: conversation,
          },
        });
      }
    } catch (error) {
      console.error('[UserProfile] Message error:', error);
    } finally {
      setMessageLoading(false);
    }
  };

  // Navigate to post detail
  const handlePostPress = (post) => {
    navigation.navigate('PostDetail', { postId: post.id });
  };

  // Handle photo press
  const handlePhotoPress = (photo) => {
    navigation.navigate('PostDetail', { postId: photo.id });
  };

  // Handle post updates (reactions, likes, saves, etc.)
  const handlePostUpdate = useCallback((postId, updates) => {
    // If post was deleted, remove it from the list
    if (updates?.deleted) {
      setPosts(prev => prev.filter(p => p.id !== postId));
      return;
    }

    // Update post data in the list
    setPosts(prev => prev.map(post =>
      post.id === postId ? { ...post, ...updates } : post
    ));
  }, []);

  // Tabs configuration - same as ProfileFullScreen
  const tabs = [
    { key: 'posts', label: 'Bài Viết', Icon: FileText, count: posts.length },
    { key: 'photos', label: 'Hình Ảnh', Icon: ImageIcon, count: photos.length },
    { key: 'videos', label: 'Video', Icon: Video, count: videos.length },
  ];

  // Render tab content - same as ProfileFullScreen
  const renderContent = () => {
    if (contentLoading && posts.length === 0) {
      return (
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color={COLORS.gold} />
        </View>
      );
    }

    switch (activeTab) {
      case 'posts':
        return (
          <PostsTab
            posts={posts}
            loading={contentLoading}
            onPostPress={handlePostPress}
            onPostUpdate={handlePostUpdate}
            onEndReached={() => {}}
            hasMore={false}
          />
        );
      case 'photos':
        return (
          <PhotosTab
            photos={photos}
            loading={contentLoading}
            onPhotoPress={handlePhotoPress}
            onEndReached={() => {}}
            hasMore={false}
          />
        );
      case 'videos':
        return (
          <VideosTab
            videos={videos}
            loading={contentLoading}
            onVideoPress={() => {}}
            onEndReached={() => {}}
            hasMore={false}
          />
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <LinearGradient colors={GRADIENTS.background} style={styles.gradient}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.gold} />
        </View>
      </LinearGradient>
    );
  }

  if (notFound) {
    return (
      <LinearGradient colors={GRADIENTS.background} style={styles.gradient}>
        <SafeAreaView style={styles.container} edges={['top']}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <ArrowLeft size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Trang cá nhân</Text>
            <View style={{ width: 40 }} />
          </View>
          <View style={styles.notFoundContainer}>
            <Text style={styles.notFoundText}>Không tìm thấy người dùng</Text>
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
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <ArrowLeft size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Trang cá nhân</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.gold}
              colors={[COLORS.gold]}
            />
          }
        >
          {/* Profile Section */}
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

            {/* Stats - Tap to navigate */}
            <View style={styles.statsRow}>
              <TouchableOpacity style={styles.statItem} activeOpacity={0.7}>
                <Text style={styles.statValue}>{stats.posts}</Text>
                <Text style={styles.statLabel}>Bài viết</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.statItem}
                activeOpacity={0.7}
                onPress={() => navigation.navigate('FollowersList', {
                  userId: resolvedUserId,
                  username: profile?.username
                })}
              >
                <Text style={styles.statValue}>{stats.followers}</Text>
                <Text style={styles.statLabel}>Người theo dõi</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.statItem}
                activeOpacity={0.7}
                onPress={() => navigation.navigate('FollowingList', {
                  userId: resolvedUserId,
                  username: profile?.username
                })}
              >
                <Text style={styles.statValue}>{stats.following}</Text>
                <Text style={styles.statLabel}>Đang theo dõi</Text>
              </TouchableOpacity>
            </View>

            {/* Action Buttons */}
            {!isOwnProfile && (
              <View style={styles.actionButtons}>
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

                <TouchableOpacity
                  style={styles.messageButton}
                  onPress={handleSendMessage}
                  disabled={messageLoading}
                >
                  {messageLoading ? (
                    <ActivityIndicator size="small" color={COLORS.textPrimary} />
                  ) : (
                    <MessageCircle size={18} color={COLORS.textPrimary} />
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Tabs - Same as ProfileFullScreen */}
          <View style={styles.tabsContainer}>
            {tabs.map((tab) => {
              const isActive = activeTab === tab.key;
              const IconComponent = tab.Icon;

              return (
                <TouchableOpacity
                  key={tab.key}
                  style={[styles.tab, isActive && styles.tabActive]}
                  onPress={() => setActiveTab(tab.key)}
                >
                  <IconComponent
                    size={18}
                    color={isActive ? COLORS.gold : COLORS.textMuted}
                  />
                  <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                    {tab.label} ({tab.count})
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Content */}
          {renderContent()}

          {/* Bottom spacing - enough for tab bar + safe area */}
          <View style={{ height: 150 }} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1 },
  scrollView: { flex: 1 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    paddingVertical: SPACING.huge,
    alignItems: 'center',
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notFoundText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textMuted,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: GLASS.background,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(106, 91, 255, 0.2)',
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxxl,
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

  // Tabs - Same as ProfileFullScreen
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    borderRadius: 12,
    backgroundColor: GLASS.background,
    gap: SPACING.xs,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  tabActive: {
    backgroundColor: 'rgba(255, 189, 89, 0.15)',
    borderColor: COLORS.gold,
  },
  tabText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textMuted,
  },
  tabTextActive: {
    color: COLORS.gold,
  },
});

export default UserProfileScreen;
