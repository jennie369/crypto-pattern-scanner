# PHASE 5 MASTER PLAN — 13 Critical System Fixes
## Created: 2026-02-14
## Branch: `critical-system-audit-fix` (backup commit: `3065c12`)

---

## SYSTEM ROOT CAUSE MAP

| # | Issue | Root Cause | Category |
|---|-------|-----------|----------|
| 1 | Black screen infinite loading | No timeout on `supabase.auth.getUser()` — hangs forever on slow/offline network | **Auth/Startup** |
| 2 | Journal keyboard breaks layout | Android `behavior=undefined` on KeyboardAvoidingView + missing `keyboardVerticalOffset` on iOS | **UI/Layout** |
| 3 | Trading psychology template broken | `FIELD_TYPES.SELECT` not rendered in `FormFieldRenderer.js` + CHECKLIST `defaultItems` not initialized | **UI/Forms** |
| 4 | Product detail right side cut off | `HTMLRenderer.js` hardcodes `width: SCREEN_WIDTH - 64` but actual padding chain totals 80px+ | **UI/Layout** |
| 5 | Chatbot wrong affiliate info | `gemKnowledge.json` has outdated 4-tier system with wrong commission rates (should be 5-tier v3.0) | **Data/Content** |
| 6 | Burger menu filters not working | `forumCache` has no feed key — cache returns stale posts from previous feed within 30s TTL | **Logic/Cache** |
| 7 | Boost analytics wrong data | Fabricated reach (70% of views), inflated clicks (reactions+comments counted), `Math.random()` daily stats | **Data Integrity** |
| 8 | Email order linking broken | Order number format mismatch ("#1001" vs "1001") + `supabase.sql` template literal doesn't exist in SDK | **Logic/DB** |
| 9 | Affiliate referral code mismatch | 5 sources of truth for referral code + old tier names `['beginner','growing','master','grand']` still in UI | **Data/Architecture** |
| 10 | Karma dashboard crash | Service returns `{success, data}` wrapper but screen uses raw value — `.findIndex()` on object crashes | **Logic/API** |
| 11 | Scanner Decision Point crash | Triple field-name mismatch: detector returns `entryPrice`/`stopPrice`/`tradingBias`, enricher expects `entry`/`stopLoss`/`direction` | **Logic/Scanner** |
| 12 | Admin affiliate stats wrong style | Inconsistent design tokens (COLORS.bgCard vs GLASS.card) + hardcoded mock data in analytics | **UI/Style** |
| 13 | Share link/deep link broken | No `expo.scheme` at root, no `ios.associatedDomains`, no web landing page, no OG meta, URL path mismatch | **Infra/Config** |

---

## FILES IMPACTED (per issue)

### Issue #1 — Black Screen (4 files)
- `gem-mobile/src/contexts/AuthContext.js` (loadSession, lines 414-484)
- `gem-mobile/src/services/supabase.js` (timeout only for /rest/v1/)
- `gem-mobile/src/navigation/AppNavigator.js` (loading gate, lines 148-258)
- `gem-mobile/src/services/AppResumeManager.js` (no initial-load recovery)

### Issue #2 — Journal Keyboard (3 files)
- `gem-mobile/src/screens/VisionBoard/JournalEntryScreen.js` (lines 552-554)
- `gem-mobile/src/screens/VisionBoard/TradingJournalScreen.js` (lines 707-710)
- `gem-mobile/src/components/GemMaster/TemplateInlineForm.js` (lines 312-314)

### Issue #3 — Psychology Template (2 files)
- `gem-mobile/src/services/templates/journalTemplates.js` (lines 1064-1237)
- `gem-mobile/src/components/shared/templates/FormFieldRenderer.js` (missing SELECT renderer)

### Issue #4 — Product Detail Cut Off (2 files)
- `gem-mobile/src/components/Common/HTMLRenderer.js` (line 204, hardcoded width)
- `gem-mobile/src/screens/Shop/ProductDetailScreen.js` (line 1858, padding)

### Issue #5 — Chatbot Affiliate Info (2 files)
- `gem-mobile/src/data/gemKnowledge.json` (lines 1637-1666, affiliate_guide)
- `gem-mobile/src/data/helpArticles.js` (lines 505-700+, affiliate article)

### Issue #6 — Burger Filters (1 file)
- `gem-mobile/src/screens/Forum/ForumScreen.js` (lines 55-60 cache, 490-502 useEffect, 1099-1112 handleFeedChange)

### Issue #7 — Boost Analytics (2 files)
- `gem-mobile/src/services/boostService.js` (lines 444-584 analytics, 401-420 tracking)
- `gem-mobile/src/screens/Monetization/BoostAnalyticsScreen.js` (displays fabricated data)

### Issue #8 — Order Linking (3 files)
- `gem-mobile/src/services/orderService.js` (lines 708-830)
- `gem-mobile/src/screens/Orders/LinkOrderScreen.js` (line 281, 498-500)
- `gem-mobile/src/services/affiliateService.js` (line 360, same supabase.sql bug)

### Issue #9 — Referral Code (5 files)
- `gem-mobile/src/screens/tabs/AccountScreen.js` (line 602)
- `gem-mobile/src/screens/Account/AffiliateDetailScreen.js` (lines 222-283)
- `gem-mobile/src/screens/tabs/components/AffiliateSection.js` (line 157)
- `gem-mobile/src/services/affiliateService.js` (lines 260, 289, 307-320)
- `gem-mobile/src/services/partnershipService.js` (lines 48-104)

### Issue #10 — Karma Crash (2 files)
- `gem-mobile/src/screens/Karma/KarmaDashboardScreen.js` (lines 79, 113-114, 159, 205, 332)
- `gem-mobile/src/services/karmaService.js` (returns {success, data} wrapper — correct)

### Issue #11 — Scanner DP Crash (4 files)
- `gem-mobile/src/services/scanner/patternEnricherService.js` (lines 133-134, 158-162, 172-174)
- `gem-mobile/src/services/decisionPointDetector.js` (lines 73-110)
- `gem-mobile/src/services/zoneCalculator.js` (lines 76-92)
- `gem-mobile/src/screens/Scanner/PatternDetailScreen.js` (line 135)

### Issue #12 — Admin Stats Style (2 files)
- `gem-mobile/src/screens/Admin/AdminPartnershipDashboard.js` (lines 474-763)
- `gem-mobile/src/screens/Admin/Analytics/AffiliateAnalyticsScreen.js` (lines 55-101, 294-392)

### Issue #13 — Deep Link/Share (5+ files)
- `gem-mobile/app.json` (missing scheme, associatedDomains)
- `gem-mobile/src/services/shareService.js` (URL path mismatch)
- `gem-mobile/src/services/deepLinkHandler.js` (missing /post/{id} pattern)
- `gem-mobile/src/services/affiliateService.js` (placeholder App Store URLs)
- NEW: Need OG edge function or web landing page
- NEW: Need apple-app-site-association + assetlinks.json

**TOTAL: ~40 files impacted across 13 issues**

---

## RISK LEVEL PER ISSUE

| # | Issue | Risk | Regression Risk | Users Affected |
|---|-------|------|----------------|----------------|
| 1 | Black screen | **CRITICAL** | Medium — auth flow change | ALL users (intermittent) |
| 9 | Referral code mismatch | **CRITICAL** | High — 5 sources to unify | All affiliates (financial) |
| 5 | Chatbot wrong affiliate | **CRITICAL** | Low — data update only | All users asking about affiliate |
| 7 | Boost fake analytics | **CRITICAL** | Medium — analytics rewrite | All boosting users (trust/legal) |
| 11 | Scanner DP crash | **HIGH** | Medium — enricher change | All scanner users |
| 10 | Karma dashboard crash | **HIGH** | Low — screen-only fix | All users opening karma |
| 8 | Order linking broken | **HIGH** | Medium — flow change | Users linking Shopify orders |
| 6 | Burger menu filters | **HIGH** | Low — cache invalidation | All forum users |
| 3 | Psychology template broken | **HIGH** | Low — add renderer | VIP users only |
| 4 | Product detail cut off | **HIGH** | Low — CSS change | All shop users |
| 13 | Deep link/share broken | **HIGH** | Medium — config change | All sharing users |
| 2 | Journal keyboard | **MEDIUM** | Low — KAV config | Journal users on Android |
| 12 | Admin stats style | **MEDIUM** | Low — style only | Admins only |

---

## FIX PRIORITY ORDER

### Priority 1 — CRITICAL (Fix First)
| Order | Issue | Why First | Est. Complexity |
|-------|-------|-----------|-----------------|
| 1st | #1 Black screen | Blocks ALL users | Medium — timeout + fallback |
| 2nd | #10 Karma crash | Instant crash, easy fix | Low — unwrap {success, data} |
| 3rd | #11 Scanner DP crash | Core feature broken | Low — add field aliases to enricher |
| 4th | #6 Burger filters | Core feature, 1-line cache fix | Low — invalidate cache on feed change |

### Priority 2 — HIGH (Fix Next)
| Order | Issue | Why | Est. Complexity |
|-------|-------|-----|-----------------|
| 5th | #9 Referral code | Financial impact, 5 sources | High — unify to single source |
| 6th | #8 Order linking | Blocks access grants | Medium — format normalize + fix supabase.sql |
| 7th | #5 Chatbot affiliate | Wrong info, easy data fix | Low — update JSON + helpArticles |
| 8th | #7 Boost analytics | Trust issue, fake data | Medium — remove fabrication, add real tracking |
| 9th | #3 Psychology template | VIP feature broken | Medium — add SELECT renderer |

### Priority 3 — MEDIUM (Fix Last)
| Order | Issue | Why | Est. Complexity |
|-------|-------|-----|-----------------|
| 10th | #4 Product detail | Layout issue | Low — change width to 100% |
| 11th | #2 Journal keyboard | Android-specific | Low — KAV behavior + offset |
| 12th | #12 Admin stats | Admin only, style | Low — token swap + real data |
| 13th | #13 Deep link/share | Requires infra (domains) | HIGH — needs server config |

---

## ARCHITECTURE DECISIONS NEEDED (require confirmation)

### Decision 1: Issue #9 — Single Source of Truth for Referral Code
**Option A**: Use `affiliate_codes` table as canonical → sync to `profiles.affiliate_code` via DB trigger
**Option B**: Use `profiles.affiliate_code` as canonical → deprecate `affiliate_codes.code` for main code
**Option C**: Create centralized `getReferralCode()` utility that reads from `affiliate_codes` first, falls back to `profiles`, generates + persists if neither exists
**Recommendation**: Option C (least disruptive, works today)

### Decision 2: Issue #7 — Boost Analytics Approach
**Option A**: Replace fabricated data with real per-day aggregation (needs `boost_daily_stats` table migration)
**Option B**: Show only totals (remove daily breakdown chart), clearly label "Ước tính" for reach
**Option C**: Keep daily chart but derive from actual `feed_impressions` grouped by date
**Recommendation**: Option B for now (fastest, honest), migrate to Option C later

### Decision 3: Issue #13 — Deep Link Infrastructure
**Option A**: Full implementation (Supabase edge function for OG + web landing + apple-app-site-association + assetlinks.json)
**Option B**: Partial — fix app.json config + URL paths only, skip OG/web landing for now
**Option C**: Use Firebase Dynamic Links or Branch.io for complete deep link solution
**Recommendation**: Option B for this phase (config fixes), plan Option A for next phase

### Decision 4: Issue #8 — Order Linking Fix Strategy
**Option A**: Fix client-side format normalization + replace `supabase.sql` with RPC
**Option B**: Create single `link_order_by_number` RPC that handles all normalization server-side
**Recommendation**: Option B (atomic, no `supabase.sql` needed)

---

## IMPLEMENTATION TEAM STRUCTURE

### Team Alpha: Core & Scanner (Issues #1, #10, #11, #6)
- Auth timeout + startup fallback
- Karma data unwrapping
- Scanner enricher field aliases
- Forum cache feed tracking
- **Files**: ~11 files

### Team Beta: Business Logic (Issues #9, #8, #5, #7)
- Referral code unification
- Order linking normalization + RPC
- Chatbot affiliate data update
- Boost analytics cleanup
- **Files**: ~14 files

### Team Gamma: UI & Config (Issues #3, #4, #2, #12, #13)
- FormFieldRenderer SELECT type
- HTMLRenderer width fix
- Journal KeyboardAvoidingView
- Admin stats design tokens
- App.json deep link config
- **Files**: ~13 files

---

## TEST PLAN (per issue)

### Issue #1 — Black Screen
- [ ] Airplane mode → open app → login screen within 15s
- [ ] 2G throttled → open app → recovers within 15s
- [ ] Expired token + offline → clears session, shows login
- [ ] Normal launch → identical behavior to current

### Issue #2 — Journal Keyboard
- [ ] iOS: tap bottom TextInput → content scrolls above keyboard
- [ ] Android: tap bottom TextInput → content visible above keyboard
- [ ] Test on devices with/without soft nav bar

### Issue #3 — Psychology Template
- [ ] Open "Tâm Lý Giao Dịch Nâng Cao" template
- [ ] Session type SELECT renders with 3 options
- [ ] Bias checklist shows all 8 predefined items
- [ ] Rule violations shows 6 predefined items + add button
- [ ] Save with all fields → data persists correctly

### Issue #4 — Product Detail
- [ ] Product with HTML description → no right-side cutoff
- [ ] Products with tables → horizontally scrollable
- [ ] Test on iPhone SE (small) and iPhone 15 Pro Max (large)

### Issue #5 — Chatbot Affiliate
- [ ] Ask "Hướng dẫn trở thành affiliate" → 5 CTV tiers listed
- [ ] KOL tier with 20K+ followers requirement shown
- [ ] Correct digital/physical commission split
- [ ] Navigation points to "Tài Sản" tab

### Issue #6 — Burger Filters
- [ ] Switch feeds within 30s → correct posts load each time
- [ ] All 9 category feeds show relevant posts
- [ ] Same-feed within 30s → cache still works

### Issue #7 — Boost Analytics
- [ ] Refresh 3x → daily stats don't change randomly
- [ ] Clicks = actual clicks only (not reactions+comments)
- [ ] Reach labeled as "Ước tính" if estimated

### Issue #8 — Order Linking
- [ ] Enter "1001" when DB has "#1001" → matches
- [ ] Enter "#1001" when DB has "1001" → matches
- [ ] After link → `verified_linked_emails` array updated
- [ ] Full OTP flow: request → verify → link → check DB

### Issue #9 — Referral Code
- [ ] AccountScreen, AffiliateDetailScreen, AffiliateSection show SAME code
- [ ] Share link contains correct code
- [ ] Log out + log in → code unchanged
- [ ] Bronze tier → next tier shows "Silver" (not "beginner")
- [ ] New user with no code → fallback generates AND persists

### Issue #10 — Karma Dashboard
- [ ] Open dashboard → no crash
- [ ] Overview tab: karma points, level, progress bar visible
- [ ] Leaderboard tab: user list renders correctly
- [ ] Next level card: correct name and points remaining

### Issue #11 — Scanner Decision Point
- [ ] Scanner detects DP Bullish → shows correct entry price (not $0)
- [ ] Click DP Bullish → PatternDetailScreen opens with chart
- [ ] DP Bearish also works
- [ ] PatternCard shows green LONG (not NEUTRAL)
- [ ] Scanner state preserved after clicking pattern

### Issue #12 — Admin Stats Style
- [ ] Partnership dashboard uses glass card style
- [ ] Analytics shows real data (not hardcoded)
- [ ] Dark mode: sufficient contrast on all cards

### Issue #13 — Deep Link Config
- [ ] `expo.scheme: "gem"` in app.json root
- [ ] `ios.associatedDomains` configured
- [ ] Share URL uses `/forum/thread/{id}` (matches deep link handler)
- [ ] In-app link opens correct screen

---

## DB MIGRATIONS NEEDED

1. **RPC `link_order_by_number`** (Issue #8) — atomic order linking with format normalization
2. **RPC `append_verified_email`** (Issue #8) — dedup-safe array_append for verified_linked_emails
3. **RPC `increment_boost_impressions`** (Issue #7) — verify existence, create if missing
4. **RPC `increment_boost_clicks`** (Issue #7) — verify existence, create if missing
5. **Optional: `boost_daily_stats` table** (Issue #7) — if choosing real daily tracking

## SUPABASE EDGE FUNCTIONS NEEDED

1. **Optional: `og-image`** (Issue #13) — generates OG meta tags for shared URLs (Phase 6)

---

## ROLLBACK PLAN

- Backup branch: `critical-system-audit-fix` at commit `3065c12`
- Each fix will be committed separately with clear commit messages
- If any fix causes regression: `git revert <commit-hash>`
- DB migrations use `IF NOT EXISTS` — safe to re-run
- No destructive schema changes planned

---

**STATUS: AUDIT COMPLETE — AWAITING CONFIRMATION TO IMPLEMENT**
