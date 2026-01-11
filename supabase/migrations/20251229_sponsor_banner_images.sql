-- Migration: Add images column to sponsor_banners table
-- Date: 2024-12-29
-- Description: Support multiple images for Post Style sponsor banners

-- Add images column as JSONB array
ALTER TABLE sponsor_banners
ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb;

-- Add comment
COMMENT ON COLUMN sponsor_banners.images IS 'Array of image URLs for Post Style banners (multiple images carousel)';

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_sponsor_banners_images
ON sponsor_banners USING GIN (images);
