-- =====================================================
-- RATE LIMIT TRACKING TABLE
-- Track API requests per user per time window for rate limiting
-- =====================================================

-- Create rate_limit_tracking table
CREATE TABLE IF NOT EXISTS rate_limit_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Window tracking
  window_start TIMESTAMPTZ NOT NULL,      -- Start of the time window (per minute)
  request_count INTEGER DEFAULT 1,        -- Number of requests in this window

  -- Feature tracking (optional)
  feature VARCHAR(50) DEFAULT 'all',      -- Feature name or 'all' for global

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Unique constraint: one record per user per window per feature
  UNIQUE(user_id, window_start, feature)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_rate_limit_user_window ON rate_limit_tracking(user_id, window_start);
CREATE INDEX IF NOT EXISTS idx_rate_limit_window_start ON rate_limit_tracking(window_start);

-- Enable Row Level Security
ALTER TABLE rate_limit_tracking ENABLE ROW LEVEL SECURITY;

-- RLS Policies (only service role can access)
CREATE POLICY "Service role full access to rate_limit_tracking"
  ON rate_limit_tracking FOR ALL
  USING (true)
  WITH CHECK (true);

-- Grant permissions to service role only
GRANT ALL ON rate_limit_tracking TO service_role;

-- Auto-cleanup function for old rate limit records (older than 1 hour)
CREATE OR REPLACE FUNCTION cleanup_old_rate_limits()
RETURNS void AS $$
BEGIN
  DELETE FROM rate_limit_tracking
  WHERE window_start < NOW() - INTERVAL '1 hour';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_rate_limit_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS rate_limit_tracking_updated_at ON rate_limit_tracking;
CREATE TRIGGER rate_limit_tracking_updated_at
  BEFORE UPDATE ON rate_limit_tracking
  FOR EACH ROW
  EXECUTE FUNCTION update_rate_limit_timestamp();

-- Function to check and increment rate limit
-- Returns: { allowed: boolean, remaining: integer, reset_at: timestamp }
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_user_id UUID,
  p_user_tier VARCHAR DEFAULT 'free',
  p_feature VARCHAR DEFAULT 'all'
)
RETURNS JSONB AS $$
DECLARE
  v_limit INTEGER;
  v_window_start TIMESTAMPTZ;
  v_reset_at TIMESTAMPTZ;
  v_current_count INTEGER;
  v_result JSONB;
BEGIN
  -- Define rate limits by tier (requests per minute)
  v_limit := CASE p_user_tier
    WHEN 'tier3' THEN 120
    WHEN 'tier2' THEN 60
    WHEN 'tier1' THEN 30
    ELSE 10  -- free tier
  END;

  -- Calculate current window (start of current minute)
  v_window_start := date_trunc('minute', NOW());
  v_reset_at := v_window_start + INTERVAL '1 minute';

  -- Try to insert or update rate limit record
  INSERT INTO rate_limit_tracking (user_id, window_start, request_count, feature)
  VALUES (p_user_id, v_window_start, 1, p_feature)
  ON CONFLICT (user_id, window_start, feature)
  DO UPDATE SET
    request_count = rate_limit_tracking.request_count + 1,
    updated_at = NOW()
  RETURNING request_count INTO v_current_count;

  -- Check if limit exceeded
  IF v_current_count > v_limit THEN
    v_result := jsonb_build_object(
      'allowed', false,
      'remaining', 0,
      'reset_at', v_reset_at,
      'limit', v_limit,
      'current', v_current_count
    );
  ELSE
    v_result := jsonb_build_object(
      'allowed', true,
      'remaining', v_limit - v_current_count,
      'reset_at', v_reset_at,
      'limit', v_limit,
      'current', v_current_count
    );
  END IF;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Schedule cleanup (run every hour via pg_cron if available)
-- Note: pg_cron needs to be enabled in Supabase dashboard
-- SELECT cron.schedule('cleanup-rate-limits', '0 * * * *', 'SELECT cleanup_old_rate_limits()');

-- Comments
COMMENT ON TABLE rate_limit_tracking IS 'Tracks API request counts per user per time window for rate limiting';
COMMENT ON COLUMN rate_limit_tracking.window_start IS 'Start timestamp of the rate limit window (per minute)';
COMMENT ON COLUMN rate_limit_tracking.request_count IS 'Number of requests made in this window';
COMMENT ON FUNCTION check_rate_limit IS 'Check and increment rate limit. Returns allowed status, remaining requests, and reset time';
