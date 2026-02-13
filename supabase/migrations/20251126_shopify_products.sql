-- =====================================================
-- GEM Platform - Shopify Products Tables
-- Day 3-4: Shopify Integration
-- =====================================================
--
-- Tables for storing Shopify products from:
-- 1. YinYangMasters.com - Crystals
-- 2. GemCapitalHolding.com - Courses & Bundles
--
-- CRITICAL: These tables store synced products from Shopify
-- Do NOT manually insert - use Shopify sync scripts
-- =====================================================

-- =====================================================
-- 1. SHOPIFY CRYSTALS TABLE
-- Products from YinYangMasters.com
-- =====================================================
CREATE TABLE IF NOT EXISTS shopify_crystals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  shopify_product_id TEXT UNIQUE NOT NULL,

  -- Basic info
  name_vi TEXT NOT NULL,
  name_en TEXT,
  description TEXT,

  -- Crystal properties
  crystal_type TEXT, -- 'amethyst', 'citrine', 'black_tourmaline', etc.
  properties TEXT[], -- ['stress_relief', 'focus', 'abundance', 'protection', etc.]
  chakra TEXT, -- 'crown', 'third_eye', 'throat', 'heart', 'solar_plexus', 'sacral', 'root'
  zodiac TEXT[], -- ['aries', 'taurus', etc.]
  elements TEXT[], -- ['fire', 'water', 'earth', 'air']

  -- Pricing
  price NUMERIC NOT NULL,
  compare_at_price NUMERIC, -- Original price for discounts

  -- Inventory
  in_stock BOOLEAN DEFAULT true,
  inventory_quantity INT DEFAULT 0,

  -- URLs
  product_url TEXT,
  image_url TEXT,
  images TEXT[], -- Array of image URLs

  -- Metadata
  tags TEXT[],
  vendor TEXT DEFAULT 'YinYangMasters',

  -- Sync info
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 2. SHOPIFY COURSES TABLE
-- Products from GemCapitalHolding.com
-- =====================================================
CREATE TABLE IF NOT EXISTS shopify_courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  shopify_product_id TEXT UNIQUE NOT NULL,

  -- Basic info
  title_vi TEXT NOT NULL,
  title_en TEXT,
  description TEXT,
  short_description TEXT,

  -- Course details
  category TEXT CHECK (category IN ('manifestation', 'mindset', 'trading', 'other')),
  difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  duration_days INT,
  total_lessons INT,

  -- Instructor info
  instructor_name TEXT,
  instructor_avatar TEXT,

  -- Pricing
  price NUMERIC NOT NULL,
  compare_at_price NUMERIC,

  -- URLs
  course_url TEXT,
  thumbnail_url TEXT,
  preview_video_url TEXT,

  -- What's included
  features TEXT[], -- ['Video HD', '30 bài học', 'Certificate', etc.]

  -- Metadata
  tags TEXT[],
  is_featured BOOLEAN DEFAULT false,
  is_bestseller BOOLEAN DEFAULT false,

  -- Sync info
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 3. BUNDLE OFFERS TABLE
-- TIER bundles for trading courses
-- =====================================================
CREATE TABLE IF NOT EXISTS bundle_offers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Tier info
  tier TEXT UNIQUE NOT NULL CHECK (tier IN ('TIER1', 'TIER2', 'TIER3')),
  name TEXT NOT NULL,
  description TEXT,
  tagline TEXT, -- Short marketing tagline

  -- Pricing
  price NUMERIC NOT NULL,
  original_price NUMERIC,
  savings NUMERIC,
  monthly_equivalent NUMERIC, -- For "chỉ xxx/tháng" messaging

  -- What's included
  includes JSONB, -- Detailed breakdown of bundle contents
  -- Example: {
  --   "scanner": { "tier": "PRO", "months": 12 },
  --   "chatbot": { "tier": "PRO", "months": 12 },
  --   "courses": ["course1", "course2"],
  --   "patterns": 7,
  --   "tools": 2
  -- }

  features TEXT[], -- Feature bullet points

  -- URLs
  purchase_url TEXT,
  image_url TEXT,

  -- Status
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,

  -- Display order
  display_order INT DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 4. USER PURCHASES TABLE
-- Track what users have bought
-- =====================================================
CREATE TABLE IF NOT EXISTS user_purchases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Product info
  product_id TEXT NOT NULL, -- Shopify product ID or bundle ID
  product_type TEXT NOT NULL CHECK (product_type IN ('crystal', 'course', 'bundle', 'chatbot', 'scanner')),
  product_tier TEXT, -- 'TIER1', 'TIER2', 'TIER3' for bundles
  product_name TEXT,

  -- Purchase info
  purchase_price NUMERIC,
  currency TEXT DEFAULT 'VND',
  shopify_order_id TEXT,
  shopify_order_number TEXT,

  -- Subscription info (for recurring)
  is_subscription BOOLEAN DEFAULT false,
  subscription_interval TEXT, -- 'monthly', 'yearly'
  expires_at TIMESTAMPTZ,

  -- Status
  is_active BOOLEAN DEFAULT true,
  purchased_at TIMESTAMPTZ DEFAULT NOW(),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Unique constraint: one purchase per user per product
  UNIQUE(user_id, product_id, product_type)
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Crystals indexes
CREATE INDEX IF NOT EXISTS idx_crystals_properties ON shopify_crystals USING gin(properties);
CREATE INDEX IF NOT EXISTS idx_crystals_in_stock ON shopify_crystals(in_stock);
CREATE INDEX IF NOT EXISTS idx_crystals_crystal_type ON shopify_crystals(crystal_type);
CREATE INDEX IF NOT EXISTS idx_crystals_price ON shopify_crystals(price);

-- Courses indexes
CREATE INDEX IF NOT EXISTS idx_courses_category ON shopify_courses(category);
CREATE INDEX IF NOT EXISTS idx_courses_featured ON shopify_courses(is_featured);
CREATE INDEX IF NOT EXISTS idx_courses_price ON shopify_courses(price);

-- Bundles indexes
CREATE INDEX IF NOT EXISTS idx_bundles_active ON bundle_offers(is_active, tier);
CREATE INDEX IF NOT EXISTS idx_bundles_price ON bundle_offers(price);

-- User purchases indexes
CREATE INDEX IF NOT EXISTS idx_purchases_user ON user_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_product ON user_purchases(product_id, product_type);
CREATE INDEX IF NOT EXISTS idx_purchases_active ON user_purchases(user_id, is_active);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

-- Enable RLS
ALTER TABLE shopify_crystals ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopify_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE bundle_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_purchases ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first (if exist)
DROP POLICY IF EXISTS "Anyone can view crystals" ON shopify_crystals;
DROP POLICY IF EXISTS "Anyone can view courses" ON shopify_courses;
DROP POLICY IF EXISTS "Anyone can view active bundles" ON bundle_offers;
DROP POLICY IF EXISTS "Users can view own purchases" ON user_purchases;
DROP POLICY IF EXISTS "Service role full access crystals" ON shopify_crystals;
DROP POLICY IF EXISTS "Service role full access courses" ON shopify_courses;
DROP POLICY IF EXISTS "Service role full access bundles" ON bundle_offers;
DROP POLICY IF EXISTS "Service role full access purchases" ON user_purchases;

-- Crystals: Anyone can read
CREATE POLICY "Anyone can view crystals"
  ON shopify_crystals FOR SELECT
  USING (true);

-- Courses: Anyone can read
CREATE POLICY "Anyone can view courses"
  ON shopify_courses FOR SELECT
  USING (true);

-- Bundles: Anyone can read active bundles
CREATE POLICY "Anyone can view active bundles"
  ON bundle_offers FOR SELECT
  USING (is_active = true);

-- User purchases: Users can only see their own
CREATE POLICY "Users can view own purchases"
  ON user_purchases FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can do everything (for Shopify sync)
CREATE POLICY "Service role full access crystals"
  ON shopify_crystals FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role full access courses"
  ON shopify_courses FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role full access bundles"
  ON bundle_offers FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role full access purchases"
  ON user_purchases FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- =====================================================
-- SAMPLE DATA - TIER BUNDLES
-- =====================================================

INSERT INTO bundle_offers (tier, name, description, tagline, price, original_price, savings, monthly_equivalent, features, purchase_url, is_active, display_order)
VALUES
  (
    'TIER1',
    'TIER 1: NỀN TẢNG TRADER',
    'Gói nền tảng cho người mới bắt đầu trading. Bao gồm Scanner PRO và Chatbot PRO trong 12 tháng, 7 patterns cơ bản và 2 công cụ phân tích.',
    'Bước đầu tiên để trở thành Trader chuyên nghiệp',
    11000000,
    36432000,
    25432000,
    916667,
    ARRAY[
      'Scanner PRO 12 tháng',
      'Chatbot PRO 12 tháng miễn phí',
      '7 patterns cơ bản',
      '2 công cụ phân tích',
      'Hỗ trợ qua Discord'
    ],
    'https://gemcapitalholding.com/products/tier-1-bundle',
    true,
    1
  ),
  (
    'TIER2',
    'TIER 2: TẦN SỐ THỊNH VƯỢNG',
    'Gói nâng cao với 6 Công thức Frequency độc quyền. Scanner PREMIUM và Chatbot PREMIUM trong 12 tháng, 15 patterns và 8 công cụ.',
    'Mở khóa sức mạnh của Frequency Trading',
    21000000,
    73152000,
    52152000,
    1750000,
    ARRAY[
      '6 Công thức Frequency độc quyền',
      'Scanner PREMIUM 12 tháng',
      'Chatbot PREMIUM 12 tháng miễn phí',
      '15 patterns nâng cao',
      '8 công cụ phân tích',
      'Mentor 1-1 mỗi tháng',
      'Community VIP'
    ],
    'https://gemcapitalholding.com/products/tier-2-bundle',
    true,
    2
  ),
  (
    'TIER3',
    'TIER 3: ĐẾ CHẾ BẬC THẦY',
    'Gói cao cấp nhất với 11 Công thức FULL system, AI Agent trading, Scanner VIP và Chatbot UNLIMITED 24 tháng. Đào tạo 1-1 với Master Trader.',
    'Trở thành Master Trader với AI hỗ trợ',
    68000000,
    322304000,
    254304000,
    2833333,
    ARRAY[
      '11 Công thức FULL system',
      'AI Agent trading',
      'Scanner VIP 24 tháng',
      'Chatbot UNLIMITED 24 tháng',
      '24 patterns tất cả',
      '11 công cụ full',
      'Mentor 1-1 hàng tuần',
      'Mastermind Group',
      'Lifetime updates'
    ],
    'https://gemcapitalholding.com/products/tier-3-vip-bundle',
    true,
    3
  )
ON CONFLICT (tier) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  tagline = EXCLUDED.tagline,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  savings = EXCLUDED.savings,
  monthly_equivalent = EXCLUDED.monthly_equivalent,
  features = EXCLUDED.features,
  purchase_url = EXCLUDED.purchase_url,
  is_active = EXCLUDED.is_active,
  display_order = EXCLUDED.display_order,
  updated_at = NOW();

-- =====================================================
-- SAMPLE DATA - CRYSTALS (for testing)
-- =====================================================

INSERT INTO shopify_crystals (shopify_product_id, name_vi, description, crystal_type, properties, chakra, price, in_stock, image_url)
VALUES
  (
    'crystal-amethyst-001',
    'Thạch Anh Tím (Amethyst)',
    'Giảm stress, tăng tập trung, hỗ trợ giấc ngủ. Đá lý tưởng cho trader cần sự bình tĩnh.',
    'amethyst',
    ARRAY['stress_relief', 'focus', 'calming', 'clarity'],
    'third_eye',
    350000,
    true,
    'https://example.com/amethyst.jpg'
  ),
  (
    'crystal-citrine-001',
    'Thạch Anh Vàng (Citrine)',
    'Thu hút thịnh vượng, tăng sự tự tin, mang lại năng lượng tích cực cho trading.',
    'citrine',
    ARRAY['abundance', 'prosperity', 'confidence', 'success'],
    'solar_plexus',
    450000,
    true,
    'https://example.com/citrine.jpg'
  ),
  (
    'crystal-black-tourmaline-001',
    'Tourmaline Đen',
    'Bảo vệ năng lượng, grounding, giúp trader tránh FOMO và revenge trading.',
    'black_tourmaline',
    ARRAY['protection', 'grounding', 'stress_relief', 'focus'],
    'root',
    380000,
    true,
    'https://example.com/black-tourmaline.jpg'
  ),
  (
    'crystal-pyrite-001',
    'Pyrite (Vàng Giả)',
    'Đá của sự giàu có, thu hút tài lộc và cơ hội trading tốt.',
    'pyrite',
    ARRAY['abundance', 'prosperity', 'confidence', 'success', 'protection'],
    'solar_plexus',
    420000,
    true,
    'https://example.com/pyrite.jpg'
  ),
  (
    'crystal-clear-quartz-001',
    'Thạch Anh Trắng (Clear Quartz)',
    'Khuếch đại năng lượng, tăng clarity khi phân tích chart, hỗ trợ ra quyết định.',
    'clear_quartz',
    ARRAY['clarity', 'focus', 'energy', 'healing'],
    'crown',
    280000,
    true,
    'https://example.com/clear-quartz.jpg'
  )
ON CONFLICT (shopify_product_id) DO NOTHING;

-- =====================================================
-- SAMPLE DATA - COURSES (for testing)
-- =====================================================

INSERT INTO shopify_courses (shopify_product_id, title_vi, description, category, price, thumbnail_url, features, is_featured)
VALUES
  (
    'course-tan-so-goc-001',
    'Tần Số Gốc - Manifestation Mastery',
    'Khóa học về Law of Attraction và Manifestation. Học cách sử dụng tần số để thu hút thịnh vượng.',
    'manifestation',
    1990000,
    'https://example.com/tan-so-goc.jpg',
    ARRAY['12 video bài giảng', 'Workbook PDF', 'Meditation audio', 'Community support'],
    true
  ),
  (
    'course-tu-duy-trieu-phu-001',
    'Tư Duy Triệu Phú',
    'Thay đổi mindset để thành công trong trading và cuộc sống. Học từ những người đã đạt được.',
    'mindset',
    499000,
    'https://example.com/tu-duy-trieu-phu.jpg',
    ARRAY['8 video bài giảng', 'Exercise sheets', '30 ngày challenge'],
    false
  ),
  (
    'course-energy-reset-001',
    'Energy Reset for Traders',
    'Reset năng lượng sau loss streak. Kỹ thuật meditation và breathing cho trader.',
    'mindset',
    299000,
    'https://example.com/energy-reset.jpg',
    ARRAY['5 video hướng dẫn', '10 meditation tracks', 'Daily routine template'],
    false
  )
ON CONFLICT (shopify_product_id) DO NOTHING;

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to check if user has purchased a product
CREATE OR REPLACE FUNCTION has_purchased(p_user_id UUID, p_product_id TEXT, p_product_type TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_purchases
    WHERE user_id = p_user_id
    AND product_id = p_product_id
    AND product_type = p_product_type
    AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's highest tier from purchases
CREATE OR REPLACE FUNCTION get_user_purchase_tier(p_user_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_tier TEXT := 'FREE';
  v_purchase RECORD;
BEGIN
  FOR v_purchase IN
    SELECT product_tier FROM user_purchases
    WHERE user_id = p_user_id
    AND product_type IN ('bundle', 'chatbot', 'scanner')
    AND is_active = true
    AND product_tier IS NOT NULL
  LOOP
    -- Compare tiers (TIER3 > TIER2 > TIER1 > FREE)
    IF v_purchase.product_tier = 'TIER3' OR v_purchase.product_tier = 'VIP' THEN
      RETURN 'TIER3';
    ELSIF (v_purchase.product_tier = 'TIER2' OR v_purchase.product_tier = 'PREMIUM') AND v_tier != 'TIER3' THEN
      v_tier := 'TIER2';
    ELSIF (v_purchase.product_tier = 'TIER1' OR v_purchase.product_tier = 'PRO') AND v_tier NOT IN ('TIER2', 'TIER3') THEN
      v_tier := 'TIER1';
    END IF;
  END LOOP;

  RETURN v_tier;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for each table
DROP TRIGGER IF EXISTS update_crystals_updated_at ON shopify_crystals;
CREATE TRIGGER update_crystals_updated_at
  BEFORE UPDATE ON shopify_crystals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_courses_updated_at ON shopify_courses;
CREATE TRIGGER update_courses_updated_at
  BEFORE UPDATE ON shopify_courses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_bundles_updated_at ON bundle_offers;
CREATE TRIGGER update_bundles_updated_at
  BEFORE UPDATE ON bundle_offers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_purchases_updated_at ON user_purchases;
CREATE TRIGGER update_purchases_updated_at
  BEFORE UPDATE ON user_purchases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check tables exist
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('shopify_crystals', 'shopify_courses', 'bundle_offers', 'user_purchases');

-- Check sample data
-- SELECT COUNT(*) as crystal_count FROM shopify_crystals;
-- SELECT COUNT(*) as course_count FROM shopify_courses;
-- SELECT COUNT(*) as bundle_count FROM bundle_offers;

-- Test crystal properties query
-- SELECT name_vi, properties FROM shopify_crystals WHERE properties && ARRAY['stress_relief', 'focus'];

-- Test bundle tier query
-- SELECT tier, name, price FROM bundle_offers WHERE is_active = true ORDER BY price;
