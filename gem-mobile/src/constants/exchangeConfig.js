/**
 * ============================================================
 * GEM EXCHANGE AFFILIATE CONSTANTS
 * ============================================================
 *
 * Configuration for Exchange Affiliate Integration:
 * - Binance, Nami, OKX, Bybit
 * - Deposit prompts (smart reminders)
 * - API connection (TIER 2+)
 *
 * Access:
 * - All tiers: View exchanges, register via affiliate link
 * - TIER 2+: Connect API, view balances
 * - TIER 3: Direct trade (future)
 *
 * ============================================================
 */

// ============================================================
// EXCHANGE IDs
// ============================================================
export const EXCHANGE_IDS = {
  BINANCE: 'binance',
  NAMI: 'nami',
  OKX: 'okx',
  BYBIT: 'bybit',
};

// ============================================================
// EXCHANGE CONFIGS (Local fallback - DB is primary source)
// ============================================================
export const EXCHANGE_CONFIGS = {
  binance: {
    id: 'binance',
    displayName: 'Binance',
    affiliateLink: 'https://accounts.binance.com/register?ref=1124799179',
    refCode: '1124799179',
    color: '#6A5BFF',
    bgColor: 'rgba(106, 91, 255, 0.15)',
    description: 'Sàn giao dịch lớn nhất thế giới với thanh khoản cao nhất',
    features: [
      'Sàn lớn nhất thế giới',
      'Thanh khoản cao nhất',
      'Nhiều cặp giao dịch',
      'P2P hỗ trợ VND',
      'Giảm 20% phí khi đăng ký qua GEM',
    ],
    depositMethods: [
      {
        id: 'p2p',
        name: 'P2P (VND → USDT)',
        recommended: true,
        description: 'Mua USDT bằng VND trực tiếp từ người bán',
        steps: [
          'Mở Binance app → P2P Trading',
          'Chọn Buy USDT, thanh toán VND',
          'Chọn người bán uy tín (completion rate > 95%)',
          'Chuyển khoản và xác nhận',
        ],
      },
      {
        id: 'card',
        name: 'Thẻ Visa/Mastercard',
        recommended: false,
        description: 'Phí cao hơn nhưng nhanh chóng',
      },
    ],
    commission: {
      spot: 0.1, // 10%
      futures: 0.1,
      userDiscount: 0.2, // 20% discount
    },
    isRecommended: true,
    supportsVND: true,
    apiConnectionEnabled: true,
    minTierForAPI: 2,
    displayOrder: 1,
  },
  nami: {
    id: 'nami',
    displayName: 'Nami Exchange',
    affiliateLink: 'https://nami.exchange/ref/gem2025',
    refCode: 'gem2025',
    color: '#3AF7A6',
    bgColor: 'rgba(58, 247, 166, 0.15)',
    description: 'Sàn giao dịch Việt Nam, hỗ trợ tiếng Việt và nạp/rút VND trực tiếp',
    features: [
      'Sàn Việt Nam 100%',
      'Hỗ trợ tiếng Việt',
      'Nạp/rút VND trực tiếp',
      'Hỗ trợ 24/7 tiếng Việt',
      'Giảm 15% phí khi đăng ký qua GEM',
    ],
    depositMethods: [
      {
        id: 'bank',
        name: 'Chuyển khoản ngân hàng',
        recommended: true,
        description: 'Nạp VND trực tiếp từ ngân hàng Việt Nam',
        steps: [
          'Đăng nhập Nami → Ví → Nạp tiền',
          'Chọn ngân hàng và nhập số tiền',
          'Chuyển khoản theo thông tin',
          'Tiền sẽ vào tài khoản trong 5-15 phút',
        ],
      },
      {
        id: 'momo',
        name: 'Ví MoMo',
        recommended: false,
        description: 'Nạp nhanh qua ví điện tử',
      },
    ],
    commission: {
      spot: 0.15,
      futures: 0.15,
      userDiscount: 0.15,
    },
    isRecommended: false,
    supportsVND: true,
    apiConnectionEnabled: true,
    minTierForAPI: 2,
    displayOrder: 2,
  },
  okx: {
    id: 'okx',
    displayName: 'OKX',
    affiliateLink: 'https://www.okx.com/join/GEMRAL2025',
    refCode: 'GEMRAL2025',
    color: '#00F0FF',
    bgColor: 'rgba(0, 240, 255, 0.15)',
    description: 'Sàn giao dịch top 3 thế giới với công cụ giao dịch chuyên nghiệp',
    features: [
      'Top 3 thế giới',
      'Copy trading tốt',
      'Giao diện thân thiện',
      'P2P hỗ trợ VND',
      'Giảm 20% phí khi đăng ký qua GEM',
    ],
    depositMethods: [
      {
        id: 'p2p',
        name: 'P2P (VND → USDT)',
        recommended: true,
        description: 'Mua USDT bằng VND',
      },
      {
        id: 'card',
        name: 'Thẻ Visa/Mastercard',
        recommended: false,
        description: 'Nạp nhanh bằng thẻ',
      },
    ],
    commission: {
      spot: 0.1,
      futures: 0.1,
      userDiscount: 0.2,
    },
    isRecommended: false,
    supportsVND: true,
    apiConnectionEnabled: true,
    minTierForAPI: 2,
    displayOrder: 3,
  },
  bybit: {
    id: 'bybit',
    displayName: 'Bybit',
    affiliateLink: 'https://www.bybit.com/invite?ref=GEMRAL',
    refCode: 'GEMRAL',
    color: '#FFBD59',
    bgColor: 'rgba(255, 189, 89, 0.15)',
    description: 'Sàn chuyên về Futures với leverage cao và thanh khoản tốt',
    features: [
      'Chuyên về Futures',
      'Leverage lên tới 100x',
      'Giao dịch nhanh',
      'P2P hỗ trợ VND',
      'Giảm 20% phí khi đăng ký qua GEM',
    ],
    depositMethods: [
      {
        id: 'p2p',
        name: 'P2P (VND → USDT)',
        recommended: true,
        description: 'Mua USDT bằng VND',
      },
      {
        id: 'crypto',
        name: 'Chuyển crypto từ sàn khác',
        recommended: false,
        description: 'Nếu đã có crypto ở sàn khác',
      },
    ],
    commission: {
      spot: 0.1,
      futures: 0.1,
      userDiscount: 0.2,
    },
    isRecommended: false,
    supportsVND: true,
    apiConnectionEnabled: true,
    minTierForAPI: 2,
    displayOrder: 4,
  },
};

// ============================================================
// EXCHANGE STATUS
// ============================================================
export const EXCHANGE_ACCOUNT_STATUS = {
  PENDING_SIGNUP: 'pending_signup',
  REGISTERED: 'registered',
  KYC_VERIFIED: 'kyc_verified',
  DEPOSITED: 'deposited',
  ACTIVE: 'active',
  DISCONNECTED: 'disconnected',
};

export const EXCHANGE_STATUS_DISPLAY = {
  pending_signup: {
    label: 'Đang chờ đăng ký',
    color: '#9CA3AF',
    icon: 'Clock',
  },
  registered: {
    label: 'Đã đăng ký',
    color: '#6A5BFF',
    icon: 'UserCheck',
  },
  kyc_verified: {
    label: 'Đã KYC',
    color: '#6A5BFF',
    icon: 'Shield',
  },
  deposited: {
    label: 'Đã nạp tiền',
    color: '#3AF7A6',
    icon: 'Wallet',
  },
  active: {
    label: 'Đang hoạt động',
    color: '#3AF7A6',
    icon: 'Activity',
  },
  disconnected: {
    label: 'Đã ngắt kết nối',
    color: '#FF6B6B',
    icon: 'Unlink',
  },
};

// ============================================================
// DEPOSIT PROMPT CONFIG
// ============================================================
export const DEPOSIT_PROMPT_CONFIG = {
  // Delay before showing after_signup prompt (24 hours)
  AFTER_SIGNUP_DELAY_MS: 24 * 60 * 60 * 1000,
  AFTER_SIGNUP_DELAY_MINUTES: 24 * 60,

  // Win streak trigger threshold
  MIN_WIN_STREAK: 3,

  // Pattern grade trigger (A or A+)
  MIN_PATTERN_GRADES: ['A', 'A+'],

  // Rate limiting
  MIN_PROMPT_INTERVAL_MS: 4 * 60 * 60 * 1000, // 4 hours
  MAX_PROMPTS_PER_DAY: 2,

  // Prompt expiration
  PROMPT_EXPIRATION_DAYS: 7,
};

export const DEPOSIT_PROMPT_TYPES = {
  AFTER_SIGNUP: 'after_signup',
  WINNING_STREAK: 'winning_streak',
  HIGH_GRADE_PATTERN: 'high_grade_pattern',
  FIRST_TIME_SCANNER: 'first_time_scanner',
  PAPER_PROFIT_MILESTONE: 'paper_profit_milestone',
  MANUAL: 'manual',
};

export const DEPOSIT_PROMPT_CONTENT = {
  after_signup: {
    title: 'Sẵn sàng trade thật chưa?',
    message: 'Bạn đã đăng ký {{exchange}} thành công! Nạp tiền để bắt đầu trade với các pattern chất lượng.',
    cta: 'Hướng dẫn nạp tiền',
    icon: 'Wallet',
  },
  winning_streak: {
    title: 'Xuất sắc! {{streak}} wins liên tiếp!',
    message: 'Bạn đang có phong độ tốt! Nên trade thật để tận dụng các pattern này.',
    cta: 'Nạp tiền {{exchange}}',
    icon: 'TrendingUp',
  },
  high_grade_pattern: {
    title: 'Pattern {{grade}} xuất hiện!',
    message: '{{pattern}} vừa xuất hiện - đây là cơ hội tốt để vào lệnh. Nạp tiền để không bỏ lỡ!',
    cta: 'Nạp tiền ngay',
    icon: 'Zap',
  },
  first_time_scanner: {
    title: 'Chào mừng đến GEM Scanner!',
    message: 'Để trade các pattern bạn tìm được, cần có tài khoản sàn. Đăng ký để nhận ưu đãi!',
    cta: 'Đăng ký sàn',
    icon: 'Gift',
  },
  paper_profit_milestone: {
    title: 'Lợi nhuận paper: {{profit}} USDT!',
    message: 'Bạn đã đạt mức lợi nhuận tốt trong paper trading. Thời điểm tốt để trade thật!',
    cta: 'Bắt đầu trade thật',
    icon: 'DollarSign',
  },
};

// ============================================================
// API CONNECTION CONFIG
// ============================================================
export const API_CONNECTION_CONFIG = {
  // Minimum tier required to connect API
  MIN_TIER: 2,

  // Balance cache duration (5 minutes)
  BALANCE_CACHE_DURATION_MS: 5 * 60 * 1000,

  // Required permissions - NEVER allow withdraw
  ALLOWED_PERMISSIONS: ['read', 'spot_trade', 'futures_trade'],
  FORBIDDEN_PERMISSIONS: ['withdraw', 'universal_transfer', 'internal_transfer'],

  // API key format validation
  API_KEY_PATTERNS: {
    binance: {
      apiKey: /^[A-Za-z0-9]{64}$/,
      secretKey: /^[A-Za-z0-9]{64}$/,
    },
    okx: {
      apiKey: /^[A-Za-z0-9-]{36}$/,
      secretKey: /^[A-Za-z0-9]{32}$/,
      passphrase: /^.{6,32}$/,
    },
    bybit: {
      apiKey: /^[A-Za-z0-9]{18}$/,
      secretKey: /^[A-Za-z0-9]{36}$/,
    },
    nami: {
      apiKey: /^[A-Za-z0-9]{32}$/,
      secretKey: /^[A-Za-z0-9]{64}$/,
    },
  },

  // Tier-based features
  TIER_FEATURES: {
    2: ['balance_view', 'trade_history'],
    3: ['balance_view', 'trade_history', 'direct_trade'],
  },
};

export const API_TEST_STATUS = {
  SUCCESS: 'success',
  FAILED: 'failed',
  PENDING: 'pending',
};

// ============================================================
// EVENT TYPES (for tracking)
// ============================================================
export const AFFILIATE_EVENT_TYPES = {
  LINK_CLICKED: 'link_clicked',
  SIGNUP_STARTED: 'signup_started',
  SIGNUP_CONFIRMED: 'signup_confirmed',
  KYC_STARTED: 'kyc_started',
  KYC_VERIFIED: 'kyc_verified',
  FIRST_DEPOSIT: 'first_deposit',
  DEPOSIT: 'deposit',
  FIRST_TRADE: 'first_trade',
  TRADE: 'trade',
  API_CONNECTED: 'api_connected',
  API_DISCONNECTED: 'api_disconnected',
  PROMPT_SHOWN: 'prompt_shown',
  PROMPT_CLICKED: 'prompt_clicked',
  PROMPT_DISMISSED: 'prompt_dismissed',
};

// ============================================================
// SOURCE SCREENS (for attribution)
// ============================================================
export const EXCHANGE_SOURCE_SCREENS = {
  SCANNER: 'scanner',
  PROFILE: 'profile',
  PAPER_TRADE: 'paper_trade',
  ONBOARDING: 'onboarding',
  EXCHANGE_LIST: 'exchange_list',
  DEPOSIT_PROMPT: 'deposit_prompt',
  PUSH_NOTIFICATION: 'push_notification',
};

// ============================================================
// TOOLTIPS
// ============================================================
export const EXCHANGE_TOOLTIPS = {
  // Exchange selection
  exchange: {
    binance: 'Sàn giao dịch lớn nhất thế giới, thanh khoản cao, nhiều coin',
    nami: 'Sàn Việt Nam, nạp/rút VND trực tiếp, hỗ trợ tiếng Việt 24/7',
    okx: 'Top 3 thế giới, copy trading tốt, giao diện dễ dùng',
    bybit: 'Chuyên về Futures, leverage cao, giao dịch nhanh',
  },

  // API connection
  api: {
    apiKey: 'Tạo API key tại {{exchange}} → Security → API Management',
    secretKey: 'Secret key chỉ hiển thị 1 lần khi tạo, lưu an toàn',
    permissions: 'Chỉ cần quyền "Read" và "Trade". KHÔNG cho quyền "Withdraw"!',
    security: 'API key được mã hóa trước khi lưu. GEM không thể rút tiền từ tài khoản của bạn.',
    balance: 'Số dư được cập nhật mỗi 5 phút. Bấm Refresh để cập nhật ngay.',
  },

  // Deposit
  deposit: {
    p2p: 'Mua USDT bằng VND từ người bán trực tiếp trên sàn',
    recommended: 'Phương thức được khuyên nghị vì an toàn và phí thấp',
    kyc: 'KYC giúp nâng hạn mức giao dịch và bảo mật tài khoản',
  },

  // Commission
  commission: {
    discount: 'Bạn được giảm phí giao dịch khi đăng ký qua link GEM',
    gemEarns: 'GEM nhận hoa hồng từ sàn khi bạn giao dịch, không mất phí của bạn',
  },

  // Prompts
  prompts: {
    winStreak: 'Nhắc nhở khi bạn có chuỗi thắng trong paper trading',
    highGrade: 'Nhắc nhở khi xuất hiện pattern A/A+ chất lượng cao',
  },
};

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Get exchange config by ID
 * @param {string} exchangeId - Exchange ID
 * @returns {Object} Exchange config
 */
export const getExchangeConfig = (exchangeId) => {
  return EXCHANGE_CONFIGS[exchangeId] || null;
};

/**
 * Get all active exchanges sorted by display order
 * @returns {Array} Array of exchange configs
 */
export const getAllExchanges = () => {
  return Object.values(EXCHANGE_CONFIGS).sort((a, b) => a.displayOrder - b.displayOrder);
};

/**
 * Get recommended exchange
 * @returns {Object} Recommended exchange config
 */
export const getRecommendedExchange = () => {
  return Object.values(EXCHANGE_CONFIGS).find(e => e.isRecommended) || EXCHANGE_CONFIGS.binance;
};

/**
 * Get exchanges that support VND
 * @returns {Array} Array of exchange configs
 */
export const getVNDExchanges = () => {
  return Object.values(EXCHANGE_CONFIGS).filter(e => e.supportsVND);
};

/**
 * Check if user tier can connect API
 * @param {number} userTier - User's tier (0-3)
 * @returns {boolean}
 */
export const canConnectAPI = (userTier) => {
  return userTier >= API_CONNECTION_CONFIG.MIN_TIER;
};

/**
 * Get API features for tier
 * @param {number} userTier - User's tier
 * @returns {Array} Array of feature keys
 */
export const getAPIFeatures = (userTier) => {
  return API_CONNECTION_CONFIG.TIER_FEATURES[userTier] || [];
};

/**
 * Validate API key format
 * @param {string} exchange - Exchange ID
 * @param {string} apiKey - API key
 * @param {string} secretKey - Secret key
 * @param {string} [passphrase] - Passphrase (OKX only)
 * @returns {Object} { valid, errors }
 */
export const validateAPIKeyFormat = (exchange, apiKey, secretKey, passphrase) => {
  const patterns = API_CONNECTION_CONFIG.API_KEY_PATTERNS[exchange];
  if (!patterns) {
    return { valid: false, errors: ['Exchange not supported'] };
  }

  const errors = [];

  if (!patterns.apiKey.test(apiKey)) {
    errors.push('API Key không đúng định dạng');
  }

  if (!patterns.secretKey.test(secretKey)) {
    errors.push('Secret Key không đúng định dạng');
  }

  if (exchange === 'okx' && patterns.passphrase && !patterns.passphrase.test(passphrase || '')) {
    errors.push('Passphrase không đúng định dạng (6-32 ký tự)');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Get status display info
 * @param {string} status - Account status
 * @returns {Object} { label, color, icon }
 */
export const getStatusDisplay = (status) => {
  return EXCHANGE_STATUS_DISPLAY[status] || EXCHANGE_STATUS_DISPLAY.pending_signup;
};

/**
 * Get deposit prompt content
 * @param {string} promptType - Prompt type
 * @param {Object} data - Data for interpolation
 * @returns {Object} { title, message, cta, icon }
 */
export const getPromptContent = (promptType, data = {}) => {
  const template = DEPOSIT_PROMPT_CONTENT[promptType] || DEPOSIT_PROMPT_CONTENT.after_signup;

  const interpolate = (str) => {
    return str.replace(/\{\{(\w+)\}\}/g, (match, key) => data[key] || match);
  };

  return {
    title: interpolate(template.title),
    message: interpolate(template.message),
    cta: interpolate(template.cta),
    icon: template.icon,
  };
};

/**
 * Check if should trigger deposit prompt for pattern
 * @param {string} grade - Pattern grade
 * @returns {boolean}
 */
export const shouldTriggerPatternPrompt = (grade) => {
  return DEPOSIT_PROMPT_CONFIG.MIN_PATTERN_GRADES.includes(grade);
};

/**
 * Check if should trigger deposit prompt for win streak
 * @param {number} streak - Current win streak
 * @returns {boolean}
 */
export const shouldTriggerWinStreakPrompt = (streak) => {
  return streak >= DEPOSIT_PROMPT_CONFIG.MIN_WIN_STREAK;
};

/**
 * Format exchange name with color badge
 * @param {string} exchangeId - Exchange ID
 * @returns {Object} { name, color, bgColor }
 */
export const formatExchangeBadge = (exchangeId) => {
  const config = getExchangeConfig(exchangeId);
  if (!config) return { name: exchangeId, color: '#9CA3AF', bgColor: 'rgba(156, 163, 175, 0.15)' };

  return {
    name: config.displayName,
    color: config.color,
    bgColor: config.bgColor,
  };
};

/**
 * Get affiliate link with tracking
 * @param {string} exchangeId - Exchange ID
 * @param {string} source - Source screen
 * @returns {string} Affiliate link
 */
export const getAffiliateLink = (exchangeId, source) => {
  const config = getExchangeConfig(exchangeId);
  if (!config) return '';

  // Base affiliate link - most exchanges already include ref code
  let link = config.affiliateLink;

  // Add UTM for tracking (if exchange supports it)
  if (source && !link.includes('utm_source')) {
    const separator = link.includes('?') ? '&' : '?';
    link += `${separator}utm_source=gem&utm_medium=app&utm_campaign=${source}`;
  }

  return link;
};

// ============================================================
// ONBOARDING STEPS
// ============================================================
export const EXCHANGE_ONBOARDING_STEPS = [
  {
    id: 'select',
    title: 'Chọn sàn giao dịch',
    description: 'Chọn sàn phù hợp với bạn',
  },
  {
    id: 'info',
    title: 'Thông tin sàn',
    description: 'Xem ưu đãi và tính năng',
  },
  {
    id: 'register',
    title: 'Đăng ký tài khoản',
    description: 'Mở link và đăng ký',
  },
  {
    id: 'confirm',
    title: 'Xác nhận',
    description: 'Nhập email đã đăng ký',
  },
];

// ============================================================
// EXPORT DEFAULT
// ============================================================
export default {
  // IDs
  EXCHANGE_IDS,
  // Configs
  EXCHANGE_CONFIGS,
  // Status
  EXCHANGE_ACCOUNT_STATUS,
  EXCHANGE_STATUS_DISPLAY,
  // Deposit prompts
  DEPOSIT_PROMPT_CONFIG,
  DEPOSIT_PROMPT_TYPES,
  DEPOSIT_PROMPT_CONTENT,
  // API connection
  API_CONNECTION_CONFIG,
  API_TEST_STATUS,
  // Events
  AFFILIATE_EVENT_TYPES,
  EXCHANGE_SOURCE_SCREENS,
  // Tooltips
  EXCHANGE_TOOLTIPS,
  // Onboarding
  EXCHANGE_ONBOARDING_STEPS,
  // Helper functions
  getExchangeConfig,
  getAllExchanges,
  getRecommendedExchange,
  getVNDExchanges,
  canConnectAPI,
  getAPIFeatures,
  validateAPIKeyFormat,
  getStatusDisplay,
  getPromptContent,
  shouldTriggerPatternPrompt,
  shouldTriggerWinStreakPrompt,
  formatExchangeBadge,
  getAffiliateLink,
};
