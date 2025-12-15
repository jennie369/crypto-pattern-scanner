/**
 * Gemral - Forum Screen (Home Tab)
 * Week 3 Implementation with Burger Menu
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { CommonActions } from '@react-navigation/native';
import { Menu, Search, Bell, FileText, Gem, DollarSign, Music, Zap } from 'lucide-react-native';
import PostCard from './components/PostCard';
import AdCard from '../../components/Forum/AdCard';
import HeaderMessagesIcon from '../../components/HeaderMessagesIcon';
import CategoryTabs, { MAIN_TABS } from './components/CategoryTabs';
import { useSwipeNavigation } from '../../hooks/useSwipeNavigation';
import FABButton from './components/FABButton';
import SideMenu from './components/SideMenu';
import CreateFeedModal from './components/CreateFeedModal';
import EditFeedsModal from './components/EditFeedsModal';
import AuthGate from '../../components/AuthGate';
import { forumService } from '../../services/forumService';
import { forumRecommendationService } from '../../services/forumRecommendationService';
import { generateFeed, getNextFeedPage } from '../../services/feedService';
import { trackView } from '../../services/engagementService';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { COLORS, GRADIENTS, SPACING, TYPOGRAPHY, GLASS } from '../../utils/tokens';

const ForumScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [feedItems, setFeedItems] = useState([]); // New: mixed posts + ads
  const [sessionId, setSessionId] = useState(null); // Feed session ID
  const [selectedFeed, setSelectedFeed] = useState('explore'); // Main tab: explore, following, news, notifications, popular, academy
  const [selectedTopic, setSelectedTopic] = useState(null); // Topic filter: giao-dich, tinh-than, can-bang
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [useHybridFeed, setUseHybridFeed] = useState(true); // Toggle for new feed algorithm
  const lastPostIdRef = useRef(null);

  // Custom Feeds State
  const [createFeedModalOpen, setCreateFeedModalOpen] = useState(false);
  const [editFeedsModalOpen, setEditFeedsModalOpen] = useState(false);
  const [customFeeds, setCustomFeeds] = useState([]);

  // Swipe Navigation Hook - DISABLED to fix conflict with ImageCarousel
  // When user swipes on image carousel, it was also triggering tab change
  // Using tab buttons only for navigation (Instagram-style)
  const { panHandlers, canSwipeLeft, canSwipeRight } = useSwipeNavigation({
    tabs: MAIN_TABS,
    currentTab: selectedFeed,
    onTabChange: (tabId) => handleTabChange(tabId),
    enabled: false, // DISABLED - use tap on tabs instead
  });

  // Dedupe function - prevents duplicate posts
  const addNewPost = useCallback((newPost) => {
    setPosts(prevPosts => {
      // Check if post already exists by ID
      const exists = prevPosts.some(p => p.id === newPost.id);

      if (exists) {
        console.log('[ForumScreen] Post already exists, updating instead of adding:', newPost.id);
        // Update existing post instead of adding duplicate
        return prevPosts.map(p => p.id === newPost.id ? newPost : p);
      }

      console.log('[ForumScreen] Adding new post:', newPost.id);
      return [newPost, ...prevPosts];
    });
  }, []);

  // Realtime subscription for posts
  useEffect(() => {
    console.log('[ForumScreen] Setting up realtime subscription...');

    const subscription = supabase
      .channel('forum_posts_changes')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'forum_posts' },
        (payload) => {
          console.log('[ForumScreen] Realtime: New post received:', payload.new.id);
          // Use dedupe function to prevent duplicates
          addNewPost(payload.new);
        }
      )
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'forum_posts' },
        (payload) => {
          console.log('[ForumScreen] Realtime: Post updated:', payload.new.id);
          setPosts(prev => prev.map(p =>
            p.id === payload.new.id ? { ...p, ...payload.new } : p
          ));
        }
      )
      .on('postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'forum_posts' },
        (payload) => {
          console.log('[ForumScreen] Realtime: Post deleted:', payload.old.id);
          setPosts(prev => prev.filter(p => p.id !== payload.old.id));
        }
      )
      .subscribe();

    return () => {
      console.log('[ForumScreen] Cleaning up realtime subscription');
      subscription.unsubscribe();
    };
  }, [addNewPost]);

  useEffect(() => {
    setPage(1);
    setHasMore(true);
    loadPosts(true);
  }, [selectedFeed, selectedTopic]);

  // Load posts using hybrid feed algorithm or legacy method
  const loadPosts = async (reset = false) => {
    if (!hasMore && !reset) return;

    try {
      // Use new hybrid feed algorithm for "explore" tab
      if (useHybridFeed && selectedFeed === 'explore' && user?.id) {
        await loadHybridFeed(reset);
        return;
      }

      // Legacy loading for other feeds
      const currentPage = reset ? 1 : page;

      // Get posts from API with feed type and topic filter
      const rawData = await forumService.getPosts({
        feed: selectedFeed,
        topic: selectedTopic,
        page: currentPage,
        limit: 20,
      });

      // Apply recommendation sorting for "explore" feed (legacy fallback)
      let data = rawData;
      if (selectedFeed === 'explore' && reset && !useHybridFeed) {
        try {
          data = await forumRecommendationService.getForYouPosts(rawData, { limit: 20 });
          console.log('[ForumScreen] Applied recommendation sorting for "explore" feed');
        } catch (recError) {
          console.warn('[ForumScreen] Recommendation service error, using default order:', recError);
        }
      }

      // Convert to feed items format (posts only, no ads for non-explore)
      const feedItemsData = data.map(post => ({ type: 'post', data: post }));

      if (reset) {
        setPosts(data);
        setFeedItems(feedItemsData);
        lastPostIdRef.current = data[data.length - 1]?.id || null;
      } else {
        // Dedupe before appending
        setPosts(prev => {
          const existingIds = new Set(prev.map(p => p.id));
          const newPosts = data.filter(p => !existingIds.has(p.id));
          return [...prev, ...newPosts];
        });
        setFeedItems(prev => {
          const existingIds = new Set(prev.map(item => item.data?.id));
          const newItems = feedItemsData.filter(item => !existingIds.has(item.data?.id));
          return [...prev, ...newItems];
        });
        lastPostIdRef.current = data[data.length - 1]?.id || null;
      }

      setHasMore(rawData.length === 20);
      setPage(currentPage + 1);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  };

  // New: Load feed using hybrid algorithm with ads
  const loadHybridFeed = async (reset = false) => {
    try {
      console.log('[ForumScreen] Loading hybrid feed...');

      if (reset) {
        // Generate new feed with new session
        const result = await generateFeed(user.id, null, 30);

        setFeedItems(result.feed);
        setSessionId(result.sessionId);
        setHasMore(result.hasMore);

        // Extract posts for legacy compatibility
        const postsOnly = result.feed
          .filter(item => item.type === 'post')
          .map(item => item.data);
        setPosts(postsOnly);

        // Track last post ID for pagination
        lastPostIdRef.current = postsOnly[postsOnly.length - 1]?.id || null;

        console.log('[ForumScreen] Hybrid feed loaded:', result.feed.length, 'items');
      } else {
        // Load next page
        if (!lastPostIdRef.current) return;

        const result = await getNextFeedPage(user.id, sessionId, lastPostIdRef.current, 30);

        // Dedupe feed items before appending
        setFeedItems(prev => {
          const existingIds = new Set(prev.map(item => item.data?.id));
          const newItems = result.feed.filter(item => !existingIds.has(item.data?.id));
          return [...prev, ...newItems];
        });
        setHasMore(result.hasMore);

        // Extract posts for legacy compatibility with deduplication
        const postsOnly = result.feed
          .filter(item => item.type === 'post')
          .map(item => item.data);
        setPosts(prev => {
          const existingIds = new Set(prev.map(p => p.id));
          const newPosts = postsOnly.filter(p => !existingIds.has(p.id));
          return [...prev, ...newPosts];
        });

        // Update last post ID
        lastPostIdRef.current = postsOnly[postsOnly.length - 1]?.id || null;

        console.log('[ForumScreen] Next page loaded:', result.feed.length, 'items');
      }
    } catch (error) {
      console.error('[ForumScreen] Error loading hybrid feed:', error);
      // Fallback to legacy loading
      setUseHybridFeed(false);
      const currentPage = reset ? 1 : page;
      const rawData = await forumService.getPosts({
        feed: selectedFeed,
        topic: selectedTopic,
        page: currentPage,
        limit: 20,
      });
      const feedItemsData = rawData.map(post => ({ type: 'post', data: post }));
      if (reset) {
        setPosts(rawData);
        setFeedItems(feedItemsData);
      } else {
        // Dedupe before appending
        setPosts(prev => {
          const existingIds = new Set(prev.map(p => p.id));
          const newPosts = rawData.filter(p => !existingIds.has(p.id));
          return [...prev, ...newPosts];
        });
        setFeedItems(prev => {
          const existingIds = new Set(prev.map(item => item.data?.id));
          const newItems = feedItemsData.filter(item => !existingIds.has(item.data?.id));
          return [...prev, ...newItems];
        });
      }
      setHasMore(rawData.length === 20);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setPage(1);
    setHasMore(true);
    await loadPosts(true);
    setRefreshing(false);
  }, [selectedFeed, selectedTopic]);

  const onEndReached = () => {
    if (!loading && hasMore) {
      loadPosts(false);
    }
  };

  const handleFeedChange = (feedType) => {
    setSelectedFeed(feedType);
    setPosts([]);
    setPage(1);
    setMenuOpen(false);
  };

  const handleQuickAction = async (action) => {
    setLoading(true);
    setPosts([]);
    try {
      if (action === 'liked') {
        const data = await forumService.getLikedPosts();
        setPosts(data);
        setSelectedFeed('liked');
      } else if (action === 'saved') {
        const data = await forumService.getSavedPosts();
        setPosts(data);
        setSelectedFeed('saved');
      }
    } catch (error) {
      console.error('Error loading quick action:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load custom feeds on mount
  useEffect(() => {
    loadCustomFeeds();
  }, []);

  const loadCustomFeeds = async () => {
    const feeds = await forumService.getCustomFeeds();
    setCustomFeeds(feeds);
  };

  // Custom Feed Handlers
  const handleCreateFeed = async (newFeed) => {
    const result = await forumService.createCustomFeed(newFeed);
    if (result.success) {
      setCustomFeeds([...customFeeds, result.feed]);
    } else {
      console.error('Failed to create feed:', result.error);
    }
  };

  const handleEditFeed = (feed) => {
    // Open create modal with pre-populated data
    // For now, just open create modal (can enhance later)
    setCreateFeedModalOpen(true);
  };

  const handleDeleteFeed = async (feedId) => {
    const result = await forumService.deleteCustomFeed(feedId);
    if (result.success) {
      setCustomFeeds(customFeeds.filter(f => f.id !== feedId));
    } else {
      console.error('Failed to delete feed:', result.error);
    }
  };

  const handleReorderFeeds = async (newOrder) => {
    setCustomFeeds(newOrder);
    const feedIds = newOrder.map(f => f.id);
    await forumService.reorderCustomFeeds(feedIds);
  };

  // Track post view for recommendation algorithm
  const handlePostPress = (post) => {
    // Track the view using new engagement service (non-blocking)
    if (user?.id) {
      trackView(user.id, post.id, 0, sessionId).catch(err => {
        console.warn('[ForumScreen] Failed to track view:', err);
      });
    }
    // Also track with legacy system
    forumRecommendationService.trackView(post).catch(err => {
      console.warn('[ForumScreen] Failed to track view (legacy):', err);
    });
    // Navigate to post detail
    navigation.navigate('PostDetail', { postId: post.id, sessionId });
  };

  // Handle ad press - navigate to appropriate screen
  const handleAdPress = (ad) => {
    if (ad.link.startsWith('/upgrade')) {
      navigation.navigate('Shop', { screen: 'Pricing' });
    } else if (ad.link.startsWith('/academy')) {
      navigation.navigate('Courses');
    }
  };

  /**
   * Navigate to Account tab with a specific subscreen
   * First navigates to Account tab, then pushes the subscreen
   * Back button will correctly return to AssetsHome
   */
  const navigateToAccountScreen = (screenName) => {
    // Navigate to Account tab with nested screen
    navigation.navigate('Account', {
      screen: screenName,
      initial: false, // This ensures back goes to AssetsHome, not Home tab
    });
  };

  // Render feed item (post or ad)
  const renderFeedItem = ({ item, index }) => {
    if (item.type === 'ad') {
      return (
        <AdCard
          ad={item.data}
          sessionId={sessionId}
          onPress={handleAdPress}
        />
      );
    }

    // Regular post
    return (
      <PostCard
        post={item.data}
        onPress={() => handlePostPress(item.data)}
        sessionId={sessionId}
      />
    );
  };

  const getFeedTitle = () => {
    const titles = {
      'explore': 'Dành cho bạn',
      'following': 'Đang theo dõi',
      'news': 'Tin tức',
      'notifications': 'Thông báo',
      'popular': 'Phổ biến',
      'academy': 'Academy',
      'liked': 'Đã Thích',
      'saved': 'Đã Lưu',
    };
    return titles[selectedFeed] || 'Bảng Tin';
  };

  // Handle tab change from CategoryTabs
  const handleTabChange = (tabId) => {
    setSelectedFeed(tabId);
    setPosts([]);
    setPage(1);
    setHasMore(true);
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <FileText size={64} color={COLORS.textMuted} strokeWidth={1.5} />
      <Text style={styles.emptyTitle}>Chưa có bài viết</Text>
      <Text style={styles.emptySubtitle}>Hãy là người đầu tiên chia sẻ!</Text>
    </View>
  );

  const renderFooter = () => {
    if (!hasMore) return null;
    return (
      <View style={styles.footer}>
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
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.gold} />
          <Text style={styles.loadingText}>Đang tải...</Text>
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
        {/* Header with Burger Menu */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => setMenuOpen(true)}
          >
            <Menu size={24} color={COLORS.textPrimary} strokeWidth={2} />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Gemral</Text>
            <Text style={styles.headerSubtitle}>{getFeedTitle()}</Text>
          </View>

          <View style={styles.headerIcons}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => navigation.navigate('Search')}
            >
              <Search size={22} color={COLORS.textPrimary} />
            </TouchableOpacity>
            {/* Messages Icon with unread badge */}
            <HeaderMessagesIcon />
            <TouchableOpacity style={styles.iconButton}>
              <Bell size={22} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Side Menu */}
        <SideMenu
          isOpen={menuOpen}
          onClose={() => setMenuOpen(false)}
          selectedFeed={selectedFeed}
          onFeedSelect={handleFeedChange}
          onQuickAction={handleQuickAction}
          onCreateFeed={() => setCreateFeedModalOpen(true)}
          onEditFeeds={() => setEditFeedsModalOpen(true)}
          customFeeds={customFeeds}
        />

        {/* ═══════════════════════════════════════════ */}
        {/* HEADER SHORTCUTS - Quick Access to Creator Tools */}
        {/* ═══════════════════════════════════════════ */}
        {user && (
          <View style={styles.headerShortcuts}>
            <TouchableOpacity
              style={styles.shortcutBtn}
              onPress={() => navigateToAccountScreen('Wallet')}
            >
              <View style={[styles.shortcutIcon, { backgroundColor: 'rgba(255, 189, 89, 0.15)' }]}>
                <Gem size={16} color={COLORS.gold} />
              </View>
              <Text style={styles.shortcutText}>Ví Gems</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.shortcutBtn}
              onPress={() => navigateToAccountScreen('Earnings')}
            >
              <View style={[styles.shortcutIcon, { backgroundColor: 'rgba(58, 247, 166, 0.15)' }]}>
                <DollarSign size={16} color={COLORS.success} />
              </View>
              <Text style={styles.shortcutText}>Thu Nhập</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.shortcutBtn}
              onPress={() => navigateToAccountScreen('SoundLibrary')}
            >
              <View style={[styles.shortcutIcon, { backgroundColor: 'rgba(106, 91, 255, 0.15)' }]}>
                <Music size={16} color={COLORS.purple} />
              </View>
              <Text style={styles.shortcutText}>Âm Thanh</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.shortcutBtn}
              onPress={() => navigateToAccountScreen('BoostedPosts')}
            >
              <View style={[styles.shortcutIcon, { backgroundColor: 'rgba(255, 140, 0, 0.15)' }]}>
                <Zap size={16} color="#FF8C00" />
              </View>
              <Text style={styles.shortcutText}>Boost</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Create Feed Modal */}
        <CreateFeedModal
          isOpen={createFeedModalOpen}
          onClose={() => setCreateFeedModalOpen(false)}
          onCreateFeed={handleCreateFeed}
        />

        {/* Edit Feeds Modal */}
        <EditFeedsModal
          isOpen={editFeedsModalOpen}
          onClose={() => setEditFeedsModalOpen(false)}
          feeds={customFeeds}
          onReorder={handleReorderFeeds}
          onEdit={handleEditFeed}
          onDelete={handleDeleteFeed}
          onCreateNew={() => {
            setEditFeedsModalOpen(false);
            setCreateFeedModalOpen(true);
          }}
        />

        {/* Main Feed Tabs */}
        <CategoryTabs
          selected={selectedFeed}
          onSelect={handleTabChange}
        />

        {/* Posts Feed - with swipe navigation */}
        <Animated.View style={{ flex: 1 }} {...panHandlers}>
          <FlatList
            data={feedItems.length > 0 ? feedItems : posts.map(p => ({ type: 'post', data: p }))}
            renderItem={renderFeedItem}
            keyExtractor={(item, index) =>
              item.type === 'ad'
                ? `ad-${item.data?.id || 'unknown'}-${index}`
                : `post-${item.data?.id || 'unknown'}-${index}`
            }
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={COLORS.gold}
                colors={[COLORS.gold]}
              />
            }
            onEndReached={onEndReached}
            onEndReachedThreshold={0.5}
            ListEmptyComponent={renderEmptyState}
            ListFooterComponent={renderFooter}
          />
        </Animated.View>

        {/* FAB - Wrapped with AuthGate */}
        <AuthGate action="tạo bài viết mới">
          <FABButton onPress={() => navigation.navigate('CreatePost')} />
        </AuthGate>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1
  },
  container: {
    flex: 1
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    backgroundColor: GLASS.background,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 189, 89, 0.2)',
  },
  menuButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  headerSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gold,
    marginTop: -2,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  iconButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: 120,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textSecondary,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
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
  },
  footer: {
    paddingVertical: SPACING.lg,
    alignItems: 'center',
  },

  // ═══════════════════════════════════════════
  // HEADER SHORTCUTS STYLES
  // ═══════════════════════════════════════════
  headerShortcuts: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: GLASS.background,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(106, 91, 255, 0.15)',
  },
  shortcutBtn: {
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  shortcutIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shortcutText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
});

export default ForumScreen;
