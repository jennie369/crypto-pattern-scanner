-- GEM Platform - Forum Tabs Enhancement Migration
-- Created: November 24, 2025
-- Purpose: Add support for new tab system (Kham pha, Dang theo doi, Tin tuc, Thong bao, Pho bien, Academy)

-- =====================================================
-- 1. ADD NEW COLUMNS TO FORUM_POSTS FOR TAB SYSTEM
-- =====================================================

-- Add is_admin_post column (for News, Notifications, Academy tabs)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'forum_posts' AND column_name = 'is_admin_post') THEN
    ALTER TABLE public.forum_posts ADD COLUMN is_admin_post BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- Add post_type column (news, announcement, academy, general)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'forum_posts' AND column_name = 'post_type') THEN
    ALTER TABLE public.forum_posts ADD COLUMN post_type VARCHAR(50) DEFAULT 'general';
  END IF;
END $$;

-- Add topic column (giao-dich, tinh-than, can-bang) for topic-based filtering
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'forum_posts' AND column_name = 'topic') THEN
    ALTER TABLE public.forum_posts ADD COLUMN topic VARCHAR(50);
  END IF;
END $$;

-- Add sub_category column for more specific categorization
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'forum_posts' AND column_name = 'sub_category') THEN
    ALTER TABLE public.forum_posts ADD COLUMN sub_category VARCHAR(100);
  END IF;
END $$;

-- Add popularity_score for Popular tab ranking
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'forum_posts' AND column_name = 'popularity_score') THEN
    ALTER TABLE public.forum_posts ADD COLUMN popularity_score INTEGER DEFAULT 0;
  END IF;
END $$;

-- =====================================================
-- 2. CREATE INDEXES FOR EFFICIENT QUERIES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_forum_posts_admin ON public.forum_posts(is_admin_post);
CREATE INDEX IF NOT EXISTS idx_forum_posts_type ON public.forum_posts(post_type);
CREATE INDEX IF NOT EXISTS idx_forum_posts_topic ON public.forum_posts(topic);
CREATE INDEX IF NOT EXISTS idx_forum_posts_popularity ON public.forum_posts(popularity_score DESC);

-- Composite index for Popular tab (likes + comments for trending)
CREATE INDEX IF NOT EXISTS idx_forum_posts_trending ON public.forum_posts(likes_count DESC, comments_count DESC);

-- =====================================================
-- 3. ROLE COLUMN ALREADY EXISTS IN users TABLE
-- Values: 'admin', 'moderator', 'mentor', 'partner', NULL (regular user)
-- Added by 20241117_add_user_role_column.sql
-- =====================================================

-- Add role column to profiles table (for PostgREST joins)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'role') THEN
    ALTER TABLE public.profiles ADD COLUMN role TEXT DEFAULT NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role) WHERE role IS NOT NULL;

-- =====================================================
-- 4. FUNCTION TO CALCULATE POPULARITY SCORE
-- =====================================================

CREATE OR REPLACE FUNCTION calculate_popularity_score()
RETURNS TRIGGER AS $$
BEGIN
  -- Popularity formula: likes * 2 + comments * 3 + views * 0.1
  -- Recent posts get a boost
  UPDATE public.forum_posts
  SET popularity_score = (
    likes_count * 2 +
    comments_count * 3 +
    COALESCE(views_count, 0) * 0.1 +
    -- Recency boost: posts within 24h get +100, within 7d get +50
    CASE
      WHEN created_at > NOW() - INTERVAL '24 hours' THEN 100
      WHEN created_at > NOW() - INTERVAL '7 days' THEN 50
      ELSE 0
    END
  )::INTEGER
  WHERE id = COALESCE(NEW.post_id, NEW.id, OLD.post_id, OLD.id);

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update popularity on likes
DROP TRIGGER IF EXISTS trigger_update_popularity_on_like ON public.forum_likes;
CREATE TRIGGER trigger_update_popularity_on_like
  AFTER INSERT OR DELETE ON public.forum_likes
  FOR EACH ROW EXECUTE FUNCTION calculate_popularity_score();

-- Trigger to update popularity on comments
DROP TRIGGER IF EXISTS trigger_update_popularity_on_comment ON public.forum_comments;
CREATE TRIGGER trigger_update_popularity_on_comment
  AFTER INSERT OR DELETE ON public.forum_comments
  FOR EACH ROW EXECUTE FUNCTION calculate_popularity_score();

-- =====================================================
-- 5. FORUM NOTIFICATIONS TABLE (for Thong bao tab)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.forum_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- NULL = broadcast to all
  post_id UUID REFERENCES public.forum_posts(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- 'like', 'comment', 'follow', 'mention', 'system', 'announcement'
  title VARCHAR(255),
  message TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_forum_notifications_user ON public.forum_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_forum_notifications_read ON public.forum_notifications(is_read);

-- Enable RLS
ALTER TABLE public.forum_notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their notifications" ON public.forum_notifications;
CREATE POLICY "Users can view their notifications" ON public.forum_notifications
  FOR SELECT USING (user_id IS NULL OR auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can mark notifications as read" ON public.forum_notifications;
CREATE POLICY "Users can mark notifications as read" ON public.forum_notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- =====================================================
-- 6. UPDATE EXISTING POSTS RLS FOR ADMIN POSTS
-- =====================================================

-- Admin users can create admin posts (using role = 'admin' from users table)
DROP POLICY IF EXISTS "Admin users can create admin posts" ON public.forum_posts;
CREATE POLICY "Admin users can create admin posts" ON public.forum_posts
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    (
      is_admin_post = false OR is_admin_post IS NULL OR
      EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    )
  );

-- =====================================================
-- 7. SAMPLE ADMIN POST DATA (Optional - for testing)
-- =====================================================

-- Uncomment below to insert sample admin posts for testing
/*
INSERT INTO public.forum_posts (user_id, title, content, is_admin_post, post_type, topic)
SELECT
  id,
  'Tin tuc thi truong tuan nay',
  'Cap nhat tin tuc moi nhat ve thi truong crypto...',
  true,
  'news',
  'giao-dich'
FROM public.users WHERE is_admin = true LIMIT 1;

INSERT INTO public.forum_posts (user_id, title, content, is_admin_post, post_type)
SELECT
  id,
  'Thong bao: Cap nhat phien ban moi',
  'Chung toi vua cap nhat phien ban moi voi nhieu tinh nang...',
  true,
  'announcement',
  NULL
FROM public.users WHERE is_admin = true LIMIT 1;

INSERT INTO public.forum_posts (user_id, title, content, is_admin_post, post_type, topic)
SELECT
  id,
  'Khoa hoc: Trading co ban cho nguoi moi',
  'Hoc cach giao dich hieu qua tu so 0...',
  true,
  'academy',
  'giao-dich'
FROM public.users WHERE is_admin = true LIMIT 1;
*/

-- =====================================================
-- DONE!
-- =====================================================
