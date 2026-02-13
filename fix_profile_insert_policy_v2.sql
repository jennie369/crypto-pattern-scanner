-- =============================================
-- FIX: Profile Refresh & Data Loss Issue
-- ROOT CAUSE: Missing INSERT RLS Policy on users table
-- Run this in Supabase SQL Editor
-- =============================================

-- =============================================
-- STEP 1: Add Missing INSERT Policy
-- =============================================

DROP POLICY IF EXISTS "Users can insert own data" ON users;
CREATE POLICY "Users can insert own data"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- =============================================
-- STEP 2: Remove Dangerous GRANT Statements
-- =============================================

REVOKE ALL ON users FROM authenticated;
REVOKE ALL ON daily_scan_quota FROM authenticated;
REVOKE ALL ON scan_history FROM authenticated;
REVOKE ALL ON trading_journal FROM authenticated;
REVOKE ALL ON risk_calculations FROM authenticated;

-- =============================================
-- STEP 3: Verify All RLS Policies Exist
-- =============================================

SELECT
  schemaname,
  tablename,
  policyname,
  cmd as command
FROM pg_policies
WHERE tablename = 'users'
ORDER BY policyname;

-- Should show 3 policies: SELECT, UPDATE, INSERT

-- =============================================
-- STEP 4: Check Your Current User Record
-- =============================================

SELECT
  id,
  email,
  full_name,
  tier,
  telegram_id,
  role,
  created_at,
  updated_at
FROM users
WHERE id = auth.uid();

-- =============================================
-- STEP 5: Restore Tier to tier1 (if needed)
-- UNCOMMENT the line below if output shows tier = 'free'
-- =============================================

-- UPDATE users SET tier = 'tier1' WHERE id = auth.uid();

-- =============================================
-- STEP 6: Verify the fix worked
-- =============================================

-- Check your profile again
SELECT
  'Your Profile:' as status,
  email,
  tier,
  role,
  telegram_id
FROM users
WHERE id = auth.uid();
