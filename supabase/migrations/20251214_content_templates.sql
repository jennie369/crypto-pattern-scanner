-- ============================================================
-- Migration: Create content_templates table
-- Date: 2024-12-14
-- Description: Bảng lưu templates cho auto-post content
-- ============================================================

-- Create table
CREATE TABLE IF NOT EXISTS content_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Basic info
  name VARCHAR(200) NOT NULL,
  description TEXT,
  category VARCHAR(100), -- 'spiritual', 'trading', 'education', 'promotion'

  -- Template content
  title_template VARCHAR(500),
  content_template TEXT, -- HTML content
  content_type VARCHAR(50) DEFAULT 'post', -- 'post', 'video', 'short', 'reel', 'story'

  -- Defaults
  default_platform VARCHAR(50) DEFAULT 'gemral', -- 'gemral', 'facebook', 'youtube', etc.
  default_pillar VARCHAR(100), -- 'spiritual', 'trading', 'money', 'healing', 'community'
  default_hashtags TEXT[],

  -- Variables (for dynamic content)
  variables JSONB DEFAULT '[]', -- [{ name: 'pattern_name', default: 'DPD' }]

  -- Media
  thumbnail_url VARCHAR(500),
  media_urls TEXT[],

  -- Stats
  usage_count INT DEFAULT 0,
  total_views INT DEFAULT 0,
  total_likes INT DEFAULT 0,
  avg_engagement_rate DECIMAL(5,2) DEFAULT 0,

  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  is_system BOOLEAN DEFAULT FALSE,

  -- Metadata
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_content_templates_category ON content_templates(category);
CREATE INDEX IF NOT EXISTS idx_content_templates_type ON content_templates(content_type);
CREATE INDEX IF NOT EXISTS idx_content_templates_platform ON content_templates(default_platform);
CREATE INDEX IF NOT EXISTS idx_content_templates_usage ON content_templates(usage_count DESC);
CREATE INDEX IF NOT EXISTS idx_content_templates_active ON content_templates(is_active) WHERE is_active = true;

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_content_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_content_templates_updated_at ON content_templates;
CREATE TRIGGER trigger_content_templates_updated_at
  BEFORE UPDATE ON content_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_content_templates_updated_at();

-- ============================================================
-- RLS Policies
-- ============================================================
ALTER TABLE content_templates ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
CREATE POLICY "Admins can manage content templates"
  ON content_templates
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Authenticated users can view active templates
CREATE POLICY "Users can view active content templates"
  ON content_templates
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- ============================================================
-- RPC Function: Increment content template usage
-- ============================================================
CREATE OR REPLACE FUNCTION increment_content_template_usage(
  p_template_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE content_templates
  SET
    usage_count = usage_count + 1,
    updated_at = NOW()
  WHERE id = p_template_id;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION increment_content_template_usage TO authenticated;

-- ============================================================
-- Seed default content templates
-- ============================================================
INSERT INTO content_templates (name, description, category, title_template, content_template, content_type, default_platform, default_pillar, default_hashtags, is_system)
VALUES
  -- Trading templates
  ('Pattern Education', 'Template bài viết giáo dục về pattern', 'trading',
   'Tại sao {{pattern_name}} có winrate {{winrate}}%?',
   '<h2>Giới thiệu {{pattern_name}} Pattern</h2>
<p>{{pattern_name}} là một trong những pattern có <strong>tỷ lệ thắng cao nhất</strong> trong GEM Frequency Method.</p>

<h3>Cách nhận biết</h3>
<ul>
  <li>{{feature_1}}</li>
  <li>{{feature_2}}</li>
  <li>{{feature_3}}</li>
</ul>

<h3>Điểm vào lệnh</h3>
<p>{{entry_point}}</p>

<h3>Mục tiêu và stoploss</h3>
<p>TP: {{tp_ratio}} | SL: {{sl_ratio}}</p>

<p><em>Xem thêm trong Scanner để tìm {{pattern_name}} đang hình thành!</em></p>',
   'post', 'gemral', 'trading',
   ARRAY['trading', 'pattern', 'education', 'crypto'],
   true),

  ('Crystal Guide', 'Template giới thiệu đá phong thủy', 'spiritual',
   '💎 {{crystal_name}} - Năng lượng {{energy_type}}',
   '<h2>{{crystal_name}}</h2>
<p><strong>Màu sắc:</strong> {{color}}</p>
<p><strong>Chakra:</strong> {{chakra}}</p>

<h3>Công dụng chính</h3>
<ul>
  <li>{{benefit_1}}</li>
  <li>{{benefit_2}}</li>
  <li>{{benefit_3}}</li>
</ul>

<h3>Cách sử dụng</h3>
<p>{{usage_guide}}</p>

<h3>Lưu ý</h3>
<p>{{care_tips}}</p>

<p><a href="/shop">👉 Xem sản phẩm {{crystal_name}} trong Shop</a></p>',
   'post', 'gemral', 'spiritual',
   ARRAY['crystal', 'phongthuy', 'energy', 'healing'],
   true),

  ('Success Story', 'Template chia sẻ câu chuyện thành công', 'community',
   '🌟 Câu chuyện của {{user_name}}: {{title}}',
   '<h2>{{title}}</h2>

<blockquote>
  <p>"{{quote}}"</p>
  <footer>— {{user_name}}, {{user_title}}</footer>
</blockquote>

<h3>Hành trình</h3>
<p>{{journey_description}}</p>

<h3>Kết quả đạt được</h3>
<ul>
  <li>{{result_1}}</li>
  <li>{{result_2}}</li>
  <li>{{result_3}}</li>
</ul>

<h3>Lời khuyên</h3>
<p>{{advice}}</p>

<p><em>Bạn cũng có thể đạt được như {{user_name}}. Bắt đầu ngay hôm nay!</em></p>',
   'post', 'gemral', 'community',
   ARRAY['success', 'story', 'inspiration', 'community'],
   true),

  ('Daily Frequency', 'Template tần số hàng ngày', 'spiritual',
   '🔮 Tần số ngày {{date}}: Số {{number}}',
   '<h2>Tần số ngày {{date}}</h2>

<h3>Con số chủ đạo: {{number}}</h3>
<p>{{number_meaning}}</p>

<h3>Năng lượng ngày</h3>
<p>{{daily_energy}}</p>

<h3>Lời khuyên cho hôm nay</h3>
<ul>
  <li>💰 Tài chính: {{finance_advice}}</li>
  <li>❤️ Tình cảm: {{love_advice}}</li>
  <li>💼 Sự nghiệp: {{career_advice}}</li>
</ul>

<p><a href="/gemmaster">👉 Nhận reading cá nhân từ GEM Master</a></p>',
   'post', 'gemral', 'spiritual',
   ARRAY['frequency', 'numerology', 'daily', 'energy'],
   true)

ON CONFLICT DO NOTHING;
