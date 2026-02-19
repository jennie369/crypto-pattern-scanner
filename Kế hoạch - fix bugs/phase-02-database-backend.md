# Phase 02: Database Schema & Backend Updates

## Thông Tin Phase
- **Thời lượng ước tính**: 3-4 giờ
- **Trạng thái**: ⏳ Pending
- **Tiến độ**: 0%
- **Phụ thuộc**: Phase 01 (Critical Fixes & Foundation)

## Mục Tiêu

Cập nhật database schema và backend logic để hỗ trợ các tính năng nâng cao:
1. Thêm các columns mới cho order types (Limit, Stop Limit)
2. Thêm columns cho TP/SL prices
3. Thêm columns cho TIF (Time in Force) và Reduce-Only
4. Cập nhật executeBuy/executeSell để xử lý các order types mới
5. Implement logic tự động execute TP/SL orders

## Deliverables
- [ ] Database migration script created và executed
- [ ] `paper_trading_orders` table có đủ columns mới
- [ ] executeBuy/executeSell updated để handle order types
- [ ] TP/SL order creation logic implemented
- [ ] Order execution engine updated
- [ ] Comprehensive error handling

---

## Bước 1: Database Schema Migration

### Mục đích
Thêm các columns cần thiết vào `paper_trading_orders` table để support Limit orders, Stop Limit, TP/SL

### Công việc cần làm

1. **Tạo migration file mới**
   - File: `supabase/migrations/YYYYMMDD_add_advanced_order_fields.sql`
   - Hoặc execute trực tiếp qua Supabase Dashboard

2. **Migration SQL**
   ```sql
   -- ========================================
   -- Migration: Add Advanced Order Fields
   -- ========================================

   -- Add new columns to paper_trading_orders
   ALTER TABLE paper_trading_orders
   ADD COLUMN IF NOT EXISTS order_type VARCHAR(20) DEFAULT 'market',
   ADD COLUMN IF NOT EXISTS limit_price DECIMAL(20,8),
   ADD COLUMN IF NOT EXISTS stop_price DECIMAL(20,8),
   ADD COLUMN IF NOT EXISTS time_in_force VARCHAR(10) DEFAULT 'GTC',
   ADD COLUMN IF NOT EXISTS reduce_only BOOLEAN DEFAULT false,
   ADD COLUMN IF NOT EXISTS take_profit_price DECIMAL(20,8),
   ADD COLUMN IF NOT EXISTS stop_loss_price DECIMAL(20,8),
   ADD COLUMN IF NOT EXISTS parent_order_id UUID REFERENCES paper_trading_orders(id),
   ADD COLUMN IF NOT EXISTS linked_order_type VARCHAR(10);

   -- Add index for parent_order_id (for TP/SL lookups)
   CREATE INDEX IF NOT EXISTS idx_paper_orders_parent
   ON paper_trading_orders(parent_order_id);

   -- Add index for order_type
   CREATE INDEX IF NOT EXISTS idx_paper_orders_type
   ON paper_trading_orders(order_type);

   -- Add index for status + order_type (for pending orders)
   CREATE INDEX IF NOT EXISTS idx_paper_orders_status_type
   ON paper_trading_orders(status, order_type);

   -- Create enum type for order_type (optional, for type safety)
   DO $$ BEGIN
     CREATE TYPE order_type_enum AS ENUM ('market', 'limit', 'stop-limit');
   EXCEPTION
     WHEN duplicate_object THEN null;
   END $$;

   -- Create enum type for time_in_force
   DO $$ BEGIN
     CREATE TYPE tif_enum AS ENUM ('GTC', 'IOC', 'FOK');
   EXCEPTION
     WHEN duplicate_object THEN null;
   END $$;

   -- Create enum type for linked_order_type
   DO $$ BEGIN
     CREATE TYPE linked_order_enum AS ENUM ('TP', 'SL');
   EXCEPTION
     WHEN duplicate_object THEN null;
   END $$;

   -- Add comment for documentation
   COMMENT ON COLUMN paper_trading_orders.order_type IS 'Order type: market, limit, stop-limit';
   COMMENT ON COLUMN paper_trading_orders.limit_price IS 'Target price for limit orders';
   COMMENT ON COLUMN paper_trading_orders.stop_price IS 'Trigger price for stop-limit orders';
   COMMENT ON COLUMN paper_trading_orders.time_in_force IS 'Time in force: GTC, IOC, FOK';
   COMMENT ON COLUMN paper_trading_orders.reduce_only IS 'Order will only reduce position';
   COMMENT ON COLUMN paper_trading_orders.take_profit_price IS 'Take profit target price';
   COMMENT ON COLUMN paper_trading_orders.stop_loss_price IS 'Stop loss trigger price';
   COMMENT ON COLUMN paper_trading_orders.parent_order_id IS 'Parent order ID for TP/SL orders';
   COMMENT ON COLUMN paper_trading_orders.linked_order_type IS 'TP or SL';
   ```

3. **Verify migration**
   ```sql
   -- Check new columns exist
   SELECT column_name, data_type, column_default
   FROM information_schema.columns
   WHERE table_name = 'paper_trading_orders'
   AND column_name IN (
     'order_type', 'limit_price', 'stop_price',
     'time_in_force', 'reduce_only',
     'take_profit_price', 'stop_loss_price',
     'parent_order_id', 'linked_order_type'
   );

   -- Check indexes
   SELECT indexname FROM pg_indexes
   WHERE tablename = 'paper_trading_orders';
   ```

### Files cần tạo
- `supabase/migrations/YYYYMMDD_add_advanced_order_fields.sql` - Migration script

### Verification Checklist
- [ ] Migration script chạy thành công không có errors
- [ ] Tất cả 9 columns mới đã được thêm vào table
- [ ] Indexes được tạo cho parent_order_id, order_type, status+order_type
- [ ] Default values đúng (order_type='market', time_in_force='GTC', reduce_only=false)
- [ ] Có thể insert test record với đầy đủ fields mới

---

## Bước 2: Update executeBuy Function

### Mục đích
Cập nhật hàm executeBuy để xử lý Market, Limit, và Stop Limit orders

### Công việc cần làm

1. **Locate executeBuy function**
   - File: `src/services/paperTrading.js`

2. **Update function signature to accept new params**
   ```javascript
   export const executeBuy = async ({
     userId,
     accountId,
     symbol,
     price,           // Current market price
     quantity,
     orderType = 'market',      // NEW
     limitPrice = null,         // NEW
     stopPrice = null,          // NEW
     timeInForce = 'GTC',       // NEW
     reduceOnly = false,        // NEW
     takeProfitPrice = null,    // NEW
     stopLossPrice = null,      // NEW
   }) => {
     console.log('📝 [executeBuy] Order params:', {
       symbol,
       orderType,
       quantity,
       price,
       limitPrice,
       stopPrice,
       timeInForce,
       reduceOnly,
       takeProfitPrice,
       stopLossPrice,
     });

     // Validation
     if (orderType === 'limit' && !limitPrice) {
       throw new Error('Limit price required for limit orders');
     }

     if (orderType === 'stop-limit' && (!stopPrice || !limitPrice)) {
       throw new Error('Stop price and limit price required for stop-limit orders');
     }

     // Determine execution price
     let executionPrice;
     let status;

     if (orderType === 'market') {
       executionPrice = price;  // Execute immediately at market price
       status = 'filled';
     } else if (orderType === 'limit') {
       executionPrice = limitPrice;  // Will execute at limit price or better
       status = 'pending';           // Wait for price to reach limit
     } else if (orderType === 'stop-limit') {
       executionPrice = limitPrice;  // Will execute at limit after stop triggered
       status = 'pending';           // Wait for price to hit stop price
     }

     // Create order
     const { data: order, error: orderError } = await supabase
       .from('paper_trading_orders')
       .insert({
         user_id: userId,
         account_id: accountId,
         symbol,
         side: 'buy',
         order_type: orderType,
         quantity: parseFloat(quantity),
         price: executionPrice,
         limit_price: limitPrice,
         stop_price: stopPrice,
         time_in_force: timeInForce,
         reduce_only: reduceOnly,
         total_value: parseFloat(quantity) * executionPrice,
         fee: (parseFloat(quantity) * executionPrice) * 0.001,
         status: status,
         created_at: new Date().toISOString(),
       })
       .select()
       .single();

     if (orderError) {
       console.error('❌ [executeBuy] Order creation failed:', orderError);
       throw orderError;
     }

     console.log('✅ [executeBuy] Order created:', order);

     // If market order, execute immediately
     if (orderType === 'market') {
       await updateBalanceAndHoldings({
         userId,
         accountId,
         symbol,
         side: 'buy',
         quantity: parseFloat(quantity),
         price: executionPrice,
         fee: order.fee,
       });
     }

     // Create TP order if specified
     if (takeProfitPrice && takeProfitPrice > executionPrice) {
       await createTPOrder({
         userId,
         accountId,
         symbol,
         quantity: parseFloat(quantity),
         takeProfitPrice,
         parentOrderId: order.id,
       });
     }

     // Create SL order if specified
     if (stopLossPrice && stopLossPrice < executionPrice) {
       await createSLOrder({
         userId,
         accountId,
         symbol,
         quantity: parseFloat(quantity),
         stopLossPrice,
         parentOrderId: order.id,
       });
     }

     return { success: true, order };
   };
   ```

3. **Update executeSell similarly**
   ```javascript
   export const executeSell = async ({
     userId,
     accountId,
     symbol,
     price,
     quantity,
     orderType = 'market',
     limitPrice = null,
     stopPrice = null,
     timeInForce = 'GTC',
     reduceOnly = false,
     takeProfitPrice = null,
     stopLossPrice = null,
   }) => {
     // Similar logic to executeBuy but for SELL side
     // TP should be < execution price
     // SL should be > execution price
     // ...
   };
   ```

### Files cần sửa
- `src/services/paperTrading.js` - executeBuy, executeSell functions

### Verification Checklist
- [ ] Market order creates với status='filled'
- [ ] Limit order creates với status='pending'
- [ ] Stop-limit order creates với status='pending'
- [ ] All new fields lưu chính xác vào database
- [ ] Console logs hiển thị đầy đủ params

---

## Bước 3: Implement TP/SL Order Creation

### Mục đích
Tạo TP và SL orders tự động khi user enable TP/SL

### Công việc cần làm

1. **Create createTPOrder function**
   ```javascript
   /**
    * Create a Take Profit order linked to parent order
    */
   export const createTPOrder = async ({
     userId,
     accountId,
     symbol,
     quantity,
     takeProfitPrice,
     parentOrderId,
   }) => {
     console.log('📈 [createTPOrder] Creating TP order:', {
       symbol,
       quantity,
       takeProfitPrice,
       parentOrderId,
     });

     // For BUY parent: TP is a SELL limit order at higher price
     // For SELL parent: TP is a BUY limit order at lower price
     const parentOrder = await supabase
       .from('paper_trading_orders')
       .select('side')
       .eq('id', parentOrderId)
       .single();

     const tpSide = parentOrder.data.side === 'buy' ? 'sell' : 'buy';

     const { data: tpOrder, error } = await supabase
       .from('paper_trading_orders')
       .insert({
         user_id: userId,
         account_id: accountId,
         symbol,
         side: tpSide,
         order_type: 'limit',
         quantity: parseFloat(quantity),
         price: takeProfitPrice,
         limit_price: takeProfitPrice,
         status: 'pending',
         parent_order_id: parentOrderId,
         linked_order_type: 'TP',
         total_value: parseFloat(quantity) * takeProfitPrice,
         fee: (parseFloat(quantity) * takeProfitPrice) * 0.001,
       })
       .select()
       .single();

     if (error) {
       console.error('❌ [createTPOrder] Failed:', error);
       throw error;
     }

     console.log('✅ [createTPOrder] TP order created:', tpOrder);
     return { success: true, tpOrder };
   };
   ```

2. **Create createSLOrder function**
   ```javascript
   /**
    * Create a Stop Loss order linked to parent order
    */
   export const createSLOrder = async ({
     userId,
     accountId,
     symbol,
     quantity,
     stopLossPrice,
     parentOrderId,
   }) => {
     console.log('📉 [createSLOrder] Creating SL order:', {
       symbol,
       quantity,
       stopLossPrice,
       parentOrderId,
     });

     // For BUY parent: SL is a SELL stop-limit order at lower price
     // For SELL parent: SL is a BUY stop-limit order at higher price
     const parentOrder = await supabase
       .from('paper_trading_orders')
       .select('side')
       .eq('id', parentOrderId)
       .single();

     const slSide = parentOrder.data.side === 'buy' ? 'sell' : 'buy';

     const { data: slOrder, error } = await supabase
       .from('paper_trading_orders')
       .insert({
         user_id: userId,
         account_id: accountId,
         symbol,
         side: slSide,
         order_type: 'stop-limit',
         quantity: parseFloat(quantity),
         price: stopLossPrice,
         stop_price: stopLossPrice,
         limit_price: stopLossPrice * 0.99, // Slight buffer
         status: 'pending',
         parent_order_id: parentOrderId,
         linked_order_type: 'SL',
         total_value: parseFloat(quantity) * stopLossPrice,
         fee: (parseFloat(quantity) * stopLossPrice) * 0.001,
       })
       .select()
       .single();

     if (error) {
       console.error('❌ [createSLOrder] Failed:', error);
       throw error;
     }

     console.log('✅ [createSLOrder] SL order created:', slOrder);
     return { success: true, slOrder };
   };
   ```

### Files cần tạo/sửa
- `src/services/paperTrading.js` - Add createTPOrder, createSLOrder functions

### Verification Checklist
- [ ] BUY order với TP → tạo SELL limit order
- [ ] BUY order với SL → tạo SELL stop-limit order
- [ ] Database có 3 orders: 1 parent + 1 TP + 1 SL
- [ ] parent_order_id link đúng
- [ ] linked_order_type = 'TP' hoặc 'SL'

---

## Bước 4: Implement Order Execution Engine

### Mục đích
Tự động execute pending orders khi price điều kiện được thỏa mãn

### Công việc cần làm

1. **Create order monitor service**
   - File: `src/services/orderMonitor.js`

   ```javascript
   import { supabase } from './supabase';
   import { binanceWS } from './binanceWebSocket';

   /**
    * Monitor pending orders and execute when conditions met
    */
   class OrderMonitor {
     constructor() {
       this.activeSubscriptions = new Map();
       this.pendingOrders = [];
     }

     /**
      * Start monitoring orders for a user
      */
     async startMonitoring(userId, accountId) {
       console.log('🔍 [OrderMonitor] Starting monitoring for user:', userId);

       // Fetch all pending orders
       const { data: orders, error } = await supabase
         .from('paper_trading_orders')
         .select('*')
         .eq('user_id', userId)
         .eq('account_id', accountId)
         .eq('status', 'pending');

       if (error) {
         console.error('❌ [OrderMonitor] Failed to fetch orders:', error);
         return;
       }

       this.pendingOrders = orders;
       console.log(`📋 [OrderMonitor] Found ${orders.length} pending orders`);

       // Subscribe to price updates for each unique symbol
       const symbols = [...new Set(orders.map(o => o.symbol))];

       symbols.forEach(symbol => {
         this.subscribeToPriceUpdates(symbol);
       });
     }

     /**
      * Subscribe to price updates for a symbol
      */
     subscribeToPriceUpdates(symbol) {
       if (this.activeSubscriptions.has(symbol)) {
         return; // Already subscribed
       }

       const unsubscribe = binanceWS.subscribe(symbol, (update) => {
         if (update.price) {
           this.checkOrders(symbol, update.price);
         }
       });

       this.activeSubscriptions.set(symbol, unsubscribe);
       console.log(`📡 [OrderMonitor] Subscribed to ${symbol}`);
     }

     /**
      * Check if any orders should be executed at current price
      */
     async checkOrders(symbol, currentPrice) {
       const ordersToCheck = this.pendingOrders.filter(o => o.symbol === symbol);

       for (const order of ordersToCheck) {
         let shouldExecute = false;

         if (order.order_type === 'limit') {
           // Limit BUY: Execute when price <= limit_price
           // Limit SELL: Execute when price >= limit_price
           if (order.side === 'buy' && currentPrice <= order.limit_price) {
             shouldExecute = true;
           } else if (order.side === 'sell' && currentPrice >= order.limit_price) {
             shouldExecute = true;
           }
         } else if (order.order_type === 'stop-limit') {
           // Stop-limit: Execute when price hits stop_price
           if (order.side === 'buy' && currentPrice >= order.stop_price) {
             shouldExecute = true;
           } else if (order.side === 'sell' && currentPrice <= order.stop_price) {
             shouldExecute = true;
           }
         }

         if (shouldExecute) {
           console.log(`🎯 [OrderMonitor] Executing order ${order.id} at ${currentPrice}`);
           await this.executeOrder(order, currentPrice);
         }
       }
     }

     /**
      * Execute a pending order
      */
     async executeOrder(order, executionPrice) {
       try {
         // Update order status
         await supabase
           .from('paper_trading_orders')
           .update({
             status: 'filled',
             price: executionPrice,
             updated_at: new Date().toISOString(),
           })
           .eq('id', order.id);

         // Update balance and holdings
         await updateBalanceAndHoldings({
           userId: order.user_id,
           accountId: order.account_id,
           symbol: order.symbol,
           side: order.side,
           quantity: order.quantity,
           price: executionPrice,
           fee: order.fee,
         });

         // Remove from pending list
         this.pendingOrders = this.pendingOrders.filter(o => o.id !== order.id);

         // Cancel linked orders if this was a TP/SL execution
         if (order.linked_order_type) {
           await this.cancelLinkedOrders(order.parent_order_id, order.id);
         }

         console.log(`✅ [OrderMonitor] Order ${order.id} executed successfully`);
       } catch (error) {
         console.error(`❌ [OrderMonitor] Failed to execute order ${order.id}:`, error);
       }
     }

     /**
      * Cancel other TP/SL orders when one executes
      */
     async cancelLinkedOrders(parentOrderId, executedOrderId) {
       // When TP executes, cancel SL (and vice versa)
       await supabase
         .from('paper_trading_orders')
         .update({ status: 'cancelled' })
         .eq('parent_order_id', parentOrderId)
         .neq('id', executedOrderId)
         .eq('status', 'pending');
     }

     /**
      * Stop monitoring
      */
     stopMonitoring() {
       this.activeSubscriptions.forEach(unsubscribe => unsubscribe());
       this.activeSubscriptions.clear();
       this.pendingOrders = [];
       console.log('🛑 [OrderMonitor] Stopped monitoring');
     }
   }

   export const orderMonitor = new OrderMonitor();
   ```

2. **Start monitor when user logs in**
   - File: `src/contexts/AuthContext.jsx`

   ```javascript
   import { orderMonitor } from '../services/orderMonitor';

   useEffect(() => {
     if (user && profile?.paper_trading_account_id) {
       // Start monitoring pending orders
       orderMonitor.startMonitoring(user.id, profile.paper_trading_account_id);
     }

     return () => {
       orderMonitor.stopMonitoring();
     };
   }, [user, profile]);
   ```

### Files cần tạo
- `src/services/orderMonitor.js` - Order execution engine

### Files cần sửa
- `src/contexts/AuthContext.jsx` - Start monitoring on login

### Verification Checklist
- [ ] Create limit BUY order at $50,000
- [ ] Price drops to $50,000 → order auto-executes
- [ ] Order status changes to 'filled'
- [ ] Holdings updated correctly
- [ ] Create TP order → executes when price hits TP
- [ ] Create SL order → executes when price hits SL
- [ ] When TP executes, SL is cancelled (và ngược lại)

---

## Bước 5: Error Handling & Edge Cases

### Edge Cases cần xử lý

1. **Limit Order Never Fills**
   - Hiện tượng: Price không bao giờ chạm limit_price
   - Giải pháp: Allow user to cancel pending orders
   ```javascript
   export const cancelOrder = async (orderId, userId) => {
     const { data, error } = await supabase
       .from('paper_trading_orders')
       .update({
         status: 'cancelled',
         updated_at: new Date().toISOString(),
       })
       .eq('id', orderId)
       .eq('user_id', userId)
       .select()
       .single();

     if (error) throw error;
     return { success: true, data };
   };
   ```

2. **TP and SL Both Pending**
   - Hiện tượng: Price oscillates between TP and SL
   - Giải pháp: OCO (One-Cancels-Other) - when one executes, cancel the other
   - ✅ Already handled in `cancelLinkedOrders()`

3. **Insufficient Balance for Pending Order**
   - Hiện tượng: User spends balance elsewhere, pending order can't fill
   - Giải pháp: Reserve balance when creating pending order
   ```javascript
   // When creating limit/stop-limit order, reserve balance
   const totalRequired = quantity * limitPrice + fee;

   await supabase
     .from('paper_trading_accounts')
     .update({
       reserved_balance: reserved_balance + totalRequired,
     })
     .eq('id', accountId);

   // When order fills or cancelled, release reserved balance
   ```

4. **WebSocket Disconnected During Monitoring**
   - Hiện tượng: Orders không execute vì không nhận price updates
   - Giải pháp: Fallback to REST API polling
   ```javascript
   let wsDisconnected = false;

   binanceWS.on('disconnect', () => {
     wsDisconnected = true;
     startRESTPolling(); // Fallback
   });

   binanceWS.on('reconnect', () => {
     wsDisconnected = false;
     stopRESTPolling();
   });
   ```

### Error Handling

```javascript
try {
  const result = await executeBuy(tradeData);

  if (!result.success) {
    throw new Error(result.error);
  }

  toast.success('Order placed successfully');

} catch (error) {
  console.error('[PaperTrading] Order failed:', error);

  // Rollback database changes if needed
  if (error.message.includes('Insufficient balance')) {
    toast.error('Insufficient balance');
  } else if (error.message.includes('Invalid price')) {
    toast.error('Invalid price parameters');
  } else if (error.message.includes('Database')) {
    toast.error('Database error. Please try again.');
    // Log to error tracking service
  } else {
    toast.error(`Order failed: ${error.message}`);
  }
}
```

---

## Dependencies & Prerequisites

### Packages cần cài
Không cần thêm packages mới cho phase này

### Database Migrations
```bash
# Execute migration qua Supabase Dashboard hoặc CLI
supabase migration up
```

### Environment Variables
Không cần thêm env variables

---

## Completion Criteria

Phase này được coi là hoàn thành khi:
- [ ] Database migration chạy thành công
- [ ] executeBuy/executeSell handle được market, limit, stop-limit orders
- [ ] TP/SL orders được tạo tự động khi specified
- [ ] Order monitor service chạy background và execute pending orders
- [ ] OCO logic hoạt động (TP executes → SL cancelled)
- [ ] Error handling robust cho tất cả edge cases
- [ ] Comprehensive tests pass

---

## Notes & Best Practices

### Lưu ý khi thực hiện
- ⚠️ **Backup database** trước khi chạy migration
- ⚠️ **Test migration trên staging** trước khi chạy production
- ⚠️ **Monitor performance** - order monitor không được làm lag app
- ⚠️ **Verify WebSocket stability** - reconnect logic phải robust

### Best Practices
- ✅ Use database transactions cho order execution
- ✅ Add extensive logging cho debugging
- ✅ Implement retry logic cho failed executions
- ✅ Use database indexes cho query performance

### Common Pitfalls
- ❌ Quên add indexes → queries chậm
- ❌ Không handle WebSocket disconnect → orders không execute
- ❌ OCO logic sai → cả TP và SL đều execute
- ❌ Không reserve balance → pending orders fail

---

## Next Steps

Sau khi hoàn thành phase này:
1. Cập nhật `plan.md` status → Completed
2. Commit code: `feat: complete phase-02 - database and backend updates`
3. Chuyển sang `phase-03-order-types.md`
