-- ============================================================
-- PUSH TOKENS TABLE
-- GEM Partnership System v3.0 - Phase 5
-- Date: 2024-12-28
-- ============================================================

-- Create table if not exists
CREATE TABLE IF NOT EXISTS user_push_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  push_token TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('ios', 'android', 'web')),
  device_name TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id)
);

-- Index for fast lookup
CREATE INDEX IF NOT EXISTS idx_push_tokens_user_id ON user_push_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_push_tokens_active ON user_push_tokens(is_active) WHERE is_active = TRUE;

-- RLS
ALTER TABLE user_push_tokens ENABLE ROW LEVEL SECURITY;

-- Users can manage their own push tokens
CREATE POLICY "Users can view own push tokens" ON user_push_tokens
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own push tokens" ON user_push_tokens
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own push tokens" ON user_push_tokens
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own push tokens" ON user_push_tokens
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- NOTIFICATION PREFERENCES TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,

  -- Push notification preferences
  push_enabled BOOLEAN DEFAULT TRUE,
  push_partnership BOOLEAN DEFAULT TRUE,
  push_commission BOOLEAN DEFAULT TRUE,
  push_tier_change BOOLEAN DEFAULT TRUE,
  push_new_resource BOOLEAN DEFAULT TRUE,
  push_event BOOLEAN DEFAULT TRUE,

  -- Email preferences
  email_enabled BOOLEAN DEFAULT TRUE,
  email_weekly_summary BOOLEAN DEFAULT TRUE,
  email_tier_change BOOLEAN DEFAULT TRUE,
  email_payment BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for notification preferences
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own preferences" ON notification_preferences
  FOR ALL USING (auth.uid() = user_id);

-- Index
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user ON notification_preferences(user_id);

-- ============================================================
-- HELPER FUNCTION: Get push token for user
-- ============================================================

CREATE OR REPLACE FUNCTION get_user_push_token(p_user_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_token TEXT;
BEGIN
  SELECT push_token INTO v_token
  FROM user_push_tokens
  WHERE user_id = p_user_id AND is_active = TRUE;

  RETURN v_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- HELPER FUNCTION: Check notification preference
-- ============================================================

CREATE OR REPLACE FUNCTION check_notification_preference(
  p_user_id UUID,
  p_type TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  v_enabled BOOLEAN;
BEGIN
  -- Default to true if no preference set
  SELECT
    CASE p_type
      WHEN 'push_partnership' THEN COALESCE(push_partnership, TRUE)
      WHEN 'push_commission' THEN COALESCE(push_commission, TRUE)
      WHEN 'push_tier_change' THEN COALESCE(push_tier_change, TRUE)
      WHEN 'push_new_resource' THEN COALESCE(push_new_resource, TRUE)
      WHEN 'push_event' THEN COALESCE(push_event, TRUE)
      WHEN 'email_weekly_summary' THEN COALESCE(email_weekly_summary, TRUE)
      WHEN 'email_tier_change' THEN COALESCE(email_tier_change, TRUE)
      WHEN 'email_payment' THEN COALESCE(email_payment, TRUE)
      ELSE TRUE
    END
  INTO v_enabled
  FROM notification_preferences
  WHERE user_id = p_user_id;

  -- Return true if no preference found (opt-in by default)
  RETURN COALESCE(v_enabled, TRUE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- VERIFICATION
-- ============================================================

SELECT 'Push tokens migration completed!' as status;
