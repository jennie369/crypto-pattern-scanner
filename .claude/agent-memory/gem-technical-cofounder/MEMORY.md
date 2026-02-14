# GEM Technical Co-Founder Memory

## Architecture

### Layout System
- GlassBottomTab is `position: absolute` with iOS `bottom: 6`, Android `bottom: insets.bottom || 16`
- Tab bar pill height: 76px (`Tokens.sizes.barHeight`)
- GemMaster chat input is absolutely positioned, `bottom` controlled by `gemMasterLayout.js` constants
- iOS vs Android: Tab bar occupies different vertical space (iOS ~82px, Android ~100px from screen bottom)
- All layout constants for GemMaster keyboard positioning in `gem-mobile/src/constants/gemMasterLayout.js`
- SafeAreaView in GemMasterScreen uses `edges={['top']}` only (no bottom inset)

### Auth & Session
- AuthContext (`gem-mobile/src/contexts/AuthContext.js`) is the single source of auth truth
- `refreshProfile()` method added for app resume re-hydration (2026-02-09)
- AppState listener in AuthContext refreshes session + profile after 60s background threshold
- GemMasterScreen does NOT use AuthContext - has its own local user/tier/quota state via `supabase.auth.getUser()`
- AccountScreen uses `useAuth()` for `isAdmin` but fetches its own profile via `forumService.getUserProfile()`
- accountCache in AccountScreen has 5-min CACHE_DURATION, invalidated by FORCE_REFRESH_EVENT
- **[A3 FIX]** `performFullCleanup()` is the SINGLE cleanup function for logout (both paths)
- **[A5 FIX]** SIGNED_IN serializes pending purchases + waitlist, single profile refresh at end
- **[A6 FIX]** Push token removed on logout via `notificationService.removePushToken()` before signout

### App Resume System (C14 Consolidated 2026-02-13)
- **[C14]** Unified `AppResumeManager.js` singleton replaces 3 overlapping systems
- BEFORE: 5 AppState listeners racing (useAppResume, useGlobalAppResume tracker, connectionHealthMonitor, AuthContext, AppNavigator)
- AFTER: 2 listeners — AppResumeManager (unified) + AuthContext (auth-specific)
- Deterministic sequence: session refresh → loading reset → cache clear → WS reconnect → health check
- AppResumeManager started by `useGlobalAppResume()` in AppNavigator, runs for app lifetime
- `connectionHealthMonitor.js` is now a no-op thin wrapper (start/stop for backwards compat)
- `useAppResume.js` keeps legacy hook but `useGlobalAppResume` delegates to manager
- `FORCE_REFRESH_EVENT` from `loadingStateManager.js` emitted on resume > 1 min
- **[A8 FIX]** `resetStuckLoadingStates(maxAgeMs)` — 15s interval, only resets states >15s old

### Notification System (A1/A2 Fixed 2026-02-13)
- **ONLY ONE** `setNotificationHandler` — in InAppNotificationContext.js (has incoming-call suppression)
- All 6 notification services: SCHEDULE only, never configure handler
- Android channel name: `'incoming_call'` (singular, standardized)

### Navigation Architecture (A4 Fixed 2026-02-13)
- Root: AppNavigator renders AuthStack (not logged in) OR MainStack (logged in)
- AuthStack: Welcome, Auth (nested), Login, Register, Signup
- MainStack: MainTabs, ProfileFull, Messages, Courses, Call
- TabNavigator: Home, Shop, Trading, GemMaster, Notifications, Account
- Deep links: `navigateToStackScreen(tab, screen, params)` → MainTabs > tab > screen
- `UpgradeScreen` IS registered in AccountStack (line 268) — was misreported as missing
- Cross-tab `navigate('GemMaster')` works (React Navigation traverses parents)
- **[E5 FIX]** "Courses" is a MainStack peer (not a tab!) — deep links must use Account/Shop tab

### Deep Linking Architecture (E5 Fixed 2026-02-13)
- Custom URL scheme: `gem://` (registered in app.json as `"scheme": "gem"`)
- Universal links: Android intent filters for gemral.com + www.gemral.com + yinyangmasters.com
- iOS associatedDomains: NOT configured (universal links won't work on iOS)
- DeepLinkHandler initializes in AppNavigator.onNavigationReady
- Affiliate URL patterns: gemralProducts, gemralShortCode, yinyangMasters, appScheme
- **BUG FIXED**: `isAffiliateUrl()` referenced non-existent `linkGemralApp` → crash
- **BUG FIXED**: Course deep links used `stack: 'Courses'` (not a tab) → navigation failure

### Course Access Control (E1/E3 Fixed 2026-02-13)
- Server-side: `check_course_access` RPC checks tier hierarchy (FREE<TIER1<TIER2<TIER3<ADMIN)
- Client-side: CourseContext.isCourseLocked checks tier + enrollment + admin
- RLS: course_lessons now restricted to enrolled users (was wide open for published courses)
- RLS: quiz_questions now restricted to enrolled users (correct_answer was exposed)
- RLS: pending_course_access now admin-only (was no RLS at all)
- Certificate: requires 100% progress (checked both client + server)
- N+1 queries in courseAccessService (getEnrolledCourses, getCourseStudents)

### Trading Architecture (B-fixes applied 2026-02-13)
- `patternDetection.js` is singleton, stateless per-call (no cross-TF leakage) - 24+ patterns
- `binanceService.js`: REST (Futures candles) + WebSocket (Spot prices)
- `paperTradeService.js`: In-memory + Supabase cloud sync, monitoring every 5s with concurrency guard
- `pendingOrderService.js`: DB CRUD only (deprecated monitoring removed in B2)
- `usePendingOrdersChecker.js`: DEPRECATED (B4) — was dead code
- `ScannerStateContext.js`: DEPRECATED (B4) — 725 lines, 0 imports
- Zone lifecycle: FRESH→TESTED_1X→TESTED_2X→TESTED_3X_PLUS→BROKEN→EXPIRED
- Zone hierarchy: Decision Point > FTR > Flag Limit > Regular
- Descending Triangle abbreviation: 'DscT' (not 'DT' — was colliding with Double Top)

### State Management (2026-02-13 Audit)
- NO Zustand/Redux — all state via 17 React Contexts + AsyncStorage (86 files) + 200+ singleton services
- 16 AppState.addEventListener calls across codebase, 60+ setInterval calls

### Offline/Network Architecture (F-fixes 2026-02-13)
- `offlineQueueService.js`: GEM Master Chat only, AsyncStorage-backed FIFO queue
- **[F1 FIX]** Added exponential backoff (1s→2s→4s→8s→16s, cap 30s) with ±25% jitter
- **[F1 FIX]** Added MAX_RETRIES=5, permanently_failed status for exceeded retries
- **[F1 FIX]** getPendingMessages now includes 'failed' msgs for retry (was 'pending' only)
- **[F1 BUG]** hybridChatService: 'online' event reconnected WS but never called syncOfflineQueue() — FIXED
- `cacheService.js`: dual-layer (memory Map + AsyncStorage), TTL-based expiration
- **[F1 FIX]** Memory cache capped at MAX_MEMORY_CACHE_SIZE=100 with LRU eviction
- NetInfo: only used in 4 files (cacheService, adminAnalyticsService, offlineQueueService, healthCheckService)
- Most critical flows (paper trade, checkout, forum post) DON'T check network state

### Image Architecture (F4 2026-02-13)
- `OptimizedImage.js` uses expo-image with disk caching, blurhash placeholders, memo'd
- **[F4 FIX]** prefetchedUrls capped at 500, failedUrls at 200 (were unbounded Sets)
- Only 15 usages of OptimizedImage vs 127 raw `<Image source={{uri:}}/>` across 80 files
- Future: migrate high-traffic screens from RN Image to OptimizedImage

### FlatList Performance (F3 2026-02-13)
- 98 screens use FlatList, only ~12 had optimization props before F-fixes
- **[F3 FIX]** Added removeClippedSubviews, maxToRenderPerBatch=10, windowSize=10, initialNumToRender=10 to 20 screens
- Already optimized: ForumScreen, ShopScreen, ChatScreen, GemMasterScreen, ConversationsListScreen, CoursesScreen, ProductDetailScreen
- ~68 lower-traffic screens still unoptimized (admin, messages detail, etc.)

## C-Fixes Applied (2026-02-13)
- **C1** Stale closures FIXED: CallContext.js uses `incomingCallRef` for async callbacks
- **C2** Wallet race FIXED: optimistic locking `.eq('gems', currentBalance)` in walletService
- **C3** Module-level state bleed FIXED: `errorService.clearUserId()` + `clearEventSession()`
- **C4** WS data race FIXED: snapshot callbacks before iterating in webSocketPoolService
- **C5** WebView intervals FIXED: CheckoutWebView + CourseCheckout self-clear on success
- **C7** Course realtime FIXED: callback refs in useCourseRealtime.js
- **C8** Zone cache FIXED: per-entry timestamps in zoneManager (not global lastCacheUpdate)
- **C10** ErrorBoundary FIXED: all 6 tabs wrapped in TabNavigator, reports to errorService
- **C12** setTimeout leaks FIXED: useWebSocketChat, connectionHealthMonitor, GlassBottomTab
- **C15** useReactions FIXED: `from('users')` → `from('profiles')`
- **C9** Error/empty states FIXED: reusable `StateView` component, applied to 5 high-priority screens
- **C13** Hardcoded hex colors FIXED: 10 files migrated to design tokens (COLORS.*)
- **C14** Resume consolidation FIXED: `AppResumeManager.js` replaces 3 systems → 1 deterministic handler
- C6 verified OK (DeviceEventEmitter listeners already have cleanup)
- C11 verified OK (forumService uses batch `.in()` queries, not N+1)

## Shopify Webhook Architecture (D-fixes 2026-02-13)
- **TWO separate webhooks** process `orders/paid`: `shopify-webhook` and `shopify-paid-webhook`
- `shopify-webhook` uses `shopify_orders.processed_at` for idempotency
- `shopify-paid-webhook` uses `shopify_webhook_logs` for idempotency
- Cross-webhook dedup: each checks the other's tracking table before processing
- Refund handler `handleOrderRefunded()` reverses tiers→FREE, deducts gems, marks commissions reversed
- `pending_gem_credits.gems_amount` (NOT `gem_amount`) per migration schema

## D-Fixes Applied (2026-02-13)
- **D1-1** `from('users')` → `from('profiles')` in shopify-webhook (4 locations)
- **D1-2** Idempotency check added to shopify-paid-webhook
- **D1-3** Self-referral prevention in both webhooks
- **D1-4** affiliate_id: use `user_id` not row `id` in shopify-paid-webhook
- **D1-5** Optimistic locking for gem balance updates
- **D1-6** Column name `gems_amount` in pending_gem_credits
- **D2-1** Cart cleared for gem purchases in CheckoutWebView
- **D2-2** Removed double injectedJavaScript in CheckoutWebView
- **D3-1** Profile refresh in OrderSuccessScreen + GemPurchasePendingScreen
- **D4-1** Cart state cleared on logout in CartContext
- **BUG7** Refund handler added (orders/cancelled, refunds/create)
- **BUG9** Cross-webhook deduplication between shopify-webhook and shopify-paid-webhook
- **BUG-extra** GemPurchasePendingScreen early return killed animations (fixed cleanup)
- **BUG-extra** OrderSuccessScreen cleanup returned from async fn (never received)

## Common Bug Patterns
- iOS spacing: GlassBottomTab position differs from Android
- Auth desync: Profile/role/quota fetched only on mount, stale after background
- GemMasterScreen maintains own auth state independently of AuthContext
- useEffect early return: `return cleanup` inside async fn → cleanup never runs

## Files Modified Together
- `gemMasterLayout.js` + `GemMasterScreen.js` (layout constants)
- `AuthContext.js` + `AppNavigator.js` + `useAppResume.js` (auth lifecycle chain)
- `GlassBottomTab.js` + `TabBarContext.js` + `gemMasterLayout.js` (tab bar positioning)
- `paperTradeService.js` + `pendingOrderService.js` + `usePendingOrdersChecker.js` (order chain)
- `patternDetection.js` + `zoneCalculator.js` + `zoneManager.js` (detection chain)
- `ScannerScreen.js` + `ScannerContext.js` + `TradingChart.js` (scanner UI chain)
- `loadingStateManager.js` + `useAppResume.js` (loading state reset)
- `ForumScreen.js` + `NotificationsScreen.js` + `AuthContext.js` (cache clear on logout)
- `shopify-webhook` + `shopify-paid-webhook` (dual webhook system, must stay in sync)
- `CheckoutWebView.js` + `CartContext.js` + `OrderSuccessScreen.js` + `GemPurchasePendingScreen.js`
- `offlineQueueService.js` + `hybridChatService.js` (offline queue + auto-sync on reconnect)

## E-Fixes Applied (2026-02-13 Phase 2)
- **E1** RLS: course_lessons restricted to enrolled + free + admin
- **E1** RLS: pending_course_access enabled, admin-only
- **E1** RLS: quiz_questions + quizzes restricted to enrolled + free + admin
- **E1** RLS: Admin ALL policies added for all course tables
- **E1** RLS: course_certificates INSERT + course_progress DELETE policies added
- **E5** Deep links: isAffiliateUrl crash fixed (wrong pattern key)
- **E5** Deep links: Course navigation fixed (Courses→Account stack)
- Migration: `supabase/migrations/20260213_e1_rls_security_audit_fixes.sql`

## F-Fixes Applied (2026-02-13 Phase 2)
- **F1** offlineQueueService: exponential backoff + max retries + permanently_failed status
- **F1** hybridChatService: auto-sync queue on 'online' event (was missing — BUG)
- **F1** cacheService: memory cache size limit (MAX_MEMORY_CACHE_SIZE=100) with LRU eviction
- **F3** FlatList optimizations: 20 screens fixed (removeClippedSubviews, maxToRenderPerBatch, windowSize, initialNumToRender)
- **F4** OptimizedImage: capped prefetchedUrls (500) and failedUrls (200) Sets
- **F5** ProductDetailScreen: memoized renderImageItem, formatPrice, handlers, faqData, reviewsData
- **F5** LessonPlayerScreen: memoized adjacent lesson lookup, navigateToLesson

## Cross-Team Critical Fix: UPDATE users → UPDATE profiles (2026-02-13)
- **ROOT CAUSE**: `apply_pending_tier_upgrades()` writes to `UPDATE users SET` (3 instances)
- **IMPACT**: ALL pre-signup tier upgrades silently fail (caught by EXCEPTION WHEN OTHERS)
- **Flow**: Payment → webhook → `unlock_user_access` writes `user_access` table → user signs up → `apply_all_pending_purchases` → `apply_pending_tier_upgrades` → `UPDATE users SET` → FAILS → tier never applied to `profiles`
- **ALSO FIXED**: `award_level_badge()` wrote to `UPDATE users SET` (1 instance)
- **ALSO FIXED**: `auto-award-badges/index.ts` line 74: `from('users')` → `from('profiles')`
- Migration: `supabase/migrations/20260213_fix_update_users_to_profiles.sql`

### Payment Architecture: Two-Table Tier System
- `user_access` table: Staging table indexed by EMAIL, stores purchased tiers
- `profiles` table: Active tiers used by the app (scanner_tier, course_tier, chatbot_tier)
- `unlock_user_access` RPC: Writes to `user_access` only (NOT profiles)
- `shopify-webhook`: Updates `profiles` directly (correct)
- `shopify-paid-webhook`: Only calls `unlock_user_access` → `user_access` (no direct profiles update)
- Sync mechanism: `apply_pending_tier_upgrades` reads `pending_tier_upgrades` → writes `profiles`
- No trigger syncs `user_access` → `profiles` automatically

## Deprecated Table Usage
- walletService.js: 20+ refs to user_wallets/wallet_transactions (fallback, acceptable)
- boostService.js: user_wallets line 148, wallet_transactions line 167
- useReactions.js: FIXED (C15) — now uses `profiles` instead of `users`

## Files Modified Together (cont.)
- `deepLinkHandler.js` + navigation stacks (deep link route → screen name mapping)

## Audit Reports
- Full systemic audit: `gem-mobile/SYSTEMIC_DEBUG_AUDIT_REPORT.md` (2026-02-13)
- Master fix plan: `gem-mobile/MASTER_FIX_PLAN.md` (76 bugs, 3 teams)
- Phase 2 plan: `gem-mobile/MASTER_FIX_PLAN_PHASE2.md` (3 teams: D/E/F)
- RLS fix migration: `supabase/migrations/20260213_e1_rls_security_audit_fixes.sql`
