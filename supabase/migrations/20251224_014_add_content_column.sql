-- =====================================================
-- Add 'content' column to course_lessons for mobile compatibility
-- Mobile app checks: lesson.content || lesson.html_content || lesson.article_content
-- Date: 2024-12-24
-- =====================================================

-- Add content column if not exists
ALTER TABLE course_lessons
  ADD COLUMN IF NOT EXISTS content TEXT;

-- Copy existing html_content to content for existing lessons
UPDATE course_lessons
SET content = html_content
WHERE html_content IS NOT NULL AND content IS NULL;

-- Add comment
COMMENT ON COLUMN course_lessons.content IS 'HTML content for article lessons. Primary content column for mobile app.';

-- Log completion
DO $$
BEGIN
  RAISE NOTICE '=========================================';
  RAISE NOTICE 'Migration 20251224_014 completed';
  RAISE NOTICE 'Added: course_lessons.content column';
  RAISE NOTICE '=========================================';
END $$;
