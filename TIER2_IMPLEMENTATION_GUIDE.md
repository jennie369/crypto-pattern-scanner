# 🎯 TIER 2 ADVANCED TOOLS - Implementation Guide
## GEM Trading Academy - Complete Checklist & Code Structure

**Status:** Day 1-2 Foundation Complete (4/30 tasks) ✅
**Remaining:** Tools 1-6 Implementation (26/30 tasks)

---

## ✅ COMPLETED (Day 1-2: Foundation)

### 1. Database Schema ✅
**File:** `supabase/migrations/20250108_tier2_tools.sql`
- [x] `portfolio_holdings` table (id, user_id, symbol, quantity, avg_buy_price, etc.)
- [x] `portfolio_transactions` table with **entry_type analytics** fields:
  - `entry_type` (RETEST/BREAKOUT/OTHER)
  - `pattern_type` (DPD/UPU/UPD/DPU)
  - `zone_status_at_entry` (⭐⭐⭐⭐⭐, etc.)
  - `confirmation_type` (PIN_BAR/ENGULFING/HAMMER)
- [x] `price_alerts` table (for MTF analysis)
- [x] RLS policies for all tables
- [x] Indexes for performance
- [x] Auto-update triggers
- [x] `get_entry_type_stats()` analytics function

### 2. Price Display Component ✅
**Files:**
- `frontend/src/components/PriceDisplay/PriceDisplay.jsx`
- `frontend/src/components/PriceDisplay/PriceDisplay.css`

**Features:**
- ✅ Correct VND format (NOT "đ")
- ✅ Three sizes: small, medium, large
- ✅ Optional monthly breakdown
- ✅ Gradient styling

### 3. Upgrade Prompt Component ✅
**Files:**
- `frontend/src/components/UpgradePrompt/UpgradePrompt.jsx`
- `frontend/src/components/UpgradePrompt/UpgradePrompt.css`

**Features:**
- ✅ Lists all 6 TIER 2 features
- ✅ Shows 21M VND/năm pricing (using PriceDisplay)
- ✅ Tier comparison UI (current → required)
- ✅ Beautiful gradient design
- ✅ CTA buttons to /pricing
- ✅ Money-back guarantee badge

### 4. Tier Guard Component ✅
**Files:**
- `frontend/src/components/TierGuard/TierGuard.jsx`
- `frontend/src/components/TierGuard/TierGuard.css`

**Features:**
- ✅ Checks `scanner_tier` or `course_tier`
- ✅ Tier level mapping (free=0, pro=1, premium=2, vip=3)
- ✅ Shows UpgradePrompt if access denied
- ✅ Loading state while checking auth
- ✅ Debug logging

---

## 🔧 PENDING IMPLEMENTATION

---

## 📊 TOOL 1: ADVANCED PATTERN SCANNER (Priority: HIGHEST)
**Complexity:** ⭐⭐⭐⭐⭐
**Estimated Time:** 2-3 days

### Core Concept: 6-STEP ENTRY WORKFLOW SYSTEM
**⚠️ CRITICAL:** This system prevents breakout trading and enforces RETEST entries only.

---

### Task 5: ENTRY_WORKFLOW Constants

**File:** `frontend/src/services/advancedPatternDetection.js` (NEW)

```javascript
/**
 * 6-Step Entry Workflow for GEM Frequency Pattern System
 * Prevents breakout trading - enforces RETEST methodology
 */
export const ENTRY_WORKFLOW = {
  PATTERN_DETECTED: {
    step: 1,
    icon: '🔍',
    status: 'PATTERN_DETECTED',
    message: 'Pattern phát hiện - Zone đang được tạo',
    userAction: '⏰ Chờ đợi',
    color: '#3B82F6',  // Blue
    nextStep: 'ZONE_CREATED'
  },

  ZONE_CREATED: {
    step: 2,
    icon: '⭐',
    status: 'ZONE_CREATED',
    message: 'Zone created - Đợi giá retest',
    userAction: '🔔 Bật Alert',
    color: '#8B5CF6',  // Purple
    nextStep: 'APPROACHING_ZONE'
  },

  APPROACHING_ZONE: {
    step: 3,
    icon: '⏰',
    status: 'APPROACHING_ZONE',
    message: 'Giá còn cách zone < 2% - Chuẩn bị',
    userAction: '👀 Theo dõi sát',
    color: '#F59E0B',  // Orange
    nextStep: 'IN_ZONE'
  },

  IN_ZONE: {
    step: 4,
    icon: '🎯',
    status: 'IN_ZONE',
    message: 'Giá trong zone - Đợi confirmation candle',
    userAction: '📊 Xem nến xác nhận',
    color: '#EAB308',  // Yellow
    nextStep: 'CONFIRMATION'
  },

  CONFIRMATION: {
    step: 5,
    icon: '✅',
    status: 'CONFIRMATION',
    message: 'Pin bar/Engulfing xuất hiện - SẴN SÀNG ENTRY!',
    userAction: '💰 Có thể vào lệnh',
    color: '#10B981',  // Green
    nextStep: 'ENTERED'
  },

  ZONE_BROKEN: {
    step: 6,
    icon: '❌',
    status: 'ZONE_BROKEN',
    message: 'Zone bị phá vỡ - BỎ QUA setup này',
    userAction: '🚫 Không vào lệnh',
    color: '#EF4444',  // Red
    nextStep: 'CANCELLED'
  }
};
```

**Status:** [ ] Not started

---

### Task 6: determineEntryStatus() Function

**File:** `frontend/src/services/advancedPatternDetection.js`

```javascript
/**
 * Determine current entry workflow status for a pattern
 * @param {Object} pattern - Pattern with zone info
 * @param {number} currentPrice - Current market price
 * @param {Object} latestCandle - Most recent candlestick
 * @returns {Object} Current workflow status
 */
export function determineEntryStatus(pattern, currentPrice, latestCandle) {
  const zone = pattern.zone;

  // Step 1: Check if zone is broken
  if (zone.type === 'HFZ' && currentPrice > zone.top * 1.005) {
    return {
      ...ENTRY_WORKFLOW.ZONE_BROKEN,
      reason: 'Price broke above HFZ'
    };
  }

  if (zone.type === 'LFZ' && currentPrice < zone.bottom * 0.995) {
    return {
      ...ENTRY_WORKFLOW.ZONE_BROKEN,
      reason: 'Price broke below LFZ'
    };
  }

  // Step 2: Check if price is IN zone
  const inZone = currentPrice >= zone.bottom && currentPrice <= zone.top;

  if (inZone) {
    // Step 3: Check for confirmation candle
    const confirmation = checkConfirmationCandle(latestCandle, zone.type);

    if (confirmation.hasConfirmation) {
      return {
        ...ENTRY_WORKFLOW.CONFIRMATION,
        confirmationType: confirmation.type,
        confirmationStrength: confirmation.strength
      };
    }

    // In zone but no confirmation yet
    return ENTRY_WORKFLOW.IN_ZONE;
  }

  // Step 4: Check if APPROACHING zone (within 2%)
  const distancePercent = Math.abs(currentPrice - zone.mid) / zone.mid;

  if (distancePercent < 0.02) {
    return {
      ...ENTRY_WORKFLOW.APPROACHING_ZONE,
      distance: Math.abs(currentPrice - zone.mid),
      distancePercent: distancePercent * 100
    };
  }

  // Step 5: Zone created, waiting for retest
  return ENTRY_WORKFLOW.ZONE_CREATED;
}
```

**Status:** [ ] Not started

---

### Task 7: checkConfirmationCandle() Function

**File:** `frontend/src/services/advancedPatternDetection.js`

```javascript
/**
 * Check if candlestick shows confirmation for entry
 * Detects: Pin Bars, Engulfing, Hammer, Shooting Star, Doji
 *
 * @param {Object} candle - { open, high, low, close, volume }
 * @param {string} zoneType - 'HFZ' or 'LFZ'
 * @returns {Object} { hasConfirmation, type, strength }
 */
export function checkConfirmationCandle(candle, zoneType) {
  const { open, high, low, close } = candle;

  const body = Math.abs(close - open);
  const totalRange = high - low;
  const upperWick = high - Math.max(open, close);
  const lowerWick = Math.min(open, close) - low;

  // Avoid division by zero
  if (totalRange === 0) {
    return { hasConfirmation: false };
  }

  // 1. PIN BAR DETECTION
  // Long wick (>60% of range), small body (<30% of range)
  if (zoneType === 'HFZ') {
    // Bearish pin bar (long upper wick)
    if (upperWick > totalRange * 0.6 && body < totalRange * 0.3) {
      return {
        hasConfirmation: true,
        type: 'PIN_BAR',
        strength: upperWick > totalRange * 0.75 ? 'Strong' : 'Medium',
        direction: 'bearish'
      };
    }
  } else if (zoneType === 'LFZ') {
    // Bullish pin bar (long lower wick)
    if (lowerWick > totalRange * 0.6 && body < totalRange * 0.3) {
      return {
        hasConfirmation: true,
        type: 'PIN_BAR',
        strength: lowerWick > totalRange * 0.75 ? 'Strong' : 'Medium',
        direction: 'bullish'
      };
    }
  }

  // 2. ENGULFING PATTERN
  // (Requires previous candle - implement with candle history)

  // 3. HAMMER (Bullish - for LFZ)
  if (zoneType === 'LFZ') {
    if (lowerWick > body * 2 && upperWick < body * 0.3) {
      return {
        hasConfirmation: true,
        type: 'HAMMER',
        strength: lowerWick > body * 3 ? 'Strong' : 'Medium',
        direction: 'bullish'
      };
    }
  }

  // 4. SHOOTING STAR (Bearish - for HFZ)
  if (zoneType === 'HFZ') {
    if (upperWick > body * 2 && lowerWick < body * 0.3) {
      return {
        hasConfirmation: true,
        type: 'SHOOTING_STAR',
        strength: upperWick > body * 3 ? 'Strong' : 'Medium',
        direction: 'bearish'
      };
    }
  }

  // 5. DOJI (Indecision)
  if (body < totalRange * 0.1) {
    return {
      hasConfirmation: false,  // Doji is indecision, not confirmation
      type: 'DOJI',
      strength: 'Weak',
      note: 'Indecision candle - wait for next candle'
    };
  }

  return { hasConfirmation: false };
}
```

**Status:** [ ] Not started

---

### Task 8: EntryStatusDisplay Component

**File:** `frontend/src/components/AdvancedScanner/EntryStatusDisplay.jsx` (NEW)

**UI Structure:**
```
+━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━+
│ 🎯 ENTRY WORKFLOW:                         │
│                                            │
│ ✅ 1. Pattern Detected                     │
│ ✅ 2. Zone Created                         │
│ ⏰ 3. Approaching Zone ← BẠN Ở ĐÂY       │
│ ⬜ 4. In Zone                              │
│ ⬜ 5. Confirmation                         │
│ ⬜ 6. Ready to Enter                       │
├────────────────────────────────────────────┤
│ 📊 CURRENT STATUS:                         │
│ Current Price: $41,200                     │
│ Distance to Zone: $800 (1.94%)            │
│ ⏰ Status: APPROACHING_ZONE                │
│ 💬 "Giá còn cách zone < 2% - Chuẩn bị"    │
├────────────────────────────────────────────┤
│ ⚠️ ĐỢI RETEST - ĐỪNG ENTRY NGAY!          │
│ ✅ Chờ giá vào zone + nến xác nhận         │
├────────────────────────────────────────────┤
│ [🔔 Set Alert] [📖 Trading Rules]         │
+━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━+
```

**Props:**
- `pattern` - Pattern object with zone info
- `currentPrice` - Current market price
- `currentStatus` - Result from determineEntryStatus()
- `onSetAlert` - Callback to create price alert

**Status:** [ ] Not started

---

### Task 9: ZoneRetestTracker Component

**File:** `frontend/src/components/AdvancedScanner/ZoneRetestTracker.jsx` (NEW)

**Features:**
- Display zone status (⭐⭐⭐⭐⭐ Fresh → ⭐ Weak)
- Track test count (0, 1, 2, 3+)
- Show zone age (time since creation)
- Zone strength percentage (100% → 0%)

**UI:**
```
+────────────────────────────────────────+
│ 📍 HFZ Zone: $42,000 - $42,500         │
│ ⭐ Status: FRESH (⭐⭐⭐⭐⭐)           │
│ 🧪 Tests: 0 (Never tested)             │
│ ⏱️ Age: 3 hours                        │
│ 💪 Strength: 100%                      │
+────────────────────────────────────────+
```

**Status:** [ ] Not started

---

### Task 10: ConfirmationIndicator Component

**File:** `frontend/src/components/AdvancedScanner/ConfirmationIndicator.jsx` (NEW)

**Features:**
- Show confirmation type (PIN_BAR, ENGULFING, HAMMER, etc.)
- Display strength (Weak/Medium/Strong)
- Visual indicator with color coding

**UI:**
```
+────────────────────────────────────────+
│ ✅ CONFIRMATION DETECTED               │
│                                        │
│ Type: PIN BAR (Bullish)                │
│ Strength: ████████░░ Strong (80%)     │
│                                        │
│ Lower wick: 75% of candle range       │
│ Body: 20% of candle range              │
│                                        │
│ 🎯 READY TO ENTER                     │
+────────────────────────────────────────+
```

**Status:** [ ] Not started

---

### Task 11: PatternDetailsModal Component

**File:** `frontend/src/components/AdvancedScanner/PatternDetailsModal.jsx` (NEW)

**Features:**
- Full pattern breakdown
- Entry workflow visualization
- Trade setup details (Entry, SL, TP1, TP2, TP3)
- Risk:Reward calculation
- Pattern history chart

**Status:** [ ] Not started

---

### Task 12: Enhance Scanner.jsx with TIER 2 Mode

**File:** `frontend/src/pages/Scanner.jsx` (MODIFY)

**Changes:**
1. Add TIER 2 detection (check scanner_tier >= premium)
2. If TIER 2: Show advanced features
   - EntryStatusDisplay for each result
   - ZoneRetestTracker
   - ConfirmationIndicator
   - PatternDetailsModal
3. If FREE/TIER 1: Show basic results only

**Status:** [ ] Not started

---

## 💰 TOOL 2: ENHANCED RISK CALCULATOR
**Complexity:** ⭐⭐
**Estimated Time:** 0.5 day

### Task 13: Enhance RiskCalculator.jsx

**File:** `frontend/src/components/RiskCalculator/RiskCalculator.jsx` (MODIFY)

**New Features to Add:**

1. **Zone-based Stop Loss:**
   - Auto-calculate SL from HFZ top + 0.5%
   - Auto-calculate SL from LFZ bottom - 0.5%

2. **Multiple TP Targets:**
   ```
   TP1 (1:2): Distance × 2
   TP2 (1:3): Distance × 3
   TP3 (1:5): Distance × 5
   ```

3. **Liquidation Price Calculator:**
   ```javascript
   liquidationPrice = entryPrice × (1 - (1 / leverage))
   ```

4. **Position Split Calculator:**
   - Split across multiple zones
   - DCA strategy support

**Status:** [ ] Not started

---

## 💼 TOOL 3: PORTFOLIO TRACKER + ENTRY TYPE ANALYTICS
**Complexity:** ⭐⭐⭐⭐
**Estimated Time:** 2 days

### Task 14: Create portfolioApi.js Service

**File:** `frontend/src/services/portfolioApi.js` (NEW)

**Functions:**
```javascript
// CRUD for holdings
export async function getHoldings(userId)
export async function addHolding(userId, symbol, quantity, avgPrice)
export async function updateHolding(holdingId, updates)
export async function deleteHolding(holdingId)

// CRUD for transactions
export async function getTransactions(userId, filters)
export async function addTransaction(userId, transactionData)
export async function updateTransaction(transactionId, updates)
export async function deleteTransaction(transactionId)

// Real-time pricing
export async function updateHoldingPrices(holdings)

// Analytics
export async function getPortfolioStats(userId)
export async function getEntryTypePerformance(userId)
```

**Status:** [ ] Not started

---

### Task 15: Create Portfolio.jsx Page

**File:** `frontend/src/pages/Portfolio.jsx` (NEW)

**Layout:**
```jsx
<TierGuard requiredTier="premium" featureName="Portfolio Tracker">
  <div className="portfolio-page">
    <PortfolioStats />
    <PortfolioChart />
    <HoldingsTable />
    <EntryTypeAnalytics />  {/* 🆕 */}
  </div>
</TierGuard>
```

**Status:** [ ] Not started

---

### Task 16: Create Portfolio Components

**Files to Create:**
1. `frontend/src/components/Portfolio/PortfolioTracker.jsx`
2. `frontend/src/components/Portfolio/AddHoldingModal.jsx`
3. `frontend/src/components/Portfolio/HoldingsTable.jsx`
4. `frontend/src/components/Portfolio/PortfolioChart.jsx`
5. `frontend/src/components/Portfolio/PortfolioStats.jsx`

**Features:**
- Add/Edit/Delete holdings
- Real-time price updates (10s interval)
- P&L calculation (24h, 7d, 30d, All-time)
- Pie chart (allocation)
- Line chart (performance)
- Export to CSV

**Status:** [ ] Not started

---

### Task 17: Create EntryTypeAnalytics Component

**File:** `frontend/src/components/Portfolio/EntryTypeAnalytics.jsx` (NEW)

**UI:**
```
+━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━+
│ 📊 PERFORMANCE BY ENTRY TYPE            │
├─────────────────────────────────────────┤
│ ✅ RETEST ENTRIES (Đúng phương pháp):  │
│    Total: 45 | Win: 68% | Profit: +$12K│
│ ⚠️ BREAKOUT ENTRIES (Sai phương pháp): │
│    Total: 8  | Win: 31% | Loss: -$1.2K │
│ 📈 OTHER ENTRIES:                       │
│    Total: 12 | Win: 45% | Profit: +$350│
├─────────────────────────────────────────┤
│ 💡 RECOMMENDATION:                      │
│ RETEST có win rate GẤP ĐÔI breakout!  │
│ 🎯 Kết luận: CHỈ TRADE RETEST!         │
+━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━+
```

**Status:** [ ] Not started

---

### Task 18: Create analyzeEntryTypePerformance() Function

**File:** `frontend/src/services/portfolioApi.js`

**Logic:**
```javascript
export async function analyzeEntryTypePerformance(userId) {
  // Call Supabase function get_entry_type_stats(user_id)
  const { data, error } = await supabase
    .rpc('get_entry_type_stats', { p_user_id: userId });

  // Calculate:
  // - Win rate per entry type
  // - Average R per entry type
  // - Total profit/loss per entry type
  // - Best performing patterns

  // Return recommendation based on data
  return {
    retest: { trades, winRate, avgR, profit },
    breakout: { trades, winRate, avgR, profit },
    other: { trades, winRate, avgR, profit },
    recommendation: generateRecommendation(data)
  };
}
```

**Status:** [ ] Not started

---

## 📊 TOOL 4: MULTI-TIMEFRAME ANALYSIS
**Complexity:** ⭐⭐⭐
**Estimated Time:** 1 day

### Task 19: Create MTFAnalysis.jsx Page

**File:** `frontend/src/pages/MTFAnalysis.jsx` (NEW)

**Layout:**
```jsx
<TierGuard requiredTier="premium" featureName="Multi-Timeframe Analysis">
  <div className="mtf-page">
    <div className="mtf-grid">
      <TradingViewWidget timeframe="15" symbol={symbol} />
      <TradingViewWidget timeframe="60" symbol={symbol} />
      <TradingViewWidget timeframe="240" symbol={symbol} />
      <TradingViewWidget timeframe="D" symbol={symbol} />
    </div>

    <ZoneOverlay zones={detectedZones} />
  </div>
</TierGuard>
```

**Status:** [ ] Not started

---

### Task 20: Create TradingView Components

**Files:**
1. `frontend/src/components/MultiTimeframe/TradingViewWidget.jsx` (NEW)
2. `frontend/src/components/MultiTimeframe/ZoneOverlay.jsx` (NEW)

**TradingView Integration:**
```javascript
// Load TradingView library
<script src="https://s3.tradingview.com/tv.js"></script>

// Initialize widget
new TradingView.widget({
  symbol: "BINANCE:BTCUSDT",
  interval: "240",  // 4H
  theme: "dark",
  style: "1",
  locale: "vi_VN",
  container_id: "tradingview_widget",
  // ... other configs
});
```

**Status:** [ ] Not started

---

## 📈 TOOL 5: SENTIMENT ANALYZER
**Complexity:** ⭐⭐
**Estimated Time:** 1 day

### Task 21: Create sentimentApi.js Service

**File:** `frontend/src/services/sentimentApi.js` (NEW)

**APIs to Integrate:**
```javascript
// 1. Fear & Greed Index (Alternative.me)
export async function getFearGreedIndex() {
  const response = await fetch('https://api.alternative.me/fng/');
  return response.json();
}

// 2. Trending Coins (CoinGecko)
export async function getTrendingCoins() {
  const response = await fetch('https://api.coingecko.com/api/v3/search/trending');
  return response.json();
}

// 3. Market Data (CoinGecko)
export async function getMarketData(coinIds) {
  const ids = coinIds.join(',');
  const response = await fetch(
    `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}`
  );
  return response.json();
}

// 4. Composite Sentiment Score
export function calculateSentiment(fearGreed, trendingData, marketData) {
  // Algorithm to combine all data sources
  // Return score from -100 (extreme fear) to +100 (extreme greed)
}
```

**Status:** [ ] Not started

---

### Task 22: Create Sentiment.jsx Page

**File:** `frontend/src/pages/Sentiment.jsx` (NEW)

**Components:**
```jsx
<TierGuard requiredTier="premium" featureName="Sentiment Analyzer">
  <div className="sentiment-page">
    <SentimentGauge fearGreedIndex={65} />
    <TrendingCoins data={trending} />
    <SentimentChart history={sentimentHistory} />
    <NewsAggregator news={latestNews} />
  </div>
</TierGuard>
```

**Files to Create:**
1. `frontend/src/components/Sentiment/SentimentGauge.jsx`
2. `frontend/src/components/Sentiment/TrendingCoins.jsx`
3. `frontend/src/components/Sentiment/SentimentChart.jsx`
4. `frontend/src/components/Sentiment/NewsAggregator.jsx`

**Status:** [ ] Not started

---

## 📅 TOOL 6: NEWS & EVENTS CALENDAR
**Complexity:** ⭐⭐
**Estimated Time:** 1 day

### Task 23: Create newsApi.js Service

**File:** `frontend/src/services/newsApi.js` (NEW)

**Mock Event Data Structure:**
```javascript
export const mockEvents = [
  {
    id: 1,
    date: '2025-11-10',
    title: 'Fed Interest Rate Decision',
    impact: 'HIGH',
    category: 'MACRO',
    description: 'Federal Reserve announces interest rate decision',
    expectedVolatility: 'High'
  },
  {
    id: 2,
    date: '2025-11-12',
    title: 'Ethereum Dencun Upgrade',
    impact: 'HIGH',
    category: 'CRYPTO',
    coins: ['ETH'],
    description: 'Major network upgrade for Ethereum'
  },
  // ... more events
];

export function getUpcomingEvents(daysAhead = 7)
export function getEventsByImpact(impact)
export function getEventsByCategory(category)
export function getEventsInMonth(year, month)
```

**Status:** [ ] Not started

---

### Task 24: Create NewsCalendar.jsx Page

**File:** `frontend/src/pages/NewsCalendar.jsx` (NEW)

**Components:**
```jsx
<TierGuard requiredTier="premium" featureName="News & Events Calendar">
  <div className="news-calendar-page">
    <EventFilters
      onFilterChange={handleFilterChange}
    />

    <UpcomingEvents
      events={upcomingEvents}
    />

    <EventsCalendar
      month={currentMonth}
      events={monthEvents}
    />
  </div>
</TierGuard>
```

**Files to Create:**
1. `frontend/src/components/NewsCalendar/EventsCalendar.jsx`
2. `frontend/src/components/NewsCalendar/EventCard.jsx`
3. `frontend/src/components/NewsCalendar/EventFilters.jsx`
4. `frontend/src/components/NewsCalendar/UpcomingEvents.jsx`

**Status:** [ ] Not started

---

## 🛣️ ROUTING CONFIGURATION

### Task 5: Configure App.jsx Routes

**File:** `frontend/src/App.jsx` (MODIFY)

**Routes to Add:**
```javascript
import TierGuard from './components/TierGuard/TierGuard'
import Portfolio from './pages/Portfolio'
import MTFAnalysis from './pages/MTFAnalysis'
import Sentiment from './pages/Sentiment'
import NewsCalendar from './pages/NewsCalendar'

// Inside <Routes>:

{/* TIER 2 Routes - Protected by TierGuard */}
<Route path="/portfolio" element={
  <TierGuard requiredTier="premium" featureName="Portfolio Tracker">
    <Portfolio />
  </TierGuard>
} />

<Route path="/mtf-analysis" element={
  <TierGuard requiredTier="premium" featureName="Multi-Timeframe Analysis">
    <MTFAnalysis />
  </TierGuard>
} />

<Route path="/sentiment" element={
  <TierGuard requiredTier="premium" featureName="Sentiment Analyzer">
    <Sentiment />
  </TierGuard>
} />

<Route path="/news-calendar" element={
  <TierGuard requiredTier="premium" featureName="News & Events Calendar">
    <NewsCalendar />
  </TierGuard>
} />

{/* Enhanced Scanner (TIER 2 mode auto-detected in component) */}
<Route path="/scanner" element={<Scanner />} />
<Route path="/risk-calculator" element={<RiskCalculator />} />
```

**Navigation Menu Update:**
Add links to new pages for TIER 2 users.

**Status:** [ ] Not started

---

## 🧪 TESTING CHECKLIST

### Task 25: Test Tier Access Control

**Test Cases:**
- [ ] FREE user sees UpgradePrompt on all 6 tools
- [ ] TIER 1 (PRO) user sees UpgradePrompt on all 6 tools
- [ ] TIER 2 (PREMIUM) user has full access to all 6 tools
- [ ] TIER 3 (VIP) user has full access to all 6 tools
- [ ] TierGuard logs tier check correctly in console
- [ ] UpgradePrompt displays "21M VND/năm" (not "đ")

**Status:** [ ] Not started

---

### Task 26: Test Entry Status System

**Test Cases:**
- [ ] Pattern detection creates zone correctly
- [ ] Status changes from ZONE_CREATED → APPROACHING_ZONE when price within 2%
- [ ] Status changes to IN_ZONE when price enters zone boundaries
- [ ] Status changes to CONFIRMATION when pin bar/engulfing detected
- [ ] Status changes to ZONE_BROKEN when price breaks through
- [ ] Warning banner displays "ĐỢI RETEST - ĐỪNG ENTRY NGAY!"
- [ ] User CANNOT entry at breakout (no button/feature for breakout entry)

**Status:** [ ] Not started

---

### Task 27: Test Entry Type Analytics

**Test Cases:**
- [ ] Add transaction with entry_type = 'RETEST'
- [ ] Add transaction with entry_type = 'BREAKOUT'
- [ ] Verify analytics show RETEST has higher win rate
- [ ] Verify recommendation says "CHỈ TRADE RETEST!"
- [ ] Verify best performing patterns display correctly
- [ ] Test with 0 trades, 1 trade, 100+ trades

**Status:** [ ] Not started

---

### Task 28: Test Price Formatting

**Test Cases:**
- [ ] UpgradePrompt shows "21M VND/năm" NOT "21.000.000đ"
- [ ] PriceDisplay shows "11M VND/năm" for TIER 1
- [ ] PriceDisplay shows "68M VND/24 tháng" for TIER 3
- [ ] All pricing pages use VND format
- [ ] No "đ" symbol anywhere in the app

**Status:** [ ] Not started

---

### Task 29: Test Mobile Responsiveness

**Test Cases:**
- [ ] Portfolio page responsive on mobile
- [ ] MTF Analysis 4 charts stack on mobile
- [ ] Sentiment gauge scales correctly
- [ ] News calendar switches to list view on mobile
- [ ] Entry workflow steps readable on mobile
- [ ] UpgradePrompt readable on mobile

**Status:** [ ] Not started

---

## 📁 COMPLETE FILE STRUCTURE

```
frontend/src/
├── components/
│   ├── PriceDisplay/                    ✅ DONE
│   │   ├── PriceDisplay.jsx
│   │   └── PriceDisplay.css
│   │
│   ├── UpgradePrompt/                   ✅ DONE
│   │   ├── UpgradePrompt.jsx
│   │   └── UpgradePrompt.css
│   │
│   ├── TierGuard/                       ✅ DONE
│   │   ├── TierGuard.jsx
│   │   └── TierGuard.css
│   │
│   ├── AdvancedScanner/                 ⏳ TODO
│   │   ├── EntryStatusDisplay.jsx
│   │   ├── EntryStatusDisplay.css
│   │   ├── ZoneRetestTracker.jsx
│   │   ├── ZoneRetestTracker.css
│   │   ├── ConfirmationIndicator.jsx
│   │   ├── ConfirmationIndicator.css
│   │   ├── PatternDetailsModal.jsx
│   │   └── PatternDetailsModal.css
│   │
│   ├── Portfolio/                       ⏳ TODO
│   │   ├── PortfolioTracker.jsx
│   │   ├── PortfolioTracker.css
│   │   ├── AddHoldingModal.jsx
│   │   ├── HoldingsTable.jsx
│   │   ├── PortfolioChart.jsx
│   │   ├── PortfolioStats.jsx
│   │   ├── EntryTypeAnalytics.jsx
│   │   └── EntryTypeAnalytics.css
│   │
│   ├── MultiTimeframe/                  ⏳ TODO
│   │   ├── TradingViewWidget.jsx
│   │   ├── ZoneOverlay.jsx
│   │   └── styles.css
│   │
│   ├── Sentiment/                       ⏳ TODO
│   │   ├── SentimentGauge.jsx
│   │   ├── TrendingCoins.jsx
│   │   ├── SentimentChart.jsx
│   │   ├── NewsAggregator.jsx
│   │   └── styles.css
│   │
│   └── NewsCalendar/                    ⏳ TODO
│       ├── EventsCalendar.jsx
│       ├── EventCard.jsx
│       ├── EventFilters.jsx
│       ├── UpcomingEvents.jsx
│       └── styles.css
│
├── pages/
│   ├── Portfolio.jsx                    ⏳ TODO
│   ├── MTFAnalysis.jsx                  ⏳ TODO
│   ├── Sentiment.jsx                    ⏳ TODO
│   ├── NewsCalendar.jsx                 ⏳ TODO
│   ├── Scanner.jsx                      🔄 ENHANCE
│   └── App.jsx                          🔄 UPDATE ROUTING
│
└── services/
    ├── advancedPatternDetection.js      ⏳ TODO (CRITICAL)
    ├── portfolioApi.js                  ⏳ TODO
    ├── sentimentApi.js                  ⏳ TODO
    └── newsApi.js                       ⏳ TODO
```

---

## ⏱️ REALISTIC TIMELINE

### Week 1 (Days 1-2): ✅ COMPLETED
- [x] Database migration
- [x] Foundation components (TierGuard, UpgradePrompt, PriceDisplay)

### Week 1 (Days 3-4): TOOL 1 - Advanced Scanner
- [ ] advancedPatternDetection.js (ENTRY_WORKFLOW, determineEntryStatus, checkConfirmationCandle)
- [ ] EntryStatusDisplay component
- [ ] ZoneRetestTracker component
- [ ] ConfirmationIndicator component
- [ ] PatternDetailsModal component
- [ ] Enhance Scanner.jsx

### Week 1 (Day 5): TOOL 2 - Enhanced Calculator
- [ ] Add zone-based features to RiskCalculator
- [ ] Multiple TP targets
- [ ] Liquidation calculator

### Week 2 (Days 6-7): TOOL 3 - Portfolio Tracker
- [ ] portfolioApi.js service
- [ ] Portfolio.jsx page
- [ ] All portfolio components
- [ ] EntryTypeAnalytics component
- [ ] Analytics logic

### Week 2 (Day 8): TOOL 4 - Multi-Timeframe
- [ ] MTFAnalysis.jsx page
- [ ] TradingView widget integration
- [ ] Zone overlay system

### Week 2 (Day 9): TOOL 5 - Sentiment
- [ ] sentimentApi.js service
- [ ] Sentiment.jsx page
- [ ] All sentiment components

### Week 2 (Day 10): TOOL 6 - News Calendar
- [ ] newsApi.js service
- [ ] NewsCalendar.jsx page
- [ ] All calendar components

### Week 2-3 (Days 11-12): Testing & Polish
- [ ] Tier access testing
- [ ] Entry workflow testing
- [ ] Analytics testing
- [ ] Mobile testing
- [ ] Bug fixes

---

## 🚀 NEXT STEPS

**Ready to continue?** Here are your options:

### Option A: Continue with Tool 1 (Advanced Scanner)
Most critical tool with Entry Workflow System. Takes 2-3 days.

### Option B: Implement all tools in sequence
Follow the timeline above (8-10 more days of work).

### Option C: Implement specific tool first
Choose which tool to prioritize:
- Portfolio Tracker (most useful for users)
- MTF Analysis (visually impressive)
- Sentiment (easiest to implement)
- News Calendar (quick win)

### Option D: Review and modify the plan
Adjust scope, features, or approach before continuing.

---

**Which option would you like to proceed with?** 🤔

---

## 📝 NOTES

- All prices MUST use VND format (not đ)
- Entry workflow MUST prevent breakout trading
- Analytics MUST prove RETEST superiority
- All tools MUST be protected by TierGuard
- Database migration MUST be applied first
- Test with all 4 tier levels (FREE, PRO, PREMIUM, VIP)

---

**Document Version:** 1.0
**Last Updated:** 2025-01-08
**Status:** Ready for Review ✅
