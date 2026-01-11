/**
 * Livestream Recommendation Service
 * Phase 4: Intelligence Layer
 *
 * 4 Recommendation Strategies:
 * 1. Personalized - Based on user preferences (element, zodiac, price range)
 * 2. Contextual - Based on current product/topic being discussed
 * 3. Trending - Bestsellers and hot products
 * 4. Complementary - Based on cart items
 */

import { supabase } from './supabase';
import { shopifyService } from './shopifyService';

// Ngu Hanh System data for element matching
const NGU_HANH_CRYSTALS = {
  Kim: ['Clear Quartz', 'Citrine', 'Pyrite', 'Tiger Eye'],
  Moc: ['Green Aventurine', 'Jade', 'Malachite', 'Amazonite'],
  Thuy: ['Aquamarine', 'Blue Lace Agate', 'Larimar', 'Moonstone'],
  Hoa: ['Carnelian', 'Red Jasper', 'Garnet', 'Sunstone'],
  Tho: ['Yellow Jasper', 'Smoky Quartz', 'Bronzite', 'Picture Jasper'],
};

// Zodiac crystals mapping
const ZODIAC_CRYSTALS = {
  Aries: ['Carnelian', 'Red Jasper', 'Bloodstone'],
  Taurus: ['Rose Quartz', 'Emerald', 'Malachite'],
  Gemini: ['Citrine', 'Tiger Eye', 'Agate'],
  Cancer: ['Moonstone', 'Pearl', 'Selenite'],
  Leo: ['Sunstone', 'Citrine', 'Peridot'],
  Virgo: ['Green Jade', 'Moss Agate', 'Amazonite'],
  Libra: ['Rose Quartz', 'Lepidolite', 'Lapis Lazuli'],
  Scorpio: ['Obsidian', 'Labradorite', 'Malachite'],
  Sagittarius: ['Turquoise', 'Sodalite', 'Blue Topaz'],
  Capricorn: ['Garnet', 'Smoky Quartz', 'Jet'],
  Aquarius: ['Amethyst', 'Aquamarine', 'Fluorite'],
  Pisces: ['Amethyst', 'Aquamarine', 'Bloodstone'],
};

class LivestreamRecommendationService {
  constructor() {
    this.cache = new Map();
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
  }

  // ============================================================================
  // MAIN RECOMMENDATION METHOD
  // ============================================================================

  async getRecommendations(userId, context = {}, options = {}) {
    const {
      limit = 5,
      strategy = 'auto', // 'auto', 'personalized', 'contextual', 'trending', 'complementary'
      excludeIds = [],
    } = options;

    try {
      // 1. Load user profile
      const user = await this.getUserProfile(userId);

      // 2. Determine strategy
      let selectedStrategy = strategy;
      if (strategy === 'auto') {
        selectedStrategy = this.selectBestStrategy(user, context);
      }

      // 3. Execute strategy
      let recommendations = [];
      switch (selectedStrategy) {
        case 'personalized':
          recommendations = await this.personalizedStrategy(user, limit, excludeIds);
          break;
        case 'contextual':
          recommendations = await this.contextualStrategy(context, limit, excludeIds);
          break;
        case 'complementary':
          recommendations = await this.complementaryStrategy(
            context.cartItems || [],
            limit,
            excludeIds
          );
          break;
        case 'trending':
        default:
          recommendations = await this.trendingStrategy(limit, excludeIds);
      }

      // 4. Log recommendation event
      await this.logRecommendation(userId, selectedStrategy, recommendations);

      return {
        strategy: selectedStrategy,
        products: recommendations,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('[LivestreamRecommendationService] Error:', error);
      // Fallback to trending
      return {
        strategy: 'trending',
        products: await this.trendingStrategy(limit, excludeIds),
        timestamp: new Date().toISOString(),
      };
    }
  }

  // ============================================================================
  // STRATEGY 1: PERSONALIZED
  // Based on user preferences (element, zodiac, price range)
  // ============================================================================

  async personalizedStrategy(user, limit, excludeIds = []) {
    if (!user?.preferences) {
      return this.trendingStrategy(limit, excludeIds);
    }

    const { preferred_element, zodiac_sign, price_range, favorite_categories } =
      user.preferences;

    // Build tags from preferences
    const tags = [];
    if (preferred_element && NGU_HANH_CRYSTALS[preferred_element]) {
      tags.push(...NGU_HANH_CRYSTALS[preferred_element]);
    }
    if (zodiac_sign && ZODIAC_CRYSTALS[zodiac_sign]) {
      tags.push(...ZODIAC_CRYSTALS[zodiac_sign]);
    }

    // Query products
    try {
      const products = await shopifyService.getProducts({
        tags: [...new Set(tags)],
        priceMin: price_range?.min || 0,
        priceMax: price_range?.max || 10000000,
        limit: limit * 2, // Get more to filter
      });

      // Filter out purchased products
      const purchasedIds = user.behavior?.products_purchased || [];
      const filtered = products.filter(
        (p) => !purchasedIds.includes(p.id) && !excludeIds.includes(p.id)
      );

      // Sort by relevance score
      const scored = filtered.map((product) => ({
        ...product,
        relevanceScore: this.calculateRelevanceScore(product, user.preferences),
      }));

      scored.sort((a, b) => b.relevanceScore - a.relevanceScore);

      return scored.slice(0, limit);
    } catch (error) {
      console.error('[Personalized] Error:', error);
      return this.trendingStrategy(limit, excludeIds);
    }
  }

  calculateRelevanceScore(product, preferences) {
    let score = 0;

    // Element match
    if (product.element === preferences?.preferred_element) {
      score += 30;
    }

    // Zodiac match
    if (product.compatible_zodiacs?.includes(preferences?.zodiac_sign)) {
      score += 25;
    }

    // Category match
    if (
      preferences?.favorite_categories?.some((cat) =>
        product.productType?.toLowerCase().includes(cat.toLowerCase())
      )
    ) {
      score += 20;
    }

    // Price range match
    const price = parseFloat(product.variants?.[0]?.price || product.price || 0);
    if (
      preferences?.price_range &&
      price >= preferences.price_range.min &&
      price <= preferences.price_range.max
    ) {
      score += 15;
    }

    // Popularity bonus
    score += Math.min(10, (product.totalInventory || 0) / 10);

    return score;
  }

  // ============================================================================
  // STRATEGY 2: CONTEXTUAL
  // Based on current context (product being viewed, topic being discussed)
  // ============================================================================

  async contextualStrategy(context, limit, excludeIds = []) {
    const { currentProduct, currentTopic, currentKeywords } = context;

    // If viewing a product -> suggest similar
    if (currentProduct) {
      return this.getSimilarProducts(currentProduct, limit, excludeIds);
    }

    // If discussing a topic -> suggest by topic
    if (currentTopic) {
      return this.getProductsByTopic(currentTopic, limit, excludeIds);
    }

    // If keywords detected -> search
    if (currentKeywords?.length > 0) {
      return this.searchProducts(currentKeywords.join(' '), limit, excludeIds);
    }

    // Fallback
    return this.trendingStrategy(limit, excludeIds);
  }

  async getSimilarProducts(product, limit, excludeIds = []) {
    // Find products with same element or compatible zodiacs
    const tags = [];

    if (product.element) {
      tags.push(product.element);
    }
    if (product.compatible_zodiacs) {
      tags.push(...product.compatible_zodiacs);
    }
    if (product.productType) {
      tags.push(product.productType);
    }

    try {
      const products = await shopifyService.getProducts({
        tags: [...new Set(tags)],
        limit: limit + 5,
      });

      return products
        .filter((p) => p.id !== product.id && !excludeIds.includes(p.id))
        .slice(0, limit);
    } catch (error) {
      console.error('[SimilarProducts] Error:', error);
      return [];
    }
  }

  async getProductsByTopic(topic, limit, excludeIds = []) {
    // Map topic to product tags
    const topicTagMap = {
      tinh_yeu: ['Rose Quartz', 'love', 'tình yêu'],
      su_nghiep: ['Citrine', 'Tiger Eye', 'career', 'sự nghiệp'],
      suc_khoe: ['Amethyst', 'Clear Quartz', 'health', 'sức khỏe'],
      tai_loc: ['Pyrite', 'Citrine', 'wealth', 'tài lộc'],
      binh_an: ['Black Tourmaline', 'Obsidian', 'protection', 'bình an'],
      phong_thuy: ['feng shui', 'phong thủy'],
      ngu_hanh: ['Kim', 'Mộc', 'Thủy', 'Hỏa', 'Thổ'],
    };

    const tags = topicTagMap[topic] || [];

    try {
      const products = await shopifyService.getProducts({
        tags,
        limit: limit + 5,
      });

      return products.filter((p) => !excludeIds.includes(p.id)).slice(0, limit);
    } catch (error) {
      console.error('[ProductsByTopic] Error:', error);
      return [];
    }
  }

  async searchProducts(query, limit, excludeIds = []) {
    try {
      const products = await shopifyService.searchProducts(query, limit + 5);
      return products.filter((p) => !excludeIds.includes(p.id)).slice(0, limit);
    } catch (error) {
      console.error('[SearchProducts] Error:', error);
      return [];
    }
  }

  // ============================================================================
  // STRATEGY 3: TRENDING
  // Bestsellers and hot products
  // ============================================================================

  async trendingStrategy(limit, excludeIds = []) {
    // Check cache
    const cacheKey = `trending_${limit}`;
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.products.filter((p) => !excludeIds.includes(p.id));
    }

    try {
      // Get bestsellers from Shopify
      const bestsellers = await shopifyService.getBestsellers(limit + 10);

      // Cache result
      this.cache.set(cacheKey, {
        products: bestsellers,
        timestamp: Date.now(),
      });

      return bestsellers.filter((p) => !excludeIds.includes(p.id)).slice(0, limit);
    } catch (error) {
      console.error('[Trending] Error:', error);
      return [];
    }
  }

  // ============================================================================
  // STRATEGY 4: COMPLEMENTARY
  // Based on cart items
  // ============================================================================

  async complementaryStrategy(cartItems, limit, excludeIds = []) {
    if (!cartItems || cartItems.length === 0) {
      return this.trendingStrategy(limit, excludeIds);
    }

    const recommendations = [];
    const cartProductIds = cartItems.map((item) => item.productId || item.id);
    const excludeAll = [...excludeIds, ...cartProductIds];

    // For each cart item, find related products
    for (const item of cartItems.slice(0, 3)) {
      // Limit to first 3 items
      try {
        const related = await shopifyService.getForYouProducts(
          item.productId || item.id,
          2
        );
        recommendations.push(...related);
      } catch (error) {
        console.warn('[Complementary] Error getting related:', error);
      }
    }

    // Deduplicate and filter
    const uniqueRecs = [];
    const seenIds = new Set();

    for (const product of recommendations) {
      if (!seenIds.has(product.id) && !excludeAll.includes(product.id)) {
        seenIds.add(product.id);
        uniqueRecs.push(product);
      }
    }

    return uniqueRecs.slice(0, limit);
  }

  // ============================================================================
  // LIVESTREAM SPECIFIC METHODS
  // ============================================================================

  async getLivestreamRecommendations(sessionId, viewerId, currentProductId) {
    // Get context from session
    const context = {
      currentProduct: currentProductId
        ? await this.getProductById(currentProductId)
        : null,
    };

    // Get viewer cart
    const cart = await this.getViewerCart(viewerId);
    if (cart?.items?.length > 0) {
      context.cartItems = cart.items;
    }

    return this.getRecommendations(viewerId, context, {
      limit: 4,
      excludeIds: currentProductId ? [currentProductId] : [],
    });
  }

  async getProductById(productId) {
    try {
      return await shopifyService.getProduct(productId);
    } catch (error) {
      console.warn('[getProductById] Error:', error);
      return null;
    }
  }

  async getViewerCart(viewerId) {
    try {
      const { data } = await supabase
        .from('carts')
        .select('items')
        .eq('user_id', viewerId)
        .single();

      return data;
    } catch (error) {
      return null;
    }
  }

  // Proactive recommendation trigger
  async getProactiveRecommendation(viewerId, triggerType) {
    const strategies = {
      idle_viewer: 'trending',
      new_viewer: 'trending',
      returning_viewer: 'personalized',
      cart_viewer: 'complementary',
    };

    const strategy = strategies[triggerType] || 'trending';

    return this.getRecommendations(
      viewerId,
      {},
      {
        limit: 3,
        strategy,
      }
    );
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  selectBestStrategy(user, context) {
    // Prioritize contextual if current product or topic
    if (context.currentProduct || context.currentTopic) {
      return 'contextual';
    }

    // Prioritize complementary if cart has items
    if (context.cartItems?.length > 0) {
      return 'complementary';
    }

    // Prioritize personalized if user has enough data
    if (user?.behavior?.total_sessions > 5 && user?.preferences?.preferred_element) {
      return 'personalized';
    }

    // Default trending
    return 'trending';
  }

  async getUserProfile(userId) {
    if (!userId) return null;

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*, behavior:user_behavior(*)')
        .eq('id', userId)
        .single();

      if (error) {
        console.warn('[getUserProfile] Error:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.warn('[getUserProfile] Error:', error);
      return null;
    }
  }

  async logRecommendation(userId, strategy, products) {
    try {
      await supabase.from('recommendation_logs').insert({
        user_id: userId,
        strategy,
        product_ids: products.map((p) => p.id),
        created_at: new Date().toISOString(),
      });
    } catch (error) {
      console.warn('[logRecommendation] Error:', error);
    }
  }

  // Clear cache (useful when products update)
  clearCache() {
    this.cache.clear();
  }
}

export const livestreamRecommendationService = new LivestreamRecommendationService();
export default livestreamRecommendationService;
