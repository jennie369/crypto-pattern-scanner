-- =====================================================
-- COMPLETE COURSES PAGE SETUP
-- Run this in Supabase SQL Editor to enable all features
-- =====================================================

-- =====================================================
-- 1. PROMO BAR CONFIG TABLE
-- Dismissible promotional bar at top of pages
-- =====================================================
CREATE TABLE IF NOT EXISTS promo_bar_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message TEXT NOT NULL,
  voucher_code VARCHAR(50),
  link_text VARCHAR(100),
  link_url TEXT,

  -- Styling
  background_color VARCHAR(20) DEFAULT '#9C0612',
  text_color VARCHAR(20) DEFAULT '#FFFFFF',

  -- Targeting
  target_screens TEXT[] DEFAULT '{}', -- empty = all screens

  -- Scheduling
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,

  -- Display settings
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- 2. PROMO BANNERS TABLE (for HeroBannerCarousel)
-- =====================================================
CREATE TABLE IF NOT EXISTS promo_banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  subtitle TEXT,
  image_url TEXT, -- nullable for gradient-only banners
  bg_color VARCHAR(20) DEFAULT '#1A1B3A',
  text_color VARCHAR(20) DEFAULT '#FFFFFF',
  cta_text VARCHAR(50) DEFAULT 'Xem ngay',
  cta_color VARCHAR(20) DEFAULT '#FFBD59',

  -- Action configuration
  action_type VARCHAR(20) NOT NULL DEFAULT 'none',
  -- action_type: 'course', 'url', 'screen', 'category', 'none'
  action_value TEXT,

  -- Targeting
  target_tier VARCHAR(20), -- null = all tiers
  target_screens TEXT[] DEFAULT '{courses}',

  -- Scheduling
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,

  -- Display settings
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- 3. COURSE FLASH SALES TABLE
-- Note: course_ids uses TEXT[] since courses.id is text type
-- =====================================================
-- Drop if exists with wrong column type
DROP TABLE IF EXISTS course_flash_sales CASCADE;

CREATE TABLE IF NOT EXISTS course_flash_sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL DEFAULT 'Flash Sale',
  subtitle TEXT,
  course_ids TEXT[] NOT NULL DEFAULT '{}',
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

-- =====================================================
-- 4. ENABLE RLS
-- =====================================================
ALTER TABLE promo_bar_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_flash_sales ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 5. RLS POLICIES - Public read access
-- =====================================================
DROP POLICY IF EXISTS "promo_bar_config_public_read" ON promo_bar_config;
CREATE POLICY "promo_bar_config_public_read" ON promo_bar_config
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "promo_banners_public_read" ON promo_banners;
CREATE POLICY "promo_banners_public_read" ON promo_banners
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "course_flash_sales_public_read" ON course_flash_sales;
CREATE POLICY "course_flash_sales_public_read" ON course_flash_sales
  FOR SELECT USING (is_active = true);

-- =====================================================
-- 6. RLS POLICIES - Admin full access
-- =====================================================
DROP POLICY IF EXISTS "promo_bar_config_admin_all" ON promo_bar_config;
CREATE POLICY "promo_bar_config_admin_all" ON promo_bar_config
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

DROP POLICY IF EXISTS "promo_banners_admin_all" ON promo_banners;
CREATE POLICY "promo_banners_admin_all" ON promo_banners
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

DROP POLICY IF EXISTS "course_flash_sales_admin_all" ON course_flash_sales;
CREATE POLICY "course_flash_sales_admin_all" ON course_flash_sales
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- =====================================================
-- 7. INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_promo_bar_config_active ON promo_bar_config(is_active, display_order);
CREATE INDEX IF NOT EXISTS idx_promo_banners_active ON promo_banners(is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_course_flash_sales_active ON course_flash_sales(is_active, start_time, end_time);

-- =====================================================
-- 8. SEED DATA - Sample promo bar
-- =====================================================
INSERT INTO promo_bar_config (message, voucher_code, link_text, link_url, is_active)
VALUES
  ('Giảm 20% cho đơn hàng đầu tiên! Dùng mã:', 'WELCOME20', 'Mua ngay', 'gem://Shop', true)
ON CONFLICT DO NOTHING;

-- =====================================================
-- 9. SEED DATA - Sample promo banners (hero carousel)
-- =====================================================
INSERT INTO promo_banners (title, subtitle, image_url, action_type, action_value, cta_text, sort_order, is_active)
VALUES
  ('Khóa học Trading mới', 'Học giao dịch từ chuyên gia', 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800', 'category', 'trading', 'Khám phá ngay', 1, true),
  ('Ưu đãi cuối năm', 'Giảm đến 50% tất cả khóa học', 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=800', 'screen', 'CourseList', 'Xem ngay', 2, true),
  ('Học Tarot miễn phí', 'Bắt đầu hành trình tâm linh', 'https://images.unsplash.com/photo-1617791160505-6f00504e3519?w=800', 'category', 'tarot', 'Học ngay', 3, true)
ON CONFLICT DO NOTHING;

-- =====================================================
-- 10. SEED DATA - Sample flash sale (7 days from now)
-- =====================================================
INSERT INTO course_flash_sales (
  title,
  subtitle,
  course_ids,
  discount_percentage,
  start_time,
  end_time,
  is_active
)
SELECT
  'Flash Sale Cuối Năm',
  'Giảm giá đặc biệt cho các khóa học trading',
  ARRAY(SELECT id FROM courses WHERE is_published = true LIMIT 5),
  30,
  NOW(),
  NOW() + INTERVAL '7 days',
  true
WHERE EXISTS (SELECT 1 FROM courses WHERE is_published = true LIMIT 1)
ON CONFLICT DO NOTHING;

-- =====================================================
-- DONE - Verify data
-- =====================================================
SELECT 'promo_bar_config' as table_name, COUNT(*) as count FROM promo_bar_config WHERE is_active = true
UNION ALL
SELECT 'promo_banners', COUNT(*) FROM promo_banners WHERE is_active = true
UNION ALL
SELECT 'course_flash_sales', COUNT(*) FROM course_flash_sales WHERE is_active = true;

COMMENT ON TABLE promo_bar_config IS 'Dismissible promo bar configuration';
COMMENT ON TABLE promo_banners IS 'Hero banner carousel items for course page';
COMMENT ON TABLE course_flash_sales IS 'Flash sale campaigns for courses with countdown timer';
