-- ============================================================
-- Migration: Add Push Notification columns to profiles
-- Date: 2024-12-14
-- Description: Thêm columns để quản lý push notifications
-- ============================================================

-- Thêm columns vào profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS expo_push_token VARCHAR(255);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notification_segments TEXT[] DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_notification_at TIMESTAMPTZ;

-- Index for querying by token
CREATE INDEX IF NOT EXISTS idx_profiles_push_token ON profiles(expo_push_token)
  WHERE expo_push_token IS NOT NULL;

-- Index for segment queries
CREATE INDEX IF NOT EXISTS idx_profiles_notif_segments ON profiles USING GIN (notification_segments)
  WHERE notification_segments IS NOT NULL AND array_length(notification_segments, 1) > 0;

-- Comment columns
COMMENT ON COLUMN profiles.expo_push_token IS 'Expo push notification token for mobile app';
COMMENT ON COLUMN profiles.notification_segments IS 'User segments for targeted notifications: spiritual, trading, etc.';
COMMENT ON COLUMN profiles.last_notification_at IS 'Timestamp of last push notification sent to user';

-- ============================================================
-- RPC Function: Update expo push token
-- ============================================================
CREATE OR REPLACE FUNCTION update_profile_push_token(
  p_user_id UUID,
  p_token VARCHAR(255)
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE profiles
  SET
    expo_push_token = p_token,
    updated_at = NOW()
  WHERE id = p_user_id;
END;
$$;

-- ============================================================
-- RPC Function: Get users by segment for push notifications
-- ============================================================
CREATE OR REPLACE FUNCTION get_users_for_push_notification(
  p_segment VARCHAR(100) DEFAULT 'all'
)
RETURNS TABLE (
  user_id UUID,
  expo_push_token VARCHAR(255),
  notification_settings JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id as user_id,
    p.expo_push_token,
    COALESCE(ns.categories, '{}'::JSONB) as notification_settings
  FROM profiles p
  LEFT JOIN notification_settings ns ON ns.user_id = p.id
  WHERE
    p.expo_push_token IS NOT NULL
    AND COALESCE(ns.enabled, true) = true
    AND (
      p_segment = 'all'
      OR (p_segment = 'traders' AND 'trading' = ANY(p.notification_segments))
      OR (p_segment = 'spiritual' AND 'spiritual' = ANY(p.notification_segments))
      OR (p_segment = 'tier1_plus' AND p.scanner_tier IN ('tier1', 'tier2', 'tier3'))
      OR (p_segment = 'inactive_3d' AND p.last_active_at < NOW() - INTERVAL '3 days')
    );
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION update_profile_push_token TO authenticated;
GRANT EXECUTE ON FUNCTION get_users_for_push_notification TO service_role;
