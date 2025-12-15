-- =============================================
-- GEM Mobile - Notifications System (Combined)
-- Issue #25: System Notifications không hiện
-- Supports BOTH:
--   1. forum_notifications with is_broadcast (forumService.js)
--   2. notifications table with user_id IS NULL (notificationService.js)
-- =============================================

-- ============================================
-- PART 1: Fix user_push_tokens table
-- ============================================

-- Create user_push_tokens if not exists
CREATE TABLE IF NOT EXISTS user_push_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  push_token TEXT NOT NULL,
  device_type VARCHAR(20) DEFAULT 'unknown',
  device_name VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, push_token)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_push_tokens_user_id ON user_push_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_user_push_tokens_active ON user_push_tokens(is_active) WHERE is_active = TRUE;

-- Enable RLS
ALTER TABLE user_push_tokens ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users manage own tokens" ON user_push_tokens;
CREATE POLICY "Users manage own tokens" ON user_push_tokens
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins read all tokens for broadcasting" ON user_push_tokens;
CREATE POLICY "Admins read all tokens for broadcasting" ON user_push_tokens
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (role = 'admin' OR is_admin = TRUE))
  );

-- Grant permissions
GRANT ALL ON user_push_tokens TO authenticated;

-- ============================================
-- PART 2: Add broadcast support to forum_notifications
-- (Used by forumService.js)
-- ============================================

-- Add is_broadcast column if not exists
ALTER TABLE forum_notifications
ADD COLUMN IF NOT EXISTS is_broadcast BOOLEAN DEFAULT FALSE;

-- Create index for broadcast notifications
CREATE INDEX IF NOT EXISTS idx_forum_notifications_broadcast ON forum_notifications(is_broadcast) WHERE is_broadcast = TRUE;

-- Update RLS for broadcast notifications
DROP POLICY IF EXISTS "Users can view notifications" ON forum_notifications;
DROP POLICY IF EXISTS "Users can view own and broadcast notifications" ON forum_notifications;

CREATE POLICY "Users can view own and broadcast notifications" ON forum_notifications
  FOR SELECT USING (
    auth.uid() = user_id OR is_broadcast = TRUE
  );

-- ============================================
-- PART 3: Create notifications table
-- (Used by notificationService.js)
-- ============================================

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Target (NULL = broadcast to all users)
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Content
  type VARCHAR(50) NOT NULL DEFAULT 'system',
  title VARCHAR(200) NOT NULL,
  body TEXT NOT NULL,

  -- Optional data
  data JSONB DEFAULT '{}',
  image_url TEXT,
  action_url TEXT,

  -- Sender info (for social notifications)
  from_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Status
  read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

-- Ensure indexes exist
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON public.notifications(user_id, read) WHERE read = FALSE;
CREATE INDEX IF NOT EXISTS idx_notifications_broadcast ON public.notifications(created_at DESC) WHERE user_id IS NULL;

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own and broadcast notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Admins can insert notifications" ON public.notifications;
DROP POLICY IF EXISTS "Admins can delete notifications" ON public.notifications;
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;

-- RLS Policies for notifications table
-- Key: Users can see their own notifications OR broadcast notifications (user_id IS NULL)
CREATE POLICY "Users can view own and broadcast notifications" ON public.notifications
  FOR SELECT USING (
    user_id = auth.uid() OR user_id IS NULL
  );

CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can insert notifications" ON public.notifications
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete notifications" ON public.notifications
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Allow system/service role to insert (for RPC functions)
CREATE POLICY "System can insert notifications" ON public.notifications
  FOR INSERT WITH CHECK (true);

-- ============================================
-- PART 4: Broadcast functions
-- ============================================

-- Function to insert broadcast notification to forum_notifications (all users)
CREATE OR REPLACE FUNCTION insert_broadcast_notification(
  p_title TEXT,
  p_message TEXT,
  p_sent_by UUID DEFAULT NULL
) RETURNS TABLE(inserted_count INTEGER) AS $$
DECLARE
  v_count INTEGER;
BEGIN
  -- Insert notification for all users (except sender if provided)
  WITH inserted AS (
    INSERT INTO forum_notifications (
      id,
      user_id,
      type,
      title,
      message,
      is_broadcast,
      read,
      created_at
    )
    SELECT
      gen_random_uuid(),
      id,
      'system',
      p_title,
      p_message,
      TRUE,
      FALSE,
      NOW()
    FROM profiles
    WHERE id != COALESCE(p_sent_by, '00000000-0000-0000-0000-000000000000'::UUID)
    RETURNING 1
  )
  SELECT COUNT(*) INTO v_count FROM inserted;

  RETURN QUERY SELECT v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION insert_broadcast_notification(TEXT, TEXT, UUID) TO authenticated;

-- Function for admin to send broadcast with tracking
CREATE OR REPLACE FUNCTION admin_send_broadcast(
  p_title TEXT,
  p_body TEXT,
  p_admin_id UUID
) RETURNS JSONB AS $$
DECLARE
  v_count INTEGER;
  v_result JSONB;
BEGIN
  -- Verify admin
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = p_admin_id AND (role = 'admin' OR is_admin = TRUE)
  ) THEN
    RETURN jsonb_build_object(
      'success', FALSE,
      'error', 'Unauthorized: Admin access required'
    );
  END IF;

  -- Insert broadcast notifications to forum_notifications
  SELECT * INTO v_count FROM insert_broadcast_notification(p_title, p_body, p_admin_id);

  -- Also insert to notifications table as broadcast (user_id = NULL)
  INSERT INTO public.notifications (
    user_id,
    type,
    title,
    body,
    data
  ) VALUES (
    NULL, -- Broadcast to all
    'system',
    p_title,
    p_body,
    jsonb_build_object('sent_by', p_admin_id)
  );

  -- Log to system_notifications if table exists
  BEGIN
    INSERT INTO system_notifications (
      id,
      title,
      body,
      target_audience,
      sent_by,
      sent_count,
      sent_at,
      status,
      created_at
    ) VALUES (
      gen_random_uuid(),
      p_title,
      p_body,
      'all',
      p_admin_id,
      v_count,
      NOW(),
      'sent',
      NOW()
    );
  EXCEPTION WHEN undefined_table THEN
    -- system_notifications table doesn't exist, skip logging
    NULL;
  END;

  RETURN jsonb_build_object(
    'success', TRUE,
    'sent_count', v_count,
    'message', 'Broadcast sent to ' || v_count || ' users'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION admin_send_broadcast(TEXT, TEXT, UUID) TO authenticated;

-- Send Broadcast Notification RPC (for notificationService.js)
CREATE OR REPLACE FUNCTION send_broadcast_notification(
  p_title VARCHAR(200),
  p_message TEXT,
  p_type VARCHAR(50) DEFAULT 'system',
  p_data JSONB DEFAULT '{}',
  p_image_url TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  -- Insert broadcast notification (user_id = NULL means all users)
  INSERT INTO public.notifications (
    user_id,
    type,
    title,
    body,
    data,
    image_url
  ) VALUES (
    NULL, -- Broadcast to all
    p_type,
    p_title,
    p_message,
    p_data,
    p_image_url
  )
  RETURNING id INTO v_notification_id;

  RETURN json_build_object(
    'success', true,
    'notification_id', v_notification_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Send Notification to Specific Users RPC
CREATE OR REPLACE FUNCTION send_notification_to_users(
  p_user_ids UUID[],
  p_title VARCHAR(200),
  p_message TEXT,
  p_type VARCHAR(50) DEFAULT 'system',
  p_data JSONB DEFAULT '{}'
)
RETURNS JSON AS $$
DECLARE
  v_user_id UUID;
  v_count INTEGER := 0;
BEGIN
  FOREACH v_user_id IN ARRAY p_user_ids LOOP
    INSERT INTO public.notifications (
      user_id,
      type,
      title,
      body,
      data
    ) VALUES (
      v_user_id,
      p_type,
      p_title,
      p_message,
      p_data
    );
    v_count := v_count + 1;
  END LOOP;

  RETURN json_build_object(
    'success', true,
    'sent_count', v_count
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comments
COMMENT ON TABLE public.notifications IS 'User notifications - NULL user_id means broadcast to all';
COMMENT ON FUNCTION send_broadcast_notification IS 'Send notification to all users (broadcast)';
COMMENT ON FUNCTION send_notification_to_users IS 'Send notification to specific users';
COMMENT ON FUNCTION admin_send_broadcast IS 'Admin function to send broadcast to all users';
COMMENT ON FUNCTION insert_broadcast_notification IS 'Insert broadcast notification to forum_notifications table';
