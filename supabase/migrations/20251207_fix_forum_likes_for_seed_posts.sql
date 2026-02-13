-- =====================================================
-- FIX: Allow forum_likes to work with seed_posts
-- Problem: forum_likes has FK constraint to forum_posts only
--          but seed posts are in seed_posts table
-- Solution: Keep FK but make it DEFERRABLE, add seed_post_id column
-- =====================================================

-- Step 1: Add seed_post_id column FIRST (before cleaning up data)
ALTER TABLE public.forum_likes
ADD COLUMN IF NOT EXISTS seed_post_id UUID;

-- Step 2: Migrate existing likes that point to seed_posts
-- Move post_id values to seed_post_id for records where post_id is a seed_post
UPDATE public.forum_likes fl
SET seed_post_id = fl.post_id, post_id = NULL
WHERE fl.post_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.forum_posts fp WHERE fp.id = fl.post_id
  )
  AND EXISTS (
    SELECT 1 FROM public.seed_posts sp WHERE sp.id = fl.post_id
  );

-- Step 3: Delete orphan likes (post_id doesn't exist in either table)
DELETE FROM public.forum_likes fl
WHERE fl.post_id IS NOT NULL
  AND fl.seed_post_id IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.forum_posts fp WHERE fp.id = fl.post_id
  );

-- Step 4: Now add the FK constraint on seed_post_id
ALTER TABLE public.forum_likes
DROP CONSTRAINT IF EXISTS forum_likes_seed_post_id_fkey;

ALTER TABLE public.forum_likes
ADD CONSTRAINT forum_likes_seed_post_id_fkey
FOREIGN KEY (seed_post_id) REFERENCES public.seed_posts(id) ON DELETE CASCADE;

-- Step 5: Restore the FK constraint on post_id
-- This is needed for PostgREST to detect relationships for joins
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'forum_likes_post_id_fkey'
    AND table_name = 'forum_likes'
  ) THEN
    ALTER TABLE public.forum_likes
    ADD CONSTRAINT forum_likes_post_id_fkey
    FOREIGN KEY (post_id) REFERENCES public.forum_posts(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Update CHECK constraint to allow either post_id or seed_post_id
ALTER TABLE public.forum_likes
DROP CONSTRAINT IF EXISTS forum_likes_check;

ALTER TABLE public.forum_likes
ADD CONSTRAINT forum_likes_check CHECK (
  (post_id IS NOT NULL AND seed_post_id IS NULL) OR
  (post_id IS NULL AND seed_post_id IS NOT NULL) OR
  (comment_id IS NOT NULL)
);

-- Add unique constraint for seed_post likes
ALTER TABLE public.forum_likes
DROP CONSTRAINT IF EXISTS forum_likes_user_id_seed_post_id_key;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'forum_likes_user_seed_post_unique'
  ) THEN
    ALTER TABLE public.forum_likes
    ADD CONSTRAINT forum_likes_user_seed_post_unique UNIQUE(user_id, seed_post_id);
  END IF;
END $$;

-- Create index for seed_post_id
CREATE INDEX IF NOT EXISTS idx_forum_likes_seed_post ON public.forum_likes(seed_post_id);

-- Update the likes_count trigger to handle both forum_posts and seed_posts
CREATE OR REPLACE FUNCTION update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Update forum_posts if post_id is set
    IF NEW.post_id IS NOT NULL THEN
      UPDATE public.forum_posts
      SET likes_count = likes_count + 1
      WHERE id = NEW.post_id;
    END IF;

    -- Update seed_posts if seed_post_id is set
    IF NEW.seed_post_id IS NOT NULL THEN
      UPDATE public.seed_posts
      SET likes_count = likes_count + 1
      WHERE id = NEW.seed_post_id;
    END IF;

  ELSIF TG_OP = 'DELETE' THEN
    -- Update forum_posts if post_id was set
    IF OLD.post_id IS NOT NULL THEN
      UPDATE public.forum_posts
      SET likes_count = GREATEST(likes_count - 1, 0)
      WHERE id = OLD.post_id;
    END IF;

    -- Update seed_posts if seed_post_id was set
    IF OLD.seed_post_id IS NOT NULL THEN
      UPDATE public.seed_posts
      SET likes_count = GREATEST(likes_count - 1, 0)
      WHERE id = OLD.seed_post_id;
    END IF;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger
DROP TRIGGER IF EXISTS trigger_update_post_likes ON public.forum_likes;
CREATE TRIGGER trigger_update_post_likes
  AFTER INSERT OR DELETE ON public.forum_likes
  FOR EACH ROW
  EXECUTE FUNCTION update_post_likes_count();

-- Add comment
COMMENT ON TABLE public.forum_likes IS 'User likes for posts (supports both forum_posts via post_id and seed_posts via seed_post_id)';
