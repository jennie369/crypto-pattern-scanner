# Phase 7 — Fix Report
## AI Chat UX, Deep Links, Chatbot Logic, Ritual Nav, Auth/Tier Recovery
**Date**: 2026-02-15 | **Plan**: `PHASE_7_MASTER_PLAN.md`

---

## Problem Statement

Five user-reported issues persisted after Phase 5-6 fixes:

1. **AI Brain chat**: No typing indicator while AI responds — user sees blank area
2. **Deep links**: Shared URLs from Messenger show blank dark blue page
3. **Chatbot knowledge**: Course query triggers journal/goal form instead of course info
4. **Ritual navigation**: Direct nav without chat CTA, back goes to Home, stuck in wrong tab
5. **Admin role lost**: Admin user shows FREE badge and quota exhausted after app resume

---

## Issue 1: AI Brain Typing Indicator

### What changed
- `AdminAIChatModal.js`: Added existing `TypingIndicator` component as `ListFooterComponent`
- Renders animated 3-dot indicator when `loading === true`
- Auto-scrolls FlatList to keep typing dots visible

### Architectural decision
Reused existing `TypingIndicator` from GemMaster (DRY) instead of creating a new one.
Gold accent and dark theme already matched AdminAI design.

---

## Issue 2: Deep Links Blank Page

### What changed
- **og-meta edge function**: Full rewrite with bot/crawler detection, smart redirect landing page
- **well-known edge function**: New — serves AASA and assetlinks.json
- **shareService.js**: All share URLs route through Supabase og-meta function
- **affiliateService.js, partnershipService.js**: Smart link generation
- **3 Affiliate screens**: Updated to use smart links
- **constants.js**: Centralized `SMART_LINK_BASE` and `generateSmartLink()`
- **AppNavigator.js**: Added React Navigation `linking` config with prefixes

### Root cause
gemral.com is managed by Shopify which can't serve custom routes. Share URLs pointed to
Shopify paths it didn't know, returning a blank page. The og-meta edge function existed
on Supabase but no traffic was routed to it.

### Alternatives considered
1. **Firebase Dynamic Links** — Rejected: adds Firebase dependency, Google lock-in
2. **Vercel redirect rules** — Rejected: gemral.com DNS controlled by Shopify
3. **Supabase edge function proxy** (chosen): Works independently, serves OG tags + redirect

### Trade-offs
- Share URLs are longer (Supabase project URL) until custom domain (go.gemral.com) is configured
- AASA/assetlinks need manual DNS + certificate setup (documented in well-known function)

### Remaining manual steps
- Deploy `og-meta` and `well-known` functions: `supabase functions deploy og-meta well-known`
- DNS: CNAME `go.gemral.com` to Supabase project URL
- Replace Team ID and SHA-256 fingerprint placeholders in well-known function
- Upload `og-default.png` to Supabase Storage `assets` bucket

---

## Issue 3: Chatbot Keyword Collision

### What changed
- **GemMasterScreen.js**: `handleSend` accepts `options.skipFormDetection` flag; FAQ handlers
  for course_detail, courses_overview, message_crystal, affiliate_info pass this flag
- **intentDetectionService.js**: Added course exclusion patterns to `detectTemplateIntent()`
- **GemMasterScreen.js**: Added course exclusion to `detectGoalAffirmationIntent()`

### Root cause
Keywords "manifest" and "mục tiêu" in the course name "Khóa Tư Duy Triệu Phú - Manifest
Tiền Bạc" matched the `prosperity_frequency` template, triggering a journal/goal form.

### Architectural decision
3-layer defense:
1. **FAQ flag**: Explicit `skipFormDetection` for known informational queries
2. **Course exclusions**: Regex patterns that bypass form detection entirely
3. **Priority chain**: Course intent checked before form/widget detection

### Alternatives considered
- NLP-based intent classification — Rejected: over-engineering for regex-based system
- Removing keywords from template triggers — Rejected: would break legitimate form triggers

---

## Issue 4: Ritual Navigation

### What changed
- **GemMasterScreen.js**: `navigate_ritual` handler now adds AI chat message with `actionButtons`
  array containing CTA "Bat dau Nghi thuc" instead of direct navigation
- **GemMasterStack.js**: Registered `LetterToUniverseRitual` in GemMaster stack

### Root cause
Handler called `navigation.navigate('Account', { screen: 'LetterToUniverseRitual' })` directly.
This opened the ritual in Account tab (wrong stack), and back navigation returned to Account root
instead of GemMaster chat.

### Correct flow (after fix)
1. Quick select → AI message with description + CTA button
2. User taps CTA → ritual opens within GemMaster stack
3. Back → `navigation.goBack()` returns to chat

---

## Issue 5: Admin Role Lost on App Resume

### What changed
- **GemMasterScreen.js**: Replaced local `user`/`userTier` state with `useAuth()` hook.
  Added `useFocusEffect` to refresh quota on tab switch. Added `useEffect` on
  `[user?.id, userTier, isAdmin]` to re-fetch quota when tier changes.
- **TarotScreen.js**: Same pattern — replaced local state with `useAuth()`
- **IChingScreen.js**: Same pattern — replaced local state with `useAuth()`

### Root cause
`GemMasterScreen.fetchUserAndTier()` ran only on initial mount. AuthContext refreshes profile
on app resume (via AppState listener + `refreshProfile()`), but the screen's local `userTier`
state never re-synced. Result: admin user shows FREE badge after app resumes.

### Architectural decision
Screens should derive tier/role from AuthContext (single source of truth), not cache locally.
Grepped entire codebase for `TierService.getUserTier` in screens and fixed all 3 instances.

### Risk
If AuthContext.refreshProfile() itself fails (network error), screen will use last-known tier.
This is acceptable — shows slightly stale data rather than wrong data.

---

## Integration Points

| Fix | Affects | Coordinates with |
|-----|---------|-----------------|
| Auth (Issue 5) | GemMaster, Tarot, IChing screens | Quota display, quick selects |
| Typing (Issue 1) | AdminAI modal only | Independent |
| Keywords (Issue 3) | Response detector, intent service | Form display, course cards |
| Ritual (Issue 4) | GemMaster stack, navigation | Back button handlers |
| Deep links (Issue 2) | Share URLs, affiliate links, AppNavigator | All screens that share content |

---

## Risks and Future Improvements

1. **Deep link DNS**: Custom domain (go.gemral.com) not yet configured — using raw Supabase URL
2. **AASA/assetlinks**: Placeholder values need real Team ID and SHA-256 fingerprint
3. **Other ritual screens**: Only LetterToUniverseRitual registered in GemMaster stack;
   other rituals may need the same treatment when exposed via chatbot
4. **Keyword maintenance**: As new courses/products are added, check for keyword conflicts
5. **Offline tier cache**: If network fails on resume, consider SecureStore fallback for tier
