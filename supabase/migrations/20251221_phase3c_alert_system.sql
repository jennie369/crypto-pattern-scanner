-- Phase 3C: Alert System Tables
-- Smart alerts for FTB, zone approach, confirmation patterns

-- User alerts table
CREATE TABLE IF NOT EXISTS user_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Alert config
  symbol VARCHAR(20) NOT NULL,
  timeframe VARCHAR(10),
  alert_type VARCHAR(30) NOT NULL, -- 'ftb', 'zone_approach', 'confirmation', 'price_level', 'zone_broken', 'high_score', 'stacked_zone'

  -- Trigger conditions
  trigger_price DECIMAL(20, 8),
  trigger_condition VARCHAR(20), -- 'above', 'below', 'cross', 'touch'
  zone_id UUID REFERENCES zone_history(id) ON DELETE SET NULL,

  -- Options
  is_active BOOLEAN DEFAULT TRUE,
  is_one_time BOOLEAN DEFAULT TRUE,
  notify_push BOOLEAN DEFAULT TRUE,
  notify_telegram BOOLEAN DEFAULT FALSE,

  -- Status
  triggered_at TIMESTAMPTZ,
  triggered_price DECIMAL(20, 8),
  trigger_count INTEGER DEFAULT 0,

  -- Metadata
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Alert history table
CREATE TABLE IF NOT EXISTS alert_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  alert_id UUID REFERENCES user_alerts(id) ON DELETE SET NULL,

  -- Alert details
  symbol VARCHAR(20) NOT NULL,
  alert_type VARCHAR(30) NOT NULL,
  title VARCHAR(200),
  message TEXT,

  -- Context
  trigger_price DECIMAL(20, 8),
  zone_info JSONB,
  confirmation_info JSONB,

  -- Status
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Alert preferences table
CREATE TABLE IF NOT EXISTS alert_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,

  -- Global settings
  alerts_enabled BOOLEAN DEFAULT TRUE,
  quiet_hours_start TIME,
  quiet_hours_end TIME,

  -- Alert types
  ftb_alerts BOOLEAN DEFAULT TRUE,
  zone_approach_alerts BOOLEAN DEFAULT TRUE,
  confirmation_alerts BOOLEAN DEFAULT TRUE,
  price_alerts BOOLEAN DEFAULT TRUE,
  zone_broken_alerts BOOLEAN DEFAULT TRUE,
  high_score_alerts BOOLEAN DEFAULT TRUE,
  stacked_zone_alerts BOOLEAN DEFAULT TRUE,

  -- Thresholds
  approach_distance_percent DECIMAL(5, 2) DEFAULT 1.0,
  min_odds_score INTEGER DEFAULT 8,

  -- Notification channels
  push_enabled BOOLEAN DEFAULT TRUE,
  telegram_enabled BOOLEAN DEFAULT FALSE,
  telegram_chat_id VARCHAR(50),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_alerts_user ON user_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_user_alerts_active ON user_alerts(is_active, symbol);
CREATE INDEX IF NOT EXISTS idx_user_alerts_symbol ON user_alerts(symbol, is_active);
CREATE INDEX IF NOT EXISTS idx_alert_history_user ON alert_history(user_id);
CREATE INDEX IF NOT EXISTS idx_alert_history_unread ON alert_history(user_id, is_read) WHERE is_read = FALSE;
CREATE INDEX IF NOT EXISTS idx_alert_history_created ON alert_history(created_at DESC);

-- Enable Row Level Security
ALTER TABLE user_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users own alerts" ON user_alerts;
CREATE POLICY "Users own alerts" ON user_alerts
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users own history" ON alert_history;
CREATE POLICY "Users own history" ON alert_history
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users own preferences" ON alert_preferences;
CREATE POLICY "Users own preferences" ON alert_preferences
  FOR ALL USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_alert_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_user_alerts_timestamp ON user_alerts;
CREATE TRIGGER update_user_alerts_timestamp
  BEFORE UPDATE ON user_alerts
  FOR EACH ROW
  EXECUTE FUNCTION update_alert_timestamp();

DROP TRIGGER IF EXISTS update_alert_preferences_timestamp ON alert_preferences;
CREATE TRIGGER update_alert_preferences_timestamp
  BEFORE UPDATE ON alert_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_alert_timestamp();

-- Comments
COMMENT ON TABLE user_alerts IS 'User-created alerts for price levels and zone triggers';
COMMENT ON TABLE alert_history IS 'History of triggered alerts';
COMMENT ON TABLE alert_preferences IS 'User alert preferences and settings';
