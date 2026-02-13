-- ============================================
-- STATS RPC FUNCTIONS for Vision Board 2.0
-- Weekly Progress, XP, Levels
-- December 10, 2025
-- ============================================

-- ============================================
-- ENSURE TABLES EXIST
-- ============================================

-- vision_user_stats
CREATE TABLE IF NOT EXISTS vision_user_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  total_xp INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  goals_created INTEGER DEFAULT 0,
  goals_completed INTEGER DEFAULT 0,
  achievements TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- vision_daily_summary
CREATE TABLE IF NOT EXISTS vision_daily_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  summary_date DATE NOT NULL,
  daily_score INTEGER DEFAULT 0,
  actions_completed INTEGER DEFAULT 0,
  actions_total INTEGER DEFAULT 0,
  affirmations_completed INTEGER DEFAULT 0,
  habits_completed INTEGER DEFAULT 0,
  ritual_completed BOOLEAN DEFAULT FALSE,
  xp_earned INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, summary_date)
);

-- RLS
ALTER TABLE vision_user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE vision_daily_summary ENABLE ROW LEVEL SECURITY;

-- Policies (safe create)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users manage own stats' AND tablename = 'vision_user_stats') THEN
    CREATE POLICY "Users manage own stats" ON vision_user_stats FOR ALL USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users manage own daily_summary' AND tablename = 'vision_daily_summary') THEN
    CREATE POLICY "Users manage own daily_summary" ON vision_daily_summary FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_vision_user_stats_user ON vision_user_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_vision_daily_summary_user_date ON vision_daily_summary(user_id, summary_date);

-- ============================================
-- DROP OLD FUNCTIONS
-- ============================================
DROP FUNCTION IF EXISTS get_weekly_progress(UUID);
DROP FUNCTION IF EXISTS get_weekly_progress(UUID, INTEGER);
DROP FUNCTION IF EXISTS add_xp(UUID, INTEGER, TEXT);
DROP FUNCTION IF EXISTS update_user_streak(UUID);
DROP FUNCTION IF EXISTS get_user_stats(UUID);
DROP FUNCTION IF EXISTS get_daily_summary(UUID, DATE);

-- ============================================
-- GET WEEKLY PROGRESS
-- Returns last 7 days of daily summaries
-- ============================================
CREATE OR REPLACE FUNCTION get_weekly_progress(p_user_id UUID, p_days INTEGER DEFAULT 7)
RETURNS TABLE (
  summary_date DATE,
  daily_score INTEGER,
  actions_completed INTEGER,
  actions_total INTEGER,
  xp_earned INTEGER
)
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT
    ds.summary_date,
    ds.daily_score,
    ds.actions_completed,
    ds.actions_total,
    ds.xp_earned
  FROM vision_daily_summary ds
  WHERE ds.user_id = p_user_id
    AND ds.summary_date >= CURRENT_DATE - p_days
    AND ds.summary_date <= CURRENT_DATE
  ORDER BY ds.summary_date ASC;
END;
$$;

-- ============================================
-- ADD XP TO USER
-- Updates total_xp and returns new level info
-- ============================================
CREATE OR REPLACE FUNCTION add_xp(
  p_user_id UUID,
  p_xp_amount INTEGER,
  p_source TEXT DEFAULT 'task'
)
RETURNS TABLE (
  new_total_xp INTEGER,
  current_level INTEGER,
  xp_for_next_level INTEGER,
  leveled_up BOOLEAN
)
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_old_xp INTEGER;
  v_new_xp INTEGER;
  v_old_level INTEGER;
  v_new_level INTEGER;
  v_level_thresholds INTEGER[] := ARRAY[0, 100, 300, 600, 1000, 1500, 2200, 3000, 4000, 5500, 7500, 10000];
BEGIN
  -- Get current XP
  SELECT COALESCE(total_xp, 0) INTO v_old_xp
  FROM vision_user_stats
  WHERE user_id = p_user_id;

  IF v_old_xp IS NULL THEN
    v_old_xp := 0;
    INSERT INTO vision_user_stats (user_id, total_xp) VALUES (p_user_id, 0);
  END IF;

  -- Calculate new XP
  v_new_xp := v_old_xp + p_xp_amount;

  -- Calculate old and new levels
  v_old_level := 1;
  v_new_level := 1;

  FOR i IN REVERSE array_length(v_level_thresholds, 1)..1 LOOP
    IF v_old_xp >= v_level_thresholds[i] THEN
      v_old_level := i;
      EXIT;
    END IF;
  END LOOP;

  FOR i IN REVERSE array_length(v_level_thresholds, 1)..1 LOOP
    IF v_new_xp >= v_level_thresholds[i] THEN
      v_new_level := i;
      EXIT;
    END IF;
  END LOOP;

  -- Update XP
  UPDATE vision_user_stats
  SET total_xp = v_new_xp, updated_at = NOW()
  WHERE user_id = p_user_id;

  -- Also update today's daily summary
  INSERT INTO vision_daily_summary (user_id, summary_date, xp_earned)
  VALUES (p_user_id, CURRENT_DATE, p_xp_amount)
  ON CONFLICT (user_id, summary_date)
  DO UPDATE SET xp_earned = vision_daily_summary.xp_earned + p_xp_amount;

  -- Return new stats
  RETURN QUERY SELECT
    v_new_xp,
    v_new_level,
    CASE WHEN v_new_level < 12 THEN v_level_thresholds[v_new_level + 1] ELSE 10000 END,
    v_new_level > v_old_level;
END;
$$;

-- ============================================
-- UPDATE USER STREAK
-- Call this when user completes any activity
-- ============================================
CREATE OR REPLACE FUNCTION update_user_streak(p_user_id UUID)
RETURNS TABLE (current_streak INTEGER, best_streak INTEGER, streak_continued BOOLEAN)
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_yesterday DATE := CURRENT_DATE - 1;
  v_yesterday_score INTEGER;
  v_current_streak INTEGER;
  v_best_streak INTEGER;
  v_new_streak INTEGER;
BEGIN
  -- Check if user had activity yesterday
  SELECT daily_score INTO v_yesterday_score
  FROM vision_daily_summary
  WHERE user_id = p_user_id AND summary_date = v_yesterday;

  -- Get current stats
  SELECT us.current_streak, us.best_streak INTO v_current_streak, v_best_streak
  FROM vision_user_stats us
  WHERE us.user_id = p_user_id;

  IF v_current_streak IS NULL THEN
    v_current_streak := 0;
    v_best_streak := 0;
    INSERT INTO vision_user_stats (user_id, current_streak, best_streak)
    VALUES (p_user_id, 0, 0);
  END IF;

  -- Calculate new streak
  IF v_yesterday_score IS NOT NULL AND v_yesterday_score > 0 THEN
    v_new_streak := v_current_streak + 1;
  ELSE
    v_new_streak := 1;
  END IF;

  -- Update best streak if needed
  IF v_new_streak > v_best_streak THEN
    v_best_streak := v_new_streak;
  END IF;

  -- Save
  UPDATE vision_user_stats
  SET current_streak = v_new_streak, best_streak = v_best_streak, updated_at = NOW()
  WHERE user_id = p_user_id;

  RETURN QUERY SELECT v_new_streak, v_best_streak, v_yesterday_score IS NOT NULL AND v_yesterday_score > 0;
END;
$$;

-- ============================================
-- GET USER STATS
-- Returns complete user stats
-- ============================================
CREATE OR REPLACE FUNCTION get_user_stats(p_user_id UUID)
RETURNS TABLE (
  total_xp INTEGER,
  current_streak INTEGER,
  best_streak INTEGER,
  goals_created INTEGER,
  goals_completed INTEGER,
  current_level INTEGER,
  today_xp INTEGER
)
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_level_thresholds INTEGER[] := ARRAY[0, 100, 300, 600, 1000, 1500, 2200, 3000, 4000, 5500, 7500, 10000];
  v_total_xp INTEGER;
  v_level INTEGER := 1;
BEGIN
  -- Get basic stats
  SELECT us.total_xp INTO v_total_xp
  FROM vision_user_stats us
  WHERE us.user_id = p_user_id;

  IF v_total_xp IS NULL THEN v_total_xp := 0; END IF;

  -- Calculate level
  FOR i IN REVERSE array_length(v_level_thresholds, 1)..1 LOOP
    IF v_total_xp >= v_level_thresholds[i] THEN
      v_level := i;
      EXIT;
    END IF;
  END LOOP;

  RETURN QUERY
  SELECT
    COALESCE(us.total_xp, 0),
    COALESCE(us.current_streak, 0),
    COALESCE(us.best_streak, 0),
    COALESCE(us.goals_created, 0),
    COALESCE(us.goals_completed, 0),
    v_level,
    COALESCE(ds.xp_earned, 0)
  FROM vision_user_stats us
  LEFT JOIN vision_daily_summary ds ON ds.user_id = us.user_id AND ds.summary_date = CURRENT_DATE
  WHERE us.user_id = p_user_id;
END;
$$;

-- ============================================
-- SAVE DAILY SUMMARY
-- Upsert daily summary data
-- ============================================
CREATE OR REPLACE FUNCTION save_daily_summary(
  p_user_id UUID,
  p_daily_score INTEGER,
  p_actions_completed INTEGER DEFAULT 0,
  p_actions_total INTEGER DEFAULT 0,
  p_affirmations_completed INTEGER DEFAULT 0,
  p_habits_completed INTEGER DEFAULT 0,
  p_ritual_completed BOOLEAN DEFAULT FALSE,
  p_xp_earned INTEGER DEFAULT 0
)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO vision_daily_summary (
    user_id, summary_date, daily_score, actions_completed, actions_total,
    affirmations_completed, habits_completed, ritual_completed, xp_earned
  ) VALUES (
    p_user_id, CURRENT_DATE, p_daily_score, p_actions_completed, p_actions_total,
    p_affirmations_completed, p_habits_completed, p_ritual_completed, p_xp_earned
  )
  ON CONFLICT (user_id, summary_date)
  DO UPDATE SET
    daily_score = p_daily_score,
    actions_completed = p_actions_completed,
    actions_total = p_actions_total,
    affirmations_completed = p_affirmations_completed,
    habits_completed = p_habits_completed,
    ritual_completed = p_ritual_completed,
    xp_earned = p_xp_earned;

  RETURN TRUE;
END;
$$;

-- ============================================
-- GRANT PERMISSIONS
-- ============================================
GRANT ALL ON vision_user_stats TO authenticated;
GRANT ALL ON vision_daily_summary TO authenticated;
GRANT EXECUTE ON FUNCTION get_weekly_progress(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION add_xp(UUID, INTEGER, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION update_user_streak(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_stats(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION save_daily_summary(UUID, INTEGER, INTEGER, INTEGER, INTEGER, INTEGER, BOOLEAN, INTEGER) TO authenticated;

-- ============================================
-- DONE
-- ============================================
SELECT 'Stats RPC functions created successfully!' as status;
