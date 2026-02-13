-- =====================================================
-- ADMIN MISSING TABLES - Comprehensive Migration
-- Creates all missing tables for Admin Dashboard
-- Run this in Supabase Dashboard SQL Editor
-- =====================================================

-- =====================================================
-- 1. COURSE HIGHLIGHTS TABLE
-- For featured course section on Courses screen
-- =====================================================
CREATE TABLE IF NOT EXISTS course_highlights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,

  -- Custom display overrides
  custom_title TEXT,
  custom_subtitle TEXT,
  custom_description TEXT,
  custom_image_url TEXT,

  -- Badge configuration
  badge_text VARCHAR(50) DEFAULT 'Nổi bật',
  badge_color VARCHAR(20) DEFAULT 'gold', -- 'gold', 'purple', 'cyan', 'green', 'red'

  -- CTA button
  cta_text VARCHAR(50) DEFAULT 'Xem chi tiết',

  -- Display settings
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,

  -- Show/hide toggles
  show_price BOOLEAN DEFAULT true,
  show_students BOOLEAN DEFAULT true,
  show_rating BOOLEAN DEFAULT true,
  show_lessons BOOLEAN DEFAULT true,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_course_highlights_active
  ON course_highlights(is_active, display_order);
CREATE INDEX IF NOT EXISTS idx_course_highlights_course
  ON course_highlights(course_id);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_course_highlights_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_course_highlights_updated_at ON course_highlights;
CREATE TRIGGER trigger_course_highlights_updated_at
  BEFORE UPDATE ON course_highlights
  FOR EACH ROW EXECUTE FUNCTION update_course_highlights_updated_at();

-- RLS
ALTER TABLE course_highlights ENABLE ROW LEVEL SECURITY;

-- Public can view active highlights
DROP POLICY IF EXISTS "Anyone can view active course highlights" ON course_highlights;
CREATE POLICY "Anyone can view active course highlights" ON course_highlights
  FOR SELECT USING (is_active = true);

-- Admins can manage highlights
DROP POLICY IF EXISTS "Admins can manage course highlights" ON course_highlights;
CREATE POLICY "Admins can manage course highlights" ON course_highlights
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role IN ('admin', 'super_admin') OR profiles.is_admin = TRUE)
    )
  );

-- Grant permissions
GRANT SELECT ON course_highlights TO anon;
GRANT ALL ON course_highlights TO authenticated;

-- =====================================================
-- 2. SHOP BANNERS TABLE (if not exists)
-- =====================================================
CREATE TABLE IF NOT EXISTS shop_banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT,
  subtitle TEXT,
  description TEXT,
  image_url TEXT,
  link_type TEXT DEFAULT 'none',  -- 'none', 'product', 'collection', 'url', 'screen'
  link_value TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  background_color TEXT DEFAULT '#1a0b2e',
  text_color TEXT DEFAULT '#FFFFFF',
  created_by UUID REFERENCES profiles(id),
  view_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_shop_banners_active ON shop_banners(is_active, display_order);
CREATE INDEX IF NOT EXISTS idx_shop_banners_dates ON shop_banners(start_date, end_date);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_shop_banners_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_shop_banners_updated_at ON shop_banners;
CREATE TRIGGER trigger_shop_banners_updated_at
  BEFORE UPDATE ON shop_banners
  FOR EACH ROW EXECUTE FUNCTION update_shop_banners_updated_at();

-- RLS
ALTER TABLE shop_banners ENABLE ROW LEVEL SECURITY;

-- Anyone can view active banners
DROP POLICY IF EXISTS "Anyone can view active shop banners" ON shop_banners;
CREATE POLICY "Anyone can view active shop banners" ON shop_banners
  FOR SELECT USING (
    is_active = true
    AND (start_date IS NULL OR start_date <= NOW())
    AND (end_date IS NULL OR end_date >= NOW())
  );

-- Admins can view all banners
DROP POLICY IF EXISTS "Admins can view all shop banners" ON shop_banners;
CREATE POLICY "Admins can view all shop banners" ON shop_banners
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role IN ('admin', 'super_admin') OR profiles.is_admin = TRUE)
    )
  );

-- Admins can insert banners
DROP POLICY IF EXISTS "Admins can insert shop banners" ON shop_banners;
CREATE POLICY "Admins can insert shop banners" ON shop_banners
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role IN ('admin', 'super_admin') OR profiles.is_admin = TRUE)
    )
  );

-- Admins can update banners
DROP POLICY IF EXISTS "Admins can update shop banners" ON shop_banners;
CREATE POLICY "Admins can update shop banners" ON shop_banners
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role IN ('admin', 'super_admin') OR profiles.is_admin = TRUE)
    )
  );

-- Admins can delete banners
DROP POLICY IF EXISTS "Admins can delete shop banners" ON shop_banners;
CREATE POLICY "Admins can delete shop banners" ON shop_banners
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role IN ('admin', 'super_admin') OR profiles.is_admin = TRUE)
    )
  );

-- Grant permissions
GRANT SELECT ON shop_banners TO anon;
GRANT ALL ON shop_banners TO authenticated;

-- =====================================================
-- 3. PROMO BANNERS TABLE (for HeroBannerCarousel)
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
  action_type VARCHAR(20) NOT NULL DEFAULT 'none', -- 'course', 'url', 'screen', 'category', 'none'
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

-- Indexes
CREATE INDEX IF NOT EXISTS idx_promo_banners_active ON promo_banners(is_active, sort_order);

-- Trigger
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

-- RLS
ALTER TABLE promo_banners ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active promo banners" ON promo_banners;
CREATE POLICY "Anyone can view active promo banners" ON promo_banners
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Admins can manage promo banners" ON promo_banners;
CREATE POLICY "Admins can manage promo banners" ON promo_banners
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role IN ('admin', 'super_admin') OR profiles.is_admin = TRUE)
    )
  );

GRANT SELECT ON promo_banners TO anon;
GRANT ALL ON promo_banners TO authenticated;

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
CREATE INDEX IF NOT EXISTS idx_promo_bar_config_active ON promo_bar_config(is_active, display_order);

-- Trigger
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

-- RLS
ALTER TABLE promo_bar_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active promo bar" ON promo_bar_config;
CREATE POLICY "Anyone can view active promo bar" ON promo_bar_config
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Admins can manage promo bar" ON promo_bar_config;
CREATE POLICY "Admins can manage promo bar" ON promo_bar_config
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role IN ('admin', 'super_admin') OR profiles.is_admin = TRUE)
    )
  );

GRANT SELECT ON promo_bar_config TO anon;
GRANT ALL ON promo_bar_config TO authenticated;

-- =====================================================
-- 5. FEATURED PRODUCTS TABLE (for Shop featured section)
-- =====================================================
CREATE TABLE IF NOT EXISTS featured_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  price DECIMAL(15, 2),
  original_price DECIMAL(15, 2),
  currency VARCHAR(10) DEFAULT 'VND',
  image_url TEXT,
  badge_text VARCHAR(50),
  badge_color VARCHAR(20) DEFAULT '#FF4757',
  background_gradient_start VARCHAR(20) DEFAULT '#1a0b2e',
  background_gradient_end VARCHAR(20) DEFAULT '#2d1b4e',
  accent_color VARCHAR(20) DEFAULT '#FFD700',
  text_color VARCHAR(20) DEFAULT '#FFFFFF',
  link_type TEXT DEFAULT 'collection', -- 'product', 'collection', 'url', 'screen'
  link_value TEXT,
  cta_text VARCHAR(50) DEFAULT 'Xem ngay',
  layout_style VARCHAR(20) DEFAULT 'card', -- 'card', 'full', 'minimal'
  show_price BOOLEAN DEFAULT true,
  show_badge BOOLEAN DEFAULT true,
  show_description BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_featured_products_active ON featured_products(is_active, display_order);

-- Trigger
CREATE OR REPLACE FUNCTION update_featured_products_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_featured_products_updated_at ON featured_products;
CREATE TRIGGER trigger_featured_products_updated_at
  BEFORE UPDATE ON featured_products
  FOR EACH ROW EXECUTE FUNCTION update_featured_products_updated_at();

-- RLS
ALTER TABLE featured_products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active featured products" ON featured_products;
CREATE POLICY "Anyone can view active featured products" ON featured_products
  FOR SELECT USING (
    is_active = true
    AND (start_date IS NULL OR start_date <= NOW())
    AND (end_date IS NULL OR end_date >= NOW())
  );

DROP POLICY IF EXISTS "Admins can manage featured products" ON featured_products;
CREATE POLICY "Admins can manage featured products" ON featured_products
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role IN ('admin', 'super_admin') OR profiles.is_admin = TRUE)
    )
  );

GRANT SELECT ON featured_products TO anon;
GRANT ALL ON featured_products TO authenticated;

-- =====================================================
-- 6. ADMIN BANNER LOGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS admin_banner_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  banner_id UUID,
  banner_type VARCHAR(50), -- 'shop_banner', 'promo_banner', 'featured_product', 'course_highlight'
  action TEXT NOT NULL, -- 'create', 'update', 'delete', 'toggle_active'
  admin_id UUID REFERENCES profiles(id),
  changes JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_banner_logs_banner ON admin_banner_logs(banner_id);
CREATE INDEX IF NOT EXISTS idx_admin_banner_logs_admin ON admin_banner_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_banner_logs_created ON admin_banner_logs(created_at DESC);

ALTER TABLE admin_banner_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view banner logs" ON admin_banner_logs;
CREATE POLICY "Admins can view banner logs" ON admin_banner_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (is_admin = true OR role IN ('admin', 'super_admin')))
  );

DROP POLICY IF EXISTS "Admins can insert banner logs" ON admin_banner_logs;
CREATE POLICY "Admins can insert banner logs" ON admin_banner_logs
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (is_admin = true OR role IN ('admin', 'super_admin')))
  );

GRANT ALL ON admin_banner_logs TO authenticated;

-- =====================================================
-- 7. ADMIN TOOLTIPS SEEN TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS admin_tooltips_seen (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  tooltip_key TEXT NOT NULL,
  seen_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, tooltip_key)
);

CREATE INDEX IF NOT EXISTS idx_admin_tooltips_user ON admin_tooltips_seen(user_id);

ALTER TABLE admin_tooltips_seen ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own tooltips" ON admin_tooltips_seen;
CREATE POLICY "Users can manage own tooltips" ON admin_tooltips_seen
  FOR ALL USING (auth.uid() = user_id);

GRANT ALL ON admin_tooltips_seen TO authenticated;

-- =====================================================
-- DONE
-- =====================================================
COMMENT ON TABLE course_highlights IS 'Featured course cards on Courses screen';
COMMENT ON TABLE shop_banners IS 'Carousel banners in Shop tab';
COMMENT ON TABLE promo_banners IS 'Hero banner carousel on Course page';
COMMENT ON TABLE promo_bar_config IS 'Dismissible promo bar at top of screens';
COMMENT ON TABLE featured_products IS 'Featured product cards in Shop';
COMMENT ON TABLE admin_banner_logs IS 'Audit log for admin banner actions';
COMMENT ON TABLE admin_tooltips_seen IS 'Track which admin tooltips user has seen';
