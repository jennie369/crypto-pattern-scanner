# TAISAN WEB SYNC — MASTER IMPLEMENTATION PLAN

## Ngày: 2026-02-19
## Dựa trên: TAISAN_GAP_ANALYSIS.md
## Design tokens: `web design-tokens.js` (COLORS, SPACING, TYPOGRAPHY, RADIUS, SHADOWS, ANIMATION, BREAKPOINTS)

---

## ENFORCEMENT RULES (Áp dụng cho TẤT CẢ phases)

1. **Design Tokens**: Import from `web design-tokens.js`. KHÔNG hardcode colors/spacing.
2. **Mobile First**: Base CSS = mobile (320px). `@media (min-width: 768px)` = tablet. `@media (min-width: 1024px)` = desktop.
3. **Touch targets**: Min 44x44px on all clickable elements.
4. **Access Control**: Tier-gated features use `accessControlService.js`. Admin features check `profile.is_admin`.
5. **Loading/Error/Empty states**: EVERY page must have all 3 states.
6. **Tooltips**: Add tooltips on stat cards, action buttons, and tier badges.
7. **Edge Cases**: Handle null profile, no network, expired session, concurrent updates.
8. **Supabase patterns**: Use `from('profiles')` NOT `from('users')`. Always check error. Use optional chaining.

---

## PHASE 0: CRITICAL BUG FIX — `users` vs `profiles` Table Mismatch (Est: 2-3 hours)

**THIS MUST BE DONE FIRST** — all other work depends on correct data source.

### Problem:
Web frontend uses `from('users')` in multiple files. Mobile uses `from('profiles')`.
The `profiles` table is the single source of truth (Memory Rule #1).

### Files to FIX:

| File | Fix |
|------|-----|
| `frontend/src/contexts/AuthContext.jsx` | Change `from('users')` → `from('profiles')` for profile loading |
| `frontend/src/services/userProfile.js` | Change ALL `from('users')` → `from('profiles')`. Update column names if needed |
| `frontend/src/services/settingsService.js` | Change subscription queries `from('users')` → `from('profiles')` |
| `frontend/src/pages/Account/components/NewsFeed.jsx` | Change `author_id` → `user_id` |

### Verification:
After fix, grep entire frontend for `from('users')` — should return 0 results (except auth.users which is Supabase Auth).

---

## PHASE 1: NAMING & ROUTING (Est: 2-3 hours)

### 1.1 Files to MODIFY:

| File | Changes |
|------|---------|
| `frontend/src/App.jsx` | Add `/tai-san` route alias → AccountDashboard, keep `/account` with redirect |
| `frontend/src/pages/Account/AccountDashboard.jsx` | Update page title to "Tài Sản" |
| `frontend/src/pages/Account/AccountDashboard.css` | No change needed |
| `frontend/src/components/TopNavBar.jsx` | Update nav label if "Account" shown → "Tài Sản" |
| `frontend/src/components/CompactSidebar/*.jsx` | Update sidebar label if applicable |

### 1.2 Route changes:
```
/tai-san        → AccountDashboard (NEW primary)
/account        → Redirect to /tai-san (backwards compat)
/tai-san/profile → ProfilePage (alias for /profile)
```

---

## PHASE 2: ACCOUNT DASHBOARD ENHANCEMENTS (Est: 1-2 days)

### 2.1 Add Vision Board Card

Add a clickable Vision Board card between My Courses and Admin Panel, matching the App's design.

**File**: `frontend/src/pages/Account/AccountDashboard.jsx`
**Insert after**: Stats Row / View Profile button
**Data**: No new data needed — just a navigation card
**Link**: `/vision-board`

### 2.2 Add Upgrade Banner

Add UpgradeBanner for non-premium users between Vision Board and Admin Panel.

**File**: `frontend/src/pages/Account/AccountDashboard.jsx`
**Condition**: `profile?.scanner_tier === 'FREE' || !profile?.scanner_tier`
**Link**: `/pricing`
**Design**: Gold gradient border, sparkles icon, "Nâng cấp tài khoản" title

### 2.3 Enhance Admin Panel

Expand from 1 button to full admin section with badges.

**File**: `frontend/src/pages/Account/AccountDashboard.jsx`
**New queries**: `partnership_applications` (count pending), `withdrawal_requests` (count pending)
**Buttons**: Quản lý hệ thống, Đơn đăng ký (badge), Rút tiền (badge), Users, Quản lý khóa học, Cấp quyền

### 2.4 Add Gem Economy Section

New section with Buy Gems and Daily Checkin links.

**File**: `frontend/src/pages/Account/AccountDashboard.jsx`
**Links**: Buy Gems → `/shop`, Daily Checkin → `/daily-checkin` (new page or modal)
**Badge**: "+5" gem badge on Daily Checkin

### 2.5 Add My Orders Section

New section with order links.

**File**: `frontend/src/pages/Account/AccountDashboard.jsx`
**Links**: All orders → `/orders`, Link order → `/link-order`
**Note**: May need new pages for `/orders` and `/link-order`

### 2.6 Enhance Affiliate Section

Replace simple menu link with dynamic AffiliateSection component.

**Files to CREATE**:
| File | Description |
|------|-------------|
| `frontend/src/components/account/AffiliateSection.jsx` | Dynamic section: shows register CTA if not affiliate, or stats if affiliate |
| `frontend/src/components/account/AffiliateSection.css` | Styles |

**Data**: Query `affiliate_profiles` for user status, show different UI based on status.

### 2.7 Add Transaction History Quick Action

Add "Giao Dịch" button to Quick Actions Grid.

**File**: `frontend/src/pages/Account/AccountDashboard.jsx`
**Link**: `/transactions` (new page) or expand existing

### 2.8 Add User Badges to Profile Header

Import and display UserBadge component.

**Files to CREATE or MODIFY**:
| File | Description |
|------|-------------|
| `frontend/src/components/UserBadge/UserBadge.jsx` | Badge display component (if not exists) |
| `frontend/src/pages/Account/AccountDashboard.jsx` | Add badges next to display name |

### 2.9 Add Privacy Settings Link

Add privacy settings to Cài Đặt section.

**File**: `frontend/src/pages/Account/AccountDashboard.jsx`
**Link**: `/settings/privacy`

### 2.10 Add Edit Profile Modal (Inline)

Create an inline edit modal instead of navigating away.

**Files to CREATE**:
| File | Description |
|------|-------------|
| `frontend/src/components/account/EditProfileModal.jsx` | Modal with avatar upload, name, bio, username editing |
| `frontend/src/components/account/EditProfileModal.css` | Styles |

**Features**: Avatar upload to Supabase Storage, form validation, save to `profiles` table.

---

## PHASE 3: NEW PAGES (Est: 2-3 days)

### 3.1 Daily Checkin Page/Modal

**Files to CREATE**:
| File | Description |
|------|-------------|
| `frontend/src/pages/DailyCheckin/DailyCheckinPage.jsx` | Checkin UI with streak display |
| `frontend/src/pages/DailyCheckin/DailyCheckin.css` | Styles |

**DB**: Calls RPC `perform_daily_checkin(user_id)`, reads `get_checkin_status(user_id)`
**Route**: `/daily-checkin`

### 3.2 Orders Page

**Files to CREATE**:
| File | Description |
|------|-------------|
| `frontend/src/pages/Orders/OrdersPage.jsx` | Shopify order list |
| `frontend/src/pages/Orders/Orders.css` | Styles |

**DB**: Query `subscription_invoices` + `pending_payments`
**Route**: `/orders`

### 3.3 Transaction History Page

**Files to CREATE**:
| File | Description |
|------|-------------|
| `frontend/src/pages/Transactions/TransactionHistoryPage.jsx` | Gem transaction log |
| `frontend/src/pages/Transactions/TransactionHistory.css` | Styles |

**DB**: Query `gems_transactions` or `wallet_transactions` for user
**Route**: `/transactions`

### 3.4 Privacy Settings Page

**Files to CREATE**:
| File | Description |
|------|-------------|
| `frontend/src/pages/Settings/PrivacySettings.jsx` | Privacy controls |
| `frontend/src/pages/Settings/PrivacySettings.css` | Styles |

**DB**: Update `profiles` (public_profile, show_stats) + `user_settings` (privacy JSONB)
**Route**: `/settings/privacy`

### 3.5 Partnership Registration Page

**Files to CREATE**:
| File | Description |
|------|-------------|
| `frontend/src/pages/Partnership/PartnershipRegistration.jsx` | CTV/Affiliate registration form |
| `frontend/src/pages/Partnership/PartnershipRegistration.css` | Styles |

**DB**: Insert to `partnership_applications`, create `affiliate_profiles`
**Route**: `/partnership/register`

---

## PHASE 4: MOBILE RESPONSIVE AUDIT (Est: 1 day)

### Files to AUDIT and FIX:

| File | Priority |
|------|----------|
| `frontend/src/pages/Account/AccountDashboard.css` | P0 |
| `frontend/src/pages/Account/ProfilePage.css` | P0 |
| `frontend/src/pages/AffiliateDashboard.css` | P1 |
| `frontend/src/pages/VisionBoard/VisionBoardPage.css` | P1 |
| `frontend/src/pages/Portfolio.css` | P1 |
| `frontend/src/pages/EnhancedSettings/EnhancedSettings.css` | P2 |
| `frontend/src/pages/Pricing.css` | P2 |

### Checklist per file:
- [ ] Base styles = mobile (no media query needed)
- [ ] `@media (min-width: 768px)` for tablet
- [ ] `@media (min-width: 1024px)` for desktop
- [ ] Grid → single column on mobile
- [ ] Touch targets ≥ 44px
- [ ] Font sizes ≥ 14px
- [ ] Horizontal scroll for tables on mobile
- [ ] Test at 320px, 375px, 768px, 1024px, 1440px

---

## PHASE 5: DESIGN TOKENS MIGRATION (Est: 0.5 day)

### Option A: CSS Variables (Recommended)
Create `frontend/src/styles/design-tokens.css` with CSS variables, import globally.

### Option B: Import in JS
Import `web design-tokens.js` directly in components that use inline styles.

### Current state: Most CSS files use hardcoded colors. Migration scope:
- `AccountDashboard.css` — replace all hex colors with CSS vars
- `ProfilePage.css` — same
- All new components should use tokens from day 1

---

## PHASE 6: TESTING & QA (Est: 1 day)

### Functionality Tests:
- [ ] Avatar display and upload works
- [ ] Profile edit saves correctly (modal)
- [ ] Vision Board card navigates correctly
- [ ] Upgrade banner shows for FREE tier, hidden for paid
- [ ] Admin panel shows with badges for admin users
- [ ] Gem Economy: Buy Gems link works, Daily Checkin works
- [ ] Orders page loads and displays correctly
- [ ] Affiliate section shows register CTA or stats based on status
- [ ] Transaction history loads with pagination
- [ ] Privacy settings save correctly
- [ ] Partnership registration form submits
- [ ] All menu items navigate correctly
- [ ] Logout with confirmation works
- [ ] Refresh button reloads all data

### Mobile Responsive Tests:
- [ ] 320px (iPhone SE)
- [ ] 375px (iPhone 12/13)
- [ ] 390px (iPhone 14)
- [ ] 768px (iPad)
- [ ] 1024px (Desktop)
- [ ] 1440px (Large desktop)

### Edge Cases:
- [ ] No user (redirect to login)
- [ ] User with no profile data (safe fallbacks)
- [ ] User with no affiliate account (show register CTA)
- [ ] User with 0 gems (display "0" not undefined)
- [ ] Admin with 0 pending items (no badge shown)
- [ ] Network error during data load (error state with retry)
- [ ] Session expired during page (redirect to login)
- [ ] Very long display name (text truncation)
- [ ] Very long bio (line clamp)
- [ ] RTL text support
- [ ] Avatar upload > 5MB (error message)
- [ ] Avatar upload wrong format (error message)
- [ ] Concurrent edit from app and web (last write wins)
- [ ] Empty transaction history (empty state)
- [ ] Empty orders list (empty state)
- [ ] Slow network (skeleton loading)
- [ ] Rapid navigation between sections (no stale data)
- [ ] Browser back button behavior
- [ ] Deep link to specific section
- [ ] Tier expired mid-session (banner should appear)

---

## IMPLEMENTATION ORDER

```
Phase 1 → Phase 2.1-2.2 (Vision Board + Upgrade) → Phase 2.3-2.9 (Account enhancements)
    → Phase 2.10 (Edit Modal) → Phase 3 (New pages) → Phase 4 (Responsive)
    → Phase 5 (Design tokens) → Phase 6 (Testing)
```

### Files Summary:

**MODIFY** (existing files):
1. `frontend/src/App.jsx` — routes
2. `frontend/src/pages/Account/AccountDashboard.jsx` — major enhancements
3. `frontend/src/pages/Account/AccountDashboard.css` — responsive + tokens
4. `frontend/src/components/TopNavBar.jsx` — naming

**CREATE** (new files):
1. `frontend/src/components/account/AffiliateSection.jsx` + `.css`
2. `frontend/src/components/account/EditProfileModal.jsx` + `.css`
3. `frontend/src/components/account/UpgradeBanner.jsx` + `.css`
4. `frontend/src/components/account/VisionBoardCard.jsx` + `.css`
5. `frontend/src/components/account/AdminPanel.jsx` + `.css`
6. `frontend/src/components/account/GemEconomySection.jsx` + `.css`
7. `frontend/src/components/account/OrdersSection.jsx` + `.css`
8. `frontend/src/pages/DailyCheckin/DailyCheckinPage.jsx` + `.css`
9. `frontend/src/pages/Orders/OrdersPage.jsx` + `.css`
10. `frontend/src/pages/Transactions/TransactionHistoryPage.jsx` + `.css`
11. `frontend/src/pages/Settings/PrivacySettings.jsx` + `.css`
12. `frontend/src/pages/Partnership/PartnershipRegistration.jsx` + `.css`
13. `frontend/src/styles/design-tokens.css` (CSS variables)

**Total**: ~4 files to modify, ~26 new files to create

---

## DB REQUIREMENTS

No new migrations needed. All tables exist with RLS.

**New queries needed on Web**:
1. `partnership_applications` (count pending) — admin only
2. `withdrawal_requests` (count pending) — admin only
3. `gems_transactions` — transaction history page
4. `daily_checkins` + RPCs — daily checkin feature
5. `subscription_invoices` + `pending_payments` — orders page

**New RPCs to call from Web**:
1. `perform_daily_checkin(user_id)` — exists
2. `get_checkin_status(user_id)` — exists
3. `get_affiliate_stats(user_id)` — exists

No new edge functions needed.
