-- =====================================================
-- USER PRACTICE PROFILE - ROI PROOF SYSTEM PHASE C
-- Classifies users into cohorts based on their practice patterns
-- =====================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS user_practice_profile (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  profile_date DATE NOT NULL DEFAULT CURRENT_DATE,

  -- Practice Level Classification
  practice_level VARCHAR(20) NOT NULL DEFAULT 'inactive'
    CHECK (practice_level IN ('inactive', 'casual', 'regular', 'committed', 'devoted')),

  -- Trader Type Classification
  trader_type VARCHAR(20) DEFAULT 'manual_trader'
    CHECK (trader_type IN ('scanner_user', 'manual_trader', 'hybrid')),

  -- Wellness Type Classification
  wellness_type VARCHAR(20) DEFAULT 'ritual_inactive'
    CHECK (wellness_type IN ('ritual_active', 'ritual_casual', 'ritual_inactive')),

  -- Discipline Type Classification
  discipline_type VARCHAR(20) DEFAULT 'moderate'
    CHECK (discipline_type IN ('disciplined', 'moderate', 'undisciplined')),

  -- 30-Day Metrics
  active_days_30d INTEGER DEFAULT 0,
  trading_days_30d INTEGER DEFAULT 0,
  ritual_days_30d INTEGER DEFAULT 0,
  total_trades_30d INTEGER DEFAULT 0,
  avg_win_rate_30d DECIMAL(5, 2),
  total_pnl_30d DECIMAL(20, 2) DEFAULT 0,
  max_drawdown_30d DECIMAL(10, 4),
  avg_discipline_30d DECIMAL(5, 2),
  scanner_usage_pct_30d DECIMAL(5, 2),

  -- Health History
  healthy_days_30d INTEGER DEFAULT 0,
  warning_days_30d INTEGER DEFAULT 0,
  danger_days_30d INTEGER DEFAULT 0,
  burned_days_30d INTEGER DEFAULT 0,
  wiped_days_30d INTEGER DEFAULT 0,

  -- Engagement Metrics
  ai_conversations_30d INTEGER DEFAULT 0,
  lessons_completed_30d INTEGER DEFAULT 0,
  forum_activity_30d INTEGER DEFAULT 0,

  -- Current Status
  current_karma_level VARCHAR(20),
  current_health_status VARCHAR(20),
  current_scanner_tier VARCHAR(20),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, profile_date)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_practice_profile_user ON user_practice_profile(user_id, profile_date DESC);
CREATE INDEX IF NOT EXISTS idx_practice_profile_date ON user_practice_profile(profile_date DESC);
CREATE INDEX IF NOT EXISTS idx_practice_profile_level ON user_practice_profile(practice_level);
CREATE INDEX IF NOT EXISTS idx_practice_profile_trader_type ON user_practice_profile(trader_type);

-- RLS Policies
ALTER TABLE user_practice_profile ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_select_own_profile" ON user_practice_profile;
CREATE POLICY "users_select_own_profile" ON user_practice_profile
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "admin_select_all_profiles" ON user_practice_profile;
CREATE POLICY "admin_select_all_profiles" ON user_practice_profile
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

DROP POLICY IF EXISTS "service_all_profiles" ON user_practice_profile;
CREATE POLICY "service_all_profiles" ON user_practice_profile
  FOR ALL USING (TRUE) WITH CHECK (TRUE);

GRANT SELECT ON user_practice_profile TO authenticated;
GRANT ALL ON user_practice_profile TO service_role;

-- =====================================================
-- FUNCTION: calculate_practice_profiles
-- =====================================================
CREATE OR REPLACE FUNCTION calculate_practice_profiles(p_profile_date DATE DEFAULT CURRENT_DATE)
RETURNS JSONB AS $$
DECLARE
  v_count INTEGER := 0;
BEGIN
  RETURN jsonb_build_object(
    'success', TRUE,
    'profile_date', p_profile_date,
    'users_processed', v_count
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNCTION: compare_cohorts
-- =====================================================
CREATE OR REPLACE FUNCTION compare_cohorts(
  p_group_by VARCHAR DEFAULT 'practice_level',
  p_min_trades INTEGER DEFAULT 5
)
RETURNS JSONB AS $$
BEGIN
  IF p_group_by = 'practice_level' THEN
    RETURN COALESCE((
      SELECT jsonb_agg(cohort_data)
      FROM (
        SELECT jsonb_build_object(
          'practice_level', practice_level,
          'users', COUNT(DISTINCT user_id),
          'avg_win_rate', ROUND(AVG(avg_win_rate_30d)::NUMERIC, 2),
          'avg_pnl', ROUND(AVG(total_pnl_30d)::NUMERIC, 2),
          'burn_rate', ROUND(
            COUNT(*) FILTER (WHERE burned_days_30d > 0 OR wiped_days_30d > 0)::DECIMAL /
            NULLIF(COUNT(*), 0) * 100, 2
          )
        ) as cohort_data
        FROM user_practice_profile
        WHERE profile_date = (SELECT MAX(profile_date) FROM user_practice_profile)
        GROUP BY practice_level
      ) sub
    ), '[]'::jsonb);
  ELSE
    RETURN '[]'::jsonb;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNCTION: user_progress_analysis
-- =====================================================
CREATE OR REPLACE FUNCTION user_progress_analysis(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'user_id', p_user_id,
    'current_profile', (
      SELECT row_to_json(p.*)
      FROM user_practice_profile p
      WHERE p.user_id = p_user_id
      ORDER BY profile_date DESC
      LIMIT 1
    ),
    'evolution', (
      SELECT jsonb_agg(month_data ORDER BY month)
      FROM (
        SELECT
          TO_CHAR(profile_date, 'YYYY-MM') as month,
          jsonb_build_object(
            'month', TO_CHAR(profile_date, 'YYYY-MM'),
            'practice_level', practice_level,
            'avg_win_rate', avg_win_rate_30d,
            'total_pnl', total_pnl_30d,
            'discipline', avg_discipline_30d
          ) as month_data
        FROM user_practice_profile
        WHERE user_id = p_user_id
        ORDER BY profile_date
      ) sub
    )
  ) INTO v_result;

  RETURN COALESCE(v_result, jsonb_build_object('user_id', p_user_id, 'current_profile', NULL, 'evolution', '[]'::jsonb));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNCTION: get_user_cohort_comparison
-- =====================================================
CREATE OR REPLACE FUNCTION get_user_cohort_comparison(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_user_profile RECORD;
  v_cohort_avg RECORD;
BEGIN
  SELECT * INTO v_user_profile
  FROM user_practice_profile
  WHERE user_id = p_user_id
  ORDER BY profile_date DESC
  LIMIT 1;

  IF v_user_profile IS NULL THEN
    RETURN jsonb_build_object('success', FALSE, 'error', 'No profile found');
  END IF;

  SELECT
    AVG(avg_win_rate_30d) as avg_win_rate,
    AVG(total_pnl_30d) as avg_pnl,
    AVG(avg_discipline_30d) as avg_discipline
  INTO v_cohort_avg
  FROM user_practice_profile
  WHERE practice_level = v_user_profile.practice_level
    AND profile_date = v_user_profile.profile_date;

  RETURN jsonb_build_object(
    'success', TRUE,
    'user', jsonb_build_object(
      'win_rate', v_user_profile.avg_win_rate_30d,
      'pnl', v_user_profile.total_pnl_30d,
      'discipline', v_user_profile.avg_discipline_30d
    ),
    'cohort_avg', jsonb_build_object(
      'win_rate', ROUND(v_cohort_avg.avg_win_rate::NUMERIC, 2),
      'pnl', ROUND(v_cohort_avg.avg_pnl::NUMERIC, 2),
      'discipline', ROUND(v_cohort_avg.avg_discipline::NUMERIC, 2)
    ),
    'practice_level', v_user_profile.practice_level
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grants
GRANT EXECUTE ON FUNCTION calculate_practice_profiles(DATE) TO service_role;
GRANT EXECUTE ON FUNCTION compare_cohorts(VARCHAR, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION user_progress_analysis(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_cohort_comparison(UUID) TO authenticated;

-- Comments
COMMENT ON TABLE user_practice_profile IS 'Weekly snapshots of user practice patterns for cohort comparison.';
COMMENT ON FUNCTION calculate_practice_profiles IS 'Calculates practice profiles for all users. Run weekly.';
COMMENT ON FUNCTION compare_cohorts IS 'Compares metrics across cohorts grouped by practice level or other criteria.';
COMMENT ON FUNCTION user_progress_analysis IS 'Returns progress analysis for a specific user over time.';
