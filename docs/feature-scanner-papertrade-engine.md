# Feature: Scanner + PaperTrade Engine Fixes (Phase 6)

**Date**: 2026-02-14
**Commit**: `075aa4c`
**Branch**: `scanner-papertrade-critical-fix` → merged to `main`

---

## Problem Statement

Five critical bugs in the scanner and paper trading engine made the Trading tab unusable:

1. **Scanner state wipe**: Clicking a scan result from a different timeframe wiped all results, forcing a rescan. Users thought the app crashed.
2. **Market instead of Limit order**: Breakout patterns (entry above market) opened immediately as MARKET orders at the wrong price instead of creating PENDING orders.
3. **TP value mismatch**: The take-profit shown in scan results differed from the value pre-filled in the trade form.
4. **PNL $0.0000**: All positions showed $0 profit/loss because entry was forced to market price.
5. **AdminAI Binance 400**: The AI assistant failed to load market data for futures-only symbols.

## Why This Change Was Needed

These bugs affected the core trading experience:
- Users couldn't trust scan results (Issue #1 — results vanished on click)
- Paper trades opened at wrong prices (Issue #2 — financial accuracy)
- Trade targets didn't match analysis (Issue #3 — decision-making)
- Position tracking was broken (Issue #4 — portfolio monitoring)
- AI assistant was blind on many coins (Issue #5 — degraded AI)

## Architectural Decisions

### 1. MARKET vs PENDING (no 4 order types)

**Decision**: Keep two order states: `MARKET` (instant fill) and `PENDING` (wait for price).

**Alternative considered**: Implement 4 distinct order types (LIMIT_BUY, LIMIT_SELL, STOP_BUY, STOP_SELL) like a real exchange.

**Why rejected**: Adds complexity (new DB columns, UI for order type selection, separate fill logic per type) for no user benefit in paper trading. The `createdAtMarketPrice` field elegantly determines fill direction without exposing order type complexity to users.

**Trade-off**: Less educational value for users learning real exchange order types. Acceptable because paper trading focuses on pattern recognition, not order management.

### 2. Fill Direction via createdAtMarketPrice

**Decision**: Store the market price at order creation time. Use it to determine whether price needs to rise or fall to fill:
- `entry > createdAtMarketPrice` → stop order → fill when price RISES to entry
- `entry < createdAtMarketPrice` → limit order → fill when price DROPS to entry

**Alternative considered**: Store explicit `orderSubType: 'limit' | 'stop'` field.

**Why rejected**: The `createdAtMarketPrice` approach is self-documenting, backward-compatible (legacy orders without this field fall back to direction-based logic), and requires no schema migration.

### 3. Pattern Entry is Authoritative

**Decision**: In both Pattern Mode and Custom Mode, the requested entry price is always used. No "invalid entry" override to market price.

**Alternative considered**: Keep the safety override for "invalid" entries (breakout entries).

**Why rejected**: The concept of "invalid entry" was wrong — breakout entries (LONG above market) are a valid and common trading strategy. The override caused the most critical bug (all breakout trades at wrong price).

### 4. Detection R:R Takes Priority Over Zone R:R

**Decision**: Zone Manager now uses the detector's R:R multiplier instead of hardcoded 1:2 R:R.

**Alternative considered**: Always use 1:2 R:R for consistency.

**Why rejected**: Different patterns have different optimal R:R ratios (GEM patterns use 2.2-2.8, classics use 2.0). Hardcoding 1:2 made TP values incorrect for most patterns.

### 5. ScannerContext clearResults Flag

**Decision**: Add a `{ clearResults }` option to `setSelectedTimeframe()`. Pattern selection passes `false`; user-initiated TF changes pass `true` (default).

**Alternative considered**: Remove the B3 fix entirely (never clear results on TF change).

**Why rejected**: The B3 fix exists for a real reason — prevents cross-timeframe data leakage. Removing it would reintroduce the original bug where stale 4h patterns appeared when switching to 1h.

## Integration with Existing Modules

| Module | Integration Point |
|--------|------------------|
| `ScannerContext` | `setSelectedTimeframe()` now accepts options parameter |
| `paperTradeService` | `openPosition()` logic rewritten, `shouldFillOrder()` uses new field |
| `PaperTradeModalV2` | `shouldBePending` simplified to price-distance check |
| `zoneManager` | `_patternToZone()` reads `pattern.riskReward` for R:R |
| `patternDetection` | `_adaptDetectorResult()` uses `PATTERN_SIGNALS.avgRR` |
| `adminAIMarketService` | URLs changed from Spot to Futures API |
| `AuthContext` | Calls `startGlobalMonitoring()` — no changes needed |

## Risks

1. **Legacy pending orders** without `createdAtMarketPrice` use fallback direction-based fill logic. Existing pending orders created before this fix will still work but may fill incorrectly for stop-type orders (edge case — few users have pending orders).

2. **Zone R:R change** means existing zones on the chart will show different TP lines than before. This is correct behavior but may confuse users who memorized old TP values.

3. **queueMicrotask** in ScannerContext moves state clearing to next microtask. In theory this could cause a single frame where stale data is visible. In practice, React batches state updates, so this is not observable.

## Future Improvements

- **WebSocket monitoring**: Replace 5s REST polling with real-time WebSocket price feeds for instant SL/TP detection
- **Partial fill**: Support partially filling pending orders (e.g., 50% at entry, 50% at better price)
- **Order modification**: Allow users to modify entry/SL/TP of pending orders
- **Trailing stop**: Dynamic stop-loss that follows price movement
- **Multi-TP**: Support multiple take-profit targets with partial close
