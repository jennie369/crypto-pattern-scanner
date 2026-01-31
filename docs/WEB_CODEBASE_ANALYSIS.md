# GEM WEB - CODEBASE ANALYSIS

> Generated: 2026-01-28
> Source: `frontend/src/`

---

## 1. PROJECT STRUCTURE

```
frontend/src/
├── assets/              # Images, fonts, static assets
├── components/          # Reusable React components (100+)
├── components-v2/       # V2 component variants
├── config/              # Configuration files
├── constants/           # Static constants
├── contexts/            # React Context for state management
├── data/                # Static data files
├── hooks/               # Custom React hooks (12)
├── lib/                 # Utility libraries
├── pages/               # Page/screen components (routes)
├── services/            # Business logic & API integration (30+)
├── shared/              # Shared components/utilities
├── stores/              # Global state stores (Zustand)
├── styles/              # Global styles
├── types/               # TypeScript type definitions
└── utils/               # Utility functions
```

---

## 2. ALL PAGES/SCREENS (với paths)

### Public Routes
| # | File | Route Path | Description |
|---|------|------------|-------------|
| 1 | Landing.jsx | `/` | Landing page (redirect if logged in) |
| 2 | HomePage.jsx | `/home-v2` | AIDA conversion funnel homepage |
| 3 | Login.jsx | `/login` | User login page |
| 4 | Signup.jsx | `/signup` | User registration page |
| 5 | Pricing.jsx | `/pricing` | Subscription pricing page |

### Scanner & Trading
| # | File | Route Path | Description | Tier |
|---|------|------------|-------------|------|
| 6 | ScannerV2.jsx | `/scanner-v2` | Main crypto pattern scanner | FREE |
| 7 | Scanner.jsx | `/scanner` | Legacy scanner | FREE |
| 8 | Portfolio.jsx | `/portfolio` | Portfolio tracker | TIER2+ |
| 9 | MTFAnalysis.jsx | `/mtf-analysis` | Multi-timeframe analysis | TIER2 |
| 10 | Sentiment.jsx | `/sentiment` | Market sentiment analyzer | TIER2 |
| 11 | NewsCalendar.jsx | `/news-calendar` | News & events calendar | TIER2 |

### Elite Tools (TIER3 - Premium Access)
| # | File | Route Path | Description |
|---|------|------------|-------------|
| 12 | Backtesting.jsx | `/tier3/backtesting` | Professional backtesting engine |
| 13 | AIPrediction.jsx | `/tier3/ai-prediction` | AI prediction (Gemini 2.5 Flash) |
| 14 | WhaleTracker.jsx | `/tier3/whale-tracker` | Whale transaction tracker |

### Education & Courses
| # | File | Route Path | Description |
|---|------|------------|-------------|
| 15 | Courses.jsx | `/courses` | Course catalog |
| 16 | CourseDetail.jsx | `/courses/:courseId` | Course detail page |
| 17 | CourseLearning.jsx | `/courses/:courseId/learn` | Course learning interface |
| 18 | CourseLearning.jsx | `/courses/:courseId/learn/:lessonId` | Specific lesson |
| 19 | CourseAdmin.jsx | `/courses/admin` | Teacher dashboard |
| 20 | CourseBuilder.jsx | `/courses/admin/create` | Create new course |
| 21 | CourseBuilder.jsx | `/courses/admin/edit/:courseId` | Edit course |
| 22 | ModuleBuilder.jsx | `/courses/admin/edit/:courseId/modules` | Manage modules & lessons |
| 23 | LessonEditor.jsx | `/courses/admin/edit/:courseId/modules/:moduleId/lessons/new` | Create lesson |
| 24 | LessonEditor.jsx | `/courses/admin/edit/:courseId/modules/:moduleId/lessons/:lessonId` | Edit lesson |
| 25 | QuizBuilder.jsx | `/courses/admin/edit/:courseId/modules/:moduleId/lessons/:lessonId/quiz` | Create/edit quiz |
| 26 | StudentManagement.jsx | `/courses/admin/:courseId/students` | Manage enrolled students |

### Community & Social
| # | File | Route Path | Description |
|---|------|------------|-------------|
| 27 | Forum.jsx | `/forum` | Community discussion forum (3-column) |
| 28 | CreateThread.jsx | `/forum/new` | Create new forum post |
| 29 | ThreadDetail.jsx | `/forum/thread/:threadId` | View forum thread |
| 30 | Messages.jsx | `/messages` | Direct messaging |
| 31 | Leaderboard.jsx | `/leaderboard` | User rankings & achievements |
| 32 | Events.jsx | `/events` | Community events calendar |

### Shop & E-commerce
| # | File | Route Path | Description |
|---|------|------------|-------------|
| 33 | Shop.jsx | `/shop` | Product shop/marketplace |
| 34 | Cart.jsx | `/cart` | Shopping cart |

### Utilities & Settings
| # | File | Route Path | Description |
|---|------|------------|-------------|
| 35 | Chatbot.jsx | `/chatbot` | Gemral AI chatbot (I Ching & Tarot) |
| 36 | Dashboard.jsx | `/dashboard` | Dashboard with widgets |
| 37 | AccountDashboard.jsx | `/account` | User account settings |
| 38 | ProfilePage.jsx | `/profile` | User profile page |
| 39 | EnhancedSettings.jsx | `/settings` | Comprehensive settings page |
| 40 | Admin.jsx | `/admin` | Admin dashboard |
| 41 | Analytics.jsx | `/analytics` | Trading analytics |
| 42 | History.jsx | `/history` | Trade history |
| 43 | ScanHistory.jsx | `/scan-history` | Pattern scan history |
| 44 | RiskCalculator.jsx | `/risk-calculator` | Position size calculator |
| 45 | AffiliateDashboard.jsx | `/affiliate` | Affiliate program dashboard |

---

## 3. ALL SERVICES

| # | Service File | Functions | Tables Used |
|---|--------------|-----------|-------------|
| 1 | **userProfile.js** | getProfile, updateProfile, uploadAvatar | `users`, `profiles` |
| 2 | **paperTrading.js** | createOrder, closePosition, checkDailyTradeLimit, getUserTier, updateBalance, getOrderHistory | `paper_trading_accounts`, `paper_trading_orders`, `paper_trading_holdings`, `paper_trading_stop_orders` |
| 3 | **orderMonitor.js** | monitorOrders, updatePortfolio | `paper_trading_accounts`, `paper_trading_orders`, `paper_trading_holdings` |
| 4 | **backtestingService.js** | runBacktest, getResults, analyzePerformance | `backtestresults`, `backtesttrades` |
| 5 | **portfolioApi.js** | addHolding, closePosition, addTransaction, getPerformance | `portfolio_holdings`, `portfolio_transactions`, `trading_journal` |
| 6 | **binanceApi.js** | getKlines, subscribeKlines, unsubscribeKlines | External: Binance REST API |
| 7 | **binanceWebSocket.js** | subscribe, unsubscribe, getPrice, getPriceCache | External: Binance WebSocket |
| 8 | **binanceService.js** | fetchMarketData, subscribePrice, getSpotPrice | External: Binance API |
| 9 | **coinService.js** | getCoins, getCoinDetails, filterByTier | External: Binance Futures API |
| 10 | **sentimentApi.js** | getCurrentSentiment, getHistorical, getTrendingCoins, getGlobalMetrics | External: Fear & Greed Index, CoinGecko |
| 11 | **newsApi.js** | getUpcomingEvents, getEventsByCategory, filterByImpact | Internal event data |
| 12 | **whaleTrackerService.js** | getWhaleTransactions, analyzeExchangeFlow, getAnomalies | External: Etherscan, Blockchain.info |
| 13 | **multiTimeframeScanner.js** | scanMultiTimeframe, analyzeAlignment, generateSignals | - |
| 14 | **courseService.js** | getPublishedCourses, getCourseDetail, enrollStudent, getProgress, createCourse, publishCourse | `courses`, `course_modules`, `course_lessons`, `course_enrollments`, `lesson_progress`, `lesson_attachments` |
| 15 | **enrollmentService.js** | enroll, unenroll, isEnrolled, getStudents, updateProgress | `course_enrollments` |
| 16 | **lessonService.js** | getLesson, updateLesson, attachFile, getFiles | `course_lessons`, `lesson_attachments`, `course_modules` |
| 17 | **progressService.js** | updateProgress, getProgress, markComplete | `lesson_progress` |
| 18 | **quizService.js** | getQuiz, submitAnswer, getResults, calculateScore | `course_quizzes`, `quiz_questions`, `student_quiz_answers` |
| 19 | **lessonVersionService.js** | createVersion, getVersions, rollback | `lesson_versions` |
| 20 | **courseImageService.js** | uploadImage, getImages, deleteImage, optimizeImage | `course_lesson_images`, Storage: `course-images` |
| 21 | **forum.js** | createThread, getThreads, addComment, likePost, editPost, deletePost | `forum_posts`, `forum_comments`, `forum_likes` |
| 22 | **messaging.js** | getConversations, getMessages, sendMessage, createConversation, blockUser, reportUser | `conversations`, `messages`, `conversation_participants`, `message_reactions`, `blocked_users`, `user_reports` |
| 23 | **messaging_improved.js** | createDMConversation, getThreads, sendMessage | `conversations`, `conversation_participants`, `users` |
| 24 | **leaderboard.js** | getLeaderboard, getUserRank, getUserAchievements, awardAchievement, updateUserStats, checkAchievements | `user_stats`, `user_achievements`, `achievements` |
| 25 | **events.js** | getEvents, createEvent, rsvpEvent, getAttendees | `community_events`, `event_rsvps` |
| 26 | **shopify.js** | getProducts, getProductDetail, getCart, addToCart, removeFromCart, updateQuantity, checkout | External: Supabase Edge Functions |
| 27 | **products.js** | getProducts, getByCategory, filterByTier, trackAnalytics | External: Shopify |
| 28 | **productRecommendationService.js** | getRecommendations, getRelatedProducts, getTopSellers | External: Shopify GraphQL |
| 29 | **affiliate.js** | createAffiliateProfile, generateCode, trackReferral, calculateCommission, withdrawEarnings | `affiliate_profiles`, `affiliate_codes`, `affiliate_referrals`, `affiliate_sales`, `affiliate_commissions`, `affiliate_withdrawals`, `affiliate_bonus_kpi` |
| 30 | **chatbot.js** | sendMessage, getHistory, clearHistory, generateReading | `chatbot_history`, External: Gemini 2.5 Flash |
| 31 | **voiceInput.js** | startListening, stopListening, transcribe | External: Web Speech API |
| 32 | **patternDetection.js** | detectPatterns, analyzeCandles, identifySupport/Resistance | - |
| 33 | **patternApi.js** | scanForPatterns, getPatternDetails | Backend API |
| 34 | **analyticsService.js** | trackEvent, trackPageView, getUserMetrics | - |
| 35 | **telegramService.js** | sendMessage, sendAlert, getMe, verifyConnection | External: Telegram Bot API |
| 36 | **exportService.js** | exportPDF, exportCSV, downloadChart | - |
| 37 | **i18nService.js** | translate, getLocale, setLocale | - |
| 38 | **settingsService.js** | getSettings, updateSettings, resetDefaults | `user_preferences` |
| 39 | **shareService.js** | shareToSocial, generateShareLink | - |

---

## 4. ALL COMPONENTS

### Layout & Navigation
| # | Component | Location | Used In |
|---|-----------|----------|---------|
| 1 | TopNavBar | /components/TopNavBar | App layout |
| 2 | AuthenticatedLayout | /components/Layout | Authenticated pages |
| 3 | Header | /components/Header | Multiple pages |
| 4 | Footer | /components/Footer | Multiple pages |
| 5 | MobileNavWrapper | /components/Layout | Mobile layout |
| 6 | ResponsiveContainer | /components/Layout | Multiple pages |
| 7 | CompactSidebar | /components/Layout | Scanner pages |

### Authentication & Routing
| # | Component | Location | Used In |
|---|-----------|----------|---------|
| 8 | ProtectedRoute | /components/ | App routes |
| 9 | ProtectedAdminRoute | /components/ | Admin routes |
| 10 | FeatureGate | /components/FeatureGate | Feature protection |
| 11 | TierGuard | /components/TierGuard | Tier-based access |

### Trading & Analysis
| # | Component | Location | Used In |
|---|-----------|----------|---------|
| 12 | PatternScanner | /components/Scanner | ScannerV2 |
| 13 | PatternDetailsModal | /components/AdvancedScanner | Scanner |
| 14 | ConfirmationIndicator | /components/AdvancedScanner | Scanner |
| 15 | EntryStatusDisplay | /components/AdvancedScanner | Scanner |
| 16 | ZoneRetestTracker | /components/AdvancedScanner | Scanner |
| 17 | TradingChart | /components/ | Multiple |
| 18 | ChartHeader | /components/ | Chart pages |
| 19 | ChartAnnotations | /components/ChartAnnotations | Charts |
| 20 | TradingViewWidget | /components/MTF | MTFAnalysis |
| 21 | ZoneOverlay | /components/MTF | MTFAnalysis |
| 22 | SRPanel | /components/SupportResistance | Scanner |
| 23 | PatternBadgeTooltip | /components/PatternBadgeTooltip | Scanner |
| 24 | PatternInfoCard | /components/PatternInfoCard | Scanner |
| 25 | PatternAnalysisModal | /components/ | Scanner |

### Paper Trading
| # | Component | Location | Used In |
|---|-----------|----------|---------|
| 26 | PerformanceCharts | /components/PaperTrading | Portfolio |
| 27 | OrderHistory | /components/PaperTrading | Portfolio |
| 28 | OpenPositionsWidget | /components/PaperTrading | Portfolio |
| 29 | RecentTradesSection | /components/PaperTrading | Portfolio |
| 30 | PaperTradingPanel | /components/PaperTradingPanel | Scanner |
| 31 | PaperTradingModal | /components/PaperTradingModal | Scanner |
| 32 | TradingModeToggle | /components/TradingModeToggle | Scanner |

### Risk & Position Management
| # | Component | Location | Used In |
|---|-----------|----------|---------|
| 33 | RiskCalculator | /components/RiskCalculator | Risk page |
| 34 | PositionSizeCalculator | /components/PositionSizeCalculator | Multiple |
| 35 | TPSLInput | /components/TPSLInput | Trading modals |

### Portfolio
| # | Component | Location | Used In |
|---|-----------|----------|---------|
| 36 | PortfolioStats | /components/Portfolio | Portfolio page |
| 37 | HoldingsTable | /components/Portfolio | Portfolio page |
| 38 | PortfolioChart | /components/Portfolio | Portfolio page |
| 39 | AddHoldingModal | /components/Portfolio | Portfolio page |
| 40 | EntryTypeAnalytics | /components/Portfolio | Portfolio page |

### Price & Market Data
| # | Component | Location | Used In |
|---|-----------|----------|---------|
| 41 | PriceTicker | /components/PriceTicker | Header |
| 42 | PriceDisplay | /components/PriceDisplay | Multiple |
| 43 | CoinListSidebar | /components/ | Scanner |
| 44 | TradingInfoSidebar | /components/ | Scanner |
| 45 | QuickSelect | /components/ | Scanner |
| 46 | CandlestickIcons | /components/ | Scanner |

### Community & Forum
| # | Component | Location | Used In |
|---|-----------|----------|---------|
| 47 | Forum | /components/Forum | Forum page |
| 48 | ForumEnhanced | /components/Forum | Forum page |
| 49 | CreateThread | /components/Forum | Forum |
| 50 | ThreadDetail | /components/Forum | Forum |
| 51 | CenterFeed | /components/Forum | Forum |
| 52 | UserBadge | /components/UserBadge | Multiple |
| 53 | UserBadges | /components/UserBadge | Profile |

### Messaging
| # | Component | Location | Used In |
|---|-----------|----------|---------|
| 54 | Messages | /components/Messages | Messages page |
| 55 | TelegramConnect | /components/TelegramConnect | Settings |
| 56 | EmojiPicker | /components/EmojiPicker | Messages |
| 57 | FileAttachment | /components/FileAttachment | Messages |

### Courses
| # | Component | Location | Used In |
|---|-----------|----------|---------|
| 58 | CourseCard | /components/Courses | Courses page |
| 59 | LearningPaths | /components/Courses | Courses page |
| 60 | FreePreview | /components/Courses | CourseDetail |
| 61 | ArticleRenderer | /components/Courses | CourseLearning |
| 62 | CoursePreviewModal | /components/CourseAdmin | Admin |

### Shop
| # | Component | Location | Used In |
|---|-----------|----------|---------|
| 63 | CategoryDropdown | /components/Shop | Shop |
| 64 | MiniCartDropdown | /components/Shop | Header |
| 65 | CommunityWidget | /components/Shop | Shop |
| 66 | ProductCard | /components/Shop | Shop |
| 67 | ProductGrid | /components/Shop | Shop |
| 68 | ProductFilters | /components/Shop | Shop |
| 69 | ProductDetailModal | /components/Shop | Shop |

### Dashboard & Widgets
| # | Component | Location | Used In |
|---|-----------|----------|---------|
| 70 | WidgetFactory | /components/Widgets | Dashboard |
| 71 | WidgetPreviewModal | /components/Widgets | Dashboard |
| 72 | PatternWatchWidget | /components/Widgets | Dashboard |
| 73 | PriceAlertWidget | /components/Widgets | Dashboard |
| 74 | PortfolioTrackerWidget | /components/Widgets | Dashboard |
| 75 | DailyReadingWidget | /components/Widgets | Dashboard |
| 76 | ActionPlanWidget | /components/Widgets | Dashboard |
| 77 | AffirmationCard | /components/Widgets | Dashboard |
| 78 | CrystalGridWidget | /components/Widgets | Dashboard |
| 79 | SortableWidget | /components/ | Dashboard |

### Chatbot & AI
| # | Component | Location | Used In |
|---|-----------|----------|---------|
| 80 | VoiceInputButton | /components/Chatbot | Chatbot |
| 81 | SuggestedPrompts | /components/Chatbot | Chatbot |
| 82 | TypingIndicator | /components/Chatbot | Chatbot |
| 83 | ImageUpload | /components/Chatbot | Chatbot |
| 84 | ErrorMessage | /components/Chatbot | Chatbot |
| 85 | ProductCard | /components/Chatbot | Chatbot |

### UI Components
| # | Component | Location | Used In |
|---|-----------|----------|---------|
| 86 | Button | /components/UI | Multiple |
| 87 | Card | /components/UI | Multiple |
| 88 | Grid | /components/UI | Multiple |
| 89 | Select | /components/UI | Multiple |
| 90 | Typography | /components/UI | Multiple |
| 91 | LoadingSpinner | /components/UI | Multiple |
| 92 | EmptyState | /components/UI | Multiple |
| 93 | ErrorState | /components/UI | Multiple |
| 94 | AuthPromptModal | /components/ | Multiple |
| 95 | SignupModal | /components/ | Multiple |
| 96 | UpgradePrompt | /components/UpgradePrompt | Multiple |
| 97 | TierUpgradeModal | /components/TierUpgradeModal | Multiple |
| 98 | CustomSelect | /components/CustomSelect | Multiple |
| 99 | ImageUpload | /components/ImageUpload | Multiple |
| 100 | ErrorBoundary | /components/ | App |

---

## 5. FEATURES CHECKLIST

| Feature | Status | Primary Files |
|---------|--------|---------------|
| **Authentication** | ✅ | AuthContext.jsx, Login.jsx, Signup.jsx |
| **Pattern Scanner** | ✅ | ScannerV2.jsx, patternDetection.js, patternApi.js |
| **Real-time Prices** | ✅ | binanceWebSocket.js, PriceContext.jsx |
| **Paper Trading** | ✅ | paperTrading.js, PaperTradingPanel/ |
| **Portfolio Tracker** | ✅ | Portfolio.jsx, portfolioApi.js |
| **Multi-timeframe Analysis** | ✅ | MTFAnalysis.jsx, multiTimeframeScanner.js |
| **Sentiment Analysis** | ✅ | Sentiment.jsx, sentimentApi.js |
| **News Calendar** | ✅ | NewsCalendar.jsx, newsApi.js |
| **Backtesting Engine** | ✅ | Backtesting.jsx, backtestingService.js |
| **AI Prediction** | ✅ | AIPrediction.jsx, Gemini 2.5 Flash |
| **Whale Tracker** | ✅ | WhaleTracker.jsx, whaleTrackerService.js |
| **Course System** | ✅ | Courses/, courseService.js, lessonService.js |
| **Quiz System** | ✅ | QuizBuilder.jsx, quizService.js |
| **Community Forum** | ✅ | Forum/, forum.js |
| **Direct Messaging** | ✅ | Messages.jsx, messaging.js |
| **Leaderboard** | ✅ | Leaderboard.jsx, leaderboard.js |
| **Events Calendar** | ✅ | Events.jsx, events.js |
| **Shopify Shop** | ✅ | Shop.jsx, shopify.js |
| **Shopping Cart** | ✅ | Cart.jsx, shopify.js |
| **Affiliate Program** | ✅ | AffiliateDashboard.jsx, affiliate.js |
| **AI Chatbot (I Ching/Tarot)** | ✅ | Chatbot.jsx, chatbot.js |
| **Voice Input** | ✅ | VoiceInputButton, voiceInput.js |
| **Telegram Integration** | ✅ | TelegramConnect, telegramService.js |
| **PDF Export** | ✅ | exportService.js, pdfExport.js |
| **Risk Calculator** | ✅ | RiskCalculator.jsx |
| **Dashboard Widgets** | ✅ | Dashboard.jsx, Widgets/ |
| **Tier-based Access** | ✅ | TierGuard/, FeatureGate/ |
| **i18n (VI/EN)** | ✅ | i18nService.js |

---

## 6. DATABASE TABLES USED

### User & Authentication
- `users`
- `profiles`
- `user_stats`
- `user_achievements`
- `achievements`
- `user_preferences`
- `blocked_users`
- `user_reports`

### Courses & Learning
- `courses`
- `course_modules`
- `course_lessons`
- `course_enrollments`
- `lesson_progress`
- `lesson_attachments`
- `lesson_notes`
- `lesson_versions`
- `course_lesson_images`
- `course_quizzes`
- `quiz_questions`
- `student_quiz_answers`

### Trading & Portfolio
- `paper_trading_accounts`
- `paper_trading_orders`
- `paper_trading_holdings`
- `paper_trading_stop_orders`
- `portfolio_holdings`
- `portfolio_transactions`
- `trading_journal`
- `backtestresults`
- `backtesttrades`

### Community & Social
- `forum_posts`
- `forum_comments`
- `forum_likes`
- `conversations`
- `conversation_participants`
- `messages`
- `message_reactions`
- `community_events`
- `event_rsvps`

### Chat & AI
- `chatbot_history`

### Shop & Affiliate
- `affiliate_profiles`
- `affiliate_codes`
- `affiliate_referrals`
- `affiliate_sales`
- `affiliate_commissions`
- `affiliate_withdrawals`
- `affiliate_bonus_kpi`

### Storage Buckets
- `course-images`
- `course-files`
- `course-assets`

---

## 7. THIRD-PARTY INTEGRATIONS

### Payment & Shopping
| Service | Purpose | Integration Method |
|---------|---------|-------------------|
| **Shopify** | E-commerce platform | Supabase Edge Functions proxy |
| - Store | yinyang-master-crystals.myshopify.com | GraphQL API |

### Crypto Data APIs
| Service | Purpose | Auth |
|---------|---------|------|
| **Binance Futures API** | Klines, ticker, prices | REST + WebSocket |
| **CoinGecko API** | Trending coins, global data | FREE (no key) |
| **Fear & Greed Index** | Market sentiment | FREE |
| **Etherscan API** | Ethereum transactions | FREE tier (key required) |
| **Blockchain.info** | Bitcoin transactions | FREE (no key) |

### AI & Messaging
| Service | Purpose | Integration |
|---------|---------|-------------|
| **Google Gemini 2.5 Flash** | AI chatbot, predictions | Supabase Edge Function |
| **Telegram Bot API** | Trading alerts, notifications | Direct API |
| **Web Speech API** | Voice input transcription | Browser native |

### Backend & Database
| Service | Purpose |
|---------|---------|
| **Supabase** | PostgreSQL, Auth, Real-time, Storage, Edge Functions |

### Frontend Libraries
| Library | Version | Purpose |
|---------|---------|---------|
| react | ^19.1.1 | UI framework |
| react-router-dom | ^7.9.5 | Client routing |
| framer-motion | ^12.23.24 | Animations |
| recharts | ^3.4.1 | Charts |
| lightweight-charts | ^4.2.3 | Trading charts |
| lucide-react | ^0.553.0 | Icons |
| react-quill | ^2.0.0 | Rich text editor |
| zustand | ^5.0.8 | State management |
| @dnd-kit/* | latest | Drag & drop |
| html2canvas | ^1.4.1 | Screenshot |
| jspdf | ^3.0.4 | PDF generation |
| axios | ^1.13.1 | HTTP client |
| @supabase/supabase-js | ^2.78.0 | Supabase client |

---

## 8. TIER-BASED ACCESS CONTROL

```
FREE
├── 10 trades/day
├── Basic pattern scanner
├── I Ching + Tarot readings
└── Community forum access

TIER1 (Premium) - $9.99/month
├── 50 trades/day
├── Stop-loss/Take-profit orders
├── 15 daily scanner queries
└── Voice input for chatbot

TIER2 (Advanced) - $29.99/month
├── Unlimited trades
├── Portfolio tracker
├── Multi-timeframe analysis
├── Sentiment analyzer
├── News & events calendar
├── Performance analytics
└── PDF export

TIER3 (Elite/VIP) - $99.99/month
├── All TIER2 features
├── Professional backtesting engine
├── AI prediction (Gemini 2.5)
├── Whale tracker
├── Advanced analytics
├── Export data features
└── VIP support
```

**Implementation:**
- `TierGuard/TierGuard.jsx` - Component wrapper
- `FeatureGate/FeatureGate.jsx` - Feature flags
- `paperTrading.js:validateTierAccess()` - Server-side validation

---

## 9. REACT CONTEXTS

| Context | File | Purpose |
|---------|------|---------|
| AuthContext | AuthContext.jsx | User authentication, session, tier info |
| CourseContext | CourseContext.jsx | Course enrollment, progress, selected course |
| PriceContext | PriceContext.jsx | Real-time crypto prices |
| ScanContext | ScanContext.jsx | Pattern scanner state, results |
| TradingModeContext | TradingModeContext.jsx | Paper/Real trading mode |

---

## 10. CUSTOM HOOKS

| Hook | Purpose |
|------|---------|
| useAuth | Get authenticated user info |
| useBreakpoint | Responsive breakpoint detection |
| useInfiniteProducts | Infinite scroll for products |
| useIpQuota | Track IP-based API quota |
| useLessonRealtime | Real-time lesson updates |
| useMediaQuery | CSS media query detection |
| usePortfolio | Portfolio data & operations |
| usePricePolling | Poll crypto prices |
| useQuota | User quota management |
| useRealtime | Supabase real-time subscriptions |
| useScanHistory | Scan history with pagination |
| useTranslation | i18n translation |

---

## 11. CONFIGURATION FILES

| File | Purpose |
|------|---------|
| systemPrompts.js | AI chatbot system prompts |
| navigation.js | Navigation configuration |
| tierFeatures.js | Tier-specific feature definitions |
| patternSignals.js | 60+ pattern signal definitions |
| badgeTooltips.js | Achievement & badge tooltips |

---

## 12. SUMMARY

**GEM Web** is a production-grade SaaS application for cryptocurrency trading with:

- **45+ pages/routes** organized by feature
- **30+ services** for business logic
- **100+ components** for UI
- **50+ database tables** in Supabase
- **4-tier subscription model** (FREE, TIER1, TIER2, TIER3)
- **12 external integrations** (Binance, Shopify, Telegram, Gemini AI, etc.)

The application combines:
1. **Trading Tools** - Pattern scanner, paper trading, portfolio, backtesting
2. **Education** - Full course management with quizzes and progress tracking
3. **Community** - Forum, messaging, leaderboard, events
4. **E-commerce** - Shopify integration with affiliate program
5. **AI/Spirituality** - Chatbot with I Ching and Tarot guidance

Built with **React 19**, **Supabase**, and **Vite**.
