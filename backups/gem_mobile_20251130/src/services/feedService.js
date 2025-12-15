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

// ============================================
// CONFIGURATION
// ============================================

const FEED_CONFIG = {
  DEFAULT_LIMIT: 30,
  FOLLOWING_WEIGHT: 0.6,
  DISCOVERY_WEIGHT: 0.3,
  SERENDIPITY_WEIGHT: 0.1,
  AD_FIRST_POSITION: 5,
  AD_INTERVAL: 8, // 1 ad per 8 organic posts
  MAX_ADS_PER_SESSION: 2,
  CACHE_TTL: 300, // 5 minutes
};

// ============================================
// MAIN FEED GENERATION FUNCTION
// ============================================

export async function generateFeed(userId, sessionId = null, limit = FEED_CONFIG.DEFAULT_LIMIT) {
  try {
    // Generate session ID if not provided
    if (!sessionId) {
      sessionId = generateUUID();
    }

    console.log(`[FeedService] Generating feed for user ${userId}, session ${sessionId}`);

    // Step 1: Get user preferences
    const userPrefs = await getUserPreferences(userId);

    // Step 2: Calculate weights
    const followingLimit = Math.floor(limit * (userPrefs.discovery_weight === null ?
      FEED_CONFIG.FOLLOWING_WEIGHT : 1 - userPrefs.discovery_weight));
    const discoveryLimit = Math.floor(limit * (userPrefs.discovery_weight || FEED_CONFIG.DISCOVERY_WEIGHT));
    const serendipityLimit = Math.ceil(limit * FEED_CONFIG.SERENDIPITY_WEIGHT);

    console.log(`[FeedService] Fetching: ${followingLimit} following, ${discoveryLimit} discovery, ${serendipityLimit} serendipity`);

    // Step 3: Fetch posts from different sources
    const [followingPosts, discoveryPosts, serendipityPosts] = await Promise.all([
      getFollowingPosts(userId, followingLimit, sessionId),
      getDiscoveryPosts(userId, discoveryLimit, sessionId),
      getSerendipityPosts(userId, serendipityLimit, sessionId)
    ]);

    // Step 4: Combine all posts with deduplication
    const allPostsRaw = [...followingPosts, ...discoveryPosts, ...serendipityPosts];

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

    // Step 5: Score posts for this user
    const scoredPosts = await scorePostsForUser(userId, allPosts);

    // Step 6: Apply diversity rules
    const diversifiedPosts = applyDiversityRules(scoredPosts);

    // Step 7: Insert ads (if user tier allows)
    const feedWithAds = await insertAds(userId, sessionId, diversifiedPosts);

    // Step 8: Track impressions
    await trackImpressions(userId, sessionId, feedWithAds);

    console.log(`[FeedService] Generated feed with ${feedWithAds.length} items (${diversifiedPosts.length} posts + ${feedWithAds.length - diversifiedPosts.length} ads)`);

    return {
      feed: feedWithAds.slice(0, limit),
      sessionId,
      hasMore: allPosts.length >= limit
    };

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

    // Get posts from followed users
    const { data: posts, error } = await supabase
      .from('forum_posts')
      .select(`
        *,
        profiles:user_id (
          id,
          username,
          avatar_url,
          role
        ),
        categories:category_id (
          id,
          name
        )
      `)
      .in('user_id', allFollowing)
      .eq('status', 'published')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()) // Last 7 days
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    // Add metadata
    return (posts || []).map(post => ({
      ...post,
      feed_source: 'following'
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

    // Get posts recently shown to avoid duplicates
    const { data: recentlyShown } = await supabase
      .from('feed_impressions')
      .select('post_id')
      .eq('user_id', userId)
      .gte('shown_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .limit(100);

    const recentPostIds = recentlyShown?.map(r => r.post_id) || [];

    // Build query
    let query = supabase
      .from('forum_posts')
      .select(`
        *,
        profiles:user_id (
          id,
          username,
          avatar_url,
          role
        ),
        categories:category_id (
          id,
          name
        )
      `)
      .neq('user_id', userId) // Not own posts
      .eq('status', 'published')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    // Filter by categories if available
    const uniqueCategories = [...new Set(engagedCategories)];
    if (uniqueCategories.length > 0) {
      query = query.in('category_id', uniqueCategories);
    }

    const { data: posts, error } = await query
      .order('engagement_score', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit * 2); // Get more to filter out recently shown

    if (error) throw error;

    // Filter out recently shown posts
    const filteredPosts = (posts || []).filter(post => !recentPostIds.includes(post.id));

    return filteredPosts.slice(0, limit).map(post => ({
      ...post,
      feed_source: 'discovery'
    }));

  } catch (error) {
    console.error('[FeedService] Error getting discovery posts:', error);
    return [];
  }
}

// ============================================
// GET SERENDIPITY POSTS (Random exploration)
// ============================================

async function getSerendipityPosts(userId, limit, sessionId) {
  try {
    // Get completely random posts from categories user hasn't engaged with much
    const { data: posts, error } = await supabase
      .from('forum_posts')
      .select(`
        *,
        profiles:user_id (
          id,
          username,
          avatar_url,
          role
        ),
        categories:category_id (
          id,
          name
        )
      `)
      .neq('user_id', userId)
      .eq('status', 'published')
      .gte('created_at', new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()) // Last 3 days only
      .order('created_at', { ascending: false })
      .limit(limit * 3); // Get more to filter

    if (error) throw error;

    // Randomly sample
    const shuffled = (posts || []).sort(() => 0.5 - Math.random());

    return shuffled.slice(0, limit).map(post => ({
      ...post,
      feed_source: 'serendipity'
    }));

  } catch (error) {
    console.error('[FeedService] Error getting serendipity posts:', error);
    return [];
  }
}

// ============================================
// SCORE POSTS FOR USER
// ============================================

async function scorePostsForUser(userId, posts) {
  try {
    // Get user's interaction history for scoring
    const { data: userHistory } = await supabase
      .from('post_interactions')
      .select('post_id, interaction_type, forum_posts(category_id, hashtags, user_id)')
      .eq('user_id', userId)
      .limit(500);

    // Extract patterns
    const engagedCategories = {};
    const engagedHashtags = {};
    const engagedAuthors = {};

    userHistory?.forEach(interaction => {
      if (interaction.forum_posts) {
        // Count category engagement
        const categoryId = interaction.forum_posts.category_id;
        if (categoryId) {
          engagedCategories[categoryId] = (engagedCategories[categoryId] || 0) + 1;
        }

        // Count hashtag engagement
        interaction.forum_posts.hashtags?.forEach(tag => {
          engagedHashtags[tag] = (engagedHashtags[tag] || 0) + 1;
        });

        // Count author engagement
        const authorId = interaction.forum_posts.user_id;
        if (authorId) {
          engagedAuthors[authorId] = (engagedAuthors[authorId] || 0) + 1;
        }
      }
    });

    // Get user preferences
    const { data: prefs } = await supabase
      .from('user_feed_preferences')
      .select('following_users, preferred_categories')
      .eq('user_id', userId)
      .single();

    const followingUsers = prefs?.following_users || [];
    const preferredCategories = prefs?.preferred_categories || [];

    // Score each post
    return posts.map(post => {
      let score = post.engagement_score || 0;

      // Base score boost from engagement metrics
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

      // Time decay (posts older than 24 hours lose score)
      const hoursOld = (Date.now() - new Date(post.created_at).getTime()) / (1000 * 60 * 60);
      if (hoursOld > 24) {
        score *= Math.exp(-0.05 * (hoursOld - 24));
      }

      return {
        ...post,
        final_score: score
      };
    }).sort((a, b) => b.final_score - a.final_score);

  } catch (error) {
    console.error('[FeedService] Error scoring posts:', error);
    return posts.map(p => ({ ...p, final_score: p.engagement_score || 0 }));
  }
}

// ============================================
// APPLY DIVERSITY RULES
// ============================================

function applyDiversityRules(posts) {
  const diversified = [];
  const recentAuthors = [];
  const recentCategories = [];

  for (const post of posts) {
    // Don't show 2 posts from same author in a row
    if (recentAuthors[0] === post.user_id) {
      continue; // Skip this post, try next
    }

    // Don't show 2 posts from same category in a row
    if (recentCategories[0] === post.category_id) {
      continue;
    }

    // Add to feed
    diversified.push(post);

    // Track recent
    recentAuthors.unshift(post.user_id);
    recentCategories.unshift(post.category_id);

    // Keep only last 2 in memory
    if (recentAuthors.length > 2) recentAuthors.pop();
    if (recentCategories.length > 2) recentCategories.pop();
  }

  return diversified;
}

// ============================================
// INSERT ADS
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

    // No ads for TIER 3
    if (userTier === 'TIER_3') {
      console.log('[FeedService] TIER 3 user - no ads');
      return posts.map(post => ({ type: 'post', data: post }));
    }

    // Get recent ad impressions this session
    const { data: recentAds } = await supabase
      .from('ad_impressions')
      .select('ad_type')
      .eq('user_id', userId)
      .eq('session_id', sessionId)
      .limit(10);

    const shownAdTypes = recentAds?.map(ad => ad.ad_type) || [];
    const adCount = shownAdTypes.length;

    // Max 2 ads per session for FREE users
    const maxAds = userTier === 'FREE' ? 2 : 1;

    if (adCount >= maxAds) {
      console.log(`[FeedService] Already shown ${adCount} ads - no more ads this session`);
      return posts.map(post => ({ type: 'post', data: post }));
    }

    // Build feed with ads
    const feed = [];
    let adPosition = FEED_CONFIG.AD_FIRST_POSITION; // First ad at position 5
    let adsInserted = 0;

    posts.forEach((post, index) => {
      feed.push({ type: 'post', data: post });

      // Check if it's time to insert ad
      if (
        index + 1 === adPosition &&
        adsInserted < maxAds &&
        adsInserted < Math.floor(posts.length / FEED_CONFIG.AD_INTERVAL)
      ) {
        const ad = selectAdForUser(userId, userTier, shownAdTypes, adsInserted);
        if (ad) {
          feed.push({ type: 'ad', data: ad });
          adsInserted++;
          adPosition += FEED_CONFIG.AD_INTERVAL; // Next ad 8 positions later
        }
      }
    });

    console.log(`[FeedService] Inserted ${adsInserted} ads into feed`);
    return feed;

  } catch (error) {
    console.error('[FeedService] Error inserting ads:', error);
    return posts.map(post => ({ type: 'post', data: post }));
  }
}

// ============================================
// SELECT AD FOR USER
// ============================================

function selectAdForUser(userId, userTier, shownAdTypes, adIndex) {
  const ad = {
    id: generateUUID(),
    type: null,
    title: '',
    description: '',
    cta: '',
    link: '',
    image: null
  };

  // Priority 1: Tier upgrade (if applicable and not shown yet)
  if (userTier === 'FREE' && !shownAdTypes.includes('tier_upgrade_1')) {
    ad.type = 'tier_upgrade_1';
    ad.title = '🚀 Nâng cấp lên TIER 1';
    ad.description = 'Mở khóa Zone Retest Scanner và 10+ công cụ phân tích chuyên nghiệp';
    ad.cta = 'Nâng cấp ngay - 11M VNĐ';
    ad.link = '/upgrade/tier1';
    ad.image = 'https://gemral.com/images/tier1-ad.jpg';
    return ad;
  }

  if (userTier === 'TIER_1' && !shownAdTypes.includes('tier_upgrade_2')) {
    ad.type = 'tier_upgrade_2';
    ad.title = '⚡ Nâng cấp lên TIER 2';
    ad.description = 'Whale Tracking + AI Predictions + Backtesting Engine Pro';
    ad.cta = 'Nâng cấp ngay - 21M VNĐ';
    ad.link = '/upgrade/tier2';
    ad.image = 'https://gemral.com/images/tier2-ad.jpg';
    return ad;
  }

  // Priority 2: Affiliate product (if not shown yet)
  if (!shownAdTypes.includes('affiliate_product')) {
    ad.type = 'affiliate_product';
    ad.title = '📒 Top Trading Journals trên Amazon';
    ad.description = 'Sổ tay giao dịch được đánh giá cao nhất - Track & improve your trades';
    ad.cta = 'Xem ngay';
    ad.link = 'https://amzn.to/trading-journal';
    ad.image = 'https://gemral.com/images/journal-ad.jpg';
    return ad;
  }

  // Priority 3: Course promo
  if (!shownAdTypes.includes('course_promo')) {
    ad.type = 'course_promo';
    ad.title = '🔮 Khóa học mới: Crystal Healing cho Traders';
    ad.description = 'Kết hợp Trading & Spiritual Wellness - Giảm stress, tăng focus';
    ad.cta = 'Tìm hiểu thêm';
    ad.link = '/academy/crystal-healing';
    ad.image = 'https://gemral.com/images/crystal-course.jpg';
    return ad;
  }

  // No more ads to show
  return null;
}

// ============================================
// TRACK IMPRESSIONS
// ============================================

async function trackImpressions(userId, sessionId, feed) {
  try {
    const impressions = [];
    const adImpressions = [];

    feed.forEach((item, index) => {
      if (item.type === 'post') {
        impressions.push({
          user_id: userId,
          post_id: item.data.id,
          position: index + 1,
          session_id: sessionId,
          shown_at: new Date().toISOString()
        });
      } else if (item.type === 'ad') {
        adImpressions.push({
          user_id: userId,
          ad_type: item.data.type,
          ad_content: {
            title: item.data.title,
            description: item.data.description,
            link: item.data.link
          },
          position: index + 1,
          session_id: sessionId,
          shown_at: new Date().toISOString()
        });
      }
    });

    // Batch insert
    if (impressions.length > 0) {
      await supabase.from('feed_impressions').insert(impressions);
    }

    if (adImpressions.length > 0) {
      await supabase.from('ad_impressions').insert(adImpressions);
    }

    console.log(`[FeedService] Tracked ${impressions.length} post impressions and ${adImpressions.length} ad impressions`);

  } catch (error) {
    console.error('[FeedService] Error tracking impressions:', error);
    // Don't throw - this is non-critical
  }
}

// ============================================
// PAGINATION - GET NEXT PAGE
// ============================================

export async function getNextFeedPage(userId, sessionId, lastPostId, limit = 30) {
  try {
    // Get posts older than lastPostId
    const { data: lastPost } = await supabase
      .from('forum_posts')
      .select('created_at')
      .eq('id', lastPostId)
      .single();

    if (!lastPost) {
      return generateFeed(userId, sessionId, limit);
    }

    // Get user preferences
    const userPrefs = await getUserPreferences(userId);
    const followingUsers = userPrefs.following_users || [];

    // Fetch older posts
    let query = supabase
      .from('forum_posts')
      .select(`
        *,
        profiles:user_id (
          id,
          username,
          avatar_url,
          role
        ),
        categories:category_id (
          id,
          name
        )
      `)
      .eq('status', 'active')
      .lt('created_at', lastPost.created_at)
      .order('created_at', { ascending: false })
      .limit(limit * 2);

    const { data: posts, error } = await query;

    if (error) throw error;

    // Score and diversify
    const scoredPosts = await scorePostsForUser(userId, posts || []);
    const diversifiedPosts = applyDiversityRules(scoredPosts);

    // Insert ads
    const feedWithAds = await insertAds(userId, sessionId, diversifiedPosts.slice(0, limit));

    // Track impressions
    await trackImpressions(userId, sessionId, feedWithAds);

    return {
      feed: feedWithAds,
      sessionId,
      hasMore: (posts || []).length >= limit
    };

  } catch (error) {
    console.error('[FeedService] Error getting next feed page:', error);
    throw error;
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
// EXPORTS
// ============================================

export default {
  generateFeed,
  getNextFeedPage,
  followUser,
  unfollowUser,
  isFollowing,
  updateFeedPreferences
};
