-- ============================================
-- FIX DUPLICATE POSTS MIGRATION
-- Find and remove duplicate posts by content
-- ============================================

-- 0. First, check for duplicates (run this query separately to see duplicates):
-- SELECT title, LEFT(content, 100) as preview, COUNT(*) as duplicate_count
-- FROM seed_posts
-- GROUP BY title, LEFT(content, 100)
-- HAVING COUNT(*) > 1
-- ORDER BY duplicate_count DESC;

-- 1. First, let's identify duplicates in seed_posts table
-- Keep the oldest post (first created), delete newer duplicates
DELETE FROM seed_posts
WHERE id IN (
  SELECT id FROM (
    SELECT id,
           ROW_NUMBER() OVER (
             PARTITION BY TRIM(LOWER(title)), TRIM(LOWER(LEFT(content, 500)))
             ORDER BY created_at ASC
           ) as row_num
    FROM seed_posts
  ) ranked
  WHERE row_num > 1
);

-- 2. Check how many duplicates were in seed_posts
DO $$
DECLARE
  deleted_count INTEGER;
BEGIN
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RAISE NOTICE 'Deleted % duplicate seed_posts', deleted_count;
END $$;

-- 3. Now identify duplicates in forum_posts table
WITH duplicates_forum AS (
  SELECT id,
         title,
         content,
         ROW_NUMBER() OVER (
           PARTITION BY TRIM(LOWER(title)), TRIM(LOWER(LEFT(content, 500)))
           ORDER BY created_at ASC
         ) as row_num
  FROM forum_posts
  WHERE is_seed_post = true
)
DELETE FROM forum_posts
WHERE id IN (
  SELECT id FROM duplicates_forum WHERE row_num > 1
);

-- 4. Check how many duplicates were in forum_posts
DO $$
DECLARE
  deleted_count INTEGER;
BEGIN
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RAISE NOTICE 'Deleted % duplicate forum_posts (seed)', deleted_count;
END $$;

-- 5. Check for cross-table duplicates (same content in both seed_posts and forum_posts)
-- Delete from seed_posts if exists in forum_posts (prefer forum_posts)
DELETE FROM seed_posts sp
WHERE EXISTS (
  SELECT 1 FROM forum_posts fp
  WHERE TRIM(LOWER(fp.title)) = TRIM(LOWER(sp.title))
    AND TRIM(LOWER(LEFT(fp.content, 500))) = TRIM(LOWER(LEFT(sp.content, 500)))
);

-- 6. Create a function to prevent future duplicates
CREATE OR REPLACE FUNCTION check_duplicate_post()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check for duplicate in seed_posts
  IF TG_TABLE_NAME = 'seed_posts' THEN
    IF EXISTS (
      SELECT 1 FROM seed_posts
      WHERE id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
        AND TRIM(LOWER(title)) = TRIM(LOWER(NEW.title))
        AND TRIM(LOWER(LEFT(content, 500))) = TRIM(LOWER(LEFT(NEW.content, 500)))
    ) THEN
      RAISE EXCEPTION 'Duplicate post content detected in seed_posts';
    END IF;

    -- Also check forum_posts
    IF EXISTS (
      SELECT 1 FROM forum_posts
      WHERE TRIM(LOWER(title)) = TRIM(LOWER(NEW.title))
        AND TRIM(LOWER(LEFT(content, 500))) = TRIM(LOWER(LEFT(NEW.content, 500)))
    ) THEN
      RAISE EXCEPTION 'Duplicate post content already exists in forum_posts';
    END IF;
  END IF;

  -- Check for duplicate in forum_posts
  IF TG_TABLE_NAME = 'forum_posts' AND (NEW.is_seed_post = true) THEN
    IF EXISTS (
      SELECT 1 FROM forum_posts
      WHERE id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
        AND TRIM(LOWER(title)) = TRIM(LOWER(NEW.title))
        AND TRIM(LOWER(LEFT(content, 500))) = TRIM(LOWER(LEFT(NEW.content, 500)))
    ) THEN
      RAISE EXCEPTION 'Duplicate post content detected in forum_posts';
    END IF;

    -- Also check seed_posts
    IF EXISTS (
      SELECT 1 FROM seed_posts
      WHERE TRIM(LOWER(title)) = TRIM(LOWER(NEW.title))
        AND TRIM(LOWER(LEFT(content, 500))) = TRIM(LOWER(LEFT(NEW.content, 500)))
    ) THEN
      RAISE EXCEPTION 'Duplicate post content already exists in seed_posts';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- 7. Create triggers to prevent duplicates
DROP TRIGGER IF EXISTS prevent_duplicate_seed_post ON seed_posts;
CREATE TRIGGER prevent_duplicate_seed_post
  BEFORE INSERT OR UPDATE ON seed_posts
  FOR EACH ROW
  EXECUTE FUNCTION check_duplicate_post();

DROP TRIGGER IF EXISTS prevent_duplicate_forum_seed_post ON forum_posts;
CREATE TRIGGER prevent_duplicate_forum_seed_post
  BEFORE INSERT OR UPDATE ON forum_posts
  FOR EACH ROW
  WHEN (NEW.is_seed_post = true)
  EXECUTE FUNCTION check_duplicate_post();

-- 8. Create a helper function to find remaining duplicates (for manual review)
CREATE OR REPLACE FUNCTION find_duplicate_posts()
RETURNS TABLE (
  table_name TEXT,
  id UUID,
  title TEXT,
  content_preview TEXT,
  created_at TIMESTAMPTZ,
  duplicate_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  -- Duplicates in seed_posts
  SELECT
    'seed_posts'::TEXT as table_name,
    sp.id,
    sp.title::TEXT,
    LEFT(sp.content, 100)::TEXT as content_preview,
    sp.created_at,
    COUNT(*) OVER (PARTITION BY TRIM(LOWER(sp.title)), TRIM(LOWER(LEFT(sp.content, 500)))) as duplicate_count
  FROM seed_posts sp
  WHERE (SELECT COUNT(*) FROM seed_posts sp2
         WHERE TRIM(LOWER(sp2.title)) = TRIM(LOWER(sp.title))
           AND TRIM(LOWER(LEFT(sp2.content, 500))) = TRIM(LOWER(LEFT(sp.content, 500)))) > 1
  UNION ALL
  -- Duplicates in forum_posts (seed only)
  SELECT
    'forum_posts'::TEXT as table_name,
    fp.id,
    fp.title::TEXT,
    LEFT(fp.content, 100)::TEXT as content_preview,
    fp.created_at,
    COUNT(*) OVER (PARTITION BY TRIM(LOWER(fp.title)), TRIM(LOWER(LEFT(fp.content, 500)))) as duplicate_count
  FROM forum_posts fp
  WHERE fp.is_seed_post = true
    AND (SELECT COUNT(*) FROM forum_posts fp2
         WHERE fp2.is_seed_post = true
           AND TRIM(LOWER(fp2.title)) = TRIM(LOWER(fp.title))
           AND TRIM(LOWER(LEFT(fp2.content, 500))) = TRIM(LOWER(LEFT(fp.content, 500)))) > 1
  ORDER BY duplicate_count DESC, title;
END;
$$;

GRANT EXECUTE ON FUNCTION find_duplicate_posts TO authenticated;

-- 9. Show summary
DO $$
DECLARE
  seed_count INTEGER;
  forum_seed_count INTEGER;
  remaining_dups INTEGER;
BEGIN
  SELECT COUNT(*) INTO seed_count FROM seed_posts;
  SELECT COUNT(*) INTO forum_seed_count FROM forum_posts WHERE is_seed_post = true;
  SELECT COUNT(*) INTO remaining_dups FROM find_duplicate_posts();

  RAISE NOTICE '=== SUMMARY ===';
  RAISE NOTICE 'Total seed_posts: %', seed_count;
  RAISE NOTICE 'Total forum_posts (seed): %', forum_seed_count;
  RAISE NOTICE 'Remaining duplicates to review: %', remaining_dups;
END $$;

-- Done!
-- Run: SELECT * FROM find_duplicate_posts(); to see any remaining duplicates
