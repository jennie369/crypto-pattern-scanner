-- Fix duplicate push tokens
-- This script removes duplicate tokens, keeping only the most recently updated one

-- Step 1: Find duplicate tokens
SELECT token, array_agg(user_id) as users, count(*) as count
FROM user_push_tokens
WHERE is_active = true
GROUP BY token
HAVING count(*) > 1;

-- Step 2: For each duplicate token, keep only the most recently updated record
-- Delete older duplicates
WITH duplicates AS (
  SELECT
    user_id,
    token,
    updated_at,
    ROW_NUMBER() OVER (PARTITION BY token ORDER BY updated_at DESC) as rn
  FROM user_push_tokens
  WHERE is_active = true
)
DELETE FROM user_push_tokens
WHERE user_id IN (
  SELECT user_id
  FROM duplicates
  WHERE rn > 1
);

-- Step 3: Verify no more duplicates
SELECT token, count(*) as count
FROM user_push_tokens
WHERE is_active = true
GROUP BY token
HAVING count(*) > 1;

-- Step 4: Also clean up profiles.expo_push_token for users without active tokens
UPDATE profiles p
SET expo_push_token = NULL
WHERE p.expo_push_token IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM user_push_tokens t
    WHERE t.user_id = p.id
      AND t.token = p.expo_push_token
      AND t.is_active = true
  );
