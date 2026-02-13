-- =====================================================
-- FIX: course_lesson_images.lesson_id type mismatch
-- Change from UUID to TEXT to match course_lessons.id
-- Date: 2024-12-24
-- =====================================================

-- Step 1: Drop the foreign key constraint first
ALTER TABLE course_lesson_images
  DROP CONSTRAINT IF EXISTS course_lesson_images_lesson_id_fkey;

-- Step 2: Drop the unique constraint that includes lesson_id
ALTER TABLE course_lesson_images
  DROP CONSTRAINT IF EXISTS unique_lesson_position;

-- Step 3: Alter the column type from UUID to TEXT
ALTER TABLE course_lesson_images
  ALTER COLUMN lesson_id TYPE TEXT USING lesson_id::TEXT;

-- Step 4: Re-add the foreign key constraint
ALTER TABLE course_lesson_images
  ADD CONSTRAINT course_lesson_images_lesson_id_fkey
  FOREIGN KEY (lesson_id) REFERENCES course_lessons(id) ON DELETE CASCADE;

-- Step 5: Re-add the unique constraint
ALTER TABLE course_lesson_images
  ADD CONSTRAINT unique_lesson_position UNIQUE(lesson_id, position_id);

-- Step 6: Recreate the index
DROP INDEX IF EXISTS idx_lesson_images_lesson;
CREATE INDEX idx_lesson_images_lesson ON course_lesson_images(lesson_id);

-- Log completion
DO $$
BEGIN
  RAISE NOTICE '===========================================';
  RAISE NOTICE 'Migration 20251224_013 completed';
  RAISE NOTICE 'Fixed: course_lesson_images.lesson_id is now TEXT';
  RAISE NOTICE '===========================================';
END $$;
