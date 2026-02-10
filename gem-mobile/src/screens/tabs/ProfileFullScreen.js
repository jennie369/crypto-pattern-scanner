/**
 * Gemral - Profile Full Screen
 * Full profile view with posts, photos, videos tabs
 * Theme-aware with i18n support
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft, FileText, Image as ImageIcon, Video } from 'lucide-react-native';

import { useSettings } from '../../contexts/SettingsContext';
import { useAuth } from '../../contexts/AuthContext';
import { forumService } from '../../services/forumService';

// Components
import ProfileHeader from './components/ProfileHeader';
import ProfileStats from './components/ProfileStats';
import PostsTab from './components/PostsTab';
import PhotosTab from './components/PhotosTab';
import VideosTab from './components/VideosTab';

const ProfileFullScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuth();
  const { colors, gradients, glass, settings, SPACING, TYPOGRAPHY, t } = useSettings();

  // i18n labels
  const headerTitle = t('profile.title', 'Trang Cá Nhân');
  const loadingLabel = t('common.loading', 'Đang tải...');
  const postsLabel = t('profile.tabs.posts', 'Bài Viết');
  const photosLabel = t('profile.tabs.photos', 'Hình Ảnh');
  const videosLabel = t('profile.tabs.videos', 'Video');

  // Theme-aware styles
  const styles = useMemo(() => StyleSheet.create({
    gradient: {
      flex: 1,
    },
    lightContainer: {
      flex: 1,
      backgroundColor: colors.bgDarkest,
    },
    container: {
      flex: 1,
    },
    scrollView: {
      flex: 1,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      marginTop: SPACING.md,
      fontSize: TYPOGRAPHY.fontSize.lg,
      color: colors.textSecondary,
    },
    loadingContent: {
      paddingVertical: SPACING.huge,
      alignItems: 'center',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: SPACING.lg,
      paddingVertical: SPACING.md,
      backgroundColor: settings.theme === 'light' ? colors.bgDarkest : (glass.background || 'rgba(15, 16, 48, 0.95)'),
      borderBottomWidth: 1,
      borderBottomColor: settings.theme === 'light' ? colors.border : 'rgba(106, 91, 255, 0.2)',
    },
    backButton: {
      width: 44,
      height: 44,
      justifyContent: 'center',
      alignItems: 'center',
    },
    headerTitleText: {
      fontSize: TYPOGRAPHY.fontSize.xxxl,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      color: colors.textPrimary,
    },
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
      backgroundColor: settings.theme === 'light' ? colors.bgDarkest : (glass.background || 'rgba(15, 16, 48, 0.95)'),
      gap: SPACING.xs,
      borderWidth: 1,
      borderColor: 'transparent',
    },
    tabActive: {
      backgroundColor: settings.theme === 'light' ? 'rgba(255, 189, 89, 0.2)' : 'rgba(255, 189, 89, 0.15)',
      borderColor: colors.gold,
    },
    tabText: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
      color: colors.textMuted,
    },
    tabTextActive: {
      color: colors.gold,
    },
  }), [colors, settings.theme, glass, SPACING, TYPOGRAPHY]);

  // State
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({ postsCount: 0, followersCount: 0, followingCount: 0 });
  const [activeTab, setActiveTab] = useState(route.params?.tab || 'posts');
  const [posts, setPosts] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [contentLoading, setContentLoading] = useState(false);

  // Load profile data
  const loadProfile = useCallback(async () => {
    if (!user?.id) return;

    try {
      const profileData = await forumService.getUserProfile(user.id);
      setProfile(profileData);

      const userStats = await forumService.getUserStats(user.id);
      setStats(userStats);
    } catch (error) {
      console.error('[ProfileFull] Load profile error:', error);
    }
  }, [user?.id]);

  // Load posts
  const loadPosts = useCallback(async () => {
    if (!user?.id) return;

    try {
      setContentLoading(true);
      const data = await forumService.getUserPosts(user.id, 1, 50);
      setPosts(data);

      // Filter photos (posts with images) - include stats for overlay
      const photoPosts = data.filter(p => p.image_url);
      setPhotos(photoPosts.map(p => ({
        id: p.id,
        image_url: p.image_url,
        created_at: p.created_at,
        likes_count: p.likes_count || 0,
        comments_count: p.comments_count || 0,
        views_count: p.views_count || 0,
      })));

      // Videos placeholder
      setVideos([]);
    } catch (error) {
      console.error('[ProfileFull] Load posts error:', error);
    } finally {
      setContentLoading(false);
    }
  }, [user?.id]);

  // Initial load
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await loadProfile();
      await loadPosts();
      setLoading(false);
    };

    if (user?.id) {
      loadData();
    }
  }, [user?.id]);

  // Refresh handler
  const onRefresh = async () => {
    setRefreshing(true);
    await loadProfile();
    await loadPosts();
    setRefreshing(false);
  };

  // Handle post press
  const handlePostPress = (post) => {
    navigation.navigate('Home', {
      screen: 'PostDetail',
      params: { postId: post.id },
    });
  };

  // Handle photo press
  const handlePhotoPress = (photo) => {
    navigation.navigate('Home', {
      screen: 'PostDetail',
      params: { postId: photo.id },
    });
  };

  // Tabs configuration
  const tabs = [
    { key: 'posts', label: postsLabel, Icon: FileText, count: posts.length },
    { key: 'photos', label: photosLabel, Icon: ImageIcon, count: photos.length },
    { key: 'videos', label: videosLabel, Icon: Video, count: videos.length },
  ];

  // Render tab content
  const renderContent = () => {
    if (contentLoading && posts.length === 0) {
      return (
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color={colors.gold} />
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

  // Loading state
  if (loading) {
    if (settings.theme === 'light') {
      return (
        <View style={styles.lightContainer}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.gold} />
            <Text style={styles.loadingText}>{loadingLabel}</Text>
          </View>
        </View>
      );
    }
    return (
      <LinearGradient
        colors={gradients.background}
        locations={gradients.backgroundLocations}
        style={styles.gradient}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.gold} />
          <Text style={styles.loadingText}>{loadingLabel}</Text>
        </View>
      </LinearGradient>
    );
  }

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'User';

  const renderMainContent = () => (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitleText}>{headerTitle}</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.gold}
            colors={[colors.gold]}
          />
        }
      >
        {/* Profile Header */}
        <ProfileHeader
          profile={profile}
          isOwnProfile={true}
          onEditProfile={() => navigation.navigate('ProfileSettings')}
          onSettings={() => navigation.navigate('ProfileSettings')}
          onProfileUpdate={(updates) => {
            // Refresh profile when avatar/cover is updated
            setProfile(prev => ({ ...prev, ...updates }));
          }}
        />

        {/* Profile Stats */}
        <ProfileStats
          postsCount={stats.postsCount}
          followersCount={stats.followersCount}
          followingCount={stats.followingCount}
          onPostsPress={() => setActiveTab('posts')}
          onFollowersPress={() => navigation.navigate('FollowersList', {
            userId: user?.id,
            username: profile?.username
          })}
          onFollowingPress={() => navigation.navigate('FollowingList', {
            userId: user?.id,
            username: profile?.username
          })}
        />

        {/* Tabs */}
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
                  color={isActive ? colors.gold : colors.textMuted}
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
  );

  // Light theme uses solid background, Dark theme uses gradient
  if (settings.theme === 'light') {
    return (
      <View style={styles.lightContainer}>
        {renderMainContent()}
      </View>
    );
  }

  return (
    <LinearGradient
      colors={gradients.background}
      locations={gradients.backgroundLocations}
      style={styles.gradient}
    >
      {renderMainContent()}
    </LinearGradient>
  );
};

export default ProfileFullScreen;
