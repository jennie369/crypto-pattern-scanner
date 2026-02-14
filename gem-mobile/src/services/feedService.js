/**
 * Feed Service - Hybrid Feed Algorithm
 * Generates personalized feed with 60% following + 40% discovery
 * Includes ad insertion for non-TIER3 users
 */

import { supabase } from './supabase';

// Simple UUID generator without external dependencies
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Common select query for posts - includes all relations needed for PostCard
const POST_SELECT_QUERY = `
  *,
  profiles:user_id (
    id,
    username,
    full_name,
    avatar_url,
    role,
    scanner_tier,
    chatbot_tier,
    verified_seller,
    verified_trader,
    level_badge,
    role_badge,
    achievement_badges
  ),
  categories:category_id (
    id,
    name,
    color
  ),
  tagged_products:post_products (
    id,
    product_id,
    product_title,
    product_price,
    product_image,
    product_handle,
    position
  ),
  likes:forum_likes(user_id),
  saved:forum_saved(user_id)
`;

// FAST query - minimal joins for speed (no likes/saved joins)
// FIXED: Added tagged_products so product attachments show in Home Feed
const POST_SELECT_FAST = `
  id,
  user_id,
  content,
  image_url,
  media_urls,
  image_width,
  image_height,
  image_ratio,
  created_at,
  updated_at,
  likes_count,
  comments_count,
  shares_count,
  views_count,
  category_id,
  hashtags,
  is_pinned,
  profiles:user_id (
    id,
    username,
    full_name,
    avatar_url,
    role,
    verified_seller,
    verified_trader
  ),
  tagged_products:post_products (
    id,
    product_id,
    product_title,
    product_price,
    product_image,
    product_handle,
    position
  )
`;

// Select query for seed posts (joined with seed_users instead of profiles)
// UPDATED: Added seed_post_products for product tagging
const SEED_POST_SELECT_QUERY = `
  *,
  seed_users:user_id (
    id,
    full_name,
    avatar_url,
    seed_persona,
    tier,
    is_premium_seed
  ),
  seed_post_products (
    id,
    product_id,
    product_title,
    product_price,
    product_image,
    product_handle,
    position
  )
`;

// ============================================
// CONFIGURATION
// ============================================

const FEED_CONFIG = {
  DEFAULT_LIMIT: 15, // REDUCED for faster initial load (was 30 → 20 → 15)
  FOLLOWING_WEIGHT: 0.6,
  DISCOVERY_WEIGHT: 0.3,
  SERENDIPITY_WEIGHT: 0.1,
  AD_FIRST_POSITION: 5,   // First inline ad after 5 posts
  AD_INTERVAL: 10,        // INCREASED from 8 to 10 for better spacing
  MAX_ADS_PER_SESSION: 2, // Max 2 inline ads (header shows 1 separately)
  CACHE_TTL: 60000, // 60 seconds cache (in ms)
  MAX_SEED_POSTS: 20, // REDUCED for faster load (was 50)
  MAX_FALLBACK_POSTS: 20, // REDUCED for faster load (was 50)
  IMPRESSION_BATCH_SIZE: 50, // Max impressions to check
};

// ============================================
// MEMORY CACHE FOR FEED - Prevents refetching on tab switch
// ============================================

const feedCache = new Map();

/**
 * Get cached feed if still valid
 * @param {string} userId - User ID
 * @returns {object|null} Cached feed or null
 */
function getCachedFeed(userId) {
  const cached = feedCache.get(userId);
  if (!cached) return null;

  const now = Date.now();
  if (now - cached.timestamp > FEED_CONFIG.CACHE_TTL) {
    feedCache.delete(userId);
    return null;
  }

  console.log(`[FeedService] ⚡ Cache HIT for user ${userId}`);
  return cached.data;
}

/**
 * Store feed in cache
 * @param {string} userId - User ID
 * @param {object} feedData - Feed data to cache
 */
function setCachedFeed(userId, feedData) {
  // Limit cache size to prevent memory issues
  if (feedCache.size > 100) {
    const firstKey = feedCache.keys().next().value;
    feedCache.delete(firstKey);
  }

  feedCache.set(userId, {
    data: feedData,
    timestamp: Date.now(),
  });
  console.log(`[FeedService] 💾 Cached feed for user ${userId}`);
}

/**
 * Invalidate cache for user (call on refresh)
 * @param {string} userId - User ID
 */
export function invalidateFeedCache(userId) {
  feedCache.delete(userId);
  console.log(`[FeedService] 🗑️ Cache invalidated for user ${userId}`);
}

// ============================================
// LIGHTWEIGHT ADS INSERTION (for Fast Mode)
// Single query to fetch banners, no profile check needed
// ============================================

async function insertAdsLight(userId, sessionId, feedItems) {
  try {
    // Fetch sponsor banners - single lightweight query
    const { data: sponsorBanners, error } = await supabase
      .from('sponsor_banners')
      .select('id, title, subtitle, action_label, action_value, action_type, image_url, background_color, text_color, accent_color, is_dismissible')
      .eq('is_active', true)
      .eq('placement', 'feed_inline')
      .order('priority', { ascending: false })
      .limit(FEED_CONFIG.MAX_ADS_PER_SESSION);

    if (error || !sponsorBanners?.length) {
      console.log(`[FeedService] ⚡ No inline ads available`);
      return feedItems;
    }

    // Build feed with ads
    const feed = [];
    let adPosition = FEED_CONFIG.AD_FIRST_POSITION;
    let adsInserted = 0;

    feedItems.forEach((item, index) => {
      feed.push(item);

      // Insert ad at configured positions
      if (index + 1 === adPosition && adsInserted < sponsorBanners.length) {
        const banner = sponsorBanners[adsInserted];
        feed.push({
          type: 'ad',
          data: {
            id: banner.id,
            type: 'sponsor_banner',
            title: banner.title,
            description: banner.subtitle,
            cta: banner.action_label,
            link: banner.action_value,
            action_type: banner.action_type,
            image: banner.image_url,
            background_color: banner.background_color,
            text_color: banner.text_color,
            accent_color: banner.accent_color,
            is_dismissible: banner.is_dismissible,
          },
        });
        adsInserted++;
        adPosition += FEED_CONFIG.AD_INTERVAL;
      }
    });

    console.log(`[FeedService] ⚡ Inserted ${adsInserted} inline ads`);
    return feed;

  } catch (error) {
    console.error('[FeedService] insertAdsLight error:', error);
    return feedItems;
  }
}

// ============================================
// MAIN FEED GENERATION FUNCTION
// ============================================

export async function generateFeed(userId, sessionId = null, limit = FEED_CONFIG.DEFAULT_LIMIT, forceRefresh = false, skipAds = false) {
  try {
    // Check cache first (unless force refresh)
    if (!forceRefresh) {
      const cachedFeed = getCachedFeed(userId);
      if (cachedFeed) {
        return cachedFeed;
      }
    }

    // Generate session ID if not provided
    if (!sessionId) {
      sessionId = generateUUID();
    }

    console.log(`[FeedService] ⚡ FAST MODE + ADS + PERSONALIZATION for user ${userId}`);

    // ============================================
    // FAST MODE v2: Parallel queries for speed + features
    // 1. Get recent posts (minimal joins)
    // 2. Get user's following list (for personalization)
    // 3. Get user's likes/saves for these posts
    // ============================================

    // Run queries in parallel — use allSettled so a slow/failed query
    // doesn't block the entire feed (posts are critical, others are optional)
    const [postsSettled, followingSettled, userPrefsSettled] = await Promise.allSettled([
      // Query 1: Recent posts with minimal joins (CRITICAL)
      supabase
        .from('forum_posts')
        .select(POST_SELECT_FAST)
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(limit + 10), // Get extra for personalization sorting
      // Query 2: User's following list (OPTIONAL — degrades to no personalization)
      supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', userId),
      // Query 3: User preferences for tier check (OPTIONAL — degrades to FREE tier ads)
      supabase
        .from('profiles')
        .select('scanner_tier, chatbot_tier')
        .eq('id', userId)
        .single(),
    ]);

    // Extract results — only posts query is critical
    const postsResult = postsSettled.status === 'fulfilled' ? postsSettled.value : { data: null, error: postsSettled.reason };
    const followingResult = followingSettled.status === 'fulfilled' ? followingSettled.value : { data: null, error: followingSettled.reason };
    const userPrefsResult = userPrefsSettled.status === 'fulfilled' ? userPrefsSettled.value : { data: null, error: userPrefsSettled.reason };

    if (postsResult.error) {
      console.error('[FeedService] Fast posts query error:', postsResult.error);
      throw postsResult.error;
    }

    if (followingResult.error) {
      console.warn('[FeedService] Following query failed (feed will skip personalization):', followingResult.error?.message);
    }

    const recentPosts = postsResult.data || [];
    const followingIds = new Set((followingResult.data || []).map(f => f.following_id));
    const userTier = userPrefsResult.data?.scanner_tier || userPrefsResult.data?.chatbot_tier || 'FREE';

    console.log(`[FeedService] ⚡ Loaded ${recentPosts.length} posts, following ${followingIds.size} users, tier: ${userTier}`);

    // ============================================
    // PERSONALIZATION: Sort posts - following users first
    // ============================================
    const sortedPosts = [...recentPosts].sort((a, b) => {
      const aIsFollowing = followingIds.has(a.user_id) ? 1 : 0;
      const bIsFollowing = followingIds.has(b.user_id) ? 1 : 0;

      // Following posts first, then by date
      if (aIsFollowing !== bIsFollowing) {
        return bIsFollowing - aIsFollowing;
      }
      return new Date(b.created_at) - new Date(a.created_at);
    }).slice(0, limit); // Take only what we need

    // Transform posts to feed format
    // Map 'profiles' to 'author' for PostCard compatibility
    const feedItems = sortedPosts.map(post => ({
      type: 'post',
      data: {
        ...post,
        author: post.profiles, // PostCard expects 'author' not 'profiles'
        user_liked: false, // Will be loaded on demand when user interacts
        user_saved: false, // Will be loaded on demand when user interacts
        is_following: followingIds.has(post.user_id),
      },
      score: followingIds.has(post.user_id) ? 100 : 0,
    }));

    // ============================================
    // INLINE ADS: Insert ads for non-premium users
    // Skip on initial load (skipAds=true) for faster first paint
    // ============================================
    let feedWithAds = feedItems;
    const isPremium = userTier === 'TIER3' || userTier === 'PREMIUM' || userTier === 'PRO';

    if (!skipAds && !isPremium && feedItems.length >= FEED_CONFIG.AD_FIRST_POSITION) {
      feedWithAds = await insertAdsLight(userId, sessionId, feedItems);
      console.log(`[FeedService] ⚡ Added inline ads for ${userTier} user`);
    } else if (skipAds) {
      console.log(`[FeedService] ⚡ Skipped ads for faster initial load`);
    }

    console.log(`[FeedService] ⚡ Fast mode complete: ${feedWithAds.length} items (${feedItems.length} posts + ${feedWithAds.length - feedItems.length} ads)`);

    const result = {
      feed: feedWithAds,
      sessionId,
      hasMore: recentPosts.length >= limit,
    };

    // Cache the result
    setCachedFeed(userId, result);

    return result;

  } catch (error) {
    console.error('[FeedService] Error in fast mode:', error?.message);
    // Return empty feed immediately — let ForumScreen handle retry/fallback.
    // Previously this cascaded to generateFeedLegacy which ran 5+ more queries,
    // doubling the total wait time on slow networks before the caller's timeout fired.
    return {
      feed: [],
      sessionId: sessionId || generateUUID(),
      hasMore: true, // Allow retry
    };
  }
}

// Legacy feed generation (full algorithm) - used as fallback
async function generateFeedLegacy(userId, sessionId = null, limit = FEED_CONFIG.DEFAULT_LIMIT) {
  try {
    if (!sessionId) {
      sessionId = generateUUID();
    }

    console.log(`[FeedService] Legacy feed for user ${userId}, session ${sessionId}`);

    // Step 1: Get user preferences
    const userPrefs = await getUserPreferences(userId);

    // Step 2: Calculate weights
    const followingLimit = Math.floor(limit * (userPrefs.discovery_weight === null ?
      FEED_CONFIG.FOLLOWING_WEIGHT : 1 - userPrefs.discovery_weight));
    const discoveryLimit = Math.floor(limit * (userPrefs.discovery_weight || FEED_CONFIG.DISCOVERY_WEIGHT));
    const serendipityLimit = Math.ceil(limit * FEED_CONFIG.SERENDIPITY_WEIGHT);

    console.log(`[FeedService] Fetching: ${followingLimit} following, ${discoveryLimit} discovery, ${serendipityLimit} serendipity`);

    // Step 3: Fetch posts from different sources (OPTIMIZED - reduced limits)
    // Run in parallel but with smaller limits for faster response
    const [userOwnPosts, followingPosts, discoveryPosts, seedPosts] = await Promise.all([
      getUserOwnPosts(userId, 5), // Only 5 recent own posts for initial load
      getFollowingPosts(userId, Math.min(followingLimit, 15), sessionId),
      getDiscoveryPosts(userId, Math.min(discoveryLimit, 15), sessionId),
      getSeedPosts(FEED_CONFIG.MAX_SEED_POSTS) // Limited seed posts
    ]);

    console.log(`[FeedService] Fetched: ${userOwnPosts.length} own, ${followingPosts.length} following, ${discoveryPosts.length} discovery, ${seedPosts.length} seed`);

    // Step 3.5: FALLBACK - Only fetch if we don't have enough posts
    const totalFetched = userOwnPosts.length + followingPosts.length + discoveryPosts.length + seedPosts.length;
    let fallbackPosts = [];
    if (totalFetched < limit) {
      fallbackPosts = await getAllRecentPosts(userId, FEED_CONFIG.MAX_FALLBACK_POSTS);
      console.log(`[FeedService] Fallback: fetched ${fallbackPosts.length} additional posts`);
    }

    // Step 4: Combine all posts with deduplication
    // User's own posts are added first to ensure they're included
    // Seed posts and fallback posts are added at the end to fill gaps
    const allPostsRaw = [...userOwnPosts, ...followingPosts, ...discoveryPosts, ...fallbackPosts, ...seedPosts];

    // Deduplicate by post ID
    const seenPostIds = new Set();
    const allPosts = allPostsRaw.filter(post => {
      if (seenPostIds.has(post.id)) {
        return false;
      }
      seenPostIds.add(post.id);
      return true;
    });

    console.log(`[FeedService] Fetched ${allPostsRaw.length} posts, ${allPosts.length} after deduplication`);

    // Step 5: Score posts for this user (pass userPrefs to avoid duplicate query)
    const scoredPosts = await scorePostsForUser(userId, allPosts, userPrefs);

    // Step 6: Apply diversity rules
    const diversifiedPosts = applyDiversityRules(scoredPosts);

    // Step 7: Insert ads (if user tier allows)
    const feedWithAds = await insertAds(userId, sessionId, diversifiedPosts);

    // Step 8: Track impressions for FIRST PAGE only (first 10 posts)
    // This ensures the initial visible posts are marked as "seen" immediately
    // Further scrolling will track via onViewableItemsChanged
    const firstPagePosts = feedWithAds.slice(0, 10);
    console.log(`[FeedService] 📝 Tracking ${firstPagePosts.length} initial impressions...`);
    await trackImpressions(userId, sessionId, firstPagePosts);

    console.log(`[FeedService] Generated feed with ${feedWithAds.length} items (${diversifiedPosts.length} posts + ${feedWithAds.length - diversifiedPosts.length} ads)`);

    // FIXED: Don't slice - return ALL posts to show user's 400+ posts
    // Pagination handles the rest on subsequent loads
    const result = {
      feed: feedWithAds,
      sessionId,
      hasMore: allPosts.length >= limit
    };

    // Cache the result for faster subsequent loads
    setCachedFeed(userId, result);

    return result;

  } catch (error) {
    console.error('[FeedService] Error generating feed:', error);
    throw error;
  }
}

// ============================================
// GET USER PREFERENCES
// ============================================

async function getUserPreferences(userId) {
  try {
    const { data, error } = await supabase
      .from('user_feed_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // Not found error is OK
      throw error;
    }

    // Create default preferences if not exists
    if (!data) {
      const { data: newPrefs, error: insertError } = await supabase
        .from('user_feed_preferences')
        .insert({
          user_id: userId,
          feed_algorithm: 'hybrid',
          discovery_weight: FEED_CONFIG.DISCOVERY_WEIGHT,
          preferred_categories: [],
          following_users: []
        })
        .select()
        .single();

      if (insertError) {
        console.log('[FeedService] Could not create preferences, using defaults');
        return {
          discovery_weight: FEED_CONFIG.DISCOVERY_WEIGHT,
          preferred_categories: [],
          following_users: []
        };
      }
      return newPrefs;
    }

    return data;
  } catch (error) {
    console.error('[FeedService] Error getting user preferences:', error);
    return {
      discovery_weight: FEED_CONFIG.DISCOVERY_WEIGHT,
      preferred_categories: [],
      following_users: []
    };
  }
}

// ============================================
// GET USER'S OWN POSTS (FACEBOOK-STYLE)
// Always show user's own recent posts at the top of the feed
// ============================================

async function getUserOwnPosts(userId, limit = 10) {
  try {
    console.log(`[FeedService] Fetching user's own posts for ${userId}`);

    const { data: posts, error } = await supabase
      .from('forum_posts')
      .select(POST_SELECT_QUERY)
      .eq('user_id', userId)
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('[FeedService] Error getting user own posts:', error);
      return [];
    }

    console.log(`[FeedService] Found ${posts?.length || 0} user's own posts`);

    // Add metadata and transform for PostCard compatibility
    return (posts || []).map(post => ({
      ...post,
      feed_source: 'own',
      is_own_post: true,
      // Map author for PostCard
      author: post.profiles,
      category: post.categories,
    }));

  } catch (error) {
    console.error('[FeedService] Error getting user own posts:', error);
    return [];
  }
}

// ============================================
// GET FOLLOWING POSTS
// ============================================

async function getFollowingPosts(userId, limit, sessionId) {
  try {
    // Get users the current user follows from user_follows table
    const { data: followData, error: followError } = await supabase
      .from('user_follows')
      .select('following_id')
      .eq('follower_id', userId);

    if (followError) {
      console.error('[FeedService] Error getting following users:', followError);
    }

    const followingUsers = followData?.map(f => f.following_id) || [];

    // Fallback: also check user_feed_preferences for additional following users
    const { data: preferences } = await supabase
      .from('user_feed_preferences')
      .select('following_users')
      .eq('user_id', userId)
      .single();

    const prefsFollowing = preferences?.following_users || [];

    // Merge both sources
    const allFollowing = [...new Set([...followingUsers, ...prefsFollowing])];

    if (allFollowing.length === 0) {
      console.log('[FeedService] No following users found');
      return []; // No one followed yet
    }

    console.log(`[FeedService] Found ${allFollowing.length} following users`);

    // Get posts from followed users - extended to 30 days for more content
    const { data: posts, error } = await supabase
      .from('forum_posts')
      .select(POST_SELECT_QUERY)
      .in('user_id', allFollowing)
      .eq('status', 'published')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // Last 30 days
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    // Add metadata and map for PostCard compatibility
    return (posts || []).map(post => ({
      ...post,
      feed_source: 'following',
      author: post.profiles,
      category: post.categories,
    }));

  } catch (error) {
    console.error('[FeedService] Error getting following posts:', error);
    return [];
  }
}

// ============================================
// GET DISCOVERY POSTS
// ============================================

async function getDiscoveryPosts(userId, limit, sessionId) {
  try {
    // Get user's interest signals
    const { data: interactions } = await supabase
      .from('post_interactions')
      .select('post_id, forum_posts(category_id, hashtags)')
      .eq('user_id', userId)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // Last 30 days
      .limit(100);

    // Extract categories and hashtags user engaged with
    const engagedCategories = [];

    interactions?.forEach(interaction => {
      if (interaction.forum_posts) {
        if (interaction.forum_posts.category_id) {
          engagedCategories.push(interaction.forum_posts.category_id);
        }
      }
    });

    // Get posts recently shown to avoid duplicates (only last 6 hours to allow more content)
    const { data: recentlyShown } = await supabase
      .from('feed_impressions')
      .select('post_id')
      .eq('user_id', userId)
      .gte('shown_at', new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString())
      .limit(50);

    const recentPostIds = recentlyShown?.map(r => r.post_id) || [];

    // Build query - extended to 30 days for more content
    let query = supabase
      .from('forum_posts')
      .select(POST_SELECT_QUERY)
      .neq('user_id', userId) // Not own posts
      .eq('status', 'published')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    // Only filter by categories if user has engaged with many categories
    // Otherwise, show all categories to help discovery
    const uniqueCategories = [...new Set(engagedCategories)];
    if (uniqueCategories.length >= 3) {
      query = query.in('category_id', uniqueCategories);
    }

    const { data: posts, error } = await query
      .order('created_at', { ascending: false }) // Order by newest first (more reliable)
      .limit(limit * 3); // Get more to filter out recently shown

    if (error) throw error;

    // Filter out recently shown posts (but less aggressively)
    const filteredPosts = (posts || []).filter(post => !recentPostIds.includes(post.id));

    console.log(`[FeedService] Discovery: ${posts?.length || 0} total, ${filteredPosts.length} after filtering`);

    return filteredPosts.slice(0, limit).map(post => ({
      ...post,
      feed_source: 'discovery',
      author: post.profiles,
      category: post.categories,
    }));

  } catch (error) {
    console.error('[FeedService] Error getting discovery posts:', error);
    return [];
  }
}

// ============================================
// GET ALL RECENT POSTS (FALLBACK - No filters)
// This is the main fallback when other queries return empty
// ============================================

async function getAllRecentPosts(userId, limit = 50) {
  try {
    console.log(`[FeedService] FALLBACK: Fetching recent posts (limit: ${limit})`);

    // Only get posts from last 7 days for faster query
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const { data: posts, error } = await supabase
      .from('forum_posts')
      .select(POST_SELECT_QUERY)
      .eq('status', 'published')
      .gte('created_at', sevenDaysAgo)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('[FeedService] Error getting fallback posts:', error);
      return [];
    }

    console.log(`[FeedService] FALLBACK: Found ${posts?.length || 0} posts`);

    return (posts || []).map(post => ({
      ...post,
      feed_source: 'fallback',
      author: post.profiles,
      category: post.categories,
    }));

  } catch (error) {
    console.error('[FeedService] Error getting fallback posts:', error);
    return [];
  }
}

// ============================================
// GET SERENDIPITY POSTS (Random exploration)
// ============================================

async function getSerendipityPosts(userId, limit, sessionId) {
  try {
    // Get completely random posts - extended to 14 days for more content
    const { data: posts, error } = await supabase
      .from('forum_posts')
      .select(POST_SELECT_QUERY)
      .neq('user_id', userId)
      .eq('status', 'published')
      .gte('created_at', new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()) // Last 14 days
      .order('created_at', { ascending: false })
      .limit(limit * 3); // Get more to filter

    if (error) throw error;

    // Randomly sample
    const shuffled = (posts || []).sort(() => 0.5 - Math.random());

    return shuffled.slice(0, limit).map(post => ({
      ...post,
      feed_source: 'serendipity',
      author: post.profiles,
      category: post.categories,
    }));

  } catch (error) {
    console.error('[FeedService] Error getting serendipity posts:', error);
    return [];
  }
}

// ============================================
// GET SEED POSTS (Bot-generated content)
// Fetch ALL seed posts (no limit) to ensure unseen posts can be found
// ============================================

async function getSeedPosts(limit = 50) {
  try {
    // OPTIMIZED: Only fetch what we need for initial load
    // Pagination will handle the rest
    console.log(`[FeedService] Fetching seed posts (limit: ${limit})`);

    const { data: posts, error } = await supabase
      .from('seed_posts')
      .select(SEED_POST_SELECT_QUERY)
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('[FeedService] Error getting seed posts:', error);
      return [];
    }

    console.log(`[FeedService] Found ${posts?.length || 0} seed posts`);

    // Transform seed posts to match PostCard format
    return (posts || []).map(post => ({
      ...post,
      feed_source: 'seed',
      is_seed_post: true,
      // Map seed_users to author format for PostCard compatibility
      author: post.seed_users ? {
        id: post.seed_users.id,
        full_name: post.seed_users.full_name,
        username: post.seed_users.full_name?.toLowerCase().replace(/\s+/g, '_'),
        avatar_url: post.seed_users.avatar_url,
        role: post.seed_users.is_premium_seed ? 'premium_user' : 'user',
        seed_persona: post.seed_users.seed_persona,
      } : null,
      profiles: post.seed_users ? {
        id: post.seed_users.id,
        full_name: post.seed_users.full_name,
        username: post.seed_users.full_name?.toLowerCase().replace(/\s+/g, '_'),
        avatar_url: post.seed_users.avatar_url,
        role: post.seed_users.is_premium_seed ? 'premium_user' : 'user',
      } : null,
      // Map seed_post_products to tagged_products format for PostCard compatibility
      tagged_products: post.seed_post_products?.length > 0
        ? post.seed_post_products.sort((a, b) => a.position - b.position)
        : [],
      category: null, // Seed posts don't have categories
      categories: null,
      likes: [],
      saved: [],
    }));

  } catch (error) {
    console.error('[FeedService] Error getting seed posts:', error);
    return [];
  }
}

// ============================================
// SCORE POSTS FOR USER
// ============================================

async function scorePostsForUser(userId, posts, userPrefs = null) {
  try {
    // OPTIMIZED: Run interaction history query in parallel with impressions
    // userPrefs is passed from generateFeed to avoid duplicate query
    const followingUsers = userPrefs?.following_users || [];
    const preferredCategories = userPrefs?.preferred_categories || [];

    // Get user's interaction history for scoring (run async, process later)
    const historyPromise = supabase
      .from('post_interactions')
      .select('post_id, interaction_type, forum_posts(category_id, hashtags, user_id)')
      .eq('user_id', userId)
      .limit(200); // REDUCED from 500 for faster query

    // Extract patterns will be done after promise resolves
    const engagedCategories = {};
    const engagedHashtags = {};
    const engagedAuthors = {};

    // ============================================
    // OPTIMIZED: Run ALL queries in parallel with Promise.all
    // This reduces total time from sequential to parallel execution
    // ============================================
    console.log(`[FeedService] 🔍 Querying impressions in parallel for user: ${userId}`);

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const postIdsToCheck = posts.map(p => p.id);
    const seedPostIds = posts.filter(p => p.is_seed_post).map(p => p.id);

    // Run all queries in parallel
    const [historyResult, feedImpResult, seedImpResult] = await Promise.all([
      // Query 1: User interaction history (already started above)
      historyPromise,
      // Query 2: Feed impressions
      supabase
        .from('feed_impressions')
        .select('post_id')
        .eq('user_id', userId)
        .in('post_id', postIdsToCheck)
        .gte('shown_at', sevenDaysAgo)
        .limit(200),
      // Query 3: Seed impressions (only if we have seed posts)
      seedPostIds.length > 0
        ? supabase
            .from('seed_impressions')
            .select('post_id')
            .eq('user_id', userId)
            .in('post_id', seedPostIds)
            .limit(200)
        : Promise.resolve({ data: [], error: null }),
    ]);

    // Process interaction history
    const userHistory = historyResult.data || [];
    userHistory.forEach(interaction => {
      if (interaction.forum_posts) {
        const categoryId = interaction.forum_posts.category_id;
        if (categoryId) {
          engagedCategories[categoryId] = (engagedCategories[categoryId] || 0) + 1;
        }
        interaction.forum_posts.hashtags?.forEach(tag => {
          engagedHashtags[tag] = (engagedHashtags[tag] || 0) + 1;
        });
        const authorId = interaction.forum_posts.user_id;
        if (authorId) {
          engagedAuthors[authorId] = (engagedAuthors[authorId] || 0) + 1;
        }
      }
    });

    // Process impressions
    const feedImpressions = feedImpResult.data || [];
    const seedImpressions = seedImpResult.data || [];

    if (feedImpResult.error) {
      console.error(`[FeedService] ❌ ERROR fetching feed_impressions:`, feedImpResult.error);
    }

    // Skip post_interactions query - impressions are sufficient
    const interactions = [];

    // Combine ALL sources into a single Set for O(1) lookup
    // Set automatically handles duplicates
    const seenPostIds = new Set([
      ...(feedImpressions?.map(imp => imp.post_id) || []),
      ...(seedImpressions?.map(imp => imp.post_id) || []),
      ...(interactions?.map(i => i.post_id) || [])
    ]);

    const feedSeenCount = new Set(feedImpressions?.map(imp => imp.post_id) || []).size;
    const seedSeenCount = new Set(seedImpressions?.map(imp => imp.post_id) || []).size;
    const interactionCount = new Set(interactions?.map(i => i.post_id) || []).size;

    console.log(`[FeedService] ========================================`);
    console.log(`[FeedService] 📊 IMPRESSIONS SUMMARY for ${userId}:`);
    console.log(`[FeedService]   - Feed posts seen (unique): ${feedSeenCount}`);
    console.log(`[FeedService]   - Seed posts seen (unique): ${seedSeenCount}`);
    console.log(`[FeedService]   - Interacted posts: ${interactionCount}`);
    console.log(`[FeedService]   - Total unique seen: ${seenPostIds.size}`);
    if (seenPostIds.size > 0) {
      console.log(`[FeedService]   - Sample seen IDs: ${[...seenPostIds].slice(0, 5).join(', ')}`);
    }
    console.log(`[FeedService] ========================================`);

    // Score each post
    // PRIORITY ORDER:
    // 1. UNSEEN posts (never viewed): +10000 to +15000
    // 2. User's OWN posts: +5000 to +8000
    // 3. SEEN posts (already viewed): +0 to +1000 (only engagement score)
    const scoredPosts = posts.map(post => {
      let score = 0; // Start from 0 to ensure proper ordering
      const isOwnPost = post.user_id === userId;
      const hasSeenPost = seenPostIds.has(post.id);

      // ============================================
      // PRIORITY 1: UNSEEN POSTS GET HIGHEST BOOST
      // This ensures fresh content always appears first
      // ============================================
      if (!hasSeenPost && !isOwnPost) {
        score += 10000; // MASSIVE boost for fresh/unseen content
        // Additional boost for recent unseen posts
        const hoursOld = (Date.now() - new Date(post.created_at).getTime()) / (1000 * 60 * 60);
        if (hoursOld < 6) {
          score += 5000; // Very recent unseen posts (< 6 hours)
        } else if (hoursOld < 24) {
          score += 3000; // Recent unseen posts (< 24 hours)
        } else if (hoursOld < 72) {
          score += 1000; // Unseen posts 1-3 days old
        }
      }

      // ============================================
      // PRIORITY 2: User's own posts
      // VERY RECENT own posts (< 1 hour) should appear FIRST (above unseen)
      // This ensures user sees their new post immediately after posting
      // ============================================
      if (isOwnPost) {
        const hoursOld = (Date.now() - new Date(post.created_at).getTime()) / (1000 * 60 * 60);
        if (hoursOld < 1) {
          score += 20000; // HIGHEST PRIORITY - just posted (< 1 hour)
        } else if (hoursOld < 6) {
          score += 15000; // Very recent own posts (1-6 hours) - above unseen
        } else if (hoursOld < 24) {
          score += 8000; // Recent own posts (6-24 hours)
        } else {
          score += 5000; // Older own posts
        }
      }

      // ============================================
      // PRIORITY 3: SEEN posts - sort by engagement and recency
      // When all posts are seen, show most engaging/recent first
      // ============================================
      if (hasSeenPost && !isOwnPost) {
        // SEEN posts: Score based on engagement (capped at 1000 to stay below unseen)
        score += Math.min(post.engagement_score || 0, 500);

        // Add engagement metrics for better sorting among seen posts
        score += Math.min((post.like_count || 0) * 2, 200);
        score += Math.min((post.comment_count || 0) * 5, 200);

        // Recency bonus for seen posts (newer seen posts rank higher)
        const hoursOld = (Date.now() - new Date(post.created_at).getTime()) / (1000 * 60 * 60);
        if (hoursOld < 24) {
          score += 100; // Recent posts get small boost
        } else if (hoursOld < 72) {
          score += 50;
        }
      }

      // ============================================
      // ENGAGEMENT BOOST - Only for unseen and own posts
      // SEEN posts already capped at 1000, don't add more
      // ============================================
      if (!hasSeenPost || isOwnPost) {
        score += (post.like_count || 0) * 1;
        score += (post.comment_count || 0) * 3;
        score += (post.share_count || 0) * 5;
        score += (post.save_count || 0) * 4;

        // Boost if from followed user
        if (followingUsers.includes(post.user_id)) {
          score *= 1.3;
        }

        // Boost if in preferred category
        if (preferredCategories.includes(post.category_id)) {
          score *= 1.2;
        }

        // Boost based on past category engagement
        if (engagedCategories[post.category_id]) {
          score *= (1 + (engagedCategories[post.category_id] * 0.05));
        }

        // Boost if has hashtags user engaged with
        if (post.hashtags && post.hashtags.length > 0) {
          const commonHashtags = post.hashtags.filter(tag => engagedHashtags[tag]);
          score *= (1 + commonHashtags.length * 0.1);
        }

        // Boost if author user engaged with before
        if (engagedAuthors[post.user_id]) {
          score *= (1 + (engagedAuthors[post.user_id] * 0.03));
        }

        // Boost if GEM Master (role = 'gem_master' or 'admin')
        if (post.profiles?.role === 'gem_master' || post.profiles?.role === 'admin') {
          score *= 1.2;
        }
      }

      // Time decay for SEEN posts (reduce their score further over time)
      if (hasSeenPost && !isOwnPost) {
        const hoursOld = (Date.now() - new Date(post.created_at).getTime()) / (1000 * 60 * 60);
        if (hoursOld > 24) {
          // Aggressive decay: seen posts get pushed down fast
          score *= Math.exp(-0.1 * (hoursOld - 24));
        }
      }

      return {
        ...post,
        final_score: score,
        is_own_post: isOwnPost,
        has_seen: hasSeenPost // Track for debugging
      };
    });

    // Log stats for debugging
    const unseenCount = scoredPosts.filter(p => !p.has_seen && !p.is_own_post).length;
    const seenCount = scoredPosts.filter(p => p.has_seen && !p.is_own_post).length;
    const ownCount = scoredPosts.filter(p => p.is_own_post).length;
    console.log(`[FeedService] ========================================`);
    console.log(`[FeedService] SCORING STATS:`);
    console.log(`[FeedService]   - Unseen posts: ${unseenCount}`);
    console.log(`[FeedService]   - Seen posts: ${seenCount}`);
    console.log(`[FeedService]   - Own posts: ${ownCount}`);
    console.log(`[FeedService]   - Total: ${scoredPosts.length}`);
    console.log(`[FeedService] ========================================`);

    // Sort by final_score (user's posts will be at top due to massive boost)
    // Then within user's posts, sort by newest first
    const sortedPosts = scoredPosts.sort((a, b) => {
      // If both are user's posts, sort by created_at (newest first)
      if (a.is_own_post && b.is_own_post) {
        return new Date(b.created_at) - new Date(a.created_at);
      }
      // Otherwise sort by final_score
      return b.final_score - a.final_score;
    });

    // Log top 10 posts for debugging
    console.log(`[FeedService] TOP 10 POSTS AFTER SORTING:`);
    sortedPosts.slice(0, 10).forEach((p, i) => {
      console.log(`[FeedService]   ${i + 1}. Score: ${p.final_score.toFixed(0)} | Seen: ${p.has_seen} | Own: ${p.is_own_post} | ID: ${p.id?.slice(0, 8)}...`);
    });
    console.log(`[FeedService] ========================================`);

    return sortedPosts;

  } catch (error) {
    console.error('[FeedService] Error scoring posts:', error);
    return posts.map(p => ({ ...p, final_score: p.engagement_score || 0 }));
  }
}

// ============================================
// APPLY DIVERSITY RULES
// ============================================

function applyDiversityRules(posts) {
  // SIMPLIFIED: Just return all posts without aggressive filtering
  // The diversity rules were too strict and filtering out most seed posts
  // since they often come from the same seed user

  // Only apply light diversity: don't show more than 3 posts in a row from same author
  const diversified = [];
  let consecutiveSameAuthor = 0;
  let lastAuthorId = null;

  for (const post of posts) {
    const authorId = post.user_id || post.author?.id;

    if (authorId === lastAuthorId) {
      consecutiveSameAuthor++;
      // Allow up to 3 consecutive posts from same author
      if (consecutiveSameAuthor > 3) {
        continue; // Skip this post
      }
    } else {
      consecutiveSameAuthor = 1;
      lastAuthorId = authorId;
    }

    diversified.push(post);
  }

  console.log(`[FeedService] Diversity: ${posts.length} -> ${diversified.length} posts`);
  return diversified;
}

// ============================================
// INSERT ADS (with Sponsor Banners from Database)
// ============================================

async function insertAds(userId, sessionId, posts) {
  try {
    // Check user tier
    const { data: profile } = await supabase
      .from('profiles')
      .select('scanner_tier')
      .eq('id', userId)
      .single();

    const userTier = profile?.scanner_tier || 'FREE';
    console.log(`[FeedService] User tier: ${userTier}, posts count: ${posts.length}`);

    // CHANGED: Show ads for ALL tiers including TIER_3
    // This helps with testing and also promotes other products/courses

    // Fetch sponsor banners from database
    const sponsorBanners = await fetchSponsorBannersForFeed(userId, userTier);
    console.log(`[FeedService] Fetched ${sponsorBanners.length} sponsor banners for feed`);

    // FIXED: Always use fallback ads if no sponsor banners
    // Don't check session - insert fresh ads every time
    const shownAdTypes = []; // Reset - always show ads

    // INCREASED: More ads per feed (3 for FREE, 2 for others)
    const maxAds = userTier === 'FREE' ? 3 : 2;

    // Build feed with ads/banners
    const feed = [];
    let adPosition = FEED_CONFIG.AD_FIRST_POSITION; // First ad at position 5
    let adsInserted = 0;

    posts.forEach((post, index) => {
      feed.push({ type: 'post', data: post });

      // Check if it's time to insert ad/banner
      // FIXED: Simplified condition - just check position and maxAds
      if (index + 1 === adPosition && adsInserted < maxAds) {
        let adItem = null;

        // Only use sponsor banners from database - all ads must be admin-managed
        if (sponsorBanners && adsInserted < sponsorBanners.length) {
          const banner = sponsorBanners[adsInserted];
          adItem = {
            id: banner.id,
            type: 'sponsor_banner',
            title: banner.title,
            description: banner.subtitle,
            cta: banner.action_label,
            link: banner.action_value,
            action_type: banner.action_type,
            image: banner.image_url,
            background_color: banner.background_color,
            text_color: banner.text_color,
            accent_color: banner.accent_color,
            is_dismissible: banner.is_dismissible,
          };
          console.log(`[FeedService] Inserting sponsor banner at position ${index + 1}: ${banner.title}`);
        }
        // No fallback - all ads must come from sponsor_banners table for admin management

        if (adItem) {
          feed.push({ type: 'ad', data: adItem });
          adsInserted++;
          adPosition += FEED_CONFIG.AD_INTERVAL; // Next ad 8 positions later
        }
      }
    });

    console.log(`[FeedService] ✅ Inserted ${adsInserted} ads/banners into feed of ${posts.length} posts`);
    return feed;

  } catch (error) {
    console.error('[FeedService] Error inserting ads:', error);
    return posts.map(post => ({ type: 'post', data: post }));
  }
}

// ============================================
// FETCH SPONSOR BANNERS FOR FEED (INLINE ADS)
// Skip first banner (shown in header) by using offset=1
// ============================================

async function fetchSponsorBannersForFeed(userId, userTier) {
  try {
    const now = new Date().toISOString();

    // Query sponsor banners targeting 'home' screen and user's tier
    let query = supabase
      .from('sponsor_banners')
      .select('*')
      .eq('is_active', true)
      .order('priority', { ascending: false });

    // Filter by date range
    query = query.or(`start_date.is.null,start_date.lte.${now}`);
    query = query.or(`end_date.is.null,end_date.gt.${now}`);

    // Filter by target screens (home feed)
    query = query.contains('target_screens', ['home']);

    // Filter by target tiers
    query = query.contains('target_tiers', [userTier.toUpperCase()]);

    const { data: banners, error } = await query;

    if (error) {
      console.error('[FeedService] Error fetching sponsor banners:', error);
      return [];
    }

    // Filter out dismissed banners
    let filteredBanners = banners || [];
    if (userId && filteredBanners.length > 0) {
      const { data: dismissed } = await supabase
        .from('dismissed_banners')
        .select('banner_id')
        .eq('user_id', userId);

      const dismissedIds = new Set(dismissed?.map(d => d.banner_id) || []);
      filteredBanners = filteredBanners.filter(b => !dismissedIds.has(b.id));
    }

    // IMPORTANT: Skip the first banner (shown in header by SponsorBannerSection)
    // This ensures no duplication between header and inline ads
    const inlineBanners = filteredBanners.slice(1); // offset=1 to skip first banner

    console.log(`[FeedService] Sponsor banners: ${filteredBanners.length} total, ${inlineBanners.length} for inline (skipped 1 for header)`);

    return inlineBanners;
  } catch (error) {
    console.error('[FeedService] fetchSponsorBannersForFeed error:', error);
    return [];
  }
}

// ============================================
// NOTE: All ads/banners are now managed via sponsor_banners table
// No hardcoded fallback ads - admin must add banners via Admin panel
// ============================================

// ============================================
// TRACK IMPRESSIONS
// Tracks both real posts (feed_impressions) and seed posts (seed_impressions)
// Uses individual inserts with proper error handling
// ============================================

async function trackImpressions(userId, sessionId, feed) {
  try {
    // OPTIMIZED: Use batch upsert instead of individual inserts
    const feedImpressions = [];
    const seedImpressions = [];

    feed.forEach((item, index) => {
      if (item.type === 'post' && item.data?.id) {
        const impression = {
          user_id: userId,
          post_id: item.data.id,
          position: index + 1,
          session_id: sessionId || 'default',
          shown_at: new Date().toISOString()
        };

        if (item.data.is_seed_post) {
          seedImpressions.push(impression);
        } else {
          feedImpressions.push(impression);
        }
      }
    });

    // Batch upsert - ignore duplicates with onConflict
    if (feedImpressions.length > 0) {
      await supabase
        .from('feed_impressions')
        .upsert(feedImpressions, { onConflict: 'user_id,post_id', ignoreDuplicates: true });
    }

    if (seedImpressions.length > 0) {
      await supabase
        .from('seed_impressions')
        .upsert(seedImpressions, { onConflict: 'user_id,post_id', ignoreDuplicates: true });
    }

    console.log(`[FeedService] ✅ Batch tracked: ${feedImpressions.length} feed + ${seedImpressions.length} seed`);

  } catch (error) {
    console.error('[FeedService] Error tracking impressions:', error);
  }
}

// ============================================
// PAGINATION - GET NEXT PAGE
// ============================================

export async function getNextFeedPage(userId, sessionId, lastPostId, limit = 20) {
  try {
    console.log(`[FeedService] getNextFeedPage - lastPostId: ${lastPostId}, limit: ${limit}`);

    // OPTIMIZED: Find lastCreatedAt from both tables in parallel
    const [forumPostResult, seedPostResult] = await Promise.all([
      supabase.from('forum_posts').select('created_at').eq('id', lastPostId).single(),
      supabase.from('seed_posts').select('created_at').eq('id', lastPostId).single(),
    ]);

    const lastCreatedAt = forumPostResult.data?.created_at || seedPostResult.data?.created_at;

    if (!lastCreatedAt) {
      console.log('[FeedService] Last post not found in any table, stopping pagination');
      return { feed: [], sessionId, hasMore: false };
    }

    console.log(`[FeedService] Fetching posts older than: ${lastCreatedAt}`);

    // OPTIMIZED: Fetch forum posts and seed posts in parallel (no need for prefs here)
    const [forumResult, seedResult] = await Promise.all([
      supabase
        .from('forum_posts')
        .select(POST_SELECT_FAST)
        .eq('status', 'published')
        .lt('created_at', lastCreatedAt)
        .order('created_at', { ascending: false })
        .limit(limit),
      supabase
        .from('seed_posts')
        .select(SEED_POST_SELECT_QUERY)
        .eq('status', 'published')
        .lt('created_at', lastCreatedAt)
        .order('created_at', { ascending: false })
        .limit(limit),
    ]);

    const forumPosts = forumResult.data || [];
    const seedPosts = seedResult.data || [];

    if (forumResult.error) {
      console.error('[FeedService] Forum posts query error:', forumResult.error);
    }

    // Transform forum posts for PostCard compatibility
    const transformedForumPosts = forumPosts.map(post => ({
      ...post,
      feed_source: 'pagination',
      author: post.profiles,
      category: post.categories,
      is_own_post: post.user_id === userId,
    }));

    // Transform seed posts for PostCard compatibility
    const transformedSeedPosts = (seedPosts || []).map(post => ({
      ...post,
      is_seed_post: true,
      feed_source: 'seed_pagination',
      author: post.seed_users ? {
        id: post.seed_users.id,
        full_name: post.seed_users.full_name,
        username: post.seed_users.full_name?.toLowerCase().replace(/\s+/g, '_'),
        avatar_url: post.seed_users.avatar_url,
        role: post.seed_users.is_premium_seed ? 'premium_user' : 'user',
        seed_persona: post.seed_users.seed_persona,
        scanner_tier: post.seed_users.tier === 'vip' ? 'TIER_3' : post.seed_users.tier === 'premium' ? 'TIER_2' : 'FREE',
      } : null,
      category: null,
    }));

    // Combine and sort by created_at (newest first)
    const allPosts = [...transformedForumPosts, ...transformedSeedPosts];
    allPosts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    console.log(`[FeedService] getNextFeedPage fetched ${forumPosts.length} forum + ${seedPosts.length} seed = ${allPosts.length} total`);

    // OPTIMIZED: Skip expensive scorePostsForUser for pagination
    // Just apply light diversity rules and use lightweight ads
    const diversifiedPosts = applyDiversityRules(allPosts).slice(0, limit);

    // Use lightweight ad insertion (no extra profile query needed)
    const feedWithAds = await insertAdsLight(userId, sessionId,
      diversifiedPosts.map(post => ({ type: 'post', data: post, score: 0 }))
    );

    // INFINITE SCROLL: hasMore is true as long as we got any posts
    const hasMore = allPosts.length > 0;
    console.log(`[FeedService] getNextFeedPage returning ${feedWithAds.length} items, hasMore: ${hasMore}`);

    return { feed: feedWithAds, sessionId, hasMore };

  } catch (error) {
    console.error('[FeedService] Error getting next feed page:', error);
    // Return empty but keep hasMore true to allow retry
    return { feed: [], sessionId, hasMore: true };
  }
}

// ============================================
// FOLLOW/UNFOLLOW USER
// ============================================

export async function followUser(userId, targetUserId) {
  try {
    const { data: prefs } = await supabase
      .from('user_feed_preferences')
      .select('following_users')
      .eq('user_id', userId)
      .single();

    const following = prefs?.following_users || [];

    if (!following.includes(targetUserId)) {
      following.push(targetUserId);

      await supabase
        .from('user_feed_preferences')
        .upsert({
          user_id: userId,
          following_users: following,
          updated_at: new Date().toISOString()
        });
    }

    return { success: true, following };
  } catch (error) {
    console.error('[FeedService] Error following user:', error);
    return { success: false, error: error.message };
  }
}

export async function unfollowUser(userId, targetUserId) {
  try {
    const { data: prefs } = await supabase
      .from('user_feed_preferences')
      .select('following_users')
      .eq('user_id', userId)
      .single();

    let following = prefs?.following_users || [];
    following = following.filter(id => id !== targetUserId);

    await supabase
      .from('user_feed_preferences')
      .upsert({
        user_id: userId,
        following_users: following,
        updated_at: new Date().toISOString()
      });

    return { success: true, following };
  } catch (error) {
    console.error('[FeedService] Error unfollowing user:', error);
    return { success: false, error: error.message };
  }
}

// ============================================
// CHECK IF FOLLOWING
// ============================================

export async function isFollowing(userId, targetUserId) {
  try {
    const { data: prefs } = await supabase
      .from('user_feed_preferences')
      .select('following_users')
      .eq('user_id', userId)
      .single();

    const following = prefs?.following_users || [];
    return following.includes(targetUserId);
  } catch (error) {
    console.error('[FeedService] Error checking following status:', error);
    return false;
  }
}

// ============================================
// UPDATE FEED PREFERENCES
// ============================================

export async function updateFeedPreferences(userId, preferences) {
  try {
    const { error } = await supabase
      .from('user_feed_preferences')
      .upsert({
        user_id: userId,
        ...preferences,
        updated_at: new Date().toISOString()
      });

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('[FeedService] Error updating preferences:', error);
    return { success: false, error: error.message };
  }
}

// ============================================
// DEBUG: Reset all impressions for user
// Call this to make all posts appear as "unseen" again
// ============================================

export async function resetAllImpressions(userId) {
  try {
    console.log(`[FeedService] 🔄 RESETTING ALL IMPRESSIONS for user: ${userId}`);

    // Delete from feed_impressions
    const { error: feedError, count: feedCount } = await supabase
      .from('feed_impressions')
      .delete()
      .eq('user_id', userId);

    if (feedError) {
      console.error('[FeedService] Error deleting feed_impressions:', feedError);
    } else {
      console.log(`[FeedService] ✅ Deleted ${feedCount || 'all'} feed_impressions`);
    }

    // Delete from seed_impressions
    const { error: seedError, count: seedCount } = await supabase
      .from('seed_impressions')
      .delete()
      .eq('user_id', userId);

    if (seedError) {
      console.log('[FeedService] ⚠️ seed_impressions error (table may not exist):', seedError.message);
    } else {
      console.log(`[FeedService] ✅ Deleted ${seedCount || 'all'} seed_impressions`);
    }

    // Note: We don't delete post_interactions as those are actual user actions

    console.log(`[FeedService] ✅ RESET COMPLETE - All posts should now appear as UNSEEN`);
    return { success: true };
  } catch (error) {
    console.error('[FeedService] Error resetting impressions:', error);
    return { success: false, error: error.message };
  }
}

// ============================================
// DEBUG: Get impression stats for user
// ============================================

export async function getImpressionStats(userId) {
  try {
    // Count feed_impressions
    const { count: feedCount } = await supabase
      .from('feed_impressions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    // Count seed_impressions
    let seedCount = 0;
    try {
      const { count } = await supabase
        .from('seed_impressions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);
      seedCount = count || 0;
    } catch (e) {
      // Table may not exist
    }

    // Count seed posts total
    const { count: totalSeedPosts } = await supabase
      .from('seed_posts')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'published');

    // Count forum posts total
    const { count: totalForumPosts } = await supabase
      .from('forum_posts')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'published');

    const stats = {
      feedImpressionsCount: feedCount || 0,
      seedImpressionsCount: seedCount,
      totalSeedPosts: totalSeedPosts || 0,
      totalForumPosts: totalForumPosts || 0,
      totalImpressions: (feedCount || 0) + seedCount,
      totalPosts: (totalSeedPosts || 0) + (totalForumPosts || 0),
      unseenPosts: (totalSeedPosts || 0) + (totalForumPosts || 0) - (feedCount || 0) - seedCount
    };

    console.log('[FeedService] 📊 IMPRESSION STATS:', stats);
    return stats;
  } catch (error) {
    console.error('[FeedService] Error getting impression stats:', error);
    return null;
  }
}

// ============================================
// TRACK VISIBLE IMPRESSIONS (called when posts become visible on screen)
// This ensures we only mark posts as "seen" when user actually sees them
// Uses individual inserts with duplicate handling
// ============================================

export async function trackVisibleImpressions(userId, sessionId, visiblePosts) {
  if (!userId || !visiblePosts || visiblePosts.length === 0) {
    return;
  }

  try {
    const feedImpressions = [];
    const seedImpressions = [];

    visiblePosts.forEach((item, index) => {
      if (item.type !== 'post' || !item.data?.id) return;

      const impression = {
        user_id: userId,
        post_id: item.data.id,
        position: index + 1,
        session_id: sessionId || 'default',
        shown_at: new Date().toISOString()
      };

      if (item.data.is_seed_post) {
        seedImpressions.push(impression);
      } else {
        feedImpressions.push(impression);
      }
    });

    // OPTIMIZED: Batch upsert instead of one-by-one
    const promises = [];

    if (feedImpressions.length > 0) {
      promises.push(
        supabase
          .from('feed_impressions')
          .upsert(feedImpressions, { onConflict: 'user_id,post_id', ignoreDuplicates: true })
      );
    }

    if (seedImpressions.length > 0) {
      promises.push(
        supabase
          .from('seed_impressions')
          .upsert(seedImpressions, { onConflict: 'user_id,post_id', ignoreDuplicates: true })
      );
    }

    // Run in parallel, don't wait
    Promise.all(promises).catch(err => {
      console.warn('[FeedService] Visible impressions batch error:', err?.message);
    });

  } catch (error) {
    // Non-critical - don't throw
  }
}

// ============================================
// PHASE 4: FEED BY TYPE (Hot, Trending, Latest)
// Simple queries for FeedTabs component
// ============================================

/**
 * Get posts sorted by hot_score (Noi bat)
 */
export async function getHotPosts(limit = 20, offset = 0) {
  try {
    const { data, error } = await supabase
      .from('forum_posts')
      .select(POST_SELECT_QUERY)
      .eq('status', 'published')
      .or('is_deleted.is.null,is_deleted.eq.false')
      .order('hot_score', { ascending: false, nullsFirst: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return (data || []).map(post => ({
      ...post,
      author: post.profiles,
      category: post.categories,
    }));
  } catch (error) {
    console.error('[FeedService] getHotPosts error:', error);
    return [];
  }
}

/**
 * Get posts sorted by trending_score (Xu huong)
 */
export async function getTrendingPosts(limit = 20, offset = 0) {
  try {
    // Only posts from last 48 hours for trending
    const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from('forum_posts')
      .select(POST_SELECT_QUERY)
      .eq('status', 'published')
      .or('is_deleted.is.null,is_deleted.eq.false')
      .gte('created_at', cutoff)
      .order('trending_score', { ascending: false, nullsFirst: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return (data || []).map(post => ({
      ...post,
      author: post.profiles,
      category: post.categories,
    }));
  } catch (error) {
    console.error('[FeedService] getTrendingPosts error:', error);
    return [];
  }
}

/**
 * Get posts sorted by created_at (Moi nhat)
 */
export async function getLatestPosts(limit = 20, offset = 0) {
  try {
    const { data, error } = await supabase
      .from('forum_posts')
      .select(POST_SELECT_QUERY)
      .eq('status', 'published')
      .or('is_deleted.is.null,is_deleted.eq.false')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return (data || []).map(post => ({
      ...post,
      author: post.profiles,
      category: post.categories,
    }));
  } catch (error) {
    console.error('[FeedService] getLatestPosts error:', error);
    return [];
  }
}

/**
 * Refresh scores for recent posts (call after batch operations)
 */
export async function refreshRecentScores() {
  try {
    const { data, error } = await supabase.rpc('refresh_recent_post_scores');
    if (error) {
      console.warn('[FeedService] refreshRecentScores error:', error);
      return 0;
    }
    return data || 0;
  } catch (error) {
    console.error('[FeedService] refreshRecentScores failed:', error);
    return 0;
  }
}

// ============================================
// EXPORTS
// ============================================

export default {
  generateFeed,
  getNextFeedPage,
  followUser,
  unfollowUser,
  isFollowing,
  updateFeedPreferences,
  resetAllImpressions,
  getImpressionStats,
  trackVisibleImpressions,
  // Phase 4: Feed by type
  getHotPosts,
  getTrendingPosts,
  getLatestPosts,
  refreshRecentScores,
};
