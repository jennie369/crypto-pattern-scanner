-- ========================================
-- GEM Platform - Courses Tables (STEP 1)
-- Run this FIRST to create all tables
-- ========================================

-- ========================================
-- TABLE: courses
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

CREATE INDEX IF NOT EXISTS idx_courses_tier ON courses(tier_required);
CREATE INDEX IF NOT EXISTS idx_courses_published ON courses(is_published);
CREATE INDEX IF NOT EXISTS idx_courses_tevello ON courses(tevello_id);

-- ========================================
-- TABLE: course_modules
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
-- Uses UUID for user_id to match Supabase auth
-- ========================================
CREATE TABLE IF NOT EXISTS course_enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
    source TEXT DEFAULT 'app',
    UNIQUE(user_id, course_id)
);

CREATE INDEX IF NOT EXISTS idx_enrollments_user ON course_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course ON course_enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_completed ON course_enrollments(completed_at);

-- ========================================
-- TABLE: course_progress
-- ========================================
CREATE TABLE IF NOT EXISTS course_progress (
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

CREATE INDEX IF NOT EXISTS idx_progress_user ON course_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_course ON course_progress(course_id);
CREATE INDEX IF NOT EXISTS idx_progress_user_course ON course_progress(user_id, course_id);

-- ========================================
-- TABLE: course_certificates
-- ========================================
CREATE TABLE IF NOT EXISTS course_certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    certificate_number TEXT UNIQUE NOT NULL DEFAULT 'TEMP',
    issued_at TIMESTAMPTZ DEFAULT NOW(),
    download_url TEXT,
    tevello_certificate_id TEXT,
    UNIQUE(user_id, course_id)
);

CREATE INDEX IF NOT EXISTS idx_certificates_user ON course_certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_certificates_number ON course_certificates(certificate_number);

-- Done! Now run step 2 for functions and RLS
