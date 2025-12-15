-- =====================================================
-- FIX is_seed_post TRIGGER ERROR
-- Date: 2025-12-13
-- Problem: Trigger references NEW.is_seed_post but column doesn't exist in forum_posts
-- Error: record "new" has no field "is_seed_post"
-- Solution: Drop problematic triggers and add column if needed
-- =====================================================

-- Step 1: Find and drop any triggers referencing is_seed_post
DO $$
DECLARE
  trigger_rec RECORD;
BEGIN
  -- List all custom triggers on forum_posts
  FOR trigger_rec IN
    SELECT tgname, pg_get_triggerdef(t.oid) as def
    FROM pg_trigger t
    JOIN pg_class c ON t.tgrelid = c.oid
    WHERE c.relname = 'forum_posts'
      AND NOT t.tgisinternal
  LOOP
    -- Check if trigger definition contains is_seed_post
    IF trigger_rec.def ILIKE '%is_seed_post%' THEN
      RAISE NOTICE 'Dropping trigger % because it references is_seed_post', trigger_rec.tgname;
      EXECUTE 'DROP TRIGGER IF EXISTS ' || trigger_rec.tgname || ' ON forum_posts';
    END IF;
  END LOOP;
END $$;

-- Step 2: Drop any functions that might reference is_seed_post
DROP FUNCTION IF EXISTS check_is_seed_post() CASCADE;
DROP FUNCTION IF EXISTS validate_seed_post() CASCADE;
DROP FUNCTION IF EXISTS prevent_seed_post_update() CASCADE;

-- Step 3: Add is_seed_post column to forum_posts if it doesn't exist
-- This is safer than trying to fix all triggers
ALTER TABLE forum_posts ADD COLUMN IF NOT EXISTS is_seed_post BOOLEAN DEFAULT false;

-- Step 4: Create index for is_seed_post queries
CREATE INDEX IF NOT EXISTS idx_forum_posts_is_seed_post ON forum_posts(is_seed_post);

-- Step 5: Verify the fix
DO $$
BEGIN
  -- Check column exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'forum_posts' AND column_name = 'is_seed_post'
  ) THEN
    RAISE NOTICE '✅ is_seed_post column exists in forum_posts';
  ELSE
    RAISE WARNING '❌ is_seed_post column MISSING from forum_posts';
  END IF;

  -- Count remaining triggers
  RAISE NOTICE 'Remaining triggers on forum_posts:';
END $$;

-- Show remaining triggers for verification
SELECT
  tgname as trigger_name,
  CASE WHEN pg_get_triggerdef(t.oid) ILIKE '%is_seed_post%' THEN '⚠️ References is_seed_post' ELSE '✅ OK' END as status
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
WHERE c.relname = 'forum_posts'
  AND NOT t.tgisinternal;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Migration complete!';
  RAISE NOTICE 'is_seed_post column added to forum_posts';
  RAISE NOTICE 'Problematic triggers dropped';
  RAISE NOTICE '========================================';
END $$;
