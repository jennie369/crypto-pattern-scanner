-- =====================================================
-- FIX ADMIN RLS POLICIES
-- Date: 2025-11-26
-- Description: Update RLS policies to properly check all admin indicators
-- =====================================================

-- Create a helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_user_admin(user_id_param UUID)
RETURNS BOOLEAN AS $$
DECLARE
  user_profile RECORD;
BEGIN
  SELECT role, is_admin, scanner_tier, chatbot_tier
  INTO user_profile
  FROM profiles
  WHERE id = user_id_param;

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  RETURN (
    user_profile.role = 'admin' OR
    user_profile.role = 'ADMIN' OR
    user_profile.is_admin = TRUE OR
    user_profile.scanner_tier = 'ADMIN' OR
    user_profile.chatbot_tier = 'ADMIN'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- UPDATE PARTNERSHIP APPLICATIONS POLICIES
-- =====================================================

-- Drop existing admin policy
DROP POLICY IF EXISTS "Admins can manage all applications" ON partnership_applications;

-- Create new admin policy with comprehensive check
CREATE POLICY "Admins can manage all applications"
  ON partnership_applications FOR ALL
  TO authenticated
  USING (is_user_admin(auth.uid()));

-- =====================================================
-- UPDATE WITHDRAWAL REQUESTS POLICIES
-- =====================================================

-- Drop existing admin policy
DROP POLICY IF EXISTS "Admins can manage all withdrawals" ON withdrawal_requests;

-- Create new admin policy with comprehensive check
CREATE POLICY "Admins can manage all withdrawals"
  ON withdrawal_requests FOR ALL
  TO authenticated
  USING (is_user_admin(auth.uid()));

-- =====================================================
-- UPDATE PROFILES POLICIES (if needed)
-- =====================================================

-- Allow admins to update other users' profiles
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;

CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  TO authenticated
  USING (
    id = auth.uid() OR is_user_admin(auth.uid())
  )
  WITH CHECK (
    id = auth.uid() OR is_user_admin(auth.uid())
  );

-- Allow admins to read all profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    id = auth.uid() OR is_user_admin(auth.uid())
  );

-- =====================================================
-- UPDATE CHATBOT_QUOTA POLICIES (Admin can view/manage all)
-- =====================================================

-- Enable RLS if not already
ALTER TABLE chatbot_quota ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own quota" ON chatbot_quota;
DROP POLICY IF EXISTS "Users can insert own quota" ON chatbot_quota;
DROP POLICY IF EXISTS "Users can update own quota" ON chatbot_quota;
DROP POLICY IF EXISTS "Admins can manage all quota" ON chatbot_quota;

-- User policies
CREATE POLICY "Users can view own quota"
  ON chatbot_quota FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR is_user_admin(auth.uid()));

CREATE POLICY "Users can insert own quota"
  ON chatbot_quota FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own quota"
  ON chatbot_quota FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() OR is_user_admin(auth.uid()));

-- Admin full access
CREATE POLICY "Admins can manage all quota"
  ON chatbot_quota FOR ALL
  TO authenticated
  USING (is_user_admin(auth.uid()));

-- =====================================================
-- UPDATE USER_PURCHASES POLICIES
-- =====================================================

-- Enable RLS if not already
ALTER TABLE user_purchases ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own purchases" ON user_purchases;
DROP POLICY IF EXISTS "Admins can manage all purchases" ON user_purchases;

-- User policies
CREATE POLICY "Users can view own purchases"
  ON user_purchases FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR is_user_admin(auth.uid()));

-- Admin full access
CREATE POLICY "Admins can manage all purchases"
  ON user_purchases FOR ALL
  TO authenticated
  USING (is_user_admin(auth.uid()));

-- =====================================================
-- UPDATE VOICE_USAGE POLICIES (for voice quota tracking)
-- =====================================================

-- Enable RLS if table exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'voice_usage') THEN
    EXECUTE 'ALTER TABLE voice_usage ENABLE ROW LEVEL SECURITY';

    -- Drop existing policies
    EXECUTE 'DROP POLICY IF EXISTS "Users can view own voice usage" ON voice_usage';
    EXECUTE 'DROP POLICY IF EXISTS "Users can insert own voice usage" ON voice_usage';
    EXECUTE 'DROP POLICY IF EXISTS "Admins can manage all voice usage" ON voice_usage';

    -- Create policies
    EXECUTE 'CREATE POLICY "Users can view own voice usage"
      ON voice_usage FOR SELECT
      TO authenticated
      USING (user_id = auth.uid() OR is_user_admin(auth.uid()))';

    EXECUTE 'CREATE POLICY "Users can insert own voice usage"
      ON voice_usage FOR INSERT
      TO authenticated
      WITH CHECK (user_id = auth.uid())';

    EXECUTE 'CREATE POLICY "Admins can manage all voice usage"
      ON voice_usage FOR ALL
      TO authenticated
      USING (is_user_admin(auth.uid()))';
  END IF;
END $$;

-- =====================================================
-- VERIFICATION
-- =====================================================
SELECT 'is_user_admin function created' as status
WHERE EXISTS (
  SELECT 1 FROM pg_proc WHERE proname = 'is_user_admin'
);

-- Show all admin-related policies
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE policyname ILIKE '%admin%'
ORDER BY tablename;
