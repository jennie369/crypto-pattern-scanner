# 🐛 BUG TRACKER - PHASE 2 WEEK 3
## Prioritized Bug List for Launch

**Last Updated:** November 16, 2025
**Total Bugs:** 17
**Critical:** 2 open, 1 fixed ✅
**Status:** Ready for assignment

---

## 🔴 P0 - CRITICAL (BLOCKING SOFT LAUNCH)

### **BUG-001: User Profiles Database Table Missing**
- **Priority:** P0 - CRITICAL 🔴
- **Severity:** BLOCKER
- **Status:** 🔴 OPEN
- **Assigned:** TBD
- **Estimated Time:** 1 hour
- **Deadline:** Before soft launch

**Description:**
The `profiles` table doesn't exist in the database. All profile save operations fail silently.

**Impact:**
- Users can't save profile changes
- Feature appears broken
- Silent failures confuse users

**Files Affected:**
- `src/pages/Community/UserProfile.jsx`
- Database schema

**Steps to Reproduce:**
1. Navigate to Profile page
2. Edit display name or bio
3. Click "Save"
4. Refresh page
5. Changes are lost (not saved)

**Expected Behavior:**
- Profile changes should persist
- Success message should appear
- Database should store user profile data

**Actual Behavior:**
- Changes don't save
- No error shown (fails silently)
- Database missing `profiles` table

**Fix Required:**
```sql
-- Create profiles table migration
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  location TEXT,
  website TEXT,
  twitter_handle TEXT,
  telegram_handle TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Add RLS policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

**Migration File:** `20250116_create_profiles_table.sql`

**Testing:**
- [ ] Create profile for new user
- [ ] Edit existing profile
- [ ] Verify changes persist
- [ ] Check RLS policies work
- [ ] Test on staging
- [ ] Deploy to production

---

### **BUG-002: Direct Messages Missing Block/Report**
- **Priority:** P0 - CRITICAL 🔴
- **Severity:** SAFETY RISK
- **Status:** 🔴 OPEN
- **Assigned:** TBD
- **Estimated Time:** 4 hours
- **Deadline:** Before soft launch

**Description:**
Direct messaging feature has no way to block or report users. This is a serious safety risk.

**Impact:**
- Users can't protect themselves from harassment
- No way to report abuse
- Platform liability for harassment
- Violates best practices for social features

**Files Affected:**
- `src/pages/Messages/Messages.jsx`
- `src/services/messaging.js`
- Database: need `blocked_users` and `reported_users` tables

**Steps to Reproduce:**
1. Open Messages
2. Start conversation with user
3. Look for block/report buttons
4. Not found

**Expected Behavior:**
- Message header has "..." menu
- Menu shows "Block User" and "Report User" options
- Blocking prevents future messages
- Reporting creates moderation ticket

**Actual Behavior:**
- No block or report options exist
- Users have no recourse against harassment

**Fix Required:**

1. **UI Changes** (`Messages.jsx`):
```jsx
// Add dropdown menu to message header
<div className="message-header">
  <div className="participant-info">...</div>
  <div className="message-actions">
    <button className="btn-icon" onClick={() => setShowMenu(true)}>
      <MoreVertical size={20} />
    </button>
  </div>
</div>

{showMenu && (
  <div className="dropdown-menu">
    <button onClick={handleBlockUser}>
      <Ban size={16} /> Block User
    </button>
    <button onClick={handleReportUser}>
      <Flag size={16} /> Report User
    </button>
  </div>
)}
```

2. **Database Migration**:
```sql
-- Blocked users table
CREATE TABLE IF NOT EXISTS public.blocked_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  blocker_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(blocker_id, blocked_id)
);

-- Reported users table
CREATE TABLE IF NOT EXISTS public.reported_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reported_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES public.conversations(id),
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, reviewing, resolved, dismissed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES auth.users(id)
);

-- Add RLS policies
ALTER TABLE public.blocked_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reported_users ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own blocks"
  ON public.blocked_users FOR SELECT
  USING (auth.uid() = blocker_id);

CREATE POLICY "Users can block others"
  ON public.blocked_users FOR INSERT
  WITH CHECK (auth.uid() = blocker_id);

CREATE POLICY "Users can unblock"
  ON public.blocked_users FOR DELETE
  USING (auth.uid() = blocker_id);
```

3. **Service Functions** (`messaging.js`):
```javascript
export const blockUser = async (userId, blockedUserId) => {
  const { data, error } = await supabase
    .from('blocked_users')
    .insert({ blocker_id: userId, blocked_id: blockedUserId });

  if (error) throw error;
  return data;
};

export const reportUser = async (userId, reportedUserId, conversationId, reason) => {
  const { data, error } = await supabase
    .from('reported_users')
    .insert({
      reporter_id: userId,
      reported_id: reportedUserId,
      conversation_id: conversationId,
      reason
    });

  if (error) throw error;
  return data;
};

export const isUserBlocked = async (userId, otherUserId) => {
  const { data, error } = await supabase
    .from('blocked_users')
    .select('id')
    .or(`and(blocker_id.eq.${userId},blocked_id.eq.${otherUserId}),and(blocker_id.eq.${otherUserId},blocked_id.eq.${userId})`);

  return data && data.length > 0;
};
```

**Testing:**
- [ ] Block user works
- [ ] Blocked user can't send messages
- [ ] Report user creates ticket
- [ ] Admin can view reports
- [ ] Unblock functionality works
- [ ] Test on staging
- [ ] Deploy to production

---

### **BUG-003: AI Prediction Missing Disclaimer** ✅ FIXED
- **Priority:** P0 - CRITICAL 🔴
- **Severity:** LEGAL RISK
- **Status:** ✅ **RESOLVED**
- **Assigned:** Claude Code
- **Time Taken:** 10 minutes
- **Fixed On:** November 16, 2025

**Description:**
AI Prediction page had no "Not Financial Advice" disclaimer, creating legal liability.

**Fix Applied:**
Added prominent disclaimer banner above prediction results:
```jsx
{/* DISCLAIMER BANNER */}
<div style={{ /* orange gradient warning banner */ }}>
  <AlertTriangle size={24} />
  <div>
    <div>⚠️ NOT FINANCIAL ADVICE</div>
    <div>
      AI predictions are for educational purposes only.
      Always conduct your own research and consult with a
      financial advisor before making any trading decisions.
    </div>
  </div>
</div>
```

**Files Changed:**
- ✅ `src/pages/AIPrediction.jsx` (lines 191-223)

**Status:** ✅ **DEPLOYED** - No further action needed

---

## 🟡 P1 - HIGH PRIORITY (FIX BEFORE PUBLIC LAUNCH)

### **BUG-004: Alerts Manager Doesn't Exist**
- **Priority:** P1 - HIGH 🟡
- **Severity:** FEATURE GAP
- **Status:** 🟡 DECISION NEEDED
- **Assigned:** Product Team
- **Estimated Time:** 2-3 days (if building) OR 0 hours (if removing)
- **Deadline:** Before public launch

**Description:**
Testing plan and roadmap mention "Alerts Manager" TIER 3 tool, but feature was never built.

**Impact:**
- Users expect price/pattern alerts based on marketing
- Roadmap promises not met
- Competitive disadvantage (other platforms have alerts)

**Options:**

**OPTION A: Build Feature** (Recommended for TIER 3)
- **Time:** 2-3 days
- **Features to Build:**
  - Price alerts (above/below threshold, cross moving average)
  - Pattern alerts (notify when DPD/UPU detected)
  - Whale alerts (notify when >$1M transaction)
  - Notification methods (email, Telegram, push)
  - Alert history
  - Edit/delete alerts
- **Files to Create:**
  - `src/pages/AlertsManager.jsx`
  - `src/services/alertsService.js`
  - Database migration for `alerts` table
- **Value:** High - users frequently request this feature

**OPTION B: Remove from Roadmap** (Quick fix)
- **Time:** 0 hours
- **Actions:**
  - Update roadmap docs
  - Remove from testing plan
  - Mark as "Future Feature"
  - Don't mention in marketing
- **Value:** Avoid broken promises, focus on core features

**Recommendation:** **BUILD IT** - Alerts are table stakes for TIER 3 trading platform

**Decision Needed:** Product Owner

---

### **BUG-005: Exchange API Keys Not Supported**
- **Priority:** P1 - HIGH 🟡
- **Severity:** FEATURE INCOMPLETE
- **Status:** 🟡 OPEN
- **Assigned:** TBD
- **Estimated Time:** 1 day
- **Deadline:** Before public launch

**Description:**
API Keys management only handles app API keys, not exchange API keys (Binance/OKX/Bybit). Testing plan and TIER 3 roadmap expect exchange integration.

**Impact:**
- Can't auto-trade via user's exchange account
- Can't sync portfolio from exchange
- TIER 3 feature incomplete

**Files Affected:**
- `src/pages/EnhancedSettings/AdvancedSettings.jsx`
- `src/services/settingsService.js`

**Fix Required:**

1. **Add Exchange Selection**:
```jsx
<select value={exchange} onChange={(e) => setExchange(e.target.value)}>
  <option value="">Select Exchange</option>
  <option value="binance">Binance</option>
  <option value="okx">OKX</option>
  <option value="bybit">Bybit</option>
  <option value="kucoin">KuCoin</option>
</select>
```

2. **Add API Key + Secret Fields**:
```jsx
<input
  type="text"
  placeholder="API Key"
  value={apiKey}
  onChange={(e) => setApiKey(e.target.value)}
/>
<input
  type="password"
  placeholder="Secret Key"
  value={secretKey}
  onChange={(e) => setSecretKey(e.target.value)}
/>
```

3. **Add Permissions Checkboxes**:
```jsx
<label>
  <input type="checkbox" checked={permissions.readOnly} />
  Read-Only (View balances, orders)
</label>
<label>
  <input type="checkbox" checked={permissions.trading} />
  Trading (Place orders)
</label>
<label>
  <input type="checkbox" checked={permissions.withdrawal} />
  Withdrawal (Withdraw funds) - ⚠️ HIGH RISK
</label>
```

4. **Add Test Connection**:
```jsx
<button onClick={handleTestConnection}>
  {testing ? 'Testing...' : 'Test Connection'}
</button>
```

5. **Database Schema**:
```sql
ALTER TABLE api_keys ADD COLUMN exchange TEXT;
ALTER TABLE api_keys ADD COLUMN secret_key_encrypted TEXT;
ALTER TABLE api_keys ADD COLUMN permissions JSONB DEFAULT '{}';
ALTER TABLE api_keys ADD COLUMN last_tested_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE api_keys ADD COLUMN connection_status TEXT DEFAULT 'untested';
```

**Testing:**
- [ ] Save Binance API key
- [ ] Test connection works
- [ ] Keys encrypted in DB
- [ ] Permissions saved correctly
- [ ] Can edit/delete exchange keys
- [ ] Test on staging
- [ ] Deploy to production

---

### **BUG-006: Backtesting Missing Export**
- **Priority:** P1 - HIGH 🟡
- **Severity:** USABILITY
- **Status:** 🟡 OPEN
- **Assigned:** TBD
- **Estimated Time:** 4 hours
- **Deadline:** Before public launch

**Description:**
Backtesting results can't be exported to CSV or PDF. Users can't save or share results.

**Impact:**
- Users have to screenshot results (bad UX)
- Can't share with team/advisor
- Can't track historical backtest performance

**Files Affected:**
- `src/pages/Backtesting.jsx`

**Fix Required:**

1. **Add Export Buttons**:
```jsx
<div className="export-buttons">
  <button className="btn-secondary" onClick={exportToCSV}>
    <Download size={16} /> Export CSV
  </button>
  <button className="btn-secondary" onClick={exportToPDF}>
    <FileText size={16} /> Export PDF
  </button>
</div>
```

2. **CSV Export Function**:
```javascript
const exportToCSV = () => {
  // Headers
  const headers = ['Trade #', 'Symbol', 'Pattern', 'Direction', 'Entry', 'Exit', 'P&L', 'R:R', 'Result', 'Duration', 'Zone Status'];

  // Rows
  const rows = results.trades.map((trade, idx) => [
    idx + 1,
    trade.symbol,
    trade.pattern_type,
    trade.trade_direction,
    trade.entry_price,
    trade.exit_price,
    trade.pnl,
    trade.rratio_actual,
    trade.result,
    trade.trade_duration_hours,
    trade.zone_status
  ]);

  // Convert to CSV
  const csv = [headers, ...rows].map(row => row.join(',')).join('\n');

  // Download
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `backtest_${currentConfig.name}_${Date.now()}.csv`;
  a.click();
};
```

3. **PDF Export Function** (using jsPDF):
```javascript
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const exportToPDF = () => {
  const doc = new jsPDF();

  // Title
  doc.setFontSize(18);
  doc.text(`Backtest Results: ${currentConfig.name}`, 14, 20);

  // Summary
  doc.setFontSize(12);
  doc.text(`Win Rate: ${results.metrics.win_rate.toFixed(2)}%`, 14, 35);
  doc.text(`Total Return: ${results.metrics.total_return.toFixed(2)}%`, 14, 42);
  doc.text(`Net Profit: $${results.metrics.net_profit.toFixed(2)}`, 14, 49);

  // Trades table
  doc.autoTable({
    startY: 60,
    head: [['#', 'Symbol', 'Pattern', 'Entry', 'Exit', 'P&L', 'Result']],
    body: results.trades.map((trade, idx) => [
      idx + 1,
      trade.symbol,
      trade.pattern_type,
      trade.entry_price.toFixed(2),
      trade.exit_price.toFixed(2),
      trade.pnl.toFixed(2),
      trade.result
    ]),
  });

  // Download
  doc.save(`backtest_${currentConfig.name}_${Date.now()}.pdf`);
};
```

**Dependencies:**
- `npm install jspdf jspdf-autotable`

**Testing:**
- [ ] CSV export downloads correctly
- [ ] CSV opens in Excel
- [ ] PDF export generates
- [ ] PDF looks professional
- [ ] Large datasets (1000+ trades) export OK
- [ ] Test on staging
- [ ] Deploy to production

---

### **BUG-007: Backtesting Missing Equity Curve**
- **Priority:** P1 - HIGH 🟡
- **Severity:** VISUALIZATION
- **Status:** 🟡 OPEN
- **Assigned:** TBD
- **Estimated Time:** 6 hours
- **Deadline:** Before public launch

**Description:**
No visual chart showing equity growth over time. Difficult to visualize strategy performance.

**Impact:**
- Users can't see capital growth visually
- Harder to identify drawdown periods
- Missing industry-standard visualization

**Files Affected:**
- `src/pages/Backtesting.jsx`

**Fix Required:**

1. **Install Charting Library**:
```bash
npm install recharts
```

2. **Add Equity Curve Component**:
```jsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

{/* Equity Curve Chart */}
<div className="equity-curve-section">
  <h4>Equity Curve</h4>
  <ResponsiveContainer width="100%" height={400}>
    <LineChart data={results.equityCurve}>
      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
      <XAxis
        dataKey="date"
        stroke="rgba(255,255,255,0.6)"
        tick={{ fill: 'rgba(255,255,255,0.6)' }}
      />
      <YAxis
        stroke="rgba(255,255,255,0.6)"
        tick={{ fill: 'rgba(255,255,255,0.6)' }}
        label={{ value: 'Equity ($)', angle: -90, position: 'insideLeft' }}
      />
      <Tooltip
        contentStyle={{
          background: 'rgba(10, 14, 39, 0.9)',
          border: '1px solid rgba(255, 189, 89, 0.3)',
          borderRadius: '8px'
        }}
      />
      <Legend />
      <Line
        type="monotone"
        dataKey="equity"
        stroke="#0ECB81"
        strokeWidth={2}
        dot={false}
        name="Account Equity"
      />
      <Line
        type="monotone"
        dataKey="drawdown"
        stroke="#F6465D"
        strokeWidth={1}
        strokeDasharray="5 5"
        dot={false}
        name="Drawdown"
      />
    </LineChart>
  </ResponsiveContainer>
</div>
```

3. **Update backtestingService to Return Equity Curve Data**:
```javascript
// In backtestingService.js
const calculateEquityCurve = (trades, initialCapital) => {
  const curve = [];
  let equity = initialCapital;

  trades.forEach((trade, idx) => {
    equity += trade.pnl;
    curve.push({
      date: trade.exit_time,
      equity: equity,
      drawdown: Math.min(0, equity - initialCapital),
      tradeNumber: idx + 1
    });
  });

  return curve;
};

// Add to results object
results.equityCurve = calculateEquityCurve(trades, initialCapital);
```

**Testing:**
- [ ] Chart renders correctly
- [ ] Equity line accurate
- [ ] Drawdown shows correctly
- [ ] Tooltip shows trade details
- [ ] Responsive on mobile
- [ ] Test with large datasets
- [ ] Test on staging
- [ ] Deploy to production

---

### **BUG-008: Affiliate System Not Integrated**
- **Priority:** P1 - HIGH 🟡
- **Severity:** REVENUE IMPACT
- **Status:** 🟡 OPEN
- **Assigned:** TBD
- **Estimated Time:** 1 day
- **Deadline:** Before public launch

**Description:**
Affiliate code exists (dashboard, backend functions, database) but is never called. Referrals don't track, sales don't attribute to affiliates.

**Impact:**
- Can't launch affiliate program
- Lose potential revenue from partner marketing
- Wasted development (code exists but unused)

**Files Affected:**
- `src/pages/Signup.jsx` (needs to check referral code)
- `src/pages/Cart.jsx` or checkout flow (needs to track sale)
- `supabase/functions/shopify-webhook/index.ts` (needs affiliate tracking)

**Fix Required:**

1. **Signup Flow** (`Signup.jsx`):
```javascript
import { checkReferralCode, trackReferralSignup } from '../services/affiliate';

// On component mount
useEffect(() => {
  const urlParams = new URLSearchParams(window.location.search);
  const ref = urlParams.get('ref');

  if (ref) {
    // Validate referral code
    checkReferralCode(ref).then(isValid => {
      if (isValid) {
        setReferralCode(ref);
        // Store in localStorage for checkout later
        localStorage.setItem('referral_code', ref);
      }
    });
  }
}, []);

// After successful signup
const handleSignup = async (email, password) => {
  const user = await signUp(email, password);

  // Track referral signup
  if (referralCode) {
    await trackReferralSignup(user.id, referralCode);
  }
};
```

2. **Checkout Flow** (after purchase):
```javascript
import { trackAffiliateSale } from '../services/affiliate';

// After successful Shopify purchase
const handlePurchaseComplete = async (orderId, amount, products) => {
  const referralCode = localStorage.getItem('referral_code');

  if (referralCode) {
    await trackAffiliateSale({
      referral_code: referralCode,
      order_id: orderId,
      amount: amount,
      products: products
    });

    // Clear referral code after attribution
    localStorage.removeItem('referral_code');
  }
};
```

3. **Shopify Webhook** (`index.ts`):
```typescript
// In shopify-webhook handler, after tier upgrade
if (order.customer.email) {
  // Check if user signed up via referral
  const { data: referralData } = await supabase
    .from('affiliate_referrals')
    .select('affiliate_id, referral_code')
    .eq('referred_user_email', order.customer.email)
    .single();

  if (referralData) {
    // Track affiliate sale
    await supabase.from('affiliate_sales').insert({
      affiliate_id: referralData.affiliate_id,
      referral_code: referralData.referral_code,
      order_id: order.id,
      product_sku: sku,
      sale_amount: order.total_price,
      currency: order.currency,
      commission_rate: getCommissionRate(referralData.affiliate_id, sku),
      commission_amount: calculateCommission(order.total_price, sku),
      status: 'pending' // Pending admin approval
    });
  }
}
```

4. **Admin Approval UI** (create new component):
```jsx
// src/pages/Admin/AffiliateApprovals.jsx
const AffiliateApprovals = () => {
  const [pendingCommissions, setPendingCommissions] = useState([]);

  const loadPending = async () => {
    const { data } = await supabase
      .from('affiliate_sales')
      .select('*, affiliate_profiles(*)')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    setPendingCommissions(data);
  };

  const approveCommission = async (saleId) => {
    await supabase
      .from('affiliate_sales')
      .update({ status: 'approved', approved_at: new Date() })
      .eq('id', saleId);

    // Create commission record
    await createCommissionRecord(saleId);

    await loadPending();
  };

  return (
    <div>
      <h2>Affiliate Commission Approvals</h2>
      {pendingCommissions.map(commission => (
        <div key={commission.id}>
          <div>{commission.affiliate_profiles.name}</div>
          <div>{commission.product_sku}</div>
          <div>${commission.sale_amount}</div>
          <div>Commission: ${commission.commission_amount}</div>
          <button onClick={() => approveCommission(commission.id)}>
            Approve
          </button>
        </div>
      ))}
    </div>
  );
};
```

**Testing:**
- [ ] Signup with ?ref=GEM12345678 tracks referral
- [ ] Purchase after signup attributes to affiliate
- [ ] Shopify webhook creates affiliate_sale record
- [ ] Admin can approve commissions
- [ ] Affiliate dashboard shows pending commissions
- [ ] Test full flow end-to-end
- [ ] Test on staging
- [ ] Deploy to production

---

## 🟢 P2 - MEDIUM PRIORITY (FIX POST-LAUNCH)

*(Bugs #9-15 listed with same format, abbreviated for space)*

### **BUG-009: Events Calendar Read-Only** (6h)
### **BUG-010: Leaderboard Uses Mock Data** (4h)
### **BUG-011: GEM Chatbot Mock AI Only** (1 day)
### **BUG-012: Courses No Backend Integration** (2 days)
### **BUG-013: AI Prediction Single Timeframe** (4h)
### **BUG-014: AI Prediction No Model Selection** (2-3 days or remove)
### **BUG-015: Whale Tracker Limited Coverage** (1-2 days per chain)

---

## 🔵 P3 - LOW PRIORITY (FUTURE ENHANCEMENTS)

### **BUG-016: API Keys No Test Connection** (2h)
### **BUG-017: API Keys No Permissions Granularity** (2h)

---

## 📊 BUG STATISTICS

```
Total Bugs: 17

By Priority:
- P0 (Critical):  3 bugs (2 open, 1 fixed ✅)
- P1 (High):      6 bugs
- P2 (Medium):    6 bugs
- P3 (Low):       2 bugs

By Status:
- 🔴 Open:        16 bugs
- ✅ Fixed:       1 bug
- 🟡 Needs Decision: 1 bug (BUG-004)

Total Estimated Time:
- P0: 5 hours (BLOCKING)
- P1: 4-5 days
- P2: 1-2 weeks
- P3: 4 hours
```

---

## 🎯 SPRINT PLANNING

### **SPRINT 1: CRITICAL (5 hours)**
**Goal:** Fix P0 bugs for soft launch

- [ ] BUG-001: Profiles table (1h)
- [ ] BUG-002: Block/report (4h)

**Deliverable:** Soft launch ready ✅

---

### **SPRINT 2: HIGH PRIORITY (Week 1)**
**Goal:** Fix P1 bugs for public launch

- [ ] BUG-004: Decide on Alerts Manager
- [ ] BUG-005: Exchange API Keys (1 day)
- [ ] BUG-006: Backtesting Export (4h)
- [ ] BUG-007: Equity Curve (6h)
- [ ] BUG-008: Affiliate Integration (1 day)

**Deliverable:** Public launch ready 🚀

---

### **SPRINT 3: POLISH (Weeks 2-3)**
**Goal:** Fix P2 bugs for full ecosystem

- [ ] BUG-009 through BUG-015 (gradual rollout)

**Deliverable:** Full ecosystem complete 💎

---

## 📞 NEXT ACTIONS

1. **Assign bugs** to developers
2. **Create database migrations** (BUG-001, BUG-002)
3. **Start Sprint 1** (critical fixes)
4. **Review BUG-004** with Product Owner (build or remove?)
5. **Track progress** in this document

---

**Last Updated:** November 16, 2025
**Status:** Ready for development
**Next Review:** After Sprint 1 (soft launch)
