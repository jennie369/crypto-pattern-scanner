-- Add html_content column to sponsor_banners table
-- This allows custom HTML content for banners

ALTER TABLE sponsor_banners
ADD COLUMN IF NOT EXISTS html_content TEXT;

-- Add comment for documentation
COMMENT ON COLUMN sponsor_banners.html_content IS 'Custom HTML content for banner rendering. If empty, uses default template from title/subtitle/colors.';
