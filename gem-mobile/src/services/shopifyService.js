/**
 * Gemral - Shopify Service (Mobile)
 * Uses Supabase Edge Functions as proxy (NO CORS!)
 */

import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../utils/constants';

class ShopifyService {
  constructor() {
    this.headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'apikey': SUPABASE_ANON_KEY,
    };
  }

  /**
   * Helper: Convert to Shopify Global ID format
   * Shopify GraphQL API requires: gid://shopify/ProductVariant/{id}
   */
  toGlobalId(id, type = 'ProductVariant') {
    if (!id) return null;

    const idStr = String(id);

    // Already Global ID format
    if (idStr.startsWith('gid://shopify/')) {
      return idStr;
    }

    // Convert to Global ID
    return `gid://shopify/${type}/${idStr}`;
  }

  /**
   * Helper: Extract numeric ID from Global ID
   */
  fromGlobalId(globalId) {
    if (!globalId) return null;

    if (!globalId.startsWith('gid://shopify/')) {
      return globalId;
    }

    const parts = globalId.split('/');
    return parts[parts.length - 1];
  }

  /**
   * Helper: Call Supabase Edge Function
   */
  async callEdgeFunction(functionName, body) {
    const url = `${SUPABASE_URL}/functions/v1/${functionName}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Edge Function error (${response.status}): ${error}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Edge Function returned error');
      }

      return result;
    } catch (error) {
      console.error(`[Shopify] Edge function error:`, error);
      throw error;
    }
  }

  /**
   * Fetch all products
   * Also populates the cache for tag-based filtering functions
   */
  async getProducts(options = {}) {
    const { limit = 50, collection = null, syncToDb = false } = options;

    try {
      const result = await this.callEdgeFunction('shopify-products', {
        action: 'getProducts',
        limit,
        collection,
        syncToDb,
      });

      const products = result.products || [];

      // Populate cache if fetching all products (no collection filter)
      // This allows tag-based functions to use cached data
      if (!collection && products.length > 0) {
        this._productsCache = products;
        this._productsCacheTime = Date.now();
      }

      return products;
    } catch (error) {
      console.error('[Shopify] getProducts error:', error);
      return [];
    }
  }

  /**
   * Get product by handle
   */
  async getProductByHandle(handle) {
    try {
      const result = await this.callEdgeFunction('shopify-products', {
        action: 'getProductByHandle',
        handle,
      });

      return result.product;
    } catch (error) {
      console.error('[Shopify] getProductByHandle error:', error);
      return null;
    }
  }

  /**
   * Get product by ID
   */
  async getProductById(id) {
    try {
      const result = await this.callEdgeFunction('shopify-products', {
        action: 'getProductById',
        id,
      });

      return result.product;
    } catch (error) {
      console.error('[Shopify] getProductById error:', error);
      return null;
    }
  }

  /**
   * Get collections (categories)
   * NOTE: Edge Function doesn't support getCollections action
   * Using predefined categories instead
   */
  async getCollections() {
    // Edge Function only supports: getProducts, getProduct, getProductByHandle, search
    // Return predefined categories directly
    return [
      { id: 'all', title: 'Tất cả', handle: 'all' },
      { id: 'crystals', title: 'Crystals & Spiritual', handle: 'crystals' },
      { id: 'courses', title: 'Khóa học', handle: 'courses' },
      { id: 'subscriptions', title: 'Gói Premium', handle: 'subscriptions' },
      { id: 'merchandise', title: 'Merchandise', handle: 'merchandise' },
      { id: 'gift-cards', title: 'Gift Cards', handle: 'gift-cards' },
    ];
  }

  /**
   * Get products by collection handle
   */
  async getCollectionProducts(handle) {
    try {
      // If 'all', get all products
      if (handle === 'all' || !handle) {
        return this.getProducts({ limit: 50 });
      }

      // Otherwise filter by collection
      const result = await this.callEdgeFunction('shopify-products', {
        action: 'getProducts',
        collection: handle,
        limit: 50,
      });

      return result.products || [];
    } catch (error) {
      console.error('[Shopify] getCollectionProducts error:', error);
      return [];
    }
  }

  /**
   * Search products
   */
  async searchProducts(query) {
    try {
      const result = await this.callEdgeFunction('shopify-products', {
        action: 'search',
        query,
      });

      return result.products || [];
    } catch (error) {
      console.error('[Shopify] searchProducts error:', error);
      return [];
    }
  }

  /**
   * Create cart
   * Converts all merchandiseId to Global ID format before sending to Shopify
   */
  async createCart(lineItems, userId = null, sessionId = null) {
    try {
      // Convert all merchandiseId to Global ID format
      const convertedLineItems = lineItems.map(item => {
        const merchandiseId = this.toGlobalId(item.merchandiseId, 'ProductVariant');

        // Validate format
        if (!merchandiseId || !merchandiseId.startsWith('gid://shopify/ProductVariant/')) {
          console.error('[Shopify] Invalid merchandiseId format:', item.merchandiseId);
          throw new Error(`Invalid merchandise ID: ${item.merchandiseId}`);
        }

        return {
          merchandiseId,
          quantity: item.quantity,
        };
      });

      const result = await this.callEdgeFunction('shopify-cart', {
        action: 'createCart',
        lineItems: convertedLineItems,
        userId,
        sessionId,
      });

      return result.cart;
    } catch (error) {
      console.error('[Shopify] createCart error:', error);
      throw error;
    }
  }

  /**
   * Add to existing cart
   * Converts all merchandiseId to Global ID format
   */
  async addToCart(cartId, lines) {
    try {
      // Convert all merchandiseId to Global ID format
      const convertedLines = lines.map(line => ({
        merchandiseId: this.toGlobalId(line.merchandiseId, 'ProductVariant'),
        quantity: line.quantity,
      }));

      const result = await this.callEdgeFunction('shopify-cart', {
        action: 'addToCart',
        cartId,
        lines: convertedLines,
      });

      return result.cart;
    } catch (error) {
      console.error('[Shopify] addToCart error:', error);
      throw error;
    }
  }

  /**
   * Update cart line quantities
   */
  async updateCart(cartId, lines) {
    try {
      const result = await this.callEdgeFunction('shopify-cart', {
        action: 'updateCart',
        cartId,
        lines,
      });

      return result.cart;
    } catch (error) {
      console.error('[Shopify] updateCart error:', error);
      throw error;
    }
  }

  /**
   * Remove items from cart
   */
  async removeFromCart(cartId, lineIds) {
    try {
      const result = await this.callEdgeFunction('shopify-cart', {
        action: 'removeFromCart',
        cartId,
        lineIds,
      });

      return result.cart;
    } catch (error) {
      console.error('[Shopify] removeFromCart error:', error);
      throw error;
    }
  }

  /**
   * Get cart by ID
   */
  async getCart(cartId) {
    try {
      const result = await this.callEdgeFunction('shopify-cart', {
        action: 'getCart',
        cartId,
      });

      return result.cart;
    } catch (error) {
      console.error('[Shopify] getCart error:', error);
      return null;
    }
  }

  /**
   * Get checkout URL from cart
   */
  getCheckoutUrl(cart) {
    return cart?.checkoutUrl || null;
  }

  /**
   * Legacy methods for backwards compatibility
   */
  async createCheckout(lineItems) {
    return this.createCart(lineItems);
  }

  async addToCheckout(cartId, lineItems) {
    return this.addToCart(cartId, lineItems);
  }

  /**
   * Create checkout for a specific product handle with pre-filled email
   * Used for membership/tier upgrades
   * @param {string} productHandle - Shopify product handle (e.g., 'gem-chatbot-pro')
   * @param {string} email - User email to pre-fill in checkout
   * @returns {Promise<{checkoutUrl: string, cart: object}>}
   */
  async createCheckoutForProduct(productHandle, email = '') {
    try {
      // Get product by handle
      const product = await this.getProductByHandle(productHandle);
      if (!product) {
        console.warn('[Shopify] Product not found:', productHandle);
        return null;
      }

      // Get first variant ID
      const variantId = product.variants?.[0]?.id;
      if (!variantId) {
        console.warn('[Shopify] No variant found for product:', productHandle);
        return null;
      }

      // Create cart with the product
      const cart = await this.createCart([
        {
          merchandiseId: variantId,
          quantity: 1,
        },
      ]);

      if (!cart?.checkoutUrl) {
        console.warn('[Shopify] Failed to create cart');
        return null;
      }

      // Append email to checkout URL if provided
      let checkoutUrl = cart.checkoutUrl;
      if (email) {
        const separator = checkoutUrl.includes('?') ? '&' : '?';
        checkoutUrl = `${checkoutUrl}${separator}checkout[email]=${encodeURIComponent(email)}`;
      }

      return {
        checkoutUrl,
        cart,
      };
    } catch (error) {
      console.error('[Shopify] createCheckoutForProduct error:', error);
      return null;
    }
  }

  // =====================================================
  // TAG-BASED PRODUCT FILTERING
  // =====================================================

  /**
   * Cache for all products to avoid repeated API calls
   */
  _productsCache = null;
  _productsCacheTime = 0;
  _cacheValidityMs = 5 * 60 * 1000; // 5 minutes

  /**
   * Get all products with caching
   */
  async _getCachedProducts() {
    const now = Date.now();

    // Return cached data if valid
    if (this._productsCache && this._productsCache.length > 0 && (now - this._productsCacheTime) < this._cacheValidityMs) {
      return this._productsCache;
    }

    // Fetch fresh data
    const products = await this.getProducts({ limit: 100 });

    // Only update cache if we got products
    if (products && products.length > 0) {
      this._productsCache = products;
      this._productsCacheTime = now;
    }

    return products;
  }

  /**
   * Get products by tags (local filtering)
   * Tags from Shopify: Bestseller, Hot Product, Special set, Thạch Anh Hồng, etc.
   * @param {string|string[]} tags - Tag or array of tags to filter by
   * @param {number} limit - Maximum products to return
   * @param {boolean} fallbackToRandom - If true, return random products when no tag matches
   * @param {Array} productsOverride - Optional: use these products instead of fetching
   */
  async getProductsByTags(tags, limit = 10, fallbackToRandom = true, productsOverride = null) {
    try {
      const allProducts = productsOverride || await this._getCachedProducts();

      // Check if we have products
      if (!allProducts || allProducts.length === 0) {
        return [];
      }

      // Normalize tags to array, filter out null/undefined
      const tagList = Array.isArray(tags) ? tags : [tags];
      const normalizedTags = tagList
        .filter(t => t != null && typeof t === 'string')
        .map(t => t.toLowerCase().trim());

      // If no valid tags, return fallback or empty
      if (normalizedTags.length === 0) {
        if (fallbackToRandom && allProducts.length > 0) {
          const shuffled = [...allProducts].sort(() => Math.random() - 0.5);
          return shuffled.slice(0, limit);
        }
        return [];
      }

      // Filter products that have ANY of the specified tags
      const filtered = allProducts.filter(product => {
        // Handle tags as array
        if (product.tags && Array.isArray(product.tags)) {
          const productTags = product.tags.map(t => t.toLowerCase().trim());
          const hasMatch = normalizedTags.some(tag => productTags.some(pt => pt.includes(tag) || tag.includes(pt)));
          return hasMatch;
        }
        // Handle tags as comma-separated string
        if (product.tags && typeof product.tags === 'string') {
          const productTags = product.tags.split(',').map(t => t.toLowerCase().trim());
          const hasMatch = normalizedTags.some(tag => productTags.some(pt => pt.includes(tag) || tag.includes(pt)));
          return hasMatch;
        }
        return false;
      });

      // If no products found and fallback enabled, return random products
      if (filtered.length === 0 && fallbackToRandom) {
        const shuffled = [...allProducts].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, limit);
      }

      // Shuffle filtered results for variety
      const shuffled = [...filtered].sort(() => Math.random() - 0.5);
      return shuffled.slice(0, limit);

    } catch (error) {
      console.error('[Shopify] ❌ getProductsByTags error:', error);
      return [];
    }
  }

  /**
   * Get bestseller products (tag: Bestseller)
   * @param {number} limit - Max products to return
   * @param {Array} productsOverride - Optional: use these products instead of fetching
   */
  async getBestsellers(limit = 10, productsOverride = null) {
    return this.getProductsByTags('Bestseller', limit, true, productsOverride);
  }

  /**
   * Get hot products (tag: Hot Product)
   * @param {number} limit - Max products to return
   * @param {Array} productsOverride - Optional: use these products instead of fetching
   */
  async getHotProducts(limit = 10, productsOverride = null) {
    return this.getProductsByTags('Hot Product', limit, true, productsOverride);
  }

  /**
   * Get special sets (tag: Special set)
   * @param {number} limit - Max products to return
   * @param {Array} productsOverride - Optional: use these products instead of fetching
   */
  async getSpecialSets(limit = 10, productsOverride = null) {
    return this.getProductsByTags('Special set', limit, true, productsOverride);
  }

  /**
   * Get products by crystal type
   * Types: Thạch Anh Hồng, Thạch Anh Tím, Thạch Anh Vàng, Thạch Anh Trắng, etc.
   */
  async getProductsByCrystalType(type, limit = 10) {
    const typeMap = {
      'rose': 'Thạch Anh Hồng',
      'purple': 'Thạch Anh Tím',
      'yellow': 'Thạch Anh Vàng',
      'white': 'Thạch Anh Trắng',
      'aquamarine': 'Aquamarine',
      'hematite': 'Hematite',
      'citrine': 'Citrine',
      'amethyst': 'Amethyst',
    };

    const tag = typeMap[type.toLowerCase()] || type;
    return this.getProductsByTags(tag, limit);
  }

  /**
   * Get recommended products for current product
   * Based on shared tags, with fallback to random products
   * @param {Object} currentProduct - Current product to base recommendations on
   * @param {number} limit - Max products to return
   * @param {Array} productsOverride - Optional: use these products instead of fetching
   */
  async getRecommendedProducts(currentProduct, limit = 10, productsOverride = null) {
    try {
      const allProducts = productsOverride || await this._getCachedProducts();

      if (!allProducts || allProducts.length === 0) {
        return [];
      }

      const currentId = this.fromGlobalId(currentProduct?.id) || currentProduct?.id;

      // Get product tags (handle both array and string format)
      let productTags = currentProduct.tags || [];
      if (typeof productTags === 'string') {
        productTags = productTags.split(',').map(t => t.trim());
      }

      // Filter out current product
      const otherProducts = allProducts.filter(p => {
        const pId = this.fromGlobalId(p.id) || p.id;
        return pId !== currentId;
      });

      if (productTags.length === 0) {
        // No tags - return random products
        return otherProducts.sort(() => Math.random() - 0.5).slice(0, limit);
      }

      // Score products by number of shared tags
      const scored = otherProducts.map(product => {
        let pTags = product.tags || [];
        if (typeof pTags === 'string') {
          pTags = pTags.split(',').map(t => t.trim());
        }
        const pTagsLower = pTags.map(t => t.toLowerCase());
        const cTagsLower = productTags.map(t => t.toLowerCase());
        const sharedCount = pTagsLower.filter(t => cTagsLower.includes(t)).length;
        return { product, score: sharedCount };
      });

      const matched = scored.filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score);

      if (matched.length > 0) {
        return matched.slice(0, limit).map(item => item.product);
      }

      // Fallback: random products
      return otherProducts.sort(() => Math.random() - 0.5).slice(0, limit);

    } catch (error) {
      console.error('[Shopify] getRecommendedProducts error:', error);
      return [];
    }
  }

  /**
   * Get "Dành cho bạn" products
   * Returns random products different from current product
   * @param {Object} currentProduct - Current product to exclude
   * @param {number} limit - Max products to return
   * @param {Array} productsOverride - Optional: use these products instead of fetching
   */
  async getForYouProducts(currentProduct, limit = 10, productsOverride = null) {
    try {
      const allProducts = productsOverride || await this._getCachedProducts();

      if (!allProducts || allProducts.length === 0) {
        return [];
      }

      const currentId = this.fromGlobalId(currentProduct?.id) || currentProduct?.id;

      // Filter out current product and shuffle
      const otherProducts = allProducts
        .filter(p => {
          if (!currentId) return true;
          const pId = this.fromGlobalId(p.id) || p.id;
          return pId !== currentId;
        })
        .sort(() => Math.random() - 0.5);

      return otherProducts.slice(0, limit);

    } catch (error) {
      console.error('[Shopify] ❌ getForYouProducts error:', error);
      return [];
    }
  }

  /**
   * Get similar products
   * Returns random products different from current product
   * @param {Object} currentProduct - Current product to exclude
   * @param {number} limit - Max products to return
   * @param {Array} productsOverride - Optional: use these products instead of fetching
   */
  async getSimilarProducts(currentProduct, limit = 10, productsOverride = null) {
    try {
      const allProducts = productsOverride || await this._getCachedProducts();

      if (!allProducts || allProducts.length === 0) {
        return [];
      }

      const currentId = this.fromGlobalId(currentProduct?.id) || currentProduct?.id;

      // Filter out current product and shuffle
      const otherProducts = allProducts
        .filter(p => {
          if (!currentId) return true;
          const pId = this.fromGlobalId(p.id) || p.id;
          return pId !== currentId;
        })
        .sort(() => Math.random() - 0.5);

      return otherProducts.slice(0, limit);

    } catch (error) {
      console.error('[Shopify] ❌ getSimilarProducts error:', error);
      return [];
    }
  }

  /**
   * Clear products cache (call after data updates)
   */
  clearProductsCache() {
    this._productsCache = null;
    this._productsCacheTime = 0;
  }
}

export const shopifyService = new ShopifyService();
export default shopifyService;
