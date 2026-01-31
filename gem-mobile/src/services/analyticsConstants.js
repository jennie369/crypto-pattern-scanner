/**
 * Analytics Constants - Event Taxonomy
 * Admin Analytics Dashboard - GEM Platform
 *
 * Defines all event categories, names, and page mappings
 * for comprehensive tracking across the platform.
 */

// =====================================================
// EVENT CATEGORIES
// =====================================================

export const EVENT_CATEGORIES = {
  // Trading
  SCANNER: 'scanner',
  PAPER_TRADE: 'paper_trade',
  JOURNAL: 'journal',

  // Spiritual
  RITUAL: 'ritual',
  CHATBOT: 'chatbot',
  VISION_BOARD: 'vision_board',
  TAROT: 'tarot',
  ICHING: 'iching',

  // Social
  FORUM: 'forum',
  MESSAGES: 'messages',
  LIVESTREAM: 'livestream',

  // Commerce
  SHOP: 'shop',
  COURSES: 'courses',
  AFFILIATE: 'affiliate',

  // Account
  ACCOUNT: 'account',
  SETTINGS: 'settings',

  // Engagement
  NOTIFICATIONS: 'notifications',
  SEARCH: 'search',

  // System
  ERROR: 'error',
  PERFORMANCE: 'performance',
};

// =====================================================
// EVENT TYPES
// =====================================================

export const EVENT_TYPES = {
  PAGE_VIEW: 'page_view',
  ACTION: 'action',
  CLICK: 'click',
  SCAN: 'scan',
  PURCHASE: 'purchase',
  COMPLETE: 'complete',
  START: 'start',
  ERROR: 'error',
  SEARCH: 'search',
  SHARE: 'share',
};

// =====================================================
// EVENT NAMES BY CATEGORY
// =====================================================

export const EVENT_NAMES = {
  // Scanner events
  scanner: {
    SCAN_START: 'scan_start',
    SCAN_COMPLETE: 'scan_complete',
    PATTERN_DETECTED: 'pattern_detected',
    PATTERN_VIEW: 'pattern_view',
    PATTERN_TRADE: 'pattern_trade',
    FILTER_CHANGE: 'filter_change',
    TIMEFRAME_CHANGE: 'timeframe_change',
    SYMBOL_CHANGE: 'symbol_change',
    QUICK_SCAN: 'quick_scan',
    FULL_SCAN: 'full_scan',
    ZONE_DETECTED: 'zone_detected',
  },

  // Paper trade events
  paper_trade: {
    ORDER_PLACED: 'order_placed',
    ORDER_FILLED: 'order_filled',
    ORDER_CANCELLED: 'order_cancelled',
    POSITION_OPENED: 'position_opened',
    POSITION_CLOSED: 'position_closed',
    TP_HIT: 'tp_hit',
    SL_HIT: 'sl_hit',
    LIQUIDATION_WARNING: 'liquidation_warning',
  },

  // Ritual events
  ritual: {
    RITUAL_START: 'ritual_start',
    RITUAL_COMPLETE: 'ritual_complete',
    RITUAL_SKIP: 'ritual_skip',
    RITUAL_PAUSE: 'ritual_pause',
    RITUAL_RESUME: 'ritual_resume',
    STEP_COMPLETE: 'step_complete',
    STREAK_ACHIEVED: 'streak_achieved',
    REFLECTION_SAVED: 'reflection_saved',
    MOOD_RECORDED: 'mood_recorded',
  },

  // Chatbot events
  chatbot: {
    CONVERSATION_START: 'conversation_start',
    CONVERSATION_END: 'conversation_end',
    MESSAGE_SENT: 'message_sent',
    MESSAGE_RECEIVED: 'message_received',
    RATING_GIVEN: 'rating_given',
    WIDGET_CREATED: 'widget_created',
    QUICK_ACTION_USED: 'quick_action_used',
  },

  // Tarot events
  tarot: {
    READING_START: 'reading_start',
    READING_COMPLETE: 'reading_complete',
    CARD_DRAWN: 'card_drawn',
    SPREAD_SELECTED: 'spread_selected',
    INTERPRETATION_VIEWED: 'interpretation_viewed',
    READING_SAVED: 'reading_saved',
    READING_SHARED: 'reading_shared',
  },

  // I-Ching events
  iching: {
    READING_START: 'reading_start',
    READING_COMPLETE: 'reading_complete',
    COINS_THROWN: 'coins_thrown',
    HEXAGRAM_GENERATED: 'hexagram_generated',
    INTERPRETATION_VIEWED: 'interpretation_viewed',
    READING_SAVED: 'reading_saved',
  },

  // Vision Board events
  vision_board: {
    GOAL_CREATE: 'goal_create',
    GOAL_UPDATE: 'goal_update',
    GOAL_COMPLETE: 'goal_complete',
    GOAL_DELETE: 'goal_delete',
    HABIT_TRACK: 'habit_track',
    HABIT_COMPLETE: 'habit_complete',
    AFFIRMATION_VIEW: 'affirmation_view',
    AFFIRMATION_COMPLETE: 'affirmation_complete',
    WIDGET_INTERACT: 'widget_interact',
    JOURNAL_ENTRY: 'journal_entry',
    DAILY_SUMMARY: 'daily_summary',
  },

  // Forum events
  forum: {
    POST_VIEW: 'post_view',
    POST_CREATE: 'post_create',
    POST_EDIT: 'post_edit',
    POST_DELETE: 'post_delete',
    POST_LIKE: 'post_like',
    POST_UNLIKE: 'post_unlike',
    POST_COMMENT: 'post_comment',
    POST_SHARE: 'post_share',
    POST_SAVE: 'post_save',
    POST_BOOST: 'post_boost',
    GIFT_SEND: 'gift_send',
    FOLLOW_USER: 'follow_user',
    UNFOLLOW_USER: 'unfollow_user',
  },

  // Messages events
  messages: {
    CONVERSATION_OPEN: 'conversation_open',
    MESSAGE_SEND: 'message_send',
    MESSAGE_READ: 'message_read',
    CALL_START: 'call_start',
    CALL_END: 'call_end',
    VIDEO_CALL_START: 'video_call_start',
    VIDEO_CALL_END: 'video_call_end',
  },

  // Shop events
  shop: {
    PRODUCT_VIEW: 'product_view',
    PRODUCT_SEARCH: 'product_search',
    CATEGORY_VIEW: 'category_view',
    ADD_TO_CART: 'add_to_cart',
    REMOVE_FROM_CART: 'remove_from_cart',
    UPDATE_CART: 'update_cart',
    CHECKOUT_START: 'checkout_start',
    CHECKOUT_COMPLETE: 'checkout_complete',
    PURCHASE_COMPLETE: 'purchase_complete',
    PROMO_CODE_APPLIED: 'promo_code_applied',
    WISHLIST_ADD: 'wishlist_add',
    WISHLIST_REMOVE: 'wishlist_remove',
  },

  // Course events
  courses: {
    COURSE_VIEW: 'course_view',
    COURSE_ENROLL: 'course_enroll',
    LESSON_START: 'lesson_start',
    LESSON_COMPLETE: 'lesson_complete',
    LESSON_PROGRESS: 'lesson_progress',
    QUIZ_START: 'quiz_start',
    QUIZ_SUBMIT: 'quiz_submit',
    QUIZ_PASS: 'quiz_pass',
    QUIZ_FAIL: 'quiz_fail',
    CERTIFICATE_EARNED: 'certificate_earned',
    COURSE_REVIEW: 'course_review',
  },

  // Affiliate events
  affiliate: {
    DASHBOARD_VIEW: 'dashboard_view',
    LINK_GENERATE: 'link_generate',
    LINK_COPY: 'link_copy',
    LINK_SHARE: 'link_share',
    REFERRAL_VISIT: 'referral_visit',
    REFERRAL_SIGNUP: 'referral_signup',
    REFERRAL_PURCHASE: 'referral_purchase',
    COMMISSION_VIEW: 'commission_view',
    WITHDRAWAL_REQUEST: 'withdrawal_request',
  },

  // Account events
  account: {
    PROFILE_VIEW: 'profile_view',
    PROFILE_EDIT: 'profile_edit',
    AVATAR_CHANGE: 'avatar_change',
    TIER_VIEW: 'tier_view',
    TIER_UPGRADE: 'tier_upgrade',
    WALLET_VIEW: 'wallet_view',
    SUBSCRIPTION_VIEW: 'subscription_view',
  },

  // Settings events
  settings: {
    SETTINGS_VIEW: 'settings_view',
    NOTIFICATION_TOGGLE: 'notification_toggle',
    PRIVACY_CHANGE: 'privacy_change',
    LANGUAGE_CHANGE: 'language_change',
    THEME_CHANGE: 'theme_change',
    LOGOUT: 'logout',
    DELETE_ACCOUNT: 'delete_account',
  },

  // Notifications events
  notifications: {
    NOTIFICATION_VIEW: 'notification_view',
    NOTIFICATION_CLICK: 'notification_click',
    NOTIFICATION_DISMISS: 'notification_dismiss',
    NOTIFICATION_SETTINGS: 'notification_settings',
  },

  // Search events
  search: {
    SEARCH_QUERY: 'search_query',
    SEARCH_RESULT_CLICK: 'search_result_click',
    SEARCH_FILTER: 'search_filter',
    SEARCH_NO_RESULTS: 'search_no_results',
  },
};

// =====================================================
// PAGE NAMES
// =====================================================

export const PAGE_NAMES = {
  // Main tabs
  HOME: 'HomeScreen',
  SHOP: 'ShopScreen',
  SCANNER: 'ScannerScreen',
  GEM_MASTER: 'GemMasterScreen',
  NOTIFICATIONS: 'NotificationsScreen',
  ACCOUNT: 'AccountScreen',

  // Trading
  PATTERN_DETAIL: 'PatternDetailScreen',
  PAPER_TRADE: 'PaperTradeScreen',
  PAPER_TRADE_DETAIL: 'PaperTradeDetailScreen',
  TRADING_JOURNAL: 'TradingJournalScreen',
  JOURNAL_ENTRY: 'JournalEntryScreen',

  // Spiritual / Divination
  TAROT: 'TarotReadingScreen',
  ICHING: 'IChingScreen',
  TUVI: 'TuViScreen',

  // Rituals
  VISION_BOARD: 'VisionBoardScreen',
  CALENDAR: 'CalendarScreen',
  RITUALS_LIST: 'RitualsScreen',
  RITUAL_DETAIL: 'RitualDetailScreen',
  HEART_EXPANSION: 'HeartExpansionRitual',
  GRATITUDE_FLOW: 'GratitudeFlowRitual',
  CLEANSING_BREATH: 'CleansingBreathRitual',
  WATER_MANIFEST: 'WaterManifestRitual',
  LETTER_UNIVERSE: 'LetterToUniverseRitual',
  BURN_RELEASE: 'BurnReleaseRitual',
  STAR_WISH: 'StarWishRitual',
  CRYSTAL_HEALING: 'CrystalHealingRitual',

  // Vision Board
  GOALS: 'GoalsScreen',
  HABITS: 'HabitsScreen',
  AFFIRMATIONS: 'AffirmationsScreen',

  // Forum
  FORUM: 'ForumScreen',
  POST_DETAIL: 'PostDetailScreen',
  CREATE_POST: 'CreatePostScreen',
  USER_PROFILE: 'UserProfileScreen',

  // Messages
  MESSAGES_LIST: 'ConversationsListScreen',
  CHAT: 'ChatScreen',
  CONVERSATION_INFO: 'ConversationInfoScreen',

  // Shop
  SHOP_HOME: 'ShopScreen',
  PRODUCT_DETAIL: 'ProductDetailScreen',
  CART: 'CartScreen',
  CHECKOUT: 'CheckoutScreen',
  ORDER_HISTORY: 'OrderHistoryScreen',
  ORDER_DETAIL: 'OrderDetailScreen',

  // Courses
  COURSES_LIST: 'CoursesScreen',
  COURSE_DETAIL: 'CourseDetailScreen',
  LESSON: 'LessonScreen',
  QUIZ: 'QuizScreen',
  CERTIFICATE: 'CertificateScreen',

  // Affiliate
  AFFILIATE_DASHBOARD: 'AffiliateDashboardScreen',
  REFERRAL_LINKS: 'ReferralLinksScreen',
  COMMISSION_HISTORY: 'CommissionHistoryScreen',
  WITHDRAWAL: 'WithdrawalScreen',

  // Account & Settings
  PROFILE: 'ProfileScreen',
  EDIT_PROFILE: 'EditProfileScreen',
  SETTINGS: 'SettingsScreen',
  WALLET: 'WalletScreen',
  SUBSCRIPTION: 'SubscriptionScreen',
  HELP_CENTER: 'HelpCenterScreen',

  // Admin
  ADMIN_DASHBOARD: 'AdminDashboardScreen',
  ADMIN_ANALYTICS: 'AnalyticsHomeScreen',
  ADMIN_USERS: 'UserManagementScreen',
  ADMIN_CONTENT: 'ContentDashboardScreen',
};

// =====================================================
// PAGE CATEGORIES
// =====================================================

export const PAGE_CATEGORIES = {
  // Trading pages
  [PAGE_NAMES.SCANNER]: 'trading',
  [PAGE_NAMES.PATTERN_DETAIL]: 'trading',
  [PAGE_NAMES.PAPER_TRADE]: 'trading',
  [PAGE_NAMES.PAPER_TRADE_DETAIL]: 'trading',
  [PAGE_NAMES.TRADING_JOURNAL]: 'trading',
  [PAGE_NAMES.JOURNAL_ENTRY]: 'trading',

  // Spiritual pages
  [PAGE_NAMES.GEM_MASTER]: 'spiritual',
  [PAGE_NAMES.TAROT]: 'spiritual',
  [PAGE_NAMES.ICHING]: 'spiritual',
  [PAGE_NAMES.TUVI]: 'spiritual',
  [PAGE_NAMES.VISION_BOARD]: 'spiritual',
  [PAGE_NAMES.CALENDAR]: 'spiritual',
  [PAGE_NAMES.RITUALS_LIST]: 'spiritual',
  [PAGE_NAMES.RITUAL_DETAIL]: 'spiritual',
  [PAGE_NAMES.HEART_EXPANSION]: 'spiritual',
  [PAGE_NAMES.GRATITUDE_FLOW]: 'spiritual',
  [PAGE_NAMES.CLEANSING_BREATH]: 'spiritual',
  [PAGE_NAMES.WATER_MANIFEST]: 'spiritual',
  [PAGE_NAMES.LETTER_UNIVERSE]: 'spiritual',
  [PAGE_NAMES.BURN_RELEASE]: 'spiritual',
  [PAGE_NAMES.STAR_WISH]: 'spiritual',
  [PAGE_NAMES.CRYSTAL_HEALING]: 'spiritual',
  [PAGE_NAMES.GOALS]: 'spiritual',
  [PAGE_NAMES.HABITS]: 'spiritual',
  [PAGE_NAMES.AFFIRMATIONS]: 'spiritual',

  // Social pages
  [PAGE_NAMES.HOME]: 'social',
  [PAGE_NAMES.FORUM]: 'social',
  [PAGE_NAMES.POST_DETAIL]: 'social',
  [PAGE_NAMES.CREATE_POST]: 'social',
  [PAGE_NAMES.USER_PROFILE]: 'social',
  [PAGE_NAMES.MESSAGES_LIST]: 'social',
  [PAGE_NAMES.CHAT]: 'social',
  [PAGE_NAMES.CONVERSATION_INFO]: 'social',

  // Shop pages
  [PAGE_NAMES.SHOP]: 'shop',
  [PAGE_NAMES.SHOP_HOME]: 'shop',
  [PAGE_NAMES.PRODUCT_DETAIL]: 'shop',
  [PAGE_NAMES.CART]: 'shop',
  [PAGE_NAMES.CHECKOUT]: 'shop',
  [PAGE_NAMES.ORDER_HISTORY]: 'shop',
  [PAGE_NAMES.ORDER_DETAIL]: 'shop',

  // Education pages
  [PAGE_NAMES.COURSES_LIST]: 'education',
  [PAGE_NAMES.COURSE_DETAIL]: 'education',
  [PAGE_NAMES.LESSON]: 'education',
  [PAGE_NAMES.QUIZ]: 'education',
  [PAGE_NAMES.CERTIFICATE]: 'education',

  // Affiliate pages
  [PAGE_NAMES.AFFILIATE_DASHBOARD]: 'affiliate',
  [PAGE_NAMES.REFERRAL_LINKS]: 'affiliate',
  [PAGE_NAMES.COMMISSION_HISTORY]: 'affiliate',
  [PAGE_NAMES.WITHDRAWAL]: 'affiliate',

  // Account pages
  [PAGE_NAMES.ACCOUNT]: 'account',
  [PAGE_NAMES.PROFILE]: 'account',
  [PAGE_NAMES.EDIT_PROFILE]: 'account',
  [PAGE_NAMES.SETTINGS]: 'account',
  [PAGE_NAMES.WALLET]: 'account',
  [PAGE_NAMES.SUBSCRIPTION]: 'account',
  [PAGE_NAMES.HELP_CENTER]: 'account',
  [PAGE_NAMES.NOTIFICATIONS]: 'account',

  // Admin pages
  [PAGE_NAMES.ADMIN_DASHBOARD]: 'admin',
  [PAGE_NAMES.ADMIN_ANALYTICS]: 'admin',
  [PAGE_NAMES.ADMIN_USERS]: 'admin',
  [PAGE_NAMES.ADMIN_CONTENT]: 'admin',
};

// =====================================================
// RITUAL TYPES
// =====================================================

export const RITUAL_TYPES = {
  HEART_EXPANSION: 'heart-expansion',
  GRATITUDE_FLOW: 'gratitude-flow',
  CLEANSING_BREATH: 'cleansing-breath',
  WATER_MANIFEST: 'water-manifest',
  LETTER_UNIVERSE: 'letter-to-universe',
  BURN_RELEASE: 'burn-release',
  STAR_WISH: 'star-wish',
  CRYSTAL_HEALING: 'crystal-healing',
};

export const RITUAL_DISPLAY_NAMES = {
  [RITUAL_TYPES.HEART_EXPANSION]: 'Mở Rộng Trái Tim',
  [RITUAL_TYPES.GRATITUDE_FLOW]: 'Dòng Chảy Biết Ơn',
  [RITUAL_TYPES.CLEANSING_BREATH]: 'Thở Thanh Lọc',
  [RITUAL_TYPES.WATER_MANIFEST]: 'Hiện Thực Hóa Bằng Nước',
  [RITUAL_TYPES.LETTER_UNIVERSE]: 'Thư Gửi Vũ Trụ',
  [RITUAL_TYPES.BURN_RELEASE]: 'Đốt & Giải Phóng',
  [RITUAL_TYPES.STAR_WISH]: 'Nghi Thức Ước Sao',
  [RITUAL_TYPES.CRYSTAL_HEALING]: 'Chữa Lành Pha Lê',
};

// =====================================================
// CHATBOT TYPES
// =====================================================

export const CHATBOT_TYPES = {
  GENERAL: 'general',
  TAROT: 'tarot',
  ICHING: 'iching',
  TUVI: 'tuvi',
  TRADING: 'trading',
};

// =====================================================
// TAROT SPREADS
// =====================================================

export const TAROT_SPREADS = {
  SINGLE_CARD: 'single-card',
  THREE_CARD: 'three-card',
  CELTIC_CROSS: 'celtic-cross',
  LOVE_SPREAD: 'love-spread',
  CAREER_SPREAD: 'career-spread',
};

// =====================================================
// SCANNER PATTERNS
// =====================================================

export const SCANNER_PATTERNS = {
  UPD: 'UPD',
  DPD: 'DPD',
  UPU: 'UPU',
  DPU: 'DPU',
  FTB: 'FTB',
  FTR: 'FTR',
  COMPRESSION: 'COMPRESSION',
  INDUCEMENT: 'INDUCEMENT',
  PIN_ENGULF: 'PIN_ENGULF',
  ZONE: 'ZONE',
};

// =====================================================
// TIMEFRAMES
// =====================================================

export const TIMEFRAMES = {
  M1: '1m',
  M5: '5m',
  M15: '15m',
  M30: '30m',
  H1: '1h',
  H4: '4h',
  D1: '1d',
  W1: '1w',
  MN: '1M',
};

// =====================================================
// PRODUCT TYPES
// =====================================================

export const PRODUCT_TYPES = {
  COURSE: 'course',
  GEM_PACK: 'gem_pack',
  CRYSTAL: 'crystal',
  SUBSCRIPTION: 'subscription',
  MERCHANDISE: 'merchandise',
  GIFT_CARD: 'gift_card',
};

// =====================================================
// AFFILIATE TIERS
// =====================================================

export const AFFILIATE_TIERS = {
  BRONZE: 'bronze',
  SILVER: 'silver',
  GOLD: 'gold',
  PLATINUM: 'platinum',
  DIAMOND: 'diamond',
  KOL: 'kol',
};

// =====================================================
// PRIORITY LEVELS (for AI Insights)
// =====================================================

export const PRIORITY_LEVELS = {
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
};

// =====================================================
// INSIGHT TYPES
// =====================================================

export const INSIGHT_TYPES = {
  TREND: 'trend',
  ANOMALY: 'anomaly',
  RECOMMENDATION: 'recommendation',
  PREDICTION: 'prediction',
};

// =====================================================
// ACTION STATUS (for AI Insights)
// =====================================================

export const ACTION_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  DISMISSED: 'dismissed',
};

export default {
  EVENT_CATEGORIES,
  EVENT_TYPES,
  EVENT_NAMES,
  PAGE_NAMES,
  PAGE_CATEGORIES,
  RITUAL_TYPES,
  RITUAL_DISPLAY_NAMES,
  CHATBOT_TYPES,
  TAROT_SPREADS,
  SCANNER_PATTERNS,
  TIMEFRAMES,
  PRODUCT_TYPES,
  AFFILIATE_TIERS,
  PRIORITY_LEVELS,
  INSIGHT_TYPES,
  ACTION_STATUS,
};
