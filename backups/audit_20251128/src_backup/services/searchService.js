/**
 * Gemral - Search Service
 * Full-text search for forum posts with filters and recent searches
 */

import { supabase } from './supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

const RECENT_SEARCHES_KEY = '@gem_recent_searches';
const MAX_RECENT_SEARCHES = 10;

export const searchService = {
  /**
   * Full-text search posts
   * @param {string} query - Search query
   * @param {object} filters - Optional filters (topic, dateRange, authorId)
   * @param {number} page - Page number
   * @param {number} limit - Results per page
   */
  async searchPosts(query, filters = {}, page = 1, limit = 20) {
    try {
      if (!query || query.trim().length < 2) {
        return { data: [], count: 0 };
      }

      const { topic, dateRange, authorId, hasMedia } = filters;
      const offset = (page - 1) * limit;
      const searchTerm = query.trim().toLowerCase();

      // Build query with full-text search
      let queryBuilder = supabase
        .from('forum_posts')
        .select(`
          *,
          author:profiles(id, email, full_name, avatar_url, scanner_tier, chatbot_tier, verified_seller, verified_trader, level_badge, role_badge, role, achievement_badges),
          category:forum_categories(id, name, color),
          likes:forum_likes(user_id),
          saved:forum_saved(user_id)
        `, { count: 'exact' })
        .eq('status', 'published')
        .or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`);

      // Apply topic filter
      if (topic) {
        queryBuilder = queryBuilder.eq('topic', topic);
      }

      // Apply date range filter
      if (dateRange) {
        const now = new Date();
        let startDate;

        switch (dateRange) {
          case 'today':
            startDate = new Date(now.setHours(0, 0, 0, 0));
            break;
          case 'week':
            startDate = new Date(now.setDate(now.getDate() - 7));
            break;
          case 'month':
            startDate = new Date(now.setMonth(now.getMonth() - 1));
            break;
          case 'year':
            startDate = new Date(now.setFullYear(now.getFullYear() - 1));
            break;
        }

        if (startDate) {
          queryBuilder = queryBuilder.gte('created_at', startDate.toISOString());
        }
      }

      // Apply author filter
      if (authorId) {
        queryBuilder = queryBuilder.eq('user_id', authorId);
      }

      // Apply media filter
      if (hasMedia === true) {
        queryBuilder = queryBuilder.not('image_url', 'is', null);
      } else if (hasMedia === false) {
        queryBuilder = queryBuilder.is('image_url', null);
      }

      // Order by relevance (posts with search term in title first, then by date)
      queryBuilder = queryBuilder
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      const { data, error, count } = await queryBuilder;

      if (error) throw error;

      // Sort results to prioritize title matches
      const sortedData = (data || []).sort((a, b) => {
        const aInTitle = a.title?.toLowerCase().includes(searchTerm);
        const bInTitle = b.title?.toLowerCase().includes(searchTerm);

        if (aInTitle && !bInTitle) return -1;
        if (!aInTitle && bInTitle) return 1;
        return 0;
      });

      return { data: sortedData, count: count || 0 };
    } catch (error) {
      console.error('[SearchService] Search error:', error);
      return { data: [], count: 0 };
    }
  },

  /**
   * Search users for mentions or tagging
   * @param {string} query - Username search query
   * @param {number} limit - Max results
   */
  async searchUsers(query, limit = 10) {
    try {
      if (!query || query.trim().length < 1) {
        return [];
      }

      const searchTerm = query.trim().toLowerCase();

      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name, avatar_url, verified_seller, verified_trader')
        .or(`full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('[SearchService] User search error:', error);
      return [];
    }
  },

  /**
   * Search by hashtag
   * @param {string} hashtag - Hashtag without #
   * @param {number} page - Page number
   * @param {number} limit - Results per page
   */
  async searchByHashtag(hashtag, page = 1, limit = 20) {
    try {
      if (!hashtag) return { data: [], count: 0 };

      const normalizedTag = hashtag.toLowerCase().replace('#', '');
      const offset = (page - 1) * limit;

      const { data, error, count } = await supabase
        .from('forum_posts')
        .select(`
          *,
          author:profiles(id, email, full_name, avatar_url, scanner_tier, chatbot_tier, verified_seller, verified_trader, level_badge, role_badge, role, achievement_badges),
          category:forum_categories(id, name, color),
          likes:forum_likes(user_id),
          saved:forum_saved(user_id)
        `, { count: 'exact' })
        .eq('status', 'published')
        .contains('hashtags', [normalizedTag])
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return { data: data || [], count: count || 0 };
    } catch (error) {
      console.error('[SearchService] Hashtag search error:', error);
      return { data: [], count: 0 };
    }
  },

  /**
   * Get trending search terms
   */
  async getTrendingSearches() {
    try {
      // Get trending hashtags as search suggestions
      const { data, error } = await supabase
        .rpc('get_trending_hashtags', { limit_count: 5 });

      if (error) {
        console.warn('[SearchService] Could not get trending hashtags:', error);
        return [];
      }

      return (data || []).map(item => ({
        term: `#${item.hashtag}`,
        count: item.count,
        type: 'hashtag'
      }));
    } catch (error) {
      console.error('[SearchService] Trending error:', error);
      return [];
    }
  },

  /**
   * Get suggested search terms based on partial input
   * @param {string} query - Partial search query
   */
  async getSuggestions(query) {
    try {
      if (!query || query.trim().length < 2) return [];

      const searchTerm = query.trim().toLowerCase();
      const suggestions = [];

      // Get matching hashtags
      const { data: hashtagPosts } = await supabase
        .from('forum_posts')
        .select('hashtags')
        .not('hashtags', 'is', null)
        .limit(50);

      if (hashtagPosts) {
        const allHashtags = new Set();
        hashtagPosts.forEach(post => {
          if (post.hashtags && Array.isArray(post.hashtags)) {
            post.hashtags.forEach(tag => {
              if (tag.toLowerCase().includes(searchTerm)) {
                allHashtags.add(tag.toLowerCase());
              }
            });
          }
        });

        // Add hashtag suggestions
        Array.from(allHashtags).slice(0, 5).forEach(tag => {
          suggestions.push({ term: `#${tag}`, type: 'hashtag' });
        });
      }

      // Get matching titles
      const { data: titlePosts } = await supabase
        .from('forum_posts')
        .select('title')
        .eq('status', 'published')
        .ilike('title', `%${searchTerm}%`)
        .limit(5);

      if (titlePosts) {
        titlePosts.forEach(post => {
          if (post.title) {
            suggestions.push({ term: post.title, type: 'title' });
          }
        });
      }

      return suggestions.slice(0, 8);
    } catch (error) {
      console.error('[SearchService] Suggestions error:', error);
      return [];
    }
  },

  // =====================
  // Recent Searches (Local)
  // =====================

  /**
   * Get recent searches from local storage
   */
  async getRecentSearches() {
    try {
      const stored = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('[SearchService] Get recent searches error:', error);
      return [];
    }
  },

  /**
   * Add a search term to recent searches
   * @param {string} term - Search term to add
   */
  async addRecentSearch(term) {
    try {
      if (!term || term.trim().length < 2) return;

      const trimmedTerm = term.trim();
      const recent = await this.getRecentSearches();

      // Remove if already exists
      const filtered = recent.filter(item => item.term !== trimmedTerm);

      // Add to beginning
      filtered.unshift({
        term: trimmedTerm,
        timestamp: Date.now()
      });

      // Keep only MAX_RECENT_SEARCHES items
      const trimmed = filtered.slice(0, MAX_RECENT_SEARCHES);

      await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(trimmed));
    } catch (error) {
      console.error('[SearchService] Add recent search error:', error);
    }
  },

  /**
   * Remove a search term from recent searches
   * @param {string} term - Search term to remove
   */
  async removeRecentSearch(term) {
    try {
      const recent = await this.getRecentSearches();
      const filtered = recent.filter(item => item.term !== term);
      await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('[SearchService] Remove recent search error:', error);
    }
  },

  /**
   * Clear all recent searches
   */
  async clearRecentSearches() {
    try {
      await AsyncStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch (error) {
      console.error('[SearchService] Clear recent searches error:', error);
    }
  },
};

export default searchService;
