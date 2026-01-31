# GEM Mobile - Scanner/Trading Tab
# COMPLETE FEATURE SPECIFICATION

**Version:** 3.2
**Last Updated:** 2026-01-29
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
- **24 mẫu hình kỹ thuật** được hỗ trợ: Head & Shoulders, Double Top/Bottom, Flag, Wedge, Triangle, và nhiều hơn nữa
- **Độ chính xác cao** với thuật toán AI phân tích hành động giá
- **Tỷ lệ thắng lịch sử** hiển thị cho từng pattern (dựa trên backtest data)
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

## Điểm Nổi Bật So Với Đối Thủ

| Tính Năng | GEM Scanner | TradingView | Coinigy |
|-----------|-------------|-------------|---------|
| Quét tự động 500+ coin | ✅ | ❌ Manual | ❌ Limited |
| Paper Trading tích hợp | ✅ | ❌ | ❌ |
| AI đề xuất Entry/SL/TP | ✅ | ❌ | ❌ |
| Multi-TF Confluence | ✅ | ❌ | ❌ |
| Mobile-first | ✅ | ⚠️ Web-based | ⚠️ Web-based |
| Định dạng số Việt Nam | ✅ | ❌ | ❌ |
| Mindset Check trước giao dịch | ✅ | ❌ | ❌ |

---

## Các Trường Hợp Sử Dụng

### 1. Tìm Cơ Hội Giao Dịch Nhanh
> "Tôi có 15 phút buổi sáng, muốn xem thị trường có setup nào tốt không"

→ Mở Scanner → Chọn Top 20 coin → Scan Now → Xem patterns với confidence > 80%

### 2. Luyện Tập Không Rủi Ro
> "Tôi mới học trading, muốn thử chiến lược mà không mất tiền thật"

→ Sử dụng Paper Trading → Mở lệnh theo pattern → Theo dõi P&L → Học từ kết quả

### 3. Xác Nhận Setup Cá Nhân
> "Tôi thấy 1 setup trên BTCUSDT, muốn AI đánh giá xem có tốt không"

→ Chọn Custom Mode → Nhập Entry/SL/TP của bạn → Xem AI Score (0-100)

### 4. Theo Dõi Đa Coin
> "Tôi muốn biết coin nào đang có pattern trên H4"

→ Chọn ALL coins → Scan trên H4 → Xem kết quả grouped theo coin

### 5. Phân Tích Multi-Timeframe
> "Pattern này có mạnh không? Các TF khác có confirm không?"

→ Scan 1 coin → Xem Multi-TF Results (TIER2+) → Check Confluence Score

---

## Bảng So Sánh Các Gói

| Tính Năng | FREE | TIER1 | TIER2 | TIER3 |
|-----------|------|-------|-------|-------|
| Số mẫu hình | 3 | 7 | 15 | **24** |
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

## Hỗ Trợ Kỹ Thuật

### Dữ Liệu Giá
- **Nguồn**: Binance Futures API (realtime)
- **Fallback**: Binance Spot API
- **Cập nhật**: WebSocket streaming cho giá live

### Lưu Trữ Dữ Liệu
- **Paper Trades**: AsyncStorage (local) + Supabase (cloud sync)
- **Drawings**: Supabase (cloud, cross-device)
- **Settings**: AsyncStorage (local)

### Hiển Thị
- **Chart**: lightweight-charts v4.1.0 (WebView)
- **Định dạng số**: Vietnamese locale (dấu phẩy là phần thập phân)

---

## Keywords (SEO/ASO)

`crypto scanner`, `pattern detection`, `trading bot`, `paper trading`, `binance futures`, `technical analysis`, `chart patterns`, `head and shoulders`, `fibonacci`, `multi-timeframe`, `AI trading`, `quét pattern crypto`, `giao dịch giả lập`, `phân tích kỹ thuật`

---

# TÀI LIỆU KỸ THUẬT CHI TIẾT

*Phần dưới đây dành cho developers và technical reference.*

---

## TABLE OF CONTENTS

1. [Executive Summary](#1-executive-summary)
2. [Architecture Overview](#2-architecture-overview)
3. [Core Screens](#3-core-screens)
4. [Scanner Components](#4-scanner-components)
5. [Trading Components](#5-trading-components)
6. [Drawing Tools](#6-drawing-tools)
7. [Services & Business Logic](#7-services--business-logic)
8. [Design System](#8-design-system)
9. [User Flows](#9-user-flows)
10. [Data Structures](#10-data-structures)
11. [Trading Modes](#11-trading-modes)
12. [Tier Access Control](#12-tier-access-control)
13. [Real-time Features](#13-real-time-features)
14. [Error Handling](#14-error-handling)
15. [Performance Optimizations](#15-performance-optimizations)
16. [File Manifest](#16-file-manifest)

---

## 1. EXECUTIVE SUMMARY

### 1.1 Overview
The Scanner/Trading tab is the core trading interface of GEM Mobile, enabling users to:
- Detect technical patterns across 500+ cryptocurrency pairs
- Execute paper trades with simulated capital (Pattern Mode & Custom Mode)
- Track portfolio performance in real-time
- Analyze multi-timeframe confluence (TIER2+)
- Draw annotations on charts (horizontal lines, trend lines, Fibonacci, positions)
- Manage pending limit orders

### 1.2 Key Features
| Feature | Description |
|---------|-------------|
| Pattern Detection | AI-driven analysis of 24 technical patterns |
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
│   ├── DrawingToolbar (NEW)
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

OpenPositionsScreen
├── StatsContainer
│   ├── BalanceCard
│   └── StatsGrid
├── PendingOrdersSection (NEW)
│   └── PendingOrderCard[]
├── PositionCard[]
│   ├── EditMode (Custom Mode)
│   └── CloseButton
└── HistoryLink

PortfolioScreen
├── BalanceCard
├── ActionButtons
├── SponsorBanners
└── CoinList
    └── CoinCard[]
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

Paper Trade Flow:
1. User opens PaperTradeModal
2. Enters position size, leverage
3. paperTradeService.openPosition() called
4. Position stored locally + synced to Supabase
5. Real-time P&L tracking begins
6. Auto-close on SL/TP hit

Drawing Flow:
1. User opens DrawingToolbar
2. Selects tool (1-click or 2-click)
3. Clicks on chart
4. WebView captures click, snaps to OHLC (magnet mode)
5. Drawing rendered and saved to Supabase
6. Loaded on next chart open
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
Main trading interface for pattern detection, paper trading, and chart analysis

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

// From AuthContext
const { user, userTier } = useAuth();

// Local State
const [loading, setLoading] = useState(false);
const [scanning, setScanning] = useState(false);
const [currentPrice, setCurrentPrice] = useState(null);
const [priceChange, setPriceChange] = useState(null);
const [paperTradeModalVisible, setPaperTradeModalVisible] = useState(false);
const [selectedPattern, setSelectedPattern] = useState(null);
const [openPositionsCount, setOpenPositionsCount] = useState(0);
const [scanQuota, setScanQuota] = useState({ allowed: true, remaining: 5 });

// Drawing State (in TradingChart)
const [showDrawingToolbar, setShowDrawingToolbar] = useState(false);
const [drawingMode, setDrawingMode] = useState(null);
const [drawings, setDrawings] = useState([]);
const [magnetMode, setMagnetMode] = useState(true);
const [pendingPoints, setPendingPoints] = useState(0);
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
  → Increments scan quota

// Subscribe to price updates
subscribeToPrice(symbol)
  → Opens WebSocket to Binance (fstream.binance.com)
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
View and manage open paper trading positions and pending limit orders with real-time P&L

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
│ ┌─────────────────────────────────┐ │
│ │ ETHUSDT  SHORT [Custom]  [X]   │ │
│ │ -$45.20 (-4.5%)   [Chỉnh TP/SL]│ │  ← Editable
│ │ ...                             │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ 📜 Xem Lịch Sử Paper Trade →       │  ← History Link
└─────────────────────────────────────┘
```

#### Real-time Updates
```javascript
// Price update interval
useEffect(() => {
  const interval = setInterval(async () => {
    // Fetch current prices from Binance
    const prices = await binanceService.getBatchPrices(symbols);

    // Check pending orders
    const { filled } = await paperTradeService.checkPendingOrders(prices);

    // Update positions with new prices
    const { closed } = await paperTradeService.updatePrices(prices);

    // Reload positions
    setPositions(paperTradeService.getOpenPositions(userId));
    setPendingOrders(paperTradeService.getPendingOrders(userId));
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

#### Edit TP/SL Flow (Custom Mode Only)
```javascript
handleEditSave(positionId)
  → Validate SL/TP values
    → LONG: SL < Entry < TP
    → SHORT: SL > Entry > TP
  → Call paperTradeService.updatePosition()
  → Recalculate risk/reward
  → Update UI
```

---

### 3.3 PatternDetailScreen
**Path:** `gem-mobile/src/screens/Scanner/PatternDetailScreen.js`

#### Purpose
Detailed analysis view of a detected pattern with editable price levels

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
│ Current Price: $42,100              │  ← Price Card
│ P&L: +$125 (+2.5%)  (if open)      │
├─────────────────────────────────────┤
│ ┌───────────┐ ┌───────────┐        │
│ │ Entry     │ │ Take Profit│        │
│ │ $42,000   │ │ $40,000 ✏️ │        │  ← Price Levels
│ └───────────┘ └───────────┘        │
│ ┌───────────┐ ┌───────────┐        │
│ │ Stop Loss │ │ Liquidation│        │
│ │ $43,000 ✏️│ │ $37,000   │        │
│ └───────────┘ └───────────┘        │
├─────────────────────────────────────┤
│ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐
│ │ 85%   │ │ 2.1:1 │ │ 72%   │ │  4H   │  ← Stats Grid
│ │Confid.│ │  R:R  │ │WinRate│ │  TF   │
│ └───────┘ └───────┘ └───────┘ └───────┘
├─────────────────────────────────────┤
│ AI Score: 78/100  (Custom Mode)    │  ← AI Assessment
├─────────────────────────────────────┤
│ ✓ Volume Confirmation               │
│ ✓ Trend Alignment: Strong           │  ← Enhancement (TIER2+)
│ ✓ S/R Confluence: 85                │
│ ✓ RSI Divergence Detected           │
├─────────────────────────────────────┤
│ Classic bearish reversal pattern... │  ← Description
├─────────────────────────────────────┤
│ [       Đóng Lệnh (red)          ] │  ← Close Button (if open)
└─────────────────────────────────────┘
```

#### Trade Modes Comparison
| Feature | Pattern Mode | Custom Mode |
|---------|--------------|-------------|
| Entry Price | Auto (locked) | Editable |
| Stop Loss | Auto (locked) | Editable |
| Take Profit | Auto (locked) | Editable |
| AI Score | Not shown | Shown (0-100) |
| Order Type | Always MARKET | MARKET or LIMIT |
| Badge Color | Gold (#FFBD59) | Warning (#FFB900) |

#### Liquidation Calculation
```javascript
// Binance Futures formula
const mmr = 0.004; // 0.4% maintenance margin rate
const imr = 1 / leverage;

// LONG Position
liquidationPrice = entry * (1 - imr + mmr);
// Example: 42000 * (1 - 0.1 + 0.004) = 42000 * 0.904 = 37,968

// SHORT Position
liquidationPrice = entry * (1 + imr - mmr);
// Example: 42000 * (1 + 0.1 - 0.004) = 42000 * 1.096 = 46,032
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
│ │ BTCUSDT  LONG  [WIN]           │ │
│ │ +$125.50  +12.5%               │ │  ← Trade Cards
│ │ Entry: $42,000  Exit: $44,000  │ │
│ │ Closed: 2h ago  Reason: TP HIT │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

#### Settings Modal Features
```
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
│ [⚠️ Reset Về Mặc Định             ]│
└─────────────────────────────────────┘
```

---

### 3.5 PortfolioScreen
**Path:** `gem-mobile/src/screens/Account/PortfolioScreen.js`

#### Purpose
Track real crypto portfolio holdings (separate from paper trading)

#### Features
- Total balance display with show/hide toggle
- Quick action buttons (Send, Receive, Buy, P2P, Swap)
- Individual coin holdings with live Binance prices
- 24h price change tracking
- Add/Edit/Delete holdings modal
- Coin search with auto-complete
- Real-time price updates

#### Layout Structure
```
┌─────────────────────────────────────┐
│ ← Portfolio              🔔 ⚙️     │  ← Header
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │ Tổng tài sản           [👁]    │ │
│ │ $12,345.67                     │ │  ← Balance Card
│ │ +$234.56 (+1.93%) 24h          │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ [Send][Receive][Buy][P2P][Swap]    │  ← Action Buttons
├─────────────────────────────────────┤
│ 📣 Sponsor Banners                  │
├─────────────────────────────────────┤
│ Danh Mục                  [+ Thêm] │
│ ┌─────────────────────────────────┐ │
│ │ 🪙 BTC                 0.5     │ │
│ │    $21,000  +2.5%              │ │  ← Coin Card
│ │    Total: $10,500  +$250 🗑️   │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ 🪙 ETH                 2.0     │ │
│ │    $1,600  -1.2%               │ │
│ │    Total: $3,200  -$40  🗑️    │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

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
- **Data Source:** Binance REST API (Futures + Spot fallback)

#### Features
| Feature | Description |
|---------|-------------|
| Candlestick | OHLCV data visualization |
| Volume Bars | Volume confirmation toggle |
| Price Lines | Entry (blue), TP (green), SL (red) |
| Timeframes | 1m, 5m, 15m, 30m, 1h, 4h, 1d, 1w |
| Zoom/Pan | Interactive navigation |
| Dark/Light | Theme toggle |
| Fullscreen | Expandable modal view |
| **Drawing Tools** | 6 annotation tools |
| **Magnet Mode** | Snap to OHLC prices |

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
  zoneData?: ZoneData | null;        // Zone visualization data
  onPriceUpdate?: (price: number) => void;  // Real-time price callback for P&L sync
}
```

#### Chart Configuration
```javascript
const chartConfig = {
  backgroundColor: '#0D0D0D',
  textColor: '#D1D4DC',
  gridColor: 'rgba(42, 46, 57, 0.5)',
  candleUpColor: '#22C55E',    // Green
  candleDownColor: '#EF4444',  // Red
  volumeUpColor: 'rgba(34, 197, 94, 0.5)',
  volumeDownColor: 'rgba(239, 68, 68, 0.5)',
};
```

#### Zone Visualization
The chart can display pattern zones showing the exact candles where the pattern was detected.

**Zone Data Structure:**
```typescript
interface ZoneData {
  entry: number;
  stopLoss: number;
  takeProfit: number;
  direction: 'LONG' | 'SHORT';
  formation_time: number;      // Unix timestamp when pattern was detected
  start_time?: number;         // Alias for formation_time
  end_time?: number;           // Optional zone end time
  isPositionZone?: boolean;    // Whether this is from an open position
}
```

**Zone Positioning (CRITICAL):**
- Zones MUST be positioned at the exact candles where the pattern was detected
- Uses `formation_time` from patternData, NOT recent candles
- Time-based coordinates ensure zones are "sticky" to candles and move with zoom/pan
- Sources for formation_time (in priority order):
  1. `pattern.formation_time`
  2. `pattern.formationTime`
  3. `pattern.start_time`
  4. `pattern.startTime`
  5. `position.openedAt` (fallback for positions)

```javascript
// Zone creation in ScannerScreen/PatternDetailScreen
const formationTime = pd.formation_time || pd.formationTime ||
                      pd.start_time || pd.startTime;
const positionZone = {
  entry: pattern.entry,
  stopLoss: pattern.stopLoss,
  takeProfit: pattern.takeProfit,
  direction: pattern.direction,
  formation_time: formationTime,  // ✅ Correct: at pattern detection candles
  isPositionZone: true,
};
```

#### P&L Real-time Sync
The chart emits price updates via WebSocket for synchronized P&L display.

```javascript
// TradingChart sends price updates to React Native
window.ReactNativeWebView.postMessage(JSON.stringify({
  type: 'price_update',
  price: closePrice,
  symbol: SYMBOL
}));

// Parent component receives price updates
const handleChartPriceUpdate = useCallback((price) => {
  if (price && !isNaN(price)) {
    setCurrentPrice(price);  // P&L updates immediately
  }
}, []);

<TradingChart
  onPriceUpdate={handleChartPriceUpdate}
  // ... other props
/>
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

---

## 5. TRADING COMPONENTS

### 5.1 ChartToolbar
**Path:** `gem-mobile/src/components/Trading/ChartToolbar.js`

#### Purpose
Horizontal scrollable toolbar for chart controls

#### Props
```typescript
interface ChartToolbarProps {
  // Timeframe controls
  timeframes?: string[];           // Default: ['1m', '5m', '15m', '1h', '4h', '1D', '1W']
  activeTimeframe?: string;        // Default: '4h'
  onTimeframeChange?: (tf: string) => void;

  // Price lines
  showPriceLines?: boolean;        // Default: true
  onTogglePriceLines?: () => void;

  // Volume
  showVolume?: boolean;            // Default: false
  onToggleVolume?: () => void;

  // Drawing tools
  onToggleDrawing?: () => void;
  activeIndicators?: string[];     // ['drawing'] when active

  // Other controls
  onToggleIndicators?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onFullscreen?: () => void;
  onToggleTheme?: () => void;
  compact?: boolean;
}
```

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
  marginRight: 4,
}

timeframeButtonActive: {
  backgroundColor: 'rgba(255, 189, 89, 0.2)',
  borderWidth: 1,
  borderColor: 'rgba(255, 189, 89, 0.5)',
}

toolButton: {
  width: 32,
  height: 32,
  borderRadius: 6,
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
}

toolButtonActive: {
  backgroundColor: 'rgba(255, 189, 89, 0.2)',
  borderWidth: 1,
  borderColor: 'rgba(255, 189, 89, 0.5)',
}
```

---

### 5.2 PendingOrdersSection
**Path:** `gem-mobile/src/components/Trading/PendingOrdersSection.js`

#### Purpose
Display pending limit orders waiting to be filled

#### Props
```typescript
interface PendingOrdersSectionProps {
  orders: PendingOrder[];
  onCancel: (orderId: string) => Promise<void>;
  cancellingId?: string | null;
  loading?: boolean;
}
```

#### Fill Logic
```javascript
// LONG order fills when price DROPS to entry
fills when: currentPrice <= entryPrice

// SHORT order fills when price RISES to entry
fills when: currentPrice >= entryPrice
```

#### Styles
```javascript
container: {
  marginBottom: SPACING.lg,
}

orderCard: {
  backgroundColor: GLASS.background,
  borderRadius: 14,
  padding: SPACING.md,
  borderWidth: 1,
  borderColor: 'rgba(255, 189, 89, 0.2)',  // Gold border
}

priceContainer: {
  backgroundColor: 'rgba(255, 189, 89, 0.1)',
  borderRadius: 10,
  padding: SPACING.sm,
}

// Direction badges
LONG: { backgroundColor: COLORS.success, color: '#000' }
SHORT: { backgroundColor: COLORS.error, color: '#FFF' }
```

---

### 5.3 MindsetCheckModal & MindsetAdvisor
**Paths:**
- `gem-mobile/src/components/Trading/MindsetCheckModal.js`
- `gem-mobile/src/components/Trading/MindsetAdvisor.js`

#### Purpose
Prompt traders to assess their mental state before opening a trade. Logs mindset assessments to Supabase for analytics.

#### Layout
```
┌─────────────────────────────────────┐
│ Kiểm Tra Tâm Lý Trading        [X] │
├─────────────────────────────────────┤
│ Bạn đang cảm thấy thế nào?          │
│                                     │
│ ┌───────────────────────────────┐   │
│ │ 😊 Tự tin & Bình tĩnh         │   │
│ └───────────────────────────────┘   │
│ ┌───────────────────────────────┐   │
│ │ 😐 Bình thường                │   │
│ └───────────────────────────────┘   │
│ ┌───────────────────────────────┐   │
│ │ 😰 Lo lắng / Căng thẳng       │   │
│ └───────────────────────────────┘   │
│ ┌───────────────────────────────┐   │
│ │ 🤑 FOMO / Nóng vội            │   │
│ └───────────────────────────────┘   │
├─────────────────────────────────────┤
│ [      Tiếp tục giao dịch        ] │
└─────────────────────────────────────┘
```

#### Props
```typescript
interface MindsetAdvisorProps {
  visible: boolean;
  onClose: () => void;
  onComplete: () => void;
  tradeInfo: {
    symbol: string;
    direction: 'LONG' | 'SHORT';
    amount: number;
    riskPercent?: number;
  };
  sourceScreen: 'paper_trade_modal' | 'gemmaster' | 'quick_action' | 'scanner';
}
```

#### Database Schema
```sql
CREATE TABLE trading_mindset_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  source_screen VARCHAR(30) CHECK (source_screen IN (
    'paper_trade_modal', 'gemmaster', 'quick_action', 'scanner'
  )),
  mindset_state VARCHAR(30),
  trade_symbol VARCHAR(20),
  trade_direction VARCHAR(10),
  trade_amount DECIMAL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Integration in PaperTradeModalV2
```javascript
// PaperTradeModalV2.js
import { MindsetAdvisor } from '../components/Trading';

// Show mindset check before confirming trade
<MindsetAdvisor
  visible={showMindsetCheck}
  onClose={() => setShowMindsetCheck(false)}
  onComplete={handleMindsetComplete}
  tradeInfo={{
    symbol: pattern.symbol,
    direction: tradeType,
    amount: positionSize,
  }}
  sourceScreen="paper_trade_modal"  // MUST use allowed value
/>
```

---

### 5.4 PaperTradeModal
**Path:** `gem-mobile/src/screens/Scanner/components/PaperTradeModal.js`

#### Purpose
Form to open a new paper trade position from a pattern

#### Layout
```
┌─────────────────────────────────────┐
│ Paper Trade: Bullish Flag     [X]  │
├─────────────────────────────────────┤
│ BTCUSDT | LONG | 4H | 85%         │
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
│ ┌─────────────────────────────────┐ │
│ │ [10_______________] x           │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ Position Value: $5,000              │
│ Quantity:      0.119 BTC            │
│ Risk (SL):     2.4% ($120)          │
│ Reward (TP):   4.8% ($240)          │
│ R:R Ratio:     2.0:1                │
├─────────────────────────────────────┤
│ Entry:  $42,000 (blue)              │
│ TP:     $44,000 (green)             │
│ SL:     $41,000 (red)               │
├─────────────────────────────────────┤
│ Available: $9,500                    │
├─────────────────────────────────────┤
│ [  Cancel  ][     Open Trade      ] │
└─────────────────────────────────────┘
```

#### Calculations
```javascript
// Position sizing
positionValue = margin * leverage;
quantity = positionValue / entryPrice;

// Risk/Reward (leveraged)
direction = tradeType === 'long' ? 1 : -1;
profitPercent = ((TP - entry) / entry) * direction * 100;
lossPercent = ((entry - SL) / entry) * direction * 100;

profit = (margin * leverage * profitPercent) / 100;
loss = (margin * leverage * Math.abs(lossPercent)) / 100;
riskReward = loss > 0 ? Math.abs(profit / loss) : 0;
```

---

## 6. DRAWING TOOLS

### 6.1 DrawingToolbar
**Path:** `gem-mobile/src/components/Trading/DrawingToolbar.js`

#### Purpose
Drawing tool selection and controls for chart annotations

#### Tools
| Tool ID | Icon | Label | Clicks | Description |
|---------|------|-------|--------|-------------|
| horizontal_line | Minus | Ngang | 1 | Horizontal line at clicked price |
| trend_line | TrendingUp | Xu hướng | 2 | Dashed line from point 1 to 2 |
| rectangle | Square | Chữ nhật | 2 | Top/bottom horizontal lines |
| fibonacci_retracement | GitBranch | Fib | 2 | 7 Fibonacci levels |
| long_position | ArrowUpCircle | Long | 1 | Entry + TP (+4%) + SL (-2%) |
| short_position | ArrowDownCircle | Short | 1 | Entry + TP (-4%) + SL (+2%) |

#### Props
```typescript
interface DrawingToolbarProps {
  visible?: boolean;               // Default: false
  activeTool?: string | null;      // Currently selected tool
  magnetMode?: boolean;            // Default: true
  onSelectTool?: (toolId: string) => void;
  onToggleMagnet?: () => void;
  onDeleteAll?: () => void;
  onClose?: () => void;
  pendingPoints?: number;          // For multi-click tools (0, 1)
}
```

#### Styles
```javascript
container: {
  backgroundColor: 'rgba(26, 32, 44, 0.98)',
  borderTopWidth: 1,
  borderTopColor: 'rgba(255, 255, 255, 0.1)',
  paddingVertical: SPACING.sm,
  paddingHorizontal: SPACING.md,
}

toolButton: {
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
  paddingVertical: SPACING.sm,
  paddingHorizontal: SPACING.xs,
  borderRadius: 8,
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  minHeight: 56,
}

toolButtonActive: {
  backgroundColor: 'rgba(255, 189, 89, 0.15)',
  borderWidth: 1,
  borderColor: 'rgba(255, 189, 89, 0.4)',
}

toolButtonPending: {
  backgroundColor: 'rgba(0, 240, 255, 0.1)',
  borderColor: 'rgba(0, 240, 255, 0.4)',
}

// Tool icon colors
horizontal_line: COLORS.gold (#FFBD59)
trend_line: COLORS.cyan (#00F0FF)
rectangle: COLORS.purple (#6A5BFF)
fibonacci_retracement: COLORS.gold (#FFBD59)
long_position: COLORS.success (#3AF7A6)
short_position: COLORS.error (#FF6B6B)

// Magnet button
magnetActive: {
  backgroundColor: 'rgba(0, 240, 255, 0.15)',
  borderColor: 'rgba(0, 240, 255, 0.4)',
}

// Delete button
deleteButton: {
  backgroundColor: 'rgba(255, 107, 107, 0.1)',
  borderColor: 'rgba(255, 107, 107, 0.3)',
}
```

---

### 6.2 Drawing Service
**Path:** `gem-mobile/src/services/drawingService.js`

#### Purpose
Supabase CRUD operations for chart drawings

#### Methods
```javascript
// Fetch drawings for a chart
fetchDrawings(userId, symbol, timeframe)
// Returns: { data: Drawing[], error: string|null }

// Fetch all drawings for a symbol (all timeframes)
fetchAllDrawingsForSymbol(userId, symbol)
// Returns: { data: Drawing[], error: string|null }

// Save a new drawing
saveDrawing(drawing)
// Returns: { data: Drawing|null, error: string|null }

// Update an existing drawing
updateDrawing(id, updates)
// Returns: { data: Drawing|null, error: string|null }

// Delete a single drawing
deleteDrawing(id)
// Returns: { success: boolean, error: string|null }

// Delete all drawings for a symbol
deleteAllDrawings(userId, symbol)
// Returns: { success: boolean, count: number, error: string|null }

// Toggle visibility
toggleDrawingVisibility(id, isVisible)
// Returns: updateDrawing result

// Export drawings as JSON
exportDrawings(userId, symbol)
// Returns: { data: ExportData|null, error: string|null }

// Import drawings from JSON
importDrawings(userId, importData)
// Returns: { count: number, error: string|null }
```

#### Drawing Object
```typescript
interface Drawing {
  id: UUID;
  user_id: UUID;
  symbol: string;              // 'BTCUSDT'
  timeframe: string;           // '4h'
  tool_type: string;           // 'horizontal_line', 'fibonacci_retracement', etc.
  drawing_data: {
    // horizontal_line
    price: number;
    color: string;

    // trend_line, rectangle, fibonacci_retracement
    startPrice: number;
    startTime: number;
    endPrice: number;
    endTime: number;
    color: string;

    // long_position, short_position
    entryPrice: number;
  };
  name?: string;
  is_visible: boolean;
  z_index: number;
  visible_timeframes: string[];  // Default: all timeframes
  created_at: ISO8601;
  updated_at: ISO8601;
}
```

---

### 6.3 Database Schema
**Path:** `supabase/migrations/20251219_chart_drawings.sql`

```sql
CREATE TABLE IF NOT EXISTS chart_drawings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  symbol VARCHAR(20) NOT NULL,
  timeframe VARCHAR(10) NOT NULL,
  tool_type VARCHAR(30) NOT NULL,
  drawing_data JSONB NOT NULL,
  name VARCHAR(100),
  is_visible BOOLEAN DEFAULT TRUE,
  z_index INTEGER DEFAULT 0,
  visible_timeframes TEXT[] DEFAULT ARRAY['1m','5m','15m','1h','4h','1d','1w'],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
CREATE POLICY "Users can view own drawings" ON chart_drawings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own drawings" ON chart_drawings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own drawings" ON chart_drawings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own drawings" ON chart_drawings
  FOR DELETE USING (auth.uid() = user_id);
```

---

### 6.4 Fibonacci Levels
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

### 6.5 Magnet Mode
When enabled, drawing clicks snap to nearest OHLC value of the clicked candle.

```javascript
function applyMagnetMode(price, time, candleData) {
  // Find candle closest to clicked time
  const closestCandle = findClosestCandle(candleData, time);

  // Get OHLC values
  const ohlc = [candle.open, candle.high, candle.low, candle.close];

  // Find nearest value
  let nearestPrice = price;
  let minDiff = Infinity;

  for (const p of ohlc) {
    const diff = Math.abs(p - price);
    if (diff < minDiff) {
      minDiff = diff;
      nearestPrice = p;
    }
  }

  // Only snap if within 2% threshold
  const snapThreshold = price * 0.02;
  return minDiff < snapThreshold ? nearestPrice : price;
}
```

---

## 7. SERVICES & BUSINESS LOGIC

### 7.1 Pattern Detection Service
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
volumeConfirmation()      // Volume spike detection
trendContext()            // Larger timeframe alignment
zoneRetestValidation()    // S/R retest validation
supportResistance()       // Key S/R confluence
candleConfirmation()      // Candle pattern check
rsiDivergence()           // RSI divergence detection
dynamicRROptimization()   // R:R optimization
```

---

### 7.2 Binance Service
**Path:** `gem-mobile/src/services/binanceService.js`

#### API Endpoints
| Endpoint | Purpose |
|----------|---------|
| `/fapi/v1/exchangeInfo` | Coin list (FUTURES) |
| `/fapi/v1/ticker/24hr` | 24h tickers (FUTURES) |
| `/fapi/v1/klines` | Candlestick data (FUTURES) |
| `/api/v3/ticker/24hr` | 24h tickers (SPOT fallback) |
| `/api/v3/klines` | Candlestick data (SPOT fallback) |

#### WebSocket
```javascript
// Futures price subscription
wss://fstream.binance.com/ws/{symbol}@ticker

// Spot price subscription (fallback)
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

### 7.3 Paper Trade Service
**Path:** `gem-mobile/src/services/paperTradeService.js`

#### Storage
- **Local:** AsyncStorage (fast, always available)
- **Sync:** Supabase (backup/cross-device)

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

#### Key Methods
```javascript
// Initialization
async init(): Promise<void>

// Position Management
async openPosition({
  pattern,
  positionSize,      // Margin in USDT
  userId,
  leverage = 10,
  positionValue,     // margin * leverage
  currentMarketPrice,
  tradeMode,         // 'pattern' | 'custom'
  patternEntry,
  patternSL,
  patternTP,
  entryDeviationPercent,
  slDeviationPercent,
  tpDeviationPercent,
  aiScore,
  aiFeedback,
}): Promise<Position>

async closePosition(positionId, exitPrice, exitReason): Promise<ClosedTrade>
async updatePrices(prices): Promise<{closed: [], updated: []}>
async updatePosition(positionId, updates): Promise<Position>

// Pending Orders
getPendingOrders(userId?): PendingOrder[]
async checkPendingOrders(prices): Promise<{filled: [], notFilled: []}>

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
ROE = unrealizedPnLPercent * leverage;

// For SHORT positions
unrealizedPnL = (entryPrice - currentPrice) * quantity;
unrealizedPnLPercent = ((entryPrice - currentPrice) / entryPrice) * 100;
ROE = unrealizedPnLPercent * leverage;
```

#### Balance Calculation
```javascript
// Recalculate balance formula
correctBalance = initialBalance + totalRealizedPnL - usedMargin;

// Equity formula
equity = balance + usedMargin + unrealizedPnL;
```

---

### 7.4 Multi-Timeframe Scanner Service
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

## 8. DESIGN SYSTEM

### 8.1 Colors
**Path:** `gem-mobile/src/utils/tokens.js`

#### Brand Colors
| Name | Hex | Usage |
|------|-----|-------|
| burgundy | #9C0612 | Primary buttons, scan button |
| burgundyDark | #6B0F1A | Button pressed states |
| burgundyLight | #C41E2A | Highlights |
| gold | #FFBD59 | Premium features, CTAs, active states |
| goldBright | #FFD700 | Emphasis |

#### Functional Colors
| Name | Hex | Usage |
|------|-----|-------|
| success | #3AF7A6 | Bullish, profit, LONG, positive |
| error | #FF6B6B | Bearish, loss, SHORT, negative |
| warning | #FFB800 | Caution, alerts, custom mode |
| info | #3B82F6 | Information, entry price |

#### Accent Colors
| Name | Hex | Usage |
|------|-----|-------|
| purple | #6A5BFF | Interactive elements, borders |
| purpleGlow | #8C64FF | Glow effects |
| cyan | #00F0FF | Entry prices, trend lines, magnet mode |

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
| textDisabled | rgba(255,255,255,0.4) | Inactive |

---

### 8.2 Spacing Scale
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

---

### 8.3 Typography
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
    extrabold: '800',
  },
  families: {
    primary: 'System',
    mono: 'Menlo',
  },
};
```

---

### 8.4 Component Styles

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

// Pressed state
const primaryButtonPressed = {
  backgroundColor: '#6B0F1A',
  transform: [{ scale: 0.98 }],
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
const longBadgeText = {
  color: '#3AF7A6',
  fontWeight: '700',
};

// SHORT Badge
const shortBadge = {
  backgroundColor: 'rgba(255, 107, 107, 0.2)',
  paddingHorizontal: 8,
  paddingVertical: 3,
  borderRadius: 6,
};
const shortBadgeText = {
  color: '#FF6B6B',
  fontWeight: '700',
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

#### Input Field
```javascript
const input = {
  backgroundColor: 'rgba(0, 0, 0, 0.3)',
  borderRadius: 12,
  borderWidth: 1,
  borderColor: 'rgba(106, 91, 255, 0.3)',
  padding: 18,
  color: '#FFFFFF',
  fontSize: 16,
};

const inputFocused = {
  borderColor: '#6A5BFF',
};
```

---

### 8.5 Gradients
```javascript
const GRADIENTS = {
  background: ['#05040B', '#0F1030', '#1a0b2e'],
  backgroundLocations: [0, 0.5, 1],

  primaryButton: ['#9C0612', '#6B0F1A'],

  glassBorder: ['#6A5BFF', '#00F0FF'],

  toggleActive: ['#3AF7A6', '#00F0FF'],

  card: ['rgba(15, 16, 48, 0.55)', 'rgba(15, 16, 48, 0.45)'],

  gold: ['#FFBD59', '#FFD700'],
};
```

---

### 8.6 Shadows
```javascript
const SHADOWS = {
  // Glass card shadow
  glass: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.7,
    shadowRadius: 20,
    elevation: 10,
  },

  // Button shadow
  button: {
    shadowColor: '#9C0612',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 8,
  },

  // Light shadow (for light theme)
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
};
```

---

### 8.7 Touch Targets
```javascript
const TOUCH = {
  minimum: 44,      // Apple HIG minimum
  recommended: 48,  // Standard button
  comfortable: 56,  // Large touch targets
  gap: 8,           // Minimum gap between targets
};
```

---

### 8.8 Animations
```javascript
const ANIMATION = {
  duration: {
    fast: 150,
    normal: 300,
    slow: 400,
  },
  easing: {
    default: [0.4, 0, 0.2, 1],  // cubic-bezier
  },
};

// Common animations
// Button press: scale(0.98), duration: 150ms
// Modal open: fadeIn + slideUp, duration: 300ms
// Loading spinner: rotate 360deg, duration: 1000ms, linear
// Badge pulse: scale(1.1) + opacity(0.8), duration: 500ms
```

---

### 8.9 Number Formatting (Vietnamese Locale)
**Path:** `gem-mobile/src/utils/formatters.js`

Vietnamese number format uses:
- Decimal separator: comma (,) instead of dot (.)
- Thousands separator: dot (.) instead of comma (,)
- Example: `$259,174.55` (EN) → `$259.174,55` (VI)

#### Available Functions
```javascript
// Price formatting with dynamic precision
formatPrice(price, withSeparators = true)
// >= 1000:    2 decimals (e.g., 90.363,84)
// >= 1:       4 decimals (e.g., 13,5752)
// >= 0.01:    4 decimals (e.g., 0,3195) ← Matches chart labels
// >= 0.0001:  6 decimals
// < 0.0001:   8 decimals

// Percentage formatting
formatConfidence(value, decimals = 1)  // 85.234 → "85,2%"
formatPercent(value, decimals = 1)     // 82.872 → "82,9%"
formatPercentChange(value)             // -2.5 → "-2,50%", +3.2 → "+3,20%"

// Currency formatting
formatCurrency(amount, decimals = 2)   // 9040 → "9.040,00"
formatPriceWithCurrency(price)         // 42000 → "$42.000,00"

// Large numbers with suffixes
formatLargeNumber(num)                 // 1500000 → "1,50M"
formatVolume(volume)                   // Same as formatLargeNumber
formatMarketCap(marketCap)             // 1000000000 → "$1,00B"

// Risk:Reward
formatRiskReward(entry, stopLoss, takeProfit)  // → "1:2,50"
calculateRR(pattern)                            // Returns numeric R:R ratio

// Time formatting
formatTimestamp(timestamp)             // → "24/01/2026, 14:30"
formatRelativeTime(timestamp)          // → "2 giờ trước"
```

#### Usage Example
```javascript
import {
  formatPrice,
  formatConfidence,
  formatCurrency,
  calculateRR,
} from '../utils/formatters';

// In component
<Text>Entry: ${formatPrice(pattern.entry)}</Text>
<Text>Confidence: {formatConfidence(pattern.confidence)}</Text>
<Text>Margin: ${formatCurrency(position.margin)}</Text>
<Text>R:R: 1:{calculateRR(pattern).toFixed(2)}</Text>
```

---

## 9. USER FLOWS

### 9.1 Main Scanning Flow
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
│  - WebSocket connects for live prices                    │
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
│  - Check scan quota                                      │
│  - Scanning state = true                                 │
│  - UI shows spinner                                      │
└─────────────────────┬───────────────────────────────────┘
                      ▼
┌─────────────────────────────────────────────────────────┐
│           PATTERN DETECTION                              │
│  - Fetch klines from Binance (Futures → Spot fallback)  │
│  - Analyze price action                                  │
│  - Detect matching patterns                              │
│  - Calculate entry/SL/TP                                │
│  - Apply enhancements (TIER2+)                          │
└─────────────────────┬───────────────────────────────────┘
                      ▼
┌─────────────────────────────────────────────────────────┐
│           RESULTS DISPLAYED                              │
│  - Patterns grouped by coin (CoinAccordion)             │
│  - Sorted by confidence                                  │
│  - Multi-TF results (TIER2+, single coin)               │
│  - Increment quota usage                                 │
└─────────────────────┬───────────────────────────────────┘
                      ▼
┌───────────────┬─────┴─────┬───────────────┐
│               │           │               │
▼               ▼           ▼               ▼
[View Details] [Paper Trade] [Draw on Chart] [Rescan]
```

---

### 9.2 Paper Trading Flow
```
┌─────────────────────────────────────────────────────────┐
│           USER CLICKS "PAPER TRADE" ON PATTERN           │
└─────────────────────┬───────────────────────────────────┘
                      ▼
┌─────────────────────────────────────────────────────────┐
│           PAPER TRADE MODAL OPENS                        │
│  - Pattern details displayed                             │
│  - Entry/SL/TP auto-filled from pattern                 │
│  - Balance shown                                         │
└─────────────────────┬───────────────────────────────────┘
                      ▼
┌─────────────────────────────────────────────────────────┐
│           USER CONFIGURES TRADE                          │
│  - Select trade type (LONG/SHORT)                       │
│  - Enter position size (margin)                         │
│  - Set leverage (1-125x)                                │
│  - (Custom Mode) Edit Entry/SL/TP                       │
└─────────────────────┬───────────────────────────────────┘
                      ▼
┌─────────────────────────────────────────────────────────┐
│           SYSTEM CALCULATES                              │
│  - Position value = margin × leverage                   │
│  - Quantity = value / entry                             │
│  - Risk % and amount                                     │
│  - Reward % and amount                                   │
│  - R:R ratio                                             │
│  - Liquidation price                                     │
└─────────────────────┬───────────────────────────────────┘
                      ▼
┌─────────────────────────────────────────────────────────┐
│           USER CLICKS "OPEN TRADE"                       │
└─────────────────────┬───────────────────────────────────┘
                      ▼
┌─────────────────────────────────────────────────────────┐
│           ORDER TYPE DETERMINED                          │
│  Pattern Mode:                                           │
│    → Always MARKET order (immediate fill)               │
│  Custom Mode:                                            │
│    → If entry = market price: MARKET order              │
│    → If entry ≠ market price: LIMIT order (PENDING)     │
└───────────────┬─────────────────┬───────────────────────┘
                │                 │
        ┌───────▼───────┐ ┌───────▼───────┐
        │ MARKET ORDER  │ │  LIMIT ORDER  │
        │ Status: OPEN  │ │Status: PENDING│
        └───────┬───────┘ └───────┬───────┘
                │                 │
                ▼                 ▼
┌─────────────────────────────────────────────────────────┐
│           POSITION TRACKING                              │
│  - Save to AsyncStorage                                  │
│  - Sync to Supabase                                      │
│  - Deduct margin from balance                            │
│  - Real-time P&L updates (every 10s)                    │
│  - Check pending orders for fills                        │
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

### 9.3 Drawing Tools Flow
```
┌─────────────────────────────────────────────────────────┐
│       USER CLICKS DRAWING ICON IN CHART TOOLBAR          │
└─────────────────────┬───────────────────────────────────┘
                      ▼
┌─────────────────────────────────────────────────────────┐
│           DRAWING TOOLBAR OPENS                          │
│  - 6 tool buttons displayed                              │
│  - Magnet mode toggle (default: ON)                     │
│  - Delete all button                                     │
│  - Close button                                          │
└─────────────────────┬───────────────────────────────────┘
                      ▼
┌─────────────────────────────────────────────────────────┐
│           USER SELECTS TOOL                              │
│  - Tool becomes active (gold highlight)                 │
│  - Helper text shows instructions                        │
│  - WebView enters drawing mode                          │
└─────────────────────┬───────────────────────────────────┘
                      ▼
┌───────────────────────────────────────────────────────────┐
│                   TOOL TYPE?                              │
├───────────────────────┬───────────────────────────────────┤
│    1-CLICK TOOLS      │         2-CLICK TOOLS             │
│  horizontal_line      │  trend_line                       │
│  long_position        │  rectangle                        │
│  short_position       │  fibonacci_retracement            │
└───────────┬───────────┴───────────────┬───────────────────┘
            │                           │
            ▼                           ▼
┌───────────────────────┐   ┌───────────────────────────────┐
│  USER CLICKS CHART    │   │   USER CLICKS FIRST POINT     │
│  (1 click = complete) │   │   - Badge shows "1/2"         │
│                       │   │   - Helper: "Tap second point"│
│                       │   └───────────────┬───────────────┘
│                       │                   ▼
│                       │   ┌───────────────────────────────┐
│                       │   │   USER CLICKS SECOND POINT    │
│                       │   │   - Drawing completes          │
└───────────┬───────────┘   └───────────────┬───────────────┘
            │                               │
            └───────────────┬───────────────┘
                            ▼
┌─────────────────────────────────────────────────────────┐
│           MAGNET MODE APPLIED (if enabled)               │
│  - Find closest candle to click time                    │
│  - Find nearest OHLC value                              │
│  - Snap if within 2% threshold                          │
└─────────────────────┬───────────────────────────────────┘
                      ▼
┌─────────────────────────────────────────────────────────┐
│           DRAWING RENDERED                               │
│  - Immediately visible on chart                         │
│  - WebView posts message to React Native                │
└─────────────────────┬───────────────────────────────────┘
                      ▼
┌─────────────────────────────────────────────────────────┐
│           DRAWING SAVED                                  │
│  - drawingService.saveDrawing() called                  │
│  - Stored in Supabase                                   │
│  - Loaded on next chart open                            │
└─────────────────────────────────────────────────────────┘
```

---

## 10. DATA STRUCTURES

### 10.1 Pattern Object
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

### 10.2 Position Object
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

  // Position Sizing (Binance Futures style)
  margin: number;           // Collateral in USDT
  positionSize: number;     // Same as margin
  positionValue: number;    // margin × leverage
  quantity: number;         // positionValue / entryPrice
  leverage: number;

  // Risk Calculations
  riskAmount: number;
  rewardAmount: number;
  riskRewardRatio: string;

  // P&L Tracking
  unrealizedPnL: number;
  unrealizedPnLPercent: number;

  // Timing
  openedAt: string;         // ISO8601
  filledAt?: string;        // For limit orders
  updatedAt: string;

  // Status
  status: 'OPEN' | 'CLOSED' | 'PENDING';
  orderType: 'MARKET' | 'LIMIT';

  // Trade Mode
  tradeMode: 'pattern' | 'custom';

  // Custom Mode Fields
  patternEntryOriginal?: number;
  patternSLOriginal?: number;
  patternTPOriginal?: number;
  entryDeviationPercent?: number;
  slDeviationPercent?: number;
  tpDeviationPercent?: number;
  aiScore?: number;
  aiFeedback?: string;
}
```

---

### 10.3 Closed Trade Object
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

### 10.4 Pending Order Object
```typescript
interface PendingOrder {
  id: string;
  userId: string;
  symbol: string;
  direction: 'LONG' | 'SHORT';
  entryPrice: number;       // Target entry price
  currentPrice: number;     // Current market price
  margin: number;
  leverage: number;
  status: 'PENDING';
  orderType: 'LIMIT';
  pendingAt: string;        // ISO8601

  // Fills when:
  // LONG: currentPrice <= entryPrice
  // SHORT: currentPrice >= entryPrice
}
```

---

### 10.5 Stats Object
```typescript
interface Stats {
  balance: number;
  equity: number;
  initialBalance: number;
  usedMargin: number;
  availableBalance: number;

  totalTrades: number;     // Closed trades
  openTrades: number;
  pendingOrders: number;
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

## 11. TRADING MODES

### 11.1 Pattern Mode (GEM AI-Generated)
```javascript
tradeMode: 'pattern'

// Characteristics
- Entry: Auto-calculated from pattern detection (locked)
- Stop Loss: Auto-calculated from zone boundary (locked)
- Take Profit: Auto-calculated with TP1/TP2 (locked)
- Order Type: Always MARKET (immediate fill)
- Editable: NO (TP/SL cannot be modified)
- AI Score: Not shown (confidence already in pattern)

// UI Indicators
- Badge: "GEM Pattern Mode" (gold background, lock icon)
- Hint: "TP/SL đã được tối ưu"
- Edit icon: NOT shown on price levels
- Price levels: Read-only display
```

### 11.2 Custom Mode (User-Defined)
```javascript
tradeMode: 'custom'

// Characteristics
- Entry: User-defined (can differ from pattern/market)
- Stop Loss: User-defined with validation
- Take Profit: User-defined with validation
- Order Type: MARKET (if entry = current) or LIMIT (if entry ≠ current)
- Editable: YES (before AND after opening position)
- AI Score: Shown (0-100 assessment of trade quality)

// Validation Rules
LONG Position:
  - stopLoss < entryPrice (SL must be below entry)
  - takeProfit > entryPrice (TP must be above entry)

SHORT Position:
  - stopLoss > entryPrice (SL must be above entry)
  - takeProfit < entryPrice (TP must be below entry)

// UI Indicators
- Badge: "Custom Mode" (warning color, edit icon)
- Hint: "(Có thể chỉnh sửa)"
- Edit icon: Shown on TP/SL fields
- Price levels: Editable with validation
- AI Score: Color-coded (≥80 green, ≥60 gold, ≥40 warning, <40 red)

// Limit Order Detection
isLimitOrder = (
  tradeMode === 'custom' &&
  (
    (direction === 'LONG' && entryPrice < currentMarketPrice) ||
    (direction === 'SHORT' && entryPrice > currentMarketPrice)
  )
)
```

---

## 12. TIER ACCESS CONTROL

### 12.1 Tier Comparison Table
| Feature | FREE | TIER1 | TIER2 | TIER3 |
|---------|------|-------|-------|-------|
| **Patterns** | 3 | 7 | 15 | 24 |
| **Max Coins/Scan** | 1 | 5 | 20 | Unlimited |
| **Timeframes** | 1 | 1 | 3 | 5+ |
| **Multi-TF Scan** | No | No | Yes | Yes |
| **Enhancement Stats** | No | No | Yes | Yes |
| **Quality Grade** | No | No | Yes | Yes |
| **Confluence Score** | No | No | Yes | Yes |
| **Custom Mode** | No | No | Yes | Yes |
| **Pending Orders** | No | No | Yes | Yes |
| **Drawing Tools** | Yes | Yes | Yes | Yes |
| **Paper Trading** | Yes | Yes | Yes | Yes |
| **Trade History** | Yes | Yes | Yes | Yes |
| **Scan Quota/Day** | 5 | 15 | 50 | Unlimited |
| **Max Leverage** | 10x | 20x | 50x | 125x |

---

### 12.2 Pattern Access by Tier
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

## 13. REAL-TIME FEATURES

### 13.1 WebSocket Implementation
```javascript
// Price subscription (ScannerScreen)
const subscribeToPrice = (symbol) => {
  const ws = new WebSocket(
    `wss://fstream.binance.com/ws/${symbol.toLowerCase()}@ticker`
  );

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    setCurrentPrice(parseFloat(data.c));     // Current price
    setPriceChange(parseFloat(data.P));      // 24h % change
  };

  ws.onerror = () => {
    console.log('WebSocket connection issue - will retry');
  };

  ws.onclose = () => {
    // Reconnect after 5 seconds
    setTimeout(() => subscribeToPrice(symbol), 5000);
  };
};
```

---

### 13.2 Price Update Intervals
| Feature | Update Frequency | Method |
|---------|------------------|--------|
| Chart Price | Real-time | WebSocket (kline) |
| Current Price Display | Real-time | WebSocket (ticker) |
| Position P&L | 10 seconds | REST API batch |
| Pending Order Check | 10 seconds | REST API batch |
| Coin Selector Prices | 5 minutes (cached) | REST API |

---

### 13.3 Auto-Close Logic
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

### 13.4 Pending Order Fill Logic
```javascript
// Check pending orders in checkPendingOrders()
for (const order of pendingOrders) {
  const isLong = order.direction === 'LONG';

  // LONG fills when price drops to entry
  // SHORT fills when price rises to entry
  const shouldFill = isLong
    ? currentPrice <= order.entryPrice
    : currentPrice >= order.entryPrice;

  if (shouldFill) {
    await convertToOpenPosition(order);
    filled.push(order);
  }
}
```

---

## 14. ERROR HANDLING

### 14.1 Pattern Detection Errors
| Error | Handling |
|-------|----------|
| Invalid symbol | Sanitize & retry |
| API rate limit | Queue & retry with delay |
| Insufficient candles | Return empty patterns |
| Corrupted data | Skip pattern, continue |
| Network error | Silent fail, show retry button |

---

### 14.2 Paper Trade Validation
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

// Custom Mode Validation
if (tradeMode === 'custom') {
  if (direction === 'LONG' && stopLoss >= entry) {
    Alert.alert('Lỗi', 'Stop Loss phải nhỏ hơn Entry cho lệnh LONG');
    return;
  }
  if (direction === 'SHORT' && stopLoss <= entry) {
    Alert.alert('Lỗi', 'Stop Loss phải lớn hơn Entry cho lệnh SHORT');
    return;
  }
}
```

---

### 14.3 Drawing Tool Errors
```javascript
// WebView message error handling
const handleWebViewMessage = (event) => {
  try {
    const data = JSON.parse(event.nativeEvent.data);
    // Process drawing data...
  } catch (e) {
    console.log('[TradingChart] Message parse error:', e);
    // Silently fail - don't disrupt chart interaction
  }
};

// Database save error
const { error } = await drawingService.saveDrawing(drawing);
if (error) {
  console.error('[Drawing] Save failed:', error);
  // Drawing still visible locally, will retry on next save
}
```

---

## 15. PERFORMANCE OPTIMIZATIONS

### 15.1 Batch Processing
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

### 15.2 Memoization
```javascript
// ScannerScreen
const filteredResults = useMemo(() => {
  return results.filter(r => r.patterns.length > 0);
}, [results, showOnlyWithPatterns]);

// PatternCard
const formattedPrice = useMemo(() => {
  return formatPrice(pattern.entry);
}, [pattern.entry]);

// TradingChart
const chartHtml = useMemo(() => {
  return generateChartHTML();
}, [symbol, timeframe, showVolume, darkTheme, showPriceLines]);
```

---

### 15.3 Lazy Loading
- Chart loads only when viewed (WebView on-demand)
- Sponsor banners distributed throughout scroll
- Patterns in accordion (one coin expanded at a time)
- Drawings loaded per-symbol, per-timeframe

---

### 15.4 Caching
```javascript
// Binance coins cached 5 minutes
const CACHE_DURATION = 5 * 60 * 1000;

// AsyncStorage for paper trades
// - Positions persisted locally
// - Synced to Supabase for backup

// Drawings cached per symbol
// - Loaded once per chart open
// - Updated on save/delete
```

---

## 16. FILE MANIFEST

```
gem-mobile/src/
├── screens/
│   ├── Scanner/
│   │   ├── ScannerScreen.js           # Main trading screen
│   │   ├── OpenPositionsScreen.js     # Paper trade positions
│   │   ├── PatternDetailScreen.js     # Pattern analysis
│   │   ├── MTFDashboardScreen.js      # Multi-timeframe dashboard
│   │   ├── AlertsManagementScreen.js  # Price alerts management
│   │   ├── OddsAnalysisScreen.js      # Odds/probability analysis
│   │   ├── ZoneDetailScreen.js        # Zone detail view
│   │   └── components/
│   │       ├── CoinSelector.js        # Coin picker
│   │       ├── TradingChart.js        # Candlestick chart + drawings
│   │       ├── PatternCard.js         # Pattern display
│   │       ├── ScanResultsSection.js  # Results grouping
│   │       ├── MultiTFResultsSection.js # Multi-TF results
│   │       ├── PaperTradeModal.js     # Trade entry
│   │       ├── ConfidenceBar.js       # Confidence display
│   │       ├── TimeframeButtons.js    # TF selector
│   │       ├── TimeframeSelector.js   # TF selector (alternative)
│   │       └── index.js
│   └── Account/
│       ├── PortfolioScreen.js         # Real portfolio
│       └── PaperTradeHistoryScreen.js # Trade history
├── components/
│   └── Trading/
│       ├── ChartToolbar.js            # Chart controls
│       ├── DrawingToolbar.js          # Drawing tools
│       ├── DrawingListModal.js        # Drawing list management
│       ├── PendingOrdersSection.js    # Pending orders
│       ├── OpenPositionsSection.js    # Open positions
│       ├── PaperTradeModal.js         # Trade modal (deprecated)
│       ├── PaperTradeModalV2.js       # Trade modal with MindsetAdvisor
│       ├── MindsetCheckModal.js       # Mindset assessment modal
│       ├── MindsetAdvisor.js          # Mindset advisor component
│       ├── QuickMindsetWidget.js      # Quick mindset widget
│       ├── AITradeGuard.js            # AI assessment
│       ├── AIAssessmentSection.js     # AI assessment display
│       ├── CoinSelectorModal.js       # Coin selector modal
│       ├── CoinAccordion.js           # Coin accordion
│       ├── CustomModeFields.js        # Custom mode inputs
│       ├── PatternModeFields.js       # Pattern mode display
│       ├── DeviationBadge.js          # Deviation indicator
│       ├── EnhancementStatsCard.js    # Enhancement stats
│       ├── MarginLeverageBar.js       # Margin/leverage bar
│       ├── ModeBanner.js              # Mode indicator banner
│       ├── ModeTabSelector.js         # Mode tab selector
│       ├── MTFAlignmentPanel.js       # MTF alignment panel
│       ├── OnboardingModal.js         # Onboarding modal
│       ├── OrderCalculations.js       # Order calculations
│       ├── OrderLinesSettings.js      # Order lines settings
│       ├── OrderLinesToggle.js        # Order lines toggle
│       ├── OrderTypeSelector.js       # Order type selector
│       ├── PatternInfoCard.js         # Pattern info card
│       ├── PriceInput.js              # Price input
│       ├── PriceLines.js              # Price lines
│       ├── QuantitySlider.js          # Quantity slider
│       ├── ScanResultsAccordion.js    # Results accordion
│       ├── ScoreGauge.js              # Score gauge
│       ├── TPSLSection.js             # TP/SL section
│       ├── ZoneTooltip.js             # Zone tooltip
│       └── index.js
├── services/
│   ├── patternDetection.js            # Pattern algorithm
│   ├── binanceService.js              # Binance API
│   ├── paperTradeService.js           # Paper trading
│   ├── drawingService.js              # Chart drawings
│   ├── multiTimeframeScanner.js       # Multi-TF scanning
│   ├── tierAccessService.js           # Feature gating
│   ├── alertService.js                # Price alerts
│   └── mindsetAdvisorService.js       # Mindset tracking
├── contexts/
│   ├── ScannerContext.js              # Scanner state
│   └── AuthContext.js                 # User & tier
├── utils/
│   ├── tokens.js                      # Design tokens
│   └── formatters.js                  # Number formatting (Vietnamese locale)
└── constants/
    └── patternSignals.js              # Pattern definitions

supabase/
├── migrations/
│   ├── 20251219_chart_drawings.sql    # Drawings table
│   ├── 20260124_trading_mindset_logs.sql # Mindset logs table
│   └── ...
```

---

## CHANGELOG

### Version 3.2 (2026-01-29)
- **Marketing Introduction:** Added comprehensive Vietnamese marketing section
  - Feature overview and benefits
  - Use cases and comparison table
  - Tier comparison for sales reference
  - SEO/ASO keywords
- **Documentation Update:** Updated file manifest with all current components
- **Components Added:**
  - AIAssessmentSection.js
  - CoinSelectorModal.js
  - CoinAccordion.js
  - DrawingListModal.js
  - EnhancementStatsCard.js
  - MarginLeverageBar.js
  - MTFAlignmentPanel.js
  - OrderLinesSettings.js
  - OrderLinesToggle.js
  - ScoreGauge.js
  - ZoneTooltip.js
- **Screens Added:**
  - AlertsManagementScreen.js
  - OddsAnalysisScreen.js
  - ZoneDetailScreen.js
  - MTFDashboardScreen.js

### Version 3.1 (2026-01-24)
- **Zone Positioning Fix:** Zones now display at correct candle positions
  - Uses `formation_time` from pattern data
  - Zones are "sticky" to candles (move with zoom/pan)
  - Removed incorrect "8 recent candles" fallback logic
  - Priority: formation_time > formationTime > start_time > startTime > openedAt
- **P&L Real-time Sync:** Added onPriceUpdate callback to TradingChart
  - Chart emits price updates via WebSocket
  - PatternDetailScreen uses callback for synchronized P&L display
  - Eliminates delay between chart and P&L section
- **MindsetCheckModal Integration:**
  - New MindsetAdvisor component for trading psychology
  - Integrated into PaperTradeModalV2
  - Logs mindset assessments to Supabase
  - sourceScreen constraint: 'paper_trade_modal', 'gemmaster', 'quick_action', 'scanner'
- **Vietnamese Number Formatting (formatters.js):**
  - Centralized number formatting utility
  - Vietnamese locale: comma as decimal, dot as thousands
  - formatPrice: 4 decimals for prices >= 0.01 (matches chart labels)
  - formatConfidence, formatPercent, formatDecimal, formatCurrency
  - formatRiskReward, calculateRR, formatTimestamp, formatRelativeTime
- **Bug Fixes:**
  - Fixed MindsetAdvisor database constraint error (sourceScreen value)
  - Fixed decimal formatting mismatch between chart and display

### Version 3.0 (2025-12-20)
- **Drawing Tools:** Added 6 chart annotation tools
  - Horizontal line, trend line, rectangle
  - Fibonacci retracement (7 levels)
  - Long/Short position (auto TP/SL)
  - Magnet mode for OHLC snapping
  - Supabase persistence
- **Pending Orders:** Added limit order support
  - PENDING status for unfilled orders
  - Auto-fill detection every 10s
  - Cancel pending orders
  - PendingOrdersSection component
- **Custom Mode:** Added user-defined trading
  - Editable Entry/SL/TP
  - AI score assessment
  - Deviation tracking from pattern prices
  - LIMIT order when entry differs from market
- **Trade Modes:** Separated Pattern vs Custom mode
  - Pattern Mode: locked, AI-optimized
  - Custom Mode: editable, AI-scored
- Updated all data structures with new fields
- Enhanced UI/UX documentation

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
