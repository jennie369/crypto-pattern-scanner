-- =============================================
-- RESTORE MISSING USER PROFILE
-- This will create your user record in the database
-- Run this in Supabase SQL Editor
-- =============================================

-- =============================================
-- STEP 1: Create your user profile record
-- =============================================

INSERT INTO users (
  id,
  email,
  full_name,
  tier,
  role,
  created_at,
  updated_at
)
SELECT
  auth.uid() as id,
  au.email,
  au.raw_user_meta_data->>'full_name' as full_name,
  'tier1' as tier,
  'user' as role,
  NOW() as created_at,
  NOW() as updated_at
FROM auth.users au
WHERE au.id = auth.uid()
ON CONFLICT (id) DO UPDATE SET
  tier = 'tier1',
  role = 'user',
  updated_at = NOW();

-- =============================================
-- STEP 2: Create daily scan quota record
-- =============================================

INSERT INTO daily_scan_quota (
  user_id,
  scan_count,
  max_scans,
  last_reset_at
)
VALUES (
  auth.uid(),
  0,
  100,  -- Tier1 gets 100 scans (or unlimited, adjust as needed)
  NOW()
)
ON CONFLICT (user_id) DO UPDATE SET
  max_scans = 100,
  last_reset_at = NOW();

-- =============================================
-- STEP 3: Verify your profile was created
-- =============================================

SELECT
  '✅ Your Profile Created Successfully' as status,
  id,
  email,
  full_name,
  tier,
  role,
  created_at
FROM users
WHERE id = auth.uid();

-- =============================================
-- STEP 4: Verify your quota record
-- =============================================

SELECT
  '✅ Your Daily Quota Record' as status,
  user_id,
  scan_count,
  max_scans,
  last_reset_at
FROM daily_scan_quota
WHERE user_id = auth.uid();

-- =============================================
-- SUCCESS!
-- =============================================

-- If you see your email and tier='tier1' above, you're all set!
--
-- NEXT STEPS:
-- 1. Go to Settings page in your app
-- 2. Click "🔄 Refresh Profile" button
-- 3. You should see "💎 TIER1" instead of "🆓 FREE"
-- 4. Go to Risk Calculator - saved calculations list should appear
-- 5. Test sign out/in - your tier should persist now!
--
-- If you need to reconnect Telegram:
-- - Go to Settings page
-- - Find the Telegram Alerts section
-- - Follow the connection steps again
