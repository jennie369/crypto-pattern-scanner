-- ═══════════════════════════════════════════════════════════════════════════════
-- Fix Missing Tables & Columns - 2025-11-30
-- ═══════════════════════════════════════════════════════════════════════════════
-- Fixes:
-- 1. affirmation_completions (404 Not Found)
-- 2. user_streaks (404 Not Found)
-- 3. user_widgets.settings column (400 Bad Request)
-- 4. affiliate_profiles RLS (400 Bad Request)
-- ═══════════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════════════
-- 1. AFFIRMATION COMPLETIONS TABLE
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.affirmation_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Daily tracking
  completed_date DATE NOT NULL,
  affirmation_text TEXT,

  -- Optional metadata
  category TEXT,                               -- 'abundance', 'love', 'health', 'success'
  mood_before INT,                             -- 1-10 scale
  mood_after INT,                              -- 1-10 scale
  notes TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- One completion per user per day
  UNIQUE(user_id, completed_date)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_affirmation_completions_user ON public.affirmation_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_affirmation_completions_date ON public.affirmation_completions(completed_date DESC);
CREATE INDEX IF NOT EXISTS idx_affirmation_completions_user_date ON public.affirmation_completions(user_id, completed_date);

-- RLS
ALTER TABLE public.affirmation_completions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own affirmation completions" ON public.affirmation_completions;
CREATE POLICY "Users can manage own affirmation completions" ON public.affirmation_completions
  FOR ALL USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 2. USER STREAKS TABLE
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.user_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Streak type
  streak_type TEXT NOT NULL,                   -- 'affirmation', 'meditation', 'journal', 'login'

  -- Streak stats
  current_streak INT DEFAULT 0,
  longest_streak INT DEFAULT 0,
  total_completions INT DEFAULT 0,

  -- Date tracking
  last_completion_date DATE,
  streak_start_date DATE,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- One streak type per user
  UNIQUE(user_id, streak_type)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_streaks_user ON public.user_streaks(user_id);
CREATE INDEX IF NOT EXISTS idx_user_streaks_type ON public.user_streaks(streak_type);
CREATE INDEX IF NOT EXISTS idx_user_streaks_user_type ON public.user_streaks(user_id, streak_type);

-- RLS
ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own streaks" ON public.user_streaks;
CREATE POLICY "Users can manage own streaks" ON public.user_streaks
  FOR ALL USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 3. USER WIDGETS - Add settings column (table already exists)
-- ═══════════════════════════════════════════════════════════════════════════════

-- Add settings column if it doesn't exist
ALTER TABLE public.user_widgets ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}';

-- ═══════════════════════════════════════════════════════════════════════════════
-- 4. FIX AFFILIATE_PROFILES RLS
-- ═══════════════════════════════════════════════════════════════════════════════

-- Ensure table exists first (from DATABASE_SCHEMA.md section 21.1)
CREATE TABLE IF NOT EXISTS public.affiliate_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,

  -- Role & Tier
  role TEXT DEFAULT 'affiliate',               -- 'affiliate', 'ctv'
  ctv_tier TEXT DEFAULT 'beginner',            -- 'beginner', 'growing', 'master', 'grand'

  -- Status
  is_active BOOLEAN DEFAULT TRUE,

  -- Performance Stats
  total_sales DECIMAL(15,2) DEFAULT 0,
  total_commission DECIMAL(15,2) DEFAULT 0,
  pending_commission DECIMAL(15,2) DEFAULT 0,
  paid_commission DECIMAL(15,2) DEFAULT 0,

  -- Referral Info
  referral_code TEXT UNIQUE,
  referral_count INT DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.affiliate_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate
DROP POLICY IF EXISTS "Users can view own affiliate profile" ON public.affiliate_profiles;
DROP POLICY IF EXISTS "Users can insert own affiliate profile" ON public.affiliate_profiles;
DROP POLICY IF EXISTS "Users can update own affiliate profile" ON public.affiliate_profiles;
DROP POLICY IF EXISTS "Admins can view all affiliate profiles" ON public.affiliate_profiles;

-- Policy: Users can view their own affiliate profile
CREATE POLICY "Users can view own affiliate profile" ON public.affiliate_profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert their own affiliate profile
CREATE POLICY "Users can insert own affiliate profile" ON public.affiliate_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own affiliate profile
CREATE POLICY "Users can update own affiliate profile" ON public.affiliate_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Admins can view all profiles
CREATE POLICY "Admins can view all affiliate profiles" ON public.affiliate_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND (role = 'admin' OR is_admin = TRUE OR scanner_tier = 'ADMIN' OR chatbot_tier = 'ADMIN')
    )
  );

-- ═══════════════════════════════════════════════════════════════════════════════
-- 5. HELPER FUNCTIONS FOR STREAKS
-- ═══════════════════════════════════════════════════════════════════════════════

-- Function to update streak on completion
CREATE OR REPLACE FUNCTION update_user_streak(
  p_user_id UUID,
  p_streak_type TEXT
)
RETURNS VOID AS $$
DECLARE
  v_last_date DATE;
  v_current_streak INT;
  v_longest_streak INT;
BEGIN
  -- Get current streak info
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

-- Function to get user streak
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

-- ═══════════════════════════════════════════════════════════════════════════════
-- 6. GRANT PERMISSIONS
-- ═══════════════════════════════════════════════════════════════════════════════

GRANT ALL ON public.affirmation_completions TO authenticated;
GRANT ALL ON public.user_streaks TO authenticated;
GRANT ALL ON public.user_widgets TO authenticated;
GRANT ALL ON public.affiliate_profiles TO authenticated;

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION update_user_streak TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_streak TO authenticated;

-- ═══════════════════════════════════════════════════════════════════════════════
-- DONE!
-- ═══════════════════════════════════════════════════════════════════════════════
