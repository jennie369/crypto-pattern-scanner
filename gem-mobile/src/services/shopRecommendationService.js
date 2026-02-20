/**
 * Shop Recommendation Service
 * Maps chat context to Shopify product tags
 * Uses ACTUAL tags from Shopify (tiếng Việt có dấu)
 */

import shopifyService from './shopifyService';

// Context to Tags Mapping (SHOPIFY ACTUAL TAGS!)
const CONTEXT_TO_TAGS = {
  // ========== CRYSTAL TYPES (Tiếng Việt) ==========
  'thạch anh tím': ['Thạch Anh Tím'],
  'amethyst': ['Thạch Anh Tím'],
  'thạch anh hồng': ['Thạch Anh Hồng'],
  'rose quartz': ['Thạch Anh Hồng'],
  'thạch anh vàng': ['Thạch Anh Vàng'],
  'citrine': ['Thạch Anh Vàng'],
  'thạch anh trắng': ['Thạch Anh Trắng'],
  'clear quartz': ['Thạch Anh Trắng'],
  'thạch anh khói': ['Khói Xám'],
  'smoky': ['Khói Xám'],
  'hematite': ['Hematite'],
  'aquamarine': ['Aquamarine', 'Thạch Anh Xanh'],

  // ========== PRODUCT TYPES ==========
  'vòng tay': ['Vòng Tay'],
  'trụ': ['Trụ'],
  'cụm': ['Cụm'],
  'set đá': ['Set', 'Special set'],
  'cây tài lộc': ['Cây Tài Lộc'],
  'tinh dầu': ['Tinh dầu nước hoa Jérie'],

  // ========== TOPICS/PURPOSES ==========
  'tình yêu': ['Thạch Anh Hồng', 'Set'],
  'love': ['Thạch Anh Hồng', 'Set'],
  'tiền bạc': ['Thạch Anh Vàng', 'Cây Tài Lộc'],
  'tài lộc': ['Thạch Anh Vàng', 'Cây Tài Lộc'],
  'money': ['Thạch Anh Vàng', 'Cây Tài Lộc'],
  'wealth': ['Thạch Anh Vàng', 'Cây Tài Lộc'],
  'manifest': ['Special set', 'Thạch Anh Vàng'],
  'manifestation': ['Special set', 'Thạch Anh Vàng'],
  'thiền': ['Thạch Anh Tím', 'Thạch Anh Trắng'],
  'meditation': ['Thạch Anh Tím', 'Thạch Anh Trắng'],
  'ngủ ngon': ['Thạch Anh Tím'],
  'sleep': ['Thạch Anh Tím'],
  'bảo vệ': ['Hematite', 'Khói Xám'],
  'protection': ['Hematite', 'Khói Xám'],
  'grounding': ['Khói Xám', 'Hematite'],
  'cân bằng': ['Thạch Anh Trắng', 'Set'],
  'năng lượng': ['Thạch Anh Tím', 'Thạch Anh Trắng'],
  'chakra': ['Set', 'Special set'],

  // ========== DIGITAL PRODUCTS ==========
  'trading': ['Khóa học Trading', 'Scanner', 'GEM Chatbot'],
  'trade': ['Khóa học Trading', 'Scanner', 'GEM Chatbot'],
  'khóa học': ['Khóa học Trading', 'Khóa học', 'Ebook'],
  'course': ['Khóa học Trading', 'Khóa học', 'Ebook'],
  'scanner': ['Scanner'],
  'chatbot': ['GEM Chatbot'],
  'gem pack': ['Gem Pack'],
  'gems': ['Gem Pack'],
  'ebook': ['Ebook'],

  // ========== SPECIFIC COURSES ==========
  'tư duy triệu phú': ['Tư Duy Triệu Phú', 'Manifest', 'Khóa học'],
  'triệu phú': ['Tư Duy Triệu Phú', 'Manifest', 'Khóa học'],
  'kích hoạt tần số tình yêu': ['Tình Yêu', 'Tần Số', 'Khóa học'],
  'tần số tình yêu': ['Tình Yêu', 'Tần Số', 'Khóa học'],
  'khai mở tần số': ['Tần Số Gốc', 'Khai Mở', 'Khóa học'],
  '7 ngày khai mở': ['Tần Số Gốc', 'Khai Mở', '7 Ngày', 'Khóa học'],
  'tần số gốc': ['Tần Số Gốc', 'Khai Mở', 'Khóa học'],

  // ========== TIER BUNDLES ==========
  'tier 1': ['Tier 1', 'Khóa học Trading'],
  'tier 2': ['Tier 2', 'Khóa học Trading'],
  'tier 3': ['Tier 3', 'Khóa học Trading'],
  'bundle': ['Khóa học Trading', 'Scanner', 'GEM Chatbot'],

  // ========== SPECIAL TAGS ==========
  'bestseller': ['Bestseller'],
  'hot': ['Hot Product'],
  'special': ['Special set'],
};

// Keywords that trigger product recommendations
const PRODUCT_TRIGGER_KEYWORDS = [
  // Crystals
  'thạch anh', 'đá', 'crystal', 'amethyst', 'citrine', 'quartz',
  'vòng tay', 'trụ', 'cụm', 'set đá',
  // Products
  'mua', 'purchase', 'buy', 'giá', 'price',
  'recommend', 'gợi ý', 'tư vấn',
  // Trading
  'trading', 'scanner', 'chatbot', 'khóa học', 'course',
  'tier', 'bundle', 'gem pack', 'triệu phú',
  // Purposes
  'tình yêu', 'tiền bạc', 'tài lộc', 'manifest', 'thiền',
];

/**
 * Check if we should show product recommendations
 */
export const shouldShowProductRecommendation = (text) => {
  if (!text) return false;
  const lowerText = text.toLowerCase();
  return PRODUCT_TRIGGER_KEYWORDS.some(keyword => lowerText.includes(keyword));
};

/**
 * Extract tags from context text
 */
export const extractTagsFromContext = (text) => {
  if (!text) return [];
  const lowerText = text.toLowerCase();
  const allTags = new Set();

  for (const [keyword, tags] of Object.entries(CONTEXT_TO_TAGS)) {
    if (lowerText.includes(keyword)) {
      tags.forEach(tag => allTags.add(tag));
    }
  }

  return Array.from(allTags);
};

/**
 * Get product recommendations based on context
 * Uses shopifyService.getProductsByTags()
 */
export const getProductRecommendations = async (context, limit = 4) => {
  try {
    // Extract tags from context
    const tags = extractTagsFromContext(context);

    console.log('[ShopRecommendation] Context:', context?.substring(0, 100));
    console.log('[ShopRecommendation] Extracted tags:', tags);

    if (tags.length === 0) {
      // Fallback to bestsellers
      console.log('[ShopRecommendation] No tags found, returning bestsellers');
      return await shopifyService.getBestsellers(limit);
    }

    // Use existing shopifyService function
    const products = await shopifyService.getProductsByTags(tags, limit, true);

    console.log('[ShopRecommendation] Found products:', products?.length || 0);

    return products || [];
  } catch (error) {
    console.error('[ShopRecommendation] Error:', error);
    return [];
  }
};

/**
 * Format product price for display
 */
export const formatProductPrice = (amount, currency = 'VND') => {
  if (!amount) return 'Liên hệ';

  const num = parseFloat(amount);
  if (isNaN(num)) return 'Liên hệ';

  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}tr`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(0)}K`;
  }
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(num);
};

/**
 * Get recommendations for specific purposes
 */
export const getRecommendationsForPurpose = async (purpose, limit = 4) => {
  const purposeTagMap = {
    love: ['Thạch Anh Hồng', 'Set'],
    wealth: ['Thạch Anh Vàng', 'Cây Tài Lộc'],
    meditation: ['Thạch Anh Tím', 'Thạch Anh Trắng'],
    protection: ['Hematite', 'Khói Xám'],
    balance: ['Thạch Anh Trắng', 'Set'],
    trading: ['Khóa học Trading', 'Scanner'],
  };

  const tags = purposeTagMap[purpose] || ['Bestseller'];
  return await shopifyService.getProductsByTags(tags, limit, true);
};

export default {
  shouldShowProductRecommendation,
  extractTagsFromContext,
  getProductRecommendations,
  formatProductPrice,
  getRecommendationsForPurpose,
  CONTEXT_TO_TAGS,
};
