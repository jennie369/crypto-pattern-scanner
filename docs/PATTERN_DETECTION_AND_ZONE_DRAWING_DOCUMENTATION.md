# GEM SCANNER - PATTERN DETECTION & ZONE DRAWING DOCUMENTATION

> **SINGLE SOURCE OF TRUTH** - Reference này chứa toàn bộ logic của hệ thống Pattern Detection và Zone Drawing.
> **Last Updated:** 2026-02-06
> **Version:** 2.0

---

## MỤC LỤC

1. [Tổng Quan Hệ Thống](#1-tổng-quan-hệ-thống)
2. [Pattern Detection - 24+ Patterns](#2-pattern-detection---24-patterns)
3. [Multi-Timeframe Analysis](#3-multi-timeframe-analysis)
4. [Zone Calculation & Management](#4-zone-calculation--management)
5. [Zone Drawing - TradingChart](#5-zone-drawing---tradingchart)
6. [Zone Drawing - ScannerScreen](#6-zone-drawing---scannerscreen)
7. [Zone Drawing - PatternDetailScreen](#7-zone-drawing---patterndetailscreen)
8. [Key Code Snippets](#8-key-code-snippets)
9. [Troubleshooting Guide](#9-troubleshooting-guide)

---

## 1. TỔNG QUAN HỆ THỐNG

### 1.1 File Structure

```
gem-mobile/src/
├── services/
│   ├── patternDetection.js      # Core pattern detection engine
│   ├── multiTimeframeScanner.js # Multi-TF analysis
│   ├── zoneCalculator.js        # Zone boundary calculation
│   ├── zoneManager.js           # Zone lifecycle management
│   ├── quasimodoDetector.js     # Advanced QM patterns
│   ├── ftrDetector.js           # FTR patterns
│   ├── flagLimitDetector.js     # Flag Limit patterns
│   └── decisionPointDetector.js # Decision Point patterns
├── constants/
│   └── patternConfig.js         # Pattern definitions & win rates
├── screens/Scanner/
│   ├── ScannerScreen.js         # Main scanner UI + zone rendering
│   ├── PatternDetailScreen.js   # Position detail + zone display
│   └── components/
│       └── TradingChart.js      # WebView chart + zone canvas drawing
└── components/Scanner/
    └── ZoneRectangle.js         # Zone UI component
```

### 1.2 Data Flow

```
[User clicks Scan]
    ↓
patternDetection.detectPatterns(symbol, timeframe)
    ↓
[Returns patterns with entry/SL/TP]
    ↓
zoneManager.createZonesFromPatterns(patterns)
    ↓
[Zones stored in ScannerContext + Supabase]
    ↓
ScannerScreen passes zones to TradingChart
    ↓
TradingChart.drawZonesOnCanvas() renders on chart
```

---

## 2. PATTERN DETECTION - 24+ PATTERNS

### 2.1 Pattern Categories

#### TIER 0 - GEM Frequency Core (4 patterns)

| Pattern | Direction | Zone | Win Rate | R:R | Strength |
|---------|-----------|------|----------|-----|----------|
| DPD (Down-Pause-Down) | SHORT | HFZ | 68% | 2.5 | ⭐⭐⭐ |
| UPU (Up-Pause-Up) | LONG | LFZ | 71% | 2.8 | ⭐⭐⭐ |
| DPU (Down-Pause-Up) | LONG | LFZ | 69% | 2.6 | ⭐⭐⭐⭐⭐ |
| UPD (Up-Pause-Down) | SHORT | HFZ | 65% | 2.2 | ⭐⭐⭐⭐⭐ |

#### TIER 1 - Classic Reversals (4 patterns)

| Pattern | Direction | Win Rate | R:R |
|---------|-----------|----------|-----|
| Head & Shoulders | SHORT | 72% | 3.0 |
| Inverse Head & Shoulders | LONG | 75% | 3.0 |
| Double Top | SHORT | 68% | 2.5 |
| Double Bottom | LONG | 70% | 2.7 |

#### TIER 2 - Triangles & Continuations (8 patterns)

| Pattern | Direction | Win Rate | R:R |
|---------|-----------|----------|-----|
| Ascending Triangle | LONG | 70% | 2.2 |
| Descending Triangle | SHORT | 68% | 2.1 |
| Symmetrical Triangle | Breakout | 63% | 2.0 |
| Bull Flag | LONG | 72% | Dynamic |
| Bear Flag | SHORT | 71% | Dynamic |
| Wedge (Rising) | SHORT | 62% | 2.2 |
| Wedge (Falling) | LONG | 62% | 2.2 |
| Cup & Handle | LONG | 70% | 2.5 |

#### TIER 3 - Advanced GEM Patterns (8+ patterns)

| Pattern | Direction | Win Rate | Tier |
|---------|-----------|----------|------|
| Quasimodo Bearish (QML-B) | SHORT | 75% | S |
| Quasimodo Bullish (QML-L) | LONG | 73% | S |
| FTR Bearish | SHORT | 66% | A |
| FTR Bullish | LONG | 68% | A |
| Flag Limit Bearish (FL-B) | SHORT | 65% | B |
| Flag Limit Bullish (FL-L) | LONG | 65% | B |
| Decision Point Bearish | SHORT | 64% | B |
| Decision Point Bullish | LONG | 64% | B |

### 2.2 GEM Frequency Detection Algorithm

```javascript
// File: patternDetection.js
// Core 3-phase detection: MOVE 1 → PAUSE → MOVE 2

findGEMPattern(candles, patternType) {
  // Phase 1: Detect impulsive move
  const move1 = this.detectImpulsiveMove(candles, startIdx, direction, {
    minCandles: 2,
    minMovePercent: 0.015,  // 1.5% for reversals, 2% for continuations
    bodyRatio: 0.6,         // Body > 60% of range
    atrMultiple: 0.5        // Body > 0.5 ATR
  });

  // Phase 2: Detect pause zone (consolidation)
  const pause = this.detectPauseZone(candles, move1.endIdx, atr, {
    minCandles: 2,
    maxCandles: 6,
    maxWidth: 0.015,        // Zone width < 1.5% of price
    bodyRatio: 0.7          // Body < 0.7 ATR
  });

  // Phase 3: Detect second impulsive move
  const move2 = this.detectImpulsiveMove(candles, pause.endIdx, expectedDir);

  return { move1, pause, move2 };
}
```

### 2.3 Confidence Calculation

```javascript
// Base confidence + Odds Enhancers (0-16 max score)
calculateConfidence(pattern, candles, atr) {
  let baseScore = 50;

  // 8 Odds Enhancers (2 points each = 16 max)
  const enhancers = {
    departureStrength: this.scoreDepartureStrength(pattern),    // 0-2
    timeAtLevel: this.scoreTimeAtLevel(pattern.pauseCandles),   // 0-2
    freshness: 2,  // Always 2 for new detections                // 0-2
    profitMargin: this.scoreProfitMargin(pattern),              // 0-2
    bigPicture: this.scoreBigPicture(pattern, htfTrend),        // 0-2
    zoneOrigin: pattern.isReversal ? 2 : 1,                     // 0-2
    arrival: this.scoreArrival(pattern, atr),                   // 0-2
    riskReward: this.scoreRiskReward(pattern)                   // 0-2
  };

  const totalScore = Object.values(enhancers).reduce((a, b) => a + b, 0);

  // Final confidence = 50 + (score × 3), capped at 95
  return Math.min(95, baseScore + (totalScore * 3));
}
```

### 2.4 Entry/SL/TP Calculation

```javascript
// File: zoneCalculator.js

// GEM Method Zone Rules:
// HFZ (Supply/SHORT): Entry = LOW of pause, SL = HIGH of pause
// LFZ (Demand/LONG): Entry = HIGH of pause, SL = LOW of pause

calculateZoneBoundaries(pauseCandles, zoneType, currentPrice) {
  const pauseHigh = Math.max(...pauseCandles.map(c => c.high));
  const pauseLow = Math.min(...pauseCandles.map(c => c.low));
  const zoneWidth = pauseHigh - pauseLow;

  if (zoneType === 'HFZ') {
    return {
      entryPrice: pauseLow,           // Near price (closer to current)
      stopLossPrice: pauseHigh * 1.005, // Far price + 0.5% buffer
      direction: 'SHORT'
    };
  } else { // LFZ
    return {
      entryPrice: pauseHigh,          // Near price
      stopLossPrice: pauseLow * 0.995, // Far price - 0.5% buffer
      direction: 'LONG'
    };
  }
}

// Target calculation (R:R based)
calculateTargets(entry, stopLoss, direction) {
  const risk = Math.abs(entry - stopLoss);

  if (direction === 'LONG') {
    return {
      target1: entry + (risk * 2),  // 1:2 R:R
      target2: entry + (risk * 3),  // 1:3 R:R
    };
  } else { // SHORT
    return {
      target1: entry - (risk * 2),
      target2: entry - (risk * 3),
    };
  }
}
```

---

## 3. MULTI-TIMEFRAME ANALYSIS

### 3.1 Tier Access Control

```javascript
// File: multiTimeframeScanner.js

const MTF_ACCESS = {
  FREE: { hasAccess: false, maxTimeframes: 1 },
  TIER1: { hasAccess: false, maxTimeframes: 1 },
  TIER2: { hasAccess: true, maxTimeframes: 3, allowed: ['15m', '1h', '4h', '1d', '1w'] },
  TIER3: { hasAccess: true, maxTimeframes: 5, allowed: ['5m', '15m', '1h', '4h', '1d', '1w', '1M'] },
  ADMIN: { hasAccess: true, maxTimeframes: 7, allowed: ['1m', '5m', '15m', '1h', '4h', '1d', '1w', '1M'] }
};
```

### 3.2 Two-Phase Scanning

```javascript
async scanMultipleTimeframes(symbol, timeframes, userTier, options = {}) {
  // PHASE 1: HTF Analysis (Daily, Weekly, Monthly)
  const htfTimeframes = timeframes.filter(tf => ['1d', '1w', '1M'].includes(tf));
  const htfResults = await this.scanHTF(symbol, htfTimeframes);
  const htfTrend = this.determineHTFTrend(htfResults);

  // PHASE 2: LTF Analysis with HTF Context
  const ltfTimeframes = timeframes.filter(tf => !['1d', '1w', '1M'].includes(tf));
  const ltfResults = await this.scanLTF(symbol, ltfTimeframes, {
    htfTrend,
    htfZones: htfResults.zones
  });

  return {
    results: [...htfResults.patterns, ...ltfResults.patterns],
    htfContext: htfTrend,
    confluence: this.calculateConfluence(htfResults, ltfResults)
  };
}
```

### 3.3 Timeframe Strength Weights

```javascript
const TIMEFRAME_STRENGTH = {
  '1M':  { weight: 100, reliability: 0.95 },
  '1w':  { weight: 90,  reliability: 0.90 },
  '1d':  { weight: 80,  reliability: 0.85 },
  '4h':  { weight: 65,  reliability: 0.75 },
  '1h':  { weight: 50,  reliability: 0.65 },
  '15m': { weight: 25,  reliability: 0.50 },
  '5m':  { weight: 15,  reliability: 0.40 },
  '1m':  { weight: 10,  reliability: 0.30 }
};

// Combined score formula
const combinedScore = (patternStrength * 0.6) + (timeframeWeight * 0.4);
const adjustedWinRate = baseWinRate * (timeframeReliability / 100);
```

---

## 4. ZONE CALCULATION & MANAGEMENT

### 4.1 Zone Manager - Lifecycle

```javascript
// File: zoneManager.js

const ZONE_STATES = {
  FRESH: { strength: 100, description: 'Never tested' },
  TESTED_1X: { strength: 80, description: 'Touched once' },
  TESTED_2X: { strength: 60, description: 'Touched twice' },
  TESTED_3X_PLUS: { strength: 40, description: 'Tested 3+ times' },
  BROKEN: { strength: 0, description: 'Price exceeded zone' },
  EXPIRED: { strength: 0, description: '30+ days old' }
};
```

### 4.2 Pattern to Zone Conversion

```javascript
// File: zoneManager.js

_patternToZone(pattern, symbol, timeframe, userId) {
  const isLong = pattern.direction === 'LONG';
  const zoneType = isLong ? 'LFZ' : 'HFZ';

  // Extract prices
  const entry = parseFloat(pattern.entry || pattern.entryPrice || 0);
  const stopLoss = parseFloat(pattern.stopLoss || pattern.stop_loss || 0);

  // ✅ CRITICAL: Direction-aware zone bounds
  // LONG (LFZ): entry = top, SL = bottom
  // SHORT (HFZ): SL = top, entry = bottom
  const zoneHigh = isLong ? entry : stopLoss;
  const zoneLow = isLong ? stopLoss : entry;

  // Calculate targets (1:2 and 1:3 R:R)
  const risk = Math.abs(entry - stopLoss);
  const target1 = isLong ? entry + (risk * 2) : entry - (risk * 2);
  const target2 = isLong ? entry + (risk * 3) : entry - (risk * 3);

  return {
    id: `zone-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    user_id: userId,
    symbol,
    timeframe,
    zone_type: zoneType,
    zone_high: zoneHigh,
    zone_low: zoneLow,
    entry_price: entry,
    stop_loss: stopLoss,
    target_1: target1,
    target_2: target2,
    pattern_type: pattern.patternType || pattern.type,
    pattern_id: pattern.pattern_id,
    confidence: pattern.confidence,
    status: 'FRESH',
    strength: 100,
    // ✅ CRITICAL: Time data for chart positioning
    start_time: pattern.startTime || pattern.start_time || pattern.formation_time,
    end_time: pattern.endTime || pattern.end_time,
    formation_time: pattern.formationTime || pattern.formation_time || pattern.startTime
  };
}
```

### 4.3 Zone Validation

```javascript
// Zone width validation
validateZoneWidth(zone, atr) {
  const widthRatio = (zone.zone_high - zone.zone_low) / atr;

  if (widthRatio < 0.3) return { valid: false, reason: 'Too thin' };
  if (widthRatio > 4.0) return { valid: false, reason: 'Too wide' };
  if (widthRatio <= 1.0) return { valid: true, quality: 'Excellent' };
  if (widthRatio <= 1.5) return { valid: true, quality: 'Good' };
  if (widthRatio <= 2.5) return { valid: true, quality: 'Acceptable' };
  return { valid: true, quality: 'Extended - needs LTF refinement' };
}
```

---

## 5. ZONE DRAWING - TradingChart

### 5.1 Overview

Zone drawing happens in `TradingChart.js` using HTML5 Canvas overlay on top of the LightweightCharts WebView.

### 5.2 Zone Data Flow to Chart

```javascript
// ScannerScreen.js passes zones prop to TradingChart
<TradingChart
  symbol={displayCoin}
  timeframe={selectedTimeframe}
  zones={(() => {
    let resultZones = [];

    // 1. Position zones (from open positions)
    if (showPositionZone && selectedPosition && zoneViewSource !== 'scan') {
      // Create zone from position data
      resultZones.push(positionZone);
    }

    // 2. Scan result zones
    if (showZones && zoneDisplayMode !== 'hidden' && zoneViewSource !== 'position') {
      const coinZones = zones.filter(z => z.symbol === displayCoin);
      resultZones = [...resultZones, ...coinZones];
    }

    return resultZones;
  })()}
/>
```

### 5.3 Core Drawing Function

```javascript
// File: TradingChart.js - drawZonesOnCanvas()

function drawZonesOnCanvas() {
  if (!zoneCanvas || !zoneCtx || !chart || !candleSeries) return;
  if (activeZones.length === 0) return;

  const timeScale = chart.timeScale();
  const priceScaleWidth = 55;

  // Clear canvas
  zoneCtx.clearRect(0, 0, rect.width, rect.height);

  activeZones.forEach((zone, idx) => {
    // ═══════════════════════════════════════════════════════════
    // STEP 1: Get timestamp for X positioning
    // ═══════════════════════════════════════════════════════════
    let startTime = zone.start_time || zone.startTime || zone.formation_time;
    let endTime = zone.end_time || zone.endTime;

    // Convert ms to seconds if needed
    if (startTime > 9999999999) startTime = Math.floor(startTime / 1000);
    if (endTime > 9999999999) endTime = Math.floor(endTime / 1000);

    // ═══════════════════════════════════════════════════════════
    // STEP 2: Get X coordinates from time
    // ═══════════════════════════════════════════════════════════
    let x1 = timeScale.timeToCoordinate(startTime);

    // ⚠️ FALLBACK: If x1 is null (time outside visible range)
    // Position zone at 8 candles from right edge
    if (x1 === null && lastCandleData?.length > 0) {
      const fallbackIndex = Math.max(0, lastCandleData.length - 8);
      const fallbackCandle = lastCandleData[fallbackIndex];
      if (fallbackCandle?.time) {
        startTime = fallbackCandle.time;
        x1 = timeScale.timeToCoordinate(startTime);
      }
    }

    if (x1 === null) return; // Skip if still null

    // ═══════════════════════════════════════════════════════════
    // STEP 3: Calculate zone width
    // ═══════════════════════════════════════════════════════════
    let x2 = endTime ? timeScale.timeToCoordinate(endTime) : null;
    let width = x2 !== null ? (x2 - x1) : 120; // Default 120px
    width = Math.max(40, Math.min(180, width)); // Clamp 40-180px

    // ═══════════════════════════════════════════════════════════
    // STEP 4: Determine direction from Entry vs SL
    // ═══════════════════════════════════════════════════════════
    const entry = parseFloat(zone.entry_price || zone.entryPrice || 0);
    const sl = parseFloat(zone.stop_loss || zone.stopLoss || 0);

    // ✅ CORRECT RULE: SL > Entry = SHORT, SL < Entry = LONG
    const isShort = sl > 0 && sl > entry;

    // ═══════════════════════════════════════════════════════════
    // STEP 5: Get Y coordinates from prices
    // ═══════════════════════════════════════════════════════════
    const entryY = candleSeries.priceToCoordinate(entry);
    const slY = sl > 0 ? candleSeries.priceToCoordinate(sl) : null;

    // Calculate TP (1:2 R:R if not provided)
    let tp = parseFloat(zone.take_profit || zone.target_1 || 0);
    if (!tp || tp <= 0) {
      const risk = Math.abs(entry - sl);
      tp = isShort ? entry - (risk * 2) : entry + (risk * 2);
    }
    const tpY = tp > 0 ? candleSeries.priceToCoordinate(tp) : null;

    // ═══════════════════════════════════════════════════════════
    // STEP 6: Draw zone rectangles and lines
    // ═══════════════════════════════════════════════════════════
    if (isShort) {
      // SHORT: SL zone (red) above entry, TP zone (green) below
      // 1. Draw SL zone (dark red)
      if (slY !== null && slY < entryY) {
        zoneCtx.fillStyle = 'rgba(139, 0, 0, 0.30)';
        zoneCtx.fillRect(x1, slY, width, entryY - slY);
      }

      // 2. Draw Entry line (cyan)
      zoneCtx.fillStyle = '#00FFFF';
      zoneCtx.fillRect(x1, entryY - 1, width, 2);
      zoneCtx.fillText('Bán ' + formatPrice(entry), x1 + 4, entryY - 6);

      // 3. Draw TP zone (dark green)
      if (tpY !== null && tpY > entryY) {
        zoneCtx.fillStyle = 'rgba(0, 100, 0, 0.30)';
        zoneCtx.fillRect(x1, entryY, width, tpY - entryY);
      }
    } else {
      // LONG: TP zone (green) above entry, SL zone (red) below
      // 1. Draw TP zone (dark green)
      if (tpY !== null && tpY < entryY) {
        zoneCtx.fillStyle = 'rgba(0, 100, 0, 0.30)';
        zoneCtx.fillRect(x1, tpY, width, entryY - tpY);
      }

      // 2. Draw Entry line (cyan)
      zoneCtx.fillStyle = '#00FFFF';
      zoneCtx.fillRect(x1, entryY - 1, width, 2);
      zoneCtx.fillText('Mua ' + formatPrice(entry), x1 + 4, entryY - 6);

      // 3. Draw SL zone (dark red)
      if (slY !== null && slY > entryY) {
        zoneCtx.fillStyle = 'rgba(139, 0, 0, 0.30)';
        zoneCtx.fillRect(x1, entryY, width, slY - entryY);
      }
    }
  });
}
```

### 5.4 Zone Colors

```javascript
// Zone fill colors
const DARK_RED = 'rgba(139, 0, 0, 0.30)';    // SL zone
const DARK_GREEN = 'rgba(0, 100, 0, 0.30)';  // TP zone
const CYAN_ENTRY = '#00FFFF';                 // Entry line

// Selected state (brighter)
const SELECTED_RED = 'rgba(180, 30, 30, 0.50)';
const SELECTED_GREEN = 'rgba(30, 130, 30, 0.50)';

// Dimmed state (when another zone selected)
const DIMMED_ALPHA = 0.10;
```

---

## 6. ZONE DRAWING - ScannerScreen

### 6.1 Zone View Source State

```javascript
// File: ScannerScreen.js

// State để track nguồn zone: 'position' | 'scan' | null
const [zoneViewSource, setZoneViewSource] = useState(null);

// Khi click position → chỉ hiện position zone
onViewChart={(symbol, position) => {
  setSelectedPosition(position);
  setShowPositionZone(true);
  setZoneViewSource('position');  // ← Mark source
  setSelectedTimeframe(position.patternData?.timeframe || selectedTimeframe);
}}

// Khi scan → chỉ hiện scan zones
handleScan = async () => {
  setSelectedPosition(null);
  setShowPositionZone(false);
  setZoneViewSource('scan');  // ← Mark source
  // ... scan logic
}

// Khi click scan result → chỉ hiện scan zones
handleSelectFromResults = (symbol) => {
  setSelectedPosition(null);
  setShowPositionZone(false);
  setZoneViewSource('scan');  // ← Mark source
}
```

### 6.2 Position Zone Creation

```javascript
// File: ScannerScreen.js - trong zones={...} của TradingChart

if (showPositionZone && selectedPosition && zoneViewSource !== 'scan') {
  const pd = selectedPosition.patternData || {};

  // Extract prices from position
  const entry = parseFloat(selectedPosition.entryPrice || pd.entry || 0);
  const sl = parseFloat(selectedPosition.stopLoss || pd.stopLoss || 0);
  const tp = parseFloat(selectedPosition.takeProfit || pd.take_profit || 0);
  const isLong = selectedPosition.direction === 'LONG';

  // Calculate zone bounds
  let zoneHigh = pd.zone_high || (isLong ? entry : sl);
  let zoneLow = pd.zone_low || (isLong ? sl : entry);

  // ✅ CRITICAL: Get formation time for correct positioning
  const formationTime = pd.formation_time || pd.formationTime ||
                        pd.start_time || pd.startTime;
  const openedAt = selectedPosition.openedAt || selectedPosition.created_at;

  let startTime = formationTime;
  if (!startTime && openedAt) {
    startTime = typeof openedAt === 'string'
      ? Math.floor(new Date(openedAt).getTime() / 1000)
      : Math.floor(openedAt / 1000);
  }

  // Convert ms to seconds
  if (startTime > 9999999999) startTime = Math.floor(startTime / 1000);

  const positionZone = {
    id: `position-${selectedPosition.id}`,
    pattern_id: `position-${selectedPosition.id}`,
    symbol: selectedPosition.symbol,
    direction: selectedPosition.direction,
    zone_high: zoneHigh,
    zone_low: zoneLow,
    entry_price: entry,
    stop_loss: sl,
    take_profit: tp,
    // ✅ ALL time variants for TradingChart compatibility
    start_time: startTime,
    startTime: startTime,
    formation_time: startTime,
    formationTime: startTime,
    end_time: pd.end_time || pd.endTime,
    endTime: pd.endTime || pd.end_time,
    isPositionZone: true,
    positionId: selectedPosition.id
  };

  resultZones.push(positionZone);
}
```

### 6.3 Scan Result Zone Filtering

```javascript
// File: ScannerScreen.js

if (showZones && zoneDisplayMode !== 'hidden' && zoneViewSource !== 'position') {
  // Filter zones for current coin
  const coinZones = zones.filter(z => z.symbol === displayCoin);

  if (zoneDisplayMode === 'all') {
    resultZones = [...resultZones, ...coinZones];
  } else if (zoneDisplayMode === 'selected' && selectedZonePatternId) {
    // Show only selected zone
    const filtered = coinZones.filter(z =>
      z.pattern_id === selectedZonePatternId ||
      z.metadata?.patternData?.pattern_id === selectedZonePatternId
    );
    resultZones = [...resultZones, ...filtered];
  }
}
```

---

## 7. ZONE DRAWING - PatternDetailScreen

### 7.1 Zone Creation for Detail View

```javascript
// File: PatternDetailScreen.js

useEffect(() => {
  if (!pattern?.symbol) return;

  setLoadingZone(true);

  // ✅ Get formation_time from pattern
  const formationTime = pattern.formation_time || pattern.formationTime ||
                        pattern.start_time || pattern.startTime ||
                        pattern.openedAt;

  // Create zone from pattern data
  if (pattern.zone_high && pattern.zone_low) {
    setZoneData({
      zone_high: pattern.zone_high,
      zone_low: pattern.zone_low,
      entry_price: pattern.entry || pattern.entryPrice,
      stop_loss: pattern.stopLoss || pattern.stop_loss,
      take_profit: pattern.target || pattern.target_1,
      direction: pattern.direction,
      type: pattern.direction === 'LONG' ? 'LFZ' : 'HFZ',
      isPositionZone: fromPosition,
      formation_time: formationTime,
      start_time: formationTime
    });
  } else if (pattern.entry && pattern.stopLoss) {
    // Calculate zone from entry/SL
    const isLong = pattern.direction === 'LONG';
    setZoneData({
      zone_high: isLong ? pattern.entry : pattern.stopLoss,
      zone_low: isLong ? pattern.stopLoss : pattern.entry,
      entry_price: pattern.entry,
      stop_loss: pattern.stopLoss,
      take_profit: pattern.target,
      direction: pattern.direction,
      type: isLong ? 'LFZ' : 'HFZ',
      isPositionZone: fromPosition,
      formation_time: formationTime,
      start_time: formationTime
    });
  }

  setLoadingZone(false);
}, [pattern]);
```

### 7.2 Passing Zone to Chart

```javascript
// File: PatternDetailScreen.js

<TradingChart
  symbol={pattern?.symbol || 'BTCUSDT'}
  timeframe={pattern?.timeframe || '4h'}  // ✅ Use pattern's original TF
  height={350}
  selectedPattern={chartPattern}
  zones={zoneData ? [zoneData] : []}      // ✅ Single zone array
/>
```

---

## 8. KEY CODE SNIPPETS

### 8.1 Pattern ID Generation

```javascript
// File: ScannerScreen.js - handleScan()

const generatePatternId = (p) => {
  // Format: symbol_type_timeframe_entry_sl
  const entryVal = parseFloat(p.entry || p.entryPrice || 0) || 0;
  const slVal = parseFloat(p.stopLoss || p.stop_loss || 0) || 0;
  const entry = entryVal.toFixed(6);
  const sl = slVal.toFixed(6);
  const patternName = p.patternType || p.name || p.type || 'unknown';
  return `${p.symbol}_${patternName}_${p.timeframe || selectedTimeframe}_${entry}_${sl}`;
};
```

### 8.2 Paper Trade Pattern Enrichment

```javascript
// File: ScannerScreen.js - handlePaperTrade()

const handlePaperTrade = (pattern) => {
  let enrichedPattern = { ...pattern };

  // Find matching zone
  const patternId = pattern.pattern_id || pattern.id;
  if (patternId && zones.length > 0) {
    const matchingZone = zones.find(z =>
      z.pattern_id === patternId ||
      z.metadata?.patternData?.pattern_id === patternId
    );

    if (matchingZone) {
      enrichedPattern = {
        ...enrichedPattern,
        zone_high: matchingZone.zone_high,
        zone_low: matchingZone.zone_low,
        start_time: matchingZone.start_time,
        startTime: matchingZone.startTime,
        formation_time: matchingZone.formation_time,
        formationTime: matchingZone.formationTime,
        end_time: matchingZone.end_time,
        endTime: matchingZone.endTime
      };
    }
  }

  // Ensure all time variants exist
  const patternStartTime = enrichedPattern.start_time || enrichedPattern.startTime ||
                           enrichedPattern.formation_time || enrichedPattern.formationTime ||
                           pattern.start_time || pattern.startTime;
  if (patternStartTime) {
    enrichedPattern.start_time = patternStartTime;
    enrichedPattern.startTime = patternStartTime;
    enrichedPattern.formation_time = patternStartTime;
    enrichedPattern.formationTime = patternStartTime;
  }

  setSelectedPattern(enrichedPattern);
  setPaperTradeModalVisible(true);
};
```

### 8.3 Paper Trade Service - Pattern Data Storage

```javascript
// File: paperTradeService.js - openPosition()

patternData: {
  ...pattern,
  symbol: pattern.symbol,
  type: pattern.type || pattern.patternType,
  timeframe: pattern.timeframe,
  direction: pattern.direction,
  entry: pattern.entry || pattern.entry_price,
  stopLoss: pattern.stopLoss || pattern.stop_loss,
  take_profit: pattern.take_profit || pattern.target,
  zone_high: pattern.zone_high || pattern.zoneHigh,
  zone_low: pattern.zone_low || pattern.zoneLow,
  // ✅ ALL time variants for zone positioning
  start_time: pattern.start_time || pattern.startTime || pattern.formation_time,
  startTime: pattern.startTime || pattern.start_time || pattern.formationTime,
  formation_time: pattern.formation_time || pattern.formationTime || pattern.start_time,
  formationTime: pattern.formationTime || pattern.formation_time || pattern.startTime,
  end_time: pattern.end_time || pattern.endTime,
  endTime: pattern.endTime || pattern.end_time,
  pattern_id: pattern.pattern_id || pattern.id,
  confidence: pattern.confidence
}
```

---

## 9. TROUBLESHOOTING GUIDE

### 9.1 Zone hiển thị sai vị trí (gần candle hiện tại)

**Nguyên nhân:** `formation_time`/`start_time` không có hoặc nằm ngoài visible range của chart.

**Giải pháp:**
1. Đảm bảo pattern có `start_time`/`formation_time` khi detect
2. Khi click position, set timeframe về đúng TF của pattern:
```javascript
onViewChart={(symbol, position) => {
  const patternTimeframe = position.patternData?.timeframe || position.timeframe;
  if (patternTimeframe) setSelectedTimeframe(patternTimeframe);
}}
```

### 9.2 Zone bị trộn lẫn (Position + Scan zones)

**Nguyên nhân:** Không có state track nguồn zone.

**Giải pháp:**
```javascript
const [zoneViewSource, setZoneViewSource] = useState(null);

// Position zones: zoneViewSource !== 'scan'
// Scan zones: zoneViewSource !== 'position'
```

### 9.3 Zone không hiện trên chart

**Check list:**
1. `zones` array có data không? (console.log)
2. `zone.entry_price` và `zone.stop_loss` có giá trị hợp lệ?
3. `candleSeries.priceToCoordinate()` có return null?
4. `timeScale.timeToCoordinate()` có return null?
5. Zone có bị skip vì `left > maxRight`?

### 9.4 Direction sai (Mua/Bán ngược)

**Rule:** SL position quyết định direction:
- SL > Entry → SHORT (Bán)
- SL < Entry → LONG (Mua)

```javascript
const isShort = slForDir > 0 && slForDir > entryForDir;
```

### 9.5 Zone width quá hẹp/rộng

**Constraints trong TradingChart:**
```javascript
if (width < 40) width = 40;   // Minimum
if (width > 180) width = 180; // Maximum
```

---

## APPENDIX: Important Constants

```javascript
// Pattern Detection
MIN_CANDLES = 30;
ZONE_TOLERANCE = 0.03;  // 3%
MIN_MOVE_PERCENT_REVERSAL = 0.015;  // 1.5%
MIN_MOVE_PERCENT_CONTINUATION = 0.02;  // 2%

// Zone Validation
ZONE_BREAK_BUFFER = 0.005;  // 0.5%
ZONE_EXPIRY_DAYS = 30;
MIN_ZONE_WIDTH_RATIO = 0.3;  // × ATR
MAX_ZONE_WIDTH_RATIO = 4.0;  // × ATR

// Chart Drawing
ZONE_MIN_WIDTH_PX = 40;
ZONE_MAX_WIDTH_PX = 180;
FALLBACK_CANDLES_FROM_RIGHT = 8;

// Confidence
MIN_CONFIDENCE = 35;
MAX_CONFIDENCE = 95;
BASE_CONFIDENCE = 50;
ODDS_ENHANCER_MULTIPLIER = 3;

// R:R Targets
DEFAULT_RR_RATIO = 2.0;
MIN_RR_RATIO = 1.5;
```

---

**END OF DOCUMENTATION**

*File này là single source of truth cho pattern detection và zone drawing. Khi gặp lỗi, reference file này để hiểu logic hiện tại và copy paste code snippets để recreate chính xác các tính năng.*
