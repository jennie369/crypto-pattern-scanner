-- =============================================
-- STEP 2: FIX RLS POLICIES - COMPREHENSIVE
-- =============================================
-- Fix tất cả RLS policies cho users table
-- Cho phép trigger + authenticated users insert
-- =============================================
-- Run in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/pgfkbcnzqozzkohwbgbk/sql
-- =============================================

-- ===== XÓA TẤT CẢ POLICIES CŨ =====
DROP POLICY IF EXISTS "Users can read own data" ON public.users;
DROP POLICY IF EXISTS "Users can update own data" ON public.users;
DROP POLICY IF EXISTS "Users can insert own data" ON public.users;
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.users;
DROP POLICY IF EXISTS "Service role can insert users" ON public.users;
DROP POLICY IF EXISTS "Authenticated users can insert own profile" ON public.users;

SELECT '🗑️ Dropped all old policies' AS status;

-- ===== BẬT RLS =====
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

SELECT '🔒 RLS enabled on users table' AS status;

-- =============================================
-- POLICY 1: SELECT - Users can view own profile
-- =============================================
CREATE POLICY "Users can view own profile"
ON public.users
FOR SELECT
TO authenticated
USING (auth.uid() = id);

COMMENT ON POLICY "Users can view own profile" ON public.users IS
'Authenticated users can read their own profile data';

SELECT '✅ Policy 1 created: SELECT (view own profile)' AS status;

-- =============================================
-- POLICY 2: UPDATE - Users can update own profile
-- =============================================
CREATE POLICY "Users can update own profile"
ON public.users
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

COMMENT ON POLICY "Users can update own profile" ON public.users IS
'Authenticated users can update their own profile data';

SELECT '✅ Policy 2 created: UPDATE (update own profile)' AS status;

-- =============================================
-- POLICY 3: INSERT - Service role (for trigger)
-- =============================================
CREATE POLICY "Service role can insert users"
ON public.users
FOR INSERT
TO service_role
WITH CHECK (true);

COMMENT ON POLICY "Service role can insert users" ON public.users IS
'Service role (trigger) can insert new user profiles';

SELECT '✅ Policy 3 created: INSERT (service role)' AS status;

-- =============================================
-- POLICY 4: INSERT - Authenticated users (fallback)
-- =============================================
CREATE POLICY "Authenticated users can insert own profile"
ON public.users
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

COMMENT ON POLICY "Authenticated users can insert own profile" ON public.users IS
'Authenticated users can create their own profile as fallback';

SELECT '✅ Policy 4 created: INSERT (authenticated - fallback)' AS status;

-- =============================================
-- VERIFY ALL POLICIES
-- =============================================

SELECT
  '╔════════════════════════════════════════════════╗' as message
UNION ALL
SELECT '║  ✅ RLS POLICIES FIXED - COMPREHENSIVE        ║'
UNION ALL
SELECT '╚════════════════════════════════════════════════╝'
UNION ALL
SELECT ''
UNION ALL
SELECT '📊 POLICIES LIST:';

-- List all policies
SELECT
  policyname AS policy_name,
  cmd AS command,
  roles AS role,
  CASE
    WHEN policyname LIKE '%view%' THEN '👁️  Read own data'
    WHEN policyname LIKE '%update%' THEN '✏️  Edit own data'
    WHEN policyname LIKE '%service%' THEN '🤖 Trigger insert'
    WHEN policyname LIKE '%Authenticated%' THEN '🔄 Fallback insert'
    ELSE '❓ Unknown'
  END AS description
FROM pg_policies
WHERE tablename = 'users'
ORDER BY policyname;

SELECT '' AS separator;
SELECT '✅ Expected: 4 policies' AS status;
SELECT '  1. Users can view own profile (SELECT)' AS detail;
SELECT '  2. Users can update own profile (UPDATE)' AS detail;
SELECT '  3. Service role can insert users (INSERT)' AS detail;
SELECT '  4. Authenticated users can insert own profile (INSERT)' AS detail;

-- Check RLS is enabled
SELECT '' AS separator;
SELECT '🔒 RLS Status:' AS status;

SELECT
  schemaname,
  tablename,
  CASE
    WHEN rowsecurity THEN '✅ ENABLED'
    ELSE '❌ DISABLED'
  END AS rls_status
FROM pg_tables
WHERE tablename = 'users'
AND schemaname = 'public';

SELECT '' AS separator;
SELECT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' AS separator;
SELECT '🎉 RLS POLICIES READY!' AS status;
SELECT 'Users can: SELECT own, UPDATE own, INSERT own' AS info;
SELECT 'Trigger can: INSERT any user' AS info;
SELECT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' AS separator;
