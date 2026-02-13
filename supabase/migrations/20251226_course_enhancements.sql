-- =====================================================
-- Course Page Enhancements Migration
-- Flash sales, promo banners, promo bar config
-- =====================================================

-- =====================================================
-- 1. COURSE FLASH SALES TABLE
-- For time-limited course discounts with countdown
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

-- Index for active flash sales query
CREATE INDEX IF NOT EXISTS idx_course_flash_sales_active
ON course_flash_sales(is_active, start_time, end_time);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_course_flash_sales_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_course_flash_sales_updated_at ON course_flash_sales;
CREATE TRIGGER trigger_course_flash_sales_updated_at
BEFORE UPDATE ON course_flash_sales
FOR EACH ROW EXECUTE FUNCTION update_course_flash_sales_updated_at();

-- =====================================================
-- 2. PROMO BANNERS TABLE (for HeroBannerCarousel)
-- Promotional banners shown on courses page
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

-- Index for active banners query
CREATE INDEX IF NOT EXISTS idx_promo_banners_active
ON promo_banners(is_active, sort_order);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_promo_banners_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_promo_banners_updated_at ON promo_banners;
CREATE TRIGGER trigger_promo_banners_updated_at
BEFORE UPDATE ON promo_banners
FOR EACH ROW EXECUTE FUNCTION update_promo_banners_updated_at();

-- =====================================================
-- 3. PROMO BAR CONFIG TABLE
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

-- Index for active promo bar query
CREATE INDEX IF NOT EXISTS idx_promo_bar_config_active
ON promo_bar_config(is_active, display_order);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_promo_bar_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_promo_bar_config_updated_at ON promo_bar_config;
CREATE TRIGGER trigger_promo_bar_config_updated_at
BEFORE UPDATE ON promo_bar_config
FOR EACH ROW EXECUTE FUNCTION update_promo_bar_config_updated_at();

-- =====================================================
-- 4. RLS POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE course_flash_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_bar_config ENABLE ROW LEVEL SECURITY;

-- Public read access for active items
DROP POLICY IF EXISTS "course_flash_sales_public_read" ON course_flash_sales;
CREATE POLICY "course_flash_sales_public_read" ON course_flash_sales
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "promo_banners_public_read" ON promo_banners;
CREATE POLICY "promo_banners_public_read" ON promo_banners
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "promo_bar_config_public_read" ON promo_bar_config;
CREATE POLICY "promo_bar_config_public_read" ON promo_bar_config
  FOR SELECT USING (is_active = true);

-- Admin full access
DROP POLICY IF EXISTS "course_flash_sales_admin_all" ON course_flash_sales;
CREATE POLICY "course_flash_sales_admin_all" ON course_flash_sales
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

DROP POLICY IF EXISTS "promo_banners_admin_all" ON promo_banners;
CREATE POLICY "promo_banners_admin_all" ON promo_banners
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

DROP POLICY IF EXISTS "promo_bar_config_admin_all" ON promo_bar_config;
CREATE POLICY "promo_bar_config_admin_all" ON promo_bar_config
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- =====================================================
-- 5. SEED DATA (Optional sample banners)
-- =====================================================
INSERT INTO promo_banners (title, subtitle, action_type, action_value, cta_text, sort_order, is_active)
VALUES
  ('Khóa học Trading mới', 'Học giao dịch từ chuyên gia', 'category', 'trading', 'Khám phá ngay', 1, true),
  ('Ưu đãi cuối năm', 'Giảm đến 50% tất cả khóa học', 'screen', 'CourseList', 'Xem ngay', 2, true)
ON CONFLICT DO NOTHING;

INSERT INTO promo_bar_config (message, voucher_code, link_text, link_url, is_active)
VALUES
  ('Giảm 20% cho đơn hàng đầu tiên! Dùng mã:', 'WELCOME20', 'Mua ngay', 'gem://Shop', true)
ON CONFLICT DO NOTHING;

-- =====================================================
-- DONE
-- =====================================================
COMMENT ON TABLE course_flash_sales IS 'Flash sale campaigns for courses with countdown timer';
COMMENT ON TABLE promo_banners IS 'Hero banner carousel items for course page';
COMMENT ON TABLE promo_bar_config IS 'Dismissible promo bar configuration';
