-- =============================================
-- PHASE 3: COMMENT THREADING
-- Migration: 20251230_comment_threading
-- Date: 2024-12-30
-- NOTE: Uses existing parent_id column (not parent_comment_id)
-- =============================================

-- 1. Add threading columns to forum_comments (if not exist)
ALTER TABLE forum_comments
ADD COLUMN IF NOT EXISTS reply_to_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE forum_comments
ADD COLUMN IF NOT EXISTS thread_depth INTEGER DEFAULT 0;

ALTER TABLE forum_comments
ADD COLUMN IF NOT EXISTS is_collapsed BOOLEAN DEFAULT FALSE;

-- Add replies_count if it doesn't exist
ALTER TABLE forum_comments
ADD COLUMN IF NOT EXISTS replies_count INTEGER DEFAULT 0;

-- Add parent_id if it doesn't exist
ALTER TABLE forum_comments
ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES forum_comments(id) ON DELETE CASCADE;

-- 2. Create indexes for threading
CREATE INDEX IF NOT EXISTS idx_forum_comments_parent
  ON forum_comments(parent_id);

CREATE INDEX IF NOT EXISTS idx_forum_comments_post_parent
  ON forum_comments(post_id, parent_id);

CREATE INDEX IF NOT EXISTS idx_forum_comments_thread_depth
  ON forum_comments(thread_depth);

-- 3. Add constraint for max depth (2 levels)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'check_thread_depth'
  ) THEN
    ALTER TABLE forum_comments
    ADD CONSTRAINT check_thread_depth CHECK (thread_depth >= 0 AND thread_depth <= 2);
  END IF;
END $$;

-- 4. Function to update replies_count
CREATE OR REPLACE FUNCTION update_comment_replies_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.parent_id IS NOT NULL THEN
    -- Increment parent's replies_count
    UPDATE forum_comments
    SET replies_count = COALESCE(replies_count, 0) + 1,
        updated_at = NOW()
    WHERE id = NEW.parent_id;
  ELSIF TG_OP = 'DELETE' AND OLD.parent_id IS NOT NULL THEN
    -- Decrement parent's replies_count
    UPDATE forum_comments
    SET replies_count = GREATEST(0, COALESCE(replies_count, 1) - 1),
        updated_at = NOW()
    WHERE id = OLD.parent_id;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Create triggers for replies_count
DROP TRIGGER IF EXISTS trigger_comment_replies_count_insert ON forum_comments;
CREATE TRIGGER trigger_comment_replies_count_insert
  AFTER INSERT ON forum_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_comment_replies_count();

DROP TRIGGER IF EXISTS trigger_comment_replies_count_delete ON forum_comments;
CREATE TRIGGER trigger_comment_replies_count_delete
  AFTER DELETE ON forum_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_comment_replies_count();

-- 6. Function to calculate thread_depth on insert
CREATE OR REPLACE FUNCTION set_comment_thread_depth()
RETURNS TRIGGER AS $$
DECLARE
  parent_depth INTEGER;
BEGIN
  IF NEW.parent_id IS NOT NULL THEN
    -- Get parent's depth
    SELECT thread_depth INTO parent_depth
    FROM forum_comments
    WHERE id = NEW.parent_id;

    -- Set depth (max 2)
    NEW.thread_depth := LEAST(COALESCE(parent_depth, 0) + 1, 2);

    -- If parent is at depth 2, reply to grandparent instead (flatten)
    IF parent_depth >= 2 THEN
      -- Get the root comment of this thread
      SELECT COALESCE(parent_id, id) INTO NEW.parent_id
      FROM forum_comments
      WHERE id = NEW.parent_id;
      NEW.thread_depth := 2;
    END IF;
  ELSE
    NEW.thread_depth := 0;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_thread_depth ON forum_comments;
CREATE TRIGGER trigger_set_thread_depth
  BEFORE INSERT ON forum_comments
  FOR EACH ROW
  EXECUTE FUNCTION set_comment_thread_depth();

-- 7. View for comments with user and reply info
CREATE OR REPLACE VIEW forum_comments_threaded AS
SELECT
  c.id,
  c.post_id,
  c.user_id,
  c.content,
  c.parent_id,
  c.reply_to_user_id,
  c.thread_depth,
  c.replies_count,
  c.is_collapsed,
  c.likes_count,
  c.created_at,
  c.updated_at,
  -- Author info from profiles
  p.display_name AS author_name,
  p.avatar_url AS author_avatar,
  p.username AS author_username,
  -- Reply-to user info
  rp.display_name AS reply_to_name,
  rp.username AS reply_to_username
FROM forum_comments c
LEFT JOIN profiles p ON c.user_id = p.id
LEFT JOIN profiles rp ON c.reply_to_user_id = rp.id;

-- 8. Grant permissions
GRANT SELECT ON forum_comments_threaded TO authenticated;
GRANT SELECT ON forum_comments_threaded TO anon;

-- 9. Function for notification on comment reply
CREATE OR REPLACE FUNCTION notify_comment_reply()
RETURNS TRIGGER AS $$
DECLARE
  parent_author_id UUID;
  post_author_id UUID;
  commenter_name TEXT;
  post_content TEXT;
BEGIN
  -- Only for replies
  IF NEW.parent_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Get parent comment author
  SELECT user_id INTO parent_author_id
  FROM forum_comments
  WHERE id = NEW.parent_id;

  -- Get post author and content
  SELECT user_id, LEFT(content, 50) INTO post_author_id, post_content
  FROM forum_posts
  WHERE id = NEW.post_id;

  -- Get commenter name
  SELECT display_name INTO commenter_name
  FROM profiles
  WHERE id = NEW.user_id;

  -- Notify parent comment author (not self)
  IF parent_author_id IS NOT NULL AND parent_author_id != NEW.user_id THEN
    INSERT INTO notifications (
      user_id,
      type,
      title,
      body,
      data,
      created_at
    ) VALUES (
      parent_author_id,
      'comment_reply',
      COALESCE(commenter_name, 'Người dùng') || ' đã trả lời bình luận của bạn',
      LEFT(NEW.content, 100),
      jsonb_build_object(
        'post_id', NEW.post_id,
        'comment_id', NEW.id,
        'parent_id', NEW.parent_id
      ),
      NOW()
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_notify_comment_reply ON forum_comments;
CREATE TRIGGER trigger_notify_comment_reply
  AFTER INSERT ON forum_comments
  FOR EACH ROW
  EXECUTE FUNCTION notify_comment_reply();

-- 10. Update existing comments to set thread_depth (backfill)
UPDATE forum_comments
SET thread_depth = CASE
  WHEN parent_id IS NULL THEN 0
  ELSE 1
END
WHERE thread_depth IS NULL OR thread_depth = 0;

-- 11. Comments on columns
COMMENT ON COLUMN forum_comments.parent_id IS 'Parent comment ID for threading (NULL for root comments)';
COMMENT ON COLUMN forum_comments.reply_to_user_id IS 'User being replied to (for @mention display)';
COMMENT ON COLUMN forum_comments.thread_depth IS 'Depth in thread: 0=root, 1=reply, 2=nested reply (max)';
COMMENT ON COLUMN forum_comments.replies_count IS 'Number of direct replies to this comment';
COMMENT ON COLUMN forum_comments.is_collapsed IS 'Whether thread is collapsed by default';
