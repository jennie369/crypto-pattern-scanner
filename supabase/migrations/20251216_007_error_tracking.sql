-- ═══════════════════════════════════════════════════════════════════════════
-- GEMRAL AI BRAIN - Phase 4: Bug Detection & Error Tracking
-- Migration: 007_error_tracking.sql
-- ═══════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════════
-- 1. ERROR LOGS TABLE
-- Stores individual error occurrences
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS ai_error_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Error identification
  error_hash TEXT NOT NULL,           -- Hash for grouping similar errors
  error_type TEXT NOT NULL,           -- 'js_error', 'api_error', 'network_error', 'render_error'

  -- Error details
  error_message TEXT NOT NULL,
  error_stack TEXT,
  error_name TEXT,                    -- TypeError, ReferenceError, etc.

  -- Context
  screen_name TEXT,
  component_name TEXT,
  action_name TEXT,                   -- What user was doing

  -- Additional data
  metadata JSONB DEFAULT '{}',        -- Any extra context
  request_data JSONB,                 -- For API errors
  response_data JSONB,

  -- Device/App info
  device_type TEXT,                   -- 'ios', 'android', 'web'
  app_version TEXT,
  os_version TEXT,

  -- Status
  is_handled BOOLEAN DEFAULT FALSE,   -- Was error caught by error boundary
  severity TEXT DEFAULT 'error',      -- 'warning', 'error', 'critical'

  -- Timestamps
  occurred_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ai_error_logs_hash ON ai_error_logs(error_hash);
CREATE INDEX IF NOT EXISTS idx_ai_error_logs_type ON ai_error_logs(error_type);
CREATE INDEX IF NOT EXISTS idx_ai_error_logs_occurred ON ai_error_logs(occurred_at);
CREATE INDEX IF NOT EXISTS idx_ai_error_logs_user ON ai_error_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_error_logs_severity ON ai_error_logs(severity);

-- ═══════════════════════════════════════════════════════════════════════════
-- 2. ERROR PATTERNS TABLE
-- Groups similar errors for analysis
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS ai_error_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Pattern identification
  error_hash TEXT UNIQUE NOT NULL,
  error_type TEXT NOT NULL,
  error_name TEXT,
  error_message_template TEXT,        -- Message with variables replaced

  -- Occurrence stats
  occurrence_count INT DEFAULT 1,
  affected_users_count INT DEFAULT 1,
  first_seen_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),

  -- Affected areas
  affected_screens TEXT[],
  affected_components TEXT[],

  -- Status
  status TEXT DEFAULT 'new',          -- 'new', 'investigating', 'identified', 'fixing', 'fixed', 'wont_fix'
  severity TEXT DEFAULT 'medium',     -- 'low', 'medium', 'high', 'critical'
  priority INT DEFAULT 50,            -- 1-100, higher = more urgent

  -- Resolution
  root_cause TEXT,
  fix_description TEXT,
  fixed_at TIMESTAMPTZ,
  fixed_in_version TEXT,

  -- AI Analysis
  ai_analysis JSONB,                  -- AI-generated analysis
  suggested_fix TEXT,                 -- AI-suggested fix

  -- Metadata
  tags TEXT[],
  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════════════════
-- 3. ERROR DAILY STATS
-- Aggregated daily error statistics
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS ai_error_daily_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stat_date DATE NOT NULL,

  -- Overall stats
  total_errors INT DEFAULT 0,
  unique_errors INT DEFAULT 0,
  affected_users INT DEFAULT 0,

  -- By type
  js_errors INT DEFAULT 0,
  api_errors INT DEFAULT 0,
  network_errors INT DEFAULT 0,
  render_errors INT DEFAULT 0,

  -- By severity
  warnings INT DEFAULT 0,
  errors INT DEFAULT 0,
  critical_errors INT DEFAULT 0,

  -- By platform
  ios_errors INT DEFAULT 0,
  android_errors INT DEFAULT 0,
  web_errors INT DEFAULT 0,

  -- Top errors (error_hash -> count)
  top_errors JSONB DEFAULT '[]',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(stat_date)
);

-- ═══════════════════════════════════════════════════════════════════════════
-- 4. RPC FUNCTIONS
-- ═══════════════════════════════════════════════════════════════════════════

-- Generate error hash for grouping
CREATE OR REPLACE FUNCTION generate_error_hash(
  p_error_type TEXT,
  p_error_name TEXT,
  p_error_message TEXT,
  p_screen_name TEXT DEFAULT NULL,
  p_component_name TEXT DEFAULT NULL
)
RETURNS TEXT AS $$
BEGIN
  -- Create a hash based on error signature
  RETURN encode(
    sha256(
      (COALESCE(p_error_type, '') || '|' ||
       COALESCE(p_error_name, '') || '|' ||
       -- Normalize message (remove numbers, UUIDs, etc.)
       regexp_replace(COALESCE(p_error_message, ''), '[0-9a-f-]{36}|[0-9]+', 'X', 'gi') || '|' ||
       COALESCE(p_screen_name, '') || '|' ||
       COALESCE(p_component_name, ''))::bytea
    ),
    'hex'
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Report error
CREATE OR REPLACE FUNCTION report_error(
  p_user_id UUID,
  p_error_type TEXT,
  p_error_message TEXT,
  p_error_name TEXT DEFAULT NULL,
  p_error_stack TEXT DEFAULT NULL,
  p_screen_name TEXT DEFAULT NULL,
  p_component_name TEXT DEFAULT NULL,
  p_action_name TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}',
  p_device_type TEXT DEFAULT NULL,
  p_app_version TEXT DEFAULT NULL,
  p_severity TEXT DEFAULT 'error',
  p_is_handled BOOLEAN DEFAULT FALSE
)
RETURNS UUID AS $$
DECLARE
  v_error_hash TEXT;
  v_error_id UUID;
  v_pattern_id UUID;
BEGIN
  -- Generate hash
  v_error_hash := generate_error_hash(
    p_error_type, p_error_name, p_error_message,
    p_screen_name, p_component_name
  );

  -- Insert error log
  INSERT INTO ai_error_logs (
    user_id, error_hash, error_type, error_message, error_name, error_stack,
    screen_name, component_name, action_name, metadata,
    device_type, app_version, severity, is_handled
  ) VALUES (
    p_user_id, v_error_hash, p_error_type, p_error_message, p_error_name, p_error_stack,
    p_screen_name, p_component_name, p_action_name, p_metadata,
    p_device_type, p_app_version, p_severity, p_is_handled
  )
  RETURNING id INTO v_error_id;

  -- Update or create error pattern
  INSERT INTO ai_error_patterns (
    error_hash, error_type, error_name, error_message_template,
    occurrence_count, affected_users_count, last_seen_at,
    affected_screens, affected_components, severity
  ) VALUES (
    v_error_hash, p_error_type, p_error_name,
    regexp_replace(p_error_message, '[0-9a-f-]{36}|[0-9]+', 'X', 'gi'),
    1, 1, NOW(),
    CASE WHEN p_screen_name IS NOT NULL THEN ARRAY[p_screen_name] ELSE '{}' END,
    CASE WHEN p_component_name IS NOT NULL THEN ARRAY[p_component_name] ELSE '{}' END,
    p_severity
  )
  ON CONFLICT (error_hash) DO UPDATE SET
    occurrence_count = ai_error_patterns.occurrence_count + 1,
    last_seen_at = NOW(),
    affected_screens = (
      SELECT ARRAY(
        SELECT DISTINCT unnest(ai_error_patterns.affected_screens || ARRAY[p_screen_name])
        WHERE unnest IS NOT NULL
      )
    ),
    affected_components = (
      SELECT ARRAY(
        SELECT DISTINCT unnest(ai_error_patterns.affected_components || ARRAY[p_component_name])
        WHERE unnest IS NOT NULL
      )
    ),
    -- Escalate severity if needed
    severity = CASE
      WHEN ai_error_patterns.occurrence_count + 1 > 100 THEN 'critical'
      WHEN ai_error_patterns.occurrence_count + 1 > 50 THEN 'high'
      ELSE ai_error_patterns.severity
    END,
    -- Update priority based on occurrence
    priority = LEAST(ai_error_patterns.priority + 5, 100),
    updated_at = NOW()
  RETURNING id INTO v_pattern_id;

  -- Update affected users count (async would be better)
  UPDATE ai_error_patterns
  SET affected_users_count = (
    SELECT COUNT(DISTINCT user_id)
    FROM ai_error_logs
    WHERE error_hash = v_error_hash
  )
  WHERE error_hash = v_error_hash;

  RETURN v_error_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get error dashboard stats
CREATE OR REPLACE FUNCTION get_error_dashboard(p_days INT DEFAULT 7)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_errors', (
      SELECT COUNT(*) FROM ai_error_logs
      WHERE occurred_at > NOW() - (p_days || ' days')::INTERVAL
    ),
    'unique_patterns', (
      SELECT COUNT(DISTINCT error_hash) FROM ai_error_logs
      WHERE occurred_at > NOW() - (p_days || ' days')::INTERVAL
    ),
    'affected_users', (
      SELECT COUNT(DISTINCT user_id) FROM ai_error_logs
      WHERE occurred_at > NOW() - (p_days || ' days')::INTERVAL
    ),
    'critical_count', (
      SELECT COUNT(*) FROM ai_error_logs
      WHERE occurred_at > NOW() - (p_days || ' days')::INTERVAL
      AND severity = 'critical'
    ),
    'by_type', (
      SELECT jsonb_object_agg(error_type, cnt)
      FROM (
        SELECT error_type, COUNT(*) as cnt
        FROM ai_error_logs
        WHERE occurred_at > NOW() - (p_days || ' days')::INTERVAL
        GROUP BY error_type
      ) t
    ),
    'top_errors', (
      SELECT jsonb_agg(row_to_json(t))
      FROM (
        SELECT
          ep.error_hash,
          ep.error_message_template,
          ep.occurrence_count,
          ep.affected_users_count,
          ep.severity,
          ep.status
        FROM ai_error_patterns ep
        WHERE ep.last_seen_at > NOW() - (p_days || ' days')::INTERVAL
        ORDER BY ep.occurrence_count DESC
        LIMIT 10
      ) t
    ),
    'trend', (
      SELECT jsonb_agg(row_to_json(t) ORDER BY t.date)
      FROM (
        SELECT
          DATE(occurred_at) as date,
          COUNT(*) as count
        FROM ai_error_logs
        WHERE occurred_at > NOW() - (p_days || ' days')::INTERVAL
        GROUP BY DATE(occurred_at)
      ) t
    )
  ) INTO v_result;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get error pattern details
CREATE OR REPLACE FUNCTION get_error_pattern_details(p_error_hash TEXT)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'pattern', row_to_json(ep),
    'recent_occurrences', (
      SELECT jsonb_agg(row_to_json(el) ORDER BY el.occurred_at DESC)
      FROM (
        SELECT id, user_id, error_message, screen_name, component_name,
               device_type, app_version, occurred_at
        FROM ai_error_logs
        WHERE error_hash = p_error_hash
        ORDER BY occurred_at DESC
        LIMIT 20
      ) el
    ),
    'hourly_trend', (
      SELECT jsonb_agg(row_to_json(t) ORDER BY t.hour)
      FROM (
        SELECT
          date_trunc('hour', occurred_at) as hour,
          COUNT(*) as count
        FROM ai_error_logs
        WHERE error_hash = p_error_hash
          AND occurred_at > NOW() - INTERVAL '24 hours'
        GROUP BY date_trunc('hour', occurred_at)
      ) t
    )
  )
  INTO v_result
  FROM ai_error_patterns ep
  WHERE ep.error_hash = p_error_hash;

  RETURN COALESCE(v_result, '{}'::JSONB);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═══════════════════════════════════════════════════════════════════════════
-- 5. RLS POLICIES
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE ai_error_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_error_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_error_daily_stats ENABLE ROW LEVEL SECURITY;

-- Only admin can view error data
CREATE POLICY "Admin can view error logs"
  ON ai_error_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND (is_admin = TRUE OR role = 'admin')
    )
  );

-- Anyone can insert errors (for error reporting)
CREATE POLICY "Anyone can report errors"
  ON ai_error_logs FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "Admin can view error patterns"
  ON ai_error_patterns FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND (is_admin = TRUE OR role = 'admin')
    )
  );

CREATE POLICY "Admin can view error stats"
  ON ai_error_daily_stats FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND (is_admin = TRUE OR role = 'admin')
    )
  );

-- ═══════════════════════════════════════════════════════════════════════════
-- 6. TRIGGERS
-- ═══════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION update_ai_error_patterns_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_ai_error_patterns_updated
  BEFORE UPDATE ON ai_error_patterns
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_error_patterns_timestamp();

-- ═══════════════════════════════════════════════════════════════════════════
-- MIGRATION COMPLETE
-- ═══════════════════════════════════════════════════════════════════════════
