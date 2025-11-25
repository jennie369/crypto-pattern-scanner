/**
 * GEM Platform - Forum Recommendation Service
 * Smart post recommendation algorithm based on user engagement
 * Matches GEM Platform philosophy: Trading / Tinh Thần / Integration
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  POST_VIEWS: '@gem_forum_views',
  POST_LIKES: '@gem_forum_likes',
  POST_SAVES: '@gem_forum_saves',
  CATEGORY_SCORES: '@gem_forum_category_scores',
  AUTHOR_SCORES: '@gem_forum_author_scores',
  TRACK_PREFERENCES: '@gem_forum_track_preferences',
};

// Weight factors for recommendation scoring
const WEIGHTS = {
  viewed: 1,
  liked: 5,
  saved: 4,
  commented: 3,
  categoryAffinity: 2,
  authorAffinity: 2.5,
  trackAffinity: 3,    // Trading/Wellness/Integration preference
  recency: 1.5,
  engagement: 1.2,     // Posts with high engagement
};

// GEM Platform Tracks for category grouping
const TRACK_CATEGORIES = {
  trading: ['trading', 'patterns', 'results', 'Phân Tích Thị Trường', 'Chia Sẻ Tips Hay', 'Kết Quả Giao Dịch', 'Thảo Luận Chiến Lược', 'Hỏi Đáp Giao Dịch'],
  wellness: ['wellness', 'meditation', 'growth', 'Review Đá Crystal', 'Luật Hấp Dẫn', 'Phát Triển Bản Thân', 'Tips Chữa Lành'],
  integration: ['mindful-trading', 'sieu-giau', 'Giao Dịch Chánh Niệm', 'Tư Duy Thịnh Vượng', 'Tips Trader Thành Công', 'Cân Bằng Cuộc Sống'],
};

// Keywords that indicate post track
const TRACK_KEYWORDS = {
  trading: ['btc', 'eth', 'crypto', 'trading', 'giao dịch', 'coin', 'market', 'entry', 'tp', 'sl', 'long', 'short', 'profit', 'loss', 'futures', 'leverage', 'chart', 'pattern'],
  wellness: ['crystal', 'đá', 'năng lượng', 'energy', 'healing', 'thiền', 'meditation', 'chakra', 'thạch anh', 'amethyst', 'citrine'],
  integration: ['chánh niệm', 'mindful', 'tâm lý', 'psychology', 'thịnh vượng', 'abundance', 'cân bằng', 'balance', 'thành công'],
};

class ForumRecommendationService {
  constructor() {
    this.postViews = [];
    this.postLikes = [];
    this.postSaves = [];
    this.categoryScores = {};
    this.authorScores = {};
    this.trackPreferences = { trading: 0, wellness: 0, integration: 0 };
    this.initialized = false;
  }

  /**
   * Initialize service - load user history from storage
   */
  async init() {
    if (this.initialized) return;

    try {
      const [views, likes, saves, categories, authors, tracks] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.POST_VIEWS),
        AsyncStorage.getItem(STORAGE_KEYS.POST_LIKES),
        AsyncStorage.getItem(STORAGE_KEYS.POST_SAVES),
        AsyncStorage.getItem(STORAGE_KEYS.CATEGORY_SCORES),
        AsyncStorage.getItem(STORAGE_KEYS.AUTHOR_SCORES),
        AsyncStorage.getItem(STORAGE_KEYS.TRACK_PREFERENCES),
      ]);

      this.postViews = views ? JSON.parse(views) : [];
      this.postLikes = likes ? JSON.parse(likes) : [];
      this.postSaves = saves ? JSON.parse(saves) : [];
      this.categoryScores = categories ? JSON.parse(categories) : {};
      this.authorScores = authors ? JSON.parse(authors) : {};
      this.trackPreferences = tracks ? JSON.parse(tracks) : { trading: 0, wellness: 0, integration: 0 };
      this.initialized = true;
    } catch (error) {
      console.error('[ForumRec] Error initializing:', error);
    }
  }

  /**
   * Detect which track a post belongs to
   */
  _detectTrack(post) {
    const text = `${post.title || ''} ${post.content || ''} ${post.category?.name || ''}`.toLowerCase();

    // Check by category first
    const category = post.category?.name || post.category_id || '';
    for (const [track, categories] of Object.entries(TRACK_CATEGORIES)) {
      if (categories.some(cat => category.toLowerCase().includes(cat.toLowerCase()))) {
        return track;
      }
    }

    // Check by keywords
    let scores = { trading: 0, wellness: 0, integration: 0 };
    for (const [track, keywords] of Object.entries(TRACK_KEYWORDS)) {
      keywords.forEach(keyword => {
        if (text.includes(keyword)) {
          scores[track]++;
        }
      });
    }

    // Return highest scoring track or null
    const maxScore = Math.max(...Object.values(scores));
    if (maxScore === 0) return null;
    return Object.entries(scores).find(([_, score]) => score === maxScore)?.[0] || null;
  }

  /**
   * Track post view
   */
  async trackView(post) {
    await this.init();

    const entry = {
      postId: post.id,
      authorId: post.author_id || post.user_id,
      category: post.category?.name || post.category_id,
      track: this._detectTrack(post),
      timestamp: Date.now(),
    };

    // Add to view history (keep last 200)
    this.postViews = [entry, ...this.postViews.filter(v => v.postId !== post.id).slice(0, 199)];

    // Update category affinity
    if (entry.category) {
      this.categoryScores[entry.category] = (this.categoryScores[entry.category] || 0) + WEIGHTS.viewed;
    }

    // Update author affinity
    if (entry.authorId) {
      this.authorScores[entry.authorId] = (this.authorScores[entry.authorId] || 0) + WEIGHTS.viewed;
    }

    // Update track preference
    if (entry.track) {
      this.trackPreferences[entry.track] = (this.trackPreferences[entry.track] || 0) + WEIGHTS.viewed;
    }

    await this._saveHistory();
  }

  /**
   * Track post like
   */
  async trackLike(post) {
    await this.init();

    const entry = {
      postId: post.id,
      authorId: post.author_id || post.user_id,
      category: post.category?.name || post.category_id,
      track: this._detectTrack(post),
      timestamp: Date.now(),
    };

    this.postLikes = [entry, ...this.postLikes.filter(l => l.postId !== post.id).slice(0, 99)];

    if (entry.category) {
      this.categoryScores[entry.category] = (this.categoryScores[entry.category] || 0) + WEIGHTS.liked;
    }
    if (entry.authorId) {
      this.authorScores[entry.authorId] = (this.authorScores[entry.authorId] || 0) + WEIGHTS.liked;
    }
    if (entry.track) {
      this.trackPreferences[entry.track] = (this.trackPreferences[entry.track] || 0) + WEIGHTS.liked;
    }

    await this._saveHistory();
  }

  /**
   * Track post save/bookmark
   */
  async trackSave(post) {
    await this.init();

    const entry = {
      postId: post.id,
      authorId: post.author_id || post.user_id,
      category: post.category?.name || post.category_id,
      track: this._detectTrack(post),
      timestamp: Date.now(),
    };

    this.postSaves = [entry, ...this.postSaves.filter(s => s.postId !== post.id).slice(0, 49)];

    if (entry.category) {
      this.categoryScores[entry.category] = (this.categoryScores[entry.category] || 0) + WEIGHTS.saved;
    }
    if (entry.authorId) {
      this.authorScores[entry.authorId] = (this.authorScores[entry.authorId] || 0) + WEIGHTS.saved;
    }
    if (entry.track) {
      this.trackPreferences[entry.track] = (this.trackPreferences[entry.track] || 0) + WEIGHTS.saved;
    }

    await this._saveHistory();
  }

  /**
   * Track unlike (remove from history)
   */
  async trackUnlike(postId) {
    await this.init();
    this.postLikes = this.postLikes.filter(l => l.postId !== postId);
    await this._saveHistory();
  }

  /**
   * Track unsave (remove from history)
   */
  async trackUnsave(postId) {
    await this.init();
    this.postSaves = this.postSaves.filter(s => s.postId !== postId);
    await this._saveHistory();
  }

  /**
   * Calculate recommendation score for a post
   */
  _calculateScore(post, userProfile) {
    let score = 0;
    const now = Date.now();
    const DAY_MS = 24 * 60 * 60 * 1000;

    // Category affinity
    const category = post.category?.name || post.category_id;
    if (category && this.categoryScores[category]) {
      score += this.categoryScores[category] * WEIGHTS.categoryAffinity;
    }

    // Author affinity (posts from authors user engages with)
    const authorId = post.author_id || post.user_id;
    if (authorId && this.authorScores[authorId]) {
      score += this.authorScores[authorId] * WEIGHTS.authorAffinity;
    }

    // Track affinity (Trading/Wellness/Integration)
    const track = this._detectTrack(post);
    if (track && this.trackPreferences[track]) {
      score += this.trackPreferences[track] * WEIGHTS.trackAffinity;
    }

    // Recency boost for post creation time
    if (post.created_at) {
      const postAge = (now - new Date(post.created_at).getTime()) / DAY_MS;
      score += Math.max(0, (14 - postAge) / 14) * WEIGHTS.recency * 10; // 2-week decay
    }

    // Engagement boost (likes, comments)
    const engagement = (post.likes_count || 0) + (post.comments_count || 0) * 2;
    score += Math.min(engagement, 50) * WEIGHTS.engagement * 0.5;

    // Already viewed penalty (slight)
    const recentlyViewed = this.postViews.find(v => v.postId === post.id);
    if (recentlyViewed) {
      const daysAgo = (now - recentlyViewed.timestamp) / DAY_MS;
      if (daysAgo < 1) {
        score *= 0.3; // Heavy penalty for posts viewed in last 24h
      } else if (daysAgo < 3) {
        score *= 0.6; // Medium penalty for posts viewed in last 3 days
      }
    }

    return score;
  }

  /**
   * Build user profile from engagement history
   */
  _buildUserProfile() {
    return {
      viewCount: this.postViews.length,
      likeCount: this.postLikes.length,
      saveCount: this.postSaves.length,
      topCategories: Object.entries(this.categoryScores)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([cat]) => cat),
      topAuthors: Object.entries(this.authorScores)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([author]) => author),
      preferredTrack: Object.entries(this.trackPreferences)
        .sort((a, b) => b[1] - a[1])[0]?.[0] || null,
      trackScores: { ...this.trackPreferences },
    };
  }

  /**
   * Get "For You" personalized posts
   */
  async getForYouPosts(allPosts, options = {}) {
    await this.init();

    const { limit = 20, excludeIds = [] } = options;
    const userProfile = this._buildUserProfile();

    // Filter out excluded posts
    let posts = allPosts.filter(p => !excludeIds.includes(p.id));

    // If user has no history, return recent posts with some randomness
    if (userProfile.viewCount === 0) {
      return this._shuffleArray([...posts])
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, limit);
    }

    // Score and sort posts
    const scoredPosts = posts.map(post => ({
      ...post,
      _score: this._calculateScore(post, userProfile),
    }));

    scoredPosts.sort((a, b) => b._score - a._score);

    // Add some randomness to avoid always showing same items
    const top = scoredPosts.slice(0, Math.min(limit * 2, scoredPosts.length));
    const shuffled = this._shuffleWithBias(top);

    return shuffled.slice(0, limit);
  }

  /**
   * Get posts from followed authors
   */
  async getFollowingPosts(allPosts, followingIds = [], limit = 20) {
    await this.init();

    // Filter to only posts from followed users
    const posts = allPosts.filter(p =>
      followingIds.includes(p.author_id || p.user_id)
    );

    // Sort by recency
    return posts
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, limit);
  }

  /**
   * Get posts by track (Trading/Wellness/Integration)
   */
  async getTrackPosts(allPosts, track, limit = 20) {
    await this.init();

    const posts = allPosts.filter(p => this._detectTrack(p) === track);

    // Sort by engagement + recency
    return posts
      .sort((a, b) => {
        const engA = (a.likes_count || 0) + (a.comments_count || 0);
        const engB = (b.likes_count || 0) + (b.comments_count || 0);
        const dateA = new Date(a.created_at);
        const dateB = new Date(b.created_at);
        return (engB * 0.3 + dateB.getTime() * 0.7) - (engA * 0.3 + dateA.getTime() * 0.7);
      })
      .slice(0, limit);
  }

  /**
   * Get trending posts (high engagement in recent period)
   */
  async getTrendingPosts(allPosts, limit = 20) {
    const now = Date.now();
    const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

    // Filter to posts from last week
    const recentPosts = allPosts.filter(p => {
      const postDate = new Date(p.created_at).getTime();
      return (now - postDate) < WEEK_MS;
    });

    // Sort by engagement
    return recentPosts
      .sort((a, b) => {
        const engA = (a.likes_count || 0) * 2 + (a.comments_count || 0) * 3;
        const engB = (b.likes_count || 0) * 2 + (b.comments_count || 0) * 3;
        return engB - engA;
      })
      .slice(0, limit);
  }

  /**
   * Get similar posts to a given post
   */
  async getSimilarPosts(post, allPosts, limit = 8) {
    const category = post.category?.name || post.category_id;
    const track = this._detectTrack(post);
    const authorId = post.author_id || post.user_id;

    const scored = allPosts
      .filter(p => p.id !== post.id)
      .map(p => {
        let score = 0;

        // Same category = high score
        const pCategory = p.category?.name || p.category_id;
        if (pCategory && pCategory === category) {
          score += 15;
        }

        // Same track = medium score
        if (this._detectTrack(p) === track) {
          score += 10;
        }

        // Same author = medium score
        if ((p.author_id || p.user_id) === authorId) {
          score += 8;
        }

        // Recency
        if (p.created_at) {
          const daysAgo = (Date.now() - new Date(p.created_at).getTime()) / (24 * 60 * 60 * 1000);
          score += Math.max(0, 5 - daysAgo * 0.5);
        }

        return { ...p, _score: score };
      });

    scored.sort((a, b) => b._score - a._score);
    return scored.slice(0, limit);
  }

  /**
   * Get user's preferred track
   */
  async getPreferredTrack() {
    await this.init();
    const profile = this._buildUserProfile();
    return profile.preferredTrack;
  }

  /**
   * Get user engagement stats
   */
  async getEngagementStats() {
    await this.init();
    return {
      viewCount: this.postViews.length,
      likeCount: this.postLikes.length,
      saveCount: this.postSaves.length,
      trackPreferences: { ...this.trackPreferences },
      topCategories: Object.entries(this.categoryScores)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3),
    };
  }

  /**
   * Shuffle with bias towards higher scored items
   */
  _shuffleWithBias(items) {
    return items.sort((a, b) => {
      const scoreA = (a._score || 0) + Math.random() * 15;
      const scoreB = (b._score || 0) + Math.random() * 15;
      return scoreB - scoreA;
    });
  }

  /**
   * Simple array shuffle
   */
  _shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  /**
   * Save history to storage
   */
  async _saveHistory() {
    try {
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.POST_VIEWS, JSON.stringify(this.postViews)),
        AsyncStorage.setItem(STORAGE_KEYS.POST_LIKES, JSON.stringify(this.postLikes)),
        AsyncStorage.setItem(STORAGE_KEYS.POST_SAVES, JSON.stringify(this.postSaves)),
        AsyncStorage.setItem(STORAGE_KEYS.CATEGORY_SCORES, JSON.stringify(this.categoryScores)),
        AsyncStorage.setItem(STORAGE_KEYS.AUTHOR_SCORES, JSON.stringify(this.authorScores)),
        AsyncStorage.setItem(STORAGE_KEYS.TRACK_PREFERENCES, JSON.stringify(this.trackPreferences)),
      ]);
    } catch (error) {
      console.error('[ForumRec] Error saving history:', error);
    }
  }

  /**
   * Clear all history
   */
  async clearHistory() {
    this.postViews = [];
    this.postLikes = [];
    this.postSaves = [];
    this.categoryScores = {};
    this.authorScores = {};
    this.trackPreferences = { trading: 0, wellness: 0, integration: 0 };

    await Promise.all([
      AsyncStorage.removeItem(STORAGE_KEYS.POST_VIEWS),
      AsyncStorage.removeItem(STORAGE_KEYS.POST_LIKES),
      AsyncStorage.removeItem(STORAGE_KEYS.POST_SAVES),
      AsyncStorage.removeItem(STORAGE_KEYS.CATEGORY_SCORES),
      AsyncStorage.removeItem(STORAGE_KEYS.AUTHOR_SCORES),
      AsyncStorage.removeItem(STORAGE_KEYS.TRACK_PREFERENCES),
    ]);
  }
}

export const forumRecommendationService = new ForumRecommendationService();
export default forumRecommendationService;
