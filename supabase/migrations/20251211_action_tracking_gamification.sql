-- =====================================================
-- ACTION TRACKING FOR GAMIFICATION SYSTEM
-- December 11, 2025
--
-- Adds 'action' as a 4th tracking category alongside
-- affirmation, habit, goal
-- =====================================================

-- 0. Drop existing functions that need return type changes
DROP FUNCTION IF EXISTS get_habit_grid_data(UUID, INTEGER);
DROP FUNCTION IF EXISTS get_daily_completion_status(UUID);
DROP FUNCTION IF EXISTS track_daily_completion(UUID, TEXT);
DROP FUNCTION IF EXISTS update_streak(UUID, TEXT);

-- 1. Add action_done column to daily_completions table
ALTER TABLE daily_completions
ADD COLUMN IF NOT EXISTS action_done BOOLEAN DEFAULT FALSE;

-- 2. Update the combo calculation to include action
-- Combo count now goes from 0-4 instead of 0-3
COMMENT ON TABLE daily_completions IS 'Daily completion tracking for 4 categories: affirmation, habit, goal, action';

-- 3. Update or replace the track_daily_completion function
CREATE OR REPLACE FUNCTION track_daily_completion(
  p_user_id UUID,
  p_category TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_today DATE := CURRENT_DATE;
  v_record daily_completions%ROWTYPE;
  v_combo_count INTEGER := 0;
  v_multiplier NUMERIC := 1.0;
  v_is_full_combo BOOLEAN := FALSE;
  v_is_full_combo_4 BOOLEAN := FALSE;
  v_streak_updated BOOLEAN := FALSE;
BEGIN
  -- Validate category
  IF p_category NOT IN ('affirmation', 'habit', 'goal', 'action') THEN
    RAISE EXCEPTION 'Invalid category: %. Must be affirmation, habit, goal, or action', p_category;
  END IF;

  -- Get or create today's record
  INSERT INTO daily_completions (user_id, completion_date, affirmation_done, habit_done, goal_done, action_done)
  VALUES (p_user_id, v_today, FALSE, FALSE, FALSE, FALSE)
  ON CONFLICT (user_id, completion_date) DO NOTHING;

  -- Update the specific category
  EXECUTE format(
    'UPDATE daily_completions SET %I = TRUE, updated_at = NOW() WHERE user_id = $1 AND completion_date = $2',
    p_category || '_done'
  ) USING p_user_id, v_today;

  -- Get updated record
  SELECT * INTO v_record
  FROM daily_completions
  WHERE user_id = p_user_id AND completion_date = v_today;

  -- Calculate combo count (0-4)
  v_combo_count := 0;
  IF v_record.affirmation_done THEN v_combo_count := v_combo_count + 1; END IF;
  IF v_record.habit_done THEN v_combo_count := v_combo_count + 1; END IF;
  IF v_record.goal_done THEN v_combo_count := v_combo_count + 1; END IF;
  IF v_record.action_done THEN v_combo_count := v_combo_count + 1; END IF;

  -- Calculate multiplier (x1 → x1.25 → x1.5 → x1.75 → x2)
  v_multiplier := CASE v_combo_count
    WHEN 1 THEN 1.0
    WHEN 2 THEN 1.25
    WHEN 3 THEN 1.5
    WHEN 4 THEN 2.0  -- Perfect day bonus!
    ELSE 1.0
  END;

  -- Check if full combo (3 categories - legacy compatibility)
  v_is_full_combo := (v_record.affirmation_done AND v_record.habit_done AND v_record.goal_done);

  -- Check if full combo 4 (all 4 categories)
  v_is_full_combo_4 := (v_record.affirmation_done AND v_record.habit_done AND v_record.goal_done AND v_record.action_done);

  -- Update combo count in record
  UPDATE daily_completions
  SET combo_count = v_combo_count,
      multiplier = v_multiplier,
      updated_at = NOW()
  WHERE user_id = p_user_id AND completion_date = v_today;

  -- Update streak for this category
  PERFORM update_streak(p_user_id, p_category);

  -- Update combo streak if full combo achieved
  IF v_is_full_combo OR v_is_full_combo_4 THEN
    PERFORM update_streak(p_user_id, 'combo');
  END IF;

  -- Return result
  RETURN jsonb_build_object(
    'success', TRUE,
    'category', p_category,
    'combo_count', v_combo_count,
    'multiplier', v_multiplier,
    'is_full_combo', v_is_full_combo,
    'is_full_combo_4', v_is_full_combo_4,
    'affirmation_done', v_record.affirmation_done,
    'habit_done', v_record.habit_done,
    'goal_done', v_record.goal_done,
    'action_done', v_record.action_done
  );
END;
$$;

-- 4. Update the get_daily_completion_status function
CREATE OR REPLACE FUNCTION get_daily_completion_status(
  p_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_today DATE := CURRENT_DATE;
  v_record daily_completions%ROWTYPE;
BEGIN
  -- Get today's record or return defaults
  SELECT * INTO v_record
  FROM daily_completions
  WHERE user_id = p_user_id AND completion_date = v_today;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'affirmation_done', FALSE,
      'habit_done', FALSE,
      'goal_done', FALSE,
      'action_done', FALSE,
      'combo_count', 0,
      'multiplier', 1.0
    );
  END IF;

  RETURN jsonb_build_object(
    'affirmation_done', COALESCE(v_record.affirmation_done, FALSE),
    'habit_done', COALESCE(v_record.habit_done, FALSE),
    'goal_done', COALESCE(v_record.goal_done, FALSE),
    'action_done', COALESCE(v_record.action_done, FALSE),
    'combo_count', COALESCE(v_record.combo_count, 0),
    'multiplier', COALESCE(v_record.multiplier, 1.0)
  );
END;
$$;

-- 5. Update the get_habit_grid_data function to include action
CREATE OR REPLACE FUNCTION get_habit_grid_data(
  p_user_id UUID,
  p_days INTEGER DEFAULT 35
)
RETURNS TABLE (
  completion_date DATE,
  affirmation_done BOOLEAN,
  habit_done BOOLEAN,
  goal_done BOOLEAN,
  action_done BOOLEAN,
  combo_count INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    dc.completion_date,
    COALESCE(dc.affirmation_done, FALSE),
    COALESCE(dc.habit_done, FALSE),
    COALESCE(dc.goal_done, FALSE),
    COALESCE(dc.action_done, FALSE),
    COALESCE(dc.combo_count, 0)
  FROM daily_completions dc
  WHERE dc.user_id = p_user_id
    AND dc.completion_date >= CURRENT_DATE - p_days
  ORDER BY dc.completion_date DESC;
END;
$$;

-- 6. Update the update_streak function to handle 'action' type
CREATE OR REPLACE FUNCTION update_streak(
  p_user_id UUID,
  p_streak_type TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_today DATE := CURRENT_DATE;
  v_yesterday DATE := CURRENT_DATE - 1;
  v_current_streak INTEGER := 0;
  v_longest_streak INTEGER := 0;
  v_total_completions INTEGER := 0;
  v_last_completion DATE;
BEGIN
  -- Validate streak type
  IF p_streak_type NOT IN ('affirmation', 'habit', 'goal', 'action', 'combo') THEN
    RAISE EXCEPTION 'Invalid streak type: %', p_streak_type;
  END IF;

  -- Get current streak data
  SELECT current_streak, longest_streak, total_completions, last_completion_date
  INTO v_current_streak, v_longest_streak, v_total_completions, v_last_completion
  FROM user_streaks
  WHERE user_id = p_user_id AND streak_type = p_streak_type;

  IF NOT FOUND THEN
    -- Create new streak record
    INSERT INTO user_streaks (user_id, streak_type, current_streak, longest_streak, total_completions, last_completion_date)
    VALUES (p_user_id, p_streak_type, 1, 1, 1, v_today);
    RETURN;
  END IF;

  -- Already completed today
  IF v_last_completion = v_today THEN
    RETURN;
  END IF;

  -- Increment total completions
  v_total_completions := v_total_completions + 1;

  -- Check if streak continues
  IF v_last_completion = v_yesterday THEN
    -- Streak continues
    v_current_streak := v_current_streak + 1;
    IF v_current_streak > v_longest_streak THEN
      v_longest_streak := v_current_streak;
    END IF;
  ELSE
    -- Streak broken, start new one
    v_current_streak := 1;
  END IF;

  -- Update streak record
  UPDATE user_streaks
  SET current_streak = v_current_streak,
      longest_streak = v_longest_streak,
      total_completions = v_total_completions,
      last_completion_date = v_today,
      updated_at = NOW()
  WHERE user_id = p_user_id AND streak_type = p_streak_type;
END;
$$;

-- 7. Ensure daily_completions has multiplier column
ALTER TABLE daily_completions
ADD COLUMN IF NOT EXISTS multiplier NUMERIC DEFAULT 1.0;

-- 8. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_daily_completions_user_date
ON daily_completions(user_id, completion_date);

CREATE INDEX IF NOT EXISTS idx_user_streaks_user_type
ON user_streaks(user_id, streak_type);

-- 9. Grant execute permissions
GRANT EXECUTE ON FUNCTION track_daily_completion(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_daily_completion_status(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_habit_grid_data(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION update_streak(UUID, TEXT) TO authenticated;

-- 10. Add comment for documentation
COMMENT ON FUNCTION track_daily_completion IS 'Track daily completion for 4 categories: affirmation, habit, goal, action. Returns combo count (0-4) and multiplier (x1-x2).';
