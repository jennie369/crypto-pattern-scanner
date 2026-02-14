# GEM Mobile - Scanner/Trading Tab
# COMPLETE FEATURE SPECIFICATION

**Version:** 4.1
**Last Updated:** 2026-02-14
**Platform:** React Native (Expo)
**Author:** GEM Development Team

---

# GIỚI THIỆU TÍNH NĂNG - TRADING SCANNER

## Tổng Quan

**GEM Scanner** là công cụ quét và phân tích mẫu hình kỹ thuật (chart patterns) tự động dành cho trader crypto. Tính năng này giúp người dùng phát hiện cơ hội giao dịch tiềm năng trên hơn 500+ cặp tiền điện tử, với độ chính xác cao và tốc độ xử lý nhanh chóng.

### Dành Cho Ai?

- **Trader mới bắt đầu**: Học cách nhận diện mẫu hình qua các pattern được AI phát hiện
- **Trader có kinh nghiệm**: Tiết kiệm thời gian quét thị trường, tập trung vào phân tích và ra quyết định
- **Day Trader & Swing Trader**: Theo dõi nhiều coin cùng lúc trên nhiều khung thời gian
- **Paper Trader**: Luyện tập chiến lược không rủi ro với vốn giả lập

---

## Lợi Ích Chính

### 1. Phát Hiện Mẫu Hình Tự Động
- **24+ mẫu hình kỹ thuật** được hỗ trợ: Head & Shoulders, Double Top/Bottom, Flag, Wedge, Triangle, và nhiều hơn nữa
- **GEM Frequency Method**: Phương pháp Move-Pause-Move độc quyền (DPD/UPU/DPU/UPD)
- **Zone Hierarchy**: DP > FTR > FL > Regular (xếp hạng độ mạnh zone)
- **8 Odds Enhancers**: Hệ thống chấm điểm chất lượng zone (0-16 điểm)
- **Tự động tính Entry, Stop Loss, Take Profit** - không cần tính toán thủ công

### 2. Quét Đa Coin & Đa Khung Thời Gian
- **500+ cặp USDT Perpetual** từ Binance Futures
- **8 khung thời gian**: 1m, 5m, 15m, 30m, 1h, 4h, 1D, 1W
- **Multi-Timeframe Confluence** (TIER2+): Xác nhận tín hiệu trên nhiều TF cùng lúc
- **Batch scanning**: Quét tối đa 1000 coin song song, cho kết quả trong vài giây

### 3. Paper Trading - Giao Dịch Giả Lập
- **Vốn giả lập $10,000 USDT** để luyện tập không rủi ro
- **Đòn bẩy linh hoạt**: 1x đến 125x (tùy theo tier)
- **Theo dõi P&L thời gian thực** với giá live từ Binance
- **Tự động đóng lệnh** khi chạm Take Profit hoặc Stop Loss
- **Lịch sử giao dịch đầy đủ** với thống kê win rate, tổng P&L

### 4. Hai Chế Độ Giao Dịch

#### Pattern Mode (Chế Độ GEM AI)
- Entry/SL/TP được **tối ưu hóa bởi AI** - không cần chỉnh sửa
- Lệnh **MARKET** - khớp ngay lập tức
- Phù hợp cho người mới hoặc muốn theo 100% tín hiệu AI

#### Custom Mode (Chế Độ Tùy Chỉnh)
- **Tự điều chỉnh** Entry, Stop Loss, Take Profit theo ý muốn
- **Lệnh LIMIT** nếu Entry khác giá thị trường (chờ khớp)
- **AI Score** đánh giá chất lượng setup của bạn (0-100 điểm)
- Phù hợp cho trader có chiến lược riêng

### 5. Công Cụ Vẽ Chart Chuyên Nghiệp
- **6 công cụ vẽ**: Đường ngang, Đường xu hướng, Chữ nhật, Fibonacci, Long/Short Position
- **Magnet Mode**: Tự động bắt dính vào giá OHLC của nến
- **Lưu trữ cloud**: Các đường vẽ được lưu và sync giữa các thiết bị
- **Hiển thị theo timeframe**: Tùy chọn hiển thị vẽ trên một hoặc nhiều khung thời gian

### 6. Các Tính Năng Nâng Cao (TIER2/TIER3)
- **Confluence Score**: Điểm hội tụ tín hiệu đa timeframe
- **Volume Confirmation**: Xác nhận khối lượng
- **Trend Alignment**: Đánh giá xu hướng lớn
- **RSI Divergence**: Phát hiện phân kỳ RSI
- **Quality Grade**: Xếp hạng chất lượng pattern (A+, A, B+, B, C, D)
- **Enhancement Stats**: Thống kê chi tiết về độ mạnh của setup

---

## Bảng So Sánh Các Gói

| Tính Năng | FREE | TIER1 | TIER2 | TIER3 |
|-----------|------|-------|-------|-------|
| Số mẫu hình | 3 | 7 | 15 | **24+** |
| Coin/lần quét | 1 | 5 | 20 | **Không giới hạn** |
| Khung thời gian | 1 | 1 | 3 | **5+** |
| Multi-TF Scan | ❌ | ❌ | ✅ | ✅ |
| Custom Mode | ❌ | ❌ | ✅ | ✅ |
| Pending Orders | ❌ | ❌ | ✅ | ✅ |
| Enhancement Stats | ❌ | ❌ | ✅ | ✅ |
| Quality Grade | ❌ | ❌ | ✅ | ✅ |
| Drawing Tools | ✅ | ✅ | ✅ | ✅ |
| Paper Trading | ✅ | ✅ | ✅ | ✅ |
| Scan quota/ngày | 5 | 15 | 50 | **Không giới hạn** |
| Đòn bẩy tối đa | 10x | 20x | 50x | **125x** |

---

# TÀI LIỆU KỸ THUẬT CHI TIẾT

*Phần dưới đây dành cho developers và technical reference.*

---

## TABLE OF CONTENTS

1. [Executive Summary](#1-executive-summary)
2. [Architecture Overview](#2-architecture-overview)
3. [Pattern Detection Engine](#3-pattern-detection-engine)
4. [Zone Hierarchy System](#4-zone-hierarchy-system)
5. [Odds Enhancers Scoring](#5-odds-enhancers-scoring)
6. [Core Screens](#6-core-screens)
7. [Scanner Components](#7-scanner-components)
8. [Trading Components](#8-trading-components)
9. [Drawing Tools](#9-drawing-tools)
10. [Services & Business Logic](#10-services--business-logic)
11. [Design System](#11-design-system)
12. [User Flows](#12-user-flows)
13. [Data Structures](#13-data-structures)
14. [Trading Modes](#14-trading-modes)
15. [Tier Access Control](#15-tier-access-control)
16. [Real-time Features](#16-real-time-features)
17. [Error Handling](#17-error-handling)
18. [Performance Optimizations](#18-performance-optimizations)
19. [File Manifest](#19-file-manifest)

---

## 1. EXECUTIVE SUMMARY

### 1.1 Overview
The Scanner/Trading tab is the core trading interface of GEM Mobile, enabling users to:
- Detect technical patterns across 500+ cryptocurrency pairs using the GEM Frequency Method
- Execute paper trades with simulated capital (Pattern Mode & Custom Mode)
- Track portfolio performance in real-time
- Analyze multi-timeframe confluence (TIER2+)
- Draw annotations on charts (horizontal lines, trend lines, Fibonacci, positions)
- Manage pending limit orders

### 1.2 Key Features
| Feature | Description |
|---------|-------------|
| Pattern Detection | GEM Frequency Method + 24 technical patterns |
| Zone Hierarchy | DP > FTR > FL > Regular classification |
| 8 Odds Enhancers | Zone quality scoring (0-16 points) |
| Multi-Coin Scanning | Scan up to 1000 coins in parallel batches |
| Paper Trading | Simulated trading with configurable capital |
| Pending Orders | Limit orders that fill when price reaches entry |
| Real-time P&L | Live price updates via Binance WebSocket |
| Multi-Timeframe | Confluence scoring across 5+ timeframes |
| Drawing Tools | 6 chart annotation tools with persistence |
| Custom Mode | User-defined entry/SL/TP with AI scoring |
| Tier-based Access | Feature gating by subscription level |

### 1.3 Technology Stack
- **Frontend:** React Native + Expo
- **Charts:** lightweight-charts v4.1.0 (WebView)
- **API:** Binance FUTURES & SPOT REST/WebSocket
- **Storage:** AsyncStorage (local) + Supabase (sync)
- **State:** React Context (ScannerContext, AuthContext)

---

## 2. ARCHITECTURE OVERVIEW

### 2.1 Component Hierarchy
```
ScannerScreen (Main Tab)
├── CoinSelector
│   ├── SearchInput
│   ├── TabButtons (All | Favorites | Recent)
│   ├── CoinList
│   └── ActionButtons
├── TradingChart
│   ├── ChartToolbar
│   │   ├── TimeframeButtons
│   │   ├── VolumeToggle
│   │   ├── DrawingToggle
│   │   └── ZoomControls
│   ├── DrawingToolbar
│   │   ├── ToolButtons (6 tools)
│   │   ├── MagnetToggle
│   │   └── DeleteAll
│   ├── WebView (lightweight-charts)
│   └── PriceLines (Entry/SL/TP)
├── ScanResultsSection
│   ├── StatsHeader
│   ├── FilterToggle
│   └── CoinAccordion[]
│       └── PatternCard[]
├── MultiTFResultsSection (TIER2+)
│   ├── ConfluenceHeader
│   └── TimeframeGroup[]
├── PaperTradeModal
│   ├── TradeTypeSelector
│   ├── PositionSizing
│   ├── PriceLevels
│   ├── Calculations
│   └── SubmitButton
└── SponsorBanners
```

### 2.2 Data Flow
```
User Action → Service Layer → API/Storage → State Update → UI Re-render

Scan Flow:
1. User clicks "Scan Now"
2. patternDetection.detectPatterns() called
3. binanceService.getKlines() fetches candles
4. GEM Frequency Method + pattern algorithms analyze data
5. Zone hierarchy and odds enhancers calculated
6. Results stored in ScannerContext
7. UI updates with patterns (sorted by strength + hierarchy)

Paper Trade Flow:
1. User opens PaperTradeModal
2. Enters position size, leverage
3. paperTradeService.openPosition() called
4. Position stored locally + synced to Supabase
5. Real-time P&L tracking begins
6. Auto-close on SL/TP hit
```

---

## 3. PATTERN DETECTION ENGINE

### 3.1 GEM Frequency Method (Core Engine)
**Path:** `gem-mobile/src/services/patternDetection.js`

The GEM Frequency Method is the core pattern detection algorithm based on the Move-Pause-Move structure.

#### 3.1.1 Core Patterns
| Pattern | Structure | Zone Type | Direction | Win Rate | R:R |
|---------|-----------|-----------|-----------|----------|-----|
| **UPD** | Up→Pause→Down | HFZ (Supply) | SHORT | 65% | 2.2 |
| **DPU** | Down→Pause→Up | LFZ (Demand) | LONG | 69% | 2.6 |
| **DPD** | Down→Pause→Down | HFZ | SHORT | 68% | 2.5 |
| **UPU** | Up→Pause→Up | LFZ | LONG | 71% | 2.8 |

#### 3.1.2 Zone Types
| Zone | Full Name | Trading Bias | Entry Rule | Stop Rule |
|------|-----------|--------------|------------|-----------|
| **HFZ** | High Frequency Zone (Supply) | SELL | Entry = LOW of pause | Stop = HIGH of pause |
| **LFZ** | Low Frequency Zone (Demand) | BUY | Entry = HIGH of pause | Stop = LOW of pause |

#### 3.1.3 Detection Algorithm
```javascript
// Core GEM Pattern Detection (patternDetection.js)
findGEMPattern(candles, type) {
  // Phase 1: Detect Impulsive Move
  const move1 = detectImpulsiveMove(candles, lookback, type);
  // Requirements:
  // - Minimum 2% move for continuation
  // - Minimum 1.5% for reversal
  // - >= 2 consecutive candles in direction

  // Phase 2: Detect Pause Zone
  const pause = detectPauseZone(candles, move1EndIndex, maxPauseCandles);
  // Requirements:
  // - 2-6 candles maximum
  // - Total range < 1.5% of price
  // - Small body candles (consolidation)

  // Phase 3: Detect Continuation/Reversal Move
  const move2 = detectMove2(candles, pauseEndIndex, type);
  // Requirements:
  // - Confirms direction (DPD/UPU = same, DPU/UPD = opposite)
  // - Impulsive ratio check

  return { move1, pause, move2, zoneHigh, zoneLow };
}
```

### 3.2 Classic Patterns

#### 3.2.1 Head & Shoulders / Inverse H&S
| Pattern | Win Rate | R:R | Detection Logic |
|---------|----------|-----|-----------------|
| H&S | 72% | 3.0 | 3 peaks, head > shoulders by 10%, neckline break confirmation |
| IH&S | 75% | 3.0 | 3 troughs, head deeper by 10%, neckline break confirmation |

```javascript
// H&S Detection Requirements
- 3 swing highs (left shoulder, head, right shoulder)
- Head > Shoulders * 1.10 (10% higher)
- Shoulders within 3% of each other
- Neckline break confirmation (close below neckline)
- Entry: Neckline retest (not breakout)
- Stop: Above head
- Target: Measured move (head height projected from neckline)
```

#### 3.2.2 Double Top / Double Bottom
| Pattern | Win Rate | R:R | Detection Logic |
|---------|----------|-----|-----------------|
| Double Top | 68% | 2.5 | 2 peaks within 2%, trough depth >= 3%, min 5 candles between |
| Double Bottom | 70% | 2.7 | 2 troughs within 2%, peak height >= 3%, min 5 candles between |

### 3.3 Continuation Patterns

#### Bull/Bear Flag
```javascript
// Flag Detection Requirements
- Pole: >= 5% directional move
- Flag: Range < 3% of price
- Flag drifts counter to pole direction
- Entry: Breakout above/below flag boundary
- Target: Pole length projected from breakout
```

#### Triangles
| Pattern | Type | Entry | Target |
|---------|------|-------|--------|
| Ascending Triangle | Bullish | Breakout above flat resistance | Height of triangle |
| Descending Triangle | Bearish | Breakout below flat support | Height of triangle |
| Symmetrical Triangle | Neutral | Wait for breakout direction | Height of triangle |

#### Wedge
```javascript
// Wedge Detection
- Rising Wedge: Bearish (converging highs/lows, both rising)
- Falling Wedge: Bullish (converging highs/lows, both falling)
- Entry: Breakout opposite to wedge direction
- Target: Widest part of wedge
```

### 3.4 Advanced Patterns (Dedicated Detectors)

#### 3.4.1 Quasimodo (QM)
**Path:** `gem-mobile/src/services/quasimodoDetector.js`

```javascript
// QM Bullish Structure
Prior downtrend → LL (Head) → LH1 (QML) → HH → HL1 → Break of Structure

// Entry at QML retest
// Stop at MPL (Maximum Pain Level = Head)
// Win Rate: ~68%

// Key Detection Points:
- HEAD = lowest/highest point
- QML = first higher low / lower high (entry point)
- BOS = Break of Structure confirmation (HH/LL)
- MPL = Head level (stop loss reference)
```

#### 3.4.2 Fail To Return (FTR)
**Path:** `gem-mobile/src/services/ftrDetector.js`

```javascript
// FTR Bearish Structure
Price breaks resistance → Forms base above broken level →
"Fails to return" below → Creates HFZ

// Requirements:
- S/R break >= 0.5%
- Base stays beyond broken level
- Return distance < 30% of move
- New high/low confirmation
- FTB (First Time Back) = freshest zone
```

#### 3.4.3 Flag Limit (FL)
**Path:** `gem-mobile/src/services/flagLimitDetector.js`

```javascript
// Flag Limit = FTR with 1-2 candle base
// "Every FL is an FTR, but not every FTR is an FL"

// Requirements:
- Must be UPU (bullish) or DPD (bearish) pattern
- Base must have ONLY 1-2 candles
- Must be WITHIN existing trend (not at turning point)
- Pause range < 2x average candle range
```

#### 3.4.4 Decision Point (DP)
**Path:** `gem-mobile/src/services/decisionPointDetector.js`

```javascript
// DP = Origin of major impulsive move

// Requirements:
- Minimum move percent from origin (configurable)
- Move must be multiple of pause range (minMoveMultiple)
- Impulsive ratio check (% of candles in direction)
- Zone hierarchy level 1 (highest priority)
```

### 3.5 Candlestick Patterns

| Pattern | Direction | Detection | Win Rate |
|---------|-----------|-----------|----------|
| Bullish Engulfing | LONG | Current body > 1.5x previous, engulfs fully | 64% |
| Bearish Engulfing | SHORT | Current body > 1.5x previous, engulfs fully | 64% |
| Morning Star | LONG | 3-candle: down, small doji, up | 66% |
| Evening Star | SHORT | 3-candle: up, small doji, down | 66% |
| Hammer | LONG | Lower shadow > 2x body, small upper shadow, after downtrend | 62% |
| Shooting Star | SHORT | Upper shadow > 2x body, small lower shadow, after uptrend | 62% |
| Rising Three Methods | LONG | 5-candle: up, 3 small counter-trend within range, up | 67% |
| Falling Three Methods | SHORT | 5-candle: down, 3 small counter-trend within range, down | 67% |

### 3.6 Confirmation Patterns
**Path:** `gem-mobile/src/services/confirmationPatterns.js`

Confirmation patterns are detected AT zone touches to increase trade probability.

```javascript
// Scan for confirmation when price is near zone
scanConfirmationPatterns(candles, zone) {
  // Check last 5 candles for:
  - Engulfing (bullish/bearish)
  - Pin Bar (long wick rejection)
  - Hammer / Shooting Star
  - Doji at zone

  // Returns: { patterns, score, bestPattern }
}

// Confirmation boost: +10 confidence if confirmScore >= 5
```

---

## 4. ZONE HIERARCHY SYSTEM

**Path:** `gem-mobile/src/constants/zoneHierarchyConfig.js`

### 4.1 Hierarchy Levels
| Level | Name | Short | Strength | Color | Description |
|-------|------|-------|----------|-------|-------------|
| 1 | Decision Point | DP | ⭐⭐⭐⭐⭐ | #9C0612 (Burgundy) | Origin of major move - Strongest zone |
| 2 | Fail To Return | FTR | ⭐⭐⭐⭐ | #FFBD59 (Gold) | Zone after S/R break - Trend confirmation |
| 3 | Flag Limit | FL | ⭐⭐⭐ | #22C55E (Green) | Zone in trend with 1-2 candle base |
| 4 | Regular | REG | ⭐⭐ | #6B7280 (Gray) | Regular zone - Needs additional confluence |

### 4.2 Sorting Priority
Patterns are sorted by:
1. **Primary:** Pattern strength (stars) descending
2. **Secondary:** Zone hierarchy level ascending (DP=1 best)
3. **Tertiary:** Confidence descending

```javascript
// Sort implementation (patternDetection.js)
validPatterns.sort((a, b) => {
  // Primary: strength descending
  const strengthA = PATTERN_CONFIG[a.patternType]?.strength || 0;
  const strengthB = PATTERN_CONFIG[b.patternType]?.strength || 0;
  if (strengthB !== strengthA) return strengthB - strengthA;

  // Secondary: hierarchy ascending (1 best)
  const hierA = a.zoneHierarchyLevel || 4;
  const hierB = b.zoneHierarchyLevel || 4;
  if (hierA !== hierB) return hierA - hierB;

  // Tertiary: confidence descending
  return b.confidence - a.confidence;
});
```

### 4.3 Zone Hierarchy Display
```javascript
// ZoneHierarchyBadge component
const hierarchyConfig = {
  DECISION_POINT: { icon: 'Crown', color: '#9C0612' },
  FTR: { icon: 'Target', color: '#FFBD59' },
  FLAG_LIMIT: { icon: 'Flag', color: '#22C55E' },
  REGULAR: { icon: 'Circle', color: '#6B7280' },
};
```

---

## 5. ODDS ENHANCERS SCORING

**Path:** `gem-mobile/src/constants/oddsEnhancersConfig.js`

### 5.1 The 8 Odds Enhancers
Each criterion scores 0-2 points. Total max score: 16 points.

| # | Enhancer | Description | Score 0 | Score 1 | Score 2 |
|---|----------|-------------|---------|---------|---------|
| 1 | **Departure Strength** | How fast price left zone | Weak candle | Body >= 50% range | Body >= 70%, gap |
| 2 | **Time at Level** | Candles in pause zone | > 6 candles | 3-6 candles | 1-2 candles (fresh) |
| 3 | **Freshness** | Times zone tested | 3+ tests (stale) | 1-2 tests | FTB (never tested) |
| 4 | **Profit Margin** | Distance to opposing zone | < 2x width | 2-4x width | > 4x width |
| 5 | **Big Picture** | HTF trend alignment | Counter trend | Unknown/sideways | With trend |
| 6 | **Zone Origin** | Hierarchy classification | Regular | FTR/FL | DP/QM |
| 7 | **Arrival Speed** | How price arrived at zone | Fast/impulsive | Medium | Slow/grinding |
| 8 | **Risk/Reward** | R:R ratio to opposing zone | < 2:1 | 2-3:1 | >= 3:1 |

### 5.2 Grade Calculation
```javascript
// Grade based on total score (0-16)
const GRADE_THRESHOLDS = {
  'A+': { min: 14, color: '#00FF88' },
  'A':  { min: 12, color: '#00FF88' },
  'B+': { min: 10, color: '#FFBD59' },
  'B':  { min: 8,  color: '#FFBD59' },
  'C':  { min: 6,  color: '#FF9500' },
  'D':  { min: 0,  color: '#FF4757' },
};
```

### 5.3 Odds Calculation Logic
```javascript
// patternDetection.js - calculateOddsEnhancers()
calculateOddsEnhancers(pattern, candles, currentPrice) {
  const enhancers = {};

  // 1. Departure Strength
  if (pattern.departureStrength >= 3) enhancers.departureStrength = 2;
  else if (pattern.departureStrength >= 1.5) enhancers.departureStrength = 1;

  // 2. Time at Level
  if (pattern.pauseCandleCount <= 2) enhancers.timeAtLevel = 2;
  else if (pattern.pauseCandleCount <= 6) enhancers.timeAtLevel = 1;

  // 3. Freshness (FTB for new detections)
  enhancers.freshness = 2; // New zones are FTB by definition

  // 4. Profit Margin (distance to opposing zone)
  const opposingDistance = calculateOpposingZoneDistance(pattern, candles);
  if (opposingDistance > zoneWidth * 3) enhancers.profitMargin = 2;
  else if (opposingDistance > zoneWidth * 1.5) enhancers.profitMargin = 1;

  // 5. Big Picture (trend alignment)
  // ...continues for all 8 enhancers

  return { totalScore, maxScore: 16, enhancers };
}
```

---

## 6. CORE SCREENS

### 6.1 ScannerScreen (Main)
**Path:** `gem-mobile/src/screens/Scanner/ScannerScreen.js`

#### Layout Structure
```
┌─────────────────────────────────────┐
│ [CoinSelector▼]      [📊 Portfolio] │  ← Top Row
├─────────────────────────────────────┤
│ 🔍 3 patterns  ⚡LIVE  [Scan Now]  │  ← Scan Status
├─────────────────────────────────────┤
│ 🔵 BTC  $42,000  +2.5%  14:30     │  ← Price Section
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │ [1m][5m][15m][1h][4h][1D][1W]  │ │  ← ChartToolbar
│ │ [Vol][Draw][Lines][Zoom][Full] │ │
│ ├─────────────────────────────────┤ │
│ │ [─][↗][□][Fib][▲][▼][🧲][🗑]  │ │  ← DrawingToolbar
│ ├─────────────────────────────────┤ │
│ │                                 │ │
│ │      TradingView Chart          │ │  ← WebView Chart
│ │                                 │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ ▼ BTCUSDT (3 patterns)             │
│   ├── [UPD] 85% SHORT ⭐⭐⭐⭐⭐    │  ← Scan Results
│   ├── [H&S] 78% SHORT ⭐⭐⭐⭐     │
│   └── [DPD] 72% SHORT ⭐⭐⭐       │
├─────────────────────────────────────┤
│ 📊 Multi-TF Confluence (TIER2+)    │  ← Multi-TF Section
└─────────────────────────────────────┘
```

#### State Management
```javascript
// From ScannerContext (Persisted)
const {
  scanResults,        // Array<ScanResult>
  patterns,           // Array<Pattern> - sorted by strength + hierarchy
  selectedCoins,      // Array<string> - symbols to scan
  selectedTimeframe,  // string - '1h', '4h', '1d', '1w'
  multiTFResults,     // MultiTFResult | null
  lastScanTime,       // Date
} = useScanner();

// From AuthContext
const { user, userTier } = useAuth();

// Local State
const [loading, setLoading] = useState(false);
const [scanning, setScanning] = useState(false);
const [currentPrice, setCurrentPrice] = useState(null);
const [priceChange, setPriceChange] = useState(null);
const [paperTradeModalVisible, setPaperTradeModalVisible] = useState(false);
const [selectedPattern, setSelectedPattern] = useState(null);
```

### 6.2 OpenPositionsScreen
**Path:** `gem-mobile/src/screens/Scanner/OpenPositionsScreen.js`

#### Layout Structure
```
┌─────────────────────────────────────┐
│ ← Lệnh đang mở           📜 🔄     │  ← Header
├─────────────────────────────────────┤
│ ┌───────┐ ┌───────┐ ┌───────┐     │
│ │$9,500 │ │   3   │ │   2   │     │  ← Stats Row 1
│ │Balance│ │ Open  │ │Pending│     │
│ └───────┘ └───────┘ └───────┘     │
│ ┌───────┐ ┌───────┐ ┌───────┐     │
│ │  5    │ │ 75%   │ │+$500  │     │  ← Stats Row 2
│ │ Closed│ │WinRate│ │Total  │     │
│ └───────┘ └───────┘ └───────┘     │
├─────────────────────────────────────┤
│ ⏱ Lệnh Đang Chờ              (2)   │  ← Pending Section
│ ┌─────────────────────────────────┐ │
│ │ BTCUSDT  LONG            [❌]  │ │
│ │ Giá Chờ: $41,500               │ │  ← Pending Card
│ │ Giá TT: $42,000 (-1.2%)        │ │
│ │ Margin: $500  Lev: 10x         │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ 📈 Vị Thế Đang Mở            (3)   │  ← Positions Section
│ ┌─────────────────────────────────┐ │
│ │ BTCUSDT  LONG  [GEM]     [X]   │ │
│ │ +$125.50 (+12.5%)              │ │  ← Position Card
│ │ Entry: $42,000  Current: $42,500│ │
│ │ SL: $41,000     TP: $44,000    │ │
│ │ Margin: $500    Lev: 10x       │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ 📜 Xem Lịch Sử Paper Trade →       │  ← History Link
└─────────────────────────────────────┘
```

### 6.3 PatternDetailScreen
**Path:** `gem-mobile/src/screens/Scanner/PatternDetailScreen.js`

#### Layout Structure
```
┌─────────────────────────────────────┐
│ ← Head & Shoulders                  │
│   BTCUSDT  [SHORT]                  │  ← Header
├─────────────────────────────────────┤
│ [GEM Pattern Mode] (hoặc Custom)   │  ← Trade Mode Badge
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │                                 │ │
│ │    TradingView Chart            │ │  ← Full Chart
│ │    (Entry/SL/TP lines)          │ │
│ │                                 │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ Zone Hierarchy: DP ⭐⭐⭐⭐⭐        │  ← Zone Info
│ Odds Score: 14/16 (Grade A+)       │
├─────────────────────────────────────┤
│ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐
│ │ 85%   │ │ 2.1:1 │ │ 72%   │ │  4H   │  ← Stats Grid
│ │Confid.│ │  R:R  │ │WinRate│ │  TF   │
│ └───────┘ └───────┘ └───────┘ └───────┘
├─────────────────────────────────────┤
│ ✓ Departure: Strong (2/2)          │
│ ✓ Time at Level: Fresh (2/2)       │  ← Odds Enhancers
│ ✓ Big Picture: With Trend (2/2)    │
│ ✓ Zone Origin: DP (2/2)            │
├─────────────────────────────────────┤
│ [       Đóng Lệnh (red)          ] │  ← Close Button
└─────────────────────────────────────┘
```

### 6.4 PaperTradeHistoryScreen
**Path:** `gem-mobile/src/screens/Account/PaperTradeHistoryScreen.js`

#### Layout Structure
```
┌─────────────────────────────────────┐
│ ← Lịch Sử Paper Trade        ⚙️    │  ← Header + Settings
├─────────────────────────────────────┤
│ ┌───────┐ ┌───────┐ ┌───────┐     │
│ │   1   │ │   5   │ │ 60%   │     │  ← Stats Row 1
│ │Đang Mở│ │Đã Đóng│ │WinRate│     │
│ └───────┘ └───────┘ └───────┘     │
├─────────────────────────────────────┤
│ ┌─────────────┐ ┌─────────────┐   │
│ │ Vốn Ban Đầu │ │ Số Dư Hiện  │   │  ← Balance Cards
│ │  $10,000 ⚙️ │ │  $10,500    │   │
│ └─────────────┘ └─────────────┘   │
├─────────────────────────────────────┤
│      Tổng P&L: +$500.00 USDT       │  ← P&L Card
│      Trung bình: +$100 / lệnh      │
├─────────────────────────────────────┤
│ [Tất cả][Đang Mở][Đã Đóng][Win]... │  ← Filter Tabs
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │ BTCUSDT  LONG  [WIN]           │ │
│ │ +$125.50  +12.5%               │ │  ← Trade Cards
│ │ Entry: $42,000  Exit: $44,000  │ │
│ │ Closed: 2h ago  Reason: TP HIT │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

---

## 7. SCANNER COMPONENTS

### 7.1 PatternCard
**Path:** `gem-mobile/src/screens/Scanner/components/PatternCard.js`

#### Layout
```
┌─────────────────────────────────────┐
│ ↗️ UPD (Reversal)    [FRESH] [A+]  │
│    BTCUSDT  ⭐⭐⭐⭐⭐   [SHORT]    │
├─────────────────────────────────────┤
│ Confidence: ████████░░ 85%         │
├─────────────────────────────────────┤
│ Entry: $42,000                      │
│ TP: $40,000 (green)  SL: $43,000   │
├─────────────────────────────────────┤
│ R:R 2.2:1  |  WR 65%  |  DP Zone   │
│                       [Paper Trade] │
└─────────────────────────────────────┘
```

#### Props
```typescript
interface PatternCardProps {
  pattern: Pattern;
  onPress: () => void;
  onPaperTrade: () => void;
  userTier: 'FREE' | 'TIER1' | 'TIER2' | 'TIER3';
}
```

#### Quality Grade Styles
```javascript
const gradeConfig = {
  'A+': { color: '#00FF88', bg: 'rgba(0, 255, 136, 0.15)' },
  'A':  { color: '#00FF88', bg: 'rgba(0, 255, 136, 0.12)' },
  'B+': { color: '#FFBD59', bg: 'rgba(255, 189, 89, 0.15)' },
  'B':  { color: '#FFBD59', bg: 'rgba(255, 189, 89, 0.12)' },
  'C':  { color: '#FF9500', bg: 'rgba(255, 149, 0, 0.15)' },
  'D':  { color: '#FF4757', bg: 'rgba(255, 71, 87, 0.15)' },
};
```

### 7.2 Zone Components

#### ZoneHierarchyBadge
**Path:** `gem-mobile/src/components/Scanner/ZoneHierarchyBadge.js`
```javascript
// Displays zone hierarchy level with icon and color
<ZoneHierarchyBadge
  hierarchy="DECISION_POINT"  // DP | FTR | FLAG_LIMIT | REGULAR
  size="sm" | "md" | "lg"
/>
```

#### OddsEnhancerScorecard
**Path:** `gem-mobile/src/components/Scanner/OddsEnhancerScorecard.js`
```javascript
// Displays all 8 odds enhancers with scores
<OddsEnhancerScorecard
  enhancers={{
    departureStrength: 2,
    timeAtLevel: 2,
    freshness: 2,
    profitMargin: 1,
    bigPicture: 2,
    zoneOrigin: 2,
    arrival: 1,
    riskReward: 2
  }}
  totalScore={14}
  maxScore={16}
/>
```

#### FreshnessIndicator
**Path:** `gem-mobile/src/components/Scanner/FreshnessIndicator.js`
```javascript
// Shows zone freshness (FTB = First Time Back)
<FreshnessIndicator
  testCount={0}  // 0 = FTB (freshest)
/>
```

### 7.3 Advanced Pattern Cards

#### QMPatternCard
**Path:** `gem-mobile/src/components/Scanner/QMPatternCard.js`
```javascript
// Specialized display for Quasimodo pattern
- Shows HEAD, QML, MPL levels
- BOS (Break of Structure) indicator
- Entry at QML retest
```

#### FTRZoneCard
**Path:** `gem-mobile/src/components/Scanner/FTRZoneCard.js`
```javascript
// Specialized display for FTR zones
- Shows broken S/R level
- Base formation
- FTB freshness indicator
```

#### DecisionPointCard
**Path:** `gem-mobile/src/components/Scanner/DecisionPointCard.js`
```javascript
// Specialized display for Decision Points
- Crown icon (level 1)
- Move multiple indicator
- Origin candle count
```

---

## 8. TRADING COMPONENTS

### 8.1 PaperTradeModal
**Path:** `gem-mobile/src/screens/Scanner/components/PaperTradeModal.js`

#### Layout
```
┌─────────────────────────────────────┐
│ Paper Trade: UPD            [X]    │
├─────────────────────────────────────┤
│ BTCUSDT | SHORT | 4H | 85%         │
│ Zone: DP ⭐⭐⭐⭐⭐  Score: 14/16   │
├─────────────────────────────────────┤
│ [Pattern Mode] [Custom Mode]        │  ← Mode Tabs
├─────────────────────────────────────┤
│ Trade Type                          │
│ [  LONG (green) ][  SHORT (red)  ] │
├─────────────────────────────────────┤
│ Position Size (Margin)              │
│ ┌─────────────────────────────────┐ │
│ │ $ [500_____________]            │ │
│ └─────────────────────────────────┘ │
│ [$50][$100][$250][$500][$1000]     │
│ [10%][25%][50%][100%]              │
├─────────────────────────────────────┤
│ Leverage                            │
│ [1x][5x][10x][20x][50x][100x]      │
├─────────────────────────────────────┤
│ Position Value: $5,000              │
│ Quantity:      0.119 BTC            │
│ Risk (SL):     2.4% ($120)          │
│ Reward (TP):   4.8% ($240)          │
│ R:R Ratio:     2.2:1                │
├─────────────────────────────────────┤
│ Entry:  $42,000 (blue)  🔒         │  ← Locked in Pattern Mode
│ TP:     $40,000 (green) 🔒         │
│ SL:     $43,000 (red)   🔒         │
├─────────────────────────────────────┤
│ Available: $9,500                    │
├─────────────────────────────────────┤
│ [  Cancel  ][     Open Trade      ] │
└─────────────────────────────────────┘
```

### 8.2 ChartToolbar
**Path:** `gem-mobile/src/components/Trading/ChartToolbar.js`

#### Styles
```javascript
container: {
  height: 44,
  backgroundColor: 'rgba(26, 32, 44, 0.95)',
  borderTopWidth: 1,
  borderTopColor: 'rgba(255, 255, 255, 0.1)',
}

timeframeButton: {
  paddingHorizontal: 10,
  paddingVertical: 6,
  borderRadius: 6,
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
}

timeframeButtonActive: {
  backgroundColor: 'rgba(255, 189, 89, 0.2)',
  borderWidth: 1,
  borderColor: 'rgba(255, 189, 89, 0.5)',
}
```

### 8.3 DrawingToolbar
**Path:** `gem-mobile/src/components/Trading/DrawingToolbar.js`

#### Tools
| Tool ID | Icon | Label | Clicks | Description |
|---------|------|-------|--------|-------------|
| horizontal_line | Minus | Ngang | 1 | Horizontal line at clicked price |
| trend_line | TrendingUp | Xu hướng | 2 | Dashed line from point 1 to 2 |
| rectangle | Square | Chữ nhật | 2 | Top/bottom horizontal lines |
| fibonacci_retracement | GitBranch | Fib | 2 | 7 Fibonacci levels |
| long_position | ArrowUpCircle | Long | 1 | Entry + TP (+4%) + SL (-2%) |
| short_position | ArrowDownCircle | Short | 1 | Entry + TP (-4%) + SL (+2%) |

#### Tool Icon Colors
```javascript
horizontal_line: COLORS.gold (#FFBD59)
trend_line: COLORS.cyan (#00F0FF)
rectangle: COLORS.purple (#6A5BFF)
fibonacci_retracement: COLORS.gold (#FFBD59)
long_position: COLORS.success (#3AF7A6)
short_position: COLORS.error (#FF6B6B)
```

---

## 9. DRAWING TOOLS

### 9.1 Drawing Service
**Path:** `gem-mobile/src/services/drawingService.js`

#### Methods
```javascript
fetchDrawings(userId, symbol, timeframe)
saveDrawing(drawing)
updateDrawing(id, updates)
deleteDrawing(id)
deleteAllDrawings(userId, symbol)
toggleDrawingVisibility(id, isVisible)
exportDrawings(userId, symbol)
importDrawings(userId, importData)
```

### 9.2 Drawing Object
```typescript
interface Drawing {
  id: UUID;
  user_id: UUID;
  symbol: string;              // 'BTCUSDT'
  timeframe: string;           // '4h'
  tool_type: string;           // 'horizontal_line', etc.
  drawing_data: {
    price?: number;            // horizontal_line
    startPrice?: number;       // 2-click tools
    startTime?: number;
    endPrice?: number;
    endTime?: number;
    entryPrice?: number;       // position tools
    color?: string;
  };
  name?: string;
  is_visible: boolean;
  z_index: number;
  visible_timeframes: string[];
  created_at: ISO8601;
  updated_at: ISO8601;
}
```

### 9.3 Fibonacci Levels
```javascript
const FIBONACCI_LEVELS = [
  { value: 0, label: '0%', color: '#787B86' },
  { value: 0.236, label: '23.6%', color: '#F7525F' },
  { value: 0.382, label: '38.2%', color: '#FF9800' },
  { value: 0.5, label: '50%', color: '#4CAF50' },
  { value: 0.618, label: '61.8%', color: '#2196F3' },
  { value: 0.786, label: '78.6%', color: '#9C27B0' },
  { value: 1, label: '100%', color: '#787B86' },
];
```

---

## 10. SERVICES & BUSINESS LOGIC

### 10.1 Pattern Detection Service
**Path:** `gem-mobile/src/services/patternDetection.js`

#### Available Patterns by Tier

**FREE Tier (3 patterns)**
| Pattern | Type | Direction | Win Rate | R:R |
|---------|------|-----------|----------|-----|
| DPD | Continuation | SHORT | 68% | 2.5 |
| UPU | Continuation | LONG | 71% | 2.8 |
| Head & Shoulders | Reversal | SHORT | 72% | 3.0 |

**TIER1 Exclusive (+4 patterns)**
| Pattern | Type | Direction | Win Rate | R:R |
|---------|------|-----------|----------|-----|
| UPD | Reversal | SHORT | 65% | 2.2 |
| DPU | Reversal | LONG | 69% | 2.6 |
| Double Top | Reversal | SHORT | 68% | 2.5 |
| Double Bottom | Reversal | LONG | 70% | 2.7 |

**TIER2 Exclusive (+8 patterns)**
| Pattern | Type | Direction | Win Rate |
|---------|------|-----------|----------|
| Inv. Head & Shoulders | Reversal | LONG | 75% |
| Ascending Triangle | Continuation | LONG | 66% |
| Descending Triangle | Continuation | SHORT | 65% |
| Symmetrical Triangle | Neutral | BOTH | 63% |
| Rounding Bottom | Reversal | LONG | 68% |
| Rounding Top | Reversal | SHORT | 67% |
| Cup & Handle | Continuation | LONG | 72% |
| Wedge | Reversal | BOTH | 64% |

**TIER3 Exclusive (+9 patterns)**
| Pattern | Type | Direction | Win Rate |
|---------|------|-----------|----------|
| Quasimodo (QM) | Reversal | BOTH | 68% |
| FTR | Continuation | BOTH | 70% |
| Flag Limit | Continuation | BOTH | 65% |
| Decision Point | Origin | BOTH | 72% |
| Bull Flag | Continuation | LONG | 70% |
| Bear Flag | Continuation | SHORT | 69% |
| Engulfing | Candlestick | BOTH | 64% |
| Morning/Evening Star | Candlestick | BOTH | 66% |
| Three Methods | Continuation | BOTH | 67% |

### 10.2 Dedicated Detectors
| Detector | Path | Purpose |
|----------|------|---------|
| quasimodoDetector.js | services/ | QM pattern with BOS, QML, MPL |
| ftrDetector.js | services/ | FTR with S/R break + base |
| flagLimitDetector.js | services/ | FL with 1-2 candle base |
| decisionPointDetector.js | services/ | DP (origin of major move) |
| compressionDetector.js | services/ | Price compression before breakout |
| engulfingDetector.js | services/ | Engulfing candle patterns |
| pinBarDetector.js | services/ | Pin bars, hammers, shooting stars |
| inducementDetector.js | services/ | Liquidity grab patterns |

### 10.3 Zone Calculator
**Path:** `gem-mobile/src/services/zoneCalculator.js`

```javascript
// Zone boundary calculation
calculateZoneBoundaries(pauseCandles, zoneType, currentPrice) {
  const pauseHigh = Math.max(...pauseCandles.map(c => c.high));
  const pauseLow = Math.min(...pauseCandles.map(c => c.low));

  // HFZ (Supply Zone)
  if (zoneType === 'HFZ') {
    return {
      entryPrice: pauseLow,      // Entry = LOW (near price)
      stopPrice: pauseHigh * 1.10, // Stop = HIGH + buffer
      zoneHigh: pauseHigh,
      zoneLow: pauseLow,
    };
  }

  // LFZ (Demand Zone)
  return {
    entryPrice: pauseHigh,       // Entry = HIGH (near price)
    stopPrice: pauseLow * 0.90,  // Stop = LOW - buffer
    zoneHigh: pauseHigh,
    zoneLow: pauseLow,
  };
}
```

### 10.4 Multi-Timeframe Scanner
**Path:** `gem-mobile/src/services/multiTimeframeScanner.js`

#### Two-Phase Scanning
```javascript
// Phase 1: Scan HTF (1D, 1W, 1M) first
const htfResults = await scanTimeframes(HTF_TIMEFRAMES);
const htfContext = determineHTFTrend(htfResults);

// Phase 2: Scan LTF with HTF context
const ltfOptions = { htfTrend: htfContext.trend, htfZones: htfContext.zones };
const ltfResults = await scanTimeframes(LTF_TIMEFRAMES, ltfOptions);

// HTF context boosts/penalties
- With-trend pattern: +10 confidence
- Counter-trend non-reversal: -15 confidence
- Counter-trend reversal: +5 confidence
- Zone-in-zone (LTF in HTF): +12 confidence
```

#### Confluence Calculation
```javascript
const confluenceScore = (matchingTimeframes / totalScanned) * 100;
const level = score > 75 ? 'HIGH' : score >= 50 ? 'MEDIUM' : 'LOW';
```

### 10.5 Paper Trade Service
**Path:** `gem-mobile/src/services/paperTradeService.js`

#### Storage Keys
```javascript
const STORAGE_KEYS = {
  POSITIONS: 'gem_paper_positions',
  PENDING: 'gem_paper_pending_orders',
  HISTORY: 'gem_paper_history',
  BALANCE: 'gem_paper_balance',
  INITIAL_BALANCE: 'gem_paper_initial_balance',
};

const DEFAULT_INITIAL_BALANCE = 10000; // USDT
```

#### P&L Calculation
```javascript
// LONG Position
unrealizedPnL = (currentPrice - entryPrice) * quantity;
ROE = unrealizedPnLPercent * leverage;

// SHORT Position
unrealizedPnL = (entryPrice - currentPrice) * quantity;
ROE = unrealizedPnLPercent * leverage;

// Liquidation (Binance formula)
const mmr = 0.004; // 0.4% maintenance margin rate
const imr = 1 / leverage;
liquidationPrice = entry * (isLong ? (1 - imr + mmr) : (1 + imr - mmr));
```

---

## 11. DESIGN SYSTEM

### 11.1 Colors
**Path:** `gem-mobile/src/utils/tokens.js`

#### Brand Colors
| Name | Hex | Usage |
|------|-----|-------|
| burgundy | #9C0612 | Primary buttons, scan button |
| burgundyDark | #6B0F1A | Button pressed states |
| gold | #FFBD59 | Premium features, active states |

#### Functional Colors
| Name | Hex | Usage |
|------|-----|-------|
| success | #3AF7A6 | Bullish, profit, LONG |
| error | #FF6B6B | Bearish, loss, SHORT |
| warning | #FFB800 | Caution, alerts |
| info | #3B82F6 | Information, entry price |

#### Accent Colors
| Name | Hex | Usage |
|------|-----|-------|
| purple | #6A5BFF | Interactive elements |
| cyan | #00F0FF | Entry prices, magnet mode |

#### Glass Morphism
| Property | Value |
|----------|-------|
| background | rgba(15, 16, 48, 0.55) |
| blur | 18 |
| borderWidth | 1.2 |
| borderRadius | 18 |

### 11.2 Spacing Scale
```javascript
const SPACING = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,      // Most used
  lg: 16,
  xl: 18,      // Glass card padding
  xxl: 20,
  xxxl: 24,
  huge: 32,
  giant: 40,
};
```

### 11.3 Typography
```javascript
const TYPOGRAPHY = {
  sizes: {
    xs: 10,
    sm: 11,       // Labels
    md: 12,       // Small text
    base: 13,     // Body small
    lg: 14,       // Body
    xl: 15,       // Buttons
    xxl: 16,      // Large body
    xxxl: 18,     // Card titles
    display: 20,  // APY
    hero: 32,     // Amount input
    giant: 42,    // Balance amount
  },
  weights: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
};
```

### 11.4 Component Styles

#### Direction Badge
```javascript
// LONG Badge
{ backgroundColor: 'rgba(58, 247, 166, 0.2)', color: '#3AF7A6' }

// SHORT Badge
{ backgroundColor: 'rgba(255, 107, 107, 0.2)', color: '#FF6B6B' }
```

#### Zone Hierarchy Badge
```javascript
// DP (Level 1)
{ backgroundColor: 'rgba(156, 6, 18, 0.2)', color: '#9C0612' }

// FTR (Level 2)
{ backgroundColor: 'rgba(255, 189, 89, 0.2)', color: '#FFBD59' }

// FL (Level 3)
{ backgroundColor: 'rgba(34, 197, 94, 0.2)', color: '#22C55E' }

// Regular (Level 4)
{ backgroundColor: 'rgba(107, 114, 128, 0.2)', color: '#6B7280' }
```

### 11.5 Animations
```javascript
const ANIMATION = {
  duration: {
    fast: 150,
    normal: 300,
    slow: 400,
  },
};

// Button press: scale(0.98), duration: 150ms
// Modal open: fadeIn + slideUp, duration: 300ms
// Badge pulse: scale(1.1) + opacity(0.8), duration: 500ms
```

---

## 12. USER FLOWS

### 12.1 Main Scanning Flow
```
User Opens App
    ↓
Scanner Tab Loads
  - Last coins restored
  - Last timeframe restored
  - WebSocket connects
    ↓
User Selects Coins
  - CoinSelector modal
  - Search or browse
  - Select 1-N coins (tier-limited)
    ↓
User Clicks "Scan Now"
  - Check quota
  - Show spinner
    ↓
Pattern Detection
  - Fetch klines from Binance
  - GEM Frequency Method analysis
  - Zone hierarchy classification
  - Odds enhancers calculation
  - Confirmation pattern check
    ↓
Results Displayed
  - Sorted by strength + hierarchy
  - Grouped by coin (CoinAccordion)
  - Quality grade badges
    ↓
[View Details] [Paper Trade] [Draw on Chart]
```

### 12.2 Paper Trading Flow
```
User Clicks "Paper Trade" on Pattern
    ↓
PaperTradeModal Opens
  - Pattern details displayed
  - Entry/SL/TP auto-filled
  - Zone hierarchy shown
    ↓
User Configures Trade
  - Select LONG/SHORT
  - Enter margin
  - Set leverage (1-125x)
  - (Custom Mode) Edit Entry/SL/TP
    ↓
System Calculates
  - Position value = margin × leverage
  - Quantity = value / entry
  - Risk/Reward amounts
  - Liquidation price
    ↓
Order Type Determined
  - Pattern Mode: Always MARKET
  - Custom Mode: MARKET or LIMIT
    ↓
Position Tracking
  - Save to AsyncStorage
  - Sync to Supabase
  - Real-time P&L (every 10s)
  - Auto-close on TP/SL
    ↓
Position Closed
  - Calculate realized P&L
  - Update balance
  - Move to history
```

---

## 13. DATA STRUCTURES

### 13.1 Pattern Object
```typescript
interface Pattern {
  // Identification
  id: string;
  symbol: string;
  patternType: string;

  // Direction & Type
  direction: 'LONG' | 'SHORT' | 'NEUTRAL';
  type: 'reversal' | 'continuation' | 'zone' | 'candlestick';
  timeframe: string;

  // Price Levels
  entry: number;
  stopLoss: number;
  takeProfit: number;

  // Confidence & Risk
  confidence: number;      // 0-100
  riskReward: number;      // Ratio
  winRate: number;         // Expected %

  // Zone Hierarchy (NEW)
  zoneHierarchy: 'DECISION_POINT' | 'FTR' | 'FLAG_LIMIT' | 'REGULAR';
  zoneHierarchyLevel: number;  // 1-4

  // Odds Enhancers (NEW)
  oddsEnhancers: {
    totalScore: number;
    maxScore: number;
    enhancers: {
      departureStrength: number;
      timeAtLevel: number;
      freshness: number;
      profitMargin: number;
      bigPicture: number;
      zoneOrigin: number;
      arrival: number;
      riskReward: number;
    };
  };
  qualityGrade: 'A+' | 'A' | 'B+' | 'B' | 'C' | 'D';

  // MTF Context (NEW)
  htfAlignment: 'WITH_TREND' | 'COUNTER_TREND' | 'REVERSAL_COUNTER';
  insideHTFZone: boolean;
  lookRightRR: number;

  // Confirmation (NEW)
  confirmation: {
    patterns: string[];
    score: number;
    bestPattern: string | null;
  };

  // State
  state: 'FRESH' | 'ACTIVE' | 'WAITING' | 'INVALID' | 'EXPIRED';
  detectedAt: string;
}
```

### 13.2 Position Object
```typescript
interface Position {
  id: string;
  userId: string;
  symbol: string;

  direction: 'LONG' | 'SHORT';
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  currentPrice: number;

  margin: number;
  positionValue: number;
  quantity: number;
  leverage: number;

  unrealizedPnL: number;
  unrealizedPnLPercent: number;

  status: 'OPEN' | 'CLOSED' | 'PENDING';
  orderType: 'MARKET' | 'LIMIT';
  tradeMode: 'pattern' | 'custom';

  openedAt: string;
  patternType: string;
  zoneHierarchy?: string;
  oddsScore?: number;
}
```

---

## 14. TRADING MODES

### 14.1 Pattern Mode (GEM AI-Generated)
```javascript
tradeMode: 'pattern'

- Entry: Auto-calculated (locked)
- Stop Loss: Auto-calculated (locked)
- Take Profit: Auto-calculated (locked)
- Order Type: Always MARKET
- Editable: NO
- AI Score: Not shown

// UI Indicators
- Badge: "GEM Pattern Mode" (gold, lock icon)
- Edit icon: NOT shown
```

### 14.2 Custom Mode (User-Defined)
```javascript
tradeMode: 'custom'

- Entry: User-defined
- Stop Loss: User-defined (with validation)
- Take Profit: User-defined (with validation)
- Order Type: MARKET or LIMIT (auto-detected)
- Editable: YES
- AI Score: Shown (0-100)

// Validation
LONG: stopLoss < entry < takeProfit
SHORT: stopLoss > entry > takeProfit

// Limit Order Detection
isLimitOrder = (
  (direction === 'LONG' && entry < currentPrice) ||
  (direction === 'SHORT' && entry > currentPrice)
)
```

---

## 15. TIER ACCESS CONTROL

### 15.1 Tier Comparison
| Feature | FREE | TIER1 | TIER2 | TIER3 |
|---------|------|-------|-------|-------|
| Patterns | 3 | 7 | 15 | 24+ |
| Max Coins/Scan | 1 | 5 | 20 | Unlimited |
| Timeframes | 1 | 1 | 3 | 5+ |
| Multi-TF Scan | No | No | Yes | Yes |
| Custom Mode | No | No | Yes | Yes |
| Zone Hierarchy Display | No | No | Yes | Yes |
| Odds Enhancers | No | No | Yes | Yes |
| Quality Grade | No | No | Yes | Yes |
| Scan Quota/Day | 5 | 15 | 50 | Unlimited |
| Max Leverage | 10x | 20x | 50x | 125x |

---

## 16. REAL-TIME FEATURES

### 16.1 WebSocket Implementation
```javascript
// Price subscription
const ws = new WebSocket(
  `wss://fstream.binance.com/ws/${symbol.toLowerCase()}@ticker`
);

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  setCurrentPrice(parseFloat(data.c));
  setPriceChange(parseFloat(data.P));
};
```

### 16.2 Auto-Close Logic
```javascript
// Check TP/SL every 10 seconds
for (const position of openPositions) {
  const isLong = position.direction === 'LONG';

  const hitStopLoss = isLong
    ? currentPrice <= position.stopLoss
    : currentPrice >= position.stopLoss;

  const hitTakeProfit = isLong
    ? currentPrice >= position.takeProfit
    : currentPrice <= position.takeProfit;

  if (hitStopLoss) await closePosition(position.id, position.stopLoss, 'STOP_LOSS');
  if (hitTakeProfit) await closePosition(position.id, position.takeProfit, 'TAKE_PROFIT');
}
```

---

## 17. ERROR HANDLING

### 17.1 Pattern Detection Errors
| Error | Handling |
|-------|----------|
| Invalid symbol | Sanitize & retry |
| API rate limit | Queue & retry with delay |
| Insufficient candles | Return empty patterns |
| Network error | Silent fail, show retry button |

### 17.2 Paper Trade Validation
```javascript
if (positionSize <= 0) Alert.alert('Lỗi', 'Vui lòng nhập số tiền hợp lệ');
if (positionSize > balance) Alert.alert('Lỗi', 'Số dư không đủ');
if (!pattern.entry || !pattern.stopLoss) Alert.alert('Lỗi', 'Pattern không hợp lệ');

// Custom Mode Validation
if (direction === 'LONG' && stopLoss >= entry) {
  Alert.alert('Lỗi', 'Stop Loss phải nhỏ hơn Entry cho lệnh LONG');
}
```

---

## 18. PERFORMANCE OPTIMIZATIONS

### 18.1 Batch Processing
```javascript
const BATCH_SIZE = 50;

for (let i = 0; i < coins.length; i += BATCH_SIZE) {
  const batch = coins.slice(i, i + BATCH_SIZE);
  await Promise.all(
    batch.map(coin => patternDetection.detectPatterns(coin, tf))
  );
}
```

### 18.2 Memoization
```javascript
const filteredResults = useMemo(() => {
  return results.filter(r => r.patterns.length > 0);
}, [results]);

const sortedPatterns = useMemo(() => {
  return patterns.sort((a, b) => {
    // Primary: strength, Secondary: hierarchy, Tertiary: confidence
  });
}, [patterns]);
```

---

## 19. FILE MANIFEST

```
gem-mobile/src/
├── screens/
│   ├── Scanner/
│   │   ├── ScannerScreen.js
│   │   ├── OpenPositionsScreen.js
│   │   ├── PatternDetailScreen.js
│   │   ├── MTFDashboardScreen.js
│   │   ├── OddsAnalysisScreen.js
│   │   ├── ZoneDetailScreen.js
│   │   └── components/
│   │       ├── CoinSelector.js
│   │       ├── TradingChart.js
│   │       ├── PatternCard.js
│   │       ├── ScanResultsSection.js
│   │       ├── MultiTFResultsSection.js
│   │       ├── PaperTradeModal.js
│   │       └── ConfidenceBar.js
│   └── Account/
│       ├── PortfolioScreen.js
│       └── PaperTradeHistoryScreen.js
├── components/
│   ├── Scanner/
│   │   ├── ZoneHierarchyBadge.js
│   │   ├── OddsEnhancerScorecard.js
│   │   ├── FreshnessIndicator.js
│   │   ├── QMPatternCard.js
│   │   ├── FTRZoneCard.js
│   │   ├── DecisionPointCard.js
│   │   ├── FlagLimitCard.js
│   │   ├── ConfirmationBadge.js
│   │   └── ValidationBadges.js
│   └── Trading/
│       ├── ChartToolbar.js
│       ├── DrawingToolbar.js
│       ├── PaperTradeModal.js
│       ├── MindsetCheckModal.js
│       ├── AIAssessmentSection.js
│       └── PendingOrdersSection.js
├── services/
│   ├── patternDetection.js          # Core pattern engine
│   ├── quasimodoDetector.js         # QM detection
│   ├── ftrDetector.js               # FTR detection
│   ├── flagLimitDetector.js         # FL detection
│   ├── decisionPointDetector.js     # DP detection
│   ├── compressionDetector.js       # Compression detection
│   ├── engulfingDetector.js         # Engulfing patterns
│   ├── pinBarDetector.js            # Pin bars
│   ├── inducementDetector.js        # Inducement patterns
│   ├── confirmationPatterns.js      # Confirmation at zone
│   ├── zoneCalculator.js            # Zone boundaries
│   ├── zoneManager.js               # Zone lifecycle
│   ├── zoneHierarchy.js             # Zone classification
│   ├── oddsEnhancers.js             # 8 odds scoring
│   ├── multiTimeframeScanner.js     # MTF scanning
│   ├── mtfAlignmentService.js       # MTF alignment
│   ├── binanceService.js            # Binance API
│   ├── paperTradeService.js         # Paper trading
│   └── drawingService.js            # Chart drawings
├── constants/
│   ├── patternConfig.js             # Pattern win rates, R:R
│   ├── patternSignals.js            # Pattern definitions
│   ├── zoneHierarchyConfig.js       # Zone hierarchy config
│   ├── oddsEnhancersConfig.js       # Odds enhancers config
│   └── tierFeatures.js              # Tier access
└── utils/
    ├── tokens.js                    # Design tokens
    └── formatters.js                # Number formatting
```

---

## CHANGELOG

### Version 4.0 (2026-02-06)
- **Pattern Detection Engine Audit & Fix:**
  - Fixed GEM Frequency Method (detectImpulsiveMove, detectPauseZone)
  - Fixed DPD/UPU/DPU/UPD detection with correct R:R values
  - Fixed H&S/IH&S: Head must be 10% above/below shoulders
  - Fixed Double Top/Bottom: 2% tolerance, 3% trough depth
  - Fixed Bull/Bear Flag: Dynamic lookback, breakout entry
  - Fixed Symmetrical Triangle: Wait for breakout direction
  - Fixed Three Methods: Middle candles must stay within first candle range
  - Removed dead swing fallback code (4 functions, ~200 lines)

- **Zone Hierarchy System:**
  - Added DP > FTR > FL > Regular classification
  - Replaced inline QM/FTR/FL/DP with dedicated detectors
  - Added zone hierarchy sorting (secondary sort criterion)

- **8 Odds Enhancers:**
  - Fixed departure strength calculation
  - Fixed profit margin (opposing zone distance)
  - Fixed arrival speed (ATR-based)
  - All 8 enhancers now work correctly

- **MTF Integration:**
  - Added two-phase scanning (HTF first, then LTF with context)
  - Added HTF trend weighting (+10 with-trend, -15 counter-trend)
  - Added zone-in-zone prioritization (+12 confidence)

- **Confirmation Patterns:**
  - Added confirmation pattern scanning at zone touches
  - Integrated engulfing, pin bar, hammer detection
  - Added confirmation score boost (+10 confidence max)

- **Look Right Validation:**
  - Added opposing zone R:R filter (min 2:1)
  - Patterns failing Look Right are filtered out

- **Documentation Update:**
  - Complete rewrite of pattern detection section
  - Added zone hierarchy documentation
  - Added odds enhancers documentation
  - Updated file manifest with all new services/components

### Version 3.2 (2026-01-29)
- Added comprehensive Vietnamese marketing section
- Updated file manifest with all current components

### Version 3.1 (2026-01-24)
- Zone positioning fix (uses formation_time)
- P&L real-time sync via onPriceUpdate callback
- MindsetCheckModal integration
- Vietnamese number formatting (formatters.js)

### Version 4.1 (2026-02-14) — Phase 6 Scanner + PaperTrade Engine Fix
- **Scanner state wipe fix**: `setSelectedTimeframe()` accepts `{ clearResults }` flag. Pattern selection no longer wipes scan results when crossing timeframes.
- **PENDING order fix**: Breakout entries (LONG above market / SHORT below market) now create PENDING orders instead of MARKET. Uses `createdAtMarketPrice` field for fill direction.
- **TP value consistency**: Zone Manager uses detector's R:R multiplier instead of hardcoded 1:2. ScannerScreen reordered TP priority (detection target > zone target_1).
- **PNL accuracy**: Entry price always uses pattern entry (no override to market). `mapFromSupabase` no longer copies `entry_price` into `currentPrice`. NaN guard on PNL calculation.
- **AdminAI Futures API**: All market data endpoints changed from Spot (`api.binance.com`) to Futures (`fapi.binance.com`).
- See `docs/feature-scanner-papertrade-engine.md` for architectural decisions.

### Version 3.0 (2025-12-20)
- Added 6 drawing tools with Supabase persistence
- Added pending orders (limit order support)
- Added Custom Mode with AI scoring
- Separated Pattern vs Custom mode

### Version 2.0 (2025-12-13)
- Custom initial balance feature
- Reset account functionality
- Settings modal in history screen

### Version 1.0 (Initial)
- Core scanner functionality
- 24 pattern detection
- Paper trading system
- Multi-timeframe scanning

---

**END OF DOCUMENT**
