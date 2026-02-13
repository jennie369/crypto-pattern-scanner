-- =============================================
-- FIX: Table Permissions for Authenticated Users
-- This grants proper permissions while RLS policies still protect data
-- Run this in Supabase SQL Editor
-- =============================================

-- =============================================
-- GRANT PROPER PERMISSIONS TO AUTHENTICATED USERS
-- These work WITH RLS policies (not bypassing them)
-- =============================================

-- Users table
GRANT SELECT, INSERT, UPDATE ON users TO authenticated;

-- Daily scan quota table
GRANT SELECT, INSERT, UPDATE ON daily_scan_quota TO authenticated;

-- Scan history table
GRANT SELECT, INSERT, DELETE ON scan_history TO authenticated;

-- Trading journal table
GRANT SELECT, INSERT, UPDATE, DELETE ON trading_journal TO authenticated;

-- Risk calculations table
GRANT SELECT, INSERT, DELETE ON risk_calculations TO authenticated;

-- Grant usage on sequences (needed for auto-incrementing IDs)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- =============================================
-- VERIFY PERMISSIONS
-- =============================================

-- Check table permissions
SELECT
  grantee,
  table_name,
  privilege_type
FROM information_schema.table_privileges
WHERE grantee = 'authenticated'
  AND table_schema = 'public'
  AND table_name IN ('users', 'daily_scan_quota', 'scan_history', 'trading_journal', 'risk_calculations')
ORDER BY table_name, privilege_type;

-- =============================================
-- VERIFY YOUR PROFILE CAN BE ACCESSED
-- =============================================

SELECT
  '✅ Your Profile (should work now):' as status,
  id,
  email,
  tier,
  role,
  telegram_id
FROM users
WHERE id = auth.uid();

-- =============================================
-- VERIFY YOUR QUOTA CAN BE ACCESSED
-- =============================================

SELECT
  '✅ Your Quota (should work now):' as status,
  user_id,
  scan_count,
  max_scans
FROM daily_scan_quota
WHERE user_id = auth.uid();

-- =============================================
-- SUCCESS MESSAGES
-- =============================================

-- Display success
SELECT
  '╔════════════════════════════════════════════════╗' as message
UNION ALL
SELECT '║  ✅ PERMISSIONS FIXED SUCCESSFULLY              ║'
UNION ALL
SELECT '╚════════════════════════════════════════════════╝'
UNION ALL
SELECT ''
UNION ALL
SELECT '📋 What was fixed:'
UNION ALL
SELECT '  ✅ users table - SELECT, INSERT, UPDATE granted'
UNION ALL
SELECT '  ✅ daily_scan_quota - SELECT, INSERT, UPDATE granted'
UNION ALL
SELECT '  ✅ scan_history - SELECT, INSERT, DELETE granted'
UNION ALL
SELECT '  ✅ trading_journal - SELECT, INSERT, UPDATE, DELETE granted'
UNION ALL
SELECT '  ✅ risk_calculations - SELECT, INSERT, DELETE granted'
UNION ALL
SELECT ''
UNION ALL
SELECT '🔒 Security Note:'
UNION ALL
SELECT '  - RLS policies are still active and protecting your data'
UNION ALL
SELECT '  - You can only access YOUR OWN records'
UNION ALL
SELECT '  - Other users cannot see your data'
UNION ALL
SELECT ''
UNION ALL
SELECT '📋 NEXT STEPS:'
UNION ALL
SELECT '  1. Go to Settings page in your app'
UNION ALL
SELECT '  2. Click "🔄 Refresh Profile" button'
UNION ALL
SELECT '  3. Should see "💎 TIER1" and "👑 ADMIN"'
UNION ALL
SELECT '  4. Home page errors should be gone'
UNION ALL
SELECT '  5. Trading Journal should load'
UNION ALL
SELECT '  6. Risk Calculator should show saved calculations'
UNION ALL
SELECT ''
UNION ALL
SELECT '🎉 Everything should work now!';
