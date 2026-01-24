-- ============================================================
-- INSTRUCTOR REVENUE SHARE SYSTEM
-- Date: 2026-01-20
-- Description:
--   - Add instructor_id and revenue_share_type to courses
--   - Create instructor_earnings table
--   - Add 70-30 revenue share option
--   - Create RPC functions for instructor dashboard
-- ============================================================

-- ============================================================
-- 1. UPDATE COURSES TABLE - Add instructor columns
-- ============================================================

-- Add instructor_id column
ALTER TABLE courses
  ADD COLUMN IF NOT EXISTS instructor_id UUID REFERENCES auth.users(id);

-- Add revenue_share_type column
ALTER TABLE courses
  ADD COLUMN IF NOT EXISTS revenue_share_type VARCHAR(10) DEFAULT '50-50'
  CHECK (revenue_share_type IN ('30-70', '40-60', '50-50', '60-40', '70-30'));

-- Add instructor_bio column
ALTER TABLE courses
  ADD COLUMN IF NOT EXISTS instructor_bio TEXT;

-- Create index for instructor lookup
CREATE INDEX IF NOT EXISTS idx_courses_instructor_id ON courses(instructor_id);

-- ============================================================
-- 2. CREATE INSTRUCTOR_EARNINGS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS instructor_earnings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Instructor info
  instructor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,

  -- Order info
  order_id VARCHAR(100) NOT NULL,
  order_number VARCHAR(50) NOT NULL,

  -- Revenue calculation
  course_price DECIMAL(15,2) NOT NULL,
  revenue_share_type VARCHAR(10) NOT NULL,
  instructor_share_rate DECIMAL(5,4) NOT NULL,
  platform_share_rate DECIMAL(5,4) NOT NULL,
  instructor_earning DECIMAL(15,2) NOT NULL,
  platform_earning DECIMAL(15,2) NOT NULL,

  -- Student info
  student_email VARCHAR(255),
  student_id UUID REFERENCES auth.users(id),

  -- Status: pending, approved, paid
  status VARCHAR(20) DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'paid', 'cancelled')),

  -- Payment info
  paid_at TIMESTAMPTZ,
  payment_method VARCHAR(50),
  payment_reference VARCHAR(100),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Prevent duplicate entries for same order
  UNIQUE(instructor_id, order_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_instructor_earnings_instructor ON instructor_earnings(instructor_id);
CREATE INDEX IF NOT EXISTS idx_instructor_earnings_course ON instructor_earnings(course_id);
CREATE INDEX IF NOT EXISTS idx_instructor_earnings_status ON instructor_earnings(status);
CREATE INDEX IF NOT EXISTS idx_instructor_earnings_created ON instructor_earnings(created_at DESC);

-- ============================================================
-- 3. RLS POLICIES FOR INSTRUCTOR_EARNINGS
-- ============================================================

ALTER TABLE instructor_earnings ENABLE ROW LEVEL SECURITY;

-- Instructors can view their own earnings
DROP POLICY IF EXISTS "Instructors can view own earnings" ON instructor_earnings;
CREATE POLICY "Instructors can view own earnings" ON instructor_earnings
  FOR SELECT USING (auth.uid() = instructor_id);

-- Admins can view all earnings
DROP POLICY IF EXISTS "Admins can view all earnings" ON instructor_earnings;
CREATE POLICY "Admins can view all earnings" ON instructor_earnings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Service role can insert/update
DROP POLICY IF EXISTS "Service can manage earnings" ON instructor_earnings;
CREATE POLICY "Service can manage earnings" ON instructor_earnings
  FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- 4. INSTRUCTOR PROFILES VIEW
-- ============================================================

CREATE OR REPLACE VIEW instructor_profiles AS
SELECT
  p.id,
  p.display_name,
  p.email,
  p.avatar_url,
  ia.status as application_status,
  ia.expertise_areas,
  ia.years_experience,
  ia.bio,
  ia.preferred_revenue_share,
  ia.reviewed_at as approved_at,
  (
    SELECT COUNT(*)::INT FROM courses c WHERE c.instructor_id = p.id
  ) as total_courses,
  (
    SELECT COALESCE(SUM(ie.instructor_earning), 0)
    FROM instructor_earnings ie
    WHERE ie.instructor_id = p.id AND ie.status != 'cancelled'
  ) as total_earnings,
  (
    SELECT COALESCE(SUM(ie.instructor_earning), 0)
    FROM instructor_earnings ie
    WHERE ie.instructor_id = p.id AND ie.status = 'pending'
  ) as pending_earnings,
  (
    SELECT COALESCE(SUM(ie.instructor_earning), 0)
    FROM instructor_earnings ie
    WHERE ie.instructor_id = p.id AND ie.status = 'paid'
  ) as paid_earnings
FROM profiles p
INNER JOIN instructor_applications ia ON ia.email = p.email AND ia.status = 'approved';

-- ============================================================
-- 5. RPC: Get Instructor Dashboard Stats
-- ============================================================

CREATE OR REPLACE FUNCTION get_instructor_dashboard_stats(p_instructor_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_courses', (
      SELECT COUNT(*)::INT FROM courses WHERE instructor_id = p_instructor_id
    ),
    'total_students', (
      SELECT COUNT(DISTINCT ie.student_id)::INT
      FROM instructor_earnings ie
      WHERE ie.instructor_id = p_instructor_id
    ),
    'total_earnings', (
      SELECT COALESCE(SUM(instructor_earning), 0)
      FROM instructor_earnings
      WHERE instructor_id = p_instructor_id AND status != 'cancelled'
    ),
    'pending_earnings', (
      SELECT COALESCE(SUM(instructor_earning), 0)
      FROM instructor_earnings
      WHERE instructor_id = p_instructor_id AND status = 'pending'
    ),
    'paid_earnings', (
      SELECT COALESCE(SUM(instructor_earning), 0)
      FROM instructor_earnings
      WHERE instructor_id = p_instructor_id AND status = 'paid'
    ),
    'this_month_earnings', (
      SELECT COALESCE(SUM(instructor_earning), 0)
      FROM instructor_earnings
      WHERE instructor_id = p_instructor_id
        AND status != 'cancelled'
        AND created_at >= date_trunc('month', NOW())
    ),
    'last_month_earnings', (
      SELECT COALESCE(SUM(instructor_earning), 0)
      FROM instructor_earnings
      WHERE instructor_id = p_instructor_id
        AND status != 'cancelled'
        AND created_at >= date_trunc('month', NOW() - INTERVAL '1 month')
        AND created_at < date_trunc('month', NOW())
    ),
    'courses', (
      SELECT json_agg(json_build_object(
        'id', c.id,
        'title', c.title,
        'revenue_share_type', c.revenue_share_type,
        'total_earnings', COALESCE((
          SELECT SUM(instructor_earning)
          FROM instructor_earnings
          WHERE course_id = c.id AND status != 'cancelled'
        ), 0),
        'total_students', (
          SELECT COUNT(DISTINCT student_id)::INT
          FROM instructor_earnings
          WHERE course_id = c.id
        )
      ))
      FROM courses c
      WHERE c.instructor_id = p_instructor_id
    )
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 6. RPC: Get Admin Instructor Stats (for dashboard)
-- ============================================================

CREATE OR REPLACE FUNCTION get_admin_instructor_stats()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_instructors', (
      SELECT COUNT(*)::INT
      FROM instructor_applications
      WHERE status = 'approved'
    ),
    'pending_applications', (
      SELECT COUNT(*)::INT
      FROM instructor_applications
      WHERE status = 'pending'
    ),
    'total_instructor_earnings', (
      SELECT COALESCE(SUM(instructor_earning), 0)
      FROM instructor_earnings
      WHERE status != 'cancelled'
    ),
    'total_platform_earnings', (
      SELECT COALESCE(SUM(platform_earning), 0)
      FROM instructor_earnings
      WHERE status != 'cancelled'
    ),
    'pending_payouts', (
      SELECT COALESCE(SUM(instructor_earning), 0)
      FROM instructor_earnings
      WHERE status = 'pending'
    ),
    'this_month_instructor_earnings', (
      SELECT COALESCE(SUM(instructor_earning), 0)
      FROM instructor_earnings
      WHERE status != 'cancelled'
        AND created_at >= date_trunc('month', NOW())
    ),
    'top_instructors', (
      SELECT json_agg(row_to_json(t))
      FROM (
        SELECT
          ie.instructor_id,
          p.display_name,
          p.avatar_url,
          SUM(ie.instructor_earning) as total_earnings,
          COUNT(DISTINCT ie.course_id)::INT as courses_count,
          COUNT(DISTINCT ie.student_id)::INT as students_count
        FROM instructor_earnings ie
        JOIN profiles p ON p.id = ie.instructor_id
        WHERE ie.status != 'cancelled'
        GROUP BY ie.instructor_id, p.display_name, p.avatar_url
        ORDER BY total_earnings DESC
        LIMIT 10
      ) t
    ),
    'revenue_share_distribution', (
      SELECT json_agg(json_build_object(
        'share_type', revenue_share_type,
        'count', count
      ))
      FROM (
        SELECT revenue_share_type, COUNT(*)::INT as count
        FROM courses
        WHERE instructor_id IS NOT NULL
        GROUP BY revenue_share_type
      ) t
    )
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 7. UPDATE instructor_applications - Add 70-30 option
-- ============================================================

-- Drop and recreate constraint to include all options
ALTER TABLE instructor_applications
  DROP CONSTRAINT IF EXISTS instructor_applications_preferred_revenue_share_check;

ALTER TABLE instructor_applications
  ADD CONSTRAINT instructor_applications_preferred_revenue_share_check
  CHECK (preferred_revenue_share IN ('30-70', '40-60', '50-50', '60-40', '70-30'));

-- ============================================================
-- 8. TRIGGER: Link instructor to user on approval
-- ============================================================

CREATE OR REPLACE FUNCTION link_instructor_on_approval()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Only run when status changes to approved
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
    -- Find user by email
    SELECT id INTO v_user_id FROM profiles WHERE email = NEW.email;

    IF v_user_id IS NOT NULL THEN
      -- Update user's instructor flag
      UPDATE profiles
      SET
        is_instructor = true,
        instructor_bio = NEW.bio,
        updated_at = NOW()
      WHERE id = v_user_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_link_instructor_on_approval ON instructor_applications;
CREATE TRIGGER trg_link_instructor_on_approval
  BEFORE UPDATE ON instructor_applications
  FOR EACH ROW
  EXECUTE FUNCTION link_instructor_on_approval();

-- ============================================================
-- 9. Add is_instructor column to profiles if not exists
-- ============================================================

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS is_instructor BOOLEAN DEFAULT false;

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS instructor_bio TEXT;

CREATE INDEX IF NOT EXISTS idx_profiles_is_instructor ON profiles(is_instructor) WHERE is_instructor = true;

-- ============================================================
-- 10. Notify admin on new instructor earnings
-- ============================================================

CREATE OR REPLACE FUNCTION notify_instructor_earning()
RETURNS TRIGGER AS $$
BEGIN
  -- Notify the instructor
  INSERT INTO notifications (user_id, type, title, body, data)
  VALUES (
    NEW.instructor_id,
    'instructor_earning',
    '💰 Bạn có thu nhập mới!',
    format('Học viên mới đã đăng ký khóa học. Thu nhập: %s VND', NEW.instructor_earning::TEXT),
    jsonb_build_object(
      'earning_id', NEW.id,
      'course_id', NEW.course_id,
      'amount', NEW.instructor_earning,
      'order_number', NEW.order_number
    )
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_notify_instructor_earning ON instructor_earnings;
CREATE TRIGGER trg_notify_instructor_earning
  AFTER INSERT ON instructor_earnings
  FOR EACH ROW
  EXECUTE FUNCTION notify_instructor_earning();

-- ============================================================
-- DONE
-- ============================================================

COMMENT ON TABLE instructor_earnings IS 'Tracks instructor revenue share from course sales';
COMMENT ON COLUMN courses.instructor_id IS 'The instructor who created/owns this course';
COMMENT ON COLUMN courses.revenue_share_type IS 'Revenue share split: 40-60, 50-50, 60-40, or 70-30 (instructor-platform)';
