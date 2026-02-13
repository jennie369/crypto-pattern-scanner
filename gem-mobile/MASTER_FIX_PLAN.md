# GEM ECOSYSTEM — MASTER FIX PLAN
**Date:** 2026-02-13
**Source:** 3-Agent System Audit (76 findings: 13 Critical, 26 High, 24 Medium, 13 Low)
**Strategy:** Fix root causes, not symptoms. Grep for patterns. Zero code breakage.

---

## EXECUTION STRATEGY

### 3 Parallel Fix Teams

| Team | Agent Name | Scope | Files |
|------|-----------|-------|-------|
| **Team A** | `notifications-auth-fixer` | Notification system + Auth flow + Navigation | ~15 files |
| **Team B** | `trading-engine-fixer` | Trading logic + Scanner + PaperTrade + Multi-TF | ~12 files |
| **Team C** | `state-memory-fixer` | State leaks + Memory leaks + Stale closures + Architecture | ~20 files |

### Dependency Order
- Team A, B, C work **in parallel** (no cross-dependencies)
- Within each team: fixes are ordered by dependency (P0 first)

### Safety Rules
1. **Before ANY edit**: Read the full file, understand the context
2. **Before modifying logic**: Explain root cause, list all affected files
3. **After pattern fix**: Grep entire codebase for same pattern, fix all instances
4. **Never delete code** unless confirmed dead (grep for all references first)
5. **Preserve all existing behavior** unless explicitly fixing a bug

---

## TEAM A: NOTIFICATIONS + AUTH + NAVIGATION

### A1. [CRITICAL] Consolidate setNotificationHandler (6 → 1)
**Root Cause:** Multiple services each call `Notifications.setNotificationHandler()` at module load time. Only the LAST loaded handler wins. The carefully crafted incoming-call suppression in `InAppNotificationContext.js` gets overridden.

**Files to modify:**
- `services/notificationService.js:18` — REMOVE setNotificationHandler
- `services/scanner/patternNotificationService.js:37` — REMOVE setNotificationHandler
- `services/calendarNotificationService.js:36` — REMOVE setNotificationHandler
- `services/paperTradeNotificationService.js:118` — REMOVE setNotificationHandler
- `services/digitalProductNotificationService.js:29` — REMOVE setNotificationHandler
- `services/livestreamNotificationService.js:73` — REMOVE setNotificationHandler
- `contexts/InAppNotificationContext.js:31` — KEEP (this is the correct centralized handler)

**Fix:** Remove `setNotificationHandler` from all 6 service files. The ONLY handler should be in `InAppNotificationContext.js`. Each service should only call `Notifications.scheduleNotificationAsync()` to send notifications — they should NOT configure HOW notifications are displayed.

**Grep pattern:** `setNotificationHandler` across entire `src/` to find ALL instances.

**Verification:**
- Send notification from each service type → all display correctly
- Incoming call push → fullscreen call UI (no system banner)
- Background notification → system tray correctly

### A2. [CRITICAL] Fix Android Notification Channel Name Mismatch
**Root Cause:** Two different channel IDs for the same purpose: `'incoming_calls'` (plural) vs `'incoming_call'` (singular).

**Files to modify:**
- `services/notificationService.js:157` — Change `'incoming_calls'` → `'incoming_call'`
- OR standardize ALL references to one name

**Grep pattern:** `incoming_call` across entire `src/` to find ALL channel references.

**Verification:** On Android, only ONE incoming call channel exists in system settings.

### A3. [CRITICAL] Fix Dual Logout Path
**Root Cause:** `localOnlySignOut()` (AuthContext.js:654) manually duplicates cleanup that `onAuthStateChange` does for normal `signOut()`. Two separate cleanup paths that can drift out of sync.

**Files to modify:**
- `contexts/AuthContext.js`

**Fix approach:** Make `intentionalLogout()` call the standard cleanup path. Extract shared cleanup into a single `_performCleanup()` function called by BOTH paths. Ensure `localOnlySignOut` still works for network-down scenarios but uses the same cleanup.

**Steps:**
1. Extract lines 563-631 (onAuthStateChange SIGNED_OUT cleanup) into `_performFullCleanup()`
2. Call `_performFullCleanup()` from both `onAuthStateChange SIGNED_OUT` and `intentionalLogout()`
3. Remove duplicated cleanup code from `intentionalLogout()` (lines 657-678)

### A4. [CRITICAL] Fix Navigation Routes (4 undefined + wrong deep link names)
**Root Cause:** `navigate()` calls reference screen names that don't exist in the navigator.

**Files to audit:**
- All navigation files (AppNavigator.js, TabNavigator.js, stack navigators)
- Deep link configuration
- All `navigate('ScreenName')` calls across codebase

**Grep pattern:** `navigate\(` across entire `src/` to find ALL navigation calls, cross-reference with registered screen names.

### A5. [HIGH] Serialize Profile Fetches on SIGNED_IN (3 → 1)
**Root Cause:** `onAuthStateChange` SIGNED_IN triggers 3 concurrent `getUserProfile()` calls (line 462, 514, 539). Last `setProfile()` wins, potentially overwriting fresh data with stale.

**Fix:** Chain the calls sequentially:
1. First fetch profile (line 462)
2. Then `apply_all_pending_purchases` uses already-fetched profile
3. Then `link_user_to_waitlist` uses already-fetched profile
4. Only re-fetch profile at the END if purchases/linking changed it

### A6. [HIGH] Remove Push Token on Logout
**Root Cause:** `intentionalLogout()` doesn't call `notificationService.removePushToken()`. Push token stays in DB → notifications sent to logged-out device.

**Fix:** Add `await notificationService.removePushToken(userId)` to the cleanup sequence in logout.

### A7. [MEDIUM] Clear Module-Level Caches on Logout
**Root Cause:** `forumCache`, `notificationsCache`, `localReadIds`, `localDeletedIds` are module-level objects that persist across login/logout cycles.

**Files to modify:**
- `screens/Forum/ForumScreen.js:54` — Add `clearForumCache()` export
- `screens/tabs/NotificationsScreen.js:60` — Add `clearNotificationsCache()` export
- `contexts/AuthContext.js` — Call both clear functions on logout

**Grep pattern:** Module-level `let ` and `const ` objects/Maps/Sets that hold user data.

### A8. [MEDIUM] Fix 30s Periodic Reset Masking Bugs
**Root Cause:** `useGlobalAppResume` (useAppResume.js:304-314) calls `resetAllLoadingStates()` every 30s unconditionally, hiding real loading bugs.

**Fix:** Only reset after detecting an actual stuck state (e.g., loading=true for >15s), not unconditionally on a timer.

---

## TEAM B: TRADING ENGINE + SCANNER + PAPERTRADE

### B1. [CRITICAL] Fix unrealizedPnLPercent Missing Leverage Multiplier
**Root Cause:** `paperTradeService.js:1416` calculates price change %, not ROE:
```js
position.unrealizedPnLPercent = (priceDiff / position.entryPrice) * 100;
```
With 10x leverage, 1% price move = 10% ROE but shows as 1%.

**Fix:**
```js
position.unrealizedPnLPercent = (priceDiff / position.entryPrice) * (position.leverage || 1) * 100;
```

**Grep pattern:** `unrealizedPnLPercent` to find all consumers of this field and verify they don't double-multiply.

### B2. [CRITICAL] Unify Dual Pending Order Systems
**Root Cause:** Two independent systems monitor pending orders:
- `paperTradeService.checkPendingOrders()` (line 914) — in-memory check
- `usePendingOrdersChecker.js` + `pendingOrderService.js` — Supabase query check

**Fix:** Remove one system. Keep `paperTradeService` as the single source of truth since it already manages all order state. Remove or deprecate `pendingOrderService.js` and `usePendingOrdersChecker.js`.

**Files to modify:**
- `services/paperTradeService.js` — Keep as primary
- `services/pendingOrderService.js` — Remove or mark deprecated
- `hooks/usePendingOrdersChecker.js` — Remove or mark deprecated
- Any files importing `pendingOrderService` or `usePendingOrdersChecker`

**Grep pattern:** `pendingOrderService` and `usePendingOrdersChecker` to find all imports.

### B3. [HIGH] Clear ScannerContext Patterns on Timeframe Switch
**Root Cause:** `ScannerContext.js:16` stores `selectedTimeframe` but changing it does NOT clear `patterns` from old timeframe. User sees stale 4h patterns on 1h view.

**Fix:** When `setSelectedTimeframe` is called, also call `clearScanResults()`.

**File:** `contexts/ScannerContext.js`

### B4. [HIGH] Resolve Dual Scanner Contexts
**Root Cause:** Both `ScannerContext.js` (74 lines, useState) and `ScannerStateContext.js` (725 lines, useReducer) exist.

**Fix approach:**
1. First grep ALL imports of both contexts
2. Determine which is actually used
3. If ScannerStateContext is unused → remove it
4. If both used → consolidate into one

### B5. [HIGH] Add Concurrency Guard to Paper Trade Monitoring
**Root Cause:** `startGlobalMonitoring()` uses `setInterval(5000)` with no guard. After app resume, multiple queued intervals can fire simultaneously → concurrent `checkAllOpenPositions()` calls → potential double-close.

**Fix:**
1. Add `isChecking` flag: skip if already running
2. Add AppState check: pause monitoring in background
3. Add position count check: don't poll if 0 open positions

### B6. [HIGH] Make Position Close Atomic (Balance + DB)
**Root Cause:** `paperTradeService.js:1113-1128` updates balance in memory, then saves to DB. If DB save fails, memory and DB diverge.

**Fix:** Use try/catch with rollback:
```js
const previousBalance = this.balance;
try {
  this.balance += positionSize + realizedPnL;
  this.openPositions.splice(positionIndex, 1);
  await this.saveAll();
  await this.syncPositionToSupabase(closedTrade, 'UPDATE');
} catch (error) {
  // Rollback
  this.balance = previousBalance;
  this.openPositions.splice(positionIndex, 0, position);
  throw error;
}
```

### B7. [HIGH] Filter Price Fetch to Only Needed Symbols
**Root Cause:** `paperTradeService.js:166` fetches ALL ~2000 Binance tickers every 5s.

**Fix:** Use `?symbols=[...]` parameter with only open position symbols.

### B8. [MEDIUM] Fix Spot vs Futures Price Feed Mismatch
**Root Cause:** WebSocket uses Spot API, candle detection uses Futures API, price monitoring uses Spot.

**Document all API endpoints in use:**
- `webSocketPoolService.js` — Spot WS
- `binanceService.js` — Futures REST
- `paperTradeService.js` — Spot REST

**Fix:** Standardize all price feeds to Futures API since patterns are detected on Futures candles.

### B9. [MEDIUM] Fix Pattern Name Collision (DT)
**Root Cause:** Both `Descending Triangle` and `Double Top` use abbreviation `'DT'`.

**Fix:** Change Descending Triangle to `'DeT'` or `'DscT'`.

### B10. [MEDIUM] Pass userTier Explicitly to detectPatterns
**Root Cause:** `ScannerScreen.js:554` doesn't pass `userTier` to `detectPatterns()`, relying on singleton's `this.userTier`.

**Fix:** Pass tier as parameter: `patternDetection.detectPatterns(symbol, tf, { userTier })`.

### B11. [LOW] Clear Candle Cache Before New Scan Session
**Fix:** Call `binanceService.clearCandleCache()` at the start of each manual scan.

---

## TEAM C: STATE LEAKS + MEMORY LEAKS + STALE CLOSURES

### C1. [CRITICAL] Fix Stale Closure in CallContext.js
**Root Cause:** `setInterval` at line 631-669 captures `incomingCall` at creation time. When `incomingCall` changes, the interval still uses the old value.

**Fix:** Use `useRef` for `incomingCall`:
```js
const incomingCallRef = useRef(incomingCall);
useEffect(() => { incomingCallRef.current = incomingCall; }, [incomingCall]);
// In interval: use incomingCallRef.current instead of incomingCall
```

**Also fix:** CallKeep native callbacks at lines 387-443 (same stale closure issue).

### C2. [CRITICAL] Fix Wallet Double-Spend Race Condition
**Root Cause:** `walletService.js:373-433` does read-then-write (check balance → deduct) without a transaction. Two concurrent requests can both read the same balance and overdraw.

**Fix:** Use Supabase RPC transaction (`spend_gems` if it exists, or create one). The balance check and deduction must be atomic at the database level.

**Grep pattern:** `spendGems` and `deductBalance` and `updateBalance` across entire codebase to find ALL spending paths.

### C3. [CRITICAL] Fix Module-Level User/Session State Bleed
**Root Cause:**
- `errorService.ts:54-55` — `let currentUserId` persists across logout/login
- `useEventTracking.ts:53-54` — `let currentSessionId` persists

**Fix:**
- `errorService.ts`: Add `clearUserId()` function, call on logout
- `useEventTracking.ts`: Generate sessionId per hook instance or clear on logout

**Grep pattern:** Module-level `let current` to find ALL instances of this pattern.

### C4. [CRITICAL] Fix WebSocket Pool Data Race
**Root Cause:** `webSocketPoolService.js` singleton's `priceBuffer` and `subscriptions` Map are mutated during batch flush without synchronization. Callbacks sent to deleted subscriptions.

**Fix:**
1. Copy subscription callbacks before flush (snapshot)
2. Validate callback exists before invoking
3. Clear priceBuffer entries for unsubscribed symbols
4. Add try/catch around each callback invocation

### C5. [HIGH] Fix Memory Leaks — WebView setInterval
**Root Cause:** `CheckoutWebView.js:578,628` and `CourseCheckout.js:231` inject JavaScript with `setInterval` that never gets `clearInterval`.

**Fix:** Store interval IDs and clear them in WebView's `onNavigationStateChange` or React `useEffect` cleanup via `injectedJavaScript`.

**Grep pattern:** `setInterval` across entire `src/` to find ALL instances, verify each has a corresponding `clearInterval`.

### C6. [HIGH] Fix Memory Leaks — ForumScreen DeviceEventEmitter
**Root Cause:** `ForumScreen.js:229,453,507` — DeviceEventEmitter listeners accumulate on mount/unmount cycles.

**Fix:** Store listener subscriptions and remove ALL in useEffect cleanup.

**Grep pattern:** `DeviceEventEmitter` across entire `src/` to find ALL instances and verify cleanup.

### C7. [HIGH] Fix Stale Closures — CartContext, useCourseRealtime
**Root Cause:**
- `CartContext.js:178-194` — stale `cartId` in setTimeout
- `useCourseRealtime.js:127-169` — missing callback dependency

**Fix:** Use `useRef` for values accessed in async callbacks/timeouts.

### C8. [HIGH] Fix zoneManager Singleton Cache Cross-Symbol Bleed
**Root Cause:** `zoneManager.js:103-105` — singleton `activeZonesCache` can mix zones from different symbols.

**Fix:** Ensure cache key includes symbol: `${symbol}:${timeframe}`.

### C9. [HIGH] Fix Missing Error/Empty States (11 screens)
**Root Cause:** 8 screens missing error states, 3 missing empty states.

**Fix:** Add standardized error/empty state components to each screen.

### C10. [HIGH] Add ErrorBoundary Coverage (90%+ screens missing)
**Fix:** Wrap each tab navigator and major stack in ErrorBoundary with fallback UI.

### C11. [HIGH] Fix N+1 Query in Forum Comment Authors
**Root Cause:** `forumService.js:1173-1196` — double table lookup for comment authors.

**Fix:** Use Supabase join or batch query.

### C12. [MEDIUM] Fix Remaining Stale Closures and setTimeout Leaks
**Files:**
- `VisionBoardScreen.js:4432` — setTimeout without cleanup
- `useWebSocketChat.js:82,95` — setTimeout without cleanup
- `ScannerScreen.js:422` — WS reconnect setTimeout without cleanup
- `connectionHealthMonitor.js:41` — initial setTimeout without cleanup
- `CalendarContext.js:308-334` — excessive useEffect deps

**Grep pattern:** `setTimeout` across entire `src/` — verify ALL have corresponding `clearTimeout` in cleanup.

### C13. [MEDIUM] Fix Hardcoded Colors (28+ instances)
**Grep pattern:** `#[0-9a-fA-F]{6}` and `#[0-9a-fA-F]{8}` in screen files to find all hardcoded hex colors.

**Fix:** Replace with design token references.

### C14. [MEDIUM] Consolidate Resume Systems (4 → 1)
**Root Cause:** 4 independent background-to-foreground handlers with 16 AppState listeners.

**Fix:** Create unified `AppResumeManager` that handles:
1. Session refresh (from AuthContext)
2. Cache management (from useAppResume)
3. WS reconnection (from useAppResume)
4. Health checks (from connectionHealthMonitor)

In a deterministic order with proper sequencing.

### C15. [LOW] Migrate Deprecated Table Usage
- `useReactions.js:99` — `users` → `profiles`
- `walletService.js` — `user_wallets`/`wallet_transactions` fallback removal
- `boostService.js:148,167` — `user_wallets` removal

---

## VERIFICATION CHECKLIST

After ALL fixes, verify:

### Auth Flow
- [ ] Signup → profile created → correct tier → course unlock
- [ ] Login → session established → all services initialized
- [ ] Logout → ALL state cleared (module caches, push token, services)
- [ ] Login as different user → NO data from previous user visible
- [ ] Background 5+ min → resume → session refreshed once (not 4 times)
- [ ] Biometric login → works after app kill and restart

### Trading Flow
- [ ] Scan on 4h → switch to 1h → old patterns cleared
- [ ] Open 10x leverage position → P&L% shows ROE (10x multiplied)
- [ ] Create limit order → only ONE system monitors it
- [ ] Close position → balance and DB in sync even if network drops
- [ ] Rapid TF switching 20x → no stale state, no crash

### Notifications
- [ ] Paper trade TP hit → notification shows correctly
- [ ] Incoming call push → fullscreen call UI (no system banner)
- [ ] Multiple notification types → all display correctly regardless of load order
- [ ] Android → only one `incoming_call` channel exists

### Memory & Performance
- [ ] Open/close checkout 10x → no interval accumulation
- [ ] Forum tab switch 20x → no listener accumulation
- [ ] Long background → resume → no stuck loading states
- [ ] 0 open positions → no polling active

### Wallet & Security
- [ ] Concurrent gem spend → only one succeeds if insufficient balance
- [ ] Error reports → correct user ID after logout/login
- [ ] Navigation → no undefined route crashes
- [ ] All deep links → correct screen targets

---

## IMPACT ANALYSIS

| Module | Files Changed | Risk Level | Testing Required |
|--------|:---:|:---:|---|
| Notification System | 7 | HIGH | All notification types, incoming calls |
| Auth/Logout | 3 | HIGH | Login/logout cycle, session management |
| Navigation | 5+ | HIGH | All screen transitions, deep links |
| PaperTrade | 4 | HIGH | All order types, P&L display, monitoring |
| Scanner/Context | 3 | MEDIUM | Pattern detection, TF switching |
| CallContext | 1 | HIGH | Call accept/reject lifecycle |
| WalletService | 2 | HIGH | All gem spending operations |
| Memory Leaks | 8+ | LOW | Long session stability |
| State Leaks | 6+ | MEDIUM | Multi-user session isolation |
| Theme/UI | 15+ | LOW | Visual consistency |
