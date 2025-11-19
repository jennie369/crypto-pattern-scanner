# Phase 03: Order Types & Price Configuration

## Thông Tin Phase
- **Thời lượng ước tính**: 4-5 giờ
- **Trạng thái**: ⏳ Pending
- **Tiến độ**: 0%
- **Phụ thuộc**: Phase 02 (Database Schema & Backend Updates)

## Mục Tiêu

Xây dựng UI hoàn chỉnh cho việc chọn order types và configuration:
1. Order Type Tabs (Market / Limit / Stop Limit)
2. Price Input cho Limit orders
3. Quantity slider + input với percentage buttons
4. Amount selector (USDT / % / Coin)
5. Cost calculation hiển thị real-time
6. Max quantity calculation dựa trên available balance

## Deliverables
- [ ] Order type tabs UI component
- [ ] Conditional price input cho Limit orders
- [ ] Quantity slider với percentage buttons (25%, 50%, 75%, 100%)
- [ ] Amount selector dropdown
- [ ] Real-time cost calculation
- [ ] Max quantity calculator
- [ ] Responsive UI cho mobile

---

## Bước 1: Order Type Tabs Component

### Mục đích
Cho phép user chọn order type: Market, Limit, hoặc Stop Limit

### Công việc cần làm

1. **Add orderType state**
   - File: `src/components/PaperTradingPanel/PaperTradingPanel.jsx`

   ```jsx
   const [orderType, setOrderType] = useState('market'); // 'market' | 'limit' | 'stop-limit'
   const [limitPrice, setLimitPrice] = useState('');
   const [stopPrice, setStopPrice] = useState('');
   ```

2. **Create Order Type Tabs UI**
   ```jsx
   {/* Order Type Selector */}
   <div className="order-type-section">
     <label className="section-label">Order Type</label>

     <div className="order-type-tabs">
       <button
         className={`order-type-tab ${orderType === 'market' ? 'active' : ''}`}
         onClick={() => setOrderType('market')}
       >
         <span className="tab-icon">⚡</span>
         <span className="tab-label">Market</span>
         <span className="tab-hint">Instant</span>
       </button>

       <button
         className={`order-type-tab ${orderType === 'limit' ? 'active' : ''}`}
         onClick={() => setOrderType('limit')}
       >
         <span className="tab-icon">🎯</span>
         <span className="tab-label">Limit</span>
         <span className="tab-hint">Set price</span>
       </button>

       <button
         className={`order-type-tab ${orderType === 'stop-limit' ? 'active' : ''}`}
         onClick={() => setOrderType('stop-limit')}
       >
         <span className="tab-icon">🛡️</span>
         <span className="tab-label">Stop Limit</span>
         <span className="tab-hint">Trigger</span>
       </button>
     </div>
   </div>
   ```

3. **Add CSS styling**
   - File: `src/components/PaperTradingPanel/PaperTradingPanel.css`

   ```css
   .order-type-section {
     margin-bottom: 20px;
   }

   .section-label {
     display: block;
     font-size: 13px;
     font-weight: 600;
     color: #8d8d8d;
     margin-bottom: 8px;
     text-transform: uppercase;
     letter-spacing: 0.5px;
   }

   .order-type-tabs {
     display: grid;
     grid-template-columns: repeat(3, 1fr);
     gap: 8px;
   }

   .order-type-tab {
     display: flex;
     flex-direction: column;
     align-items: center;
     justify-content: center;
     padding: 12px 8px;
     background: rgba(255, 255, 255, 0.05);
     border: 1px solid rgba(255, 255, 255, 0.1);
     border-radius: 8px;
     cursor: pointer;
     transition: all 0.2s ease;
   }

   .order-type-tab:hover {
     background: rgba(255, 255, 255, 0.08);
     border-color: rgba(255, 255, 255, 0.2);
   }

   .order-type-tab.active {
     background: rgba(14, 203, 129, 0.15);
     border-color: #0ECB81;
   }

   .tab-icon {
     font-size: 20px;
     margin-bottom: 4px;
   }

   .tab-label {
     font-size: 13px;
     font-weight: 600;
     color: #fff;
     margin-bottom: 2px;
   }

   .tab-hint {
     font-size: 10px;
     color: #8d8d8d;
   }

   .order-type-tab.active .tab-hint {
     color: #0ECB81;
   }
   ```

### Files cần sửa
- `src/components/PaperTradingPanel/PaperTradingPanel.jsx` - Add order type tabs
- `src/components/PaperTradingPanel/PaperTradingPanel.css` - Add styling

### Verification Checklist
- [ ] 3 tabs hiển thị: Market, Limit, Stop Limit
- [ ] Click tab → active state changes
- [ ] orderType state updates correctly
- [ ] UI responsive trên mobile

---

## Bước 2: Conditional Price Inputs

### Mục đích
Hiển thị price inputs tùy theo order type được chọn

### Công việc cần làm

1. **Add Price Input cho Limit Orders**
   ```jsx
   {/* Limit Price Input (chỉ show khi order type = limit hoặc stop-limit) */}
   {(orderType === 'limit' || orderType === 'stop-limit') && (
     <div className="input-section">
       <label className="input-label">
         {orderType === 'limit' ? 'Limit Price' : 'Limit Price (After Trigger)'}
       </label>

       <div className="input-wrapper">
         <input
           type="number"
           value={limitPrice}
           onChange={(e) => setLimitPrice(e.target.value)}
           placeholder={currentPrice ? currentPrice.toFixed(2) : '0.00'}
           step="0.01"
           min="0"
           className="price-input"
         />
         <span className="input-suffix">USDT</span>

         {/* Quick set buttons */}
         <div className="quick-price-buttons">
           <button
             onClick={() => setLimitPrice((currentPrice * 0.99).toFixed(2))}
             className="quick-btn"
           >
             -1%
           </button>
           <button
             onClick={() => setLimitPrice(currentPrice.toFixed(2))}
             className="quick-btn"
           >
             Market
           </button>
           <button
             onClick={() => setLimitPrice((currentPrice * 1.01).toFixed(2))}
             className="quick-btn"
           >
             +1%
           </button>
         </div>
       </div>
     </div>
   )}

   {/* Stop Price Input (chỉ show khi order type = stop-limit) */}
   {orderType === 'stop-limit' && (
     <div className="input-section">
       <label className="input-label">Stop Price (Trigger)</label>

       <div className="input-wrapper">
         <input
           type="number"
           value={stopPrice}
           onChange={(e) => setStopPrice(e.target.value)}
           placeholder={currentPrice ? currentPrice.toFixed(2) : '0.00'}
           step="0.01"
           min="0"
           className="price-input"
         />
         <span className="input-suffix">USDT</span>
       </div>

       <div className="input-hint">
         <span className="hint-icon">ℹ️</span>
         <span className="hint-text">
           Order triggers when price {side === 'buy' ? 'reaches or exceeds' : 'drops to or below'} this value
         </span>
       </div>
     </div>
   )}
   ```

2. **Add CSS for price inputs**
   ```css
   .input-section {
     margin-bottom: 16px;
   }

   .input-label {
     display: block;
     font-size: 13px;
     font-weight: 600;
     color: #8d8d8d;
     margin-bottom: 8px;
   }

   .input-wrapper {
     position: relative;
   }

   .price-input {
     width: 100%;
     padding: 12px 60px 12px 12px;
     background: rgba(255, 255, 255, 0.05);
     border: 1px solid rgba(255, 255, 255, 0.1);
     border-radius: 8px;
     color: #fff;
     font-size: 15px;
     font-weight: 500;
   }

   .price-input:focus {
     outline: none;
     border-color: #0ECB81;
     background: rgba(255, 255, 255, 0.08);
   }

   .input-suffix {
     position: absolute;
     right: 12px;
     top: 50%;
     transform: translateY(-50%);
     font-size: 13px;
     color: #8d8d8d;
     font-weight: 600;
   }

   .quick-price-buttons {
     display: flex;
     gap: 6px;
     margin-top: 8px;
   }

   .quick-btn {
     flex: 1;
     padding: 6px;
     background: rgba(255, 255, 255, 0.05);
     border: 1px solid rgba(255, 255, 255, 0.1);
     border-radius: 4px;
     color: #8d8d8d;
     font-size: 11px;
     cursor: pointer;
     transition: all 0.2s;
   }

   .quick-btn:hover {
     background: rgba(255, 255, 255, 0.1);
     border-color: #0ECB81;
     color: #0ECB81;
   }

   .input-hint {
     display: flex;
     align-items: center;
     gap: 6px;
     margin-top: 6px;
     padding: 8px;
     background: rgba(255, 255, 255, 0.03);
     border-radius: 6px;
   }

   .hint-icon {
     font-size: 14px;
   }

   .hint-text {
     font-size: 11px;
     color: #8d8d8d;
     line-height: 1.4;
   }
   ```

### Files cần sửa
- `src/components/PaperTradingPanel/PaperTradingPanel.jsx` - Add conditional price inputs
- `src/components/PaperTradingPanel/PaperTradingPanel.css` - Add styling

### Verification Checklist
- [ ] Market order: không hiện price inputs
- [ ] Limit order: hiện Limit Price input
- [ ] Stop Limit order: hiện cả Stop Price và Limit Price inputs
- [ ] Quick price buttons set giá chính xác
- [ ] Placeholder hiển thị current market price

---

## Bước 3: Quantity Slider & Percentage Buttons

### Mục đích
Cho phép user nhập quantity dễ dàng với slider và percentage shortcuts

### Công việc cần làm

1. **Calculate max quantity based on balance**
   ```jsx
   const calculateMaxQuantity = () => {
     if (!currentPrice || currentPrice <= 0) return 0;

     const executionPrice = orderType === 'market' ? currentPrice :
                           orderType === 'limit' ? parseFloat(limitPrice) :
                           parseFloat(stopPrice);

     if (!executionPrice || executionPrice <= 0) return 0;

     // Calculate max quantity user can buy with available balance
     const feeRate = 0.001; // 0.1%
     const maxQuantity = balance / (executionPrice * (1 + feeRate));

     return maxQuantity;
   };

   const maxQuantity = calculateMaxQuantity();
   ```

2. **Add Quantity Input with Slider**
   ```jsx
   <div className="input-section">
     <label className="input-label">
       <span>Quantity</span>
       <span className="label-right">
         Max: {maxQuantity.toFixed(8)} {symbol.replace('USDT', '')}
       </span>
     </label>

     {/* Quantity Input */}
     <div className="input-wrapper">
       <input
         type="number"
         value={quantity}
         onChange={(e) => setQuantity(e.target.value)}
         placeholder="0.00000000"
         step="0.00000001"
         min="0"
         max={maxQuantity}
         className="quantity-input"
       />
       <span className="input-suffix">{symbol.replace('USDT', '')}</span>
     </div>

     {/* Percentage Buttons */}
     <div className="percentage-buttons">
       {[25, 50, 75, 100].map(percent => (
         <button
           key={percent}
           onClick={() => {
             const qty = (maxQuantity * percent / 100);
             setQuantity(qty.toFixed(8));
           }}
           className="percentage-btn"
         >
           {percent}%
         </button>
       ))}
     </div>

     {/* Range Slider */}
     <div className="slider-wrapper">
       <input
         type="range"
         min="0"
         max={maxQuantity}
         value={quantity || 0}
         onChange={(e) => setQuantity(parseFloat(e.target.value).toFixed(8))}
         step={maxQuantity / 1000}
         className="quantity-slider"
       />

       <div className="slider-labels">
         <span>0</span>
         <span>{(maxQuantity / 2).toFixed(4)}</span>
         <span>{maxQuantity.toFixed(4)}</span>
       </div>
     </div>
   </div>
   ```

3. **Add CSS for slider**
   ```css
   .label-right {
     float: right;
     color: #0ECB81;
     font-size: 11px;
   }

   .quantity-input {
     width: 100%;
     padding: 12px 80px 12px 12px;
     background: rgba(255, 255, 255, 0.05);
     border: 1px solid rgba(255, 255, 255, 0.1);
     border-radius: 8px;
     color: #fff;
     font-size: 15px;
     font-weight: 500;
     font-family: 'Monaco', 'Courier New', monospace;
   }

   .percentage-buttons {
     display: grid;
     grid-template-columns: repeat(4, 1fr);
     gap: 6px;
     margin-top: 8px;
   }

   .percentage-btn {
     padding: 8px;
     background: rgba(255, 255, 255, 0.05);
     border: 1px solid rgba(255, 255, 255, 0.1);
     border-radius: 6px;
     color: #8d8d8d;
     font-size: 12px;
     font-weight: 600;
     cursor: pointer;
     transition: all 0.2s;
   }

   .percentage-btn:hover {
     background: rgba(255, 255, 255, 0.1);
     border-color: #0ECB81;
     color: #0ECB81;
   }

   .slider-wrapper {
     margin-top: 12px;
   }

   .quantity-slider {
     width: 100%;
     height: 6px;
     border-radius: 3px;
     background: rgba(255, 255, 255, 0.1);
     outline: none;
     -webkit-appearance: none;
   }

   .quantity-slider::-webkit-slider-thumb {
     -webkit-appearance: none;
     appearance: none;
     width: 16px;
     height: 16px;
     border-radius: 50%;
     background: #0ECB81;
     cursor: pointer;
     box-shadow: 0 0 8px rgba(14, 203, 129, 0.4);
   }

   .quantity-slider::-moz-range-thumb {
     width: 16px;
     height: 16px;
     border-radius: 50%;
     background: #0ECB81;
     cursor: pointer;
     border: none;
   }

   .slider-labels {
     display: flex;
     justify-content: space-between;
     margin-top: 4px;
     font-size: 10px;
     color: #8d8d8d;
   }
   ```

### Files cần sửa
- `src/components/PaperTradingPanel/PaperTradingPanel.jsx` - Add quantity slider
- `src/components/PaperTradingPanel/PaperTradingPanel.css` - Add styling

### Verification Checklist
- [ ] Max quantity tính đúng dựa trên balance
- [ ] Percentage buttons (25%, 50%, 75%, 100%) set quantity chính xác
- [ ] Slider moves và updates quantity
- [ ] Type vào input → slider position updates
- [ ] Move slider → input value updates

---

## Bước 4: Cost Calculation Display

### Mục đích
Hiển thị cost breakdown real-time khi user thay đổi quantity hoặc price

### Công việc cần làm

1. **Calculate cost, fee, total**
   ```jsx
   const calculateCost = () => {
     if (!quantity || parseFloat(quantity) <= 0) {
       return { cost: 0, fee: 0, total: 0 };
     }

     const qty = parseFloat(quantity);
     const price = orderType === 'market' ? currentPrice :
                   orderType === 'limit' ? parseFloat(limitPrice) :
                   parseFloat(stopPrice);

     if (!price || price <= 0) {
       return { cost: 0, fee: 0, total: 0 };
     }

     const cost = qty * price;
     const fee = cost * 0.001; // 0.1% fee
     const total = cost + fee;

     return { cost, fee, total };
   };

   const { cost, fee, total } = calculateCost();
   ```

2. **Add Cost Display Component**
   ```jsx
   <div className="cost-display">
     <div className="cost-header">
       <span className="cost-title">Order Summary</span>
     </div>

     <div className="cost-rows">
       <div className="cost-row">
         <span className="cost-label">Cost</span>
         <span className="cost-value">
           {cost.toLocaleString('en-US', {
             minimumFractionDigits: 2,
             maximumFractionDigits: 2,
           })} USDT
         </span>
       </div>

       <div className="cost-row">
         <span className="cost-label">Fee (0.1%)</span>
         <span className="cost-value fee">
           {fee.toLocaleString('en-US', {
             minimumFractionDigits: 4,
             maximumFractionDigits: 4,
           })} USDT
         </span>
       </div>

       <div className="cost-row total">
         <span className="cost-label">Total</span>
         <span className="cost-value">
           {total.toLocaleString('en-US', {
             minimumFractionDigits: 2,
             maximumFractionDigits: 2,
           })} USDT
         </span>
       </div>

       <div className="cost-row balance">
         <span className="cost-label">Available Balance</span>
         <span className="cost-value">
           {balance.toLocaleString('en-US', {
             minimumFractionDigits: 2,
             maximumFractionDigits: 2,
           })} USDT
         </span>
       </div>

       {total > balance && (
         <div className="cost-warning">
           <span className="warning-icon">⚠️</span>
           <span className="warning-text">Insufficient balance</span>
         </div>
       )}
     </div>
   </div>
   ```

3. **Add CSS for cost display**
   ```css
   .cost-display {
     margin-top: 20px;
     padding: 16px;
     background: rgba(255, 255, 255, 0.03);
     border: 1px solid rgba(255, 255, 255, 0.1);
     border-radius: 8px;
   }

   .cost-header {
     margin-bottom: 12px;
     padding-bottom: 8px;
     border-bottom: 1px solid rgba(255, 255, 255, 0.1);
   }

   .cost-title {
     font-size: 13px;
     font-weight: 600;
     color: #8d8d8d;
     text-transform: uppercase;
     letter-spacing: 0.5px;
   }

   .cost-rows {
     display: flex;
     flex-direction: column;
     gap: 8px;
   }

   .cost-row {
     display: flex;
     justify-content: space-between;
     align-items: center;
     font-size: 13px;
   }

   .cost-label {
     color: #8d8d8d;
   }

   .cost-value {
     color: #fff;
     font-weight: 600;
     font-family: 'Monaco', 'Courier New', monospace;
   }

   .cost-value.fee {
     color: #F6465D;
   }

   .cost-row.total {
     margin-top: 4px;
     padding-top: 8px;
     border-top: 1px solid rgba(255, 255, 255, 0.1);
   }

   .cost-row.total .cost-label {
     font-weight: 600;
     color: #fff;
   }

   .cost-row.total .cost-value {
     font-size: 15px;
     color: #0ECB81;
   }

   .cost-row.balance {
     margin-top: 8px;
     padding-top: 8px;
     border-top: 1px solid rgba(255, 255, 255, 0.05);
   }

   .cost-warning {
     display: flex;
     align-items: center;
     gap: 6px;
     margin-top: 8px;
     padding: 8px;
     background: rgba(246, 70, 93, 0.1);
     border: 1px solid rgba(246, 70, 93, 0.3);
     border-radius: 6px;
   }

   .warning-icon {
     font-size: 14px;
   }

   .warning-text {
     font-size: 12px;
     color: #F6465D;
     font-weight: 600;
   }
   ```

### Files cần sửa
- `src/components/PaperTradingPanel/PaperTradingPanel.jsx` - Add cost calculation
- `src/components/PaperTradingPanel/PaperTradingPanel.css` - Add styling

### Verification Checklist
- [ ] Cost updates khi quantity thay đổi
- [ ] Fee tính đúng (0.1% của cost)
- [ ] Total = Cost + Fee
- [ ] Warning hiện khi total > balance
- [ ] Number formatting đúng với commas và decimals

---

## Bước 5: Integration & Testing

### Manual Testing Checklist

**Test 1: Order Type Switching**
- [ ] Click Market tab → limitPrice input ẩn đi
- [ ] Click Limit tab → limitPrice input hiện ra
- [ ] Click Stop Limit tab → cả stopPrice và limitPrice hiện ra
- [ ] Switch giữa các tabs → state reset correctly

**Test 2: Price Input**
- [ ] Limit order: type price → cost calculation updates
- [ ] Quick price buttons (-1%, Market, +1%) → set giá đúng
- [ ] Stop Limit order: type stop price → hint text hiển thị đúng
- [ ] Invalid price (0, negative) → validation blocks

**Test 3: Quantity Controls**
- [ ] Type quantity → slider position updates
- [ ] Move slider → input value updates
- [ ] Click 25% button → quantity = maxQuantity * 0.25
- [ ] Click 100% button → quantity = maxQuantity
- [ ] Exceed max quantity → validation blocks

**Test 4: Cost Calculation**
- [ ] Change quantity → cost updates real-time
- [ ] Change price → cost updates real-time
- [ ] Fee always = cost * 0.001
- [ ] Total = cost + fee
- [ ] Balance warning hiện khi insufficient

---

## Edge Cases & Error Handling

### Edge Cases

1. **Price Loading Delay**
   - Giải pháp: Show skeleton loader
   ```jsx
   {!currentPrice ? (
     <div className="price-skeleton">Loading price...</div>
   ) : (
     <div className="current-price">${currentPrice.toFixed(2)}</div>
   )}
   ```

2. **Very Small Quantities**
   - Giải pháp: Support up to 8 decimal places
   ```jsx
   step="0.00000001"
   ```

3. **Very Large Numbers**
   - Giải pháp: Use toLocaleString() for formatting
   ```jsx
   {value.toLocaleString('en-US', { maximumFractionDigits: 2 })}
   ```

### Error Handling

```jsx
const validateOrderInputs = () => {
  // Validate quantity
  if (!quantity || parseFloat(quantity) <= 0) {
    toast.error('Please enter a valid quantity');
    return false;
  }

  // Validate price for limit orders
  if (orderType === 'limit' && (!limitPrice || parseFloat(limitPrice) <= 0)) {
    toast.error('Please enter a valid limit price');
    return false;
  }

  // Validate stop-limit
  if (orderType === 'stop-limit') {
    if (!stopPrice || parseFloat(stopPrice) <= 0) {
      toast.error('Please enter a valid stop price');
      return false;
    }
    if (!limitPrice || parseFloat(limitPrice) <= 0) {
      toast.error('Please enter a valid limit price');
      return false;
    }
  }

  // Validate balance
  if (total > balance) {
    toast.error('Insufficient balance');
    return false;
  }

  return true;
};
```

---

## Completion Criteria

- [ ] Order type tabs hoạt động
- [ ] Price inputs hiện/ẩn theo order type
- [ ] Quantity slider và percentage buttons chính xác
- [ ] Cost calculation real-time và chính xác
- [ ] UI responsive trên mobile
- [ ] Tất cả validations hoạt động
- [ ] No console errors

---

## Next Steps

1. Cập nhật `plan.md` → Phase 03 Completed
2. Commit: `feat: complete phase-03 - order types and price configuration`
3. Chuyển sang `phase-04-advanced-features.md`
