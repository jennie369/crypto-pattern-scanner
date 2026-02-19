# GEM Web Frontend

React 19 + Vite SPA cho GEM Trading & Spiritual Ecosystem. Dark theme, Framer Motion animations, Supabase backend.

> **Luu y**: Day la README cho **web frontend** (`frontend/`). README cho mobile app xem tai [`docs/README.md`](./README.md).

---

## 1. Tong Quan (Overview)

| Stack | Phien ban | Mo ta |
|-------|-----------|-------|
| React | 19.1.1 | UI framework |
| Vite | 7.1.7 | Build tool & dev server |
| React Router DOM | 7.9.5 | Client-side routing |
| Zustand | 5.0.8 | State management (stores) |
| React Context | 6 contexts | Auth, Course, Price, Scan, TradingMode, VisionBoard |
| Framer Motion | 12.23.24 | Animations (page transitions, cards, modals) |
| Supabase | 2.78.0 | Auth, Postgres, Realtime, Storage, Edge Functions |
| Recharts | 3.4.1 | Dashboard charts |
| Lightweight Charts | 4.2.3 | Trading candlestick charts |
| Lucide React | 0.553.0 | Icon library |

**Dac diem chinh:**
- Dark theme nhat quan voi design tokens (CSS variables + JS exports)
- 82+ routes, 140+ components, 75+ services
- 4-tier subscription model (FREE / TIER1 / TIER2 / TIER3)
- Lazy loading cho cac page nang (GemMaster, Dashboard, Forum sub-pages)
- Mobile-first responsive: base = mobile, `@media 768px` = tablet, `1024px` = desktop
- Forum/Community 3-column layout synced from mobile app (6-type reactions, threaded comments, infinite scroll)

---

## 2. Kien Truc (Architecture)

```
frontend/src/
├── assets/                  # Hinh anh, fonts, static assets
├── components/              # 100+ reusable components
│   ├── GemMaster/           # 12 components (Phase B - 2026-02-19)
│   │   ├── CardFlipAnimation.jsx    # Lat bai Tarot (327 lines)
│   │   ├── CoinCastAnimation.jsx    # I-Ching coin animation (456 lines)
│   │   ├── ConnectionStatus.jsx     # Trang thai ket noi (513 lines)
│   │   ├── ConversationCard.jsx     # Card hoi thoai (271 lines)
│   │   ├── EmptyHistoryState.jsx    # Trang thai trong (176 lines)
│   │   ├── HexagramBuilder.jsx      # Xay dung hexagram I-Ching (485 lines)
│   │   ├── QuotaIndicator.jsx       # Hien thi quota con lai (145 lines)
│   │   ├── ShuffleAnimation.jsx     # Xao bai animation (188 lines)
│   │   ├── SpreadLayout.jsx         # Layout trai bai (228 lines)
│   │   ├── StreakDisplay.jsx         # Hien thi streak (601 lines)
│   │   ├── TierBadge.jsx            # Badge tier nguoi dung (88 lines)
│   │   └── UpgradeModal.jsx         # Modal nang cap tier (322 lines)
│   ├── VisionBoard/         # 9 components (Vision Board UI)
│   ├── Rituals/cosmic/      # 4 components (Breathing, Background, GlassCard, GlowButton)
│   ├── Scanner/             # Pattern scanner components
│   ├── PaperTrading/        # Paper trading widgets (unified tables — 2026-02-19)
│   ├── account/             # 8 components (Tai San sync - 2026-02-19)
│   │   ├── AdminPanel.jsx         # Admin section voi pending badges (152 lines)
│   │   ├── AffiliateSection.jsx   # 4-state affiliate: none/pending/rejected/active (204 lines)
│   │   ├── AssetStatsCards.jsx    # Stat cards (gems, tier, streak)
│   │   ├── EditProfileModal.jsx   # Inline edit modal + avatar upload (210 lines)
│   │   ├── ProfileHeader.jsx      # Profile header component
│   │   ├── QuickActionsGrid.jsx   # Quick actions grid
│   │   ├── SettingsMenu.jsx       # Settings menu items
│   │   └── StatsRow.jsx           # Stats row display
│   ├── Forum/               # 13 Forum components (Phase B - 2026-02-19)
│   ├── Courses/             # Course components
│   ├── Shop/                # Shop components
│   ├── Widgets/             # Dashboard widgets
│   ├── UI/                  # Button, Card, Grid, Select, Typography, etc.
│   ├── TierGuard/           # Tier-based access control wrapper
│   ├── FeatureGate/         # Feature flag wrapper
│   └── ...
├── components-v2/           # V2 component variants
├── config/
│   ├── navigation.js        # 4 nav tabs: Cong Dong, Cua Hang, GEM Scanner, GEM Master
│   ├── systemPrompts.js     # AI chatbot system prompts
│   ├── tierFeatures.js      # Tier-specific feature definitions
│   ├── patternSignals.js    # 60+ pattern signal definitions
│   └── badgeTooltips.js     # Achievement badge tooltips
├── constants/               # Static constants
├── contexts/                # React Contexts
│   ├── AuthContext.jsx      # Auth, session, profile, tier
│   ├── CourseContext.jsx    # Course enrollment, progress
│   ├── PriceContext.jsx     # Real-time crypto prices
│   ├── ScanContext.jsx      # Scanner state, results
│   ├── TradingModeContext.jsx # Paper/Real trading mode
│   └── VisionBoardContext.jsx # Vision Board state
├── data/                    # Static data (tarotSpreads, etc.)
├── hooks/                   # 19 custom hooks
│   ├── useGamification.js   # Level, XP, achievements, daily quests (325 lines)
│   ├── useStreak.js         # Streak count, weekly progress, check-in (358 lines)
│   ├── useAccessControl.js  # Tier gating, quota, upgrade modal (381 lines)
│   ├── usePosts.js          # Forum posts
│   ├── useComments.js       # Forum comments
│   ├── useReactions.js      # Forum reactions
│   ├── useKarma.js          # Karma system
│   ├── useAuth.js           # Auth helper
│   ├── useBreakpoint.js     # Responsive breakpoints
│   ├── usePortfolio.js      # Portfolio data
│   ├── usePricePolling.js   # Price polling
│   ├── useQuota.js          # Usage quota
│   ├── useRealtime.js       # Supabase Realtime subscriptions
│   ├── useScanHistory.js    # Scan history + pagination
│   ├── useTranslation.js    # i18n (VI/EN)
│   ├── useMediaQuery.js     # CSS media query detection
│   ├── useIpQuota.js        # IP-based API quota
│   ├── useInfiniteProducts.js # Infinite scroll products
│   └── useLessonRealtime.js # Real-time lesson updates
├── lib/
│   └── supabaseClient.js    # Supabase client (autoRefreshToken, localStorage)
├── pages/                   # 70+ pages/routes (xem Section 4)
│   ├── GemMaster/           # 6 pages (Phase C - 2026-02-19)
│   ├── VisionBoard/         # Vision Board pages
│   ├── Rituals/             # Trader Rituals pages
│   ├── Dashboard/           # Scanner v2, Portfolio v2
│   ├── Forum/               # Forum 3-column + sub-pages
│   ├── Account/             # Account dashboard, profile
│   ├── DailyCheckin/        # Daily check-in page (streak + calendar)
│   ├── Orders/              # Orders page (invoices + pending payments)
│   ├── Transactions/        # Gem transaction history
│   ├── Partnership/         # CTV/KOL registration
│   ├── Settings/            # Privacy settings
│   ├── Admin/              # Admin dashboard (13 files — route-based sub-pages, 2026-02-19)
│   │   ├── AdminLayout.jsx       # Layout: header, stats, quick actions, tab nav, <Outlet />
│   │   ├── adminUtils.js         # Shared: formatCurrency, formatDate, sendPartnershipNotification
│   │   ├── UsersPage.jsx         # User management + UserModal
│   │   ├── ApplicationsPage.jsx  # Partnership applications
│   │   ├── WithdrawalsPage.jsx   # Withdrawal requests
│   │   ├── AnalyticsPage.jsx     # System analytics
│   │   ├── SystemPage.jsx        # System info (static)
│   │   ├── NotificationsPage.jsx # Broadcast notifications
│   │   ├── BannersPage.jsx       # Sponsor banners
│   │   ├── CalendarPage.jsx      # Content calendar
│   │   ├── AutoPostLogsPage.jsx  # Auto-post logs
│   │   ├── PlatformSettingsPage.jsx # Social platform connections
│   │   └── SeedContentPage.jsx   # Seed users & posts
│   ├── CourseAdmin/         # Teacher dashboard
│   └── ...
├── services/                # 75+ service files
│   ├── forum.js                   # Forum CRUD + reactions + scheduling (1027 lines)
│   ├── feedService.js             # Personalized/following/popular feeds (405 lines)
│   ├── commentService.js          # Threaded comments CRUD (247 lines)
│   ├── karmaService.js            # Karma RPC wrappers (73 lines)
│   ├── linkPreviewService.js      # Link preview via edge function (92 lines)
│   ├── chatHistoryService.js      # Chat persistence (509 lines)
│   ├── readingHistoryService.js   # Tarot/I-Ching history (430 lines)
│   ├── streakService.js           # Streak + XP + levels (502 lines)
│   ├── gamificationService.js     # Achievements + combos (692 lines)
│   ├── emotionDetectionService.js # 16-emotion detection (422 lines)
│   ├── tarotSpreadService.js      # Spread data + tier gate (430 lines)
│   ├── accessControlService.js    # Tier access + quotas (661 lines)
│   ├── ritualTrackingService.js   # Custom ritual CRUD (840 lines)
│   ├── userContextService.js      # AI personalization context (696 lines)
│   ├── paperTrading.js            # Unified paper trading (mobile tables, return adaptors)
│   ├── orderMonitor.js            # Pending order monitor (paper_pending_orders)
│   └── ...
├── shared/                  # Shared components/utilities
├── stores/                  # Zustand stores
│   ├── courseStore.js       # Course state
│   ├── scannerStore.js      # Scanner state (results, selectedPattern, zones, highlightedZoneId — 2026-02-19)
│   └── shopStore.js         # Shop/cart state
├── styles/
│   └── design-tokens.css    # CSS custom properties (xem Section 6)
├── types/                   # TypeScript type definitions
└── utils/                   # Utility functions
```

---

## 3. Bat Dau (Getting Started)

### Yeu cau

- Node.js 18+ (bat buoc)
- npm 9+ hoac yarn

### Cai dat

```bash
cd frontend
npm install
```

### Bien Moi Truong

Copy `.env.local.example` thanh `.env.local`:

```bash
cp .env.local.example .env.local
```

| Bien | Bat buoc | Mo ta |
|------|----------|-------|
| `VITE_SUPABASE_URL` | Co | Supabase project URL (`https://xxx.supabase.co`) |
| `VITE_SUPABASE_ANON_KEY` | Co | Supabase anonymous key (tu Dashboard > Settings > API) |
| `VITE_APP_URL` | Khong | Production domain cho share links (default: `https://gemral.com`) |
| `VITE_BINANCE_WS_URL` | Khong | Binance WebSocket URL |
| `VITE_BINANCE_API_URL` | Khong | Binance REST API URL |
| `VITE_SHOPIFY_DOMAIN` | Khong | Shopify store domain |
| `VITE_SHOPIFY_STOREFRONT_TOKEN` | Khong | Shopify Storefront API token |

> **KHONG** commit `.env.local` vao Git. File nay da duoc them vao `.gitignore`.

### Chay Development

```bash
npm run dev          # Vite dev server (port 5173)
npm run dev:watch    # Dev server + auto-fix script
npm run build        # Production build
npm run preview      # Preview production build
npm run lint         # ESLint check
```

---

## 4. Tat Ca Routes

### Public Routes (Khong can dang nhap)

| Route | Page | Mo ta |
|-------|------|-------|
| `/` | Landing.jsx | Trang chu, redirect neu da dang nhap |
| `/home-v2` | HomePage.jsx | AIDA conversion funnel homepage |
| `/login` | Login.jsx | Dang nhap (redirect `/scanner-v2` neu da login) |
| `/signup` | Signup.jsx | Dang ky (redirect `/scanner-v2` neu da login) |
| `/pricing` | Pricing.jsx | Bang gia subscription |
| `/scanner-v2` | ScannerV2.jsx | Scanner v2 - layout 3 cot (FREE) |
| `/shop` | Shop.jsx | Cua hang san pham |
| `/cart` | Cart.jsx | Gio hang |
| `/courses` | Courses.jsx | Danh muc khoa hoc |
| `/courses/:courseId` | CourseDetail.jsx | Chi tiet khoa hoc |
| `/forum` | Forum3Column.jsx | Dien dan cong dong (3 cot) |
| `/forum/thread/:threadId` | ThreadDetail.jsx | Chi tiet bai viet |
| `/forum/user/:userId` | ForumUserProfile.jsx | Profile nguoi dung trong forum |
| `/forum/hashtag/:tag` | HashtagFeed.jsx | Feed theo hashtag |
| `/forum/post/:postId/history` | EditHistory.jsx | Lich su chinh sua bai |

### Scanner & Trading (Yeu cau dang nhap)

| Route | Page | Mo ta | Tier |
|-------|------|-------|------|
| `/scanner` | Scanner.jsx | Scanner legacy | FREE |
| `/portfolio` | Portfolio.jsx | Portfolio tracker | TIER2+ |
| `/mtf-analysis` | MTFAnalysis.jsx | Phan tich da khung thoi gian | TIER2+ |
| `/sentiment` | Sentiment.jsx | Phan tich sentiment thi truong | TIER2+ |
| `/news-calendar` | NewsCalendar.jsx | Lich su kien & tin tuc | TIER2+ |
| `/analytics` | Analytics.jsx | Trading analytics | FREE |
| `/history` | History.jsx | Lich su giao dich | FREE |
| `/scan-history` | ScanHistory.jsx | Lich su quet pattern | FREE |
| `/risk-calculator` | RiskCalculator.jsx | Tinh kich thuoc vi the | FREE |

### TIER 3 Elite Tools (TierGuard required)

| Route | Page | Mo ta |
|-------|------|-------|
| `/tier3/backtesting` | Backtesting.jsx | Backtesting engine chuyen nghiep |
| `/tier3/ai-prediction` | AIPrediction.jsx | Du doan AI (Gemini 2.5 Flash) |
| `/tier3/whale-tracker` | WhaleTracker.jsx | Theo doi giao dich ca voi |

### GemMaster (Moi - Phase B/C - 2026-02-19)

| Route | Page | Mo ta |
|-------|------|-------|
| `/chatbot` | Chatbot.jsx | GEM Master AI chatbot (I-Ching, Tarot, Crystal, Trading) |
| `/gemmaster/chat-history` | ChatHistoryPage.jsx | Lich su hoi thoai (525 lines) |
| `/gemmaster/readings` | ReadingHistoryPage.jsx | Lich su boi Tarot/I-Ching (694 lines) |
| `/gemmaster/readings/:id` | ReadingDetailPage.jsx | Chi tiet bai doc (794 lines) |
| `/gemmaster/spreads` | SpreadSelectionPage.jsx | Chon trai bai Tarot (442 lines) |
| `/gemmaster/reading` | TarotReadingPage.jsx | Trai bai Tarot tuong tac - 5 giai doan (2121 lines) |
| `/gemmaster/gamification` | GamificationPage.jsx | Thanh tich, cap do, huy hieu (775 lines) |

### Vision Board & Rituals

| Route | Page | Mo ta |
|-------|------|-------|
| `/vision-board` | VisionBoardPage.jsx | Bang tam nhin |
| `/vision-board/goals/new` | CreateGoalPage.jsx | Tao muc tieu moi |
| `/vision-board/goals/:id` | GoalDetailPage.jsx | Chi tiet muc tieu |
| `/rituals` | RitualsPage.jsx | Trader Rituals |
| `/rituals/:ritualId` | RitualPlaygroundPage.jsx | Thuc hanh ritual (fullscreen) |

### Community

| Route | Page | Mo ta |
|-------|------|-------|
| `/forum/new` | CreateThread.jsx | Tao bai viet moi |
| `/forum/edit/:postId` | EditPost.jsx | Chinh sua bai viet |
| `/forum/post/:postId/analytics` | PostAnalytics.jsx | Thong ke bai viet |
| `/forum/scheduled` | ScheduledPosts.jsx | Bai viet da len lich |
| `/messages` | Messages.jsx | Tin nhan truc tiep |
| `/events` | Events.jsx | Lich su kien cong dong |
| `/leaderboard` | Leaderboard.jsx | Bxh & thanh tich |
| `/community-hub` | CommunityHub.jsx | Community hub (legacy) |

### Education

| Route | Page | Mo ta |
|-------|------|-------|
| `/courses/:courseId/learn` | CourseLearning.jsx | Hoc khoa hoc (fullscreen) |
| `/courses/:courseId/learn/:lessonId` | CourseLearning.jsx | Bai hoc cu the |
| `/courses/admin` | CourseAdmin.jsx | Teacher dashboard |
| `/courses/admin/create` | CourseBuilder.jsx | Tao khoa hoc moi |
| `/courses/admin/edit/:courseId` | CourseBuilder.jsx | Chinh sua khoa hoc |
| `/courses/admin/edit/:courseId/modules` | ModuleBuilder.jsx | Quan ly modules & lessons |
| `/courses/admin/edit/:courseId/modules/:moduleId/lessons/new` | LessonEditor.jsx | Tao bai hoc |
| `/courses/admin/edit/:courseId/modules/:moduleId/lessons/:lessonId` | LessonEditor.jsx | Chinh sua bai hoc |
| `/courses/admin/edit/:courseId/modules/:moduleId/lessons/:lessonId/quiz` | QuizBuilder.jsx | Tao/chinh sua quiz |
| `/courses/admin/:courseId/students` | StudentManagement.jsx | Quan ly hoc vien |

### Account & Settings

| Route | Page | Mo ta |
|-------|------|-------|
| `/account` | AccountDashboard.jsx | Tai khoan nguoi dung |
| `/tai-san` | AccountDashboard.jsx | Alias cua `/account` |
| `/profile` | ProfilePage.jsx | Trang ca nhan |
| `/settings` | EnhancedSettings.jsx | Cai dat toan dien |
| `/settings/privacy` | PrivacySettings.jsx | Cai dat quyen rieng tu |
| `/daily-checkin` | DailyCheckinPage.jsx | Check-in hang ngay |
| `/orders` | OrdersPage.jsx | Don hang |
| `/transactions` | TransactionHistoryPage.jsx | Lich su giao dich |
| `/partnership/register` | PartnershipRegistration.jsx | Dang ky doi tac |
| `/affiliate` | AffiliateDashboard.jsx | Dashboard doi tac/CTV |
| `/dashboard` | Dashboard.jsx | Dashboard widgets (drag & drop) |

### Admin (Refactored — Route-Based Sub-Pages, 2026-02-19)

| Route | Page | Mo ta |
|-------|------|-------|
| `/admin` | AdminLayout.jsx | Admin layout (redirect → `/admin/users`) |
| `/admin/users` | UsersPage.jsx | Quan ly users (search, edit, delete) |
| `/admin/applications` | ApplicationsPage.jsx | Duyet don dang ky Affiliate/CTV |
| `/admin/withdrawals` | WithdrawalsPage.jsx | Xu ly yeu cau rut tien |
| `/admin/analytics` | AnalyticsPage.jsx | Thong ke he thong & partnership |
| `/admin/system` | SystemPage.jsx | Thong tin he thong |
| `/admin/notifications` | NotificationsPage.jsx | Gui thong bao den users |
| `/admin/banners` | BannersPage.jsx | Quan ly banner quang cao |
| `/admin/calendar` | CalendarPage.jsx | Lich noi dung & auto-post |
| `/admin/autologs` | AutoPostLogsPage.jsx | Nhat ky auto-post |
| `/admin/platforms` | PlatformSettingsPage.jsx | Ket noi nen tang (FB, TikTok...) |
| `/admin/seedcontent` | SeedContentPage.jsx | Quan ly seed users & posts |

All admin sub-routes duoc protected boi `ProtectedAdminRoute` va rendered inside `AdminLayout` (header, stats, quick actions, tab nav) via React Router `<Outlet />`.

### Legacy Redirects

| Route | Redirect to |
|-------|-------------|
| `/community` | `/forum` |
| `/community/following` | `/forum?tab=following` |
| `/community/trending` | `/forum?tab=trending` |
| `/community/search` | `/forum` |
| `/community/create` | `/forum/new` |
| `/community/post/:postId` | `/forum/thread/:postId` |

---

## 5. GemMaster Module (Moi - 2026-02-19)

Module GemMaster tren web duoc sync tu mobile app, bao gom 9 services, 12 components, 6 pages, va 3 hooks.

### 5.1 Services (9 file moi)

| Service | Dong | Supabase Tables | Chuc nang chinh |
|---------|------|-----------------|-----------------|
| `chatHistoryService.js` | 509 | `chatbot_conversations` | Create/save/load/delete conversations, auto-title, pagination, localStorage cache |
| `readingHistoryService.js` | 430 | `tarot_readings`, `iching_readings` | CRUD cho lich su Tarot & I-Ching readings |
| `streakService.js` | 502 | `user_streaks` | Streak tracking, levels (8 cap), XP, badges, milestones, weekly calendar |
| `gamificationService.js` | 692 | `user_achievements`, `daily_completions` | Achievement system, combo multiplier, daily quests, habit grid (GitHub-style) |
| `emotionDetectionService.js` | 422 | - | Nhan dien 16 cam xuc tu text, GEM Frequency mapping (20-700Hz) |
| `tarotSpreadService.js` | 430 | `tarot_spreads` (fallback: DEFAULT_SPREADS) | Spread data, tier gating, layout positions, localStorage last-used |
| `accessControlService.js` | 661 | `profiles` (RPC functions) | Tier-based feature gating, daily usage limits, upgrade prompts, fail-open on error |
| `ritualTrackingService.js` | 840 | `user_rituals`, `ritual_completions` | Custom ritual CRUD, completion tracking, streak integration, coaching messages |
| `userContextService.js` | 696 | `user_context_cache`, `profiles` | AI personalization context, 1h server cache, localStorage client cache |

**Tong cong**: 5,182 dong code moi cho services.

### 5.2 Components (12 file moi)

| Component | Dong | Mo ta | Animation |
|-----------|------|-------|-----------|
| `CardFlipAnimation.jsx` | 327 | Hieu ung lat bai Tarot | Framer Motion 3D flip |
| `CoinCastAnimation.jsx` | 456 | Hieu ung tung dong xu I-Ching | Framer Motion spring physics |
| `ConnectionStatus.jsx` | 513 | Hien thi trang thai ket noi Supabase | Pulse animation |
| `ConversationCard.jsx` | 271 | Card hoi thoai trong lich su chat | Hover scale |
| `EmptyHistoryState.jsx` | 176 | Trang thai trong khi chua co du lieu | Fade in |
| `HexagramBuilder.jsx` | 485 | Xay dung hexagram I-Ching (6 hao) | Line-by-line reveal |
| `QuotaIndicator.jsx` | 145 | Hien thi quota su dung con lai | Progress bar |
| `ShuffleAnimation.jsx` | 188 | Hieu ung xao bai truoc khi trai | Card shuffle sequence |
| `SpreadLayout.jsx` | 228 | Layout vi tri cac la bai tren ban | Position animation |
| `StreakDisplay.jsx` | 601 | Hien thi streak, level, XP progress | Number counting, glow |
| `TierBadge.jsx` | 88 | Badge hien thi tier nguoi dung | Color-coded glow |
| `UpgradeModal.jsx` | 322 | Modal nang cap khi dat gioi han tier | Slide up + backdrop |

**Tong cong**: 3,800 dong code moi cho components.

### 5.3 Pages (6 file moi)

| Page | Dong | Route | Mo ta |
|------|------|-------|-------|
| `ChatHistoryPage.jsx` | 525 | `/gemmaster/chat-history` | Lich su chat voi AI, tim kiem, xoa, archive |
| `ReadingHistoryPage.jsx` | 694 | `/gemmaster/readings` | Lich su boi Tarot/I-Ching, filter theo loai/ngay |
| `ReadingDetailPage.jsx` | 794 | `/gemmaster/readings/:id` | Chi tiet bai doc, hien thi cards/hexagram, interpretation |
| `SpreadSelectionPage.jsx` | 442 | `/gemmaster/spreads` | Chon kieu trai bai (Celtic Cross, 3 la, etc.), tier-gated |
| `TarotReadingPage.jsx` | 2,121 | `/gemmaster/reading` | Trai bai tuong tac 5 giai doan: chon spread -> dat cau hoi -> xao bai -> lat bai -> doc ket qua |
| `GamificationPage.jsx` | 775 | `/gemmaster/gamification` | Thanh tich, cap do, huy hieu, daily quests, habit grid |

**Tong cong**: 5,351 dong code moi cho pages.

### 5.4 Hooks (3 file moi)

| Hook | Dong | Return Values | Service Wrapped |
|------|------|---------------|-----------------|
| `useGamification.js` | 325 | `level, xp, xpToNext, xpProgress, achievements, totalPoints, dailyQuests, comboCount, multiplier, streak, loading, error, refreshGamification, completeQuest` | `gamificationService` |
| `useStreak.js` | 358 | `streakCount, longestStreak, level, levelName, levelColor, levelIcon, totalPoints, weeklyProgress, loading, error, refreshStreak, checkIn` | `streakService` |
| `useAccessControl.js` | 381 | `tier, canUse, getRemainingQuota, getFeatureConfig, showUpgradeModal, setShowUpgradeModal` | `accessControlService` |

### 5.5 Routes Moi

Tat ca GemMaster routes deu duoc protected boi `ProtectedRoute` va lazy-loaded voi `React.lazy()` + `Suspense`:

```
/gemmaster/chat-history     -> Lich su chat AI
/gemmaster/readings         -> Lich su boi Tarot/I-Ching
/gemmaster/readings/:id     -> Chi tiet bai doc
/gemmaster/spreads          -> Chon trai bai Tarot
/gemmaster/reading          -> Trai bai Tarot tuong tac (5 giai doan)
/gemmaster/gamification     -> Thanh tich, cap do, huy hieu
```

---

## 6. Design Tokens

He thong design tokens kep (dual system) dam bao nhat quan giua CSS va JS:

### 6.1 CSS Variables — `frontend/src/styles/design-tokens.css`

Dinh nghia tat ca CSS custom properties trong `:root`:

```css
:root {
  /* Background */
  --bg-base-dark: #0A0E27;
  --bg-card: rgba(30, 42, 94, 0.4);
  --bg-gradient: linear-gradient(135deg, #0A0E27 0%, #141B3D 50%, #1E2A5E 100%);

  /* Brand */
  --brand-burgundy: #9C0612;
  --brand-gold: #FFBD59;
  --brand-purple: #8B5CF6;

  /* Text, borders, spacing, ... */
}
```

Su dung trong CSS files:
```css
.card {
  background: var(--bg-card);
  border: 1px solid var(--brand-gold);
}
```

### 6.2 JS Exports — `web design-tokens.js` (root cua repo)

Export `COLORS`, `SPACING`, `TYPOGRAPHY`, `SHADOWS` cho inline styles va Framer Motion:

```js
import { COLORS, SPACING } from '../../../../web design-tokens';

<motion.div style={{ background: COLORS.bgCard, padding: SPACING.md }}>
```

### 6.3 Quy tac

- **KHONG** hardcode colors/spacing. Luon dung tokens.
- CSS files: dung `var(--ten-bien)`
- JS/JSX inline styles: import tu `web design-tokens.js`
- Import path tu pages/components: `'../../../../web design-tokens'` (tuong doi tu vi tri file)

---

## 7. Tier Access Matrix

| Feature | FREE | TIER1 | TIER2 | TIER3 |
|---------|------|-------|-------|-------|
| Pattern Scanner (basic) | 10 scans/ngay | 15/ngay | Unlimited | Unlimited |
| Paper Trading | 10 trades/ngay | 50/ngay | Unlimited | Unlimited |
| SL/TP Orders | Khong | Co | Co | Co |
| Portfolio Tracker | Khong | Khong | Co | Co |
| MTF Analysis | Khong | Khong | Co | Co |
| Sentiment Analyzer | Khong | Khong | Co | Co |
| News Calendar | Khong | Khong | Co | Co |
| Backtesting Engine | Khong | Khong | Khong | Co |
| AI Prediction | Khong | Khong | Khong | Co |
| Whale Tracker | Khong | Khong | Khong | Co |
| Chatbot (I-Ching/Tarot) | 5 msg/ngay | 30/ngay | 100/ngay | Unlimited |
| Voice Input | Khong | Co | Co | Co |
| Tarot Spreads | 3 basic | 6 spreads | 10 spreads | All spreads |
| Community Forum | Doc | Doc + Viet | Full | Full |
| Courses | Preview | Enrolled | Enrolled | All |
| PDF Export | Khong | Khong | Co | Co |
| Custom Rituals | 3 max | 10 max | 25 max | Unlimited |
| Vision Board Goals | 3 max | 10 max | 25 max | Unlimited |

**Implementation:**
- `TierGuard/TierGuard.jsx` — Component wrapper, redirect khi khong du tier
- `FeatureGate/FeatureGate.jsx` — Feature flags
- `accessControlService.js` — Server-side validation qua Supabase RPC
- `useAccessControl.js` — Hook cho React components

---

## 8. Database Migrations

### Migration moi nhat

| File | Ngay | Mo ta |
|------|------|-------|
| `20260219_paper_trading_unification.sql` | 2026-02-19 | Migrate web paper trading tables → mobile tables (cron monitors ALL trades) |
| `20260219_fix_gemmaster_web_sync_issues.sql` | 2026-02-19 | Fix `get_user_level_info` RPC bug (ROW constructor khong co field names) + RLS patch |
| `20260217_rls_fix_service_role_policies.sql` | 2026-02-17 | Fix 24 policies tren 23 tables: `TO {public}` -> `TO service_role` |
| `20260217_rls_enable_missing_tables.sql` | 2026-02-17 | Enable RLS tren 20 tables + them user policies |

### Cach apply migration moi

```bash
# Via Supabase CLI (tu root cua project)
supabase db push

# Hoac: chay migration cu the
supabase db push --include-all

# Hoac: via Supabase Dashboard
# 1. Mo Dashboard > SQL Editor
# 2. Copy noi dung file SQL
# 3. Chay query
```

### Paper Trading Unification Migration (2026-02-19)

Web paper trading tables da duoc thong nhat voi mobile tables de cron co the monitor tat ca trades.

**Truoc (4 web-only tables — cron KHONG monitor):**
```
paper_trading_accounts    → user_paper_trade_settings
paper_trading_holdings    → paper_trades WHERE status='OPEN'
paper_trading_orders      → paper_trades + paper_pending_orders
paper_trading_stop_orders → TP/SL columns tren paper_trades row
```

**Apply migration:**
```bash
# Via Supabase Dashboard > SQL Editor
# Copy noi dung: supabase/migrations/20260219_paper_trading_unification.sql
# Chay query

# Hoac via CLI:
supabase db push
```

**Verify sau khi apply:**
```sql
-- Kiem tra data da migrate thanh cong
SELECT count(*) FROM user_paper_trade_settings;  -- Co user records
SELECT count(*) FROM paper_trades WHERE trade_mode='custom' AND leverage=1;  -- Web trades
SELECT count(*) FROM paper_pending_orders;  -- Pending orders
```

**Luu y:** Old tables van ton tai (read-only backup 30 ngay). Frontend code da chuyen hoan toan sang mobile tables.

### Kiem tra RLS (chay sau khi apply):

```sql
-- Khong con policy nao cho phep {public} ghi voi USING(true)
SELECT tablename, policyname FROM pg_policies
WHERE schemaname='public' AND qual='true'
AND roles='{public}' AND cmd IN ('ALL','UPDATE','INSERT','DELETE');

-- Tat ca tables deu co RLS
SELECT tablename FROM pg_tables
WHERE schemaname='public' AND rowsecurity=false;
```

Ca hai query nen tra ve **0 rows**.

---

## 9. Quy Tac Quan Trong (Important Conventions)

### Database

| Quy tac | Mo ta |
|---------|-------|
| `from('profiles')` KHONG PHAI `from('users')` | Tat ca app code doc tu `profiles`. Webhooks va DB functions PHAI ghi vao `profiles`. |
| `follows` table KHONG ton tai | Dung `user_follows` hoac degrade gracefully voi empty arrays. |
| Paper trading: `paper_trades` la source of truth | KHONG dung `paper_trading_accounts/holdings/orders/stop_orders` (deprecated 2026-02-19). Xem Rule 20 trong `Web_Troubleshooting_Tips.md`. |
| RLS bat buoc | Moi table phai co RLS enabled + `service_role ALL` + user policies. |
| Affiliate ID | Dung `affiliate.user_id` (auth UUID), KHONG dung `affiliate.id` (table UUID). |

### Auth & State

| Quy tac | Mo ta |
|---------|-------|
| Dung `useAuth()` hook | KHONG goi `supabase.auth.getUser()` truc tiep — no tao API call khong can thiet. |
| Supabase client | Import tu `lib/supabaseClient` — KHONG tao client moi. |
| Loading state | LUON dung `try/finally { setLoading(false) }`. Khong gate loading cleanup tren requestId. |
| AbortController | MOI `fetch()` toi external API PHAI co AbortController timeout (10s). |

### UI & Styling

| Quy tac | Mo ta |
|---------|-------|
| Design tokens | Import tu `web design-tokens.js` (JS) hoac dung `var(--token)` (CSS). KHONG hardcode. |
| Mobile-first CSS | Base = mobile, `@media (min-width: 768px)` = tablet, `@media (min-width: 1024px)` = desktop. |
| Touch targets | Toi thieu 44px cho tat ca nut bam (theo iOS HIG). |
| Icons | Dung Lucide React. KHONG mix icon libraries. |

### Performance

| Quy tac | Mo ta |
|---------|-------|
| Lazy loading | Pages nang dung `React.lazy()` + `Suspense`. Xem App.jsx de biet nhung page nao. |
| Zustand stores | Dung cho state can share giua nhieu page (scanner, course, shop). Context cho auth/price. Scanner store chua: scanResults, selectedPattern, zones, highlightedZoneId — components doc truc tiep tu store (KHONG prop drilling). |
| localStorage cache | Services dung localStorage thay cho AsyncStorage (web). Cache expiry 24h. |

---

## 10. Lien Ket Tai Lieu

| Tai lieu | Mo ta |
|----------|-------|
| [`docs/README.md`](./README.md) | README cho mobile app (GEM Mobile) |
| [`docs/WEB_CODEBASE_ANALYSIS.md`](./WEB_CODEBASE_ANALYSIS.md) | Phan tich codebase web chi tiet (Jan 2026) |
| [`docs/MOBILE_CODEBASE_ANALYSIS.md`](./MOBILE_CODEBASE_ANALYSIS.md) | Phan tich codebase mobile |
| [`docs/SCANNER_TRADING_FEATURE_SPEC.md`](./SCANNER_TRADING_FEATURE_SPEC.md) | Spec Scanner/Trading v4.1 |
| [`docs/Troubleshooting_Tips.md`](./Troubleshooting_Tips.md) | 50 engineering rules tu Phase 1-13 |
| [`docs/RITUALS_VISION_BOARD_COMPLETE_FEATURE_SPEC.md`](./RITUALS_VISION_BOARD_COMPLETE_FEATURE_SPEC.md) | Spec Rituals & Vision Board |
| [`docs/HOME_FORUM_FEATURE_SPEC.md`](./HOME_FORUM_FEATURE_SPEC.md) | Spec Forum 3-column |
| [`docs/COURSES_SHOPIFY_COMPLETE_FEATURE_SPEC.md`](./COURSES_SHOPIFY_COMPLETE_FEATURE_SPEC.md) | Spec Courses & Shopify |
| [`docs/AFFILIATE_CTV_FEATURE_SPEC.md`](./AFFILIATE_CTV_FEATURE_SPEC.md) | Spec chuong trinh Affiliate/CTV |
| [`docs/TIER_NAMING.md`](./TIER_NAMING.md) | Quy uoc dat ten Tier |
| [`docs/DEPLOYMENT_CHECKLIST.md`](./DEPLOYMENT_CHECKLIST.md) | Checklist deploy production |
| [`docs/GEM_ROLES_QUOTA_ACCESS_CONTROL_REPORT.md`](./GEM_ROLES_QUOTA_ACCESS_CONTROL_REPORT.md) | Bao cao roles & quota |
| [`docs/SCANNER_SYNC_MASTER_PLAN.md`](./SCANNER_SYNC_MASTER_PLAN.md) | Ke hoach sync Scanner web-mobile |
| [`TAISAN_MASTER_PLAN.md`](../TAISAN_MASTER_PLAN.md) | Ke hoach sync Tai San (Account) web-mobile |
| [`TAISAN_GAP_ANALYSIS.md`](../TAISAN_GAP_ANALYSIS.md) | Gap analysis chi tiet giua mobile Account va web Account |
| [`docs/Web_Troubleshooting_Tips.md`](./Web_Troubleshooting_Tips.md) | 19 engineering rules cho web frontend |

---

## 11. Tai San Module (Moi - 2026-02-19)

Module Tai San (Account/Profile) tren web duoc sync tu mobile AccountScreen, bao gom 5 pages moi, 2 components moi, va nhieu cai tien cho AccountDashboard.

### 11.1 Pages Moi (5 pages)

| Page | Dong | Route | Mo ta |
|------|------|-------|-------|
| `DailyCheckinPage.jsx` | ~350 | `/daily-checkin` | Check-in streak, calendar grid, 6 milestones. RPCs: `perform_daily_checkin`, `get_checkin_status` |
| `OrdersPage.jsx` | ~300 | `/orders` | Merge `subscription_invoices` + `pending_payments`, 6 filter tabs, expandable cards |
| `TransactionHistoryPage.jsx` | ~280 | `/transactions` | `gems_transactions` voi pagination 20/page, type filters (credit/debit/purchase/gift/bonus) |
| `PrivacySettings.jsx` | ~250 | `/settings/privacy` | 6 toggles + 2 selects, reads `profiles` + `user_settings` JSONB, debounced auto-save |
| `PartnershipRegistration.jsx` | ~320 | `/partnership/register` | CTV/KOL type, form validation, referral code check, duplicate prevention |

### 11.2 Components Moi (2 components)

| Component | Dong | Mo ta |
|-----------|------|-------|
| `EditProfileModal.jsx` | 210 | Inline modal: avatar upload (Supabase Storage 'avatars' bucket), full_name, username, bio |
| `AffiliateSection.jsx` | 204 | 4-state dynamic: no-affiliate (register CTA), pending, rejected, active (referral code + stats) |

### 11.3 AccountDashboard Enhancements (10 features)

1. **VisionBoard Card** — Navigation card den `/vision-board`
2. **UpgradeBanner** — Gold gradient cho FREE tier, link den `/pricing`
3. **AdminPanel Badges** — Pending counts tu `partnership_applications` + `withdrawal_requests`
4. **GemEconomy Section** — Buy Gems (`/shop`) + Daily Checkin (`/daily-checkin`)
5. **MyOrders Section** — All orders (`/orders`) + Link order (`/link-order`)
6. **AffiliateSection** — 4-state dynamic component (thay the static link)
7. **EditProfileModal** — Inline edit thay vi navigate away
8. **UserBadges** — Badge display next to display name
9. **PrivacySettings Link** — trong Cai Dat section
10. **TransactionHistory Quick Action** — "Giao Dich" button

### 11.4 Critical Bug Fix: `from('users')` → `from('profiles')`

**46 occurrences** fixed across **13 source files**. Xem Rule 13 trong `Web_Troubleshooting_Tips.md`.

Files da fix:
- `AuthContext.jsx` (4), `AuthContext.tsx` (4), `useAuth.ts` (1), `useAuth.js` (1)
- `Admin.jsx` (5), `BadgeManagement.jsx` (2)
- `messaging.js` (8), `messaging_improved.js` (3), `events.js` (7)
- `leaderboard.js` (1), `settingsService.js` (3), `userProfile.js` (6)
- `TelegramConnect.jsx` (3), `testSupabase.js` (1)

Verification:
```bash
# Phai tra ve 0 ket qua (tru comments va .backup files)
grep -rn "from('users')" frontend/src/ --include='*.jsx' --include='*.js' --include='*.tsx' --include='*.ts' | grep -v '.backup' | grep -v '// ' | grep -v ' \* '
```

---

## 12. Forum/Community Module (Moi - 2026-02-19)

Module Forum/Community tren web duoc sync tu mobile app ForumScreen, dat feature parity 100% voi mobile. Bao gom 5 services, 13 components, 6 pages moi, va 4 hooks.

### 12.1 Services (5 file moi/enhanced)

| Service | Dong | Supabase Tables/RPCs | Chuc nang chinh |
|---------|------|----------------------|-----------------|
| `forum.js` | 1027 | `forum_posts`, `post_reactions`, `forum_saved`, `post_edit_history`, `scheduled_posts`, `post_views`, `post_boosts` | Enhanced: toggleReaction (6 types), updatePost (edit history), schedulePost, getPostAnalytics, getEditHistory, getPostsByHashtag, pinPost, hidePost, boostPost, recordView |
| `feedService.js` | 405 | RPC `get_personalized_feed`, `user_follows`, `custom_feeds` | FeedService: 5 feed types (personalized/following/popular/latest/academy), custom feed CRUD, getTrendingHashtags, recordImpression |
| `commentService.js` | 247 | `forum_comments`, `comment_reactions` | Threaded comments: flat-to-tree builder, createComment with thread_depth, toggleCommentReaction, reportComment |
| `karmaService.js` | 73 | RPC `get_user_karma`, `karma_history` | Karma display, leaderboard, history |
| `linkPreviewService.js` | 92 | Edge fn `fetch-link-preview` | URL preview fetch, 10-min Map cache, extractUrls regex |

**Tong cong**: ~1,844 dong code moi/enhanced cho services.

### 12.2 Components (13 file moi/enhanced)

| Component | Dong | Mo ta |
|-----------|------|-------|
| `PostCard.jsx` | 832 | Enhanced: 6-type reaction picker (like/love/haha/wow/sad/angry), TrendingBadge, PinnedBadge, boosted badge, LinkPreviewCard, QuotedPost, ImageLightbox, @mention highlighting, hashtag click |
| `PostCreationModal.jsx` | 741 | Enhanced: MentionInput, auto URL detection, schedule toggle, tag chips, image drag-drop, character count, preview mode |
| `CenterFeed.jsx` | 273 | Enhanced: IntersectionObserver sentinel for infinite scroll, PostSkeleton loading, ScrollToTop |
| `ThreadedComments.jsx` | 256 | NEW: Tree structure, sort toggle, collapse/expand, load more |
| `CommentItem.jsx` | 303 | NEW: Avatar, tier badge, @mention, 3 quick reactions, reply, edit/delete, thread connector |
| `LinkPreviewCard.jsx` | 103 | NEW: Full/compact variants, loading skeleton, error fallback |
| `PostSkeleton.jsx` | 43 | NEW: CSS-only shimmer animation |
| `ImageLightbox.jsx` | 157 | NEW: Portal, dark overlay, arrow nav, counter, ESC/swipe close |
| `ReactionDisplay.jsx` | 120 | NEW: Top 3 emoji + counts, hover tooltip |
| `MentionInput.jsx` | 233 | NEW: @mention autocomplete, debounced search, arrow key nav |
| `ScrollToTop.jsx` | 43 | NEW: Floating button, Framer Motion fade |
| `QuotedPost.jsx` | 69 | NEW: Gold left border, content snippet, deleted fallback |
| `TrendingBadge.jsx` + `PinnedBadge.jsx` | 40 | NEW: Trending/Pinned visual badges |

**Tong cong**: ~3,213 dong code moi/enhanced cho components.

### 12.3 Pages (6 file moi + 5 enhanced)

| Page | Dong | Route | Mo ta |
|------|------|-------|-------|
| `EditPost.jsx` | 296 | `/forum/edit/:postId` | Author-only edit form, tag editor, image management |
| `UserProfile.jsx` | 366 | `/forum/user/:userId` | Profile with follow/stats/tabs (Posts/Liked/Saved) |
| `HashtagFeed.jsx` | 206 | `/forum/hashtag/:tag` | Hashtag filtered infinite scroll feed |
| `PostAnalytics.jsx` | 323 | `/forum/post/:postId/analytics` | Recharts, reaction breakdown, top commenters |
| `ScheduledPosts.jsx` | 236 | `/forum/scheduled` | Scheduled post management, publish/delete |
| `EditHistory.jsx` | 220 | `/forum/post/:postId/history` | Edit history with diff view |
| `Forum3Column.jsx` | 390 | `/forum` | Enhanced: infinite scroll, feed type switching, custom feeds, skeleton loading |
| `ThreadDetail.jsx` | 600 | `/forum/thread/:threadId` | Enhanced: threaded comments, 6-type reactions, mentions |
| `CreateThread.jsx` | 561 | `/forum/new` | Enhanced: @mention, link preview, schedule post |
| `LeftSidebar.jsx` | 419 | (component) | Enhanced: karma display, custom feed CRUD |
| `RightSidebar.jsx` | 336 | (component) | Enhanced: karma leaderboard with crown icons |

**Tong cong**: ~3,953 dong code moi/enhanced cho pages.

### 12.4 Hooks (4 file moi)

| Hook | Dong | Return Values | Service Wrapped |
|------|------|---------------|-----------------|
| `usePosts.js` | 125 | `posts, loading, hasMore, error, fetchNextPage, refresh` | `feedService` (7 feed types) |
| `useComments.js` | 119 | `comments, loading, error, addComment, editComment, deleteComment, toggleReaction` | `commentService` |
| `useReactions.js` | 109 | `reactions, userReaction, toggleReaction, loading` | `forum.toggleReaction` (optimistic) |
| `useKarma.js` | 57 | `karma, leaderboard, history, loading` | `karmaService` |

### 12.5 Routes Moi

Tat ca Forum routes deu lazy-loaded voi `React.lazy()` + `Suspense`:

```
/forum                          -> Forum 3-column layout (infinite scroll)
/forum/new                      -> Tao bai viet moi (@mention, schedule, link preview)
/forum/thread/:threadId         -> Chi tiet bai viet (threaded comments, 6 reactions)
/forum/edit/:postId             -> Chinh sua bai viet (author-only)
/forum/user/:userId             -> Profile nguoi dung (follow, tabs)
/forum/hashtag/:tag             -> Feed theo hashtag
/forum/post/:postId/analytics   -> Thong ke bai viet (charts, reactions)
/forum/post/:postId/history     -> Lich su chinh sua (diff view)
/forum/scheduled                -> Bai viet da len lich
```

---

## 13. Scanner Zone Drawing & Store Refactor (2026-02-19)

Scanner page da duoc refactor de match mobile app: zone drawing tren chart + Zustand store thay the prop drilling.

### 13.1 Architecture

```
Zustand scannerStore.js (single source of truth)
  ├── scanResults[]           # Tat ca pattern results tu scan
  ├── selectedPattern         # Pattern dang duoc chon
  ├── zones[]                 # Zone boundaries (zoneHigh, zoneLow, zoneType)
  ├── highlightedZoneId       # Zone dang highlight tren chart
  └── isScanning              # Loading state

Components doc tu store (KHONG props):
  ControlPanel.jsx     → reads: isScanning, scanResults
  ResultsList.jsx      → reads: scanResults, selectedPattern; writes: setSelectedPattern
  TradingChart.jsx     → reads: selectedPattern, zones, highlightedZoneId
  SubToolsPanel.jsx    → reads: selectedPattern (alias: pattern)
  PatternInfoUltraCompact.jsx → reads: selectedPattern (alias: pattern)

Chi giu props cho side-effect callbacks:
  onScan (ControlPanel)       → ScannerPage orchestrates quota check + toast
  onOpenPaperTrading (ResultsList, ControlPanel) → ScannerPage manages side panel
```

### 13.2 Zone Drawing (Canvas Overlay)

TradingChart.jsx dung canvas overlay (khong phai HTML divs) de ve zones — match mobile approach:

| Element | Color | Style |
|---------|-------|-------|
| TP zone | `rgba(0, 255, 136, 0.12)` | Filled rectangle (entry ↔ TP) |
| SL zone | `rgba(246, 70, 93, 0.12)` | Filled rectangle (entry ↔ SL) |
| Entry line | `#00FFFF` (cyan) | Solid 2px |
| SL line | `#F6465D` (red) | Dashed 1.5px |
| TP line | `#00FF88` (green) | Dashed 1.5px |
| Labels | Respective colors | Bold 11px monospace, right-aligned |

Canvas redraws via `requestAnimationFrame` loop — auto-follows zoom/pan via `priceToCoordinate()`.

### 13.3 Zone Calculation (scannerAPI.js)

Moi scan result bao gom zone data:
```
LONG (SL < entry):  zoneHigh = entry,    zoneLow = stopLoss,  zoneType = 'LFZ'
SHORT (SL > entry): zoneHigh = stopLoss, zoneLow = entry,     zoneType = 'HFZ'
```

### 13.4 Enhanced ResultsList UI

Moi result card hien thi them:
- **Direction badge**: LONG (green) / SHORT (red) voi TrendingUp/TrendingDown icon
- **R:R ratio**: `1:X.XX` voi CheckCircle icon neu >= 2.0
- **Confidence bar**: 3px progress bar (green/yellow/red) duoi confidence %

### 13.5 Files Modified (8 files)

| File | Lines | Thay doi |
|------|-------|---------|
| `stores/scannerStore.js` | 73→91 | +zones, +highlightedZoneId, +setZones, +clearZones |
| `services/scannerAPI.js` | 345→355 | +zoneHigh, +zoneLow, +zoneType per result |
| `TradingChart.jsx` | 1319→1480 | +canvas overlay, +drawZones, +requestAnimationFrame loop, reads from store |
| `ScannerPage.jsx` | 393→405 | Removed prop drilling, +setZones after scan |
| `ControlPanel.jsx` | 183→183 | Reads isScanning/scanResults from store |
| `ResultsList.jsx` | 199→218 | Reads from store, +direction badge, +R:R, +confidence bar |
| `SubToolsPanel.jsx` | 283→283 | Reads pattern from store |
| `PatternInfoUltraCompact.jsx` | 896→898 | Reads pattern from store |

### 12.6 Design Token Compliance

Tat ca 12 CSS files trong Forum module da duoc audit:
- 150+ hardcoded hex colors converted sang `var(--token, #fallback)`
- Mobile-first responsive: base = mobile, `@media (min-width: 768px)` = tablet, `@media (min-width: 1024px)` = desktop
- Touch targets: tat ca interactive elements >= 44px

### 12.7 6-Type Reaction System

Dong bo voi mobile app:

| ID | Emoji | Label (VI) |
|----|-------|------------|
| `like` | 👍 | Thich |
| `love` | ❤️ | Yeu thich |
| `haha` | 😂 | Ha ha |
| `wow` | 😮 | Wow |
| `sad` | 😢 | Buon |
| `angry` | 😡 | Tuc gian |

Database: `post_reactions` table (user_id, post_id, reaction_type). Unique constraint tren (user_id, post_id) — moi user chi 1 reaction/post.
