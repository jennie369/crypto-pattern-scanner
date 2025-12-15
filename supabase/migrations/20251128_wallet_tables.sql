-- =====================================================
-- WALLET TABLES - user_wallets & wallet_transactions
-- Date: 2025-11-28
-- Description: Virtual currency system for Gems/Diamonds
-- Used by: walletService.js, BuyGemsScreen.js
-- =====================================================

-- =====================================================
-- 1. USER_WALLETS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS user_wallets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,

  -- Balances
  gem_balance INT DEFAULT 0 CHECK (gem_balance >= 0),
  diamond_balance INT DEFAULT 0 CHECK (diamond_balance >= 0),

  -- Lifetime tracking
  total_earned INT DEFAULT 0,
  total_spent INT DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_wallets_user ON user_wallets(user_id);

-- Enable RLS
ALTER TABLE user_wallets ENABLE ROW LEVEL SECURITY;

-- Users can view and update their own wallet
DROP POLICY IF EXISTS "Users can view own wallet" ON user_wallets;
CREATE POLICY "Users can view own wallet"
  ON user_wallets FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own wallet" ON user_wallets;
CREATE POLICY "Users can insert own wallet"
  ON user_wallets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own wallet" ON user_wallets;
CREATE POLICY "Users can update own wallet"
  ON user_wallets FOR UPDATE
  USING (auth.uid() = user_id);

-- Service role full access
DROP POLICY IF EXISTS "Service role full access wallets" ON user_wallets;
CREATE POLICY "Service role full access wallets"
  ON user_wallets FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- =====================================================
-- 2. WALLET_TRANSACTIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS wallet_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_id UUID NOT NULL REFERENCES user_wallets(id) ON DELETE CASCADE,

  -- Transaction type
  type TEXT NOT NULL CHECK (type IN (
    'purchase',      -- Bought gems with money
    'gift_sent',     -- Sent gift to someone
    'gift_received', -- Received gift
    'bonus',         -- Admin bonus
    'refund',        -- Refund
    'reward',        -- Achievement reward
    'boost',         -- Post boost
    'tip'            -- Tipped creator
  )),

  -- Currency and amount
  currency TEXT DEFAULT 'gem' CHECK (currency IN ('gem', 'diamond')),
  amount INT NOT NULL, -- Positive for additions, negative for deductions

  -- Description
  description TEXT,

  -- Reference to related entity
  reference_id TEXT,
  reference_type TEXT, -- 'currency_package', 'gift', 'post', etc.

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_wallet ON wallet_transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_type ON wallet_transactions(type);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_created ON wallet_transactions(created_at DESC);

-- Enable RLS
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;

-- Users can view their own transactions (via wallet)
DROP POLICY IF EXISTS "Users can view own transactions" ON wallet_transactions;
CREATE POLICY "Users can view own transactions"
  ON wallet_transactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_wallets
      WHERE user_wallets.id = wallet_transactions.wallet_id
      AND user_wallets.user_id = auth.uid()
    )
  );

-- Service role full access
DROP POLICY IF EXISTS "Service role full access transactions" ON wallet_transactions;
CREATE POLICY "Service role full access transactions"
  ON wallet_transactions FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- =====================================================
-- 3. CURRENCY_PACKAGES TABLE (if not exists)
-- =====================================================
CREATE TABLE IF NOT EXISTS currency_packages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  gem_amount INT NOT NULL CHECK (gem_amount > 0),
  price_vnd INT NOT NULL CHECK (price_vnd > 0),
  bonus_gems INT DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns if table already exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'currency_packages' AND column_name = 'description') THEN
    ALTER TABLE currency_packages ADD COLUMN description TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'currency_packages' AND column_name = 'sort_order') THEN
    ALTER TABLE currency_packages ADD COLUMN sort_order INT DEFAULT 0;
  END IF;
END $$;

-- Enable RLS
ALTER TABLE currency_packages ENABLE ROW LEVEL SECURITY;

-- Anyone can view active packages
DROP POLICY IF EXISTS "Anyone can view active packages" ON currency_packages;
CREATE POLICY "Anyone can view active packages"
  ON currency_packages FOR SELECT
  USING (is_active = true);

-- =====================================================
-- 4. SEED CURRENCY PACKAGES (only basic columns)
-- =====================================================
INSERT INTO currency_packages (name, gem_amount, price_vnd, bonus_gems, is_featured, is_active)
VALUES
  ('Starter Pack', 100, 22000, 0, FALSE, TRUE),
  ('Popular Pack', 500, 99000, 50, TRUE, TRUE),
  ('Pro Pack', 1000, 189000, 150, FALSE, TRUE),
  ('VIP Pack', 5000, 890000, 1000, FALSE, TRUE)
ON CONFLICT DO NOTHING;

-- =====================================================
-- 5. TRIGGER: Auto-update updated_at
-- =====================================================
CREATE OR REPLACE FUNCTION update_user_wallets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_user_wallets ON user_wallets;
CREATE TRIGGER trigger_update_user_wallets
  BEFORE UPDATE ON user_wallets
  FOR EACH ROW
  EXECUTE FUNCTION update_user_wallets_updated_at();

-- =====================================================
-- 6. FUNCTION: Auto-create wallet for new users
-- =====================================================
CREATE OR REPLACE FUNCTION create_wallet_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_wallets (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on profiles table (created when user signs up)
DROP TRIGGER IF EXISTS trigger_create_wallet_on_profile ON profiles;
CREATE TRIGGER trigger_create_wallet_on_profile
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_wallet_for_new_user();

-- =====================================================
-- 7. VERIFICATION
-- =====================================================
SELECT 'user_wallets' as table_name,
  CASE WHEN EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name='user_wallets')
       THEN 'OK' ELSE 'MISSING' END as status
UNION ALL
SELECT 'wallet_transactions',
  CASE WHEN EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name='wallet_transactions')
       THEN 'OK' ELSE 'MISSING' END
UNION ALL
SELECT 'currency_packages',
  CASE WHEN EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name='currency_packages')
       THEN 'OK' ELSE 'MISSING' END
UNION ALL
SELECT 'currency_packages_count',
  (SELECT COUNT(*)::TEXT FROM currency_packages WHERE is_active = true);
