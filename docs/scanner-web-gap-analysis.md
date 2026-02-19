# Scanner Web Gap Analysis (REVISED v2)
## Mobile App vs Web Frontend (gemral.com)
> Generated: 2026-02-19 | Revised v2: incorporated mobile-auditor + backend-auditor findings
> **IMPORTANT**: Read this file at start of EVERY session for full context

---

## PHASE 0 -- Safety Confirmation

| Item | Status | Details |
|------|--------|---------|
| Backup branch | DONE | `backup/scanner-web-sync-20260219_041242` |
| Stable tag | DONE | `pre-scanner-gap-analysis` |
| Rollback: branch | `git checkout backup/scanner-web-sync-20260219_041242` |
| Rollback: tag | `git reset --hard pre-scanner-gap-analysis` |
| Stash | `stash@{0}: backup-before-scanner-web-sync-20260219_035944` |

---

## 1. Feature Parity Table (REVISED)

> **NOTE**: Initial analysis underestimated web capabilities. Web `patternDetection.js` (2181 lines) has 23 patterns with 3-phase enhancement. The `frequencyPatterns.js` (547 lines) is a SEPARATE utility.
> **NOTE2**: Mobile `patternDetection.js` is actually **4,213 lines** (50K+ tokens) — much larger than web's 2,181 lines. Mobile has dedicated detector sub-modules (quasimodo, FTR, flagLimit, decisionPoint) plus 7 enhancement modules.

| # | Feature | Mobile App | Web v2 | Status | Risk | Notes |
|---|---------|-----------|--------|--------|------|-------|
| 1 | **Pattern Detection (basic)** | 7 patterns in `patternDetection.js` (4,213 lines) | 7 patterns in `patternDetection.js` (2181 lines) | MATCH | LOW | Both have DPD/UPU/DPU/UPD/H&S/DT/DB |
| 2 | **Advanced Patterns (Tier2+)** | 17 advanced patterns + dedicated detectors (quasimodo, FTR, flagLimit, decisionPoint) | 16 advanced patterns (missing Quasimodo/FTR/FlagLimit/DecisionPoint, but has Hammer/ThreeMethods) | PARTIAL | MEDIUM | Different advanced pattern sets. Web missing 4 mobile-exclusive detectors |
| 3 | **Quality Enhancement V2** | 8-factor confidence scoring in `patternEnhancerV2.js` | 3-phase pipeline in `patternDetection.js`: Volume+Trend(P1), S/R+Candle(P2), RSI+RR(P3) | PARTIAL | MEDIUM | Different architecture, same concept. Mobile has separate service vs web has inline |
| 4 | **Zone Management** | Full lifecycle in `zoneManager.js` with DB persistence, cache, tier limits, hierarchy | Full lifecycle in `zoneTracker.js` (401 lines): FRESH->TESTED->WEAK->BROKEN, 30-day TTL, 2-trade max | PARTIAL | HIGH | Web zone tracker is IN-MEMORY ONLY (lost on refresh). No DB persistence. No hierarchy |
| 5 | **Zone Calculator** | `zoneCalculator.js`: ATR-based boundaries, R:R calc, width validation | `pauseZoneDetection.js` (341 lines): ATR-based volatility ratio, 0.1-3% range validation | PARTIAL | MEDIUM | Web has ATR-based detection but different boundary logic |
| 6 | **Entry Workflow** | Integrated in scanner screen | `entryWorkflow.js` (327 lines): 6-step workflow (DETECTED->ZONE->APPROACHING->IN_ZONE->CONFIRMATION->BROKEN) | WEB BETTER | LOW | Web has dedicated entry workflow that mobile lacks as separate module |
| 7 | **Confirmation Validation** | `confirmationPatterns.js` | `confirmationValidator.js` (487 lines): Pin Bar, Hammer, Shooting Star, Engulfing, Doji, strength scoring | MATCH | LOW | Both implement confirmation candle validation |
| 8 | **Multi-Timeframe Analysis** | `multiTimeframeScanner.js`: tier-gated, HTF trend, zone-in-zone, strength ranking | `multiTimeframeScanner.js` (330 lines): tier-gated, parallel scan, confluence scoring (0-100) | MATCH | LOW | Both implement MTF with tier gating |
| 9 | **Volume Validation** | `volumeAnalysis.js`: profiling, direction confirmation, thresholds | Phase 1 enhancement in `patternDetection.js`: `analyzeVolumeProfile()` + `confirmVolumeDirection()` (0-19 pts) | MATCH | LOW | Both implement volume validation |
| 10 | **RSI Divergence** | `rsiDivergence.js` | Phase 3 enhancement: `detectRSIDivergence()` (0-20 pts) | MATCH | LOW | Both implement RSI divergence |
| 11 | **Trend Analysis** | `trendAnalysis.js` | Phase 1 enhancement: `analyzeTrend()` + `calculateTrendBonus()` (-20 to +25 pts) | MATCH | LOW | Both implement trend analysis |
| 12 | **S/R Confluence** | `supportResistance.js` | Phase 2 enhancement: `findKeyLevels()` + `checkConfluence()` (0-20 pts) | MATCH | LOW | Both implement S/R confluence |
| 13 | **Candle Confirmation** | `candlePatterns.js` | Phase 2 enhancement: `checkCandleConfirmation()` (0-15 pts) | MATCH | LOW | |
| 14 | **Dynamic R:R** | `dynamicRR.js` | Phase 3 enhancement: `optimizeRiskReward()` (0-15 pts) | MATCH | LOW | |
| 15 | **Paper Trade Integration** | Full: `PaperTradeModalV2`, `OpenPositionsSection`, drag-to-reorder | Real-time positions in `ScannerPage.jsx`, auto-refresh 30s, WS price per position | MATCH | MEDIUM | Both integrated. Web uses CompactSidebar panel, mobile uses dedicated sections |
| 16 | **Access Control / Tier Gating** | `scannerAccess.js` (4 tiers, 20+ features), `tierAccessService`, DB-backed quota | Tier gating in `patternDetection.js` + `ControlPanel.jsx` + `SubToolsPanel.jsx`. No DB-backed quota | PARTIAL | HIGH | Web has tier gating but NO scan quota enforcement. DB quota missing |
| 17 | **Scan Quota** | DB-backed via `tierAccessService.checkScanLimit()`, 3s timeout, graceful degradation | NOT IMPLEMENTED | MISSING | HIGH | Free users can scan unlimited on web |
| 18 | **Confidence Scoring** | 8-factor system with grade labels (A+/A/B/C/REJECT) | Quality grading: A+(85+), A(75+), B(65+), C(55+), D(<55). 6 scoring factors | PARTIAL | LOW | Different thresholds but same concept |
| 19 | **Zone Hierarchy** | `zoneHierarchy.js`: Decision Point > FTR > Flag Limit > Regular | NOT IMPLEMENTED | MISSING | MEDIUM | Web zones have no hierarchy ranking |
| 20 | **Zone DB Persistence** | `zoneManager.js` saves to Supabase | In-memory only (`globalZoneTracker`), lost on page refresh | MISSING | HIGH | Critical data loss on refresh |
| 21 | **Zone Notifications** | `zoneNotificationService.js`: approach, retest, breakout alerts | NOT IMPLEMENTED | MISSING | MEDIUM | |
| 22 | **Zone Lifecycle Service** | `zoneLifecycleService.js`: automated status transitions | In-memory transitions in `zoneTracker.js` (manual calls) | PARTIAL | LOW | |
| 23 | **Zone Price Monitor** | `zonePriceMonitor.js`: real-time monitoring | NOT IMPLEMENTED | MISSING | MEDIUM | |
| 24 | **Real-time Price (WS)** | Binance Futures WS + REST fallback + stale-data guards + auto-reconnect | **Chart WS is REAL** (`fstream.binance.com/ws/{symbol}@kline`), scanner WS is SIMULATED | PARTIAL | HIGH | Chart has real WS with ping/pong. But `ScannerWebSocket` class in scannerAPI.js is fake |
| 25 | **Chart Integration** | TradingView WebView + `MultiZoneOverlay` + drawing tools | TradingView Lightweight Charts (1311 lines) + real Binance Futures API + live WS updates + pattern lines + drag-to-resize | WEB BETTER | LOW | Web chart is more feature-rich with native lightweight-charts |
| 26 | **Risk Calculator** | N/A (in paper trade modal) | Full standalone: `RiskCalculator.jsx` (798 lines), zone-based SL, multiple TPs, save/load to Supabase | WEB ONLY | LOW | |
| 27 | **Trading Journal** | N/A | `TradingJournal.jsx` (722 lines): CRUD, stats, CSV export, 50-trade FREE limit | WEB ONLY | LOW | |
| 28 | **Scan Results UI** | `ScanResultsSection`: badges, grades, zone linking, drag-to-reorder | `ResultsList.jsx`, `PatternDetails.jsx`, `PatternInfoUltraCompact.jsx` | MATCH | LOW | |
| 29 | **Coin Selector** | Custom `CoinSelector` + favorites + tier limits | 3 variants: Advanced, Compact, Dropdown | MATCH | LOW | |
| 30 | **CSV Export** | Not in mobile | `exportToCSV` + `downloadCSV` in scannerAPI.js | WEB ONLY | LOW | |
| 31 | **Sub-Tools Panel** | N/A | 9 sub-tools in 3x3 grid via SidePeekPanel (Notion-style) | WEB ONLY | LOW | Analytics, Risk Calc, MTF, etc. |
| 32 | **State Management** | React Context (`ScannerContext.js`, 96 lines) | Zustand (`scannerStore.js`, 74 lines) with localStorage persistence | DIFFERENT | LOW | Both work. Web survives refresh (better) |
| 33 | **Pattern Signal Enrichment** | `patternSignals.js` + `patternConfig.js` | `getPatternSignal()` enrichment with description, signal, icon, winRate, avgRR, bestTimeframes | MATCH | LOW | |
| 34 | **FORCE_REFRESH Recovery** | Full listener on every screen | NOT APPLICABLE | N/A | NONE | Web doesn't need app resume |
| 35 | **Sponsor Banners** | `useSponsorBanners` hook | NOT IMPLEMENTED | MOBILE ONLY | LOW | |
| 36 | **Tooltip System** | `useTooltip` hook | NOT IMPLEMENTED | MISSING | LOW | |
| 37 | **Exchange Affiliate CTA** | `exchangeAffiliateService` | NOT IMPLEMENTED | MISSING | LOW | |
| 38 | **Design Token Usage** | `utils/tokens.js` consistently | MIXED: ScannerPage uses CSS vars, Journal/Calculator use hardcoded colors | PARTIAL | MEDIUM | 3+ components violate token system |
| 39 | **Paper Trading Tables** | `paper_trades`, `paper_pending_orders`, `paper_positions` | `paper_trading_accounts`, `paper_trading_orders`, `paper_trading_holdings` | DIVERGED | **CRITICAL** | **COMPLETELY DIFFERENT table schemas!** See Section 8 |
| 40 | **Paper Trade Monitor Cron** | Monitored by `paper-trade-monitor-cron` (TP/SL/liquidation) | **NOT MONITORED** — cron only watches mobile's `paper_trades` table | MISSING | **CRITICAL** | Web paper trades get NO TP/SL/liquidation execution |
| 41 | **Access Control Overlap** | TWO systems: `scannerAccess.js` (460 lines) + `tierAccessService` | Single tier check in `patternDetection.js` + `ControlPanel.jsx` | MOBILE WORSE | MEDIUM | Mobile has overlapping/conflicting access control |
| 42 | **Scanner getUser() calls** | Uses `supabase.auth.getUser()` in scanner services (Rule 35 violation) | Uses `supabase.auth.getUser()` in scanner services | BOTH BAD | MEDIUM | Should use `getSession()` per Rule 35 — API call hangs on cold Supabase |

---

## 2. CRITICAL BUGS FOUND IN WEB AUDIT

### BUG 1: `from('users')` instead of `from('profiles')` (CRITICAL)
Per Memory Rule #1: ALL app code MUST read `profiles` table, NOT `users`.

**Affected files** (4 total — backend-auditor found 4th):
- `frontend/src/components/RiskCalculator/RiskCalculator.jsx:93` -- `supabase.from('users').select('tier')`
- `frontend/src/components/TradingJournal/TradingJournal.jsx:52` -- `supabase.from('users').select('tier')`
- `frontend/src/components/Scanner/PatternScanner.jsx` -- `supabase.from('users')` for telegram_id
- `frontend/src/services/paperTrading.js:26` -- `supabase.from('users')` for user data

**Fix**: Replace `from('users')` with `from('profiles')` in all **4** files.

### BUG 2: `ScannerWebSocket` is entirely simulated (HIGH)
- `scannerAPI.js` `ScannerWebSocket` class uses `setInterval` every 3s with fake `Math.random()` data
- The chart WebSocket IS real (`fstream.binance.com`), but the scanner-level WS is fake
- `scannerAPI.ts` (TypeScript version) also uses mock data throughout

### BUG 3: `patternApi.js` hardcoded to localhost:8000 (HIGH)
- Python backend connection hardcoded to `http://localhost:8000`
- No environment variable -- won't work in production

### BUG 4: `scannerAPI.js` `getCandlestickData()` returns fake candles (MEDIUM)
- Comment says "TODO: integrate with Binance" -- generates random candles
- Real candle data comes from `patternDetection.js -> binanceService`, not from this function
- Confusing dual path for candle data

### BUG 5: No AbortController timeouts on fetches (MEDIUM)
Per Memory Rule #14: EVERY fetch() MUST have AbortController timeout.
- `RiskCalculator.jsx`: Supabase queries have no timeout
- `TradingJournal.jsx`: Supabase queries have no timeout
- `TradingChart.jsx` (v2): Binance API fetch has no AbortController

### BUG 6: Paper trading auto-refresh runs when tab is hidden (LOW)
- 30s `setInterval` in ScannerPage.jsx has no `document.visibilityState` check
- Wastes API calls when user is on different tab

### BUG 7: Pattern detection returns only FIRST matching pattern (LOW)
- `scanSymbol()` returns `filteredByDirection[0]` -- one pattern per symbol per scan
- Could miss secondary patterns

### BUG 8: No rate limiting on scan button (LOW)
- User can spam scan button without debounce
- Each click triggers parallel API calls to Binance

### BUG 9: SidePeekPanel resize is mouse-only (LOW)
- Uses `onMouseDown`/`mousemove`/`mouseup` -- no touch support
- Won't work on mobile/tablet browsers

### BUG 10: Paper Trading Table Divergence (CRITICAL — backend-auditor)
Web and mobile use **COMPLETELY DIFFERENT** paper trading tables:

| Purpose | Mobile Table | Web Table |
|---------|-------------|-----------|
| Trades/Orders | `paper_trades` | `paper_trading_orders` |
| Pending Orders | `paper_pending_orders` | (within `paper_trading_orders`) |
| Positions | `paper_positions` | `paper_trading_holdings` |
| Accounts | (none — uses `profiles.gems`) | `paper_trading_accounts` |

**Impact**:
- `paper-trade-monitor-cron` edge function only monitors `paper_trades` (mobile) — web paper trades get **NO** TP/SL/liquidation execution
- Users switching between platforms see DIFFERENT trade histories
- Data siloed — no cross-platform portfolio view

### BUG 11: `supabase.auth.getUser()` in scanner services (MEDIUM — mobile-auditor)
Per Memory Rule #35: Use `getSession()` NOT `getUser()` — the API call hangs on cold Supabase.
Found in multiple scanner-related services on BOTH platforms. Mobile has ~5+ instances in scanner code, web has instances in RiskCalculator and TradingJournal.

---

## 3. Logic Gaps on Web (REVISED)

### 3.1 Detection Logic -- MOSTLY ALIGNED
- **CORRECTED**: Web `patternDetection.js` has 23 patterns (not 6)
- Web has 3-phase quality enhancement pipeline matching mobile's concept
- **GAP**: Web missing 4 mobile-exclusive detectors: Quasimodo, FTR, Flag Limit, Decision Point
- **GAP**: Mobile has separate dedicated detector files; web has everything inline
- **DUPLICATE**: `frequencyPatterns.js` (6 patterns) exists alongside `patternDetection.js` (23 patterns) -- redundant

### 3.2 Zone Calculation -- PARTIALLY ALIGNED
- Both use ATR-based analysis
- **GAP**: Web zone tracker is in-memory only (critical data loss)
- **GAP**: Web missing zone hierarchy (Decision Point > FTR > Flag Limit > Regular)

### 3.3 R:R Handling -- ALIGNED
- Both have dynamic R:R optimization via `optimizeRiskReward()`

### 3.4 Pending vs Market Classification -- ALIGNED
- Both have paper trade integration with open positions

### 3.5 Multi-Timeframe -- ALIGNED
- Both have tier-gated MTF scanning with confluence scoring

### 3.6 State Persistence -- WEB BETTER
- Web: Zustand persist survives page refresh
- Mobile: React Context does not survive tab navigation loss

### 3.7 Real-time Updates -- PARTIAL
- **Chart WS**: Web uses real Binance Futures WS with ping/pong health check -- GOOD
- **Scanner WS**: Simulated with fake data -- BAD (but chart data is real)
- **Paper trade prices**: Real WS subscriptions per position -- GOOD

---

## 4. Risk Assessment (REVISED v2)

### CRITICAL Risk
1. **4 files query `from('users')` instead of `from('profiles')`** -- will return wrong data or NULL
2. **`patternApi.js` hardcoded to localhost:8000** -- broken in production
3. **Paper trading table divergence** -- web trades get NO TP/SL/liquidation monitoring from cron
4. **Paper trade cron doesn't monitor web tables** -- silent data loss for web users

### HIGH Risk
5. **Zone tracker is in-memory only** -- users lose all zone data on refresh
6. **No scan quota enforcement on web** -- free users can scan unlimited
7. **`ScannerWebSocket` class is fake** (scanner-level, not chart-level)
8. **No AbortController timeouts** on 4+ components
9. **`scannerAPI.js` `getCandlestickData()` returns fake candles** -- confusing dual data path

### MEDIUM Risk
10. Web missing 4 mobile-exclusive pattern detectors (Quasimodo, FTR, FlagLimit, DecisionPoint)
11. Zone hierarchy not implemented
12. Zone notifications not implemented
13. Design token violations in 3+ components
14. Zone price monitor not implemented
15. No scan button debounce/rate limiting
16. **Mobile has overlapping access control** (`scannerAccess.js` + `tierAccessService`)
17. **`supabase.auth.getUser()` in scanner services** on both platforms (Rule 35 violation)

### LOW Risk
18. Paper trading auto-refresh runs when tab hidden
19. Pattern detection returns only first match
20. SidePeekPanel resize is mouse-only
21. Missing tooltip system
22. Missing exchange affiliate CTA
23. `frequencyPatterns.js` is redundant alongside `patternDetection.js`

---

## 5. Technical Debt Discovered (REVISED v2)

1. **`from('users')` in 4 web files** -- MUST be `from('profiles')` (backend-auditor found 4th: `paperTrading.js:26`)
2. **`ScannerStateContext.js` is dead code** (730 lines, deprecated, never imported) -- delete
3. **`frequencyPatterns.js` is redundant** -- `patternDetection.js` has all patterns. Dual detection confusing.
4. **`scannerAPI.js` has mock candle generation + simulated delay** -- should use real Binance API
5. **`scannerAPI.ts` TypeScript version** exists alongside .js version -- pick one
6. **`patternApi.js` connects to localhost:8000** -- needs env var or removal
7. **Web `ScannerWebSocket` class is entirely mock** -- not needed since chart WS is real
8. **Mobile has 2 ScannerScreen files**: `screens/tabs/ScannerScreen.js` (placeholder) and `screens/Scanner/ScannerScreen.js` (real)
9. **Inline styles in TradingJournal.jsx** -- massive inline objects, should use CSS/tokens
10. **`Math.max(...array)` / `Math.min(...array)` pattern** -- stack overflow risk on large arrays
11. **Paper trading tables diverged** -- web and mobile use completely different schemas, cron only monitors mobile's
12. **`supabase.auth.getUser()` in scanner services** on both platforms -- should be `getSession()` (Rule 35)

---

## 6. Design Token Compliance Report

### Web Design Tokens Available (`web design-tokens.js`):
- COLORS: 20 tokens | GRADIENTS: 6 | SPACING: 9 (8-point grid)
- TYPOGRAPHY: fontSize(10), fontWeight(4), lineHeight(3)
- RADIUS: 6 | SHADOWS: 6 | ANIMATION: Framer Motion presets
- BREAKPOINTS: 6 (xs:375 to 2xl:1536)

### CSS Variables in Use (ScannerPage.css):
- `var(--bg-card)`, `var(--glass-blur)`, `var(--glass-border)` -- glassmorphism
- `var(--brand-gold)`, `var(--text-primary)`, `var(--text-secondary)`
- `var(--scrollbar-width)`, `var(--scrollbar-thumb)`, `var(--scrollbar-track)`

### Violations Found:
| File | Issue |
|------|-------|
| `RiskCalculator.jsx` | No CSS variables, all inline styles |
| `TradingJournal.jsx` | Hardcoded: `#FFBD59`, `#9C0612`, `#00FF88`, `#FF4757`, 6+ rgba values |
| `TradingInfoSidebar.jsx` | Hardcoded: `#FFD700`, `#0ECB81`, `#F6465D` |
| `patternImageGenerator.js` | Hardcoded: `#1a1a1a`, `#FFD700`, `#0ECB81`, `#F6465D` |
| `TradingJournal.jsx` | Hardcoded font: `fontFamily: 'Poppins, sans-serif'` |

### Responsive Design Status:
- ScannerPage.css: 4 breakpoints (>1400px, 1024-1400, 768-1024, <768)
- **MISSING**: Touch gesture support, mobile swipe navigation
- **MISSING**: SidePeekPanel touch resize (mouse-only)
- RiskCalculator: NOT explicitly responsive
- TradingJournal: Uses `auto-fit, minmax(200px, 1fr)` -- OK

---

## 8. Paper Trading Table Divergence (CRITICAL)

> Discovered by backend-auditor. This is the most architecturally significant finding.

### 8.1 Table Schema Comparison

**Mobile tables** (used by `paperTradeService.js`):
- `paper_trades` — main trade log (entries, exits, P&L)
- `paper_pending_orders` — unfilled limit/stop orders
- `paper_positions` — open positions with unrealized P&L

**Web tables** (used by `paperTrading.js`):
- `paper_trading_accounts` — virtual balance tracking
- `paper_trading_orders` — all orders (pending + filled)
- `paper_trading_holdings` — current holdings/positions

### 8.2 Cron Monitoring Gap

`paper-trade-monitor-cron` (Supabase Edge Function) monitors:
- `paper_trades` with status='open' — checks TP/SL/liquidation triggers
- **DOES NOT** monitor `paper_trading_orders` or `paper_trading_holdings`

**Result**: Web paper trades with TP/SL set will NEVER auto-execute.

### 8.3 Resolution Options

| Option | Description | Risk | Effort |
|--------|------------|------|--------|
| A: Unify tables | Migrate web to use mobile's tables | HIGH (breaking) | 8-12 hrs |
| B: Dual cron | Extend cron to also monitor web tables | MEDIUM | 3-4 hrs |
| C: Deprecate web tables | Web writes to mobile tables going forward, read both during transition | MEDIUM | 6-8 hrs |
| D: Keep separate | Accept divergence, document as intentional | LOW | 0 hrs |

**Recommendation**: Option C (deprecate web tables) — web starts writing to mobile's `paper_trades`/`paper_pending_orders`/`paper_positions`, existing web trades remain readable from old tables during transition period. This avoids breaking the cron while giving a clean path forward.

### 8.4 RPC Functions Available (26+)
The backend-auditor identified 26+ RPC functions and 20+ scanner-related tables. Notable:
- `increment_scan_count` — exists, can be reused for web quota
- `get_user_scan_quota` — exists, ready for web integration
- No dedicated scanner API backend — all detection is client-side on both platforms

---

## SUMMARY (REVISED v2)

| Category | Count |
|----------|-------|
| Features fully matching | **15** |
| Features partially matching | **8** |
| Features missing on web | **8** |
| Features web-only | **5** |
| Features web-is-better | **2** |
| Features DIVERGED | **1** (paper trading tables) |
| Mobile-worse items | **1** (overlapping access control) |
| Both-bad items | **1** (getUser() calls) |
| CRITICAL bugs | **4** (was 2 — added paper trade divergence + 4th from('users')) |
| HIGH risks | **5** |
| MEDIUM risks | **8** (was 6 — added access control overlap + getUser()) |
| LOW risks | **6** |
| Dead code files | **3** |
| Technical debt items | **12** (was 10 — added paper trade divergence + getUser()) |

### Key Insights
1. The web scanner is **more complete** than initially assessed (23 patterns, 3-phase enhancement)
2. **Paper trading table divergence** is the #1 architectural risk — web trades get NO cron monitoring
3. **4 files** query `from('users')` (not 3 as initially found)
4. Mobile's `patternDetection.js` is **2x larger** than web's (4,213 vs 2,181 lines)
5. Mobile has **overlapping access control** systems that should be consolidated
6. Both platforms use `supabase.auth.getUser()` in scanner code (should be `getSession()`)

### Prioritized Fix Order
1. **CRITICAL bugs** (from('users'), paper trade monitoring gap)
2. **Zone persistence** (in-memory only → DB)
3. **Scan quota** (not enforced on web)
4. **Paper trade table unification** (Option C: deprecate web tables)
5. **4 missing pattern detectors** + code cleanup
6. **Design token violations**
7. **getUser() → getSession()** migration
