# 🧪 TEST TIER 2 USER - HƯỚNG DẪN CHI TIẾT

## 📋 OVERVIEW

Guide này giúp test toàn bộ TIER 2 Advanced Tools với user có quyền premium.

**Test Time:** 15-20 phút
**Prerequisites:** Dev server đang chạy, Supabase đã deploy migration

---

## 1️⃣ TẠO TEST USER

### Cách 1: Sign Up UI (Khuyến nghị)

1. **Start dev server:**
   ```bash
   cd frontend
   npm run dev
   ```

2. **Mở browser:**
   ```
   http://localhost:5173/signup
   ```

3. **Điền form:**
   - Email: `tier2test@example.com`
   - Password: `Test123456!`
   - Confirm Password: `Test123456!`

4. **Click "Sign Up"**

5. **Check email** để verify (hoặc verify manual trong Supabase)

### Cách 2: Supabase SQL (Nếu không có email verification)

```sql
-- Insert user vào auth.users (nếu signup không hoạt động)
-- Chỉ dùng nếu Cách 1 không work

INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at
)
VALUES (
  gen_random_uuid(),
  'tier2test@example.com',
  crypt('Test123456!', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW()
);
```

---

## 2️⃣ UPGRADE USER LÊN TIER 2 (PREMIUM)

### Mở Supabase SQL Editor:
```
https://supabase.com/dashboard/project/pgfkbcnzqozzkohwbgbk/sql
```

### Run SQL này:

```sql
-- Update user lên TIER 2 Premium
UPDATE profiles
SET
  scanner_tier = 'premium',
  scanner_tier_expires_at = NOW() + INTERVAL '1 year'
WHERE email = 'tier2test@example.com';

-- Verify update thành công
SELECT
  email,
  scanner_tier,
  scanner_tier_expires_at
FROM profiles
WHERE email = 'tier2test@example.com';
```

**Expected output:**
```
email: tier2test@example.com
scanner_tier: premium
scanner_tier_expires_at: 2026-01-09 (1 năm sau)
```

---

## 3️⃣ LOGIN VỚI TEST USER

1. **Logout user hiện tại** (nếu có)
   - Click avatar góc phải → Logout

2. **Login với test user:**
   - Email: `tier2test@example.com`
   - Password: `Test123456!`

3. **Verify login thành công:**
   - Check avatar góc phải
   - Tier badge hiển thị "PREMIUM" hoặc "TIER 2"

---

## 4️⃣ TEST ACCESS CONTROL

### Test 4.1: Portfolio Tracker
```
URL: http://localhost:5173/portfolio
```

**Checklist:**
- [ ] Page load không có UpgradePrompt
- [ ] Hiển thị 4 tabs: Overview, Holdings, History, Analytics
- [ ] Console log: "Has Access: ✅ YES"
- [ ] Không có error 403 hoặc redirect

### Test 4.2: Multi-Timeframe Analysis
```
URL: http://localhost:5173/mtf-analysis
```

**Checklist:**
- [ ] Page load thành công
- [ ] 4 TradingView widgets hiển thị (15m, 1h, 4h, 1d)
- [ ] Symbol selector hoạt động
- [ ] Layout toggle (grid/stacked) hoạt động
- [ ] **Console check:** Không có CSP errors
- [ ] **Console check:** "TradingView script loaded"

### Test 4.3: Sentiment Analyzer
```
URL: http://localhost:5173/sentiment
```

**Checklist:**
- [ ] Fear & Greed gauge hiển thị
- [ ] Sentiment score (0-100) visible
- [ ] Historical chart (30 days) renders
- [ ] Trending coins list visible
- [ ] Market overview stats hiển thị

### Test 4.4: News & Events Calendar
```
URL: http://localhost:5173/news-calendar
```

**Checklist:**
- [ ] Event list loads
- [ ] High-impact banner hiển thị (nếu có high-impact events)
- [ ] Search bar hoạt động
- [ ] Category filter hoạt động
- [ ] Impact filter hoạt động
- [ ] Timeline view toggle hoạt động

---

## 5️⃣ TEST ENTRY WORKFLOW SYSTEM

### Test 5.1: Scanner TIER 2 Mode

1. **Navigate to Scanner:**
   ```
   http://localhost:5173/scanner
   ```

2. **Enable TIER 2 Mode:**
   - Tìm button "💎 TIER 2 OFF"
   - Click để toggle thành "💎 TIER 2 ON"

3. **Scan Symbol:**
   - Symbol: BTCUSDT
   - Interval: 15m
   - Click "Start Scan"

4. **Check Results:**
   - [ ] Patterns hiển thị
   - [ ] Click vào pattern → Modal opens
   - [ ] Modal title: "Pattern Details"

### Test 5.2: Entry Status Display

Trong Pattern Details Modal:

**Checklist:**
- [ ] Entry Status section visible
- [ ] Current status hiển thị (e.g., "ZONE_CREATED")
- [ ] 6-step progress bar visible
- [ ] Warning banner hiển thị
- [ ] Warning text match status:
  - PATTERN_DETECTED: "⚠️ DO NOT ENTER YET - Wait for price to retest the zone"
  - ZONE_CREATED: "⚠️ DO NOT ENTER YET - Wait for price to return to zone"
  - CONFIRMATION: "✅ READY TO ENTER - Confirmation detected, execute trade now!"

### Test 5.3: Zone Quality Display

**Checklist:**
- [ ] Zone stars rating visible (1-5 stars)
- [ ] Zone label: "Fresh Zone", "Strong Zone", etc.
- [ ] Zone color matches quality
- [ ] Test count displayed

---

## 6️⃣ TEST PORTFOLIO & ENTRY TYPE ANALYTICS

### Test 6.1: Add Holdings

1. **Navigate to Portfolio → Holdings tab**

2. **Add RETEST Entry:**
   - Click "Add Holding"
   - Symbol: BTCUSDT
   - Quantity: 0.1
   - Entry Price: 50000
   - **Entry Type: RETEST** ⭐
   - Notes: "Test RETEST entry"
   - Click "Add"

3. **Add BREAKOUT Entry:**
   - Click "Add Holding" again
   - Symbol: ETHUSDT
   - Quantity: 1
   - Entry Price: 3000
   - **Entry Type: BREAKOUT** ⭐
   - Notes: "Test BREAKOUT entry"
   - Click "Add"

**Checklist:**
- [ ] Both holdings added successfully
- [ ] Holdings table shows 2 entries
- [ ] Entry types visible in table

### Test 6.2: Entry Type Analytics

1. **Navigate to Analytics tab**

2. **Check Analytics Display:**
   - [ ] RETEST card hiển thị
   - [ ] BREAKOUT card hiển thị
   - [ ] Recommendation banner visible
   - [ ] Win rate comparison visible
   - [ ] Total profit comparison visible

3. **Check Recommendation:**
   - [ ] Text contains "CHỈ TRADE RETEST!"
   - [ ] RETEST card has "✅ Preferred Strategy" badge
   - [ ] BREAKOUT card has "⚠️ Not Recommended" badge

### Test 6.3: Add Transactions (Để có analytics data)

Để test analytics đầy đủ, cần có transactions:

```sql
-- Run trong Supabase SQL Editor

-- Insert mock RETEST transactions (wins)
INSERT INTO portfolio_transactions (
  user_id,
  symbol,
  transaction_type,
  quantity,
  price,
  total_amount,
  entry_type,
  pattern_type,
  realized_pnl
)
SELECT
  p.id,
  'BTCUSDT',
  'SELL',
  0.1,
  52000,
  5200,
  'RETEST',
  'DPD',
  200.00
FROM profiles p
WHERE p.email = 'tier2test@example.com';

-- Insert mock BREAKOUT transactions (losses)
INSERT INTO portfolio_transactions (
  user_id,
  symbol,
  transaction_type,
  quantity,
  price,
  total_amount,
  entry_type,
  pattern_type,
  realized_pnl
)
SELECT
  p.id,
  'ETHUSDT',
  'SELL',
  1,
  2900,
  2900,
  'BREAKOUT',
  'UPU',
  -100.00
FROM profiles p
WHERE p.email = 'tier2test@example.com';
```

**Reload Analytics tab:**
- [ ] RETEST shows 100% win rate
- [ ] BREAKOUT shows 0% win rate
- [ ] Chart compares correctly
- [ ] Insight cards auto-generate

---

## 7️⃣ TEST MOBILE RESPONSIVE

### Test 7.1: Chrome DevTools

1. **Open DevTools:** F12
2. **Toggle Device Toolbar:** Ctrl+Shift+M
3. **Select Devices:**
   - iPhone 12 Pro (390x844)
   - iPad (768x1024)
   - Responsive (1200x800)

### Test 7.2: Breakpoint Tests

**Desktop (1400px):**
- [ ] All pages load normally
- [ ] Grid layouts: 4 columns → normal
- [ ] Navigation: horizontal

**Tablet (768px):**
- [ ] Portfolio stats: 4 cols → 2 cols
- [ ] Entry type cards: 2 cols → 1 col
- [ ] Navigation: still horizontal

**Mobile (390px):**
- [ ] Portfolio stats: 1 column
- [ ] Tables convert to cards
- [ ] Tabs scroll horizontally
- [ ] Font sizes reduced
- [ ] Padding adjusted

### Test All Pages Mobile:

**Scanner:**
- [ ] Controls stack vertically
- [ ] Results cards full width
- [ ] TIER 2 button visible

**Portfolio:**
- [ ] Tabs scroll horizontally
- [ ] Holdings table → card view
- [ ] Chart responsive

**MTF Analysis:**
- [ ] Charts stack vertically
- [ ] Symbol selector full width
- [ ] 4 charts visible (scrollable)

**Sentiment:**
- [ ] Gauge scales correctly
- [ ] Chart responsive
- [ ] Trending list full width

**News Calendar:**
- [ ] Event cards stack
- [ ] Filters stack vertically
- [ ] Timeline responsive

---

## 8️⃣ TEST ZONE DETECTION LOGIC

### Test 8.1: HFZ Detection (Short Pattern)

1. **Scan for DPD pattern** (Down-Pause-Down = HFZ)
2. **Check zone creation:**
   - [ ] Zone type = "HFZ"
   - [ ] Zone top = near recent high
   - [ ] Zone bottom = slightly below high
   - [ ] Zone mid = entry price

### Test 8.2: LFZ Detection (Long Pattern)

1. **Scan for UPU pattern** (Up-Pause-Up = LFZ)
2. **Check zone creation:**
   - [ ] Zone type = "LFZ"
   - [ ] Zone bottom = near recent low
   - [ ] Zone top = slightly above low
   - [ ] Zone mid = entry price

### Test 8.3: Distance Calculation

**Check console logs:**
```javascript
// Should see:
🔍 Entry Status Check:
   - Current Price: 50500
   - Zone: LFZ (50000-50100)
   - Distance to zone: 0.79% (APPROACHING)
   - Status: APPROACHING_ZONE
```

---

## 9️⃣ TEST RISK CALCULATOR ENHANCEMENT

### Test 9.1: Zone-Based Stop Loss

1. **Navigate to Risk Calculator**
   ```
   http://localhost:5173/risk-calculator
   ```

2. **Enable Zone SL:**
   - [ ] Toggle "Use Zone-Based SL" ON
   - [ ] SL auto-calculates from zone
   - [ ] LONG: SL = zone.bottom - 0.5%
   - [ ] SHORT: SL = zone.top + 0.5%

### Test 9.2: Multiple Take Profits

1. **Enable Multiple TP:**
   - [ ] Toggle "Multiple TPs" ON
   - [ ] 3 TPs hiển thị:
     - TP1: 1:2 R:R (50% position)
     - TP2: 1:3 R:R (30% position)
     - TP3: 1:5 R:R (20% position)

2. **Check Calculations:**
   - [ ] Weighted avg R:R = 2.9
   - [ ] Total profit = sum of 3 TPs
   - [ ] Position sizes add to 100%

---

## 🔟 PERFORMANCE & ERROR HANDLING TEST

### Test 10.1: API Failures

**Disconnect internet** (hoặc block API trong DevTools):

**Sentiment Page:**
- [ ] Mock data loads (không crash)
- [ ] Fear & Greed: mock value hiển thị
- [ ] Trending coins: mock data hiển thị
- [ ] Error message friendly (không error stack)

**News Calendar:**
- [ ] Mock events load
- [ ] 20 mock events visible

### Test 10.2: Network Throttling

**DevTools → Network → Slow 3G:**

**MTF Analysis:**
- [ ] Widgets load progressively
- [ ] Loading states visible
- [ ] No timeout errors

**Portfolio:**
- [ ] Data loads eventually
- [ ] Loading spinner visible
- [ ] No crash on slow load

### Test 10.3: Console Errors

**Check console for entire session:**
- [ ] No uncaught errors
- [ ] No failed network requests (except expected API failures)
- [ ] No React warnings
- [ ] No CSP violations

---

## ✅ FINAL CHECKLIST

### Access Control: 4/4
- [ ] Portfolio loads for premium user
- [ ] MTF Analysis loads for premium user
- [ ] Sentiment loads for premium user
- [ ] News Calendar loads for premium user

### Entry Workflow: 3/3
- [ ] 6-step workflow displays correctly
- [ ] Only CONFIRMATION allows entry
- [ ] Warnings match status

### Portfolio Analytics: 3/3
- [ ] RETEST vs BREAKOUT comparison works
- [ ] Win rate calculation correct
- [ ] Recommendation auto-generates

### Mobile Responsive: 5/5
- [ ] Scanner responsive
- [ ] Portfolio responsive
- [ ] MTF Analysis responsive
- [ ] Sentiment responsive
- [ ] News Calendar responsive

### Zone Detection: 3/3
- [ ] HFZ created for short patterns
- [ ] LFZ created for long patterns
- [ ] Distance calculation accurate

### Risk Calculator: 2/2
- [ ] Zone-based SL works
- [ ] Multiple TPs calculate correctly

### Performance: 3/3
- [ ] API failures handled gracefully
- [ ] Mock data fallback works
- [ ] No console errors

---

## 📊 TEST REPORT TEMPLATE

```markdown
# TIER 2 Test Report

**Date:** 2025-01-09
**Tester:** [Your Name]
**Test User:** tier2test@example.com

## Results:

### Access Control: ✅ PASS
- Portfolio: ✅
- MTF Analysis: ✅
- Sentiment: ✅
- News Calendar: ✅

### Entry Workflow: ✅ PASS
- 6-step display: ✅
- CONFIRMATION only entry: ✅
- Warnings: ✅

### Portfolio Analytics: ✅ PASS
- Entry type comparison: ✅
- Win rate calc: ✅
- Recommendations: ✅

### Mobile: ✅ PASS
- All pages: ✅

### Overall: ✅ PASS

## Issues Found:
1. [None]

## Recommendations:
1. [Optional improvements]
```

---

## 🆘 TROUBLESHOOTING

### Issue: "UpgradePrompt still showing"
**Fix:** Verify `scanner_tier = 'premium'` trong database
```sql
SELECT email, scanner_tier FROM profiles WHERE email = 'tier2test@example.com';
```

### Issue: "TradingView widgets not loading"
**Fix:** Check CSP header in Network tab, verify `https://s3.tradingview.com` allowed

### Issue: "Portfolio API errors"
**Fix:** Verify migration deployed:
```sql
SELECT column_name FROM information_schema.columns
WHERE table_name = 'portfolio_transactions' AND column_name = 'entry_type';
```

### Issue: "Mock data not loading"
**Fix:** Check console for import errors, verify `sentimentApi.js` and `newsApi.js` exist

---

**Test Duration:** 15-20 minutes
**Last Updated:** 2025-01-09
**Version:** TIER 2 Advanced Tools v1.0
