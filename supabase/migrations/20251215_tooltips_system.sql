-- ============================================================
-- TOOLTIPS & FEATURE DISCOVERY SYSTEM
-- Migration: 20251215_tooltips_system.sql
-- Purpose: Track user tutorial completion and feature discovery
-- ============================================================

-- 1. Feature tutorial completions tracking (renamed to avoid conflict with user_tutorials)
CREATE TABLE IF NOT EXISTS feature_tutorial_completions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  feature VARCHAR(50) NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  skipped BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, feature)
);

-- Index for quick lookup
CREATE INDEX IF NOT EXISTS idx_feature_tutorial_user ON feature_tutorial_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_feature_tutorial_feature ON feature_tutorial_completions(feature);

-- 2. Feature discovery prompts (admin-defined tooltips)
CREATE TABLE IF NOT EXISTS feature_discovery_prompts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  feature VARCHAR(50) NOT NULL UNIQUE,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  screen VARCHAR(100), -- Which screen to show on
  tooltip_position VARCHAR(50) DEFAULT 'bottom', -- 'top', 'bottom', 'center'
  icon VARCHAR(50), -- lucide icon name
  cta_text VARCHAR(100) DEFAULT 'Got it!',
  priority INT DEFAULT 0, -- Higher = show first
  is_active BOOLEAN DEFAULT true,
  show_once BOOLEAN DEFAULT true, -- Only show once per user
  trigger_condition JSONB DEFAULT '{}', -- Custom conditions
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. RLS Policies
ALTER TABLE feature_tutorial_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_discovery_prompts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first
DROP POLICY IF EXISTS "Users manage own feature tutorials" ON feature_tutorial_completions;
DROP POLICY IF EXISTS "Anyone can read feature prompts" ON feature_discovery_prompts;
DROP POLICY IF EXISTS "Admins manage feature prompts" ON feature_discovery_prompts;

-- Users can manage their own tutorials
CREATE POLICY "Users manage own feature tutorials" ON feature_tutorial_completions
  FOR ALL USING (user_id = auth.uid());

-- Everyone can read feature prompts
CREATE POLICY "Anyone can read feature prompts" ON feature_discovery_prompts
  FOR SELECT USING (is_active = true);

-- Admins can manage feature prompts
CREATE POLICY "Admins manage feature prompts" ON feature_discovery_prompts
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- 4. Insert default feature discovery prompts
INSERT INTO feature_discovery_prompts (feature, title, description, screen, icon, priority) VALUES
  ('scanner_intro', 'Scanner Patterns', 'Quét và phát hiện các mẫu hình kỹ thuật trên biểu đồ crypto. Chọn coin và timeframe để bắt đầu!', 'Scanner', 'scan', 100),
  ('gemmaster_intro', 'Gem Master AI', 'Trò chuyện với AI về crystal, năng lượng, và nhận lời khuyên tâm linh. Bạn cũng có thể bốc bài Tarot hoặc gieo quẻ Kinh Dịch!', 'GemMaster', 'sparkles', 90),
  ('portfolio_intro', 'Portfolio Tracker', 'Theo dõi portfolio crypto của bạn. Thêm vị thế và xem tổng quan lợi nhuận/lỗ.', 'Portfolio', 'briefcase', 80),
  ('forum_intro', 'Cộng đồng', 'Chia sẻ phân tích, đặt câu hỏi và kết nối với cộng đồng trader khác.', 'Forum', 'users', 70),
  ('shop_intro', 'Shop Crystals', 'Khám phá bộ sưu tập crystal và sản phẩm tâm linh cao cấp.', 'Shop', 'shopping-bag', 60),
  ('courses_intro', 'Khóa học', 'Học trading và tâm linh từ các chuyên gia. Nâng cao kiến thức của bạn!', 'Courses', 'graduation-cap', 50),
  ('tarot_intro', 'Tarot Reading', 'Bốc bài Tarot hàng ngày để nhận thông điệp từ vũ trụ. Mỗi lá bài mang một ý nghĩa riêng.', 'Tarot', 'layers', 40),
  ('iching_intro', 'I Ching', 'Gieo quẻ Kinh Dịch - một trong những hệ thống bói toán cổ xưa nhất của nhân loại.', 'IChing', 'book-open', 30)
ON CONFLICT (feature) DO NOTHING;

-- 5. Function to check if user should see a tutorial
DROP FUNCTION IF EXISTS should_show_tutorial(UUID, VARCHAR);
CREATE OR REPLACE FUNCTION should_show_tutorial(
  p_user_id UUID,
  p_feature VARCHAR(50)
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if user has already completed/skipped this tutorial
  IF EXISTS (
    SELECT 1 FROM feature_tutorial_completions
    WHERE user_id = p_user_id AND feature = p_feature
  ) THEN
    RETURN false;
  END IF;

  -- Check if feature prompt exists and is active
  IF EXISTS (
    SELECT 1 FROM feature_discovery_prompts
    WHERE feature = p_feature AND is_active = true
  ) THEN
    RETURN true;
  END IF;

  RETURN false;
END;
$$ LANGUAGE plpgsql;

-- 6. Function to get next tutorial for user
DROP FUNCTION IF EXISTS get_next_tutorial(UUID);
CREATE OR REPLACE FUNCTION get_next_tutorial(p_user_id UUID)
RETURNS TABLE (
  out_feature VARCHAR(50),
  out_title VARCHAR(200),
  out_description TEXT,
  out_screen VARCHAR(100),
  out_icon VARCHAR(50),
  out_cta_text VARCHAR(100),
  out_tooltip_position VARCHAR(50)
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    fdp.feature::VARCHAR(50),
    fdp.title::VARCHAR(200),
    fdp.description::TEXT,
    fdp.screen::VARCHAR(100),
    fdp.icon::VARCHAR(50),
    fdp.cta_text::VARCHAR(100),
    fdp.tooltip_position::VARCHAR(50)
  FROM feature_discovery_prompts fdp
  WHERE fdp.is_active = true
    AND NOT EXISTS (
      SELECT 1 FROM feature_tutorial_completions ftc
      WHERE ftc.user_id = p_user_id AND ftc.feature = fdp.feature
    )
  ORDER BY fdp.priority DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;
