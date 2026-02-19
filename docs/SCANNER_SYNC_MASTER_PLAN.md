# SCANNER SYNC MASTER PLAN (REVISED v2)
## Mobile App <-> Web Frontend Synchronization
> Created: 2026-02-19 | Revised v2: mobile-auditor + backend-auditor findings | Status: AWAITING APPROVAL

**Context**: Read this file at start of EVERY session for full understanding.
**Gap Analysis**: `docs/scanner-web-gap-analysis.md`

**Safety**:
- Backup branch: `backup/scanner-web-sync-20260219_041242`
- Stable tag: `pre-scanner-gap-analysis`

---

## KEY FINDING: Web is more complete than initially assessed

The web `patternDetection.js` (2181 lines) has **23 patterns** with 3-phase quality enhancement pipeline. The initial scan only found `frequencyPatterns.js` (6 patterns) which is a SEPARATE redundant utility.

**What actually needs fixing**:
1. Critical bugs (wrong DB table in 4 files, missing timeouts)
2. **Paper trading table divergence** (web trades get NO cron monitoring — CRITICAL)
3. Zone persistence (in-memory only)
4. Scan quota enforcement
5. 4 missing pattern detectors
6. Design token violations
7. Clean up redundant/mock code
8. `getUser()` → `getSession()` migration in scanner services

---

## Phase 1 -- CRITICAL BUG FIXES (Do First)

**Goal**: Fix bugs that cause wrong data, security gaps, or production failures

### 1A. Fix `from('users')` -> `from('profiles')` (CRITICAL)

**Files to modify** (4 total — backend-auditor found 4th):
- `frontend/src/components/RiskCalculator/RiskCalculator.jsx` (line ~93)
- `frontend/src/components/TradingJournal/TradingJournal.jsx` (line ~52)
- `frontend/src/components/Scanner/PatternScanner.jsx`
- `frontend/src/services/paperTrading.js` (line ~26)

**What**: Replace `supabase.from('users')` with `supabase.from('profiles')` in all **4** files.
Per Memory Rule #1: ALL app code MUST read `profiles` table.

**Risk**: CRITICAL (queries return NULL or wrong data)
**Effort**: 15 minutes
**Testing**: Verify tier loads correctly. Check telegram_id loads. Check paper trading user data loads.
**Rollback**: Single-line revert

### 1B. Add AbortController Timeouts (HIGH)

**Files to modify**:
- `frontend/src/components/RiskCalculator/RiskCalculator.jsx` -- Supabase queries
- `frontend/src/components/TradingJournal/TradingJournal.jsx` -- Supabase queries
- `frontend/src/pages/Dashboard/Scanner/v2/components/TradingChart.jsx` -- Binance fetch

**What**: Add AbortController with 10s timeout to all external API fetches.
Per Memory Rule #14: EVERY fetch() MUST have AbortController timeout.

**Edge cases**:
1. Timeout fires mid-response -> abort safely
2. Component unmounts before timeout -> cleanup controller
3. Multiple concurrent fetches -> separate controllers per fetch
4. Retry after timeout -> create new controller
5. Supabase SDK timeout vs AbortController -> test compatibility

**Risk**: HIGH (hanging requests freeze UI)
**Effort**: 1 hour
**Testing**: Simulate slow network. Verify timeout fires. Verify UI recovers.
**Rollback**: Remove AbortController wrappers

### 1C. Fix patternApi.js Localhost Hardcode (HIGH)

**Files to modify**:
- `frontend/src/services/patternApi.js`

**What**: Replace `http://localhost:8000` with environment variable (`VITE_API_URL` or similar). Or remove file if Python backend is not used in production.

**Risk**: HIGH (broken in production)
**Effort**: 15 minutes

### 1D. Clean Up ScannerWebSocket Mock (MEDIUM)

**Files to modify**:
- `frontend/src/services/scannerAPI.js` -- Remove or fix `ScannerWebSocket` class

**What**: The chart already uses real Binance WS. The `ScannerWebSocket` class in scannerAPI.js is fake (setInterval + Math.random). Either:
- Option A: Delete it entirely (chart WS handles real-time)
- Option B: Connect it to real Binance WS for pattern-level real-time detection

**Risk**: MEDIUM
**Effort**: 30 minutes (delete) or 2 hours (real implementation)

### 1E. Remove Mock Candle Data (MEDIUM)

**Files to modify**:
- `frontend/src/services/scannerAPI.js` -- Fix `getCandlestickData()`

**What**: Replace mock candle generation with real Binance Futures klines API call. The function currently returns `Math.random()` candles. Real candles come from `patternDetection.js -> binanceService` but this function exists as a confusing alternative path.

**Risk**: MEDIUM
**Effort**: 30 minutes

### 1F. Paper Trading Visibility Check (LOW)

**Files to modify**:
- `frontend/src/pages/Dashboard/Scanner/v2/ScannerPage.jsx`

**What**: Add `document.visibilityState` check to 30s auto-refresh interval. Pause when tab is hidden, resume when visible.

**Risk**: LOW
**Effort**: 15 minutes

### 1G. Fix `getUser()` -> `getSession()` in Scanner Services (MEDIUM)

**Files to modify** (grep for `supabase.auth.getUser()` in scanner-related files):
- Web: `RiskCalculator.jsx`, `TradingJournal.jsx`, `paperTrading.js`, `PatternScanner.jsx`
- Mobile: scanner service files using `supabase.auth.getUser()` (identified by mobile-auditor)

**What**: Replace `supabase.auth.getUser()` with `supabase.auth.getSession()` per Memory Rule #35.
`getUser()` makes an API call that hangs on cold Supabase connection. `getSession()` reads from local storage (instant).

**Risk**: MEDIUM (hangs on cold start)
**Effort**: 1 hour
**Testing**: Cold-start scanner, verify no hanging. Verify session data provides user_id.
**Rollback**: Revert to getUser()

---

## Phase 1.5 -- Paper Trading Table Unification (CRITICAL)

**Goal**: Fix the paper trading table divergence so web trades get proper TP/SL/liquidation monitoring

> **Context**: Web uses `paper_trading_accounts`/`paper_trading_orders`/`paper_trading_holdings`.
> Mobile uses `paper_trades`/`paper_pending_orders`/`paper_positions`.
> `paper-trade-monitor-cron` ONLY monitors mobile's `paper_trades` — web trades are UNMONITORED.

### 1.5A. Evaluate Table Unification Strategy

**Decision needed before implementation**:

| Option | Description | Risk | Effort |
|--------|------------|------|--------|
| A: Unify tables | Migrate web to use mobile's tables | HIGH (breaking) | 8-12 hrs |
| B: Dual cron | Extend cron to also monitor web tables | MEDIUM | 3-4 hrs |
| **C: Deprecate web tables (Recommended)** | Web writes to mobile tables going forward, read both during transition | MEDIUM | 6-8 hrs |
| D: Keep separate | Accept divergence, document as intentional | LOW | 0 hrs |

### 1.5B. Implement Option C: Deprecate Web Tables

**Files to modify**:
- `frontend/src/services/paperTrading.js` -- Switch writes to `paper_trades`/`paper_pending_orders`/`paper_positions`
- `frontend/src/services/paperTrading.js` -- Add read-from-both logic for transition period
- `supabase/functions/paper-trade-monitor-cron/index.ts` -- Verify it handles web-originated rows

**Files to create**:
- `supabase/migrations/YYYYMMDD_paper_trade_web_migration.sql` -- Add any missing columns to mobile tables for web compatibility

**What**:
1. Web `paperTrading.js` writes NEW trades to `paper_trades` (mobile's table)
2. Web reads from BOTH `paper_trades` AND `paper_trading_orders` (transition period)
3. Existing web trades in `paper_trading_orders` remain readable but no new writes
4. `paper-trade-monitor-cron` automatically monitors web trades (they're now in `paper_trades`)
5. After 30-day transition, stop reading from old web tables

**Edge cases**:
1. Old web trades in `paper_trading_orders` -> still readable during transition
2. Web trade format differs from mobile -> normalize in service layer
3. `paper_trading_accounts` virtual balance -> migrate to `profiles` field or new shared table
4. Cron picks up web trade but format differs -> validate/normalize
5. User has trades in BOTH old and new tables -> merge in display
6. Concurrent write to old and new table -> prevent with write-lock in service
7. Migration fails mid-way -> rollback transaction
8. RLS on mobile tables may not cover web usage patterns -> verify policies
9. Web trade missing fields that mobile requires -> set defaults
10. Paper trade monitor cron timeout -> already has 10s budget per Memory
11. Column type mismatch between tables -> cast in migration
12. Indexes missing on mobile tables for web query patterns -> add
13. Web paper trading account balance -> compute from trades (like mobile)
14. Old web trades have no `pending_order_id` -> nullable column OK
15. `paper_trading_holdings` open positions -> one-time migration to `paper_positions`
16. Cron processes same trade twice during transition -> idempotency check
17. WebSocket price feeds for position monitoring -> unchanged (already works)
18. CSV export needs to read from both tables during transition -> union query
19. Admin dashboard shows all trades -> service_role query spans both tables
20. Transition period config -> environment variable `PAPER_TRADE_TRANSITION_END_DATE`

**Risk**: CRITICAL (monetization, data integrity)
**Effort**: 6-8 hours
**Testing**: Create paper trade on web -> verify cron monitors it -> verify TP/SL executes
**Rollback**: Revert web service to old tables, trades already in new table stay (cron still monitors them)

---

## Phase 1.5 -- Paper Trading Table Unification (NEW — backend-auditor finding)

**Goal**: Ensure web paper trades get monitored by the cron (TP/SL/liquidation)

### CRITICAL FINDING
Web and mobile use **COMPLETELY DIFFERENT** paper trading tables:
- **Mobile**: `paper_trades`, `paper_pending_orders`, `paper_positions`
- **Web**: `paper_trading_accounts`, `paper_trading_orders`, `paper_trading_holdings`

The `paper-trade-monitor-cron` edge function ONLY monitors `paper_trades` (mobile).
Web paper trades with TP/SL set will **NEVER auto-execute**.

### Recommended Approach: Option C (Deprecate Web Tables)

**Files to modify**:
- `frontend/src/services/paperTrading.js` -- Switch writes to mobile tables
- `supabase/functions/paper-trade-monitor-cron/index.ts` -- Verify cron covers all scenarios

**What**:
1. Web starts writing new trades to `paper_trades` / `paper_pending_orders` / `paper_positions`
2. Existing web trades remain readable from `paper_trading_orders` during transition
3. Read from BOTH table sets during transition, write ONLY to mobile tables
4. After transition period, drop web-only tables

**Supabase tables already exist** — both sets verified in DB.

**Edge cases**:
1. Existing web trades in old tables → still readable during transition
2. User has trades in both table sets → merge on read, show unified view
3. Cron picks up web trades after migration → verify TP/SL fields match schema
4. Account balance tracking → `paper_trading_accounts` has balance, mobile uses `profiles.gems`
5. Holdings vs Positions naming → normalize field names
6. Web order format differs from mobile → adapter/mapper layer needed
7. Stop orders → web has `paper_trading_stop_orders` table, mobile embeds in `paper_pending_orders`
8. User switches platform mid-trade → both platforms see same data after migration
9. Rollback → web reverts to old tables, no data loss
10. Performance → indexed queries on mobile tables already optimized

**Risk**: HIGH (data integrity)
**Effort**: 6-8 hours (including testing)
**Testing**: Create paper trade on web, verify cron monitors it, verify mobile can see it
**Rollback**: Revert paperTrading.js to use old tables

> **NOTE**: This is a significant architectural change. Recommend implementing AFTER Phase 1 bugs are fixed and separately from other Phase 2 work.

---

## Phase 2 -- Zone Persistence & Quota

**Goal**: Persist zone data to Supabase, enforce scan quotas

### 2A. Zone DB Persistence

**Files to modify**:
- `frontend/src/utils/zoneTracker.js` -- Add Supabase save/load

**Files to create** (if needed):
- `frontend/src/services/zoneManagerWeb.js` -- DB wrapper around ZoneTracker

**What**:
- Save zones to Supabase table (use existing `zones` or `scanner_zones` table)
- Load zones on page load
- Update zone status on retest/break
- Keep in-memory tracker as cache, DB as persistence
- Handle offline gracefully (in-memory fallback)

**Supabase migration** (if table doesn't exist):
```sql
CREATE TABLE scanner_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  symbol TEXT NOT NULL,
  timeframe TEXT NOT NULL,
  zone_type TEXT NOT NULL, -- 'HFZ' or 'LFZ'
  zone_high DECIMAL NOT NULL,
  zone_low DECIMAL NOT NULL,
  zone_mid DECIMAL NOT NULL,
  status TEXT NOT NULL DEFAULT 'FRESH',
  retest_count INT DEFAULT 0,
  pattern_type TEXT,
  confidence DECIMAL,
  created_at TIMESTAMPTZ DEFAULT now(),
  last_tested_at TIMESTAMPTZ,
  expired_at TIMESTAMPTZ,
  metadata JSONB
);

-- RLS
ALTER TABLE scanner_zones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own zones" ON scanner_zones
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Service role full access" ON scanner_zones
  FOR ALL TO service_role USING (true);
```

**Edge cases**:
1. DB save fails -> keep in-memory, retry on next action
2. Page refresh -> load from DB, populate ZoneTracker
3. Zone expired in DB but not in memory -> sync on load
4. Two tabs open -> last-write-wins (acceptable for now)
5. Zone already exists in DB for same price level -> upsert
6. User deletes zone -> soft delete with expired_at timestamp
7. DB returns 0 zones -> empty state, don't error
8. Zone table doesn't exist yet -> migration needed first
9. RLS blocks read -> check policy, ensure user_id matches
10. Zone data too large -> limit 100 zones per user per symbol
11. Zone without required fields -> validate before save
12. Network offline -> cache writes, flush when online
13. Concurrent zone updates -> optimistic UI, DB reconcile
14. Zone migration from old schema -> version field
15. Admin views all zones -> service_role bypass
16. Zone TTL expired -> batch cleanup job
17. Zone from different account -> RLS prevents access
18. Zone precision -> match Binance price precision
19. Zone overlaps (same price, different pattern) -> allow both
20. Zone count exceeds tier limit -> enforce on display, not storage

**Risk**: HIGH (core data loss issue)
**Effort**: 4-6 hours
**Testing**: Create zone, refresh page, verify zone persists. Test retest. Test break.
**Rollback**: Revert to in-memory only

### 2B. Scan Quota Enforcement

**Files to create**:
- `frontend/src/services/scanQuotaService.js`

**Files to modify**:
- `frontend/src/pages/Dashboard/Scanner/v2/ScannerPage.jsx` -- Check quota before scan
- `frontend/src/stores/scannerStore.js` -- Add quota state

**What**:
- Check scan quota via Supabase before each scan (match mobile's `tierAccessService.checkScanLimit()`)
- FREE: 5 scans/day, TIER1+: unlimited
- Show remaining scans count
- Show upgrade modal when quota exceeded
- 3s timeout on quota check (graceful degradation)
- ADMIN bypasses all checks

**Supabase**: Use existing `scan_quota` table or RPC function if available. Otherwise create:
```sql
CREATE TABLE scan_quota (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  scan_date DATE NOT NULL DEFAULT CURRENT_DATE,
  scan_count INT DEFAULT 0,
  UNIQUE(user_id, scan_date)
);
```

**Edge cases**:
1. Quota DB unreachable -> allow scan (graceful degradation)
2. Quota check takes >3s -> timeout, allow scan
3. Multiple tabs scanning -> DB count is authoritative
4. Midnight UTC reset -> new row for new date
5. Admin user -> skip quota check entirely
6. Tier upgrade mid-day -> immediately unlock unlimited
7. Quota display shows stale count -> refresh after each scan
8. Race condition: two scans submitted simultaneously -> DB atomic increment
9. Scan fails after quota counted -> still count it (match mobile behavior)
10. Guest user (not logged in) -> treat as FREE
11. Negative quota count (bug) -> clamp to 0
12. Very old quota rows -> cleanup after 30 days
13. Quota check returns null -> treat as 0 scans used
14. Network error during increment -> log but don't block
15. User clears localStorage -> quota lives in DB, unaffected
16. Quota exceeded message -> show reset time
17. Partial scan (1 of 5 coins done) -> still counts as 1 scan
18. Batch scan (10 coins) -> counts as 1 scan
19. Cached quota becomes stale -> re-check on each scan
20. Display "X of Y scans remaining" in UI

**Risk**: HIGH (monetization/fairness)
**Effort**: 3-4 hours
**Testing**: Scan as FREE user 5 times, verify 6th blocked. Test as TIER1+.
**Rollback**: Remove quota check, restore unlimited

---

## Phase 3 -- Detection Parity & Cleanup

**Goal**: Add 4 missing pattern detectors, clean up redundant code

### 3A. Add Missing Pattern Detectors

**Files to create**:
- `frontend/src/services/patternDetection/quasimodoDetector.js`
- `frontend/src/services/patternDetection/ftrDetector.js`
- `frontend/src/services/patternDetection/flagLimitDetector.js`
- `frontend/src/services/patternDetection/decisionPointDetector.js`

**Files to modify**:
- `frontend/src/services/patternDetection.js` -- Import and integrate 4 new detectors

**What**: Port mobile's dedicated detectors for Quasimodo, FTR (Failed To Return), Flag Limit, and Decision Point patterns. These are TIER3-only patterns. Match mobile's detection algorithm exactly.

**Risk**: MEDIUM (new patterns, existing unaffected)
**Effort**: 4-6 hours
**Testing**: Compare detection output with mobile on 20 symbols
**Rollback**: Remove imports, disable detectors

### 3B. Add Zone Hierarchy

**Files to create**:
- `frontend/src/services/zoneHierarchy.js`

**Files to modify**:
- `frontend/src/utils/zoneTracker.js` -- Integrate hierarchy ranking

**What**: Decision Point zones ranked above FTR > Flag Limit > Regular zones. Affects zone display priority and trading recommendations.

**Risk**: LOW
**Effort**: 2 hours

### 3C. Clean Up Redundant Code

**Files to modify/delete**:
- DELETE `frontend/src/utils/frequencyPatterns.js` (redundant, `patternDetection.js` has all 23 patterns)
- DELETE `frontend/src/services/scannerAPI.ts` (TypeScript duplicate of .js file with mock data)
- DELETE or FIX `frontend/src/services/patternApi.js` (localhost hardcode)
- CLEAN `frontend/src/services/scannerAPI.js` (remove mock WebSocket, mock candles, simulated delay)
- DELETE `gem-mobile/src/contexts/ScannerStateContext.js` (730 lines, deprecated, never imported)
- DELETE `gem-mobile/src/screens/tabs/ScannerScreen.js` (placeholder, real one is in `screens/Scanner/`)

**What**: Remove dead code, mock data, and redundant files to reduce confusion.

**Risk**: LOW (dead code removal)
**Effort**: 1-2 hours
**Testing**: Verify nothing imports deleted files. Run web app.
**Rollback**: Restore from git

---

## Phase 4 -- Design Token Enforcement & Responsive

**Goal**: Fix design token violations, improve mobile responsiveness

### 4A. Fix Design Token Violations

**Files to modify**:
- `frontend/src/components/RiskCalculator/RiskCalculator.jsx` -- Replace inline styles with CSS/tokens
- `frontend/src/components/TradingJournal/TradingJournal.jsx` -- Replace hardcoded colors
- `frontend/src/components/TradingInfoSidebar.jsx` -- Replace hardcoded colors
- `frontend/src/utils/patternImageGenerator.js` -- Use token colors

**What**: Replace all hardcoded color values (#FFBD59, #9C0612, #00FF88, #FF4757, etc.) with imports from `web design-tokens.js`. Replace inline `fontFamily: 'Poppins'` with CSS variable.

**Mapping**:
| Hardcoded | Token |
|-----------|-------|
| `#FFBD59` | `COLORS.primary` |
| `#FF8A00` | `COLORS.primaryDark` |
| `#9C0612` | (need new token: `COLORS.bearishDark`) |
| `#00FF88` / `#0ECB81` | `COLORS.success` |
| `#FF4757` / `#F6465D` | `COLORS.error` |
| `#FFD700` | `COLORS.primary` (close enough) |

**New tokens needed** (propose to design system):
- `COLORS.bearish`: '#FF6B6B' (already exists as `error`)
- `COLORS.bullish`: '#3AF7A6' (already exists as `success`)
- `COLORS.bearishDark`: '#9C0612' (NEW - for zone fill)
- `COLORS.bullishDark`: '#0A6B3D' (NEW - for zone fill)

**Risk**: MEDIUM (visual changes)
**Effort**: 3-4 hours
**Testing**: Visual comparison before/after on all breakpoints
**Rollback**: Revert CSS/style changes

### 4B. Mobile Touch Support

**Files to modify**:
- `frontend/src/components/SidePeekPanel.jsx` -- Add touch events for resize
- `frontend/src/pages/Dashboard/Scanner/v2/components/TradingChart.jsx` -- Touch drag-to-resize

**What**: Add `touchstart`/`touchmove`/`touchend` handlers alongside mouse events for resize interactions.

**Risk**: LOW
**Effort**: 1-2 hours

---

## Phase 5 -- Zone Monitoring & Notifications

**Goal**: Real-time zone price monitoring with browser notifications

### 5A. Zone Price Monitor

**Files to create**:
- `frontend/src/services/zonePriceMonitor.js`
- `frontend/src/services/zoneNotificationService.js`

**What**:
- Monitor real-time prices against active zones
- Detect: zone approach (within 0.5 ATR), zone retest, zone breakout
- Trigger browser notifications (with Notification API permission)
- Show in-app toast for zone events
- Batch price checks (every 500ms)

**Risk**: MEDIUM
**Effort**: 4-6 hours
**Testing**: Set up zone, simulate price approach, verify notification
**Rollback**: Disable monitoring

---

## Phase 6 -- Performance & Optimization

### 6A. Scan Button Debounce
- Add 500ms debounce to scan button
- Show "scanning..." state to prevent re-clicks

### 6B. Web Worker for Detection
- Move pattern detection to Web Worker to prevent UI blocking
- Main thread sends candle data, worker returns patterns

### 6C. Error Boundary
- Add React Error Boundary around scanner components
- Catch chart/WebSocket crashes gracefully

**Risk**: LOW
**Effort**: 3-4 hours total

---

## Phase 7 -- Hardening & Testing

### 7A. End-to-End Flow Testing

**Test scenarios**:
1. FREE user: scan 5x -> 6th blocked -> upgrade modal
2. TIER2 user: multi-TF scan -> confluence score displayed
3. Zone created -> page refresh -> zone still there (DB persistence)
4. Zone retested -> status changes to TESTED_1X -> UI reflects
5. Chart WS disconnects -> reconnects -> prices resume
6. RiskCalculator loads tier from `profiles` (not `users`)
7. TradingJournal loads tier from `profiles` (not `users`)
8. 10-symbol scan completes without errors
9. CSV export works with special characters
10. SidePeekPanel opens/closes on mobile (touch)

### 7B. Analytics
- Track scan count, pattern distribution, tier usage
- Log to existing analytics table

---

## Implementation Order & Dependencies

```
Phase 1 (Bug Fixes) ---- no dependencies, do FIRST
  1A: from('users') fix (4 files)  [15 min]
  1B: AbortController              [1 hr]
  1C: patternApi.js fix            [15 min]
  1D: ScannerWebSocket cleanup     [30 min]
  1E: Mock candle removal          [30 min]
  1F: Visibility check             [15 min]
  1G: getUser() -> getSession()    [1 hr]

Phase 1.5 (Paper Trade Unification) ---- after Phase 1A
  1.5A: Evaluate strategy (need user decision)
  1.5B: Implement Option C         [6-8 hr]

Phase 2 (Persistence) ---- after Phase 1
  2A: Zone DB persistence          [4-6 hr]
  2B: Scan quota enforcement       [3-4 hr]

Phase 3 (Detection Parity) ---- after Phase 1, parallel with Phase 2
  3A: 4 missing detectors          [4-6 hr]
  3B: Zone hierarchy               [2 hr]
  3C: Code cleanup                 [1-2 hr]

Phase 4 (Design/Responsive) ---- after Phase 1
  4A: Design token fixes           [3-4 hr]
  4B: Touch support                [1-2 hr]

Phase 5 (Monitoring) ---- after Phase 2A
  5A: Zone price monitor           [4-6 hr]

Phase 6 (Performance) ---- after Phase 3
  6A-C: Debounce, Worker, Boundary [3-4 hr]

Phase 7 (Testing) ---- after all phases
  7A-B: E2E testing + analytics    [3-4 hr]
```

---

## Estimated Total Effort

| Phase | Files | Hours | Priority |
|-------|-------|-------|----------|
| 1 (Bug Fixes) | 8 modify | 3-4 | IMMEDIATE |
| 1.5 (Paper Trade) | 2 modify, 1 create | 6-8 | CRITICAL |
| 2 (Persistence) | 3 create, 3 modify | 7-10 | HIGH |
| 3 (Detection) | 5 create, 2 modify, 3 delete | 7-10 | MEDIUM |
| 4 (Design) | 5 modify | 4-6 | MEDIUM |
| 5 (Monitoring) | 2 create | 4-6 | LOW |
| 6 (Performance) | 2 create, 2 modify | 3-4 | LOW |
| 7 (Testing) | 1 create | 3-4 | LOW |
| **TOTAL** | ~13 new, ~25 modify, ~6 delete | **~37-52 hrs** | |

---

## Mandatory Rules

1. No blind copying mobile code -- adapt for web platform
2. Single source of truth: `from('profiles')` NOT `from('users')`
3. EVERY fetch() must have AbortController timeout (10s default)
4. Use `web design-tokens.js` exclusively -- no hardcoded values
5. Mobile-first layout mandatory
6. No new design tokens without approval (propose `bearishDark`/`bullishDark`)
7. No breaking changes without explicit warning
8. try/finally for all loading states
9. Delete dead code -- don't comment it out
10. Run existing tests after each phase
