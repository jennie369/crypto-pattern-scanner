-- =====================================================
-- Vision Board - Add Cover Image Support for Goals
-- Created: January 25, 2026
-- Purpose: Allow users to add illustrative images to their goals
-- =====================================================

-- 1. Add cover_image column to vision_goals table
ALTER TABLE vision_goals
ADD COLUMN IF NOT EXISTS cover_image TEXT;

-- 2. Add comment for documentation
COMMENT ON COLUMN vision_goals.cover_image IS 'URL of the cover/inspiration image for the goal';

-- 3. Create index for faster lookups if needed
CREATE INDEX IF NOT EXISTS idx_vision_goals_cover_image ON vision_goals(cover_image) WHERE cover_image IS NOT NULL;

-- =====================================================
-- 4. Create Storage Bucket for Vision Board images
-- =====================================================

-- Create the vision-board bucket (public for easy access to images)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'vision-board',
  'vision-board',
  true,
  5242880, -- 5MB max file size
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- =====================================================
-- 5. Storage RLS Policies for vision-board bucket
-- =====================================================

-- Allow authenticated users to upload to their own folder
CREATE POLICY "Users can upload vision board images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'vision-board' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to update their own images
CREATE POLICY "Users can update their vision board images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'vision-board' AND
  (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'vision-board' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to delete their own images
CREATE POLICY "Users can delete their vision board images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'vision-board' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow anyone to view vision board images (public bucket)
CREATE POLICY "Anyone can view vision board images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'vision-board');

-- Note: Images will be stored in Supabase Storage bucket 'vision-board'
-- The URL format will be: {SUPABASE_URL}/storage/v1/object/public/vision-board/{user_id}/{goal_id}.jpg
