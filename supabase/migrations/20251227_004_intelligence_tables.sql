-- ============================================================================
-- PHASE 4: INTELLIGENCE LAYER - DATABASE MIGRATION
-- Created: 2024-12-27
-- Description: Tables for recommendation, analytics, A/B testing, and engagement
-- ============================================================================

-- ============================================================================
-- 1. ANALYTICS EVENTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  session_id TEXT,
  livestream_session_id UUID,
  properties JSONB DEFAULT '{}',
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  platform TEXT DEFAULT 'mobile'
);

-- Indexes for analytics_events
CREATE INDEX IF NOT EXISTS idx_analytics_user ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_event ON analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_session ON analytics_events(livestream_session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_timestamp ON analytics_events(timestamp DESC);

-- ============================================================================
-- 2. RECOMMENDATION LOGS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS recommendation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  strategy TEXT NOT NULL,
  product_ids TEXT[] NOT NULL,
  context JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_rec_logs_user ON recommendation_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_rec_logs_strategy ON recommendation_logs(strategy);
CREATE INDEX IF NOT EXISTS idx_rec_logs_created ON recommendation_logs(created_at DESC);

-- ============================================================================
-- 3. USER BEHAVIOR TABLE (Denormalized for fast queries)
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_behavior (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  total_sessions INTEGER DEFAULT 0,
  total_watch_time_minutes INTEGER DEFAULT 0,
  total_comments INTEGER DEFAULT 0,
  total_purchases INTEGER DEFAULT 0,
  total_spent DECIMAL(12, 2) DEFAULT 0,
  avg_order_value DECIMAL(12, 2) DEFAULT 0,
  products_viewed TEXT[] DEFAULT '{}',
  products_purchased TEXT[] DEFAULT '{}',
  active_hours INTEGER[] DEFAULT '{}',
  topics_engaged TEXT[] DEFAULT '{}',
  last_activity TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for user_behavior
ALTER TABLE user_behavior ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own behavior" ON user_behavior;
CREATE POLICY "Users can view own behavior" ON user_behavior
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own behavior" ON user_behavior;
CREATE POLICY "Users can update own behavior" ON user_behavior
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can insert behavior" ON user_behavior;
CREATE POLICY "System can insert behavior" ON user_behavior
  FOR INSERT WITH CHECK (true);

-- ============================================================================
-- 4. EXPERIMENTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS experiments (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  variants JSONB NOT NULL, -- [{id, name, weight}]
  target_audience TEXT DEFAULT 'all',
  metrics TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed')),
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_experiments_status ON experiments(status);

-- ============================================================================
-- 5. EXPERIMENT ASSIGNMENTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS experiment_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  experiment_id TEXT REFERENCES experiments(id),
  variant_id TEXT NOT NULL,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, experiment_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_exp_assign_user ON experiment_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_exp_assign_experiment ON experiment_assignments(experiment_id);

-- ============================================================================
-- 6. EXPERIMENT CONVERSIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS experiment_conversions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id TEXT REFERENCES experiments(id),
  variant_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  conversion_type TEXT NOT NULL,
  value DECIMAL(12, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_exp_conv_experiment ON experiment_conversions(experiment_id);
CREATE INDEX IF NOT EXISTS idx_exp_conv_variant ON experiment_conversions(variant_id);

-- ============================================================================
-- 7. PROACTIVE ENGAGEMENT LOGS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS proactive_engagement_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID,
  user_id UUID REFERENCES auth.users(id),
  trigger_type TEXT NOT NULL,
  action TEXT NOT NULL, -- 'shown', 'clicked', 'dismissed', 'converted'
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_proactive_session ON proactive_engagement_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_proactive_trigger ON proactive_engagement_logs(trigger_type);
CREATE INDEX IF NOT EXISTS idx_proactive_user ON proactive_engagement_logs(user_id);

-- ============================================================================
-- 8. LIVESTREAM SUBSCRIBERS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS livestream_subscribers (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  notifications_enabled BOOLEAN DEFAULT true,
  reminder_minutes INTEGER DEFAULT 15,
  preferred_times JSONB DEFAULT '{}', -- {weekday: [19, 20, 21]}
  subscribed_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE livestream_subscribers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own subscription" ON livestream_subscribers;
CREATE POLICY "Users can manage own subscription" ON livestream_subscribers
  FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- 9. NOTIFICATION HISTORY TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS notification_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  data JSONB DEFAULT '{}',
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_notif_user ON notification_history(user_id);
CREATE INDEX IF NOT EXISTS idx_notif_created ON notification_history(created_at DESC);

-- RLS
ALTER TABLE notification_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own notifications" ON notification_history;
CREATE POLICY "Users can view own notifications" ON notification_history
  FOR SELECT USING (auth.uid() = user_id);

-- ============================================================================
-- 10. EXTEND USER_PROFILES FOR PREFERENCES & PUSH TOKEN
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'preferences'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN preferences JSONB DEFAULT '{}';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'preferences_updated_at'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN preferences_updated_at TIMESTAMPTZ;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'push_token'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN push_token TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'behavior'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN behavior JSONB DEFAULT '{}';
  END IF;
END$$;

-- ============================================================================
-- 11. RPC FUNCTIONS
-- ============================================================================

-- Increment product view count
CREATE OR REPLACE FUNCTION increment_product_view(
  p_user_id UUID,
  p_product_id TEXT
) RETURNS void AS $$
BEGIN
  -- Insert or update user_behavior
  INSERT INTO user_behavior (user_id, products_viewed, updated_at)
  VALUES (p_user_id, ARRAY[p_product_id], NOW())
  ON CONFLICT (user_id) DO UPDATE
  SET
    products_viewed = CASE
      WHEN p_product_id = ANY(user_behavior.products_viewed)
      THEN user_behavior.products_viewed
      ELSE array_append(user_behavior.products_viewed, p_product_id)
    END,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Increment experiment conversion
CREATE OR REPLACE FUNCTION increment_experiment_conversion(
  p_experiment_id TEXT,
  p_variant_id TEXT,
  p_conversion_type TEXT,
  p_value DECIMAL DEFAULT 1
) RETURNS void AS $$
BEGIN
  -- Log is already handled by experiment_conversions table insert
  -- This function is for any additional aggregation if needed
  NULL;
END;
$$ LANGUAGE plpgsql;

-- Update user behavior aggregation
CREATE OR REPLACE FUNCTION update_user_behavior_aggregation(
  p_user_id UUID
) RETURNS JSONB AS $$
DECLARE
  v_behavior JSONB;
BEGIN
  WITH event_stats AS (
    SELECT
      COUNT(DISTINCT CASE WHEN event_name = 'livestream_join' THEN properties->>'livestream_session_id' END) as total_sessions,
      COUNT(CASE WHEN event_name = 'livestream_comment' THEN 1 END) as total_comments,
      COUNT(CASE WHEN event_name = 'purchase' THEN 1 END) as total_purchases,
      COALESCE(SUM(CASE WHEN event_name = 'purchase' THEN (properties->>'order_value')::DECIMAL END), 0) as total_spent
    FROM analytics_events
    WHERE user_id = p_user_id
    AND timestamp >= NOW() - INTERVAL '30 days'
  )
  SELECT jsonb_build_object(
    'total_sessions', total_sessions,
    'total_comments', total_comments,
    'total_purchases', total_purchases,
    'total_spent', total_spent,
    'last_updated', NOW()
  ) INTO v_behavior
  FROM event_stats;

  -- Update user_behavior table
  INSERT INTO user_behavior (user_id, total_sessions, total_comments, total_purchases, total_spent, updated_at)
  SELECT
    p_user_id,
    (v_behavior->>'total_sessions')::INTEGER,
    (v_behavior->>'total_comments')::INTEGER,
    (v_behavior->>'total_purchases')::INTEGER,
    (v_behavior->>'total_spent')::DECIMAL,
    NOW()
  ON CONFLICT (user_id) DO UPDATE
  SET
    total_sessions = EXCLUDED.total_sessions,
    total_comments = EXCLUDED.total_comments,
    total_purchases = EXCLUDED.total_purchases,
    total_spent = EXCLUDED.total_spent,
    updated_at = NOW();

  RETURN v_behavior;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 12. SEED DEFAULT EXPERIMENTS (Optional)
-- ============================================================================

INSERT INTO experiments (id, name, description, variants, target_audience, metrics, status)
VALUES
  (
    'rec_strategy_v1',
    'Recommendation Strategy Test',
    'Test which recommendation strategy performs best',
    '[{"id": "trending", "name": "Trending", "weight": 25}, {"id": "personalized", "name": "Personalized", "weight": 25}, {"id": "contextual", "name": "Contextual", "weight": 25}, {"id": "complementary", "name": "Complementary", "weight": 25}]',
    'all',
    '{"conversion_rate", "revenue"}',
    'active'
  ),
  (
    'engagement_timing_v1',
    'Engagement Timing Test',
    'Test optimal timing for proactive engagement',
    '[{"id": "aggressive", "name": "1 minute", "weight": 33}, {"id": "moderate", "name": "2 minutes", "weight": 34}, {"id": "conservative", "name": "5 minutes", "weight": 33}]',
    'all',
    '{"engagement"}',
    'active'
  ),
  (
    'cta_text_v1',
    'CTA Button Text Test',
    'Test which CTA text drives more conversions',
    '[{"id": "action", "name": "Mua ngay", "weight": 25}, {"id": "benefit", "name": "So huu ngay", "weight": 25}, {"id": "urgency", "name": "Dat ngay - Sap het!", "weight": 25}, {"id": "control", "name": "Them vao gio", "weight": 25}]',
    'all',
    '{"conversion_rate"}',
    'active'
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE analytics_events IS 'Stores all analytics events from livestream sessions';
COMMENT ON TABLE recommendation_logs IS 'Logs all product recommendations shown to users';
COMMENT ON TABLE user_behavior IS 'Aggregated user behavior data for quick access';
COMMENT ON TABLE experiments IS 'A/B testing experiments configuration';
COMMENT ON TABLE experiment_assignments IS 'User assignments to experiment variants';
COMMENT ON TABLE experiment_conversions IS 'Conversion events for A/B tests';
COMMENT ON TABLE proactive_engagement_logs IS 'Logs proactive engagement triggers and responses';
COMMENT ON TABLE livestream_subscribers IS 'Users subscribed to livestream notifications';
COMMENT ON TABLE notification_history IS 'History of notifications sent to users';
