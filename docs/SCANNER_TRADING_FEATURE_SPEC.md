# GEM Mobile - Scanner/Trading Tab
# COMPLETE FEATURE SPECIFICATION

**Version:** 2.0
**Last Updated:** 2025-12-13
**Platform:** React Native (Expo)
**Author:** GEM Development Team

---

## TABLE OF CONTENTS

1. [Executive Summary](#1-executive-summary)
2. [Architecture Overview](#2-architecture-overview)
3. [Core Screens](#3-core-screens)
4. [Scanner Components](#4-scanner-components)
5. [Services & Business Logic](#5-services--business-logic)
6. [Design System](#6-design-system)
7. [User Flows](#7-user-flows)
8. [Data Structures](#8-data-structures)
9. [Tier Access Control](#9-tier-access-control)
10. [Real-time Features](#10-real-time-features)
11. [Error Handling](#11-error-handling)
12. [Performance Optimizations](#12-performance-optimizations)
13. [File Manifest](#13-file-manifest)

---

## 1. EXECUTIVE SUMMARY

### 1.1 Overview
The Scanner/Trading tab is the core trading interface of GEM Mobile, enabling users to:
- Detect technical patterns across 500+ cryptocurrency pairs
- Execute paper trades with simulated capital
- Track portfolio performance in real-time
- Analyze multi-timeframe confluence (TIER2+)

### 1.2 Key Features
| Feature | Description |
|---------|-------------|
| Pattern Detection | AI-driven analysis of 24 technical patterns |
| Multi-Coin Scanning | Scan up to 1000 coins in parallel batches |
| Paper Trading | Simulated trading with configurable capital |
| Real-time P&L | Live price updates via Binance WebSocket |
| Multi-Timeframe | Confluence scoring across 5+ timeframes |
| Tier-based Access | Feature gating by subscription level |

### 1.3 Technology Stack
- **Frontend:** React Native + Expo
- **Charts:** lightweight-charts v4.1.0 (WebView)
- **API:** Binance FUTURES & SPOT REST/WebSocket
- **Storage:** AsyncStorage (local) + Supabase (sync)
- **State:** React Context (ScannerContext)

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
│   ├── WebView (lightweight-charts)
│   ├── TimeframeSelector
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
│   ├── PatternInfo
│   ├── PositionSizing
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
4. Algorithm analyzes patterns
5. Results stored in ScannerContext
6. UI updates with patterns
```

### 2.3 Navigation Structure
```
AccountStack
├── AccountScreen
│   └── PortfolioScreen
│   └── PaperTradeHistoryScreen

ScannerScreen (Tab - No Stack)
├── NavigateTo: PatternDetailScreen
├── NavigateTo: OpenPositionsScreen
└── Modal: PaperTradeModal
```

---

## 3. CORE SCREENS

### 3.1 ScannerScreen (Main)
**Path:** `gem-mobile/src/screens/Scanner/ScannerScreen.js`

#### Purpose
Main trading interface for pattern detection and paper trading

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
│ │                                 │ │
│ │      TradingView Chart          │ │  ← Chart
│ │                                 │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ ▼ BTCUSDT (3 patterns)             │
│   ├── [Head & Shoulders] 85% SHORT │  ← Scan Results
│   ├── [Double Top] 78% SHORT       │
│   └── [Bullish Flag] 72% LONG      │
├─────────────────────────────────────┤
│ 📊 Multi-TF Confluence (TIER2+)    │  ← Multi-TF Section
└─────────────────────────────────────┘
```

#### State Management
```javascript
// From ScannerContext (Persisted)
const {
  scanResults,        // Array<ScanResult>
  patterns,           // Array<Pattern> - sorted by confidence
  selectedCoins,      // Array<string> - symbols to scan
  selectedTimeframe,  // string - '1h', '4h', '1d', '1w'
  multiTFResults,     // MultiTFResult | null
  lastScanTime,       // Date
} = useScanner();

// Local State
const [loading, setLoading] = useState(false);
const [scanning, setScanning] = useState(false);
const [currentPrice, setCurrentPrice] = useState(null);
const [priceChange, setPriceChange] = useState(null);
const [paperTradeModalVisible, setPaperTradeModalVisible] = useState(false);
const [selectedPattern, setSelectedPattern] = useState(null);
const [openPositionsCount, setOpenPositionsCount] = useState(0);
```

#### Key Functions
```javascript
// Scan all selected coins
handleScan(coinsToScan = null)
  → Sets scanning state
  → Calls patternDetection.detectPatterns() for each coin
  → Batches 50 coins at a time (parallel)
  → Updates scanResults & patterns in context
  → Auto-triggers multi-TF for TIER2+ (single coin)

// Subscribe to price updates
subscribeToPrice(symbol)
  → Opens WebSocket to Binance
  → Updates currentPrice & priceChange on message

// Open paper trade modal
handlePaperTrade(pattern)
  → Sets selectedPattern
  → Opens PaperTradeModal

// Refresh positions count
handlePaperTradeSuccess()
  → Closes modal
  → Updates openPositionsCount
```

---

### 3.2 OpenPositionsScreen
**Path:** `gem-mobile/src/screens/Scanner/OpenPositionsScreen.js`

#### Purpose
View and manage open paper trading positions with real-time P&L

#### Layout Structure
```
┌─────────────────────────────────────┐
│ ← Open Positions           🔄      │  ← Header
├─────────────────────────────────────┤
│ ┌───────┐ ┌───────┐ ┌───────┐     │
│ │$9,500 │ │  3    │ │ 75%   │     │  ← Stats Row
│ │Balance│ │ Open  │ │WinRate│     │
│ └───────┘ └───────┘ └───────┘     │
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │ BTCUSDT  LONG            [X]   │ │
│ │ +$125.50 (+12.5%)              │ │  ← Position Card
│ │ Entry: $42,000  Current: $42,500│ │
│ │ SL: $41,000     TP: $44,000    │ │
│ │ Size: 500 USDT  Time: 2h 30m   │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ ETHUSDT  SHORT           [X]   │ │
│ │ -$45.20 (-4.5%)                │ │  ← Position Card
│ │ ...                             │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

#### Real-time Updates
```javascript
// Price update interval
useEffect(() => {
  const interval = setInterval(async () => {
    // Fetch current prices from Binance
    const prices = await binanceService.getBatchPrices(symbols);

    // Update positions with new prices
    await paperTradeService.updatePrices(prices);

    // Reload positions
    setPositions(paperTradeService.getOpenPositions(userId));
  }, 10000); // Every 10 seconds

  return () => clearInterval(interval);
}, [symbols]);
```

#### Close Position Flow
```javascript
handleClosePosition(position)
  → Show confirmation alert
  → Get current price from Binance
  → Call paperTradeService.closePosition()
  → Calculate realized P&L
  → Show success/loss notification
  → Remove from positions list
  → Update balance
```

---

### 3.3 PatternDetailScreen
**Path:** `gem-mobile/src/screens/Scanner/PatternDetailScreen.js`

#### Purpose
Detailed analysis view of a detected pattern

#### Layout Structure
```
┌─────────────────────────────────────┐
│ ← Head & Shoulders                  │
│   BTCUSDT  [SHORT]                  │  ← Header
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │                                 │ │
│ │    TradingView Chart            │ │  ← Full Chart
│ │    (Entry/SL/TP lines)          │ │
│ │                                 │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ Current Price: $42,100              │  ← Price Card
├─────────────────────────────────────┤
│ Entry:    $42,000                   │
│ TP:       $40,000  (+5.0%)          │  ← Trade Levels
│ SL:       $43,000  (-2.4%)          │
├─────────────────────────────────────┤
│ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐
│ │ 85%   │ │ 2.1:1 │ │ 72%   │ │  4H   │  ← Stats Grid
│ │Confid.│ │  R:R  │ │WinRate│ │  TF   │
│ └───────┘ └───────┘ └───────┘ └───────┘
├─────────────────────────────────────┤
│ ✓ Volume Confirmation               │
│ ✓ Trend Alignment: Strong           │  ← Enhancement (TIER2+)
│ ✓ S/R Confluence: 85                │
│ ✓ RSI Divergence Detected           │
├─────────────────────────────────────┤
│ Classic bearish reversal pattern... │  ← Description
└─────────────────────────────────────┘
```

#### Enhancement Stats (TIER2+ Only)
```javascript
// Shown only for TIER2/TIER3 users
{
  volumeConfirmation: true,      // Volume spike detected
  trendAlignment: 'strong',      // Larger timeframe trend
  confluenceScore: 85,           // S/R level confluence
  rsiDivergence: true,           // RSI divergence detected
  qualityGrade: 'A+'             // Overall pattern quality
}
```

---

### 3.4 PaperTradeHistoryScreen
**Path:** `gem-mobile/src/screens/Account/PaperTradeHistoryScreen.js`

#### Purpose
View closed paper trades and trading statistics with settings

#### Layout Structure
```
┌─────────────────────────────────────┐
│ ← Lịch Sử Paper Trade        ⚙️    │  ← Header + Settings
├─────────────────────────────────────┤
│ ┌───────┐ ┌───────┐ ┌───────┐     │
│ │   1   │ │   5   │ │ 60%   │     │  ← Stats Row 1
│ │Đang Mở│ │Đã Đóng│ │WinRate│     │
│ └───────┘ └───────┘ └───────┘     │
│ ┌───────┐ ┌───────┐               │
│ │   3   │ │   2   │               │  ← Stats Row 2
│ │ Thắng │ │ Thua  │               │
│ └───────┘ └───────┘               │
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
│ │ BTCUSDT  LONG  [ĐANG MỞ]       │ │
│ │ +$125.50  +12.5%               │ │  ← Trade Cards
│ │ Entry: $42,000  Current: $42,500│ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

#### Settings Modal Features
```javascript
// Cài đặt Paper Trade Modal
┌─────────────────────────────────────┐
│ Cài Đặt Paper Trade           [X]  │
├─────────────────────────────────────┤
│ Cài Đặt Hiện Tại                    │
│ ┌─────────────────────────────────┐ │
│ │ Vốn ban đầu:     $10,000       │ │
│ │ Số dư hiện tại:  $10,500       │ │
│ │ Lệnh đang mở:    1             │ │
│ │ Tổng lệnh đã đóng: 5           │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ Đặt Vốn Ban Đầu Mới                 │
│ ┌─────────────────────────────────┐ │
│ │ $ [_______________]            │ │
│ └─────────────────────────────────┘ │
│ [$1K][$5K][$10K][$50K][$100K]      │  ← Quick Set
│                                     │
│ [  Áp Dụng (Giữ Lịch Sử)      ]   │
│ [  Áp Dụng & Reset Tài Khoản   ]   │
├─────────────────────────────────────┤
│ Tùy Chọn Reset                      │
│ [🔄 Reset Tài Khoản               ]│
│    Xóa tất cả lệnh, giữ vốn $10K   │
│ [⚠️ Reset Về Mặc Định             ]│
│    Reset tất cả về $10,000         │
├─────────────────────────────────────┤
│ ⚠️ Paper Trade chỉ dùng để thực    │
│    hành. Kết quả không phản ánh    │
│    giao dịch thực tế.              │
└─────────────────────────────────────┘
```

---

### 3.5 PortfolioScreen
**Path:** `gem-mobile/src/screens/Account/PortfolioScreen.js`

#### Purpose
Track real crypto portfolio holdings (separate from paper trading)

#### Features
- Total balance display
- Individual coin holdings with live prices
- 24h price change tracking
- Add/Edit/Delete holdings
- Real-time Binance price updates

---

## 4. SCANNER COMPONENTS

### 4.1 CoinSelector
**Path:** `gem-mobile/src/screens/Scanner/components/CoinSelector.js`

#### Features
| Feature | Description |
|---------|-------------|
| 500+ Coins | All Binance USDT perpetual pairs |
| Search | Real-time search by symbol/name |
| Favorites | Save frequently traded coins |
| Recent | Quick access to recently scanned |
| Multi-select | Select multiple coins (tier-limited) |
| Price Display | Live prices with 24h change |
| Volume | USDT trading volume |

#### Props
```typescript
interface CoinSelectorProps {
  selected: string;                    // Currently selected coin
  onSelect: (coin: string) => void;    // Single selection callback
  multiSelect: boolean;                // Enable multi-select mode
  selectedCoins: string[];             // Array of selected coins
  onCoinsChange: (coins: string[]) => void;
  maxSelection: number;                // Tier-based limit
  userTier: 'FREE' | 'TIER1' | 'TIER2' | 'TIER3';
  onScanNow: (coins: string[]) => void;
  isScanning: boolean;
}
```

#### Tier Limits
| Tier | Max Coins |
|------|-----------|
| FREE | 1 |
| TIER1 | 5 |
| TIER2 | 20 |
| TIER3 | Unlimited (1000) |

---

### 4.2 TradingChart
**Path:** `gem-mobile/src/screens/Scanner/components/TradingChart.js`

#### Technology
- **Library:** lightweight-charts v4.1.0
- **Rendering:** WebView for cross-platform
- **Data Source:** Binance REST API

#### Features
| Feature | Description |
|---------|-------------|
| Candlestick | OHLCV data visualization |
| Volume Bars | Volume confirmation |
| Price Lines | Entry (cyan), TP (green), SL (red) |
| Timeframes | 1m, 5m, 15m, 30m, 1h, 4h, 1d, 1w, 1M |
| Zoom/Pan | Interactive navigation |
| Dark Theme | Matches app theme |
| Fullscreen | Expandable view |

#### Props
```typescript
interface TradingChartProps {
  symbol: string;
  timeframe: string;
  height: number;
  onSymbolPress?: () => void;
  onTimeframeChange?: (tf: string) => void;
  selectedPattern?: Pattern | null;
  patterns?: Pattern[];
}
```

#### Chart Configuration
```javascript
const chartConfig = {
  backgroundColor: '#0D0D0D',
  textColor: '#D1D4DC',
  gridColor: 'rgba(42, 46, 57, 0.5)',
  candleUpColor: '#3AF7A6',
  candleDownColor: '#FF6B6B',
  volumeUpColor: 'rgba(58, 247, 166, 0.5)',
  volumeDownColor: 'rgba(255, 107, 107, 0.5)',
};
```

---

### 4.3 PatternCard
**Path:** `gem-mobile/src/screens/Scanner/components/PatternCard.js`

#### Layout
```
┌─────────────────────────────────────┐
│ ↗️ Head & Shoulders  [FRESH] [A+]  │
│    BTCUSDT           [SHORT]       │
├─────────────────────────────────────┤
│ Confidence: ████████░░ 85%         │
├─────────────────────────────────────┤
│ Entry: $42,000                      │
│ TP: $40,000 (green)  SL: $43,000   │
├─────────────────────────────────────┤
│ R:R 2.1:1  |  WR 72%  |  2m ago    │
│                       [Paper Trade] │
└─────────────────────────────────────┘
```

#### Props
```typescript
interface PatternCardProps {
  pattern: Pattern;
  onPress: () => void;
  onPaperTrade: () => void;
  userTier: string;
}
```

---

### 4.4 ScanResultsSection
**Path:** `gem-mobile/src/screens/Scanner/components/ScanResultsSection.js`

#### Features
- Accordion UI (one coin expanded at a time)
- Patterns grouped by coin
- Filter toggle (show all / only with patterns)
- Sort by pattern count
- Stats summary (total coins, patterns, long/short ratio)

#### Props
```typescript
interface ScanResultsSectionProps {
  results: ScanResult[];
  isScanning: boolean;
  onSelectCoin: (symbol: string) => void;
  onSelectPattern: (pattern: Pattern) => void;
  onPaperTrade: (pattern: Pattern) => void;
  selectedCoin: string;
  selectedPatternId?: string;
  userTier: string;
}
```

---

### 4.5 MultiTFResultsSection
**Path:** `gem-mobile/src/screens/Scanner/components/MultiTFResultsSection.js`

#### Purpose
Display multi-timeframe scan results with confluence analysis (TIER2+ only)

#### Confluence Scoring
| Score | Level | Color |
|-------|-------|-------|
| >75% | HIGH | Green (#3AF7A6) |
| 50-75% | MEDIUM | Gold (#FFBD59) |
| <50% | LOW | Red (#FF6B6B) |

#### Data Structure
```javascript
{
  patternName: 'Bullish Flag',
  direction: 'LONG',
  confluence: {
    score: 85,
    level: 'HIGH'
  },
  timeframes: [
    { timeframe: '1h', confidence: 80, state: 'ACTIVE' },
    { timeframe: '4h', confidence: 88, state: 'ACTIVE' },
    { timeframe: '1d', confidence: 75, state: 'WAITING' }
  ]
}
```

---

### 4.6 PaperTradeModal
**Path:** `gem-mobile/src/screens/Scanner/components/PaperTradeModal.js`

#### Layout
```
┌─────────────────────────────────────┐
│ Paper Trade: Bullish Flag     [X]  │
├─────────────────────────────────────┤
│ BTCUSDT | LONG | 4H | 85%         │
├─────────────────────────────────────┤
│ Position Size                       │
│ ┌─────────────────────────────────┐ │
│ │ $ [500_____________]            │ │
│ └─────────────────────────────────┘ │
│ [$50][$100][$250][$500][$1000]     │
│ [10%][25%][50%][100%]              │
├─────────────────────────────────────┤
│ Quantity:      0.0119 BTC          │
│ Risk:          2.4% ($12)          │
│ Reward:        4.8% ($24)          │
│ R:R Ratio:     2.0:1               │
├─────────────────────────────────────┤
│ Entry:  $42,000 (cyan)             │
│ TP:     $44,000 (green)            │
│ SL:     $41,000 (red)              │
├─────────────────────────────────────┤
│ Available: $9,500                   │
├─────────────────────────────────────┤
│ [        Open Trade              ] │
└─────────────────────────────────────┘
```

#### Calculations
```javascript
const quantity = positionSize / entryPrice;
const riskPercent = Math.abs((stopLoss - entry) / entry * 100);
const rewardPercent = Math.abs((takeProfit - entry) / entry * 100);
const riskAmount = Math.abs(entry - stopLoss) * quantity;
const rewardAmount = Math.abs(takeProfit - entry) * quantity;
const riskRewardRatio = rewardAmount / riskAmount;
```

---

### 4.7 ConfidenceBar
**Path:** `gem-mobile/src/screens/Scanner/components/ConfidenceBar.js`

#### Visual Representation
```
0%     33%        66%       100%
├──────┼──────────┼──────────┤
│ RED  │   GOLD   │  GREEN   │
└──────┴──────────┴──────────┘
```

#### Color Mapping
| Range | Color | Hex |
|-------|-------|-----|
| 0-33% | Red | #FF6B6B |
| 33-66% | Gold | #FFBD59 |
| 66-100% | Green | #3AF7A6 |

---

## 5. SERVICES & BUSINESS LOGIC

### 5.1 Pattern Detection Service
**Path:** `gem-mobile/src/services/patternDetection.js`

#### Available Patterns by Tier

**FREE Tier (3 patterns)**
| Pattern | Type | Direction | Win Rate | R:R |
|---------|------|-----------|----------|-----|
| DPD | Continuation | SHORT | 71% | 2.5 |
| UPU | Continuation | LONG | 68% | 2.8 |
| Head & Shoulders | Reversal | SHORT | 68% | 2.5 |

**TIER1 Exclusive (+4 patterns)**
| Pattern | Type | Direction | Win Rate | R:R |
|---------|------|-----------|----------|-----|
| UPD | Reversal | SHORT | 65% | 2.2 |
| DPU | Reversal | LONG | 67% | 2.4 |
| Double Top | Reversal | SHORT | 66% | 2.3 |
| Double Bottom | Reversal | LONG | 67% | 2.4 |

**TIER2 Exclusive (+8 patterns)**
| Pattern | Type | Direction | Win Rate |
|---------|------|-----------|----------|
| Inv. Head & Shoulders | Reversal | LONG | 69% |
| Ascending Triangle | Continuation | LONG | 66% |
| Descending Triangle | Continuation | SHORT | 65% |
| HFZ | Zone | LONG | 70% |
| LFZ | Zone | SHORT | 71% |
| Symmetrical Triangle | Neutral | BOTH | 63% |
| Rounding Bottom | Reversal | LONG | 68% |
| Rounding Top | Reversal | SHORT | 67% |

**TIER3 Exclusive (+9 patterns)**
| Pattern | Type | Direction | Win Rate |
|---------|------|-----------|----------|
| Bull Flag | Continuation | LONG | 70% |
| Bear Flag | Continuation | SHORT | 69% |
| Wedge | Reversal | BOTH | 64% |
| Cup & Handle | Continuation | LONG | 72% |
| Engulfing | Candlestick | BOTH | 64% |
| Morning/Evening Star | Candlestick | BOTH | 66% |
| Three Methods | Continuation | BOTH | 67% |
| Hammer | Candlestick | LONG | 62% |
| Flag | Continuation | BOTH | 65% |

#### Key Methods
```javascript
// Main detection method
async detectPatterns(symbol, timeframe): Promise<Pattern[]>

// Scan single symbol
async scanSymbol(symbol, mode, options): Promise<Pattern>

// Get patterns available for tier
getPatternsByTier(userTier): PatternType[]

// Set user tier (affects available patterns)
setUserTier(tier: string): void
```

#### Enhancement Features (TIER2+)
```javascript
// Applied only for TIER2+ users
volumeConfirmation()      // Volume spike detection
trendContext()            // Larger timeframe alignment
zoneRetestValidation()    // S/R retest validation
supportResistance()       // Key S/R confluence
candleConfirmation()      // Candle pattern check
rsiDivergence()           // RSI divergence detection
dynamicRROptimization()   // R:R optimization
```

---

### 5.2 Binance Service
**Path:** `gem-mobile/src/services/binanceService.js`

#### API Endpoints
| Endpoint | Purpose |
|----------|---------|
| `/fapi/v1/exchangeInfo` | Coin list (FUTURES) |
| `/fapi/v1/ticker/24hr` | 24h tickers |
| `/fapi/v1/klines` | Candlestick data |
| `/api/v3/ticker/24hr` | 24h tickers (SPOT) |

#### WebSocket
```javascript
// Single symbol subscription
wss://stream.binance.com:9443/ws/{symbol}@ticker

// Kline subscription
wss://fstream.binance.com/ws/{symbol}@kline_{interval}
```

#### Key Methods
```javascript
getAllCoins()                    // 500+ USDT perpetual pairs
getDefaultCoins()                // Top 12 coins
get24hTickers(symbols)           // Spot 24h data
getAllFuturesTickers()           // All futures with volume
getCurrentPrice(symbol)          // Latest price
getKlines(symbol, interval, options) // Candlesticks
subscribe(symbol, callback)      // WebSocket subscription
connect(symbols)                 // Multi-symbol WebSocket
disconnect()                     // Close connections
```

---

### 5.3 Paper Trade Service
**Path:** `gem-mobile/src/services/paperTradeService.js`

#### Storage
- **Local:** AsyncStorage (fast, always available)
- **Sync:** Supabase (backup/cross-device)

#### Storage Keys
```javascript
const STORAGE_KEYS = {
  POSITIONS: 'gem_paper_positions',
  HISTORY: 'gem_paper_history',
  BALANCE: 'gem_paper_balance',
  INITIAL_BALANCE: 'gem_paper_initial_balance',
};
```

#### Key Methods
```javascript
// Initialization
async init(): Promise<void>

// Position Management
async openPosition({pattern, positionSize, userId, leverage}): Promise<Position>
async closePosition(positionId, exitPrice, exitReason): Promise<ClosedTrade>
async updatePrices(prices): Promise<{closed: [], updated: []}>

// Getters
getOpenPositions(userId?): Position[]
getTradeHistory(userId?, limit?): ClosedTrade[]
getBalance(): number
getPositionById(id): Position | null

// Statistics
getStats(userId?): Stats
getEquity(userId?): EquityData

// Balance Management
async recalculateBalance(): Promise<RecalculateResult>
async setInitialBalance(amount, resetAccount?): Promise<SetBalanceResult>
async resetAll(): Promise<ResetResult>
async resetToDefault(): Promise<ResetResult>
getInitialBalance(): number

// Supabase Sync
async syncPositionToSupabase(position, action): Promise<void>
async loadFromSupabase(userId): Promise<void>
```

#### P&L Calculation
```javascript
// For LONG positions
unrealizedPnL = (currentPrice - entryPrice) * quantity;
unrealizedPnLPercent = ((currentPrice - entryPrice) / entryPrice) * 100;

// For SHORT positions
unrealizedPnL = (entryPrice - currentPrice) * quantity;
unrealizedPnLPercent = ((entryPrice - currentPrice) / entryPrice) * 100;
```

#### Balance Calculation
```javascript
// Recalculate balance formula
correctBalance = initialBalance + totalRealizedPnL - usedMargin;

// Equity formula
equity = balance + usedMargin + unrealizedPnL;
```

---

### 5.4 Multi-Timeframe Scanner Service
**Path:** `gem-mobile/src/services/multiTimeframeScanner.js`

#### Tier Access
| Tier | Max TFs | Allowed |
|------|---------|---------|
| FREE | 1 | Current only |
| TIER1 | 1 | Current only |
| TIER2 | 3 | 15m, 1h, 4h, 1d, 1w |
| TIER3 | 5+ | All including 5m, 1M |

#### Key Method
```javascript
async scanMultipleTimeframes(symbol, timeframes, userTier): Promise<MultiTFResult>
```

#### Confluence Calculation
```javascript
const score = (matchingTimeframes / totalScanned) * 100;

// Level determination
if (score > 75) level = 'HIGH';
else if (score >= 50) level = 'MEDIUM';
else level = 'LOW';
```

---

### 5.5 Tier Access Service
**Path:** `gem-mobile/src/services/tierAccessService.js`

#### Methods
```javascript
setTier(userTier)              // Set user's tier
getTier()                      // Get current tier
getMaxCoins()                  // Coins allowed per scan
hasFeature(featureName)        // Check feature access
checkPatternAccess(pattern)    // Can user see this pattern?
```

---

## 6. DESIGN SYSTEM

### 6.1 Colors
**Path:** `gem-mobile/src/utils/tokens.js`

#### Brand Colors
| Name | Hex | Usage |
|------|-----|-------|
| burgundy | #9C0612 | Primary buttons, accents |
| burgundyDark | #6B0F1A | Button pressed states |
| burgundyLight | #C41E2A | Highlights |
| gold | #FFBD59 | Premium features, CTAs |
| goldBright | #FFD700 | Emphasis |

#### Functional Colors
| Name | Hex | Usage |
|------|-----|-------|
| success | #3AF7A6 | Bullish, profit, LONG |
| error | #FF6B6B | Bearish, loss, SHORT |
| warning | #FFB800 | Caution, alerts |
| info | #3B82F6 | Information |

#### Accent Colors
| Name | Hex | Usage |
|------|-----|-------|
| purple | #6A5BFF | Interactive elements |
| purpleGlow | #8C64FF | Glow effects |
| cyan | #00F0FF | Entry prices, highlights |

#### Background Colors
| Name | Hex | Usage |
|------|-----|-------|
| bgDarkest | #05040B | Main background |
| bgMid | #0F1030 | Card backgrounds |
| bgLight | #1a0b2e | Elevated surfaces |

#### Glass Morphism
| Property | Value |
|----------|-------|
| background | rgba(15, 16, 48, 0.55) |
| blur | 18 |
| saturate | 180 |
| borderWidth | 1.2 |
| borderRadius | 18 |

#### Text Colors
| Name | Value | Usage |
|------|-------|-------|
| textPrimary | #FFFFFF | Headings, important |
| textSecondary | rgba(255,255,255,0.8) | Body text |
| textMuted | rgba(255,255,255,0.6) | Labels, hints |
| textSubtle | rgba(255,255,255,0.5) | Disabled |

---

### 6.2 Spacing Scale
```javascript
const SPACING = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 18,
  xxl: 20,
  xxxl: 24,
  huge: 32,
  giant: 40,
};
```

---

### 6.3 Typography
```javascript
const TYPOGRAPHY = {
  sizes: {
    xs: 10,
    sm: 11,
    md: 12,
    base: 13,
    lg: 14,
    xl: 15,
    xxl: 16,
    xxxl: 18,
    display: 20,
    hero: 32,
    giant: 42,
  },
  weights: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
  families: {
    primary: 'System',
    mono: 'Menlo',
  },
};
```

---

### 6.4 Component Styles

#### Glass Card
```javascript
const glassCard = {
  backgroundColor: 'rgba(15, 16, 48, 0.55)',
  borderRadius: 18,
  borderWidth: 1.2,
  borderColor: 'rgba(106, 91, 255, 0.2)',
  padding: 20,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 10 },
  shadowOpacity: 0.3,
  shadowRadius: 20,
};
```

#### Primary Button
```javascript
const primaryButton = {
  backgroundColor: '#9C0612',
  borderRadius: 12,
  paddingVertical: 14,
  paddingHorizontal: 20,
  borderWidth: 1.5,
  borderColor: '#FFBD59',
};

const primaryButtonText = {
  color: '#FFFFFF',
  fontSize: 15,
  fontWeight: '700',
};
```

#### Direction Badge
```javascript
// LONG Badge
const longBadge = {
  backgroundColor: 'rgba(58, 247, 166, 0.2)',
  paddingHorizontal: 8,
  paddingVertical: 3,
  borderRadius: 6,
};

// SHORT Badge
const shortBadge = {
  backgroundColor: 'rgba(255, 107, 107, 0.2)',
  paddingHorizontal: 8,
  paddingVertical: 3,
  borderRadius: 6,
};
```

#### Filter Button
```javascript
const filterButton = {
  paddingHorizontal: 14,
  paddingVertical: 8,
  borderRadius: 20,
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  borderWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.1)',
};

const filterButtonActive = {
  backgroundColor: 'rgba(106, 91, 255, 0.2)',
  borderColor: '#6A5BFF',
};
```

---

### 6.5 Gradients
```javascript
const GRADIENTS = {
  background: ['#05040B', '#0F1030', '#1a0b2e'],
  backgroundLocations: [0, 0.5, 1],

  primaryButton: ['#9C0612', '#6B0F1A'],

  glassBorder: ['#6A5BFF', '#00F0FF'],

  toggleActive: ['#3AF7A6', '#00F0FF'],

  card: ['rgba(15, 16, 48, 0.55)', 'rgba(15, 16, 48, 0.45)'],
};
```

---

### 6.6 Touch Targets
```javascript
const TOUCH = {
  minimum: 44,      // Apple HIG minimum
  recommended: 48,  // Standard button
  comfortable: 56,  // Large touch targets
};
```

---

## 7. USER FLOWS

### 7.1 Main Scanning Flow
```
┌─────────────────────────────────────────────────────────┐
│                    USER OPENS APP                        │
└─────────────────────┬───────────────────────────────────┘
                      ▼
┌─────────────────────────────────────────────────────────┐
│              SCANNER TAB LOADS                           │
│  - Last selected coins restored                          │
│  - Last timeframe restored                               │
│  - Cached results displayed                              │
└─────────────────────┬───────────────────────────────────┘
                      ▼
┌─────────────────────────────────────────────────────────┐
│           USER SELECTS COINS                             │
│  - Click CoinSelector                                    │
│  - Search or browse                                      │
│  - Select 1-N coins (tier-limited)                      │
│  - Click Apply                                           │
└─────────────────────┬───────────────────────────────────┘
                      ▼
┌─────────────────────────────────────────────────────────┐
│           USER CLICKS "SCAN NOW"                         │
│  - Scanning state = true                                 │
│  - UI shows spinner                                      │
└─────────────────────┬───────────────────────────────────┘
                      ▼
┌─────────────────────────────────────────────────────────┐
│           PATTERN DETECTION                              │
│  - Fetch klines from Binance                            │
│  - Analyze price action                                  │
│  - Detect matching patterns                              │
│  - Calculate entry/SL/TP                                │
│  - Apply enhancements (TIER2+)                          │
└─────────────────────┬───────────────────────────────────┘
                      ▼
┌─────────────────────────────────────────────────────────┐
│           RESULTS DISPLAYED                              │
│  - Patterns grouped by coin                              │
│  - Sorted by confidence                                  │
│  - Multi-TF results (TIER2+, single coin)               │
└─────────────────────┬───────────────────────────────────┘
                      ▼
┌───────────────┬─────┴─────┬───────────────┐
│               │           │               │
▼               ▼           ▼               ▼
[View Details] [Paper Trade] [Select Pattern] [Change Coin]
```

---

### 7.2 Paper Trading Flow
```
┌─────────────────────────────────────────────────────────┐
│           USER CLICKS "PAPER TRADE" ON PATTERN           │
└─────────────────────┬───────────────────────────────────┘
                      ▼
┌─────────────────────────────────────────────────────────┐
│           PAPER TRADE MODAL OPENS                        │
│  - Pattern details displayed                             │
│  - Entry/SL/TP shown                                    │
│  - Balance shown                                         │
└─────────────────────┬───────────────────────────────────┘
                      ▼
┌─────────────────────────────────────────────────────────┐
│           USER ENTERS POSITION SIZE                      │
│  - Type amount OR                                        │
│  - Click quick button ($50, $100, etc.) OR              │
│  - Click percentage (10%, 25%, etc.)                    │
└─────────────────────┬───────────────────────────────────┘
                      ▼
┌─────────────────────────────────────────────────────────┐
│           SYSTEM CALCULATES                              │
│  - Quantity = size / entry                              │
│  - Risk % and amount                                     │
│  - Reward % and amount                                   │
│  - R:R ratio                                             │
└─────────────────────┬───────────────────────────────────┘
                      ▼
┌─────────────────────────────────────────────────────────┐
│           USER CLICKS "OPEN TRADE"                       │
└─────────────────────┬───────────────────────────────────┘
                      ▼
┌─────────────────────────────────────────────────────────┐
│           POSITION CREATED                               │
│  - Save to AsyncStorage                                  │
│  - Sync to Supabase                                      │
│  - Deduct from balance                                   │
│  - Show success notification                             │
└─────────────────────┬───────────────────────────────────┘
                      ▼
┌─────────────────────────────────────────────────────────┐
│           POSITION TRACKING                              │
│  - Real-time P&L updates (every 10s)                    │
│  - Auto-close on TP/SL hit                              │
│  - Manual close available                                │
└─────────────────────┬───────────────────────────────────┘
                      ▼
┌─────────────────────────────────────────────────────────┐
│           POSITION CLOSED                                │
│  - Calculate realized P&L                                │
│  - Update balance                                        │
│  - Move to history                                       │
│  - Show result notification                              │
└─────────────────────────────────────────────────────────┘
```

---

### 7.3 Open Positions Management
```
┌─────────────────────────────────────────────────────────┐
│           USER CLICKS PORTFOLIO BUTTON                   │
└─────────────────────┬───────────────────────────────────┘
                      ▼
┌─────────────────────────────────────────────────────────┐
│           OPEN POSITIONS SCREEN LOADS                    │
│  - Fetch all open positions                              │
│  - Display stats (balance, win rate, etc.)              │
│  - Start 10-second price update interval                │
└─────────────────────┬───────────────────────────────────┘
                      ▼
┌─────────────────────────────────────────────────────────┐
│           REAL-TIME UPDATES                              │
│  - Every 10 seconds:                                     │
│    - Fetch current prices from Binance                  │
│    - Update unrealized P&L                              │
│    - Check TP/SL conditions                             │
└─────────────────────┬───────────────────────────────────┘
                      ▼
┌───────────────┬─────┴─────────────────────┐
│               │                           │
▼               ▼                           ▼
[TP/SL HIT]    [MANUAL CLOSE]              [CONTINUE]
     │              │                           │
     ▼              ▼                           │
[Auto-close]   [Confirm dialog]                │
     │              │                           │
     ▼              ▼                           │
[Show notification] [Close at current]         │
     │              │                           │
     └──────────────┴───────────────────────────┘
                    │
                    ▼
           [Update history]
                    │
                    ▼
           [Update balance]
```

---

## 8. DATA STRUCTURES

### 8.1 Pattern Object
```typescript
interface Pattern {
  // Identification
  id: string;
  symbol: string;
  baseAsset: string;

  // Pattern Info
  patternType: string;
  type: 'reversal' | 'continuation' | 'zone' | 'candlestick';
  direction: 'LONG' | 'SHORT' | 'NEUTRAL';
  timeframe: string;
  description: string;

  // Price Levels
  entry: number;
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  target: number;
  targets: number[];
  takeProfit1: number;
  takeProfit2?: number;

  // Confidence & Risk
  confidence: number;      // 0-100
  riskReward: number;      // Ratio
  winRate: number;         // Expected %

  // Current State
  currentPrice: number;
  priceChangePercent: number;
  state: 'FRESH' | 'ACTIVE' | 'WAITING' | 'INVALID' | 'EXPIRED';

  // Timing
  detectedAt: string;      // ISO8601
  createdAt: string;
  updatedAt: string;

  // Enhancement (TIER2+)
  volumeConfirmation?: boolean;
  trendAlignment?: 'strong' | 'moderate' | 'weak';
  confluenceScore?: number;
  rsiDivergence?: boolean;
  qualityGrade?: 'A+' | 'A' | 'B+' | 'B' | 'C' | 'D';
}
```

---

### 8.2 Position Object
```typescript
interface Position {
  // Identification
  id: string;
  orderId: string;

  // User & Source
  userId: string;
  source: 'PATTERN_SCANNER';

  // Symbol & Pattern
  symbol: string;
  baseAsset: string;
  patternType: string;
  timeframe: string;
  confidence: number;

  // Direction & Prices
  direction: 'LONG' | 'SHORT';
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  takeProfit2?: number;
  currentPrice: number;

  // Position Sizing
  positionSize: number;    // USDT amount
  quantity: number;        // Coin quantity
  leverage: number;

  // Risk Calculations
  riskAmount: number;
  rewardAmount: number;
  riskRewardRatio: string;

  // P&L Tracking
  unrealizedPnL: number;
  unrealizedPnLPercent: number;

  // Timing
  openedAt: string;        // ISO8601
  updatedAt: string;

  // Status
  status: 'OPEN' | 'CLOSED' | 'PENDING';
}
```

---

### 8.3 Closed Trade Object
```typescript
interface ClosedTrade extends Position {
  // Exit Info
  exitPrice: number;
  exitReason: 'MANUAL' | 'TAKE_PROFIT' | 'STOP_LOSS' | 'EXPIRE';
  closedAt: string;        // ISO8601

  // Final P&L
  realizedPnL: number;
  realizedPnLPercent: number;
  result: 'WIN' | 'LOSS';
  holdingTime: string;

  // Status
  status: 'CLOSED';
}
```

---

### 8.4 Scan Result Object
```typescript
interface ScanResult {
  symbol: string;
  patterns: Pattern[];
  scannedAt: string;       // ISO8601
  timeframesScanned: string[];
  error?: string;

  // Calculated
  patternCount: number;
  longCount: number;
  shortCount: number;
  bestConfidence: number;
}
```

---

### 8.5 Multi-TF Result Object
```typescript
interface MultiTFResult {
  success: boolean;
  confluence: Array<{
    patternName: string;
    direction: 'LONG' | 'SHORT';
    confluence: {
      score: number;       // 0-100
      level: 'HIGH' | 'MEDIUM' | 'LOW';
    };
    timeframes: Array<{
      timeframe: string;
      patterns: Pattern[];
      confidence: number;
      state: string;
      entry: number;
    }>;
  }>;
  error?: string;
}
```

---

### 8.6 Stats Object
```typescript
interface Stats {
  balance: number;
  equity: number;
  initialBalance: number;
  usedMargin: number;
  availableBalance: number;

  totalTrades: number;     // Closed trades
  openTrades: number;
  wins: number;
  losses: number;
  winRate: number;

  totalPnL: number;        // Realized + Unrealized
  realizedPnL: number;
  unrealizedPnL: number;
  avgPnL: number;

  bestTrade: number;
  worstTrade: number;
  profitFactor: number;
}
```

---

### 8.7 Equity Object
```typescript
interface EquityData {
  initialBalance: number;
  balance: number;
  usedMargin: number;
  unrealizedPnL: number;
  equity: number;          // balance + usedMargin + unrealizedPnL
  availableBalance: number;
}
```

---

## 9. TIER ACCESS CONTROL

### 9.1 Tier Comparison Table
| Feature | FREE | TIER1 | TIER2 | TIER3 |
|---------|------|-------|-------|-------|
| **Patterns** | 3 | 7 | 15 | 24 |
| **Max Coins/Scan** | 1 | 5 | 20 | Unlimited |
| **Timeframes** | 1 | 1 | 3 | 5+ |
| **Multi-TF Scan** | No | No | Yes | Yes |
| **Enhancement Stats** | No | No | Yes | Yes |
| **Quality Grade** | No | No | Yes | Yes |
| **Confluence Score** | No | No | Yes | Yes |
| **Paper Trading** | Yes | Yes | Yes | Yes |
| **Trade History** | Yes | Yes | Yes | Yes |

---

### 9.2 Pattern Access by Tier
```javascript
const TIER_PATTERNS = {
  FREE: ['DPD', 'UPU', 'HEAD_SHOULDERS'],

  TIER1: [
    ...FREE,
    'UPD', 'DPU', 'DOUBLE_TOP', 'DOUBLE_BOTTOM'
  ],

  TIER2: [
    ...TIER1,
    'INVERSE_HEAD_SHOULDERS', 'ASCENDING_TRIANGLE',
    'DESCENDING_TRIANGLE', 'HFZ', 'LFZ',
    'SYMMETRICAL_TRIANGLE', 'ROUNDING_BOTTOM', 'ROUNDING_TOP'
  ],

  TIER3: [
    ...TIER2,
    'BULL_FLAG', 'BEAR_FLAG', 'WEDGE', 'CUP_HANDLE',
    'ENGULFING', 'MORNING_EVENING_STAR', 'THREE_METHODS',
    'HAMMER', 'FLAG'
  ]
};
```

---

### 9.3 Multi-TF Access
```javascript
const MULTI_TF_ACCESS = {
  FREE:  { hasAccess: false, maxTimeframes: 1 },
  TIER1: { hasAccess: false, maxTimeframes: 1 },
  TIER2: { hasAccess: true,  maxTimeframes: 3 },
  TIER3: { hasAccess: true,  maxTimeframes: 5 },
  ADMIN: { hasAccess: true,  maxTimeframes: 7 },
};

const AVAILABLE_TIMEFRAMES = {
  TIER2: ['15m', '1h', '4h', '1d', '1w'],
  TIER3: ['5m', '15m', '1h', '4h', '1d', '1w', '1M'],
};
```

---

## 10. REAL-TIME FEATURES

### 10.1 WebSocket Implementation
```javascript
// Price subscription (ScannerScreen)
const subscribeToPrice = (symbol) => {
  const ws = new WebSocket(
    `wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@ticker`
  );

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    setCurrentPrice(parseFloat(data.c));     // Current price
    setPriceChange(parseFloat(data.P));      // 24h % change
  };

  ws.onerror = () => {
    console.log('WebSocket connection issue - will retry');
  };
};
```

---

### 10.2 Price Update Intervals
| Feature | Update Frequency | Method |
|---------|------------------|--------|
| Chart Price | Real-time | WebSocket |
| Current Price Display | Real-time | WebSocket |
| Position P&L | 10 seconds | REST API batch |
| Coin Selector Prices | 5 minutes (cached) | REST API |

---

### 10.3 Auto-Close Logic
```javascript
// Check TP/SL in updatePrices()
for (const position of openPositions) {
  const isLong = position.direction === 'LONG';

  // Check Stop Loss
  const hitStopLoss = isLong
    ? currentPrice <= position.stopLoss
    : currentPrice >= position.stopLoss;

  if (hitStopLoss) {
    await closePosition(position.id, position.stopLoss, 'STOP_LOSS');
    continue;
  }

  // Check Take Profit
  const hitTakeProfit = isLong
    ? currentPrice >= position.takeProfit
    : currentPrice <= position.takeProfit;

  if (hitTakeProfit) {
    await closePosition(position.id, position.takeProfit, 'TAKE_PROFIT');
  }
}
```

---

## 11. ERROR HANDLING

### 11.1 Pattern Detection Errors
| Error | Handling |
|-------|----------|
| Invalid symbol | Sanitize & retry |
| API rate limit | Queue & retry with delay |
| Insufficient candles | Return empty patterns |
| Corrupted data | Skip pattern, continue |
| Network error | Silent fail, show retry button |

---

### 11.2 Paper Trade Validation
```javascript
// Input Validation
if (positionSize <= 0) {
  Alert.alert('Lỗi', 'Vui lòng nhập số tiền hợp lệ');
  return;
}

if (positionSize > balance) {
  Alert.alert('Lỗi', 'Số dư không đủ');
  return;
}

if (!pattern.entry || !pattern.stopLoss) {
  Alert.alert('Lỗi', 'Pattern không hợp lệ');
  return;
}
```

---

### 11.3 WebSocket Error Handling
```javascript
ws.onerror = (error) => {
  // Don't show alert - errors are expected on mobile
  console.log('WebSocket connection issue - will retry');
};

ws.onclose = () => {
  // Handle gracefully - prices will update from REST API fallback
  console.log('WebSocket closed');
};
```

---

## 12. PERFORMANCE OPTIMIZATIONS

### 12.1 Batch Processing
```javascript
// Scan 50 coins at a time (parallel)
const BATCH_SIZE = 50;

for (let i = 0; i < coins.length; i += BATCH_SIZE) {
  const batch = coins.slice(i, i + BATCH_SIZE);

  await Promise.all(
    batch.map(coin => patternDetection.detectPatterns(coin, tf))
  );
}
```

---

### 12.2 Memoization
```javascript
// ScannerScreen
const filteredResults = useMemo(() => {
  return results.filter(r => r.patterns.length > 0);
}, [results, showOnlyWithPatterns]);

// PatternCard
const formattedPrice = useMemo(() => {
  return formatPrice(pattern.entry);
}, [pattern.entry]);
```

---

### 12.3 Lazy Loading
- Chart loads only when viewed (WebView on-demand)
- Sponsor banners distributed throughout scroll
- Patterns in accordion (one coin expanded at a time)

---

### 12.4 Caching
```javascript
// Binance coins cached 5 minutes
const CACHE_DURATION = 5 * 60 * 1000;

// AsyncStorage for paper trades
// - Positions persisted locally
// - Synced to Supabase for backup
```

---

## 13. FILE MANIFEST

```
gem-mobile/src/
├── screens/
│   ├── Scanner/
│   │   ├── ScannerScreen.js           # Main trading screen
│   │   ├── OpenPositionsScreen.js     # Paper trade positions
│   │   ├── PatternDetailScreen.js     # Pattern analysis
│   │   └── components/
│   │       ├── CoinSelector.js        # Coin picker
│   │       ├── TradingChart.js        # Candlestick chart
│   │       ├── PatternCard.js         # Pattern display
│   │       ├── ScanResultsSection.js  # Results grouping
│   │       ├── MultiTFResultsSection.js # Multi-TF results
│   │       ├── PaperTradeModal.js     # Trade entry
│   │       ├── ConfidenceBar.js       # Confidence display
│   │       └── index.js
│   └── Account/
│       ├── PortfolioScreen.js         # Real portfolio
│       └── PaperTradeHistoryScreen.js # Trade history
├── services/
│   ├── patternDetection.js            # Pattern algorithm
│   ├── binanceService.js              # Binance API
│   ├── paperTradeService.js           # Paper trading
│   ├── multiTimeframeScanner.js       # Multi-TF scanning
│   └── tierAccessService.js           # Feature gating
├── contexts/
│   └── ScannerContext.js              # Scanner state
├── utils/
│   └── tokens.js                      # Design tokens
└── constants/
    └── patternSignals.js              # Pattern definitions
```

---

## CHANGELOG

### Version 2.0 (2025-12-13)
- Added custom initial balance feature
- Added reset account functionality
- Added settings modal in PaperTradeHistoryScreen
- Fixed badge count sync between Scanner and History
- Improved balance calculation accuracy
- Added recalculateBalance() function
- Added getEquity() function with initialBalance

### Version 1.0 (Initial)
- Core scanner functionality
- Pattern detection (24 patterns)
- Paper trading system
- Multi-timeframe scanning
- Tier-based access control

---

**END OF DOCUMENT**
