-- =====================================================
-- USER BADGES SYSTEM
-- Migration: 20241117_user_badges_system
-- Purpose: Add badge columns and badge definitions table
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- STEP 1: Add badge columns to users table
-- =====================================================
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS verified_seller BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS verified_trader BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS level_badge TEXT DEFAULT 'bronze',
ADD COLUMN IF NOT EXISTS role_badge TEXT,
ADD COLUMN IF NOT EXISTS achievement_badges JSONB DEFAULT '[]'::jsonb;

-- =====================================================
-- STEP 2: Create badge_definitions table
-- =====================================================
CREATE TABLE IF NOT EXISTS public.badge_definitions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  badge_type TEXT NOT NULL,
  badge_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon_name TEXT, -- Lucide icon name
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
-- STEP 3: Create indexes
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_users_verified_seller ON public.users(verified_seller) WHERE verified_seller = TRUE;
CREATE INDEX IF NOT EXISTS idx_users_verified_trader ON public.users(verified_trader) WHERE verified_trader = TRUE;
CREATE INDEX IF NOT EXISTS idx_users_level_badge ON public.users(level_badge);
CREATE INDEX IF NOT EXISTS idx_users_role_badge ON public.users(role_badge) WHERE role_badge IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_badge_definitions_type ON public.badge_definitions(badge_type);
CREATE INDEX IF NOT EXISTS idx_badge_definitions_id ON public.badge_definitions(badge_id);

-- =====================================================
-- STEP 4: Seed badge definitions
-- =====================================================
INSERT INTO public.badge_definitions (badge_type, badge_id, name, description, icon_name, color, animation, auto_award, requirement) VALUES

-- Verification Badges
('verification', 'verified_seller', 'Verified Seller', 'Người bán đã được GEM Platform xác minh', 'ShieldCheck', '#00FF88', 'pulse-glow', FALSE, 'Admin verified'),
('verification', 'verified_trader', 'Verified Trader', 'Trader đã xác minh qua KYC hoặc track record', 'BadgeCheck', '#3B82F6', 'pulse-glow', FALSE, 'KYC verified'),

-- Level Badges (Auto-awarded)
('level', 'bronze', 'Bronze Trader', 'Bắt đầu hành trình trading', 'TrendingUp', '#CD7F32', 'none', TRUE, 'Total P&L > 0 VND'),
('level', 'silver', 'Silver Trader', 'Trader có kinh nghiệm', 'TrendingUp', '#C0C0C0', 'subtle-shine', TRUE, 'Total P&L > 10M VND'),
('level', 'gold', 'Gold Trader', 'Trader xuất sắc', 'TrendingUp', '#FFD700', 'gold-shine', TRUE, 'Total P&L > 50M VND'),
('level', 'diamond', 'Diamond Trader', 'Top trader elite', 'Gem', '#B9F2FF', 'diamond-sparkle', TRUE, 'Total P&L > 100M VND'),

-- Role Badges (Admin granted)
('role', 'admin', 'Admin', 'Quản trị viên hệ thống', 'Shield', '#EF4444', 'admin-pulse', FALSE, 'Admin role'),
('role', 'moderator', 'Moderator', 'Điều hành viên cộng đồng', 'ShieldCheck', '#F59E0B', 'subtle-glow', FALSE, 'Moderator role'),
('role', 'instructor', 'Instructor', 'Giảng viên khóa học', 'GraduationCap', '#10B981', 'none', FALSE, 'Instructor role'),

-- Achievement Badges (Auto-awarded)
('achievement', 'top_trader', 'Top 10 Trader', 'Xếp hạng Top 10 Leaderboard', 'Trophy', '#FFBD59', 'trophy-shine', TRUE, 'Leaderboard Top 10'),
('achievement', 'pattern_master', 'Pattern Master', 'Chuyên gia phát hiện patterns', 'Target', '#8B5CF6', 'target-pulse', TRUE, '100+ patterns scanned'),
('achievement', 'consistent_trader', 'Consistent Trader', 'Trader ổn định', 'Activity', '#10B981', 'heartbeat', TRUE, '80%+ win rate (50+ trades)'),
('achievement', 'high_roller', 'High Roller', 'Giao dịch lớn thành công', 'DollarSign', '#10B981', 'money-rain', TRUE, 'Single trade profit > 10M VND'),
('achievement', 'early_adopter', 'Early Adopter', 'Người dùng đầu tiên', 'Rocket', '#6366F1', 'rocket-launch', FALSE, 'Joined during launch period');

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
      AND role_badge = 'admin'
    )
  );

-- =====================================================
-- STEP 6: Comments
-- =====================================================
COMMENT ON COLUMN users.verified_seller IS 'Người bán đã được admin xác minh';
COMMENT ON COLUMN users.verified_trader IS 'Trader đã xác minh (KYC hoặc track record)';
COMMENT ON COLUMN users.level_badge IS 'Bronze/Silver/Gold/Diamond based on P&L';
COMMENT ON COLUMN users.role_badge IS 'Admin/Moderator/Instructor role';
COMMENT ON COLUMN users.achievement_badges IS 'Array of achievement badge IDs earned';

COMMENT ON TABLE badge_definitions IS 'Badge types, icons, colors, and requirements';

-- =====================================================
-- STEP 7: Create helper function to check if user has achievement
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
-- STEP 8: Grant permissions
-- =====================================================
GRANT SELECT ON public.badge_definitions TO authenticated;
GRANT SELECT ON public.badge_definitions TO anon;

-- Force schema reload
NOTIFY pgrst, 'reload schema';

-- =====================================================
-- VERIFY TABLES CREATED
-- =====================================================
DO $$
DECLARE
  column_count INTEGER;
  badge_count INTEGER;
BEGIN
  -- Check columns added
  SELECT COUNT(*) INTO column_count
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'users'
    AND column_name IN ('verified_seller', 'verified_trader', 'level_badge', 'role_badge', 'achievement_badges');

  -- Check badges seeded
  SELECT COUNT(*) INTO badge_count
  FROM badge_definitions;

  IF column_count = 5 THEN
    RAISE NOTICE '✅ SUCCESS: All 5 badge columns added to users table';
  ELSE
    RAISE WARNING '⚠️  Only % badge columns added. Expected 5.', column_count;
  END IF;

  IF badge_count = 14 THEN
    RAISE NOTICE '✅ SUCCESS: All 14 badge definitions seeded';
  ELSE
    RAISE WARNING '⚠️  Only % badge definitions seeded. Expected 14.', badge_count;
  END IF;

  RAISE NOTICE '🎉 Badge system migration complete!';
END $$;
