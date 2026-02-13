-- =====================================================
-- MIGRATION: Unify Gem Balance to profiles.gems
-- Date: 2025-12-11
-- Purpose: Consolidate gem balance from user_wallets to profiles
--          to fix data inconsistency issues
-- =====================================================

-- =====================================================
-- STEP 1: Add gems column to profiles if not exists
-- =====================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'gems'
  ) THEN
    ALTER TABLE profiles ADD COLUMN gems INT DEFAULT 0;
    RAISE NOTICE 'Added gems column to profiles';
  ELSE
    RAISE NOTICE 'gems column already exists in profiles';
  END IF;
END $$;

-- =====================================================
-- STEP 2: Sync existing data from user_wallets to profiles
-- Take the HIGHER value between the two sources
-- =====================================================
UPDATE profiles p
SET gems = GREATEST(
  COALESCE(p.gems, 0),
  COALESCE((SELECT gem_balance FROM user_wallets WHERE user_id = p.id), 0)
)
WHERE EXISTS (SELECT 1 FROM user_wallets WHERE user_id = p.id);

-- =====================================================
-- STEP 3: Create/Replace RPC function get_gem_balance
-- This is the SINGLE source of truth for gem balance
-- =====================================================
CREATE OR REPLACE FUNCTION get_gem_balance(p_user_id UUID)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_balance INT;
BEGIN
  SELECT COALESCE(gems, 0) INTO v_balance
  FROM profiles
  WHERE id = p_user_id;

  RETURN COALESCE(v_balance, 0);
END;
$$;

-- =====================================================
-- STEP 4: Create function to add gems (for webhook and services)
-- This updates profiles.gems as the single source
-- =====================================================
CREATE OR REPLACE FUNCTION add_gems(
  p_user_id UUID,
  p_amount INT,
  p_description TEXT DEFAULT NULL,
  p_reference_type TEXT DEFAULT NULL,
  p_reference_id TEXT DEFAULT NULL
)
RETURNS TABLE(success BOOLEAN, new_balance INT, error_message TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_balance INT;
  v_new_balance INT;
BEGIN
  -- Get current balance
  SELECT COALESCE(gems, 0) INTO v_current_balance
  FROM profiles
  WHERE id = p_user_id;

  IF v_current_balance IS NULL THEN
    RETURN QUERY SELECT FALSE, 0, 'User not found'::TEXT;
    RETURN;
  END IF;

  v_new_balance := v_current_balance + p_amount;

  -- Update profiles.gems
  UPDATE profiles
  SET gems = v_new_balance,
      updated_at = NOW()
  WHERE id = p_user_id;

  -- Also sync to user_wallets for backwards compatibility
  UPDATE user_wallets
  SET gem_balance = v_new_balance,
      total_earned = CASE WHEN p_amount > 0 THEN total_earned + p_amount ELSE total_earned END,
      total_spent = CASE WHEN p_amount < 0 THEN total_spent + ABS(p_amount) ELSE total_spent END,
      updated_at = NOW()
  WHERE user_id = p_user_id;

  -- Log transaction to gems_transactions
  INSERT INTO gems_transactions (
    user_id,
    type,
    amount,
    description,
    reference_type,
    reference_id,
    balance_before,
    balance_after,
    created_at
  ) VALUES (
    p_user_id,
    CASE WHEN p_amount > 0 THEN 'credit' ELSE 'debit' END,
    ABS(p_amount),
    COALESCE(p_description, CASE WHEN p_amount > 0 THEN 'Gems added' ELSE 'Gems spent' END),
    p_reference_type,
    p_reference_id,
    v_current_balance,
    v_new_balance,
    NOW()
  );

  RETURN QUERY SELECT TRUE, v_new_balance, NULL::TEXT;
END;
$$;

-- =====================================================
-- STEP 5: Create function to spend gems
-- =====================================================
CREATE OR REPLACE FUNCTION spend_gems(
  p_user_id UUID,
  p_amount INT,
  p_description TEXT DEFAULT NULL,
  p_reference_type TEXT DEFAULT NULL,
  p_reference_id TEXT DEFAULT NULL
)
RETURNS TABLE(success BOOLEAN, new_balance INT, error_message TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_balance INT;
BEGIN
  -- Get current balance
  SELECT COALESCE(gems, 0) INTO v_current_balance
  FROM profiles
  WHERE id = p_user_id;

  IF v_current_balance IS NULL THEN
    RETURN QUERY SELECT FALSE, 0, 'User not found'::TEXT;
    RETURN;
  END IF;

  IF v_current_balance < p_amount THEN
    RETURN QUERY SELECT FALSE, v_current_balance, 'Insufficient balance'::TEXT;
    RETURN;
  END IF;

  -- Use add_gems with negative amount
  RETURN QUERY SELECT * FROM add_gems(
    p_user_id,
    -p_amount,
    COALESCE(p_description, 'Gems spent'),
    p_reference_type,
    p_reference_id
  );
END;
$$;

-- =====================================================
-- STEP 6: Create trigger to sync profiles.gems to user_wallets
-- When profiles.gems changes, sync to user_wallets
-- =====================================================
CREATE OR REPLACE FUNCTION sync_gems_to_wallet()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only sync if gems changed
  IF NEW.gems IS DISTINCT FROM OLD.gems THEN
    UPDATE user_wallets
    SET gem_balance = NEW.gems,
        updated_at = NOW()
    WHERE user_id = NEW.id;

    -- If no wallet exists, create one
    IF NOT FOUND THEN
      INSERT INTO user_wallets (user_id, gem_balance, diamond_balance, total_earned, total_spent)
      VALUES (NEW.id, NEW.gems, 0, GREATEST(NEW.gems, 0), 0)
      ON CONFLICT (user_id) DO UPDATE SET gem_balance = EXCLUDED.gem_balance;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS trg_sync_gems_to_wallet ON profiles;

-- Create trigger
CREATE TRIGGER trg_sync_gems_to_wallet
AFTER UPDATE OF gems ON profiles
FOR EACH ROW
EXECUTE FUNCTION sync_gems_to_wallet();

-- =====================================================
-- STEP 7: Create gems_transactions table if not exists
-- This is the unified transaction log
-- =====================================================
CREATE TABLE IF NOT EXISTS gems_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'credit', 'debit', 'purchase', 'gift_sent', 'gift_received', 'bonus', 'withdrawal', 'checkin'
  amount INT NOT NULL,
  description TEXT,
  reference_type TEXT, -- 'shopify_order', 'gift', 'boost', 'checkin', etc.
  reference_id TEXT,
  balance_before INT,
  balance_after INT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_gems_transactions_user_id ON gems_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_gems_transactions_type ON gems_transactions(type);
CREATE INDEX IF NOT EXISTS idx_gems_transactions_created_at ON gems_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_gems_transactions_reference ON gems_transactions(reference_type, reference_id);

-- =====================================================
-- STEP 8: Grant permissions
-- =====================================================
GRANT EXECUTE ON FUNCTION get_gem_balance(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION add_gems(UUID, INT, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION spend_gems(UUID, INT, TEXT, TEXT, TEXT) TO authenticated;

-- =====================================================
-- STEP 9: Add RLS policies for gems_transactions
-- =====================================================
ALTER TABLE gems_transactions ENABLE ROW LEVEL SECURITY;

-- Users can view their own transactions
DROP POLICY IF EXISTS "Users can view own gem transactions" ON gems_transactions;
CREATE POLICY "Users can view own gem transactions"
  ON gems_transactions FOR SELECT
  USING (auth.uid() = user_id);

-- System can insert transactions (via functions)
DROP POLICY IF EXISTS "System can insert gem transactions" ON gems_transactions;
CREATE POLICY "System can insert gem transactions"
  ON gems_transactions FOR INSERT
  WITH CHECK (TRUE);

-- =====================================================
-- SUMMARY OF CHANGES:
-- =====================================================
-- 1. profiles.gems is now the SINGLE SOURCE OF TRUTH
-- 2. user_wallets.gem_balance is kept in sync via trigger
-- 3. gems_transactions is the unified transaction log
-- 4. RPC functions: get_gem_balance, add_gems, spend_gems
-- 5. All services should use get_gem_balance() or profiles.gems
-- =====================================================

COMMENT ON COLUMN profiles.gems IS 'PRIMARY gem balance - single source of truth. Synced to user_wallets via trigger.';
COMMENT ON TABLE gems_transactions IS 'Unified gem transaction log. Used by Shopify webhook and all services.';
