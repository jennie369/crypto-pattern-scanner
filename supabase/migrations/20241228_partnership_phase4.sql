-- ============================================================
-- PARTNERSHIP SYSTEM v3.0 - PHASE 4 MIGRATION
-- Date: 2024-12-28
-- Reference: GEM_PARTNERSHIP_IMPLEMENTATION_PHASE4.md
-- ============================================================

-- ============================================================
-- 1. PARTNERSHIP RESOURCES TABLE
-- Stores resources for partners (banners, videos, templates, etc.)
-- ============================================================

CREATE TABLE IF NOT EXISTS partnership_resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Resource info
  title VARCHAR(255) NOT NULL,
  description TEXT,
  resource_type VARCHAR(50) NOT NULL CHECK (
    resource_type IN ('banner', 'video', 'template', 'guide', 'creative_kit', 'other')
  ),

  -- File info
  file_url TEXT NOT NULL,
  thumbnail_url TEXT,
  file_size INTEGER, -- in bytes
  file_format VARCHAR(50),

  -- Access control
  access_level VARCHAR(50) NOT NULL DEFAULT 'all' CHECK (
    access_level IN ('all', 'ctv_only', 'kol_only', 'gold_plus', 'platinum_plus', 'diamond_only')
  ),

  -- Featured & ordering
  is_featured BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0,

  -- Metadata
  tags TEXT[],
  metadata JSONB DEFAULT '{}',

  -- Usage tracking
  download_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,

  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- RLS for partnership_resources
ALTER TABLE partnership_resources ENABLE ROW LEVEL SECURITY;

-- Anyone can view active resources (access control in app layer)
CREATE POLICY "Anyone can view active resources" ON partnership_resources
  FOR SELECT
  USING (is_active = TRUE AND (expires_at IS NULL OR expires_at > NOW()));

-- Only admins can manage resources
CREATE POLICY "Admins can manage resources" ON partnership_resources
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE
    )
  );

-- Index for fast access
CREATE INDEX IF NOT EXISTS idx_partnership_resources_type ON partnership_resources(resource_type);
CREATE INDEX IF NOT EXISTS idx_partnership_resources_access ON partnership_resources(access_level);
CREATE INDEX IF NOT EXISTS idx_partnership_resources_featured ON partnership_resources(is_featured);

-- ============================================================
-- 2. RESOURCE DOWNLOADS TABLE
-- Track individual downloads for analytics
-- ============================================================

CREATE TABLE IF NOT EXISTS resource_downloads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resource_id UUID REFERENCES partnership_resources(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  downloaded_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address VARCHAR(50),
  user_agent TEXT
);

-- RLS for resource_downloads
ALTER TABLE resource_downloads ENABLE ROW LEVEL SECURITY;

-- Users can view their own downloads
CREATE POLICY "Users can view own downloads" ON resource_downloads
  FOR SELECT
  USING (auth.uid() = user_id);

-- Insert allowed for authenticated users
CREATE POLICY "Authenticated users can track downloads" ON resource_downloads
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Index for analytics
CREATE INDEX IF NOT EXISTS idx_resource_downloads_resource ON resource_downloads(resource_id);
CREATE INDEX IF NOT EXISTS idx_resource_downloads_user ON resource_downloads(user_id);

-- ============================================================
-- 3. ADMIN LOGS TABLE (for audit trail)
-- ============================================================

CREATE TABLE IF NOT EXISTS admin_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID REFERENCES auth.users(id),
  action_type VARCHAR(100) NOT NULL,
  target_type VARCHAR(50), -- 'partnership', 'user', 'resource', etc.
  target_id UUID,
  details JSONB DEFAULT '{}',
  ip_address VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for admin_logs
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view and insert logs
CREATE POLICY "Admins can view logs" ON admin_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE
    )
  );

CREATE POLICY "Admins can insert logs" ON admin_logs
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE
    )
  );

-- Index for fast queries
CREATE INDEX IF NOT EXISTS idx_admin_logs_action ON admin_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_admin_logs_target ON admin_logs(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_admin ON admin_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_created ON admin_logs(created_at DESC);

-- ============================================================
-- 4. HELPER FUNCTIONS
-- ============================================================

-- Function to increment download count
CREATE OR REPLACE FUNCTION increment_download_count(resource_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE partnership_resources
  SET download_count = download_count + 1
  WHERE id = resource_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment view count
CREATE OR REPLACE FUNCTION increment_view_count(resource_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE partnership_resources
  SET view_count = view_count + 1
  WHERE id = resource_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check resource access for a user
CREATE OR REPLACE FUNCTION check_resource_access(
  p_user_id UUID,
  p_access_level VARCHAR
) RETURNS BOOLEAN AS $$
DECLARE
  v_profile RECORD;
BEGIN
  -- Get user's affiliate profile
  SELECT role, ctv_tier, is_kol
  INTO v_profile
  FROM affiliate_profiles
  WHERE user_id = p_user_id AND is_active = TRUE;

  -- If no profile, only 'all' is accessible
  IF v_profile IS NULL THEN
    RETURN p_access_level = 'all';
  END IF;

  -- Check access level
  CASE p_access_level
    WHEN 'all' THEN RETURN TRUE;
    WHEN 'ctv_only' THEN RETURN v_profile.role = 'ctv';
    WHEN 'kol_only' THEN RETURN v_profile.is_kol = TRUE;
    WHEN 'gold_plus' THEN RETURN v_profile.ctv_tier IN ('gold', 'platinum', 'diamond') OR v_profile.is_kol = TRUE;
    WHEN 'platinum_plus' THEN RETURN v_profile.ctv_tier IN ('platinum', 'diamond') OR v_profile.is_kol = TRUE;
    WHEN 'diamond_only' THEN RETURN v_profile.ctv_tier = 'diamond' OR v_profile.is_kol = TRUE;
    ELSE RETURN FALSE;
  END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 5. UPDATE affiliate_profiles IF NEEDED
-- Add any missing columns from Phase 3
-- ============================================================

-- Ensure resource_access_level column exists
ALTER TABLE affiliate_profiles
  ADD COLUMN IF NOT EXISTS resource_access_level VARCHAR(20) DEFAULT 'basic';

-- Ensure is_kol column exists
ALTER TABLE affiliate_profiles
  ADD COLUMN IF NOT EXISTS is_kol BOOLEAN DEFAULT FALSE;

-- Ensure kol_approved_at column exists
ALTER TABLE affiliate_profiles
  ADD COLUMN IF NOT EXISTS kol_approved_at TIMESTAMPTZ;

-- ============================================================
-- 6. SEED SAMPLE RESOURCES
-- ============================================================

-- Insert some sample resources (can be removed in production)
INSERT INTO partnership_resources (title, description, resource_type, file_url, access_level, is_featured, display_order)
VALUES
  ('Banner GEM - 1200x628', 'Banner quang cao cho Facebook & Instagram', 'banner', '/resources/banners/gem_1200x628.png', 'all', TRUE, 1),
  ('Banner GEM - 1080x1080', 'Banner vuong cho Instagram Feed', 'banner', '/resources/banners/gem_1080x1080.png', 'all', TRUE, 2),
  ('Video Intro GEM 30s', 'Video gioi thieu GEM 30 giay', 'video', '/resources/videos/gem_intro_30s.mp4', 'all', TRUE, 3),
  ('Huong dan CTV', 'Tai lieu huong dan day du cho CTV', 'guide', '/resources/guides/ctv_guide.pdf', 'ctv_only', FALSE, 4),
  ('KOL Creative Kit', 'Bo tai nguyen danh rieng cho KOL', 'creative_kit', '/resources/kits/kol_kit.zip', 'kol_only', TRUE, 5),
  ('Template Stories', 'Mau Instagram Stories', 'template', '/resources/templates/stories_template.psd', 'gold_plus', FALSE, 6)
ON CONFLICT DO NOTHING;

-- ============================================================
-- VERIFICATION
-- ============================================================

SELECT 'Phase 4 migration completed successfully!' as status;
