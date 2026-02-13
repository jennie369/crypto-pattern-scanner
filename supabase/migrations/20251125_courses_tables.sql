-- ========================================
-- GEM Platform - Courses Tables Migration
-- Tevello LMS Integration Database Schema
-- Date: 2025-11-25
-- ========================================

-- ========================================
-- TABLE: courses
-- Stores course metadata (synced from Tevello)
-- ========================================
CREATE TABLE IF NOT EXISTS courses (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    instructor_name TEXT,
    instructor_avatar TEXT,
    duration_hours DECIMAL(5,2) DEFAULT 0,
    total_lessons INTEGER DEFAULT 0,
    tier_required TEXT DEFAULT 'FREE' CHECK (tier_required IN ('FREE', 'TIER1', 'TIER2', 'TIER3')),
    price DECIMAL(12,2) DEFAULT 0,
    currency TEXT DEFAULT 'VND',
    rating DECIMAL(2,1),
    students_count INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT false,
    tevello_id TEXT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for filtering
CREATE INDEX IF NOT EXISTS idx_courses_tier ON courses(tier_required);
CREATE INDEX IF NOT EXISTS idx_courses_published ON courses(is_published);
CREATE INDEX IF NOT EXISTS idx_courses_tevello ON courses(tevello_id);

-- ========================================
-- TABLE: course_modules
-- Course curriculum modules
-- ========================================
CREATE TABLE IF NOT EXISTS course_modules (
    id TEXT PRIMARY KEY,
    course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_modules_course ON course_modules(course_id);

-- ========================================
-- TABLE: course_lessons
-- Individual lessons within modules
-- ========================================
CREATE TABLE IF NOT EXISTS course_lessons (
    id TEXT PRIMARY KEY,
    module_id TEXT NOT NULL REFERENCES course_modules(id) ON DELETE CASCADE,
    course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT DEFAULT 'video' CHECK (type IN ('video', 'article', 'quiz', 'assignment')),
    duration_minutes INTEGER DEFAULT 0,
    video_url TEXT,
    order_index INTEGER DEFAULT 0,
    is_preview BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lessons_module ON course_lessons(module_id);
CREATE INDEX IF NOT EXISTS idx_lessons_course ON course_lessons(course_id);

-- ========================================
-- TABLE: course_enrollments
-- User course enrollments
-- ========================================
CREATE TABLE IF NOT EXISTS course_enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
    source TEXT DEFAULT 'app', -- 'app', 'tevello', 'admin'
    UNIQUE(user_id, course_id)
);

CREATE INDEX IF NOT EXISTS idx_enrollments_user ON course_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course ON course_enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_completed ON course_enrollments(completed_at);

-- ========================================
-- TABLE: course_progress
-- Lesson completion tracking
-- ========================================
CREATE TABLE IF NOT EXISTS course_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    lesson_id TEXT NOT NULL REFERENCES course_lessons(id) ON DELETE CASCADE,
    completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMPTZ,
    watch_time_seconds INTEGER DEFAULT 0,
    last_position_seconds INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, lesson_id)
);

CREATE INDEX IF NOT EXISTS idx_progress_user ON course_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_course ON course_progress(course_id);
CREATE INDEX IF NOT EXISTS idx_progress_user_course ON course_progress(user_id, course_id);

-- ========================================
-- TABLE: course_certificates
-- Completion certificates
-- ========================================
CREATE TABLE IF NOT EXISTS course_certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    certificate_number TEXT UNIQUE NOT NULL,
    issued_at TIMESTAMPTZ DEFAULT NOW(),
    download_url TEXT,
    tevello_certificate_id TEXT,
    UNIQUE(user_id, course_id)
);

CREATE INDEX IF NOT EXISTS idx_certificates_user ON course_certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_certificates_number ON course_certificates(certificate_number);

-- ========================================
-- VIEWS
-- ========================================

-- View: User course progress summary
CREATE OR REPLACE VIEW user_course_progress AS
SELECT
    e.user_id,
    e.course_id,
    c.title as course_title,
    c.total_lessons,
    COUNT(CASE WHEN p.completed THEN 1 END) as completed_lessons,
    ROUND(
        (COUNT(CASE WHEN p.completed THEN 1 END)::DECIMAL / NULLIF(c.total_lessons, 0)) * 100,
        2
    ) as progress_percent,
    e.enrolled_at,
    e.completed_at,
    MAX(p.updated_at) as last_activity
FROM course_enrollments e
JOIN courses c ON c.id = e.course_id
LEFT JOIN course_progress p ON p.user_id = e.user_id AND p.course_id = e.course_id
GROUP BY e.user_id, e.course_id, c.title, c.total_lessons, e.enrolled_at, e.completed_at;

-- ========================================
-- FUNCTIONS & TRIGGERS
-- ========================================

-- Function: Update course completion status
-- This function checks if all lessons are completed and updates enrollment status
CREATE OR REPLACE FUNCTION update_course_completion()
RETURNS TRIGGER
SECURITY DEFINER
AS $$
DECLARE
    v_total_lessons INTEGER;
    v_completed_lessons INTEGER;
BEGIN
    -- Get total lessons for the course
    SELECT COUNT(*) INTO v_total_lessons
    FROM course_lessons
    WHERE course_id = NEW.course_id;

    -- Get completed lessons for user
    SELECT COUNT(*) INTO v_completed_lessons
    FROM course_progress
    WHERE user_id = NEW.user_id
      AND course_id = NEW.course_id
      AND completed = true;

    -- If all lessons completed, mark enrollment as completed
    IF v_completed_lessons >= v_total_lessons AND v_total_lessons > 0 THEN
        UPDATE course_enrollments
        SET completed_at = NOW()
        WHERE user_id = NEW.user_id
          AND course_id = NEW.course_id
          AND completed_at IS NULL;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-update completion status
DROP TRIGGER IF EXISTS trigger_update_course_completion ON course_progress;
CREATE TRIGGER trigger_update_course_completion
AFTER INSERT OR UPDATE OF completed ON course_progress
FOR EACH ROW
WHEN (NEW.completed = true)
EXECUTE FUNCTION update_course_completion();

-- Function: Generate certificate number
-- Generates a unique certificate number on insert
CREATE OR REPLACE FUNCTION generate_certificate_number()
RETURNS TRIGGER
SECURITY DEFINER
AS $$
DECLARE
    v_cert_number TEXT;
BEGIN
    IF NEW.certificate_number IS NULL THEN
        v_cert_number := 'GEM-CERT-' ||
            TO_CHAR(NOW(), 'YYYYMMDD') || '-' ||
            UPPER(SUBSTRING(MD5(COALESCE(NEW.user_id::TEXT, '') || COALESCE(NEW.course_id, '') || NOW()::TEXT) FROM 1 FOR 8));
        NEW.certificate_number := v_cert_number;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-generate certificate number
DROP TRIGGER IF EXISTS trigger_generate_certificate_number ON course_certificates;
CREATE TRIGGER trigger_generate_certificate_number
BEFORE INSERT ON course_certificates
FOR EACH ROW
EXECUTE FUNCTION generate_certificate_number();

-- ========================================
-- ROW LEVEL SECURITY (RLS)
-- ========================================

-- Enable RLS
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_certificates ENABLE ROW LEVEL SECURITY;

-- Courses: Anyone can read published courses
CREATE POLICY "Anyone can view published courses"
ON courses FOR SELECT
USING (is_published = true);

-- Modules: Anyone can read modules of published courses
CREATE POLICY "Anyone can view modules of published courses"
ON course_modules FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM courses
        WHERE courses.id = course_modules.course_id
        AND courses.is_published = true
    )
);

-- Lessons: Anyone can read lessons of published courses
CREATE POLICY "Anyone can view lessons of published courses"
ON course_lessons FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM courses
        WHERE courses.id = course_lessons.course_id
        AND courses.is_published = true
    )
);

-- Enrollments: Users can only see/manage their own enrollments
CREATE POLICY "Users can view own enrollments"
ON course_enrollments FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can enroll themselves"
ON course_enrollments FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Progress: Users can only see/update their own progress
CREATE POLICY "Users can view own progress"
ON course_progress FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
ON course_progress FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can modify own progress"
ON course_progress FOR UPDATE
USING (auth.uid() = user_id);

-- Certificates: Users can only see their own certificates
CREATE POLICY "Users can view own certificates"
ON course_certificates FOR SELECT
USING (auth.uid() = user_id);

-- ========================================
-- SAMPLE DATA (for testing)
-- Uncomment to insert sample courses
-- ========================================
/*
INSERT INTO courses (id, title, description, thumbnail_url, instructor_name, duration_hours, total_lessons, tier_required, is_published)
VALUES
    ('course-trading-basics', 'Trading Cơ Bản', 'Học cách giao dịch crypto từ A-Z cho người mới bắt đầu', 'https://placehold.co/400x200/1a0b2e/FFBD59?text=Trading+101', 'GEM Master', 10, 24, 'FREE', true),
    ('course-technical-analysis', 'Phân Tích Kỹ Thuật', 'Nắm vững các công cụ và chỉ báo phân tích kỹ thuật', 'https://placehold.co/400x200/1a0b2e/6A5BFF?text=Technical+Analysis', 'Pro Trader', 15, 32, 'TIER1', true),
    ('course-defi-mastery', 'DeFi Mastery', 'Khám phá thế giới tài chính phi tập trung', 'https://placehold.co/400x200/1a0b2e/00C8FF?text=DeFi+Master', 'DeFi Expert', 12, 28, 'TIER2', true),
    ('course-trading-psychology', 'Tâm Lý Giao Dịch', 'Làm chủ cảm xúc và tâm lý khi trading', 'https://placehold.co/400x200/1a0b2e/3AF7A6?text=Psychology', 'Mind Coach', 8, 20, 'FREE', true);
*/

-- ========================================
-- COMMENTS
-- ========================================
COMMENT ON TABLE courses IS 'Course metadata synced from Tevello or created locally';
COMMENT ON TABLE course_enrollments IS 'User course enrollments with completion tracking';
COMMENT ON TABLE course_progress IS 'Per-lesson progress tracking for users';
COMMENT ON TABLE course_certificates IS 'Completion certificates issued to users';
COMMENT ON VIEW user_course_progress IS 'Aggregated progress view for user courses';
