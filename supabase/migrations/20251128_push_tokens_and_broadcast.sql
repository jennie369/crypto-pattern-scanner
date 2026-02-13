-- GEM Platform - Push Tokens & Broadcast Notifications
-- Store user push tokens and support system-wide notifications

-- Drop existing objects if they exist (for clean migration)
DROP FUNCTION IF EXISTS broadcast_notification_to_users(VARCHAR, TEXT, JSONB, VARCHAR);
DROP FUNCTION IF EXISTS get_active_push_tokens(VARCHAR);
DROP INDEX IF EXISTS idx_push_tokens_active;
DROP INDEX IF EXISTS idx_push_tokens_user_id;
DROP INDEX IF EXISTS idx_system_notifications_status;
DROP INDEX IF EXISTS idx_system_notifications_sent_at;

-- Create user_push_tokens table
CREATE TABLE IF NOT EXISTS user_push_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  push_token TEXT NOT NULL,
  device_type VARCHAR(20) DEFAULT 'unknown', -- 'ios', 'android', 'web'
  device_name TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, push_token)
);

-- Add is_active column if it doesn't exist (for existing tables)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_push_tokens' AND column_name = 'is_active'
  ) THEN
    ALTER TABLE user_push_tokens ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
  END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_push_tokens_user_id ON user_push_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_push_tokens_active ON user_push_tokens(is_active) WHERE is_active = TRUE;

-- Create system_notifications table for broadcast messages
CREATE TABLE IF NOT EXISTS system_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  target_audience VARCHAR(50) DEFAULT 'all', -- 'all', 'premium', 'free', 'admin'
  sent_by UUID REFERENCES auth.users(id),
  sent_count INTEGER DEFAULT 0,
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'scheduled', 'sending', 'sent', 'failed'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_system_notifications_status ON system_notifications(status);
CREATE INDEX IF NOT EXISTS idx_system_notifications_sent_at ON system_notifications(sent_at DESC);

-- Enable RLS
ALTER TABLE user_push_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_notifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own push tokens" ON user_push_tokens;
DROP POLICY IF EXISTS "Users can insert own push tokens" ON user_push_tokens;
DROP POLICY IF EXISTS "Users can update own push tokens" ON user_push_tokens;
DROP POLICY IF EXISTS "Users can delete own push tokens" ON user_push_tokens;
DROP POLICY IF EXISTS "Admin can view all push tokens" ON user_push_tokens;
DROP POLICY IF EXISTS "Admin can manage system notifications" ON system_notifications;

-- RLS Policies for user_push_tokens
-- Users can manage their own tokens
CREATE POLICY "Users can view own push tokens"
  ON user_push_tokens FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own push tokens"
  ON user_push_tokens FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own push tokens"
  ON user_push_tokens FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own push tokens"
  ON user_push_tokens FOR DELETE
  USING (auth.uid() = user_id);

-- Admin can read all tokens (for sending broadcasts)
CREATE POLICY "Admin can view all push tokens"
  ON user_push_tokens FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role = 'ADMIN' OR profiles.is_admin = TRUE)
    )
  );

-- RLS Policies for system_notifications
-- Admin only access
CREATE POLICY "Admin can manage system notifications"
  ON system_notifications FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role = 'ADMIN' OR profiles.is_admin = TRUE)
    )
  );

-- Function to get all active push tokens
CREATE OR REPLACE FUNCTION get_active_push_tokens(target_audience_filter VARCHAR DEFAULT 'all')
RETURNS TABLE(push_token TEXT, user_id UUID) AS $$
BEGIN
  IF target_audience_filter = 'all' THEN
    RETURN QUERY
    SELECT upt.push_token, upt.user_id
    FROM user_push_tokens upt
    WHERE upt.is_active = TRUE;
  ELSIF target_audience_filter = 'premium' THEN
    RETURN QUERY
    SELECT upt.push_token, upt.user_id
    FROM user_push_tokens upt
    JOIN profiles p ON p.id = upt.user_id
    WHERE upt.is_active = TRUE
    AND (p.scanner_tier IN ('PRO', 'PREMIUM', 'VIP') OR p.chatbot_tier IN ('PRO', 'PREMIUM', 'VIP'));
  ELSIF target_audience_filter = 'free' THEN
    RETURN QUERY
    SELECT upt.push_token, upt.user_id
    FROM user_push_tokens upt
    JOIN profiles p ON p.id = upt.user_id
    WHERE upt.is_active = TRUE
    AND p.scanner_tier = 'FREE' AND p.chatbot_tier = 'FREE';
  ELSIF target_audience_filter = 'admin' THEN
    RETURN QUERY
    SELECT upt.push_token, upt.user_id
    FROM user_push_tokens upt
    JOIN profiles p ON p.id = upt.user_id
    WHERE upt.is_active = TRUE
    AND (p.role = 'ADMIN' OR p.is_admin = TRUE);
  ELSE
    RETURN QUERY
    SELECT upt.push_token, upt.user_id
    FROM user_push_tokens upt
    WHERE upt.is_active = TRUE;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to insert notification for all users (broadcast)
CREATE OR REPLACE FUNCTION broadcast_notification_to_users(
  p_title VARCHAR,
  p_body TEXT,
  p_data JSONB DEFAULT '{}',
  p_target_audience VARCHAR DEFAULT 'all'
)
RETURNS INTEGER AS $$
DECLARE
  inserted_count INTEGER := 0;
  user_record RECORD;
BEGIN
  FOR user_record IN
    SELECT DISTINCT upt.user_id
    FROM get_active_push_tokens(p_target_audience) upt
  LOOP
    INSERT INTO notifications (user_id, type, title, body, data)
    VALUES (user_record.user_id, 'system', p_title, p_body, p_data);
    inserted_count := inserted_count + 1;
  END LOOP;

  RETURN inserted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
