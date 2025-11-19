-- =============================================
-- UPGRADE ACCOUNT TO TIER 1+
-- Email: jenniechu68@gmail.com
-- =============================================

-- Update user to Tier 1 with 1 year expiration
UPDATE users
SET
  tier = 'tier1',
  tier_expires_at = NOW() + INTERVAL '1 year',
  updated_at = NOW()
WHERE email = 'jenniechu68@gmail.com';

-- Verify the update
SELECT
  id,
  email,
  full_name,
  tier,
  tier_expires_at,
  created_at,
  updated_at
FROM users
WHERE email = 'jenniechu68@gmail.com';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Account upgraded successfully!';
  RAISE NOTICE '📧 Email: jenniechu68@gmail.com';
  RAISE NOTICE '⭐ Tier: TIER 1';
  RAISE NOTICE '📅 Expires: 1 year from now';
  RAISE NOTICE '🎉 You can now access Telegram features!';
END $$;
