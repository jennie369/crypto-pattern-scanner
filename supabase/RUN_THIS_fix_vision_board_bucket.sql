-- =====================================================
-- FIX Vision Board Storage Bucket
-- Run this if image upload to vision-board bucket fails
-- =====================================================

-- 1. Create bucket if not exists (or update settings)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'vision-board',
  'vision-board',
  true,
  10485760, -- 10MB max file size (increased for high-res images)
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

-- 2. Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can upload vision board images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their vision board images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their vision board images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view vision board images" ON storage.objects;
DROP POLICY IF EXISTS "vision_board_upload_policy" ON storage.objects;
DROP POLICY IF EXISTS "vision_board_update_policy" ON storage.objects;
DROP POLICY IF EXISTS "vision_board_delete_policy" ON storage.objects;
DROP POLICY IF EXISTS "vision_board_select_policy" ON storage.objects;

-- 3. Create new policies with unique names
-- Allow authenticated users to upload to their own folder
CREATE POLICY "vision_board_upload_policy"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'vision-board' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to update their own images
CREATE POLICY "vision_board_update_policy"
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
CREATE POLICY "vision_board_delete_policy"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'vision-board' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow anyone to view vision board images (public bucket)
CREATE POLICY "vision_board_select_policy"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'vision-board');

-- 4. Verify bucket exists
SELECT id, name, public, file_size_limit, allowed_mime_types
FROM storage.buckets
WHERE id = 'vision-board';

-- 5. Verify policies exist
SELECT policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'objects' AND schemaname = 'storage'
AND policyname LIKE 'vision_board%';
