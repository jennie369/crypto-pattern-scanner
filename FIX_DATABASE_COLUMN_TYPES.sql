-- =============================================
-- FIX: Chatbot Tier Column Type Error
-- =============================================
-- Error: 'invalid input syntax for type integer: "premium"'
-- Cause: chatbot_tier column is INTEGER instead of VARCHAR
-- =============================================

-- =============================================
-- STEP 1: CHECK CURRENT COLUMN TYPES
-- =============================================

SELECT
  column_name,
  data_type,
  character_maximum_length,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'users'
AND column_name IN ('course_tier', 'scanner_tier', 'chatbot_tier')
ORDER BY column_name;

-- Expected result:
-- column_name   | data_type       | character_maximum_length
-- chatbot_tier  | character varying | 20
-- course_tier   | character varying | 20
-- scanner_tier  | character varying | 20

-- =============================================
-- STEP 2: FIX CHATBOT_TIER COLUMN TYPE
-- =============================================

-- Drop existing constraints first
ALTER TABLE users
DROP CONSTRAINT IF EXISTS users_chatbot_tier_check;

-- Change column type to VARCHAR
ALTER TABLE users
ALTER COLUMN chatbot_tier TYPE VARCHAR(20);

-- Set default
ALTER TABLE users
ALTER COLUMN chatbot_tier SET DEFAULT 'free';

-- Re-add constraint
ALTER TABLE users
ADD CONSTRAINT users_chatbot_tier_check
CHECK (chatbot_tier IN ('free', 'pro', 'premium'));

-- =============================================
-- STEP 3: VERIFY ALL 3 TIER COLUMNS
-- =============================================

-- Fix course_tier if needed
ALTER TABLE users
DROP CONSTRAINT IF EXISTS users_course_tier_check;

ALTER TABLE users
ALTER COLUMN course_tier TYPE VARCHAR(20);

ALTER TABLE users
ALTER COLUMN course_tier SET DEFAULT 'free';

ALTER TABLE users
ADD CONSTRAINT users_course_tier_check
CHECK (course_tier IN ('free', 'tier1', 'tier2', 'tier3'));

-- Fix scanner_tier if needed
ALTER TABLE users
DROP CONSTRAINT IF EXISTS users_scanner_tier_check;

ALTER TABLE users
ALTER COLUMN scanner_tier TYPE VARCHAR(20);

ALTER TABLE users
ALTER COLUMN scanner_tier SET DEFAULT 'free';

ALTER TABLE users
ADD CONSTRAINT users_scanner_tier_check
CHECK (scanner_tier IN ('free', 'pro', 'premium', 'vip'));

-- =============================================
-- STEP 4: VERIFY FIX WORKED
-- =============================================

SELECT
  column_name,
  data_type,
  character_maximum_length,
  column_default
FROM information_schema.columns
WHERE table_name = 'users'
AND column_name IN ('course_tier', 'scanner_tier', 'chatbot_tier')
ORDER BY column_name;

-- All 3 columns should now be: character varying (VARCHAR)

-- =============================================
-- STEP 5: TEST UPDATE
-- =============================================

-- This should now work without errors:
-- UPDATE users SET chatbot_tier = 'premium' WHERE email = 'test@example.com';

-- =============================================
-- SUCCESS MESSAGE
-- =============================================

SELECT
  '╔════════════════════════════════════════════════╗' as message
UNION ALL
SELECT '║  ✅ COLUMN TYPES FIXED                         ║'
UNION ALL
SELECT '╚════════════════════════════════════════════════╝'
UNION ALL
SELECT ''
UNION ALL
SELECT '✅ All 3 tier columns are now VARCHAR(20)'
UNION ALL
SELECT '✅ Constraints re-applied'
UNION ALL
SELECT '✅ Ready to receive Shopify webhooks!'
UNION ALL
SELECT ''
UNION ALL
SELECT '🧪 NEXT: Test webhook by creating a new order';
