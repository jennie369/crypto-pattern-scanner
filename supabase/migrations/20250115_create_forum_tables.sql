-- ========================================
-- COMMUNITY FORUM TABLES
-- Day 32: Forum Backend & Data Structure
-- ========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Forum Threads Table
CREATE TABLE IF NOT EXISTS public.forum_threads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL CHECK (char_length(title) > 0 AND char_length(title) <= 300),
  content TEXT NOT NULL CHECK (char_length(content) > 0),
  category TEXT NOT NULL,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tags TEXT[] DEFAULT '{}',

  -- Status
  is_answered BOOLEAN DEFAULT FALSE,
  accepted_reply_id UUID,
  is_pinned BOOLEAN DEFAULT FALSE,
  is_locked BOOLEAN DEFAULT FALSE,

  -- Counters
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  reply_count INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Forum Replies Table
CREATE TABLE IF NOT EXISTS public.forum_replies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  thread_id UUID NOT NULL REFERENCES public.forum_threads(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.forum_replies(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (char_length(content) > 0),
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Counters
  like_count INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Forum Thread Likes Table
CREATE TABLE IF NOT EXISTS public.forum_thread_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  thread_id UUID NOT NULL REFERENCES public.forum_threads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(thread_id, user_id)
);

-- Forum Reply Likes Table
CREATE TABLE IF NOT EXISTS public.forum_reply_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reply_id UUID NOT NULL REFERENCES public.forum_replies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(reply_id, user_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_forum_threads_author ON public.forum_threads(author_id);
CREATE INDEX IF NOT EXISTS idx_forum_threads_category ON public.forum_threads(category);
CREATE INDEX IF NOT EXISTS idx_forum_threads_created_at ON public.forum_threads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_forum_threads_updated_at ON public.forum_threads(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_forum_threads_view_count ON public.forum_threads(view_count DESC);

CREATE INDEX IF NOT EXISTS idx_forum_replies_thread ON public.forum_replies(thread_id);
CREATE INDEX IF NOT EXISTS idx_forum_replies_author ON public.forum_replies(author_id);
CREATE INDEX IF NOT EXISTS idx_forum_replies_parent ON public.forum_replies(parent_id);
CREATE INDEX IF NOT EXISTS idx_forum_replies_created_at ON public.forum_replies(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_forum_thread_likes_thread ON public.forum_thread_likes(thread_id);
CREATE INDEX IF NOT EXISTS idx_forum_thread_likes_user ON public.forum_thread_likes(user_id);

CREATE INDEX IF NOT EXISTS idx_forum_reply_likes_reply ON public.forum_reply_likes(reply_id);
CREATE INDEX IF NOT EXISTS idx_forum_reply_likes_user ON public.forum_reply_likes(user_id);

-- Enable Row Level Security
ALTER TABLE public.forum_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_thread_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_reply_likes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for forum_threads
CREATE POLICY "Anyone can view threads"
  ON public.forum_threads
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create threads"
  ON public.forum_threads
  FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update own threads"
  ON public.forum_threads
  FOR UPDATE
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can delete own threads"
  ON public.forum_threads
  FOR DELETE
  USING (auth.uid() = author_id);

-- RLS Policies for forum_replies
CREATE POLICY "Anyone can view replies"
  ON public.forum_replies
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create replies"
  ON public.forum_replies
  FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update own replies"
  ON public.forum_replies
  FOR UPDATE
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can delete own replies"
  ON public.forum_replies
  FOR DELETE
  USING (auth.uid() = author_id);

-- RLS Policies for likes
CREATE POLICY "Anyone can view thread likes"
  ON public.forum_thread_likes
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can like threads"
  ON public.forum_thread_likes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike threads"
  ON public.forum_thread_likes
  FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view reply likes"
  ON public.forum_reply_likes
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can like replies"
  ON public.forum_reply_likes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike replies"
  ON public.forum_reply_likes
  FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger functions for updated_at
CREATE OR REPLACE FUNCTION public.handle_forum_thread_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.handle_forum_reply_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER set_forum_thread_updated_at
  BEFORE UPDATE ON public.forum_threads
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_forum_thread_updated_at();

CREATE TRIGGER set_forum_reply_updated_at
  BEFORE UPDATE ON public.forum_replies
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_forum_reply_updated_at();

-- Function to update thread's updated_at when reply is added
CREATE OR REPLACE FUNCTION public.update_thread_on_reply()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.forum_threads
  SET
    updated_at = NOW(),
    reply_count = reply_count + 1
  WHERE id = NEW.thread_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_thread_on_reply
  AFTER INSERT ON public.forum_replies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_thread_on_reply();

-- Function to update like counts
CREATE OR REPLACE FUNCTION public.update_thread_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.forum_threads
    SET like_count = like_count + 1
    WHERE id = NEW.thread_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.forum_threads
    SET like_count = like_count - 1
    WHERE id = OLD.thread_id;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_thread_like_count
  AFTER INSERT OR DELETE ON public.forum_thread_likes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_thread_like_count();

CREATE OR REPLACE FUNCTION public.update_reply_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.forum_replies
    SET like_count = like_count + 1
    WHERE id = NEW.reply_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.forum_replies
    SET like_count = like_count - 1
    WHERE id = OLD.reply_id;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_reply_like_count
  AFTER INSERT OR DELETE ON public.forum_reply_likes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_reply_like_count();

-- Grant permissions
GRANT ALL ON public.forum_threads TO authenticated;
GRANT ALL ON public.forum_replies TO authenticated;
GRANT ALL ON public.forum_thread_likes TO authenticated;
GRANT ALL ON public.forum_reply_likes TO authenticated;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Forum tables created successfully!';
  RAISE NOTICE '📋 Tables: forum_threads, forum_replies, forum_thread_likes, forum_reply_likes';
  RAISE NOTICE '🔐 RLS policies enabled';
  RAISE NOTICE '⚡ Auto-increment triggers created for counters';
END $$;
