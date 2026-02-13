/**
 * Gemral - Recommendation Service
 * Smart product recommendation algorithm based on user behavior
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  VIEW_HISTORY: '@gem_view_history',
  CART_HISTORY: '@gem_cart_history',
  PURCHASE_HISTORY: '@gem_purchase_history',
  CATEGORY_SCORES: '@gem_category_scores',
  SEARCH_HISTORY: '@gem_search_history',
};

// Weight factors for recommendation scoring
const WEIGHTS = {
  viewed: 1,
  addedToCart: 3,
  purchased: 5,
  categoryAffinity: 2,
  recency: 1.5,    // More recent = higher score
  trending: 1.2,   // Hot products boost
  priceRange: 1,   // Match user's typical price range
};

class RecommendationService {
  constructor() {
    this.viewHistory = [];
    this.cartHistory = [];
    this.purchaseHistory = [];
    this.categoryScores = {};
    this.searchHistory = [];
    this.initialized = false;
  }

  /**
   * Initialize service - load user history from storage
   */
  async init() {
    if (this.initialized) return;

    try {
      const [views, cart, purchases, categories, searches] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.VIEW_HISTORY),
        AsyncStorage.getItem(STORAGE_KEYS.CART_HISTORY),
        AsyncStorage.getItem(STORAGE_KEYS.PURCHASE_HISTORY),
        AsyncStorage.getItem(STORAGE_KEYS.CATEGORY_SCORES),
        AsyncStorage.getItem(STORAGE_KEYS.SEARCH_HISTORY),
      ]);

      this.viewHistory = views ? JSON.parse(views) : [];
      this.cartHistory = cart ? JSON.parse(cart) : [];
      this.purchaseHistory = purchases ? JSON.parse(purchases) : [];
      this.categoryScores = categories ? JSON.parse(categories) : {};
      this.searchHistory = searches ? JSON.parse(searches) : [];
      this.initialized = true;
    } catch (error) {
      console.error('Error initializing recommendation service:', error);
    }
  }

  /**
   * Track product view
   */
  async trackView(product) {
    await this.init();

    const entry = {
      productId: product.id,
      category: product.category || product.productType,
      tags: product.tags || [],
      price: parseFloat(product.price) || 0,
      timestamp: Date.now(),
    };

    // Add to view history (keep last 100)
    this.viewHistory = [entry, ...this.viewHistory.slice(0, 99)];

    // Update category affinity
    if (entry.category) {
      this.categoryScores[entry.category] = (this.categoryScores[entry.category] || 0) + WEIGHTS.viewed;
    }

    await this._saveHistory();
  }

  /**
   * Track add to cart
   */
  async trackAddToCart(product) {
    await this.init();

    const entry = {
      productId: product.id,
      category: product.category || product.productType,
      tags: product.tags || [],
      price: parseFloat(product.price) || 0,
      timestamp: Date.now(),
    };

    this.cartHistory = [entry, ...this.cartHistory.slice(0, 49)];

    if (entry.category) {
      this.categoryScores[entry.category] = (this.categoryScores[entry.category] || 0) + WEIGHTS.addedToCart;
    }

    await this._saveHistory();
  }

  /**
   * Track purchase
   */
  async trackPurchase(products) {
    await this.init();

    const entries = products.map(product => ({
      productId: product.id,
      category: product.category || product.productType,
      tags: product.tags || [],
      price: parseFloat(product.price) || 0,
      timestamp: Date.now(),
    }));

    this.purchaseHistory = [...entries, ...this.purchaseHistory.slice(0, 99)];

    entries.forEach(entry => {
      if (entry.category) {
        this.categoryScores[entry.category] = (this.categoryScores[entry.category] || 0) + WEIGHTS.purchased;
      }
    });

    await this._saveHistory();
  }

  /**
   * Track search query
   */
  async trackSearch(query) {
    await this.init();

    this.searchHistory = [
      { query, timestamp: Date.now() },
      ...this.searchHistory.filter(s => s.query !== query).slice(0, 19)
    ];

    await AsyncStorage.setItem(STORAGE_KEYS.SEARCH_HISTORY, JSON.stringify(this.searchHistory));
  }

  /**
   * Calculate recommendation score for a product
   */
  _calculateScore(product, userProfile) {
    let score = 0;
    const now = Date.now();
    const DAY_MS = 24 * 60 * 60 * 1000;

    // Category affinity score
    const category = product.category || product.productType;
    if (category && this.categoryScores[category]) {
      score += this.categoryScores[category] * WEIGHTS.categoryAffinity;
    }

    // Recently viewed boost
    const recentView = this.viewHistory.find(v => v.productId === product.id);
    if (recentView) {
      const daysAgo = (now - recentView.timestamp) / DAY_MS;
      score += Math.max(0, (7 - daysAgo) / 7) * WEIGHTS.recency * 10;
    }

    // Similar to cart items
    const cartCategories = new Set(this.cartHistory.map(c => c.category).filter(Boolean));
    if (category && cartCategories.has(category)) {
      score += WEIGHTS.addedToCart * 5;
    }

    // Price range matching
    if (userProfile.avgPrice > 0 && product.price) {
      const priceDiff = Math.abs(parseFloat(product.price) - userProfile.avgPrice);
      const priceScore = Math.max(0, 1 - priceDiff / userProfile.avgPrice);
      score += priceScore * WEIGHTS.priceRange * 5;
    }

    // Tag matching
    const productTags = product.tags || [];
    const userTags = userProfile.topTags || [];
    const matchingTags = productTags.filter(t => userTags.includes(t)).length;
    score += matchingTags * 2;

    // Trending boost (if product has high view count or sales)
    if (product.trending || product.bestseller) {
      score += WEIGHTS.trending * 10;
    }

    return score;
  }

  /**
   * Build user profile from history
   */
  _buildUserProfile() {
    const allItems = [
      ...this.viewHistory,
      ...this.cartHistory.map(c => ({ ...c, weight: 2 })),
      ...this.purchaseHistory.map(p => ({ ...p, weight: 3 })),
    ];

    // Calculate average price
    const prices = allItems.map(i => i.price).filter(p => p > 0);
    const avgPrice = prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 0;

    // Get top tags
    const tagCounts = {};
    allItems.forEach(item => {
      (item.tags || []).forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + (item.weight || 1);
      });
    });
    const topTags = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([tag]) => tag);

    // Get top categories
    const topCategories = Object.entries(this.categoryScores)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([cat]) => cat);

    return {
      avgPrice,
      topTags,
      topCategories,
      viewCount: this.viewHistory.length,
      cartCount: this.cartHistory.length,
      purchaseCount: this.purchaseHistory.length,
    };
  }

  /**
   * Get personalized recommendations
   * @param {Array} allProducts - All available products
   * @param {Object} options - Options { limit, excludeIds, category }
   */
  async getRecommendations(allProducts, options = {}) {
    await this.init();

    const { limit = 10, excludeIds = [], category = null } = options;
    const userProfile = this._buildUserProfile();

    // Filter products
    let products = allProducts.filter(p => !excludeIds.includes(p.id));
    if (category) {
      products = products.filter(p =>
        (p.category || p.productType) === category
      );
    }

    // Score and sort products
    const scoredProducts = products.map(product => ({
      ...product,
      _score: this._calculateScore(product, userProfile),
    }));

    scoredProducts.sort((a, b) => b._score - a._score);

    // Add some randomness to avoid always showing same items
    const top = scoredProducts.slice(0, Math.min(limit * 2, scoredProducts.length));
    const shuffled = this._shuffleWithBias(top);

    return shuffled.slice(0, limit);
  }

  /**
   * Get "For You" section - personalized mix
   */
  async getForYouProducts(allProducts, limit = 8) {
    return this.getRecommendations(allProducts, { limit });
  }

  /**
   * Get "Because You Viewed" section
   */
  async getBecauseYouViewed(allProducts, limit = 8) {
    await this.init();

    if (this.viewHistory.length === 0) {
      return this._getRandomProducts(allProducts, limit);
    }

    // Get recently viewed categories
    const recentCategories = [...new Set(
      this.viewHistory.slice(0, 10).map(v => v.category).filter(Boolean)
    )];

    if (recentCategories.length === 0) {
      return this._getRandomProducts(allProducts, limit);
    }

    // Get products from those categories
    const recentViewedIds = new Set(this.viewHistory.map(v => v.productId));
    const related = allProducts.filter(p =>
      recentCategories.includes(p.category || p.productType) &&
      !recentViewedIds.has(p.id)
    );

    return this._shuffleArray(related).slice(0, limit);
  }

  /**
   * Get "Trending Now" section
   */
  async getTrendingProducts(allProducts, limit = 8) {
    // In real app, this would come from analytics
    // For now, shuffle and mark as trending
    const shuffled = this._shuffleArray([...allProducts]);
    return shuffled.slice(0, limit).map(p => ({ ...p, trending: true }));
  }

  /**
   * Get "New Arrivals" section
   */
  async getNewArrivals(allProducts, limit = 8) {
    // Sort by created date (newest first)
    const sorted = [...allProducts].sort((a, b) => {
      const dateA = new Date(a.createdAt || 0);
      const dateB = new Date(b.createdAt || 0);
      return dateB - dateA;
    });
    return sorted.slice(0, limit);
  }

  /**
   * Get "Similar Products" for a specific product
   */
  async getSimilarProducts(product, allProducts, limit = 8) {
    const category = product.category || product.productType;
    const productTags = product.tags || [];

    // Score by similarity
    const scored = allProducts
      .filter(p => p.id !== product.id)
      .map(p => {
        let score = 0;

        // Same category
        if ((p.category || p.productType) === category) {
          score += 10;
        }

        // Matching tags
        const pTags = p.tags || [];
        const matchingTags = pTags.filter(t => productTags.includes(t)).length;
        score += matchingTags * 3;

        // Similar price range (within 30%)
        const priceDiff = Math.abs(parseFloat(p.price || 0) - parseFloat(product.price || 0));
        const priceRatio = priceDiff / (parseFloat(product.price) || 1);
        if (priceRatio < 0.3) score += 5;

        return { ...p, _score: score };
      });

    scored.sort((a, b) => b._score - a._score);
    return scored.slice(0, limit);
  }

  /**
   * Get "Complete The Look" - complementary products
   */
  async getComplementaryProducts(product, allProducts, limit = 4) {
    const category = product.category || product.productType;

    // Define complementary categories
    const complementaryMap = {
      'crystals': ['courses', 'subscriptions', 'merchandise'],
      'courses': ['crystals', 'subscriptions'],
      'subscriptions': ['courses', 'crystals'],
      'merchandise': ['crystals', 'gift-cards'],
      'gift-cards': ['merchandise', 'crystals'],
    };

    const complementary = complementaryMap[category] || [];

    const products = allProducts.filter(p =>
      complementary.includes(p.category || p.productType) &&
      p.id !== product.id
    );

    return this._shuffleArray(products).slice(0, limit);
  }

  /**
   * Shuffle array with bias towards higher scored items
   */
  _shuffleWithBias(items) {
    return items.sort((a, b) => {
      const scoreA = (a._score || 0) + Math.random() * 10;
      const scoreB = (b._score || 0) + Math.random() * 10;
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
   * Get random products (fallback)
   */
  _getRandomProducts(allProducts, limit) {
    return this._shuffleArray([...allProducts]).slice(0, limit);
  }

  /**
   * Save history to storage
   */
  async _saveHistory() {
    try {
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.VIEW_HISTORY, JSON.stringify(this.viewHistory)),
        AsyncStorage.setItem(STORAGE_KEYS.CART_HISTORY, JSON.stringify(this.cartHistory)),
        AsyncStorage.setItem(STORAGE_KEYS.PURCHASE_HISTORY, JSON.stringify(this.purchaseHistory)),
        AsyncStorage.setItem(STORAGE_KEYS.CATEGORY_SCORES, JSON.stringify(this.categoryScores)),
      ]);
    } catch (error) {
      console.error('Error saving recommendation history:', error);
    }
  }

  /**
   * Clear all history (for testing or user request)
   */
  async clearHistory() {
    this.viewHistory = [];
    this.cartHistory = [];
    this.purchaseHistory = [];
    this.categoryScores = {};
    this.searchHistory = [];

    await Promise.all([
      AsyncStorage.removeItem(STORAGE_KEYS.VIEW_HISTORY),
      AsyncStorage.removeItem(STORAGE_KEYS.CART_HISTORY),
      AsyncStorage.removeItem(STORAGE_KEYS.PURCHASE_HISTORY),
      AsyncStorage.removeItem(STORAGE_KEYS.CATEGORY_SCORES),
      AsyncStorage.removeItem(STORAGE_KEYS.SEARCH_HISTORY),
    ]);
  }
}

export const recommendationService = new RecommendationService();
export default recommendationService;
