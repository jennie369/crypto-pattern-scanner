-- =====================================================
-- SCANNER OPTIMIZATION DATABASE SCHEMA
-- Created: 2026-01-29
-- Description: Tables for caching and pattern persistence
-- =====================================================

-- 1. Pattern Cache Table
-- Stores cached pattern detection results for faster loading
CREATE TABLE IF NOT EXISTS public.pattern_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  symbol VARCHAR(20) NOT NULL,
  timeframe VARCHAR(10) NOT NULL,
  patterns JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '5 minutes'),

  -- Composite unique constraint
  CONSTRAINT unique_user_symbol_tf UNIQUE (user_id, symbol, timeframe)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_pattern_cache_lookup
ON public.pattern_cache(user_id, symbol, timeframe, expires_at);

-- Auto-cleanup expired cache
CREATE OR REPLACE FUNCTION cleanup_expired_pattern_cache()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM public.pattern_cache
  WHERE expires_at < NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists then recreate
DROP TRIGGER IF EXISTS trigger_cleanup_pattern_cache ON public.pattern_cache;
CREATE TRIGGER trigger_cleanup_pattern_cache
AFTER INSERT ON public.pattern_cache
EXECUTE FUNCTION cleanup_expired_pattern_cache();

-- 2. Scan History Table
-- Tracks scan activity for analytics
CREATE TABLE IF NOT EXISTS public.scan_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  scan_type VARCHAR(20) NOT NULL, -- 'quick', 'full', 'multi_tf'
  coins_scanned INTEGER DEFAULT 0,
  patterns_found INTEGER DEFAULT 0,
  timeframes TEXT[] DEFAULT '{}',
  filters JSONB DEFAULT '{}',
  duration_ms INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for user history
CREATE INDEX IF NOT EXISTS idx_scan_history_user
ON public.scan_history(user_id, created_at DESC);

-- 3. Pattern Alerts Table
-- User-defined alerts for specific patterns
CREATE TABLE IF NOT EXISTS public.pattern_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  symbol VARCHAR(20) NOT NULL,
  pattern_type VARCHAR(50) NOT NULL,
  direction VARCHAR(10) DEFAULT 'both', -- 'bullish', 'bearish', 'both'
  timeframes TEXT[] DEFAULT '{1h,4h}',
  min_confidence DECIMAL(3,2) DEFAULT 0.70,
  notify_push BOOLEAN DEFAULT true,
  notify_email BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  triggered_count INTEGER DEFAULT 0,
  last_triggered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for active alerts
CREATE INDEX IF NOT EXISTS idx_pattern_alerts_active
ON public.pattern_alerts(user_id, is_active, symbol);

-- 4. WebSocket Subscription Tracking
-- Tracks active WS subscriptions for cleanup
CREATE TABLE IF NOT EXISTS public.ws_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  device_id VARCHAR(100),
  symbols TEXT[] DEFAULT '{}',
  connected_at TIMESTAMPTZ DEFAULT NOW(),
  last_ping TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- Index for active subscriptions
CREATE INDEX IF NOT EXISTS idx_ws_subscriptions_active
ON public.ws_subscriptions(user_id, is_active);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS
ALTER TABLE public.pattern_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scan_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pattern_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ws_subscriptions ENABLE ROW LEVEL SECURITY;

-- Pattern Cache Policies
DROP POLICY IF EXISTS "Users can view own cache" ON public.pattern_cache;
CREATE POLICY "Users can view own cache"
ON public.pattern_cache FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own cache" ON public.pattern_cache;
CREATE POLICY "Users can insert own cache"
ON public.pattern_cache FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own cache" ON public.pattern_cache;
CREATE POLICY "Users can update own cache"
ON public.pattern_cache FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own cache" ON public.pattern_cache;
CREATE POLICY "Users can delete own cache"
ON public.pattern_cache FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Scan History Policies
DROP POLICY IF EXISTS "Users can view own scan history" ON public.scan_history;
CREATE POLICY "Users can view own scan history"
ON public.scan_history FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own scan history" ON public.scan_history;
CREATE POLICY "Users can insert own scan history"
ON public.scan_history FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Pattern Alerts Policies
DROP POLICY IF EXISTS "Users can manage own alerts" ON public.pattern_alerts;
CREATE POLICY "Users can manage own alerts"
ON public.pattern_alerts FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- WS Subscriptions Policies
DROP POLICY IF EXISTS "Users can manage own subscriptions" ON public.ws_subscriptions;
CREATE POLICY "Users can manage own subscriptions"
ON public.ws_subscriptions FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to get or create cache
CREATE OR REPLACE FUNCTION get_or_create_pattern_cache(
  p_user_id UUID,
  p_symbol VARCHAR,
  p_timeframe VARCHAR
)
RETURNS JSONB AS $$
DECLARE
  v_patterns JSONB;
BEGIN
  -- Try to get valid cache
  SELECT patterns INTO v_patterns
  FROM public.pattern_cache
  WHERE user_id = p_user_id
    AND symbol = p_symbol
    AND timeframe = p_timeframe
    AND expires_at > NOW();

  RETURN v_patterns;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to upsert cache
CREATE OR REPLACE FUNCTION upsert_pattern_cache(
  p_user_id UUID,
  p_symbol VARCHAR,
  p_timeframe VARCHAR,
  p_patterns JSONB,
  p_ttl_minutes INTEGER DEFAULT 5
)
RETURNS UUID AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO public.pattern_cache (user_id, symbol, timeframe, patterns, expires_at)
  VALUES (
    p_user_id,
    p_symbol,
    p_timeframe,
    p_patterns,
    NOW() + (p_ttl_minutes || ' minutes')::INTERVAL
  )
  ON CONFLICT (user_id, symbol, timeframe)
  DO UPDATE SET
    patterns = EXCLUDED.patterns,
    expires_at = EXCLUDED.expires_at,
    created_at = NOW()
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log scan history
CREATE OR REPLACE FUNCTION log_scan_history(
  p_user_id UUID,
  p_scan_type VARCHAR,
  p_coins_scanned INTEGER,
  p_patterns_found INTEGER,
  p_timeframes TEXT[],
  p_filters JSONB,
  p_duration_ms INTEGER
)
RETURNS UUID AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO public.scan_history (
    user_id, scan_type, coins_scanned, patterns_found,
    timeframes, filters, duration_ms
  )
  VALUES (
    p_user_id, p_scan_type, p_coins_scanned, p_patterns_found,
    p_timeframes, p_filters, p_duration_ms
  )
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get scan statistics for a user
CREATE OR REPLACE FUNCTION get_scan_statistics(
  p_user_id UUID,
  p_days INTEGER DEFAULT 30
)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_scans', COUNT(*),
    'total_patterns_found', COALESCE(SUM(patterns_found), 0),
    'total_coins_scanned', COALESCE(SUM(coins_scanned), 0),
    'avg_duration_ms', COALESCE(AVG(duration_ms), 0)::INTEGER,
    'scan_types', jsonb_object_agg(scan_type, type_count)
  )
  INTO v_result
  FROM (
    SELECT
      scan_type,
      COUNT(*) as type_count
    FROM public.scan_history
    WHERE user_id = p_user_id
      AND created_at > NOW() - (p_days || ' days')::INTERVAL
    GROUP BY scan_type
  ) sub
  CROSS JOIN (
    SELECT
      COUNT(*) as total,
      SUM(patterns_found) as patterns_found,
      SUM(coins_scanned) as coins_scanned,
      AVG(duration_ms) as duration_ms
    FROM public.scan_history
    WHERE user_id = p_user_id
      AND created_at > NOW() - (p_days || ' days')::INTERVAL
  ) totals;

  RETURN COALESCE(v_result, '{}'::JSONB);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- GRANTS
-- =====================================================

GRANT EXECUTE ON FUNCTION get_or_create_pattern_cache TO authenticated;
GRANT EXECUTE ON FUNCTION upsert_pattern_cache TO authenticated;
GRANT EXECUTE ON FUNCTION log_scan_history TO authenticated;
GRANT EXECUTE ON FUNCTION get_scan_statistics TO authenticated;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE public.pattern_cache IS 'Caches pattern detection results for faster loading (TTL-based)';
COMMENT ON TABLE public.scan_history IS 'Tracks user scan activity for analytics and optimization';
COMMENT ON TABLE public.pattern_alerts IS 'User-defined alerts for specific pattern types';
COMMENT ON TABLE public.ws_subscriptions IS 'Tracks active WebSocket subscriptions for cleanup';
