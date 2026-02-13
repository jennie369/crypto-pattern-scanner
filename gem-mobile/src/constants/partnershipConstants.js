/**
 * ============================================================
 * GEM PARTNERSHIP CONSTANTS v3.0
 * ============================================================
 *
 * QUAN TRỌNG: Đọc file này để hiểu commission rates
 *
 * Reference: GEM_PARTNERSHIP_OFFICIAL_POLICY_V3.md
 *
 * CTV TIERS (5 cấp - Tiếng Việt):
 * - Bronze (Đồng): 0 VND - Digital 10%, Physical 6%, Sub-Aff 2%
 * - Silver (Bạc): 50M VND - Digital 15%, Physical 8%, Sub-Aff 2.5%
 * - Gold (Vàng): 150M VND - Digital 20%, Physical 10%, Sub-Aff 3%
 * - Platinum (Bạch Kim): 400M VND - Digital 25%, Physical 12%, Sub-Aff 3.5%
 * - Diamond (Kim Cương): 800M VND - Digital 30%, Physical 15%, Sub-Aff 4%
 *
 * KOL AFFILIATE:
 * - Yêu cầu: 20,000+ followers (BẮT BUỘC, không ngoại lệ)
 * - Commission: 20% (cả Digital và Physical)
 * - Sub-Affiliate: 3.5%
 *
 * ============================================================
 */

// ============================================================
// ROLES
// ============================================================
export const PARTNERSHIP_ROLES = {
  CTV: 'ctv',
  KOL: 'kol',
};

export const ROLE_DISPLAY = {
  ctv: {
    name: 'Đối Tác Phát Triển',
    shortName: 'CTV',
    description: 'Cộng tác viên bán hàng, nhận hoa hồng theo tier',
  },
  kol: {
    name: 'KOL Affiliate',
    shortName: 'KOL',
    description: 'Người có ảnh hưởng, nhận 20% + 3.5% sub-affiliate',
  },
};

// ============================================================
// CTV TIERS - 5 TIERS (Vietnamese)
// ============================================================
export const CTV_TIERS = {
  BRONZE: 'bronze',
  SILVER: 'silver',
  GOLD: 'gold',
  PLATINUM: 'platinum',
  DIAMOND: 'diamond',
};

export const CTV_TIER_ORDER = ['bronze', 'silver', 'gold', 'platinum', 'diamond'];

/**
 * CTV_TIER_CONFIG - Cấu hình chính thức cho các tier
 *
 * THRESHOLDS (VND):
 * - Bronze: 0
 * - Silver: 50,000,000 (50M)
 * - Gold: 150,000,000 (150M)
 * - Platinum: 400,000,000 (400M)
 * - Diamond: 800,000,000 (800M)
 */
export const CTV_TIER_CONFIG = {
  bronze: {
    key: 'bronze',
    name: 'Đồng',
    icon: '🥉',
    color: '#CD7F32',
    bgColor: 'rgba(205, 127, 50, 0.15)',
    threshold: 0,
    commission: {
      digital: 0.10,  // 10%
      physical: 0.06, // 6%
    },
    subAffiliate: 0.02, // 2%
    paymentSchedule: 'monthly',
    order: 1,
    benefits: [
      'Hoa hồng 10% sản phẩm Digital',
      'Hoa hồng 6% sản phẩm Physical',
      'Trung tâm tài nguyên cơ bản',
      'Hỗ trợ qua chat',
    ],
  },
  silver: {
    key: 'silver',
    name: 'Bạc',
    icon: '🥈',
    color: '#C0C0C0',
    bgColor: 'rgba(192, 192, 192, 0.15)',
    threshold: 50000000, // 50M VND
    commission: {
      digital: 0.15,  // 15%
      physical: 0.08, // 8%
    },
    subAffiliate: 0.025, // 2.5%
    paymentSchedule: 'monthly',
    order: 2,
    benefits: [
      'Hoa hồng 15% sản phẩm Digital',
      'Hoa hồng 8% sản phẩm Physical',
      'Trung tâm tài nguyên đầy đủ',
      'Hỗ trợ ưu tiên',
    ],
  },
  gold: {
    key: 'gold',
    name: 'Vàng',
    icon: '🥇',
    color: '#FFD700',
    bgColor: 'rgba(255, 215, 0, 0.15)',
    threshold: 150000000, // 150M VND
    commission: {
      digital: 0.20,  // 20%
      physical: 0.10, // 10%
    },
    subAffiliate: 0.03, // 3%
    paymentSchedule: 'biweekly',
    order: 3,
    benefits: [
      'Hoa hồng 20% sản phẩm Digital',
      'Hoa hồng 10% sản phẩm Physical',
      'Vé VIP sự kiện',
      'Early access sản phẩm mới',
    ],
  },
  platinum: {
    key: 'platinum',
    name: 'Bạch Kim',
    icon: '💎',
    color: '#E5E4E2',
    bgColor: 'rgba(229, 228, 226, 0.15)',
    threshold: 400000000, // 400M VND
    commission: {
      digital: 0.25,  // 25%
      physical: 0.12, // 12%
    },
    subAffiliate: 0.035, // 3.5%
    paymentSchedule: 'weekly',
    order: 4,
    benefits: [
      'Hoa hồng 25% sản phẩm Digital',
      'Hoa hồng 12% sản phẩm Physical',
      'Thanh toán hàng tuần',
      'Account Manager riêng',
      'Priority support 24/7',
    ],
  },
  diamond: {
    key: 'diamond',
    name: 'Kim Cương',
    icon: '👑',
    color: '#00F0FF',
    bgColor: 'rgba(0, 240, 255, 0.15)',
    threshold: 800000000, // 800M VND
    commission: {
      digital: 0.30,  // 30%
      physical: 0.15, // 15%
    },
    subAffiliate: 0.04, // 4%
    paymentSchedule: 'weekly',
    order: 5,
    benefits: [
      'Hoa hồng 30% sản phẩm Digital',
      'Hoa hồng 15% sản phẩm Physical',
      'Thanh toán hàng tuần',
      'Diamond Exclusive Resources',
      'Co-branding opportunities',
      'Revenue share programs',
    ],
  },
};

// ============================================================
// KOL CONFIG
// ============================================================

/**
 * KOL_CONFIG - Cấu hình cho KOL Affiliate
 *
 * REQUIREMENTS:
 * - Có 20,000+ followers (BẮT BUỘC)
 * - ⚠️ Việc đã là CTV KHÔNG miễn điều kiện này
 *
 * COMMISSION: 20% (cả Digital và Physical) + 3.5% Sub-Aff
 */
export const KOL_CONFIG = {
  key: 'kol',
  name: 'KOL Affiliate',
  icon: '⭐',
  color: '#9C27B0',
  bgColor: 'rgba(156, 39, 176, 0.15)',
  requirements: {
    minFollowers: 20000, // 20K followers - BẮT BUỘC
    // ❌ ĐÃ BỎ: orIsCTV - Không có ngoại lệ cho CTV
  },
  commission: {
    digital: 0.20,  // 20%
    physical: 0.20, // 20%
  },
  subAffiliate: 0.035, // 3.5%
  paymentSchedule: 'biweekly',
  acceptedPlatforms: [
    { key: 'youtube', name: 'Youtube', icon: 'Youtube' },
    { key: 'facebook', name: 'Facebook', icon: 'Facebook' },
    { key: 'instagram', name: 'Instagram', icon: 'Instagram' },
    { key: 'tiktok', name: 'TikTok', icon: 'Music' },
    { key: 'twitter', name: 'Twitter/X', icon: 'Twitter' },
    { key: 'discord', name: 'Discord', icon: 'MessageCircle' },
    { key: 'telegram', name: 'Telegram', icon: 'Send' },
  ],
  benefits: [
    'Hoa hồng 20% tất cả sản phẩm',
    'Sub-affiliate 3.5%',
    'Creative Kit độc quyền',
    'Featured trên GEM Platform',
    'Co-marketing opportunities',
  ],
};

// ============================================================
// PRODUCT TYPES
// ============================================================
export const PRODUCT_TYPES = {
  DIGITAL: ['course', 'subscription', 'ebook', 'digital_product', 'membership', 'digital'],
  PHYSICAL: ['crystal', 'jewelry', 'physical_product', 'merchandise', 'physical'],
};

// ============================================================
// PAYMENT CONFIG
// ============================================================
export const PAYMENT_CONFIG = {
  minWithdrawal: 100000, // 100K VND
  maxPendingRequests: 1,
  processingDays: 3,
  schedules: {
    monthly: {
      name: 'Hàng tháng',
      days: [15],
      description: 'Thanh toán vào ngày 15 hàng tháng',
    },
    biweekly: {
      name: 'Nửa tháng',
      days: [1, 15],
      description: 'Thanh toán vào ngày 1 và 15 hàng tháng',
    },
    weekly: {
      name: 'Hàng tuần',
      dayOfWeek: 1, // Monday
      description: 'Thanh toán vào Thứ 2 hàng tuần',
    },
  },
};

// ============================================================
// APPLICATION CONFIG
// ============================================================
export const APPLICATION_CONFIG = {
  ctv: {
    autoApprove: true,
    autoApproveDays: 3,
    requiresVerification: false,
    requiresCourse: false, // ĐÃ BỎ điều kiện phải mua khóa học
  },
  kol: {
    autoApprove: false,
    requiresAdminReview: true,
    requiresVerification: true,
  },
};

// ============================================================
// STATUS ENUMS
// ============================================================
export const APPLICATION_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

export const WITHDRAWAL_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  REJECTED: 'rejected',
};

export const COMMISSION_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  PAID: 'paid',
};

// ============================================================
// NOTIFICATION TYPES
// ============================================================
export const NOTIFICATION_TYPES = {
  APPLICATION_APPROVED: 'application_approved',
  APPLICATION_REJECTED: 'application_rejected',
  TIER_UPGRADE: 'tier_upgrade',
  TIER_DOWNGRADE: 'tier_downgrade',
  COMMISSION_EARNED: 'commission_earned',
  COMMISSION_PAID: 'commission_paid',
  SUB_AFFILIATE_JOINED: 'sub_affiliate_joined',
  SUB_AFFILIATE_EARNED: 'sub_affiliate_earned',
  PAYMENT_SCHEDULED: 'payment_scheduled',
  PAYMENT_PROCESSED: 'payment_processed',
};

// ============================================================
// TIER EVALUATION CONFIG
// ============================================================
export const TIER_EVALUATION = {
  upgrade: {
    frequency: 'weekly',
    dayOfWeek: 1, // Monday
    time: '00:00',
  },
  downgrade: {
    frequency: 'monthly',
    dayOfMonth: -1, // Last day
    time: '23:59',
    minMonthlyPercentage: 0.10, // 10% of threshold
  },
};

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Kiểm tra product type có phải Digital không
 * @param {string} productType - Loại sản phẩm
 * @returns {boolean}
 */
export const isDigitalProduct = (productType) => {
  return PRODUCT_TYPES.DIGITAL.includes(productType?.toLowerCase());
};

/**
 * Lấy config của tier
 * @param {string} tier - Tier key
 * @returns {Object} Tier config
 */
export const getTierConfig = (tier) => {
  return CTV_TIER_CONFIG[tier] || CTV_TIER_CONFIG.bronze;
};

/**
 * Tính commission rate
 * @param {string} role - 'ctv' hoặc 'kol'
 * @param {string} tier - Tier của CTV
 * @param {string} productType - Loại sản phẩm
 * @returns {number} Rate (0-1)
 */
export const getCommissionRate = (role, tier, productType) => {
  if (role === 'kol') {
    return KOL_CONFIG.commission.digital; // KOL: 20% cho tất cả
  }
  const config = getTierConfig(tier);
  const type = isDigitalProduct(productType) ? 'digital' : 'physical';
  return config.commission[type];
};

/**
 * Tính sub-affiliate rate
 * @param {string} role - 'ctv' hoặc 'kol'
 * @param {string} tier - Tier của CTV (nếu role = ctv)
 * @returns {number} Rate (0-1)
 */
export const getSubAffiliateRate = (role, tier) => {
  if (role === 'kol') {
    return KOL_CONFIG.subAffiliate; // 3.5%
  }
  return getTierConfig(tier).subAffiliate;
};

/**
 * Xác định tier dựa trên tổng doanh số
 * @param {number} totalSales - Tổng doanh số (VND)
 * @returns {string} Tier key
 */
export const determineTierByTotalSales = (totalSales) => {
  const sales = totalSales || 0;
  for (let i = CTV_TIER_ORDER.length - 1; i >= 0; i--) {
    const tier = CTV_TIER_ORDER[i];
    if (sales >= CTV_TIER_CONFIG[tier].threshold) {
      return tier;
    }
  }
  return 'bronze';
};

/**
 * Tính progress đến tier tiếp theo
 * @param {string} currentTier - Tier hiện tại
 * @param {number} totalSales - Tổng doanh số
 * @returns {Object} { nextTier, nextTierName, nextTierIcon, nextThreshold, progress, remaining }
 */
export const calculateTierProgress = (currentTier, totalSales) => {
  const currentIndex = CTV_TIER_ORDER.indexOf(currentTier || 'bronze');
  const sales = totalSales || 0;

  // Đã là tier cao nhất
  if (currentIndex === CTV_TIER_ORDER.length - 1) {
    return {
      nextTier: null,
      nextTierName: null,
      nextTierIcon: null,
      nextThreshold: null,
      progress: 100,
      remaining: 0,
    };
  }

  const nextTier = CTV_TIER_ORDER[currentIndex + 1];
  const nextConfig = CTV_TIER_CONFIG[nextTier];
  const currentThreshold = CTV_TIER_CONFIG[currentTier || 'bronze'].threshold;
  const nextThreshold = nextConfig.threshold;

  const range = nextThreshold - currentThreshold;
  const current = Math.max(0, sales - currentThreshold);
  const progress = range > 0 ? Math.min(100, Math.round((current / range) * 100)) : 0;
  const remaining = Math.max(0, nextThreshold - sales);

  return {
    nextTier,
    nextTierName: nextConfig.name,
    nextTierIcon: nextConfig.icon,
    nextThreshold,
    progress,
    remaining,
  };
};

/**
 * Format tier display với icon và tên
 * @param {string} tier - Tier key
 * @returns {string} "🥉 Đồng"
 */
export const formatTierDisplay = (tier) => {
  const config = getTierConfig(tier);
  return `${config.icon} ${config.name}`;
};

/**
 * Kiểm tra user có đủ điều kiện đăng ký KOL không
 *
 * ⚠️ LOGIC ĐÃ SỬA (v3.0):
 * - CHỈ check followers >= 20,000
 * - KHÔNG có ngoại lệ cho CTV
 * - Dù đã là CTV vẫn PHẢI có 20K+ followers
 *
 * @param {number} totalFollowers - Tổng followers
 * @returns {Object} { eligible, reason, condition, details }
 */
export const checkKOLEligibility = (totalFollowers) => {
  const MIN_FOLLOWERS = KOL_CONFIG.requirements.minFollowers;
  const followers = totalFollowers || 0;

  if (followers >= MIN_FOLLOWERS) {
    return {
      eligible: true,
      reason: `Đủ điều kiện: ${followers.toLocaleString()} followers`,
      condition: 'has_followers',
    };
  }

  const remaining = MIN_FOLLOWERS - followers;
  return {
    eligible: false,
    reason: `Cần thêm ${remaining.toLocaleString()} followers (hiện có ${followers.toLocaleString()}/20,000)`,
    condition: 'not_eligible',
    details: {
      currentFollowers: followers,
      requiredFollowers: MIN_FOLLOWERS,
      remainingFollowers: remaining,
    },
  };
};

/**
 * Tính tổng followers từ social platforms
 * @param {Object} platforms - { youtube: 10000, facebook: 5000, ... }
 * @returns {number}
 */
export const calculateTotalFollowers = (platforms) => {
  if (!platforms || typeof platforms !== 'object') return 0;
  return Object.values(platforms).reduce((sum, count) => sum + (parseInt(count) || 0), 0);
};

/**
 * Format số tiền VND
 * @param {number} amount - Số tiền
 * @returns {string} "1,000,000 ₫"
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount || 0);
};

/**
 * Format số tiền ngắn gọn
 * @param {number} amount - Số tiền
 * @returns {string} "50M", "1.5B"
 */
export const formatCurrencyShort = (amount) => {
  const num = amount || 0;
  if (num >= 1000000000) {
    return `${(num / 1000000000).toFixed(1).replace(/\.0$/, '')}B`;
  }
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(0)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(0)}K`;
  }
  return num.toString();
};

/**
 * Format phần trăm
 * @param {number} rate - 0.10
 * @returns {string} "10%"
 */
export const formatPercent = (rate) => {
  const r = rate || 0;
  return `${(r * 100).toFixed(r % 0.01 === 0 ? 0 : 1)}%`;
};

/**
 * Lấy payment schedule display name
 * @param {string} schedule - 'monthly', 'biweekly', 'weekly'
 * @returns {string}
 */
export const getPaymentScheduleName = (schedule) => {
  return PAYMENT_CONFIG.schedules[schedule]?.name || 'Hàng tháng';
};

/**
 * Kiểm tra có cần downgrade không (cuối tháng)
 * @param {string} currentTier - Tier hiện tại
 * @param {number} monthlySales - Doanh số tháng
 * @returns {Object} { shouldDowngrade, newTier, minRequired }
 */
export const checkDowngradeCondition = (currentTier, monthlySales) => {
  if (currentTier === 'bronze') {
    return { shouldDowngrade: false, newTier: 'bronze', minRequired: 0 };
  }

  const currentConfig = CTV_TIER_CONFIG[currentTier];
  const minRequired = currentConfig.threshold * TIER_EVALUATION.downgrade.minMonthlyPercentage;
  const sales = monthlySales || 0;

  if (sales < minRequired) {
    const currentIndex = CTV_TIER_ORDER.indexOf(currentTier);
    const newTier = CTV_TIER_ORDER[currentIndex - 1];
    return { shouldDowngrade: true, newTier, minRequired };
  }

  return { shouldDowngrade: false, newTier: currentTier, minRequired };
};

// ============================================================
// TOOLTIPS
// ============================================================
export const TOOLTIPS = {
  commission: {
    digital: 'Hoa hồng cho sản phẩm số như khóa học, ebook, subscription',
    physical: 'Hoa hồng cho sản phẩm vật lý như đá phong thủy, trang sức',
    subAffiliate: 'Hoa hồng nhận được khi đối tác bạn giới thiệu tạo ra doanh số',
  },
  tier: {
    threshold: 'Tổng doanh số tích lũy cần đạt để lên tier này',
    upgrade: 'Tier được cập nhật tự động mỗi tuần (Thứ 2)',
    downgrade: 'Nếu doanh số tháng < 10% ngưỡng, sẽ giảm tier vào cuối tháng',
  },
  payment: {
    schedule: 'Lịch thanh toán hoa hồng phụ thuộc vào tier của bạn',
    minWithdrawal: 'Số tiền tối thiểu để rút là 100,000 VND',
  },
  kol: {
    requirements: 'Cần có 20,000+ followers để đăng ký KOL (không có ngoại lệ)',
    verification: 'KOL cần xác minh qua social profile links',
  },
};

// ============================================================
// EXPORT DEFAULT
// ============================================================
export default {
  // Roles
  PARTNERSHIP_ROLES,
  ROLE_DISPLAY,
  // CTV
  CTV_TIERS,
  CTV_TIER_ORDER,
  CTV_TIER_CONFIG,
  // KOL
  KOL_CONFIG,
  // Products
  PRODUCT_TYPES,
  // Payment
  PAYMENT_CONFIG,
  // Application
  APPLICATION_CONFIG,
  APPLICATION_STATUS,
  // Status
  WITHDRAWAL_STATUS,
  COMMISSION_STATUS,
  // Notification
  NOTIFICATION_TYPES,
  // Tier Evaluation
  TIER_EVALUATION,
  // Tooltips
  TOOLTIPS,
  // Helper functions
  isDigitalProduct,
  getTierConfig,
  getCommissionRate,
  getSubAffiliateRate,
  determineTierByTotalSales,
  calculateTierProgress,
  formatTierDisplay,
  checkKOLEligibility,
  calculateTotalFollowers,
  formatCurrency,
  formatCurrencyShort,
  formatPercent,
  getPaymentScheduleName,
  checkDowngradeCondition,
};
