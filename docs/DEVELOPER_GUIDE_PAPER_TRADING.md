# 🔧 Paper Trading Developer Guide

Technical documentation for GEM Trading's Paper Trading System.

---

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Component Structure](#component-structure)
3. [Database Schema](#database-schema)
4. [Data Flow](#data-flow)
5. [Key Functions](#key-functions)
6. [Adding Features](#adding-features)
7. [Testing](#testing)
8. [Troubleshooting](#troubleshooting)

---

## Architecture Overview

### Tech Stack
- **Frontend**: React 18 + Vite
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **Real-time**: Binance WebSocket API
- **State**: React Context API + useState
- **Styling**: CSS Modules (GEM Theme)
- **Notifications**: react-hot-toast

### High-Level Architecture
```
User Interface (React)
    ↓
PaperTradingPanel Component
    ↓
Services Layer (paperTrading.js, binanceWebSocket.js)
    ↓
Supabase Database (PostgreSQL)
    ↓
Order Monitor Service (Background Processing)
```

---

## Component Structure

```
src/
├── components/
│   ├── PaperTradingPanel/
│   │   ├── PaperTradingPanel.jsx        # Main trading interface
│   │   └── PaperTradingPanel.css
│   ├── PaperTrading/
│   │   ├── OpenPositionsWidget.jsx      # Positions display + close
│   │   ├── OpenPositionsWidget.css
│   │   ├── RecentTradesSection.jsx      # Trade history
│   │   └── RecentTradesSection.css
│   ├── CustomSelect/
│   │   ├── CustomSelect.jsx             # Custom dropdown component
│   │   └── CustomSelect.css
│   ├── shared/
│   │   ├── LoadingSpinner.jsx           # Reusable spinner
│   │   ├── LoadingSpinner.css
│   │   ├── ErrorState.jsx               # Error display + retry
│   │   └── ErrorState.css
│   └── ErrorBoundary.jsx                # Global error catcher
├── services/
│   ├── paperTrading.js                  # API: executeBuy, executeSell, etc.
│   ├── orderMonitor.js                  # Background order processing
│   └── binanceWebSocket.js              # WebSocket price streaming
├── contexts/
│   └── AuthContext.jsx                  # User auth + tier management
└── pages/
    └── Dashboard/
        └── Scanner/
            └── v2/
                └── ScannerPage.jsx      # Scanner integration
```

---

## Database Schema

### `paper_trading_orders`
Stores all trading orders (pending, filled, cancelled).

```sql
CREATE TABLE paper_trading_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    symbol VARCHAR(20) NOT NULL,
    side VARCHAR(4) NOT NULL CHECK (side IN ('buy', 'sell')),
    order_type VARCHAR(20) NOT NULL CHECK (order_type IN ('market', 'limit', 'stop-limit')),
    quantity DECIMAL(20, 8) NOT NULL,
    price DECIMAL(20, 2),                    -- Entry price (filled price)
    limit_price DECIMAL(20, 2),              -- For limit/stop-limit orders
    stop_price DECIMAL(20, 2),               -- For stop-limit orders
    time_in_force VARCHAR(10) DEFAULT 'GTC', -- GTC, IOC, FOK
    reduce_only BOOLEAN DEFAULT false,
    take_profit_price DECIMAL(20, 2),
    stop_loss_price DECIMAL(20, 2),
    parent_order_id UUID,                    -- For TP/SL orders
    linked_order_type VARCHAR(2),            -- 'TP' or 'SL'
    status VARCHAR(20) DEFAULT 'pending',    -- pending, filled, cancelled
    created_at TIMESTAMP DEFAULT NOW(),
    filled_at TIMESTAMP,
    CONSTRAINT fk_parent_order FOREIGN KEY (parent_order_id) REFERENCES paper_trading_orders(id)
);

CREATE INDEX idx_orders_user_status ON paper_trading_orders(user_id, status);
CREATE INDEX idx_orders_parent ON paper_trading_orders(parent_order_id);
```

### `paper_trading_holdings`
Stores current positions.

```sql
CREATE TABLE paper_trading_holdings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    symbol VARCHAR(20) NOT NULL,
    quantity DECIMAL(20, 8) NOT NULL,
    entry_price DECIMAL(20, 2) NOT NULL,    -- Average entry price
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, symbol)
);

CREATE INDEX idx_holdings_user ON paper_trading_holdings(user_id);
```

### `paper_trading_accounts`
Stores user balances.

```sql
CREATE TABLE paper_trading_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id),
    balance DECIMAL(20, 2) DEFAULT 10000.00,
    initial_balance DECIMAL(20, 2) DEFAULT 10000.00,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_accounts_user ON paper_trading_accounts(user_id);
```

---

## Data Flow

### Place Order Flow

```
1. User clicks BUY/SELL
     ↓
2. Frontend validates inputs (quantity, price, balance)
     ↓
3. executeBuy() or executeSell() called (paperTrading.js)
     ↓
4. Insert order into paper_trading_orders table
     ↓
5. If MARKET order:
   - Update balance immediately
   - Update holdings immediately
   - Set status = 'filled'
   If LIMIT/STOP-LIMIT order:
   - Set status = 'pending'
   - Order Monitor will handle execution
     ↓
6. If TP/SL specified:
   - Create TP order with parent_order_id
   - Create SL order with parent_order_id
     ↓
7. Toast notification (success/error)
     ↓
8. UI updates (refresh positions, balance)
```

### Order Monitor Flow

```
orderMonitor.startMonitoring()
     ↓
Fetch all pending orders
     ↓
For each unique symbol:
   Subscribe to Binance WebSocket
     ↓
On price update:
   Check all pending orders for that symbol
   ↓
   If limit order && price reached:
      - Execute order (update balance, holdings)
      - Set status = 'filled'
      - If has linked TP/SL → cancel them (OCO logic)
   ↓
   If stop-limit && stop price reached:
      - Trigger order execution at limit price
   ↓
   If TP/SL order && parent filled:
      - Cancel this order
```

---

## Key Functions

### `executeBuy(tradeData)`
**File:** `src/services/paperTrading.js`

**Purpose:** Create and execute BUY order.

**Parameters:**
```javascript
{
  userId: string,
  accountId: string,
  symbol: string,
  price: number,              // Current market price
  quantity: number,
  orderType: 'market' | 'limit' | 'stop-limit',
  limitPrice: number,         // For limit/stop-limit
  stopPrice: number,          // For stop-limit
  timeInForce: 'GTC' | 'IOC' | 'FOK',
  reduceOnly: boolean,
  takeProfitPrice: number,    // Optional
  stopLossPrice: number,      // Optional
}
```

**Returns:**
```javascript
{
  success: boolean,
  order: Order object,
  message: string,
  error: string (if failed)
}
```

**Example:**
```javascript
const result = await executeBuy({
  userId: user.id,
  accountId: account.id,
  symbol: 'BTCUSDT',
  price: 50000,
  quantity: 0.1,
  orderType: 'market',
  timeInForce: 'GTC',
  takeProfitPrice: 52000,
  stopLossPrice: 49000,
});

if (result.success) {
  toast.success('Order executed!');
} else {
  toast.error(result.error);
}
```

---

### `executeSell(tradeData)`
Same as `executeBuy()` but for SELL side.

---

### `closePosition(holdingId, userId)`
**File:** `src/services/paperTrading.js`

**Purpose:** Close position at current market price.

**Example:**
```javascript
await closePosition(position.id, user.id);
```

---

### `getHoldings(userId)`
**Purpose:** Fetch user's open positions.

**Returns:** Array of holdings
```javascript
[
  {
    id: 'uuid',
    symbol: 'BTCUSDT',
    quantity: 0.1,
    entry_price: 50000,
  },
  // ...
]
```

---

### `getOrders(userId, limit = 10)`
**Purpose:** Fetch user's recent orders/trades.

**Returns:** Array of orders

---

## Adding Features

### Example: Add New Order Type

**Step 1: Update Database**
```sql
ALTER TABLE paper_trading_orders
  ADD COLUMN new_field VARCHAR;
```

**Step 2: Update executeBuy/executeSell**
```javascript
// src/services/paperTrading.js

export const executeBuy = async (tradeData) => {
  const { newField } = tradeData; // Extract new param

  // Insert with new field
  const { data, error } = await supabase
    .from('paper_trading_orders')
    .insert({
      // ... existing fields
      new_field: newField,
    });

  // ... rest of logic
};
```

**Step 3: Update UI**
```jsx
// src/components/PaperTradingPanel/PaperTradingPanel.jsx

const [newField, setNewField] = useState('');

// Add input
<input value={newField} onChange={e => setNewField(e.target.value)} />

// Pass to executeBuy
await executeBuy({
  ...tradeData,
  newField,
});
```

---

## Testing

### Manual Testing
See [TESTING_CHECKLIST.md](./TESTING_CHECKLIST.md) for comprehensive test plan.

### Unit Test Example
```javascript
import { executeBuy } from '../services/paperTrading';

describe('executeBuy', () => {
  it('should create market order', async () => {
    const result = await executeBuy({
      userId: 'test-user-id',
      accountId: 'test-account-id',
      symbol: 'BTCUSDT',
      price: 50000,
      quantity: 0.1,
      orderType: 'market',
      timeInForce: 'GTC',
    });

    expect(result.success).toBe(true);
    expect(result.order.status).toBe('filled');
  });

  it('should create pending limit order', async () => {
    const result = await executeBuy({
      orderType: 'limit',
      limitPrice: 49000,
      // ... params
    });

    expect(result.success).toBe(true);
    expect(result.order.status).toBe('pending');
  });
});
```

---

## Troubleshooting

### Common Issues

#### Orders Not Executing
**Symptoms:** Pending limit/stop orders not filling despite price reaching target.

**Checks:**
1. Is Order Monitor running? Check console logs
2. WebSocket connected? Check network tab
3. Order in database with `status='pending'`?
4. Price actually reached limit? Check exact decimal values

**Fix:**
```javascript
// Check orderMonitor.js
console.log('[Order Monitor] Monitoring:', pendingOrders.length, 'orders');

// Verify WebSocket
binanceWS.subscribe('BTCUSDT', (data) => {
  console.log('Price update:', data.price);
});
```

---

#### P&L Incorrect
**Symptoms:** P&L calculation shows wrong values.

**Checks:**
1. `entry_price` correct in holdings table?
2. Current price from WebSocket accurate?
3. Quantity correct?

**Formula:**
```javascript
const pnl = (currentPrice - entryPrice) * quantity;
const pnlPercent = ((currentPrice - entryPrice) / entryPrice) * 100;
```

---

#### Balance Not Updating
**Symptoms:** Balance doesn't decrease after buy or increase after sell.

**Checks:**
1. `updateBalanceAndHoldings()` called?
2. Database transaction succeeded?
3. Race conditions?

**Fix:**
```javascript
// Wrap in transaction
const { data, error } = await supabase.rpc('execute_trade_transaction', {
  user_id: userId,
  amount: cost,
  // ... params
});
```

---

#### Infinite Re-renders
**Symptoms:** Component re-renders continuously, blank page.

**Cause:** useAuth or useEffect dependencies causing loops.

**Fix:**
```javascript
// ❌ BAD: Object in dependency array
useEffect(() => {
  loadData(user);
}, [user]); // user is object, changes every render

// ✅ GOOD: Primitive value
useEffect(() => {
  if (!user?.id) return;
  loadData(user.id);
}, [user?.id]); // Only re-run when ID changes
```

---

## Performance Tips

### 1. Debounce Price Updates
```javascript
import { debounce } from 'lodash';

const debouncedPriceUpdate = useCallback(
  debounce((price) => {
    setCurrentPrice(price);
  }, 100),
  []
);
```

### 2. Memoize Calculations
```javascript
const { cost, fee, total } = useMemo(() => {
  if (!quantity || !price) return { cost: 0, fee: 0, total: 0 };

  const cost = quantity * price;
  const fee = cost * 0.001;
  const total = cost + fee;

  return { cost, fee, total };
}, [quantity, price]);
```

### 3. Lazy Load Components
```javascript
const PaperTradingPanel = lazy(() => import('./PaperTradingPanel'));

<Suspense fallback={<LoadingSpinner />}>
  {isOpen && <PaperTradingPanel />}
</Suspense>
```

---

## API Reference

### `executeBuy(tradeData)` → `{success, order, error}`
### `executeSell(tradeData)` → `{success, order, error}`
### `closePosition(holdingId, userId)` → `{success, message}`
### `getHoldings(userId)` → `Array<Holding>`
### `getOrders(userId, limit)` → `Array<Order>`
### `createTPOrder(params)` → `{success, order}`
### `createSLOrder(params)` → `{success, order}`
### `cancelOrder(orderId)` → `{success, message}`
### `updateBalance(userId, amount)` → `{success, newBalance}`

---

## Contributing

1. Fork repo
2. Create feature branch: `git checkout -b feature/my-feature`
3. Commit changes: `git commit -m "Add my feature"`
4. Push: `git push origin feature/my-feature`
5. Open Pull Request

---

## Resources

- [User Guide](./USER_GUIDE_PAPER_TRADING.md)
- [Testing Checklist](./TESTING_CHECKLIST.md)
- [Deployment Guide](./DEPLOYMENT_CHECKLIST.md)
- [Supabase Docs](https://supabase.com/docs)
- [React Docs](https://react.dev)

---

*Last updated: 2025-01-20*
*Version: 1.0*
