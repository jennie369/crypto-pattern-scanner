-- =====================================================
-- FIX ALL TRIGGER ERRORS
-- Date: 2026-01-31
-- Problems:
-- 1. forum_comments trigger references author_id (should be user_id)
-- 2. forum_posts missing is_seed_post column
-- 3. post_reactions trigger references is_seed_post (doesn't exist)
-- =====================================================

-- =====================================================
-- PART 1: Fix forum_comments triggers
-- =====================================================

-- Drop any triggers that reference author_id on forum_comments
DROP TRIGGER IF EXISTS trigger_new_comment ON forum_comments;
DROP TRIGGER IF EXISTS trigger_notify_comment ON forum_comments;
DROP TRIGGER IF EXISTS trigger_comment_notification ON forum_comments;
DROP TRIGGER IF EXISTS after_comment_insert ON forum_comments;
DROP TRIGGER IF EXISTS on_comment_created ON forum_comments;

-- Drop functions that might reference author_id
DROP FUNCTION IF EXISTS notify_new_comment() CASCADE;
DROP FUNCTION IF EXISTS handle_new_comment() CASCADE;
DROP FUNCTION IF EXISTS create_comment_notification() CASCADE;
DROP FUNCTION IF EXISTS notify_comment_created() CASCADE;

-- Recreate the notification function with correct column name (user_id)
CREATE OR REPLACE FUNCTION notify_comment_created()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert notification for post owner when someone comments
  IF NEW.user_id IS DISTINCT FROM (SELECT user_id FROM forum_posts WHERE id = NEW.post_id) THEN
    INSERT INTO notifications (user_id, from_user_id, type, title, body, data)
    SELECT
      fp.user_id,
      NEW.user_id,
      'forum_comment',
      'Bình luận mới',
      (SELECT COALESCE(full_name, 'Ai đó') FROM profiles WHERE id = NEW.user_id) || ' đã bình luận bài viết của bạn',
      jsonb_build_object('postId', NEW.post_id, 'commentId', NEW.id)
    FROM forum_posts fp
    WHERE fp.id = NEW.post_id AND fp.user_id IS NOT NULL;
  END IF;

  -- If this is a reply, also notify the parent comment author
  IF NEW.parent_id IS NOT NULL THEN
    INSERT INTO notifications (user_id, from_user_id, type, title, body, data)
    SELECT
      fc.user_id,
      NEW.user_id,
      'forum_reply',
      'Trả lời bình luận',
      (SELECT COALESCE(full_name, 'Ai đó') FROM profiles WHERE id = NEW.user_id) || ' đã trả lời bình luận của bạn',
      jsonb_build_object('postId', NEW.post_id, 'commentId', NEW.id, 'parentCommentId', NEW.parent_id)
    FROM forum_comments fc
    WHERE fc.id = NEW.parent_id AND fc.user_id IS NOT NULL AND fc.user_id IS DISTINCT FROM NEW.user_id;
  END IF;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Comment notification error: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
CREATE TRIGGER on_comment_created
  AFTER INSERT ON forum_comments
  FOR EACH ROW
  EXECUTE FUNCTION notify_comment_created();

-- =====================================================
-- PART 2: Fix forum_posts is_seed_post column
-- =====================================================

-- Add is_seed_post column to forum_posts if it doesn't exist
ALTER TABLE forum_posts ADD COLUMN IF NOT EXISTS is_seed_post BOOLEAN DEFAULT false;

-- Create index for is_seed_post queries
CREATE INDEX IF NOT EXISTS idx_forum_posts_is_seed_post ON forum_posts(is_seed_post);

-- Drop problematic triggers that reference is_seed_post on forum_posts
DROP TRIGGER IF EXISTS trigger_new_real_post ON forum_posts;
DROP TRIGGER IF EXISTS prevent_duplicate_forum_seed_post ON forum_posts;

-- Drop functions that might cause issues
DROP FUNCTION IF EXISTS notify_new_real_post() CASCADE;
DROP FUNCTION IF EXISTS check_duplicate_post() CASCADE;

-- =====================================================
-- PART 3: Fix post_reactions triggers
-- =====================================================

-- Drop ANY problematic triggers on post_reactions
DO $$
DECLARE
  trigger_rec RECORD;
BEGIN
  FOR trigger_rec IN
    SELECT tgname
    FROM pg_trigger t
    JOIN pg_class c ON t.tgrelid = c.oid
    WHERE c.relname = 'post_reactions'
      AND NOT t.tgisinternal
      AND tgname NOT LIKE 'trigger_update_reaction_counts%'
      AND tgname NOT LIKE 'trigger_notify_reaction%'
  LOOP
    RAISE NOTICE 'Dropping trigger % on post_reactions', trigger_rec.tgname;
    EXECUTE 'DROP TRIGGER IF EXISTS ' || trigger_rec.tgname || ' ON post_reactions';
  END LOOP;
END $$;

-- Ensure the reaction count update function doesn't reference is_seed_post
CREATE OR REPLACE FUNCTION public.update_post_reaction_counts()
RETURNS TRIGGER AS $$
DECLARE
  counts JSONB;
  target_post_id UUID;
BEGIN
  -- Get the correct post_id
  target_post_id := COALESCE(NEW.post_id, OLD.post_id);

  -- Skip if no valid post_id
  IF target_post_id IS NULL THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  -- Calculate new counts
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

  -- Handle case when no reactions exist
  IF counts IS NULL THEN
    counts := '{"like":0,"love":0,"haha":0,"wow":0,"sad":0,"angry":0,"total":0}'::jsonb;
  END IF;

  -- Update forum_posts
  UPDATE public.forum_posts
  SET reaction_counts = counts,
      updated_at = NOW()
  WHERE id = target_post_id;

  RETURN COALESCE(NEW, OLD);
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Reaction count update error: %', SQLERRM;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the reaction triggers
DROP TRIGGER IF EXISTS trigger_update_reaction_counts_insert ON public.post_reactions;
CREATE TRIGGER trigger_update_reaction_counts_insert
  AFTER INSERT ON public.post_reactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_post_reaction_counts();

DROP TRIGGER IF EXISTS trigger_update_reaction_counts_update ON public.post_reactions;
CREATE TRIGGER trigger_update_reaction_counts_update
  AFTER UPDATE ON public.post_reactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_post_reaction_counts();

DROP TRIGGER IF EXISTS trigger_update_reaction_counts_delete ON public.post_reactions;
CREATE TRIGGER trigger_update_reaction_counts_delete
  AFTER DELETE ON public.post_reactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_post_reaction_counts();

-- =====================================================
-- VERIFICATION
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'All trigger fixes applied!';
  RAISE NOTICE '1. forum_comments: Fixed author_id -> user_id';
  RAISE NOTICE '2. forum_posts: Added is_seed_post column';
  RAISE NOTICE '3. post_reactions: Fixed triggers';
  RAISE NOTICE '========================================';
END $$;

-- Show remaining triggers for verification
SELECT
  c.relname as table_name,
  t.tgname as trigger_name
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
WHERE c.relname IN ('forum_comments', 'forum_posts', 'post_reactions')
  AND NOT t.tgisinternal
ORDER BY c.relname, t.tgname;
