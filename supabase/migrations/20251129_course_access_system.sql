-- =============================================
-- COURSE ACCESS & ENROLLMENT SYSTEM
-- Migration: 20251129_course_access_system.sql
-- =============================================

-- 1. Extend courses table with additional columns
ALTER TABLE courses ADD COLUMN IF NOT EXISTS membership_duration_days INT;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS shopify_product_id TEXT;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS drip_enabled BOOLEAN DEFAULT false;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- 2. Course Teachers (multi-teacher support)
CREATE TABLE IF NOT EXISTS course_teachers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'teacher', -- 'owner', 'teacher', 'assistant'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(course_id, teacher_id)
);

-- 3. Lesson Progress (video position tracking)
CREATE TABLE IF NOT EXISTS lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL,
  course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  module_id TEXT,

  -- Progress
  status TEXT DEFAULT 'not_started', -- 'not_started', 'in_progress', 'completed'
  progress_percent INT DEFAULT 0,
  time_spent_seconds INT DEFAULT 0,

  -- Video specific
  video_position_seconds INT DEFAULT 0,

  -- Completion
  completed_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, lesson_id)
);

-- 4. Lesson Attachments (PDF, etc.)
CREATE TABLE IF NOT EXISTS lesson_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id TEXT NOT NULL,
  course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,

  -- File info
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT, -- 'pdf', 'zip', 'doc', 'xlsx'
  file_size_bytes INT,

  -- Stats
  download_count INT DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Drip Schedule (optional content release)
CREATE TABLE IF NOT EXISTS course_drip_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  module_id TEXT,
  lesson_id TEXT,

  -- Release settings
  release_type TEXT NOT NULL, -- 'immediate', 'days_after_enroll', 'specific_date'
  days_after_enroll INT,
  release_date TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- INDEXES
-- =============================================

CREATE INDEX IF NOT EXISTS idx_lesson_progress_user ON lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_course ON lesson_progress(course_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_lesson ON lesson_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_attachments_lesson ON lesson_attachments(lesson_id);
CREATE INDEX IF NOT EXISTS idx_attachments_course ON lesson_attachments(course_id);
CREATE INDEX IF NOT EXISTS idx_teachers_course ON course_teachers(course_id);
CREATE INDEX IF NOT EXISTS idx_teachers_user ON course_teachers(teacher_id);
CREATE INDEX IF NOT EXISTS idx_drip_course ON course_drip_schedule(course_id);

-- =============================================
-- RLS POLICIES
-- =============================================

ALTER TABLE course_teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_drip_schedule ENABLE ROW LEVEL SECURITY;

-- Course Teachers: Admin can manage, teachers can view their own
CREATE POLICY "Admin manages course teachers"
  ON course_teachers FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (role = 'admin' OR role = 'ADMIN' OR is_admin = true))
  );

CREATE POLICY "Teachers view own assignments"
  ON course_teachers FOR SELECT
  USING (teacher_id = auth.uid());

-- Lesson Progress: Users manage their own progress
CREATE POLICY "Users manage own lesson progress"
  ON lesson_progress FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY "Admin view all lesson progress"
  ON lesson_progress FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (role = 'admin' OR role = 'ADMIN' OR is_admin = true))
  );

-- Lesson Attachments: Enrolled users can view
CREATE POLICY "Enrolled users view attachments"
  ON lesson_attachments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM course_enrollments e
      WHERE e.course_id = lesson_attachments.course_id
      AND e.user_id = auth.uid()
    )
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (role = 'admin' OR role = 'ADMIN' OR is_admin = true))
  );

CREATE POLICY "Admin manages attachments"
  ON lesson_attachments FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (role = 'admin' OR role = 'ADMIN' OR is_admin = true))
  );

-- Drip Schedule: Admin only
CREATE POLICY "Admin manages drip schedule"
  ON course_drip_schedule FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (role = 'admin' OR role = 'ADMIN' OR is_admin = true))
  );

-- =============================================
-- HELPER FUNCTIONS
-- =============================================

-- Check if user has access to course
CREATE OR REPLACE FUNCTION check_course_access(
  user_id_param UUID,
  course_id_param TEXT
)
RETURNS TABLE (
  has_access BOOLEAN,
  reason TEXT,
  expires_at TIMESTAMPTZ
) AS $$
DECLARE
  enrollment RECORD;
  course_record RECORD;
  user_profile RECORD;
BEGIN
  -- Get course
  SELECT * INTO course_record FROM courses WHERE id = course_id_param;

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'course_not_found'::TEXT, NULL::TIMESTAMPTZ;
    RETURN;
  END IF;

  -- Free course - always accessible
  IF course_record.tier_required IS NULL OR course_record.tier_required = 'FREE' THEN
    RETURN QUERY SELECT true, 'free_course'::TEXT, NULL::TIMESTAMPTZ;
    RETURN;
  END IF;

  -- Check enrollment
  SELECT * INTO enrollment
  FROM course_enrollments
  WHERE course_enrollments.user_id = user_id_param
  AND course_enrollments.course_id = course_id_param;

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'not_enrolled'::TEXT, NULL::TIMESTAMPTZ;
    RETURN;
  END IF;

  -- Check if enrollment has completed_at (means course was finished, access continues)
  -- Or check expiry if source is 'purchase' with duration

  -- Get user tier
  SELECT * INTO user_profile FROM profiles WHERE id = user_id_param;

  -- Simple tier check
  IF course_record.tier_required IS NOT NULL THEN
    -- Tier hierarchy: FREE < TIER1 < TIER2 < TIER3 < ADMIN
    DECLARE
      tier_order TEXT[] := ARRAY['FREE', 'TIER1', 'TIER2', 'TIER3', 'ADMIN'];
      user_tier_idx INT;
      course_tier_idx INT;
    BEGIN
      user_tier_idx := array_position(tier_order, COALESCE(user_profile.scanner_tier, 'FREE'));
      course_tier_idx := array_position(tier_order, course_record.tier_required);

      IF user_tier_idx IS NULL THEN user_tier_idx := 1; END IF;
      IF course_tier_idx IS NULL THEN course_tier_idx := 1; END IF;

      IF user_tier_idx < course_tier_idx THEN
        RETURN QUERY SELECT false, 'tier_required'::TEXT, NULL::TIMESTAMPTZ;
        RETURN;
      END IF;
    END;
  END IF;

  RETURN QUERY SELECT true, 'enrolled'::TEXT, NULL::TIMESTAMPTZ;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant course access
CREATE OR REPLACE FUNCTION grant_course_access(
  user_id_param UUID,
  course_id_param TEXT,
  access_source_param TEXT DEFAULT 'admin_grant',
  duration_days_param INT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  new_enrollment_id UUID;
  course_duration INT;
BEGIN
  -- Get course default duration if not specified
  IF duration_days_param IS NULL THEN
    SELECT membership_duration_days INTO course_duration
    FROM courses WHERE id = course_id_param;
  ELSE
    course_duration := duration_days_param;
  END IF;

  -- Insert or update enrollment
  INSERT INTO course_enrollments (
    user_id, course_id, source, enrolled_at
  ) VALUES (
    user_id_param, course_id_param, access_source_param, NOW()
  )
  ON CONFLICT (user_id, course_id)
  DO UPDATE SET
    source = access_source_param,
    enrolled_at = NOW()
  RETURNING id INTO new_enrollment_id;

  RETURN new_enrollment_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Calculate course progress for a user
CREATE OR REPLACE FUNCTION calculate_course_progress(
  user_id_param UUID,
  course_id_param TEXT
)
RETURNS INT AS $$
DECLARE
  total_lessons INT;
  completed_lessons INT;
BEGIN
  -- Count total lessons in course
  SELECT COUNT(*) INTO total_lessons
  FROM course_lessons WHERE course_id = course_id_param;

  IF total_lessons = 0 THEN
    RETURN 0;
  END IF;

  -- Count completed lessons
  SELECT COUNT(*) INTO completed_lessons
  FROM lesson_progress
  WHERE user_id = user_id_param
  AND course_id = course_id_param
  AND status = 'completed';

  RETURN ROUND((completed_lessons::DECIMAL / total_lessons) * 100);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update course enrollment progress
CREATE OR REPLACE FUNCTION update_enrollment_progress()
RETURNS TRIGGER AS $$
BEGIN
  -- When lesson is marked complete, update course enrollment progress
  IF NEW.status = 'completed' AND (OLD IS NULL OR OLD.status != 'completed') THEN
    UPDATE course_enrollments
    SET last_accessed_at = NOW()
    WHERE user_id = NEW.user_id AND course_id = NEW.course_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for progress updates
DROP TRIGGER IF EXISTS trigger_update_enrollment_progress ON lesson_progress;
CREATE TRIGGER trigger_update_enrollment_progress
  AFTER INSERT OR UPDATE ON lesson_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_enrollment_progress();

-- =============================================
-- PENDING COURSE ACCESS (for Shopify webhook)
-- =============================================

-- Table to store pending course access for users who haven't signed up yet
CREATE TABLE IF NOT EXISTS pending_course_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  course_id TEXT NOT NULL,
  shopify_order_id TEXT,
  access_type TEXT DEFAULT 'purchase',
  price_paid DECIMAL(10, 2),
  purchased_at TIMESTAMPTZ DEFAULT NOW(),
  applied BOOLEAN DEFAULT false,
  applied_at TIMESTAMPTZ,
  applied_user_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pending_course_email ON pending_course_access(email);
CREATE INDEX IF NOT EXISTS idx_pending_course_applied ON pending_course_access(applied);

-- Function to apply pending course access when user signs up
CREATE OR REPLACE FUNCTION apply_pending_course_access(
  user_id_param UUID,
  user_email_param TEXT
)
RETURNS INT AS $$
DECLARE
  pending RECORD;
  applied_count INT := 0;
BEGIN
  FOR pending IN
    SELECT * FROM pending_course_access
    WHERE email = user_email_param
    AND applied = false
  LOOP
    -- Insert enrollment
    INSERT INTO course_enrollments (
      user_id, course_id, access_type, enrolled_at, metadata
    ) VALUES (
      user_id_param,
      pending.course_id,
      pending.access_type,
      pending.purchased_at,
      jsonb_build_object(
        'shopify_order_id', pending.shopify_order_id,
        'price_paid', pending.price_paid,
        'pending_id', pending.id
      )
    )
    ON CONFLICT (user_id, course_id) DO NOTHING;

    -- Mark as applied
    UPDATE pending_course_access
    SET applied = true,
        applied_at = NOW(),
        applied_user_id = user_id_param
    WHERE id = pending.id;

    applied_count := applied_count + 1;
  END LOOP;

  RETURN applied_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- STORAGE BUCKET FOR LESSON ATTACHMENTS
-- =============================================

-- Note: Run this in Supabase dashboard or via SQL editor
-- INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
-- VALUES (
--   'lesson-attachments',
--   'lesson-attachments',
--   false,
--   52428800, -- 50MB
--   ARRAY['application/pdf', 'application/zip', 'application/msword',
--         'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
--         'application/vnd.ms-excel',
--         'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
-- )
-- ON CONFLICT (id) DO NOTHING;
