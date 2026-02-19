# TÀI SẢN (APP) vs PROFILE/TÀI SẢN (WEB) — GAP ANALYSIS

## Ngày phân tích: 2026-02-19
## Phân tích bởi: Agent Team (app-analyzer, web-analyzer, db-analyzer, team-lead)

---

## 0. NAMING CONSISTENCY

| Item | App (Mobile) | Web (Frontend) | Gap | Action |
|------|-------------|----------------|-----|--------|
| Tab/Page name | "Tài Sản" (AccountScreen) | "Account Dashboard" (AccountDashboard) | **MISMATCH** | Rename to "Tài Sản" |
| Route | Tab: Account | `/account` | OK-ish | Add `/tai-san` alias with redirect |
| Nav label | Tab icon "Tài sản" | TopNavBar: unclear | **CHECK** | Update nav label |
| Page title | N/A (native tab) | "Account Dashboard" | **MISMATCH** | Change to "Tài Sản" |

---

## 1. FEATURE COMPARISON MATRIX

### 1A. PROFILE HEADER

| Feature | App | Web | Gap | Priority |
|---------|-----|-----|-----|----------|
| Avatar display | ✅ (Image/gradient fallback) | ✅ (img/placeholder) | Minor: App has gradient initial, Web has icon | P2 |
| Avatar upload/change | ✅ (EditProfileModal) | ❌ (clicks → /profile, no upload) | **GAP** | P1 |
| Display name | ✅ | ✅ | OK | — |
| Username (@handle) | ✅ | ✅ | OK | — |
| Bio | ✅ (2 lines) | ✅ | OK | — |
| Edit button → modal | ✅ (EditProfileModal inline) | ❌ (navigates to /settings/profile) | **Different UX** | P1 |
| UserBadges display | ✅ (UserBadges component) | ❌ (no badges) | **GAP** | P1 |
| Tier badge | ❌ (no inline tier badge on header) | ❌ | Both missing | P2 |
| View Full Profile button | ✅ → ProfileFull screen | ✅ → /profile page | OK | — |

### 1B. STATS ROW

| Feature | App | Web | Gap | Priority |
|---------|-----|-----|-----|----------|
| Posts count | ✅ (forumService.getUserStats) | ✅ (forum_posts count) | OK | — |
| Followers count | ✅ | ✅ (user_follows) | OK | — |
| Following count | ✅ | ✅ (user_follows) | OK | — |
| Clickable stats | ✅ (navigate to ProfileFull) | ✅ (/profile?tab=xxx) | OK | — |

### 1C. MY COURSES SECTION

| Feature | App | Web | Gap | Priority |
|---------|-----|-----|-----|----------|
| My courses section | ✅ (MyCoursesSection component) | ✅ (menu items: all courses, in progress) | Partially matched | P2 |
| Enrolled count | ✅ | ✅ (course_enrollments) | OK | — |
| In-progress count | ✅ | ✅ | OK | — |
| Course progress display | ✅ (dedicated component) | ❌ (just menu link) | **GAP** | P2 |

### 1D. VISION BOARD

| Feature | App | Web | Gap | Priority |
|---------|-----|-----|-----|----------|
| Vision Board card/link | ✅ (Pressable card → VisionBoard) | ❌ (no link from Account page) | **GAP** | P0 |
| VisionBoardPage | ✅ (full screen with gamification) | ✅ (`/vision-board` exists) | OK but not linked from Account | P0 |
| Create goal | ✅ (GoalDetailScreen) | ✅ (/vision-board/goals/new) | OK | — |
| Goal detail | ✅ | ✅ (/vision-board/goals/:id) | OK | — |
| Habits tracking | ✅ (HabitCard, habit_logs) | ✅ (HabitCard component) | OK | — |
| Affirmations | ✅ (AffirmationCard) | ✅ (AffirmationCard) | OK | — |
| Daily score | ✅ (DailyScoreCard) | ✅ (DailyScoreCard) | OK | — |
| Rituals | ✅ (RitualPlayground) | ✅ (separate /rituals route) | OK | — |
| Streak badges | ✅ | ✅ (StreakBadge) | OK | — |
| Calendar | ✅ (CalendarScreen) | ❌ | **GAP** | P2 |
| Achievements | ✅ (AchievementsScreen) | ❌ | **GAP** | P2 |
| Trading Journal | ✅ (TradingJournalScreen) | ❌ | **GAP** | P3 |

### 1E. AI LIVESTREAM

| Feature | App | Web | Gap | Priority |
|---------|-----|-----|-----|----------|
| AI Livestream card | ✅ (→ LivestreamList) | ❌ | **GAP** | P3 |

### 1F. UPGRADE BANNER

| Feature | App | Web | Gap | Priority |
|---------|-----|-----|-----|----------|
| Upgrade banner (free users) | ✅ (UpgradeBanner component) | ❌ (no upgrade prompt on Account) | **GAP** | P0 |
| Tier upgrade screen | ✅ (TierUpgradeScreen) | ✅ (/pricing page exists) | Link missing from Account | P0 |

### 1G. ADMIN PANEL

| Feature | App | Web | Gap | Priority |
|---------|-----|-----|-----|----------|
| Admin panel (isAdmin) | ✅ (full: applications, withdrawals, users, courses, grant access, exchange affiliate) | ✅ (basic: just link to /admin) | **GAP** - Web missing quick stats | P1 |
| Pending applications badge | ✅ (count badge) | ❌ | **GAP** | P1 |
| Pending withdrawals badge | ✅ (count badge) | ❌ | **GAP** | P1 |
| Quick action buttons | ✅ (6 buttons) | ❌ (1 button) | **GAP** | P1 |

### 1H. ASSET STATS CARDS

| Feature | App | Web | Gap | Priority |
|---------|-----|-----|-----|----------|
| Gems card | ✅ (→ Wallet) | ✅ (→ /shop) | Different target | P1 |
| Gems VND value | ✅ (gems × 200) | ✅ | OK | — |
| Thu nhập card | ✅ (→ Earnings) | ✅ (→ /affiliate) | Different target | P1 |
| Affiliate card | ✅ (→ AffiliateDashboard) | ✅ (→ /affiliate) | OK | — |

### 1I. QUICK ACTIONS GRID

| Feature | App | Web | Gap | Priority |
|---------|-----|-----|-----|----------|
| Ví Gems | ✅ (→ Wallet) | ✅ (Mua Gems → /shop) | OK | — |
| Thu nhập | ✅ (→ Earnings) | ✅ (→ /affiliate) | OK | — |
| Giao Dịch (history) | ✅ (→ EarningsHistory) | ❌ | **GAP** | P1 |
| Boost (boosted posts) | ✅ (→ BoostedPosts) | ❌ | **GAP** | P2 |
| Portfolio | ✅ (→ Portfolio) | ✅ (→ /portfolio) | OK | — |
| Âm Thanh (Sound Library) | ✅ (→ SoundLibrary) | ❌ | **GAP** | P3 |
| Nâng cấp | ❌ (in quick actions) | ✅ (→ /pricing) | Web has it | — |

### 1J. GEM ECONOMY SECTION

| Feature | App | Web | Gap | Priority |
|---------|-----|-----|-----|----------|
| Buy Gems link | ✅ (→ GemPackList) | ❌ (no dedicated section) | **GAP** | P1 |
| Daily Checkin link (+5 badge) | ✅ (→ DailyCheckin) | ❌ | **GAP** | P1 |

### 1K. MY ORDERS SECTION

| Feature | App | Web | Gap | Priority |
|---------|-----|-----|-----|----------|
| All orders | ✅ (→ MyOrders) | ❌ | **GAP** | P1 |
| Link order (email mismatch) | ✅ (→ LinkOrder) | ❌ | **GAP** | P1 |

### 1L. AFFILIATE SECTION

| Feature | App | Web | Gap | Priority |
|---------|-----|-----|-----|----------|
| Dynamic affiliate section | ✅ (AffiliateSection component) | ❌ (just menu link to /affiliate) | **GAP** | P0 |
| Affiliate dashboard | ✅ (AffiliateDashboard screen) | ✅ (/affiliate page) | OK | — |
| Referral code copy | ✅ (Clipboard) | ✅ (navigator.clipboard) | OK | — |
| Commission stats | ✅ | ✅ | OK | — |
| Referral list | ✅ | ✅ | OK | — |
| Commission history | ✅ | ✅ | OK | — |
| Withdrawal request | ✅ (WithdrawRequestScreen) | ✅ (tab in AffiliateDashboard) | OK | — |
| KPI bonuses | ✅ | ✅ | OK | — |
| Partnership registration | ✅ (PartnershipRegistrationScreen) | ❌ | **GAP** | P1 |
| Partner resource center | ✅ (PartnerResourceCenter) | ❌ | **GAP** | P2 |
| Partner notification center | ✅ (PartnerNotificationCenter) | ❌ | **GAP** | P2 |
| Affiliate detail screen | ✅ (AffiliateDetailScreen) | ❌ | **GAP** | P2 |

### 1M. PORTFOLIO / TÀI SẢN SECTION

| Feature | App | Web | Gap | Priority |
|---------|-----|-----|-----|----------|
| Portfolio link | ✅ (→ Portfolio) | ✅ (→ /portfolio) | OK | — |
| Exchange accounts | ✅ (→ ExchangeAccounts) | ❌ | **GAP** | P2 |
| Paper trade history | ✅ (→ PaperTradeHistory) | ❌ (exists as PaperTrading component but not linked) | **GAP** | P2 |
| Karma Dashboard | ✅ (→ KarmaDashboard) | ❌ | **GAP** | P3 |
| Personal insights | ✅ (PersonalInsightsScreen) | ❌ | **GAP** | P3 |

### 1N. SETTINGS SECTION

| Feature | App | Web | Gap | Priority |
|---------|-----|-----|-----|----------|
| Personal info | ✅ (→ ProfileSettings) | ✅ (→ /settings/profile) | OK | — |
| Change password | ✅ (ChangePasswordModal) | ✅ (→ /settings/password) | Different UX (modal vs page) | P2 |
| Biometric login toggle | ✅ (Switch + modal) | ❌ (N/A for web) | Expected gap | — |
| Notification settings | ✅ (→ NotificationSettings) | ✅ (→ /settings/notifications) | OK | — |
| Privacy settings | ✅ (→ PrivacySettings) | ❌ | **GAP** | P1 |
| Close friends | ✅ (→ CloseFriends) | ❌ | **GAP** | P2 |
| Saved posts | ✅ (→ SavedPosts) | ✅ (→ /forum/saved) | OK | — |
| App settings (language/theme/currency) | ✅ (→ Settings full screen) | ✅ (/settings EnhancedSettings) | OK | — |

### 1O. OTHER SECTION

| Feature | App | Web | Gap | Priority |
|---------|-----|-----|-----|----------|
| Help & Support | ✅ (→ HelpSupport) | ✅ (→ /help) | OK | — |
| Terms of Service | ✅ (→ Terms) | ✅ (→ /terms) | OK | — |
| Logout | ✅ (with confirm alert) | ✅ (with window.confirm) | OK | — |

### 1P. MODALS/OVERLAYS

| Feature | App | Web | Gap | Priority |
|---------|-----|-----|-----|----------|
| Edit Profile Modal | ✅ (EditProfileModal) | ❌ (navigates away) | **Different UX** | P1 |
| Change Password Modal | ✅ (ChangePasswordModal) | ❌ (navigates away) | **Different UX** | P2 |
| Biometric Setup Modal | ✅ | ❌ (N/A) | Expected | — |
| Confetti celebration | ✅ (milestone celebrations) | ❌ | **GAP** | P3 |

### 1Q. SPONSOR BANNERS

| Feature | App | Web | Gap | Priority |
|---------|-----|-----|-----|----------|
| Sponsor banners | ✅ (useSponsorBanners hook) | ❌ | **GAP** | P3 |

---

## 2. STRUCTURE COMPARISON

### APP Structure (Mobile AccountScreen):
```
Tab "Tài Sản" (AccountScreen.js — ~1600 lines)
├── Profile Header (avatar, name, badges, edit button)
├── View Full Profile button → ProfileFull
├── My Courses Section (MyCoursesSection component)
├── Vision Board Card → VisionBoard screen
├── AI Livestream Card → LivestreamList
├── Upgrade Banner (free users) → TierUpgrade
├── Admin Panel (if admin) — 6 quick action buttons
├── Asset Stats Cards (Gems, Thu nhập, Affiliate)
├── Quick Actions Grid (6 cards: Ví Gems, Thu nhập, Giao dịch, Boost, Portfolio, Âm thanh)
├── Gem Economy Section (Buy Gems, Daily Checkin)
├── Đơn Hàng Section (All orders, Link order)
├── Affiliate Section (dynamic AffiliateSection component)
├── Tài Sản Section (Portfolio, Exchange Accounts, Paper Trade, Karma)
├── Cài Đặt Section (Profile, Password, Biometric, Notifications, Privacy, Close Friends, Saved, App Settings)
├── Khác Section (Help, Terms, Logout)
├── Sponsor Banners
└── Modals (EditProfile, ChangePassword, BiometricSetup, Confetti)
```

### WEB Structure (AccountDashboard.jsx — ~800 lines):
```
Page "/account" (AccountDashboard.jsx)
├── Profile Header (avatar, name, username, bio, edit button → /settings/profile)
├── Stats Row (posts, followers, following)
├── View Full Profile button → /profile
├── Admin Panel (if admin) — 1 button to /admin
├── Asset Stats Cards (Gems, Thu nhập, Affiliate)
├── Quick Actions Grid (4 cards: Mua Gems, Thu nhập, Portfolio, Nâng cấp)
├── Khóa Học Section (All courses, In progress)
├── Tài Sản Section (Portfolio, Scanner)
├── Cài Đặt Section (Profile, Password, Notifications, Saved posts)
├── Khác Section (Help, Terms, Logout)
└── Refresh button
```

---

## 3. CRITICAL GAPS SUMMARY (P0-P1)

### P0 — Must Fix Before Launch:
1. **Vision Board link missing** from Account page on Web
2. **Upgrade Banner missing** on Web Account page (critical for conversion)
3. **Affiliate section** on Account page is just a menu link (should be dynamic component like App)
4. **Naming**: "Account Dashboard" → "Tài Sản"

### P1 — High Priority:
5. **User badges** not showing on Web profile header
6. **Edit Profile Modal** — Web navigates away instead of inline modal
7. **Gem Economy section** missing (Buy Gems, Daily Checkin)
8. **My Orders section** missing (All orders, Link order)
9. **Admin Panel** — Web only has 1 button, App has 6 with badges
10. **Privacy settings** page missing on Web
11. **Partnership registration** page missing on Web
12. **Giao dịch (transaction history)** quick action missing
13. **Avatar upload** not working from Account page on Web

---

## 4. DATABASE DEPENDENCIES

All tables exist and have RLS enabled. No new migrations needed for gap sync.

| Table | App Uses | Web Uses | Status |
|-------|----------|----------|--------|
| profiles | ✅ | ✅ | OK |
| forum_posts | ✅ | ✅ | OK |
| user_follows | ✅ | ✅ | OK |
| affiliate_profiles | ✅ | ✅ | OK |
| affiliate_sales | ✅ | ❌ (uses affiliate_profiles) | Minor diff |
| gems_transactions | ✅ | ❌ | Web needs this for transaction history |
| course_enrollments | ✅ | ✅ | OK |
| vision_goals + 13 tables | ✅ | ✅ (via VisionBoardContext) | OK |
| portfolio_items | ✅ | ✅ | OK |
| user_wallets | ✅ | ❌ | Web could use for balance |
| daily_checkins | ✅ | ❌ | Web needs for daily checkin feature |
| partnership_applications | ✅ (admin) | ❌ | Web needs for admin badges |
| withdrawal_requests | ✅ (admin) | ❌ | Web needs for admin badges |

---

## 5. DESIGN TOKENS STATUS

**Web design-tokens.js** exists at project root with:
- COLORS (19 colors matching mobile)
- TIER_STYLES (FREE/TIER1/TIER2/TIER3)
- GRADIENTS (7 gradients + CSS versions)
- SPACING (8-point grid, 9 values)
- TYPOGRAPHY (10 font sizes, 4 weights, 3 line heights)
- RADIUS (6 values)
- SHADOWS (5 shadow types + 4 glow effects)
- ANIMATION (Framer Motion presets)
- BREAKPOINTS (6 breakpoints: 375-1536px)

**Current Web CSS approach**: Plain CSS with BEM-like class names (`.account-profile-section`, `.account-stat-item`). No CSS modules. No design token imports in CSS. **Hardcoded colors throughout `.css` files.**

**Action needed**: Either migrate to CSS variables from design tokens, or import tokens in components.

---

## 6. CRITICAL BUGS FOUND DURING ANALYSIS

### BUG #1 (P0): `users` vs `profiles` Table Mismatch on Web
**Impact**: Data split — some web pages read/write wrong table.

| Web File | Table Used | Should Be |
|----------|-----------|-----------|
| `contexts/AuthContext.jsx` | `from('users')` | `from('profiles')` |
| `services/userProfile.js` | `from('users')` | `from('profiles')` |
| `pages/Account/ProfilePage.jsx` (via userProfile.js) | `from('users')` | `from('profiles')` |
| `services/settingsService.js` | `from('users')` for subscription | `from('profiles')` |
| `pages/Account/AccountDashboard.jsx` | `from('profiles')` for gems | **CORRECT** |
| `components/account/ProfileHeader.jsx` | `from('profiles')` for updates | **CORRECT** |

**Fix**: All web code must use `from('profiles')` — same as mobile. The `users` table may not even have the same columns.

### BUG #2 (P1): Unused Reusable Components
6 components in `frontend/src/components/account/` are NEVER imported:
- ProfileHeader.jsx, StatsRow.jsx, AssetStatsCards.jsx, QuickActionsGrid.jsx, AdminPanel.jsx, SettingsMenu.jsx
- AccountDashboard.jsx reimplements everything inline (802 lines)
- **Fix**: Refactor AccountDashboard to use these components, or delete them

### BUG #3 (P1): Missing Routes
AccountDashboard links to routes that don't exist in App.jsx:
- `/settings/profile` — EnhancedSettings handles internally but no direct route
- `/settings/password` — same
- `/settings/notifications` — same
- `/help` — no route defined
- `/terms` — no route defined
- `/forum/saved` — no route defined
- **Fix**: Add missing routes or use EnhancedSettings hash routing

### BUG #4 (P1): Portfolio Not Tier-Gated
- `/portfolio` route has NO TierGuard despite TIER2 comment in App.jsx
- **Fix**: Add TierGuard wrapping or decide if it should be free

### BUG #5 (P2): NewsFeed Column Mismatch
- `Account/components/NewsFeed.jsx` queries `author_id` — should be `user_id`

### BUG #6 (P2): ProfilePage.jsx `from('users')` + Missing URL Params
- `/profile?tab=posts/followers/following` — ProfilePage doesn't read URL params
- Profile data loaded from `users` table, not `profiles`

---

## 7. MOBILE RESPONSIVE STATUS

| Web Component | Mobile Ready | Issues |
|---------------|-------------|--------|
| AccountDashboard | ⚠️ Partial | No explicit breakpoints in CSS |
| ProfilePage | ⚠️ Partial | Unknown |
| AffiliateDashboard | ⚠️ Partial | Unknown |
| VisionBoardPage | ⚠️ Partial | Has some responsive |
| Portfolio | ⚠️ Partial | Unknown |
| EnhancedSettings | ⚠️ Partial | Unknown |
| Pricing | ⚠️ Partial | Unknown |

**Action needed**: Full mobile-first CSS audit and refactor for all Account-related pages.
