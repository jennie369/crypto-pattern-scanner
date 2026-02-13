-- ═══════════════════════════════════════════════════════════════════
-- RESTORE TIER 3 FOR TEST ACCOUNT
-- Created: 2025-01-13
-- Purpose: Restore TIER 3 status for maow390@gmail.com test account
-- ═══════════════════════════════════════════════════════════════════

-- Update user tier to TIER3
UPDATE users
SET
  scanner_tier = 'TIER3',
  course_tier = 'TIER3',
  chatbot_tier = 'TIER3',
  scanner_tier_expires_at = NULL,  -- NULL = no expiration (lifetime)
  course_tier_expires_at = NULL,
  chatbot_tier_expires_at = NULL,
  updated_at = NOW()
WHERE email = 'maow390@gmail.com';

-- Verify the update
SELECT
  id,
  email,
  scanner_tier,
  course_tier,
  chatbot_tier,
  scanner_tier_expires_at,
  course_tier_expires_at,
  chatbot_tier_expires_at,
  updated_at
FROM users
WHERE email = 'maow390@gmail.com';

-- ═══════════════════════════════════════════════════════════════════
-- NOTES:
-- - Run this in Supabase SQL Editor
-- - After running, user should log out and log back in to refresh session
-- - Tier values: 'free', 'pro', 'premium', 'vip', OR 'TIER1', 'TIER2', 'TIER3'
-- - RLS policies accept both formats (check migration files)
-- ═══════════════════════════════════════════════════════════════════
