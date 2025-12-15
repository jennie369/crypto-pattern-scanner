/**
 * Shop Configuration - Cấu hình cho Shop Tab
 * Quản lý categories, tabs, sections và tags Shopify
 *
 * ⚠️ QUAN TRỌNG: Tags PHẢI khớp CHÍNH XÁC với Shopify (case-sensitive)
 */

import {
  LayoutGrid,
  Gem,
  GraduationCap,
  Bot,
  BarChart3,
  Package,
  Sparkles,
  Heart,
  TrendingUp,
  Layers,
  Coins,
  Crown,
} from 'lucide-react-native';

// ═══════════════════════════════════════════════════════════
// CATEGORY TABS - Các tab chính của Shop (UPDATED với tags thực tế)
// ═══════════════════════════════════════════════════════════
export const SHOP_TABS = [
  {
    id: 'all',
    label: 'Tất cả',
    icon: LayoutGrid,
    tags: [], // Empty = no filter
    isDefault: true,
  },
  {
    id: 'crystals',
    label: 'Crystals & Spiritual',
    icon: Gem,
    tags: [
      // Loại đá chính
      'Thạch Anh Tím',
      'Thạch Anh Hồng',
      'Thạch Anh Trắng',
      'Thạch Anh Vàng',
      'Thạch Anh Xanh',
      'Khói Xám',
      'Hematite',
      'Aura',
      'Aquamarine',
      'Huyền Kim Trụ',
      // Hình dạng
      'Cụm',
      'Trụ',
      'viên',
      'Vòng Tay',
      // Set & Collections
      'Set',
      'Special set',
      'Cây Tài Lộc',
      'Hot Product',
      'Bestseller',
      // Tinh dầu
      'Tinh dầu nước hoa Jérie',
      // General
      'crystals',
    ],
  },
  {
    id: 'courses',
    label: 'Khóa học',
    icon: GraduationCap,
    tags: [
      // TAGS THỰC TẾ từ Shopify
      'Khóa học Trading',
      'Khóa học',
      'khoa-hoc',
      'trading-course',
      'trading',
      'tan-so-goc',
      'tier-starter',
      'Tier 1',
      'Tier 2',
      'Tier 3',
      'spiritual',
      'mindset',
      'khai-mo',
      'healing',
      'gem-academy',
      'Gem Trading',
      'Ebook',
      'digital',
      'course',
      '7-ngay',
    ],
  },
  {
    id: 'gemmaster',
    label: 'GemMaster',
    icon: Bot,
    tags: [
      'GEM Chatbot',
    ],
  },
  {
    id: 'scanner',
    label: 'Scanner',
    icon: BarChart3,
    tags: [
      'Scanner',
    ],
  },
  {
    id: 'gempack',
    label: 'Gem Pack',
    icon: Package,
    tags: [
      'Gem Pack',
      'virtual-currency',
      'in-app',
      'gems',
    ],
  },
];

// Legacy export for backward compatibility
export const SHOP_CATEGORIES = SHOP_TABS;

// ═══════════════════════════════════════════════════════════
// PRODUCT SECTIONS - Các section hiển thị trên tab "TẤT CẢ"
// ═══════════════════════════════════════════════════════════
export const SHOP_SECTIONS = [
  {
    id: 'for-you',
    title: 'Dành Cho Bạn',
    subtitle: 'Được chọn riêng cho bạn',
    icon: Sparkles,
    type: 'personalized',
    layout: 'horizontal',
    limit: 6,
    showViewAll: true,
  },
  {
    id: 'trending',
    title: 'Đang Thịnh Hành',
    subtitle: 'Sản phẩm được yêu thích nhất',
    icon: TrendingUp,
    type: 'tagged',
    tags: [
      'Bestseller',
      'Hot Product',
      'Trụ',
      'Thạch Anh Vàng',
      'Thạch Anh Tím',
      'Special set',
      'Set',
      'Huyền Kim Trụ',
      'Cụm',
      'Cây Tài Lộc',
      'Thạch Anh Trắng',
      'Thạch Anh Hồng',
    ],
    layout: 'horizontal',
    limit: 6,
    showViewAll: true,
  },
  {
    id: 'manifest-money',
    title: 'Manifest Tiền Bạc',
    subtitle: 'Thu hút tài lộc, thịnh vượng',
    icon: Coins,
    type: 'tagged',
    tags: [
      'Thạch Anh Vàng',
      'Cây Tài Lộc',
    ],
    layout: 'horizontal',
    limit: 6,
    showViewAll: true,
  },
  {
    id: 'manifest-love',
    title: 'Manifest Tình Yêu',
    subtitle: 'Chiêu cảm tình duyên',
    icon: Heart,
    type: 'tagged',
    tags: [
      'Thạch Anh Hồng',
      'Aura',
    ],
    layout: 'horizontal',
    limit: 6,
    showViewAll: true,
  },
  {
    id: 'manifest-abundance',
    title: 'Manifest Thịnh Vượng',
    subtitle: 'Năng lượng sự nghiệp, thành công',
    icon: Crown,
    type: 'tagged',
    tags: [
      'Cây Tài Lộc',
      'Thạch Anh Tím',
      'Thạch Anh Trắng',
      'Special set',
      'Bestseller',
    ],
    layout: 'horizontal',
    limit: 6,
    showViewAll: true,
  },
  {
    id: 'sets',
    title: 'Trang Sức Phong Thủy',
    subtitle: 'Vòng tay đá quý năng lượng',
    icon: Layers,
    type: 'tagged',
    tags: ['Vòng Tay'],
    layout: 'horizontal',
    limit: 6,
    showViewAll: true,
  },
  {
    id: 'explore',
    title: 'Khám Phá Thêm',
    subtitle: 'Tất cả sản phẩm',
    icon: LayoutGrid,
    type: 'all',
    layout: 'grid',
    limit: 12,
    showViewAll: false,
    hasInfiniteScroll: true,
  },
];

// ═══════════════════════════════════════════════════════════
// SHOPIFY TAG MAPPING - Map tất cả tags thực tế từ Shopify
// ═══════════════════════════════════════════════════════════
export const SHOPIFY_TAGS = {
  // Bestsellers & Hot
  bestseller: 'Bestseller',
  hotProduct: 'Hot Product',

  // Crystal types
  amethyst: 'Thạch Anh Tím',
  roseQuartz: 'Thạch Anh Hồng',
  clearQuartz: 'Thạch Anh Trắng',
  citrine: 'Thạch Anh Vàng',
  blueQuartz: 'Thạch Anh Xanh',
  smokyQuartz: 'Khói Xám',
  hematite: 'Hematite',
  aura: 'Aura',
  aquamarine: 'Aquamarine',

  // Shapes
  cluster: 'Cụm',
  tower: 'Trụ',
  sphere: 'viên',
  bracelet: 'Vòng Tay',

  // Collections
  set: 'Set',
  specialSet: 'Special set',
  moneyTree: 'Cây Tài Lộc',

  // Products
  gemChatbot: 'GEM Chatbot',
  scanner: 'Scanner',
  gemPack: 'Gem Pack',
  course: 'Khóa học',
  tradingCourse: 'Khóa học Trading',
  ebook: 'Ebook',
  perfume: 'Tinh dầu nước hoa Jérie',

  // Tiers
  tier1: 'Tier 1',
  tier2: 'Tier 2',
  tier3: 'Tier 3',

  // General
  crystals: 'crystals',
};

// ═══════════════════════════════════════════════════════════
// PRODUCT TYPES - Loại sản phẩm
// ═══════════════════════════════════════════════════════════
export const PRODUCT_TYPES = {
  DIGITAL: 'digital',
  PHYSICAL: 'physical',
  COURSE: 'course',
  SUBSCRIPTION: 'subscription',
  GEM_PACK: 'gem_pack',
};

// ═══════════════════════════════════════════════════════════
// PAGINATION CONFIG
// ═══════════════════════════════════════════════════════════
export const PAGINATION = {
  initialLimit: 12,
  loadMoreLimit: 12,
  maxItems: 100,
};

// ═══════════════════════════════════════════════════════════
// DEFAULT VALUES
// ═══════════════════════════════════════════════════════════
export const SHOP_DEFAULTS = {
  productsPerPage: 12,
  sectionsLimit: 6,
  gridColumns: 2,
  horizontalItemWidth: 160,
  cacheTime: 5 * 60 * 1000, // 5 phút
};

// ═══════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════

/**
 * Lấy section config theo id
 */
export const getSectionById = (sectionId) => {
  return SHOP_SECTIONS.find(section => section.id === sectionId);
};

/**
 * Lấy category/tab config theo id
 */
export const getCategoryById = (categoryId) => {
  return SHOP_TABS.find(tab => tab.id === categoryId);
};

/**
 * Lấy tab config theo id (alias)
 */
export const getTabById = getCategoryById;

/**
 * Lấy tags của một tab
 */
export const getTabTags = (tabId) => {
  const tab = getTabById(tabId);
  return tab?.tags || [];
};

/**
 * Lấy tags của một section
 */
export const getSectionTags = (sectionId) => {
  const section = getSectionById(sectionId);
  return section?.tags || [];
};

/**
 * Kiểm tra sản phẩm có tag không (case-insensitive)
 */
export const productHasTag = (product, tag) => {
  if (!product?.tags || !tag) return false;
  const productTags = Array.isArray(product.tags)
    ? product.tags
    : product.tags.split(',').map(t => t.trim());

  // Case-insensitive comparison
  const lowerTag = tag.toLowerCase();
  return productTags.some(t => t.toLowerCase() === lowerTag);
};

/**
 * Kiểm tra sản phẩm có bất kỳ tag nào trong danh sách không
 */
export const productHasAnyTag = (product, tags) => {
  // Nếu không có tags để filter -> include tất cả
  if (!tags || tags.length === 0) return true;
  // Nếu sản phẩm không có tags -> không match
  if (!product?.tags) return false;
  return tags.some(tag => productHasTag(product, tag));
};

/**
 * Filter sản phẩm theo tags (OR logic - có bất kỳ tag nào)
 */
export const filterProductsByTags = (products, tags) => {
  if (!tags || tags.length === 0) return products;
  return products.filter(product => productHasAnyTag(product, tags));
};

/**
 * Filter sản phẩm theo single tag (legacy support)
 */
export const filterProductsByTag = (products, tag) => {
  if (!tag || tag === 'all') return products;
  return products.filter(product => productHasTag(product, tag));
};

/**
 * Build GraphQL query string từ tags array
 * Shopify uses "tag:value" format
 */
export const buildTagQuery = (tags) => {
  if (!tags || tags.length === 0) return '';
  return tags.map(tag => `tag:"${tag}"`).join(' OR ');
};

export default {
  SHOP_TABS,
  SHOP_CATEGORIES,
  SHOP_SECTIONS,
  SHOPIFY_TAGS,
  PRODUCT_TYPES,
  PAGINATION,
  SHOP_DEFAULTS,
  getSectionById,
  getCategoryById,
  getTabById,
  getTabTags,
  getSectionTags,
  productHasTag,
  productHasAnyTag,
  filterProductsByTags,
  filterProductsByTag,
  buildTagQuery,
};
