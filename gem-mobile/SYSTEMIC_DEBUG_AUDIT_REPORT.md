# GEM Mobile - Systemic Debug Analysis & Architectural Weakness Detection

**Date:** 2026-02-13
**Scope:** `gem-mobile/src/` - React Native mobile app
**Type:** READ-ONLY audit (no code changes)

---

## Table of Contents
1. [Architecture Weakness Report](#1-architecture-weakness-report)
2. [Systemic Bug Classification](#2-systemic-bug-classification)
3. [Shared State & Race Condition Map](#3-shared-state--race-condition-map)
4. [Memory Leak Risk Assessment](#4-memory-leak-risk-assessment)
5. [Proposed Fix Plan](#5-proposed-fix-plan)
6. [Regression Risk Matrix](#6-regression-risk-matrix)
7. [Test Scenario Matrix](#7-test-scenario-matrix)

---

## 1. Architecture Weakness Report

### 1.1 State Management
- **No centralized store** (no Zustand, no Redux). All state via 17 React Contexts + AsyncStorage (86 files).
- **Dual Scanner Context**: Both `ScannerContext.js` (74 lines, simple useState) and `ScannerStateContext.js` (725 lines, useReducer) exist. Confusion risk.
- `ScannerStateContext.js:450` — `useMemo(() => state, [state])` is a no-op (state reference changes on every dispatch).

### 1.2 Overlapping Resume/Recovery Systems
Four independent systems handle background-to-foreground transitions:

| System | File | Mechanism |
|--------|------|-----------|
| AuthContext AppState listener | `AuthContext.js:319-355` | Refreshes profile after 60s background |
| useAppResume hook | `useAppResume.js:208-276` | Clears caches, reconnects WS |
| useGlobalAppResume | `useAppResume.js:297-352` | 30s periodic reset + force refresh event |
| connectionHealthMonitor | `connectionHealthMonitor.js` | 60s health checks, recovery after 3 failures |

**Risk:** Duplicate AppState listeners (16 total across codebase), conflicting recovery strategies, unnecessary CPU on resume.

### 1.3 Tight Coupling via loadingStateManager
`loadingStateManager.js:117-141` uses `require()` to dynamically reach into screen modules' caches (`forumCache`, `shopCache`, etc.). This creates tight coupling between a utility module and screen implementations.

### 1.4 Singleton Services Without Isolation
200+ service files exported as module-level singletons. Key risks:
- **No per-user isolation** — singleton state persists across login/logout cycles
- **Global mutable state** in module scope (see Section 3)
- **No dependency injection** — testing is difficult

### 1.5 GemMasterScreen Independence
GemMasterScreen does NOT use AuthContext — maintains its own local user/tier/quota state via `supabase.auth.getUser()`. Can desync from AuthContext after app resume or profile changes.

---

## 2. Systemic Bug Classification

### CRITICAL (Production-breaking, data corruption risk)

| # | Issue | File:Line | Category |
|---|-------|-----------|----------|
| C1 | Stale `incomingCall` in setInterval — call status check uses closed-over value | `CallContext.js:631-669` | Stale Closure |
| C2 | Stale `incomingCall`/`user?.id` in CallKeep native callbacks | `CallContext.js:387-443` | Stale Closure |
| C3 | Module-level `currentUserId` persists wrong user after logout/login | `errorService.ts:54-55` | Shared Mutable State |
| C4 | Module-level `currentSessionId` bleeds across user sessions | `useEventTracking.ts:53-54` | Shared Mutable State |
| C5 | WebSocket pool singleton — price buffer race, subscription map corruption | `webSocketPoolService.js:42-61,332-341` | Shared Mutable State |
| C6 | Race condition in wallet spending — read-then-write without transaction | `walletService.js:373-433` | Race Condition |
| C7 | 4 undefined navigation routes: SuggestedUsers, RecoveryQuest, Auth (cross-stack), GemMaster (cross-tab) | Multiple navigation files | Navigation |
| C8 | Deep link handler has wrong screen names (ShopHome→ShopMain, GemMaster mapped wrong) | Deep link config | Navigation |

### HIGH (Causes visible bugs, significant user impact)

| # | Issue | File:Line | Category |
|---|-------|-----------|----------|
| H1 | Stale `cartId` in setTimeout during checkout | `CartContext.js:178-194` | Stale Closure |
| H2 | Missing callback dependency in course realtime hook | `useCourseRealtime.js:127-169` | Stale Closure |
| H3 | Fragile dependency join in course realtime | `useCourseRealtime.js:264-303` | Stale Closure |
| H4 | Module-level network state (`isOnline`) in cacheService — listener leak | `cacheService.js:81-82` | Shared Mutable State |
| H5 | Singleton cache Map in zoneManager — cross-symbol data bleed | `zoneManager.js:103-105` | Shared Mutable State |
| H6 | `useRef` mutation as state container — events lost on unmount | `useEventTracking.ts:160-161` | Shared Mutable State |
| H7 | VisionBoardScreen setTimeout without cleanup (state update after unmount) | `VisionBoardScreen.js:4432` | Memory Leak |
| H8 | ForumScreen DeviceEventEmitter listeners accumulate on mount/unmount | `ForumScreen.js:229,453,507` | Memory Leak |
| H9 | CheckoutWebView: 2x setInterval without clearInterval inside injected JS | `CheckoutWebView.js:578,628` | Memory Leak |
| H10 | CourseCheckout: setInterval without cleanup inside injected JS | `CourseCheckout.js:231` | Memory Leak |
| H11 | OrderHistory route (should be MyOrders), CourseSearch, Upgrade (should be UpgradeScreen) | Navigation files | Navigation |
| H12 | 28+ hardcoded hex colors (especially VisionBoardScreen.js) | Multiple screens | Theme/UI |
| H13 | 8 screens missing error states, 3 missing empty states | Multiple screens | Theme/UI |
| H14 | 90%+ screens missing ErrorBoundary coverage | App-wide | Theme/UI |
| H15 | N+1 query: Comment author fetching with double table lookup | `forumService.js:1173-1196` | Database |
| H16 | Duplicate gem balance implementations (walletService, gemEconomyService, boostService) | Multiple services | Database |

### MEDIUM (Degraded experience, edge case failures)

| # | Issue | File:Line | Category |
|---|-------|-----------|----------|
| M1 | Excessive useEffect deps in CalendarContext causing re-renders | `CalendarContext.js:308-334` | Stale Closure |
| M2 | CacheService `_memoryCache` Map mutation without synchronization | `cacheService.js:87,439,462` | Shared Mutable State |
| M3 | useWebSocketChat setTimeout without cleanup (setState after unmount) | `useWebSocketChat.js:82,95` | Memory Leak |
| M4 | ConnectionHealthMonitor initial setTimeout without cleanup if stop() called early | `connectionHealthMonitor.js:41` | Memory Leak |
| M5 | ScannerScreen WebSocket reconnect setTimeout without cleanup | `ScannerScreen.js:422` | Memory Leak |
| M6 | VisionBoardScreen scroll positioning setTimeout without cleanup | `VisionBoardScreen.js:3693,3700` | Memory Leak |
| M7 | 12+ magic numbers for spacing/sizing across screens | Multiple screens | Theme/UI |
| M8 | Inconsistent text styles and light theme issues | Multiple screens | Theme/UI |
| M9 | Unbounded queries without `.limit()` in goalService | `goalService.js:121-135` | Database |
| M10 | Missing error handling on vision_milestones insert | `goalService.js:439` | Database |
| M11 | Fire-and-forget transaction insert without error check | `walletService.js:296-304,527-533` | Database |
| M12 | `global.onWaitlistLinked` used for cross-component communication | `AuthContext.js:550-551` | Architecture |
| M13 | `clearUserCache()` scans ALL AsyncStorage keys | `cacheService.js` | Performance |

### LOW (Code quality, minor inconsistencies)

| # | Issue | File:Line | Category |
|---|-------|-----------|----------|
| L1 | Deprecated `users` table usage in useReactions | `useReactions.js:99` | Database |
| L2 | walletService extensively uses deprecated `user_wallets`/`wallet_transactions` as fallback | `walletService.js` (20+ refs) | Database |
| L3 | boostService uses deprecated `user_wallets` | `boostService.js:148,167` | Database |
| L4 | Duplicate ScannerContext files (ScannerContext.js vs ScannerStateContext.js) | `contexts/` | Architecture |

---

## 3. Shared State & Race Condition Map

### 3.1 Module-Level Mutable State (Global Singletons)

```
┌─────────────────────────────────────────────────────────────┐
│                    MODULE-LEVEL STATE MAP                     │
├──────────────────────┬──────────────────────────────────────┤
│ File                 │ Mutable Variables                     │
├──────────────────────┼──────────────────────────────────────┤
│ useAppResume.js      │ lastActiveTimestamp, resumeCallbacks  │
│ errorService.ts      │ currentUserId, cachedAppVersion,      │
│                      │ isGlobalHandlerSetup                  │
│ useEventTracking.ts  │ currentSessionId, sessionStartTime,   │
│                      │ cachedDeviceType, cachedAppVersion     │
│ cacheService.js      │ isOnline, networkListenerUnsubscribe  │
│ loadingStateManager  │ resetCallbacks (Map)                  │
│ CallContext.js       │ globalIncomingCallHandler              │
│ websocketService.js  │ Singleton listeners[] (unbounded)     │
│ webSocketPoolService │ Singleton subscriptions, priceBuffer, │
│                      │ reconnectAttempts, isConnected         │
│ connectionHealthMon. │ Singleton healthCheckInterval, etc.   │
│ zoneManager.js       │ Singleton activeZonesCache, timestamp │
│ patternCacheService  │ Singleton cache Map                   │
│ binanceService       │ Singleton candleCache                 │
└──────────────────────┴──────────────────────────────────────┘
```

### 3.2 Race Condition Scenarios

**RC1: Wallet Double-Spend**
```
Thread A: read balance (100) → check >= 50 → deduct to 50
Thread B: read balance (100) → check >= 80 → deduct to 20
Result: User spent 130 gems from 100 balance
Location: walletService.js:373-433
```

**RC2: WebSocket Price Buffer**
```
WS onmessage: writes priceBuffer[BTCUSDT] = {price: 50000}
Batch flush:  reads priceBuffer[BTCUSDT] → sends to callbacks
Component:    unsubscribes BTCUSDT mid-flush → callback sent to deleted ref
Location: webSocketPoolService.js:332-341, 444-464
```

**RC3: User Session Bleed**
```
User A logs out → errorService.currentUserId still = User A
User B logs in → error report sent with User A's ID
Until setUserId() called explicitly
Location: errorService.ts:54-55
```

**RC4: Call Status Stale Closure**
```
setInterval captures incomingCall at t=0
incomingCall changes at t=1
Interval at t=2 still uses t=0 value → wrong call status decisions
Location: CallContext.js:631-669
```

### 3.3 AppState Listener Overlap

16 AppState.addEventListener calls across the codebase create competing handlers:
- AuthContext.js (profile refresh after 60s)
- useAppResume.js (cache clear + WS reconnect)
- useGlobalAppResume (periodic 30s reset)
- connectionHealthMonitor (pause/resume health checks)
- webSocketPoolService.js (WS reconnect on active)
- ScannerScreen.js, GemMasterScreen.js, etc. (screen-specific)

---

## 4. Memory Leak Risk Assessment

### 4.1 High-Risk Leaks (Will accumulate over time)

| Risk | Source | Mechanism | Impact |
|------|--------|-----------|--------|
| **WebView setInterval** | CheckoutWebView.js:578,628 | setInterval in injected JS never cleared | CPU drain, potential crash on long sessions |
| **WebView setInterval** | CourseCheckout.js:231 | Same pattern | Same |
| **DeviceEventEmitter** | ForumScreen.js:229,453,507 | Listeners accumulate on remount | Duplicate event handling, memory bloat |
| **websocketService listeners** | websocketService.js | `on()` adds to array, no bounds check | Unbounded listener array growth |
| **useGlobalAppResume** | useAppResume.js:308 | 30s setInterval runs entire app lifecycle | Minor but constant CPU; proper cleanup exists |

### 4.2 Medium-Risk Leaks (State updates after unmount)

| Risk | Source | Mechanism |
|------|--------|-----------|
| VisionBoardScreen setTimeout | Line 4432 | Async supabase ops fire after navigate away |
| useWebSocketChat setTimeout | Lines 82, 95 | setState called 3-5s after potential unmount |
| ScannerScreen WS reconnect | Line 422 | 5s setTimeout fires after screen exit |
| ConnectionHealthMonitor init | Line 41 | 10s timeout fires after stop() |

### 4.3 Low-Risk (Properly cleaned up)

- ForumScreen `trackedPostIds` cleanup interval (has clearInterval)
- PaperTradeService global monitoring (has stopGlobalMonitoring)
- ChatScreen messaging subscriptions (proper useEffect cleanup)
- InCallScreen BackHandler (proper cleanup)

---

## 5. Proposed Fix Plan

### P0: Critical (1-2 days each)

| Fix | Module | Effort | Description |
|-----|--------|--------|-------------|
| **F1** | CallContext.js | 1 day | Replace stale closure in setInterval with useRef for `incomingCall`. Use `incomingCallRef.current` inside interval callback. |
| **F2** | walletService.js | 1 day | Replace read-then-write pattern with Supabase RPC transaction (`spend_gems` RPC already exists — use it consistently). Remove `_spendGemsFallback`. |
| **F3** | Navigation | 1 day | Fix 4 undefined routes: add missing screen registrations or remove dead `navigate()` calls. Fix deep link screen name mapping. |
| **F4** | errorService.ts | 0.5 day | Move `currentUserId` to be set/cleared via AuthContext lifecycle. Clear on logout. |
| **F5** | useEventTracking.ts | 0.5 day | Move session ID to React Context or generate per-hook-instance. Remove module-level `let` variables. |

### P1: High Priority (1 sprint)

| Fix | Module | Effort | Description |
|-----|--------|--------|-------------|
| **F6** | CheckoutWebView.js / CourseCheckout.js | 0.5 day | Store setInterval IDs in injected JS and clear them on WebView navigation events or unmount. |
| **F7** | ForumScreen.js | 0.5 day | Deduplicate DeviceEventEmitter listeners. Use a single useEffect with proper cleanup. Track listener refs. |
| **F8** | VisionBoardScreen.js | 0.5 day | Store setTimeout IDs and clear them in useEffect cleanup. Add `isMounted` flag for async callbacks. |
| **F9** | webSocketPoolService.js | 1 day | Add subscription locking during batch flush. Validate callbacks exist before invoking. Clear priceBuffer entries for unsubscribed symbols. |
| **F10** | cacheService.js | 0.5 day | Move `isOnline`/`networkListenerUnsubscribe` to instance properties. Add guard for duplicate `initialize()` calls. |

### P2: Medium Priority (1-2 sprints)

| Fix | Module | Effort | Description |
|-----|--------|--------|-------------|
| **F11** | Resume system consolidation | 2 days | Merge AuthContext AppState + useAppResume + connectionHealthMonitor into single unified resume handler. Reduce 16 AppState listeners. |
| **F12** | ScannerContext cleanup | 0.5 day | Remove unused `ScannerContext.js`, keep `ScannerStateContext.js`. Update all imports. |
| **F13** | Theme tokens enforcement | 2 days | Replace 28+ hardcoded hex colors with design tokens. Add ESLint rule to prevent hardcoded colors. |
| **F14** | ErrorBoundary coverage | 1 day | Wrap each tab/stack navigator in ErrorBoundary. Add fallback UI. |
| **F15** | Missing loading/error/empty states | 2 days | Audit all screens and add missing states (8 screens missing error, 3 missing empty). |
| **F16** | Deprecated table migration | 1 day | Migrate useReactions.js from `users` to `profiles`. Plan walletService migration. |
| **F17** | Duplicate gem balance consolidation | 1 day | Standardize on `gemEconomyService.getGemBalance()` everywhere. Remove inline fetches from boostService, walletService. |
| **F18** | goalService unbounded queries | 0.5 day | Add `.limit(100)` to goal queries. Implement pagination. |

---

## 6. Regression Risk Matrix

### High Regression Risk (Test heavily)

| Change | Risk | Files Affected | What Could Break |
|--------|------|----------------|------------------|
| F1: CallContext stale closure fix | HIGH | CallContext.js, InCallScreen.js, CallScreen.js | Call accept/reject, ringtone, call status |
| F2: Wallet RPC consolidation | HIGH | walletService.js, boostService.js, giftService.js, all purchase flows | Any gem spending operation |
| F3: Navigation route fixes | HIGH | All navigation files, deep link handler | Screen transitions, deep links, push notifications |
| F11: Resume system consolidation | VERY HIGH | AuthContext.js, useAppResume.js, AppNavigator.js, connectionHealthMonitor.js | Everything after app background/resume |

### Medium Regression Risk

| Change | Risk | Files Affected | What Could Break |
|--------|------|----------------|------------------|
| F9: WS pool locking | MEDIUM | webSocketPoolService.js, all price-displaying screens | Live price updates |
| F12: ScannerContext cleanup | MEDIUM | ScannerContext.js, ScannerStateContext.js, ScannerScreen.js | Scanner pattern detection |
| F13: Theme tokens | MEDIUM | All screens with hardcoded colors | Visual appearance |
| F17: Gem balance consolidation | MEDIUM | walletService.js, boostService.js, gemEconomyService.js | Gem balance display/operations |

### Low Regression Risk

| Change | Risk | Files Affected | What Could Break |
|--------|------|----------------|------------------|
| F4/F5: Error/event tracking | LOW | errorService.ts, useEventTracking.ts | Analytics only |
| F6: WebView interval fix | LOW | CheckoutWebView.js, CourseCheckout.js | Checkout status detection |
| F14: ErrorBoundary | LOW | Navigation wrappers | Only activates on crash |
| F18: Query limits | LOW | goalService.js | Only affects users with 100+ goals |

---

## 7. Test Scenario Matrix

### Critical Path Tests

| Scenario | Steps | Expected | Validates |
|----------|-------|----------|-----------|
| **T1: Rapid Login/Logout** | Login → immediately logout → login as different user | Error reports use correct user ID; no stale session data | C3, C4, F4, F5 |
| **T2: Call Accept During Background** | Receive call → background app → resume → accept call | Call connects; no stale incomingCall state | C1, C2, F1 |
| **T3: Concurrent Gem Spend** | Tap "Buy" on two items simultaneously | Only one succeeds if insufficient balance | C6, F2 |
| **T4: Navigate to All Routes** | Test all `navigate()` calls in codebase | No "undefined route" crashes | C7, C8, F3 |
| **T5: Long Background Resume** | Background app for 5+ minutes → resume | All data refreshes; no stuck loading states; WS reconnects | Resume system |

### Memory Leak Tests

| Scenario | Steps | Expected | Validates |
|----------|-------|----------|-----------|
| **T6: Checkout WebView Loop** | Open checkout → close → open → close (10x) | No increasing interval count; memory stable | H9, H10, F6 |
| **T7: Forum Tab Switch** | Navigate to Forum → away → back (20x) | No duplicate event listeners; single subscription | H8, F7 |
| **T8: VisionBoard Rapid Toggle** | Toggle habit → immediately navigate away | No "setState on unmounted" warning | H7, F8 |
| **T9: Scanner Symbol Switch** | Rapidly switch symbols 20x | No orphaned WS subscriptions; memory stable | M5, F9 |

### Race Condition Tests

| Scenario | Steps | Expected | Validates |
|----------|-------|----------|-----------|
| **T10: Price Buffer During Unsubscribe** | Subscribe to BTCUSDT → receive prices → unsubscribe mid-update | No callback errors; clean unsubscription | C5, F9 |
| **T11: Cart Checkout Race** | Add to cart → checkout → modify cart simultaneously | Consistent cart state; no duplicate orders | H1 |
| **T12: Auth State Change During Fetch** | Start profile fetch → logout before response | No state update on unmounted auth context | Multiple |

### UI/Theme Tests

| Scenario | Steps | Expected | Validates |
|----------|-------|----------|-----------|
| **T13: Empty State Display** | New user with no goals/posts/orders | Proper empty state UI on all screens | H13 |
| **T14: Error State Display** | Disconnect network → load each screen | Proper error state UI on all screens | H13, F15 |
| **T15: Light Theme Consistency** | Switch to light theme → visit all screens | No hardcoded dark colors bleeding through | H12, F13 |
| **T16: ErrorBoundary Crash Recovery** | Force JS error in each tab | ErrorBoundary catches; app doesn't crash | H14, F14 |

### Database/API Tests

| Scenario | Steps | Expected | Validates |
|----------|-------|----------|-----------|
| **T17: Gem Balance Consistency** | Check balance via different screens | Same balance shown everywhere | H16, F17 |
| **T18: Large Data Sets** | User with 200+ goals | Query completes within timeout; no OOM | M9, F18 |
| **T19: Partial API Failure** | One endpoint fails during page load | Graceful degradation; partial data shown | M10, M11 |

---

## Appendix: Files Audited

### Contexts (17 total)
- AuthContext.js, ScannerContext.js, ScannerStateContext.js, CallContext.js, CartContext.js, CalendarContext.js, TabBarContext.js, ThemeContext.js, and others

### Services (key files)
- supabase.js, cacheService.js, websocketService.js, webSocketPoolService.js, connectionHealthMonitor.js, walletService.js, boostService.js, forumService.js, goalService.js, affiliateService.js, errorService.ts, gemEconomyService.js, zoneManager.js

### Hooks
- useAppResume.js, useEventTracking.ts, useWebSocketChat.js, useReactions.js, useCourseRealtime.js

### Screens (key files)
- ForumScreen.js, VisionBoardScreen.js, ScannerScreen.js, GemMasterScreen.js, CheckoutWebView.js, CourseCheckout.js, InCallScreen.js

### Navigation
- AppNavigator.js, TabNavigator.js, deep link handler

### Utils
- loadingStateManager.js

---

**Total Issues Found: 45+**
- Critical: 8
- High: 16
- Medium: 13
- Low: 4+

**Audit performed by:** Agent 3 (Systemic Debug Analyst)
