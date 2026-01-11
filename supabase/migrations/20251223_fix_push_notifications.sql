-- ============================================================
-- FIX: Push Notifications System - Role Case Sensitivity
-- Date: 2024-12-23
-- Issue: Policies checking 'admin' but DB stores 'ADMIN'
-- Run this file in Supabase SQL Editor
-- ============================================================

-- ============================================================
-- PART 1: Fix RLS Policies for user_push_tokens
-- ============================================================

-- Drop and recreate admin policy with case-insensitive check
DROP POLICY IF EXISTS "Admin can view all push tokens" ON user_push_tokens;
DROP POLICY IF EXISTS "Admins read all tokens for broadcasting" ON user_push_tokens;

CREATE POLICY "Admins read all tokens for broadcasting" ON user_push_tokens
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (
        UPPER(profiles.role) = 'ADMIN'
        OR profiles.role = 'super_admin'
        OR profiles.is_admin = TRUE
      )
    )
  );

-- ============================================================
-- PART 2: Fix RLS Policies for notifications table
-- ============================================================

DROP POLICY IF EXISTS "Admins can insert notifications" ON public.notifications;
DROP POLICY IF EXISTS "Admins can delete notifications" ON public.notifications;

CREATE POLICY "Admins can insert notifications" ON public.notifications
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND (
        UPPER(role) = 'ADMIN'
        OR role = 'super_admin'
        OR is_admin = TRUE
      )
    )
  );

CREATE POLICY "Admins can delete notifications" ON public.notifications
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND (
        UPPER(role) = 'ADMIN'
        OR role = 'super_admin'
        OR is_admin = TRUE
      )
    )
  );

-- ============================================================
-- PART 3: Fix RLS Policies for system_notifications
-- ============================================================

DROP POLICY IF EXISTS "Admin can manage system notifications" ON system_notifications;

CREATE POLICY "Admin can manage system notifications" ON system_notifications
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (
        UPPER(profiles.role) = 'ADMIN'
        OR profiles.role = 'super_admin'
        OR profiles.is_admin = TRUE
      )
    )
  );

-- ============================================================
-- PART 4: Fix RLS Policies for notification_templates
-- ============================================================

DROP POLICY IF EXISTS "Admins can manage notification templates" ON notification_templates;

CREATE POLICY "Admins can manage notification templates" ON notification_templates
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (
        UPPER(profiles.role) = 'ADMIN'
        OR profiles.role IN ('admin', 'super_admin')
        OR profiles.is_admin = TRUE
      )
    )
  );

-- ============================================================
-- PART 5: Fix RLS Policies for notification_schedule
-- ============================================================

DROP POLICY IF EXISTS "Admins can manage notification schedule" ON notification_schedule;

CREATE POLICY "Admins can manage notification schedule" ON notification_schedule
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (
        UPPER(profiles.role) = 'ADMIN'
        OR profiles.role IN ('admin', 'super_admin')
        OR profiles.is_admin = TRUE
      )
    )
  );

-- ============================================================
-- PART 6: Fix RLS Policies for notification_logs
-- ============================================================

DROP POLICY IF EXISTS "Admins can view all notification logs" ON notification_logs;

CREATE POLICY "Admins can view all notification logs" ON notification_logs
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (
        UPPER(profiles.role) = 'ADMIN'
        OR profiles.role IN ('admin', 'super_admin')
        OR profiles.is_admin = TRUE
      )
    )
  );

-- ============================================================
-- PART 7: Fix admin_send_broadcast function
-- ============================================================

CREATE OR REPLACE FUNCTION admin_send_broadcast(
  p_title TEXT,
  p_body TEXT,
  p_admin_id UUID
) RETURNS JSONB AS $$
DECLARE
  v_count INTEGER;
  v_result JSONB;
BEGIN
  -- Verify admin (case-insensitive + is_admin flag)
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = p_admin_id
    AND (
      UPPER(role) = 'ADMIN'
      OR role = 'super_admin'
      OR is_admin = TRUE
    )
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

-- ============================================================
-- PART 8: Add Service Role policy for user_push_tokens
-- (Required for Edge Functions to read tokens)
-- ============================================================

DROP POLICY IF EXISTS "Service role full access to user_push_tokens" ON user_push_tokens;

CREATE POLICY "Service role full access to user_push_tokens" ON user_push_tokens
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- PART 9: Add Service Role policy for notifications
-- ============================================================

DROP POLICY IF EXISTS "Service role full access to notifications" ON public.notifications;

CREATE POLICY "Service role full access to notifications" ON public.notifications
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- PART 10: Add Service Role policy for system_notifications
-- ============================================================

DROP POLICY IF EXISTS "Service role full access to system_notifications" ON system_notifications;

CREATE POLICY "Service role full access to system_notifications" ON system_notifications
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- PART 11: Ensure notifications table has message column alias
-- (Some code uses 'message', some uses 'body')
-- ============================================================

-- Add message column as alias if not exists (generated column)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'notifications' AND column_name = 'message'
  ) THEN
    ALTER TABLE public.notifications ADD COLUMN message TEXT GENERATED ALWAYS AS (body) STORED;
  END IF;
EXCEPTION WHEN OTHERS THEN
  -- Column might already exist or other error, ignore
  NULL;
END $$;

-- ============================================================
-- PART 12: Verify tables have correct columns
-- ============================================================

-- Ensure notifications table has all required columns
DO $$
BEGIN
  -- Add data column if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'notifications' AND column_name = 'data'
  ) THEN
    ALTER TABLE public.notifications ADD COLUMN data JSONB DEFAULT '{}';
  END IF;

  -- Add image_url column if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'notifications' AND column_name = 'image_url'
  ) THEN
    ALTER TABLE public.notifications ADD COLUMN image_url TEXT;
  END IF;

  -- Add action_url column if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'notifications' AND column_name = 'action_url'
  ) THEN
    ALTER TABLE public.notifications ADD COLUMN action_url TEXT;
  END IF;
END $$;

-- ============================================================
-- PART 13: Grant permissions to authenticated users
-- ============================================================

GRANT ALL ON TABLE public.notifications TO authenticated;
GRANT ALL ON TABLE public.user_push_tokens TO authenticated;
GRANT ALL ON TABLE public.system_notifications TO authenticated;

-- ============================================================
-- COMPLETE!
-- ============================================================
SELECT 'Push Notifications Fix migration completed successfully!' as status;
