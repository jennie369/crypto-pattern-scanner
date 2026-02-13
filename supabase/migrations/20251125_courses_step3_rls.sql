-- ========================================
-- GEM Platform - Courses RLS Policies (STEP 3)
-- Run this AFTER step 2 (functions)
-- ========================================

-- Enable RLS on all tables
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_certificates ENABLE ROW LEVEL SECURITY;

-- ========================================
-- COURSES POLICIES
-- ========================================
DROP POLICY IF EXISTS "Anyone can view published courses" ON courses;
CREATE POLICY "Anyone can view published courses"
ON courses FOR SELECT
USING (is_published = true);

-- ========================================
-- MODULES POLICIES
-- ========================================
DROP POLICY IF EXISTS "Anyone can view modules of published courses" ON course_modules;
CREATE POLICY "Anyone can view modules of published courses"
ON course_modules FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM courses
        WHERE courses.id = course_modules.course_id
        AND courses.is_published = true
    )
);

-- ========================================
-- LESSONS POLICIES
-- ========================================
DROP POLICY IF EXISTS "Anyone can view lessons of published courses" ON course_lessons;
CREATE POLICY "Anyone can view lessons of published courses"
ON course_lessons FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM courses
        WHERE courses.id = course_lessons.course_id
        AND courses.is_published = true
    )
);

-- ========================================
-- ENROLLMENTS POLICIES
-- ========================================
DROP POLICY IF EXISTS "Users can view own enrollments" ON course_enrollments;
CREATE POLICY "Users can view own enrollments"
ON course_enrollments FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can enroll themselves" ON course_enrollments;
CREATE POLICY "Users can enroll themselves"
ON course_enrollments FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- ========================================
-- PROGRESS POLICIES
-- ========================================
DROP POLICY IF EXISTS "Users can view own progress" ON course_progress;
CREATE POLICY "Users can view own progress"
ON course_progress FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own progress" ON course_progress;
CREATE POLICY "Users can update own progress"
ON course_progress FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can modify own progress" ON course_progress;
CREATE POLICY "Users can modify own progress"
ON course_progress FOR UPDATE
USING (auth.uid() = user_id);

-- ========================================
-- CERTIFICATES POLICIES
-- ========================================
DROP POLICY IF EXISTS "Users can view own certificates" ON course_certificates;
CREATE POLICY "Users can view own certificates"
ON course_certificates FOR SELECT
USING (auth.uid() = user_id);

-- ========================================
-- TABLE COMMENTS
-- ========================================
COMMENT ON TABLE courses IS 'Course metadata synced from Tevello or created locally';
COMMENT ON TABLE course_enrollments IS 'User course enrollments with completion tracking';
COMMENT ON TABLE course_progress IS 'Per-lesson progress tracking for users';
COMMENT ON TABLE course_certificates IS 'Completion certificates issued to users';
COMMENT ON VIEW user_course_progress IS 'Aggregated progress view for user courses';

-- Done! All course tables, functions, and policies created.
