-- =============================================
-- TEST RLS POLICIES DIRECTLY
-- =============================================
-- This script tests if INSERT policy works at SQL level
-- Run this in Supabase SQL Editor to verify RLS
-- =============================================

-- =============================================
-- STEP 1: Verify RLS Policies Exist
-- =============================================

SELECT 'Checking RLS policies on users table...' as status;

SELECT
  policyname,
  cmd as command,
  qual as using_clause,
  with_check as with_check_clause
FROM pg_policies
WHERE tablename = 'users'
ORDER BY policyname;

-- Expected: 3 policies (SELECT, UPDATE, INSERT)

-- =============================================
-- STEP 2: Check RLS Is Enabled
-- =============================================

SELECT 'Checking if RLS is enabled...' as status;

SELECT
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename = 'users'
AND schemaname = 'public';

-- Expected: rls_enabled = true

-- =============================================
-- STEP 3: Test INSERT as Service Role (Should Work)
-- =============================================

-- Generate a test user ID
DO $$
DECLARE
  test_user_id UUID := gen_random_uuid();
  test_email TEXT := 'test-rls-' || floor(random() * 10000)::text || '@example.com';
BEGIN
  RAISE NOTICE 'Testing INSERT as service role...';
  RAISE NOTICE 'Test user ID: %', test_user_id;
  RAISE NOTICE 'Test email: %', test_email;

  -- Try to insert (as service role, should work)
  INSERT INTO users (id, email, full_name, tier, course_tier, scanner_tier, chatbot_tier)
  VALUES (
    test_user_id,
    test_email,
    'RLS Test User',
    'free',
    'free',
    'free',
    'free'
  );

  RAISE NOTICE '✅ INSERT successful!';

  -- Verify it was inserted
  IF EXISTS (SELECT 1 FROM users WHERE id = test_user_id) THEN
    RAISE NOTICE '✅ User found in database';
  ELSE
    RAISE NOTICE '❌ User NOT found in database';
  END IF;

  -- Clean up test user
  DELETE FROM users WHERE id = test_user_id;
  RAISE NOTICE '🧹 Test user cleaned up';

EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '❌ INSERT failed: %', SQLERRM;
END $$;

-- =============================================
-- STEP 4: Check How Many Users Exist
-- =============================================

SELECT 'Current users count:' as status;

SELECT
  COUNT(*) as total_users,
  COUNT(CASE WHEN tier = 'free' THEN 1 END) as free_users,
  COUNT(CASE WHEN tier != 'free' THEN 1 END) as paid_users
FROM users;

-- =============================================
-- STEP 5: Test IF Current Auth User Can Insert (When Logged In)
-- =============================================

-- UNCOMMENT and run this when you're logged in to test RLS as authenticated user:

/*
DO $$
DECLARE
  my_user_id UUID := auth.uid();
  test_email TEXT;
BEGIN
  IF my_user_id IS NULL THEN
    RAISE NOTICE '❌ No authenticated user (auth.uid() is NULL)';
    RAISE NOTICE '   You need to be logged in to test this';
  ELSE
    RAISE NOTICE '✅ Authenticated user ID: %', my_user_id;

    -- Check if user already has profile
    IF EXISTS (SELECT 1 FROM users WHERE id = my_user_id) THEN
      RAISE NOTICE '✅ User profile already exists';
    ELSE
      RAISE NOTICE '⏳ User profile does NOT exist yet';
      RAISE NOTICE '   Attempting to create profile...';

      -- Get email from auth.users
      SELECT email INTO test_email FROM auth.users WHERE id = my_user_id;

      -- Try to insert
      INSERT INTO users (id, email, full_name, tier, course_tier, scanner_tier, chatbot_tier)
      VALUES (
        my_user_id,
        test_email,
        'RLS Test User (Authenticated)',
        'free',
        'free',
        'free',
        'free'
      );

      RAISE NOTICE '✅ Profile created successfully!';
    END IF;
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '❌ Failed: %', SQLERRM;
    RAISE NOTICE '   Error Code: %', SQLSTATE;
END $$;
*/

-- =============================================
-- STEP 6: Summary
-- =============================================

SELECT
  '╔════════════════════════════════════════════════╗' as message
UNION ALL
SELECT '║  RLS POLICY TEST COMPLETE                     ║'
UNION ALL
SELECT '╚════════════════════════════════════════════════╝'
UNION ALL
SELECT ''
UNION ALL
SELECT '📊 Check results above:'
UNION ALL
SELECT '  1. Do you see 3 policies? (SELECT, UPDATE, INSERT)'
UNION ALL
SELECT '  2. Is RLS enabled = true?'
UNION ALL
SELECT '  3. Did test INSERT succeed?'
UNION ALL
SELECT ''
UNION ALL
SELECT '🧪 NEXT:'
UNION ALL
SELECT '  1. Hard refresh browser (Ctrl+Shift+R)'
UNION ALL
SELECT '  2. Try signup again'
UNION ALL
SELECT '  3. Check console for "✅ Auth user created" logs';

-- =============================================
-- TROUBLESHOOTING QUERIES
-- =============================================

-- Check auth.users table (contains ALL auth users)
-- SELECT id, email, created_at FROM auth.users ORDER BY created_at DESC LIMIT 5;

-- Check public.users table (should match auth.users after signup)
-- SELECT id, email, tier, created_at FROM users ORDER BY created_at DESC LIMIT 5;

-- Find users in auth but not in public (signup failed to create profile)
/*
SELECT
  'Users in auth.users but NOT in public.users:' as status,
  a.email,
  a.created_at as auth_created_at
FROM auth.users a
LEFT JOIN public.users p ON p.id = a.id
WHERE p.id IS NULL
ORDER BY a.created_at DESC
LIMIT 5;
*/
