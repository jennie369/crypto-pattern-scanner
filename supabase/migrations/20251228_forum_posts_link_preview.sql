-- ============================================
-- UPDATE FORUM_POSTS - Link Preview Support
-- Adds columns for storing link preview data inline
-- Created: 2025-12-28
-- ============================================

-- Add link_preview JSONB column to store preview data inline
-- This avoids an extra join when loading posts
ALTER TABLE public.forum_posts
ADD COLUMN IF NOT EXISTS link_preview JSONB;

-- Add extracted_urls array column to store all detected URLs in post content
ALTER TABLE public.forum_posts
ADD COLUMN IF NOT EXISTS extracted_urls TEXT[];

-- ============================================
-- INDEXES
-- ============================================

-- GIN index for JSONB queries on link_preview
CREATE INDEX IF NOT EXISTS idx_forum_posts_link_preview
  ON public.forum_posts USING GIN (link_preview);

-- GIN index for array contains queries on extracted_urls
CREATE INDEX IF NOT EXISTS idx_forum_posts_extracted_urls
  ON public.forum_posts USING GIN (extracted_urls);

-- Index for finding posts with link previews
CREATE INDEX IF NOT EXISTS idx_forum_posts_has_link_preview
  ON public.forum_posts ((link_preview IS NOT NULL))
  WHERE link_preview IS NOT NULL;

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to extract URLs from text content
CREATE OR REPLACE FUNCTION extract_urls_from_text(p_content TEXT)
RETURNS TEXT[] AS $$
DECLARE
  v_urls TEXT[];
  v_url TEXT;
  v_pattern TEXT := 'https?://[^\s<>"''()\[\]]+';
BEGIN
  -- Extract all URLs using regex
  SELECT ARRAY_AGG(m[1])
  INTO v_urls
  FROM regexp_matches(p_content, v_pattern, 'gi') AS m;

  -- Clean up URLs (remove trailing punctuation)
  IF v_urls IS NOT NULL THEN
    FOR i IN 1..array_length(v_urls, 1) LOOP
      v_urls[i] := regexp_replace(v_urls[i], '[.,;:!?\)\]]+$', '');
    END LOOP;
    -- Remove duplicates
    SELECT ARRAY_AGG(DISTINCT url) INTO v_urls FROM unnest(v_urls) AS url;
  END IF;

  RETURN COALESCE(v_urls, ARRAY[]::TEXT[]);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to update post with link preview data
CREATE OR REPLACE FUNCTION update_post_link_preview(
  p_post_id UUID,
  p_link_preview JSONB,
  p_extracted_urls TEXT[] DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.forum_posts
  SET
    link_preview = p_link_preview,
    extracted_urls = COALESCE(p_extracted_urls, extracted_urls),
    updated_at = NOW()
  WHERE id = p_post_id;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger function to auto-extract URLs on post insert/update
CREATE OR REPLACE FUNCTION auto_extract_post_urls()
RETURNS TRIGGER AS $$
BEGIN
  -- Only process if content changed or is new
  IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.content IS DISTINCT FROM NEW.content) THEN
    NEW.extracted_urls := extract_urls_from_text(COALESCE(NEW.content, ''));
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto URL extraction
DROP TRIGGER IF EXISTS trigger_extract_post_urls ON public.forum_posts;
CREATE TRIGGER trigger_extract_post_urls
  BEFORE INSERT OR UPDATE OF content ON public.forum_posts
  FOR EACH ROW
  EXECUTE FUNCTION auto_extract_post_urls();

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON COLUMN public.forum_posts.link_preview IS
  'JSONB containing link preview data for the first URL in post. Structure: {url, domain, title, description, image_url, site_name, favicon_url, og_type, is_video}';

COMMENT ON COLUMN public.forum_posts.extracted_urls IS
  'Array containing all URLs detected in post content. Auto-populated by trigger.';

COMMENT ON FUNCTION extract_urls_from_text(TEXT) IS
  'Extracts all HTTP/HTTPS URLs from text content';

COMMENT ON FUNCTION update_post_link_preview(UUID, JSONB, TEXT[]) IS
  'Updates a post with link preview data';

COMMENT ON FUNCTION auto_extract_post_urls() IS
  'Trigger function to auto-extract URLs when post content changes';
