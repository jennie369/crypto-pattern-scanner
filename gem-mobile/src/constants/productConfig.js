/**
 * CENTRALIZED PRODUCT CONFIGURATION
 * Single source of truth for all Shopify products
 * Last Updated: 2026-01-16
 *
 * NOTE: All checkout URLs use cart format: yinyangmasters.com/cart/{variantId}:1
 * This ensures proper variant selection and checkout flow
 */

// ========================================
// BUNDLE COURSES (Khóa học Trading + Scanner + Chatbot)
// ========================================
export const COURSE_BUNDLES = {
  STARTER: {
    variantId: '46448154050737',
    price: 299000,
    priceFormatted: '299.000đ',
    productUrl: 'https://yinyangmasters.com/products/gem-trading-course-tier-starter',
    cartUrl: 'https://yinyangmasters.com/cart/46448154050737:1',
    landingPage: 'https://yinyangmasters.com/pages/khoatradingtansodocquyen',
    name: 'TIER STARTER',
    description: 'Khóa học Trading cơ bản',
    includes: [
      'Basic Course Access',
      'Scanner 5 scans/ngày',
      'Chatbot 10 queries/ngày',
    ],
    tier: 'STARTER',
  },
  TIER1: {
    variantId: '46351707898033',
    price: 11000000,
    priceFormatted: '11.000.000đ',
    productUrl: 'https://yinyangmasters.com/products/gem-tier1',
    cartUrl: 'https://yinyangmasters.com/cart/46351707898033:1',
    landingPage: 'https://yinyangmasters.com/pages/khoatradingtansodocquyen',
    name: 'TIER 1 - PRO',
    description: 'Khóa học Trading nâng cao',
    includes: [
      'Full Course TIER 1',
      'Scanner PRO 12 tháng',
      'Chatbot PRO 12 tháng',
      'Cộng đồng Trading',
    ],
    tier: 'TIER1',
  },
  TIER2: {
    variantId: '46351719235761',
    price: 21000000,
    priceFormatted: '21.000.000đ',
    productUrl: 'https://yinyangmasters.com/products/gem-tier2',
    cartUrl: 'https://yinyangmasters.com/cart/46351719235761:1',
    landingPage: 'https://yinyangmasters.com/pages/khoatradingtansodocquyen',
    name: 'TIER 2 - PREMIUM',
    description: 'Khóa học Trading chuyên sâu',
    includes: [
      'Full Course TIER 1 + 2',
      'Scanner PREMIUM 12 tháng',
      'Chatbot PREMIUM 12 tháng',
      'Live Trading Sessions',
      'Công thức độc quyền',
    ],
    tier: 'TIER2',
  },
  TIER3: {
    variantId: '46351723331761',
    price: 68000000,
    priceFormatted: '68.000.000đ',
    productUrl: 'https://yinyangmasters.com/products/gem-tier3',
    cartUrl: 'https://yinyangmasters.com/cart/46351723331761:1',
    landingPage: 'https://yinyangmasters.com/pages/khoatradingtansodocquyen',
    name: 'TIER 3 - ELITE',
    description: 'Khóa học Trading Elite - VIP',
    includes: [
      'Full Course TIER 1 + 2 + 3',
      'Scanner VIP 24 tháng',
      'Chatbot PREMIUM 24 tháng',
      'Private Group với GM',
      'Chiến lược Elite độc quyền',
      'Hỗ trợ ưu tiên',
    ],
    tier: 'TIER3',
  },
};

// ========================================
// STANDALONE SCANNER SUBSCRIPTIONS
// ========================================
export const SCANNER_PRODUCTS = {
  PRO: {
    variantId: '46351752069297',
    price: 997000,
    priceFormatted: '997.000đ',
    period: 'tháng',
    productUrl: 'https://yinyangmasters.com/products/gem-scanner-pro',
    cartUrl: 'https://yinyangmasters.com/cart/46351752069297:1',
    landingPage: 'https://gemral.com',
    name: 'Scanner PRO',
    description: 'Quét 50 coins/ngày, alerts cơ bản',
    features: [
      '50 scans/ngày',
      'Basic alerts',
      'Pattern detection',
    ],
    tier: 'PRO',
  },
  PREMIUM: {
    variantId: '46351759507633',
    price: 1997000,
    priceFormatted: '1.997.000đ',
    period: 'tháng',
    productUrl: 'https://yinyangmasters.com/products/scanner-dashboard-premium',
    cartUrl: 'https://yinyangmasters.com/cart/46351759507633:1',
    landingPage: 'https://gemral.com',
    name: 'Scanner PREMIUM',
    description: 'Quét 200 coins/ngày, real-time alerts',
    features: [
      '200 scans/ngày',
      'Real-time alerts',
      'Advanced patterns',
      'Multi-timeframe',
    ],
    tier: 'PREMIUM',
  },
  VIP: {
    variantId: '46351760294065',
    price: 5997000,
    priceFormatted: '5.997.000đ',
    period: 'tháng',
    productUrl: 'https://yinyangmasters.com/products/scanner-dashboard-vip',
    cartUrl: 'https://yinyangmasters.com/cart/46351760294065:1',
    landingPage: 'https://gemral.com',
    name: 'Scanner VIP',
    description: 'Unlimited scans, AI predictions',
    features: [
      'Unlimited scans',
      'AI-powered predictions',
      'Priority alerts',
      'Custom watchlists',
      'API access',
    ],
    tier: 'VIP',
  },
};

// ========================================
// STANDALONE CHATBOT SUBSCRIPTIONS
// ========================================
export const CHATBOT_PRODUCTS = {
  PRO: {
    variantId: '46351763701937',
    price: 39000,
    priceFormatted: '39.000đ',
    period: 'tháng',
    productUrl: 'https://yinyangmasters.com/products/yinyang-chatbot-ai-pro',
    cartUrl: 'https://yinyangmasters.com/cart/46351763701937:1',
    landingPage: 'https://gemral.com',
    name: 'Chatbot PRO',
    description: '100 queries/ngày, basic analysis',
    features: [
      '100 queries/ngày',
      'Basic market analysis',
      'Hỏi đáp cơ bản',
    ],
    tier: 'PRO',
  },
  PREMIUM: {
    variantId: '46351771893937',
    price: 59000,
    priceFormatted: '59.000đ',
    period: 'tháng',
    productUrl: 'https://yinyangmasters.com/products/gem-chatbot-premium',
    cartUrl: 'https://yinyangmasters.com/cart/46351771893937:1',
    landingPage: 'https://gemral.com',
    name: 'Chatbot PREMIUM',
    description: '500 queries/ngày, advanced analysis',
    features: [
      '500 queries/ngày',
      'Advanced analysis',
      'Portfolio suggestions',
      'Priority response',
    ],
    tier: 'PREMIUM',
  },
  VIP: {
    variantId: '46421822832817',
    price: 99000,
    priceFormatted: '99.000đ',
    period: 'tháng',
    productUrl: 'https://yinyangmasters.com/products/yinyang-chatbot-ai-vip',
    cartUrl: 'https://yinyangmasters.com/cart/46421822832817:1',
    landingPage: 'https://gemral.com',
    name: 'Chatbot VIP',
    description: 'Unlimited queries, AI predictions',
    features: [
      'Unlimited queries',
      'AI predictions',
      'Real-time insights',
      'Custom alerts',
      'Priority support',
    ],
    tier: 'VIP',
  },
};

// ========================================
// MINDSET / SPIRITUAL COURSES
// ========================================
export const MINDSET_COURSES = {
  TAN_SO_GOC: {
    variantId: '46448176758961',
    productId: '8904651342001',
    price: 1990000,
    priceFormatted: '1.990.000đ',
    productUrl: 'https://yinyangmasters.com/products/khoa-hoc-7-ngay-khai-mo-tan-so-goc',
    cartUrl: 'https://yinyangmasters.com/cart/46448176758961:1',
    landingPage: 'https://yinyangmasters.com/pages/7ngaykhaimotansogoc',
    name: 'Khóa 7 NGÀY KHAI MỞ TẦN SỐ GỐC',
    description: 'Chữa lành gốc rễ, kết nối tâm thức',
    duration: '7 ngày',
  },
  TINH_YEU: {
    variantId: '46448180166833',
    productId: '8904653111473',
    price: 399000,
    priceFormatted: '399.000đ',
    productUrl: 'https://yinyangmasters.com/products/khoa-hoc-kich-hoat-tan-so-tinh-yeu',
    cartUrl: 'https://yinyangmasters.com/cart/46448180166833:1',
    landingPage: 'https://yinyangmasters.com/pages/khoahockichhoattansotinhyeu',
    name: 'Khóa KÍCH HOẠT TẦN SỐ TÌNH YÊU',
    description: 'Thu hút tình yêu, cân bằng năng lượng',
    duration: '49 ngày',
  },
  TRIEU_PHU: {
    variantId: '46448192192689',
    productId: '8904656257201',
    price: 499000,
    priceFormatted: '499.000đ',
    productUrl: 'https://yinyangmasters.com/products/khoa-hoc-tai-tao-tu-duy-trieu-phu',
    cartUrl: 'https://yinyangmasters.com/cart/46448192192689:1',
    landingPage: 'https://yinyangmasters.com/pages/khoahoctaitaotuduytrieuphu',
    name: 'Khóa TÁI TẠO TƯ DUY TRIỆU PHÚ',
    description: 'Mindset thịnh vượng, tư duy giàu có',
    duration: '21 ngày',
  },
};

// ========================================
// HELPER FUNCTIONS
// ========================================

/**
 * Get checkout URL for any product by variant ID
 * @param {string} variantId - Shopify variant ID
 * @param {string} email - Optional customer email for pre-fill
 * @returns {string} Checkout cart URL
 */
export const getCheckoutUrl = (variantId, email = '') => {
  const baseUrl = `https://yinyangmasters.com/cart/${variantId}:1`;
  return email ? `${baseUrl}?checkout[email]=${encodeURIComponent(email)}` : baseUrl;
};

/**
 * Get product info by variant ID
 * @param {string} variantId - Shopify variant ID
 * @returns {object|null} Product info or null
 */
export const getProductByVariantId = (variantId) => {
  // Search in all product categories
  const allProducts = {
    ...Object.fromEntries(Object.entries(COURSE_BUNDLES).map(([k, v]) => [v.variantId, { ...v, type: 'course_bundle' }])),
    ...Object.fromEntries(Object.entries(SCANNER_PRODUCTS).map(([k, v]) => [v.variantId, { ...v, type: 'scanner' }])),
    ...Object.fromEntries(Object.entries(CHATBOT_PRODUCTS).map(([k, v]) => [v.variantId, { ...v, type: 'chatbot' }])),
    ...Object.fromEntries(Object.entries(MINDSET_COURSES).map(([k, v]) => [v.variantId, { ...v, type: 'mindset_course' }])),
  };

  return allProducts[variantId] || null;
};

/**
 * Get upgrade options based on current tier and product type
 * @param {string} currentTier - User's current tier (FREE, STARTER, TIER1, TIER2, TIER3)
 * @param {string} productType - 'chatbot', 'scanner', or 'course'
 * @returns {array} Available upgrade options
 */
export const getUpgradeOptions = (currentTier = 'FREE', productType = 'course') => {
  const tierOrder = ['FREE', 'STARTER', 'TIER1', 'PRO', 'TIER2', 'PREMIUM', 'TIER3', 'VIP'];
  const currentIndex = tierOrder.indexOf(currentTier.toUpperCase());

  let products;
  switch (productType) {
    case 'chatbot':
      products = Object.values(CHATBOT_PRODUCTS);
      break;
    case 'scanner':
      products = Object.values(SCANNER_PRODUCTS);
      break;
    case 'course':
    default:
      products = Object.values(COURSE_BUNDLES);
      break;
  }

  // Filter to show only higher tiers
  return products.filter(p => {
    const productTierIndex = tierOrder.indexOf(p.tier);
    return productTierIndex > currentIndex;
  });
};

/**
 * Format price for display
 * @param {number} price - Price in VND
 * @returns {string} Formatted price string
 */
export const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
};

// ========================================
// ALL VARIANTS MAP (for quick lookup)
// ========================================
export const ALL_VARIANTS = {
  // Course Bundles
  '46448154050737': { ...COURSE_BUNDLES.STARTER, type: 'course_bundle' },
  '46351707898033': { ...COURSE_BUNDLES.TIER1, type: 'course_bundle' },
  '46351719235761': { ...COURSE_BUNDLES.TIER2, type: 'course_bundle' },
  '46351723331761': { ...COURSE_BUNDLES.TIER3, type: 'course_bundle' },

  // Scanner
  '46351752069297': { ...SCANNER_PRODUCTS.PRO, type: 'scanner' },
  '46351759507633': { ...SCANNER_PRODUCTS.PREMIUM, type: 'scanner' },
  '46351760294065': { ...SCANNER_PRODUCTS.VIP, type: 'scanner' },

  // Chatbot
  '46351763701937': { ...CHATBOT_PRODUCTS.PRO, type: 'chatbot' },
  '46351771893937': { ...CHATBOT_PRODUCTS.PREMIUM, type: 'chatbot' },
  '46421822832817': { ...CHATBOT_PRODUCTS.VIP, type: 'chatbot' },

  // Mindset Courses
  '46448176758961': { ...MINDSET_COURSES.TAN_SO_GOC, type: 'mindset_course' },
  '46448180166833': { ...MINDSET_COURSES.TINH_YEU, type: 'mindset_course' },
  '46448192192689': { ...MINDSET_COURSES.TRIEU_PHU, type: 'mindset_course' },
};

export default {
  COURSE_BUNDLES,
  SCANNER_PRODUCTS,
  CHATBOT_PRODUCTS,
  MINDSET_COURSES,
  ALL_VARIANTS,
  getCheckoutUrl,
  getProductByVariantId,
  getUpgradeOptions,
  formatPrice,
};
