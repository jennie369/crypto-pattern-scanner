/**
 * GEM Mobile - Smart Recommendation Engine
 * Day 3-4: Shopify Integration (FIXED)
 *
 * STRATEGY:
 * 1. Try REAL SHOPIFY DATA from shopifyService
 * 2. FALLBACK to local gemKnowledge.json if API fails
 * 3. NEVER show blank products!
 *
 * Priority:
 * 1. TIER Upgrade (if not TIER3) - Priority #1
 * 2. Courses (based on what user has/hasn't bought)
 * 3. Crystals (ALWAYS - aggressive marketing!)
 * 4. Affiliate (if money-related context)
 */

import TierService from './tierService';
import { shopifyService } from './shopifyService';
import gemKnowledge from '../data/gemKnowledge.json';

class RecommendationEngine {

  /**
   * Get smart recommendations based on user tier and context
   * @param {string} userId
   * @param {string} userTier - 'FREE' | 'TIER1' | 'TIER2' | 'TIER3'
   * @param {string} context - User query/conversation context
   * @returns {Promise<Object>}
   */
  static async getRecommendations(userId, userTier, context = '') {
    try {
      console.log(`[RecommendationEngine] Getting recommendations for tier: ${userTier}`);

      const recommendations = {
        tierUpgrade: null,
        courses: [],
        crystals: [],
        affiliate: false,
        // For UI display
        hasTierUpgrade: false,
        hasCourses: false,
        hasCrystals: false,
        hasAffiliate: false
      };

      // 1. TIER UPGRADE (always suggest if not TIER3)
      if (userTier !== 'TIER3' && userTier !== 'VIP' && userTier !== 'ADMIN') {
        const nextTier = TierService.getNextTierInfo(userTier);
        if (nextTier) {
          recommendations.tierUpgrade = nextTier;
          recommendations.hasTierUpgrade = true;
        }
      }

      // 2. Get products - Try Shopify API first, fallback to local knowledge
      const crystalTags = this._detectCrystalTags(context);

      try {
        // Get products from Shopify (cached)
        const allProducts = await shopifyService._getCachedProducts();

        if (allProducts && allProducts.length > 0) {
          console.log('[RecommendationEngine] Using Shopify API products:', allProducts.length);

          // Filter crystals by detected tags
          const crystalProducts = await shopifyService.getProductsByTags(
            crystalTags,
            3, // limit
            true, // fallback to random if no matches
            allProducts
          );

          recommendations.crystals = crystalProducts.map(p => this._formatShopifyProduct(p));
          recommendations.hasCrystals = recommendations.crystals.length > 0;

          // Get course products (tag: course, khóa học, etc.)
          const courseProducts = await shopifyService.getProductsByTags(
            ['course', 'khóa học', 'subscription', 'gói'],
            2,
            false, // don't fallback
            allProducts
          );

          recommendations.courses = courseProducts.map(p => this._formatShopifyProduct(p));
          recommendations.hasCourses = recommendations.courses.length > 0;
        } else {
          // FALLBACK: Use local gemKnowledge.json products
          console.log('[RecommendationEngine] 🔄 Shopify API empty, using LOCAL knowledge fallback');
          const localProducts = this._getLocalProducts(context, 3);
          recommendations.crystals = localProducts;
          recommendations.hasCrystals = localProducts.length > 0;
        }
      } catch (err) {
        console.error('[RecommendationEngine] Error fetching Shopify products:', err);
        // FALLBACK: Use local gemKnowledge.json products
        console.log('[RecommendationEngine] 🔄 Shopify API failed, using LOCAL knowledge fallback');
        const localProducts = this._getLocalProducts(context, 3);
        recommendations.crystals = localProducts;
        recommendations.hasCrystals = localProducts.length > 0;
      }

      // 3. AFFILIATE PROGRAM (if money-related context)
      recommendations.affiliate = this._shouldRecommendAffiliate(context);
      recommendations.hasAffiliate = recommendations.affiliate;

      console.log('[RecommendationEngine] Recommendations:', {
        hasTierUpgrade: recommendations.hasTierUpgrade,
        courses: recommendations.courses.length,
        crystals: recommendations.crystals.length,
        affiliate: recommendations.affiliate
      });

      return recommendations;

    } catch (error) {
      console.error('[RecommendationEngine] Error getting recommendations:', error);
      return {
        tierUpgrade: null,
        courses: [],
        crystals: [],
        affiliate: false,
        hasTierUpgrade: false,
        hasCourses: false,
        hasCrystals: false,
        hasAffiliate: false
      };
    }
  }

  /**
   * Format Shopify product for ProductCard component
   * @param {Object} product - Raw product from Shopify API
   * @returns {Object}
   */
  static _formatShopifyProduct(product) {
    if (!product) return null;

    // Get first variant price
    const price = product.variants?.[0]?.price || product.price || 0;
    const compareAtPrice = product.variants?.[0]?.compareAtPrice || product.compareAtPrice;

    // Get first image
    const imageUrl = product.images?.[0]?.src ||
                     product.featuredImage?.url ||
                     product.image?.src ||
                     product.imageUrl ||
                     null;

    // Determine product type from tags
    let type = 'crystal'; // default
    const tags = Array.isArray(product.tags)
      ? product.tags
      : (product.tags || '').split(',').map(t => t.trim());

    const tagsLower = tags.map(t => t.toLowerCase());
    if (tagsLower.some(t => t.includes('course') || t.includes('khóa'))) {
      type = 'course';
    } else if (tagsLower.some(t => t.includes('bundle') || t.includes('gói') || t.includes('tier'))) {
      type = 'bundle';
    }

    return {
      id: product.id,
      type: type,
      name: product.title,
      description: product.description?.substring(0, 100) || '',
      price: this._formatPrice(parseFloat(price)),
      originalPrice: compareAtPrice ? this._formatPrice(parseFloat(compareAtPrice)) : null,
      imageUrl: imageUrl,
      // For navigation
      shopify_product_id: product.id,
      handle: product.handle,
      // Raw data
      rawPrice: parseFloat(price),
      tags: tags,
    };
  }

  /**
   * FALLBACK: Get products from local gemKnowledge.json
   * Used when Shopify API fails or returns empty
   * @param {string} context - User query context
   * @param {number} limit - Max products to return
   * @returns {Array} - Formatted products for ProductCard
   */
  static _getLocalProducts(context, limit = 3) {
    try {
      const products = gemKnowledge.products || {};
      const productKeys = Object.keys(products);

      if (productKeys.length === 0) {
        console.warn('[RecommendationEngine] No products in gemKnowledge.json');
        return [];
      }

      // Match products based on context keywords
      const lower = (context || '').toLowerCase();
      let matchedKeys = [];

      // Keyword to product mapping
      const keywordMap = {
        'stress': ['thạch anh tím', 'thạch anh khói'],
        'lo lắng': ['thạch anh tím', 'thạch anh khói'],
        'tiền': ['thạch anh vàng', 'set tài lộc'],
        'giàu': ['thạch anh vàng', 'set tài lộc'],
        'money': ['thạch anh vàng', 'set tài lộc'],
        'tài lộc': ['thạch anh vàng', 'set tài lộc'],
        'tình yêu': ['thạch anh hồng', 'set tình yêu'],
        'love': ['thạch anh hồng', 'set tình yêu'],
        'quan hệ': ['thạch anh hồng', 'set tình yêu'],
        'focus': ['thạch anh tím', 'thạch anh trắng'],
        'tập trung': ['thạch anh tím', 'thạch anh trắng'],
        'bảo vệ': ['thạch anh khói'],
        'fomo': ['thạch anh khói'],
        'sự nghiệp': ['set sự nghiệp', 'thạch anh vàng'],
        'career': ['set sự nghiệp', 'thạch anh vàng'],
      };

      // Find matching products based on context
      for (const [keyword, productNames] of Object.entries(keywordMap)) {
        if (lower.includes(keyword)) {
          matchedKeys.push(...productNames);
        }
      }

      // Remove duplicates
      matchedKeys = [...new Set(matchedKeys)];

      // If no matches, return random products (default bestsellers)
      if (matchedKeys.length === 0) {
        matchedKeys = ['thạch anh tím', 'thạch anh vàng', 'thạch anh hồng'];
      }

      // Format products for ProductCard
      const formattedProducts = matchedKeys
        .slice(0, limit)
        .map(key => {
          const product = products[key];
          if (!product) return null;

          // Parse price from string (e.g., "350.000đ - 2.500.000đ")
          const priceMatch = product.price?.match(/[\d.,]+/);
          const rawPrice = priceMatch ? parseFloat(priceMatch[0].replace(/\./g, '').replace(',', '.')) * 1000 : 350000;

          return {
            id: `local_${key.replace(/\s+/g, '_')}`,
            type: key.includes('set') ? 'bundle' : 'crystal',
            name: product.name,
            description: product.description?.substring(0, 100) || '',
            price: this._formatPrice(rawPrice),
            imageUrl: null, // Local products don't have images
            shopify_product_id: null,
            handle: product.shopifyHandle,
            rawPrice: rawPrice,
            tags: product.tags || [],
            benefits: product.benefits || [],
            // Flag to indicate this is from local knowledge
            isLocalFallback: true,
          };
        })
        .filter(p => p !== null);

      console.log('[RecommendationEngine] 📦 Local products:', formattedProducts.map(p => p.name));
      return formattedProducts;

    } catch (error) {
      console.error('[RecommendationEngine] Error getting local products:', error);
      return [];
    }
  }

  /**
   * Detect crystal tags based on user context
   * Maps user intent to Shopify product tags
   * @param {string} context
   * @returns {string[]}
   */
  static _detectCrystalTags(context) {
    if (!context) {
      // Default: bestseller crystals
      return ['Bestseller', 'Hot Product', 'crystal'];
    }

    const lower = context.toLowerCase();

    // Mapping keywords → Shopify tags
    const tagMap = {
      // Stress & Anxiety → Amethyst (Thạch Anh Tím)
      'stress': ['Thạch Anh Tím', 'Amethyst', 'calm'],
      'lo lắng': ['Thạch Anh Tím', 'Amethyst', 'calm'],
      'căng thẳng': ['Thạch Anh Tím', 'Amethyst'],
      'anxiety': ['Amethyst', 'calm'],

      // Money & Abundance → Citrine (Thạch Anh Vàng)
      'tiền': ['Thạch Anh Vàng', 'Citrine', 'abundance'],
      'money': ['Citrine', 'abundance', 'Pyrite'],
      'giàu': ['Citrine', 'Pyrite', 'abundance'],
      'thịnh vượng': ['Citrine', 'abundance'],
      'tài lộc': ['Citrine', 'Pyrite'],

      // Love → Rose Quartz (Thạch Anh Hồng)
      'tình yêu': ['Thạch Anh Hồng', 'Rose Quartz', 'love'],
      'love': ['Rose Quartz', 'Thạch Anh Hồng'],
      'quan hệ': ['Rose Quartz', 'love'],

      // Protection → Black Tourmaline
      'bảo vệ': ['Black Tourmaline', 'Obsidian', 'protection'],
      'protection': ['Black Tourmaline', 'Obsidian'],
      'fomo': ['Black Tourmaline', 'grounding'],
      'revenge': ['Black Tourmaline', 'protection'],

      // Focus & Clarity → Clear Quartz
      'tập trung': ['Clear Quartz', 'Thạch Anh Trắng', 'focus'],
      'focus': ['Clear Quartz', 'focus'],
      'sáng suốt': ['Clear Quartz', 'clarity'],

      // Trading specific
      'trading': ['Bestseller', 'crystal', 'focus'],
      'giao dịch': ['Bestseller', 'crystal'],
      'chart': ['focus', 'clarity'],
    };

    // Check each keyword
    for (const [keyword, tags] of Object.entries(tagMap)) {
      if (lower.includes(keyword)) {
        console.log(`[RecommendationEngine] Detected crystal tags: ${keyword} → ${tags}`);
        return tags;
      }
    }

    // Default: bestseller crystals
    return ['Bestseller', 'Hot Product', 'crystal'];
  }

  /**
   * Should recommend affiliate program based on context
   * @private
   * @param {string} context
   * @returns {boolean}
   */
  static _shouldRecommendAffiliate(context) {
    if (!context) return false;

    const keywords = [
      'kiếm tiền', 'kiếm thêm', 'thu nhập thêm', 'thu nhập phụ',
      'thu nhập thụ động', 'làm thêm', 'công việc phụ',
      'affiliate', 'ctv', 'cộng tác viên', 'đối tác',
      'kinh doanh', 'bán hàng', 'giới thiệu', 'hoa hồng', 'commission',
      'passive income', 'side hustle', 'extra income', 'earn money',
      'make money', 'partnership', 'referral',
    ];

    const lower = context.toLowerCase();
    return keywords.some(keyword => lower.includes(keyword));
  }

  /**
   * Format price to Vietnamese format
   * @param {number} price
   * @returns {string}
   */
  static _formatPrice(price) {
    if (!price && price !== 0) return 'Liên hệ';

    // Format millions (triệu)
    if (price >= 1000000) {
      const millions = price / 1000000;
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

    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  }

  /**
   * Get contextual crystal recommendation message
   * @param {string} context
   * @returns {string}
   */
  static getCrystalRecommendationMessage(context) {
    const lower = (context || '').toLowerCase();

    if (lower.includes('stress') || lower.includes('lo lắng') || lower.includes('căng thẳng')) {
      return 'Thạch anh tím giúp giảm stress và tăng sự bình tĩnh khi trading:';
    }

    if (lower.includes('loss') || lower.includes('thua') || lower.includes('lỗ')) {
      return 'Đá phong thủy giúp bảo vệ năng lượng và phục hồi sau loss:';
    }

    if (lower.includes('fomo') || lower.includes('revenge')) {
      return 'Đá grounding giúp bạn giữ bình tĩnh, tránh FOMO:';
    }

    if (lower.includes('tiền') || lower.includes('money') || lower.includes('giàu')) {
      return 'Đá thu hút tài lộc và thịnh vượng:';
    }

    if (lower.includes('focus') || lower.includes('tập trung')) {
      return 'Đá tăng cường tập trung khi phân tích chart:';
    }

    return 'Đá phong thủy hỗ trợ trading của bạn:';
  }

  /**
   * Get tier upgrade recommendation message
   * @param {string} currentTier
   * @returns {string}
   */
  static getTierUpgradeMessage(currentTier) {
    const normalized = TierService.normalizeTier(currentTier);

    switch (normalized) {
      case 'FREE':
        return 'Nâng cấp lên PRO để có thêm câu hỏi và phân tích chuyên sâu:';
      case 'TIER1':
        return 'Nâng cấp lên PREMIUM để mở khóa nhiều tính năng hơn:';
      case 'TIER2':
        return 'Nâng cấp lên VIP để có trải nghiệm không giới hạn:';
      default:
        return 'Khám phá các gói nâng cấp:';
    }
  }

  /**
   * Get full recommendations with messages for UI
   */
  static async getRecommendationsWithMessages(userId, userTier, context = '') {
    const recommendations = await this.getRecommendations(userId, userTier, context);

    return {
      ...recommendations,
      messages: {
        tierUpgrade: this.getTierUpgradeMessage(userTier),
        crystals: this.getCrystalRecommendationMessage(context),
        courses: 'Khóa học được gợi ý cho bạn:',
        affiliate: 'Kiếm thu nhập thụ động với chương trình Affiliate:'
      }
    };
  }
}

export default RecommendationEngine;
