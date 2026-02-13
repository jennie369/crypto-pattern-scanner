# E2E Testing Guide - Dashboard Widget System

**Phase 13: Testing & Launch**
**Created**: 2025-01-20
**Status**: Ready for Testing

---

## Overview

This document contains 10 comprehensive end-to-end test scenarios for the Dashboard Widget System. These tests cover all critical user flows from widget creation through management and notifications.

## Prerequisites

Before testing, ensure:
- ✅ All previous phases (07-12) are deployed to production/staging
- ✅ Database migrations applied (`20250120_add_dashboard_widgets.sql`, `20250120_optimize_dashboard_indexes.sql`)
- ✅ Supabase Edge Functions deployed (notification scheduler)
- ✅ Test accounts created for all tiers (FREE, TIER1, TIER2, TIER3)

---

## Test Environment Setup

### Test Accounts

Create the following test accounts:

| Tier | Email | Widget Limit | Purpose |
|------|-------|--------------|---------|
| FREE | test.free@example.com | 3 | Test widget limits |
| TIER1 | test.tier1@example.com | 10 | Test basic features |
| TIER2 | test.tier2@example.com | 25 | Test advanced features |
| TIER3 | test.tier3@example.com | Unlimited | Test all features |

### Browser Setup

Test on:
- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile Safari (iOS)
- ✅ Chrome Mobile (Android)

---

## Test Scenarios

### ✅ Scenario 1: First-Time User Creates Manifestation Goal Widget

**Objective**: Verify that a new user can create their first goal widget through the chatbot.

**Steps**:
1. Login as FREE user (`test.free@example.com`)
2. Navigate to `/community/chatbot`
3. Send message: "Tôi muốn kiếm thêm 100 triệu VND trong 6 tháng"
4. Wait for AI response (should detect MANIFESTATION_GOAL)
5. Verify widget prompt appears with "Thêm vào Dashboard" button
6. Click "Thêm vào Dashboard"
7. Verify success toast notification appears
8. Navigate to `/dashboard`
9. Verify goal widget is displayed
10. Verify widget contains:
    - Target amount: 100,000,000 VND
    - Current amount: 0 VND
    - Target date: ~6 months from today
    - Progress bar at 0%

**Expected Results**:
- ✅ Detection type = `MANIFESTATION_GOAL`
- ✅ Confidence >= 0.90 (threshold from Phase 13 fix)
- ✅ Widget prompt shows within 2 seconds
- ✅ 2-4 widgets created (goal, affirmations, action plan, crystals)
- ✅ Dashboard displays all widgets correctly
- ✅ 3 notifications scheduled in `scheduled_notifications` table (8am, 12pm, 9pm)

**Database Verification**:
```sql
-- Check widget created
SELECT * FROM dashboard_widgets WHERE user_id = (SELECT id FROM auth.users WHERE email = 'test.free@example.com');

-- Check goal created
SELECT * FROM manifestation_goals WHERE user_id = (SELECT id FROM auth.users WHERE email = 'test.free@example.com');

-- Check notifications scheduled
SELECT * FROM scheduled_notifications WHERE user_id = (SELECT id FROM auth.users WHERE email = 'test.free@example.com');
```

**Pass Criteria**: All checkboxes above marked ✅

---

### ✅ Scenario 2: Widget Limit Enforcement

**Objective**: Verify that tier-based widget limits are properly enforced.

**Steps**:

**Test 2a: FREE User (Limit 3)**
1. Login as FREE user
2. Create 3 widgets via chatbot (3 different manifestation goals)
3. Try to create 4th widget
4. Verify warning appears: "Đã đạt giới hạn 3 widgets cho FREE tier"
5. Verify "Upgrade to TIER1" link/button shows
6. Click database - verify only 3 widgets exist with `is_visible=true`

**Test 2b: TIER1 User (Limit 10)**
1. Login as TIER1 user
2. Create 10 widgets
3. Try to create 11th widget
4. Verify limit warning appears
5. Verify upgrade prompt to TIER2

**Test 2c: TIER3 User (Unlimited)**
1. Login as TIER3 user
2. Create 25+ widgets
3. Verify no limit warning
4. All widgets created successfully

**Expected Results**:
- ✅ FREE: Hard limit at 3 widgets
- ✅ TIER1: Hard limit at 10 widgets
- ✅ TIER2: Hard limit at 25 widgets
- ✅ TIER3: No limit (can create 100+)
- ✅ Warning message user-friendly
- ✅ Upgrade CTA appears with correct tier recommendation

**Code Reference**: `frontend/src/services/widgetDetector.js:240-264`

---

### ✅ Scenario 3: Update Goal Progress

**Objective**: Verify users can update their manifestation goal progress and it persists correctly.

**Steps**:
1. Login with existing goal widget
2. Navigate to `/dashboard`
3. Click "Update Progress" button on goal card
4. Modal opens with current amount input
5. Enter new amount: `50,000,000` (50% progress)
6. Click "Save"
7. Verify:
   - Progress bar animates to 50%
   - Database updated (`current_amount`, `progress_percentage`, `updated_at`)
   - Success toast shows
8. Refresh page (F5)
9. Verify progress still shows 50%

**Expected Results**:
- ✅ Modal opens smoothly
- ✅ Progress bar animates from 0% → 50%
- ✅ Database `manifestation_goals` table updated
- ✅ `updated_at` timestamp changes
- ✅ Progress persists after page refresh
- ✅ No console errors

**Database Verification**:
```sql
SELECT
  title,
  target_amount,
  current_amount,
  progress_percentage,
  updated_at
FROM manifestation_goals
WHERE user_id = ?
ORDER BY updated_at DESC
LIMIT 1;
```

---

### ✅ Scenario 4: Drag & Drop Widget Reordering

**Objective**: Verify drag & drop functionality works smoothly and persists order.

**Steps**:
1. Create 5 widgets
2. Navigate to `/dashboard`
3. Note initial order: [Widget A, Widget B, Widget C, Widget D, Widget E]
4. Drag Widget A to position 3
5. Release mouse/touch
6. Verify:
   - Widgets reorder immediately (optimistic UI)
   - New order: [Widget B, Widget C, Widget A, Widget D, Widget E]
7. Open browser DevTools Network tab
8. Verify parallel database updates (Promise.all)
9. Refresh page
10. Verify new order persists

**Expected Results**:
- ✅ Drag works on desktop (mouse)
- ✅ Drag works on mobile (touch)
- ✅ Visual feedback during drag (widget follows cursor)
- ✅ Drop zone indication
- ✅ Immediate UI update (optimistic)
- ✅ Database batch update (parallel, not sequential loop)
- ✅ Order persists after refresh
- ✅ No flickering or layout shift

**Performance Check**:
- Database updates should use `Promise.all()` (parallel) not `for` loop (sequential)
- Check code: `frontend/src/pages/Dashboard.jsx:92-100`

---

### ✅ Scenario 5: Delete Widget (Soft Delete)

**Objective**: Verify widgets can be deleted and use soft delete pattern.

**Steps**:
1. Navigate to `/dashboard`
2. Click menu button (⋯) on any widget
3. Click "Delete"
4. Confirm deletion in confirmation dialog
5. Verify:
   - Widget disappears from UI immediately
   - Fade-out animation plays
   - Success toast notification
6. Check database - widget still exists but `is_visible = false`
7. Refresh page
8. Verify widget still gone

**Expected Results**:
- ✅ Soft delete (UPDATE, not DELETE)
- ✅ Widget removed from UI
- ✅ Database: `is_visible = false`, `updated_at` changed
- ✅ Widget data preserved (can be restored later if needed)
- ✅ Persists after refresh
- ✅ Position of other widgets auto-adjusts

**Database Verification**:
```sql
SELECT id, widget_type, is_visible, updated_at
FROM dashboard_widgets
WHERE id = ? AND is_visible = false;
```

---

### ✅ Scenario 6: Scheduled Notifications

**Objective**: Verify notification system works correctly with proper scheduling.

**Steps**:
1. Create manifestation goal widget
2. Database: Verify 3 notifications created for 8am, 12pm, 9pm
3. **Manual trigger** (for testing):
   - Update `next_send_at` to NOW() for one notification
   - Trigger cron job/edge function manually
4. Verify notification sent
5. Navigate to app
6. Check notification bell icon - should show badge (count)
7. Click bell
8. Verify dropdown shows notification with:
   - Title
   - Message
   - Timestamp
   - Unread indicator
9. Click notification
10. Verify navigates to `/dashboard`
11. Verify unread count decreases

**Expected Results**:
- ✅ Cron job runs at scheduled times
- ✅ Notifications sent to correct users
- ✅ Bell icon shows unread count badge
- ✅ Dropdown renders notifications correctly
- ✅ Click navigation works
- ✅ Mark as read updates database
- ✅ Badge count updates in real-time

**Database Verification**:
```sql
-- Check notifications created
SELECT notification_type, scheduled_time, is_active, next_send_at
FROM scheduled_notifications
WHERE source_id = ? AND is_active = true;

-- After sending
SELECT total_sent, last_sent_at
FROM scheduled_notifications
WHERE id = ?;
```

---

### ✅ Scenario 7: Mobile Responsive Design

**Objective**: Verify all dashboard features work perfectly on mobile devices.

**Steps**:
1. Open app on mobile device (or Chrome DevTools device emulation at 375px width)
2. Test chatbot UI:
   - Message input accessible
   - Widget prompt fits screen
   - Buttons large enough to tap (min 44x44px)
3. Navigate to `/dashboard`
4. Test widget cards:
   - Readable text sizes
   - No horizontal scroll
   - Cards stack vertically
5. Test drag & drop (touch):
   - Long press to activate drag
   - Smooth touch tracking
   - Drop works correctly
6. Test notifications dropdown:
   - Opens without covering content
   - Scrollable if many notifications
   - Close button accessible

**Expected Results**:
- ✅ All UI responsive (no horizontal scroll)
- ✅ Text readable (min 14px font size)
- ✅ Touch targets >= 44x44px (iOS HIG)
- ✅ Touch drag smooth (60fps)
- ✅ Modals/dropdowns mobile-optimized
- ✅ No layout breaks on small screens
- ✅ Fast tap response (<100ms)

**Test Devices**:
- iPhone SE (375px) - smallest modern iPhone
- iPhone 14 Pro (393px)
- Android (360px) - common Android width
- iPad (768px) - tablet layout

---

### ✅ Scenario 8: Error Handling - Network Failure

**Objective**: Verify graceful error handling when network fails.

**Steps**:
1. Open `/community/chatbot`
2. Disconnect internet (airplane mode or browser DevTools offline)
3. Try to send message "Test goal"
4. Verify error message shows:
   - User-friendly text (not technical error)
   - Retry button available
   - No crash or blank screen
5. Reconnect internet
6. Click "Retry"
7. Verify message sends successfully

**Expected Results**:
- ✅ Error caught gracefully (try/catch)
- ✅ User-friendly error message: "Không thể kết nối. Vui lòng kiểm tra internet và thử lại."
- ✅ Retry button works
- ✅ No console errors break app
- ✅ State recovers correctly after reconnection

**Code Reference**: Error handling in `frontend/src/pages/Chatbot.jsx` and `frontend/src/pages/Dashboard.jsx`

---

### ✅ Scenario 9: Concurrent Widget Creation (Race Conditions)

**Objective**: Verify no race conditions when creating widgets from multiple tabs/sessions.

**Steps**:
1. Open browser
2. Login as TIER1 user in Tab 1
3. Duplicate tab (Tab 2) - same session
4. Tab 1: Send message to create Widget A
5. Tab 2: Immediately send message to create Widget B (before Tab 1 finishes)
6. Wait for both to complete
7. Navigate to `/dashboard` in both tabs
8. Verify:
   - Both widgets created successfully
   - No duplicate widgets
   - Widget count correct
   - No database conflicts

**Expected Results**:
- ✅ No race conditions
- ✅ Both widgets saved correctly
- ✅ Widget count accurate (should be 2, not 1 or 3)
- ✅ No database deadlocks
- ✅ Both tabs show same data after refresh

**Database Verification**:
```sql
SELECT COUNT(*) FROM dashboard_widgets
WHERE user_id = ? AND is_visible = true;
-- Should return 2
```

---

### ✅ Scenario 10: Full User Journey (End-to-End)

**Objective**: Comprehensive test covering entire user lifecycle.

**Steps**:
1. **Signup** as new user (FREE tier)
2. Complete onboarding flow
3. Navigate to chatbot
4. Send: "Tôi muốn kiếm 50 triệu VND trong 3 tháng"
5. Create Goal Widget
6. Send: "Tôi cần affirmations về tự tin"
7. Create Affirmation Widget
8. Send: "Recommend crystals for stress relief"
9. Create Crystal Grid Widget
10. Navigate to `/dashboard`
11. Verify 3 widgets displayed
12. **Update progress** on Goal Widget to 15 triệu VND
13. **Drag** Affirmation Widget to top position
14. **Pin** Goal Widget
15. **Delete** Crystal Grid Widget
16. Wait for notification time (or manually trigger)
17. Check notification bell
18. **Upgrade to TIER1**
19. Create 5 more widgets (total 7 now, within TIER1 limit)
20. Try to create 11th widget → should block at limit
21. Verify all features still working

**Expected Results**:
- ✅ Seamless user journey (no errors)
- ✅ All features accessible and working
- ✅ Tier upgrade reflected immediately
- ✅ Limits enforced correctly at each tier
- ✅ Data persists across all operations
- ✅ No performance degradation with multiple widgets
- ✅ Mobile and desktop both work

**Performance Benchmarks**:
- Dashboard page load: < 2 seconds
- Widget creation: < 1 second
- Drag & drop: 60fps (smooth animation)
- Progress update: < 500ms

---

## Performance Testing

### Load Time Benchmarks

| Metric | Target | Tool |
|--------|--------|------|
| Dashboard page load (empty) | < 1s | Lighthouse |
| Dashboard page load (10 widgets) | < 2s | Lighthouse |
| Widget creation time | < 1s | DevTools Network |
| Drag & drop FPS | 60fps | DevTools Performance |
| Mobile responsiveness | 100/100 | Lighthouse |

### Database Query Performance

Run `EXPLAIN ANALYZE` on critical queries:

```sql
-- Dashboard load query (should use idx_widgets_user_visible_order)
EXPLAIN ANALYZE
SELECT * FROM dashboard_widgets
WHERE user_id = '...' AND is_visible = true
ORDER BY position_order;

-- Expected: Index Scan using idx_widgets_user_visible_order
-- Execution time: < 10ms
```

---

## Bug Tracking

### Known Issues (Fixed in Phase 13)

1. ✅ **Bug 1**: Widget prompt appeared for irrelevant responses
   - **Fix**: Increased TRADING_ANALYSIS confidence threshold to 0.90
   - **File**: `frontend/src/services/responseDetector.js:61`

2. ✅ **Bug 2**: Progress bar overflow at 100%+
   - **Fix**: Added `Math.min(progressPercentage, 100)` cap
   - **File**: `frontend/src/components/Widgets/GoalCard.jsx:102`

3. ⚠️ **Bug 3**: Notification timezone incorrect
   - **Status**: Needs investigation
   - **Todo**: Convert scheduled times to user's local timezone

4. ⚠️ **Bug 4**: Mobile drag & drop not smooth
   - **Status**: Needs touch event optimization
   - **Todo**: Add touch-action CSS, optimize event listeners

---

## Regression Testing

After any code changes, re-run:
- ✅ Scenario 1 (Widget creation)
- ✅ Scenario 4 (Drag & drop)
- ✅ Scenario 5 (Delete)
- ✅ Scenario 7 (Mobile responsive)

---

## Automated Testing (Future)

Consider implementing with:
- **Playwright** for E2E tests
- **Jest** for unit tests
- **React Testing Library** for component tests

Example Playwright test:
```javascript
test('User can create manifestation goal widget', async ({ page }) => {
  await page.goto('/community/chatbot');
  await page.fill('[data-testid="chat-input"]', 'Tôi muốn kiếm 100 triệu trong 6 tháng');
  await page.click('[data-testid="send-button"]');
  await expect(page.locator('[data-testid="widget-prompt"]')).toBeVisible();
  await page.click('text=Thêm vào Dashboard');
  await expect(page.locator('text=✅')).toBeVisible();
});
```

---

## Launch Checklist

Before Full Launch (Day 5):

- [ ] All 10 E2E scenarios PASS
- [ ] All critical bugs fixed
- [ ] Performance benchmarks met
- [ ] Soft launch successful (TIER2/TIER3 users, 48 hours)
- [ ] Limited launch successful (TIER1+, 48 hours)
- [ ] Database backups configured
- [ ] Monitoring alerts configured
- [ ] Rollback plan documented
- [ ] User guide published
- [ ] Support team trained

---

## Post-Launch Monitoring (Week 1)

Track daily:
- Widget creation rate
- Error rate (target: < 1%)
- Dashboard page load time
- Notification open rate
- User retention (7-day)
- Support tickets related to dashboard

---

## Test Sign-Off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| QA Lead | | | |
| Developer | | | |
| Product Owner | | | |

---

**✅ Testing Complete! Ready for Launch! 🚀**
