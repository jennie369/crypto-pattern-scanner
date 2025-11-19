-- =====================================================
-- USER BADGES SYSTEM - UPDATE VERSION
-- Only adds missing columns, updates existing badges
-- =====================================================

-- =====================================================
-- STEP 1: Add badge columns to users table (if not exist)
-- =====================================================
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS verified_seller BOOLEAN DEFAULT FALSE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS verified_trader BOOLEAN DEFAULT FALSE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS level_badge TEXT DEFAULT 'bronze';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role_badge TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS achievement_badges JSONB DEFAULT '[]'::jsonb;

-- =====================================================
-- STEP 2: Create badge_definitions table if not exists
-- =====================================================
CREATE TABLE IF NOT EXISTS public.badge_definitions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  badge_type TEXT NOT NULL,
  badge_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon_name TEXT,
  color TEXT,
  bg_gradient TEXT,
  animation TEXT,
  requirement TEXT,
  auto_award BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT badge_type_check CHECK (
    badge_type IN ('verification', 'tier', 'level', 'role', 'achievement')
  )
);

-- =====================================================
-- STEP 3: Create indexes (if not exist)
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_users_verified_seller ON public.users(verified_seller) WHERE verified_seller = TRUE;
CREATE INDEX IF NOT EXISTS idx_users_verified_trader ON public.users(verified_trader) WHERE verified_trader = TRUE;
CREATE INDEX IF NOT EXISTS idx_users_level_badge ON public.users(level_badge);
CREATE INDEX IF NOT EXISTS idx_users_role_badge ON public.users(role_badge) WHERE role_badge IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_badge_definitions_type ON public.badge_definitions(badge_type);
CREATE INDEX IF NOT EXISTS idx_badge_definitions_id ON public.badge_definitions(badge_id);

-- =====================================================
-- STEP 4: UPSERT badge definitions (INSERT or UPDATE)
-- =====================================================
INSERT INTO public.badge_definitions (badge_type, badge_id, name, description, icon_name, color, animation, auto_award, requirement) VALUES

-- Verification Badges
('verification', 'verified_seller', 'Verified Seller', 'Người bán đã được GEM Platform xác minh', 'ShieldCheck', '#00FF88', 'pulse-glow', FALSE, 'Admin verified'),
('verification', 'verified_trader', 'Verified Trader', 'Trader đã xác minh qua KYC hoặc track record', 'BadgeCheck', '#3B82F6', 'pulse-glow', FALSE, 'KYC verified'),

-- Tier Badges
('tier', 'tier_free', 'Free User', 'Người dùng miễn phí', 'User', '#7B68EE', 'none', FALSE, 'scanner_tier = FREE'),
('tier', 'tier_1', 'Basic Member', 'TIER 1 - Basic subscriber', 'Star', '#00D9FF', 'subtle-glow', FALSE, 'scanner_tier = TIER1'),
('tier', 'tier_2', 'Premium Member', 'TIER 2 - Premium subscriber', 'Sparkles', '#FFBD59', 'gold-shine', FALSE, 'scanner_tier = TIER2'),
('tier', 'tier_3', 'VIP Member', 'TIER 3 - VIP Elite subscriber', 'Crown', '#FFFFFF', 'premium-glow', FALSE, 'scanner_tier = TIER3'),

-- Level Badges (Auto-awarded based on win rate)
('level', 'bronze', 'Bronze Trader', 'Win rate < 60%', 'TrendingUp', '#CD7F32', 'none', TRUE, 'Win rate < 60%'),
('level', 'silver', 'Silver Trader', 'Win rate 60-74%', 'TrendingUp', '#C0C0C0', 'subtle-shine', TRUE, 'Win rate 60-74%'),
('level', 'gold', 'Gold Trader', 'Win rate 75-84%', 'TrendingUp', '#FFD700', 'gold-shine', TRUE, 'Win rate 75-84%'),
('level', 'platinum', 'Platinum Trader', 'Win rate 85-94%', 'Award', '#E5E4E2', 'platinum-shine', TRUE, 'Win rate 85-94%'),
('level', 'diamond', 'Diamond Trader', 'Win rate ≥ 95%', 'Gem', '#B9F2FF', 'diamond-sparkle', TRUE, 'Win rate ≥ 95%'),

-- Role Badges (Admin granted)
('role', 'admin', 'Admin', 'Quản trị viên hệ thống', 'Shield', '#EF4444', 'admin-pulse', FALSE, 'Admin role'),
('role', 'moderator', 'Moderator', 'Điều hành viên cộng đồng', 'ShieldCheck', '#F59E0B', 'subtle-glow', FALSE, 'Moderator role'),
('role', 'mentor', 'Mentor', 'Người hướng dẫn', 'GraduationCap', '#10B981', 'none', FALSE, 'Mentor role'),
('role', 'partner', 'Partner', 'Đối tác chính thức', 'Handshake', '#8B5CF6', 'subtle-glow', FALSE, 'Official partner'),

-- Achievement Badges
('achievement', 'top_trader', 'Top Trader', 'Top 10 Leaderboard', 'Trophy', '#FFBD59', 'trophy-shine', TRUE, 'Leaderboard Top 10'),
('achievement', 'high_roller', 'High Roller', 'Giao dịch lớn thành công', 'DollarSign', '#10B981', 'money-rain', TRUE, 'Single trade profit > 10M'),
('achievement', 'consistent', 'Consistent Trader', 'Trader ổn định', 'Activity', '#10B981', 'heartbeat', TRUE, '80%+ win rate (50+ trades)'),
('achievement', 'perfect_week', 'Perfect Week', 'Tuần giao dịch hoàn hảo', 'Calendar', '#3B82F6', 'sparkle', TRUE, '100% win rate in a week'),
('achievement', 'comeback_king', 'Comeback King', 'Phục hồi sau thua lỗ', 'TrendingUp', '#F59E0B', 'bounce', TRUE, 'Recover from -20% to profit'),
('achievement', 'risk_taker', 'Risk Taker', 'Nhà đầu tư mạo hiểm', 'Zap', '#EF4444', 'electric', TRUE, 'High-risk high-reward trades')

ON CONFLICT (badge_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon_name = EXCLUDED.icon_name,
  color = EXCLUDED.color,
  bg_gradient = EXCLUDED.bg_gradient,
  animation = EXCLUDED.animation,
  auto_award = EXCLUDED.auto_award,
  requirement = EXCLUDED.requirement;

-- =====================================================
-- STEP 5: Enable RLS on badge_definitions
-- =====================================================
ALTER TABLE public.badge_definitions ENABLE ROW LEVEL SECURITY;

-- Everyone can read badge definitions
DROP POLICY IF EXISTS "Badge definitions are public" ON public.badge_definitions;
CREATE POLICY "Badge definitions are public"
  ON public.badge_definitions FOR SELECT
  USING (true);

-- Only admins can modify badge definitions
DROP POLICY IF EXISTS "Only admins can modify badge definitions" ON public.badge_definitions;
CREATE POLICY "Only admins can modify badge definitions"
  ON public.badge_definitions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- =====================================================
-- STEP 6: Helper function
-- =====================================================
CREATE OR REPLACE FUNCTION public.user_has_achievement(
  user_id_param UUID,
  achievement_id_param TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users
    WHERE id = user_id_param
    AND achievement_badges ? achievement_id_param
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- STEP 7: Grant permissions
-- =====================================================
GRANT SELECT ON public.badge_definitions TO authenticated;
GRANT SELECT ON public.badge_definitions TO anon;

-- Verify
DO $$
DECLARE
  badge_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO badge_count FROM badge_definitions;
  RAISE NOTICE '✅ Badge system updated! Total badges: %', badge_count;
  RAISE NOTICE '📊 Breakdown:';
  RAISE NOTICE '   - Verification: 2';
  RAISE NOTICE '   - Tier: 4';
  RAISE NOTICE '   - Level: 5';
  RAISE NOTICE '   - Role: 4';
  RAISE NOTICE '   - Achievement: 6';
  RAISE NOTICE '   - TOTAL: 21 badges';
END $$;
