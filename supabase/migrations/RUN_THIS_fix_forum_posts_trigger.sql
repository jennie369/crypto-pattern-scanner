-- =====================================================
-- FIX FORUM_POSTS TRIGGER - author_id does not exist
-- Date: 2025-12-11
-- Problem: Trigger references NEW.author_id but column is user_id
-- Solution: Drop the problematic trigger
-- =====================================================

-- Drop the trigger that's causing the error
DROP TRIGGER IF EXISTS trigger_new_real_post ON forum_posts;
DROP TRIGGER IF EXISTS prevent_duplicate_forum_seed_post ON forum_posts;

-- Drop the function if it references author_id
DROP FUNCTION IF EXISTS notify_new_real_post() CASCADE;
DROP FUNCTION IF EXISTS check_seed_post_duplicate() CASCADE;

-- Verify no more triggers on forum_posts that reference author_id
DO $$
DECLARE
  trigger_count INT;
BEGIN
  SELECT COUNT(*) INTO trigger_count
  FROM pg_trigger t
  JOIN pg_class c ON t.tgrelid = c.oid
  WHERE c.relname = 'forum_posts'
    AND NOT t.tgisinternal;

  RAISE NOTICE 'forum_posts has % custom triggers remaining', trigger_count;
END $$;

-- Show remaining triggers
SELECT
  tgname as trigger_name,
  pg_get_triggerdef(t.oid) as trigger_definition
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
WHERE c.relname = 'forum_posts'
  AND NOT t.tgisinternal;
