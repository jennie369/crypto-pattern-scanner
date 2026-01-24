/**
 * CENTRALIZED PRODUCT CONFIGURATION
 * Single source of truth for all Shopify products
 * Last Updated: 2026-01-16
 *
 * NOTE: All checkout URLs use cart format: yinyangmasters.com/cart/{variantId}:1
 * This ensures proper variant selection and checkout flow
 */

// ========================================
// BUNDLE COURSES (Khóa học Trading + Quét Nến + Master Sư Phụ AI)
// ========================================
export const COURSE_BUNDLES = {
  STARTER: {
    variantId: '46448154050737',
    price: 299000,
    priceFormatted: '299.000đ',
    productUrl: 'https://yinyangmasters.com/products/gem-trading-course-tier-starter',
    cartUrl: 'https://yinyangmasters.com/cart/46448154050737:1',
    landingPage: 'https://yinyangmasters.com/pages/khoatradingtansodocquyen',
    name: 'GÓI KHỞI ĐẦU',
    description: 'Nhập môn giao dịch - Bước đầu chinh phục',
    includes: [
      'Khóa học cơ bản (15 bài, 2-3 giờ)',
      'Hiểu về tự do tài chính',
      'Khám phá phương pháp GEM Tần Số',
      'Quét mẫu hình: 5 lần/ngày',
      'Hỏi Master Sư Phụ AI: 10 câu/ngày',
      'Tham gia cộng đồng GEM',
    ],
    tier: 'STARTER',
  },
  TIER1: {
    variantId: '46351707898033',
    price: 11000000,
    priceFormatted: '11.000.000đ',
    period: '12 tháng',
    productUrl: 'https://yinyangmasters.com/products/gem-tier1',
    cartUrl: 'https://yinyangmasters.com/cart/46351707898033:1',
    landingPage: 'https://yinyangmasters.com/pages/khoatradingtansodocquyen',
    name: 'GÓI 1 - CHUYÊN NGHIỆP',
    description: 'Nền tảng vững chắc - 7 mẫu hình cơ bản',
    includes: [
      'Khóa học đầy đủ (5 phần, 17 chương)',
      '7 mẫu hình nến cơ bản',
      'Nhận diện 70% cơ hội trên thị trường',
      'Quét nến Chuyên Nghiệp: Không giới hạn (12 tháng)',
      'Master Sư Phụ AI Chuyên Nghiệp: 15 câu/ngày (12 tháng)',
      'Giao dịch mô phỏng',
      'Cộng đồng VIP 12 tháng',
      'Mục tiêu tỷ lệ thắng: 50-55%',
      'Tiết kiệm 70% so với mua lẻ',
    ],
    tier: 'TIER1',
  },
  TIER2: {
    variantId: '46351719235761',
    price: 21000000,
    priceFormatted: '21.000.000đ',
    period: '18 tháng',
    productUrl: 'https://yinyangmasters.com/products/gem-tier2',
    cartUrl: 'https://yinyangmasters.com/cart/46351719235761:1',
    landingPage: 'https://yinyangmasters.com/pages/khoatradingtansodocquyen',
    name: 'GÓI 2 - NÂNG CAO',
    description: 'Phương pháp độc quyền - 6 công thức Tần Số',
    includes: [
      'Bao gồm toàn bộ GÓI 1',
      'Khóa học nâng cao (10 phần, 30 chương)',
      '15 mẫu hình nến (nhận diện 95% cơ hội)',
      '6 Công thức Tần Số độc quyền',
      'DPD, UPU, UPD, DPU, HFZ, LFZ',
      'Quét nến Cao Cấp: 15 mẫu hình + 6 vùng (12 tháng)',
      'Master Sư Phụ AI Cao Cấp: 50 câu/ngày (12 tháng)',
      '8 công cụ giao dịch chuyên nghiệp',
      'Phân tích đa khung thời gian',
      'Mục tiêu tỷ lệ thắng: 70-75%',
      '78% học viên chọn gói này',
      'Tiết kiệm 71% so với mua lẻ',
    ],
    tier: 'TIER2',
  },
  TIER3: {
    variantId: '46351723331761',
    price: 68000000,
    priceFormatted: '68.000.000đ',
    period: '24 tháng',
    productUrl: 'https://yinyangmasters.com/products/gem-tier3',
    cartUrl: 'https://yinyangmasters.com/cart/46351723331761:1',
    landingPage: 'https://yinyangmasters.com/pages/khoatradingtansodocquyen',
    name: 'GÓI 3 - TINH HOA',
    description: 'Xây dựng đế chế - 11 công thức đầy đủ',
    includes: [
      'Bao gồm toàn bộ GÓI 2',
      'Khóa học Tinh Hoa (14 phần)',
      '11 Công thức Tần Số ĐẦY ĐỦ',
      '5 công thức nâng cao độc quyền',
      'Quét nến Tinh Hoa + Dự đoán AI 73% (24 tháng)',
      'Master Sư Phụ AI Tinh Hoa: Không giới hạn (24 tháng)',
      '11 công cụ Tinh Hoa',
      'Theo dõi cá voi',
      'Tín hiệu 5-8 lệnh/ngày',
      'Nhóm Tinh Hoa trọn đời',
      'Hỗ trợ ưu tiên (phản hồi 4 giờ)',
      'Mục tiêu tỷ lệ thắng: 80-90%',
      'Tiềm năng 1-5 tỷ đồng/tháng',
      'Tiết kiệm 79% so với mua lẻ',
    ],
    tier: 'TIER3',
  },
};

// ========================================
// QUÉT NẾN MUA RIÊNG LẺ (Standalone Scanner Subscriptions)
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
    name: 'Quét Nến Chuyên Nghiệp',
    description: 'Không giới hạn lần quét',
    features: [
      'Không giới hạn lần quét',
      '7 mẫu hình nến',
      'Thông báo thời gian thực',
      'Quét 400+ đồng tiền Binance',
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
    name: 'Quét Nến Cao Cấp',
    description: 'Công cụ nâng cao',
    features: [
      'Không giới hạn lần quét',
      '15 mẫu hình nến',
      '6 vùng Tần Số (HFZ/LFZ)',
      'Lọc tín hiệu bằng AI',
      'Phân tích đa khung thời gian',
      'Công cụ quản lý rủi ro',
      'Chính xác hơn 3 lần so với gói Chuyên Nghiệp',
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
    name: 'Quét Nến Tinh Hoa',
    description: 'Tất cả tính năng + Dự đoán AI',
    features: [
      'Không giới hạn lần quét',
      '24 mẫu hình đầy đủ',
      '11 vùng Tần Số',
      'Dự đoán AI độ chính xác 73%',
      'Theo dõi cá voi',
      'Tín hiệu ưu tiên',
      'Hỗ trợ ưu tiên 24/7',
      'Tất cả công cụ Tinh Hoa',
    ],
    tier: 'VIP',
  },
};

// ========================================
// MASTER SƯ PHỤ AI MUA RIÊNG LẺ (Standalone Chatbot Subscriptions)
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
    name: 'Sư Phụ AI Chuyên Nghiệp',
    description: 'Tư vấn nâng cao',
    features: [
      '15 câu hỏi/ngày',
      'Kiểm tra tâm lý trước lệnh',
      'Cảnh báo FOMO/giao dịch trả thù',
      'Tarot & Kinh Dịch không giới hạn',
      'Tử Vi giao dịch',
      'Hỗ trợ học tập',
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
    name: 'Sư Phụ AI Cao Cấp',
    description: 'Phân tích biểu đồ bằng AI',
    features: [
      '50 câu hỏi/ngày',
      'Phân tích biểu đồ từ ảnh',
      'Đánh giá giao dịch trước khi vào lệnh',
      'Gợi ý Điểm vào/Cắt lỗ/Chốt lời tối ưu',
      'Chiến lược riêng cho bạn',
      'Tâm linh nâng cao',
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
    name: 'Sư Phụ AI Tinh Hoa',
    description: 'Không giới hạn + Tư vấn đế chế',
    features: [
      'Không giới hạn câu hỏi',
      'Phân tích danh mục tổng thể',
      'Tư vấn mở rộng quy mô',
      'Quản lý rủi ro lớn',
      'Hỗ trợ quyết định cấp cao',
      'Chiến lược dài hạn',
      'Ưu tiên phản hồi',
    ],
    tier: 'VIP',
  },
};

// ========================================
// KHÓA HỌC CHUYỂN HÓA NỘI TÂM - Học thuyết Jennie Uyên Chu
// ========================================
export const MINDSET_COURSES = {
  TINH_YEU: {
    variantId: '46448180166833',
    productId: '8904653111473',
    price: 399000,
    priceFormatted: '399.000đ',
    productUrl: 'https://yinyangmasters.com/products/khoa-hoc-kich-hoat-tan-so-tinh-yeu',
    cartUrl: 'https://yinyangmasters.com/cart/46448180166833:1',
    landingPage: 'https://yinyangmasters.com/pages/khoahockichhoattansotinhyeu',
    name: 'Kích Hoạt Tần Số Tình Yêu',
    description: '42 ngày chữa lành & thu hút tri kỷ',
    duration: '42 ngày',
    features: [
      '42 ngày hành trình (6 tuần)',
      '24 bài học chi tiết',
      'Chữa lành vết thương quá khứ',
      'Xây dựng tình yêu bản thân',
      'Nâng tần số lên 500+ Hz',
      'Sẵn sàng đón tri kỷ đích thực',
      '5 ngôn ngữ tình yêu',
      'Nhận diện dấu hiệu tích cực & tiêu cực',
    ],
  },
  TRIEU_PHU: {
    variantId: '46448192192689',
    productId: '8904656257201',
    price: 499000,
    priceFormatted: '499.000đ',
    productUrl: 'https://yinyangmasters.com/products/khoa-hoc-tai-tao-tu-duy-trieu-phu',
    cartUrl: 'https://yinyangmasters.com/cart/46448192192689:1',
    landingPage: 'https://yinyangmasters.com/pages/khoahoctaitaotuduytrieuphu',
    name: 'Tái Tạo Tư Duy Triệu Phú',
    description: '49 ngày thanh tẩy niềm tin về tiền',
    duration: '49 ngày',
    features: [
      '49 ngày hành trình (7 tuần)',
      '28 bài học chi tiết',
      'Thanh tẩy niềm tin giới hạn',
      'Hóa giải nghiệp tiền bạc',
      'Nâng tần số lên 400+ Hz',
      'Nghi thức buổi sáng 15 phút',
      'Hệ thống 6 Lọ quản lý tài chính',
      '50 khẳng định thịnh vượng',
    ],
  },
  TAN_SO_GOC: {
    variantId: '46448176758961',
    productId: '8904651342001',
    price: 1990000,
    priceFormatted: '1.990.000đ',
    productUrl: 'https://yinyangmasters.com/products/khoa-hoc-7-ngay-khai-mo-tan-so-goc',
    cartUrl: 'https://yinyangmasters.com/cart/46448176758961:1',
    landingPage: 'https://yinyangmasters.com/pages/7ngaykhaimotansogoc',
    name: '7 Ngày Khai Mở Tần Số Gốc',
    description: 'Chuyển hóa toàn diện cuộc sống',
    duration: '7 ngày',
    badge: 'CHUYÊN SÂU',
    features: [
      '7 ngày hành trình chuyên sâu',
      'Bản đồ 7 tầng tâm thức',
      'Công cụ Người Chứng Kiến',
      '5 nguyên lý vận hành vũ trụ',
      '7 nghi thức hàng ngày',
      '5 quy trình xử lý khi gặp thử thách',
      'Hiểu về nghiệp & luân hồi',
      '7 viên đá năng lượng hỗ trợ',
    ],
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
