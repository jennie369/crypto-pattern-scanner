-- =====================================================
-- FIX MISSING COLUMNS IN MULTIPLE TABLES
-- Date: 2025-12-11
-- Problem: Error 42703 "column does not exist" when creating post or searching users
-- Solution: Add missing columns to forum_posts and profiles tables
-- =====================================================

-- =====================================================
-- PART 1: FIX PROFILES TABLE - Add badge columns
-- =====================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'profiles'
      AND column_name = 'verified_seller'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN verified_seller BOOLEAN DEFAULT FALSE;
    RAISE NOTICE 'Added verified_seller column to profiles';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'profiles'
      AND column_name = 'verified_trader'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN verified_trader BOOLEAN DEFAULT FALSE;
    RAISE NOTICE 'Added verified_trader column to profiles';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'profiles'
      AND column_name = 'level_badge'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN level_badge TEXT DEFAULT 'bronze';
    RAISE NOTICE 'Added level_badge column to profiles';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'profiles'
      AND column_name = 'role_badge'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN role_badge TEXT;
    RAISE NOTICE 'Added role_badge column to profiles';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'profiles'
      AND column_name = 'achievement_badges'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN achievement_badges TEXT[] DEFAULT '{}';
    RAISE NOTICE 'Added achievement_badges column to profiles';
  END IF;
END $$;

-- =====================================================
-- PART 2: FIX FORUM_POSTS TABLE
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
  ELSE
    RAISE NOTICE 'visibility column already exists';
  END IF;
END $$;

-- Add sound_id column if not exists (requires sound_library table first)
DO $$
BEGIN
  -- First check if sound_library table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'sound_library') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'forum_posts'
        AND column_name = 'sound_id'
    ) THEN
      ALTER TABLE public.forum_posts ADD COLUMN sound_id UUID REFERENCES sound_library(id) ON DELETE SET NULL;
      RAISE NOTICE 'Added sound_id column to forum_posts';
    ELSE
      RAISE NOTICE 'sound_id column already exists';
    END IF;
  ELSE
    -- Create sound_library table first if it doesn't exist
    CREATE TABLE IF NOT EXISTS public.sound_library (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title TEXT NOT NULL,
      artist TEXT,
      audio_url TEXT NOT NULL,
      duration INTEGER, -- seconds
      cover_image TEXT,
      category TEXT DEFAULT 'general',
      play_count INTEGER DEFAULT 0,
      use_count INTEGER DEFAULT 0,
      is_featured BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Now add the column
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'forum_posts'
        AND column_name = 'sound_id'
    ) THEN
      ALTER TABLE public.forum_posts ADD COLUMN sound_id UUID REFERENCES sound_library(id) ON DELETE SET NULL;
      RAISE NOTICE 'Created sound_library table and added sound_id column to forum_posts';
    END IF;
  END IF;
END $$;

-- Add hashtags column if not exists (JSONB array)
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
  ELSE
    RAISE NOTICE 'hashtags column already exists';
  END IF;
END $$;

-- Add media_urls column if not exists (JSONB array for multiple images)
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
  ELSE
    RAISE NOTICE 'media_urls column already exists';
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
  ELSE
    RAISE NOTICE 'feed_type column already exists';
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
  ELSE
    RAISE NOTICE 'status column already exists';
  END IF;
END $$;

-- =====================================================
-- VERIFY: Show all columns in forum_posts
-- =====================================================
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'forum_posts'
ORDER BY ordinal_position;
