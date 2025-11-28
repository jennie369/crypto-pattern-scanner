-- GEM Platform - Forum Tables Migration
-- Created: November 23, 2025

-- =====================================================
-- 1. FORUM CATEGORIES
-- =====================================================
CREATE TABLE IF NOT EXISTS public.forum_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  color VARCHAR(20) DEFAULT '#FFBD59',
  icon VARCHAR(50),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default categories
INSERT INTO public.forum_categories (name, description, color, sort_order) VALUES
  ('Tin Tức', 'Tin tức thị trường và cập nhật', '#3B82F6', 1),
  ('Phân Tích', 'Phân tích kỹ thuật và cơ bản', '#10B981', 2),
  ('Thảo Luận', 'Thảo luận chung về trading', '#8B5CF6', 3),
  ('Hỏi Đáp', 'Câu hỏi và giải đáp', '#F59E0B', 4),
  ('Chia Sẻ', 'Chia sẻ kinh nghiệm và chiến lược', '#EC4899', 5)
ON CONFLICT DO NOTHING;

-- =====================================================
-- 2. FORUM POSTS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.forum_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.forum_categories(id) ON DELETE SET NULL,
  title VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  is_pinned BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  status VARCHAR(20) DEFAULT 'published', -- published, draft, hidden
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_forum_posts_user ON public.forum_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_category ON public.forum_posts(category_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_created ON public.forum_posts(created_at DESC);

-- =====================================================
-- 3. FORUM COMMENTS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.forum_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.forum_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.forum_comments(id) ON DELETE CASCADE, -- For nested replies
  content TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_forum_comments_post ON public.forum_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_forum_comments_user ON public.forum_comments(user_id);

-- =====================================================
-- 4. FORUM LIKES
-- =====================================================
CREATE TABLE IF NOT EXISTS public.forum_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID REFERENCES public.forum_posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES public.forum_comments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- Ensure user can only like once per post/comment
  UNIQUE(user_id, post_id),
  UNIQUE(user_id, comment_id),
  -- Either post_id or comment_id must be set
  CHECK (post_id IS NOT NULL OR comment_id IS NOT NULL)
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_forum_likes_post ON public.forum_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_forum_likes_comment ON public.forum_likes(comment_id);

-- =====================================================
-- 5. TRIGGERS FOR COUNTERS
-- =====================================================

-- Function to update post likes count
CREATE OR REPLACE FUNCTION update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.post_id IS NOT NULL THEN
    UPDATE public.forum_posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' AND OLD.post_id IS NOT NULL THEN
    UPDATE public.forum_posts SET likes_count = GREATEST(0, likes_count - 1) WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for likes
DROP TRIGGER IF EXISTS trigger_update_post_likes ON public.forum_likes;
CREATE TRIGGER trigger_update_post_likes
  AFTER INSERT OR DELETE ON public.forum_likes
  FOR EACH ROW EXECUTE FUNCTION update_post_likes_count();

-- Function to update post comments count
CREATE OR REPLACE FUNCTION update_post_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.forum_posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.forum_posts SET comments_count = GREATEST(0, comments_count - 1) WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for comments count
DROP TRIGGER IF EXISTS trigger_update_comments_count ON public.forum_comments;
CREATE TRIGGER trigger_update_comments_count
  AFTER INSERT OR DELETE ON public.forum_comments
  FOR EACH ROW EXECUTE FUNCTION update_post_comments_count();

-- =====================================================
-- 6. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS
ALTER TABLE public.forum_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_likes ENABLE ROW LEVEL SECURITY;

-- Categories: Everyone can read
DROP POLICY IF EXISTS "Anyone can view categories" ON public.forum_categories;
CREATE POLICY "Anyone can view categories" ON public.forum_categories
  FOR SELECT USING (true);

-- Posts: Everyone can read published posts
DROP POLICY IF EXISTS "Anyone can view published posts" ON public.forum_posts;
CREATE POLICY "Anyone can view published posts" ON public.forum_posts
  FOR SELECT USING (status = 'published');

-- Posts: Authenticated users can create
DROP POLICY IF EXISTS "Authenticated users can create posts" ON public.forum_posts;
CREATE POLICY "Authenticated users can create posts" ON public.forum_posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Posts: Users can update their own posts
DROP POLICY IF EXISTS "Users can update own posts" ON public.forum_posts;
CREATE POLICY "Users can update own posts" ON public.forum_posts
  FOR UPDATE USING (auth.uid() = user_id);

-- Posts: Users can delete their own posts
DROP POLICY IF EXISTS "Users can delete own posts" ON public.forum_posts;
CREATE POLICY "Users can delete own posts" ON public.forum_posts
  FOR DELETE USING (auth.uid() = user_id);

-- Comments: Everyone can read
DROP POLICY IF EXISTS "Anyone can view comments" ON public.forum_comments;
CREATE POLICY "Anyone can view comments" ON public.forum_comments
  FOR SELECT USING (true);

-- Comments: Authenticated users can create
DROP POLICY IF EXISTS "Authenticated users can create comments" ON public.forum_comments;
CREATE POLICY "Authenticated users can create comments" ON public.forum_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Comments: Users can update their own comments
DROP POLICY IF EXISTS "Users can update own comments" ON public.forum_comments;
CREATE POLICY "Users can update own comments" ON public.forum_comments
  FOR UPDATE USING (auth.uid() = user_id);

-- Comments: Users can delete their own comments
DROP POLICY IF EXISTS "Users can delete own comments" ON public.forum_comments;
CREATE POLICY "Users can delete own comments" ON public.forum_comments
  FOR DELETE USING (auth.uid() = user_id);

-- Likes: Everyone can read
DROP POLICY IF EXISTS "Anyone can view likes" ON public.forum_likes;
CREATE POLICY "Anyone can view likes" ON public.forum_likes
  FOR SELECT USING (true);

-- Likes: Authenticated users can create
DROP POLICY IF EXISTS "Authenticated users can create likes" ON public.forum_likes;
CREATE POLICY "Authenticated users can create likes" ON public.forum_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Likes: Users can delete their own likes
DROP POLICY IF EXISTS "Users can delete own likes" ON public.forum_likes;
CREATE POLICY "Users can delete own likes" ON public.forum_likes
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- 7. FORUM SAVED (Bookmarks)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.forum_saved (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES public.forum_posts(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);

CREATE INDEX IF NOT EXISTS idx_forum_saved_user ON public.forum_saved(user_id);
CREATE INDEX IF NOT EXISTS idx_forum_saved_post ON public.forum_saved(post_id);

-- Enable RLS
ALTER TABLE public.forum_saved ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view saves" ON public.forum_saved;
CREATE POLICY "Anyone can view saves" ON public.forum_saved
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can save posts" ON public.forum_saved;
CREATE POLICY "Users can save posts" ON public.forum_saved
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can unsave posts" ON public.forum_saved;
CREATE POLICY "Users can unsave posts" ON public.forum_saved
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- 8. USER FOLLOWS (For Following feed)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_follows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

CREATE INDEX IF NOT EXISTS idx_user_follows_follower ON public.user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_following ON public.user_follows(following_id);

-- Enable RLS
ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view follows" ON public.user_follows;
CREATE POLICY "Anyone can view follows" ON public.user_follows
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can follow" ON public.user_follows;
CREATE POLICY "Users can follow" ON public.user_follows
  FOR INSERT WITH CHECK (auth.uid() = follower_id);

DROP POLICY IF EXISTS "Users can unfollow" ON public.user_follows;
CREATE POLICY "Users can unfollow" ON public.user_follows
  FOR DELETE USING (auth.uid() = follower_id);

-- =====================================================
-- 9. ADD FEED_TYPE TO POSTS (for category-based feeds)
-- =====================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'forum_posts' AND column_name = 'feed_type') THEN
    ALTER TABLE public.forum_posts ADD COLUMN feed_type VARCHAR(50) DEFAULT 'general';
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_forum_posts_feed ON public.forum_posts(feed_type);

-- =====================================================
-- DONE!
-- =====================================================
