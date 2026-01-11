-- ============================================================================
-- GEM Scanner - Zone History & Pattern Scores Tables
-- Phase 1C: Track zone tests and store odds enhancers scores
-- ============================================================================

-- Drop existing tables if they exist
DROP TABLE IF EXISTS pattern_scores CASCADE;
DROP TABLE IF EXISTS zone_history CASCADE;

-- ============================================================================
-- ZONE HISTORY TABLE
-- Track when zones are tested and their freshness status
-- ============================================================================

CREATE TABLE IF NOT EXISTS zone_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Zone identification
  zone_id VARCHAR(100) NOT NULL,  -- Unique zone identifier
  symbol VARCHAR(20) NOT NULL,
  timeframe VARCHAR(10) NOT NULL,
  zone_type VARCHAR(10) NOT NULL,  -- 'HFZ' or 'LFZ'

  -- Zone prices
  entry_price DECIMAL(20, 8) NOT NULL,
  stop_price DECIMAL(20, 8) NOT NULL,

  -- Test tracking
  test_count INTEGER DEFAULT 0,
  last_test_at TIMESTAMPTZ NULL,
  first_test_at TIMESTAMPTZ NULL,

  -- FTB (First Time Back) status
  is_ftb BOOLEAN DEFAULT TRUE,
  ftb_triggered_at TIMESTAMPTZ NULL,
  ftb_price DECIMAL(20, 8) NULL,

  -- Order absorption estimate
  orders_remaining_percent DECIMAL(5, 2) DEFAULT 100.00,

  -- Zone validity
  is_valid BOOLEAN DEFAULT TRUE,
  invalidated_at TIMESTAMPTZ NULL,
  invalidation_reason VARCHAR(100) NULL,

  -- Zone hierarchy
  hierarchy_level INTEGER DEFAULT 4,  -- 1=DP, 2=FTR, 3=FL, 4=Regular
  hierarchy_name VARCHAR(50) NULL,

  -- Pattern origin
  pattern_type VARCHAR(50) NULL,
  pattern_id UUID NULL,

  -- Metadata
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for zone_history
CREATE INDEX IF NOT EXISTS idx_zone_history_zone_id ON zone_history(zone_id);
CREATE INDEX IF NOT EXISTS idx_zone_history_symbol ON zone_history(symbol);
CREATE INDEX IF NOT EXISTS idx_zone_history_user ON zone_history(user_id);
CREATE INDEX IF NOT EXISTS idx_zone_history_symbol_timeframe ON zone_history(symbol, timeframe);
CREATE INDEX IF NOT EXISTS idx_zone_history_is_ftb ON zone_history(is_ftb) WHERE is_ftb = TRUE;
CREATE INDEX IF NOT EXISTS idx_zone_history_is_valid ON zone_history(is_valid) WHERE is_valid = TRUE;

-- ============================================================================
-- PATTERN SCORES TABLE
-- Store odds enhancers scores for each zone/pattern
-- ============================================================================

CREATE TABLE IF NOT EXISTS pattern_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Zone/Pattern identification
  zone_id VARCHAR(100) NULL,
  pattern_id UUID NULL,
  symbol VARCHAR(20) NOT NULL,
  timeframe VARCHAR(10) NOT NULL,

  -- Total score and grade
  total_score INTEGER DEFAULT 0,  -- 0-16
  grade VARCHAR(5) NOT NULL,  -- A+, A, B, C, D, F

  -- Individual criteria scores (0-2 each)
  departure_strength INTEGER DEFAULT 0,
  time_at_level INTEGER DEFAULT 0,
  freshness INTEGER DEFAULT 0,
  profit_margin INTEGER DEFAULT 0,
  big_picture INTEGER DEFAULT 0,
  zone_origin INTEGER DEFAULT 0,
  arrival_speed INTEGER DEFAULT 0,
  risk_reward INTEGER DEFAULT 0,

  -- Detailed breakdown (JSON)
  breakdown JSONB DEFAULT '{}',

  -- Recommendations
  position_size_percent INTEGER DEFAULT 0,
  recommended_action VARCHAR(20) NULL,  -- 'trade', 'watch', 'skip'

  -- Metadata
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for pattern_scores
CREATE INDEX IF NOT EXISTS idx_pattern_scores_zone ON pattern_scores(zone_id);
CREATE INDEX IF NOT EXISTS idx_pattern_scores_pattern ON pattern_scores(pattern_id);
CREATE INDEX IF NOT EXISTS idx_pattern_scores_user ON pattern_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_pattern_scores_symbol ON pattern_scores(symbol);
CREATE INDEX IF NOT EXISTS idx_pattern_scores_grade ON pattern_scores(grade);
CREATE INDEX IF NOT EXISTS idx_pattern_scores_total ON pattern_scores(total_score DESC);

-- ============================================================================
-- TRIGGER: Update updated_at timestamp
-- ============================================================================

CREATE OR REPLACE FUNCTION update_zone_history_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_zone_history_updated_at
  BEFORE UPDATE ON zone_history
  FOR EACH ROW
  EXECUTE FUNCTION update_zone_history_updated_at();

CREATE OR REPLACE FUNCTION update_pattern_scores_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_pattern_scores_updated_at
  BEFORE UPDATE ON pattern_scores
  FOR EACH ROW
  EXECUTE FUNCTION update_pattern_scores_updated_at();

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

ALTER TABLE zone_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE pattern_scores ENABLE ROW LEVEL SECURITY;

-- Zone History policies
CREATE POLICY "Users can view their own zone history"
  ON zone_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own zone history"
  ON zone_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own zone history"
  ON zone_history FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own zone history"
  ON zone_history FOR DELETE
  USING (auth.uid() = user_id);

-- Pattern Scores policies
CREATE POLICY "Users can view their own pattern scores"
  ON pattern_scores FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own pattern scores"
  ON pattern_scores FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pattern scores"
  ON pattern_scores FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pattern scores"
  ON pattern_scores FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to record a zone test
CREATE OR REPLACE FUNCTION record_zone_test(
  p_zone_id VARCHAR(100),
  p_test_price DECIMAL(20, 8),
  p_user_id UUID
)
RETURNS zone_history AS $$
DECLARE
  v_zone zone_history;
BEGIN
  UPDATE zone_history
  SET
    test_count = test_count + 1,
    last_test_at = NOW(),
    first_test_at = COALESCE(first_test_at, NOW()),
    is_ftb = FALSE,
    ftb_triggered_at = CASE WHEN is_ftb THEN NOW() ELSE ftb_triggered_at END,
    ftb_price = CASE WHEN is_ftb THEN p_test_price ELSE ftb_price END,
    orders_remaining_percent = GREATEST(0, orders_remaining_percent * 0.65)
  WHERE zone_id = p_zone_id AND user_id = p_user_id
  RETURNING * INTO v_zone;

  RETURN v_zone;
END;
$$ LANGUAGE plpgsql;

-- Function to invalidate a zone
CREATE OR REPLACE FUNCTION invalidate_zone(
  p_zone_id VARCHAR(100),
  p_reason VARCHAR(100),
  p_user_id UUID
)
RETURNS zone_history AS $$
DECLARE
  v_zone zone_history;
BEGIN
  UPDATE zone_history
  SET
    is_valid = FALSE,
    invalidated_at = NOW(),
    invalidation_reason = p_reason
  WHERE zone_id = p_zone_id AND user_id = p_user_id
  RETURNING * INTO v_zone;

  RETURN v_zone;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate grade from total score
CREATE OR REPLACE FUNCTION calculate_grade(p_total_score INTEGER)
RETURNS VARCHAR(5) AS $$
BEGIN
  RETURN CASE
    WHEN p_total_score >= 14 THEN 'A+'
    WHEN p_total_score >= 12 THEN 'A'
    WHEN p_total_score >= 10 THEN 'B'
    WHEN p_total_score >= 8 THEN 'C'
    WHEN p_total_score >= 6 THEN 'D'
    ELSE 'F'
  END;
END;
$$ LANGUAGE plpgsql;

-- Function to get position size recommendation
CREATE OR REPLACE FUNCTION get_position_size(p_grade VARCHAR(5))
RETURNS INTEGER AS $$
BEGIN
  RETURN CASE p_grade
    WHEN 'A+' THEN 100
    WHEN 'A' THEN 75
    WHEN 'B' THEN 50
    WHEN 'C' THEN 25
    ELSE 0
  END;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

GRANT ALL ON zone_history TO authenticated;
GRANT ALL ON pattern_scores TO authenticated;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE zone_history IS 'Tracks zone tests and freshness status for FTB detection';
COMMENT ON TABLE pattern_scores IS 'Stores odds enhancers scores for zone quality assessment';
COMMENT ON COLUMN zone_history.orders_remaining_percent IS 'Estimated remaining orders (decreases ~35% per test)';
COMMENT ON COLUMN zone_history.hierarchy_level IS '1=Decision Point, 2=FTR, 3=Flag Limit, 4=Regular';
COMMENT ON COLUMN pattern_scores.total_score IS 'Sum of 8 criteria (0-16), determines grade';
