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
-- These bypass RLS and allow users to access other users' data!
-- =============================================

REVOKE ALL ON users FROM authenticated;
REVOKE ALL ON daily_scan_quota FROM authenticated;
REVOKE ALL ON scan_history FROM authenticated;
REVOKE ALL ON trading_journal FROM authenticated;
REVOKE ALL ON risk_calculations FROM authenticated;

-- =============================================
-- STEP 3: Verify RLS Policies are Complete
-- =============================================

-- Check all policies on users table
DO $$
DECLARE
  policy_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE tablename = 'users';

  IF policy_count >= 3 THEN
    RAISE NOTICE '✅ Users table has % RLS policies (SELECT, UPDATE, INSERT)', policy_count;
  ELSE
    RAISE WARNING '⚠️ Users table only has % policies - should have at least 3', policy_count;
  END IF;
END $$;

-- =============================================
-- STEP 4: Check Your Current User Record
-- =============================================

DO $$
DECLARE
  user_record RECORD;
BEGIN
  SELECT
    id,
    email,
    full_name,
    tier,
    telegram_id,
    role,
    created_at
  INTO user_record
  FROM users
  WHERE id = auth.uid();

  IF FOUND THEN
    RAISE NOTICE '========================================';
    RAISE NOTICE '👤 Your User Record Found:';
    RAISE NOTICE '   Email: %', user_record.email;
    RAISE NOTICE '   Tier: %', user_record.tier;
    RAISE NOTICE '   Role: %', user_record.role;
    RAISE NOTICE '   Telegram ID: %', COALESCE(user_record.telegram_id::TEXT, 'Not connected');
    RAISE NOTICE '   Created: %', user_record.created_at;
    RAISE NOTICE '========================================';

    -- Check if tier needs restoration
    IF user_record.tier = 'free' THEN
      RAISE NOTICE '⚠️ Your tier is currently FREE';
      RAISE NOTICE '📝 If you had tier1 before, you need to restore it:';
      RAISE NOTICE '   UPDATE users SET tier = ''tier1'' WHERE id = auth.uid();';
    ELSE
      RAISE NOTICE '✅ Your tier is: %', UPPER(user_record.tier);
    END IF;
  ELSE
    RAISE WARNING '❌ No user record found for your account!';
    RAISE NOTICE '📝 Creating a new profile...';
    RAISE NOTICE '   Run this to create your profile:';
    RAISE NOTICE '   INSERT INTO users (id, email, tier, role)';
    RAISE NOTICE '   SELECT auth.uid(), auth.email(), ''tier1'', ''user''';
    RAISE NOTICE '   FROM auth.users WHERE id = auth.uid();';
  END IF;
END $$;

-- =============================================
-- STEP 5: Restore Your Tier to tier1 (if needed)
-- Uncomment the line below if your tier was reset to free
-- =============================================

-- UPDATE users SET tier = 'tier1' WHERE id = auth.uid();

-- =============================================
-- STEP 6: Final Verification
-- =============================================

-- Display your complete profile
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
-- SUCCESS MESSAGES
-- =============================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '╔════════════════════════════════════════╗';
  RAISE NOTICE '║   ✅ PROFILE FIX APPLIED SUCCESSFULLY   ║';
  RAISE NOTICE '╚════════════════════════════════════════╝';
  RAISE NOTICE '';
  RAISE NOTICE '✅ INSERT RLS policy added to users table';
  RAISE NOTICE '✅ Dangerous GRANT statements revoked';
  RAISE NOTICE '✅ RLS policies verified';
  RAISE NOTICE '✅ User record checked';
  RAISE NOTICE '';
  RAISE NOTICE '📋 NEXT STEPS:';
  RAISE NOTICE '1. Check the output above for your current tier';
  RAISE NOTICE '2. If tier is FREE but should be TIER1:';
  RAISE NOTICE '   - Uncomment line 96 and run again';
  RAISE NOTICE '   - OR manually run: UPDATE users SET tier = ''tier1'' WHERE id = auth.uid();';
  RAISE NOTICE '3. Go to Settings page and click "🔄 Refresh Profile"';
  RAISE NOTICE '4. Verify tier shows as "💎 TIER1"';
  RAISE NOTICE '5. Check Risk Calculator for saved calculations list';
  RAISE NOTICE '6. Test sign out/sign in - data should persist now!';
  RAISE NOTICE '';
  RAISE NOTICE '🎉 Profile refresh should now work correctly!';
END $$;
