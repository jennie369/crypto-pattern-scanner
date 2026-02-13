-- =====================================================
-- FIX GEM ECONOMY - Missing columns and functions
-- Date: December 11, 2025
-- Run this in Supabase SQL Editor
-- =====================================================

-- =====================================================
-- STEP 1: Fix gem_packs table - add missing columns
-- =====================================================

-- Add display_order column if not exists
ALTER TABLE gem_packs ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- Add other potentially missing columns
ALTER TABLE gem_packs ADD COLUMN IF NOT EXISTS badge_text VARCHAR(50);
ALTER TABLE gem_packs ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
ALTER TABLE gem_packs ADD COLUMN IF NOT EXISTS shopify_handle VARCHAR(255);
ALTER TABLE gem_packs ADD COLUMN IF NOT EXISTS sku VARCHAR(50);

-- Create indexes if not exist
CREATE INDEX IF NOT EXISTS idx_gem_packs_display_order ON gem_packs(display_order);

-- =====================================================
-- STEP 2: Create daily_checkins table if not exists
-- =====================================================

CREATE TABLE IF NOT EXISTS daily_checkins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  checkin_date DATE NOT NULL,
  gems_earned INTEGER NOT NULL DEFAULT 5,
  bonus_gems INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 1,
  transaction_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_daily_checkin UNIQUE (user_id, checkin_date)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_daily_checkins_user ON daily_checkins(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_checkins_date ON daily_checkins(checkin_date);
CREATE INDEX IF NOT EXISTS idx_daily_checkins_user_date ON daily_checkins(user_id, checkin_date DESC);

-- RLS
ALTER TABLE daily_checkins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own checkins" ON daily_checkins;
DROP POLICY IF EXISTS "Users can insert own checkins" ON daily_checkins;

CREATE POLICY "Users can view own checkins"
  ON daily_checkins FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own checkins"
  ON daily_checkins FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- STEP 3: Create checkin_streaks table if not exists
-- =====================================================

CREATE TABLE IF NOT EXISTS checkin_streaks (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak INTEGER DEFAULT 0,
  last_checkin_date DATE,
  longest_streak INTEGER DEFAULT 0,
  total_checkins INTEGER DEFAULT 0,
  total_gems_from_checkins INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE checkin_streaks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own checkin_streaks" ON checkin_streaks;
DROP POLICY IF EXISTS "Users can update own checkin_streaks" ON checkin_streaks;
DROP POLICY IF EXISTS "Users can insert own checkin_streaks" ON checkin_streaks;

CREATE POLICY "Users can view own checkin_streaks"
  ON checkin_streaks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own checkin_streaks"
  ON checkin_streaks FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own checkin_streaks"
  ON checkin_streaks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- STEP 4: Create/Update RPC Functions
-- =====================================================

-- Function: grant_gems
CREATE OR REPLACE FUNCTION grant_gems(
  p_user_id UUID,
  p_amount INTEGER,
  p_type VARCHAR(50),
  p_description TEXT DEFAULT NULL,
  p_reference_id VARCHAR(100) DEFAULT NULL,
  p_reference_type VARCHAR(50) DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_balance INTEGER;
  v_new_balance INTEGER;
  v_transaction_id UUID;
  v_wallet_id UUID;
BEGIN
  -- Get current balance with lock
  SELECT id, COALESCE(gem_balance, 0) INTO v_wallet_id, v_current_balance
  FROM user_wallets
  WHERE user_id = p_user_id
  FOR UPDATE;

  -- Create wallet if not exists
  IF v_wallet_id IS NULL THEN
    INSERT INTO user_wallets (user_id, gem_balance, diamond_balance, total_earned, total_spent, created_at, updated_at)
    VALUES (p_user_id, 0, 0, 0, 0, NOW(), NOW())
    RETURNING id, gem_balance INTO v_wallet_id, v_current_balance;
    v_current_balance := 0;
  END IF;

  -- Calculate new balance
  v_new_balance := v_current_balance + p_amount;

  -- Update wallet
  UPDATE user_wallets
  SET
    gem_balance = v_new_balance,
    total_earned = total_earned + p_amount,
    updated_at = NOW()
  WHERE user_id = p_user_id;

  -- Create transaction log
  INSERT INTO wallet_transactions (
    wallet_id,
    type,
    currency,
    amount,
    description,
    reference_id,
    reference_type,
    balance_before,
    balance_after,
    metadata,
    created_at
  ) VALUES (
    v_wallet_id,
    p_type,
    'gem',
    p_amount,
    p_description,
    p_reference_id,
    p_reference_type,
    v_current_balance,
    v_new_balance,
    p_metadata,
    NOW()
  )
  RETURNING id INTO v_transaction_id;

  RETURN jsonb_build_object(
    'success', true,
    'new_balance', v_new_balance,
    'previous_balance', v_current_balance,
    'amount_granted', p_amount,
    'transaction_id', v_transaction_id
  );

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$;

-- Function: get_gem_balance
CREATE OR REPLACE FUNCTION get_gem_balance(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_balance INTEGER;
BEGIN
  SELECT COALESCE(gem_balance, 0) INTO v_balance
  FROM user_wallets
  WHERE user_id = p_user_id;

  RETURN COALESCE(v_balance, 0);
END;
$$;

-- Function: perform_daily_checkin
CREATE OR REPLACE FUNCTION perform_daily_checkin(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_today DATE := CURRENT_DATE;
  v_yesterday DATE := CURRENT_DATE - 1;
  v_existing_checkin UUID;
  v_last_checkin_date DATE;
  v_current_streak INTEGER;
  v_base_gems INTEGER := 5;
  v_bonus_gems INTEGER := 0;
  v_total_gems INTEGER;
  v_new_streak INTEGER;
  v_grant_result JSONB;
  v_checkin_id UUID;
BEGIN
  -- Check if already checked in today
  SELECT id INTO v_existing_checkin
  FROM daily_checkins
  WHERE user_id = p_user_id AND checkin_date = v_today;

  IF v_existing_checkin IS NOT NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'already_checked_in',
      'message', 'Bạn đã điểm danh hôm nay rồi'
    );
  END IF;

  -- Get or create checkin_streaks record
  SELECT last_checkin_date, current_streak INTO v_last_checkin_date, v_current_streak
  FROM checkin_streaks
  WHERE user_id = p_user_id;

  IF v_current_streak IS NULL THEN
    INSERT INTO checkin_streaks (user_id, current_streak, last_checkin_date, total_checkins)
    VALUES (p_user_id, 0, NULL, 0);
    v_current_streak := 0;
    v_last_checkin_date := NULL;
  END IF;

  -- Calculate new streak
  IF v_last_checkin_date = v_yesterday THEN
    v_new_streak := v_current_streak + 1;
  ELSE
    v_new_streak := 1;
  END IF;

  -- Calculate bonus gems
  IF v_new_streak = 7 THEN
    v_bonus_gems := 20;
  ELSIF v_new_streak = 30 THEN
    v_bonus_gems := 100;
  ELSIF v_new_streak > 7 AND v_new_streak % 7 = 0 THEN
    v_bonus_gems := 10;
  END IF;

  v_total_gems := v_base_gems + v_bonus_gems;

  -- Grant gems
  v_grant_result := grant_gems(
    p_user_id,
    v_total_gems,
    'daily_checkin',
    'Điểm danh ngày ' || v_today::TEXT || ' (streak: ' || v_new_streak || ')',
    NULL,
    'daily_checkin',
    jsonb_build_object(
      'checkin_date', v_today,
      'streak', v_new_streak,
      'base_gems', v_base_gems,
      'bonus_gems', v_bonus_gems
    )
  );

  IF NOT (v_grant_result->>'success')::BOOLEAN THEN
    RETURN v_grant_result;
  END IF;

  -- Insert daily_checkins record
  INSERT INTO daily_checkins (
    user_id, checkin_date, gems_earned, bonus_gems,
    current_streak, transaction_id
  ) VALUES (
    p_user_id, v_today, v_base_gems, v_bonus_gems,
    v_new_streak, (v_grant_result->>'transaction_id')::UUID
  )
  RETURNING id INTO v_checkin_id;

  -- Update checkin_streaks
  UPDATE checkin_streaks
  SET
    current_streak = v_new_streak,
    last_checkin_date = v_today,
    longest_streak = GREATEST(longest_streak, v_new_streak),
    total_checkins = total_checkins + 1,
    total_gems_from_checkins = total_gems_from_checkins + v_total_gems,
    updated_at = NOW()
  WHERE user_id = p_user_id;

  RETURN jsonb_build_object(
    'success', true,
    'checkin_id', v_checkin_id,
    'gems_earned', v_total_gems,
    'base_gems', v_base_gems,
    'bonus_gems', v_bonus_gems,
    'current_streak', v_new_streak,
    'new_balance', (v_grant_result->>'new_balance')::INTEGER,
    'message', CASE
      WHEN v_bonus_gems > 0 THEN 'Chúc mừng! Bạn nhận được ' || v_bonus_gems || ' gems bonus streak!'
      ELSE 'Điểm danh thành công!'
    END
  );
END;
$$;

-- Function: get_checkin_status
CREATE OR REPLACE FUNCTION get_checkin_status(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_today DATE := CURRENT_DATE;
  v_yesterday DATE := CURRENT_DATE - 1;
  v_checked_today BOOLEAN;
  v_current_streak INTEGER;
  v_longest_streak INTEGER;
  v_total_checkins INTEGER;
  v_total_gems INTEGER;
  v_last_checkin DATE;
  v_recent_checkins JSONB;
  v_next_bonus JSONB;
BEGIN
  -- Check if checked in today
  SELECT EXISTS(
    SELECT 1 FROM daily_checkins
    WHERE user_id = p_user_id AND checkin_date = v_today
  ) INTO v_checked_today;

  -- Get streak info
  SELECT
    COALESCE(current_streak, 0),
    COALESCE(longest_streak, 0),
    COALESCE(total_checkins, 0),
    COALESCE(total_gems_from_checkins, 0),
    last_checkin_date
  INTO v_current_streak, v_longest_streak, v_total_checkins, v_total_gems, v_last_checkin
  FROM checkin_streaks
  WHERE user_id = p_user_id;

  IF v_current_streak IS NULL THEN
    v_current_streak := 0;
    v_longest_streak := 0;
    v_total_checkins := 0;
    v_total_gems := 0;
  END IF;

  -- Check if streak is still active
  IF v_last_checkin IS NOT NULL AND v_last_checkin < v_yesterday THEN
    v_current_streak := 0;
  END IF;

  -- Get recent 7 checkins
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'date', checkin_date,
      'gems', gems_earned + bonus_gems,
      'streak', current_streak
    ) ORDER BY checkin_date DESC
  ), '[]'::JSONB) INTO v_recent_checkins
  FROM (
    SELECT checkin_date, gems_earned, bonus_gems, current_streak
    FROM daily_checkins
    WHERE user_id = p_user_id
    ORDER BY checkin_date DESC
    LIMIT 7
  ) sub;

  -- Calculate next bonus
  IF v_current_streak < 7 THEN
    v_next_bonus := jsonb_build_object(
      'days_until', 7 - v_current_streak,
      'bonus', 20,
      'milestone', '7 ngày'
    );
  ELSIF v_current_streak < 30 THEN
    v_next_bonus := jsonb_build_object(
      'days_until', 30 - v_current_streak,
      'bonus', 100,
      'milestone', '30 ngày'
    );
  ELSE
    v_next_bonus := jsonb_build_object(
      'days_until', 7 - (v_current_streak % 7),
      'bonus', 10,
      'milestone', 'Tuần tiếp theo'
    );
  END IF;

  RETURN jsonb_build_object(
    'checked_today', v_checked_today,
    'current_streak', v_current_streak,
    'longest_streak', v_longest_streak,
    'total_checkins', v_total_checkins,
    'total_gems', v_total_gems,
    'recent_checkins', v_recent_checkins,
    'next_bonus', v_next_bonus
  );
END;
$$;

-- =====================================================
-- STEP 5: Grant permissions
-- =====================================================

GRANT EXECUTE ON FUNCTION grant_gems TO authenticated;
GRANT EXECUTE ON FUNCTION grant_gems TO service_role;
GRANT EXECUTE ON FUNCTION get_gem_balance TO authenticated;
GRANT EXECUTE ON FUNCTION get_gem_balance TO service_role;
GRANT EXECUTE ON FUNCTION perform_daily_checkin TO authenticated;
GRANT EXECUTE ON FUNCTION get_checkin_status TO authenticated;

-- =====================================================
-- DONE!
-- =====================================================
SELECT 'Gem Economy fix completed!' as status;
