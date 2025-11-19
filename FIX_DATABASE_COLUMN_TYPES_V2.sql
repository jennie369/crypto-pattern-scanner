-- =============================================
-- FIX: Chatbot Tier Column Type Error (V2)
-- =============================================
-- Error: check constraint violation
-- This version MIGRATES DATA FIRST before changing schema
-- =============================================

-- =============================================
-- STEP 1: CHECK WHAT VALUES EXIST NOW
-- =============================================

SELECT 'Current chatbot_tier values:' as info;

SELECT
  chatbot_tier,
  COUNT(*) as count
FROM users
GROUP BY chatbot_tier
ORDER BY count DESC;

-- =============================================
-- STEP 2: CHECK COLUMN TYPE
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

-- =============================================
-- STEP 3: DROP ALL CONSTRAINTS FIRST
-- =============================================

ALTER TABLE users DROP CONSTRAINT IF EXISTS users_chatbot_tier_check;
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_course_tier_check;
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_scanner_tier_check;

-- =============================================
-- STEP 4: CONVERT COLUMN TO VARCHAR (NO CONSTRAINT YET)
-- =============================================

-- Chatbot tier
ALTER TABLE users
ALTER COLUMN chatbot_tier TYPE VARCHAR(20) USING COALESCE(chatbot_tier::text, 'free');

ALTER TABLE users
ALTER COLUMN chatbot_tier SET DEFAULT 'free';

-- Set NULL values to 'free'
UPDATE users
SET chatbot_tier = 'free'
WHERE chatbot_tier IS NULL OR chatbot_tier = '';

-- Course tier
ALTER TABLE users
ALTER COLUMN course_tier TYPE VARCHAR(20) USING COALESCE(course_tier::text, 'free');

ALTER TABLE users
ALTER COLUMN course_tier SET DEFAULT 'free';

UPDATE users
SET course_tier = 'free'
WHERE course_tier IS NULL OR course_tier = '';

-- Scanner tier
ALTER TABLE users
ALTER COLUMN scanner_tier TYPE VARCHAR(20) USING COALESCE(scanner_tier::text, 'free');

ALTER TABLE users
ALTER COLUMN scanner_tier SET DEFAULT 'free';

UPDATE users
SET scanner_tier = 'free'
WHERE scanner_tier IS NULL OR scanner_tier = '';

-- =============================================
-- STEP 5: MIGRATE INTEGER VALUES TO STRINGS
-- =============================================

-- If chatbot_tier has integers (0, 1, 2), convert them
UPDATE users
SET chatbot_tier = CASE
  WHEN chatbot_tier = '0' THEN 'free'
  WHEN chatbot_tier = '1' THEN 'pro'
  WHEN chatbot_tier = '2' THEN 'premium'
  ELSE chatbot_tier
END
WHERE chatbot_tier IN ('0', '1', '2');

-- If course_tier has integers, convert them
UPDATE users
SET course_tier = CASE
  WHEN course_tier = '0' THEN 'free'
  WHEN course_tier = '1' THEN 'tier1'
  WHEN course_tier = '2' THEN 'tier2'
  WHEN course_tier = '3' THEN 'tier3'
  ELSE course_tier
END
WHERE course_tier IN ('0', '1', '2', '3');

-- If scanner_tier has integers, convert them
UPDATE users
SET scanner_tier = CASE
  WHEN scanner_tier = '0' THEN 'free'
  WHEN scanner_tier = '1' THEN 'pro'
  WHEN scanner_tier = '2' THEN 'premium'
  WHEN scanner_tier = '3' THEN 'vip'
  ELSE scanner_tier
END
WHERE scanner_tier IN ('0', '1', '2', '3');

-- =============================================
-- STEP 6: FIX ANY INVALID VALUES
-- =============================================

-- Set any invalid chatbot_tier values to 'free'
UPDATE users
SET chatbot_tier = 'free'
WHERE chatbot_tier NOT IN ('free', 'pro', 'premium');

-- Set any invalid course_tier values to 'free'
UPDATE users
SET course_tier = 'free'
WHERE course_tier NOT IN ('free', 'tier1', 'tier2', 'tier3');

-- Set any invalid scanner_tier values to 'free'
UPDATE users
SET scanner_tier = 'free'
WHERE scanner_tier NOT IN ('free', 'pro', 'premium', 'vip');

-- =============================================
-- STEP 7: VERIFY ALL DATA IS VALID NOW
-- =============================================

SELECT 'Chatbot tier values after migration:' as info;
SELECT chatbot_tier, COUNT(*) FROM users GROUP BY chatbot_tier;

SELECT 'Course tier values after migration:' as info;
SELECT course_tier, COUNT(*) FROM users GROUP BY course_tier;

SELECT 'Scanner tier values after migration:' as info;
SELECT scanner_tier, COUNT(*) FROM users GROUP BY scanner_tier;

-- =============================================
-- STEP 8: ADD CONSTRAINTS BACK
-- =============================================

ALTER TABLE users
ADD CONSTRAINT users_chatbot_tier_check
CHECK (chatbot_tier IN ('free', 'pro', 'premium'));

ALTER TABLE users
ADD CONSTRAINT users_course_tier_check
CHECK (course_tier IN ('free', 'tier1', 'tier2', 'tier3'));

ALTER TABLE users
ADD CONSTRAINT users_scanner_tier_check
CHECK (scanner_tier IN ('free', 'pro', 'premium', 'vip'));

-- =============================================
-- STEP 9: VERIFY FINAL SCHEMA
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

-- =============================================
-- SUCCESS MESSAGE
-- =============================================

SELECT
  '╔════════════════════════════════════════════════╗' as message
UNION ALL
SELECT '║  ✅ COLUMN TYPES FIXED (V2)                   ║'
UNION ALL
SELECT '╚════════════════════════════════════════════════╝'
UNION ALL
SELECT ''
UNION ALL
SELECT '✅ All data migrated successfully'
UNION ALL
SELECT '✅ All 3 tier columns are now VARCHAR(20)'
UNION ALL
SELECT '✅ Constraints applied'
UNION ALL
SELECT '✅ Ready to receive Shopify webhooks!'
UNION ALL
SELECT ''
UNION ALL
SELECT '🧪 NEXT: Test webhook by creating a new order';
