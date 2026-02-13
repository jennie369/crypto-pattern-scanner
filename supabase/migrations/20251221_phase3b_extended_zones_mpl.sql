-- ============================================================================
-- Phase 3B: Extended Zones + MPL Enhancement + Pin & Engulf Combo
-- ============================================================================

-- Add extended zone columns to zone_history
ALTER TABLE zone_history
ADD COLUMN IF NOT EXISTS is_extended BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS original_entry_price DECIMAL(20, 8),
ADD COLUMN IF NOT EXISTS original_stop_price DECIMAL(20, 8),
ADD COLUMN IF NOT EXISTS extended_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS extension_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS mpl_price DECIMAL(20, 8),
ADD COLUMN IF NOT EXISTS mpl_quality VARCHAR(15),
ADD COLUMN IF NOT EXISTS mpl_penetrations INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS mpl_calculated_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS has_pin_engulf_combo BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS pin_engulf_score INTEGER DEFAULT 0;

-- Add extended zone columns to paper_positions
ALTER TABLE paper_positions
ADD COLUMN IF NOT EXISTS is_extended BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS original_entry_price DECIMAL(20, 8),
ADD COLUMN IF NOT EXISTS original_stop_price DECIMAL(20, 8),
ADD COLUMN IF NOT EXISTS extension_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS mpl_price DECIMAL(20, 8),
ADD COLUMN IF NOT EXISTS mpl_quality VARCHAR(15),
ADD COLUMN IF NOT EXISTS has_pin_engulf_combo BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS pin_engulf_score INTEGER DEFAULT 0;

-- Add extended zone columns to paper_trades
ALTER TABLE paper_trades
ADD COLUMN IF NOT EXISTS is_extended BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS original_stop_price DECIMAL(20, 8),
ADD COLUMN IF NOT EXISTS extension_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS mpl_price DECIMAL(20, 8),
ADD COLUMN IF NOT EXISTS has_pin_engulf_combo BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS pin_engulf_score INTEGER DEFAULT 0;

-- Add extended zone columns to paper_pending_orders
ALTER TABLE paper_pending_orders
ADD COLUMN IF NOT EXISTS is_extended BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS original_stop_price DECIMAL(20, 8),
ADD COLUMN IF NOT EXISTS extension_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS mpl_price DECIMAL(20, 8),
ADD COLUMN IF NOT EXISTS has_pin_engulf_combo BOOLEAN DEFAULT FALSE;

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_zone_history_extended
ON zone_history(is_extended)
WHERE is_extended = TRUE;

CREATE INDEX IF NOT EXISTS idx_zone_history_mpl
ON zone_history(mpl_price)
WHERE mpl_price IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_zone_history_pin_engulf
ON zone_history(has_pin_engulf_combo)
WHERE has_pin_engulf_combo = TRUE;

CREATE INDEX IF NOT EXISTS idx_paper_positions_extended
ON paper_positions(is_extended)
WHERE is_extended = TRUE;

-- Comments for documentation
COMMENT ON COLUMN zone_history.is_extended IS 'Whether zone has been extended from original boundaries';
COMMENT ON COLUMN zone_history.original_entry_price IS 'Original entry price before extension';
COMMENT ON COLUMN zone_history.original_stop_price IS 'Original stop price before extension';
COMMENT ON COLUMN zone_history.extended_at IS 'Timestamp when zone was last extended';
COMMENT ON COLUMN zone_history.extension_count IS 'Number of times zone has been extended';
COMMENT ON COLUMN zone_history.mpl_price IS 'Most Penetrated Level price within zone';
COMMENT ON COLUMN zone_history.mpl_quality IS 'MPL quality: excellent, good, moderate';
COMMENT ON COLUMN zone_history.mpl_penetrations IS 'Number of penetrations at MPL';
COMMENT ON COLUMN zone_history.mpl_calculated_at IS 'Timestamp when MPL was calculated';
COMMENT ON COLUMN zone_history.has_pin_engulf_combo IS 'Whether zone has Pin + Engulf combo confirmation';
COMMENT ON COLUMN zone_history.pin_engulf_score IS 'Combined score of Pin + Engulf combo';

COMMENT ON COLUMN paper_positions.is_extended IS 'Position entered at extended zone';
COMMENT ON COLUMN paper_positions.mpl_price IS 'MPL price used for entry refinement';
COMMENT ON COLUMN paper_positions.has_pin_engulf_combo IS 'Position has Pin + Engulf combo confirmation';
