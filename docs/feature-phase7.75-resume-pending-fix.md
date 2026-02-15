# Phase 7.75 — App Resume Stuck Loading + Pending Orders Disappearing
## Two Critical Production Bug Fixes
**Date**: 2026-02-15 | **Severity**: Critical

---

## Issue 1: Pending Orders Disappear After ~1 Second

### Symptom
User navigates to Open Orders screen, sees 3 pending orders load correctly, then they vanish ~1 second later. Only empty state shown.

### Root Cause: Dual Data Source Overwrite

Two tables store pending orders:
1. **`paper_pending_orders`** — Used by `pendingOrderService.js`. This is where `createPendingOrder()` writes. **CORRECT source.**
2. **`paper_trades`** (status='PENDING') — Used by `paperTradeService.js` in-memory cache. **LEGACY, mostly empty.**

In `OpenPositionsScreen.js`, the WebSocket price handler `handlePriceUpdate()` was called on every price tick (multiple times/second). At line 188, it called:
```javascript
setPendingOrders(paperTradeService.getPendingOrders(user?.id));
```
This reads from `paper_trades` table (empty for limit orders created via `pendingOrderService`), overwriting the correct data loaded from `paper_pending_orders` on initial load.

**Timeline:**
1. Screen mounts → `loadData()` fetches from `paper_pending_orders` → 3 orders displayed
2. ~1s later → WebSocket fires → `handlePriceUpdate()` → `setPendingOrders([])` from wrong table
3. Orders vanish

### Fix Applied

**File: `gem-mobile/src/screens/Scanner/OpenPositionsScreen.js`**

1. **`pendingOrdersRef`**: Ref tracks pending orders from correct source (`paper_pending_orders`). Synced in `loadData()`.

2. **`reloadPendingOrdersFromDB()`**: Helper queries `paper_pending_orders` via `pendingOrderService.getPendingOrders()`, maps field names for UI compatibility.

3. **Throttle**: `lastPendingCheckRef` + `PENDING_CHECK_INTERVAL_MS = 3000` prevents excessive Supabase queries on every WS tick.

4. **`handlePriceUpdate()` rewritten**:
   - Fill checks via `pendingOrderService.checkAndTriggerOrders()` (correct table), throttled to 3s
   - Backward compat: also checks `paperTradeService.checkPendingOrders()` for legacy orders
   - `setPositions()` + `setStats()` on every tick (safe in-memory reads)
   - `setPendingOrders()` ONLY on actual fill/close events (re-queries from DB)
   - Never blindly overwrites with wrong-table data

5. **`updatePrices()` fixed** (manual refresh — same bug):
   - Uses `pendingOrdersRef.current` for symbol collection
   - Same throttled fill-check flow

### Verification
- Navigate to Open Orders with pending orders → persist (not vanish after 1s)
- Navigate away and back → still visible
- Manual refresh → still visible
- Order filled by price → disappears from pending, appears in positions
- Cancel order → disappears correctly
- Legacy orders in `paper_trades` → still fill via backward compat

---

## Issue 2: App Returns from Background → Stuck Loading + FeedTimeout

### Symptom
User minimizes app, returns after 1+ minutes. Forum shows infinite loading spinner. Notifications screen stuck. Admin screens stuck.

### Root Cause: Three Uncoordinated AppState Listeners

**BEFORE (3 competing systems):**
1. `AppResumeManager._handleAppStateChange` — Singleton, deterministic sequence
2. `AuthContext` (line 360) — Own AppState listener, refreshes session + profile after 60s threshold
3. `useAppResume.js` — Delegates to AppResumeManager but registered independently

**Race condition:**
- AppResumeManager fires `resetAllLoadingStates()` BEFORE screens start their data fetches
- AuthContext fires session refresh independently, sometimes AFTER AppResumeManager already refreshed
- Loading states get set to `true` by data fetches AFTER `resetAllLoadingStates()` clears them → stuck forever

**ForumScreen additional bug:**
- `loadPosts(reset=true)` never called `setLoading(true)` at the start
- `finally` block only cleared loading for current requestId, skipping stale requests → stuck loading

### Fixes Applied

#### Fix 1: AuthContext — Remove duplicate AppState listener
**File: `gem-mobile/src/contexts/AuthContext.js`**

- Removed `AppState.addEventListener` and related refs (`appStateRef`, `lastResumeRef`)
- Removed `import { AppState, Platform }` (unused after removal)
- `refreshProfile()` method still exists — now called by AppResumeManager via callback

#### Fix 2: AppResumeManager — Sole resume handler with profile refresh
**File: `gem-mobile/src/services/AppResumeManager.js`**

- Added `_profileRefreshFn` field + `setProfileRefreshFn(fn)` method
- Resume sequence now: session refresh → **profile refresh** → cache clear → WS reconnect → health → force refresh
- Removed premature `resetAllLoadingStates()` from resume sequence (screens manage their own loading)
- Profile refresh called with `await` for stale data (>1 min), fire-and-forget for fresh data
- Full recovery (3 consecutive health failures) also calls profile refresh

#### Fix 3: useAppResume — Pass refreshProfile callback
**File: `gem-mobile/src/hooks/useAppResume.js`**

- `useGlobalAppResume(refreshProfile)` now accepts `refreshProfile` param
- Calls `appResumeManager.setProfileRefreshFn(refreshProfile)` on mount
- Dependency array: `[refreshProfile]`

#### Fix 4: AppNavigator — Thread refreshProfile through
**File: `gem-mobile/src/navigation/AppNavigator.js`**

- Destructures `refreshProfile` from `useAuth()`
- Passes to `useGlobalAppResume(refreshProfile)`

#### Fix 5: ForumScreen — Loading state guarantees
**File: `gem-mobile/src/screens/Forum/ForumScreen.js`**

- `loadPosts()`: Always sets `setLoading(true)` when `reset=true` at the start
- `finally` block: Always clears `setLoading(false)` + `setLoadingMore(false)` regardless of stale requestId
- `loadHybridFeed()`: Comment updated — loading managed by parent `loadPosts()`

#### Fix 6: Secondary screens — try/finally for loading
**Files:**
- `KarmaDashboardScreen.js`
- `VisionBoardScreen_NEW.js`
- `CalendarScreen.js`
- `ShadowModeScreen.js`
- `AchievementsScreen.js`
- `DailyRecapScreen.js`

All wrapped `setLoading(true) → await → setLoading(false)` in `try/finally` to guarantee loading clears on errors.

### Verification
- App resume after 1+ min → Forum loads data, no stuck spinner
- App resume after 5+ min → Session refreshed, profile refreshed, data reloaded
- Auth token expired during background → Session auto-refreshed by AppResumeManager
- No duplicate AppState listeners (verified: `AppState` no longer imported in AuthContext)
- Notifications screen → loads correctly after resume
- Admin screens → loads correctly after resume

---

## Engineering Principles

### Rule: Single System for Single Purpose (Troubleshooting Rule 20)
Multiple independent AppState listeners racing each other is the #1 cause of stuck loading on resume. Consolidate to ONE deterministic handler.

### Rule: Two-Table State Overwrite (NEW Rule 27)
When two tables store overlapping data (paper_pending_orders vs paper_trades), NEVER blindly overwrite state from the wrong source on high-frequency events (WebSocket ticks). Use refs to track correct source, throttle DB queries.

### Rule: Loading State Must ALWAYS Clear (NEW Rule 28)
Every `setLoading(true)` MUST have a corresponding `setLoading(false)` in a `finally` block. Never gate loading cleanup on requestId or other conditions — data can be discarded, but UI must never stay stuck.

---

## Architecture After Fix

```
App Resume Flow (SINGLE PATH):
  AppState change → AppResumeManager._handleAppStateChange
    ├── Step 1: Session refresh (with 10s cooldown)
    ├── Step 2: Profile refresh (via AuthContext callback, await if stale)
    ├── Step 3: Cache clear (if >1 min)
    ├── Step 4: WebSocket reconnect
    ├── Step 5: Realtime channel recovery
    ├── Step 6: Health check
    └── Step 7: FORCE_REFRESH_EVENT (screens reload their data)

Pending Orders Flow (SINGLE SOURCE):
  paper_pending_orders table ← pendingOrderService.createPendingOrder()
                             → pendingOrderService.getPendingOrders()
                             → pendingOrderService.checkAndTriggerOrders()
                             → OpenPositionsScreen.pendingOrdersRef
                             → OpenPositionsScreen.setPendingOrders (only on events)
```
