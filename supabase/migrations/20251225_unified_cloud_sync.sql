-- =====================================================
-- UNIFIED CLOUD SYNC MIGRATION
-- Date: 2024-12-25
-- Description: Comprehensive tables for cross-device data sync
-- Fixes: Local Storage Isolation Bug
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. USER FAVORITES (Watchlist patterns)
-- Stores user's favorite/watchlisted crypto patterns
-- =====================================================
CREATE TABLE IF NOT EXISTS user_favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Pattern data
  symbol VARCHAR(50) NOT NULL,
  pattern_type VARCHAR(100),
  timeframe VARCHAR(20),
  direction VARCHAR(10), -- LONG/SHORT

  -- Metadata
  added_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT,

  UNIQUE(user_id, symbol, pattern_type, timeframe)
);

CREATE INDEX IF NOT EXISTS idx_user_favorites_user ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_symbol ON user_favorites(symbol);

ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own favorites" ON user_favorites;
CREATE POLICY "Users can manage own favorites" ON user_favorites
  FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- 2. USER RECENTLY VIEWED PATTERNS
-- =====================================================
CREATE TABLE IF NOT EXISTS user_recent_patterns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  symbol VARCHAR(50) NOT NULL,
  pattern_type VARCHAR(100),
  timeframe VARCHAR(20),
  viewed_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, symbol, pattern_type, timeframe)
);

CREATE INDEX IF NOT EXISTS idx_recent_patterns_user ON user_recent_patterns(user_id, viewed_at DESC);

ALTER TABLE user_recent_patterns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own recent patterns" ON user_recent_patterns;
CREATE POLICY "Users can manage own recent patterns" ON user_recent_patterns
  FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- 3. USER CHART PREFERENCES
-- Stores chart display settings per user
-- =====================================================
CREATE TABLE IF NOT EXISTS user_chart_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Chart settings
  chart_type VARCHAR(20) DEFAULT 'candlestick', -- candlestick, line, area
  theme VARCHAR(20) DEFAULT 'dark',
  show_volume BOOLEAN DEFAULT true,
  show_grid BOOLEAN DEFAULT true,
  show_crosshair BOOLEAN DEFAULT true,
  default_timeframe VARCHAR(10) DEFAULT '1h',

  -- Indicators
  indicators JSONB DEFAULT '[]',

  -- Drawing tools
  drawings JSONB DEFAULT '{}',

  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id)
);

ALTER TABLE user_chart_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own chart prefs" ON user_chart_preferences;
CREATE POLICY "Users can manage own chart prefs" ON user_chart_preferences
  FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- 4. USER ALERT PREFERENCES
-- Stores user's price and pattern alert settings
-- =====================================================
CREATE TABLE IF NOT EXISTS user_alert_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Alert settings
  price_alerts_enabled BOOLEAN DEFAULT true,
  pattern_alerts_enabled BOOLEAN DEFAULT true,
  sound_enabled BOOLEAN DEFAULT true,
  vibration_enabled BOOLEAN DEFAULT true,

  -- Alert channels
  push_enabled BOOLEAN DEFAULT true,
  email_enabled BOOLEAN DEFAULT false,

  -- Quiet hours
  quiet_hours_enabled BOOLEAN DEFAULT false,
  quiet_start TIME,
  quiet_end TIME,

  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id)
);

ALTER TABLE user_alert_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own alert prefs" ON user_alert_preferences;
CREATE POLICY "Users can manage own alert prefs" ON user_alert_preferences
  FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- 5. USER ACTIVE ALERTS (price/pattern alerts)
-- =====================================================
CREATE TABLE IF NOT EXISTS user_active_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Alert definition
  alert_type VARCHAR(20) NOT NULL, -- 'price', 'pattern', 'volume'
  symbol VARCHAR(50) NOT NULL,
  condition VARCHAR(20), -- 'above', 'below', 'crosses'
  target_value DECIMAL(20, 8),

  -- Pattern alert specific
  pattern_type VARCHAR(100),
  timeframe VARCHAR(20),

  -- Status
  is_active BOOLEAN DEFAULT true,
  triggered_at TIMESTAMPTZ,
  triggered_count INTEGER DEFAULT 0,

  -- Repeat settings
  repeat_enabled BOOLEAN DEFAULT false,
  cooldown_minutes INTEGER DEFAULT 60,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_active_alerts_user ON user_active_alerts(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_active_alerts_symbol ON user_active_alerts(symbol, is_active);

ALTER TABLE user_active_alerts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own alerts" ON user_active_alerts;
CREATE POLICY "Users can manage own alerts" ON user_active_alerts
  FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- 6. USER TAROT PREFERENCES
-- Stores tarot/divination settings
-- =====================================================
CREATE TABLE IF NOT EXISTS user_tarot_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Deck preference
  selected_deck VARCHAR(50) DEFAULT 'rider_waite',

  -- Display settings
  show_reversed BOOLEAN DEFAULT true,
  animation_speed VARCHAR(20) DEFAULT 'normal', -- slow, normal, fast
  sound_enabled BOOLEAN DEFAULT true,

  -- Onboarding
  seen_tarot_intro BOOLEAN DEFAULT false,
  seen_iching_intro BOOLEAN DEFAULT false,

  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id)
);

ALTER TABLE user_tarot_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own tarot prefs" ON user_tarot_preferences;
CREATE POLICY "Users can manage own tarot prefs" ON user_tarot_preferences
  FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- 7. USER CART SYNC
-- Syncs shopping cart across devices
-- =====================================================
CREATE TABLE IF NOT EXISTS user_cart_sync (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Cart data
  shopify_cart_id VARCHAR(255),
  items JSONB DEFAULT '[]',

  -- Metadata
  item_count INTEGER DEFAULT 0,
  subtotal DECIMAL(12, 2) DEFAULT 0,

  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id)
);

ALTER TABLE user_cart_sync ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own cart" ON user_cart_sync;
CREATE POLICY "Users can manage own cart" ON user_cart_sync
  FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- 8. USER WELCOME PROGRESS
-- Tracks welcome/onboarding completion
-- =====================================================
CREATE TABLE IF NOT EXISTS user_welcome_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Welcome flow
  welcome_completed BOOLEAN DEFAULT false,
  welcome_completed_at TIMESTAMPTZ,
  slides_viewed JSONB DEFAULT '[]',

  -- Feature onboarding
  seen_scanner_intro BOOLEAN DEFAULT false,
  seen_paper_trade_intro BOOLEAN DEFAULT false,
  seen_courses_intro BOOLEAN DEFAULT false,
  seen_shop_intro BOOLEAN DEFAULT false,
  seen_forum_intro BOOLEAN DEFAULT false,
  seen_vision_board_intro BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id)
);

ALTER TABLE user_welcome_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own welcome" ON user_welcome_progress;
CREATE POLICY "Users can manage own welcome" ON user_welcome_progress
  FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- 9. USER SCANNER TIMEFRAME PREFERENCES
-- Stores preferred timeframes for scanner
-- =====================================================
CREATE TABLE IF NOT EXISTS user_timeframe_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  selected_timeframes JSONB DEFAULT '["1h", "4h", "1d"]',
  default_timeframe VARCHAR(10) DEFAULT '1h',

  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id)
);

ALTER TABLE user_timeframe_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own timeframes" ON user_timeframe_preferences;
CREATE POLICY "Users can manage own timeframes" ON user_timeframe_preferences
  FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- 10. USER MESSAGE DRAFTS
-- Stores unsent message drafts
-- =====================================================
CREATE TABLE IF NOT EXISTS user_message_drafts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Draft context
  context_type VARCHAR(50) NOT NULL, -- 'forum_post', 'forum_comment', 'dm', etc.
  context_id UUID, -- post_id, thread_id, etc.

  -- Content
  content TEXT,
  attachments JSONB DEFAULT '[]',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, context_type, context_id)
);

ALTER TABLE user_message_drafts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own drafts" ON user_message_drafts;
CREATE POLICY "Users can manage own drafts" ON user_message_drafts
  FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function: Get or create user preferences (generic)
DROP FUNCTION IF EXISTS get_or_create_user_prefs CASCADE;
CREATE OR REPLACE FUNCTION get_or_create_user_prefs(
  p_user_id UUID,
  p_table_name TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSONB;
BEGIN
  EXECUTE format('
    INSERT INTO %I (user_id)
    VALUES ($1)
    ON CONFLICT (user_id) DO NOTHING
    RETURNING to_jsonb(%I.*)
  ', p_table_name, p_table_name)
  INTO v_result
  USING p_user_id;

  IF v_result IS NULL THEN
    EXECUTE format('
      SELECT to_jsonb(%I.*)
      FROM %I
      WHERE user_id = $1
    ', p_table_name, p_table_name)
    INTO v_result
    USING p_user_id;
  END IF;

  RETURN v_result;
END;
$$;

-- =====================================================
-- CLEANUP OLD DATA (run after users switch to cloud)
-- This is optional - uncomment if needed
-- =====================================================
-- DELETE FROM user_recent_patterns
-- WHERE viewed_at < NOW() - INTERVAL '30 days';

-- =====================================================
-- END OF MIGRATION
-- =====================================================
