/**
 * Gemral - Digital Product Service
 * Handles fetching, filtering, and tracking digital products
 */

import { shopifyService } from './shopifyService';
import { supabase } from './supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  DIGITAL_PRODUCT_TAGS,
  DIGITAL_CATEGORIES,
  getTierFromTags,
  getSubscriptionType,
  isDigitalProduct,
} from '../utils/digitalProductsConfig';

// AsyncStorage key for persistent caching
const STORAGE_KEY_DIGITAL_PRODUCTS = '@digital_products_cache';
const PERSISTENT_CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

class DigitalProductService {
  constructor() {
    this._cache = null;
    this._cacheTime = 0;
    this._cacheDuration = 5 * 60 * 1000; // 5 minutes
    this._storageInitialized = false;
    this._prefetchedImages = new Set(); // Track prefetched images to avoid duplicates
  }

  /**
   * Prefetch product images for instant display
   * @param {Array} products - Products to prefetch images for
   */
  async _prefetchProductImages(products) {
    if (!products || products.length === 0) return;

    try {
      const { prefetchImages } = await import('../components/Common/OptimizedImage');

      // Collect all image URLs
      const imageUrls = [];
      products.forEach(product => {
        const imageUrl = this._extractImageUrl(product);
        if (imageUrl &&
            imageUrl.startsWith('http') &&
            !imageUrl.includes('placehold.co') &&
            !this._prefetchedImages.has(imageUrl)) {
          imageUrls.push(imageUrl);
          this._prefetchedImages.add(imageUrl);
        }
      });

      if (imageUrls.length > 0) {
        console.log('[DigitalProductService] Prefetching', imageUrls.length, 'images');
        await prefetchImages(imageUrls);
      }
    } catch (error) {
      // Silent fail - prefetching is optimization, not critical
      console.warn('[DigitalProductService] Prefetch error:', error?.message);
    }
  }

  // ═══════════════════════════════════════════════════════════
  // FETCH PRODUCTS
  // ═══════════════════════════════════════════════════════════

  /**
   * Initialize cache from AsyncStorage (call early for instant display)
   */
  async initializeFromStorage() {
    if (this._storageInitialized) return;
    this._storageInitialized = true;

    try {
      const cached = await AsyncStorage.getItem(STORAGE_KEY_DIGITAL_PRODUCTS);
      if (!cached) return;

      const { data, timestamp } = JSON.parse(cached);
      if (data && data.length > 0) {
        this._cache = data;
        // Mark as expired if older than 24h so we refresh in background
        this._cacheTime = Date.now() - timestamp > PERSISTENT_CACHE_EXPIRY ? 0 : Date.now();
        console.log('[DigitalProductService] Loaded from AsyncStorage:', data.length);
        // Prefetch images for instant display
        this._prefetchProductImages(data.slice(0, 20));
      }
    } catch (error) {
      console.warn('[DigitalProductService] Storage init error:', error?.message);
    }
  }

  /**
   * Save products to AsyncStorage for persistent caching
   */
  async _saveToStorage(products) {
    try {
      await AsyncStorage.setItem(STORAGE_KEY_DIGITAL_PRODUCTS, JSON.stringify({
        data: products,
        timestamp: Date.now(),
      }));
    } catch (error) {
      console.warn('[DigitalProductService] Storage save error:', error?.message);
    }
  }

  /**
   * Get all digital products
   * Uses shopifyService cache when available for faster loading
   * @param {boolean} forceRefresh - Force cache refresh
   * @returns {Promise<Array>}
   */
  async getDigitalProducts(forceRefresh = false) {
    // Check our own cache first
    if (!forceRefresh && this._cache && Date.now() - this._cacheTime < this._cacheDuration) {
      return this._cache;
    }

    // Try to load from AsyncStorage if no memory cache
    if (!this._cache) {
      await this.initializeFromStorage();
      // Return storage cache while we fetch fresh data in background
      if (this._cache && this._cache.length > 0) {
        // Start background refresh
        this._fetchAndCacheProducts();
        return this._cache;
      }
    }

    return this._fetchAndCacheProducts();
  }

  /**
   * Internal: Fetch products from API and update caches
   */
  async _fetchAndCacheProducts() {
    try {
      // Check if shopifyService already has cached products (from ShopScreen preload)
      // This avoids duplicate API calls
      const shopifyCache = shopifyService._productsCache;
      const shopifyCacheValid = shopifyCache &&
        shopifyCache.length > 0 &&
        Date.now() - (shopifyService._productsCacheTime || 0) < (shopifyService._cacheValidityMs || 300000);

      let products;

      if (shopifyCacheValid) {
        // Use shopify cache - filter for digital products locally
        console.log('[DigitalProductService] Using shopifyService cache');
        products = this._filterDigitalProducts(shopifyCache);
      } else {
        // Fetch products with digital tags
        products = await shopifyService.getProductsByTags(DIGITAL_PRODUCT_TAGS, 100, false);
      }

      // Enhance products with metadata
      const enhancedProducts = (products || []).map(product => this._enhanceProduct(product));

      // Update memory cache
      this._cache = enhancedProducts;
      this._cacheTime = Date.now();

      // Save to AsyncStorage for next app start
      this._saveToStorage(enhancedProducts);

      // Prefetch images for instant display (first 20 products for hero/carousel)
      this._prefetchProductImages(enhancedProducts.slice(0, 20));

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
   * Filter products to only include digital products
   * @param {Array} products - All products
   * @returns {Array}
   */
  _filterDigitalProducts(products) {
    if (!products || products.length === 0) return [];

    return products.filter(product => {
      // Check if product has any digital product tags
      const productTags = Array.isArray(product.tags)
        ? product.tags.map(t => typeof t === 'string' ? t.toLowerCase().trim() : '')
        : typeof product.tags === 'string'
          ? product.tags.split(',').map(t => t.toLowerCase().trim())
          : [];

      const digitalTagsLower = DIGITAL_PRODUCT_TAGS.map(t => t.toLowerCase().trim());

      return productTags.some(tag => digitalTagsLower.includes(tag));
    });
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

    // Filter products that have any of the category tags OR title contains category keywords
    return allProducts.filter(product => {
      const productTags = (product.tags || []).map(t =>
        typeof t === 'string' ? t.toLowerCase().trim() : ''
      );
      const productTitle = (product.title || product.name || '').toLowerCase();

      // Check tags match
      const tagMatch = category.tags.some(tag => productTags.includes(tag.toLowerCase().trim()));
      if (tagMatch) return true;

      // Fallback: check if product title contains category-specific keywords
      if (categoryId === 'trading') {
        // Must contain "trading" in title AND NOT contain mindset keywords
        const isTrading = productTitle.includes('trading');
        const isMindset = productTitle.includes('tư duy') || productTitle.includes('tần số') ||
                          productTitle.includes('tình yêu') || productTitle.includes('khai mở');
        return isTrading && !isMindset;
      }
      if (categoryId === 'mindset') {
        return productTitle.includes('tư duy') || productTitle.includes('tần số') ||
               productTitle.includes('tình yêu') || productTitle.includes('khai mở');
      }
      if (categoryId === 'chatbot') {
        return productTitle.includes('chatbot') || productTitle.includes('sư phụ ai');
      }
      if (categoryId === 'scanner') {
        return productTitle.includes('scanner') || productTitle.includes('quét nến');
      }
      if (categoryId === 'gems') {
        return productTitle.includes('gem pack') || productTitle.includes('gems');
      }

      return false;
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
      const { data: { session } } = await supabase.auth.getSession(); const user = session?.user;

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
      const { data: { session } } = await supabase.auth.getSession(); const user = session?.user;

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

  /**
   * Get cached products synchronously (for instant UI display)
   * Returns null if no cache available
   */
  getCachedProducts() {
    if (this.isCacheValid()) {
      return this._cache;
    }
    return null;
  }
}

export const digitalProductService = new DigitalProductService();
export default digitalProductService;
