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

## Common Bug Patterns
- iOS spacing: GlassBottomTab position differs from Android
- Auth desync: Profile/role/quota fetched only on mount, stale after background
- GemMasterScreen maintains own auth state independently of AuthContext

## Files Modified Together
- `gemMasterLayout.js` + `GemMasterScreen.js` (layout constants)
- `AuthContext.js` + `AppNavigator.js` + `useAppResume.js` (auth lifecycle chain)
- `GlassBottomTab.js` + `TabBarContext.js` + `gemMasterLayout.js` (tab bar positioning)
- `paperTradeService.js` + `pendingOrderService.js` + `usePendingOrdersChecker.js` (order chain)
- `patternDetection.js` + `zoneCalculator.js` + `zoneManager.js` (detection chain)
- `ScannerScreen.js` + `ScannerContext.js` + `TradingChart.js` (scanner UI chain)
- `loadingStateManager.js` + `useAppResume.js` (loading state reset)
- `ForumScreen.js` + `NotificationsScreen.js` + `AuthContext.js` (cache clear on logout)

## Deprecated Table Usage
- walletService.js: 20+ refs to user_wallets/wallet_transactions (fallback, acceptable)
- boostService.js: user_wallets line 148, wallet_transactions line 167
- useReactions.js: FIXED (C15) — now uses `profiles` instead of `users`

## Audit Reports
- Full systemic audit: `gem-mobile/SYSTEMIC_DEBUG_AUDIT_REPORT.md` (2026-02-13)
- Master fix plan: `gem-mobile/MASTER_FIX_PLAN.md` (76 bugs, 3 teams)
