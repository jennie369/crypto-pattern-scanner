-- GEM Platform - Custom Feeds Tables Migration
-- Created: November 23, 2025
-- For: Threads-style custom feed functionality

-- =====================================================
-- 1. CUSTOM FEEDS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.custom_feeds (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_custom_feeds_user ON public.custom_feeds(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_feeds_public ON public.custom_feeds(is_public) WHERE is_public = TRUE;

-- =====================================================
-- 2. CUSTOM FEED TOPICS (Many-to-Many)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.custom_feed_topics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  feed_id UUID NOT NULL REFERENCES public.custom_feeds(id) ON DELETE CASCADE,
  topic VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(feed_id, topic)
);

CREATE INDEX IF NOT EXISTS idx_custom_feed_topics_feed ON public.custom_feed_topics(feed_id);

-- =====================================================
-- 3. CUSTOM FEED PROFILES (Many-to-Many)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.custom_feed_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  feed_id UUID NOT NULL REFERENCES public.custom_feeds(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(feed_id, profile_id)
);

CREATE INDEX IF NOT EXISTS idx_custom_feed_profiles_feed ON public.custom_feed_profiles(feed_id);
CREATE INDEX IF NOT EXISTS idx_custom_feed_profiles_profile ON public.custom_feed_profiles(profile_id);

-- =====================================================
-- 4. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS
ALTER TABLE public.custom_feeds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_feed_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_feed_profiles ENABLE ROW LEVEL SECURITY;

-- Custom Feeds Policies
DROP POLICY IF EXISTS "Users can view own feeds" ON public.custom_feeds;
CREATE POLICY "Users can view own feeds" ON public.custom_feeds
  FOR SELECT USING (auth.uid() = user_id OR is_public = TRUE);

DROP POLICY IF EXISTS "Users can create own feeds" ON public.custom_feeds;
CREATE POLICY "Users can create own feeds" ON public.custom_feeds
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own feeds" ON public.custom_feeds;
CREATE POLICY "Users can update own feeds" ON public.custom_feeds
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own feeds" ON public.custom_feeds;
CREATE POLICY "Users can delete own feeds" ON public.custom_feeds
  FOR DELETE USING (auth.uid() = user_id);

-- Custom Feed Topics Policies
DROP POLICY IF EXISTS "Users can view feed topics" ON public.custom_feed_topics;
CREATE POLICY "Users can view feed topics" ON public.custom_feed_topics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.custom_feeds
      WHERE id = feed_id AND (user_id = auth.uid() OR is_public = TRUE)
    )
  );

DROP POLICY IF EXISTS "Users can manage own feed topics" ON public.custom_feed_topics;
CREATE POLICY "Users can manage own feed topics" ON public.custom_feed_topics
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.custom_feeds
      WHERE id = feed_id AND user_id = auth.uid()
    )
  );

-- Custom Feed Profiles Policies
DROP POLICY IF EXISTS "Users can view feed profiles" ON public.custom_feed_profiles;
CREATE POLICY "Users can view feed profiles" ON public.custom_feed_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.custom_feeds
      WHERE id = feed_id AND (user_id = auth.uid() OR is_public = TRUE)
    )
  );

DROP POLICY IF EXISTS "Users can manage own feed profiles" ON public.custom_feed_profiles;
CREATE POLICY "Users can manage own feed profiles" ON public.custom_feed_profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.custom_feeds
      WHERE id = feed_id AND user_id = auth.uid()
    )
  );

-- =====================================================
-- 5. TRIGGER FOR UPDATED_AT
-- =====================================================
CREATE OR REPLACE FUNCTION update_custom_feeds_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_custom_feeds_updated_at ON public.custom_feeds;
CREATE TRIGGER trigger_custom_feeds_updated_at
  BEFORE UPDATE ON public.custom_feeds
  FOR EACH ROW EXECUTE FUNCTION update_custom_feeds_updated_at();

-- =====================================================
-- DONE!
-- =====================================================
