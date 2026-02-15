# Phase 7.8 — App Resume Deadlock: Definitive Fix
## 3 Root Causes + 27 Files Changed
**Date**: 2026-02-15 | **Severity**: Critical Production

---

## Background

Phase 7.75 attempted to fix the app resume freeze by:
- Removing duplicate AppState listeners (AuthContext)
- Making AppResumeManager the sole resume handler
- Adding try/finally to loading states in 6 screens

**Result: FIX DID NOT WORK.** All screens still froze after resume.

A 4-agent investigation team (`resume-deadlock-debug`) was launched to find the real root cause through parallel codebase audits:
- Agent Alpha: Supabase auth lifecycle audit
- Agent Beta: Loading state deadlock map
- Agent Gamma: Network pipeline audit
- Agent Delta: Scanner + GemMaster deep trace

---

## Root Cause Diagnosis

### Root Cause 1 (PRIMARY): Binance fetch() with NO timeout

`binanceService.js:383`: `const response = await fetch(url)` — raw fetch, no AbortController.

When the OS backgrounds the app, TCP connections die. On resume, `fetch()` hangs on a dead socket **forever**. `try/finally` is irrelevant — the promise never settles, so `finally` never runs.

**17 raw Binance fetch calls across 8 files** had this vulnerability.

### Root Cause 2: FORCE_REFRESH_EVENT only fired for >60s background

`AppResumeManager.js:248`: `if (isStale) { emit(FORCE_REFRESH_EVENT) }`

`STALE_THRESHOLD = 60s`. Backgrounds of 10-59 seconds produced NO recovery event. Screens stuck during short backgrounds stayed stuck permanently.

### Root Cause 3: 13 screens had ZERO recovery mechanism

GemMasterScreen, OpenPositionsScreen, and 11 other screens had:
- NO `FORCE_REFRESH_EVENT` listener
- NO `registerLoadingReset` registration
- NO way to recover from stuck loading states after resume

Only ForumScreen (full recovery) and ScannerScreen (partial reset) had listeners.

### Why Phase 7.75 fix failed

`try/finally` only catches **exceptions**. It does NOT protect against **promises that never settle**. If `await fetch(url)` hangs forever on a dead TCP socket, the `try` block never completes, and `finally` never executes.

### Why killing the app fixes everything

Fresh app launch = new JavaScript context = no hanging promises + new TCP connections.

---

## Fixes Applied (27 files, 3 agents)

### Fix 1: AbortController timeout on ALL Binance fetch calls (17 calls, 8 files)

| File | Calls Fixed | Timeout |
|------|------------|---------|
| `binanceService.js` | 7 | 10s (15s for exchangeInfo) |
| `binanceApiService.js` | 3 | 10s |
| `paperTradeService.js` | 3 | 10s |
| `ScannerScreen.js` | 1 | 10s |
| `TradingChart.js` (WebView) | 4 | 15s |
| `PaperTradeModal.js` | 1 | 10s |
| `portfolioService.js` | 2 | 15s |
| `adminAIMarketService.js` | 2 | 10s |

Pattern used:
```javascript
async function fetchWithTimeout(url, timeoutMs = 10000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    return response;
  } catch (e) {
    clearTimeout(timeout);
    throw e;
  }
}
```

### Fix 2: FORCE_REFRESH_EVENT always emits on resume

**File**: `AppResumeManager.js`

Before:
```javascript
if (isStale) {
  DeviceEventEmitter.emit(FORCE_REFRESH_EVENT);
}
```

After:
```javascript
// ALWAYS emit — even non-stale resumes need recovery for stuck screens
DeviceEventEmitter.emit(FORCE_REFRESH_EVENT);
```

Profile refresh and cache clear still gated by `isStale` — only the event emission changed.

### Fix 3: Dead code removal from useAppResume.js

**File**: `useAppResume.js` — 325 lines → 49 lines

Removed:
- Old `useAppResume` hook with competing `AppState.addEventListener` (line 271)
- `clearStaleCaches()` that called `resetAllLoadingStates()` (line 66)
- `reconnectWebSocket()`, `refreshSupabaseSession()` (duplicated AppResumeManager)
- Module-level `resumeCallbacks`, `registerResumeCallback`, `triggerResumeCallbacks`

Kept: Only `useGlobalAppResume` (delegates to AppResumeManager)

### Fix 4: FORCE_REFRESH_EVENT listeners added to 13 screens

| Screen | Reset States | Reload Action |
|--------|-------------|---------------|
| GemMasterScreen | `isLoadingTier` | QuotaService.checkQuota + voiceService |
| OpenPositionsScreen | `loading`, `refreshing` | `loadData(true)` |
| HomeScreen | `refreshing` | `refreshBanners()` |
| NotificationsScreen | `loading`, `refreshing` | cache invalidate + reload |
| AccountScreen | `loading`, `refreshing` | cache invalidate + `loadData()` |
| ProfileFullScreen | `loading`, `refreshing`, `contentLoading` | `loadProfile()` |
| VisionBoardScreen_NEW | states | `loadDashboardData()` |
| KarmaDashboardScreen | states | 3 loaders in parallel |
| WalletScreen | states | `loadData()` |
| ShadowModeScreen | `loading`, `refreshing`, `syncing` | `loadData()` |
| CalendarScreen | states | `loadEvents()` |
| DailyRecapScreen | `loading` | `loadRecapData()` |
| AchievementsScreen | states | `loadData()` |

**Already had listeners** (verified working):
- ForumScreen (comprehensive reset + reload)
- ScannerScreen (reset only — correct for user-action-driven screen)

---

## Engineering Principles

### Rule 29: Timeoutless fetch() = Permanent Deadlock After Background
Every `fetch()` call to an external API MUST have an AbortController timeout. The OS kills TCP connections when the app is backgrounded. Without AbortController, `fetch()` hangs forever on the dead socket — `try/finally` cannot save you because the promise never settles.

### Rule 30: FORCE_REFRESH Must Be Unconditional
The recovery event must fire on EVERY resume, not just "stale" ones. A screen can get stuck during any background duration. The stale threshold should only gate expensive operations (profile refresh, cache clear), not the recovery signal itself.

### Rule 31: Every Screen With Loading State Needs Recovery
If a screen has `setLoading(true)` + async fetch, it MUST have a `FORCE_REFRESH_EVENT` listener that: (1) resets loading states FIRST, then (2) re-fetches data. No exceptions.

---

## Architecture After Fix

```
App Resume Flow:
  AppState → AppResumeManager._onResume() (SOLE handler)
    ├── Step 1: Session refresh (8s timeout)
    ├── Step 2: Profile refresh (8s timeout, only if stale)
    ├── Step 3: Cache clear (only if stale)
    ├── Step 4: WebSocket reconnect
    ├── Step 5: Realtime channel recovery
    ├── Step 6: Health check (5s timeout)
    ├── Step 7: FORCE_REFRESH_EVENT (ALWAYS fires)
    └── Step 8: User callbacks

Every Screen:
  FORCE_REFRESH_EVENT listener
    ├── Reset ALL loading states (setLoading(false), etc.)
    ├── Re-fetch data (loadData(), loadPosts(), etc.)
    └── try/finally guarantees cleanup

Every External Fetch:
  fetchWithTimeout(url, 10000)
    ├── AbortController + setTimeout
    ├── Aborts after 10s → catch runs → finally runs → loading clears
    └── No more hanging promises on dead TCP sockets
```
