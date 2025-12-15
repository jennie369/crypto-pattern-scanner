-- GEM Platform - Forum Images Storage Bucket
-- Create storage bucket for forum post images

-- Create the storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'forum-images',
  'forum-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for forum-images bucket
-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload forum images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'forum-images'
  AND auth.role() = 'authenticated'
);

-- Allow public read access
CREATE POLICY "Public can view forum images"
ON storage.objects FOR SELECT
USING (bucket_id = 'forum-images');

-- Allow users to delete their own images
CREATE POLICY "Users can delete own forum images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'forum-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
