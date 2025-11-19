-- =============================================
-- QUICK TEST: Check if signup created user
-- =============================================
-- Run this AFTER you signup to verify user exists
-- =============================================

-- Replace 'your-email@example.com' with the email you just signed up with
SELECT
  id,
  email,
  full_name,
  tier,
  course_tier,
  scanner_tier,
  chatbot_tier,
  created_at,
  updated_at
FROM users
WHERE email = 'test-fix-signup@example.com' -- CHANGE THIS to your test email
ORDER BY created_at DESC
LIMIT 1;

-- =============================================
-- Expected Result:
-- =============================================
-- If signup worked: You should see 1 row with your user data
-- If signup failed: Empty result (0 rows)

-- =============================================
-- ALSO CHECK: All recent users (last 10)
-- =============================================

SELECT
  email,
  full_name,
  tier,
  scanner_tier,
  created_at
FROM users
ORDER BY created_at DESC
LIMIT 10;

-- =============================================
-- CHECK: Quota was created
-- =============================================

SELECT
  u.email,
  q.scan_count,
  q.max_scans,
  q.created_at as quota_created
FROM daily_scan_quota q
JOIN users u ON u.id = q.user_id
WHERE u.email = 'test-fix-signup@example.com' -- CHANGE THIS
ORDER BY q.created_at DESC
LIMIT 1;
