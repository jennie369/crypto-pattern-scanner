# PHÂN TÍCH STATE MANAGEMENT - Gemral

**Date:** 2025-11-12
**Project:** Crypto Pattern Scanner (Gemral)
**State Management:** React Context API + Custom Hooks

---

## 1. OVERVIEW

### 🏗️ **Architecture**
- **Primary Method:** React Context API
- **No External State Library:** No Redux, Zustand, MobX, or Jotai
- **Custom Hooks:** Reusable logic abstraction
- **Local State:** Component-level useState for UI state

### 📊 **State Distribution**
```
┌──────────────────────────────────────────┐
│  Global State (Context API)              │
│  - AuthContext (user, profile)          │
│  - ScanContext (scan results)           │
│  - PriceContext (live prices)           │
└──────────────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────┐
│  Custom Hooks (Reusable Logic)           │
│  - useAuth()                             │
│  - useQuota()                            │
│  - useIpQuota()                          │
│  - useScanHistory()                      │
│  - useTranslation()                      │
└──────────────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────┐
│  Component Local State (useState)        │
│  - UI toggles                            │
│  - Form inputs                           │
│  - Modal visibility                      │
│  - Loading states                        │
└──────────────────────────────────────────┘
```

---

## 2. CONTEXT PROVIDERS

### 🔐 **AuthContext**

**File:** `src/contexts/AuthContext.jsx`
**Purpose:** User authentication and profile management

**State:**
```javascript
{
  user: {
    id: string,
    email: string,
    // Supabase auth user
  },
  profile: {
    id: string,
    email: string,
    full_name: string,
    scan_count: number,
    last_scan_at: timestamp,
    created_at: timestamp,
    updated_at: timestamp,
    course_tier: 'free' | 'TIER1' | 'TIER2' | 'TIER3',
    scanner_tier: 'free' | 'premium' | 'vip',
    chatbot_tier: 'free' | 'premium' | 'vip',
    course_tier_expires_at: timestamp | null,
    scanner_tier_expires_at: timestamp | null,
    chatbot_tier_expires_at: timestamp | null
  },
  loading: boolean,
  initialLoadDone: boolean
}
```

**Methods:**
- `loadUserProfile(userId)` - Fetch user profile from database
- `signIn(email, password)` - Login user
- `signUp(email, password, fullName)` - Register user
- `signOut()` - Logout user
- `updateProfile(data)` - Update user profile
- `isAdmin()` - Check if user is admin

**Usage:**
```javascript
const { user, profile, loading, signIn, signOut } = useAuth();
```

**Initialized In:** `src/main.jsx` wraps entire app

---

### 📊 **ScanContext**

**File:** `src/contexts/ScanContext.jsx`
**Purpose:** Persist scan results across navigation

**State:**
```javascript
{
  scanResults: [
    {
      symbol: string,
      pattern: string,
      signal: 'LONG' | 'SHORT',
      entry: number,
      stopLoss: number,
      takeProfit: number,
      confidence: number,
      timestamp: Date
    }
  ]
}
```

**Methods:**
- `saveScanResults(results)` - Save scan results
- `clearScanResults()` - Clear saved results

**Usage:**
```javascript
const { scanResults, saveScanResults } = useScan();
```

**Why Needed:** Preserve scan results when navigating between pages (Scanner → Analytics → History)

---

### 💹 **PriceContext**

**File:** `src/contexts/PriceContext.jsx`
**Purpose:** Real-time price updates via WebSocket

**State:**
```javascript
{
  prices: {
    'BTCUSDT': {
      price: number,
      change: number,
      changePercent: number,
      volume: number,
      lastUpdate: timestamp
    },
    // ... other symbols
  },
  connected: boolean,
  subscribed: string[] // List of subscribed symbols
}
```

**Methods:**
- `subscribeToSymbol(symbol)` - Subscribe to price updates
- `unsubscribeFromSymbol(symbol)` - Unsubscribe
- `getPrice(symbol)` - Get current price

**Implementation:**
- Uses Binance WebSocket API
- Automatic reconnection on disconnect
- Cleanup on unmount

**Usage:**
```javascript
const { prices, subscribeToSymbol } = usePriceContext();
```

---

## 3. CUSTOM HOOKS

### 🔐 **useAuth**

**File:** `src/contexts/AuthContext.jsx`
**Returns:** Auth context value
**Usage:** Access user authentication state and methods

---

### 📊 **useQuota**

**File:** `src/hooks/useQuota.js`
**Purpose:** Manage authenticated user scan quota

**State:**
```javascript
{
  quota: {
    scans_remaining: number,
    scans_total: number,
    canScan: boolean,
    tier: 'free' | 'premium' | 'vip',
    unlimited: boolean
  },
  loading: boolean
}
```

**Methods:**
- `useQuotaSlot()` - Consume 1 scan quota
- `refreshQuota()` - Reload quota from database
- `checkCanScan()` - Check if user can scan

**Database Integration:** Queries `users` table for `scan_count` and tier

**Usage:**
```javascript
const { quota, useQuotaSlot, refreshQuota } = useQuota();
```

---

### 🌐 **useIpQuota**

**File:** `src/hooks/useIpQuota.js`
**Purpose:** IP-based quota for non-authenticated users

**State:**
```javascript
{
  ipQuota: {
    remaining: number,
    total: number, // 3 scans per day
    canScan: boolean,
    lastReset: timestamp
  }
}
```

**Methods:**
- `checkIpQuota()` - Check IP quota status
- `useIPQuotaSlot()` - Consume 1 IP scan
- `incrementIpScan()` - Increment scan count
- `refreshIPQuota()` - Reload IP quota

**Storage:** Uses Supabase `ip_scans` table

**Usage:**
```javascript
const { ipQuota, useIPQuotaSlot } = useIpQuota();
```

---

### 📜 **useScanHistory**

**File:** `src/hooks/useScanHistory.js`
**Purpose:** Scan history CRUD operations

**Methods:**
- `saveScan(scanData)` - Save scan to history
- `fetchHistory(userId, filters)` - Get scan history
- `deleteScan(scanId)` - Delete scan from history
- `getScanById(scanId)` - Get specific scan

**Database:** Queries `scan_history` table

**Usage:**
```javascript
const { saveScan, fetchHistory } = useScanHistory();
```

---

### 🌍 **useTranslation**

**File:** `src/hooks/useTranslation.js`
**Purpose:** Internationalization (i18n) support

**State:**
```javascript
{
  language: 'en' | 'vi',
  translations: object
}
```

**Methods:**
- `t(key)` - Translate key to current language
- `setLanguage(lang)` - Change language

**Usage:**
```javascript
const { t, language } = useTranslation();
```

---

## 4. COMPONENT-LEVEL STATE PATTERNS

### 📋 **COMMON useState PATTERNS**

#### **UI Toggle States**
```javascript
const [showModal, setShowModal] = useState(false);
const [isLoading, setIsLoading] = useState(false);
const [activeTab, setActiveTab] = useState('overview');
const [expanded, setExpanded] = useState(false);
```

#### **Form State**
```javascript
const [formData, setFormData] = useState({
  name: '',
  email: '',
  // ...
});

const handleChange = (e) => {
  setFormData({ ...formData, [e.target.name]: e.target.value });
};
```

#### **Data Fetching State**
```javascript
const [data, setData] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
  const fetchData = async () => {
    try {
      const result = await api.getData();
      setData(result);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };
  fetchData();
}, []);
```

#### **Selection State**
```javascript
const [selectedSymbol, setSelectedSymbol] = useState('BTCUSDT');
const [selectedPattern, setSelectedPattern] = useState(null);
const [selectedTimeframe, setSelectedTimeframe] = useState('4h');
```

---

## 5. DATA FLOW PATTERNS

### 📊 **Scanner Page Data Flow**

```
┌────────────────────────────────────────────────────────────┐
│  1. User clicks "Scan All" button                          │
└──────────────────┬─────────────────────────────────────────┘
                   ▼
┌────────────────────────────────────────────────────────────┐
│  2. Scanner.jsx sets isScannerActive = true                │
│     Triggers focus mode (blur background)                  │
└──────────────────┬─────────────────────────────────────────┘
                   ▼
┌────────────────────────────────────────────────────────────┐
│  3. PatternScanner component executes scan                 │
│     - Fetches candle data from Binance                     │
│     - Runs pattern detection algorithm                     │
│     - Returns results array                                │
└──────────────────┬─────────────────────────────────────────┘
                   ▼
┌────────────────────────────────────────────────────────────┐
│  4. Scanner.jsx receives results                           │
│     setScanResults(results)  // Component state            │
│     saveScanResults(results) // ScanContext (persist)      │
│     useQuotaSlot()           // Consume quota              │
└──────────────────┬─────────────────────────────────────────┘
                   ▼
┌────────────────────────────────────────────────────────────┐
│  5. UI Updates                                             │
│     - CoinListSidebar displays results                     │
│     - TradingChart shows selected pattern                  │
│     - TradingInfoSidebar shows pattern details             │
└────────────────────────────────────────────────────────────┘
```

### 💾 **Portfolio Data Flow**

```
┌────────────────────────────────────────────────────────────┐
│  1. User adds holding via AddHoldingModal                  │
└──────────────────┬─────────────────────────────────────────┘
                   ▼
┌────────────────────────────────────────────────────────────┐
│  2. handleAddHolding() calls portfolioApi.addHolding()     │
└──────────────────┬─────────────────────────────────────────┘
                   ▼
┌────────────────────────────────────────────────────────────┐
│  3. portfolioApi inserts into Supabase 'holdings' table    │
└──────────────────┬─────────────────────────────────────────┘
                   ▼
┌────────────────────────────────────────────────────────────┐
│  4. loadPortfolioData() refreshes all data                 │
│     - fetchHoldings()                                      │
│     - fetchTransactions()                                  │
│     - getPortfolioStats()                                  │
│     - getEntryTypeAnalytics()                              │
└──────────────────┬─────────────────────────────────────────┘
                   ▼
┌────────────────────────────────────────────────────────────┐
│  5. Component state updates                                │
│     setHoldings(data)                                      │
│     setStats(stats)                                        │
└────────────────────────────────────────────────────────────┘
```

---

## 6. PROPS DRILLING ANALYSIS

### ⚠️ **PROPS DRILLING OCCURRENCES**

**Moderate Props Drilling:**
- `Scanner.jsx` → `CoinListSidebar`, `TradingChart`, `TradingInfoSidebar`
  - Passes: `selectedSymbol`, `scanResults`, `onSelectCoin`, `patterns`
  - **Severity:** Medium
  - **Recommendation:** Consider using context for scan-related state

- `Portfolio.jsx` → `HoldingsTable`, `PortfolioChart`, `PortfolioStats`
  - Passes: `holdings`, `stats`, `transactions`, `onEdit`, `onDelete`
  - **Severity:** Low (2 levels only)

**No Significant Issues:**
- Most components receive props directly from parent
- Context API prevents deep prop drilling for auth/quota

---

## 7. PERFORMANCE CONSIDERATIONS

### ✅ **GOOD PRACTICES**

1. **Selective Re-rendering**
   - Context providers split by domain (Auth, Scan, Price)
   - Prevents unnecessary re-renders

2. **Lazy Loading**
   - React.lazy() for route-based code splitting (not yet implemented)

3. **Memoization**
   - Some components use useMemo/useCallback (limited usage)

### ⚠️ **OPTIMIZATION OPPORTUNITIES**

1. **Missing Memoization**
   - Large lists (CoinListSidebar) not memoized
   - Chart components re-render unnecessarily

2. **Context Optimization**
   - PriceContext updates frequently (WebSocket)
   - Consider splitting into multiple contexts by symbol

3. **Component Splitting**
   - Scanner.jsx is large (~500+ lines)
   - Could benefit from smaller sub-components

---

## 8. STATE PERSISTENCE

### 💾 **PERSISTED STATE**

**ScanContext (Session Storage):**
- Scan results persist across navigation
- Cleared on browser close

**AuthContext (Supabase Session):**
- Auth session stored in localStorage
- Automatic session restoration on reload

**No Redux Persist or Similar:**
- No long-term state persistence beyond auth session

### 🔄 **REFRESH BEHAVIOR**

**On Page Reload:**
- Auth state restored from Supabase session
- Scan results lost (ScanContext resets)
- Price subscriptions re-established

---

## 9. ERROR HANDLING

### ⚠️ **ERROR STATE PATTERNS**

```javascript
// Common pattern
const [error, setError] = useState(null);

try {
  // operation
} catch (err) {
  setError(err.message);
  console.error(err);
}

// Display error
{error && <div className="error">{error}</div>}
```

### 🚨 **ERROR BOUNDARIES**

**Status:** Not implemented
**Recommendation:** Add React Error Boundaries for graceful error handling

---

## 10. TESTING CONSIDERATIONS

### 🧪 **TESTABILITY**

**Current State:**
- No tests found
- Context and hooks are testable with React Testing Library

**Recommendations:**
1. Add tests for custom hooks (useQuota, useIpQuota)
2. Test context providers with mock data
3. Integration tests for critical flows (scan, portfolio)

---

## 11. COMPARISON: CURRENT vs ALTERNATIVES

### 📊 **Current: Context API + Hooks**

**Pros:**
- ✅ No external dependencies
- ✅ Native React solution
- ✅ Easy to understand
- ✅ Sufficient for current scale

**Cons:**
- ⚠️ Verbose for complex state
- ⚠️ No time-travel debugging
- ⚠️ Limited dev tools

### 🔄 **Alternative: Redux Toolkit**

**Would Provide:**
- Centralized state store
- Redux DevTools
- Easier testing
- Middleware support

**Trade-offs:**
- More boilerplate
- Additional dependency
- Learning curve

### ⚡ **Alternative: Zustand**

**Would Provide:**
- Simpler than Redux
- Less boilerplate
- Better performance
- Smaller bundle size

**Trade-offs:**
- New dependency
- Migration effort

---

## 12. RECOMMENDATIONS

### 🎯 **SHORT-TERM (No Breaking Changes)**

1. **Add Memoization**
   - Use React.memo() for expensive components
   - useMemo() for computed values
   - useCallback() for event handlers

2. **Split Large Components**
   - Break down Scanner.jsx (~500 lines)
   - Extract sub-components

3. **Error Boundaries**
   - Add error boundaries for graceful failures
   - Prevent full app crashes

4. **Better Loading States**
   - Skeleton loaders
   - Consistent loading indicators

### 🚀 **LONG-TERM (Refactoring)**

1. **Consider State Library**
   - If app grows significantly
   - Consider Zustand for simplicity
   - Or Redux Toolkit for maturity

2. **Code Splitting**
   - Implement React.lazy() for routes
   - Reduce initial bundle size

3. **State Persistence**
   - Add IndexedDB for offline support
   - Persist scan results

4. **Add Testing**
   - Unit tests for hooks
   - Integration tests for flows
   - E2E tests for critical paths

---

## ✅ SUMMARY

### 📈 **STATE MANAGEMENT SCORE**

| Aspect | Rating | Notes |
|--------|--------|-------|
| **Architecture** | ⭐⭐⭐⭐ (4/5) | Clean Context API usage |
| **Performance** | ⭐⭐⭐ (3/5) | Needs memoization |
| **Scalability** | ⭐⭐⭐ (3/5) | Good for current size |
| **Testability** | ⭐⭐ (2/5) | No tests yet |
| **Dev Experience** | ⭐⭐⭐⭐ (4/5) | Easy to understand |
| **Error Handling** | ⭐⭐⭐ (3/5) | Basic error states |

**Overall:** ⭐⭐⭐ (3.5/5) - **GOOD**

### 🎯 **KEY TAKEAWAYS**

1. **Context API is sufficient** for current app scale
2. **Custom hooks** provide good abstraction
3. **Performance optimization** needed (memoization)
4. **Testing** is critical gap
5. **Error boundaries** should be added

**Ready for:** ✅ Continued development with current architecture
**Consider refactoring if:** App grows beyond 50+ components or state becomes too complex

---

**Analysis Date:** 2025-11-12
**Status:** ✅ Complete - State management is well-structured with room for optimization
