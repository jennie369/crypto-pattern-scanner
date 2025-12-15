-- ============================================================
-- Migration: Action Plan RPC Functions ONLY
-- Date: December 11, 2025
-- Description: Only RPC functions (skip table/policy creation)
-- ============================================================

-- Function to reset actions for a user (called daily)
CREATE OR REPLACE FUNCTION reset_user_actions(p_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_today DATE := CURRENT_DATE;
  v_reset_count INTEGER := 0;
  v_action RECORD;
  v_days_since_reset INTEGER;
BEGIN
  -- Loop through all non-one_time actions that are completed
  FOR v_action IN
    SELECT * FROM vision_actions
    WHERE user_id = p_user_id
    AND action_type != 'one_time'
    AND is_completed = true
  LOOP
    -- Calculate days since last reset
    v_days_since_reset := v_today - COALESCE(v_action.last_reset_date, v_action.created_at::date);

    -- Check if should reset based on action_type
    IF (v_action.action_type = 'daily' AND v_days_since_reset >= 1) OR
       (v_action.action_type = 'weekly' AND v_days_since_reset >= 7) OR
       (v_action.action_type = 'monthly' AND v_days_since_reset >= 30) OR
       (v_action.action_type = 'custom' AND v_days_since_reset >= COALESCE(v_action.recurrence_days, 1))
    THEN
      -- Reset the action
      UPDATE vision_actions
      SET is_completed = false,
          last_reset_date = v_today
      WHERE id = v_action.id;

      v_reset_count := v_reset_count + 1;
    END IF;
  END LOOP;

  RETURN json_build_object(
    'success', true,
    'reset_count', v_reset_count,
    'reset_date', v_today
  );
END;
$$;

-- Function to complete an action with XP tracking
CREATE OR REPLACE FUNCTION complete_action_with_xp(
  p_user_id UUID,
  p_action_id UUID,
  p_xp_amount INTEGER DEFAULT 20
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_today DATE := CURRENT_DATE;
  v_action RECORD;
  v_existing_log UUID;
  v_goal_id UUID;
BEGIN
  -- Get action details
  SELECT * INTO v_action
  FROM vision_actions
  WHERE id = p_action_id AND user_id = p_user_id;

  IF v_action IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Action not found');
  END IF;

  v_goal_id := v_action.goal_id;

  -- Check if already logged today
  SELECT id INTO v_existing_log
  FROM vision_action_logs
  WHERE action_id = p_action_id AND completed_date = v_today;

  IF v_existing_log IS NOT NULL THEN
    -- Already completed today, just update UI state
    UPDATE vision_actions
    SET is_completed = true, completed_date = v_today
    WHERE id = p_action_id;

    RETURN json_build_object(
      'success', true,
      'already_logged', true,
      'xp_earned', 0
    );
  END IF;

  -- Update action as completed
  UPDATE vision_actions
  SET is_completed = true,
      completed_date = v_today
  WHERE id = p_action_id;

  -- Create completion log
  INSERT INTO vision_action_logs (user_id, action_id, goal_id, completed_date, xp_earned)
  VALUES (p_user_id, p_action_id, v_goal_id, v_today, p_xp_amount);

  -- Update user XP in profiles (if column exists)
  UPDATE profiles
  SET total_xp = COALESCE(total_xp, 0) + p_xp_amount
  WHERE id = p_user_id;

  RETURN json_build_object(
    'success', true,
    'already_logged', false,
    'xp_earned', p_xp_amount,
    'goal_id', v_goal_id
  );
END;
$$;

-- Function to uncomplete an action
CREATE OR REPLACE FUNCTION uncomplete_action(
  p_user_id UUID,
  p_action_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_today DATE := CURRENT_DATE;
  v_log RECORD;
BEGIN
  -- Update action as not completed
  UPDATE vision_actions
  SET is_completed = false
  WHERE id = p_action_id AND user_id = p_user_id;

  -- Get today's log to refund XP
  SELECT * INTO v_log
  FROM vision_action_logs
  WHERE action_id = p_action_id AND completed_date = v_today;

  IF v_log IS NOT NULL THEN
    -- Refund XP
    UPDATE profiles
    SET total_xp = GREATEST(0, COALESCE(total_xp, 0) - v_log.xp_earned)
    WHERE id = p_user_id;

    -- Delete log
    DELETE FROM vision_action_logs
    WHERE action_id = p_action_id AND completed_date = v_today;
  END IF;

  RETURN json_build_object('success', true);
END;
$$;

-- Function to get actions grouped by type for a goal
CREATE OR REPLACE FUNCTION get_goal_actions_grouped(
  p_user_id UUID,
  p_goal_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_daily JSON;
  v_weekly JSON;
  v_monthly JSON;
  v_one_time_pending JSON;
  v_one_time_completed JSON;
BEGIN
  -- Daily actions
  SELECT COALESCE(json_agg(row_to_json(a) ORDER BY a.created_at), '[]'::json) INTO v_daily
  FROM vision_actions a
  WHERE a.user_id = p_user_id AND a.goal_id = p_goal_id AND a.action_type = 'daily';

  -- Weekly actions
  SELECT COALESCE(json_agg(row_to_json(a) ORDER BY a.created_at), '[]'::json) INTO v_weekly
  FROM vision_actions a
  WHERE a.user_id = p_user_id AND a.goal_id = p_goal_id AND a.action_type = 'weekly';

  -- Monthly actions
  SELECT COALESCE(json_agg(row_to_json(a) ORDER BY a.created_at), '[]'::json) INTO v_monthly
  FROM vision_actions a
  WHERE a.user_id = p_user_id AND a.goal_id = p_goal_id AND a.action_type = 'monthly';

  -- One-time pending
  SELECT COALESCE(json_agg(row_to_json(a) ORDER BY a.created_at), '[]'::json) INTO v_one_time_pending
  FROM vision_actions a
  WHERE a.user_id = p_user_id AND a.goal_id = p_goal_id
    AND a.action_type = 'one_time' AND a.is_completed = false;

  -- One-time completed
  SELECT COALESCE(json_agg(row_to_json(a) ORDER BY a.completed_date DESC), '[]'::json) INTO v_one_time_completed
  FROM vision_actions a
  WHERE a.user_id = p_user_id AND a.goal_id = p_goal_id
    AND a.action_type = 'one_time' AND a.is_completed = true;

  RETURN json_build_object(
    'daily', v_daily,
    'weekly', v_weekly,
    'monthly', v_monthly,
    'one_time_pending', v_one_time_pending,
    'one_time_completed', v_one_time_completed
  );
END;
$$;

-- Function to get today's completable actions for dashboard
CREATE OR REPLACE FUNCTION get_today_actions(p_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_today DATE := CURRENT_DATE;
  v_actions JSON;
BEGIN
  SELECT COALESCE(json_agg(
    json_build_object(
      'id', a.id,
      'title', a.title,
      'action_type', a.action_type,
      'is_completed', a.is_completed,
      'goal_id', a.goal_id,
      'goal_title', g.title,
      'goal_life_area', g.life_area
    )
  ), '[]'::json) INTO v_actions
  FROM vision_actions a
  LEFT JOIN vision_goals g ON g.id = a.goal_id
  WHERE a.user_id = p_user_id
    AND (
      -- Uncompleted actions
      a.is_completed = false
      OR
      -- Daily actions completed today (show for reference)
      (a.action_type = 'daily' AND a.completed_date = v_today)
    )
    AND a.action_type != 'one_time' -- Exclude completed one-time
  ORDER BY a.is_completed, a.action_type, a.created_at;

  RETURN v_actions;
END;
$$;

-- Function to get action completion stats
CREATE OR REPLACE FUNCTION get_action_stats(
  p_user_id UUID,
  p_days INTEGER DEFAULT 7
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_start_date DATE := CURRENT_DATE - p_days;
  v_total_completed INTEGER;
  v_total_xp INTEGER;
  v_daily_stats JSON;
BEGIN
  -- Total completed in period
  SELECT COUNT(*), COALESCE(SUM(xp_earned), 0)
  INTO v_total_completed, v_total_xp
  FROM vision_action_logs
  WHERE user_id = p_user_id AND completed_date >= v_start_date;

  -- Daily breakdown
  SELECT COALESCE(json_agg(
    json_build_object(
      'date', d.date,
      'completed_count', COALESCE(l.count, 0),
      'xp_earned', COALESCE(l.xp, 0)
    )
  ), '[]'::json) INTO v_daily_stats
  FROM (
    SELECT generate_series(v_start_date, CURRENT_DATE, '1 day'::interval)::date AS date
  ) d
  LEFT JOIN (
    SELECT completed_date, COUNT(*) as count, SUM(xp_earned) as xp
    FROM vision_action_logs
    WHERE user_id = p_user_id AND completed_date >= v_start_date
    GROUP BY completed_date
  ) l ON l.completed_date = d.date
  ORDER BY d.date;

  RETURN json_build_object(
    'total_completed', v_total_completed,
    'total_xp', v_total_xp,
    'daily_stats', v_daily_stats,
    'period_days', p_days
  );
END;
$$;

-- ============ GRANT PERMISSIONS ============

GRANT EXECUTE ON FUNCTION reset_user_actions(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION complete_action_with_xp(UUID, UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION uncomplete_action(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_goal_actions_grouped(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_today_actions(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_action_stats(UUID, INTEGER) TO authenticated;

-- Done!
SELECT 'RPC Functions created successfully!' as status;
