-- ═══════════════════════════════════════════════════════════════════
-- ADD ENTRY TYPE ANALYTICS COLUMNS
-- Created: 2025-01-09
-- Purpose: Add columns to portfolio_transactions for RETEST vs BREAKOUT analytics
-- Related: Tasks 18-19 (Entry Type Analytics)
-- ═══════════════════════════════════════════════════════════════════

-- Add entry_type column (RETEST, BREAKOUT, OTHER)
ALTER TABLE portfolio_transactions
ADD COLUMN IF NOT EXISTS entry_type TEXT CHECK (entry_type IN ('RETEST', 'BREAKOUT', 'OTHER'));

-- Add pattern_type column (DPD, UPU, UPD, DPU)
ALTER TABLE portfolio_transactions
ADD COLUMN IF NOT EXISTS pattern_type TEXT CHECK (pattern_type IN ('DPD', 'UPU', 'UPD', 'DPU', 'UNKNOWN'));

-- Add zone_status_at_entry (which workflow step when entered)
ALTER TABLE portfolio_transactions
ADD COLUMN IF NOT EXISTS zone_status_at_entry TEXT;

-- Add confirmation_type (Pin Bar, Hammer, Engulfing, etc.)
ALTER TABLE portfolio_transactions
ADD COLUMN IF NOT EXISTS confirmation_type TEXT;

-- Add realized_pnl for closed positions (for analytics)
ALTER TABLE portfolio_transactions
ADD COLUMN IF NOT EXISTS realized_pnl DECIMAL(20, 2);

-- Add risk_reward_ratio for tracking actual R:R
ALTER TABLE portfolio_transactions
ADD COLUMN IF NOT EXISTS risk_reward_ratio DECIMAL(10, 2);

-- Add zone info for reference
ALTER TABLE portfolio_transactions
ADD COLUMN IF NOT EXISTS zone_top DECIMAL(20, 8);

ALTER TABLE portfolio_transactions
ADD COLUMN IF NOT EXISTS zone_bottom DECIMAL(20, 8);

-- Create index on entry_type for analytics queries
CREATE INDEX IF NOT EXISTS idx_portfolio_transactions_entry_type
ON portfolio_transactions(entry_type)
WHERE entry_type IS NOT NULL;

-- Create index on pattern_type
CREATE INDEX IF NOT EXISTS idx_portfolio_transactions_pattern_type
ON portfolio_transactions(pattern_type)
WHERE pattern_type IS NOT NULL;

-- Create index on realized_pnl for performance analytics
CREATE INDEX IF NOT EXISTS idx_portfolio_transactions_realized_pnl
ON portfolio_transactions(realized_pnl)
WHERE realized_pnl IS NOT NULL;

-- Add comments for documentation
COMMENT ON COLUMN portfolio_transactions.entry_type IS 'Type of entry: RETEST (recommended), BREAKOUT (not recommended), OTHER';
COMMENT ON COLUMN portfolio_transactions.pattern_type IS 'GEM pattern type: DPD, UPU, UPD, DPU';
COMMENT ON COLUMN portfolio_transactions.zone_status_at_entry IS 'Entry workflow status when entered (CONFIRMATION, IN_ZONE, etc.)';
COMMENT ON COLUMN portfolio_transactions.confirmation_type IS 'Confirmation candle type (Pin Bar, Hammer, Engulfing, etc.)';
COMMENT ON COLUMN portfolio_transactions.realized_pnl IS 'Realized profit/loss when position closed';
COMMENT ON COLUMN portfolio_transactions.risk_reward_ratio IS 'Actual risk:reward ratio achieved';

-- Update existing transactions to have default entry_type
UPDATE portfolio_transactions
SET entry_type = 'OTHER'
WHERE entry_type IS NULL;

-- ═══════════════════════════════════════════════════════════════════
-- END OF MIGRATION
-- ═══════════════════════════════════════════════════════════════════
