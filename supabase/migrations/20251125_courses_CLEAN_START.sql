-- ========================================
-- GEM Platform - CLEAN START
-- Drops existing course tables and recreates them
-- ========================================

-- Drop in reverse order to handle foreign keys
DROP TABLE IF EXISTS course_certificates CASCADE;
DROP TABLE IF EXISTS course_progress CASCADE;
DROP TABLE IF EXISTS course_enrollments CASCADE;
DROP TABLE IF EXISTS course_lessons CASCADE;
DROP TABLE IF EXISTS course_modules CASCADE;
DROP TABLE IF EXISTS courses CASCADE;

-- Drop view if exists
DROP VIEW IF EXISTS user_course_progress CASCADE;

-- Drop functions if exist
DROP FUNCTION IF EXISTS update_course_completion() CASCADE;
DROP FUNCTION IF EXISTS generate_certificate_number() CASCADE;

-- ========================================
-- Now create fresh tables
-- ========================================

-- TABLE: courses
CREATE TABLE courses (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    instructor_name TEXT,
    instructor_avatar TEXT,
    duration_hours DECIMAL(5,2) DEFAULT 0,
    total_lessons INTEGER DEFAULT 0,
    tier_required TEXT DEFAULT 'FREE',
    price DECIMAL(12,2) DEFAULT 0,
    currency TEXT DEFAULT 'VND',
    rating DECIMAL(2,1),
    students_count INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT false,
    tevello_id TEXT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE: course_modules
CREATE TABLE course_modules (
    id TEXT PRIMARY KEY,
    course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE: course_lessons
CREATE TABLE course_lessons (
    id TEXT PRIMARY KEY,
    module_id TEXT NOT NULL REFERENCES course_modules(id) ON DELETE CASCADE,
    course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT DEFAULT 'video',
    duration_minutes INTEGER DEFAULT 0,
    video_url TEXT,
    order_index INTEGER DEFAULT 0,
    is_preview BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE: course_enrollments
CREATE TABLE course_enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
    source TEXT DEFAULT 'app',
    UNIQUE(user_id, course_id)
);

-- TABLE: course_progress
CREATE TABLE course_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
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

-- TABLE: course_certificates
CREATE TABLE course_certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    certificate_number TEXT UNIQUE NOT NULL DEFAULT ('GEM-' || gen_random_uuid()::TEXT),
    issued_at TIMESTAMPTZ DEFAULT NOW(),
    download_url TEXT,
    tevello_certificate_id TEXT,
    UNIQUE(user_id, course_id)
);

-- ========================================
-- INDEXES
-- ========================================
CREATE INDEX idx_courses_tier ON courses(tier_required);
CREATE INDEX idx_courses_published ON courses(is_published);
CREATE INDEX idx_modules_course ON course_modules(course_id);
CREATE INDEX idx_lessons_module ON course_lessons(module_id);
CREATE INDEX idx_lessons_course ON course_lessons(course_id);
CREATE INDEX idx_enrollments_user ON course_enrollments(user_id);
CREATE INDEX idx_enrollments_course ON course_enrollments(course_id);
CREATE INDEX idx_progress_user ON course_progress(user_id);
CREATE INDEX idx_progress_course ON course_progress(course_id);
CREATE INDEX idx_certificates_user ON course_certificates(user_id);

-- ========================================
-- RLS
-- ========================================
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_certificates ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can view published courses" ON courses FOR SELECT USING (is_published = true);
CREATE POLICY "Anyone can view modules" ON course_modules FOR SELECT USING (true);
CREATE POLICY "Anyone can view lessons" ON course_lessons FOR SELECT USING (true);
CREATE POLICY "Users view own enrollments" ON course_enrollments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own enrollments" ON course_enrollments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users view own progress" ON course_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own progress" ON course_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own progress" ON course_progress FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users view own certificates" ON course_certificates FOR SELECT USING (auth.uid() = user_id);

-- Done!
SELECT 'All course tables created successfully!' as status;
