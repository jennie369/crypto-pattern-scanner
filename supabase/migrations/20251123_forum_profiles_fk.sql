-- GEM Platform - Fix Forum Tables FK to Profiles
-- This adds foreign key constraints from forum tables to profiles
-- Required for Supabase PostgREST joins like: author:profiles(...)

-- =====================================================
-- ADD FK FROM forum_posts.user_id TO profiles.id
-- =====================================================

-- First, ensure profiles table exists and has data for all forum users
-- (profiles.id should match auth.users.id)

-- Add FK constraint for forum_posts -> profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'forum_posts_user_id_profiles_fkey'
    AND table_name = 'forum_posts'
  ) THEN
    ALTER TABLE public.forum_posts
    ADD CONSTRAINT forum_posts_user_id_profiles_fkey
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add FK constraint for forum_comments -> profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'forum_comments_user_id_profiles_fkey'
    AND table_name = 'forum_comments'
  ) THEN
    ALTER TABLE public.forum_comments
    ADD CONSTRAINT forum_comments_user_id_profiles_fkey
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- =====================================================
-- DONE! Now Supabase queries can use:
-- author:profiles(id, email, full_name, avatar_url)
-- =====================================================
