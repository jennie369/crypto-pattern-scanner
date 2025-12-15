-- =============================================
-- STORAGE BUCKETS SETUP
-- Migration: 20251202_storage_buckets.sql
-- Creates all required storage buckets and policies
-- =============================================

-- =============================================
-- 1. CREATE STORAGE BUCKETS
-- =============================================

-- Course Attachments Bucket (PDFs, docs, etc.)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'course-attachments',
  'course-attachments',
  true,
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
  public = true,
  file_size_limit = 52428800;

-- Course Images Bucket (thumbnails, etc.)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'course-images',
  'course-images',
  true,
  10485760, -- 10MB
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760;

-- User Avatars Bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  5242880, -- 5MB
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880;

-- Forum Attachments Bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'forum-attachments',
  'forum-attachments',
  true,
  20971520, -- 20MB
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'video/mp4',
    'application/pdf'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 20971520;

-- =============================================
-- 2. STORAGE POLICIES FOR course-attachments
-- =============================================

-- Drop existing policies if any
DROP POLICY IF EXISTS "course-attachments: Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "course-attachments: Anyone can read" ON storage.objects;
DROP POLICY IF EXISTS "course-attachments: Admins can delete" ON storage.objects;
DROP POLICY IF EXISTS "course-attachments: Owners can delete" ON storage.objects;

-- Allow authenticated users to upload to course-attachments
CREATE POLICY "course-attachments: Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'course-attachments');

-- Allow anyone to read (public bucket)
CREATE POLICY "course-attachments: Anyone can read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'course-attachments');

-- Allow admins to delete
CREATE POLICY "course-attachments: Admins can delete"
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

-- =============================================
-- 3. STORAGE POLICIES FOR course-images
-- =============================================

DROP POLICY IF EXISTS "course-images: Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "course-images: Anyone can read" ON storage.objects;
DROP POLICY IF EXISTS "course-images: Admins can delete" ON storage.objects;

CREATE POLICY "course-images: Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'course-images');

CREATE POLICY "course-images: Anyone can read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'course-images');

CREATE POLICY "course-images: Admins can delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'course-images'
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND (role = 'admin' OR role = 'ADMIN' OR is_admin = true)
  )
);

-- =============================================
-- 4. STORAGE POLICIES FOR avatars
-- =============================================

DROP POLICY IF EXISTS "avatars: Users can upload own avatar" ON storage.objects;
DROP POLICY IF EXISTS "avatars: Anyone can read" ON storage.objects;
DROP POLICY IF EXISTS "avatars: Users can delete own avatar" ON storage.objects;

-- Users can upload their own avatar (path must match user id)
CREATE POLICY "avatars: Users can upload own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "avatars: Anyone can read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- Users can delete their own avatar
CREATE POLICY "avatars: Users can delete own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- =============================================
-- 5. STORAGE POLICIES FOR forum-attachments
-- =============================================

DROP POLICY IF EXISTS "forum-attachments: Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "forum-attachments: Anyone can read" ON storage.objects;
DROP POLICY IF EXISTS "forum-attachments: Admins can delete" ON storage.objects;

CREATE POLICY "forum-attachments: Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'forum-attachments');

CREATE POLICY "forum-attachments: Anyone can read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'forum-attachments');

CREATE POLICY "forum-attachments: Admins can delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'forum-attachments'
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND (role = 'admin' OR role = 'ADMIN' OR is_admin = true)
  )
);

-- =============================================
-- DONE
-- =============================================
-- All storage buckets and policies have been created.
-- Buckets:
--   1. course-attachments (50MB, PDFs, docs, images, videos)
--   2. course-images (10MB, images only)
--   3. avatars (5MB, images only)
--   4. forum-attachments (20MB, images, videos, PDFs)
