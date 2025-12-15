/**
 * Gemral - Tooltip & Feature Discovery Configuration
 * 77 tooltips across 12 categories
 * 15 feature discovery prompts
 *
 * Uses lucide-react-native icons
 * Vietnamese with diacritics
 * Design tokens from utils/tokens.js
 */

// ═══════════════════════════════════════════════════════════════════════════
// TOOLTIPS - 77 tooltips total
// ═══════════════════════════════════════════════════════════════════════════

export const TOOLTIPS = {
  // ═══════════════════════════════════════════════════════════════════════
  // SCANNER TOOLTIPS (13 tooltips)
  // ═══════════════════════════════════════════════════════════════════════

  scanner_intro: {
    key: 'scanner_intro',
    title: 'Chào mừng đến Scanner!',
    message:
      'Chọn coin và timeframe, sau đó nhấn SCAN để phát hiện patterns tự động với độ chính xác 68%+.',
    screen: 'Scanner',
    position: 'bottom',
    showOnce: true,
    priority: 1,
  },
  scanner_coin_select: {
    key: 'scanner_coin_select',
    title: 'Chọn Coin',
    message:
      'Nhấn để chọn coin muốn scan. Hỗ trợ 100+ cặp giao dịch phổ biến trên Binance.',
    screen: 'Scanner',
    targetRef: 'coinSelector',
    position: 'bottom',
    trigger: 'first_visit',
  },
  scanner_timeframe: {
    key: 'scanner_timeframe',
    title: 'Khung thời gian',
    message:
      '15m - 1h cho scalping, 4h - 1D cho swing trading. Mỗi timeframe có pattern riêng.',
    screen: 'Scanner',
    targetRef: 'timeframeSelector',
    position: 'bottom',
  },
  scanner_scan_button: {
    key: 'scanner_scan_button',
    title: 'Nút Scan',
    message:
      'Nhấn để bắt đầu quét patterns. FREE tier có 5 lần/ngày, TIER 1+ không giới hạn.',
    screen: 'Scanner',
    targetRef: 'scanButton',
    position: 'top',
  },
  scanner_results: {
    key: 'scanner_results',
    title: 'Kết quả Scan',
    message:
      'Patterns được xếp hạng theo độ tin cậy (%). Nhấn vào pattern để xem chi tiết và trading plan.',
    screen: 'Scanner',
    trigger: 'after_first_scan',
    position: 'top',
    showOnce: true,
  },
  scanner_pattern_card: {
    key: 'scanner_pattern_card',
    title: 'Pattern Card',
    message:
      'Hiển thị loại pattern, độ tin cậy, entry/target/stoploss. Swipe trái để xem thêm.',
    screen: 'Scanner',
    trigger: 'after_first_scan',
    position: 'bottom',
  },
  scanner_favorites: {
    key: 'scanner_favorites',
    title: 'Lưu Favorites',
    message:
      'Nhấn biểu tượng sao để lưu coin yêu thích. Scan nhanh hơn mà không cần chọn lại!',
    screen: 'Scanner',
    trigger: 'after_3_scans',
    position: 'right',
  },
  scanner_multi_tf: {
    key: 'scanner_multi_tf',
    title: 'Multi-Timeframe Scan',
    message:
      'TIER 2+ có thể scan nhiều timeframe cùng lúc. Pattern xuất hiện ở nhiều TF = Tín hiệu mạnh!',
    screen: 'Scanner',
    tier: 'tier2',
    position: 'bottom',
  },
  scanner_alerts: {
    key: 'scanner_alerts',
    title: 'Đặt Alert',
    message:
      'TIER 1+ có thể đặt alert cho coin. Nhận thông báo khi có pattern mới xuất hiện!',
    screen: 'Scanner',
    tier: 'tier1',
    position: 'bottom',
  },
  scanner_history: {
    key: 'scanner_history',
    title: 'Lịch sử Scan',
    message:
      'Xem lại các patterns đã scan trước đó. Theo dõi kết quả thực tế để học hỏi.',
    screen: 'ScanHistory',
    showOnce: true,
  },

  // Pattern Detail Tooltips
  pattern_detail_intro: {
    key: 'pattern_detail_intro',
    title: 'Chi tiết Pattern',
    message:
      'Đây là phân tích chi tiết của pattern. Bao gồm entry, targets, stoploss và R:R ratio.',
    screen: 'PatternDetail',
    showOnce: true,
  },
  pattern_trading_plan: {
    key: 'pattern_trading_plan',
    title: 'Trading Plan',
    message:
      'Kế hoạch giao dịch được AI tự động tạo. Copy và paste vào sổ trading journal của bạn.',
    screen: 'PatternDetail',
    position: 'bottom',
  },
  pattern_confidence: {
    key: 'pattern_confidence',
    title: 'Độ tin cậy',
    message:
      'Phần trăm dựa trên backtest historical data. >70% = Tín hiệu mạnh, 50-70% = Trung bình.',
    screen: 'PatternDetail',
    targetRef: 'confidenceBar',
    position: 'bottom',
  },

  // ═══════════════════════════════════════════════════════════════════════
  // VISION BOARD TOOLTIPS (9 tooltips)
  // ═══════════════════════════════════════════════════════════════════════

  visionboard_intro: {
    key: 'visionboard_intro',
    title: 'Vision Board',
    message:
      'Đặt mục tiêu và theo dõi tiến trình hàng ngày. Streak càng dài, động lực càng cao!',
    screen: 'VisionBoard',
    showOnce: true,
    priority: 1,
  },
  visionboard_add_goal: {
    key: 'visionboard_add_goal',
    title: 'Thêm mục tiêu',
    message:
      'Nhấn + để thêm mục tiêu mới. Chia nhỏ mục tiêu lớn thành các bước nhỏ dễ đạt được.',
    screen: 'VisionBoard',
    targetRef: 'addButton',
    position: 'top',
  },
  visionboard_goal_types: {
    key: 'visionboard_goal_types',
    title: '4 loại mục tiêu',
    message:
      'Trading (lợi nhuận), Financial (tiết kiệm), Health (sức khỏe), Learning (học tập).',
    screen: 'AddGoal',
    position: 'bottom',
  },
  visionboard_streak: {
    key: 'visionboard_streak',
    title: 'Streak Counter',
    message:
      'Số ngày liên tiếp hoàn thành mục tiêu. Streak 7+ ngày = Badge đặc biệt!',
    screen: 'VisionBoard',
    targetRef: 'streakCounter',
    position: 'bottom',
  },
  visionboard_progress: {
    key: 'visionboard_progress',
    title: 'Tiến trình',
    message:
      'Thanh tiến trình hiển thị % hoàn thành. Nhấn để update progress hàng ngày.',
    screen: 'VisionBoard',
    position: 'bottom',
  },
  visionboard_rituals: {
    key: 'visionboard_rituals',
    title: 'Daily Rituals',
    message:
      'Thói quen hàng ngày giúp duy trì kỷ luật. Check-in mỗi sáng để bắt đầu ngày mới!',
    screen: 'VisionBoard',
    position: 'top',
  },
  ritual_morning: {
    key: 'ritual_morning',
    title: 'Morning Ritual',
    message:
      'Bắt đầu ngày với meditation, review goals, và đặt intention. 5-10 phút mỗi sáng.',
    screen: 'Rituals',
    showOnce: true,
  },
  ritual_trading: {
    key: 'ritual_trading',
    title: 'Trading Ritual',
    message:
      'Pre-market analysis, check tin tức, xác định các levels quan trọng trước khi trade.',
    screen: 'Rituals',
    showOnce: true,
  },
  ritual_evening: {
    key: 'ritual_evening',
    title: 'Evening Ritual',
    message:
      'Review kết quả trading, journal entries, và chuẩn bị cho ngày mai.',
    screen: 'Rituals',
    showOnce: true,
  },

  // ═══════════════════════════════════════════════════════════════════════
  // HOME/FORUM TOOLTIPS (6 tooltips)
  // ═══════════════════════════════════════════════════════════════════════

  forum_intro: {
    key: 'forum_intro',
    title: 'Cộng đồng Traders',
    message:
      'Chia sẻ ý tưởng, thảo luận thị trường, học hỏi từ những trader giàu kinh nghiệm.',
    screen: 'Home',
    showOnce: true,
    priority: 1,
  },
  forum_first_post: {
    key: 'forum_first_post',
    title: 'Đăng bài đầu tiên',
    message:
      'Nhấn + để chia sẻ phân tích, trade idea, hoặc đặt câu hỏi cho cộng đồng.',
    screen: 'Home',
    trigger: 'first_visit',
    position: 'bottom',
  },
  forum_trending: {
    key: 'forum_trending',
    title: 'Trending Topics',
    message:
      'Các chủ đề được thảo luận nhiều nhất. Cập nhật real-time theo thị trường.',
    screen: 'Home',
    targetRef: 'trendingSection',
    position: 'bottom',
  },
  forum_categories: {
    key: 'forum_categories',
    title: 'Chuyên mục',
    message:
      'Lọc bài theo chủ đề: Phân tích kỹ thuật, Tâm lý trading, Tin tức, hoặc Wellness.',
    screen: 'Home',
    targetRef: 'categoryTabs',
    position: 'bottom',
  },
  forum_follow: {
    key: 'forum_follow',
    title: 'Follow Traders',
    message:
      'Follow những trader bạn thích để xem bài viết của họ đầu tiên trong feed.',
    screen: 'Home',
    position: 'bottom',
  },
  forum_reactions: {
    key: 'forum_reactions',
    title: 'Reactions',
    message:
      'Thả tim, bình luận, hoặc share bài viết. Tương tác giúp bạn nhận thêm GEM points!',
    screen: 'Home',
    position: 'bottom',
  },

  // ═══════════════════════════════════════════════════════════════════════
  // COURSES TOOLTIPS (5 tooltips)
  // ═══════════════════════════════════════════════════════════════════════

  courses_intro: {
    key: 'courses_intro',
    title: 'Học viện GEM',
    message:
      'Khóa học từ cơ bản đến nâng cao. Học trading, tâm lý, và wellness từ chuyên gia.',
    screen: 'Courses',
    showOnce: true,
    priority: 1,
  },
  courses_progress: {
    key: 'courses_progress',
    title: 'Tiến trình học',
    message:
      'Theo dõi % hoàn thành mỗi khóa học. Hoàn thành khóa để nhận certificate!',
    screen: 'Courses',
    position: 'bottom',
  },
  courses_quiz: {
    key: 'courses_quiz',
    title: 'Quiz kiểm tra',
    message:
      'Cuối mỗi module có quiz. Đạt 80%+ để mở khóa module tiếp theo.',
    screen: 'CourseDetail',
    position: 'bottom',
  },
  courses_certificate: {
    key: 'courses_certificate',
    title: 'Chứng chỉ',
    message:
      'Hoàn thành khóa học để nhận certificate. Share lên profile để flex với cộng đồng!',
    screen: 'Courses',
    trigger: 'after_first_lesson',
    position: 'top',
  },
  courses_premium: {
    key: 'courses_premium',
    title: 'Khóa học Premium',
    message:
      'TIER 2+ được truy cập khóa học nâng cao: Chiến lược, Quản lý vốn, Tâm lý cao cấp.',
    screen: 'Courses',
    tier: 'tier2',
    position: 'bottom',
  },

  // ═══════════════════════════════════════════════════════════════════════
  // ACCOUNT TOOLTIPS (6 tooltips)
  // ═══════════════════════════════════════════════════════════════════════

  profile_intro: {
    key: 'profile_intro',
    title: 'Trang cá nhân',
    message:
      'Xem thống kê, badges, và lịch sử hoạt động. Tùy chỉnh profile để cộng đồng biết về bạn.',
    screen: 'Account',
    showOnce: true,
    priority: 1,
  },
  profile_edit: {
    key: 'profile_edit',
    title: 'Chỉnh sửa Profile',
    message:
      'Nhấn icon bút để cập nhật avatar, bio, và thông tin cá nhân.',
    screen: 'Account',
    targetRef: 'editButton',
    position: 'left',
  },
  tier_benefits: {
    key: 'tier_benefits',
    title: 'Quyền lợi theo Tier',
    message:
      'Nhấn để xem chi tiết quyền lợi của từng tier. Nâng cấp để mở khóa thêm tính năng!',
    screen: 'Account',
    targetRef: 'tierCard',
    position: 'bottom',
  },
  tier_upgrade: {
    key: 'tier_upgrade',
    title: 'Nâng cấp Tier',
    message:
      'TIER 1: Scan không giới hạn. TIER 2: Backtesting, Multi-TF. TIER 3: Signals VIP, Mentoring.',
    screen: 'Pricing',
    showOnce: true,
  },
  settings_notifications: {
    key: 'settings_notifications',
    title: 'Cài đặt thông báo',
    message:
      'Tùy chỉnh notifications: Trading alerts, Forum mentions, hoặc Daily reminders.',
    screen: 'Settings',
    targetRef: 'notificationSettings',
    position: 'bottom',
  },
  settings_privacy: {
    key: 'settings_privacy',
    title: 'Quyền riêng tư',
    message:
      'Kiểm soát ai có thể xem profile, trades, và hoạt động của bạn.',
    screen: 'Settings',
    position: 'bottom',
  },

  // ═══════════════════════════════════════════════════════════════════════
  // PORTFOLIO & TRADING TOOLTIPS (10 tooltips)
  // ═══════════════════════════════════════════════════════════════════════

  portfolio_intro: {
    key: 'portfolio_intro',
    title: 'Portfolio Tracker',
    message:
      'Theo dõi tổng giá trị portfolio, P&L, và phân bố tài sản theo thời gian thực.',
    screen: 'Portfolio',
    showOnce: true,
    priority: 1,
  },
  portfolio_add_trade: {
    key: 'portfolio_add_trade',
    title: 'Thêm Trade',
    message:
      'Nhấn + để log trade mới. Tự động tính P&L, R:R ratio, và thống kê win rate.',
    screen: 'Portfolio',
    targetRef: 'addTradeButton',
    position: 'top',
  },
  portfolio_chart: {
    key: 'portfolio_chart',
    title: 'Performance Chart',
    message:
      'Biểu đồ equity curve theo ngày/tuần/tháng. Vuốt để zoom và xem chi tiết.',
    screen: 'Portfolio',
    targetRef: 'performanceChart',
    position: 'bottom',
  },
  portfolio_stats: {
    key: 'portfolio_stats',
    title: 'Thống kê Trading',
    message:
      'Win rate, average R:R, max drawdown, và các metrics quan trọng khác.',
    screen: 'Portfolio',
    targetRef: 'statsSection',
    position: 'top',
  },

  // Paper Trade
  papertrade_intro: {
    key: 'papertrade_intro',
    title: 'Paper Trading',
    message:
      'Thử nghiệm chiến lược với tiền ảo. Không rủi ro, học hỏi trước khi trade thật!',
    screen: 'PaperTrade',
    showOnce: true,
    priority: 1,
  },
  papertrade_balance: {
    key: 'papertrade_balance',
    title: 'Số dư ảo',
    message:
      'Bắt đầu với $10,000 USDT ảo. Reset bất cứ lúc nào để thử chiến lược mới.',
    screen: 'PaperTrade',
    position: 'bottom',
  },
  papertrade_risk: {
    key: 'papertrade_risk',
    title: 'Quản lý rủi ro',
    message:
      'Đặt stop loss cho mọi lệnh! Khuyến nghị risk 1-2% portfolio mỗi trade.',
    screen: 'PaperTrade',
    targetRef: 'stopLossInput',
    position: 'top',
  },

  // Backtesting
  backtest_intro: {
    key: 'backtest_intro',
    title: 'Backtesting',
    message:
      'Test chiến lược trên dữ liệu quá khứ. Xem pattern hoạt động như thế nào trong thực tế.',
    screen: 'Backtesting',
    showOnce: true,
    priority: 1,
    tier: 'tier1',
  },
  backtest_params: {
    key: 'backtest_params',
    title: 'Thông số Backtest',
    message:
      'Chọn coin, timeframe, và khoảng thời gian. Dữ liệu lịch sử 1-3 năm tùy coin.',
    screen: 'Backtesting',
    position: 'bottom',
  },
  backtest_results: {
    key: 'backtest_results',
    title: 'Kết quả Backtest',
    message:
      'Win rate, profit factor, max drawdown. So sánh với hold strategy để đánh giá.',
    screen: 'BacktestResults',
    showOnce: true,
  },

  // ═══════════════════════════════════════════════════════════════════════
  // GEM MASTER TOOLTIPS (6 tooltips)
  // ═══════════════════════════════════════════════════════════════════════

  gemmaster_intro: {
    key: 'gemmaster_intro',
    title: 'GEM Master AI',
    message:
      'Trợ lý giao dịch thông minh. Hỏi về trading, phân tích kỹ thuật, hoặc bốc Tarot miễn phí!',
    screen: 'GemMaster',
    showOnce: true,
    priority: 1,
  },
  gemmaster_chat: {
    key: 'gemmaster_chat',
    title: 'Chat với AI',
    message:
      'Gõ câu hỏi bất kỳ về trading, tâm lý, hoặc chiến lược. AI trả lời 24/7.',
    screen: 'GemMaster',
    targetRef: 'chatInput',
    position: 'top',
  },
  gemmaster_daily_card: {
    key: 'gemmaster_daily_card',
    title: 'Lá bài mỗi ngày',
    message:
      'Bốc Tarot miễn phí 1 lần/ngày. Nhận thông điệp vũ trụ dành riêng cho bạn!',
    screen: 'GemMaster',
    targetRef: 'tarotButton',
    position: 'bottom',
  },
  gemmaster_iching: {
    key: 'gemmaster_iching',
    title: 'I Ching Wisdom',
    message:
      'Gieo quẻ Kinh Dịch miễn phí. Trí tuệ cổ xưa 3000 năm cho quyết định trading.',
    screen: 'GemMaster',
    targetRef: 'ichingButton',
    position: 'bottom',
  },
  gemmaster_history: {
    key: 'gemmaster_history',
    title: 'Lịch sử hội thoại',
    message:
      'Xem lại các cuộc trò chuyện trước. Tìm kiếm theo keyword hoặc ngày.',
    screen: 'GemMaster',
    targetRef: 'historyButton',
    position: 'left',
  },
  gemmaster_crystal: {
    key: 'gemmaster_crystal',
    title: 'Đá năng lượng',
    message:
      'AI gợi ý đá phong thủy phù hợp với bạn. Mua trực tiếp từ YinYangMasters!',
    screen: 'GemMaster',
    position: 'bottom',
  },

  // ═══════════════════════════════════════════════════════════════════════
  // GEM ECONOMY TOOLTIPS (5 tooltips)
  // ═══════════════════════════════════════════════════════════════════════

  gem_wallet_intro: {
    key: 'gem_wallet_intro',
    title: 'GEM Wallet',
    message:
      'Ví GEM Points của bạn. Dùng để mua courses, unlock premium content, hoặc donate cho người khác.',
    screen: 'GemWallet',
    showOnce: true,
    priority: 1,
  },
  gem_earn: {
    key: 'gem_earn',
    title: 'Cách kiếm GEM',
    message:
      'Đăng bài (+10), Comment hữu ích (+5), Daily check-in (+3), Hoàn thành lesson (+15).',
    screen: 'GemWallet',
    position: 'bottom',
  },
  gem_spend: {
    key: 'gem_spend',
    title: 'Cách dùng GEM',
    message:
      'Mua khóa học premium, unlock badges đặc biệt, hoặc gửi tặng traders khác.',
    screen: 'GemWallet',
    position: 'bottom',
  },
  gem_gifting: {
    key: 'gem_gifting',
    title: 'Tặng GEM',
    message:
      'Gửi GEM cho bạn bè hoặc tip cho bài viết hay. Nhận badge "Generous Giver" khi tặng 100+ GEM.',
    screen: 'GemWallet',
    targetRef: 'giftButton',
    position: 'top',
  },
  gem_withdraw: {
    key: 'gem_withdraw',
    title: 'Rút GEM',
    message:
      'GEM có thể đổi thành voucher mua sắm hoặc giảm giá subscription. Min 500 GEM.',
    screen: 'GemWallet',
    tier: 'tier1',
    position: 'bottom',
  },

  // ═══════════════════════════════════════════════════════════════════════
  // ADMIN TOOLTIPS (5 tooltips)
  // ═══════════════════════════════════════════════════════════════════════

  admin_dashboard: {
    key: 'admin_dashboard',
    title: 'Admin Dashboard',
    message:
      'Tổng quan hệ thống: Users online, revenue hôm nay, tickets pending, và alerts.',
    screen: 'AdminDashboard',
    role: 'admin',
    showOnce: true,
  },
  admin_users: {
    key: 'admin_users',
    title: 'Quản lý Users',
    message:
      'Tìm kiếm, ban/unban, grant tier, và xem activity logs của users.',
    screen: 'UserManagement',
    role: 'admin',
    position: 'bottom',
  },
  admin_revenue: {
    key: 'admin_revenue',
    title: 'Revenue Dashboard',
    message:
      'Theo dõi MRR, subscriptions, refunds, và dự báo revenue theo tháng.',
    screen: 'RevenueDashboard',
    role: 'admin',
    position: 'bottom',
  },
  admin_tickets: {
    key: 'admin_tickets',
    title: 'Support Tickets',
    message:
      'Xem và trả lời tickets từ users. Filter theo priority và status.',
    screen: 'SupportTickets',
    role: 'admin',
    position: 'bottom',
  },
  admin_analytics: {
    key: 'admin_analytics',
    title: 'Analytics',
    message:
      'DAU/MAU, retention rates, feature usage, và conversion funnels.',
    screen: 'Analytics',
    role: 'admin',
    position: 'bottom',
  },

  // ═══════════════════════════════════════════════════════════════════════
  // AFFILIATE TOOLTIPS (5 tooltips)
  // ═══════════════════════════════════════════════════════════════════════

  referral_intro: {
    key: 'referral_intro',
    title: 'Chương trình giới thiệu',
    message:
      'Mời bạn bè, nhận GEM points và % commission khi họ mua subscription!',
    screen: 'Referral',
    showOnce: true,
    priority: 1,
  },
  referral_code: {
    key: 'referral_code',
    title: 'Mã giới thiệu',
    message:
      'Đây là mã referral của bạn. Copy và share cho bạn bè để họ đăng ký.',
    screen: 'Referral',
    targetRef: 'referralCode',
    position: 'bottom',
  },
  referral_share: {
    key: 'referral_share',
    title: 'Chia sẻ link',
    message:
      'Nhấn nút Share để gửi link qua Messenger, Zalo, hoặc copy link trực tiếp.',
    screen: 'Referral',
    targetRef: 'shareButton',
    position: 'top',
  },
  referral_commission: {
    key: 'referral_commission',
    title: 'Tỷ lệ commission',
    message:
      'Đăng ký: +50 GEM. Mua subscription: +10% giá trị đơn hàng. Milestones bonus thêm!',
    screen: 'Referral',
    position: 'bottom',
  },
  affiliate_dashboard: {
    key: 'affiliate_dashboard',
    title: 'Affiliate Dashboard',
    message:
      'Xem số referrals, tổng commission, và trạng thái payout. Export báo cáo dạng CSV.',
    screen: 'AffiliateDashboard',
    showOnce: true,
  },

  // ═══════════════════════════════════════════════════════════════════════
  // NOTIFICATIONS TOOLTIPS (3 tooltips)
  // ═══════════════════════════════════════════════════════════════════════

  alerts_intro: {
    key: 'alerts_intro',
    title: 'Trung tâm thông báo',
    message:
      'Tất cả notifications: Trading alerts, mentions, likes, và system updates.',
    screen: 'Notifications',
    showOnce: true,
    priority: 1,
  },
  alerts_trading: {
    key: 'alerts_trading',
    title: 'Trading Alerts',
    message:
      'Nhận thông báo khi có pattern mới trên coins bạn follow. TIER 1+ có real-time alerts.',
    screen: 'Notifications',
    targetRef: 'tradingAlerts',
    position: 'bottom',
  },
  alerts_customize: {
    key: 'alerts_customize',
    title: 'Tùy chỉnh thông báo',
    message:
      'Bật/tắt từng loại notification. Đặt quiet hours để không bị làm phiền.',
    screen: 'NotificationSettings',
    position: 'bottom',
  },

  // ═══════════════════════════════════════════════════════════════════════
  // SHOP TOOLTIPS (4 tooltips)
  // ═══════════════════════════════════════════════════════════════════════

  shop_intro: {
    key: 'shop_intro',
    title: 'Crystal Shop',
    message:
      'Bộ sưu tập đá năng lượng được chọn lọc từ YinYangMasters. Ship toàn quốc!',
    screen: 'Shop',
    showOnce: true,
    priority: 1,
  },
  shop_categories: {
    key: 'shop_categories',
    title: 'Danh mục sản phẩm',
    message:
      'Lọc theo: Đá phong thủy, Vòng tay, Mặt dây chuyền, hoặc theo mục đích sử dụng.',
    screen: 'Shop',
    targetRef: 'categoryFilter',
    position: 'bottom',
  },
  shop_recommendation: {
    key: 'shop_recommendation',
    title: 'Gợi ý cho bạn',
    message:
      'AI gợi ý đá phù hợp dựa trên kết quả Tarot và mục tiêu cá nhân của bạn.',
    screen: 'Shop',
    position: 'top',
  },
  shop_cart: {
    key: 'shop_cart',
    title: 'Giỏ hàng',
    message:
      'Nhấn icon giỏ hàng để xem sản phẩm đã chọn. Áp mã giảm giá khi checkout.',
    screen: 'Shop',
    targetRef: 'cartIcon',
    position: 'left',
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// FEATURE DISCOVERY PROMPTS - 15 prompts total
// ═══════════════════════════════════════════════════════════════════════════

export const FEATURE_DISCOVERY = {
  // ═══════════════════════════════════════════════════════════════════════
  // USAGE-BASED DISCOVERIES (7)
  // ═══════════════════════════════════════════════════════════════════════

  discover_backtesting: {
    key: 'discover_backtesting',
    title: 'Thử tính năng Backtesting!',
    message:
      'Bạn đã scan 5 lần! Thử Backtesting để test chiến lược trên dữ liệu quá khứ.',
    icon: 'Target',
    actionLabel: 'Thử ngay',
    actionScreen: 'Backtesting',
    trigger: { action: 'scan_count', value: 5 },
    tier: 'tier1',
    priority: 1,
  },

  discover_gemmaster: {
    key: 'discover_gemmaster',
    title: 'Đã thử GEM Master chưa?',
    message:
      'Bốc Tarot miễn phí mỗi ngày! Nhận thông điệp vũ trụ dành riêng cho bạn.',
    icon: 'Sparkles',
    actionLabel: 'Bốc Tarot',
    actionScreen: 'GemMaster',
    trigger: { action: 'days_active', value: 3 },
    priority: 2,
  },

  discover_visionboard: {
    key: 'discover_visionboard',
    title: 'Đặt mục tiêu trading!',
    message:
      'Vision Board giúp bạn theo dõi tiến trình và duy trì động lực.',
    icon: 'Target',
    actionLabel: 'Tạo mục tiêu',
    actionScreen: 'VisionBoard',
    trigger: { action: 'trade_count', value: 3 },
    priority: 3,
  },

  discover_journal: {
    key: 'discover_journal',
    title: 'Ghi chép Trading Journal!',
    message:
      'Bạn đã thực hiện 5 trades. Ghi lại để phân tích và cải thiện chiến lược.',
    icon: 'BookOpen',
    actionLabel: 'Mở Journal',
    actionScreen: 'TradingJournal',
    trigger: { action: 'trade_count', value: 5 },
    priority: 4,
  },

  discover_courses: {
    key: 'discover_courses',
    title: 'Nâng cao kiến thức!',
    message:
      'Khóa học miễn phí về trading và tâm lý đang chờ bạn.',
    icon: 'GraduationCap',
    actionLabel: 'Xem khóa học',
    actionScreen: 'Courses',
    trigger: { action: 'days_active', value: 7 },
    priority: 5,
  },

  discover_community: {
    key: 'discover_community',
    title: 'Tham gia cộng đồng!',
    message:
      'Bạn chưa đăng bài nào. Chia sẻ trade idea đầu tiên để nhận +20 GEM!',
    icon: 'Users',
    actionLabel: 'Đăng bài',
    actionScreen: 'CreatePost',
    trigger: { action: 'post_count', value: 0 },
    priority: 6,
  },

  discover_referral: {
    key: 'discover_referral',
    title: 'Mời bạn bè nhận GEM!',
    message:
      'Chương trình referral đã sẵn sàng. Mời 1 người = +50 GEM ngay!',
    icon: 'Gift',
    actionLabel: 'Lấy mã giới thiệu',
    actionScreen: 'Referral',
    trigger: { action: 'days_active', value: 14 },
    priority: 7,
  },

  // ═══════════════════════════════════════════════════════════════════════
  // UPGRADE PROMPTS (5)
  // ═══════════════════════════════════════════════════════════════════════

  upgrade_scan_limit: {
    key: 'upgrade_scan_limit',
    title: 'Hết lượt scan hôm nay',
    message:
      'Bạn đã dùng hết 5 scans miễn phí. Nâng cấp TIER 1 để scan không giới hạn!',
    icon: 'Zap',
    actionLabel: 'Xem gói nâng cấp',
    actionScreen: 'Pricing',
    trigger: { action: 'quota_reached', value: true },
    priority: 1,
    isUpgradePrompt: true,
  },

  upgrade_backtesting: {
    key: 'upgrade_backtesting',
    title: 'Mở khóa Backtesting',
    message:
      'Tính năng này dành cho TIER 1+. Nâng cấp để test chiến lược trên dữ liệu lịch sử!',
    icon: 'Lock',
    actionLabel: 'Xem gói nâng cấp',
    actionScreen: 'Pricing',
    trigger: { action: 'feature_locked', feature: 'backtesting' },
    priority: 2,
    isUpgradePrompt: true,
  },

  upgrade_multi_tf: {
    key: 'upgrade_multi_tf',
    title: 'Multi-Timeframe Scan',
    message:
      'TIER 2+ có thể scan nhiều timeframes cùng lúc. Tín hiệu mạnh hơn, chính xác hơn!',
    icon: 'Layers',
    actionLabel: 'Xem gói nâng cấp',
    actionScreen: 'Pricing',
    trigger: { action: 'feature_locked', feature: 'multi_tf' },
    priority: 3,
    isUpgradePrompt: true,
  },

  upgrade_alerts: {
    key: 'upgrade_alerts',
    title: 'Real-time Alerts',
    message:
      'Nhận thông báo ngay khi có pattern mới! Tính năng dành cho TIER 1+.',
    icon: 'Bell',
    actionLabel: 'Xem gói nâng cấp',
    actionScreen: 'Pricing',
    trigger: { action: 'feature_locked', feature: 'alerts' },
    priority: 4,
    isUpgradePrompt: true,
  },

  upgrade_vip_signals: {
    key: 'upgrade_vip_signals',
    title: 'VIP Signals',
    message:
      'TIER 3 nhận signals độc quyền từ expert traders với win rate 75%+.',
    icon: 'Star',
    actionLabel: 'Xem gói nâng cấp',
    actionScreen: 'Pricing',
    trigger: { action: 'feature_locked', feature: 'vip_signals' },
    priority: 5,
    isUpgradePrompt: true,
  },

  // ═══════════════════════════════════════════════════════════════════════
  // STREAK & ACHIEVEMENT PROMPTS (3)
  // ═══════════════════════════════════════════════════════════════════════

  streak_warning: {
    key: 'streak_warning',
    title: 'Streak sắp mất!',
    message:
      'Bạn có streak {streak} ngày. Đừng quên check-in hôm nay để duy trì!',
    icon: 'Flame',
    actionLabel: 'Check-in ngay',
    actionScreen: 'VisionBoard',
    trigger: { action: 'streak_warning', value: true },
    priority: 1,
  },

  achievement_unlocked: {
    key: 'achievement_unlocked',
    title: 'Huy hiệu mới!',
    message:
      'Bạn vừa mở khóa badge "{badge_name}". Xem collection của bạn!',
    icon: 'Award',
    actionLabel: 'Xem badges',
    actionScreen: 'Achievements',
    trigger: { action: 'achievement_unlocked', value: true },
    priority: 2,
  },

  level_up: {
    key: 'level_up',
    title: 'Lên level!',
    message:
      'Chúc mừng! Bạn đã đạt Level {level}. Mở khóa {reward} mới!',
    icon: 'TrendingUp',
    actionLabel: 'Xem rewards',
    actionScreen: 'Profile',
    trigger: { action: 'level_up', value: true },
    priority: 1,
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// TOOLTIP SEQUENCES (Guided Tours)
// ═══════════════════════════════════════════════════════════════════════════

export const TOOLTIP_SEQUENCES = {
  scanner_tour: {
    name: 'Scanner Tour',
    description: 'Hướng dẫn sử dụng Scanner',
    steps: [
      'scanner_intro',
      'scanner_coin_select',
      'scanner_timeframe',
      'scanner_scan_button',
      'scanner_results',
      'scanner_favorites',
    ],
    completionReward: { type: 'gem', amount: 10 },
  },

  trading_tour: {
    name: 'Trading Tour',
    description: 'Hướng dẫn Paper Trading',
    steps: [
      'papertrade_intro',
      'papertrade_balance',
      'papertrade_risk',
      'portfolio_intro',
      'portfolio_add_trade',
    ],
    completionReward: { type: 'gem', amount: 15 },
  },

  visionboard_tour: {
    name: 'Vision Board Tour',
    description: 'Hướng dẫn đặt mục tiêu',
    steps: [
      'visionboard_intro',
      'visionboard_add_goal',
      'visionboard_goal_types',
      'visionboard_streak',
      'visionboard_rituals',
    ],
    completionReward: { type: 'gem', amount: 10 },
  },

  gemmaster_tour: {
    name: 'GEM Master Tour',
    description: 'Khám phá AI Assistant',
    steps: [
      'gemmaster_intro',
      'gemmaster_chat',
      'gemmaster_daily_card',
      'gemmaster_iching',
      'gemmaster_crystal',
    ],
    completionReward: { type: 'gem', amount: 10 },
  },

  community_tour: {
    name: 'Community Tour',
    description: 'Tham gia cộng đồng',
    steps: [
      'forum_intro',
      'forum_categories',
      'forum_first_post',
      'forum_reactions',
      'forum_follow',
    ],
    completionReward: { type: 'gem', amount: 10 },
  },
};

/**
 * AsyncStorage keys for tooltips
 */
export const TOOLTIP_STORAGE_KEYS = {
  viewedTooltips: '@gem_viewed_tooltips',
  dismissedDiscoveries: '@gem_dismissed_discoveries',
  tourProgress: '@gem_tour_progress',
};

/**
 * Get tooltip count by category
 */
export const getTooltipCounts = () => {
  const categories = {};
  Object.values(TOOLTIPS).forEach((tooltip) => {
    const screen = tooltip?.screen || 'Other';
    categories[screen] = (categories[screen] || 0) + 1;
  });
  return categories;
};

export default {
  TOOLTIPS,
  FEATURE_DISCOVERY,
  TOOLTIP_SEQUENCES,
  TOOLTIP_STORAGE_KEYS,
  getTooltipCounts,
};
