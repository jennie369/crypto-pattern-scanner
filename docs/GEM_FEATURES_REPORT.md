# BÁO CÁO TÍNH NĂNG APP GEM MOBILE

**Ngày:** 2026-01-28
**Version:** 3.2
**Platform:** React Native (Expo)
**Codebase:** gem-mobile/src/

---

## MỤC LỤC

1. [Tổng Quan](#tổng-quan)
2. [Scanner & Pattern Detection](#1-scanner--pattern-detection)
3. [Paper Trade](#2-paper-trade-giao-dịch-mô-phỏng)
4. [Drawing Tools](#3-drawing-tools-công-cụ-vẽ)
5. [GEM Master AI](#4-gem-master-ai-chatbot)
6. [Vision Board](#5-vision-board)
7. [Trader Ritual](#6-trader-ritual)
8. [Partnership/Affiliate](#7-partnershipaffiliate)
9. [Tier System & Access Control](#8-tier-system--access-control)
10. [Shop (Crystal Shop)](#9-shop-crystal-shop)
11. [Tarot](#10-tarot)
12. [I Ching](#11-i-ching)
13. [Community/Forum](#12-communityforum)
14. [Courses](#13-courses)
15. [Alerts/Notifications](#14-alertsnotifications)
16. [Market Data](#15-market-data)
17. [Quota System Chi Tiết](#16-quota-system-chi-tiết)
18. [Database Schema](#17-database-schema)

---

## TỔNG QUAN

| # | Tính năng | Trạng thái | Files chính | Version |
|---|-----------|------------|-------------|---------|
| 1 | Scanner & Pattern Detection | ✅ Hoạt động | patternDetection.js | 3.1 |
| 2 | Paper Trade | ✅ Hoạt động | paperTradeService.js | 3.1 |
| 3 | Drawing Tools | ✅ Hoạt động | DrawingToolbar.js | 3.0 |
| 4 | GEM Master (AI Chatbot) | ✅ Hoạt động | gemMasterAIService.js | 3.0 |
| 5 | Vision Board | ✅ Hoạt động | visionBoardService.js | 2.0 |
| 6 | Trader Ritual | ✅ Hoạt động | RitualPlaygroundScreen.js | 2.0 |
| 7 | Partnership/Affiliate | ✅ Hoạt động | affiliateService.js | 3.0 |
| 8 | Tier System | ✅ Hoạt động | tierAccess.js | 3.1 |
| 9 | Shop (Crystal Shop) | ✅ Hoạt động | shopifyService.js | 3.2 |
| 10 | Tarot | ✅ Hoạt động | TarotScreen.js | 2.0 |
| 11 | I Ching | ✅ Hoạt động | IChingScreen.js | 2.0 |
| 12 | Community/Forum | ✅ Hoạt động | ForumScreen.js | 2.0 |
| 13 | Courses | ✅ Hoạt động | CoursesScreen.js | 3.2 |
| 14 | Alerts/Notifications | ✅ Hoạt động | alertManager.js | 2.0 |
| 15 | Market Data | ✅ Hoạt động | binanceService.js | 3.1 |
| 16 | Mindset Advisor | ✅ MỚI | MindsetAdvisor.js | 3.1 |

**Tổng cộng: 16/16 tính năng đã implement đầy đủ**

---

## 1. SCANNER & PATTERN DETECTION

### Trạng thái: ✅ Hoạt động (Production Ready)

### Files liên quan:
```
gem-mobile/src/
├── services/
│   ├── patternDetection.js       # Engine phát hiện pattern (2,200+ lines)
│   ├── multiTimeframeScanner.js  # Multi-TF scanning (364 lines)
│   ├── confirmationPatterns.js   # Zone confirmation (432 lines)
│   └── binanceService.js         # Market data
├── screens/Scanner/
│   ├── ScannerScreen.js          # Main UI (1,300+ lines)
│   ├── PatternDetailScreen.js    # Chi tiết pattern
│   ├── OpenPositionsScreen.js    # Quản lý lệnh
│   └── components/
│       ├── CoinSelector.js       # Chọn coin
│       ├── TradingChart.js       # Chart với zone visualization
│       ├── ScanResultsSection.js # Kết quả scan
│       ├── PatternCard.js        # Card pattern
│       └── PaperTradeModal.js    # Modal đặt lệnh
└── utils/
    └── formatters.js             # Vietnamese number formatting
```

### 24 Patterns đã implement:

| Tier | Pattern | Type | Direction | Win Rate | R:R |
|------|---------|------|-----------|----------|-----|
| **FREE** | DPD | Continuation | SHORT | 71% | 2.5 |
| **FREE** | UPU | Continuation | LONG | 68% | 2.8 |
| **FREE** | Head & Shoulders | Reversal | SHORT | 68% | 2.5 |
| **TIER1** | DPU | Reversal | LONG | 67% | 2.4 |
| **TIER1** | UPD | Reversal | SHORT | 65% | 2.2 |
| **TIER1** | Double Top | Reversal | SHORT | 66% | 2.3 |
| **TIER1** | Double Bottom | Reversal | LONG | 67% | 2.4 |
| **TIER2** | Inverse H&S | Reversal | LONG | 69% | 2.6 |
| **TIER2** | Ascending Triangle | Continuation | LONG | 66% | 2.3 |
| **TIER2** | Descending Triangle | Continuation | SHORT | 65% | 2.2 |
| **TIER2** | Symmetrical Triangle | Neutral | BOTH | 63% | 2.0 |
| **TIER2** | HFZ | Zone | SHORT | 70% | 2.4 |
| **TIER2** | LFZ | Zone | LONG | 71% | 2.5 |
| **TIER2** | Rounding Bottom | Reversal | LONG | 68% | 2.3 |
| **TIER2** | Rounding Top | Reversal | SHORT | 67% | 2.2 |
| **TIER3** | Bull Flag | Continuation | LONG | 70% | 2.5 |
| **TIER3** | Bear Flag | Continuation | SHORT | 69% | 2.4 |
| **TIER3** | Wedge | Reversal | BOTH | 64% | 2.1 |
| **TIER3** | Engulfing | Candlestick | BOTH | 64% | 2.0 |
| **TIER3** | Morning Star | Candlestick | LONG | 66% | 2.2 |
| **TIER3** | Evening Star | Candlestick | SHORT | 66% | 2.2 |
| **TIER3** | Cup & Handle | Continuation | LONG | 72% | 2.8 |
| **TIER3** | Three Methods | Continuation | BOTH | 67% | 2.3 |
| **TIER3** | Hammer | Candlestick | LONG | 62% | 1.8 |

### Timeframes hỗ trợ:
| Timeframe | Code | Tier Required |
|-----------|------|---------------|
| 1 minute | `1m` | ALL |
| 3 minutes | `3m` | TIER1+ |
| 5 minutes | `5m` | ALL |
| 15 minutes | `15m` | ALL |
| 30 minutes | `30m` | TIER1+ |
| 1 hour | `1h` | ALL |
| 2 hours | `2h` | TIER2+ |
| 4 hours | `4h` | ALL |
| 8 hours | `8h` | TIER2+ |
| 1 day | `1d` | ALL |
| 1 week | `1w` | TIER2+ |
| 1 month | `1M` | TIER3 |

### Coins hỗ trợ:
- **500+ cặp** Binance USDT Perpetual Futures
- Tự động cập nhật từ Binance Exchange Info
- Giới hạn scan theo tier

### Pattern Quality Grades (TIER2+):
| Grade | Confidence | Color | Mô tả |
|-------|------------|-------|-------|
| A+ | ≥85% | Green | Excellent setup |
| A | ≥75% | Green | Very good |
| B+ | ≥65% | Gold | Good |
| B | ≥55% | Gold | Average |
| C | ≥45% | Orange | Below average |
| D | <45% | Red | Risky |

### TIER2+ Enhancements:
| Enhancement | Win Rate Boost | Mô tả |
|-------------|----------------|-------|
| Volume Confirmation | +8-10% | Volume spike detection |
| Trend Analysis | +5-7% | Higher TF trend alignment |
| Retest Validation | +8-12% | S/R retest validation |
| Quality Filtering | +5-8% | Grade-based filtering |
| S/R Confluence | +4-6% | Key level confluence |
| RSI Divergence | +5-8% | RSI divergence detection |
| Dynamic R:R | +2-4% | Optimized R:R ratio |

### Zone Visualization:
```javascript
// Zone hiển thị đúng vị trí nến pattern được detect
const zoneData = {
  entry: pattern.entry,
  stopLoss: pattern.stopLoss,
  takeProfit: pattern.takeProfit,
  direction: pattern.direction,
  formation_time: pattern.formation_time,  // ✅ Vị trí chính xác
  isPositionZone: true,
};
```

**Zone Positioning Priority:**
1. `formation_time` - Thời điểm pattern được detect
2. `formationTime` - Alias
3. `start_time` - Zone start time
4. `startTime` - Alias
5. `openedAt` - Fallback từ position

---

## 2. PAPER TRADE (GIAO DỊCH MÔ PHỎNG)

### Trạng thái: ✅ Hoạt động

### Files liên quan:
```
gem-mobile/src/
├── services/
│   ├── paperTradeService.js      # Core logic
│   └── pendingOrderService.js    # Lệnh chờ LIMIT
├── screens/
│   ├── Scanner/OpenPositionsScreen.js
│   └── Account/PaperTradeHistoryScreen.js
└── components/Trading/
    ├── PaperTradeModalV2.js      # Modal mới với MindsetAdvisor
    ├── PaperTradeModal.js        # Modal cũ (deprecated)
    ├── MindsetCheckModal.js      # Mindset check
    ├── MindsetAdvisor.js         # Mindset advisor
    └── PendingOrdersSection.js   # Lệnh chờ
```

### Chi tiết tính năng:

| Tính năng | Mô tả | Tier |
|-----------|-------|------|
| **Số dư khởi điểm** | $10,000 (tùy chỉnh $100 - $10,000,000) | ALL |
| **Loại lệnh** | MARKET (khớp ngay), LIMIT (lệnh chờ) | TIER2+ for LIMIT |
| **Mode giao dịch** | Pattern Mode, Custom Mode | TIER2+ for Custom |
| **Đòn bẩy** | 1x - 125x (Binance Futures style) | See leverage limits |
| **Stop Loss** | Tự động đóng khi chạm | ALL |
| **Take Profit** | Hỗ trợ TP1, TP2 | ALL |
| **P&L realtime** | WebSocket sync từ Binance | ALL |
| **Lịch sử** | 100 giao dịch gần nhất | ALL |
| **Thống kê** | Win rate, ROE, Profit factor | ALL |

### Leverage Limits theo Tier:
| Tier | Max Leverage |
|------|--------------|
| FREE | 10x |
| TIER1 | 20x |
| TIER2 | 50x |
| TIER3 | 125x |

### Trade Modes:

#### Pattern Mode (GEM AI-Generated):
```javascript
tradeMode: 'pattern'
// - Entry: Auto-calculated từ pattern (LOCKED)
// - Stop Loss: Auto-calculated từ zone boundary (LOCKED)
// - Take Profit: Auto-calculated với TP1/TP2 (LOCKED)
// - Order Type: Always MARKET (immediate fill)
// - Badge: "GEM Pattern Mode" (gold, lock icon)
```

#### Custom Mode (User-Defined) - TIER2+:
```javascript
tradeMode: 'custom'
// - Entry: User-defined (có thể khác market price)
// - Stop Loss: User-defined với validation
// - Take Profit: User-defined với validation
// - Order Type: MARKET hoặc LIMIT
// - AI Score: 0-100 (đánh giá trade quality)
// - Badge: "Custom Mode" (warning color, edit icon)
```

### Order Types:

#### MARKET Order:
- Khớp ngay tại giá thị trường
- Status: OPEN immediately
- Áp dụng cho: Pattern Mode, Custom Mode (entry = market)

#### LIMIT Order (TIER2+):
- Chờ giá đến entry price
- Status: PENDING → OPEN khi filled
- LONG fills khi: `currentPrice <= entryPrice`
- SHORT fills khi: `currentPrice >= entryPrice`
- Có thể cancel bất cứ lúc nào

### P&L Calculation:
```javascript
// LONG Position
unrealizedPnL = (currentPrice - entryPrice) * quantity;
unrealizedPnLPercent = ((currentPrice - entryPrice) / entryPrice) * 100;
ROE = unrealizedPnLPercent * leverage;

// SHORT Position
unrealizedPnL = (entryPrice - currentPrice) * quantity;
unrealizedPnLPercent = ((entryPrice - currentPrice) / entryPrice) * 100;
ROE = unrealizedPnLPercent * leverage;
```

### Liquidation Price:
```javascript
// Binance Futures formula
const mmr = 0.004; // 0.4% maintenance margin rate
const imr = 1 / leverage;

// LONG: liquidationPrice = entry * (1 - imr + mmr)
// SHORT: liquidationPrice = entry * (1 + imr - mmr)
```

### MindsetAdvisor Integration (v3.1):
```javascript
// Hiển thị trước khi mở lệnh
<MindsetAdvisor
  visible={showMindsetCheck}
  onComplete={handleMindsetComplete}
  tradeInfo={{
    symbol: pattern.symbol,
    direction: tradeType,
    amount: positionSize,
  }}
  sourceScreen="paper_trade_modal"  // REQUIRED: allowed values only
/>

// Allowed sourceScreen values:
// 'paper_trade_modal', 'gemmaster', 'quick_action', 'scanner'
```

---

## 3. DRAWING TOOLS (CÔNG CỤ VẼ)

### Trạng thái: ✅ Hoạt động (v3.0+)

### Files liên quan:
```
gem-mobile/src/
├── components/Trading/
│   └── DrawingToolbar.js         # Tool selection UI
├── services/
│   └── drawingService.js         # Supabase CRUD
└── screens/Scanner/components/
    └── TradingChart.js           # Chart rendering
```

### 6 Drawing Tools:

| Tool ID | Icon | Label | Clicks | Mô tả |
|---------|------|-------|--------|-------|
| `horizontal_line` | Minus | Ngang | 1 | Đường ngang tại giá click |
| `trend_line` | TrendingUp | Xu hướng | 2 | Đường nét đứt từ điểm 1→2 |
| `rectangle` | Square | Chữ nhật | 2 | 2 đường ngang (top/bottom) |
| `fibonacci_retracement` | GitBranch | Fib | 2 | 7 mức Fibonacci |
| `long_position` | ArrowUpCircle | Long | 1 | Entry + TP (+4%) + SL (-2%) |
| `short_position` | ArrowDownCircle | Short | 1 | Entry + TP (-4%) + SL (+2%) |

### Fibonacci Levels:
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

### Magnet Mode:
- Default: ON
- Snap to nearest OHLC value
- Threshold: 2% of price
- Improves accuracy of drawing placement

### Storage:
- Supabase `chart_drawings` table
- Per-user, per-symbol, per-timeframe
- Persistent across sessions
- RLS policies for security

### Database Schema:
```sql
CREATE TABLE chart_drawings (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  symbol VARCHAR(20) NOT NULL,
  timeframe VARCHAR(10) NOT NULL,
  tool_type VARCHAR(30) NOT NULL,
  drawing_data JSONB NOT NULL,
  is_visible BOOLEAN DEFAULT TRUE,
  z_index INTEGER DEFAULT 0,
  visible_timeframes TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 4. GEM MASTER (AI CHATBOT)

### Trạng thái: ✅ Hoạt động

### Files liên quan:
```
gem-mobile/src/
├── screens/GemMaster/
│   └── GemMasterScreen.js        # Chat UI
├── services/
│   ├── gemMasterAIService.js     # AI logic
│   ├── gemMasterService.js       # Response generation
│   └── geminiService.js          # Gemini API
└── components/GemMaster/
    ├── QuickActionBar.js         # Quick actions
    └── FAQPanel.js               # FAQ panel
```

### Chi tiết tính năng:

| Tính năng | Mô tả | Tier |
|-----------|-------|------|
| **AI Engine** | Google Gemini API | ALL |
| **Mood System** | Calm, Warning, Angry, Proud, Silent | ALL |
| **Karma System** | Điểm karma, block/unlock trading | ALL |
| **Voice Input** | Nhập giọng nói | TIER2+ |
| **Widget Suggestions** | Tạo widget từ AI response | ALL |
| **Product Recommendations** | Gợi ý Crystal/Course | ALL |
| **FAQ Panel** | Binance-style FAQ topics | ALL |

### Karma System:
| Karma Level | Status | Action |
|-------------|--------|--------|
| 100 | Full | Normal trading |
| 50-99 | Warning | Caution messages |
| 1-49 | Danger | Trading restricted |
| 0 | Frozen | Account frozen, need recovery |

### 14 Trading Scenarios:
| # | Scenario | Trigger | Karma Impact |
|---|----------|---------|--------------|
| 1 | FOMO_BUY | RSI overbought hoặc pump lớn | -10 |
| 2 | FOMO_RETRY | Retry sau FOMO loss | -15 |
| 3 | REVENGE_TRADE | 3+ consecutive losses | -20 |
| 4 | NO_STOPLOSS | Không có SL | -50 (CRITICAL) |
| 5 | SL_MOVED_WIDER | Dời SL xa hơn | -10 |
| 6 | BIG_WIN | Win >20% P&L | +15 |
| 7 | DISCIPLINE_WIN | Win với SL đúng | +10 |
| 8 | DISCIPLINE_LOSS | Loss với SL đúng | +5 |
| 9 | ACCOUNT_FROZEN | Karma = 0 | N/A |
| 10 | OVERTRADE | 10+ trades/ngày | -5/trade |
| 11 | STREAK_BROKEN | Mất win streak | -5 |
| 12 | DAILY_LIMIT | Vượt daily limit | Block |
| 13 | BLOCKED | User bị block | Block |
| 14 | RECOVERY_QUEST | Cần recovery | +20 on complete |

### Unlock Options:
| Option | Duration | Karma Gain |
|--------|----------|------------|
| Meditation | 5 min | +5 |
| Journal | 10 min | +10 |
| Rest | 15 min | +0 |
| Wait | Time-based | +0 |

### Message Quota:
| Tier | Daily Messages | Voice Messages |
|------|----------------|----------------|
| FREE | 10 | 0 |
| TIER1 | 50 | 5 |
| TIER2 | 200 | 20 |
| TIER3 | Unlimited | Unlimited |

---

## 5. VISION BOARD

### Trạng thái: ✅ Hoạt động

### Files liên quan:
```
gem-mobile/src/
├── services/
│   └── visionBoardService.js     # Core service
├── screens/VisionBoard/
│   ├── VisionBoardScreen.js      # Dashboard
│   ├── GoalDetailScreen.js       # Chi tiết goal
│   ├── DailyRecapScreen.js       # Daily summary
│   ├── CalendarScreen.js         # Calendar view
│   └── AchievementsScreen.js     # Achievements
└── contexts/
    └── VisionBoardContext.js     # State management
```

### Widget Types:
| Type | Icon | Mô tả | Tier |
|------|------|-------|------|
| GOAL | Target | Mục tiêu dài hạn với milestones | ALL |
| ACTION | CheckSquare | Tasks/to-dos với due date | ALL |
| AFFIRMATION | Heart | Affirmations hàng ngày | ALL |
| HABIT | Repeat | Thói quen định kỳ | TIER1+ |

### Life Areas (6):
| Area | Color | Icon | Focus |
|------|-------|------|-------|
| Finance | Gold | Wallet | Tài chính, trading |
| Career | Purple | Briefcase | Sự nghiệp |
| Health | Green | Heart | Sức khỏe |
| Relationships | Pink | Users | Mối quan hệ |
| Personal | Cyan | User | Phát triển bản thân |
| Spiritual | Red | Sparkles | Tâm linh |

### Gamification:
| Feature | Mô tả |
|---------|-------|
| XP System | Earn XP khi complete tasks |
| Level System | Level up based on XP |
| Streaks | Daily completion streaks |
| Achievements | Badges unlock |

### Widget Limits:
| Tier | Max Widgets | Max Goals | Max Habits |
|------|-------------|-----------|------------|
| FREE | 10 | 3 | 2 |
| TIER1 | 50 | 10 | 10 |
| TIER2 | 200 | 50 | 50 |
| TIER3 | Unlimited | Unlimited | Unlimited |

---

## 6. TRADER RITUAL

### Trạng thái: ✅ Hoạt động

### Files liên quan:
```
gem-mobile/src/screens/VisionBoard/
├── RitualPlaygroundScreen.js     # Interactive rituals
└── RitualHistoryScreen.js        # Lịch sử ritual
```

### Ritual Types:
| Ritual | Duration | Karma Gain | Mô tả |
|--------|----------|------------|-------|
| Letter to Universe | 10 min | +10 | Viết thư gửi vũ trụ |
| Meditation | 5-30 min | +5-15 | Guided meditation |
| Gratitude Log | 5 min | +5 | Ghi nhật ký biết ơn |
| Morning Ritual | 15 min | +10 | Morning routine |
| Evening Review | 10 min | +8 | Daily reflection |

### Ritual Quota:
| Tier | Daily Rituals | Meditation Minutes |
|------|---------------|-------------------|
| FREE | 2 | 15 |
| TIER1 | 5 | 30 |
| TIER2 | 10 | 60 |
| TIER3 | Unlimited | Unlimited |

---

## 7. PARTNERSHIP/AFFILIATE

### Trạng thái: ✅ Hoạt động

### Files liên quan:
```
gem-mobile/src/services/
└── affiliateService.js           # Affiliate logic

supabase/migrations/
└── 20251214_affiliate_system_complete.sql
```

### Chi tiết tính năng:
| Tính năng | Mô tả |
|-----------|-------|
| Referral Links | Tạo link giới thiệu unique |
| Commission Tracking | Theo dõi hoa hồng real-time |
| Partner Dashboard | Dashboard cho partner |
| Withdrawal | Rút tiền hoa hồng |
| Tier Commissions | Hoa hồng theo tier |

### Commission Rates:
| Product Tier | Commission Rate |
|--------------|-----------------|
| TIER1 (11M) | 20% = 2.2M |
| TIER2 (21M) | 20% = 4.2M |
| TIER3 (68M) | 20% = 13.6M |
| Courses | 15% |
| Crystal Products | 10% |

### Partner Tiers:
| Level | Monthly Sales | Bonus |
|-------|---------------|-------|
| Bronze | < 50M | 0% |
| Silver | 50M - 200M | +2% |
| Gold | 200M - 500M | +5% |
| Diamond | > 500M | +10% |

---

## 8. TIER SYSTEM & ACCESS CONTROL

### Trạng thái: ✅ Hoạt động

### Files liên quan:
```
gem-mobile/src/
├── config/
│   └── tierAccess.js             # Tier definitions (278 lines)
├── constants/
│   └── tierFeatures.js           # Feature matrix (421 lines)
└── services/
    ├── tierService.js            # Tier logic (798 lines)
    ├── tierAccessService.js      # Access control
    └── subscriptionExpirationService.js  # Expiration
```

### BẢNG SO SÁNH TIER CHI TIẾT:

#### Giá & Thời hạn:
| Tier | Giá (VND) | Giá (USD) | Thời hạn |
|------|-----------|-----------|----------|
| FREE | Miễn phí | $0 | Vĩnh viễn |
| TIER1 | 11,000,000 | ~$440 | 1 năm |
| TIER2 | 21,000,000 | ~$840 | 1 năm |
| TIER3 | 68,000,000 | ~$2,720 | Lifetime |

#### Scanner Features:
| Feature | FREE | TIER1 | TIER2 | TIER3 |
|---------|------|-------|-------|-------|
| Patterns | 3 | 7 | 15 | 24 |
| Max Coins/Scan | 1 | 5 | 20 | Unlimited |
| Scans/Day | 5 | 15 | 50 | Unlimited |
| Timeframes | 4 | 6 | 10 | 12 |
| Multi-TF Scan | ❌ | ❌ | 3 TF | 5 TF |
| Quality Grades | ❌ | ❌ | ✅ | ✅ |
| Confluence Score | ❌ | ❌ | ✅ | ✅ |
| Zone Visualization | ✅ | ✅ | ✅ | ✅ |

#### Paper Trade Features:
| Feature | FREE | TIER1 | TIER2 | TIER3 |
|---------|------|-------|-------|-------|
| Paper Trading | ❌ | ✅ | ✅ | ✅ |
| Max Positions | 0 | 5 | 20 | Unlimited |
| Max Leverage | N/A | 20x | 50x | 125x |
| Pattern Mode | ❌ | ✅ | ✅ | ✅ |
| Custom Mode | ❌ | ❌ | ✅ | ✅ |
| Pending Orders | ❌ | ❌ | ✅ | ✅ |
| Trade History | ❌ | 50 | 100 | Unlimited |
| Statistics | ❌ | Basic | Advanced | Full |

#### Drawing Tools:
| Feature | FREE | TIER1 | TIER2 | TIER3 |
|---------|------|-------|-------|-------|
| Drawing Tools | ✅ | ✅ | ✅ | ✅ |
| Max Drawings/Chart | 5 | 20 | 50 | Unlimited |
| Fibonacci | ❌ | ✅ | ✅ | ✅ |
| Save to Cloud | ❌ | ✅ | ✅ | ✅ |

#### Alerts & Notifications:
| Feature | FREE | TIER1 | TIER2 | TIER3 |
|---------|------|-------|-------|-------|
| Price Alerts | ❌ | 3/coin | 10/coin | Unlimited |
| Pattern Alerts | ❌ | ✅ | ✅ | ✅ |
| Push Notifications | ❌ | ✅ | ✅ | ✅ |
| Email Alerts | ❌ | ❌ | ✅ | ✅ |
| Telegram Alerts | ❌ | ❌ | ❌ | ✅ |

#### GEM Master AI:
| Feature | FREE | TIER1 | TIER2 | TIER3 |
|---------|------|-------|-------|-------|
| Messages/Day | 10 | 50 | 200 | Unlimited |
| Voice Input | ❌ | 5/day | 20/day | Unlimited |
| Product Recs | Basic | Standard | Advanced | Premium |
| Priority Response | ❌ | ❌ | ✅ | ✅ |

#### Vision Board:
| Feature | FREE | TIER1 | TIER2 | TIER3 |
|---------|------|-------|-------|-------|
| Max Widgets | 10 | 50 | 200 | Unlimited |
| Max Goals | 3 | 10 | 50 | Unlimited |
| Habits | 2 | 10 | 50 | Unlimited |
| Calendar | ❌ | ✅ | ✅ | ✅ |
| Achievements | Basic | Full | Full | Full |

#### Forum & Community:
| Feature | FREE | TIER1 | TIER2 | TIER3 |
|---------|------|-------|-------|-------|
| Read Posts | ✅ | ✅ | ✅ | ✅ |
| Create Posts | ❌ | ✅ | ✅ | ✅ |
| Comments | ❌ | ✅ | ✅ | ✅ |
| Verified Badge | ❌ | ❌ | ✅ | ✅ |
| Priority Display | ❌ | ❌ | ❌ | ✅ |

#### Additional Features:
| Feature | FREE | TIER1 | TIER2 | TIER3 |
|---------|------|-------|-------|-------|
| Tarot Readings | 1/day | 5/day | 20/day | Unlimited |
| I Ching | 1/day | 5/day | 20/day | Unlimited |
| Courses Access | Free only | TIER1 | TIER2 | ALL |
| Support | Community | Email | Priority | Personal |
| AI Signals | ❌ | ❌ | ❌ | ✅ |
| Whale Tracking | ❌ | ❌ | ❌ | ✅ |

### Pattern Access by Tier:
```javascript
const TIER_PATTERNS = {
  FREE: ['DPD', 'UPU', 'HEAD_SHOULDERS'],  // 3

  TIER1: [
    ...FREE,
    'UPD', 'DPU', 'DOUBLE_TOP', 'DOUBLE_BOTTOM'  // +4 = 7
  ],

  TIER2: [
    ...TIER1,
    'INVERSE_HEAD_SHOULDERS', 'ASCENDING_TRIANGLE',
    'DESCENDING_TRIANGLE', 'HFZ', 'LFZ',
    'SYMMETRICAL_TRIANGLE', 'ROUNDING_BOTTOM', 'ROUNDING_TOP'  // +8 = 15
  ],

  TIER3: [
    ...TIER2,
    'BULL_FLAG', 'BEAR_FLAG', 'WEDGE', 'CUP_HANDLE',
    'ENGULFING', 'MORNING_EVENING_STAR', 'THREE_METHODS',
    'HAMMER', 'FLAG'  // +9 = 24
  ]
};
```

---

## 9. SHOP (CRYSTAL SHOP)

### Trạng thái: ✅ Hoạt động

### Files liên quan:
```
gem-mobile/src/
├── services/
│   └── shopifyService.js         # Shopify integration (677 lines)
├── config/
│   └── shopConfig.js             # Shop config (427 lines)
├── screens/Shop/
│   ├── ShopScreen.js             # Main shop
│   ├── ProductDetailScreen.js    # Chi tiết sản phẩm
│   └── ProductListScreen.js      # Danh sách
└── contexts/
    └── CartContext.js            # Cart state
```

### Categories:
| Category | Tag | Mô tả |
|----------|-----|-------|
| Crystals & Spiritual | `crystal` | Thạch anh, đá năng lượng |
| Khóa học | `course` | Trading courses, Ebooks |
| GemMaster | `gemmaster` | Chatbot subscriptions |
| Scanner | `scanner` | Pattern scanner tiers |
| Gem Pack | `gem-pack` | Virtual gems |

### Shopify Integration:
- GraphQL API via Supabase Edge Functions
- Storefront Access Token
- Cart system (add, update, remove)
- Checkout URLs with UTM tracking
- Product filtering by tags
- Variant selection

### Shopify-Courses Sync (v3.2):
| Feature | Mô tả |
|---------|-------|
| Product ID Mapping | `courses.shopify_product_id` links to Shopify |
| Thumbnail Sync | Auto-sync từ Shopify product images |
| Price Sync | Match price với Shopify variant |
| Sync Function | `sync_course_thumbnails_from_shopify()` RPC |

```javascript
// Edge Function: shopify-products
// Actions: getProducts, getProductById, syncCourseThumbnails
const { data } = await supabase.functions.invoke('shopify-products', {
  body: { action: 'syncCourseThumbnails' }
});
```

### PromoBar Component (v3.2):

#### File: `gem-mobile/src/components/PromoBar.js`

#### Features:
| Feature | Mô tả |
|---------|-------|
| Module-Level Cache | 5-minute cache prevents re-fetch |
| Fixed Height | 48px container prevents layout shift |
| Internal Navigation | Supports app:// URLs for in-app navigation |
| External Links | Opens in browser for http:// URLs |
| Admin Configurable | Managed via `promo_bar_config` table |

#### Module-Level Caching:
```javascript
let cachedPromo = null;
let hasLoadedOnce = false;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const resetPromoBarCache = () => {
  cachedPromo = null;
  hasLoadedOnce = false;
  cacheTimestamp = null;
};
```

#### Navigation Support:
```javascript
// Internal navigation (stays in app)
link_url: 'app://Courses'           // → navigation.navigate('Courses')
link_url: 'app://Shop/ProductDetail' // → navigation.navigate('Shop', { screen: 'ProductDetail' })

// External links (opens browser)
link_url: 'https://example.com'     // → Linking.openURL(url)
```

#### Database Table:
```sql
CREATE TABLE promo_bar_config (
  id UUID PRIMARY KEY,
  message TEXT NOT NULL,
  link_url TEXT,
  link_text VARCHAR(50),
  background_color VARCHAR(20) DEFAULT 'gold',
  text_color VARCHAR(20) DEFAULT 'dark',
  is_active BOOLEAN DEFAULT true,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 10. TAROT

### Trạng thái: ✅ Hoạt động

### Files liên quan:
```
gem-mobile/src/
├── screens/GemMaster/
│   └── TarotScreen.js            # Main screen
├── services/
│   ├── tarotInterpretationService.js  # AI interpretation
│   └── readingHistoryService.js       # History
└── data/tarot/                   # Card data
```

### Chi tiết tính năng:
| Tính năng | Mô tả |
|-----------|-------|
| Deck | 78 cards (22 Major + 56 Minor Arcana) |
| Spread | 3-card (Past, Present, Future) |
| Shuffle | Fisher-Yates algorithm |
| Interpretation | AI-powered via Gemini |
| Reversed Cards | Có hỗ trợ |
| Crystal Link | Gợi ý crystal phù hợp |
| History | Lưu lại readings |

### Quota:
| Tier | Readings/Day |
|------|--------------|
| FREE | 1 |
| TIER1 | 5 |
| TIER2 | 20 |
| TIER3 | Unlimited |

---

## 11. I CHING

### Trạng thái: ✅ Hoạt động

### Files liên quan:
```
gem-mobile/src/
├── screens/GemMaster/
│   └── IChingScreen.js           # Main screen
├── components/GemMaster/
│   ├── CoinCastAnimation.js      # Coin animation
│   └── HexagramBuilder.js        # Build hexagram
└── data/iching/
    └── hexagrams.js              # 64 hexagrams data
```

### Chi tiết tính năng:
| Tính năng | Mô tả |
|-----------|-------|
| Quick Mode | Hexagram ngẫu nhiên ngay lập tức |
| Traditional Mode | Tung 6 đồng xu tạo 6 hào |
| Hexagrams | 64 quẻ Kinh Dịch |
| Line Interpretation | Giải thích từng hào |
| Changing Lines | Hào động |
| Crystal Link | Gợi ý crystal phù hợp |

### Quota:
| Tier | Readings/Day |
|------|--------------|
| FREE | 1 |
| TIER1 | 5 |
| TIER2 | 20 |
| TIER3 | Unlimited |

---

## 12. COMMUNITY/FORUM

### Trạng thái: ✅ Hoạt động

### Files liên quan:
```
gem-mobile/src/
├── screens/Forum/
│   └── ForumScreen.js            # Main feed
├── services/
│   ├── forumService.js           # Forum logic
│   └── repostService.js          # Repost logic
└── components/
    └── RepostSheet.js            # Repost UI
```

### Chi tiết tính năng:
| Tính năng | Mô tả | Tier |
|-----------|-------|------|
| Posting | Đăng bài với text, images | TIER1+ |
| Comments | Bình luận, reply | TIER1+ |
| Likes | Like bài viết | ALL |
| Reposts | Share bài người khác | TIER1+ |
| Feeds | Explore, Following, News, Popular | ALL |
| Report | Báo cáo vi phạm | ALL |

### Categories:
| Category | Icon | Mô tả |
|----------|------|-------|
| Trading | TrendingUp | Trading signals, analysis |
| Spiritual | Sparkles | Spiritual, mindset |
| Balance | Yin-Yang | Work-life balance |
| Market | LineChart | Market news |
| News | Newspaper | General news |

### Posting Limits:
| Tier | Posts/Day | Comments/Day | Images/Post |
|------|-----------|--------------|-------------|
| FREE | 0 | 0 | 0 |
| TIER1 | 3 | 20 | 4 |
| TIER2 | 10 | 50 | 10 |
| TIER3 | Unlimited | Unlimited | 20 |

---

## 13. COURSES

### Trạng thái: ✅ Hoạt động (v3.2 - Major Update)

### Files liên quan:
```
gem-mobile/src/
├── screens/Courses/
│   ├── CoursesScreen.js          # Course catalog (main)
│   ├── CourseDetailScreen.js     # Chi tiết khóa học
│   ├── CourseLearning.jsx        # Learning interface
│   ├── LessonPlayerScreen.js     # Video player
│   ├── QuizScreen.js             # Quiz interface
│   ├── CertificateScreen.js      # Chứng chỉ
│   ├── CourseCheckout.js         # Checkout flow
│   └── components/
│       └── CourseCard.js         # Course card (list view)
├── components/courses/
│   ├── CourseCardVertical.js     # Grid card component
│   ├── CourseFlashSaleSection.js # Flash sale carousel
│   └── HighlightedCourseSection.js # Featured course hero
├── screens/tabs/components/
│   └── MyCoursesSection.js       # User courses panel (Account tab)
├── services/
│   └── courseService.js          # Course logic
├── contexts/
│   └── CourseContext.js          # State management
├── navigation/
│   ├── AccountStack.js           # User-facing course screens
│   └── ShopStack.js              # Shop course screens
└── screens/Admin/Courses/        # Admin management screens
    ├── AdminCoursesScreen.js     # Course list management
    ├── AdminCourseHighlightsScreen.js # Highlighted course config
    └── AdminCourseModulesScreen.js    # Module/lesson management
```

### Chi tiết tính năng:
| Tính năng | Mô tả |
|-----------|-------|
| Catalog | Danh sách khóa học với filter |
| Modules | Cấu trúc module/lesson |
| Video Lessons | YouTube embeds |
| Quiz System | Câu hỏi sau bài học |
| Certificates | Chứng chỉ hoàn thành |
| Progress | Theo dõi tiến độ |
| Flash Sale | Khóa học giảm giá với countdown |
| Highlighted Course | Featured course hero section |
| Shopify Sync | Auto-sync thumbnails from Shopify |

### Course Types:
| Type | Tier Required | Mô tả |
|------|---------------|-------|
| Free | ALL | Khóa miễn phí |
| TIER1 | TIER1+ | Pattern basics |
| TIER2 | TIER2+ | Advanced analysis |
| TIER3 | TIER3 | Full curriculum |

### Filter Tabs:
- Tất cả (All)
- Đang học (In Progress)
- Hoàn thành (Completed)
- Bookmark (Đã lưu)

### Navigation Structure (v3.2):

#### AccountStack - User Courses:
```javascript
// User-facing course screens in Account tab
<Stack.Screen name="UserCourses" component={CoursesScreen} />
<Stack.Screen name="CourseDetail" component={CourseDetailScreen} />
<Stack.Screen name="LessonPlayer" component={LessonPlayerScreen} />
<Stack.Screen name="Quiz" component={QuizScreen} />
<Stack.Screen name="Certificate" component={CertificateScreen} />
<Stack.Screen name="CourseCheckout" component={CourseCheckout} />
```

#### ShopStack - Course Shopping:
```javascript
// Shopping-focused course screens in Shop tab
<Stack.Screen name="CourseList" component={CoursesScreen} />
<Stack.Screen name="CourseDetail" component={CourseDetailScreen} />
```

#### MyCoursesSection Navigation:
```javascript
// From Account tab → stays in AccountStack
navigation.navigate('UserCourses', { sourceTab: 'Account' })
navigation.navigate('UserCourses', { filter: 'enrolled', sourceTab: 'Account' })
navigation.navigate('UserCourses', { filter: 'completed', sourceTab: 'Account' })
```

### Thumbnail Design (v3.2):

#### Square Aspect Ratio (1:1):
All course thumbnails use square aspect ratio matching Shop tab design:

| Component | Style | Usage |
|-----------|-------|-------|
| CourseCardVertical | `aspectRatio: 1` | Grid cards in catalog |
| CourseCard | `aspectRatio: 1` | List cards |
| CourseFlashSaleSection | `aspectRatio: 1` | Flash sale carousel |
| HighlightedCourseSection | `aspectRatio: 1` | Featured course hero |

```javascript
// Example: CourseCardVertical.js
thumbnailContainer: {
  aspectRatio: 1, // Square thumbnail like Shop
  position: 'relative',
}
```

### Module-Level Caching (v3.2):

#### HighlightedCourseSection:
```javascript
// Module-level cache - persists across remounts
let cachedHighlightData = null;
let hasLoadedOnce = false;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Reset function for pull-to-refresh
export const resetHighlightedCourseCache = () => {
  cachedHighlightData = null;
  hasLoadedOnce = false;
  cacheTimestamp = null;
};
```

#### PromoBar:
```javascript
// Module-level cache for promo bar
let cachedPromo = null;
let hasLoadedOnce = false;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
```

### Shopify Integration (v3.2):

#### Product ID Mapping:
```javascript
// courses table column: shopify_product_id
// Maps course to Shopify product for:
// - Price sync
// - Thumbnail sync
// - Inventory status
```

#### Thumbnail Sync:
```sql
-- Supabase RPC function
CREATE OR REPLACE FUNCTION sync_course_thumbnails_from_shopify()
RETURNS INTEGER AS $$
-- Syncs course.thumbnail from Shopify product images
-- Called via Admin panel or Edge Function
$$;
```

### Admin Features:

#### AdminCourseHighlightsScreen:
| Feature | Mô tả |
|---------|-------|
| Select Course | Chọn khóa học làm nổi bật |
| Custom Title | Tiêu đề tùy chỉnh |
| Custom Subtitle | Phụ đề tùy chỉnh |
| Custom Image | Hình ảnh tùy chỉnh |
| Badge Text | Text badge (Nổi bật, Hot, etc.) |
| Badge Color | Màu badge (gold, purple, cyan, etc.) |
| CTA Text | Text nút CTA |
| Show/Hide Stats | Toggle hiển thị rating, students, lessons, price |
| Sync Thumbnails | Sync thumbnails từ Shopify |

### Database Tables:

```sql
-- courses table
CREATE TABLE courses (
  id UUID PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  thumbnail TEXT,
  price DECIMAL(10,2),
  level VARCHAR(20),
  duration_hours DECIMAL(5,2),
  instructor VARCHAR(255),
  shopify_product_id VARCHAR(255),  -- Shopify mapping
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- highlighted_course_config table
CREATE TABLE highlighted_course_config (
  id UUID PRIMARY KEY,
  course_id UUID REFERENCES courses(id),
  custom_title VARCHAR(255),
  custom_subtitle TEXT,
  custom_description TEXT,
  custom_image_url TEXT,
  badge_text VARCHAR(50),
  badge_color VARCHAR(20),
  cta_text VARCHAR(50),
  show_price BOOLEAN DEFAULT true,
  show_students BOOLEAN DEFAULT true,
  show_rating BOOLEAN DEFAULT true,
  show_lessons BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- course_enrollments table
CREATE TABLE course_enrollments (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  course_id UUID REFERENCES courses(id),
  progress DECIMAL(5,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'enrolled',
  enrolled_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 14. ALERTS/NOTIFICATIONS

### Trạng thái: ✅ Hoạt động

### Files liên quan:
```
gem-mobile/src/
├── services/
│   ├── alertService.js           # Alert provider (86 lines)
│   ├── alertManager.js           # Alert orchestration (574 lines)
│   ├── alertConditions.js        # Trigger logic
│   └── notificationService.js    # Notifications
├── constants/
│   └── alertConfig.js            # Alert types
└── components/Scanner/
    ├── AlertCard.js              # Alert UI
    └── PriceAlertModal.js        # Price alert modal
```

### Alert Types:
| Type | Trigger | Tier |
|------|---------|------|
| `price_alert` | Giá chạm mức đặt | TIER1+ |
| `pattern_detected` | Scan phát hiện pattern | TIER1+ |
| `breakout` | Phá vỡ hỗ trợ/kháng cự | TIER2+ |
| `stop_loss` | Chạm stop loss | TIER1+ |
| `take_profit` | Chạm take profit | TIER1+ |
| `limit_order_filled` | Lệnh limit khớp | TIER2+ |
| `position_opened` | Mở lệnh market | TIER1+ |
| `whale_alert` | Large order detected | TIER3 |

### Notification Categories:
| Category | Types |
|----------|-------|
| TRADING | pattern_detected, price_alert, trade_executed |
| SOCIAL | forum_like, comment, follow, mention |
| SYSTEM | order, promotion, reminder |

### Tier Limits:
| Tier | Alerts/Coin | Total Alerts | Push | Email |
|------|-------------|--------------|------|-------|
| FREE | 0 | 0 | ❌ | ❌ |
| TIER1 | 3 | 15 | ✅ | ❌ |
| TIER2 | 10 | 100 | ✅ | ✅ |
| TIER3 | Unlimited | Unlimited | ✅ | ✅ |

---

## 15. MARKET DATA

### Trạng thái: ✅ Hoạt động

### Files liên quan:
```
gem-mobile/src/services/
├── binanceService.js             # Main service
└── binanceApiService.js          # API wrapper
```

### Chi tiết tính năng:
| Tính năng | Mô tả |
|-----------|-------|
| REST API | Binance Spot + Futures |
| WebSocket | Real-time price streaming |
| Candle Data | OHLCV all timeframes |
| Coins | 500+ USDT Perpetual pairs |
| Caching | 5-minute cache |
| Fallback | Futures → Spot fallback |

### API Endpoints:
| Type | Base URL |
|------|----------|
| Spot REST | `https://api.binance.com/api/v3` |
| Futures REST | `https://fapi.binance.com/fapi/v1` |
| Futures WebSocket | `wss://fstream.binance.com/ws/` |
| Spot WebSocket | `wss://stream.binance.com:9443/ws/` |

### WebSocket Streams:
```javascript
// Price ticker
`${symbol.toLowerCase()}@ticker`

// Kline/Candlestick
`${symbol.toLowerCase()}@kline_${interval}`
```

### Rate Limits:
| Type | Limit |
|------|-------|
| REST requests | 1200/min |
| WebSocket connections | 5/stream |
| Order updates | 10/second |

---

## 16. QUOTA SYSTEM CHI TIẾT

### Daily Reset:
- Quotas reset at 00:00 UTC
- Stored in Supabase `user_quotas` table
- Cached locally in AsyncStorage

### Quota Tracking:
```sql
CREATE TABLE user_quotas (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  quota_type VARCHAR(50) NOT NULL,
  used INTEGER DEFAULT 0,
  max_allowed INTEGER NOT NULL,
  reset_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Quota Types:
| Type | FREE | TIER1 | TIER2 | TIER3 |
|------|------|-------|-------|-------|
| `scan_daily` | 5 | 15 | 50 | -1 (unlimited) |
| `paper_trade_positions` | 0 | 5 | 20 | -1 |
| `ai_messages` | 10 | 50 | 200 | -1 |
| `voice_messages` | 0 | 5 | 20 | -1 |
| `tarot_readings` | 1 | 5 | 20 | -1 |
| `iching_readings` | 1 | 5 | 20 | -1 |
| `forum_posts` | 0 | 3 | 10 | -1 |
| `alerts` | 0 | 15 | 100 | -1 |
| `rituals` | 2 | 5 | 10 | -1 |

### Overage Handling:
- Soft limit: Warning message
- Hard limit: Feature blocked
- Upgrade prompt shown

---

## 17. DATABASE SCHEMA

### Supabase Tables:
| Table | Mô tả | RLS |
|-------|-------|-----|
| `users` | User profiles | ✅ |
| `user_tiers` | Tier subscriptions | ✅ |
| `user_quotas` | Quota tracking | ✅ |
| `paper_positions` | Open positions | ✅ |
| `paper_history` | Trade history | ✅ |
| `pending_orders` | Limit orders | ✅ |
| `chart_drawings` | Drawing tools | ✅ |
| `trading_mindset_logs` | Mindset assessments | ✅ |
| `vision_widgets` | Vision board widgets | ✅ |
| `ritual_history` | Ritual completions | ✅ |
| `forum_posts` | Forum posts | ✅ |
| `forum_comments` | Comments | ✅ |
| `reading_history` | Tarot/I Ching history | ✅ |
| `alerts` | User alerts | ✅ |
| `notifications` | Push notifications | ✅ |
| `affiliate_links` | Referral links | ✅ |
| `affiliate_commissions` | Commission tracking | ✅ |
| `course_progress` | Learning progress | ✅ |
| `courses` | Course catalog | ✅ |
| `course_modules` | Course modules | ✅ |
| `course_lessons` | Course lessons | ✅ |
| `course_enrollments` | User enrollments | ✅ |
| `highlighted_course_config` | Featured course settings | ✅ |
| `promo_bar_config` | Promotional bar settings | ✅ |

### Key Constraints:
```sql
-- MindsetAdvisor allowed values
CHECK (source_screen IN (
  'paper_trade_modal', 'gemmaster', 'quick_action', 'scanner'
))

-- Trade direction
CHECK (direction IN ('LONG', 'SHORT'))

-- Position status
CHECK (status IN ('OPEN', 'CLOSED', 'PENDING'))

-- Order type
CHECK (order_type IN ('MARKET', 'LIMIT'))
```

### Migrations Count:
- **170+ migrations** applied
- Latest: `20260124_mindset_logs.sql`

---

## 18. NUMBER FORMATTING (Vietnamese Locale)

### File: `gem-mobile/src/utils/formatters.js`

### Format Rules:
| Format | EN | VI |
|--------|----|----|
| Decimal | `.` | `,` |
| Thousands | `,` | `.` |
| Example | `$259,174.55` | `$259.174,55` |

### Functions:
```javascript
// Price - dynamic precision
formatPrice(price, withSeparators = true)
// >= 1000:    2 decimals (90.363,84)
// >= 1:       4 decimals (13,5752)
// >= 0.01:    4 decimals (0,3195) ← Match chart
// >= 0.0001:  6 decimals
// < 0.0001:   8 decimals

// Percentages
formatConfidence(value, decimals = 1)  // 85.234 → "85,2%"
formatPercent(value, decimals = 1)     // 82.872 → "82,9%"
formatPercentChange(value)             // +3.2 → "+3,20%"

// Currency
formatCurrency(amount, decimals = 2)   // 9040 → "9.040,00"

// Large numbers
formatLargeNumber(num)                 // 1500000 → "1,50M"
formatVolume(volume)                   // Same
formatMarketCap(marketCap)             // → "$1,00B"

// Risk/Reward
formatRiskReward(entry, sl, tp)        // → "1:2,50"
calculateRR(pattern)                   // Returns number

// Time
formatTimestamp(timestamp)             // → "24/01/2026, 14:30"
formatRelativeTime(timestamp)          // → "2 giờ trước"
```

---

## LƯU Ý QUAN TRỌNG

### Technical Stack:
- **Frontend:** React Native + Expo SDK 52
- **Charts:** lightweight-charts v4.1.0 (WebView)
- **API:** Binance Futures + Spot REST/WebSocket
- **Database:** Supabase (PostgreSQL + Real-time)
- **AI:** Google Gemini API
- **Shop:** Shopify GraphQL API
- **Auth:** Supabase Auth + Social Login

### Security:
- Row Level Security (RLS) on all tables
- JWT token validation
- API keys stored in environment
- Secure WebSocket connections

### Performance:
- 5-minute cache for market data
- Lazy loading for heavy components
- Memoization for expensive calculations
- Batch API requests (50 coins/batch)

### Real-time Features:
- WebSocket price streaming
- Chart updates every tick
- P&L sync via onPriceUpdate callback
- Auto SL/TP monitoring (10s interval)

---

## CHANGELOG

### v3.2 (2026-01-28)
- **Courses Major Update:**
  - Square thumbnail aspect ratio (1:1) for all course cards
  - Navigation structure fix: UserCourses in AccountStack
  - Module-level caching for HighlightedCourseSection
  - Module-level caching for PromoBar
  - PromoBar fixed height container (no layout shift)
  - PromoBar internal link navigation support
  - Shopify product ID mapping for courses
  - Thumbnail sync from Shopify products
  - AdminCourseHighlightsScreen sync button
  - Removed deprecated `is_free` column usage
- **Components Updated:**
  - CourseCardVertical.js - square thumbnails
  - CourseCard.js - square thumbnails
  - CourseFlashSaleSection.js - square thumbnails
  - HighlightedCourseSection.js - square thumbnails + caching
  - MyCoursesSection.js - fixed navigation to AccountStack
  - CoursesScreen.js - simplified back button
  - PromoBar.js - complete rewrite with caching
  - AccountStack.js - added user-facing course screens

### v3.1 (2026-01-24)
- Zone positioning fix (formation_time)
- P&L real-time sync (onPriceUpdate)
- MindsetAdvisor integration
- Vietnamese number formatting
- Database constraint fixes

### v3.0 (2025-12-20)
- Drawing Tools (6 tools)
- Pending Orders (LIMIT)
- Custom Trade Mode
- Pattern vs Custom badges

### v2.0 (2025-12-13)
- Custom initial balance
- Reset account features
- Balance recalculation
- Equity calculation

### v1.0 (Initial)
- Core scanner
- 24 patterns
- Paper trading
- Tier system

---

**END OF DOCUMENT**
