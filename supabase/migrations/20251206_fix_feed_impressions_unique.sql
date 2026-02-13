-- ============================================
-- Fix feed_impressions and seed_impressions tables
-- Add unique constraint to prevent duplicates
-- ============================================

-- 1. Clean up duplicate feed_impressions
-- Keep only the earliest impression for each user+post pair
DELETE FROM feed_impressions a
USING feed_impressions b
WHERE a.id > b.id
  AND a.user_id = b.user_id
  AND a.post_id = b.post_id;

-- 2. Add unique constraint on (user_id, post_id)
-- This allows upsert to work properly
ALTER TABLE feed_impressions
DROP CONSTRAINT IF EXISTS feed_impressions_user_post_unique;

ALTER TABLE feed_impressions
ADD CONSTRAINT feed_impressions_user_post_unique
UNIQUE (user_id, post_id);

-- 3. Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_feed_impressions_user_post
ON feed_impressions(user_id, post_id);

-- 4. Same for seed_impressions if it exists
DO $$
BEGIN
  -- Clean up duplicates
  DELETE FROM seed_impressions a
  USING seed_impressions b
  WHERE a.id > b.id
    AND a.user_id = b.user_id
    AND a.post_id = b.post_id;

  -- Add unique constraint
  ALTER TABLE seed_impressions
  DROP CONSTRAINT IF EXISTS seed_impressions_user_post_unique;

  ALTER TABLE seed_impressions
  ADD CONSTRAINT seed_impressions_user_post_unique
  UNIQUE (user_id, post_id);

  -- Create index
  CREATE INDEX IF NOT EXISTS idx_seed_impressions_user_post
  ON seed_impressions(user_id, post_id);
EXCEPTION
  WHEN undefined_table THEN
    -- seed_impressions doesn't exist, ignore
    NULL;
END $$;

-- 5. Log success
DO $$
BEGIN
  RAISE NOTICE 'Successfully added unique constraints to feed_impressions and seed_impressions';
END $$;
