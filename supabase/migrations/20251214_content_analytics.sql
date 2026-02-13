-- ============================================================
-- Migration: Create content_analytics table
-- Date: 2024-12-14
-- Description: Bảng analytics tổng hợp cho push và post
-- ============================================================

-- Create table
CREATE TABLE IF NOT EXISTS content_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Reference (one of these will be set)
  notification_id UUID REFERENCES notification_schedule(id) ON DELETE CASCADE,
  content_id UUID REFERENCES content_calendar(id) ON DELETE CASCADE,

  -- Type
  content_type VARCHAR(50) NOT NULL, -- 'push', 'post'

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
  hourly_opens JSONB DEFAULT '{}', -- { "08": 120, "09": 85, ... }
  hourly_clicks JSONB DEFAULT '{}',
  hourly_views JSONB DEFAULT '{}',

  -- A/B Test results
  ab_variant_stats JSONB, -- { "A": { opens: 100, clicks: 20 }, "B": { opens: 150, clicks: 35 } }
  ab_winner VARCHAR(10),

  -- Platform breakdown (for post)
  platform_stats JSONB DEFAULT '{}', -- { "gemral": { views: 1000 }, "facebook": { views: 500 } }

  -- Segment breakdown (for push)
  segment_stats JSONB DEFAULT '{}', -- { "traders": { opens: 500 }, "spiritual": { opens: 300 } }

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
ALTER TABLE content_analytics ADD CONSTRAINT content_analytics_reference_check
  CHECK (
    (notification_id IS NOT NULL AND content_id IS NULL)
    OR (notification_id IS NULL AND content_id IS NOT NULL)
  );

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

-- ============================================================
-- RLS Policies
-- ============================================================
ALTER TABLE content_analytics ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
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

-- Service role can do everything
CREATE POLICY "Service role full access to content analytics"
  ON content_analytics
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- RPC Function: Get dashboard stats
-- ============================================================
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

-- ============================================================
-- RPC Function: Get top performing content
-- ============================================================
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

-- ============================================================
-- RPC Function: Get hourly breakdown
-- ============================================================
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

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_content_dashboard_stats TO authenticated;
GRANT EXECUTE ON FUNCTION get_top_performing_content TO authenticated;
GRANT EXECUTE ON FUNCTION get_content_hourly_breakdown TO authenticated;

-- ============================================================
-- Trigger: Auto-create analytics record for notification
-- ============================================================
CREATE OR REPLACE FUNCTION create_analytics_for_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create when notification is sent
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

-- ============================================================
-- Trigger: Auto-create analytics record for content
-- ============================================================
CREATE OR REPLACE FUNCTION create_analytics_for_content()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create when content is posted
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
