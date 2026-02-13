-- =====================================================
-- ADMIN ANALYTICS DASHBOARD - Database Migration
-- Created: January 30, 2026
--
-- This migration creates comprehensive analytics tables
-- for tracking user behavior across the GEM Platform
-- =====================================================

-- =====================================================
-- SECTION 1: CORE ANALYTICS TABLES
-- =====================================================

-- Table 1: analytics_events - All user events
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- User info
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id UUID NOT NULL,

  -- Event details
  event_type VARCHAR(50) NOT NULL,
  event_category VARCHAR(50) NOT NULL,
  event_name VARCHAR(100) NOT NULL,
  event_value JSONB DEFAULT '{}',

  -- Context
  page_name VARCHAR(100),
  feature_name VARCHAR(100),
  source VARCHAR(50) DEFAULT 'mobile',
  platform VARCHAR(20),
  app_version VARCHAR(20),

  -- Time analysis
  day_of_week INTEGER,
  hour_of_day INTEGER,

  -- Performance
  duration_ms INTEGER,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_event_type CHECK (event_type IN (
    'page_view', 'action', 'click', 'scan', 'purchase',
    'complete', 'start', 'error', 'search', 'share'
  ))
);

-- Indexes for analytics_events
CREATE INDEX IF NOT EXISTS idx_analytics_events_user ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session ON analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_category ON analytics_events(event_category);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created ON analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_page ON analytics_events(page_name);
CREATE INDEX IF NOT EXISTS idx_analytics_events_feature ON analytics_events(feature_name);
CREATE INDEX IF NOT EXISTS idx_analytics_events_time ON analytics_events(day_of_week, hour_of_day);
CREATE INDEX IF NOT EXISTS idx_analytics_events_date ON analytics_events((created_at::date));

-- Table 2: analytics_page_views - Detailed page view tracking
CREATE TABLE IF NOT EXISTS analytics_page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id UUID NOT NULL,

  -- Page info
  page_name VARCHAR(100) NOT NULL,
  page_path VARCHAR(255),
  page_category VARCHAR(50),

  -- Timing
  entered_at TIMESTAMPTZ DEFAULT NOW(),
  exited_at TIMESTAMPTZ,
  duration_seconds INTEGER,

  -- Context
  source VARCHAR(50) DEFAULT 'mobile',
  platform VARCHAR(20),
  referrer_page VARCHAR(100),

  -- Engagement
  scroll_depth_percent INTEGER,
  interactions_count INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for analytics_page_views
CREATE INDEX IF NOT EXISTS idx_page_views_user ON analytics_page_views(user_id);
CREATE INDEX IF NOT EXISTS idx_page_views_session ON analytics_page_views(session_id);
CREATE INDEX IF NOT EXISTS idx_page_views_page ON analytics_page_views(page_name);
CREATE INDEX IF NOT EXISTS idx_page_views_created ON analytics_page_views(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_views_category ON analytics_page_views(page_category);
CREATE INDEX IF NOT EXISTS idx_page_views_entered ON analytics_page_views(entered_at DESC);

-- Table 3: analytics_sessions - User session tracking
CREATE TABLE IF NOT EXISTS analytics_sessions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Session info
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  is_active BOOLEAN DEFAULT true,

  -- Device info
  platform VARCHAR(20),
  device_type VARCHAR(50),
  os_version VARCHAR(50),
  app_version VARCHAR(20),

  -- Location (optional)
  country VARCHAR(50),
  city VARCHAR(100),
  timezone VARCHAR(50),

  -- Activity summary
  pages_viewed INTEGER DEFAULT 0,
  actions_count INTEGER DEFAULT 0,
  features_used TEXT[],

  -- Entry/Exit
  entry_page VARCHAR(100),
  exit_page VARCHAR(100),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for analytics_sessions
CREATE INDEX IF NOT EXISTS idx_sessions_user ON analytics_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_started ON analytics_sessions(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_platform ON analytics_sessions(platform);
CREATE INDEX IF NOT EXISTS idx_sessions_active ON analytics_sessions(is_active) WHERE is_active = true;

-- Table 4: analytics_feature_usage - Feature usage aggregation per user
CREATE TABLE IF NOT EXISTS analytics_feature_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Feature info
  feature_category VARCHAR(50) NOT NULL,
  feature_name VARCHAR(100) NOT NULL,
  feature_variant VARCHAR(100),

  -- Usage metrics
  usage_count INTEGER DEFAULT 1,
  total_duration_seconds INTEGER DEFAULT 0,
  last_used_at TIMESTAMPTZ DEFAULT NOW(),
  first_used_at TIMESTAMPTZ DEFAULT NOW(),

  -- Quality metrics
  completion_rate DECIMAL(5,2),
  success_rate DECIMAL(5,2),

  -- Context
  source VARCHAR(50) DEFAULT 'mobile',
  platform VARCHAR(20),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, feature_category, feature_name, feature_variant)
);

-- Indexes for analytics_feature_usage
CREATE INDEX IF NOT EXISTS idx_feature_usage_user ON analytics_feature_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_feature_usage_category ON analytics_feature_usage(feature_category);
CREATE INDEX IF NOT EXISTS idx_feature_usage_feature ON analytics_feature_usage(feature_name);
CREATE INDEX IF NOT EXISTS idx_feature_usage_last ON analytics_feature_usage(last_used_at DESC);

-- =====================================================
-- SECTION 2: AGGREGATION TABLES
-- =====================================================

-- Table 5: analytics_daily_stats - Daily aggregated statistics
CREATE TABLE IF NOT EXISTS analytics_daily_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Date
  stat_date DATE NOT NULL,

  -- Dimension
  dimension_type VARCHAR(50) NOT NULL,
  dimension_value VARCHAR(100) NOT NULL,

  -- Metrics
  unique_users INTEGER DEFAULT 0,
  total_views INTEGER DEFAULT 0,
  total_actions INTEGER DEFAULT 0,
  total_duration_seconds INTEGER DEFAULT 0,
  avg_duration_seconds INTEGER DEFAULT 0,

  -- Engagement
  engagement_score DECIMAL(5,2),
  retention_rate DECIMAL(5,2),

  -- Breakdown by hour (JSONB array)
  views_by_hour JSONB DEFAULT '{}',

  -- Breakdown by platform
  views_by_platform JSONB DEFAULT '{}',

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(stat_date, dimension_type, dimension_value)
);

-- Indexes for analytics_daily_stats
CREATE INDEX IF NOT EXISTS idx_daily_stats_date ON analytics_daily_stats(stat_date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_stats_dimension ON analytics_daily_stats(dimension_type, dimension_value);
CREATE INDEX IF NOT EXISTS idx_daily_stats_type ON analytics_daily_stats(dimension_type);

-- Table 6: analytics_weekly_aggregates - Weekly rolled-up data
CREATE TABLE IF NOT EXISTS analytics_weekly_aggregates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Week
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  week_number INTEGER,
  year INTEGER,

  -- Dimension
  dimension_type VARCHAR(50) NOT NULL,
  dimension_value VARCHAR(100) NOT NULL,

  -- Metrics
  unique_users INTEGER DEFAULT 0,
  total_views INTEGER DEFAULT 0,
  total_actions INTEGER DEFAULT 0,
  avg_daily_users DECIMAL(10,2),

  -- Trends
  growth_rate DECIMAL(5,2),
  trend VARCHAR(20),

  -- Top items
  top_days JSONB DEFAULT '[]',

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(week_start, dimension_type, dimension_value)
);

-- Indexes for analytics_weekly_aggregates
CREATE INDEX IF NOT EXISTS idx_weekly_stats_week ON analytics_weekly_aggregates(week_start DESC);
CREATE INDEX IF NOT EXISTS idx_weekly_stats_dimension ON analytics_weekly_aggregates(dimension_type, dimension_value);

-- =====================================================
-- SECTION 3: AI INSIGHTS TABLE
-- =====================================================

-- Table 7: analytics_ai_insights - AI-generated insights
CREATE TABLE IF NOT EXISTS analytics_ai_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Insight info
  insight_type VARCHAR(50) NOT NULL,
  insight_category VARCHAR(50) NOT NULL,
  insight_title VARCHAR(255) NOT NULL,
  insight_description TEXT NOT NULL,

  -- Data backing
  related_dimension VARCHAR(100),
  related_data JSONB DEFAULT '{}',
  confidence_score DECIMAL(5,2),

  -- Priority
  priority VARCHAR(20) DEFAULT 'medium',
  impact_score INTEGER,

  -- Action
  recommended_action TEXT,
  action_status VARCHAR(20) DEFAULT 'pending',
  actioned_at TIMESTAMPTZ,
  actioned_by UUID REFERENCES auth.users(id),
  action_notes TEXT,

  -- Validity
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_insight_type CHECK (insight_type IN ('trend', 'anomaly', 'recommendation', 'prediction')),
  CONSTRAINT valid_priority CHECK (priority IN ('critical', 'high', 'medium', 'low')),
  CONSTRAINT valid_action_status CHECK (action_status IN ('pending', 'in_progress', 'completed', 'dismissed'))
);

-- Indexes for analytics_ai_insights
CREATE INDEX IF NOT EXISTS idx_ai_insights_type ON analytics_ai_insights(insight_type);
CREATE INDEX IF NOT EXISTS idx_ai_insights_category ON analytics_ai_insights(insight_category);
CREATE INDEX IF NOT EXISTS idx_ai_insights_priority ON analytics_ai_insights(priority);
CREATE INDEX IF NOT EXISTS idx_ai_insights_active ON analytics_ai_insights(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_ai_insights_status ON analytics_ai_insights(action_status);
CREATE INDEX IF NOT EXISTS idx_ai_insights_created ON analytics_ai_insights(created_at DESC);

-- =====================================================
-- SECTION 4: FEATURE-SPECIFIC ANALYTICS TABLES
-- =====================================================

-- Table 8: analytics_scanner_stats - Scanner specific analytics
CREATE TABLE IF NOT EXISTS analytics_scanner_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  stat_date DATE NOT NULL,

  -- Pattern stats
  pattern_type VARCHAR(50) NOT NULL,
  timeframe VARCHAR(10),
  symbol VARCHAR(20),

  -- Metrics
  scans_count INTEGER DEFAULT 0,
  detections_count INTEGER DEFAULT 0,
  trades_opened INTEGER DEFAULT 0,
  trades_won INTEGER DEFAULT 0,
  trades_lost INTEGER DEFAULT 0,

  -- Performance
  win_rate DECIMAL(5,2),
  avg_rr_ratio DECIMAL(5,2),
  total_pnl DECIMAL(15,2),

  -- User engagement
  unique_users INTEGER DEFAULT 0,
  avg_scans_per_user DECIMAL(5,2),

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(stat_date, pattern_type, timeframe, symbol)
);

-- Indexes for analytics_scanner_stats
CREATE INDEX IF NOT EXISTS idx_scanner_stats_date ON analytics_scanner_stats(stat_date DESC);
CREATE INDEX IF NOT EXISTS idx_scanner_stats_pattern ON analytics_scanner_stats(pattern_type);
CREATE INDEX IF NOT EXISTS idx_scanner_stats_symbol ON analytics_scanner_stats(symbol);

-- Table 9: analytics_chatbot_stats - GEM Master chatbot analytics
CREATE TABLE IF NOT EXISTS analytics_chatbot_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  stat_date DATE NOT NULL,

  -- Chatbot type
  chatbot_type VARCHAR(50) NOT NULL,

  -- Metrics
  conversations_count INTEGER DEFAULT 0,
  messages_sent INTEGER DEFAULT 0,
  unique_users INTEGER DEFAULT 0,

  -- Engagement
  avg_messages_per_conversation DECIMAL(5,2),
  avg_conversation_duration_seconds INTEGER,

  -- Satisfaction
  ratings_count INTEGER DEFAULT 0,
  avg_rating DECIMAL(3,2),

  -- Popular items
  top_questions JSONB DEFAULT '[]',
  top_spreads JSONB DEFAULT '[]',

  -- Time breakdown
  usage_by_hour JSONB DEFAULT '{}',

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(stat_date, chatbot_type)
);

-- Indexes for analytics_chatbot_stats
CREATE INDEX IF NOT EXISTS idx_chatbot_stats_date ON analytics_chatbot_stats(stat_date DESC);
CREATE INDEX IF NOT EXISTS idx_chatbot_stats_type ON analytics_chatbot_stats(chatbot_type);

-- Table 10: analytics_ritual_stats - Ritual completion analytics
CREATE TABLE IF NOT EXISTS analytics_ritual_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  stat_date DATE NOT NULL,

  -- Ritual info
  ritual_type VARCHAR(50) NOT NULL,
  ritual_name VARCHAR(100),

  -- Metrics
  starts_count INTEGER DEFAULT 0,
  completions_count INTEGER DEFAULT 0,
  unique_users INTEGER DEFAULT 0,

  -- Engagement
  completion_rate DECIMAL(5,2),
  avg_duration_seconds INTEGER,

  -- Streaks
  users_with_streak INTEGER DEFAULT 0,
  avg_streak_days DECIMAL(5,2),
  max_streak_days INTEGER,

  -- Mood tracking
  avg_mood_before DECIMAL(3,2),
  avg_mood_after DECIMAL(3,2),
  avg_mood_improvement DECIMAL(3,2),

  -- Time preference
  preferred_hours JSONB DEFAULT '{}',

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(stat_date, ritual_type, ritual_name)
);

-- Indexes for analytics_ritual_stats
CREATE INDEX IF NOT EXISTS idx_ritual_stats_date ON analytics_ritual_stats(stat_date DESC);
CREATE INDEX IF NOT EXISTS idx_ritual_stats_type ON analytics_ritual_stats(ritual_type);
CREATE INDEX IF NOT EXISTS idx_ritual_stats_name ON analytics_ritual_stats(ritual_name);

-- Table 11: analytics_shop_stats - Shop/Product analytics
CREATE TABLE IF NOT EXISTS analytics_shop_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  stat_date DATE NOT NULL,

  -- Product info
  product_type VARCHAR(50) NOT NULL,
  product_id VARCHAR(100),
  product_name VARCHAR(255),

  -- Views
  views_count INTEGER DEFAULT 0,
  unique_viewers INTEGER DEFAULT 0,

  -- Conversions
  add_to_cart_count INTEGER DEFAULT 0,
  purchases_count INTEGER DEFAULT 0,
  conversion_rate DECIMAL(5,2),

  -- Revenue
  total_revenue DECIMAL(15,2) DEFAULT 0,
  avg_order_value DECIMAL(15,2),

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(stat_date, product_type, product_id)
);

-- Indexes for analytics_shop_stats
CREATE INDEX IF NOT EXISTS idx_shop_stats_date ON analytics_shop_stats(stat_date DESC);
CREATE INDEX IF NOT EXISTS idx_shop_stats_product_type ON analytics_shop_stats(product_type);
CREATE INDEX IF NOT EXISTS idx_shop_stats_product_id ON analytics_shop_stats(product_id);

-- Table 12: analytics_affiliate_stats - Affiliate/KOL analytics
CREATE TABLE IF NOT EXISTS analytics_affiliate_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  stat_date DATE NOT NULL,

  -- Affiliate info
  affiliate_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  affiliate_tier VARCHAR(20),

  -- Traffic
  referral_visits INTEGER DEFAULT 0,
  unique_referrals INTEGER DEFAULT 0,

  -- Conversions
  signups_count INTEGER DEFAULT 0,
  purchases_count INTEGER DEFAULT 0,
  conversion_rate DECIMAL(5,2),

  -- Revenue
  total_sales DECIMAL(15,2) DEFAULT 0,
  commission_earned DECIMAL(15,2) DEFAULT 0,

  -- Top products
  top_products JSONB DEFAULT '[]',

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(stat_date, affiliate_id)
);

-- Indexes for analytics_affiliate_stats
CREATE INDEX IF NOT EXISTS idx_affiliate_stats_date ON analytics_affiliate_stats(stat_date DESC);
CREATE INDEX IF NOT EXISTS idx_affiliate_stats_affiliate ON analytics_affiliate_stats(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_stats_tier ON analytics_affiliate_stats(affiliate_tier);

-- =====================================================
-- SECTION 5: RLS POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_feature_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_daily_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_weekly_aggregates ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_scanner_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_chatbot_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_ritual_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_shop_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_affiliate_stats ENABLE ROW LEVEL SECURITY;

-- Helper function to check admin/manager role
CREATE OR REPLACE FUNCTION is_analytics_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'manager')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- analytics_events policies
CREATE POLICY "Users can insert own events" ON analytics_events
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Admin can view all events" ON analytics_events
  FOR SELECT USING (is_analytics_admin());

CREATE POLICY "Service role full access events" ON analytics_events
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- analytics_page_views policies
CREATE POLICY "Users can insert own page_views" ON analytics_page_views
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Admin can view all page_views" ON analytics_page_views
  FOR SELECT USING (is_analytics_admin());

CREATE POLICY "Service role full access page_views" ON analytics_page_views
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- analytics_sessions policies
CREATE POLICY "Users can manage own sessions" ON analytics_sessions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admin can view all sessions" ON analytics_sessions
  FOR SELECT USING (is_analytics_admin());

CREATE POLICY "Service role full access sessions" ON analytics_sessions
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- analytics_feature_usage policies
CREATE POLICY "Users can manage own feature_usage" ON analytics_feature_usage
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admin can view all feature_usage" ON analytics_feature_usage
  FOR SELECT USING (is_analytics_admin());

CREATE POLICY "Service role full access feature_usage" ON analytics_feature_usage
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Aggregation tables - Admin only
CREATE POLICY "Admin can manage daily_stats" ON analytics_daily_stats
  FOR ALL USING (is_analytics_admin());

CREATE POLICY "Service role full access daily_stats" ON analytics_daily_stats
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Admin can manage weekly_aggregates" ON analytics_weekly_aggregates
  FOR ALL USING (is_analytics_admin());

CREATE POLICY "Service role full access weekly_aggregates" ON analytics_weekly_aggregates
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- AI insights - Admin can manage
CREATE POLICY "Admin can manage ai_insights" ON analytics_ai_insights
  FOR ALL USING (is_analytics_admin());

CREATE POLICY "Service role full access ai_insights" ON analytics_ai_insights
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Feature-specific stats - Admin only
CREATE POLICY "Admin can manage scanner_stats" ON analytics_scanner_stats
  FOR ALL USING (is_analytics_admin());

CREATE POLICY "Service role full access scanner_stats" ON analytics_scanner_stats
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Admin can manage chatbot_stats" ON analytics_chatbot_stats
  FOR ALL USING (is_analytics_admin());

CREATE POLICY "Service role full access chatbot_stats" ON analytics_chatbot_stats
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Admin can manage ritual_stats" ON analytics_ritual_stats
  FOR ALL USING (is_analytics_admin());

CREATE POLICY "Service role full access ritual_stats" ON analytics_ritual_stats
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Admin can manage shop_stats" ON analytics_shop_stats
  FOR ALL USING (is_analytics_admin());

CREATE POLICY "Service role full access shop_stats" ON analytics_shop_stats
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Admin can manage affiliate_stats" ON analytics_affiliate_stats
  FOR ALL USING (is_analytics_admin());

CREATE POLICY "Service role full access affiliate_stats" ON analytics_affiliate_stats
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- =====================================================
-- SECTION 6: VIEWS FOR DASHBOARD
-- =====================================================

-- View: Real-time active users
CREATE OR REPLACE VIEW v_analytics_realtime_users AS
SELECT
  COUNT(DISTINCT user_id) as active_users,
  COUNT(DISTINCT session_id) as active_sessions,
  platform,
  COUNT(*) FILTER (WHERE page_name LIKE '%Scanner%') as on_scanner,
  COUNT(*) FILTER (WHERE page_name LIKE '%Ritual%') as on_rituals,
  COUNT(*) FILTER (WHERE page_name LIKE '%GemMaster%' OR page_name LIKE '%Chat%') as on_chatbot,
  COUNT(*) FILTER (WHERE page_name LIKE '%Shop%') as on_shop,
  COUNT(*) FILTER (WHERE page_name LIKE '%Course%') as on_courses
FROM analytics_page_views
WHERE entered_at > NOW() - INTERVAL '5 minutes'
  AND (exited_at IS NULL OR exited_at > NOW() - INTERVAL '5 minutes')
GROUP BY platform;

-- View: Top features today
CREATE OR REPLACE VIEW v_analytics_top_features_today AS
SELECT
  event_category,
  feature_name,
  COUNT(*) as usage_count,
  COUNT(DISTINCT user_id) as unique_users,
  AVG(duration_ms) as avg_duration_ms,
  COUNT(*) FILTER (WHERE event_type = 'complete') as completions,
  ROUND(
    (COUNT(*) FILTER (WHERE event_type = 'complete')::numeric /
     NULLIF(COUNT(*) FILTER (WHERE event_type = 'start'), 0) * 100), 2
  ) as completion_rate
FROM analytics_events
WHERE created_at::date = CURRENT_DATE
  AND event_type IN ('action', 'complete', 'start')
GROUP BY event_category, feature_name
ORDER BY usage_count DESC
LIMIT 20;

-- View: Hourly usage pattern (last 7 days)
CREATE OR REPLACE VIEW v_analytics_hourly_pattern AS
SELECT
  hour_of_day,
  day_of_week,
  COUNT(*) as total_events,
  COUNT(DISTINCT user_id) as unique_users,
  event_category
FROM analytics_events
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY hour_of_day, day_of_week, event_category
ORDER BY hour_of_day, day_of_week;

-- View: Feature trends (this week vs last week)
CREATE OR REPLACE VIEW v_analytics_feature_trends AS
WITH current_week AS (
  SELECT
    feature_name,
    event_category,
    COUNT(*) as this_week_count,
    COUNT(DISTINCT user_id) as this_week_users
  FROM analytics_events
  WHERE created_at > NOW() - INTERVAL '7 days'
    AND feature_name IS NOT NULL
  GROUP BY feature_name, event_category
),
previous_week AS (
  SELECT
    feature_name,
    event_category,
    COUNT(*) as last_week_count,
    COUNT(DISTINCT user_id) as last_week_users
  FROM analytics_events
  WHERE created_at BETWEEN NOW() - INTERVAL '14 days' AND NOW() - INTERVAL '7 days'
    AND feature_name IS NOT NULL
  GROUP BY feature_name, event_category
)
SELECT
  c.feature_name,
  c.event_category,
  c.this_week_count,
  c.this_week_users,
  COALESCE(p.last_week_count, 0) as last_week_count,
  COALESCE(p.last_week_users, 0) as last_week_users,
  CASE
    WHEN COALESCE(p.last_week_count, 0) = 0 THEN 100
    ELSE ROUND(((c.this_week_count - p.last_week_count)::numeric / p.last_week_count * 100), 2)
  END as growth_percent,
  CASE
    WHEN c.this_week_count > COALESCE(p.last_week_count, 0) * 1.1 THEN 'up'
    WHEN c.this_week_count < COALESCE(p.last_week_count, 0) * 0.9 THEN 'down'
    ELSE 'stable'
  END as trend
FROM current_week c
LEFT JOIN previous_week p ON c.feature_name = p.feature_name
  AND c.event_category = p.event_category
ORDER BY c.this_week_count DESC;

-- View: Daily overview
CREATE OR REPLACE VIEW v_analytics_daily_overview AS
SELECT
  created_at::date as stat_date,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(DISTINCT session_id) as total_sessions,
  COUNT(*) as total_events,
  COUNT(*) FILTER (WHERE event_type = 'page_view') as page_views,
  COUNT(*) FILTER (WHERE event_type = 'action') as actions,
  COUNT(*) FILTER (WHERE event_type = 'complete') as completions,
  COUNT(*) FILTER (WHERE event_type = 'purchase') as purchases,
  AVG(duration_ms) as avg_duration_ms
FROM analytics_events
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY created_at::date
ORDER BY stat_date DESC;

-- =====================================================
-- SECTION 7: RPC FUNCTIONS
-- =====================================================

-- Function: Get dashboard overview stats
CREATE OR REPLACE FUNCTION get_analytics_dashboard_overview(
  p_start_date DATE DEFAULT CURRENT_DATE - INTERVAL '7 days',
  p_end_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  stat_name VARCHAR,
  stat_value NUMERIC,
  previous_value NUMERIC,
  change_percent NUMERIC
) AS $$
DECLARE
  v_period_days INTEGER;
BEGIN
  v_period_days := p_end_date - p_start_date;

  -- Total users
  RETURN QUERY
  WITH current_period AS (
    SELECT COUNT(DISTINCT user_id) as val
    FROM analytics_events
    WHERE created_at::date BETWEEN p_start_date AND p_end_date
  ),
  previous_period AS (
    SELECT COUNT(DISTINCT user_id) as val
    FROM analytics_events
    WHERE created_at::date BETWEEN p_start_date - v_period_days AND p_start_date - 1
  )
  SELECT
    'total_users'::VARCHAR,
    c.val::NUMERIC,
    p.val::NUMERIC,
    CASE WHEN p.val = 0 THEN 100 ELSE ROUND(((c.val - p.val)::numeric / p.val * 100), 2) END
  FROM current_period c, previous_period p;

  -- Total events
  RETURN QUERY
  WITH current_period AS (
    SELECT COUNT(*) as val
    FROM analytics_events
    WHERE created_at::date BETWEEN p_start_date AND p_end_date
  ),
  previous_period AS (
    SELECT COUNT(*) as val
    FROM analytics_events
    WHERE created_at::date BETWEEN p_start_date - v_period_days AND p_start_date - 1
  )
  SELECT
    'total_events'::VARCHAR,
    c.val::NUMERIC,
    p.val::NUMERIC,
    CASE WHEN p.val = 0 THEN 100 ELSE ROUND(((c.val - p.val)::numeric / p.val * 100), 2) END
  FROM current_period c, previous_period p;

  -- Total sessions
  RETURN QUERY
  WITH current_period AS (
    SELECT COUNT(DISTINCT session_id) as val
    FROM analytics_events
    WHERE created_at::date BETWEEN p_start_date AND p_end_date
  ),
  previous_period AS (
    SELECT COUNT(DISTINCT session_id) as val
    FROM analytics_events
    WHERE created_at::date BETWEEN p_start_date - v_period_days AND p_start_date - 1
  )
  SELECT
    'total_sessions'::VARCHAR,
    c.val::NUMERIC,
    p.val::NUMERIC,
    CASE WHEN p.val = 0 THEN 100 ELSE ROUND(((c.val - p.val)::numeric / p.val * 100), 2) END
  FROM current_period c, previous_period p;

  -- Avg session duration
  RETURN QUERY
  WITH current_period AS (
    SELECT COALESCE(AVG(duration_seconds), 0) as val
    FROM analytics_sessions
    WHERE started_at::date BETWEEN p_start_date AND p_end_date
      AND duration_seconds IS NOT NULL
  ),
  previous_period AS (
    SELECT COALESCE(AVG(duration_seconds), 0) as val
    FROM analytics_sessions
    WHERE started_at::date BETWEEN p_start_date - v_period_days AND p_start_date - 1
      AND duration_seconds IS NOT NULL
  )
  SELECT
    'avg_session_duration'::VARCHAR,
    ROUND(c.val::NUMERIC, 2),
    ROUND(p.val::NUMERIC, 2),
    CASE WHEN p.val = 0 THEN 100 ELSE ROUND(((c.val - p.val)::numeric / p.val * 100), 2) END
  FROM current_period c, previous_period p;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get feature breakdown
CREATE OR REPLACE FUNCTION get_analytics_feature_breakdown(
  p_category VARCHAR DEFAULT NULL,
  p_start_date DATE DEFAULT CURRENT_DATE - INTERVAL '7 days',
  p_end_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  feature_category VARCHAR,
  feature_name VARCHAR,
  usage_count BIGINT,
  unique_users BIGINT,
  completions BIGINT,
  completion_rate NUMERIC,
  avg_duration_ms NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.event_category::VARCHAR,
    e.feature_name::VARCHAR,
    COUNT(*)::BIGINT as usage_count,
    COUNT(DISTINCT e.user_id)::BIGINT as unique_users,
    COUNT(*) FILTER (WHERE e.event_type = 'complete')::BIGINT as completions,
    ROUND(
      (COUNT(*) FILTER (WHERE e.event_type = 'complete')::numeric /
       NULLIF(COUNT(*) FILTER (WHERE e.event_type = 'start'), 0) * 100), 2
    ) as completion_rate,
    ROUND(AVG(e.duration_ms)::NUMERIC, 2) as avg_duration_ms
  FROM analytics_events e
  WHERE e.created_at::date BETWEEN p_start_date AND p_end_date
    AND e.feature_name IS NOT NULL
    AND (p_category IS NULL OR e.event_category = p_category)
  GROUP BY e.event_category, e.feature_name
  ORDER BY usage_count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get declining users (for churn prediction)
CREATE OR REPLACE FUNCTION get_analytics_declining_users(
  p_threshold_percent NUMERIC DEFAULT 50
)
RETURNS TABLE (
  user_id UUID,
  email VARCHAR,
  tier VARCHAR,
  is_paying BOOLEAN,
  recent_activity INTEGER,
  previous_activity INTEGER,
  activity_decline_percent NUMERIC,
  last_active_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  WITH user_recent AS (
    SELECT
      e.user_id,
      COUNT(*) as activity_count,
      MAX(e.created_at) as last_active
    FROM analytics_events e
    WHERE e.created_at > NOW() - INTERVAL '7 days'
      AND e.user_id IS NOT NULL
    GROUP BY e.user_id
  ),
  user_previous AS (
    SELECT
      e.user_id,
      COUNT(*) as activity_count
    FROM analytics_events e
    WHERE e.created_at BETWEEN NOW() - INTERVAL '14 days' AND NOW() - INTERVAL '7 days'
      AND e.user_id IS NOT NULL
    GROUP BY e.user_id
  )
  SELECT
    p.id::UUID,
    p.email::VARCHAR,
    p.tier::VARCHAR,
    (p.tier IN ('TIER1', 'TIER2', 'TIER3'))::BOOLEAN as is_paying,
    COALESCE(r.activity_count, 0)::INTEGER as recent_activity,
    COALESCE(prev.activity_count, 0)::INTEGER as previous_activity,
    ROUND(
      CASE
        WHEN COALESCE(prev.activity_count, 0) = 0 THEN 0
        ELSE ((prev.activity_count - COALESCE(r.activity_count, 0))::numeric / prev.activity_count * 100)
      END, 2
    ) as activity_decline_percent,
    r.last_active
  FROM profiles p
  LEFT JOIN user_recent r ON r.user_id = p.id
  LEFT JOIN user_previous prev ON prev.user_id = p.id
  WHERE prev.activity_count > 10  -- Had significant activity before
    AND ROUND(
      CASE
        WHEN COALESCE(prev.activity_count, 0) = 0 THEN 0
        ELSE ((prev.activity_count - COALESCE(r.activity_count, 0))::numeric / prev.activity_count * 100)
      END, 2
    ) > p_threshold_percent
  ORDER BY activity_decline_percent DESC
  LIMIT 100;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get highly engaged free users (for conversion prediction)
CREATE OR REPLACE FUNCTION get_analytics_engaged_free_users()
RETURNS TABLE (
  user_id UUID,
  email VARCHAR,
  engagement_score INTEGER,
  total_events INTEGER,
  days_active INTEGER,
  features_used INTEGER,
  last_active_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  WITH user_stats AS (
    SELECT
      e.user_id,
      COUNT(*) as total_events,
      COUNT(DISTINCT e.created_at::date) as days_active,
      COUNT(DISTINCT e.feature_name) as features_used,
      MAX(e.created_at) as last_active
    FROM analytics_events e
    WHERE e.created_at > NOW() - INTERVAL '30 days'
      AND e.user_id IS NOT NULL
    GROUP BY e.user_id
  )
  SELECT
    p.id::UUID,
    p.email::VARCHAR,
    -- Engagement score: weighted combination of activity
    LEAST(100, (
      (us.total_events / 10) +
      (us.days_active * 3) +
      (us.features_used * 5)
    ))::INTEGER as engagement_score,
    us.total_events::INTEGER,
    us.days_active::INTEGER,
    us.features_used::INTEGER,
    us.last_active
  FROM profiles p
  JOIN user_stats us ON us.user_id = p.id
  WHERE p.tier = 'FREE'
    AND us.total_events > 50
    AND us.days_active > 5
  ORDER BY engagement_score DESC
  LIMIT 100;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Aggregate daily stats (to be called by cron job)
CREATE OR REPLACE FUNCTION aggregate_analytics_daily_stats(
  p_date DATE DEFAULT CURRENT_DATE - 1
)
RETURNS void AS $$
BEGIN
  -- Aggregate by page
  INSERT INTO analytics_daily_stats (stat_date, dimension_type, dimension_value, unique_users, total_views, total_actions, views_by_hour, views_by_platform)
  SELECT
    p_date,
    'page',
    page_name,
    COUNT(DISTINCT user_id),
    COUNT(*),
    0,
    jsonb_object_agg(COALESCE(hour_of_day::text, '0'), COALESCE(hour_count, 0)),
    jsonb_object_agg(COALESCE(platform, 'unknown'), COALESCE(platform_count, 0))
  FROM (
    SELECT
      e.page_name,
      e.user_id,
      e.hour_of_day,
      e.platform,
      COUNT(*) OVER (PARTITION BY e.page_name, e.hour_of_day) as hour_count,
      COUNT(*) OVER (PARTITION BY e.page_name, e.platform) as platform_count
    FROM analytics_events e
    WHERE e.created_at::date = p_date
      AND e.event_type = 'page_view'
      AND e.page_name IS NOT NULL
  ) sub
  GROUP BY page_name
  ON CONFLICT (stat_date, dimension_type, dimension_value)
  DO UPDATE SET
    unique_users = EXCLUDED.unique_users,
    total_views = EXCLUDED.total_views,
    views_by_hour = EXCLUDED.views_by_hour,
    views_by_platform = EXCLUDED.views_by_platform;

  -- Aggregate by category
  INSERT INTO analytics_daily_stats (stat_date, dimension_type, dimension_value, unique_users, total_views, total_actions)
  SELECT
    p_date,
    'category',
    event_category,
    COUNT(DISTINCT user_id),
    COUNT(*) FILTER (WHERE event_type = 'page_view'),
    COUNT(*) FILTER (WHERE event_type = 'action')
  FROM analytics_events
  WHERE created_at::date = p_date
  GROUP BY event_category
  ON CONFLICT (stat_date, dimension_type, dimension_value)
  DO UPDATE SET
    unique_users = EXCLUDED.unique_users,
    total_views = EXCLUDED.total_views,
    total_actions = EXCLUDED.total_actions;

  -- Aggregate by feature
  INSERT INTO analytics_daily_stats (stat_date, dimension_type, dimension_value, unique_users, total_views, total_actions, avg_duration_seconds)
  SELECT
    p_date,
    'feature',
    feature_name,
    COUNT(DISTINCT user_id),
    COUNT(*) FILTER (WHERE event_type = 'page_view'),
    COUNT(*) FILTER (WHERE event_type IN ('action', 'complete', 'start')),
    ROUND(AVG(duration_ms) / 1000)::INTEGER
  FROM analytics_events
  WHERE created_at::date = p_date
    AND feature_name IS NOT NULL
  GROUP BY feature_name
  ON CONFLICT (stat_date, dimension_type, dimension_value)
  DO UPDATE SET
    unique_users = EXCLUDED.unique_users,
    total_views = EXCLUDED.total_views,
    total_actions = EXCLUDED.total_actions,
    avg_duration_seconds = EXCLUDED.avg_duration_seconds;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get hourly heatmap data
CREATE OR REPLACE FUNCTION get_analytics_hourly_heatmap(
  p_start_date DATE DEFAULT CURRENT_DATE - INTERVAL '7 days',
  p_end_date DATE DEFAULT CURRENT_DATE,
  p_category VARCHAR DEFAULT NULL
)
RETURNS TABLE (
  hour_of_day INTEGER,
  day_of_week INTEGER,
  event_count BIGINT,
  unique_users BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.hour_of_day,
    e.day_of_week,
    COUNT(*)::BIGINT,
    COUNT(DISTINCT e.user_id)::BIGINT
  FROM analytics_events e
  WHERE e.created_at::date BETWEEN p_start_date AND p_end_date
    AND (p_category IS NULL OR e.event_category = p_category)
  GROUP BY e.hour_of_day, e.day_of_week
  ORDER BY e.day_of_week, e.hour_of_day;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- SECTION 8: TRIGGERS
-- =====================================================

-- Trigger to update session on event insert
CREATE OR REPLACE FUNCTION update_session_on_event()
RETURNS TRIGGER AS $$
BEGIN
  -- Update session activity
  UPDATE analytics_sessions
  SET
    actions_count = actions_count + 1,
    updated_at = NOW(),
    features_used = array_append(
      COALESCE(features_used, ARRAY[]::TEXT[]),
      NEW.feature_name
    )
  WHERE id = NEW.session_id
    AND NEW.feature_name IS NOT NULL
    AND NOT (NEW.feature_name = ANY(COALESCE(features_used, ARRAY[]::TEXT[])));

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_session_on_event
  AFTER INSERT ON analytics_events
  FOR EACH ROW
  EXECUTE FUNCTION update_session_on_event();

-- Auto update updated_at timestamp
CREATE OR REPLACE FUNCTION update_analytics_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_analytics_sessions_updated
  BEFORE UPDATE ON analytics_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_analytics_timestamp();

CREATE TRIGGER trg_analytics_feature_usage_updated
  BEFORE UPDATE ON analytics_feature_usage
  FOR EACH ROW
  EXECUTE FUNCTION update_analytics_timestamp();

CREATE TRIGGER trg_analytics_ai_insights_updated
  BEFORE UPDATE ON analytics_ai_insights
  FOR EACH ROW
  EXECUTE FUNCTION update_analytics_timestamp();

-- =====================================================
-- SECTION 9: GRANTS
-- =====================================================

-- Grant access to authenticated users for tracking
GRANT INSERT ON analytics_events TO authenticated;
GRANT INSERT ON analytics_page_views TO authenticated;
GRANT ALL ON analytics_sessions TO authenticated;
GRANT ALL ON analytics_feature_usage TO authenticated;

-- Grant select on views
GRANT SELECT ON v_analytics_realtime_users TO authenticated;
GRANT SELECT ON v_analytics_top_features_today TO authenticated;
GRANT SELECT ON v_analytics_hourly_pattern TO authenticated;
GRANT SELECT ON v_analytics_feature_trends TO authenticated;
GRANT SELECT ON v_analytics_daily_overview TO authenticated;

-- =====================================================
-- END OF MIGRATION
-- =====================================================

COMMENT ON TABLE analytics_events IS 'Core event tracking table for all user actions';
COMMENT ON TABLE analytics_page_views IS 'Detailed page view tracking with duration';
COMMENT ON TABLE analytics_sessions IS 'User session tracking';
COMMENT ON TABLE analytics_feature_usage IS 'Aggregated feature usage per user';
COMMENT ON TABLE analytics_daily_stats IS 'Daily aggregated statistics';
COMMENT ON TABLE analytics_weekly_aggregates IS 'Weekly rolled-up statistics';
COMMENT ON TABLE analytics_ai_insights IS 'AI-generated insights and recommendations';
COMMENT ON TABLE analytics_scanner_stats IS 'Scanner-specific analytics';
COMMENT ON TABLE analytics_chatbot_stats IS 'GEM Master chatbot analytics';
COMMENT ON TABLE analytics_ritual_stats IS 'Ritual completion analytics';
COMMENT ON TABLE analytics_shop_stats IS 'Shop/Product analytics';
COMMENT ON TABLE analytics_affiliate_stats IS 'Affiliate/KOL analytics';
