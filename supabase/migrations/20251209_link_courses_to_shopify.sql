-- =============================================
-- LINK COURSES TO SHOPIFY PRODUCTS
-- Migration: 20251209_link_courses_to_shopify.sql
--
-- This migration creates courses and links them to Shopify Product IDs
-- so that when users purchase on Shopify, they automatically get access
-- =============================================

-- =============================================
-- 1. TRADING COURSES (Main Tiers - Most Important)
-- =============================================

-- GEM Trading Academy - Gói 1 (TIER 1) - Shopify Product ID: 8863027921073
-- Price: ₫11,000,000
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
    shopify_product_id,
    price,
    rating,
    students_count,
    is_published
) VALUES (
    'course-tier1-trading',
    'GEM Trading Academy - Gói 1',
    'Khóa học Trading nâng cao Tier 1. Bao gồm: Scanner Pro, Pattern Recognition, Risk Management cơ bản, và hỗ trợ cộng đồng.',
    'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800',
    'Gemral',
    'https://ui-avatars.com/api/?name=Gemral&background=6A5BFF&color=fff&size=200',
    30,
    45,
    NULL,
    '8863027921073',
    11000000,
    4.9,
    520,
    true
) ON CONFLICT (id) DO UPDATE SET
    shopify_product_id = '8863027921073',
    price = 11000000,
    tier_required = NULL;

-- GEM Trading Academy - Gói 2 (TIER 2) - Shopify Product ID: 8863031066801
-- Price: ₫21,000,000
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
    shopify_product_id,
    price,
    rating,
    students_count,
    is_published
) VALUES (
    'course-tier2-trading',
    'GEM Trading Academy - Gói 2',
    'Khóa học Trading chuyên sâu Tier 2. Bao gồm tất cả Tier 1 + Advanced Pattern Analysis, Multi-Timeframe Scanner, AI Chatbot, và Mentoring 1-1.',
    'https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=800',
    'Gemral',
    'https://ui-avatars.com/api/?name=Gemral&background=FFBD59&color=1a0b2e&size=200',
    50,
    72,
    NULL,
    '8863031066801',
    21000000,
    4.9,
    280,
    true
) ON CONFLICT (id) DO UPDATE SET
    shopify_product_id = '8863031066801',
    price = 21000000,
    tier_required = NULL;

-- GEM Trading Academy - Gói 3 (TIER 3) - Shopify Product ID: 8863031460017
-- Price: ₫68,000,000
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
    shopify_product_id,
    price,
    rating,
    students_count,
    is_published
) VALUES (
    'course-tier3-trading',
    'GEM Trading Academy - Gói 3',
    'Khóa học Trading VIP Tier 3. Bao gồm tất cả Tier 2 + Private Signals, Portfolio Management, Lifetime Access, và Direct Mentoring với Gemral.',
    'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800',
    'Gemral',
    'https://ui-avatars.com/api/?name=Gemral&background=3AF7A6&color=1a0b2e&size=200',
    80,
    120,
    NULL,
    '8863031460017',
    68000000,
    5.0,
    85,
    true
) ON CONFLICT (id) DO UPDATE SET
    shopify_product_id = '8863031460017',
    price = 68000000,
    tier_required = NULL;

-- Trading Tier Starter (Entry level) - Shopify Product ID: 8904646820017
-- Price: ₫299,000
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
    shopify_product_id,
    price,
    rating,
    students_count,
    is_published
) VALUES (
    'course-tier-starter',
    'Trading Tier Starter',
    'Khóa học Trading cơ bản dành cho người mới bắt đầu. Học các kiến thức nền tảng về thị trường crypto, cách đọc biểu đồ, và chiến lược giao dịch an toàn.',
    'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800',
    'Gemral',
    'https://ui-avatars.com/api/?name=Gemral&background=6A5BFF&color=fff&size=200',
    15,
    20,
    NULL,
    '8904646820017',
    299000,
    4.8,
    350,
    true
) ON CONFLICT (id) DO UPDATE SET
    shopify_product_id = '8904646820017',
    price = 299000,
    tier_required = NULL;

-- =============================================
-- 2. TƯ DUY (MINDSET) COURSES
-- =============================================

-- 7 Ngày Khai Mở Tần Số Gốc - Shopify Product ID: 8904651342001
-- Price: ₫1,990,000
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
    shopify_product_id,
    price,
    rating,
    students_count,
    is_published
) VALUES (
    'course-7-ngay-khai-mo',
    '7 Ngày Khai Mở Tần Số Gốc',
    'Hành trình 7 ngày khai mở tần số gốc, giúp bạn kết nối sâu hơn với bản thân và vũ trụ. Mỗi ngày là một bài học về thiền định, năng lượng, và sự tự nhận thức.',
    'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800',
    'Gemral',
    'https://ui-avatars.com/api/?name=Gemral&background=9B59B6&color=fff&size=200',
    7,
    14,
    NULL,
    '8904651342001',
    1990000,
    4.9,
    280,
    true
) ON CONFLICT (id) DO UPDATE SET
    shopify_product_id = '8904651342001',
    price = 1990000,
    tier_required = NULL;

-- Kích Hoạt Tần Số Tình Yêu - Shopify Product ID: 8904653111473
-- Price: ₫399,000
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
    shopify_product_id,
    price,
    rating,
    students_count,
    is_published
) VALUES (
    'course-tan-so-tinh-yeu',
    'Kích Hoạt Tần Số Tình Yêu',
    'Khóa học giúp bạn kích hoạt và cân bằng năng lượng tình yêu trong cuộc sống. Học cách yêu thương bản thân và thu hút những mối quan hệ tích cực.',
    'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=800',
    'Gemral',
    'https://ui-avatars.com/api/?name=Gemral&background=E74C3C&color=fff&size=200',
    10,
    18,
    NULL,
    '8904653111473',
    399000,
    4.9,
    195,
    true
) ON CONFLICT (id) DO UPDATE SET
    shopify_product_id = '8904653111473',
    price = 399000,
    tier_required = NULL;

-- Tái Tạo Tư Duy Triệu Phú - Shopify Product ID: 8904656257201
-- Price: ₫499,000
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
    shopify_product_id,
    price,
    rating,
    students_count,
    is_published
) VALUES (
    'course-tu-duy-trieu-phu',
    'Tái Tạo Tư Duy Triệu Phú',
    'Thay đổi tư duy về tiền bạc và thành công. Khóa học này giúp bạn xây dựng mindset của người giàu có và thu hút sự thịnh vượng vào cuộc sống.',
    'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800',
    'Gemral',
    'https://ui-avatars.com/api/?name=Gemral&background=F1C40F&color=1a0b2e&size=200',
    12,
    24,
    NULL,
    '8904656257201',
    499000,
    4.8,
    420,
    true
) ON CONFLICT (id) DO UPDATE SET
    shopify_product_id = '8904656257201',
    price = 499000,
    tier_required = NULL;

-- =============================================
-- 3. UPDATE EXISTING COURSE IF EXISTS
-- In case courses already exist with different IDs, link them by title
-- =============================================

-- Link by title match (backup method)
UPDATE courses SET shopify_product_id = '8904646820017', tier_required = NULL
WHERE (title ILIKE '%tier starter%' OR title ILIKE '%trading starter%')
AND shopify_product_id IS NULL;

UPDATE courses SET shopify_product_id = '8904651342001', tier_required = NULL
WHERE (title ILIKE '%7 ngày%' OR title ILIKE '%khai mở%' OR title ILIKE '%tần số gốc%')
AND shopify_product_id IS NULL;

UPDATE courses SET shopify_product_id = '8904653111473', tier_required = NULL
WHERE (title ILIKE '%tình yêu%' OR title ILIKE '%tần số tình%')
AND shopify_product_id IS NULL;

UPDATE courses SET shopify_product_id = '8904656257201', tier_required = NULL
WHERE (title ILIKE '%triệu phú%' OR title ILIKE '%tư duy triệu%')
AND shopify_product_id IS NULL;

-- =============================================
-- 4. VERIFY: Show all courses with their Shopify Product IDs
-- =============================================
-- Run this query to verify:
-- SELECT id, title, shopify_product_id, tier_required, price FROM courses ORDER BY created_at;

-- =============================================
-- SHOPIFY PRODUCT ID MAPPING SUMMARY (CHÍNH XÁC):
-- =============================================
-- TRADING COURSES (Main - Most Important):
-- course-tier1-trading    -> 8863027921073 (GEM Trading Academy - Gói 1) ₫11,000,000
-- course-tier2-trading    -> 8863031066801 (GEM Trading Academy - Gói 2) ₫21,000,000
-- course-tier3-trading    -> 8863031460017 (GEM Trading Academy - Gói 3) ₫68,000,000
-- course-tier-starter     -> 8904646820017 (Trading Tier Starter)        ₫299,000
--
-- TƯ DUY (MINDSET) COURSES:
-- course-7-ngay-khai-mo   -> 8904651342001 (7 Ngày Khai Mở Tần Số Gốc)   ₫1,990,000
-- course-tan-so-tinh-yeu  -> 8904653111473 (Kích Hoạt Tần Số Tình Yêu)   ₫399,000
-- course-tu-duy-trieu-phu -> 8904656257201 (Tái Tạo Tư Duy Triệu Phú)    ₫499,000
-- =============================================
