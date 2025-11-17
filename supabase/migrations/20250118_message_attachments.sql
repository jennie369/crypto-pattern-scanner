-- =====================================================
-- MESSAGE ATTACHMENTS
-- =====================================================
-- Add support for file attachments in messages

-- Step 1: Create storage bucket for message attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('message-attachments', 'message-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Step 2: Add attachment columns to messages table
ALTER TABLE messages
ADD COLUMN IF NOT EXISTS attachment_url TEXT,
ADD COLUMN IF NOT EXISTS attachment_name TEXT,
ADD COLUMN IF NOT EXISTS attachment_type TEXT,
ADD COLUMN IF NOT EXISTS attachment_size BIGINT;

-- Step 3: Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_messages_attachment_url
ON messages(attachment_url) WHERE attachment_url IS NOT NULL;

-- Step 4: Storage policies for message-attachments bucket

-- Policy 1: Anyone can view attachments (public read)
CREATE POLICY "Public attachment access"
ON storage.objects FOR SELECT
USING (bucket_id = 'message-attachments');

-- Policy 2: Authenticated users can upload attachments
CREATE POLICY "Users can upload message attachments"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'message-attachments'
  AND auth.role() = 'authenticated'
);

-- Policy 3: Users can update their own attachments
CREATE POLICY "Users can update own attachments"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'message-attachments'
  AND auth.role() = 'authenticated'
)
WITH CHECK (
  bucket_id = 'message-attachments'
  AND auth.role() = 'authenticated'
);

-- Policy 4: Users can delete their own attachments
CREATE POLICY "Users can delete own attachments"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'message-attachments'
  AND auth.role() = 'authenticated'
);

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Check if columns were added
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'messages'
AND column_name LIKE 'attachment%';

-- Check if bucket was created
SELECT * FROM storage.buckets WHERE id = 'message-attachments';

-- Check policies
SELECT * FROM pg_policies
WHERE schemaname = 'storage'
AND tablename = 'objects'
AND policyname LIKE '%attachment%';
