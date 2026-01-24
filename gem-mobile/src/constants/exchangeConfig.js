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
    color: '#F0B90B',
    bgColor: 'rgba(240, 185, 11, 0.15)',
    description: 'San giao dich lon nhat the gioi voi thanh khoan cao nhat',
    features: [
      'San lon nhat the gioi',
      'Thanh khoan cao nhat',
      'Nhieu cap giao dich',
      'P2P ho tro VND',
      'Giam 20% phi khi dang ky qua GEM',
    ],
    depositMethods: [
      {
        id: 'p2p',
        name: 'P2P (VND → USDT)',
        recommended: true,
        description: 'Mua USDT bang VND truc tiep tu nguoi ban',
        steps: [
          'Mo Binance app → P2P Trading',
          'Chon Buy USDT, thanh toan VND',
          'Chon nguoi ban uy tin (completion rate > 95%)',
          'Chuyen khoan va xac nhan',
        ],
      },
      {
        id: 'card',
        name: 'The Visa/Mastercard',
        recommended: false,
        description: 'Phi cao hon nhung nhanh chong',
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
    color: '#00D4AA',
    bgColor: 'rgba(0, 212, 170, 0.15)',
    description: 'San giao dich Viet Nam, ho tro tieng Viet va nap/rut VND truc tiep',
    features: [
      'San Viet Nam 100%',
      'Ho tro tieng Viet',
      'Nap/rut VND truc tiep',
      'Ho tro 24/7 tieng Viet',
      'Giam 15% phi khi dang ky qua GEM',
    ],
    depositMethods: [
      {
        id: 'bank',
        name: 'Chuyen khoan ngan hang',
        recommended: true,
        description: 'Nap VND truc tiep tu ngan hang Viet Nam',
        steps: [
          'Dang nhap Nami → Vi → Nap tien',
          'Chon ngan hang va nhap so tien',
          'Chuyen khoan theo thong tin',
          'Tien se vao tai khoan trong 5-15 phut',
        ],
      },
      {
        id: 'momo',
        name: 'Vi MoMo',
        recommended: false,
        description: 'Nap nhanh qua vi dien tu',
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
    color: '#000000',
    bgColor: 'rgba(0, 0, 0, 0.15)',
    description: 'San giao dich top 3 the gioi voi cong cu giao dich chuyen nghiep',
    features: [
      'Top 3 the gioi',
      'Copy trading tot',
      'Giao dien than thien',
      'P2P ho tro VND',
      'Giam 20% phi khi dang ky qua GEM',
    ],
    depositMethods: [
      {
        id: 'p2p',
        name: 'P2P (VND → USDT)',
        recommended: true,
        description: 'Mua USDT bang VND',
      },
      {
        id: 'card',
        name: 'The Visa/Mastercard',
        recommended: false,
        description: 'Nap nhanh bang the',
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
    color: '#F7A600',
    bgColor: 'rgba(247, 166, 0, 0.15)',
    description: 'San chuyen ve Futures voi leverage cao va thanh khoan tot',
    features: [
      'Chuyen ve Futures',
      'Leverage len toi 100x',
      'Giao dich nhanh',
      'P2P ho tro VND',
      'Giam 20% phi khi dang ky qua GEM',
    ],
    depositMethods: [
      {
        id: 'p2p',
        name: 'P2P (VND → USDT)',
        recommended: true,
        description: 'Mua USDT bang VND',
      },
      {
        id: 'crypto',
        name: 'Chuyen crypto tu san khac',
        recommended: false,
        description: 'Neu da co crypto o san khac',
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
    label: 'Dang cho dang ky',
    color: '#9CA3AF',
    icon: 'Clock',
  },
  registered: {
    label: 'Da dang ky',
    color: '#3B82F6',
    icon: 'UserCheck',
  },
  kyc_verified: {
    label: 'Da KYC',
    color: '#8B5CF6',
    icon: 'Shield',
  },
  deposited: {
    label: 'Da nap tien',
    color: '#10B981',
    icon: 'Wallet',
  },
  active: {
    label: 'Dang hoat dong',
    color: '#22C55E',
    icon: 'Activity',
  },
  disconnected: {
    label: 'Da ngat ket noi',
    color: '#EF4444',
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
    title: 'San sang trade that chua?',
    message: 'Ban da dang ky {{exchange}} thanh cong! Nap tien de bat dau trade voi cac pattern chat luong.',
    cta: 'Huong dan nap tien',
    icon: 'Wallet',
  },
  winning_streak: {
    title: 'Xuay sac! {{streak}} wins lien tiep!',
    message: 'Ban dang co phong do tot! Nen tang trading that de tan dung cac pattern nay.',
    cta: 'Nap tien {{exchange}}',
    icon: 'TrendingUp',
  },
  high_grade_pattern: {
    title: 'Pattern {{grade}} xuat hien!',
    message: '{{pattern}} vua xuat hien - day la co hoi tot de vao lenh. Nap tien de khong bo lo!',
    cta: 'Nap tien ngay',
    icon: 'Zap',
  },
  first_time_scanner: {
    title: 'Chao mung den GEM Scanner!',
    message: 'De trade cac pattern ban tim duoc, can co tai khoan san. Dang ky de nhan uu dai!',
    cta: 'Dang ky san',
    icon: 'Gift',
  },
  paper_profit_milestone: {
    title: 'Loi nhuan paper: {{profit}} USDT!',
    message: 'Ban da dat muc loi nhuan tot trong paper trading. Thoi diem tot de trade that!',
    cta: 'Bat dau trade that',
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
    binance: 'San giao dich lon nhat the gioi, thanh khoan cao, nhieu coin',
    nami: 'San Viet Nam, nap/rut VND truc tiep, ho tro tieng Viet 24/7',
    okx: 'Top 3 the gioi, copy trading tot, giao dien de dung',
    bybit: 'Chuyen ve Futures, leverage cao, giao dich nhanh',
  },

  // API connection
  api: {
    apiKey: 'Tao API key tai {{exchange}} → Security → API Management',
    secretKey: 'Secret key chi hien thi 1 lan khi tao, luu an toan',
    permissions: 'Chi can quyen "Read" va "Trade". KHONG cho quyen "Withdraw"!',
    security: 'API key duoc ma hoa truoc khi luu. GEM khong the rut tien tu tai khoan cua ban.',
    balance: 'So du duoc cap nhat moi 5 phut. Bam Refresh de cap nhat ngay.',
  },

  // Deposit
  deposit: {
    p2p: 'Mua USDT bang VND tu nguoi ban truc tiep tren san',
    recommended: 'Phuong thuc duoc khuyen nghi vi an toan va phi thap',
    kyc: 'KYC giup nang han muc giao dich va bao mat tai khoan',
  },

  // Commission
  commission: {
    discount: 'Ban duoc giam phi giao dich khi dang ky qua link GEM',
    gemEarns: 'GEM nhan hoa hong tu san khi ban giao dich, khong mat phi cua ban',
  },

  // Prompts
  prompts: {
    winStreak: 'Nhac nho khi ban co chuoi thang trong paper trading',
    highGrade: 'Nhac nho khi xuat hien pattern A/A+ chat luong cao',
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
    errors.push('API Key khong dung dinh dang');
  }

  if (!patterns.secretKey.test(secretKey)) {
    errors.push('Secret Key khong dung dinh dang');
  }

  if (exchange === 'okx' && patterns.passphrase && !patterns.passphrase.test(passphrase || '')) {
    errors.push('Passphrase khong dung dinh dang (6-32 ky tu)');
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
    title: 'Chon san giao dich',
    description: 'Chon san phu hop voi ban',
  },
  {
    id: 'info',
    title: 'Thong tin san',
    description: 'Xem uu dai va tinh nang',
  },
  {
    id: 'register',
    title: 'Dang ky tai khoan',
    description: 'Mo link va dang ky',
  },
  {
    id: 'confirm',
    title: 'Xac nhan',
    description: 'Nhap email da dang ky',
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
