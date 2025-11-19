// =====================================================
// SHOPIFY SERVICE - SUPABASE EDGE FUNCTIONS VERSION
// =====================================================
// Uses Supabase Edge Functions as proxy (NO CORS!)
// =====================================================

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export class ShopifyService {
  constructor() {
    this.headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'apikey': SUPABASE_ANON_KEY,
    };
  }

  /**
   * Helper: Call Supabase Edge Function
   */
  async callEdgeFunction(functionName, body) {
    const url = `${SUPABASE_URL}/functions/v1/${functionName}`;

    console.log(`🚀 Calling Edge Function: ${functionName}`);

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
  }

  /**
   * Fetch all products
   */
  async getProducts(limit = 50, syncToDb = true) {
    const result = await this.callEdgeFunction('shopify-products', {
      action: 'getProducts',
      limit,
      syncToDb,
    });

    return result.products || [];
  }

  /**
   * Get product by handle
   */
  async getProductByHandle(handle) {
    const result = await this.callEdgeFunction('shopify-products', {
      action: 'getProductByHandle',
      handle,
    });

    return result.product;
  }

  /**
   * Create cart
   */
  async createCart(lineItems, userId = null, sessionId = null) {
    const result = await this.callEdgeFunction('shopify-cart', {
      action: 'createCart',
      lineItems,
      userId,
      sessionId,
    });

    return result.cart;
  }

  /**
   * Add to existing cart
   */
  async addToCart(cartId, lines) {
    const result = await this.callEdgeFunction('shopify-cart', {
      action: 'addToCart',
      cartId,
      lines,
    });

    return result.cart;
  }

  /**
   * Update cart line quantities
   */
  async updateCart(cartId, lines) {
    const result = await this.callEdgeFunction('shopify-cart', {
      action: 'updateCart',
      cartId,
      lines,
    });

    return result.cart;
  }

  /**
   * Remove items from cart
   */
  async removeFromCart(cartId, lineIds) {
    const result = await this.callEdgeFunction('shopify-cart', {
      action: 'removeFromCart',
      cartId,
      lineIds,
    });

    return result.cart;
  }

  /**
   * Get cart by ID
   */
  async getCart(cartId) {
    const result = await this.callEdgeFunction('shopify-cart', {
      action: 'getCart',
      cartId,
    });

    return result.cart;
  }

  /**
   * Search products
   */
  async searchProducts(query) {
    const result = await this.callEdgeFunction('shopify-products', {
      action: 'search',
      query,
    });

    return result.products || [];
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
}

export const shopifyService = new ShopifyService();
