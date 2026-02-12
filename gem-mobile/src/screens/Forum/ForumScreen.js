/**
 * Gemral - Forum Screen (Home Tab)
 * Week 3 Implementation with Burger Menu
 */

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
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
  DeviceEventEmitter,
} from 'react-native';
import CustomAlert, { useCustomAlert } from '../../components/CustomAlert';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { CommonActions, useScrollToTop, useFocusEffect } from '@react-navigation/native';
import { Menu, Search, Bell, FileText, Gem, DollarSign, Music, Zap, RotateCcw } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import PostCard from './components/PostCard';
import AdCard from '../../components/Forum/AdCard';
// Performance & Loading Components
import { PostSkeletonList, ScrollToTopButton } from '../../components/Forum';
import performanceService from '../../services/performanceService';
import HeaderMessagesIcon from '../../components/HeaderMessagesIcon';
import CategoryTabs from './components/CategoryTabs';
// FeedTabs removed - using CategoryTabs only
import FABButton from './components/FABButton';
import SideMenu from './components/SideMenu';
import CreateFeedModal from './components/CreateFeedModal';
import EditFeedsModal from './components/EditFeedsModal';
import AuthGate from '../../components/AuthGate';
import { useSponsorBanners } from '../../components/SponsorBannerSection';
import SponsorBanner from '../../components/SponsorBanner';
import { injectBannersIntoFeed } from '../../utils/bannerDistribution';
import { forumService } from '../../services/forumService';
import { hashtagService } from '../../services/hashtagService';
import { forumRecommendationService } from '../../services/forumRecommendationService';
import { generateFeed, getNextFeedPage, resetAllImpressions, getImpressionStats, trackVisibleImpressions, invalidateFeedCache } from '../../services/feedService';
import boostService from '../../services/boostService';
import { trackView } from '../../services/engagementService';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { COLORS, GRADIENTS, SPACING, TYPOGRAPHY, GLASS } from '../../utils/tokens';
import { CONTENT_BOTTOM_PADDING } from '../../constants/layout';
import { FORCE_REFRESH_EVENT, RESET_LOADING_EVENT, registerLoadingReset } from '../../utils/loadingStateManager';

// Global forum cache - persists data between tab switches
const forumCache = {
  posts: null,
  feedItems: null,
  sessionId: null,
  lastFetch: 0,
  CACHE_DURATION: 30000, // 30 seconds cache
};

// ============================================================
// FLATLIST OPTIMIZATION CONSTANTS
// ============================================================

// Estimated post heights for getItemLayout (improves scroll performance)
const POST_ITEM_HEIGHTS = {
  TEXT_ONLY: 200,      // Post chỉ có text
  WITH_IMAGE: 450,     // Post có 1 ảnh
  WITH_CAROUSEL: 500,  // Post có nhiều ảnh
  SPONSOR_BANNER: 120, // Sponsor banner height
  AD_CARD: 280,        // Ad card height
  AVERAGE: 400,        // Trung bình cho tất cả types
};

// FlatList optimization config
const FLATLIST_CONFIG = {
  INITIAL_NUM_TO_RENDER: 6,      // Giảm từ 10 để render nhanh hơn
  MAX_TO_RENDER_PER_BATCH: 8,    // Giảm từ 20 để giảm memory
  WINDOW_SIZE: 5,                // Giảm từ 10 để render ít items off-screen
  UPDATE_CELLS_BATCHING_PERIOD: 50, // Batch updates
  REMOVE_CLIPPED_SUBVIEWS: true, // Memory optimization
};

// Cache size limits to prevent memory overflow
const MAX_CACHE_SIZE = 300;
const MAX_TRACKED_POSTS = 500;

// Feed loading timeout - prevents infinite spinner
// Individual Supabase DB queries now abort at 8s (see supabase.js global.fetch),
// so 10s is enough headroom for 3 parallel queries + processing.
const FEED_LOAD_TIMEOUT = 10000; // 10 seconds
const FEED_LOADMORE_TIMEOUT = 8000; // 8 seconds for pagination
const TIMEOUT_RETRY_COOLDOWN = 3000; // 3 second cooldown between retries after timeout

// Helper: wrap a promise with timeout
const withTimeout = (promise, ms, label = 'operation') => {
  let timeoutId;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(`[FeedTimeout] ${label} timed out after ${ms}ms`)), ms);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timeoutId));
};

const ForumScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { alert, AlertComponent } = useCustomAlert();
  const insets = useSafeAreaInsets(); // Get safe area insets for proper header positioning

  // Sponsor banners - use hook to fetch ALL banners for distribution
  const { banners: sponsorBanners, dismissBanner, userId: bannerUserId } = useSponsorBanners('forum', null);

  // Initialize from cache if available for instant display
  const [posts, setPosts] = useState(() => forumCache.posts || []);
  const [feedItems, setFeedItems] = useState(() => forumCache.feedItems || []); // New: mixed posts + ads
  const [sessionId, setSessionId] = useState(() => forumCache.sessionId); // Feed session ID
  const [selectedFeed, setSelectedFeed] = useState('explore'); // Main tab: explore, following, news, notifications, popular, academy
  const [selectedTopic, setSelectedTopic] = useState(null); // Topic filter: giao-dich, tinh-than, can-bang
  // feedType removed - explore always uses 'hot' algorithm
  // Only show loading if no cached data
  const [loading, setLoading] = useState(!forumCache.posts || forumCache.posts.length === 0);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [useHybridFeed, setUseHybridFeed] = useState(true); // Toggle for new feed algorithm
  const [loadingMore, setLoadingMore] = useState(false); // Track infinite scroll loading state
  const [showScrollToTop, setShowScrollToTop] = useState(false); // Scroll-to-top FAB visibility
  const SCROLL_TO_TOP_THRESHOLD = 800; // Show button after scrolling this many pixels
  const lastPostIdRef = useRef(null);
  const lastCreatedAtRef = useRef(null); // Track last post created_at for pagination
  const loadMoreStartTimeRef = useRef(null); // Track when loadMore started for stuck detection
  const lastTimeoutRef = useRef(0); // Cooldown after timeout to prevent retry loops

  // Request ID for cancelling stale requests when user switches tabs quickly
  const currentRequestIdRef = useRef(0);

  // FlatList ref for scroll to top
  const flatListRef = useRef(null);

  // Enable scroll to top when tab is pressed (React Navigation hook)
  useScrollToTop(flatListRef);

  // Header hide/show on scroll - smoother approach with velocity detection
  const lastScrollY = useRef(0);
  const scrollVelocity = useRef(0); // Track scroll speed
  const lastScrollTime = useRef(Date.now());
  // Dynamic header height - measured via onLayout for accuracy
  const [headerHeight, setHeaderHeight] = useState(170); // Initial estimate
  const HEADER_MAX_HEIGHT = headerHeight + insets.top; // Total height including status bar
  const headerTranslateY = useRef(new Animated.Value(0)).current;
  const isHeaderVisible = useRef(true);
  const isAnimating = useRef(false);
  const animationCooldown = useRef(false); // Prevent rapid re-triggering
  const SCROLL_THRESHOLD = 100; // Only trigger after scrolling this much from top (reduced for responsiveness)
  const VELOCITY_THRESHOLD = 0.5; // Minimum velocity to trigger hide (pixels/ms) - reduced for smoother feel
  const COOLDOWN_MS = 150; // Cooldown between animations - reduced for responsiveness

  // Measure header height on layout
  const onHeaderLayout = useCallback((event) => {
    const { height } = event.nativeEvent.layout;
    if (height > 0 && height !== headerHeight) {
      setHeaderHeight(height);
    }
  }, [headerHeight]);


  // Custom Feeds State
  const [createFeedModalOpen, setCreateFeedModalOpen] = useState(false);
  const [editFeedsModalOpen, setEditFeedsModalOpen] = useState(false);
  const [customFeeds, setCustomFeeds] = useState([]);

  // Trending hashtags - prefetched for instant SideMenu display
  const [trendingHashtags, setTrendingHashtags] = useState([]);
  const trendingLastFetchRef = useRef(0);
  const TRENDING_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  // Viewability tracking - track impressions only when posts become visible
  const trackedPostIds = useRef(new Set());

  // Store user.id and sessionId in refs for stable callback reference
  const userIdRef = useRef(user?.id);
  const sessionIdRef = useRef(sessionId);

  // Keep refs in sync
  useEffect(() => {
    userIdRef.current = user?.id;
  }, [user?.id]);

  useEffect(() => {
    sessionIdRef.current = sessionId;
  }, [sessionId]);

  // ============================================================
  // MEMORY LEAK FIX: Cleanup trackedPostIds periodically
  // ============================================================
  useEffect(() => {
    const CLEANUP_INTERVAL = 60000; // 1 phút

    const cleanupInterval = setInterval(() => {
      if (trackedPostIds.current && trackedPostIds.current.size > MAX_TRACKED_POSTS) {
        console.log('[ForumScreen] Cleaning up trackedPostIds:', trackedPostIds.current.size, '->', 0);
        trackedPostIds.current.clear();
      }
    }, CLEANUP_INTERVAL);

    return () => {
      clearInterval(cleanupInterval);
      // Clear on unmount
      if (trackedPostIds.current) {
        trackedPostIds.current.clear();
      }
    };
  }, []);

  // ============================================================
  // SELF-HEALING: Register with global loading state manager
  // Ensures stuck loading states are cleared on app resume
  // ============================================================
  useEffect(() => {
    const unregister = registerLoadingReset('ForumScreen', () => {
      console.log('[ForumScreen] Global loading state reset triggered');
      setLoadingMore(false);
      setLoading(false);
      setRefreshing(false);
    });

    // Also listen for RESET_LOADING_EVENT directly as a safety net
    const resetListener = DeviceEventEmitter.addListener(RESET_LOADING_EVENT, () => {
      console.log('[ForumScreen] RESET_LOADING_EVENT received - clearing stuck states');
      setLoadingMore(false);
      setLoading(false);
      setRefreshing(false);
    });

    return () => {
      unregister();
      resetListener.remove();
    };
  }, []);

  // ============================================================
  // CACHE SIZE LIMIT: Trim cache to prevent memory overflow
  // ============================================================
  const trimCache = useCallback(() => {
    if (forumCache.posts && forumCache.posts.length > MAX_CACHE_SIZE) {
      console.log('[ForumScreen] Trimming cache from', forumCache.posts.length, 'to', MAX_CACHE_SIZE);
      forumCache.posts = forumCache.posts.slice(0, MAX_CACHE_SIZE);
      if (forumCache.feedItems) {
        forumCache.feedItems = forumCache.feedItems.slice(0, MAX_CACHE_SIZE);
      }
    }
  }, []);

  // ============================================================
  // GETITEMLAYOUT: Improve FlatList scroll performance
  // ============================================================
  const getItemLayout = useCallback((data, index) => {
    // Safety check
    if (!data || index < 0) {
      return {
        length: POST_ITEM_HEIGHTS.AVERAGE,
        offset: POST_ITEM_HEIGHTS.AVERAGE * index,
        index,
      };
    }

    const item = data[index];
    let height = POST_ITEM_HEIGHTS.AVERAGE;

    if (item) {
      // Determine height based on item type
      if (item.type === 'sponsor_banner') {
        height = POST_ITEM_HEIGHTS.SPONSOR_BANNER;
      } else if (item.type === 'ad') {
        height = POST_ITEM_HEIGHTS.AD_CARD;
      } else if (item.type === 'post' && item.data) {
        // Estimate post height based on content
        const post = item.data;
        const images = post?.media_urls || post?.images || [];

        if (images.length > 1) {
          height = POST_ITEM_HEIGHTS.WITH_CAROUSEL;
        } else if (images.length === 1 || post?.image_url) {
          height = POST_ITEM_HEIGHTS.WITH_IMAGE;
        } else {
          height = POST_ITEM_HEIGHTS.TEXT_ONLY;
        }
      }
    }

    return {
      length: height,
      offset: height * index,
      index,
    };
  }, []);

  // Viewability config - item is considered "viewed" when 50% visible for 300ms
  // FIXED: Reduced minimumViewTime from 500ms to 300ms for faster tracking
  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
    minimumViewTime: 300,
  }).current;

  // Track visible posts as impressions
  // FIXED: Use refs instead of state values to keep callback stable
  // React Native FlatList requires stable onViewableItemsChanged reference
  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    const userId = userIdRef.current;
    if (!userId) return;

    // Use sessionId or fallback to a default session
    const effectiveSessionId = sessionIdRef.current || 'default_session';

    // Filter to only posts we haven't tracked yet
    const newlyVisiblePosts = viewableItems.filter(viewableItem => {
      const item = viewableItem.item;
      if (item.type !== 'post' || !item.data?.id) return false;
      if (trackedPostIds.current.has(item.data.id)) return false;
      return true;
    }).map(v => v.item);

    if (newlyVisiblePosts.length > 0) {
      console.log(`[ForumScreen] 📍 Tracking ${newlyVisiblePosts.length} visible posts (session: ${effectiveSessionId})`);

      // Mark these as tracked
      newlyVisiblePosts.forEach(item => {
        trackedPostIds.current.add(item.data.id);
      });

      // Track impressions in background (non-blocking)
      trackVisibleImpressions(userId, effectiveSessionId, newlyVisiblePosts).catch(err => {
        console.warn('[ForumScreen] Failed to track visible impressions:', err);
      });
    }
  }).current;

  // Dedupe function - prevents duplicate posts
  // Also updates feedItems for hybrid feed compatibility
  const addNewPost = useCallback(async (newPost) => {
    // Check if this is user's own post (show immediately at top)
    const isOwnPost = newPost.user_id === user?.id;

    // Fetch full post data with profiles and relations for proper display
    let fullPost = newPost;
    try {
      const { data } = await supabase
        .from('forum_posts')
        .select(`
          *,
          profiles:user_id (
            id, username, full_name, avatar_url, role, scanner_tier
          ),
          categories:category_id (id, name, color)
        `)
        .eq('id', newPost.id)
        .single();

      if (data) {
        fullPost = {
          ...data,
          author: data.profiles,
          category: data.categories,
          feed_source: isOwnPost ? 'own' : 'realtime',
          is_own_post: isOwnPost,
        };
      }
    } catch (err) {
      console.warn('[ForumScreen] Could not fetch full post data:', err);
    }

    // Update posts state
    setPosts(prevPosts => {
      const exists = prevPosts.some(p => p.id === newPost.id);
      if (exists) {
        console.log('[ForumScreen] Post already exists, updating instead of adding:', newPost.id);
        return prevPosts.map(p => p.id === newPost.id ? fullPost : p);
      }
      console.log('[ForumScreen] Adding new post:', newPost.id, isOwnPost ? '(own post)' : '');
      return [fullPost, ...prevPosts];
    });

    // Also update feedItems for hybrid feed
    setFeedItems(prevItems => {
      const exists = prevItems.some(item => item.data?.id === newPost.id);
      if (exists) {
        return prevItems.map(item =>
          item.data?.id === newPost.id ? { type: 'post', data: fullPost } : item
        );
      }
      // Add to beginning (newest first)
      return [{ type: 'post', data: fullPost }, ...prevItems];
    });
  }, [user?.id]);

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
          // Update posts state
          setPosts(prev => prev.map(p =>
            p.id === payload.new.id ? { ...p, ...payload.new } : p
          ));
          // ALSO update feedItems state (this is what FlatList renders!)
          setFeedItems(prev => prev.map(item => {
            if (item.type === 'post' && item.data?.id === payload.new.id) {
              return {
                ...item,
                data: { ...item.data, ...payload.new }
              };
            }
            return item;
          }));
        }
      )
      .on('postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'forum_posts' },
        (payload) => {
          console.log('[ForumScreen] Realtime: Post deleted:', payload.old.id);
          // Update posts state
          setPosts(prev => prev.filter(p => p.id !== payload.old.id));
          // ALSO update feedItems state (this is what FlatList renders!)
          setFeedItems(prev => prev.filter(item =>
            !(item.type === 'post' && item.data?.id === payload.old.id)
          ));
        }
      )
      .subscribe();

    return () => {
      console.log('[ForumScreen] Cleaning up realtime subscription');
      subscription.unsubscribe();
    };
  }, [addNewPost]);

  // Listen for post updated events from EditPostScreen
  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener('postUpdated', (updatedPost) => {
      console.log('[ForumScreen] Received postUpdated event:', updatedPost.id);

      // Update posts state
      setPosts(prev => prev.map(p =>
        p.id === updatedPost.id ? { ...p, ...updatedPost } : p
      ));

      // Update feedItems state (this is what FlatList renders!)
      setFeedItems(prev => prev.map(item => {
        if (item.type === 'post' && item.data?.id === updatedPost.id) {
          return {
            ...item,
            data: { ...item.data, ...updatedPost }
          };
        }
        return item;
      }));
    });

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    const now = Date.now();
    const cacheExpired = now - forumCache.lastFetch > forumCache.CACHE_DURATION;

    // Only load if cache expired or feed/topic changed
    if (cacheExpired || !forumCache.posts || forumCache.posts.length === 0) {
      setPage(1);
      setHasMore(true);
      loadPosts(true);
    } else {
      // Use cached data, no need to reload
      setLoading(false);
    }
  }, [selectedFeed, selectedTopic]);

  // Refetch when screen gains focus if cache is stale
  useFocusEffect(
    useCallback(() => {
      const now = Date.now();
      const cacheExpired = now - forumCache.lastFetch > forumCache.CACHE_DURATION;
      if (cacheExpired && forumCache.posts && forumCache.posts.length > 0) {
        loadPosts(true);
      }
    }, [selectedFeed, selectedTopic])
  );

  // Listen for FORCE_REFRESH_EVENT from health monitor / recovery system
  // CRITICAL: Reset ALL stuck states BEFORE attempting to reload
  useEffect(() => {
    const listener = DeviceEventEmitter.addListener(FORCE_REFRESH_EVENT, () => {
      console.log('[ForumScreen] Force refresh event received - resetting all states');

      // CRITICAL: Reset stuck loading states FIRST
      setLoadingMore(false);
      setLoading(false);
      setRefreshing(false);

      // Reset pagination to allow fresh fetch
      setHasMore(true);
      setPage(1);
      lastPostIdRef.current = null;
      lastCreatedAtRef.current = null;
      lastTimeoutRef.current = 0; // Clear timeout cooldown
      loadMoreStartTimeRef.current = null;

      // Invalidate caches
      forumCache.lastFetch = 0;
      if (user?.id) {
        invalidateFeedCache(user.id);
      }

      // Now reload with clean state
      loadPosts(true);
    });
    return () => listener.remove();
  }, [selectedFeed, selectedTopic, user?.id]);

  // Load posts using hybrid feed algorithm or legacy method
  // INFINITE SCROLL: Always try to load more, never set hasMore to false permanently
  const loadPosts = async (reset = false) => {
    // Prevent double loading
    if (loadingMore && !reset) return;
    if (!reset && !hasMore) return;

    // Generate unique request ID for this load to handle race conditions
    // When user switches tabs quickly, older requests will be ignored
    const requestId = reset ? ++currentRequestIdRef.current : currentRequestIdRef.current;

    // Track load performance (dev only)
    performanceService.startMeasure(`loadPosts.${reset ? 'reset' : 'page'}`);

    // Check and expire overdue boosts on feed refresh
    if (reset) {
      boostService.checkAndExpireBoosts().catch(err =>
        console.warn('[ForumScreen] checkAndExpireBoosts error:', err)
      );
    }

    try {
      if (!reset) setLoadingMore(true);

      // Use new hybrid feed algorithm for "explore" tab
      if (useHybridFeed && selectedFeed === 'explore' && user?.id) {
        await loadHybridFeed(reset, requestId);
        return;
      }

      // ============================================
      // UNIFIED FEED SYSTEM for ALL feeds
      // All feeds now have: scoring, impressions tracking, ads, infinite scroll
      // ============================================
      const currentPage = reset ? 1 : page;

      console.log(`[ForumScreen] Loading ${selectedFeed} feed, page ${currentPage}, requestId: ${requestId}`);

      // Get posts from API with feed type and topic filter
      // OPTIMIZED: Reduced limit for faster initial load
      const result = await forumService.getPosts({
        feed: selectedFeed,
        topic: selectedTopic,
        page: currentPage,
        limit: 20,
        sortBy: selectedFeed === 'explore' ? 'hot' : 'latest',
      });

      // RACE CONDITION FIX: Check if this request is still current
      // If user switched tabs while loading, ignore this stale response
      if (requestId !== currentRequestIdRef.current) {
        console.log(`[ForumScreen] Ignoring stale response (requestId: ${requestId}, current: ${currentRequestIdRef.current})`);
        return;
      }

      // Handle new return format - posts is now an array of { type: 'post'/'ad', data: {...} }
      const feedData = result.posts || [];
      const newSessionId = result.sessionId;
      const hasMoreData = result.hasMore;

      // Extract pure posts for legacy compatibility
      const postsOnly = feedData
        .filter(item => item.type === 'post')
        .map(item => item.data);

      console.log(`[ForumScreen] Loaded ${postsOnly.length} posts, ${feedData.length - postsOnly.length} ads`);

      if (reset) {
        setPosts(postsOnly);
        setFeedItems(feedData);
        setSessionId(newSessionId);
        lastPostIdRef.current = postsOnly[postsOnly.length - 1]?.id || null;
        lastCreatedAtRef.current = postsOnly[postsOnly.length - 1]?.created_at || null;

        // Update cache for instant display on tab switch
        forumCache.posts = postsOnly;
        forumCache.feedItems = feedData;
        forumCache.sessionId = newSessionId;
        forumCache.lastFetch = Date.now();
        trimCache(); // Prevent memory overflow
      } else {
        // Dedupe before appending
        setPosts(prev => {
          const existingIds = new Set(prev.map(p => p.id));
          const newPosts = postsOnly.filter(p => !existingIds.has(p.id));
          console.log(`[ForumScreen] Adding ${newPosts.length} new posts (deduped from ${postsOnly.length})`);
          return [...prev, ...newPosts];
        });
        setFeedItems(prev => {
          const existingIds = new Set(prev.map(item => item.data?.id));
          const newItems = feedData.filter(item => !existingIds.has(item.data?.id));
          return [...prev, ...newItems];
        });
        lastPostIdRef.current = postsOnly[postsOnly.length - 1]?.id || null;
        lastCreatedAtRef.current = postsOnly[postsOnly.length - 1]?.created_at || null;
      }

      // INFINITE SCROLL: Only stop if we got 0 new posts
      setHasMore(hasMoreData);
      setPage(currentPage + 1);

      console.log(`[ForumScreen] ${selectedFeed} feed: ${postsOnly.length} posts, hasMore: ${hasMoreData}`);
    } catch (error) {
      console.error('Error loading posts:', error);
      // On error, still allow retry (only if this is still the current request)
      if (requestId === currentRequestIdRef.current) {
        setHasMore(true);
      }
    } finally {
      // End performance measurement (dev only)
      performanceService.endMeasure(`loadPosts.${reset ? 'reset' : 'page'}`, 2500);
      // Only update loading states if this is still the current request
      if (requestId === currentRequestIdRef.current) {
        setLoading(false);
        setLoadingMore(false);
        loadMoreStartTimeRef.current = null;
      }
    }
  };

  // New: Load feed using hybrid algorithm with ads
  // INFINITE SCROLL: Always allow more loading
  const loadHybridFeed = async (reset = false, requestId) => {
    // Track hybrid feed load performance (dev only)
    performanceService.startMeasure(`loadHybridFeed.${reset ? 'reset' : 'page'}`);

    try {
      if (!reset) setLoadingMore(true);
      console.log('[ForumScreen] Loading hybrid feed...', reset ? 'RESET' : `page after ${lastPostIdRef.current}`, `requestId: ${requestId}`);

      if (reset) {
        // Generate new feed with new session - with timeout to prevent infinite hang
        const result = await withTimeout(
          generateFeed(user.id, null, 15, false, true),
          FEED_LOAD_TIMEOUT,
          'generateFeed'
        );

        // RACE CONDITION FIX: Check if this request is still current
        if (requestId !== currentRequestIdRef.current) {
          console.log(`[ForumScreen] Ignoring stale hybrid feed response (requestId: ${requestId}, current: ${currentRequestIdRef.current})`);
          return;
        }

        // Extract posts for legacy compatibility
        const postsOnly = result.feed
          .filter(item => item.type === 'post')
          .map(item => item.data);

        // SELF-HEALING: If API returned empty on reset, keep cached data visible
        if (postsOnly.length === 0 && feedItems.length > 0) {
          console.log('[ForumScreen] Empty feed response on reset - keeping cached data');
          setHasMore(true); // Allow retry
          return;
        }

        setFeedItems(result.feed);
        setSessionId(result.sessionId);
        setPosts(postsOnly);

        // Track last post ID and created_at for pagination
        const lastPost = postsOnly[postsOnly.length - 1];
        lastPostIdRef.current = lastPost?.id || null;
        lastCreatedAtRef.current = lastPost?.created_at || null;

        // INFINITE SCROLL: Always hasMore if we got any data
        setHasMore(postsOnly.length > 0);

        // Update cache for instant display on tab switch
        forumCache.posts = postsOnly;
        forumCache.feedItems = result.feed;
        forumCache.sessionId = result.sessionId;
        forumCache.lastFetch = Date.now();
        trimCache(); // Prevent memory overflow

        console.log('[ForumScreen] Hybrid feed loaded:', result.feed.length, 'items');
      } else {
        // Load next page - INFINITE SCROLL
        // Use lastCreatedAt for better pagination (cursor-based)
        if (!lastCreatedAtRef.current && !lastPostIdRef.current) {
          console.log('[ForumScreen] No lastPostId/lastCreatedAt, cannot load more');
          setHasMore(false);
          return;
        }

        const result = await withTimeout(
          getNextFeedPage(user.id, sessionId, lastPostIdRef.current, 20),
          FEED_LOADMORE_TIMEOUT,
          'getNextFeedPage'
        );

        // RACE CONDITION FIX: Check if this request is still current
        if (requestId !== currentRequestIdRef.current) {
          console.log(`[ForumScreen] Ignoring stale next page response (requestId: ${requestId}, current: ${currentRequestIdRef.current})`);
          return;
        }

        // Dedupe feed items before appending
        let newItemsCount = 0;
        let newItems = [];
        setFeedItems(prev => {
          const existingIds = new Set(prev.map(item => item.data?.id));
          newItems = result.feed.filter(item => !existingIds.has(item.data?.id));
          newItemsCount = newItems.length;
          console.log(`[ForumScreen] Adding ${newItemsCount} new feed items`);
          if (newItemsCount === 0) {
            return prev; // No change if no new items
          }
          return [...prev, ...newItems];
        });

        // Extract NEW posts only for legacy compatibility
        const newPostsOnly = newItems
          .filter(item => item.type === 'post')
          .map(item => item.data);

        if (newPostsOnly.length > 0) {
          setPosts(prev => [...prev, ...newPostsOnly]);

          // Update last post ID and created_at from NEW posts
          const lastNewPost = newPostsOnly[newPostsOnly.length - 1];
          if (lastNewPost) {
            lastPostIdRef.current = lastNewPost.id;
            lastCreatedAtRef.current = lastNewPost.created_at;
            console.log(`[ForumScreen] Updated lastPostId to: ${lastNewPost.id}`);
          }
        }

        // INFINITE SCROLL: Stop if no new items (prevent infinite loop)
        const shouldContinue = newItemsCount > 0;
        setHasMore(shouldContinue);

        if (!shouldContinue) {
          console.log('[ForumScreen] No new items found, stopping infinite scroll');
        }

        console.log('[ForumScreen] Next page loaded:', result.feed.length, 'items, new:', newItemsCount);
      }
    } catch (error) {
      const isTimeout = error?.message?.includes('FeedTimeout');
      console.error('[ForumScreen] Error loading hybrid feed:', isTimeout ? 'TIMEOUT' : error?.message);

      // RACE CONDITION FIX: Check if this request is still current before fallback
      if (requestId !== currentRequestIdRef.current) {
        console.log(`[ForumScreen] Ignoring stale error fallback (requestId: ${requestId}, current: ${currentRequestIdRef.current})`);
        return;
      }

      // On timeout: keep existing posts visible, allow retry after cooldown
      if (isTimeout) {
        console.log('[ForumScreen] Timeout - keeping cached data, retry after cooldown');
        lastTimeoutRef.current = Date.now(); // Set cooldown to prevent rapid retry loop
        setHasMore(true); // Allow retry (after cooldown)
        setLoadingMore(false);
        setLoading(false);
        loadMoreStartTimeRef.current = null;
        return;
      }

      // Fallback to legacy loading with new return format
      setUseHybridFeed(false);
      const currentPage = reset ? 1 : page;
      const result = await withTimeout(
        forumService.getPosts({
          feed: selectedFeed,
          topic: selectedTopic,
          page: currentPage,
          limit: 20,
        }),
        FEED_LOAD_TIMEOUT,
        'forumService.getPosts fallback'
      );

      // Check again after fallback fetch
      if (requestId !== currentRequestIdRef.current) {
        console.log(`[ForumScreen] Ignoring stale fallback response (requestId: ${requestId}, current: ${currentRequestIdRef.current})`);
        return;
      }

      // Handle new return format
      const feedData = result.posts || [];
      const postsOnly = feedData
        .filter(item => item.type === 'post')
        .map(item => item.data);

      if (reset) {
        setPosts(postsOnly);
        setFeedItems(feedData);
        setSessionId(result.sessionId);

        // Update cache for instant display on tab switch
        forumCache.posts = postsOnly;
        forumCache.feedItems = feedData;
        forumCache.sessionId = result.sessionId;
        forumCache.lastFetch = Date.now();
        trimCache(); // Prevent memory overflow
      } else {
        // Dedupe before appending
        setPosts(prev => {
          const existingIds = new Set(prev.map(p => p.id));
          const newPosts = postsOnly.filter(p => !existingIds.has(p.id));
          return [...prev, ...newPosts];
        });
        setFeedItems(prev => {
          const existingIds = new Set(prev.map(item => item.data?.id));
          const newItems = feedData.filter(item => !existingIds.has(item.data?.id));
          return [...prev, ...newItems];
        });
      }
      // INFINITE SCROLL: Allow more if we got data
      setHasMore(result.hasMore);
    } finally {
      // End performance measurement (dev only)
      performanceService.endMeasure(`loadHybridFeed.${reset ? 'reset' : 'page'}`, 2500);
      // Only update loading states if this is still the current request
      if (requestId === currentRequestIdRef.current) {
        setLoading(false);
        setLoadingMore(false);
        loadMoreStartTimeRef.current = null;
      }
    }
  };

  const onRefresh = useCallback(async () => {
    // Haptic feedback on refresh
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (err) {
      // Haptics not available on all devices
    }

    setRefreshing(true);
    // Reset all pagination state for fresh data
    setPage(1);
    setHasMore(true);
    lastPostIdRef.current = null;
    lastTimeoutRef.current = 0; // Clear timeout cooldown on manual refresh
    lastCreatedAtRef.current = null;
    setSessionId(null); // Force new session for hybrid feed
    trackedPostIds.current.clear(); // Clear local impression tracking

    // Invalidate feed cache to force fresh data on refresh
    if (user?.id) {
      invalidateFeedCache(user.id);
    }

    // Silently refresh trending hashtags
    loadTrendingHashtags();

    // DON'T clear existing data - keep showing old content while loading
    // New data will replace old data when loadPosts completes with reset=true
    await loadPosts(true);
    setRefreshing(false);
  }, [selectedFeed, selectedTopic, user?.id]);

  // DEBUG: Reset impressions and reload feed
  const handleDebugResetImpressions = useCallback(async () => {
    if (!user?.id) return;

    alert({
      type: 'warning',
      title: 'Debug: Reset Impressions',
      message: 'This will delete all your feed impressions, making all posts appear as "unseen". Continue?',
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset & Reload',
          style: 'destructive',
          onPress: async () => {
            try {
              // First show stats
              const stats = await getImpressionStats(user.id);
              console.log('[DEBUG] Current stats:', stats);

              // Reset impressions
              await resetAllImpressions(user.id);

              // Reload feed
              setRefreshing(true);
              setPage(1);
              setHasMore(true);
              lastPostIdRef.current = null;
              lastCreatedAtRef.current = null;
              setSessionId(null);
              trackedPostIds.current.clear(); // Clear local impression tracking
              // DON'T clear data - keep showing old content while loading
              await loadPosts(true);
              setRefreshing(false);

              alert({
                type: 'success',
                title: 'Success',
                message: 'All impressions reset. Feed reloaded with fresh data.',
                buttons: [{ text: 'OK' }],
              });
            } catch (error) {
              console.error('[DEBUG] Error:', error);
              alert({
                type: 'error',
                title: 'Error',
                message: error.message,
                buttons: [{ text: 'OK' }],
              });
            }
          }
        }
      ],
    });
  }, [user?.id, loadPosts]);

  // INFINITE SCROLL: Trigger when user scrolls near bottom
  // SELF-HEALING: Auto-recover if loadingMore has been stuck for >15 seconds
  // ANTI-LOOP: Respect timeout cooldown to prevent rapid retry after timeout
  const onEndReached = useCallback(() => {
    // Detect stuck loadingMore state
    if (loadingMore && loadMoreStartTimeRef.current) {
      const elapsed = Date.now() - loadMoreStartTimeRef.current;
      if (elapsed > 15000) {
        console.warn(`[ForumScreen] loadingMore stuck for ${Math.round(elapsed / 1000)}s - force resetting`);
        setLoadingMore(false);
        loadMoreStartTimeRef.current = null;
        // Allow the next onEndReached call to trigger loadPosts
        return;
      }
    }

    // Respect timeout cooldown - don't retry immediately after a timeout
    if (lastTimeoutRef.current > 0) {
      const timeSinceTimeout = Date.now() - lastTimeoutRef.current;
      if (timeSinceTimeout < TIMEOUT_RETRY_COOLDOWN) {
        return; // Wait before retrying
      }
    }

    if (!loading && !loadingMore && hasMore) {
      console.log('[ForumScreen] Triggering loadPosts for infinite scroll');
      loadMoreStartTimeRef.current = Date.now();
      loadPosts(false);
    }
  }, [loading, loadingMore, hasMore, selectedFeed, selectedTopic, page]);

  // Handle scroll to hide/show header (Instagram/TikTok style)
  // Uses velocity detection for smooth, intentional hide/show
  const handleScroll = useCallback((event) => {
    // Track scroll performance (dev only)
    performanceService.trackScroll();

    const currentScrollY = event.nativeEvent.contentOffset.y;
    const currentTime = Date.now();
    const timeDelta = currentTime - lastScrollTime.current;
    const scrollDelta = currentScrollY - lastScrollY.current;

    // Calculate velocity (pixels per millisecond)
    const velocity = timeDelta > 0 ? Math.abs(scrollDelta) / timeDelta : 0;
    scrollVelocity.current = velocity;

    // Skip if animating or in cooldown
    if (isAnimating.current || animationCooldown.current) {
      lastScrollY.current = currentScrollY;
      lastScrollTime.current = currentTime;
      return;
    }

    // Helper to run animation with cooldown - SMOOTH: only use native driver
    const runAnimation = (toHidden) => {
      isAnimating.current = true;
      animationCooldown.current = true;

      // Use timing for smoother, more predictable animation
      Animated.timing(headerTranslateY, {
        toValue: toHidden ? -HEADER_MAX_HEIGHT : 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        isAnimating.current = false;
        // Add cooldown to prevent jitter
        setTimeout(() => {
          animationCooldown.current = false;
        }, COOLDOWN_MS);
      });
    };

    // At top of list - always show header immediately
    if (currentScrollY <= 20) {
      if (!isHeaderVisible.current) {
        isHeaderVisible.current = true;
        runAnimation(false);
      }
      lastScrollY.current = currentScrollY;
      lastScrollTime.current = currentTime;
      return;
    }

    // Only trigger hide/show after scrolling past threshold
    if (currentScrollY < SCROLL_THRESHOLD) {
      lastScrollY.current = currentScrollY;
      lastScrollTime.current = currentTime;
      return;
    }

    // Scrolling DOWN fast enough - hide header
    if (scrollDelta > 0 && velocity > VELOCITY_THRESHOLD && isHeaderVisible.current) {
      isHeaderVisible.current = false;
      runAnimation(true);
    }
    // Scrolling UP fast enough - show header
    else if (scrollDelta < 0 && velocity > VELOCITY_THRESHOLD && !isHeaderVisible.current) {
      isHeaderVisible.current = true;
      runAnimation(false);
    }

    lastScrollY.current = currentScrollY;
    lastScrollTime.current = currentTime;

    // Show/hide scroll-to-top FAB based on scroll position
    const shouldShowScrollToTop = currentScrollY > SCROLL_TO_TOP_THRESHOLD;
    if (shouldShowScrollToTop !== showScrollToTop) {
      setShowScrollToTop(shouldShowScrollToTop);
    }
  }, [headerTranslateY, HEADER_MAX_HEIGHT, SCROLL_THRESHOLD, VELOCITY_THRESHOLD, COOLDOWN_MS, showScrollToTop, SCROLL_TO_TOP_THRESHOLD]);

  // Scroll to top function - also shows header and resets animation state
  const scrollToTop = useCallback(async () => {
    // Haptic feedback for scroll-to-top action
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (err) {
      // Haptics not available on all devices
    }

    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });

    // Hide scroll-to-top button immediately
    setShowScrollToTop(false);

    // Also show header when scrolling to top
    if (!isHeaderVisible.current) {
      isHeaderVisible.current = true;

      Animated.timing(headerTranslateY, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [headerTranslateY]);

  // Handle feed change from burger menu - scroll to top and refresh
  // FIXED: Don't clear data immediately - keep showing old content while loading new
  const handleFeedChange = useCallback((feedType) => {
    // Close menu first
    setMenuOpen(false);

    // Skip if same feed
    if (feedType === selectedFeed) {
      // Just scroll to top if same feed
      flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
      return;
    }

    // Reset pagination state but DON'T clear posts/feedItems
    // Old data will be replaced when loadPosts completes with reset=true
    setSelectedFeed(feedType);
    setPage(1);
    setHasMore(true);
    lastPostIdRef.current = null;
    lastCreatedAtRef.current = null;
    setSessionId(null);
    setLoading(true); // Show loading indicator but keep old data visible

    // Scroll to top immediately (before data loads)
    flatListRef.current?.scrollToOffset({ offset: 0, animated: false });

    // Show header when changing feed
    if (!isHeaderVisible.current) {
      isHeaderVisible.current = true;
      Animated.timing(headerTranslateY, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [selectedFeed, headerTranslateY]);

  // Handle quick actions (liked, saved) from burger menu
  // FIXED: Don't clear data immediately - keep showing old content while loading new
  const handleQuickAction = useCallback(async (action) => {
    // Close menu
    setMenuOpen(false);

    // Scroll to top and show header
    flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
    if (!isHeaderVisible.current) {
      isHeaderVisible.current = true;
      Animated.timing(headerTranslateY, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }

    // Set loading but DON'T clear existing data - keep showing old content
    setLoading(true);

    try {
      if (action === 'liked') {
        const data = await forumService.getLikedPosts();
        // Replace data only after fetch succeeds
        setPosts(data);
        setFeedItems(data.map(p => ({ type: 'post', data: p })));
        setSelectedFeed('liked');
      } else if (action === 'saved') {
        const data = await forumService.getSavedPosts();
        // Replace data only after fetch succeeds
        setPosts(data);
        setFeedItems(data.map(p => ({ type: 'post', data: p })));
        setSelectedFeed('saved');
      }
    } catch (error) {
      console.error('Error loading quick action:', error);
    } finally {
      setLoading(false);
    }
  }, [headerTranslateY]);

  // Load custom feeds and trending hashtags on mount
  useEffect(() => {
    loadCustomFeeds();
    loadTrendingHashtags();
  }, []);

  const loadCustomFeeds = async () => {
    const feeds = await forumService.getCustomFeeds();
    setCustomFeeds(feeds);
  };

  // Non-blocking trending hashtag prefetch with cache
  const loadTrendingHashtags = async () => {
    const now = Date.now();
    if (now - trendingLastFetchRef.current < TRENDING_CACHE_TTL) return;
    try {
      const trending = await hashtagService.getTrending(5);
      setTrendingHashtags(trending);
      trendingLastFetchRef.current = Date.now();
    } catch (error) {
      console.error('[ForumScreen] Load trending error:', error);
    }
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
      navigation.navigate('CourseList', { sourceTab: 'Home' });
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

  // Render feed item (post, ad, or sponsor banner)
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

    // Sponsor banner - injected between posts
    if (item.type === 'sponsor_banner') {
      return (
        <SponsorBanner
          banner={item.data}
          navigation={navigation}
          userId={bannerUserId}
          onDismiss={dismissBanner}
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

  // Memoized feed data with sponsor banners injected
  // FIXED: Always show cached data during refresh - don't clear the list
  const feedDataWithBanners = useMemo(() => {
    const baseFeed = feedItems.length > 0 ? feedItems : posts.map(p => ({ type: 'post', data: p }));
    // If no data at all, return empty (will show loading or empty state)
    if (baseFeed.length === 0) {
      return [];
    }
    // Inject sponsor banners between posts (after 3rd item, then every 8 items)
    return injectBannersIntoFeed(baseFeed, sponsorBanners, {
      firstBannerAfter: 3,
      bannerInterval: 8,
    });
  }, [feedItems, posts, sponsorBanners]);

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
    if (titles[selectedFeed]) return titles[selectedFeed];
    // Check if selectedFeed is a custom feed UUID
    const customFeed = customFeeds.find(f => f.id === selectedFeed);
    if (customFeed) return customFeed.name;
    return 'Bảng Tin';
  };

  // Handle tab change from CategoryTabs - scroll to top and refresh
  // FIXED: Don't clear data immediately - keep showing old content while loading new
  const handleTabChange = useCallback((tabId) => {
    // Skip if same tab - just scroll to top
    if (tabId === selectedFeed) {
      flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
      return;
    }

    // Reset pagination state but DON'T clear posts/feedItems
    // Old data will be replaced when loadPosts completes with reset=true
    setSelectedFeed(tabId);
    setPage(1);
    setHasMore(true);
    lastPostIdRef.current = null;
    lastCreatedAtRef.current = null;
    setSessionId(null);
    trackedPostIds.current.clear(); // Clear local impression tracking
    setLoading(true); // Show loading indicator but keep old data visible

    // Scroll to top immediately (before data loads)
    flatListRef.current?.scrollToOffset({ offset: 0, animated: false });

    // Show header when changing tab
    if (!isHeaderVisible.current) {
      isHeaderVisible.current = true;
      Animated.timing(headerTranslateY, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [selectedFeed, headerTranslateY]);

  const renderEmptyState = () => {
    // Show loading state when loading/refreshing with no cached data
    if (loading || refreshing) {
      return (
        <View style={styles.emptyState}>
          <ActivityIndicator size="large" color={COLORS.gold} />
          <Text style={styles.loadingText}>Đang tải bài viết...</Text>
        </View>
      );
    }

    // Only show "no posts" when truly empty and not loading
    return (
      <View style={styles.emptyState}>
        <FileText size={64} color={COLORS.textMuted} strokeWidth={1.5} />
        <Text style={styles.emptyTitle}>Chưa có bài viết</Text>
        <Text style={styles.emptySubtitle}>Hãy là người đầu tiên chia sẻ!</Text>
      </View>
    );
  };

  // INFINITE SCROLL: Show loading indicator when loading more
  const renderFooter = () => {
    // Don't show footer during refresh - let RefreshControl handle it
    if (refreshing) {
      return null;
    }
    // Show loading indicator when loading more posts
    if (loadingMore) {
      return (
        <View style={styles.footer}>
          <ActivityIndicator size="small" color={COLORS.gold} />
          <Text style={styles.loadingMoreText}>Đang tải thêm...</Text>
        </View>
      );
    }
    // Show "load more" hint if there's more data
    if (hasMore && feedItems.length > 0) {
      return (
        <View style={styles.footer}>
          <Text style={styles.loadMoreHint}>Kéo xuống để tải thêm</Text>
        </View>
      );
    }
    // Show end message only if we have posts and no more data
    if (!hasMore && feedItems.length > 0) {
      return (
        <View style={styles.footer}>
          <Text style={styles.endOfFeedText}>Đã xem hết bài viết</Text>
        </View>
      );
    }
    return null;
  };

  if (loading && posts.length === 0) {
    return (
      <LinearGradient
        colors={GRADIENTS.background}
        locations={GRADIENTS.backgroundLocations}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.container}>
          {/* Header skeleton placeholder */}
          <View style={styles.skeletonHeader}>
            <View style={styles.skeletonLogo} />
            <View style={styles.skeletonTabs} />
          </View>
          {/* Post skeleton list */}
          <PostSkeletonList count={4} />
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
      <View style={styles.container}>
        {/* Collapsible Header - Hides on scroll down, shows on scroll up */}
        <Animated.View
          onLayout={onHeaderLayout}
          style={[
            styles.collapsibleHeader,
            {
              transform: [{ translateY: headerTranslateY }],
              paddingTop: insets.top, // Add status bar padding to header
            },
          ]}
        >
          {/* Header with Burger Menu */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => setMenuOpen(true)}
            >
              <Menu size={24} color={COLORS.textPrimary} strokeWidth={2} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.headerCenter}
              onPress={scrollToTop}
              activeOpacity={0.7}
            >
              <Text style={styles.headerTitle}>Gemral</Text>
              <Text style={styles.headerSubtitle}>{getFeedTitle()}</Text>
            </TouchableOpacity>

            <View style={styles.headerIcons}>
              {/* DEBUG: Reset impressions button - REMOVE IN PRODUCTION */}
              {__DEV__ && (
                <TouchableOpacity
                  style={[styles.iconButton, { backgroundColor: 'rgba(255,0,0,0.2)' }]}
                  onPress={handleDebugResetImpressions}
                  onLongPress={async () => {
                    // Long press to just show stats without resetting
                    if (user?.id) {
                      const stats = await getImpressionStats(user.id);
                      alert({
                        type: 'info',
                        title: 'Impression Stats',
                        message: JSON.stringify(stats, null, 2),
                        buttons: [{ text: 'OK' }],
                      });
                    }
                  }}
                >
                  <RotateCcw size={20} color="#FF4444" />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => navigation.navigate('Search')}
              >
                <Search size={22} color={COLORS.textPrimary} />
              </TouchableOpacity>
              {/* Messages Icon with unread badge */}
              <HeaderMessagesIcon />
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => navigation.navigate('Notifications')}
              >
                <Bell size={22} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>
          </View>

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
                <View style={[styles.shortcutIcon, { backgroundColor: 'rgba(255, 189, 89, 0.15)' }]}>
                  <DollarSign size={16} color={COLORS.gold} />
                </View>
                <Text style={styles.shortcutText}>Thu Nhập</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.shortcutBtn}
                onPress={() => navigateToAccountScreen('SoundLibrary')}
              >
                <View style={[styles.shortcutIcon, { backgroundColor: 'rgba(255, 189, 89, 0.15)' }]}>
                  <Music size={16} color={COLORS.gold} />
                </View>
                <Text style={styles.shortcutText}>Âm Thanh</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.shortcutBtn}
                onPress={() => navigateToAccountScreen('BoostedPosts')}
              >
                <View style={[styles.shortcutIcon, { backgroundColor: 'rgba(255, 189, 89, 0.15)' }]}>
                  <Zap size={16} color={COLORS.gold} />
                </View>
                <Text style={styles.shortcutText}>Boost</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Main Feed Tabs */}
          <CategoryTabs
            selected={selectedFeed}
            onSelect={handleTabChange}
          />
        </Animated.View>

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
          trendingHashtags={trendingHashtags}
        />

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

        {/* Posts Feed - Full screen, content padded to avoid header */}
        <View style={styles.feedContainer}>
          <FlatList
            ref={flatListRef}
            data={feedDataWithBanners}
            renderItem={renderFeedItem}
            keyExtractor={(item, index) => {
              if (item.type === 'ad') return `ad-${item.data?.id || 'unknown'}-${index}`;
              if (item.type === 'sponsor_banner') return `sponsor-${item.data?.id || 'unknown'}-${index}`;
              return `post-${item.data?.id || 'unknown'}-${index}`;
            }}
            contentContainerStyle={[styles.listContent, { paddingTop: HEADER_MAX_HEIGHT + SPACING.sm }]}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={COLORS.gold}
                colors={[COLORS.gold]}
                progressViewOffset={HEADER_MAX_HEIGHT}
              />
            }
            onScroll={handleScroll}
            scrollEventThrottle={16}
            onEndReached={onEndReached}
            onEndReachedThreshold={0.3}
            // ========== PERFORMANCE OPTIMIZATIONS ==========
            getItemLayout={getItemLayout}
            initialNumToRender={FLATLIST_CONFIG.INITIAL_NUM_TO_RENDER}
            maxToRenderPerBatch={FLATLIST_CONFIG.MAX_TO_RENDER_PER_BATCH}
            windowSize={FLATLIST_CONFIG.WINDOW_SIZE}
            updateCellsBatchingPeriod={FLATLIST_CONFIG.UPDATE_CELLS_BATCHING_PERIOD}
            removeClippedSubviews={FLATLIST_CONFIG.REMOVE_CLIPPED_SUBVIEWS}
            // ========== LIST COMPONENTS ==========
            ListEmptyComponent={renderEmptyState}
            ListFooterComponent={renderFooter}
            // ========== VIEWABILITY TRACKING ==========
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
          />
        </View>

        {/* FAB - Wrapped with AuthGate */}
        <AuthGate action="tạo bài viết mới">
          <FABButton onPress={() => navigation.navigate('CreatePost')} />
        </AuthGate>

        {/* Scroll to Top FAB - Appears when user scrolls down */}
        <ScrollToTopButton
          visible={showScrollToTop}
          onPress={scrollToTop}
          bottomOffset={210} // Above FABButton (140 + 56 + 14 gap)
        />
      </View>
      {AlertComponent}
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
  // Collapsible header wrapper - position absolute for smooth translate animation
  collapsibleHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    backgroundColor: '#0a0a12', // Solid dark bg matching gradient
  },
  // Feed container - flex fills remaining space (marginTop animated via feedPaddingTop)
  feedContainer: {
    flex: 1,
    // marginTop is animated dynamically, starting at 176
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
    marginTop: SPACING.md, // Increased offset for better touch area at top
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
  // Facebook style: no horizontal padding for full-width cards
  // paddingTop is set dynamically based on header height
  listContent: {
    paddingHorizontal: 0,
    paddingBottom: CONTENT_BOTTOM_PADDING,
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
  // Skeleton loading header styles
  skeletonHeader: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  skeletonLogo: {
    width: 100,
    height: 28,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 8,
    marginBottom: SPACING.md,
  },
  skeletonTabs: {
    width: '100%',
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 20,
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
    gap: SPACING.sm,
  },
  loadingMoreText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },
  loadMoreHint: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    fontStyle: 'italic',
  },
  endOfFeedText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    fontStyle: 'italic',
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
