# Phase 7.5 — Auth Profile Loading + Feed Timeout Fix
## Systemic Fix: Silent Profile Null Cascade
**Date**: 2026-02-15 | **Severity**: Critical

---

## Problem Statement

After Phase 7 deployment, multiple tabs broke simultaneously:
1. **Forum/Home**: Shows "Chua co bai viet nao" with TIMEOUT error
2. **Notifications**: Infinite loading spinner
3. **Account**: Shows "maow390" (email prefix) instead of username, no avatar, 0 courses
4. **GemMaster**: Shows FREE badge and 3/3 quota exhausted despite admin login

---

## Root Cause Analysis

### Primary: Silent profile fetch error in AuthContext

`AuthContext.loadSession()` (line 437) and `onAuthStateChange` (line 531) both called:
```javascript
const { data: profileData } = await getUserProfile(user.id);
setProfile(profileData);
```

The `error` field was **destructured away and never checked**. When `getUserProfile` returns `{ data: null, error: someError }`, the profile is silently set to `null`.

**Cascade effect of profile = null:**
- `isAdmin = profile?.role === 'admin'` → `false`
- `userTier = 'FREE'` (fallback)
- `profile?.username` → `undefined` → email prefix used as display name
- All screens consuming `useAuth()` show wrong tier, no avatar, wrong username

### Secondary: Forum timeout returns empty on first load

`ForumScreen.loadHybridFeed()` wraps `generateFeed` with 15s timeout. On timeout, the handler returns early:
```javascript
if (isTimeout) {
  setHasMore(true);
  setLoading(false);
  return; // Never reaches legacy fallback!
}
```

On first load with no cache, this shows "No posts" instead of trying the legacy fallback.

### Tertiary: feedService queries non-existent `follows` table

`feedService.generateFeed()` queried `from('follows')` table which doesn't exist in the database. While `Promise.allSettled` handles this gracefully, it adds unnecessary latency (PostgREST returns 404 error which still requires a round-trip).

---

## Fixes Applied

### Fix 1: AuthContext — Error handling + retry for profile fetch (loadSession)

**File**: `contexts/AuthContext.js` line 438-452

```javascript
// Before: error silently dropped
const { data: profileData } = await getUserProfile(user.id);
setProfile(profileData);

// After: error checked, 1 retry with 1s delay
let profileData = null;
const { data: firstTry, error: firstError } = await getUserProfile(user.id);
if (firstError || !firstTry) {
  console.warn('[AuthContext] profile fetch failed, retrying in 1s...');
  await new Promise(r => setTimeout(r, 1000));
  const { data: retryData, error: retryError } = await getUserProfile(user.id);
  profileData = retryData || null;
} else {
  profileData = firstTry;
}
setProfile(profileData);
```

### Fix 2: AuthContext — Same pattern in onAuthStateChange

**File**: `contexts/AuthContext.js` line 548-563

Same error handling + retry applied to the auth state change handler.

### Fix 3: ForumScreen — Legacy fallback on timeout with empty cache

**File**: `screens/Forum/ForumScreen.js` line 804-818

```javascript
// Before: always return early on timeout
if (isTimeout) { return; }

// After: only return early if we have cached data
if (isTimeout) {
  if (feedItems.length > 0) {
    // Keep cached data, allow retry
    return;
  }
  // Fall through to legacy fallback below
}
```

### Fix 4: feedService — Remove non-existent `follows` table query

**File**: `services/feedService.js` line 271-308

Removed `from('follows').select('following_id')` query. Reduced from 3 parallel queries to 2. Set `followingIds = new Set()` (empty — no personalization until follows table is created).

---

## Engineering Principle

**Never silently drop errors from data-fetching functions.** When a function returns `{ data, error }`, always check the error before using data. Unchecked errors that set state to `null` create cascading failures across the entire app because all consumers trust the state value.

Pattern to follow:
```javascript
const { data, error } = await fetchSomething();
if (error || !data) {
  // Log, retry, or handle — never ignore
}
```

---

## Verification

After these fixes:
- Profile fetch failures are logged with warning/error level
- 1 automatic retry with 1s delay gives transient errors a chance to recover
- Forum shows legacy posts on timeout instead of empty state
- Feed loads faster (2 queries instead of 3)
