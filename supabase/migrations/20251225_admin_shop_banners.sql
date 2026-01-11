-- =============================================
-- ADMIN SHOP BANNERS MANAGEMENT
-- Migration: 20251225_admin_shop_banners.sql
-- Adds admin features to shop_banners + tooltips + logs
-- =============================================

-- Add missing columns to shop_banners for admin features
ALTER TABLE shop_banners ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE shop_banners ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES profiles(id);
ALTER TABLE shop_banners ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;
ALTER TABLE shop_banners ADD COLUMN IF NOT EXISTS click_count INTEGER DEFAULT 0;
ALTER TABLE shop_banners ADD COLUMN IF NOT EXISTS background_color TEXT DEFAULT '#1a0b2e';
ALTER TABLE shop_banners ADD COLUMN IF NOT EXISTS text_color TEXT DEFAULT '#FFFFFF';

-- =============================================
-- ADMIN TOOLTIPS SEEN TABLE
-- Tracks which tooltips admin has seen for onboarding
-- =============================================
CREATE TABLE IF NOT EXISTS admin_tooltips_seen (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  tooltip_key TEXT NOT NULL,
  seen_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, tooltip_key)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_admin_tooltips_user ON admin_tooltips_seen(user_id);

-- RLS for admin_tooltips_seen
ALTER TABLE admin_tooltips_seen ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own tooltips" ON admin_tooltips_seen;
CREATE POLICY "Users can view own tooltips" ON admin_tooltips_seen
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own tooltips" ON admin_tooltips_seen;
CREATE POLICY "Users can insert own tooltips" ON admin_tooltips_seen
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own tooltips" ON admin_tooltips_seen;
CREATE POLICY "Users can delete own tooltips" ON admin_tooltips_seen
  FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- ADMIN BANNER LOGS TABLE
-- Tracks admin actions on shop banners
-- =============================================
CREATE TABLE IF NOT EXISTS admin_banner_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  banner_id UUID REFERENCES shop_banners(id) ON DELETE CASCADE,
  action TEXT NOT NULL, -- 'create', 'update', 'delete', 'toggle_active'
  admin_id UUID REFERENCES profiles(id),
  changes JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_admin_banner_logs_banner ON admin_banner_logs(banner_id);
CREATE INDEX IF NOT EXISTS idx_admin_banner_logs_admin ON admin_banner_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_banner_logs_created ON admin_banner_logs(created_at DESC);

-- RLS for admin_banner_logs
ALTER TABLE admin_banner_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view banner logs" ON admin_banner_logs;
CREATE POLICY "Admins can view banner logs" ON admin_banner_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

DROP POLICY IF EXISTS "Admins can insert banner logs" ON admin_banner_logs;
CREATE POLICY "Admins can insert banner logs" ON admin_banner_logs
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- =============================================
-- UPDATE SHOP_BANNERS RLS
-- Ensure admins can manage banners
-- =============================================

-- Allow admins to insert shop_banners
DROP POLICY IF EXISTS "Admins can insert shop_banners" ON shop_banners;
CREATE POLICY "Admins can insert shop_banners" ON shop_banners
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Allow admins to update shop_banners
DROP POLICY IF EXISTS "Admins can update shop_banners" ON shop_banners;
CREATE POLICY "Admins can update shop_banners" ON shop_banners
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Allow admins to delete shop_banners
DROP POLICY IF EXISTS "Admins can delete shop_banners" ON shop_banners;
CREATE POLICY "Admins can delete shop_banners" ON shop_banners
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- =============================================
-- HELPER FUNCTION: Increment banner view count
-- =============================================
CREATE OR REPLACE FUNCTION increment_shop_banner_view(banner_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE shop_banners
  SET view_count = COALESCE(view_count, 0) + 1
  WHERE id = banner_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- HELPER FUNCTION: Increment banner click count
-- =============================================
CREATE OR REPLACE FUNCTION increment_shop_banner_click(banner_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE shop_banners
  SET click_count = COALESCE(click_count, 0) + 1
  WHERE id = banner_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
