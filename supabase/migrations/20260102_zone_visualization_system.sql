-- =====================================================
-- ZONE VISUALIZATION SYSTEM
-- Created: 2026-01-02
-- Description: Tables for zone visualization, lifecycle tracking, MTF alignment
-- =====================================================

-- Enable UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. DETECTED ZONES TABLE
-- Stores all detected zones for chart visualization
-- Multiple zones per symbol/timeframe allowed
-- Tracks lifecycle: FRESH -> TESTED_1X -> TESTED_2X -> BROKEN
-- =====================================================
CREATE TABLE IF NOT EXISTS detected_zones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Zone identification
  symbol VARCHAR(20) NOT NULL,           -- 'BTCUSDT'
  timeframe VARCHAR(10) NOT NULL,        -- '4h', '1d'
  zone_type VARCHAR(10) NOT NULL,        -- 'HFZ' or 'LFZ'

  -- Zone boundaries (CRITICAL for drawing)
  zone_high DECIMAL(20, 8) NOT NULL,     -- Top of zone
  zone_low DECIMAL(20, 8) NOT NULL,      -- Bottom of zone
  entry_price DECIMAL(20, 8) NOT NULL,   -- Entry level
  stop_price DECIMAL(20, 8) NOT NULL,    -- Stop level

  -- Time boundaries
  start_time BIGINT NOT NULL,            -- Unix timestamp (ms)
  end_time BIGINT,                       -- NULL = extend right
  start_candle_index INT,                -- Index in candle array

  -- Pattern that created this zone
  pattern_type VARCHAR(30) NOT NULL,     -- 'DPD', 'UPU', 'QM', etc.
  pattern_confidence DECIMAL(5, 2),      -- 0-100
  pattern_grade VARCHAR(2),              -- 'A+', 'A', 'B', etc.

  -- Zone lifecycle
  status VARCHAR(20) DEFAULT 'FRESH',    -- FRESH, TESTED_1X, TESTED_2X, TESTED_3X_PLUS, BROKEN, EXPIRED
  test_count INT DEFAULT 0,
  strength INT DEFAULT 100,              -- 0-100, decreases on tests

  -- Scoring
  odds_score INT DEFAULT 0,              -- 0-16 from Odds Enhancers
  hierarchy_rank INT DEFAULT 0,          -- 1=DP, 2=FTR, 3=FL, 4=Regular

  -- Target levels (JSON array)
  targets JSONB DEFAULT '[]'::jsonb,     -- Array of target prices

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_tested_at TIMESTAMPTZ,
  broken_at TIMESTAMPTZ,

  -- Soft delete
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMPTZ,

  -- Constraints
  CONSTRAINT valid_zone_type CHECK (zone_type IN ('HFZ', 'LFZ')),
  CONSTRAINT valid_status CHECK (status IN ('FRESH', 'TESTED_1X', 'TESTED_2X', 'TESTED_3X_PLUS', 'BROKEN', 'EXPIRED')),
  CONSTRAINT valid_zone_boundaries CHECK (zone_high > zone_low),
  CONSTRAINT valid_strength CHECK (strength >= 0 AND strength <= 100)
);

-- =====================================================
-- 2. ZONE TEST HISTORY
-- Records each time a zone is tested by price
-- Links to detected_zones via zone_id
-- =====================================================
CREATE TABLE IF NOT EXISTS zone_test_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  zone_id UUID NOT NULL REFERENCES detected_zones(id) ON DELETE CASCADE,

  test_time BIGINT NOT NULL,             -- Unix timestamp (ms)
  test_price DECIMAL(20, 8) NOT NULL,    -- Price when test occurred
  penetration_depth DECIMAL(5, 2),       -- % penetration into zone

  -- Result
  result VARCHAR(20) NOT NULL,           -- 'BOUNCED', 'PENETRATED', 'BROKEN'
  candle_pattern VARCHAR(30),            -- Confirmation pattern if any

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_result CHECK (result IN ('BOUNCED', 'PENETRATED', 'BROKEN'))
);

-- =====================================================
-- 3. MTF ALIGNMENT CACHE
-- Caches multi-timeframe alignment calculations
-- Expires after configured period
-- =====================================================
CREATE TABLE IF NOT EXISTS mtf_alignment_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  symbol VARCHAR(20) NOT NULL,

  -- Zone IDs from different timeframes
  htf_zone_id UUID REFERENCES detected_zones(id) ON DELETE SET NULL,  -- 1D/1W
  itf_zone_id UUID REFERENCES detected_zones(id) ON DELETE SET NULL,  -- 4H
  ltf_zone_id UUID REFERENCES detected_zones(id) ON DELETE SET NULL,  -- 1H/15m

  -- HTF zone data (cached for display)
  htf_timeframe VARCHAR(10),
  htf_zone_type VARCHAR(10),
  htf_zone_high DECIMAL(20, 8),
  htf_zone_low DECIMAL(20, 8),

  -- ITF zone data (cached)
  itf_timeframe VARCHAR(10),
  itf_zone_type VARCHAR(10),
  itf_zone_high DECIMAL(20, 8),
  itf_zone_low DECIMAL(20, 8),

  -- LTF zone data (cached)
  ltf_timeframe VARCHAR(10),
  ltf_zone_type VARCHAR(10),
  ltf_zone_high DECIMAL(20, 8),
  ltf_zone_low DECIMAL(20, 8),

  -- Alignment score
  confluence_score INT DEFAULT 0,        -- 0-10
  alignment_type VARCHAR(20),            -- 'FULL', 'PARTIAL', 'NONE'
  recommendation VARCHAR(50),            -- 'HIGH_PROBABILITY', 'NORMAL', 'SKIP'
  direction VARCHAR(10),                 -- 'LONG', 'SHORT', 'NEUTRAL'

  -- Cache validity
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,

  -- Unique constraint per user/symbol
  UNIQUE(user_id, symbol),

  -- Constraints
  CONSTRAINT valid_alignment_type CHECK (alignment_type IN ('FULL', 'PARTIAL', 'NONE')),
  CONSTRAINT valid_recommendation CHECK (recommendation IN ('HIGH_PROBABILITY', 'NORMAL', 'SKIP'))
);

-- =====================================================
-- 4. ZONE VISUALIZATION PREFERENCES
-- User settings for zone display colors, visibility
-- =====================================================
CREATE TABLE IF NOT EXISTS zone_visualization_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,

  -- Display settings
  show_hfz BOOLEAN DEFAULT TRUE,
  show_lfz BOOLEAN DEFAULT TRUE,
  show_labels BOOLEAN DEFAULT TRUE,
  show_historical BOOLEAN DEFAULT TRUE,
  max_zones_displayed INT DEFAULT 10,

  -- Colors (user customizable)
  hfz_fill_color VARCHAR(30) DEFAULT 'rgba(156, 6, 18, 0.3)',
  hfz_border_color VARCHAR(20) DEFAULT '#9C0612',
  lfz_fill_color VARCHAR(30) DEFAULT 'rgba(14, 203, 129, 0.3)',
  lfz_border_color VARCHAR(20) DEFAULT '#0ECB81',

  -- Lifecycle colors
  fresh_color VARCHAR(20) DEFAULT '#FFBD59',
  tested_color VARCHAR(20) DEFAULT '#F97316',
  broken_color VARCHAR(20) DEFAULT '#6B7280',

  -- Line colors
  entry_color VARCHAR(20) DEFAULT '#00F0FF',
  stop_color VARCHAR(20) DEFAULT '#EF4444',
  target_color VARCHAR(20) DEFAULT '#10B981',

  -- Notifications
  notify_on_retest BOOLEAN DEFAULT TRUE,
  notify_on_broken BOOLEAN DEFAULT TRUE,
  notify_on_new_zone BOOLEAN DEFAULT FALSE,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 5. ZONE ALERTS
-- User-configured alerts for specific zones
-- =====================================================
CREATE TABLE IF NOT EXISTS zone_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  zone_id UUID NOT NULL REFERENCES detected_zones(id) ON DELETE CASCADE,

  -- Alert configuration
  alert_type VARCHAR(20) NOT NULL,       -- 'RETEST', 'BROKEN', 'APPROACH'
  threshold_percent DECIMAL(5, 2),       -- Distance % for APPROACH alerts

  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  triggered_at TIMESTAMPTZ,
  trigger_count INT DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_alert_type CHECK (alert_type IN ('RETEST', 'BROKEN', 'APPROACH'))
);

-- =====================================================
-- INDEXES for performance
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_zones_user_symbol ON detected_zones(user_id, symbol);
CREATE INDEX IF NOT EXISTS idx_zones_status ON detected_zones(status) WHERE is_deleted = FALSE;
CREATE INDEX IF NOT EXISTS idx_zones_timeframe ON detected_zones(symbol, timeframe);
CREATE INDEX IF NOT EXISTS idx_zones_created ON detected_zones(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_zones_user_symbol_tf ON detected_zones(user_id, symbol, timeframe) WHERE is_deleted = FALSE;
CREATE INDEX IF NOT EXISTS idx_zones_active ON detected_zones(user_id, symbol, status) WHERE is_deleted = FALSE AND status NOT IN ('BROKEN', 'EXPIRED');

CREATE INDEX IF NOT EXISTS idx_zone_tests_zone ON zone_test_history(zone_id);
CREATE INDEX IF NOT EXISTS idx_zone_tests_time ON zone_test_history(test_time DESC);

CREATE INDEX IF NOT EXISTS idx_mtf_cache_symbol ON mtf_alignment_cache(user_id, symbol);
CREATE INDEX IF NOT EXISTS idx_mtf_cache_expires ON mtf_alignment_cache(expires_at) WHERE expires_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_zone_alerts_user ON zone_alerts(user_id) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_zone_alerts_zone ON zone_alerts(zone_id) WHERE is_active = TRUE;

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE detected_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE zone_test_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE mtf_alignment_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE zone_visualization_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE zone_alerts ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES for detected_zones
-- =====================================================
DROP POLICY IF EXISTS "Users can view own zones" ON detected_zones;
CREATE POLICY "Users can view own zones" ON detected_zones
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own zones" ON detected_zones;
CREATE POLICY "Users can insert own zones" ON detected_zones
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own zones" ON detected_zones;
CREATE POLICY "Users can update own zones" ON detected_zones
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own zones" ON detected_zones;
CREATE POLICY "Users can delete own zones" ON detected_zones
  FOR DELETE USING (auth.uid() = user_id);

-- Admin policy for detected_zones
DROP POLICY IF EXISTS "Admins can manage all zones" ON detected_zones;
CREATE POLICY "Admins can manage all zones" ON detected_zones
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND (is_admin = TRUE OR role = 'admin' OR scanner_tier = 'ADMIN')
    )
  );

-- =====================================================
-- RLS POLICIES for zone_test_history
-- =====================================================
DROP POLICY IF EXISTS "Users can view own zone tests" ON zone_test_history;
CREATE POLICY "Users can view own zone tests" ON zone_test_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM detected_zones
      WHERE id = zone_test_history.zone_id
      AND user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert zone tests" ON zone_test_history;
CREATE POLICY "Users can insert zone tests" ON zone_test_history
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM detected_zones
      WHERE id = zone_test_history.zone_id
      AND user_id = auth.uid()
    )
  );

-- =====================================================
-- RLS POLICIES for mtf_alignment_cache
-- =====================================================
DROP POLICY IF EXISTS "Users can manage own mtf cache" ON mtf_alignment_cache;
CREATE POLICY "Users can manage own mtf cache" ON mtf_alignment_cache
  FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- RLS POLICIES for zone_visualization_preferences
-- =====================================================
DROP POLICY IF EXISTS "Users can manage own preferences" ON zone_visualization_preferences;
CREATE POLICY "Users can manage own preferences" ON zone_visualization_preferences
  FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- RLS POLICIES for zone_alerts
-- =====================================================
DROP POLICY IF EXISTS "Users can manage own zone alerts" ON zone_alerts;
CREATE POLICY "Users can manage own zone alerts" ON zone_alerts
  FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function: Update zone status on test
CREATE OR REPLACE FUNCTION update_zone_on_test()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE detected_zones
  SET
    test_count = test_count + 1,
    status = CASE
      WHEN NEW.result = 'BROKEN' THEN 'BROKEN'
      WHEN test_count + 1 = 1 THEN 'TESTED_1X'
      WHEN test_count + 1 = 2 THEN 'TESTED_2X'
      ELSE 'TESTED_3X_PLUS'
    END,
    strength = CASE
      WHEN NEW.result = 'BROKEN' THEN 0
      ELSE GREATEST(0, strength - 20)
    END,
    last_tested_at = NOW(),
    broken_at = CASE WHEN NEW.result = 'BROKEN' THEN NOW() ELSE broken_at END,
    updated_at = NOW()
  WHERE id = NEW.zone_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Auto-update zone on test
DROP TRIGGER IF EXISTS trigger_update_zone_on_test ON zone_test_history;
CREATE TRIGGER trigger_update_zone_on_test
  AFTER INSERT ON zone_test_history
  FOR EACH ROW
  EXECUTE FUNCTION update_zone_on_test();

-- Function: Cleanup old zones (keep last 30 days of broken/expired)
CREATE OR REPLACE FUNCTION cleanup_old_zones()
RETURNS void AS $$
BEGIN
  UPDATE detected_zones
  SET is_deleted = TRUE, deleted_at = NOW()
  WHERE created_at < NOW() - INTERVAL '30 days'
    AND status IN ('BROKEN', 'EXPIRED')
    AND is_deleted = FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get user max zones based on tier
CREATE OR REPLACE FUNCTION get_user_max_zones(p_user_id UUID)
RETURNS INT AS $$
DECLARE
  user_tier TEXT;
  max_zones INT;
BEGIN
  -- Get user tier from profiles
  SELECT scanner_tier INTO user_tier
  FROM profiles
  WHERE id = p_user_id;

  -- Return max zones based on tier
  CASE user_tier
    WHEN 'TIER3' THEN max_zones := 20;
    WHEN 'TIER2' THEN max_zones := 10;
    WHEN 'TIER1' THEN max_zones := 3;
    WHEN 'ADMIN' THEN max_zones := 50;
    ELSE max_zones := 1;
  END CASE;

  RETURN max_zones;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Count active zones for user/symbol/timeframe
CREATE OR REPLACE FUNCTION count_user_active_zones(
  p_user_id UUID,
  p_symbol VARCHAR(20),
  p_timeframe VARCHAR(10)
)
RETURNS INT AS $$
DECLARE
  zone_count INT;
BEGIN
  SELECT COUNT(*) INTO zone_count
  FROM detected_zones
  WHERE user_id = p_user_id
    AND symbol = p_symbol
    AND timeframe = p_timeframe
    AND is_deleted = FALSE
    AND status NOT IN ('BROKEN', 'EXPIRED');

  RETURN zone_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_zone_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-update updated_at on detected_zones
DROP TRIGGER IF EXISTS trigger_zones_updated_at ON detected_zones;
CREATE TRIGGER trigger_zones_updated_at
  BEFORE UPDATE ON detected_zones
  FOR EACH ROW
  EXECUTE FUNCTION update_zone_updated_at();

-- Trigger: Auto-update updated_at on zone_visualization_preferences
DROP TRIGGER IF EXISTS trigger_prefs_updated_at ON zone_visualization_preferences;
CREATE TRIGGER trigger_prefs_updated_at
  BEFORE UPDATE ON zone_visualization_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_zone_updated_at();

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================
GRANT ALL ON detected_zones TO authenticated;
GRANT ALL ON zone_test_history TO authenticated;
GRANT ALL ON mtf_alignment_cache TO authenticated;
GRANT ALL ON zone_visualization_preferences TO authenticated;
GRANT ALL ON zone_alerts TO authenticated;

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION get_user_max_zones(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION count_user_active_zones(UUID, VARCHAR, VARCHAR) TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_old_zones() TO authenticated;

-- =====================================================
-- COMMENTS for documentation
-- =====================================================
COMMENT ON TABLE detected_zones IS 'Stores all detected trading zones for chart visualization. Multiple zones per symbol/timeframe. Tracks lifecycle: FRESH -> TESTED -> BROKEN';
COMMENT ON TABLE zone_test_history IS 'Records each time a zone is tested by price. Linked to detected_zones.';
COMMENT ON TABLE mtf_alignment_cache IS 'Caches multi-timeframe alignment calculations for performance. Expires after configured period.';
COMMENT ON TABLE zone_visualization_preferences IS 'User settings for zone display colors, visibility, and notifications.';
COMMENT ON TABLE zone_alerts IS 'User-configured alerts for specific zones.';

COMMENT ON COLUMN detected_zones.zone_type IS 'HFZ = High Frequency Zone (Supply/Resistance), LFZ = Low Frequency Zone (Demand/Support)';
COMMENT ON COLUMN detected_zones.status IS 'Zone lifecycle: FRESH (new), TESTED_1X, TESTED_2X, TESTED_3X_PLUS, BROKEN, EXPIRED';
COMMENT ON COLUMN detected_zones.strength IS 'Zone strength 0-100, decreases by 20 on each test';
COMMENT ON COLUMN detected_zones.hierarchy_rank IS '1=Decision Point, 2=FTR, 3=Flag Limit, 4=Regular';
COMMENT ON COLUMN detected_zones.odds_score IS 'Odds Enhancers score 0-16';

COMMENT ON COLUMN mtf_alignment_cache.confluence_score IS 'Score 0-10 indicating how well zones align across timeframes';
COMMENT ON COLUMN mtf_alignment_cache.alignment_type IS 'FULL = all TF aligned, PARTIAL = some aligned, NONE = no alignment';
COMMENT ON COLUMN mtf_alignment_cache.recommendation IS 'Trading recommendation based on alignment';
