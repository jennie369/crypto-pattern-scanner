/**
 * Gemral - Personalized Feed Service
 *
 * Manages personalized content feed based on user track preference
 * Tracks: wealth (trading focus), wellness (spiritual focus), mastery (balanced)
 */

import { supabase } from './supabase';
import cacheService from './cacheService';

// Content categories
export const CONTENT_CATEGORIES = {
  trading: {
    key: 'trading',
    icon: 'TrendingUp',
    color: '#00D9FF',
    labelVi: 'Giao dịch',
    labelEn: 'Trading',
  },
  wellness: {
    key: 'wellness',
    icon: 'Sparkles',
    color: '#FFBD59',
    labelVi: 'Tần số',
    labelEn: 'Wellness',
  },
  integration: {
    key: 'integration',
    icon: 'Infinity',
    color: '#8B5CF6',
    labelVi: 'Tích hợp',
    labelEn: 'Integration',
  },
  general: {
    key: 'general',
    icon: 'MessageCircle',
    color: '#6B7280',
    labelVi: 'Chung',
    labelEn: 'General',
  },
};

// User tracks
export const USER_TRACKS = {
  wealth: {
    key: 'wealth',
    icon: 'TrendingUp',
    color: '#00D9FF',
    labelVi: 'Tài sản',
    description: 'Tập trung vào giao dịch, phân tích kỹ thuật',
    tradingWeight: 0.8,
    wellnessWeight: 0.2,
  },
  wellness: {
    key: 'wellness',
    icon: 'Sparkles',
    color: '#FFBD59',
    labelVi: 'Tần số',
    description: 'Tập trung vào tarot, IChing, thiền định',
    tradingWeight: 0.2,
    wellnessWeight: 0.8,
  },
  mastery: {
    key: 'mastery',
    icon: 'Crown',
    color: '#8B5CF6',
    labelVi: 'Làm chủ',
    description: 'Cân bằng giữa tài sản và tần số',
    tradingWeight: 0.5,
    wellnessWeight: 0.5,
  },
};

const CACHE_KEY = 'PERSONALIZED_FEED';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const personalizedFeedService = {
  /**
   * Get personalized feed for user
   */
  async getPersonalizedFeed(userId, options = {}) {
    const { limit = 20, offset = 0, category = null, forceRefresh = false } = options;

    // Check cache if not forcing refresh
    if (!forceRefresh && offset === 0 && !category) {
      const cached = await cacheService.get(CACHE_KEY);
      if (cached) {
        return { success: true, posts: cached, fromCache: true };
      }
    }

    try {
      const { data, error } = await supabase.rpc('get_personalized_feed', {
        p_user_id: userId,
        p_limit: limit,
        p_offset: offset,
        p_category: category,
      });

      if (error) throw error;

      // Process posts
      const posts = (data || []).map((post) => ({
        ...post,
        categoryInfo: CONTENT_CATEGORIES[post.content_category] || CONTENT_CATEGORIES.general,
      }));

      // Cache first page
      if (offset === 0 && !category) {
        await cacheService.set(CACHE_KEY, posts, CACHE_TTL);
      }

      return { success: true, posts };
    } catch (error) {
      console.error('Error fetching personalized feed:', error);

      // Try cache on error
      const cached = await cacheService.get(CACHE_KEY);
      if (cached) {
        return { success: true, posts: cached, fromCache: true };
      }

      return { success: false, error: error.message };
    }
  },

  /**
   * Get user's preferred track
   */
  async getUserTrack(userId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('preferred_track')
        .eq('id', userId)
        .single();

      if (error) throw error;

      const track = data?.preferred_track || 'mastery';
      return { success: true, track, trackInfo: USER_TRACKS[track] || USER_TRACKS.mastery };
    } catch (error) {
      console.error('Error fetching user track:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Update user's preferred track
   */
  async updateUserTrack(userId, track) {
    if (!USER_TRACKS[track]) {
      return { success: false, error: 'Track không hợp lệ' };
    }

    try {
      const { data, error } = await supabase.rpc('update_user_track', {
        p_user_id: userId,
        p_track: track,
      });

      if (error) throw error;

      // Clear feed cache
      await cacheService.remove(CACHE_KEY);

      return { success: true, track, trackInfo: USER_TRACKS[track] };
    } catch (error) {
      console.error('Error updating user track:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get category statistics
   */
  async getCategoryStats() {
    try {
      const { data, error } = await supabase.rpc('get_category_stats');

      if (error) throw error;

      const stats = (data || []).map((stat) => ({
        ...stat,
        categoryInfo: CONTENT_CATEGORIES[stat.category] || CONTENT_CATEGORIES.general,
      }));

      return { success: true, stats };
    } catch (error) {
      console.error('Error fetching category stats:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get posts by category
   */
  async getPostsByCategory(category, options = {}) {
    const { limit = 20, offset = 0 } = options;

    try {
      const { data, error } = await supabase
        .from('forum_posts')
        .select(
          `
          *,
          profiles:user_id (
            id,
            full_name,
            avatar_url,
            scanner_tier
          )
        `
        )
        .eq('status', 'published')
        .eq('content_category', category)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      const posts = (data || []).map((post) => ({
        ...post,
        author_id: post.profiles?.id,
        author_name: post.profiles?.full_name,
        author_avatar: post.profiles?.avatar_url,
        author_tier: post.profiles?.scanner_tier,
        categoryInfo: CONTENT_CATEGORIES[category] || CONTENT_CATEGORIES.general,
      }));

      return { success: true, posts };
    } catch (error) {
      console.error('Error fetching posts by category:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Manually categorize a post (admin function)
   */
  async categorizePost(postId, category) {
    if (!CONTENT_CATEGORIES[category]) {
      return { success: false, error: 'Danh mục không hợp lệ' };
    }

    try {
      const { error } = await supabase
        .from('forum_posts')
        .update({ content_category: category })
        .eq('id', postId);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Error categorizing post:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get trending posts in each category
   */
  async getTrendingByCategory(limit = 5) {
    try {
      const categories = ['trading', 'wellness', 'integration'];
      const results = {};

      for (const category of categories) {
        const { data, error } = await supabase
          .from('forum_posts')
          .select(
            `
            id,
            title,
            content,
            image_url,
            like_count,
            comment_count,
            created_at,
            content_category,
            profiles:user_id (
              id,
              full_name,
              avatar_url
            )
          `
          )
          .eq('status', 'published')
          .eq('content_category', category)
          .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
          .order('like_count', { ascending: false })
          .limit(limit);

        if (!error) {
          results[category] = (data || []).map((post) => ({
            ...post,
            author_name: post.profiles?.full_name,
            author_avatar: post.profiles?.avatar_url,
            categoryInfo: CONTENT_CATEGORIES[category],
          }));
        }
      }

      return { success: true, trending: results };
    } catch (error) {
      console.error('Error fetching trending by category:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get recommended posts for new users (onboarding)
   */
  async getOnboardingPosts(track = 'mastery') {
    try {
      // Get mix based on track
      const trackInfo = USER_TRACKS[track] || USER_TRACKS.mastery;
      const tradingLimit = Math.round(5 * trackInfo.tradingWeight);
      const wellnessLimit = Math.round(5 * trackInfo.wellnessWeight);

      const [tradingResult, wellnessResult] = await Promise.all([
        supabase
          .from('forum_posts')
          .select('id, title, content, image_url, like_count, content_category')
          .eq('status', 'published')
          .eq('content_category', 'trading')
          .order('like_count', { ascending: false })
          .limit(tradingLimit),
        supabase
          .from('forum_posts')
          .select('id, title, content, image_url, like_count, content_category')
          .eq('status', 'published')
          .eq('content_category', 'wellness')
          .order('like_count', { ascending: false })
          .limit(wellnessLimit),
      ]);

      const posts = [
        ...(tradingResult.data || []),
        ...(wellnessResult.data || []),
      ].map((post) => ({
        ...post,
        categoryInfo: CONTENT_CATEGORIES[post.content_category],
      }));

      return { success: true, posts };
    } catch (error) {
      console.error('Error fetching onboarding posts:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Clear feed cache
   */
  async clearCache() {
    await cacheService.remove(CACHE_KEY);
  },
};

export default personalizedFeedService;
