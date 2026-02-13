-- =============================================
-- UPDATE COURSE-IMAGES BUCKET SIZE LIMIT
-- Migration: 20251228_update_course_images_limit.sql
-- Increase from 5MB to 10MB
-- =============================================

-- Update bucket size limit to 10MB
UPDATE storage.buckets
SET file_size_limit = 10485760  -- 10MB in bytes
WHERE id = 'course-images';

-- Verify the update
DO $$
DECLARE
  new_limit BIGINT;
BEGIN
  SELECT file_size_limit INTO new_limit
  FROM storage.buckets
  WHERE id = 'course-images';

  RAISE NOTICE 'course-images bucket file_size_limit updated to: % bytes (% MB)',
    new_limit, new_limit / 1024 / 1024;
END $$;
