-- ============================================================
-- Migration: Create notification_schedule table
-- Date: 2024-12-14
-- Description: Bảng lưu scheduled push notifications
-- ============================================================

-- Create table
CREATE TABLE IF NOT EXISTS notification_schedule (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Content
  title VARCHAR(100) NOT NULL,
  body VARCHAR(255) NOT NULL,
  deep_link VARCHAR(500),
  image_url VARCHAR(500),

  -- Targeting
  segment VARCHAR(100) DEFAULT 'all', -- 'all', 'traders', 'spiritual', 'tier1_plus', 'inactive_3d', 'custom'
  segment_filters JSONB DEFAULT '{}', -- Custom filters for 'custom' segment
  estimated_reach INT DEFAULT 0,

  -- Template reference
  template_id UUID REFERENCES notification_templates(id) ON DELETE SET NULL,

  -- A/B Testing
  ab_test_enabled BOOLEAN DEFAULT FALSE,
  ab_variants JSONB, -- { "A": { title, body }, "B": { title, body } }
  ab_winner_criteria VARCHAR(50), -- 'open_rate', 'click_rate', 'conversion_rate'
  ab_test_duration INT, -- minutes to wait before picking winner
  ab_winner VARCHAR(10), -- 'A' or 'B' after test completes

  -- Scheduling
  scheduled_at TIMESTAMPTZ NOT NULL,
  is_recurring BOOLEAN DEFAULT FALSE,
  recurrence_rule JSONB, -- { pattern: 'daily'|'weekly', days: [1,2,3,4,5], end_date: null }

  -- Status
  status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'scheduled', 'sending', 'sent', 'failed', 'cancelled'
  sent_at TIMESTAMPTZ,
  error_message TEXT,
  retry_count INT DEFAULT 0,
  last_retry_at TIMESTAMPTZ,

  -- Results
  total_sent INT DEFAULT 0,
  total_failed INT DEFAULT 0,
  total_delivered INT DEFAULT 0,
  total_opened INT DEFAULT 0,
  total_clicked INT DEFAULT 0,
  total_converted INT DEFAULT 0,

  -- Metadata
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_notif_schedule_status ON notification_schedule(status);
CREATE INDEX IF NOT EXISTS idx_notif_schedule_scheduled ON notification_schedule(scheduled_at)
  WHERE status = 'scheduled';
CREATE INDEX IF NOT EXISTS idx_notif_schedule_created_by ON notification_schedule(created_by);
CREATE INDEX IF NOT EXISTS idx_notif_schedule_template ON notification_schedule(template_id);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_notification_schedule_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_notification_schedule_updated_at ON notification_schedule;
CREATE TRIGGER trigger_notification_schedule_updated_at
  BEFORE UPDATE ON notification_schedule
  FOR EACH ROW
  EXECUTE FUNCTION update_notification_schedule_updated_at();

-- ============================================================
-- RLS Policies
-- ============================================================
ALTER TABLE notification_schedule ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
CREATE POLICY "Admins can manage notification schedule"
  ON notification_schedule
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Service role can do everything (for edge functions)
CREATE POLICY "Service role full access to notification schedule"
  ON notification_schedule
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- RPC Function: Get pending scheduled notifications
-- ============================================================
CREATE OR REPLACE FUNCTION get_pending_scheduled_notifications()
RETURNS SETOF notification_schedule
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM notification_schedule
  WHERE status = 'scheduled'
    AND scheduled_at <= NOW()
  ORDER BY scheduled_at ASC;
END;
$$;

-- ============================================================
-- RPC Function: Update notification stats
-- ============================================================
CREATE OR REPLACE FUNCTION update_notification_stats(
  p_notification_id UUID,
  p_total_sent INT DEFAULT NULL,
  p_total_failed INT DEFAULT NULL,
  p_total_delivered INT DEFAULT NULL,
  p_total_opened INT DEFAULT NULL,
  p_total_clicked INT DEFAULT NULL,
  p_total_converted INT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE notification_schedule
  SET
    total_sent = COALESCE(p_total_sent, total_sent),
    total_failed = COALESCE(p_total_failed, total_failed),
    total_delivered = COALESCE(p_total_delivered, total_delivered),
    total_opened = COALESCE(p_total_opened, total_opened),
    total_clicked = COALESCE(p_total_clicked, total_clicked),
    total_converted = COALESCE(p_total_converted, total_converted),
    updated_at = NOW()
  WHERE id = p_notification_id;
END;
$$;

-- ============================================================
-- RPC Function: Increment notification clicks
-- ============================================================
CREATE OR REPLACE FUNCTION increment_notification_clicks(
  p_notif_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE notification_schedule
  SET
    total_clicked = total_clicked + 1,
    updated_at = NOW()
  WHERE id = p_notif_id;
END;
$$;

-- ============================================================
-- RPC Function: Get notification stats for date range
-- ============================================================
CREATE OR REPLACE FUNCTION get_notification_stats_by_date_range(
  p_start_date TIMESTAMPTZ,
  p_end_date TIMESTAMPTZ
)
RETURNS TABLE (
  total_notifications INT,
  total_sent BIGINT,
  total_delivered BIGINT,
  total_opened BIGINT,
  total_clicked BIGINT,
  total_converted BIGINT,
  avg_open_rate DECIMAL(5,2),
  avg_click_rate DECIMAL(5,2),
  avg_conversion_rate DECIMAL(5,2)
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::INT as total_notifications,
    SUM(ns.total_sent)::BIGINT as total_sent,
    SUM(ns.total_delivered)::BIGINT as total_delivered,
    SUM(ns.total_opened)::BIGINT as total_opened,
    SUM(ns.total_clicked)::BIGINT as total_clicked,
    SUM(ns.total_converted)::BIGINT as total_converted,
    CASE
      WHEN SUM(ns.total_delivered) > 0
      THEN ROUND((SUM(ns.total_opened)::DECIMAL / SUM(ns.total_delivered) * 100), 2)
      ELSE 0
    END as avg_open_rate,
    CASE
      WHEN SUM(ns.total_delivered) > 0
      THEN ROUND((SUM(ns.total_clicked)::DECIMAL / SUM(ns.total_delivered) * 100), 2)
      ELSE 0
    END as avg_click_rate,
    CASE
      WHEN SUM(ns.total_clicked) > 0
      THEN ROUND((SUM(ns.total_converted)::DECIMAL / SUM(ns.total_clicked) * 100), 2)
      ELSE 0
    END as avg_conversion_rate
  FROM notification_schedule ns
  WHERE ns.sent_at >= p_start_date
    AND ns.sent_at <= p_end_date
    AND ns.status = 'sent';
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_pending_scheduled_notifications TO service_role;
GRANT EXECUTE ON FUNCTION update_notification_stats TO service_role;
GRANT EXECUTE ON FUNCTION increment_notification_clicks TO authenticated;
GRANT EXECUTE ON FUNCTION get_notification_stats_by_date_range TO authenticated;
