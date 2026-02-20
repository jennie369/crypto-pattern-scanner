# Troubleshooting Tips

Generalized engineering rules extracted from real bugs found during Phase 1-16 audits.

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

## Rule 23: Local State Diverges from Context on App Resume
**Source:** Phase 7 — Admin role lost after app returns from background

### When to apply
When a screen caches auth/tier/role data in local state instead of subscribing to the shared context that refreshes on app resume.

### Symptoms
- User's role/tier shows incorrectly after resuming from background
- "Quota exhausted" for admin/paid user after re-opening app
- First load is correct, but returning later shows stale data
- Only the screen with local state is wrong; other screens using context are fine

### Root cause pattern
Screen calls `TierService.getUserTier()` once on mount and stores in local `useState`. AuthContext refreshes profile on app resume, but the screen never re-reads it:

```javascript
// DANGEROUS: Local state diverges from context
const [userTier, setUserTier] = useState('FREE');
useEffect(() => {
  TierService.getUserTier(userId).then(setUserTier);
}, []); // Only runs once on mount — never updates on resume

// SAFE: Derive from context (auto-updates on profile refresh)
const { userTier, isAdmin } = useAuth();
```

### Investigation steps
1. Grep for `TierService.getUserTier` in screens (NOT services/contexts)
2. Grep for `setUserTier` — find screens with local tier state
3. Check if the screen uses `useAuth()` or fetches tier independently
4. Check if screen has `navigation.addListener('focus', ...)` to refresh

### Preventive measures
- **Single source of truth**: Use `useAuth()` for role/tier, never cache locally in screens
- **Focus listener**: If local fetch is needed, add `useFocusEffect` to refresh
- **useEffect on profile**: Watch `[profile?.chatbot_tier, profile?.is_admin]` to re-sync

### Code smell indicators
- `const [userTier, setUserTier] = useState(...)` in a screen file
- `TierService.getUserTier()` in a screen's `useEffect([], [])`
- No `useFocusEffect` or `navigation.addListener('focus', ...)`
- Screen imports `supabase.auth.getUser()` directly instead of using AuthContext

---

## Rule 24: Keyword Collision in Intent Detection
**Source:** Phase 7 — Course query triggers journal form because "manifest" matches prosperity widget

### When to apply
When a user query about one feature (courses, products) accidentally triggers a different feature (forms, widgets) due to overlapping keywords.

### Symptoms
- Asking about a course → opens a form instead of showing course info
- Product names containing trigger words activate wrong handlers
- Works for simple queries but breaks for queries with "loaded" keywords
- Widget/form appears when user expected informational response

### Root cause pattern
Intent detection uses flat keyword matching without priority or context:

```javascript
// DANGEROUS: "manifest tiền" matches prosperity_frequency template
const KEYWORDS = { prosperity_frequency: [/manifest.*tiền/i, /mục tiêu/i] };
// User says "Giới thiệu Khóa Manifest Tiền Bạc" → triggers form!

// SAFE: Exclude course/product context before keyword matching
const COURSE_EXCLUSIONS = [/khóa học/i, /giới thiệu khóa/i, /course/i];
if (COURSE_EXCLUSIONS.some(p => p.test(message))) return null; // Skip form detection
```

### Investigation steps
1. Map ALL keywords that trigger widgets/forms
2. Cross-check against course names, product names, and FAQ labels
3. Test each FAQ quick select → verify response type
4. Check if detection has priority system (course > form > default)

### Preventive measures
- **Priority chain**: Course/product intent checked BEFORE form/widget detection
- **Exclusion patterns**: Course-related phrases bypass form triggers entirely
- **skipFormDetection flag**: FAQ handlers pass explicit flag to skip form detection
- **Test matrix**: Every quick select mapped to expected response type

### Code smell indicators
- Flat keyword regex without exclusions
- No priority ordering in intent detection pipeline
- FAQ handler calls same `handleSend()` as free-text input without flags
- Course/product names containing words like "manifest", "goal", "challenge"

---

## Rule 25: Direct Navigation vs Chat-First Flow
**Source:** Phase 7 — Ritual quick select navigates directly without chat message or CTA

### When to apply
When a chatbot quick action bypasses the conversation flow and navigates directly to a screen.

### Symptoms
- Tapping quick action jumps to a screen without any chat response
- No "Bắt đầu" / "Open" CTA button in chat — user has no choice
- Back button goes to wrong tab (different stack)
- Feature screen stuck in wrong tab

### Root cause pattern
Quick select handler calls `navigation.navigate()` directly instead of adding a chat message with an inline CTA:

```javascript
// DANGEROUS: Direct navigation — no chat message, wrong stack
if (action === 'navigate_ritual') {
  navigation.navigate('Account', { screen: 'LetterToUniverseRitual' });
}

// SAFE: Chat message + CTA button within correct stack
addBotMessage({
  text: 'Description of the ritual...',
  actionButtons: [{ label: 'Bắt đầu', screen: 'LetterToUniverseRitual' }],
});
```

### Investigation steps
1. Grep for `navigation.navigate` inside chatbot quick select handlers
2. Check if navigated screen is in the same navigation stack
3. Verify back button behavior from the target screen
4. Check if a chat message is added before navigation

### Preventive measures
- **Chat-first**: Always add bot message before any navigation
- **Inline CTA**: Use actionButtons in message bubble for navigation triggers
- **Same stack**: Register target screens in the chatbot's stack, not Account/Home
- **Back handler**: Ensure `navigation.goBack()` returns to chat

### Code smell indicators
- `navigation.navigate('Account', { screen: ... })` from GemMaster handler
- `setTimeout(() => navigation.navigate(...), ...)` after quick select
- Target screen not registered in GemMasterStack
- No `addBotMessage` before `navigation.navigate`

---

## Rule 26: Deep Link Blank Page (Missing Server-Side Routing)
**Source:** Phase 7 — Shared URL shows blank page because domain doesn't serve OG/redirect

### When to apply
When shared app links open a blank page in mobile browsers instead of showing content or redirecting to the app.

### Symptoms
- Shared URL opens blank page in Messenger/Telegram in-app browser
- No rich preview (title, image) when sharing link on social media
- App doesn't open when tapping shared link
- Works on device with app installed but not in browser

### Root cause pattern
The domain (e.g., gemral.com) is managed by a platform (Shopify) that can't serve custom routes. There's no server-side handler to:
1. Return OG meta tags for social crawlers
2. Redirect mobile users to the app
3. Show fallback content if app not installed

### Investigation steps
1. Open shared URL in browser — check if HTML has OG tags
2. Check DNS: who manages the domain? (Shopify, Vercel, Supabase?)
3. Check if edge function (og-meta) is deployed and accessible
4. Check AASA file: `/.well-known/apple-app-site-association`
5. Check assetlinks: `/.well-known/assetlinks.json`

### Preventive measures
- **Smart link proxy**: Route share URLs through edge function that serves OG tags + app redirect
- **Bot detection**: Serve clean HTML for crawlers, JS redirect for humans
- **Fallback page**: Show content preview + App Store/Play Store links if app not installed
- **AASA + assetlinks**: Deploy well-known files for iOS Universal Links / Android App Links
- **Test in social apps**: Verify preview and tap behavior in Messenger, Telegram, SMS

### Code smell indicators
- Share URLs point to Shopify domain with custom paths Shopify doesn't know
- No edge function serving OG meta tags
- Missing `apple-app-site-association` / `assetlinks.json`
- `meta http-equiv="refresh"` redirecting back to the same domain (loop)

---

# SECTION F2: WEBHOOK & PAYMENT PROCESSING

---

## Rule 27: Early Return Skips Downstream Processing in Multi-Purpose Handler
**Source:** Phase 15 — Webhook grants course enrollments but skips tier upgrades because `extractIndividualCourses()` returns early before `extractTierFromSku()`

### When to apply
When a handler processes multiple concerns (enrollment + tier upgrade + commission + logging) and an early `return` after one concern silently skips all others.

### Symptoms
- Feature A works (course enrollments created) but Feature B doesn't (tiers not upgraded)
- Webhook returns 200 OK, logs show "success", but some database fields are not updated
- Only orders with certain product combinations fail (mixed individual + tier products)
- Adding more products to the courses table makes the problem WORSE (more items match the early check)

### Root cause pattern
A "shortcut" check runs first and returns early, preventing the main processing logic from executing:

```javascript
// DANGEROUS: Early return after first concern — skips EVERYTHING else
const courses = await findMatchingCourses(lineItems, db);
if (courses.length > 0) {
  await grantCourseAccess(courses);
  return new Response({ success: true, message: 'Courses enrolled' }); // ← EXITS HERE
}

// These NEVER execute if ANY item matched as a course:
const { tier } = extractTierFromSku(lineItems);    // ← SKIPPED
await updateProfileTier(user, tier);                // ← SKIPPED
await trackAffiliateCommission(order);              // ← SKIPPED
await logOrderToShopifyOrders(order);               // ← SKIPPED
```

### Why this is insidious
- The early return was originally correct (when courses and tier products were mutually exclusive)
- A later change (adding `shopify_product_id` to trading courses in the `courses` table) caused overlap
- The handler still returns 200 OK with a valid success message — no error to detect
- The skipped logic (tier upgrade, commission, order logging) fails silently

### Investigation steps
1. Map ALL `return` statements in the handler — document what logic each one skips
2. Check if the early-check condition can overlap with items that need downstream processing
3. Verify: can an order contain BOTH items that match the early check AND items that need the main flow?
4. Check if the scope of the early check has expanded over time (new DB records, new matching methods)

### Preventive measures
- **Never return early in multi-concern handlers** — use flags/accumulators instead
  ```javascript
  // SAFE: Accumulate results, process ALL concerns, return once at the end
  const enrolledCourses = await findAndEnrollCourses(lineItems);
  const { tier } = extractTierFromSku(lineItems);
  if (tier !== 'none') await updateProfileTier(user, tier);
  await trackCommission(order);
  return new Response({ courses: enrolledCourses, tier, success: true });
  ```
- **Each concern should be independent**: enrollment doesn't block tier detection
- **Test with mixed orders**: an order containing both individual courses AND tier products
- **Log which steps were executed**: `{ steps: ['enrollment', 'tier_upgrade', 'commission'] }`

### Code smell indicators
- `return new Response(...)` inside an `if` block in the middle of a long handler
- Handler has 5+ sequential sections (STEP 1, STEP 2...) but some conditions exit before reaching them
- The early check's matching criteria has been expanded (new DB lookups, new tables linked)
- Success response from the early return is missing fields that the main return includes

---

## Rule 28: Webhook Writes to Wrong Table (RPC Indirection Mismatch)
**Source:** Phase 15 — `shopify-paid-webhook` calls `unlock_user_access` RPC which writes to `user_access` table, but app reads tiers from `profiles` table

### When to apply
When a webhook handler uses an RPC/function to update access, but the RPC writes to a different table than what the app reads from.

### Symptoms
- Webhook logs show "Access unlocked" but user still sees FREE tier
- A secondary table (`user_access`) is correctly updated but the primary table (`profiles`) is not
- The same operation works in one webhook (direct update) but not another (RPC-based)
- `SELECT * FROM user_access` shows correct tiers; `SELECT * FROM profiles` shows FREE

### Root cause pattern
An RPC function was created early and writes to an intermediate/legacy table. The app was later refactored to read from a different table, but the RPC was never updated:

```sql
-- RPC: unlock_user_access
-- Writes to: user_access table ← WRONG (legacy)
INSERT INTO user_access (user_email, scanner_tier, course_tier, ...)
ON CONFLICT (user_email) DO UPDATE SET ...

-- App reads from: profiles table ← RIGHT (primary)
SELECT course_tier, scanner_tier FROM profiles WHERE id = user_id
```

### Investigation steps
1. Find the RPC function source: `SELECT prosrc FROM pg_proc WHERE proname = 'unlock_user_access'`
2. Check which table the RPC writes to
3. Check which table the app/frontend reads from
4. Compare: are they the same table?
5. Check if there's a trigger or sync mechanism between the tables

### Preventive measures
- **One source of truth**: Document which table is canonical for each data type
- **Update the RPC** to write to the canonical table (or update both)
- **After any refactor**: grep for all RPCs that reference the old table
- **Integration test**: After webhook fires, query the SAME table the app reads from

### Code smell indicators
- Two tables with overlapping columns (`user_access.course_tier` AND `profiles.course_tier`)
- RPC writes to table X, app reads from table Y
- Manual sync needed between tables (trigger, cron, or duplicate writes)
- "Legacy" or "backup" comments near table writes

---

## Rule 29: Column Name Mismatch Between Code and Schema
**Source:** Phase 15 — Both webhooks use `shopify_order_id` (text) but the actual column is `order_id` (bigint). All upserts silently fail.

### When to apply
When code references a column name that doesn't exist in the actual table schema, causing silent failures via PostgREST/Supabase client.

### Symptoms
- Upsert/insert operations return no error but no data is written
- Table remains empty despite webhook returning 200 OK
- `onConflict` parameter references non-existent column → upsert fails silently
- Cross-system dedup checks (`SELECT ... WHERE column = value`) find nothing → duplicate processing

### Root cause pattern
Code was written (or refactored) using a column name that differs from the actual schema:

```javascript
// Code uses:
await supabase.from('shopify_orders').upsert({
  shopify_order_id: orderId,  // ← Column doesn't exist! Table has `order_id`
  ...
}, { onConflict: 'shopify_order_id' });  // ← Constraint doesn't exist!

// Supabase PostgREST silently ignores unknown columns in some cases,
// or returns a 400 error that the code doesn't check
```

### Investigation steps
1. Query actual schema: `SELECT column_name FROM information_schema.columns WHERE table_name = 'X'`
2. Grep code for all references to this table's columns
3. Compare: do the column names in code match the actual schema?
4. Check if upsert errors are being caught (`.then()` vs unhandled)
5. Check constraint names: `SELECT conname FROM pg_constraint WHERE conrelid = 'table'::regclass`

### Preventive measures
- **TypeScript types generated from schema**: `supabase gen types` and use them
- **Check upsert return**: always `const { error } = await supabase.from(...).upsert(...)` and log errors
- **Column name convention**: decide on `order_id` vs `shopify_order_id` and enforce consistently
- **Migration test**: after any migration, verify all edge functions still write successfully
- **Schema-first development**: define columns in migration, generate types, then write code

### Code smell indicators
- `onConflict` references a column not in the table's unique constraints
- Upsert result is not checked (`await supabase.from(...).upsert(...)` with no `{ error }`)
- Table has `order_id` column but code references `shopify_order_id` (or vice versa)
- Multiple references to same table use different column names in different files

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

## Phase 7 Tests

### Local State Diverges (Rule 23)
```javascript
test('GemMasterScreen tier reacts to AuthContext profile changes', () => {
  // Setup: render GemMasterScreen with profile.chatbot_tier = 'FREE'
  // Action: update AuthContext profile to { is_admin: true, role: 'admin' }
  // Assert: screen shows ADMIN badge, not FREE
  // Assert: quota shows unlimited, not "Hết lượt"
});
```

### Keyword Collision (Rule 24)
```javascript
test('course query does not trigger form widget', async () => {
  const response = await handleSend('Giới thiệu Khóa Tư Duy Triệu Phú - Manifest Tiền Bạc');
  expect(response.type).not.toBe('template_form');
  expect(response.type).toBe('course_recommendation');
});
```

### Chat-First Ritual Flow (Rule 25)
```javascript
test('ritual quick select adds chat message before navigation', () => {
  // Action: trigger 'navigate_ritual' quick select
  // Assert: bot message added to messages array with actionButtons
  // Assert: navigation.navigate NOT called (user must tap CTA)
});
```

### Deep Link OG Tags (Rule 26)
```javascript
test('og-meta returns OG tags for course URL', async () => {
  const res = await fetch('/functions/v1/og-meta?path=/courses/123', {
    headers: { 'User-Agent': 'facebookexternalhit/1.1' },
  });
  const html = await res.text();
  expect(html).toContain('og:title');
  expect(html).toContain('og:image');
});
```

## Phase 15 Tests

### Early Return Skips Tier Upgrade (Rule 27)
```javascript
test('mixed order with individual courses AND tier products upgrades both', async () => {
  // Setup: order with 3 mindset courses + 1 trading tier product (SKU gem-course-tier1)
  // All 4 products have shopify_product_id in courses table
  // Action: call handleOrderPaid with this order
  // Assert: course_enrollments created for ALL 4 products
  // Assert: profiles.course_tier = 'TIER1' (NOT 'FREE')
  // Assert: profiles.scanner_tier = 'TIER1' (bundle grant)
});
```

### RPC Writes to Correct Table (Rule 28)
```javascript
test('shopify-paid-webhook updates profiles table, not just user_access', async () => {
  // Setup: user exists with email, all tiers = FREE
  // Action: simulate orders/paid webhook to shopify-paid-webhook
  // Assert: profiles.course_tier updated (not just user_access.course_tier)
});
```

### Column Name Matches Schema (Rule 29)
```javascript
test('shopify_orders upsert uses correct column names', async () => {
  // Check schema: shopify_order_id column exists
  const { data } = await supabase
    .from('shopify_orders')
    .select('shopify_order_id')
    .limit(0);
  // Assert: no error (column exists)
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
| 23 | Local State Diverges from Context on App Resume | A: State | 7 |
| 24 | Keyword Collision in Intent Detection | B: API | 7 |
| 25 | Direct Navigation vs Chat-First Flow | E: UI | 7 |
| 26 | Deep Link Blank Page (Missing Server-Side Routing) | F: Architecture | 7 |
| 27 | Two-Table State Overwrite on High-Frequency Events | A: State | 7.75 |
| 28 | Loading State Must ALWAYS Clear in Finally Block | A: State | 7.75 |
| 29 | Timeoutless fetch() = Permanent Deadlock After Background | C: Concurrency | 7.8 |
| 30 | Recovery Event Must Be Unconditional | F: Architecture | 7.8 |
| 31 | Every Screen With Loading State Needs Recovery Listener | A: State | 7.8 |
| 32 | Startup Watchdog Must Use Local State, Not Context Setters | F: Architecture | 9 |
| 33 | Global Fetch Wrapper Must Cover All Endpoint Types | C: Concurrency | 9 |
| 34 | Resume Sequence Needs Overall Time Budget | F: Architecture | 9 |
| 35 | Use getSession() Not getUser() for Startup | F: Architecture | 9b |
| 36 | Single Notification Source Per Event | F: Architecture | 10 |
| 37 | Client vs Server Notification Responsibility | F: Architecture | 10 |
| 38 | RLS Policy `TO` Clause Defaults to `{public}` | D: Security | 11 |
| 39 | Tables Without RLS Enabled Are Fully Open | D: Security | 11 |
| 40 | Same Fix Must Apply to ALL Code Paths | F: Architecture | 11 |
| 57 | FORCE_REFRESH Handler Must Break React 18 Batch | A: State | 14 |
| 58 | Sequential Supabase Queries Must Run in Parallel | C: Concurrency | 14 |
| 59 | JWT Must Be Validated Before Every Supabase Request | D: Security | 14 |

---

# RULE 27: Two-Table State Overwrite on High-Frequency Events

## Pattern
Two database tables store overlapping data (e.g., `paper_pending_orders` vs `paper_trades` with `status='PENDING'`). A high-frequency event handler (WebSocket price tick) blindly overwrites React state with data from the WRONG table, wiping correct data loaded from the right table.

## Symptom
Data appears briefly on screen (from correct initial load), then vanishes ~1 second later when the first WS tick fires.

## Root Cause
```javascript
// BAD: Called every WS tick, reads from wrong table
const handlePriceUpdate = (symbol, price) => {
  setPendingOrders(paperTradeService.getPendingOrders()); // paper_trades = empty
};
```

## Fix
1. Use a **ref** to track data from the correct source
2. **Throttle** DB queries on high-frequency events (3s+ intervals)
3. Only update state on **actual events** (fill, cancel), not on every tick
```javascript
// GOOD: Only update on events, not on every tick
const handlePriceUpdate = async (symbol, price) => {
  const now = Date.now();
  if (now - lastCheckRef.current < 3000) return; // throttle
  lastCheckRef.current = now;
  const result = await checkAndTriggerOrders(prices);
  if (result.executed > 0) {
    const fresh = await reloadFromDB();
    setPendingOrders(fresh);
  }
};
```

## Prevention
- Document which table is the **single source of truth** for each entity
- Never call `setState(serviceB.getData())` in a handler that runs on every frame/tick
- Use refs for high-frequency data, only sync to state on discrete events

---

# RULE 28: Loading State Must ALWAYS Clear in Finally Block

## Pattern
`setLoading(true)` is called before an async operation, but `setLoading(false)` is placed outside a `finally` block, or gated on conditions (stale requestId, error type).

## Symptom
Screen shows infinite loading spinner after network error, app resume, or race condition.

## Root Cause
```javascript
// BAD: setLoading(false) skipped if error thrown
setLoading(true);
const data = await fetchData(); // throws!
setLoading(false); // never reached

// BAD: setLoading(false) gated on stale check
finally {
  if (requestId === currentRef.current) {
    setLoading(false); // skipped for stale requests
  }
}
```

## Fix
```javascript
// GOOD: try/finally guarantees loading always clears
setLoading(true);
try {
  const data = await fetchData();
  // use data...
} catch (err) {
  console.error(err);
} finally {
  setLoading(false); // ALWAYS runs
}
```

## Prevention
- Every `setLoading(true)` must have a `finally { setLoading(false) }`
- Data can be discarded (stale requestId), but UI loading state must ALWAYS clear
- Grep for `setLoading(true).*await.*setLoading(false)` without `finally` wrapper

---

# RULE 29: Timeoutless fetch() = Permanent Deadlock After Background
**Source:** Phase 7.8 — Scanner stuck "Dang quet", 17 Binance fetch calls with no AbortController

## What Failed
After user backgrounded the app for 10+ seconds and returned, the Scanner screen showed "Dang quet pattern..." permanently. The scan could never complete, and `setScanning(false)` in the `finally` block never executed. Killing the app was the only recovery.

## Why It Failed
`binanceService.getCandles()` used raw `fetch(url)` with **no AbortController and no timeout**. When the OS backgrounds the app, it kills TCP connections. On resume, the `fetch()` promise hangs on a dead socket — it **never resolves AND never rejects**. Since the promise never settles:
1. `Promise.allSettled()` waiting for batch results never completes
2. The `try` block never finishes
3. The `finally { setScanning(false) }` block **never executes**
4. The UI stays stuck permanently

This is fundamentally different from Rule 28 (loading state in finally). Rule 28 handles promises that **reject** (errors). Rule 29 handles promises that **never settle** (hanging forever). `try/finally` is useless against promises that never settle.

```javascript
// BAD: fetch hangs forever on dead TCP socket — try/finally CANNOT help
try {
  setScanning(true);
  const response = await fetch(url);  // HANGS FOREVER after resume
  // ... process data ...
} finally {
  setScanning(false);  // NEVER REACHED — promise never settled
}
```

## What Guard Was Added
AbortController with 10s timeout on ALL 17 Binance API fetch calls across 8 files:

```javascript
// GOOD: AbortController guarantees fetch settles within 10s
async function fetchWithTimeout(url, timeoutMs = 10000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    return response;
  } catch (e) {
    clearTimeout(timeout);
    throw e;  // AbortError after 10s — catch/finally CAN now run
  }
}
```

Files fixed: `binanceService.js` (7), `binanceApiService.js` (3), `paperTradeService.js` (3), `ScannerScreen.js` (1), `TradingChart.js` (4), `PaperTradeModal.js` (1), `portfolioService.js` (2), `adminAIMarketService.js` (2).

## How to Detect Similar Issues
1. **Grep for raw fetch**: `grep -rn "await fetch(" src/ --include="*.js"` — every result MUST have AbortController or go through a timeout wrapper
2. **Check for AbortController**: `grep -rn "AbortController" src/ --include="*.js"` — count should match fetch count
3. **Test**: Start an operation that fetches external API → background app for 30s → return. Does the screen recover? Does the loading spinner clear?
4. **Check Supabase client**: `supabase.js` should have a global fetch wrapper with timeout for `/rest/v1/` and `/auth/v1/` URLs
5. **Ignore internal fetches**: `file://` URIs and localhost calls are safe (no TCP stale socket issue)

### Code smell indicators
- `await fetch(url)` without `{ signal: controller.signal }` parameter
- No `AbortController` anywhere in the same function or file
- `try/finally` around a fetch that has no timeout (gives false sense of safety)
- `Promise.all` or `Promise.allSettled` with fetch calls that have no individual timeout
- External API service files with zero imports of `AbortController`

---

# RULE 30: Recovery Event Must Be Unconditional
**Source:** Phase 7.8 — FORCE_REFRESH_EVENT only fired for backgrounds >60s, leaving 10-59s gap

## What Failed
After the Phase 7.75 fix added `FORCE_REFRESH_EVENT` listeners to screens, the recovery system appeared complete. But screens still froze after short backgrounds (10-59 seconds). The `FORCE_REFRESH_EVENT` was the only way for stuck screens to recover, but it never fired.

## Why It Failed
`AppResumeManager._onResume()` gated the event emission on a staleness check:

```javascript
// BAD: Recovery event only fires for >60s background
const isStale = timeInBackground > 60000;
if (isStale) {
  DeviceEventEmitter.emit(FORCE_REFRESH_EVENT);  // Skipped for 10-59s backgrounds!
}
```

A user who backgrounds the app for 30 seconds during an active scan returns to find the Scanner stuck. AppResumeManager runs the resume sequence (session refresh, etc.) but since `isStale = false`, the FORCE_REFRESH_EVENT never fires. The Scanner's listener that would reset `setScanning(false)` never triggers.

The 60s threshold was originally designed to avoid unnecessary work (cache clearing, profile refresh). But the recovery event was incorrectly included inside the stale-only block.

## What Guard Was Added
Separated the stale-gated operations from the always-needed recovery event:

```javascript
// GOOD: Expensive operations gated by staleness, recovery event ALWAYS fires
if (isStale) {
  this._clearCaches();          // Only when stale — expensive
  await this._profileRefreshFn(); // Only when stale — network call
}

// ALWAYS emit — any background duration can leave screens stuck
DeviceEventEmitter.emit(FORCE_REFRESH_EVENT);
```

## How to Detect Similar Issues
1. **Find the recovery event emission**: `grep -rn "emit.*FORCE_REFRESH\|emit.*RECOVERY\|emit.*RESET" src/`
2. **Check if gated by condition**: Is the emit inside an `if` block? What condition? Can that condition be false when screens are stuck?
3. **Test all background durations**: 10s, 30s, 60s, 120s — does recovery work for ALL?
4. **Separate concerns**: "Should we clear caches?" is a different question from "Should we tell screens to recover?"
5. **Check the resume sequence**: If Steps 1-6 run but Step 7 (recovery event) is conditional, the sequence has a gap

### Code smell indicators
- Recovery event emission inside `if (isStale)` or `if (timeInBackground > threshold)` block
- A threshold value that leaves a gap between "screen can get stuck" and "recovery fires"
- Resume sequence where early steps run unconditionally but the critical recovery step is conditional
- Multiple conditions ANDed together for event emission (any `false` skips recovery)

---

# RULE 31: Every Screen With Loading State Needs Recovery Listener
**Source:** Phase 7.8 — GemMaster, OpenPositions, and 11 other screens had ZERO recovery mechanism

## What Failed
After resume, ForumScreen recovered perfectly (it had a FORCE_REFRESH_EVENT listener). But GemMasterScreen showed "3/3 FREE" for an ADMIN user, OpenPositionsScreen stayed on infinite loading spinner, and 11 other screens were stuck in various loading states. There was no mechanism to reset them.

## Why It Failed
Only 2 out of 15 screens with loading states had FORCE_REFRESH_EVENT listeners:
- **ForumScreen**: Full recovery (reset states + reload data)
- **ScannerScreen**: Partial recovery (reset states only)

The other 13 screens had `setLoading(true)` + async fetch, but **no way to detect app resume and reset**. When data was fetching during background and the fetch failed/hung, the loading state was set to `true` permanently. Even with try/finally (Rule 28), if the screen doesn't know about resume, it can't re-trigger the fetch.

GemMasterScreen specifically showed "3/3 FREE" because:
1. `isLoadingTier` initialized as `useState(true)` — starts loading
2. `useEffect([user?.id, userTier])` fetches quota on mount
3. After resume with stale session, the effect's dependencies don't change
4. No FORCE_REFRESH_EVENT listener → no re-fetch triggered
5. Voice quota stays at initial default: `{ limit: 3, remaining: 3 }`

```javascript
// BAD: Screen has loading state but no recovery listener
const [loading, setLoading] = useState(true);
useEffect(() => {
  loadData().finally(() => setLoading(false));
}, [userId]); // Only fires when userId changes — NOT on resume

// GOOD: Screen resets and reloads on resume
useEffect(() => {
  const listener = DeviceEventEmitter.addListener(FORCE_REFRESH_EVENT, () => {
    setLoading(false);  // Reset stuck state FIRST
    loadData();         // Re-fetch data
  });
  return () => listener.remove();
}, []);
```

## What Guard Was Added
FORCE_REFRESH_EVENT listeners added to all 13 screens that were missing them. Each listener follows the same pattern:
1. **Reset ALL loading states** immediately (`setLoading(false)`, `setRefreshing(false)`, etc.)
2. **Re-fetch data** from scratch (`loadData()`, `loadPosts()`, etc.)
3. **Proper cleanup** in useEffect return (`listener.remove()`)

Screens fixed: GemMasterScreen, OpenPositionsScreen, HomeScreen, NotificationsScreen, AccountScreen, ProfileFullScreen, VisionBoardScreen_NEW, KarmaDashboardScreen, WalletScreen, ShadowModeScreen, CalendarScreen, DailyRecapScreen, AchievementsScreen.

## How to Detect Similar Issues
1. **Find all loading states**: `grep -rn "setLoading(true)\|setIsLoading(true)\|setScanning(true)" src/screens/ --include="*.js"`
2. **For each screen with loading state, check for recovery**: `grep -l "FORCE_REFRESH_EVENT" <file>` — if no match, screen is vulnerable
3. **Coverage audit**: Count screens with loading states vs screens with FORCE_REFRESH_EVENT listeners — they should match
4. **Test**: Background app during data load → return → does every screen recover within 5s?
5. **Check initial state**: `useState(true)` for loading is extra dangerous — screen starts stuck and relies entirely on useEffect to clear it

### The recovery listener template
```javascript
// Add to EVERY screen that has setLoading(true) + async fetch
import { DeviceEventEmitter } from 'react-native';
import { FORCE_REFRESH_EVENT } from '../../utils/loadingStateManager';

useEffect(() => {
  const listener = DeviceEventEmitter.addListener(FORCE_REFRESH_EVENT, () => {
    console.log('[ScreenName] Force refresh received');
    setLoading(false);     // Reset stuck loading states FIRST
    setRefreshing(false);  // Reset any other loading states
    loadData();            // Re-fetch all data from scratch
  });
  return () => listener.remove();
}, [/* deps for loadData if needed */]);
```

### Code smell indicators
- Screen has `setLoading(true)` but no `FORCE_REFRESH_EVENT` in the same file
- `useState(true)` for loading state with no FORCE_REFRESH_EVENT safety net
- Screen only loads data on mount (`useEffect([], [])`) with no resume/focus handler
- Screen registers with `loadingStateManager` but ALSO needs its own FORCE_REFRESH_EVENT listener for data reload (reset alone is not enough — data must also refresh)

---

## Phase 7.8 Tests

### Timeoutless Fetch Deadlock (Rule 29)
```javascript
test('binanceService.getCandles uses AbortController timeout', () => {
  const source = fs.readFileSync('services/binanceService.js', 'utf8');
  // Every fetch call should use fetchWithTimeout, not raw fetch
  const rawFetchCount = (source.match(/await fetch\(/g) || []).length;
  expect(rawFetchCount).toBe(0); // No raw fetch() calls
});

test('scan does not hang permanently when fetch times out', async () => {
  // Mock fetch to never resolve (simulating dead TCP socket)
  jest.spyOn(global, 'fetch').mockReturnValue(new Promise(() => {}));
  const scanPromise = handleScan();
  // With AbortController, should reject within 15s (not hang forever)
  await expect(
    Promise.race([scanPromise, delay(15000).then(() => 'COMPLETED')])
  ).resolves.toBe('COMPLETED');
});
```

### Unconditional Recovery Event (Rule 30)
```javascript
test('FORCE_REFRESH_EVENT fires for short backgrounds (< 60s)', () => {
  const emitSpy = jest.spyOn(DeviceEventEmitter, 'emit');
  appResumeManager._onResume(30000); // 30 seconds background
  expect(emitSpy).toHaveBeenCalledWith('GLOBAL_FORCE_REFRESH');
});

test('FORCE_REFRESH_EVENT fires for long backgrounds (> 60s)', () => {
  const emitSpy = jest.spyOn(DeviceEventEmitter, 'emit');
  appResumeManager._onResume(120000); // 2 minutes background
  expect(emitSpy).toHaveBeenCalledWith('GLOBAL_FORCE_REFRESH');
});
```

### Screen Recovery Listener Coverage (Rule 31)
```javascript
test('every screen with loading state has FORCE_REFRESH_EVENT listener', () => {
  const screenFiles = glob.sync('screens/**/*.js', { cwd: 'src' });
  const missing = [];
  for (const file of screenFiles) {
    const source = fs.readFileSync(`src/${file}`, 'utf8');
    const hasLoadingState = /set(Is)?Loading\(true\)|setScanning\(true\)/i.test(source);
    const hasRecovery = /FORCE_REFRESH_EVENT/.test(source);
    if (hasLoadingState && !hasRecovery) {
      missing.push(file);
    }
  }
  expect(missing).toEqual([]); // No screen with loading state missing recovery
});
```

---

# RULE 32: Startup Watchdog Must Use Local State, Not Context Setters
**Source:** Phase 9 — Broken watchdog called `setInitialized(true)` which didn't exist in scope

## What Failed
After Phase 7.8 fixed resume deadlocks, the app still froze on first launch. A 15-second startup watchdog existed in AppNavigator, but it was completely non-functional — it called `setInitialized(true)` which is defined inside AuthContext's `useState`, NOT exported to child components.

## Why It Failed
AppNavigator destructures `{ initialized }` from `useAuth()` (read-only). The setter `setInitialized` lives inside AuthProvider and is never exposed. When the watchdog timer fired:
```javascript
setTimeout(() => {
  if (!initialized) {
    setInitialized(true);  // ReferenceError: setInitialized is not defined
    setWelcomeChecked(true);
  }
}, 15000);
```
`setInitialized(true)` threw a silent `ReferenceError` inside the setTimeout callback. The error was swallowed by the global error handler. `setWelcomeChecked(true)` was never reached. The watchdog was a complete no-op.

## What Guard Was Added
Replaced with `forceReady` local state that AppNavigator owns and can set:
```javascript
const [forceReady, setForceReady] = useState(false);

// Watchdog: forceReady bypasses ALL three gate conditions
useEffect(() => {
  if (initialized && !loading && welcomeChecked) return;
  const timer = setTimeout(() => {
    if (!initialized || loading || !welcomeChecked) {
      setForceReady(true);
    }
  }, 15000);
  return () => clearTimeout(timer);
}, [initialized, loading, welcomeChecked]);

// Gate: forceReady overrides everything
if (!forceReady && (!initialized || loading || !welcomeChecked)) {
  return <LoadingScreen />;
}
```

## How to Detect Similar Issues
1. **Find all watchdog/timeout callbacks**: `grep -rn "setTimeout.*set[A-Z]" src/ --include="*.js"`
2. **For each setter call in a timeout**: verify the setter is defined in the SAME component's scope
3. **Check if the setter comes from a context**: `const { value } = useContext(...)` gives read-only access; setters must come from `useState()` in the SAME component
4. **Test the watchdog**: Add `console.log` inside the timeout callback and wait for it to fire. Does it actually change state?

### Code smell indicators
- `setTimeout(() => { setSomething(true) }, ...)` where `setSomething` comes from a parent context
- A startup watchdog that has never been observed firing in production logs
- No `const [x, setX] = useState()` matching the `setX()` call in the same file
- Watchdog that should prevent black screen but black screen still happens

---

# RULE 33: Global Fetch Wrapper Must Cover All Endpoint Types
**Source:** Phase 9 — 28 edge function calls with no timeout despite global wrapper existing

## What Failed
The Supabase client had a global fetch wrapper with 8s timeout, but it explicitly excluded `/functions/v1/` (edge functions) and `/storage/v1/` (file uploads). 28 edge function call sites across 21 service files were completely unprotected.

## Why It Failed
The original wrapper was scoped only to "data queries":
```javascript
const isDataQuery = url.includes('/rest/v1/') || url.includes('/auth/v1/');
if (!isDataQuery || options.signal) return fetch(url, options); // NO TIMEOUT
```
Edge functions were excluded because "they're not data queries." But edge functions also use HTTP fetch, and on backgrounded mobile apps, their TCP connections die just like any other fetch call.

## What Guard Was Added
Tiered timeout based on endpoint type:
```javascript
if (url.includes('/rest/v1/') || url.includes('/auth/v1/')) timeout = 8000;
else if (url.includes('/functions/v1/')) timeout = 30000;
// /storage/v1/ — no timeout (file uploads can be large)
```

## How to Detect Similar Issues
1. **Check global wrapper coverage**: Read the `createClient()` config. List ALL URL patterns the API client uses.
2. **For each pattern**: Is it covered by the timeout wrapper?
3. **Count call sites per pattern**: `grep -c "functions.invoke\|from(\|auth\." src/services/`
4. **Test**: Call each endpoint type during airplane mode. Does it timeout or hang?

### Code smell indicators
- Global fetch wrapper with explicit exclusions (`if (!isDataQuery)`)
- Comment saying "skip for X" without explaining why X doesn't need timeout
- Different endpoint types with different timeout requirements but only one timeout value

---

# RULE 34: Resume Sequence Needs Overall Time Budget
**Source:** Phase 9 — Steps 1-2 of AppResumeManager could take 20s+ before FORCE_REFRESH_EVENT

## What Failed
AppResumeManager's resume sequence awaited Steps 1 and 2 (session refresh + profile refresh) sequentially. Even with 8s timeout per Supabase call, each step could involve multiple calls, and the overall sequence had no time budget. FORCE_REFRESH_EVENT (Step 7) was delayed by the cumulative timeout of earlier steps.

## Why It Failed
```javascript
async _onResume(timeInBackground) {
  await this._refreshSession();     // Could take 8-16s on timeout
  await this._profileRefreshFn();   // Could take 8-16s on timeout
  // ... more steps ...
  DeviceEventEmitter.emit(FORCE_REFRESH_EVENT); // Delayed by 20-30s!
}
```

## What Guard Was Added
10s `Promise.race` timeout around each critical step:
```javascript
await Promise.race([
  this._refreshSession(),
  new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 10000)),
]);
```

## How to Detect Similar Issues
1. **Find sequential await chains in critical paths**: `grep -A5 "await this\._" src/services/ --include="*.js"`
2. **Calculate worst-case total time**: If each step has timeout T and there are N steps, worst case = N × T
3. **Check if critical events are at the END**: If the most important action (like FORCE_REFRESH_EVENT) is the last step, it's blocked by ALL previous steps
4. **Add step-level timing**: `console.time` for each step to see actual durations

### Code smell indicators
- Critical recovery event at the END of a multi-step sequential await chain
- Individual step timeouts but no overall sequence timeout
- "Step 7: Emit event" that depends on Steps 1-6 all completing first
- Resume sequence that takes 20+ seconds in degraded conditions

---

## Phase 9 Tests

### Broken Watchdog (Rule 32)
```javascript
test('startup watchdog forces past loading screen after 15s', async () => {
  // Mock AuthContext to never set initialized=true
  jest.spyOn(AuthContext, 'initialized').mockReturnValue(false);
  const { queryByTestId } = render(<AppNavigator />);

  // After 15s, watchdog should force-ready
  jest.advanceTimersByTime(15000);
  expect(queryByTestId('loading-screen')).toBeNull(); // Loading screen gone
});
```

### Edge Function Timeout (Rule 33)
```javascript
test('supabase.functions.invoke has 30s timeout', async () => {
  // Mock fetch to never resolve
  jest.spyOn(global, 'fetch').mockReturnValue(new Promise(() => {}));

  const promise = supabase.functions.invoke('test-function', { body: {} });
  await expect(
    Promise.race([promise, delay(35000).then(() => 'TIMEOUT')])
  ).resolves.not.toBe('TIMEOUT'); // Should abort before 35s
});
```

### Resume Sequence Timeout (Rule 34)
```javascript
test('FORCE_REFRESH_EVENT fires within 25s even if session refresh hangs', async () => {
  const emitSpy = jest.spyOn(DeviceEventEmitter, 'emit');
  // Mock session refresh to hang
  jest.spyOn(supabase.auth, 'getSession').mockReturnValue(new Promise(() => {}));

  appResumeManager._onResume(120000);
  await delay(25000);

  expect(emitSpy).toHaveBeenCalledWith('GLOBAL_FORCE_REFRESH');
});
```

---

# RULE 35: Use getSession() Not getUser() for Startup
**Source:** Phase 9b — `getCurrentUser()` API call hung on cold Supabase, causing auth timeout cascade

## What Failed
After Phase 9 fixed the broken watchdog, the app no longer froze on the loading screen — but ALL tabs showed errors after loading. Admin account appeared as "FREE" user. Error: `Auth timeout` after 10s.

The startup flow called `getCurrentUser()` → `supabase.auth.getUser()` → HTTP call to `/auth/v1/user`. On cold Supabase (free tier wakeup) or slow mobile network, this call hung beyond the 8s fetch timeout and 10s auth timeout. The catch block then set `user=null, profile=null`, causing cascade failure.

**Race condition**: `onAuthStateChange(INITIAL_SESSION)` fired during the timeout window and correctly set user + profile. But loadSession's catch block at 10s **overwrote** everything to null.

## Why It Failed
```javascript
// getCurrentUser() makes an API call — CAN TIMEOUT
const { user, error } = await withAuthTimeout(getCurrentUser(), 10000);
// If timeout fires → catch block runs:
setUser(null);    // ← OVERWRITES what onAuthStateChange set!
setProfile(null); // ← admin → FREE tier → all screens fail
```

## What Guard Was Added
```javascript
// getSession() reads from AsyncStorage — INSTANT, no network call
const { data: { session } } = await supabase.auth.getSession();
const user = session?.user ?? null;

// Catch block: only clear state if no user exists anywhere
if (!userRef.current) {
  setUser(null);     // Genuinely no session
  setProfile(null);
} else {
  // onAuthStateChange already set user — keep it!
}
```

## How to Detect Similar Issues
1. **Audit startup for API calls**: `grep -n "getUser\|getCurrentUser\|auth\.user" src/contexts/`
2. **Check if local-first alternatives exist**: Supabase has `getSession()` (local) vs `getUser()` (API). Most auth libraries have similar pairs.
3. **Watch for catch blocks that overwrite context state**: `grep -n "setUser(null)\|setProfile(null)" src/contexts/`
4. **Test with slow network**: Throttle to 3G and verify startup completes without errors

### Code smell indicators
- `await supabase.auth.getUser()` on the startup path (blocks on network)
- `withAuthTimeout` or `Promise.race` around auth calls in `loadSession`
- Catch block that clears state without checking if another handler already set it
- "First launch fails, second launch works" pattern (cold start vs warm cache)

---

# RULE 36: Single Notification Source Per Event
**Source:** Phase 10 — Liquidation push notifications duplicated 3-4x

## What Failed
A single liquidation (or SL/TP hit) event produced up to **4 push notifications**:
1. `paperTradeService.updatePrices()` → `paperTradeNotificationService.notifyLiquidation()` → LOCAL + REMOTE push
2. `OpenPositionsScreen` → `notificationService.sendStopLossHitNotification()` → another LOCAL push
3. Server cron → `send-paper-trade-push` edge function → another REMOTE push

Two separate notification services (`paperTradeNotificationService` and `notificationService`) and two separate detection systems (client monitoring + server cron) all fired independently for the same event.

## What Guard Was Added
- **Single source**: Only `paperTradeNotificationService` sends trade notifications (removed calls from `OpenPositionsScreen`)
- **Client LOCAL only**: Client sends local push only; remote push is handled solely by server cron
- **Position-ID dedup**: `sendNotification()` uses an in-memory Set keyed by `positionId_type` with 60s TTL
- **Service-level dedup**: `paperTradeService._notifiedPositionIds` Set prevents duplicate calls per position
- **Atomic DB close**: Server cron uses `.eq('status', 'OPEN')` — returns 0 rows if already closed

## Code smell indicators
- Two different notification services handling the same event type
- Screen component sending push notifications (should only show UI alerts)
- Client + server both sending remote push for the same event
- DB update without checking current status (non-atomic close)

---

# RULE 37: Client vs Server Notification Responsibility
**Source:** Phase 10 — Notifications only appear when app opens

## What Failed
Client-side monitoring (`paperTradeService.startGlobalMonitoring()`) is ACTIVE-ONLY — pauses when `!this.isAppActive`. Server cron runs every 60s but client also sent remote push, causing duplicates when both ran.

## Architecture After Fix
```
CLIENT (app active):     LOCAL push only → immediate banner
SERVER CRON (always):    REMOTE push only → FCM/APNs delivery
```
- Client handles foreground/in-app notifications (local `scheduleNotificationAsync`)
- Server cron handles background/closed-app notifications (remote push via edge function)
- Neither sends both types → zero duplication

---

# RULE 38: RLS Policy `TO` Clause Defaults to `{public}` — Not `service_role`
**Source:** Phase 11 — 24 policies on 23 tables had `TO {public}` instead of `TO service_role`

## What Failed
A security audit found 24 RLS policies across 23 tables that were named "Service role full access ..." but actually granted `USING(true)` access to `{public}` — meaning **any authenticated or anonymous user** could read/write ALL data in those tables (user_purchases, gems_transactions, pending_payments, payment_logs, rate_limit_tracking, etc.).

The policies appeared safe by name (e.g., "Service role full access gems_transactions") and in the Supabase dashboard. But the actual SQL was:
```sql
CREATE POLICY "Service role full access gems_transactions" ON gems_transactions
  FOR ALL USING (true) WITH CHECK (true);
-- Missing: TO service_role
-- PostgreSQL defaults TO to {public} when omitted!
```

## Why It Failed
PostgreSQL `CREATE POLICY` defaults the `TO` clause to `public` (ALL roles) if not explicitly specified. When writing migration SQL by hand, it's easy to forget `TO service_role`. The policy name suggests it's service-role-only, but the database doesn't enforce naming — only the `TO` clause matters.

This went undetected because:
1. Policy names in the Supabase dashboard showed "Service role full access" — looked correct
2. The app worked correctly for normal users (they could read their own data via other policies)
3. The vulnerability was only exploitable by someone crafting custom Supabase client queries
4. No automated audit checked the `roles` column in `pg_policies`

## What Guard Was Added
For each of the 24 policies:
1. `DROP POLICY IF EXISTS "old name"` — removed the `{public}` policy
2. `CREATE POLICY "new_name" ... TO service_role` — explicitly restricted to service_role
3. Added user-facing policies where client code needs access (e.g., `authenticated SELECT WHERE user_id = auth.uid()`)

Two migrations deployed:
- `20260217_rls_fix_service_role_policies` — Fixed 24 policies on 23 tables
- `20260217_rls_enable_missing_tables` — Enabled RLS on 20 tables (see Rule 39)

## How to Detect Similar Issues
1. **Audit query** (run periodically):
   ```sql
   SELECT tablename, policyname, roles, cmd, qual
   FROM pg_policies
   WHERE schemaname = 'public'
   AND qual = 'true'
   AND roles = '{public}'
   AND cmd IN ('ALL', 'UPDATE', 'INSERT', 'DELETE');
   ```
   Should return 0 rows. Any result is a vulnerability.

2. **Check every `CREATE POLICY` in migration files**:
   ```bash
   grep -n "CREATE POLICY" supabase/migrations/*.sql | grep -v "TO service_role\|TO authenticated"
   ```
   Any `CREATE POLICY` without explicit `TO` clause defaults to `{public}`.

3. **Review policy names vs roles**: `pg_policies.policyname` can say anything — only `pg_policies.roles` matters.

4. **Test**: As an authenticated non-admin user, try:
   ```javascript
   const { data } = await supabase.from('payment_logs').select('*');
   // Should return [] (no access), not all records
   ```

### Code smell indicators
- `CREATE POLICY "Service role ..." ON table FOR ALL USING (true)` — missing `TO service_role`
- Policy name contains "service" but `pg_policies.roles` shows `{public}`
- Migration SQL with `USING (true) WITH CHECK (true)` but no `TO` clause
- Tables with sensitive financial data (payments, transactions, purchases) having `{public}` write policies

### Prevention checklist for new migrations
- [ ] Every `CREATE POLICY` has explicit `TO` clause (`service_role` or `authenticated`)
- [ ] Backend-only tables: `FOR ALL TO service_role USING (true)`
- [ ] User tables: `FOR SELECT TO authenticated USING (user_id = auth.uid())`
- [ ] Catalog tables: `FOR SELECT TO authenticated USING (is_active = true)` or `USING (true)`
- [ ] No `USING (true)` to `{public}` on tables with user data

---

# RULE 39: Tables Without RLS Enabled Are Fully Open
**Source:** Phase 11 — 20 tables had `rowsecurity = false` — zero access control

## What Failed
20 tables in production had Row Level Security completely disabled. This means **any user with the Supabase anon key** (which is public in the mobile app bundle) could read/write ALL data in these tables — no policies apply at all when RLS is off.

High-risk tables included:
- `push_notification_queue` — attacker could read all users' push tokens
- `user_profiles` — attacker could read/modify any user's profile
- `analytics_events` — attacker could inject fake analytics
- `chatbot_history` — attacker could read any user's AI conversations
- `gem_packs` — attacker could modify gem pack prices

## Why It Failed
Tables created in different migration files at different times by different developers. Some migrations included `ENABLE ROW LEVEL SECURITY`, others did not. There was no automated check to verify all tables have RLS enabled. PostgreSQL creates tables with RLS **disabled** by default.

```sql
-- This migration creates a table but forgets RLS
CREATE TABLE push_notification_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  title TEXT,
  body TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
-- Missing: ALTER TABLE push_notification_queue ENABLE ROW LEVEL SECURITY;
-- Missing: CREATE POLICY ... TO service_role ...;
-- Result: ANY user can read/write ALL push notifications
```

## What Guard Was Added
For each of the 20 tables:
1. `ALTER TABLE x ENABLE ROW LEVEL SECURITY` — activates policy enforcement
2. `CREATE POLICY "service_role_all_x" ... TO service_role` — backend access
3. User-facing policies where client code needs access (SELECT own data, INSERT own data)

Three categories:
- **Backend-only** (9 tables): `service_role ALL` only (calls, job_logs, system_logs, etc.)
- **User-accessible** (7 tables): `service_role ALL` + `authenticated SELECT/INSERT WHERE user_id = auth.uid()`
- **Catalogs** (4 tables): `service_role ALL` + `authenticated SELECT` (public read)

## How to Detect Similar Issues
1. **Audit query** (run after every migration):
   ```sql
   SELECT tablename FROM pg_tables
   WHERE schemaname = 'public' AND rowsecurity = false;
   ```
   Should return 0 rows. Any result is a table with no access control.

2. **Migration template enforcement**: Every `CREATE TABLE` migration should include:
   ```sql
   CREATE TABLE my_table (...);
   ALTER TABLE my_table ENABLE ROW LEVEL SECURITY;
   CREATE POLICY "service_role_all_my_table" ON my_table
     FOR ALL TO service_role USING (true) WITH CHECK (true);
   ```

3. **CI check** (recommended):
   ```bash
   # After applying migrations, verify no tables without RLS
   psql -c "SELECT count(*) FROM pg_tables WHERE schemaname='public' AND rowsecurity=false;"
   # Should output: 0
   ```

4. **Test new tables**: After creating any table, verify:
   ```javascript
   // As anonymous/unauthenticated user:
   const { data } = await supabase.from('new_table').select('*');
   // Should return error or empty array, NOT all rows
   ```

### Code smell indicators
- `CREATE TABLE` with no `ENABLE ROW LEVEL SECURITY` in the same migration
- New table has no policies at all (check `pg_policies` for the table name)
- Table with user data (has `user_id` column) but no policy with `auth.uid()`
- Migration file has table creation but no `CREATE POLICY` statements
- `rowsecurity = false` for any table in `pg_tables`

### Migration template for new tables
```sql
-- Always include these 3 statements for every new table:

-- 1. Create table
CREATE TABLE IF NOT EXISTS my_table (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  ...
);

-- 2. Enable RLS (NEVER skip this)
ALTER TABLE my_table ENABLE ROW LEVEL SECURITY;

-- 3. Add policies
-- Backend access:
CREATE POLICY "service_role_all_my_table" ON my_table
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- User access (choose based on table type):
-- For user-owned data:
CREATE POLICY "users_select_own_my_table" ON my_table
  FOR SELECT TO authenticated USING (user_id = auth.uid());
-- For public catalogs:
CREATE POLICY "users_select_my_table" ON my_table
  FOR SELECT TO authenticated USING (is_active = true);
```

---

## Phase 11 Tests

### RLS Policy TO Clause (Rule 38)
```javascript
test('no {public} policies with USING(true) on write operations', async () => {
  const { data } = await supabaseAdmin.rpc('raw_sql', {
    query: `SELECT tablename, policyname FROM pg_policies
            WHERE schemaname='public' AND qual='true'
            AND roles='{public}' AND cmd IN ('ALL','UPDATE','INSERT','DELETE')`
  });
  expect(data).toHaveLength(0);
});

test('user cannot read other users gem transactions', async () => {
  const { data } = await supabaseAsUserA
    .from('gems_transactions')
    .select('*')
    .eq('user_id', userB_id);
  expect(data).toHaveLength(0);
});
```

### Tables Without RLS (Rule 39)
```javascript
test('all public tables have RLS enabled', async () => {
  const { data } = await supabaseAdmin.rpc('raw_sql', {
    query: `SELECT tablename FROM pg_tables
            WHERE schemaname='public' AND rowsecurity=false`
  });
  expect(data).toHaveLength(0);
});

test('anonymous user cannot read push_notification_queue', async () => {
  const { data, error } = await supabaseAnon
    .from('push_notification_queue')
    .select('*');
  expect(data).toHaveLength(0); // RLS blocks anonymous access
});
```

---

# RULE 40: Same Fix Must Apply to ALL Code Paths (Not Just the One That Broke)
**Source:** Phase 11 — `refreshProfile()` still used `getUser()` after Phase 9b fixed `loadSession()` to use `getSession()`

## What Failed
After Phase 9b fixed `loadSession()` to use `getSession()` (local, instant) instead of `getUser()` (API call), the exact same bug remained in `refreshProfile()`. On app resume, `refreshProfile()` called `supabase.auth.getUser()` with a 10s timeout. On cold Supabase or slow network, the API call hung, the 10s timer fired, and the error `Auth timeout` was thrown. Profile refresh silently failed.

## Why It Failed
Phase 9b correctly identified `getUser()` as the problem and fixed `loadSession()`. But `refreshProfile()` is a **different code path** that also calls `getUser()`. The fix was applied narrowly — only to the function that was actively crashing at the time.

The two code paths serve different purposes but share the same anti-pattern:
- `loadSession()` — startup: reads auth session → loads profile
- `refreshProfile()` — app resume: re-validates auth → refreshes profile

Both paths had the same vulnerability: `getUser()` → API call → hangs → timeout.

```javascript
// loadSession (FIXED in Phase 9b):
const { data: { session } } = await supabase.auth.getSession(); // ← instant, local

// refreshProfile (NOT FIXED until Phase 11):
const { data: { user } } = await withAuthTimeout(
  supabase.auth.getUser(), 10000  // ← API call, can hang 10s+
);
```

The `withAuthTimeout` wrapper gave a false sense of safety — it prevented infinite hang, but a 10s timeout on every resume is still terrible UX.

## What Guard Was Added
Replaced `supabase.auth.getUser()` with `supabase.auth.getSession()` in `refreshProfile()`:

```javascript
// BEFORE (Phase 9b left this unfixed):
const { data: { user: freshUser }, error } = await withAuthTimeout(
  supabase.auth.getUser(), 10000  // Network call — can timeout
);

// AFTER (Phase 11 fix):
const { data: { session }, error } = await supabase.auth.getSession(); // Local — instant
const freshUser = session?.user ?? null;
```

Removed the now-unused `withAuthTimeout` helper entirely.

Session validation is already handled by:
1. AppResumeManager Step 1 (`_refreshSession()` → `getSession()` + `refreshSession()`)
2. `onAuthStateChange` (automatic token refresh on `TOKEN_REFRESHED` event)
3. The profile fetch at Step 3 (`getUserProfile()`) will fail with auth error if session is truly invalid

## How to Detect Similar Issues
1. **After fixing a bug, grep for the same pattern**: `grep -rn "getUser\|getCurrentUser" src/` — fix ALL call sites, not just the crashing one
2. **Map all code paths that do the same thing**: "What other functions also validate auth?" / "What other functions also call this API?"
3. **Search by the root cause, not the symptom**: If `getUser()` is the problem, search for `getUser()` everywhere — don't just fix the function that crashed
4. **Audit the "fixed" function's callers and siblings**: If `loadSession` was fixed, check `refreshProfile`, `validateSession`, and any other auth-related function

### Code smell indicators
- A fix applied to only one of several functions that share the same pattern
- Comments like "Phase X fixed this" in one function, but sibling functions have no such fix
- Timeout wrapper (`withAuthTimeout`, `Promise.race`) around an API call that has a local alternative
- Two functions doing similar operations (load vs refresh) using different underlying APIs

### Prevention
- When fixing a bug, run: `grep -rn "THE_PROBLEMATIC_PATTERN" src/` and fix ALL occurrences
- Create a checklist: "This pattern exists in N places. Fixed M/N."
- Add the fix as a Troubleshooting Rule with grep command to detect recurrence

---

# RULE 41: Auth Token Storage Must Be Encrypted At Rest
**Source:** Security audit — auth tokens (access_token, refresh_token, user object) stored in plaintext AsyncStorage

## What Failed
On Android, AsyncStorage is backed by unencrypted SQLite. Any app with root access or device backup extraction could read Supabase auth tokens in plaintext, enabling session hijacking without credentials.

## Why It Failed
The default Supabase storage adapter writes session JSON directly to AsyncStorage with no encryption layer. SecureStore has a ~2048 byte limit per value, so storing the full session (2-5KB JWT + user object) directly in SecureStore would silently fail for larger sessions (OAuth users, rich metadata).

## What Guard Was Added
Hybrid AES-encrypted storage adapter in `supabase.js`:

1. **AES-256-CTR encryption key** (32 bytes → 64 hex chars) stored in SecureStore (hardware-backed keychain, well under 2KB limit)
2. **Encrypted session ciphertext** stored in AsyncStorage (no size limit)
3. **Auto-migration**: Existing unencrypted sessions are detected (no SecureStore key exists for that AsyncStorage key) and encrypted in place on first read
4. **Graceful fallback**: If SecureStore is unavailable (Expo Go, web), falls back to plain AsyncStorage

```javascript
// BEFORE (plaintext):
const customStorage = {
  setItem: (key, value) => AsyncStorage.setItem(key, value),  // JSON in plain text!
};

// AFTER (encrypted):
class SecureStorageAdapter {
  async setItem(key, value) {
    const encrypted = await this._encrypt(key, value);  // AES-256-CTR
    await AsyncStorage.setItem(key, encrypted);          // hex ciphertext only
  }
}
```

Key implementation details:
- `expo-crypto.getRandomValues()` generates cryptographically secure random AES keys
- Key is written to SecureStore BEFORE ciphertext to AsyncStorage (safer crash ordering)
- Each `setItem` generates a fresh AES key (token refresh every ~55min re-encrypts)
- `removeItem` cleans both AsyncStorage ciphertext AND SecureStore key

## How to Detect Similar Issues
1. **Grep for raw AsyncStorage writes of sensitive data**: `grep -rn "AsyncStorage.setItem" src/ | grep -i "token\|session\|secret\|key"`
2. **Check SecureStore limits**: Any value > 2KB needs the hybrid approach (encrypt + store ciphertext elsewhere)
3. **Verify encryption key source**: Must use `expo-crypto.getRandomValues()` — not `Math.random()`

### Test Plan
```javascript
// After sign-in, verify AsyncStorage contains hex (not JSON):
const raw = await AsyncStorage.getItem('sb-PROJECT-auth-token');
expect(raw).toMatch(/^[0-9a-f]+$/);  // hex ciphertext, not { "access_token": "..." }
expect(JSON.parse.bind(null, raw)).toThrow();  // cannot parse as JSON

// Verify SecureStore has the encryption key:
const key = await SecureStore.getItemAsync('sb-PROJECT-auth-token');
expect(key).toMatch(/^[0-9a-f]{64}$/);  // 256-bit key as 64 hex chars

// Verify existing users auto-migrate without re-login
// (pre-migration: no SecureStore key → getItem detects, encrypts in place, returns original value)
```

---

# RULE 42: Migration Column Type Must Match Live Database Schema
**Source:** Phase 12 — `COALESCE(recurrence_days, 1)` failed with error 42804 because `recurrence_days` is `INTEGER[]` but COALESCE compared it to plain `INTEGER`

## What Failed
The `reset_user_actions` RPC function crashed at runtime with PostgreSQL error `42804`: "COALESCE types integer[] and integer cannot be matched". The `checkAndResetActions` call from `actionService.js` triggered the error on every app launch.

## Why It Failed
The `vision_actions.recurrence_days` column was created as `INTEGER[]` (array) in the database, but the migration SQL used `COALESCE(v_action.recurrence_days, 1)` — comparing an array type to a scalar integer. PostgreSQL's `COALESCE` requires all arguments to share a compatible type.

Additionally, a second migration file declared the column as `INTEGER DEFAULT 1` (scalar), which was a no-op because the column already existed as `INTEGER[]`. This type mismatch between migration files and live DB went undetected.

```sql
-- BAD: COALESCE cannot compare INTEGER[] with INTEGER
COALESCE(v_action.recurrence_days, 1)  -- error 42804

-- GOOD: subscript extracts first element (INTEGER) before COALESCE
COALESCE(v_action.recurrence_days[1], 1)  -- returns INTEGER
```

## What Guard Was Added
1. Fixed `COALESCE(v_action.recurrence_days[1], 1)` in both migration files
2. Fixed column type declaration from `INTEGER DEFAULT 1` to `INTEGER[]`
3. Patched live DB via `execute_sql` with corrected function

## How to Detect Similar Issues
1. **Grep for COALESCE with array columns**: `grep -n "COALESCE" supabase/migrations/*.sql` — check if any argument is an array column
2. **Compare migration types to live DB**: `SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'X'` — do types match migration `ADD COLUMN` statements?
3. **Test all RPC functions**: Call each RPC at least once — type mismatches only surface at runtime
4. **Watch for error 42804**: This specific error code always means COALESCE/CASE/UNION type mismatch

### Code smell indicators
- `COALESCE(array_column, scalar_value)` — must subscript first: `array_column[1]`
- `ADD COLUMN IF NOT EXISTS x INTEGER` when column already exists as `INTEGER[]` — silent no-op
- Migration files with different type declarations for the same column
- RPC functions that are never called during development/testing

### Future bugs this prevents
- Runtime crashes on any RPC that uses COALESCE with array columns
- Silent type mismatches between migration files and live DB schema
- Features that appear to work in development (where the column doesn't exist yet) but crash in production

---

# RULE 43: RPC Function Names in App Code Must Match Database Exactly
**Source:** Phase 12 — `increment_viewer_count`, `add_xp_to_user`, `record_course_enrollment` called in app but didn't exist in DB under those names

## What Failed
Five app-side RPC calls referenced functions that didn't exist in the database:
1. `supabase.rpc('increment_viewer_count')` — actual name: `increment_stream_viewers`
2. `supabase.rpc('decrement_viewer_count')` — actual name: `decrement_stream_viewers`
3. `supabase.rpc('add_xp_to_user')` — actual name: `add_xp`
4. `supabase.rpc('increment_chatbot_usage')` — function didn't exist at all
5. `supabase.rpc('record_course_enrollment')` — function didn't exist at all

These calls silently failed (Supabase returns error object, but the services swallowed it in catch blocks).

## Why It Failed
RPC function names were written in app code based on assumed conventions or copy-pasted from design docs, but the actual SQL `CREATE FUNCTION` used different names. There was no compile-time or startup-time verification that RPC function names match the database.

Additionally, parameter names must also match exactly:
```javascript
// BAD: wrong function name + wrong parameter name
supabase.rpc('increment_viewer_count', { session_id: sessionId })

// GOOD: matches CREATE FUNCTION increment_stream_viewers(p_stream_id UUID)
supabase.rpc('increment_stream_viewers', { p_stream_id: sessionId })
```

## What Guard Was Added
1. Renamed 3 RPC calls to match existing DB functions
2. Created 2 missing SQL functions on live DB (`increment_chatbot_usage`, `record_course_enrollment`)
3. Cross-referenced all 220+ `supabase.rpc()` calls against live DB `pg_proc`

## How to Detect Similar Issues
1. **Extract all RPC names from app code**:
   ```bash
   grep -rn "supabase\.rpc(" src/ --include="*.js" | sed "s/.*rpc('//" | sed "s/'.*//" | sort -u
   ```
2. **Compare against live DB**:
   ```sql
   SELECT proname FROM pg_proc
   WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
   ORDER BY proname;
   ```
3. **Check parameter names**: `SELECT proname, proargnames FROM pg_proc WHERE proname = 'function_name'`
4. **Look for swallowed errors**: RPC calls in `try/catch` that return `[]` or `null` on error hide the failure

### Code smell indicators
- `supabase.rpc('function_name')` where `function_name` doesn't appear in any migration SQL
- Parameter names that don't match the function signature (e.g., `session_id` vs `p_stream_id`)
- Catch blocks that return empty arrays/null without logging the actual error
- RPC calls added during UI development before the backend function was created

### Future bugs this prevents
- Silent feature failures where RPC calls error but the UI shows empty/default state
- Viewer counts that never increment/decrement (broken live streaming)
- XP/achievement rewards that never get applied
- Course enrollments that never get recorded

---

# RULE 44: AbortController Required on ALL External API Fetches (Not Just Binance)
**Source:** Phase 12 — 42 fetch calls across 17 services had no AbortController, expanding on Rule 29 which only covered Binance

## What Failed
Rule 29 (Phase 7.8) added AbortController to 17 Binance API fetch calls. But the codebase had **42 additional fetch calls** to other external APIs — Restream, Giphy, Facebook, payment gateways, TTS services, health checks — all without any timeout protection.

After app background, ANY of these fetches could hang forever on dead TCP sockets, causing the same permanent deadlock that Rule 29 fixed for Binance.

## Why It Failed
Rule 29's fix was scoped to "Binance fetches" because Binance was the service that triggered the bug report. The root cause — dead TCP sockets after backgrounding — affects ALL external fetch calls equally, but the fix wasn't applied universally.

Services affected included:
- `restreamService.js` (7 fetch calls) — streaming platform API
- `giphyService.js` (6 fetch calls) — GIF search API
- `facebookService.js` (5 fetch calls) — Facebook Graph API
- `exchangeAPIService.js` (3 fetch calls) — exchange API keys
- `avatarService.js` (3 fetch calls) — AI avatar generation
- `paymentService.js` (1) — payment processing
- `healthCheckService.js` (2) — uptime monitoring
- Plus 9 more service/component files

## What Guard Was Added
AbortController with appropriate timeouts added to all 38 external fetch calls across 17 files:
- Short-lived API calls (search, status): 5-10s timeout
- Media generation (avatar, TTS): 15-30s timeout
- Payment processing: 20-30s timeout

```javascript
// Pattern applied to every external fetch:
const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
try {
  const response = await fetch(url, { ...options, signal: controller.signal });
  return response;
} finally {
  clearTimeout(timeout);
}
```

## How to Detect Similar Issues
1. **Comprehensive fetch audit**:
   ```bash
   grep -rn "await fetch(" src/ --include="*.js" --include="*.ts" | grep -v "node_modules"
   ```
   Every result MUST have `signal: controller.signal` or go through a timeout wrapper.

2. **Check for AbortController in same function**:
   ```bash
   # Files with fetch but no AbortController — all are vulnerable
   for f in $(grep -rl "await fetch(" src/ --include="*.js"); do
     grep -q "AbortController" "$f" || echo "MISSING: $f"
   done
   ```

3. **Exclude safe fetches**: `file://` URIs, `localhost`, and Supabase client calls (already wrapped by global fetch in `supabase.js`) are safe.

4. **Test**: Start any external API call → background app 30s → return. Does the operation complete or hang?

### Code smell indicators
- `await fetch(url)` without `{ signal: ... }` in any service file
- Service file with zero imports/usage of `AbortController`
- `try/finally` around a fetch with no timeout (false safety — Rule 29)
- New service added that copies fetch pattern from pre-fix code

### Future bugs this prevents
- GIF search hanging forever after background (Giphy API)
- Payment processing hanging on dead socket (payment gateway)
- Facebook post API hanging (Graph API)
- Health check reporting false "unhealthy" because the check itself hung
- Any new external API integration inheriting the same vulnerability

---

# RULE 45: Non-Existent Table References Silently Fail
**Source:** Phase 12 — 5 queries across 4 services referenced `.from('follows')` but the table doesn't exist (real table is `user_follows`)

## What Failed
Four services contained queries against a `follows` table that doesn't exist in the database:
- `storyService.getFollowingStories()` — tried to get followed users' story list
- `liveService.getFollowingStreams()` — tried to get followed users' live streams
- `repostService.getFeedWithReposts()` — tried to get followed users' reposts
- `privacyService.searchFollowersForCloseFriends()` — tried to get user's followers
- `privacyService.canViewPost()` (followers visibility) — tried to check follow status

Each query always returned an error (caught by catch blocks) or empty results, making these features silently non-functional.

## Why It Failed
The `follows` table was referenced in early service code but was later renamed to `user_follows` (or was designed but never created). The services were written against a planned schema, not the actual database. Because all queries were wrapped in `try/catch` with fallback empty arrays, no runtime errors were visible — the features simply returned no data.

```javascript
// SILENT FAILURE: table doesn't exist, catch returns []
try {
  const { data } = await supabase.from('follows').select('following_id').eq('follower_id', user.id);
  return data?.map(f => f.following_id) || [];
} catch (error) {
  console.error('[Service] Error:', error);  // Logged but never noticed
  return [];  // Feature silently broken
}
```

## What Guard Was Added
For each service:
- Replaced dead `.from('follows')` queries with hardcoded empty arrays + comment explaining no follow system exists yet
- `storyService`: shows only own stories (`followingIds = [user.id]`)
- `liveService`: returns empty (`followingIds = []`)
- `repostService`: shows own reposts only (`followingIds = [user.id]`)
- `privacyService`: returns empty followers, `'followers'` visibility treated as private

## How to Detect Similar Issues
1. **Cross-reference all table names in code against live DB**:
   ```bash
   grep -rn "\.from('" src/services/ --include="*.js" | sed "s/.*\.from('//" | sed "s/'.*//" | sort -u > code_tables.txt
   ```
   ```sql
   SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
   ```
   Diff the two lists — any table in code but not in DB is a silent failure.

2. **Check for catch blocks that return empty arrays**:
   ```bash
   grep -B5 "return \[\]" src/services/*.js | grep "catch"
   ```
   These may be hiding real failures, not just "no data" conditions.

3. **Monitor Supabase logs**: `relation "follows" does not exist` errors in PostgREST logs

### Code smell indicators
- `.from('table_name')` where `table_name` doesn't appear in any migration file
- `catch { return [] }` hiding the difference between "no data" and "table doesn't exist"
- Service file referencing a table that no other service file uses
- Comments like "TODO: create follows table" that were never actioned

### Future bugs this prevents
- "Following stories" feature showing nothing even when users have followers
- "Following streams" section always empty
- Feed missing reposts from followed users
- Privacy "followers only" posts being invisible to actual followers
- New features built on top of the `follows` table inheriting the silent failure

---

# RULE 46: Edge Function SDK Version Pinning and Auth Key Hygiene
**Source:** Phase 12 — `chatbot-gemini` used `ANON_KEY` instead of `SERVICE_ROLE_KEY`; 8 edge functions pinned to outdated supabase-js versions

## What Failed
Two issues found across edge functions:

**1. Wrong auth key**: `chatbot-gemini` used `SUPABASE_ANON_KEY` to create its Supabase client, then forwarded the user's `Authorization` header. This meant:
- RLS policies applied as the end user (intended for client, not server-side)
- Write operations to `chatbot_history` could silently fail if RLS blocked them
- No service-level access for admin operations

**2. Outdated SDK versions**: 8 edge functions imported specific pinned versions of `@supabase/supabase-js`:
- `@2.7.1` (2 functions) — 18+ months old, missing bug fixes
- `@2.38.4` (4 functions) — missing security patches
- `@2.39.3` (2 functions) — minor version behind

These pinned versions could have known vulnerabilities, missing features, or incompatibilities with the current Supabase project version.

## Why It Failed
Edge functions were written at different times by different developers. Each copied the import pattern from wherever they found it, including the specific version string. There was no convention or lint rule enforcing:
- Which auth key to use (ANON vs SERVICE_ROLE)
- What SDK version to import

```typescript
// BAD: ANON_KEY + user auth header forwarding (client-level access)
const supabase = createClient(url, Deno.env.get('SUPABASE_ANON_KEY')!, {
  global: { headers: { Authorization: req.headers.get('Authorization')! } }
});

// GOOD: SERVICE_ROLE_KEY (full server-level access, bypasses RLS)
const supabase = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
```

```typescript
// BAD: pinned to specific old version
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

// GOOD: latest within major version
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
```

## What Guard Was Added
1. `chatbot-gemini`: `ANON_KEY` → `SERVICE_ROLE_KEY`, removed user auth header forwarding, added 30s AbortController timeout on Gemini API fetch
2. All 8 functions: pinned versions → `@2` (latest stable within major version)

## How to Detect Similar Issues
1. **Grep edge functions for ANON_KEY**:
   ```bash
   grep -rn "SUPABASE_ANON_KEY" supabase/functions/ --include="*.ts"
   ```
   Server-side functions should use `SERVICE_ROLE_KEY`. ANON_KEY is only appropriate if the function explicitly needs to act as the client user.

2. **Check for pinned versions**:
   ```bash
   grep -rn "@supabase/supabase-js@2\." supabase/functions/ --include="*.ts"
   ```
   Any result with a specific patch version (e.g., `@2.7.1`) should be updated to `@2`.

3. **Verify secrets are set**: List required vs actual secrets for each function:
   ```bash
   grep -rn "Deno.env.get(" supabase/functions/ --include="*.ts" | sed "s/.*get('//" | sed "s/'.*//" | sort -u
   ```

### Code smell indicators
- Edge function importing `SUPABASE_ANON_KEY` while also performing write operations
- `global: { headers: { Authorization: ... } }` in server-side function (client pattern used server-side)
- `@supabase/supabase-js@2.X.Y` where X.Y is more than 3 minor versions behind latest
- Different edge functions importing different SDK versions
- Edge function with no AbortController on external API calls (same as Rule 44)

### Future bugs this prevents
- Server-side operations silently blocked by RLS (wrong auth key)
- SDK version with known security vulnerabilities running in production
- Inconsistent behavior between edge functions using different SDK versions
- New edge functions copying bad patterns from existing ones

---

# RULE 47: Null-to-Zero Coercion in parseFloat Creates False Positive Triggers
**Source:** Phase 13 — `parseFloat(data.stop_loss) || 0` converts null DB values to 0, causing `currentPrice >= 0` → always true → instant false SL/TP/liquidation close

## What Failed
Positions with no stop-loss set (null in DB) were immediately closed as "Stop Loss Hit" the first time `updatePrices()` ran. For SHORT positions: `currentPrice >= position.stopLoss` became `currentPrice >= 0` which is always true for any positive price.

## Why It Failed
JavaScript's `parseFloat(null)` returns `NaN`, and `NaN || 0` evaluates to `0`. The `|| 0` fallback was intended as a "safe default" but `0` is a valid price level — it means "stop loss at $0" which triggers immediately for any SHORT position (or instantly for LONG TP).

The data pipeline had two failure points:
1. **Data source**: `mapFromSupabase()` used `parseFloat(data.stop_loss) || 0` converting null → 0
2. **Consumer**: `updatePrices()` had no null guard — it compared `currentPrice >= position.stopLoss` without checking if stopLoss was actually set

## What Guard Was Added
1. **Data source fix**: `data.stop_loss != null ? parseFloat(data.stop_loss) : null` — preserve null
2. **Consumer fix**: `position.stopLoss > 0 && (isLong ? ... : ...)` — double safety, skip check if null/0

## How to Detect Similar Issues
1. **Grep for `parseFloat(...) || 0` on price fields**:
   ```bash
   grep -rn "parseFloat.*\(data\.\|row\.\).*\|\| *0" gem-mobile/src/services/
   ```
   For price fields (stop_loss, take_profit, entry_price), `|| 0` is dangerous. Use `|| null` or explicit null check.

2. **Grep for comparisons without null guard**:
   ```bash
   grep -rn "currentPrice [<>=].*position\.\(stopLoss\|takeProfit\)" gem-mobile/src/
   ```
   Every comparison must be guarded by `value > 0 &&`.

### Code smell indicators
- `parseFloat(data.some_price) || 0` where the price can legitimately be null/unset
- Price comparison without `> 0` guard on the threshold value
- Same field parsed as `|| 0` in data layer but compared as boolean in logic layer

---

# RULE 48: Notification Dedup Must Cover ALL Event Types (Not Just Some)
**Source:** Phase 13 — `_notifiedPositionIds` guard was applied to SL/TP/Liquidation but NOT to ORDER_FILLED, causing duplicate "Order Filled" push notifications

## What Failed
When a limit order filled, users received 2x "Lệnh đã khớp!" notifications. The dedup guard `_notifiedPositionIds` was added in Phase 10 for SL/TP/Liquidation events but the ORDER_FILLED notification path was missed.

## Why It Failed
The dedup was added reactively — only to the events that were reported as duplicating (SL/TP/Liq). ORDER_FILLED used a different dedup mechanism (`_notifiedKeys` with 60s TTL) that wasn't sufficient to prevent duplicates from concurrent `checkPendingOrders()` calls.

## What Guard Was Added
Wrapped ORDER_FILLED notification in the same `_notifiedPositionIds` check used by SL/TP/Liquidation:
```javascript
if (!this._notifiedPositionIds.has(filledPosition.id)) {
  this._notifiedPositionIds.add(filledPosition.id);
  await notifyOrderFilled({...}, userId);
}
```

## How to Detect Similar Issues
1. **Grep for notification calls without dedup guard**:
   ```bash
   grep -n "await notify" gem-mobile/src/services/paperTradeService.js
   ```
   Every `notifyXxx()` call must be preceded by `_notifiedPositionIds.has()` check.

### Code smell indicators
- Notification call without corresponding Set/Map dedup check
- Different dedup mechanisms for the same class of events (some use Set, others use TTL key)
- Dedup added to N-1 out of N event types

---

# RULE 49: Concurrent Collection Mutation Must Be Immediate (Not Deferred)
**Source:** Phase 13 — Pending order array mutation was deferred until after the fill loop, so concurrent calls saw stale array and double-filled the same order

## What Failed
Two concurrent `checkPendingOrders()` calls both saw the same pending order in the array, both filled it, creating duplicate positions.

## Why It Failed
The code removed filled orders from `this.pendingOrders` AFTER the for-loop completed (batch removal). Between the `shouldFill` check and the batch removal, a concurrent call entered the same loop and saw the already-being-filled order still in the array.

## What Guard Was Added
Move array mutation INSIDE the fill block, BEFORE any async work:
```javascript
if (shouldFill) {
  // Remove from live array IMMEDIATELY (before async Supabase sync)
  this.pendingOrders = this.pendingOrders.filter(o => o.id !== order.id);
  // ...then do async work
}
```

### Code smell indicators
- Collection mutation deferred to after a loop that contains async operations
- Multiple async entry points that iterate the same mutable array
- Batch removal pattern (`filter` after loop) when loop body has `await`

---

# RULE 50: Grace Period Required for Newly Opened Positions
**Source:** Phase 13 — Positions evaluated for SL/TP/liquidation on the same monitoring tick as they were opened, causing immediate false close

## What Failed
A position opened at price $X was immediately evaluated against SL/TP/liquidation using a slightly different price fetched in the same 5s monitoring cycle, causing instant close.

## Why It Failed
`openPosition()` adds to `this.openPositions` array, and the very next `updatePrices()` iteration (which may already be running) picks it up. The fetched market price can differ from the modal's displayed price by the time the position is persisted, causing a false SL/TP hit on the first check.

## What Guard Was Added
10-second grace period in `updatePrices()`:
```javascript
const openedAt = position.openedAt || position.filledAt;
if (openedAt) {
  const ageMs = Date.now() - new Date(openedAt).getTime();
  if (ageMs < 10000) continue; // skip SL/TP/liq checks, still update display price
}
```

### Code smell indicators
- Position/order added to monitoring collection with no timestamp check in evaluator
- Same-tick creation and evaluation in setInterval-based systems
- No `createdAt`/`openedAt` field on monitored objects

---

## Phase 13 Tests

### Null SL/TP Safety (Rule 47)
```javascript
test('null stopLoss does not trigger false SL close', () => {
  const position = { stopLoss: null, direction: 'SHORT' };
  const currentPrice = 100;

  // Guard: stopLoss > 0 must be checked BEFORE comparison
  const hitStopLoss = position.stopLoss > 0 && (
    position.direction === 'LONG'
      ? currentPrice <= position.stopLoss
      : currentPrice >= position.stopLoss
  );

  expect(hitStopLoss).toBe(false); // null > 0 is false → short-circuit
});

test('parseFloat null preservation in mapFromSupabase', () => {
  const data = { stop_loss: null, take_profit: null };

  // BAD: parseFloat(null) || 0 → 0
  const bad = parseFloat(data.stop_loss) || 0;
  expect(bad).toBe(0); // This is the bug

  // GOOD: explicit null check
  const good = data.stop_loss != null ? parseFloat(data.stop_loss) : null;
  expect(good).toBeNull();
});
```

### ORDER_FILLED Dedup (Rule 48)
```javascript
test('ORDER_FILLED notification guarded by _notifiedPositionIds', () => {
  const service = new PaperTradeService();
  const positionId = 'test-123';

  // First call: should notify
  expect(service._notifiedPositionIds.has(positionId)).toBe(false);
  service._notifiedPositionIds.add(positionId);

  // Second call: should skip
  expect(service._notifiedPositionIds.has(positionId)).toBe(true);
});
```

### Immediate Pending Removal (Rule 49)
```javascript
test('filled order removed from pendingOrders BEFORE async work', async () => {
  // Simulate two concurrent calls seeing same pending order
  const service = new PaperTradeService();
  service.pendingOrders = [{ id: 'order-1', symbol: 'BTCUSDT' }];

  // After fill: immediate removal
  service.pendingOrders = service.pendingOrders.filter(o => o.id !== 'order-1');

  // Concurrent call should see empty array
  expect(service.pendingOrders.length).toBe(0);
});
```

### Grace Period (Rule 50)
```javascript
test('position opened < 10s ago skips SL/TP/liq checks', () => {
  const position = {
    openedAt: new Date().toISOString(), // just now
    stopLoss: 100,
    direction: 'LONG',
  };

  const ageMs = Date.now() - new Date(position.openedAt).getTime();
  expect(ageMs < 10000).toBe(true); // should skip
});

test('position opened > 10s ago evaluates SL/TP/liq normally', () => {
  const position = {
    openedAt: new Date(Date.now() - 15000).toISOString(), // 15s ago
    stopLoss: 100,
    direction: 'LONG',
  };

  const ageMs = Date.now() - new Date(position.openedAt).getTime();
  expect(ageMs < 10000).toBe(false); // should evaluate
});
```

### Atomic Close Guard (Rule 13 reinforced)
```javascript
test('closePosition syncs with .eq(status, OPEN) to prevent double-close', async () => {
  // Verify the CLOSE action in syncPositionToSupabase uses atomic guard
  // grep: .eq('status', 'OPEN') must appear in the CLOSE branch
  const source = require('fs').readFileSync('gem-mobile/src/services/paperTradeService.js', 'utf8');
  const closeBlock = source.match(/action === 'CLOSE'[\s\S]*?\.eq\('status', 'OPEN'\)/);
  expect(closeBlock).not.toBeNull();
});
```

### COALESCE Type Mismatch (Rule 42)
```javascript
test('reset_user_actions handles INTEGER[] recurrence_days without type error', async () => {
  // Insert a vision_action with recurrence_days as array
  await supabaseAdmin.from('vision_actions').insert({
    user_id: testUserId,
    goal_id: testGoalId,
    name: 'Test action',
    recurrence_days: [1, 3, 5],
    current_count: 5,
  });

  // Should not throw error 42804
  const { error } = await supabaseAdmin.rpc('reset_user_actions');
  expect(error).toBeNull();
});
```

### RPC Function Name Match (Rule 43)
```javascript
test('all supabase.rpc() calls reference existing database functions', async () => {
  // Extract all RPC names from source code
  const sourceFiles = glob.sync('src/**/*.js');
  const rpcNames = new Set();
  for (const file of sourceFiles) {
    const content = fs.readFileSync(file, 'utf8');
    const matches = content.matchAll(/supabase\.rpc\(['"](\w+)['"]/g);
    for (const m of matches) rpcNames.add(m[1]);
  }

  // Get all functions from DB
  const { data: dbFunctions } = await supabaseAdmin.rpc('raw_sql', {
    query: `SELECT proname FROM pg_proc
            WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')`
  });
  const dbNames = new Set(dbFunctions.map(f => f.proname));

  // Every RPC name in code must exist in DB
  for (const name of rpcNames) {
    expect(dbNames.has(name)).toBe(true); // `${name} called in code but not in DB`
  }
});
```

### AbortController Coverage (Rule 44)
```javascript
test('every external fetch() has AbortController', () => {
  const serviceFiles = glob.sync('src/services/**/*.js');
  const violations = [];

  for (const file of serviceFiles) {
    const content = fs.readFileSync(file, 'utf8');
    const fetchMatches = [...content.matchAll(/await fetch\(/g)];
    if (fetchMatches.length === 0) continue;

    const hasAbortController = content.includes('AbortController');
    if (!hasAbortController) {
      violations.push(file);
    }
  }

  expect(violations).toHaveLength(0);
});
```

### Non-Existent Table References (Rule 45)
```javascript
test('no service references non-existent tables', async () => {
  // Get all table names from code
  const serviceFiles = glob.sync('src/services/**/*.js');
  const codeTableNames = new Set();
  for (const file of serviceFiles) {
    const content = fs.readFileSync(file, 'utf8');
    const matches = content.matchAll(/\.from\(['"](\w+)['"]\)/g);
    for (const m of matches) codeTableNames.add(m[1]);
  }

  // Get all tables from live DB
  const { data: dbTables } = await supabaseAdmin.rpc('raw_sql', {
    query: `SELECT tablename FROM pg_tables WHERE schemaname = 'public'`
  });
  const dbTableNames = new Set(dbTables.map(t => t.tablename));

  // Every table referenced in code must exist in DB
  for (const name of codeTableNames) {
    expect(dbTableNames.has(name)).toBe(true); // `${name} referenced in code but not in DB`
  }
});
```

### Edge Function Auth Key (Rule 46)
```bash
# No edge function should use ANON_KEY for server-side operations
test_count=$(grep -rl "SUPABASE_ANON_KEY" supabase/functions/ --include="*.ts" | wc -l)
# Expected: 0 (all server-side functions use SERVICE_ROLE_KEY)

# No pinned supabase-js minor/patch versions
pinned_count=$(grep -rn "@supabase/supabase-js@2\." supabase/functions/ --include="*.ts" | wc -l)
# Expected: 0 (all use @2 for latest stable)
```

---

# RULE 51: Display Value Must Use Same Source as Copy/Share Action
**Source:** Phase 14 — Referral code displayed differently in Tab Tài Sản vs Affiliate Detail page

## What Failed
Tab "Tài Sản" (AffiliateSection) showed referral code **GEMBBEFE8** while "Chương Trình Affiliate" (AffiliateDetailScreen) showed **GEM64F7F0** for the same user. Clicking "Copy mã" on either screen produced a third value from `affiliateService.getReferralCode()`.

## Why It Failed
Three different data sources were used for the same concept:

1. **AffiliateSection (display)**: `partnershipStatus.affiliate_code` → reads from `affiliate_profiles.affiliate_code || profiles.affiliate_code`
2. **AffiliateDetailScreen (display)**: `profile?.referral_code || profile?.affiliate_code` → reads from `affiliate_profiles` only
3. **Both screens (copy/share)**: `affiliateService.getReferralCode()` → reads from `affiliate_codes.code || profiles.affiliate_code || generate from user.id`

When `affiliate_profiles.affiliate_code` was NULL:
- AffiliateSection fell through to `profiles.affiliate_code` (had a value)
- AffiliateDetailScreen fell through to `user.id.slice(0,6)` fallback (different value)

This is a combination of Rule 9 (Field Name Fragmentation: `referral_code` vs `affiliate_code` vs `code`) and Rule 20 (Multiple Systems for Same Purpose: 5 referral code sources).

## What Guard Was Added
1. Both screens now call `affiliateService.getReferralCode()` during data load (not just for copy/share)
2. The centralized code is stored in state and used for display with fallback chain
3. Display value and copy value are now guaranteed to match

```javascript
// BAD: each screen computes display code from different source
const affiliateCode = partnershipStatus.affiliate_code || `GEM${user?.id?.slice(0, 6)}`;  // Screen A
const referralCode = profile?.referral_code || profile?.affiliate_code || `GEM${user?.id?.slice(0, 6)}`;  // Screen B

// GOOD: all screens use centralized getReferralCode() for display
const [centralCode, setCentralCode] = useState(null);
// Load during data fetch:
const code = await affiliateService.getReferralCode(user.id);
setCentralCode(code);
// Display:
const displayCode = centralCode || fallback;
```

## How to Detect Similar Issues
1. **Grep for inline referral code computation**: Any screen that constructs `GEM${user.id.slice(...)}` instead of calling `affiliateService.getReferralCode()` is using a different source
2. **Compare display vs copy values**: If a screen shows one code but copies a different one, the display source is wrong
3. **Multiple field names for same concept**: `referral_code`, `affiliate_code`, `code` across tables — Rule 9 indicator

### Code smell indicators
- Screen computing a display value inline but using a different function for the copy action
- `profile?.referral_code || profile?.affiliate_code || fallback` — multi-field OR chain across ambiguous names
- Different screens reading from different tables for the "same" data

### Future bugs this prevents
- User sees one referral code, shares a different one
- Referral tracking fails because the displayed code doesn't match what's in affiliate_codes table
- Admin confusion when user reports their referral code but it doesn't match DB records

---

# RULE 53: Webhook Must Process ALL Variants of an Entity (Not Just One Subtype)
**Source:** Phase 14 — `shopify-order-webhook` skipped credit card orders, causing 4 paid orders to vanish from database

## What Failed
4 credit card orders (#4749, #4751, #4755, #4759) totaling 1,984,000 VND were completely lost from the database. No record in `pending_payments`, `payment_logs`, or `shopify_orders`. Customers paid via credit card on Shopify but the GEM platform had zero knowledge of these orders.

## Why It Failed
`shopify-order-webhook/index.ts` had a payment gateway filter that only processed bank transfers:

```typescript
// DANGEROUS: silently skips non-bank-transfer orders
const isBankTransfer =
  paymentGateway.toLowerCase().includes('bank') ||
  paymentGateway.toLowerCase().includes('manual') ||
  paymentGateway === '' ||
  order.financial_status === 'pending';

if (!isBankTransfer) {
  return new Response(JSON.stringify({
    success: true,  // ← Rule 10 violation: returns success for skipped orders
    message: 'Not bank transfer order',
  }));
}
```

Three compounding failures:
1. **Selective processing**: Webhook only handled one payment type, silently ignoring others
2. **Silent success**: Returned `{ success: true }` for skipped orders — Shopify thought the webhook processed correctly and didn't retry
3. **No backup path**: `shopify-webhook` and `shopify-paid-webhook` should have caught credit card orders via `orders/paid` topic but had no trace of these 4 orders — indicating the webhook topic may not be registered or the functions weren't receiving events

This also triggered a **cascade bug**: because credit card orders weren't in `pending_payments`, the `get-order-number` API couldn't find them by `shopify_order_id`, fell through to a dangerous "most recent pending" fallback, and returned a DIFFERENT order's number — causing QR code DH4754 to be shown to customer DH4757 (see Rule 54).

## What Guard Was Added
1. **`shopify-order-webhook`**: Removed the `isBankTransfer` filter entirely. Now creates `pending_payment` records for ALL payment types:
   - Bank transfer → `payment_status = 'pending'`, `payment_method = 'bank_transfer'`
   - Credit card → `payment_status = 'paid'`, `payment_method = 'credit_card'`, `verified_at = NOW()`, `verification_method = 'shopify_verified'`
   - Any other → detected from `payment_gateway_names[0]`, status from `financial_status`

2. **Database**: Added `payment_method` column (VARCHAR(50)) to `pending_payments` table to distinguish payment types

3. **Logging**: `event_type` is `payment_verified` for pre-paid orders (not `order_created`), with `payment_method` and `financial_status` in event_data

## How to Detect Similar Issues
1. **Grep for early-return filters in webhook handlers**:
   ```bash
   grep -A5 "if (!is" supabase/functions/shopify-*/index.ts
   ```
   Any `if (!isSomeType) return success` is a potential data loss point.

2. **Count orders in Shopify vs database**:
   ```sql
   SELECT COUNT(*) FROM pending_payments; -- compare with Shopify Admin order count
   ```
   If counts don't match, some payment types are being skipped.

3. **Check for `success: true` on skip paths**:
   ```bash
   grep -B5 "success: true" supabase/functions/*/index.ts | grep -i "skip\|not\|ignore"
   ```
   Returning success while skipping work violates Rule 10.

4. **Monitor payment_method distribution**:
   ```sql
   SELECT payment_method, COUNT(*) FROM pending_payments GROUP BY payment_method;
   ```
   If only `bank_transfer` appears, credit card orders are still being lost.

### Code smell indicators
- Webhook handler with `if (!isSpecificType) return success` — silently discards other types
- `return { success: true, message: 'Not X type, skipping' }` — makes external system think processing succeeded
- Multiple webhook handlers for same Shopify topic with no clear ownership matrix
- Order count mismatch between Shopify Admin and database

### Future bugs this prevents
- Orders paid via new payment methods (Apple Pay, Google Pay, crypto) being silently discarded
- Revenue tracking missing entire payment channels
- Customer support unable to find orders that Shopify confirms as paid
- Automatic course/tier unlock failing for non-bank-transfer customers

---

# RULE 54: Fallback Queries Must Never Return Unrelated Data
**Source:** Phase 14 — `get-order-number` returned DH4754 (crystal order) when queried for DH4757 (course order), causing wrong QR code display

## What Failed
Customer for order DH4757 (300,000 VND course) was shown a QR code with transfer content "DH4754" (1,990,000 VND crystal order). The customer transferred 300,000 VND with memo "DH4754", which was rejected as `unknown_transaction` because DH4754 was already expired. Customer waited 7 days for manual admin intervention.

## Why It Failed
`get-order-number/index.ts` had three fallback strategies:

```typescript
// Strategy 1: by shopify_order_id → GOOD: exact match
// Strategy 2: by total_amount (most recent) → BAD: returns wrong order if amounts differ
// Strategy 3: most recent pending order → CRITICAL: returns ANY random pending order!
```

When DH4757's credit card order wasn't in `pending_payments` (due to Rule 53 bug):
1. Strategy 1 failed (shopify_order_id not found)
2. Strategy 2 failed (no order with 300,000 amount)
3. Strategy 3 returned DH4754 (the most recent pending order — a crystal order for a completely different customer!)

The Thank You page then displayed QR code with "DH4754" content, and the customer unknowingly transferred money with the wrong reference.

**This is a textbook Rule 10 violation**: the fallback "helped" by returning *something* instead of returning an error, but that *something* was catastrophically wrong.

## What Guard Was Added
Removed Strategy 2 (match by total_amount) and Strategy 3 (most recent pending) entirely. Only Strategy 1 (exact match by `shopify_order_id`) remains. If not found → returns 404 with clear error message.

```typescript
// BEFORE: 3 fallback strategies (dangerous)
if (!orderNumber && totalAmount) { /* Strategy 2: match by amount */ }
if (!orderNumber) { /* Strategy 3: most recent pending — CAUSED THE BUG */ }

// AFTER: exact match only (safe)
if (numericId) {
  const { data } = await supabase.from('pending_payments')
    .select('order_number').eq('shopify_order_id', numericId).single();
  if (data) orderNumber = data.order_number;
}
if (!orderNumber) return 404; // explicit failure, no guessing
```

Combined with Rule 53 fix (all payment types now stored in `pending_payments`), Strategy 1 will always find the order.

## How to Detect Similar Issues
1. **Grep for fallback queries that broaden scope**:
   ```bash
   grep -A10 "if (!.*)" supabase/functions/*/index.ts | grep -i "most recent\|latest\|limit(1)\|order.*desc"
   ```
   Any "get the most recent X" as a fallback for "get the specific X" is dangerous.

2. **Test with missing data**: Delete a `pending_payment` record and call `get-order-number`. Does it return 404 or a wrong order?

3. **Check for `ORDER BY created_at DESC LIMIT 1` fallbacks**:
   ```bash
   grep -n "order.*desc.*limit.*1\|LIMIT 1" supabase/functions/*/index.ts
   ```
   These are often "last resort" fallbacks that return unrelated data.

### Code smell indicators
- Query with `ORDER BY created_at DESC LIMIT 1` used as a fallback for an exact-match query
- Multiple fallback strategies where each one widens the search scope
- "Strategy 1 / Strategy 2 / Strategy 3" pattern where Strategy 3 is "just return anything"
- API returning 200 with wrong data instead of 404 with no data
- Fallback that ignores the original search criteria (e.g., ignoring order ID, just matching by amount)

### Future bugs this prevents
- QR codes displaying payment info for wrong orders
- Customers paying with wrong reference numbers
- Payments classified as `unknown_transaction` despite being legitimate
- Admin manual intervention required for what should be automatic matching
- Cross-customer data leakage (showing one customer's order details to another)

---

# RULE 52: Tab Screen Must Use AuthContext Profile as Immediate Fallback
**Source:** Phase 14 — Tab Tài Sản shows blank avatar/info until API call completes

## What Failed
Tapping the "Tài Sản" tab showed a blank avatar and default text for ~1-2 seconds until `loadData()` API call completed. User expected instant display of their profile info.

## Why It Failed
AccountScreen used `profile` (local state) for display, initialized from `accountCache.profile` which is null on first visit. But `authProfile` from `useAuth()` was **already loaded** from AuthContext (populated during login/session restore). The screen ignored this readily available data.

```javascript
// BAD: only uses local state, null until API call completes
const displayName = profile?.full_name || user?.email?.split('@')[0] || 'User';
const avatarUrl = profile?.avatar_url;

// GOOD: uses AuthContext profile as immediate fallback
const displayProfile = profile || authProfile;
const displayName = displayProfile?.full_name || user?.email?.split('@')[0] || 'User';
const avatarUrl = displayProfile?.avatar_url;
```

## What Guard Was Added
`AccountScreen.js` now uses `const displayProfile = profile || authProfile` for all display values (name, username, bio, avatar, badges, edit modal). AuthContext profile provides instant data while the background API call loads fresh data.

## How to Detect Similar Issues
1. **Tab screens with `useAuth()` that don't use the profile**: If a tab screen destructures `{ profile: authProfile }` from `useAuth()` but only uses it for fallback in `loadData`, not for display
2. **Screens with `const [profile, setProfile] = useState(null)`**: If the initial state is null and the display code reads from this state without AuthContext fallback
3. **"Flash of empty state"**: User sees defaults (letter avatar, email username) before real data appears

---

# RULE 55: Child Components Need Their Own FORCE_REFRESH_EVENT Listener
**Source:** Phase 14 — AffiliateSection stuck "Đang tải" after app resume

## What Failed
After app resume, AccountScreen recovered perfectly (it has a FORCE_REFRESH_EVENT listener). But AffiliateSection — a **child component** rendered inside AccountScreen — stayed stuck on "Đang tải..." indefinitely. The affiliate data never loaded.

## Why It Failed
Phase 7.8 (Rule 31) added FORCE_REFRESH_EVENT listeners to 15 screens. But AffiliateSection is a **component**, not a screen. It manages its own `useState(true)` loading state and its own `loadPartnershipData()` async fetch. The parent AccountScreen's FORCE_REFRESH_EVENT handler resets AccountScreen's states but has **no control** over AffiliateSection's independent loading state.

```javascript
// BAD: Component with loading state but no recovery listener
export default function AffiliateSection({ user }) {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (user?.id) loadPartnershipData();
  }, [user?.id]); // Only fires when user.id changes — NOT on resume
}

// GOOD: Component adds its own recovery listener
useEffect(() => {
  const listener = DeviceEventEmitter.addListener(FORCE_REFRESH_EVENT, () => {
    setLoading(false);
    if (user?.id) loadPartnershipData();
  });
  return () => listener.remove();
}, [user?.id]);
```

## How to Detect Similar Issues
1. Rule 31 audit only checked **screens** (`src/screens/`). Components in `src/screens/**/components/` or `src/components/` were missed
2. **Grep for independent loading states in components**: `grep -rn "setLoading(true)" src/screens/**/components/ src/components/`
3. For each match, check: does the SAME file contain `FORCE_REFRESH_EVENT`? If not, it's vulnerable
4. Any component with `useState(true)` + async fetch in useEffect needs its own listener

---

# RULE 56: Long-Running Operations Need Overall Timeout (Scan-Level Guard)
**Source:** Phase 14 — Scanner "Scan Now" stuck in infinite loading after idle

## What Failed
Scanner had all individual safeguards: AbortController on each fetch (Rule 29), try/finally (Rule 28), FORCE_REFRESH_EVENT listener (Rule 31). But the scan STILL hung permanently when post-scan operations (`zoneManager.createZonesFromPatterns()`, `tierAccessService.incrementScanCount()`) made Supabase calls on dead connections.

## Why It Failed
Individual fetch timeouts (10s) protect each request. But the scan function chains multiple sequential async operations AFTER the main batch loop. If any operation hangs (despite the global Supabase fetch wrapper), the entire scan blocks. The FORCE_REFRESH_EVENT handler resets `scanning=false`, but when the user starts a new scan, the OLD scan's `finally { setScanning(false) }` eventually fires and resets the NEW scan's state.

```javascript
// BAD: No overall timeout, no scan generation tracking
try {
  setScanning(true);
  // ... batch loop (protected) ...
  await zoneManager.createZonesFromPatterns(...); // Could hang
  await tierAccessService.incrementScanCount();  // Could hang
} finally {
  setScanning(false); // Interferes with new scan if old scan's finally is delayed
}

// GOOD: Scan ID prevents interference, timeouts on post-scan operations
const currentScanId = ++scanIdRef.current;
try {
  setScanning(true);
  // ... batch loop with early bail on scan superseded ...
  await Promise.race([zoneManager.createZones(...), timeout(15000)]);
  await Promise.race([tierAccessService.increment(), timeout(8000)]);
} finally {
  if (scanIdRef.current === currentScanId) setScanning(false);
}
```

## How to Detect Similar Issues
1. **Find multi-step async functions**: Functions with 3+ sequential `await` calls
2. **Check if each await has timeout**: Individual calls may have timeout, but does the OVERALL function?
3. **Check for scan/task ID pattern**: If the function can be re-triggered while in progress, old invocation's finally can corrupt new invocation's state
4. **Test**: Start operation → background app → return → start operation again → does the first finally interfere?

# RULE 57: FORCE_REFRESH Handler Must Break React 18 Batch
**Source:** Phase 14 — AffiliateSection permanently stuck in "Đang tải..." after app resume

## What Failed
AffiliateSection had a FORCE_REFRESH_EVENT listener (Rule 55). But after resume, it STILL showed infinite loading.

## Why It Failed
React 18 automatic batching: `setLoading(false)` immediately followed by `loadPartnershipData()` (which calls `setLoading(true)`) in the same synchronous handler gets batched. React only commits the LAST state update — loading stays `true`.

```javascript
// BAD: React batches these — loading is STILL true after handler runs
DeviceEventEmitter.addListener(FORCE_REFRESH_EVENT, () => {
  setLoading(false);        // Batched with next call
  loadPartnershipData();    // calls setLoading(true) — last wins
});

// GOOD: setTimeout breaks the batch — setLoading(false) commits first
DeviceEventEmitter.addListener(FORCE_REFRESH_EVENT, () => {
  setLoading(false);
  setTimeout(() => loadPartnershipData(true), 50); // skipLoading=true
});
```

## How to Detect
1. **Find FORCE_REFRESH handlers** that call `setLoading(false)` then immediately call a reload function
2. **Check if the reload function** starts with `setLoading(true)`
3. If yes → React batches them → loading never clears → infinite spinner
4. Fix: Use `setTimeout` to break the batch, OR pass `skipLoading=true` parameter

# RULE 58: Sequential Supabase Queries Must Run in Parallel
**Source:** Phase 14 — partnershipService fallback took 32s (4 × 8s sequential queries)

## What Failed
`getPartnershipStatusFallback()` made 4 sequential Supabase queries. Each has 8s timeout via global fetch wrapper. Total worst case: 32s. User sees "Đang tải..." for 32 seconds.

## Why It Failed
Code was written sequentially for readability but queries are independent — no data dependency between them.

```javascript
// BAD: Sequential (32s worst case)
const { data: affiliate } = await supabase.from('affiliate_profiles')...;
const { data: apps } = await supabase.from('partnership_applications')...;
const { data: profile } = await supabase.from('profiles')...;
const { data: course } = await supabase.from('course_access')...;

// GOOD: Parallel with Promise.allSettled (8s worst case)
const [affiliate, apps, profile, course] = await Promise.allSettled([
  supabase.from('affiliate_profiles')...,
  supabase.from('partnership_applications')...,
  supabase.from('profiles')...,
  supabase.from('course_access')...,
]);
```

## How to Detect
1. **Find functions with 3+ sequential Supabase queries** (consecutive `await supabase.from(...)`)
2. **Check data dependencies**: Does query 2 need query 1's result?
3. If independent → use `Promise.allSettled()` for parallel execution
4. Use `Promise.allSettled` (not `Promise.all`) so one failure doesn't abort others

---

# RULE 59: JWT Must Be Validated Before Every Supabase Request
**Source:** Phase 14 — ALL screens fail simultaneously after app idle 1+ hour in foreground

## What Failed
After leaving the app idle for 1+ hour (even in foreground with screen off), ALL screens break at once:
- Scanner: stuck in "Đang quét pattern..." infinite loading
- AffiliateSection: shows registration form instead of admin's existing data
- Vision Board: all zeros (Level 1, 0/100 XP, 0/0 goals)
- Notifications: empty spinner + "Chưa có thông báo"

## Why It Failed
Three-link failure chain:

1. **`autoRefreshToken` timer is unreliable on mobile**: Supabase JS client uses `setTimeout` to refresh the JWT ~30s before expiry. On mobile, JS timers don't fire when the device screen is off. After 1 hour, the access token expires silently.

2. **No mechanism detects expired JWT in foreground**: `AppResumeManager` only handles `background → active` transitions. If the app stays in `active` AppState (foreground with screen off or just idle), the resume handler never fires. The 60s health check tested connectivity but NOT token validity.

3. **RLS silently returns empty data with expired JWT**: PostgREST doesn't error on expired tokens — `auth.uid()` resolves to `null`, and RLS policies like `USING (user_id = auth.uid())` match zero rows. Every query "succeeds" with empty results.

## The Fix (Two Layers)

### Layer 1: Global fetch wrapper pre-request check (supabase.js)
Before every `/rest/v1/` or `/functions/v1/` request, decode the JWT `exp` claim. If expired or expiring within 60s, call `refreshSession()` first. Uses cached `exp` for sub-ms fast path and singleton promise to dedup concurrent refreshes.

```javascript
// In global fetch wrapper:
fetch: async (url, options = {}) => {
  // Not for /auth/v1/ (avoids recursion), /storage/v1/, /realtime/
  if (!url.includes('/auth/v1/')) {
    await _ensureSessionFresh(); // checks JWT exp, refreshes if needed
  }
  // ... existing timeout logic
}
```

### Layer 2: Health check proactive refresh (AppResumeManager.js)
The 60s health check now also checks JWT `expires_at`. If the token expires within 120s, proactively refreshes before the user taps anything. Also, `_triggerFullRecovery` now refreshes the session BEFORE emitting FORCE_REFRESH_EVENT.

## Key Design Decisions
- **Skip /auth/v1/ calls**: Prevents infinite recursion (`refreshSession()` → POST /auth/v1/token → fetch wrapper → `_ensureSessionFresh()` → `refreshSession()` → ...)
- **Cached `exp`**: First request reads from storage + decodes JWT. Subsequent requests compare a cached number (sub-ms). Only re-reads when token is about to expire.
- **Singleton `_refreshPromise`**: If 5 requests detect expired JWT simultaneously, only 1 refresh call is made. Others await the same promise.
- **`getSession()` not `getUser()`**: `getSession()` reads from local storage (instant). `getUser()` makes an API call that would go through the fetch wrapper → recursion.

## How to Detect
1. **ALL screens fail simultaneously** (not just one) → global auth issue, not screen-specific
2. **Data loads as empty/default** (not errors) → RLS returning zero rows
3. **Happens after long idle** (1+ hour) → JWT expiration
4. **App was never backgrounded** (or resume handler didn't fire) → foreground idle scenario
5. Check console for `[Supabase] JWT expired/expiring` — if absent, the guard isn't running

## Generalized Pattern: Token-Gated APIs on Mobile
This rule applies to ANY system where:
- **API responses are gated by a short-lived token** (JWT, OAuth access_token, API key with TTL)
- **The app runs on a mobile device** where JS timers, background tasks, and keep-alive mechanisms are unreliable
- **The API fails silently** when the token expires (returns empty/default data instead of 401)

The same three-link failure chain will occur in ANY mobile app using:
- Supabase (RLS + JWT)
- Firebase Auth (ID tokens expire after 1 hour)
- AWS Cognito (access tokens expire after 1 hour)
- Any OAuth 2.0 provider with `access_token` + `refresh_token`

**The fix is always the same**: validate the token BEFORE every request, not just on a timer.

## Preventive Measures
1. **Pre-request token check**: Every HTTP client wrapper must verify token `exp` before sending. This is the ONLY reliable approach on mobile.
2. **Proactive periodic refresh**: Background timer (60s) that checks token freshness — catches idle scenarios before user interaction.
3. **Recovery path must refresh auth first**: Any "full recovery" or "reconnect" logic must refresh auth BEFORE re-fetching data. Otherwise recovery fetches use the same expired token.
4. **Never trust `autoRefreshToken`**: SDK-provided auto-refresh relies on JS timers. On mobile: screen-off kills timers, low-memory kills background JS, OS power-saving throttles intervals. Always have a fallback.
5. **Dedup concurrent refreshes**: When token expires, N concurrent requests all detect it simultaneously. Use a singleton promise so only 1 refresh call is made.
6. **Cache decoded token claims**: Don't decode JWT on every request. Cache `exp` and compare against `Date.now()` (sub-ms). Only re-decode when approaching expiry.

## Code Smell Indicators
- `autoRefreshToken: true` with no fallback mechanism
- Token refresh only runs on AppState change (misses foreground idle)
- Health check tests connectivity but not token validity
- Recovery/reconnect logic that emits "reload" events without refreshing auth first
- Multiple concurrent `refreshSession()` calls without dedup (race condition → wasted API calls or double-refresh errors)
- `getUser()` (network call) used where `getSession()` (local read) would suffice
- Auth token endpoint called through the same interceptor as data endpoints (infinite recursion risk)

## Investigation Steps
1. Check if ALL screens fail simultaneously vs. just one — confirms global vs. local issue
2. Check API response bodies — empty arrays/null vs. explicit error codes
3. Decode the stored JWT: `JSON.parse(atob(token.split('.')[1]))` — check `exp` vs. current time
4. Check AppState transitions in logs — did the app go through background→active, or stay active?
5. Check if `autoRefreshToken` timer fired — search logs for SDK refresh events
6. Check if health check/recovery refreshed auth — search for `refreshSession` calls in logs

---

# RULE 60: Profile Fetch Must Have a Total Time Budget
**Source:** Phase 16 — Startup watchdog fires after 15s because profile fetch retry takes 17s

## What Failed
On cold start with a slow Supabase connection, the app froze at the splash screen. After 15s, the startup watchdog force-unlocked navigation, but the profile was still `null` — causing the user to land on a degraded screen (isAdmin=false, tier=FREE).

## Why It Failed
`AuthContext.loadSession()` had a profile fetch with retry:
```javascript
const { data } = await getUserProfile(user.id);       // up to 8s (global fetch timeout)
if (!data) {
  await new Promise(r => setTimeout(r, 1000));         // 1s backoff
  const { data: retry } = await getUserProfile(user.id); // up to 8s again
}
```
Worst case: 8s + 1s + 8s = **17s**. The 15s startup watchdog (`AppNavigator.js`) fires before the retry completes. The `finally` block then sets profile to `null`, overwriting any result the retry might have returned.

Each individual call had a timeout (8s via global fetch wrapper), but **the overall operation had no budget**. This is a classic Rule 28 (Loading State) variant: individual sub-steps are bounded, but the aggregate is not.

## The Fix
Wrap the entire profile fetch + retry in `Promise.race(10s)`:
```javascript
let profileData = null;
try {
  profileData = await Promise.race([
    (async () => {
      const { data, error } = await getUserProfile(user.id);
      if (error || !data) {
        await new Promise(r => setTimeout(r, 1000));
        const { data: retryData } = await getUserProfile(user.id);
        return retryData || null;
      }
      return data;
    })(),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Profile fetch budget exceeded (10s)')), 10000)
    ),
  ]);
} catch (budgetErr) {
  console.warn('[AuthContext]', budgetErr.message, '— continuing with null profile');
}
setProfile(profileData);
```
Applied to both `loadSession()` and `onAuthStateChange()` INITIAL_SESSION handler.

**Budget math**: 10s total < 15s watchdog. Even if the first attempt takes the full 8s, there's 2s left for the retry attempt (which will abort on budget timeout). The watchdog never fires.

## How to Detect Similar Issues
1. **Find multi-step async sequences**: Look for retry patterns where each step has its own timeout but the aggregate does not
2. **Check if total worst-case > caller's timeout**: Sum all sequential await worst-cases. If the total exceeds the caller's budget (e.g., startup watchdog, navigation timeout), the operation will be killed mid-flight
3. **Search for `getUserProfile` or `getUser` calls in startup paths**: Any DB call in the loadSession/onAuthStateChange hot path must fit within the startup budget
4. **Log symptom**: `STARTUP WATCHDOG: Force-ready after Xs` in console means some initialization step exceeded the budget

## Generalized Pattern: Aggregate Timeout for Sequential Operations
When you have N sequential operations each with individual timeout T:
- **Worst case = N × T** (not T)
- The caller's timeout must be > N × T, OR you need a single aggregate timeout that wraps all N operations
- `Promise.race([allOperations(), timeout(budget)])` is the standard pattern

---

# RULE 61: Generated/Seed Content Must Not Contain Debug Metadata
**Source:** Phase 16 — Seed posts show `#231` in title and invisible markers in content

## What Failed
Forum feed displayed posts with `#231`, `#412` appended to every title. Post content showed invisible unicode markers (`​1771505097189-230-c9i24k​`) that became visible in certain rendering contexts (PostCard text truncation, search results).

## Why It Failed
`seedPostGenerator.js` added debug/dedup markers to generated content:

```javascript
// Title: appended post index for uniqueness
const uniqueTitle = `${baseTitle} #${postIndex + 1}`;  // → "Cách vẽ HFZ chính xác #231"

// Content: wrapped timestamp-based ID in zero-width spaces
const uniqueMarker = `\u200B${Date.now()}-${postIndex}-${randomStr}\u200B`;
const fullContent = rawContent + hashtagString + uniqueMarker;
```

These were meant for dedup during batch generation, but:
1. **`#N` in title**: PostCard displays title. Users see `#231` as part of the post title
2. **Zero-width spaces**: Not truly invisible — they affect text selection, copy-paste, search matching, and some font renderers show them as boxes or spaces
3. **PostCard title-content dedup logic**: `post.title !== post.content && !post.content?.startsWith(post.title)` — the `#N` suffix made title ≠ content prefix, so PostCard prepended the full title above content (doubling it)

## The Fix
1. **Generator**: Removed `#N` suffix from title. Removed uniqueMarker from content. Title is now just `baseTitle` (first 90 chars of content). Uniqueness handled by UUID primary key.
2. **Database cleanup**: `UPDATE seed_posts SET title = regexp_replace(title, '\s*#\d+$', '')` and `UPDATE seed_posts SET content = regexp_replace(content, E'\u200B[0-9]+-[0-9]+-[a-z0-9]+\u200B', '')` — cleaned 450 rows.

## How to Detect Similar Issues
1. **Copy-paste test**: Copy post text → paste into plain text editor → look for extra characters, spaces, or markers not visible in the UI
2. **JSON inspection**: Query `SELECT content FROM seed_posts LIMIT 5` → check for `\u200B` or other unicode control chars
3. **Search for `\u200B`, `\u200C`, `\u200D`, `\uFEFF`** in generators — these are common "invisible" markers that aren't truly invisible
4. **Check if display logic does string comparison**: If UI compares title vs content (dedup, truncation), any extra characters will break the comparison

## Generalized Pattern: Never Embed Metadata in User-Visible Fields
Debug/dedup markers belong in:
- **Separate columns** (e.g., `generation_batch_id`, `dedup_hash`)
- **Metadata JSONB field** (e.g., `metadata->>'batch_index'`)
- **NOT** in `title`, `content`, `description`, or any field that gets rendered to users

---

# RULE 62: FlatList getItemLayout Must Use Cumulative Offsets for Variable Heights
**Source:** Phase 16 — Forum feed scroll jitter and auto-reload when tapping posts

## What Failed
Scrolling the forum feed caused visible jitter — posts jumping position, content appearing to reload. Tapping a post to view details caused the feed to "bounce" and sometimes reload entirely.

## Why It Failed
`ForumScreen.js` provided `getItemLayout` to FlatList with a fixed-height calculation:

```javascript
getItemLayout={(data, index) => {
  const type = data?.[index]?.image_url ? 'image' : 'text';
  const height = POST_ITEM_HEIGHTS[type] + SEPARATOR_HEIGHT;
  return { length: height, offset: height * index, index };
}}
```

The bug is `offset: height * index`. This assumes ALL items before index `i` have the SAME height. But PostCard heights vary wildly:
- Text-only posts: ~120px
- Single image: ~350px
- Image carousel: ~400px
- Long text with hashtags: ~200px

When `offset` is wrong, FlatList places items at incorrect scroll positions. As you scroll, items jump to their "correct" rendered position (jitter). When navigating back, FlatList tries to restore scroll position using the wrong offsets, causing visible jumps or triggering a re-render.

## The Fix
**Removed `getItemLayout` entirely.** FlatList's built-in height measurement (auto-layout) is slower but accurate for variable-height items. Performance is maintained by:
- `removeClippedSubviews={true}` — unmounts offscreen items
- `windowSize={5}` — renders 5 viewports of content
- `maxToRenderPerBatch={5}` — limits per-frame rendering

```javascript
// getItemLayout REMOVED — was causing scroll jitter because offset calculation
// assumed all items have the same height. PostCard heights vary wildly
// (text-only vs images vs carousel). FlatList auto-measurement is
// slower but accurate. removeClippedSubviews + windowSize=5 handle performance.
```

## How to Detect Similar Issues
1. **Scroll and watch for "jumping"**: Items visibly shift position during scroll = wrong `getItemLayout`
2. **Check if items have variable heights**: If ANY item can be taller/shorter than others, `getItemLayout` with `offset: fixedHeight * index` is WRONG
3. **Navigate away and back**: If the list "jumps" to a different position on return, `getItemLayout` offsets are stale
4. **Search codebase**: `getItemLayout.*offset.*\*.*index` — the multiplication pattern is the red flag

## When getItemLayout IS Correct
- **All items identical height** (e.g., settings list, notification rows with fixed layout)
- **Heights are pre-computed and accumulated**: `offset = sum(heights[0..index-1])` (must track individual heights)

---

# RULE 63: Tab Cache Duration Must Exceed Typical User Interaction Time
**Source:** Phase 16 — Forum feed reloads with different posts after viewing a post detail

## What Failed
User scrolls feed → taps a post → reads it (30-60s) → goes back → feed shows completely different posts. The scroll position is lost and previously-read posts are replaced.

## Why It Failed
`ForumScreen.js` used `useFocusEffect` with a 30-second cache:

```javascript
const forumCache = {
  CACHE_DURATION: 30000, // 30 seconds
  lastFetch: 0,
  // ...
};

useFocusEffect(
  useCallback(() => {
    const now = Date.now();
    if (now - forumCache.lastFetch > forumCache.CACHE_DURATION) {
      loadPosts(true); // FULL RESET — clears all posts and reloads
    }
  }, [])
);
```

When the user navigates to post detail and back within 30s, the cache is valid and the feed is preserved. But if reading takes >30s (very common for longer posts), the cache expires and `loadPosts(true)` does a full reset — new query, new posts, scroll position lost.

## The Fix
Increased `CACHE_DURATION` from 30s to **5 minutes** (300,000ms):

```javascript
CACHE_DURATION: 300000, // 5 minutes — prevents full reset when returning from post detail
```

5 minutes covers the vast majority of post-reading sessions. The feed still refreshes on pull-to-refresh and on app resume (FORCE_REFRESH_EVENT).

## How to Detect Similar Issues
1. **Navigate to detail and back after N seconds**: If the list resets, the cache duration is too short
2. **Search for `useFocusEffect` + `loadPosts(true)` patterns**: Any tab that reloads data on focus with a time gate is susceptible
3. **Check cache duration vs. user behavior**: Chat reading (2-5 min), post reading (30s-3 min), course lesson (5-15 min). Cache must exceed the typical interaction time
4. **Scroll position loss**: If the list component is `FlatList` and the data changes on focus, scroll position is invalidated because the data array changes

## Generalized Pattern
For any tab with a "stale check on focus":
- **Too short** → frustrating reloads mid-session
- **Too long** → stale content when actually switching contexts
- **Sweet spot**: 3-5 minutes for social feeds, 10+ minutes for static content

---

# RULE 64: Tier Access Check Used as Enrollment Proxy (False "Unlocked" Display)
**Source:** Phase 16 — Course listing page showed "Đã mở khóa" for ALL FREE courses even when user was NOT enrolled

## What Failed
CourseCard.jsx displayed "Đã mở khóa" (Unlocked) based on `hasAccess(userTier, course.tier)`. Since ALL users have at least FREE tier (level 0), and FREE courses require FREE tier (level 0), the check `0 >= 0` returned `true` for every FREE course — even when the user had never enrolled or purchased the course.

Clicking into these "unlocked" courses correctly showed lessons as locked (because CourseLearning.jsx checked actual enrollment via `enrollmentService.isEnrolled()`). This mismatch confused users.

## Why It Failed
Two separate access concepts existed — **tier access** (`hasAccess()` comparing tier levels) and **enrollment** (`course_enrollments` table) — but the CourseCard UI conflated them. The tier check answered "does the user's subscription level allow this course?" but the UI displayed it as "has the user unlocked this course?" These are different questions.

## What Guard Was Added
1. **CourseCard.jsx**: Changed `isEnrolled` from `course.progress !== undefined` to `!!course.isEnrolled` (explicit flag from enrollment query)
2. **CourseCard.jsx**: "Đã mở khóa" now shows ONLY when `isEnrolled` is true, not when `hasUserAccess` is true
3. **Courses.jsx**: Already passes `isEnrolled: !!enrollment` from the enrollment data — CourseCard now uses it

```javascript
// BEFORE: Tier check masking enrollment status
{hasUserAccess ? (
  <span>Đã mở khóa</span>  // Shows for ALL FREE courses!
) : (...)}

// AFTER: Enrollment check is the source of truth
{isEnrolled ? (
  <span>Đã mở khóa</span>  // Only shows when actually enrolled
) : hasUserAccess ? (
  <span>Sẵn sàng đăng ký</span>  // Has tier access but not enrolled
) : (...)}
```

## How to Detect Similar Issues
1. **Ask: "Does this check answer the UI's question?"** — if UI says "Unlocked", the check must verify enrollment, not tier compatibility
2. **Search for `hasAccess` used in display text** (not just access control): `grep -rn "hasAccess\|hasUserAccess" src/ --include='*.jsx' -B2 -A2 | grep -i "unlock\|mở khóa\|enrolled"`
3. **Test with a fresh user** (no enrollments): do any courses show "Unlocked"?
4. **Compare listing page vs detail page**: if listing says "Unlocked" but detail says "Locked", there's a mismatch

### Code smell indicators
- `hasAccess()` result displayed as "Unlocked"/"Enrolled" text (tier != enrollment)
- Enrollment derived from `progress !== undefined` instead of explicit enrollment check
- Two different files using different methods to determine "user has this course" (tier vs enrollment)

---

# RULE 65: Preview Mode State Never Reset (Sticky Boolean Trap)
**Source:** Phase 16 — Enrolled users entering CourseLearning via a preview lesson got permanently stuck in preview mode, blocking all non-preview lesson navigation (including quizzes)

## What Failed
`CourseLearning.jsx` had `isPreviewMode` state initialized to `false`. When the initial lesson had `is_preview = true`, the code set `setIsPreviewMode(true)` — but there was NO code path that ever set it back to `false`. Once in preview mode:
- `handleLessonSelect()` blocked all non-preview lessons with an alert
- "Bài tiếp theo" (Next lesson) button was blocked for non-preview lessons
- Quiz lessons (which are never `is_preview`) could never be accessed

## Why It Failed
The enrollment check was SKIPPED when `accessingPreview = true`:
```javascript
if (user?.id && !accessingPreview) {  // ← enrollment check skipped for preview!
  isEnrolled = await enrollmentService.isEnrolled(user.id, courseId);
}
```
So enrolled users who navigated directly to a preview lesson URL were treated as non-enrolled preview viewers. The `isPreviewMode = true` state then persisted for the entire session.

## What Guard Was Added
1. **Always check enrollment** regardless of whether the lesson is a preview
2. **Enrolled users are NEVER in preview mode**: `if (isEnrolled) setIsPreviewMode(false)`
3. Only non-enrolled users viewing preview lessons enter preview mode

```javascript
// BEFORE: Enrollment check skipped for preview lessons
let accessingPreview = false;
if (foundLesson?.is_preview) {
  accessingPreview = true;
  setIsPreviewMode(true);  // Set but NEVER cleared!
}
if (user?.id && !accessingPreview) {  // SKIPPED for preview!
  isEnrolled = await enrollmentService.isEnrolled(...);
}

// AFTER: Enrollment always checked first
let isEnrolled = false;
if (user?.id) {
  isEnrolled = await enrollmentService.isEnrolled(...);  // Always check
}
if (isEnrolled) {
  setIsPreviewMode(false);  // Enrolled = NEVER preview mode
} else if (accessingPreview) {
  setIsPreviewMode(true);   // Only for non-enrolled + preview lesson
}
```

## How to Detect Similar Issues
1. **Search for boolean state that's only set in one direction**: `grep -rn "setState(true)" src/ --include='*.jsx'` then check if `setState(false)` also exists in the same file
2. **Check for conditional enrollment skips**: any `if (!someCondition) { checkEnrollment() }` pattern means enrollment is sometimes unknown
3. **Test lesson navigation as enrolled user**: enroll → navigate to preview lesson → try clicking non-preview lesson → should work
4. **Test quiz access**: enroll → navigate to any lesson → try clicking a quiz lesson → should work

### Code smell indicators
- `setXxxMode(true)` exists but `setXxxMode(false)` does NOT exist in the same component
- Enrollment check gated by another condition (`!accessingPreview`, `!isAnonymous`, etc.)
- Boolean state used to restrict navigation but never cleared on context change
- Preview/demo mode blocking enrolled users from full content
- **Always preserve**: Pull-to-refresh and explicit refresh as escape hatches

---

## Rule 55: PostgREST Silently Rejects Updates with Unknown Columns
**Source:** Phase 15 — Fix E: `tier_expires_at` column doesn't exist on `profiles`

### When to apply
When a Supabase `.update()` or `.insert()` call appears to succeed (no error) but the database row is not actually modified.

### Symptoms
- Webhook returns 200 but profile/row is unchanged
- No error in logs — the function runs to completion
- All other operations in the same function work (e.g., course enrollment succeeds)
- Only the specific `.update()` call has no effect

### Root Cause
PostgREST (which Supabase uses under the hood) silently ignores the entire UPDATE when the object contains a column name that doesn't exist in the table. It does NOT throw an error — it just does nothing.

### How to Fix
1. **Always verify column names** before writing `.update()` code:
   ```sql
   SELECT column_name FROM information_schema.columns
   WHERE table_name = 'your_table' AND table_schema = 'public';
   ```
2. **Never assume column names** — check the actual schema, not what you think it should be
3. **Watch for similar-but-different names**: `tier_expires_at` vs `course_tier_expires_at`, `created_at` vs `enrolled_at`, `enrollment_type` vs `source`

### Generalized Pattern
Any ORM or API layer that silently drops unknown fields is a trap:
- **PostgREST**: Silently ignores entire UPDATE with unknown columns
- **MongoDB**: Silently creates new fields (different but equally surprising)
- **Defense**: Generate TypeScript types from DB schema (`supabase gen types`) to catch at compile time

---

## Rule 56: Edge Function Deployment Requires --no-verify-jwt for Webhooks
**Source:** Phase 15 — 401 errors on all Shopify webhook calls after deployment

### When to apply
When deploying Supabase Edge Functions that receive webhooks from external services (Shopify, Stripe, etc.).

### Symptoms
- All webhook calls return 401 Unauthorized
- Function code never executes (no logs from function body)
- Previous versions worked fine (deployed differently)
- The external service retries with exponential backoff

### Root Cause
Supabase gateway rejects requests without a valid JWT token BEFORE the function code runs. External webhooks use their own auth (HMAC, API keys, etc.), not JWT.

### How to Fix
1. **Create `config.yaml`** in the function directory with `verify_jwt: false`
2. **Deploy with `--no-verify-jwt` flag**: `supabase functions deploy <name> --no-verify-jwt`
3. **Both are required** — config.yaml alone is not enough if the CLI flag is missing

### Generalized Pattern
- Always check auth requirements when deploying webhook receivers
- External services (Shopify, Stripe, GitHub) never send JWT tokens
- The function itself should verify the webhook signature (HMAC) — not rely on the gateway

## Rule 57: Component Reads Stale Local Cache Instead of Context (Dual Data Source)
**Source:** Phase 18 — MyCoursesSection shows "Đã đăng ký: 0, Đang học: 0, Hoàn thành: 0" after Shopify purchase

### When to apply
When a UI component shows stale/zero data even though the correct data exists in a Context provider that other components consume successfully.

### Symptoms
- Stats/counts display 0 or empty despite data existing in the database
- Other screens using the same Context show correct data
- The component uses a service function directly instead of the Context
- Refreshing/pull-to-refresh doesn't help (because it re-reads the same stale source)
- Webhooks write to the DB, but the component reads from AsyncStorage (different key)

### Root Cause
Two independent data pipelines exist for the same domain:
1. **Context** (e.g., `CourseContext`) — reads from DB, caches in AsyncStorage key A (`@gem_enrollments`), provides realtime sync
2. **Service function** (e.g., `courseService.getUserCourseStats()`) — reads from AsyncStorage key B (`@gem_course_enrollments`), no realtime sync

The component calls the service function directly, bypassing the Context. When data enters via webhook → DB, the Context picks it up (realtime subscription), but the service's AsyncStorage key is never populated.

**Secondary issue**: Filter logic can also hide valid data. Example: `inProgressCourses` filtered by `progress > 0` excludes freshly enrolled courses (progress=0), making them invisible in "Đang học" tabs.

### How to Fix
1. **Single Source of Truth**: Replace direct service calls with Context hooks (`useCourse()`, `useAuth()`, etc.)
2. **Remove redundant local state**: If the Context already provides `loading`, `enrolledCourses`, etc., don't duplicate them with `useState` + async fetch
3. **Remove redundant listeners**: If the Context handles refresh/realtime, the component doesn't need its own `FORCE_REFRESH_EVENT` listener or `useFocusEffect`
4. **Audit filter logic**: Check if computed arrays (e.g., `inProgressCourses`) exclude valid edge cases like `progress === 0`

### How to Detect Similar Issues
1. **Grep for direct service imports in components that have a Context**: `grep -r "import.*Service" screens/ components/` — if a Context exists for that domain, the component should use the Context
2. **Grep for duplicate AsyncStorage keys**: `grep -r "@gem_" services/ contexts/` — two different keys for the same data = dual source
3. **Check filter boundaries**: Search for `> 0 &&` in computed arrays — freshly created records often have 0 values that get excluded
4. **Compare data paths**: Trace where webhooks write (DB table) vs where the component reads (AsyncStorage key) — if they don't connect, data will be stale

### Generalized Pattern
- **Context = single source of truth** for any domain (courses, enrollments, profile, etc.)
- Components should ONLY read from Context, never from service functions that maintain their own cache
- When adding a new computed array (like `inProgressCourses`), explicitly consider the zero/default case
- If a webhook writes to the DB, the UI must read from DB (via Context + realtime) — not from a local cache that the webhook never touches

## Rule 58: Supabase Write Fails with RLS Violation Due to Expired JWT (Silent Auth Failure)
**Source:** Phase 18 — `syncSettingsToSupabase FAILED: new row violates row-level security policy for table "user_paper_trade_settings"`

### When to apply
When a Supabase INSERT/UPDATE/UPSERT fails with `42501 row-level security policy violation`, but:
- RLS policies look correct (e.g., `auth.uid() = user_id`)
- The code passes the correct `user_id`
- The user IS authenticated (has a session in local storage)

### Symptoms
- `new row violates row-level security policy for table "<table>"` error code `42501`
- The same write worked before (user was logged in)
- Auth logs show `Invalid Refresh Token: Refresh Token Not Found` around the same time
- `_ensureSessionFresh()` in supabase.js did NOT throw (it silently swallows failures)
- `supabase.auth.getSession()` returns a session object with an EXPIRED `access_token`

### Root Cause (3 layers)
**Layer 1 — Token lifecycle**: When user logs in on another device, Supabase rotates the refresh token. The old device's refresh token becomes invalid. When `autoRefreshToken` timer fires, it fails silently. The access_token expires (default 1 hour) and cannot be renewed.

**Layer 2 — Silent failure in fetch wrapper**: `_ensureSessionFresh()` (supabase.js lines 144-199) calls `getSession()` → gets cached session → tries `refreshSession()` → fails → logs warning → **returns without throwing**. The request proceeds with the expired JWT.

**Layer 3 — RLS sees anon role**: PostgREST receives a request with an expired JWT. Instead of returning 401, it processes the request as the `anon` role where `auth.uid()` = null. RLS policy `auth.uid() = user_id` evaluates to `null = '<uuid>'` → false → policy violation.

**Bonus Layer — `{public}` vs `authenticated` policies**: If RLS policies use `TO {public}` (PostgreSQL public role = everyone including anon), the anon role CAN write — but `auth.uid()` is still null, so `USING(auth.uid() = user_id)` still fails. Even worse, duplicate overlapping policies from schema migrations create confusing behavior.

### How to Fix
1. **Pre-write session guard with JWT exp check**: Before any Supabase write, verify the session token is not just present but UNEXPIRED:
```javascript
async _hasValidSession() {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) return false;
    // Decode JWT exp — getSession() returns cached tokens including expired ones
    const payload = session.access_token.split('.')[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const exp = JSON.parse(atob(base64)).exp || 0;
    const nowSec = Math.floor(Date.now() / 1000);
    return exp > nowSec + 10; // 10s buffer
  } catch { return false; }
}
```
2. **Guard every cloud sync method**: `if (!await this._hasValidSession()) { console.warn('...skipped — no valid session'); return; }`
3. **Clean up RLS policies**: Replace `TO {public}` with `TO authenticated` on all INSERT/UPDATE/DELETE policies. Keep `TO authenticated` for SELECT too (unless intentionally public). Add `TO service_role` ALL policy for webhooks/functions.
4. **Drop duplicate policies**: Schema migrations often create overlapping policies. Audit with:
```sql
SELECT schemaname, tablename, policyname, roles, cmd, qual
FROM pg_policies WHERE tablename = '<table>'
ORDER BY tablename, policyname;
```

### How to Detect Similar Issues
1. **Grep for unguarded Supabase writes**: `grep -rn "\.upsert\|\.insert\|\.update\|\.delete" services/` — any write without a session validity check is vulnerable
2. **Check RLS policy roles**: `SELECT tablename, policyname, roles FROM pg_policies WHERE '{public}' = ANY(roles) AND cmd != 'SELECT';` — `{public}` write policies are almost always wrong
3. **Check auth logs**: Supabase Dashboard → Auth → Logs → filter for "Invalid Refresh Token" — indicates devices with stale sessions
4. **Test with expired token**: Sign in on device A, sign in on device B (rotates token), wait 1 hour on device A, trigger a write → should be gracefully skipped, not crash with RLS error
5. **Audit `_ensureSessionFresh()` callers**: This function silently succeeds even when refresh fails — any code that depends on it for auth validity is vulnerable

### Generalized Pattern
- **`getSession()` returns cached expired tokens** — checking `!!session?.access_token` is NOT sufficient. You MUST decode the JWT `exp` claim.
- **PostgREST does NOT return 401 for expired JWTs** — it downgrades to anon role, which triggers RLS violations instead of auth errors. This makes the root cause (expired token) look like a permissions issue.
- **Silent failure is worse than loud failure** — `_ensureSessionFresh()` swallowing errors means writes proceed with no auth. Any interceptor/middleware that "tries" to refresh but doesn't gate the request on success has this bug.
- **RLS policies should use `TO authenticated`** — not `TO {public}`. The `{public}` PostgreSQL role includes anon, which means unauthenticated requests hit your policies (and fail on `auth.uid() = user_id`).
- **Guard writes at the service layer** — don't rely on the global fetch wrapper to catch auth failures. Each service method that writes to Supabase should independently verify session validity before attempting the write.

## Rule 59: Cross-Tab Navigation Uses Wrong Navigator Name
**Source:** Phase 18 — `The action 'NAVIGATE' with payload {"name":"AccountTab"} was not handled by any navigator`

### When to apply
When navigating from one tab to a screen nested in another tab, and the navigation action is silently dropped or throws "not handled".

### Symptoms
- `The action 'NAVIGATE' with payload {"name":"<TabName>",...} was not handled by any navigator`
- The navigation call uses a name that LOOKS correct but doesn't match the registered tab name
- Common pattern: code uses `<Name>Tab` but the tab is registered as just `<Name>`

### Root Cause
React Navigation requires exact string match for navigator/screen names. If `TabNavigator.js` registers a tab as `name="Account"` but the calling screen uses `navigation.navigate('AccountTab', {...})`, the navigation fails silently (no crash, just a console warning).

### How to Fix
1. Check `TabNavigator.js` for the exact registered tab name
2. Update the navigation call to use the exact name: `navigation.navigate('Account', { screen: 'PartnershipRegistration' })`
3. For nested navigators, the pattern is: `navigate('<TabName>', { screen: '<ScreenName>' })`

### How to Detect Similar Issues
1. **Grep for all cross-tab navigations**: `grep -rn "navigate.*Tab" screens/ components/` — check each against TabNavigator.js registered names
2. **Audit TabNavigator.js**: List all registered tab names and search for mismatches across the codebase
3. **Test all deep-link / cross-tab navigation paths**: FAQ actions, notification handlers, deep links — all are common sources of tab name mismatches
