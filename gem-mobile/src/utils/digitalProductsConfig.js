/**
 * Gemral - Digital Products Configuration
 * Categories, tier matrix, tags, and settings for digital products section
 */

import {
  LayoutGrid,
  TrendingUp,
  Sparkles,
  Bot,
  BarChart3,
  Gem,
  GraduationCap,
  Crown,
} from 'lucide-react-native';
import { COLORS } from './tokens';

// ═══════════════════════════════════════════════════════════
// DIGITAL PRODUCT TAGS (from Shopify)
// ═══════════════════════════════════════════════════════════

export const DIGITAL_PRODUCT_TAGS = [
  // Trading Courses
  'Khoa hoc Trading',
  'trading-course',
  'Gem Trading',
  'tier-starter',
  'Tier 1',
  'Tier 2',
  'Tier 3',
  // Spiritual Courses
  'tan-so-goc',
  'khai-mo',
  'Gem Academy',
  'spiritual-course',
  // Chatbot
  'GEM Chatbot',
  'chatbot-pro',
  'chatbot-premium',
  'chatbot-vip',
  // Scanner
  'Scanner',
  'scanner-pro',
  'scanner-premium',
  'scanner-vip',
  // Gems
  'Gem Pack',
  'gems',
  'virtual-currency',
  // Digital generic
  'digital',
  'digital-product',
  'course',
  'subscription',
  'membership',
  'Ebook',
];

// ═══════════════════════════════════════════════════════════
// DIGITAL CATEGORIES
// ═══════════════════════════════════════════════════════════

export const DIGITAL_CATEGORIES = [
  {
    id: 'all',
    label: 'Tất cả',
    icon: LayoutGrid,
    tags: [],
  },
  {
    id: 'trading',
    label: 'Trading',
    icon: TrendingUp,
    tags: ['Khoa hoc Trading', 'trading-course', 'Gem Trading', 'tier-starter', 'Tier 1', 'Tier 2', 'Tier 3'],
  },
  {
    id: 'spiritual',
    label: 'Tâm Linh',
    icon: Sparkles,
    tags: ['tan-so-goc', 'khai-mo', 'Gem Academy', 'spiritual-course'],
  },
  {
    id: 'chatbot',
    label: 'Chatbot',
    icon: Bot,
    tags: ['GEM Chatbot', 'chatbot-pro', 'chatbot-premium', 'chatbot-vip'],
  },
  {
    id: 'scanner',
    label: 'Scanner',
    icon: BarChart3,
    tags: ['Scanner', 'scanner-pro', 'scanner-premium', 'scanner-vip'],
  },
  {
    id: 'gems',
    label: 'Gems',
    icon: Gem,
    tags: ['Gem Pack', 'gems', 'virtual-currency'],
  },
];

// ═══════════════════════════════════════════════════════════
// TIER CONFIGURATION
// ═══════════════════════════════════════════════════════════

export const TIER_HIERARCHY = ['free', 'starter', 'tier1', 'tier2', 'tier3'];

export const TIER_NAMES = {
  free: 'Miễn phí',
  starter: 'Starter',
  tier1: 'Tier 1',
  tier2: 'Tier 2',
  tier3: 'Tier 3',
  pro: 'Pro',
  premium: 'Premium',
  vip: 'VIP',
};

export const TIER_COLORS = {
  free: {
    bg: COLORS.tierFree,
    text: COLORS.textPrimary,
    border: 'rgba(255, 255, 255, 0.3)',
  },
  starter: {
    bg: 'rgba(255, 189, 89, 0.2)',
    text: COLORS.gold,
    border: COLORS.gold,
  },
  tier1: {
    bg: 'rgba(255, 189, 89, 0.2)',
    text: COLORS.gold,
    border: COLORS.gold,
  },
  pro: {
    bg: 'rgba(255, 189, 89, 0.2)',
    text: COLORS.gold,
    border: COLORS.gold,
  },
  tier2: {
    bg: 'rgba(59, 130, 246, 0.2)',
    text: COLORS.info,
    border: COLORS.info,
  },
  premium: {
    bg: 'rgba(59, 130, 246, 0.2)',
    text: COLORS.info,
    border: COLORS.info,
  },
  tier3: {
    bg: 'rgba(156, 6, 18, 0.3)',
    text: COLORS.burgundyLight,
    border: COLORS.burgundy,
  },
  vip: {
    bg: 'rgba(156, 6, 18, 0.3)',
    text: COLORS.burgundyLight,
    border: COLORS.burgundy,
  },
};

// ═══════════════════════════════════════════════════════════
// TIER ACCESS MATRIX
// ═══════════════════════════════════════════════════════════

export const TIER_ACCESS_MATRIX = {
  free: ['free-course', 'Ebook'],
  starter: ['free-course', 'Ebook', 'tier-starter'],
  tier1: ['free-course', 'Ebook', 'tier-starter', 'Tier 1'],
  tier2: ['free-course', 'Ebook', 'tier-starter', 'Tier 1', 'Tier 2'],
  tier3: ['free-course', 'Ebook', 'tier-starter', 'Tier 1', 'Tier 2', 'Tier 3'],
};

// ═══════════════════════════════════════════════════════════
// TIER UPGRADE PATHS
// ═══════════════════════════════════════════════════════════

export const TIER_UPGRADE_PATH = {
  free: ['starter', 'tier1', 'tier2', 'tier3'],
  starter: ['tier1', 'tier2', 'tier3'],
  tier1: ['tier2', 'tier3'],
  tier2: ['tier3'],
  tier3: [], // Highest tier
};

// ═══════════════════════════════════════════════════════════
// HERO CAROUSEL CONFIG
// ═══════════════════════════════════════════════════════════

export const HERO_CONFIG = {
  autoScrollInterval: 5000, // 5 seconds
  bannerHeight: 200,
  aspectRatio: 16 / 9,
  pauseOnInteraction: 3000, // Resume after 3 seconds
};

// Hero slides data (for Trading Course promotion)
export const HERO_SLIDES = [
  {
    id: 'trading-starter',
    title: 'Khóa Học Trading Starter',
    subtitle: 'Bắt đầu hành trình trading chuyên nghiệp',
    tier: 'starter',
    price: 299000,
    tags: ['tier-starter'],
    image: 'https://yinyangmasters.com/cdn/shop/files/trading-starter-banner.jpg',
    backgroundColor: COLORS.gold,
  },
  {
    id: 'trading-tier1',
    title: 'Khóa Học Trading Tier 1',
    subtitle: 'Nền tảng vững chắc cho trader',
    tier: 'tier1',
    price: 11000000,
    tags: ['Tier 1'],
    image: 'https://yinyangmasters.com/cdn/shop/files/trading-tier1-banner.jpg',
    backgroundColor: COLORS.gold,
  },
  {
    id: 'trading-tier2',
    title: 'Khóa Học Trading Tier 2',
    subtitle: 'Chiến lược nâng cao - Best Value',
    tier: 'tier2',
    price: 21000000,
    tags: ['Tier 2'],
    badge: 'BEST VALUE',
    image: 'https://yinyangmasters.com/cdn/shop/files/trading-tier2-banner.jpg',
    backgroundColor: COLORS.info,
  },
  {
    id: 'trading-tier3',
    title: 'Khóa Học Trading Tier 3',
    subtitle: 'VIP - 1:1 Coaching & Lifetime Access',
    tier: 'tier3',
    price: 68000000,
    tags: ['Tier 3'],
    badge: 'VIP',
    image: 'https://yinyangmasters.com/cdn/shop/files/trading-tier3-banner.jpg',
    backgroundColor: COLORS.burgundy,
  },
];

// ═══════════════════════════════════════════════════════════
// TOOLTIP CONFIGURATION
// ═══════════════════════════════════════════════════════════

export const TOOLTIP_STORAGE_KEY = '@gem_digital_tooltips_shown';

export const TOOLTIP_CONTENT = {
  'hero-carousel': {
    id: 'hero-carousel',
    title: 'Khóa học Trading',
    content: 'Vuốt trái/phải để xem các gói khóa học. Nhấn vào slide để xem chi tiết.',
    position: 'bottom',
    showOnce: true,
  },
  'category-pills': {
    id: 'category-pills',
    title: 'Bộ lọc danh mục',
    content: 'Nhấn vào các nút để lọc sản phẩm theo danh mục: Trading, Tâm Linh, Chatbot, Scanner, Gems.',
    position: 'bottom',
    showOnce: true,
  },
  'tier-badge': {
    id: 'tier-badge',
    title: 'Cấp độ sản phẩm',
    content: 'STARTER: Cơ bản\nTIER 1: Nền tảng\nTIER 2: Nâng cao (Best Value)\nTIER 3: Cao cấp nhất',
    position: 'top',
    showOnce: true,
  },
  'price-discount': {
    id: 'price-discount',
    title: 'Giá ưu đãi',
    content: 'Giá đã được giảm so với giá gốc. Nhấn để xem chi tiết và mua ngay!',
    position: 'top',
    showOnce: true,
  },
  'add-to-cart': {
    id: 'add-to-cart',
    title: 'Thêm vào giỏ',
    content: 'Nhấn nút này để thêm sản phẩm vào giỏ hàng. Bạn có thể thanh toán sau.',
    position: 'left',
    showOnce: true,
  },
  'lock-overlay': {
    id: 'lock-overlay',
    title: 'Nội dung bị khóa',
    content: 'Sản phẩm này yêu cầu tier cao hơn. Nâng cấp để mở khóa.',
    position: 'center',
    showOnce: true,
  },
};

// ═══════════════════════════════════════════════════════════
// PRICE CONFIGURATION
// ═══════════════════════════════════════════════════════════

export const PRICE_CONFIG = {
  currency: 'VND',
  locale: 'vi-VN',
  showDiscountBadge: true,
  discountBadgeThreshold: 10, // Only show if >= 10%
};

// ═══════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════

/**
 * Get tier from product tags
 * @param {string[]} tags - Product tags
 * @returns {string|null} - Tier identifier
 */
export const getTierFromTags = (tags = []) => {
  if (!Array.isArray(tags)) return null;

  const normalizedTags = tags.map(t => (typeof t === 'string' ? t.toLowerCase().trim() : ''));

  // Check for specific tier tags
  if (normalizedTags.some(t => t === 'tier 3' || t === 'tier3' || t === 'vip')) return 'tier3';
  if (normalizedTags.some(t => t === 'tier 2' || t === 'tier2' || t === 'premium')) return 'tier2';
  if (normalizedTags.some(t => t === 'tier 1' || t === 'tier1' || t === 'pro')) return 'tier1';
  if (normalizedTags.some(t => t === 'tier-starter' || t === 'starter')) return 'starter';
  if (normalizedTags.some(t => t === 'free' || t === 'free-course' || t === 'ebook')) return 'free';

  return null;
};

/**
 * Get subscription/product type from tags
 * @param {string[]} tags - Product tags
 * @returns {string} - Product type
 */
export const getSubscriptionType = (tags = []) => {
  if (!Array.isArray(tags)) return 'course';

  const normalizedTags = tags.map(t => (typeof t === 'string' ? t.toLowerCase().trim() : ''));

  if (normalizedTags.some(t => t.includes('chatbot'))) return 'chatbot';
  if (normalizedTags.some(t => t.includes('scanner'))) return 'scanner';
  if (normalizedTags.some(t => t.includes('gem pack') || t === 'gems' || t.includes('virtual-currency'))) return 'gems';
  if (normalizedTags.some(t => t.includes('spiritual') || t.includes('tan-so') || t.includes('khai-mo'))) return 'spiritual-course';
  if (normalizedTags.some(t => t.includes('trading') || t.includes('tier'))) return 'trading-course';
  if (normalizedTags.some(t => t.includes('course'))) return 'course';

  return 'digital';
};

/**
 * Check if user can access product based on tier
 * @param {string} userTier - User's current tier
 * @param {string} productTier - Required tier for product
 * @param {string} productType - Type of product
 * @returns {boolean}
 */
export const canAccessProduct = (userTier, productTier, productType) => {
  // Gems are always accessible (anyone can purchase)
  if (productType === 'gems') return true;

  // Chatbot and Scanner subscriptions are always purchasable
  if (productType === 'chatbot' || productType === 'scanner') return true;

  // For courses, check tier hierarchy
  const userTierIndex = TIER_HIERARCHY.indexOf(userTier || 'free');
  const productTierIndex = TIER_HIERARCHY.indexOf(productTier || 'free');

  return userTierIndex >= productTierIndex;
};

/**
 * Get upgrade suggestion for user
 * @param {string} userTier - User's current tier
 * @param {string} requiredTier - Required tier
 * @returns {object}
 */
export const getUpgradeSuggestion = (userTier, requiredTier) => {
  const tierName = TIER_NAMES[requiredTier] || requiredTier;

  return {
    message: `Nâng cấp lên ${tierName} để mở khóa nội dung này`,
    requiredTier,
    currentTier: userTier,
    availableUpgrades: TIER_UPGRADE_PATH[userTier || 'free'] || [],
  };
};

/**
 * Get category by ID
 * @param {string} categoryId - Category ID
 * @returns {object|null}
 */
export const getCategoryById = (categoryId) => {
  return DIGITAL_CATEGORIES.find(c => c.id === categoryId) || null;
};

/**
 * Get all digital product tags combined
 * @returns {string[]}
 */
export const getAllDigitalProductTags = () => {
  return DIGITAL_PRODUCT_TAGS;
};

/**
 * Check if product is a digital product
 * @param {object} product - Product object
 * @returns {boolean}
 */
export const isDigitalProduct = (product) => {
  if (!product?.tags) return false;

  const productTags = Array.isArray(product.tags)
    ? product.tags.map(t => (typeof t === 'string' ? t.toLowerCase().trim() : ''))
    : [];

  const digitalTags = DIGITAL_PRODUCT_TAGS.map(t => t.toLowerCase().trim());

  return productTags.some(tag => digitalTags.includes(tag));
};

/**
 * Format price in VND
 * @param {number} value - Price value
 * @returns {string}
 */
export const formatPrice = (value) => {
  if (value == null || isNaN(value)) return 'Liên hệ';

  return new Intl.NumberFormat(PRICE_CONFIG.locale, {
    style: 'currency',
    currency: PRICE_CONFIG.currency,
    maximumFractionDigits: 0,
  }).format(value);
};

/**
 * Calculate discount percentage
 * @param {number} price - Current price
 * @param {number} compareAtPrice - Original price
 * @returns {number}
 */
export const calculateDiscount = (price, compareAtPrice) => {
  if (!price || !compareAtPrice || compareAtPrice <= price) return 0;
  return Math.round((1 - price / compareAtPrice) * 100);
};

export default {
  DIGITAL_PRODUCT_TAGS,
  DIGITAL_CATEGORIES,
  TIER_HIERARCHY,
  TIER_NAMES,
  TIER_COLORS,
  TIER_ACCESS_MATRIX,
  TIER_UPGRADE_PATH,
  HERO_CONFIG,
  HERO_SLIDES,
  TOOLTIP_STORAGE_KEY,
  TOOLTIP_CONTENT,
  PRICE_CONFIG,
  getTierFromTags,
  getSubscriptionType,
  canAccessProduct,
  getUpgradeSuggestion,
  getCategoryById,
  getAllDigitalProductTags,
  isDigitalProduct,
  formatPrice,
  calculateDiscount,
};
