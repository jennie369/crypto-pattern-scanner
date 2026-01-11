/**
 * SHOPIFY PRODUCT VARIANT IDs
 * Last Updated: 2026-01-09
 *
 * All Shopify product variant IDs for the GEM platform
 */

// ========================================
// TRADING COURSES
// ========================================
export const COURSE_VARIANTS = {
  STARTER: {
    variantId: '46448154050737',
    productHandle: 'gem-trading-course-tier-starter',
    sku: 'gem-course-starter',
    price: 299000,
    tier: 'STARTER',
  },
  TIER1: {
    variantId: '46351707898033',
    productHandle: 'gem-tier1',
    sku: 'gem-course-tier1',
    price: 11000000,
    tier: 'TIER1',
  },
  TIER2: {
    variantId: '46351719235761',
    productHandle: 'gem-tier2',
    sku: 'gem-course-tier2',
    price: 21000000,
    tier: 'TIER2',
  },
  TIER3: {
    variantId: '46351723331761',
    productHandle: 'gem-tier3',
    sku: 'gem-course-tier3',
    price: 68000000,
    tier: 'TIER3',
  },
};

// ========================================
// SCANNER DASHBOARD
// ========================================
export const SCANNER_VARIANTS = {
  PRO: {
    variantId: '46351752069297',
    productHandle: 'gem-scanner-pro',
    sku: 'gem-scanner-pro',
    price: 997000,
    tier: 'TIER1',
  },
  PREMIUM: {
    variantId: '46351759507633',
    productHandle: 'scanner-dashboard-premium',
    sku: 'gem-scanner-premium',
    price: 1997000,
    tier: 'TIER2',
  },
  VIP: {
    variantId: '46351760294065',
    productHandle: 'scanner-dashboard-vip',
    sku: 'gem-scanner-vip',
    price: 5997000,
    tier: 'TIER3',
  },
};

// ========================================
// YINYANG CHATBOT AI
// ========================================
export const CHATBOT_VARIANTS = {
  PRO: {
    variantId: '46351763701937',
    productHandle: 'yinyang-chatbot-ai-pro',
    sku: 'gem-chatbot-pro',
    price: 39000,
    tier: 'TIER1',
  },
  PREMIUM: {
    variantId: '46351771893937',
    productHandle: 'gem-chatbot-premium',
    sku: 'gem-chatbot-premium',
    price: 59000,
    tier: 'TIER2',
  },
  VIP: {
    variantId: '46421822832817',
    productHandle: 'yinyang-chatbot-ai-vip',
    sku: 'gem-chatbot-vip',
    price: 99000,
    tier: 'TIER3',
  },
};

// ========================================
// SPIRITUAL COURSES (Individual)
// ========================================
export const SPIRITUAL_COURSE_VARIANTS = {
  TAN_SO_GOC: {
    variantId: '46448176758961',
    productId: '8904651342001',
    productHandle: 'khoa-hoc-7-ngay-khai-mo-tan-so-goc',
    name: 'Khóa học 7 NGÀY KHAI MỞ TẦN SỐ GỐC',
    price: 1990000,
  },
  TINH_YEU: {
    variantId: '46448180166833',
    productId: '8904653111473',
    productHandle: 'khoa-hoc-kich-hoat-tan-so-tinh-yeu',
    name: 'Khóa học KÍCH HOẠT TẦN SỐ TÌNH YÊU',
    price: 399000,
  },
  TRIEU_PHU: {
    variantId: '46448192192689',
    productId: '8904656257201',
    productHandle: 'khoa-hoc-tai-tao-tu-duy-trieu-phu',
    name: 'Khóa học TÁI TẠO TƯ DUY TRIỆU PHÚ',
    price: 499000,
  },
};

// ========================================
// HELPER: Get variant by ID
// ========================================
export const ALL_VARIANTS = {
  // Trading Courses
  '46448154050737': { type: 'course', tier: 'STARTER', ...COURSE_VARIANTS.STARTER },
  '46351707898033': { type: 'course', tier: 'TIER1', ...COURSE_VARIANTS.TIER1 },
  '46351719235761': { type: 'course', tier: 'TIER2', ...COURSE_VARIANTS.TIER2 },
  '46351723331761': { type: 'course', tier: 'TIER3', ...COURSE_VARIANTS.TIER3 },

  // Scanner
  '46351752069297': { type: 'scanner', tier: 'PRO', ...SCANNER_VARIANTS.PRO },
  '46351759507633': { type: 'scanner', tier: 'PREMIUM', ...SCANNER_VARIANTS.PREMIUM },
  '46351760294065': { type: 'scanner', tier: 'VIP', ...SCANNER_VARIANTS.VIP },

  // Chatbot
  '46351763701937': { type: 'chatbot', tier: 'PRO', ...CHATBOT_VARIANTS.PRO },
  '46351771893937': { type: 'chatbot', tier: 'PREMIUM', ...CHATBOT_VARIANTS.PREMIUM },
  '46421822832817': { type: 'chatbot', tier: 'VIP', ...CHATBOT_VARIANTS.VIP },

  // Spiritual Courses
  '46448176758961': { type: 'spiritual_course', ...SPIRITUAL_COURSE_VARIANTS.TAN_SO_GOC },
  '46448180166833': { type: 'spiritual_course', ...SPIRITUAL_COURSE_VARIANTS.TINH_YEU },
  '46448192192689': { type: 'spiritual_course', ...SPIRITUAL_COURSE_VARIANTS.TRIEU_PHU },
};

/**
 * Get product info by variant ID
 * @param {string} variantId - Shopify variant ID
 * @returns {object|null} Product info or null
 */
export const getProductByVariantId = (variantId) => {
  return ALL_VARIANTS[variantId] || null;
};

/**
 * Get checkout URL for a variant
 * @param {string} variantId - Shopify variant ID
 * @param {string} email - Customer email (optional)
 * @returns {string} Checkout URL
 */
export const getCheckoutUrl = (variantId, email = '') => {
  const baseUrl = 'https://yinyangmasters.com/cart';
  const url = `${baseUrl}/${variantId}:1`;
  return email ? `${url}?checkout[email]=${encodeURIComponent(email)}` : url;
};

export default {
  COURSE_VARIANTS,
  SCANNER_VARIANTS,
  CHATBOT_VARIANTS,
  SPIRITUAL_COURSE_VARIANTS,
  ALL_VARIANTS,
  getProductByVariantId,
  getCheckoutUrl,
};
