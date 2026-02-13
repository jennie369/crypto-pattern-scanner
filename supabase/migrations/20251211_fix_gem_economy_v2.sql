-- =====================================================
-- FIX GEM ECONOMY V2 - Run this FIRST
-- Date: December 11, 2025
-- =====================================================

-- STEP 1: Add missing columns to gem_packs FIRST
DO $$
BEGIN
  -- Add display_order if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'gem_packs' AND column_name = 'display_order') THEN
    ALTER TABLE gem_packs ADD COLUMN display_order INTEGER DEFAULT 0;
  END IF;

  -- Add badge_text if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'gem_packs' AND column_name = 'badge_text') THEN
    ALTER TABLE gem_packs ADD COLUMN badge_text VARCHAR(50);
  END IF;

  -- Add is_featured if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'gem_packs' AND column_name = 'is_featured') THEN
    ALTER TABLE gem_packs ADD COLUMN is_featured BOOLEAN DEFAULT false;
  END IF;

  -- Add shopify_handle if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'gem_packs' AND column_name = 'shopify_handle') THEN
    ALTER TABLE gem_packs ADD COLUMN shopify_handle VARCHAR(255);
  END IF;

  -- Add sku if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'gem_packs' AND column_name = 'sku') THEN
    ALTER TABLE gem_packs ADD COLUMN sku VARCHAR(50);
  END IF;
END $$;

-- STEP 2: Create daily_checkins table
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

CREATE INDEX IF NOT EXISTS idx_daily_checkins_user ON daily_checkins(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_checkins_user_date ON daily_checkins(user_id, checkin_date DESC);

ALTER TABLE daily_checkins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own checkins" ON daily_checkins;
CREATE POLICY "Users can view own checkins" ON daily_checkins FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own checkins" ON daily_checkins;
CREATE POLICY "Users can insert own checkins" ON daily_checkins FOR INSERT WITH CHECK (auth.uid() = user_id);

-- STEP 3: Create checkin_streaks table
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

ALTER TABLE checkin_streaks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own checkin_streaks" ON checkin_streaks;
CREATE POLICY "Users can view own checkin_streaks" ON checkin_streaks FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own checkin_streaks" ON checkin_streaks;
CREATE POLICY "Users can update own checkin_streaks" ON checkin_streaks FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own checkin_streaks" ON checkin_streaks;
CREATE POLICY "Users can insert own checkin_streaks" ON checkin_streaks FOR INSERT WITH CHECK (auth.uid() = user_id);

-- STEP 4: Add missing columns to wallet_transactions
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'wallet_transactions' AND column_name = 'balance_before') THEN
    ALTER TABLE wallet_transactions ADD COLUMN balance_before INTEGER;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'wallet_transactions' AND column_name = 'balance_after') THEN
    ALTER TABLE wallet_transactions ADD COLUMN balance_after INTEGER;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'wallet_transactions' AND column_name = 'metadata') THEN
    ALTER TABLE wallet_transactions ADD COLUMN metadata JSONB DEFAULT '{}';
  END IF;
END $$;

-- STEP 5: Create grant_gems function
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
  SELECT id, COALESCE(gem_balance, 0) INTO v_wallet_id, v_current_balance
  FROM user_wallets WHERE user_id = p_user_id FOR UPDATE;

  IF v_wallet_id IS NULL THEN
    INSERT INTO user_wallets (user_id, gem_balance, diamond_balance, total_earned, total_spent, created_at, updated_at)
    VALUES (p_user_id, 0, 0, 0, 0, NOW(), NOW())
    RETURNING id, gem_balance INTO v_wallet_id, v_current_balance;
    v_current_balance := 0;
  END IF;

  v_new_balance := v_current_balance + p_amount;

  UPDATE user_wallets SET gem_balance = v_new_balance, total_earned = total_earned + p_amount, updated_at = NOW()
  WHERE user_id = p_user_id;

  INSERT INTO wallet_transactions (wallet_id, type, currency, amount, description, reference_id, reference_type, balance_before, balance_after, metadata, created_at)
  VALUES (v_wallet_id, p_type, 'gem', p_amount, p_description, p_reference_id, p_reference_type, v_current_balance, v_new_balance, p_metadata, NOW())
  RETURNING id INTO v_transaction_id;

  RETURN jsonb_build_object('success', true, 'new_balance', v_new_balance, 'previous_balance', v_current_balance, 'amount_granted', p_amount, 'transaction_id', v_transaction_id);
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- STEP 6: Create get_gem_balance function
CREATE OR REPLACE FUNCTION get_gem_balance(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN COALESCE((SELECT gem_balance FROM user_wallets WHERE user_id = p_user_id), 0);
END;
$$;

-- STEP 7: Create perform_daily_checkin function
CREATE OR REPLACE FUNCTION perform_daily_checkin(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_today DATE := CURRENT_DATE;
  v_yesterday DATE := CURRENT_DATE - 1;
  v_existing UUID;
  v_last_date DATE;
  v_streak INTEGER;
  v_new_streak INTEGER;
  v_base INTEGER := 5;
  v_bonus INTEGER := 0;
  v_total INTEGER;
  v_result JSONB;
  v_checkin_id UUID;
BEGIN
  SELECT id INTO v_existing FROM daily_checkins WHERE user_id = p_user_id AND checkin_date = v_today;
  IF v_existing IS NOT NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'already_checked_in', 'message', 'Bạn đã điểm danh hôm nay rồi');
  END IF;

  SELECT last_checkin_date, current_streak INTO v_last_date, v_streak FROM checkin_streaks WHERE user_id = p_user_id;
  IF v_streak IS NULL THEN
    INSERT INTO checkin_streaks (user_id, current_streak, total_checkins) VALUES (p_user_id, 0, 0);
    v_streak := 0;
  END IF;

  v_new_streak := CASE WHEN v_last_date = v_yesterday THEN v_streak + 1 ELSE 1 END;

  IF v_new_streak = 7 THEN v_bonus := 20;
  ELSIF v_new_streak = 30 THEN v_bonus := 100;
  ELSIF v_new_streak > 7 AND v_new_streak % 7 = 0 THEN v_bonus := 10;
  END IF;

  v_total := v_base + v_bonus;
  v_result := grant_gems(p_user_id, v_total, 'daily_checkin', 'Điểm danh ngày ' || v_today, NULL, 'daily_checkin',
    jsonb_build_object('date', v_today, 'streak', v_new_streak, 'base', v_base, 'bonus', v_bonus));

  IF NOT (v_result->>'success')::BOOLEAN THEN RETURN v_result; END IF;

  INSERT INTO daily_checkins (user_id, checkin_date, gems_earned, bonus_gems, current_streak, transaction_id)
  VALUES (p_user_id, v_today, v_base, v_bonus, v_new_streak, (v_result->>'transaction_id')::UUID)
  RETURNING id INTO v_checkin_id;

  UPDATE checkin_streaks SET current_streak = v_new_streak, last_checkin_date = v_today,
    longest_streak = GREATEST(longest_streak, v_new_streak), total_checkins = total_checkins + 1,
    total_gems_from_checkins = total_gems_from_checkins + v_total, updated_at = NOW()
  WHERE user_id = p_user_id;

  RETURN jsonb_build_object('success', true, 'checkin_id', v_checkin_id, 'gems_earned', v_total,
    'base_gems', v_base, 'bonus_gems', v_bonus, 'current_streak', v_new_streak,
    'new_balance', (v_result->>'new_balance')::INTEGER,
    'message', CASE WHEN v_bonus > 0 THEN 'Bonus ' || v_bonus || ' gems!' ELSE 'Điểm danh thành công!' END);
END;
$$;

-- STEP 8: Create get_checkin_status function
CREATE OR REPLACE FUNCTION get_checkin_status(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_today DATE := CURRENT_DATE;
  v_yesterday DATE := CURRENT_DATE - 1;
  v_checked BOOLEAN;
  v_streak INTEGER;
  v_longest INTEGER;
  v_total INTEGER;
  v_gems INTEGER;
  v_last DATE;
BEGIN
  SELECT EXISTS(SELECT 1 FROM daily_checkins WHERE user_id = p_user_id AND checkin_date = v_today) INTO v_checked;

  SELECT COALESCE(current_streak, 0), COALESCE(longest_streak, 0), COALESCE(total_checkins, 0),
         COALESCE(total_gems_from_checkins, 0), last_checkin_date
  INTO v_streak, v_longest, v_total, v_gems, v_last
  FROM checkin_streaks WHERE user_id = p_user_id;

  IF v_last IS NOT NULL AND v_last < v_yesterday THEN v_streak := 0; END IF;

  RETURN jsonb_build_object(
    'checked_today', COALESCE(v_checked, false),
    'current_streak', COALESCE(v_streak, 0),
    'longest_streak', COALESCE(v_longest, 0),
    'total_checkins', COALESCE(v_total, 0),
    'total_gems', COALESCE(v_gems, 0)
  );
END;
$$;

-- STEP 9: Grant permissions
GRANT EXECUTE ON FUNCTION grant_gems TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION get_gem_balance TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION perform_daily_checkin TO authenticated;
GRANT EXECUTE ON FUNCTION get_checkin_status TO authenticated;

SELECT 'Gem Economy V2 fix completed!' as status;
