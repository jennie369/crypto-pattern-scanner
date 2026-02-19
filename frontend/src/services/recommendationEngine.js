/**
 * Recommendation Engine (Web)
 * Ported from gem-mobile/src/services/recommendationEngine.js
 *
 * Smart product recommendations based on user tier and context.
 * Strategy: Tier Upgrade > Courses > Crystals > Affiliate
 *
 * Adaptations:
 * - Uses web ShopifyService instead of mobile shopifyService
 * - Uses GEM_KNOWLEDGE from web data instead of gemKnowledge.json
 * - Inline tier normalization (no TierService dependency)
 */

import { ShopifyService } from './shopify';
import { GEM_KNOWLEDGE } from '../data/gemKnowledge';

const shopifyService = new ShopifyService();

// Inline tier normalization
const normalizeTier = (tier) => {
  if (!tier) return 'FREE';
  const upper = tier.toUpperCase();
  const map = {
    'STARTER': 'FREE',
    'PRO': 'TIER1',
    'PREMIUM': 'TIER2',
    'VIP': 'TIER3',
    'FREE': 'FREE',
    'TIER1': 'TIER1',
    'TIER2': 'TIER2',
    'TIER3': 'TIER3',
    'ADMIN': 'ADMIN',
  };
  return map[upper] || 'FREE';
};

// Tier upgrade info
const TIER_UPGRADE_INFO = {
  FREE: { name: 'PRO', price: '11tr', features: ['15 patterns', 'AI Signals', '15 chatbot queries/day'] },
  TIER1: { name: 'PREMIUM', price: '21tr', features: ['AI Prediction', 'Whale Tracker', '50 chatbot queries/day'] },
  TIER2: { name: 'VIP', price: '68tr', features: ['Private mentoring', 'VIP signals', 'Unlimited queries'] },
};

class RecommendationEngine {
  static async getRecommendations(userId, userTier, context = '') {
    try {
      const recommendations = {
        tierUpgrade: null,
        courses: [],
        crystals: [],
        affiliate: false,
        hasTierUpgrade: false,
        hasCourses: false,
        hasCrystals: false,
        hasAffiliate: false,
      };

      const normalized = normalizeTier(userTier);

      // 1. TIER UPGRADE
      if (normalized !== 'TIER3' && normalized !== 'ADMIN') {
        const nextTier = TIER_UPGRADE_INFO[normalized];
        if (nextTier) {
          recommendations.tierUpgrade = nextTier;
          recommendations.hasTierUpgrade = true;
        }
      }

      // 2. PRODUCTS from Shopify
      const crystalTags = this._detectCrystalTags(context);

      try {
        const result = await shopifyService.getProducts?.(20);
        const allProducts = result?.data || [];

        if (allProducts.length > 0) {
          // Filter crystals by detected tags
          const tagSet = new Set(crystalTags.map(t => t.toLowerCase()));
          const crystalProducts = allProducts.filter(p => {
            const productTags = Array.isArray(p.tags)
              ? p.tags
              : (p.tags || '').split(',').map(t => t.trim());
            return productTags.some(t => tagSet.has(t.toLowerCase()));
          }).slice(0, 3);

          recommendations.crystals = crystalProducts.map(p => this._formatShopifyProduct(p));

          // If no matches, take random 3
          if (recommendations.crystals.length === 0) {
            recommendations.crystals = allProducts.slice(0, 3).map(p => this._formatShopifyProduct(p));
          }

          recommendations.hasCrystals = recommendations.crystals.length > 0;

          // Course products
          const courseProducts = allProducts.filter(p => {
            const productTags = Array.isArray(p.tags)
              ? p.tags
              : (p.tags || '').split(',').map(t => t.trim());
            const tagsLower = productTags.map(t => t.toLowerCase());
            return tagsLower.some(t => t.includes('course') || t.includes('khoa'));
          }).slice(0, 2);

          recommendations.courses = courseProducts.map(p => this._formatShopifyProduct(p));
          recommendations.hasCourses = recommendations.courses.length > 0;
        } else {
          // FALLBACK: local knowledge
          const localProducts = this._getLocalProducts(context, 3);
          recommendations.crystals = localProducts;
          recommendations.hasCrystals = localProducts.length > 0;
        }
      } catch (err) {
        console.error('[RecommendationEngine] Error fetching Shopify products:', err);
        const localProducts = this._getLocalProducts(context, 3);
        recommendations.crystals = localProducts;
        recommendations.hasCrystals = localProducts.length > 0;
      }

      // 3. AFFILIATE
      recommendations.affiliate = this._shouldRecommendAffiliate(context);
      recommendations.hasAffiliate = recommendations.affiliate;

      return recommendations;
    } catch (error) {
      console.error('[RecommendationEngine] Error:', error);
      return {
        tierUpgrade: null,
        courses: [],
        crystals: [],
        affiliate: false,
        hasTierUpgrade: false,
        hasCourses: false,
        hasCrystals: false,
        hasAffiliate: false,
      };
    }
  }

  static _formatShopifyProduct(product) {
    if (!product) return null;

    const price = product.variants?.[0]?.price || product.price || 0;
    const compareAtPrice = product.variants?.[0]?.compareAtPrice || product.compareAtPrice;
    const imageUrl = product.images?.[0]?.src ||
                     product.featuredImage?.url ||
                     product.image?.src ||
                     product.imageUrl || null;

    const tags = Array.isArray(product.tags)
      ? product.tags
      : (product.tags || '').split(',').map(t => t.trim());

    const tagsLower = tags.map(t => t.toLowerCase());
    let type = 'crystal';
    if (tagsLower.some(t => t.includes('course') || t.includes('khoa'))) type = 'course';
    else if (tagsLower.some(t => t.includes('bundle') || t.includes('goi') || t.includes('tier'))) type = 'bundle';

    return {
      id: product.id,
      type,
      name: product.title,
      description: product.description?.substring(0, 100) || '',
      price: this._formatPrice(parseFloat(price)),
      originalPrice: compareAtPrice ? this._formatPrice(parseFloat(compareAtPrice)) : null,
      imageUrl,
      shopify_product_id: product.id,
      handle: product.handle,
      rawPrice: parseFloat(price),
      tags,
    };
  }

  static _getLocalProducts(context, limit = 3) {
    try {
      const lower = (context || '').toLowerCase();
      let matchedNames = [];

      const keywordMap = {
        'stress': ['Thach Anh Tim', 'Thach Anh Khoi'],
        'lo lang': ['Thach Anh Tim', 'Thach Anh Khoi'],
        'tien': ['Thach Anh Vang', 'Set Tai Loc'],
        'giau': ['Thach Anh Vang', 'Set Tai Loc'],
        'money': ['Thach Anh Vang', 'Set Tai Loc'],
        'tai loc': ['Thach Anh Vang', 'Set Tai Loc'],
        'tinh yeu': ['Thach Anh Hong', 'Set Tinh Yeu'],
        'love': ['Thach Anh Hong', 'Set Tinh Yeu'],
        'focus': ['Thach Anh Tim', 'Thach Anh Trang'],
        'bao ve': ['Thach Anh Khoi'],
        'fomo': ['Thach Anh Khoi'],
      };

      for (const [keyword, names] of Object.entries(keywordMap)) {
        if (lower.includes(keyword)) matchedNames.push(...names);
      }

      matchedNames = [...new Set(matchedNames)];
      if (matchedNames.length === 0) {
        matchedNames = ['Thach Anh Tim', 'Thach Anh Vang', 'Thach Anh Hong'];
      }

      return matchedNames.slice(0, limit).map(name => ({
        id: `local_${name.replace(/\s+/g, '_')}`,
        type: name.includes('Set') ? 'bundle' : 'crystal',
        name,
        description: '',
        price: 'Lien he',
        imageUrl: null,
        shopify_product_id: null,
        rawPrice: 0,
        tags: [],
        isLocalFallback: true,
      }));
    } catch (error) {
      console.error('[RecommendationEngine] Error getting local products:', error);
      return [];
    }
  }

  static _detectCrystalTags(context) {
    if (!context) return ['Bestseller', 'Hot Product', 'crystal'];

    const lower = context.toLowerCase();
    const tagMap = {
      'stress': ['Thach Anh Tim', 'Amethyst', 'calm'],
      'lo lang': ['Thach Anh Tim', 'Amethyst', 'calm'],
      'tien': ['Thach Anh Vang', 'Citrine', 'abundance'],
      'money': ['Citrine', 'abundance', 'Pyrite'],
      'tinh yeu': ['Thach Anh Hong', 'Rose Quartz', 'love'],
      'love': ['Rose Quartz', 'Thach Anh Hong'],
      'bao ve': ['Black Tourmaline', 'Obsidian', 'protection'],
      'fomo': ['Black Tourmaline', 'grounding'],
      'tap trung': ['Clear Quartz', 'Thach Anh Trang', 'focus'],
      'focus': ['Clear Quartz', 'focus'],
      'trading': ['Bestseller', 'crystal', 'focus'],
    };

    for (const [keyword, tags] of Object.entries(tagMap)) {
      if (lower.includes(keyword)) return tags;
    }

    return ['Bestseller', 'Hot Product', 'crystal'];
  }

  static _shouldRecommendAffiliate(context) {
    if (!context) return false;
    const keywords = [
      'kiem tien', 'kiem them', 'thu nhap them', 'thu nhap phu',
      'thu nhap thu dong', 'lam them', 'cong viec phu',
      'affiliate', 'ctv', 'cong tac vien', 'doi tac',
      'kinh doanh', 'ban hang', 'gioi thieu', 'hoa hong', 'commission',
      'passive income', 'side hustle', 'extra income',
    ];
    const lower = context.toLowerCase();
    return keywords.some(keyword => lower.includes(keyword));
  }

  static _formatPrice(price) {
    if (!price && price !== 0) return 'Lien he';
    if (price >= 1000000) {
      const millions = price / 1000000;
      return `${millions % 1 === 0 ? millions.toString() : millions.toFixed(1)} trieu`;
    }
    if (price >= 1000) {
      const thousands = price / 1000;
      return `${thousands % 1 === 0 ? thousands.toString() : thousands.toFixed(0)}K`;
    }
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  }

  static getCrystalRecommendationMessage(context) {
    const lower = (context || '').toLowerCase();
    if (lower.includes('stress') || lower.includes('lo lang')) {
      return 'Thach anh tim giup giam stress va tang su binh tinh khi trading:';
    }
    if (lower.includes('loss') || lower.includes('thua') || lower.includes('lo')) {
      return 'Da phong thuy giup bao ve nang luong va phuc hoi sau loss:';
    }
    if (lower.includes('fomo') || lower.includes('revenge')) {
      return 'Da grounding giup ban giu binh tinh, tranh FOMO:';
    }
    if (lower.includes('tien') || lower.includes('money') || lower.includes('giau')) {
      return 'Da thu hut tai loc va thinh vuong:';
    }
    if (lower.includes('focus') || lower.includes('tap trung')) {
      return 'Da tang cuong tap trung khi phan tich chart:';
    }
    return 'Da phong thuy ho tro trading cua ban:';
  }

  static getTierUpgradeMessage(currentTier) {
    const normalized = normalizeTier(currentTier);
    switch (normalized) {
      case 'FREE': return 'Nang cap len PRO de co them cau hoi va phan tich chuyen sau:';
      case 'TIER1': return 'Nang cap len PREMIUM de mo khoa nhieu tinh nang hon:';
      case 'TIER2': return 'Nang cap len VIP de co trai nghiem khong gioi han:';
      default: return 'Kham pha cac goi nang cap:';
    }
  }

  static async getRecommendationsWithMessages(userId, userTier, context = '') {
    const recommendations = await this.getRecommendations(userId, userTier, context);
    return {
      ...recommendations,
      messages: {
        tierUpgrade: this.getTierUpgradeMessage(userTier),
        crystals: this.getCrystalRecommendationMessage(context),
        courses: 'Khoa hoc duoc goi y cho ban:',
        affiliate: 'Kiem thu nhap thu dong voi chuong trinh Affiliate:',
      },
    };
  }
}

export default RecommendationEngine;
