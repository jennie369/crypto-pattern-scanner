# Phase 05: Scanner Integration

## Thông Tin Phase
- **Thời lượng ước tính**: 3-4 giờ
- **Trạng thái**: ⏳ Pending
- **Tiến độ**: 0%
- **Phụ thuộc**: Phase 04 (Advanced Order Features)

## Mục Tiêu

Tích hợp Paper Trading vào Scanner page để user có thể:
1. Xem Open Positions ngay trên Scanner
2. Xem Recent Trades history
3. Close positions directly từ Scanner
4. Monitor real-time P&L updates
5. Quick access to Paper Trading Panel từ pattern results

## Deliverables
- [ ] Open Positions Widget component
- [ ] Recent Trades Section component
- [ ] Close Position functionality
- [ ] Real-time P&L calculation
- [ ] Integration vào Scanner page layout

---

## Bước 1: Open Positions Widget Component

### Mục đích
Hiển thị danh sách tất cả open positions với P&L real-time

### Công việc cần làm

1. **Create OpenPositionsWidget component**
   - File: `src/components/PaperTrading/OpenPositionsWidget.jsx`

   ```jsx
   import React, { useState, useEffect } from 'react';
   import { useAuth } from '../../contexts/AuthContext';
   import { getHoldings, closePosition } from '../../services/paperTrading';
   import { binanceWS } from '../../services/binanceWebSocket';
   import toast from 'react-hot-toast';
   import './OpenPositionsWidget.css';

   export const OpenPositionsWidget = ({ onOpenPaperTrading }) => {
     const { user } = useAuth();
     const [positions, setPositions] = useState([]);
     const [loading, setLoading] = useState(true);
     const [prices, setPrices] = useState({});

     // Load positions
     useEffect(() => {
       if (user) {
         loadPositions();
       }
     }, [user]);

     const loadPositions = async () => {
       setLoading(true);
       try {
         const holdings = await getHoldings(user.id);
         setPositions(holdings);

         // Subscribe to price updates for each symbol
         holdings.forEach(holding => {
           subscribeToPriceUpdates(holding.symbol);
         });
       } catch (error) {
         console.error('Failed to load positions:', error);
         toast.error('Failed to load positions');
       } finally {
         setLoading(false);
       }
     };

     const subscribeToPriceUpdates = (symbol) => {
       binanceWS.subscribe(symbol, (update) => {
         if (update.price) {
           setPrices(prev => ({
             ...prev,
             [symbol]: update.price
           }));
         }
       });
     };

     const calculatePnL = (position) => {
       const currentPrice = prices[position.symbol] || 0;
       if (!currentPrice || currentPrice <= 0) return { pnl: 0, pnlPercentage: 0 };

       const pnl = (currentPrice - position.average_price) * position.quantity;
       const pnlPercentage = ((currentPrice / position.average_price) - 1) * 100;

       return { pnl, pnlPercentage };
     };

     const handleClosePosition = async (position) => {
       if (!confirm(`Close ${position.symbol} position?`)) return;

       try {
         await closePosition(position.id, user.id);
         toast.success(`${position.symbol} position closed`);
         loadPositions(); // Reload
       } catch (error) {
         toast.error(`Failed to close position: ${error.message}`);
       }
     };

     if (loading) {
       return (
         <div className="open-positions-widget">
           <div className="widget-header">
             <h3>Open Positions</h3>
           </div>
           <div className="loading-state">Loading positions...</div>
         </div>
       );
     }

     if (positions.length === 0) {
       return (
         <div className="open-positions-widget">
           <div className="widget-header">
             <h3>Open Positions (0)</h3>
           </div>
           <div className="empty-state">
             <span className="empty-icon">📊</span>
             <p>No open positions</p>
             <span className="empty-hint">Start paper trading to see positions here</span>
           </div>
         </div>
       );
     }

     return (
       <div className="open-positions-widget">
         <div className="widget-header">
           <h3>Open Positions ({positions.length})</h3>
           <button
             className="btn-refresh"
             onClick={loadPositions}
           >
             🔄
           </button>
         </div>

         <div className="positions-list">
           {positions.map(position => {
             const { pnl, pnlPercentage } = calculatePnL(position);
             const currentPrice = prices[position.symbol] || 0;

             return (
               <div key={position.id} className="position-card">
                 <div className="position-header">
                   <span className="position-symbol">{position.symbol}</span>
                   <span className={`position-pnl ${pnl >= 0 ? 'profit' : 'loss'}`}>
                     {pnl >= 0 ? '+' : ''}{pnl.toFixed(2)} USDT
                   </span>
                 </div>

                 <div className="position-details">
                   <div className="detail-row">
                     <span className="detail-label">Quantity</span>
                     <span className="detail-value">{position.quantity.toFixed(8)}</span>
                   </div>

                   <div className="detail-row">
                     <span className="detail-label">Entry</span>
                     <span className="detail-value">${position.average_price.toLocaleString()}</span>
                   </div>

                   <div className="detail-row">
                     <span className="detail-label">Current</span>
                     <span className="detail-value">
                       {currentPrice > 0 ? `$${currentPrice.toLocaleString()}` : 'Loading...'}
                     </span>
                   </div>

                   <div className="detail-row">
                     <span className="detail-label">P&L %</span>
                     <span className={`detail-value ${pnlPercentage >= 0 ? 'profit' : 'loss'}`}>
                       {pnlPercentage >= 0 ? '+' : ''}{pnlPercentage.toFixed(2)}%
                     </span>
                   </div>
                 </div>

                 <div className="position-actions">
                   <button
                     className="btn-close-position"
                     onClick={() => handleClosePosition(position)}
                   >
                     Close Position
                   </button>
                   <button
                     className="btn-manage"
                     onClick={() => onOpenPaperTrading(position.symbol)}
                   >
                     Manage
                   </button>
                 </div>
               </div>
             );
           })}
         </div>
       </div>
     );
   };

   export default OpenPositionsWidget;
   ```

2. **Create CSS styling**
   - File: `src/components/PaperTrading/OpenPositionsWidget.css`

   ```css
   .open-positions-widget {
     background: rgba(255, 255, 255, 0.03);
     border: 1px solid rgba(255, 255, 255, 0.1);
     border-radius: 12px;
     padding: 16px;
   }

   .widget-header {
     display: flex;
     justify-content: space-between;
     align-items: center;
     margin-bottom: 16px;
     padding-bottom: 12px;
     border-bottom: 1px solid rgba(255, 255, 255, 0.1);
   }

   .widget-header h3 {
     font-size: 16px;
     font-weight: 700;
     color: #fff;
     margin: 0;
   }

   .btn-refresh {
     width: 32px;
     height: 32px;
     background: rgba(255, 255, 255, 0.05);
     border: 1px solid rgba(255, 255, 255, 0.1);
     border-radius: 6px;
     cursor: pointer;
     font-size: 14px;
     transition: all 0.2s;
   }

   .btn-refresh:hover {
     background: rgba(255, 255, 255, 0.1);
     transform: rotate(90deg);
   }

   .empty-state {
     display: flex;
     flex-direction: column;
     align-items: center;
     justify-content: center;
     padding: 40px 20px;
     text-align: center;
   }

   .empty-icon {
     font-size: 48px;
     margin-bottom: 12px;
     opacity: 0.5;
   }

   .empty-state p {
     font-size: 15px;
     color: #8d8d8d;
     margin: 0 0 8px 0;
   }

   .empty-hint {
     font-size: 12px;
     color: #606060;
   }

   .positions-list {
     display: flex;
     flex-direction: column;
     gap: 12px;
   }

   .position-card {
     background: rgba(255, 255, 255, 0.03);
     border: 1px solid rgba(255, 255, 255, 0.1);
     border-radius: 8px;
     padding: 12px;
     transition: all 0.2s;
   }

   .position-card:hover {
     background: rgba(255, 255, 255, 0.05);
     border-color: rgba(255, 255, 255, 0.2);
   }

   .position-header {
     display: flex;
     justify-content: space-between;
     align-items: center;
     margin-bottom: 12px;
   }

   .position-symbol {
     font-size: 15px;
     font-weight: 700;
     color: #fff;
   }

   .position-pnl {
     font-size: 14px;
     font-weight: 700;
     font-family: 'Monaco', 'Courier New', monospace;
   }

   .position-pnl.profit {
     color: #0ECB81;
   }

   .position-pnl.loss {
     color: #F6465D;
   }

   .position-details {
     display: grid;
     grid-template-columns: 1fr 1fr;
     gap: 8px;
     margin-bottom: 12px;
   }

   .detail-row {
     display: flex;
     justify-content: space-between;
     font-size: 12px;
   }

   .detail-label {
     color: #8d8d8d;
   }

   .detail-value {
     color: #fff;
     font-weight: 600;
     font-family: 'Monaco', 'Courier New', monospace;
   }

   .detail-value.profit {
     color: #0ECB81;
   }

   .detail-value.loss {
     color: #F6465D;
   }

   .position-actions {
     display: grid;
     grid-template-columns: 1fr 1fr;
     gap: 8px;
   }

   .btn-close-position {
     padding: 8px;
     background: rgba(246, 70, 93, 0.1);
     border: 1px solid rgba(246, 70, 93, 0.3);
     border-radius: 6px;
     color: #F6465D;
     font-size: 12px;
     font-weight: 600;
     cursor: pointer;
     transition: all 0.2s;
   }

   .btn-close-position:hover {
     background: rgba(246, 70, 93, 0.2);
   }

   .btn-manage {
     padding: 8px;
     background: rgba(14, 203, 129, 0.1);
     border: 1px solid rgba(14, 203, 129, 0.3);
     border-radius: 6px;
     color: #0ECB81;
     font-size: 12px;
     font-weight: 600;
     cursor: pointer;
     transition: all 0.2s;
   }

   .btn-manage:hover {
     background: rgba(14, 203, 129, 0.2);
   }
   ```

### Files cần tạo
- `src/components/PaperTrading/OpenPositionsWidget.jsx` - Main component
- `src/components/PaperTrading/OpenPositionsWidget.css` - Styling

### Verification Checklist
- [ ] Widget hiển thị số lượng open positions
- [ ] Real-time P&L updates khi price thay đổi
- [ ] Close position button works
- [ ] Manage button opens Paper Trading Panel
- [ ] Empty state hiển thị khi no positions

---

## Bước 2: Recent Trades Section

### Mục đích
Hiển thị 5-10 trades gần nhất với P&L

### Công việc cần làm

1. **Create RecentTradesSection component**
   - File: `src/components/PaperTrading/RecentTradesSection.jsx`

   ```jsx
   import React, { useState, useEffect } from 'react';
   import { useAuth } from '../../contexts/AuthContext';
   import { getOrders } from '../../services/paperTrading';
   import './RecentTradesSection.css';

   export const RecentTradesSection = () => {
     const { user } = useAuth();
     const [trades, setTrades] = useState([]);
     const [loading, setLoading] = useState(true);

     useEffect(() => {
       if (user) {
         loadRecentTrades();
       }
     }, [user]);

     const loadRecentTrades = async () => {
       setLoading(true);
       try {
         // Fetch last 10 orders
         const orders = await getOrders(user.id, 10);

         // Filter only SELL orders (closed positions)
         const closedTrades = orders.filter(o => o.side === 'sell' && o.pnl !== null);

         setTrades(closedTrades);
       } catch (error) {
         console.error('Failed to load trades:', error);
       } finally {
         setLoading(false);
       }
     };

     if (loading) {
       return (
         <div className="recent-trades-section">
           <h3>Recent Trades</h3>
           <div className="loading-state">Loading...</div>
         </div>
       );
     }

     if (trades.length === 0) {
       return (
         <div className="recent-trades-section">
           <h3>Recent Trades (0)</h3>
           <div className="empty-state">
             <span className="empty-icon">📜</span>
             <p>No trades yet</p>
           </div>
         </div>
       );
     }

     return (
       <div className="recent-trades-section">
         <div className="section-header">
           <h3>Recent Trades ({trades.length})</h3>
           <button className="btn-view-all" onClick={() => window.location.href = '/portfolio'}>
             View All
           </button>
         </div>

         <div className="trades-table">
           <table>
             <thead>
               <tr>
                 <th>Time</th>
                 <th>Symbol</th>
                 <th>Quantity</th>
                 <th>Price</th>
                 <th>P&L</th>
               </tr>
             </thead>
             <tbody>
               {trades.map((trade, index) => (
                 <tr key={index}>
                   <td className="time-cell">
                     {new Date(trade.created_at).toLocaleTimeString()}
                   </td>
                   <td className="symbol-cell">{trade.symbol}</td>
                   <td>{trade.quantity.toFixed(8)}</td>
                   <td>${trade.price.toLocaleString()}</td>
                   <td className={trade.pnl >= 0 ? 'profit' : 'loss'}>
                     {trade.pnl >= 0 ? '+' : ''}{trade.pnl.toFixed(2)} USDT
                     <span className="pnl-percentage">
                       ({trade.pnl_percentage >= 0 ? '+' : ''}{trade.pnl_percentage.toFixed(2)}%)
                     </span>
                   </td>
                 </tr>
               ))}
             </tbody>
           </table>
         </div>
       </div>
     );
   };

   export default RecentTradesSection;
   ```

2. **Create CSS**
   ```css
   .recent-trades-section {
     background: rgba(255, 255, 255, 0.03);
     border: 1px solid rgba(255, 255, 255, 0.1);
     border-radius: 12px;
     padding: 16px;
   }

   .section-header {
     display: flex;
     justify-content: space-between;
     align-items: center;
     margin-bottom: 16px;
   }

   .section-header h3 {
     font-size: 16px;
     font-weight: 700;
     color: #fff;
     margin: 0;
   }

   .btn-view-all {
     padding: 6px 12px;
     background: rgba(14, 203, 129, 0.1);
     border: 1px solid rgba(14, 203, 129, 0.3);
     border-radius: 6px;
     color: #0ECB81;
     font-size: 12px;
     font-weight: 600;
     cursor: pointer;
   }

   .trades-table {
     overflow-x: auto;
   }

   .trades-table table {
     width: 100%;
     border-collapse: collapse;
   }

   .trades-table th {
     text-align: left;
     padding: 8px;
     font-size: 11px;
     font-weight: 600;
     color: #8d8d8d;
     text-transform: uppercase;
     letter-spacing: 0.5px;
     border-bottom: 1px solid rgba(255, 255, 255, 0.1);
   }

   .trades-table td {
     padding: 10px 8px;
     font-size: 13px;
     color: #fff;
     border-bottom: 1px solid rgba(255, 255, 255, 0.05);
   }

   .time-cell {
     color: #8d8d8d;
     font-size: 12px;
   }

   .symbol-cell {
     font-weight: 700;
   }

   .trades-table td.profit {
     color: #0ECB81;
     font-weight: 700;
   }

   .trades-table td.loss {
     color: #F6465D;
     font-weight: 700;
   }

   .pnl-percentage {
     font-size: 11px;
     margin-left: 4px;
   }
   ```

### Files cần tạo
- `src/components/PaperTrading/RecentTradesSection.jsx`
- `src/components/PaperTrading/RecentTradesSection.css`

### Verification Checklist
- [ ] Hiển thị 5-10 trades gần nhất
- [ ] P&L hiển thị chính xác với màu sắc đúng
- [ ] View All button navigates to portfolio page
- [ ] Table responsive trên mobile

---

## Bước 3: Integration vào Scanner Page

### Mục đích
Thêm Open Positions Widget và Recent Trades vào Scanner layout

### Công việc cần làm

1. **Update Scanner page layout**
   - File: `src/pages/Dashboard/Scanner/Scanner.jsx` hoặc `v2/ScannerV2.jsx`

   ```jsx
   import OpenPositionsWidget from '../../../components/PaperTrading/OpenPositionsWidget';
   import RecentTradesSection from '../../../components/PaperTrading/RecentTradesSection';

   const ScannerV2 = () => {
     const [paperTradingOpen, setPaperTradingOpen] = useState(false);
     const [selectedSymbol, setSelectedSymbol] = useState(null);

     const handleOpenPaperTrading = (symbol) => {
       setSelectedSymbol(symbol);
       setPaperTradingOpen(true);
     };

     return (
       <div className="scanner-page">
         {/* Main Scanner UI */}
         <div className="scanner-main">
           <ControlPanel />
           <ChartDisplay />
           <ResultsList onOpenPaperTrading={handleOpenPaperTrading} />
         </div>

         {/* Right Sidebar - Paper Trading Widgets */}
         <div className="scanner-sidebar">
           <OpenPositionsWidget onOpenPaperTrading={handleOpenPaperTrading} />
           <RecentTradesSection />
         </div>

         {/* Paper Trading Panel Modal */}
         {paperTradingOpen && (
           <PaperTradingPanel
             isOpen={paperTradingOpen}
             onClose={() => setPaperTradingOpen(false)}
             symbol={selectedSymbol}
           />
         )}
       </div>
     );
   };
   ```

2. **Update Scanner CSS for new layout**
   ```css
   .scanner-page {
     display: grid;
     grid-template-columns: 1fr 400px;
     gap: 20px;
     height: calc(100vh - 80px);
     padding: 20px;
   }

   .scanner-main {
     display: flex;
     flex-direction: column;
     gap: 20px;
     overflow-y: auto;
   }

   .scanner-sidebar {
     display: flex;
     flex-direction: column;
     gap: 20px;
     overflow-y: auto;
   }

   /* Mobile responsive */
   @media (max-width: 1024px) {
     .scanner-page {
       grid-template-columns: 1fr;
     }

     .scanner-sidebar {
       order: -1; /* Show sidebar first on mobile */
     }
   }
   ```

### Files cần sửa
- `src/pages/Dashboard/Scanner/v2/ScannerV2.jsx` - Add widgets
- `src/pages/Dashboard/Scanner/v2/ScannerV2.css` - Update layout

### Verification Checklist
- [ ] Open Positions Widget hiển thị bên phải Scanner
- [ ] Recent Trades hiển thị dưới Open Positions
- [ ] Layout responsive trên mobile
- [ ] Click "Manage" trong widget → opens Paper Trading Panel
- [ ] Click "Paper Trade" trong Results → opens Panel

---

## Bước 4: Close Position Functionality

### Mục đích
Implement backend logic để close positions

### Công việc cần làm

1. **Create closePosition function**
   - File: `src/services/paperTrading.js`

   ```javascript
   export const closePosition = async (holdingId, userId) => {
     console.log('🔴 [closePosition] Closing position:', holdingId);

     // Fetch holding details
     const { data: holding, error: fetchError } = await supabase
       .from('paper_trading_holdings')
       .select('*')
       .eq('id', holdingId)
       .eq('user_id', userId)
       .single();

     if (fetchError || !holding) {
       throw new Error('Position not found');
     }

     // Get current market price
     const priceResponse = await fetch(
       `https://api.binance.com/api/v3/ticker/price?symbol=${holding.symbol}`
     );
     const priceData = await priceResponse.json();
     const currentPrice = parseFloat(priceData.price);

     if (!currentPrice || currentPrice <= 0) {
       throw new Error('Unable to fetch current price');
     }

     // Execute SELL order to close position
     const result = await executeSell({
       userId: holding.user_id,
       accountId: holding.account_id,
       symbol: holding.symbol,
       price: currentPrice,
       quantity: holding.quantity,
       orderType: 'market',
     });

     if (!result.success) {
       throw new Error(result.error || 'Failed to close position');
     }

     console.log('✅ [closePosition] Position closed successfully');
     return { success: true };
   };
   ```

### Files cần sửa
- `src/services/paperTrading.js` - Add closePosition function

### Verification Checklist
- [ ] Click "Close Position" → confirmation dialog
- [ ] Confirm → position closes at market price
- [ ] SELL order created in database
- [ ] Holding removed from holdings table
- [ ] Balance updated correctly
- [ ] P&L calculated correctly

---

## Bước 5: Testing & Edge Cases

### Manual Testing Checklist

**Test 1: Open Positions Widget**
- [ ] Widget hiển thị all open positions
- [ ] P&L updates real-time khi price changes
- [ ] Refresh button reloads positions
- [ ] Empty state khi no positions

**Test 2: Recent Trades**
- [ ] Hiển thị last 5-10 closed trades
- [ ] P&L và P&L% hiển thị chính xác
- [ ] View All navigates to portfolio

**Test 3: Close Position**
- [ ] Click Close → confirmation dialog
- [ ] Confirm → position closes at market price
- [ ] Widget updates to remove closed position
- [ ] Balance increases correctly

**Test 4: Integration**
- [ ] Click "Manage" → opens Paper Trading Panel with correct symbol
- [ ] Close panel → widgets still visible
- [ ] Mobile responsive layout works

---

## Edge Cases & Error Handling

### Edge Cases

1. **Price Not Available**
   - Giải pháp: Show "Loading..." cho current price
   ```jsx
   {currentPrice > 0 ? `$${currentPrice}` : 'Loading...'}
   ```

2. **WebSocket Disconnect**
   - Giải pháp: Fallback to polling
   ```jsx
   useEffect(() => {
     const interval = setInterval(() => {
       // Fetch prices via REST if WebSocket down
     }, 5000);

     return () => clearInterval(interval);
   }, []);
   ```

3. **Close Position During High Volatility**
   - Giải pháp: Show slippage warning
   ```jsx
   if (Math.abs(currentPrice - holding.average_price) > holding.average_price * 0.05) {
     toast.warning('High volatility detected. Price may change rapidly.');
   }
   ```

### Error Handling

```jsx
const handleClosePosition = async (position) => {
  try {
    await closePosition(position.id, user.id);
    toast.success('Position closed');
    loadPositions();
  } catch (error) {
    console.error('Close position failed:', error);

    if (error.message.includes('Price')) {
      toast.error('Unable to fetch price. Try again.');
    } else if (error.message.includes('not found')) {
      toast.error('Position not found');
      loadPositions(); // Refresh
    } else {
      toast.error(`Failed: ${error.message}`);
    }
  }
};
```

---

## Completion Criteria

- [ ] Open Positions Widget hoạt động với real-time P&L
- [ ] Recent Trades Section hiển thị trades
- [ ] Close Position functionality works
- [ ] Integration vào Scanner hoàn chỉnh
- [ ] Mobile responsive
- [ ] All tests pass

---

## Next Steps

1. Cập nhật `plan.md` → Phase 05 Completed
2. Commit: `feat: complete phase-05 - scanner integration`
3. Chuyển sang `phase-06-polish-testing.md`
