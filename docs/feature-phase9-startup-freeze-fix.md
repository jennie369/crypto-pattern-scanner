# Phase 9 — Startup Freeze Fix: Broken Watchdog + Edge Function Timeout
## 6 Files Changed, 4 Root Causes
**Date**: 2026-02-17 | **Severity**: Critical Production

---

## Background

Phase 7.8 fixed app resume deadlocks by adding AbortController timeout to 17 Binance fetch calls and FORCE_REFRESH_EVENT listeners to 15 screens. Despite this, the app **still froze deterministically** on:
- First launch after Metro reload
- Background → foreground after long idle

**Key symptom**: First launch freezes. Kill app → second launch works.

---

## Investigation Approach

A 3-agent investigation team (`phase9-freeze-fix`) was launched:
- **Agent Alpha**: Startup flow tracer — mapped exact execution timeline
- **Agent Beta**: Codebase auditor — grep for all problematic patterns
- **Agent Gamma**: Supabase deep dive — analyzed client config and all service files

### Critical Discovery: Supabase ALREADY Had Timeout

The initial hypothesis was "Supabase calls have no timeout." Agent Gamma discovered this was **partially wrong**:

```javascript
// supabase.js — global fetch wrapper (ALREADY EXISTED before Phase 9)
global: {
  fetch: (url, options = {}) => {
    const isDataQuery = url.includes('/rest/v1/') || url.includes('/auth/v1/');
    if (!isDataQuery || options.signal) return fetch(url, options);
    // 8s timeout for DB + auth calls
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(timeoutId));
  },
},
```

This means `getCurrentUser()`, `getUserProfile()`, `supabase.auth.getUser()`, `supabase.rpc()` all had 8s timeout. The startup should have completed within ~30s worst case.

---

## Root Causes Found

### Root Cause 1 (CRITICAL): Broken Startup Watchdog

**File**: `AppNavigator.js:246`

```javascript
// BUG: setInitialized(true) — this function DOES NOT EXIST in AppNavigator scope!
// initialized comes from useAuth() (read-only). setInitialized is inside AuthContext.
useEffect(() => {
  const startupTimer = setTimeout(() => {
    if (!initialized) {
      setInitialized(true);    // ReferenceError: setInitialized is not defined
      setWelcomeChecked(true);
    }
  }, 15000);
  ...
}, [initialized]);
```

The 15s startup watchdog was a **complete no-op**. When it fired, it threw a silent `ReferenceError` and neither `setInitialized(true)` nor `setWelcomeChecked(true)` ever executed. There was **zero safety net** against startup hangs.

### Root Cause 2: 28 Edge Function Calls Without Timeout

**28 `supabase.functions.invoke()` calls** across 21 files hit `/functions/v1/` which was explicitly excluded from the global fetch wrapper. While none were on the startup path, any user action triggering an edge function (chat, TTS, push notifications, calls) could hang indefinitely on a dead TCP socket.

### Root Cause 3: Resume Sequence Without Overall Timeout

`AppResumeManager._onResume()` awaited Steps 1-2 (session refresh + profile refresh) sequentially without an overall timeout. Even though individual Supabase calls had 8s timeout, the entire resume sequence could take 20+ seconds before reaching Step 7 (FORCE_REFRESH_EVENT), leaving screens stuck for that duration.

### Root Cause 4: performFullCleanup Service Crashes Unguarded

`AuthContext.performFullCleanup()` called 6 service cleanup functions without try/catch. If any service's `.cleanup()` or `.stop()` threw (e.g., on double-call during race condition), the entire cleanup chain aborted and `setLoading(false)` in the `onAuthStateChange` handler was never reached.

### Why Previous Fixes Failed

Phase 7.8 fixed **Binance fetch calls** (Rule 29) and **screen recovery** (Rules 30-31). But:
1. Supabase calls already had 8s timeout — the fix was needed but already existed
2. The startup watchdog was the real safety net and it was **broken**
3. Edge function calls were excluded from the global timeout
4. The resume sequence had no overall time budget

### Why Kill+Relaunch Works

Fresh app launch = new JavaScript context with no stale closures, no pending promises, fresh TCP connections. All timers start clean and the startup waterfall completes quickly (~2-3s on good network).

---

## Fixes Applied (6 files)

### Fix 1: Working Startup Watchdog (AppNavigator.js)

Replaced broken `setInitialized(true)` (undefined function) with `forceReady` local state that bypasses ALL three gate conditions:

```javascript
// NEW: Local state that overrides the gate
const [forceReady, setForceReady] = useState(false);

// Watchdog fires after 15s if startup hasn't completed
useEffect(() => {
  if (initialized && !loading && welcomeChecked) return;
  const startupTimer = setTimeout(() => {
    if (!initialized || loading || !welcomeChecked) {
      setForceReady(true);
      if (!welcomeChecked) setWelcomeChecked(true);
    }
  }, 15000);
  return () => clearTimeout(startupTimer);
}, [initialized, loading, welcomeChecked]);

// Gate: forceReady bypasses everything
if (!forceReady && (!initialized || loading || !welcomeChecked)) {
  return <LoadingScreen />;
}
```

### Fix 2: Edge Function Timeout (supabase.js)

Extended global fetch wrapper with tiered timeouts:

| Endpoint | Timeout | Rationale |
|----------|---------|-----------|
| `/rest/v1/` | 8s | DB queries — fast |
| `/auth/v1/` | 8s | Auth operations — fast |
| `/functions/v1/` | 30s | Edge functions — AI/TTS can be slow |
| `/storage/v1/` | None | File uploads — size-dependent |
| `/realtime/v1/` | None | WebSocket — persistent connection |

### Fix 3: Startup Instrumentation (AuthContext.js)

Added `console.time` / `console.timeEnd` for:
- `[AUTH] Total startup`
- `[AUTH] getCurrentUser`
- `[AUTH] getUserProfile`

This enables diagnosing future startup issues from Metro logs.

### Fix 4: Resume Sequence Timeout (AppResumeManager.js)

Added 10s `Promise.race` timeout to Steps 1 and 2 of the resume sequence:
- Step 1 (session refresh): 10s timeout
- Step 2 (profile refresh): 10s timeout

Ensures FORCE_REFRESH_EVENT (Step 7) fires within ~20s even if both steps timeout.

### Fix 5: refreshProfile Explicit Timeout (AuthContext.js)

Added `withAuthTimeout(supabase.auth.getUser(), 10000)` defense-in-depth for the resume-triggered profile refresh.

### Fix 6: Defensive Cleanup (AuthContext.js)

Wrapped all 6 service cleanup calls in `performFullCleanup()` with individual try/catch to prevent one service crash from blocking the entire cleanup chain.

---

## Architecture After Fix

```
Startup Flow (Phase 9):
  AuthProvider mount
    ├── loadSession() [try/finally guarantees initialized=true]
    │   ├── getCurrentUser() [10s withAuthTimeout + 8s global fetch]
    │   ├── getUserProfile() [8s global fetch, retry with 1s delay]
    │   └── finally: setLoading(false), setInitialized(true)
    └── onAuthStateChange [async, non-blocking for startup]

  AppNavigator gate:
    if (!forceReady && (!initialized || loading || !welcomeChecked))
      → LoadingScreen

  Startup Watchdog (15s):
    if gate still blocked → setForceReady(true) → bypass gate

Resume Flow (Phase 9):
  AppResumeManager._onResume()
    ├── Step 1: Session refresh [10s Promise.race timeout]
    ├── Step 2: Profile refresh [10s Promise.race timeout, only if stale]
    ├── Step 3: Cache clear [only if stale]
    ├── Step 4: WS reconnect
    ├── Step 5: Realtime recovery
    ├── Step 6: Health check
    ├── Step 7: FORCE_REFRESH_EVENT [ALWAYS fires, max ~20s after resume]
    └── Step 8: User callbacks

Supabase Fetch Timeout (Phase 9):
  /rest/v1/ → 8s    (DB queries)
  /auth/v1/ → 8s    (auth operations)
  /functions/v1/ → 30s  (edge functions) ← NEW
  /storage/v1/ → none   (file uploads)
```

---

## Engineering Principles

### Rule 32: Startup Watchdog Must Use Local State, Not Context Setters
A startup watchdog in a child component cannot call `setState` from a parent context. It must use its own local state to bypass the gate. Always verify that watchdog timeout callbacks reference functions that actually exist in scope.

### Rule 33: Global Fetch Wrapper Must Cover All Endpoint Types
When adding a global fetch timeout to an API client, ensure ALL endpoint types are covered (DB, auth, edge functions) with appropriate timeout values. Excluding endpoint types creates invisible gaps that only manifest under specific failure conditions.

### Rule 34: Resume Sequence Needs Overall Time Budget
Even when individual operations have timeouts, the sequential resume sequence needs its own overall timeout to prevent cascading delays. Critical recovery events (FORCE_REFRESH_EVENT) must fire within a bounded time regardless of earlier step failures.

---

## Files Changed (Phase 9)

| File | Change | Lines Changed |
|------|--------|--------------|
| `navigation/AppNavigator.js` | Fixed broken watchdog with forceReady state | ~15 |
| `services/supabase.js` | Extended global fetch wrapper to cover edge functions | ~20 |
| `contexts/AuthContext.js` | Startup instrumentation, refreshProfile timeout, defensive cleanup | ~25 |
| `services/AppResumeManager.js` | Added 10s timeout to resume Steps 1 and 2 | ~10 |

---

## Phase 9b — Auth Timeout Cascade Fix
**Date**: 2026-02-17 | **Severity**: Critical Production

### The Problem

Phase 9 fixed the broken watchdog and edge function timeouts, but the app **still failed on first launch**. After bypassing the loading screen, ALL tabs showed errors:
- Home: `[FeedTimeout] forumService.getPosts fallback timed out after 15000ms`
- GemMaster: "FREE" badge on admin account, "Hết lượt hỏi hôm nay"
- Scanner: 0 patterns found
- Notifications: Stuck in loading
- Account: Failed to load

### Root Cause 5: `getCurrentUser()` Makes an API Call That Hangs

`loadSession()` called `getCurrentUser()` → `supabase.auth.getUser()` → HTTP call to `/auth/v1/user`. On cold Supabase or slow network, this call hangs beyond the 8s global fetch timeout. At 10s, `withAuthTimeout` fires → catch block sets `user=null, profile=null` → cascade.

**Race condition**: `onAuthStateChange(INITIAL_SESSION)` fires and sets user + profile, but loadSession's catch block at 10s **overwrites both to null**.

### Fix: Use `getSession()` Instead of `getCurrentUser()`

| Method | Behavior | Speed |
|--------|----------|-------|
| `getCurrentUser()` → `supabase.auth.getUser()` | **API call** to `/auth/v1/user` | Hangs on cold Supabase |
| `supabase.auth.getSession()` | **Reads from AsyncStorage** | Instant (0ms network) |

```javascript
// BEFORE (Phase 9 — still times out):
const { user, error } = await withAuthTimeout(getCurrentUser(), AUTH_TIMEOUT);

// AFTER (Phase 9b — instant):
const { data: { session }, error: sessionError } = await supabase.auth.getSession();
const user = session?.user ?? null;
```

**Race condition fix**: Catch block now checks `userRef.current` before clearing state:
```javascript
// BEFORE: Blindly overwrites state set by onAuthStateChange
if (error?.message === 'Auth timeout') {
  setUser(null);    // ← OVERWRITES onAuthStateChange!
  setProfile(null);
}

// AFTER: Preserves state if onAuthStateChange already set it
if (!userRef.current) {
  setUser(null);
  setProfile(null);
} else {
  console.warn('loadSession error but user exists via onAuthStateChange — keeping state');
}
```

### Screen Cascade Recovery Audit

| Screen | Auto-Recovery? | Mechanism |
|--------|---------------|-----------|
| ForumScreen | YES | FORCE_REFRESH + basic feed works without auth |
| GemMasterScreen | YES | `[userTier]` dep triggers re-fetch + FORCE_REFRESH |
| ScannerScreen | PARTIAL | Tier auto-updates, user must re-scan |
| NotificationsScreen | YES | `[isAuthenticated]` dep + FORCE_REFRESH |
| AccountScreen | YES | `[user?.id]` dep + FORCE_REFRESH |

With `getSession()`, profile=null window drops from ~10s to ~0ms — cascade becomes a non-issue.

### Engineering Principle

#### Rule 35: Use getSession() Not getUser() for Startup

`getSession()` reads from local storage (instant). `getUser()` makes an API call (can timeout). For mobile app startup, **always use getSession() first** and defer token verification to `onAuthStateChange`. Never block startup on a network call.

### Files Changed (Phase 9b)

| File | Change |
|------|--------|
| `contexts/AuthContext.js` | `getCurrentUser()` → `getSession()`, race condition fix in catch block |

---

## Test Scenarios

- [ ] Cold start (fresh install)
- [ ] Metro reload (R in terminal)
- [ ] Background 10s → Foreground
- [ ] Background 60s → Foreground
- [ ] Background 5min → Foreground
- [ ] Airplane mode → Reconnect
- [ ] Slow network (3G throttle)
- [ ] Kill app → Relaunch
- [ ] Startup watchdog fires (simulate with slow Supabase)
- [ ] Edge function call during background
- [ ] Auth timeout during first launch (Phase 9b: should no longer occur)
- [ ] Admin account shows correct tier on first render
