-- ============================================
-- LINK PREVIEWS TABLE
-- Server-side caching for URL metadata
-- Created: 2025-12-28
-- ============================================

-- Create link_previews table
CREATE TABLE IF NOT EXISTS public.link_previews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- URL information
  url TEXT NOT NULL,
  original_url TEXT,
  domain TEXT NOT NULL,

  -- Open Graph metadata
  title TEXT,
  description TEXT,
  image_url TEXT,
  image_width INTEGER,
  image_height INTEGER,

  -- Site information
  site_name TEXT,
  favicon_url TEXT,
  locale TEXT DEFAULT 'vi_VN',

  -- Content type
  og_type TEXT DEFAULT 'website',
  content_type TEXT,

  -- Video support (for YouTube, Vimeo, etc.)
  video_url TEXT,
  video_secure_url TEXT,
  video_type TEXT,
  video_width INTEGER,
  video_height INTEGER,
  is_video BOOLEAN DEFAULT FALSE,

  -- Twitter Cards metadata
  twitter_card TEXT,
  twitter_title TEXT,
  twitter_description TEXT,
  twitter_image TEXT,

  -- Status & error handling
  status TEXT DEFAULT 'success',
  error_message TEXT,

  -- Cache management
  fetched_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
  fetch_count INTEGER DEFAULT 1,
  last_accessed_at TIMESTAMPTZ DEFAULT NOW(),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Unique constraint on URL
  CONSTRAINT link_previews_unique_url UNIQUE(url)
);

-- ============================================
-- INDEXES
-- ============================================

-- Primary lookup by URL
CREATE INDEX IF NOT EXISTS idx_link_previews_url
  ON public.link_previews(url);

-- Filter by domain for analytics
CREATE INDEX IF NOT EXISTS idx_link_previews_domain
  ON public.link_previews(domain);

-- Cache expiration queries
CREATE INDEX IF NOT EXISTS idx_link_previews_expires_at
  ON public.link_previews(expires_at);

-- Status filtering
CREATE INDEX IF NOT EXISTS idx_link_previews_status
  ON public.link_previews(status);

-- Recent previews
CREATE INDEX IF NOT EXISTS idx_link_previews_created_at
  ON public.link_previews(created_at DESC);

-- Last accessed for cache cleanup
CREATE INDEX IF NOT EXISTS idx_link_previews_last_accessed
  ON public.link_previews(last_accessed_at);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.link_previews ENABLE ROW LEVEL SECURITY;

-- Anyone can view link previews (public cache)
CREATE POLICY "Anyone can view link previews"
  ON public.link_previews
  FOR SELECT
  USING (true);

-- Service role can insert new link previews
CREATE POLICY "Service role can insert link previews"
  ON public.link_previews
  FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- Service role can update link previews
CREATE POLICY "Service role can update link previews"
  ON public.link_previews
  FOR UPDATE
  USING (auth.role() = 'service_role');

-- Service role can delete expired link previews
CREATE POLICY "Service role can delete link previews"
  ON public.link_previews
  FOR DELETE
  USING (auth.role() = 'service_role');

-- ============================================
-- TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_link_preview_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for auto-updating updated_at
DROP TRIGGER IF EXISTS trigger_link_preview_updated_at ON public.link_previews;
CREATE TRIGGER trigger_link_preview_updated_at
  BEFORE UPDATE ON public.link_previews
  FOR EACH ROW
  EXECUTE FUNCTION update_link_preview_timestamp();

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to cleanup expired link previews
CREATE OR REPLACE FUNCTION cleanup_expired_link_previews()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.link_previews
  WHERE expires_at < NOW() - INTERVAL '1 day'
  AND status != 'error';

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get or create link preview (used by edge function)
CREATE OR REPLACE FUNCTION get_cached_link_preview(p_url TEXT)
RETURNS TABLE (
  id UUID,
  url TEXT,
  domain TEXT,
  title TEXT,
  description TEXT,
  image_url TEXT,
  site_name TEXT,
  favicon_url TEXT,
  og_type TEXT,
  is_video BOOLEAN,
  status TEXT,
  cached BOOLEAN,
  expires_at TIMESTAMPTZ
) AS $$
BEGIN
  -- Check if valid cached version exists
  RETURN QUERY
  SELECT
    lp.id,
    lp.url,
    lp.domain,
    lp.title,
    lp.description,
    lp.image_url,
    lp.site_name,
    lp.favicon_url,
    lp.og_type,
    lp.is_video,
    lp.status,
    TRUE as cached,
    lp.expires_at
  FROM public.link_previews lp
  WHERE lp.url = p_url
  AND lp.expires_at > NOW()
  LIMIT 1;

  -- Update last_accessed_at if found
  IF FOUND THEN
    UPDATE public.link_previews
    SET last_accessed_at = NOW(),
        fetch_count = fetch_count + 1
    WHERE link_previews.url = p_url;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to upsert link preview
CREATE OR REPLACE FUNCTION upsert_link_preview(
  p_url TEXT,
  p_domain TEXT,
  p_title TEXT DEFAULT NULL,
  p_description TEXT DEFAULT NULL,
  p_image_url TEXT DEFAULT NULL,
  p_site_name TEXT DEFAULT NULL,
  p_favicon_url TEXT DEFAULT NULL,
  p_og_type TEXT DEFAULT 'website',
  p_is_video BOOLEAN DEFAULT FALSE,
  p_video_url TEXT DEFAULT NULL,
  p_twitter_card TEXT DEFAULT NULL,
  p_twitter_image TEXT DEFAULT NULL,
  p_status TEXT DEFAULT 'success',
  p_error_message TEXT DEFAULT NULL,
  p_content_type TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO public.link_previews (
    url, domain, title, description, image_url,
    site_name, favicon_url, og_type, is_video,
    video_url, twitter_card, twitter_image,
    status, error_message, content_type,
    fetched_at, expires_at, last_accessed_at
  )
  VALUES (
    p_url, p_domain, p_title, p_description, p_image_url,
    p_site_name, p_favicon_url, p_og_type, p_is_video,
    p_video_url, p_twitter_card, p_twitter_image,
    p_status, p_error_message, p_content_type,
    NOW(), NOW() + INTERVAL '7 days', NOW()
  )
  ON CONFLICT (url) DO UPDATE SET
    domain = EXCLUDED.domain,
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    image_url = EXCLUDED.image_url,
    site_name = EXCLUDED.site_name,
    favicon_url = EXCLUDED.favicon_url,
    og_type = EXCLUDED.og_type,
    is_video = EXCLUDED.is_video,
    video_url = EXCLUDED.video_url,
    twitter_card = EXCLUDED.twitter_card,
    twitter_image = EXCLUDED.twitter_image,
    status = EXCLUDED.status,
    error_message = EXCLUDED.error_message,
    content_type = EXCLUDED.content_type,
    fetched_at = NOW(),
    expires_at = NOW() + INTERVAL '7 days',
    fetch_count = link_previews.fetch_count + 1,
    updated_at = NOW()
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE public.link_previews IS 'Server-side cache for URL Open Graph metadata';
COMMENT ON COLUMN public.link_previews.url IS 'Normalized URL (canonical)';
COMMENT ON COLUMN public.link_previews.original_url IS 'Original URL before normalization';
COMMENT ON COLUMN public.link_previews.status IS 'Fetch status: success, error, timeout, no_og, blocked';
COMMENT ON COLUMN public.link_previews.expires_at IS 'Cache expiration (default 7 days)';
COMMENT ON COLUMN public.link_previews.fetch_count IS 'Number of times this preview was requested';
COMMENT ON FUNCTION cleanup_expired_link_previews() IS 'Deletes expired link previews older than 1 day';
COMMENT ON FUNCTION get_cached_link_preview(TEXT) IS 'Get cached preview and update access stats';
COMMENT ON FUNCTION upsert_link_preview(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, BOOLEAN, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) IS 'Insert or update link preview';
