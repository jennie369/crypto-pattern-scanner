-- ============================================
-- Fix feed_impressions and seed_impressions for upsert
-- Add UPDATE policy so upsert works correctly
-- ============================================

-- 1. Add UPDATE policy for feed_impressions
-- Upsert requires UPDATE permission when the row already exists
DROP POLICY IF EXISTS "Users can update own impressions" ON feed_impressions;
CREATE POLICY "Users can update own impressions" ON feed_impressions
  FOR UPDATE USING (auth.uid() = user_id);

-- 2. Add UPDATE policy for seed_impressions
DO $$
BEGIN
  DROP POLICY IF EXISTS "Users can update own seed impressions" ON seed_impressions;
  CREATE POLICY "Users can update own seed impressions" ON seed_impressions
    FOR UPDATE USING (auth.uid() = user_id);
EXCEPTION
  WHEN undefined_table THEN
    -- seed_impressions doesn't exist, ignore
    NULL;
END $$;

-- 3. Ensure unique constraints exist (required for upsert)
-- feed_impressions
DO $$
BEGIN
  -- Try to add unique constraint if it doesn't exist
  ALTER TABLE feed_impressions
  ADD CONSTRAINT feed_impressions_user_post_unique
  UNIQUE (user_id, post_id);
EXCEPTION
  WHEN duplicate_table THEN NULL;
  WHEN duplicate_object THEN NULL;
END $$;

-- seed_impressions
DO $$
BEGIN
  ALTER TABLE seed_impressions
  ADD CONSTRAINT seed_impressions_user_post_unique
  UNIQUE (user_id, post_id);
EXCEPTION
  WHEN undefined_table THEN NULL;
  WHEN duplicate_table THEN NULL;
  WHEN duplicate_object THEN NULL;
END $$;

-- 4. Clean up duplicate impressions that may have accumulated
-- feed_impressions: Keep only the earliest impression per user+post
DELETE FROM feed_impressions a
USING feed_impressions b
WHERE a.id > b.id
  AND a.user_id = b.user_id
  AND a.post_id = b.post_id;

-- seed_impressions
DO $$
BEGIN
  DELETE FROM seed_impressions a
  USING seed_impressions b
  WHERE a.id > b.id
    AND a.user_id = b.user_id
    AND a.post_id = b.post_id;
EXCEPTION
  WHEN undefined_table THEN NULL;
END $$;

-- 5. Grant update permission to authenticated users
GRANT UPDATE ON feed_impressions TO authenticated;

DO $$
BEGIN
  GRANT UPDATE ON seed_impressions TO authenticated;
EXCEPTION
  WHEN undefined_table THEN NULL;
END $$;

-- 6. Log success
DO $$
BEGIN
  RAISE NOTICE 'Successfully added UPDATE policies for impressions tables - upsert should now work correctly';
END $$;
