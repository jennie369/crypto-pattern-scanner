# PHASE 6: Scanner + PaperTrade Engine Critical Fixes

**Branch**: `scanner-papertrade-critical-fix`
**Date**: 2026-02-14
**Status**: AUDIT COMPLETE — AWAITING APPROVAL
**Auditors**: scanner-auditor, trade-auditor, manual code review

---

## Executive Summary

5 critical trading engine bugs. All root causes traced to specific lines.
~120 lines changed across 8 files. No new files needed.

| # | Issue | Severity | Root Cause |
|---|-------|----------|------------|
| 1 | Scanner "crash" + state wipe | CRITICAL | B3 FIX wipes results when clicking cross-TF pattern |
| 2 | Market order instead of Limit | CRITICAL | Missing STOP order support (breakout entries) |
| 3 | TP value mismatch | MEDIUM | Zone Manager hardcodes 1:2 R:R, ignoring detector |
| 4 | PNL $0.0000 + no auto-close | HIGH | Consequence of #2 + mapFromSupabase sets currentPrice=entryPrice |
| 5 | AdminAI Binance 400 error | LOW | Spot API used for Futures-only symbols |

---

## Issue #1: Scanner "Crash" on First Click + State Wipe

### Root Cause: B3 FIX Wipes All Results on Pattern Selection

**NOT a crash** — it's the B3 fix in ScannerContext wiping all scan results when user clicks a pattern from a different timeframe.

**File**: `contexts/ScannerContext.js:22-34`
```javascript
const setSelectedTimeframe = useCallback((newTf) => {
  setSelectedTimeframeRaw(prev => {
    if (prev !== newTf) {
      setScanResults([]);     // ← WIPES ALL RESULTS!
      setPatterns([]);        // ← WIPES ALL PATTERNS!
      setLastScanTime(null);
      setMultiTFResults(null);
      setZones([]);           // ← WIPES ALL ZONES!
    }
    return newTf;
  });
}, []);
```

**Trigger**: `screens/Scanner/ScannerScreen.js:1498-1499`
```javascript
onSelectPattern={(pattern) => {
  setSelectedCoins([pattern.symbol]);
  if (pattern.timeframe) {
    setSelectedTimeframe(pattern.timeframe);  // ← TRIGGERS WIPE
  }
  setSelectedPattern(pattern);
  // ...
}}
```

**Why it happens**: TIER2/3 users scan multiple timeframes (e.g., "4h", "1h", "15m") but `selectedTimeframe` stays at "4h". When user clicks a "1h" pattern, `setSelectedTimeframe("1h")` detects `"1h" !== "4h"` → wipes everything.

**Why second scan works**: After wipe, `selectedTimeframe` is now "1h". Re-scanning produces "1h" patterns. Clicking any pattern matches → no wipe.

**Why switching coins causes it again**: Switching coins doesn't reset `selectedTimeframe`. Going back to 4h scanning restarts the cycle.

**Secondary issue**: Calling multiple `setState` inside another `setState` updater function is a React anti-pattern that can cause inconsistent re-renders.

**Additional finding**: `handlePatternPress` at `ScannerScreen.js:823-825` (navigation to PatternDetailScreen) is **dead code** — never wired to any child component. Users cannot navigate to PatternDetailScreen from scan results.

### Fix Approach

**Option B (Recommended)**: Add `clearResults` flag to `setSelectedTimeframe`:

```javascript
// ScannerContext.js
const setSelectedTimeframe = useCallback((newTf, { clearResults = true } = {}) => {
  setSelectedTimeframeRaw(prev => {
    if (prev !== newTf) {
      if (clearResults) {
        setScanResults([]);
        setPatterns([]);
        setLastScanTime(null);
        setMultiTFResults(null);
        setZones([]);
      }
    }
    return newTf;
  });
}, []);

// ScannerScreen.js:1498 — pattern selection (don't clear)
setSelectedTimeframe(pattern.timeframe, { clearResults: false });

// TimeframeSelector usage — user-initiated change (keep clearing)
setSelectedTimeframe(newTf);  // defaults to clearResults: true
```

Also fix the React anti-pattern by moving setState calls outside the updater:

```javascript
const setSelectedTimeframe = useCallback((newTf, { clearResults = true } = {}) => {
  setSelectedTimeframeRaw(prev => {
    if (prev !== newTf && clearResults) {
      // Schedule clears for next microtask to avoid setState-in-setState
      queueMicrotask(() => {
        setScanResults([]);
        setPatterns([]);
        setLastScanTime(null);
        setMultiTFResults(null);
        setZones([]);
      });
    }
    return newTf;
  });
}, []);
```

### Files to Change
- `contexts/ScannerContext.js` (lines 22-34)
- `screens/Scanner/ScannerScreen.js` (lines 1498-1499, 1570-1584 — two onSelectPattern callbacks)

### Risk: CRITICAL (blocks user from using scan results)

---

## Issue #2: PaperTrade Opens Market Instead of Limit Order

### Root Cause: Missing STOP Order Support (Breakout Entries)

**TWO layers** have the same bug — both the V2 modal AND the service only support standard limit orders, not stop/breakout orders.

#### Bug Layer 1: PaperTradeModalV2.js:564-566
```javascript
const shouldBePending = direction === 'LONG'
    ? limitPriceNum < currentPrice    // Only handles: buy dip (limit)
    : limitPriceNum > currentPrice;   // Only handles: sell pump (limit)
```

For LONG breakout entry $1.8641 > current $1.49: `shouldBePending = false` → executes immediately.

#### Bug Layer 2: paperTradeService.js:719-748
```javascript
// Line 719: Fallback makes isSamePrice=true if price fetch fails
const marketPrice = currentMarketPrice || pattern.entry;

// Line 936-944: Only handles limit orders, not stops
isLimitOrder(direction, entryPrice, marketPrice) {
  if (dir === 'LONG') return entryPrice < marketPrice;  // buy dip only
  else return entryPrice > marketPrice;                  // sell pump only
}

// Line 739-741: Breakout entries flagged as "invalid"
const isInvalidEntry = !isSamePrice && !isValidLimit && (
  dir === 'LONG' ? pattern.entry > marketPrice : pattern.entry < marketPrice
);
// LONG $1.8641 > $1.49 → isInvalidEntry = TRUE → forced to MARKET at $1.49
```

#### Bug Layer 3: shouldFillOrder (line 952-960)
Even if we fix creation, the fill logic is also wrong for stop orders:
```javascript
shouldFillOrder(order, marketPrice) {
  if (dir === 'LONG') return marketPrice <= order.entryPrice;  // Only: price drops to entry
  // LONG stop needs: marketPrice >= order.entryPrice (price rises to entry)
}
```

### The 4 Order Types

| Type | Direction | Entry vs Market | Status | Fill Condition |
|------|-----------|-----------------|--------|---------------|
| LONG Limit | LONG | entry < market (buy dip) | Pending | price drops to entry |
| SHORT Limit | SHORT | entry > market (sell pump) | Pending | price rises to entry |
| **LONG Stop** | LONG | entry > market (breakout) | **Missing!** | price rises to entry |
| **SHORT Stop** | SHORT | entry < market (breakdown) | **Missing!** | price drops to entry |

Scanner patterns are often **breakout entries** requiring STOP order support.

### Fix Approach

**1. PaperTradeModalV2.js — Fix `shouldBePending` (line 564-566)**:
```javascript
// ANY entry that differs from market price by >0.1% should be pending
const priceTolerance = currentPrice * 0.001;
const shouldBePending = Math.abs(limitPriceNum - currentPrice) > priceTolerance;
```

**2. paperTradeService.js — Fix `openPosition()` (line 719-748)**:
```javascript
// Remove "invalid entry" concept entirely — ALL non-same entries are PENDING
const priceTolerance = marketPrice * 0.001;
const isSamePrice = Math.abs(pattern.entry - marketPrice) <= priceTolerance;

const finalEntryPrice = pattern.entry;  // ALWAYS use pattern entry
const isLimitOrder = !isSamePrice;      // PENDING if not same price

// Store market price at creation time for fill direction detection
```

**3. paperTradeService.js — Fix `shouldFillOrder()` (line 952-960)**:
```javascript
shouldFillOrder(order, marketPrice) {
  // Use creation market price to determine fill direction
  if (order.entryPrice > order.createdAtMarketPrice) {
    // Stop order: entry was above market → fill when price RISES to entry
    return marketPrice >= order.entryPrice;
  } else {
    // Limit order: entry was below market → fill when price DROPS to entry
    return marketPrice <= order.entryPrice;
  }
}
```

**4. paperTradeService.js — Fix `isLimitOrder()` (line 936-945)**:
```javascript
// Rename to isPendingOrder — any entry != market is pending
isPendingOrder(entryPrice, marketPrice) {
  const tolerance = marketPrice * 0.001;
  return Math.abs(entryPrice - marketPrice) > tolerance;
}
```

**5. Add `createdAtMarketPrice` field** to pending order object (line 570-584 in V2, line 780-810 in service).

### Architecture Decision

> **Keep MARKET vs PENDING** (no separate limit/stop types needed). The `createdAtMarketPrice` field handles fill direction automatically. Simplest change, no schema migration needed.

### Files to Change
- `services/paperTradeService.js` (lines 719-751, 780-810, 936-945, 952-960)
- `components/Trading/PaperTradeModalV2.js` (lines 564-566, 570-584)
- `screens/Scanner/components/PaperTradeModal.js` (lines 200-227 — same bug fix for old modal)

### Risk: CRITICAL (every breakout trade opens at wrong price)

---

## Issue #3: TP Value Not Matching Scan Result

### Root Cause: Zone Manager Hardcodes 1:2 R:R

**File**: `services/zoneManager.js:268-275`
```javascript
// Calculate target prices (1:2 and 1:3 R:R)  ← HARDCODED!
const riskAmount = Math.abs(entryPrice - stopPrice);
const target1 = zoneType === ZONE_TYPE.LFZ
  ? entryPrice + (riskAmount * 2)   // Always 1:2 R:R
  : entryPrice - (riskAmount * 2);
```

The pattern detector uses variable R:R multipliers (2.2-2.8 for GEM patterns, PATTERN_SIGNALS config), but Zone Manager **always uses 1:2 R:R**. This creates two competing TP values:
- `pattern.target` = detector's TP (e.g., R:R 2.5 → $112.50)
- `zone.target_1` = zone's TP (R:R 2.0 → $110.00) — **always different**

### Why the Wrong Value Shows

The TP mismatch surfaces when `handlePaperTrade` merges zone data:
```javascript
// ScannerScreen.js:862-863
target_1: matchingZone.target_1 || enrichedPattern.target,     // Zone's 1:2 R:R
take_profit: matchingZone.take_profit || matchingZone.target_1,  // Zone's 1:2 R:R
```

Then `PaperTradeModalV2:304` reads:
```javascript
pattern.takeProfit1 || pattern.takeProfit || pattern.target || pattern.target_1 || ...
```

The scan **card** displays `pattern.target` (detector value) but the **trade form** may pick up `target_1` or `take_profit` (zone value) depending on which field was populated first.

### Secondary Issue: Hardcoded 1:2 R:R Fallback

`patternDetection.js:3296-3301` (`_adaptDetectorResult`):
```javascript
if (!target || target <= 0) {
  target = entry + (risk * 2);  // Hardcoded 1:2 fallback
}
```
Should use `PATTERN_SIGNALS[pattern].avgRR` instead of `2`.

### Fix Approach

**1. Zone Manager — Use detector's R:R** (`zoneManager.js:268-275`):
```javascript
const rrMultiplier = pattern.riskReward || pattern.rrMultiplier || 2.0;
const target1 = zoneType === ZONE_TYPE.LFZ
  ? entryPrice + (riskAmount * rrMultiplier)
  : entryPrice - (riskAmount * rrMultiplier);
```

**2. handlePaperTrade — Prefer detector's target** (`ScannerScreen.js:862-863`):
```javascript
// Detection target takes priority (it uses the correct R:R)
take_profit: enrichedPattern.target || matchingZone.target_1 || enrichedPattern.takeProfit,
takeProfit: enrichedPattern.target || matchingZone.target_1 || enrichedPattern.takeProfit,
```

**3. PaperTradeModalV2 — Add `takeProfit` to pattern** in `handlePaperTrade` so the V2 modal finds it first in the fallback chain.

**4. _adaptDetectorResult — Use pattern config R:R** (`patternDetection.js:3296-3301`):
```javascript
const signal = PATTERN_SIGNALS[pattern.type] || {};
const defaultRR = signal.avgRR || 2.0;
target = dir === 'SHORT' ? entry - (risk * defaultRR) : entry + (risk * defaultRR);
```

### Files to Change
- `services/zoneManager.js` (lines 268-275)
- `screens/Scanner/ScannerScreen.js` (lines 860-863)
- `services/patternDetection.js` (lines 3296-3301)

### Risk: MEDIUM (wrong TP = wrong R:R display, affects trade targets)

---

## Issue #4: No Auto Close on SL/TP Hit + PNL Shows $0.0000

### Root Cause: Consequence of Issue #2

**The $0 PNL is caused by Issue #2**. When entry is forced to market price:
```
PNL = (currentPrice - entryPrice) * quantity
    = ($1.49 - $1.49) * qty
    = $0.0000
```

### Secondary Root Cause: mapFromSupabase Initializes PNL to 0

**File**: `services/paperTradeService.js:2612-2614`
```javascript
currentPrice: parseFloat(data.entry_price) || 0,  // Sets currentPrice = entryPrice!
unrealizedPnL: 0,
unrealizedPnLPercent: 0,
```

On app restart, `currentPrice` is set to `entryPrice`, making PNL = 0 until the next monitoring cycle (up to 5 seconds).

### Auto-Close IS Working (Verified)

The monitoring chain is correct and active:
- `AuthContext.js:480` calls `startGlobalMonitoring(userId, 5000)` on login
- `checkAllOpenPositions()` runs every 5s with Futures API prices
- `updatePrices()` has correct SL/TP comparison for LONG and SHORT
- Push notifications fire on SL hit, TP hit, and liquidation

The auto-close "failure" is because Issue #2 sets wrong entry price → SL/TP levels are now unreachable relative to actual market price.

### Fix Approach

1. **Fix Issue #2 first** — this resolves the $0 PNL and unreachable SL/TP
2. **Add quantity validation** at `paperTradeService.js:751`:
```javascript
const quantity = actualPositionValue / finalEntryPrice;
if (!isFinite(quantity) || quantity <= 0) {
  throw new Error(`Invalid quantity: ${quantity}`);
}
```
3. **Add PNL NaN guard** at `paperTradeService.js:1486`:
```javascript
if (!isFinite(position.quantity) || position.quantity <= 0) {
  position.unrealizedPnL = 0;
  position.unrealizedPnLPercent = 0;
} else {
  position.unrealizedPnL = priceDiff * position.quantity;
  position.unrealizedPnLPercent = (priceDiff / position.entryPrice) * (position.leverage || 1) * 100;
}
```
4. **Fix mapFromSupabase** — immediately fetch price after load (optional, resolves $0 flash on restart).

### Files to Change
- `services/paperTradeService.js` (lines 751, 1486-1487, 2612)

### Risk: HIGH (linked to Issue #2, all trades show wrong PNL)

---

## Issue #5: AdminAIMarket getRecentCandles Binance 400 Error

### Root Cause: Spot API vs Futures API Mismatch

**File**: `services/adminAI/adminAIMarketService.js:125, 170`

```javascript
// Line 125 — WRONG: Spot ticker
fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`)

// Line 170 — WRONG: Spot candles
fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${timeframe}&limit=${count}`)
```

App coin list comes from Futures `exchangeInfo`. Futures-only symbols (1000PEPEUSDT, etc.) don't exist on Spot → HTTP 400.

Same bug in old modal: `screens/Scanner/components/PaperTradeModal.js:117`

### Fix Approach (Option A: 3-line URL change)

```javascript
// Line 125: Futures ticker
fetch(`https://fapi.binance.com/fapi/v1/ticker/24hr?symbol=${symbol}`)

// Line 170: Futures candles
fetch(`https://fapi.binance.com/fapi/v1/klines?symbol=${symbol}&interval=${timeframe}&limit=${count}`)

// PaperTradeModal.js line 117: Futures price
fetch(`https://fapi.binance.com/fapi/v1/ticker/price?symbol=${pattern.symbol}`)
```

### Files to Change
- `services/adminAI/adminAIMarketService.js` (lines 125, 170)
- `screens/Scanner/components/PaperTradeModal.js` (line 117)

### Risk: LOW (AdminAI + old modal)

---

## Implementation Order

| Priority | Issue | Severity | Est. Lines | Dependencies |
|----------|-------|----------|------------|-------------|
| 1 | **#2** Market→Limit | CRITICAL | ~50 | None |
| 2 | **#4** PNL + validation | HIGH | ~15 | After #2 |
| 3 | **#1** Scanner state wipe | CRITICAL | ~20 | None |
| 4 | **#3** TP mismatch | MEDIUM | ~20 | None |
| 5 | **#5** Binance 400 | LOW | ~6 | None |

Issues #1, #3, and #5 are independent and can be done in parallel with #2→#4.

---

## Files Changed Summary

| File | Issues |
|------|--------|
| `services/paperTradeService.js` | #2, #4 |
| `components/Trading/PaperTradeModalV2.js` | #2 |
| `screens/Scanner/components/PaperTradeModal.js` | #2, #5 |
| `contexts/ScannerContext.js` | #1 |
| `screens/Scanner/ScannerScreen.js` | #1, #3 |
| `services/zoneManager.js` | #3 |
| `services/patternDetection.js` | #3 |
| `services/adminAI/adminAIMarketService.js` | #5 |

---

## Architecture Decisions (for approval)

1. **Order types**: Keep **MARKET vs PENDING** — no separate limit/stop types. Store `createdAtMarketPrice` in pending order to determine fill direction. Simplest change, no DB migration.

2. **PENDING fill direction**: Use `createdAtMarketPrice` comparison:
   - If `entry > createdAtMarketPrice` → stop order → fill when price rises to entry
   - If `entry < createdAtMarketPrice` → limit order → fill when price drops to entry

3. **Pattern Mode entry**: `pattern.entry` is ALWAYS authoritative. Never overridden by market price. Only create MARKET order if entry ≈ market (within 0.1%).

4. **TP priority**: Detection target (with correct R:R) takes precedence over zone target_1 (hardcoded 1:2 R:R). Zone Manager updated to use detector's R:R.

5. **ScannerContext B3 fix**: Add `clearResults` flag — user-initiated TF changes clear results, pattern-selection TF changes don't.

6. **Monitoring interval**: Keep at 5000ms (sufficient for paper trading).

---

## Test Plan

### Issue #1
- [ ] TIER2/3: Scan multi-TF → click a pattern from different TF → results NOT wiped
- [ ] User manually changes TF from selector → results ARE cleared (B3 fix preserved)
- [ ] Switch coins → rescan → click pattern → no wipe

### Issue #2
- [ ] LONG trade with entry ABOVE market (breakout) → PENDING order created
- [ ] SHORT trade with entry BELOW market (breakdown) → PENDING order created
- [ ] LONG trade with entry BELOW market (buy dip) → PENDING limit order
- [ ] Entry ≈ market price → MARKET order (instant open)
- [ ] Pending LONG stop fills when price rises to entry
- [ ] Pending SHORT stop fills when price drops to entry
- [ ] Binance price fetch failure → order fails gracefully (not forced to MARKET)

### Issue #3
- [ ] TP in scan card matches TP in PaperTrade modal
- [ ] DPU/UPU patterns (R:R 2.5-2.8) show correct TP, not 1:2 R:R
- [ ] DP/FTR patterns use PATTERN_SIGNALS avgRR, not hardcoded 2

### Issue #4
- [ ] Open position → PNL reflects actual price movement (not $0.0000)
- [ ] App restart → PNL updates within 5s
- [ ] Quantity is always finite positive number

### Issue #5
- [ ] AdminAI chat on 1000PEPEUSDT → no 400 error, shows market data
- [ ] AdminAI chat on BTCUSDT → candles and analysis load correctly

---

*Compiled from scanner-auditor, trade-auditor, and manual code review.*
*Ready for implementation upon user approval.*
