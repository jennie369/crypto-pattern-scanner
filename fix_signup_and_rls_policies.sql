-- =============================================
-- FIX: Signup Not Creating Users + RLS Policies
-- =============================================
-- ROOT CAUSES:
-- 1. Missing INSERT policy on users table
-- 2. Missing RLS policies on pending_tier_upgrades table
-- 3. AuthContext doesn't check insert errors
-- =============================================
-- Run this in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/pgfkbcnzqozzkohwbgbk/sql
-- =============================================

-- =============================================
-- STEP 1: Add Missing INSERT Policy for Users Table
-- =============================================

DROP POLICY IF EXISTS "Users can insert own data" ON users;
CREATE POLICY "Users can insert own data"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = id);

COMMENT ON POLICY "Users can insert own data" ON users IS
'Allows authenticated users to create their own profile during signup';

-- =============================================
-- STEP 2: Enable RLS on pending_tier_upgrades
-- =============================================

ALTER TABLE pending_tier_upgrades ENABLE ROW LEVEL SECURITY;

-- =============================================
-- STEP 3: Add RLS Policies for pending_tier_upgrades
-- =============================================

-- Policy 1: Service role can insert (from Shopify webhook)
DROP POLICY IF EXISTS "Service role can insert pending upgrades" ON pending_tier_upgrades;
CREATE POLICY "Service role can insert pending upgrades"
  ON pending_tier_upgrades FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Policy 2: Service role can update (to mark as applied)
DROP POLICY IF EXISTS "Service role can update pending upgrades" ON pending_tier_upgrades;
CREATE POLICY "Service role can update pending upgrades"
  ON pending_tier_upgrades FOR UPDATE
  TO service_role
  USING (true);

-- Policy 3: Service role can select (for debugging)
DROP POLICY IF EXISTS "Service role can view all pending upgrades" ON pending_tier_upgrades;
CREATE POLICY "Service role can view all pending upgrades"
  ON pending_tier_upgrades FOR SELECT
  TO service_role
  USING (true);

-- Policy 4: Users can view their own pending upgrades
DROP POLICY IF EXISTS "Users can view own pending upgrades" ON pending_tier_upgrades;
CREATE POLICY "Users can view own pending upgrades"
  ON pending_tier_upgrades FOR SELECT
  TO authenticated
  USING (
    email = (SELECT email FROM users WHERE id = auth.uid())
  );

-- =============================================
-- STEP 4: Verify All RLS Policies Exist
-- =============================================

SELECT
  '=== USERS TABLE POLICIES ===' as section,
  policyname,
  cmd as command,
  roles
FROM pg_policies
WHERE tablename = 'users'
ORDER BY policyname;

SELECT
  '=== PENDING_TIER_UPGRADES POLICIES ===' as section,
  policyname,
  cmd as command,
  roles
FROM pg_policies
WHERE tablename = 'pending_tier_upgrades'
ORDER BY policyname;

-- =============================================
-- STEP 5: Check Current RLS Status
-- =============================================

SELECT
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename IN ('users', 'pending_tier_upgrades', 'daily_scan_quota')
ORDER BY tablename;

-- =============================================
-- STEP 6: Test INSERT Permission (Optional)
-- =============================================

-- UNCOMMENT to test if insert works now:
-- BEGIN;
--   INSERT INTO users (id, email, full_name, tier, course_tier, scanner_tier, chatbot_tier)
--   VALUES (
--     auth.uid(),
--     (SELECT email FROM auth.users WHERE id = auth.uid()),
--     'Test User',
--     'free',
--     'free',
--     'free',
--     'free'
--   );
-- ROLLBACK; -- Don't actually insert, just test

-- =============================================
-- SUCCESS MESSAGE
-- =============================================

SELECT
  '╔════════════════════════════════════════════════╗' as message
UNION ALL
SELECT '║  ✅ RLS POLICIES FIXED                         ║'
UNION ALL
SELECT '╚════════════════════════════════════════════════╝'
UNION ALL
SELECT ''
UNION ALL
SELECT '✅ Users table: INSERT policy added'
UNION ALL
SELECT '✅ pending_tier_upgrades: RLS enabled'
UNION ALL
SELECT '✅ pending_tier_upgrades: 4 policies added'
UNION ALL
SELECT ''
UNION ALL
SELECT '🧪 NEXT STEPS:'
UNION ALL
SELECT '  1. Test signup in app'
UNION ALL
SELECT '  2. Check if user appears in database'
UNION ALL
SELECT '  3. Test refresh button in settings'
UNION ALL
SELECT '  4. Test buy-then-signup flow'
UNION ALL
SELECT ''
UNION ALL
SELECT '📝 If signup still fails, check AuthContext error logs';

-- =============================================
-- TROUBLESHOOTING QUERIES
-- =============================================

-- Check if you have any existing users
-- SELECT COUNT(*) as total_users FROM users;

-- Check if you have any pending upgrades
-- SELECT COUNT(*) as total_pending FROM pending_tier_upgrades WHERE applied = FALSE;

-- Check your own profile (run when logged in)
-- SELECT * FROM users WHERE id = auth.uid();

-- Check pending upgrades for an email
-- SELECT * FROM pending_tier_upgrades WHERE email = 'your-email@example.com';
