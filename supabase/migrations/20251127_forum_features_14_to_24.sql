-- =====================================================
-- GEM Master Forum - Features #14-#24 Migration
-- FIXED: Uses correct column names from DATABASE_SCHEMA.md
-- - post_edit_history: uses edited_by (NOT user_id)
-- - comment_edit_history: uses edited_by (NOT user_id)
-- - story_views: uses viewer_id (NOT user_id)
-- - stream_gifts: uses sender_id (NOT user_id)
-- =====================================================

-- =====================================================
-- Feature #14: Turn Off Notifications (per post)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  post_id UUID NOT NULL,
  muted BOOLEAN DEFAULT true,
  muted_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);

CREATE INDEX IF NOT EXISTS idx_notification_preferences_user ON public.notification_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_preferences_post ON public.notification_preferences(post_id);

ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own notification preferences" ON public.notification_preferences;
CREATE POLICY "Users can manage own notification preferences"
  ON public.notification_preferences FOR ALL
  USING (auth.uid() = user_id);

-- =====================================================
-- Feature #16: Schedule Posts
-- =====================================================
CREATE TABLE IF NOT EXISTS public.scheduled_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  topic TEXT,
  images TEXT[] DEFAULT '{}',
  poll_data JSONB,
  scheduled_at TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'published', 'failed', 'cancelled')),
  published_at TIMESTAMPTZ,
  published_post_id UUID,
  cancelled_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scheduled_posts_user ON public.scheduled_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_status ON public.scheduled_posts(status);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_scheduled_at ON public.scheduled_posts(scheduled_at);

ALTER TABLE public.scheduled_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own scheduled posts" ON public.scheduled_posts;
CREATE POLICY "Users can manage own scheduled posts"
  ON public.scheduled_posts FOR ALL
  USING (auth.uid() = user_id);

-- =====================================================
-- Feature #18: Edit History for Posts (EXISTING TABLE)
-- Uses: edited_by (NOT user_id)
-- =====================================================
ALTER TABLE public.post_edit_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view post edit history" ON public.post_edit_history;
CREATE POLICY "Anyone can view post edit history"
  ON public.post_edit_history FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can create edit history" ON public.post_edit_history;
CREATE POLICY "Users can create edit history"
  ON public.post_edit_history FOR INSERT
  WITH CHECK (auth.uid() = edited_by);

-- =====================================================
-- Feature #18: Edit History for Comments
-- Uses: edited_by (NOT user_id)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.comment_edit_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL,
  content_before TEXT,
  content_after TEXT,
  edited_by UUID NOT NULL,
  edited_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_comment_edit_history_comment ON public.comment_edit_history(comment_id);

ALTER TABLE public.comment_edit_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view comment edit history" ON public.comment_edit_history;
CREATE POLICY "Anyone can view comment edit history"
  ON public.comment_edit_history FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can create comment edit history" ON public.comment_edit_history;
CREATE POLICY "Users can create comment edit history"
  ON public.comment_edit_history FOR INSERT
  WITH CHECK (auth.uid() = edited_by);

-- =====================================================
-- Feature #20: Pin Posts to Profile
-- =====================================================
CREATE TABLE IF NOT EXISTS public.pinned_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  post_id UUID NOT NULL,
  pin_order INTEGER DEFAULT 1,
  pinned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);

CREATE INDEX IF NOT EXISTS idx_pinned_posts_user ON public.pinned_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_pinned_posts_order ON public.pinned_posts(user_id, pin_order);

ALTER TABLE public.pinned_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view pinned posts" ON public.pinned_posts;
CREATE POLICY "Anyone can view pinned posts"
  ON public.pinned_posts FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can manage own pinned posts" ON public.pinned_posts;
CREATE POLICY "Users can manage own pinned posts"
  ON public.pinned_posts FOR ALL
  USING (auth.uid() = user_id);

-- =====================================================
-- Feature #21: Stories
-- =====================================================
CREATE TABLE IF NOT EXISTS public.stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  media_url TEXT NOT NULL,
  media_type TEXT DEFAULT 'image' CHECK (media_type IN ('image', 'video')),
  caption TEXT,
  stickers JSONB DEFAULT '[]',
  background_color TEXT,
  views_count INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stories_user ON public.stories(user_id);
CREATE INDEX IF NOT EXISTS idx_stories_expires ON public.stories(expires_at);

ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active stories" ON public.stories;
CREATE POLICY "Anyone can view active stories"
  ON public.stories FOR SELECT
  USING (expires_at > NOW());

DROP POLICY IF EXISTS "Users can manage own stories" ON public.stories;
CREATE POLICY "Users can manage own stories"
  ON public.stories FOR ALL
  USING (auth.uid() = user_id);

-- Story views (uses viewer_id NOT user_id)
CREATE TABLE IF NOT EXISTS public.story_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL,
  viewer_id UUID NOT NULL,
  viewed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(story_id, viewer_id)
);

CREATE INDEX IF NOT EXISTS idx_story_views_story ON public.story_views(story_id);
CREATE INDEX IF NOT EXISTS idx_story_views_viewer ON public.story_views(viewer_id);

ALTER TABLE public.story_views ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view story views" ON public.story_views;
CREATE POLICY "Anyone can view story views"
  ON public.story_views FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can create story views" ON public.story_views;
CREATE POLICY "Users can create story views"
  ON public.story_views FOR INSERT
  WITH CHECK (auth.uid() = viewer_id);

-- Story reactions
CREATE TABLE IF NOT EXISTS public.story_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL,
  user_id UUID NOT NULL,
  reaction TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_story_reactions_story ON public.story_reactions(story_id);

ALTER TABLE public.story_reactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view story reactions" ON public.story_reactions;
CREATE POLICY "Anyone can view story reactions"
  ON public.story_reactions FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can add story reactions" ON public.story_reactions;
CREATE POLICY "Users can add story reactions"
  ON public.story_reactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Story replies
CREATE TABLE IF NOT EXISTS public.story_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL,
  user_id UUID NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_story_replies_story ON public.story_replies(story_id);

ALTER TABLE public.story_replies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view story replies" ON public.story_replies;
CREATE POLICY "Anyone can view story replies"
  ON public.story_replies FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can send story replies" ON public.story_replies;
CREATE POLICY "Users can send story replies"
  ON public.story_replies FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Function to increment story views
CREATE OR REPLACE FUNCTION public.increment_story_views(p_story_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.stories
  SET views_count = views_count + 1
  WHERE id = p_story_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Feature #22: Live Streaming
-- =====================================================
CREATE TABLE IF NOT EXISTS public.live_streams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  topic TEXT,
  stream_key TEXT UNIQUE,
  thumbnail_url TEXT,
  status TEXT DEFAULT 'live' CHECK (status IN ('live', 'ended', 'paused')),
  viewers_count INTEGER DEFAULT 0,
  peak_viewers INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_live_streams_user ON public.live_streams(user_id);
CREATE INDEX IF NOT EXISTS idx_live_streams_status ON public.live_streams(status);

ALTER TABLE public.live_streams ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view live streams" ON public.live_streams;
CREATE POLICY "Anyone can view live streams"
  ON public.live_streams FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can manage own streams" ON public.live_streams;
CREATE POLICY "Users can manage own streams"
  ON public.live_streams FOR ALL
  USING (auth.uid() = user_id);

-- Stream viewers
CREATE TABLE IF NOT EXISTS public.stream_viewers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_id UUID NOT NULL,
  user_id UUID NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(stream_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_stream_viewers_stream ON public.stream_viewers(stream_id);

ALTER TABLE public.stream_viewers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view stream viewers" ON public.stream_viewers;
CREATE POLICY "Anyone can view stream viewers"
  ON public.stream_viewers FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can join streams" ON public.stream_viewers;
CREATE POLICY "Users can join streams"
  ON public.stream_viewers FOR ALL
  USING (auth.uid() = user_id);

-- Stream chat
CREATE TABLE IF NOT EXISTS public.stream_chat (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_id UUID NOT NULL,
  user_id UUID NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stream_chat_stream ON public.stream_chat(stream_id);

ALTER TABLE public.stream_chat ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view stream chat" ON public.stream_chat;
CREATE POLICY "Anyone can view stream chat"
  ON public.stream_chat FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can send stream chat" ON public.stream_chat;
CREATE POLICY "Users can send stream chat"
  ON public.stream_chat FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Stream gifts (uses sender_id NOT user_id)
CREATE TABLE IF NOT EXISTS public.stream_gifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_id UUID NOT NULL,
  sender_id UUID NOT NULL,
  gift_type TEXT NOT NULL,
  amount INTEGER DEFAULT 0,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stream_gifts_stream ON public.stream_gifts(stream_id);

ALTER TABLE public.stream_gifts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view stream gifts" ON public.stream_gifts;
CREATE POLICY "Anyone can view stream gifts"
  ON public.stream_gifts FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can send stream gifts" ON public.stream_gifts;
CREATE POLICY "Users can send stream gifts"
  ON public.stream_gifts FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

-- Functions for stream viewer count
CREATE OR REPLACE FUNCTION public.increment_stream_viewers(p_stream_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.live_streams
  SET
    viewers_count = viewers_count + 1,
    peak_viewers = GREATEST(peak_viewers, viewers_count + 1)
  WHERE id = p_stream_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.decrement_stream_viewers(p_stream_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.live_streams
  SET viewers_count = GREATEST(0, viewers_count - 1)
  WHERE id = p_stream_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Grant execute permissions
-- =====================================================
GRANT EXECUTE ON FUNCTION public.increment_story_views(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_stream_viewers(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.decrement_stream_viewers(UUID) TO authenticated;

-- =====================================================
-- DONE!
-- =====================================================
SELECT 'Migration completed successfully!' as status;
