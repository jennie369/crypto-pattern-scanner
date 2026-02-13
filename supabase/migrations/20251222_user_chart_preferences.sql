-- ============================================================
-- GEM Scanner - User Chart Preferences Migration
-- Order Lines Display Settings (Binance-style)
-- ============================================================

-- Create user_chart_preferences table
CREATE TABLE IF NOT EXISTS user_chart_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,

  -- Order Lines Toggle Settings
  show_entry_lines BOOLEAN DEFAULT TRUE,
  show_tp_lines BOOLEAN DEFAULT TRUE,
  show_sl_lines BOOLEAN DEFAULT TRUE,
  show_liquidation_lines BOOLEAN DEFAULT TRUE,
  show_pending_orders BOOLEAN DEFAULT TRUE,

  -- Line Style Preferences
  entry_line_color VARCHAR(10) DEFAULT '#FFBD59',  -- Gold
  tp_line_color VARCHAR(10) DEFAULT '#22C55E',     -- Green
  sl_line_color VARCHAR(10) DEFAULT '#EF4444',     -- Red
  liquidation_line_color VARCHAR(10) DEFAULT '#A855F7',  -- Purple
  pending_line_color VARCHAR(10) DEFAULT '#00F0FF',      -- Cyan

  -- Line Width
  line_width INTEGER DEFAULT 1,

  -- Label Display
  show_pnl_on_lines BOOLEAN DEFAULT TRUE,
  show_percent_on_lines BOOLEAN DEFAULT TRUE,

  -- Other Chart Preferences
  show_volume BOOLEAN DEFAULT FALSE,
  show_price_lines BOOLEAN DEFAULT TRUE,
  default_timeframe VARCHAR(10) DEFAULT '4h',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for fast user lookup
CREATE INDEX IF NOT EXISTS idx_chart_preferences_user_id
  ON user_chart_preferences(user_id);

-- Enable RLS
ALTER TABLE user_chart_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own chart preferences"
  ON user_chart_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own chart preferences"
  ON user_chart_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own chart preferences"
  ON user_chart_preferences FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own chart preferences"
  ON user_chart_preferences FOR DELETE
  USING (auth.uid() = user_id);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_chart_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_chart_preferences_timestamp
  BEFORE UPDATE ON user_chart_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_chart_preferences_updated_at();

-- Function to get or create user preferences
CREATE OR REPLACE FUNCTION get_or_create_chart_preferences(p_user_id UUID)
RETURNS user_chart_preferences AS $$
DECLARE
  result user_chart_preferences;
BEGIN
  -- Try to get existing
  SELECT * INTO result
  FROM user_chart_preferences
  WHERE user_id = p_user_id;

  -- If not exists, create with defaults
  IF result IS NULL THEN
    INSERT INTO user_chart_preferences (user_id)
    VALUES (p_user_id)
    RETURNING * INTO result;
  END IF;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_or_create_chart_preferences TO authenticated;
