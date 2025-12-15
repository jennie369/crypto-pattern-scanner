-- ============================================================
-- ADMIN USER MANAGEMENT SYSTEM
-- Migration: 20251215_admin_user_management.sql
-- Purpose: Admin tools for managing users, activity logs, bans
-- ============================================================

-- 1. User activity logs table
CREATE TABLE IF NOT EXISTS user_activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,

  -- Activity details
  action_type VARCHAR(50) NOT NULL, -- 'login', 'logout', 'post', 'comment', 'purchase', etc.
  action_details JSONB DEFAULT '{}',

  -- Context
  ip_address VARCHAR(50),
  user_agent TEXT,
  device_info JSONB DEFAULT '{}',
  screen VARCHAR(100),

  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for activity logs
CREATE INDEX IF NOT EXISTS idx_activity_user ON user_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_type ON user_activity_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_activity_created ON user_activity_logs(created_at DESC);

-- 2. User bans table
CREATE TABLE IF NOT EXISTS user_bans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Ban details
  reason TEXT NOT NULL,
  ban_type VARCHAR(50) DEFAULT 'permanent', -- 'permanent', 'temporary'
  expires_at TIMESTAMPTZ, -- NULL for permanent bans

  -- Admin who issued the ban
  banned_by UUID REFERENCES profiles(id),
  banned_at TIMESTAMPTZ DEFAULT NOW(),

  -- Unban info
  is_active BOOLEAN DEFAULT true,
  unbanned_by UUID REFERENCES profiles(id),
  unbanned_at TIMESTAMPTZ,
  unban_reason TEXT,

  -- Constraints
  UNIQUE(user_id, is_active) -- Only one active ban per user
);

-- Indexes for bans
CREATE INDEX IF NOT EXISTS idx_bans_user ON user_bans(user_id);
CREATE INDEX IF NOT EXISTS idx_bans_active ON user_bans(is_active) WHERE is_active = true;

-- 3. Tier grant history table
CREATE TABLE IF NOT EXISTS tier_grants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Grant details
  tier_type VARCHAR(50) NOT NULL, -- 'scanner_tier', 'chatbot_tier'
  old_tier VARCHAR(50),
  new_tier VARCHAR(50),
  reason TEXT,

  -- Admin who granted
  granted_by UUID REFERENCES profiles(id),
  granted_at TIMESTAMPTZ DEFAULT NOW(),

  -- Expiration (for temporary grants)
  expires_at TIMESTAMPTZ
);

-- Index
CREATE INDEX IF NOT EXISTS idx_tier_grants_user ON tier_grants(user_id);

-- 4. RLS Policies
ALTER TABLE user_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_bans ENABLE ROW LEVEL SECURITY;
ALTER TABLE tier_grants ENABLE ROW LEVEL SECURITY;

-- Activity logs - only admins can view
CREATE POLICY "Admins view activity logs" ON user_activity_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- System can insert activity logs (via functions)
CREATE POLICY "System insert activity logs" ON user_activity_logs
  FOR INSERT WITH CHECK (true);

-- User bans - only admins can manage
CREATE POLICY "Admins manage bans" ON user_bans
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- Tier grants - only admins can manage
CREATE POLICY "Admins manage tier grants" ON tier_grants
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- 5. Function: Ban user
CREATE OR REPLACE FUNCTION admin_ban_user(
  p_user_id UUID,
  p_reason TEXT,
  p_ban_type VARCHAR DEFAULT 'permanent',
  p_expires_at TIMESTAMPTZ DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_admin_id UUID;
  v_ban_id UUID;
  v_user_email TEXT;
BEGIN
  -- Get admin ID
  v_admin_id := auth.uid();

  -- Check if admin
  IF NOT EXISTS (
    SELECT 1 FROM profiles WHERE id = v_admin_id AND role IN ('admin', 'super_admin')
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Không có quyền admin');
  END IF;

  -- Check if user exists
  SELECT email INTO v_user_email FROM profiles WHERE id = p_user_id;
  IF v_user_email IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'User không tồn tại');
  END IF;

  -- Deactivate any existing active bans
  UPDATE user_bans SET is_active = false WHERE user_id = p_user_id AND is_active = true;

  -- Create new ban
  INSERT INTO user_bans (user_id, reason, ban_type, expires_at, banned_by)
  VALUES (p_user_id, p_reason, p_ban_type, p_expires_at, v_admin_id)
  RETURNING id INTO v_ban_id;

  -- Update user profile
  UPDATE profiles
  SET
    is_banned = true,
    banned_at = NOW(),
    ban_reason = p_reason
  WHERE id = p_user_id;

  -- Log activity
  INSERT INTO user_activity_logs (user_id, action_type, action_details)
  VALUES (p_user_id, 'banned', jsonb_build_object(
    'reason', p_reason,
    'ban_type', p_ban_type,
    'banned_by', v_admin_id
  ));

  RETURN jsonb_build_object(
    'success', true,
    'ban_id', v_ban_id,
    'message', 'User đã bị ban'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Function: Unban user
CREATE OR REPLACE FUNCTION admin_unban_user(
  p_user_id UUID,
  p_reason TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_admin_id UUID;
BEGIN
  -- Get admin ID
  v_admin_id := auth.uid();

  -- Check if admin
  IF NOT EXISTS (
    SELECT 1 FROM profiles WHERE id = v_admin_id AND role IN ('admin', 'super_admin')
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Không có quyền admin');
  END IF;

  -- Deactivate ban
  UPDATE user_bans
  SET
    is_active = false,
    unbanned_by = v_admin_id,
    unbanned_at = NOW(),
    unban_reason = p_reason
  WHERE user_id = p_user_id AND is_active = true;

  -- Update user profile
  UPDATE profiles
  SET
    is_banned = false,
    banned_at = NULL,
    ban_reason = NULL
  WHERE id = p_user_id;

  -- Log activity
  INSERT INTO user_activity_logs (user_id, action_type, action_details)
  VALUES (p_user_id, 'unbanned', jsonb_build_object(
    'reason', p_reason,
    'unbanned_by', v_admin_id
  ));

  RETURN jsonb_build_object('success', true, 'message', 'User đã được unban');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Function: Grant tier
CREATE OR REPLACE FUNCTION admin_grant_tier(
  p_user_id UUID,
  p_tier_type VARCHAR,
  p_new_tier VARCHAR,
  p_reason TEXT DEFAULT NULL,
  p_expires_at TIMESTAMPTZ DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_admin_id UUID;
  v_old_tier VARCHAR;
BEGIN
  -- Get admin ID
  v_admin_id := auth.uid();

  -- Check if admin
  IF NOT EXISTS (
    SELECT 1 FROM profiles WHERE id = v_admin_id AND role IN ('admin', 'super_admin')
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Không có quyền admin');
  END IF;

  -- Validate tier type
  IF p_tier_type NOT IN ('scanner_tier', 'chatbot_tier') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Tier type không hợp lệ');
  END IF;

  -- Validate tier value
  IF p_new_tier NOT IN ('free', 'basic', 'premium', 'vip') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Tier value không hợp lệ');
  END IF;

  -- Get current tier
  IF p_tier_type = 'scanner_tier' THEN
    SELECT scanner_tier INTO v_old_tier FROM profiles WHERE id = p_user_id;
  ELSE
    SELECT chatbot_tier INTO v_old_tier FROM profiles WHERE id = p_user_id;
  END IF;

  -- Update profile
  IF p_tier_type = 'scanner_tier' THEN
    UPDATE profiles SET scanner_tier = p_new_tier WHERE id = p_user_id;
  ELSE
    UPDATE profiles SET chatbot_tier = p_new_tier WHERE id = p_user_id;
  END IF;

  -- Record grant
  INSERT INTO tier_grants (user_id, tier_type, old_tier, new_tier, reason, granted_by, expires_at)
  VALUES (p_user_id, p_tier_type, v_old_tier, p_new_tier, p_reason, v_admin_id, p_expires_at);

  -- Log activity
  INSERT INTO user_activity_logs (user_id, action_type, action_details)
  VALUES (p_user_id, 'tier_granted', jsonb_build_object(
    'tier_type', p_tier_type,
    'old_tier', v_old_tier,
    'new_tier', p_new_tier,
    'granted_by', v_admin_id
  ));

  RETURN jsonb_build_object(
    'success', true,
    'old_tier', v_old_tier,
    'new_tier', p_new_tier,
    'message', 'Tier đã được cập nhật'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Function: Get users with filters
CREATE OR REPLACE FUNCTION admin_get_users(
  p_search TEXT DEFAULT NULL,
  p_tier VARCHAR DEFAULT NULL,
  p_role VARCHAR DEFAULT NULL,
  p_is_banned BOOLEAN DEFAULT NULL,
  p_sort_by VARCHAR DEFAULT 'created_at',
  p_sort_order VARCHAR DEFAULT 'desc',
  p_limit INT DEFAULT 20,
  p_offset INT DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  scanner_tier VARCHAR,
  chatbot_tier VARCHAR,
  role VARCHAR,
  is_banned BOOLEAN,
  gems INT,
  total_posts BIGINT,
  total_spent NUMERIC,
  created_at TIMESTAMPTZ,
  last_active TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.email,
    p.full_name,
    p.avatar_url,
    p.scanner_tier,
    p.chatbot_tier,
    p.role,
    COALESCE(p.is_banned, false) AS is_banned,
    COALESCE(p.gems, 0) AS gems,
    (SELECT COUNT(*) FROM forum_posts WHERE user_id = p.id)::BIGINT AS total_posts,
    COALESCE(p.total_spent, 0)::NUMERIC AS total_spent,
    p.created_at,
    p.updated_at AS last_active
  FROM profiles p
  WHERE
    -- Search filter
    (p_search IS NULL OR
      p.email ILIKE '%' || p_search || '%' OR
      p.full_name ILIKE '%' || p_search || '%')
    -- Tier filter
    AND (p_tier IS NULL OR p.scanner_tier = p_tier OR p.chatbot_tier = p_tier)
    -- Role filter
    AND (p_role IS NULL OR p.role = p_role)
    -- Banned filter
    AND (p_is_banned IS NULL OR COALESCE(p.is_banned, false) = p_is_banned)
  ORDER BY
    CASE WHEN p_sort_by = 'created_at' AND p_sort_order = 'desc' THEN p.created_at END DESC,
    CASE WHEN p_sort_by = 'created_at' AND p_sort_order = 'asc' THEN p.created_at END ASC,
    CASE WHEN p_sort_by = 'email' AND p_sort_order = 'desc' THEN p.email END DESC,
    CASE WHEN p_sort_by = 'email' AND p_sort_order = 'asc' THEN p.email END ASC,
    CASE WHEN p_sort_by = 'gems' AND p_sort_order = 'desc' THEN COALESCE(p.gems, 0) END DESC,
    CASE WHEN p_sort_by = 'gems' AND p_sort_order = 'asc' THEN COALESCE(p.gems, 0) END ASC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Function: Get user activity logs
CREATE OR REPLACE FUNCTION admin_get_user_activity(
  p_user_id UUID,
  p_limit INT DEFAULT 50,
  p_offset INT DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  action_type VARCHAR,
  action_details JSONB,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  -- Check if admin
  IF NOT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  ) THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    l.id,
    l.action_type,
    l.action_details,
    l.created_at
  FROM user_activity_logs l
  WHERE l.user_id = p_user_id
  ORDER BY l.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Add columns to profiles if not exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'is_banned') THEN
    ALTER TABLE profiles ADD COLUMN is_banned BOOLEAN DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'banned_at') THEN
    ALTER TABLE profiles ADD COLUMN banned_at TIMESTAMPTZ;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'ban_reason') THEN
    ALTER TABLE profiles ADD COLUMN ban_reason TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'total_spent') THEN
    ALTER TABLE profiles ADD COLUMN total_spent NUMERIC DEFAULT 0;
  END IF;
END $$;

-- 11. Index for banned users
CREATE INDEX IF NOT EXISTS idx_profiles_banned ON profiles(is_banned) WHERE is_banned = true;
