# Paper Trading Testing Checklist

**Last Updated:** 2025-01-20
**Project:** Binance-Style Paper Trading System
**Status:** Phase 06 Testing

---

## Phase 1: Basic Functionality

### Input Fields
- [ ] Quantity input editable
- [ ] Price inputs editable (Limit/Stop-Limit orders)
- [ ] TP/SL inputs editable
- [ ] Inputs accept decimal values
- [ ] Inputs validate min/max values
- [ ] Input focus works correctly
- [ ] No input field freezing

### Order Types
- [ ] Market order creates and executes immediately
- [ ] Limit order creates as pending
- [ ] Stop-limit order creates as pending
- [ ] Order type tabs switch correctly
- [ ] Conditional inputs show/hide based on order type
- [ ] All order types save to database correctly

### TP/SL (Take Profit / Stop Loss)
- [ ] TP checkbox toggles input field
- [ ] SL checkbox toggles input field
- [ ] TP/SL validation works (TP > entry for BUY, SL < entry for BUY)
- [ ] Quick % buttons set prices correctly (+2%, +5%, +10%, +20%)
- [ ] TP/SL orders created and linked to parent order
- [ ] TP execution cancels SL (OCO logic)
- [ ] SL execution cancels TP (OCO logic)

### Cost Calculation
- [ ] Cost updates when quantity changes
- [ ] Cost updates when price changes
- [ ] Fee calculates correctly (0.1% of cost)
- [ ] Total = Cost + Fee
- [ ] Warning displays when insufficient balance
- [ ] Real-time cost preview accurate

---

## Phase 2: Advanced Features

### Reduce-Only
- [ ] Checkbox toggles reduce-only state
- [ ] Info tooltip shows explanation
- [ ] Validation prevents opening new position when reduce-only enabled
- [ ] Works correctly with existing positions

### Time in Force (TIF)
- [ ] Dropdown shows 3 options (GTC, IOC, FOK)
- [ ] Selection updates order state
- [ ] Description text updates per selection
- [ ] TIF saves to database correctly

### Execute Button
- [ ] BUY button executes buy order
- [ ] SELL button executes sell order
- [ ] Loading spinner shows during execution
- [ ] Buttons disabled during loading
- [ ] Toast notification shows on success
- [ ] Toast shows error message on failure
- [ ] Button re-enables after execution completes

---

## Phase 3: Database & Backend

### Database Operations
- [ ] Orders save to `paper_trading_orders` table
- [ ] Holdings update in `paper_trading_holdings` table
- [ ] Balance deducted/added in `paper_trading_accounts` table
- [ ] TP/SL orders created with correct parent_order_id
- [ ] Linked orders have correct linked_order_type ('TP' or 'SL')
- [ ] Order status updates correctly (pending → filled)

### Order Monitor Service
- [ ] Pending limit orders execute when price reaches target
- [ ] Pending stop-limit orders trigger at stop price
- [ ] TP orders execute automatically
- [ ] SL orders execute automatically
- [ ] Linked orders cancel when parent executes (OCO)
- [ ] Order monitor runs continuously without crashes

---

## Phase 4: Scanner Integration

### Open Positions Widget
- [ ] Widget displays all open positions for logged-in user
- [ ] P&L calculates correctly: (current_price - entry_price) × quantity
- [ ] P&L % displays correctly
- [ ] Current price updates from WebSocket in real-time
- [ ] Close Position button works
- [ ] Close Position confirmation dialog shows
- [ ] Position closes at market price
- [ ] Position removed from widget after closing
- [ ] Manage button opens Paper Trading Panel
- [ ] Sort dropdown works (P&L, Symbol, Entry Price)

### Recent Trades Section
- [ ] Shows last 5-10 closed trades
- [ ] Trade displays: symbol, side, quantity, entry, exit, P&L
- [ ] Profit trades show in green
- [ ] Loss trades show in red
- [ ] Timestamps display correctly (e.g., "2h ago")
- [ ] "View All" button navigates to Portfolio page

### Auto-Refresh
- [ ] Positions refresh every 30 seconds automatically
- [ ] Manual refresh button works
- [ ] Refresh button shows loading spinner
- [ ] No infinite re-render loops
- [ ] WebSocket reconnects if disconnected

---

## Phase 5: UI/UX Polish

### Loading States
- [ ] Loading spinner shows during trade execution
- [ ] Skeleton loader displays while fetching price (if implemented)
- [ ] Loading states don't block user interaction
- [ ] Spinners animate smoothly

### Error States
- [ ] Error state shows when API call fails
- [ ] Retry button appears on errors
- [ ] Retry button triggers new request
- [ ] User-friendly error messages display
- [ ] ErrorBoundary catches React errors
- [ ] Error boundary shows fallback UI

### Animations
- [ ] Panel slides in smoothly (if implemented)
- [ ] Toasts animate in from right
- [ ] Buttons have press effect (:active scale)
- [ ] Cards elevate on hover
- [ ] Price changes flash color (green up, red down - if implemented)
- [ ] All animations smooth, no jank

---

## Phase 6: Edge Cases

### Data Validation
- [ ] Price = 0 → blocked or handled gracefully
- [ ] Quantity = 0 → blocked
- [ ] Balance = 0 → insufficient balance warning
- [ ] Negative values → rejected
- [ ] Very small quantities (8 decimals) → accepted
- [ ] Very large numbers → formatted correctly (e.g., 1,000,000.00)

### User Actions
- [ ] Multiple rapid clicks on BUY/SELL → debounced/prevented
- [ ] Concurrent trades → handled without race conditions
- [ ] User closes panel mid-execution → trade completes in background
- [ ] User refreshes page → state persists (positions, balance)
- [ ] Multiple tabs open → state syncs (optional)

### Network & Connectivity
- [ ] WebSocket disconnect → fallback to polling or manual refresh
- [ ] API timeout → error message with retry
- [ ] Network interruption → queued retry (optional)
- [ ] Slow connection → loading states show appropriately

---

## Phase 7: Cross-Browser Testing

- [ ] **Chrome** (latest version)
- [ ] **Firefox** (latest version)
- [ ] **Safari** (latest version - if on Mac)
- [ ] **Edge** (latest version)
- [ ] **Mobile Chrome** (responsive design)
- [ ] **Mobile Safari** (iOS - if available)

---

## Phase 8: Performance

### Speed Targets
- [ ] Page load time < 2 seconds
- [ ] Trade execution time < 1 second (from click to toast)
- [ ] WebSocket reconnect < 3 seconds
- [ ] UI response time < 100ms (input typing, button clicks)

### Resource Usage
- [ ] No memory leaks (check DevTools Memory tab)
- [ ] No console errors in production
- [ ] WebSocket connections properly closed on unmount
- [ ] No unnecessary re-renders (check React DevTools Profiler)

---

## Phase 9: Security & Access Control

- [ ] Users only see their own positions and trades
- [ ] Users can only close their own positions
- [ ] TIER1+ users can access TP/SL features
- [ ] FREE tier users see upgrade prompt for TP/SL
- [ ] Admin bypass works for testing (if applicable)
- [ ] No SQL injection vulnerabilities
- [ ] No XSS vulnerabilities

---

## Phase 10: Final QA Sign-Off

### Pre-Production Checklist
- [ ] All critical bugs fixed
- [ ] All medium bugs documented (if not fixed)
- [ ] User documentation complete
- [ ] Developer documentation complete
- [ ] Deployment checklist ready
- [ ] Rollback plan documented

### Sign-Off
- [ ] **Product Owner:** _____________________________ Date: ________
- [ ] **Lead Developer:** ___________________________ Date: ________
- [ ] **QA Tester:** ________________________________ Date: ________

---

## Known Issues

*(Document any known issues here)*

### Critical
- None

### High
- None

### Medium
- None

### Low
- None

---

## Test Results Summary

**Total Tests:** ____ / ____
**Pass Rate:** ____%
**Status:** ⏳ In Progress | ✅ Ready for Production

**Date Completed:** ____________
