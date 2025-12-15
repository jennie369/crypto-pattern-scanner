-- ============================================
-- GAMIFICATION SYSTEM - Vision Board Enhancement
-- Date: 2025-12-04
-- Tables: daily_completions, user_achievements
-- Note: user_streaks already exists (see section 36.2)
-- ============================================

-- ============================================
-- 1. DAILY COMPLETIONS TABLE
-- Track daily completion of 3 categories for combo system
-- ============================================
CREATE TABLE IF NOT EXISTS public.daily_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Date of completion
  completion_date DATE NOT NULL DEFAULT CURRENT_DATE,

  -- Three categories for combo system
  affirmation_done BOOLEAN DEFAULT FALSE,
  habit_done BOOLEAN DEFAULT FALSE,
  goal_done BOOLEAN DEFAULT FALSE,

  -- Combo tracking
  combo_count INT DEFAULT 0,                    -- 0, 1, 2, or 3
  combo_multiplier DECIMAL(3,2) DEFAULT 1.0,    -- x1, x1.5, x2

  -- Points earned this day
  points_earned INT DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- One record per user per day
  UNIQUE(user_id, completion_date)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_daily_completions_user ON public.daily_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_completions_date ON public.daily_completions(completion_date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_completions_user_date ON public.daily_completions(user_id, completion_date);

-- ============================================
-- 2. USER ACHIEVEMENTS TABLE
-- Track unlocked achievements/badges
-- ============================================

-- First, check if table exists and fix column type or add missing columns
DO $$
BEGIN
  -- Create table if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'user_achievements')
  THEN
    CREATE TABLE public.user_achievements (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      achievement_id TEXT NOT NULL,
      achievement_type TEXT NOT NULL DEFAULT 'milestone',
      unlocked_at TIMESTAMPTZ DEFAULT NOW(),
      points_awarded INT DEFAULT 0,
      trigger_value INT,
      UNIQUE(user_id, achievement_id)
    );
  ELSE
    -- Table exists, check if achievement_id is UUID and convert to TEXT
    IF EXISTS (SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'user_achievements'
      AND column_name = 'achievement_id' AND data_type = 'uuid')
    THEN
      -- Drop ALL constraints on achievement_id first
      ALTER TABLE public.user_achievements DROP CONSTRAINT IF EXISTS user_achievements_achievement_id_fkey;
      ALTER TABLE public.user_achievements DROP CONSTRAINT IF EXISTS user_achievements_user_id_achievement_id_key;
      ALTER TABLE public.user_achievements DROP CONSTRAINT IF EXISTS user_achievements_pkey;

      -- Change type
      ALTER TABLE public.user_achievements ALTER COLUMN achievement_id TYPE TEXT USING achievement_id::TEXT;

      -- Recreate unique constraint only (no FK needed - achievement_id is just a string key)
      ALTER TABLE public.user_achievements ADD CONSTRAINT user_achievements_user_id_achievement_id_key UNIQUE(user_id, achievement_id);
    END IF;

    -- Add missing columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'user_achievements' AND column_name = 'achievement_type')
    THEN
      ALTER TABLE public.user_achievements ADD COLUMN achievement_type TEXT NOT NULL DEFAULT 'milestone';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'user_achievements' AND column_name = 'trigger_value')
    THEN
      ALTER TABLE public.user_achievements ADD COLUMN trigger_value INT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'user_achievements' AND column_name = 'points_awarded')
    THEN
      ALTER TABLE public.user_achievements ADD COLUMN points_awarded INT DEFAULT 0;
    END IF;
  END IF;
END $$;

-- Indexes (safe to run multiple times)
CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON public.user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_type ON public.user_achievements(achievement_type);

-- ============================================
-- 3. ADD NEW STREAK TYPES IF NOT EXISTS
-- Extend user_streaks to support combo types
-- ============================================

-- Add 'habit' and 'goal' to streak types (existing table)
-- Note: The table has TEXT type, so these values will work automatically
-- Just documenting the expected values:
-- 'affirmation' - Daily affirmation completion
-- 'habit' - Daily habit completion
-- 'goal' - Daily goal check-in
-- 'combo' - Full combo streak (all 3 done)

-- ============================================
-- 4. ADD FREEZE COLUMNS TO user_streaks IF NOT EXISTS
-- For streak freeze feature
-- ============================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'user_streaks'
    AND column_name = 'freeze_count')
  THEN
    ALTER TABLE public.user_streaks
    ADD COLUMN freeze_count INT DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'user_streaks'
    AND column_name = 'last_freeze_date')
  THEN
    ALTER TABLE public.user_streaks
    ADD COLUMN last_freeze_date DATE;
  END IF;
END $$;

-- ============================================
-- 5. HELPER FUNCTIONS
-- ============================================

-- Track daily completion and update combo
CREATE OR REPLACE FUNCTION track_daily_completion(
  p_user_id UUID,
  p_category TEXT  -- 'affirmation', 'habit', or 'goal'
)
RETURNS JSONB AS $$
DECLARE
  v_affirmation_done BOOLEAN;
  v_habit_done BOOLEAN;
  v_goal_done BOOLEAN;
  v_combo_count INT;
  v_multiplier DECIMAL(3,2);
  v_result JSONB;
BEGIN
  -- Get or create today's record
  INSERT INTO public.daily_completions (user_id, completion_date)
  VALUES (p_user_id, CURRENT_DATE)
  ON CONFLICT (user_id, completion_date) DO NOTHING;

  -- Update the specific category
  IF p_category = 'affirmation' THEN
    UPDATE public.daily_completions
    SET affirmation_done = TRUE, updated_at = NOW()
    WHERE user_id = p_user_id AND completion_date = CURRENT_DATE;
  ELSIF p_category = 'habit' THEN
    UPDATE public.daily_completions
    SET habit_done = TRUE, updated_at = NOW()
    WHERE user_id = p_user_id AND completion_date = CURRENT_DATE;
  ELSIF p_category = 'goal' THEN
    UPDATE public.daily_completions
    SET goal_done = TRUE, updated_at = NOW()
    WHERE user_id = p_user_id AND completion_date = CURRENT_DATE;
  END IF;

  -- Get current status
  SELECT
    COALESCE(affirmation_done, FALSE),
    COALESCE(habit_done, FALSE),
    COALESCE(goal_done, FALSE)
  INTO v_affirmation_done, v_habit_done, v_goal_done
  FROM public.daily_completions
  WHERE user_id = p_user_id AND completion_date = CURRENT_DATE;

  -- Calculate combo count
  v_combo_count := (CASE WHEN v_affirmation_done THEN 1 ELSE 0 END) +
                   (CASE WHEN v_habit_done THEN 1 ELSE 0 END) +
                   (CASE WHEN v_goal_done THEN 1 ELSE 0 END);

  -- Calculate multiplier
  v_multiplier := CASE
    WHEN v_combo_count = 3 THEN 2.0
    WHEN v_combo_count = 2 THEN 1.5
    ELSE 1.0
  END;

  -- Update combo stats
  UPDATE public.daily_completions
  SET
    combo_count = v_combo_count,
    combo_multiplier = v_multiplier,
    updated_at = NOW()
  WHERE user_id = p_user_id AND completion_date = CURRENT_DATE;

  -- If full combo (3/3), update combo streak
  IF v_combo_count = 3 THEN
    PERFORM update_user_streak(p_user_id, 'combo');
  END IF;

  -- Build result
  v_result := jsonb_build_object(
    'category', p_category,
    'combo_count', v_combo_count,
    'multiplier', v_multiplier,
    'is_full_combo', v_combo_count = 3,
    'affirmation_done', v_affirmation_done,
    'habit_done', v_habit_done,
    'goal_done', v_goal_done
  );

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get user's daily completion status
CREATE OR REPLACE FUNCTION get_daily_completion_status(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_record daily_completions%ROWTYPE;
BEGIN
  SELECT * INTO v_record
  FROM public.daily_completions
  WHERE user_id = p_user_id AND completion_date = CURRENT_DATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'affirmation_done', FALSE,
      'habit_done', FALSE,
      'goal_done', FALSE,
      'combo_count', 0,
      'multiplier', 1.0
    );
  END IF;

  RETURN jsonb_build_object(
    'affirmation_done', COALESCE(v_record.affirmation_done, FALSE),
    'habit_done', COALESCE(v_record.habit_done, FALSE),
    'goal_done', COALESCE(v_record.goal_done, FALSE),
    'combo_count', COALESCE(v_record.combo_count, 0),
    'multiplier', COALESCE(v_record.combo_multiplier, 1.0)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get habit grid data (last 35 days for 5x7 grid)
CREATE OR REPLACE FUNCTION get_habit_grid_data(
  p_user_id UUID,
  p_days INT DEFAULT 35
)
RETURNS TABLE (
  completion_date DATE,
  affirmation_done BOOLEAN,
  habit_done BOOLEAN,
  goal_done BOOLEAN,
  combo_count INT
) AS $$
BEGIN
  RETURN QUERY
  WITH date_series AS (
    SELECT generate_series(
      CURRENT_DATE - (p_days - 1),
      CURRENT_DATE,
      '1 day'::interval
    )::DATE AS d
  )
  SELECT
    ds.d AS completion_date,
    COALESCE(dc.affirmation_done, FALSE),
    COALESCE(dc.habit_done, FALSE),
    COALESCE(dc.goal_done, FALSE),
    COALESCE(dc.combo_count, 0)
  FROM date_series ds
  LEFT JOIN public.daily_completions dc
    ON dc.completion_date = ds.d
    AND dc.user_id = p_user_id
  ORDER BY ds.d DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Award achievement
CREATE OR REPLACE FUNCTION award_achievement(
  p_user_id UUID,
  p_achievement_id TEXT,
  p_achievement_type TEXT,
  p_points INT DEFAULT 0,
  p_trigger_value INT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  INSERT INTO public.user_achievements (
    user_id,
    achievement_id,
    achievement_type,
    points_awarded,
    trigger_value
  )
  VALUES (
    p_user_id,
    p_achievement_id,
    p_achievement_type,
    p_points,
    p_trigger_value
  )
  ON CONFLICT (user_id, achievement_id) DO NOTHING;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 6. ROW LEVEL SECURITY
-- ============================================

-- Enable RLS
ALTER TABLE public.daily_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any (safe recreation)
DROP POLICY IF EXISTS "Users can read own completions" ON public.daily_completions;
DROP POLICY IF EXISTS "Users can insert own completions" ON public.daily_completions;
DROP POLICY IF EXISTS "Users can update own completions" ON public.daily_completions;
DROP POLICY IF EXISTS "Users can read own achievements" ON public.user_achievements;
DROP POLICY IF EXISTS "Users can insert own achievements" ON public.user_achievements;

-- daily_completions policies
CREATE POLICY "Users can read own completions"
  ON public.daily_completions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own completions"
  ON public.daily_completions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own completions"
  ON public.daily_completions FOR UPDATE
  USING (auth.uid() = user_id);

-- user_achievements policies
CREATE POLICY "Users can read own achievements"
  ON public.user_achievements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements"
  ON public.user_achievements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 7. GRANTS
-- ============================================
GRANT SELECT, INSERT, UPDATE ON public.daily_completions TO authenticated;
GRANT SELECT, INSERT ON public.user_achievements TO authenticated;
GRANT EXECUTE ON FUNCTION track_daily_completion TO authenticated;
GRANT EXECUTE ON FUNCTION get_daily_completion_status TO authenticated;
GRANT EXECUTE ON FUNCTION get_habit_grid_data TO authenticated;
GRANT EXECUTE ON FUNCTION award_achievement TO authenticated;
