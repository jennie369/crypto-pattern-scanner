-- =====================================================
-- CREATE STORAGE BUCKETS FOR IMAGES
-- =====================================================

-- Create event-covers bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('event-covers', 'event-covers', true)
ON CONFLICT (id) DO NOTHING;

-- Create avatars bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Create message-attachments bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('message-attachments', 'message-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- STORAGE POLICIES - EVENT COVERS
-- =====================================================

-- Allow anyone to view event covers
CREATE POLICY "Public can view event covers"
ON storage.objects FOR SELECT
USING (bucket_id = 'event-covers');

-- Allow authenticated users to upload event covers
CREATE POLICY "Authenticated users can upload event covers"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'event-covers'
  AND auth.role() = 'authenticated'
);

-- Allow users to update their own event covers
CREATE POLICY "Users can update their event covers"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'event-covers'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own event covers
CREATE POLICY "Users can delete their event covers"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'event-covers'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- =====================================================
-- STORAGE POLICIES - AVATARS
-- =====================================================

-- Allow anyone to view avatars
CREATE POLICY "Public can view avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Allow authenticated users to upload avatars
CREATE POLICY "Authenticated users can upload avatars"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars'
  AND auth.role() = 'authenticated'
);

-- Allow users to update their own avatars
CREATE POLICY "Users can update their avatars"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own avatars
CREATE POLICY "Users can delete their avatars"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- =====================================================
-- STORAGE POLICIES - MESSAGE ATTACHMENTS
-- =====================================================

-- Allow conversation participants to view attachments
CREATE POLICY "Conversation participants can view attachments"
ON storage.objects FOR SELECT
USING (bucket_id = 'message-attachments');

-- Allow authenticated users to upload attachments
CREATE POLICY "Authenticated users can upload attachments"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'message-attachments'
  AND auth.role() = 'authenticated'
);

-- =====================================================
-- VERIFY SETUP
-- =====================================================

-- Check buckets
SELECT * FROM storage.buckets
WHERE id IN ('event-covers', 'avatars', 'message-attachments');

-- Check policies
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE tablename = 'objects'
AND policyname LIKE '%event%' OR policyname LIKE '%avatar%' OR policyname LIKE '%attachment%'
ORDER BY policyname;
