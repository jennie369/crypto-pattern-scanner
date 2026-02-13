-- ============================================================
-- Migration: Create notification_templates table
-- Date: 2024-12-14
-- Description: Bảng lưu templates cho push notifications
-- ============================================================

-- Create table
CREATE TABLE IF NOT EXISTS notification_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Basic info
  name VARCHAR(200) NOT NULL,
  description TEXT,
  category VARCHAR(100), -- 'spiritual', 'trading', 'personalized', 'market'
  type VARCHAR(50) DEFAULT 'push', -- 'push' or 'post'

  -- Template content
  title_template VARCHAR(100) NOT NULL,
  body_template VARCHAR(255) NOT NULL,
  deep_link_template VARCHAR(500),
  image_url VARCHAR(500),

  -- Variables (for dynamic content)
  variables JSONB DEFAULT '[]', -- [{ name: 'user_name', default: 'bạn' }]

  -- Defaults
  default_segment VARCHAR(100) DEFAULT 'all',
  default_time TIME,

  -- Stats
  usage_count INT DEFAULT 0,
  avg_open_rate DECIMAL(5,2) DEFAULT 0,
  avg_click_rate DECIMAL(5,2) DEFAULT 0,
  avg_conversion_rate DECIMAL(5,2) DEFAULT 0,

  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  is_system BOOLEAN DEFAULT FALSE,

  -- Metadata
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_notif_templates_category ON notification_templates(category);
CREATE INDEX IF NOT EXISTS idx_notif_templates_type ON notification_templates(type);
CREATE INDEX IF NOT EXISTS idx_notif_templates_usage ON notification_templates(usage_count DESC);
CREATE INDEX IF NOT EXISTS idx_notif_templates_active ON notification_templates(is_active) WHERE is_active = true;

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_notification_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_notification_templates_updated_at ON notification_templates;
CREATE TRIGGER trigger_notification_templates_updated_at
  BEFORE UPDATE ON notification_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_notification_templates_updated_at();

-- ============================================================
-- RLS Policies
-- ============================================================
ALTER TABLE notification_templates ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
CREATE POLICY "Admins can manage notification templates"
  ON notification_templates
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
CREATE POLICY "Users can view active notification templates"
  ON notification_templates
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- ============================================================
-- RPC Function: Increment template usage
-- ============================================================
CREATE OR REPLACE FUNCTION increment_template_usage(
  p_template_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE notification_templates
  SET
    usage_count = usage_count + 1,
    updated_at = NOW()
  WHERE id = p_template_id;
END;
$$;

-- ============================================================
-- RPC Function: Update template stats
-- ============================================================
CREATE OR REPLACE FUNCTION update_template_stats(
  p_template_id UUID,
  p_open_rate DECIMAL(5,2),
  p_click_rate DECIMAL(5,2),
  p_conversion_rate DECIMAL(5,2)
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_usage_count INT;
  v_current_open_rate DECIMAL(5,2);
  v_current_click_rate DECIMAL(5,2);
  v_current_conversion_rate DECIMAL(5,2);
BEGIN
  -- Get current stats
  SELECT usage_count, avg_open_rate, avg_click_rate, avg_conversion_rate
  INTO v_usage_count, v_current_open_rate, v_current_click_rate, v_current_conversion_rate
  FROM notification_templates
  WHERE id = p_template_id;

  -- Calculate new averages (rolling average)
  IF v_usage_count > 0 THEN
    UPDATE notification_templates
    SET
      avg_open_rate = ((v_current_open_rate * (v_usage_count - 1)) + p_open_rate) / v_usage_count,
      avg_click_rate = ((v_current_click_rate * (v_usage_count - 1)) + p_click_rate) / v_usage_count,
      avg_conversion_rate = ((v_current_conversion_rate * (v_usage_count - 1)) + p_conversion_rate) / v_usage_count,
      updated_at = NOW()
    WHERE id = p_template_id;
  END IF;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION increment_template_usage TO authenticated;
GRANT EXECUTE ON FUNCTION update_template_stats TO service_role;

-- ============================================================
-- Seed default templates
-- ============================================================
INSERT INTO notification_templates (name, description, category, title_template, body_template, deep_link_template, default_segment, is_system)
VALUES
  -- Spiritual templates
  ('Tarot Hook', 'Hook để mời user bốc bài Tarot', 'spiritual',
   '🃏 Tarot có thông điệp cho bạn',
   'Một lá bài đang chờ bạn mở ra... Tap để xem vũ trụ muốn nói gì với bạn hôm nay!',
   '/gemmaster?action=tarot_reading', 'all', true),

  ('I Ching Evening', 'Push notification buổi tối về Kinh Dịch', 'spiritual',
   '☯️ Kinh Dịch hé lộ ngày mai',
   'Hãy để quẻ Kinh Dịch hướng dẫn bạn cho ngày mai. Tap để nhận thông điệp.',
   '/gemmaster?action=iching_reading', 'spiritual', true),

  ('Frequency Money', 'Thông báo tần số tiền bạc hàng ngày', 'spiritual',
   '💰 Tần số tiền bạc hôm nay',
   'Số {{number}} đang chiếu sáng tần số tài chính của bạn. Khám phá ngay!',
   '/gemmaster?action=frequency_reading', 'all', true),

  -- Trading templates
  ('Pattern Education', 'Giáo dục về pattern trading', 'trading',
   '📊 Pattern có winrate cao nhất tuần này',
   '{{pattern_name}} đang có tỷ lệ thắng {{winrate}}%. Tìm hiểu cách trade pattern này!',
   '/scanner', 'traders', true),

  ('Market Alert', 'Cảnh báo thị trường quan trọng', 'trading',
   '🚨 Cảnh báo thị trường',
   '{{coin}} vừa {{action}} {{percent}}% trong {{timeframe}}. Xem phân tích ngay!',
   '/scanner?symbol={{coin}}', 'traders', true),

  -- Personalized templates
  ('Streak Reminder', 'Nhắc nhở giữ streak', 'personalized',
   '🔥 Streak sắp mất!',
   'Bạn đã duy trì streak {{days}} ngày. Đừng để mất - check-in ngay!',
   '/visionboard?action=quick_checkin', 'all', true),

  ('Goal Progress', 'Cập nhật tiến độ mục tiêu', 'personalized',
   '🎯 Mục tiêu của bạn đang tiến triển',
   'Bạn đã hoàn thành {{percent}}% mục tiêu "{{goal_name}}". Tiếp tục nào!',
   '/visionboard', 'all', true)

ON CONFLICT DO NOTHING;
