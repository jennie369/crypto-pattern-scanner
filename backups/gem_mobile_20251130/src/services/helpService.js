/**
 * Gemral - Help Service
 * Service layer cho Help Center
 * Sử dụng mock data từ helpArticles.js
 */

import {
  HELP_CATEGORIES,
  HELP_ARTICLES,
  getArticlesByCategory as getArticlesByCategoryData,
  getArticleBySlug as getArticleBySlugData,
  searchArticles as searchArticlesData,
  getAllArticles as getAllArticlesData,
  getCategoryById as getCategoryByIdData,
} from '../data/helpArticles';

class HelpService {
  constructor() {
    this._viewsCache = {};
    this._feedbackCache = {};
  }

  /**
   * Lấy tất cả categories
   * @returns {Promise<Array>} List of categories
   */
  async getCategories() {
    try {
      // Simulate network delay
      await this._delay(100);
      return HELP_CATEGORIES;
    } catch (error) {
      console.error('[HelpService] Get categories error:', error);
      return [];
    }
  }

  /**
   * Lấy category theo ID
   * @param {string} categoryId
   * @returns {Promise<Object|null>} Category hoặc null
   */
  async getCategoryById(categoryId) {
    try {
      await this._delay(50);
      return getCategoryByIdData(categoryId);
    } catch (error) {
      console.error('[HelpService] Get category error:', error);
      return null;
    }
  }

  /**
   * Lấy articles theo category
   * @param {string} categoryId
   * @returns {Promise<Array>} List of articles
   */
  async getArticlesByCategory(categoryId) {
    try {
      await this._delay(100);
      return getArticlesByCategoryData(categoryId);
    } catch (error) {
      console.error('[HelpService] Get articles by category error:', error);
      return [];
    }
  }

  /**
   * Lấy article theo slug
   * @param {string} slug
   * @returns {Promise<Object|null>} Article hoặc null
   */
  async getArticleBySlug(slug) {
    try {
      await this._delay(100);
      const article = getArticleBySlugData(slug);

      if (article) {
        // Track view
        this.trackView(slug);
      }

      return article;
    } catch (error) {
      console.error('[HelpService] Get article error:', error);
      return null;
    }
  }

  /**
   * Lấy tất cả articles
   * @returns {Promise<Array>} List of all articles
   */
  async getAllArticles() {
    try {
      await this._delay(100);
      return getAllArticlesData();
    } catch (error) {
      console.error('[HelpService] Get all articles error:', error);
      return [];
    }
  }

  /**
   * Search articles
   * @param {string} query
   * @returns {Promise<Array>} Search results
   */
  async searchArticles(query) {
    try {
      if (!query || query.trim().length < 2) {
        return [];
      }

      await this._delay(150);
      return searchArticlesData(query.trim());
    } catch (error) {
      console.error('[HelpService] Search error:', error);
      return [];
    }
  }

  /**
   * Lấy popular articles (dựa trên views)
   * @param {number} limit
   * @returns {Promise<Array>} Popular articles
   */
  async getPopularArticles(limit = 5) {
    try {
      await this._delay(100);
      const allArticles = getAllArticlesData();

      // Sort by views (mock - using random for now)
      return allArticles
        .sort((a, b) => {
          const viewsA = this._viewsCache[a.slug] || 0;
          const viewsB = this._viewsCache[b.slug] || 0;
          return viewsB - viewsA;
        })
        .slice(0, limit);
    } catch (error) {
      console.error('[HelpService] Get popular articles error:', error);
      return [];
    }
  }

  /**
   * Lấy related articles
   * @param {string} articleSlug - Current article slug
   * @param {number} limit
   * @returns {Promise<Array>} Related articles
   */
  async getRelatedArticles(articleSlug, limit = 3) {
    try {
      await this._delay(50);
      const currentArticle = getArticleBySlugData(articleSlug);

      if (!currentArticle) {
        return [];
      }

      // Get articles from same category, excluding current
      const categoryArticles = getArticlesByCategoryData(
        currentArticle.categoryId
      ).filter((article) => article.slug !== articleSlug);

      // If not enough, get from other categories
      if (categoryArticles.length < limit) {
        const allArticles = getAllArticlesData().filter(
          (article) =>
            article.slug !== articleSlug &&
            !categoryArticles.find((a) => a.slug === article.slug)
        );

        return [...categoryArticles, ...allArticles].slice(0, limit);
      }

      return categoryArticles.slice(0, limit);
    } catch (error) {
      console.error('[HelpService] Get related articles error:', error);
      return [];
    }
  }

  /**
   * Track article view
   * @param {string} articleSlug
   */
  trackView(articleSlug) {
    try {
      if (!this._viewsCache[articleSlug]) {
        this._viewsCache[articleSlug] = 0;
      }
      this._viewsCache[articleSlug]++;
      console.log(
        `[HelpService] Tracked view for: ${articleSlug} (total: ${this._viewsCache[articleSlug]})`
      );
    } catch (error) {
      console.warn('[HelpService] Track view error:', error);
    }
  }

  /**
   * Submit feedback cho article
   * @param {string} articleSlug
   * @param {boolean} wasHelpful
   * @param {string} comment - Optional comment
   * @returns {Promise<Object>} Result
   */
  async submitFeedback(articleSlug, wasHelpful, comment = '') {
    try {
      await this._delay(200);

      if (!this._feedbackCache[articleSlug]) {
        this._feedbackCache[articleSlug] = {
          helpful: 0,
          notHelpful: 0,
          comments: [],
        };
      }

      if (wasHelpful) {
        this._feedbackCache[articleSlug].helpful++;
      } else {
        this._feedbackCache[articleSlug].notHelpful++;
      }

      if (comment.trim()) {
        this._feedbackCache[articleSlug].comments.push({
          text: comment.trim(),
          timestamp: new Date().toISOString(),
          wasHelpful,
        });
      }

      console.log(
        `[HelpService] Feedback submitted for: ${articleSlug}`,
        this._feedbackCache[articleSlug]
      );

      return {
        success: true,
        message: 'Cảm ơn bạn đã góp ý!',
      };
    } catch (error) {
      console.error('[HelpService] Submit feedback error:', error);
      return {
        success: false,
        error: error.message || 'Có lỗi xảy ra',
      };
    }
  }

  /**
   * Get feedback stats cho article
   * @param {string} articleSlug
   * @returns {Object} Feedback stats
   */
  getFeedbackStats(articleSlug) {
    return (
      this._feedbackCache[articleSlug] || {
        helpful: 0,
        notHelpful: 0,
        comments: [],
      }
    );
  }

  /**
   * Helper: Simulate network delay
   * @param {number} ms
   */
  _delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const helpService = new HelpService();
export default helpService;
