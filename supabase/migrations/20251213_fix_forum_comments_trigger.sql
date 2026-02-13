-- =====================================================
-- FIX FORUM_COMMENTS TRIGGER - author_id does not exist
-- Date: 2025-12-13
-- Problem: Trigger references NEW.author_id but column is user_id
-- Solution: Drop the problematic trigger
-- =====================================================

-- Drop any triggers that reference author_id on forum_comments
DROP TRIGGER IF EXISTS trigger_new_comment ON forum_comments;
DROP TRIGGER IF EXISTS trigger_notify_comment ON forum_comments;
DROP TRIGGER IF EXISTS trigger_comment_notification ON forum_comments;
DROP TRIGGER IF EXISTS after_comment_insert ON forum_comments;

-- Drop functions that might reference author_id
DROP FUNCTION IF EXISTS notify_new_comment() CASCADE;
DROP FUNCTION IF EXISTS handle_new_comment() CASCADE;
DROP FUNCTION IF EXISTS create_comment_notification() CASCADE;

-- Recreate the notification function with correct column name (user_id)
CREATE OR REPLACE FUNCTION notify_comment_created()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert notification for post owner when someone comments
  -- Only if commenter is not the post owner
  IF NEW.user_id IS DISTINCT FROM (SELECT user_id FROM forum_posts WHERE id = NEW.post_id) THEN
    INSERT INTO notifications (user_id, from_user_id, type, title, body, data)
    SELECT
      fp.user_id,
      NEW.user_id,
      'forum_comment',
      'Bình luận mới',
      (SELECT COALESCE(full_name, 'Ai đó') FROM profiles WHERE id = NEW.user_id) || ' đã bình luận bài viết của bạn',
      jsonb_build_object(
        'postId', NEW.post_id,
        'commentId', NEW.id
      )
    FROM forum_posts fp
    WHERE fp.id = NEW.post_id
      AND fp.user_id IS NOT NULL;
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
      jsonb_build_object(
        'postId', NEW.post_id,
        'commentId', NEW.id,
        'parentCommentId', NEW.parent_id
      )
    FROM forum_comments fc
    WHERE fc.id = NEW.parent_id
      AND fc.user_id IS NOT NULL
      AND fc.user_id IS DISTINCT FROM NEW.user_id;
  END IF;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Don't fail the insert if notification fails
  RAISE WARNING 'Comment notification error: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS on_comment_created ON forum_comments;
CREATE TRIGGER on_comment_created
  AFTER INSERT ON forum_comments
  FOR EACH ROW
  EXECUTE FUNCTION notify_comment_created();

-- Verify no more triggers referencing author_id
DO $$
DECLARE
  trigger_count INT;
BEGIN
  SELECT COUNT(*) INTO trigger_count
  FROM pg_trigger t
  JOIN pg_class c ON t.tgrelid = c.oid
  WHERE c.relname = 'forum_comments'
    AND NOT t.tgisinternal;

  RAISE NOTICE 'forum_comments has % custom triggers remaining', trigger_count;
END $$;
