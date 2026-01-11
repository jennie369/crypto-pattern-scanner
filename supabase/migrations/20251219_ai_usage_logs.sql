-- =====================================================
-- AI USAGE LOGS TABLE
-- Track all AI API calls for analytics and rate limiting
-- =====================================================

-- Create ai_usage_logs table
CREATE TABLE IF NOT EXISTS ai_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Request info
  feature VARCHAR(50) NOT NULL,           -- 'gem_master', 'tarot', 'i_ching', 'tu_vi', 'chat'
  model VARCHAR(100) NOT NULL DEFAULT 'gemini-2.5-flash',

  -- Token usage
  prompt_tokens INTEGER DEFAULT 0,
  completion_tokens INTEGER DEFAULT 0,
  total_tokens INTEGER DEFAULT 0,

  -- Request details
  request_type VARCHAR(50),               -- 'chat', 'analysis', 'divination'
  success BOOLEAN DEFAULT true,
  error_message TEXT,

  -- Performance
  response_time_ms INTEGER,               -- Response time in milliseconds

  -- Metadata
  metadata JSONB DEFAULT '{}',            -- Additional context

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_user_id ON ai_usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_feature ON ai_usage_logs(feature);
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_created_at ON ai_usage_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_user_date ON ai_usage_logs(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_success ON ai_usage_logs(success);

-- Enable Row Level Security
ALTER TABLE ai_usage_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users can view their own usage logs
CREATE POLICY "Users can view own ai_usage_logs"
  ON ai_usage_logs FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can insert (from Edge Functions)
CREATE POLICY "Service role can insert ai_usage_logs"
  ON ai_usage_logs FOR INSERT
  WITH CHECK (true);

-- Service role can view all (for analytics)
CREATE POLICY "Service role can view all ai_usage_logs"
  ON ai_usage_logs FOR SELECT
  USING (true);

-- Grant permissions
GRANT SELECT ON ai_usage_logs TO authenticated;
GRANT INSERT ON ai_usage_logs TO service_role;
GRANT SELECT ON ai_usage_logs TO service_role;

-- Comments
COMMENT ON TABLE ai_usage_logs IS 'Tracks all AI API usage for analytics, billing, and rate limiting';
COMMENT ON COLUMN ai_usage_logs.feature IS 'Feature that made the API call: gem_master, tarot, i_ching, tu_vi, chat';
COMMENT ON COLUMN ai_usage_logs.model IS 'AI model used (default: gemini-2.0-flash-exp)';
COMMENT ON COLUMN ai_usage_logs.response_time_ms IS 'API response time in milliseconds';

-- Helper function to get user usage stats
CREATE OR REPLACE FUNCTION get_user_ai_usage_stats(p_user_id UUID, p_days INTEGER DEFAULT 30)
RETURNS TABLE (
  total_requests BIGINT,
  total_tokens BIGINT,
  avg_response_time NUMERIC,
  success_rate NUMERIC,
  by_feature JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT as total_requests,
    COALESCE(SUM(ai_usage_logs.total_tokens), 0)::BIGINT as total_tokens,
    COALESCE(AVG(ai_usage_logs.response_time_ms), 0)::NUMERIC as avg_response_time,
    COALESCE(
      (COUNT(*) FILTER (WHERE ai_usage_logs.success = true)::NUMERIC / NULLIF(COUNT(*), 0)::NUMERIC * 100),
      0
    )::NUMERIC as success_rate,
    COALESCE(
      jsonb_object_agg(ai_usage_logs.feature, feature_count),
      '{}'::JSONB
    ) as by_feature
  FROM ai_usage_logs
  LEFT JOIN LATERAL (
    SELECT ai_usage_logs.feature, COUNT(*) as feature_count
    FROM ai_usage_logs sub
    WHERE sub.user_id = p_user_id
      AND sub.created_at > NOW() - (p_days || ' days')::INTERVAL
    GROUP BY sub.feature
  ) fc ON true
  WHERE ai_usage_logs.user_id = p_user_id
    AND ai_usage_logs.created_at > NOW() - (p_days || ' days')::INTERVAL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
