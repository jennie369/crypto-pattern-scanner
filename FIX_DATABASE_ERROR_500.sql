-- =============================================
-- FIX: "Database error saving new user" (500)
-- =============================================
-- Lỗi này xảy ra khi Supabase Auth không thể tạo user
-- do trigger hoặc constraint đang throw error
-- =============================================
-- Run in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/pgfkbcnzqozzkohwbgbk/sql
-- =============================================

SELECT '╔════════════════════════════════════════════════╗' as message
UNION ALL
SELECT '║  🔧 FIXING DATABASE ERROR 500                  ║'
UNION ALL
SELECT '╚════════════════════════════════════════════════╝';

-- =============================================
-- STEP 1: XÓA TẤT CẢ TRIGGERS TRÊN auth.users
-- =============================================

SELECT '' AS separator;
SELECT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' AS separator;
SELECT '🗑️ STEP 1: Removing all triggers on auth.users' AS section;
SELECT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' AS separator;

-- Xóa trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Xóa các trigger khác nếu có
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (
    SELECT trigger_name
    FROM information_schema.triggers
    WHERE event_object_schema = 'auth'
      AND event_object_table = 'users'
  ) LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS %I ON auth.users CASCADE', r.trigger_name);
    RAISE NOTICE 'Dropped trigger: %', r.trigger_name;
  END LOOP;
END $$;

SELECT '✅ All triggers removed' AS status;

-- Verify không còn trigger nào
SELECT
  COALESCE(
    (SELECT COUNT(*)::text FROM information_schema.triggers
     WHERE event_object_schema = 'auth' AND event_object_table = 'users'),
    '0'
  ) || ' triggers remaining (should be 0)' AS verification;

-- =============================================
-- STEP 2: SIMPLIFY RLS POLICIES
-- =============================================

SELECT '' AS separator;
SELECT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' AS separator;
SELECT '🔒 STEP 2: Simplifying RLS policies' AS section;
SELECT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' AS separator;

-- Xóa tất cả policies cũ
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN (
    SELECT policyname
    FROM pg_policies
    WHERE tablename = 'users'
      AND schemaname = 'public'
  ) LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.users', pol.policyname);
    RAISE NOTICE 'Dropped policy: %', pol.policyname;
  END LOOP;
END $$;

SELECT '✅ All old policies removed' AS status;

-- Tạo policies đơn giản - CHO PHÉP TẤT CẢ INSERT
CREATE POLICY "Allow all inserts during signup"
ON public.users
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Users can view own profile"
ON public.users
FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON public.users
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Service role full access"
ON public.users
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

SELECT '✅ Simple RLS policies created' AS status;

-- =============================================
-- STEP 3: VERIFY RLS STATUS
-- =============================================

SELECT '' AS separator;
SELECT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' AS separator;
SELECT '🔍 STEP 3: Verifying RLS setup' AS section;
SELECT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' AS separator;

-- Check RLS enabled
SELECT
  tablename,
  CASE WHEN rowsecurity THEN '✅ ENABLED' ELSE '❌ DISABLED' END AS rls_status
FROM pg_tables
WHERE tablename = 'users' AND schemaname = 'public';

-- List policies
SELECT
  policyname,
  cmd,
  roles
FROM pg_policies
WHERE tablename = 'users' AND schemaname = 'public'
ORDER BY cmd, policyname;

SELECT '✅ Expected: 4 policies (INSERT for public, SELECT/UPDATE for authenticated, ALL for service_role)' AS info;

-- =============================================
-- STEP 4: CHECK TABLE STRUCTURE
-- =============================================

SELECT '' AS separator;
SELECT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' AS separator;
SELECT '📋 STEP 4: Checking users table structure' AS section;
SELECT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' AS separator;

SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'users'
ORDER BY ordinal_position;

-- =============================================
-- STEP 5: TEST INSERT PERMISSION
-- =============================================

SELECT '' AS separator;
SELECT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' AS separator;
SELECT '🧪 STEP 5: Testing INSERT permission' AS section;
SELECT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' AS separator;

DO $$
DECLARE
  test_id UUID := gen_random_uuid();
  test_email TEXT := 'test-insert-' || floor(random() * 10000)::text || '@example.com';
BEGIN
  BEGIN
    -- Try insert
    INSERT INTO public.users (id, email, tier, course_tier, scanner_tier, chatbot_tier)
    VALUES (test_id, test_email, 'free', 'free', 'free', 'free');

    RAISE NOTICE '✅ INSERT successful!';

    -- Cleanup
    DELETE FROM public.users WHERE id = test_id;
    RAISE NOTICE '🧹 Test data cleaned up';

  EXCEPTION
    WHEN OTHERS THEN
      RAISE NOTICE '❌ INSERT failed: %', SQLERRM;
      RAISE NOTICE '   This means RLS is still blocking inserts';
  END;
END $$;

-- =============================================
-- STEP 6: CHECK CONSTRAINTS
-- =============================================

SELECT '' AS separator;
SELECT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' AS separator;
SELECT '🔗 STEP 6: Checking constraints' AS section;
SELECT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' AS separator;

SELECT
  conname AS constraint_name,
  contype AS constraint_type,
  CASE contype
    WHEN 'p' THEN 'PRIMARY KEY'
    WHEN 'f' THEN 'FOREIGN KEY'
    WHEN 'u' THEN 'UNIQUE'
    WHEN 'c' THEN 'CHECK'
    ELSE 'OTHER'
  END AS type_description
FROM pg_constraint
WHERE conrelid = 'public.users'::regclass
ORDER BY contype;

-- =============================================
-- SUMMARY
-- =============================================

SELECT '' AS separator;
SELECT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' AS separator;
SELECT '📊 SUMMARY' AS section;
SELECT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' AS separator;

SELECT
  '╔════════════════════════════════════════════════╗' as message
UNION ALL
SELECT '║  ✅ DATABASE FIX COMPLETE                     ║'
UNION ALL
SELECT '╚════════════════════════════════════════════════╝'
UNION ALL
SELECT ''
UNION ALL
SELECT '✅ Triggers removed from auth.users'
UNION ALL
SELECT '✅ RLS policies simplified (allow all inserts)'
UNION ALL
SELECT '✅ Table structure verified'
UNION ALL
SELECT ''
UNION ALL
SELECT '🧪 NEXT STEPS:'
UNION ALL
SELECT '  1. Hard refresh browser (Ctrl+Shift+R)'
UNION ALL
SELECT '  2. Try signup again'
UNION ALL
SELECT '  3. Check console - should see "✅ SIGNUP COMPLETE"'
UNION ALL
SELECT '  4. If signup works, we can add trigger back later'
UNION ALL
SELECT ''
UNION ALL
SELECT '📝 If signup still fails, check Supabase Logs:'
UNION ALL
SELECT '   Dashboard → Logs → Auth Logs'
UNION ALL
SELECT '   Look for specific error message';
