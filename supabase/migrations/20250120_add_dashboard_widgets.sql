-- ============================================
-- DASHBOARD WIDGETS SYSTEM FOR MANIFESTATION
-- Created: 2025-01-20
-- ============================================

-- Widget Types for Manifestation Dashboard
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

-- Main dashboard widgets table
CREATE TABLE IF NOT EXISTS dashboard_widgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Widget info
  widget_type widget_type NOT NULL,
  widget_size widget_size DEFAULT 'MEDIUM',

  -- Linked data
  linked_goal_id UUID,
  linked_chat_message_id UUID,

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

-- Indexes for dashboard_widgets
CREATE INDEX IF NOT EXISTS idx_widgets_user_visible ON dashboard_widgets(user_id, is_visible);
CREATE INDEX IF NOT EXISTS idx_widgets_user_order ON dashboard_widgets(user_id, position_order);
CREATE INDEX IF NOT EXISTS idx_widgets_type ON dashboard_widgets(widget_type);
CREATE INDEX IF NOT EXISTS idx_widgets_goal ON dashboard_widgets(linked_goal_id);

-- RLS Policies for dashboard_widgets
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

-- Indexes for manifestation_goals
CREATE INDEX IF NOT EXISTS idx_goals_user ON manifestation_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_status ON manifestation_goals(status);
CREATE INDEX IF NOT EXISTS idx_goals_widget ON manifestation_goals(widget_id);
CREATE INDEX IF NOT EXISTS idx_goals_category ON manifestation_goals(category);
CREATE INDEX IF NOT EXISTS idx_goals_target_date ON manifestation_goals(target_date);

-- RLS Policies for manifestation_goals
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

-- Indexes for scheduled_notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_active ON scheduled_notifications(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_notifications_next_send ON scheduled_notifications(next_send_at) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_notifications_source ON scheduled_notifications(source_type, source_id);

-- RLS Policies for scheduled_notifications
ALTER TABLE scheduled_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON scheduled_notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own notifications"
  ON scheduled_notifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON scheduled_notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications"
  ON scheduled_notifications FOR DELETE
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

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE dashboard_widgets IS 'User dashboard widgets created from AI responses for manifestation goals';
COMMENT ON TABLE manifestation_goals IS 'User manifestation goals with progress tracking and AI-generated content';
COMMENT ON TABLE scheduled_notifications IS 'Scheduled reminders and notifications for goals and widgets';

COMMENT ON COLUMN dashboard_widgets.widget_type IS 'Type of widget: GOAL_CARD, AFFIRMATION_CARD, CRYSTAL_GRID, ACTION_PLAN, TRADING_ANALYSIS, STATS_WIDGET';
COMMENT ON COLUMN dashboard_widgets.widget_size IS 'Display size: SMALL, MEDIUM, LARGE, FULL';
COMMENT ON COLUMN dashboard_widgets.linked_goal_id IS 'Link to manifestation_goals table if widget is goal-related';
COMMENT ON COLUMN dashboard_widgets.widget_data IS 'JSONB data specific to each widget type';
COMMENT ON COLUMN dashboard_widgets.position_order IS 'Order of widget on dashboard (for drag & drop)';

COMMENT ON COLUMN manifestation_goals.category IS 'Goal category: FINANCIAL, CAREER, HEALTH, RELATIONSHIP, LIFESTYLE';
COMMENT ON COLUMN manifestation_goals.affirmations IS 'Array of affirmation statements from AI';
COMMENT ON COLUMN manifestation_goals.action_steps IS 'JSONB weekly action plan';
COMMENT ON COLUMN manifestation_goals.crystal_recommendations IS 'Array of recommended crystals';
COMMENT ON COLUMN manifestation_goals.status IS 'Goal status: ACTIVE, COMPLETED, PAUSED, ARCHIVED';

COMMENT ON COLUMN scheduled_notifications.notification_type IS 'Type: AFFIRMATION, VISUALIZATION, CHECK_IN, REMINDER';
COMMENT ON COLUMN scheduled_notifications.days_of_week IS 'Array of days (1-7) when notification should be sent';
COMMENT ON COLUMN scheduled_notifications.next_send_at IS 'Next scheduled send time';
