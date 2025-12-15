-- =====================================================
-- FIX COURSE BUILDER BUGS #26-28 - MIGRATION
-- Created: 30/11/2024
-- FIXED: Aligned with DATABASE_SCHEMA.md and existing courses tables
-- =====================================================

-- =====================================================
-- 1. ADD MISSING COLUMNS TO COURSES TABLE
-- (courses table already exists from 20251125_courses_step1_tables.sql)
-- =====================================================
ALTER TABLE courses ADD COLUMN IF NOT EXISTS created_by UUID;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS membership_duration_days INTEGER DEFAULT 0;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS shopify_product_id TEXT;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS drip_enabled BOOLEAN DEFAULT false;

-- =====================================================
-- 2. ADD MISSING COLUMNS TO COURSE_MODULES TABLE
-- =====================================================
ALTER TABLE course_modules ADD COLUMN IF NOT EXISTS is_free_preview BOOLEAN DEFAULT false;

-- =====================================================
-- 3. ADD MISSING COLUMNS TO COURSE_LESSONS TABLE
-- (Existing schema uses 'type' and 'is_preview', we add new columns for compatibility)
-- =====================================================
ALTER TABLE course_lessons ADD COLUMN IF NOT EXISTS content_type TEXT DEFAULT 'video';
ALTER TABLE course_lessons ADD COLUMN IF NOT EXISTS html_content TEXT;
ALTER TABLE course_lessons ADD COLUMN IF NOT EXISTS article_content TEXT;
ALTER TABLE course_lessons ADD COLUMN IF NOT EXISTS is_free_preview BOOLEAN DEFAULT false;

-- Update content_type constraint to include 'html'
ALTER TABLE course_lessons DROP CONSTRAINT IF EXISTS course_lessons_type_check;
ALTER TABLE course_lessons DROP CONSTRAINT IF EXISTS course_lessons_content_type_check;
ALTER TABLE course_lessons ADD CONSTRAINT course_lessons_type_check
  CHECK (type IS NULL OR type IN ('video', 'article', 'quiz', 'assignment', 'html'));
ALTER TABLE course_lessons ADD CONSTRAINT course_lessons_content_type_check
  CHECK (content_type IS NULL OR content_type IN ('video', 'article', 'quiz', 'assignment', 'html'));

-- =====================================================
-- 4. CREATE LESSON_ATTACHMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS lesson_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id TEXT REFERENCES course_lessons(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER,
  storage_path TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID
);

COMMENT ON TABLE lesson_attachments IS 'File attachments (PDF, DOC, etc.) for course lessons';

CREATE INDEX IF NOT EXISTS idx_lesson_attachments_lesson_id ON lesson_attachments(lesson_id);

-- =====================================================
-- 5. CREATE COURSE_TEACHERS TABLE
-- (For multi-teacher support)
-- =====================================================
CREATE TABLE IF NOT EXISTS course_teachers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id TEXT REFERENCES courses(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL,
  role TEXT DEFAULT 'teacher' CHECK (role IN ('owner', 'teacher', 'assistant')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(course_id, teacher_id)
);

COMMENT ON TABLE course_teachers IS 'Multi-teacher support for courses';

CREATE INDEX IF NOT EXISTS idx_course_teachers_course_id ON course_teachers(course_id);
CREATE INDEX IF NOT EXISTS idx_course_teachers_teacher_id ON course_teachers(teacher_id);

-- =====================================================
-- 6. HELPER FUNCTION: CHECK IF USER IS ADMIN
-- (Follows DATABASE_SCHEMA.md Section 3 pattern)
-- =====================================================
CREATE OR REPLACE FUNCTION is_course_admin()
RETURNS BOOLEAN AS $$
DECLARE
  user_profile RECORD;
BEGIN
  SELECT role, is_admin, scanner_tier, chatbot_tier
  INTO user_profile
  FROM profiles
  WHERE id = auth.uid();

  IF NOT FOUND THEN RETURN FALSE; END IF;

  RETURN (
    user_profile.is_admin = TRUE OR
    user_profile.role = 'admin' OR
    user_profile.role = 'ADMIN' OR
    user_profile.scanner_tier = 'ADMIN' OR
    user_profile.chatbot_tier = 'ADMIN'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 7. HELPER FUNCTION: CHECK IF USER IS COURSE ADMIN/TEACHER
-- =====================================================
CREATE OR REPLACE FUNCTION is_course_admin_or_teacher(course_uuid TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if user is admin
  IF is_course_admin() THEN
    RETURN TRUE;
  END IF;

  -- Check if user is course teacher
  IF EXISTS (
    SELECT 1 FROM course_teachers
    WHERE course_id = course_uuid
    AND teacher_id = auth.uid()
  ) THEN
    RETURN TRUE;
  END IF;

  -- Check if user is course creator
  IF EXISTS (
    SELECT 1 FROM courses
    WHERE id = course_uuid
    AND created_by = auth.uid()
  ) THEN
    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 8. RLS POLICIES FOR COURSES
-- =====================================================
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "courses_select_policy" ON courses;
DROP POLICY IF EXISTS "courses_insert_policy" ON courses;
DROP POLICY IF EXISTS "courses_update_policy" ON courses;
DROP POLICY IF EXISTS "courses_delete_policy" ON courses;

CREATE POLICY "courses_select_policy" ON courses
  FOR SELECT USING (true);

CREATE POLICY "courses_insert_policy" ON courses
  FOR INSERT WITH CHECK (is_course_admin());

CREATE POLICY "courses_update_policy" ON courses
  FOR UPDATE USING (is_course_admin_or_teacher(id));

CREATE POLICY "courses_delete_policy" ON courses
  FOR DELETE USING (is_course_admin());

-- =====================================================
-- 9. RLS POLICIES FOR COURSE_MODULES
-- =====================================================
ALTER TABLE course_modules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "modules_select_policy" ON course_modules;
DROP POLICY IF EXISTS "modules_insert_policy" ON course_modules;
DROP POLICY IF EXISTS "modules_update_policy" ON course_modules;
DROP POLICY IF EXISTS "modules_delete_policy" ON course_modules;

CREATE POLICY "modules_select_policy" ON course_modules
  FOR SELECT USING (true);

CREATE POLICY "modules_insert_policy" ON course_modules
  FOR INSERT WITH CHECK (is_course_admin_or_teacher(course_id));

CREATE POLICY "modules_update_policy" ON course_modules
  FOR UPDATE USING (is_course_admin_or_teacher(course_id));

CREATE POLICY "modules_delete_policy" ON course_modules
  FOR DELETE USING (is_course_admin_or_teacher(course_id));

-- =====================================================
-- 10. RLS POLICIES FOR COURSE_LESSONS
-- =====================================================
ALTER TABLE course_lessons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "lessons_select_policy" ON course_lessons;
DROP POLICY IF EXISTS "lessons_insert_policy" ON course_lessons;
DROP POLICY IF EXISTS "lessons_update_policy" ON course_lessons;
DROP POLICY IF EXISTS "lessons_delete_policy" ON course_lessons;

CREATE POLICY "lessons_select_policy" ON course_lessons
  FOR SELECT USING (true);

CREATE POLICY "lessons_insert_policy" ON course_lessons
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM course_modules m
      WHERE m.id = module_id
      AND is_course_admin_or_teacher(m.course_id)
    )
  );

CREATE POLICY "lessons_update_policy" ON course_lessons
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM course_modules m
      WHERE m.id = module_id
      AND is_course_admin_or_teacher(m.course_id)
    )
  );

CREATE POLICY "lessons_delete_policy" ON course_lessons
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM course_modules m
      WHERE m.id = module_id
      AND is_course_admin_or_teacher(m.course_id)
    )
  );

-- =====================================================
-- 11. RLS POLICIES FOR LESSON_ATTACHMENTS
-- =====================================================
ALTER TABLE lesson_attachments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "attachments_select_policy" ON lesson_attachments;
DROP POLICY IF EXISTS "attachments_insert_policy" ON lesson_attachments;
DROP POLICY IF EXISTS "attachments_delete_policy" ON lesson_attachments;

CREATE POLICY "attachments_select_policy" ON lesson_attachments
  FOR SELECT USING (true);

CREATE POLICY "attachments_insert_policy" ON lesson_attachments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM course_lessons l
      JOIN course_modules m ON m.id = l.module_id
      WHERE l.id = lesson_id
      AND is_course_admin_or_teacher(m.course_id)
    )
  );

CREATE POLICY "attachments_delete_policy" ON lesson_attachments
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM course_lessons l
      JOIN course_modules m ON m.id = l.module_id
      WHERE l.id = lesson_id
      AND is_course_admin_or_teacher(m.course_id)
    )
  );

-- =====================================================
-- 12. RLS POLICIES FOR COURSE_TEACHERS
-- =====================================================
ALTER TABLE course_teachers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "teachers_select_policy" ON course_teachers;
DROP POLICY IF EXISTS "teachers_insert_policy" ON course_teachers;
DROP POLICY IF EXISTS "teachers_delete_policy" ON course_teachers;

CREATE POLICY "teachers_select_policy" ON course_teachers
  FOR SELECT USING (true);

CREATE POLICY "teachers_insert_policy" ON course_teachers
  FOR INSERT WITH CHECK (is_course_admin());

CREATE POLICY "teachers_delete_policy" ON course_teachers
  FOR DELETE USING (is_course_admin());

-- =====================================================
-- 13. STORAGE BUCKET FOR LESSON ATTACHMENTS
-- (Run this separately in Supabase Dashboard if needed)
-- =====================================================
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('lesson-attachments', 'lesson-attachments', true)
-- ON CONFLICT DO NOTHING;

-- =====================================================
-- DONE! Run this in Supabase SQL Editor
-- =====================================================
