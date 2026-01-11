-- ============================================================
-- UPGRADE SYSTEM TABLES
-- Purpose: Quản lý tiers, features, banners cho upgrade flow
-- Author: Claude Code
-- Date: 2025-12-27
-- ============================================================

-- ============================================================
-- TABLE 1: upgrade_tiers
-- Quản lý các gói subscription
-- ============================================================

CREATE TABLE IF NOT EXISTS upgrade_tiers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Tier info
  tier_type VARCHAR(20) NOT NULL,  -- scanner, chatbot, course, combo
  tier_level INTEGER NOT NULL,      -- 0=free, 1, 2, 3
  tier_name VARCHAR(100) NOT NULL,  -- "Scanner TIER 1"
  tier_slug VARCHAR(50) NOT NULL,   -- "scanner-tier1"

  -- Pricing
  price_vnd DECIMAL(15,2) NOT NULL DEFAULT 0,
  price_usd DECIMAL(10,2) DEFAULT 0,
  original_price_vnd DECIMAL(15,2),
  discount_percent INTEGER DEFAULT 0,

  -- Shopify integration
  shopify_product_id VARCHAR(50),
  shopify_variant_id VARCHAR(50),
  checkout_url TEXT,

  -- Display
  display_name VARCHAR(100),
  short_description TEXT,
  long_description TEXT,
  badge_text VARCHAR(50),
  badge_color VARCHAR(20) DEFAULT '#FFBD59',
  icon_name VARCHAR(50) DEFAULT 'star',
  color_primary VARCHAR(20) DEFAULT '#FFBD59',
  color_secondary VARCHAR(20) DEFAULT '#6A5BFF',

  -- Features JSON
  features_json JSONB DEFAULT '[]',

  -- Limits
  daily_limit INTEGER,
  monthly_limit INTEGER,
  total_limit INTEGER,

  -- Status
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  is_popular BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(tier_type, tier_level)
);

-- ============================================================
-- TABLE 2: upgrade_banners
-- Quản lý banners/popups
-- ============================================================

CREATE TABLE IF NOT EXISTS upgrade_banners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Banner info
  banner_key VARCHAR(50) NOT NULL UNIQUE,
  banner_type VARCHAR(20) NOT NULL DEFAULT 'popup',
  -- popup, banner, fullscreen, overlay, bottom_sheet

  -- Content
  title VARCHAR(200) NOT NULL,
  subtitle TEXT,
  description TEXT,
  image_url TEXT,
  icon_name VARCHAR(50) DEFAULT 'sparkles',

  -- CTA
  cta_text VARCHAR(100) DEFAULT 'Nâng cấp ngay',
  cta_color VARCHAR(20) DEFAULT '#FFBD59',
  secondary_cta_text VARCHAR(100),
  secondary_cta_url TEXT,

  -- Target
  target_tier_type VARCHAR(20),
  target_tier_level INTEGER,
  target_screen VARCHAR(50),

  -- Trigger
  trigger_type VARCHAR(50) NOT NULL,
  trigger_screen VARCHAR(50),
  trigger_event VARCHAR(50),
  trigger_conditions JSONB DEFAULT '{}',

  -- Display rules
  show_frequency VARCHAR(20) DEFAULT 'always',
  max_impressions INTEGER,
  show_delay_ms INTEGER DEFAULT 0,
  auto_dismiss_ms INTEGER,
  is_dismissible BOOLEAN DEFAULT true,

  -- Status
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,

  -- Analytics
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE 3: upgrade_events (Analytics)
-- Track user interactions
-- ============================================================

CREATE TABLE IF NOT EXISTS upgrade_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- User
  user_id UUID REFERENCES auth.users(id),

  -- Event
  event_type VARCHAR(50) NOT NULL,
  -- impression, click, dismiss, checkout_start, checkout_complete

  -- Reference
  banner_id UUID REFERENCES upgrade_banners(id),
  tier_type VARCHAR(20),
  tier_level INTEGER,

  -- Context
  screen_name VARCHAR(50),
  trigger_type VARCHAR(50),

  -- Metadata
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_upgrade_tiers_type_level
  ON upgrade_tiers(tier_type, tier_level);
CREATE INDEX IF NOT EXISTS idx_upgrade_tiers_active
  ON upgrade_tiers(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_upgrade_tiers_slug
  ON upgrade_tiers(tier_slug);

CREATE INDEX IF NOT EXISTS idx_upgrade_banners_trigger
  ON upgrade_banners(trigger_type, trigger_screen);
CREATE INDEX IF NOT EXISTS idx_upgrade_banners_active
  ON upgrade_banners(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_upgrade_banners_key
  ON upgrade_banners(banner_key);

CREATE INDEX IF NOT EXISTS idx_upgrade_events_user
  ON upgrade_events(user_id);
CREATE INDEX IF NOT EXISTS idx_upgrade_events_type
  ON upgrade_events(event_type);
CREATE INDEX IF NOT EXISTS idx_upgrade_events_created
  ON upgrade_events(created_at DESC);

-- ============================================================
-- RLS POLICIES
-- ============================================================

ALTER TABLE upgrade_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE upgrade_banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE upgrade_events ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Public read active tiers" ON upgrade_tiers;
DROP POLICY IF EXISTS "Public read active banners" ON upgrade_banners;
DROP POLICY IF EXISTS "Service role manage tiers" ON upgrade_tiers;
DROP POLICY IF EXISTS "Service role manage banners" ON upgrade_banners;
DROP POLICY IF EXISTS "Service role manage events" ON upgrade_events;
DROP POLICY IF EXISTS "Users insert own events" ON upgrade_events;
DROP POLICY IF EXISTS "Users read own events" ON upgrade_events;

-- Public read for tiers and banners
CREATE POLICY "Public read active tiers" ON upgrade_tiers
  FOR SELECT USING (is_active = true);

CREATE POLICY "Public read active banners" ON upgrade_banners
  FOR SELECT USING (is_active = true);

-- Service role for admin
CREATE POLICY "Service role manage tiers" ON upgrade_tiers
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role manage banners" ON upgrade_banners
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role manage events" ON upgrade_events
  FOR ALL USING (true) WITH CHECK (true);

-- Users can insert own events
CREATE POLICY "Users insert own events" ON upgrade_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users read own events" ON upgrade_events
  FOR SELECT USING (auth.uid() = user_id);

-- ============================================================
-- FUNCTIONS
-- ============================================================

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_upgrade_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_upgrade_tiers_updated ON upgrade_tiers;
CREATE TRIGGER trigger_upgrade_tiers_updated
  BEFORE UPDATE ON upgrade_tiers
  FOR EACH ROW EXECUTE FUNCTION update_upgrade_updated_at();

DROP TRIGGER IF EXISTS trigger_upgrade_banners_updated ON upgrade_banners;
CREATE TRIGGER trigger_upgrade_banners_updated
  BEFORE UPDATE ON upgrade_banners
  FOR EACH ROW EXECUTE FUNCTION update_upgrade_updated_at();

-- Increment impressions
CREATE OR REPLACE FUNCTION increment_banner_impressions(banner_uuid UUID)
RETURNS void AS $$
BEGIN
  UPDATE upgrade_banners
  SET impressions = impressions + 1
  WHERE id = banner_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Increment clicks
CREATE OR REPLACE FUNCTION increment_banner_clicks(banner_uuid UUID)
RETURNS void AS $$
BEGIN
  UPDATE upgrade_banners
  SET clicks = clicks + 1
  WHERE id = banner_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- SEED DATA - TIERS
-- ============================================================

INSERT INTO upgrade_tiers (
  tier_type, tier_level, tier_name, tier_slug,
  price_vnd, price_usd, display_name, short_description,
  badge_text, is_featured, is_popular, features_json, display_order
) VALUES

-- FREE Tier
('scanner', 0, 'Free', 'scanner-free', 0, 0, 'Miễn phí',
 'Trải nghiệm cơ bản với giới hạn', NULL, false, false,
 '[
   {"key": "patterns", "label": "3 patterns cơ bản", "included": true, "limit": 3},
   {"key": "scans", "label": "3 scans/ngày", "included": true, "limit": 3},
   {"key": "alerts", "label": "Alerts", "included": false},
   {"key": "backtesting", "label": "Backtesting", "included": false}
 ]'::jsonb, 0),

-- Scanner Tiers
('scanner', 1, 'Scanner TIER 1', 'scanner-tier1', 11000000, 450, 'Cơ bản',
 'Bắt đầu trading với 24 patterns', NULL, false, false,
 '[
   {"key": "patterns", "label": "24 patterns cơ bản", "included": true, "limit": 24},
   {"key": "scans", "label": "10 scans/ngày", "included": true, "limit": 10},
   {"key": "alerts", "label": "Alerts cơ bản", "included": true},
   {"key": "backtesting", "label": "Backtesting", "included": false}
 ]'::jsonb, 1),

('scanner', 2, 'Scanner TIER 2', 'scanner-tier2', 21000000, 850, 'Pro',
 'Full patterns + Backtesting', 'PHỔ BIẾN', true, true,
 '[
   {"key": "patterns", "label": "50+ patterns", "included": true},
   {"key": "scans", "label": "Không giới hạn", "included": true},
   {"key": "alerts", "label": "Alerts nâng cao", "included": true},
   {"key": "backtesting", "label": "Backtesting đầy đủ", "included": true}
 ]'::jsonb, 2),

('scanner', 3, 'Scanner TIER 3', 'scanner-tier3', 68000000, 2800, 'Elite',
 'Trọn bộ + API + Support 1-1', 'TIẾT KIỆM', false, false,
 '[
   {"key": "patterns", "label": "Full + Custom patterns", "included": true},
   {"key": "scans", "label": "Unlimited + Priority", "included": true},
   {"key": "alerts", "label": "Real-time alerts", "included": true},
   {"key": "backtesting", "label": "Backtesting Pro", "included": true},
   {"key": "api", "label": "API Access", "included": true},
   {"key": "support", "label": "Hỗ trợ 1-1", "included": true}
 ]'::jsonb, 3),

-- Chatbot Tiers
('chatbot', 0, 'Chatbot Free', 'chatbot-free', 0, 0, 'Thử nghiệm',
 '10 Gems miễn phí', NULL, false, false,
 '[
   {"key": "gems", "label": "10 Gems", "included": true, "limit": 10},
   {"key": "readings", "label": "Readings cơ bản", "included": true}
 ]'::jsonb, 0),

('chatbot', 1, 'Gems Pack 100', 'chatbot-tier1', 5000000, 200, 'Basic',
 '100 Gems để trải nghiệm', NULL, false, false,
 '[
   {"key": "gems", "label": "100 Gems", "included": true, "limit": 100},
   {"key": "readings", "label": "Tất cả readings", "included": true},
   {"key": "history", "label": "Lịch sử 30 ngày", "included": true}
 ]'::jsonb, 1),

('chatbot', 2, 'Gems Pack 500', 'chatbot-tier2', 15000000, 600, 'Pro',
 '500 Gems + Ưu tiên', 'GIÁ TRỊ', true, true,
 '[
   {"key": "gems", "label": "500 Gems", "included": true, "limit": 500},
   {"key": "readings", "label": "Premium readings", "included": true},
   {"key": "history", "label": "Lịch sử unlimited", "included": true},
   {"key": "priority", "label": "Xử lý ưu tiên", "included": true}
 ]'::jsonb, 2),

('chatbot', 3, 'Gems Unlimited', 'chatbot-tier3', 50000000, 2000, 'Unlimited',
 'Không giới hạn Gems', NULL, false, false,
 '[
   {"key": "gems", "label": "Unlimited Gems", "included": true},
   {"key": "readings", "label": "VIP readings", "included": true},
   {"key": "history", "label": "Lịch sử unlimited", "included": true},
   {"key": "priority", "label": "Ưu tiên cao nhất", "included": true},
   {"key": "support", "label": "Hỗ trợ 1-1", "included": true}
 ]'::jsonb, 3)

ON CONFLICT (tier_type, tier_level) DO UPDATE SET
  tier_name = EXCLUDED.tier_name,
  price_vnd = EXCLUDED.price_vnd,
  features_json = EXCLUDED.features_json,
  updated_at = NOW();

-- ============================================================
-- SEED DATA - BANNERS
-- ============================================================

INSERT INTO upgrade_banners (
  banner_key, banner_type, title, subtitle, description,
  icon_name, cta_text, target_tier_type,
  trigger_type, trigger_screen, trigger_event,
  is_active, priority
) VALUES

-- Scanner Triggers
('scanner_quota_reached', 'popup',
 'Bạn đã hết lượt scan hôm nay!',
 'Nâng cấp để scan không giới hạn',
 'Với gói Pro, bạn có thể scan unlimited và mở khóa 50+ patterns premium.',
 'lock', 'Nâng cấp ngay', 'scanner',
 'quota_reached', 'ScannerScreen', 'scan_limit_hit',
 true, 100),

('scanner_pattern_locked', 'overlay',
 'Pattern Premium',
 'Cần nâng cấp để sử dụng',
 NULL, 'lock', 'Mở khóa', 'scanner',
 'feature_locked', 'ScannerScreen', 'pattern_tap_locked',
 true, 90),

('scanner_first_upgrade', 'bottom_sheet',
 'Mở khóa sức mạnh Scanner',
 'Nâng cấp để phát hiện nhiều cơ hội hơn',
 'Scanner Pro giúp bạn không bỏ lỡ bất kỳ tín hiệu trading nào.',
 'trending-up', 'Xem các gói', 'scanner',
 'first_use', 'ScannerScreen', 'first_scan_complete',
 true, 50),

-- GemMaster Triggers
('gems_depleted', 'popup',
 'Bạn đã hết Gems!',
 'Nạp thêm để tiếp tục sử dụng',
 'Mua Gems Pack để tiếp tục các readings và predictions.',
 'gem', 'Nạp Gems', 'chatbot',
 'quota_reached', 'GemMasterScreen', 'gems_zero',
 true, 100),

('gems_low', 'banner',
 'Sắp hết Gems',
 'Chỉ còn ít Gems, nạp thêm ngay',
 NULL, 'alert-circle', 'Nạp thêm', 'chatbot',
 'quota_low', 'GemMasterScreen', 'gems_low',
 true, 60),

('premium_reading', 'popup',
 'Reading Premium',
 'Cần Gems để thực hiện reading này',
 'Reading này cần 5 Gems. Bạn có muốn tiếp tục?',
 'sparkles', 'Thực hiện', 'chatbot',
 'feature_locked', 'GemMasterScreen', 'reading_premium',
 true, 80),

-- Courses Triggers
('course_locked', 'fullscreen',
 'Khóa học Premium',
 'Đăng ký để mở khóa toàn bộ nội dung',
 'Học từ các chuyên gia hàng đầu về trading và tâm linh.',
 'book-open', 'Đăng ký ngay', 'course',
 'feature_locked', 'CoursesScreen', 'course_tap_locked',
 true, 80),

-- Home Triggers
('home_upgrade_banner', 'banner',
 'Nâng cấp Premium để mở khóa tất cả',
 NULL, NULL, 'crown', 'Xem gói', 'scanner',
 'promotion', 'HomeScreen', 'home_load',
 true, 20),

-- Account Triggers
('account_free_user', 'banner',
 'Bạn đang dùng gói FREE',
 'Nâng cấp để mở khóa tất cả tính năng',
 NULL, 'arrow-up-circle', 'Xem gói nâng cấp', 'scanner',
 'account_status', 'AccountScreen', 'free_user',
 true, 30)

ON CONFLICT (banner_key) DO UPDATE SET
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- ============================================================
-- GRANT PERMISSIONS
-- ============================================================

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON upgrade_tiers TO anon, authenticated;
GRANT SELECT ON upgrade_banners TO anon, authenticated;
GRANT SELECT, INSERT ON upgrade_events TO authenticated;
GRANT EXECUTE ON FUNCTION increment_banner_impressions TO authenticated;
GRANT EXECUTE ON FUNCTION increment_banner_clicks TO authenticated;

-- ============================================================
-- VERIFY
-- ============================================================

SELECT 'upgrade_tiers' as table_name, COUNT(*) as row_count FROM upgrade_tiers
UNION ALL
SELECT 'upgrade_banners', COUNT(*) FROM upgrade_banners;
