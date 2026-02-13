-- =============================================
-- STEP 4: TEST COMPLETE SIGNUP FLOW
-- =============================================
-- Script này test toàn bộ flow từ signup đến verify
-- Run AFTER you signup in the app
-- =============================================
-- Run in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/pgfkbcnzqozzkohwbgbk/sql
-- =============================================

-- =============================================
-- PART 1: VERIFY TRIGGER EXISTS
-- =============================================

SELECT
  '╔════════════════════════════════════════════════╗' as message
UNION ALL
SELECT '║  🧪 TESTING COMPLETE SIGNUP FLOW              ║'
UNION ALL
SELECT '╚════════════════════════════════════════════════╝';

SELECT '' AS separator;
SELECT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' AS separator;
SELECT '📌 PART 1: VERIFY TRIGGER EXISTS' AS section;
SELECT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' AS separator;

SELECT
  trigger_name,
  event_object_table,
  action_timing,
  CASE
    WHEN trigger_name = 'on_auth_user_created' THEN '✅ EXISTS'
    ELSE '❌ NOT FOUND'
  END AS status
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- =============================================
-- PART 2: VERIFY RLS POLICIES
-- =============================================

SELECT '' AS separator;
SELECT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' AS separator;
SELECT '📌 PART 2: VERIFY RLS POLICIES' AS section;
SELECT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' AS separator;

SELECT
  policyname,
  cmd,
  roles,
  CASE
    WHEN cmd = 'SELECT' THEN '👁️  View'
    WHEN cmd = 'UPDATE' THEN '✏️  Edit'
    WHEN cmd = 'INSERT' THEN '➕ Create'
    ELSE '❓ Unknown'
  END AS action
FROM pg_policies
WHERE tablename = 'users'
ORDER BY cmd, policyname;

SELECT '' AS separator;
SELECT '✅ Expected: 4 policies' AS info;
SELECT '  - 1 SELECT policy' AS detail;
SELECT '  - 1 UPDATE policy' AS detail;
SELECT '  - 2 INSERT policies (service_role + authenticated)' AS detail;

-- =============================================
-- PART 3: CHECK USER COUNT
-- =============================================

SELECT '' AS separator;
SELECT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' AS separator;
SELECT '📌 PART 3: USER COUNT' AS section;
SELECT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' AS separator;

-- Count users in auth.users
SELECT
  'auth.users' AS table_name,
  COUNT(*) AS total_users
FROM auth.users;

-- Count users in public.users
SELECT
  'public.users' AS table_name,
  COUNT(*) AS total_users
FROM public.users;

SELECT '' AS separator;
SELECT '✅ These numbers should MATCH!' AS info;
SELECT '   If auth.users > public.users → Signup failed to create profile' AS detail;

-- =============================================
-- PART 4: FIND USERS WITHOUT PROFILE
-- =============================================

SELECT '' AS separator;
SELECT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' AS separator;
SELECT '📌 PART 4: USERS WITHOUT PROFILE (SHOULD BE 0)' AS section;
SELECT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' AS separator;

SELECT
  'Missing profiles:' AS status,
  a.id,
  a.email,
  a.created_at AS auth_created_at
FROM auth.users a
LEFT JOIN public.users p ON p.id = a.id
WHERE p.id IS NULL
ORDER BY a.created_at DESC;

SELECT '' AS separator;
SELECT '✅ Expected: 0 rows (no missing profiles)' AS info;
SELECT '❌ If you see rows → Trigger failed for these users' AS warning;

-- =============================================
-- PART 5: RECENT SIGNUPS (LAST 5)
-- =============================================

SELECT '' AS separator;
SELECT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' AS separator;
SELECT '📌 PART 5: RECENT SIGNUPS (LAST 5)' AS section;
SELECT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' AS separator;

SELECT
  p.id,
  p.email,
  p.full_name,
  p.tier,
  p.scanner_tier,
  p.chatbot_tier,
  p.course_tier,
  p.created_at,
  CASE
    WHEN p.created_at > NOW() - INTERVAL '5 minutes' THEN '🆕 Just now!'
    WHEN p.created_at > NOW() - INTERVAL '1 hour' THEN '⏰ Recent'
    ELSE '📅 Older'
  END AS recency
FROM public.users p
ORDER BY p.created_at DESC
LIMIT 5;

-- =============================================
-- PART 6: CHECK SPECIFIC USER (REPLACE EMAIL)
-- =============================================

SELECT '' AS separator;
SELECT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' AS separator;
SELECT '📌 PART 6: CHECK YOUR TEST USER' AS section;
SELECT '   ⚠️ REPLACE EMAIL BELOW WITH YOUR TEST EMAIL' AS instruction;
SELECT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' AS separator;

-- ⚠️ CHANGE THIS EMAIL TO YOUR TEST EMAIL!
DO $$
DECLARE
  test_email TEXT := 'test@example.com'; -- ← CHANGE THIS!
  auth_exists BOOLEAN;
  profile_exists BOOLEAN;
  quota_exists BOOLEAN;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '🔍 Checking user: %', test_email;
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';

  -- Check auth.users
  SELECT EXISTS(SELECT 1 FROM auth.users WHERE email = test_email) INTO auth_exists;

  IF auth_exists THEN
    RAISE NOTICE '✅ User exists in auth.users';
  ELSE
    RAISE NOTICE '❌ User NOT found in auth.users';
  END IF;

  -- Check public.users
  SELECT EXISTS(SELECT 1 FROM public.users WHERE email = test_email) INTO profile_exists;

  IF profile_exists THEN
    RAISE NOTICE '✅ Profile exists in public.users';

    -- Show profile details
    FOR rec IN
      SELECT
        id,
        tier,
        scanner_tier,
        chatbot_tier,
        course_tier,
        created_at
      FROM public.users
      WHERE email = test_email
    LOOP
      RAISE NOTICE '   ID: %', rec.id;
      RAISE NOTICE '   Tier: %', rec.tier;
      RAISE NOTICE '   Scanner: %', rec.scanner_tier;
      RAISE NOTICE '   Chatbot: %', rec.chatbot_tier;
      RAISE NOTICE '   Course: %', rec.course_tier;
      RAISE NOTICE '   Created: %', rec.created_at;
    END LOOP;

  ELSE
    RAISE NOTICE '❌ Profile NOT found in public.users';
  END IF;

  -- Check quota
  SELECT EXISTS(
    SELECT 1
    FROM daily_scan_quota q
    JOIN public.users u ON u.id = q.user_id
    WHERE u.email = test_email
  ) INTO quota_exists;

  IF quota_exists THEN
    RAISE NOTICE '✅ Daily quota exists';

    FOR rec IN
      SELECT
        scan_count,
        max_scans,
        last_reset
      FROM daily_scan_quota q
      JOIN public.users u ON u.id = q.user_id
      WHERE u.email = test_email
    LOOP
      RAISE NOTICE '   Scans used: % / %', rec.scan_count, rec.max_scans;
      RAISE NOTICE '   Last reset: %', rec.last_reset;
    END LOOP;

  ELSE
    RAISE NOTICE '⚠️ Daily quota NOT found';
  END IF;

  RAISE NOTICE '';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';

  IF auth_exists AND profile_exists AND quota_exists THEN
    RAISE NOTICE '🎉 SIGNUP SUCCESSFUL - All data present!';
  ELSIF auth_exists AND NOT profile_exists THEN
    RAISE NOTICE '❌ SIGNUP FAILED - Profile not created (trigger failed)';
  ELSIF auth_exists AND profile_exists AND NOT quota_exists THEN
    RAISE NOTICE '⚠️ SIGNUP PARTIAL - Profile OK, quota missing';
  ELSE
    RAISE NOTICE '❓ User not found - Did you signup yet?';
  END IF;

END $$;

-- =============================================
-- PART 7: SUMMARY
-- =============================================

SELECT '' AS separator;
SELECT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' AS separator;
SELECT '📊 SUMMARY' AS section;
SELECT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' AS separator;

SELECT
  '✅ Trigger exists: ' || CASE WHEN EXISTS(
    SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'on_auth_user_created'
  ) THEN 'YES' ELSE 'NO' END AS check_1;

SELECT
  '✅ RLS policies: ' || COUNT(*) || ' / 4' AS check_2
FROM pg_policies
WHERE tablename = 'users';

SELECT
  '✅ Users in auth.users: ' || COUNT(*) AS check_3
FROM auth.users;

SELECT
  '✅ Users in public.users: ' || COUNT(*) AS check_4
FROM public.users;

SELECT
  '⚠️ Missing profiles: ' || COUNT(*) AS check_5
FROM auth.users a
LEFT JOIN public.users p ON p.id = a.id
WHERE p.id IS NULL;

SELECT '' AS separator;
SELECT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' AS separator;
SELECT '🎉 TEST COMPLETE!' AS status;
SELECT '   Check results above to verify signup flow' AS info;
SELECT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' AS separator;
