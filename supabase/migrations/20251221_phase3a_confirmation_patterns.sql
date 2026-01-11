-- ============================================================================
-- Phase 3A: Confirmation Patterns
-- Engulfing, Pin Bar, Inside Bar, Morning/Evening Star, Doji detection
-- ============================================================================

-- Add confirmation columns to zone_history
ALTER TABLE zone_history
ADD COLUMN IF NOT EXISTS has_confirmation BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS confirmation_type VARCHAR(30),
ADD COLUMN IF NOT EXISTS confirmation_strength VARCHAR(10),
ADD COLUMN IF NOT EXISTS confirmation_candle JSONB,
ADD COLUMN IF NOT EXISTS entry_trigger VARCHAR(20),
ADD COLUMN IF NOT EXISTS confirmation_score INTEGER DEFAULT 0;

-- Add confirmation columns to paper_positions
ALTER TABLE paper_positions
ADD COLUMN IF NOT EXISTS has_confirmation BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS confirmation_type VARCHAR(30),
ADD COLUMN IF NOT EXISTS confirmation_strength VARCHAR(10),
ADD COLUMN IF NOT EXISTS confirmation_candle JSONB,
ADD COLUMN IF NOT EXISTS confirmation_score INTEGER DEFAULT 0;

-- Add confirmation columns to paper_trades
ALTER TABLE paper_trades
ADD COLUMN IF NOT EXISTS has_confirmation BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS confirmation_type VARCHAR(30),
ADD COLUMN IF NOT EXISTS confirmation_strength VARCHAR(10),
ADD COLUMN IF NOT EXISTS confirmation_candle JSONB,
ADD COLUMN IF NOT EXISTS confirmation_score INTEGER DEFAULT 0;

-- Add confirmation columns to paper_pending_orders
ALTER TABLE paper_pending_orders
ADD COLUMN IF NOT EXISTS has_confirmation BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS confirmation_type VARCHAR(30),
ADD COLUMN IF NOT EXISTS confirmation_strength VARCHAR(10),
ADD COLUMN IF NOT EXISTS confirmation_candle JSONB,
ADD COLUMN IF NOT EXISTS confirmation_score INTEGER DEFAULT 0;

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_zone_history_confirmed
ON zone_history(has_confirmation)
WHERE has_confirmation = TRUE;

CREATE INDEX IF NOT EXISTS idx_paper_positions_confirmed
ON paper_positions(has_confirmation)
WHERE has_confirmation = TRUE;

CREATE INDEX IF NOT EXISTS idx_paper_trades_confirmed
ON paper_trades(has_confirmation)
WHERE has_confirmation = TRUE;

-- Create index for confirmation type lookups
CREATE INDEX IF NOT EXISTS idx_zone_history_confirmation_type
ON zone_history(confirmation_type)
WHERE confirmation_type IS NOT NULL;

-- Comments for documentation
COMMENT ON COLUMN zone_history.has_confirmation IS 'Whether zone has candlestick confirmation';
COMMENT ON COLUMN zone_history.confirmation_type IS 'Type: bullish_engulfing, bearish_engulfing, bullish_pin_bar, bearish_pin_bar, etc.';
COMMENT ON COLUMN zone_history.confirmation_strength IS 'Strength level: strong, moderate, weak';
COMMENT ON COLUMN zone_history.confirmation_candle IS 'JSONB data of the confirmation candle(s)';
COMMENT ON COLUMN zone_history.entry_trigger IS 'Entry trigger condition: break_high, break_low, close_above, close_below';
COMMENT ON COLUMN zone_history.confirmation_score IS 'Numeric score 0-10 based on pattern quality';

COMMENT ON COLUMN paper_positions.has_confirmation IS 'Position entered with candlestick confirmation';
COMMENT ON COLUMN paper_positions.confirmation_type IS 'Type of confirmation pattern used for entry';
COMMENT ON COLUMN paper_positions.confirmation_strength IS 'Strength of confirmation at entry';
COMMENT ON COLUMN paper_positions.confirmation_candle IS 'JSONB data of the confirmation candle(s)';
COMMENT ON COLUMN paper_positions.confirmation_score IS 'Score of confirmation pattern at entry';
