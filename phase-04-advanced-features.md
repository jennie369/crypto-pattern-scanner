# Phase 04: Advanced Order Features

## Thông Tin Phase
- **Thời lượng ước tính**: 4-5 giờ
- **Trạng thái**: ⏳ Pending
- **Tiến độ**: 0%
- **Phụ thuộc**: Phase 03 (Order Types & Price Configuration)

## Mục Tiêu

Implement các tính năng nâng cao để đưa Paper Trading lên tầm chuyên nghiệp như Binance:
1. Take Profit (TP) checkbox với price input
2. Stop Loss (SL) checkbox với price input
3. Reduce-Only option
4. Time in Force (TIF) selector: GTC, IOC, FOK
5. Enhanced validation logic
6. Execute buttons với loading states

## Deliverables
- [ ] TP/SL checkboxes với conditional price inputs
- [ ] Reduce-Only checkbox với tooltip
- [ ] TIF dropdown selector
- [ ] TP/SL validation (TP > entry, SL < entry for BUY)
- [ ] Execute buttons với loading và disabled states
- [ ] Integration với backend executeBuy/executeSell

---

## Bước 1: Take Profit & Stop Loss Inputs

### Mục đích
Cho phép user set TP/SL prices khi placing order

### Công việc cần làm

1. **Add TP/SL state**
   - File: `src/components/PaperTradingPanel/PaperTradingPanel.jsx`

   ```jsx
   const [useTakeProfit, setUseTakeProfit] = useState(false);
   const [takeProfitPrice, setTakeProfitPrice] = useState('');
   const [useStopLoss, setUseStopLoss] = useState(false);
   const [stopLossPrice, setStopLossPrice] = useState('');
   ```

2. **Create TP/SL UI Component**
   ```jsx
   <div className="advanced-orders-section">
     <label className="section-label">Advanced Orders</label>

     {/* Take Profit */}
     <div className="advanced-order-item">
       <div className="checkbox-row">
         <input
           type="checkbox"
           id="tp-checkbox"
           checked={useTakeProfit}
           onChange={(e) => {
             const hasAccess = (isAdmin && isAdmin()) || userTier !== 'FREE';
             if (!hasAccess) {
               toast.error('Take Profit requires TIER1+');
               return;
             }
             setUseTakeProfit(e.target.checked);
           }}
           className="checkbox-input"
         />
         <label htmlFor="tp-checkbox" className="checkbox-label">
           <span className="checkbox-icon">📈</span>
           <span className="checkbox-text">Take Profit</span>
           <span className="checkbox-badge tier1">TIER1+</span>
         </label>
       </div>

       {useTakeProfit && (
         <div className="advanced-price-input">
           <div className="input-wrapper">
             <input
               type="number"
               value={takeProfitPrice}
               onChange={(e) => setTakeProfitPrice(e.target.value)}
               placeholder={
                 currentPrice ? (currentPrice * 1.05).toFixed(2) : '0.00'
               }
               step="0.01"
               min="0"
               className="tp-price-input"
             />
             <span className="input-suffix">USDT</span>
           </div>

           {/* Quick TP buttons */}
           <div className="quick-tp-buttons">
             {[2, 5, 10, 20].map(percent => (
               <button
                 key={percent}
                 onClick={() => {
                   const executionPrice = orderType === 'market' ? currentPrice :
                                         parseFloat(limitPrice);
                   if (executionPrice) {
                     const tpPrice = executionPrice * (1 + percent / 100);
                     setTakeProfitPrice(tpPrice.toFixed(2));
                   }
                 }}
                 className="quick-tp-btn"
               >
                 +{percent}%
               </button>
             ))}
           </div>

           {takeProfitPrice && currentPrice && (
             <div className="tp-preview">
               <span className="preview-label">Profit if TP hits:</span>
               <span className="preview-value positive">
                 +{(
                   (parseFloat(takeProfitPrice) - currentPrice) *
                   parseFloat(quantity || 0)
                 ).toFixed(2)} USDT
                 ({((parseFloat(takeProfitPrice) / currentPrice - 1) * 100).toFixed(2)}%)
               </span>
             </div>
           )}
         </div>
       )}
     </div>

     {/* Stop Loss */}
     <div className="advanced-order-item">
       <div className="checkbox-row">
         <input
           type="checkbox"
           id="sl-checkbox"
           checked={useStopLoss}
           onChange={(e) => {
             const hasAccess = (isAdmin && isAdmin()) || userTier !== 'FREE';
             if (!hasAccess) {
               toast.error('Stop Loss requires TIER1+');
               return;
             }
             setUseStopLoss(e.target.checked);
           }}
           className="checkbox-input"
         />
         <label htmlFor="sl-checkbox" className="checkbox-label">
           <span className="checkbox-icon">📉</span>
           <span className="checkbox-text">Stop Loss</span>
           <span className="checkbox-badge tier1">TIER1+</span>
         </label>
       </div>

       {useStopLoss && (
         <div className="advanced-price-input">
           <div className="input-wrapper">
             <input
               type="number"
               value={stopLossPrice}
               onChange={(e) => setStopLossPrice(e.target.value)}
               placeholder={
                 currentPrice ? (currentPrice * 0.95).toFixed(2) : '0.00'
               }
               step="0.01"
               min="0"
               className="sl-price-input"
             />
             <span className="input-suffix">USDT</span>
           </div>

           {/* Quick SL buttons */}
           <div className="quick-sl-buttons">
             {[2, 5, 10, 20].map(percent => (
               <button
                 key={percent}
                 onClick={() => {
                   const executionPrice = orderType === 'market' ? currentPrice :
                                         parseFloat(limitPrice);
                   if (executionPrice) {
                     const slPrice = executionPrice * (1 - percent / 100);
                     setStopLossPrice(slPrice.toFixed(2));
                   }
                 }}
                 className="quick-sl-btn"
               >
                 -{percent}%
               </button>
             ))}
           </div>

           {stopLossPrice && currentPrice && (
             <div className="sl-preview">
               <span className="preview-label">Loss if SL hits:</span>
               <span className="preview-value negative">
                 {(
                   (parseFloat(stopLossPrice) - currentPrice) *
                   parseFloat(quantity || 0)
                 ).toFixed(2)} USDT
                 ({((parseFloat(stopLossPrice) / currentPrice - 1) * 100).toFixed(2)}%)
               </span>
             </div>
           )}
         </div>
       )}
     </div>

     {/* Risk/Reward Ratio */}
     {useTakeProfit && useStopLoss && takeProfitPrice && stopLossPrice && currentPrice && (
       <div className="risk-reward-display">
         <span className="rr-label">Risk/Reward Ratio:</span>
         <span className="rr-value">
           1 : {(
             Math.abs(parseFloat(takeProfitPrice) - currentPrice) /
             Math.abs(currentPrice - parseFloat(stopLossPrice))
           ).toFixed(2)}
         </span>
       </div>
     )}
   </div>
   ```

3. **Add CSS styling**
   ```css
   .advanced-orders-section {
     margin: 20px 0;
     padding: 16px;
     background: rgba(255, 255, 255, 0.03);
     border: 1px solid rgba(255, 255, 255, 0.1);
     border-radius: 8px;
   }

   .advanced-order-item {
     margin-bottom: 16px;
   }

   .advanced-order-item:last-child {
     margin-bottom: 0;
   }

   .checkbox-row {
     display: flex;
     align-items: center;
     gap: 10px;
   }

   .checkbox-input {
     width: 18px;
     height: 18px;
     cursor: pointer;
     accent-color: #0ECB81;
   }

   .checkbox-label {
     flex: 1;
     display: flex;
     align-items: center;
     gap: 8px;
     cursor: pointer;
     font-size: 14px;
     font-weight: 600;
     color: #fff;
   }

   .checkbox-icon {
     font-size: 16px;
   }

   .checkbox-badge {
     padding: 2px 6px;
     background: rgba(255, 255, 255, 0.1);
     border-radius: 4px;
     font-size: 10px;
     font-weight: 700;
     text-transform: uppercase;
     letter-spacing: 0.5px;
   }

   .checkbox-badge.tier1 {
     background: rgba(255, 189, 89, 0.2);
     color: #FFBD59;
   }

   .advanced-price-input {
     margin-top: 12px;
     padding-left: 28px;
   }

   .tp-price-input {
     width: 100%;
     padding: 12px 60px 12px 12px;
     background: rgba(14, 203, 129, 0.05);
     border: 1px solid rgba(14, 203, 129, 0.3);
     border-radius: 8px;
     color: #0ECB81;
     font-size: 15px;
     font-weight: 600;
   }

   .sl-price-input {
     width: 100%;
     padding: 12px 60px 12px 12px;
     background: rgba(246, 70, 93, 0.05);
     border: 1px solid rgba(246, 70, 93, 0.3);
     border-radius: 8px;
     color: #F6465D;
     font-size: 15px;
     font-weight: 600;
   }

   .quick-tp-buttons,
   .quick-sl-buttons {
     display: grid;
     grid-template-columns: repeat(4, 1fr);
     gap: 6px;
     margin-top: 8px;
   }

   .quick-tp-btn {
     padding: 6px;
     background: rgba(14, 203, 129, 0.1);
     border: 1px solid rgba(14, 203, 129, 0.3);
     border-radius: 4px;
     color: #0ECB81;
     font-size: 11px;
     font-weight: 600;
     cursor: pointer;
   }

   .quick-sl-btn {
     padding: 6px;
     background: rgba(246, 70, 93, 0.1);
     border: 1px solid rgba(246, 70, 93, 0.3);
     border-radius: 4px;
     color: #F6465D;
     font-size: 11px;
     font-weight: 600;
     cursor: pointer;
   }

   .tp-preview,
   .sl-preview {
     display: flex;
     justify-content: space-between;
     align-items: center;
     margin-top: 8px;
     padding: 8px;
     background: rgba(255, 255, 255, 0.03);
     border-radius: 6px;
     font-size: 12px;
   }

   .preview-label {
     color: #8d8d8d;
   }

   .preview-value {
     font-weight: 600;
     font-family: 'Monaco', 'Courier New', monospace;
   }

   .preview-value.positive {
     color: #0ECB81;
   }

   .preview-value.negative {
     color: #F6465D;
   }

   .risk-reward-display {
     display: flex;
     justify-content: space-between;
     align-items: center;
     margin-top: 12px;
     padding: 12px;
     background: rgba(14, 203, 129, 0.1);
     border: 1px solid rgba(14, 203, 129, 0.3);
     border-radius: 8px;
   }

   .rr-label {
     font-size: 13px;
     color: #8d8d8d;
     font-weight: 600;
   }

   .rr-value {
     font-size: 16px;
     font-weight: 700;
     color: #0ECB81;
   }
   ```

### Files cần sửa
- `src/components/PaperTradingPanel/PaperTradingPanel.jsx` - Add TP/SL UI
- `src/components/PaperTradingPanel/PaperTradingPanel.css` - Add styling

### Verification Checklist
- [ ] TP checkbox toggles price input visibility
- [ ] SL checkbox toggles price input visibility
- [ ] Quick % buttons set prices correctly
- [ ] TP/SL preview shows estimated profit/loss
- [ ] Risk/Reward ratio calculates correctly
- [ ] TIER1 access check works

---

## Bước 2: Reduce-Only Option

### Mục đích
Cho phép user đặt orders chỉ để close positions, không mở position mới

### Công việc cần làm

1. **Add Reduce-Only state**
   ```jsx
   const [reduceOnly, setReduceOnly] = useState(false);
   ```

2. **Create Reduce-Only UI**
   ```jsx
   <div className="reduce-only-section">
     <div className="checkbox-row">
       <input
         type="checkbox"
         id="reduce-only"
         checked={reduceOnly}
         onChange={(e) => setReduceOnly(e.target.checked)}
         className="checkbox-input"
       />
       <label htmlFor="reduce-only" className="checkbox-label">
         <span className="checkbox-text">Reduce-Only</span>
         <button
           className="info-tooltip"
           onClick={(e) => {
             e.preventDefault();
             toast.info('Order will only reduce your position, not increase it', {
               duration: 4000,
             });
           }}
         >
           ℹ️
         </button>
       </label>
     </div>

     {reduceOnly && (
       <div className="reduce-only-hint">
         <span className="hint-icon">⚠️</span>
         <span className="hint-text">
           This order will be rejected if it would increase your position size
         </span>
       </div>
     )}
   </div>
   ```

3. **Add CSS**
   ```css
   .reduce-only-section {
     margin: 12px 0;
   }

   .info-tooltip {
     width: 20px;
     height: 20px;
     border-radius: 50%;
     background: rgba(255, 255, 255, 0.1);
     border: none;
     color: #8d8d8d;
     font-size: 12px;
     cursor: help;
     transition: all 0.2s;
   }

   .info-tooltip:hover {
     background: rgba(255, 255, 255, 0.2);
     color: #0ECB81;
   }

   .reduce-only-hint {
     margin-top: 8px;
     padding: 8px;
     background: rgba(255, 189, 89, 0.1);
     border: 1px solid rgba(255, 189, 89, 0.3);
     border-radius: 6px;
     display: flex;
     align-items: center;
     gap: 8px;
   }

   .reduce-only-hint .hint-text {
     font-size: 11px;
     color: #FFBD59;
   }
   ```

### Files cần sửa
- `src/components/PaperTradingPanel/PaperTradingPanel.jsx` - Add Reduce-Only UI
- `src/components/PaperTradingPanel/PaperTradingPanel.css` - Add styling

### Verification Checklist
- [ ] Checkbox toggles reduceOnly state
- [ ] Info tooltip shows explanation
- [ ] Hint message hiển thị khi checked

---

## Bước 3: Time in Force (TIF) Selector

### Mục đích
Cho phép user chọn TIF: GTC, IOC, hoặc FOK

### Công việc cần làm

1. **Add TIF state**
   ```jsx
   const [timeInForce, setTimeInForce] = useState('GTC');
   ```

2. **Create TIF Selector UI**
   ```jsx
   <div className="tif-section">
     <label className="section-label">
       Time in Force
       <button
         className="info-tooltip"
         onClick={(e) => {
           e.preventDefault();
           toast.info(
             'GTC: Good Till Cancel\nIOC: Immediate or Cancel\nFOK: Fill or Kill',
             { duration: 5000 }
           );
         }}
       >
         ℹ️
       </button>
     </label>

     <select
       value={timeInForce}
       onChange={(e) => setTimeInForce(e.target.value)}
       className="tif-select"
     >
       <option value="GTC">GTC (Good Till Cancel)</option>
       <option value="IOC">IOC (Immediate or Cancel)</option>
       <option value="FOK">FOK (Fill or Kill)</option>
     </select>

     <div className="tif-description">
       {timeInForce === 'GTC' && (
         <span>Order remains active until filled or manually cancelled</span>
       )}
       {timeInForce === 'IOC' && (
         <span>Fill immediately, cancel any unfilled portion</span>
       )}
       {timeInForce === 'FOK' && (
         <span>Fill entire order immediately or cancel completely</span>
       )}
     </div>
   </div>
   ```

3. **Add CSS**
   ```css
   .tif-section {
     margin: 16px 0;
   }

   .tif-select {
     width: 100%;
     padding: 12px;
     background: rgba(255, 255, 255, 0.05);
     border: 1px solid rgba(255, 255, 255, 0.1);
     border-radius: 8px;
     color: #fff;
     font-size: 14px;
     cursor: pointer;
     appearance: none;
     background-image: url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L6 6L11 1' stroke='%238d8d8d' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E");
     background-repeat: no-repeat;
     background-position: right 12px center;
     padding-right: 36px;
   }

   .tif-select:focus {
     outline: none;
     border-color: #0ECB81;
     background: rgba(255, 255, 255, 0.08);
   }

   .tif-select option {
     background: #1e1e1e;
     color: #fff;
   }

   .tif-description {
     margin-top: 8px;
     padding: 8px;
     background: rgba(255, 255, 255, 0.03);
     border-radius: 6px;
     font-size: 11px;
     color: #8d8d8d;
     line-height: 1.4;
   }
   ```

### Files cần sửa
- `src/components/PaperTradingPanel/PaperTradingPanel.jsx` - Add TIF selector
- `src/components/PaperTradingPanel/PaperTradingPanel.css` - Add styling

### Verification Checklist
- [ ] Dropdown hiển thị 3 options: GTC, IOC, FOK
- [ ] Select option → timeInForce state updates
- [ ] Description text thay đổi theo selected option
- [ ] Info tooltip shows explanations

---

## Bước 4: Enhanced Validation Logic

### Mục đích
Validate TP/SL prices logic (TP > entry cho BUY, SL < entry cho BUY)

### Công việc cần làm

1. **Create validation functions**
   ```javascript
   const validateTPSL = () => {
     const executionPrice = orderType === 'market' ? currentPrice :
                           orderType === 'limit' ? parseFloat(limitPrice) :
                           parseFloat(stopPrice);

     if (!executionPrice || executionPrice <= 0) {
       return { valid: false, error: 'Invalid execution price' };
     }

     // For BUY orders
     if (side === 'buy') {
       // TP must be > execution price
       if (useTakeProfit && takeProfitPrice) {
         if (parseFloat(takeProfitPrice) <= executionPrice) {
           return {
             valid: false,
             error: `Take Profit price must be higher than entry (${executionPrice.toFixed(2)})`
           };
         }
       }

       // SL must be < execution price
       if (useStopLoss && stopLossPrice) {
         if (parseFloat(stopLossPrice) >= executionPrice) {
           return {
             valid: false,
             error: `Stop Loss price must be lower than entry (${executionPrice.toFixed(2)})`
           };
         }
       }
     }

     // For SELL orders (opposite logic)
     if (side === 'sell') {
       // TP must be < execution price
       if (useTakeProfit && takeProfitPrice) {
         if (parseFloat(takeProfitPrice) >= executionPrice) {
           return {
             valid: false,
             error: `Take Profit price must be lower than entry (${executionPrice.toFixed(2)})`
           };
         }
       }

       // SL must be > execution price
       if (useStopLoss && stopLossPrice) {
         if (parseFloat(stopLossPrice) <= executionPrice) {
           return {
             valid: false,
             error: `Stop Loss price must be higher than entry (${executionPrice.toFixed(2)})`
           };
         }
       }
     }

     return { valid: true };
   };
   ```

2. **Integrate validation vào execute function**
   ```javascript
   const handleBuyClick = async () => {
     // Existing validations
     if (!validateInputs()) return;

     // TP/SL validation
     const tpslCheck = validateTPSL();
     if (!tpslCheck.valid) {
       toast.error(tpslCheck.error);
       return;
     }

     // Proceed with execution
     setLoading(true);
     // ...
   };
   ```

### Files cần sửa
- `src/components/PaperTradingPanel/PaperTradingPanel.jsx` - Add validation logic

### Verification Checklist
- [ ] BUY order: TP < entry → blocked với error message
- [ ] BUY order: SL > entry → blocked với error message
- [ ] SELL order: TP > entry → blocked với error message
- [ ] SELL order: SL < entry → blocked với error message
- [ ] Valid TP/SL → order proceeds

---

## Bước 5: Execute Buttons with Loading States

### Mục đích
Professional execute buttons với loading states và proper disabled logic

### Công việc cần làm

1. **Update execute buttons**
   ```jsx
   <div className="execute-buttons">
     <button
       className="btn-buy"
       onClick={handleBuyClick}
       disabled={loading || !isValidOrder()}
     >
       {loading ? (
         <>
           <span className="btn-spinner"></span>
           <span>Executing...</span>
         </>
       ) : (
         <>
           <span className="btn-icon">📈</span>
           <span>Buy / Long</span>
         </>
       )}
     </button>

     <button
       className="btn-sell"
       onClick={handleSellClick}
       disabled={loading || !isValidOrder()}
     >
       {loading ? (
         <>
           <span className="btn-spinner"></span>
           <span>Executing...</span>
         </>
       ) : (
         <>
           <span className="btn-icon">📉</span>
           <span>Sell / Short</span>
         </>
       )}
     </button>
   </div>

   {!isValidOrder() && (
     <div className="order-invalid-hint">
       {getInvalidReason()}
     </div>
   )}
   ```

2. **Helper functions**
   ```javascript
   const isValidOrder = () => {
     if (!currentPrice || currentPrice <= 0) return false;
     if (!quantity || parseFloat(quantity) <= 0) return false;
     if (orderType === 'limit' && (!limitPrice || parseFloat(limitPrice) <= 0)) return false;
     if (orderType === 'stop-limit' && (!stopPrice || parseFloat(stopPrice) <= 0)) return false;
     if (total > balance) return false;
     return true;
   };

   const getInvalidReason = () => {
     if (!currentPrice || currentPrice <= 0) return 'Waiting for price data...';
     if (!quantity || parseFloat(quantity) <= 0) return 'Enter quantity';
     if (orderType === 'limit' && (!limitPrice || parseFloat(limitPrice) <= 0)) return 'Enter limit price';
     if (orderType === 'stop-limit' && (!stopPrice || parseFloat(stopPrice) <= 0)) return 'Enter stop price';
     if (total > balance) return 'Insufficient balance';
     return 'Invalid order';
   };
   ```

3. **Add CSS**
   ```css
   .execute-buttons {
     display: grid;
     grid-template-columns: 1fr 1fr;
     gap: 12px;
     margin-top: 24px;
   }

   .btn-buy,
   .btn-sell {
     display: flex;
     align-items: center;
     justify-content: center;
     gap: 8px;
     padding: 16px;
     border-radius: 8px;
     font-size: 15px;
     font-weight: 700;
     cursor: pointer;
     transition: all 0.2s;
     border: none;
   }

   .btn-buy {
     background: linear-gradient(135deg, #0ECB81, #00a669);
     color: #fff;
   }

   .btn-buy:hover:not(:disabled) {
     background: linear-gradient(135deg, #00a669, #008556);
     transform: translateY(-1px);
     box-shadow: 0 4px 12px rgba(14, 203, 129, 0.3);
   }

   .btn-sell {
     background: linear-gradient(135deg, #F6465D, #d63849);
     color: #fff;
   }

   .btn-sell:hover:not(:disabled) {
     background: linear-gradient(135deg, #d63849, #b82d3a);
     transform: translateY(-1px);
     box-shadow: 0 4px 12px rgba(246, 70, 93, 0.3);
   }

   .btn-buy:disabled,
   .btn-sell:disabled {
     opacity: 0.5;
     cursor: not-allowed;
     transform: none;
   }

   .btn-spinner {
     width: 16px;
     height: 16px;
     border: 2px solid rgba(255, 255, 255, 0.3);
     border-top-color: #fff;
     border-radius: 50%;
     animation: spin 0.8s linear infinite;
   }

   @keyframes spin {
     to { transform: rotate(360deg); }
   }

   .order-invalid-hint {
     margin-top: 12px;
     padding: 10px;
     background: rgba(255, 189, 89, 0.1);
     border: 1px solid rgba(255, 189, 89, 0.3);
     border-radius: 6px;
     text-align: center;
     font-size: 12px;
     color: #FFBD59;
   }
   ```

### Files cần sửa
- `src/components/PaperTradingPanel/PaperTradingPanel.jsx` - Update execute buttons
- `src/components/PaperTradingPanel/PaperTradingPanel.css` - Add styling

### Verification Checklist
- [ ] Buttons disabled khi invalid inputs
- [ ] Loading spinner hiện khi executing
- [ ] Invalid hint shows lý do không thể execute
- [ ] Hover effects hoạt động
- [ ] Cannot click multiple times (disabled during loading)

---

## Completion Criteria

- [ ] TP/SL checkboxes và price inputs hoạt động
- [ ] Reduce-Only option works
- [ ] TIF selector với 3 options
- [ ] TP/SL validation logic chính xác
- [ ] Execute buttons với loading states
- [ ] Integration với backend hoàn chỉnh
- [ ] All tests pass

---

## Next Steps

1. Cập nhật `plan.md` → Phase 04 Completed
2. Commit: `feat: complete phase-04 - advanced order features`
3. Chuyển sang `phase-05-scanner-integration.md`
