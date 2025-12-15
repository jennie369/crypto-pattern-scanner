/**
 * Gemral - Forum Service
 * Handles all forum-related API calls
 * COMPLETE IMPLEMENTATION
 *
 * UNIFIED FEED SYSTEM:
 * - All feeds (Dành cho bạn, SideMenu categories, tabs) use same features
 * - Impressions tracking (seen posts)
 * - Scoring algorithm (unseen posts first)
 * - Ads/sponsor banners
 * - Infinite scroll
 */

import { supabase } from './supabase';

// Simple UUID generator
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Helper: Fetch seed posts and transform to match forum_posts format
// Now supports feed type filtering for SideMenu categories
// FIXED: Added pagination support (page parameter)
async function fetchSeedPosts(limit = 20, feedType = null, page = 1) {
  try {
    let query = supabase
      .from('seed_posts')
      .select(`
        *,
        seed_users:user_id (
          id,
          full_name,
          avatar_url,
          seed_persona,
          tier,
          is_premium_seed
        )
      `, { count: 'exact' })
      .eq('status', 'published');

    // Apply feed type filter based on seed_topic or content keywords
    if (feedType && feedType !== 'explore') {
      const keywords = FEED_KEYWORDS[feedType];
      if (keywords && keywords.length > 0) {
        // Build OR filter for seed_topic and title/content keywords
        const topicFilter = `seed_topic.eq.${feedType}`;
        const keywordFilters = keywords.slice(0, 5).map(kw =>
          `title.ilike.%${kw}%,content.ilike.%${kw}%`
        ).join(',');
        query = query.or(`${topicFilter},${keywordFilters}`);
      }
    }

    // Apply pagination using range instead of limit
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    query = query
      .order('created_at', { ascending: false })
      .range(from, to);

    const { data: posts, error, count } = await query;

    if (error) {
      console.error('[ForumService] fetchSeedPosts error:', error);
      return { posts: [], count: 0, hasMore: false };
    }

    const totalCount = count || 0;
    const hasMoreSeed = (page * limit) < totalCount;

    console.log(`[ForumService] Fetched ${posts?.length || 0}/${totalCount} seed posts (page ${page}) for feed: ${feedType || 'all'}`);

    // Transform seed posts to match forum_posts format for PostCard compatibility
    const transformedPosts = (posts || []).map(post => ({
      ...post,
      is_seed_post: true,
      feed_source: 'seed',
      // Map seed_users to author format
      author: post.seed_users ? {
        id: post.seed_users.id,
        full_name: post.seed_users.full_name,
        username: post.seed_users.full_name?.toLowerCase().replace(/\s+/g, '_'),
        avatar_url: post.seed_users.avatar_url,
        role: post.seed_users.is_premium_seed ? 'premium_user' : 'user',
        seed_persona: post.seed_users.seed_persona,
        scanner_tier: post.seed_users.tier === 'vip' ? 'TIER_3' : post.seed_users.tier === 'premium' ? 'TIER_2' : 'FREE',
      } : null,
      // Clear seed_users to avoid confusion
      profiles: post.seed_users ? {
        id: post.seed_users.id,
        full_name: post.seed_users.full_name,
        avatar_url: post.seed_users.avatar_url,
        role: post.seed_users.is_premium_seed ? 'premium_user' : 'user',
      } : null,
      category: null,
      likes: [],
      saved: [],
      user_liked: false,
      user_saved: false,
    }));

    // Return object with pagination info
    return {
      posts: transformedPosts,
      count: totalCount,
      hasMore: hasMoreSeed,
    };
  } catch (error) {
    console.error('[ForumService] fetchSeedPosts error:', error);
    return { posts: [], count: 0, hasMore: false };
  }
}

// Keyword mapping for feed filtering - Gemral Philosophy
// Posts containing these keywords/hashtags will be shown in respective feeds
const FEED_KEYWORDS = {
  // Trading Track 🎯
  'trading': ['trading', 'giao dịch', 'btc', 'eth', 'crypto', 'forex', 'coin', 'market', 'thị trường', 'buy', 'sell', 'mua', 'bán', 'long', 'short', 'entry', 'tp', 'sl', '#trading', '#giaodich'],
  'patterns': ['pattern', 'mẫu hình', 'head shoulder', 'đầu vai', 'triangle', 'tam giác', 'wedge', 'nêm', 'channel', 'kênh', 'breakout', 'support', 'resistance', 'fibonacci', 'indicator', '#pattern', '#gemmethod'],
  'results': ['profit', 'lợi nhuận', 'loss', 'lỗ', 'P/L', 'ROI', 'win', 'lose', 'thắng', 'thua', 'kết quả', 'result', '+%', '-%', '#tradingresult', '#ketqua'],

  // Wellness Track ☯️
  'wellness': ['crystal', 'đá quý', 'tinh thể', 'năng lượng', 'energy', 'healing', 'chữa lành', 'thạch anh', 'amethyst', 'citrine', 'rose quartz', 'jade', 'chakra', '#crystal', '#daquy', '#healing'],
  'meditation': ['thiền', 'meditation', 'mindfulness', 'chánh niệm', 'breath', 'thở', 'relax', 'thư giãn', 'calm', 'bình an', 'yoga', '#meditation', '#thien', '#mindfulness'],
  'growth': ['phát triển', 'growth', 'personal', 'bản thân', 'học hỏi', 'learning', 'improve', 'cải thiện', 'habit', 'thói quen', 'success', 'thành công', 'motivation', 'động lực', '#personalgrowth', '#phattrienbanThan'],

  // Integration Track 🌟
  'mindful-trading': ['chánh niệm', 'mindful', 'tâm lý', 'psychology', 'emotion', 'cảm xúc', 'discipline', 'kỷ luật', 'patience', 'kiên nhẫn', 'balance', 'cân bằng', 'stress', 'áp lực', '#mindfultrading', '#chanhniem'],
  'sieu-giau': ['giàu', 'rich', 'wealthy', 'thành công', 'success', 'câu chuyện', 'story', 'tỷ phú', 'triệu phú', 'abundance', 'thịnh vượng', 'đột phá', 'breakthrough', '#success', '#sieugiau', '#thanhcong'],

  // Earn Track 💰
  'earn': ['kiếm tiền', 'affiliate', 'cộng tác', 'CTV', 'hoa hồng', 'commission', 'referral', 'giới thiệu', 'income', 'thu nhập', 'passive', '#affiliate', '#kiemtien', '#CTV'],
};

// ============================================
// UNIFIED FEED HELPERS
// ============================================

// Get user's seen post IDs (both feed_impressions and seed_impressions)
async function getSeenPostIds(userId) {
  try {
    // Query feed_impressions for real posts
    const { data: feedImpressions, error: feedError } = await supabase
      .from('feed_impressions')
      .select('post_id')
      .eq('user_id', userId);

    if (feedError) {
      console.log('[ForumService] feed_impressions query error:', feedError.message);
    }

    // Query seed_impressions for seed posts
    const { data: seedImpressions, error: seedError } = await supabase
      .from('seed_impressions')
      .select('post_id')
      .eq('user_id', userId);

    if (seedError) {
      console.log('[ForumService] seed_impressions query error:', seedError.message);
    }

    // Combine both into a Set
    const seenIds = new Set([
      ...(feedImpressions?.map(i => i.post_id) || []),
      ...(seedImpressions?.map(i => i.post_id) || [])
    ]);

    console.log(`[ForumService] User ${userId?.slice(0, 8)}... has seen ${seenIds.size} posts`);
    return seenIds;
  } catch (error) {
    console.error('[ForumService] getSeenPostIds error:', error);
    return new Set();
  }
}

// Score posts for user (unseen posts get higher score)
function scorePostsForUser(posts, userId, seenPostIds) {
  return posts.map(post => {
    let score = post.engagement_score || 0;
    const isOwnPost = post.user_id === userId;
    const hasSeen = seenPostIds.has(post.id);

    // PRIORITY 1: UNSEEN POSTS GET HIGHEST BOOST
    if (!hasSeen && !isOwnPost) {
      score += 10000;
      const hoursOld = (Date.now() - new Date(post.created_at).getTime()) / (1000 * 60 * 60);
      if (hoursOld < 6) {
        score += 5000;
      } else if (hoursOld < 24) {
        score += 3000;
      } else if (hoursOld < 72) {
        score += 1000;
      }
    }

    // PRIORITY 2: User's own posts
    if (isOwnPost) {
      score += 5000;
      const hoursOld = (Date.now() - new Date(post.created_at).getTime()) / (1000 * 60 * 60);
      if (hoursOld < 24) {
        score += 3000;
      }
    }

    // Engagement boost
    score += (post.likes_count || post.likes?.length || 0) * 1;
    score += (post.comments_count || 0) * 3;
    score += (post.share_count || 0) * 5;

    // Time decay for seen posts
    if (!isOwnPost && hasSeen) {
      const hoursOld = (Date.now() - new Date(post.created_at).getTime()) / (1000 * 60 * 60);
      if (hoursOld > 24) {
        score *= Math.exp(-0.08 * (hoursOld - 24));
      }
    }

    return {
      ...post,
      final_score: score,
      is_own_post: isOwnPost,
      has_seen: hasSeen,
    };
  }).sort((a, b) => b.final_score - a.final_score);
}

// Track impressions for posts (both real and seed)
async function trackPostImpressions(userId, sessionId, posts) {
  try {
    if (!userId || !posts || posts.length === 0) return;

    const feedImpressions = [];
    const seedImpressions = [];

    posts.forEach((post, index) => {
      const impression = {
        user_id: userId,
        post_id: post.id,
        position: index + 1,
        session_id: sessionId,
        shown_at: new Date().toISOString(),
      };

      if (post.is_seed_post) {
        seedImpressions.push(impression);
      } else {
        feedImpressions.push(impression);
      }
    });

    // Insert feed impressions
    if (feedImpressions.length > 0) {
      const { error } = await supabase
        .from('feed_impressions')
        .insert(feedImpressions);
      if (error && error.code !== '23505') {
        console.error('[ForumService] feed_impressions insert error:', error);
      }
    }

    // Insert seed impressions
    if (seedImpressions.length > 0) {
      const { error } = await supabase
        .from('seed_impressions')
        .insert(seedImpressions);
      if (error && error.code !== '23505') {
        console.error('[ForumService] seed_impressions insert error:', error);
      }
    }

    console.log(`[ForumService] Tracked ${feedImpressions.length} feed + ${seedImpressions.length} seed impressions`);
  } catch (error) {
    console.error('[ForumService] trackPostImpressions error:', error);
  }
}

// Fetch sponsor banners for feed
async function fetchSponsorBannersForFeed(userId, userTier = 'FREE') {
  try {
    const now = new Date().toISOString();

    let query = supabase
      .from('sponsor_banners')
      .select('*')
      .eq('is_active', true)
      .order('priority', { ascending: false });

    query = query.or(`start_date.is.null,start_date.lte.${now}`);
    query = query.or(`end_date.is.null,end_date.gt.${now}`);
    query = query.contains('target_screens', ['home']);

    const { data: banners, error } = await query;

    if (error) {
      console.log('[ForumService] sponsor_banners query error:', error.message);
      return [];
    }

    // Filter out dismissed banners
    if (userId && banners && banners.length > 0) {
      const { data: dismissed } = await supabase
        .from('dismissed_banners')
        .select('banner_id')
        .eq('user_id', userId);

      const dismissedIds = new Set(dismissed?.map(d => d.banner_id) || []);
      return banners.filter(b => !dismissedIds.has(b.id));
    }

    return banners || [];
  } catch (error) {
    console.error('[ForumService] fetchSponsorBannersForFeed error:', error);
    return [];
  }
}

// Insert ads/banners into feed
// All banners are now managed via Admin Dashboard (sponsor_banners table)
function insertAdsIntoFeed(posts, banners, maxAds = 3) {
  // If no banners from database, return posts without ads
  if (!banners || banners.length === 0) {
    console.log(`[ForumService] No sponsor banners in database - showing posts only`);
    return posts.map(post => ({ type: 'post', data: post }));
  }

  const feed = [];
  let adsInserted = 0;
  const AD_FIRST_POSITION = 5;
  const AD_INTERVAL = 8;
  let nextAdPosition = AD_FIRST_POSITION;

  posts.forEach((post, index) => {
    feed.push({ type: 'post', data: post });

    // Check if time to insert ad
    if (index + 1 === nextAdPosition && adsInserted < maxAds && adsInserted < banners.length) {
      const banner = banners[adsInserted];

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
      nextAdPosition += AD_INTERVAL;
      console.log(`[ForumService] Inserted banner at position ${index + 1}: ${banner.title}`);
    }
  });

  console.log(`[ForumService] ✅ Inserted ${adsInserted} banners into feed of ${posts.length} posts`);
  return feed;
}

// Topic keywords for dropdown filter (GIAO DỊCH, TINH THẦN, THỊNH VƯỢNG)
const TOPIC_KEYWORDS = {
  'giao-dich': [
    'trading', 'giao dịch', 'btc', 'eth', 'crypto', 'forex', 'coin', 'market', 'thị trường',
    'buy', 'sell', 'mua', 'bán', 'long', 'short', 'entry', 'tp', 'sl', 'profit', 'loss',
    'pattern', 'mẫu hình', 'indicator', 'chart', 'phân tích', 'kỹ thuật', 'futures',
    '#trading', '#giaodich', '#crypto', '#forex'
  ],
  'tinh-than': [
    'crystal', 'đá quý', 'tinh thể', 'năng lượng', 'energy', 'healing', 'chữa lành',
    'thạch anh', 'amethyst', 'citrine', 'chakra', 'thiền', 'meditation', 'mindfulness',
    'chánh niệm', 'breath', 'thở', 'relax', 'thư giãn', 'yoga', 'tâm linh', 'spirituality',
    '#crystal', '#healing', '#meditation', '#thien'
  ],
  'thinh-vuong': [
    'thịnh vượng', 'abundance', 'mindful trading', 'tâm lý giao dịch', 'psychology',
    'emotion', 'cảm xúc', 'discipline', 'kỷ luật', 'patience', 'kiên nhẫn',
    'thành công', 'success', 'phát triển bản thân', 'balance',
    'personal growth', 'chánh niệm trading', '#mindfultrading', '#thinhvuong'
  ],
};

export const forumService = {
  /**
   * Get all forum categories
   */
  async getCategories() {
    try {
      const { data, error } = await supabase
        .from('forum_categories')
        .select('*')
        .order('sort_order');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  },

  /**
   * Get posts with optional filters including feed type
   * Feed types: explore, following, news, notifications, popular
   * Now includes user_liked status for current user
   * UPDATED: "explore" feed now returns posts with user's posts first (Facebook-style)
   * FIXED: Increased default limit to 50 and removed overly strict filters
   */
  async getPosts(filters = {}) {
    try {
      // Increase default limit to 50 for better feed experience
      const { category, feed = 'explore', page = 1, limit = 50, search, topic } = filters;

      // Get current user for personalized feeds
      const { data: { user } } = await supabase.auth.getUser();
      const currentUserId = user?.id;

      let query = supabase
        .from('forum_posts')
        .select(`
          *,
          author:profiles(id, email, full_name, avatar_url, scanner_tier, chatbot_tier, verified_seller, verified_trader, level_badge, role_badge, role, achievement_badges),
          category:forum_categories(id, name, color),
          likes:forum_likes(user_id),
          saved:forum_saved(user_id),
          tagged_products:post_products(
            id,
            product_id,
            product_title,
            product_price,
            product_image,
            product_handle,
            position
          )
        `)
        .eq('status', 'published');

      // Apply feed type specific logic
      switch (feed) {
        case 'following':
          // Posts from followed users only
          if (user) {
            const { data: following } = await supabase
              .from('user_follows')
              .select('following_id')
              .eq('follower_id', user.id);

            const followingIds = following?.map(f => f.following_id) || [];
            if (followingIds.length > 0) {
              query = query.in('user_id', followingIds);
            } else {
              return []; // No following = no posts
            }
          } else {
            return []; // Not logged in = no following posts
          }
          query = query.order('created_at', { ascending: false });
          break;

        case 'news':
          // Admin posts only (tin tuc) - filter by feed_type = 'news' OR is_pinned
          // FIXED: Use OR to also include pinned posts if no feed_type match
          query = query
            .or('feed_type.eq.news,is_pinned.eq.true')
            .order('created_at', { ascending: false });
          break;

        case 'notifications':
          // Admin/system announcements - filter by feed_type = 'announcement'
          // FIXED: Also include posts with topic 'announcement' or 'thong-bao'
          query = query
            .or('feed_type.eq.announcement,topic.eq.announcement,topic.eq.thong-bao')
            .order('created_at', { ascending: false });
          break;

        case 'popular':
          // Top posts by likes + comments with ranking
          // FIXED: Show ALL posts sorted by engagement (no filter)
          query = query
            .order('likes_count', { ascending: false })
            .order('comments_count', { ascending: false })
            .order('created_at', { ascending: false });
          break;

        case 'academy':
          // Admin posts about courses, professional knowledge
          // FIXED: Use OR to match feed_type OR topic containing learning keywords
          query = query
            .or('feed_type.eq.academy,topic.eq.academy,topic.eq.hoc-tap,topic.ilike.%course%,topic.ilike.%khoa-hoc%')
            .order('created_at', { ascending: false });
          break;

        // ==== SIDEMENU FEED CATEGORIES (with topic matching OR keyword filtering) ====
        // FIXED: Use topic-based filtering first, then fallback to keyword search
        // This ensures posts show even if keywords don't match

        // Trading Track
        case 'trading':
          query = query
            .or('topic.eq.trading,topic.eq.giao-dich,topic.ilike.%trading%,title.ilike.%trading%,title.ilike.%giao dịch%,content.ilike.%crypto%,content.ilike.%btc%,content.ilike.%eth%')
            .order('created_at', { ascending: false });
          break;

        case 'patterns':
          query = query
            .or('topic.eq.patterns,topic.ilike.%pattern%,title.ilike.%pattern%,title.ilike.%mẫu hình%,content.ilike.%fibonacci%,content.ilike.%breakout%')
            .order('created_at', { ascending: false });
          break;

        case 'results':
          query = query
            .or('topic.eq.results,topic.eq.ket-qua,title.ilike.%result%,title.ilike.%kết quả%,title.ilike.%profit%,title.ilike.%lợi nhuận%')
            .order('created_at', { ascending: false });
          break;

        // Wellness Track
        case 'wellness':
          query = query
            .or('topic.eq.wellness,topic.eq.tinh-than,topic.ilike.%crystal%,title.ilike.%crystal%,title.ilike.%đá quý%,title.ilike.%healing%,content.ilike.%năng lượng%')
            .order('created_at', { ascending: false });
          break;

        case 'meditation':
          query = query
            .or('topic.eq.meditation,topic.eq.thien,topic.ilike.%mindful%,title.ilike.%thiền%,title.ilike.%meditation%,content.ilike.%chánh niệm%')
            .order('created_at', { ascending: false });
          break;

        case 'growth':
          query = query
            .or('topic.eq.growth,topic.eq.phat-trien,title.ilike.%phát triển%,title.ilike.%growth%,title.ilike.%thành công%')
            .order('created_at', { ascending: false });
          break;

        // Integration Track
        case 'mindful-trading':
          query = query
            .or('topic.eq.mindful-trading,topic.ilike.%mindful%,title.ilike.%mindful%,title.ilike.%tâm lý%,title.ilike.%chánh niệm%,content.ilike.%kỷ luật%')
            .order('created_at', { ascending: false });
          break;

        case 'sieu-giau':
          query = query
            .or('topic.eq.sieu-giau,topic.eq.thinh-vuong,title.ilike.%thịnh vượng%,title.ilike.%success%,title.ilike.%giàu%,content.ilike.%tỷ phú%')
            .order('created_at', { ascending: false });
          break;

        // Earn Track
        case 'earn':
          query = query
            .or('topic.eq.earn,topic.eq.kiem-tien,title.ilike.%affiliate%,title.ilike.%kiếm tiền%,title.ilike.%hoa hồng%,content.ilike.%commission%')
            .order('created_at', { ascending: false });
          break;

        case 'explore':
        default:
          // Personalized feed: mix of new + trending + user behavior
          // Order by: recent posts with engagement boost
          query = query.order('created_at', { ascending: false });
          break;
      }

      // Apply topic filter (GIAO DICH, TINH THAN, CAN BANG)
      if (topic) {
        const topicKeywords = TOPIC_KEYWORDS[topic];
        if (topicKeywords && topicKeywords.length > 0) {
          const keywordFilters = topicKeywords.map(keyword =>
            `title.ilike.%${keyword}%,content.ilike.%${keyword}%`
          ).join(',');
          query = query.or(keywordFilters);
        }
      }

      // Apply category filter (legacy support)
      if (category) {
        query = query.eq('category_id', category);
      }

      // Apply search filter
      if (search) {
        query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
      }

      // Apply pagination
      query = query.range((page - 1) * limit, page * limit - 1);

      const { data, error } = await query;

      if (error) throw error;

      // Deduplicate posts (can happen with OR keyword filters matching multiple times)
      const uniquePosts = [];
      const seenIds = new Set();
      for (const post of (data || [])) {
        if (!seenIds.has(post.id)) {
          seenIds.add(post.id);
          uniquePosts.push(post);
        }
      }

      // Transform data to include user_liked and user_saved status
      const transformedPosts = uniquePosts.map((post) => {
        // Check if current user liked/saved this post
        const user_liked = currentUserId
          ? post.likes?.some(like => like.user_id === currentUserId)
          : false;
        const user_saved = currentUserId
          ? post.saved?.some(save => save.user_id === currentUserId)
          : false;

        return {
          ...post,
          user_liked,
          user_saved,
          likes_count: post.likes_count || post.likes?.length || 0,
          // Mark if this is user's own post
          is_own_post: currentUserId && post.user_id === currentUserId,
        };
      });

      // Add ranking badges for popular feed
      if (feed === 'popular') {
        return transformedPosts.map((post, index) => ({
          ...post,
          popularRank: (page - 1) * limit + index + 1,
        }));
      }

      // ============================================
      // UNIFIED FEED SYSTEM
      // All feeds now have: scoring, impressions tracking, ads
      // ============================================

      // Generate session ID for tracking
      const sessionId = generateUUID();

      // Fetch seed posts for feeds that need them
      // FIXED: Now passing page parameter for proper pagination
      const shouldFetchSeedPosts = [
        'explore', 'trading', 'patterns', 'results',
        'wellness', 'meditation', 'growth',
        'mindful-trading', 'sieu-giau', 'earn'
      ].includes(feed);

      let seedPosts = [];
      let seedHasMore = false;
      let totalSeedCount = 0;
      if (shouldFetchSeedPosts) {
        const seedResult = await fetchSeedPosts(limit, feed, page);
        seedPosts = seedResult.posts || [];
        seedHasMore = seedResult.hasMore || false;
        totalSeedCount = seedResult.count || 0;
        console.log(`[ForumService] Fetched ${seedPosts.length}/${totalSeedCount} seed posts (page ${page}) for ${feed} feed`);
      }

      // Combine real posts with seed posts
      const allPosts = [...transformedPosts, ...seedPosts];

      // Deduplicate
      const finalPosts = [];
      const finalSeenIds = new Set();
      for (const post of allPosts) {
        if (!finalSeenIds.has(post.id)) {
          finalSeenIds.add(post.id);
          finalPosts.push(post);
        }
      }

      // ============================================
      // STEP 1: Get user's seen posts
      // ============================================
      let seenPostIds = new Set();
      if (currentUserId) {
        seenPostIds = await getSeenPostIds(currentUserId);
      }

      // ============================================
      // STEP 2: Score posts (unseen first, then own posts, then seen)
      // ============================================
      const scoredPosts = scorePostsForUser(finalPosts, currentUserId, seenPostIds);

      // ============================================
      // STEP 3: Track impressions (async, don't wait)
      // ============================================
      if (currentUserId && scoredPosts.length > 0) {
        trackPostImpressions(currentUserId, sessionId, scoredPosts.slice(0, 50));
      }

      // ============================================
      // STEP 4: Insert ads/banners
      // CHANGED: Show ads for ALL tiers including TIER_3
      // ============================================
      let banners = [];
      if (currentUserId) {
        // Get user tier for ad targeting
        const { data: profile } = await supabase
          .from('profiles')
          .select('scanner_tier')
          .eq('id', currentUserId)
          .single();

        const userTier = profile?.scanner_tier || 'FREE';

        // CHANGED: Fetch sponsor banners for ALL tiers
        banners = await fetchSponsorBannersForFeed(currentUserId, userTier);
        console.log(`[ForumService] User tier: ${userTier}, fetched ${banners.length} banners`);
      }

      // Insert ads into feed (will use fallback ads if no sponsor banners)
      const feedWithAds = insertAdsIntoFeed(scoredPosts, banners);

      // Calculate hasMore based on both real posts and seed posts
      // hasMore = true if EITHER real posts OR seed posts have more to load
      const realPostsHasMore = transformedPosts.length >= limit;
      const hasMore = realPostsHasMore || seedHasMore;

      console.log(`[ForumService] ${feed} feed page ${page}: ${scoredPosts.length} posts (${transformedPosts.length} real + ${seedPosts.length} seed), hasMore: ${hasMore}`);

      // Return feed with type info (for ForumScreen to handle)
      return {
        posts: feedWithAds,
        sessionId,
        hasMore,
        totalPosts: scoredPosts.length,
        totalSeedCount,
      };
    } catch (error) {
      console.error('Error fetching posts:', error);
      return { posts: [], sessionId: null, hasMore: false, totalPosts: 0 };
    }
  },

  /**
   * Get liked posts by current user
   */
  async getLikedPosts(page = 1, limit = 20) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('forum_likes')
        .select(`
          post:forum_posts(
            *,
            author:profiles(id, email, full_name, avatar_url, scanner_tier, chatbot_tier, verified_seller, verified_trader, level_badge, role_badge, role, achievement_badges),
            category:forum_categories(id, name, color)
          )
        `)
        .eq('user_id', user.id)
        .not('post_id', 'is', null)
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      if (error) throw error;
      return data?.map(item => item.post).filter(Boolean) || [];
    } catch (error) {
      console.error('Error fetching liked posts:', error);
      return [];
    }
  },

  /**
   * Get saved/bookmarked posts by current user
   */
  async getSavedPosts(page = 1, limit = 20) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('forum_saved')
        .select(`
          post:forum_posts(
            *,
            author:profiles(id, email, full_name, avatar_url, scanner_tier, chatbot_tier, verified_seller, verified_trader, level_badge, role_badge, role, achievement_badges),
            category:forum_categories(id, name, color)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      if (error) throw error;
      return data?.map(item => item.post).filter(Boolean) || [];
    } catch (error) {
      console.error('Error fetching saved posts:', error);
      return [];
    }
  },

  /**
   * Save/bookmark a post with duplicate check
   */
  async savePost(postId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      console.log('[Forum] Saving post:', postId);

      // Check if already saved (prevent duplicates)
      const { data: existing } = await supabase
        .from('forum_saved')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .single();

      if (existing) {
        console.log('[Forum] Already saved, skipping');
        return { success: true, alreadySaved: true };
      }

      const { error } = await supabase
        .from('forum_saved')
        .insert({
          post_id: postId,
          user_id: user.id,
        });

      if (error) throw error;
      console.log('[Forum] ✅ Post saved');
      return { success: true };
    } catch (error) {
      console.error('[Forum] Save error:', error);
      return { success: false, error };
    }
  },

  /**
   * Unsave/remove bookmark from a post
   */
  async unsavePost(postId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      console.log('[Forum] Unsaving post:', postId);

      const { error } = await supabase
        .from('forum_saved')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', user.id);

      if (error) throw error;
      console.log('[Forum] ✅ Post unsaved');
      return { success: true };
    } catch (error) {
      console.error('[Forum] Unsave error:', error);
      return { success: false, error };
    }
  },

  /**
   * Check if post is saved by current user
   */
  async isPostSaved(postId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await supabase
        .from('forum_saved')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .single();

      return !error && !!data;
    } catch (error) {
      return false;
    }
  },

  /**
   * Check if post is liked by current user
   */
  async isPostLiked(postId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await supabase
        .from('forum_likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .single();

      return !error && !!data;
    } catch (error) {
      return false;
    }
  },

  /**
   * Get single post by ID
   * Searches in both forum_posts and seed_posts tables
   */
  async getPostById(postId) {
    try {
      // First try forum_posts
      const { data: forumPost, error: forumError } = await supabase
        .from('forum_posts')
        .select(`
          *,
          author:profiles(id, email, full_name, avatar_url, scanner_tier, chatbot_tier, verified_seller, verified_trader, level_badge, role_badge, role, achievement_badges),
          category:forum_categories(id, name, color),
          comments:forum_comments(
            *,
            author:profiles(id, email, full_name, avatar_url, scanner_tier, chatbot_tier, verified_seller, verified_trader, level_badge, role_badge, role, achievement_badges)
          ),
          tagged_products:post_products(
            id,
            product_id,
            product_title,
            product_price,
            product_image,
            product_handle,
            position
          )
        `)
        .eq('id', postId)
        .single();

      if (forumPost) {
        return { ...forumPost, is_seed: false };
      }

      // If not found in forum_posts, try seed_posts
      // Note: seed_posts use seed_users table for author data - fetch separately to avoid FK issues
      const { data: seedPost, error: seedError } = await supabase
        .from('seed_posts')
        .select('*')
        .eq('id', postId)
        .single();

      if (seedError) {
        console.log('[ForumService] seed_posts query error:', seedError.message);
      }

      if (seedPost) {
        // Fetch author from seed_users separately
        if (seedPost.user_id) {
          const { data: seedAuthor } = await supabase
            .from('seed_users')
            .select('id, full_name, avatar_url')
            .eq('id', seedPost.user_id)
            .single();
          seedPost.author = seedAuthor || { id: seedPost.user_id, full_name: 'Unknown', avatar_url: null };
        }
        // Fetch comments separately since they're in forum_comments table
        const { data: comments } = await supabase
          .from('forum_comments')
          .select('*')
          .eq('post_id', postId)
          .order('created_at', { ascending: true });

        // For each comment, fetch author from seed_users or profiles
        if (comments && comments.length > 0) {
          const userIds = [...new Set(comments.map(c => c.user_id))];

          // Fetch from seed_users
          const { data: seedUserAuthors } = await supabase
            .from('seed_users')
            .select('id, full_name, avatar_url')
            .in('id', userIds);

          // Fetch from profiles (for real users)
          const { data: profileAuthors } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url')
            .in('id', userIds);

          const authorMap = new Map();
          seedUserAuthors?.forEach(u => authorMap.set(u.id, u));
          profileAuthors?.forEach(u => authorMap.set(u.id, u));

          comments.forEach(c => {
            c.author = authorMap.get(c.user_id) || { id: c.user_id, full_name: 'Unknown', avatar_url: null };
          });
        }

        return { ...seedPost, comments: comments || [], is_seed: true };
      }

      // Neither table has the post - this is expected for deleted posts or stale cache
      console.warn('[ForumService] Post not found (may have been deleted):', postId);
      return null;
    } catch (error) {
      console.error('Error fetching post:', error);
      return null;
    }
  },

  /**
   * Upload post image to Supabase storage
   * Uses base64 encoding for more reliable uploads on mobile
   */
  async uploadPostImage(uri) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      console.log('[Forum] Uploading image:', uri);

      // Create unique filename
      const timestamp = Date.now();
      const filename = `posts/${user.id}/${timestamp}.jpg`;

      // Fetch the image
      const response = await fetch(uri);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status}`);
      }

      // Convert to ArrayBuffer then to Uint8Array for reliable upload
      const arrayBuffer = await response.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      console.log('[Forum] Image size:', uint8Array.length, 'bytes');

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('forum-images')
        .upload(filename, uint8Array, {
          contentType: 'image/jpeg',
          upsert: true,
        });

      if (error) {
        console.error('[Forum] Upload error:', error);
        // If bucket doesn't exist, try with different bucket name
        if (error.message?.includes('not found') || error.message?.includes('Bucket')) {
          console.log('[Forum] Trying fallback bucket...');
          const { data: fallbackData, error: fallbackError } = await supabase.storage
            .from('avatars') // Fallback to avatars bucket which usually exists
            .upload(`forum/${filename}`, uint8Array, {
              contentType: 'image/jpeg',
              upsert: true,
            });

          if (fallbackError) {
            console.error('[Forum] Fallback upload error:', fallbackError);
            throw fallbackError;
          }

          const { data: fallbackUrl } = supabase.storage
            .from('avatars')
            .getPublicUrl(`forum/${filename}`);

          console.log('[Forum] ✅ Image uploaded to fallback:', fallbackUrl.publicUrl);
          return { success: true, url: fallbackUrl.publicUrl };
        }
        throw error;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('forum-images')
        .getPublicUrl(filename);

      console.log('[Forum] ✅ Image uploaded:', urlData.publicUrl);
      return { success: true, url: urlData.publicUrl };
    } catch (error) {
      console.error('[Forum] Upload image error:', error);
      return { success: false, error: error.message || error };
    }
  },

  /**
   * Upload multiple images to Supabase storage
   * @param {Array<string>} imageUris - Array of local image URIs
   * @returns {Object} - { success, urls: string[], errors: any[] }
   */
  async uploadMultipleImages(imageUris) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      if (!imageUris || imageUris.length === 0) {
        return { success: true, urls: [], errors: [] };
      }

      console.log('[Forum] Uploading multiple images:', imageUris.length);

      const uploadPromises = imageUris.map(async (uri, index) => {
        try {
          // Skip URLs (already uploaded)
          if (uri.startsWith('http')) {
            return { success: true, url: uri };
          }

          const timestamp = Date.now();
          const filename = `posts/${user.id}/${timestamp}_${index}.jpg`;

          const response = await fetch(uri);
          if (!response.ok) {
            throw new Error(`Failed to fetch image ${index}: ${response.status}`);
          }

          const arrayBuffer = await response.arrayBuffer();
          const uint8Array = new Uint8Array(arrayBuffer);

          const { data, error } = await supabase.storage
            .from('forum-images')
            .upload(filename, uint8Array, {
              contentType: 'image/jpeg',
              upsert: true,
            });

          if (error) {
            // Try fallback bucket
            const { data: fallbackData, error: fallbackError } = await supabase.storage
              .from('avatars')
              .upload(`forum/${filename}`, uint8Array, {
                contentType: 'image/jpeg',
                upsert: true,
              });

            if (fallbackError) throw fallbackError;

            const { data: fallbackUrl } = supabase.storage
              .from('avatars')
              .getPublicUrl(`forum/${filename}`);

            return { success: true, url: fallbackUrl.publicUrl };
          }

          const { data: urlData } = supabase.storage
            .from('forum-images')
            .getPublicUrl(filename);

          return { success: true, url: urlData.publicUrl };
        } catch (error) {
          console.error(`[Forum] Upload error for image ${index}:`, error);
          return { success: false, error: error.message };
        }
      });

      const results = await Promise.all(uploadPromises);
      const urls = results.filter(r => r.success).map(r => r.url);
      const errors = results.filter(r => !r.success).map(r => r.error);

      console.log(`[Forum] ✅ Uploaded ${urls.length}/${imageUris.length} images`);

      return {
        success: urls.length > 0,
        urls,
        errors,
      };
    } catch (error) {
      console.error('[Forum] Upload multiple images error:', error);
      return { success: false, urls: [], errors: [error.message] };
    }
  },

  /**
   * Create a new post
   * Note: Only includes columns that definitely exist in the database
   */
  async createPost(post) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      console.log('[Forum] Creating post for user:', user.id);

      // Try RPC function first (bypasses problematic triggers)
      const { data: rpcResult, error: rpcError } = await supabase.rpc('create_forum_post', {
        p_user_id: user.id,
        p_title: post.title || '',
        p_content: post.content || '',
        p_topic: post.topic || null,
        p_image_url: post.image_url || null,
        p_visibility: post.visibility || 'public',
        p_hashtags: post.hashtags || [],
        p_media_urls: post.media_urls || [],
        p_feed_type: post.feed_type || 'general',
        p_status: post.status || 'published',
      });

      // If RPC succeeded
      if (!rpcError && rpcResult?.success) {
        console.log('[Forum] Post created via RPC:', rpcResult.id);
        return { data: rpcResult.post || { id: rpcResult.id }, error: null };
      }

      // If RPC failed (function doesn't exist yet), fall back to direct insert
      if (rpcError?.code === '42883' || rpcError?.message?.includes('function') || rpcError?.message?.includes('does not exist')) {
        console.log('[Forum] RPC not available, falling back to direct insert');

        // Build insert object with only core fields
        const insertData = {
          user_id: user.id,
          title: post.title,
          content: post.content,
          topic: post.topic || null,
          image_url: post.image_url || null,
          status: post.status || 'published',
        };

        // Add optional fields
        if (post.feed_type) insertData.feed_type = post.feed_type;
        if (post.media_urls && post.media_urls.length > 0) insertData.media_urls = post.media_urls;
        if (post.hashtags && post.hashtags.length > 0) insertData.hashtags = post.hashtags;
        if (post.visibility) insertData.visibility = post.visibility;

        console.log('[Forum] Direct insert data:', JSON.stringify(insertData, null, 2));

        const { data, error } = await supabase
          .from('forum_posts')
          .insert(insertData)
          .select()
          .single();

        if (error) {
          console.error('[Forum] Insert error:', error);

          // If trigger error (42703), try with absolute minimal fields
          if (error.code === '42703' || error.message?.includes('author_id')) {
            console.warn('[Forum] Trigger error detected, trying minimal insert');

            const minimalData = {
              user_id: user.id,
              title: post.title || 'Untitled',
              content: post.content || '',
            };

            const { data: retryData, error: retryError } = await supabase
              .from('forum_posts')
              .insert(minimalData)
              .select()
              .single();

            if (retryError) {
              console.error('[Forum] Minimal insert also failed:', retryError);
              throw new Error('Không thể tạo bài viết. Vui lòng liên hệ admin để kiểm tra database triggers.');
            }
            return { data: retryData, error: null };
          }
          throw error;
        }
        return { data, error: null };
      }

      // RPC returned error in result
      if (rpcResult && !rpcResult.success) {
        console.error('[Forum] RPC returned error:', rpcResult.error);
        throw new Error(rpcResult.error || 'Unknown error creating post');
      }

      // Other RPC error
      if (rpcError) {
        console.error('[Forum] RPC error:', rpcError);
        throw rpcError;
      }

      return { data: null, error: new Error('Unknown error') };
    } catch (error) {
      console.error('Error creating post:', error);
      return { data: null, error };
    }
  },

  /**
   * Link products to a post
   * Inserts into post_products junction table
   */
  async linkProductsToPost(postId, products) {
    try {
      if (!postId || !products || products.length === 0) {
        return { success: true };
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Prepare insert data
      const insertData = products.map((product, index) => ({
        post_id: postId,
        product_id: product.shopifyId || product.id,
        product_title: product.title,
        product_price: product.priceRaw || parseFloat(product.price?.replace(/[^\d.-]/g, '')) || 0,
        product_image: product.image,
        product_handle: product.handle,
        position: index,
      }));

      console.log('[Forum] Linking products to post:', postId, insertData.length);

      const { data, error } = await supabase
        .from('post_products')
        .insert(insertData);

      if (error) {
        console.error('[Forum] Error linking products:', error);
        throw error;
      }

      console.log('[Forum] Products linked successfully');
      return { success: true, data };
    } catch (error) {
      console.error('[Forum] linkProductsToPost error:', error);
      return { success: false, error };
    }
  },

  /**
   * Update products for a post (delete existing, insert new)
   * Used for editing posts with product changes
   * UPDATED: Now supports both forum_posts (post_products) and seed_posts (seed_post_products)
   */
  async updatePostProducts(postId, products, isSeedPost = false) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Determine which table to use
      const tableName = isSeedPost ? 'seed_post_products' : 'post_products';
      console.log(`[Forum] Updating products for ${isSeedPost ? 'seed' : ''} post:`, postId, `(table: ${tableName})`);

      // First, delete all existing products for this post
      const { error: deleteError } = await supabase
        .from(tableName)
        .delete()
        .eq('post_id', postId);

      if (deleteError) {
        // Table might not exist yet for seed posts
        if (deleteError.code === '42P01' || deleteError.message?.includes('does not exist')) {
          console.log(`[Forum] Table ${tableName} does not exist yet, skipping delete`);
        } else {
          console.error('[Forum] Error deleting existing products:', deleteError);
          throw deleteError;
        }
      }

      // If no new products, we're done
      if (!products || products.length === 0) {
        console.log('[Forum] No products to add, cleared existing');
        return { success: true };
      }

      // Insert new products
      const insertData = products.map((product, index) => ({
        post_id: postId,
        product_id: product.shopifyId || product.id,
        product_title: product.title,
        product_price: product.priceRaw || parseFloat(product.price?.replace(/[^\d.-]/g, '')) || 0,
        product_image: product.image,
        product_handle: product.handle,
        position: index,
      }));

      const { data, error: insertError } = await supabase
        .from(tableName)
        .insert(insertData);

      if (insertError) {
        console.error('[Forum] Error inserting new products:', insertError);
        throw insertError;
      }

      console.log('[Forum] Products updated successfully:', products.length);
      return { success: true, data };
    } catch (error) {
      console.error('[Forum] updatePostProducts error:', error);
      return { success: false, error };
    }
  },

  /**
   * Update an existing post
   * SECURITY: Only post author OR admin can update
   * Saves edit history before updating
   * FIXED: Admin can now edit seed_posts as well as forum_posts
   */
  async updatePost(postId, userId, updates) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Check if current user is admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      const isAdmin = profile?.role === 'admin';

      // First, try to find in forum_posts
      let existingPost = null;
      let isSeedPost = false;

      const { data: forumPost, error: forumError } = await supabase
        .from('forum_posts')
        .select('id, user_id, title, content')
        .eq('id', postId)
        .single();

      if (forumPost) {
        existingPost = forumPost;
      } else if (isAdmin) {
        // If not found in forum_posts and user is admin, check seed_posts
        const { data: seedPost, error: seedError } = await supabase
          .from('seed_posts')
          .select('id, user_id, title, content')
          .eq('id', postId)
          .single();

        if (seedPost) {
          existingPost = seedPost;
          isSeedPost = true;
          console.log('[Forum] Found seed post:', postId);
        }
      }

      if (!existingPost) {
        console.error('[Forum] Post not found:', postId);
        return { success: false, error: 'Post not found' };
      }

      // Allow if author OR admin
      if (existingPost.user_id !== user.id && !isAdmin) {
        console.error('[Forum] Unauthorized edit attempt');
        return { success: false, error: 'Unauthorized' };
      }

      // Save edit history (if table exists)
      try {
        await supabase
          .from('post_edit_history')
          .insert({
            post_id: postId,
            title_before: existingPost.title,
            content_before: existingPost.content,
            title_after: updates.title,
            content_after: updates.content,
            edited_by: user.id,
          });
        console.log('[Forum] Edit history saved');
      } catch (historyError) {
        // Table might not exist yet, continue with update
        console.log('[Forum] Edit history table not available, skipping');
      }

      // Update the post in the correct table
      const tableName = isSeedPost ? 'seed_posts' : 'forum_posts';

      // Build update object - seed_posts might have different columns
      // IMPORTANT: Filter out any non-column fields like is_seed_post, feed_source, author, etc.
      const updateData = {
        title: updates.title,
        content: updates.content,
      };

      // Debug: Log what we're updating
      console.log('[Forum] Updating', tableName, 'with data:', Object.keys(updateData));

      // Add additional fields based on table type
      if (!isSeedPost) {
        // forum_posts has these additional columns
        updateData.topic = updates.topic;
        updateData.image_url = updates.image_url;
        updateData.media_urls = updates.media_urls || [];
        updateData.feed_type = updates.feed_type;
        updateData.edited_at = new Date().toISOString();
      } else {
        // Seed posts use different column names and may not have edited_at
        if (updates.topic) updateData.seed_topic = updates.topic;
        if (updates.image_url) updateData.image_url = updates.image_url;
        if (updates.media_urls) updateData.media_urls = updates.media_urls;
        // Note: seed_posts table might not have edited_at column
        // We'll try to update it, but catch the error if column doesn't exist
      }

      // For admin editing, don't restrict by user_id
      let query = supabase
        .from(tableName)
        .update(updateData)
        .eq('id', postId);

      // Only add user_id filter if not admin (for regular users editing their own posts)
      if (!isAdmin && !isSeedPost) {
        query = query.eq('user_id', user.id);
      }

      // Don't use .single() as it can fail on seed_posts with RLS
      const { data, error } = await query.select();

      if (error) {
        console.error('[Forum] Update error:', error);
        throw error;
      }

      // Check if any rows were updated
      if (!data || data.length === 0) {
        // Try without select - some tables don't allow select after update
        const { error: updateOnlyError } = await supabase
          .from(tableName)
          .update(updateData)
          .eq('id', postId);

        if (updateOnlyError) {
          console.error('[Forum] Update (no select) error:', updateOnlyError);
          throw updateOnlyError;
        }

        console.log(`[Forum] ${isSeedPost ? 'Seed post' : 'Post'} updated (without return data):`, postId);
        return { success: true, data: { id: postId, ...updateData }, isSeedPost };
      }

      console.log(`[Forum] ${isSeedPost ? 'Seed post' : 'Post'} updated successfully:`, postId);
      return { success: true, data: data[0], isSeedPost };
    } catch (error) {
      console.error('[Forum] Update post error:', error);
      return { success: false, error: error.message || error };
    }
  },

  /**
   * Delete a post
   * SECURITY: Only post author OR admin can delete
   * FIXED: Admin can now delete seed_posts as well as forum_posts
   */
  async deletePost(postId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Check if current user is admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      const isAdmin = profile?.role === 'admin';

      // First, try to find and delete from forum_posts
      let deleted = false;

      if (isAdmin) {
        // Admin can delete any post without user_id check
        const { error: forumError } = await supabase
          .from('forum_posts')
          .delete()
          .eq('id', postId);

        if (!forumError) {
          deleted = true;
          console.log('[Forum] Post deleted from forum_posts:', postId);
        } else {
          // Try seed_posts
          const { error: seedError } = await supabase
            .from('seed_posts')
            .delete()
            .eq('id', postId);

          if (!seedError) {
            deleted = true;
            console.log('[Forum] Seed post deleted:', postId);
          }
        }
      } else {
        // Regular user: only delete their own posts
        const { error } = await supabase
          .from('forum_posts')
          .delete()
          .eq('id', postId)
          .eq('user_id', user.id);

        if (!error) {
          deleted = true;
        } else {
          console.error('[Forum] Delete error:', error);
          throw error;
        }
      }

      if (!deleted) {
        return { success: false, error: 'Post not found or unauthorized' };
      }

      console.log('[Forum] Post deleted successfully:', postId);
      return { success: true };
    } catch (error) {
      console.error('[Forum] Delete post error:', error);
      return { success: false, error: error.message || error };
    }
  },

  /**
   * Like a post (supports both forum_posts and seed_posts)
   * Uses post_id for forum_posts, seed_post_id for seed_posts
   */
  async likePost(postId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      console.log('[Forum] Liking post:', postId);

      // First determine if this is a forum_post or seed_post
      let isSeedPost = false;
      let post = null;

      // Try forum_posts first
      const { data: forumPost } = await supabase
        .from('forum_posts')
        .select('id, title, user_id')
        .eq('id', postId)
        .single();

      if (forumPost) {
        post = forumPost;
      } else {
        // Try seed_posts
        const { data: seedPost } = await supabase
          .from('seed_posts')
          .select('id, content, user_id')
          .eq('id', postId)
          .single();

        if (seedPost) {
          post = {
            id: seedPost.id,
            title: seedPost.content?.substring(0, 50) || 'Bài viết',
            user_id: seedPost.user_id,
          };
          isSeedPost = true;
        }
      }

      if (!post) {
        console.error('[Forum] Post not found:', postId);
        return { success: false, error: 'Post not found' };
      }

      // Check if already liked (use correct column based on post type)
      const likeQuery = supabase
        .from('forum_likes')
        .select('id')
        .eq('user_id', user.id);

      if (isSeedPost) {
        likeQuery.eq('seed_post_id', postId);
      } else {
        likeQuery.eq('post_id', postId);
      }

      const { data: existing } = await likeQuery.single();

      if (existing) {
        console.log('[Forum] Already liked, skipping');
        return { success: true, alreadyLiked: true };
      }

      // Insert new like with correct column
      const insertData = {
        user_id: user.id,
      };

      if (isSeedPost) {
        insertData.seed_post_id = postId;
      } else {
        insertData.post_id = postId;
      }

      const { error } = await supabase
        .from('forum_likes')
        .insert(insertData);

      if (error) throw error;

      // Create notification for post owner (skip for seed users - they're not real)
      if (post && post.user_id !== user.id && !isSeedPost) {
        await this.createNotification({
          recipientId: post.user_id,
          type: 'like',
          title: 'Thích bài viết',
          body: `đã thích bài viết "${post.title?.substring(0, 30)}${post.title?.length > 30 ? '...' : ''}"`,
          data: { postId },
        });
      }

      console.log('[Forum] ✅ Post liked', isSeedPost ? '(seed post)' : '');
      return { success: true };
    } catch (error) {
      console.error('[Forum] Like error:', error);
      return { success: false, error };
    }
  },

  /**
   * Unlike a post (supports both forum_posts and seed_posts)
   */
  async unlikePost(postId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      console.log('[Forum] Unliking post:', postId);

      // First determine if this is a forum_post or seed_post
      let isSeedPost = false;

      const { data: forumPost } = await supabase
        .from('forum_posts')
        .select('id')
        .eq('id', postId)
        .single();

      if (!forumPost) {
        // Check if it's a seed_post
        const { data: seedPost } = await supabase
          .from('seed_posts')
          .select('id')
          .eq('id', postId)
          .single();

        if (seedPost) {
          isSeedPost = true;
        }
      }

      // Delete like using correct column
      let deleteQuery = supabase
        .from('forum_likes')
        .delete()
        .eq('user_id', user.id);

      if (isSeedPost) {
        deleteQuery = deleteQuery.eq('seed_post_id', postId);
      } else {
        deleteQuery = deleteQuery.eq('post_id', postId);
      }

      const { error } = await deleteQuery;

      if (error) throw error;

      console.log('[Forum] ✅ Post unliked (isSeedPost:', isSeedPost, ')');
      return { success: true };
    } catch (error) {
      console.error('[Forum] Unlike error:', error);
      return { success: false, error };
    }
  },

  /**
   * Add a comment to a post
   */
  async createComment(postId, content, parentId = null) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const commentData = {
        post_id: postId,
        user_id: user.id,
        content,
      };

      // Add parent_id for replies
      if (parentId) {
        commentData.parent_id = parentId;
      }

      const { data, error } = await supabase
        .from('forum_comments')
        .insert(commentData)
        .select('*')
        .single();

      if (error) throw error;

      // Get post info for notification
      const { data: post } = await supabase
        .from('forum_posts')
        .select('id, title, user_id')
        .eq('id', postId)
        .single();

      // Create notification
      if (parentId) {
        // Reply notification - notify parent comment author
        const { data: parentComment } = await supabase
          .from('forum_comments')
          .select('user_id')
          .eq('id', parentId)
          .single();

        if (parentComment && parentComment.user_id !== user.id) {
          await this.createNotification({
            recipientId: parentComment.user_id,
            type: 'reply',
            title: 'Trả lời bình luận',
            body: `đã trả lời bình luận của bạn: "${content.substring(0, 50)}${content.length > 50 ? '...' : ''}"`,
            data: { postId, commentId: data.id },
          });
        }
      } else {
        // Comment notification - notify post owner
        if (post && post.user_id !== user.id) {
          await this.createNotification({
            recipientId: post.user_id,
            type: 'comment',
            title: 'Bình luận mới',
            body: `đã bình luận: "${content.substring(0, 50)}${content.length > 50 ? '...' : ''}"`,
            data: { postId, commentId: data.id },
          });
        }
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error creating comment:', error);
      return { data: null, error };
    }
  },

  /**
   * Get comments with replies for a post
   */
  async getCommentsWithReplies(postId) {
    try {
      const { data, error } = await supabase
        .from('forum_comments')
        .select(`
          *,
          author:profiles(id, email, full_name, avatar_url, scanner_tier, chatbot_tier, verified_seller, verified_trader, level_badge, role_badge, role, achievement_badges)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Organize comments into threads
      const commentMap = new Map();
      const rootComments = [];

      // First pass: create map
      (data || []).forEach(comment => {
        commentMap.set(comment.id, { ...comment, replies: [] });
      });

      // Second pass: organize into hierarchy
      (data || []).forEach(comment => {
        const commentWithReplies = commentMap.get(comment.id);
        if (comment.parent_id && commentMap.has(comment.parent_id)) {
          // This is a reply, add to parent
          commentMap.get(comment.parent_id).replies.push(commentWithReplies);
        } else {
          // This is a root comment
          rootComments.push(commentWithReplies);
        }
      });

      return rootComments;
    } catch (error) {
      console.error('[Forum] Get comments error:', error);
      return [];
    }
  },

  // ==========================================
  // FOLLOW SYSTEM
  // ==========================================

  /**
   * Follow a user
   */
  async followUser(userId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('user_follows')
        .insert({
          follower_id: user.id,
          following_id: userId,
        });

      if (error) throw error;

      // Create follow notification
      if (userId !== user.id) {
        await this.createNotification({
          recipientId: userId,
          type: 'follow',
          title: 'Người theo dõi mới',
          body: 'đã bắt đầu theo dõi bạn',
          data: {},
        });
      }

      return { success: true };
    } catch (error) {
      console.error('Error following user:', error);
      return { success: false, error };
    }
  },

  /**
   * Unfollow a user
   */
  async unfollowUser(userId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('user_follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', userId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error unfollowing user:', error);
      return { success: false, error };
    }
  },

  /**
   * Check if following a user
   */
  async isFollowing(userId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await supabase
        .from('user_follows')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', userId)
        .single();

      return !error && !!data;
    } catch (error) {
      return false;
    }
  },

  /**
   * Get followers count
   */
  async getFollowersCount(userId) {
    try {
      const { count, error } = await supabase
        .from('user_follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', userId);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      return 0;
    }
  },

  /**
   * Get following count
   */
  async getFollowingCount(userId) {
    try {
      const { count, error } = await supabase
        .from('user_follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', userId);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      return 0;
    }
  },

  /**
   * Get user profile by ID
   * FIXED: Also queries seed_users table if not found in profiles
   * This allows viewing seed user profiles with full UI display
   */
  async getUserProfile(userId) {
    try {
      // First, try to get from profiles table (real users)
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, email, full_name, bio, username, created_at, avatar_url, cover_url, metadata, scanner_tier, chatbot_tier, verified_seller, verified_trader, level_badge, role_badge, role, achievement_badges')
        .eq('id', userId)
        .single();

      if (profileData && !profileError) {
        return profileData;
      }

      // If not found in profiles, try seed_users table
      console.log('[Forum] User not found in profiles, checking seed_users...');
      const { data: seedUserData, error: seedUserError } = await supabase
        .from('seed_users')
        .select('id, email, full_name, bio, avatar_url, location, tier, followers_count, following_count, seed_persona, is_premium_seed, created_at')
        .eq('id', userId)
        .single();

      if (seedUserData && !seedUserError) {
        // Transform seed user data to match profile format
        // Generate username from full_name (seed users don't have username column)
        const username = seedUserData.full_name
          ?.toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '') // Remove Vietnamese diacritics
          .replace(/đ/g, 'd')
          .replace(/Đ/g, 'D')
          .replace(/\s+/g, '_')
          .replace(/[^a-z0-9_]/g, '') || 'user';

        return {
          id: seedUserData.id,
          email: seedUserData.email,
          full_name: seedUserData.full_name,
          bio: seedUserData.bio || `${seedUserData.seed_persona || 'Thành viên'} của Gemral`,
          username: username,
          created_at: seedUserData.created_at,
          avatar_url: seedUserData.avatar_url,
          // Map tier to scanner_tier format
          scanner_tier: seedUserData.tier === 'vip' ? 'TIER_3' : seedUserData.tier === 'premium' ? 'TIER_2' : 'FREE',
          chatbot_tier: seedUserData.is_premium_seed ? 'premium' : 'free',
          verified_seller: false,
          verified_trader: seedUserData.tier === 'vip',
          level_badge: null,
          role_badge: null,
          role: seedUserData.is_premium_seed ? 'premium_user' : 'user',
          achievement_badges: null,
          // Additional seed user info
          is_seed_user: true,
          seed_persona: seedUserData.seed_persona,
          location: seedUserData.location,
        };
      }

      // Neither found
      console.error('[Forum] User not found in profiles or seed_users:', userId);
      return null;
    } catch (error) {
      console.error('[Forum] Get user profile error:', error);
      return null;
    }
  },

  /**
   * Get user by username or full_name (for @mentions)
   * Searches both profiles and seed_users tables
   */
  async getUserByUsername(searchName) {
    try {
      if (!searchName) return null;

      const normalizedName = searchName.trim();
      console.log('[Forum] Searching user by name:', normalizedName);

      // First, try to find in profiles by full_name (exact or partial match)
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, email, full_name, username, avatar_url')
        .or(`full_name.ilike.%${normalizedName}%,username.ilike.%${normalizedName}%`)
        .limit(1)
        .single();

      if (profileData && !profileError) {
        console.log('[Forum] Found user in profiles:', profileData.id, profileData.full_name);
        return profileData;
      }

      // If not found in profiles, try seed_users table
      console.log('[Forum] User not found in profiles, checking seed_users...');
      const { data: seedUserData, error: seedUserError } = await supabase
        .from('seed_users')
        .select('id, email, full_name, avatar_url')
        .ilike('full_name', `%${normalizedName}%`)
        .limit(1)
        .single();

      if (seedUserData && !seedUserError) {
        console.log('[Forum] Found user in seed_users:', seedUserData.id, seedUserData.full_name);
        return {
          ...seedUserData,
          is_seed_user: true,
        };
      }

      console.warn('[Forum] User not found for name:', normalizedName);
      return null;
    } catch (error) {
      console.error('[Forum] Get user by username error:', error);
      return null;
    }
  },

  /**
   * Get posts by user ID
   * FIXED: Also queries seed_posts for seed users
   */
  async getUserPosts(userId, page = 1, limit = 20) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const currentUserId = user?.id;

      // First, try forum_posts (real users)
      // Include posts where status is 'published' OR status is null (for backwards compatibility)
      const { data: forumPosts, error: forumError } = await supabase
        .from('forum_posts')
        .select(`
          *,
          author:profiles(id, email, full_name, avatar_url, scanner_tier, chatbot_tier, verified_seller, verified_trader, level_badge, role_badge, role, achievement_badges),
          category:forum_categories(id, name, color),
          likes:forum_likes(user_id),
          saved:forum_saved(user_id)
        `)
        .eq('user_id', userId)
        .or('status.eq.published,status.is.null')
        .neq('status', 'deleted')
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      // If we found forum_posts, return them
      if (forumPosts && forumPosts.length > 0) {
        return forumPosts.map((post) => ({
          ...post,
          user_liked: currentUserId ? post.likes?.some(l => l.user_id === currentUserId) : false,
          user_saved: currentUserId ? post.saved?.some(s => s.user_id === currentUserId) : false,
          likes_count: post.likes_count || post.likes?.length || 0,
        }));
      }

      // If no forum_posts found, try seed_posts (seed users)
      console.log('[Forum] No forum_posts found, checking seed_posts for user:', userId);
      const { data: seedPosts, error: seedError } = await supabase
        .from('seed_posts')
        .select(`
          *,
          seed_users:user_id (
            id,
            full_name,
            avatar_url,
            seed_persona,
            tier,
            is_premium_seed
          )
        `)
        .eq('user_id', userId)
        .or('status.eq.published,status.is.null')
        .neq('status', 'deleted')
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      if (seedError) {
        console.error('[Forum] Seed posts query error:', seedError);
        return [];
      }

      // Transform seed posts to match forum_posts format
      return (seedPosts || []).map((post) => ({
        ...post,
        is_seed_post: true,
        // Map seed_users to author format
        author: post.seed_users ? {
          id: post.seed_users.id,
          full_name: post.seed_users.full_name,
          avatar_url: post.seed_users.avatar_url,
          role: post.seed_users.is_premium_seed ? 'premium_user' : 'user',
          seed_persona: post.seed_users.seed_persona,
          scanner_tier: post.seed_users.tier === 'vip' ? 'TIER_3' : post.seed_users.tier === 'premium' ? 'TIER_2' : 'FREE',
        } : null,
        category: null,
        likes: [],
        saved: [],
        user_liked: false,
        user_saved: false,
        likes_count: post.likes_count || 0,
        comments_count: post.comments_count || 0,
      }));
    } catch (error) {
      console.error('[Forum] Get user posts error:', error);
      return [];
    }
  },

  // ==========================================
  // CUSTOM FEEDS SYSTEM
  // ==========================================

  /**
   * Get all custom feeds for current user
   */
  async getCustomFeeds() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('custom_feeds')
        .select(`
          *,
          topics:custom_feed_topics(topic),
          profiles:custom_feed_profiles(profile_id)
        `)
        .eq('user_id', user.id)
        .order('sort_order');

      if (error) throw error;

      // Transform data to match app format
      return (data || []).map(feed => ({
        id: feed.id,
        name: feed.name,
        description: feed.description,
        isPublic: feed.is_public,
        sortOrder: feed.sort_order,
        topics: feed.topics?.map(t => t.topic) || [],
        profiles: feed.profiles?.map(p => ({ id: p.profile_id })) || [],
        createdAt: feed.created_at,
      }));
    } catch (error) {
      console.error('Error fetching custom feeds:', error);
      return [];
    }
  },

  /**
   * Create a new custom feed
   */
  async createCustomFeed(feedData) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // 1. Create the feed
      const { data: feed, error: feedError } = await supabase
        .from('custom_feeds')
        .insert({
          user_id: user.id,
          name: feedData.name,
          description: feedData.description || '',
          is_public: feedData.isPublic || false,
        })
        .select()
        .single();

      if (feedError) throw feedError;

      // 2. Add topics if any
      if (feedData.topics && feedData.topics.length > 0) {
        const topicsToInsert = feedData.topics.map(topic => ({
          feed_id: feed.id,
          topic,
        }));

        const { error: topicsError } = await supabase
          .from('custom_feed_topics')
          .insert(topicsToInsert);

        if (topicsError) console.error('Error adding topics:', topicsError);
      }

      // 3. Add profiles if any
      if (feedData.profiles && feedData.profiles.length > 0) {
        const profilesToInsert = feedData.profiles.map(profile => ({
          feed_id: feed.id,
          profile_id: profile.id,
        }));

        const { error: profilesError } = await supabase
          .from('custom_feed_profiles')
          .insert(profilesToInsert);

        if (profilesError) console.error('Error adding profiles:', profilesError);
      }

      return {
        success: true,
        feed: {
          id: feed.id,
          name: feed.name,
          description: feed.description,
          isPublic: feed.is_public,
          topics: feedData.topics || [],
          profiles: feedData.profiles || [],
        },
      };
    } catch (error) {
      console.error('Error creating custom feed:', error);
      return { success: false, error };
    }
  },

  /**
   * Update a custom feed
   */
  async updateCustomFeed(feedId, feedData) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // 1. Update the feed
      const { error: feedError } = await supabase
        .from('custom_feeds')
        .update({
          name: feedData.name,
          description: feedData.description,
          is_public: feedData.isPublic,
        })
        .eq('id', feedId)
        .eq('user_id', user.id);

      if (feedError) throw feedError;

      // 2. Update topics (delete all and re-insert)
      if (feedData.topics) {
        await supabase
          .from('custom_feed_topics')
          .delete()
          .eq('feed_id', feedId);

        if (feedData.topics.length > 0) {
          const topicsToInsert = feedData.topics.map(topic => ({
            feed_id: feedId,
            topic,
          }));

          await supabase
            .from('custom_feed_topics')
            .insert(topicsToInsert);
        }
      }

      // 3. Update profiles (delete all and re-insert)
      if (feedData.profiles) {
        await supabase
          .from('custom_feed_profiles')
          .delete()
          .eq('feed_id', feedId);

        if (feedData.profiles.length > 0) {
          const profilesToInsert = feedData.profiles.map(profile => ({
            feed_id: feedId,
            profile_id: profile.id,
          }));

          await supabase
            .from('custom_feed_profiles')
            .insert(profilesToInsert);
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Error updating custom feed:', error);
      return { success: false, error };
    }
  },

  /**
   * Delete a custom feed
   */
  async deleteCustomFeed(feedId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('custom_feeds')
        .delete()
        .eq('id', feedId)
        .eq('user_id', user.id);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error deleting custom feed:', error);
      return { success: false, error };
    }
  },

  /**
   * Reorder custom feeds
   */
  async reorderCustomFeeds(feedIds) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Update sort_order for each feed
      const updates = feedIds.map((id, index) =>
        supabase
          .from('custom_feeds')
          .update({ sort_order: index })
          .eq('id', id)
          .eq('user_id', user.id)
      );

      await Promise.all(updates);
      return { success: true };
    } catch (error) {
      console.error('Error reordering feeds:', error);
      return { success: false, error };
    }
  },

  // ==========================================
  // IN-APP NOTIFICATIONS (Database)
  // ==========================================

  /**
   * Create in-app notification
   */
  async createNotification({ recipientId, type, title, body, data = {} }) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Don't notify yourself
      if (recipientId === user.id) return;

      const { error } = await supabase
        .from('forum_notifications')
        .insert({
          user_id: recipientId,
          from_user_id: user.id,
          type,
          title,
          body,
          data,
          is_read: false,
        });

      if (error) {
        console.error('[Forum] Create notification error:', error);
      }
    } catch (error) {
      console.error('[Forum] Create notification error:', error);
    }
  },

  /**
   * Get notifications for current user (includes broadcasts)
   */
  async getNotifications(page = 1, limit = 30) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // Get user's notifications AND broadcasts (is_broadcast = true)
      let { data, error } = await supabase
        .from('forum_notifications')
        .select(`
          *,
          from_user:from_user_id(id, full_name)
        `)
        .or(`user_id.eq.${user.id},is_broadcast.eq.true`)
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      // If join fails, try without it
      if (error && (error.code === 'PGRST200' || error.message?.includes('relationship'))) {
        console.warn('[Forum] Notifications join failed, fetching without profile data');
        const fallback = await supabase
          .from('forum_notifications')
          .select('*')
          .or(`user_id.eq.${user.id},is_broadcast.eq.true`)
          .order('created_at', { ascending: false })
          .range((page - 1) * limit, page * limit - 1);

        data = fallback.data;
        error = fallback.error;
      }

      if (error) throw error;

      // Map is_read to read for UI compatibility
      return (data || []).map(notification => ({
        ...notification,
        read: notification.is_read,
      }));
    } catch (error) {
      console.error('[Forum] Get notifications error:', error);
      return [];
    }
  },

  /**
   * Get unread notification count (includes broadcasts)
   */
  async getUnreadCount() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return 0;

      const { count, error } = await supabase
        .from('forum_notifications')
        .select('*', { count: 'exact', head: true })
        .or(`user_id.eq.${user.id},is_broadcast.eq.true`)
        .eq('is_read', false);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      return 0;
    }
  },

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId) {
    try {
      const { error } = await supabase
        .from('forum_notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('[Forum] Mark as read error:', error);
      return { success: false };
    }
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { success: false };

      const { error } = await supabase
        .from('forum_notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('[Forum] Mark all as read error:', error);
      return { success: false };
    }
  },

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { success: false };

      const { error } = await supabase
        .from('forum_notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', user.id);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('[Forum] Delete notification error:', error);
      return { success: false };
    }
  },

  /**
   * Get unread notification count
   */
  async getUnreadNotificationCount() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return 0;

      const { count, error } = await supabase
        .from('forum_notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) {
        // If table doesn't exist or column error, return 0 silently
        console.warn('[Forum] Get unread count warning:', error.message);
        return 0;
      }
      return count || 0;
    } catch (error) {
      console.error('[Forum] Get unread count error:', error);
      return 0;
    }
  },

  /**
   * Get user stats (posts count, followers count, following count)
   * FIXED: Also counts from seed_posts and seed_users for seed users
   */
  async getUserStats(userId) {
    try {
      // Get posts count from forum_posts (real users)
      const { count: forumPostsCount, error: postsError } = await supabase
        .from('forum_posts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', 'published');

      if (postsError) console.log('[Forum] Forum posts count (may be 0 for seed users):', postsError.message);

      // If forum_posts count is 0, try seed_posts
      let finalPostsCount = forumPostsCount || 0;
      if (finalPostsCount === 0) {
        const { count: seedPostsCount, error: seedPostsError } = await supabase
          .from('seed_posts')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('status', 'published');

        if (!seedPostsError && seedPostsCount > 0) {
          finalPostsCount = seedPostsCount;
          console.log('[Forum] Found seed posts count:', seedPostsCount);
        }
      }

      // Get followers count from user_follows (real follows)
      const { count: followersCount, error: followersError } = await supabase
        .from('user_follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', userId);

      if (followersError) console.log('[Forum] Get followers count (may be 0):', followersError.message);

      // Also try to get followers_count from seed_users if this is a seed user
      let finalFollowersCount = followersCount || 0;
      if (finalFollowersCount === 0) {
        const { data: seedUser, error: seedUserError } = await supabase
          .from('seed_users')
          .select('followers_count, following_count')
          .eq('id', userId)
          .single();

        if (seedUser && !seedUserError) {
          finalFollowersCount = seedUser.followers_count || 0;
          // Also get following count from seed_users
          const seedFollowingCount = seedUser.following_count || 0;
          return {
            postsCount: finalPostsCount,
            followersCount: finalFollowersCount,
            followingCount: seedFollowingCount,
          };
        }
      }

      // Get following count from user_follows
      const { count: followingCount, error: followingError } = await supabase
        .from('user_follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', userId);

      if (followingError) console.log('[Forum] Get following count:', followingError.message);

      return {
        postsCount: finalPostsCount,
        followersCount: finalFollowersCount,
        followingCount: followingCount || 0,
      };
    } catch (error) {
      console.error('[Forum] Get user stats error:', error);
      return { postsCount: 0, followersCount: 0, followingCount: 0 };
    }
  },

  /**
   * Update current user's profile
   */
  async updateProfile(profileData) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('profiles')
        .update({
          full_name: profileData.full_name,
          bio: profileData.bio,
          avatar_url: profileData.avatar_url,
          username: profileData.username,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('[Forum] Update profile error:', error);
      return { success: false, error };
    }
  },

  /**
   * Upload avatar to Supabase storage
   */
  async uploadAvatar(uri) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      console.log('[Forum] Uploading avatar:', uri);

      // Create unique filename
      const filename = `avatars/${user.id}/${Date.now()}.jpg`;

      // Fetch the image as blob
      const response = await fetch(uri);
      const blob = await response.blob();

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('forum-images')
        .upload(filename, blob, {
          contentType: 'image/jpeg',
          upsert: true,
        });

      if (error) {
        console.error('[Forum] Upload avatar error:', error);
        throw error;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('forum-images')
        .getPublicUrl(filename);

      console.log('[Forum] Avatar uploaded:', urlData.publicUrl);
      return { success: true, url: urlData.publicUrl };
    } catch (error) {
      console.error('[Forum] Upload avatar error:', error);
      return { success: false, error };
    }
  },

  /**
   * Get user's photos (posts with images)
   */
  async getUserPhotos(userId, page = 1, limit = 30) {
    try {
      const { data, error } = await supabase
        .from('forum_posts')
        .select('id, image_url, created_at')
        .eq('user_id', userId)
        .eq('status', 'published')
        .not('image_url', 'is', null)
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('[Forum] Get user photos error:', error);
      return [];
    }
  },

  /**
   * Get user's videos (posts with video URLs)
   */
  async getUserVideos(userId, page = 1, limit = 30) {
    try {
      // For now, return empty array - video support can be added later
      // This would filter posts with video_url column when implemented
      return [];
    } catch (error) {
      console.error('[Forum] Get user videos error:', error);
      return [];
    }
  },

  /**
   * Get posts for a custom feed (by topics and profiles)
   */
  async getCustomFeedPosts(feedId, page = 1, limit = 20) {
    try {
      // Get feed details
      const { data: feed, error: feedError } = await supabase
        .from('custom_feeds')
        .select(`
          *,
          topics:custom_feed_topics(topic),
          profiles:custom_feed_profiles(profile_id)
        `)
        .eq('id', feedId)
        .single();

      if (feedError) throw feedError;

      const topics = feed.topics?.map(t => t.topic) || [];
      const profileIds = feed.profiles?.map(p => p.profile_id) || [];

      // Build query for posts
      let query = supabase
        .from('forum_posts')
        .select(`
          *,
          author:profiles(id, email, full_name, avatar_url, scanner_tier, chatbot_tier, verified_seller, verified_trader, level_badge, role_badge, role, achievement_badges),
          category:forum_categories(id, name, color)
        `)
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      // Filter by topics (search in content/title) or profiles
      if (topics.length > 0 || profileIds.length > 0) {
        const filters = [];

        // Topic filters (search in title and content)
        topics.forEach(topic => {
          filters.push(`title.ilike.%${topic}%`);
          filters.push(`content.ilike.%${topic}%`);
        });

        // Profile filters
        if (profileIds.length > 0) {
          query = query.in('user_id', profileIds);
        } else if (filters.length > 0) {
          query = query.or(filters.join(','));
        }
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching custom feed posts:', error);
      return [];
    }
  },
};

export default forumService;
