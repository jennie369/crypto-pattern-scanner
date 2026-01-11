-- =====================================================
-- UPDATE SHOPIFY VARIANT IDs
-- Date: 2026-01-09
-- Purpose: Update all product variant IDs in database
-- =====================================================

-- =====================================================
-- 1. UPDATE upgrade_tiers TABLE
-- =====================================================

-- Trading Courses (TIER 1, 2, 3)
UPDATE upgrade_tiers SET
  shopify_variant_id = '46351707898033',
  shopify_product_id = 'gem-tier1'
WHERE tier_type = 'course' AND tier_level = 1;

UPDATE upgrade_tiers SET
  shopify_variant_id = '46351719235761',
  shopify_product_id = 'gem-tier2'
WHERE tier_type = 'course' AND tier_level = 2;

UPDATE upgrade_tiers SET
  shopify_variant_id = '46351723331761',
  shopify_product_id = 'gem-tier3'
WHERE tier_type = 'course' AND tier_level = 3;

-- Scanner Dashboard (PRO, PREMIUM, VIP)
UPDATE upgrade_tiers SET
  shopify_variant_id = '46351752069297',
  shopify_product_id = 'gem-scanner-pro'
WHERE tier_type = 'scanner' AND tier_level = 1;

UPDATE upgrade_tiers SET
  shopify_variant_id = '46351759507633',
  shopify_product_id = 'gem-scanner-premium'
WHERE tier_type = 'scanner' AND tier_level = 2;

UPDATE upgrade_tiers SET
  shopify_variant_id = '46351760294065',
  shopify_product_id = 'gem-scanner-vip'
WHERE tier_type = 'scanner' AND tier_level = 3;

-- Chatbot AI (PRO, PREMIUM, VIP)
UPDATE upgrade_tiers SET
  shopify_variant_id = '46351763701937',
  shopify_product_id = 'gem-chatbot-pro'
WHERE tier_type = 'chatbot' AND tier_level = 1;

UPDATE upgrade_tiers SET
  shopify_variant_id = '46351771893937',
  shopify_product_id = 'gem-chatbot-premium'
WHERE tier_type = 'chatbot' AND tier_level = 2;

UPDATE upgrade_tiers SET
  shopify_variant_id = '46421822832817',
  shopify_product_id = 'gem-chatbot-vip'
WHERE tier_type = 'chatbot' AND tier_level = 3;

-- =====================================================
-- 2. CREATE shopify_product_variants TABLE (Reference)
-- Complete mapping of all Shopify products
-- =====================================================
CREATE TABLE IF NOT EXISTS shopify_product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Shopify IDs
  shopify_product_id VARCHAR(50) NOT NULL,
  shopify_variant_id VARCHAR(50) NOT NULL UNIQUE,

  -- Product info
  product_handle VARCHAR(255) NOT NULL,
  product_title VARCHAR(255) NOT NULL,
  product_type VARCHAR(50) NOT NULL, -- course, scanner, chatbot, gem_pack, spiritual_course

  -- Variant info
  variant_title VARCHAR(255) DEFAULT 'Default Title',
  sku VARCHAR(100),

  -- Pricing
  price_vnd DECIMAL(15,2),
  compare_at_price_vnd DECIMAL(15,2),

  -- Internal mapping
  tier_type VARCHAR(50), -- scanner, chatbot, course
  tier_level INTEGER,    -- 1, 2, 3
  tier_name VARCHAR(50), -- TIER1, TIER2, TIER3, PRO, PREMIUM, VIP, STARTER

  -- For individual courses (non-tier)
  course_id UUID,
  course_name VARCHAR(255),

  -- Status
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_spv_variant_id ON shopify_product_variants(shopify_variant_id);
CREATE INDEX IF NOT EXISTS idx_spv_product_type ON shopify_product_variants(product_type);
CREATE INDEX IF NOT EXISTS idx_spv_sku ON shopify_product_variants(sku);

-- =====================================================
-- 3. INSERT ALL VARIANT MAPPINGS
-- =====================================================

-- Clear existing data
TRUNCATE shopify_product_variants;

-- Trading Courses - TIER 1, 2, 3
INSERT INTO shopify_product_variants
(shopify_product_id, shopify_variant_id, product_handle, product_title, product_type, sku, price_vnd, tier_type, tier_level, tier_name)
VALUES
('gem-tier1', '46351707898033', 'gem-tier1', 'GEM Trading Academy - Gói 1', 'course', 'gem-course-tier1', 11000000, 'course', 1, 'TIER1'),
('gem-tier2', '46351719235761', 'gem-tier2', 'GEM Trading Academy - Gói 2', 'course', 'gem-course-tier2', 21000000, 'course', 2, 'TIER2'),
('gem-tier3', '46351723331761', 'gem-tier3', 'GEM Trading Academy - Gói 3', 'course', 'gem-course-tier3', 68000000, 'course', 3, 'TIER3'),
('gem-starter', '46448154050737', 'gem-trading-course-tier-starter', 'GEM Trading Course - Tier Starter', 'course', 'gem-course-starter', 299000, 'course', 0, 'STARTER');

-- Scanner Dashboard - PRO, PREMIUM, VIP
INSERT INTO shopify_product_variants
(shopify_product_id, shopify_variant_id, product_handle, product_title, product_type, sku, price_vnd, tier_type, tier_level, tier_name)
VALUES
('gem-scanner-pro', '46351752069297', 'gem-scanner-pro', 'Scanner Dashboard - PRO', 'scanner', 'gem-scanner-pro', 997000, 'scanner', 1, 'PRO'),
('gem-scanner-premium', '46351759507633', 'scanner-dashboard-premium', 'Scanner Dashboard - PREMIUM', 'scanner', 'gem-scanner-premium', 1997000, 'scanner', 2, 'PREMIUM'),
('gem-scanner-vip', '46351760294065', 'scanner-dashboard-vip', 'Scanner Dashboard - VIP', 'scanner', 'gem-scanner-vip', 5997000, 'scanner', 3, 'VIP');

-- Chatbot AI - PRO, PREMIUM, VIP
INSERT INTO shopify_product_variants
(shopify_product_id, shopify_variant_id, product_handle, product_title, product_type, sku, price_vnd, tier_type, tier_level, tier_name)
VALUES
('gem-chatbot-pro', '46351763701937', 'yinyang-chatbot-ai-pro', 'YinYang Chatbot AI - PRO', 'chatbot', 'gem-chatbot-pro', 39000, 'chatbot', 1, 'PRO'),
('gem-chatbot-premium', '46351771893937', 'gem-chatbot-premium', 'YinYang Chatbot AI - PREMIUM', 'chatbot', 'gem-chatbot-premium', 59000, 'chatbot', 2, 'PREMIUM'),
('gem-chatbot-vip', '46421822832817', 'yinyang-chatbot-ai-vip', 'YinYang Chatbot AI - VIP', 'chatbot', 'gem-chatbot-vip', 99000, 'chatbot', 3, 'VIP');

-- Spiritual Courses (Individual)
INSERT INTO shopify_product_variants
(shopify_product_id, shopify_variant_id, product_handle, product_title, product_type, sku, price_vnd, course_name)
VALUES
('8904651342001', '46448176758961', 'khoa-hoc-7-ngay-khai-mo-tan-so-goc', 'Khóa học 7 NGÀY KHAI MỞ TẦN SỐ GỐC', 'spiritual_course', 'course-tan-so-goc', 1990000, '7 Ngày Khai Mở Tần Số Gốc'),
('8904653111473', '46448180166833', 'khoa-hoc-kich-hoat-tan-so-tinh-yeu', 'Khóa học KÍCH HOẠT TẦN SỐ TÌNH YÊU', 'spiritual_course', 'course-tinh-yeu', 399000, 'Kích Hoạt Tần Số Tình Yêu'),
('8904656257201', '46448192192689', 'khoa-hoc-tai-tao-tu-duy-trieu-phu', 'Khóa học TÁI TẠO TƯ DUY TRIỆU PHÚ', 'spiritual_course', 'course-trieu-phu', 499000, 'Tái Tạo Tư Duy Triệu Phú');

-- =====================================================
-- 4. CREATE HELPER FUNCTION
-- Get tier info by variant ID
-- =====================================================
CREATE OR REPLACE FUNCTION get_tier_by_variant_id(p_variant_id VARCHAR)
RETURNS TABLE(
  tier_type VARCHAR,
  tier_level INTEGER,
  tier_name VARCHAR,
  product_type VARCHAR
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    spv.tier_type::VARCHAR,
    spv.tier_level,
    spv.tier_name::VARCHAR,
    spv.product_type::VARCHAR
  FROM shopify_product_variants spv
  WHERE spv.shopify_variant_id = p_variant_id;
END;
$$;

-- =====================================================
-- 5. GRANT PERMISSIONS
-- =====================================================
GRANT SELECT ON shopify_product_variants TO authenticated;
GRANT SELECT ON shopify_product_variants TO service_role;
GRANT EXECUTE ON FUNCTION get_tier_by_variant_id TO authenticated;
GRANT EXECUTE ON FUNCTION get_tier_by_variant_id TO service_role;

-- =====================================================
-- 6. VERIFY DATA
-- =====================================================
SELECT
  product_type,
  tier_name,
  shopify_variant_id,
  price_vnd
FROM shopify_product_variants
ORDER BY product_type, tier_level;

-- =====================================================
-- SUMMARY OF ALL VARIANT IDs
-- =====================================================
/*
TRADING COURSES:
- TIER STARTER: 46448154050737 (₫299,000)
- TIER 1: 46351707898033 (₫11,000,000)
- TIER 2: 46351719235761 (₫21,000,000)
- TIER 3: 46351723331761 (₫68,000,000)

SCANNER DASHBOARD:
- PRO: 46351752069297 (₫997,000/mo)
- PREMIUM: 46351759507633 (₫1,997,000/mo)
- VIP: 46351760294065 (₫5,997,000/mo)

CHATBOT AI:
- PRO: 46351763701937 (₫39,000/mo)
- PREMIUM: 46351771893937 (₫59,000/mo)
- VIP: 46421822832817 (₫99,000/mo)

SPIRITUAL COURSES:
- 7 Ngày Khai Mở Tần Số Gốc: 46448176758961 (₫1,990,000)
- Kích Hoạt Tần Số Tình Yêu: 46448180166833 (₫399,000)
- Tái Tạo Tư Duy Triệu Phú: 46448192192689 (₫499,000)
*/
