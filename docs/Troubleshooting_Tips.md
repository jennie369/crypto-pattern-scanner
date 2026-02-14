# Troubleshooting Tips

Generalized engineering rules extracted from real bugs found during Phase 1-6 audits.

---

# SECTION A: STATE & LIFECYCLE

---

## Rule 1: Side-Effect Cascading in State Updaters
**Source:** Phase 6 — Scanner state wipe on cross-TF pattern click

### When to apply
When a state change in one part of the app triggers unexpected data loss or UI resets elsewhere.

### Symptoms
- User action (click, select, navigate) causes unrelated data to disappear
- "Results wiped" or "state reset" after clicking an item
- Second attempt works but first attempt fails
- Bug only appears when crossing a boundary (different timeframe, different category, different tab)

### Root cause pattern
A state setter has **side effects** that clear other state. When called from an unexpected code path (e.g., pattern selection vs. user-initiated change), the side effects are destructive.

```javascript
// DANGEROUS: Side effects inside state updater
const setTimeframe = (newTf) => {
  setTimeframeRaw(prev => {
    if (prev !== newTf) {
      clearAllResults();  // Destructive side effect
    }
    return newTf;
  });
};
```

### Investigation steps
1. Identify the state that was lost (what disappeared?)
2. Search for all callers of the state setter
3. Check if the setter has side effects (clearing other state, triggering fetches)
4. Map ALL code paths that call the setter — are all paths intentional?
5. Check if the side effect is inside a setState updater (React anti-pattern)

### Preventive measures
- **Add flags to state setters** that control side effects: `setTimeframe(value, { clearResults: true })`
- **Never call setState inside another setState updater** — use `queueMicrotask()` or separate the logic
- **Log state changes** with the caller's identity: `console.log('[setTF] called from:', source)`
- **Separate "user intent" from "state sync"**: user-initiated changes clear state; programmatic changes don't

### Code smell indicators
- `setState` calls nested inside other `setState` updaters
- A single setter that both changes a value AND clears unrelated state
- No way to distinguish "user clicked" vs "code updated programmatically"

---

## Rule 2: Stale Closures in Async Callbacks
**Source:** Phase 1 C1 (CallContext setInterval), C7 (CartContext setTimeout), Phase 3 P0-8 (WebSocket reconnect)

### When to apply
When `setInterval`, `setTimeout`, event listeners, or reconnection callbacks reference state that has since changed.

### Symptoms
- Callback uses outdated value after state change (e.g., call still shows "ringing" after accept)
- Timer-based logic ignores recent user actions
- WebSocket reconnection subscribes to wrong/stale symbol list
- "Works on first try, breaks after state change"

### Root cause pattern
JavaScript closures capture variable values at creation time. Long-lived callbacks (intervals, timeouts, event handlers) keep a snapshot of the original value:

```javascript
// DANGEROUS: interval captures incomingCall at creation time
useEffect(() => {
  const interval = setInterval(() => {
    if (incomingCall) {  // Always the OLD value
      handleCallTimeout(incomingCall);
    }
  }, 30000);
  return () => clearInterval(interval);
}, []); // Empty deps = captures initial state forever
```

### Investigation steps
1. Find `setInterval`/`setTimeout` that references React state or component variables
2. Check if the dependency array includes all referenced variables
3. Check if reconnection callbacks capture variables from outer scope
4. Test: change state, then wait for callback to fire — does it see the new value?

### Preventive measures
- **Use `useRef`** for values accessed in async callbacks:
  ```javascript
  const incomingCallRef = useRef(incomingCall);
  useEffect(() => { incomingCallRef.current = incomingCall; }, [incomingCall]);
  // In interval: use incomingCallRef.current
  ```
- **Include all state in deps** and recreate the interval on change
- **Store reconnection params in instance variables** (not closure locals)
- **Audit all `setInterval`/`setTimeout` calls**: grep `setInterval` across `src/`

### Code smell indicators
- `useEffect(() => { setInterval(...) }, [])` — empty deps with state reference inside
- Reconnection callback referencing local `symbols` variable from outer scope
- `setTimeout` in component that accesses `props` or state without ref

---

## Rule 3: Module-Level State Bleed Across Sessions
**Source:** Phase 1 A7 (forumCache, notificationsCache), C3 (errorService userId, sessionId)

### When to apply
When module-level variables (outside React components) persist data across login/logout cycles.

### Symptoms
- Previous user's data visible after login as a different user
- Cached data from old session appears briefly on new session
- Analytics/error tracking reports wrong user ID after re-login
- "Works correctly on first login, shows stale data after logout + re-login"

### Root cause pattern
Module-level `let`/`const` variables in singleton services are initialized once when the module loads and **never reset** on logout:

```javascript
// MODULE LEVEL — persists across login/logout
let forumCache = {};
let currentUserId = null;
let localReadIds = new Set();

// When user logs out and back in:
// forumCache still has old user's posts
// currentUserId might still be old user
```

### Investigation steps
1. Grep for module-level `let ` and `const ` objects/Maps/Sets that hold user data
2. Check: is there a `clearXxx()` function? Is it called on logout?
3. Check the logout path: does it clear ALL module-level caches?
4. Test: login as User A → view forum → logout → login as User B → check if User A's data is visible

### Preventive measures
- **Every module-level cache MUST have a `clear()` export**: `export const clearForumCache = () => { forumCache = {}; }`
- **Centralized cleanup**: call ALL clear functions from a single `_performFullCleanup()` in AuthContext
- **Grep audit**: regularly grep `let .*=.*{}` and `let .*=.*new (Map|Set)` at file root level
- **Consider React Context** instead of module-level state for user-scoped data

### Code smell indicators
- Module-level `let cache = {}` with no corresponding `clearCache()` function
- Singleton services with `currentUserId` that isn't cleared on logout
- `new Map()` or `new Set()` at module level holding user data

---

## Rule 4: Uncleared Timers and Event Listeners (Memory Leaks)
**Source:** Phase 1 C5 (WebView setInterval), C6 (ForumScreen DeviceEventEmitter), C12 (setTimeout leaks)

### When to apply
When long-running timers or event listeners are created without corresponding cleanup.

### Symptoms
- Memory usage grows over time (especially after screen navigation)
- Duplicate callbacks fire (e.g., same notification handler runs twice)
- CPU usage increases after navigating away and back to a screen
- React warning: "Can't perform a React state update on an unmounted component"

### Root cause pattern
Timers and listeners are created in lifecycle hooks or injected JavaScript but never cleaned up:

```javascript
// DANGEROUS: setInterval without cleanup
useEffect(() => {
  const interval = setInterval(pollStatus, 3000);
  // Missing: return () => clearInterval(interval);
}, []);

// DANGEROUS: Event listener without removal
useEffect(() => {
  DeviceEventEmitter.addListener('forumRefresh', handleRefresh);
  // Missing cleanup — accumulates on each mount
}, []);
```

### Investigation steps
1. Grep `setInterval` across all source files — verify each has `clearInterval`
2. Grep `setTimeout` — verify each has `clearTimeout` in useEffect cleanup
3. Grep `addListener` / `addEventListener` — verify each has `removeListener` / `removeEventListener`
4. Check WebView `injectedJavaScript` for `setInterval` without cleanup

### Preventive measures
- **Every `setInterval` needs a `clearInterval`** in useEffect return
- **Every `addListener` needs a `removeListener`** or `.remove()` in useEffect return
- **Store listener subscriptions**: `const sub = emitter.addListener(...)` then `sub.remove()`
- **WebView intervals**: store interval ID in global variable, clear on navigation

### Code smell indicators
- `setInterval` call without any `clearInterval` in same file
- `DeviceEventEmitter.addListener` inside component without cleanup
- Growing number of listeners visible in React DevTools memory profiler

---

## Rule 5: Singleton Configuration Overwrite (Last One Wins)
**Source:** Phase 1 A1 (6 setNotificationHandler calls, only last survives)

### When to apply
When a global configuration function is called from multiple places, and only the last invocation takes effect.

### Symptoms
- Feature works intermittently depending on module load order
- Changing import order changes behavior
- Custom handler logic is ignored (e.g., incoming call notification suppression)
- "This used to work, then we added a new service and it broke"

### Root cause pattern
A global `setHandler()`/`configure()` function is called from multiple services at module load time. Each call overwrites the previous:

```javascript
// notificationService.js (loaded first)
Notifications.setNotificationHandler({ handleNotification: async () => ({ shouldShowAlert: true }) });

// paperTradeNotificationService.js (loaded second)
Notifications.setNotificationHandler({ handleNotification: async () => ({ shouldShowAlert: true }) });

// InAppNotificationContext.js (loaded third — THE CORRECT ONE)
Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    if (notification.data?.type === 'incoming_call') return { shouldShowAlert: false }; // Suppression
    return { shouldShowAlert: true };
  }
});
// ^ Only this one actually takes effect (if it loads last)
```

### Investigation steps
1. Grep for the configuration function name (e.g., `setNotificationHandler`)
2. Count how many call sites exist
3. Determine load order — which call wins?
4. Check if the winning call has the most complete logic

### Preventive measures
- **One call site only**: configuration functions should be called from exactly ONE place
- **Comment "KEEP — sole call site"** above the canonical call
- **Other services only use the API** (e.g., `scheduleNotificationAsync`), never reconfigure the handler
- **Grep check in CI**: `grep -c 'setNotificationHandler' src/` should return exactly 1

### Code smell indicators
- `setNotificationHandler` / `setBackgroundMessageHandler` called in 3+ files
- Module-init-time configuration in service files (not in the centralized context)
- Bug that "goes away" when you change import order

---

# SECTION B: API & DATA

---

## Rule 6: Spot API vs Futures API Mismatch
**Source:** Phase 6 — AdminAI Binance 400 for futures-only symbols, Phase 1 B8

### When to apply
When working with exchange APIs that have separate endpoints for spot and derivatives markets.

### Symptoms
- HTTP 400 errors from Binance (or similar exchange) for specific symbols
- Works for BTC/ETH but fails for smaller coins
- Error: `Invalid symbol` or `Candles API error: 400`
- Some features work (scanner) but others fail (AI assistant) for the same coin

### Root cause pattern
Coin list is sourced from one API domain (e.g., Futures `fapi.binance.com`) but data fetching uses a different domain (e.g., Spot `api.binance.com`). Futures-only symbols (1000PEPEUSDT, 1000SHIBUSDT) don't exist on the Spot market.

### Investigation steps
1. Check which API provides the coin list/symbol list
2. Grep all `fetch()` calls for the exchange domain
3. Compare: do ALL fetch calls use the same base URL?
4. Test with a known Futures-only symbol (e.g., `1000PEPEUSDT`)

### Preventive measures
- **Centralize API base URL** in one place (e.g., `binanceService.futuresBaseUrl`)
- **Never hardcode API URLs** in individual services — import from the central service
- **Add a lint rule** or grep check: `grep -r "api.binance.com" src/` should return 0 results if you only use Futures
- **Document which API domain** the app uses in README

### Code smell indicators
- Hardcoded `https://api.binance.com` or `https://fapi.binance.com` scattered across multiple files
- Different services using different base URLs for the same exchange
- No centralized API configuration

---

## Rule 7: API Response with Embedded Error Codes
**Source:** Phase 3 P1-15 (Binance HTTP 200 with `code: -1121`)

### When to apply
When an API returns HTTP 200 but the response body contains an error indicator.

### Symptoms
- Feature "works" but returns empty/wrong data
- No HTTP errors in logs, but data is missing
- Works for most symbols, fails silently for some
- Downstream code processes `undefined` fields from what it thinks is valid data

### Root cause pattern
The API returns HTTP 200 with an error in the body. The code checks `response.ok` (which is `true`) but never checks the response payload:

```javascript
// DANGEROUS: HTTP 200 but body is { code: -1121, msg: "Invalid symbol" }
const response = await fetch(url);
if (!response.ok) throw new Error('API failed'); // Never fires
const data = await response.json();
return data; // Returns the error object as if it were valid data
```

### Investigation steps
1. Log raw API responses — do any HTTP 200 responses contain error fields?
2. Check API documentation for error response format (Binance uses `{ code, msg }`)
3. Verify downstream code handles both success and error response shapes
4. Test with invalid inputs to trigger embedded errors

### Preventive measures
- **Always check for error fields in response**: `if (data.code && data.code < 0) throw new Error(data.msg)`
- **Centralize response validation** in the API client wrapper
- **Document each API's error format** in the service file header
- **Test with known-invalid inputs** (invalid symbol, expired auth)

### Code smell indicators
- Only checking `response.ok` or `response.status`
- No `if (data.code)` or `if (data.error)` check after parsing JSON
- Intermittent "undefined" values from API calls that "succeed"

---

## Rule 8: API Response Wrapper Mismatch
**Source:** Phase 5 #10 (karmaService returns `{success, data}`, screen calls `.findIndex()` on wrapper)

### When to apply
When a service wraps its return value in `{ success, data }` but consumers expect the raw value.

### Symptoms
- `.map()`, `.findIndex()`, `.length` crashes with "is not a function"
- Feature crashes immediately on load (not intermittent)
- Service works fine in isolation, crashes in the screen
- Error: `Cannot read property 'findIndex' of undefined`

### Root cause pattern
Service returns `{ success: true, data: [...] }` but the calling screen does `result.findIndex(...)` instead of `result.data.findIndex(...)`:

```javascript
// Service:
return { success: true, data: karmaLevels };

// Screen (WRONG):
const levels = await karmaService.getLevels();
const idx = levels.findIndex(...); // CRASH: levels is {success, data}, not an array

// Screen (CORRECT):
const result = await karmaService.getLevels();
const idx = result.data.findIndex(...);
```

### Investigation steps
1. Check the service's return statement — does it wrap in `{ success, data }`?
2. Check the consumer — does it unwrap `result.data` or use `result` directly?
3. Grep all consumers of the service method
4. Check if there's an inconsistent pattern (some methods wrap, some don't)

### Preventive measures
- **Consistent return pattern**: ALL methods in a service either wrap or don't
- **TypeScript return types**: `Promise<{ success: boolean; data: T }>`
- **Defensive unwrapping**: `const items = result?.data ?? result ?? []`
- **Centralize response unwrapping** in a hook: `const { data, error } = useService()`

### Code smell indicators
- Some service methods return `{ success, data }`, others return raw arrays
- No TypeScript types on service method return values
- Consumer code that sometimes unwraps and sometimes doesn't

---

## Rule 9: Field Name Fragmentation Across Pipeline Stages
**Source:** Phase 6 — TP value mismatch, Phase 5 #11 (triple field mismatch in scanner)

### When to apply
When data passes through multiple transformation stages and downstream components can't find expected fields.

### Symptoms
- Values show as `0`, `undefined`, or `null` when they should have data
- Works for some patterns but not others
- Different components show different values for the same data point
- Adding field aliases "fixes" the bug but new aliases keep being needed

### Root cause pattern
Different pipeline stages use different naming conventions for the same field:
- Detector: `target` (camelCase)
- Zone Manager: `target_1` (snake_case)
- Enricher: `takeProfit` (camelCase, different name)
- UI: `takeProfit || target || target_1` (fallback chain)

When one stage's output doesn't pass through the normalizer, downstream code gets the wrong value or no value.

### Investigation steps
1. Trace the field from its SOURCE (detector) through ALL stages to the UI
2. List every name the field has at each stage
3. Check if the normalizer/enricher is always called, or if some code paths skip it
4. Check fallback chain ORDER: does the correct source win?

### Preventive measures
- **Normalize once, at the source**: the detector should output canonical field names
- **One canonical name per concept**: pick `takeProfit` OR `target`, not both
- **TypeScript interfaces**: define the shape at each pipeline stage
- **Enricher should be mandatory**: never pass raw detector output to UI
- **Test fallback chains**: write tests that verify the correct source wins when multiple fields are set

### Code smell indicators
- Long fallback chains: `pattern.takeProfit || pattern.target || pattern.target_1 || pattern.tp || ...`
- Same field with 3+ aliases across the codebase
- An "enricher" service that exists solely to add field aliases
- Hardcoded R:R or values in one stage that override calculated values from another

---

## Rule 10: Fallback Values That Mask Failures
**Source:** Phase 6 — PNL $0 from circular fallback, Phase 3 P0-4 (quota returns unlimited on error)

### When to apply
When a fallback/default value makes a failure look like success, hiding the real bug.

### Symptoms
- No errors in console, but behavior is wrong
- PNL shows $0 (not an error, just wrong)
- Order executes as MARKET (not an error, just not what user wanted)
- System "works" but produces subtly incorrect results
- Security bypass on error (e.g., quota check returns "unlimited" when API fails)

### Root cause pattern
A fallback value converts a failure (null, undefined, API error) into a plausible-looking value that passes all downstream checks:

```javascript
// DANGEROUS: Fallback masks API failure
const marketPrice = currentMarketPrice || pattern.entry;
// If API fails: marketPrice = pattern.entry
// Then: isSamePrice = |entry - entry| = 0 = true
// Result: MARKET order (looks correct, is wrong)

// DANGEROUS: Security fallback
catch (error) {
  return { allowed: true, unlimited: true }; // Grants unlimited access on failure!
}
```

### Investigation steps
1. Find all `|| defaultValue` and `?? defaultValue` patterns in the data flow
2. Ask: "What happens if the LEFT side is null? Does the default make sense?"
3. Check if the fallback creates a "silent success" that hides a failure
4. Check `catch` blocks — do they grant access or return success on error?
5. Add temporary logging to see if fallbacks are being triggered

### Preventive measures
- **Fail explicitly**: throw or return error instead of silently falling back
- **Distinguish "not available" from "zero"**: use `null` for missing, `0` for actual zero
- **Catch blocks should deny**: `catch { return { allowed: false } }` not `{ allowed: true }`
- **Log fallback usage**: `if (!currentMarketPrice) console.warn('Using fallback price')`
- **Never fallback to the input value**: `x || input` creates a tautology

### Code smell indicators
- `const x = apiResult || sameValueAsInput` (circular fallback)
- `catch { return { success: true } }` (error grants access)
- `parseFloat(data.field) || 0` where 0 is not a valid business value
- Chain of fallbacks that always produce "something" but never signal failure

---

## Rule 11: Format Normalization Across Systems
**Source:** Phase 5 #8 (order "#1001" vs "1001"), Phase 1 A2 (channel "incoming_calls" vs "incoming_call")

### When to apply
When the same identifier has different formats in different systems (DB, API, UI, notifications).

### Symptoms
- Lookup/match fails for some records but not others
- Works when user enters exact format, fails with slight variation
- Channel/route name mismatch causes silent failure (no error, just no effect)
- Same entity has multiple IDs that look slightly different

### Root cause pattern
One system stores `"#1001"` while another expects `"1001"`. Or one uses `"incoming_calls"` (plural) while another uses `"incoming_call"` (singular). No normalization at the boundary:

```javascript
// DB stores: "#1001"
// User enters: "1001"
// Query: WHERE order_number = '1001' → 0 results
```

### Investigation steps
1. Find where the identifier is CREATED/STORED
2. Find where it's USED for lookup/matching
3. Compare formats — any prefix, suffix, case, plural difference?
4. Check if there's a normalization step between creation and lookup

### Preventive measures
- **Normalize at boundary**: strip prefixes, lowercase, singularize at input time
- **Store canonical form**: always store without prefix, add prefix only for display
- **Constants for identifiers**: `CHANNEL_INCOMING_CALL = 'incoming_call'` used everywhere
- **Grep for both variants**: `grep -r "incoming_call"` to find ALL references and unify

### Code smell indicators
- Hardcoded string literals for IDs/channels in multiple files
- No normalization function for order numbers / reference codes
- Plural and singular forms of same identifier in different files
- `.replace('#', '')` appearing in multiple places (patching, not fixing)

---

## Rule 12: Database Load Initializes Stale Derived Values
**Source:** Phase 6 — PNL $0 flash on app restart, mapFromSupabase sets currentPrice = entryPrice

### When to apply
When loading persisted data that includes computed/derived fields that were valid at save time but stale at load time.

### Symptoms
- Correct values flash briefly as $0 or stale data on app restart
- Values "fix themselves" after a few seconds
- Closing and reopening the app shows different values than staying in the app

### Root cause pattern
When loading from database, derived fields (currentPrice, PNL) are initialized to stale values or defaults:

```javascript
// STALE: Sets currentPrice to entryPrice (was correct at open time, wrong now)
currentPrice: parseFloat(data.entry_price) || 0,
unrealizedPnL: 0,  // Always 0 on load
```

### Investigation steps
1. Check the DB-to-memory mapping function (mapFromSupabase, mapFromStorage)
2. List which fields are "live" vs "static" (currentPrice = live, entryPrice = static)
3. Check what happens between load and first price update
4. Time the gap: how long does the user see stale data?

### Preventive measures
- **Don't persist derived values** OR mark them clearly as "stale on load"
- **Trigger immediate price fetch** after loading positions from DB
- **Show loading indicator** for derived fields until first live update arrives
- **Never initialize currentPrice to entryPrice** — use 0 or null and show "loading"

### Code smell indicators
- `currentPrice: parseFloat(data.entry_price)` (copying a static field into a live field)
- `unrealizedPnL: 0` hardcoded in the DB load function
- No "refresh" call after loading persisted data

---

# SECTION C: CONCURRENCY & RACE CONDITIONS

---

## Rule 13: Non-Atomic Read-Then-Write (Double-Spend)
**Source:** Phase 1 C2 (wallet double-spend), B6 (position close), Phase 3 P0-3 (quota bypass)

### When to apply
When business logic reads a value, makes a decision, then writes — without locking or transactions.

### Symptoms
- Balance goes negative (should be impossible)
- Quota exceeded beyond limit
- Two concurrent operations both succeed when only one should
- Bug is rare and hard to reproduce (timing-dependent)

### Root cause pattern
Read-then-write without atomicity. Two concurrent requests both read the same value and both proceed:

```javascript
// DANGEROUS: Not atomic
const balance = await getBalance(userId);      // Both read: $100
if (balance >= amount) {                        // Both pass: 100 >= 80
  await setBalance(userId, balance - amount);   // Both write: 100 - 80 = 20
}
// Result: User spent $80 twice but balance only decreased by $80
```

### Investigation steps
1. Find all "check then update" patterns (balance checks, quota checks, stock checks)
2. Check if the read + write is in a single DB transaction or RPC
3. Test with concurrent requests (2 browser tabs, rapid button clicks)
4. Check if there's a database-level lock or constraint preventing overspendings

### Preventive measures
- **Use Supabase RPC** with a single transaction: `SELECT + UPDATE` in one function
- **Database constraints**: `CHECK (balance >= 0)` prevents negative balance at DB level
- **Optimistic locking**: add `version` column, include in WHERE clause
- **Never do read-check-write** in application code for financial operations
- **UI debouncing**: disable button after first click to reduce concurrency

### Code smell indicators
- `const balance = await getBalance()` followed by `await setBalance(balance - amount)`
- No `BEGIN; ... COMMIT;` or RPC wrapper around check-and-update
- Financial operations without database-level constraints

---

## Rule 14: Unguarded Interval Concurrency
**Source:** Phase 1 B5 (paper trade monitoring), B7 (fetching all 2000 tickers)

### When to apply
When `setInterval` triggers an async operation that may take longer than the interval period.

### Symptoms
- Same operation runs 2-3x concurrently after app resume
- API rate limits hit unexpectedly
- Duplicate position closes / double notifications
- Performance degrades over time during long sessions

### Root cause pattern
`setInterval(5000)` fires the callback every 5s regardless of whether the previous call finished. After app background/resume, queued callbacks fire in burst:

```javascript
// DANGEROUS: No concurrency guard
setInterval(async () => {
  await checkAllOpenPositions();  // Takes 3-8 seconds
  // If it takes 8s, TWO intervals overlap
}, 5000);
```

### Investigation steps
1. Find all `setInterval` that call async functions
2. Check: is there an `isChecking` / `isRunning` guard?
3. Check: does the interval pause when app is in background?
4. Test: put app in background for 30s, then foreground — watch for burst of calls

### Preventive measures
- **Add `isChecking` flag**: skip if already running
  ```javascript
  let isChecking = false;
  setInterval(async () => {
    if (isChecking) return;
    isChecking = true;
    try { await checkPositions(); }
    finally { isChecking = false; }
  }, 5000);
  ```
- **Pause in background**: check `AppState.currentState === 'active'` before running
- **Filter requests**: only fetch data for active items (not ALL 2000 tickers)
- **Consider `setTimeout` chain** instead of `setInterval` for guaranteed sequential execution

### Code smell indicators
- `setInterval` + `async` callback without `isRunning` guard
- No AppState check inside the interval
- Fetching ALL records instead of only the needed subset

---

## Rule 15: Concurrent Collection Mutation During Iteration
**Source:** Phase 1 C4 (WebSocket priceBuffer and subscriptions Map mutated during flush)

### When to apply
When a shared collection (Map, Set, Array, object) is modified while being iterated, especially in async or event-driven code.

### Symptoms
- Callbacks sent to deleted/stale subscriptions
- "Cannot read property of undefined" during forEach
- Missing items in processed results
- Intermittent crashes during high-throughput operations (many WS messages)

### Root cause pattern
A collection is iterated (forEach, for...of) while another event adds/removes items:

```javascript
// DANGEROUS: subscriptions Map modified during flush
priceBuffer.forEach((price, symbol) => {
  const callbacks = subscriptions.get(symbol);  // May be deleted by another event
  callbacks.forEach(cb => cb(price));           // cb may be stale
});
```

### Investigation steps
1. Find shared mutable collections in singleton services
2. Check if any event/callback modifies the collection while iteration is possible
3. Check: does the flush/iteration copy the collection first?
4. Test under high throughput (many concurrent events)

### Preventive measures
- **Copy before iterate**: `const snapshot = new Map(subscriptions)` or `[...array]`
- **Validate before invoke**: `if (typeof cb === 'function') cb(price)`
- **Try/catch per callback**: one failing callback shouldn't break the loop
- **Clear processed items atomically**: don't mutate during iteration

### Code smell indicators
- `Map.forEach` in code that also has `Map.delete` in event handlers
- Singleton with mutable shared state accessed from multiple async paths
- No `try/catch` around individual callback invocations in a loop

---

# SECTION D: SECURITY & ACCESS CONTROL

---

## Rule 16: Client-Only Access Control
**Source:** Phase 3 P0-5 (tier enforcement client-side only), Phase 2 E1 (RLS audit)

### When to apply
When access restrictions (tier checks, role checks, feature gating) are only enforced in the frontend.

### Symptoms
- Direct Supabase/API calls bypass all restrictions
- User with wrong tier can access premium content by modifying network requests
- RLS policies missing or set to `USING(true)` without `TO service_role`
- Security audit finds unprotected tables

### Root cause pattern
All access checks live in React components or client-side services. The database has no RLS policies or has overly permissive ones:

```sql
-- DANGEROUS: Any user can read/write all data
CREATE POLICY "allow_all" ON user_purchases FOR ALL USING (true);
-- Missing: TO service_role (should restrict to backend only)
```

### Investigation steps
1. List all tables with sensitive data (purchases, transactions, payments)
2. For each: check RLS policies (`\dp tablename` or Supabase dashboard)
3. Check for `USING(true)` without `TO service_role`
4. Check for tables with RLS not enabled at all
5. Test: can an authenticated user query another user's data via Supabase client?

### Preventive measures
- **RLS on every table**: `ALTER TABLE x ENABLE ROW LEVEL SECURITY`
- **User can only access own data**: `USING (auth.uid() = user_id)`
- **Service role for admin ops**: `TO service_role` on permissive policies
- **Remove debug policies**: never leave `USING(true)` in production
- **Regular RLS audits**: script to check all tables have policies

### Code smell indicators
- `USING(true)` on tables with user data
- Tables with `RLS: disabled` in production
- No `auth.uid()` in policy conditions
- Access checks only in `if (user.tier >= 2)` in React components

---

## Rule 17: API Key Exposure in Client Code
**Source:** Phase 3 P0-1, P0-2 (ichingService, tarotService calling Gemini API directly from mobile)

### When to apply
When client-side code makes direct API calls to third-party services using API keys.

### Symptoms
- API key visible in network inspector / app bundle
- Direct `fetch('https://generativelanguage.googleapis.com/...')` in mobile code
- No rate limiting on expensive API calls
- Unexpected API billing spikes

### Root cause pattern
Mobile/web code calls a third-party API directly, embedding the API key in the request:

```javascript
// DANGEROUS: API key in client bundle
const response = await fetch(
  `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${API_KEY}`,
  { body: JSON.stringify(prompt) }
);
```

### Investigation steps
1. Grep for third-party API domains in client code (not edge functions)
2. Check environment variables: are API keys exposed via `EXPO_PUBLIC_*`?
3. Check if there's a proxy edge function that should be used instead
4. Check network requests in dev tools for exposed keys

### Preventive measures
- **Always proxy through edge function**: client calls Supabase edge function, edge function calls 3rd-party API
- **Never use `EXPO_PUBLIC_*` for secret API keys**: only use for public keys (Supabase anon key)
- **Edge function uses `SERVICE_ROLE_KEY`**: not exposed to client
- **Rate limit at edge function level**: prevent abuse even with valid auth

### Code smell indicators
- `EXPO_PUBLIC_GEMINI_API_KEY` used in client-side fetch calls
- Direct `fetch('https://api.openai.com/...')` in React components/services
- No corresponding edge function for an API that requires a secret key

---

## Rule 18: Orphaned Resources on Cascading Delete
**Source:** Phase 3 P0-6 (vision board image deletion leaves storage file)

### When to apply
When deleting a database record that has associated files, sub-records, or external resources.

### Symptoms
- Storage usage grows over time even as users delete content
- Orphaned files in Supabase Storage / S3
- Deleted items reappear when storage is browsed directly
- Billing for storage that should have been freed

### Root cause pattern
The delete operation removes the DB row but not the associated file:

```javascript
// DANGEROUS: DB row deleted, storage file stays
await supabase.from('vision_goals').delete().eq('id', goalId);
// Missing: await supabase.storage.from('vision-board').remove([filePath]);
```

### Investigation steps
1. Find all `delete()` operations on tables that have file references
2. Check: is the associated storage file removed before or after the DB delete?
3. Check: what happens if storage delete fails? (Is the DB row still deleted?)
4. Browse storage bucket: are there files with no corresponding DB record?

### Preventive measures
- **Delete storage first, then DB row** (if storage delete fails, record still exists for retry)
- **Use DB trigger**: `ON DELETE` trigger that calls storage cleanup edge function
- **Audit script**: regularly compare storage files against DB records
- **Cascade delete at DB level** for sub-records (`ON DELETE CASCADE`)

### Code smell indicators
- `.delete()` on a table that has `image_url` or `file_path` column
- No `storage.remove()` anywhere near the delete operation
- Storage bucket size growing despite active user deletions

---

# SECTION E: UI & RENDERING

---

## Rule 19: Missing Order Type Coverage (Limit vs Stop)
**Source:** Phase 6 — Breakout entries opened as MARKET instead of PENDING

### When to apply
When implementing a trading system that handles pending orders, and the system only works for some entry scenarios.

### Symptoms
- Orders execute immediately at market price instead of waiting
- Entry price in the position doesn't match what user entered
- Works when entry is below market but fails when entry is above market (or vice versa)
- "Invalid entry" logs in console

### Root cause pattern
The order type detection only handles **standard limit orders** (buy below market / sell above market) but not **stop orders** (buy above market for breakouts / sell below market for breakdowns).

```
OK   LONG entry < market (buy dip)    = Limit order
OK   SHORT entry > market (sell pump) = Limit order
BAD  LONG entry > market (breakout)   = Flagged as "invalid"
BAD  SHORT entry < market (breakdown) = Flagged as "invalid"
```

### Investigation steps
1. Check order creation logic: what happens when `entry > market` for LONG?
2. Search for "invalid" or "corrected" in order creation code
3. Check fill logic: does it handle price rising TO entry (not just dropping)?
4. Test with a breakout pattern (entry above current price)

### Preventive measures
- **Any entry != market should be PENDING** — don't classify entries as "valid" or "invalid"
- **Store `createdAtMarketPrice`** on pending orders to determine fill direction
- **Test all 4 quadrants**: LONG below, LONG above, SHORT below, SHORT above
- **Fill logic should be direction-agnostic**: compare entry vs creation price, not entry vs direction

### Code smell indicators
- `isValidLimit` or `isInvalidEntry` checks that depend on direction
- Entry price being overwritten with market price as a "safety" measure
- `isLimitOrder()` function that returns `false` for half the cases

---

# SECTION F: ARCHITECTURE & DESIGN

---

## Rule 20: Multiple Systems for Same Purpose (Drift)
**Source:** Phase 1 B2 (dual pending order checkers), B4 (dual Scanner contexts), C14 (4 resume systems), Phase 5 #9 (5 referral code sources)

### When to apply
When two or more systems/files/tables/functions exist for the same logical purpose.

### Symptoms
- Behavior differs depending on which system "wins"
- Fixing a bug in one system doesn't fix it in the other
- Different screens show different values for the same data
- Engineers unsure which file is the "real" one

### Root cause pattern
A second system was added (for testing, refactoring, or by a different developer) and the first was never removed:

```
System A: paperTradeService.checkPendingOrders()     (in-memory)
System B: usePendingOrdersChecker + pendingOrderService  (Supabase query)
→ Both run concurrently, can double-fill orders

Source 1: profiles.affiliate_code
Source 2: affiliate_codes.code
Source 3: affiliateService.getMyReferralCode()
Source 4: partnershipService.getPartnerCode()
Source 5: AccountScreen local derivation
→ Each shows a different referral code
```

### Investigation steps
1. Grep for the feature name / function purpose across the codebase
2. List all implementations / sources of truth
3. Compare their logic — are they identical? Do they drift?
4. Check which one is actually consumed by the UI
5. Check if removing one breaks anything (grep for imports)

### Preventive measures
- **One source of truth per concept**: document which file/table is canonical
- **Delete the duplicate**: don't just deprecate, actually remove it
- **Grep before creating**: search for existing implementations before writing a new one
- **Centralized utility**: `getReferralCode()` that reads from ONE source with fallback

### Code smell indicators
- Two files with similar names (e.g., `ScannerContext.js` and `ScannerStateContext.js`)
- Two tables with overlapping columns for the same entity
- Multiple services that each fetch the same data differently
- Comments like "// TODO: merge with other checker"

---

## Rule 21: Missing Timeout on Network Operations
**Source:** Phase 5 #1 (black screen — `supabase.auth.getUser()` hangs forever on slow network)

### When to apply
When startup or critical-path operations make network requests without timeout or fallback.

### Symptoms
- App shows infinite loading / black screen on slow network
- Feature hangs indefinitely (no error, no timeout, no fallback)
- "Works on fast Wi-Fi, hangs on 3G"
- Must force-kill and reopen the app to recover

### Root cause pattern
A network call on the critical path has no timeout. On slow/unstable networks, it hangs forever:

```javascript
// DANGEROUS: No timeout — hangs forever on slow network
const { data: { user } } = await supabase.auth.getUser();
// If network is slow: this await never resolves
// App: stuck on loading screen permanently
```

### Investigation steps
1. Identify the critical path (startup → auth check → main screen)
2. Check each network call on the path: does it have a timeout?
3. Test on airplane mode / 2G throttled network
4. Check: is there a fallback if the call takes too long?

### Preventive measures
- **AbortController with timeout**: every network call on critical path
  ```javascript
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try { await fetch(url, { signal: controller.signal }); }
  finally { clearTimeout(timeout); }
  ```
- **Promise.race with timeout**: `Promise.race([apiCall(), delay(10000).then(() => { throw new TimeoutError() })])`
- **Fallback state**: if auth check times out, show login screen (not blank)
- **Maximum loading time**: if loading screen visible for >15s, show recovery option

### Code smell indicators
- `await supabase.auth.getUser()` with no timeout wrapper
- No `AbortController` in any `fetch()` call
- Loading screen with no maximum duration
- No offline/error fallback in startup sequence

---

## Rule 22: Fabricated/Mock Data Left in Production
**Source:** Phase 5 #7 (boostService analytics: Math.random() daily stats, fabricated reach = 70% of views)

### When to apply
When placeholder or mock data generation logic is shipped to production.

### Symptoms
- Analytics show different numbers on every refresh (randomized)
- Values look "reasonable" but don't match any real data source
- Inconsistent stats between different screens for the same metric
- Legal/trust risk: users make decisions based on fabricated data

### Root cause pattern
Development placeholder code was committed and never replaced with real data:

```javascript
// DANGEROUS: Fake analytics in production
const dailyStats = last7Days.map(date => ({
  date,
  views: Math.floor(Math.random() * totalViews / 7),    // RANDOM!
  reach: Math.floor(views * 0.7),                        // FABRICATED: 70% ratio
  clicks: reactions + comments,                           // WRONG: not actual clicks
}));
```

### Investigation steps
1. Grep for `Math.random()` in analytics/reporting code
2. Check: does the data come from a DB query or is it generated in-app?
3. Compare displayed values against actual DB records
4. Refresh 3x — do values change? (Randomized if yes)

### Preventive measures
- **Mark mock data visibly**: `// TODO: REPLACE WITH REAL DATA` with a lint warning
- **Never use `Math.random()` in analytics**: it's a red flag
- **Track real events**: insert impression/click records, aggregate server-side
- **Label estimates clearly**: if approximated, show "Estimated" label in UI
- **Code review checklist**: "Is any data fabricated/mocked?"

### Code smell indicators
- `Math.random()` in production analytics code
- Hard-coded ratio (`* 0.7`) converting one metric to another
- Analytics values change on every page refresh
- No actual DB table backing the displayed metrics

---

# SECTION G: SUGGESTED AUTOMATED TESTS

---

## Phase 6 Tests

### State Wipe (Rule 1)
```javascript
test('selecting cross-TF pattern does not clear scan results', () => {
  // Setup: scan results with 4h and 1h patterns
  // Action: click a 1h pattern while selectedTF = 4h
  // Assert: scanResults array is NOT empty after selection
});
```

### Order Type (Rule 19)
```javascript
test('LONG breakout entry creates PENDING order', () => {
  const result = service.openPosition({
    pattern: { entry: 110, direction: 'LONG', symbol: 'BTCUSDT' },
    currentMarketPrice: 100,
  });
  expect(result.status).toBe('PENDING');
  expect(result.entryPrice).toBe(110);
});

test('shouldFillOrder fills LONG stop when price rises to entry', () => {
  const order = { entryPrice: 110, createdAtMarketPrice: 100 };
  expect(service.shouldFillOrder(order, 110)).toBe(true);
  expect(service.shouldFillOrder(order, 90)).toBe(false);
});
```

### TP Mismatch (Rule 9)
```javascript
test('zone target uses detector R:R, not hardcoded 1:2', () => {
  const pattern = { entry: 100, stopLoss: 95, riskReward: 2.5 };
  const zone = zoneManager._patternToZone(pattern);
  expect(zone.target_1).toBe(112.5); // 100 + (5 * 2.5), NOT 110
});
```

### API URL (Rule 6)
```javascript
test('adminAIMarketService uses Futures API, not Spot', () => {
  const source = fs.readFileSync('services/adminAI/adminAIMarketService.js', 'utf8');
  expect(source).not.toContain('api.binance.com/api/v3');
  expect(source).toContain('fapi.binance.com/fapi/v1');
});
```

## Phase 1-5 Tests

### Double-Spend Guard (Rule 13)
```javascript
test('concurrent gem spend with insufficient balance — only one succeeds', async () => {
  await setBalance(userId, 100);
  const [result1, result2] = await Promise.all([
    spendGems(userId, 80),
    spendGems(userId, 80),
  ]);
  const successes = [result1, result2].filter(r => r.success);
  expect(successes.length).toBe(1);
  const finalBalance = await getBalance(userId);
  expect(finalBalance).toBe(20);
});
```

### Module Cache Bleed (Rule 3)
```javascript
test('forum cache is empty after logout', () => {
  // Setup: login, load forum, cache populated
  clearForumCache();
  expect(Object.keys(forumCache)).toHaveLength(0);
});
```

### Singleton Configuration (Rule 5)
```javascript
test('setNotificationHandler is called exactly once', () => {
  const source = execSync('grep -r "setNotificationHandler" src/ --include="*.js" -l').toString();
  const files = source.trim().split('\n').filter(Boolean);
  expect(files).toHaveLength(1);
  expect(files[0]).toContain('InAppNotificationContext');
});
```

### Timeout on Startup (Rule 21)
```javascript
test('auth getUser has timeout — does not hang forever', async () => {
  // Mock slow network (never resolves)
  jest.spyOn(supabase.auth, 'getUser').mockReturnValue(new Promise(() => {}));
  const result = await Promise.race([
    loadSession(),
    delay(20000).then(() => 'TIMEOUT'),
  ]);
  expect(result).not.toBe('TIMEOUT');
});
```

### RLS (Rule 16)
```javascript
test('user cannot read other user purchases', async () => {
  const { data, error } = await supabaseAsUserA
    .from('user_purchases')
    .select('*')
    .eq('user_id', userB_id);
  expect(data).toHaveLength(0); // RLS blocks cross-user reads
});
```

### API Error Codes (Rule 7)
```javascript
test('binanceService throws on HTTP 200 with error code', async () => {
  fetch.mockResolvedValue({
    ok: true,
    json: () => ({ code: -1121, msg: 'Invalid symbol' }),
  });
  await expect(binanceService.getKlines('INVALID')).rejects.toThrow('Invalid symbol');
});
```

---

# INDEX

| # | Rule | Section | Source Phases |
|---|------|---------|-------------|
| 1 | Side-Effect Cascading in State Updaters | A: State | 6 |
| 2 | Stale Closures in Async Callbacks | A: State | 1, 3 |
| 3 | Module-Level State Bleed Across Sessions | A: State | 1 |
| 4 | Uncleared Timers and Event Listeners | A: State | 1 |
| 5 | Singleton Configuration Overwrite | A: State | 1 |
| 6 | Spot API vs Futures API Mismatch | B: API | 1, 6 |
| 7 | API Response with Embedded Error Codes | B: API | 3 |
| 8 | API Response Wrapper Mismatch | B: API | 5 |
| 9 | Field Name Fragmentation Across Pipeline | B: API | 5, 6 |
| 10 | Fallback Values That Mask Failures | B: API | 3, 6 |
| 11 | Format Normalization Across Systems | B: API | 1, 5 |
| 12 | Database Load Initializes Stale Derived Values | B: API | 6 |
| 13 | Non-Atomic Read-Then-Write (Double-Spend) | C: Concurrency | 1, 3 |
| 14 | Unguarded Interval Concurrency | C: Concurrency | 1 |
| 15 | Concurrent Collection Mutation During Iteration | C: Concurrency | 1 |
| 16 | Client-Only Access Control | D: Security | 2, 3 |
| 17 | API Key Exposure in Client Code | D: Security | 3 |
| 18 | Orphaned Resources on Cascading Delete | D: Security | 3 |
| 19 | Missing Order Type Coverage (Limit vs Stop) | E: UI | 6 |
| 20 | Multiple Systems for Same Purpose (Drift) | F: Architecture | 1, 5 |
| 21 | Missing Timeout on Network Operations | F: Architecture | 5 |
| 22 | Fabricated/Mock Data Left in Production | F: Architecture | 5 |
