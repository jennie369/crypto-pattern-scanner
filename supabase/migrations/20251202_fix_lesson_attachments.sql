-- =============================================
-- FIX LESSON ATTACHMENTS TABLE
-- Migration: 20251202_fix_lesson_attachments.sql
-- Adds missing columns for attachment service
-- =============================================

-- Add missing columns
ALTER TABLE lesson_attachments ADD COLUMN IF NOT EXISTS file_size INT;
ALTER TABLE lesson_attachments ADD COLUMN IF NOT EXISTS storage_path TEXT;
ALTER TABLE lesson_attachments ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);
ALTER TABLE lesson_attachments ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Rename file_size_bytes to file_size if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'lesson_attachments' AND column_name = 'file_size_bytes'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'lesson_attachments' AND column_name = 'file_size'
  ) THEN
    ALTER TABLE lesson_attachments RENAME COLUMN file_size_bytes TO file_size;
  END IF;
END $$;

-- Make course_id optional (it can be derived from lesson_id)
ALTER TABLE lesson_attachments ALTER COLUMN course_id DROP NOT NULL;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_lesson_attachments_storage_path ON lesson_attachments(storage_path);

-- =============================================
-- STORAGE BUCKET SETUP
-- =============================================

-- Create storage bucket if not exists (run via Supabase Dashboard or SQL)
-- Note: This needs to be run from Supabase dashboard as storage management
-- requires special permissions

/*
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'course-attachments',
  'course-attachments',
  true,  -- Public for easier download
  52428800, -- 50MB
  ARRAY[
    'application/pdf',
    'application/zip',
    'application/x-zip-compressed',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'video/mp4',
    'audio/mpeg',
    'audio/wav',
    'text/plain'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = 52428800,
  public = true;
*/

-- =============================================
-- STORAGE POLICIES
-- =============================================

-- Note: Run these in Supabase Dashboard > Storage > Policies

/*
-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload attachments"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'course-attachments');

-- Allow authenticated users to read
CREATE POLICY "Authenticated users can read attachments"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'course-attachments');

-- Allow admins to delete
CREATE POLICY "Admins can delete attachments"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'course-attachments'
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND (role = 'admin' OR role = 'ADMIN' OR is_admin = true)
  )
);
*/

-- =============================================
-- UPDATE RLS FOR lesson_attachments
-- =============================================

-- Drop and recreate policies for better permissions
DROP POLICY IF EXISTS "Enrolled users view attachments" ON lesson_attachments;
DROP POLICY IF EXISTS "Admin manages attachments" ON lesson_attachments;

-- Allow all authenticated users to view (lessons will check enrollment)
CREATE POLICY "Authenticated users can view attachments"
  ON lesson_attachments FOR SELECT
  TO authenticated
  USING (true);

-- Allow admins full access
CREATE POLICY "Admin full access to attachments"
  ON lesson_attachments FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'ADMIN' OR is_admin = true)
    )
  );
