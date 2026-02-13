-- ═══════════════════════════════════════════════════════════
-- Phase 1A: Pattern Strength + Zone Object
-- Add zone boundary columns to trading tables
-- ═══════════════════════════════════════════════════════════

-- Add zone boundary columns to paper_positions table
ALTER TABLE paper_positions
ADD COLUMN IF NOT EXISTS zone_entry_price DECIMAL(20, 8),
ADD COLUMN IF NOT EXISTS zone_stop_price DECIMAL(20, 8),
ADD COLUMN IF NOT EXISTS zone_width DECIMAL(20, 8),
ADD COLUMN IF NOT EXISTS zone_width_percent DECIMAL(5, 2),
ADD COLUMN IF NOT EXISTS pattern_context VARCHAR(20) DEFAULT 'unknown',
ADD COLUMN IF NOT EXISTS pattern_strength INTEGER DEFAULT 0;

-- Add zone boundary columns to paper_trades table
ALTER TABLE paper_trades
ADD COLUMN IF NOT EXISTS zone_entry_price DECIMAL(20, 8),
ADD COLUMN IF NOT EXISTS zone_stop_price DECIMAL(20, 8),
ADD COLUMN IF NOT EXISTS zone_width DECIMAL(20, 8),
ADD COLUMN IF NOT EXISTS zone_width_percent DECIMAL(5, 2),
ADD COLUMN IF NOT EXISTS pattern_context VARCHAR(20) DEFAULT 'unknown',
ADD COLUMN IF NOT EXISTS pattern_strength INTEGER DEFAULT 0;

-- Add zone columns to paper_pending_orders if it exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'paper_pending_orders') THEN
    ALTER TABLE paper_pending_orders
    ADD COLUMN IF NOT EXISTS zone_entry_price DECIMAL(20, 8),
    ADD COLUMN IF NOT EXISTS zone_stop_price DECIMAL(20, 8),
    ADD COLUMN IF NOT EXISTS zone_width DECIMAL(20, 8),
    ADD COLUMN IF NOT EXISTS zone_width_percent DECIMAL(5, 2),
    ADD COLUMN IF NOT EXISTS pattern_context VARCHAR(20) DEFAULT 'unknown',
    ADD COLUMN IF NOT EXISTS pattern_strength INTEGER DEFAULT 0;
  END IF;
END $$;

-- Add indexes for faster queries by pattern strength
CREATE INDEX IF NOT EXISTS idx_paper_positions_strength ON paper_positions(pattern_strength DESC);
CREATE INDEX IF NOT EXISTS idx_paper_positions_context ON paper_positions(pattern_context);
CREATE INDEX IF NOT EXISTS idx_paper_trades_strength ON paper_trades(pattern_strength DESC);
CREATE INDEX IF NOT EXISTS idx_paper_trades_context ON paper_trades(pattern_context);

-- Comments for documentation
COMMENT ON COLUMN paper_positions.zone_entry_price IS 'Near price of zone (entry point)';
COMMENT ON COLUMN paper_positions.zone_stop_price IS 'Far price of zone (stop loss reference)';
COMMENT ON COLUMN paper_positions.zone_width IS 'Absolute width of zone in price';
COMMENT ON COLUMN paper_positions.zone_width_percent IS 'Zone width as percentage of price';
COMMENT ON COLUMN paper_positions.pattern_context IS 'Pattern context: reversal or continuation';
COMMENT ON COLUMN paper_positions.pattern_strength IS 'Pattern strength rating 1-5 stars';

COMMENT ON COLUMN paper_trades.zone_entry_price IS 'Near price of zone (entry point)';
COMMENT ON COLUMN paper_trades.zone_stop_price IS 'Far price of zone (stop loss reference)';
COMMENT ON COLUMN paper_trades.zone_width IS 'Absolute width of zone in price';
COMMENT ON COLUMN paper_trades.zone_width_percent IS 'Zone width as percentage of price';
COMMENT ON COLUMN paper_trades.pattern_context IS 'Pattern context: reversal or continuation';
COMMENT ON COLUMN paper_trades.pattern_strength IS 'Pattern strength rating 1-5 stars';

-- Update existing records with default values based on pattern type
UPDATE paper_positions SET
  pattern_context = CASE
    WHEN pattern_type IN ('UPD', 'DPU', 'Head & Shoulders', 'Inverse H&S', 'Double Top', 'Double Bottom') THEN 'reversal'
    WHEN pattern_type IN ('DPD', 'UPU', 'Ascending Triangle', 'Descending Triangle', 'Bull Flag', 'Bear Flag') THEN 'continuation'
    ELSE 'unknown'
  END,
  pattern_strength = CASE
    WHEN pattern_type IN ('UPD', 'DPU') THEN 5
    WHEN pattern_type IN ('DPD', 'UPU') THEN 3
    WHEN pattern_type IN ('Head & Shoulders', 'Inverse H&S', 'Double Top', 'Double Bottom') THEN 4
    ELSE 2
  END
WHERE pattern_context IS NULL OR pattern_context = 'unknown';

UPDATE paper_trades SET
  pattern_context = CASE
    WHEN pattern_type IN ('UPD', 'DPU', 'Head & Shoulders', 'Inverse H&S', 'Double Top', 'Double Bottom') THEN 'reversal'
    WHEN pattern_type IN ('DPD', 'UPU', 'Ascending Triangle', 'Descending Triangle', 'Bull Flag', 'Bear Flag') THEN 'continuation'
    ELSE 'unknown'
  END,
  pattern_strength = CASE
    WHEN pattern_type IN ('UPD', 'DPU') THEN 5
    WHEN pattern_type IN ('DPD', 'UPU') THEN 3
    WHEN pattern_type IN ('Head & Shoulders', 'Inverse H&S', 'Double Top', 'Double Bottom') THEN 4
    ELSE 2
  END
WHERE pattern_context IS NULL OR pattern_context = 'unknown';
