# Phase 08: Widget Factory & Database

## Thông Tin Phase
- **Thời lượng ước tính:** 4-5 ngày
- **Trạng thái:** ⏳ Pending
- **Tiến độ:** 0%
- **Phụ thuộc:** Phase 07 (Smart Detection System)

## Mục Tiêu
Xây dựng database schema và WidgetFactory service để tạo và quản lý dashboard widgets từ AI responses.

## Deliverables
- [ ] 3 database tables với RLS policies
- [ ] Database migration file
- [ ] WidgetFactory service
- [ ] Tier-based widget limits
- [ ] Helper functions

---

## Bước 1: Tạo Database Schema

### Mục đích
Tạo 3 tables: dashboard_widgets, manifestation_goals, scheduled_notifications với đầy đủ indexes và RLS policies.

### Công việc cần làm

1. **Tạo migration file**

```sql
-- File: supabase/migrations/20250120_add_widgets.sql

-- ============================================
-- DASHBOARD WIDGETS SYSTEM
-- ============================================

-- Widget Types
CREATE TYPE widget_type AS ENUM (
  'GOAL_CARD',
  'AFFIRMATION_CARD',
  'CRYSTAL_GRID',
  'ACTION_PLAN',
  'TRADING_ANALYSIS',
  'STATS_WIDGET'
);

-- Widget Size
CREATE TYPE widget_size AS ENUM ('SMALL', 'MEDIUM', 'LARGE', 'FULL');

-- Main widgets table
CREATE TABLE IF NOT EXISTS dashboard_widgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Widget info
  widget_type widget_type NOT NULL,
  widget_size widget_size DEFAULT 'MEDIUM',

  -- Linked data
  linked_goal_id UUID,
  linked_chat_message_id UUID REFERENCES chatbot_history(id),

  -- Widget data (stored as JSONB for flexibility)
  widget_data JSONB NOT NULL DEFAULT '{}',

  -- Layout
  position_order INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT TRUE,
  is_pinned BOOLEAN DEFAULT FALSE,

  -- Source tracking
  created_from TEXT DEFAULT 'CHAT', -- CHAT, MANUAL, TEMPLATE

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_widgets_user_visible ON dashboard_widgets(user_id, is_visible);
CREATE INDEX IF NOT EXISTS idx_widgets_user_order ON dashboard_widgets(user_id, position_order);
CREATE INDEX IF NOT EXISTS idx_widgets_type ON dashboard_widgets(widget_type);

-- RLS Policies
ALTER TABLE dashboard_widgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own widgets"
  ON dashboard_widgets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own widgets"
  ON dashboard_widgets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own widgets"
  ON dashboard_widgets FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own widgets"
  ON dashboard_widgets FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- MANIFESTATION GOALS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS manifestation_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  widget_id UUID REFERENCES dashboard_widgets(id) ON DELETE CASCADE,

  -- Goal details
  title TEXT NOT NULL,
  description TEXT,
  category TEXT, -- FINANCIAL, CAREER, HEALTH, RELATIONSHIP, LIFESTYLE

  target_amount DECIMAL(20,2),
  current_amount DECIMAL(20,2) DEFAULT 0,
  target_date DATE,

  -- Generated content from AI
  affirmations TEXT[],
  scripting_text TEXT,
  visualization_script TEXT,
  action_steps JSONB DEFAULT '[]',
  crystal_recommendations TEXT[],

  -- Progress tracking
  progress_percentage DECIMAL(5,2) DEFAULT 0,
  milestones JSONB DEFAULT '[]',

  -- Status
  status TEXT DEFAULT 'ACTIVE', -- ACTIVE, COMPLETED, PAUSED, ARCHIVED
  completed_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_goals_user ON manifestation_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_status ON manifestation_goals(status);
CREATE INDEX IF NOT EXISTS idx_goals_widget ON manifestation_goals(widget_id);

-- RLS Policies
ALTER TABLE manifestation_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own goals"
  ON manifestation_goals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own goals"
  ON manifestation_goals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals"
  ON manifestation_goals FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own goals"
  ON manifestation_goals FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- SCHEDULED NOTIFICATIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS scheduled_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Source
  source_type TEXT NOT NULL, -- MANIFESTATION_GOAL, CRYSTAL_GRID, etc.
  source_id UUID,

  -- Schedule
  notification_type TEXT NOT NULL, -- AFFIRMATION, VISUALIZATION, CHECK_IN, etc.
  scheduled_time TIME NOT NULL,
  days_of_week INTEGER[] DEFAULT ARRAY[1,2,3,4,5,6,7], -- 1=Mon, 7=Sun

  -- Content
  title TEXT NOT NULL,
  message TEXT,
  action_url TEXT,

  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  last_sent_at TIMESTAMPTZ,
  next_send_at TIMESTAMPTZ,

  -- Stats
  total_sent INTEGER DEFAULT 0,
  total_opened INTEGER DEFAULT 0,
  total_completed INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_active ON scheduled_notifications(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_notifications_next_send ON scheduled_notifications(next_send_at) WHERE is_active = TRUE;

-- RLS Policies
ALTER TABLE scheduled_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON scheduled_notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON scheduled_notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================
-- UPDATE TRIGGERS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_widgets_timestamp
  BEFORE UPDATE ON dashboard_widgets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_goals_timestamp
  BEFORE UPDATE ON manifestation_goals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE dashboard_widgets IS 'User dashboard widgets created from AI responses';
COMMENT ON TABLE manifestation_goals IS 'User manifestation goals with progress tracking';
COMMENT ON TABLE scheduled_notifications IS 'Scheduled reminders and notifications';
```

### Files cần tạo
- `supabase/migrations/20250120_add_widgets.sql` - Database migration

### Verification Checklist
- [ ] Migration file tạo thành công
- [ ] 3 tables được tạo (dashboard_widgets, manifestation_goals, scheduled_notifications)
- [ ] ENUMs được tạo (widget_type, widget_size)
- [ ] Indexes được tạo đầy đủ
- [ ] RLS policies được tạo đầy đủ
- [ ] Triggers được tạo (update_updated_at)

---

## Bước 2: Deploy Database Migration

### Mục đích
Deploy migration lên Supabase production database.

### Công việc cần làm

1. **Deploy via Supabase Dashboard**
   - Open Supabase Dashboard → SQL Editor
   - Copy nội dung migration file
   - Execute SQL
   - Verify tables created

2. **Hoặc deploy via CLI**
   ```bash
   npx supabase db push
   ```

3. **Verify deployment**
   ```sql
   -- Check tables exist
   SELECT table_name FROM information_schema.tables
   WHERE table_schema = 'public'
   AND table_name IN ('dashboard_widgets', 'manifestation_goals', 'scheduled_notifications');

   -- Check RLS enabled
   SELECT tablename, rowsecurity
   FROM pg_tables
   WHERE schemaname = 'public'
   AND tablename IN ('dashboard_widgets', 'manifestation_goals', 'scheduled_notifications');

   -- Check policies
   SELECT schemaname, tablename, policyname
   FROM pg_policies
   WHERE tablename IN ('dashboard_widgets', 'manifestation_goals', 'scheduled_notifications');
   ```

### Verification Checklist
- [ ] Migration executed successfully
- [ ] All 3 tables exist
- [ ] RLS is enabled on all tables
- [ ] Policies are created
- [ ] No errors in Supabase logs

---

## Bước 3: Tạo WidgetFactory Service

### Mục đích
Service để tạo widgets và goals từ AI response data.

### Công việc cần làm

1. **Tạo file widgetFactory.js**

```javascript
// File: frontend/src/services/widgetFactory.js

import { supabase } from '../lib/supabaseClient';
import { ResponseTypes } from './responseDetector';
import { DataExtractor } from './dataExtractor';

export class WidgetFactory {

  static dataExtractor = new DataExtractor();

  /**
   * Main entry point: Create widget from AI response
   */
  static async createFromAIResponse(userId, aiResponse, detectionResult) {
    const { type, extractedData } = detectionResult;

    switch(type) {
      case ResponseTypes.MANIFESTATION_GOAL:
        const data = this.dataExtractor.extractManifestationData(aiResponse);
        return await this.createManifestationPackage(userId, data, aiResponse);

      case ResponseTypes.CRYSTAL_RECOMMENDATION:
        const crystalData = this.dataExtractor.extractCrystals(aiResponse);
        return await this.createCrystalWidget(userId, crystalData);

      case ResponseTypes.AFFIRMATIONS_ONLY:
        const affirmations = this.dataExtractor.extractAffirmations(aiResponse);
        return await this.createAffirmationWidget(userId, affirmations);

      default:
        return null; // No widget for GENERAL_CHAT, ICHING_READING, TAROT_READING
    }
  }

  /**
   * Create Manifestation Package (multiple widgets + goal)
   */
  static async createManifestationPackage(userId, data, fullResponse) {
    try {
      // 1. Create Goal in database
      const { data: goal, error: goalError } = await supabase
        .from('manifestation_goals')
        .insert({
          user_id: userId,
          title: data.goalTitle,
          category: this.detectCategory(data.goalTitle),
          target_amount: data.targetAmount,
          target_date: this.calculateTargetDate(data.timeline),
          affirmations: data.affirmations,
          action_steps: data.actionSteps,
          crystal_recommendations: data.crystalRecommendations
        })
        .select()
        .single();

      if (goalError) throw goalError;

      // 2. Create Goal Card Widget
      const { data: goalWidget, error: goalWidgetError } = await supabase
        .from('dashboard_widgets')
        .insert({
          user_id: userId,
          widget_type: 'GOAL_CARD',
          widget_size: 'LARGE',
          linked_goal_id: goal.id,
          widget_data: {
            title: data.goalTitle,
            targetAmount: data.targetAmount,
            currentAmount: 0,
            progress: 0,
            targetDate: this.calculateTargetDate(data.timeline)
          },
          position_order: 0,
          created_from: 'CHAT'
        })
        .select()
        .single();

      if (goalWidgetError) throw goalWidgetError;

      // 3. Create Affirmation Widget (if has affirmations)
      let affirmationWidget = null;
      if (data.affirmations && data.affirmations.length > 0) {
        const { data: affWidget, error: affWidgetError } = await supabase
          .from('dashboard_widgets')
          .insert({
            user_id: userId,
            widget_type: 'AFFIRMATION_CARD',
            widget_size: 'MEDIUM',
            linked_goal_id: goal.id,
            widget_data: {
              affirmations: data.affirmations,
              currentIndex: 0,
              completedToday: 0,
              streak: 0
            },
            position_order: 1,
            created_from: 'CHAT'
          })
          .select()
          .single();

        if (!affWidgetError) {
          affirmationWidget = affWidget;
        }
      }

      // 4. Create Action Plan Widget (if has steps)
      let actionPlanWidget = null;
      if (data.actionSteps && data.actionSteps.length > 0) {
        const { data: actionWidget, error: actionWidgetError } = await supabase
          .from('dashboard_widgets')
          .insert({
            user_id: userId,
            widget_type: 'ACTION_PLAN',
            widget_size: 'LARGE',
            linked_goal_id: goal.id,
            widget_data: {
              steps: data.actionSteps,
              completedTasks: [],
              totalTasks: this.countTasks(data.actionSteps)
            },
            position_order: 2,
            created_from: 'CHAT'
          })
          .select()
          .single();

        if (!actionWidgetError) {
          actionPlanWidget = actionWidget;
        }
      }

      // 5. Create Crystal Grid Widget (if has recommendations)
      let crystalWidget = null;
      if (data.crystalRecommendations && data.crystalRecommendations.length > 0) {
        const { data: cryWidget, error: cryWidgetError } = await supabase
          .from('dashboard_widgets')
          .insert({
            user_id: userId,
            widget_type: 'CRYSTAL_GRID',
            widget_size: 'MEDIUM',
            linked_goal_id: goal.id,
            widget_data: {
              crystals: data.crystalRecommendations,
              lastCleansed: null,
              nextCleanse: null
            },
            position_order: 3,
            created_from: 'CHAT'
          })
          .select()
          .single();

        if (!cryWidgetError) {
          crystalWidget = cryWidget;
        }
      }

      // 6. Update Goal with widget_id
      await supabase
        .from('manifestation_goals')
        .update({ widget_id: goalWidget.id })
        .eq('id', goal.id);

      // 7. Create Daily Reminders
      await this.createReminders(userId, goal.id, data);

      // 8. Return package info
      const createdWidgets = [goalWidget, affirmationWidget, actionPlanWidget, crystalWidget].filter(w => w !== null);

      return {
        success: true,
        goal: goal,
        widgets: createdWidgets,
        message: `✨ Đã tạo ${createdWidgets.length} widgets cho mục tiêu của bạn!`
      };

    } catch (error) {
      console.error('Error creating manifestation package:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Calculate target date from timeline
   */
  static calculateTargetDate(timeline) {
    const now = new Date();

    if (timeline.months) {
      now.setMonth(now.getMonth() + timeline.months);
    } else if (timeline.weeks) {
      now.setDate(now.getDate() + (timeline.weeks * 7));
    } else if (timeline.days) {
      now.setDate(now.getDate() + timeline.days);
    }

    return now.toISOString().split('T')[0]; // YYYY-MM-DD
  }

  /**
   * Detect category from goal title
   */
  static detectCategory(title) {
    const titleLower = title.toLowerCase();

    if (titleLower.match(/tiền|income|revenue|triệu|tỷ|passive|thu nhập|kiếm/)) {
      return 'FINANCIAL';
    }
    if (titleLower.match(/career|job|work|công việc|nghề nghiệp/)) {
      return 'CAREER';
    }
    if (titleLower.match(/health|healthy|sức khỏe|weight|fitness/)) {
      return 'HEALTH';
    }
    if (titleLower.match(/love|relationship|partner|tình yêu|yêu/)) {
      return 'RELATIONSHIP';
    }

    return 'LIFESTYLE';
  }

  /**
   * Count total tasks in action plan
   */
  static countTasks(actionSteps) {
    return actionSteps.reduce((total, week) => {
      return total + (week.tasks ? week.tasks.length : 0);
    }, 0);
  }

  /**
   * Create Daily Reminders for goal
   */
  static async createReminders(userId, goalId, data) {
    const reminders = [
      {
        notification_type: 'AFFIRMATION',
        scheduled_time: '08:00:00',
        title: '🌅 Affirmations Buổi Sáng',
        message: 'Thời gian đọc affirmations cho ngày mới!',
        action_url: `/dashboard?goal=${goalId}`
      },
      {
        notification_type: 'CHECK_IN',
        scheduled_time: '12:00:00',
        title: '☕ Check-in Giữa Ngày',
        message: 'Bạn có thực hiện aligned action hôm nay chưa?',
        action_url: `/dashboard?goal=${goalId}`
      },
      {
        notification_type: 'VISUALIZATION',
        scheduled_time: '21:00:00',
        title: '🌙 Visualization Buổi Tối',
        message: 'Dành 10 phút visualize mục tiêu của bạn',
        action_url: `/dashboard?goal=${goalId}`
      }
    ];

    for (const reminder of reminders) {
      await supabase.from('scheduled_notifications').insert({
        user_id: userId,
        source_type: 'MANIFESTATION_GOAL',
        source_id: goalId,
        ...reminder,
        next_send_at: this.calculateNextSend(reminder.scheduled_time)
      });
    }
  }

  /**
   * Calculate next send time for notification
   */
  static calculateNextSend(timeString) {
    const now = new Date();
    const [hours, minutes] = timeString.split(':');

    const next = new Date(now);
    next.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    // If time already passed today, schedule for tomorrow
    if (next <= now) {
      next.setDate(next.getDate() + 1);
    }

    return next.toISOString();
  }
}

// Export widget limits
export const WIDGET_LIMITS = {
  FREE: {
    maxWidgets: 3,
    maxGoals: 1,
    canCustomize: false,
    hasReminders: false
  },
  TIER1: {
    maxWidgets: 10,
    maxGoals: 3,
    canCustomize: true,
    hasReminders: true
  },
  TIER2: {
    maxWidgets: 25,
    maxGoals: 10,
    canCustomize: true,
    hasReminders: true
  },
  TIER3: {
    maxWidgets: -1, // Unlimited
    maxGoals: -1,
    canCustomize: true,
    hasReminders: true,
    advancedFeatures: true
  }
};
```

### Files cần tạo
- `frontend/src/services/widgetFactory.js` - Widget factory service

### Verification Checklist
- [ ] File tạo thành công
- [ ] createFromAIResponse() hoạt động
- [ ] createManifestationPackage() tạo đủ 4 widgets
- [ ] calculateTargetDate() parse đúng
- [ ] detectCategory() phân loại đúng
- [ ] createReminders() tạo 3 reminders
- [ ] WIDGET_LIMITS exported đúng

---

## Bước 4: Test Widget Creation Flow

### Mục đích
Test toàn bộ flow từ detection → extraction → widget creation.

### Manual Testing Checklist
- [ ] Test tạo manifestation goal với full data
- [ ] Test tạo goal với missing fields (no affirmations, no crystals)
- [ ] Verify widgets appear in dashboard_widgets table
- [ ] Verify goal appears in manifestation_goals table
- [ ] Verify 3 notifications created in scheduled_notifications
- [ ] Test với FREE user (check limits)
- [ ] Test với TIER1 user
- [ ] Test error handling (database errors, invalid data)

---

## Edge Cases & Error Handling

### Edge Cases

1. **User đã đạt widget limit**
   - Giải pháp: Check widget count trước khi create, show upgrade prompt

2. **Duplicate goal title**
   - Giải pháp: Allow duplicates, add timestamp to distinguish

3. **Very large goal amounts**
   - Giải pháp: Use DECIMAL(20,2) để handle big numbers

### Error Handling

```javascript
// Add to widgetFactory.js
static async checkWidgetLimit(userId, userTier) {
  const limits = WIDGET_LIMITS[userTier] || WIDGET_LIMITS.FREE;

  if (limits.maxWidgets === -1) return true; // Unlimited

  const { count } = await supabase
    .from('dashboard_widgets')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_visible', true);

  return count < limits.maxWidgets;
}
```

---

## Completion Criteria

Phase 08 hoàn thành khi:
- [ ] Database migration deployed successfully
- [ ] All 3 tables created với RLS
- [ ] WidgetFactory service hoạt động
- [ ] Tạo được manifestation package (4 widgets + goal + 3 notifications)
- [ ] Tier limits được enforce
- [ ] Tests pass
- [ ] No errors khi create widgets

---

## Next Steps

1. Update `plan.md`: Mark Phase 08 = ✅
2. Commit: `feat: complete phase-08 - widget factory & database`
3. Hỏi user review
4. Sang `phase-09-chat-integration.md`
