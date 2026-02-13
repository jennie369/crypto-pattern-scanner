-- ============================================
-- SPONSOR BANNERS TABLE
-- Used for "Earn Money" promotional banners in Portfolio screen
-- Admin can manage banners via AdminSponsorBannersScreen
-- ============================================

-- Create sponsor_banners table
CREATE TABLE IF NOT EXISTS sponsor_banners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Banner content
  title TEXT NOT NULL,                    -- e.g., "Earn Money"
  subtitle TEXT,                          -- e.g., "Become a joker and win..."
  description TEXT,                       -- Long description
  image_url TEXT,                         -- Banner background image URL
  icon_url TEXT,                          -- Small icon (if any)

  -- Action
  action_type TEXT DEFAULT 'url',         -- 'url', 'screen', 'deeplink'
  action_value TEXT,                      -- URL or screen name to navigate to
  action_label TEXT DEFAULT 'Tìm hiểu thêm', -- Button text

  -- Display settings
  background_color TEXT DEFAULT '#1a0b2e', -- Banner background color
  text_color TEXT DEFAULT '#FFFFFF',       -- Text color
  accent_color TEXT DEFAULT '#FFBD59',     -- Accent/button color

  -- Targeting
  target_tiers TEXT[] DEFAULT ARRAY['FREE', 'TIER1', 'TIER2', 'TIER3', 'ADMIN'], -- Which tiers can see
  target_screens TEXT[] DEFAULT ARRAY['portfolio'], -- Which screens to display on

  -- Scheduling
  start_date TIMESTAMPTZ DEFAULT NOW(),
  end_date TIMESTAMPTZ,                    -- NULL = no end date

  -- Priority & Status
  priority INTEGER DEFAULT 0,              -- Higher = shown first
  is_active BOOLEAN DEFAULT true,
  is_dismissible BOOLEAN DEFAULT true,     -- Can user dismiss/hide

  -- Analytics
  view_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,

  -- Metadata
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_sponsor_banners_active ON sponsor_banners(is_active, start_date, end_date);
CREATE INDEX idx_sponsor_banners_priority ON sponsor_banners(priority DESC);
CREATE INDEX idx_sponsor_banners_screens ON sponsor_banners USING GIN(target_screens);

-- RLS Policies
ALTER TABLE sponsor_banners ENABLE ROW LEVEL SECURITY;

-- Public read access for active banners
CREATE POLICY "Anyone can view active banners" ON sponsor_banners
  FOR SELECT
  USING (
    is_active = true
    AND start_date <= NOW()
    AND (end_date IS NULL OR end_date > NOW())
  );

-- Admin-only write access
CREATE POLICY "Admins can manage banners" ON sponsor_banners
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'ADMIN'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'ADMIN'
    )
  );

-- Function to update updated_at
CREATE OR REPLACE FUNCTION update_sponsor_banner_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
DROP TRIGGER IF EXISTS trigger_update_sponsor_banner_updated_at ON sponsor_banners;
CREATE TRIGGER trigger_update_sponsor_banner_updated_at
  BEFORE UPDATE ON sponsor_banners
  FOR EACH ROW
  EXECUTE FUNCTION update_sponsor_banner_updated_at();

-- Function to increment view count
CREATE OR REPLACE FUNCTION increment_banner_view(banner_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE sponsor_banners
  SET view_count = view_count + 1
  WHERE id = banner_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment click count
CREATE OR REPLACE FUNCTION increment_banner_click(banner_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE sponsor_banners
  SET click_count = click_count + 1
  WHERE id = banner_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create dismissed_banners table for tracking user dismissals
CREATE TABLE IF NOT EXISTS dismissed_banners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  banner_id UUID REFERENCES sponsor_banners(id) ON DELETE CASCADE,
  dismissed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, banner_id)
);

-- RLS for dismissed_banners
ALTER TABLE dismissed_banners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their dismissed banners" ON dismissed_banners
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Insert sample banner data
INSERT INTO sponsor_banners (
  title,
  subtitle,
  description,
  image_url,
  action_type,
  action_value,
  action_label,
  background_color,
  accent_color,
  priority,
  is_active
) VALUES (
  'Earn Money',
  'Become a joker and win exclusive rewards',
  'Tham gia chương trình Affiliate của GEM để kiếm hoa hồng lên đến 30% từ mỗi đơn hàng giới thiệu thành công.',
  'https://images.unsplash.com/photo-1639762681057-408e52192e55?w=800',
  'screen',
  'AffiliateProgram',
  'Tìm hiểu thêm',
  '#1a0b2e',
  '#FFBD59',
  100,
  true
);

-- Add comment
COMMENT ON TABLE sponsor_banners IS 'Promotional banners displayed in Portfolio screen and other locations. Managed by admin via AdminSponsorBannersScreen.';
