-- =============================================
-- PHASE 1: REACTION SYSTEM
-- Migration: create_post_reactions
-- Date: 2024-12-30
-- =============================================

-- 1. Create post_reactions table
CREATE TABLE IF NOT EXISTS public.post_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.forum_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reaction_type VARCHAR(20) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_reaction_type CHECK (
    reaction_type IN ('like', 'love', 'haha', 'wow', 'sad', 'angry')
  ),
  CONSTRAINT unique_user_post_reaction UNIQUE(post_id, user_id)
);

-- 2. Add reaction_counts column to forum_posts
ALTER TABLE public.forum_posts ADD COLUMN IF NOT EXISTS reaction_counts JSONB
  DEFAULT '{"like":0,"love":0,"haha":0,"wow":0,"sad":0,"angry":0,"total":0}'::jsonb;

-- 3. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_post_reactions_post_id
  ON public.post_reactions(post_id);

CREATE INDEX IF NOT EXISTS idx_post_reactions_user_id
  ON public.post_reactions(user_id);

CREATE INDEX IF NOT EXISTS idx_post_reactions_type
  ON public.post_reactions(reaction_type);

CREATE INDEX IF NOT EXISTS idx_post_reactions_created
  ON public.post_reactions(created_at DESC);

-- 4. Enable RLS
ALTER TABLE public.post_reactions ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies
-- Anyone can view reactions
DROP POLICY IF EXISTS "Anyone can view reactions" ON public.post_reactions;
CREATE POLICY "Anyone can view reactions"
  ON public.post_reactions FOR SELECT
  USING (true);

-- Users can insert their own reactions
DROP POLICY IF EXISTS "Users can insert own reactions" ON public.post_reactions;
CREATE POLICY "Users can insert own reactions"
  ON public.post_reactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own reactions
DROP POLICY IF EXISTS "Users can update own reactions" ON public.post_reactions;
CREATE POLICY "Users can update own reactions"
  ON public.post_reactions FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own reactions
DROP POLICY IF EXISTS "Users can delete own reactions" ON public.post_reactions;
CREATE POLICY "Users can delete own reactions"
  ON public.post_reactions FOR DELETE
  USING (auth.uid() = user_id);

-- 6. Create function to update reaction counts
CREATE OR REPLACE FUNCTION public.update_post_reaction_counts()
RETURNS TRIGGER AS $$
DECLARE
  counts JSONB;
  target_post_id UUID;
BEGIN
  -- Get the correct post_id
  target_post_id := COALESCE(NEW.post_id, OLD.post_id);

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
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Create triggers for INSERT, UPDATE, DELETE
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

-- 8. Create notification function for reactions
CREATE OR REPLACE FUNCTION public.notify_post_reaction()
RETURNS TRIGGER AS $$
DECLARE
  post_owner_id UUID;
  reactor_name TEXT;
  post_preview TEXT;
BEGIN
  -- Get post owner and preview
  SELECT user_id, LEFT(content, 100) INTO post_owner_id, post_preview
  FROM public.forum_posts WHERE id = NEW.post_id;

  -- Get reactor display name
  SELECT display_name INTO reactor_name
  FROM public.profiles WHERE id = NEW.user_id;

  -- Don't notify self
  IF post_owner_id = NEW.user_id THEN
    RETURN NEW;
  END IF;

  -- Insert notification
  INSERT INTO public.notifications (
    user_id,
    type,
    title,
    body,
    data,
    created_at
  ) VALUES (
    post_owner_id,
    'reaction',
    COALESCE(reactor_name, 'Ai đó') || ' đã thả cảm xúc',
    'với bài viết của bạn',
    jsonb_build_object(
      'type', 'reaction',
      'post_id', NEW.post_id,
      'reactor_id', NEW.user_id,
      'reaction_type', NEW.reaction_type
    ),
    NOW()
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Create trigger for notifications
DROP TRIGGER IF EXISTS trigger_notify_post_reaction ON public.post_reactions;
CREATE TRIGGER trigger_notify_post_reaction
  AFTER INSERT ON public.post_reactions
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_post_reaction();

-- 10. Migrate existing likes from forum_likes to post_reactions
-- This converts old likes to reaction_type = 'like'
INSERT INTO public.post_reactions (post_id, user_id, reaction_type, created_at)
SELECT post_id, user_id, 'like', created_at
FROM public.forum_likes
WHERE post_id IS NOT NULL
ON CONFLICT (post_id, user_id) DO NOTHING;

-- 11. Create view for reaction details with user info
CREATE OR REPLACE VIEW public.post_reactions_with_users AS
SELECT
  pr.id,
  pr.post_id,
  pr.user_id,
  pr.reaction_type,
  pr.created_at,
  p.display_name,
  p.avatar_url
FROM public.post_reactions pr
LEFT JOIN public.profiles p ON pr.user_id = p.id;

-- 12. Grant permissions on view
GRANT SELECT ON public.post_reactions_with_users TO authenticated;

-- 13. Comments for documentation
COMMENT ON TABLE public.post_reactions IS 'Stores user reactions on forum posts (like, love, haha, wow, sad, angry)';
COMMENT ON COLUMN public.post_reactions.reaction_type IS 'Type of reaction: like, love, haha, wow, sad, angry';
COMMENT ON COLUMN public.forum_posts.reaction_counts IS 'JSONB object with counts per reaction type and total';
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
-- =============================================
-- PHASE 4: VIEW COUNT & ALGORITHM SYSTEM
-- Migration: 20251230_view_count_algorithm
-- Date: 2024-12-30
-- =============================================

-- 1. Post Views Table (for detailed tracking)
CREATE TABLE IF NOT EXISTS post_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  viewed_at TIMESTAMPTZ DEFAULT NOW(),
  view_duration_seconds INTEGER DEFAULT 0
);

-- Add columns if they don't exist (for existing tables)
ALTER TABLE post_views ADD COLUMN IF NOT EXISTS viewed_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE post_views ADD COLUMN IF NOT EXISTS view_duration_seconds INTEGER DEFAULT 0;
ALTER TABLE post_views ADD COLUMN IF NOT EXISTS ip_address INET;
ALTER TABLE post_views ADD COLUMN IF NOT EXISTS device_fingerprint VARCHAR(64);
ALTER TABLE post_views ADD COLUMN IF NOT EXISTS user_agent TEXT;
ALTER TABLE post_views ADD COLUMN IF NOT EXISTS referrer TEXT;

-- Drop old constraint if it exists and recreate
ALTER TABLE post_views DROP CONSTRAINT IF EXISTS valid_viewer;

-- 2. Indexes for post_views
CREATE INDEX IF NOT EXISTS idx_post_views_post_id
  ON post_views(post_id);

CREATE INDEX IF NOT EXISTS idx_post_views_user_post
  ON post_views(user_id, post_id)
  WHERE user_id IS NOT NULL;

-- Only create ip_address index if column exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'post_views' AND column_name = 'ip_address'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_post_views_ip_post
      ON post_views(ip_address, post_id)
      WHERE ip_address IS NOT NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_post_views_time
  ON post_views(viewed_at DESC);

-- Only create device_fingerprint index if column exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'post_views' AND column_name = 'device_fingerprint'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_post_views_fingerprint
      ON post_views(device_fingerprint, post_id)
      WHERE device_fingerprint IS NOT NULL;
  END IF;
END $$;

-- 3. Add score columns to forum_posts
ALTER TABLE forum_posts
ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0;

ALTER TABLE forum_posts
ADD COLUMN IF NOT EXISTS shares_count INTEGER DEFAULT 0;

ALTER TABLE forum_posts
ADD COLUMN IF NOT EXISTS comments_count INTEGER DEFAULT 0;

ALTER TABLE forum_posts
ADD COLUMN IF NOT EXISTS unique_viewers INTEGER DEFAULT 0;

ALTER TABLE forum_posts
ADD COLUMN IF NOT EXISTS hot_score DECIMAL(10, 4) DEFAULT 0;

ALTER TABLE forum_posts
ADD COLUMN IF NOT EXISTS trending_score DECIMAL(10, 4) DEFAULT 0;

ALTER TABLE forum_posts
ADD COLUMN IF NOT EXISTS quality_score DECIMAL(10, 4) DEFAULT 0;

ALTER TABLE forum_posts
ADD COLUMN IF NOT EXISTS last_engagement_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE forum_posts
ADD COLUMN IF NOT EXISTS scores_updated_at TIMESTAMPTZ DEFAULT NOW();

-- 4. Create indexes for sorting (use status column instead of is_deleted)
CREATE INDEX IF NOT EXISTS idx_forum_posts_hot_score
  ON forum_posts(hot_score DESC)
  WHERE status != 'deleted' OR status IS NULL;

CREATE INDEX IF NOT EXISTS idx_forum_posts_trending_score
  ON forum_posts(trending_score DESC)
  WHERE status != 'deleted' OR status IS NULL;

CREATE INDEX IF NOT EXISTS idx_forum_posts_views_count
  ON forum_posts(views_count DESC)
  WHERE status != 'deleted' OR status IS NULL;

-- 5. Function to record view (with deduplication via upsert approach)
CREATE OR REPLACE FUNCTION record_post_view(
  p_post_id UUID,
  p_user_id UUID DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_device_fingerprint VARCHAR DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_referrer TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_result BOOLEAN := FALSE;
  v_recent_view_exists BOOLEAN;
  v_time_bucket TIMESTAMPTZ;
BEGIN
  -- Calculate 5-minute time bucket
  v_time_bucket := date_trunc('hour', NOW()) +
    INTERVAL '5 min' * FLOOR(EXTRACT(MINUTE FROM NOW()) / 5);

  -- Check if user/device already viewed in this 5-min window
  IF p_user_id IS NOT NULL THEN
    SELECT EXISTS(
      SELECT 1 FROM post_views
      WHERE post_id = p_post_id
        AND user_id = p_user_id
        AND viewed_at >= v_time_bucket
    ) INTO v_recent_view_exists;
  ELSIF p_device_fingerprint IS NOT NULL THEN
    SELECT EXISTS(
      SELECT 1 FROM post_views
      WHERE post_id = p_post_id
        AND device_fingerprint = p_device_fingerprint
        AND viewed_at >= v_time_bucket
    ) INTO v_recent_view_exists;
  ELSE
    -- No user_id or fingerprint, skip dedup
    v_recent_view_exists := FALSE;
  END IF;

  -- Only insert if no recent view
  IF NOT v_recent_view_exists THEN
    INSERT INTO post_views (
      post_id,
      user_id,
      ip_address,
      device_fingerprint,
      user_agent,
      referrer
    ) VALUES (
      p_post_id,
      p_user_id,
      p_ip_address,
      p_device_fingerprint,
      p_user_agent,
      p_referrer
    );

    v_result := TRUE;

    -- Update post views count
    UPDATE forum_posts
    SET
      views_count = COALESCE(views_count, 0) + 1,
      last_engagement_at = NOW()
    WHERE id = p_post_id;
  END IF;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Function to calculate unique viewers
CREATE OR REPLACE FUNCTION calculate_unique_viewers(p_post_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(DISTINCT COALESCE(user_id::TEXT, device_fingerprint, ip_address::TEXT))
  INTO v_count
  FROM post_views
  WHERE post_id = p_post_id;

  RETURN COALESCE(v_count, 0);
END;
$$ LANGUAGE plpgsql;

-- 7. Function to calculate hot score
-- Formula: (engagement_score * decay_factor) + quality_bonus
-- Decay: Half-life of 24 hours
CREATE OR REPLACE FUNCTION calculate_hot_score(p_post_id UUID)
RETURNS DECIMAL AS $$
DECLARE
  v_post RECORD;
  v_age_hours DECIMAL;
  v_decay_factor DECIMAL;
  v_engagement_score DECIMAL;
  v_quality_bonus DECIMAL;
  v_hot_score DECIMAL;
  v_reaction_counts JSONB;
  v_total_reactions INTEGER;
BEGIN
  -- Get post data
  SELECT
    p.*,
    EXTRACT(EPOCH FROM (NOW() - p.created_at)) / 3600 AS age_hours
  INTO v_post
  FROM forum_posts p
  WHERE p.id = p_post_id;

  IF v_post IS NULL THEN
    RETURN 0;
  END IF;

  v_age_hours := GREATEST(v_post.age_hours, 0.1);

  -- Calculate decay (half-life = 24 hours)
  -- decay = 2 ^ (-age / half_life)
  v_decay_factor := POWER(2, -v_age_hours / 24);

  -- Get reaction counts
  v_reaction_counts := COALESCE(v_post.reaction_counts, '{"total": 0}'::JSONB);
  v_total_reactions := COALESCE((v_reaction_counts->>'total')::INTEGER, 0);

  -- Calculate engagement score
  -- Weights: reaction=1, comment=2, share=3, view=0.01
  v_engagement_score := (
    v_total_reactions * 1.0 +
    COALESCE(v_post.comments_count, 0) * 2.0 +
    COALESCE(v_post.shares_count, 0) * 3.0 +
    COALESCE(v_post.views_count, 0) * 0.01
  );

  -- Quality bonus (based on content completeness)
  v_quality_bonus := 0;
  IF v_post.content IS NOT NULL AND LENGTH(v_post.content) > 100 THEN
    v_quality_bonus := v_quality_bonus + 1;
  END IF;
  IF v_post.media_urls IS NOT NULL AND jsonb_array_length(v_post.media_urls) > 0 THEN
    v_quality_bonus := v_quality_bonus + 2;
  END IF;
  IF v_post.image_url IS NOT NULL THEN
    v_quality_bonus := v_quality_bonus + 1;
  END IF;

  -- Calculate final score
  v_hot_score := (v_engagement_score * v_decay_factor) + v_quality_bonus;

  RETURN ROUND(v_hot_score, 4);
END;
$$ LANGUAGE plpgsql;

-- 8. Function to calculate trending score
-- Based on velocity of engagement in last 6 hours
CREATE OR REPLACE FUNCTION calculate_trending_score(p_post_id UUID)
RETURNS DECIMAL AS $$
DECLARE
  v_recent_views INTEGER;
  v_recent_reactions INTEGER;
  v_recent_comments INTEGER;
  v_total_recent INTEGER;
  v_age_hours DECIMAL;
  v_velocity DECIMAL;
  v_trending_score DECIMAL;
BEGIN
  -- Get age
  SELECT EXTRACT(EPOCH FROM (NOW() - created_at)) / 3600
  INTO v_age_hours
  FROM forum_posts
  WHERE id = p_post_id;

  IF v_age_hours IS NULL THEN
    RETURN 0;
  END IF;

  -- Count recent engagement (last 6 hours)
  SELECT COUNT(*)
  INTO v_recent_views
  FROM post_views
  WHERE post_id = p_post_id
    AND viewed_at > NOW() - INTERVAL '6 hours';

  SELECT COUNT(*)
  INTO v_recent_reactions
  FROM post_reactions
  WHERE post_id = p_post_id
    AND created_at > NOW() - INTERVAL '6 hours';

  SELECT COUNT(*)
  INTO v_recent_comments
  FROM forum_comments
  WHERE post_id = p_post_id
    AND created_at > NOW() - INTERVAL '6 hours';

  -- Total recent engagement
  v_total_recent := (
    COALESCE(v_recent_views, 0) * 1 +
    COALESCE(v_recent_reactions, 0) * 3 +
    COALESCE(v_recent_comments, 0) * 5
  );

  -- Calculate velocity (engagement per hour)
  -- Higher velocity = more trending
  v_velocity := v_total_recent / GREATEST(LEAST(v_age_hours, 6), 0.1);

  -- Apply freshness boost for very new posts
  IF v_age_hours < 2 THEN
    v_velocity := v_velocity * 1.5;
  ELSIF v_age_hours < 6 THEN
    v_velocity := v_velocity * 1.2;
  END IF;

  v_trending_score := v_velocity;

  RETURN ROUND(v_trending_score, 4);
END;
$$ LANGUAGE plpgsql;

-- 9. Function to update all scores for a post
CREATE OR REPLACE FUNCTION update_post_scores(p_post_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE forum_posts
  SET
    unique_viewers = calculate_unique_viewers(p_post_id),
    hot_score = calculate_hot_score(p_post_id),
    trending_score = calculate_trending_score(p_post_id),
    scores_updated_at = NOW()
  WHERE id = p_post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Trigger to update scores on new view
CREATE OR REPLACE FUNCTION trigger_view_update_scores()
RETURNS TRIGGER AS $$
BEGIN
  -- Queue score update (runs on each insert)
  PERFORM update_post_scores(NEW.post_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_view_update_scores ON post_views;
CREATE TRIGGER trigger_view_update_scores
  AFTER INSERT ON post_views
  FOR EACH ROW
  EXECUTE FUNCTION trigger_view_update_scores();

-- 11. Trigger to update scores on reaction changes
CREATE OR REPLACE FUNCTION trigger_reaction_update_post_scores()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM update_post_scores(COALESCE(NEW.post_id, OLD.post_id));
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_reaction_update_post_scores ON post_reactions;
CREATE TRIGGER trigger_reaction_update_post_scores
  AFTER INSERT OR DELETE ON post_reactions
  FOR EACH ROW
  EXECUTE FUNCTION trigger_reaction_update_post_scores();

-- 12. Trigger to update scores on comment changes
CREATE OR REPLACE FUNCTION trigger_comment_update_post_scores()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM update_post_scores(COALESCE(NEW.post_id, OLD.post_id));
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_comment_update_post_scores ON forum_comments;
CREATE TRIGGER trigger_comment_update_post_scores
  AFTER INSERT OR DELETE ON forum_comments
  FOR EACH ROW
  EXECUTE FUNCTION trigger_comment_update_post_scores();

-- 13. Function to batch refresh scores for recent posts
CREATE OR REPLACE FUNCTION refresh_recent_post_scores()
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER := 0;
  v_post RECORD;
BEGIN
  FOR v_post IN
    SELECT id FROM forum_posts
    WHERE (status != 'deleted' OR status IS NULL)
      AND created_at > NOW() - INTERVAL '7 days'
  LOOP
    PERFORM update_post_scores(v_post.id);
    v_count := v_count + 1;
  END LOOP;

  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 14. RLS Policies
ALTER TABLE post_views ENABLE ROW LEVEL SECURITY;

-- Anyone can insert views (tracked by user_id or fingerprint)
DROP POLICY IF EXISTS "Anyone can record views" ON post_views;
CREATE POLICY "Anyone can record views" ON post_views
  FOR INSERT WITH CHECK (TRUE);

-- Users can see own view history
DROP POLICY IF EXISTS "Users can view own history" ON post_views;
CREATE POLICY "Users can view own history" ON post_views
  FOR SELECT USING (
    auth.uid() = user_id
  );

-- Admins can view all
DROP POLICY IF EXISTS "Admins can view all" ON post_views;
CREATE POLICY "Admins can view all" ON post_views
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'gem_master')
    )
  );

-- 15. Comments
COMMENT ON TABLE post_views IS 'Tracks individual post views for analytics';
COMMENT ON COLUMN forum_posts.views_count IS 'Total number of views';
COMMENT ON COLUMN forum_posts.unique_viewers IS 'Number of unique viewers';
COMMENT ON COLUMN forum_posts.hot_score IS 'Hot ranking score (engagement * decay)';
COMMENT ON COLUMN forum_posts.trending_score IS 'Trending score (recent velocity)';
COMMENT ON COLUMN forum_posts.quality_score IS 'Content quality score';

-- 16. Initialize scores for existing posts
-- Only run once during migration
DO $$
DECLARE
  v_post RECORD;
BEGIN
  -- Update scores for recent posts (last 30 days)
  FOR v_post IN
    SELECT id FROM forum_posts
    WHERE (status != 'deleted' OR status IS NULL)
      AND created_at > NOW() - INTERVAL '30 days'
    LIMIT 1000
  LOOP
    PERFORM update_post_scores(v_post.id);
  END LOOP;
END $$;
