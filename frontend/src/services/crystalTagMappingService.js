/**
 * Crystal Tag Mapping Service (Web)
 * Ported from gem-mobile/src/services/crystalTagMappingService.js
 *
 * Maps AI response context to ACTUAL Shopify product tags.
 * Tags must match EXACTLY with Shopify (Vietnamese with diacritics).
 */

import { ShopifyService } from './shopify';

const shopifyService = new ShopifyService();

// Context keywords -> Shopify tags mapping
export const CONTEXT_TO_SHOPIFY_TAGS = {
  // Crystal types
  'thach anh tim': ['Thach Anh Tim'],
  'amethyst': ['Thach Anh Tim'],
  'tim': ['Thach Anh Tim'],
  'thach anh hong': ['Thach Anh Hong'],
  'rose quartz': ['Thach Anh Hong'],
  'hong': ['Thach Anh Hong'],
  'thach anh vang': ['Thach Anh Vang'],
  'citrine': ['Thach Anh Vang'],
  'vang': ['Thach Anh Vang'],
  'thach anh trang': ['Thach Anh Trang'],
  'clear quartz': ['Thach Anh Trang'],
  'trang': ['Thach Anh Trang'],
  'thach anh khoi': ['Khoi Xam'],
  'smoky': ['Khoi Xam'],
  'hematite': ['Hematite'],
  'aquamarine': ['Aquamarine', 'Thach Anh Xanh'],

  // Product types
  'vong tay': ['Vong Tay'],
  'vong': ['Vong Tay'],
  'bracelet': ['Vong Tay'],
  'tru': ['Tru'],
  'cum': ['Cum'],
  'set da': ['Set', 'Special set'],
  'set': ['Set', 'Special set'],
  'bo da': ['Set', 'Special set'],
  'cay tai loc': ['Cay Tai Loc'],
  'cay': ['Cay Tai Loc'],
  'tinh dau': ['Tinh dau nuoc hoa Jerie'],
  'nuoc hoa': ['Tinh dau nuoc hoa Jerie'],

  // Purposes/Topics
  'tinh yeu': ['Thach Anh Hong'],
  'love': ['Thach Anh Hong'],
  'quan he': ['Thach Anh Hong'],
  'relationship': ['Thach Anh Hong'],
  'hon nhan': ['Thach Anh Hong', 'Set'],
  'tien bac': ['Thach Anh Vang', 'Cay Tai Loc'],
  'tai loc': ['Thach Anh Vang', 'Cay Tai Loc'],
  'money': ['Thach Anh Vang', 'Cay Tai Loc'],
  'wealth': ['Thach Anh Vang', 'Cay Tai Loc'],
  'thinh vuong': ['Thach Anh Vang', 'Special set'],
  'manifest': ['Special set', 'Thach Anh Vang'],
  'manifestation': ['Special set', 'Thach Anh Vang'],
  'hien hoa': ['Special set', 'Thach Anh Vang'],
  'thien': ['Thach Anh Tim', 'Thach Anh Trang'],
  'meditation': ['Thach Anh Tim', 'Thach Anh Trang'],
  'ngu ngon': ['Thach Anh Tim'],
  'sleep': ['Thach Anh Tim'],
  'calm': ['Thach Anh Tim'],
  'bao ve': ['Hematite', 'Khoi Xam'],
  'protection': ['Hematite', 'Khoi Xam'],
  'grounding': ['Khoi Xam', 'Hematite'],
  'su nghiep': ['Thach Anh Vang', 'Set'],
  'career': ['Thach Anh Vang', 'Set'],
  'cong viec': ['Thach Anh Vang'],
  'tam linh': ['Thach Anh Tim', 'Special set'],
  'spiritual': ['Thach Anh Tim', 'Special set'],
  'truc giac': ['Thach Anh Tim'],
  'intuition': ['Thach Anh Tim'],

  // Digital products
  'trading': ['Khoa hoc Trading', 'Scanner', 'GEM Chatbot'],
  'trade': ['Khoa hoc Trading', 'Scanner'],
  'giao dich': ['Khoa hoc Trading', 'Scanner'],
  'khoa hoc': ['Khoa hoc Trading', 'Khoa hoc', 'Ebook'],
  'course': ['Khoa hoc Trading', 'Khoa hoc'],
  'hoc': ['Khoa hoc Trading', 'Ebook'],
  'scanner': ['Scanner'],
  'chatbot': ['GEM Chatbot'],
  'gem pack': ['Gem Pack'],
  'gems': ['Gem Pack'],
  'ebook': ['Ebook'],

  // Special tags
  'bestseller': ['Bestseller'],
  'hot': ['Hot Product'],
  'special': ['Special set'],
  'aura': ['Aura'],
};

const CRYSTAL_TRIGGER_KEYWORDS = [
  'thach anh', 'da', 'crystal', 'quartz',
  'amethyst', 'citrine', 'hematite',
  'vong tay', 'tru', 'cum', 'set da',
  'nang luong', 'chakra', 'phong thuy',
  'chon da', 'goi y da', 'recommend',
  'tinh yeu', 'tien bac', 'bao ve', 'thien',
];

export const shouldShowCrystalRecommendations = (text) => {
  if (!text) return false;
  const lowerText = text.toLowerCase();
  return CRYSTAL_TRIGGER_KEYWORDS.some(keyword => lowerText.includes(keyword));
};

export const extractShopifyTags = (text) => {
  if (!text) return [];
  const lowerText = text.toLowerCase();
  const allTags = new Set();

  for (const [keyword, tags] of Object.entries(CONTEXT_TO_SHOPIFY_TAGS)) {
    if (lowerText.includes(keyword)) {
      tags.forEach(tag => allTags.add(tag));
    }
  }

  return Array.from(allTags);
};

export const getCrystalRecommendations = async (context, limit = 4) => {
  try {
    const tags = extractShopifyTags(context);

    if (tags.length === 0) {
      const products = await shopifyService.getProducts?.(limit);
      return products?.data || [];
    }

    // Use shopifyService to fetch by tags
    const result = await shopifyService.getProducts?.(limit);
    const allProducts = result?.data || [];

    // Filter by tags
    const tagSet = new Set(tags.map(t => t.toLowerCase()));
    const matched = allProducts.filter(p => {
      const productTags = Array.isArray(p.tags)
        ? p.tags
        : (p.tags || '').split(',').map(t => t.trim());
      return productTags.some(t => tagSet.has(t.toLowerCase()));
    });

    if (matched.length >= limit) return matched.slice(0, limit);

    // Supplement with remaining products
    const matchedIds = new Set(matched.map(p => p.id));
    const remaining = allProducts.filter(p => !matchedIds.has(p.id));
    return [...matched, ...remaining].slice(0, limit);
  } catch (error) {
    console.error('[CrystalTagMapping] Error:', error);
    return [];
  }
};

export const formatPrice = (amount) => {
  if (!amount) return 'Lien he';
  const num = parseFloat(amount);
  if (isNaN(num)) return 'Lien he';
  return new Intl.NumberFormat('vi-VN').format(num) + 'd';
};

export default {
  shouldShowCrystalRecommendations,
  extractShopifyTags,
  getCrystalRecommendations,
  formatPrice,
  CONTEXT_TO_SHOPIFY_TAGS,
};
