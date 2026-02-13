-- =====================================================
-- GEM ECONOMY - COMPLETE DATABASE MIGRATION
-- Version: 3.0 - Production Ready
-- Date: December 9, 2025
-- Rate: 100 VND/gem
-- =====================================================

-- =====================================================
-- MIGRATION 1: GEM_PACKS TABLE
-- Lưu trữ thông tin Gem Pack products từ Shopify
-- =====================================================

CREATE TABLE IF NOT EXISTS gem_packs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Basic info
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,

  -- Gem quantities
  gems_quantity INTEGER NOT NULL,
  bonus_gems INTEGER DEFAULT 0,
  total_gems INTEGER GENERATED ALWAYS AS (gems_quantity + bonus_gems) STORED,

  -- Pricing (VND)
  price INTEGER NOT NULL,
  compare_at_price INTEGER,

  -- Shopify mapping
  shopify_product_id VARCHAR(50) UNIQUE,
  shopify_variant_id VARCHAR(50) UNIQUE,
  shopify_handle VARCHAR(255),
  sku VARCHAR(50),

  -- Display
  badge_text VARCHAR(50),
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_gem_packs_active ON gem_packs(is_active);
CREATE INDEX IF NOT EXISTS idx_gem_packs_display_order ON gem_packs(display_order);
CREATE INDEX IF NOT EXISTS idx_gem_packs_shopify_product ON gem_packs(shopify_product_id);
CREATE INDEX IF NOT EXISTS idx_gem_packs_shopify_variant ON gem_packs(shopify_variant_id);

-- RLS
ALTER TABLE gem_packs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Anyone can view active gem packs" ON gem_packs;
DROP POLICY IF EXISTS "Admins can manage gem packs" ON gem_packs;

-- Public read access
CREATE POLICY "Anyone can view active gem packs"
  ON gem_packs FOR SELECT
  USING (is_active = true);

-- Admin write access
CREATE POLICY "Admins can manage gem packs"
  ON gem_packs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND (is_admin = true OR role = 'admin')
    )
  );

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_gem_packs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS gem_packs_updated_at ON gem_packs;
CREATE TRIGGER gem_packs_updated_at
  BEFORE UPDATE ON gem_packs
  FOR EACH ROW
  EXECUTE FUNCTION update_gem_packs_updated_at();

-- =====================================================
-- SEED DATA: Production Gem Packs
-- =====================================================

INSERT INTO gem_packs (
  name, slug, description,
  gems_quantity, bonus_gems, price,
  shopify_product_id, shopify_variant_id, shopify_handle, sku,
  badge_text, is_featured, display_order
) VALUES
(
  'Gem Pack - Starter',
  'gem-pack-starter',
  'Gói khởi đầu cho người mới - 100 Gems',
  100, 0, 22000,
  '8895260786865', '46427897102513', 'gem-pack-starter-100-gems', 'gem-pack-100',
  NULL, false, 1
),
(
  'Gem Pack - Popular',
  'gem-pack-popular',
  'Gói phổ biến nhất - 500 Gems + 50 Bonus',
  500, 50, 99000,
  '8895261343921', '46427898544305', 'gem-pack-popular-500-50-bonus-gems', 'gem-pack-500',
  'Phổ biến', true, 2
),
(
  'Gem Pack - Pro',
  'gem-pack-pro',
  'Gói chuyên nghiệp - 1000 Gems + 150 Bonus',
  1000, 150, 189000,
  '8895261507761', '46427898871985', 'gem-pack-pro-1000-150-bonus-gems', NULL,
  'Tiết kiệm 15%', false, 3
),
(
  'Gem Pack - VIP',
  'gem-pack-vip',
  'Gói VIP cao cấp nhất - 5000 Gems + 1000 Bonus',
  5000, 1000, 890000,
  '8895261933745', '46427899789489', 'gem-pack-vip-5000-1000-bonus-gems', NULL,
  'Best Value', true, 4
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  gems_quantity = EXCLUDED.gems_quantity,
  bonus_gems = EXCLUDED.bonus_gems,
  price = EXCLUDED.price,
  shopify_product_id = EXCLUDED.shopify_product_id,
  shopify_variant_id = EXCLUDED.shopify_variant_id,
  shopify_handle = EXCLUDED.shopify_handle,
  sku = EXCLUDED.sku,
  badge_text = EXCLUDED.badge_text,
  is_featured = EXCLUDED.is_featured,
  display_order = EXCLUDED.display_order,
  updated_at = NOW();


-- =====================================================
-- MIGRATION 2: DAILY_CHECKINS TABLE
-- Tracking daily check-in và streak
-- =====================================================

CREATE TABLE IF NOT EXISTS daily_checkins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Check-in date (chỉ date, không time)
  checkin_date DATE NOT NULL,

  -- Gems earned
  gems_earned INTEGER NOT NULL DEFAULT 5,
  bonus_gems INTEGER DEFAULT 0,

  -- Streak info tại thời điểm check-in
  current_streak INTEGER DEFAULT 1,

  -- Transaction reference
  transaction_id UUID,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Unique constraint: 1 check-in/user/day
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
-- MIGRATION 3: CHECKIN_STREAKS TABLE
-- Tracking current và longest streak cho daily checkin
-- (Separate from user_streaks which tracks affirmations)
-- =====================================================

CREATE TABLE IF NOT EXISTS checkin_streaks (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Current streak
  current_streak INTEGER DEFAULT 0,
  last_checkin_date DATE,

  -- Best records
  longest_streak INTEGER DEFAULT 0,

  -- Total stats
  total_checkins INTEGER DEFAULT 0,
  total_gems_from_checkins INTEGER DEFAULT 0,

  -- Timestamps
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

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_checkin_streaks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS checkin_streaks_updated_at ON checkin_streaks;
CREATE TRIGGER checkin_streaks_updated_at
  BEFORE UPDATE ON checkin_streaks
  FOR EACH ROW
  EXECUTE FUNCTION update_checkin_streaks_updated_at();


-- =====================================================
-- MIGRATION 4: PENDING_GEM_CREDITS TABLE
-- Gems chờ claim khi email không khớp
-- =====================================================

CREATE TABLE IF NOT EXISTS pending_gem_credits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Order info
  email VARCHAR(255) NOT NULL,
  order_id VARCHAR(50) NOT NULL,
  order_number VARCHAR(50),

  -- Gems
  gems_amount INTEGER NOT NULL,
  pack_name VARCHAR(100),

  -- Status: pending, claimed, expired, refunded
  status VARCHAR(20) DEFAULT 'pending',

  -- Claim info
  claimed_by UUID REFERENCES auth.users(id),
  claimed_at TIMESTAMPTZ,

  -- Expiry
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '90 days'),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_pending_credits_email ON pending_gem_credits(email);
CREATE INDEX IF NOT EXISTS idx_pending_credits_status ON pending_gem_credits(status);
CREATE INDEX IF NOT EXISTS idx_pending_credits_order ON pending_gem_credits(order_id);

-- RLS
ALTER TABLE pending_gem_credits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view matching credits" ON pending_gem_credits;
DROP POLICY IF EXISTS "Service can insert credits" ON pending_gem_credits;
DROP POLICY IF EXISTS "Users can claim matching credits" ON pending_gem_credits;

-- Users can view credits matching their email or linked_emails
CREATE POLICY "Users can view matching credits"
  ON pending_gem_credits FOR SELECT
  USING (
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
    OR claimed_by = auth.uid()
    OR email = ANY(
      SELECT unnest(COALESCE(linked_emails, '{}')) FROM profiles WHERE id = auth.uid()
    )
  );

-- Service role can insert
CREATE POLICY "Service can insert credits"
  ON pending_gem_credits FOR INSERT
  WITH CHECK (true);

-- Users can claim matching credits
CREATE POLICY "Users can claim matching credits"
  ON pending_gem_credits FOR UPDATE
  USING (
    (email = (SELECT email FROM auth.users WHERE id = auth.uid())
    OR email = ANY(
      SELECT unnest(COALESCE(linked_emails, '{}')) FROM profiles WHERE id = auth.uid()
    ))
    AND status = 'pending'
  );


-- =====================================================
-- MIGRATION 5: GEM_PURCHASE_ORDERS TABLE
-- Tracking purchase orders từ initiate đến complete
-- =====================================================

CREATE TABLE IF NOT EXISTS gem_purchase_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- User info
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Pack info
  pack_id UUID REFERENCES gem_packs(id),
  pack_slug VARCHAR(100),
  gems_expected INTEGER NOT NULL,

  -- Shopify info
  shopify_checkout_url TEXT,
  shopify_order_id VARCHAR(50),
  shopify_order_number VARCHAR(50),

  -- Status: initiated, checkout, pending, paid, completed, failed, cancelled
  status VARCHAR(20) DEFAULT 'initiated',

  -- Balance tracking
  balance_before INTEGER,
  balance_after INTEGER,

  -- Error handling
  error_message TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_purchase_orders_user ON gem_purchase_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_status ON gem_purchase_orders(status);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_shopify ON gem_purchase_orders(shopify_order_id);

-- RLS
ALTER TABLE gem_purchase_orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own purchase orders" ON gem_purchase_orders;
DROP POLICY IF EXISTS "Users can insert own purchase orders" ON gem_purchase_orders;
DROP POLICY IF EXISTS "Users can update own purchase orders" ON gem_purchase_orders;

CREATE POLICY "Users can view own purchase orders"
  ON gem_purchase_orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own purchase orders"
  ON gem_purchase_orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own purchase orders"
  ON gem_purchase_orders FOR UPDATE
  USING (auth.uid() = user_id);


-- =====================================================
-- MIGRATION 6: UPDATE PROFILES TABLE
-- Thêm linked_emails và welcome_bonus_claimed
-- =====================================================

-- Add linked_emails column for email matching
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS linked_emails TEXT[] DEFAULT '{}';

-- Add welcome_bonus_claimed
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS welcome_bonus_claimed BOOLEAN DEFAULT false;

-- Add welcome_bonus_claimed_at
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS welcome_bonus_claimed_at TIMESTAMPTZ;

-- Index for email matching
CREATE INDEX IF NOT EXISTS idx_profiles_linked_emails
  ON profiles USING GIN(linked_emails);


-- =====================================================
-- MIGRATION 7: UPDATE WALLET_TRANSACTIONS TABLE
-- Thêm balance tracking và transaction types mới
-- =====================================================

-- Add balance_before column
ALTER TABLE wallet_transactions
ADD COLUMN IF NOT EXISTS balance_before INTEGER;

-- Add balance_after column
ALTER TABLE wallet_transactions
ADD COLUMN IF NOT EXISTS balance_after INTEGER;

-- Add metadata column
ALTER TABLE wallet_transactions
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';


-- =====================================================
-- MIGRATION 8: RPC FUNCTIONS
-- Core business logic functions
-- =====================================================

-- =====================================================
-- FUNCTION: grant_gems
-- Cộng gems vào wallet với transaction logging
-- =====================================================
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

  -- Return result
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

-- =====================================================
-- FUNCTION: get_gem_balance
-- Lấy balance hiện tại của user
-- =====================================================
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

-- =====================================================
-- FUNCTION: perform_daily_checkin
-- Thực hiện daily check-in và cộng gems
-- =====================================================
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
    -- First time check-in
    INSERT INTO checkin_streaks (user_id, current_streak, last_checkin_date, total_checkins)
    VALUES (p_user_id, 0, NULL, 0);
    v_current_streak := 0;
    v_last_checkin_date := NULL;
  END IF;

  -- Calculate new streak
  IF v_last_checkin_date = v_yesterday THEN
    -- Consecutive day
    v_new_streak := v_current_streak + 1;
  ELSE
    -- Streak broken or first checkin
    v_new_streak := 1;
  END IF;

  -- Calculate bonus gems
  IF v_new_streak = 7 THEN
    v_bonus_gems := 20; -- 7-day streak bonus
  ELSIF v_new_streak = 30 THEN
    v_bonus_gems := 100; -- 30-day streak bonus
  ELSIF v_new_streak > 7 AND v_new_streak % 7 = 0 THEN
    v_bonus_gems := 10; -- Weekly bonus after first week
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

  -- Return success
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

-- =====================================================
-- FUNCTION: get_checkin_status
-- Lấy trạng thái check-in của user
-- =====================================================
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

  -- Default values if no record
  IF v_current_streak IS NULL THEN
    v_current_streak := 0;
    v_longest_streak := 0;
    v_total_checkins := 0;
    v_total_gems := 0;
  END IF;

  -- Check if streak is still active (checked yesterday or today)
  IF v_last_checkin IS NOT NULL AND v_last_checkin < v_yesterday THEN
    v_current_streak := 0; -- Streak broken
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
    -- Next weekly bonus
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
-- FUNCTION: claim_welcome_bonus
-- Claim welcome bonus 50 gems
-- =====================================================
CREATE OR REPLACE FUNCTION claim_welcome_bonus(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_already_claimed BOOLEAN;
  v_grant_result JSONB;
BEGIN
  -- Check if already claimed
  SELECT COALESCE(welcome_bonus_claimed, false) INTO v_already_claimed
  FROM profiles
  WHERE id = p_user_id;

  IF v_already_claimed THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'already_claimed',
      'message', 'Bạn đã nhận welcome bonus rồi'
    );
  END IF;

  -- Grant 50 gems
  v_grant_result := grant_gems(
    p_user_id,
    50,
    'welcome_bonus',
    'Welcome Bonus cho thành viên mới',
    NULL,
    'welcome_bonus',
    jsonb_build_object('type', 'welcome_bonus')
  );

  IF NOT (v_grant_result->>'success')::BOOLEAN THEN
    RETURN v_grant_result;
  END IF;

  -- Mark as claimed
  UPDATE profiles
  SET
    welcome_bonus_claimed = true,
    welcome_bonus_claimed_at = NOW()
  WHERE id = p_user_id;

  RETURN jsonb_build_object(
    'success', true,
    'gems_earned', 50,
    'new_balance', (v_grant_result->>'new_balance')::INTEGER,
    'message', 'Chúc mừng! Bạn nhận được 50 Gems welcome bonus!'
  );
END;
$$;

-- =====================================================
-- FUNCTION: claim_pending_gem_credits
-- Claim tất cả pending gem credits cho user
-- =====================================================
CREATE OR REPLACE FUNCTION claim_pending_gem_credits(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_email TEXT;
  v_linked_emails TEXT[];
  v_all_emails TEXT[];
  v_total_gems INTEGER := 0;
  v_claim_count INTEGER := 0;
  v_credit RECORD;
  v_grant_result JSONB;
BEGIN
  -- Get user email and linked emails
  SELECT
    (SELECT email FROM auth.users WHERE id = p_user_id),
    COALESCE(linked_emails, '{}')
  INTO v_user_email, v_linked_emails
  FROM profiles
  WHERE id = p_user_id;

  -- Combine all emails
  v_all_emails := array_append(v_linked_emails, v_user_email);

  -- Loop through pending credits
  FOR v_credit IN
    SELECT id, gems_amount, pack_name
    FROM pending_gem_credits
    WHERE email = ANY(v_all_emails)
    AND status = 'pending'
    AND expires_at > NOW()
    ORDER BY created_at
  LOOP
    -- Grant gems
    v_grant_result := grant_gems(
      p_user_id,
      v_credit.gems_amount,
      'pending_credit_claim',
      'Claim pending credit: ' || COALESCE(v_credit.pack_name, 'Gem Pack'),
      v_credit.id::TEXT,
      'pending_gem_credit',
      jsonb_build_object('credit_id', v_credit.id)
    );

    IF (v_grant_result->>'success')::BOOLEAN THEN
      -- Mark as claimed
      UPDATE pending_gem_credits
      SET
        status = 'claimed',
        claimed_by = p_user_id,
        claimed_at = NOW(),
        updated_at = NOW()
      WHERE id = v_credit.id;

      v_total_gems := v_total_gems + v_credit.gems_amount;
      v_claim_count := v_claim_count + 1;
    END IF;
  END LOOP;

  IF v_claim_count = 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'no_pending_credits',
      'message', 'Không có pending credits nào để claim'
    );
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'total_gems', v_total_gems,
    'credits_claimed', v_claim_count,
    'new_balance', (v_grant_result->>'new_balance')::INTEGER,
    'message', 'Đã claim ' || v_claim_count || ' pending credits (' || v_total_gems || ' gems)'
  );
END;
$$;


-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

GRANT EXECUTE ON FUNCTION grant_gems TO authenticated;
GRANT EXECUTE ON FUNCTION grant_gems TO service_role;
GRANT EXECUTE ON FUNCTION get_gem_balance TO authenticated;
GRANT EXECUTE ON FUNCTION get_gem_balance TO service_role;
GRANT EXECUTE ON FUNCTION perform_daily_checkin TO authenticated;
GRANT EXECUTE ON FUNCTION get_checkin_status TO authenticated;
GRANT EXECUTE ON FUNCTION claim_welcome_bonus TO authenticated;
GRANT EXECUTE ON FUNCTION claim_pending_gem_credits TO authenticated;
