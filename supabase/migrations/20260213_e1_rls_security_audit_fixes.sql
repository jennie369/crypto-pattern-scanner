-- =====================================================
-- E1: RLS SECURITY AUDIT FIXES
-- Date: 2026-02-13
-- Phase 2 Team E - Security/RLS audit findings
-- =====================================================
--
-- FINDINGS:
-- 1. course_lessons SELECT allows ANYONE to read content of published courses
--    → Paid lesson content is publicly queryable. Must restrict to enrolled users.
-- 2. pending_course_access has NO RLS → anyone can read/write pending access records
-- 3. course_modules SELECT is wide open (less critical — metadata only)
--
-- STRATEGY:
-- - course_lessons: Restrict to enrolled users + admin + free courses
-- - course_modules: Keep open for browsing, but note this is intentional (curriculum preview)
-- - pending_course_access: Enable RLS, admin-only access
-- - courses: Keep open for published (browsing is fine)
-- =====================================================

-- =====================================================
-- FIX 1: RESTRICT course_lessons TO ENROLLED USERS
-- Before: Anyone can SELECT lessons of published courses
-- After: Only enrolled users, admin, or free course learners can SELECT
-- =====================================================

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Anyone can view lessons of published courses" ON course_lessons;

-- New policy: Users can view lessons if:
-- 1. They are enrolled in the course, OR
-- 2. The course is FREE (tier_required IS NULL or 'FREE'), OR
-- 3. They are admin
CREATE POLICY "Enrolled users can view lessons"
  ON course_lessons FOR SELECT
  TO authenticated
  USING (
    -- Admin can view all
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'ADMIN' OR is_admin = true)
    )
    OR
    -- Free courses: anyone authenticated can view
    EXISTS (
      SELECT 1 FROM courses c
      WHERE c.id = course_lessons.course_id
      AND c.is_published = true
      AND (c.tier_required IS NULL OR c.tier_required = 'FREE')
    )
    OR
    -- Enrolled users can view paid course lessons
    EXISTS (
      SELECT 1 FROM course_enrollments e
      WHERE e.course_id = course_lessons.course_id
      AND e.user_id = auth.uid()
    )
  );

-- Also allow service role (edge functions) full access via default behavior
-- (service_role bypasses RLS by default in Supabase)

-- =====================================================
-- FIX 2: ENABLE RLS ON pending_course_access
-- Before: No RLS at all — anyone can read/write
-- After: Admin-only read/write
-- =====================================================

ALTER TABLE pending_course_access ENABLE ROW LEVEL SECURITY;

-- Only admin can view pending access records
CREATE POLICY "Admin can view pending course access"
  ON pending_course_access FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'ADMIN' OR is_admin = true)
    )
  );

-- Only admin (or service role) can insert pending access
-- (Shopify webhook uses service_role which bypasses RLS)
CREATE POLICY "Admin can manage pending course access"
  ON pending_course_access FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'ADMIN' OR is_admin = true)
    )
  );

-- =====================================================
-- FIX 3: ADD ADMIN POLICIES FOR COURSE TABLES
-- Missing: Admin cannot manage course_enrollments or course_certificates
-- =====================================================

-- Admin can manage all enrollments
DROP POLICY IF EXISTS "Admin can manage enrollments" ON course_enrollments;
CREATE POLICY "Admin can manage enrollments"
  ON course_enrollments FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'ADMIN' OR is_admin = true)
    )
  );

-- Admin can manage all certificates
DROP POLICY IF EXISTS "Admin can manage certificates" ON course_certificates;
CREATE POLICY "Admin can manage certificates"
  ON course_certificates FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'ADMIN' OR is_admin = true)
    )
  );

-- Admin can manage all courses (INSERT/UPDATE/DELETE)
DROP POLICY IF EXISTS "Admin can manage courses" ON courses;
CREATE POLICY "Admin can manage courses"
  ON courses FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'ADMIN' OR is_admin = true)
    )
  );

-- Admin can manage all modules
DROP POLICY IF EXISTS "Admin can manage modules" ON course_modules;
CREATE POLICY "Admin can manage modules"
  ON course_modules FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'ADMIN' OR is_admin = true)
    )
  );

-- Admin can manage all lessons
DROP POLICY IF EXISTS "Admin can manage lessons" ON course_lessons;
CREATE POLICY "Admin can manage lessons"
  ON course_lessons FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'ADMIN' OR is_admin = true)
    )
  );

-- =====================================================
-- FIX 4: ADD MISSING DELETE POLICY FOR course_progress
-- Users should be able to delete their own progress (reset)
-- =====================================================

DROP POLICY IF EXISTS "Users can delete own progress" ON course_progress;
CREATE POLICY "Users can delete own progress"
  ON course_progress FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Admin can manage all progress
DROP POLICY IF EXISTS "Admin can manage progress" ON course_progress;
CREATE POLICY "Admin can manage progress"
  ON course_progress FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'ADMIN' OR is_admin = true)
    )
  );

-- =====================================================
-- FIX 5: CERTIFICATE INSERT POLICY
-- Users need to be able to INSERT certificates (generated client-side)
-- =====================================================

DROP POLICY IF EXISTS "Users can create own certificates" ON course_certificates;
CREATE POLICY "Users can create own certificates"
  ON course_certificates FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- FIX 6: RESTRICT quiz_questions TO ENROLLED USERS
-- Before: Anyone can SELECT all quiz questions (including correct_answer)
-- After: Only enrolled users + admin can view quiz questions
-- Note: Client-side grading requires correct_answer field.
--       This restricts who can query, not which fields are returned.
-- =====================================================

DROP POLICY IF EXISTS "Anyone can view quiz questions" ON quiz_questions;

CREATE POLICY "Enrolled users can view quiz questions"
  ON quiz_questions FOR SELECT
  TO authenticated
  USING (
    -- Admin can view all
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'ADMIN' OR is_admin = true)
    )
    OR
    -- Enrolled users can view quiz questions for their courses
    EXISTS (
      SELECT 1 FROM quizzes q
      JOIN course_enrollments e ON e.course_id = q.course_id
      WHERE q.id = quiz_questions.quiz_id
      AND e.user_id = auth.uid()
    )
    OR
    -- Free course quiz questions are accessible
    EXISTS (
      SELECT 1 FROM quizzes q
      JOIN courses c ON c.id = q.course_id
      WHERE q.id = quiz_questions.quiz_id
      AND c.is_published = true
      AND (c.tier_required IS NULL OR c.tier_required = 'FREE')
    )
  );

-- Admin can manage quiz questions
DROP POLICY IF EXISTS "Admin can manage quiz questions" ON quiz_questions;
CREATE POLICY "Admin can manage quiz questions"
  ON quiz_questions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'ADMIN' OR is_admin = true)
    )
  );

-- Also restrict quizzes (metadata) to enrolled users for paid courses
DROP POLICY IF EXISTS "Anyone can view quizzes" ON quizzes;

CREATE POLICY "Enrolled users can view quizzes"
  ON quizzes FOR SELECT
  TO authenticated
  USING (
    -- Admin can view all
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'ADMIN' OR is_admin = true)
    )
    OR
    -- Enrolled users
    EXISTS (
      SELECT 1 FROM course_enrollments e
      WHERE e.course_id = quizzes.course_id
      AND e.user_id = auth.uid()
    )
    OR
    -- Free courses
    EXISTS (
      SELECT 1 FROM courses c
      WHERE c.id = quizzes.course_id
      AND c.is_published = true
      AND (c.tier_required IS NULL OR c.tier_required = 'FREE')
    )
  );

-- Admin can manage quizzes
DROP POLICY IF EXISTS "Admin can manage quizzes" ON quizzes;
CREATE POLICY "Admin can manage quizzes"
  ON quizzes FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'ADMIN' OR is_admin = true)
    )
  );

-- =====================================================
-- FIX 7: ADD ADMIN POLICIES FOR quiz_attempts
-- Admin needs to view all attempts for course analytics
-- =====================================================

DROP POLICY IF EXISTS "Admin can view all quiz attempts" ON quiz_attempts;
CREATE POLICY "Admin can view all quiz attempts"
  ON quiz_attempts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'ADMIN' OR is_admin = true)
    )
  );

-- =====================================================
-- VERIFICATION
-- =====================================================

-- List all course-related policies
SELECT tablename, policyname, cmd, qual
FROM pg_policies
WHERE tablename IN (
  'courses', 'course_modules', 'course_lessons',
  'course_enrollments', 'course_progress', 'course_certificates',
  'lesson_progress', 'lesson_attachments', 'course_teachers',
  'course_drip_schedule', 'pending_course_access'
)
ORDER BY tablename, policyname;
