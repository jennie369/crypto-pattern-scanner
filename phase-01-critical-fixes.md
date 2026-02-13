# Phase 01: Critical Fixes & Foundation

## Thông Tin Phase
- **Thời lượng ước tính**: 2-3 giờ
- **Trạng thái**: ⏳ Pending
- **Tiến độ**: 0%
- **Phụ thuộc**: Không có (Phase đầu tiên)

## Mục Tiêu

Sửa các lỗi nghiêm trọng đang chặn người dùng sử dụng Paper Trading Panel:
1. Input fields bị disabled/readonly → không thể nhập liệu
2. Không có feedback sau khi execute trade → người dùng không biết trade có thành công không
3. Entry price không được lưu vào database → không tính P&L được
4. Thiếu validation cơ bản → có thể tạo trade invalid

## Deliverables
- [x] Quantity input editable
- [x] Stop Loss price input editable
- [x] Take Profit price input editable
- [x] Toast notifications cho mọi trade actions
- [x] Entry price lưu chính xác vào `paper_trading_orders.price`
- [x] Entry price lưu vào `paper_trading_holdings.average_price`
- [x] Basic validation (quantity > 0, price > 0, balance đủ)

---

## Bước 1: Fix Input Fields - Remove Disabled Attributes

### Mục đích
Cho phép người dùng nhập liệu vào các fields: Quantity, Stop Loss Price, Take Profit Price

### Công việc cần làm

1. **Locate PaperTradingPanel.jsx**
   - File: `src/components/PaperTradingPanel/PaperTradingPanel.jsx`
   - Tìm tất cả `<input>` tags có `disabled` hoặc `readOnly`

2. **Remove disabled/readOnly attributes**
   ```jsx
   // ❌ TÌM VÀ XÓA:
   <input
     type="number"
     value={quantity}
     disabled={true}  // ← XÓA DÒNG NÀY
     readOnly         // ← XÓA DÒNG NÀY
   />

   // ✅ THAY BẰNG:
   <input
     type="number"
     value={quantity}
     onChange={(e) => setQuantity(e.target.value)}
     placeholder="0.00"
     step="0.001"
     min="0"
   />
   ```

3. **Add onChange handlers cho tất cả inputs**
   - Quantity input: `onChange={(e) => setQuantity(e.target.value)}`
   - Stop Loss Price: `onChange={(e) => setStopLossPrice(e.target.value)}`
   - Take Profit Price: `onChange={(e) => setTakeProfitPrice(e.target.value)}`

### Files cần sửa
- `src/components/PaperTradingPanel/PaperTradingPanel.jsx` - Remove disabled attributes

### Verification Checklist
- [ ] Có thể type vào Quantity input
- [ ] Có thể type vào Stop Loss Price input (khi checkbox checked)
- [ ] Có thể type vào Take Profit Price input (khi checkbox checked)
- [ ] Value hiển thị chính xác khi nhập
- [ ] Không có console errors

---

## Bước 2: Add Toast Notifications

### Mục đích
Cung cấp feedback ngay lập tức cho người dùng sau mỗi trade action

### Công việc cần làm

1. **Install react-hot-toast (nếu chưa có)**
   ```bash
   npm install react-hot-toast
   ```

2. **Import toast vào PaperTradingPanel.jsx**
   ```jsx
   import toast from 'react-hot-toast';
   ```

3. **Add Toaster component vào App.jsx hoặc layout**
   ```jsx
   import { Toaster } from 'react-hot-toast';

   function App() {
     return (
       <>
         <Toaster
           position="top-right"
           toastOptions={{
             success: {
               duration: 3000,
               style: {
                 background: '#10b981',
                 color: '#fff',
               },
               iconTheme: {
                 primary: '#fff',
                 secondary: '#10b981',
               },
             },
             error: {
               duration: 4000,
               style: {
                 background: '#ef4444',
                 color: '#fff',
               },
             },
           }}
         />
         {/* Rest of app */}
       </>
     );
   }
   ```

4. **Add toast.success() sau successful trade**
   ```jsx
   const handleBuyClick = async () => {
     setLoading(true);

     try {
       const result = await executeBuy({
         symbol: normalizedSymbol,
         price: currentPrice,
         quantity: parseFloat(quantity),
         // ... other params
       });

       if (result.success) {
         toast.success(`✅ BUY ${quantity} ${symbol.replace('USDT', '')} @ $${currentPrice}`, {
           duration: 3000,
         });

         // Reset form hoặc close panel
         onClose();
       }
     } catch (error) {
       toast.error(`❌ Trade failed: ${error.message}`, {
         duration: 4000,
       });
     } finally {
       setLoading(false);
     }
   };
   ```

5. **Add toast.error() cho validation failures**
   ```jsx
   if (!quantity || parseFloat(quantity) <= 0) {
     toast.error('Quantity must be greater than 0');
     return;
   }

   if (!currentPrice || currentPrice <= 0) {
     toast.error('Invalid price');
     return;
   }
   ```

### Files cần tạo/sửa
- `package.json` - Add react-hot-toast dependency
- `src/App.jsx` - Add Toaster component
- `src/components/PaperTradingPanel/PaperTradingPanel.jsx` - Add toast calls

### Verification Checklist
- [ ] Toast appears sau khi click BUY
- [ ] Toast appears sau khi click SELL
- [ ] Toast shows error khi validation fails
- [ ] Toast auto-dismiss sau duration
- [ ] Toast styling đúng (green for success, red for error)

---

## Bước 3: Fix Entry Price Saving

### Mục đích
Đảm bảo entry price được lưu chính xác vào database để tính P&L

### Công việc cần làm

1. **Verify executeBuy function lưu price**
   - File: `src/services/paperTrading.js`
   - Tìm function `executeBuy()`

   ```javascript
   export const executeBuy = async (tradeData) => {
     const { symbol, price, quantity, userId, accountId } = tradeData;

     // ✅ CRITICAL: Ensure price is saved
     const { data: order, error } = await supabase
       .from('paper_trading_orders')
       .insert({
         user_id: userId,
         account_id: accountId,
         symbol,
         side: 'buy',
         quantity,
         price: price,  // ← MUST SAVE ENTRY PRICE
         total_value: quantity * price,
         fee: (quantity * price) * 0.001,
         status: 'filled',
       })
       .select()
       .single();

     if (error) throw error;

     // Update holdings with average_price
     // ... (logic cập nhật holdings)

     return { success: true, order };
   };
   ```

2. **Verify holdings update includes average_price**
   ```javascript
   // Check if holding exists
   const { data: existingHolding } = await supabase
     .from('paper_trading_holdings')
     .select('*')
     .eq('user_id', userId)
     .eq('account_id', accountId)
     .eq('symbol', symbol)
     .single();

   if (existingHolding) {
     // Update existing holding - recalculate average price
     const newQuantity = existingHolding.quantity + quantity;
     const newAveragePrice = (
       (existingHolding.average_price * existingHolding.quantity) +
       (price * quantity)
     ) / newQuantity;

     await supabase
       .from('paper_trading_holdings')
       .update({
         quantity: newQuantity,
         average_price: newAveragePrice,  // ← CRITICAL
       })
       .eq('id', existingHolding.id);
   } else {
     // Create new holding
     await supabase
       .from('paper_trading_holdings')
       .insert({
         user_id: userId,
         account_id: accountId,
         symbol,
         quantity,
         average_price: price,  // ← CRITICAL
       });
   }
   ```

3. **Add debug logging để verify**
   ```javascript
   console.log('💰 [executeBuy] Entry price:', price);
   console.log('💰 [executeBuy] Order created:', order);
   console.log('💰 [executeBuy] Holdings updated with avg price:', newAveragePrice);
   ```

### Files cần sửa
- `src/services/paperTrading.js` - executeBuy, executeSell functions

### Verification Checklist
- [ ] Execute BUY order
- [ ] Check database: `paper_trading_orders.price` có giá trị
- [ ] Check database: `paper_trading_holdings.average_price` có giá trị
- [ ] Execute SELL order
- [ ] Check P&L calculation sử dụng average_price
- [ ] Console logs hiển thị đúng giá

---

## Bước 4: Add Basic Validation

### Mục đích
Ngăn chặn các trade invalid trước khi gửi đến database

### Công việc cần làm

1. **Validate Quantity**
   ```jsx
   const validateQuantity = (qty) => {
     const parsedQty = parseFloat(qty);

     if (isNaN(parsedQty)) {
       return { valid: false, error: 'Quantity must be a number' };
     }

     if (parsedQty <= 0) {
       return { valid: false, error: 'Quantity must be greater than 0' };
     }

     if (parsedQty > 1000000) {
       return { valid: false, error: 'Quantity too large' };
     }

     return { valid: true };
   };
   ```

2. **Validate Price**
   ```jsx
   const validatePrice = (price) => {
     if (!price || price <= 0) {
       return { valid: false, error: 'Invalid price' };
     }

     return { valid: true };
   };
   ```

3. **Validate Balance (for BUY orders)**
   ```jsx
   const validateBalance = (quantity, price, balance) => {
     const totalCost = quantity * price;
     const fee = totalCost * 0.001;
     const totalRequired = totalCost + fee;

     if (balance < totalRequired) {
       return {
         valid: false,
         error: `Insufficient balance. Required: $${totalRequired.toFixed(2)}, Available: $${balance.toFixed(2)}`
       };
     }

     return { valid: true };
   };
   ```

4. **Validate Holdings (for SELL orders)**
   ```jsx
   const validateHoldings = (symbol, quantity, holdings) => {
     const holding = holdings.find(h => h.symbol === symbol);

     if (!holding) {
       return { valid: false, error: `No ${symbol} position found` };
     }

     if (holding.quantity < quantity) {
       return {
         valid: false,
         error: `Insufficient ${symbol}. Available: ${holding.quantity}, Requested: ${quantity}`
       };
     }

     return { valid: true };
   };
   ```

5. **Run validations before execute**
   ```jsx
   const handleBuyClick = async () => {
     // Validate quantity
     const qtyCheck = validateQuantity(quantity);
     if (!qtyCheck.valid) {
       toast.error(qtyCheck.error);
       return;
     }

     // Validate price
     const priceCheck = validatePrice(currentPrice);
     if (!priceCheck.valid) {
       toast.error(priceCheck.error);
       return;
     }

     // Validate balance
     const balanceCheck = validateBalance(parseFloat(quantity), currentPrice, balance);
     if (!balanceCheck.valid) {
       toast.error(balanceCheck.error);
       return;
     }

     // All valid → proceed with trade
     setLoading(true);
     // ... execute trade
   };
   ```

### Files cần sửa
- `src/components/PaperTradingPanel/PaperTradingPanel.jsx` - Add validation logic

### Verification Checklist
- [ ] Nhập quantity = 0 → toast error hiển thị
- [ ] Nhập quantity = -5 → toast error hiển thị
- [ ] Nhập quantity = "abc" → toast error hiển thị
- [ ] BUY với balance không đủ → toast error hiển thị
- [ ] SELL khi không có holdings → toast error hiển thị
- [ ] SELL quantity > holdings → toast error hiển thị
- [ ] Valid inputs → trade executes successfully

---

## Bước 5: Testing & Verification

### Manual Testing Checklist

**Test 1: Input Fields Editable**
- [ ] Open Paper Trading Panel
- [ ] Click vào Quantity input → có thể type
- [ ] Type "0.5" → value updates
- [ ] Enable Stop Loss checkbox → price input editable
- [ ] Enable Take Profit checkbox → price input editable

**Test 2: Toast Notifications**
- [ ] Execute BUY order → toast success appears
- [ ] Execute SELL order → toast success appears
- [ ] Try BUY with quantity = 0 → toast error appears
- [ ] Try BUY with insufficient balance → toast error appears
- [ ] Try SELL without holdings → toast error appears

**Test 3: Entry Price Saving**
- [ ] Execute BUY BTCUSDT @ $50,000
- [ ] Check database `paper_trading_orders` → price = 50000
- [ ] Check database `paper_trading_holdings` → average_price = 50000
- [ ] Execute another BUY @ $51,000
- [ ] Check holdings → average_price recalculated correctly
- [ ] Execute SELL order
- [ ] Check P&L calculation uses correct entry price

**Test 4: Validation**
- [ ] Quantity = 0 → blocked
- [ ] Quantity = -1 → blocked
- [ ] Quantity = "text" → blocked
- [ ] BUY without enough balance → blocked
- [ ] SELL without holdings → blocked
- [ ] SELL more than holdings → blocked
- [ ] Valid inputs → trade succeeds

---

## Edge Cases & Error Handling

### Edge Cases cần xử lý

1. **Price Loading Delay**
   - Hiện tượng: User click BUY trước khi price loads
   - Giải pháp: Disable buttons until `currentPrice > 0`
   ```jsx
   <button
     disabled={loading || !currentPrice || currentPrice <= 0}
     onClick={handleBuyClick}
   >
     {loading ? 'Executing...' : 'BUY'}
   </button>
   ```

2. **WebSocket Disconnected**
   - Hiện tượng: Price không update
   - Giải pháp: Show warning banner
   ```jsx
   {!currentPrice && (
     <div className="warning-banner">
       ⚠️ Price not available. Reconnecting...
     </div>
   )}
   ```

3. **Concurrent Trades**
   - Hiện tượng: User click BUY nhiều lần nhanh
   - Giải pháp: Disable button while loading
   ```jsx
   const [loading, setLoading] = useState(false);

   <button disabled={loading}>
     {loading ? 'Executing...' : 'BUY'}
   </button>
   ```

4. **Database Save Failed**
   - Hiện tượng: Order created nhưng không lưu được
   - Giải pháp: Rollback và show error
   ```jsx
   try {
     const result = await executeBuy(tradeData);
     if (!result.success) {
       throw new Error(result.error);
     }
     toast.success('Trade successful');
   } catch (error) {
     console.error('Trade failed:', error);
     toast.error(`Trade failed: ${error.message}`);
     // Rollback nếu cần
   }
   ```

### Error Handling

```jsx
const handleBuyClick = async () => {
  try {
    // Validations
    if (!validateInputs()) return;

    setLoading(true);

    const result = await executeBuy(tradeData);

    if (!result.success) {
      throw new Error(result.error || 'Trade failed');
    }

    toast.success(`✅ BUY order executed`);
    onClose();

  } catch (error) {
    console.error('[PaperTradingPanel] Execute BUY failed:', error);

    // User-friendly error messages
    let errorMessage = 'Trade failed. Please try again.';

    if (error.message.includes('Insufficient')) {
      errorMessage = 'Insufficient balance';
    } else if (error.message.includes('Invalid')) {
      errorMessage = 'Invalid input values';
    } else if (error.message.includes('Network')) {
      errorMessage = 'Network error. Please check connection.';
    }

    toast.error(errorMessage);

  } finally {
    setLoading(false);
  }
};
```

---

## Dependencies & Prerequisites

### Packages cần cài
```bash
npm install react-hot-toast
```

### Environment Variables
Không cần thêm env variables cho phase này

### Database Schema
Verify các columns tồn tại:
```sql
-- paper_trading_orders
SELECT column_name FROM information_schema.columns
WHERE table_name = 'paper_trading_orders'
AND column_name IN ('price', 'quantity', 'total_value', 'fee');

-- paper_trading_holdings
SELECT column_name FROM information_schema.columns
WHERE table_name = 'paper_trading_holdings'
AND column_name IN ('average_price', 'quantity');
```

---

## Completion Criteria

Phase này được coi là hoàn thành khi:
- [x] Tất cả input fields có thể type được
- [x] Toast notifications hiển thị sau mọi trade actions
- [x] Entry price lưu chính xác vào database
- [x] Average price trong holdings tính đúng
- [x] Validations ngăn chặn invalid trades
- [x] Tất cả manual tests đều pass
- [x] Không có console errors
- [x] Code đã được format và review

---

## Notes & Best Practices

### Lưu ý khi thực hiện
- ⚠️ **Không remove admin bypass logic** đã được thêm ở sessions trước
- ⚠️ **Verify HMR hoạt động** - changes nên reflect ngay lập tức
- ⚠️ **Test với nhiều symbols** - BTCUSDT, ETHUSDT, etc.
- ⚠️ **Check console logs** - phải có logs từ debug statements

### Best Practices
- ✅ Always validate inputs before database operations
- ✅ Show loading states during async operations
- ✅ Provide clear error messages to users
- ✅ Log errors to console for debugging
- ✅ Disable buttons during loading to prevent double-clicks

### Common Pitfalls
- ❌ Quên remove `disabled` attribute → Fix: Search toàn bộ file cho `disabled`
- ❌ Quên add Toaster component → Fix: Thêm vào App.jsx hoặc layout
- ❌ Average price không tính đúng → Fix: Verify công thức tính weighted average
- ❌ Validation quá strict → Fix: Allow reasonable ranges

---

## Next Steps

Sau khi hoàn thành phase này:
1. Cập nhật trạng thái trong `plan.md`:
   ```markdown
   ### Phase 01: Critical Fixes & Foundation
   - **Trạng thái**: ✅ Completed
   - **Tiến độ**: 100%
   ```

2. Commit code với message:
   ```bash
   git add .
   git commit -m "feat: complete phase-01 - critical fixes and foundation

   - Fix input fields (remove disabled attributes)
   - Add toast notifications for all trade actions
   - Fix entry price saving to database
   - Add basic validation (quantity, price, balance, holdings)
   - Comprehensive testing completed"
   ```

3. Chuyển sang `phase-02-database-backend.md`
