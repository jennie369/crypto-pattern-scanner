/**
 * GEM Mobile - Shopify Product Service
 * Day 3-4: Shopify Integration
 *
 * CRITICAL: Chỉ fetch products ĐÃ INTEGRATE trong database
 * KHÔNG recommend products bên ngoài
 *
 * Product Types:
 * 1. CRYSTALS (YinYangMasters.com) - shopify_crystals table
 * 2. COURSES (GemCapitalHolding.com) - shopify_courses table
 * 3. TIER BUNDLES (Trading courses) - bundle_offers table
 */

import { supabase } from './supabase';

class ShopifyProductService {

  /**
   * Get crystal products by properties
   * @param {Array} properties - ['stress_relief', 'focus', 'abundance', 'protection', etc.]
   * @returns {Promise<Array>}
   */
  static async getCrystals(properties = []) {
    try {
      let query = supabase
        .from('shopify_crystals')
        .select('*')
        .eq('in_stock', true)
        .order('price', { ascending: true });

      // Filter by properties if provided using overlaps
      if (properties.length > 0) {
        query = query.overlaps('properties', properties);
      }

      const { data, error } = await query.limit(3);

      if (error) {
        console.error('[ShopifyProduct] getCrystals error:', error);
        throw error;
      }

      console.log(`[ShopifyProduct] Found ${data?.length || 0} crystals`);
      return data || [];

    } catch (error) {
      console.error('[ShopifyProduct] Error fetching crystals:', error);
      return [];
    }
  }

  /**
   * Get course products (excluding TIER bundles/trading)
   * @param {string|null} category - 'manifestation' | 'mindset' | null
   * @returns {Promise<Array>}
   */
  static async getCourses(category = null) {
    try {
      let query = supabase
        .from('shopify_courses')
        .select('*')
        .neq('category', 'trading') // Exclude TIER bundles
        .order('price', { ascending: true });

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query.limit(3);

      if (error) {
        console.error('[ShopifyProduct] getCourses error:', error);
        throw error;
      }

      console.log(`[ShopifyProduct] Found ${data?.length || 0} courses`);
      return data || [];

    } catch (error) {
      console.error('[ShopifyProduct] Error fetching courses:', error);
      return [];
    }
  }

  /**
   * Get TIER bundle offers
   * @param {Array} tiers - ['TIER1', 'TIER2', 'TIER3']
   * @returns {Promise<Array>}
   */
  static async getTierBundles(tiers = ['TIER1', 'TIER2', 'TIER3']) {
    try {
      const { data, error } = await supabase
        .from('bundle_offers')
        .select('*')
        .in('tier', tiers)
        .eq('is_active', true)
        .order('price', { ascending: true });

      if (error) {
        console.error('[ShopifyProduct] getTierBundles error:', error);
        throw error;
      }

      console.log(`[ShopifyProduct] Found ${data?.length || 0} bundles for tiers:`, tiers);
      return data || [];

    } catch (error) {
      console.error('[ShopifyProduct] Error fetching bundles:', error);
      return [];
    }
  }

  /**
   * Get user's purchased courses/products
   * @param {string} userId
   * @returns {Promise<Array>}
   */
  static async getUserPurchasedCourses(userId) {
    if (!userId) return [];

    try {
      const { data, error } = await supabase
        .from('user_purchases')
        .select('product_id, product_type, product_tier')
        .eq('user_id', userId)
        .eq('is_active', true);

      if (error) {
        console.error('[ShopifyProduct] getUserPurchasedCourses error:', error);
        throw error;
      }

      console.log(`[ShopifyProduct] User has ${data?.length || 0} purchases`);
      return data || [];

    } catch (error) {
      console.error('[ShopifyProduct] Error fetching user purchases:', error);
      return [];
    }
  }

  /**
   * Get single product by ID
   * @param {string} productId - Shopify product ID
   * @param {string} type - 'crystal' | 'course' | 'bundle'
   * @returns {Promise<Object|null>}
   */
  static async getProductById(productId, type) {
    try {
      let table;
      let idColumn;

      switch (type) {
        case 'crystal':
          table = 'shopify_crystals';
          idColumn = 'shopify_product_id';
          break;
        case 'course':
          table = 'shopify_courses';
          idColumn = 'shopify_product_id';
          break;
        case 'bundle':
          table = 'bundle_offers';
          idColumn = 'id';
          break;
        default:
          return null;
      }

      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq(idColumn, productId)
        .single();

      if (error) throw error;

      return data;

    } catch (error) {
      console.error('[ShopifyProduct] getProductById error:', error);
      return null;
    }
  }

  /**
   * Format product for ProductCard component
   * Standardize structure across different product types
   * @param {Object} product - Raw product from database
   * @param {string} type - 'crystal' | 'course' | 'bundle'
   * @returns {Object}
   */
  static formatProduct(product, type) {
    if (!product) return null;

    let name, description, imageUrl;

    switch (type) {
      case 'crystal':
        name = product.name_vi || product.name || 'Crystal';
        description = product.description || '';
        imageUrl = product.image_url;
        break;

      case 'course':
        name = product.title_vi || product.title || 'Course';
        description = product.description || '';
        imageUrl = product.thumbnail_url;
        break;

      case 'bundle':
        name = product.name || `TIER ${product.tier}`;
        description = product.description || '';
        imageUrl = product.image_url || null;
        break;

      default:
        name = product.name || 'Product';
        description = product.description || '';
        imageUrl = product.image_url;
    }

    return {
      id: product.shopify_product_id || product.id,
      type: type,
      tier: product.tier || null,
      name: name,
      description: description,
      price: this.formatPrice(product.price),
      originalPrice: product.original_price ? this.formatPrice(product.original_price) : null,
      savings: product.savings ? this.formatPrice(product.savings) : null,
      imageUrl: imageUrl,
      // For navigation to Shop tab
      shopify_product_id: product.shopify_product_id || product.id,
      purchase_url: product.purchase_url || product.product_url || product.course_url,
      // Raw price for calculations
      rawPrice: product.price,
      // Extra data
      properties: product.properties || [],
      category: product.category || null,
      chakra: product.chakra || null,
    };
  }

  /**
   * Format price to Vietnamese format
   * @param {number} price
   * @returns {string}
   */
  static formatPrice(price) {
    if (!price && price !== 0) return 'Liên hệ';

    // Format millions (triệu)
    if (price >= 1000000) {
      const millions = price / 1000000;
      // Show decimal only if needed
      const formatted = millions % 1 === 0
        ? millions.toString()
        : millions.toFixed(1);
      return `${formatted} triệu`;
    }

    // Format thousands (K)
    if (price >= 1000) {
      const thousands = price / 1000;
      const formatted = thousands % 1 === 0
        ? thousands.toString()
        : thousands.toFixed(0);
      return `${formatted}K`;
    }

    // Format with Vietnamese currency
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  }

  /**
   * Format price range (for crystals with min-max)
   * @param {number} minPrice
   * @param {number} maxPrice
   * @returns {string}
   */
  static formatPriceRange(minPrice, maxPrice) {
    if (!minPrice) return this.formatPrice(maxPrice);
    if (!maxPrice) return this.formatPrice(minPrice);
    if (minPrice === maxPrice) return this.formatPrice(minPrice);

    return `${this.formatPrice(minPrice)} - ${this.formatPrice(maxPrice)}`;
  }

  /**
   * Search products across all tables
   * @param {string} query - Search term
   * @returns {Promise<Array>}
   */
  static async searchProducts(query) {
    if (!query || query.length < 2) return [];

    try {
      const searchTerm = `%${query}%`;

      // Search crystals
      const { data: crystals } = await supabase
        .from('shopify_crystals')
        .select('*')
        .eq('in_stock', true)
        .or(`name_vi.ilike.${searchTerm},description.ilike.${searchTerm}`)
        .limit(3);

      // Search courses
      const { data: courses } = await supabase
        .from('shopify_courses')
        .select('*')
        .or(`title_vi.ilike.${searchTerm},description.ilike.${searchTerm}`)
        .limit(3);

      const results = [
        ...(crystals || []).map(c => this.formatProduct(c, 'crystal')),
        ...(courses || []).map(c => this.formatProduct(c, 'course')),
      ];

      return results;

    } catch (error) {
      console.error('[ShopifyProduct] searchProducts error:', error);
      return [];
    }
  }
}

export default ShopifyProductService;
