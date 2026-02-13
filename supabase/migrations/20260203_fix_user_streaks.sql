-- ============================================================
-- FIX USER STREAKS TABLE
-- Migration: 20260203_fix_user_streaks.sql
-- Purpose: Ensure user_streaks table exists and has proper RLS
-- This fixes the 500 error in gamificationService.getAllStreaks()
-- ============================================================

-- ============================================================
-- 1. CREATE USER_STREAKS TABLE (IF NOT EXISTS)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Streak type: 'affirmation', 'habit', 'goal', 'combo', 'action', 'meditation', 'journal', 'login'
  streak_type TEXT NOT NULL,

  -- Streak stats
  current_streak INT DEFAULT 0,
  longest_streak INT DEFAULT 0,
  total_completions INT DEFAULT 0,

  -- Date tracking
  last_completion_date DATE,
  streak_start_date DATE,

  -- Freeze feature (optional)
  freeze_count INT DEFAULT 0,
  last_freeze_date DATE,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- One streak type per user
  UNIQUE(user_id, streak_type)
);

-- ============================================================
-- 2. ADD MISSING COLUMNS (for existing tables)
-- ============================================================
DO $$
BEGIN
  -- Add freeze_count if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'user_streaks'
    AND column_name = 'freeze_count'
  ) THEN
    ALTER TABLE public.user_streaks ADD COLUMN freeze_count INT DEFAULT 0;
  END IF;

  -- Add last_freeze_date if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'user_streaks'
    AND column_name = 'last_freeze_date'
  ) THEN
    ALTER TABLE public.user_streaks ADD COLUMN last_freeze_date DATE;
  END IF;
END $$;

-- ============================================================
-- 3. CREATE INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_user_streaks_user ON public.user_streaks(user_id);
CREATE INDEX IF NOT EXISTS idx_user_streaks_type ON public.user_streaks(streak_type);
CREATE INDEX IF NOT EXISTS idx_user_streaks_user_type ON public.user_streaks(user_id, streak_type);

-- ============================================================
-- 4. ENABLE ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 5. DROP AND RECREATE RLS POLICIES
-- ============================================================
DROP POLICY IF EXISTS "Users can manage own streaks" ON public.user_streaks;
DROP POLICY IF EXISTS "Users can view own streaks" ON public.user_streaks;
DROP POLICY IF EXISTS "Users can insert own streaks" ON public.user_streaks;
DROP POLICY IF EXISTS "Users can update own streaks" ON public.user_streaks;
DROP POLICY IF EXISTS "Service role full access streaks" ON public.user_streaks;

-- Policy: Users can SELECT their own streaks
CREATE POLICY "Users can view own streaks" ON public.user_streaks
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can INSERT their own streaks
CREATE POLICY "Users can insert own streaks" ON public.user_streaks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can UPDATE their own streaks
CREATE POLICY "Users can update own streaks" ON public.user_streaks
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Service role has full access (for Edge Functions)
CREATE POLICY "Service role full access streaks" ON public.user_streaks
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================================
-- 6. FUNCTION: UPDATE USER STREAK (UPSERT)
-- ============================================================
-- Drop old single-parameter version if exists (from older migrations)
DROP FUNCTION IF EXISTS update_user_streak(UUID);

CREATE OR REPLACE FUNCTION update_user_streak(
  p_user_id UUID,
  p_streak_type TEXT
)
RETURNS void AS $$
DECLARE
  v_last_date DATE;
  v_current_streak INT;
  v_longest_streak INT;
BEGIN
  -- Get current streak data
  SELECT last_completion_date, current_streak, longest_streak
  INTO v_last_date, v_current_streak, v_longest_streak
  FROM public.user_streaks
  WHERE user_id = p_user_id AND streak_type = p_streak_type;

  IF NOT FOUND THEN
    -- Create new streak record
    INSERT INTO public.user_streaks (
      user_id, streak_type, current_streak, longest_streak,
      total_completions, last_completion_date, streak_start_date
    ) VALUES (
      p_user_id, p_streak_type, 1, 1, 1, CURRENT_DATE, CURRENT_DATE
    );
  ELSE
    -- Check if already completed today
    IF v_last_date = CURRENT_DATE THEN
      RETURN; -- Already completed today
    END IF;

    -- Check if continuing streak (completed yesterday)
    IF v_last_date = CURRENT_DATE - 1 THEN
      -- Continue streak
      UPDATE public.user_streaks
      SET
        current_streak = current_streak + 1,
        longest_streak = GREATEST(longest_streak, current_streak + 1),
        total_completions = total_completions + 1,
        last_completion_date = CURRENT_DATE,
        updated_at = NOW()
      WHERE user_id = p_user_id AND streak_type = p_streak_type;
    ELSE
      -- Streak broken, restart
      UPDATE public.user_streaks
      SET
        current_streak = 1,
        total_completions = total_completions + 1,
        last_completion_date = CURRENT_DATE,
        streak_start_date = CURRENT_DATE,
        updated_at = NOW()
      WHERE user_id = p_user_id AND streak_type = p_streak_type;
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 7. FUNCTION: GET USER STREAK
-- ============================================================
CREATE OR REPLACE FUNCTION get_user_streak(
  p_user_id UUID,
  p_streak_type TEXT
)
RETURNS TABLE (
  current_streak INT,
  longest_streak INT,
  total_completions INT,
  last_completion_date DATE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(us.current_streak, 0),
    COALESCE(us.longest_streak, 0),
    COALESCE(us.total_completions, 0),
    us.last_completion_date
  FROM public.user_streaks us
  WHERE us.user_id = p_user_id AND us.streak_type = p_streak_type;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 8. FUNCTION: GET ALL USER STREAKS
-- ============================================================
CREATE OR REPLACE FUNCTION get_all_user_streaks(p_user_id UUID)
RETURNS TABLE (
  streak_type TEXT,
  current_streak INT,
  longest_streak INT,
  total_completions INT,
  last_completion_date DATE,
  freeze_count INT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    us.streak_type,
    COALESCE(us.current_streak, 0),
    COALESCE(us.longest_streak, 0),
    COALESCE(us.total_completions, 0),
    us.last_completion_date,
    COALESCE(us.freeze_count, 0)
  FROM public.user_streaks us
  WHERE us.user_id = p_user_id
  ORDER BY us.streak_type;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 9. GRANT PERMISSIONS
-- ============================================================
GRANT ALL ON public.user_streaks TO authenticated;
-- Specify argument types to avoid ambiguity with older function versions
GRANT EXECUTE ON FUNCTION update_user_streak(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_streak(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_all_user_streaks(UUID) TO authenticated;

-- ============================================================
-- 10. UPDATED_AT TRIGGER
-- ============================================================
DROP TRIGGER IF EXISTS set_timestamp_user_streaks ON public.user_streaks;

CREATE OR REPLACE FUNCTION trigger_set_timestamp_user_streaks()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_timestamp_user_streaks
  BEFORE UPDATE ON public.user_streaks
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_timestamp_user_streaks();

-- ============================================================
-- DONE
-- ============================================================
DO $$
BEGIN
  RAISE NOTICE '============================================================';
  RAISE NOTICE 'USER STREAKS TABLE FIXED SUCCESSFULLY!';
  RAISE NOTICE '============================================================';
  RAISE NOTICE 'Table: user_streaks';
  RAISE NOTICE 'Columns: streak_type, current_streak, longest_streak,';
  RAISE NOTICE '         total_completions, last_completion_date, freeze_count';
  RAISE NOTICE 'RLS: Enabled with user-specific policies';
  RAISE NOTICE 'Functions: update_user_streak, get_user_streak, get_all_user_streaks';
  RAISE NOTICE '============================================================';
END $$;
