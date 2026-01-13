/**
 * Gemral - Digital Product Service
 * Handles fetching, filtering, and tracking digital products
 */

import { shopifyService } from './shopifyService';
import { supabase } from './supabase';
import {
  DIGITAL_PRODUCT_TAGS,
  DIGITAL_CATEGORIES,
  getTierFromTags,
  getSubscriptionType,
  isDigitalProduct,
} from '../utils/digitalProductsConfig';

class DigitalProductService {
  constructor() {
    this._cache = null;
    this._cacheTime = 0;
    this._cacheDuration = 5 * 60 * 1000; // 5 minutes
  }

  // ═══════════════════════════════════════════════════════════
  // FETCH PRODUCTS
  // ═══════════════════════════════════════════════════════════

  /**
   * Get all digital products
   * @param {boolean} forceRefresh - Force cache refresh
   * @returns {Promise<Array>}
   */
  async getDigitalProducts(forceRefresh = false) {
    // Check cache
    if (!forceRefresh && this._cache && Date.now() - this._cacheTime < this._cacheDuration) {
      return this._cache;
    }

    try {
      // Fetch products with digital tags
      const products = await shopifyService.getProductsByTags(DIGITAL_PRODUCT_TAGS, 100, false);

      // Enhance products with metadata
      const enhancedProducts = (products || []).map(product => this._enhanceProduct(product));

      // Update cache
      this._cache = enhancedProducts;
      this._cacheTime = Date.now();

      return enhancedProducts;
    } catch (error) {
      console.error('[DigitalProductService] Fetch error:', error);
      // Return cached data if available on error
      if (this._cache) {
        return this._cache;
      }
      throw error;
    }
  }

  /**
   * Enhance product with tier and type metadata
   * @param {object} product - Raw product
   * @returns {object}
   */
  _enhanceProduct(product) {
    if (!product) return null;

    const tags = Array.isArray(product.tags) ? product.tags : [];

    return {
      ...product,
      tier: getTierFromTags(tags),
      subscriptionType: getSubscriptionType(tags),
      isDigital: true,
    };
  }

  /**
   * Get products by category
   * @param {string} categoryId - Category ID
   * @returns {Promise<Array>}
   */
  async getProductsByCategory(categoryId) {
    const allProducts = await this.getDigitalProducts();

    if (categoryId === 'all' || !categoryId) {
      return allProducts;
    }

    const category = DIGITAL_CATEGORIES.find(c => c.id === categoryId);
    if (!category?.tags || category.tags.length === 0) {
      return allProducts;
    }

    // Filter products that have any of the category tags
    return allProducts.filter(product => {
      const productTags = (product.tags || []).map(t =>
        typeof t === 'string' ? t.toLowerCase().trim() : ''
      );
      return category.tags.some(tag => productTags.includes(tag.toLowerCase().trim()));
    });
  }

  /**
   * Get hero/featured products for carousel
   * @param {number} limit - Max products
   * @returns {Promise<Array>}
   */
  async getHeroProducts(limit = 5) {
    const allProducts = await this.getDigitalProducts();

    // Filter for trading courses (main hero content)
    const tradingCourses = allProducts.filter(product => {
      const type = product.subscriptionType;
      return type === 'trading-course' || type === 'course';
    });

    // Sort by tier (higher tiers first for visibility)
    const tierOrder = { tier3: 0, tier2: 1, tier1: 2, starter: 3, free: 4 };
    tradingCourses.sort((a, b) => {
      const aOrder = tierOrder[a.tier] ?? 5;
      const bOrder = tierOrder[b.tier] ?? 5;
      return aOrder - bOrder;
    });

    return tradingCourses.slice(0, limit);
  }

  /**
   * Get trending products based on analytics
   * @param {number} limit - Max products
   * @returns {Promise<Array>}
   */
  async getTrendingProducts(limit = 10) {
    try {
      const { data, error } = await supabase.rpc('get_popular_digital_products', {
        p_days: 7,
        p_limit: limit,
      });

      if (error) throw error;

      if (!data || data.length === 0) {
        // Fallback to first N products
        const allProducts = await this.getDigitalProducts();
        return allProducts.slice(0, limit);
      }

      // Get full product details for trending IDs
      const allProducts = await this.getDigitalProducts();
      const trendingIds = new Set(data.map(d => d.shopify_product_id));

      const trendingProducts = allProducts.filter(p => {
        const productId = shopifyService.fromGlobalId(p.id) || p.id;
        return trendingIds.has(productId) || trendingIds.has(p.id);
      });

      // If we found some, return them; otherwise fallback
      if (trendingProducts.length > 0) {
        return trendingProducts;
      }

      return allProducts.slice(0, limit);
    } catch (error) {
      console.error('[DigitalProductService] Trending error:', error);
      const allProducts = await this.getDigitalProducts();
      return allProducts.slice(0, limit);
    }
  }

  /**
   * Get recommended products for user based on tier
   * @param {string} userId - User ID
   * @param {number} limit - Max products
   * @returns {Promise<Array>}
   */
  async getRecommendedProducts(userId, limit = 6) {
    try {
      // Get user's tier
      const { data: userData } = await supabase
        .from('profiles')
        .select('course_tier, scanner_tier, chatbot_tier')
        .eq('id', userId)
        .single();

      const allProducts = await this.getDigitalProducts();

      // Get user's current tier
      const userTier = userData?.course_tier || 'free';
      const tierOrder = ['free', 'starter', 'tier1', 'tier2', 'tier3'];
      const userTierIndex = tierOrder.indexOf(userTier);

      // Recommend products at user's tier or one tier up
      const recommended = allProducts.filter(product => {
        const productTierIndex = tierOrder.indexOf(product.tier || 'free');
        // Show products at current tier or next tier up (upsell opportunity)
        return productTierIndex >= userTierIndex && productTierIndex <= userTierIndex + 1;
      });

      // Shuffle for variety
      const shuffled = [...recommended].sort(() => Math.random() - 0.5);
      return shuffled.slice(0, limit);
    } catch (error) {
      console.error('[DigitalProductService] Recommendation error:', error);
      const allProducts = await this.getDigitalProducts();
      return allProducts.slice(0, limit);
    }
  }

  // ═══════════════════════════════════════════════════════════
  // SEARCH
  // ═══════════════════════════════════════════════════════════

  /**
   * Search digital products
   * @param {string} query - Search query
   * @returns {Promise<Array>}
   */
  async searchProducts(query) {
    const allProducts = await this.getDigitalProducts();
    const queryLower = (query || '').toLowerCase().trim();

    if (!queryLower) {
      return allProducts;
    }

    return allProducts.filter(product => {
      const title = (product.title || '').toLowerCase();
      const description = (product.description || '').toLowerCase();
      const tags = (product.tags || []).join(' ').toLowerCase();

      return (
        title.includes(queryLower) ||
        description.includes(queryLower) ||
        tags.includes(queryLower)
      );
    });
  }

  // ═══════════════════════════════════════════════════════════
  // ANALYTICS TRACKING
  // ═══════════════════════════════════════════════════════════

  /**
   * Track product view
   * @param {string} productId - Shopify product ID
   * @param {string} productType - Product type
   * @param {string} tier - Product tier
   * @param {string} source - View source
   */
  async trackView(productId, productType, tier, source = 'shop_tab') {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      await supabase.rpc('track_digital_product_view', {
        p_user_id: user?.id || null,
        p_product_id: productId,
        p_product_type: productType || 'digital',
        p_tier: tier,
        p_source: source,
      });
    } catch (error) {
      // Silent fail for analytics - don't block UI
      console.warn('[DigitalProductService] Track view error:', error?.message);
    }
  }

  /**
   * Track product click/interaction
   * @param {string} productId - Shopify product ID
   * @param {string} clickType - Type of click
   * @param {string} tierRequired - Required tier
   * @param {string} userTier - User's current tier
   */
  async trackClick(productId, clickType, tierRequired, userTier) {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      await supabase.rpc('track_digital_product_click', {
        p_user_id: user?.id || null,
        p_product_id: productId,
        p_click_type: clickType,
        p_tier_required: tierRequired,
        p_user_tier: userTier,
      });
    } catch (error) {
      // Silent fail for analytics
      console.warn('[DigitalProductService] Track click error:', error?.message);
    }
  }

  // ═══════════════════════════════════════════════════════════
  // VALIDATION & HELPERS
  // ═══════════════════════════════════════════════════════════

  /**
   * Validate product data
   * @param {object} product - Product to validate
   * @returns {object} - { valid: boolean, error?: string }
   */
  validateProduct(product) {
    if (!product) return { valid: false, error: 'Product is null' };
    if (!product.id) return { valid: false, error: 'Product ID missing' };
    if (!product.title) return { valid: false, error: 'Product title missing' };

    return { valid: true };
  }

  /**
   * Build full product object safe for navigation
   * Ensures all required properties have fallbacks
   * @param {object} product - Raw product
   * @returns {object|null}
   */
  buildFullProduct(product) {
    if (!product) return null;

    // Extract price from variants or product
    const price = product.variants?.[0]?.price || product.price || 0;
    const compareAtPrice = product.variants?.[0]?.compareAtPrice || product.compareAtPrice || null;

    // Extract image URL
    const imageUrl = this._extractImageUrl(product);

    return {
      id: product.id || '',
      title: product.title || 'Sản phẩm',
      handle: product.handle || '',
      description: product.description || '',
      tags: Array.isArray(product.tags) ? product.tags : [],
      images: Array.isArray(product.images) ? product.images : [],
      variants: Array.isArray(product.variants) ? product.variants : [],
      featuredImage: product.featuredImage || null,
      image: imageUrl,
      price: typeof price === 'number' ? price : parseFloat(price) || 0,
      compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : null,
      available: product.available ?? true,
      tier: product.tier || getTierFromTags(product.tags || []),
      subscriptionType: product.subscriptionType || getSubscriptionType(product.tags || []),
      isDigital: true,
    };
  }

  /**
   * Extract image URL from product
   * @param {object} product - Product object
   * @returns {string}
   */
  _extractImageUrl(product) {
    const PLACEHOLDER = 'https://placehold.co/400x400/1a0b2e/FFBD59?text=Gemral';

    if (!product) return PLACEHOLDER;

    // Try multiple image sources
    const sources = [
      product.featuredImage?.url,
      product.featuredImage?.src,
      product.featuredImage,
      product.image?.url,
      product.image?.src,
      product.image,
      product.images?.[0]?.url,
      product.images?.[0]?.src,
      product.images?.[0],
    ];

    for (const source of sources) {
      if (source && typeof source === 'string' && source.startsWith('http')) {
        return source;
      }
    }

    return PLACEHOLDER;
  }

  // ═══════════════════════════════════════════════════════════
  // CACHE MANAGEMENT
  // ═══════════════════════════════════════════════════════════

  /**
   * Clear products cache
   */
  clearCache() {
    this._cache = null;
    this._cacheTime = 0;
  }

  /**
   * Check if cache is valid
   * @returns {boolean}
   */
  isCacheValid() {
    return this._cache && Date.now() - this._cacheTime < this._cacheDuration;
  }
}

export const digitalProductService = new DigitalProductService();
export default digitalProductService;
