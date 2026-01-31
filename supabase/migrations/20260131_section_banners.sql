-- =============================================
-- Section Banners Table
-- For Manifest & Course section hero banners
-- =============================================

-- Create section_banners table
CREATE TABLE IF NOT EXISTS section_banners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  section_id TEXT UNIQUE NOT NULL, -- e.g., 'manifest-money', 'manifest-love', 'courses'
  title TEXT,
  subtitle TEXT,
  image_url TEXT,
  link_url TEXT, -- URL to open in WebView when banner is tapped
  link_type TEXT DEFAULT 'screen', -- 'screen', 'url', 'product', 'collection'
  link_value TEXT, -- Screen name or URL (legacy)
  link_params JSONB, -- Navigation params as JSON
  background_color TEXT DEFAULT 'rgba(106, 91, 255, 0.2)',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Create index on section_id for fast lookups
CREATE INDEX IF NOT EXISTS idx_section_banners_section_id ON section_banners(section_id);
CREATE INDEX IF NOT EXISTS idx_section_banners_is_active ON section_banners(is_active);

-- Enable RLS
ALTER TABLE section_banners ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read active banners
CREATE POLICY "Anyone can read active section banners"
  ON section_banners FOR SELECT
  USING (is_active = true);

-- Policy: Admins can do everything
CREATE POLICY "Admins can manage section banners"
  ON section_banners FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'manager')
    )
  );

-- Insert default section banners (without images - to be configured in admin)
INSERT INTO section_banners (section_id, title, subtitle, link_type, link_value, link_params, background_color, is_active)
VALUES
  ('manifest-money', 'Manifest Tiền Bạc', 'Thu hút tài lộc, thịnh vượng', 'screen', 'ProductList', '{"sectionId": "manifest-money", "title": "Manifest Tiền Bạc", "tags": ["Thạch Anh Vàng", "Cây Tài Lộc"]}', 'rgba(255, 189, 89, 0.2)', true),
  ('manifest-love', 'Manifest Tình Yêu', 'Chiêu cảm tình duyên', 'screen', 'ProductList', '{"sectionId": "manifest-love", "title": "Manifest Tình Yêu", "tags": ["Thạch Anh Hồng", "Aura"]}', 'rgba(255, 107, 157, 0.2)', true),
  ('manifest-abundance', 'Manifest Thịnh Vượng', 'Năng lượng sự nghiệp, thành công', 'screen', 'ProductList', '{"sectionId": "manifest-abundance", "title": "Manifest Thịnh Vượng", "tags": ["Cây Tài Lộc", "Thạch Anh Tím", "Thạch Anh Trắng", "Special set", "Bestseller"]}', 'rgba(106, 91, 255, 0.2)', true),
  ('courses', 'Khóa Học Trading', 'Nâng cao kiến thức, làm chủ tài chính', 'screen', 'ProductList', '{"sectionId": "courses", "title": "Tất cả Khóa học", "tags": ["Khóa học Trading", "Khóa học", "trading-course"]}', 'rgba(106, 91, 255, 0.3)', true)
ON CONFLICT (section_id) DO NOTHING;

-- Grant permissions
GRANT SELECT ON section_banners TO authenticated;
GRANT SELECT ON section_banners TO anon;
GRANT ALL ON section_banners TO service_role;
