-- =====================================================
-- DM SAFETY FEATURES
-- Migration: 20241117000004
-- Purpose: Add block and report functionality
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLE 1: Blocked Users
-- =====================================================
CREATE TABLE IF NOT EXISTS public.blocked_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  blocker_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Prevent duplicate blocks
  UNIQUE(blocker_id, blocked_id),

  -- Prevent self-blocking
  CONSTRAINT no_self_block CHECK (blocker_id != blocked_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_blocked_users_blocker ON public.blocked_users(blocker_id);
CREATE INDEX IF NOT EXISTS idx_blocked_users_blocked ON public.blocked_users(blocked_id);

-- RLS Policies
ALTER TABLE public.blocked_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their blocks" ON public.blocked_users;
CREATE POLICY "Users can view their blocks"
  ON public.blocked_users FOR SELECT
  USING (auth.uid() = blocker_id);

DROP POLICY IF EXISTS "Users can create blocks" ON public.blocked_users;
CREATE POLICY "Users can create blocks"
  ON public.blocked_users FOR INSERT
  WITH CHECK (auth.uid() = blocker_id);

DROP POLICY IF EXISTS "Users can delete their blocks" ON public.blocked_users;
CREATE POLICY "Users can delete their blocks"
  ON public.blocked_users FOR DELETE
  USING (auth.uid() = blocker_id);

-- =====================================================
-- TABLE 2: User Reports
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  reported_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  report_type TEXT NOT NULL CHECK (report_type IN (
    'spam',
    'harassment',
    'inappropriate_content',
    'scam',
    'other'
  )),
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending',
    'reviewed',
    'resolved',
    'dismissed'
  )),
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,

  -- Prevent self-reporting
  CONSTRAINT no_self_report CHECK (reporter_id != reported_user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_reports_reporter ON public.user_reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_user_reports_reported ON public.user_reports(reported_user_id);
CREATE INDEX IF NOT EXISTS idx_user_reports_status ON public.user_reports(status);

-- RLS Policies
ALTER TABLE public.user_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their reports" ON public.user_reports;
CREATE POLICY "Users can view their reports"
  ON public.user_reports FOR SELECT
  USING (auth.uid() = reporter_id);

DROP POLICY IF EXISTS "Users can create reports" ON public.user_reports;
CREATE POLICY "Users can create reports"
  ON public.user_reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

-- =====================================================
-- FUNCTION: Check if user is blocked
-- =====================================================
CREATE OR REPLACE FUNCTION is_user_blocked(
  user_a UUID,
  user_b UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM blocked_users
    WHERE (blocker_id = user_a AND blocked_id = user_b)
       OR (blocker_id = user_b AND blocked_id = user_a)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNCTION: Get blocked users for a user
-- =====================================================
CREATE OR REPLACE FUNCTION get_blocked_users(user_id_param UUID)
RETURNS TABLE (
  blocked_user_id UUID,
  blocked_user_email TEXT,
  blocked_user_name TEXT,
  blocked_at TIMESTAMPTZ,
  reason TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    b.blocked_id,
    u.email,
    u.display_name,
    b.created_at,
    b.reason
  FROM blocked_users b
  JOIN users u ON u.id = b.blocked_id
  WHERE b.blocker_id = user_id_param
  ORDER BY b.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================
GRANT ALL ON public.blocked_users TO authenticated;
GRANT ALL ON public.user_reports TO authenticated;

-- Force schema reload
NOTIFY pgrst, 'reload schema';

-- =====================================================
-- VERIFY TABLES CREATED
-- =====================================================
DO $$
DECLARE
  table_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables
  WHERE table_schema = 'public'
    AND table_name IN ('blocked_users', 'user_reports');

  IF table_count = 2 THEN
    RAISE NOTICE '✅ SUCCESS: Both safety tables created';
    RAISE NOTICE '   - blocked_users table created';
    RAISE NOTICE '   - user_reports table created';
    RAISE NOTICE '🔐 RLS policies enabled';
    RAISE NOTICE '⚡ Helper functions created';
  ELSE
    RAISE WARNING '⚠️  Only % tables created. Expected 2.', table_count;
  END IF;
END $$;

-- Comments
COMMENT ON TABLE public.blocked_users IS 'Users who have blocked each other';
COMMENT ON TABLE public.user_reports IS 'User reports for inappropriate behavior';
COMMENT ON FUNCTION is_user_blocked(UUID, UUID) IS 'Check if two users have blocked each other';
COMMENT ON FUNCTION get_blocked_users(UUID) IS 'Get list of users blocked by a specific user';
