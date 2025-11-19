# 🎯 Complete Binance-Style Paper Trading System

## Mục Tiêu

Xây dựng hệ thống Paper Trading hoàn chỉnh theo chuẩn Binance với đầy đủ tính năng giao dịch chuyên nghiệp, bao gồm nhiều loại lệnh, quản lý vị thế, và tích hợp UI/UX mượt mà.

## Tech Stack

- **Frontend**: React, Vite, CSS Modules
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **Real-time Data**: Binance WebSocket API
- **State Management**: React Context API
- **UI Components**: Custom components + Lucide icons
- **Notifications**: react-hot-toast

## Phạm Vi Công Việc

### Tính năng chính cần phát triển:

1. ✅ Fix critical bugs (input fields, toasts, entry price)
2. ✅ Database schema updates (order types, TP/SL, TIF)
3. ✅ Order type selector (Market/Limit/Stop Limit)
4. ✅ Advanced order features (TP/SL, Reduce-Only, TIF)
5. ✅ Scanner integration (Open Positions, Recent Trades)
6. ✅ UI/UX polish (loading states, animations, error handling)
7. ✅ Comprehensive testing & deployment

---

## Lộ Trình Thực Hiện

### Phase 01: Critical Fixes & Foundation
- **Thời lượng**: 2-3 giờ
- **Trạng thái**: ⏳ Pending
- **Tiến độ**: 0%
- **Deliverables**:
  - Input fields fully editable
  - Toast notifications working
  - Entry price saving correctly
  - Basic validation implemented
- **Files**: [phase-01-critical-fixes.md](./phase-01-critical-fixes.md)

### Phase 02: Database Schema & Backend Updates
- **Thời lượng**: 3-4 giờ
- **Trạng thái**: ⏳ Pending
- **Tiến độ**: 0%
- **Deliverables**:
  - Database schema updated with new fields
  - executeBuy/executeSell updated
  - TP/SL order creation logic implemented
  - Backend error handling robust
- **Files**: [phase-02-database-backend.md](./phase-02-database-backend.md)

### Phase 03: Order Types & Price Configuration
- **Thời lượng**: 4-5 giờ
- **Trạng thái**: ⏳ Pending
- **Tiến độ**: 0%
- **Deliverables**:
  - Order type tabs (Limit/Market/Stop Limit)
  - Price input for Limit orders
  - Quantity slider + percentage buttons
  - Cost calculation engine
- **Files**: [phase-03-order-types.md](./phase-03-order-types.md)

### Phase 04: Advanced Order Features
- **Thời lượng**: 4-5 giờ
- **Trạng thái**: ⏳ Pending
- **Tiến độ**: 0%
- **Deliverables**:
  - TP/SL checkboxes with price inputs
  - Reduce-Only functionality
  - TIF selector (GTC/IOC/FOK)
  - Fee calculation & display
- **Files**: [phase-04-advanced-features.md](./phase-04-advanced-features.md)

### Phase 05: Scanner Integration
- **Thời lượng**: 3-4 giờ
- **Trạng thái**: ⏳ Pending
- **Tiến độ**: 0%
- **Deliverables**:
  - Open Positions Widget
  - Recent Trades Section
  - Position close functionality
  - Real-time P&L updates
- **Files**: [phase-05-scanner-integration.md](./phase-05-scanner-integration.md)

### Phase 06: UI/UX Polish & Testing
- **Thời lượng**: 3-4 giờ
- **Trạng thái**: ⏳ Pending
- **Tiến độ**: 0%
- **Deliverables**:
  - Loading states & animations
  - Error states with retry logic
  - Comprehensive test suite
  - Bug fixes & edge case handling
- **Files**: [phase-06-polish-testing.md](./phase-06-polish-testing.md)

### Phase 07: Final Integration & Documentation
- **Thời lượng**: 2-3 giờ
- **Trạng thái**: ⏳ Pending
- **Tiến độ**: 0%
- **Deliverables**:
  - End-to-end integration testing
  - User documentation
  - Performance optimization
  - Deployment preparation
- **Files**: [phase-07-final-integration.md](./phase-07-final-integration.md)

---

## Hướng Dẫn Thực Thi

### Bắt Đầu

1. Đọc file `plan.md` này để nắm tổng quan
2. Mở file phase tương ứng (bắt đầu từ `phase-01-critical-fixes.md`)
3. Thực hiện từng bước trong phase theo đúng thứ tự
4. Cập nhật trạng thái và tiến độ vào `plan.md` sau mỗi phase
5. Commit code sau khi hoàn thành phase
6. Chuyển sang phase tiếp theo

### Quy Tắc

- ✅ **Hoàn thành phase hiện tại trước khi sang phase mới**
- ✅ **Cập nhật `plan.md` sau mỗi phase hoàn thành**
- ✅ **Test kỹ lưỡng trước khi chuyển phase**
- ✅ **Commit code với message rõ ràng: `feat: complete phase-0X - [tên phase]`**
- ✅ **Kiểm tra không có breaking changes với code hiện tại**
- ✅ **Verify HMR (Hot Module Replacement) hoạt động tốt**

### Khi Gặp Vấn Đề

- ⚠️ **Dừng lại và báo cáo vấn đề**
- ⚠️ **Không tự ý bỏ qua bước nào**
- ⚠️ **Đề xuất giải pháp thay thế nếu cần**
- ⚠️ **Ghi lại issues vào section "Known Issues" trong phase file**
- ⚠️ **Rollback nếu gặp critical bug không fix được ngay**

---

## Dependencies & Prerequisites

### Required Packages
```bash
npm install react-hot-toast  # Toast notifications
```

### Environment Setup
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### Database Access
- Supabase project: `pgfkbcnzqozzkohwbgbk`
- Schema: `public`
- Tables: `paper_trading_orders`, `paper_trading_holdings`, `paper_trading_accounts`

---

## Success Criteria

Dự án được coi là hoàn thành khi:

- [ ] Tất cả 7 phases đã hoàn thành
- [ ] Input fields hoạt động bình thường (không bị disabled)
- [ ] Toast notifications hiển thị sau mọi hành động
- [ ] Entry price được lưu chính xác vào database
- [ ] Order types (Market/Limit/Stop Limit) hoạt động đúng
- [ ] TP/SL orders được tạo và execute tự động
- [ ] Open Positions Widget hiển thị đầy đủ thông tin
- [ ] Recent Trades Section cập nhật real-time
- [ ] UI/UX mượt mà, không có lag hoặc errors
- [ ] Comprehensive tests đều pass
- [ ] Documentation đầy đủ và rõ ràng

---

## Notes

### Priority Order
1. 🔴 **CRITICAL**: Phase 01 (fix blocking bugs)
2. 🔴 **HIGH**: Phase 02 (database foundation)
3. 🟡 **MEDIUM**: Phase 03, 04 (core features)
4. 🟢 **LOW**: Phase 05, 06, 07 (enhancement & polish)

### Performance Targets
- Page load time: < 2s
- Trade execution time: < 1s
- WebSocket reconnect: < 3s
- UI response time: < 100ms

### Browser Support
- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions

---

**🎯 Bắt đầu với Phase 01 để fix các critical bugs ngay lập tức!**
