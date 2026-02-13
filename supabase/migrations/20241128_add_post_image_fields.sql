-- GEM Platform - Post Image Fields Migration
-- Created: November 28, 2024
-- Feature: Instagram-style post image system

-- =====================================================
-- ADD IMAGE METADATA COLUMNS TO forum_posts
-- =====================================================

-- Image dimensions
ALTER TABLE public.forum_posts ADD COLUMN IF NOT EXISTS image_width INTEGER;
ALTER TABLE public.forum_posts ADD COLUMN IF NOT EXISTS image_height INTEGER;

-- Aspect ratio as decimal (e.g., 0.8 for 4:5, 1.0 for 1:1)
ALTER TABLE public.forum_posts ADD COLUMN IF NOT EXISTS image_ratio DECIMAL(4,2);

-- BlurHash string for placeholder effect
ALTER TABLE public.forum_posts ADD COLUMN IF NOT EXISTS image_blurhash TEXT;

-- Thumbnail URLs for different sizes
ALTER TABLE public.forum_posts ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;  -- Grid 3:4 crop
ALTER TABLE public.forum_posts ADD COLUMN IF NOT EXISTS medium_url TEXT;     -- Medium size (720px)
ALTER TABLE public.forum_posts ADD COLUMN IF NOT EXISTS placeholder_url TEXT; -- Tiny blur-up (50px)

-- File metadata
ALTER TABLE public.forum_posts ADD COLUMN IF NOT EXISTS image_size BIGINT;  -- File size in bytes
ALTER TABLE public.forum_posts ADD COLUMN IF NOT EXISTS image_format TEXT;  -- jpeg, png, webp

-- Support for multiple images (media_urls array)
ALTER TABLE public.forum_posts ADD COLUMN IF NOT EXISTS media_urls JSONB DEFAULT '[]'::jsonb;

-- =====================================================
-- CREATE INDEX FOR IMAGE QUERIES
-- =====================================================

-- Index for posts with images (faster filtering)
CREATE INDEX IF NOT EXISTS idx_forum_posts_has_image
  ON public.forum_posts(image_url)
  WHERE image_url IS NOT NULL;

-- =====================================================
-- ADD COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON COLUMN public.forum_posts.image_ratio IS 'Aspect ratio as decimal (height/width). E.g., 0.8 for 4:5, 1.25 for 4:5 inverted';
COMMENT ON COLUMN public.forum_posts.image_blurhash IS 'BlurHash string for generating placeholder while loading';
COMMENT ON COLUMN public.forum_posts.thumbnail_url IS 'Grid thumbnail (3:4 ratio) for profile grid view';
COMMENT ON COLUMN public.forum_posts.medium_url IS 'Medium resolution (720px width) for list views';
COMMENT ON COLUMN public.forum_posts.placeholder_url IS 'Tiny placeholder (50px) for blur-up effect';
COMMENT ON COLUMN public.forum_posts.media_urls IS 'Array of image objects for multi-image posts [{url, width, height, ratio}]';

-- =====================================================
-- DONE!
-- =====================================================
