-- ========================================
-- GEM Platform - Smart Notifications Schema
-- Day 20-22: Widget-based notifications
-- ========================================

-- ========================================
-- 1. USER PUSH TOKENS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS user_push_tokens (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  platform VARCHAR(20) CHECK (platform IN ('ios', 'android', 'web')),
  device_info JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for token lookup
CREATE INDEX IF NOT EXISTS idx_push_tokens_token ON user_push_tokens(token);

-- ========================================
-- 2. NOTIFICATION SETTINGS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS notification_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  enabled BOOLEAN DEFAULT true,

  -- Category toggles
  categories JSONB DEFAULT '{
    "morning_affirmations": true,
    "midday_checkin": true,
    "evening_visualization": true,
    "milestone_celebrations": true
  }'::jsonb,

  -- Frequency limits
  frequency JSONB DEFAULT '{
    "max_per_day": 3
  }'::jsonb,

  -- Do Not Disturb
  do_not_disturb JSONB DEFAULT '{
    "enabled": false,
    "start": "22:00",
    "end": "08:00"
  }'::jsonb,

  -- Custom times (24h format)
  custom_times JSONB DEFAULT '{
    "morning": "08:00",
    "midday": "12:00",
    "evening": "21:00"
  }'::jsonb,

  -- Timezone (for scheduling)
  timezone VARCHAR(50) DEFAULT 'Asia/Ho_Chi_Minh',

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 3. SCHEDULED NOTIFICATIONS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS scheduled_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  widget_id UUID,

  notification_type VARCHAR(50) NOT NULL CHECK (notification_type IN (
    'MORNING_AFFIRMATION',
    'MIDDAY_CHECKIN',
    'EVENING_VISUALIZATION',
    'MILESTONE_CELEBRATION'
  )),

  scheduled_time TIME NOT NULL,
  content JSONB NOT NULL,
  deep_link JSONB,

  is_active BOOLEAN DEFAULT true,
  last_sent_at TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_scheduled_notifications_user ON scheduled_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_notifications_type ON scheduled_notifications(notification_type);
CREATE INDEX IF NOT EXISTS idx_scheduled_notifications_active ON scheduled_notifications(is_active) WHERE is_active = true;

-- ========================================
-- 4. NOTIFICATION HISTORY TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS notification_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  notification_type VARCHAR(50),
  action_taken VARCHAR(50) CHECK (action_taken IN (
    'OPENED',
    'DISMISSED',
    'complete',
    'snooze',
    'DEEP_LINK_FOLLOWED'
  )),

  action_data JSONB DEFAULT '{}'::jsonb,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for analytics
CREATE INDEX IF NOT EXISTS idx_notification_history_user ON notification_history(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_history_type ON notification_history(notification_type);
CREATE INDEX IF NOT EXISTS idx_notification_history_action ON notification_history(action_taken);
CREATE INDEX IF NOT EXISTS idx_notification_history_date ON notification_history(created_at);

-- ========================================
-- 5. USER WIDGETS TABLE (if not exists)
-- ========================================
CREATE TABLE IF NOT EXISTS user_widgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  type VARCHAR(50) NOT NULL CHECK (type IN (
    'GOAL_CARD',
    'AFFIRMATION_CARD',
    'ACTION_CHECKLIST',
    'PROGRESS_TRACKER',
    'CUSTOM_WIDGET'
  )),

  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  order_index INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_widgets_user ON user_widgets(user_id);
CREATE INDEX IF NOT EXISTS idx_user_widgets_type ON user_widgets(type);
CREATE INDEX IF NOT EXISTS idx_user_widgets_order ON user_widgets(user_id, order_index);

-- ========================================
-- 6. ROW LEVEL SECURITY
-- ========================================

-- Enable RLS
ALTER TABLE user_push_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_widgets ENABLE ROW LEVEL SECURITY;

-- Push tokens policies
DROP POLICY IF EXISTS "Users can manage own push tokens" ON user_push_tokens;
CREATE POLICY "Users can manage own push tokens"
  ON user_push_tokens FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Notification settings policies
DROP POLICY IF EXISTS "Users can manage own notification settings" ON notification_settings;
CREATE POLICY "Users can manage own notification settings"
  ON notification_settings FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Scheduled notifications policies
DROP POLICY IF EXISTS "Users can manage own scheduled notifications" ON scheduled_notifications;
CREATE POLICY "Users can manage own scheduled notifications"
  ON scheduled_notifications FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Notification history policies
DROP POLICY IF EXISTS "Users can view own notification history" ON notification_history;
CREATE POLICY "Users can view own notification history"
  ON notification_history FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own notification history" ON notification_history;
CREATE POLICY "Users can insert own notification history"
  ON notification_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- User widgets policies
DROP POLICY IF EXISTS "Users can manage own widgets" ON user_widgets;
CREATE POLICY "Users can manage own widgets"
  ON user_widgets FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ========================================
-- 7. UPDATED_AT TRIGGERS
-- ========================================

-- Function to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers
DROP TRIGGER IF EXISTS update_push_tokens_updated_at ON user_push_tokens;
CREATE TRIGGER update_push_tokens_updated_at
  BEFORE UPDATE ON user_push_tokens
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_notification_settings_updated_at ON notification_settings;
CREATE TRIGGER update_notification_settings_updated_at
  BEFORE UPDATE ON notification_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_scheduled_notifications_updated_at ON scheduled_notifications;
CREATE TRIGGER update_scheduled_notifications_updated_at
  BEFORE UPDATE ON scheduled_notifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_widgets_updated_at ON user_widgets;
CREATE TRIGGER update_user_widgets_updated_at
  BEFORE UPDATE ON user_widgets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 8. ANALYTICS VIEW
-- ========================================
CREATE OR REPLACE VIEW notification_analytics AS
SELECT
  user_id,
  notification_type,
  action_taken,
  COUNT(*) as count,
  DATE_TRUNC('day', created_at) as date
FROM notification_history
GROUP BY user_id, notification_type, action_taken, DATE_TRUNC('day', created_at);

-- ========================================
-- SUCCESS MESSAGE
-- ========================================
DO $$
BEGIN
  RAISE NOTICE '✅ Smart Notifications schema created successfully!';
  RAISE NOTICE 'Tables: user_push_tokens, notification_settings, scheduled_notifications, notification_history, user_widgets';
END $$;
