-- =====================================================
-- File: migrations/20260124_scanner_upgrade_v2.sql
-- Description: Scanner Upgrade V2 - Complete Schema
-- Version: 3.1
-- Date: 2026-01-24
-- =====================================================
--
-- TABLES CREATED:
-- 1. scanner_config - User scanner configuration
-- 2. scan_results_enhanced - Enhanced scan results with validation data
-- 3. scan_alerts - Scan alerts for notifications
--
-- =====================================================

-- =====================================================
-- TABLE 1: scanner_config
-- Description: User scanner configuration settings
-- =====================================================

CREATE TABLE IF NOT EXISTS scanner_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Volume thresholds (0.0 - 10.0)
  volume_strong DECIMAL(4,2) DEFAULT 2.0,        -- >= 2x = STRONG
  volume_good DECIMAL(4,2) DEFAULT 1.5,          -- >= 1.5x = GOOD
  volume_acceptable DECIMAL(4,2) DEFAULT 1.2,    -- >= 1.2x = ACCEPTABLE
  volume_minimum DECIMAL(4,2) DEFAULT 1.0,       -- >= 1x = MINIMUM
  volume_reject DECIMAL(4,2) DEFAULT 0.8,        -- < 0.8x = REJECT

  -- Confidence thresholds (0-100)
  confidence_base INTEGER DEFAULT 40,            -- Base starting score
  confidence_min INTEGER DEFAULT 55,             -- Min threshold for valid signal
  confidence_strong INTEGER DEFAULT 80,          -- A+ grade threshold
  confidence_good INTEGER DEFAULT 70,            -- A grade threshold

  -- Multi-timeframe settings
  mtf_enabled BOOLEAN DEFAULT true,              -- Enable MTF analysis
  mtf_strength_threshold INTEGER DEFAULT 60,     -- Min HTF trend strength

  -- Zone retest settings
  zone_retest_required BOOLEAN DEFAULT true,     -- Require zone retest
  zone_retest_lookback INTEGER DEFAULT 5,        -- Candles to look back for retest

  -- Swing point settings
  swing_lookback INTEGER DEFAULT 5,              -- Swing point lookback
  swing_min_confirmations INTEGER DEFAULT 2,     -- Min swing confirmations

  -- RSI settings
  rsi_lookback INTEGER DEFAULT 20,               -- RSI lookback period
  rsi_oversold INTEGER DEFAULT 30,               -- Oversold threshold
  rsi_overbought INTEGER DEFAULT 70,             -- Overbought threshold

  -- Alert settings
  alerts_enabled BOOLEAN DEFAULT true,           -- Enable scan alerts
  alert_on_zone_approach BOOLEAN DEFAULT true,   -- Alert when price approaches zone
  alert_on_retest BOOLEAN DEFAULT true,          -- Alert on zone retest
  alert_on_breakout BOOLEAN DEFAULT true,        -- Alert on breakout

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id)
);

-- Comment
COMMENT ON TABLE scanner_config IS 'User-specific scanner configuration settings for volume, confidence, MTF, zone retest thresholds';

-- Index for quick user lookup
CREATE INDEX IF NOT EXISTS idx_scanner_config_user ON scanner_config(user_id);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_scanner_config_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_scanner_config_updated ON scanner_config;
CREATE TRIGGER trg_scanner_config_updated
  BEFORE UPDATE ON scanner_config
  FOR EACH ROW
  EXECUTE FUNCTION update_scanner_config_timestamp();

-- RLS
ALTER TABLE scanner_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own scanner config" ON scanner_config;
CREATE POLICY "Users view own scanner config" ON scanner_config
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users insert own scanner config" ON scanner_config;
CREATE POLICY "Users insert own scanner config" ON scanner_config
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users update own scanner config" ON scanner_config;
CREATE POLICY "Users update own scanner config" ON scanner_config
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users delete own scanner config" ON scanner_config;
CREATE POLICY "Users delete own scanner config" ON scanner_config
  FOR DELETE USING (auth.uid() = user_id);


-- =====================================================
-- TABLE 2: scan_results_enhanced
-- Description: Enhanced scan results with validation data
-- =====================================================

CREATE TABLE IF NOT EXISTS scan_results_enhanced (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Pattern identification
  pattern_id VARCHAR(200) NOT NULL,              -- Unique pattern ID (symbol_type_tf_entry_sl)
  symbol VARCHAR(20) NOT NULL,
  timeframe VARCHAR(10) NOT NULL,
  pattern_type VARCHAR(50) NOT NULL,
  direction VARCHAR(10) NOT NULL CHECK (direction IN ('LONG', 'SHORT')),

  -- Price levels
  entry_price DECIMAL(20,8) NOT NULL,
  stop_loss DECIMAL(20,8) NOT NULL,
  take_profit DECIMAL(20,8),
  take_profit_2 DECIMAL(20,8),
  current_price DECIMAL(20,8),

  -- Volume validation
  volume_ratio DECIMAL(5,2),                     -- e.g., 1.75 = 1.75x average
  volume_score INTEGER DEFAULT 0,                -- -10 to +20
  volume_grade VARCHAR(20),                      -- REJECT, WEAK, MINIMUM, ACCEPTABLE, GOOD, STRONG
  volume_valid BOOLEAN DEFAULT false,

  -- Zone retest validation
  zone_retest_valid BOOLEAN DEFAULT false,
  zone_retest_strength VARCHAR(20),              -- WEAK, MEDIUM, STRONG
  zone_retest_score INTEGER DEFAULT 0,           -- 0 to +15
  zone_retest_at TIMESTAMPTZ,

  -- Higher timeframe alignment
  htf_alignment_valid BOOLEAN DEFAULT true,
  htf_trend_direction VARCHAR(10),               -- UP, DOWN, NEUTRAL
  htf_trend_strength INTEGER,                    -- 0-100
  htf_timeframe VARCHAR(10),                     -- e.g., '4h' for '1h' pattern
  htf_score INTEGER DEFAULT 0,                   -- -15 to +15

  -- Swing point quality
  swing_quality_score INTEGER DEFAULT 0,         -- 0 to +10
  swing_height DECIMAL(10,4),
  swing_confirmations INTEGER DEFAULT 0,

  -- RSI divergence
  rsi_divergence_type VARCHAR(20),               -- BULLISH, BEARISH, NONE
  rsi_divergence_strength VARCHAR(20),           -- WEAK, STRONG
  rsi_divergence_score INTEGER DEFAULT 0,        -- 0 to +10
  rsi_value DECIMAL(5,2),

  -- S/R Confluence
  sr_confluence_score INTEGER DEFAULT 0,         -- 0 to +10
  sr_levels JSONB,                               -- Array of S/R levels near entry

  -- Pattern quality
  pattern_symmetry DECIMAL(4,2),                 -- 0.0 to 1.0
  pattern_clarity DECIMAL(4,2),                  -- 0.0 to 1.0
  pattern_quality_score INTEGER DEFAULT 0,       -- 0 to +10

  -- Final confidence
  confidence_total INTEGER NOT NULL,             -- 30 to 98
  confidence_grade VARCHAR(10),                  -- A+, A, B+, B, C, REJECT
  confidence_breakdown JSONB,                    -- Detailed score breakdown

  -- Warnings & recommendations
  warnings TEXT[],                               -- Array of warning messages
  recommendation TEXT,                           -- Trading recommendation

  -- Risk/Reward
  risk_reward_ratio DECIMAL(5,2),                -- e.g., 2.5 = 1:2.5
  position_size_suggested DECIMAL(10,2),         -- Suggested position size %

  -- Status tracking
  status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN (
    'ACTIVE',       -- Pattern detected, waiting for entry
    'TRIGGERED',    -- Price reached entry
    'IN_TRADE',     -- User entered trade
    'HIT_TP',       -- Take profit hit
    'HIT_SL',       -- Stop loss hit
    'EXPIRED',      -- Pattern expired (too old)
    'INVALIDATED',  -- Pattern invalidated
    'CANCELLED'     -- User cancelled
  )),

  -- Timestamps
  pattern_detected_at TIMESTAMPTZ DEFAULT NOW(),
  triggered_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comment
COMMENT ON TABLE scan_results_enhanced IS 'Enhanced scan results with detailed validation scores and confidence breakdown';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_scan_enhanced_user ON scan_results_enhanced(user_id);
CREATE INDEX IF NOT EXISTS idx_scan_enhanced_symbol ON scan_results_enhanced(symbol);
CREATE INDEX IF NOT EXISTS idx_scan_enhanced_pattern_id ON scan_results_enhanced(pattern_id);
CREATE INDEX IF NOT EXISTS idx_scan_enhanced_status ON scan_results_enhanced(status);
CREATE INDEX IF NOT EXISTS idx_scan_enhanced_confidence ON scan_results_enhanced(confidence_total);
CREATE INDEX IF NOT EXISTS idx_scan_enhanced_timeframe ON scan_results_enhanced(timeframe);
CREATE INDEX IF NOT EXISTS idx_scan_enhanced_grade ON scan_results_enhanced(confidence_grade);
CREATE INDEX IF NOT EXISTS idx_scan_enhanced_active ON scan_results_enhanced(user_id, status)
  WHERE status = 'ACTIVE';

-- Trigger for updated_at
DROP TRIGGER IF EXISTS trg_scan_enhanced_updated ON scan_results_enhanced;
CREATE TRIGGER trg_scan_enhanced_updated
  BEFORE UPDATE ON scan_results_enhanced
  FOR EACH ROW
  EXECUTE FUNCTION update_scanner_config_timestamp();

-- RLS
ALTER TABLE scan_results_enhanced ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own scan results" ON scan_results_enhanced;
CREATE POLICY "Users view own scan results" ON scan_results_enhanced
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users insert own scan results" ON scan_results_enhanced;
CREATE POLICY "Users insert own scan results" ON scan_results_enhanced
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users update own scan results" ON scan_results_enhanced;
CREATE POLICY "Users update own scan results" ON scan_results_enhanced
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users delete own scan results" ON scan_results_enhanced;
CREATE POLICY "Users delete own scan results" ON scan_results_enhanced
  FOR DELETE USING (auth.uid() = user_id);


-- =====================================================
-- TABLE 3: scan_alerts
-- Description: Scan alerts for notifications
-- =====================================================

CREATE TABLE IF NOT EXISTS scan_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  scan_result_id UUID REFERENCES scan_results_enhanced(id) ON DELETE CASCADE,

  -- Alert info
  alert_type VARCHAR(30) NOT NULL CHECK (alert_type IN (
    'PATTERN_DETECTED',     -- New pattern detected
    'ZONE_APPROACH',        -- Price approaching zone
    'ZONE_RETEST',          -- Zone retest occurred
    'ENTRY_TRIGGERED',      -- Entry price reached
    'TP_APPROACHING',       -- Approaching take profit
    'SL_APPROACHING',       -- Approaching stop loss
    'TP_HIT',               -- Take profit hit
    'SL_HIT',               -- Stop loss hit
    'BREAKOUT',             -- Breakout detected
    'HTF_ALIGNMENT_CHANGE', -- Higher TF trend changed
    'PATTERN_EXPIRED',      -- Pattern expired
    'PATTERN_INVALIDATED'   -- Pattern invalidated
  )),

  -- Symbol & timeframe
  symbol VARCHAR(20) NOT NULL,
  timeframe VARCHAR(10) NOT NULL,
  pattern_type VARCHAR(50),

  -- Content
  title TEXT NOT NULL,
  message TEXT NOT NULL,

  -- Price context
  price_at_alert DECIMAL(20,8),
  entry_price DECIMAL(20,8),
  distance_percent DECIMAL(5,2),       -- Distance to target in %

  -- Confidence context
  confidence_score INTEGER,
  confidence_grade VARCHAR(10),

  -- Priority
  priority VARCHAR(10) DEFAULT 'NORMAL' CHECK (priority IN (
    'LOW', 'NORMAL', 'HIGH', 'URGENT'
  )),

  -- Status
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  is_pushed BOOLEAN DEFAULT false,
  push_sent_at TIMESTAMPTZ,
  push_failed BOOLEAN DEFAULT false,
  push_error TEXT,

  -- Metadata
  metadata JSONB,                      -- Additional context data

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comment
COMMENT ON TABLE scan_alerts IS 'Scanner alerts and notifications for pattern detection events';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_scan_alerts_user ON scan_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_scan_alerts_result ON scan_alerts(scan_result_id);
CREATE INDEX IF NOT EXISTS idx_scan_alerts_symbol ON scan_alerts(symbol);
CREATE INDEX IF NOT EXISTS idx_scan_alerts_type ON scan_alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_scan_alerts_unread ON scan_alerts(user_id, is_read)
  WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_scan_alerts_pending_push ON scan_alerts(is_pushed, push_failed)
  WHERE is_pushed = false AND push_failed = false;
CREATE INDEX IF NOT EXISTS idx_scan_alerts_created ON scan_alerts(created_at DESC);

-- RLS
ALTER TABLE scan_alerts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own scan alerts" ON scan_alerts;
CREATE POLICY "Users view own scan alerts" ON scan_alerts
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users update own scan alerts" ON scan_alerts;
CREATE POLICY "Users update own scan alerts" ON scan_alerts
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System insert scan alerts" ON scan_alerts;
CREATE POLICY "System insert scan alerts" ON scan_alerts
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users delete own scan alerts" ON scan_alerts;
CREATE POLICY "Users delete own scan alerts" ON scan_alerts
  FOR DELETE USING (auth.uid() = user_id);


-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to get or create user scanner config
CREATE OR REPLACE FUNCTION get_or_create_scanner_config(p_user_id UUID)
RETURNS scanner_config AS $$
DECLARE
  v_config scanner_config;
BEGIN
  SELECT * INTO v_config FROM scanner_config WHERE user_id = p_user_id;

  IF NOT FOUND THEN
    INSERT INTO scanner_config (user_id)
    VALUES (p_user_id)
    RETURNING * INTO v_config;
  END IF;

  RETURN v_config;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark scan result as triggered
CREATE OR REPLACE FUNCTION mark_scan_triggered(p_result_id UUID, p_current_price DECIMAL(20,8))
RETURNS scan_results_enhanced AS $$
DECLARE
  v_result scan_results_enhanced;
BEGIN
  UPDATE scan_results_enhanced
  SET
    status = 'TRIGGERED',
    current_price = p_current_price,
    triggered_at = NOW(),
    updated_at = NOW()
  WHERE id = p_result_id AND status = 'ACTIVE'
  RETURNING * INTO v_result;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get unread alert count
CREATE OR REPLACE FUNCTION get_unread_scan_alert_count(p_user_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER
    FROM scan_alerts
    WHERE user_id = p_user_id AND is_read = false
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark alerts as read
CREATE OR REPLACE FUNCTION mark_scan_alerts_read(p_user_id UUID, p_alert_ids UUID[])
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE scan_alerts
  SET is_read = true, read_at = NOW()
  WHERE user_id = p_user_id
    AND id = ANY(p_alert_ids)
    AND is_read = false;

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to cleanup old scan results
CREATE OR REPLACE FUNCTION cleanup_old_scan_results(p_days_old INTEGER DEFAULT 30)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  DELETE FROM scan_results_enhanced
  WHERE created_at < NOW() - (p_days_old || ' days')::INTERVAL
    AND status NOT IN ('IN_TRADE', 'ACTIVE');

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON scanner_config TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON scan_results_enhanced TO authenticated;
GRANT SELECT, UPDATE, DELETE ON scan_alerts TO authenticated;
GRANT INSERT ON scan_alerts TO service_role;

GRANT EXECUTE ON FUNCTION get_or_create_scanner_config TO authenticated;
GRANT EXECUTE ON FUNCTION mark_scan_triggered TO authenticated;
GRANT EXECUTE ON FUNCTION get_unread_scan_alert_count TO authenticated;
GRANT EXECUTE ON FUNCTION mark_scan_alerts_read TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_old_scan_results TO service_role;


-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Scanner Upgrade V2 migration completed successfully!';
  RAISE NOTICE '   - scanner_config table created';
  RAISE NOTICE '   - scan_results_enhanced table created';
  RAISE NOTICE '   - scan_alerts table created';
  RAISE NOTICE '   - Helper functions created';
  RAISE NOTICE '   - RLS policies applied';
END $$;
