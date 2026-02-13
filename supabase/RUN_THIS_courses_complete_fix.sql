-- =====================================================
-- COMPLETE COURSES PAGE DATABASE FIX
-- Run this in Supabase SQL Editor
-- Created: 2026-02-06
-- Fixes: promo_banners, course_flash_sales, course_highlights, RPC functions
-- =====================================================

-- =====================================================
-- 1. PROMO BANNERS TABLE (Hero Banner Carousel)
-- =====================================================
CREATE TABLE IF NOT EXISTS promo_banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  subtitle TEXT,
  image_url TEXT,
  bg_color VARCHAR(20) DEFAULT '#1A1B3A',
  text_color VARCHAR(20) DEFAULT '#FFFFFF',
  cta_text VARCHAR(50) DEFAULT 'Xem ngay',
  cta_color VARCHAR(20) DEFAULT '#FFBD59',
  action_type VARCHAR(20) NOT NULL DEFAULT 'none',
  action_value TEXT,
  target_tier VARCHAR(20),
  target_screens TEXT[] DEFAULT '{courses}',
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ensure image_url allows NULL
ALTER TABLE promo_banners ALTER COLUMN image_url DROP NOT NULL;

-- Index
CREATE INDEX IF NOT EXISTS idx_promo_banners_active
ON promo_banners(is_active, sort_order);

-- RLS
ALTER TABLE promo_banners ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "promo_banners_public_read" ON promo_banners;
CREATE POLICY "promo_banners_public_read" ON promo_banners
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "promo_banners_admin_all" ON promo_banners;
CREATE POLICY "promo_banners_admin_all" ON promo_banners
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- =====================================================
-- 2. COURSE FLASH SALES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS course_flash_sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL DEFAULT 'Flash Sale',
  subtitle TEXT,
  course_ids UUID[] NOT NULL DEFAULT '{}',
  discount_percentage INTEGER NOT NULL DEFAULT 30,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  background_color VARCHAR(20) DEFAULT '#9C0612',
  text_color VARCHAR(20) DEFAULT '#FFFFFF',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT valid_discount CHECK (discount_percentage > 0 AND discount_percentage <= 100),
  CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_course_flash_sales_active
ON course_flash_sales(is_active, start_time, end_time);

-- RLS
ALTER TABLE course_flash_sales ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "course_flash_sales_public_read" ON course_flash_sales;
CREATE POLICY "course_flash_sales_public_read" ON course_flash_sales
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "course_flash_sales_admin_all" ON course_flash_sales;
CREATE POLICY "course_flash_sales_admin_all" ON course_flash_sales
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- =====================================================
-- 3. COURSE HIGHLIGHTS TABLE (Featured Course Section)
-- =====================================================
CREATE TABLE IF NOT EXISTS course_highlights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id TEXT REFERENCES courses(id) ON DELETE CASCADE,
  custom_title TEXT,
  custom_subtitle TEXT,
  custom_description TEXT,
  custom_image_url TEXT,
  badge_text VARCHAR(50) DEFAULT 'Nổi bật',
  badge_color VARCHAR(20) DEFAULT 'gold',
  cta_text VARCHAR(50) DEFAULT 'Xem chi tiết',
  cta_color VARCHAR(20) DEFAULT 'gold',
  is_active BOOLEAN DEFAULT true,
  display_order INT DEFAULT 0,
  show_price BOOLEAN DEFAULT true,
  show_students BOOLEAN DEFAULT true,
  show_rating BOOLEAN DEFAULT true,
  show_lessons BOOLEAN DEFAULT true,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_course_highlights_active ON course_highlights(is_active, display_order);
CREATE INDEX IF NOT EXISTS idx_course_highlights_schedule ON course_highlights(start_date, end_date) WHERE is_active = true;

-- RLS
ALTER TABLE course_highlights ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read active highlights" ON course_highlights;
CREATE POLICY "Anyone can read active highlights"
  ON course_highlights FOR SELECT
  USING (
    is_active = true
    AND (start_date IS NULL OR start_date <= NOW())
    AND (end_date IS NULL OR end_date >= NOW())
  );

DROP POLICY IF EXISTS "Admins can manage highlights" ON course_highlights;
CREATE POLICY "Admins can manage highlights"
  ON course_highlights FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- =====================================================
-- 4. PROMO BAR CONFIG TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS promo_bar_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message TEXT NOT NULL,
  voucher_code VARCHAR(50),
  link_text VARCHAR(100),
  link_url TEXT,
  background_color VARCHAR(20) DEFAULT '#9C0612',
  text_color VARCHAR(20) DEFAULT '#FFFFFF',
  target_screens TEXT[] DEFAULT '{}',
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_promo_bar_config_active
ON promo_bar_config(is_active, display_order);

-- RLS
ALTER TABLE promo_bar_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "promo_bar_config_public_read" ON promo_bar_config;
CREATE POLICY "promo_bar_config_public_read" ON promo_bar_config
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "promo_bar_config_admin_all" ON promo_bar_config;
CREATE POLICY "promo_bar_config_admin_all" ON promo_bar_config
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- =====================================================
-- 5. RPC FUNCTION: get_highlighted_course
-- Fixed for correct column names in courses table
-- =====================================================
DROP FUNCTION IF EXISTS get_highlighted_course();

CREATE OR REPLACE FUNCTION get_highlighted_course()
RETURNS TABLE (
  highlight_id UUID,
  course_id TEXT,
  custom_title TEXT,
  custom_subtitle TEXT,
  custom_description TEXT,
  custom_image_url TEXT,
  badge_text VARCHAR(50),
  badge_color VARCHAR(20),
  cta_text VARCHAR(50),
  cta_color VARCHAR(20),
  show_price BOOLEAN,
  show_students BOOLEAN,
  show_rating BOOLEAN,
  show_lessons BOOLEAN,
  course_title TEXT,
  course_description TEXT,
  course_thumbnail TEXT,
  course_price DECIMAL,
  course_is_free BOOLEAN,
  course_tier VARCHAR(50),
  course_level VARCHAR(50),
  course_duration_hours INT,
  course_lesson_count INT,
  course_student_count INT,
  course_rating DECIMAL,
  course_instructor TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    h.id as highlight_id,
    h.course_id,
    h.custom_title,
    h.custom_subtitle,
    h.custom_description,
    h.custom_image_url,
    h.badge_text,
    h.badge_color,
    h.cta_text,
    h.cta_color,
    h.show_price,
    h.show_students,
    h.show_rating,
    h.show_lessons,
    c.title as course_title,
    c.description as course_description,
    c.thumbnail_url as course_thumbnail,
    c.price as course_price,
    (COALESCE(c.price, 0) = 0) as course_is_free,
    c.tier_required::VARCHAR(50) as course_tier,
    COALESCE(c.difficulty_level, 'beginner')::VARCHAR(50) as course_level,
    COALESCE(c.duration_hours, 0)::INT as course_duration_hours,
    (SELECT COUNT(*)::INT FROM course_lessons cl
     JOIN course_modules cm ON cl.module_id = cm.id
     WHERE cm.course_id = c.id) as course_lesson_count,
    COALESCE(c.students_count, 0) as course_student_count,
    COALESCE(c.rating, 0) as course_rating,
    COALESCE(c.instructor_name, 'Gemral') as course_instructor
  FROM course_highlights h
  JOIN courses c ON h.course_id = c.id
  WHERE h.is_active = true
    AND c.is_published = true
    AND (h.start_date IS NULL OR h.start_date <= NOW())
    AND (h.end_date IS NULL OR h.end_date >= NOW())
  ORDER BY h.display_order ASC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 6. UPDATED_AT TRIGGERS
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Promo banners trigger
DROP TRIGGER IF EXISTS trigger_promo_banners_updated_at ON promo_banners;
CREATE TRIGGER trigger_promo_banners_updated_at
BEFORE UPDATE ON promo_banners
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Flash sales trigger
DROP TRIGGER IF EXISTS trigger_course_flash_sales_updated_at ON course_flash_sales;
CREATE TRIGGER trigger_course_flash_sales_updated_at
BEFORE UPDATE ON course_flash_sales
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Highlights trigger
DROP TRIGGER IF EXISTS update_course_highlights_updated_at ON course_highlights;
CREATE TRIGGER update_course_highlights_updated_at
BEFORE UPDATE ON course_highlights
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Promo bar trigger
DROP TRIGGER IF EXISTS trigger_promo_bar_config_updated_at ON promo_bar_config;
CREATE TRIGGER trigger_promo_bar_config_updated_at
BEFORE UPDATE ON promo_bar_config
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 7. INSERT SAMPLE DATA
-- =====================================================

-- Clear existing sample data and insert fresh
DELETE FROM promo_banners WHERE title IN ('Khóa học Trading mới', 'Ưu đãi cuối năm', 'Khóa học Tư duy');

INSERT INTO promo_banners (title, subtitle, image_url, action_type, action_value, cta_text, cta_color, sort_order, is_active)
VALUES
  (
    'Khóa học Trading mới',
    'Học giao dịch từ chuyên gia hàng đầu',
    'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80',
    'category',
    'trading',
    'Khám phá ngay',
    '#FFBD59',
    1,
    true
  ),
  (
    'Khóa học Tư duy',
    'Nâng cấp tư duy - Thay đổi cuộc đời',
    'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&q=80',
    'category',
    'mindset',
    'Tìm hiểu thêm',
    '#FFBD59',
    2,
    true
  ),
  (
    'Ưu đãi đặc biệt',
    'Giảm đến 50% tất cả khóa học',
    'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=800&q=80',
    'screen',
    'CourseList',
    'Xem ngay',
    '#FFBD59',
    3,
    true
  );

-- Insert promo bar if not exists
INSERT INTO promo_bar_config (message, voucher_code, link_text, link_url, is_active)
SELECT 'Giảm 20% cho đơn hàng đầu tiên! Dùng mã:', 'WELCOME20', 'Mua ngay', 'gem://Shop', true
WHERE NOT EXISTS (SELECT 1 FROM promo_bar_config WHERE voucher_code = 'WELCOME20');

-- Insert highlighted course if courses exist
DO $$
DECLARE
  sample_course_id TEXT;
BEGIN
  -- Check if course_highlights is empty
  IF NOT EXISTS (SELECT 1 FROM course_highlights WHERE is_active = true) THEN
    -- Get the first published course
    SELECT id INTO sample_course_id
    FROM courses
    WHERE is_published = true
    ORDER BY students_count DESC NULLS LAST
    LIMIT 1;

    IF sample_course_id IS NOT NULL THEN
      INSERT INTO course_highlights (
        course_id,
        custom_subtitle,
        badge_text,
        is_active,
        show_price,
        show_students,
        show_rating,
        show_lessons
      ) VALUES (
        sample_course_id,
        'Khóa học được yêu thích nhất - Dành cho bạn!',
        'Nổi bật',
        true,
        true,
        true,
        true,
        true
      );
      RAISE NOTICE 'Inserted highlighted course: %', sample_course_id;
    ELSE
      RAISE NOTICE 'No published courses found for highlighting';
    END IF;
  ELSE
    RAISE NOTICE 'Course highlights already has active entries';
  END IF;
END $$;

-- =====================================================
-- 8. VERIFICATION
-- =====================================================
DO $$
DECLARE
  banner_count INT;
  highlight_count INT;
BEGIN
  SELECT COUNT(*) INTO banner_count FROM promo_banners WHERE is_active = true;
  SELECT COUNT(*) INTO highlight_count FROM course_highlights WHERE is_active = true;

  RAISE NOTICE '========================================';
  RAISE NOTICE 'VERIFICATION COMPLETE';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Active promo banners: %', banner_count;
  RAISE NOTICE 'Active course highlights: %', highlight_count;
  RAISE NOTICE '========================================';
END $$;

-- Final check - show all active banners
SELECT id, title, subtitle, image_url, action_type, is_active
FROM promo_banners
WHERE is_active = true
ORDER BY sort_order;
