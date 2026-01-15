-- =====================================================
-- FIX: Allow post_reactions to work with seed_posts
-- Problem: post_reactions has FK constraint to forum_posts only
--          but seed posts are in seed_posts table
-- Solution: Add seed_post_id column (similar to forum_likes fix)
-- Date: 2026-01-15
--
-- ALSO FIXES: Error "record 'new' has no field 'is_seed_post'"
-- The trigger functions in the live database might reference
-- is_seed_post on post_reactions, but that column doesn't exist.
-- The correct column is seed_post_id.
-- =====================================================

-- Step 0: DROP all triggers on post_reactions first to prevent errors
DROP TRIGGER IF EXISTS trigger_update_reaction_counts_insert ON public.post_reactions;
DROP TRIGGER IF EXISTS trigger_update_reaction_counts_update ON public.post_reactions;
DROP TRIGGER IF EXISTS trigger_update_reaction_counts_delete ON public.post_reactions;
DROP TRIGGER IF EXISTS trigger_notify_post_reaction ON public.post_reactions;
DROP TRIGGER IF EXISTS trigger_reaction_update_post_scores ON public.post_reactions;

-- Step 1: Add seed_post_id column
ALTER TABLE public.post_reactions
ADD COLUMN IF NOT EXISTS seed_post_id UUID;

-- Step 2: Add FK constraint to seed_posts
ALTER TABLE public.post_reactions
DROP CONSTRAINT IF EXISTS post_reactions_seed_post_id_fkey;

ALTER TABLE public.post_reactions
ADD CONSTRAINT post_reactions_seed_post_id_fkey
FOREIGN KEY (seed_post_id) REFERENCES public.seed_posts(id) ON DELETE CASCADE;

-- Step 3: Make post_id nullable (it can be NULL if seed_post_id is set)
ALTER TABLE public.post_reactions
ALTER COLUMN post_id DROP NOT NULL;

-- Step 4: Add check constraint to ensure either post_id OR seed_post_id is set
ALTER TABLE public.post_reactions
DROP CONSTRAINT IF EXISTS post_reactions_post_or_seed_check;

ALTER TABLE public.post_reactions
ADD CONSTRAINT post_reactions_post_or_seed_check CHECK (
  (post_id IS NOT NULL AND seed_post_id IS NULL) OR
  (post_id IS NULL AND seed_post_id IS NOT NULL)
);

-- Step 5: Update unique constraint to include seed_post_id option
-- Drop old constraint
ALTER TABLE public.post_reactions
DROP CONSTRAINT IF EXISTS unique_user_post_reaction;

-- Add new constraints for both cases
ALTER TABLE public.post_reactions
ADD CONSTRAINT unique_user_forum_post_reaction UNIQUE(post_id, user_id);

ALTER TABLE public.post_reactions
ADD CONSTRAINT unique_user_seed_post_reaction UNIQUE(seed_post_id, user_id);

-- Step 6: Create index for seed_post_id
CREATE INDEX IF NOT EXISTS idx_post_reactions_seed_post_id
ON public.post_reactions(seed_post_id);

-- Step 7: Add reaction_counts column to seed_posts if not exists
ALTER TABLE public.seed_posts ADD COLUMN IF NOT EXISTS reaction_counts JSONB
DEFAULT '{"like":0,"love":0,"haha":0,"wow":0,"sad":0,"angry":0,"total":0}'::jsonb;

-- Step 8: Update the reaction counts trigger to handle both tables
CREATE OR REPLACE FUNCTION public.update_post_reaction_counts()
RETURNS TRIGGER AS $$
DECLARE
  counts JSONB;
  target_post_id UUID;
  target_seed_post_id UUID;
BEGIN
  -- Get the correct IDs
  target_post_id := COALESCE(NEW.post_id, OLD.post_id);
  target_seed_post_id := COALESCE(NEW.seed_post_id, OLD.seed_post_id);

  -- Handle forum_posts
  IF target_post_id IS NOT NULL THEN
    -- Calculate new counts for forum post
    SELECT jsonb_build_object(
      'like', COALESCE(SUM(CASE WHEN reaction_type = 'like' THEN 1 ELSE 0 END), 0),
      'love', COALESCE(SUM(CASE WHEN reaction_type = 'love' THEN 1 ELSE 0 END), 0),
      'haha', COALESCE(SUM(CASE WHEN reaction_type = 'haha' THEN 1 ELSE 0 END), 0),
      'wow', COALESCE(SUM(CASE WHEN reaction_type = 'wow' THEN 1 ELSE 0 END), 0),
      'sad', COALESCE(SUM(CASE WHEN reaction_type = 'sad' THEN 1 ELSE 0 END), 0),
      'angry', COALESCE(SUM(CASE WHEN reaction_type = 'angry' THEN 1 ELSE 0 END), 0),
      'total', COUNT(*)
    ) INTO counts
    FROM public.post_reactions
    WHERE post_id = target_post_id;

    IF counts IS NULL THEN
      counts := '{"like":0,"love":0,"haha":0,"wow":0,"sad":0,"angry":0,"total":0}'::jsonb;
    END IF;

    UPDATE public.forum_posts
    SET reaction_counts = counts, updated_at = NOW()
    WHERE id = target_post_id;
  END IF;

  -- Handle seed_posts
  IF target_seed_post_id IS NOT NULL THEN
    -- Calculate new counts for seed post
    SELECT jsonb_build_object(
      'like', COALESCE(SUM(CASE WHEN reaction_type = 'like' THEN 1 ELSE 0 END), 0),
      'love', COALESCE(SUM(CASE WHEN reaction_type = 'love' THEN 1 ELSE 0 END), 0),
      'haha', COALESCE(SUM(CASE WHEN reaction_type = 'haha' THEN 1 ELSE 0 END), 0),
      'wow', COALESCE(SUM(CASE WHEN reaction_type = 'wow' THEN 1 ELSE 0 END), 0),
      'sad', COALESCE(SUM(CASE WHEN reaction_type = 'sad' THEN 1 ELSE 0 END), 0),
      'angry', COALESCE(SUM(CASE WHEN reaction_type = 'angry' THEN 1 ELSE 0 END), 0),
      'total', COUNT(*)
    ) INTO counts
    FROM public.post_reactions
    WHERE seed_post_id = target_seed_post_id;

    IF counts IS NULL THEN
      counts := '{"like":0,"love":0,"haha":0,"wow":0,"sad":0,"angry":0,"total":0}'::jsonb;
    END IF;

    UPDATE public.seed_posts
    SET reaction_counts = counts, updated_at = NOW()
    WHERE id = target_seed_post_id;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 9: Update notification function to handle seed_posts
CREATE OR REPLACE FUNCTION public.notify_post_reaction()
RETURNS TRIGGER AS $$
DECLARE
  post_owner_id UUID;
  reactor_name TEXT;
  post_preview TEXT;
BEGIN
  -- Get post owner and preview from forum_posts
  IF NEW.post_id IS NOT NULL THEN
    SELECT user_id, LEFT(content, 100) INTO post_owner_id, post_preview
    FROM public.forum_posts WHERE id = NEW.post_id;
  END IF;

  -- Get post owner and preview from seed_posts
  IF NEW.seed_post_id IS NOT NULL THEN
    SELECT user_id, LEFT(content, 100) INTO post_owner_id, post_preview
    FROM public.seed_posts WHERE id = NEW.seed_post_id;
  END IF;

  -- Get reactor display name
  SELECT display_name INTO reactor_name
  FROM public.profiles WHERE id = NEW.user_id;

  -- Don't notify self or seed users (seed_posts.user_id won't exist in profiles)
  IF post_owner_id IS NULL OR post_owner_id = NEW.user_id THEN
    RETURN NEW;
  END IF;

  -- Only notify if owner exists in profiles (real user)
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = post_owner_id) THEN
    INSERT INTO public.notifications (
      user_id, type, title, body, data, created_at
    ) VALUES (
      post_owner_id,
      'reaction',
      COALESCE(reactor_name, 'Ai đó') || ' đã thả cảm xúc',
      'với bài viết của bạn',
      jsonb_build_object(
        'type', 'reaction',
        'post_id', COALESCE(NEW.post_id, NEW.seed_post_id),
        'reactor_id', NEW.user_id,
        'reaction_type', NEW.reaction_type
      ),
      NOW()
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 10: Update the view to include reaction_counts
DROP VIEW IF EXISTS public.post_reactions_with_users;
CREATE OR REPLACE VIEW public.post_reactions_with_users AS
SELECT
  pr.id,
  COALESCE(pr.post_id, pr.seed_post_id) as post_id,
  pr.post_id as forum_post_id,
  pr.seed_post_id,
  pr.user_id,
  pr.reaction_type,
  pr.created_at,
  p.display_name,
  p.avatar_url
FROM public.post_reactions pr
LEFT JOIN public.profiles p ON pr.user_id = p.id;

-- Grant permissions
GRANT SELECT ON public.post_reactions_with_users TO authenticated;

-- Step 11: Recreate triggers for reaction counts
CREATE TRIGGER trigger_update_reaction_counts_insert
  AFTER INSERT ON public.post_reactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_post_reaction_counts();

CREATE TRIGGER trigger_update_reaction_counts_update
  AFTER UPDATE ON public.post_reactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_post_reaction_counts();

CREATE TRIGGER trigger_update_reaction_counts_delete
  AFTER DELETE ON public.post_reactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_post_reaction_counts();

-- Step 12: Recreate trigger for notifications
CREATE TRIGGER trigger_notify_post_reaction
  AFTER INSERT ON public.post_reactions
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_post_reaction();

-- Comments
COMMENT ON COLUMN public.post_reactions.seed_post_id IS 'FK to seed_posts for reactions on seed content';
COMMENT ON CONSTRAINT post_reactions_post_or_seed_check ON public.post_reactions IS 'Ensures either post_id or seed_post_id is set, but not both';

-- Verification
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Migration 20260115_fix_post_reactions_for_seed_posts completed!';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Changes made:';
  RAISE NOTICE '  - Dropped problematic triggers on post_reactions';
  RAISE NOTICE '  - Added seed_post_id column to post_reactions';
  RAISE NOTICE '  - Updated update_post_reaction_counts() function';
  RAISE NOTICE '  - Updated notify_post_reaction() function';
  RAISE NOTICE '  - Recreated triggers with correct functions';
  RAISE NOTICE '';
  RAISE NOTICE 'Post reactions now work with both forum_posts and seed_posts!';
END $$;
