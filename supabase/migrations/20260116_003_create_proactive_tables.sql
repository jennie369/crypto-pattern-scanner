-- ============================================================
-- MIGRATION 003: PROACTIVE AI TABLES
-- GEM Master Chatbot Upgrade - Proactive Messages & Feature Usage
-- ============================================================

-- ============================================================
-- TABLE 1: proactive_messages
-- Scheduled AI-generated messages for users
-- ============================================================

CREATE TABLE IF NOT EXISTS proactive_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Message Type
  message_type VARCHAR(50) NOT NULL CHECK (message_type IN (
    'daily_insight', 'ritual_reminder', 'streak_alert', 'streak_milestone',
    'pattern_observation', 'celebration', 'encouragement', 'check_in',
    'weekly_summary', 'custom'
  )),

  -- Content
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',

  -- Scheduling
  scheduled_for TIMESTAMPTZ NOT NULL,
  priority INTEGER DEFAULT 5 CHECK (priority >= 1 AND priority <= 10),

  -- Delivery
  delivery_method VARCHAR(20) DEFAULT 'in_app' CHECK (delivery_method IN (
    'in_app', 'push', 'both', 'email'
  )),

  -- Status
  is_sent BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMPTZ,

  -- User Interaction
  was_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  was_dismissed BOOLEAN DEFAULT FALSE,
  dismissed_at TIMESTAMPTZ,
  user_response TEXT,
  user_responded_at TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for proactive_messages
CREATE INDEX IF NOT EXISTS idx_proactive_messages_user_id ON proactive_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_proactive_messages_scheduled ON proactive_messages(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_proactive_messages_type ON proactive_messages(message_type);
CREATE INDEX IF NOT EXISTS idx_proactive_messages_pending ON proactive_messages(scheduled_for, is_sent)
  WHERE is_sent = FALSE;
CREATE INDEX IF NOT EXISTS idx_proactive_messages_unread ON proactive_messages(user_id, was_read, is_sent)
  WHERE was_read = FALSE AND is_sent = TRUE;
CREATE INDEX IF NOT EXISTS idx_proactive_messages_user_pending ON proactive_messages(user_id, scheduled_for DESC)
  WHERE is_sent = FALSE;

-- ============================================================
-- TABLE 2: feature_usage
-- Track feature usage for access control and analytics
-- ============================================================

CREATE TABLE IF NOT EXISTS feature_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Feature Tracking
  feature_key VARCHAR(100) NOT NULL,
  usage_date DATE NOT NULL DEFAULT CURRENT_DATE,
  count INTEGER DEFAULT 1,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Unique constraint for daily tracking
  CONSTRAINT unique_user_feature_date UNIQUE (user_id, feature_key, usage_date)
);

-- Indexes for feature_usage
CREATE INDEX IF NOT EXISTS idx_feature_usage_lookup ON feature_usage(user_id, feature_key, usage_date);
CREATE INDEX IF NOT EXISTS idx_feature_usage_user ON feature_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_feature_usage_date ON feature_usage(usage_date DESC);

-- ============================================================
-- TABLE 3: job_logs (for background job tracking)
-- ============================================================

CREATE TABLE IF NOT EXISTS job_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Job Info
  job_type VARCHAR(50) NOT NULL,
  job_name VARCHAR(100),

  -- Execution
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  status VARCHAR(20) DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed', 'cancelled')),

  -- Results
  processed_count INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  error_count INTEGER DEFAULT 0,
  error_details JSONB DEFAULT '[]',

  -- Metadata
  metadata JSONB DEFAULT '{}'
);

-- Index for job_logs
CREATE INDEX IF NOT EXISTS idx_job_logs_type ON job_logs(job_type);
CREATE INDEX IF NOT EXISTS idx_job_logs_status ON job_logs(status);
CREATE INDEX IF NOT EXISTS idx_job_logs_started ON job_logs(started_at DESC);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS
ALTER TABLE proactive_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_usage ENABLE ROW LEVEL SECURITY;

-- proactive_messages policies
DROP POLICY IF EXISTS "Users can view own proactive messages" ON proactive_messages;
CREATE POLICY "Users can view own proactive messages" ON proactive_messages
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can insert proactive messages" ON proactive_messages;
CREATE POLICY "System can insert proactive messages" ON proactive_messages
  FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.jwt()->>'role' = 'service_role');

DROP POLICY IF EXISTS "Users can update own proactive messages" ON proactive_messages;
CREATE POLICY "Users can update own proactive messages" ON proactive_messages
  FOR UPDATE USING (auth.uid() = user_id);

-- feature_usage policies
DROP POLICY IF EXISTS "Users can view own usage" ON feature_usage;
CREATE POLICY "Users can view own usage" ON feature_usage
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own usage" ON feature_usage;
CREATE POLICY "Users can insert own usage" ON feature_usage
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own usage" ON feature_usage;
CREATE POLICY "Users can update own usage" ON feature_usage
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================

-- Function: Atomic increment feature usage
CREATE OR REPLACE FUNCTION increment_feature_usage(
  p_user_id UUID,
  p_feature_key VARCHAR,
  p_usage_date DATE DEFAULT CURRENT_DATE
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_new_count INTEGER;
BEGIN
  INSERT INTO feature_usage (user_id, feature_key, usage_date, count)
  VALUES (p_user_id, p_feature_key, p_usage_date, 1)
  ON CONFLICT (user_id, feature_key, usage_date)
  DO UPDATE SET
    count = feature_usage.count + 1,
    updated_at = NOW()
  RETURNING count INTO v_new_count;

  RETURN v_new_count;
END;
$$;

-- Function: Get feature usage for today
CREATE OR REPLACE FUNCTION get_feature_usage_today(
  p_user_id UUID,
  p_feature_key VARCHAR
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT count INTO v_count
  FROM feature_usage
  WHERE user_id = p_user_id
    AND feature_key = p_feature_key
    AND usage_date = CURRENT_DATE;

  RETURN COALESCE(v_count, 0);
END;
$$;

-- Function: Get pending proactive messages for user
CREATE OR REPLACE FUNCTION get_pending_proactive_messages(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 10
)
RETURNS SETOF proactive_messages
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM proactive_messages
  WHERE user_id = p_user_id
    AND is_sent = TRUE
    AND was_read = FALSE
    AND was_dismissed = FALSE
  ORDER BY priority DESC, scheduled_for DESC
  LIMIT p_limit;
END;
$$;

-- Function: Mark proactive message as read
CREATE OR REPLACE FUNCTION mark_proactive_message_read(
  p_message_id UUID,
  p_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE proactive_messages
  SET was_read = TRUE, read_at = NOW()
  WHERE id = p_message_id AND user_id = p_user_id;

  RETURN FOUND;
END;
$$;

-- Function: Schedule a proactive message
CREATE OR REPLACE FUNCTION schedule_proactive_message(
  p_user_id UUID,
  p_message_type VARCHAR,
  p_title VARCHAR,
  p_content TEXT,
  p_scheduled_for TIMESTAMPTZ,
  p_priority INTEGER DEFAULT 5,
  p_delivery_method VARCHAR DEFAULT 'in_app',
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_message_id UUID;
BEGIN
  INSERT INTO proactive_messages (
    user_id, message_type, title, content,
    scheduled_for, priority, delivery_method, metadata
  )
  VALUES (
    p_user_id, p_message_type, p_title, p_content,
    p_scheduled_for, p_priority, p_delivery_method, p_metadata
  )
  RETURNING id INTO v_message_id;

  RETURN v_message_id;
END;
$$;

-- Function: Get messages ready to send
CREATE OR REPLACE FUNCTION get_messages_to_send(
  p_limit INTEGER DEFAULT 100
)
RETURNS SETOF proactive_messages
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM proactive_messages
  WHERE is_sent = FALSE
    AND scheduled_for <= NOW()
  ORDER BY priority DESC, scheduled_for ASC
  LIMIT p_limit;
END;
$$;

-- Function: Mark message as sent
CREATE OR REPLACE FUNCTION mark_message_sent(
  p_message_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE proactive_messages
  SET is_sent = TRUE, sent_at = NOW()
  WHERE id = p_message_id;

  RETURN FOUND;
END;
$$;

-- Function: Check if daily insight already sent today
CREATE OR REPLACE FUNCTION has_daily_insight_today(
  p_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM proactive_messages
    WHERE user_id = p_user_id
      AND message_type = 'daily_insight'
      AND DATE(scheduled_for) = CURRENT_DATE
  ) INTO v_exists;

  RETURN v_exists;
END;
$$;

-- Function: Get user usage stats
CREATE OR REPLACE FUNCTION get_user_usage_stats(
  p_user_id UUID,
  p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
  feature_key VARCHAR,
  total_usage BIGINT,
  days_used BIGINT,
  avg_per_day NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    fu.feature_key,
    SUM(fu.count)::BIGINT AS total_usage,
    COUNT(DISTINCT fu.usage_date)::BIGINT AS days_used,
    ROUND(SUM(fu.count)::NUMERIC / GREATEST(p_days, 1), 2) AS avg_per_day
  FROM feature_usage fu
  WHERE fu.user_id = p_user_id
    AND fu.usage_date >= CURRENT_DATE - p_days
  GROUP BY fu.feature_key
  ORDER BY total_usage DESC;
END;
$$;

-- Function: Clean up old messages
CREATE OR REPLACE FUNCTION cleanup_old_proactive_messages(
  p_days INTEGER DEFAULT 30
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_deleted INTEGER;
BEGIN
  DELETE FROM proactive_messages
  WHERE sent_at < NOW() - (p_days || ' days')::INTERVAL
    AND (was_read = TRUE OR was_dismissed = TRUE);

  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$;

-- ============================================================
-- GRANT PERMISSIONS
-- ============================================================

GRANT EXECUTE ON FUNCTION increment_feature_usage(UUID, VARCHAR, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION get_feature_usage_today(UUID, VARCHAR) TO authenticated;
GRANT EXECUTE ON FUNCTION get_pending_proactive_messages(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION mark_proactive_message_read(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION schedule_proactive_message(UUID, VARCHAR, VARCHAR, TEXT, TIMESTAMPTZ, INTEGER, VARCHAR, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION has_daily_insight_today(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_usage_stats(UUID, INTEGER) TO authenticated;

-- Service role only functions
GRANT EXECUTE ON FUNCTION get_messages_to_send(INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION mark_message_sent(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION cleanup_old_proactive_messages(INTEGER) TO service_role;

-- ============================================================
-- COMMENTS
-- ============================================================

COMMENT ON TABLE proactive_messages IS 'AI-generated proactive messages scheduled for users';
COMMENT ON TABLE feature_usage IS 'Track feature usage for access control and rate limiting';
COMMENT ON TABLE job_logs IS 'Log background job executions for monitoring';

COMMENT ON COLUMN proactive_messages.message_type IS 'Type of proactive message (daily_insight, ritual_reminder, etc.)';
COMMENT ON COLUMN proactive_messages.priority IS 'Message priority 1-10, higher = more important';
COMMENT ON COLUMN proactive_messages.delivery_method IS 'How to deliver: in_app, push notification, both, or email';
COMMENT ON COLUMN feature_usage.count IS 'Number of times feature was used on this date';
