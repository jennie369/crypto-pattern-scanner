-- ============================================
-- MIGRATION: 20251202_platform_connections.sql
-- Description: Social platform credentials/connections
-- Author: Claude AI
-- Date: 2024-12-02
-- ============================================

-- ========== TABLE: platform_connections ==========
CREATE TABLE IF NOT EXISTS platform_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Platform info
  platform VARCHAR(50) NOT NULL UNIQUE,
  -- platform: 'gemral', 'facebook', 'tiktok', 'youtube', 'threads', 'instagram'

  display_name VARCHAR(100) NOT NULL,

  -- Connection status
  is_connected BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,

  -- Credentials (encrypted in production)
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,

  -- Platform-specific IDs
  page_id VARCHAR(255), -- Facebook Page ID
  channel_id VARCHAR(255), -- YouTube Channel ID
  account_id VARCHAR(255), -- Generic account ID

  -- Settings
  settings JSONB DEFAULT '{}',
  -- Example: {"auto_hashtags": true, "default_visibility": "public"}

  -- Metadata
  connected_at TIMESTAMPTZ,
  last_used_at TIMESTAMPTZ,
  last_error TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========== INDEXES ==========
CREATE INDEX IF NOT EXISTS idx_platform_connections_platform
  ON platform_connections(platform);

CREATE INDEX IF NOT EXISTS idx_platform_connections_active
  ON platform_connections(is_active, is_connected);

-- ========== RLS POLICIES ==========
ALTER TABLE platform_connections ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Super admins can manage connections" ON platform_connections;
DROP POLICY IF EXISTS "Admins can view connections" ON platform_connections;

-- Only super admins can manage platform connections
CREATE POLICY "Super admins can manage connections"
  ON platform_connections
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );

-- Admins can view connections (not tokens)
CREATE POLICY "Admins can view connections"
  ON platform_connections
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- ========== TRIGGERS ==========
-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_platform_connections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_platform_connections_updated_at ON platform_connections;

CREATE TRIGGER trigger_platform_connections_updated_at
  BEFORE UPDATE ON platform_connections
  FOR EACH ROW
  EXECUTE FUNCTION update_platform_connections_updated_at();

-- ========== SEED DATA ==========
INSERT INTO platform_connections (platform, display_name, is_active) VALUES
  ('gemral', 'Gemral Feed', true),
  ('facebook', 'Facebook Page', true),
  ('youtube', 'YouTube', true),
  ('tiktok', 'TikTok', true),
  ('threads', 'Threads', true),
  ('instagram', 'Instagram', true)
ON CONFLICT (platform) DO NOTHING;

-- ========== COMMENTS ==========
COMMENT ON TABLE platform_connections IS 'Stores credentials and settings for connected social platforms';
COMMENT ON COLUMN platform_connections.platform IS 'Platform identifier: gemral, facebook, tiktok, youtube, threads, instagram';
COMMENT ON COLUMN platform_connections.access_token IS 'OAuth access token - encrypted in production';
COMMENT ON COLUMN platform_connections.settings IS 'Platform-specific settings as JSONB';

-- ========== DONE ==========
SELECT 'platform_connections table created successfully' AS result;
