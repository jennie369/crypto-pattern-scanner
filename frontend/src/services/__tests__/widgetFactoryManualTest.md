# WidgetFactory Manual Testing Guide

## Phase 08: Widget Factory & Database Testing

### Prerequisites
- ✅ Database migration deployed (3 tables created)
- ✅ WidgetFactory service created
- ✅ Supabase client configured

---

## Test 1: Manifestation Goal Package Creation

### Test Data
```javascript
const testUserId = 'your-test-user-id';

const manifestationResponse = `
🎯 MỤC TIÊU: Kiếm thêm 100 triệu VND passive income trong 6 tháng

💰 Target: 100 triệu VND
📅 Timeline: 6 tháng

✨ AFFIRMATIONS (Daily):
✨ "Tôi xứng đáng với 100 triệu passive income mỗi tháng"
✨ "Tiền bạc chảy vào cuộc đời tôi một cách dễ dàng"
✨ "Tôi thu hút những cơ hội kiếm tiền liên tục"

📋 ACTION PLAN:
Week 1: Research & Foundation
• Nghiên cứu 5 passive income models
• Chọn 2 models phù hợp

Week 2: Implementation
• Launch first income stream
• Create content calendar

💎 CRYSTALS:
• Citrine - Attracts wealth
• Pyrite - Manifestation of abundance
`;

const detectionResult = {
  type: 'manifestation_goal',
  confidence: 0.95,
  extractedData: null
};
```

### Test Steps
```javascript
import { WidgetFactory } from '../widgetFactory';
import { ResponseDetector } from '../responseDetector';
import { DataExtractor } from '../dataExtractor';

async function testManifestationPackage() {
  // 1. Detect response type
  const detector = new ResponseDetector();
  const detection = detector.detect(manifestationResponse);

  console.log('Detection:', detection);

  // 2. Create widgets
  const result = await WidgetFactory.createFromAIResponse(
    testUserId,
    manifestationResponse,
    detection
  );

  console.log('Creation Result:', result);

  // Expected:
  // ✅ 1 goal created in manifestation_goals
  // ✅ 4 widgets created (GOAL_CARD, AFFIRMATION_CARD, ACTION_PLAN, CRYSTAL_GRID)
  // ✅ 3 notifications created

  return result;
}
```

### Verification Queries

Run these in Supabase SQL Editor:

```sql
-- Check goal created
SELECT * FROM manifestation_goals
WHERE user_id = 'your-test-user-id'
ORDER BY created_at DESC LIMIT 1;

-- Check widgets created
SELECT id, widget_type, widget_size, position_order, created_from
FROM dashboard_widgets
WHERE user_id = 'your-test-user-id'
ORDER BY position_order;

-- Check notifications created
SELECT id, notification_type, scheduled_time, title
FROM scheduled_notifications
WHERE user_id = 'your-test-user-id'
ORDER BY scheduled_time;

-- Check widget count for limit testing
SELECT COUNT(*) as widget_count
FROM dashboard_widgets
WHERE user_id = 'your-test-user-id' AND is_visible = true;
```

### Expected Results
- ✅ 1 manifestation_goal record
- ✅ 4 dashboard_widgets records
- ✅ 3 scheduled_notifications records
- ✅ All widgets have correct widget_type
- ✅ All widgets linked to goal (linked_goal_id)
- ✅ widget_data contains expected fields

---

## Test 2: Crystal Recommendation Widget

### Test Data
```javascript
const crystalResponse = `
💎 CRYSTAL RECOMMENDATIONS:
• Amethyst - Calms mind, reduces anxiety
• Rose Quartz - Opens heart chakra
• Black Tourmaline - Grounds energy
`;

const detectionResult = {
  type: 'crystal_recommendation',
  confidence: 0.92,
  extractedData: null
};
```

### Test Steps
```javascript
async function testCrystalWidget() {
  const result = await WidgetFactory.createFromAIResponse(
    testUserId,
    crystalResponse,
    detectionResult
  );

  console.log('Crystal Widget:', result);

  // Expected:
  // ✅ 1 CRYSTAL_GRID widget created
  // ✅ widget_data.crystals array has 3 items

  return result;
}
```

---

## Test 3: Tier Limits Enforcement

### Test FREE User Limits
```javascript
async function testFreeTierLimits() {
  // FREE user: maxWidgets = 3, maxGoals = 1

  const widgetCheck = await WidgetFactory.checkWidgetLimit(testUserId, 'FREE');
  console.log('Widget Limit Check:', widgetCheck);
  // Expected: { canCreate: true/false, limit: 3, current: X }

  const goalCheck = await WidgetFactory.checkGoalLimit(testUserId, 'FREE');
  console.log('Goal Limit Check:', goalCheck);
  // Expected: { canCreate: true/false, limit: 1, current: X }
}
```

### Test TIER1 User Limits
```javascript
async function testTier1Limits() {
  // TIER1: maxWidgets = 10, maxGoals = 3

  const widgetCheck = await WidgetFactory.checkWidgetLimit(testUserId, 'TIER1');
  const goalCheck = await WidgetFactory.checkGoalLimit(testUserId, 'TIER1');

  console.log('TIER1 Limits:', { widgetCheck, goalCheck });
}
```

### Test TIER3 Unlimited
```javascript
async function testTier3Unlimited() {
  // TIER3: maxWidgets = -1 (unlimited), maxGoals = -1

  const widgetCheck = await WidgetFactory.checkWidgetLimit(testUserId, 'TIER3');
  const goalCheck = await WidgetFactory.checkGoalLimit(testUserId, 'TIER3');

  console.log('TIER3 Limits:', { widgetCheck, goalCheck });
  // Expected: { canCreate: true, limit: -1, current: X }
}
```

---

## Test 4: Error Handling

### Test Invalid Data
```javascript
async function testErrorHandling() {
  // 1. Test with missing required fields
  const incompleteData = {
    goalTitle: null,
    targetAmount: null
  };

  // 2. Test with low confidence
  const lowConfidenceResult = {
    type: 'manifestation_goal',
    confidence: 0.60 // Below 0.85 threshold
  };

  const result = await WidgetFactory.createFromAIResponse(
    testUserId,
    manifestationResponse,
    lowConfidenceResult
  );

  console.log('Low Confidence Result:', result);
  // Expected: { success: false, message: 'Confidence too low...' }
}
```

---

## Test 5: Database Integrity

### Test RLS Policies
```javascript
// Test that users can only access their own data
// 1. Create widget as User A
// 2. Try to read as User B (should fail)
// 3. Try to update as User B (should fail)
// 4. Try to delete as User B (should fail)
```

### Test Foreign Key Constraints
```sql
-- Test widget deletion cascades properly
DELETE FROM manifestation_goals WHERE id = 'goal-uuid';

-- Check that linked widgets are also deleted
SELECT COUNT(*) FROM dashboard_widgets WHERE linked_goal_id = 'goal-uuid';
-- Expected: 0
```

---

## Test 6: Widget Data Structure

### Verify GOAL_CARD widget_data
```javascript
{
  title: "Kiếm thêm 100 triệu VND",
  targetAmount: 100000000,
  currentAmount: 0,
  progress: 0,
  targetDate: "2025-07-20",
  category: "FINANCIAL"
}
```

### Verify AFFIRMATION_CARD widget_data
```javascript
{
  affirmations: ["Affirmation 1", "Affirmation 2", ...],
  currentIndex: 0,
  completedToday: 0,
  streak: 0,
  lastCompletedDate: null
}
```

### Verify ACTION_PLAN widget_data
```javascript
{
  steps: [
    { week: 1, tasks: ["Task 1", "Task 2"] },
    { week: 2, tasks: ["Task 3"] }
  ],
  completedTasks: [],
  totalTasks: 3,
  currentWeek: 1
}
```

### Verify CRYSTAL_GRID widget_data
```javascript
{
  crystals: ["Citrine - Purpose", "Rose Quartz - Purpose"],
  lastCleansed: null,
  nextCleanse: "2025-02-18"
}
```

---

## Completion Checklist

Phase 08 testing is complete when:

- [ ] Manifestation package creates 4 widgets + 1 goal + 3 notifications
- [ ] Crystal widget creates correctly
- [ ] Affirmation widget creates correctly
- [ ] Trading analysis widget creates correctly
- [ ] Tier limits are enforced (FREE: 3 widgets, 1 goal)
- [ ] RLS policies prevent cross-user access
- [ ] widget_data structure matches specs
- [ ] Notifications have correct scheduled_time
- [ ] Target dates calculate correctly
- [ ] Categories detect correctly
- [ ] Error handling works (low confidence, invalid data)
- [ ] No SQL errors in Supabase logs

---

## Troubleshooting

### Common Issues

1. **"Table does not exist"**
   - Solution: Run migration SQL in Supabase dashboard

2. **"RLS policy violation"**
   - Solution: Check auth.uid() matches user_id

3. **"Type widget_type does not exist"**
   - Solution: ENUMs not created, re-run migration

4. **"Foreign key violation"**
   - Solution: Ensure user_id exists in auth.users

5. **Widgets not appearing**
   - Solution: Check is_visible = true

---

**Created:** 2025-01-20
**Phase:** 08 - Widget Factory & Database
**Status:** Ready for Testing
