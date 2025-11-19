# 📊 INTERACTIVE DASHBOARD - Implementation Plan

**Version:** 1.0
**Ngày tạo:** 2025-01-20
**Mục tiêu:** Biến AI chat responses thành actionable dashboard widgets
**Timeline:** 8 tuần (Phase 07-13)
**Nguyên tắc:** User không biết đang dùng AI, chỉ thấy GEM Platform features

---

## 📋 TÓM TẮT EXECUTIVE

### Vấn Đề
- ❌ Chatbot chỉ trả text responses
- ❌ User đọc xong → quên mất
- ❌ Không track được progress
- ❌ Low retention

### Giải Pháp
✅ Biến AI responses thành **interactive widgets** trên Dashboard
✅ Auto-create goal cards, affirmation widgets, action checklists
✅ Daily notifications tự động
✅ Progress tracking

### Expected Impact
- 📈 Engagement: +80%
- 📈 Retention: +65%
- 📈 Conversions: +40%

---

## 🎯 TECH STACK

**Giữ nguyên từ chatbot (Phase 01-06):**
- React 19 + Vite
- Supabase (PostgreSQL + Edge Functions)
- components-v2 library
- Glassmorphism design

**Thêm mới:**
- react-beautiful-dnd (drag & drop)
- Notification service

---

## 🗂️ LỘ TRÌNH 7 PHASES

### Phase 07: Smart Detection System
**Thời lượng:** 3-4 ngày (Week 1)
**Trạng thái:** ✅ Completed
**Tiến độ:** 100%
**Dependencies:** Phase 01-06 (Chatbot cơ bản)

**Deliverables:**
- [x] ResponseDetector service (7 response types)
- [x] DataExtractor service
- [x] System prompt updates
- [x] Integration tests

**Files:** [phase-07-smart-detection.md](./phase-07-smart-detection.md)

---

### Phase 08: Widget Factory & Database
**Thời lượng:** 4-5 ngày (Week 2)
**Trạng thái:** ✅ Completed
**Tiến độ:** 100%
**Dependencies:** Phase 07

**Deliverables:**
- [x] 3 database tables
- [x] WidgetFactory service
- [x] RLS policies
- [x] Tier-based limits

**Files:** [phase-08-widget-factory-database.md](./phase-08-widget-factory-database.md)

---

### Phase 09: Chat Integration
**Thời lượng:** 3-4 ngày (Week 3)
**Trạng thái:** ⏳ Pending
**Tiến độ:** 0%
**Dependencies:** Phase 07, 08

**Deliverables:**
- [ ] Update Chatbot.jsx
- [ ] Widget prompt UI
- [ ] Add to dashboard flow

**Files:** [phase-09-chat-integration.md](./phase-09-chat-integration.md)

---

### Phase 10: Widget Preview System
**Thời lượng:** 4-5 ngày (Week 4)
**Trạng thái:** ⏳ Pending
**Tiến độ:** 0%
**Dependencies:** Phase 09

**Deliverables:**
- [ ] WidgetPreviewModal
- [ ] 5 widget components
- [ ] Customization UI

**Files:** [phase-10-widget-preview.md](./phase-10-widget-preview.md)

---

### Phase 11: Dashboard Page
**Thời lượng:** 4-5 ngày (Week 5)
**Trạng thái:** ⏳ Pending
**Tiến độ:** 0%
**Dependencies:** Phase 10

**Deliverables:**
- [ ] Dashboard page layout
- [ ] Drag & drop
- [ ] Widget rendering
- [ ] Empty state

**Files:** [phase-11-dashboard-page.md](./phase-11-dashboard-page.md)

---

### Phase 12: Interactions & Notifications
**Thời lượng:** 5-6 ngày (Week 6-7)
**Trạng thái:** ⏳ Pending
**Tiến độ:** 0%
**Dependencies:** Phase 11

**Deliverables:**
- [ ] Widget CRUD operations
- [ ] Notification service
- [ ] Notification UI
- [ ] Daily reminders

**Files:** [phase-12-interactions-notifications.md](./phase-12-interactions-notifications.md)

---

### Phase 13: Testing & Launch
**Thời lượng:** 4-5 ngày (Week 8)
**Trạng thái:** ⏳ Pending
**Tiến độ:** 0%
**Dependencies:** All phases

**Deliverables:**
- [ ] E2E testing (10 scenarios)
- [ ] Bug fixes
- [ ] Performance optimization
- [ ] Soft launch → Full launch

**Files:** [phase-13-testing-launch.md](./phase-13-testing-launch.md)

---

## 📊 TIMELINE SUMMARY

| Phase | Days | Week | Cumulative |
|-------|------|------|------------|
| Phase 07 | 3-4 | Week 1 | Day 1-4 |
| Phase 08 | 4-5 | Week 2 | Day 5-9 |
| Phase 09 | 3-4 | Week 3 | Day 10-13 |
| Phase 10 | 4-5 | Week 4 | Day 14-18 |
| Phase 11 | 4-5 | Week 5 | Day 19-23 |
| Phase 12 | 5-6 | Week 6-7 | Day 24-29 |
| Phase 13 | 4-5 | Week 8 | Day 30-34 |
| **Total** | **27-33 days** | **~5-7 weeks** | **~8 weeks** |

---

## 💾 DATABASE IMPACT

### Thêm 3 Tables Mới
1. `dashboard_widgets` - Widget instances
2. `manifestation_goals` - Goal details & progress
3. `scheduled_notifications` - Reminder schedules

### Không Thay Đổi
- ✅ `users` table
- ✅ `chatbot_history` table
- ✅ Tier structure (FREE, TIER1, TIER2, TIER3)
- ✅ Quota limits (5/15/50/unlimited)

---

## 🔒 TIER LIMITS

```javascript
const WIDGET_LIMITS = {
  FREE: { maxWidgets: 3, maxGoals: 1, hasReminders: false },
  TIER1: { maxWidgets: 10, maxGoals: 3, hasReminders: true },
  TIER2: { maxWidgets: 25, maxGoals: 10, hasReminders: true },
  TIER3: { maxWidgets: -1, maxGoals: -1, hasReminders: true, advancedFeatures: true }
};
```

---

## ✅ EXECUTION GUIDELINES

### Quy Tắc Thực Thi
1. **Hoàn thành tuần tự:** Phase 07 → 08 → ... → 13
2. **Cập nhật plan.md:** Sau mỗi phase, mark ✅
3. **Test kỹ:** Mỗi phase phải pass verification
4. **Commit:** `feat: complete phase-XX - [description]`
5. **Hỏi review:** Trước khi sang phase mới

### Tiêu Chí Hoàn Thành Phase
- ✅ Tất cả deliverables đã tạo
- ✅ Verification checklist pass 100%
- ✅ Không breaking changes với chatbot
- ✅ Tests pass
- ✅ Code formatted

### Khi Gặp Vấn Đề
1. Dừng lại ngay
2. Document blocker
3. Hỏi user
4. Đề xuất giải pháp thay thế
5. Chờ approval

---

## 📈 SUCCESS METRICS

### Track Weekly
- Widgets created per user
- Dashboard page views
- Widget interactions
- Notification open rate
- Goal completion rate

### Target (Month 3)
- 60% users create ≥1 widget
- 40% users check dashboard daily
- 70% notification open rate
- 25% goal completion rate

---

## 🚀 LAUNCH STRATEGY

### Soft Launch (Week 8 Day 5)
- TIER2+ only (20 users)
- Monitor 48 hours
- Fix critical bugs

### Limited Launch (Week 9)
- TIER1+ (70 users)
- Collect feedback

### Full Launch (Week 10)
- All users (FREE included)
- Marketing push

---

**Status:** ✅ Phase 08 Completed - Ready for Phase 09
**Next Action:** Open `phase-09-chat-integration.md` and start implementation
**Last Updated:** 2025-01-20

---

**Let's build! 🚀💎**
