-- ============================================================
-- Migration: Create notification_logs table
-- Date: 2024-12-14
-- Description: Bảng log từng notification đã gửi đến từng user
-- ============================================================

-- Create table
CREATE TABLE IF NOT EXISTS notification_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- References
  notification_id UUID REFERENCES notification_schedule(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,

  -- Expo ticket/receipt
  expo_ticket_id VARCHAR(255),
  expo_receipt_id VARCHAR(255),

  -- Delivery status
  status VARCHAR(50) DEFAULT 'sent', -- 'sent', 'delivered', 'failed', 'error'
  error_message TEXT,
  error_code VARCHAR(50),

  -- Engagement
  delivered_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,

  -- Deep link tracking
  deep_link VARCHAR(500),
  deep_link_screen VARCHAR(100),

  -- A/B variant
  ab_variant VARCHAR(10),

  -- Metadata
  device_type VARCHAR(50), -- 'ios', 'android'
  app_version VARCHAR(20),

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_notif_logs_notification ON notification_logs(notification_id);
CREATE INDEX IF NOT EXISTS idx_notif_logs_user ON notification_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_notif_logs_status ON notification_logs(status);
CREATE INDEX IF NOT EXISTS idx_notif_logs_created ON notification_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_notif_logs_expo_ticket ON notification_logs(expo_ticket_id)
  WHERE expo_ticket_id IS NOT NULL;

-- ============================================================
-- RLS Policies
-- ============================================================
ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;

-- Users can view their own logs
CREATE POLICY "Users can view own notification logs"
  ON notification_logs
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Admins can view all logs
CREATE POLICY "Admins can view all notification logs"
  ON notification_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Service role can do everything (for edge functions)
CREATE POLICY "Service role full access to notification logs"
  ON notification_logs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- RPC Function: Bulk insert notification logs
-- ============================================================
CREATE OR REPLACE FUNCTION bulk_insert_notification_logs(
  p_logs JSONB
)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INT;
BEGIN
  INSERT INTO notification_logs (
    notification_id,
    user_id,
    expo_ticket_id,
    status,
    error_message,
    error_code,
    ab_variant,
    device_type,
    created_at
  )
  SELECT
    (log->>'notification_id')::UUID,
    (log->>'user_id')::UUID,
    log->>'expo_ticket_id',
    COALESCE(log->>'status', 'sent'),
    log->>'error_message',
    log->>'error_code',
    log->>'ab_variant',
    log->>'device_type',
    COALESCE((log->>'created_at')::TIMESTAMPTZ, NOW())
  FROM jsonb_array_elements(p_logs) AS log;

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

-- ============================================================
-- RPC Function: Update log on click
-- ============================================================
CREATE OR REPLACE FUNCTION update_notification_log_clicked(
  p_notification_id UUID,
  p_user_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE notification_logs
  SET clicked_at = NOW()
  WHERE notification_id = p_notification_id
    AND user_id = p_user_id
    AND clicked_at IS NULL;
END;
$$;

-- ============================================================
-- RPC Function: Get notification log stats
-- ============================================================
CREATE OR REPLACE FUNCTION get_notification_log_stats(
  p_notification_id UUID
)
RETURNS TABLE (
  total_sent INT,
  total_delivered INT,
  total_opened INT,
  total_clicked INT,
  total_failed INT,
  delivery_rate DECIMAL(5,2),
  open_rate DECIMAL(5,2),
  click_rate DECIMAL(5,2)
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::INT as total_sent,
    COUNT(*) FILTER (WHERE nl.status = 'delivered' OR nl.delivered_at IS NOT NULL)::INT as total_delivered,
    COUNT(*) FILTER (WHERE nl.opened_at IS NOT NULL)::INT as total_opened,
    COUNT(*) FILTER (WHERE nl.clicked_at IS NOT NULL)::INT as total_clicked,
    COUNT(*) FILTER (WHERE nl.status IN ('failed', 'error'))::INT as total_failed,
    CASE
      WHEN COUNT(*) > 0
      THEN ROUND((COUNT(*) FILTER (WHERE nl.status = 'delivered' OR nl.delivered_at IS NOT NULL)::DECIMAL / COUNT(*) * 100), 2)
      ELSE 0
    END as delivery_rate,
    CASE
      WHEN COUNT(*) FILTER (WHERE nl.status = 'delivered' OR nl.delivered_at IS NOT NULL) > 0
      THEN ROUND((COUNT(*) FILTER (WHERE nl.opened_at IS NOT NULL)::DECIMAL / COUNT(*) FILTER (WHERE nl.status = 'delivered' OR nl.delivered_at IS NOT NULL) * 100), 2)
      ELSE 0
    END as open_rate,
    CASE
      WHEN COUNT(*) FILTER (WHERE nl.opened_at IS NOT NULL) > 0
      THEN ROUND((COUNT(*) FILTER (WHERE nl.clicked_at IS NOT NULL)::DECIMAL / COUNT(*) FILTER (WHERE nl.opened_at IS NOT NULL) * 100), 2)
      ELSE 0
    END as click_rate
  FROM notification_logs nl
  WHERE nl.notification_id = p_notification_id;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION bulk_insert_notification_logs TO service_role;
GRANT EXECUTE ON FUNCTION update_notification_log_clicked TO authenticated;
GRANT EXECUTE ON FUNCTION get_notification_log_stats TO authenticated;
