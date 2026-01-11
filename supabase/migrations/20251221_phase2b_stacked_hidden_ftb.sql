-- ═══════════════════════════════════════════════════════════
-- Phase 2B: Stacked Zones + Hidden FTR + FTB Tracking
-- Multi-zone confluence detection and first-time-back tracking
-- ═══════════════════════════════════════════════════════════

-- =============================================
-- Add stacked zones columns to paper_positions
-- =============================================
ALTER TABLE paper_positions
ADD COLUMN IF NOT EXISTS is_stacked BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS stacked_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS stacked_zones JSONB,
ADD COLUMN IF NOT EXISTS confluence_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS has_hidden_ftr BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS hidden_ftr_timeframe VARCHAR(10),
ADD COLUMN IF NOT EXISTS hidden_ftr_entry DECIMAL(20, 8),
ADD COLUMN IF NOT EXISTS hidden_ftr_stop DECIMAL(20, 8),
ADD COLUMN IF NOT EXISTS parent_zone_id UUID,
ADD COLUMN IF NOT EXISTS is_ftb BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS ftb_timestamp TIMESTAMPTZ;

-- =============================================
-- Add stacked zones columns to paper_trades
-- =============================================
ALTER TABLE paper_trades
ADD COLUMN IF NOT EXISTS is_stacked BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS stacked_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS stacked_zones JSONB,
ADD COLUMN IF NOT EXISTS confluence_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS has_hidden_ftr BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS hidden_ftr_timeframe VARCHAR(10),
ADD COLUMN IF NOT EXISTS hidden_ftr_entry DECIMAL(20, 8),
ADD COLUMN IF NOT EXISTS hidden_ftr_stop DECIMAL(20, 8),
ADD COLUMN IF NOT EXISTS parent_zone_id UUID,
ADD COLUMN IF NOT EXISTS is_ftb BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS ftb_timestamp TIMESTAMPTZ;

-- =============================================
-- Add stacked zones columns to paper_pending_orders if exists
-- =============================================
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'paper_pending_orders') THEN
    ALTER TABLE paper_pending_orders
    ADD COLUMN IF NOT EXISTS is_stacked BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS stacked_count INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS stacked_zones JSONB,
    ADD COLUMN IF NOT EXISTS confluence_score INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS has_hidden_ftr BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS hidden_ftr_timeframe VARCHAR(10),
    ADD COLUMN IF NOT EXISTS hidden_ftr_entry DECIMAL(20, 8),
    ADD COLUMN IF NOT EXISTS hidden_ftr_stop DECIMAL(20, 8),
    ADD COLUMN IF NOT EXISTS parent_zone_id UUID,
    ADD COLUMN IF NOT EXISTS is_ftb BOOLEAN DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS ftb_timestamp TIMESTAMPTZ;
  END IF;
END $$;

-- =============================================
-- Add stacked zones columns to zone_history
-- =============================================
ALTER TABLE zone_history
ADD COLUMN IF NOT EXISTS is_stacked BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS stacked_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS stacked_zones JSONB,
ADD COLUMN IF NOT EXISTS confluence_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS has_hidden_ftr BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS hidden_ftr_timeframe VARCHAR(10),
ADD COLUMN IF NOT EXISTS hidden_ftr_entry DECIMAL(20, 8),
ADD COLUMN IF NOT EXISTS hidden_ftr_stop DECIMAL(20, 8),
ADD COLUMN IF NOT EXISTS parent_zone_id UUID,
ADD COLUMN IF NOT EXISTS is_ftb BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS ftb_timestamp TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS first_test_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS last_test_at TIMESTAMPTZ;

-- =============================================
-- Create zone_relationships table
-- =============================================
CREATE TABLE IF NOT EXISTS zone_relationships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_zone_id UUID NOT NULL,
  child_zone_id UUID NOT NULL,
  relationship_type VARCHAR(20) NOT NULL, -- 'stacked', 'nested', 'hidden_ftr'
  overlap_percent DECIMAL(5, 2),
  confluence_strength INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(parent_zone_id, child_zone_id)
);

-- =============================================
-- Indexes for stacked zones and FTB queries
-- =============================================
CREATE INDEX IF NOT EXISTS idx_paper_positions_stacked ON paper_positions(is_stacked) WHERE is_stacked = TRUE;
CREATE INDEX IF NOT EXISTS idx_paper_positions_ftb ON paper_positions(is_ftb) WHERE is_ftb = TRUE;
CREATE INDEX IF NOT EXISTS idx_paper_positions_confluence ON paper_positions(confluence_score);

CREATE INDEX IF NOT EXISTS idx_paper_trades_stacked ON paper_trades(is_stacked) WHERE is_stacked = TRUE;
CREATE INDEX IF NOT EXISTS idx_paper_trades_ftb ON paper_trades(is_ftb) WHERE is_ftb = TRUE;

CREATE INDEX IF NOT EXISTS idx_zone_history_stacked ON zone_history(is_stacked) WHERE is_stacked = TRUE;
CREATE INDEX IF NOT EXISTS idx_zone_history_ftb ON zone_history(is_ftb) WHERE is_ftb = TRUE;
CREATE INDEX IF NOT EXISTS idx_zone_history_confluence ON zone_history(confluence_score);
CREATE INDEX IF NOT EXISTS idx_zone_history_hidden_ftr ON zone_history(has_hidden_ftr) WHERE has_hidden_ftr = TRUE;

CREATE INDEX IF NOT EXISTS idx_zone_relationships_parent ON zone_relationships(parent_zone_id);
CREATE INDEX IF NOT EXISTS idx_zone_relationships_child ON zone_relationships(child_zone_id);
CREATE INDEX IF NOT EXISTS idx_zone_relationships_type ON zone_relationships(relationship_type);

-- =============================================
-- RLS Policies for zone_relationships
-- =============================================
ALTER TABLE zone_relationships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own relationships" ON zone_relationships
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own relationships" ON zone_relationships
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own relationships" ON zone_relationships
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own relationships" ON zone_relationships
  FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- Comments for documentation
-- =============================================
COMMENT ON TABLE zone_relationships IS 'Tracks relationships between zones (stacked, nested, hidden_ftr)';

COMMENT ON COLUMN paper_positions.is_stacked IS 'Multiple zones overlapping at this price level';
COMMENT ON COLUMN paper_positions.stacked_count IS 'Number of zones stacked together';
COMMENT ON COLUMN paper_positions.stacked_zones IS 'JSON array of component zone info';
COMMENT ON COLUMN paper_positions.confluence_score IS 'Calculated confluence score (higher = better)';
COMMENT ON COLUMN paper_positions.has_hidden_ftr IS 'Has Hidden FTR on lower timeframe';
COMMENT ON COLUMN paper_positions.hidden_ftr_timeframe IS 'Timeframe where Hidden FTR was found';
COMMENT ON COLUMN paper_positions.is_ftb IS 'Is First Time Back (zone never tested)';
COMMENT ON COLUMN paper_positions.ftb_timestamp IS 'When price first returned to zone';

COMMENT ON COLUMN zone_history.is_stacked IS 'Multiple zones overlapping at this price level';
COMMENT ON COLUMN zone_history.confluence_score IS 'Calculated confluence score';
COMMENT ON COLUMN zone_history.has_hidden_ftr IS 'Has Hidden FTR on lower timeframe';
COMMENT ON COLUMN zone_history.is_ftb IS 'Is First Time Back (zone never tested)';
COMMENT ON COLUMN zone_history.first_test_at IS 'When zone was first tested';
COMMENT ON COLUMN zone_history.last_test_at IS 'When zone was last tested';

COMMENT ON COLUMN zone_relationships.relationship_type IS 'Type: stacked, nested, or hidden_ftr';
COMMENT ON COLUMN zone_relationships.overlap_percent IS 'Percentage of zone overlap';
COMMENT ON COLUMN zone_relationships.confluence_strength IS 'Strength of the confluence';

-- =============================================
-- Update existing records - set FTB status
-- =============================================
UPDATE zone_history SET
  is_ftb = (test_count = 0 OR test_count IS NULL)
WHERE is_ftb IS NULL;

UPDATE paper_positions SET
  is_ftb = (zone_test_count = 0 OR zone_test_count IS NULL)
WHERE is_ftb IS NULL;
