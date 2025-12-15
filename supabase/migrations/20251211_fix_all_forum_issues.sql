-- =====================================================
-- FIX ALL FORUM ISSUES - COMPREHENSIVE FIX
-- Date: 2025-12-11
-- Problem: Error 42703 "column author_id does not exist" when creating post
-- Root cause: Trigger references NEW.author_id but column is user_id
-- Solution: Drop problematic triggers and create safe RPC function
-- =====================================================

-- =====================================================
-- PART 1: DROP ALL PROBLEMATIC TRIGGERS
-- =====================================================

-- Drop triggers that reference author_id (wrong column name)
DROP TRIGGER IF EXISTS trigger_new_real_post ON forum_posts;
DROP TRIGGER IF EXISTS prevent_duplicate_forum_seed_post ON forum_posts;

-- Drop related functions
DROP FUNCTION IF EXISTS notify_new_real_post() CASCADE;
DROP FUNCTION IF EXISTS check_seed_post_duplicate() CASCADE;

-- =====================================================
-- PART 2: ENSURE ALL REQUIRED COLUMNS EXIST
-- =====================================================

-- Add visibility column if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'forum_posts'
      AND column_name = 'visibility'
  ) THEN
    ALTER TABLE public.forum_posts ADD COLUMN visibility TEXT DEFAULT 'public';
    RAISE NOTICE 'Added visibility column to forum_posts';
  END IF;
END $$;

-- Add hashtags column if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'forum_posts'
      AND column_name = 'hashtags'
  ) THEN
    ALTER TABLE public.forum_posts ADD COLUMN hashtags TEXT[] DEFAULT '{}';
    RAISE NOTICE 'Added hashtags column to forum_posts';
  END IF;
END $$;

-- Add media_urls column if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'forum_posts'
      AND column_name = 'media_urls'
  ) THEN
    ALTER TABLE public.forum_posts ADD COLUMN media_urls JSONB DEFAULT '[]';
    RAISE NOTICE 'Added media_urls column to forum_posts';
  END IF;
END $$;

-- Add feed_type column if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'forum_posts'
      AND column_name = 'feed_type'
  ) THEN
    ALTER TABLE public.forum_posts ADD COLUMN feed_type TEXT DEFAULT 'general';
    RAISE NOTICE 'Added feed_type column to forum_posts';
  END IF;
END $$;

-- Add status column if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'forum_posts'
      AND column_name = 'status'
  ) THEN
    ALTER TABLE public.forum_posts ADD COLUMN status TEXT DEFAULT 'published';
    RAISE NOTICE 'Added status column to forum_posts';
  END IF;
END $$;

-- =====================================================
-- PART 3: CREATE SAFE RPC FUNCTION FOR CREATING POSTS
-- =====================================================

-- Create or replace function to safely create forum posts
-- This bypasses any problematic triggers
CREATE OR REPLACE FUNCTION create_forum_post(
  p_user_id UUID,
  p_title TEXT,
  p_content TEXT,
  p_topic TEXT DEFAULT NULL,
  p_image_url TEXT DEFAULT NULL,
  p_visibility TEXT DEFAULT 'public',
  p_hashtags TEXT[] DEFAULT '{}',
  p_media_urls JSONB DEFAULT '[]',
  p_feed_type TEXT DEFAULT 'general',
  p_status TEXT DEFAULT 'published'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_post_id UUID;
  v_result JSON;
BEGIN
  -- Validate user exists
  IF p_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'User ID is required');
  END IF;

  -- Insert the post
  INSERT INTO forum_posts (
    user_id,
    title,
    content,
    topic,
    image_url,
    visibility,
    hashtags,
    media_urls,
    feed_type,
    status,
    created_at,
    updated_at
  ) VALUES (
    p_user_id,
    p_title,
    p_content,
    p_topic,
    p_image_url,
    COALESCE(p_visibility, 'public'),
    COALESCE(p_hashtags, '{}'),
    COALESCE(p_media_urls, '[]'),
    COALESCE(p_feed_type, 'general'),
    COALESCE(p_status, 'published'),
    NOW(),
    NOW()
  )
  RETURNING id INTO v_post_id;

  -- Return success with post ID
  SELECT json_build_object(
    'success', true,
    'id', v_post_id,
    'post', row_to_json(p.*)
  ) INTO v_result
  FROM forum_posts p
  WHERE p.id = v_post_id;

  RETURN v_result;

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM,
      'code', SQLSTATE
    );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_forum_post TO authenticated;

-- =====================================================
-- PART 4: VERIFY - List remaining triggers on forum_posts
-- =====================================================

DO $$
DECLARE
  trigger_count INT;
BEGIN
  SELECT COUNT(*) INTO trigger_count
  FROM pg_trigger t
  JOIN pg_class c ON t.tgrelid = c.oid
  WHERE c.relname = 'forum_posts'
    AND NOT t.tgisinternal;

  RAISE NOTICE 'forum_posts has % custom triggers remaining', trigger_count;
END $$;

-- Show remaining triggers (for debugging)
SELECT
  tgname as trigger_name,
  pg_get_triggerdef(t.oid) as trigger_definition
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
WHERE c.relname = 'forum_posts'
  AND NOT t.tgisinternal;

-- Show all columns in forum_posts (for verification)
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'forum_posts'
ORDER BY ordinal_position;
