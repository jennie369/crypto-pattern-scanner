-- =============================================
-- GEM Shop - Featured Product Configuration
-- Single highlighted product section in Shop tab
-- =============================================

-- Featured Product Config Table
CREATE TABLE IF NOT EXISTS featured_product_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Product reference (can be Shopify product or custom)
  product_id TEXT,                    -- Shopify product ID (optional)
  product_type TEXT DEFAULT 'custom', -- 'shopify' or 'custom'

  -- Custom content (used when product_type = 'custom' or to override)
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  price DECIMAL(10,2),
  original_price DECIMAL(10,2),       -- For showing discount
  currency TEXT DEFAULT 'VND',

  -- Images
  image_url TEXT NOT NULL,
  background_image_url TEXT,          -- Optional background
  badge_text TEXT,                    -- e.g., "HOT", "SALE", "MỚI"
  badge_color TEXT DEFAULT '#FF4757',

  -- Styling
  background_gradient_start TEXT DEFAULT '#1a0b2e',
  background_gradient_end TEXT DEFAULT '#2d1b4e',
  accent_color TEXT DEFAULT '#FFD700',
  text_color TEXT DEFAULT '#FFFFFF',

  -- Link action
  link_type TEXT DEFAULT 'product',   -- 'product', 'collection', 'screen', 'url'
  link_value TEXT,                    -- Product ID, collection handle, screen name, or URL
  cta_text TEXT DEFAULT 'Xem ngay',   -- Call-to-action button text

  -- Display settings
  layout_style TEXT DEFAULT 'card',   -- 'card', 'fullwidth', 'split'
  show_price BOOLEAN DEFAULT true,
  show_badge BOOLEAN DEFAULT true,
  show_description BOOLEAN DEFAULT true,

  -- Status & scheduling
  is_active BOOLEAN DEFAULT true,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  display_order INTEGER DEFAULT 0,

  -- Analytics
  view_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id)
);

-- Create index for active featured products
CREATE INDEX IF NOT EXISTS idx_featured_product_active
  ON featured_product_config(is_active, display_order);

-- RLS Policies
ALTER TABLE featured_product_config ENABLE ROW LEVEL SECURITY;

-- Anyone can read active featured products
CREATE POLICY "Anyone can read active featured products"
  ON featured_product_config
  FOR SELECT
  USING (is_active = true);

-- Admins can do everything
CREATE POLICY "Admins can manage featured products"
  ON featured_product_config
  FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Function to increment view count
CREATE OR REPLACE FUNCTION increment_featured_product_view(product_config_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE featured_product_config
  SET view_count = view_count + 1
  WHERE id = product_config_id;
END;
$$;

-- Function to increment click count
CREATE OR REPLACE FUNCTION increment_featured_product_click(product_config_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE featured_product_config
  SET click_count = click_count + 1
  WHERE id = product_config_id;
END;
$$;

-- Insert sample featured product
INSERT INTO featured_product_config (
  title,
  subtitle,
  description,
  price,
  original_price,
  image_url,
  badge_text,
  badge_color,
  link_type,
  link_value,
  cta_text,
  layout_style,
  is_active
) VALUES (
  'Bộ Đá Thạch Anh Tím Premium',
  'Năng lượng tâm linh mạnh mẽ',
  'Bộ sưu tập đá Thạch Anh Tím cao cấp được tuyển chọn kỹ lưỡng, mang đến năng lượng thanh lọc và khai mở trực giác. Phù hợp cho thiền định và phong thủy.',
  2890000,
  3500000,
  'https://images.unsplash.com/photo-1615486511484-92e172cc4fe0?w=800',
  'HOT',
  '#FF4757',
  'collection',
  'crystals',
  'Khám phá ngay',
  'card',
  true
) ON CONFLICT DO NOTHING;

-- Add comment
COMMENT ON TABLE featured_product_config IS 'Configuration for featured/highlighted product section in Shop tab';
