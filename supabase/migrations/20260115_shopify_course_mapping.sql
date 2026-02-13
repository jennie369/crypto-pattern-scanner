-- ========================================
-- GEM Platform - Shopify Course Mapping
-- Adds shopify_product_id to courses table and creates spiritual courses
-- Run this to enable Shopify purchase -> course enrollment sync
-- ========================================

-- 1. Add shopify_product_id column to courses table if not exists
ALTER TABLE courses
ADD COLUMN IF NOT EXISTS shopify_product_id TEXT;

-- Create index for fast lookup
CREATE INDEX IF NOT EXISTS idx_courses_shopify_product_id ON courses(shopify_product_id);

-- 2. Add missing columns to course_enrollments
ALTER TABLE course_enrollments
ADD COLUMN IF NOT EXISTS progress_percentage DECIMAL(5,2) DEFAULT 0;

ALTER TABLE course_enrollments
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

ALTER TABLE course_enrollments
ADD COLUMN IF NOT EXISTS access_source TEXT DEFAULT 'app';

-- 3. Insert/Update spiritual courses with Shopify product IDs
-- These product IDs match the Shopify store products

-- Khoa 7 Ngay Khai Mo Tan So Goc
INSERT INTO courses (
    id,
    title,
    description,
    thumbnail_url,
    instructor_name,
    instructor_avatar,
    duration_hours,
    total_lessons,
    tier_required,
    price,
    currency,
    is_published,
    shopify_product_id,
    created_at,
    updated_at
) VALUES (
    'khoa-7-ngay-khai-mo-tan-so-goc',
    'Khoa hoc 7 NGAY KHAI MO TAN SO GOC',
    'Khai mo tan so goc - Hanh trinh 7 ngay chuyen hoa nang luong',
    'https://cdn.shopify.com/s/files/1/0758/3877/0721/files/tan-so-goc-course.jpg',
    'Gemral',
    'https://ui-avatars.com/api/?name=GEM&background=6A5BFF&color=fff',
    7,
    21,
    'FREE',
    1990000,
    'VND',
    true,
    '8904651342001',
    NOW(),
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    shopify_product_id = EXCLUDED.shopify_product_id,
    is_published = true,
    updated_at = NOW();

-- Khoa Kich Hoat Tan So Tinh Yeu
INSERT INTO courses (
    id,
    title,
    description,
    thumbnail_url,
    instructor_name,
    instructor_avatar,
    duration_hours,
    total_lessons,
    tier_required,
    price,
    currency,
    is_published,
    shopify_product_id,
    created_at,
    updated_at
) VALUES (
    'khoa-kich-hoat-tan-so-tinh-yeu',
    'Khoa hoc KICH HOAT TAN SO TINH YEU',
    'Kich hoat tan so tinh yeu - Chieu cam tinh duyen',
    'https://cdn.shopify.com/s/files/1/0758/3877/0721/files/tinh-yeu-course.jpg',
    'Gemral',
    'https://ui-avatars.com/api/?name=GEM&background=6A5BFF&color=fff',
    5,
    15,
    'FREE',
    399000,
    'VND',
    true,
    '8904653111473',
    NOW(),
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    shopify_product_id = EXCLUDED.shopify_product_id,
    is_published = true,
    updated_at = NOW();

-- Khoa Tai Tao Tu Duy Trieu Phu
INSERT INTO courses (
    id,
    title,
    description,
    thumbnail_url,
    instructor_name,
    instructor_avatar,
    duration_hours,
    total_lessons,
    tier_required,
    price,
    currency,
    is_published,
    shopify_product_id,
    created_at,
    updated_at
) VALUES (
    'khoa-tai-tao-tu-duy-trieu-phu',
    'Khoa hoc TAI TAO TU DUY TRIEU PHU',
    'Tai tao tu duy trieu phu - Chuyen hoa suy nghi thanh cong',
    'https://cdn.shopify.com/s/files/1/0758/3877/0721/files/trieu-phu-course.jpg',
    'Gemral',
    'https://ui-avatars.com/api/?name=GEM&background=6A5BFF&color=fff',
    5,
    15,
    'FREE',
    499000,
    'VND',
    true,
    '8904656257201',
    NOW(),
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    shopify_product_id = EXCLUDED.shopify_product_id,
    is_published = true,
    updated_at = NOW();

-- 4. Grant function for course access (updated to work with course_enrollments)
CREATE OR REPLACE FUNCTION grant_course_access(
    user_id_param UUID,
    course_id_param TEXT,
    access_source_param TEXT DEFAULT 'admin_grant',
    duration_days_param INTEGER DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    enrollment_id UUID;
    expires_at TIMESTAMPTZ;
BEGIN
    -- Calculate expiration if duration provided
    IF duration_days_param IS NOT NULL THEN
        expires_at := NOW() + (duration_days_param || ' days')::INTERVAL;
    END IF;

    -- Insert or update enrollment
    INSERT INTO course_enrollments (
        user_id,
        course_id,
        enrolled_at,
        progress_percentage,
        is_active,
        access_source
    )
    VALUES (
        user_id_param,
        course_id_param,
        NOW(),
        0,
        true,
        access_source_param
    )
    ON CONFLICT (user_id, course_id) DO UPDATE SET
        is_active = true,
        access_source = COALESCE(EXCLUDED.access_source, course_enrollments.access_source),
        last_accessed_at = NOW()
    RETURNING id INTO enrollment_id;

    RETURN enrollment_id;
END;
$$;

-- 5. Check course access function
CREATE OR REPLACE FUNCTION check_course_access(
    user_id_param UUID,
    course_id_param TEXT
)
RETURNS TABLE(has_access BOOLEAN, reason TEXT, expires_at TIMESTAMPTZ)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        CASE
            WHEN ce.id IS NOT NULL AND ce.is_active = true THEN true
            ELSE false
        END AS has_access,
        CASE
            WHEN ce.id IS NOT NULL AND ce.is_active = true THEN 'enrolled'
            WHEN ce.id IS NOT NULL AND ce.is_active = false THEN 'enrollment_expired'
            ELSE 'not_enrolled'
        END AS reason,
        NULL::TIMESTAMPTZ AS expires_at
    FROM courses c
    LEFT JOIN course_enrollments ce ON ce.course_id = c.id AND ce.user_id = user_id_param
    WHERE c.id = course_id_param;
END;
$$;

-- 6. Log this migration
DO $$
BEGIN
    RAISE NOTICE 'Shopify course mapping migration completed successfully';
    RAISE NOTICE 'Courses created/updated with shopify_product_id:';
    RAISE NOTICE '  - khoa-7-ngay-khai-mo-tan-so-goc -> 8904651342001';
    RAISE NOTICE '  - khoa-kich-hoat-tan-so-tinh-yeu -> 8904653111473';
    RAISE NOTICE '  - khoa-tai-tao-tu-duy-trieu-phu -> 8904656257201';
END $$;
