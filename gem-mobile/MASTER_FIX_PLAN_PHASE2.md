# GEM ECOSYSTEM — MASTER FIX PLAN PHASE 2
**Date:** 2026-02-13
**Scope:** Shopify/Payment, Offline/Network, Security/RLS, Affiliate, Courses, Shop, Performance, Deep Linking
**Strategy:** Audit → Find root cause → Fix all instances → Verify full flow

---

## EXECUTION STRATEGY

### 3 Parallel Fix Teams

| Team | Agent | Scope | Key Files |
|------|-------|-------|-----------|
| **Team D** | `payment-commerce-fixer` | E. Shopify/Payment + J. Crystal Shop + H. Affiliate | ~25 files |
| **Team E** | `security-courses-fixer` | G. Database/Security + I. Courses + L. Deep Linking | ~30 files |
| **Team F** | `resilience-perf-fixer` | F. Offline/Network + K. Memory/Performance | ~20 files |

---

## TEAM D: SHOPIFY & PAYMENT + CRYSTAL SHOP + AFFILIATE

### D1. Shopify Webhook Flow Audit & Fix
**Trace:** Shopify event → webhook → Supabase update → app state refresh

**Files to audit:**
- `supabase/functions/shopify-webhook/index.ts` (1,404 lines)
- `supabase/functions/shopify-paid-webhook/index.ts` (850 lines)
- `supabase/functions/shopify-order-webhook/index.ts` (181 lines)
- `supabase/functions/payment-status/index.ts` (141 lines)

**Check for:**
- Duplicate webhook handling (idempotency keys)
- Webhook signature verification (HMAC)
- Failed payment retry logic
- Tier upgrade after successful payment
- Refund → tier downgrade flow
- Race condition: multiple webhook events for same order
- Error handling: what happens when Supabase write fails during webhook processing?
- Webhook event ordering (paid before fulfilled, etc.)

### D2. Payment Flow End-to-End
**Trace:** User taps Buy → Checkout screen → Shopify checkout URL → Payment → Webhook → Tier update → App refresh

**Files to audit:**
- `services/paymentService.js` (482 lines)
- `services/shopifyService.js` (969 lines)
- `services/orderService.js` (877 lines)
- `services/orderTrackingService.js` (434 lines)
- `screens/Shop/CheckoutWebView.js` (1,093 lines)
- `screens/Shop/CheckoutScreen.js` (285 lines)
- `screens/Shop/PaymentStatusScreen.js` (824 lines)
- `screens/Shop/OrderSuccessScreen.js` (786 lines)

**Check for:**
- Checkout URL generation → is it correct?
- Payment status polling — interval, timeout, cleanup
- Order status sync after payment
- Tier upgrade NOT applying after payment (known issue)
- Double-charge protection
- Cart cleared after successful payment?
- Navigation flow after payment success/failure

### D3. Tier Upgrade After Payment
**Critical flow:** Payment confirmed → webhook updates DB → app detects tier change → UI refreshes

**Check:**
- Does webhook correctly update `profiles.tier`?
- Does app poll for tier change or rely on realtime?
- Is there a manual "check payment" fallback?
- What happens if webhook fires before user returns to app?
- What happens if user has pre-existing access (e.g., from trial)?

### D4. Crystal Shop & Cart
**Files:**
- `contexts/CartContext.js` (385 lines)
- `screens/Shop/ShopScreen.js` (945 lines)
- `screens/Shop/ProductDetailScreen.js` (2,367 lines)
- `screens/Shop/CartScreen.js` (457 lines)
- `services/shopifyProductService.js` (335 lines)
- `hooks/useShopProducts.js` (412 lines)

**Check for:**
- Cart persistence across app restart
- Cart → checkout → payment flow continuity
- Product sync from Shopify (freshness, error handling)
- Inventory tracking (out-of-stock handling)
- Price display accuracy
- Product search/filter functionality
- Tier-locked products access control

### D5. Affiliate/CTV System
**Trace:** referral_code → signup → purchase → commission_record → payout

**Files:**
- `services/affiliateService.js` (1,365 lines)
- `screens/Affiliate/AffiliateScreen.js` (1,082 lines)
- `supabase/migrations/20251115_affiliate_system.sql` (244 lines)
- `supabase/migrations/20251126_partnership_system.sql` (844 lines)

**Check for:**
- Referral code generation uniqueness
- Commission calculation accuracy (% of sale)
- Multi-level tracking (if applicable)
- Payout trigger logic and thresholds
- Dashboard stats accuracy (views, clicks, conversions, earnings)
- Edge cases: self-referral, expired codes, deleted accounts
- Commission for course vs physical product vs subscription

---

## TEAM E: DATABASE/SECURITY + COURSES + DEEP LINKING

### E1. RLS Policy Audit
**Files:**
- `supabase/migrations/20251126_fix_all_rls_policies_use_profiles.sql` (391 lines)
- `supabase/migrations/20251126_fix_admin_rls_policies.sql` (188 lines)
- All migration files with RLS policies

**Check for EVERY table:**
- SELECT: User can only read own data (or public data)
- INSERT: User can only insert own data
- UPDATE: User can only update own data
- DELETE: User can only delete own data (if allowed)
- Admin: Admin routes properly gated
- Service role: Edge functions use service role key (not anon)

**Test mentally:**
- Can User A see User B's paper trades?
- Can User A see User B's orders?
- Can User A see User B's affiliate earnings?
- Can non-admin call admin endpoints?

### E2. Security Audit
**Check:**
- Token storage (Supabase auth tokens in SecureStore vs AsyncStorage)
- API rate limiting (any implemented?)
- Input validation on all user-facing forms
- SQL injection prevention (parameterized queries in Supabase)
- XSS prevention in forum posts / chat messages
- Sensitive data handling (payment info, personal data)

### E3. Course Access Control
**Trace:** User buys course → Shopify webhook → course_enrollments insert → app shows course

**Files:**
- `services/courseService.js` (1,276 lines)
- `services/courseAccessService.js` (414 lines)
- `contexts/CourseContext.js` (1,106 lines)
- `screens/Courses/CourseDetailScreen.js` (914 lines)
- `screens/Courses/LessonPlayerScreen.js` (1,588 lines)
- `screens/Courses/QuizScreen.js` (714 lines)
- `screens/Courses/CertificateScreen.js` (587 lines)
- `supabase/migrations/20251209_course_access_via_shopify.sql`

**Check for:**
- Tier-based access control (Tier 1 cannot access Tier 2 courses)
- Course unlock after payment (timing, race condition)
- Progress save/restore reliability
- Video playback state persistence
- Quiz completion tracking accuracy
- Certificate generation (only after completion)
- Offline access handling

### E4. Course Progress & Quiz System
**Files:**
- `services/progressService.js`
- `services/progressCalculator.js`
- `services/quizService.js`
- `screens/Courses/QuizQuestion.js` (468 lines)
- `screens/Courses/QuizResult.js` (432 lines)

**Check for:**
- Progress percentage calculation accuracy
- Resume from last position
- Quiz answer submission (no double-submit)
- Quiz timer accuracy
- Score calculation
- Certificate unlock condition

### E5. Deep Linking Complete Audit
**Files:**
- `services/deepLinkHandler.js` (1,085 lines)
- `app.json` (URL scheme config)
- All navigation stack files

**Check for:**
- `gemral://product/{id}` → ProductDetailScreen
- `gemral://course/{id}` → CourseDetailScreen
- `gemral://post/{id}` → PostDetailScreen
- Universal links (https://gemral.com/...)
- Deep link when app is killed (cold start)
- Auth-required deep links (redirect to login, then continue)
- Deep link parameter passing accuracy
- Missing routes / wrong screen names (follow up from Phase 1 A4 fix)

---

## TEAM F: OFFLINE/NETWORK + MEMORY/PERFORMANCE

### F1. Offline Queue & Network Resilience
**Files:**
- `services/offlineQueueService.js` (319 lines)
- `services/cacheService.js` (583 lines)
- `hooks/useAppResume.js` (314 lines)
- `services/AppResumeManager.js` (NEW from Phase 1)

**Test scenarios to validate:**
- Network loss during paper trade placement
- Network loss during checkout
- Slow network (3G) behavior
- Reconnect after 30s offline
- Background → Foreground with stale data
- API timeout handling (what timeout value? is it configurable?)

**Check for:**
- Optimistic UI with rollback on failure
- Retry logic with exponential backoff
- No duplicate submissions (idempotency)
- Proper loading/error states during network issues
- Queue processing order (FIFO)
- Queue item expiry/cleanup

### F2. Network State Management
**Check:**
- NetInfo usage — is it used consistently?
- Online/offline state propagation to UI
- Reconnection triggers (what happens when network comes back?)
- Supabase realtime reconnection
- WebSocket reconnection
- API call retry strategy

### F3. Memory & Long Session Stability
**Files:**
- `services/performanceOptimizer.js` (766 lines)
- `services/performanceService.js` (271 lines)
- `hooks/useDevicePerformance.js` (195 lines)
- `components/Common/OptimizedImage.js` (203 lines)

**Check for:**
- FlatList optimization (getItemLayout, keyExtractor, windowSize, maxToRenderPerBatch)
- Image caching strategy (is FastImage/expo-image used?)
- Unmounted component state updates (React warnings)
- Large component re-renders (missing memo/useMemo)
- WebSocket connection lifecycle (reconnect, cleanup)

**Simulate mentally:**
- 1-hour session: memory growth?
- 1000+ feed items: scroll performance?
- 50 tab switches: state accumulation?
- 500 feed posts loaded: pagination working?

### F4. Image & Asset Optimization
**Check:**
- Image resize on upload (not sending 5MB photos)
- Image caching headers
- Placeholder/skeleton loading
- Progressive image loading
- CDN usage for images

### F5. Large Component Performance
**Audit these large files for memo/useMemo usage:**
- `InlineChatForm.js` (2,039 lines)
- `DayDetailModal.js` (2,140 lines)
- `ProductDetailScreen.js` (2,367 lines)
- `LessonPlayerScreen.js` (1,588 lines)
- `VisionBoardScreen.js` (4,400+ lines)

**Check for:**
- Unnecessary re-renders
- Heavy computations in render path
- Missing React.memo on child components
- Missing useMemo/useCallback for expensive operations

---

## SAFETY RULES (ALL TEAMS)

1. **Read MASTER_FIX_PLAN_PHASE2.md** at start for full context
2. **Read each file fully** before editing
3. **Grep for patterns** — fix ALL instances at once
4. **Fix root causes**, not symptoms
5. **List all affected files** before changing
6. **Preserve existing behavior** unless explicitly fixing a bug
7. **Never modify logic blindly** — explain root cause first
8. **Communicate cross-cutting findings** to other agents
9. **Access control**: Ensure tier restrictions are correct everywhere
10. **Test full flow mentally**: User action → API → DB → Job → Notification → UI update

---

## VERIFICATION CHECKLIST

### Payment Flow
- [ ] Shopify checkout → payment → webhook → tier upgrade works end-to-end
- [ ] Duplicate webhook events handled (idempotent)
- [ ] Failed payment → proper error state
- [ ] Refund → tier downgrade (if applicable)
- [ ] Cart cleared after successful payment

### Offline/Network
- [ ] Network loss during trade → queued or error shown
- [ ] Network loss during checkout → no double charge
- [ ] 30s offline → reconnect → data refreshes correctly
- [ ] API timeout → retry with backoff
- [ ] No duplicate submissions

### Security
- [ ] Every table has RLS policies
- [ ] User A cannot see User B's data
- [ ] Admin routes protected
- [ ] Tokens stored securely
- [ ] Input validated

### Affiliate
- [ ] Referral code → signup → purchase → commission calculated
- [ ] Dashboard stats match actual data
- [ ] No self-referral

### Courses
- [ ] Tier 1 user cannot access Tier 2 course content
- [ ] Progress saves reliably
- [ ] Certificate only after completion
- [ ] Course unlocks after payment

### Deep Links
- [ ] All routes resolve to correct screens
- [ ] Auth-required links redirect to login first
- [ ] Cold start deep links work
