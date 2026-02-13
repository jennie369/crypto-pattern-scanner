-- =====================================================
-- GEM MOBILE - ADD MISSING COLUMNS TO COURSES TABLE
-- Required for seed data to work properly
-- Date: 2024-12-24
-- =====================================================

-- Add is_featured column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'courses' AND column_name = 'is_featured'
  ) THEN
    ALTER TABLE courses ADD COLUMN is_featured BOOLEAN DEFAULT false;
    RAISE NOTICE 'Added is_featured column to courses';
  END IF;
END $$;

-- Add category column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'courses' AND column_name = 'category'
  ) THEN
    ALTER TABLE courses ADD COLUMN category TEXT;
    RAISE NOTICE 'Added category column to courses';
  END IF;
END $$;

-- Add estimated_duration column (text format like '30 gio')
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'courses' AND column_name = 'estimated_duration'
  ) THEN
    ALTER TABLE courses ADD COLUMN estimated_duration TEXT;
    RAISE NOTICE 'Added estimated_duration column to courses';
  END IF;
END $$;

-- Add difficulty_level column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'courses' AND column_name = 'difficulty_level'
  ) THEN
    ALTER TABLE courses ADD COLUMN difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced'));
    RAISE NOTICE 'Added difficulty_level column to courses';
  END IF;
END $$;

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_courses_featured ON courses(is_featured);
CREATE INDEX IF NOT EXISTS idx_courses_category ON courses(category);
CREATE INDEX IF NOT EXISTS idx_courses_difficulty ON courses(difficulty_level);

-- Add comments
COMMENT ON COLUMN courses.is_featured IS 'Whether course is featured on home page';
COMMENT ON COLUMN courses.category IS 'Course category: Trading Foundation, Advanced Trading, Trading Mastery, etc.';
COMMENT ON COLUMN courses.estimated_duration IS 'Estimated total duration in text format (e.g. "30 gio")';
COMMENT ON COLUMN courses.difficulty_level IS 'Course difficulty: beginner, intermediate, advanced';

-- Log completion
DO $$
BEGIN
  RAISE NOTICE 'Migration 20251224_courses_add_missing_columns completed successfully';
  RAISE NOTICE 'Added columns: is_featured, category, estimated_duration, difficulty_level';
END $$;
