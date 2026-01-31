-- =============================================
-- Add link_url column to section_banners table
-- Run this in Supabase SQL Editor
-- =============================================

-- Add link_url column if it doesn't exist
ALTER TABLE section_banners
ADD COLUMN IF NOT EXISTS link_url TEXT;

-- Add comment to explain the column
COMMENT ON COLUMN section_banners.link_url IS 'URL to open in WebView when banner is tapped';

-- Verify the column was added
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'section_banners'
AND column_name = 'link_url';
