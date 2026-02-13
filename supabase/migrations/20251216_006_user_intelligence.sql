-- ═══════════════════════════════════════════════════════════════════════════
-- GEMRAL AI BRAIN - Phase 3: User Behavior Intelligence
-- Migration: 006_user_intelligence.sql
-- ═══════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════════
-- 1. USER EVENTS TABLE
-- Tracks all user interactions for behavior analysis
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS ai_user_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Event details
  event_type TEXT NOT NULL,  -- 'screen_view', 'button_click', 'feature_use', 'search', 'purchase'
  event_name TEXT NOT NULL,  -- Specific event name
  event_category TEXT,       -- 'scanner', 'chatbot', 'forum', 'shop', 'courses'

  -- Context
  screen_name TEXT,
  component_name TEXT,

  -- Event data
  event_data JSONB DEFAULT '{}',

  -- Session tracking
  session_id TEXT,

  -- Device info
  device_type TEXT,          -- 'ios', 'android', 'web'
  app_version TEXT,

  -- Timestamps
  occurred_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_ai_user_events_user_id ON ai_user_events(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_user_events_type ON ai_user_events(event_type);
CREATE INDEX IF NOT EXISTS idx_ai_user_events_category ON ai_user_events(event_category);
CREATE INDEX IF NOT EXISTS idx_ai_user_events_occurred ON ai_user_events(occurred_at);
CREATE INDEX IF NOT EXISTS idx_ai_user_events_session ON ai_user_events(session_id);

-- ═══════════════════════════════════════════════════════════════════════════
-- 2. USER PROFILES (AI-computed behavior profiles)
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS ai_user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Engagement metrics
  total_sessions INT DEFAULT 0,
  total_events INT DEFAULT 0,
  avg_session_duration_seconds INT DEFAULT 0,
  last_active_at TIMESTAMPTZ,

  -- Feature usage (percentage of total usage)
  scanner_usage_pct DECIMAL(5,2) DEFAULT 0,
  chatbot_usage_pct DECIMAL(5,2) DEFAULT 0,
  forum_usage_pct DECIMAL(5,2) DEFAULT 0,
  shop_usage_pct DECIMAL(5,2) DEFAULT 0,
  courses_usage_pct DECIMAL(5,2) DEFAULT 0,

  -- Trading behavior
  preferred_timeframes TEXT[],     -- ['4h', '1d']
  preferred_patterns TEXT[],       -- ['DPD', 'UPU']
  favorite_coins TEXT[],           -- ['BTCUSDT', 'ETHUSDT']
  trading_style TEXT,              -- 'scalper', 'swing', 'position'
  risk_tolerance TEXT,             -- 'conservative', 'moderate', 'aggressive'

  -- Spiritual interests
  spiritual_interests TEXT[],      -- ['tarot', 'iching', 'crystals', 'manifest']
  karma_focus TEXT[],              -- ['money', 'love', 'health']

  -- Shopping behavior
  purchase_frequency TEXT,         -- 'never', 'rare', 'occasional', 'frequent'
  avg_order_value DECIMAL(12,2),
  preferred_categories TEXT[],

  -- Engagement score (0-100)
  engagement_score INT DEFAULT 0,
  churn_risk TEXT DEFAULT 'low',   -- 'low', 'medium', 'high'

  -- Computed segments
  user_segment TEXT,               -- 'new', 'active', 'power_user', 'at_risk', 'churned'
  persona TEXT,                    -- 'trader', 'spiritual_seeker', 'learner', 'shopper'

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════════════════
-- 3. USER SESSIONS TABLE
-- Track individual sessions for detailed analysis
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS ai_user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT UNIQUE NOT NULL,

  -- Session details
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  duration_seconds INT,

  -- Activity summary
  events_count INT DEFAULT 0,
  screens_visited TEXT[],
  features_used TEXT[],

  -- Device info
  device_type TEXT,
  app_version TEXT,
  os_version TEXT,

  -- Entry/Exit
  entry_screen TEXT,
  exit_screen TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_user_sessions_user ON ai_user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_user_sessions_started ON ai_user_sessions(started_at);

-- ═══════════════════════════════════════════════════════════════════════════
-- 4. FEATURE USAGE STATS (Aggregated daily)
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS ai_feature_usage_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stat_date DATE NOT NULL,
  feature_name TEXT NOT NULL,

  -- Usage metrics
  total_uses INT DEFAULT 0,
  unique_users INT DEFAULT 0,
  avg_duration_seconds INT DEFAULT 0,

  -- Breakdown by tier
  free_users INT DEFAULT 0,
  tier1_users INT DEFAULT 0,
  tier2_users INT DEFAULT 0,
  tier3_users INT DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(stat_date, feature_name)
);

-- ═══════════════════════════════════════════════════════════════════════════
-- 5. RPC FUNCTIONS
-- ═══════════════════════════════════════════════════════════════════════════

-- Drop existing functions first (for idempotent migration)
DROP FUNCTION IF EXISTS track_user_event(UUID, TEXT, TEXT, TEXT, TEXT, JSONB, TEXT, TEXT);
DROP FUNCTION IF EXISTS get_user_behavior_profile(UUID);
DROP FUNCTION IF EXISTS calculate_engagement_score(UUID);
DROP FUNCTION IF EXISTS batch_track_events(JSONB);

-- Track user event
CREATE OR REPLACE FUNCTION track_user_event(
  p_user_id UUID,
  p_event_type TEXT,
  p_event_name TEXT,
  p_event_category TEXT DEFAULT NULL,
  p_screen_name TEXT DEFAULT NULL,
  p_event_data JSONB DEFAULT '{}',
  p_session_id TEXT DEFAULT NULL,
  p_device_type TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_event_id UUID;
BEGIN
  INSERT INTO ai_user_events (
    user_id, event_type, event_name, event_category,
    screen_name, event_data, session_id, device_type
  ) VALUES (
    p_user_id, p_event_type, p_event_name, p_event_category,
    p_screen_name, p_event_data, p_session_id, p_device_type
  )
  RETURNING id INTO v_event_id;

  -- Update user profile stats (async would be better in production)
  UPDATE ai_user_profiles
  SET
    total_events = total_events + 1,
    last_active_at = NOW(),
    updated_at = NOW()
  WHERE user_id = p_user_id;

  -- Create profile if doesn't exist
  IF NOT FOUND THEN
    INSERT INTO ai_user_profiles (user_id, total_events, last_active_at)
    VALUES (p_user_id, 1, NOW())
    ON CONFLICT (user_id) DO UPDATE SET
      total_events = ai_user_profiles.total_events + 1,
      last_active_at = NOW(),
      updated_at = NOW();
  END IF;

  RETURN v_event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get user behavior profile
CREATE OR REPLACE FUNCTION get_user_behavior_profile(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_profile JSONB;
BEGIN
  SELECT jsonb_build_object(
    'user_id', user_id,
    'engagement_score', engagement_score,
    'user_segment', user_segment,
    'persona', persona,
    'churn_risk', churn_risk,
    'trading_style', trading_style,
    'preferred_patterns', preferred_patterns,
    'spiritual_interests', spiritual_interests,
    'feature_usage', jsonb_build_object(
      'scanner', scanner_usage_pct,
      'chatbot', chatbot_usage_pct,
      'forum', forum_usage_pct,
      'shop', shop_usage_pct,
      'courses', courses_usage_pct
    ),
    'last_active_at', last_active_at
  )
  INTO v_profile
  FROM ai_user_profiles
  WHERE user_id = p_user_id;

  RETURN COALESCE(v_profile, '{}'::JSONB);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Calculate engagement score
CREATE OR REPLACE FUNCTION calculate_engagement_score(p_user_id UUID)
RETURNS INT AS $$
DECLARE
  v_score INT := 0;
  v_days_since_last_active INT;
  v_events_last_7_days INT;
  v_sessions_last_30_days INT;
BEGIN
  -- Get days since last active
  SELECT EXTRACT(DAY FROM NOW() - last_active_at)::INT
  INTO v_days_since_last_active
  FROM ai_user_profiles
  WHERE user_id = p_user_id;

  -- Recency score (0-30 points)
  IF v_days_since_last_active IS NULL THEN
    v_score := 0;
  ELSIF v_days_since_last_active <= 1 THEN
    v_score := 30;
  ELSIF v_days_since_last_active <= 3 THEN
    v_score := 25;
  ELSIF v_days_since_last_active <= 7 THEN
    v_score := 20;
  ELSIF v_days_since_last_active <= 14 THEN
    v_score := 10;
  ELSIF v_days_since_last_active <= 30 THEN
    v_score := 5;
  ELSE
    v_score := 0;
  END IF;

  -- Events in last 7 days (0-40 points)
  SELECT COUNT(*)
  INTO v_events_last_7_days
  FROM ai_user_events
  WHERE user_id = p_user_id
    AND occurred_at > NOW() - INTERVAL '7 days';

  v_score := v_score + LEAST(v_events_last_7_days, 40);

  -- Sessions in last 30 days (0-30 points)
  SELECT COUNT(DISTINCT session_id)
  INTO v_sessions_last_30_days
  FROM ai_user_events
  WHERE user_id = p_user_id
    AND occurred_at > NOW() - INTERVAL '30 days';

  v_score := v_score + LEAST(v_sessions_last_30_days * 3, 30);

  -- Update profile
  UPDATE ai_user_profiles
  SET
    engagement_score = v_score,
    churn_risk = CASE
      WHEN v_score >= 70 THEN 'low'
      WHEN v_score >= 40 THEN 'medium'
      ELSE 'high'
    END,
    user_segment = CASE
      WHEN v_days_since_last_active > 30 THEN 'churned'
      WHEN v_days_since_last_active > 14 THEN 'at_risk'
      WHEN v_score >= 80 THEN 'power_user'
      WHEN v_score >= 50 THEN 'active'
      ELSE 'new'
    END,
    updated_at = NOW()
  WHERE user_id = p_user_id;

  RETURN v_score;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Batch track events (for offline queue)
CREATE OR REPLACE FUNCTION batch_track_events(p_events JSONB)
RETURNS INT AS $$
DECLARE
  v_event JSONB;
  v_count INT := 0;
BEGIN
  FOR v_event IN SELECT * FROM jsonb_array_elements(p_events)
  LOOP
    INSERT INTO ai_user_events (
      user_id,
      event_type,
      event_name,
      event_category,
      screen_name,
      event_data,
      session_id,
      device_type,
      occurred_at
    ) VALUES (
      (v_event->>'user_id')::UUID,
      v_event->>'event_type',
      v_event->>'event_name',
      v_event->>'event_category',
      v_event->>'screen_name',
      COALESCE(v_event->'event_data', '{}'::JSONB),
      v_event->>'session_id',
      v_event->>'device_type',
      COALESCE((v_event->>'occurred_at')::TIMESTAMPTZ, NOW())
    );
    v_count := v_count + 1;
  END LOOP;

  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═══════════════════════════════════════════════════════════════════════════
-- 6. RLS POLICIES
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE ai_user_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_user_sessions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first (for idempotent migration)
DROP POLICY IF EXISTS "Users can view own events" ON ai_user_events;
DROP POLICY IF EXISTS "Users can insert own events" ON ai_user_events;
DROP POLICY IF EXISTS "Users can view own profile" ON ai_user_profiles;
DROP POLICY IF EXISTS "Users can view own sessions" ON ai_user_sessions;
DROP POLICY IF EXISTS "Admin can view all events" ON ai_user_events;
DROP POLICY IF EXISTS "Admin can view all profiles" ON ai_user_profiles;

-- Users can only see their own events
CREATE POLICY "Users can view own events"
  ON ai_user_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own events"
  ON ai_user_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can only see their own profile
CREATE POLICY "Users can view own profile"
  ON ai_user_profiles FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only see their own sessions
CREATE POLICY "Users can view own sessions"
  ON ai_user_sessions FOR SELECT
  USING (auth.uid() = user_id);

-- Admin can see all
CREATE POLICY "Admin can view all events"
  ON ai_user_events FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND (is_admin = TRUE OR role = 'admin')
    )
  );

CREATE POLICY "Admin can view all profiles"
  ON ai_user_profiles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND (is_admin = TRUE OR role = 'admin')
    )
  );

-- ═══════════════════════════════════════════════════════════════════════════
-- 7. TRIGGERS
-- ═══════════════════════════════════════════════════════════════════════════

-- Drop existing trigger and function first
DROP TRIGGER IF EXISTS trigger_ai_user_profiles_updated ON ai_user_profiles;
DROP FUNCTION IF EXISTS update_ai_user_profiles_timestamp();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_ai_user_profiles_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_ai_user_profiles_updated
  BEFORE UPDATE ON ai_user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_user_profiles_timestamp();

-- ═══════════════════════════════════════════════════════════════════════════
-- MIGRATION COMPLETE
-- ═══════════════════════════════════════════════════════════════════════════
