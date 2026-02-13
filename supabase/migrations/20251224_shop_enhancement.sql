-- ============================================================
-- GEM Shop Enhancement - Database Migration
-- Date: 2024-12-24
-- Creates: user_wishlist, user_recently_viewed, shop_banners,
--          flash_sale_config, promo_bar_config
-- ============================================================

-- ============================================================
-- 1. USER WISHLIST TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS user_wishlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  product_handle TEXT,
  product_title TEXT,
  product_image TEXT,
  product_price DECIMAL(15,2),
  product_compare_price DECIMAL(15,2),
  variant_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, product_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_wishlist_user_id ON user_wishlist(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_product_id ON user_wishlist(product_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_created_at ON user_wishlist(created_at DESC);

-- Enable RLS
ALTER TABLE user_wishlist ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view own wishlist" ON user_wishlist;
CREATE POLICY "Users can view own wishlist" ON user_wishlist
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can add to own wishlist" ON user_wishlist;
CREATE POLICY "Users can add to own wishlist" ON user_wishlist
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can remove from own wishlist" ON user_wishlist;
CREATE POLICY "Users can remove from own wishlist" ON user_wishlist
  FOR DELETE USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON user_wishlist TO authenticated;

-- ============================================================
-- 2. USER RECENTLY VIEWED TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS user_recently_viewed (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  product_handle TEXT,
  product_title TEXT,
  product_image TEXT,
  product_price DECIMAL(15,2),
  viewed_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, product_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_recently_viewed_user_id ON user_recently_viewed(user_id);
CREATE INDEX IF NOT EXISTS idx_recently_viewed_viewed_at ON user_recently_viewed(viewed_at DESC);

-- Enable RLS
ALTER TABLE user_recently_viewed ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view own history" ON user_recently_viewed;
CREATE POLICY "Users can view own history" ON user_recently_viewed
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can add to own history" ON user_recently_viewed;
CREATE POLICY "Users can add to own history" ON user_recently_viewed
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own history" ON user_recently_viewed;
CREATE POLICY "Users can update own history" ON user_recently_viewed
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own history" ON user_recently_viewed;
CREATE POLICY "Users can delete own history" ON user_recently_viewed
  FOR DELETE USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON user_recently_viewed TO authenticated;

-- ============================================================
-- 3. SHOP BANNERS TABLE (Admin managed)
-- ============================================================

CREATE TABLE IF NOT EXISTS shop_banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT,
  subtitle TEXT,
  image_url TEXT NOT NULL,
  link_type TEXT DEFAULT 'none',  -- 'none', 'product', 'collection', 'url', 'screen'
  link_value TEXT,  -- product_id, collection_handle, url, or screen_name
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_banners_active ON shop_banners(is_active, display_order);
CREATE INDEX IF NOT EXISTS idx_banners_dates ON shop_banners(start_date, end_date);

-- Enable RLS
ALTER TABLE shop_banners ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Anyone can view active banners
DROP POLICY IF EXISTS "Anyone can view active banners" ON shop_banners;
CREATE POLICY "Anyone can view active banners" ON shop_banners
  FOR SELECT USING (
    is_active = true
    AND (start_date IS NULL OR start_date <= NOW())
    AND (end_date IS NULL OR end_date >= NOW())
  );

-- Admin can manage banners
DROP POLICY IF EXISTS "Admins can manage banners" ON shop_banners;
CREATE POLICY "Admins can manage banners" ON shop_banners
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (UPPER(profiles.role) = 'ADMIN' OR profiles.is_admin = TRUE)
    )
  );

-- Grant permissions
GRANT SELECT ON shop_banners TO anon;
GRANT ALL ON shop_banners TO authenticated;

-- ============================================================
-- 4. FLASH SALE CONFIG TABLE (Admin managed)
-- ============================================================

CREATE TABLE IF NOT EXISTS flash_sale_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL DEFAULT 'Flash Sale',
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT true,
  product_ids TEXT[] DEFAULT '{}',  -- Array of Shopify product IDs
  discount_percentage INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_flash_sale_active ON flash_sale_config(is_active);
CREATE INDEX IF NOT EXISTS idx_flash_sale_times ON flash_sale_config(start_time, end_time);

-- Enable RLS
ALTER TABLE flash_sale_config ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Anyone can view active flash sales
DROP POLICY IF EXISTS "Anyone can view active flash sales" ON flash_sale_config;
CREATE POLICY "Anyone can view active flash sales" ON flash_sale_config
  FOR SELECT USING (
    is_active = true
    AND start_time <= NOW()
    AND end_time >= NOW()
  );

-- Admin can manage flash sales
DROP POLICY IF EXISTS "Admins can manage flash sales" ON flash_sale_config;
CREATE POLICY "Admins can manage flash sales" ON flash_sale_config
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (UPPER(profiles.role) = 'ADMIN' OR profiles.is_admin = TRUE)
    )
  );

-- Grant permissions
GRANT SELECT ON flash_sale_config TO anon;
GRANT ALL ON flash_sale_config TO authenticated;

-- ============================================================
-- 5. PROMO BAR CONFIG TABLE (Admin managed)
-- ============================================================

CREATE TABLE IF NOT EXISTS promo_bar_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message TEXT NOT NULL,
  voucher_code TEXT,
  link_text TEXT,
  link_url TEXT,
  background_color TEXT DEFAULT '#FF4757',
  text_color TEXT DEFAULT '#FFFFFF',
  is_active BOOLEAN DEFAULT true,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_promo_bar_active ON promo_bar_config(is_active, display_order);

-- Enable RLS
ALTER TABLE promo_bar_config ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Anyone can view active promo
DROP POLICY IF EXISTS "Anyone can view active promo" ON promo_bar_config;
CREATE POLICY "Anyone can view active promo" ON promo_bar_config
  FOR SELECT USING (
    is_active = true
    AND (start_date IS NULL OR start_date <= NOW())
    AND (end_date IS NULL OR end_date >= NOW())
  );

-- Admin can manage promo bar
DROP POLICY IF EXISTS "Admins can manage promo bar" ON promo_bar_config;
CREATE POLICY "Admins can manage promo bar" ON promo_bar_config
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (UPPER(profiles.role) = 'ADMIN' OR profiles.is_admin = TRUE)
    )
  );

-- Grant permissions
GRANT SELECT ON promo_bar_config TO anon;
GRANT ALL ON promo_bar_config TO authenticated;

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================

-- Function to upsert recently viewed (update viewed_at if exists)
CREATE OR REPLACE FUNCTION upsert_recently_viewed(
  p_user_id UUID,
  p_product_id TEXT,
  p_product_handle TEXT DEFAULT NULL,
  p_product_title TEXT DEFAULT NULL,
  p_product_image TEXT DEFAULT NULL,
  p_product_price DECIMAL(15,2) DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO user_recently_viewed (
    user_id,
    product_id,
    product_handle,
    product_title,
    product_image,
    product_price,
    viewed_at
  ) VALUES (
    p_user_id,
    p_product_id,
    p_product_handle,
    p_product_title,
    p_product_image,
    p_product_price,
    NOW()
  )
  ON CONFLICT (user_id, product_id)
  DO UPDATE SET
    product_handle = COALESCE(EXCLUDED.product_handle, user_recently_viewed.product_handle),
    product_title = COALESCE(EXCLUDED.product_title, user_recently_viewed.product_title),
    product_image = COALESCE(EXCLUDED.product_image, user_recently_viewed.product_image),
    product_price = COALESCE(EXCLUDED.product_price, user_recently_viewed.product_price),
    viewed_at = NOW();
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION upsert_recently_viewed TO authenticated;

-- Function to get wishlist count
CREATE OR REPLACE FUNCTION get_wishlist_count(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM user_wishlist
  WHERE user_id = p_user_id;

  RETURN v_count;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_wishlist_count TO authenticated;

-- ============================================================
-- SEED DATA (Sample banners and promo for testing)
-- ============================================================

-- Sample banners
INSERT INTO shop_banners (title, subtitle, image_url, link_type, link_value, display_order, is_active)
VALUES
  ('Flash Sale Cuối Năm', 'Giảm đến 50%', 'https://via.placeholder.com/1080x400/FF4757/FFFFFF?text=Flash+Sale', 'collection', 'flash-sale', 1, true),
  ('Đá Quý Phong Thủy', 'Bộ sưu tập mới', 'https://via.placeholder.com/1080x400/9C27B0/FFFFFF?text=Crystals', 'collection', 'crystals', 2, true),
  ('Khóa Học Trading', 'Học từ chuyên gia', 'https://via.placeholder.com/1080x400/00F0FF/000000?text=Courses', 'collection', 'courses', 3, true)
ON CONFLICT DO NOTHING;

-- Sample promo bar
INSERT INTO promo_bar_config (message, voucher_code, link_text, link_url, is_active)
VALUES
  ('Giảm 20% cho đơn hàng đầu tiên! Dùng mã:', 'WELCOME20', 'Mua ngay', '/shop', true)
ON CONFLICT DO NOTHING;

-- ============================================================
-- COMPLETE!
-- ============================================================
SELECT 'Shop Enhancement migration completed successfully!' as status;
