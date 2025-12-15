/**
 * Crystal Tag Mapping Service
 * Maps AI response context to ACTUAL Shopify product tags
 * CRITICAL: Tags must match EXACTLY with Shopify (tiếng Việt có dấu)
 */

import shopifyService from './shopifyService';

// Context keywords → Shopify tags mapping
// Tags must be EXACTLY as they appear in Shopify!
const CONTEXT_TO_SHOPIFY_TAGS = {
  // ========== CRYSTAL TYPES (Exact Shopify tags) ==========
  'thạch anh tím': ['Thạch Anh Tím'],
  'amethyst': ['Thạch Anh Tím'],
  'tím': ['Thạch Anh Tím'],

  'thạch anh hồng': ['Thạch Anh Hồng'],
  'rose quartz': ['Thạch Anh Hồng'],
  'hồng': ['Thạch Anh Hồng'],

  'thạch anh vàng': ['Thạch Anh Vàng'],
  'citrine': ['Thạch Anh Vàng'],
  'vàng': ['Thạch Anh Vàng'],

  'thạch anh trắng': ['Thạch Anh Trắng'],
  'clear quartz': ['Thạch Anh Trắng'],
  'trắng': ['Thạch Anh Trắng'],

  'thạch anh khói': ['Khói Xám'],
  'smoky': ['Khói Xám'],

  'hematite': ['Hematite'],
  'aquamarine': ['Aquamarine', 'Thạch Anh Xanh'],

  // ========== PRODUCT TYPES ==========
  'vòng tay': ['Vòng Tay'],
  'vòng': ['Vòng Tay'],
  'bracelet': ['Vòng Tay'],

  'trụ': ['Trụ'],
  'cụm': ['Cụm'],
  'quả cầu': ['Thạch Anh Tím', 'Thạch Anh Hồng'], // Quả cầu có ở tím và hồng

  'set đá': ['Set', 'Special set'],
  'set': ['Set', 'Special set'],
  'bộ đá': ['Set', 'Special set'],

  'cây tài lộc': ['Cây Tài Lộc'],
  'cây': ['Cây Tài Lộc'],

  'tinh dầu': ['Tinh dầu nước hoa Jérie'],
  'nước hoa': ['Tinh dầu nước hoa Jérie'],

  // ========== PURPOSES/TOPICS ==========
  'tình yêu': ['Thạch Anh Hồng'],
  'love': ['Thạch Anh Hồng'],
  'quan hệ': ['Thạch Anh Hồng'],
  'relationship': ['Thạch Anh Hồng'],
  'hôn nhân': ['Thạch Anh Hồng', 'Set'],

  'tiền bạc': ['Thạch Anh Vàng', 'Cây Tài Lộc'],
  'tài lộc': ['Thạch Anh Vàng', 'Cây Tài Lộc'],
  'money': ['Thạch Anh Vàng', 'Cây Tài Lộc'],
  'wealth': ['Thạch Anh Vàng', 'Cây Tài Lộc'],
  'thịnh vượng': ['Thạch Anh Vàng', 'Special set'],

  'manifest': ['Special set', 'Thạch Anh Vàng'],
  'manifestation': ['Special set', 'Thạch Anh Vàng'],
  'hiện hóa': ['Special set', 'Thạch Anh Vàng'],

  'thiền': ['Thạch Anh Tím', 'Thạch Anh Trắng'],
  'meditation': ['Thạch Anh Tím', 'Thạch Anh Trắng'],
  'ngủ ngon': ['Thạch Anh Tím'],
  'sleep': ['Thạch Anh Tím'],
  'calm': ['Thạch Anh Tím'],

  'bảo vệ': ['Hematite', 'Khói Xám'],
  'protection': ['Hematite', 'Khói Xám'],
  'grounding': ['Khói Xám', 'Hematite'],

  'sự nghiệp': ['Thạch Anh Vàng', 'Set'],
  'career': ['Thạch Anh Vàng', 'Set'],
  'công việc': ['Thạch Anh Vàng'],

  'tâm linh': ['Thạch Anh Tím', 'Special set'],
  'spiritual': ['Thạch Anh Tím', 'Special set'],
  'trực giác': ['Thạch Anh Tím'],
  'intuition': ['Thạch Anh Tím'],

  // ========== DIGITAL PRODUCTS ==========
  'trading': ['Khóa học Trading', 'Scanner', 'GEM Chatbot'],
  'trade': ['Khóa học Trading', 'Scanner'],
  'giao dịch': ['Khóa học Trading', 'Scanner'],

  'khóa học': ['Khóa học Trading', 'Khóa học', 'Ebook'],
  'course': ['Khóa học Trading', 'Khóa học'],
  'học': ['Khóa học Trading', 'Ebook'],

  'scanner': ['Scanner'],
  'chatbot': ['GEM Chatbot'],
  'gem pack': ['Gem Pack'],
  'gems': ['Gem Pack'],
  'ebook': ['Ebook'],

  // ========== SPECIAL TAGS ==========
  'bestseller': ['Bestseller'],
  'hot': ['Hot Product'],
  'special': ['Special set'],
  'aura': ['Aura'],
};

// Keywords that trigger crystal recommendations
const CRYSTAL_TRIGGER_KEYWORDS = [
  'thạch anh', 'đá', 'crystal', 'quartz',
  'amethyst', 'citrine', 'hematite',
  'vòng tay', 'trụ', 'cụm', 'set đá',
  'năng lượng', 'chakra', 'phong thủy',
  'chọn đá', 'gợi ý đá', 'recommend',
  'tình yêu', 'tiền bạc', 'bảo vệ', 'thiền',
];

/**
 * Check if text should trigger crystal recommendations
 * @param {string} text - AI response or message
 * @returns {boolean}
 */
export const shouldShowCrystalRecommendations = (text) => {
  if (!text) return false;
  const lowerText = text.toLowerCase();
  return CRYSTAL_TRIGGER_KEYWORDS.some(keyword => lowerText.includes(keyword));
};

/**
 * Extract Shopify tags from context text
 * @param {string} text - Context text (AI response + user message)
 * @returns {string[]} Array of Shopify tags
 */
export const extractShopifyTags = (text) => {
  if (!text) return [];

  const lowerText = text.toLowerCase();
  const allTags = new Set();

  for (const [keyword, tags] of Object.entries(CONTEXT_TO_SHOPIFY_TAGS)) {
    if (lowerText.includes(keyword)) {
      tags.forEach(tag => allTags.add(tag));
    }
  }

  const result = Array.from(allTags);
  console.log('[CrystalTagMapping] Extracted tags:', result);
  return result;
};

/**
 * Get crystal product recommendations based on context
 * Uses shopifyService.getProductsByTags() with ACTUAL Shopify tags
 * @param {string} context - AI response or combined context
 * @param {number} limit - Max products to return
 * @returns {Promise<Array>} Products from Shopify
 */
export const getCrystalRecommendations = async (context, limit = 4) => {
  try {
    // Extract tags from context
    const tags = extractShopifyTags(context);

    console.log('[CrystalTagMapping] Context preview:', context?.substring(0, 100));
    console.log('[CrystalTagMapping] Shopify tags:', tags);

    if (tags.length === 0) {
      // Fallback to bestsellers if no tags found
      console.log('[CrystalTagMapping] No tags, returning bestsellers');
      const bestsellers = await shopifyService.getBestsellers?.(limit);
      return bestsellers || [];
    }

    // Use shopifyService function that's already implemented
    const products = await shopifyService.getProductsByTags?.(tags, limit, true);

    console.log('[CrystalTagMapping] Found products:', products?.length || 0);

    // If not enough products, supplement with bestsellers
    if ((products?.length || 0) < limit) {
      const moreNeeded = limit - (products?.length || 0);
      const bestsellers = await shopifyService.getBestsellers?.(moreNeeded + 5) || [];
      const existingIds = new Set(products?.map(p => p.id) || []);

      const result = [...(products || [])];
      for (const p of bestsellers) {
        if (!existingIds.has(p.id) && result.length < limit) {
          result.push(p);
        }
      }
      return result;
    }

    return products || [];
  } catch (error) {
    console.error('[CrystalTagMapping] Error:', error);
    // Return empty instead of crashing
    return [];
  }
};

/**
 * Format price for display - always show full price with dot separators
 * @param {number} amount - Price amount
 * @returns {string} Formatted price (e.g., "3.690.000đ")
 */
export const formatPrice = (amount) => {
  if (!amount) return 'Liên hệ';

  const num = parseFloat(amount);
  if (isNaN(num)) return 'Liên hệ';

  // Always show full price with dot separators for readability
  return new Intl.NumberFormat('vi-VN').format(num) + 'đ';
};

export default {
  shouldShowCrystalRecommendations,
  extractShopifyTags,
  getCrystalRecommendations,
  formatPrice,
  CONTEXT_TO_SHOPIFY_TAGS,
};
