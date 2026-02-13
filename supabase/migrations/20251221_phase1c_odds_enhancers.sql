-- ═══════════════════════════════════════════════════════════
-- Phase 1C: Odds Enhancers + Freshness Tracking
-- Zone history tracking and scoring tables
-- ═══════════════════════════════════════════════════════════

-- =============================================
-- TABLE: zone_history - Track zone tests
-- =============================================
CREATE TABLE IF NOT EXISTS zone_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Zone identification
  symbol VARCHAR(20) NOT NULL,
  timeframe VARCHAR(10) NOT NULL,
  zone_type VARCHAR(10) NOT NULL, -- HFZ, LFZ
  pattern VARCHAR(30),
  pattern_category VARCHAR(20), -- basic, quasimodo, ftr, etc.

  -- Zone boundaries
  entry_price DECIMAL(20, 8) NOT NULL,
  stop_price DECIMAL(20, 8) NOT NULL,
  zone_width DECIMAL(20, 8),

  -- Test tracking
  test_count INTEGER DEFAULT 0,
  first_test_at TIMESTAMPTZ,
  last_test_at TIMESTAMPTZ,

  -- Status
  is_broken BOOLEAN DEFAULT FALSE,
  broken_at TIMESTAMPTZ,
  broken_price DECIMAL(20, 8),

  -- Hierarchy
  zone_hierarchy_level INTEGER DEFAULT 4, -- 1=DP, 2=FTR, 3=FL, 4=Regular
  htf_zone_id UUID REFERENCES zone_history(id), -- Parent zone on HTF

  -- Confluence
  confluence_count INTEGER DEFAULT 0,
  confluence_details JSONB,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for zone_history
CREATE INDEX IF NOT EXISTS idx_zone_history_user ON zone_history(user_id);
CREATE INDEX IF NOT EXISTS idx_zone_history_symbol ON zone_history(symbol, timeframe);
CREATE INDEX IF NOT EXISTS idx_zone_history_fresh ON zone_history(test_count) WHERE test_count = 0;
CREATE INDEX IF NOT EXISTS idx_zone_history_active ON zone_history(is_broken) WHERE is_broken = FALSE;

-- RLS for zone_history
ALTER TABLE zone_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own zone history" ON zone_history;
CREATE POLICY "Users can view own zone history" ON zone_history
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own zone history" ON zone_history;
CREATE POLICY "Users can insert own zone history" ON zone_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own zone history" ON zone_history;
CREATE POLICY "Users can update own zone history" ON zone_history
  FOR UPDATE USING (auth.uid() = user_id);

-- =============================================
-- TABLE: pattern_scores - Odds enhancers scores
-- =============================================
CREATE TABLE IF NOT EXISTS pattern_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  zone_history_id UUID REFERENCES zone_history(id) ON DELETE CASCADE,

  -- Symbol info
  symbol VARCHAR(20) NOT NULL,
  timeframe VARCHAR(10) NOT NULL,

  -- Individual scores (0-2 each)
  departure_strength DECIMAL(3, 1) DEFAULT 0,
  time_at_level DECIMAL(3, 1) DEFAULT 0,
  freshness_score DECIMAL(3, 1) DEFAULT 0,
  profit_margin DECIMAL(3, 1) DEFAULT 0,
  big_picture DECIMAL(3, 1) DEFAULT 0,
  zone_origin DECIMAL(3, 1) DEFAULT 0,
  arrival_speed DECIMAL(3, 1) DEFAULT 0,
  risk_reward DECIMAL(3, 1) DEFAULT 0,

  -- Calculated
  total_score DECIMAL(4, 1) DEFAULT 0, -- Max 16
  grade VARCHAR(2), -- A+, A, B, C, D, F
  is_tradeable BOOLEAN DEFAULT FALSE,

  -- Metadata
  score_breakdown JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for pattern_scores
CREATE INDEX IF NOT EXISTS idx_pattern_scores_user ON pattern_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_pattern_scores_grade ON pattern_scores(grade);
CREATE INDEX IF NOT EXISTS idx_pattern_scores_symbol ON pattern_scores(symbol, timeframe);

-- RLS for pattern_scores
ALTER TABLE pattern_scores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own scores" ON pattern_scores;
CREATE POLICY "Users can view own scores" ON pattern_scores
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own scores" ON pattern_scores;
CREATE POLICY "Users can insert own scores" ON pattern_scores
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own scores" ON pattern_scores;
CREATE POLICY "Users can update own scores" ON pattern_scores
  FOR UPDATE USING (auth.uid() = user_id);

-- =============================================
-- Add scoring columns to paper_positions
-- =============================================
ALTER TABLE paper_positions
ADD COLUMN IF NOT EXISTS odds_score DECIMAL(4, 1) DEFAULT 0,
ADD COLUMN IF NOT EXISTS odds_grade VARCHAR(2),
ADD COLUMN IF NOT EXISTS freshness_status VARCHAR(10) DEFAULT 'fresh',
ADD COLUMN IF NOT EXISTS is_ftb BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS zone_history_id UUID;

-- =============================================
-- Add scoring columns to paper_trades
-- =============================================
ALTER TABLE paper_trades
ADD COLUMN IF NOT EXISTS odds_score DECIMAL(4, 1) DEFAULT 0,
ADD COLUMN IF NOT EXISTS odds_grade VARCHAR(2),
ADD COLUMN IF NOT EXISTS freshness_status VARCHAR(10) DEFAULT 'fresh',
ADD COLUMN IF NOT EXISTS is_ftb BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS zone_history_id UUID;

-- =============================================
-- Add scoring columns to paper_pending_orders if exists
-- =============================================
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'paper_pending_orders') THEN
    ALTER TABLE paper_pending_orders
    ADD COLUMN IF NOT EXISTS odds_score DECIMAL(4, 1) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS odds_grade VARCHAR(2),
    ADD COLUMN IF NOT EXISTS freshness_status VARCHAR(10) DEFAULT 'fresh',
    ADD COLUMN IF NOT EXISTS is_ftb BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS zone_history_id UUID;
  END IF;
END $$;

-- =============================================
-- Comments for documentation
-- =============================================
COMMENT ON TABLE zone_history IS 'Track zone creation and test history for freshness tracking';
COMMENT ON TABLE pattern_scores IS 'Store odds enhancer scores for patterns';
COMMENT ON COLUMN zone_history.test_count IS 'Number of times zone has been tested (0 = fresh/FTB)';
COMMENT ON COLUMN zone_history.zone_hierarchy_level IS '1=Decision Point, 2=FTR, 3=Flag Limit, 4=Regular';
COMMENT ON COLUMN pattern_scores.total_score IS 'Sum of 8 odds enhancers (max 16)';
COMMENT ON COLUMN pattern_scores.grade IS 'A+ (14-16), A (12-13), B (10-11), C (8-9), D (6-7), F (0-5)';
COMMENT ON COLUMN paper_positions.odds_score IS 'Total odds enhancers score (0-16)';
COMMENT ON COLUMN paper_positions.odds_grade IS 'A+, A, B, C, D, F grade';
COMMENT ON COLUMN paper_positions.freshness_status IS 'fresh, tested, stale';
COMMENT ON COLUMN paper_positions.is_ftb IS 'Is First Time Back entry';
