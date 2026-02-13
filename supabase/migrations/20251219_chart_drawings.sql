-- ============================================
-- GEM Scanner - Chart Drawings Table
-- Lưu trữ drawings của user trên chart
-- ============================================

-- Create table
CREATE TABLE IF NOT EXISTS chart_drawings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Chart identification
  symbol VARCHAR(20) NOT NULL,           -- 'BTCUSDT', 'ETHUSDT'
  timeframe VARCHAR(10) NOT NULL,        -- '1m', '5m', '1h', '4h', '1d'

  -- Drawing data
  tool_type VARCHAR(30) NOT NULL,        -- 'horizontal_line', 'trend_line', 'fibonacci', etc.
  drawing_data JSONB NOT NULL,           -- Full drawing configuration

  -- Metadata
  name VARCHAR(100),                     -- Optional name
  is_visible BOOLEAN DEFAULT TRUE,       -- Show/hide
  z_index INTEGER DEFAULT 0,             -- Layer order

  -- Multi-timeframe visibility
  visible_timeframes TEXT[] DEFAULT ARRAY['1m', '5m', '15m', '1h', '4h', '1d', '1w'],

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_chart_drawings_user_id
  ON chart_drawings(user_id);

CREATE INDEX IF NOT EXISTS idx_chart_drawings_symbol
  ON chart_drawings(symbol);

CREATE INDEX IF NOT EXISTS idx_chart_drawings_symbol_timeframe
  ON chart_drawings(symbol, timeframe);

CREATE INDEX IF NOT EXISTS idx_chart_drawings_tool_type
  ON chart_drawings(tool_type);

-- ============================================
-- RLS POLICIES
-- ============================================

ALTER TABLE chart_drawings ENABLE ROW LEVEL SECURITY;

-- Users can view their own drawings
CREATE POLICY "Users can view own drawings" ON chart_drawings
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own drawings
CREATE POLICY "Users can insert own drawings" ON chart_drawings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own drawings
CREATE POLICY "Users can update own drawings" ON chart_drawings
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own drawings
CREATE POLICY "Users can delete own drawings" ON chart_drawings
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- TRIGGER: Auto-update updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_chart_drawings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_chart_drawings_updated_at
  BEFORE UPDATE ON chart_drawings
  FOR EACH ROW
  EXECUTE FUNCTION update_chart_drawings_updated_at();

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE chart_drawings IS 'Lưu trữ drawings của user trên chart (Scanner)';
COMMENT ON COLUMN chart_drawings.tool_type IS 'horizontal_line, trend_line, rectangle, fibonacci_retracement, long_position, short_position';
COMMENT ON COLUMN chart_drawings.drawing_data IS 'JSON chứa points, style (color, lineWidth), và tool-specific data';
