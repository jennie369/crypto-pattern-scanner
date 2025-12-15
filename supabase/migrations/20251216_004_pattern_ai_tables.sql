-- supabase/migrations/20251216_004_pattern_ai_tables.sql
-- Tables cho Pattern Detection AI
-- GEMRAL AI BRAIN - Phase 6

-- ═══════════════════════════════════════════════════════════════════════════
-- 1. PATTERN FEATURES - Extracted features từ mỗi pattern detection
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS pattern_features (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  detection_id UUID REFERENCES ai_pattern_detections(id) ON DELETE CASCADE,

  -- Price features
  price_change_percent FLOAT,       -- % change trong pattern
  volatility_atr FLOAT,             -- ATR tại thời điểm detect
  volatility_ratio FLOAT,           -- ATR / Average ATR

  -- Volume features
  volume_avg FLOAT,                 -- Average volume trong pattern
  volume_breakout_ratio FLOAT,      -- Volume breakout / avg volume
  volume_trend TEXT,                -- 'increasing', 'decreasing', 'flat'

  -- Pattern structure features
  pattern_duration_candles INTEGER,
  pattern_height_percent FLOAT,
  pattern_symmetry_score FLOAT,     -- 0-1
  touch_count_support INTEGER,
  touch_count_resistance INTEGER,

  -- Trend context features
  trend_direction TEXT,             -- 'up', 'down', 'sideways'
  trend_strength FLOAT,             -- 0-1
  ema_20_position TEXT,             -- 'above', 'below', 'crossing'
  ema_50_position TEXT,
  ema_200_position TEXT,

  -- Support/Resistance features
  distance_to_sr_percent FLOAT,     -- Khoảng cách đến S/R gần nhất
  sr_strength INTEGER,              -- Số lần test S/R đó

  -- Momentum features
  rsi_value FLOAT,
  rsi_divergence TEXT,              -- 'bullish', 'bearish', 'none'
  macd_histogram FLOAT,
  macd_signal TEXT,                 -- 'bullish_cross', 'bearish_cross', 'none'

  -- Market context features
  btc_correlation FLOAT,            -- Correlation với BTC
  market_sentiment TEXT,            -- 'fear', 'greed', 'neutral'
  funding_rate FLOAT,               -- Futures funding rate

  -- Time features
  hour_of_day INTEGER,
  day_of_week INTEGER,
  is_weekend BOOLEAN,

  -- Computed scores
  pattern_quality_score FLOAT,      -- 0-1, ML computed
  entry_timing_score FLOAT,         -- 0-1
  risk_reward_score FLOAT,          -- 0-1
  overall_score FLOAT,              -- 0-1, final score

  -- Zone Retest (CRITICAL for win rate)
  has_zone_retest BOOLEAN DEFAULT false,
  retest_candles_ago INTEGER,
  retest_quality_score FLOAT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pattern_features_detection
  ON pattern_features(detection_id);
CREATE INDEX IF NOT EXISTS idx_pattern_features_score
  ON pattern_features(overall_score DESC);
CREATE INDEX IF NOT EXISTS idx_pattern_features_retest
  ON pattern_features(has_zone_retest) WHERE has_zone_retest = true;

-- ═══════════════════════════════════════════════════════════════════════════
-- 2. PATTERN MODEL VERSIONS - Track các phiên bản model
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS pattern_model_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Model info
  model_name TEXT NOT NULL,         -- 'pattern_detector_v1', 'pattern_scorer_v1'
  version TEXT NOT NULL,

  -- Training info
  training_data_from TIMESTAMPTZ,
  training_data_to TIMESTAMPTZ,
  training_samples INTEGER,

  -- Performance metrics
  accuracy FLOAT,
  precision_score FLOAT,
  recall_score FLOAT,
  f1_score FLOAT,
  win_rate_improvement FLOAT,       -- So với version trước

  -- Model parameters
  parameters JSONB DEFAULT '{}',
  feature_importance JSONB DEFAULT '{}',

  -- Status
  is_active BOOLEAN DEFAULT false,
  deployed_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(model_name, version)
);

-- ═══════════════════════════════════════════════════════════════════════════
-- 3. PATTERN FILTERS - Dynamic filters để improve win rate
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS ai_pattern_filters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pattern_id UUID REFERENCES ai_pattern_definitions(id),

  -- Filter definition
  filter_name TEXT NOT NULL,
  filter_type TEXT NOT NULL CHECK (filter_type IN (
    'volume',           -- Volume conditions
    'trend',            -- Trend conditions
    'momentum',         -- RSI, MACD, etc.
    'volatility',       -- ATR, BB width
    'time',             -- Time of day, day of week
    'market_context',   -- BTC correlation, sentiment
    'pattern_quality',  -- Structure quality
    'price_level',      -- S/R proximity
    'zone_retest'       -- Zone retest requirement (KEY)
  )),

  -- Conditions (JSON format for flexibility)
  conditions JSONB NOT NULL,
  /*
  Examples:
  {"volume_ratio_min": 1.2, "volume_ratio_max": 5.0}
  {"rsi_min": 30, "rsi_max": 70}
  {"trend_direction": "up", "trend_strength_min": 0.6}
  {"hour_range": [8, 22], "exclude_weekends": true}
  {"require_zone_retest": true, "max_retest_candles": 20}
  */

  -- Performance impact
  trades_before INTEGER,
  trades_after INTEGER,
  win_rate_before FLOAT,
  win_rate_after FLOAT,
  win_rate_improvement FLOAT,

  -- Status
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,       -- Higher = applied first

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_evaluated_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_ai_pattern_filters_active
  ON ai_pattern_filters(pattern_id, is_active);

-- ═══════════════════════════════════════════════════════════════════════════
-- 4. FILTER EVALUATION LOG - Track filter performance
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS ai_filter_evaluation_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  filter_id UUID REFERENCES ai_pattern_filters(id),

  -- Evaluation period
  evaluation_date DATE NOT NULL,

  -- Results
  total_patterns INTEGER,
  patterns_passed INTEGER,
  patterns_filtered INTEGER,

  -- Outcomes (after waiting for results)
  passed_wins INTEGER,
  passed_losses INTEGER,
  passed_win_rate FLOAT,

  filtered_wins INTEGER,            -- Would have been wins
  filtered_losses INTEGER,          -- Would have been losses
  filtered_win_rate FLOAT,

  -- Impact analysis
  improvement_percent FLOAT,        -- Win rate improvement
  opportunity_cost INTEGER,         -- Good trades filtered out

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(filter_id, evaluation_date)
);

-- ═══════════════════════════════════════════════════════════════════════════
-- 5. RLS POLICIES
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE pattern_features ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role only features" ON pattern_features;
CREATE POLICY "Service role only features" ON pattern_features
  FOR ALL USING (auth.role() = 'service_role');

ALTER TABLE pattern_model_versions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active models" ON pattern_model_versions;
CREATE POLICY "Anyone can view active models" ON pattern_model_versions
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Service role can manage models" ON pattern_model_versions;
CREATE POLICY "Service role can manage models" ON pattern_model_versions
  FOR ALL USING (auth.role() = 'service_role');

ALTER TABLE ai_pattern_filters ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active filters" ON ai_pattern_filters;
CREATE POLICY "Anyone can view active filters" ON ai_pattern_filters
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Service role can manage filters" ON ai_pattern_filters;
CREATE POLICY "Service role can manage filters" ON ai_pattern_filters
  FOR ALL USING (auth.role() = 'service_role');

ALTER TABLE ai_filter_evaluation_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role only eval_log" ON ai_filter_evaluation_log;
CREATE POLICY "Service role only eval_log" ON ai_filter_evaluation_log
  FOR ALL USING (auth.role() = 'service_role');

-- ═══════════════════════════════════════════════════════════════════════════
-- 6. HELPER FUNCTIONS
-- ═══════════════════════════════════════════════════════════════════════════

-- Function: Get win rate for pattern + filter combination
CREATE OR REPLACE FUNCTION get_filtered_win_rate(
  p_pattern_id UUID,
  p_filter_conditions JSONB,
  p_days_back INTEGER DEFAULT 90
)
RETURNS TABLE (
  total_trades INTEGER,
  wins INTEGER,
  losses INTEGER,
  win_rate FLOAT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH filtered_detections AS (
    SELECT pd.id, pd.outcome
    FROM ai_pattern_detections pd
    JOIN pattern_features pf ON pf.detection_id = pd.id
    WHERE
      pd.pattern_id = p_pattern_id
      AND pd.outcome IN ('win', 'loss')
      AND pd.detected_at > NOW() - (p_days_back || ' days')::INTERVAL
      -- Apply dynamic filters from JSON
      AND (
        p_filter_conditions->>'volume_ratio_min' IS NULL
        OR pf.volume_breakout_ratio >= (p_filter_conditions->>'volume_ratio_min')::FLOAT
      )
      AND (
        p_filter_conditions->>'volume_ratio_max' IS NULL
        OR pf.volume_breakout_ratio <= (p_filter_conditions->>'volume_ratio_max')::FLOAT
      )
      AND (
        p_filter_conditions->>'rsi_min' IS NULL
        OR pf.rsi_value >= (p_filter_conditions->>'rsi_min')::FLOAT
      )
      AND (
        p_filter_conditions->>'rsi_max' IS NULL
        OR pf.rsi_value <= (p_filter_conditions->>'rsi_max')::FLOAT
      )
      AND (
        p_filter_conditions->>'trend_direction' IS NULL
        OR pf.trend_direction = p_filter_conditions->>'trend_direction'
      )
      AND (
        p_filter_conditions->>'pattern_quality_min' IS NULL
        OR pf.pattern_quality_score >= (p_filter_conditions->>'pattern_quality_min')::FLOAT
      )
      AND (
        p_filter_conditions->>'require_zone_retest' IS NULL
        OR (p_filter_conditions->>'require_zone_retest')::BOOLEAN = false
        OR pf.has_zone_retest = true
      )
  )
  SELECT
    COUNT(*)::INTEGER AS total_trades,
    COUNT(*) FILTER (WHERE outcome = 'win')::INTEGER AS wins,
    COUNT(*) FILTER (WHERE outcome = 'loss')::INTEGER AS losses,
    CASE
      WHEN COUNT(*) > 0
      THEN COUNT(*) FILTER (WHERE outcome = 'win')::FLOAT / COUNT(*)
      ELSE 0
    END AS win_rate
  FROM filtered_detections;
END;
$$;

-- Function: Find best filter thresholds
CREATE OR REPLACE FUNCTION find_optimal_filter_threshold(
  p_pattern_id UUID,
  p_feature_name TEXT,
  p_min_trades INTEGER DEFAULT 30
)
RETURNS TABLE (
  threshold_value FLOAT,
  trades_passed INTEGER,
  win_rate FLOAT,
  improvement FLOAT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_base_win_rate FLOAT;
BEGIN
  -- Get base win rate without filter
  SELECT
    COUNT(*) FILTER (WHERE outcome = 'win')::FLOAT / NULLIF(COUNT(*), 0)
  INTO v_base_win_rate
  FROM ai_pattern_detections
  WHERE pattern_id = p_pattern_id AND outcome IN ('win', 'loss');

  -- Find optimal thresholds by testing different values
  RETURN QUERY
  WITH thresholds AS (
    SELECT generate_series(0.1, 0.9, 0.1) AS threshold
  ),
  results AS (
    SELECT
      t.threshold,
      COUNT(*) AS trades,
      COUNT(*) FILTER (WHERE pd.outcome = 'win')::FLOAT / NULLIF(COUNT(*), 0) AS wr
    FROM thresholds t
    CROSS JOIN ai_pattern_detections pd
    JOIN pattern_features pf ON pf.detection_id = pd.id
    WHERE
      pd.pattern_id = p_pattern_id
      AND pd.outcome IN ('win', 'loss')
      AND (
        CASE p_feature_name
          WHEN 'pattern_quality_score' THEN pf.pattern_quality_score
          WHEN 'overall_score' THEN pf.overall_score
          WHEN 'volume_breakout_ratio' THEN pf.volume_breakout_ratio
          WHEN 'trend_strength' THEN pf.trend_strength
          WHEN 'retest_quality_score' THEN pf.retest_quality_score
          ELSE 0
        END
      ) >= t.threshold
    GROUP BY t.threshold
  )
  SELECT
    r.threshold::FLOAT AS threshold_value,
    r.trades::INTEGER AS trades_passed,
    r.wr AS win_rate,
    (r.wr - v_base_win_rate) AS improvement
  FROM results r
  WHERE r.trades >= p_min_trades
  ORDER BY r.wr DESC;
END;
$$;

-- ═══════════════════════════════════════════════════════════════════════════
-- 7. SEED DEFAULT FILTERS (Zone Retest is KEY)
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO ai_pattern_filters (filter_name, filter_type, conditions, priority) VALUES
-- Zone Retest Filter (CRITICAL - adds 10-15% win rate)
('Zone Retest Required', 'zone_retest',
 '{"require_zone_retest": true, "max_retest_candles": 20}', 100),

-- Volume Confirmation
('Volume Breakout', 'volume',
 '{"volume_ratio_min": 1.2}', 90),

-- Pattern Quality
('High Quality Patterns', 'pattern_quality',
 '{"pattern_quality_min": 0.6}', 80),

-- Trend Alignment
('Trend Alignment', 'trend',
 '{"trend_strength_min": 0.5}', 70),

-- RSI Filter
('RSI Reasonable Range', 'momentum',
 '{"rsi_min": 25, "rsi_max": 75}', 60)

ON CONFLICT DO NOTHING;
