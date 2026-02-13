-- ============================================================================
-- PHASE 5: PRODUCTION TABLES
-- Created: 2024-12-27
-- Description: System health, error logs, performance metrics, admin audit
-- ============================================================================

-- ============================================================================
-- 1. SYSTEM HEALTH LOGS
-- ============================================================================

CREATE TABLE IF NOT EXISTS system_health_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('healthy', 'degraded', 'unhealthy')),
  latency_ms INTEGER,
  error_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  checked_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_health_logs_service ON system_health_logs(service_name);
CREATE INDEX IF NOT EXISTS idx_health_logs_status ON system_health_logs(status);
CREATE INDEX IF NOT EXISTS idx_health_logs_checked_at ON system_health_logs(checked_at DESC);

-- ============================================================================
-- 2. ERROR LOGS
-- ============================================================================

CREATE TABLE IF NOT EXISTS error_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  error_type TEXT NOT NULL,
  error_code TEXT,
  error_message TEXT NOT NULL,
  stack_trace TEXT,
  user_id UUID REFERENCES auth.users(id),
  session_id UUID,
  context JSONB DEFAULT '{}',
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_error_logs_type ON error_logs(error_type);
CREATE INDEX IF NOT EXISTS idx_error_logs_severity ON error_logs(severity);
CREATE INDEX IF NOT EXISTS idx_error_logs_resolved ON error_logs(resolved);
CREATE INDEX IF NOT EXISTS idx_error_logs_created_at ON error_logs(created_at DESC);

-- ============================================================================
-- 3. PERFORMANCE METRICS
-- ============================================================================

CREATE TABLE IF NOT EXISTS performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name TEXT NOT NULL,
  metric_value DECIMAL NOT NULL,
  metric_unit TEXT NOT NULL,
  tags JSONB DEFAULT '{}',
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_perf_metrics_name ON performance_metrics(metric_name);
CREATE INDEX IF NOT EXISTS idx_perf_metrics_recorded_at ON performance_metrics(recorded_at DESC);
-- Note: Removed date_trunc index as it requires IMMUTABLE function
-- For monthly queries, use WHERE clause with date range instead

-- ============================================================================
-- 4. ADMIN AUDIT LOGS
-- ============================================================================

CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES auth.users(id),
  action_type TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT,
  old_value JSONB,
  new_value JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_admin ON admin_audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON admin_audit_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_target ON admin_audit_logs(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON admin_audit_logs(created_at DESC);

-- ============================================================================
-- 5. CACHE METADATA
-- ============================================================================

CREATE TABLE IF NOT EXISTS cache_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key TEXT NOT NULL UNIQUE,
  cache_type TEXT NOT NULL,
  hit_count INTEGER DEFAULT 0,
  miss_count INTEGER DEFAULT 0,
  last_hit_at TIMESTAMPTZ,
  last_miss_at TIMESTAMPTZ,
  ttl_seconds INTEGER,
  size_bytes INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cache_meta_key ON cache_metadata(cache_key);
CREATE INDEX IF NOT EXISTS idx_cache_meta_type ON cache_metadata(cache_type);

-- ============================================================================
-- 6. DEPLOYMENT LOGS
-- ============================================================================

CREATE TABLE IF NOT EXISTS deployment_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version TEXT NOT NULL,
  environment TEXT NOT NULL CHECK (environment IN ('development', 'staging', 'production')),
  status TEXT NOT NULL CHECK (status IN ('pending', 'deploying', 'success', 'failed', 'rolled_back')),
  deployed_by UUID REFERENCES auth.users(id),
  commit_hash TEXT,
  release_notes TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  rollback_to TEXT,
  metadata JSONB DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_deploy_logs_env ON deployment_logs(environment);
CREATE INDEX IF NOT EXISTS idx_deploy_logs_status ON deployment_logs(status);
CREATE INDEX IF NOT EXISTS idx_deploy_logs_started_at ON deployment_logs(started_at DESC);

-- ============================================================================
-- 7. DAILY ANALYTICS (Pre-computed)
-- ============================================================================

CREATE TABLE IF NOT EXISTS daily_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  metric_type TEXT NOT NULL,
  metric_name TEXT NOT NULL,
  value DECIMAL NOT NULL,
  comparison_value DECIMAL,
  change_percent DECIMAL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(date, metric_type, metric_name)
);

CREATE INDEX IF NOT EXISTS idx_daily_analytics_date ON daily_analytics(date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_analytics_type ON daily_analytics(metric_type);

-- ============================================================================
-- 8. BETA FEEDBACK
-- ============================================================================

CREATE TABLE IF NOT EXISTS beta_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  feedback_type TEXT NOT NULL CHECK (feedback_type IN ('bug', 'feature', 'improvement', 'praise', 'other')),
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'reviewing', 'in_progress', 'resolved', 'wont_fix')),
  screenshots TEXT[],
  session_data JSONB,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id),
  resolution_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_beta_feedback_user ON beta_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_beta_feedback_type ON beta_feedback(feedback_type);
CREATE INDEX IF NOT EXISTS idx_beta_feedback_status ON beta_feedback(status);
CREATE INDEX IF NOT EXISTS idx_beta_feedback_priority ON beta_feedback(priority);

-- ============================================================================
-- 9. RLS POLICIES
-- ============================================================================

-- System health logs
ALTER TABLE system_health_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "System can insert health logs" ON system_health_logs;
CREATE POLICY "System can insert health logs" ON system_health_logs
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view health logs" ON system_health_logs;
CREATE POLICY "Admins can view health logs" ON system_health_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Error logs
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "System can insert error logs" ON error_logs;
CREATE POLICY "System can insert error logs" ON error_logs
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can manage error logs" ON error_logs;
CREATE POLICY "Admins can manage error logs" ON error_logs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Performance metrics
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "System can insert perf metrics" ON performance_metrics;
CREATE POLICY "System can insert perf metrics" ON performance_metrics
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view perf metrics" ON performance_metrics;
CREATE POLICY "Admins can view perf metrics" ON performance_metrics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admin audit logs
ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "System can insert audit logs" ON admin_audit_logs;
CREATE POLICY "System can insert audit logs" ON admin_audit_logs
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view audit logs" ON admin_audit_logs;
CREATE POLICY "Admins can view audit logs" ON admin_audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Cache metadata
ALTER TABLE cache_metadata ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage cache metadata" ON cache_metadata;
CREATE POLICY "Admins can manage cache metadata" ON cache_metadata
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Deployment logs
ALTER TABLE deployment_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage deployment logs" ON deployment_logs;
CREATE POLICY "Admins can manage deployment logs" ON deployment_logs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Daily analytics
ALTER TABLE daily_analytics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "System can manage daily analytics" ON daily_analytics;
CREATE POLICY "System can manage daily analytics" ON daily_analytics
  FOR ALL WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view daily analytics" ON daily_analytics;
CREATE POLICY "Admins can view daily analytics" ON daily_analytics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Beta feedback
ALTER TABLE beta_feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can create own feedback" ON beta_feedback;
CREATE POLICY "Users can create own feedback" ON beta_feedback
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own feedback" ON beta_feedback;
CREATE POLICY "Users can view own feedback" ON beta_feedback
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage all feedback" ON beta_feedback;
CREATE POLICY "Admins can manage all feedback" ON beta_feedback
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- 10. RPC FUNCTIONS
-- ============================================================================

-- Record performance metrics (batch)
CREATE OR REPLACE FUNCTION record_performance_metrics(
  metrics JSONB
) RETURNS void AS $$
DECLARE
  metric JSONB;
BEGIN
  FOR metric IN SELECT * FROM jsonb_array_elements(metrics)
  LOOP
    INSERT INTO performance_metrics (
      metric_name,
      metric_value,
      metric_unit,
      tags
    ) VALUES (
      metric->>'name',
      (metric->>'value')::decimal,
      metric->>'unit',
      COALESCE(metric->'tags', '{}'::jsonb)
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get system health summary
CREATE OR REPLACE FUNCTION get_system_health_summary()
RETURNS TABLE (
  service_name TEXT,
  status TEXT,
  avg_latency_ms DECIMAL,
  error_rate DECIMAL,
  last_check TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT ON (shl.service_name)
    shl.service_name,
    shl.status,
    AVG(shl.latency_ms) OVER (
      PARTITION BY shl.service_name
      ORDER BY shl.checked_at DESC
      ROWS BETWEEN CURRENT ROW AND 9 FOLLOWING
    )::DECIMAL as avg_latency_ms,
    (shl.error_count::decimal / GREATEST(shl.error_count + 1, 1)) * 100 as error_rate,
    shl.checked_at as last_check
  FROM system_health_logs shl
  WHERE shl.checked_at > NOW() - INTERVAL '1 hour'
  ORDER BY shl.service_name, shl.checked_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Aggregate daily analytics
CREATE OR REPLACE FUNCTION aggregate_daily_analytics(target_date DATE)
RETURNS void AS $$
BEGIN
  -- Revenue metrics
  INSERT INTO daily_analytics (date, metric_type, metric_name, value)
  SELECT
    target_date,
    'revenue',
    'total_revenue',
    COALESCE(SUM((properties->>'order_value')::decimal), 0)
  FROM analytics_events
  WHERE event_name = 'purchase'
    AND DATE(timestamp) = target_date
  ON CONFLICT (date, metric_type, metric_name)
  DO UPDATE SET value = EXCLUDED.value, created_at = NOW();

  -- Session metrics
  INSERT INTO daily_analytics (date, metric_type, metric_name, value)
  SELECT
    target_date,
    'engagement',
    'total_sessions',
    COUNT(DISTINCT id)
  FROM livestream_sessions
  WHERE DATE(started_at) = target_date
  ON CONFLICT (date, metric_type, metric_name)
  DO UPDATE SET value = EXCLUDED.value, created_at = NOW();

  -- Comment metrics
  INSERT INTO daily_analytics (date, metric_type, metric_name, value)
  SELECT
    target_date,
    'engagement',
    'total_comments',
    COUNT(*)
  FROM livestream_comments
  WHERE DATE(created_at) = target_date
  ON CONFLICT (date, metric_type, metric_name)
  DO UPDATE SET value = EXCLUDED.value, created_at = NOW();

  -- Viewer metrics
  INSERT INTO daily_analytics (date, metric_type, metric_name, value)
  SELECT
    target_date,
    'engagement',
    'unique_viewers',
    COUNT(DISTINCT user_id)
  FROM analytics_events
  WHERE event_name = 'livestream_join'
    AND DATE(timestamp) = target_date
  ON CONFLICT (date, metric_type, metric_name)
  DO UPDATE SET value = EXCLUDED.value, created_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get dashboard stats
CREATE OR REPLACE FUNCTION get_admin_dashboard_stats(target_date DATE DEFAULT CURRENT_DATE)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'revenue', COALESCE((
      SELECT SUM((properties->>'order_value')::decimal)
      FROM analytics_events
      WHERE event_name = 'purchase'
        AND DATE(timestamp) = target_date
    ), 0),
    'orders', COALESCE((
      SELECT COUNT(*)
      FROM analytics_events
      WHERE event_name = 'purchase'
        AND DATE(timestamp) = target_date
    ), 0),
    'active_users', COALESCE((
      SELECT COUNT(DISTINCT user_id)
      FROM analytics_events
      WHERE DATE(timestamp) = target_date
    ), 0),
    'livestreams', COALESCE((
      SELECT COUNT(*)
      FROM livestream_sessions
      WHERE DATE(started_at) = target_date
    ), 0),
    'comments', COALESCE((
      SELECT COUNT(*)
      FROM livestream_comments
      WHERE DATE(created_at) = target_date
    ), 0),
    'errors', COALESCE((
      SELECT COUNT(*)
      FROM error_logs
      WHERE DATE(created_at) = target_date
        AND resolved = false
    ), 0)
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE system_health_logs IS 'System health check results for monitoring';
COMMENT ON TABLE error_logs IS 'Application error logs for debugging';
COMMENT ON TABLE performance_metrics IS 'Performance metrics for optimization';
COMMENT ON TABLE admin_audit_logs IS 'Admin action audit trail';
COMMENT ON TABLE cache_metadata IS 'Cache statistics for optimization';
COMMENT ON TABLE deployment_logs IS 'Deployment history tracking';
COMMENT ON TABLE daily_analytics IS 'Pre-computed daily analytics for dashboard';
COMMENT ON TABLE beta_feedback IS 'User feedback during beta testing';
