-- ═══════════════════════════════════════════════════════════
-- Phase 2A: Flag Limit + Decision Point + Zone Hierarchy
-- Zone classification and hierarchy system
-- ═══════════════════════════════════════════════════════════

-- =============================================
-- Add zone hierarchy columns to paper_positions
-- =============================================
ALTER TABLE paper_positions
ADD COLUMN IF NOT EXISTS is_flag_limit BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS fl_base_candle_count INTEGER,
ADD COLUMN IF NOT EXISTS is_decision_point BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS dp_move_size DECIMAL(20, 8),
ADD COLUMN IF NOT EXISTS dp_move_percent DECIMAL(5, 2),
ADD COLUMN IF NOT EXISTS zone_hierarchy VARCHAR(20) DEFAULT 'regular';

-- =============================================
-- Add zone hierarchy columns to paper_trades
-- =============================================
ALTER TABLE paper_trades
ADD COLUMN IF NOT EXISTS is_flag_limit BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS fl_base_candle_count INTEGER,
ADD COLUMN IF NOT EXISTS is_decision_point BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS dp_move_size DECIMAL(20, 8),
ADD COLUMN IF NOT EXISTS dp_move_percent DECIMAL(5, 2),
ADD COLUMN IF NOT EXISTS zone_hierarchy VARCHAR(20) DEFAULT 'regular';

-- =============================================
-- Add zone hierarchy columns to paper_pending_orders if exists
-- =============================================
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'paper_pending_orders') THEN
    ALTER TABLE paper_pending_orders
    ADD COLUMN IF NOT EXISTS is_flag_limit BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS fl_base_candle_count INTEGER,
    ADD COLUMN IF NOT EXISTS is_decision_point BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS dp_move_size DECIMAL(20, 8),
    ADD COLUMN IF NOT EXISTS dp_move_percent DECIMAL(5, 2),
    ADD COLUMN IF NOT EXISTS zone_hierarchy VARCHAR(20) DEFAULT 'regular';
  END IF;
END $$;

-- =============================================
-- Add zone hierarchy columns to zone_history
-- =============================================
ALTER TABLE zone_history
ADD COLUMN IF NOT EXISTS is_flag_limit BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS fl_base_candle_count INTEGER,
ADD COLUMN IF NOT EXISTS is_decision_point BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS dp_move_size DECIMAL(20, 8),
ADD COLUMN IF NOT EXISTS dp_move_percent DECIMAL(5, 2),
ADD COLUMN IF NOT EXISTS zone_hierarchy VARCHAR(20) DEFAULT 'regular';

-- =============================================
-- Indexes for hierarchy queries
-- =============================================
CREATE INDEX IF NOT EXISTS idx_paper_positions_hierarchy ON paper_positions(zone_hierarchy);
CREATE INDEX IF NOT EXISTS idx_paper_positions_fl ON paper_positions(is_flag_limit) WHERE is_flag_limit = TRUE;
CREATE INDEX IF NOT EXISTS idx_paper_positions_dp ON paper_positions(is_decision_point) WHERE is_decision_point = TRUE;

CREATE INDEX IF NOT EXISTS idx_paper_trades_hierarchy ON paper_trades(zone_hierarchy);
CREATE INDEX IF NOT EXISTS idx_paper_trades_fl ON paper_trades(is_flag_limit) WHERE is_flag_limit = TRUE;
CREATE INDEX IF NOT EXISTS idx_paper_trades_dp ON paper_trades(is_decision_point) WHERE is_decision_point = TRUE;

CREATE INDEX IF NOT EXISTS idx_zone_history_hierarchy ON zone_history(zone_hierarchy);
CREATE INDEX IF NOT EXISTS idx_zone_history_fl ON zone_history(is_flag_limit) WHERE is_flag_limit = TRUE;
CREATE INDEX IF NOT EXISTS idx_zone_history_dp ON zone_history(is_decision_point) WHERE is_decision_point = TRUE;

-- =============================================
-- Comments for documentation
-- =============================================
COMMENT ON COLUMN paper_positions.zone_hierarchy IS 'Zone hierarchy: decision_point, ftr, flag_limit, regular';
COMMENT ON COLUMN paper_positions.is_flag_limit IS 'Is this a Flag Limit zone (1-2 candle base)';
COMMENT ON COLUMN paper_positions.fl_base_candle_count IS 'Number of candles in Flag Limit base (1-2)';
COMMENT ON COLUMN paper_positions.is_decision_point IS 'Is this a Decision Point (origin of major move)';
COMMENT ON COLUMN paper_positions.dp_move_size IS 'Size of impulsive move from Decision Point';
COMMENT ON COLUMN paper_positions.dp_move_percent IS 'Percentage move from Decision Point';

COMMENT ON COLUMN paper_trades.zone_hierarchy IS 'Zone hierarchy: decision_point, ftr, flag_limit, regular';
COMMENT ON COLUMN paper_trades.is_flag_limit IS 'Is this a Flag Limit zone (1-2 candle base)';
COMMENT ON COLUMN paper_trades.is_decision_point IS 'Is this a Decision Point (origin of major move)';
COMMENT ON COLUMN paper_trades.dp_move_size IS 'Size of impulsive move from Decision Point';

COMMENT ON COLUMN zone_history.zone_hierarchy IS 'Zone hierarchy: decision_point, ftr, flag_limit, regular';
COMMENT ON COLUMN zone_history.is_flag_limit IS 'Is this a Flag Limit zone';
COMMENT ON COLUMN zone_history.is_decision_point IS 'Is this a Decision Point';

-- =============================================
-- Update existing records with default hierarchy
-- =============================================
UPDATE paper_positions SET
  zone_hierarchy = CASE
    WHEN pattern_category = 'quasimodo' OR pattern_category = 'decision_point' THEN 'decision_point'
    WHEN pattern_category = 'ftr' OR is_ftr = TRUE THEN 'ftr'
    WHEN pattern_type IN ('UPU', 'DPD') AND zone_test_count <= 2 THEN 'flag_limit'
    ELSE 'regular'
  END
WHERE zone_hierarchy IS NULL OR zone_hierarchy = 'regular';

UPDATE paper_trades SET
  zone_hierarchy = CASE
    WHEN pattern_category = 'quasimodo' OR pattern_category = 'decision_point' THEN 'decision_point'
    WHEN pattern_category = 'ftr' OR is_ftr = TRUE THEN 'ftr'
    WHEN pattern_type IN ('UPU', 'DPD') AND zone_test_count <= 2 THEN 'flag_limit'
    ELSE 'regular'
  END
WHERE zone_hierarchy IS NULL OR zone_hierarchy = 'regular';
