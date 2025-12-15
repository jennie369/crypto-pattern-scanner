-- ============================================================
-- COMBINED MIGRATION: Content Hub & Push Notifications System
-- Date: 2024-12-14
-- Run this file in Supabase SQL Editor
-- ============================================================

-- ============================================================
-- PART 1: Add Push Notification columns to profiles
-- ============================================================

-- Thêm columns vào profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS expo_push_token VARCHAR(255);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notification_segments TEXT[] DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_notification_at TIMESTAMPTZ;

-- Index for querying by token
CREATE INDEX IF NOT EXISTS idx_profiles_push_token ON profiles(expo_push_token)
  WHERE expo_push_token IS NOT NULL;

-- Index for segment queries
CREATE INDEX IF NOT EXISTS idx_profiles_notif_segments ON profiles USING GIN (notification_segments)
  WHERE notification_segments IS NOT NULL AND array_length(notification_segments, 1) > 0;

-- Comment columns
COMMENT ON COLUMN profiles.expo_push_token IS 'Expo push notification token for mobile app';
COMMENT ON COLUMN profiles.notification_segments IS 'User segments for targeted notifications: spiritual, trading, etc.';
COMMENT ON COLUMN profiles.last_notification_at IS 'Timestamp of last push notification sent to user';

-- ============================================================
-- PART 2: Create notification_templates table
-- ============================================================

CREATE TABLE IF NOT EXISTS notification_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Basic info
  name VARCHAR(200) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  type VARCHAR(50) DEFAULT 'push',

  -- Template content
  title_template VARCHAR(100) NOT NULL,
  body_template VARCHAR(255) NOT NULL,
  deep_link_template VARCHAR(500),
  image_url VARCHAR(500),

  -- Variables (for dynamic content)
  variables JSONB DEFAULT '[]',

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

-- RLS
ALTER TABLE notification_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage notification templates" ON notification_templates;
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

DROP POLICY IF EXISTS "Users can view active notification templates" ON notification_templates;
CREATE POLICY "Users can view active notification templates"
  ON notification_templates
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- ============================================================
-- PART 3: Create notification_schedule table
-- ============================================================

CREATE TABLE IF NOT EXISTS notification_schedule (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Content
  title VARCHAR(100) NOT NULL,
  body VARCHAR(255) NOT NULL,
  deep_link VARCHAR(500),
  image_url VARCHAR(500),

  -- Targeting
  segment VARCHAR(100) DEFAULT 'all',
  segment_filters JSONB DEFAULT '{}',
  estimated_reach INT DEFAULT 0,

  -- Template reference
  template_id UUID REFERENCES notification_templates(id) ON DELETE SET NULL,

  -- A/B Testing
  ab_test_enabled BOOLEAN DEFAULT FALSE,
  ab_variants JSONB,
  ab_winner_criteria VARCHAR(50),
  ab_test_duration INT,
  ab_winner VARCHAR(10),

  -- Scheduling
  scheduled_at TIMESTAMPTZ NOT NULL,
  is_recurring BOOLEAN DEFAULT FALSE,
  recurrence_rule JSONB,

  -- Status
  status VARCHAR(50) DEFAULT 'draft',
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

-- RLS
ALTER TABLE notification_schedule ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage notification schedule" ON notification_schedule;
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

DROP POLICY IF EXISTS "Service role full access to notification schedule" ON notification_schedule;
CREATE POLICY "Service role full access to notification schedule"
  ON notification_schedule
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- PART 4: Create notification_logs table
-- ============================================================

CREATE TABLE IF NOT EXISTS notification_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- References
  notification_id UUID REFERENCES notification_schedule(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,

  -- Expo ticket/receipt
  expo_ticket_id VARCHAR(255),
  expo_receipt_id VARCHAR(255),

  -- Delivery status
  status VARCHAR(50) DEFAULT 'sent',
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
  device_type VARCHAR(50),
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

-- RLS
ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own notification logs" ON notification_logs;
CREATE POLICY "Users can view own notification logs"
  ON notification_logs
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can view all notification logs" ON notification_logs;
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

DROP POLICY IF EXISTS "Service role full access to notification logs" ON notification_logs;
CREATE POLICY "Service role full access to notification logs"
  ON notification_logs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- PART 5: Create content_templates table
-- ============================================================

CREATE TABLE IF NOT EXISTS content_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Basic info
  name VARCHAR(200) NOT NULL,
  description TEXT,
  category VARCHAR(100),

  -- Template content
  title_template VARCHAR(500),
  content_template TEXT,
  content_type VARCHAR(50) DEFAULT 'post',

  -- Defaults
  default_platform VARCHAR(50) DEFAULT 'gemral',
  default_pillar VARCHAR(100),
  default_hashtags TEXT[],

  -- Variables
  variables JSONB DEFAULT '[]',

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

-- RLS
ALTER TABLE content_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage content templates" ON content_templates;
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

DROP POLICY IF EXISTS "Users can view active content templates" ON content_templates;
CREATE POLICY "Users can view active content templates"
  ON content_templates
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- ============================================================
-- PART 6: Create content_analytics table
-- ============================================================

CREATE TABLE IF NOT EXISTS content_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Reference (one of these will be set)
  notification_id UUID REFERENCES notification_schedule(id) ON DELETE CASCADE,
  content_id UUID REFERENCES content_calendar(id) ON DELETE CASCADE,

  -- Type
  content_type VARCHAR(50) NOT NULL,

  -- Delivery stats (for push)
  total_sent INT DEFAULT 0,
  total_delivered INT DEFAULT 0,
  total_failed INT DEFAULT 0,

  -- Engagement stats
  total_opened INT DEFAULT 0,
  total_clicked INT DEFAULT 0,
  total_converted INT DEFAULT 0,
  total_unsubscribed INT DEFAULT 0,

  -- Post stats
  total_views INT DEFAULT 0,
  total_likes INT DEFAULT 0,
  total_comments INT DEFAULT 0,
  total_shares INT DEFAULT 0,
  total_saves INT DEFAULT 0,

  -- Rates (cached)
  delivery_rate DECIMAL(5,2) DEFAULT 0,
  open_rate DECIMAL(5,2) DEFAULT 0,
  click_rate DECIMAL(5,2) DEFAULT 0,
  conversion_rate DECIMAL(5,2) DEFAULT 0,
  engagement_rate DECIMAL(5,2) DEFAULT 0,

  -- Hourly breakdown (for charts)
  hourly_opens JSONB DEFAULT '{}',
  hourly_clicks JSONB DEFAULT '{}',
  hourly_views JSONB DEFAULT '{}',

  -- A/B Test results
  ab_variant_stats JSONB,
  ab_winner VARCHAR(10),

  -- Platform breakdown (for post)
  platform_stats JSONB DEFAULT '{}',

  -- Segment breakdown (for push)
  segment_stats JSONB DEFAULT '{}',

  -- Metadata
  analyzed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_analytics_notification ON content_analytics(notification_id)
  WHERE notification_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_analytics_content ON content_analytics(content_id)
  WHERE content_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_analytics_type ON content_analytics(content_type);
CREATE INDEX IF NOT EXISTS idx_analytics_created ON content_analytics(created_at);

-- Constraint: one of notification_id or content_id must be set
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'content_analytics_reference_check'
  ) THEN
    ALTER TABLE content_analytics ADD CONSTRAINT content_analytics_reference_check
      CHECK (
        (notification_id IS NOT NULL AND content_id IS NULL)
        OR (notification_id IS NULL AND content_id IS NOT NULL)
      );
  END IF;
END $$;

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_content_analytics_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_content_analytics_updated_at ON content_analytics;
CREATE TRIGGER trigger_content_analytics_updated_at
  BEFORE UPDATE ON content_analytics
  FOR EACH ROW
  EXECUTE FUNCTION update_content_analytics_updated_at();

-- RLS
ALTER TABLE content_analytics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage content analytics" ON content_analytics;
CREATE POLICY "Admins can manage content analytics"
  ON content_analytics
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

DROP POLICY IF EXISTS "Service role full access to content analytics" ON content_analytics;
CREATE POLICY "Service role full access to content analytics"
  ON content_analytics
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- PART 7: RPC Functions
-- ============================================================

-- Update expo push token
CREATE OR REPLACE FUNCTION update_profile_push_token(
  p_user_id UUID,
  p_token VARCHAR(255)
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE profiles
  SET
    expo_push_token = p_token,
    updated_at = NOW()
  WHERE id = p_user_id;
END;
$$;

-- Get users by segment for push notifications
CREATE OR REPLACE FUNCTION get_users_for_push_notification(
  p_segment VARCHAR(100) DEFAULT 'all'
)
RETURNS TABLE (
  user_id UUID,
  expo_push_token VARCHAR(255),
  notification_settings JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id as user_id,
    p.expo_push_token,
    COALESCE(ns.categories, '{}'::JSONB) as notification_settings
  FROM profiles p
  LEFT JOIN notification_settings ns ON ns.user_id = p.id
  WHERE
    p.expo_push_token IS NOT NULL
    AND COALESCE(ns.enabled, true) = true
    AND (
      p_segment = 'all'
      OR (p_segment = 'traders' AND 'trading' = ANY(p.notification_segments))
      OR (p_segment = 'spiritual' AND 'spiritual' = ANY(p.notification_segments))
      OR (p_segment = 'tier1_plus' AND p.scanner_tier IN ('tier1', 'tier2', 'tier3'))
      OR (p_segment = 'inactive_3d' AND p.last_active_at < NOW() - INTERVAL '3 days')
    );
END;
$$;

-- Increment template usage
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

-- Update template stats
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
  SELECT usage_count, avg_open_rate, avg_click_rate, avg_conversion_rate
  INTO v_usage_count, v_current_open_rate, v_current_click_rate, v_current_conversion_rate
  FROM notification_templates
  WHERE id = p_template_id;

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

-- Get pending scheduled notifications
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

-- Update notification stats
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

-- Increment notification clicks
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

-- Get notification stats by date range
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

-- Bulk insert notification logs
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

-- Update log on click
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

-- Get notification log stats
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

-- Increment content template usage
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

-- Get dashboard stats
CREATE OR REPLACE FUNCTION get_content_dashboard_stats(
  p_start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '7 days',
  p_end_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE (
  push_count INT,
  post_count INT,
  total_sent BIGINT,
  total_delivered BIGINT,
  total_opened BIGINT,
  total_clicked BIGINT,
  total_views BIGINT,
  total_likes BIGINT,
  avg_open_rate DECIMAL(5,2),
  avg_click_rate DECIMAL(5,2),
  avg_engagement_rate DECIMAL(5,2)
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) FILTER (WHERE ca.content_type = 'push')::INT as push_count,
    COUNT(*) FILTER (WHERE ca.content_type = 'post')::INT as post_count,
    SUM(ca.total_sent)::BIGINT as total_sent,
    SUM(ca.total_delivered)::BIGINT as total_delivered,
    SUM(ca.total_opened)::BIGINT as total_opened,
    SUM(ca.total_clicked)::BIGINT as total_clicked,
    SUM(ca.total_views)::BIGINT as total_views,
    SUM(ca.total_likes)::BIGINT as total_likes,
    ROUND(AVG(ca.open_rate), 2) as avg_open_rate,
    ROUND(AVG(ca.click_rate), 2) as avg_click_rate,
    ROUND(AVG(ca.engagement_rate), 2) as avg_engagement_rate
  FROM content_analytics ca
  WHERE ca.created_at >= p_start_date
    AND ca.created_at <= p_end_date;
END;
$$;

-- Get top performing content
CREATE OR REPLACE FUNCTION get_top_performing_content(
  p_content_type VARCHAR(50) DEFAULT NULL,
  p_limit INT DEFAULT 10,
  p_order_by VARCHAR(50) DEFAULT 'open_rate'
)
RETURNS TABLE (
  id UUID,
  content_type VARCHAR(50),
  notification_id UUID,
  content_id UUID,
  total_sent INT,
  total_opened INT,
  total_clicked INT,
  total_views INT,
  open_rate DECIMAL(5,2),
  click_rate DECIMAL(5,2),
  engagement_rate DECIMAL(5,2),
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY EXECUTE format(
    'SELECT
      ca.id,
      ca.content_type,
      ca.notification_id,
      ca.content_id,
      ca.total_sent,
      ca.total_opened,
      ca.total_clicked,
      ca.total_views,
      ca.open_rate,
      ca.click_rate,
      ca.engagement_rate,
      ca.created_at
    FROM content_analytics ca
    WHERE ($1 IS NULL OR ca.content_type = $1)
    ORDER BY %I DESC NULLS LAST
    LIMIT $2',
    p_order_by
  ) USING p_content_type, p_limit;
END;
$$;

-- Get hourly breakdown
CREATE OR REPLACE FUNCTION get_content_hourly_breakdown(
  p_start_date TIMESTAMPTZ,
  p_end_date TIMESTAMPTZ,
  p_content_type VARCHAR(50) DEFAULT 'push'
)
RETURNS TABLE (
  hour TEXT,
  total_opens BIGINT,
  total_clicks BIGINT,
  avg_open_rate DECIMAL(5,2)
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH hourly_data AS (
    SELECT
      key as hour,
      SUM((value::TEXT)::BIGINT) as opens
    FROM content_analytics ca,
      jsonb_each(ca.hourly_opens)
    WHERE ca.content_type = p_content_type
      AND ca.created_at >= p_start_date
      AND ca.created_at <= p_end_date
    GROUP BY key
  ),
  hourly_clicks AS (
    SELECT
      key as hour,
      SUM((value::TEXT)::BIGINT) as clicks
    FROM content_analytics ca,
      jsonb_each(ca.hourly_clicks)
    WHERE ca.content_type = p_content_type
      AND ca.created_at >= p_start_date
      AND ca.created_at <= p_end_date
    GROUP BY key
  )
  SELECT
    hd.hour,
    hd.opens as total_opens,
    COALESCE(hc.clicks, 0) as total_clicks,
    CASE
      WHEN hd.opens > 0
      THEN ROUND((COALESCE(hc.clicks, 0)::DECIMAL / hd.opens * 100), 2)
      ELSE 0
    END as avg_open_rate
  FROM hourly_data hd
  LEFT JOIN hourly_clicks hc ON hd.hour = hc.hour
  ORDER BY hd.hour;
END;
$$;

-- ============================================================
-- PART 8: Grant Permissions
-- ============================================================

GRANT EXECUTE ON FUNCTION update_profile_push_token TO authenticated;
GRANT EXECUTE ON FUNCTION get_users_for_push_notification TO service_role;
GRANT EXECUTE ON FUNCTION increment_template_usage TO authenticated;
GRANT EXECUTE ON FUNCTION update_template_stats TO service_role;
GRANT EXECUTE ON FUNCTION get_pending_scheduled_notifications TO service_role;
GRANT EXECUTE ON FUNCTION update_notification_stats TO service_role;
GRANT EXECUTE ON FUNCTION increment_notification_clicks TO authenticated;
GRANT EXECUTE ON FUNCTION get_notification_stats_by_date_range TO authenticated;
GRANT EXECUTE ON FUNCTION bulk_insert_notification_logs TO service_role;
GRANT EXECUTE ON FUNCTION update_notification_log_clicked TO authenticated;
GRANT EXECUTE ON FUNCTION get_notification_log_stats TO authenticated;
GRANT EXECUTE ON FUNCTION increment_content_template_usage TO authenticated;
GRANT EXECUTE ON FUNCTION get_content_dashboard_stats TO authenticated;
GRANT EXECUTE ON FUNCTION get_top_performing_content TO authenticated;
GRANT EXECUTE ON FUNCTION get_content_hourly_breakdown TO authenticated;

-- ============================================================
-- PART 9: Auto-triggers for analytics
-- ============================================================

-- Trigger: Auto-create analytics record for notification
CREATE OR REPLACE FUNCTION create_analytics_for_notification()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'sent' AND OLD.status != 'sent' THEN
    INSERT INTO content_analytics (
      notification_id,
      content_type,
      total_sent,
      total_delivered,
      total_failed
    ) VALUES (
      NEW.id,
      'push',
      NEW.total_sent,
      NEW.total_delivered,
      NEW.total_failed
    )
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_create_analytics_for_notification ON notification_schedule;
CREATE TRIGGER trigger_create_analytics_for_notification
  AFTER UPDATE ON notification_schedule
  FOR EACH ROW
  EXECUTE FUNCTION create_analytics_for_notification();

-- Trigger: Auto-create analytics record for content
CREATE OR REPLACE FUNCTION create_analytics_for_content()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'posted' AND OLD.status != 'posted' THEN
    INSERT INTO content_analytics (
      content_id,
      content_type
    ) VALUES (
      NEW.id,
      'post'
    )
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_create_analytics_for_content ON content_calendar;
CREATE TRIGGER trigger_create_analytics_for_content
  AFTER UPDATE ON content_calendar
  FOR EACH ROW
  EXECUTE FUNCTION create_analytics_for_content();

-- ============================================================
-- PART 10: Seed Default Templates
-- ============================================================

-- Push notification templates
INSERT INTO notification_templates (name, description, category, title_template, body_template, deep_link_template, default_segment, is_system)
VALUES
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

  ('Pattern Education', 'Giáo dục về pattern trading', 'trading',
   '📊 Pattern có winrate cao nhất tuần này',
   '{{pattern_name}} đang có tỷ lệ thắng {{winrate}}%. Tìm hiểu cách trade pattern này!',
   '/scanner', 'traders', true),

  ('Market Alert', 'Cảnh báo thị trường quan trọng', 'trading',
   '🚨 Cảnh báo thị trường',
   '{{coin}} vừa {{action}} {{percent}}% trong {{timeframe}}. Xem phân tích ngay!',
   '/scanner?symbol={{coin}}', 'traders', true),

  ('Streak Reminder', 'Nhắc nhở giữ streak', 'personalized',
   '🔥 Streak sắp mất!',
   'Bạn đã duy trì streak {{days}} ngày. Đừng để mất - check-in ngay!',
   '/visionboard?action=quick_checkin', 'all', true),

  ('Goal Progress', 'Cập nhật tiến độ mục tiêu', 'personalized',
   '🎯 Mục tiêu của bạn đang tiến triển',
   'Bạn đã hoàn thành {{percent}}% mục tiêu "{{goal_name}}". Tiếp tục nào!',
   '/visionboard', 'all', true)

ON CONFLICT DO NOTHING;

-- Content templates
INSERT INTO content_templates (name, description, category, title_template, content_template, content_type, default_platform, default_pillar, default_hashtags, is_system)
VALUES
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

-- ============================================================
-- COMPLETE!
-- ============================================================
SELECT 'Content Hub & Push Notifications System migration completed successfully!' as status;
