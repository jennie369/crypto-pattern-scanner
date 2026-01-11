-- ============================================================================
-- VERIFY FUNCTIONS - Run this to check which functions exist
-- ============================================================================

-- Check all required functions
SELECT
  'check_self_referral' as function_name,
  CASE WHEN EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'check_self_referral'
  ) THEN '✅ EXISTS' ELSE '❌ MISSING' END as status
UNION ALL
SELECT
  'validate_referral_code',
  CASE WHEN EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'validate_referral_code'
  ) THEN '✅ EXISTS' ELSE '❌ MISSING' END
UNION ALL
SELECT
  'increment_referral_count',
  CASE WHEN EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'increment_referral_count'
  ) THEN '✅ EXISTS' ELSE '❌ MISSING' END
UNION ALL
SELECT
  'link_user_to_waitlist',
  CASE WHEN EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'link_user_to_waitlist'
  ) THEN '✅ EXISTS' ELSE '❌ MISSING' END
UNION ALL
SELECT
  'auto_link_waitlist_to_existing_account',
  CASE WHEN EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'auto_link_waitlist_to_existing_account'
  ) THEN '✅ EXISTS' ELSE '❌ MISSING' END
UNION ALL
SELECT
  'check_waitlist_has_account',
  CASE WHEN EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'check_waitlist_has_account'
  ) THEN '✅ EXISTS' ELSE '❌ MISSING' END
UNION ALL
SELECT
  'check_waitlist_status',
  CASE WHEN EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'check_waitlist_status'
  ) THEN '✅ EXISTS' ELSE '❌ MISSING' END
UNION ALL
SELECT
  'validate_affiliate_relationship',
  CASE WHEN EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'validate_affiliate_relationship'
  ) THEN '✅ EXISTS' ELSE '❌ MISSING' END
UNION ALL
SELECT
  'apply_early_bird_benefits',
  CASE WHEN EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'apply_early_bird_benefits'
  ) THEN '✅ EXISTS' ELSE '❌ MISSING' END
UNION ALL
SELECT
  'expire_scanner_trials',
  CASE WHEN EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'expire_scanner_trials'
  ) THEN '✅ EXISTS' ELSE '❌ MISSING' END
ORDER BY status DESC, function_name;

-- Check required columns in profiles
SELECT
  column_name,
  CASE WHEN column_name IS NOT NULL THEN '✅ EXISTS' ELSE '❌ MISSING' END as status
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'profiles'
  AND column_name IN ('queue_number', 'waitlist_entry_id', 'waitlist_referral_code', 'scanner_trial_tier', 'scanner_trial_ends_at', 'early_bird_discount_code')
ORDER BY column_name;

-- Check required columns in waitlist_leads
SELECT
  column_name,
  CASE WHEN column_name IS NOT NULL THEN '✅ EXISTS' ELSE '❌ MISSING' END as status
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'waitlist_leads'
  AND column_name IN ('user_id', 'converted_at', 'affiliate_id', 'referred_by_code')
ORDER BY column_name;
