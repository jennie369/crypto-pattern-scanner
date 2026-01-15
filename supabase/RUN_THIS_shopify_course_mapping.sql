-- ========================================
-- RUN THIS: Full Shopify Course Mapping Setup
-- All 7 Courses: 4 Trading + 3 Mindset
-- Execute this in Supabase SQL Editor
-- ========================================

-- Step 1: Add shopify_product_id column
ALTER TABLE courses ADD COLUMN IF NOT EXISTS shopify_product_id TEXT;
CREATE INDEX IF NOT EXISTS idx_courses_shopify_product_id ON courses(shopify_product_id);

-- Step 2: Add missing columns to course_enrollments
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='course_enrollments' AND column_name='progress_percentage') THEN
        ALTER TABLE course_enrollments ADD COLUMN progress_percentage DECIMAL(5,2) DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='course_enrollments' AND column_name='is_active') THEN
        ALTER TABLE course_enrollments ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='course_enrollments' AND column_name='access_source') THEN
        ALTER TABLE course_enrollments ADD COLUMN access_source TEXT DEFAULT 'app';
    END IF;
END $$;

-- ========================================
-- TRADING COURSES (4)
-- Access controlled by USER TIER (not enrollment)
-- ========================================

-- 1. Trading Starter
INSERT INTO courses (id, title, description, thumbnail_url, instructor_name, instructor_avatar, duration_hours, total_lessons, tier_required, price, currency, is_published, shopify_product_id)
VALUES (
    'gem-trading-starter',
    'GEM Trading - Gói Starter',
    'Khóa học Trading cơ bản dành cho người mới bắt đầu. Nền tảng vững chắc để hiểu thị trường.',
    'https://cdn.shopify.com/s/files/1/0758/3877/0721/files/trading-starter.jpg',
    'Gemral',
    'https://ui-avatars.com/api/?name=GEM&background=6A5BFF&color=fff',
    10, 30, 'STARTER', 299000, 'VND', true, NULL
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tier_required = EXCLUDED.tier_required,
    price = EXCLUDED.price,
    is_published = true,
    updated_at = NOW();

-- 2. Trading Tier 1 - Nền Tảng Trader
INSERT INTO courses (id, title, description, thumbnail_url, instructor_name, instructor_avatar, duration_hours, total_lessons, tier_required, price, currency, is_published, shopify_product_id)
VALUES (
    'gem-trading-tier1',
    'GEM Trading - Gói 1: NỀN TẢNG TRADER',
    'Xây nền móng vững chắc - Phân tích kỹ thuật cơ bản, quản lý vốn, tâm lý giao dịch.',
    'https://cdn.shopify.com/s/files/1/0758/3877/0721/files/trading-tier1.jpg',
    'Gemral',
    'https://ui-avatars.com/api/?name=GEM&background=6A5BFF&color=fff',
    30, 60, 'TIER1', 11000000, 'VND', true, NULL
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tier_required = EXCLUDED.tier_required,
    price = EXCLUDED.price,
    is_published = true,
    updated_at = NOW();

-- 3. Trading Tier 2 - Tần Số Trader Thịnh Vượng
INSERT INTO courses (id, title, description, thumbnail_url, instructor_name, instructor_avatar, duration_hours, total_lessons, tier_required, price, currency, is_published, shopify_product_id)
VALUES (
    'gem-trading-tier2',
    'GEM Trading - Gói 2: TẦN SỐ TRADER THỊNH VƯỢNG',
    'Chiến lược nâng cao - Smart Money Concept, Order Flow, Institutional Trading. BEST VALUE!',
    'https://cdn.shopify.com/s/files/1/0758/3877/0721/files/trading-tier2.jpg',
    'Gemral',
    'https://ui-avatars.com/api/?name=GEM&background=6A5BFF&color=fff',
    50, 100, 'TIER2', 21000000, 'VND', true, NULL
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tier_required = EXCLUDED.tier_required,
    price = EXCLUDED.price,
    is_published = true,
    updated_at = NOW();

-- 4. Trading Tier 3 - Elite VIP
INSERT INTO courses (id, title, description, thumbnail_url, instructor_name, instructor_avatar, duration_hours, total_lessons, tier_required, price, currency, is_published, shopify_product_id)
VALUES (
    'gem-trading-tier3',
    'GEM Trading - Gói 3: ELITE VIP',
    'VIP 1:1 Coaching - Mentorship trực tiếp, Private Group, Lifetime Access, Signal Premium.',
    'https://cdn.shopify.com/s/files/1/0758/3877/0721/files/trading-tier3.jpg',
    'Gemral',
    'https://ui-avatars.com/api/?name=GEM&background=6A5BFF&color=fff',
    100, 200, 'TIER3', 68000000, 'VND', true, NULL
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tier_required = EXCLUDED.tier_required,
    price = EXCLUDED.price,
    is_published = true,
    updated_at = NOW();

-- ========================================
-- MINDSET/SPIRITUAL COURSES (3)
-- Access controlled by ENROLLMENT (purchase required)
-- ========================================

-- 5. Khóa 7 Ngày Khai Mở Tần Số Gốc
INSERT INTO courses (id, title, description, thumbnail_url, instructor_name, instructor_avatar, duration_hours, total_lessons, tier_required, price, currency, is_published, shopify_product_id)
VALUES (
    'khoa-7-ngay-khai-mo-tan-so-goc',
    'Khóa học 7 NGÀY KHAI MỞ TẦN SỐ GỐC',
    'Hành trình 7 ngày chuyển hóa năng lượng - Khai mở tần số gốc, kết nối bản thể.',
    'https://cdn.shopify.com/s/files/1/0758/3877/0721/files/tan-so-goc-course.jpg',
    'Gemral',
    'https://ui-avatars.com/api/?name=GEM&background=6A5BFF&color=fff',
    7, 21, 'FREE', 1990000, 'VND', true, '8904651342001'
) ON CONFLICT (id) DO UPDATE SET
    shopify_product_id = EXCLUDED.shopify_product_id,
    is_published = true,
    updated_at = NOW();

-- 6. Khóa Kích Hoạt Tần Số Tình Yêu
INSERT INTO courses (id, title, description, thumbnail_url, instructor_name, instructor_avatar, duration_hours, total_lessons, tier_required, price, currency, is_published, shopify_product_id)
VALUES (
    'khoa-kich-hoat-tan-so-tinh-yeu',
    'Khóa học KÍCH HOẠT TẦN SỐ TÌNH YÊU',
    'Chiêu cảm tình duyên - Kích hoạt năng lượng tình yêu, thu hút mối quan hệ lành mạnh.',
    'https://cdn.shopify.com/s/files/1/0758/3877/0721/files/tinh-yeu-course.jpg',
    'Gemral',
    'https://ui-avatars.com/api/?name=GEM&background=6A5BFF&color=fff',
    5, 15, 'FREE', 399000, 'VND', true, '8904653111473'
) ON CONFLICT (id) DO UPDATE SET
    shopify_product_id = EXCLUDED.shopify_product_id,
    is_published = true,
    updated_at = NOW();

-- 7. Khóa Tái Tạo Tư Duy Triệu Phú
INSERT INTO courses (id, title, description, thumbnail_url, instructor_name, instructor_avatar, duration_hours, total_lessons, tier_required, price, currency, is_published, shopify_product_id)
VALUES (
    'khoa-tai-tao-tu-duy-trieu-phu',
    'Khóa học TÁI TẠO TƯ DUY TRIỆU PHÚ',
    'Chuyển hóa tư duy về tiền bạc - Tái lập trình niềm tin, thu hút thịnh vượng.',
    'https://cdn.shopify.com/s/files/1/0758/3877/0721/files/trieu-phu-course.jpg',
    'Gemral',
    'https://ui-avatars.com/api/?name=GEM&background=6A5BFF&color=fff',
    5, 15, 'FREE', 499000, 'VND', true, '8904656257201'
) ON CONFLICT (id) DO UPDATE SET
    shopify_product_id = EXCLUDED.shopify_product_id,
    is_published = true,
    updated_at = NOW();

-- ========================================
-- FUNCTIONS
-- ========================================

-- Grant course access function
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
BEGIN
    INSERT INTO course_enrollments (user_id, course_id, enrolled_at, progress_percentage, is_active, access_source)
    VALUES (user_id_param, course_id_param, NOW(), 0, true, access_source_param)
    ON CONFLICT (user_id, course_id) DO UPDATE SET
        is_active = true,
        access_source = COALESCE(EXCLUDED.access_source, course_enrollments.access_source),
        last_accessed_at = NOW()
    RETURNING id INTO enrollment_id;
    RETURN enrollment_id;
END;
$$;

-- Check course access function
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
        CASE WHEN ce.id IS NOT NULL AND ce.is_active = true THEN true ELSE false END AS has_access,
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

-- ========================================
-- VERIFY SETUP
-- ========================================
SELECT
    id,
    title,
    tier_required,
    price,
    shopify_product_id,
    is_published
FROM courses
WHERE is_published = true
ORDER BY
    CASE tier_required
        WHEN 'STARTER' THEN 1
        WHEN 'TIER1' THEN 2
        WHEN 'TIER2' THEN 3
        WHEN 'TIER3' THEN 4
        ELSE 5
    END,
    price;

-- ========================================
-- NOTES:
-- Trading courses (STARTER, TIER1, TIER2, TIER3):
--   - Access controlled by USER TIER in profiles table
--   - When user buys Trading course, webhook sets their course_tier
--   - App checks user tier vs course tier_required
--
-- Mindset courses (FREE tier_required but has price):
--   - Access controlled by ENROLLMENT (course_enrollments table)
--   - When user buys, webhook creates enrollment record
--   - User can only access if enrolled
--
-- Shopify Product IDs (for mindset courses):
--   - 8904651342001 = 7 Ngày Khai Mở Tần Số Gốc
--   - 8904653111473 = Kích Hoạt Tần Số Tình Yêu
--   - 8904656257201 = Tái Tạo Tư Duy Triệu Phú
-- ========================================
