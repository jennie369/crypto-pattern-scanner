-- =============================================
-- MIGRATION: Add 3 Separate Tier Columns
-- Supports independent pricing for Course, Scanner, Chatbot
-- Run this in Supabase SQL Editor
-- =============================================

-- =============================================
-- STEP 1: ADD NEW TIER COLUMNS
-- =============================================

-- Add course_tier column
ALTER TABLE users
ADD COLUMN IF NOT EXISTS course_tier VARCHAR(20) DEFAULT 'free'
CHECK (course_tier IN ('free', 'tier1', 'tier2', 'tier3'));

-- Add scanner_tier column
ALTER TABLE users
ADD COLUMN IF NOT EXISTS scanner_tier VARCHAR(20) DEFAULT 'free'
CHECK (scanner_tier IN ('free', 'pro', 'premium', 'vip'));

-- Add chatbot_tier column
ALTER TABLE users
ADD COLUMN IF NOT EXISTS chatbot_tier VARCHAR(20) DEFAULT 'free'
CHECK (chatbot_tier IN ('free', 'pro', 'premium'));

-- =============================================
-- STEP 2: MIGRATE EXISTING DATA
-- Map old 'tier' column to new scanner_tier
-- =============================================

-- Migrate existing tier data to scanner_tier
-- Mapping: free→free, tier1→pro, tier2→premium, tier3→vip
UPDATE users
SET scanner_tier = CASE
  WHEN tier = 'free' THEN 'free'
  WHEN tier = 'tier1' THEN 'pro'
  WHEN tier = 'tier2' THEN 'premium'
  WHEN tier = 'tier3' THEN 'vip'
  ELSE 'free'
END
WHERE scanner_tier = 'free'; -- Only update if not already set

-- Set course_tier for existing paid users
-- Assumption: If they have scanner tier, give them basic course access
UPDATE users
SET course_tier = 'tier1'
WHERE scanner_tier IN ('pro', 'premium', 'vip')
AND course_tier = 'free';

-- =============================================
-- STEP 3: CREATE INDEXES FOR PERFORMANCE
-- =============================================

CREATE INDEX IF NOT EXISTS idx_users_course_tier ON users(course_tier);
CREATE INDEX IF NOT EXISTS idx_users_scanner_tier ON users(scanner_tier);
CREATE INDEX IF NOT EXISTS idx_users_chatbot_tier ON users(chatbot_tier);

-- =============================================
-- STEP 4: UPDATE shopify_orders TABLE
-- Add product_type column to track which product was purchased
-- =============================================

ALTER TABLE shopify_orders
ADD COLUMN IF NOT EXISTS product_type VARCHAR(20) DEFAULT 'scanner'
CHECK (product_type IN ('course', 'scanner', 'chatbot'));

ALTER TABLE shopify_orders
DROP CONSTRAINT IF EXISTS shopify_orders_tier_purchased_check;

ALTER TABLE shopify_orders
ADD CONSTRAINT shopify_orders_tier_purchased_check
CHECK (
  (product_type = 'course' AND tier_purchased IN ('tier1', 'tier2', 'tier3')) OR
  (product_type = 'scanner' AND tier_purchased IN ('pro', 'premium', 'vip')) OR
  (product_type = 'chatbot' AND tier_purchased IN ('pro', 'premium'))
);

-- =============================================
-- STEP 5: VERIFY MIGRATION
-- =============================================

-- Check new columns exist
SELECT
  column_name,
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'users'
AND column_name IN ('course_tier', 'scanner_tier', 'chatbot_tier')
ORDER BY column_name;

-- Check data migration (should show counts for each tier)
SELECT
  course_tier,
  scanner_tier,
  chatbot_tier,
  COUNT(*) as user_count
FROM users
GROUP BY course_tier, scanner_tier, chatbot_tier
ORDER BY user_count DESC;

-- Check shopify_orders updated
SELECT
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'shopify_orders'
AND column_name = 'product_type';

-- =============================================
-- STEP 6: UPDATE RLS POLICIES (Already exist, just verify)
-- =============================================

-- Users can still view their own profile with new columns
-- No policy changes needed as SELECT * still works

-- =============================================
-- SUCCESS MESSAGE
-- =============================================

SELECT
  '╔════════════════════════════════════════════════╗' as message
UNION ALL
SELECT '║  ✅ 3-TIER MIGRATION COMPLETED                 ║'
UNION ALL
SELECT '╚════════════════════════════════════════════════╝'
UNION ALL
SELECT ''
UNION ALL
SELECT '📊 New Tier Structure:'
UNION ALL
SELECT '  🎓 course_tier: free/tier1/tier2/tier3'
UNION ALL
SELECT '  🔍 scanner_tier: free/pro/premium/vip'
UNION ALL
SELECT '  🤖 chatbot_tier: free/pro/premium'
UNION ALL
SELECT ''
UNION ALL
SELECT '📋 What Changed:'
UNION ALL
SELECT '  ✅ Added 3 new tier columns to users table'
UNION ALL
SELECT '  ✅ Migrated existing tier data to scanner_tier'
UNION ALL
SELECT '  ✅ Created indexes for fast queries'
UNION ALL
SELECT '  ✅ Updated shopify_orders table structure'
UNION ALL
SELECT '  ✅ Added product_type tracking'
UNION ALL
SELECT ''
UNION ALL
SELECT '🔄 Data Migration:'
UNION ALL
SELECT '  ✅ Old tier → scanner_tier mapping complete'
UNION ALL
SELECT '  ✅ Paid users given basic course access'
UNION ALL
SELECT ''
UNION ALL
SELECT '📋 NEXT STEPS:'
UNION ALL
SELECT '  1. Update AuthContext to fetch 3 tier columns'
UNION ALL
SELECT '  2. Update Pricing.jsx with new pricing structure'
UNION ALL
SELECT '  3. Update PatternScanner to use scanner_tier'
UNION ALL
SELECT '  4. Update Shopify webhook to handle 3 product types'
UNION ALL
SELECT '  5. Deploy and test!'
UNION ALL
SELECT ''
UNION ALL
SELECT '🎉 Ready for new pricing system!';

-- =============================================
-- ROLLBACK SCRIPT (if needed)
-- =============================================
-- Uncomment below to rollback changes

-- ALTER TABLE users DROP COLUMN IF EXISTS course_tier;
-- ALTER TABLE users DROP COLUMN IF EXISTS scanner_tier;
-- ALTER TABLE users DROP COLUMN IF EXISTS chatbot_tier;
-- ALTER TABLE shopify_orders DROP COLUMN IF EXISTS product_type;
-- DROP INDEX IF EXISTS idx_users_course_tier;
-- DROP INDEX IF EXISTS idx_users_scanner_tier;
-- DROP INDEX IF EXISTS idx_users_chatbot_tier;
