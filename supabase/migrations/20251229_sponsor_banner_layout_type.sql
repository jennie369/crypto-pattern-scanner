-- ============================================
-- Add layout_type column to sponsor_banners
-- Supports multiple banner layout styles:
-- - 'compact' (default): Small card-style banner with image on left
-- - 'post': Post-style banner that mimics a regular forum post
-- - 'featured': Premium hero-style banner with gradient overlay
-- ============================================

-- Add layout_type column
ALTER TABLE sponsor_banners
ADD COLUMN IF NOT EXISTS layout_type TEXT DEFAULT 'compact'
CHECK (layout_type IN ('compact', 'post', 'featured'));

-- Add comment for the new column
COMMENT ON COLUMN sponsor_banners.layout_type IS 'Banner display layout: compact (default), post (forum post style), featured (hero banner)';

-- Add sponsor_name and sponsor_avatar for post-style banners
ALTER TABLE sponsor_banners
ADD COLUMN IF NOT EXISTS sponsor_name TEXT,
ADD COLUMN IF NOT EXISTS sponsor_avatar TEXT;

-- Add comments for new columns
COMMENT ON COLUMN sponsor_banners.sponsor_name IS 'Display name for sponsor (used in post-style layout)';
COMMENT ON COLUMN sponsor_banners.sponsor_avatar IS 'Avatar URL for sponsor (used in post-style layout)';

-- Create index on layout_type for filtering
CREATE INDEX IF NOT EXISTS idx_sponsor_banners_layout_type ON sponsor_banners(layout_type);

-- Notify completion
DO $$
BEGIN
  RAISE NOTICE '✅ Added layout_type column to sponsor_banners table';
  RAISE NOTICE '   - Default value: compact';
  RAISE NOTICE '   - Allowed values: compact, post, featured';
  RAISE NOTICE '   - Also added sponsor_name and sponsor_avatar columns';
END $$;
