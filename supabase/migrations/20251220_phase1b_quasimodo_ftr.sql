-- ═══════════════════════════════════════════════════════════
-- Phase 1B: Quasimodo + FTR Detection
-- Add columns for advanced pattern detection to trading tables
-- ═══════════════════════════════════════════════════════════

-- Add pattern category column to paper_positions
ALTER TABLE paper_positions
ADD COLUMN IF NOT EXISTS pattern_category VARCHAR(20) DEFAULT 'basic';

-- Add Quasimodo specific columns to paper_positions
ALTER TABLE paper_positions
ADD COLUMN IF NOT EXISTS qml_price DECIMAL(20, 8),
ADD COLUMN IF NOT EXISTS mpl_price DECIMAL(20, 8),
ADD COLUMN IF NOT EXISTS left_shoulder_price DECIMAL(20, 8),
ADD COLUMN IF NOT EXISTS head_price DECIMAL(20, 8),
ADD COLUMN IF NOT EXISTS right_shoulder_price DECIMAL(20, 8);

-- Add BOS (Break of Structure) columns to paper_positions
ALTER TABLE paper_positions
ADD COLUMN IF NOT EXISTS bos_confirmed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS bos_price DECIMAL(20, 8),
ADD COLUMN IF NOT EXISTS bos_timestamp TIMESTAMPTZ;

-- Add FTR (Fail To Return) columns to paper_positions
ALTER TABLE paper_positions
ADD COLUMN IF NOT EXISTS is_ftr BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS ftr_sr_level DECIMAL(20, 8),
ADD COLUMN IF NOT EXISTS ftr_break_percent DECIMAL(5, 2),
ADD COLUMN IF NOT EXISTS ftr_return_percent DECIMAL(5, 2);

-- Add swing point tracking to paper_positions
ALTER TABLE paper_positions
ADD COLUMN IF NOT EXISTS swing_high_price DECIMAL(20, 8),
ADD COLUMN IF NOT EXISTS swing_low_price DECIMAL(20, 8);

-- Add freshness tracking for zones to paper_positions
ALTER TABLE paper_positions
ADD COLUMN IF NOT EXISTS zone_test_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS first_test_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS last_test_at TIMESTAMPTZ;

-- ═══════════════════════════════════════════════════════════
-- Same columns for paper_trades table
-- ═══════════════════════════════════════════════════════════

ALTER TABLE paper_trades
ADD COLUMN IF NOT EXISTS pattern_category VARCHAR(20) DEFAULT 'basic',
ADD COLUMN IF NOT EXISTS qml_price DECIMAL(20, 8),
ADD COLUMN IF NOT EXISTS mpl_price DECIMAL(20, 8),
ADD COLUMN IF NOT EXISTS left_shoulder_price DECIMAL(20, 8),
ADD COLUMN IF NOT EXISTS head_price DECIMAL(20, 8),
ADD COLUMN IF NOT EXISTS right_shoulder_price DECIMAL(20, 8),
ADD COLUMN IF NOT EXISTS bos_confirmed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS bos_price DECIMAL(20, 8),
ADD COLUMN IF NOT EXISTS bos_timestamp TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS is_ftr BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS ftr_sr_level DECIMAL(20, 8),
ADD COLUMN IF NOT EXISTS ftr_break_percent DECIMAL(5, 2),
ADD COLUMN IF NOT EXISTS ftr_return_percent DECIMAL(5, 2),
ADD COLUMN IF NOT EXISTS swing_high_price DECIMAL(20, 8),
ADD COLUMN IF NOT EXISTS swing_low_price DECIMAL(20, 8),
ADD COLUMN IF NOT EXISTS zone_test_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS first_test_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS last_test_at TIMESTAMPTZ;

-- ═══════════════════════════════════════════════════════════
-- Same columns for paper_pending_orders if it exists
-- ═══════════════════════════════════════════════════════════

DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'paper_pending_orders') THEN
    ALTER TABLE paper_pending_orders
    ADD COLUMN IF NOT EXISTS pattern_category VARCHAR(20) DEFAULT 'basic',
    ADD COLUMN IF NOT EXISTS qml_price DECIMAL(20, 8),
    ADD COLUMN IF NOT EXISTS mpl_price DECIMAL(20, 8),
    ADD COLUMN IF NOT EXISTS left_shoulder_price DECIMAL(20, 8),
    ADD COLUMN IF NOT EXISTS head_price DECIMAL(20, 8),
    ADD COLUMN IF NOT EXISTS right_shoulder_price DECIMAL(20, 8),
    ADD COLUMN IF NOT EXISTS bos_confirmed BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS bos_price DECIMAL(20, 8),
    ADD COLUMN IF NOT EXISTS bos_timestamp TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS is_ftr BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS ftr_sr_level DECIMAL(20, 8),
    ADD COLUMN IF NOT EXISTS ftr_break_percent DECIMAL(5, 2),
    ADD COLUMN IF NOT EXISTS ftr_return_percent DECIMAL(5, 2),
    ADD COLUMN IF NOT EXISTS swing_high_price DECIMAL(20, 8),
    ADD COLUMN IF NOT EXISTS swing_low_price DECIMAL(20, 8),
    ADD COLUMN IF NOT EXISTS zone_test_count INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS first_test_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS last_test_at TIMESTAMPTZ;
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════════
-- Indexes for faster queries
-- ═══════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_paper_positions_category ON paper_positions(pattern_category);
CREATE INDEX IF NOT EXISTS idx_paper_positions_ftr ON paper_positions(is_ftr) WHERE is_ftr = TRUE;
CREATE INDEX IF NOT EXISTS idx_paper_positions_bos ON paper_positions(bos_confirmed) WHERE bos_confirmed = TRUE;

CREATE INDEX IF NOT EXISTS idx_paper_trades_category ON paper_trades(pattern_category);
CREATE INDEX IF NOT EXISTS idx_paper_trades_ftr ON paper_trades(is_ftr) WHERE is_ftr = TRUE;

-- ═══════════════════════════════════════════════════════════
-- Comments for documentation
-- ═══════════════════════════════════════════════════════════

COMMENT ON COLUMN paper_positions.pattern_category IS 'Pattern category: basic, quasimodo, ftr, flag_limit, decision_point';
COMMENT ON COLUMN paper_positions.qml_price IS 'Quasimodo Level - Entry point for QM pattern';
COMMENT ON COLUMN paper_positions.mpl_price IS 'Maximum Pain Level - Invalidation for QM pattern';
COMMENT ON COLUMN paper_positions.bos_confirmed IS 'Break of Structure confirmation status';
COMMENT ON COLUMN paper_positions.bos_price IS 'Price level where BOS occurred';
COMMENT ON COLUMN paper_positions.is_ftr IS 'Is this an FTR (Fail To Return) zone';
COMMENT ON COLUMN paper_positions.ftr_sr_level IS 'Support/Resistance level that was broken';
COMMENT ON COLUMN paper_positions.zone_test_count IS 'Number of times zone has been tested';

-- ═══════════════════════════════════════════════════════════
-- Update existing records to set category based on pattern type
-- ═══════════════════════════════════════════════════════════

UPDATE paper_positions SET
  pattern_category = CASE
    WHEN pattern_type LIKE '%QM%' OR pattern_type LIKE '%Quasimodo%' THEN 'quasimodo'
    WHEN pattern_type LIKE '%FTR%' THEN 'ftr'
    ELSE 'basic'
  END
WHERE pattern_category IS NULL OR pattern_category = 'basic';

UPDATE paper_trades SET
  pattern_category = CASE
    WHEN pattern_type LIKE '%QM%' OR pattern_type LIKE '%Quasimodo%' THEN 'quasimodo'
    WHEN pattern_type LIKE '%FTR%' THEN 'ftr'
    ELSE 'basic'
  END
WHERE pattern_category IS NULL OR pattern_category = 'basic';
