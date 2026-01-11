-- =====================================================
-- GEM Shop Enhancement V2 - Database Migration
-- Created: 2024-12-24
-- Tables: Onboarding, Notifications, Tooltips
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. USER ONBOARDING PROGRESS
-- Tracks which onboarding steps users have completed
-- =====================================================
CREATE TABLE IF NOT EXISTS user_onboarding_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  feature_key TEXT NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  skipped BOOLEAN DEFAULT false,
  UNIQUE(user_id, feature_key)
);

-- RLS Policies for user_onboarding_progress
ALTER TABLE user_onboarding_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own onboarding progress" ON user_onboarding_progress;
CREATE POLICY "Users can view own onboarding progress"
  ON user_onboarding_progress FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own onboarding progress" ON user_onboarding_progress;
CREATE POLICY "Users can insert own onboarding progress"
  ON user_onboarding_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own onboarding progress" ON user_onboarding_progress;
CREATE POLICY "Users can update own onboarding progress"
  ON user_onboarding_progress FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own onboarding progress" ON user_onboarding_progress;
CREATE POLICY "Users can delete own onboarding progress"
  ON user_onboarding_progress FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_onboarding_user_id ON user_onboarding_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_feature_key ON user_onboarding_progress(feature_key);

-- =====================================================
-- 2. USER NOTIFICATION PREFERENCES
-- Stores user preferences for different notification types
-- =====================================================
CREATE TABLE IF NOT EXISTS user_notification_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  flash_sale_alerts BOOLEAN DEFAULT true,
  wishlist_price_drops BOOLEAN DEFAULT true,
  back_in_stock BOOLEAN DEFAULT true,
  order_updates BOOLEAN DEFAULT true,
  promo_offers BOOLEAN DEFAULT false,
  push_token TEXT,
  device_type TEXT, -- 'ios' or 'android'
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- RLS Policies for user_notification_preferences
ALTER TABLE user_notification_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own notification preferences" ON user_notification_preferences;
CREATE POLICY "Users can view own notification preferences"
  ON user_notification_preferences FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own notification preferences" ON user_notification_preferences;
CREATE POLICY "Users can insert own notification preferences"
  ON user_notification_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notification preferences" ON user_notification_preferences;
CREATE POLICY "Users can update own notification preferences"
  ON user_notification_preferences FOR UPDATE
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_notification_prefs_user_id ON user_notification_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_prefs_push_token ON user_notification_preferences(push_token);

-- =====================================================
-- 3. NOTIFICATION HISTORY
-- Logs all notifications sent to users
-- =====================================================
CREATE TABLE IF NOT EXISTS notification_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL DEFAULT 'system', -- 'flash_sale', 'price_drop', 'back_in_stock', 'order_update', 'promo'
  title TEXT NOT NULL,
  body TEXT,
  data JSONB DEFAULT '{}',
  read_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns if table already exists
DO $$
BEGIN
  -- Check if old 'type' column exists and rename to 'notification_type'
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'notification_history' AND column_name = 'type'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'notification_history' AND column_name = 'notification_type'
  ) THEN
    ALTER TABLE notification_history RENAME COLUMN type TO notification_type;
  END IF;

  -- Add notification_type column if it doesn't exist (and type doesn't exist either)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'notification_history' AND column_name = 'notification_type'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'notification_history' AND column_name = 'type'
  ) THEN
    ALTER TABLE notification_history ADD COLUMN notification_type TEXT NOT NULL DEFAULT 'system';
  END IF;

  -- Add sent_at column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'notification_history' AND column_name = 'sent_at'
  ) THEN
    ALTER TABLE notification_history ADD COLUMN sent_at TIMESTAMPTZ DEFAULT NOW();
  END IF;

  -- Add read_at column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'notification_history' AND column_name = 'read_at'
  ) THEN
    ALTER TABLE notification_history ADD COLUMN read_at TIMESTAMPTZ;
  END IF;

  -- Add title column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'notification_history' AND column_name = 'title'
  ) THEN
    ALTER TABLE notification_history ADD COLUMN title TEXT NOT NULL DEFAULT '';
  END IF;

  -- Add body column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'notification_history' AND column_name = 'body'
  ) THEN
    ALTER TABLE notification_history ADD COLUMN body TEXT;
  END IF;

  -- Add data column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'notification_history' AND column_name = 'data'
  ) THEN
    ALTER TABLE notification_history ADD COLUMN data JSONB DEFAULT '{}';
  END IF;
END $$;

-- RLS Policies for notification_history
ALTER TABLE notification_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own notification history" ON notification_history;
CREATE POLICY "Users can view own notification history"
  ON notification_history FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notifications (mark as read)" ON notification_history;
CREATE POLICY "Users can update own notifications (mark as read)"
  ON notification_history FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role can insert notifications" ON notification_history;
CREATE POLICY "Service role can insert notifications"
  ON notification_history FOR INSERT
  WITH CHECK (true);

-- Drop old index if exists (from previous migration attempts)
DROP INDEX IF EXISTS idx_notification_history_type;

-- Indexes (using notification_type instead of type to avoid reserved word issues)
CREATE INDEX IF NOT EXISTS idx_notification_history_user_id ON notification_history(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_history_notification_type ON notification_history(notification_type);
CREATE INDEX IF NOT EXISTS idx_notification_history_created_at ON notification_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notification_history_read_at ON notification_history(read_at);

-- =====================================================
-- 4. USER TOOLTIP SEEN
-- Tracks which tooltips users have dismissed
-- =====================================================
CREATE TABLE IF NOT EXISTS user_tooltip_seen (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tooltip_key TEXT NOT NULL,
  seen_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, tooltip_key)
);

-- RLS Policies for user_tooltip_seen
ALTER TABLE user_tooltip_seen ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own tooltip status" ON user_tooltip_seen;
CREATE POLICY "Users can view own tooltip status"
  ON user_tooltip_seen FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own tooltip status" ON user_tooltip_seen;
CREATE POLICY "Users can insert own tooltip status"
  ON user_tooltip_seen FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own tooltip status" ON user_tooltip_seen;
CREATE POLICY "Users can delete own tooltip status"
  ON user_tooltip_seen FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_tooltip_seen_user_id ON user_tooltip_seen(user_id);
CREATE INDEX IF NOT EXISTS idx_tooltip_seen_tooltip_key ON user_tooltip_seen(tooltip_key);

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Drop existing functions first to avoid conflicts (with CASCADE)
DROP FUNCTION IF EXISTS has_completed_shop_onboarding CASCADE;
DROP FUNCTION IF EXISTS get_unread_notification_count CASCADE;
DROP FUNCTION IF EXISTS mark_all_notifications_read CASCADE;

-- Function to check if user has completed shop onboarding
CREATE OR REPLACE FUNCTION has_completed_shop_onboarding(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_onboarding_progress
    WHERE user_id = p_user_id
    AND feature_key = 'shop_onboarding_complete'
  );
END;
$$;

-- Function to get unread notification count
CREATE OR REPLACE FUNCTION get_unread_notification_count(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM notification_history
  WHERE user_id = p_user_id
  AND read_at IS NULL;

  RETURN COALESCE(v_count, 0);
END;
$$;

-- Function to mark all notifications as read
CREATE OR REPLACE FUNCTION mark_all_notifications_read(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE notification_history
  SET read_at = NOW()
  WHERE user_id = p_user_id
  AND read_at IS NULL;
END;
$$;

-- =====================================================
-- SAMPLE DATA (For Testing)
-- =====================================================
-- Note: Uncomment below to insert sample data for testing

-- INSERT INTO notification_history (user_id, type, title, body, data)
-- SELECT
--   id,
--   'flash_sale',
--   'Flash Sale bat dau!',
--   'Giam gia den 50% trong 2 gio toi',
--   '{"sale_id": "test-sale-1", "discount": 50}'::jsonb
-- FROM auth.users
-- LIMIT 1;

-- =====================================================
-- END OF MIGRATION
-- =====================================================
