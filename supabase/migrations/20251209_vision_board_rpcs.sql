-- ============================================
-- VISION BOARD 2.0 - RPC Functions
-- Created: December 9, 2025
-- Purpose: Dashboard data aggregation functions
-- ============================================

-- ============================================
-- Function: Get Life Area Scores (for Radar Chart)
-- Returns progress scores for each life area (0-100)
-- ============================================
CREATE OR REPLACE FUNCTION get_life_area_scores(p_user_id UUID)
RETURNS TABLE (
  life_area VARCHAR(50),
  score INTEGER,
  total_widgets INTEGER,
  completed_widgets INTEGER,
  active_goals INTEGER,
  completed_goals INTEGER
) AS $$
BEGIN
  RETURN QUERY
  WITH area_stats AS (
    SELECT
      COALESCE(w.content->>'life_area', 'personal') AS area,
      COUNT(*) AS total,
      COUNT(*) FILTER (WHERE w.is_completed = TRUE) AS completed,
      COUNT(*) FILTER (WHERE w.widget_type = 'goal' AND w.is_completed = FALSE) AS active_g,
      COUNT(*) FILTER (WHERE w.widget_type = 'goal' AND w.is_completed = TRUE) AS completed_g
    FROM vision_board_widgets w
    WHERE w.user_id = p_user_id
    GROUP BY COALESCE(w.content->>'life_area', 'personal')
  ),
  all_areas AS (
    SELECT unnest(ARRAY['finance', 'career', 'health', 'relationships', 'personal', 'spiritual']) AS area_name
  )
  SELECT
    a.area_name::VARCHAR(50) AS life_area,
    COALESCE(
      CASE
        WHEN s.total > 0 THEN ((s.completed::DECIMAL / s.total) * 100)::INTEGER
        ELSE 0
      END, 0
    ) AS score,
    COALESCE(s.total, 0)::INTEGER AS total_widgets,
    COALESCE(s.completed, 0)::INTEGER AS completed_widgets,
    COALESCE(s.active_g, 0)::INTEGER AS active_goals,
    COALESCE(s.completed_g, 0)::INTEGER AS completed_goals
  FROM all_areas a
  LEFT JOIN area_stats s ON a.area_name = s.area;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Function: Get Weekly Progress (for Bar Chart)
-- Returns daily completion stats for last 7 days
-- ============================================
CREATE OR REPLACE FUNCTION get_weekly_progress(p_user_id UUID)
RETURNS TABLE (
  day_date DATE,
  day_name VARCHAR(10),
  actions_completed INTEGER,
  affirmations_completed INTEGER,
  habits_completed INTEGER,
  total_score INTEGER,
  xp_earned INTEGER
) AS $$
BEGIN
  RETURN QUERY
  WITH dates AS (
    SELECT generate_series(
      CURRENT_DATE - INTERVAL '6 days',
      CURRENT_DATE,
      INTERVAL '1 day'
    )::DATE AS d
  ),
  daily_stats AS (
    SELECT
      dc.completion_date,
      dc.actions_done,
      dc.affirmations_done,
      dc.habits_done,
      dc.combo_count,
      COALESCE(dc.xp_earned, 0) AS xp
    FROM daily_completions dc
    WHERE dc.user_id = p_user_id
      AND dc.completion_date >= CURRENT_DATE - INTERVAL '6 days'
  )
  SELECT
    dates.d AS day_date,
    to_char(dates.d, 'Dy')::VARCHAR(10) AS day_name,
    COALESCE(ds.actions_done, 0)::INTEGER AS actions_completed,
    COALESCE(ds.affirmations_done, 0)::INTEGER AS affirmations_completed,
    COALESCE(ds.habits_done, 0)::INTEGER AS habits_completed,
    (
      COALESCE(ds.actions_done, 0) * 60 +
      COALESCE(ds.affirmations_done, 0) * 20 +
      COALESCE(ds.habits_done, 0) * 20
    )::INTEGER AS total_score,
    COALESCE(ds.xp, 0)::INTEGER AS xp_earned
  FROM dates
  LEFT JOIN daily_stats ds ON dates.d = ds.completion_date
  ORDER BY dates.d;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Function: Get Vision Today Overview
-- Returns all dashboard data in one call
-- ============================================
CREATE OR REPLACE FUNCTION get_vision_today_overview(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
  v_today_stats RECORD;
  v_streak_data RECORD;
  v_level_data RECORD;
  v_today_tasks JSONB;
  v_affirmations JSONB;
BEGIN
  -- Get today's completion stats
  SELECT
    COALESCE(actions_done, 0) AS actions,
    COALESCE(affirmations_done, 0) AS affirmations,
    COALESCE(habits_done, 0) AS habits,
    COALESCE(combo_count, 0) AS combo,
    COALESCE(xp_earned, 0) AS xp
  INTO v_today_stats
  FROM daily_completions
  WHERE user_id = p_user_id
    AND completion_date = CURRENT_DATE;

  -- If no record for today, use defaults
  IF NOT FOUND THEN
    v_today_stats := ROW(0, 0, 0, 0, 0);
  END IF;

  -- Get streak data
  SELECT
    COALESCE(current_streak, 0) AS current,
    COALESCE(longest_streak, 0) AS longest,
    COALESCE(freeze_count, 0) AS freezes,
    last_active_date
  INTO v_streak_data
  FROM user_streaks
  WHERE user_id = p_user_id;

  IF NOT FOUND THEN
    v_streak_data := ROW(0, 0, 0, NULL);
  END IF;

  -- Get level/XP data
  SELECT
    COALESCE(SUM(xp_earned), 0) AS total_xp
  INTO v_level_data
  FROM daily_completions
  WHERE user_id = p_user_id;

  -- Get today's tasks (actions due today)
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'id', w.id,
      'title', w.content->>'title',
      'type', w.widget_type,
      'is_completed', w.is_completed,
      'xp_reward', COALESCE((w.content->>'xp_reward')::INTEGER, 20),
      'life_area', w.content->>'life_area'
    )
  ), '[]'::JSONB) INTO v_today_tasks
  FROM vision_board_widgets w
  WHERE w.user_id = p_user_id
    AND w.widget_type = 'action'
    AND (
      w.content->>'due_date' = CURRENT_DATE::TEXT
      OR w.content->>'due_date' IS NULL
    )
    AND w.is_completed = FALSE
  LIMIT 10;

  -- Get today's affirmations
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'id', w.id,
      'text', w.content->>'text',
      'is_completed', COALESCE((w.content->>'completed_today')::BOOLEAN, FALSE),
      'xp_reward', 5
    )
  ), '[]'::JSONB) INTO v_affirmations
  FROM vision_board_widgets w
  WHERE w.user_id = p_user_id
    AND w.widget_type = 'affirmation'
    AND w.is_completed = FALSE
  LIMIT 5;

  -- Build result
  v_result := jsonb_build_object(
    'today', jsonb_build_object(
      'date', CURRENT_DATE,
      'actions_completed', v_today_stats.actions,
      'affirmations_completed', v_today_stats.affirmations,
      'habits_completed', v_today_stats.habits,
      'combo_count', v_today_stats.combo,
      'xp_earned', v_today_stats.xp,
      'daily_score', (
        v_today_stats.actions * 60 +
        v_today_stats.affirmations * 20 +
        v_today_stats.habits * 20
      )
    ),
    'streak', jsonb_build_object(
      'current', v_streak_data.current,
      'longest', v_streak_data.longest,
      'freezes_available', v_streak_data.freezes,
      'last_active', v_streak_data.last_active_date
    ),
    'level', jsonb_build_object(
      'total_xp', COALESCE(v_level_data.total_xp, 0),
      'current_level', calculate_level(COALESCE(v_level_data.total_xp, 0)::INTEGER),
      'xp_to_next', calculate_xp_to_next_level(COALESCE(v_level_data.total_xp, 0)::INTEGER)
    ),
    'today_tasks', v_today_tasks,
    'affirmations', v_affirmations
  );

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Helper Function: Calculate Level from XP
-- ============================================
CREATE OR REPLACE FUNCTION calculate_level(p_total_xp INTEGER)
RETURNS INTEGER AS $$
DECLARE
  v_level INTEGER := 1;
  v_thresholds INTEGER[] := ARRAY[0, 100, 300, 600, 1000, 1500, 2200, 3000, 4000, 5500, 7500, 10000];
BEGIN
  FOR i IN 1..array_length(v_thresholds, 1) LOOP
    IF p_total_xp >= v_thresholds[i] THEN
      v_level := i;
    ELSE
      EXIT;
    END IF;
  END LOOP;
  RETURN v_level;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================
-- Helper Function: Calculate XP to Next Level
-- ============================================
CREATE OR REPLACE FUNCTION calculate_xp_to_next_level(p_total_xp INTEGER)
RETURNS INTEGER AS $$
DECLARE
  v_thresholds INTEGER[] := ARRAY[0, 100, 300, 600, 1000, 1500, 2200, 3000, 4000, 5500, 7500, 10000];
  v_current_level INTEGER;
BEGIN
  v_current_level := calculate_level(p_total_xp);

  IF v_current_level >= array_length(v_thresholds, 1) THEN
    RETURN 0; -- Max level reached
  END IF;

  RETURN v_thresholds[v_current_level + 1] - p_total_xp;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================
-- Function: Get Goals with Progress
-- ============================================
CREATE OR REPLACE FUNCTION get_goals_with_progress(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  life_area TEXT,
  deadline DATE,
  progress INTEGER,
  is_completed BOOLEAN,
  actions_total INTEGER,
  actions_completed INTEGER,
  milestones JSONB,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    g.id,
    g.content->>'title' AS title,
    g.content->>'description' AS description,
    g.content->>'life_area' AS life_area,
    (g.content->>'deadline')::DATE AS deadline,
    COALESCE((g.content->>'progress')::INTEGER, 0) AS progress,
    g.is_completed,
    (
      SELECT COUNT(*)::INTEGER
      FROM vision_board_widgets a
      WHERE a.user_id = p_user_id
        AND a.widget_type = 'action'
        AND a.content->>'goal_id' = g.id::TEXT
    ) AS actions_total,
    (
      SELECT COUNT(*)::INTEGER
      FROM vision_board_widgets a
      WHERE a.user_id = p_user_id
        AND a.widget_type = 'action'
        AND a.content->>'goal_id' = g.id::TEXT
        AND a.is_completed = TRUE
    ) AS actions_completed,
    COALESCE(g.content->'milestones', '[]'::JSONB) AS milestones,
    g.created_at
  FROM vision_board_widgets g
  WHERE g.user_id = p_user_id
    AND g.widget_type = 'goal'
  ORDER BY g.is_completed ASC, (g.content->>'deadline')::DATE NULLS LAST;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Function: Get Stats Overview
-- ============================================
CREATE OR REPLACE FUNCTION get_stats_overview(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
  v_total_goals INTEGER;
  v_completed_goals INTEGER;
  v_total_actions INTEGER;
  v_completed_actions INTEGER;
  v_total_affirmations INTEGER;
  v_total_habits INTEGER;
  v_total_xp INTEGER;
  v_perfect_days INTEGER;
BEGIN
  -- Count goals
  SELECT
    COUNT(*),
    COUNT(*) FILTER (WHERE is_completed = TRUE)
  INTO v_total_goals, v_completed_goals
  FROM vision_board_widgets
  WHERE user_id = p_user_id AND widget_type = 'goal';

  -- Count actions
  SELECT
    COUNT(*),
    COUNT(*) FILTER (WHERE is_completed = TRUE)
  INTO v_total_actions, v_completed_actions
  FROM vision_board_widgets
  WHERE user_id = p_user_id AND widget_type = 'action';

  -- Count affirmations
  SELECT COUNT(*)
  INTO v_total_affirmations
  FROM vision_board_widgets
  WHERE user_id = p_user_id AND widget_type = 'affirmation';

  -- Count habits
  SELECT COUNT(*)
  INTO v_total_habits
  FROM vision_board_widgets
  WHERE user_id = p_user_id AND widget_type = 'habit';

  -- Total XP
  SELECT COALESCE(SUM(xp_earned), 0)
  INTO v_total_xp
  FROM daily_completions
  WHERE user_id = p_user_id;

  -- Perfect days (all tasks completed)
  SELECT COUNT(*)
  INTO v_perfect_days
  FROM daily_completions
  WHERE user_id = p_user_id
    AND actions_done > 0
    AND affirmations_done > 0
    AND habits_done > 0;

  v_result := jsonb_build_object(
    'goals', jsonb_build_object(
      'total', v_total_goals,
      'completed', v_completed_goals,
      'completion_rate', CASE WHEN v_total_goals > 0
        THEN ROUND((v_completed_goals::DECIMAL / v_total_goals) * 100)
        ELSE 0
      END
    ),
    'actions', jsonb_build_object(
      'total', v_total_actions,
      'completed', v_completed_actions,
      'completion_rate', CASE WHEN v_total_actions > 0
        THEN ROUND((v_completed_actions::DECIMAL / v_total_actions) * 100)
        ELSE 0
      END
    ),
    'affirmations', jsonb_build_object(
      'total', v_total_affirmations
    ),
    'habits', jsonb_build_object(
      'total', v_total_habits
    ),
    'xp', jsonb_build_object(
      'total', v_total_xp,
      'level', calculate_level(v_total_xp)
    ),
    'perfect_days', v_perfect_days
  );

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_life_area_scores TO authenticated;
GRANT EXECUTE ON FUNCTION get_weekly_progress TO authenticated;
GRANT EXECUTE ON FUNCTION get_vision_today_overview TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_level TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_xp_to_next_level TO authenticated;
GRANT EXECUTE ON FUNCTION get_goals_with_progress TO authenticated;
GRANT EXECUTE ON FUNCTION get_stats_overview TO authenticated;
